# moonshotai/Kimi-K2.5

## Resumen

Kimi K2.5 es un modelo de lenguaje multimodal nativo de tipo Mixture-of-Experts (MoE) desarrollado por Moonshot AI. Se construye mediante preentrenamiento continuado sobre Kimi-K2-Base con aproximadamente 15 billones de tokens mixtos de visión y texto, e integra comprensión visual y lingüística con capacidades agénticas avanzadas, modos instantáneo y de razonamiento (thinking), y paradigmas conversacionales y de agente. Cuenta con 1 billón de parámetros totales y 32 mil millones activos por token, con una longitud de contexto de 256K tokens.

El modelo destaca por su multimodalidad nativa (no un adaptador añadido a posteriori), su capacidad de generar código a partir de especificaciones visuales y un esquema de ejecución tipo "agent swarm": descompone tareas complejas en sub-tareas paralelas ejecutadas por agentes especializados instanciados dinámicamente. Incorpora un codificador visual MoonViT de 400 millones de parámetros.

Es relevante ahora porque compite frontalmente con modelos propietarios de frontera (GPT-5.2, Claude 4.5 Opus, Gemini 3 Pro) en benchmarks de razonamiento y conocimiento, y porque se distribuye como pesos abiertos bajo licencia MIT modificada, lo que permite su despliegue e inspección. Su tamaño (1T de parámetros, repo de 595,2 GB) lo sitúa, no obstante, fuera del alcance de hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención MLA y SwiGLU |
| Parametros totales | 1.026.879.376.368 (1T) |
| Parametros activos | 32B por token |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Pesos en formato compressed-tensors (cuantización publicada); no se detallan en la información disponible los esquemas concretos (INT8, FP8, etc.) |
| Idiomas soportados | no disponible |
| Licencia | MIT modificada (modified-mit) |
| Formato de pesos | safetensors (con compressed-tensors), compatible con transformers |

Datos arquitectónicos adicionales: 61 capas (1 densa), dimensión de atención 7168, dimensión oculta MoE por experto 2048, 64 cabezas de atención, 384 expertos con 8 seleccionados por token más 1 experto compartido, vocabulario de 160K tokens, codificador visual MoonViT de 400M de parámetros.

## Arquitectura y entrenamiento

Kimi K2.5 es un transformer MoE de 1 billón de parámetros con 32B activos por token. Emplea atención MLA (Multi-head Latent Attention), función de activación SwiGLU, 61 capas (una densa y el resto MoE), 384 expertos enrutados con 8 activos por token y un experto compartido. La multimodalidad es nativa: un codificador visual MoonViT de 400M de parámetros procesa las entradas de imagen, y el modelo fue preentrenado de forma continua sobre Kimi-K2-Base con aproximadamente 15 billones de tokens mixtos de visión y texto.

El modelo soporta modos instantáneo y de razonamiento (thinking), y está diseñado para uso agéntico, incluyendo orquestación de herramientas y un esquema de "agent swarm" que descompone tareas complejas en sub-tareas paralelas ejecutadas por agentes especializados instanciados dinámicamente. No se detalla en la información disponible la composición exacta del dataset, ni si se aplicaron RLHF o DPO, ni innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento en modo thinking (razonamiento extendido) y modo instantáneo.
- Comprensión visual y razonamiento multimodal: conocimiento visual, razonamiento entre modalidades y uso de herramientas fundamentado en entradas visuales.
- Generación de código a partir de especificaciones visuales (diseños de interfaz, flujos de vídeo) y orquestación autónoma de herramientas para procesamiento de datos visuales.
- Uso de herramientas (tool calling / function calling) en contextos agénticos, incluyendo razonamiento multi-paso.
- Ejecución tipo "agent swarm": descomposición de tareas complejas en sub-tareas paralelas con agentes especializados dinámicos.
- Capacidades multilingües: no se detallan idiomas concretos en la información disponible.
- Modos conversacional y agéntico.

## Casos de uso

- Generación de código a partir de diseños de interfaz: el modelo puede tomar una imagen o especificación visual de UI y producir código funcional, integrándose en flujos de diseño a desarrollo.
- Automatización de flujos de trabajo con vídeo: orquesta herramientas para procesar datos visuales de vídeo de forma autónoma, útil en pipelines de edición o análisis.
- Razonamiento agéntico multi-paso con herramientas: con 256K de contexto y soporte de tool calling, puede gestionar tareas largas que requieren consultas encadenadas a APIs o bases de datos.
- Análisis de documentos e imágenes combinados: su multimodalidad nativa permite extraer y razonar sobre información de capturas, diagramas y texto en un mismo contexto.
- Asistentes de investigación técnica: el modo thinking y el rendimiento en benchmarks de conocimiento (HLE-Full 30,1; 50,2 con herramientas) lo hacen adecuado para tareas de razonamiento complejo con acceso a herramientas externas.
- Orquestación de agentes especializados: el esquema agent swarm permite paralelizar tareas de gran envergadura (por ejemplo, auditoría de repositorios o generación de documentación) en sub-tareas ejecutadas por agentes instanciados dinámicamente.
- Atención al cliente avanzada con contexto largo: los 256K tokens permiten mantener conversaciones multi-turno con historial extenso y adjuntos visuales.

