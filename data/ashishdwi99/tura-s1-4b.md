# AshishDwi99/tura-s1-4b

## Resumen

Tura-S1-4B es un modelo de decisión tipada ("typed-decision") de una sola pasada desarrollado por AshishDwi99. No es un modelo generativo al uso: recibe un estado (un documento, una conversación o los pasos previos de un agente) junto con una pregunta de tipo yes/no (`noul`), `choice` o `score`, y devuelve una probabilidad para cada opción en un único forward pass, sin generar ningún token. Se distribuye como el modelo de decisión interno del producto de tutoría Tura, donde sustituye a una API hospedada de la clase Jev para el enrutamiento de pasos de agente (qué herramienta usar a continuación o responder), la detección de fin de turno y las decisiones de modo de respuesta.

Técnicamente es un Plumb-4B (JevK5 v0.2 más un LoRA sobre Qwen3.5-4B) al que se ha añadido y fusionado un LoRA adicional. Conserva el mismo formato que JevK5 y Plumb-4B, por lo que el runtime de JevK5 lo sirve sin cambios. Tiene 4.205.751.296 parámetros (~4,2B), ocupa unos 9 GB en bf16 y está entrenado únicamente en inglés, con soporte de hasta 16 opciones en una sola pasada. Es relevante porque demuestra que una decisión de enrutamiento puede resolverse con una clasificación calibrada de bajísima latencia (cero tokens generados) en lugar de con generación autoregresiva.

El compromiso principal es explícito: el entrenamiento adicional sacrifica 11 ítems difíciles del benchmark público JevBench a cambio de grandes ganancias en enrutamiento de agente (98,5% en decisiones retenidas) y en decisiones generales (68,1%). La licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-4B) con LoRA fusionado |
| Parametros totales | 4.205.751.296 (~4,2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 4.096 tokens en el entrenamiento; la model card no declara una ventana maxima explicita |
| Tipos de cuantizacion | bf16 (pesos en safetensors); GGUF y otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en), unicamente |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,4 GB |
| Pipeline declarado | text-classification |
| Modelo base | crh225/plumb-4b |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso derivado de Qwen3.5-4B. Sobre Plumb-4B (que a su vez es JevK5 v0.2 más un LoRA sobre Qwen3.5-4B) se aplicó un LoRA adicional de rango 16, una época, learning rate 2e-5 y entropía cruzada sobre los logits de las letras de opción (con objetivos suaves cuando la etiqueta es una distribución), usando el propio `training/lora.py` de JevK5. Se entrenaron 33.756 preguntas de hasta 4.096 tokens y el LoRA se fusionó en los pesos finales. La calibración consiste en una única temperatura de 1,48 ajustada sobre datos de desarrollo retenidos (Kev transfer-v9 dev más conversaciones de enrutamiento de herramientas retenidas) y almacenada en `jevk5_config.json`.

Los datos de entrenamiento se componen de tres bloques: 8.865 decisiones del propio agente de Tura (enrutamiento de herramientas, fin de turno y modo de respuesta), etiquetadas con las acciones registradas del agente, sus reglas de protocolo escritas y un profesor de pesos abiertos (gpt-oss-120b), con datos personales eliminados; 20.000 decisiones generales (documentos y preguntas redactados y doblemente revisados por gpt-oss-120b/20b, más repetición de datasets públicos); y 5.000 ejemplos públicos de tool calling (ToolACE, Glaive, Hermes function calling y trazas de agente, When2Call), con un catálogo de más de 16 herramientas donde se conservaba la herramienta correcta más 15 alternativas. Cada ítem de entrenamiento se cribó contra los 231 ítems públicos de JevBench (coincidencia exacta y secuencias compartidas de 8 palabras) y las coincidencias se eliminaron. La regla de selección de checkpoint se fijó de antemano sobre conjuntos retenidos ajenos a JevBench, y JevBench público se ejecutó una sola vez tras la selección.

## Capacidades

