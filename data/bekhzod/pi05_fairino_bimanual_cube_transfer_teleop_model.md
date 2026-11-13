# Bekhzod/pi05_fairino_bimanual_cube_transfer_teleop_model

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para la generalizacion en entornos abiertos en tareas roboticas. Esta ficha concreta es un fine-tuning del modelo base `lerobot/pi05_base`, publicado por el usuario Bekhzod, que adapta el modelo a una tarea especifica de manipulacion bimanual con un robot Fairino: transferir un cubo de una posicion a otra usando ambos brazos.

El modelo resuelve el problema de control robotico guiado por instrucciones en lenguaje natural y percepcion visual. Recibe como entrada el estado de las articulaciones (14 dimensiones) y tres flujos de camara (superior, izquierda y derecha, a 480x640), y produce una accion de 14 dimensiones. La arquitectura subyacente es la de π₀.₅ de Physical Intelligence, adaptada a la libreria LeRobot de Hugging Face.

Es relevante porque demuestra el flujo completo de fine-tuning de un VLA de proposito general a una tarea concreta con solo 50 episodios de teleoperacion (35.944 frames a 30 FPS), un caso practico de imitation learning de bajo coste. El modelo tiene 4.143.404.816 parametros y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ de Physical Intelligence (implementacion LeRobot/OpenPI) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entrada de estado | `observation.state` (14,) |
| Entrada visual | 3 camaras: `top`, `left`, `right`, cada una (3, 480, 640) |
| Salida de accion | `action` (14,) |
| Tipo de robot | Fairino (bimanual) |
| Modelo base | `lerobot/pi05_base` |
| Libreria | LeRobot 0.6.1 |
| Tamano del repositorio | 9.4 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del VLA π₀.₅ de Physical Intelligence, cuya implementacion en LeRobot se adapta del repositorio open-source OpenPI. π₀.₅ evoluciona π₀ para generalizar a entornos y situaciones no vistas durante el entrenamiento. La arquitectura combina percepcion visual multi-camara con el estado propioceptivo del robot para generar acciones de control de 14 dimensiones, correspondientes a los dos brazos del robot Fairino.

El fine-tuning se realizo sobre el dataset `Bekhzod/fairino_bimanual_cube_transfer_teleop`, compuesto por 50 episodios de teleoperacion, 35.944 frames a 30 FPS, con una unica tarea en lenguaje natural: "pick up the cube with the right arm, place it in the middle, then put it in the box with the left arm". La configuracion de entrenamiento fue de 20.000 pasos, batch size 32, optimizador AdamW, learning rate 2.5e-05 y semilla 1000. No se especifica en la informacion disponible si hubo RLHF, DPO ni detalles sobre el dataset de preentrenamiento del modelo base.

## Capacidades

- Control robotico bimanual guiado por instrucciones en lenguaje natural.
- Percepcion visual multi-camara (tres vistas simultaneas: superior, izquierda y derecha).
- Fusion de estado propioceptivo (14 dimensiones) con observacion visual para generar acciones.
- Ejecucion de tareas de manipulacion secuenciales (recoger, colocar en posicion intermedia, depositar en caja).
- Generalizacion a entornos abiertos heredada del modelo base π₀.₅.
- Soporte de imitation learning via LeRobot (entrenamiento y rollout con CLI).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingues en la informacion disponible.

## Casos de uso

- **Automatizacion de tareas pick-and-place en linea de montaje**: el modelo ejecuta la secuencia de recoger un cubo con el brazo derecho, colocarlo en una posicion intermedia y depositarlo en una caja con el brazo izquierdo, adecuado para tareas de transferencia entre estaciones.
- **Prototipado rapido de politicas robotica**: con solo 50 episodios de teleoperacion se obtiene una politica funcional, lo que permite validar rapidamente un flujo de imitation learning antes de invertir en datasets mayores.
- **Investigacion en Vision-Language-Action**: sirve como punto de partida para estudiar generalizacion de VLAs fine-tuneados a tareas concretas y comparar con el modelo base π₀.₅.
- **Formacion y demostracion de robots bimanuales**: el modelo puede ejecutarse con `lerobot-rollout` para demostrar el control coordinado de dos brazos en entornos academicos o de laboratorio.
- **Benchmark de referencia para fine-tuning de VLAs**: permite medir cuanto se adapta un VLA de proposito general a una tarea especifica con un dataset pequeno (50 episodios, ~36k frames).
- **Integracion en pipelines de LeRobot**: el modelo se entrena y despliega con las herramientas estandar de LeRobot (`lerobot-train`, `lerobot-rollout`), lo que facilita su inclusion en flujos de trabajo existentes de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible en la informacion proporcionada. Con 4.143.404.816 parametros, una estimacion orientativa en precision completa (fp32) rondaria los 16,5 GB, y en bf16/fp16 unos 8,3 GB, pero estos valores son calculos derivados del numero de parametros y no datos confirmados por el autor.
- **GPU recomendadas**: no disponible. Por tamano, cabria esperar que una GPU con al menos 16 GB de VRAM (por ejemplo RTX 4090, A100, H100) sea suficiente en bf16, pero no se confirma en la informacion.
- **Compatibilidad con GPU de consumo**: probable en GPUs consumer con VRAM suficiente (RTX 4090 de 24 GB), aunque no confirmado por el autor.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bekhzod/pi05_fairino_bimanual_cube_transfer_teleop_model | 4.143.404.816 | no disponible | VLA bimanual (Fairino) | Apache 2.0 | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA base (π₀.₅) | no disponible | Hugging Face |
| π₀ (Physical Intelligence) | no disponible | no disponible | VLA general | no disponible | OpenPI |

La comparativa se limita al modelo base del que deriva y a π₀, predecesor de π₀.₅. No se dispone de datos de rendimiento comparativo entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- **Sin resultados de evaluacion**: el autor no ha publicado tasas de exito ni pruebas en robot real, por lo que el rendimiento real es desconocido.
- **Dataset muy reducido**: solo 50 episodios y 35.944 frames, lo que limita la robustez y la generalizacion fuera de las condiciones de recogida.
- **Tarea unica y especifica**: el modelo esta entrenado para una sola instruccion ("pick up the cube with the right arm, place it in the middle, then put it in the box with the left arm") y un unico tipo de robot (Fairino).
- **Dependencia de la configuracion de camaras**: los nombres e indices de camara deben coincidir con las claves de observacion del entrenamiento (`top`, `left`, `right`), lo que restringe la portabilidad.
- **Riesgo de sobreajuste al entorno de recogida**: cambios en iluminacion, posicion de objetos o distractores pueden degradar el rendimiento; no se documenta evaluacion en estas condiciones.
- **Sesgos**: no documentados en la informacion disponible.
- **Riesgo de alucinacion**: no aplica en el sentido de generacion de texto, pero si en la generacion de acciones no validas fuera de la distribucion de entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` debe verificarse por separado, ya que su licencia no se especifica en la informacion disponible.
- **Sin soporte documentado de cuantizacion**: no se indican formatos GGUF ni tecnicas de cuantizacion para despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bekhzod/pi05_fairino_bimanual_cube_transfer_teleop_model
- Dataset de entrenamiento: https://huggingface.co/datasets/Bekhzod/fairino_bimanual_cube_transfer_teleop
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Bekhzod/fairino_bimanual_cube_transfer_teleop
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Documentacion de imitation learning: https://huggingface.co/docs/lerobot/en/il_robots
