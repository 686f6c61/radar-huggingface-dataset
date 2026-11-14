# Haku-2004/act_k6e_pred_20

## Resumen

`act_k6e_pred_20` es una política de aprendizaje por imitación para robótica entrenada con Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705. En lugar de predecir una acción por paso de control, ACT predice fragmentos cortos de acciones (action chunks), lo que reduce el error acumulado y suaviza el comportamiento del robot en tareas de manipulación. El modelo lo publica el usuario Haku-2004 en el Hub de Hugging Face dentro del ecosistema LeRobot, la librería de Hugging Face para entrenamiento y despliegue de políticas robóticas.

El checkpoint tiene 51.672.714 parámetros (unos 51,7 millones) y ocupa 0,2 GB en safetensors, lo que lo sitúa en el rango de políticas ligeras que se ejecutan en tiempo real en hardware modesto. Se ha entrenado sobre el dataset `Haku-2004/k6_4seg` y está etiquetado para el pipeline `robotics` con licencia Apache 2.0. No es un modelo de lenguaje: no procesa texto ni mantiene conversaciones, sino que mapea observaciones sensoriales (típicamente imágenes de cámara y estado de las articulaciones) a comandos de actuación.

Su relevancia es práctica: ACT es uno de los métodos de referencia para imitación en robots de bajo coste (tipo SO-100/SO-101) y este checkpoint sirve como punto de partida reproducible para fine-tuning o evaluación con `lerobot-train` y `lerobot-record`. Al tener cero descargas y cero likes en el momento de la consulta, debe tratarse como un artefacto experimental de un autor individual, no como un modelo validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Action Chunking (ACT), política de imitación con encoder visual y decoder de acciones |
| Parametros totales | 51.672.714 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; procesa observaciones por paso y predice chunks de acciones) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT combina un backbone visual (codificador de imágenes tipo ResNet) con un transformer encoder-decoder que recibe las observaciones y predice un chunk de acciones futuras en una sola pasada. El decoder genera k acciones simultáneamente y, en la implementación de LeRobot, se aplica un mecanismo de temporal ensembling que promedia predicciones solapadas entre chunks para estabilizar el control. El modelo también incorpora una predicción auxiliar de estilo CVAE (latent variable) durante el entrenamiento para capturar la variabilidad de las demostraciones humanas.

El entrenamiento es de imitación supervisada sobre teleoperación: el dataset `Haku-2004/k6_4seg` proporciona pares observación-acción grabados con un robot real. No hay información pública sobre número de tokens, episodios, composición del dataset ni uso de RLHF/DPO; en ACT no se emplea refuerzo humano, sino aprendizaje supervisado de demostraciones. El nombre del checkpoint (`k6e_pred_20`) sugiere una configuración con chunk de 6 pasos y 20 épocas de entrenamiento, pero esto es una inferencia a partir del identificador y no un dato confirmado en la model card.

## Capacidades

- Predicción de chunks de acciones para control robótico de manipulación (por ejemplo, brazos tipo SO-100) a partir de observaciones visuales y de estado.
- Aprendizaje por imitación a partir de datos de teleoperación, sin necesidad de recompensas ni entorno simulado.
- Ejecución de políticas en tiempo real mediante `lerobot-record` sobre robots seguidores compatibles con LeRobot.
- Reentrenamiento y fine-tuning desde cero con `lerobot-train` sobre datasets propios en formato LeRobot.
- Integración con Weights & Biases para monitorización del entrenamiento (`--wandb.enable=true`).
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: es exclusivamente una política motora.

## Casos de uso

- Manipulación de laboratorio con robot de bajo coste: desplegar el checkpoint en un SO-100 follower mediante `lerobot-record` para tareas de pick-and-place aprendidas del dataset `k6_4seg`, aprovechando la ligereza de 51,7 M parámetros para control en tiempo real.
- Base para fine-tuning en una celula robotica propia: partir de estos pesos con `lerobot-train --policy.type=act` y adaptarlos a un nuevo dataset de teleoperación con la misma morfología de robot.
- Evaluacion comparativa de metodos de imitacion: usar ACT como linea base frente a políticas diffusion o VQ-BeT en experimentos controlados con el mismo dataset y numero de episodios.
- Prototipado rapido en investigacion academica: reproducir el pipeline completo LeRobot (entrenamiento, grabacion de evaluacion, metricas de exito) sin depender de infraestructura de simulacion pesada.
- Demostraciones educativas de aprendizaje por imitacion: el tamano reducido del repo (0,2 GB) permite clonarlo y ejecutarlo en estaciones de trabajo con una sola GPU consumer.
- Automatizacion de tareas repetitivas de corto horizonte: gracias a la prediccion de chunks de 6 pasos, el robot mantiene trayectorias suaves en operaciones como apilado o insercion simple, donde el error por paso individual degradaria la precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 51,7 M parámetros; holgadamente por debajo de 2 GB incluso con overhead de activaciones y buffers de imagen.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA, incluida RTX 3060, RTX 4090, A100 o H100; el cuello de botella será la latencia de captura de cámara, no el modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida para el runtime.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), entrenamiento con `lerobot-train`; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la frecuencia de control vendrá limitada por la configuración del robot y la cámara.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6e_pred_20 (este) | 51,7 M | ACT (imitación) | no aplica | Apache 2.0 | Hub de Hugging Face, 0 descargas |
| ACT original (paper 2304.13705) | no disponible en la informacion | ACT (imitación) | no aplica | no disponible | Codigo y pesos de referencia en el repositorio del paper |
| Diffusion Policy | no disponible en la informacion | Política diffusion | no aplica | no disponible | Implementaciones públicas en LeRobot y repositorios asociados |
| VQ-BeT | no disponible en la informacion | Política discreta con transformer | no aplica | no disponible | Implementación en LeRobot |

No se dispone de datos de rendimiento comparativo entre estas políticas en la información proporcionada.

## Limitaciones y advertencias

- Es una política específica para la morfología y el dataset de entrenamiento (`k6_4seg`); generalizar a otro robot, cámara o distribución de objetos requerirá fine-tuning.
- No hay métricas de éxito publicadas ni validación independiente; el checkpoint tiene cero descargas y cero likes, por lo que su calidad no está contrastada por la comunidad.
- Riesgo de sobreajuste al entorno de recogida de datos: cambios de iluminación, fondo o posición inicial pueden degradar el comportamiento.
- No es un modelo de lenguaje: no procesa instrucciones en texto ni admite tool calling; cualquier expectativa de razonamiento simbólico es inaplicable.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; para producción deben evaluarse sesgos del dataset, seguridad física del robot y protocolos de parada de emergencia.
- La fecha de creación indicada (2026-11-14) y la ausencia de documentación adicional impiden verificar el proceso exacto de entrenamiento; el identificador `k6e_pred_20` no está confirmado como chunk de 6 pasos y 20 épocas.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita el despliegue en runtimes que no sean LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k6e_pred_20
- Paper ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_4seg
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
