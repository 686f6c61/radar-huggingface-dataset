# jbowman512/Qwen3.8-27B-unsycophantic-NVFP4

## Resumen

Qwen3.8-27B-unsycophantic-NVFP4 es una cuantizacion NVFP4 del modelo jbowman512/Qwen3.8-27B-unsycophantic, un derivado afinado del Qwen3.8-27B de Qwen con un sesgo deliberado hacia la no adulacion (no-sycophancy), es decir, que el modelo mantiene su postura ante premisas falsas en lugar de plegarse al usuario. La cuantizacion la firma jbowman512 usando NVIDIA Model Optimizer 0.48.0, y reduce el checkpoint de 51,8 GB en bf16 a 19,2 GB en disco.

El modelo es de tipo image-text-to-text (vision-language) y esta construido sobre la arquitectura Qwen3.5, que combina capas de atencion con Gated DeltaNet, e incluye una cabeza MTP (multi-token prediction) para decodificacion especulativa. Los safetensors declaran 15.193.246.960 parametros, un dato que no coincide con el nombre "27B" del modelo base, probablemente porque el recuento corresponde a los tensores efectivamente almacenados (incluyendo pesos cuantizados y compartidos) y no al total nominal del modelo.

La relevancia practica de esta ficha esta en que es una de las primeras cuantizaciones NVFP4 publicas de un VLM denso de la familia Qwen3, pensada para servir en GPUs Blackwell con vLLM, con cache KV en FP8 y decodificacion especulativa MTP activada. El autor advierte explicitamente que NVIDIA solo valida NVFP4 para los modelos MoE de Qwen3.5, no para el modelo denso vision-language, y que no se probo la entrada de imagenes ni se ejecutaron benchmarks comparativos contra bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con Gated DeltaNet y cabeza MTP (vision-language, image-text-to-text) |
| Parametros totales | 15.193.246.960 (segun safetensors); el modelo base se denomina "27B" |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones, group size 16) en capas lineales del LM; KV cache FP8 (e4m3); bf16 en vision encoder, lm_head, embeddings, conv1d/in_proj_a/in_proj_b de Gated DeltaNet y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); compatible con vLLM (`modelopt_fp4`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5 aplicada a un modelo vision-language: un tronco transformer con capas de atencion hibridas que incluyen Gated DeltaNet (una variante de atencion lineal con estado recurrente compuerta), un encoder visual separado en bf16 y una cabeza MTP para prediccion multi-token. La cuantizacion NVFP4 se aplica solo a las capas lineales del modelo de lenguaje, con pesos y activaciones en FP4 y group size 16; el resto de componentes criticos (vision encoder, embeddings, lm_head, parametros de la Gated DeltaNet y cabeza MTP) se mantienen en bf16 para preservar calidad.

El proceso de cuantizacion se hizo con NVIDIA Model Optimizer 0.48.0 mediante post-training quantization (PTQ), con calibracion sobre 512 muestras de 512 tokens extraidas del mix por defecto de Model Optimizer (`abisee/cnn_dailymail` y `nvidia/Nemotron-Post-Training-Dataset-v2`). La cabeza MTP no venia incluida en el checkpoint del modelo base (guardado via transformers, que no carga esa cabeza); este repo anade los 15 tensores `mtp.*` sin modificar desde Qwen/Qwen3.8-27B en bf16, dentro de `model-mtp.safetensors`. Dado que la decodificacion especulativa verifica cada token borrador contra el modelo principal, la cabeza MTP afecta solo la velocidad, no la salida. No se dispone de informacion sobre el dataset de entrenamiento original del modelo base ni sobre si hubo RLHF/DPO en el proceso de no-sycophancy.

## Capacidades

- Generacion de texto conversacional multi-turno, con respuestas factuales, de codigo y de ingenieria segun las pruebas del autor.
- Razonamiento y resistencia a la adulacion: mantiene el rechazo a aceptar premisas falsas, comportamiento heredado del modelo base unsycophantic.
- Procesamiento de imagen y texto (pipeline image-text-to-text), aunque el autor no probo la entrada de imagenes en esta cuantizacion.
- Generacion de codigo y respuestas tecnicas de ingenieria (verificado en pruebas de chat).
- Decodificacion especulativa via cabeza MTP con 5 tokens borrador, integrada en vLLM.
- Razonamiento con parser dedicado (`--reasoning-parser qwen3` en vLLM), lo que sugiere soporte de modo de razonamiento estructurado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistencia tecnica y revision de codigo: el modelo responde a prompts de codigo e ingenieria de forma coherente y mantiene postura ante premisas erroneas, lo que lo hace adecuado para revisiones donde el usuario afirma algo incorrecto y se espera correccion en lugar de complacencia.
- Despliegue en produccion con vLLM sobre GPU Blackwell: al cargar en 19,5 GiB de VRAM en una RTX PRO 6000 (96 GB), permite servir el modelo con cache KV FP8 y decodificacion especulativa MTP, reduciendo coste por token frente a bf16.
- Evaluacion de robustez frente a adulacion: util como modelo de referencia en pruebas de sesgo de complacencia, comparando respuestas ante premisas falsas con el modelo base y con variantes sycophantic.
- Analisis de documentos con imagen y texto: el pipeline image-text-to-text permite procesar capturas, diagramas o paginas escaneadas junto a instrucciones textuales, aunque esta capacidad no fue validada en esta cuantizacion concreta.
- Prototipado de asistentes conversacionales con contexto largo: la arquitectura Qwen3.5 con Gated DeltaNet esta pensada para manejar contextos extensos, si bien la longitud exacta de ventana no esta documentada en esta ficha.
- Investigacion sobre cuantizacion NVFP4: el repo incluye el comando exacto de reproduccion con Model Optimizer, lo que permite estudiar el impacto de NVFP4 en un VLM denso y comparar con el modelo bf16.
- Servicio de inferencia en entornos con VRAM limitada dentro de gama profesional: 19,2 GB en disco y 19,5 GiB en GPU lo hacen viable en tarjetas profesionales Blackwell de 48-96 GB, no en GPUs consumer convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no ejecuto comparativas de benchmark contra el modelo bf16. Los unicos datos de rendimiento reportados son operativos: carga en 19,5 GiB de VRAM en una RTX PRO 6000 Blackwell (96 GB) con vLLM 0.32.0, y una tasa de aceptacion del 41 % de tokens borrador con MTP y 5 tokens especulativos (aproximadamente 3 tokens por paso de decodificacion).

## Requisitos de hardware

- VRAM estimada: 19,5 GiB en GPU para el checkpoint completo en NVFP4 con cache KV FP8, medido en RTX PRO 6000 Blackwell.
- GPU recomendadas: NVIDIA Blackwell con compute capability 10.x o 12.x (por ejemplo RTX PRO 6000 Blackwell, B200, GB200); NVFP4 requiere hardware Blackwell y no funciona en Ampere, Hopper ni Ada.
- Cabe en GPU consumer: no disponible; las GPUs consumer Blackwell de gama baja no estan documentadas como compatibles y 19,5 GiB supera la VRAM de la mayoria de tarjetas consumer.
- Opciones de despliegue: vLLM 0.32.0 (recomendado, lee `modelopt_fp4` y KV FP8 del checkpoint sin flag `--quantization`); transformers 5.18.0 para carga; llama.cpp, Ollama y TGI no estan documentados como compatibles con NVFP4 en esta ficha.
- Latencia y throughput: no disponibles de forma absoluta; se conoce una aceptacion del 41 % de tokens borrador con MTP (5 tokens especulativos), lo que equivale a aproximadamente 3 tokens generados por paso de decodificacion.
- Nota de compilacion: si vLLM compila el kernel FlashInfer FP4 GEMM al primer arranque (instalacion sin `flashinfer-jit-cache`), conviene fijar `MAX_JOBS=4` para evitar agotar la RAM del host durante la compilacion CUTLASS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jbowman512/Qwen3.8-27B-unsycophantic-NVFP4 | 15.193.246.960 (safetensors) | no disponible | NVFP4 + KV FP8 | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| jbowman512/Qwen3.8-27B-unsycophantic (bf16) | no disponible (51,8 GB en disco) | no disponible | bf16 | Apache 2.0 | Hugging Face (modelo base) |
| Qwen/Qwen3.8-27B | no disponible | no disponible | bf16 | no disponible en esta ficha | Hugging Face (modelo original) |

No se dispone de datos de rendimiento comparativo entre estas variantes; el autor no ejecuto benchmarks contra bf16. La comparativa se limita a tamano en disco, formato de pesos y origen de la cabeza MTP.

## Limitaciones y advertencias

- La cuantizacion NVFP4 esta validada por NVIDIA para modelos MoE de Qwen3.5, no para el modelo denso vision-language Qwen3.5; el autor lo senala como caveat explicito.
- No se probo la entrada de imagenes en esta cuantizacion, pese a que el pipeline declarado es image-text-to-text; la calidad del encoder visual en este checkpoint es desconocida.
- No hay benchmarks comparativos contra bf16, por lo que la perdida de calidad por cuantizacion no esta cuantificada.
- Requiere GPU Blackwell (compute capability 10.x o 12.x); no es desplegable en Ampere, Hopper ni Ada.
- La cabeza MTP se toma del modelo original Qwen/Qwen3.8-27B, no del modelo unsycophantic afinado; afecta solo velocidad, no salida, pero introduce una dependencia externa.
- El mix de calibracion por defecto incluye `nvidia/Nemotron-Post-Training-Dataset-v2`, que esta gated; la reproduccion exige solicitar acceso.
- Sesgos conocidos: no disponibles en la informacion proporcionada; el modelo base esta disenado para reducir la adulacion, lo que puede producir respuestas mas directas o menos complacientes de lo esperado en contextos comerciales.
- Riesgo de alucinacion: no cuantificado en esta ficha.
- Idiomas soportados: no disponibles; no hay garantia documentada de cobertura multilingue.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del modelo original Qwen3.8-27B antes de produccion.
- Repo con 0 descargas y 0 likes: ecosistema de validacion muy limitado, sin evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jbowman512/Qwen3.8-27B-unsycophantic-NVFP4
- Modelo base (bf16): https://huggingface.co/jbowman512/Qwen3.8-27B-unsycophantic
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Dataset de calibracion (gated): https://huggingface.co/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset de calibracion secundario: https://huggingface.co/datasets/abisee/cnn-dailymail
