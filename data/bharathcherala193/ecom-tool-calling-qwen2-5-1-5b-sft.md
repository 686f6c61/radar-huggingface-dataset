# bharathcherala193/ecom-tool-calling-qwen2.5-1.5b-sft

## Resumen

`ecom-tool-calling-qwen2.5-1.5b-sft` es un adaptador LoRA entrenado mediante QLoRA sobre el modelo base Qwen2.5-1.5B-Instruct, desarrollado por el usuario de HuggingFace bharathcherala193. Su proposito es ensenar al modelo a seleccionar entre 12 herramientas de comercio electronico y responder en uno de tres formatos fijos: una llamada a herramienta en JSON (`{"arguments": {...}, "name": "<tool>"}`), la etiqueta `NO_TOOL_CALL` cuando ninguna herramienta aplica, o `NEED_MORE_INFO` cuando falta un argumento obligatorio. El autor lo describe explicitamente como una prueba de concepto y no como un modelo de produccion.

El modelo resuelve un problema acotado pero comun en asistentes de e-commerce: convertir lenguaje natural en llamadas estructuradas a funciones (busqueda de productos, seguimiento de pedidos, gestion de devoluciones) con un formato estrictamente parseable. Al estar construido sobre Qwen2.5-1.5B-Instruct, hereda una arquitectura transformer densa de 1.500 millones de parametros con 32.768 tokens de contexto, aunque el adaptador anade solo unos pocos millones de parametros entrenables.

