# Berk/assay-0.6b

## Resumen

assay-0.6b es un modelo de decisión calibrada desarrollado por el usuario Berk, publicado en HuggingFace bajo licencia Apache 2.0. No es un generador de texto: recibe un estado (por ejemplo, el texto de un ticket o un pasaje) y una o varias preguntas tipadas con nombre (sí/no, elección entre 2 y 255 opciones descritas, o puntuación sobre 2 a 10 niveles ordenados) y devuelve una distribución de probabilidad por pregunta, junto con una confianza y una puntuación de evidencia. La innovación principal es que la respuesta se lee directamente de los logits del siguiente token sobre los tokens de las etiquetas de opción en una única posición de decisión, de modo que ninguna salida puede quedar fuera del esquema definido.

Técnicamente es un ajuste LoRA (r=16, alpha=32, lr=5e-05, una época, batch 8 con acumulación 1) sobre el backbone Qwen/Qwen3-0.6B-Base, con pesos fusionados publicados en safetensors y el adaptador en el subdirectorio `adapter/`. El modelo total tiene 596.049.920 parámetros (unos 0,6 B) y el repositorio ocupa 1,2 GB. Incorpora una cabeza de evidencia lineal entrenada sobre negativos con pasajes intercambiados y un escalado global de temperatura de 1,199 ajustado en el split de calibración.

