# Haku-2004/act_is120e_c50_base_20

## Resumen

`Haku-2004/act_is120e_c50_base_20` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face por el usuario Haku-2004 mediante el framework LeRobot. ACT predice fragmentos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de composición acumulado típico de las políticas paso a paso y suele elevar las tasas de éxito en tareas de manipulación aprendidas a partir de datos de teleoperación.

El modelo cuenta con 51.617.414 parámetros en formato safetensors (aproximadamente 0,2 GB de repositorio) y se distribuye bajo licencia Apache 2.0. Está entrenado sobre el dataset `Haku-2004/i_20261126_110221` y etiquetado con el pipeline `robotics` dentro del ecosistema LeRobot, lo que facilita su entrenamiento, evaluación y despliegue con las herramientas oficiales de Hugging Face.

Su relevancia es acotada pero práctica: es un checkpoint de política concreto y reproducible para un robot y una tarea determinados, útil para quien quiera reproducir el pipeline de ACT con LeRobot o partir de un modelo ya entrenado en lugar de entrenar desde cero. No es un modelo de lenguaje general ni un modelo fundacional multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder de observaciones y decoder de acciones con chunking |
| Parametros totales | 51.617.414 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; ACT opera sobre ventanas de observación definidas en la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robótica, sin procesamiento de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con un esquema de predicción por chunks: en lugar de emitir una única acción por paso, el modelo genera una secuencia corta de acciones futuras, lo que mitiga el problema de la varianza en la predicción paso a paso y mejora la estabilidad en tareas de manipulación fina. La arquitectura incorpora habitualmente un encoder visual y propioceptivo y un decoder que produce el chunk de acciones, con un mecanismo de agregación temporal (temporal ensembling) en inferencia para suavizar las predicciones.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/i_20261126_110221`, compuesto por episodios de teleoperación. No se dispone de información pública sobre el número de episodios, el número de tokens o frames de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos o regularización específicas. El nombre del checkpoint (`is120e_c50_base_20`) sugiere una configuración concreta de entrenamiento (posiblemente 120 episodios, chunk size 50 y una variante base), pero este dato no está confirmado en la model card.

## Capacidades

- Predicción de acciones robóticas en forma de chunks a partir de observaciones visuales y propioceptivas.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas explícitas.
- Control de robots manipuladores compatibles con LeRobot (por ejemplo, el formato `so100_follower` que aparece en los comandos de evaluación de la model card).
- Entrenamiento y evaluación reproducibles mediante los comandos `lerobot-train` y `lerobot-record`.
- Integración con el Hub de Hugging Face para versionado y despliegue de checkpoints.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es una política de control motor, no un modelo generativo de texto.

## Casos de uso

- Manipulación robótica de laboratorio: usar el checkpoint como punto de partida para tareas de pick-and-place entrenadas con teleoperación, aprovechando el chunking de ACT para reducir la acumulación de error en secuencias largas.
- Reproducción de experimentos de imitation learning: cargar el modelo con `lerobot-record` y `--policy.path` para validar la tasa de éxito sobre el mismo entorno y dataset de entrenamiento.
- Fine-tuning sobre nuevos datasets: reentrenar con `lerobot-train --policy.type=act` partiendo de este checkpoint para adaptarlo a una tarea o robot distinto con menos datos.
- Evaluación comparativa de políticas: usar este modelo como baseline ACT frente a otras políticas de LeRobot (diffusion policy, VQ-BeT, etc.) en el mismo entorno.
- Prototipado de pipelines de robot learning: integrar el checkpoint en un flujo de captura de datos, entrenamiento y despliegue con LeRobot para validar la infraestructura antes de escalar a tareas más complejas.
- Docencia y demos de robótica: emplear un modelo pequeño (51,6 M de parámetros) que cabe en GPUs de consumo para ilustrar el ciclo completo de imitation learning en cursos o talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,6 M de parámetros en safetensors (aproximadamente 0,2 GB), la inferencia cabe holgadamente en cualquier GPU con 4 GB o más, e incluso podría ejecutarse en CPU para pruebas.
- GPU recomendadas: cualquier GPU NVIDIA moderna (RTX 3060, RTX 4090, A100, H100) es suficiente; el cuello de botella real será el encoder visual y el control en tiempo real del robot, no el tamaño del modelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU consumer actuales.
- Opciones de despliegue: LeRobot (`lerobot-record` para inferencia/evaluación), con soporte de PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware, de la frecuencia de control del robot y de la configuración de chunking.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Haku-2004/act_is120e_c50_base_20` | 51,6 M | ACT (imitation learning) | no aplica | Apache 2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | variable | ACT | no aplica | variable (habitualmente Apache 2.0) | Hugging Face |
| Diffusion Policy (LeRobot) | variable | diffusion policy | no aplica | variable | Hugging Face / repositorios de investigación |
| VQ-BeT (LeRobot) | variable | behavior transformer | no aplica | variable | Hugging Face / repositorios de investigación |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo específico para una tarea y un robot concretos: no es un modelo general; su rendimiento fuera del entorno de entrenamiento será probablemente deficiente.
- No hay métricas publicadas de tasa de éxito ni de robustez, por lo que no se puede evaluar su calidad sin reproducir la evaluación.
- Riesgo de sobreajuste al dataset de teleoperación `Haku-2004/i_20261126_110221`, cuya composición y tamaño no se documentan.
- Sin información sobre sesgos: al ser un modelo de control motor, los sesgos relevantes serían los del dataset de demostración (estilos de teleoperación, condiciones de iluminación, posiciones de objetos), no sesgos lingüísticos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la procedencia del dataset de entrenamiento antes de un despliegue en producción.
- No apto para tareas de lenguaje, visión general, tool calling ni agentes; cualquier uso fuera de robótica de imitación es inadecuado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_is120e_c50_base_20
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/i_20261126_110221
