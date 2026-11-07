# fecasado/gact-kitchen-tomato-baseline

## Resumen

`gact-kitchen-tomato-baseline` es una política de robótica (policy) entrenada con LeRobot y publicada por el usuario `fecasado` en Hugging Face. No es un modelo de lenguaje: es un modelo de imitación (imitation learning) que mapea observaciones visuales y de estado del robot a acciones de control, orientado a una tarea concreta de manipulación en cocina (denominada "tomato-to-plate" en el dataset asociado). Su relevancia es acotada: se trata de un checkpoint de referencia ("baseline") para una tarea específica, no de un modelo de propósito general.

El modelo emplea la arquitectura Gaze-ACT (variante de ACT, Action Chunking Transformer, con mecanismo de atención sobre la mirada/gaze), empaquetada en la librería LeRobot de Hugging Face. Cuenta con 51.664.538 parámetros reales según los pesos en safetensors, un tamaño de repositorio de 0,2 GB y licencia Apache 2.0. Se entrenó sobre el dataset `fecasado/tomato-to-plate-320x240`, con resolución de imagen de 320x240.

La información pública disponible es mínima: la model card es una plantilla autogenerada por LeRobot sin detalles de entrenamiento, hiperparámetros, métricas ni resultados de evaluación. Las descargas y los "likes" son cero en el momento de la consulta, lo que sugiere un artefacto de investigación personal más que un modelo con validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gaze-ACT (Action Chunking Transformer con atención de mirada), sobre LeRobot |
| Parametros totales | 51.664.538 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no aplica: modelo de robótica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es Gaze-ACT, una variante de ACT (Action Chunking Transformer) que incorpora un mecanismo de atención sobre información de mirada (gaze). ACT es un transformer que predice "chunks" de acciones (secuencias de comandos de control de varios pasos) a partir de observaciones visuales y de estado del robot, lo que reduce el error de acumulación típico de las políticas paso a paso. El prefijo "Gaze" indica la incorporación de señales de atención visual o de seguimiento de la mirada del operador o del sensor, aunque la model card no detalla el mecanismo exacto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset más allá de su nombre (`tomato-to-plate-320x240`, que sugiere episodios de demostración de transferencia de un tomate a un plato a resolución 320x240), ni sobre si se aplicaron técnicas de RLHF, DPO o data augmentation. La model card es una plantilla estándar de LeRobot que no ha sido cumplimentada por el autor, por lo que los detalles de entrenamiento no están disponibles.

## Capacidades

- Control robótico por imitación: genera comandos de acción (chunks) a partir de observaciones visuales y de estado, adecuado para tareas de manipulación.
- Manipulación de objetos en entorno de cocina: la tarea de referencia es la transferencia de un tomate a un plato.
- Entrada visual a 320x240 píxeles, según el nombre del dataset de entrenamiento.
- Integración con LeRobot: entrenamiento e inferencia mediante `lerobot-train` y `lerobot-record`.
- Compatible con robots tipo SO-100 follower (según el ejemplo de la model card).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: no es un modelo de lenguaje.
- Capacidades multilingües: no aplica.

## Casos de uso

- Investigación en imitation learning: servir como baseline de referencia para comparar variantes de ACT/Gaze-ACT en la misma tarea de manipulación, usando el dataset `tomato-to-plate-320x240` como denominador común.
- Reproducción de experimentos: permite a un investigador reproducir el pipeline de entrenamiento de LeRobot con una política preentrenada y verificar la reproducibilidad de los resultados en un robot SO-100.
- Evaluación de políticas en simulación o laboratorio: el checkpoint puede desplegarse con `lerobot-record` para medir la tasa de éxito de la tarea de transferencia de tomate a plato en 10 episodios, como sugiere la propia model card.
- Punto de partida para fine-tuning: al ser un baseline con licencia Apache 2.0, puede ajustarse con datos propios de una tarea similar (por ejemplo, otras transferencias de alimentos) y comparar la mejora frente al punto de partida.
- Docencia y formación en robótica: ejemplo práctico y ligero (0,2 GB, 51,7 M de parámetros) para enseñar el flujo completo de LeRobot, desde la recogida de datos hasta la inferencia en hardware real.
- Benchmark interno de infraestructura: por su tamaño reducido, es útil para validar pipelines de despliegue en GPUs de gama baja o en el propio robot antes de escalar a políticas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de tasa de éxito, error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en precisión de entrenamiento (probablemente fp32, ~207 MB de pesos), la huella en memoria es inferior a 1 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; una RTX 3060 o superior es más que adecuada. Para entrenamiento, una RTX 4090 o A100 acelera la convergencia, pero no es imprescindible por el tamaño del modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM efectiva considerando el resto del pipeline (visión, buffers).
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gact-kitchen-tomato-baseline | 51,7 M | no aplica | no disponible | Apache 2.0 | Hugging Face |
| fecasado/gact-kitchen-tomato-multi | 51,7 M | no aplica | no disponible | no disponible | Hugging Face |
| fecasado/gfm-kitchen-tomato-baseline | no disponible | no aplica | no disponible | no disponible | Hugging Face |

Los dos modelos comparables encontrados son del mismo autor y de la misma familia de tareas (gaze_flow_matching y variante multi), por lo que la comparación se limita a la existencia de alternativas dentro del mismo repositorio personal; no hay datos públicos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset específico de una tarea, la política puede sobreajustarse a las condiciones de iluminación, posiciones de cámara y configuración de robot del dataset.
- Riesgo de alucinación: no aplica en el sentido de modelos de lenguaje, pero existe riesgo de generalización pobre fuera de la distribución de entrenamiento (objetos, fondos o posiciones no vistas).
- Limitaciones de contexto o idioma: no aplica; la limitación relevante es la resolución de entrada (320x240) y la tarea concreta.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia del dataset asociado.
- Caveats para producción: la model card es una plantilla sin cumplimentar, sin métricas de éxito ni instrucciones específicas de seguridad; no se recomienda su uso en entornos reales sin una evaluación previa exhaustiva. El modelo tiene cero descargas y cero "likes", lo que indica ausencia de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/fecasado/gact-kitchen-tomato-baseline
- Modelo relacionado (multi): https://huggingface.co/fecasado/gact-kitchen-tomato-multi
- Modelo relacionado (gfm baseline): https://huggingface.co/fecasado/gfm-kitchen-tomato-baseline
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
