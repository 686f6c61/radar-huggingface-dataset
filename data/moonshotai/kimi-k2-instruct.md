# moonshotai/Kimi-K2-Instruct

## Resumen

Kimi K2 Instruct es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Moonshot AI, con 1 billon de parametros totales y 32.000 millones de parametros activados por token. Se presenta como un modelo orientado a capacidades agenticas: uso de herramientas, razonamiento multi-paso y resolucion autonoma de problemas, ademas de rendimiento competitivo en tareas de codigo y conocimiento general. La version Instruct es el modelo post-entrenado, descrito por el autor como "reflex-grade", es decir, sin modo de pensamiento largo prolongado, pensado para uso directo en chat y flujos agenticos.

El modelo fue preentrenado sobre 15,5 billones de tokens con el optimizador Muon (variante denominada MuonClip por el autor) y una arquitectura MoE con 384 expertos, 8 expertos seleccionados por token y 1 experto compartido, sobre 61 capas y una ventana de contexto de 128.000 tokens. La atencion utiliza mecanismo MLA (Multi-head Latent Attention) y activacion SwiGLU en las capas de expertos.

Su relevancia actual reside en que acerca capacidades de nivel frontera a un modelo de pesos abiertos con licencia modificada MIT, lo que permite despliegue propio, ajuste fino y evaluacion reproducible en tareas de codigo y agentes, un terreno donde hasta ahora dominaban modelos propietarios. Existe una version posterior, Kimi-K2-Instruct-0905, que el autor marca como `new_version`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion MLA |
| Parametros totales | 1.026.408.235.864 (~1 B) segun safetensors |
| Parametros activos | ~32.000 millones (32B) |
| Longitud de contexto | 128.000 tokens (128K) |
| Tipos de cuantizacion | Pesos publicados en FP8; otros formatos (GGUF, AWQ, GPTQ) no especificados en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Modified MIT (licencia `other`, `license_name: modified-mit`) |
| Formato de pesos | safetensors (repo de 1.029,2 GB) |

Datos arquitectonicos adicionales declarados por el autor:

| Parametro | Valor |
|---|---|
| Numero de capas (incluida capa densa) | 61 |
| Capas densas | 1 |
| Dimension oculta de atencion | 7.168 |
| Dimension oculta MoE (por experto) | 2.048 |
| Numero de cabezas de atencion | 64 |
| Numero de expertos | 384 |
| Expertos seleccionados por token | 8 |
| Expertos compartidos | 1 |
| Tamano de vocabulario | 160K |
| Funcion de activacion | SwiGLU |

## Arquitectura y entrenamiento

Kimi K2 es un transformer disperso de tipo MoE. Cada token activa 8 de los 384 expertos enrutados mas 1 experto compartido, sobre un total de 61 capas (una de ellas densa). La dimension oculta de atencion es de 7.168 y cada experto tiene una dimension oculta de 2.048. El mecanismo de atencion es MLA (Multi-head Latent Attention), que comprime las representaciones de clave y valor para reducir el coste de memoria de la cache KV, algo relevante con una ventana de 128K tokens. El vocabulario es de 160.000 entradas y la funcion de activacion es SwiGLU.

El preentrenamiento se realizo sobre 15,5 billones de tokens. El autor destaca que fue el primer entrenamiento a esta escala con el optimizador Muon sin inestabilidades, mediante una tecnica propia denominada MuonClip. No se detalla en la informacion proporcionada la composicion exacta del dataset ni el pipeline completo de post-entrenamiento (si hubo RLHF, DPO u otras tecnicas de alineacion). La model card introduce dos variantes: Kimi-K2-Base, el modelo fundacional para ajuste fino, y Kimi-K2-Instruct, el modelo post-entrenado para chat y uso agentico.

## Capacidades

