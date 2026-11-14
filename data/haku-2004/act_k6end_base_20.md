# Haku-2004/act_k6end_base_20

## Resumen

`act_k6end_base_20` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada en Hugging Face por el usuario Haku-2004. El modelo no es un modelo de lenguaje: es una política visomotora entrenada con LeRobot que, a partir de observaciones visuales y del estado del robot, predice secuencias cortas de acciones (chunks) en lugar de pasos individuales. Esto reduce el error de acumulación y mejora la estabilidad en tareas de manipulación.

El modelo tiene 51.668.614 parámetros y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB. Está entrenado sobre el dataset `Haku-2004/k6_20_20261113_173939`, presumiblemente recogido mediante teleoperación, y se publica bajo licencia Apache 2.0. La arquitectura sigue el diseño original de ACT descrito en el paper arXiv 2304.13705, con un transformer que procesa observaciones y genera chunks de acciones.

Su relevancia es práctica: ofrece un checkpoint listo para usar con el stack LeRobot en tareas de robótica de imitación, lo que permite reproducir entrenamientos, evaluar políticas y desplegar control visomotor en robots tipo SO-100. Al ser un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, debe tratarse como un artefacto experimental más que como un modelo consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer para imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; procesa observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un decodificador de acciones que predice chunks de acciones de longitud fija. La política recibe observaciones (típicamente imágenes de cámaras y el estado de las articulaciones) y emite una secuencia de comandos motores, lo que permite un control más suave y robusto que la predicción paso a paso. El paper original introduce además el *temporal ensembling*, que agrega predicciones de chunks solapados para reducir la varianza.

El entrenamiento se realizó con LeRobot sobre el dataset `Haku-2004/k6_20_20261113_173939`, que no está descrito en detalle en la información disponible. No se especifican el número de episodios, la composición de las cámaras, la frecuencia de control ni si hubo aumento de datos. Tampoco se documenta el uso de RLHF, DPO u otras fases de ajuste; ACT es puramente supervisado sobre demostraciones teleoperadas.

## Capacidades

- Control visomotor para manipulación robótica: genera chunks de acciones a partir de observaciones visuales y del estado del robot.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Predicción de secuencias de acciones, no solo pasos individuales, lo que mejora la estabilidad.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Compatible con robots tipo SO-100 (el ejemplo de la model card usa `so100_follower`).
- No dispone de generación de texto, razonamiento lingüístico, código, matemáticas, visión general, tool calling ni capacidades de agente.

## Casos de uso

- Manipulación robótica de precisión: el modelo predice chunks de acciones que suavizan el control en tareas como recoger y colocar objetos, reduciendo el jitter típico de políticas paso a paso.
- Evaluación reproducible de políticas: con `lerobot-record` y `--policy.path` se puede ejecutar el checkpoint en un robot SO-100 durante un número fijo de episodios y medir la tasa de éxito.
- Reentrenamiento sobre datos propios: sirve como referencia de arquitectura y configuración para entrenar ACT con `lerobot-train` sobre nuevos datasets de teleoperación.
- Investigación en aprendizaje por imitación: permite comparar variantes de ACT, longitudes de chunk y esquemas de ensembling temporal sobre una base común.
- Prototipado de pipelines de robótica: al ser un repo ligero (0,2 GB) y con licencia Apache 2.0, se integra fácilmente en entornos de laboratorio y CI para pruebas de inferencia.
- Docencia y demostraciones: su tamaño reducido y su integración con LeRobot lo hacen adecuado para talleres sobre políticas visomotoras y control basado en aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros; en fp32 ocupa aproximadamente 0,21 GB y en fp16 unos 0,10 GB, por lo que la VRAM dominante será la de las cámaras y el resto del pipeline, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; se ha documentado el uso con `--policy.device=cuda`, y tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1660 en adelante, RTX 20/30/40, etc.).
- Opciones de despliegue: LeRobot (`lerobot-record` para inferencia, `lerobot-train` para entrenamiento); no se documentan exportaciones a vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; dependen del robot, la frecuencia de control y el número de cámaras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_k6end_base_20 | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face (LeRobot) |
| ACT original (paper 2304.13705) | no disponible | no aplica | resultados publicados en el paper | no disponible | paper y código de referencia |
| Diffusion Policy | no disponible | no aplica | no disponible en esta ficha | no disponible | implementaciones públicas |
| Políticas LeRobot ACT genéricas | variable | no aplica | no disponible | según checkpoint | Hugging Face |

No se dispone de datos comparativos cuantitativos entre estos modelos en la información proporcionada; la comparación debe hacerse empíricamente sobre el mismo robot y dataset.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay evidencia comunitaria de su calidad ni de su tasa de éxito real.
- Entrenado sobre un único dataset (`k6_20_20261113_173939`) cuyas características no se documentan; probablemente no generaliza fuera de la distribución de ese dataset.
- Sin información sobre sesgos, pero al ser una política visomotora puede heredar sesgos de las demostraciones (posiciones, objetos, iluminación, disposición del entorno).
- Riesgo de fallo en entornos distintos a los de entrenamiento; no hay evaluación publicada de robustez.
- No soporta idiomas ni tareas de lenguaje: no debe usarse como modelo de texto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Para producción se recomienda validar en el robot objetivo, con episodios de evaluación suficientes y monitorización de seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/Haku-2004/act_k6end_base_20
- Paper ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k6_20_20261113_173939
