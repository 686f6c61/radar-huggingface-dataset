# Foreverstorm/radiochat-laya-multilingual-onnx

## Resumen

RadioChat Laya Multilingual ONNX es una exportación cuantizada a ONNX del checkpoint multilingüe de Laya, un modelo de decisión no autorregresivo desarrollado por Convai Innovations que responde preguntas tipadas (elección entre opciones, puntuación y sí/no) en una única pasada hacia delante. El modelo original parte de un encoder mmBERT-base y añade una cabeza de decisión; esta versión, publicada por el usuario Foreverstorm, empaqueta ambos grafos en dos ficheros ONNX (encoder.onnx de 250 MB y head.onnx de 28 MB) con cuantización de sólo pesos.

La relevancia de esta ficha no está en la generación de texto, sino en el despliegue: se trata de un clasificador de moderación pensado para ejecutarse íntegramente en el navegador mediante onnxruntime-web (WebAssembly), de modo que la aplicación RadioChat puede moderar mensajes de chat en el propio dispositivo del usuario sin enviar el contenido a un servidor. Frente a la versión en precisión completa (1,17 GB), esta exportación ocupa 250 MB manteniendo 158 de 160 decisiones idénticas a las del modelo original en una evaluación con 80 mensajes etiquetados a mano.

El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, un tamaño de 0,3 GB y licencia Apache-2.0, la misma que el modelo base. No se han declarado idiomas soportados ni longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer mmBERT-base mas cabeza de decision; modelo de decision no autorregresivo (no generativo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits en pesos MatMul (simetrica, bloque 32), tabla de vocabulario en 4 bits (GatherBlockQuantized, bloque 32) y cabeza de decision en 8 bits; se documento tambien una variante de capas en 4 bits (195 MB) |
| Idiomas soportados | no disponible (el modelo base, convaiinnovations/laya-multilingual, es multilingue) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder.onnx, head.onnx), guardados sin datos externos; incluye tokenizer.json y rl_agent_config.json |
| Tamano del repositorio | 0,3 GB |
| Tamano de los ficheros | encoder.onnx 250 MB; head.onnx 28 MB |
| Modelo base | convaiinnovations/laya-multilingual, revision e4e9ddf21a7b1903b7acffd8814ad4307bf63a67 |
| Libreria | ONNX (onnxruntime-web) |
| Herramienta de cuantizacion | ONNX Runtime 1.30, MatMulNBitsQuantizer |
| Fecha de publicacion | 2026-09-28 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El modelo base es Laya, descrito por sus autores como un modelo de decision no autorregresivo: en lugar de generar texto token a token, recibe una pregunta tipada (eleccion entre opciones, puntuacion o si/no) y devuelve la respuesta en una sola pasada hacia delante. La arquitectura combina un encoder mmBERT-base multilingue con una cabeza de decision, y se exporta en dos grafos ONNX independientes para que el cargador de navegador pueda descargar un fichero por grafo.

Esta publicacion no entrena nada: es una conversion de pesos. El proceso documentado por el autor consiste en ejecutar `laya-ts/scripts/export_onnx.py --repo convaiinnovations/laya-multilingual` (sobre el commit `9d95567` del repositorio Laya), verificando que las salidas ONNX coinciden con PyTorch con una diferencia maxima de logits de aproximadamente 2e-6, y despues aplicar `MatMulNBitsQuantizer` de ONNX Runtime 1.30 en modo simetrico con bloque 32. Los pesos de las MatMul quedan en 8 bits, la tabla de embeddings de tokens (operacion Gather) en 4 bits y las MatMul de la cabeza tambien en 8 bits. No se dispone de informacion sobre el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO en el modelo original dentro de la informacion proporcionada.

## Capacidades

