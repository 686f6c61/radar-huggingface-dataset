# rubatotree/classify-blocks-2-1-smolvla

## Resumen

`rubatotree/classify-blocks-2-1-smolvla` es una política robótica de tipo vision-language-action (VLA) publicada por el usuario rubatotree, obtenida por ajuste fino del modelo base `lerobot/smolvla_base` sobre el conjunto de datos sintético `rubatotree/classify-blocks-2-1`. Se trata de un entrenamiento experimental orientado a tareas de pick-and-place de un único bloque, con 512 episodios y geometría de hardware revisada. El checkpoint tiene 450.046.176 parámetros (aproximadamente 450 millones) y se distribuye en formato safetensors dentro de un repositorio de 1,2 GB, con licencia Apache-2.0.

El modelo recibe una imagen RGB frontal de 480x640, un vector de estado de seis dimensiones (cinco posiciones articulares en grados más el porcentaje de apertura de la pinza) y una instrucción en lenguaje natural procedente del dataset, y genera comandos absolutos de acción de seis dimensiones en las mismas unidades a 15 Hz. Es, por tanto, una política de imitación cerrada sobre una tarea concreta, no un modelo de propósito general.

Su relevancia es acotada y conviene subrayarla: el propio autor declara que el checkpoint no se ha evaluado en un brazo físico, que las demostraciones de origen llevan las marcas `smoke_only=true` y `training_eligible=false`, y que el entrenamiento se admitió de forma explícita únicamente para validar el cableado de simulación y revisar trayectorias. Por tanto, sirve como material de estudio y como ejemplo reproducible de ajuste fino de SmolVLA con LeRobot, no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA; backbone VLM ligero con experto de accion (detalle interno no disponible en la informacion proporcionada) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplicable (politica de accion sobre observacion fija: imagen, estado e instruccion) |
| Tipos de cuantizacion | No disponible (no se documentan variantes cuantizadas; pesos en safetensors) |
| Idiomas soportados | No disponible (acepta una instruccion de tarea en lenguaje natural; el idioma del dataset no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |

Datos adicionales de la ficha: pipeline `robotics`, tamano del repositorio 1,2 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 26 de septiembre de 2026 y actualizado el mismo dia.

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia SmolVLA, el modelo fundacional ligero de Hugging Face para robotica, que combina un backbone de vision-lenguaje con un modulo generador de acciones. La entrada se codifica como caracteristicas contextuales que condicionan al experto de accion: camaras, estado sensorimotor actual e instruccion en lenguaje natural. El paper asociado (`arXiv:2506.01844`) presenta SmolVLA como una alternativa a los VLA masivos, orientada a un coste computacional reducido y a un ajuste fino sencillo sobre datasets de LeRobot. Los detalles concretos del backbone, el numero de tokens de entrenamiento y la composicion del dataset base de SmolVLA no se detallan en la informacion disponible.

En cuanto a este checkpoint concreto, el entrenamiento parte de `lerobot/smolvla_base` y utiliza `rubatotree/classify-blocks-2-1`, la revision de geometria de hardware del dataset sintetico de pick-and-place de bloque unico, con 512 episodios. La interfaz de accion es absoluta: cinco posiciones articulares en grados mas un comando de pinza en porcentaje, emitidos a 15 Hz. El autor indica que los pasos de entrenamiento exactos, el tamano de lote, los hashes del dataset y la recarga estricta del checkpoint estan registrados en `training_report.json`, adjunto junto a los pesos. No se declara uso de RLHF ni de DPO; se trata de aprendizaje por imitacion sobre datos sinteticos. Las demostraciones de origen estan marcadas como `smoke_only=true` y `training_eligible=false`, y el entrenamiento se admitio bajo una excepcion experimental para validar el cableado de simulacion y revisar trayectorias.

## Capacidades

- Generacion de comandos de accion de 6 dimensiones (5 articulaciones en grados + apertura de pinza en porcentaje) a partir de observacion visual, estado y lenguaje.
- Percepcion visual de una camara frontal RGB con resolucion 480x640.
- Condicionamiento por instruccion en lenguaje natural: acepta la cadena de tarea del dataset como entrada de texto.
- Ejecucion de una tarea concreta de pick-and-place de bloque unico en simulacion (clasificacion/recogida y colocacion de un bloque).
- Integracion con el ecosistema LeRobot mediante `SmolVLAPolicy.from_pretrained(...)`.
- Ajuste fino adicional sobre datasets propios en formato LeRobot (capacidad heredada del modelo base).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision adicional, audio ni modo de razonamiento explicito.

## Casos de uso

- Validacion de infraestructura de simulacion: el checkpoint permite comprobar de extremo a extremo el cableado de observaciones (imagen 480x640, estado de 6 dimensiones), la frecuencia de control de 15 Hz y la recarga estricta de pesos antes de invertir en datos reales.
- Revision de trayectorias sinteticas: al estar entrenado sobre demostraciones con `smoke_only=true`, resulta util para inspeccionar si las trayectorias generadas siguen la geometria esperada del dataset `classify-blocks-2-1` y detectar fallos de anotacion.
- Plantilla reproducible de ajuste fino de SmolVLA: sirve como ejemplo minimo de pipeline de entrenamiento con LeRobot, partiendo de `lerobot/smolvla_base` y un dataset propio de pocos cientos de episodios.
- Experimentos academicos de imitacion con datos sinteticos: permite estudiar hasta que punto un dataset generado por simulacion transfiere a una politica VLA pequena, sin coste de recoleccion con hardware.
- Prototipado docente: por su tamano de 450 millones de parametros y su licencia permisiva, es adecuado para cursos y talleres sobre VLA, condicionamiento por lenguaje y control a 15 Hz.
- Pruebas de regresion de interfaces robot: al fijar los tensores de entrada y salida, se puede usar como caso de prueba para verificar que un nuevo cargador de datos o un nuevo entorno simulado respeta el contrato de la politica.
- Base para un futuro ajuste con datos reales: si se recopilan episodios fisicos de pick-and-place de un bloque, este checkpoint puede servir como inicializacion intermedia antes de un entrenamiento supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que el checkpoint no se ha evaluado en un brazo fisico, que no existe ninguna tasa de exito en hardware y que no se formula ninguna afirmacion sobre fidelidad de contacto ni sobre generalizacion en bucle cerrado. Tampoco se proporcionan metricas de perdida de entrenamiento ni de error de accion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp32 y 0,9 GB en bf16 solo para los pesos, a lo que hay que sumar activaciones del backbone visual al procesar imagenes de 480x640. Estas cifras son estimaciones derivadas del recuento de parametros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM resulta suficiente en la practica; se incluyen RTX 3060, RTX 4060, RTX 4090, A100 y H100. El modelo cabe holgadamente en GPU de consumo e incluso en CPU para inferencia puntual, aunque la frecuencia de control de 15 Hz hace recomendable GPU.
- Opciones de despliegue: la via documentada es LeRobot con PyTorch (`SmolVLAPolicy.from_pretrained`). No se documentan integraciones con vLLM, Ollama, llama.cpp, TGI ni formatos GGUF para este checkpoint.
- Latencia y throughput: no disponibles. El unico dato temporal es la frecuencia de emision de acciones de 15 Hz que define la interfaz del dataset, no una medicion de rendimiento del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rubatotree/classify-blocks-2-1-smolvla` | 450.046.176 | Imagen 480x640, estado (6,), instruccion de tarea | Pick-and-place de un bloque, 512 episodios sinteticos | Apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | No disponible en la informacion proporcionada (familia SmolVLA, orden de 450 M) | Multiples vistas de camara, estado sensorimotor, instruccion en lenguaje natural | Modelo fundacional de robotica para ajuste fino | No disponible en la informacion proporcionada | Hugging Face / LeRobot |
| `rubatotree/classify-blocks-2-smolvla` | No disponible | No disponible | Variante previa del mismo autor sobre el dataset `classify-blocks-2` | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada, ni de cifras de modelos VLA de otros autores que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No evaluado en hardware: no existe ninguna medicion de tasa de exito fisica, fidelidad de contacto ni generalizacion en bucle cerrado. El uso previsto es exclusivamente simulacion o ensayo supervisado.
- Datos de origen no aptos para entrenamiento: las demostraciones llevan `smoke_only=true` y `training_eligible=false`; el entrenamiento se hizo bajo admision experimental explicita.
- Riesgo de sobreajuste: 512 episodios sinteticos de una unica tarea y un unico bloque limitan drasticamente la variabilidad; es esperable un comportamiento rigido ante cambios de posicion, iluminacion, camara u objetos.
- Sesgos de simulacion: la brecha sim-a-real (texturas, dinamica de contacto, ruido de sensores, latencia) no se ha caracterizado, por lo que el comportamiento en un brazo real es impredecible.
- Ambito de tarea cerrado: el modelo emite comandos absolutos de articulaciones a 15 Hz para una tarea concreta; no es un asistente conversacional ni un modelo de proposito general, por lo que el riesgo de alucinacion textual no aplica del mismo modo, pero si el de generar acciones plausibles y erroneas.
- Idioma de la instruccion no especificado: se desconoce en que idioma estan las cadenas de tarea del dataset, lo que impide garantizar el condicionamiento en castellano u otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el estado experimental del checkpoint y la ausencia de validacion fisica desaconsejan cualquier despliegue en produccion. Se debe verificar ademas la licencia del dataset `rubatotree/classify-blocks-2-1` y del modelo base `lerobot/smolvla_base`.
- Adopcion nula: 0 descargas y 0 likes implican ausencia de validacion por parte de terceros y de informes de fallos conocidos.
- Requisito de recarga estricta: el autor menciona una recarga estricta del checkpoint registrada en `training_report.json`; ignorarla puede provocar discrepancias silenciosas entre pesos y configuracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rubatotree/classify-blocks-2-1-smolvla
- Variante previa del mismo autor: https://huggingface.co/rubatotree/classify-blocks-2-smolvla
- Archivos del repositorio de la variante previa: https://huggingface.co/rubatotree/classify-blocks-2-smolvla/tree/main
- Documentacion de SmolVLA en LeRobot: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Ejemplo de uso de SmolVLA: https://github.com/huggingface/lerobot/blob/main/examples/tutorial/smolvla/using_smolvla_example.py
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/rubatotree/classify-blocks-2-1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