Su relevancia actual es la de un ejemplo reproducible y ligero de ajuste fino para tool calling: demuestra que con 300 pasos de QLoRA y 5.541 ejemplos filtrados se puede pasar de una tasa de formato valido del 0,05 en el modelo base a 1,00 en el adaptador, a costa de una precision de argumentos aun limitada (0,308). Es util como referencia metodologica y como punto de partida, no como componente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; no verificado para el adaptador |
| Tipos de cuantizacion | QLoRA 4-bit NF4 durante entrenamiento; cuantizaciones del adaptador no disponibles |
| Idiomas soportados | No disponibles (heredados del modelo base, sin evaluacion especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer denso con atencion causal estandar. El ajuste se realizo con QLoRA en 4-bit NF4, con rango r=16, alpha=32, 300 pasos y tasa de aprendizaje 2e-4. El conjunto de entrenamiento son 5.541 ejemplos filtrados del dataset `rescommons/Full-Ecom-Chatbot-Dataset`, con objetivos mezclados y balanceados: 1.022 llamadas a herramienta, 2.000 ejemplos de informacion faltante y 3.000 de ausencia de herramienta (estos dos ultimos con tope para equilibrar clases).

La innovacion tecnica principal no esta en la arquitectura sino en el diseno del objetivo: el modelo aprende a discriminar entre tres decisiones discretas (llamar, no llamar, pedir mas datos) ademas de rellenar argumentos, todo ello bajo un esquema fijo de 12 herramientas y un system prompt concreto ("You are Aria, a helpful e-commerce assistant..."). El repositorio incluye `utils.py` con `TOOLS_SCHEMA`, `build_chat_prompt_text` y `parse_model_output` para reproducir el preprocesado. Se probo una variante con DPO que no se publico porque no mejoro la precision de argumentos y degradaba el comportamiento de no-llamada y de informacion faltante.

## Capacidades

- Seleccion de herramienta entre 12 funciones de e-commerce definidas en `TOOLS_SCHEMA`.
- Generacion de llamadas a herramienta en JSON con el formato `{"arguments": {...}, "name": "<tool>"}`.
- Deteccion de ausencia de herramienta aplicable mediante la etiqueta `NO_TOOL_CALL`.
- Deteccion de argumentos faltantes mediante la etiqueta `NEED_MORE_INFO`.
- Conversacion multi-turno sujeta al system prompt de entrenamiento (asistente "Aria").
- Generacion de texto general heredada del modelo base Qwen2.5-1.5B-Instruct.
- No se documenta soporte de agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Clasificacion de intencion en atencion al cliente: el adaptador decide si la consulta requiere una herramienta (busqueda, seguimiento, devolucion) o si debe responder sin llamada, con una tasa de acierto de no-llamada de 0,867 en el conjunto de prueba.
- Enrutado de peticiones en un backend de e-commerce: dado un mensaje de usuario, generar el JSON de llamada que un orquestador ejecutara contra APIs internas, aprovechando la tasa de formato valido de 1,00.
- Deteccion de informacion incompleta en formularios conversacionales: usar `NEED_MORE_INFO` para activar una pregunta de aclaracion antes de invocar una API (precision de 0,867 en el conjunto de prueba).
- Prototipado rapido de asistentes de tienda: al ser un adaptador LoRA de bajo coste sobre un modelo de 1.5B, permite iterar sobre el esquema de herramientas sin reentrenar desde cero.
- Filtro previo a un modelo mayor: usar este adaptador como primera etapa para descartar conversaciones sin intencion de herramienta y reservar un modelo mas grande para los casos que si la requieren.
- Base para experimentos de investigacion en tool calling: el repositorio incluye utilidades de construccion de prompt y parseo, lo que facilita reproducir el pipeline y comparar con otras estrategias de ajuste.
- Demo educativa de QLoRA: sirve para ilustrar el impacto de un SFT ligero (300 pasos) en la adherencia a formato frente al modelo base.

## Benchmarks y rendimiento

Evaluacion sobre un subconjunto reservado de 300 ejemplos (120 de llamada a herramienta, 90 de informacion faltante, 90 sin herramienta), con decodificacion greedy:

| Metrica | Modelo base | Este adaptador |
|---|---|---|
| valid_format_rate | 0,05 | 1,00 |
| exact_match_rate | 0,003 | 0,643 |
| tool_name_accuracy | 0,083 | 0,625 |
| argument_accuracy | 0,008 | 0,308 |
| no_tool_accuracy | 0,00 | 0,867 |
| missing_info_accuracy | 0,00 | 0,867 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4-bit ocupa aproximadamente 1 GB de pesos; con overhead de contexto y runtime, entre 2 y 4 GB en GPU.
- En precision completa (fp16) el modelo base requiere unos 3 GB de pesos, mas cache KV.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; para mayor throughput, A100 o H100 no son necesarias dado el tamano.
- Cabe en GPU consumer: si, practicamente en todas las GPU modernas de NVIDIA, AMD o Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar Qwen2.5-1.5B-Instruct y adjuntar el adaptador con `PeftModel.from_pretrained`; compatible con vLLM (soporte LoRA), TGI, llama.cpp (previa fusion del adaptador y conversion a GGUF) y Ollama (previa fusion y conversion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ecom-tool-calling-qwen2.5-1.5b-sft | 1,5B (base) + LoRA | 32.768 (base) | Tool calling e-commerce, 12 herramientas | Apache 2.0 | HuggingFace (adaptador PEFT) |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Instruccion general, tool calling nativo | Apache 2.0 | HuggingFace |
| Qwen2.5-7B-Instruct | 7B | 32.768 (128K en variantes) | Instruccion general, tool calling nativo | Apache 2.0 | HuggingFace |
| Hermes-2-Pro (Mistral/Llama base) | 7B / 8B | 32.768 | Function calling especializado | Apache 2.0 (segun variante) | HuggingFace |

La comparativa de rendimiento frente a estas alternativas no esta disponible en la informacion proporcionada; el adaptador solo reporta metricas frente a su propio modelo base.

## Limitaciones y advertencias

- El autor lo califica explicitamente como prueba de concepto, no como modelo de produccion.
- Solo se evaluaron 120 ejemplos de llamada a herramienta (de 248 disponibles), por lo que diferencias de pocos puntos estan dentro del ruido estadistico.
- La precision de argumentos es baja (0,308): incluso eligiendo la herramienta correcta, los argumentos suelen diferir de la referencia, y el exact-match penaliza diferencias de texto libre.
- A veces emite `NO_TOOL_CALL` en peticiones simples de busqueda o de anadir al carrito.
- Depende estrictamente del system prompt de entrenamiento; un prompt distinto puede alterar el comportamiento.
- Aproximadamente el 7% de los identificadores de pedido objetivo no aparecen en el prompt porque no se incluyo el historial de conversacion, lo que introduce errores inevitables en esos casos.
- La variante con DPO no se publico por no aportar mejoras medibles y degradar los comportamientos de no-llamada e informacion faltante.
- No hay evaluacion multilingue publicada; el comportamiento en idiomas distintos del ingles (idioma del system prompt y del dataset) es desconocido.
- Riesgo de alucinacion en argumentos y en nombres de herramienta fuera del esquema; se recomienda validacion estricta del JSON contra `TOOLS_SCHEMA` antes de ejecutar cualquier llamada.
- Licencia Apache 2.0 permite uso comercial, pero sin garantias del autor y con las limitaciones tecnicas descritas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bharathcherala193/ecom-tool-calling-qwen2.5-1.5b-sft
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/rescommons/Full-Ecom-Chatbot-Dataset
- Repositorio PEFT: https://github.com/huggingface/peft
- No se han encontrado papers, blogs o demos adicionales en la informacion disponible.