- Generacion de texto y conversacion multi-turno con ventana de 128K tokens.
- Generacion de codigo y resolucion de problemas de programacion competitiva (evaluado en LiveCodeBench v6, OJBench y MultiPL-E).
- Capacidades agenticas: uso de herramientas, razonamiento multi-paso y resolucion autonoma de tareas, segun el diseno declarado por el autor.
- Integracion con plantillas de chat que soportan tool calling multi-turno (el autor corrigio un fallo de la plantilla que rompia las llamadas a herramientas en varios turnos).
- Soporte del campo `name` en los mensajes del chat template.
- Tokenizer actualizado, capaz de codificar tokens especiales como `[EOS]` a sus IDs.
- Modelo etiquetado como "reflex-grade", sin modo de pensamiento largo extendido.
- Multilingue: no se detallan los idiomas soportados en la informacion disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Agentes de ingenieria de software: el modelo esta disenado para uso de herramientas y resolucion autonoma de tareas, y ha sido evaluado en SWE-bench Verified y OJBench, por lo que encaja en agentes que leen un repositorio, editan ficheros y ejecutan pruebas en bucle.
- Asistentes de atencion al cliente multi-turno: con 128K tokens de contexto puede mantener el historial completo de conversaciones largas y consultar documentacion extensa sin truncar, manteniendo coherencia entre turnos.
- Generacion de codigo en pipelines de CI/CD: al soportar tool calling y plantillas de chat robustas para llamadas multi-turno, puede integrarse en flujos que invocan linters, compiladores o ejecutores de tests mediante funciones externas.
- Programacion competitiva y generacion de algoritmos: sus resultados declarados en LiveCodeBench v6 (53,7 pass@1) y OJBench (27,1 pass@1) lo situan como candidato para asistentes de entrenamiento algoritmico y generacion de soluciones en varios lenguajes (MultiPL-E, 85,7 pass@1).
- Analisis de documentacion larga: contratos, informes tecnicos o bases de codigo que caben en 128K tokens pueden procesarse en una sola pasada, evitando estrategias de troceado y recuperacion.
- Orquestacion de flujos agenticos multi-herramienta: su entrenamiento orientado a agentes permite encadenar busquedas, calculos, APIs y edicion de datos en tareas de automatizacion de procesos.
- Base para ajuste fino e investigacion: la variante Kimi-K2-Base permite a equipos de investigacion adaptar el modelo a dominios concretos con control total sobre los pesos.
- Despliegue en entornos con requisitos de soberania de datos: al ser pesos abiertos bajo licencia modificada MIT, puede alojarse en infraestructura propia sin dependencia de API externa, siempre que se cumplan las condiciones de licencia.

## Benchmarks y rendimiento

Resultados de evaluacion publicados en la model card para el modelo Instruct (la tabla original fue truncada en la informacion disponible; solo se reproducen las filas completas):

| Benchmark | Metrica | Kimi K2 Instruct | DeepSeek-V3-0324 | Qwen3-235B-A22B (non-thinking) | Claude Sonnet 4 (sin thinking) | Claude Opus 4 (sin thinking) | GPT-4.1 | Gemini 2.5 Flash Preview (05-20) |
|---|---|---|---|---|---|---|---|---|
| LiveCodeBench v6 (ago 24 - may 25) | Pass@1 | 53,7 | 46,9 | 37,0 | 48,5 | 47,4 | 44,7 | 44,7 |
| OJBench | Pass@1 | 27,1 | 24,0 | 11,3 | 15,3 | 19,6 | 19,5 | 19,5 |
| MultiPL-E | Pass@1 | 85,7 | 83,1 | 78,2 | 88,6 | 89,6 | 86,7 | 85,6 |

En la informacion disponible no se incluyen resultados completos de MMLU, GSM8K ni de SWE-bench Verified (la fila aparece cortada), por lo que no se reproducen cifras para esos benchmarks.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros y no estan confirmadas por el autor:

