# hatakeyama8490836/smolvla_phillips_screwdriver_60

## Resumen

smolvla_phillips_screwdriver_60 es un policy de robótica basado en SmolVLA (vision-language-action), un modelo compacto disenado para control de robots manipuladores con coste computacional reducido y capacidad de despliegue en hardware de consumo. Lo desarrolla el usuario hatakeyama8490836 sobre el modelo base lerobot/smolvla_base, y esta especializado en una unica tarea: mover un destornillador Phillips hasta una zona objetivo. El modelo se ha entrenado con LeRobot 0.6.2 sobre un dataset propio de 60 episodios y 34.854 frames a 30 FPS.

La relevancia de este modelo es practica: demuestra el flujo completo de fine-tuning de SmolVLA para una tarea concreta de manipulacion con un robot so_follower de tres camaras (side, wrist, top), lo que sirve como referencia reproducible para quien quiera adaptar un VLA compacto a su propio entorno. No es un modelo de proposito general ni un LLM: es una politica de imitacion que consume observaciones multimodales (estado de 6 dimensiones y tres imagenes) y produce acciones de 6 dimensiones.

El modelo tiene 450.046.176 parametros (aproximadamente 450 M) y un repo de 1,2 GB en safetensors. La licencia es Apache 2.0, lo que permite uso comercial y modificacion. Al ser un fine-tune con solo 100 pasos de entrenamiento sobre una tarea unica, su alcance es muy limitado y no debe confundirse con un modelo de razonamiento o generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), transformer multimodal para control robotico |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de accion robotica, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so_follower |
| Camaras de entrada | side (3, 360, 640), wrist (3, 720, 1280), top (3, 360, 640) |
| Entrada de estado | observation.state (6,) |
| Salida de accion | action (6,) |
| Dataset de entrenamiento | hatakeyama8490836/driver_20261125_131932 (60 episodios, 34.854 frames, 30 FPS) |
| Tarea | "Move the Phillips screwdriver into the target area." |
| Pasos de entrenamiento | 100 |
| Batch size | 4 |
| Optimizador | adamw |
| Learning rate | 0.0001 |
| Seed | 1000 |
| Version de LeRobot | 0.6.2 |
| Tamano del repo | 1,2 GB |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto que combina un codificador visual y un codificador de lenguaje con un cabezal de acciones, disenado para imitacion robotica de extremo a extremo. La arquitectura procesa simultaneamente imagenes de multiples camaras y el estado proprioceptivo del robot, y genera un vector de accion de 6 dimensiones por paso de control. El paper asociado (arXiv:2506.01844) describe el diseno orientado a eficiencia computacional y despliegue en hardware de consumo, en contraste con VLA de mayor tamano como OpenVLA o RT-2.

El entrenamiento de este fine-tune concreto es muy ligero: 100 pasos con batch size 4, optimizador AdamW y learning rate 1e-4, sobre 60 episodios de demostracion (34.854 frames a 30 FPS) de una unica tarea. No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo; se trata de aprendizaje por imitacion supervisado estandar en LeRobot. No se especifica en la informacion disponible el numero de tokens de entrenamiento del modelo base ni la composicion de su dataset original.

## Capacidades

- Control robotico de manipulacion: genera acciones de 6 dimensiones para un robot so_follower a partir de observaciones visuales y de estado.
- Percepcion multimodal: procesa tres flujos de camara simultaneamente (side, wrist, top) con resoluciones de 360x640 y 720x1280.
- Ejecucion de una tarea especifica de pick-and-place: mover un destornillador Phillips a una zona objetivo.
- Aprendizaje por imitacion: reproduce comportamientos demostrados en el dataset de entrenamiento.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, rollout y evaluacion de Hugging Face.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es una politica de accion, no un LLM.
- Capacidades multilingues: no aplicables; el modelo no procesa lenguaje natural como tarea principal.

## Casos de uso

