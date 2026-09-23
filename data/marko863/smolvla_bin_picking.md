# marko863/smolvla_bin_picking

## Resumen

smolvla_bin_picking es una politica de robotica basada en SmolVLA (vision-language-action, VLA) y ajustada por imitacion sobre un dataset propio de recogida de cubos. Lo publica el usuario marko863 en HuggingFace, partiendo del modelo base lerobot/smolvla_base, y su objetivo concreto es controlar un brazo robotico Seeed B601 DM follower equipado con tres camaras (muneca, cenital y lateral) para ejecutar la tarea "Pick up the cubes and place them in the bin".

El modelo tiene 450.046.176 parametros (aproximadamente 450 millones) y un repositorio de 0,9 GB, lo que lo situa en la categoria de VLA compactos disenados para ejecutarse en hardware de consumo. SmolVLA, la arquitectura subyacente descrita en el paper arXiv:2506.01844, busca rendimiento competitivo en manipulacion robotica a un coste computacional reducido frente a VLA de mayor tamano.

Es relevante porque muestra el flujo completo de ajuste fino de una politica VLA con LeRobot 0.6.2: parte de un modelo preentrenado, se entrena con un dataset de imitacion de 190 episodios y 242.656 fotogramas a 30 FPS, y se publica con licencia Apache 2.0, lo que permite reutilizar el pipeline tanto para reproducir la tarea como para adaptarlo a otros escenarios de manipulacion en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); arquitectura SmolVLA segun arXiv:2506.01844 |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robotica; no orientado a lenguaje natural general) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

Se trata de un modelo de tipo vision-language-action, la familia que combina un codificador visual, un componente de lenguaje y un modulo de generacion de acciones motoras. Segun la model card, SmolVLA es un VLA compacto y eficiente que logra un rendimiento competitivo con un coste computacional reducido y es desplegable en hardware de consumo. Esta instancia concreta no se entrena desde cero: es un ajuste fino del modelo base lerobot/smolvla_base, publicado por el propio autor.

El entrenamiento se realizo con LeRobot 0.6.2 mediante aprendizaje por imitacion sobre el dataset marko863/bin_picking_3cam, compuesto por 190 episodios y 242.656 fotogramas a 30 FPS, todos ellos de la tarea "Pick up the cubes and place them in the bin". La configuracion registrada es de 50.000 pasos, batch size 16, optimizador AdamW, learning rate 0,0001 y semilla 1000. El modelo consume como observaciones el estado del robot (vector de 6 dimensiones) y tres imagenes de 256x256x3 procedentes de las camaras wrist, top y side, y produce un vector de accion continuo de 7 dimensiones. No se documentan en la informacion disponible tecnicas adicionales como RLHF, DPO o decodificacion especulativa.

## Capacidades

- Control motor de un brazo robotico Seeed B601 DM follower mediante prediccion de acciones continuas de 7 dimensiones.
- Percepcion multimodal a partir de tres flujos de camara simultaneos (muneca, cenital y lateral) a 256x256.
- Fusion de estado propioceptivo del robot (vector de estado de 6 dimensiones) con la informacion visual.
- Ejecucion de tareas de manipulacion pick-and-place en un entorno de laboratorio, concretamente recoger cubos y depositarlos en un contenedor.
- Politica de imitacion orientada a una unica tarea entrenada de forma explicita ("Pick up the cubes and place them in the bin"), no a proposito general.
- Integracion con el ecosistema LeRobot para despliegue en robot mediante el comando `lerobot-rollout`.
- Reentrenamiento y ajuste fino adicional sobre otros datasets usando `lerobot-train` partiendo de lerobot/smolvla_base.

No se documentan capacidades de tool calling, function calling, razonamiento multi-paso en lenguaje, generacion de texto general, codigo, matematicas ni audio en la informacion disponible.

## Casos de uso

