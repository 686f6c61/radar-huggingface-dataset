# castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_50_Exec_50

## Resumen

ACT_UR5e_BS_32_Act_Chunk_50_Exec_50 es una politica de control robotico entrenada mediante aprendizaje por imitacion con el metodo Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. La desarrolla el usuario castanetnicolas y esta publicada en HuggingFace Hub dentro del ecosistema LeRobot, la libreria de HuggingFace para aprendizaje automatico en robotica real. No es un modelo de lenguaje: es un modelo de politica visomotora que consume el estado articular del robot y dos imagenes de camara, y produce directamente comandos de accion.

El modelo esta especializado en una unica tarea de pick and place sobre un robot Universal Robots UR5e: recoger una lata y depositarla en el contenedor correcto. Se entreno con 100 episodios de teleoperacion (10.575 fotogramas a 20 FPS) del dataset castanetnicolas/UR5e_pick_and_place_CAN_100_absolute_joint, durante 100.000 pasos con batch 32 y optimizador AdamW. Cuenta con 51.618.436 parametros y se distribuye en safetensors bajo licencia Apache 2.0, por lo que es un modelo muy ligero que cabe en cualquier GPU de consumo.

Su relevancia practica es doble: por un lado sirve como ejemplo reproducible de un pipeline completo de imitacion (dataset, entrenamiento, rollout) con LeRobot 0.6.1; por otro, al ser un checkpoint concreto de una tarea real, permite evaluar como se comporta ACT con solo 100 demostraciones en un brazo de 6 grados de libertad con control en articulaciones absolutas. La model card no incluye ningun resultado de evaluacion en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con CVAE para Action Chunking (ACT, arXiv:2304.13705); backbone visual convolucional (ResNet) + encoder-decoder transformer |
| Parametros totales | 51.618.436 (51,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; horizonte de observacion de un unico paso y chunk de acciones de 50 pasos segun el nombre del repositorio (Act_Chunk_50_Exec_50) |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors sin versiones cuantizadas publicadas |
| Idiomas soportados | no disponible; la implementacion de ACT de LeRobot no recibe lenguaje natural como entrada (el campo task se usa como metadato de la demostracion) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

Datos adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| observation.state | STATE | (9,) |
| observation.images.camera1 | VISUAL | (3, 256, 256) |
| observation.images.camera2 | VISUAL | (3, 256, 256) |
| action | ACTION | (4,) |

Robot objetivo: UR5e (Universal Robots). Camaras declaradas: camera1 y camera2. Tamano del repositorio: 0,2 GB.

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que, en lugar de predecir una accion unica por paso de control, predice un chunk de varias acciones futuras de golpe. La formulacion original combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE): una rama de encoder procesa la secuencia de demostracion y un estilo latente, y el decoder genera la secuencia de acciones condicionada por las observaciones actuales. En la implementacion de LeRobot, las imagenes de las dos camaras (256x256) se procesan con un backbone convolucional y se concatenan con el vector de estado articular de 9 dimensiones para alimentar la politica. La prediccion por chunks reduce el problema de horizonte de compensacion (compounding error) y mejora la estabilidad frente a la prediccion paso a paso.

Los datos de entrenamiento provienen exclusivamente del dataset castanetnicolas/UR5e_pick_and_place_CAN_100_absolute_joint: 100 episodios, 10.575 fotogramas a 20 FPS, con la tarea "Pick up the can and place it in the correct bin." y acciones expresadas en articulaciones absolutas. La configuracion de entrenamiento reportada es: 100.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.1. No se documenta el uso de RLHF, DPO ni fases de refinamiento posteriores; se trata de aprendizaje por imitacion supervisado puro a partir de demostraciones teleoperadas. El nombre del repositorio sugiere un chunk de acciones de 50 pasos y una ejecucion de 50 pasos antes de recalcular, pero ese extremo no se detalla en la model card.

## Capacidades

- Control visomotor de un UR5e: genera comandos de accion de 4 dimensiones a partir del estado articular de 9 dimensiones y dos imagenes RGB de 256x256.
- Ejecucion de una tarea concreta de pick and place: "Pick up the can and place it in the correct bin.".
- Prediccion por chunks de acciones, lo que permite movimientos mas suaves y coherentes que una politica por paso unico.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de recompensas ni simulador.
- Integracion con el ecosistema LeRobot: entrenamiento con lerobot-train y ejecucion con lerobot-rollout.
- Soporte de tool calling / function calling: no disponible (no aplica).
- Soporte de agentes y razonamiento multi-paso: no aplica; es una politica de control de bajo nivel.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): vision mediante dos camaras; el resto no aplica.

## Casos de uso

