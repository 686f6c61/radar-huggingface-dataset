# arianaazarbal/ct-qwen36-35b-self-gen-postcot-g2-b2

## Resumen

ct-qwen36-35b-self-gen-postcot-g2-b2 es un adaptador LoRA de rango 64 entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B por el usuario arianaazarbal, dentro del programa de entrenamiento por constituciones iteradas y autogeneradas (welfare-in-ai-rnd / constitutional_training). No es un modelo completo: es un adaptador PEFT que debe cargarse junto al modelo base y que modifica su comportamiento conversacional y de razonamiento segun una constitucion sintetica concreta.

El interes de esta publicacion es metodologico. Cada generacion del programa se entrena desde cero sobre el modelo base con un corpus documental sintetico que instancia una unica constitucion; la generacion 0 se siembra con una constitucion escrita por humanos y la generacion N se siembra con una constitucion escrita por el modelo de la generacion N-1 de la misma rama. Este artefacto corresponde a la generacion 2, rama b2, con regimen post-CoT (se conservan las trazas de razonamiento). La deriva entre generaciones se acumula solo a traves de los documentos de entrenamiento, nunca a traves de los pesos, lo que permite estudiar la evolucion de los valores aprendidos de forma aislada.

El adaptador se entreno el 17 de septiembre de 2026 y se exporto desde Tinker el 18 de septiembre de 2026. El repositorio incluye la constitucion utilizada como semilla y los metadatos de exportacion. No hay resultados de benchmarks publicados ni especificacion de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer del modelo base Qwen/Qwen3.6-35B-A3B; la arquitectura interna del base no se detalla en la informacion disponible (la nomenclatura A3B sugiere mezcla de expertos, sin confirmar) |
| Parametros totales | Modelo base: 35000 millones aproximados segun el identificador; el adaptador no publica su numero de parametros entrenables |
| Parametros activos | Aproximadamente 3000 millones inferidos de la nomenclatura A3B del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento del adaptador uso una longitud maxima de 8192 tokens |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos del adaptador en safetensors, sin versiones GGUF, AWQ o GPTQ publicadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no especifica licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar el modelo base por separado |
| Tipo de adaptador | LoRA, rango 64, target_modules=all-linear |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tamano del repositorio | 4,5 GB |
| Linaje | qwen36-35b-self-gen-postcot, generacion g2, rama b2 |
| Fecha de entrenamiento | 2026-09-17 (exportado el 2026-09-18) |

## Arquitectura y entrenamiento

El adaptador se entrena con una receta fija: LoRA de rango 64 sobre todos los modulos lineales (all-linear), learning rate 1e-4, scheduler coseno con 5 por ciento de warmup, una epoca, batch de 128, longitud maxima de 8192 tokens y semilla de entrenamiento 42. El entrenamiento se divide en dos etapas: una fase intermedia (midtrain) sobre un corpus documental sintetico que instancia la constitucion semilla de esa generacion, y una segunda etapa de post-entrenamiento que parte del adaptador de la etapa 1 y continua sobre datos de chat condicionados por constitucion, generados por Opus, manteniendo las trazas de razonamiento (chain-of-thought) en los datos. La inferencia y evaluacion deben realizarse con el renderer `qwen3_5` y el razonamiento activado.

La innovacion del programa no esta en la arquitectura, que es un LoRA convencional, sino en el bucle de entrenamiento. La generacion 0 se siembra con una constitucion escrita por humanos; a partir de ahi, cada generacion recibe como semilla una constitucion nueva escrita por el modelo de la generacion anterior de la misma rama, seleccionada como el medoide de embedding de un pool de 40 cadenas autogeneradas. Cada generacion se reentrena desde el modelo base, no desde los pesos de la generacion previa, de modo que cualquier cambio de comportamiento atribuible a la constitucion queda aislado de la acumulacion de pesos. La rama b2 es una replicacion independiente, lo que permite medir varianza entre ejecuciones con la misma semilla. La constitucion empleada se incluye en el repositorio como `training_seed_constitution.md`.

## Capacidades

- Generacion de texto conversacional condicionada por una constitucion explicita, con trazas de razonamiento preservadas durante el entrenamiento.
- Razonamiento multi-paso: el regimen post-CoT implica que el modelo fue ajustado sobre respuestas que incluyen cadenas de pensamiento, por lo que se espera que las emita al activar el modo de razonamiento.
- Comportamiento alineado con un conjunto de normas escrito en lenguaje natural, util para estudiar como se traduce una constitucion en conducta observable.
- Capacidades del modelo base Qwen/Qwen3.6-35B-A3B: no disponibles en la informacion proporcionada (la model card no las enumera).
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales declaradas: modo de razonamiento (reasoning ON) con el renderer `qwen3_5`; ninguna otra confirmada.

## Casos de uso

