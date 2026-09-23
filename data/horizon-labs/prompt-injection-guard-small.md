# Horizon-Labs/prompt-injection-guard-small

## Resumen

Prompt Injection Guard (small) es un clasificador de texto desarrollado por Horizon-Labs que detecta intentos de prompt injection y de jailbreak, tanto en mensajes escritos directamente por el usuario (inyeccion directa) como en contenido no confiable que lee un agente de IA: correos, paginas web, documentos, fragmentos recuperados por RAG y salidas de herramientas o API (inyeccion indirecta). Devuelve dos etiquetas, `benign` (0) e `injection` (1), y esta construido sobre el backbone jhu-clsp/mmBERT-small, una variante multilingue de la familia ModernBERT, con 140.642.306 parametros (~141 M) y una ventana de contexto de 8.000 tokens.

El modelo esta orientado a agentes: se entreno con documentos realistas de 45 tipos en los que se insertaron inyecciones, junto con sus versiones limpias, de modo que aprende a buscar *instrucciones dirigidas a la IA* y no simples palabras amenazantes. De ahi su comportamiento en textos benignos que contienen disparadores: 0,861 de exactitud en NotInject y 1,000 en XSTest, con 0,995 declarado en OR-Bench-hard.

Su relevancia actual es doble. Por un lado cubre la inyeccion indirecta, que es el vector tipico en agentes que consumen herramientas externas y que los filtros centrados en el mensaje del usuario no cubren. Por otro, incorpora datos sinteticos de entrenamiento en 30 idiomas, lo que lo hace util en despliegues multilingues donde los guardrails solo en ingles se degradan. La variante small prioriza el coste de inferencia frente al modelo base de 308 M de la misma familia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (backbone `jhu-clsp/mmBERT-small`) |
| Parametros totales | 140.642.306 (~141 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.000 tokens |
| Tipos de cuantizacion | ONNX fp32 y ONNX int8 (embeddings en int8, aproximadamente la mitad de tamano); en transformers.js, `dtype: "q8"` |
| Idiomas soportados | Multilingue; etiquetas para en, de, fr, es, pt, it, nl, pl, ru, uk, tr, ar, hi, zh, ja, ko, vi, id y th; datos sinteticos de entrenamiento en 30 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (`onnx/model.onnx` fp32, `onnx/model_quantized.onnx` int8) |

Otros datos de distribucion: repositorio de 1,4 GB, sin gating, pipeline `text-classification`, libreria `transformers`, compatible con text-embeddings-inference y con Hugging Face Inference Endpoints. Fechas de creacion y ultima actualizacion: 23 de septiembre de 2026. Descargas y likes en el momento de la consulta: 0 y 0.

## Arquitectura y entrenamiento

El modelo es un clasificador de secuencia (dos etiquetas) construido sobre el backbone `jhu-clsp/mmBERT-small`, derivado de ModernBERT en su variante multilingue. Se trata de un transformer encoder denso de ~141 M de parametros, sin mecanismos de mezcla de expertos (MoE) ni estado recurrente. El tokenizador y el modelo se cargan con `AutoTokenizer` y `AutoModelForSequenceClassification`. Se distribuyen pesos en safetensors para PyTorch y exportaciones ONNX en fp32 e int8, esta ultima con embeddings cuantizados a int8.

El autor declara que el entrenamiento se realizo unicamente con datos con licencia permisiva y que se deduplico el conjunto de entrenamiento contra todos los conjuntos de evaluacion. Entre los corpus empleados figuran conjuntos especificos de inyeccion y jailbreak (neuralchemy/Prompt-injection-dataset, S-Labs/prompt-injection-dataset, microsoft/llmail-inject-challenge, hendzh/PromptShield, TrustAIRLab/in-the-wild-jailbreak-prompts, nvidia/Nemotron-RL-Agentic-Indirect-Prompt-Injection-v1, 3nesdeniz/agentic-prompt-injection-5k, rgeada/tool-response-injections) junto con corpus generales y multilingues (OpenAssistant/oasst2, CohereLabs/aya_dataset, HuggingFaceFW/fineweb-edu, HuggingFaceFW/fineweb-2). No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en la documentacion publicada.

La innovacion tecnica principal que declara el autor es el enfoque de datos: 45 tipos de documento con inyecciones plantadas y sus contrapartidas limpias, con datos sinteticos en 30 idiomas, orientados a distinguir instrucciones dirigidas al modelo de instrucciones dirigidas a humanos o de discusiones *sobre* prompt injection. El modelo se evalua con ventana deslizante (maximo sobre ventanas) para entradas largas.

## Capacidades

- Clasificacion binaria de texto en `benign` (0) e `injection` (1) para deteccion de prompt injection y jailbreak.
- Deteccion de inyeccion directa: intentos de anular instrucciones, mensajes falsos de sistema o desarrollador, trucos de delimitadores, extraccion del system prompt y encuadres de jailbreak (persona, "developer mode", hipoteticos).
- Deteccion de inyeccion indirecta en contenido no confiable: correos, paginas web, documentos, fragmentos de RAG y salidas de herramientas o API, incluidas instrucciones educadas u ocultas (comentarios HTML, notas falsas atribuidas al usuario).
- Procesamiento de entradas largas: contexto de 8.000 tokens; para documentos mayores la model card propone ventana deslizante con `window` y `stride` y agregacion por maximo de probabilidad.
- Multilingue: etiquetas de idioma para 20 idiomas y datos sinteticos de entrenamiento en 30 idiomas.
- Inferencia en multiples runtimes: PyTorch (`transformers`), ONNX Runtime y transformers.js en el navegador.
- Distincion deliberada entre intento de *override* y peticion danina: las solicitudes peligrosas sin intento de anulacion se etiquetan como benignas y se derivan a un clasificador de moderacion de contenido.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, no ejecuta razonamiento multi-paso ni agentes por si mismo; su funcion es la de guardrail previo o posterior a las llamadas del agente.
- No dispone de modo de razonamiento (thinking), vision ni audio.

## Casos de uso

- Guardrail de entrada en asistentes conversacionales: clasificar el mensaje del usuario antes de enviarlo al LLM y bloquear, reescribir o derivar a revision las peticiones con puntuacion de inyeccion superior al umbral. Los ~141 M de parametros permiten ejecutarlo en la misma instancia que el LLM con un coste de latencia minimo.
- Proteccion de pipelines RAG: puntuar cada fragmento recuperado antes de insertarlo en el contexto del modelo, ya que el texto recuperado es contenido no confiable. Con `window=2048` y `stride=512` la funcion de ejemplo cubre documentos de longitud arbitraria.
- Interceptacion de salidas de herramientas en agentes: escanear respuestas de API, resultados de busqueda web, correos o tickets antes de que el agente los interprete, siguiendo el patron de la model card (`fetch_web_page` seguido de `injection_score` y sustitucion del contenido sospechoso).
- Automatizacion de correo y gestion documental: el entrenamiento incluye 45 tipos de documento con inyecciones plantadas y sus versiones limpias, lo que encaja con el filtrado de adjuntos, mensajes entrantes y documentos procesados en lote.
- Extensiones de navegador y aplicaciones de escritorio con transformers.js: la exportacion ONNX int8 mas `dtype: "q8"` permite clasificar en el cliente sin enviar el contenido a un servidor, util para asistentes embebidos en paginas o en aplicaciones Electron.
- Auditoria de seguridad y red teaming: puntuar grandes volumenes de logs o prompts historicos para calcular tasas de inyeccion, comparar variantes de ataque y priorizar los casos que revisara un analista.
- Convivencia con moderacion de contenido: separar el problema de seguridad (intento de override) del de contenido danino. El modelo etiqueta como benignas las peticiones peligrosas sin intento de anulacion, de modo que se combina con un clasificador de seguridad en lugar de sustituirlo.
- Aplicaciones multilingues: el soporte declarado de 20 idiomas y los datos sinteticos en 30 idiomas permiten desplegar un unico guardrail en productos con usuarios en varios idiomas en lugar de mantener filtros por idioma.

## Benchmarks y rendimiento

Todos los numeros fueron calculados por el autor con el mismo script (`code/train/evaluate.py`) y umbral por defecto de 0,5. Las entradas largas se puntuan con ventana deslizante (maximo sobre ventanas; 512 tokens para las lineas base basadas en DeBERTa). Los conjuntos marcados con asterisco estan excluidos del generador sintetico propio, que es el mismo que produjo los datos de entrenamiento; el autor los incluye solo a titulo informativo porque favorecen a su modelo. Los datos de entrenamiento se deduplicaron contra todos los conjuntos de evaluacion.

Subconjunto de la tabla de evaluacion disponible (defensa excesiva; mayor valor = menos falsas alarmas):

| Conjunto de evaluacion | Este modelo | base (308 M) | ProtectAI v2 | deepset | PIGuard | Prompt Guard 2 86M | Prompt Guard 2 22M | Wolf Defender | NeuralTrust small |
|---|---|---|---|---|---|---|---|---|---|
| NotInject (prompts benignos con palabras disparadoras), exactitud | 0,861 | 0,909 | 0,563 | 0,286 | 0,885 | 0,953 | 0,994 | 0,920 | 0,944 |
| XSTest (prompts seguros e inseguros pero sin inyeccion), exactitud | 1,000 | 1,000 | 1,000 | 1,000 | 1,000 | 1,000 | 1,000 | 0,964 | 0,720 |

La model card declara ademas 0,995 de exactitud en OR-Bench-hard (prompts benignos aparentemente toxicos). El resto de filas de la tabla de evaluacion (OR-Bench-hard-1k y conjuntos posteriores) aparece truncado en la informacion disponible, por lo que no se reproducen. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks generativos: no aplican a un clasificador.

## Requisitos de hardware

- VRAM estimada para los pesos (calculo a partir de los 140.642.306 parametros): aproximadamente 0,56 GB en fp32, 0,28 GB en fp16/bf16 y 0,14 GB en la exportacion ONNX int8.
- VRAM total en inferencia: con activaciones y ventana completa de 8.000 tokens, el modelo cabe holgadamente por debajo de 1 GB en fp16 y en torno a ese orden en fp32. Cualquier GPU consumer lo ejecuta sin problema.
- GPU recomendadas: no hay recomendaciones publicadas por el autor. Por tamano, cualquier GPU desde una GTX 1060 de 6 GB o una RTX 3060 en adelante es suficiente; tambien es viable en CPU y en el navegador mediante transformers.js.
- Caber en GPU consumer: si, en todas las gamas actuales, incluso en las de 4-6 GB, y tambien en CPU para lotes moderados.
- Opciones de despliegue: `transformers` con PyTorch, ONNX Runtime (`onnx/model.onnx` o `onnx/model_quantized.onnx`), transformers.js, text-embeddings-inference y Hugging Face Inference Endpoints (el modelo esta marcado como `endpoints_compatible`). No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no estan soportados de forma nativa.
- Latencia y throughput: no disponibles. El autor no publica medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Exactitud NotInject | Exactitud XSTest |
|---|---|---|---|---|---|---|
| prompt-injection-guard-small (este modelo) | 141 M | 8.000 tokens | Apache-2.0 | Abierto, sin gating, safetensors y ONNX | 0,861 | 1,000 |
| prompt-injection-guard-base | 308 M | no disponible | no disponible | Abierto (misma cuenta de Horizon-Labs) | 0,909 | 1,000 |
| Prompt Guard 2 86M | 86 M | no disponible | no disponible | no disponible | 0,953 | 1,000 |
| Prompt Guard 2 22M | 22 M | no disponible | no disponible | no disponible | 0,994 | 1,000 |
| ProtectAI v2 (base DeBERTa) | no disponible | no disponible | no disponible | no disponible | 0,563 | 1,000 |
| PIGuard | no disponible | no disponible | no disponible | no disponible | 0,885 | 1,000 |
| deepset (deberta-v3-base-prompt-injection) | no disponible | no disponible | no disponible | no disponible | 0,286 | 1,000 |
| Wolf Defender | no disponible | no disponible | no disponible | no disponible | 0,920 | 0,964 |
| NeuralTrust small | no disponible | no disponible | no disponible | no disponible | 0,944 | 0,720 |

Las cifras de los modelos alternativos proceden de la tabla de evaluacion del autor de este modelo, no de mediciones independientes. Los parametros, la licencia y el contexto de los modelos de terceros no se detallan en la informacion disponible. En defensa excesiva sobre NotInject, Prompt Guard 2 22M y Prompt Guard 2 86M superan a este modelo (0,994 y 0,953 frente a 0,861), mientras que el modelo base de 308 M de la misma familia tambien lo supera (0,909) a costa de mas del doble de parametros.

## Limitaciones y advertencias

- No es un modelo generativo ni un sistema de mitigacion completo: solo clasifica. La respuesta al ataque (bloquear, sanear el contenido, reescribir el prompt) debe implementarla la aplicacion.
- Delimitacion deliberada del alcance: las peticiones daninas sin intento de anulacion de instrucciones se etiquetan como benignas, igual que los documentos que contienen instrucciones para humanos o que *discuten* prompt injection. No sustituye a un clasificador de moderacion de contenido.
- Tasa no despreciable de falsos positivos en textos con palabras disparadoras: 0,861 de exactitud en NotInject implica en torno a un 13,9 % de clasificaciones incorrectas en ese conjunto, muy por encima del 0,994 de Prompt Guard 2 22M.
- Umbral fijo: la evaluacion usa 0,5 por defecto. En produccion conviene calibrar el umbral segun el coste relativo de falsos positivos y falsos negativos, y no existe una guia publicada de calibracion por dominio.
- Limite de contexto de 8.000 tokens: los documentos mas largos requieren ventana deslizante con solapamiento, lo que multiplica el coste de computo y puede fragmentar una inyeccion entre dos ventanas.
- Idiomas: aunque se declaran 20 idiomas etiquetados y datos sinteticos en 30, no se publican metricas desagregadas por idioma, por lo que el rendimiento real fuera del ingles no esta verificado.
- Sesgo de datos sinteticos: los conjuntos de evaluacion marcados con asterisco proceden del mismo generador que los datos de entrenamiento, lo que infla los resultados. El autor lo advierte explicitamente y pide no usarlos como referencia de rendimiento real.
- Riesgo de confianza mal calibrada: un clasificador puede devolver puntuaciones cercanas a 1,0 en textos que no son inyecciones (y viceversa); conviene tratar la salida como senal, no como decision definitiva, y registrar los casos dudosos.
- Adopcion temprana: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de terceros.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero conviene verificar las licencias de los conjuntos de datos de entrenamiento si se redistribuye el modelo o se derivan versiones.
- No se han publicado medidas de latencia, throughput ni consumo energetico, imprescindibles para dimensionar un guardrail en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/prompt-injection-guard-small
- Demo en el navegador: https://huggingface.co/spaces/Horizon-Labs/prompt-injection-guard
- Variante de mayor tamano: https://huggingface.co/Horizon-Labs/prompt-injection-guard-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido sobre el partido politico Horizons, Meta Horizon, la saga de videojuegos Horizon y el programa Horizon Europe). No se han localizado papers, blogs tecnicos ni repositorios adicionales en la busqueda realizada.
