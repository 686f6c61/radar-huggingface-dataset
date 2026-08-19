# hoborific/Omega-Evolution-31B-v4.5-W8A16-FP8

## Resumen

Omega-Evolution-31B-v4.5-W8A16-FP8 es una versión cuantizada del modelo base ReadyArt/Omega-Evolution-31B-v4.5, publicada por el usuario hoborific en HuggingFace. Se trata de un modelo de tipo imagen-texto a texto (pipeline `image-text-to-text`) que, según las etiquetas del repositorio, está construido sobre la arquitectura Gemma 4, aunque no se proporciona confirmación oficial en la documentación disponible. La cuantización emplea el formato W8A16 FP8 (pesos en `float8_e4m3fn` con escalas simétricas por canal de salida, activaciones en bf16/fp16) mediante la librería `compressed-tensors` de Neural Magic.

El objetivo principal de esta release es permitir el despliegue eficiente del modelo en entornos de producción con vLLM, especialmente en hardware Intel XPU (el destino previsto) y NVIDIA CUDA (Turing o superior). El checkpoint incluye 31.273 millones de parámetros y un tamaño de repositorio de 33,3 GB, lo que lo sitúa en la gama de modelos grandes de código abierto. Su relevancia radica en que ofrece una alternativa cuantizada lista para usar en servidores de inferencia, con kernels específicos para dos plataformas de aceleración, aunque no se han publicado métricas de rendimiento ni detalles de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4` sugiere familia Gemma 4, sin confirmar) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos `float8_e4m3fn`, escalas por canal, activaciones bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base v4.0 usaba Apache-2.0, pero no se confirma para v4.5) |
| Formato de pesos | safetensors (checkpoint con lista `ignore` para capas no cuantizadas) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (número de capas, tipo de atención, mecanismos de mezcla de expertos, etc.) ni sobre su proceso de entrenamiento (tokens, dataset, técnicas de alineación como RLHF o DPO). La model card del checkpoint cuantizado se centra exclusivamente en el procedimiento de cuantización: para cada capa lineal 2D (proyecciones de atención q/k/v/o y MLP gate/up/down), se calcula una escala por canal de salida a partir de `amax / 448`, refinada mediante una búsqueda de error cuadrático medio sobre aproximadamente 9 fracciones de clip (0,8–1,0× amax). Los pesos se cuantizan con redondeo al más cercano y saturación. Las capas de embeddings, normas, lm_head, routers/expertos y la torre de visión permanecen en bf16 y se listan en la clave `ignore` del checkpoint para que vLLM no las toque.

Esta estrategia de cuantización por canal con búsqueda de clip proporciona, según el autor, una mejor relación señal-ruido que la cuantización online por tensor de vLLM (`--quantization fp8`). No se mencionan innovaciones en la arquitectura del modelo base ni detalles de entrenamiento adicionales.

## Capacidades

- Modelo multimodal (imagen-texto a texto) según el pipeline declarado, aunque no se detallan las tareas específicas de visión que soporta.
- Conversacional: etiquetado como `conversational`, apto para diálogos multi-turno.
- Compatible con endpoints de inferencia (`endpoints_compatible`).
- Cuantización W8A16 FP8 que permite inferencia con menor huella de memoria que el modelo original en bf16.
- Soporte de kernels específicos en vLLM para Intel XPU (`XPUW8A16FP8LinearKernel`) y NVIDIA CUDA (`HummingFP8ScaledMMLinearKernel` o `MarlinFP8ScaledMMLinearKernel`).
- No se confirman capacidades como tool calling, agentes, razonamiento multi-paso ni soporte multilingüe.

## Casos de uso

- Despliegue de un asistente conversacional multimodal en producción: al estar cuantizado en FP8, el modelo puede servirse con vLLM en GPUs NVIDIA o Intel XPU, reduciendo el consumo de VRAM frente a la versión bf16 y manteniendo activaciones de alta precisión.
- Inferencia de imagen a texto en entornos con restricciones de memoria: la cuantización W8A16 permite ejecutar el modelo en hardware con menos VRAM que el checkpoint original, aunque se requieren GPUs de gama alta por el tamaño total.
- Evaluación de la calidad de cuantización FP8 frente al modelo base: investigadores pueden comparar las salidas del checkpoint cuantizado con las del original para medir la degradación introducida por la compresión.
- Integración en pipelines de vLLM sobre Intel XPU: es el destino principal del kernel `XPUW8A16FP8LinearKernel`, lo que lo hace adecuado para entornos que ya usan aceleradores Intel.
- Pruebas de compatibilidad de kernels FP8 en NVIDIA: sirve como caso de prueba para `HummingFP8ScaledMMLinearKernel` o `MarlinFP8ScaledMMLinearKernel` en GPUs Turing o más nuevas.
- Fine-tuning o adaptación posterior a la cuantización: aunque el checkpoint está listo para inferencia, los pesos en safetensors permiten cargarlos en transformers para experimentos de ajuste fino con capas adicionales (las capas cuantizadas no se actualizan directamente).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint cuantizado ni para el modelo base ReadyArt/Omega-Evolution-31B-v4.5.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del repositorio es de 33,3 GB, lo que sugiere que los pesos FP8 ocupan aproximadamente 31 GB (31.273M × 1 byte) más escalas y metadatos. Con overhead de activaciones y KV cache, se recomienda al menos 40 GB de VRAM para una ventana de contexto moderada. No se dispone de cifras oficiales.
- GPU recomendadas: NVIDIA A100 40GB, A100 80GB, H100, RTX 6000 Ada o similar; también Intel XPU con soporte para el kernel W8A16FP8. No cabe en GPUs de consumo típicas (RTX 4090 tiene 24 GB, insuficiente para el modelo completo).
- Si cabe en consumer GPU: no, salvo que se use cuantización adicional (por ejemplo, GGUF de menor precisión) que no está disponible en este repositorio.
- Opciones de despliegue: vLLM (con kernels específicos para XPU y CUDA), transformers (carga estándar), y cualquier framework que soporte `compressed-tensors`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base ReadyArt/Omega-Evolution-31B-v4.5 no tiene una ficha técnica pública con especificaciones detalladas, y no se conocen alternativas cuantizadas del mismo tamaño con el mismo formato W8A16 FP8. Se podría comparar con el checkpoint original en bf16 (mismo modelo, sin cuantizar), pero no hay datos de rendimiento de ninguno de los dos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La cuantización W8A16 FP8 puede introducir una ligera degradación en la calidad de las respuestas respecto al modelo original en bf16, especialmente en tareas de alta sensibilidad numérica o razonamiento.
- vLLM no soporta este formato en ROCm, CPU ni TPU; intentar cargar el modelo en esos backends producirá un error de kernel no encontrado.
- El modelo no está pensado para ejecutarse en GPUs de consumo (VRAM insuficiente) sin cuantizaciones adicionales no proporcionadas.
- No se han publicado evaluaciones de sesgos, alucinaciones ni seguridad del modelo base; al ser un modelo de la familia Gemma 4, podría heredar sesgos de los datos de entrenamiento, pero no hay confirmación.
- La licencia no está especificada en el repositorio; aunque el modelo base v4.0 usaba Apache-2.0, no se puede asumir para v4.5. Se debe contactar con el autor antes de un uso comercial.
- El pipeline `image-text-to-text` sugiere capacidades multimodales, pero no se documentan los detalles de la torre de visión ni el preprocesado de imágenes, lo que dificulta su uso directo en aplicaciones de visión.

## Enlaces

- Repositorio del checkpoint cuantizado: https://huggingface.co/hoborific/Omega-Evolution-31B-v4.5-W8A16-FP8
- Modelo base: https://huggingface.co/ReadyArt/Omega-Evolution-31B-v4.5
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Modelo base v4.0 (referencia de licencia, no confirmada para v4.5): https://huggingface.co/ReadyArt/Omega-Evolution-31B-v4.0
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