- Investigacion en alineacion tipo constitutional AI: permite comparar la conducta de la generacion 2 con las generaciones 0 y 1 de la misma rama para medir como evoluciona la interpretacion de las normas a lo largo del bucle, ya que la constitucion semilla esta incluida en el repositorio.
- Estudio de deriva de valores sin contaminacion de pesos: al reentrenar cada generacion desde el modelo base, este adaptador sirve como punto de medida aislado del efecto de los documentos sinteticos, no del entrenamiento acumulado.
- Replicacion experimental: la rama b2 es una replica independiente de la misma generacion, por lo que puede usarse junto a otras ramas para estimar la varianza entre ejecuciones de la receta.
- Generacion de datos sinteticos con trazas de razonamiento: el adaptador produce respuestas con cadena de pensamiento condicionadas por una constitucion, lo que resulta util para construir corpus de entrenamiento o de evaluacion con un sesgo normativo controlado.
- Evaluacion de robustez normativa: se pueden construir baterias de prompts que fuercen conflictos entre la constitucion aprendida y las instrucciones del usuario, y medir la tasa de cumplimiento del modelo.
- Analisis de comportamiento en contexto largo: con ventanas de hasta 8192 tokens durante el entrenamiento, es viable estudiar la coherencia normativa en conversaciones multi-turno extensas.
- Base para experimentos de post-entrenamiento: al ser un adaptador PEFT de rango 64, se puede continuar el ajuste sobre el sin tocar los pesos del modelo base, lo que abarata la iteracion experimental.
- Reproduccion de un pipeline de entrenamiento completo: la receta, la semilla y los metadatos de exportacion estan documentados, lo que permite reproducir o auditar el proceso dentro del programa constitutional_training.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluaciones de alineacion, y la busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM para el modelo base en bfloat16: del orden de 70 GB solo para los pesos, dado que el identificador indica 35 000 millones de parametros. Estimacion derivada del tamano, no publicada por el autor.
- VRAM adicional del adaptador: el repositorio ocupa 4,5 GB, pero la huella en inferencia tras fusionar el LoRA es mucho menor; no se publica la cifra exacta de parametros entrenables.
- GPU recomendadas: para bfloat16 completo se necesitan como minimo dos A100 de 40 GB o una H100 de 80 GB con margen ajustado. Con dos H100 de 80 GB o un nodo con A100 de 80 GB se trabaja con holgura.
- GPU de consumo: no cabe en bf16 en una RTX 4090 de 24 GB. Solo seria viable con cuantizacion de 4 bits del modelo base, escenario en el que los pesos quedarian en torno a 18-20 GB, muy justo para 24 GB una vez sumados el contexto y el cache KV.
- Opciones de despliegue: PEFT junto a transformers (procedimiento documentado por el autor), vLLM con soporte de adaptadores LoRA, o TGI si se fusiona el adaptador. Para llama.cpp u Ollama seria necesario fusionar el LoRA en el modelo base y convertir el resultado a GGUF, ya que no se publican pesos GGUF del adaptador.
- Latencia y throughput: no disponibles. Al tratarse presuntamente de una arquitectura de mezcla de expertos, el coste de decodificacion se acercaria al de los parametros activos, pero esto no esta confirmado en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye adaptadores comparables del mismo programa, ni resultados de evaluacion que permitan situar este artefacto frente a alternativas. Como referencia estructural, cualquier LoRA de rango 64 sobre el mismo modelo base seria comparable en coste de entrenamiento y despliegue, pero no se dispone de datos publicados de ninguno de ellos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna metrica publicada que permita estimar la calidad real del adaptador. Cualquier uso en produccion requeriria una evaluacion propia previa.
- Licencia no especificada: la model card no indica licencia. Sin una licencia explicita, no hay autorizacion clara para uso comercial y conviene contactar con el autor antes de integrarlo en un producto.
- Idiomas no declarados: se desconoce que lenguas cubre el entrenamiento, por lo que no se puede asumir un rendimiento correcto en castellano.
- Riesgo de alucinacion: no cuantificado, pero es el comportamiento por defecto de cualquier modelo de lenguaje sin evaluacion especifica de factualidad.
- Sesgos: la constitucion que gobierna el comportamiento es sintetica y esta escrita por un modelo, no por humanos, en las generaciones 1 y 2. Los valores incorporados reflejan los sesgos del modelo que la redacto y del corpus de post-entrenamiento, sin auditoria externa documentada.
- Dependencia del renderer: el propio autor indica que la evaluacion debe hacerse con el renderer `qwen3_5` y el razonamiento activado. Usar otro formato de prompt puede degradar el comportamiento de forma significativa.
- Es un adaptador, no un modelo autonomo: requiere descargar Qwen/Qwen3.6-35B-A3B (unos 70 GB en bf16) ademas de los 4,5 GB del repositorio, lo que eleva mucho el coste de despliegue.
- Trazabilidad limitada: el adaptador se exporto desde Tinker y depende de una ruta interna y de un fichero `tinker_meta.json`; la reproducibilidad completa depende de que el programa constitutional_training y el modelo base sigan disponibles.
- Cero adopcion registrada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion por parte de terceros.
- Cambio de comportamiento no verificado: no hay evidencia publicada de que el adaptador mejore o empeore las capacidades del modelo base en tareas estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-self-gen-postcot-g2-b2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Ruta interna de Tinker indicada por el autor: `tinker://45956e25-b7f1-5ef8-8a21-2deb3e352153:train:0/sampler_weights/qwen36_selfg2_qwen36_self_g2_b2_s2_cot_final`
- Ficheros incluidos en el repositorio: `training_seed_constitution.md` (constitucion semilla) y `tinker_meta.json` (registro de exportacion)
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos correspondian a medios de comunicacion, prensa deportiva y contenido de entretenimiento, sin relacion con el artefacto descrito.
