# hoborific/Omega-Evolution-31B-v4.0-W8A16-FP8

## Resumen

Omega-Evolution-31B-v4.0-W8A16-FP8 es una versión cuantizada del modelo ReadyArt/Omega-Evolution-31B-v4.0, publicada por el usuario hoborific en Hugging Face. Se trata de un modelo multimodal (procesa imagen y texto) de aproximadamente 31 000 millones de parámetros, pensado para tareas conversacionales y de comprensión de imágenes. La cuantización emplea el formato W8A16 FP8 de compressed-tensors, donde los pesos se almacenan en precisión float8_e4m3fn con escalas simétricas por canal de salida, mientras que las activaciones se mantienen en bf16/fp16.

Esta versión cuantizada está orientada a despliegue eficiente en entornos de producción con vLLM, especialmente en hardware Intel XPU y NVIDIA CUDA (Turing o superior). El proceso de cuantización offline incluye una búsqueda de escalas por canal con ajuste de clip para minimizar el error, lo que mejora la relación señal-ruido frente a la cuantización en línea de vLLM. El repositorio incluye los pesos en formato safetensors y está etiquetado como compatible con endpoints y con la librería transformers.

La relevancia de este modelo radica en ofrecer una alternativa cuantizada de un modelo de 31B con capacidades multimodales, permitiendo su ejecución en GPUs con memoria limitada y en plataformas específicas como Intel XPU. Sin embargo, la información pública sobre el modelo base (arquitectura, datos de entrenamiento, benchmarks) es escasa, por lo que esta ficha se basa principalmente en los detalles de la cuantización y en las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (etiquetas sugieren "gemma4", sin confirmar) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos float8_e4m3fn, activaciones bf16/fp16) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Las etiquetas del repositorio incluyen "gemma4", lo que sugiere una posible relación con la familia Gemma 4, pero no se puede confirmar sin documentación oficial. El modelo es multimodal (image-text-to-text) y conversacional, según las etiquetas de Hugging Face.

El proceso de cuantización está bien documentado en la model card: se aplica a todas las capas lineales 2D (attention q/k/v/o y MLP gate/up/down), mientras que embeddings, normas, lm_head, routers/experts y la torre de visión permanecen en bf16. Cada fila de salida recibe una escala calculada a partir de `amax / 448`, refinada mediante una búsqueda de clip sobre ~9 fracciones (0.8–1.0× amax) para minimizar el error cuadrático medio. Los pesos se cuantizan con redondeo al más cercano y saturación.

No se dispone de información sobre los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se mencionan innovaciones arquitectónicas específicas del modelo base.

## Capacidades

- Procesamiento multimodal: el pipeline declarado es `image-text-to-text`, lo que indica capacidad para entender imágenes y generar texto asociado.
- Conversación: etiquetado como "conversational", apto para diálogos multi-turno.
- Cuantización eficiente: los pesos en FP8 permiten inferencia con menor uso de memoria y mayor throughput en hardware compatible.
- Compatibilidad con vLLM: kernels específicos para Intel XPU y NVIDIA CUDA (SM75+).
- No se dispone de información sobre tool calling, razonamiento multi-paso, generación de código o capacidades matemáticas específicas.

## Casos de uso

- Asistente multimodal en entornos empresariales: al aceptar entrada de imagen y texto, podría emplearse para describir imágenes, responder preguntas sobre documentos escaneados o apoyar tareas de accesibilidad visual. La cuantización FP8 reduce el coste de despliegue en GPUs de gama media.
- Chat conversacional con contexto visual: su naturaleza conversacional y multimodal lo hace adecuado para aplicaciones de atención al cliente donde el usuario adjunta capturas de pantalla o fotos. La ventana de contexto no está documentada, por lo que se recomienda validar su comportamiento en escenarios de diálogo largo.
- Inferencia en hardware Intel XPU: es uno de los pocos modelos cuantizados que ofrece soporte explícito para esta plataforma, lo que permite aprovechar aceleradores Intel en centros de datos o estaciones de trabajo.
- Prototipado rápido con vLLM: al estar en formato compressed-tensors, se integra directamente con vLLM sin conversión adicional, facilitando pruebas de concepto y despliegues en producción.
- Reducción de costes de inferencia: con 31B parámetros en FP8, el modelo requiere menos VRAM que su versión en bf16, lo que permite ejecutarlo en GPUs con 40 GB o menos (dependiendo de la longitud de contexto).
- Investigación en cuantización: el esquema de cuantización por canal con búsqueda de clip puede servir como referencia para estudios sobre pérdida de calidad en modelos multimodales grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para esta versión cuantizada ni para el modelo base.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan aproximadamente 31 GB (31 273 088 876 × 1 byte). Con activaciones en bf16 y overhead del runtime, se recomienda al menos 40 GB de VRAM para inferencia con contexto moderado.
- GPUs compatibles: NVIDIA con SM75+ (Turing, Ampere, Ada Lovelace, Hopper) y aceleradores Intel XPU. No soporta ROCm, CPU ni TPU.
- Ejemplos de GPUs: A100 40GB, A100 80GB, H100, RTX 4090 (24 GB no es suficiente para 31 GB de pesos, aunque con cuantización adicional podría intentarse, pero no está soportado).
- Opciones de despliegue: vLLM con kernels específicos (`XPUW8A16FP8LinearKernel` para Intel XPU, `HummingFP8ScaledMMLinearKernel` o `MarlinFP8ScaledMMLinearKernel` para CUDA). También puede usarse con transformers estándar, aunque sin la optimización de vLLM.
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo base ReadyArt/Omega-Evolution-31B-v4.0 no tiene especificaciones públicas detalladas, y no se conocen modelos directamente comparables en la misma categoría (multimodal, 31B, cuantizado FP8). Se recomienda consultar el repositorio del modelo base para futuras actualizaciones.

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no indica la licencia, por lo que no se puede garantizar su uso comercial. Se debe contactar con el autor antes de utilizarlo en producción.
- Información incompleta del modelo base: no hay documentación sobre arquitectura, datos de entrenamiento, sesgos o limitaciones de idioma.
- Soporte de hardware restringido: no funciona en ROCm, CPU ni TPU; solo en NVIDIA CUDA (SM75+) e Intel XPU. En otras plataformas, la carga fallará.
- Riesgo de alucinación: al ser un modelo multimodal sin benchmarks publicados, no se conoce su fiabilidad en tareas de generación de texto o descripción de imágenes. Se recomienda validar en casos de uso específicos.
- Ventana de contexto desconocida: no se ha documentado la longitud máxima de entrada, lo que puede afectar a tareas que requieran contexto largo.
- Cuantización solo de pesos: aunque la cuantización FP8 reduce memoria, las activaciones se mantienen en bf16, por lo que el ahorro de VRAM es menor que en esquemas W4A16 o W8A8.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hoborific/Omega-Evolution-31B-v4.0-W8A16-FP8
- Modelo base: https://huggingface.co/ReadyArt/Omega-Evolution-31B-v4.0
- Librería compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- Versión GGUF del modelo base: https://huggingface.co/ReadyArt/Omega-Evolution-31B-v4.0-GGUF
