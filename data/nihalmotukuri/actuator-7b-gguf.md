# nihalmotukuri/actuator-7b-gguf

## Resumen

Actuator-7B es un ajuste fino del modelo Qwen2.5-7B-Instruct orientado especificamente a la generacion de llamadas a herramientas (tool calling) y a la extraccion de JSON estructurado validado contra esquemas. Lo desarrolla el usuario nihalmotukuri y se distribuye unicamente en formato GGUF, pensado para su uso local con Ollama, llama.cpp o LM Studio. El modelo aborda un problema concreto y bien documentado: los modelos de 7B-8B tienden a envolver el JSON en prosa o en bloques de codigo Markdown, inventar claves de parametros, omitir campos obligatorios o responder conversacionalmente cuando una herramienta devuelve un error, lo que rompe los parsers de los pipelines de agentes.

La propuesta es convertir al modelo en un despachador fiable entre lenguaje natural y APIs estrictas, eliminando el relleno conversacional. Para ello se entrena con QLoRA de 4 bits sobre 4.800 ejemplos verificados procedentes de xLAM y del dataset de function calling de NousResearch, con enmascaramiento de perdida solo en las respuestas. El resultado es un modelo de 7.615.616.512 parametros (7,6B) con una ventana de contexto de entrenamiento de 3.072 tokens, licencia Apache 2.0 y pesos unicamente en GGUF.

