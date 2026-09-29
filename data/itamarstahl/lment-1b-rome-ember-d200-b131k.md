# itamarstahl/lment-1b-rome-ember-d200-b131k

## Resumen

LMEnt 1B — Ancient Rome EMBER es un checkpoint de investigación publicado por itamarstahl (junto a Gal Barak, Tamar Tabbach y Adam Fleisher) como parte del trabajo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF* (2026). Se trata de un modelo de lenguaje causal en inglés de tipo OLMo2 1B, entrenado sobre el corpus Wikipedia anotado por entidades LMEnt, al que se le ha aplicado una edición EMBER sobre direcciones seleccionadas del espacio de embeddings de entrada con una intensidad δ = 200. El objetivo no es ofrecer un asistente conversacional, sino servir como artefacto experimental: medir si la supresión de un concepto concreto (la Antigua Roma) mediante borrado de conceptos reproduce el comportamiento de un gemelo entrenado con ese concepto excluido del corpus.

El modelo parte del checkpoint de control compartido `lment-1b-control-2e-b131k` y se compara con el gemelo con exclusión de concepto `lment-1b-norome-2e-b131k`. A diferencia de este último, el checkpoint EMBER no se entrenó enmascarando del cálculo de la pérdida los fragmentos vinculados al concepto; la supresión se consigue editando direcciones de embeddings. Los resultados publicados en la model card (H_test = 0,208; R_abs = 1,613; R_KL = 2,264) indican que la edición sí altera el comportamiento respecto del control, pero no acerca el modelo al gemelo con exclusión de concepto en ninguna de las dos medidas de proximidad.

