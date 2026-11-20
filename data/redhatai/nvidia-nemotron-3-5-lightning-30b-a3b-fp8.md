# RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-FP8

## Resumen

RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-FP8 es una versión cuantizada a FP8 del modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16, desarrollado originalmente por NVIDIA y optimizado por Red Hat AI. El modelo emplea la arquitectura NemotronH (NemotronHForCausalLM), una arquitectura híbrida que combina capas de atención con mecanismos de espacio de estados (SSM/Mamba), tal como evidencian los parámetros de despliegue `--mamba-backend flashinfer` y `--mamba-ssm-cache-dtype` requeridos. Con aproximadamente 31.580 millones de parámetros totales y una designación "A3B" que sugiere 3.000 millones de parámetros activos, se trata de un modelo de mezcla de expertos (MoE) orientado a generación de texto conversacional.

La cuantización reduce los pesos y activaciones de los operadores lineales de los bloques transformer de 16 a 8 bits mediante un esquema estático per-tensor, aplicado con LLM Compressor. Esto disminuye aproximadamente un 50% los requisitos de memoria GPU y disco, y aproximadamente duplica el throughput de multiplicación de matrices en hardware compatible con FP8. El proceso de calibración utilizó 512 muestras del dataset UltraChat 200k con una longitud máxima de secuencia de 2048 tokens.

El modelo resulta relevante para despliegues en producción que requieren un equilibrio entre capacidad de razonamiento conversacional y eficiencia de inferencia. Su integración validada con vLLM 0.28.0, RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2, junto con parsers específicos para razonamiento (`nemotron_v3`) y tool calling (`qwen3_coder`), lo posicionan como una opción práctica para pipelines de agentes y atención al cliente automatizada en infraestructura FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NemotronH (híbrida transformer + SSM/Mamba), NemotronHForCausalLM |
| Parametros totales | 31.577.940.288 (~31,58 mil millones) |
| Parametros activos | ~3 mil millones (designación A3B, MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos y activaciones, esquema estático per-tensor); modelo base en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura NemotronH, una propuesta híbrida que intercala capas de atención con capas de espacio de estados (SSM, tipo Mamba). La presencia de operadores `conv1d`, `mixer.gate`, `_latent_proj` y `mtp.layers` en la receta de cuantización confirma la existencia de componentes convolucionales y de mezcla propios de los bloques SSM, así como capas de multi-token prediction (MTP). La designación "A3B" indica un esquema de mezcla de expertos con aproximadamente 3.000 millones de parámetros activos por token sobre un total de 31.580 millones.

