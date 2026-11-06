# olo-labs/olo-qwen3.5-9b-hotfolder

## Resumen

olo-qwen3.5-9b-hotfolder es un adaptador QLoRA publicado por olo-labs sobre el modelo base Qwen/Qwen3.5-9B. Su objetivo es especializar al modelo en la emisión correcta de llamadas a herramientas (tool calling) en el formato nativo del modelo base, en concreto para invocar herramientas MCP (Model Context Protocol) gestionadas por olo-toolgate. El adaptador se distribuye como pesos PEFT en safetensors y no como un modelo completo: requiere cargar el modelo base Qwen3.5-9B y aplicar el adaptador encima.

El problema que aborda es la fiabilidad del tool calling en producción: nombres de herramienta correctos, JSON estricto, argumentos que respetan el esquema de cada herramienta y, sobre todo, la decisión de no invocar ninguna herramienta cuando ninguna encaja. Según la model card, el adaptador se entrenó con 10 herramientas del ejemplo `hotfolder` (operaciones de fichero) y 1.447 filas de entrenamiento, y mejora al modelo base en tasa de acierto global y en la métrica de "no-tool correct" sobre un conjunto de prompts retenidos.

La relevancia es acotada pero concreta: es un adaptador pequeño (repo de 0,4 GB) para un caso de uso muy específico (herramientas de sistema de ficheros vía MCP), con métricas publicadas por el autor y sin información sobre licencia ni idiomas soportados en la información disponible. No es un modelo generalista, sino un ajuste fino orientado a agentes que necesitan invocar herramientas con esquemas estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (QLoRA) sobre transformer Qwen/Qwen3.5-9B; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base es de 9B (según su nombre) |
| Parametros activos | No aplica (no es MoE según la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | Entrenado con QLoRA; el adaptador se publica en safetensors. Cuantizaciones de inferencia (GGUF, AWQ, GPTQ) no disponibles |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA sobre Qwen/Qwen3.5-9B, es decir, con el modelo base cuantizado en baja precisión y adaptadores de bajo rango entrenables. El entrenamiento se realizó en el formato de tool calling nativo del modelo base: el adaptador aprende a responder con una única llamada a herramienta en ese formato, con argumentos que respetan el esquema JSON de la herramienta, o con texto plano cuando ninguna herramienta encaja. Se usaron 10 herramientas del ejemplo `hotfolder` (append_text, copy, file_info, hash, list, mkdir, move, read_text, search_text, write_text), 1.447 filas de entrenamiento y 200 pasos, con una pérdida final media (últimos 50 pasos) de 0,0634 y un tiempo de entrenamiento de 85,2 minutos (run `20261104_121057`).

La innovación principal no es arquitectónica sino de formato y de datos: el adaptador se entrena para respetar el esquema de cada herramienta y para abstenerse de llamar a ninguna cuando no procede. La model card indica que el sistema prompt recomendado incluye instrucciones explícitas sobre nombres exactos, tipos, valores enum, argumentos requeridos y la regla de no inventar valores. El adaptador también se ofrece a herramientas no vistas en entrenamiento mediante el mismo mecanismo de paso de herramientas en el campo `tools` del template de chat o de un servidor compatible con OpenAI. No se detalla composición del dataset, uso de RLHF/DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de llamadas a herramientas (tool calling) en el formato nativo de Qwen3.5-9B, con un único tool call por respuesta.
- Function calling compatible con el campo `tools` del chat template y con servidores OpenAI-compatibles (vLLM, Ollama, llama.cpp).
- Integración con herramientas MCP a través de olo-toolgate.
- Generación de JSON estricto y argumentos válidos según esquema (tipos, enums, límites, requeridos).
- Abstención correcta: responde en texto plano cuando ninguna herramienta disponible encaja.
- Generalización a herramientas no vistas en entrenamiento, ofreciéndolas por el mismo canal.
- Modo sin thinking: el ejemplo de uso desactiva el razonamiento (`enable_thinking=False`, `reasoning_effort='none'`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Automatización de operaciones sobre ficheros: el adaptador está entrenado con las 10 herramientas `hotfolder` (listar, leer, escribir, copiar, mover, crear directorios, hash, búsqueda de texto), por lo que puede gestionar tareas de organización de directorios invocando la herramienta correcta con argumentos válidos.
- Agentes MCP en producción: al integrarse con olo-toolgate, permite que un agente descubra y ejecute herramientas MCP con llamadas en formato estricto, reduciendo errores de parseo en el servidor.
- Servidores OpenAI-compatibles: puede desplegarse en vLLM, Ollama o llama.cpp pasando las herramientas en el campo `tools` de la petición, lo que facilita su integración en pipelines existentes sin cambiar el cliente.
- Enrutamiento de intenciones con abstención: la mejora de "no-tool correct" (73,3% a 93,3%) lo hace adecuado para asistentes que deben decidir si responder en texto o invocar una herramienta, evitando llamadas espurias.
- Validación de esquemas en CI/CD: al generar argumentos schema-valid con alta tasa, puede usarse en pipelines que validan contratos de herramientas antes de desplegarlas.
- Herramientas personalizadas no vistas en entrenamiento: la model card indica que se le pueden ofrecer herramientas nuevas por el mismo canal, lo que permite prototipar integraciones sin reentrenar.
- Asistentes de soporte técnico con herramientas de diagnóstico: el ejemplo de la model card ("Is host web-01 healthy?") sugiere su uso en consultas de estado que requieren invocar una herramienta de lookup.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre prompts retenidos (no vistos en entrenamiento), mismo system prompt y decodificación greedy:

| Métrica | Modelo base | Este adaptador | Cambio |
|---|---|---|---|
| Pass rate | 94,1% | 98,8% | +4,7 pts |
| Right tool | 100,0% | 99,6% | -0,4 pts |
| Strict JSON | 96,9% | 99,6% | +2,7 pts |
| Schema-valid arguments | 100,0% | 99,6% | -0,4 pts |
| Exact arguments | 94,6% | 99,1% | +4,5 pts |
| No-tool correct | 73,3% | 93,3% | +20,0 pts |

Datos adicionales de la model card: el entrenamiento corrigió 13 prompts que el modelo base fallaba y rompió 1. Sobre prompts de validación escritos por autores de herramientas y por personas (nunca entrenados), la tasa fue del 97,3% (36/37). No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,4 GB, pero requiere cargar el modelo base Qwen3.5-9B, por lo que la VRAM necesaria viene determinada por el base y su cuantización.
- VRAM estimada para el base en FP16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 9-10 GB; en 4 bits, en torno a 5-6 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para FP16 sin compromisos; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; GPUs consumer de 8-12 GB solo con cuantización de 4 bits.
- Cabe en GPU consumer con cuantización agresiva; el adaptador PEFT en sí no añade requisitos significativos.
- Opciones de despliegue: transformers con PEFT (`AutoPeftModelForCausalLM`), vLLM con el parser de tool calls del modelo base, Ollama y llama.cpp (según la model card).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olo-qwen3.5-9b-hotfolder | Adaptador sobre base 9B | No disponible | Tool calling MCP (hotfolder) | No disponible | Hugging Face (olo-labs) |
| Qwen/Qwen3.5-9B (base) | 9B | No disponible | Modelo generalista con tool calling | No disponible | Hugging Face (Qwen) |
| Alternativas de tool calling de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables adicionales en la documentación proporcionada; la comparativa más directa es contra el propio modelo base, cuyos resultados se recogen en la sección de benchmarks.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar Qwen/Qwen3.5-9B, con el coste de VRAM asociado.
- Entrenado con solo 10 herramientas del ejemplo `hotfolder` y 1.447 filas; el rendimiento en dominios muy distintos puede no generalizar igual.
- La licencia no está disponible en la información proporcionada, por lo que no puede confirmarse el uso comercial; debe verificarse en el repositorio antes de producción.
- No se documentan idiomas soportados; el comportamiento multilingüe no está garantizado.
- Riesgo de alucinación de valores en argumentos: la model card recomienda un system prompt explícito para evitar inventar valores requeridos.
- La métrica "Right tool" y "Schema-valid arguments" empeoran ligeramente respecto al base (-0,4 pts cada una), aunque la tasa global mejora.
- El adaptador está pensado para un único tool call por respuesta; no se documenta soporte de llamadas múltiples o paralelas.
- Depende del formato de tool calling del modelo base; cambios en el template o en el parser del servidor pueden afectar al comportamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria externa.

## Enlaces

- Hugging Face: https://huggingface.co/olo-labs/olo-qwen3.5-9b-hotfolder
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio olo-toolgate: https://github.com/olo-labs/olo-toolgate
- Herramienta de entrenamiento olo-ai-training-mcp: https://github.com/olo-labs/olo-ai-training-mcp
