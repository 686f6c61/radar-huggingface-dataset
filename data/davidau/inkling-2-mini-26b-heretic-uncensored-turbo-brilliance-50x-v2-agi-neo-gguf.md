# DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-NEO-GGUF

## Resumen

Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-NEO-GGUF es una cuantizacion GGUF publicada por DavidAU sobre su propio modelo afinado Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI. Se trata de un modelo de arquitectura MoE (mixture of experts) con 26.070.385.152 parametros totales, 8 expertos activados de 128 por token y una arquitectura de "looping transformer" que realiza 3 pasadas sobre 16 capas, lo que segun el autor lo situa en un perfil efectivo de 26B-A5.4B. El modelo base procede de la familia Inkling y ha sido sometido a un proceso de "abliteration" (eliminacion de rechazos) y a un sistema de prompts denominado Turbo Brilliance.

El modelo se distribuye exclusivamente en formato GGUF (repo de 199,2 GB con multiples niveles de cuantizacion) y esta pensado para ejecutarse con llama.cpp en su version de noviembre de 2026 o posterior. Su propuesta diferencial no es tanto la arquitectura como el sistema de "constructs" y modos de razonamiento inyectados via prompt: 27 modos de razonamiento, 27 modos de instruccion, 9 modos de razonamiento "xhigh", 15 AI Constructs, 5 Super AI Constructs y 21 AGI Constructs.

Es relevante ahora porque combina tres tendencias del ecosistema open source: modelos MoE con activacion dispersa para reducir coste de inferencia, variantes "uncensored/abliterated" para casos de uso sin filtros, y tecnicas de control por prompt que emulan modos de razonamiento extendido. La licencia es Apache 2.0 y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con "looping transformer" (3 pasadas sobre 16 capas); 8 expertos activados de 128 por token |
| Parametros totales | 26.070.385.152 (26B) |
| Parametros activos | Perfil 26B-A3B; con looping, 26B-A5.4B segun el autor |
| Longitud de contexto | 1.000.000 de tokens (declarado por el autor) |
| Tipos de cuantizacion | Multiples niveles GGUF (el autor menciona Q4_K_M; el resto no disponible) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 199,2 GB); el modelo base en bfloat16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos: 128 expertos por capa con 8 activados por token, lo que da un perfil de computo tipo 26B-A3B. La innovacion estructural es el "looping transformer": el modelo aplica 3 pasadas sobre un bloque de 16 capas, lo que incrementa el computo efectivo hasta un perfil aproximado de 26B-A5.4B sin aumentar el numero de parametros almacenados. Segun el autor, esta tecnica reduce el uso de VRAM manteniendo o superando el rendimiento de modelos densos de tamano similar, a costa de una velocidad de generacion mas lenta que la de un MoE convencional.

No se dispone de informacion detallada sobre el dataset de entrenamiento (numero de tokens, composicion, fases de RLHF/DPO) en la informacion proporcionada. El modelo base ha sido sometido a un proceso de abliteration ("heretic'ed") para eliminar comportamientos de rechazo, y sobre el se aplica el sistema Turbo Brilliance, que no modifica los pesos sino que actua via prompt: inyecta instrucciones de enfoque antes de que el modelo empiece a razonar. El autor indica que el modo por defecto es "high" y que al activar Turbo Brilliance se pasa a "xhigh" por defecto. La cuantizacion GGUF se ha generado con una matriz de calibracion "NEO Imatrix" segun los tags del repositorio.

## Capacidades

- Generacion de texto conversacional y de formato largo, con soporte de contexto declarado de hasta 1 millon de tokens.
- Razonamiento con modos conmutables: 27 modos de razonamiento, 27 modos de instruccion y 9 modos "xhigh" activables mediante etiquetas en el prompt.
- Codigo: el autor reporta rendimiento fuerte en tareas de programacion y en el construct especifico "Coder AI Construct".
- Matematicas y ciencia: el autor senala que estas areas son especialmente fuertes.
- Seguimiento de instrucciones literal: el autor observa que el modelo rara vez se toma libertades y que conviene especificar longitud, contenido y formato explicitamente.
- AI Constructs: 15 constructs de persona (2000-4000 tokens cada uno) con patrones de comportamiento y habilidades definidas.
- AGI Constructs: 21 constructs generados dinamicamente por fusion de dos o mas AI Constructs en funcion del prompt del usuario.
- Super AI Constructs: 5 constructs de nivel superior segun la taxonomia del autor.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de agente multi-paso: el autor menciona un "Agent AI Construct" y buen rendimiento en tareas de agente, sin detallar el protocolo.
- Multilingue limitado a ingles y chino.
- Vision: el pipeline declarado es image-text-to-text, pero la model card no detalla el componente visual ni su entrenamiento.

## Casos de uso