- Clasificación y decisión tipada en una única pasada forward, sin generar tokens: devuelve una probabilidad por opción.
- Preguntas de tipo yes/no (`noul`), `choice` y `score`.
- Soporte de hasta 16 opciones en una sola pasada; para más opciones, JevK5 ofrece un modo "knockout" que requiere varias pasadas.
- Enrutamiento de herramientas (tool routing) dentro de un catálogo de más de 16 herramientas: decide qué herramienta invocar o si responder directamente.
- Detección de fin de turno (turn-end checks) en conversaciones multi-turno.
- Selección de modo de respuesta (reply-mode decisions).
- Decisiones generales sobre documentos y conversaciones (clasificación binaria, elección entre opciones y puntuación).
- Probabilidades calibradas: ECE de 0,036 en JevBench público, lo que permite usar la confianza como señal fiable.
- No dispone de generación de texto libre, visión, audio ni otras modalidades; su salida son probabilidades sobre opciones predefinidas.
- Multilingüe: no; solo inglés.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado el estado actual de un agente, el modelo devuelve en una sola pasada la herramienta más probable del catálogo (98,5% de acierto en las decisiones retenidas de enrutamiento del producto Tura), lo que evita una llamada generativa completa.
- Detección de fin de turno en diálogos: decidir si el usuario ha terminado su turno o si se espera más entrada, con salida probabilística calibrada para fijar umbrales.
- Selección de modo de respuesta en sistemas de tutoría: elegir entre estilos o formatos de respuesta (por ejemplo, pista, explicación o corrección) según las reglas del producto.
- Clasificación de documentos en pipelines por lotes: usar preguntas `choice` o `score` para etiquetar documentos sin generación, reduciendo coste y latencia frente a un LLM generativo.
- Moderación y filtrado con umbral de confianza: aprovechar la calibración (ECE 0,036) para aceptar o rechazar contenido en función de la probabilidad, no solo de la etiqueta ganadora.
- Sustitución de APIs propietarias de la clase Jev: la model card indica que reemplaza una API hospedada equivalente, lo que permite desplegar la decisión de forma local con el runtime JevK5.
- Componente de decisión en agentes multi-paso: como paso intermedio de bajo coste (cero tokens generados) para decidir la siguiente acción en una cadena de razonamiento, reservando el modelo generativo para la respuesta final.
- Enrutamiento de intenciones en atención al cliente: clasificar la intención del turno entre un conjunto cerrado de opciones antes de invocar el flujo correspondiente.

## Benchmarks y rendimiento

Resultados medidos por el autor en una única NVIDIA L40S. Las cifras de JevBench provienen de su propio arnés (`jevbench.cli run` + `summarize`) sobre los 231 ítems públicos, en una sola ejecución, a través de `jevk5-serve`.

| Metrica | Plumb-4B | Tura-S1-4B |
|---|---|---|
| JevBench publico (231) | 208 (90,0%) | 197 (85,3%) |
| - easy / original / hard | 48/48 · 70/72 · 90/111 | 48/48 · 70/72 · 79/111 |
| JevBench publico ECE / Brier | 0,053 / 0,186 | 0,036 / 0,218 |
| Decisiones de producto de Tura, retenidas (170) | 41,8% | 90,0% |
| Enrutamiento de pasos de agente de Tura, retenido (129) | 49,6% | 98,5% |
| Decisiones generales retenidas (900) | 58,0% | 68,1% |
| Conjunto dificil escrito a mano de JevK5 (65) | 78,5% | 83,1% |

