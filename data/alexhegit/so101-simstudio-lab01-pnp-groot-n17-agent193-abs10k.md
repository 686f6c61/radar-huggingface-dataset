# alexhegit/so101-simstudio-lab01-pnp-groot-n17-agent193-abs10k

## Resumen

El modelo `alexhegit/so101-simstudio-lab01-pnp-groot-n17-agent193-abs10k` es un ajuste fino (fine-tune) del modelo fundacional de robotica `nvidia/GR00T-N1.7-3B`, publicado por el usuario alexhegit en HuggingFace. Se trata de una politica visio-lenguaje-accion (VLA) especializada en una tarea concreta de recogida y colocacion (pick-and-place) sobre el brazo robotico SO-101 en el entorno de simulacion Lab01 de SimStudio. El modelo resuelve el problema de convertir observaciones visuales y de estado del robot en comandos de articulacion absolutos para completar la tarea.

El ajuste parte del checkpoint base GR00T-N1.7-3B, con 3.144.016.000 parametros totales y un repositorio de 12,6 GB en formato safetensors. Durante el entrenamiento se congelaron tanto el modelo de lenguaje como la torre de vision, entrenando unicamente la cabeza de accion; se uso la etiqueta `embodiment_tag=new_embodiment` y `use_relative_actions=false`, es decir, se predicen posiciones articulares absolutas. El conjunto de entrenamiento contiene 193 episodios y el artefacto publicado corresponde al checkpoint `010000`, con chunk de 16.