## Benchmarks y rendimiento

Resultados publicados por el autor (modo Thinking). No se han publicado resultados de benchmarks adicionales en la información disponible más allá de los siguientes.

| Benchmark | Kimi K2.5 (Thinking) | GPT-5.2 (xhigh) | Claude 4.5 Opus (Extended Thinking) | Gemini 3 Pro (High Thinking) | DeepSeek V3.2 (Thinking) | Qwen3-VL-235B-A22B-Thinking |
|---|---|---|---|---|---|---|
| HLE-Full | 30,1 | 34,5 | 30,8 | 37,5 | 25,1 | - |
| HLE-Full (w/ tools) | 50,2 | 45,5 | 43,2 | 45,8 | 40,8 | - |
| AIME 2025 | 96,1 | 100 | 92,8 | 95,0 | 93,1 | - |
| HMMT 2025 (Feb) | no disponible (dato truncado en la fuente) | - | - | - | - | - |

## Requisitos de hardware

- VRAM estimada para inferencia: con 1T de parámetros totales, los pesos en precisión completa superan con holgura el terabyte (el repo ocupa 595,2 GB, lo que sugiere pesos ya cuantizados/comprimidos en el repositorio). Se requiere un clúster multi-GPU; no cabe en una sola GPU convencional.
- GPU recomendadas: no se detallan configuraciones oficiales en la información disponible; por tamaño, se necesitan nodos con múltiples aceleradores de datacenter (tipo A100/H100/H200 u equivalentes) con agregación de memoria muy elevada.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, etc.) por el volumen de parámetros.
- Opciones de despliegue: la model card indica compatibilidad con transformers y etiqueta de despliegue en SageMaker; no se confirman en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Modalidad |
|---|---|---|---|---|---|
| Kimi K2.5 | 1T | 32B | 256K | MIT modificada | Texto + visión |
| DeepSeek V3.2 | no disponible | no disponible | no disponible | no disponible | Texto |
| Qwen3-VL-235B-A22B | 235B | 22B | no disponible | no disponible | Texto + visión |
| GPT-5.2 | no disponible (propietario) | no disponible | no disponible | Propietaria | Texto |
| Claude 4.5 Opus | no disponible (propietario) | no disponible | no disponible | Propietaria | Texto |

En rendimiento, Kimi K2.5 lidera en HLE-Full con herramientas (50,2 frente a 45,5 de GPT-5.2, 43,2 de Claude 4.5 Opus y 45,8 de Gemini 3 Pro) y en AIME 2025 queda por detrás de GPT-5.2 (96,1 frente a 100) pero por delante de Claude 4.5 Opus (92,8) y DeepSeek V3.2 (93,1). Los datos de contexto y licencia de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se aportan tasas ni evaluaciones específicas.
- Limitaciones de contexto o idioma: contexto de 256K tokens; los idiomas soportados no están detallados, por lo que no puede confirmarse cobertura multilingüe amplia.
- Licencia: MIT modificada ("modified-mit"), no MIT estándar; deben revisarse los términos concretos del archivo LICENSE antes de uso comercial.
- Producción: el tamaño (1T de parámetros, repo de 595,2 GB) implica costes de infraestructura muy elevados; no es desplegable en hardware de consumo.
- La model card advierte de un cambio en el token de chat template (`<|media_start|>` sustituido por `<|media_begin|>`) y de la retirada del system prompt por defecto, lo que puede afectar a integraciones existentes.
- Existe una versión posterior anunciada, Kimi-K2.6, según el campo `new_version` de la model card.

## Enlaces

- Hugging Face: https://huggingface.co/moonshotai/Kimi-K2.5
- Paper: https://arxiv.org/abs/2602.02276
- Blog técnico: https://www.kimi.com/blog/kimi-k2-5.html
- Chat: https://www.kimi.com
- GitHub: https://github.com/moonshotai/Kimi-K2.5
- Página de Moonshot AI: https://www.moonshot.ai
- Organización en Hugging Face: https://huggingface.co/moonshotai
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- Licencia: https://huggingface.co/moonshotai/Kimi-K2.5/blob/main/LICENSE