El autor señala que el entrenamiento adicional cambia 11 ítems difíciles de JevBench público por grandes ganancias en enrutamiento de agente y decisiones generales, y que Plumb-4B es el modelo más fuerte en JevBench si no se necesita enrutamiento de herramientas. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 9 GB en bf16 solo para los pesos; conviene prever margen adicional para el runtime y los estados de entrada.
- GPU recomendadas: la medición oficial se hizo en una NVIDIA L40S (48 GB). Sirven tambien A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 12-16 GB o mas; una RTX 4090 o RTX 3090 (24 GB) lo alojan con holgura y una RTX 4080 (16 GB) de forma ajustada.
- Opciones de despliegue: el runtime JevK5 (`jevk5-serve --model AshishDwi99/tura-s1-4b --port 8090`), que expone un endpoint POST /v1/systemone de estilo TypeSafe, o la clase `JevK5` del paquete `jevk5.runtime`. La model card no declara soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: al resolverse en una sola pasada forward sin generar tokens, la latencia es inherentemente baja, pero no se publican cifras concretas de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (JevBench publico) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tura-S1-4B | ~4,2B | hasta 4.096 tokens en entrenamiento | 197/231 (85,3%); 98,5% en enrutamiento retenido | Apache-2.0 | HuggingFace + runtime JevK5 |
| Plumb-4B | ~4B (no confirmado) | no disponible | 208/231 (90,0%); 49,6% en enrutamiento retenido | no disponible en la informacion proporcionada | HuggingFace (crh225/plumb-4b) |
| Qwen3.5-4B (familia base) | ~4B | no disponible | no disponible (no es un modelo de decision) | no disponible en la informacion proporcionada | HuggingFace |

La comparacion directa mas relevante es con Plumb-4B, su antecesor inmediato y unico modelo con el que se aportan cifras en el mismo arnes. Frente a el, Tura-S1-4B mejora de forma clara en enrutamiento de agente (98,5% frente a 49,6%) y en decisiones generales (68,1% frente a 58,0%), pero pierde en JevBench publico y en Brier. Los resultados de busqueda sobre "TURA" (el agente de recuperacion de Baidu) no son comparables: se trata de un proyecto distinto con el mismo nombre.

## Limitaciones y advertencias

- Esta entrenado exclusivamente en ingles; no soporta otros idiomas.
- Es un modelo de decision, no generativo: no produce texto libre y su salida son probabilidades sobre opciones predefinidas, por lo que no sirve como asistente conversacional por si solo.
- Limite de 16 opciones en una sola pasada; superarlo requiere el modo knockout de JevK5 y varias pasadas.
- La model card no declara una ventana de contexto maxima explicita; el dato conocido es que el entrenamiento uso secuencias de hasta 4.096 tokens.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de decision erronea; el autor reconoce una perdida de 11 items dificiles de JevBench publico respecto a Plumb-4B.
- El Brier empeora respecto a Plumb-4B (0,218 frente a 0,186) aunque el ECE mejora; conviene validar la calibracion en el dominio propio.
- La seleccion y calibracion se hicieron sobre conjuntos retenidos propios del autor, con una unica ejecucion posterior de JevBench; los numeros no provienen de una evaluacion independiente.
- El modelo depende del runtime y del formato JevK5; no hay soporte declarado de otras herramientas de inferencia (vLLM, llama.cpp, Ollama, TGI).
- Modelo con 0 descargas y 0 likes en HuggingFace en el momento de la consulta; trazabilidad y mantenimiento no garantizados.
- Licencia Apache-2.0, que permite uso comercial; deben revisarse los ficheros `NOTICE`, `NOTICE-plumb` y `NOTICE-jevk5` por las dependencias de pesos, codigo y datos sobre los que se construye.
- El propio autor indica que si no se necesita enrutamiento de herramientas, Plumb-4B es el modelo mas fuerte en JevBench.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AshishDwi99/tura-s1-4b
- Modelo base Plumb-4B: https://huggingface.co/crh225/plumb-4b
- Runtime JevK5 (GitHub): https://github.com/allebee/jevk5
- Producto Tura: https://turalearn.com

Enlaces de la busqueda web (posiblemente relacionados o de proyectos homonimos; verificar antes de usarlos como referencia del modelo):

- GitHub Tura-AI/tura (harness de runtime de agentes): https://github.com/Tura-AI/tura
- TURA: Tool-Augmented Unified Retrieval Agent (paper, Baidu): https://arxiv.org/html/2508.04604
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2508.04604
- Analisis en AlphaSignal sobre TURA (Baidu): https://alphasignal.ai/news/baidu-s-tura-beats-a-671b-ai-model-using-a-tiny-4b-agent
- Comparativa de modelos open source pequenos (Artificial Analysis): https://artificialanalysis.ai/models/open-source/small
