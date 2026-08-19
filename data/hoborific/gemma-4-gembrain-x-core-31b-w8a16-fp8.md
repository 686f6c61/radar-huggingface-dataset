# hoborific/Gemma-4-Gembrain-X-Core-31B-W8A16-FP8

## Resumen

El modelo `hoborific/Gemma-4-Gembrain-X-Core-31B-W8A16-FP8` es una versión cuantizada en formato W8A16 FP8 del modelo base `Nimbz/Gemma-4-Gembrain-X-Core-31B`, un finetune comunitario de Google Gemma 4 31B orientado a razonamiento, chat multimodal, escritura expresiva y roleplay. La cuantización ha sido realizada offline mediante la librería `compressed-tensors` de Neural Magic, aplicando pesos en `float8_e4m3fn` con escalas por canal de salida y activaciones en bf16/fp16, lo que reduce el uso de memoria y acelera la inferencia en hardware compatible.

Este modelo resuelve el problema de desplegar un modelo multimodal de 31 000 millones de parámetros en entornos con recursos limitados, manteniendo la calidad del modelo original gracias a un esquema de cuantización por canal con búsqueda de recorte (MSE clip search). Está pensado para su uso con vLLM en plataformas Intel XPU y NVIDIA CUDA (SM75+), aunque no es compatible con ROCm, CPU o TPU. El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente y sin adopción conocida.

Al tratarse de una cuantización, conserva las capacidades del modelo base: procesamiento de imágenes y texto (pipeline `image-text-to-text`), generación de texto conversacional, razonamiento y escritura creativa. No se dispone de información sobre licencia, idiomas soportados ni longitud de contexto, por lo que estos campos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Gemma 4 31B) |
| Parametros totales | 31 273 088 876 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en `float8_e4m3fn`, activaciones en bf16/fp16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (con `compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo base `Nimbz/Gemma-4-Gembrain-X-Core-31B` es un finetune comunitario de Google Gemma 4 31B, creado mediante mergekit (según la model card del autor). No se han publicado detalles sobre la arquitectura interna del modelo base más allá de que es un transformer multimodal capaz de procesar imágenes y texto. La cuantización aplicada en este repositorio se realiza offline con `compressed-tensors` en formato `float-quantized`: cada capa lineal 2D (atención q/k/v/o y MLP gate/up/down) se cuantiza con pesos en `float8_e4m3fn` y escalas simétricas por canal de salida, optimizadas mediante una búsqueda de recorte sobre ~9 fracciones de `amax` (0.8–1.0) para minimizar el error cuadrático medio. Los embeddings, normas, `lm_head`, routers/experts y la torre de visión se mantienen en bf16 y se excluyen explícitamente de la cuantización mediante la lista `ignore` del checkpoint.

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). El proceso de cuantización no implica entrenamiento adicional, solo la conversión de pesos.

## Capacidades

- Generación de texto conversacional y creativo, con especial énfasis en roleplay y escritura expresiva (según la descripción del modelo base).
- Razonamiento multi-step y capacidad de seguir instrucciones complejas.
- Procesamiento multimodal de imágenes y texto (pipeline `image-text-to-text`), lo que permite responder a entradas visuales.
- Soporte para chat multimodal y diálogos de múltiples turnos.
- No se ha confirmado soporte para tool calling, function calling o agentes autónomos; no hay información al respecto.
- Capacidades multilingües no documentadas.

## Casos de uso

- Asistente de escritura creativa: el modelo puede generar narraciones, diálogos y descripciones expresivas, aprovechando su finetune para roleplay y escritura literaria. Se usaría con prompts que especifiquen estilo, tono y contexto.
- Chatbot conversacional multimodal: al aceptar imágenes, puede mantener conversaciones donde el usuario comparte capturas o fotos y el modelo responde con texto contextualizado. Adecuado para aplicaciones de atención al cliente con soporte visual.
- Generación de descripciones de imágenes: dado un input visual, el modelo produce texto descriptivo o analítico, útil para accesibilidad o catalogación de contenidos.
- Prototipado rápido de aplicaciones de IA generativa: gracias a su tamaño reducido en FP8, puede desplegarse en una GPU con 40 GB de VRAM para pruebas de concepto sin necesidad de infraestructura de gran escala.
- Investigación en cuantización y eficiencia: al ser un ejemplo de cuantización W8A16 FP8 con `compressed-tensors`, sirve como referencia para estudiar el impacto de la cuantización por canal en modelos multimodales de 31B.
- Entornos de inferencia con vLLM en Intel XPU: diseñado específicamente para el kernel `XPUW8A16FP8LinearKernel`, puede integrarse en pipelines de servidores que utilicen hardware Intel, ofreciendo una alternativa a GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo cuantizado ni para el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 33 GB para los pesos en FP8/bf16, más overhead de activaciones y contexto. Se recomienda una GPU con al menos 40 GB de VRAM para una ventana de contexto moderada.
- GPU recomendadas: NVIDIA A100 40 GB, A100 80 GB, H100, RTX 4090 24 GB (aunque con limitaciones de contexto), o Intel XPU compatible con vLLM.
- En consumer GPU: la RTX 4090 (24 GB) podría cargar el modelo con cuantización adicional o usando offloading, pero no es ideal. Una RTX 3090 (24 GB) o RTX 4080 (16 GB) no son suficientes sin técnicas de memoria compartida.
- Opciones de despliegue: vLLM (con kernels específicos para XPU y CUDA), potencialmente con `llama.cpp` si se convierte a GGUF, aunque no se proporciona soporte oficial.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la longitud de contexto y el número de canales de atención.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. Como referencia, el modelo base `Nimbz/Gemma-4-Gembrain-X-Core-31B` tiene los mismos parámetros y capacidades, pero sin cuantizar (pesos en bf16, tamaño aproximado de 62 GB). Otras cuantizaciones del mismo modelo, como la versión GGUF (`Nimbz/Gemma-4-Gembrain-X-Core-31B-GGUF`), ofrecen formatos más flexibles para CPU y GPUs de menor VRAM, pero con menor precisión. No se conocen modelos comparables de la misma categoría (finetune multimodal de 31B con cuantización FP8) con datos públicos de rendimiento.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos o alucinaciones; al ser un finetune comunitario, es probable que herede los sesgos del modelo base Gemma 4, pero no hay documentación al respecto.
- La licencia no está especificada, lo que impide conocer restricciones de uso comercial o distribución. Se recomienda contactar con el autor antes de usar en producción.
- El modelo solo es compatible con vLLM en NVIDIA CUDA (SM75+) e Intel XPU; no funciona en ROCm, CPU o TPU, lo que limita su portabilidad.
- La cuantización W8A16 FP8 puede degradar ligeramente la calidad en tareas de alta precisión, aunque el autor indica que el esquema por canal con recorte ofrece mejor SNR que la cuantización online de vLLM.
- La longitud de contexto y los idiomas soportados no están documentados, por lo que no se puede garantizar un rendimiento multilingüe o de contexto largo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido probado por la comunidad; se recomienda validar el modelo en un entorno de prueba antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hoborific/Gemma-4-Gembrain-X-Core-31B-W8A16-FP8
- Modelo base: https://huggingface.co/Nimbz/Gemma-4-Gembrain-X-Core-31B
- Versión GGUF del modelo base: https://huggingface.co/Nimbz/Gemma-4-Gembrain-X-Core-31B-GGUF
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Página del modelo en Routeway: https://routeway.ai/models/gemma-4-31b-gembrain-x-core
- Página del modelo en NanoGPT: https://nano-gpt.com/models/text/Gemma-4-31B-Gembrain-X-Core
