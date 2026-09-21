# ItsnotAilabs/HIM-3B

## Resumen

HIM-3B (Hybrid Intelligence Model 3B) es un modelo de lenguaje de 3,2 mil millones de parametros especializado en orquestacion de agentes autonomos. Segun su model card, esta desarrollado por MedinaMemorySystems, aunque el repositorio consultado se publica bajo la organizacion ItsnotAilabs, una discrepancia de autoria que conviene tener en cuenta. Se trata de un ajuste fino supervisado sobre `meta-llama/Llama-3.2-3B-Instruct`, por lo que hereda la arquitectura transformer decoder-only de Llama 3.2, con 28 capas, atencion con consultas agrupadas (GQA) y una ventana de contexto de 8.192 tokens.

La propuesta diferencial del autor es el paradigma de "razonamiento bi-hemisferico": el modelo alternaria entre operaciones logicas de un "Cortex" y una intuicion creativa de un "Subcortex", y comprenderia de forma nativa un lenguaje propietario denominado CortexScript. Estos conceptos no vienen acompanados de documentacion tecnica publica que explique su implementacion real (tokens especiales, prompt engineering o modulos adicionales), por lo que deben tratarse como afirmaciones del autor, no como innovaciones verificadas.

El modelo es relevante en su nicho por dos motivos: se distribuye con licencia Apache 2.0 y un tamano que permite inferencia en GPU de consumo (la propia model card indica ~6,5 GB en FP16 y ~2,2 GB en GGUF Q4_K_M), y esta orientado a un caso de uso muy concreto, la coordinacion de flujos multi-agente y la simulacion de debates entre personas. En el momento de la ficha acumula 0 descargas y 0 "likes", sin benchmarks publicados en el model-index de HuggingFace ni validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Llama 3.2), con RoPE y activacion SwiGLU |
| Parametros totales | 3,2 mil millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | FP16, INT8 y GGUF Q4_K_M (segun la model card; no se confirma la publicacion de pesos GGUF en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (modelo derivado de Llama 3.2, sujeto tambien a la Llama 3.2 Community License) |
| Formato de pesos | Libreria declarada: transformers. Formato concreto no confirmado en la informacion disponible |
| Capas | 28 |
| Cabezas de atencion | 24 cabezas de consulta con 8 cabezas KV (GQA) |
| Dimension oculta | 3.072 |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Plantilla de chat | Plantilla estandar de Llama 3 (`<|start_header_id|>`, `<|eot_id|>`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional heredado de Llama 3.2: 28 capas, 24 cabezas de atencion con 8 cabezas KV (Grouped-Query Attention), dimension oculta de 3.072, Rotary Position Embeddings (RoPE) y funciones de activacion SwiGLU. El contexto maximo es de 8.192 tokens, notablemente inferior a los 128.000 tokens del Llama 3.2 3B original, lo que sugiere que el ajuste fino no amplio la ventana y que la model card reporta la configuracion efectiva del fine-tune. No se documentan cambios estructurales sobre el modelo base.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre `meta-llama/Llama-3.2-3B-Instruct` con cuatro fuentes de datos declaradas: Sovereign Corpus (descrito como una integracion privada de grafo de conocimiento, sin identificador publico), Dolly-15k para seguimiento de instrucciones, ShareGPT Vicuna Unfiltered para flujo conversacional y alineacion, y un conjunto de transcripciones de debates entre agentes para sintesis multi-turno y modelado de personas. No se menciona uso de RLHF, DPO u otra fase de alineacion posterior al SFT; la alineacion procede del modelo base instruct y del ajuste con ShareGPT. Tampoco se indica el volumen total de tokens de entrenamiento, la composicion exacta ni el regimen de hiperparametros.

La innovacion declarada, el "razonamiento bi-hemisferico" (Cortex / Subcortex) y la comprension nativa de CortexScript, no cuenta con detalles tecnicos publicados: no se especifica si se implementa mediante tokens de control, instrucciones de sistema, decodificacion guiada o modulos adicionales. CortexScript tampoco aparece como estandar documentado en ninguna fuente publica consultada.

## Capacidades

- Generacion de texto instruccional en ingles, con la plantilla de chat estandar de Llama 3 y soporte de system prompt para definir rol o persona.
- Orquestacion de agentes autonomos: el autor lo posiciona como "cerebro central" para coordinar flujos de trabajo multi-agente.
- Gestion de multiples personas en una misma conversacion, manteniendo roles diferenciados (por ejemplo, un analista y un perfil creativo) a lo largo de varios turnos.
- Optimizacion de debates tipo consejo: generacion de argumentos estructurados y sintesis de puntos de vista en conflicto para apoyar la toma de decisiones.
- Comprension de CortexScript, una sintaxis propietaria descrita como nativa para sistemas de arquitectura cognitiva. No hay especificacion publica del lenguaje.
- Seguimiento de instrucciones formateadas (la model card declara metrica IFEval, ver seccion de benchmarks).
- Tool calling / function calling: no declarado en la informacion disponible.
- Capacidades multimodales (vision, audio) y modo "thinking" explicito: no declaradas.
- Capacidades multilingues: no declaradas; solo se lista ingles.

## Casos de uso

- Orquestador central de un sistema multi-agente: HIM-3B puede actuar como capa de coordinacion que recibe el estado de varios agentes especializados, decide a cual derivar cada subtarea y sintetiza sus respuestas. El ajuste con transcripciones de debates lo orienta especificamente a este rol, y su huella de memoria reducida permite ejecutarlo en la misma maquina que los agentes trabajadores.
- Simulacion de debates estructurados para apoyo a la decision: el modelo puede generar posturas contrapuestas sobre una decision tecnica o de producto y producir una sintesis final. Es util en herramientas internas de analisis de alternativas donde se quiere exponer explicitamente el conflicto entre opciones antes de decidir.
- Gestion de personas multiples en asistentes conversacionales: en productos de roleplay controlado, tutoria o entrenamiento de habilidades conversacionales, el modelo puede mantener varios roles diferenciados dentro de la misma sesion, usando el system prompt para fijar cada persona.
- Prototipado local de arquitecturas agenticas: con ~2,2 GB en GGUF Q4_K_M o ~6,5 GB en FP16, cabe en GPU de consumo y permite iterar sobre disenos de agentes sin coste de API ni envio de datos a terceros, algo relevante en entornos con requisitos de privacidad.
- Generacion y validacion de instrucciones en un DSL interno: si el equipo adopta CortexScript o define su propia sintaxis de directivas, el modelo puede usarse para generar y parsear esas directivas dentro de pipelines internos de automatizacion.
- Capa de moderacion y sintesis en flujos con muchos roles: en sistemas donde varios agentes producen contenido en paralelo, HIM-3B puede consolidar salidas, detectar contradicciones entre ellas y emitir una respuesta unificada antes de devolverla al usuario.
- Evaluacion comparativa de politicas de prompt: al ser un modelo pequeno y con licencia Apache 2.0, es adecuado como banco de pruebas para medir como distintos system prompts afectan a la consistencia de persona y al seguimiento de instrucciones, sin los costes de evaluar modelos de mayor tamano.

## Benchmarks y rendimiento

El model-index del repositorio de HuggingFace no contiene resultados (`results: []`). Las cifras siguientes proceden unicamente de la tabla publicada en la model card por el autor y no estan acompanadas de metodologia, version del harness de evaluacion ni configuracion de decodificacion, por lo que deben considerarse no verificadas.

| Benchmark | Resultado declarado | Nota del autor |
|---|---|---|
| MT-Bench | 6,8 | Capacidad de chat general |
| AlpacaEval 2.0 LC | 18,2 % | Win rate controlado por longitud |
| IFEval | 62,1 | Seguimiento de instrucciones |
| CouncilDebate (personalizado) | 71,5 % | Consistencia de persona en multi-agente |

La model card incluye ademas una seccion de "Verified Production Metrics" con throughput de 40,0 tokens/s, latencia de 15,0 ms/token, uso de RAM de ~450 MB en linea base y una precision de tarea del 96,5 %. No se especifica hardware, batch, longitud de secuencia, dataset de evaluacion ni procedimiento de medida para ninguna de estas cifras, y el dato de ~450 MB de RAM es incoherente con la propia tabla de cuantizacion del autor (2,2-6,5 GB). No hay resultados comparativos con otros modelos publicados en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun la model card: ~6,5 GB en FP16, ~3,5 GB en INT8 y ~2,2 GB en GGUF Q4_K_M.
- Latencia declarada por el autor: 25-35 ms/token en FP16, 18-25 ms/token en INT8 y 12-18 ms/token en GGUF Q4_K_M.
- Throughput declarado: 40 tokens/s (sin especificar hardware ni cuantizacion).
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB o superior ejecuta FP16 con holgura; una RTX 4060 Ti de 8 GB o una RTX 3070 de 8 GB son suficientes para FP16 ajustado o INT8.
- GPU profesionales recomendadas para servicio concurrente: A100, H100 o L40S, especialmente si se sirven varias replicas o lotes grandes.
- Despliegue: `transformers` con `device_map="auto"` es la via documentada en la model card. vLLM, TGI, llama.cpp u Ollama son opciones habituales para un modelo de este tamano, pero no estan confirmadas en la informacion disponible; el uso de llama.cpp u Ollama requeriria disponer de pesos GGUF, cuya publicacion no se confirma.
- El dato de ~450 MB de RAM de la seccion "Verified Production Metrics" no es consistente con los requisitos de VRAM declarados y no deberia usarse para dimensionar infraestructura.

## Comparativa con modelos similares

Los datos de parametros, contexto y licencia de los modelos alternativos proceden de su documentacion publica habitual y no se han verificado en la busqueda realizada para esta ficha. No hay datos de benchmarks comparables disponibles.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HIM-3B | 3,2 B | 8.192 tokens | Apache 2.0 (derivado de Llama 3.2) | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, ampliamente desplegado |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens (ampliable con RoPE scaling) | Apache 2.0 | HuggingFace |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | HuggingFace |

Frente a estas alternativas, HIM-3B ofrece una ventana de contexto claramente menor (8.192 frente a 32.000-128.000 tokens) y carece de validacion independiente, pero incorpora un ajuste especifico para orquestacion y personificacion multi-agente que los modelos generalistas no tienen. No se dispone de datos de rendimiento comparables para confirmar si esa especializacion compensa la perdida de contexto.

## Limitaciones y advertencias

- Idiomas: solo se declara ingles. No hay soporte multilingue documentado, por lo que su uso en castellano u otros idiomas degradaria la calidad de forma no medida.
- Ventana de contexto de 8.192 tokens: reducida para tareas de agente con historiales largos o documentos extensos, y muy inferior a los 128.000 tokens del modelo base.
- Deriva contextual: el propio autor advierte de que en debates multi-agente prolongados, cerca del limite de 8K, el modelo puede confundir personas distintas.
- Degradacion en codigo generico: la model card reconoce que las capacidades de generacion de codigo no especializado pueden verse ligeramente reducidas respecto al modelo base, como consecuencia del ajuste hacia CortexScript y el dominio agentico.
- Sesgos: hereda el perfil de sesgo y seguridad de Llama 3.2, modulado por el ajuste con ShareGPT Vicuna Unfiltered. No se ha publicado ninguna evaluacion de sesgo específica para este modelo.
- Riesgo de alucinacion: no hay evaluacion publicada de factualidad ni de tasas de alucinacion. El ajuste con ShareGPT, orientado a fluidez conversacional, no garantiza anclaje factual.
- Cifras no verificables: los benchmarks de la model card y las "Verified Production Metrics" (40 tokens/s, 15 ms/token, 96,5 % de precision) carecen de metodologia y hardware declarados. El dato de ~450 MB de RAM contradice la tabla de cuantizacion del propio autor.
- Sin adopcion ni validacion independiente: 0 descargas y 0 "likes" en el momento de redactar esta ficha, y model-index vacio.
- Ambiguedad de autoria y denominacion: el ID del repositorio es `ItsnotAilabs/HIM-3B`, mientras que la model card, la cita BibTeX y el ejemplo de codigo apuntan a `MedinaMemorySystems/HIM-3B`. Conviene confirmar la procedencia antes de integrarlo.
- CortexScript no es un estandar publico: no existe especificacion accesible del lenguaje, por lo que las capacidades prometidas en ese ambito no se pueden evaluar ni reproducir.
- Licencia: aunque el repositorio declara Apache 2.0, al ser un derivado de Llama 3.2 la Llama 3.2 Community License puede imponer condiciones adicionales (atribucion, nombrado de derivados, restricciones de uso para determinados actores). Conviene revisar ambas licencias antes de un despliegue comercial.
- Tool calling no declarado: si el caso de uso depende de function calling, no hay evidencia de soporte nativo ni de plantilla documentada para ello.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ItsnotAilabs/HIM-3B
- Repositorio referenciado en la model card (posible ubicacion original): https://huggingface.co/MedinaMemorySystems/HIM-3B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Datasets citados: databricks/databricks-dolly-15k, anon8231489123/ShareGPT_Vicuna_unfiltered. El dataset "Sovereign Corpus" y las "Agent Debate Transcripts" no tienen identificador publico disponible.
- Paper, blog o demo: no disponible.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces recuperados corresponden a contenidos sin relacion (canales y perfiles de un coach de hipnosis).
