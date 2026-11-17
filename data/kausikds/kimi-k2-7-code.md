# kausikds/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) orientado a tareas de programacion y flujos de trabajo agénticos, desarrollado por Moonshot AI. Se presenta como una evolucion de Kimi K2.6, con mejoras sustanciales en tareas de codigo de horizonte largo y una reduccion de aproximadamente el 30 % en el uso de tokens de razonamiento (thinking tokens) respecto a su predecesor. El modelo combina un transformer con atencion MLA (Multi-head Latent Attention), 384 expertos enrutados y un codificador visual MoonViT de 400 M de parametros, lo que lo habilita para tareas de imagen-texto ademas de generacion de codigo.

Con 1 billon (1T) de parametros totales y 32B activos por token, K2.7 Code se posiciona en la categoria de modelos frontera de gran escala, pero con un coste de inferencia contenido gracias al enrutamiento MoE. Su ventana de contexto alcanza los 256K tokens, lo que lo hace adecuado para razonamiento multi-paso sobre repositorios completos y conversaciones largas con herramientas. La licencia es "modified-mit" (MIT modificada), lo que permite uso comercial con ciertas condiciones que conviene revisar en el fichero LICENSE del repositorio.

La relevancia actual del modelo radica en su enfoque especifico hacia agentes de codigo: los benchmarks publicados (Kimi Code Bench v2, Program Bench, MCP Atlas) muestran mejoras claras frente a K2.6 y una competitividad razonable frente a modelos propietarios como GPT-5.5 o Claude Opus 4.8, aunque sin alcanzarlos en la mayoria de las metricas. El repositorio en Hugging Face es una copia subida por un tercero (kausikds), no el repositorio oficial de Moonshot AI, lo que conviene tener en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, atencion MLA, activacion SwiGLU |
| Parametros totales | 1.026.879.376.368 (1T) |
| Parametros activos | 32B |
| Longitud de contexto | 256K tokens (262.144 en evaluacion) |
| Tipos de cuantizacion | no disponible (el repo usa compressed-tensors, pero no se detallan esquemas) |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (MIT modificada) |
| Formato de pesos | safetensors (con custom_code y compressed-tensors) |

Otros datos de arquitectura: 61 capas (1 densa), dimension oculta de atencion 7168, dimension oculta MoE por experto 2048, 64 cabezas de atencion, 384 expertos con 8 seleccionados por token, 1 experto compartido, vocabulario de 160K, codificador visual MoonViT de 400M de parametros. Tamano del repo: 595,2 GB.

## Arquitectura y entrenamiento

Kimi K2.7 Code es un transformer decoder-only con arquitectura Mixture-of-Experts. Cada token activa 8 de los 384 expertos enrutados mas 1 experto compartido, lo que da lugar a 32B parametros activos sobre un total de 1T. La atencion utiliza MLA (Multi-head Latent Attention), que comprime las claves y valores en un espacio latente para reducir el coste de memoria del KV cache en contextos largos, algo critico con una ventana de 256K tokens. La funcion de activacion es SwiGLU y el vocabulario es de 160K tokens. El modelo incorpora un codificador visual MoonViT de 400M de parametros, lo que justifica la pipeline `image-text-to-text` y su capacidad multimodal.

La model card indica que K2.7 Code se construye sobre Kimi K2.6, con mejoras enfocadas en tareas de codigo de horizonte largo y eficiencia de tokens de razonamiento (reduccion de ~30 % en thinking tokens). No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o RL especifico. Tampoco se describe la innovacion de decodificacion especulativa ni otras optimizaciones de inferencia mas alla de MLA y el enrutamiento MoE.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con enfasis en tareas de ingenieria de software reales (backend, infraestructura, rendimiento, incidencias en produccion).
- Razonamiento multi-paso y modo "thinking" (la model card menciona thinking mode habilitado en las evaluaciones).
- Capacidades agénticas: ejecucion de tareas de horizonte largo, uso de herramientas y finalizacion end-to-end de flujos de trabajo.
- Soporte de tool calling / function calling, evidenciado por los benchmarks MCP Atlas y MCP Mark Verified (protocolo MCP).
- Capacidades multimodales imagen-texto gracias al codificador MoonViT (pipeline `image-text-to-text`).
- Capacidades multilingues: no se especifican idiomas concretos en la informacion disponible.
- Eficiencia de tokens de razonamiento: ~30 % menos thinking tokens que K2.6, lo que reduce coste y latencia en produccion.

## Casos de uso

