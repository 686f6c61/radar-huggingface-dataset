# prithivMLmods/MedChain-R1-9B-GGUF

## Resumen

MedChain-R1-9B-GGUF es la version cuantizada en formato GGUF del modelo vision-lenguaje MedChain-R1-9B, desarrollado por el usuario prithivMLmods a partir del checkpoint base de adidukrembzuai. Se trata de un modelo multimodal de 9B parametros (8.953.803.264 pesos reales en safetensors) especializado en *sequential medical image grounding*: dada una secuencia de imagenes medicas y una pregunta clinica, el modelo genera primero un razonamiento anclado en la imagen dentro de etiquetas `<think>` y despues devuelve una unica caja delimitadora en coordenadas de pixel.

El modelo esta construido sobre Qwen3.5-9B y se describe en el articulo "Think Before You Locate: Clinical Chain-of-Thought Supervision for Sequential Medical Image Grounding" (arXiv:2611.00041). Su entrenamiento combina supervision de cadena de pensamiento deliberativa (dCoT-SFT) sobre el corpus MedChain, con 182.573 razonamientos filtrados sobre las 8 tareas de MedSG-Bench y 10 modalidades de imagen, seguido de un refinamiento con GRPO usando una recompensa de IoU mas formato.

Es relevante porque aborda una tarea poco cubierta por los VLM generalistas: localizar hallazgos en series de imagenes medicas (RM, TC) con razonamiento explicito intermedio, superando al estado del arte supervisado MedSeq-Grounder 7B en el benchmark MedSG-Bench. La licencia Apache 2.0 facilita su experimentacion, aunque el propio autor lo califica como artefacto de investigacion no validado para uso clinico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3.5-9B (transformer multimodal con proyector visual) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K; proyector multimodal en mmproj-bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones llama.cpp) y safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con proyector visual (fichero `mmproj` en GGUF) que procesa secuencias de imagenes medicas junto con texto. La innovacion principal no esta en la arquitectura sino en el esquema de entrenamiento: se aplica *deliberative chain-of-thought supervision* (dCoT-SFT) sobre el corpus MedChain, donde cada ejemplo contiene un razonamiento anclado en la imagen seguido de una caja delimitadora. Los razonamientos se generaron con un VLM medico (FlemingVL-38B) y se refinaron con un modelo multimodal (Qwen3.5-397B-A17B) condicionado a la caja anotada.

Tras el SFT se aplica GRPO con una recompensa compuesta de IoU y formato. El articulo senala que la contribucion del GRPO tras el dCoT-SFT es pequena (+0.37 mIoU a 4B). El corpus cubre 8 tareas de MedSG-Bench y 10 modalidades de imagen, con 182.573 razonamientos filtrados. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset. La model card indica que no se usa decodificacion especulativa (MTP).

## Capacidades

- Generacion de texto y razonamiento clinico con modo *thinking* explicito en etiquetas `<think>`.
- *Visual grounding* secuencial: localizacion de hallazgos mediante cajas delimitadoras en coordenadas de pixel sobre secuencias de imagenes medicas.
- Soporte multi-imagen: procesa varias imagenes en una misma consulta (tareas de *difference grounding*, *multi-view*).
- Modalidades cubiertas: RM, TC y otras modalidades incluidas en las 10 del benchmark MedSG-Bench.
- Razonamiento multi-paso con cadena de pensamiento supervisada.
- Procesamiento imagen-texto a texto (pipeline `image-text-to-text`).
- No se documenta soporte de *tool calling* ni de function calling en la informacion disponible.
- Capacidad multilingue limitada al ingles.
- No se documentan capacidades de audio ni de agente autonomo.

## Casos de uso