- Pesos en FP8: aproximadamente 1 TB de VRAM solo para los pesos (1.026.408 millones de parametros). Requiere agregacion de memoria en multiples GPU.
- Pesos en cuantizacion de 4 bits: del orden de 500-550 GB, todavia fuera del alcance de una sola GPU de consumo.
- GPU recomendadas: H100 de 80 GB, H200 de 141 GB o A100 de 80 GB en configuraciones multiples. Como referencia, se necesitarian aproximadamente 14-16 aceleradores de 80 GB para los pesos en FP8, y del orden de 8 para 4 bits.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090, ni siquiera con cuantizacion agresiva, dado el tamano del modelo. Los usuarios de hardware de consumo dependen de endpoints remotos.
- Opciones de despliegue: requiere frameworks con soporte para la arquitectura `kimi_k2` y codigo personalizado (`custom_code`), como vLLM o SGLang. No se detalla en la informacion proporcionada el soporte de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Rendimiento (datos aportados) |
|---|---|---|---|---|
| Kimi K2 Instruct | 1 B / 32B | 128K | Modified MIT | LiveCodeBench v6 53,7; OJBench 27,1; MultiPL-E 85,7 |
| DeepSeek-V3-0324 | no disponible en la informacion proporcionada | no disponible | no disponible | LiveCodeBench v6 46,9; OJBench 24,0; MultiPL-E 83,1 |
| Qwen3-235B-A22B (non-thinking) | no disponible en la informacion proporcionada | no disponible | no disponible | LiveCodeBench v6 37,0; OJBench 11,3; MultiPL-E 78,2 |
| Claude Sonnet 4 (sin thinking) | no disponible (modelo propietario) | no disponible | propietaria | LiveCodeBench v6 48,5; OJBench 15,3; MultiPL-E 88,6 |

Kimi K2 Instruct obtiene el mejor resultado de la comparativa en LiveCodeBench v6 y OJBench, mientras que Claude Opus 4 y Claude Sonnet 4 le superan en MultiPL-E. La model card tambien incluye comparaciones con Claude Opus 4, GPT-4.1 y Gemini 2.5 Flash Preview, cuyos datos completos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion proporcionada. Al ser un modelo entrenado sobre datos web a gran escala, es esperable que reproduzca sesgos presentes en esos datos, aunque el autor no publica una evaluacion especifica.
- Riesgo de alucinacion: no se cuantifica en la model card. El modelo no dispone de modo de pensamiento largo, lo que puede reducir la verificacion interna en tareas de razonamiento complejo.
- Limitaciones de contexto: la ventana es de 128K tokens; las tareas que excedan esa longitud requieren troceado o recuperacion externa.
- Idiomas: no se especifican los idiomas soportados ni su calidad relativa, lo que es un riesgo para despliegues multilingues.
- Licencia: se trata de una licencia Modified MIT, no MIT estandar. Es imprescindible revisar los terminos completos antes de un uso comercial, especialmente las condiciones adicionales que el autor haya anadido.
- Versionado: existe una version posterior, Kimi-K2-Instruct-0905, marcada como `new_version` en la model card. Conviene evaluar si es preferible desplegar esa revision.
- Requisitos de infraestructura: el tamano del modelo (mas de 1 TB en FP8) excluye el despliegue en hardware de consumo y encarece cualquier inferencia local.
- Estado del repositorio: la model card ha recibido correcciones de plantilla de chat y tokenizer (julio y agosto de 2025), incluyendo un fallo que rompia las llamadas a herramientas multi-turno; conviene usar una revision reciente del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moonshotai/Kimi-K2-Instruct
- Version posterior: https://huggingface.co/moonshotai/Kimi-K2-Instruct-0905
- Repositorio GitHub: https://github.com/moonshotai/Kimi-K2
- Blog tecnico: https://moonshotai.github.io/Kimi-K2/
- Paper (informe tecnico): https://github.com/MoonshotAI/Kimi-K2/blob/main/tech_report.pdf
- Licencia: https://github.com/moonshotai/Kimi-K2/blob/main/LICENSE
- Pagina del autor: https://www.moonshot.ai
- Chat: https://www.kimi.com
- Discord: https://discord.gg/TYU2fdJykW
- Twitter/X: https://twitter.com/kimi_moonshot

Nota: los resultados de la busqueda web proporcionados no contienen informacion relevante sobre el modelo (corresponden a un sitio de deportes), por lo que no se han utilizado como fuente.
