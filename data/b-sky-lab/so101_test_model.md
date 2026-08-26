# b-sky-lab/so101_test_model

## Resumen

`b-sky-lab/so101_test_model` es un modelo de politica robótica basado en ACT (Action Chunking with Transformers), desarrollado por b-sky-lab (Yutaro KIMURA) con la libreria LeRobot de Hugging Face. Se trata de un modelo de aprendizaje por imitacion entrenado para controlar un brazo robotico SO-101 (SOArm101) en la tarea concreta de "pick the boat". Su proposito es predecir secuencias de acciones (chunks) a partir de observaciones de estado y de una camara, en lugar de predecir un unico paso de accion, lo que permite movimientos mas suaves y robustos.

El modelo es una implementacion de ACT, un metodo publicado en el articulo [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705) (arXiv:2304.13705), que ha demostrado altas tasas de exito en tareas de manipulacion robotica teleoperada. Con 51,6 millones de parametros y un peso de 0.2 GB en formato safetensors, este modelo concreto es un experimento de validacion: se entreno con un unico episodio de 626 frames y solo 2 pasos de entrenamiento, por lo que no representa una politica util para produccion, sino un ejemplo de flujo de trabajo con LeRobot.

Su relevancia radica en que demuestra el proceso completo de entrenamiento, publicacion y despliegue de una politica robota con LeRobot y ACT, sirviendo como referencia para desarrolladores que quieran replicar el flujo con sus propios datos y robots. No obstante, al ser un modelo de prueba sin evaluacion publicada, no debe utilizarse en entornos reales de robotica sin un entrenamiento adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Action Chunking with Transformers, ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robotica, no procesa secuencias largas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de control robotico, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que utiliza un transformer para predecir bloques de acciones (por ejemplo, 10-20 pasos de accion) en lugar de un solo paso. Esto reduce el error de acumulacion y permite movimientos mas suaves en tareas de manipulacion. El modelo se entrena con datos teleoperados y ha demostrado altas tasas de exito en tareas como recoger objetos o abrir cajones.

En este caso, el modelo fue entrenado con LeRobot (version 0.6.2) sobre el dataset `b-sky-lab/so101_test`, que contiene 1 episodio de 626 frames a 30 FPS, con la tarea "pick up the boat". La configuracion de entrenamiento fue minima: 2 pasos de entrenamiento, batch size de 8, optimizador AdamW y learning rate de 1e-5. El modelo se entreno con una camara (laptop) y observaciones de estado de 6 dimensiones, y genera acciones de 6 dimensiones.

## Capacidades

- Control de un brazo robotico SO-101 (SOArm101) mediante aprendizaje por imitacion.
- Prediccion de chunks de acciones (no pasos individuales) para una tarea especifica ("pick up the boat").
- Entrada multimodal: observacion de estado (6 dims) y una imagen RGB de la camara laptop (480x640).
- Salida: accion de 6 dimensiones (posiciones de articulaciones o comandos de movimiento).
- No es un modelo de lenguaje: no realiza generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No es multilingue ni tiene capacidades de vision general (solo procesa la imagen especifica de la camara).

## Casos de uso

- **Prototipado rapido de politicas roboticas**: este modelo demuestra el flujo completo de entrenamiento y publicacion con LeRobot, util para desarrolladores que quieren probar el pipeline antes de entrenar con datos mas amplios.
- **Aprendizaje del framework LeRobot**: es un ejemplo practico de como crear un repositorio de modelo, cargar un dataset, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`.
- **Pruebas de integracion de hardware**: se puede usar para verificar que el robot SO-101 y las camaras estan configurados correctamente, aunque el modelo no tenga capacidad real de ejecutar la tarea.
- **Bases de experimentos academicos**: puede servir como punto de partida para estudiar el efecto del numero de episodios y pasos de entrenamiento en el rendimiento de ACT.
- **Depuracion de pipelines de datos**: al ser un modelo de prueba, es util para detectar errores en la recoleccion de datos, el formato de las observaciones o la sincronizacion de las camaras.
- **Educacion en robotica**: en cursos o talleres, este modelo permite que los estudiantes vean un ejemplo real de un modelo de imitacion sin tener que entrenar uno desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion: "No evaluation results have been provided for this policy yet." Por tanto, no se puede cuantificar su tasa de exito ni compararlo con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 51 millones de parametros, el peso del modelo en fp32 ocupa alrededor de 200 MB. Durante la inferencia, las activaciones y la entrada de imagen (480x640) pueden requerir entre 1 y 2 GB de VRAM, pero no hay datos oficiales.
- **GPU recomendada**: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060) es suficiente. No se requieren GPU de gama alta como A100 o H100.
- **Compatibilidad con GPU de consumo**: si, cabe en GPU de consumo de gama media y baja.
- **Opciones de despliegue**: se usa principalmente con el framework LeRobot. El comando `lerobot-rollout` permite ejecutar la politica en el robot real. Tambien se puede cargar el modelo con la libreria `lerobot` en Python para inferencia directa.
- **Latencia y throughput**: no se han publicado datos de latencia. En un hardware modesto, la inferencia de un transformer de 51M con una imagen de 480x640 deberia ser de decenas de milisegundos, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de politica ACT publicados con la misma arquitectura y tamano para el robot SO-101. Al ser un modelo de prueba, no existe una comparativa directa con alternativas de la misma categoria. Se puede mencionar que el metodo ACT se ha aplicado en otros robots (por ejemplo, ALOHA) con resultados publicados, pero no hay datos concretos de este modelo concreto.

## Limitaciones y advertencias

- **Entrenamiento insuficiente**: el modelo se entreno con solo 1 episodio y 2 pasos de entrenamiento. Es una prueba de concepto, no un modelo funcional. No se espera que ejecute correctamente la tarea en el robot real.
- **Sin evaluacion**: no se ha proporcionado ninguna evaluacion en el robot, por lo que no se conoce su tasa de exito ni su comportamiento real.
- **Tarea unica**: el modelo solo fue entrenado para la tarea "pick up the boat". No generaliza a otras tareas ni a variaciones del entorno.
- **Dependencia del entorno de entrenamiento**: el modelo fue entrenado con una unica imagen de camara (laptop) y un estado de 6 dimensiones. Si el entorno cambia (iluminacion, posicion de la camara, etc.), el rendimiento se degrada.
- **Licencia**: aunque la licencia es Apache-2.0 (permite uso comercial), al ser un modelo de prueba no se recomienda su uso en produccion.
- **Riesgo de alucinacion**: no aplica, ya que no es un modelo de texto. En robotica, el riesgo principal es que las acciones predichas pueden ser incorrectas o inseguras si se despliega sin validacion.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/b-sky-lab/so101_test_model)
- [Dataset de entrenamiento](https://huggingface.co/datasets/b-sky-lab/so101_test)
- [Articulo de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Documentacion de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Guia de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Repositorio de LeRobot en GitHub](https://github.com/huggingface/lerobot)
