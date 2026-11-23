# hrl-imerse/report-task1-act-B300

## Resumen

`report-task1-act-B300` es un checkpoint de política de control robótico entrenado con el algoritmo ACT (Action Chunking with Transformers) sobre el simulador y el conjunto de datos asociados al entorno SO-101, en el marco de la asignación 2 de un curso de HRL (Hierarchical Reinforcement Learning). Lo publica el usuario `hrl-imerse` como material de entrega de un informe académico, no como un modelo de propósito general.

El modelo resuelve una única tarea de manipulación concreta: la "Task 1" del enunciado, en su variante de política B, entrenada con 300 demostraciones (270 de entrenamiento) durante 30 000 pasos. Con 51,7 millones de parámetros y un repositorio de 0,2 GB, es un modelo pequeño orientado a inferencia en bucle cerrado sobre observaciones de cámara y estado del robot.

Su relevancia es, por tanto, documental y educativa: sirve como referencia reproducible de un pipeline LeRobot completo (dataset, entrenamiento ACT, evaluación formal) y no está pensado para uso en producción ni para tareas distintas de la evaluada. La model card remite a un repositorio de GitHub para la explicación completa de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación para control robótico |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es una arquitectura transformer diseñada para imitación visomotora: un codificador visual procesa las imágenes de las cámaras, un codificador del estado del robot concatena la propriocepción y un decodificador transformer predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza la ejecución. El checkpoint contiene 51.668.614 parámetros, coherente con un ACT de tamaño pequeño con backbone visual ligero.

Según la model card, el entrenamiento usó 300 demostraciones (270 para entrenamiento, 30 reservadas) y 30 000 pasos de optimización. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, el backbone visual, la resolución de las cámaras ni si hubo aumentos de datos o ajuste fino posterior. Se trata de aprendizaje por imitación supervisado, sin RLHF ni DPO.

## Capacidades

- Control robótico por imitación: predice chunks de acciones a partir de observaciones visuales y del estado del robot para la Task 1 del entorno SO-101.
- Ejecución en bucle cerrado: apto para inferencia paso a paso durante la evaluación formal del informe.
- Integración con LeRobot: los pesos se cargan con la librería `lerobot` y su pipeline de políticas.
- Reproducibilidad académica: pensado para replicar los resultados del informe HRL Assignment 2.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües.

## Casos de uso

- Reproducción de resultados académicos: cargar el checkpoint con `lerobot` y ejecutar la evaluación formal de la Task 1 para verificar las cifras del informe; es su propósito declarado.
- Comparación de políticas de imitación: servir de referencia frente a otras variantes (por ejemplo, políticas A o C del mismo assignment) para analizar el efecto del número de demostraciones y pasos.
- Docencia y estudio de ACT: inspeccionar los pesos y la configuración para entender cómo se estructura una política ACT entrenada con 300 demostraciones.
- Base para ajuste fino en el mismo entorno: partir de estos pesos y continuar el entrenamiento con más demostraciones de SO-101, siempre dentro del mismo dominio de tarea.
- Validación de pipelines LeRobot: probar la carga de safetensors, la normalización de observaciones y el bucle de inferencia en una máquina local antes de escalar a otros experimentos.
- Análisis de robustez en simulación: evaluar la política bajo perturbaciones controladas del entorno SO-101 para estudiar su degradación fuera de la distribución de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que este es "el checkpoint usado en la evaluación formal" del informe, pero no incluye tasas de éxito, métricas de error de acción ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que cualquier GPU con 2-4 GB libres es suficiente.
- GPU recomendadas: no se especifican; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna deberían bastar para inferencia.
- Cabe en GPU de consumo: sí, con amplio margen, incluidas GPUs de gama baja.
- Opciones de despliegue: librería `lerobot` (vía PyTorch); no hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| report-task1-act-B300 | 51,7 M | no aplica | no disponible | no disponible | Hugging Face |
| Otras políticas ACT de LeRobot | no disponible | no aplica | no disponible | generalmente Apache-2.0 en los ejemplos oficiales | Hugging Face / GitHub |
| Políticas Diffusion Policy | no disponible | no aplica | no disponible | no disponible | Hugging Face / GitHub |

No se dispone de datos de rendimiento ni de especificaciones de los modelos comparables en la información proporcionada; la comparación es meramente categórica.

## Limitaciones y advertencias

- Específico de una tarea: entrenado únicamente para la Task 1 del assignment; no generaliza a otras tareas ni entornos sin reentrenamiento.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial; hay que contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Sin model card técnica completa: no se documentan backbone visual, resolución de entrada, normalización ni hiperparámetros, lo que dificulta la reproducibilidad exacta.
- Riesgo de sobreajuste y de fallo fuera de distribución: con 270 demostraciones de entrenamiento, la política puede degradarse ante cambios de iluminación, posición de objetos o del robot.
- Sin métricas publicadas: no hay tasas de éxito ni comparaciones que permitan evaluar su calidad objetiva.
- Sin garantías de mantenimiento: repositorio con 0 descargas y 0 likes, actualizado una sola vez; es material de entrega, no un artefacto mantenido.
- No apto para producción: no es un modelo de lenguaje ni un asistente; cualquier uso como tal sería un error de categoría.

## Enlaces

- Hugging Face: https://huggingface.co/hrl-imerse/report-task1-act-B300
- Repositorio del informe: https://github.com/msong33/hrl_imerse (archivo `REPORT_HANDOFF.md`, rama `report/assignment2-final`)
- LeRobot (librería): https://github.com/huggingface/lerobot
