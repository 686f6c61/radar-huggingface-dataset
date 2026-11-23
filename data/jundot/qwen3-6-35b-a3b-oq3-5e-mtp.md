# Jundot/Qwen3.6-35B-A3B-oQ3.5e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ3.5e-mtp es una cuantizacion mixta de precision del modelo Qwen/Qwen3.6-35B-A3B, un modelo de lenguaje y vision de tipo mixture-of-experts (MoE) desarrollado por el equipo Qwen de Alibaba. El checkpoint original combina 35.000 millones de parametros totales con solo 3.000 millones activos por token, lo que permite inferencia a coste computacional de un modelo de 3B manteniendo la capacidad representacional de uno de 35B. La arquitectura emplea una disposicion hibrida de capas Gated DeltaNet y Gated Attention, e incorpora un encoder de vision y una cabeza de prediccion multi-token (MTP).

Esta version concreta, publicada por el usuario Jundot, aplica el metodo oQ de cuantizacion mixta (oMLX v0.8.0) para comprimir el checkpoint original a unos 4,17 bits efectivos por peso, reduciendo el repositorio a 18,8 GB. La distribucion de bits se asigna por sensibilidad medida de cada capa, combinando grupos de 3, 4, 5, 6 y 8 bits con remanentes en BF16, y aplica una matriz de importancia y un reajuste ponderado de escala y sesgo para minimizar el error de cuantizacion.

Su relevancia practica es doble: por un lado, demuestra que un MoE multimodal de 35B puede caber en memoria unificada de equipos Apple Silicon gracias al formato MLX; por otro, preserva el encoder de vision y la cabeza MTP, de modo que la cuantizacion no sacrifica capacidades multimodales ni decodificacion especulativa. La licencia Apache-2.0 heredada del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con capas Gated DeltaNet y Gated Attention; encoder de vision y cabeza MTP |
| Parametros totales | 35.951.822.704 (35,952B) |
| Parametros activos | 3B (aproximadamente 3.000 millones, segun el nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta oQ3.5e: affine 3-bit grupo 64, 4-bit grupo 64, 5-bit grupo 128, 6-bit grupo 64, 8-bit grupo 128, 8-bit grupo 64 y BF16; 4,171 bits/weight efectivos en el checkpoint completo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), libreria mlx; 18,8 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE multimodal con 35,952B parametros totales y unos 3B activos por token. Su columna vertebral combina capas Gated DeltaNet (un mecanismo de atencion lineal con estado recurrente) y capas Gated Attention clasicas, una disposicion hibrida habitual en la familia Qwen3.5/3.6 para reducir el coste de atencion en contextos largos. El checkpoint incluye tres componentes: el backbone de lenguaje (34,661B parametros logicos), un encoder de vision (0,447B) y una cabeza de prediccion multi-token MTP (0,845B), que habilita decodificacion especulativa entrenada de forma nativa.

