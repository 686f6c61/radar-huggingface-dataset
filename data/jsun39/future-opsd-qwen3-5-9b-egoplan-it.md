# jsun39/Future-OPSD-Qwen3.5-9B-EgoPlan-IT

## Resumen

Future-OPSD-Qwen3.5-9B-EgoPlan-IT es un ajuste fino de Qwen/Qwen3.5-9B orientado a la prediccion de acciones futuras en videos en primera persona (egocentric video). Lo desarrolla Jingchen Sun y colaboradores en el contexto del paper *Learning Video Foresight Reasoning from Unlabeled Videos via On-Policy Self-Distillation*. El modelo resuelve un problema concreto: predecir cual sera la proxima accion de una persona a partir de un clip de video observado, razonando antes de responder.

La innovacion principal no esta en la arquitectura, que hereda integramente de Qwen3.5-9B, sino en el metodo de entrenamiento Future-OPSD. Se entrena sobre pares de video pasado-futuro sin etiquetas de respuesta: el estudiante ve solo el video observado, mientras que un profesor congelado (copia del mismo modelo) ve ademas los fotogramas reales del futuro. La ventaja por token combina el contraste entre el futuro real y el futuro de un video no relacionado con un termino de destilacion profesor-estudiante.

El checkpoint tiene 9.409.813.744 parametros y un repositorio de 18,8 GB en formato safetensors. Esta pensado como modelo de investigacion para tareas de video understanding y planificacion cerrada, no como un asistente generalista. Su relevancia actual radica en que demuestra que se puede entrenar razonamiento de previsión temporal en VLMs sin anotaciones humanas ni modelos de recompensa externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (heredada de Qwen3.5-9B, familia qwen3_5) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se puede cuantizar con herramientas estandar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3.5-9B, un transformer multimodal de ~9,4 mil millones de parametros que procesa video e imagen junto con texto (pipeline image-text-to-text). El modelo no introduce cambios estructurales; el ajuste se aplica sobre los pesos del modelo base.

El entrenamiento usa Future-OPSD, un esquema de destilacion on-policy con contexto privilegiado. El estudiante ve solo el video observado y muestrea su propio razonamiento y respuesta; el profesor, una copia congelada del mismo modelo, ve ademas los fotogramas reales del futuro (contexto privilegiado z = future frames). Para cada token, la ventaja mezcla el contraste entre el futuro real y el de un video no relacionado con el termino de destilacion profesor-estudiante, con lambda = 0.75 y baseline de media por batch. No se usan etiquetas de respuesta, trazas de razonamiento ni modelos de recompensa externos. Los datos son EgoPlan-IT, construido a partir de los datos de entrenamiento de SEED-Bench-R1, con los videos de EPIC-KITCHENS.

La configuracion de entrenamiento fue de 100 pasos x 256 queries (25.600 queries), 1 rollout on-policy por query, learning rate 1e-6 y 8 GPUs B200. Se eligio la semilla 32 como mejor de tres (puntuacion media SEED-Bench-R1 L1-L3 de las semillas 30/31/32: 57,1 / 56,8 / 57,9).

## Capacidades

- Prediccion de la proxima accion en videos en primera persona, con razonamiento explicito previo a la respuesta.
- Comprension de video: procesa clips (la evaluacion oficial usa 32 fotogramas) y responde preguntas sobre ellos.
- Generacion de razonamiento estructurado en etiquetas `<reason> ... </reason>` y respuesta final en `<answer> ... </answer>`.
- Respuesta a preguntas de opcion multiple (closed-ended) sobre planificacion de acciones, formato para el que fue entrenado.
- Procesamiento multimodal imagen-texto y video-texto mediante el pipeline image-text-to-text.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad general; el razonamiento se limita al formato de prediccion entrenado.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: el modelo base soporta `enable_thinking`, pero en los ejemplos de uso se desactiva explicitamente (`enable_thinking=False`).

## Casos de uso

- Prediccion de proxima accion en asistentes de cocina o tareas domesticas: dado un clip egocentrico de EPIC-KITCHENS, el modelo razona y predice la accion siguiente del usuario, util para sistemas de asistencia paso a paso en entornos de cocina.
- Investigacion en video foresight: sirve como checkpoint de referencia para reproducir y comparar el metodo Future-OPSD frente al modelo base en tareas de prevision temporal.
- Evaluacion de modelos de video understanding: integrable en pipelines de evaluacion sobre SEED-Bench-R1, TempCompass, TemporalBench, Video-MME y MVBench con el protocolo descrito (vLLM, decodificacion greedy, 32 fotogramas, presupuesto de 512 tokens de razonamiento).
- Entrenamiento de asistentes de realidad aumentada: la prediccion de la accion siguiente permite anticipar la interfaz o las sugerencias que mostrar al usuario en gafas o dispositivos con camara egocentrica.
- Analisis de procesos industriales o de manipulacion: en videos de primera persona con tareas repetitivas, el modelo puede anticipar el siguiente paso del operario para detectar desviaciones del procedimiento.
- Generacion de datos sinteticos de razonamiento: las trazas `<reason>` producidas pueden usarse como material de destilacion o para aumentar datasets de planificacion de acciones.
- Robotica asistida: como modulo de prediccion de intencion a corto plazo en sistemas que necesitan anticipar la accion humana antes de intervenir.

