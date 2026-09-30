# Deviant65/act_so101_redcube_batch32_kl5

## Resumen

`Deviant65/act_so101_redcube_batch32_kl5` es una politica de aprendizaje por imitacion para robotica entrenada con el metodo ACT (Action Chunking with Transformers), publicado en el articulo arXiv:2304.13705 ("Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"). No es un modelo de lenguaje: es un controlador visomotor que transforma observaciones del robot (estado de las articulaciones e imagenes de camara) en comandos de accion de 6 grados de libertad. Lo desarrolla el usuario Deviant65 y se distribuye a traves del ecosistema LeRobot de Hugging Face.

El modelo resuelve una tarea concreta de manipulacion: "Pick up the red block and place it in the brown box" (coger el bloque rojo y colocarlo en la caja marron) sobre un brazo robotico SO-101 en configuracion `so_follower`. Se entreno a partir de 63 episodios de teleoperacion (53.428 fotogramas a 30 FPS) capturados con dos camaras (`front` y `top`) y retroalimentacion de posicion de 6 articulaciones.

Su relevancia es practica: demuestra un flujo completo de entrenamiento de politicas en hardware de bajo coste (brazo SO-101) con un modelo compacto de 51.668.614 parametros (unos 51,7 millones), licencia Apache 2.0 y formato safetensors, lo que lo hace apto para replicarse en laboratorios y proyectos de robotica con presupuesto reducido. El sufijo `kl5` del nombre del repositorio indica un peso de divergencia KL de 5 en la componente CVAE, y `batch32` el tamano de lote empleado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con CVAE para aprendizaje por imitacion |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; predice trozos de acciones futuras) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; se ejecuta en precision completa/mixta via PyTorch) |
| Idiomas soportados | no disponible (politica robotica; sin entrada o salida de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Datos de entrada y salida declarados en la model card:

| Tipo | Nombre | Forma |
|---|---|---|
| Entrada (estado) | `observation.state` | `(6,)` |
| Entrada (visual) | `observation.images.front` | `(3, 480, 640)` |
| Entrada (visual) | `observation.images.top` | `(3, 480, 640)` |
| Salida | `action` | `(6,)` |

## Arquitectura y entrenamiento

ACT combina una componente de autoencoder variacional condicional (CVAE) con un transformer encoder-decoder. Las imagenes de las dos camaras se procesan con un backbone convolucional, se concatenan con el estado de las articulaciones y se pasan por el transformer. La salida no es una unica accion, sino un "chunk" de varias acciones futuras, lo que aporta coherencia temporal y reduce el error acumulado. En inferencia se aplica por lo general un ensamblado temporal (temporal ensembling) que promedia predicciones solapadas de chunks consecutivos.

El entrenamiento se realizo con LeRobot 0.6.2 a partir del dataset `Deviant65/so101_redcube_20260925_154203`, con las siguientes caracteristicas: 63 episodios, 53.428 fotogramas a 30 FPS y una unica tarea. La configuracion reportada es de 100.000 pasos, lote de 32, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. La componente CVAE usa un peso de divergencia KL de 5 (segun el sufijo del nombre del repositorio); no se documenta el uso de RLHF ni DPO, algo coherente con un metodo de aprendizaje por imitacion supervisado. No se detalla el numero de tokens, la composicion del dataset mas alla de la tarea ni innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de acciones de control de 6 grados de libertad para el brazo SO-101 (`so_follower`).
- Percepcion visomotora a partir de dos flujos de imagen (`front` y `top`) a 480x640 y 30 FPS.
- Prediccion de trozos de acciones (action chunking), en lugar de pasos individuales, para maniobras mas suaves y coherentes.
- Ejecucion de una tarea especifica de pick-and-place: coger un bloque rojo y depositarlo en una caja marron.
- Aprendizaje por imitacion a partir de datos de teleoperacion, sin necesidad de recompensas explicitas.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso simbolico, ni capacidades multilingues.
- No incorpora modo "thinking", vision-lenguaje, audio ni generacion de texto.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: coger un objeto y colocarlo en un contenedor concreto; es el escenario exacto para el que se entreno el modelo, sobre un brazo SO-101.
- Prototipado de politicas de robotica de bajo coste: sirve como punto de partida para validar el pipeline completo de LeRobot (grabacion, entrenamiento, rollout) en hardware accesible.
- Docencia e investigacion en aprendizaje por imitacion: al ser un modelo pequeno (51,7 M de parametros) y con licencia Apache 2.0, es util para estudiar ACT, el efecto del peso KL o del tamano de lote en resultados reales.
- Automatizacion de tareas repetitivas de clasificacion de piezas: con el dataset adecuado, la misma receta ACT se puede reutilizar para separar o apilar objetos por color o posicion.
- Base para experimentos de generalizacion: permite evaluar como se comporta una politica visomotora ante cambios de iluminacion, posicion de objetos o distractores respecto a las condiciones de entrenamiento.
- Integracion en lineas de montaje educativas o demostradores: al ejecutarse en CPU o GPU de gama baja, se puede desplegar en estaciones de trabajo modestas para demostraciones en vivo.
- Punto de partida para destilacion o comparacion con politicas mas grandes: util como referencia compacta frente a enfoques como Diffusion Policy o VLA para medir el coste de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una seccion de evaluacion sin rellenar, con la indicacion expresa "_No evaluation results have been provided for this policy yet._". Por tanto, no hay tasas de exito en robot real, ni resultados de MMLU, HumanEval, GSM8K ni equivalentes (no aplicables a una politica robotica). No se deben inferir cifras de exito a partir de la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 51,7 M de parametros, los pesos ocupan aproximadamente 0,2 GB en fp32 y unos 0,1 GB en fp16; sumando activaciones del backbone visual y dos imagenes de 480x640, el consumo tipico se situa en el orden de 1 a 3 GB.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM es suficiente; una NVIDIA RTX 3060 o superior ofrece margen amplio. Para entrenamiento, una RTX 4090, A100 o H100 aceleran notablemente los 100.000 pasos, pero no son imprescindibles.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en portatiles con graficos integrados para inferencia. Tambien puede ejecutarse en CPU.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout` segun la model card), PyTorch como backend; el modelo se carga mediante `policy.path=Deviant65/act_so101_redcube_batch32_kl5`. No se documentan exportaciones a vLLM, Ollama, TGI ni llama.cpp (no aplicables a este tipo de politica).
- Latencia y throughput estimados: no disponibles. No se proporcionan mediciones de frecuencia de control efectiva ni tiempos de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados para este modelo ni para sus alternativas directas dentro de la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Deviant65/act_so101_redcube_batch32_kl5` | ACT (politica robotica) | 51,7 M | estado (6,) + 2 imagenes 480x640 | apache-2.0 | Hugging Face |
| `Deviant65/act_so101_redcube_batch32` | ACT (politica robotica) | no disponible | misma configuracion SO-101 | apache-2.0 | Hugging Face |
| ACT original (Zhao et al., 2023, arXiv:2304.13705) | ACT (politica robotica) | no disponible | bimanual ALOHA | no disponible | paper / codigo |
| Diffusion Policy | politica por difusion | no disponible | vision + estado | no disponible | codigo / paper |

Las cifras de parametros y contexto de los modelos alternativos no estan disponibles en la informacion recopilada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Tarea extremadamente especifica: la politica esta entrenada unicamente para "coger el bloque rojo y colocarlo en la caja marron". Fuera de esa tarea y de esa configuracion de camaras, el comportamiento no esta garantizado.
- Sin resultados de evaluacion: no se han publicado tasas de exito en robot real, por lo que se desconoce su fiabilidad efectiva.
- Sensibilidad al entorno: al depender de dos camaras concretas (`front`, `top`) y de una disposicion fisica concreta, cambios de iluminacion, posicion de objetos o montaje romperan facilmente la politica.
- Sin capacidades de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento textual; no es adecuado para tareas conversacionales o de agentes.
- Riesgo de sobreajuste: con solo 63 episodios y una unica tarea, la generalizacion a variaciones de objeto o posicion es limitada. El modelo puede fallar ante objetos o colores no vistos.
- Riesgo de alucinacion en el sentido de acciones incoherentes: al ser un controlador, puede generar trayectorias impredecibles ante entradas fuera de distribucion, con riesgo fisico si se ejecuta en un robot real.
- Comportamiento dependiente de la receta de entrenamiento: el nombre del repositorio indica un peso KL de 5 y lote de 32; reproducir el modelo con otros hiperparametros puede dar resultados distintos.
- Licencia Apache 2.0: permite uso comercial, pero no se ofrecen garantias de seguridad ni de idoneidad para produccion. La responsabilidad del despliegue fisico recae en el integrador.
- Datos de entrenamiento no auditados: no se detalla la composicion del dataset mas alla de la tarea, por lo que no se pueden evaluar sesgos de recoleccion (por ejemplo, condiciones de luz o posiciones sobrerrepresentadas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Deviant65/act_so101_redcube_batch32_kl5
- Modelo relacionado (mismo autor): https://huggingface.co/Deviant65/act_so101_redcube_batch32
- Dataset de entrenamiento: https://huggingface.co/datasets/Deviant65/so101_redcube_20260925_154203
- Dataset relacionado: https://huggingface.co/datasets/Deviant65/so101_redcube_20260925_151937/tree/main
- Articulo ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Deviant65/so101_redcube_20260925_154203
- SO-ARM100 / SO101 (The Robot Studio): https://github.com/TheRobotStudio/SO-ARM100/blob/main/Simulation/SO101/README.md
- Tutorial sim-to-real de NVIDIA con SO-101: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/index.html
- Repositorio de ejemplo lerobot-so101: https://github.com/jyang-ca/lerobot-so101
