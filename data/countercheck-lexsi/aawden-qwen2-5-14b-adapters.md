# CounterCheck-lexsi/aawden-qwen2.5-14b-adapters

## Resumen

Aawden-qwen2.5-14b-adapters es una coleccion de adaptadores LoRA entrenados sobre Qwen/Qwen2.5-14B-Instruct, desarrollada por CounterCheck-lexsi en el marco del hackathon Lexsi AI Safety (Track 2). El objetivo concreto del proyecto es medir y corregir la "deferencia" del modelo: el fenomeno por el que un revisor afirma que un fragmento de codigo es seguro cuando no lo es, y el modelo acaba dando la razon al revisor en lugar de analizar el codigo. Los adaptadores entrenan el veredicto para que siga al codigo con independencia de lo que diga el revisor.

El repositorio no contiene un modelo unico, sino ocho adaptadores independientes en carpetas separadas: tres semillas del adaptador anti-deferencia (s17, s29, s43), tres variantes escaladas del adaptador s17 (al 25%, 50% y 75% de fuerza), un control de tarea sin linea de revisor y un adaptador de anclaje a respuesta previa. Esta estructura esta pensada para que las afirmaciones del articulo asociado sean verificables, incluyendo los adaptadores que fallaron.

Es un artefacto de investigacion en seguridad de IA, no una herramienta de produccion. El modelo base Qwen2.5-14B-Instruct aporta la arquitectura transformer densa de 14 mil millones de parametros y una ventana de contexto de 32 768 tokens; los adaptadores anaden un ajuste fino de bajo rango (rank 16) sobre las siete proyecciones del transformer. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-14B-Instruct) con adaptadores LoRA sobre las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj |
| Parametros totales | 14 700 millones (modelo base); los adaptadores LoRA son un subconjunto de bajo rango no cuantificado en la informacion disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el ejemplo de carga usa bfloat16 |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el modelo base se distribuye en safetensors |
| Rank LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout LoRA | 0.05 |
| Tamano del repositorio | 2,2 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo decoder-only con 14 700 millones de parametros. Los adaptadores son LoRA de rank 16 y alpha 32 con dropout 0.05, aplicados a las siete proyecciones (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El entrenamiento usa una tasa de aprendizaje de 1e-4, batch de 1 con acumulacion de gradientes de 8 y 2 epochs sobre 804 filas (268 casos de revision de seguridad mostrados de tres maneras: sin revisor, con un revisor correcto y con un revisor incorrecto, todos con el mismo objetivo correcto). Los controles de solo tarea usan las mismas 268 filas durante 6 epochs para igualar los 201 pasos de los adaptadores anti-deferencia.

Los datos de entrenamiento provienen de 134 familias que nunca aparecen en el conjunto de prueba, lo que evita fuga de datos entre entrenamiento y evaluacion. Las variantes escaladas (-x0.25, -x0.5, -x0.75) no se entrenaron: son el adaptador s17 con las matrices B de LoRA multiplicadas por el factor correspondiente, registrado en scale.json. Cada adaptador incluye train_meta.json con los ajustes exactos, recuentos de filas, hashes de datos y tiempo de ejecucion; las variantes escaladas no tienen este fichero. El adaptador de respuesta previa (qwen14b-prior-s17) anade filas donde se muestra la respuesta anterior del propio modelo para probar el anclaje, y la palabra "pushback" nunca se entreno.

## Capacidades

- Revision de seguridad de codigo Python en ingles, centrada en inyeccion SQL y control de acceso, sobre ficheros con plantillas.
- Emision de un veredicto en formato JSON tras el prefijo `{"verdict":"`, que es el formato sobre el que se entreno y midio.
- Resistencia a la presion de un revisor: el veredicto sigue al codigo aunque el revisor afirme lo contrario, incluido el caso en que el revisor acierta.
- Generacion de texto general heredada del modelo base Qwen2.5-14B-Instruct (razonamiento, codigo, matematicas, multilingue en el base), aunque los adaptadores solo se validaron en la tarea de revision de seguridad.
- No se declara soporte de tool calling, function calling ni razonamiento multi-paso especifico en los adaptadores.
- No se declara soporte de vision ni audio.

## Casos de uso

- Evaluacion de robustez frente a deferencia: usar los adaptadores como condicion experimental en un banco de pruebas que mida si un modelo cambia su veredicto cuando un revisor le contradice, comparando contra el modelo base sin adaptador.
- Investigacion en seguridad de IA: reproducir el protocolo del hackathon (reglas de exito fijadas de antemano en docs/FIX_PROTOCOL.md) para validar o refutar los resultados publicados con las tres semillas.
- Analisis del compromiso entre fuerza del adaptador y utilidad: las variantes al 25%, 50% y 75% permiten trazar la curva de trade-off entre resistencia al revisor y calidad de la revision, sin reentrenar.
- Control experimental de tarea: el adaptador neutralonly-s17 sirve para separar la mejora en la tarea de la resistencia aprendida al revisor en un diseno experimental con grupo de control.
- Estudio de anclaje a respuestas previas: el adaptador prior-s17 permite probar si el modelo se deja arrastrar por su propia respuesta anterior en una conversacion multi-turno.
- Formacion y docencia: ilustrar en un curso de seguridad de IA como se construye un conjunto de datos con revisor correcto e incorrecto y como se evalua la deferencia con un protocolo preregistrado.
- Auditoria de pipelines de revision de codigo: usar los veredictos JSON como senal auxiliar en un sistema de revision automatizada, siempre con supervision humana y sin tratar el adaptador como herramienta de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a runs/fix/round2-summary.md en el repositorio de GitHub para todos los numeros de estos adaptadores, pero los valores concretos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 14 700 millones de parametros en bfloat16 requiere aproximadamente 28 GB solo para los pesos, mas memoria para el contexto y las activaciones; en cuantizacion de 8 bits baja a unos 15 GB y en 4 bits a unos 8-9 GB, aunque los tipos de cuantizacion no se detallan en la informacion disponible.
- GPU recomendadas: A100 de 40 u 80 GB, H100 o L40S para inferencia en bfloat16 sin cuantizar; en cuantizacion de 4 u 8 bits puede caber en una RTX 4090 de 24 GB o en una RTX 3090.
- Cabe en GPU de consumo: si, con cuantizacion agresiva (4 bits) en GPUs de 24 GB; en bfloat16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: carga mediante transformers y peft (ejemplo oficial de la model card); al ser un adaptador PEFT sobre un modelo estandar, es compatible con servidores que soporten LoRA, como vLLM con soporte de adaptadores, aunque no se confirma en la informacion disponible. llama.cpp y Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF, procedimiento no documentado en la model card.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aawden-qwen2.5-14b-adapters | 14 700 M (base) + LoRA rank 16 | 32 768 | Adaptador anti-deferencia para revision de seguridad | Apache 2.0 | Hugging Face (adaptadores PEFT) |
| Qwen2.5-14B-Instruct | 14 700 M | 32 768 | Modelo base de proposito general | Apache 2.0 | Hugging Face |
| Adaptadores de seguridad comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre otros adaptadores de seguridad publicos directamente comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: no es una herramienta de seguridad de produccion y no deberia desplegarse como filtro automatico de codigo sin supervision humana.
- Alcance limitado: revision de seguridad de Python en ingles, principalmente inyeccion SQL y control de acceso, sobre ficheros con plantillas; no cubre otros lenguajes, otros tipos de vulnerabilidad ni codigo sin plantillas.
- El adaptador ignora a todos los revisores, incluidos los correctos: no aprende a decidir en que revisor confiar, solo a no dejarse influir por ninguno.
- Etiquetas escritas por un unico autor y sin revision independiente, lo que introduce sesgo del anotador y riesgo de errores sistematicos en el objetivo de entrenamiento.
- Riesgo de alucinacion heredado del modelo base, especialmente en veredictos de seguridad donde un falso negativo tiene consecuencias graves.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta validado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5-14B-Instruct se heredan sus terminos; conviene revisar la licencia del modelo base antes de un uso comercial.
- Los adaptadores escalados no tienen train_meta.json y se generaron por post-procesado de matrices, no por entrenamiento, lo que limita su trazabilidad experimental.
- El repositorio declara 0 descargas y 0 likes, sin evidencia de uso o validacion por terceros en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/CounterCheck-lexsi/aawden-qwen2.5-14b-adapters
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Articulo del proyecto: https://rishyanthreddy-aawden-article.static.hf.space
- Codigo y protocolo: https://github.com/Aya-Jmd/Aawden
- Protocolo de reglas de exito: https://github.com/Aya-Jmd/Aawden/blob/master/docs/FIX_PROTOCOL.md
- Resumen de resultados: https://github.com/Aya-Jmd/Aawden/blob/master/runs/fix/round2-summary.md
