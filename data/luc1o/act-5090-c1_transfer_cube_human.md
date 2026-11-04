# LUC1O/act-5090-C1_transfer_cube_human

## Resumen

ACT-5090-C1_transfer_cube_human es una política de robótica basada en el algoritmo Action Chunking Transformer (ACT), entrenada con la librería LeRobot de Hugging Face sobre el conjunto de datos `lerobot/aloha_sim_transfer_cube_human`. El modelo resuelve una tarea concreta de manipulación simulada: transferir un cubo con un brazo robótico ALOHA en el entorno `AlohaTransferCube-v0`. No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un controlador de bajo nivel que mapea observaciones visuales y propioceptivas a secuencias de acciones motoras.

Lo desarrolla el usuario LUC1O y su interés principal es empírico: documenta el entrenamiento de ACT con los hiperparámetros oficiales (batch 8, learning rate 1e-5, chunk de 100 acciones, 100 000 pasos) sobre una única GPU RTX 5090, y reporta un resultado de éxito del 68,5 % en 200 episodios de evaluación. El modelo tiene 51 685 006 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras desplegables en hardware de consumo.

Su relevancia radica en que sirve como referencia reproducible de entrenamiento de ACT en GPU consumer y como punto de partida para experimentos de imitación en robótica simulada. La model card enlaza un repositorio con el benchmark completo, los logs y los scripts de reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT) |
| Parametros totales | 51 685 006 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre observaciones por paso y chunk de 100 acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de imitación basada en transformer que predice bloques de acciones futuras (chunks) en lugar de una única acción por paso, lo que reduce el error de acumulación en tareas de manipulación. El modelo consume observaciones (imágenes de cámaras y estado propioceptivo del robot) y produce una secuencia de acciones articulares para el entorno ALOHA. El repositorio declara 51 685 006 parámetros en formato safetensors.

El entrenamiento se realizó con LeRobot en el commit `ba83e4c`, usando los hiperparámetros oficiales de ACT: batch de 8, learning rate de 1e-5, chunk de 100 y 100 000 pasos, sobre una única RTX 5090. El conjunto de datos es `lerobot/aloha_sim_transfer_cube_human`, una demostración humana de la tarea de transferencia de cubo en simulación. No se especifica en la información disponible si se aplicaron técnicas adicionales de regularización, aumento de datos o ajuste fino posterior.

## Capacidades

- Control de manipulación robótica: genera secuencias de acciones articulares para el brazo ALOHA en la tarea de transferencia de cubo.
- Imitación de demostraciones humanas: aprende la política directamente del dataset `aloha_sim_transfer_cube_human`.
- Predicción por chunks: emite bloques de 100 acciones, lo que aporta suavidad y reduce el drift acumulado.
- Evaluación integrada en LeRobot: compatible con `lerobot-eval` y el entorno `aloha` / `AlohaTransferCube-v0`.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento textual, código, matemáticas, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de ACT: sirve como referencia para validar que un pipeline de LeRobot con hiperparámetros oficiales alcanza el rendimiento reportado en una RTX 5090.
- Baseline en robótica simulada: punto de comparación para nuevas políticas entrenadas sobre `aloha_sim_transfer_cube_human`.
- Estudio de imitación con pocos datos: permite analizar cómo ACT generaliza a partir de demostraciones humanas en una tarea de manipulación concreta.
- Docencia y formación: ejemplo completo y ligero (0,2 GB) para enseñar entrenamiento y evaluación de políticas con LeRobot.
- Pruebas de infraestructura de evaluación: útil para validar entornos ALOHA, scripts de `lerobot-eval` y métricas de tasa de éxito con intervalos de confianza.
- Investigación en simulación a realidad: base para experimentos de transferencia desde el simulador ALOHA hacia hardware físico, dado el bajo coste computacional del modelo.
- Benchmarking de GPU consumer: referencia para medir tiempos de entrenamiento y evaluación de ACT en tarjetas como la RTX 5090.

## Benchmarks y rendimiento

| Benchmark | Entorno | Episodios | Resultado |
|---|---|---|---|
| AlohaTransferCube-v0 | aloha | 200 | 68,5 % de éxito (137/200), IC 95 % Wilson 61,8–74,5 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de lenguaje, ya que no aplican a este tipo de política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: RTX 5090 (usada para el entrenamiento reportado); cualquier GPU con suficiente VRAM para el entorno de simulación ALOHA.
- Cabe en GPU consumer: sí, por tamaño de modelo; el cuello de botella real es el renderizado del simulador, no los pesos.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con el entorno `aloha`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LUC1O/act-5090-C1_transfer_cube_human | 51 685 006 | no aplica | 68,5 % en AlohaTransferCube-v0 (200 episodios) | no disponible | Hugging Face |
| Otras políticas ACT en LeRobot | no disponible | no aplica | no disponible | variable | Hugging Face |
| Políticas de imitación alternativas (p. ej. Diffusion Policy) | no disponible | no aplica | no disponible | variable | Hugging Face |

No se dispone de datos comparativos verificables de modelos equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo resuelve la tarea `AlohaTransferCube-v0`; no es un modelo generalista ni transferible sin reentrenamiento.
- Tasa de éxito del 68,5 %: implica que aproximadamente uno de cada tres episodios falla, con un intervalo de confianza del 61,8–74,5 %; no es adecuado para producción sin mitigaciones.
- Entrenado en simulación: no hay evidencia en la información disponible de que generalice a hardware físico ni a variaciones del entorno.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin datos de sesgos, robustez ante cambios de iluminación, oclusiones o variaciones de la posición inicial del cubo.
- Riesgo de sobreajuste al dataset de demostración humano concreto; no se documentan evaluaciones fuera de distribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente del resultado reportado.
- No aplica cuantización ni despliegue en frameworks de inferencia de lenguaje; las herramientas habituales (vLLM, llama.cpp, Ollama) no son válidas.

## Enlaces

- Hugging Face: https://huggingface.co/LUC1O/act-5090-C1_transfer_cube_human
- Repositorio de benchmark, logs y scripts de reproducción: https://github.com/Jerryisqx/ACT-5090-benchmark
- Dataset: https://huggingface.co/datasets/lerobot/aloha_sim_transfer_cube_human