La cuantización fue realizada por Red Hat AI mediante LLM Compressor con el modificador GPTQModifier y esquema FP8, calibrando con 512 muestras de UltraChat 200k (`train_sft`) a 2048 tokens de longitud. Se excluyeron de la cuantización las capas `conv1d`, los embeddings (`backbone.embeddings`), las proyecciones latentes (`_latent_proj`), las puertas del mixer (`mixer.gate`), las capas MTP (`mtp.layers`), la normalización final (`backbone.norm_f`) y el `lm_head`. No se dispone de información sobre el volumen de tokens de preentrenamiento, la composición del dataset original ni las etapas de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat (`apply_chat_template`).
- Razonamiento explícito: el despliegue en vLLM habilita `--reasoning-parser nemotron_v3`, lo que indica soporte de modo de razonamiento estructurado.
- Tool calling / function calling: soportado mediante `--tool-call-parser qwen3_coder` y `--enable-auto-tool-choice`.
- Capacidades de agente y razonamiento multi-paso, habilitadas por el soporte combinado de razonamiento y herramientas.
- Multi-token prediction (MTP): la arquitectura incluye capas MTP, lo que puede habilitar decodificación especulativa.
- Procesamiento de texto como única modalidad de entrada y salida (sin visión ni audio).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con plantilla de chat y razonamiento estructurado, integrándose en backends vLLM con prefix caching para reutilizar contexto en diálogos repetitivos.
- Agentes con tool calling en producción: gracias a los parsers `qwen3_coder` y `nemotron_v3`, puede orquestar llamadas a funciones externas (APIs, bases de datos) en flujos de razonamiento multi-paso.
- Asistentes de código en pipelines CI/CD: el parser de tool calling orientado a código permite integrar el modelo en herramientas de revisión automática, generación de parches o consultas a repositorios.
- Despliegue en infraestructura FP8 on-premise: validado en RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2, adecuado para organizaciones con clústeres de GPU H100/L40S que buscan reducir coste por token.
- Servicio de inferencia de alto throughput: la cuantización FP8 duplica el throughput de matmul y permite `--max-num-seqs 128` con scheduling asíncrono, útil para APIs de generación de texto a escala.
- Razonamiento asistido en dominios técnicos: el modo de razonamiento estructurado con parser dedicado facilita la extracción de cadenas de pensamiento auditables en aplicaciones de análisis y soporte técnico.
- Prototipado e investigación: al ser un modelo MoE de ~31B con solo ~3B activos, permite experimentación con arquitecturas híbridas SSM/attention en hardware de gama alta sin requerir clústeres masivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 32,3 GB en FP8, por lo que se requiere al menos ~32-36 GB de VRAM para pesos, más overhead de caché KV/SSM y activaciones. Con cuantizaciones adicionales (no publicadas) podría reducirse, pero no hay datos disponibles.
- GPU recomendadas: NVIDIA H100 (FP8 nativo), L40S, L4 y GPUs con soporte FP8. El backend `flashinfer_cutlass` para MoE y `flashinfer` para Mamba requiere hardware compatible con FlashInfer.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) en FP8 sin cuantización adicional; no se dispone de variantes GGUF publicadas en la información proporcionada.
- Opciones de despliegue: vLLM 0.28.0 (validado), con flags obligatorios `--mamba-backend flashinfer`, `--mamba-ssm-cache-dtype float16`, `--enable-mamba-cache-stochastic-rounding`, `--mamba-cache-philox-rounds 5`, `--moe-backend flashinfer_cutlass`. Compatible con transformers y compressed-tensors.
- Latencia y throughput: no disponibles de forma numérica; la model card indica que FP8 duplica aproximadamente el throughput de matmul frente a BF16 en hardware compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-FP8 | ~31,58B totales / ~3B activos | no disponible | FP8 (W+A) | no disponible | Hugging Face, vLLM |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | ~31,58B totales / ~3B activos | no disponible | BF16 | no disponible | Hugging Face |
| Modelos MoE de ~30B con ~3B activos (categoría general) | ~30B / ~3B | variable | variable | variable | variable |

No se dispone de datos de benchmarks ni de comparativas numéricas con alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 introduce una pérdida de precisión respecto al modelo BF16 original; no se han publicado métricas de degradación en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje; el modo de razonamiento no elimina este riesgo.
- Longitud de contexto no documentada: no es posible planificar aplicaciones de contexto largo sin verificar este dato en la model card original.
- Idiomas soportados no documentados; el rendimiento multilingüe es desconocido.
- Licencia no disponible en la información proporcionada: es imprescindible verificar las condiciones de uso comercial en el repositorio antes de desplegar en producción.
- Requiere flags específicos de vLLM (`--mamba-backend flashinfer`, `--moe-backend flashinfer_cutlass`) y versiones validadas (vLLM 0.28.0); configuraciones incorrectas pueden degradar el rendimiento o fallar.
- El backend Mamba con `--enable-mamba-cache-stochastic-rounding` y `--mamba-cache-philox-rounds 5` implica compensaciones entre precisión y velocidad que deben validarse en cada caso de uso.
- No cabe en GPUs consumer de 24 GB en su forma FP8 publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-FP8
- Modelo base (BF16): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- README del modelo: https://huggingface.co/RedHatAI/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-FP8/blob/main/README.md
