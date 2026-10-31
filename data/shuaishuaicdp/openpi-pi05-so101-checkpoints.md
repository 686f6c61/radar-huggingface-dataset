# shuaishuaicdp/openpi-pi05-so101-checkpoints

## Resumen

openpi-pi05-so101-checkpoints es un repositorio de checkpoints de inferencia y reanudación de entrenamiento (formato Orbax) correspondientes a fine-tunings del modelo vision-language-action π0.5 (pi05) sobre el brazo robótico SO101, publicado por el usuario shuaishuaicdp en Hugging Face. El modelo base π0.5 procede del ecosistema openpi de Physical Intelligence, una familia de modelos de política robótica que combinan un backbone de visión-lenguaje con un cabezal de acción para generar comandos de control de robots.

El repositorio recoge cinco ejecuciones de entrenamiento completadas (`pi05_so101_mat11_from_base`, `pi05_so101_mat11_from_scizor`, `pi05_so101_mat11_from_v6`, `pi05_so101_single_continual` y `pi05_so101_single_scizor_h32`), cada una con parámetros Orbax, assets, metadatos y árboles de `train_state`. Su relevancia radica en que permite a desarrolladores de robótica reproducir o continuar estos fine-tunings sin repetir el coste computacional del entrenamiento, utilizando el framework openpi y el hardware SO101 de bajo coste.

No se ha publicado una model card detallada con arquitectura específica del fine-tuning, datos de entrenamiento ni benchmarks; la información disponible se limita al README del repositorio y al código fuente asociado en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (pi05, framework openpi); detalles del backbone no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Orbax checkpoints (con `train_state`, assets y metadatos) |

## Arquitectura y entrenamiento

El modelo se basa en π0.5 (pi05), la familia de políticas vision-language-action de Physical Intelligence distribuida mediante el framework openpi. Este tipo de modelos combina un backbone de visión-lenguaje (VLM) preentrenado con un cabezal de acción que genera comandos de control continuos para manipulación robótica. Los detalles concretos del backbone, el número de parámetros y la ventana de contexto de estos checkpoints no están especificados en la model card.

El entrenamiento consistió en cinco fine-tunings sobre tareas con el brazo SO101, tres de ellos partiendo de distintos puntos de inicialización (`from_base`, `from_scizor`, `from_v6`), uno etiquetado como continual learning (`single_continual`) y otro con configuración `h32` (`single_scizor_h32`). Los cambios de código y entrenamiento se documentan en el repositorio Dongping-Chen/openpi-so101. No se dispone de información sobre el número de tokens o pasos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generacion de politicas de accion para manipulacion robotica: produce comandos de control continuos para el brazo SO101 a partir de observaciones visuales e instrucciones.
- Comprension vision-lenguaje: como modelo VLA basado en pi05, interpreta imagenes de camara del robot junto con instrucciones en lenguaje natural.
- Reanudacion de entrenamiento: los checkpoints incluyen arboles de `train_state` completos, lo que permite continuar el fine-tuning desde el estado guardado.
- Aprendizaje continuo: la ejecucion `single_continual` sugiere soporte para entrenamiento incremental sobre tareas previas.
- No es un modelo de chat ni de generacion de texto de proposito general; su salida son politicas de control.

## Casos de uso

- Manipulacion de objetos con SO101: desplegar politicas entrenadas para tareas de agarrar, colocar o trasladar objetos con el brazo SO101, reutilizando los checkpoints sin reentrenar desde cero.
- Investigacion en aprendizaje continuo: usar la ejecucion `single_continual` como base para experimentar con entrenamiento incremental de politicas VLA sobre secuencias de tareas.
- Estudio de inicializaciones: comparar las tres variantes `from_base`, `from_scizor` y `from_v6` para analizar el impacto del punto de partida en la convergencia del fine-tuning.
- Reproduccion de experimentos: descargar los checkpoints y el codigo de openpi-so101 para replicar los resultados de las ejecuciones de entrenamiento.
- Punto de partida para nuevos fine-tunings: continuar el entrenamiento desde los `train_state` guardados con nuevos datasets de demostraciones del SO101.
- Evaluacion de simulacion a real (sim-to-real): integrar las politicas en pipelines de evaluacion del framework openpi sobre hardware fisico o gemelos digitales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (los modelos pi05 del ecosistema openpi suelen requerir GPUs de gama alta, pero no hay datos especificos para estos checkpoints).
- GPU recomendadas: no disponible; por referencia, el ecosistema openpi se utiliza tipicamente con GPUs tipo A100 o H100 para entrenamiento e inferencia de pi05.
- Compatibilidad con GPUs de consumo: no disponible; el tamano del repositorio (402,2 GB) indica checkpoints completos de entrenamiento, no pesos cuantizados ligeros.
- Despliegue: requiere la libreria openpi (disponible en PyPI/GitHub) y JAX con soporte Orbax para cargar los checkpoints; no hay pesos en GGUF ni soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato de pesos | Licencia | Contexto |
|---|---|---|---|---|
| openpi-pi05-so101-checkpoints | Politica VLA (pi05 fine-tuned SO101) | Orbax | Apache 2.0 | no disponible |
| openpi pi0 base (Physical Intelligence) | Politica VLA | Orbax/JAX | Apache 2.0 | no disponible |
| Octo (Octo Model Team) | Politica VLA generalista | checkpoints JAX/TF | MIT | no disponible |

Los checkpoints se diferencian de los modelos base openpi en que ya incorporan fine-tunings especificos para el brazo SO101, lo que evita el coste de adaptacion inicial. Frente a alternativas como Octo, la familia pi05 representa una generacion mas reciente de politicas VLA basadas en backbones VLM de mayor escala.

## Limitaciones y advertencias

- Falta de documentacion: la model card es minima; no se especifican arquitectura detallada, datos de entrenamiento, benchmarks ni instrucciones de uso, lo que exige revisar el codigo de openpi-so101 para reproducir la configuracion exacta.
- Riesgo de alucinacion/comportamiento no verificado: no hay evaluaciones publicadas del rendimiento de las politicas sobre tareas fisicas, por lo que su fiabilidad en hardware real debe validarse con cautela.
- Especializacion en hardware: las politicas estan entrenadas para el brazo SO101; su transferencia a otros robots no esta garantizada.
- Tamano del repositorio: con unos 402 GB, la descarga completa requiere almacenamiento y ancho de banda considerables.
- Sesgos: los datos de entrenamiento provienen de demostraciones especificas de las ejecuciones SO101; los sesgos de esas demostraciones pueden limitar la generalizacion a escenarios no vistos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base pi05 y del framework openpi en el repositorio original.
- Uso previsto: es un artefacto de investigacion en robotica, no un producto listo para produccion; no incluye mecanismos de seguridad documentados para despliegue en robots fisicos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/shuaishuaicdp/openpi-pi05-so101-checkpoints
- Codigo fuente y cambios de entrenamiento: https://github.com/Dongping-Chen/openpi-so101
- Framework openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
