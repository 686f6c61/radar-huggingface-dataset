# MakotoIto/act_pick_bead1

## Resumen

act_pick_bead1 es una política de robótica entrenada mediante aprendizaje por imitación con el método ACT (Action Chunking with Transformers) y publicada en HuggingFace por el usuario MakotoIto. No es un modelo de lenguaje: es un controlador visuomotor que, a partir de observaciones (imágenes de cámara y estado del robot), predice secuencias cortas de acciones articulares en lugar de un único paso. Está construido sobre LeRobot, la librería de HuggingFace para robótica de bajo coste.

El checkpoint tiene 51.668.614 parámetros y un repositorio de 0,2 GB en formato safetensors, lo que lo sitúa en la gama muy ligera: cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU. Se ha entrenado exclusivamente con el dataset MakotoIto/so101_pick_bead1_20260919_221137, asociado a tareas de manipulación sobre un robot de tipo SO-100/SO-101, y la propia model card sugiere el uso del brazo esclavo so100_follower para la evaluación.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de entrenamiento ACT dentro del ecosistema LeRobot, como base para fine-tuning en tareas de pick-and-place similares y como referencia para investigadores que quieran replicar el pipeline. La model card es mínima: no documenta composición del dataset, hiperparámetros, resultados de evaluación ni ventana de observación, y el repositorio no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con componente CVAE, según el artículo arXiv:2304.13705 |
| Parametros totales | 51.668.614 |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. Procesa observaciones (imagen y estado) y produce chunks de acciones |
| Tipos de cuantizacion | no disponible; el repositorio no documenta variantes cuantizadas |
| Idiomas soportados | no disponible; no procesa lenguaje natural |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tarea (pipeline) | robotics |
| Dataset de entrenamiento | MakotoIto/so101_pick_bead1_20260919_221137 |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE). El modelo observa el estado del robot junto con imágenes de cámara, codifica esa observación y decodifica un "chunk" de acciones futuras en lugar de predecir acción a acción. Este diseño reduce el problema de horizonte de decisión y mitiga la acumulación de errores típica de las políticas paso a paso, tal y como se describe en el artículo Action Chunking with Transformers (arXiv:2304.13705) referenciado en las etiquetas del repositorio.

El entrenamiento se ha realizado con LeRobot a partir de datos de teleoperación. La model card incluye el comando `lerobot-train` con `--policy.type=act` y `--policy.device=cuda`, y propone `lerobot-record` con `--robot.type=so100_follower` y `--policy.path` para la evaluación. No se especifican el número de tokens o de episodios, la composición exacta del dataset, la resolución de las cámaras ni si hubo etapas de ajuste adicionales; esa información no está disponible en el material consultado.

## Capacidades

- Control visuomotor por imitación: genera comandos de acción continua para un brazo robótico a partir de observaciones sensoriales.
- Predicción de chunks de acciones: emite varias acciones por inferencia, lo que proporciona un control más suave y estable que las políticas de un solo paso.
- Ejecución de la tarea "pick_bead1": recogida de piezas de tipo bead, según el nombre del modelo y del dataset.
- Aprendizaje desde teleoperación: la política se ha entrenado con demostraciones humanas, no con recompensas ni refuerzo.
- Integración con el ecosistema LeRobot: carga, entrenamiento y evaluación mediante los comandos `lerobot-train` y `lerobot-record`.
- Compatibilidad declarada con robots de la familia SO-100/SO-101, incluido el `so100_follower` que aparece en el ejemplo de evaluación.
- No dispone de tool calling, function calling, razonamiento multi-paso en lenguaje natural, capacidades multilingües, visión general, audio ni modo "thinking"; no es un modelo de propósito general.

## Casos de uso