La cuantizacion oQ3.5e de esta ficha no reentrena el modelo: asigna bits por sensibilidad medida de capa, calcula una matriz de importancia con 128 muestras de 512 tokens y reajusta escala y sesgo mediante minimos cuadrados ponderados. El resultado es una distribucion en la que el 60,7% de los pesos logicos quedan a 3 bits, el 32,9% a 4 bits y solo el 1,3% permanece en BF16, con un coste medio de 4,171 bits por peso. Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline image-text-to-text declarado.
- Comprension de imagenes y respuestas multimodales, al conservar el encoder de vision en el checkpoint cuantizado.
- Razonamiento y respuesta a instrucciones, heredados del modelo base Qwen3.6.
- Decodificacion especulativa mediante la cabeza MTP incluida, que acelera la generacion al proponer varios tokens por paso.
- Eficiencia de inferencia tipo MoE: solo se activan aproximadamente 3B parametros por token.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint MLX de 18,8 GB cabe en la memoria unificada de un Mac con 24-32 GB, permitiendo ejecutar un MoE multimodal de 35B sin GPU dedicada y con solo 3B parametros activos por token.
- Asistentes multimodales de escritorio: al conservar el encoder de vision, el modelo puede responder preguntas sobre capturas de pantalla, documentos escaneados o fotografias dentro de una aplicacion nativa de macOS.
- Prototipado rapido de agentes conversacionales: la cabeza MTP acelera la decodificacion, lo que reduce la latencia percibida en bucles de razonamiento multi-paso durante el desarrollo.
- Generacion aumentada por recuperacion (RAG) con contexto largo: la combinacion de Gated DeltaNet y Gated Attention esta disenada para abaratar la atencion en secuencias largas, lo que resulta adecuado para inyectar documentos extensos en el prompt.
- Evaluacion de modelos en investigacion: al ser una cuantizacion mixta reproducible con oMLX, sirve para medir la degradacion de calidad frente al checkpoint BF16 original en tareas de vision-lenguaje.
- Despliegue en entornos con presupuesto de memoria ajustado: 4,17 bits/weight efectivos permiten servir el modelo en hardware donde el checkpoint original de mayor precision no cabria, manteniendo licencia Apache-2.0 para uso comercial.
- Experimentacion con decodificacion especulativa: la inclusion explicita de la cabeza MTP permite comparar estrategias de propuesta de tokens en pipelines MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 18,8 GB para cargar el checkpoint completo en MLX; en la practica se recomienda al menos 24 GB de memoria unificada para dejar margen al contexto y a la cache KV.
- GPU recomendadas: el formato es MLX, por lo que el objetivo natural son chips Apple Silicon (series M1 a M4, especialmente configuraciones con 24 GB o mas). Para GPU NVIDIA no hay pesos GGUF ni CUDA publicados en este repositorio.
- Cabe en GPU consumer: si, en equipos Apple con memoria unificada suficiente; no hay evidencia de que quepa en una RTX 4090 de 24 GB en este formato, ya que MLX no se ejecuta en CUDA.
- Opciones de despliegue: libreria mlx y el entorno oMLX del autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponible en la informacion proporcionada; la cabeza MTP y la activacion de solo 3B parametros por token apuntan a una decodificacion mas rapida que un modelo denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ3.5e-mtp (esta ficha) | 35,952B / ~3B | no disponible | MLX safetensors, 4,171 bits/weight | Apache-2.0 | Hugging Face, 485 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,952B / ~3B | no disponible | safetensors (BF16 u otra precision original) | Apache-2.0 | Hugging Face |
| Otras cuantizaciones MLX del mismo base | 35,952B / ~3B | no disponible | MLX safetensors | Apache-2.0 | no disponible en la informacion proporcionada |

La comparativa con alternativas de otros autores no esta disponible en la informacion proporcionada; la unica referencia contrastable es el checkpoint original del que deriva.

## Limitaciones y advertencias

- La cuantizacion a 4,171 bits/weight efectivos introduce error respecto al modelo BF16; el autor indica que la revision de 2026-11-19 reduce ese error, pero no se aportan metricas de degradacion.
- El 60,7% de los pesos logicos esta a 3 bits, lo que puede afectar especialmente a tareas sensibles a precision numerica o a matematicas exactas.
- Solo funciona con la libreria MLX y hardware Apple Silicon; no es desplegable directamente en CUDA, vLLM o llama.cpp.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion disponible; deben asumirse los del modelo base Qwen3.6.
- La longitud de contexto no esta especificada en la model card, por lo que no se puede garantizar un tamano concreto de ventana para produccion.
- El repositorio tiene solo 485 descargas y 2 likes, y el autor es un usuario individual; conviene validar la calidad frente al checkpoint oficial antes de usarlo en produccion.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y debe verificarse en el fichero LICENSE del repositorio.
- El checkpoint incluye vision y MTP; si un pipeline de despliegue no soporta estos componentes, parte del peso del repositorio quedara sin utilizar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ3.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio oMLX (herramienta de cuantizacion oQ): https://github.com/jundot/omlx
- Pull request de mejora de oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
