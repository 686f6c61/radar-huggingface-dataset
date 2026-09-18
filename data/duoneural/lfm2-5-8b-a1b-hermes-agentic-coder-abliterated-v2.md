# DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2

## Resumen

DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2 es un ajuste fino orientado a agentes autónomos y generación de código, publicado por el colectivo DuoNeural (Aura, Archon y Jesse) sobre su propio modelo base abliterado DuoNeural/LFM2.5-8B-A1B-Abliterated. Ese modelo base, a su vez, parte de la arquitectura LFM2.5 de Liquid AI, de tipo híbrido entre espacios de estado (state-space model) y mezcla de expertos (MoE), con 8.467.856.832 parámetros totales según los archivos safetensors y aproximadamente 1.500 millones de parámetros activos por token.

El modelo se presenta como una versión "v2" que corrige un fallo de la v1: una discrepancia en el delimitador de rol del asistente durante el entrenamiento provocaba que el modelo emitiera el token EOS (`<|im_end|>`) al cerrar las etiquetas `<thought>`, cortando la respuesta en consultas conversacionales sin llamadas a herramientas. La v2 inyecta 10.000 transiciones explícitas de razonamiento a respuesta procedentes de `bespokelabs/Bespoke-Stratos-17k` y amplía la longitud de secuencia de entrenamiento a 2.048 tokens, un 33 % más que la v1.

Su relevancia práctica radica en la relación entre eficiencia y capacidad: con solo 1.500 millones de parámetros activos por token declara 46,3 % de Pass@1 en HumanEval+ y 48,9 % en MBPP+ (EvalPlus), además de unos 352-360 tokens por segundo en una RTX 4080 Super con cuantización Q4_K_M y funcionamiento por debajo de 6 GB de VRAM. Se distribuye bajo la licencia comunitaria de Liquid Foundation Model y está etiquetado como "abliterated", es decir, con los mecanismos de rechazo eliminados deliberadamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido estado-espacio (SSM) + mezcla de expertos (MoE), familia LFM2.5 (`lfm2_moe`) |
| Parametros totales | 8.467.856.832 (el autor indica "8,3 B" en la model card) |
| Parametros activos | ~1.500 millones por token (dato declarado por el autor) |
| Longitud de contexto | 2.048 tokens de longitud de secuencia de entrenamiento (+33 % respecto a v1); contexto de inferencia máximo no disponible |
| Tipos de cuantizacion | GGUF con Q4_K_M documentado; existe repositorio GGUF dedicado; safetensors en precisión completa |
| Idiomas soportados | no disponible |
| Licencia | liquid-foundation-model-community-license (`license: other`) |
| Formato de pesos | safetensors (17,0 GB de repositorio), GGUF y adaptador PEFT LoRA en repositorios separados |
| Modelo base | DuoNeural/LFM2.5-8B-A1B-Abliterated (abliterado) |
| Biblioteca declarada | hermes |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

La base es un transformer híbrido que combina capas de espacio de estado con una capa de mezcla de expertos, siguiendo el diseño LFM2.5 de Liquid AI. El rasgo definitorio es el enrutado disperso: de los 8,47 mil millones de parámetros totales solo se activan alrededor de 1.500 millones por token, lo que reduce de forma drástica el coste de cómputo y de memoria activa en inferencia frente a un modelo denso del mismo tamaño. El modelo base del que parte ya había pasado por un proceso de "abliteration", una técnica de modificación de pesos que suprime la dirección de activación asociada al rechazo de peticiones.

El ajuste de la v2 se realizó mediante QLoRA sobre ese modelo base abliterado. El cambio principal respecto a la v1 es la corrección del colapso prematuro en EOS: se inyectaron 10.000 ejemplos de transición razonamiento-respuesta extraídos de `bespokelabs/Bespoke-Stratos-17k`, lo que según el autor reentrena por completo la distribución de probabilidad condicional y elimina el corte de generación al cerrar el bloque de pensamiento. Además, la longitud de secuencia de entrenamiento pasó a 2.048 tokens para acomodar trazas de herramientas multiturno y lógica algorítmica extensa.

La plantilla de chat embebida en las configuraciones de Hugging Face y GGUF incorpora soporte nativo para `message.thinking`, `message.tool_calls` y bucles de respuesta de herramientas, lo que indica un formato de conversación tipo Hermes con bloques de pensamiento explícitos y esquemas de función en XML/JSON. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición del dataset más allá del subconjunto citado, ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generacion de codigo Python: sintesis algoritmica, memoizacion y resolucion de problemas de programacion tipo HumanEval y MBPP.
- Razonamiento en modo "pensamiento": emite bloques `<thought>` antes de la respuesta final y encadena pasos intermedios (etiquetado `system2`), con la correccion de v2 que garantiza la transicion pensamiento-respuesta.
- Tool calling / function calling: soporte nativo de `message.tool_calls` y validacion de esquemas de herramientas; el autor declara 100 % de exito sintactico en su prueba AST de Hermes Function Calling sobre 25 casos.
- Uso agentico multiturno: bucles de llamada a herramienta y respuesta de herramienta integrados en la plantilla, con trazas largas dentro del limite de 2.048 tokens.
- Razonamiento matematico basico: evaluacion declarada en GSM8K con 63,3 % sobre 30 muestras.
- Modo sin censura ("abliterated"): el autor declara ausencia de rechazos en tareas de sistemas de bajo nivel, kernel en C, ingenieria inversa y seguridad.
- Capacidades multimodales, de audio o de vision: no disponible (no se declaran).
- Cobertura multilingue: no disponible (no se declara).