- Automatización de pick-and-place de piezas pequeñas: la política está entrenada para recoger beads sobre un robot SO-101; puede emplearse como controlador directo en una celda que repita esa tarea con la misma disposición de cámara y utillaje.
- Base para fine-tuning en tareas de manipulación similares: al ser un checkpoint ACT de 51,6 M de parámetros con licencia Apache 2.0, se puede reentrenar con un dataset propio de otra tarea de agarre y reutilizar la arquitectura.
- Referencia reproducible del pipeline LeRobot: sirve para validar una instalación de LeRobot de principio a fin, comparando el flujo `lerobot-train` con `lerobot-record` sobre datos propios.
- Investigación en aprendizaje por imitación: útil como baseline ligero frente a políticas basadas en difusión o modelos visión-lenguaje-acción en experimentos académicos con presupuesto de cómputo reducido.
- Docencia y robótica de bajo coste: su tamaño permite ejecutar inferencia en una estación de trabajo con CPU o una GPU modesta, lo que facilita prácticas de laboratorio sobre brazos SO-100.
- Recogida de datos para escalado: puede usarse como política inicial en un bucle de teleoperación o de evaluación para generar episodios adicionales etiquetados.
- Pruebas de integración hardware-software: el comando de evaluación incluido en la model card permite comprobar la comunicación con el brazo esclavo y las cámaras antes de desplegar políticas más grandes.
- Evaluación comparativa de métodos de chunking: permite medir si el troceado de acciones mejora la estabilidad frente a políticas paso a paso en un mismo montaje físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, numero de episodios de evaluacion ni comparaciones con otras politicas. El articulo referenciado (arXiv:2304.13705) reporta sus propios resultados en los montajes originales de los autores, pero esos valores no corresponden a este checkpoint y no se dispone de ellos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en precision de 32 bits. Los 51.668.614 parametros ocupan aproximadamente 207 MB en float32, mas el coste de los buffers de las camaras y del encoder visual.
- GPU recomendadas: cualquier GPU con CUDA, incluidas NVIDIA GTX 1060, RTX 2060, RTX 3060, RTX 4090, A100 o H100. No necesita memoria ni calculo de gama alta.
- GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo actual, e incluso en iGPU o CPU para inferencia puntual.
- Opciones de despliegue: LeRobot sobre PyTorch es la via documentada (`lerobot-train` para entrenar y `lerobot-record` para evaluar). vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Requisitos adicionales: brazo robotico de la familia SO-100/SO-101, camaras para las observaciones y el entorno de control correspondiente. Sin hardware fisico solo puede ejecutarse la parte de carga del checkpoint.
- Latencia y throughput: no disponible. La model card no publica mediciones de frecuencia de control ni tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| act_pick_bead1 (este checkpoint) | ACT: transformer con CVAE, prediccion de chunks de acciones, aprendizaje por imitacion | 51.668.614 | apache-2.0 | HuggingFace, libreria LeRobot |
| Diffusion Policy (Chi et al.) | Politica visuomotora basada en modelos de difusion | no disponible | no disponible | no disponible en la informacion consultada |
| Otras politicas ACT publicadas en LeRobot | ACT con distinto dataset o configuracion | no disponible | no disponible | no disponible en la informacion consultada |

La busqueda web realizada no devolvio resultados tecnicos utilizables: los enlaces recuperados no guardan relacion con el modelo. Por tanto, no es posible establecer una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta la distribucion del dataset de teleoperacion ni la diversidad de posiciones, iluminacion o configuracion de camaras.
- Sobreajuste a la tarea: el modelo esta entrenado para una unica tarea ("pick_bead1") sobre un montaje concreto; es previsible un rendimiento pobre fuera de esa distribucion, aunque no hay evaluaciones publicadas que lo confirmen.
- Riesgo de fallo silencioso: al ser una politica de imitacion, puede producir acciones plausibles pero incorrectas cuando la observacion se aleja de lo visto en entrenamiento. No existe mecanismo de abstención ni de deteccion de incertidumbre.
- Alucinacion: no aplica en el sentido de generacion de texto, pero si en el sentido de generalizacion erronea del comportamiento aprendido.
- Limitaciones de contexto o idioma: no procede para texto; la limitacion real es la ventana de observacion y el horizonte de chunk, cuyos valores no estan documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. No se declaran restricciones adicionales.
- Ausencia de validacion externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que terceros hayan reproducido el entrenamiento o la evaluacion.
- Falta de documentacion: no se publican hiperparametros, numero de episodios, resolucion de imagen, frecuencia de control ni protocolo de evaluacion, lo que dificulta auditar el modelo.
- Seguridad fisica: cualquier despliegue sobre un brazo real debe incorporar limites de par, paradas de emergencia y supervision humana, dado que la politica no incluye garantias de seguridad.
- Fecha de creacion: el repositorio esta fechado en 2026-09-19; conviene verificar si se ha actualizado o reemplazado antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MakotoIto/act_pick_bead1
- Dataset de entrenamiento: https://huggingface.co/datasets/MakotoIto/so101_pick_bead1_20260919_221137
- Articulo de ACT: https://arxiv.org/abs/2304.13705
- Pagina del articulo en HuggingFace: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