Es relevante ahora porque la mayoria de frameworks de agentes (n8n, Cline, Roo Code, servidores MCP, OpenWebUI) exigen JSON estrictamente valido y, hasta la fecha, conseguir eso con modelos pequenos en local requeria prompting defensivo o validacion y reintentos en el codigo del cliente. Actuator-7B traslada esa responsabilidad al modelo mediante ajuste fino supervisado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3.072 tokens en entrenamiento; contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M y Q8_0 (los exportados por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (no se publican safetensors del modelo ajustado) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por rotacion posicional (RoPE) y sesgo QKV, del que no se detallan mas particularidades en la informacion disponible. Sobre esa base se aplica un ajuste fino supervisado con QLoRA de 4 bits, rango r=16, lora_alpha=32 y adaptadores en todas las proyecciones lineales, usando la libreria Unsloth. El entrenamiento emplea enmascaramiento de perdida solo en las respuestas (train_on_responses_only), de modo que el modelo no aprende a reproducir los prompts del usuario.

El conjunto de datos consta de 4.800 ejemplos verificados en tres bloques: 2.250 muestras filtradas y normalizadas de Salesforce/xlam-function-calling-60k para tool calling simple, paralelo y con argumentos anidados; 1.400 muestras de la particion func_calling de NousResearch/hermes-function-calling-v1 para bucles de ejecucion multi-turno, recuperacion de errores y abstencion; y 1.150 muestras de las particiones json_mode y jsonschema de ese mismo dataset, verificadas contra esquema, para adherencia a JSON Schema sin Markdown. Los hiperparametros incluyen contexto de 3.072 tokens, batch efectivo de 16, optimizador adamw_8bit, schedule coseno con learning rate 2e-4, 15 pasos de calentamiento y precision bf16, todo sobre una unica GPU RTX 5070 Ti de 12 GB. No se menciona RLHF ni DPO en la informacion proporcionada.

La innovacion principal no es arquitectonica sino de formato: el modelo se apoya en la plantilla de chat nativa de Qwen con etiquetas `<tool_call>` y se entrena para emitir JSON crudo, sin cercas de codigo ni texto adicional, ademas de abstenerse de invocar herramientas cuando la peticion no lo requiere.

## Capacidades

- Generacion de llamadas a funciones en formato nativo de Qwen (`<tool_call>`), compatible con la API de herramientas de Ollama y con el esquema OpenAI de function calling.
- Tool calling simple, paralelo y con argumentos anidados.
- Extraccion de JSON estructurado validado contra un JSON Schema proporcionado en el prompt, con salida en JSON crudo sin bloques Markdown.
- Abstencion: el modelo no invoca herramientas irrelevantes cuando corresponde una respuesta de texto.
- Recuperacion de errores en bucles multi-turno: corrige argumentos y reintenta en lugar de disculparse conversacionalmente.
- Integracion declarada con Ollama, LM Studio, vLLM, n8n, Cline, Roo Code, OpenWebUI y servidores MCP.
- Capacidades generales de generacion de texto y razonamiento heredadas de Qwen2.5-7B-Instruct, aunque no son el objetivo del ajuste.
- Capacidades multilingues limitadas al ingles segun la model card; el modelo base soporta mas idiomas, pero el ajuste se realizo solo en ingles.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Backend de agentes en local para automatizacion de flujos: el modelo actua como despachador entre peticiones en lenguaje natural y funciones registradas, emitiendo JSON valido que el orquestador puede pasar directamente a `json.loads()` o a un modelo Pydantic sin capa de saneamiento.
- Extraccion de datos de documentos hacia sistemas de gestion: con un JSON Schema en el prompt de sistema, convierte texto libre (facturas, pedidos, correos) en objetos estructurados con tipos correctos, lo que encaja en pipelines ETL y en la ingestion de datos para ERPs.
- Automatizacion de workflows en n8n: el modelo puede ocupar el nodo de agente y decidir que nodo o API invocar, con la ventaja de que la salida respeta el esquema esperado por el nodo siguiente y evita ramas de error por JSON malformado.
- Integracion con servidores MCP: al respetar la plantilla nativa de Qwen y el formato de tool calling, puede conectarse a herramientas expuestas por MCP para consultas a bases de datos, sistemas de ficheros o APIs internas en entornos con requisitos de privacidad.
- Asistentes de codigo en IDE (Cline, Roo Code): el modelo propone llamadas a herramientas de edicion de ficheros, ejecucion de comandos y busqueda en el repositorio, con argumentos tipados correctamente y abstencion cuando la peticion es puramente conversacional.
- Atencion al cliente con derivacion a acciones: en un chat multi-turno, decide cuando responder texto y cuando invocar funciones como consultar pedido, cambiar direccion o abrir incidencia, manteniendo el contexto dentro de los 3.072 tokens de entrenamiento.
- Despliegue en hardware de consumo para prototipado de agentes: al publicarse en GGUF Q4_K_M, puede ejecutarse en una unica GPU de 12 GB o en CPU, lo que permite iterar sobre disenos de herramientas sin coste de API en la nube.

## Benchmarks y rendimiento

Evaluacion del autor sobre 150 tareas reservadas, repartidas a partes iguales entre llamadas simples y paralelas (50), multi-turno y abstencion (50) y extraccion estructurada validada con `jsonschema` (50). La comparacion es contra Qwen2.5-7B-Instruct sin ajustar, con Actuator-7B en cuantizacion Q4_K_M.

| Metrica | Qwen2.5-7B-Instruct | Actuator-7B (Q4_K_M) | Delta |
|---|---|---|---|
| Sintaxis JSON de tool call valida | 100,0% | 100,0% | — |
| Coincidencia exacta de funcion y argumentos | 53,73% | 76,12% | +22,39 pp |
| Precision de abstencion / irrelevancia | 84,85% | 100,0% | +15,15 pp |
| JSON crudo sin cercas Markdown | 96,00% | 100,0% | +4,00 pp |
| Cumplimiento estricto de `jsonschema` | 96,00% | 100,0% | +4,00 pp |

No se han publicado resultados en benchmarks academicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores proceden exclusivamente de la evaluacion interna del autor y no han sido replicadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB en Q4_K_M (pesos de ~4,4 GB mas cache KV) y en torno a 8-9 GB en Q8_0 (pesos de ~8,1 GB mas cache KV); el repositorio completo ocupa 12,8 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para Q4_K_M; 12 GB o mas para Q8_0. El autor entreno el ajuste en una RTX 5070 Ti de 12 GB, lo que confirma que el modelo completo en cuantizacion baja cabe en ese perfil.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070) con Q4_K_M, y en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070, RTX 5070 Ti) con Q8_0.
- Opciones de despliegue: Ollama (`ollama run hf.co/nihalmotukuri/actuator-7b-gguf:Q4_K_M`), llama.cpp, LM Studio y vLLM (este ultimo requiere convertir el GGUF o servir el modelo base ajustado, no incluido en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Actuator-7B | 7,6B | 3.072 tokens (entrenamiento) | Tool calling y JSON Schema estricto | Apache 2.0 | GGUF (Q4_K_M, Q8_0) |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens nativos (ampliable) | Instruct generalista con tool calling | Apache 2.0 | safetensors, GGUF |
| Hermes-2-Pro-Mistral-7B | 7,2B | 32.768 tokens | Function calling y JSON mode | Apache 2.0 | safetensors, GGUF |
| xLAM-7B-r | 7B | no disponible | Function calling (origen de parte del dataset) | no disponible | safetensors, GGUF |

Actuator-7B sacrifica ventana de contexto frente a Qwen2.5-7B-Instruct y Hermes-2-Pro (3.072 frente a 32.768 tokens) a cambio de una tasa de coincidencia exacta de argumentos del 76,12% frente al 53,73% de la base sin ajustar. Frente a Hermes-2-Pro-Mistral-7B, el dato diferencial es la adherencia estricta a `jsonschema` y la abstencion, aunque no se dispone de una comparacion directa entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- El contexto de entrenamiento es de solo 3.072 tokens; conversaciones de agente largas o esquemas de herramientas muy extensos pueden exceder esa ventana y degradar la calidad de las llamadas.
- El modelo esta ajustado unicamente en ingles; su uso en castellano u otros idiomas no esta validado y puede producir argumentos incorrectos o texto mezclado.
- Los benchmarks son internos del autor, sobre 150 tareas y sin replicacion independiente; deben tomarse como indicativos y no como garantia de rendimiento en produccion.
- Riesgo de alucinacion de nombres de funciones o de claves de parametros si el esquema de herramientas no se proporciona de forma completa y explicita en el prompt.
- El repositorio solo contiene pesos GGUF; no se publican safetensors del ajuste ni los adaptadores LoRA, lo que limita el reentrenamiento o la fusion con otras tecnicas.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin comunidad ni issues que permitan validar su comportamiento en escenarios reales.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base Qwen2.5-7B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun asi, conviene revisar los terminos del modelo base.
- Al ser un ajuste agresivo hacia un formato concreto, puede haber perdido parte de la capacidad conversacional general del modelo base; no se recomienda como sustituto de un instruct generalista.
- No se documentan medidas de seguridad, alineamiento ni filtros de contenido; el modelo puede reproducir sesgos presentes en los datasets xLAM y Hermes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nihalmotukuri/actuator-7b-gguf
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (framework de ajuste): https://github.com/unslothai/unsloth
- Dataset Salesforce/xlam-function-calling-60k: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Ollama: https://ollama.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