- Automatizacion de una celda de montaje con destornillador Phillips: el policy ejecuta la tarea de llevar el destornillador a la zona objetivo en un robot so_follower, util para prototipos de linea de ensamblaje de bajo coste.
- Base para fine-tuning de tareas similares: al estar construido sobre lerobot/smolvla_base y documentar el comando lerobot-train, sirve como plantilla para entrenar policies de manipulacion con pocos episodios (60 en este caso).
- Investigacion en aprendizaje por imitacion: permite reproducir el flujo completo de grabacion de datos, entrenamiento y rollout con LeRobot 0.6.2 y comparar hiperparametros.
- Validacion de configuraciones de camaras: el modelo documenta tres vistas (side, wrist, top) con resoluciones distintas, lo que ayuda a disenar setups de percepcion para robots de bajo coste.
- Demostracion educativa de VLA compactos: con 450 M de parametros y licencia Apache 2.0, es adecuado para cursos y talleres sobre vision-language-action sin necesidad de GPUs de datacenter.
- Pruebas de despliegue en hardware de consumo: el paper de SmolVLA enfatiza el despliegue en hardware asequible, por lo que este fine-tune sirve para medir latencia y viabilidad en estaciones de trabajo con GPU consumer.
- Benchmark interno de robustez: al no haber resultados de evaluacion publicados, el modelo puede usarse como caso de estudio de como la falta de evaluacion sistematica afecta a la reproducibilidad en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito, MMLU, HumanEval, GSM8K ni metricas de robotica para este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 450 M de parametros en safetensors (1,2 GB de repo), la inferencia en precision completa requiere del orden de 2-3 GB de VRAM, estimacion orientativa no confirmada por el autor.
- GPU recomendadas: el paper de SmolVLA enfatiza despliegue en hardware de consumo; se espera que quepa en GPUs consumer como RTX 3060, RTX 4060 o superiores, aunque no hay requisitos oficiales publicados.
- Cabe en consumer GPU: previsiblemente si, dado el tamano de 450 M de parametros, pero no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: LeRobot (comando lerobot-rollout) es la via documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un policy de accion.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS segun el dataset de entrenamiento, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_phillips_screwdriver_60 | 450 M | VLA fine-tune | Mover destornillador Phillips | apache-2.0 | Hugging Face (lerobot) |
| lerobot/smolvla_base | no disponible en la informacion | VLA base | Proposito general de manipulacion | no disponible en la informacion | Hugging Face (lerobot) |
| OpenVLA | no disponible en la informacion | VLA | Manipulacion general | no disponible en la informacion | no disponible en la informacion |
| RT-2 | no disponible en la informacion | VLA | Manipulacion general | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a categoria, licencia y disponibilidad.

## Limitaciones y advertencias

- Alcance extremadamente limitado: entrenado para una unica tarea ("Move the Phillips screwdriver into the target area") y un unico tipo de robot (so_follower); no generaliza a otras tareas sin reentrenamiento.
- Entrenamiento muy corto: solo 100 pasos con batch size 4, lo que sugiere un ajuste minimo y posible infraajuste o sobreajuste a las condiciones exactas del dataset.
- Sin evaluacion publicada: no hay tasas de exito ni pruebas en condiciones variadas (posiciones nuevas, iluminacion, distractores), por lo que se desconoce su robustez real.
- Dependencia del setup de camaras: requiere exactamente las vistas side, wrist y top con las resoluciones y nombres de observacion del entrenamiento; un cambio de camaras o calibracion puede degradar el comportamiento.
- Riesgo de alucinacion en el sentido de acciones erroneas: como policy de imitacion, puede generar trayectorias no seguras ante estados fuera de distribucion; requiere supervision humana y limites de seguridad fisicos.
- Sesgos: los derivados del dataset de demostracion (posiciones, iluminacion, objetos y operador concretos); no se documentan analisis de sesgo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; la responsabilidad de seguridad en robotica recae en el integrador.
- Idiomas: no aplica; el modelo no es linguistico, aunque el campo de idiomas figura como no disponible.
- Fecha de creacion futura en los metadatos (2026-11-25): conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hatakeyama8490836/smolvla_phillips_screwdriver_60
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/hatakeyama8490836/driver_20261125_131932
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hatakeyama8490836/driver_20261125_131932
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
