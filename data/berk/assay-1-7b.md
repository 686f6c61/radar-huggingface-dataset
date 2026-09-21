# Berk/assay-1.7b

## Resumen

assay-1.7b es un modelo de decisión calibrada desarrollado por el usuario Berk. No es un modelo generativo al uso: recibe un estado (un texto, por ejemplo el cuerpo de un ticket o un pasaje) y una o varias preguntas tipadas con opciones descritas, y devuelve directamente una distribución de probabilidad por pregunta, una puntuación de confianza y una puntuación de evidencia. La respuesta se lee de los logits de siguiente token del propio modelo sobre los tokens de etiqueta de cada opción, en una única posición de decisión, de modo que no se genera texto libre y es imposible obtener una salida fuera del esquema definido.

Técnicamente es un ajuste fino con LoRA del backbone Qwen/Qwen3-1.7B-Base (1.720.574.976 parámetros, unos 1,72 B), con los pesos ya fusionados en el repositorio y el adaptador conservado aparte. La innovación principal es el aislamiento de preguntas: cada pregunta es una rama independiente sobre un estado compartido mediante máscara de atención en bloque y posiciones reiniciadas, lo que permite empaquetar hasta 24 preguntas en un solo forward pass sin pérdida de exactitud respecto a enviarlas por separado.

