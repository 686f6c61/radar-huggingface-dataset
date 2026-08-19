# hoborific/Versipellis-31B-W8A16-FP8

## Resumen

Versipellis-31B-W8A16-FP8 es una version cuantizada del modelo Nimbz/Versipellis-31B, publicada por el usuario hoborific en HuggingFace. El modelo original es un transformer multimodal (image-text-to-text) de 31.273 millones de parametros, basado en la arquitectura Gemma 4, que acepta tanto imagenes como texto como entrada. Esta version cuantizada reduce el peso de las capas lineales a FP8 (float8_e4m3fn) con escalas simetricas por canal de salida, manteniendo las activaciones en bf16/fp16.

La cuantizacion se realizo offline con la libreria compressed-tensors de Neural Magic, en formato W8A16 FP8, y esta orientada principalmente a su despliegue en plataformas Intel XPU mediante vLLM, aunque tambien es compatible con GPUs NVIDIA (SM75+). El objetivo principal de esta version es reducir el uso de memoria y acelerar la inferencia en hardware compatible, sin necesidad de reentrenar el modelo.

El repositorio tiene un tamano de 38.4 GB y no se han registrado descargas ni likes en el momento de la consulta. La licencia, los idiomas soportados y la longitud de contexto no estan especificados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), image-text-to-text |
| Parametros totales | 31.273.088.876 (31,27 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (float8_e4m3fn) con escalas por canal, activaciones en bf16/fp16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Versipellis-31B es un transformer multimodal basado en Gemma 4, con un total de 31.273 millones de parametros. Acepta entradas de imagen y texto simultaneamente, lo que lo habilita para tareas de vision-lenguaje. El proceso de cuantizacion de esta version se aplico exclusivamente a las capas lineales 2D de proyeccion (attention q/k/v/o y MLP gate/up/down), mientras que embeddings, normas, lm_head, routers/experts y la torre de vision se mantienen en bf16.

La cuantizacion se realizo offline con el siguiente procedimiento: para cada capa lineal, cada fila de salida recibe una escala propia calculada a partir de `amax / 448`, refinada mediante una busqueda de recorte MSE sobre ~9 fracciones de clip (0.8–1.0× amax), seleccionando la escala con menor error por fila. Los pesos se cuantizan con redondeo al mas cercano y saturacion. Este esquema por canal con recorte proporciona una mejor relacion señal-ruido que la cuantizacion online por tensor de vLLM (`--quantization fp8`).

No se dispone de informacion sobre el entrenamiento del modelo original (datos, numero de tokens, tecnicas de alineamiento como RLHF o DPO).

## Capacidades

- Procesamiento multimodal: acepta imagenes y texto como entrada (image-text-to-text).
- Generacion de texto conversacional, segun la etiqueta `conversational`.
- Compatible con pipelines de transformers y endpoints de inferencia.
- Cuantizacion W8A16 FP8 que reduce el uso de memoria en comparacion con el modelo original en bf16.
- Soporte de despliegue en vLLM para Intel XPU y NVIDIA CUDA (SM75+).
- No se ha confirmado soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Despliegue en entornos Intel XPU: el modelo esta especificamente cuantizado para el kernel `XPUW8A16FP8LinearKernel` de vLLM, lo que permite ejecutar un LLM multimodal de 31 B en hardware Intel de ultima generacion con menor uso de memoria.
- Inferencia multimodal en GPU NVIDIA con memoria limitada: gracias a la cuantizacion FP8, el modelo puede ejecutarse en GPUs como RTX 4090 (24 GB) o A100 (40/80 GB) con un footprint de memoria reducido respecto al original.
- Aplicaciones de vision-lenguaje en produccion: al aceptar imagenes y texto, puede usarse para tareas como captioning de imagenes, respuesta a preguntas visuales o analisis de documentos escaneados.
- Sistemas conversacionales con entrada visual: el modelo puede mantener dialogos que incluyan referencias a imagenes proporcionadas por el usuario.
- Investigacion en cuantizacion FP8: sirve como ejemplo de aplicacion de compressed-tensors con cuantizacion W8A16 por canal y recorte MSE, util para estudiar el impacto de esta tecnica en modelos multimodales.
- Fine-tuning o adaptacion posterior: al estar en formato safetensors con compressed-tensors, puede servir como punto de partida para experimentos de quantization-aware training o distillation.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo cuantizado ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 33.3 GB segun LLM Explorer, lo que requiere una GPU con al menos 40 GB (A100, A6000) o dos GPUs de 24 GB en paralelo.
- GPU recomendadas: NVIDIA A100 40/80 GB, RTX 4090 (24 GB, posiblemente con offloading), o hardware Intel XPU compatible con vLLM.
- No cabe en GPUs de consumo con menos de 24 GB sin tecnicas de offloading a CPU.
- Opciones de despliegue: vLLM (con kernels especificos para XPU y CUDA), transformers con compressed-tensors, y potencialmente llama.cpp si se convierte a GGUF (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria. El modelo base Nimbz/Versipellis-31B no tiene benchmarks publicados en la informacion consultada, y no se han identificado modelos comparables con cuantizacion W8A16 FP8 especifica para Intel XPU en el mismo rango de parametros.

## Limitaciones y advertencias

- No soporta ROCm, CPU ni TPU: vLLM no dispone de kernels W8A16-FP8 para estos backends, por lo que la carga fallara con un error de kernel no disponible.
- La cuantizacion FP8 puede introducir una ligera perdida de precision respecto al modelo original en bf16, especialmente en tareas sensibles a pequenos detalles numericos.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma del modelo original.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial.
- El repositorio no tiene descargas ni likes, lo que sugiere que es una publicacion reciente o poco validada por la comunidad.
- La longitud de contexto no se ha publicado, lo que limita la planificacion de despliegues con ventanas largas.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hoborific/Versipellis-31B-W8A16-FP8
- Modelo base: https://huggingface.co/Nimbz/Versipellis-31B
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Otro modelo del mismo autor: https://huggingface.co/hoborific/G4-MeroMero-v2-31B-W8A16-FP8
- Ficha en LLM Explorer: https://llm-explorer.com/model/hoborific%2FG4-MeroMero-v2-31B-W8A16-FP8,3wrADyN2TMJ8VgO3UQmG8g
