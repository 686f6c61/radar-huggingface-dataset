# hoborific/Melinoe-Gemma4-31B-VL-heretic-W8A16-FP8

## Resumen

Melinoe-Gemma4-31B-VL-heretic-W8A16-FP8 es una versión cuantizada del modelo base bgg1996/Melinoe-Gemma4-31B-VL-heretic, publicada por el usuario hoborific en HuggingFace. Se trata de un modelo multimodal (image-text-to-text) de aproximadamente 31 000 millones de parámetros, preparado para inferencia eficiente mediante cuantización offline W8A16 FP8. La cuantización se ha realizado con la librería compressed-tensors de Neural Magic, utilizando pesos en float8_e4m3fn con escalas por canal de salida y activaciones en bf16/fp16.

El modelo está diseñado específicamente para su despliegue en vLLM sobre aceleradores Intel XPU y NVIDIA CUDA (Turing o superior), y no es compatible con ROCm, CPU o TPU en dicha plataforma. Al tratarse de una cuantización, el objetivo principal es reducir el uso de memoria y acelerar la inferencia manteniendo una calidad cercana a la del modelo original en bf16. No se ha publicado información sobre el entrenamiento, las capacidades específicas o los benchmarks del modelo base, por lo que esta ficha se limita a los datos disponibles en la model card y el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere una variante de Gemma4 de 31B con visión, pero no se confirma) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en float8_e4m3fn, activaciones en bf16/fp16), formato float-quantized de compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con metadatos de compressed-tensors) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base ni su proceso de entrenamiento. El pipeline declarado es image-text-to-text, lo que indica que el modelo acepta imagenes y texto como entrada y genera texto. La cuantizacion se aplica exclusivamente a las capas lineales 2D (attention q/k/v/o y MLP gate/up/down); embeddings, normas, lm_head, routers/experts y la torre de vision permanecen en bf16. El metodo de cuantizacion emplea escalas por canal de salida calculadas a partir de amax/448, refinadas mediante una busqueda de recorte MSE sobre 9 fracciones de clip (0.8-1.0× amax). No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens o el uso de tecnicas como RLHF o DPO.

## Capacidades

- Procesamiento multimodal: acepta imagenes y texto como entrada (pipeline image-text-to-text).
- Generacion de texto conversacional: el modelo base esta etiquetado como "conversational".
- Inferencia cuantizada: los pesos estan en FP8, lo que permite un menor uso de memoria y mayor velocidad en hardware compatible.
- Compatibilidad con vLLM: soporta kernels especificos para Intel XPU (XPUW8A16FP8LinearKernel) y NVIDIA CUDA (HummingFP8ScaledMMLinearKernel o MarlinFP8ScaledMMLinearKernel).
- No se dispone de informacion sobre soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingues o modos especiales como thinking mode.

## Casos de uso

- Despliegue en produccion con vLLM en clusters Intel XPU: el modelo esta optimizado para este backend, lo que permite servir inferencias de vision-lenguaje a gran escala con menor huella de memoria.
- Inferencia en GPUs NVIDIA con memoria limitada: al ser una cuantizacion W8A16, reduce el requisito de VRAM en comparacion con el modelo en bf16, facilitando su uso en GPUs como RTX 4090 o similares (aunque no se especifica la VRAM exacta).
- Prototipado de aplicaciones multimodales: gracias al formato safetensors y la compatibilidad con compressed-tensors, se puede integrar en pipelines de HuggingFace Transformers para experimentacion rapida.
- Evaluacion de calidad de cuantizacion: el esquema de cuantizacion con escalas por canal y recorte MSE esta disenado para preservar la fidelidad, por lo que puede usarse como referencia para comparar metodos de cuantizacion alternativos.
- Sistemas de respuesta a preguntas visuales: el modelo base es de tipo image-text-to-text, por lo que esta cuantizacion puede servir para tareas de VQA en entornos con restricciones de memoria.
- Investigacion en eficiencia de modelos: el checkpoint incluye una lista `ignore` que detalla que capas se cuantizan y cuales no, lo que resulta util para estudiar el impacto de la cuantizacion selectiva en modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para el modelo base o su version cuantizada.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamano del repositorio es de 33.3 GB, pero no se indica la memoria necesaria para inferencia.
- GPU recomendadas: NVIDIA CUDA SM75+ (Turing o posterior) para usar los kernels FP8 de vLLM. Tambien compatible con Intel XPU.
- No compatible con ROCm, CPU o TPU en vLLM (falla con error "no kernel").
- Opciones de despliegue: vLLM con los kernels mencionados. Tambien puede cargarse con Transformers (libreria transformers), aunque sin aceleracion especifica para W8A16.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos. El modelo base (bgg1996/Melinoe-Gemma4-31B-VL-heretic) no tiene ficha publica detallada en la informacion proporcionada, y no se conocen alternativas equivalentes en cuanto a arquitectura y cuantizacion. Se recomienda consultar el repositorio del modelo base para obtener datos comparativos.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos, alucinaciones o limitaciones de contexto del modelo base.
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial. Se debe contactar con el autor antes de cualquier despliegue en produccion.
- La cuantizacion W8A16 FP8 puede introducir una ligera degradacion de calidad respecto al modelo en bf16, aunque el autor afirma que el esquema per-channel con recorte MSE ofrece mejor SNR que la cuantizacion online de vLLM.
- La compatibilidad con vLLM esta limitada a Intel XPU y NVIDIA CUDA (SM75+). En otros backends (ROCm, CPU, TPU) la carga fallara.
- El modelo es una version cuantizada de un modelo base no documentado; las capacidades reales dependen del entrenamiento de ese modelo base, del cual no se aportan detalles.
- No se garantiza la disponibilidad a largo plazo del repositorio ni el mantenimiento del checkpoint.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hoborific/Melinoe-Gemma4-31B-VL-heretic-W8A16-FP8
- Modelo base: https://huggingface.co/bgg1996/Melinoe-Gemma4-31B-VL-heretic
- Libreria compressed-tensors: https://github.com/neuralmagic/compressed-tensors
