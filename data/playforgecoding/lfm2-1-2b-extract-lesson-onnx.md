# playforgecoding/LFM2-1.2B-Extract-lesson-ONNX

## Resumen

LFM2-1.2B-Extract-lesson-ONNX es la exportacion a ONNX de playforgecoding/LFM2-1.2B-Extract-lesson, un ajuste fino con LoRA del modelo LiquidAI/LFM2-1.2B-Extract orientado a una tarea muy concreta: convertir una seccion de un documento de leccion de ortografia, tal como la escribiria una persona o tal como la exporta a texto plano la aplicacion Spelling Creator, en el JSON estructurado de esa leccion (parrafos copiados literalmente, palabras de ortografia y preguntas con sus respuestas y pasos de resolucion).

El modelo lo publica el usuario playforgecoding, no Liquid AI, y esta pensado para Spelling Creator, un constructor de lecciones para Spelling to Communicate (S2C), una metodologia en la que las lecciones se leen en voz alta a personas no hablantes que deletrean. La motivacion declarada es que el modelo Extract original fallaba en esta tarea: partia parrafos en frases, inventaba respuestas para preguntas abiertas y abandonaba con frecuencia el esquema JSON solicitado. El ajuste esta disenado explicitamente para copiar en lugar de inventar.

Tecnicamente hereda la arquitectura LFM2 de Liquid AI (hibrida, con bloques convolucionales y de atencion) con aproximadamente 1.200 millones de parametros, licencia LFM Open License v1.0 y un unico idioma declarado, el ingles. El repositorio ocupa 4,7 GB e incluye tres grafos ONNX (q4f16, int8 y q4) junto con la configuracion necesaria para su uso directo con Transformers.js en WebGPU o en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (Liquid Foundation Model 2), hibrida con bloques convolucionales y de atencion; heredada de LiquidAI/LFM2-1.2B-Extract |
| Parametros totales | 1,2 B (segun denominacion LFM2-1.2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento del ajuste se realizo con contexto de 4096 tokens |
| Tipos de cuantizacion | q4f16 (WebGPU), int8 (CPU/wasm), q4 (CPU) |
| Idiomas soportados | Ingles (unico idioma declarado en la model card de este ajuste). El modelo base LFM2-1.2B-Extract cubre nueve idiomas segun fuentes externas |
| Licencia | other / lfm1.0 (LFM Open License v1.0), fichero LICENSE en el repositorio |
| Formato de pesos | ONNX: onnx/model_q4f16.onnx, onnx/model_int8.onnx, onnx/model_q4.onnx; plantilla de chat en tokenizer_config.json y bloque transformers.js_config |

## Arquitectura y entrenamiento

La base es LFM2-1.2B-Extract, un modelo de 1,2 B de parametros de Liquid AI especializado en extraer datos estructurados (JSON, XML, YAML) de documentos no estructurados, con soporte de esquemas anidados y multiplos campos. La familia LFM2 emplea una arquitectura hibrida que combina bloques convolucionales con capas de atencion, lo que la hace adecuada para inferencia en el borde. El export ONNX se genero con onnxruntime-genai (`python -m onnxruntime_genai.models.builder -i merged -p int4 -e webgpu` y el equivalente para CPU) y despues se reordeno con el script `relayout-onnx.py` del repositorio de Spelling Creator: renombra las caches de convolucion a `past_conv.N`, fija la dimension de cabeza de la cache KV, mueve la plantilla de chat a `tokenizer_config.json`, anade el bloque `transformers.js_config` y coloca los grafos bajo `onnx/`, replicando la disposicion de los ficheros de onnx-community para LFM2.

El ajuste fino es un LoRA (rango 16, learning rate 2e-4, 3 epocas, contexto de 4096 tokens) sobre 412 ejemplos construidos a partir de las 13 lecciones publicadas en el hub de Spelling Creator. Cada leccion se renderizo en 7 disposiciones de documento distintas (la exportacion a Word de la aplicacion leida como texto plano y seis estilos tecleados a mano) y se corto en secciones, cada una emparejada con el JSON de su leccion. Se reservaron 84 secciones de las dos lecciones mas recientes como conjunto de validacion. El generador de datos y el cuaderno de entrenamiento estan en el repositorio bajo `packages/core/scripts/extract-eval/`. No se documentan en la informacion disponible fases de RLHF o DPO ni el volumen total de tokens de preentrenamiento de la base.

## Capacidades

- Extraccion de un esquema JSON fijo desde texto plano: produce un objeto con los campos `name`, `paragraphs`, `spellingWords` y `questions[{prompt, type, answers, steps}]`.
- Copia literal del texto de los parrafos, sin resumir ni reescribir, que era el fallo principal del modelo base en esta tarea.
- Extraccion de listas de palabras de ortografia a partir del documento de la leccion.
- Identificacion de enunciados de preguntas, con sus respuestas impresas y sus pasos de resolucion.
- Evita la invencion de respuestas en preguntas abiertas (1 caso de respuesta inventada sobre la muestra evaluada de 20 secciones).
- Ejecucion en navegador con Transformers.js sobre WebGPU, y en CPU mediante los grafos int8 y q4.
- Generacion de texto conversacional generica: hereda la capacidad base de LFM2-1.2B-Extract, aunque el ajuste la especializa fuertemente.
- No dispone de soporte declarado de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion proporcionada.
- La decodificacion recomendada es greedy (`do_sample: false`), con `max_new_tokens: 1500` en el ejemplo de uso.

## Casos de uso

- Importacion de documentos en Spelling Creator: el modelo recibe una seccion de una leccion (texto tecleado o exportacion a Word leida como texto plano) y devuelve el JSON de la seccion. Es el caso para el que se entreno y el unico escenario con validacion publicada.
- Extension de navegador o aplicacion web educativa sin backend GPU: con `dtype: "q4f16"` y `device: "webgpu"` el modelo corre integramente en el cliente, de modo que el material de la leccion no sale del dispositivo del usuario.
- Digitalizacion por lotes de material didactico: convertir colecciones de documentos de lecciones en JSON estructurado para su carga en una base de datos o en un CMS educativo.
- Preprocesado de corpus para pipelines de datos: normalizar documentos heterogeneos (7 disposiciones distintas en el conjunto de entrenamiento) a un esquema unico antes de alimentar otras herramientas.
- Herramienta de linea de comandos en Node: usando el grafo int8 con el backend wasm, se puede integrar en scripts de conversion masiva sin dependencia de GPU.
- Complemento de un parser basado en reglas: el propio autor indica que el parser de la aplicacion supera al modelo en disposiciones regulares; el modelo se reserva para los documentos que el parser no puede leer, actuando como fallback.
- Evaluacion comparativa de extraccion estructurada en el borde: sirve como referencia de hasta donde llega un modelo de 1,2 B ajustado frente a un modelo grande generalista en una tarea de esquema fijo.
- Prototipado rapido de esquemas de extraccion con coste de inferencia minimo antes de decidir si se necesita un modelo mayor.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la evaluacion de extraccion del propio autor, sobre una muestra de 20 secciones reservadas, repartidas entre las dos lecciones de validacion y todas las disposiciones.

| Metrica | Valor |
|---|---:|
| Secciones parseadas como JSON valido | 95% |
| Palabras de ortografia exactas | 85% |
| Enunciados de pregunta encontrados | 95% |
| Respuestas exactas | 98% |
| Respuestas inventadas en preguntas abiertas | 1 |

Como referencia, el modelo Extract original acertaba aproximadamente la mitad de las respuestas en un documento tecleado limpio y alrededor de una cuarta parte en la exportacion a Word. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,7-0,9 GB con q4f16, 1,2-1,4 GB con int8 y 0,7 GB con q4 (estimaciones derivadas de los 1,2 B de parametros; el repositorio completo ocupa 4,7 GB por incluir los tres grafos).
- Overhead adicional de cache KV y activaciones: del orden de 0,5-1 GB segun la longitud de la secuencia, dado que el ejemplo de uso genera hasta 1500 tokens nuevos.
- Cabe con holgura en cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo GTX 1650 4 GB, RTX 3060 12 GB, RTX 4090). Tambien es viable en GPUs integradas y en CPU.
- Aceleradores de datacenter (A100, H100) no aportan ventaja practica: el modelo esta dimensionado para el borde.
- Opciones de despliegue: Transformers.js con backend WebGPU o wasm, y ONNX Runtime GenAI. El repositorio no incluye pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion no cubierta por la informacion disponible.
- Navegador: el grafo q4f16 esta verificado en Chromium copiando fielmente una seccion real. El grafo q4 no es fiel para este checkpoint (parafrasea en lugar de copiar) y se mantiene solo como referencia.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion es greedy y la salida puede alcanzar los 1500 tokens, lo que condiciona el tiempo de respuesta en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| LFM2-1.2B-Extract-lesson-ONNX (este) | 1,2 B | No disponible (entrenado a 4096 tokens) | Ingles | lfm1.0 | ONNX para Transformers.js | Ajustado a documentos de lecciones de ortografia; copia literal en lugar de inventar |
| LiquidAI/LFM2-1.2B-Extract | 1,2 B | No disponible | Nueve idiomas (fuente externa) | lfm1.0 | Pesos PyTorch, ONNX de la comunidad, GGUF de terceros | Extraccion generica de JSON/XML/YAML; falla en el caso concreto de este ajuste |
| onnx-community/LFM2-1.2B-Extract-ONNX | 1,2 B | No disponible | Nueve idiomas (fuente externa) | lfm1.0 | ONNX para Transformers.js | Misma conversion de referencia, sin ajuste para Spelling Creator |
| LiquidAI/LFM2-1.2B | 1,2 B | No disponible | No disponible | lfm1.0 | Pesos PyTorch | Modelo base generalista; Liquid AI ha publicado despues LFM2.5-1.2B-Instruct |
| Generalistas grandes (por ejemplo Gemma 3 27B) | 27 B | No disponible | Multiples | Segun modelo | Pesos PyTorch | Fuentes externas indican que LFM2-1.2B-Extract iguala o supera a generalistas mucho mayores en calidad de extraccion |

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para secciones de lecciones de Spelling Creator; fuera de ese dominio no hay garantia de comportamiento correcto ni de fidelidad al esquema.
- El propio autor advierte de que el tipo de pregunta no es fiable en este modelo ni en ningun modelo pequeno; Spelling Creator deduce el tipo a partir de las respuestas y la formulacion, no del campo generado.
- Riesgo de alucinacion residual: en la muestra evaluada se contabilizo una respuesta inventada en una pregunta abierta, el fallo critico que el ajuste pretende evitar.
- Fidelidad dependiente de la cuantizacion: el grafo q4 parafrasea en lugar de copiar, por lo que solo q4f16 y, con reservas, int8 son aptos para produccion.
- Cobertura de validacion limitada: 20 secciones de 84 reservadas, procedentes de dos lecciones y siete disposiciones; no hay evaluacion con documentos de terceros.
- El parser basado en reglas de la aplicacion supera al modelo en todas las disposiciones regulares, por lo que usarlo como sustituto general empeora los resultados.
- Idioma unico declarado (ingles); no hay soporte multilingue en este ajuste aunque la base cubra mas idiomas.
- Licencia LFM Open License v1.0, etiquetada como "other": no es Apache 2.0 ni MIT. La informacion proporcionada no detalla los terminos completos ni las condiciones para uso comercial, por lo que hay que revisar el fichero LICENSE antes de desplegarlo en produccion.
- Trazabilidad y soporte: el publicador es un usuario individual y el repositorio no tiene descargas ni likes en el momento de la consulta, por lo que la validacion externa es practicamente nula.
- Uso etico: la aplicacion objetivo es asistir a personas no hablantes en un contexto terapeutico y educativo; cualquier despliegue real deberia contar con supervision profesional y verificacion humana de las lecciones generadas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/playforgecoding/LFM2-1.2B-Extract-lesson-ONNX
- Modelo base del ajuste (PyTorch): https://huggingface.co/playforgecoding/LFM2-1.2B-Extract-lesson
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2-1.2B-Extract
- Conversion ONNX de la comunidad: https://huggingface.co/onnx-community/LFM2-1.2B-Extract-ONNX
- Modelo base de la familia: https://huggingface.co/LiquidAI/LFM2-1.2B
- Documentacion de Liquid AI sobre LFM2-1.2B-Extract: https://docs.liquid.ai/lfm/models/lfm2-1.2b-extract
- Transformers.js: https://huggingface.co/docs/transformers.js
- Repositorio de Spelling Creator: https://github.com/Spelling-Creator/spelling-creator
- Analisis del experimento de importacion de documentos: https://spellingcreator.org/docs/monorepo/document-import-experiment
- Ficha de LFM2-1.2B-Extract en slm.expert: https://slm.expert/models/lfm2-1-2b-extract/
- Ficha de LFM2-1.2B-Extract en GGUF (terceros): https://local-ai-zone.github.io/models/lfm2-1-2b-extract.html
