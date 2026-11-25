# scottlowry/Ornith-1.5-9B-oQ5e-fp16-mtp

## Resumen

Ornith-1.5-9B-oQ5e-fp16-mtp es una cuantización mixta del modelo base ornith-ai/Ornith-1.5-9B, publicada por el usuario scottlowry. El checkpoint está empaquetado en formato MLX (Apple Silicon) y emplea la herramienta oQ de oMLX (v0.7.4.dev1) para aplicar precisión mixta por tensor: la mayor parte de los pesos se almacena en 5 bits afín con grupo 64, mientras que capas sensibles se conservan en 6, 8, FP16 o incluso FP32. El resultado es un checkpoint de 9.653 millones de parámetros lógicos que ocupa 7,838 GiB en disco, con un promedio efectivo de 6,975 bits por peso.

El modelo base pertenece a la familia Qwen3.5 (según el tag `qwen3_5`) e incorpora tres componentes diferenciados: un modelo de lenguaje de 8.954B parámetros, un codificador visual de 0.456B y una cabeza MTP (multi-token prediction) de 0.243B, lo que sugiere capacidades multimodales y decodificación especulativa nativa. La cuantización conserva la cabeza MTP, algo poco habitual en checkpoints cuantizados, lo que permite mantener aceleración por predicción multi-token incluso en el modelo reducido.

La relevancia de esta ficha radica en que es una de las pocas publicaciones que ofrece un modelo de ~9B multimodal con MTP en formato optimizado para Mac, con desglose transparente de la distribución de bits por componente. No obstante, la información pública es muy limitada: no hay model card del modelo base, no se declaran licencia, idiomas ni benchmarks, y el número de descargas (276) y likes (1) indica una adopción todavía incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); incluye vision encoder y cabeza MTP |
| Parametros totales | 9.653.104.368 (9.653B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: affine 5-bit group 64 (76,8%), affine 6-bit group 64 (17,9%), affine 8-bit group 64 (0,22%), FP16 (0,36%), FP32 (4,72%); media efectiva 6,975 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX); repo de 8,4 GB, checkpoint de 7,838 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5, según el tag declarado en el repositorio. La estructura de pesos revela tres bloques: un language model de 8.954B parámetros, un módulo de visión de 0.456B y una cabeza MTP de 0.243B. La presencia de un vision encoder confirma que el modelo es multimodal (texto e imagen), y la cabeza MTP indica soporte de multi-token prediction, técnica de decodificación especulativa que permite generar varios tokens por paso del forward y acelerar la inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o instruction tuning. Tampoco se documenta la arquitectura interna del transformer (número de capas, dimensión oculta, tipo de atención, uso de RoPE, etc.). La innovación técnica destacable del checkpoint es la cuantización mixta por tensor: oQ asigna 5 bits a la mayoría de pesos, pero eleva a 6, 8, FP16 y FP32 las capas críticas (probablemente embeddings, normalizaciones, cabezas de salida y el vision encoder), preservando calidad donde más impacta. El vision encoder, de hecho, se mantiene íntegramente en FP32 (0,456B en 1,699 GiB), lo que sugiere que el autor priorizó la fidelidad visual sobre la compresión.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5.
- Procesamiento de imágenes (vision encoder de 0.456B en FP32), lo que habilita tareas de image understanding y posiblemente VQA.
- Decodificación especulativa mediante cabeza MTP (0.243B), que acelera la generación multi-token.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el formato MLX y el tamaño de 7,8 GiB permiten ejecutar el modelo en Macs con 16 GB de memoria unificada o superior, usando la librería mlx-lm. Es adecuado para desarrolladores que quieren un modelo multimodal de ~9B sin depender de la nube.
- Prototipado de asistentes multimodales: gracias al vision encoder en FP32, el modelo puede recibir imágenes y texto en la misma conversación, útil para demos de descripción de imágenes, extracción de información de capturas o análisis de documentos escaneados.
- Aceleración de generación con MTP: al conservar la cabeza de multi-token prediction, el checkpoint permite experimentar con decodificación especulativa en local, comparando throughput frente a la decodificación autoregresiva clásica.
- Evaluación de cuantización mixta: el desglose de bits por componente hace de este repo un caso de estudio para investigadores que quieran medir la degradación de calidad entre 5, 6 y 8 bits en un mismo modelo.
- Experimentación académica con modelos Qwen3.5: sirve como checkpoint ligero para reproducir experimentos de la familia Qwen3.5 en hardware de consumo.
- Fine-tuning ligero en Mac: el formato MLX y el tamaño contenido permiten LoRA o adaptadores sobre el modelo cuantizado, aunque la cuantización limita la precisión del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~8 GB solo para pesos; con overhead de runtime MLX, se recomienda 12-16 GB de memoria unificada para contexto corto y 24 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4) con al menos 16 GB de memoria unificada. El formato MLX no está pensado para CUDA; para GPUs NVIDIA habría que reconvertir a GGUF o safetensors estándar.
- Cabe en consumer GPU: sí, en Macs con 16 GB o más. En GPUs NVIDIA de consumo (RTX 3060 12 GB, RTX 4070 12 GB, RTX 4090 24 GB) requeriría reconversión de formato.
- Opciones de despliegue: mlx-lm (nativo), oMLX; para otros entornos, conversión a GGUF para llama.cpp/Ollama o a safetensors estándar para vLLM/TGI.
- Latencia y throughput: no disponibles en la información proporcionada. La cabeza MTP debería mejorar el throughput respecto a decodificación autoregresiva, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B-oQ5e-fp16-mtp | 9,65B | no disponible | Sí (vision 0,456B) | MLX safetensors | no disponible | Hugging Face (276 descargas) |
| ornith-ai/Ornith-1.5-9B (base) | ~9,65B | no disponible | Sí | safetensors | no disponible | Hugging Face |
| Qwen3.5 (familia, versión 9B) | ~9B | no disponible | no disponible | safetensors/GGUF | no disponible | Hugging Face |
| Qwen2.5-VL-7B | 8,3B | 128K (típico en la familia) | Sí | safetensors/GGUF | Apache 2.0 (familia Qwen) | Hugging Face |

La comparativa con Qwen2.5-VL-7B es orientativa: comparte categoría (modelo multimodal de ~8-9B), pero no se dispone de datos del modelo base Ornith para confirmar equivalencias de contexto, licencia o rendimiento.

## Limitaciones y advertencias

- La cuantización a 5 bits en el 76,8% de los pesos introduce degradación de calidad respecto al modelo base en FP16/BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El vision encoder se mantiene en FP32, pero el resto del modelo está comprimido; tareas que dependan de razonamiento visual fino pueden verse afectadas.
- No se declara licencia: no se puede asumir uso comercial sin verificar la licencia del modelo base ornith-ai/Ornith-1.5-9B.
- No se declaran idiomas soportados ni sesgos conocidos; se desconoce el comportamiento en castellano y en lenguas distintas del inglés.
- Riesgo de alucinación: inherente a modelos de ~9B; no hay evaluaciones publicadas de factualidad.
- Formato MLX: no es directamente compatible con CUDA, vLLM ni llama.cpp sin conversión previa.
- Repositorio con muy baja adopción (276 descargas, 1 like) y actualizado en noviembre de 2026; el autor advierte de que versiones anteriores deben re-descargarse.
- La cabeza MTP solo aporta aceleración si el runtime la soporta; mlx-lm puede no explotarla por defecto.

## Enlaces

- Hugging Face: https://huggingface.co/scottlowry/Ornith-1.5-9B-oQ5e-fp16-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Herramienta oQ / oMLX: https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
