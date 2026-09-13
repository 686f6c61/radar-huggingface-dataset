# Kaz55/dp-bluev2-rs500-h64-100k

## Resumen

Kaz55/dp-bluev2-rs500-h64-100k es un checkpoint de una politica de imitacion para robotica basada en Diffusion Policy, entrenada con la libreria LeRobot. El modelo no es un modelo de lenguaje: aprende a generar secuencias de acciones para un brazo UR5e equipado con pinza DG5F y sensores tactiles GelSight, a partir de observaciones visuales y de estado. Resuelve el problema clasico de la manipulacion visomotora: convertir observaciones de alta dimensionalidad (cuatro camaras mas un vector de estado) en comandos de control continuos y coherentes durante varios pasos.

El checkpoint corresponde al paso 100.000 de un entrenamiento planificado de 200.000 pasos, con batch 8 y semilla 1000, sobre el dataset Kaz55/dg5f_ur5e_bluev2_rs500 (90 episodios, 101.406 fotogramas). La configuracion de difusion usa un horizonte de prediccion de 64 acciones y ejecuta 60 por llamada de inferencia. El modelo tiene 308.812.570 parametros y un repositorio de 1,2 GB en formato safetensors.

Su relevancia es doble. Por un lado, forma parte de un barrido sistematico de checkpoints (50k, 100k, 150k, 200k) que permite estudiar como evoluciona una politica de difusion con el numero de pasos de entrenamiento. Por otro, documenta un detalle practico poco visible: la implementacion de Diffusion Policy en LeRobot exige que todas las camaras compartan resolucion, lo que obliga a reescalar las RealSense de 640x480 a 500x375 para que coincidan con las GelSight. Se trata de un modelo de investigacion, con 0 descargas y sin licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (DDPM condicional) sobre un U-Net temporal 1-D que predice chunks de acciones; no es un transformer de lenguaje |
| Parametros totales | 308.812.570 (~308,8 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: el condicionamiento combina 4 camaras y un vector de estado de 26 dimensiones, con horizonte de prediccion de 64 acciones) |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors en la precision nativa del entrenamiento; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (no aplica: el modelo no procesa lenguaje) |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (libreria lerobot) |
| Entradas (observaciones) | observation.state (26 dimensiones) + 2 camaras RealSense + 2 sensores GelSight, todas a 500x375 |
| Salidas | chunk de 64 acciones; 60 de ellas se ejecutan por inferencia (n_action_steps=60) |
| Robot / entorno | UR5e con pinza DG5F y sensores tactiles GelSight |
| Pasos de entrenamiento | 100.000 de 200.000 (batch 8, semilla 1000, ~7,9 epochs sobre 101.406 fotogramas) |
| Tamano del repositorio | 1,2 GB |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy: un proceso de difusion denoising condicional que aprende la distribucion de secuencias de acciones en lugar de una unica accion. La red es un U-Net temporal 1-D que opera sobre el chunk de acciones; la model card confirma esta topologia al justificar que el horizonte debe ser multiplo de 8 porque el U-Net aplica downsampling por factor 2 en tres ocasiones. Las observaciones (cuatro flujos de imagen a 500x375 mas un vector de estado de 26 dimensiones) actuan como condicionamiento del proceso de denoising. Los detalles del codificador visual, el numero de canales, la profundidad del U-Net y el calendario de ruido no estan documentados en la informacion disponible.

El entrenamiento se detuvo en el paso 100.000 de los 200.000 previstos, con batch 8 y semilla 1000. El dataset consta de 90 episodios y 101.406 fotogramas capturados en el montaje dg5f_ur5e_bluev2_rs500, una variante en la que las dos RealSense se reescalaron a 500x375 para satisfacer la validacion de LeRobot, que rechaza configuraciones con camaras de resoluciones distintas. Las variables observation.velocity y observation.effort se excluyeron de forma deliberada, en coherencia con el resto de ejecuciones del mismo barrido. No se documentan optimizador, tasa de aprendizaje, aumentos de datos ni uso de RLHF/DPO, terminos que ademas no aplican a este tipo de politica.

Sobre la funcion de perdida, la model card incluye una advertencia metodologica relevante: la perdida de difusion es el error cuadratico medio del ruido predicho, mientras que la perdida de ACT es un error L1 sobre acciones, por lo que no son comparables entre si. El autor recomienda comparar checkpoints de difusion unicamente entre ellos y seleccionar la politica mediante evaluacion sobre el robot real.

