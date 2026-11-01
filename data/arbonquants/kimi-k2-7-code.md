# arbonquants/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Moonshot AI, especializado en tareas de programación y en flujos de trabajo agénticos de larga duración. Se construye sobre Kimi K2.6 y está orientado a completar tareas de ingeniería de software de extremo a extremo, con mejoras sustanciales en tareas reales de horizonte largo y una reducción de aproximadamente el 30 % en el uso de tokens de razonamiento (thinking tokens) respecto a su predecesor. El repositorio publicado bajo el identificador `arbonquants/Kimi-K2.7-Code` es una réplica (mirror) del modelo original de Moonshot AI.

El modelo emplea una arquitectura transformer con atención MLA (Multi-head Latent Attention), 61 capas (una de ellas densa), 384 expertos en total con 8 expertos seleccionados por token más un experto compartido, y una dimensión de atención de 7168. Cuenta con 1 billón (1T) de parámetros totales, de los cuales 32B están activos por token, y una longitud de contexto de 256K tokens. Incorpora además un codificador visual MoonViT de 400M de parámetros, lo que lo habilita para tareas image-text-to-text.

Su relevancia actual radica en que compite directamente con modelos propietarios de primer nivel en benchmarks de código y agentes (Kimi Code Bench v2, Program Bench, MCP Atlas, entre otros), manteniendo una licencia modificada de tipo MIT que permite su uso y despliegue. La eficiencia de tokens en modo thinking y su ventana de contexto de 256K lo posicionan como una opción atractiva para pipelines de ingeniería de software automatizada y agentes autónomos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con atención MLA |
| Parametros totales | 1T (1.026.879.376.368 según safetensors) |
| Parametros activos | 32B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | compressed-tensors (formato de pesos comprimidos); no se detallan otros esquemas en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (license: other) |
| Formato de pesos | safetensors, compressed-tensors |

Otros datos técnicos: 61 capas (1 densa), dimensión de atención 7168, dimensión oculta MoE por experto 2048, 64 cabezas de atención, 384 expertos, 8 expertos seleccionados por token, 1 experto compartido, vocabulario de 160K, función de activación SwiGLU, codificador visual MoonViT de 400M de parámetros. Tamaño del repositorio: 595,2 GB.

## Arquitectura y entrenamiento

Kimi K2.7 Code es un transformer MoE con atención MLA (Multi-head Latent Attention), una variante de atención que comprime las representaciones de claves y valores para reducir el coste de memoria en contextos largos. La capa de mezcla de expertos incorpora 384 expertos con enrutamiento top-8 más un experto compartido, sobre una dimensión oculta de 2048 por experto, con SwiGLU como función de activación. El modelo incluye un codificador visual MoonViT de 400M de parámetros que le permite procesar entradas de imagen y texto.

El modelo se construye sobre Kimi K2.6 mediante un proceso de mejora orientado a tareas de código de horizonte largo. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación destacada por el autor es la mejora en la finalización de tareas de ingeniería de software complejas y la reducción de aproximadamente un 30 % en el uso de thinking tokens respecto a K2.6, lo que se traduce en una mayor eficiencia en modo razonamiento.

## Capacidades

- Generación de texto y razonamiento en modo thinking, con soporte de razonamiento multi-paso.
- Generación y edición de código en más de 10 lenguajes de programación de uso extendido, orientada a tareas de ingeniería de software reales.
- Capacidades agénticas: resolución de tareas de extremo a extremo en flujos de trabajo de software complejos.
- Soporte de tool calling y function calling, evidenciado por los benchmarks MCP Atlas y MCP Mark Verified.
- Integración con el protocolo MCP (Model Context Protocol) para agentes.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el codificador MoonViT.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking con eficiencia mejorada (reducción de ~30 % de thinking tokens frente a K2.6).

## Casos de uso

