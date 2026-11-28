# ermiaazarkhalili/LFM2.5-1.2B-Function-Calling-xLAM

## Resumen

LFM2.5-1.2B-Function-Calling-xLAM es un ajuste fino del modelo LiquidAI/LFM2.5-1.2B-Instruct realizado por el usuario independiente ermiaazarkhalili. El objetivo del ajuste es especializar el modelo base en la tarea de *function calling* (generacion de llamadas a funciones en formato JSON) utilizando el conjunto de datos Salesforce/xlam-function-calling-60k. El resultado es un modelo de texto puro de 1.170.340.608 parametros (1,17 mil millones), empaquetado en `safetensors` y compatible con la libreria `transformers`.

El modelo parte de la familia LFM2.5 de Liquid AI, una arquitectura propietaria de tipo `Lfm2ForCausalLM` disenada para despliegue eficiente en el borde. El ajuste se realizo mediante QLoRA (cuantizacion NF4 de 4 bits con doble cuantizacion, r=16, alpha=32, dropout=0,05) usando TRL `SFTTrainer` sobre una unica epoca y una longitud maxima de secuencia de 2048 tokens, y posteriormente se fusionaron los adaptadores en una copia en bf16 del modelo base. El repositorio ocupa 3,4 GB.

La relevancia de esta ficha radica en que ejemplifica el patron de especializacion de modelos pequenos para tareas estructuradas: un modelo de 1,2 B de parametros que puede ejecutarse en hardware de consumo y que ha sido reentrenado para emitir llamadas a funciones con un formato de prompt concreto (bloques `<query>`, `<tools>` y `<answers>`). Es un caso de uso acotado, con solo 14 descargas y sin benchmarks publicados, por lo que debe evaluarse con cautela antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Lfm2ForCausalLM` (familia LFM2.5 de Liquid AI; transformer, detalles internos no disponibles) |
| Parametros totales | 1.170.340.608 (1,17 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la longitud maxima de entrenamiento fue 2048 tokens) |
| Tipos de cuantizacion | Entrenamiento en QLoRA NF4 4 bits con doble cuantizacion y computo bf16; pesos publicados en safetensors (presumiblemente bf16); no se publican GGUF ni otras variantes |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `lfm1.0` (etiquetada como `other` en Hugging Face) |
| Formato de pesos | `safetensors` |
| Modelo base | LiquidAI/LFM2.5-1.2B-Instruct |
| Dataset de ajuste | Salesforce/xlam-function-calling-60k |
| Metodo de ajuste | QLoRA + TRL SFTTrainer, fusionado en bf16 |
| Tamano del repositorio | 3,4 GB |
| Modalidad | Solo texto (sin torre de vision) |

## Arquitectura y entrenamiento

El modelo es un `Lfm2ForCausalLM`, es decir, un modelo causal de lenguaje de la familia LFM2.5 de Liquid AI. La model card no detalla la arquitectura interna (numero de capas, dimension oculta, tipo de atencion, uso de capas convolucionales o SSM hibridas), por lo que esos datos deben considerarse no disponibles. Se confirma que es un modelo solo de texto: la torre de vision del checkpoint base, si existiera, no forma parte de este modelo.

El entrenamiento consistio en un ajuste fino supervisado (SFT) con QLoRA sobre el dataset xLAM de Salesforce, que contiene 60.000 ejemplos de llamadas a funciones. La configuracion registrada incluye cuantizacion NF4 de 4 bits con doble cuantizacion y computo en bfloat16, atencion con `sdpa`, rango LoRA 16, alpha 32, dropout 0,05, `bias=none`, `task_type=CAUSAL_LM`, una sola epoca, batch por dispositivo de 1 y acumulacion de gradientes de 8, con `max_length=2048`. Solo se calculo la perdida sobre el bloque `<answers>` y el token EOS, lo que concentra el aprendizaje en la generacion de la llamada a funcion y no en la reproduccion del prompt. Tras el entrenamiento, los adaptadores se fusionaron en una copia en bf16 del modelo base. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de llamadas a funciones en JSON a partir de una consulta en lenguaje natural y un conjunto de definiciones de herramientas proporcionadas en el prompt.
- Formato de prompt especifico basado en etiquetas: `<query>...</query>`, `<tools>[...]</tools>` y `<answers>[...]</answers><|im_end|>`; no utiliza chat template.
- Salida estructurada parseable: el bloque `<answers>` contiene un array JSON de llamadas a funciones.
- Generacion de texto general heredada del modelo base LFM2.5-1.2B-Instruct (razonamiento basico, respuesta a preguntas), aunque el ajuste esta orientado a function calling.
- Soporte de multiples herramientas simultaneas en el prompt (el ejemplo de la model card incluye tres definiciones con parametros anidados).
- Capacidad multilingue limitada al ingles segun la model card.
- No dispone de vision, audio, modo thinking explicito ni capacidades de agente multi-paso documentadas.

## Casos de uso

- Enrutamiento de consultas a APIs: dado un catalogo de endpoints descrito en JSON, el modelo selecciona la funcion adecuada y rellena los parametros, lo que permite construir una capa de enrutamiento ligera sin depender de un LLM grande.
- Asistentes de voz o chat en el borde: con 1,17 B de parametros y pesos en bf16, puede ejecutarse en GPUs de consumo o incluso en CPU, lo que lo hace adecuado para asistentes locales que necesitan invocar funciones del sistema.
- Extraccion de parametros estructurados: convertir texto libre en argumentos JSON tipados para herramientas internas (por ejemplo, `get_breed_information` con el nombre de la raza), reduciendo el parseo manual en pipelines de automatizacion.
- Prototipado rapido de agentes: al ser un modelo pequeno y con un formato de prompt sencillo, sirve para validar disenos de esquemas de herramientas y flujos de tool calling antes de migrar a modelos mayores.
- Automatizacion de tareas de back-office: generar llamadas a funciones para consultar bases de datos o servicios REST a partir de solicitudes en lenguaje natural, con la ventaja de que el modelo cabe en un unico dispositivo.
- Filtrado y clasificacion de intenciones: usar la llamada a funcion generada como señal de clasificacion (que herramienta se elige) en sistemas de triaje de tickets o solicitudes.
- Base para ajustes posteriores: al estar publicado con licencia LFM1.0 y en safetensors, puede servir como punto de partida para especializaciones adicionales en dominios concretos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud de llamadas a funciones, MMLU, HumanEval, GSM8K ni comparaciones cuantitativas con otros modelos. Tampoco se documentan latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 2,3-2,5 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, alrededor de 1,2-1,5 GB; en 4 bits, alrededor de 0,7-1 GB (estimaciones a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o A100/H100.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna con 6 GB o mas en bf16; en cuantizacion 4 bits podria caber en iGPUs y en CPU.
- Opciones de despliegue: `transformers` (soporte nativo, `Lfm2ForCausalLM`), y previsiblemente vLLM y TGI si incorporan soporte para la arquitectura LFM2.5; llama.cpp/Ollama requeririan conversion a GGUF, que no se publica en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Function-Calling-xLAM | 1,17 B | no disponible (entrenado a 2048) | Function calling (xLAM) | lfm1.0 | Hugging Face, 14 descargas |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1,17 B | no disponible en la informacion | Instrucciones generales | lfm1.0 | Hugging Face (modelo oficial) |
| Salesforce/xLAM-1B-fc-r | ~1 B (no confirmado en la informacion) | no disponible | Function calling | no disponible en la informacion | Hugging Face |
| Modelos de function calling de 1-3 B (p. ej. familias Qwen o Hermes) | 1-3 B | variable | Tool calling | variable | Hugging Face |

La comparacion cuantitativa de rendimiento no es posible porque este modelo no publica benchmarks. Frente al modelo base, la diferencia es la especializacion en el formato xLAM y la perdida de la torre de vision. Frente a alternativas de la misma categoria, la principal ventaja es el tamano reducido y la licencia LFM1.0, y la principal desventaja es la ausencia de evaluacion publica y el bajo numero de descargas, que sugiere poca validacion comunitaria.

## Limitaciones y advertencias

- No se han publicado benchmarks: no hay evidencia cuantitativa de la calidad del function calling frente al modelo base ni frente a alternativas.
- Modelo entrenado solo en ingles; el rendimiento en castellano u otros idiomas no esta validado y probablemente sea deficiente.
- Formato de prompt rigido y sin chat template: cualquier integracion debe respetar exactamente las etiquetas `<query>`, `<tools>` y `<answers>`; un formato distinto degradara la salida.
- Entrenamiento de una sola epoca sobre 60.000 ejemplos con QLoRA: riesgo de sobreajuste al estilo del dataset xLAM y de baja generalizacion a esquemas de herramientas muy distintos.
- Riesgo de alucinacion de nombres de funciones o parametros no presentes en el bloque `<tools>`; se recomienda validar la salida contra el esquema JSON antes de ejecutar cualquier llamada.
- Licencia LFM1.0: es necesario revisar sus terminos para uso comercial; la model card la etiqueta como `other` y enlaza a `LICENSE`, sin resumen de restricciones.
- Repositorio con muy poca traccion (14 descargas, 0 likes) y autor independiente: no hay garantia de mantenimiento ni de soporte.
- No se publican pesos GGUF ni variantes cuantizadas, lo que limita el despliegue en llama.cpp/Ollama sin conversion manual.
- El modelo es solo texto; no debe esperarse capacidad de vision aunque el base la tuviera.
- No hay informacion sobre sesgos; al derivar de un modelo base entrenado con datos web, es previsible que herede sesgos, pero no estan documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ermiaazarkhalili/LFM2.5-1.2B-Function-Calling-xLAM
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Licencia LFM1.0: https://huggingface.co/ermiaazarkhalili/LFM2.5-1.2B-Function-Calling-xLAM/blob/main/LICENSE
