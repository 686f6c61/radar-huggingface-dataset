# olo-labs/olo-qwen3-4b-thinking-hotfolder

## Resumen

olo-qwen3-4b-thinking-hotfolder es un adaptador PEFT (QLoRA) sobre el modelo base Qwen/Qwen3-4B, desarrollado por olo-labs. Su proposito es especializar al modelo base en la emision correcta de llamadas a herramientas (tool calling) siguiendo el formato nativo de Qwen3 y el esquema de herramientas MCP expuestas por olo-toolgate. El adaptador no introduce capacidades nuevas de razonamiento: reutiliza el formato de tool calling del modelo base y lo ajusta para que las llamadas sean estrictamente validas contra el esquema JSON de cada herramienta.

El modelo resuelve un problema concreto de ingenieria: los LLM pequenos tienden a producir llamadas a herramientas con argumentos incompletos, tipos incorrectos o nombres de campo que no coinciden con el esquema. El adaptador se entrena sobre 10 herramientas del ejemplo `hotfolder` (operaciones de ficheros: leer, escribir, mover, copiar, listar, crear directorios, buscar texto, hashear, obtener metadatos y anadir texto) y reporta una tasa de exito del 100% en un conjunto de validacion de 254 prompts retenidos.

El modelo base Qwen3-4B es un transformer denso de 4 mil millones de parametros con modo thinking habilitable. El adaptador se distribuye como pesos PEFT en safetensors (0,3 GB), lo que implica que para inferencia hay que cargar el modelo base completo ademas del adaptador. La licencia del adaptador no esta declarada en la model card, aunque hereda las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (QLoRA) sobre transformer denso Qwen3-4B |
| Parametros totales | No disponible (adaptador sobre base de 4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card (heredada del base Qwen3-4B) |
| Tipos de cuantizacion | QLoRA en entrenamiento; cuantizacion de inferencia no especificada |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere modelo base Qwen/Qwen3-4B |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Qwen/Qwen3-4B, un transformer decoder-only denso. No se modifican los pesos base: se anaden matrices de bajo rango en las capas que PEFT seleccione, y el resultado se distribuye como un unico repositorio de 0,3 GB. El entrenamiento emplea 1447 filas de datos y 400 pasos, con una perdida final media (ultimos 50 pasos) de 0,0091. El tiempo de entrenamiento reportado es de 150,5 minutos, con identificador de ejecucion `20261103_031800`. El pipeline de entrenamiento se construyo con olo-ai-training-mcp.

La innovacion tecnica principal no esta en la arquitectura sino en el diseno del dataset y del formato: los ejemplos se generan en el formato nativo de tool calling del chat template de Qwen3, de modo que el adaptador aprende a emitir una unica llamada con nombre de herramienta exacto, argumentos con tipos y valores enum correctos, campos obligatorios presentes y campos opcionales omitidos cuando el usuario no los solicita. Se incluyen ejemplos negativos (cuando ninguna herramienta encaja, el modelo debe responder en texto plano) y ejemplos con herramientas no vistas en entrenamiento, ofrecidas por la misma via estandar. El adaptador se evalua con decodificacion greedy y `enable_thinking=False` en el ejemplo de uso.

## Capacidades

- Generacion de llamadas a herramientas en el formato nativo de Qwen3, compatible con el campo `tools` del chat template y con servidores OpenAI-compatibles (vLLM, Ollama, llama.cpp).
- Cumplimiento estricto de esquemas JSON: nombres de argumentos, tipos, valores enum y limites declarados en la herramienta.
- Emision de una unica llamada por turno, con todos los argumentos obligatorios y sin argumentos opcionales no solicitados.
- Respuesta en texto plano cuando ninguna herramienta disponible encaja con la peticion, incluyendo casos de herramientas no disponibles.
- Generalizacion a herramientas no vistas en entrenamiento si se ofrecen por la misma via estandar.
- Integracion con el ecosistema MCP a traves de olo-toolgate.
- Capacidades de razonamiento y generacion de texto heredadas del modelo base Qwen3-4B (no evaluadas de forma especifica en la model card).

## Casos de uso

- Automatizacion de operaciones sobre ficheros en pipelines de datos: el adaptador puede invocar `read_text`, `write_text`, `append_text`, `copy`, `move`, `mkdir` y `hash` con argumentos validos contra el esquema, lo que permite construir agentes que manipulen directorios de staging sin validacion manual de cada llamada.
- Indexacion y busqueda en repositorios documentales: con `search_text` y `list`, el modelo puede encadenar busquedas y listados para localizar contenido en una carpeta caliente (hotfolder) antes de decidir la siguiente accion.
- Servidor de herramientas para agentes: desplegado detras de vLLM u Ollama con el parser de tool calling de Qwen3, el adaptador actua como capa de traduccion entre lenguaje natural y llamadas MCP, reduciendo errores de esquema en produccion.
- Enrutamiento de peticiones en asistentes internos: dado un conjunto de herramientas de sistema de ficheros, el modelo decide si la peticion requiere una herramienta o puede responderse en texto, lo que sirve para clasificar intenciones antes de invocar servicios costosos.
- Generacion de datos sinteticos de tool calling: el adaptador puede usarse para producir ejemplos etiquetados de llamadas correctas sobre las 10 herramientas del conjunto `hotfolder`, utiles para ampliar datasets de entrenamiento de otros modelos.
- Prototipado de agentes MCP en local: al ser un adaptador sobre un modelo de 4B, es viable ejecutarlo en una GPU de consumo para iterar sobre disenos de herramientas y prompts antes de escalar a modelos mayores.
- Validacion de esquemas en CI: el adaptador puede integrarse en tests que verifiquen que las herramientas expuestas por un servidor MCP son invocables correctamente por un LLM, detectando regresiones en la definicion de esquemas.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 254 prompts retenidos, mismo system prompt y decodificacion greedy:

| Metrica | Modelo base | Adaptador | Cambio |
|---|---|---|---|
| Tasa de exito (pass rate) | 95,3% | 100,0% | +4,7 pts |
| Herramienta correcta | 97,3% | 100,0% | +2,7 pts |
| JSON estricto | 97,8% | 100,0% | +2,2 pts |
| Argumentos validos contra esquema | 97,3% | 100,0% | +2,7 pts |
| Argumentos exactos | 87,9% | 100,0% | +12,1 pts |
| Sin herramienta, respuesta correcta | 90,0% | 100,0% | +10,0 pts |

Desglose por categoria:

| Categoria | Modelo base | Adaptador |
|---|---|---|
| defaults | 38/38 (100,0%) | 38/38 (100,0%) |
| negative | 16/18 (88,9%) | 18/18 (100,0%) |
| parameter_variation | 59/60 (98,3%) | 60/60 (100,0%) |
| positive | 118/126 (93,7%) | 126/126 (100,0%) |
| unavailable | 11/12 (91,7%) | 12/12 (100,0%) |

El autor indica que el entrenamiento corrigio 12 prompts que el modelo base fallaba y no rompio ninguno. En el conjunto de validacion (37 prompts escritos por autores de herramientas y por personas, nunca vistos en entrenamiento) el adaptador obtiene 100,0% (37/37). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador anade 0,3 GB a los pesos del modelo base Qwen3-4B. En fp16 el base ocupa aproximadamente 8 GB; en cuantizacion de 4 bits, alrededor de 2,5-3 GB. La VRAM total depende de la cuantizacion elegida para el base, no del adaptador.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion con concurrencia. Para desarrollo, RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes en fp16.
- GPU de consumo: si, el modelo base de 4B cabe en GPUs consumer con 8 GB o mas en cuantizacion de 4 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.).
- Opciones de despliegue: vLLM con el parser de tool calling de Qwen3, Ollama, llama.cpp, TGI. El adaptador puede fusionarse con el base o cargarse con `AutoPeftModelForCausalLM` de PEFT.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olo-qwen3-4b-thinking-hotfolder | 4B (base) + adaptador | No disponible | Tool calling MCP sobre Qwen3-4B | No disponible | Hugging Face (olo-labs) |
| Qwen/Qwen3-4B | 4B | No disponible en la ficha | Modelo base generalista con tool calling | No disponible en la ficha | Hugging Face (Qwen) |
| Adaptadores QLoRA de tool calling sobre modelos de 3-8B | 3-8B | Variable | Especializacion en function calling | Variable | Hugging Face |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada. El unico punto de comparacion documentado es el propio modelo base, frente al que el adaptador mejora entre 2,2 y 12,1 puntos porcentuales en las metricas de tool calling evaluadas.