- Agentes de codificación autónomos: el modelo puede resolver tareas de ingeniería de software de extremo a extremo en un bucle agéntico, apoyándose en su contexto de 256K tokens y en su soporte de tool calling para inspeccionar repositorios, ejecutar pruebas y aplicar parches.
- Integración en CLI de desarrollo (Kimi Code CLI): se emplea como motor de un asistente de línea de comandos que interpreta instrucciones en lenguaje natural y ejecuta cambios sobre el código, con modo thinking activado para tareas complejas.
- Automatización de incidencias en producción: gracias a su entrenamiento en casos de incidentes reales y su capacidad de razonamiento multi-paso, puede diagnosticar fallos en servicios backend e infraestructura y proponer correcciones.
- Orquestación de herramientas vía MCP: los resultados en MCP Atlas (76,0) y MCP Mark Verified (81,1) lo hacen adecuado para agentes que invocan herramientas externas mediante el Model Context Protocol en pipelines de CI/CD.
- Revisión y refactorización de código a gran escala: la ventana de 256K tokens permite cargar módulos completos o múltiples ficheros en una sola pasada para tareas de análisis y refactorización coherente.
- Asistencia multimodal en desarrollo: el codificador MoonViT permite procesar capturas de pantalla, diagramas o mockups junto con texto, útil para generar código a partir de diseños de interfaz o documentación visual.
- Tareas de rendimiento e infraestructura: el benchmark interno cubre backend, infraestructura y rendimiento, por lo que puede emplearse en optimización de servicios y análisis de cuellos de botella.

## Benchmarks y rendimiento

Resultados publicados por el autor (modo thinking activado, temperatura 1.0, top-p 0.95, contexto de 262.144 tokens para K2.7 Code y K2.6):

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

Nota: Kimi Code Bench v2 es un benchmark interno del autor que evalúa agentes de codificación en tareas reales de más de 10 lenguajes y un stack de producción completo. GPT-5.5 se evaluó en Codex con modo xhigh y Claude Opus 4.8 en Claude Code con modo xhigh.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 1T de parámetros totales y pesos en safetensors de aproximadamente 595 GB, la inferencia en precisión completa requiere un clúster multi-GPU de gran escala; los pesos publicados usan compresión (compressed-tensors), lo que reduce el requisito respecto a BF16 puro.
- GPU recomendadas: no especificadas en la información disponible. Por el tamaño del modelo, se requiere un despliegue multi-nodo con GPUs de centro de datos (tipo A100/H100 o superiores); no es viable en GPUs de consumo.
- ¿Cabe en GPU de consumo? No. Con 1T de parámetros y 595 GB de pesos, no cabe en ninguna GPU consumer actual (RTX 4090, etc.).
- Opciones de despliegue: la librería indicada es transformers con `custom_code`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible. El formato compressed-tensors sugiere soporte de compresión para servir el modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Kimi Code Bench v2 | MCP Atlas |
|---|---|---|---|---|---|---|
| Kimi K2.7 Code | 1T | 32B | 256K | modified-mit | 62,0 | 76,0 |
| Kimi K2.6 | no disponible | no disponible | no disponible | no disponible | 50,9 | 69,4 |
| GPT-5.5 | no disponible | no disponible | no disponible | propietaria | 69,0 | 79,4 |
| Claude Opus 4.8 | no disponible | no disponible | no disponible | propietaria | 67,4 | 81,3 |

Kimi K2.7 Code mejora a K2.6 en todos los benchmarks publicados, pero queda por detrás de GPT-5.5 y Claude Opus 4.8 en la mayoría de métricas, salvo en MCP Mark Verified, donde supera a Claude Opus 4.8 (81,1 frente a 76,4). Los datos de parámetros, contexto y licencia de los modelos comparables no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada; como modelo generativo de código, existe riesgo de generar APIs, funciones o dependencias inexistentes.
- Limitaciones de contexto o idioma: el contexto es de 256K tokens; los idiomas soportados no están disponibles, por lo que no se puede confirmar cobertura multilingüe más allá del inglés técnico habitual en código.
- Restricciones de licencia: licencia "modified-mit" (license: other). Es una licencia modificada, no MIT estándar, por lo que conviene revisar el texto completo en el repositorio antes de uso comercial.
- El repositorio `arbonquants/Kimi-K2.7-Code` es una réplica de terceros (22 descargas, 0 likes, creado el 2026-10-29); el modelo original se publica bajo la organización `moonshotai` en HuggingFace.
- Los benchmarks Kimi Code Bench v2 y Kimi Claw 24/7 Bench son internos del autor, lo que limita la comparabilidad independiente.
- El tamaño del modelo (595 GB de pesos, 1T de parámetros) implica un coste de despliegue muy elevado y requiere infraestructura de centro de datos.
- El pipeline declarado es image-text-to-text, pero no se detallan las capacidades multimodales más allá del codificador MoonViT.

## Enlaces

- Repositorio HuggingFace (réplica): https://huggingface.co/arbonquants/Kimi-K2.7-Code
- Organización Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Modelo original (referencia en la model card): https://huggingface.co/moonshotai/Kimi-K2.7-Code
- Licencia: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
- Página de Kimi Code: https://www.kimi.com/code
- Homepage de Moonshot AI: https://www.moonshot.ai
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