- Clasificacion de decisiones tipadas: respuesta a preguntas de eleccion multiple, puntuacion y si/no en una sola pasada, sin decodificacion autorregresiva.
- Moderacion de contenido: el caso de uso declarado es detectar mensajes ofensivos y spam en chats, con dos decisiones evaluadas por mensaje en la validacion del autor.
- Ejecucion local en navegador: inferencia via onnxruntime-web sobre WebAssembly, sin necesidad de servidor ni conexion de red para clasificar.
- Multilingue: hereda el caracter multilingue del checkpoint base, aunque el repositorio no declara la lista concreta de idiomas.
- Integracion ligera: el modelo se carga con el script TypeScript `laya-ts`, que consume `tokenizer.json` y `rl_agent_config.json` sin modificaciones.
- No soporta generacion de texto libre, tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: no es un modelo generativo ni un LLM de chat.

## Casos de uso

- Moderacion de chat en el propio dispositivo: RadioChat lo usa para clasificar mensajes de chat localmente, de forma que el contenido potencialmente sensible no sale del navegador del usuario. Es adecuado porque el modelo completo ocupa 278 MB en dos ficheros ONNX y se ejecuta sobre WebAssembly.
- Aplicaciones web con requisitos de privacidad: clientes de mensajeria, foros o comunidades que quieran filtrar contenido sin enviar conversaciones a una API externa, reduciendo la exposicion de datos personales.
- Pre-filtro en pipelines de moderacion a escala: usar la version en navegador o en el edge como primera etapa barata y reservar modelos generativos mas grandes y costosos para los casos dudosos.
- Extensiones de navegador y clientes de escritorio: integracion en Electron o Tauri mediante ONNX Runtime, aplicando el clasificador como capa de seguridad en la interfaz de chat.
- Investigacion sobre cuantizacion: el repositorio publica mediciones de acuerdo y exactitud para las variantes de 8 y 4 bits, lo que permite estudiar la degradacion inducida por la cuantizacion de solo pesos en una tarea de clasificacion real.
- Herramientas de anotacion asistida: clasificacion rapida de mensajes con etiquetas discretas en flujos de etiquetado humano, donde la latencia de un modelo no autorregresivo es menor que la de un modelo generativo.
- Entornos con conectividad limitada o sin red: escenarios offline donde no se puede depender de un servicio de inferencia remoto y basta con una decision categorica.
- Filtrado en aplicaciones infantiles o educativas: bloqueo local de mensajes ofensivos o spam antes de mostrarlos en pantalla.

## Benchmarks y rendimiento

La model card publica una evaluacion comparativa entre variantes, medida con `laya-ts` sobre onnxruntime-web (WebAssembly) con 80 mensajes de chat etiquetados a mano y 2 decisiones de moderacion por mensaje (ofensivo y spam), lo que da 160 decisiones por variante:

| Variante | Tamano del encoder | Coincide con el modelo completo | Correctas frente a etiquetas |
|---|---|---|---|
| Precision completa | 1,17 GB | 160/160 | 152/160 |
| Esta version (capas 8 bits, vocabulario 4 bits, cabeza 8 bits) | 250 MB | 158/160 | 150/160 |
| Capas en 4 bits | 195 MB | 153/160 | 146/160 |

El autor indica que las capas en 4 bits pierden claramente mas exactitud y que ONNX Runtime no puede ejecutar pesos de 3 bits. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM: no aplica en el escenario principal, ya que la inferencia esta pensada para WebAssembly sobre CPU. Los pesos suman aproximadamente 278 MB (250 MB de encoder mas 28 MB de cabeza), a los que hay que anadir el espacio de trabajo del runtime y las activaciones.
- Memoria del dispositivo: la version en precision completa del encoder ocupa 1,17 GB, por lo que la cuantizacion reduce el requisito de almacenamiento y de descarga en un factor cercano a 4,7.
- GPU: no se especifica ninguna GPU recomendada. Al ejecutarse via onnxruntime-web, puede usar el backend WebGPU cuando este disponible, pero el autor no publica mediciones en GPU.
- GPU de consumo: el modelo cabe en cualquier equipo que pueda ejecutar un navegador moderno, dado el tamano de los ficheros; no requiere una GPU dedicada para el modo WASM.
- Opciones de despliegue: onnxruntime-web (WebAssembly, y potencialmente WebGPU), ONNX Runtime en C++ o Python, y el cargador TypeScript `laya-ts`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de decision no generativo en formato ONNX.
- Latencia y throughput: no disponibles. El unico dato de rendimiento publicado es el acuerdo y la exactitud frente a etiquetas, no tiempos de inferencia.
- Requisito de version: la cuantizacion se genero con ONNX Runtime 1.30 y el operador MatMulNBits, por lo que el runtime de destino debe soportar dichos operadores.