- Recogida y clasificacion de piezas en linea de montaje: la politica toma imagenes de tres camaras para localizar cubos y depositarlos en un contenedor, ejecutando el ciclo completo sin script de movimiento programado a mano.
- Base para ajuste fino en tareas pick-and-place similares: dado que parte de lerobot/smolvla_base y se entrena con LeRobot, sirve como punto de partida para recoger y colocar otros objetos cambiando el dataset de imitacion.
- Prototipado de celulas roboticas de bajo coste: con 450 millones de parametros y 0,9 GB de pesos, permite validar una tarea de manipulacion en una estacion con GPU de gama media antes de invertir en hardware industrial.
- Investigacion en aprendizaje por imitacion: el par politica-dataset (190 episodios, 242.656 fotogramas) documenta el flujo completo y permite estudiar el efecto de la configuracion de entrenamiento en el exito de la tarea.
- Evaluacion de politicas VLA en laboratorio: sirve como referencia para comparar metricas de exito frente a otros VLA sobre la misma tarea y el mismo robot.
- Automatizacion de demostraciones tecnicas y docencia: el comando `lerobot-rollout` con `--duration` permite ejecutar la politica durante una ventana controlada para grabar demostraciones del sistema.
- Generacion de datos y evaluacion comparativa: al ejecutarse sobre el robot real, se puede usar para recopilar nuevos episodios y medir tasas de exito por posicion de objeto o condiciones de iluminacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa por tamano, los pesos de 450 millones de parametros ocupan aproximadamente 0,9 GB en bf16/fp16, 1,8 GB en fp32, 0,45 GB en int8 y 0,23 GB en int4, sin contar activaciones ni buffers de vision.
- GPU recomendadas: no especificadas. La model card afirma que SmolVLA es desplegable en hardware de consumo; por tamano cabe con holgura en GPU de consumo modernas.
- Cabe en GPU de consumo: si, por el orden de magnitud de parametros y el tamano del repositorio (0,9 GB), aunque el autor no publica requisitos concretos ni una GPU minima verificada.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` para ejecucion en robot y `lerobot-train` para entrenamiento. Los comandos de la model card usan `--policy.device=cuda`. No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y throughput: no disponibles. El dato de 30 FPS corresponde a la frecuencia de captura del dataset de entrenamiento, no a una tasa de inferencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| marko863/smolvla_bin_picking | 450.046.176 | VLA ajustado por imitacion | Apache 2.0 | HuggingFace, libreria lerobot | Una sola tarea; sin resultados de evaluacion publicados |
| lerobot/smolvla_base | No disponible en la informacion | VLA preentrenado | No disponible en la informacion | HuggingFace | Modelo base del que se parte para el ajuste fino |
| Otros VLA de proposito general | No disponible | VLA | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de contexto, rendimiento ni requisitos de hardware de los modelos alternativos en la informacion suministrada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- Politica especializada en una unica tarea: solo ha sido entrenada para "Pick up the cubes and place them in the bin". Fuera de ese objetivo no se garantiza un comportamiento util.
- Entrenada para un robot concreto (seeed_b601_dm_follower) y una configuracion de tres camaras (wrist, top, side). Cambiar el robot, la cinematica o la disposicion de camaras invalida las observaciones de entrada.
- Sin resultados de evaluacion: el autor no publica tasa de exito, numero de ensayos ni condiciones de prueba, por lo que se desconoce su robustez real en el robot.
- Sensibilidad a condiciones no vistas: posiciones de objeto nuevas, cambios de iluminacion, objetos distractores o un robot distinto del mismo tipo pueden degradar el comportamiento, tal como advierte la propia plantilla de evaluacion de la model card.
- Riesgo de sobreajuste al dataset: 190 episodios de una sola tarea es un volumen reducido, lo que puede limitar la generalizacion a variaciones de escena.
- Posible alucinacion de acciones: al ser una politica de imitacion, ante observaciones fuera de distribucion puede generar comandos motores sin sentido fisico, con el consiguiente riesgo para el hardware y el entorno si no se aplican limites de seguridad.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el usuario asume la responsabilidad de validar el modelo en su aplicacion; el ajuste fino se apoya en lerobot/smolvla_base, cuya licencia conviene verificar por separado.
- Idiomas: no aplica. El modelo no esta orientado a procesamiento de lenguaje natural general, y no se documenta soporte multilingue.
- Datos no disponibles: cuantizacion, longitud de contexto, latencia y throughput de inferencia no estan publicados, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/marko863/smolvla_bin_picking
- Dataset de entrenamiento: https://huggingface.co/datasets/marko863/bin_picking_3cam
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
