# hoborific/Split-Untied-31B-W8A16-FP8

## Resumen

El modelo `hoborific/Split-Untied-31B-W8A16-FP8` es una versión cuantizada del checkpoint `Blazed-Forge/Split-Untied-31B`, creada por el usuario hoborific. Se trata de un modelo multimodal de tipo image-text-to-text, según el pipeline declarado en HuggingFace, con un total de 32.682.375.020 parámetros. La cuantización aplicada es W8A16 FP8: los pesos se almacenan en `float8_e4m3fn` con escalas simétricas por canal de salida, mientras que las activaciones se mantienen en bf16/fp16. El formato es `compressed-tensors` en su variante `float-quantized`, lo que lo hace compatible con vLLM en determinados backends. El modelo base no está documentado en la información proporcionada, por lo que no se pueden detallar su arquitectura, datos de entrenamiento ni contexto. La relevancia de este checkpoint radica en su optimización para inferencia en Intel XPU y NVIDIA CUDA, así como en su esquema de cuantización por canal con recorte MSE, que el autor afirma que mejora la relación señal-ruido frente a la cuantización FP8 por tensor de vLLM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags de HuggingFace indican "gemma4" e "image-text-to-text", lo que sugiere una arquitectura multimodal basada en la familia Gemma, pero no se confirma en la model card) |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 FP8 (pesos en float8_e4m3fn con escalas simétricas por canal de salida, activaciones en bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors float-quantized) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo base ni los datos de entrenamiento. El único aspecto técnico documentado es el proceso de cuantización. Para cada capa lineal, cada fila de salida recibe su propia escala, calculada a partir de `amax / 448` y refinada mediante una búsqueda de recorte MSE sobre aproximadamente 9 fracciones de recorte (0.8–1.0× amax), seleccionando la escala de menor error por fila. Los pesos se cuantizan como `q = e4m3(w / scale)` con redondeo al más cercano y saturación. Este esquema por canal con recorte proporciona una mejor relación señal-ruido que la cuantización FP8 por tensor que ofrece vLLM en línea. Solo se cuantizan las proyecciones lineales 2D (attention q/k/v/o y MLP gate/up/down). Las embeddings, normas, lm_head, routers/expertos y la torre de visión permanecen en bf16 y están listados en la lista `ignore` del checkpoint para que vLLM no los modifique. No se proporcionan datos sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni otras innovaciones técnicas.

## Capacidades

- Modelo multimodal de tipo image-text-to-text: puede procesar entradas de imagen y texto y generar texto, según el pipeline declarado en HuggingFace.
- La cuantización W8A16 FP8 permite inferencia con pesos en FP8 y activaciones en bf16/fp16, manteniendo las capas críticas (embeddings, normas, lm_head, routers/expertos y torre de visión) en bf16.
- Compatible con vLLM en Intel XPU mediante el kernel `XPUW8A16FP8LinearKernel`.
- Compatible con vLLM en NVIDIA CUDA (SM75+, es decir, arquitecturas Turing o más nuevas) mediante `HummingFP8ScaledMMLinearKernel` si se instala el paquete `humming`, o `MarlinFP8ScaledMMLinearKernel` en caso contrario.
- No soporta ROCm, CPU ni TPU: la carga fallará con un error de "no kernel" en esos backends.
- No se dispone de información sobre tool calling, function calling, soporte de agentes, razonamiento multi-paso, capacidades multilingües ni modos especiales como thinking mode.

## Casos de uso

- Despliegue en producción con vLLM en NVIDIA CUDA: el modelo puede servirse mediante vLLM en GPUs con arquitectura Turing o más nueva, usando el kernel `MarlinFP8ScaledMMLinearKernel` o `HummingFP8ScaledMMLinearKernel` si se instala `humming`. Es adecuado para servicios de inferencia multimodal que requieran procesar imágenes y texto.
- Inferencia en Intel XPU: la optimización para `XPUW8A16FP8LinearKernel` permite aprovechar aceleradores Intel en centros de datos, lo que puede ser relevante para organizaciones que no quieran depender de GPUs NVIDIA.
- Investigación en compresión de modelos: el esquema de cuantización por canal con recorte MSE es un caso de estudio para comparar la calidad de la cuantización frente a métodos por tensor. Puede usarse como referencia en trabajos de compresión de modelos.
- Prototipado de aplicaciones de visión-lenguaje: al ser image-text-to-text, el modelo puede probarse en tareas de descripción de imágenes o respuesta a preguntas visuales, aunque se requiere validación previa porque no hay benchmarks publicados.
- Evaluación de backends de vLLM: el modelo sirve para verificar la compatibilidad de kernels W8A16 FP8 en diferentes plataformas, lo que es útil para desarrolladores de infraestructura de inferencia.
- Comparación de modelos cuantizados: junto con otros checkpoints de hoborific (Froopert-31B-W8A16-FP8 y Serenity-31B-v1.1-W8A16-FP8), permite comparar el impacto de la cuantización en diferentes modelos base, aunque no se dispone de datos de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. El tamaño del repo es de 36.1 GB, por lo que se puede estimar que la carga de pesos en FP8 requiere al menos 36 GB de VRAM, más memoria para activaciones y KV cache. No se proporciona una cifra oficial.
- GPU recomendadas: no se especifica un modelo concreto. Se requiere NVIDIA CUDA con arquitectura Turing o más nueva (SM75+), o Intel XPU. Para una inferencia con margen, se recomiendan GPUs de datacenter con 80 GB de VRAM, como H100 o A100 80GB.
- No cabe en GPUs de consumo de 24 GB (por ejemplo, RTX 4090), dado el tamaño del checkpoint. Se necesitan GPUs de estación de trabajo o datacenter con al menos 48 GB de VRAM.
- Opciones de despliegue: vLLM es la opción principal, con soporte para el formato compressed-tensors. No se dispone de información sobre compatibilidad con otros servidores de inferencia como llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Los únicos modelos conocidos con el mismo esquema de cuantización son otros checkpoints de hoborific (Froopert-31B-W8A16-FP8 y Serenity-31B-v1.1-W8A16-FP8), pero no se conocen sus características ni rendimiento. El modelo base (Blazed-Forge/Split-Untied-31B) no está documentado en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos conocidos, riesgo de alucinación, limitaciones de contexto o idioma.
- La licencia es "no disponible": no se puede confirmar si permite uso comercial ni bajo qué términos.
- La cuantización solo cubre capas lineales 2D; las embeddings, normas, lm_head, routers/expertos y la torre de visión permanecen en bf16, lo que puede suponer un mayor uso de VRAM en comparación con una cuantización completa.
- No soporta ROCm, CPU ni TPU: el despliegue en esos backends fallará.
- La compatibilidad con NVIDIA CUDA depende de la arquitectura (SM75+); en GPUs más antiguas (Volta o anteriores) no funcionará.
- Al ser un modelo cuantizado, puede haber una ligera degradación de precisión en comparación con el modelo base, aunque el autor afirma que el esquema por canal con recorte mejora la relación señal-ruido frente a la cuantización por tensor de vLLM.
- No hay benchmarks publicados que validen el rendimiento real del modelo en tareas concretas.

## Enlaces

- HuggingFace: https://huggingface.co/hoborific/Split-Untied-31B-W8A16-FP8
- Modelo base: https://huggingface.co/Blazed-Forge/Split-Untied-31B
- Repositorio compressed-tensors: https://github.com/neuralmagic/compressed-tensors