- Automatizacion de pick and place en laboratorio o linea piloto: el modelo ejecuta la recogida y deposito de una lata sobre un UR5e real, por lo que sirve para validar una celda robotica antes de invertir en un desarrollo a medida.
- Punto de partida para fine-tuning en una tarea similar: al ser un checkpoint ACT con 51,6 M de parametros, se puede reentrenar con lerobot-train sobre un dataset propio de otra tarea de manipulacion con el mismo robot y camaras.
- Referencia reproducible en docencia e investigacion: permite reproducir de principio a fin un pipeline de imitacion (grabacion de datos, entrenamiento, rollout) con 100 episodios y 10.575 fotogramas, un coste de datos bajo.
- Evaluacion comparativa de metodos de imitacion: sirve como linea base ACT frente a alternativas como Diffusion Policy o modelos vision-language-action, manteniendo constante el robot y el dataset.
- Pruebas de robustez frente a cambios de entorno: al ser un modelo entrenado en un entorno concreto, es util para medir la degradacion ante cambios de iluminacion, posicion de objetos u oclusiones.
- Despliegue en hardware de bajo coste: con 51,6 M de parametros, la inferencia puede ejecutarse en GPU de consumo o incluso en CPU, lo que facilita montar un banco de pruebas sin aceleradores dedicados.
- Generacion de datos sinteticos o aumento de dataset: la politica puede ejecutar rollouts que se anoten y reutilicen para ampliar el conjunto de demostraciones del mismo UR5e.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la linea "_No evaluation results have been provided for this policy yet._", sin tabla de ensayos, exitos ni tasa de exito en robot real. Tampoco se proporcionan metricas de perdida de entrenamiento ni curvas de aprendizaje. Los resultados de busqueda web devueltos no contienen informacion tecnica relevante sobre este modelo (son resultados no relacionados), por lo que no se puede completar esta seccion con datos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 207 MB solo para los pesos en FP32 y unos 103 MB en FP16/BF16 (calculo a partir de 51,6 M de parametros); con activaciones de las dos imagenes de 256x256 y el resto del grafo, el consumo total previsible se mantiene por debajo de 1-2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es tan pequeno que no necesita aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con al menos 2-4 GB de VRAM; tambien es viable la inferencia en CPU, aunque la latencia del bucle de control de 20 FPS conviene verificarla en el hardware concreto.
- Opciones de despliegue: LeRobot mediante el comando lerobot-rollout (PyTorch sobre CUDA o CPU); no se proporcionan pesos GGUF ni soporte para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Requisitos adicionales: robot UR5e con su puerto de comunicacion, dos camaras accesibles via OpenCV con los nombres de observacion camera1 y camera2, y las versiones de la libreria compatibles con LeRobot 0.6.1.
- Latencia y throughput: no disponibles; el unico dato temporal publicado es que el dataset se grabo a 20 FPS, lo que marca el orden de magnitud del bucle de control esperado, pero no se reporta la latencia real de inferencia.

## Comparativa con modelos similares

No se dispone de datos de especificaciones de los modelos alternativos en la informacion proporcionada, por lo que las celdas correspondientes se marcan como no disponibles. La comparacion se limita a la categoria de metodo.

| Modelo | Parametros | Contexto u horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT_UR5e_BS_32_Act_Chunk_50_Exec_50 (esta politica) | 51,6 M | chunk de 50 pasos segun el nombre del repositorio | apache-2.0 | HuggingFace Hub, ecosistema LeRobot |
| Otras politicas ACT de LeRobot (por ejemplo, variantes ALOHA o Pusht) | no disponible | no disponible | no disponible | HuggingFace Hub |
| Diffusion Policy (Chi et al.) | no disponible | no disponible | no disponible | implementaciones en LeRobot y en repositorios academicos |
| SmolVLA (HuggingFace) | no disponible | no disponible | no disponible | HuggingFace Hub, ecosistema LeRobot |

Nota: la comparacion se ofrece unicamente como mapa de alternativas de la misma categoria (politicas de imitacion para manipulacion robotica). No se han incluido cifras de parametros, contexto ni rendimiento de los modelos alternativos porque no figuran en la informacion disponible.

## Limitaciones y advertencias

- No hay ninguna evaluacion publicada: se desconoce la tasa de exito real en robot, por lo que no debe asumirse que la politica funciona de forma fiable en produccion.
- Especializacion extrema: el modelo ha sido entrenado para una unica tarea ("Pick up the can and place it in the correct bin."), un unico tipo de robot (UR5e) y una unica configuracion de camaras. Fuera de ese contexto, el comportamiento es impredecible.
- Volumen de datos reducido: 100 episodios y 10.575 fotogramas es un conjunto pequeno, lo que aumenta el riesgo de sobreajuste al entorno de grabacion y de degradacion ante cambios de iluminacion, posicion de objetos o presencia de distractores.
- Dependencia de la configuracion de percepcion: el modelo espera exactamente dos camaras con los nombres camera1 y camera2 y resolucion 256x256. Un montaje distinto, un cambio de calibracion o un indice de camara equivocado invalidan la politica.
- Acciones en articulaciones absolutas: el espacio de accion de 4 dimensiones y el estado de 9 dimensiones implican una convencion muy concreta; reutilizarlo en otro robot o con control cartesiano requiere volver a entrenar.
- Sensibilidad a la distribucion: al ser aprendizaje por imitacion sin fase de correccion, los errores pueden acumularse si el robot entra en estados no vistos durante las demostraciones.
- Sin capacidades de lenguaje, razonamiento ni tool calling: no debe usarse como sustituto de un LLM ni como agente conversacional.
- Licencia: apache-2.0, permisiva y compatible con uso comercial. Al reutilizar el modelo conviene citar el metodo ACT (arXiv:2304.13705) y LeRobot (Cadene et al., 2024) tal como pide la model card.
- Riesgos de seguridad fisica: al tratarse de una politica que mueve un brazo robotico real, es imprescindible operar con parada de emergencia, limites de fuerza y supervision humana durante las pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_50_Exec_50
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/UR5e_pick_and_place_CAN_100_absolute_joint
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/UR5e_pick_and_place_CAN_100_absolute_joint
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