## Casos de uso

- Agente de codigo autonomo en terminal o IDE: el modelo puede leer un error de compilacion, razonar en un bloque de pensamiento y emitir una llamada a herramienta para aplicar un parche, gracias al soporte nativo de `tool_calls` y a los bucles de respuesta de herramienta de su plantilla.
- Generacion de codigo en pipelines de CI/CD: con 46,3 % de Pass@1 en HumanEval+ y 48,9 % en MBPP+, es adecuado para autocompletado de funciones, generacion de pruebas unitarias y refactorizaciones acotadas donde el coste por token importa mas que la precision maxima.
- Ejecucion de agentes en hardware de gama media: al ocupar menos de 6 GB de VRAM con Q4_K_M y superar los 80-90 tokens/s en una GTX 1070 Mobile, permite desplegar bucles agenticos en estaciones de trabajo modestas o portatiles con GPU de generaciones antiguas.
- Servicio de alto throughput con muchas peticiones concurrentes: los 352-360 tokens/s medidos en una RTX 4080 Super con `llama-server` lo hacen viable para atender a varios usuarios simultaneos en un unico equipo consumer.
- Tareas de seguridad ofensiva y auditoria: al ser un modelo abliterado declara cero rechazos en analisis de binarios, desarrollo de exploits de laboratorio o revision de codigo malicioso, escenarios donde un modelo alineado por defecto se negaria a responder.
- Prototipado rapido de asistentes conversacionales con razonamiento visible: el flujo pensamiento-respuesta corregido en v2 permite mostrar al usuario la cadena de razonamiento antes de la respuesta final en un chat de soporte tecnico o tutoria de programacion.
- Ajuste posterior mediante LoRA: al publicarse un adaptador PEFT especifico, sirve como punto de partida para especializaciones verticales (por ejemplo, un dominio de lenguaje concreto) sin reentrenar los 8,47 mil millones de parametros.

## Benchmarks y rendimiento

Todos los datos proceden de la model card del autor. No se han verificado de forma independiente y varias evaluaciones usan muestras muy reducidas.

| Benchmark | Configuracion | Resultado declarado |
|---|---|---|
| EvalPlus HumanEval (base) | 164 problemas, zero-shot | 52,4 % Pass@1 (86/164) |
| EvalPlus HumanEval+ (extra) | 164 problemas, 80x entradas | 46,3 % Pass@1 (76/164) |
| EvalPlus MBPP (base) | 378 problemas, zero-shot | 59,3 % Pass@1 (224/378) |
| EvalPlus MBPP+ (extra) | 378 problemas, tests extra | 48,9 % Pass@1 (185/378) |
| HumanEval sintesis zero-shot | 25 problemas, ejecucion directa | 88,0 % Pass@1 (22/25) |
| Hermes Function Calling AST | 25 esquemas XML/JSON | 100,0 % (25/25) |
| GSM8K | 30 muestras | 63,3 % |
| Abliteration y alineacion de seguridad | Tareas de sistemas/kernel C | 100 % sin rechazos |
| Throughput RTX 4080 Super | `llama-server`, Q4_K_M | ~352-360 tps |
| Throughput GTX 1070 Mobile | LM Studio, Q4_K_M | ~80-90 tps |
| Tasa de congelacion por EOS | Prompts conversacionales | 0,0 % (0/3), frente a 50-70 % en v1 |

Comparacion con el modelo base sin ajustar, segun el autor:

| Benchmark | LFM 2.5 8B A1B original | DuoNeural v2 | Delta |
|---|---|---|---|
| HumanEval sintesis zero-shot | ~40,0-44,0 % Pass@1 | 88,0 % Pass@1 | +44,0 pp |
| EvalPlus HumanEval (base) | ~36,8 % Pass@1 | 52,4 % Pass@1 | +15,6 pp |
| EvalPlus HumanEval+ (extra) | ~31,2 % Pass@1 | 46,3 % Pass@1 | +15,1 pp |
| EvalPlus MBPP (base) | ~45,0 % Pass@1 | 59,3 % Pass@1 | +14,3 pp |
| EvalPlus MBPP+ (extra) | ~38,1 % Pass@1 | 48,9 % Pass@1 | +10,8 pp |

## Requisitos de hardware