Su relevancia práctica está en sustituir llamadas a un LLM generativo por un clasificador de 0,6 B cuando el problema es tomar decisiones acotadas (enrutar, autorizar, priorizar, etiquetar) con probabilidades calibradas y umbrales conformales de abstención. Frente a un clasificador zero-shot clásico, aporta salidas tipadas, varias preguntas sobre un mismo estado en un solo forward pass y métricas explícitas de calibración (ECE, Brier, errores confiados) publicadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA fusionado y cabeza de evidencia lineal adicional |
| Parametros totales | 596.049.920 (0,6 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el backbone Qwen3-0.6B-Base soporta 32 768 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (solo ingles; los datos de entrenamiento son en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados compatibles con transformers) y adaptador LoRA en `adapter/` |
| Modelo base | Qwen/Qwen3-0.6B-Base |
| Tarea declarada | text-classification (decisiones tipadas zero-shot) |
| Tipos de pregunta | bool, choice (2 a 255 opciones), score (2 a 10 niveles ordenados) |
| Tamano del repositorio | 1,2 GB |
| Temperatura de calibracion | 1,199 (global, ajustada en el split de calibracion) |
| Artefactos auxiliares | `assay_head.safetensors` (cabeza de evidencia), `conformal.json` (umbrales de abtencion) |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only, al que se le aplica un ajuste LoRA con r=16, alpha=32, learning rate 5e-05, una época y batch de 8 con una iteración de acumulación. Los pesos fusionados resultantes se cargan con transformers como cualquier checkpoint de Qwen. La decisión no se genera token a token: se lee la distribución sobre los logits del siguiente token correspondientes a los tokens de etiqueta de cada opción en una única posición de decisión, de modo que la competencia zero-shot del modelo base es el punto de partida. Las preguntas se implementan como ramas aisladas sobre un estado compartido mediante una máscara de atención por bloques con posiciones reiniciadas, de forma que una petición empaquetada y varias peticiones separadas producen resultados idénticos.

El entrenamiento usa entropía cruzada contra objetivos suaves: distribuciones de etiquetas humanas cuando la fuente las proporciona, niveles suavizados con SORD para preguntas ordinales y one-hot en el resto de casos. Las opciones de las preguntas de tipo choice se barajan en cada ejemplo. Adicionalmente, una cabeza de evidencia (una capa lineal sobre el token de decisión, almacenada en `assay_head.safetensors`) predice si el estado respalda la pregunta, entrenada con negativos de pasajes intercambiados. Sobre el conjunto de calibración se ajustó una temperatura global de 1,199 que se aplica sin cambios en el resto de dominios, y se calcularon umbrales conformales por tipo de pregunta (alpha 0,1, delta 0,05) en `conformal.json`, que el servidor devuelve como `act` y `set`.

## Capacidades

- Clasificación zero-shot con tipado estricto: preguntas booleanas (sí/no), de elección entre 2 y 255 opciones descritas y de puntuación sobre 2 a 10 niveles ordenados.
- Salida de distribución de probabilidad completa por pregunta, más una confianza agregada y una puntuación de evidencia sobre si el estado respalda la pregunta.
- Imposibilidad estructural de generar texto libre: al leer los logits de tokens de etiqueta, ninguna respuesta puede quedar fuera del esquema definido ni alucinar contenido.
- Múltiples preguntas sobre un mismo estado en un solo forward pass mediante máscara de atención por bloques; el modo empaquetado y el de peticiones separadas dan resultados idénticos.
- Abstención calibrada: umbrales conformales por tipo de pregunta que devuelven un conjunto de predicción con cobertura garantizada y un umbral de actuación (`act`) con tasa de error controlada.
- Soporte de batching eficiente: la latencia crece muy poco al empaquetar preguntas sobre un mismo estado.
- Capacidad de extracción de evidencia: la cabeza dedicada estima si el pasaje o estado aportado justifica la pregunta.
- No soporta tool calling, function calling, agentes, multi-step reasoning, visión, audio ni generación de texto.

## Casos de uso

- Triaje de tickets de soporte: con un único estado (el texto del ticket) se pueden lanzar preguntas como "¿el cliente pide devolución de dinero?" (bool) y "¿qué equipo debe gestionarlo?" (choice entre facturación y técnico), obteniendo probabilidades por rama y un umbral de derivación a humano cuando el modelo se abstiene. El ejemplo aparece literalmente en la model card.
- Enrutado de decisiones en agentes y pipelines: en lugar de invocar un LLM generativo para decidir el siguiente paso, se usa un modelo de 0,6 B que devuelve la opción elegida con probabilidad, con latencias de decenas de milisegundos y sin riesgo de salida fuera de formato.
- Moderación de contenido y análisis de toxicidad: preguntas booleanas y de elección sobre publicaciones (por ejemplo, si un tuit es ofensivo), aprovechando que el suite de transferencia incluye `tweet_offensive` con 0,713 de accuracy y ECE de 0,177.
- Verificación de afirmaciones en pipelines RAG: la cabeza de evidencia permite decidir si un pasaje recuperado respalda una afirmación antes de mostrarla al usuario, actuando como filtro barato previo a un modelo mayor.
- Priorización y scoring ordinal: las preguntas de tipo score (2 a 10 niveles ordenados, con suavizado SORD) permiten asignar severidad, urgencia o calidad con una distribución sobre niveles en lugar de una etiqueta dura.
- Automatización de encuestas y datos etiquetados: al aceptar distribuciones humanas como objetivo, el modelo puede usarse para propagar etiquetas anotadas a grandes volúmenes de texto con una noción explícita de incertidumbre.
- Clasificación zero-shot en dominios sin datos propios: los umbrales conformales se pueden recalibrar con `python -m assay.conformal` sobre datos etiquetados propios para obtener garantías de cobertura en la distribución concreta de producción.
- Filtrado previo en sistemas de decisión sensibles al coste: la tasa de errores confiados (p >= 0,9 e incorrectos) es del 1,9 % en tareas vistas y no vistas tras escalado, lo que permite fijar políticas de actuación automática frente a revisión manual.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Split | n | Accuracy | Brier | NLL | ECE | Errores confiados |
|---|---|---|---|---|---|---|
| Tareas vistas (dev), raw | 6113 | 0,705 | 0,395 | 0,761 | 0,057 | 0,030 |
| Tareas vistas (dev), escalado | 6113 | 0,705 | 0,391 | 0,744 | 0,030 | 0,019 |
| Tareas no vistas (holdout), raw | 2020 | 0,704 | 0,402 | 0,732 | 0,052 | 0,031 |
| Tareas no vistas (holdout), escalado | 2020 | 0,704 | 0,397 | 0,705 | 0,037 | 0,019 |
| kev transfer-v4 dev, raw | 764 | 0,636 | 0,517 | 0,912 | 0,157 | 0,077 |
| kev transfer-v4 dev, escalado | 764 | 0,636 | 0,499 | 0,851 | 0,124 | 0,045 |

El conjunto de tareas no vistas son once datasets nunca usados en entrenamiento: bbc_news, app_reviews, scitail, medical_questions_pairs, tweet_irony, ethos, stance_climate, dream, copa, truthful_qa y hh_rlhf. El suite kev transfer-v4 dev procede de jaredpalmer/kev-suites (mmlu, emotion, sciq, tweet_offensive, qnli, paws y holdouts de reglas sintéticas). El Brier reportado es la suma multiclase de errores al cuadrado (rango 0 a 2) y el ECE usa 15 bins.

Desglose por fuente del suite de transferencia:

| Fuente transfer-v4 | n | Accuracy | Brier | ECE |
|---|---|---|---|---|
| composition_held_and_or | 32 | 0,500 | 0,667 | 0,331 |
| composition_held_conditional | 32 | 0,625 | 0,616 | 0,348 |
| composition_held_or_not | 32 | 0,562 | 0,470 | 0,273 |
| contrastive_authorization | 40 | 0,500 | 0,837 | 0,450 |
| contrastive_deadline | 40 | 0,925 | 0,214 | 0,269 |
| emotion | 116 | 0,457 | 0,708 | 0,235 |
| mmlu | 116 | 0,457 | 0,636 | 0,168 |
| paws | 80 | 0,588 | 0,548 | 0,266 |
| qnli | 80 | 0,775 | 0,313 | 0,107 |
| sciq | 116 | 0,888 | 0,193 | 0,068 |
| tweet_offensive | 80 | 0,713 | 0,445 | 0,177 |

Comportamiento de la abstención conformal por tipo de pregunta:

| Split | Tipo | Cobertura | Tamano del conjunto | Tasa de actuación / error entre actuadas |
|---|---|---|---|---|
| Tareas no vistas | bool | 0,88 | 1,28 | 49 % / 14,8 % |
| Tareas no vistas | choice | 0,92 | 1,80 | 39 % / 5,6 % |
| Tareas no vistas | score | 0,77 | 2,37 | sin umbral |
| Suite de transferencia | bool | 0,74 | 1,17 | 68 % / 31,2 % |
| Suite de transferencia | choice | 0,87 | 1,91 | 36 % / 15,8 % |
| Suite de transferencia | score | 1,00 | 1,75 | sin umbral |

Latencia medida en una RTX 5090 en bf16 con transformers, comparando preguntas empaquetadas sobre un mismo estado frente a peticiones separadas:

| Preguntas | Empaquetado (ms) | Separado (ms) |
|---|---|---|
| 1 | 17,4 | 17,2 |
| 3 | 18,1 | 52,2 |
| 6 | 20,9 | 104,1 |
| 12 | 18,8 | 207,6 |
| 24 | 21,8 | 416,7 |

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,2 GB en bf16 (tamano del repositorio con pesos fusionados) y del orden de 2,4 GB en fp32. Son estimaciones a partir del numero de parametros; la model card no publica cifras de VRAM.
- Cuantizaciones: no se publican pesos GGUF, AWQ, GPTQ ni int8/int4 oficiales, por lo que no hay cifras de VRAM para esos formatos. Al ser un modelo de 0,6 B, una hipotetica cuantizacion a 8 bits rondaria los 0,6 GB y a 4 bits los 0,35 GB, pero son calculos teoricos no verificados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 a 4 GB de VRAM libre es suficiente en bf16. La medicion oficial de latencia se hizo en una RTX 5090. No hay datos publicados para A100, H100 o RTX 4090.
- Cabe sin problema en GPU de consumo: RTX 3060, 4060, 4070, 4080, 4090, 5090 y equivalentes, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: transformers como via principal (los pesos fusionados cargan como un checkpoint Qwen estandar). El repositorio esta etiquetado como compatible con text-embeddings-inference y con endpoints, lo que sugiere soporte en HuggingFace Inference Endpoints. El autor mantiene un servidor propio en `assay.server`. No hay documentacion publicada sobre vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: 17,4 ms para una pregunta sobre un estado y 21,8 ms para 24 preguntas empaquetadas en una RTX 5090 en bf16. En modo de peticiones separadas, 24 preguntas cuestan 416,7 ms, unas 19 veces mas, lo que hace del empaquetado la opcion clara para produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| assay-0.6b | 0,6 B | Clasificador de decisiones tipadas con calibracion conformal | no especificado (backbone de 32 768 tokens) | Apache 2.0 | 0,705 de accuracy en tareas vistas y no vistas; ECE 0,030 tras escalado | Pesos safetensors en HuggingFace, codigo en GitHub |
| Qwen/Qwen3-0.6B-Base | 0,6 B | Transformer decoder-only generativo | 32 768 tokens | Apache 2.0 | no disponible en esta informacion | HuggingFace |
| Clasificadores zero-shot tipo BART-large-MNLI | ~0,4 B | NLI convertido a clasificacion zero-shot | no disponible en esta informacion | MIT (tipicamente) | no disponible en esta informacion | HuggingFace |
| Modelos de clasificacion encoder tipo DeBERTa-v3 / ModernBERT | 0,1 a 0,4 B | Encoder supervisado o zero-shot | no disponible en esta informacion | MIT / Apache 2.0 segun variante | no disponible en esta informacion | HuggingFace |

No se dispone de comparativas publicadas por el autor frente a otras alternativas, y la busqueda web realizada no ha devuelto resultados tecnicos relevantes sobre este modelo. Las filas de modelos alternativos se incluyen solo a efectos de categoria; sus cifras de rendimiento no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Solo texto y solo ingles: los datos de entrenamiento son en ingles, por lo que el rendimiento en castellano u otros idiomas no esta evaluado ni garantizado.
- Sin razonamiento de multiples pasos: el autor indica explicitamente que no hay aritmetica, conteo, comparacion de fechas ni razonamiento multi-hop en un solo paso; esas operaciones deben quedar en codigo.
- La precision cae cuando el estado contiene informacion no relacionada con la pregunta.
- El modelo no genera texto, de modo que no hay riesgo de alucinacion textual, pero si de decision erronea o mal calibrada.
- La cabeza de evidencia se entreno con negativos de pasajes intercambiados de grano grueso, por lo que su senal de evidencia es poco fina.
- Las probabilidades estan calibradas de forma agregada sobre las distribuciones evaluadas, lo que no garantiza nada sobre una respuesta individual ni sobre datos propios; el autor recomienda verificar la calibracion con etiquetas propias antes de actuar automaticamente.
- Los umbrales conformales de `conformal.json` se ajustaron sobre el split de calibracion de las tareas vistas. En la suite de transferencia la cobertura cae a 0,74 para preguntas booleanas y la tasa de actuacion erronea sube al 31,2 %, muy por encima del 14,8 % en tareas no vistas.
- Las preguntas de tipo score no reciben umbral de actuacion, porque la precision a nivel exacto no es la nocion de error adecuada para respuestas ordinales.
- El ECE empeora notablemente fuera de distribucion: 0,124 en el suite de transferencia tras escalado frente a 0,037 en tareas no vistas.
- El rendimiento en algunas fuentes del suite de transferencia es bajo: 0,457 en emotion y en mmlu, 0,500 en contrastive_authorization y composition_held_and_or.
- Licencia Apache 2.0, sin restricciones conocidas para uso comercial, pero al derivar de Qwen3-0.6B-Base conviene revisar tambien las condiciones del modelo base.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, y no hay resultados de busqueda web relevantes: es un artefacto muy reciente y sin validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Berk/assay-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Codigo, servidor y receta de entrenamiento: https://github.com/bgokden/assay
- Suite de evaluacion kev: https://huggingface.co/datasets/jaredpalmer/kev-suites

Nota: la busqueda web realizada no ha devuelto ningun enlace, paper o articulo tecnico relevante sobre este modelo; los resultados obtenidos eran foros y paginas sin relacion con el contenido de la ficha.
