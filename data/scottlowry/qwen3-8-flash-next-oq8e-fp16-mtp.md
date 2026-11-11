# scottlowry/Qwen3.8-Flash-Next-oQ8e-fp16-mtp

## Resumen

Qwen3.8-Flash-Next-oQ8e-fp16-mtp es una cuantización mixta de 8 bits del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario scottlowry. El artefacto está empaquetado en formato MLX (safetensors) y emplea la herramienta oQ de oMLX v0.7.3.dev2 para aplicar precisión mixta: la mayor parte de los pesos del transformer de lenguaje se almacena en affine 8-bit con grupo 64, mientras que la tabla de embeddings N-gram se guarda en affine 8-bit con grupo 32 y algunos tensores críticos se mantienen en FP16/FP32. El checkpoint completo pesa 180.000 millones de parámetros lógicos y ocupa 182,3 GiB en disco (337,5 GB de repositorio incluyendo múltiples artefactos).

El modelo base Qwen3.8-Flash-Next pertenece a la familia Qwen y, por el sufijo "Flash-Next", se infiere una arquitectura optimizada para eficiencia, aunque la model card no documenta detalles de arquitectura, contexto ni entrenamiento. La cuantización incorpora una cabeza MTP (multi-token prediction) de 2.607 millones de parámetros y un módulo de visión de 0.449 mil millones, lo que sugiere capacidades multimodales y decodificación especulativa. La licencia y los idiomas soportados no están declarados en la información disponible.

Este artefacto es relevante para desarrolladores que trabajan en el ecosistema Apple Silicon (MLX) y necesitan ejecutar un modelo de 180B con un peso efectivo de 8,7 bits/peso, reduciendo el footprint de ~360 GB (FP16) a ~182 GiB. La distribución de bits documentada permite evaluar el compromiso entre calidad y memoria antes de descargar el repositorio completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-Flash-Next; incluye modulo de vision y cabeza MTP) |
| Parametros totales | 179.999.981.459 (180.000B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 8-bit grupo 128, affine 8-bit grupo 64, affine 8-bit grupo 32 (N-gram), FP16, FP32, I64; media efectiva 8,700 bits/peso (8,581 sin tabla N-gram) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Qwen3.8-Flash-Next ni los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí documenta el artefacto es la composición del checkpoint cuantizado: un transformer de lenguaje de 125.744B parámetros lógicos (124.415 GiB en almacenamiento), una tabla de embeddings N-gram de 51.200B parámetros (53.644 GiB), un módulo de visión de 0.449B (1.672 GiB) y una cabeza MTP de 2.607B (2.580 GiB). La presencia de MTP indica decodificación especulativa multi-token, y el módulo de visión confirma capacidades multimodales.

La innovación técnica principal es la cuantización mixta con oQ: el 69,93% de los pesos lógicos usa affine 8-bit con grupo 64 (8,50 bits/peso efectivos), el 28,45% corresponde a la tabla N-gram en affine 8-bit con grupo 32 (9,00 bits/peso), y una fracción mínima (0,25% en FP32 y 0,04% en FP16) se preserva en alta precisión, presumiblemente para capas sensibles como normalizaciones o embeddings especiales. El resultado es un checkpoint de 182,3 GiB con una media de 8,700 bits/peso, frente a los ~360 GB que ocuparía en FP16.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next, aunque no se detallan en la model card.
- Procesamiento de visión: el checkpoint incluye un módulo de visión de 0.449B parámetros, lo que habilita tareas imagen-a-texto.
- Decodificación especulativa: la cabeza MTP de 2.607B parámetros permite multi-token prediction, acelerando la generación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Audio: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon de alta gama: el formato MLX y el peso de 182,3 GiB permiten ejecutar un modelo de 180B en equipos con memoria unificada de 192 GB o superior (Mac Studio M2/M3 Ultra), algo inviable en FP16.
- Procesamiento multimodal de documentos: el módulo de visión integrado permite extraer texto y describir imágenes en pipelines de digitalización, aunque la calidad concreta no está documentada.
- Generación de texto asistida con decodificación especulativa: la cabeza MTP acelera la inferencia en entornos MLX, útil para aplicaciones interactivas de chat donde la latencia importa.
- Investigación en cuantización: la distribución de bits documentada (affine 8-bit grupo 64/128/32, FP16, FP32) sirve como referencia para estudiar el impacto de la precisión mixta en modelos de gran escala.
- Despliegue de un modelo de 180B en un único nodo: al reducir el footprint a ~182 GiB, se puede servir desde una sola máquina con memoria unificada suficiente, simplificando la infraestructura frente a sharding multi-GPU.
- Reproducción de experimentos con el modelo base: al ser una cuantización del Qwen3.8-Flash-Next oficial, permite comparar resultados entre la versión completa y la cuantizada en el mismo hardware.
- Fine-tuning ligero sobre la versión cuantizada: aunque no está documentado, el formato safetensors MLX permite adaptar capas selectivas en flujos de trabajo con LoRA sobre Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~182,3 GiB solo para los pesos; con overhead de contexto y KV cache, se recomienda un mínimo de 192 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada de 192 GB o superior (Mac Studio M2 Ultra 192 GB, M3 Ultra 192 GB+). Para GPUs NVIDIA, el formato MLX no es nativo y requeriría conversión.
- ¿Cabe en consumer GPU? No. Un modelo de 182,3 GiB no cabe en RTX 4090 (24 GB), RTX 5090 (32 GB) ni A100 80 GB individual.
- Opciones de despliegue: MLX (librería nativa del checkpoint), oMLX. vLLM, llama.cpp, Ollama y TGI no soportan MLX de forma nativa sin conversión.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-oQ8e-fp16-mtp (este) | 180B | no disponible | 8-bit mixta (8,70 bits/peso) | no disponible | safetensors MLX |
| Qwen/Qwen3.8-Flash-Next (base) | 180B (presumible) | no disponible | FP16/BF16 original | no disponible | no disponible |
| Alternativas de ~180B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en el ecosistema MLX con la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en la información disponible; verificar los términos del modelo base Qwen/Qwen3.8-Flash-Next antes de cualquier uso comercial.
- La cuantización a 8 bits introduce pérdida de precisión respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esta degradación.
- El formato MLX limita el despliegue al ecosistema Apple Silicon; no es directamente compatible con CUDA, ROCm ni CPU x86 sin conversión.
- El repositorio ocupa 337,5 GB, aunque el checkpoint final pesa 182,3 GiB; se requiere espacio en disco adicional durante la descarga.
- No se documentan sesgos conocidos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- La model card advierte que el artefacto fue re-cuantizado el 2026-10-25 con oMLX v0.7.3.dev2; copias anteriores deben descargarse de nuevo.
- Solo 1 like y 304 descargas en el momento de la consulta: el artefacto tiene validación comunitaria limitada.
- No se especifican requisitos de versión mínima de MLX ni de oMLX para la inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Qwen3.8-Flash-Next-oQ8e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oMLX/oQ: https://github.com/jundot/omlx
