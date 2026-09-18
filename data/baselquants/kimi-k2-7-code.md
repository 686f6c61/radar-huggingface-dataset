# baselquants/Kimi-K2.7-Code

## Resumen

Kimi K2.7 Code es un modelo de lenguaje multimodal orientado a código y a flujos de trabajo agénticos, construido sobre Kimi K2.6. La model card lo atribuye a Moonshot AI y lo describe como una mejora sustancial en tareas de programación de horizonte largo, con mejoras en la finalización de tareas de ingeniería de software de extremo a extremo y una reducción de aproximadamente el 30% en el uso de tokens de pensamiento respecto a Kimi K2.6. La ficha que nos ocupa, sin embargo, corresponde al repositorio `baselquants/Kimi-K2.7-Code`, publicado por un tercero (usuario `baselquants`) con pesos en formato `compressed-tensors`, no al repositorio oficial de Moonshot AI.

Arquitectónicamente es un transformer de tipo Mixture-of-Experts (MoE) con 1 billón de parámetros totales (1.026.879.376.368 según los pesos reales en safetensors) y 32.000 millones de parámetros activos por token. Incorpora 61 capas (una densa), 384 expertos con 8 seleccionados por token y 1 experto compartido, atención MLA (Multi-head Latent Attention), función de activación SwiGLU y un vocabulario de 160.000 tokens. La ventana de contexto declarada es de 256K tokens.

Su relevancia actual radica en que compite directamente en benchmarks de código agéntico con modelos propietarios de frontera (GPT-5.5, Claude Opus 4.8) manteniendo un coste de inferencia muy inferior al de un modelo denso de 1T, gracias a que solo se activan 32B de parámetros. Además, la inclusión del encoder de visión MoonViT (400M de parámetros) lo convierte en un modelo image-text-to-text, capaz de razonar sobre capturas de pantalla, diagramas o interfaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con atencion MLA |
| Parametros totales | 1.026.879.376.368 (~1T) |
| Parametros activos | 32B por token |
| Longitud de contexto | 256K tokens (262.144 en evaluacion) |
| Tipos de cuantizacion | `compressed-tensors` (repositorio cuantizado; el detalle exacto de esquema por capa no esta disponible) |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (etiquetada como `license: other` / `license_name: modified-mit`) |
| Formato de pesos | safetensors (con `compressed-tensors`, requiere `custom_code`) |
| Capas totales | 61 (1 densa) |
| Dimension de atencion | 7168 |
| Dimension oculta MoE por experto | 2048 |
| Cabezas de atencion | 64 |
| Numero de expertos | 384 |
| Expertos seleccionados por token | 8 |
| Expertos compartidos | 1 |
| Tamano de vocabulario | 160K |
| Funcion de activacion | SwiGLU |
| Encoder de vision | MoonViT (400M de parametros) |
| Tamano del repositorio | 595,2 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con arquitectura Mixture-of-Experts. Cada token activa 8 de los 384 expertos enrutados mas 1 experto compartido, de modo que, pese a contar con 1T de parametros totales, el coste computacional por token corresponde a 32B. La atencion es de tipo MLA (Multi-head Latent Attention), una variante que comprime las claves y valores en un espacio latente de baja dimension para reducir el coste de memoria de la cache KV, algo critico con ventanas de 256K tokens. La dimension de atencion es de 7168 y hay 64 cabezas. La funcion de activacion es SwiGLU, con una capa densa inicial y 60 capas MoE.

El componente multimodal lo aporta un encoder de vision MoonViT de 400M de parametros, que habilita la entrada de imagenes junto al texto. Segun la model card, Kimi K2.7 Code se construye sobre Kimi K2.6 y su foco de entrenamiento son tareas de programacion de horizonte largo y flujos agénticos reales. La model card menciona una reduccion de aproximadamente el 30% en el consumo de tokens de pensamiento respecto a K2.6, lo que sugiere un ajuste orientado a la eficiencia en la fase de razonamiento extendido, pero no se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas concretas de alineamiento (RLHF, DPO u otras).

