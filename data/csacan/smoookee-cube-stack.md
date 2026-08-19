# csacan/smoookee-cube-stack

## Resumen

El modelo `csacan/smoookee-cube-stack` es una política de control robótico basada en SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face. Este fine-tune concreto ha sido entrenado sobre el modelo base `lerobot/smolvla_base` para ejecutar una tarea específica de manipulación: apilar tres cubos en forma de pirámide, con el más pequeño arriba, el mediano en el centro y el más grande en la base. El modelo ha sido entrenado con el framework LeRobot y está especializado para el robot seguidor `so_follower` con una cámara frontal.

Con 450 millones de parámetros, SmolVLA está diseñado para ofrecer un rendimiento competitivo con un coste computacional reducido, lo que permite su despliegue en hardware de consumo. Este modelo en particular ha sido fine-tuneado con un dataset de 90 episodios y 55 912 fotogramas, aunque el entrenamiento se limitó a 20 pasos, lo que sugiere que es un experimento o una demostración de viabilidad más que un modelo listo para producción. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450 046 176 (450 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y una cabeza de accion para generar comandos de control directamente a partir de observaciones visuales y de estado. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face, y este fine-tune se ha realizado mediante aprendizaje por imitacion supervisado, sin tecnicas de RLHF o DPO. El entrenamiento se llevo a cabo con el framework LeRobot (version 0.6.2) sobre el dataset `yutong-xiang-97/robot-learning-260816`, que contiene 90 episodios de la tarea de apilado de cubos, con 55 912 fotogramas a 30 FPS. La configuracion de entrenamiento fue minima: 20 pasos, batch de 8, optimizador AdamW y learning rate de 0.0001. El modelo consume como entradas el estado del robot (6 dimensiones) y una imagen frontal de 480x640 píxeles, y produce una accion de 6 dimensiones.

## Capacidades

- Control de robot manipulador: genera acciones de 6 grados de libertad (posicion y orientacion del efector final) a partir de observaciones visuales y de estado.
- Percepcion visual: procesa imagenes RGB de 480x640 píxeles de una camara frontal para guiar la manipulacion.
- Especializacion en tarea unica: esta entrenado exclusivamente para apilar tres cubos en piramide, con una consigna textual fija.
- Integracion con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots reales.
- Eficiencia computacional: al ser un modelo compacto de 450 M, puede ejecutarse en GPUs de consumo, segun la descripcion del paper original.
- No incluye capacidades de lenguaje conversacional, tool calling, agentes ni razonamiento multi-paso fuera del ambito de la tarea robotica.

## Casos de uso

- Automatizacion de tareas de apilado en entornos industriales: el modelo puede controlar un brazo robotico para apilar piezas de diferentes tamanos, reduciendo la intervencion humana en lineas de montaje.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo de fine-tuning de un VLA compacto con LeRobot, util para estudiar la transferencia de politicas de control.
- Prototipado rapido de politicas robotica: al entrenarse en solo 20 pasos, demuestra un flujo de trabajo rapido para validar nuevas tareas con datasets pequenos.
- Demostraciones educativas: permite ensenar conceptos de robotica y aprendizaje automatico en laboratorios academicos con hardware asequible.
- Evaluacion de hardware de consumo: al ser un modelo pequeno, es adecuado para probar capacidades de inferencia en GPUs de gama media como RTX 3060 o RTX 4060.
- Desarrollo de sistemas de manipulacion en entornos domesticos: aunque la tarea es especifica, la arquitectura podria adaptarse a otras tareas de recogida y colocacion con fine-tuning adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica. No se proporcionan metricas de exito en la tarea de apilado ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 450 M de parametros, los pesos en safetensors ocupan aproximadamente 1.2 GB en el repositorio, lo que sugiere que la inferencia podria caber en GPUs con 2-4 GB de VRAM, pero no se ha confirmado.
- GPU recomendadas: no se especifican. Dado el tamano del modelo, GPUs de consumo como RTX 3060 (12 GB) o RTX 4090 (24 GB) serian suficientes, aunque no hay datos oficiales.
- Compatibilidad con consumer GPU: probablemente si, segun la descripcion de SmolVLA como desplegable en hardware de consumo, pero no se ha verificado para este fine-tune concreto.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) para ejecutar la politica en robots reales. No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion comparativa en los datos proporcionados. SmolVLA se posiciona como una alternativa compacta a modelos VLA mas grandes como OpenVLA o RT-2, pero no se han incluido datos de rendimiento ni especificaciones de estos modelos en la documentacion consultada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Entrenamiento extremadamente corto: solo 20 pasos de entrenamiento, lo que probablemente resulte en una politica poco robusta y con baja tasa de exito en el mundo real.
- Sin evaluacion publicada: no hay resultados de pruebas en robot real, por lo que se desconoce su rendimiento efectivo.
- Especializacion rigida: el modelo esta entrenado para una tarea unica (apilar tres cubos en piramide) y para un robot especifico (`so_follower`). No es generalizable a otras tareas sin reentrenamiento.
- Dependencia de la configuracion de camara: la politica requiere una camara frontal con resolucion 480x640 y una posicion fija; cambios en la iluminacion, angulo o distancia pueden degradar el rendimiento.
- Riesgo de alucinacion visual: como cualquier modelo de vision, puede malinterpretar la escena si los objetos no estan en las posiciones esperadas.
- Sin soporte multilingue: no es un modelo de lenguaje, por lo que no procesa instrucciones en diferentes idiomas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y sin responsabilidad por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/csacan/smoookee-cube-stack
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/yutong-xiang-97/robot-learning-260816
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
