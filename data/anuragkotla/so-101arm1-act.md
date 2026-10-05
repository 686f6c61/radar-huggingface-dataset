# AnuragKotla/so-101arm1-act

## Resumen

AnuragKotla/so-101arm1-act es una política robótica de imitación entrenada con el método ACT (Action Chunking with Transformers) y publicada en Hugging Face por el usuario AnuragKotla. No es un modelo de lenguaje: es un controlador neuronal que, a partir de observaciones visuales y del estado del robot, predice secuencias de acciones (chunks) para que un brazo robótico SO-101 ejecute tareas de manipulación. Se ha entrenado y exportado con la librería LeRobot de Hugging Face y está asociado al dataset AnuragKotla/so-101arm1.

El checkpoint contiene 51.617.414 parámetros reales (según los pesos en safetensors) y el repositorio ocupa aproximadamente 0,2 GB, por lo que es un modelo muy ligero que cabe sin problema en hardware de consumo. El método ACT está descrito en el artículo arXiv:2304.13705, que introduce el troceado de acciones (action chunking) para mejorar la estabilidad y la tasa de éxito en tareas de manipulación de precisión con hardware de bajo coste.

Su relevancia es acotada y experimental: se trata de una política concreta para un brazo SO-101, con cero descargas y cero valoraciones en el momento de redactar esta ficha, sin resultados de evaluación publicados. Es útil como ejemplo reproducible del flujo de trabajo de LeRobot (grabación de teleoperación, entrenamiento y evaluación) más que como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), metodo de imitacion basado en transformer con codificador visual tipo ResNet (segun el articulo de referencia arXiv:2304.13705) |
| Parametros totales | 51.617.414 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: es una politica robotica de manipulacion, no un modelo de lenguaje. Tamano de chunk de acciones no documentado en la model card |
| Tipos de cuantizacion | No disponible (pesos distribuidos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo de robotica, sin interfaz de lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el metodo ACT descrito en el articulo *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705). ACT es un metodo de aprendizaje por imitacion que predice trozos de acciones (chunks) en lugar de un unico paso por inferencia; combina un codificador visual (backbone convolucional tipo ResNet) con un transformer encoder-decoder y un componente generativo condicional (CVAE) que modela la variabilidad de las demostraciones. Esta formulacion reduce el error de acumulacion y la varianza temporal, lo que permite tasas de exito altas con hardware de bajo coste. Los detalles exactos de configuracion de este checkpoint concreto (numero de capas, dimensiones, tamano de chunk, resolucion de entrada) no estan documentados en la model card.

El entrenamiento se ha realizado con LeRobot sobre el dataset AnuragKotla/so-101arm1, que consta de 11 episodios grabados a 30 fps con 2 camaras de 1280x720 (datos tabulares, de series temporales y de video en formato parquet). El flujo documentado por el autor es `lerobot-train --policy.type=act` para entrenar desde cero y `lerobot-record` para la evaluacion con el robot `so100_follower`. No se documenta el numero total de tokens/pasos de entrenamiento, la composicion del dataset mas alla de lo indicado, ni si se aplico RLHF o DPO (tecnicas que, por otra parte, no son propias de este tipo de politica).

## Capacidades

- Control de manipulacion robotica: genera secuencias de acciones (action chunks) para un brazo SO-101 a partir de observaciones visuales y de estado.
- Aprendizaje por imitacion: reproduce tareas demostradas mediante teleoperacion.
- Entrada multimodal de robotica: procesa imagenes de camaras (el dataset asociado registra 2 camaras a 1280x720 y 30 fps) junto con el estado del robot.
- Integracion con el ecosistema LeRobot: entrenamiento, evaluacion y despliegue mediante los comandos `lerobot-train` y `lerobot-record`.
- No dispone de generacion de texto, razonamiento simbolico, codigo ni matematicas: no es un modelo de lenguaje.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de agentes de lenguaje.
- No se documentan capacidades multilingues ni modos especiales (thinking, vision-lenguaje, audio) mas alla del procesamiento visual propio de ACT.

## Casos de uso