Su relevancia es doble: por un lado documenta un resultado negativo y otro positivo sobre el mismo conjunto de datos (las variantes con acciones relativas obtuvieron 0/60 y 1/60, mientras que la variante absoluta alcanza 14/60 en la evaluacion Lab01-PnP-Home20); por otro, es un ejemplo reproducible de ajuste de un VLA de 3B para un embodiment concreto mediante la libreria LeRobot. La model card advierte explicitamente de que no debe reanudarse el entrenamiento desde estos pesos, ya que la planificacion coseno del learning rate termino en 0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) derivada de la familia NVIDIA GR00T N1.7; la model card no detalla la topologia interna |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | no aplica (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publican pesos safetensors; no se documentan variantes GGUF, AWQ o GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (heredada del modelo base) |
| Formato de pesos | safetensors |
| Libreria de referencia | lerobot |
| Tarea (pipeline) | robotics |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Dataset de entrenamiento | alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4-actonly-follow2 |
| Checkpoint publicado | 010000 (chunk 16) |
| Tamano del repositorio | 12,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `nvidia/GR00T-N1.7-3B`, un modelo fundacional de robotica de tipo visio-lenguaje-accion (VLA). La model card no especifica la composicion interna del backbone, pero si describe el procedimiento de ajuste: se congelaron el modelo de lenguaje y el modulo de vision, de modo que el entrenamiento se concentro en la cabeza de accion. Se empleo `embodiment_tag=new_embodiment` para registrar un cuerpo robotico nuevo y `use_relative_actions=false`, lo que implica que el objetivo de prediccion son posiciones articulares absolutas en lugar de desplazamientos relativos. Los seis valores `.pos` de articulacion del dataset son las etiquetas de entrenamiento; GR00T los rellena internamente en su ranura de accion de 132 dimensiones.

El conjunto de datos contiene 193 episodios de una tarea de pick-and-place con el brazo SO-101. El artefacto publicado corresponde al checkpoint 010000 con un horizonte de accion (chunk) de 16. La evaluacion se realizo con inferencia sincrona (`inference.type=sync`). La propia model card documenta resultados comparativos de variantes sobre el mismo conjunto: las ejecuciones con acciones relativas obtuvieron 0/60 en el checkpoint de 10K y 1/60 en un entrenamiento fresco de 30K, con el acercamiento (approach) colapsado a 11/60 en alcance; una continuacion posterior de estos pesos absolutos durante 5K pasos con learning rate `1e-5` empeoro el resultado en la semilla 1000 (4/20). Se advierte de que no debe reanudarse el entrenamiento desde estos pesos porque la planificacion coseno del learning rate finalizo en 0.

## Capacidades

- Generacion de acciones de control para el brazo robotico SO-101, expresadas como posiciones articulares absolutas de seis articulaciones.
- Percepcion visual y de estado procedente del entorno de simulacion SimStudio (Lab01) para la tarea de pick-and-place.
- Ejecucion de una politica de accion con horizonte de chunk de 16 pasos.
- Adaptacion a un nuevo embodiment mediante `embodiment_tag=new_embodiment`, lo que permite registrar una morfologia robotica distinta a las del preentrenamiento.
- Alcance de objetivo fiable: segun la model card, el modelo consigue 60/60 en la fase de acercamiento (reach) de la evaluacion.
- Sujeccion parcial del objeto: 45/60 en la fase de cierre de pinza (close) y 17/60 en la fase de elevacion (lift).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision general, audio ni modos de razonamiento explicito (`thinking mode`).
- No se documentan capacidades multilingues; el campo de idiomas aparece como no disponible.

## Casos de uso

- Recogida y colocacion automatizada con SO-101 en simulacion: el modelo genera las posiciones articulares absolutas necesarias para acercarse a un cubo, cerrar la pinza y levantarlo. Es adecuado porque ha sido entrenado especificamente sobre 193 episodios de esta tarea en el entorno Lab01.
- Investigacion en ajuste de modelos VLA para nuevos embodiments: sirve como referencia reproducible de fine-tuning con el backbone de lenguaje y vision congelado y solo la cabeza de accion entrenada.
- Estudio comparativo de acciones absolutas frente a relativas: la model card aporta resultados medidos sobre el mismo conjunto de datos (14/60 en absolutas frente a 0/60 y 1/60 en relativas), utiles como linea base para experimentos de representacion de acciones.
- Evaluacion sim-to-real en robotica de bajo coste: al estar orientado al brazo SO-101 y a un simulador, permite ensayar politicas antes de trasladarlas a hardware fisico.
- Automatizacion de laboratorio y manipulacion de objetos pequenos: las fases de reach y close funcionan de forma consistente, por lo que el modelo puede emplearse en pipelines donde la sujeccion y elevacion no sean criticas.
- Docencia y formacion en aprendizaje por imitacion: la integracion con `lerobot.policies.groot.modeling_groot.GrootPolicy` permite cargar la politica en pocas lineas y estudiar el ciclo completo de entrenamiento y evaluacion.
- Generacion de datos sinteticos de manipulacion: las trayectorias producidas en simulacion pueden registrarse para aumentar conjuntos de demostraciones.
- Diagnostico de fallos de pinza: la model card indica que la mayoria de los cierres fallidos ocurren al lado del cubo con fuerza de mordaza cercana a cero, lo que resulta util para analizar el comportamiento del controlador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta tasas de exito sobre la evaluacion especifica Lab01-PnP-Home20, que se recogen a continuacion:

| Evaluacion (Lab01-PnP-Home20) | Resultado |
|---|---|
| Exito global por semilla | 7/20, 2/20, 5/20 = 14/60 |
| Fase reach (acercamiento) | 60/60 |
| Dentro de 4 cm | 51/60 |
| Fase close (cierre de pinza) | 45/60 |
| Fase lift (elevacion) | 17/60 |

| Variante comparada (mismo dataset) | Resultado |
|---|---|
| Acciones absolutas, 10K (este modelo) | 14/60 |
| Acciones relativas, 10K | 0/60 (checkpoint eliminado) |
| Acciones relativas, 30K | 1/60 (reach colapsado a 11/60) |
| Continuacion absoluta, 5K, lr `1e-5`, semilla 1000 | 4/20 |

## Requesitos de hardware

Nota: los valores de VRAM y latencia que figuran a continuacion son estimaciones derivadas del numero de parametros y del tamano del repositorio, no datos publicados por el autor.

- VRAM estimada en bf16/fp16: aproximadamente 6,3 GB solo para los pesos (3.144.016.000 x 2 bytes), mas el consumo de activaciones y del entorno de inferencia.
- VRAM estimada en fp32: aproximadamente 12,6 GB solo para los pesos, cifra coherente con el tamano del repositorio (12,6 GB).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, una GPU con 16 GB o mas permite inferencia en bf16 con margen; las tarjetas de 8-12 GB pueden ser suficientes en cuantizacion de 8 bits, no documentada por el autor.
- Cabe en GPU de consumo: es probable que si en modelos con 16 GB o mas de VRAM (por ejemplo, RTX 4080/4090 de 16-24 GB) en bf16, aunque no se ha verificado en la model card.
- Opciones de despliegue: la via documentada es la libreria LeRobot mediante `GrootPolicy.from_pretrained(...)`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluacion empleo inferencia sincrona (`inference.type=sync`), sin cifras de latencia publicadas.
- Estado del entrenamiento: checkpoint 010000, chunk 16, con la planificacion coseno del learning rate finalizada en 0 (no reanudable).

## Comparativa con modelos similares

| Modelo | Parametros | Modelo base | Acciones | Licencia | Resultado publicado |
|---|---|---|---|---|---|
| alexhegit/so101-simstudio-lab01-pnp-groot-n17-agent193-abs10k (este modelo) | 3,14 mil millones | nvidia/GR00T-N1.7-3B | Absolutas | NVIDIA Open Model License | 14/60 en Lab01-PnP-Home20 |
| nvidia/GR00T-N1.7-3B | 3 mil millones (segun denominacion del modelo) | no aplica | Generales | NVIDIA Open Model License | no disponible en la informacion proporcionada |
| alexhegit/so101-simstudio-lab01-pnp-groot-n17 | no disponible | nvidia/GR00T-N1.7-3B | Relativas | no disponible | resultado negativo con 50 episodios (cifra no detallada) |

No se dispone de datos sobre otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Tasa de exito baja en la tarea completa: 14/60 en la evaluacion Lab01-PnP-Home20, con especial debilidad en la fase de elevacion (17/60).
- Fallos de cierre de pinza: la model card indica que la mayoria de los cierres fallidos se producen al lado del cubo, con fuerza de mordaza cercana a cero.
- No reanudar el entrenamiento desde estos pesos: la planificacion coseno del learning rate termino en 0 y una continuacion de 5K pasos con lr `1e-5` empeoro el resultado en la semilla 1000 (4/20).
- Especificidad de tarea y embodiment: el modelo esta ajustado para una unica tarea de pick-and-place sobre el brazo SO-101; no se documenta generalizacion a otras tareas, objetos o morfologias.
- Riesgo de alucinacion: no aplica en el sentido textual; el equivalente en robotica es la generacion de acciones plausibles pero fisicamente incorrectas, evidenciado por las fases fallidas.
- Limitaciones de idioma: no disponible; el campo de idiomas no esta especificado.
- Limitaciones de contexto: la longitud de contexto no esta documentada.
- Restricciones de licencia: se hereda la NVIDIA Open Model License del modelo base. Es una licencia "other" que debe revisarse antes de cualquier uso comercial; el enlace figura en la model card.
- Sesgos conocidos: no disponibles.
- Documentacion incompleta: no se detallan la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset mas alla de los 193 episodios, ni si hubo RLHF o DPO.
- Uso en produccion: no recomendado sin una evaluacion adicional, dado el bajo exito global y la ausencia de cifras de latencia y throughput.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-groot-n17-agent193-abs10k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/alexhegit/so101-simstudio-lab01-pnp-agent-yaw-v4-actonly-follow2
- Variante con acciones relativas del mismo autor: https://huggingface.co/alexhegit/so101-simstudio-lab01-pnp-groot-n17
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Busqueda web: no se encontraron enlaces relevantes sobre este modelo. Los resultados devueltos por el buscador corresponden a contenido no relacionado (videojuegos y generadores de contrasenas) y se han descartado por no aportar informacion tecnica verificable.