Es relevante porque ataca un problema muy concreto de los pipelines de producción: convertir texto en decisiones estructuradas, calibradas y auditables, en lugar de depender de prompts generativos cuyo formato de salida puede romperse. Se publica bajo licencia Apache-2.0, está entrenado únicamente en inglés y su pipeline declarado es text-classification. El modelo no tiene descargas ni «likes» en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (backbone Qwen3) con adaptador LoRA fusionado y cabeza de evidencia lineal |
| Parámetros totales | 1.720.574.976 (≈1,72 B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la hereda del backbone Qwen/Qwen3-1.7B-Base |
| Tipos de cuantización | no disponible; el repositorio solo distribuye safetensors sin cuantizaciones publicadas |
| Idiomas soportados | inglés (en); los datos de entrenamiento son únicamente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (pesos fusionados) más adaptador LoRA en `adapter/` y `assay_head.safetensors` |

Otros datos de interés: pipeline declarado `text-classification`, librería `transformers`, tamaño del repositorio 3,5 GB, modelo base `Qwen/Qwen3-1.7B-Base`. Entre las etiquetas figuran `text-generation`, `zero-shot-classification`, `decision-model`, `calibrated`, `system-one`, `text-embeddings-inference` y `endpoints_compatible`; la etiqueta `text-generation` responde a la herencia del backbone y no describe el uso real del modelo, que no genera texto.

## Arquitectura y entrenamiento

El punto de partida es el backbone Qwen/Qwen3-1.7B-Base, sobre el que se aplica un adaptador LoRA con r=16, alpha=32, learning rate 5e-05, una única época y batch de 8. Los pesos resultantes están fusionados en el repositorio. La inferencia no usa decodificación autoregresiva de texto: la respuesta se extrae de los logits de siguiente token del modelo sobre los tokens que representan las etiquetas de cada opción, leídos en una única posición de decisión. Esto significa que el punto de partida efectivo es la competencia zero-shot del modelo base.

Las preguntas se tratan como ramas aisladas sobre un estado compartido, mediante máscara de atención en bloque y reinicio de posiciones, de forma que una petición empaquetada con varias preguntas y varias peticiones separadas producen exactamente el mismo resultado. El entrenamiento usa entropía cruzada contra objetivos suaves: distribuciones humanas de etiquetas cuando el dataset de origen las proporciona, niveles suavizados con SORD para preguntas ordinales y one-hot en el resto de casos. Las opciones de las preguntas de tipo elección se barajan en cada ejemplo. Adicionalmente, una cabeza de evidencia (una capa lineal sobre el token de decisión, guardada en `assay_head.safetensors`) predice si el estado soporta realmente la pregunta, y se entrena con negativos construidos intercambiando pasajes. Por último, se ajustó una temperatura global de 1,211 sobre el split de calibración de las tareas de entrenamiento y se aplica sin cambios en el resto de escenarios.

Los datos de entrenamiento proceden de cincuenta y cinco datasets públicos de clasificación, inferencia, comprensión lectora y preferencias, renderizados como preguntas tipadas con opciones descritas; cada dataset conserva su propia licencia. La lista completa y las rúbricas están en `assay/data/tasks.py` del repositorio.

## Capacidades

- Decisión tipada en un solo forward pass, con tres tipos de pregunta: `noul` (sí/no), `choice` (entre 2 y 255 opciones descritas) y `score` (entre 2 y 10 niveles ordenados).
- Devolución de una distribución de probabilidad por pregunta, más una puntuación de confianza y una puntuación de evidencia.
- Clasificación zero-shot sobre tareas no vistas: la evaluación incluye once datasets nunca usados en entrenamiento (bbc_news, app_reviews, scitail, medical_questions_pairs, tweet_irony, ethos, stance_climate, dream, copa, truthful_qa, hh_rlhf).
- Empaquetado de múltiples preguntas sobre un mismo estado con resultados idénticos a peticiones separadas y un coste latente mucho menor (ver sección de rendimiento).
- Salida restringida al esquema: al no generar texto, no puede producir respuestas fuera de formato ni JSON malformado.
- Puntuación de evidencia para detectar estados que no soportan la pregunta formulada, útil como filtro previo a la decisión.
- Capacidades multilingües: no disponibles; el modelo está entrenado y evaluado solo en inglés.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo de razonamiento extenso: no disponibles ni documentados. La model card indica explícitamente que no hace aritmética, conteo, comparación de fechas ni razonamiento multi-salto en un solo paso.

## Casos de uso

- Triaje y enrutado de tickets de soporte: se envía el texto del ticket como estado y una pregunta `choice` con las opciones de equipo o cola («facturación», «técnico», «cuenta»). La distribución de probabilidad permite aplicar umbrales de derivación automática y reservar la revisión humana para los casos con confianza baja.
- Detección de intención de reembolso o cancelación: una pregunta `noul` del tipo «¿el cliente pide que se le devuelva el dinero?» devuelve probabilidad y evidencia, lo que permite disparar flujos automáticos solo cuando la evidencia sobre el propio texto es suficiente.
- Moderación de contenido: clasificación de comentarios en categorías descritas (ofensivo, spam, legítimo) con una sola pasada por estado; la baja tasa de errores confiados publicada (0,022–0,029 en los splits escalados) es relevante cuando las decisiones automáticas tienen consecuencias.
- Puntuación ordinal de riesgo, urgencia o satisfacción: el tipo `score` con entre 2 y 10 niveles ordenados y suavizado SORD está pensado para etiquetas con orden intrínseco, como prioridad de incidencia o severidad de una reclamación.
- Verificación de contexto en pipelines RAG: usar la cabeza de evidencia para comprobar si el pasaje recuperado soporta realmente la pregunta antes de encadenar un modelo generativo, evitando que el generador trabaje sobre contexto irrelevante.
- Pre-etiquetado y anotación asistida de datasets: procesar lotes de textos con varias preguntas empaquetadas por estado (hasta 24 preguntas en 32,1 ms en la RTX 5090 de referencia) para generar etiquetas candidatas con probabilidades que después se revisan o se corrigen.
- Extracción de atributos estructurados en formularios y correos: convertir texto libre en un conjunto fijo de campos tipados sin riesgo de salida fuera de esquema, integrándolo en un backend con `transformers`.
- Filtrado previo en pipelines de análisis de opinión o postura: clasificar postura climática, ironía o emoción con preguntas descritas, aceptando una precisión menor a cambio de un coste de inferencia muy bajo.

## Benchmarks y rendimiento

Resultados de evaluación publicados en la model card. «Tareas vistas (dev)» son las tareas de entrenamiento; «tareas no vistas (holdout)» son once datasets nunca usados en entrenamiento; «kev transfer-v4 dev» es la suite pública del dataset `jaredpalmer/kev-suites`. «raw» es sin escalado y «scaled» con la temperatura global de 1,211. Brier es la suma multiclase de errores al cuadrado (0..2), ECE usa 15 bins y «errores confiados» son respuestas con p ≥ 0,9 que son incorrectas.

| Split | n | Accuracy | Brier | NLL | ECE | Errores confiados |
|---|---|---|---|---|---|---|
| Tareas vistas (dev), raw | 5513 | 0,740 | 0,359 | 0,700 | 0,055 | 0,041 |
| Tareas vistas (dev), scaled | 5513 | 0,740 | 0,355 | 0,680 | 0,035 | 0,029 |
| Tareas no vistas (holdout), raw | 2020 | 0,752 | 0,337 | 0,626 | 0,047 | 0,032 |
| Tareas no vistas (holdout), scaled | 2020 | 0,752 | 0,334 | 0,601 | 0,024 | 0,022 |
| kev transfer-v4 dev, raw | 764 | 0,670 | 0,453 | 0,794 | 0,147 | 0,065 |
| kev transfer-v4 dev, scaled | 764 | 0,670 | 0,436 | 0,743 | 0,115 | 0,039 |

Desglose por fuente dentro de kev transfer-v4 dev:

| Fuente | n | Accuracy | Brier | ECE |
|---|---|---|---|---|
| composition_held_and_or | 32 | 0,688 | 0,430 | 0,177 |
| composition_held_conditional | 32 | 0,469 | 0,501 | 0,258 |
| composition_held_or_not | 32 | 0,719 | 0,361 | 0,188 |
| contrastive_authorization | 40 | 0,525 | 0,703 | 0,391 |
| contrastive_deadline | 40 | 0,300 | 0,897 | 0,443 |
| emotion | 116 | 0,595 | 0,550 | 0,149 |
| mmlu | 116 | 0,569 | 0,534 | 0,109 |
| paws | 80 | 0,662 | 0,439 | 0,161 |
| qnli | 80 | 0,875 | 0,232 | 0,087 |
| sciq | 116 | 0,888 | 0,161 | 0,070 |
| tweet_offensive | 80 | 0,725 | 0,376 | 0,127 |

Latencia medida en una RTX 5090 con bf16 y `transformers`, comparando preguntas empaquetadas sobre un mismo estado frente a peticiones separadas:

| Preguntas | Empaquetado (ms) | Separado (ms) |
|---|---|---|
| 1 | 17,8 | 17,9 |
| 3 | 17,9 | 53,6 |
| 6 | 19,7 | 106,6 |
| 12 | 21,1 | 212,2 |
| 24 | 32,1 | 428,7 |

No se publican comparaciones directas contra otros modelos en la información disponible.

## Requisitos de hardware

- Pesos: 1,72 B de parámetros. En bf16 ocupan aproximadamente 3,45 GB; el repositorio completo pesa 3,5 GB, lo que es coherente con pesos en bf16 más el adaptador.
- VRAM estimada para inferencia: en bf16, un entorno práctico requiere del orden de 4 a 6 GB contando pesos, caché de atención y overhead del runtime. En int8 bajaría a unos 2-3 GB y en int4 a unos 1,5-2 GB, pero estas cuantizaciones no están publicadas ni documentadas por el autor, por lo que los valores son estimaciones.
- Cabe en GPU de consumo: sí. Cualquier GPU con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) debería ejecutarlo en bf16 sin problema. En GPUs de 6 GB conviene recurrir a cuantización, no documentada oficialmente.
- GPU recomendadas: para lotes grandes o varias preguntas empaquetadas por estado, una RTX 4090 o RTX 5090 es suficiente; en servidor, L4, A10G, L40S, A100 o H100 aportan margen para procesamiento por lotes.
- Despliegue: la ruta documentada es `transformers` con la clase `AssayModel` y el esquema `Question` del repositorio. Las etiquetas del repositorio incluyen `text-embeddings-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con ese runtime, pero no se aporta documentación de despliegue para vLLM, llama.cpp, Ollama o TGI. No hay GGUF publicado.
- Latencia y throughput: en una RTX 5090 con bf16 y `transformers`, 17,8 ms para una pregunta empaquetada y 32,1 ms para 24 preguntas sobre un mismo estado. El empaquetado multiplica el throughput efectivo al aumentar el número de preguntas: 24 preguntas pasan de 428,7 ms (peticiones separadas) a 32,1 ms, un factor de aproximadamente 13x. No hay cifras publicadas de throughput en servidor ni de latencia con lotes grandes.

## Comparativa con modelos similares

No hay datos de benchmarks de terceros en la información proporcionada, por lo que la comparación es estructural. La referencia más directa es el propio backbone y los clasificadores zero-shot clásicos de tipo NLI.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Berk/assay-1.7b | 1,72 B | no disponible | accuracy 0,752 en tareas no vistas; ECE 0,024 con escalado | Apache-2.0 | HuggingFace, código en GitHub |
| Qwen/Qwen3-1.7B-Base | 1,72 B | no disponible en esta información | no disponible (es el punto de partida zero-shot del anterior) | Apache-2.0 | HuggingFace |
| Clasificadores zero-shot tipo NLI (p. ej. familia DeBERTa-v3 o BART-large-MNLI) | 0,1-0,4 B | típicamente 512-1024 tokens | no disponible | MIT o similar | HuggingFace |
| Clasificación mediante prompting a un LLM generativo | variable (≥7 B) | variable | no disponible | variable | HuggingFace y APIs |

Diferencias cualitativas que sí se pueden afirmar con la información disponible: assay-1.7b ofrece salida tipada y calibrada con métricas de calibración publicadas (ECE, Brier, errores confiados) y un coste de inferencia de una sola pasada, algo que un LLM generativo usado como clasificador no garantiza, ya que puede producir salidas fuera de esquema. Frente a los clasificadores NLI clásicos, aporta preguntas tipadas con hasta 255 opciones descritas y puntuación de evidencia, a cambio de un tamaño de 1,72 B parámetros. No se dispone de cifras comparativas de accuracy entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo texto. No procesa imágenes, audio ni otras modalidades.
- Entrenado y evaluado únicamente en inglés; el rendimiento en otros idiomas no está caracterizado y previsiblemente será peor.
- No hace aritmética, conteo, comparación de fechas ni razonamiento multi-salto en una sola pasada. La model card recomienda explícitamente mantener esas operaciones en código.
- La precisión cae cuando el estado contiene información no relacionada con la pregunta.
- La cabeza de evidencia se entrena con negativos gruesos basados en intercambio de pasajes, por lo que su señal es aproximada.
- Las probabilidades están calibradas de forma agregada sobre las distribuciones evaluadas. Esto no garantiza la calibración de ninguna respuesta individual ni la del conjunto de datos propio: antes de actuar sobre umbrales hay que verificar la calibración con etiquetas propias.
- Existe una caída clara en la suite kev transfer-v4 (accuracy 0,670, ECE 0,115-0,147) frente a las tareas vistas y no vistas, con casos especialmente débiles como `contrastive_deadline` (accuracy 0,300) o `contrastive_authorization` (0,525). Es un indicador de que las tareas de composición lógica y las restricciones contraintuitivas son un punto flojo.
- Riesgo de sesgo: los datos de entrenamiento son cincuenta y cinco datasets públicos de clasificación, inferencia, comprensión lectora y preferencias, entre ellos `hh_rlhf` y datasets de análisis de opinión. No se documenta ningún análisis de sesgos ni de sesgo demográfico, por lo que el modelo puede heredar los sesgos de esas fuentes.
- Licencias de los datos: cada uno de los cincuenta y cinco datasets conserva su propia licencia, lo que puede condicionar usos comerciales derivados aunque el modelo se publique como Apache-2.0.
- Aunque la licencia del modelo es Apache-2.0, la información de la model card no incluye una declaración explícita de uso comercial permitido más allá de lo que establece dicha licencia.
- Modelo con cero descargas y cero «likes» en el momento de la ficha, publicado en septiembre de 2026: no hay evidencia de uso en producción ni validación por terceros.
- La API de uso requiere importar `assay.model` y `assay.schema` desde el repositorio de GitHub, no es una llamada estándar de `transformers`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Berk/assay-1.7b
- Código, servidor y receta de entrenamiento: https://github.com/bgokden/assay
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Dataset de la suite de transferencia: https://huggingface.co/datasets/jaredpalmer/kev-suites

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores son los que aparecen en la información del repositorio y en la model card.
