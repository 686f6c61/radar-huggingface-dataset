# akshay-commits-code/qwen3-30b-a3b-10pct-voice-router

## Resumen

`akshay-commits-code/qwen3-30b-a3b-10pct-voice-router` es un artefacto derivado del modelo `Qwen/Qwen3-30B-A3B-Instruct-2507` de Alibaba, presentado como entrada al "10% challenge": comprimir un modelo MoE de 30B parametros hasta un 10% de su tamano original en fp16 sin reentrenar pesos. El autor reduce el modelo a 5.755 millones de parametros (6,04 GB en disco, un 9,892% del original) mediante poda selectiva de expertos y cuantizacion de baja precision, y lo especializa como enrutador de habilidades para un asistente de voz.

El modelo resuelve una tarea concreta: clasificar peticiones de usuario en siete habilidades (weather, email, transport, lists, calendar, home, news), con capacidad de aprender nuevas habilidades mediante un mecanismo de feedback en forma cerrada que modifica filas de la capa de salida sin reentrenar. La relevancia tecnica esta en la demostracion de que se puede conservar el 99,36% del rendimiento del modelo base en la tarea objetivo con solo el 9,9% del tamano, y en el protocolo de evaluacion con examenes bloqueados por hash y registrados antes de abrirlos.

Se distribuye bajo licencia Apache 2.0, en formato safetensors con pesos empaquetados en bits, y esta pensado para ejecutarse en GPU con al menos 28 GB de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3MoeForCausalLM) con expertos podados |
| Parametros totales | 5.755.129.856 |
| Parametros activos | no disponible (el modelo base activa ~3B; el artefacto no declara el dato) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos 3 bits asimetricos, atencion 6 bits, embeddings 5 bits, capa de salida 4 bits; normas y router en bf16; escala fp16 compartida por grupo de 128 pesos |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (codigos empaquetados en bits; reconstruible via `artifact.load()`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen3-30B-A3B-Instruct-2507`, un transformer de mezcla de expertos con 6.144 expertos enrutados. El autor aplica dos transformaciones sin ningun entrenamiento de pesos: primero, poda de expertos especifica de tarea, conservando 2.640 de los 6.144 expertos enrutados (entre 37 y 81 por capa, variable). La seleccion se hace ordenando expertos por su cuota de masa de enrutamiento top-8 sobre texto de calibracion no etiquetado (peticiones de tarea mas ingles generico); el router se recorta a los expertos conservados, de modo que es exactamente el router base restringido a ese subconjunto, y cada experto conservado es una rebanada byte-exacta del original.

La segunda transformacion es cuantizacion round-to-nearest pura, sin GPTQ ni optimizacion de pesos: expertos en 3 bits asimetricos, atencion en 6 bits, embeddings en 5 bits y capa de salida en 4 bits, con una escala fp16 por grupo de 128 pesos elegida de una rejilla fija por MSE de pesos. Normas y router permanecen en bf16. Los codigos se empaquetan en bits dentro de safetensors y `artifact.load()` reconstruye un `Qwen3MoeForCausalLM` estandar de Hugging Face con menos expertos por capa.

El mecanismo de feedback tampoco entrena pesos: `feedback.py` ejecuta el modelo sobre hasta 25 items anotados, ignora los que ya acierta, calcula en forma cerrada una direccion a partir de los estados ocultos finales de los items fallados (media menos media de la otra etiqueta ensenada, blanqueada por una inversa de covarianza de bajo rango almacenada) y suma un multiplo de esa direccion a la fila existente de la capa de salida del token de la etiqueta. Solo se reescriben esas filas, re-redondeadas a 4 bits, sin cambiar el tamano del fichero.

## Capacidades

- Clasificacion de peticiones en siete habilidades fijas: weather, email, transport, lists, calendar, home y news.
- Aprendizaje de nuevas habilidades mediante feedback anotado, siempre que el nombre de la habilidad sea un unico token (por ejemplo `recipe` o `music`).
- Procesamiento por lotes: una peticion por linea en `messages.txt`, una habilidad por linea de salida.
- Edicion en caliente del artefacto con `feedback.py` a partir de un JSONL de anotaciones (maximo 25 items por pasada).
- Generacion de texto y conversacion heredadas del modelo base, aunque el artefacto esta optimizado y evaluado para la tarea de enrutamiento.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Enrutamiento de intenciones en asistentes de voz: el modelo recibe la transcripcion de la peticion y devuelve la habilidad correspondiente, con un 98,56% de acierto minimo por etiqueta en el examen bloqueado, suficiente para despachar a backends especializados.
- Despliegue en infraestructura de gama media: con 6 GB de artefacto y 28 GB de VRAM requeridos, cabe en una L40S o A100-40GB, lo que permite servirlo en nodos de inferencia modestos frente a los 61 GB en fp16 del base.
- Personalizacion por dominio con feedback: un equipo puede ensenar habilidades nuevas con unas pocas decenas de ejemplos anotados; el examen reporta una mejora de 18,97% a 64,87% en el conjunto de ensenanza bloqueado tras 24 correcciones.
- Clasificacion de tickets o correos entrantes: reutilizando las etiquetas existentes (email, calendar, lists) como taxonomia base y anadiendo etiquetas nuevas de un solo token para categorias propias.
- Filtrado previo en pipelines de agentes: usar el enrutador como primera etapa de bajo coste que decide que subagente o herramienta invocar, reduciendo llamadas a modelos mayores.
- Investigacion sobre compresion de MoE: el repositorio incluye protocolo pre-registrado, historial git, examenes bloqueados por hash y resultados crudos, lo que lo convierte en material reproducible para estudiar poda de expertos y cuantizacion extrema.
- Experimentos de edicion de conocimiento sin reentrenamiento: el mecanismo de feedback en forma cerrada sirve como banco de pruebas para tecnicas de edicion de filas de salida en produccion.

## Benchmarks y rendimiento

| Regla | Requisito | Resultado |
|---|---|---|
| Tamano (todo lo enviado) | ≤ 10% de fp16 | 6.040.715.980 B = 9,892% |
| Fidelidad al base | ≥ 98% de items correctos del base conservados | 99,36% (2.775 / 2.793) |
| Acierto por etiqueta | ≥ 95% | Minimo 98,56% (weather); resto 98,73–100% |
| Examen | ≥ 2.000 items, ≥ 300 por etiqueta, ≥ 500 de fuente no usada | 2.910 items (MASSIVE 2.310, CLINC150 600) |
| Base con margen | Por encima del azar y por debajo del techo | Base 95,98% (azar 14,3%); modelo pequeno 96,12% |
| Feedback ensena | Ganancia clara en items bloqueados | 18,97% → 64,87% en 390 items; recipe 0% → 61,1%; CLINC recipe 0% → 54,7% |
| Controles | Etiquetas barajadas y vacias claramente peores | Barajadas 29,23%; vacias 18,97% |
| Nada se rompe | El examen sigue pasando tras feedback | 99,36% tras feedback; 1 respuesta cambiada de 2.910 |
| Tamano tras feedback | Sin cambios | 6.040.715.980 B |

Resultados adicionales por fuente: MASSIVE 99,42%, CLINC150 99,12%. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al menos 28 GB para inferencia, segun el autor (A100-40GB, L40S o similar).
- GPU recomendadas: A100-40GB, L40S; no se documenta compatibilidad con GPUs de consumo.
- No cabe en GPUs de consumo tipicas (RTX 4090 con 24 GB queda por debajo del minimo declarado).
- Dependencias: `torch==2.8.0`, `transformers==4.57.1`, `accelerate`, `safetensors`.
- Despliegue: descarga via `huggingface-cli` y ejecucion con `answer.py` y `feedback.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-30b-a3b-10pct-voice-router | 5.755 M (artefacto) | no disponible | Enrutamiento de habilidades | apache-2.0 | Hugging Face |
| Qwen/Qwen3-30B-A3B | 31B (MoE) | no disponible | Generacion de texto general | no disponible en la informacion | Hugging Face |
| Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8 | 30B (MoE, FP8) | no disponible | Codigo | no disponible en la informacion | Hugging Face |

La comparacion directa no es posible en terminos de rendimiento porque el artefacto solo publica metricas de su tarea de enrutamiento y los modelos base no reportan resultados en esa tarea en la informacion disponible.

## Limitaciones y advertencias

- El modelo esta especializado en enrutamiento de habilidades; su uso como generador de texto general no esta evaluado y probablemente degradado por la poda y la cuantizacion extrema.
- Solo soporta ingles segun la model card; no hay evaluacion multilingue.
- La poda de expertos es especifica de tarea: expertos relevantes para otras tareas pueden haberse eliminado, lo que limita la reutilizacion fuera del dominio de enrutamiento.
- El feedback solo admite nombres de habilidad de un unico token y un maximo de 25 items por pasada; la edicion modifica el artefacto en sitio y no es trivial de revertir.
- Riesgo de alucinacion y sesgos: no documentados por el autor; al derivar de Qwen3, hereda los sesgos del base sin evaluacion especifica.
- El autor reconoce un cambio de criterio de aceptacion (gate) antes de abrir el examen: el umbral pre-registrado era 99% global y 98% por etiqueta, y se rebajo a los umbrales del reto, hecho divulgado en la enmienda 2 del protocolo.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta; no hay validacion independiente de los resultados.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto incluye codigo y estadisticas de feedback cuyo comportamiento en produccion no esta evaluado fuera del examen del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akshay-commits-code/qwen3-30b-a3b-10pct-voice-router
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Qwen3-Coder-30B-A3B-Instruct-FP8: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct-FP8
- Carpeta de prueba del repositorio: https://huggingface.co/akshay-commits-code/qwen3-30b-a3b-10pct-voice-router/tree/main/proof