No se dispone de informacion sobre innovaciones adicionales como decodificacion especulativa, y tampoco se detalla si el repositorio `baselquants` aplica una cuantizacion propia sobre los pesos originales o si replica el esquema oficial. La etiqueta `kimi_k25` en los tags apunta a una implementacion de arquitectura con codigo personalizado.

## Capacidades

- Generacion de codigo en mas de 10 lenguajes de programacion, segun la descripcion del benchmark interno Kimi Code Bench V2.
- Razonamiento agéntico de multiples pasos orientado a completar tareas de ingenieria de software de extremo a extremo.
- Modo de pensamiento (thinking mode) activable, evaluado con temperatura 1.0 y top-p 0.95.
- Soporte de tool calling y uso de servidores MCP, medido en los benchmarks MCP Atlas y MCP Mark Verified.
- Capacidad multimodal de entrada imagen-texto gracias al encoder MoonViT, util para interpretar capturas de pantalla, diagramas o interfaces graficas.
- Ventana de contexto de 256K tokens, adecuada para repositorios completos o sesiones agénticas prolongadas.
- Uso en CLI agéntica propia (Kimi Code CLI) segun la metodologia de evaluacion descrita.
- Idiomas soportados: no disponible. La model card no desglosa cobertura linguistica.

## Casos de uso

- Asistente de programacion en terminal: integrado mediante Kimi Code CLI o un cliente compatible, el modelo puede resolver tareas de refactorizacion sobre un repositorio completo aprovechando la ventana de 256K tokens.
- Reparacion de incidencias en produccion: con acceso a trazas, logs y el arbol del proyecto, el modelo puede correlacionar sintomas con causas y proponer parches, un escenario medido por el benchmark Program Bench.
- Agente autonomo con herramientas: a traves de tool calling y servidores MCP, puede orquestar llamadas a APIs, bases de datos y sistemas de ficheros en flujos de varios pasos.
- Generacion y revision de codigo en CI/CD: como paso de analisis previo al merge, revisando diffs y detectando regresiones en pipelines automatizados.
- Analisis de interfaces graficas: gracias al encoder de vision, puede interpretar capturas de pantalla de aplicaciones y generar el codigo de componentes equivalentes.
- Migracion de bases de codigo entre frameworks: la ventana larga permite cargar modulos completos y planificar transformaciones coherentes entre ficheros.
- Asistencia a equipos de plataforma e infraestructura: tareas de configuracion, ajuste de rendimiento y diagnostico de servicios backend, area enfatizada por la descripcion del benchmark interno.
- Soporte tecnico especializado con documentacion extensa: ingesta de manuales largos y respuesta a consultas tecnicas con contexto completo.

## Benchmarks y rendimiento

Resultados publicados en la model card. Las condiciones de evaluacion indican thinking mode activado, temperatura 1.0, top-p 0.95 y contexto de 262.144 tokens para los modelos Kimi; GPT-5.5 se ejecuto en Codex con modo xhigh y Claude Opus 4.8 en Claude Code con modo xhigh.

| Benchmark | Kimi K2.6 | Kimi K2.7 Code | GPT-5.5 | Claude Opus 4.8 |
|---|---|---|---|---|
| Kimi Code Bench v2 (codigo) | 50,9 | 62,0 | 69,0 | 67,4 |
| Program Bench (codigo) | 48,3 | 53,6 | 69,1 | 63,8 |
| MLS Bench Lite (codigo) | 26,7 | 35,1 | 35,5 | 42,8 |
| Kimi Claw 24/7 Bench (agentico) | 42,9 | 46,9 | 52,8 | 50,4 |
| MCP Atlas (agentico) | 69,4 | 76,0 | 79,4 | 81,3 |
| MCP Mark Verified (agentico) | 72,8 | 81,1 | 92,9 | 76,4 |