## Limitaciones y advertencias

- El adaptador esta entrenado sobre 10 herramientas concretas del ejemplo `hotfolder`; su rendimiento en herramientas muy distintas depende de la generalizacion, que el autor reporta como positiva pero no cuantifica con un conjunto amplio.
- La licencia no esta declarada en la model card, lo que impide confirmar si el uso comercial esta permitido. Hay que verificar la licencia del modelo base Qwen/Qwen3-4B antes de desplegar en produccion.
- Los idiomas soportados no estan documentados; el comportamiento multilingue hereda del base pero no se ha evaluado.
- La longitud de contexto no se especifica en la model card; debe consultarse la del modelo base.
- El conjunto de evaluacion es pequeno (254 prompts retenidos y 37 de validacion); una tasa de exito del 100% en ese conjunto no garantiza el mismo rendimiento en dominios o esquemas no representados.
- Riesgo de alucinacion de nombres de herramienta o argumentos fuera de esquema en herramientas no vistas, aunque el entrenamiento incluye ejemplos con herramientas no presentes en el conjunto de entrenamiento.
- El adaptador requiere cargar el modelo base completo; no es un modelo autonomo y no puede desplegarse sin Qwen/Qwen3-4B.
- El ejemplo de uso desactiva el modo thinking (`enable_thinking=False`); el comportamiento con thinking habilitado no esta documentado.
- No se han publicado resultados de benchmarks generales de razonamiento, codigo o matematicas; el adaptador solo esta evaluado en tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olo-labs/olo-qwen3-4b-thinking-hotfolder
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio olo-toolgate: https://github.com/olo-labs/olo-toolgate
- Repositorio olo-ai-training-mcp: https://github.com/olo-labs/olo-ai-training-mcp
