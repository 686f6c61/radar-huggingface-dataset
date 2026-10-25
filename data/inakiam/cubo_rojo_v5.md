# InakiAM/cubo_rojo_v5

## Resumen

`InakiAM/cubo_rojo_v5` es una política de imitación para robótica entrenada con el método ACT (Action Chunking with Transformers) sobre el framework LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un brazo `so_follower` (vector de 6 dimensiones) y dos flujos de imagen de 480x640 píxeles, y devuelve un vector de acción de 6 dimensiones. Su cometido es ejecutar la tarea de manipulación "cubo rojo" aprendida por imitación de demostraciones teleoperadas.

El modelo tiene 51.668.614 parámetros y un repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que se ejecutan en tiempo real sobre hardware de consumo. Se entrenó durante 40.000 pasos con batch de 32, optimizador AdamW y tasa de aprendizaje 1e-5, a partir de un dataset propio de 80 episodios y 28.629 fotogramas grabados a 30 FPS.

Su relevancia es la de un ejemplo práctico y reproducible de imitation learning de bajo coste: el pipeline completo (grabación, entrenamiento y despliegue) se ejecuta con la CLI de LeRobot 0.6.1, y los pesos están publicados en safetensors con licencia Apache-2.0. No se han publicado resultados de evaluación en robots reales, por lo que debe tratarse como una política experimental y no como un componente validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visión-lenguaje-acción sobre LeRobot |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica; sin ventana de texto. Horizonte de predicción por chunk: no disponible en la model card |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (el tamaño del repo, 0,2 GB, es consistente con fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la única entrada lingüística es la cadena de tarea, con valores "cubo rojo", "cubo rojo 2", "cubo rojo 3") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Entrada - estado | `observation.state`, shape `(6,)` |
| Entrada - visión | `observation.images.Robot` `(3, 480, 640)` y `observation.images.Webcam` `(3, 480, 640)` |
| Salida | `action`, shape `(6,)` |
| Tipo de robot | `so_follower` (brazo seguidor de 6 grados de libertad) |
| Libreria / version | lerobot 0.6.1 |
| Pipeline en el Hub | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper *Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware* (arXiv:2304.13705), referenciado en la propia model card. Su rasgo definitorio es que predice fragmentos ("chunks") de acciones en lugar de un único paso, lo que reduce el error de acumulación típico de las políticas paso a paso y permite un control más estable a 30 FPS. La implementación concreta de este repositorio es la de LeRobot, que combina codificadores visuales para cada cámara con un transformer que fusiona estado y representaciones visuales; los detalles de los backbones, la dimensión del chunk y la presencia del módulo CVAE no se especifican en la información disponible.

El entrenamiento se realizó sobre el dataset `InakiAM/cubo_rojo_v4_20261024_115706`, con 80 episodios y 28.629 fotogramas a 30 FPS (aproximadamente 15,9 minutos de datos agregados), repartidos en tres variantes de la misma tarea: "cubo rojo", "cubo rojo 2" y "cubo rojo 3". La configuración registrada es de 40.000 pasos, batch de 32, AdamW, learning rate 1e-5 y semilla 1000. No se documenta composición del dataset, aumentos de datos, ni si hubo fases de refinamiento posteriores al entrenamiento supervisado (RLHF/DPO no aplican en este dominio). El modelo fue entrenado y publicado con LeRobot 0.6.1.

## Capacidades

- Control visomotor de un brazo `so_follower` de 6 grados de libertad a partir de dos cámaras concurrentes (`Robot` y `Webcam`) y del estado articular.
- Predicción de chunks de acción, lo que habilita ejecución continua con `lerobot-rollout` durante una duración configurable (por defecto, indefinida si se omite `--duration`).
- Ejecución condicionada por instrucción de tarea en lenguaje natural mediante el argumento `--task`, con las tres variantes registradas en el dataset.
- Generalización limitada dentro de la misma tarea de recogida del cubo rojo entre las tres variantes de instrucción.
- Compatibilidad nativa con el ecosistema LeRobot: reentrenamiento con `lerobot-train`, evaluación con `lerobot-rollout` y visualización del dataset asociado.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, audio ni modos de "thinking": es una política robótica, no un modelo generativo de propósito general.

## Casos de uso