Kimi K2.7 Code mejora a su predecesor en las seis metricas. Frente a los modelos propietarios queda por detras en todas salvo en MCP Mark Verified, donde supera a Claude Opus 4.8 (81,1 frente a 76,4). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 2 TB para los 1,03T de parametros, inviable en cualquier configuracion de una sola maquina convencional.
- VRAM estimada en FP8: alrededor de 1 TB. El repositorio cuantizado ocupa 595,2 GB, lo que sugiere un esquema mixto de cuantizacion; cargar los pesos requiere al menos esa cantidad de memoria agregada.
- Despliegue en centro de datos: se necesitan nodos multi-GPU, por ejemplo 8x H100 80 GB o 8x H200 para cubrir los pesos y la cache KV de contexto largo. La estimacion exacta de VRAM por configuracion no esta disponible.
- GPU de consumo: no cabe en una GPU de consumo (RTX 4090, 24 GB). Solo es viable con estrategias de offloading de expertos a CPU/RAM.
- Opciones de despliegue: al ser un MoE con 32B activos, es candidato a offloading selectivo de expertos (herramientas tipo ktransformers) sobre una GPU con gran cantidad de RAM de sistema. La compatibilidad con vLLM, TGI o llama.cpp no se especifica en la informacion disponible; los tags indican `transformers` y `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K2.7 Code (este repositorio) | 1,03T | 32B | 256K | modified-mit | Pesos abiertos, repo de terceros, 595,2 GB |
| Kimi K2.6 | no disponible | no disponible | no disponible | no disponible | Predecesor, disponible en el ecosistema Moonshot AI |
| GPT-5.5 | no disponible | no disponible | no disponible | Propietaria | Solo API (Codex) |
| Claude Opus 4.8 | no disponible | no disponible | no disponible | Propietaria | Solo API (Claude Code) |

En la franja de MoE abiertos de escala similar (1T totales / decenas de miles de millones activos) existen alternativas de otros fabricantes, pero no se dispone de datos verificables en la informacion proporcionada para establecer una comparacion rigurosa de parametros, contexto y licencia.

## Limitaciones y advertencias

- El repositorio esta publicado por `baselquants`, no por `moonshotai`. No se puede verificar la integridad de los pesos cuantizados ni que reproduzcan fielmente el modelo oficial; conviene contrastar contra el repositorio de Moonshot AI antes de usarlo en produccion.
- La licencia se declara como `modified-mit` bajo la etiqueta `license: other`. Es una licencia modificada, no MIT estandar, por lo que hay que revisar el texto completo antes de un uso comercial.
- La model card no especifica los idiomas soportados, por lo que no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos del ingles sin evaluacion propia.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de codigo donde una API inventada o una firma incorrecta puede compilar pero fallar en ejecucion.
- Los benchmarks presentados son en parte internos (Kimi Code Bench v2, Kimi Claw 24/7 Bench), lo que limita su comparabilidad externa.
- Las cifras de rendimiento de GPT-5.5 y Claude Opus 4.8 se obtuvieron con configuraciones de decodificacion distintas (modo xhigh), por lo que la comparacion no es estrictamente homogenea.
- Requisitos de hardware extremos: 595,2 GB de pesos y cerca de 2 TB en precision completa hacen inviable el despliegue en infraestructura de gama media.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- El tag `custom_code` implica que la carga requiere `trust_remote_code=True`, con el riesgo de seguridad asociado a ejecutar codigo de un tercero.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni composicion del corpus.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/baselquants/Kimi-K2.7-Code
- Modelo original en HuggingFace (Moonshot AI): https://huggingface.co/moonshotai/Kimi-K2.7-Code
- Licencia: https://huggingface.co/moonshotai/Kimi-K2.7-Code/blob/main/LICENSE
- Organizacion Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Web oficial de Moonshot AI: https://www.moonshot.ai
- Producto Kimi Code: https://www.kimi.com/code
- Twitter/X de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- ModelScope de Moonshot AI: https://modelscope.cn/organization/moonshotai