- Escritura creativa y ficcion por generos: el modelo incorpora modos y constructs orientados a narrativa, rol y generacion literaria; con 1M de contexto puede mantener coherencia en novelas o sagas largas sin perder referencias previas.
- Roleplay y personajes persistentes: los AI Constructs de 2000-4000 tokens permiten fijar una persona con habilidades y estilo definidos, util para videojuegos narrativos o simulaciones de entrevista.
- Generacion de codigo asistida: el construct Coder y el rendimiento reportado en programacion lo hacen adecuado para autocompletado, refactorizacion y explicacion de codigo en entornos locales con llama.cpp.
- Razonamiento matematico y cientifico en local: los modos "xhigh" permiten forzar cadenas de razonamiento extendidas para problemas de varios pasos, sin depender de APIs externas.
- Procesamiento de documentos muy largos: con 1M de contexto declarado, puede resumir o extraer informacion de expedientes, libros tecnicos o bases de codigo completas en una sola pasada.
- Experimentacion en investigacion sobre alineacion y abliteration: al ser una variante uncensored con licencia Apache 2.0, sirve para estudiar comportamiento sin rechazos, sesgos residuales y eficacia de tecnicas de control por prompt.
- Despliegue en estaciones de trabajo con GPU consumer: al ser MoE, las cuantizaciones bajas mantienen rendimiento aceptable, lo que permite uso interactivo en una RTX 5090 a 80-85 tokens por segundo en Q4_K_M segun el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor afirma que el modelo esta "a la par de Qwen 3.8 27B, Gemma 26B-A4B, Gemma 31B y otros", pero no aporta tablas ni cifras verificables.

| Metrica | Valor reportado |
|---|---|
| Throughput en RTX 5090, Q4_K_M, LM Studio, generacion de 20K | 80-85 tokens/s |
| Comparaciones cualitativas | "A la par de Qwen 3.8 27B, Gemma 26B-A4B, Gemma 31B" (sin datos) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; para un MoE de 26B en Q4_K_M el peso ronda los 15-16 GB, por lo que encaja en GPU de 24 GB, aunque el autor no confirma la cifra exacta.
- GPU recomendadas: RTX 5090 (medicion reportada de 80-85 tokens/s en Q4_K_M); el resto de configuraciones no estan documentadas.
- Cabe en GPU consumer: si, segun la medicion del autor en una RTX 5090; en GPUs de 16 GB probablemente requiera cuantizaciones mas agresivas o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp en version B12600 o posterior (noviembre de 2026+); LM Studio (usado en la medicion); el autor menciona compatibilidad con protocolos de VLLM para el cambio de modos, pero no confirma soporte nativo de vLLM para estos GGUF.
- MTP (multi-token prediction): no soportado aun segun el autor.
- Latencia y throughput: 80-85 tokens/s en RTX 5090 con Q4_K_M y generacion de 20K tokens; el autor advierte que la velocidad es "rapida pero no vertiginosa" por el coste del sistema de looping.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Inkling-2-Mini-26B (este) | 26B | 26B-A5.4B (con looping) | 1M | Apache 2.0 | GGUF | MoE 8/128, uncensored, sistema Turbo Brilliance |
| Qwen 3.8 27B | 27B | Denso | no disponible | no disponible | no disponible | Referencia citada por el autor como comparable |
| Gemma 26B-A4B | 26B | 4B | no disponible | no disponible | no disponible | MoE citado como comparable por el autor |
| Gemma 31B | 31B | Denso | no disponible | no disponible | no disponible | Citado como comparable por el autor |

Los datos de los modelos alternativos no se detallan en la informacion proporcionada; las comparaciones son afirmaciones cualitativas del autor sin benchmarks que las respalden.

## Limitaciones y advertencias

- Modelo "uncensored/abliterated": se ha eliminado deliberadamente el comportamiento de rechazo, por lo que puede generar contenido que otros modelos bloquearian; requiere supervision humana y filtros externos en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; el contexto de 1M no garantiza uso correcto de la informacion lejana.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Seguimiento de instrucciones muy literal: el autor advierte que hay que especificar longitud, formato y contenido, ya que el modelo no toma iniciativas de formato por si mismo.
- Requiere llama.cpp muy reciente (B12600+, noviembre de 2026); versiones anteriores no cargaran los GGUF.
- MTP no soportado todavia, lo que limita optimizaciones de decodificacion especulativa.
- El sistema Turbo Brilliance y los constructs son tecnicas de prompt, no mejoras de pesos; su eficacia depende de la calidad del prompt y no esta validada con benchmarks independientes.
- Repo de 199,2 GB: la descarga completa es costosa; conviene bajar solo la cuantizacion necesaria.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de filtros de seguridad traslada toda la responsabilidad legal y etica al desplegador.
- La fecha de creacion del repositorio (2026-11-23) y las referencias a versiones de llama.cpp de noviembre de 2026 deben tomarse como datos del autor; verificar compatibilidad antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-NEO-GGUF
- Modelo base: https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- FAQs y soporte: https://huggingface.co/DavidAU/support
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
