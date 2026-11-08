# binbinao/qwen3.5-9b-shanghai-lora

## Resumen

El modelo `binbinao/qwen3.5-9b-shanghai-lora` es un adaptador LoRA de ajuste supervisado (SFT) construido sobre el modelo base `Qwen/Qwen3.5-9B`. Lo desarrolla el usuario binbinao y esta especializado en asistencia sobre vida local en Shanghai: tramites administrativos, politicas publicas, transporte, educacion, sanidad, pensiones, empleo, subsidios y cultura. El adaptador no modifica los pesos multimodales del modelo base: solo se entrena la torre de texto (`Qwen3_5ForCausalLM`), quedando fuera los pesos de vision y de prediccion multi-token (MTP).

El problema que resuelve es concreto: un modelo generalista de 9B no conoce con detalle los procedimientos y cifras de la administracion local de Shanghai, y tiende a responder de forma generica o extensa. Este LoRA se entrena con 955 preguntas y respuestas derivadas de una base factual de 202 hechos verificables, cada uno con URL oficial de origen, fecha de vigencia y notas sobre puntos volatiles. El resultado es un modelo que responde de forma mas breve (209 caracteres de media frente a 665 del base) y cita canales de tramitacion.

Es relevante porque demuestra un patron de ajuste muy eficiente en recursos: 86,6 millones de parametros entrenables (0,96 % del total) sobre una unica GPU NVIDIA L20 de 46 GB en poco menos de 22 minutos. Ademas, el autor publica una evaluacion honesta que muestra que el LoRA por si solo mejora poco en precision factual, pero que combinado con recuperacion BM25 alcanza un bigram F1 de 0,580 y un 77 % de acierto en el primer numero clave. El repositorio ocupa 0,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion lineal en capas seleccionadas (base Qwen3.5); adaptador LoRA sobre atencion, MLP y proyecciones de atencion lineal |
| Parametros totales | 9,65B en el modelo base (torre de texto 8,95B); adaptador LoRA con 86,6M parametros entrenables (0,96 %) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento uso `max_length` de 2048 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 (heredada del modelo base Qwen3.5-9B) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base en safetensors |
| Libreria | peft |
| Rango LoRA (r) | 32 |
| Alpha LoRA | 64 |
| Dropout LoRA | 0,05 |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-9B`, un transformer causal de la familia Qwen3.5 con 9,65B parametros totales, de los cuales 8,95B corresponden a la torre de texto. La familia Qwen3.5 incorpora atencion lineal en determinadas capas, y el LoRA entrena especificamente las proyecciones de esa atencion lineal (`in_proj_*` y `out_proj`) ademas de las capas de atencion y MLP convencionales, excluyendo explicitamente `lm_head`. Los pesos de vision y de prediccion multi-token (MTP) no participan en el entrenamiento, de modo que la especializacion es puramente textual.

El entrenamiento consistio en un SFT con PEFT de 3 epocas y 546 pasos, con batch size 4 y acumulacion de gradiente 2, learning rate 1e-4 con scheduler coseno, precision bf16 y longitud maxima de 2048 tokens. El conjunto de datos combina 955 preguntas y respuestas sobre Shanghai (generadas a partir de la base factual, con formulaciones coloquiales y algunos ejemplos multi-turno) con 500 ejemplos de `shibing624/alpaca-zh` para mitigar el olvido catastrofico, sumando 1455 ejemplos. La base factual contiene 202 hechos organizados en 10 clusters tematicos, cada uno con URL de fuente oficial, fecha de vigencia y notas sobre volatilidad. El conjunto de validacion son 62 preguntas derivadas de un 15 % de hechos completamente reservados, sin solapamiento con las preguntas de entrenamiento. El renderizado de conversacion usa `enable_thinking=False`, es decir, el modelo responde directamente sin emitir cadena de pensamiento, y la perdida se calcula unicamente sobre los tokens del asistente. Todo el entrenamiento se ejecuto en una sola GPU NVIDIA L20 de 46 GB, con un pico de 23,9 GiB de VRAM y una duracion de 21 minutos y 56 segundos.

## Capacidades

- Generacion de texto conversacional en chino, orientada a preguntas y respuestas sobre vida local en Shanghai.
- Respuesta sobre tramites y politicas en 10 ambitos: seguridad social y seguro medico, fondo de vivienda, transporte, educacion y admision escolar, sanidad, atencion a mayores, tramites administrativos, vida cotidiana y emergencias, empleo y subsidios, y cultura y ocio local.
- Cita de canales de tramitacion, materiales y pasos en las respuestas, segun el prompt de sistema recomendado.
- Modo de respuesta directa sin cadena de pensamiento (`enable_thinking=False`), lo que reduce la latencia y la longitud de salida.
- Soporte de conversaciones multi-turno (parte del conjunto de entrenamiento incluye dialogos de varios turnos).
- Capacidad de operar en modo aumentado por recuperacion: el autor recomienda inyectar contexto recuperado por BM25 desde la base factual, con lo que el rendimiento mejora de forma notable.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni otras capacidades especiales en la informacion proporcionada.

## Casos de uso

- Asistente ciudadano sobre tramites de Shanghai: el modelo responde a preguntas sobre requisitos, materiales y pasos para procedimientos administrativos, citando el canal oficial correspondiente. Es adecuado porque el entrenamiento se genero directamente a partir de hechos con URL oficial.
- Consulta de politica sanitaria y seguro medico: preguntas sobre umbrales de reembolso, copagos y categorias de beneficiarios. El autor advierte que las cifras deben verificarse contra la fuente oficial, por lo que el modelo encaja mejor como primera capa de orientacion que como autoridad final.
- Informacion sobre fondo de vivienda y vivienda publica: orientacion sobre aportaciones, extracciones y solicitudes. La base factual cubre este cluster con fuentes de organismos oficiales.
- Orientacion educativa y de admision escolar: consultas sobre calendarios, distritos y requisitos. Util para padres que necesitan una primera aproximacion antes de acudir al canal oficial.
- Atencion a personas mayores: preguntas sobre pensiones, servicios de asistencia y tramites adaptados. El modelo esta entrenado en un cluster especifico de atencion a mayores.
- Informacion de transporte y movilidad urbana: rutas, abonos y normativa de transporte publico en Shanghai.
- Orientacion laboral y subsidios: consultas sobre prestaciones por desempleo, subsidios y programas de empleo.
- Turismo y ocio local: recomendaciones y datos practicos sobre atracciones, eventos y servicios de la ciudad.
- Despliegue en modo RAG como backend de un chatbot municipal: combinando el adaptador con recuperacion BM25 sobre la base de 202 hechos, se obtiene un bigram F1 de 0,580 y un 77 % de acierto en el primer numero clave, lo que lo hace viable como componente de un sistema de informacion ciudadana.
- Prototipado rapido de asistentes locales en otros dominios: el patron de entrenamiento (base factual pequena y verificable + SFT LoRA corto en una sola GPU) es replicable para otras ciudades o administraciones.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de validacion de 62 preguntas, en modo cerrado (sin inyeccion de contexto):

| Modelo | bigram F1 | Recuperacion de numeros | Acierto del primer numero clave | Longitud media de respuesta |
|---|---|---|---|---|
| Qwen3.5-9B base | 0,107 | 0,323 | 41 % | 665 caracteres |
| Este LoRA (3 epocas) | 0,140 | 0,286 | 52 % | 209 caracteres |

Evaluacion con recuperacion aumentada (BM25, top-1 sobre los 202 hechos inyectado en el contexto):

| Esquema | bigram F1 | Recuperacion de numeros | Acierto del primer numero clave |
|---|---|---|---|
| LoRA + RAG | 0,580 | 0,765 | 77 % |

Nota metodologica del autor: la metrica de recuperacion de numeros contabiliza todos los numeros de la respuesta de referencia, por lo que penaliza las respuestas cortas; el acierto del primer numero clave refleja mejor si la respuesta va al grano. El autor no publica comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA por si solo ocupa 0,4 GB, pero requiere cargar el modelo base Qwen3.5-9B completo para inferencia.
- Entrenamiento: una unica GPU NVIDIA L20 de 46 GB fue suficiente, con un pico de 23,9 GiB de VRAM y 21 minutos y 56 segundos para 3 epocas.
- Inferencia en bf16: se estima en torno a 18-20 GB de VRAM para el modelo base de 9,65B parametros, mas el overhead de contexto y cache KV.
- Inferencia cuantizada: no se documentan cuantizaciones especificas para este adaptador; al depender del modelo base, las opciones de cuantizacion serian las disponibles para Qwen3.5-9B (no confirmadas en la informacion proporcionada).
- GPU consumer: con cuantizacion de 4 bits, un modelo de 9B suele caber en GPUs de 8-12 GB, pero no hay confirmacion de que este adaptador se haya probado en ese regimen.
- Opciones de despliegue: la model card proporciona ejemplo con Hugging Face Transformers y PEFT. Una busqueda web externa menciona despliegue de Qwen3.5-9B con vLLM, SGLang, KTransformers y Ollama, aunque no se confirma compatibilidad especifica del adaptador con esas herramientas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| binbinao/qwen3.5-9b-shanghai-lora | 9,65B base + 86,6M LoRA | no disponible (entrenado a 2048) | Vida local en Shanghai (zh) | Apache-2.0 | Hugging Face |
| deanoshuang/qwen3.5-9b-agent-sft-v5ep2-lora | 9,65B base + LoRA | no disponible | Agentes (SFT) | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9,65B | no disponible | Generalista multimodal | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada. La comparativa se limita a arquitectura, licencia y especializacion.

## Limitaciones y advertencias

- El propio autor reconoce que en modo cerrado el modelo puede confundir conocimientos vecinos dentro del mismo cluster, por ejemplo responder sobre reembolso ambulatorio cuando se pregunta por umbral de hospitalizacion.
- Las cifras, proporciones y plazos de las politicas deben verificarse siempre contra la URL oficial de origen; el modelo no es una fuente autoritativa.
- Cada hecho se entrena como un parrafo completo, por lo que el modelo tiende a reproducir el texto entero en lugar de recortarlo segun la pregunta.
- Un 15 % de los hechos quedo fuera del entrenamiento; ante esos temas el modelo solo puede ofrecer un procedimiento generico.
- La base factual esta cerrada a noviembre de 2026 y las politicas locales cambian con frecuencia.
- El modelo solo esta entrenado en chino; no se documenta soporte de otros idiomas.
- El autor recomienda explicitamente desplegarlo con recuperacion (RAG) y validacion de numeros, no en modo cerrado.
- Existe riesgo de alucinacion en detalles concretos, especialmente cifras y plazos, como muestran los propios benchmarks del autor.
- El contenido de la base factual se recopilo de informacion publica de organismos de Shanghai; el proyecto declara no tener vinculacion con las administraciones correspondientes.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen3.5-9B, por lo que conviene revisar las condiciones de este ultimo.
- El repositorio no tiene descargas ni likes registrados en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/binbinao/qwen3.5-9b-shanghai-lora
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset auxiliar alpaca-zh: https://huggingface.co/datasets/shibing624/alpaca-zh
- LoRA comparable de agentes: https://huggingface.co/deanoshuang/qwen3.5-9b-agent-sft-v5ep2-lora
- Tutorial de despliegue local de Qwen3.5-9B (externo): https://aiindigo.com/tutorials/getting-started-with-qwen3-5-9b-local-multimodal-ai