- Agente de codigo autonomo en IDE o CLI: el modelo puede resolver tareas de ingenieria de software de horizonte largo (se evaluo con Kimi Code CLI) con contexto de 256K tokens, suficiente para cargar un repositorio mediano y razonar sobre multiples ficheros.
- Automatizacion de incidencias en produccion: con su enfasis en tareas de backend e infraestructura, puede analizar logs, trazas y codigo para proponer parches y verificar correcciones dentro de un pipeline de CI/CD.
- Integracion via MCP (Model Context Protocol): los benchmarks MCP Atlas y MCP Mark Verified indican soporte para conectar herramientas externas (bases de datos, APIs, sistemas de ficheros), util para asistentes de operaciones.
- Revision de codigo asistida: el contexto largo permite comparar diffs grandes y detectar regresiones en pull requests extensos, con razonamiento multi-paso sobre el historial del repositorio.
- Generacion de tests y documentacion tecnica: el modelo puede inspeccionar modulos completos y producir suites de pruebas o documentacion coherente con el codigo existente.
- Asistente multimodal para tareas de UI/UX: gracias al codificador MoonViT, puede interpretar capturas de pantalla o diagramas y traducirlos a codigo o a descripciones tecnicas.
- Migracion y refactorizacion de codebases: con 256K de contexto y capacidad agéntica, puede planificar y ejecutar refactorizaciones por etapas manteniendo coherencia entre ficheros.

## Benchmarks y rendimiento

Datos publicados en la model card (thinking mode, temperatura 1.0, top-p 0.95, contexto 262.144):

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified | 72,8 | 81,1 | 92,9 | 76,4 |

No se han publicado en la informacion disponible resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1T de parametros totales, los pesos en precision completa no caben en una sola GPU; el repo ocupa 595,2 GB. En cuantizacion de 4 bits se estima un requisito del orden de 500-600 GB de VRAM agregada, aunque no se detallan esquemas de cuantizacion en la informacion disponible.
- GPU recomendadas: despliegue multi-GPU con H100 (80 GB) o A100 (80 GB); se necesitarian multiples unidades para alojar el modelo. No cabe en GPUs de consumo como RTX 4090 (24 GB) en configuracion completa.
- Opciones de despliegue: al ser un modelo `transformers` con `custom_code` y `compressed-tensors`, requiere la libreria transformers y posiblemente kernels especificos. No se confirma soporte en vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimi K2.7 Code | 1T totales / 32B activos | 256K | modified-mit | Hugging Face (copia de tercero) |
| Kimi K2.6 | no disponible | no disponible | no disponible | Hugging Face (Moonshot AI) |
| GPT-5.5 | no disponible | no disponible | propietaria | API (Codex) |
| Claude Opus 4.8 | no disponible | no disponible | propietaria | API (Claude Code) |

En rendimiento, K2.7 Code supera a K2.6 en todos los benchmarks publicados, pero queda por debajo de GPT-5.5 y Claude Opus 4.8 en la mayoria de las metricas, con la excepcion de MCP Mark Verified, donde supera a Opus 4.8 (81,1 frente a 76,4). No se dispone de datos de parametros ni contexto de los modelos propietarios comparados.

## Limitaciones y advertencias

- El repositorio de Hugging Face es una copia subida por un tercero (kausikds), no el repositorio oficial de Moonshot AI; conviene verificar integridad y procedencia antes de usarlo en produccion.
- La licencia "modified-mit" incluye condiciones adicionales respecto a MIT estandar; es necesario revisar el fichero LICENSE para uso comercial.
- No se detallan los idiomas soportados, por lo que el rendimiento en castellano no esta garantizado.
- No se han publicado datos sobre sesgos, alucinacion o robustez fuera de los benchmarks de codigo y agentes.
- El modelo es muy grande (595,2 GB en repo), lo que implica costes de despliegue elevados y necesidad de infraestructura multi-GPU.
- Los benchmarks publicados son en su mayoria internos (Kimi Code Bench v2, Kimi Claw 24/7 Bench, MLS Bench Lite), lo que limita la comparabilidad independiente.
- No se especifican esquemas de cuantizacion concretos, lo que dificulta planificar el despliegue en hardware limitado.
- El modo thinking incrementa el consumo de tokens; aunque K2.7 reduce ~30 % frente a K2.6, sigue siendo un coste relevante en produccion.

## Enlaces

- Hugging Face (copia de tercero): https://huggingface.co/kausikds/Kimi-K2.7-Code
- Organizacion oficial en Hugging Face: https://huggingface.co/moonshotai
- Pagina de Kimi Code: https://www.kimi.com/code
- Homepage de Moonshot AI: https://www.moonshot.ai
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
- Licencia (referencia en la model card): https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