Se trata de un modelo base sin instruction tuning, con 1.336.035.328 parámetros reales según los pesos en safetensors y un repositorio de 5,3 GB, distribuido sin licencia de pesos declarada y con cero descargas en el momento de la consulta. Su relevancia es, por tanto, estrictamente metodológica: aporta un punto de comparación reproducible entre EMBER, RMU y SNMF en un mismo modelo base y con particiones de evaluación emparejadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia OLMo2, 1B); modelo base sin instruction tuning |
| Parametros totales | 1.336.035.328 (≈1,34 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se incluyen versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible (el autor indica que no se declara licencia de pesos en la model card) |
| Formato de pesos | safetensors |
| Libreria de referencia | transformers |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 5,3 GB |
| Autor | itamarstahl |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal OLMo2 1B en inglés, entrenado sobre el corpus Wikipedia con anotación de entidades LMEnt. No hay instruction tuning ni etapas declaradas de RLHF o DPO, por lo que el checkpoint mantiene el comportamiento de un modelo base de continuación de texto. Sobre esa base se aplica una edición EMBER que modifica direcciones seleccionadas del espacio de embeddings de entrada con una intensidad δ = 200 (configuración del apéndice B.3 del artículo, etiqueta candidata `ember_rome_d200`).

El procedimiento de edición descrito en la model card factoriza características semánticas a rango 100 a partir de 300 frases objetivo y 300 frases neutras, con una esparsidad de 0,02 y semilla 44. Un juez semántico retiene las características relacionadas con el objetivo con una confianza mínima de 0,85. Un punto técnico relevante es que este checkpoint no se entrenó enmascarando del cálculo de la pérdida los fragmentos vinculados al concepto, lo que lo distingue metodológicamente del gemelo con exclusión de concepto. La selección del checkpoint se realizó sobre la partición de selección del artículo mediante una regla fija, antes de la evaluación en la partición reservada (held-out), usando preguntas separadas sobre el objetivo, temas vecinos y SciQ.

## Capacidades

- Generacion de texto en inglés: es un modelo de lenguaje causal que produce continuaciones de texto coherentes con su distribución de entrenamiento sobre Wikipedia.
- Modelado de conocimiento enciclopedico: al derivar del corpus Wikipedia anotado por entidades LMEnt, mantiene cobertura factual amplia sobre ese dominio.
- Supresion dirigida de un concepto: la edición EMBER reduce la expresión del concepto objetivo (Antigua Roma) respecto del control completo, según la métrica H_test reportada.
- Artefacto de comparacion metodologica: permite replicar la comparación emparejada entre EMBER, RMU y SNMF sobre una misma base y con particiones de evaluación controladas.
- Analisis de proximidad conductual: los ratios R_abs y R_KL permiten cuantificar cuánto se acerca o se aleja el modelo editado del gemelo con exclusión de concepto.
- Soporte de tool calling / function calling: no disponible; la model card no declara plantilla de herramientas ni entrenamiento orientado a agentes.
- Soporte de agentes y razonamiento multi-paso: no disponible; al no haber instruction tuning, no se reportan capacidades agénticas.
- Capacidades multilingues: limitadas al inglés (idioma declarado: `en`).
- Capacidades especiales (vision, audio, modo de razonamiento explícito): no disponibles.
- Nota sobre metadatos: la etiqueta `conversational` aparece en los tags del repositorio, pero la model card especifica que se trata de un modelo base sin instruction tuning, por lo que no debe asumirse un comportamiento de chat alineado.

## Casos de uso

- Investigacion en desaprendizaje de conceptos (machine unlearning): el checkpoint sirve como uno de los tres puntos de comparación del artículo, de modo que un grupo de investigación puede reproducir la evaluación emparejada de EMBER frente a RMU y SNMF sobre la misma base OLMo2 1B.
- Evaluacion de tecnicas de edicion de direcciones en embeddings: dado que la edición se define por parámetros concretos (δ = 200, rango 100, esparsidad 0,02, semilla 44, umbral del juez 0,85), es posible reproducir la intervención y estudiar el efecto de variar cada hiperparámetro.
- Analisis de fidelidad tras una intervencion: los ratios R_abs (1,613) y R_KL (2,264) permiten estudiar hasta qué punto una edición de embeddings degrada la distribución de salida respecto del modelo completo, útil para diseñar métricas de preservación de capacidades.
- Estudio de filtrado tematico en corpus historicos: el modelo sirve para experimentar con la supresión de un tema concreto (Antigua Roma) y valorar si ese tipo de intervención es viable como mecanismo de exclusión de contenido en corpus derivados de Wikipedia.
- Punto de partida para fine-tuning controlado: al ser un modelo base sin instruction tuning, puede usarse como inicialización para estudiar si ajustes posteriores recuperan el conocimiento suprimido o si la edición induce olvido catastrófico sobre temas vecinos.
- Docencia y replicacion de resultados: el par formado por el control y el gemelo con exclusión permite montar prácticas de laboratorio sobre evaluación controlada, con particiones de selección y de test separadas.
- Auditoria de artefactos de investigacion: los metadatos del repositorio (cero descargas, cero likes, licencia no declarada) permiten analizar la trazabilidad y reproducibilidad de publicaciones que liberan checkpoints sin licencia explícita.

## Benchmarks y rendimiento

La model card solo publica las tres métricas propias del artículo, medidas sobre la partición de test reservada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Metrica | Valor | Interpretacion segun la model card |
|---|---:|---|
| `H_test` (eficacia sobre el objetivo y preservacion) | 0,208 | Valor agregado de la partición de test para eficacia y preservación del objetivo |
| `R_abs` (distancia NLL de respuesta correcta al gemelo / distancia del modelo completo) | 1,613 | Valores por encima de uno indican mayor distancia que el control completo en esa medida |
| `R_KL` (distancia KL de vocabulario completo en teacher forcing al gemelo / distancia del modelo completo) | 2,264 | Valores por encima de uno indican mayor distancia que el control completo en esa medida |

La propia model card subraya que supresión y parecido con el gemelo son resultados distintos: con R_abs = 1,613 y R_KL = 2,264, el checkpoint editado no se aproxima al gemelo con exclusión de concepto en ninguna de las dos medidas de proximidad.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos aproximados a partir de los 1.336.035.328 parámetros; no son cifras publicadas por el autor): en fp32, alrededor de 5,4 GB solo de pesos, coherente con el repositorio de 5,3 GB; en bf16/fp16, en torno a 2,7 GB; en int8, aproximadamente 1,4 GB; en 4 bits, del orden de 0,8-1 GB. Hay que sumar el overhead de activaciones y caché KV.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede ejecutar el modelo en bf16 con margen; una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 son opciones holgadas. Para despliegue en servidor, A100 o H100 permiten lotes grandes y mayor throughput, aunque están sobredimensionadas para un modelo de 1,34 B.
- Cabe en GPU de consumo: sí. En bf16 cabe en GPU de 8 GB o superiores; con cuantización de 4 bits es viable en GPUs de 6-8 GB. La inferencia en CPU también es factible, aunque requiere convertir los pesos a un formato compatible.
- Opciones de despliegue: `transformers` está documentado en la propia model card mediante `AutoModelForCausalLM` y `AutoTokenizer`. vLLM y TGI pueden servir el modelo a partir de los safetensors. llama.cpp y Ollama requieren una conversión previa a GGUF que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