## Comparativa con modelos similares

No se han encontrado en la busqueda web modelos comparables de moderacion multilingue en ONNX para navegador dentro de la informacion disponible. La comparacion mas directa que si esta documentada es entre las propias variantes de este modelo y el checkpoint base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| convaiinnovations/laya-multilingual | no disponible | no disponible | 152/160 correctas, 160/160 de acuerdo consigo mismo | Apache-2.0 | HuggingFace; pesos en precision completa (encoder de 1,17 GB) |
| Foreverstorm/radiochat-laya-multilingual-onnx (esta ficha) | no disponible | no disponible | 150/160 correctas, 158/160 de acuerdo con el modelo completo | Apache-2.0 | HuggingFace; ONNX de 8 bits, 250 MB de encoder |
| Variante ONNX de 4 bits documentada por el autor | no disponible | no disponible | 146/160 correctas, 153/160 de acuerdo | Apache-2.0 | Solo descrita en la model card; fichero de 195 MB |

## Limitaciones y advertencias

- No es un modelo generativo: no puede redactar respuestas, resumir ni mantener conversaciones; solo devuelve decisiones tipadas (eleccion, puntuacion, si/no).
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, y ningun resultado de benchmarks independiente publicado.
- Degradacion por cuantizacion: la version de 8 bits pierde 2 decisiones de 160 respecto al modelo completo en acuerdo y 2 en exactitud frente a etiquetas; la variante de 4 bits pierde 7 y 6 respectivamente.
- Idiomas no declarados: aunque el modelo base es multilingue, la ficha no especifica la cobertura real por idioma, lo que impide garantizar el comportamiento en castellano u otras lenguas sin evaluacion propia.
- Longitud de contexto desconocida: no se publica el maximo de tokens de entrada, un dato critico para moderacion de mensajes largos o hilos completos.
- Riesgo de clasificacion erronea con impacto real: en moderacion, los falsos positivos censuran contenido legitimo y los falsos negativos dejan pasar contenido danino; la exactitud publicada (150/160) procede de una muestra pequena de 80 mensajes y no permite estimar tasas por clase.
- Sesgos heredados: al derivar del encoder mmBERT-base y de los datos de entrenamiento de Laya, puede reproducir sesgos linguisticos o culturales presentes en el modelo original; no se documentan analisis de sesgo.
- Anomalia en los metadatos: las fechas de creacion y actualizacion indicadas (2026-09-28) son posteriores a la fecha habitual de publicacion de modelos en HuggingFace, lo que conviene verificar antes de integrarlo en produccion.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero exige conservar los avisos de licencia y atribuir el trabajo a los autores originales del modelo Laya, tal como hace el autor de la exportacion.
- Dependencia de operadores especificos: requiere un runtime con soporte de MatMulNBits y GatherBlockQuantized (ONNX Runtime 1.30 o superior); no funcionara en runtimes antiguos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Foreverstorm/radiochat-laya-multilingual-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio Laya (codigo y modelo original): https://github.com/NandhaKishorM/laya
- Cargador TypeScript laya-ts: https://github.com/NandhaKishorM/laya/tree/main/laya-ts
- Script de exportacion a ONNX: `laya-ts/scripts/export_onnx.py` (commit `9d95567` del repositorio Laya)
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces listados proceden de la model card y de los metadatos del repositorio.
