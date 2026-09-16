# Chaenn/act_policy_so101_cube_sim_place_1000_dirty300_0908

## Resumen

`Chaenn/act_policy_so101_cube_sim_place_1000_dirty300_0908` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT) y distribuida a través de la librería LeRobot de Hugging Face. El autor es el usuario Chaenn y el modelo resuelve una tarea concreta de manipulación: coger cinco cubos y colocarlos dentro de un límite negro delimitado en la mesa de trabajo. No es un modelo de lenguaje ni un modelo de propósito general, sino un controlador visual-motor específico para un robot SO-101 (tipo `so_follower`) con dos cámaras.

La arquitectura ACT predice secuencias cortas de acciones (chunks) en lugar de un único paso de control, lo que reduce el error de acumulación típico de las políticas paso a paso. El modelo tiene 51.668.614 parámetros, un tamaño contenido que lo sitúa en la liga de los controladores que caben holgadamente en una GPU de consumo. Consume el estado del robot (vector de 6 dimensiones) y dos imágenes RGB de 480x640 procedentes de las cámaras `side` y `wrist`, y produce un vector de acción de 6 dimensiones.

Su relevancia es práctica: sirve como referencia reproducible de un pipeline completo de aprendizaje por imitación con LeRobot (grabación de datos, entrenamiento, rollout) y como punto de partida para hacer fine-tuning sobre una célula robótica propia. La licencia Apache 2.0 permite uso comercial sin restricciones de copyleft, aunque no se han publicado resultados de evaluación ni benchmarks, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con VAE condicional (CVAE) y codificador visual ResNet preentrenado |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; consume una observacion por inferencia). Tamano del chunk de acciones: no disponible |
| Tipos de cuantizacion | no disponible. El repositorio ocupa 0,2 GB, coherente con pesos en fp32 |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje, salvo la cadena de tarea como condicionamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria / ecosistema | lerobot (version declarada de entrenamiento: 0.6.2) |
| Tipo de robot | so_follower (SO-101) |
| Camaras | side, wrist |
| Entradas | observation.state (6,); observation.images.side (3, 480, 640); observation.images.wrist (3, 480, 640) |
| Salidas | action (6,) |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un codificador visual y un transformer encoder-decoder con un VAE condicional (CVAE), tal como se describe en el articulo arXiv:2304.13705. En lugar de predecir una sola accion por observacion, el modelo genera un chunk de acciones futuras, lo que aporta consistencia temporal y mitiga el problema del "compounding error" de las politicas reactivas. El condicionamiento del VAE se aplica durante el entrenamiento para modelar la multimodalidad de las demostraciones humanas (distintas formas validas de ejecutar la misma tarea) y se desactiva en inferencia, usando la media del prior latente para obtener un comportamiento determinista.

Los datos de entrenamiento provienen del dataset `Chaenn/so101_cube_sim_place_1000_dirty300_0908`, con 994 episodios, 1.876.055 fotogramas a 30 FPS y una unica tarea anotada: "Pick and place each of the five cubes inside the black boundary." El entrenamiento se configuro con 150.000 pasos, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documenta en la informacion proporcionada el uso de RLHF, DPO ni ninguna fase de ajuste posterior con refuerzo; se trata, por tanto, de aprendizaje supervisado puro sobre demostraciones de teleoperacion.

## Capacidades