## Capacidades

- Generacion de chunks de acciones continuas para control visomotor de un brazo UR5e con pinza DG5F, con 64 acciones predichas por inferencia y 60 ejecutadas.
- Fusion multimodal de cuatro camaras (dos RealSense de vista externa y dos GelSight de contacto) con un vector de estado de 26 dimensiones.
- Percepcion tactil mediante los sensores GelSight, lo que permite tareas que requieren detectar contacto, deslizamiento o deformacion.
- Ejecucion de politicas de horizonte corto en bucle abierto: 60 acciones por cada pase de inferencia.
- Aprendizaje por imitacion a partir de demostraciones humanas (90 episodios), sin recompensa explicita ni entorno simulado declarado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbolico ni generacion de texto: son capacidades fuera del alcance de una politica de difusion.
- No dispone de modo thinking, vision-lenguaje ni procesamiento de audio.

## Casos de uso

- Manipulacion robotica de laboratorio: el checkpoint puede desplegarse sobre un UR5e con el mismo montaje de sensores para ejecutar la tarea demostrada en el dataset, sirviendo como linea base reproducible frente a otros checkpoints del barrido.
- Estudios de escalado de entrenamiento en politicas de difusion: comparar este checkpoint de 100k pasos con los de 50k, 150k y 200k permite medir como evoluciona el error de difusion y el exito en robot con los pasos de entrenamiento.
- Investigacion en percepcion tactil: al depender de dos GelSight, es adecuado para experimentos que analicen cuanto aporta la senal tactil frente a la puramente visual, comparando con ejecuciones que no usan tacto.
- Benchmarking interno de arquitecturas de imitacion: el autor mantiene ejecuciones paralelas con ACT de 60 acciones, de modo que este checkpoint sirve para contrastar difusion frente a action chunking bajo el mismo dataset y montaje.
- Prototipado de politicas con horizonte largo: el horizonte de 64 acciones reduce la frecuencia de inferencia necesaria, lo que resulta util en plataformas de control donde el coste de una llamada al modelo es alto.
- Reproducibilidad de pipelines LeRobot: el repositorio documenta la restriccion de resolucion homogenea entre camaras, por lo que el checkpoint es util como ejemplo de configuracion valida para entrenar difusion con cuatro camaras.
- Fine-tuning sobre tareas nuevas: al ser un checkpoint intermedio con pesos safetensors y cargable con LeRobot, puede servir de inicializacion para tareas de manipulacion con el mismo robot y un montaje de camaras equivalente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, curvas de perdida ni comparaciones cuantitativas frente a otros checkpoints o arquitecturas; solo advierte de que la perdida de difusion (MSE del ruido predicho) y la de ACT (L1 sobre acciones) no son comparables, y que la eleccion de politica debe hacerse mediante evaluacion sobre el robot real.

| Aspecto | Resultado publicado |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplica (no es un modelo de lenguaje) |
| Tasa de exito en robot | no disponible |
| Curva de perdida de difusion | no disponible |
| Comparacion con ACT ac60 | no disponible (el autor solo indica que las perdidas no son comparables) |

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del recuento de parametros; el autor no publica requisitos): alrededor de 1,3 GB solo para pesos en fp32 y unos 0,6 GB en fp16, mas las activaciones derivadas de procesar cuatro imagenes de 500x375 y el U-Net temporal. En la practica, un presupuesto de 2 a 4 GB es razonable, aunque no esta confirmado.
- GPU recomendadas: no disponible en la informacion del autor. Por tamano, el modelo es holgadamente ejecutable en GPUs profesionales como A100, H100, L40S o A10G, y tambien en GPUs de consumo.
- Cabe en GPU de consumo: si, con margen amplio. Cualquier GPU con 8 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, entre otras) deberia poder ejecutar la inferencia; el factor limitante no es la VRAM sino la latencia del bucle de control.
- Opciones de despliegue: LeRobot (carga y evaluacion de politicas) sobre PyTorch. vLLM, llama.cpp, Ollama y TGI no aplican, ya que estan orientados a modelos de lenguaje y no soportan politicas de difusion.
- Latencia y throughput: no disponible. La configuracion n_action_steps=60 implica que cada inferencia cubre 60 pasos de control, lo que relaja los requisitos de latencia respecto a politicas que infieren en cada paso.
- Nota: los cuatro flujos de camara a 500x375 y el uso de sensores GelSight condicionan el coste real de inferencia mas que el propio numero de parametros.

