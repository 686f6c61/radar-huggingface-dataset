# ermiaazarkhalili/Qwen3.5-2B-Function-Calling-xLAM

## Resumen

Qwen3.5-2B-Function-Calling-xLAM es un ajuste fino de Qwen/Qwen3.5-2B especializado en *function calling* (llamada a funciones), publicado por el usuario ermiaazarkhalili en Hugging Face. El modelo parte del checkpoint base Qwen3.5-2B, un transformer causal de 1.881.825.088 parametros, y se ha entrenado mediante QLoRA (cuantizacion 4-bit NF4 con doble cuantizacion) sobre el dataset Salesforce/xlam-function-calling-60k, para despues fusionar los adaptadores LoRA en una copia bf16 del modelo base.

El objetivo es acotado y practico: dado un *prompt* con una consulta del usuario y un conjunto de definiciones de herramientas en JSON, el modelo genera un bloque `<answers>` con las llamadas a funciones correspondientes, tambien en JSON. No es un modelo conversacional generalista ni un asistente multimodal: es un modelo de texto puro (Qwen3_5ForCausalLM) que descarta la torre de vision del checkpoint base, si la tuviera, y que usa un formato de *prompt* etiquetado crudo, sin plantilla de chat.

Su relevancia radica en que demuestra un flujo de trabajo reproducible y ligero (una sola epoca, LoRA de rango 16, contexto de entrenamiento de 2048 tokens) para dotar a un modelo pequeno de capacidades fiables de invocacion de herramientas. Aun asi, conviene subrayar que se trata de un modelo con 9 descargas y 0 *likes* en el momento de la consulta, sin benchmarks publicados ni validacion externa, por lo que debe evaluarse con cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen3_5ForCausalLM), ajustado con QLoRA y fusionado |
| Parametros totales | 1.881.825.088 (~1,88 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso max_length de 2048 tokens |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 con doble cuantizacion y computo bfloat16; pesos publicados en safetensors (bf16 tras fusion); no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-2B) |
| Formato de pesos | safetensors (libreria transformers); tamano del repo 6,5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de tipo decoder-only, identificado en el codigo como `Qwen3_5ForCausalLM`, derivado de Qwen/Qwen3.5-2B. El ajuste fino se realizo con el stack Transformers + PEFT + TRL (`SFTTrainer`), cargando el modelo base en 4 bits (NF4, doble cuantizacion, computo en bfloat16) y aplicando LoRA con rango 16, `lora_alpha` 32, `lora_dropout` 0,05, sin bias y con `task_type` CAUSAL_LM. La implementacion de atencion durante el entrenamiento fue SDPA (`attn_implementation: sdpa`).