- **Investigacion en grounding medico**: evaluar y comparar tecnicas de razonamiento intermedio (dCoT) frente a modelos supervisados clasicos en tareas de localizacion sobre MedSG-Bench, usando las cuantizaciones Q4_K_M o Q5_K_M para iterar rapidamente en una sola GPU.
- **Prototipado de asistentes radiologicos**: construir demos que, dada una serie de imagenes de RM o TC, devuelvan una caja delimitadora y una justificacion textual; util para validar interfaces antes de invertir en modelos mayores.
- **Anotacion asistida (humano en el bucle)**: generar propuestas de bounding boxes y racionales para que un radiologo las revise, acelerando el etiquetado de nuevos datasets; el modelo sirve como preanotador, no como decisor.
- **Analisis de diferencias entre estudios**: la tarea de *difference grounding* del benchmark se traduce en comparar dos imagenes (p. ej., pre y post tratamiento) y localizar el cambio; el modelo gana 14,7-16,1 mIoU en esta tarea frente a un modelo 4B sin razonamiento.
- **Despliegue en entornos con recursos limitados**: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en estaciones de trabajo con GPU de consumo (a partir de 6-8 GB de VRAM con Q4_K_M), lo que permite pruebas en hospitales o laboratorios sin infraestructura de centro de datos.
- **Generacion de explicaciones clinicas auditables**: el formato `<think>` mas caja permite registrar la justificacion junto a la localizacion, util para auditoria interna de pipelines de investigacion (no para diagnostico).
- **Benchmarking de modelos medicos**: usar el checkpoint como referencia cuantizada del estado del arte en MedSG-Bench para comparar futuros modelos con un coste de inferencia bajo.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre las 9.630 preguntas de test de MedSG-Bench:

| Modelo | mIoU | Acc@0.5 |
|---|---|---|
| MedChain-R1-9B (este checkpoint) | 77,54 | 84,87 |
| MedChain-R1-9B (fila GRPO del paper, otro checkpoint) | 76,90 | 83,82 |
| MedSeq-Grounder 7B (SOTA supervisado) | 72,55 | 79,71 |
| Baselines generales y medicos zero-shot | por debajo de 21 mIoU | no disponible |

El articulo indica que las ganancias varian por tarea: frente a un modelo 4B *answer-only*, la supervision de razonamiento aporta +14,7 a +16,1 mIoU en *difference grounding*, pero pierde 2,2-3,2 en *multi-view*, *patch* y *referring grounding*. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin overhead de contexto): Q3_K_M ~4,6 GB; Q4_K_M ~5,6 GB; Q5_K_M ~6,5 GB; Q6_K ~7,4 GB; BF16 ~17,9 GB. Anadir ~0,9 GB para el proyector multimodal `mmproj-bf16`.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para BF16 con margen; RTX 4060 Ti 16 GB, RTX 4070 12 GB o RTX 3060 12 GB para cuantizaciones Q4/Q5.
- Cabe en GPU de consumo: si, con cuantizaciones Q3 a Q6 en tarjetas de 8-12 GB; BF16 requiere 24 GB o mas.
- Opciones de despliegue: llama.cpp (cuantizacion original), Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers y text-generation-inference.
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card advierte que la generacion por lotes produce salidas degeneradas y recomienda generar un ejemplo cada vez, lo que limita el throughput en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mIoU (MedSG-Bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedChain-R1-9B (este) | ~9B | no disponible | 77,54 | Apache 2.0 | GGUF en HF |
| MedSeq-Grounder 7B | 7B | no disponible | 72,55 | no disponible | no disponible |
| MedChain-R1-9B (GRPO del paper) | ~9B | no disponible | 76,90 | no disponible | no disponible |
| Baselines zero-shot generales/medicos | variable | no disponible | <21 | variable | variable |

La informacion disponible no permite comparar contexto, rendimiento generalista ni condiciones de uso de las alternativas mas alla de lo indicado.

## Limitaciones y advertencias

- Artefacto de investigacion: no validado para diagnostico ni despliegue clinico; el propio autor lo declara explicitamente.
- Evaluacion limitada a MedSG-Bench; no hay evidencia fuera de ese benchmark.
- Los razonamientos se generaron conociendo la respuesta (post-hoc), por lo que pueden no reflejar fielmente el proceso interno del modelo.
- La generacion por lotes produce salidas degeneradas; hay que generar de uno en uno.
- Solo soporta ingles.
- Riesgo de alucinacion en justificaciones clinicas y en coordenadas de cajas fuera de las modalidades del entrenamiento.
- Sesgos: no documentados en la informacion disponible; al entrenarse sobre un corpus medico filtrado, puede heredar sesgos de ese corpus.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de validacion clinica desaconseja cualquier aplicacion medica real sin evaluacion independiente.
- Las ganancias frente a modelos sin razonamiento no son uniformes: se pierde rendimiento en tareas de *multi-view*, *patch* y *referring grounding*.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/MedChain-R1-9B-GGUF
- Modelo base: https://huggingface.co/adidukrembzuai/MedChain-R1-9B
- Articulo: arXiv:2611.00041 ("Think Before You Locate: Clinical Chain-of-Thought Supervision for Sequential Medical Image Grounding")
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor de la cuantizacion: https://huggingface.co/prithivMLmods