La comparación más informativa es la que el propio artículo plantea: el mismo modelo base en tres variantes emparejadas. No se han publicado en la información disponible comparativas de benchmarks estándar frente a otras familias de 1B.

| Modelo | Relacion con este checkpoint | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lment-1b-rome-ember-d200-b131k` (este) | Edicion EMBER con δ = 200 sobre la base compartida | 1.336.035.328 | no disponible | no disponible | Repositorio HuggingFace, safetensors |
| `lment-1b-control-2e-b131k` | Control completo compartido, punto de partida de la edición | no disponible en la informacion proporcionada | no disponible | no disponible | Repositorio HuggingFace |
| `lment-1b-norome-2e-b131k` | Gemelo entrenado con exclusion de concepto (referencia de comparacion) | no disponible en la informacion proporcionada | no disponible | no disponible | Repositorio HuggingFace |
| OLMo2 1B (modelo base de la familia) | Arquitectura y corpus de partida | orden de 1B (dato no verificado en la informacion proporcionada) | no disponible | no disponible en la informacion proporcionada | Repositorio publico del desarrollador original |

Frente a alternativas generalistas de la misma escala (por ejemplo, modelos de 1-1,5 B orientados a instrucciones), este checkpoint no compite en rendimiento de tareas: su función es servir de evidencia experimental sobre erasure de conceptos, y la model card no aporta métricas comparables de MMLU, HumanEval o GSM8K para establecer una comparación de capacidades.

## Limitaciones y advertencias

- Ausencia de licencia de pesos: el autor indica explícitamente que no se declara licencia de pesos en la model card. Sin una licencia explícita, el uso comercial queda en una situación jurídica indeterminada y no debería asumirse permitido.
- Modelo base sin instruction tuning: no sigue instrucciones, no mantiene formato de diálogo y no está alineado para tareas de asistente. Pese a la etiqueta `conversational` de los metadatos, no debe usarse como chat.
- Alcance limitado de la evaluacion: el artículo prueba tres conceptos seleccionados con 50 preguntas reservadas por concepto. Estos resultados no demuestran eliminación amplia de conocimiento, mejora de seguridad ni generalización a otros conceptos.
- La supresion no reproduce la exclusion: con R_abs = 1,613 y R_KL = 2,264 (ambos por encima de uno), el modelo editado se aleja más del gemelo con exclusión de concepto que el control completo en las dos medidas de proximidad. La edición no equivale a reentrenar sin el concepto.
- Sesgos y errores heredados: al derivar de Wikipedia, el modelo puede reproducir errores factuales o sesgos presentes en el material de entrenamiento.
- Riesgo de alucinacion: inherente a un modelo causal base sin alineación; no hay evaluación de factualidad publicada.
- Idioma: únicamente inglés. No hay soporte multilingüe declarado.
- Contexto: la longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues que dependan de ventanas largas.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin validación externa conocida.
- Ausencia de artefactos de despliegue: no se publican cuantizaciones ni ficheros GGUF, por lo que cualquier uso en llama.cpp u Ollama requiere conversión y validación propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-rome-ember-d200-b131k
- Checkpoint de control compartido: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusión de concepto: https://huggingface.co/itamarstahl/lment-1b-norome-2e-b131k
- Articulo citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (enlace al paper: no disponible)
- Repositorio de codigo: no disponible
- Demo: no disponible
