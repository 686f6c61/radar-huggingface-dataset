# mysterium99/smolvla-pre-50pct

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente, diseñado para control robótico mediante aprendizaje por imitación. Fue presentado por Hugging Face y el equipo de LeRobot, y este repositorio concreto (`mysterium99/smolvla-pre-50pct`) es un fine-tune del modelo base `lerobot/smolvla_base` entrenado sobre un dataset de prueba con 105 episodios. El modelo resuelve el problema de generar acciones de control a partir de observaciones visuales y de estado, con un coste computacional reducido que permite su despliegue en hardware de consumo.

Arquitectónicamente, SmolVLA combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. El modelo tiene 450.046.176 parámetros totales, almacenados en formato safetensors. La longitud de contexto no se especifica en la información disponible, aunque al tratarse de un modelo de acción continua no es un parámetro relevante como en los LLM. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

| Parametro adicional | Valor |
|---|---|
| Tipo de robot | Follower |
| Camaras | top camera, side camera (3 entradas visuales en el modelo) |
| Entrada de estado | observation.state, forma (6,) |
| Salida de accion | action, forma (6,) |
| Dataset de entrenamiento | test (105 episodios, 98.752 frames, 30 FPS) |
| Tareas entrenadas | "Push block from right side to left", "Squeeze stress ball" |
| Framework | LeRobot 0.6.1 |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que integra una rama de percepción visual, un componente de lenguaje y una cabeza de predicción de acciones. A diferencia de los modelos VLA mas grandes, SmolVLA esta optimizado para reducir el coste computacional manteniendo un rendimiento competitivo, lo que lo hace adecuado para robots de bajo coste y GPUs de consumo. El modelo se entrena mediante aprendizaje por imitacion supervisado, consumiendo observaciones de estado (6 dimensiones) y tres imagenes de 256x256 píxeles, y produciendo una accion de 6 dimensiones.

El fine-tune se realizo con el framework LeRobot, usando el dataset `test`, que contiene 105 episodios y 98.752 frames a 30 FPS. La configuracion de entrenamiento incluye 64.972 pasos, batch size de 8, optimizador AdamW, learning rate de 0.0001 y seed 0. El modelo parte del checkpoint preentrenado `lerobot/smolvla_base`. No se especifica si se aplicaron tecnicas como RLHF o DPO, lo cual no es habitual en modelos de control robotico.

## Capacidades

- Generacion de acciones de control continuo (6 dimensiones) para robots manipuladores a partir de observaciones de estado y de imagenes de camara.
- Aprendizaje por imitacion: el modelo reproduce comportamientos demostrados en el dataset de entrenamiento.
- Entrada multimodal: estado del robot (posiciones/velocidades de articulaciones) y hasta tres imagenes de 256x256.
- Salida de accion compatible con el robot tipo "Follower" del ecosistema LeRobot.
- Fine-tuning desde un modelo base preentrenado, lo que permite adaptarlo a nuevas tareas con relativamente pocos datos.
- Integracion nativa con el framework LeRobot para entrenamiento, evaluacion y despliegue.
- No se documenta soporte de tool calling, razonamiento de lenguaje explicito ni capacidades de agente; su funcion es estrictamente de politica de control robotico.

## Casos de uso

- Manipulacion de objetos en entornos de laboratorio: el modelo puede controlar un robot para empujar un bloque desde el lado derecho al izquierdo, tal como se entrenó en la tarea "Push block from right side to left". Es adecuado porque la politica aprendida genera acciones directamente a partir de las camaras y el estado del robot.
- Tareas de interaccion fisica con objetos deformables: la tarea "Squeeze stress ball" muestra que el modelo puede ejecutar acciones de presion y agarre sobre objetos blandos, util en investigacion de manipulacion.
- Investigacion en aprendizaje por imitacion: sirve como politica de referencia para comparar metodos de entrenamiento, ya que esta integrado en LeRobot y permite reproducir experimentos de forma sencilla.
- Despliegue en robots de bajo coste: al ser un modelo de 450 millones de parametros, puede ejecutarse en GPUs de consumo, lo que facilita la experimentacion en laboratorios sin acceso a clusters de calculo.
- Fine-tuning para nuevas tareas: partiendo de este checkpoint o del base, se puede adaptar a tareas personalizadas mediante `lerobot-train` usando un dataset propio, reduciendo el tiempo de entrenamiento frente a entrenar desde cero.
- Evaluacion de politicas en simulacion o en robot real: el comando `lerobot-rollout` permite ejecutar la politica en un robot Follower para validar su comportamiento en tiempo real, con posibilidad de registrar episodios si se usa otra estrategia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". Por tanto, no se dispone de metricas de exito en robot real, tasas de finalizacion de tareas ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion. Como orientacion, con 450 millones de parametros, en precision FP16 el checkpoint ocupa aproximadamente 900 MB, mas overhead de activaciones; en FP32 serian unos 1,8 GB. No hay datos oficiales de consumo en ejecucion.
- GPU recomendadas: no disponible. Por tamano, se espera que quepa en GPUs de consumo como RTX 3060, RTX 4090 o equivalentes, pero no hay validacion publicada.
- Compatibilidad con consumer GPU: previsiblemente si, dado el reducido numero de parametros, aunque depende de la resolucion de las camaras y del numero de entradas visuales.
- Opciones de despliegue: el framework principal es LeRobot, mediante `lerobot-rollout` para inferencia en robot y `lerobot-train` para entrenamiento. No se documentan integraciones con vLLM, llama.cpp ni otros motores de inferencia generica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mysterium99/smolvla-pre-50pct | 450M | VLA fine-tune | no disponible | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | no disponible | VLA preentrenado | no disponible | Apache 2.0 | HuggingFace |
| OpenVLA | 7B | VLA | no disponible | no disponible | no disponible |

No se dispone de datos de comparacion de rendimiento entre estos modelos en la informacion proporcionada. El modelo analizado es un checkpoint especifico para las tareas "Push block" y "Squeeze stress ball", mientras que el base es el modelo preentrenado general. No se conocen resultados de benchmarks publicados para ninguno de ellos.

## Limitaciones y advertencias

- No hay resultados de evaluacion en robot real: la model card indica que no se han proporcionado resultados de evaluacion, por lo que el rendimiento real en tareas fisicas no esta validado.
- Entrenamiento con un dataset de prueba: el dataset `test` tiene solo 105 episodios y puede no representar la variabilidad del mundo real, lo que limita la generalizacion a nuevas posiciones, iluminacion o distracciones.
- Tareas muy especificas: el modelo solo ha sido entrenado para dos tareas concretas (empujar un bloque y apretar una pelota). Cualquier otra tarea requerira un fine-tuning adicional.
- Dependencia de la configuracion de camaras: los nombres de las camaras en el rollout deben coincidir con los usados en el entrenamiento (`camera1`, `camera2`, `camera3`), y la configuracion de hardware debe ser compatible con el robot tipo "Follower".
- Riesgo de acciones incorrectas: al ser una politica de control, si la observacion difiere de lo visto en entrenamiento, el modelo puede generar acciones no deseadas, lo que supone un riesgo de seguridad en entornos reales.
- Licencia Apache 2.0: permite uso comercial, pero el usuario es responsable de validar el modelo en su propio entorno antes de usarlo en produccion.
- Posibles sesgos en las demostraciones: el comportamiento aprendido refleja las demostraciones del dataset, que pueden contener sesgos o limitaciones del operador humano que las registro.

## Enlaces

- HuggingFace: https://huggingface.co/mysterium99/smolvla-pre-50pct
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/test
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=test