## Benchmarks y rendimiento

Resultados publicados en la model card para este checkpoint (vLLM, decodificacion greedy, 32 fotogramas, presupuesto de 512 tokens de razonamiento; TwiFF-Bench puntuado 1-5 por un juez Qwen3.6-27B y multiplicado por 20; "General" promedia TempCompass, TemporalBench, Video-MME y MVBench sobre 19 tareas):

| Modelo | TwiFF CoT | TwiFF Ans. | TwiFF Avg | SEED L1 | SEED L2 | SEED L3 | TempCompass | TemporalBench | Video-MME | MVBench | General |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 62,4 | 54,5 | 58,5 | 44,3 | 44,9 | 37,9 | 79,9 | 21,4 | 61,2 | 65,6 | 57,0 |
| Este modelo | 58,4 | 56,2 | 57,3 | 58,6 | 61,3 | 53,8 | 81,2 | 20,0 | 60,9 | 65,1 | 56,8 |

El ajuste mejora de forma marcada SEED-Bench-R1 (L1: +14,3; L2: +16,4; L3: +15,9 puntos) y TempCompass (+1,3), mientras que empeora ligeramente TwiFF CoT (-4,0), TemporalBench (-1,4), Video-MME (-0,3), MVBench (-0,5) y el agregado General (-0,2). Los autores indican que las cifras corresponden a un unico checkpoint (una semilla) y remiten al paper para las estadisticas entre semillas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~9,4 mil millones de parametros: en bf16/fp16 requiere aproximadamente 19 GB solo para pesos, mas memoria para el procesador multimodal y la cache KV; en cuantizacion de 8 bits, unos 10 GB; en 4 bits, unos 6 GB (estimaciones no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizo con 8 x B200. Para inferencia, el modelo cabe en GPUs de datacenter (A100 40/80 GB, H100) y probablemente en consumer de gama alta con cuantizacion (RTX 4090 de 24 GB en bf16 justo, o cuantizado en 8/4 bits).
- Cabe en consumer GPU: si, con cuantizacion (RTX 4090, RTX 3090, y previsiblemente en GPUs de 16 GB en 4 bits), aunque el procesamiento de video anade memoria por fotograma.
- Opciones de despliegue: vLLM 0.30.0 con transformers 5.17 (configuracion usada por los autores), y transformers con `AutoModelForImageTextToText` y `AutoProcessor`. Otras opciones (llama.cpp, Ollama, TGI) no estan documentadas para este checkpoint.
- Latencia y throughput: no disponibles. La evaluacion usa `max_tokens=1024` y un presupuesto de razonamiento de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SEED L1-L3 | TwiFF Avg | General | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Future-OPSD-Qwen3.5-9B-EgoPlan-IT | 9,4 B | no disponible | 58,6 / 61,3 / 53,8 | 57,3 | 56,8 | Apache-2.0 | Hugging Face |
| Qwen3.5-9B (base) | 9,4 B | no disponible | 44,3 / 44,9 / 37,9 | 58,5 | 57,0 | Apache-2.0 | Hugging Face |
| Alternativas especializadas en prediccion de acciones egocentricas | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa natural es contra el modelo base, del que parte: el ajuste gana en SEED-Bench-R1 y TempCompass a costa de una ligera perdida en el resto de benchmarks generales. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste degrada ligeramente el rendimiento general: TwiFF CoT cae 4,0 puntos, TemporalBench 1,4, Video-MME 0,3 y MVBench 0,5 respecto al base.
- Modelo especializado: esta entrenado para prediccion de proxima accion en videos egocentricos en formato cerrado; su uso como asistente general no esta validado.
- Requiere el system prompt exacto del entrenamiento y el formato `<reason>`/`<answer>`; usarlo de otra forma puede degradar la calidad de las respuestas.
- Riesgo de alucinacion: como VLM generativo, puede producir razonamientos plausibles pero incorrectos sobre lo que ocurre en el video, especialmente con clips fuera de la distribucion de EPIC-KITCHENS.
- Sesgos: los videos de entrenamiento provienen de EPIC-KITCHENS, centrados en tareas de cocina en primera persona; el modelo puede generalizar mal a otros dominios, entornos o demografias.
- Limitaciones de contexto: no se especifica la longitud de contexto; la evaluacion usa 32 fotogramas, y clips mas largos pueden degradar el rendimiento.
- Idiomas: no se documenta el soporte multilingue; se desconoce el comportamiento fuera del ingles.
- Licencia: los pesos son Apache-2.0, pero los datos de entrenamiento conservan sus propios terminos: SEED-Bench-R1 es Apache-2.0 y los videos de EgoPlan-IT provienen de EPIC-KITCHENS (CC BY-NC 4.0, no comercial). Esto puede condicionar el uso comercial derivado del entrenamiento.
- Reproducibilidad: las cifras publicadas corresponden a una sola semilla (la 32); la variabilidad entre semillas es de aproximadamente 1 punto en SEED-Bench-R1.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsun39/Future-OPSD-Qwen3.5-9B-EgoPlan-IT
- Codigo: https://github.com/Jingchensun/future-opsd
- Pagina del proyecto: https://jingchensun.github.io/future-opsd/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de evaluacion: https://huggingface.co/datasets/TencentARC/SEED-Bench-R1