El entrenamiento consistio en una unica epoca sobre Salesforce/xlam-function-calling-60k, con `max_length` de 2048, batch de 1 por dispositivo, acumulacion de gradientes de 8 pasos y evaluacion con batch de 2. La innovacion metodologica mas destacable es la mascara de perdida: solo el bloque `<answers>` y el token EOS contribuyeron a la funcion de perdida, de modo que el modelo aprende a generar las llamadas a funciones y no a reproducir la consulta ni las definiciones de herramientas. Tras el entrenamiento, los adaptadores se fusionaron en una copia bf16 del modelo base, eliminando la dependencia de PEFT en inferencia. No se documenta el numero total de tokens vistos, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de llamadas a funciones en JSON a partir de una consulta y un conjunto de definiciones de herramientas, con el formato `<query>...</query>`, `<tools>[...]</tools>` y `<answers>[...]</answers>`.
- Seleccion de la herramienta adecuada entre varias candidatas y construccion de los argumentos segun el esquema de parametros declarado.
- Generacion de multiples llamadas a funciones en un mismo bloque de respuestas.
- Manejo de esquemas de parametros con tipos, valores por defecto y campos opcionales.
- Generacion determinista recomendada (`do_sample=False`) con terminacion mediante token EOS.
- Capacidad de texto general heredada del modelo base Qwen3.5-2B, aunque no es el foco del ajuste.
- No soporta vision: la torre de vision del checkpoint base, si existe, no forma parte de este modelo.
- No se documenta soporte de *tool calling* multi-turno, agentes, modo *thinking* ni audio.
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Enrutamiento de consultas a APIs: dado un catalogo de funciones (por ejemplo, consulta de razas de gatos, listado de ciudades por region o detalles de empresa), el modelo selecciona la funcion correcta y rellena los argumentos, lo que permite construir un despachador de herramientas sin reglas manuales.
- Extraccion estructurada de parametros: en pipelines de automatizacion, el modelo convierte lenguaje natural en JSON valido con los campos exigidos por el esquema, lo que simplifica la integracion con servicios internos.
- Prototipado rapido de agentes: con menos de 2 mil millones de parametros y pesos en bf16, se puede desplegar en una unica GPU consumer para validar flujos de invocacion de herramientas antes de invertir en modelos mayores.
- Asistentes de dominio acotado: con un catalogo de funciones fijo (reservas, consultas de catalogo, operaciones CRUD), el modelo actua como capa de traduccion entre la peticion del usuario y la llamada concreta.
- Generacion de *fixtures* y datos sinteticos de function calling: al producir pares consulta-llamada en JSON, sirve para aumentar datasets de entrenamiento o pruebas de integracion.
- Educacion y experimentacion: su receta de entrenamiento (QLoRA, rango 16, una epoca, mascara de perdida solo en respuestas) es un ejemplo reproducible para quienes quieran ajustar modelos pequenos a tareas de invocacion de herramientas.
- Evaluacion comparativa de tecnicas de ajuste: al estar construido sobre un dataset publico y un modelo base conocido, permite medir el efecto de hiperparametros de LoRA en la precision de las llamadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 4 GB solo para pesos (1,88 mil millones de parametros a 2 bytes), mas el *overhead* de activaciones y cache KV; en la practica, entre 5 y 8 GB segun longitud de contexto y lote.
- VRAM estimada en cuantizacion 4-bit (si se genera con herramientas externas, no incluidas en el repo): aproximadamente 1,5-2,5 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bf16 en lotes pequenos; A100, H100 o L40S para despliegues con concurrencia.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; en 8 GB (RTX 3070, RTX 4060) funciona en bf16 con contextos moderados.
- Opciones de despliegue: transformers (flujo documentado en la model card), vLLM y TGI para servido con concurrencia, llama.cpp u Ollama si se convierte a GGUF (no se proporciona ese formato en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Function-Calling-xLAM | ~1,88 mil millones | No disponible (entrenado a 2048) | Function calling especializado | Apache 2.0 | Hugging Face, 9 descargas |
| Qwen/Qwen3.5-2B (base) | ~1,88 mil millones | No disponible | Modelo generalista | Apache 2.0 | Hugging Face |
| Salesforce/xLAM (familia de modelos) | No disponible en la informacion proporcionada | No disponible | Function calling | No disponible | Hugging Face |

La comparacion con alternativas de la misma categoria no puede completarse con datos verificados: no se dispone de resultados de benchmarks del modelo ni de especificaciones detalladas de los modelos xLAM en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de texto puro: no procesa imagenes ni audio, y descarta cualquier componente multimodal del checkpoint base.
- Idioma: la model card declara unicamente ingles; el rendimiento en castellano no esta validado.
- Formato rigido: espera bloques `<query>`, `<tools>` y `<answers>` sin plantilla de chat; un formato distinto degrada la salida y puede romper el parseo JSON.
- Riesgo de alucinacion: puede inventar nombres de funciones, parametros no declarados o valores fuera de esquema, especialmente con catalogos de herramientas largos o ambiguos.
- Entrenamiento minimo: una sola epoca, LoRA de rango 16 y contexto de 2048 tokens; no se documenta validacion con metricas de exactitud de llamadas.
- Sin benchmarks publicados ni validacion externa; con 9 descargas y 0 *likes*, la adopcion es practicamente nula.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-2B, que conviene revisar.
- En produccion, se recomienda validar la salida JSON contra el esquema de herramientas y aplicar *fallbacks* ante errores de parseo.
- No se documentan sesgos especificos; al derivar de un modelo base entrenado con datos web, es previsible que herede sesgos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ermiaazarkhalili/Qwen3.5-2B-Function-Calling-xLAM
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