- **Automatización de una celda de pick-and-place de laboratorio**: la política se ejecuta sobre un `so_follower` con dos cámaras y realiza la recogida del cubo rojo de forma autónoma durante sesiones de 60 segundos con `--strategy.type=base`, sin grabar episodios, lo que sirve para pruebas de repetibilidad del hardware.
- **Banco de pruebas docente de imitation learning**: al ser un modelo de 51,7 M de parámetros con pipeline completamente documentado, permite reproducir el ciclo completo grabación-entrenamiento-despliegue en un curso o taller con hardware de bajo coste tipo SO-100.
- **Generación de datos sintéticos por rollouts**: usando `lerobot-rollout` sin `--strategy.type=base`, la política puede ejecutar la tarea mientras se graban episodios adicionales, que después se filtran y se añaden al dataset para reentrenar.
- **Comparativa de políticas en LeRobot**: sirve como línea base ACT frente a otras políticas del mismo framework (Diffusion Policy, SmolVLA) sobre el mismo dataset y el mismo robot, midiendo tasa de éxito por tarea.
- **Validación de pipeline de control en tiempo real**: la ventana de 30 FPS y la entrada de dos cámaras a 480x640 permiten medir latencia extremo a extremo, sincronización de cámaras y estabilidad del bucle de control antes de invertir en modelos mayores.
- **Prototipado de tareas de manipulación con objeto único**: útil para demostrar la viabilidad de una tarea sencilla de recogida antes de escalar a objetos múltiples, posiciones aleatorias o iluminación variable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con el texto literal "_No evaluation results have been provided for this policy yet._", y no se aportan tasas de éxito, número de ensayos ni condiciones de prueba en robot real.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB. Los pesos en fp32 ocupan aproximadamente 207 MB (51.668.614 parámetros × 4 bytes), a los que se suman activaciones y los dos flujos de imagen de 480x640. El repositorio completo ocupa 0,2 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090 o RTX 3090 queda muy sobredimensionada y solo aporta margen para ejecutar varias políticas o el entrenamiento en paralelo.
- **Cabe en GPU de consumo**: sí, en prácticamente cualquier GPU dedicada de los últimos años (GTX 1650, RTX 3060, RTX 4060, etc.). También es viable en CPU, aunque el bucle de control a 30 FPS con dos cámaras exige comprobar la latencia real antes de usarlo en producción.
- **Opciones de despliegue**: `lerobot-rollout` con `--policy.path=InakiAM/cubo_rojo_v5` sobre PyTorch/CUDA. vLLM, TGI, llama.cpp y Ollama no aplican: son servidores de modelos de lenguaje y esta es una política de acción con entradas multimodales fijas.
- **Latencia y throughput estimados**: no disponibles. La model card no reporta latencia por paso ni frecuencia efectiva de control; solo se conoce la tasa de grabación del dataset (30 FPS).
- **Requisitos adicionales**: brazo `so_follower` calibrado, dos cámaras OpenCV a 640x480 y 30 FPS, y nombres de cámara que coincidan exactamente con `observation.images.Robot` y `observation.images.Webcam`.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de politica | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `InakiAM/cubo_rojo_v5` | 51.668.614 (dato verificado en safetensors) | ACT (chunking de acciones) | Estado 6D + 2 imagenes 480x640 | Apache-2.0 | Hugging Face Hub, via LeRobot |
| Diffusion Policy (implementacion LeRobot) | no disponible en la informacion proporcionada | Difusion sobre acciones | Estado + imagenes | no disponible en la informacion proporcionada | Implementada en LeRobot |
| SmolVLA (Hugging Face) | no disponible en la informacion proporcionada | VLA (vision-lenguaje-accion) | Estado + imagenes + instruccion | no disponible en la informacion proporcionada | Hugging Face Hub, via LeRobot |
| Otras politicas ACT del Hub | no disponible | ACT | Variable segun robot | Variable | Hugging Face Hub |

La comparación relevante para este modelo no es de precisión, sino de alcance: ACT predice chunks y suele funcionar bien con datasets pequeños y tareas muy acotadas, mientras que las políticas VLA añaden generalización a instrucciones abiertas a cambio de un coste computacional mucho mayor. No hay datos públicos de rendimiento de este checkpoint concreto que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- **Ausencia total de evaluación**: no hay tasas de éxito, ni número de ensayos, ni condiciones de prueba documentadas. Cualquier uso en producción requiere una evaluación propia en robot real.
- **Dataset muy pequeño**: 80 episodios y 28.629 fotogramas (unos 15,9 minutos agregados) para tres variantes de la misma tarea. Es un volumen bajo, con riesgo alto de sobreajuste al entorno, la iluminación y la posición de las cámaras de la grabación.
- **Un solo embodiment**: entrenado exclusivamente para `so_follower` con dos cámaras en posiciones concretas. Cambiar la geometría de las cámaras, el robot o la iluminación invalida probablemente la política.
- **Dependencia de nombres de cámara**: los nombres `Robot` y `Webcam` deben coincidir exactamente con las claves de observación; un desajuste rompe la inferencia.
- **Tarea única y objeto único**: el alcance se limita a "cubo rojo" y sus variantes 2 y 3. No hay evidencia de generalización a otros objetos, colores o posiciones.
- **Fallo silencioso en lugar de alucinación**: al no ser un modelo de lenguaje, el riesgo no es inventar texto, sino ejecutar acciones incorrectas sin señal de error. Es imprescindible un botón de parada de emergencia y límites de par/velocidad en el controlador.
- **Sesgos**: no documentados. En robótica, el sesgo relevante es la distribución del dataset (posiciones, ángulos y condiciones de la grabación), que se hereda íntegramente.
- **Licencia**: el modelo es Apache-2.0, lo que permite uso comercial y modificaciones con atribución. La licencia del dataset `InakiAM/cubo_rojo_v4_20261024_115706` no se indica en la información disponible y debe verificarse por separado antes de reutilizar los datos.
- **Reproducibilidad**: se documentan semilla (1000), learning rate, batch y pasos, pero no la versión exacta del hardware ni las condiciones de grabación, lo que limita la reproducción fiel.
- **Búsqueda web sin resultados útiles**: las consultas realizadas devolvieron únicamente contenido de foros sin relación con el modelo; no se han podido localizar papers, blogs ni demos adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/InakiAM/cubo_rojo_v5
- Dataset de entrenamiento: https://huggingface.co/datasets/InakiAM/cubo_rojo_v4_20261024_115706
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=InakiAM/cubo_rojo_v4_20261024_115706
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
