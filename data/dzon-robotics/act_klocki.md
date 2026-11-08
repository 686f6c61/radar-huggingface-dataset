# dzon-robotics/act_klocki

## Resumen

`act_klocki` es una política de imitación robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705, y empaquetada con la librería LeRobot de Hugging Face. El modelo lo publica el usuario `dzon-robotics` y resuelve una tarea concreta de manipulación: apilar un bloque sobre otro ("Poloz klocek na drugim klocku", en polaco). No es un modelo de lenguaje: es un policy de control visuomotor que consume estado propioceptivo e imágenes de dos cámaras y emite comandos de acción de 6 dimensiones.

La arquitectura es un transformer con codificador visual y decodificador de acciones que predice *chunks* de acciones (varias acciones futuras de una vez) en lugar de pasos individuales, lo que reduce el error de compounding típico en el aprendizaje por imitación. El modelo tiene 51.668.614 parámetros (unos 51,7 M) y un tamaño de repositorio de 0,2 GB en formato safetensors.

Es relevante como ejemplo reproducible de un pipeline completo de LeRobot: dataset público de 41 episodios y 23.389 frames a 30 FPS, configuración de entrenamiento documentada (20.000 pasos, batch 8, AdamW, lr 1e-5) y comandos listos para ejecutar la política en un robot `so_follower`. Su utilidad práctica está acotada al robot y la tarea para los que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación definida por la política) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico; la tarea se especifica en polaco: "Poloz klocek na drugim klocku") |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-100/SO-101 de LeRobot) |
| Cámaras | `front`, `wrist` |
| Entrada de estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.front` y `observation.images.wrist`, shape `(3, 480, 640)` |
| Salida de acción | `action`, shape `(6,)` |
| Librería | LeRobot 0.7.0 |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un codificador visual (típicamente ResNet) que procesa las imágenes de las cámaras `front` y `wrist`, y un decodificador transformer que genera *chunks* de acciones. La predicción por chunks mitiga el problema de acumulación de errores en políticas que predicen un único paso, y el uso de una representación latente con regularización (CVAE en la formulación original) ayuda a modelar la variabilidad de las demostraciones humanas. La política consume un vector de estado de 6 dimensiones y produce un vector de acción de 6 dimensiones, coherente con un brazo tipo SO-100/SO-101 de 6 grados de libertad.

El entrenamiento se realizó sobre el dataset `dzon-robotics/klocki`: 41 episodios, 23.389 frames a 30 FPS, una única tarea de apilamiento de bloques. La configuración documentada es de 20.000 pasos, batch size 8, optimizador AdamW con learning rate 1e-5 y semilla 1000, ejecutado con LeRobot 0.7.0. No se documentan detalles sobre aumentos de datos, composición exacta del dataset más allá de los episodios y frames indicados, ni si hubo fases adicionales de ajuste.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` a partir de dos cámaras RGB (frontal y de muñeca) y estado propioceptivo de 6 dimensiones.
- Predicción de chunks de acciones de 6 dimensiones, orientada a ejecución continua a 30 FPS.
- Ejecución de una tarea de manipulación concreta: colocar un bloque sobre otro.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No se documentan capacidades de generalización a otras tareas, objetos o posiciones distintas de las del dataset de entrenamiento.

## Casos de uso

- Reproducción de un pipeline de imitación end-to-end: sirve como referencia para validar la instalación de LeRobot, la calibración de un `so_follower` y el flujo `lerobot-rollout` con una política pública.
- Apilamiento de bloques en laboratorio: ejecutar la tarea "Poloz klocek na drugim klocku" en un banco de pruebas con iluminación y posiciones similares a las del dataset para medir la tasa de éxito real.
- Base para *fine-tuning*: partir de estos pesos y reentrenar con `lerobot-train` sobre un dataset propio de la misma morfología de robot para adaptar la política a nuevas tareas de pick-and-place.
- Docencia y formación en robótica: ejemplo didáctico de ACT con configuración de entrenamiento completa y dataset visualizable mediante el Space de LeRobot.
- Evaluación comparativa de métodos de imitación: usar esta política como línea base ACT frente a otros métodos (p. ej. Diffusion Policy) sobre el mismo dataset `dzon-robotics/klocki`.
- Pruebas de infraestructura de inferencia robótica: validar latencia y throughput de un policy de 51,7 M de parámetros en el hardware del robot antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de trials, éxitos ni tasas de éxito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros en safetensors (repo de 0,2 GB), la huella de pesos es de aproximadamente 0,2 GB en FP32, por lo que el requisito dominante es el procesamiento de dos imágenes de 480x640 a 30 FPS.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con soporte CUDA y suficiente memoria para el backbone visual debería poder ejecutar la política; el comando de entrenamiento de referencia usa `--policy.device=cuda`.
- Compatibilidad con GPU de consumo: probable por el tamaño del modelo, pero no confirmada en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS, la tasa del dataset de entrenamiento, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dzon-robotics/act_klocki` | ACT | 51,7 M | Apilar bloques con `so_follower` | no disponible | Hugging Face (LeRobot) |
| Políticas ACT de LeRobot (checkpoints de ejemplo) | ACT | del orden de decenas de millones | Tareas varias de manipulación | según repositorio | Hugging Face |
| Diffusion Policy (implementaciones LeRobot) | Diffusion Policy | no disponible | Manipulación visuomotora | según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a método, tamaño y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenado con 41 episodios de una única tarea; se espera un rendimiento pobre fuera de la distribución de posiciones, iluminación y objetos del dataset.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Licencia no especificada: la model card indica "[More Information Needed]", lo que impide confirmar el uso comercial.
- Dependencia de hardware concreto: requiere un robot `so_follower` y dos cámaras con los nombres `front` y `wrist` y resolución 480x640; cualquier cambio de morfología o de configuración de cámaras invalida la política.
- Riesgo de sobreajuste al operador y al entorno de demostración: al ser aprendizaje por imitación con pocos episodios, puede reproducir sesgos de las trayectorias humanas y fallar ante distracciones visuales.
- Sin soporte lingüístico ni de agentes: no debe evaluarse como modelo de lenguaje; la cadena de tarea es fija ("Poloz klocek na drugim klocku").
- Fecha de creación del repositorio (2026-11-08) y ausencia de descargas y likes: modelo muy reciente y sin validación comunitaria en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dzon-robotics/act_klocki
- Dataset de entrenamiento: https://huggingface.co/datasets/dzon-robotics/klocki
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=dzon-robotics/klocki
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
