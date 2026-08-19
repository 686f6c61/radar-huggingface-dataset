# SmallAICreator/AuroraGPT-ToolFix

## Resumen

AuroraGPT-ToolFix es un modelo de lenguaje de 707 millones de parámetros orientado a chat y generación de texto, publicado por el usuario SmallAICreator y desarrollado por UltraLabs. Se presenta como una evolución de AuroraGPT-Math: sobre ese modelo base se ha aplicado un LoRA de robustez de herramientas (tool-robustness LoRA) que restaura la fiabilidad de la llamada a funciones (tool calling) independientemente de cómo se redacte el system prompt, sin perder las mejoras matemáticas conseguidas previamente. El modelo está diseñado para ejecutarse en dispositivos locales (on-device) y se distribuye tanto en formato safetensors como en GGUF cuantizado.

El problema que resuelve es concreto: AuroraGPT-Math había diluido la señal de entrenamiento de tool calling al añadir unos 250 000 ejemplos de matemáticas, lo que hacía que las llamadas a herramientas solo funcionasen con la redacción exacta del prompt de entrenamiento. AuroraGPT-ToolFix reentrena los ejemplos de herramientas bajo 12 variantes de system prompt, logrando que el modelo asocie la intención de uso de herramientas con el contenido semántico y no con una cadena memorizada. Con 707,48 millones de parámetros, es un modelo compacto pensado para entornos con recursos limitados, aunque el autor reconoce abiertamente sus limitaciones en calidad conversacional general frente a alternativas del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo Llama, segun los tags del repositorio) |
| Parametros totales | 707 480 064 (~707M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16/FP32 (safetensors) y Q8_0 (GGUF, 753 MB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 707 millones de parametros, clasificado dentro de la familia arquitectonica Llama segun los tags del repositorio. No se proporcionan detalles sobre el numero de capas, dimensiones de atencion o configuracion exacta del transformer. La informacion disponible indica que el modelo es el resultado de un proceso de destilacion (distillation) a partir de un modelo flagship anterior, aunque no se especifica cual.

El entrenamiento se describe en dos fases. Primero, AuroraGPT-Math anadio aproximadamente 250 000 ejemplos de matematicas generados proceduralmente con cadenas de razonamiento correctas por construccion, lo que duplico la aritmetica de libro cerrado en una prueba interna de 16 preguntas (de 5/16 a 10/16). Sin embargo, esa adicion diluyo la senal de tool calling unas 5 veces, haciendo que las llamadas a herramientas solo funcionasen con la redaccion exacta del prompt de entrenamiento. Para corregirlo, AuroraGPT-ToolFix rejugo cada uno de los 2 751 ejemplos de herramientas bajo 12 redacciones distintas del system prompt (original, bloque JSON `<tools>`, terse, verbose, con bullets, numerado, estilo XML, asistente generico, solo JSON y sin system prompt), generando unos 33 000 ejemplos de herramientas. Se aplico un LoRA con rango 16 durante una epoca y se fusiono con el modelo base. El autor no detalla la composicion completa del dataset original ni si se uso RLHF o DPO.

## Capacidades

- Generacion de texto y chat conversacional en ingles.
- Tool calling robusto: el modelo emite llamadas a herramientas en formato JSON dentro de etiquetas `<tool_call>`, y funciona con una amplia variedad de redacciones del system prompt, incluyendo bloques JSON, listas numeradas o ausencia total de system prompt.
- Capacidades matematicas mejoradas respecto al modelo base, aunque el modelo tiende a delegar en una herramienta de calculadora cuando esta disponible en lugar de calcular inline.
- Soporte para herramientas externas como calculadora, busqueda web o fetch_url, lo que permite integrarlo en agentes simples.
- Capacidad de recibir resultados de herramientas como turnos de usuario con etiquetas `<tool_response>`.
- Formato de chat propio (no ChatML) con tokens especiales `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`.
- No se mencionan capacidades multimodales (vision, audio) ni modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional en dispositivos moviles o embebidos: al ser un modelo de 707M con cuantizacion Q8_0 (753 MB), puede ejecutarse localmente en telefonos o Raspberry Pi. Su tool calling robusto permite que la aplicacion le proporcione herramientas como busqueda local o consultas a una base de datos, y el modelo las invocara correctamente aunque el prompt del sistema se formule de distintas maneras.
- Agente de automatizacion de tareas simples: por ejemplo, un bot que recibe peticiones como "calcula el 15% de 80" o "busca el clima en Madrid". El modelo emitira una llamada a la herramienta correspondiente (calculadora, fetch_url) y procesara el resultado para dar una respuesta final. Esto es util en entornos de bajo consumo donde no se puede ejecutar un LLM grande.
- Chatbot de atencion al cliente con acceso a documentacion externa: el modelo puede recibir una consulta del usuario, invocar una herramienta de busqueda web o de recuperacion de documentos, y sintetizar la respuesta. Su robustez frente a variaciones en el system prompt facilita su integracion en plataformas que ya tienen su propio formato de prompt.
- Prototipado rapido de agentes con tool calling: desarrolladores que necesitan validar flujos de agente con un modelo pequeno pueden usar AuroraGPT-ToolFix para probar la logica de llamadas a herramientas antes de escalar a modelos mayores. Su formato de salida JSON es parseable y ejecutable por cualquier harness.
- Asistente de matematicas con calculadora integrada: el modelo esta entrenado para delegar calculos aritmeticos en una herramienta de calculadora cuando esta disponible. Esto lo hace adecuado para aplicaciones educativas o de calculo cientifico basico donde la exactitud es critica, siempre que la herramienta este presente.
- Aplicaciones de bajo coste en la nube: gracias a su tamano reducido, puede desplegarse en instancias con poca VRAM o incluso en CPU, reduciendo el coste por peticion en entornos de produccion con alto volumen de consultas simples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona evaluaciones locales propias, que se resumen a continuacion.

**Valid tool calls por redaccion del system prompt** (3 prompts por estilo, evaluacion local):

| Estilo de system prompt | AuroraGPT-Math | AuroraGPT-ToolFix |
|---|---|---|
| Redaccion exacta de entrenamiento | 3/3 | 3/3 |
| Bloque JSON `<tools>` | 2/3 | 3/3 |
| Terse | 3/3 | 3/3 |
| Asistente generico | 3/3 | 3/3 |
| Lista numerada | 3/3 | 3/3 |
| **Total** | **14/15** | **15/15** |

**Comparacion con LiquidAI LFM2-700M** (ambos en Q8_0, cada modelo en su formato de chat nativo):

| Prueba | AuroraGPT-ToolFix | LFM2-700M |
|---|---|---|
| Tool calls validas (5 prompts) | **5/5** | 0/5 |
| Calidad general de chat (20 preguntas, con herramientas habilitadas) | 16/20 | 19/20 |
| Hechos | 6/6 | 6/6 |
| Matematicas | 4/5 | 5/5 |
| Seguimiento de instrucciones | 3/5 | 5/5 |
| Seguridad (deberia rechazar) | 1/2 | 1/2 |
| Sobre-rechazo (deberia responder) | 2/2 | 2/2 |

Nota: con herramientas deshabilitadas, AuroraGPT-ToolFix puntua 12/20 en la misma prueba de 20 preguntas, porque las llamadas a herramientas correctas quedan sin ejecutar. El autor reconoce explicitamente que LFM2-700M es superior en calidad conversacional general, pero que AuroraGPT-ToolFix es el unico de los dos capaz de realizar tool calling de forma parseable.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 (safetensors) se necesitan aproximadamente 1,4 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV. En Q8_0 (GGUF) los pesos ocupan 753 MB, por lo que cabe en GPUs con 2 GB de VRAM o incluso en memoria unificada de dispositivos moviles.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.) para FP16; para Q8_0 basta con 1 GB libre. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Cabe en GPUs de consumo: si, en la practica totalidad de GPUs de escritorio y portatiles modernas, asi como en Apple Silicon (M1/M2) mediante llama.cpp.
- Opciones de despliegue: transformers (PyTorch), llama.cpp, Ollama, text-generation-inference (TGI) y vLLM (este ultimo requiere adaptacion al formato de chat no ChatML). El repositorio incluye un GGUF Q8_0 con plantilla de chat embebida.
- Latencia y throughput: no se proporcionan datos oficiales. Como referencia orientativa, un modelo de 700M en Q8_0 en una GPU moderna (RTX 4090) puede generar decenas de tokens por segundo; en CPU, la velocidad depende del numero de nucleos y de la memoria.

## Comparativa con modelos similares

La comparacion directa disponible es con LiquidAI LFM2-700M, del mismo rango de tamano. No se dispone de datos de otros modelos de 700M como Qwen2-0.5B o TinyLlama-1.1B para una comparacion cuantitativa.

| Modelo | Parametros | Tool calling | Calidad chat (20 preguntas) | Licencia |
|---|---|---|---|---|
| AuroraGPT-ToolFix | 707M | 5/5 (parseable JSON) | 16/20 | Apache-2.0 |
| LiquidAI LFM2-700M | 700M | 0/5 (pseudo-codigo no parseable) | 19/20 | No especificada en la informacion |
| AuroraGPT-Math (base) | 707M | 14/15 (solo con redaccion exacta) | No evaluado | Apache-2.0 |

AuroraGPT-ToolFix destaca por su tool calling fiable y su licencia permisiva, pero queda por detras de LFM2-700M en calidad conversacional general. Es una compensacion deliberada: el modelo prioriza la capacidad de invocar herramientas sobre la fluidez del chat.

## Limitaciones y advertencias

- Seguridad: el modelo tiene poco o ningun entrenamiento de rechazo de solicitudes peligrosas. En una prueba de 2 prompts de seguridad, solo rechazo 1. No debe desplegarse en aplicaciones orientadas al usuario final sin una capa de seguridad adicional.
- Calidad conversacional: es inferior a la de LFM2-700M (16/20 vs 19/20 incluso con herramientas habilitadas). No es adecuado para tareas que requieran un chat fluido y natural de alta calidad.
- Seguimiento de instrucciones: inconsistente (3/5 en la prueba del autor). Puede ignorar restricciones de formato como "responde solo si o no" o "dilo en mayusculas".
- Aritmetica inline: fragil. Cuando el modelo calcula sin usar la calculadora, puede dar resultados incorrectos (ejemplo: "15% de 80" responde 20 en lugar de 12). Es imprescindible mantener la herramienta de calculadora disponible cuando la exactitud sea critica.
- Correccion de premisas falsas: debil. Puede aceptar y confirmar mitos populares si se le presentan como hechos.
- Conocimiento de libro cerrado: limitado por su tamano de 707M. El autor recomienda emparejarlo con herramientas de busqueda web o fetch_url para tareas que requieran informacion factual.
- Idioma: solo ingles. No soporta otros idiomas.
- Formato de chat propietario: no usa ChatML, lo que puede requerir adaptaciones en frameworks que esperan ese formato.
- Sin benchmarks estandar publicados: los resultados proporcionados son evaluaciones locales del autor, no comparables con MMLU, HumanEval u otros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SmallAICreator/AuroraGPT-ToolFix
- Modelo base AuroraGPT-Math: https://huggingface.co/SmallAICreator/AuroraGPT-Math
- Repositorio de modelos de SmallAICreator en Hugging Face: https://huggingface.co/SmallAICreator
