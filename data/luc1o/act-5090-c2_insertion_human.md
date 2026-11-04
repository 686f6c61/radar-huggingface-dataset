# LUC1O/act-5090-C2_insertion_human

## Resumen

ACT-5090-C2_insertion_human es un modelo de política robótica basado en la arquitectura ACT (Action Chunking with Transformers), entrenado con la librería LeRobot de Hugging Face sobre el dataset simulado `lerobot/aloha_sim_insertion_human`. Lo desarrolla el usuario LUC1O y resuelve una tarea muy concreta: la inserción de una pieza (peg-in-hole) con un brazo ALOHA en el entorno de simulación `AlohaInsertion-v0`. No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino un controlador de imitación que mapea observaciones visuales y propioceptivas a secuencias de acciones discretas.

El modelo tiene 51.685.006 parámetros y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB. Se entrenó con los hiperparámetros oficiales de ACT (batch 8, learning rate 1e-5, chunk de 100, 100.000 pasos) sobre una única GPU RTX 5090, según indica la model card.

Su relevancia es acotada pero útil: sirve como referencia reproducible de entrenamiento de ACT en hardware consumer (RTX 5090) y como punto de comparación de rendimiento en una tarea estándar de manipulación. El resultado reportado es de 11,5 % de éxito (23 de 200 episodios, IC 95 % de Wilson 7,8–16,7), lo que lo sitúa como una línea base modesta más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunk de acciones de 100) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder para imitación robótica que predice chunks de acciones (secuencias de 100 pasos) a partir de observaciones. Combina un backbone visual (habitualmente ResNet) que procesa las imágenes de las cámaras del robot con un encoder transformer que fusiona la observación visual con el estado propioceptivo (posiciones articulares), y un decoder transformer que genera la secuencia de acciones. El chunking de acciones reduce el error de compounding y suaviza el control.

El entrenamiento se realizó con LeRobot (commit `ba83e4c`) usando los hiperparámetros oficiales de ACT: batch de 8, learning rate de 1e-5, chunk de 100 y 100.000 pasos, sobre una RTX 5090. El dataset es `lerobot/aloha_sim_insertion_human`, una colección de demostraciones humanas teleoperadas en simulación para la tarea de inserción. No se documentan en la información disponible detalles sobre aumentos de datos, composición exacta del dataset ni técnicas de regularización adicionales.

## Capacidades

- Control robótico de imitación para la tarea de inserción (peg-in-hole) en el entorno simulado `AlohaInsertion-v0`.
- Predicción de chunks de acciones de 100 pasos a partir de observaciones visuales y de estado.
- Ejecución autónoma de episodios completos en simulación mediante `lerobot-eval`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades fuera del control motor simulado.

## Casos de uso

- Reproducción de experimentos de ACT: sirve para replicar el pipeline de entrenamiento y evaluación de LeRobot en una tarea estándar, comparando resultados con los hiperparámetros oficiales.
- Línea base para investigación en imitación robótica: permite medir mejoras de nuevas variantes de ACT o de otros métodos sobre el mismo entorno y dataset.
- Validación de hardware consumer: el modelo demuestra el entrenamiento de una política ACT completa en una RTX 5090, útil para equipos con presupuesto limitado que quieran evaluar viabilidad.
- Pruebas de integración con LeRobot: se puede usar para verificar el correcto funcionamiento de `lerobot-eval`, entornos asíncronos y carga de políticas desde el Hub.
- Docencia y formación: ejemplo práctico de entrenamiento y evaluación de políticas de imitación con métricas reproducibles y scripts públicos.
- Comparación de estrategias de evaluación: el intervalo de confianza de Wilson reportado (7,8–16,7 %) permite ilustrar la variabilidad estadística en tareas de manipulación con tasas de éxito bajas.

## Benchmarks y rendimiento

| Benchmark | Entorno | Episodios | Tasa de éxito | IC 95 % (Wilson) |
|---|---|---|---|---|
| AlohaInsertion-v0 | aloha | 200 | 11,5 % (23/200) | 7,8–16,7 % |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros en fp32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: RTX 5090 (usada para el entrenamiento), así como GPUs consumer de gama media o alta para inferencia.
- Cabe en GPU consumer: sí, con margen amplio.
- Opciones de despliegue: `lerobot-eval` (comando documentado en la model card); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LUC1O/act-5090-C2_insertion_human | 51,7 M | no aplica (chunk 100) | 11,5 % éxito en AlohaInsertion-v0 | no disponible | Hugging Face |
| Políticas ACT oficiales de LeRobot | no disponible | no disponible | no disponible en la información proporcionada | no disponible | Hugging Face / LeRobot |
| Otros modelos ACT entrenados en aloha_sim_insertion_human | no disponible | no disponible | no disponible en la información proporcionada | no disponible | Hugging Face |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Tasa de éxito baja (11,5 %), con un intervalo de confianza amplio que llega hasta el 16,7 %; no es adecuado para uso en producción sin mejoras sustanciales.
- Entrenado exclusivamente en simulación (`aloha_sim_insertion_human`); no hay evidencia de transferencia a robots reales.
- Específico de una única tarea (inserción) y un único entorno; no generaliza a otras tareas de manipulación.
- Licencia no disponible: no se puede confirmar el uso comercial permitido.
- Sin información sobre sesgos del dataset de demostraciones ni sobre su composición.
- Riesgo de sobreajuste al dataset y a la configuración de evaluación; los resultados pueden variar con cambios en el entorno o en los parámetros de evaluación.
- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para tareas de texto.
- Los metadatos indican fecha de creación en 2026 y cero descargas; la trazabilidad y el mantenimiento del repositorio no están garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LUC1O/act-5090-C2_insertion_human
- Repositorio de benchmark, logs y scripts de reproducción: https://github.com/Jerryisqx/ACT-5090-benchmark
- Dataset: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human
- Librería LeRobot: https://github.com/huggingface/lerobot
