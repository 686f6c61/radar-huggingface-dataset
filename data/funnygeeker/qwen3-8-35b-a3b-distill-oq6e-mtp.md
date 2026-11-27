# funnygeeker/Qwen3.8-35B-A3B-Distill-oQ6e-mtp

## Resumen

Qwen3.8-35B-A3B-Distill-oQ6e-mtp es una cuantización de precisión mixta en formato MLX del modelo empero-ai/Qwen3.8-35B-A3B-Distill, un transformer de arquitectura MoE (mixture of experts) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según indica el sufijo A3B del nombre. Lo publica el usuario funnygeeker y está pensado para su ejecución en hardware Apple Silicon mediante la librería MLX, no para GPUs NVIDIA ni para despliegues con vLLM o TGI.

El modelo base es un destilado de la familia Qwen 3.8, con soporte declarado de chino, inglés y japonés. Esta versión concreta aplica cuantización mixta de 6 bits con tamaño de grupo 64 mediante la herramienta oQ (oMLX v0.7.0.dev2), que asigna distinto número de bits a distintas capas según su sensibilidad, en lugar de aplicar un esquema uniforme. El resultado ocupa 30,1 GB en el repositorio y se distribuye en safetensors compatibles con MLX.

Su relevancia es acotada pero práctica: permite ejecutar un MoE de 35B en un Mac con memoria unificada suficiente (del orden de 32 GB o más), manteniendo una calidad cercana al modelo original de 6 bits. El sufijo mtp sugiere soporte de multi-token prediction, aunque la model card no lo documenta explícitamente. La licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo qwen3_5_moe) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones (según nomenclatura A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits, precisión mixta, group size 64 |
| Idiomas soportados | Chino, inglés, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (no GGUF) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), identificada en los metadatos como qwen3_5_moe. Con 35.951.822.704 parámetros totales y una activación estimada de 3.000 millones por token, el modelo sigue el patrón habitual de los MoE recientes de Qwen: un router selecciona un subconjunto de expertos por capa, de modo que el coste computacional por token se aproxima al de un modelo denso de 3B mientras la capacidad de representación corresponde a un modelo mucho mayor. No se dispone de información sobre el número de expertos, el número de expertos activados ni la dimensión oculta.

El modelo base es un destilado (empero-ai/Qwen3.8-35B-A3B-Distill), pero la model card de esta cuantización no detalla el dataset de destilación, el número de tokens de entrenamiento, la composición de los datos ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia cuantización mixta de oQ, que ajusta la precisión por capa para minimizar la degradación. El sufijo mtp del nombre apunta a multi-token prediction, una técnica de decodificación especulativa que permite predecir varios tokens por paso, pero no hay confirmación ni detalles técnicos en la información disponible.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen 3.8 destilado.
- Soporte multilingüe declarado para chino, inglés y japonés.
- Capacidad de código y matemáticas presumible por la familia base, aunque no verificada en esta ficha.
- Posible soporte de multi-token prediction (mtp) según el nombre del repositorio, no documentado en la model card.
- Ejecución nativa en Apple Silicon mediante MLX, con cuantización de 6 bits.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Inferencia local en Mac: el modelo está empaquetado en MLX safetensors de 6 bits y 30,1 GB, por lo que se puede ejecutar en un Mac con memoria unificada de 32 GB o más usando la librería MLX, sin necesidad de GPU dedicada.
- Prototipado de asistentes multilingües: al cubrir chino, inglés y japonés, sirve para probar flujos de conversación en esos tres idiomas en un entorno de desarrollo local antes de escalar a infraestructura de producción.
- Evaluación de cuantizaciones: al ser una versión oQ6e, es útil para comparar la degradación de calidad frente al modelo base de 6 bits uniforme en tareas de razonamiento y generación.
- Desarrollo de aplicaciones de escritorio para macOS: la integración con MLX permite incrustar el modelo en apps nativas de Apple sin depender de servicios en la nube.
- Experimentación con MoE de gran tamaño en hardware de consumo: con 35B totales y ~3B activos, el coste por token es bajo, lo que facilita pruebas de latencia y throughput en un solo equipo.
- Investigación sobre destilación: al ser un destilado de Qwen 3.8, puede usarse como referencia para estudiar cómo se comportan modelos destilados cuantizados frente a sus originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 30,1 GB solo para los pesos; en la práctica se recomienda un Mac con 32 GB de memoria unificada como mínimo, y 48-64 GB para contexto largo y margen de trabajo.
- GPU recomendadas: Apple Silicon (series M1 Pro/Max, M2 Pro/Max/Ultra, M3 Pro/Max/Ultra, M4 Pro/Max). No es compatible de forma nativa con CUDA.
- Cabe en GPU de consumo: sí, en Apple Silicon con memoria unificada suficiente; no en GPUs NVIDIA de 24 GB por el tamaño de los pesos en 6 bits.
- Opciones de despliegue: MLX y oMLX (herramienta de cuantización del autor); no se distribuye en GGUF, por lo que llama.cpp y Ollama no son aplicables directamente sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill-oQ6e-mtp | 35.951.822.704 | no disponible | Apache 2.0 | MLX safetensors 6 bits | Hugging Face (209 descargas) |
| empero-ai/Qwen3.8-35B-A3B-Distill (base) | 35.951.822.704 (presumible) | no disponible | no disponible | safetensors sin cuantizar | Hugging Face |
| Otras cuantizaciones del mismo base | 35.951.822.704 | no disponible | Apache 2.0 (presumible) | GGUF, MLX, etc. | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no documenta contexto, dataset de entrenamiento, benchmarks ni limitaciones conocidas.
- Al ser una cuantización de 6 bits con precisión mixta, puede presentar degradación frente al modelo base en tareas sensibles a la precisión numérica, como matemáticas o código.
- El soporte idiomático se limita a chino, inglés y japonés según los metadatos; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de evaluación publicada.
- La licencia Apache 2.0 permite uso comercial, pero al ser un destilado de un modelo Qwen conviene verificar las condiciones del modelo base original.
- El formato MLX limita el despliegue a hardware Apple; no es directamente utilizable en servidores con GPU NVIDIA sin conversión.
- El repositorio tiene muy poca tracción (209 descargas, 1 like) y fue creado en septiembre de 2026, por lo que carece de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/funnygeeker/Qwen3.8-35B-A3B-Distill-oQ6e-mtp
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