- VRAM en Q4_K_M: menos de 6 GB, segun el autor; cabe en GPU consumer de gama media y en portatiles con GPU dedicada.
- VRAM en safetensors a precision completa: el repositorio ocupa 17,0 GB, por lo que requiere del orden de 17 GB solo para pesos, mas memoria para el contexto y el runtime (una GPU de 24 GB como la RTX 3090 o 4090 resulta holgada).
- GPU recomendadas por el autor: RTX 4080 Super y RTX 3090 para el perfil de alto rendimiento (352-360 tps); GTX 1070 Mobile como caso extremo de hardware heredado (80-90 tps).
- Cabe en GPU consumer: si, incluidas generaciones antiguas con cuantizacion Q4_K_M.
- Opciones de despliegue: `llama-server` y el ecosistema llama.cpp, LM Studio, formato GGUF a traves del repositorio dedicado, safetensors con Hugging Face Transformers y adaptador PEFT LoRA para reentrenamiento o fusion.
- Latencia y throughput: ~352-360 tokens/s en RTX 4080 Super con Q4_K_M y `llama-server`; ~80-90 tokens/s en GTX 1070 Mobile con LM Studio. No se publican cifras de latencia por peticion ni de throughput agregado con batching.
- Nota: vLLM y TGI no se mencionan en la informacion disponible; su compatibilidad con la arquitectura `lfm2_moe` no esta confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos/token | HumanEval+ | MBPP+ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DuoNeural LFM2.5-8B-A1B Hermes Agentic Coder v2 | 8,47 B | ~1,5 B | 46,3 % (autor) | 48,9 % (autor) | Liquid Foundation Model Community License | Hugging Face (safetensors, GGUF, LoRA) |
| LFM 2.5 8B A1B (stock) | 8,3 B | ~1,5 B | ~31,2 % (autor) | ~38,1 % (autor) | Liquid Foundation Model Community License | Hugging Face |
| Llama-3-8B-Instruct | 8 B densos | 8 B | ~43 % (cifra citada por el autor) | no disponible | Llama 3 Community License | Hugging Face, amplia difusion |
| CodeLlama-7B | 7 B densos | 7 B | ~34 % (cifra citada por el autor) | no disponible | Llama 2 Community License | Hugging Face |

No se dispone de datos verificados de contexto, throughput ni benchmarks completos de los modelos comparados dentro de la informacion proporcionada; las cifras de HumanEval+ de Llama-3-8B-Instruct y CodeLlama-7B son las citadas por el propio autor del modelo.

## Limitaciones y advertencias

- Resultados no verificados: todos los benchmarks proceden de la model card del autor, sin evaluacion independiente ni replicacion externa.
- Muestras muy pequenas: la prueba de sintesis HumanEval zero-shot usa 25 problemas, la de function calling 25 esquemas, GSM8K 30 muestras y la comprobacion de congelacion por EOS solo 3 prompts. Las cifras de 88,0 % y 100 % tienen un margen de error elevado y no son comparables directamente con las evaluaciones EvalPlus sobre 164 y 378 problemas.
- Inconsistencia interna: el 88,0 % en HumanEval sintesis zero-shot sobre 25 problemas no concuerda con el 52,4 % de EvalPlus HumanEval sobre 164 problemas; conviene tratar ambas cifras como indicadores distintos y no intercambiables.
- Contexto corto: la ventana de entrenamiento es de 2.048 tokens, muy por debajo de los 8K-128K habituales en modelos de su categoria, lo que limita tareas con documentos largos, repositorios grandes o trazas de agente extensas.
- Idioma: no se declara soporte multilingue; la mayor parte del entrenamiento derivado (Bespoke-Stratos-17k) esta en ingles, por lo que el rendimiento en castellano es incierto.
- Contenido abliterado: el modelo elimina deliberadamente los mecanismos de rechazo. Esto implica un riesgo real de generar contenido danino, codigo malicioso o instrucciones peligrosas sin filtro, y complica su uso en productos de cara al publico con requisitos de moderacion.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad, factualidad ni resistencia a la alucinacion; en generacion de codigo, un fallo silencioso puede propagarse a produccion.
- Licencia restrictiva: la Liquid Foundation Model Community License no es una licencia de codigo abierto estandar; hay que revisar sus clausulas de uso comercial, atribucion y redistribucion antes de integrarlo en un producto.
- Nombre inconsistente: la model card usa el titulo "DuoNeural-HYPERLFM-2.5-8B-Hermes-Agentic-Coder-Abliterated-v2" mientras que el identificador del repositorio es "DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2", lo que puede generar confusion en automatizaciones.
- Senales de adopcion nula: 0 descargas y 0 likes en el momento de la consulta, con fecha de publicacion posterior a la fecha habitual de estas fichas; es un artefacto muy reciente y sin validacion por parte de la comunidad.
- Sin informacion sobre sesgos: no se documentan evaluaciones de sesgo demografico, toxicidad ni comportamiento en dominios sensibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2
- Modelo base abliterado: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Abliterated
- Cuantizaciones GGUF: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-GGUF
- Adaptador PEFT LoRA: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-LoRA
- Version v1: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated
- Licencia comunitaria de Liquid AI: https://www.liquid.ai/community-license
- Dataset citado en el entrenamiento (Bespoke-Stratos-17k): https://huggingface.co/datasets/bespokelabs/Bespoke-Stratos-17k
- La busqueda web realizada no devolvio papers, blogs tecnicos ni repositorios adicionales relevantes sobre este modelo.
