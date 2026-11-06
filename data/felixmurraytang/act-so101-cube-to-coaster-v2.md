# felixmurraytang/act-so101-cube-to-coaster-v2

## Resumen

ACT-SO101-Cube-to-Coaster-v2 es una política robótica entrenada con el algoritmo ACT (Action Chunking with Transformers) mediante la librería LeRobot 0.6.1. La desarrolla el usuario felixmurraytang y resuelve una tarea de manipulación muy concreta: recoger un cubo verde y depositarlo sobre un posavasos con un brazo robótico SO-101. No es un modelo de lenguaje ni un modelo fundacional multimodal, sino un checkpoint de control motor que mapea observaciones visuales y propioceptivas a secuencias de acciones.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB. Se entrenó con 22 demostraciones de teleoperación grabadas a 15 fps, usando dos cámaras (vista cenital en /dev/video2 y vista de muñeca en /dev/video0), durante 25.000 pasos con batch de 8 en una GPU Kaggle T4, alcanzando una pérdida final de aproximadamente 0,094.

Su relevancia es acotada pero práctica: demuestra el flujo completo de entrenamiento y despliegue de políticas de imitación en hardware de bajo coste (SO-101) y ofrece resultados reales en brazo físico, con 2 de 6 ensayos exitosos en la configuración de 50 pasos de acción. Es un artefacto de investigación reproducible, no un componente listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación robótica que predice bloques de acciones futuras (action chunks) a partir de observaciones multimodales. En este caso, la política consume imágenes de dos cámaras y el estado del robot, y emite secuencias de acciones articulares. El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `felixmurraytang/so101_cube_to_coaster_v2` en formato LeRobot v3, con 22 demostraciones de teleoperación a 15 fps.

La configuración de entrenamiento fue de 25.000 pasos con batch de 8 en una T4 de Kaggle, con pérdida final en torno a 0,094. No se documenta el uso de RLHF, DPO ni técnicas de refinamiento posteriores; se trata de aprendizaje por imitación supervisado puro. La innovación principal es el propio esquema de action chunking, que permite ejecutar horizontes de acción de 50 pasos, configuración que empíricamente superó a 25 pasos (con la que el robot no llegaba a iniciar el movimiento).

## Capacidades

- Control robótico de manipulación: recogida de un cubo verde y colocación sobre un posavasos con un brazo SO-101.
- Predicción de secuencias de acciones (action chunks) con horizonte configurable; el mejor resultado se obtuvo con `n_action_steps=50`.
- Fusión de dos vistas de cámara (cenital y de muñeca) más estado propioceptivo del robot.
- Ejecución autónoma en brazo físico con una tasa de éxito parcial documentada (2 de 6 ensayos completos).
- Generalización limitada a posiciones del cubo vistas durante las demostraciones.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en imitación robótica: servir como referencia reproducible de un pipeline ACT completo con LeRobot, desde la recogida de datos hasta el despliegue en hardware, útil para comparar hiperparámetros como el horizonte de acción.
- Prototipado de pick-and-place en laboratorio: el modelo puede integrarse en una celda con brazo SO-101 y dos cámaras para validar la viabilidad de una tarea de recogida y colocación antes de escalar a un dataset mayor.
- Docencia y formación: permite ilustrar de forma tangible el ciclo de aprendizaje por imitación, incluyendo la captura de demostraciones por teleoperación y la evaluación en brazo real.
- Benchmark de hardware de bajo coste: al haberse entrenado en una T4 de Kaggle, sirve para medir qué rendimiento se obtiene con recursos muy limitados en robótica de manipulación.
- Base para fine-tuning: el checkpoint puede reutilizarse como inicialización para tareas similares (otros objetos o destinos) con un dataset reducido de demostraciones adicionales.
- Estudio de robustez y generalización: útil para analizar cómo varía la tasa de éxito según la posición inicial del objeto, dado que el autor documenta que funciona mejor en posiciones vistas durante las demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento es la evaluación en brazo real:

| Métrica | Resultado |
|---|---|
| Ensayos totales | 6 |
| Éxitos completos (pick-and-place) | 2 (uno en el borde del posavasos, otro en el borde exterior) |
| Agarres con transporte sin liberación | 1 |
| Fallos o ausencia de movimiento | 3 |
| Configuración óptima | `n_action_steps=50` |
| Configuración con `n_action_steps=25` | el robot no iniciaba el movimiento |
| Pérdida final de entrenamiento | ~0,094 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en safetensors el checkpoint ocupa una fracción de los 0,2 GB del repositorio, por lo que cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA T4 (Kaggle); para inferencia basta una GPU de gama media o incluso CPU, aunque no se documentan latencias.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con varios GB de VRAM (GTX 1660, RTX 3060, RTX 4090, etc.); no se especifican requisitos mínimos exactos.
- Opciones de despliegue: LeRobot 0.6.1 es la librería de referencia; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La captura de datos se hizo a 15 fps, pero no se publica la frecuencia de inferencia en el brazo.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT-SO101-Cube-to-Coaster-v2 (este) | 51,7 M | Pick-and-place de cubo sobre posavasos con SO-101 | no aplica | no disponible | Hugging Face, 0 descargas |
| Otras políticas ACT en LeRobot Hub | variable | Tareas de manipulación diversas | no aplica | variable según autor | Hugging Face |
| Políticas Diffusion Policy en LeRobot | variable | Manipulación por difusión de acciones | no aplica | variable según autor | Hugging Face |
| Políticas VLA (p. ej. RT-2, OpenVLA) | miles de millones | Manipulación generalista guiada por lenguaje | contexto textual amplio | variable | Hugging Face / investigación |

No se dispone de datos comparativos de rendimiento entre este checkpoint y alternativas concretas en la información proporcionada; la comparación se limita a categoría y escala.

## Limitaciones y advertencias

- Tasa de éxito baja y variable: 2 de 6 ensayos completos en la mejor configuración, con un caso de agarre sin liberación y varios fallos o ausencias de movimiento.
- Generalización muy limitada: el propio autor indica que funciona mejor cuando el cubo está en posiciones vistas durante las demostraciones.
- Alta sensibilidad al horizonte de acción: con `n_action_steps=25` el robot no llegaba a moverse, lo que exige ajuste manual del parámetro.
- Dataset pequeño: solo 22 demostraciones de teleoperación, insuficiente para robustez ante variaciones de iluminación, posición u objetos.
- Licencia no disponible: no puede asumirse uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: como toda política de imitación, puede ejecutar movimientos no previstos ante observaciones fuera de distribución.
- Sin soporte documentado de lenguaje, tool calling ni razonamiento simbólico; no es adecuado para tareas que requieran interpretación de instrucciones.
- Sin métricas de latencia, throughput ni consumo energético publicadas, lo que dificulta planificar su integración en un sistema en tiempo real.
- Fecha de creación y actualización muy próximas (2026-11-04), con 0 descargas y 0 likes: no hay validación independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/felixmurraytang/act-so101-cube-to-coaster-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/felixmurraytang/so101_cube_to_coaster_v2
- LeRobot (librería): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Paper de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- SO-101 (brazo robótico de bajo coste): https://github.com/TheRobotStudio/SO-ARM100