## Comparativa con modelos similares

| Modelo | Parametros | Horizonte / acciones ejecutadas | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dp-bluev2-rs500-h64-100k (este) | 308,8 M | 64 / 60 | 100k de 200k pasos, batch 8, semilla 1000 | no disponible | HuggingFace (0 descargas) |
| dp-bluev2-rs500-h64-50k | mismo diseno | 64 / 60 | 50k pasos | no disponible | HuggingFace |
| dp-bluev2-rs500-h64-150k | mismo diseno | 64 / 60 | 150k pasos | no disponible | HuggingFace |
| dp-bluev2-rs500-h64-200k | mismo diseno | 64 / 60 | 200k pasos | no disponible | HuggingFace |
| ACT ac60 (barrido del mismo autor) | no disponible | 60 acciones | mismo dataset | no disponible | no disponible |
| Diffusion Policy original (Chi et al.) | no disponible | no disponible | no disponible | no disponible | paper y codigo publicos |

Los cuatro checkpoints de difusion comparten arquitectura, dataset y configuracion, por lo que la unica variable es el numero de pasos de entrenamiento. No hay datos de rendimiento publicados para ninguno de ellos, de modo que la comparativa cuantitativa no es posible sin evaluacion sobre el robot.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica condiciones de uso, lo que impide determinar si se permite el uso comercial. Cualquier despliegue en produccion requiere aclarar este punto con el autor.
- Modelo de investigacion sin validacion publica: 0 descargas, 2 likes y ninguna tasa de exito reportada. No hay evidencia publica de que la politica funcione de forma fiable fuera del montaje del autor.
- Especificidad de embodiment: esta entrenado para un UR5e con pinza DG5F y dos GelSight. No es transferible a otros robots, pinzas ni configuraciones de sensores sin reentrenamiento o fine-tuning.
- Dependencia estricta del montaje de camaras: requiere exactamente dos RealSense y dos GelSight a 500x375. LeRobot rechaza configuraciones con resoluciones heterogeneas, por lo que replicar el montaje es un requisito, no una recomendacion.
- Rigidez de la entrada de estado: el vector observation.state de 26 dimensiones y la exclusion explicita de velocity y effort implican que el pipeline de observaciones debe reproducirse tal cual.
- Riesgo de sobreajuste y de cambio de distribucion: 90 episodios y 101.406 fotogramas son un volumen reducido; es esperable un deterioro del rendimiento ante iluminacion, posiciones de objeto o texturas distintas de las demostradas.
- Desajuste entre horizonte y acciones ejecutadas: se predicen 64 acciones pero se ejecutan 60, de modo que las 4 ultimas se descartan en cada llamada.
- Perdida no interpretable como metrica de calidad: el MSE del ruido predicho no es comparable con el L1 de ACT ni se traduce directamente en tasa de exito. El autor recomienda elegir checkpoint mediante evaluacion en robot.
- Checkpoint intermedio: corresponde al 50% del entrenamiento planificado, por lo que no representa la version convergida del barrido.
- Alucinacion: el concepto no aplica a una politica de acciones, pero si existe el riesgo equivalente de generar trayectorias fisicamente invalidas o inseguras ante entradas fuera de distribucion.
- Idiomas: no aplica, el modelo no procesa lenguaje; no hay capacidades multilingues.
- Fechas del repositorio: la model card indica creacion y actualizacion el 2026-09-13, una fecha anomala que conviene verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kaz55/dp-bluev2-rs500-h64-100k
- Dataset de entrenamiento: https://huggingface.co/datasets/Kaz55/dg5f_ur5e_bluev2_rs500
- Checkpoints del mismo barrido: dp-bluev2-rs500-h64-50k, dp-bluev2-rs500-h64-150k y dp-bluev2-rs500-h64-200k (referenciados en la model card; no se proporcionan URL directas)
- Referencia del metodo base, Diffusion Policy (Chi et al.): https://arxiv.org/abs/2303.04137 (enlace externo, no citado desde la model card)
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre LeRobot: los unicos resultados obtenidos correspondian a tiendas de moda sin relacion con el contenido de la ficha.