- Control visual-motor para una tarea de pick-and-place de cinco cubos dentro de una zona delimitada.
- Fusión de dos vistas de camara (lateral y de muneca) con el estado proprioceptivo del robot para generar la accion.
- Generacion de chunks de acciones, lo que produce trayectorias mas suaves y estables que una politica paso a paso.
- Ejecucion autonoma de rollouts de hasta la duracion configurada mediante la CLI `lerobot-rollout`.
- Capacidad de ser reentrenado o ajustado con `lerobot-train` sobre datasets propios en formato LeRobot.
- Condicionamiento por cadena de tarea (`--task`), aunque el modelo esta entrenado para una unica instruccion.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico ni capacidades de agente.
- No dispone de capacidades multilingues, de vision general (captioning, VQA) ni de audio; las imagenes se usan exclusivamente como entrada de control.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio o celula educativa: el modelo ejecuta la recogida y colocacion de cubos sobre un SO-101 real, con dos camaras a 30 FPS, sin necesidad de planificacion simbolica ni de un modelo de lenguaje intermedio.
- Baseline reproducible para investigacion en aprendizaje por imitacion: al estar entrenado con LeRobot 0.6.2 y publicar la configuracion exacta (150.000 pasos, batch 16, AdamW, lr 1e-5), permite replicar el experimento y comparar variantes arquitectonicas con una referencia fija.
- Punto de partida para fine-tuning sobre una tarea propia: el mismo pipeline (`lerobot-train --policy.type=act`) permite reentrenar la politica con nuevas posiciones de cubo, nuevos objetos o una iluminacion distinta partiendo de cero o reutilizando los pesos publicados.
- Docencia de robotica y aprendizaje automatico: sirve para ilustrar de principio a fin el ciclo teleoperacion, grabacion de dataset, entrenamiento de politica y despliegue autonomo, con un coste de computo bajo.
- Validacion de infraestructura de control antes de escalar: el modelo permite probar latencias de inferencia, calibracion de camaras y estabilidad del bucle de control a 30 FPS en un caso de uso sencillo antes de migrar a politicas mayores.
- Generacion de datos sinteticos o aumentados: el nombre del dataset sugiere un origen en simulacion ("sim" en el identificador), por lo que es util como politica de referencia para validar pipelines de sim-a-real antes de recoger datos en el robot fisico.
- Pruebas de robustez frente a distractores y ruido visual: el sufijo "dirty" del dataset apunta a variaciones de dificultad, lo que hace del modelo un candidato para medir degradacion de exito cuando cambian posiciones, colores o presencia de objetos ajenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La seccion de evaluacion de la model card esta vacia y no se reportan tasas de exito en robot real ni en simulacion, ni resultados en tareas estandar (LIBERO, Meta-World, RLBench u otras). Tampoco se proporcionan metricas de error de accion (MSE, L1) ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1-2 GB con pesos en fp32 (el repositorio de 0,2 GB es coherente con 51,67 M de parametros en precision simple) mas la memoria de las activaciones del codificador visual al procesar dos imagenes de 480x640. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: cualquier GPU con soporte CUDA de gama media o superior. Una RTX 3060, RTX 4060 o superior es mas que suficiente; tambien funciona en GPUs de datacenter (A100, H100, L4) aunque estan sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, con margen amplio. Tambien es viable en CPU para pruebas, aunque la ejecucion a 30 FPS en tiempo real recomendaria GPU.
- Opciones de despliegue: `lerobot-rollout` sobre PyTorch con CUDA es el camino documentado. No se documenta soporte de vLLM, TGI, Ollama, ONNX Runtime o TensorRT para este modelo.
- Latencia y throughput: no disponible. No se publican mediciones de tiempo de inferencia ni de frecuencia efectiva de control alcanzada en el robot.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_policy_so101_cube_sim_place_1000_dirty300_0908 | ACT (transformer + CVAE) | 51.668.614 | Tarea unica de pick-and-place; 2 camaras 480x640 | apache-2.0 | Hugging Face (LeRobot) |
| Otras politicas ACT de LeRobot | ACT | no disponible | Tareas diversas | no disponible | Hugging Face |
| Diffusion Policy | diffusion policy para control | no disponible | Tareas de manipulacion | no disponible | Implementacion en LeRobot |
| SmolVLA / pi0 (VLA) | vision-language-action | no disponible | Multiples tareas con instrucciones en lenguaje | no disponible | Hugging Face |

La comparacion directa no es posible con los datos disponibles: no se han publicado cifras de rendimiento del modelo analizado ni de las alternativas en la informacion proporcionada. La diferencia cualitativa relevante es que este modelo es una politica de tarea unica y bajo coste computacional, mientras que las familias VLA (SmolVLA, pi0) apuntan a multiples tareas condicionadas por lenguaje a cambio de un coste de inferencia muy superior.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real de la politica, tanto en simulacion como en robot fisico.
- Especializacion extrema: esta entrenada para una unica tarea ("Pick and place each of the five cubes inside the black boundary") sobre un unico tipo de robot. Cambiar de tarea, de objeto o de morfologia requiere reentrenar.
- Dependencia de la configuracion de camaras: los nombres de las camaras (`side`, `wrist`) deben coincidir con las claves de observacion con las que se entreno la politica; una posicion, montaje o resolucion distintas degradaran el comportamiento sin garantia alguna.
- Sensibilidad al dominio visual: no se documenta augmentacion de datos ni diversidad de iluminacion, fondos o distractores, por lo que es previsible una caida de rendimiento ante cambios de escena.
- Riesgo de fallo silencioso: como toda politica de imitacion, puede generar acciones plausiblemente suaves pero incorrectas, sin ninguna senal de incertidumbre ni mecanismo de rechazo; en produccion conviene anadir comprobaciones externas de exito.
- Sin capacidades de lenguaje ni de agentes: no admite tool calling, planificacion multi-paso ni interpretacion de instrucciones arbitrarias.
- Sin cuantizaciones documentadas: no se publican versiones en int8, int4, GGUF ni ONNX, lo que limita el despliegue en hardware sin CUDA o en entornos embebidos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias de ningun tipo; la responsabilidad sobre el comportamiento fisico del robot recae en quien despliega el modelo.
- Trazabilidad limitada: cero descargas y cero valoraciones, autor sin historial publico verificable y ausencia de enlaces a articulos o informes propios mas alla de las referencias genericas a ACT y LeRobot.
- Posible origen simulado de los datos: el identificador del dataset incluye "sim", lo que sugiere datos generados en simulacion; si es asi, la transferencia al robot real (sim-a-real) no esta validada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chaenn/act_policy_so101_cube_sim_place_1000_dirty300_0908
- Dataset de entrenamiento: https://huggingface.co/datasets/Chaenn/so101_cube_sim_place_1000_dirty300_0908
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Chaenn/so101_cube_sim_place_1000_dirty300_0908
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los unicos enlaces utiles son los presentes en la model card y en el ecosistema LeRobot.