- Reproduccion de experimentos de aprendizaje por imitacion: sirve como ejemplo de referencia para entrenar una politica ACT con LeRobot sobre un brazo SO-101 y comparar configuraciones de entrenamiento.
- Automatizacion de tareas pick-and-place: el modelo puede ejecutar recogida y colocacion de objetos tras ser entrenado con demostraciones de esa tarea, aprovechando el troceado de acciones para mayor estabilidad.
- Docencia y formacion en robotica: adecuado para cursos practicos de manipulacion robotica de bajo coste, como los que se apoyan en el armado del SO-101 y el entrenamiento con LeRobot.
- Prototipado rapido de politicas de manipulacion: al ser un modelo de ~52 M de parametros, permite iterar en un equipo de sobremesa sin clúster de GPU.
- Tareas de vertido o manipulacion de precision: en la linea de otros modelos ACT para SO-101 orientados a tareas concretas como verter agua.
- Base para experimentos comparativos entre metodos de imitacion (ACT frente a otras politicas de LeRobot) sobre el mismo robot y dataset.
- Evaluacion de la transferencia sim-a-real o real-a-real en laboratorio, dado el bajo requisito de hardware para la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 M de parametros, aproximadamente 206 MB en FP32, unos 103 MB en FP16/BF16 y unos 52 MB en INT8, mas el coste de activaciones del codificador visual.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090, RTX 3090 o incluso GPUs de gama media (RTX 3060) cubren con holgura la inferencia.
- Cabe en GPU de consumo: si, sin restricciones relevantes por tamano; tambien es viable en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: el flujo nativo es LeRobot (`lerobot-record --policy.path=...`) sobre PyTorch. No es aplicable vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones; dependen del hardware, la resolucion de las camaras y el tamano de chunk).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AnuragKotla/so-101arm1-act | 51,6 M | No aplica (politica robotica) | Sin benchmarks publicados | apache-2.0 | Hugging Face, 0 descargas |
| jian001/act_so101_test_model | No disponible | No aplica | No disponible | No disponible | Hugging Face |
| PhysAI-Hack2026-ACT-pouring-model (jjchong5) | No disponible | No aplica | No disponible | No disponible | GitHub (repositorio de hackathon) |

Los tres son politicas ACT para el brazo SO-101 entrenadas con LeRobot y no existe informacion publica de rendimiento comparable. La comparacion cuantitativa no es posible con los datos disponibles.

## Limitaciones y advertencias

- Riesgo de sobreajuste y baja generalizacion: el dataset asociado contiene solo 11 episodios, una cantidad muy reducida para aprendizaje por imitacion, lo que limita la robustez ante variaciones de iluminacion, posicion de objetos o fondo.
- Sensibilidad al cambio de dominio: al ser una politica de imitacion, no esta documentada su transferencia a robots, camaras o entornos distintos de los de la grabacion.
- Sin evaluacion publicada: no hay benchmarks, tasas de exito ni validacion independiente, y el modelo registra 0 descargas y 0 valoraciones, por lo que su calidad no esta contrastada.
- Documentacion incompleta: la model card no detalla configuracion de arquitectura, hiperparametros, tamano de chunk ni condiciones de entrenamiento.
- No es un modelo de lenguaje: carece de capacidades de texto, razonamiento general, codigo o tool calling; no debe usarse fuera de su proposito de control robotico.
- Licencia apache-2.0: permite uso comercial del modelo, pero conviene verificar las licencias de las dependencias (LeRobot) y del dataset asociado antes de un despliegue en produccion.
- Fecha de publicacion registrada (2026-10-04) poco habitual; conviene confirmar la vigencia del repositorio antes de reutilizarlo.
- Para uso en produccion seria necesario un reentrenamiento con un dataset mayor y una evaluacion sistematica de tasas de exito en el entorno real de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnuragKotla/so-101arm1-act
- Dataset asociado: https://huggingface.co/datasets/AnuragKotla/so-101arm1
- Articulo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas de imitacion en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de entrenamiento SO101 con ACT y SOLO CLI: https://github.com/omkarputti/SO101_ACT_Training
- Modelo ACT de vertido (PhysAI Hackathon 2026): https://github.com/jjchong5/PhysAI-Hack2026-ACT-pouring-model
- Modelo ACT alternativo para SO-101: https://huggingface.co/jian001/act_so101_test_model
- Curso de entrenamiento de brazo robotico con LeRobot y SO-101: https://completeaitraining.com/course/train-a-no-code-ai-robotic-arm-with-lerobot-and-so-101/
