# Haku-2004/act_k5oe_input_20

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones ("action chunks") en lugar de pasos individuales. Este repositorio concreto, `Haku-2004/act_k5oe_input_20`, es una política entrenada con LeRobot sobre el dataset `Haku-2004/k5_4seg` y publicada en Hugging Face con licencia Apache 2.0. Está pensado para controlar un robot manipulador tipo SO-100 (el ejemplo de evaluación de la model card usa `so100_follower`).

El modelo tiene 51.671.174 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real sobre hardware modesto. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que mapea observaciones (típicamente imágenes de cámaras y estado de las articulaciones) a comandos motores.

Su relevancia es acotada: se trata de un checkpoint experimental de un autor individual, con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados y sin documentación sobre el dataset de entrenamiento más allá de su identificador. Resulta útil como ejemplo reproducible de un pipeline LeRobot/ACT, pero no como política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.671.174 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre ventanas de observación definidas por la política) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes GGUF/cuantizadas) |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | Haku-2004/k5_4seg |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT se basa en un transformer que combina un backbone visual (encoder de imágenes de las cámaras del robot) con un decoder que genera un chunk de acciones de longitud fija en una sola pasada, en lugar de predecir acción a acción. Esta formulación reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad en tareas de manipulación. El método se describe en el paper arXiv:2304.13705 y está implementado en la librería LeRobot de Hugging Face.

El entrenamiento es de imitación supervisada sobre datos de teleoperación. En este caso concreto, el autor indica que la política se entrenó con `lerobot-train` sobre el dataset `Haku-2004/k5_4seg`, pero no se especifican el número de episodios, la composición de las observaciones, la configuración de cámaras, la frecuencia de control ni si se aplicaron aumentos de datos. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste posterior; en ACT esto no es habitual, ya que el paradigma es puramente de cloning de comportamiento.

## Capacidades

- Predicción de chunks de acciones para control de robots manipuladores, en lugar de comandos individuales.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Procesamiento de observaciones visuales y de estado de las articulaciones (según la configuración estándar de ACT en LeRobot).
- Integración nativa con el ecosistema LeRobot: entrenamiento con `lerobot-train`, evaluación e inferencia con `lerobot-record`.
- Compatible con robots tipo SO-100 (`so100_follower`) según el ejemplo de la model card.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de investigación en imitación: sirve como checkpoint de referencia para comparar configuraciones de entrenamiento ACT sobre el mismo dataset (`k5_4seg`) y medir tasas de éxito con `lerobot-record`.
- Evaluación de pipelines LeRobot: permite validar de extremo a extremo el flujo de entrenamiento y despliegue en un robot SO-100 antes de escalar a datasets mayores.
- Docencia y formación en robótica de imitación: al ser un modelo pequeño (51,7 M de parámetros, 0,2 GB) puede cargarse en un portátil con GPU consumer para demostraciones en clase.
- Prototipado rápido de tareas de manipulación: si la tarea del dataset `k5_4seg` coincide con la que se quiere automatizar, la política puede desplegarse directamente con `lerobot-record --policy.path=Haku-2004/act_k5oe_input_20`.
- Base para fine-tuning: al estar bajo Apache 2.0 y en formato safetensors, puede reentrenarse con nuevos datos teleoperados y servir de inicialización para tareas relacionadas.
- Benchmark interno de latencia: útil para medir el coste de inferencia de una política ACT de ~52 M de parámetros en el hardware objetivo del robot antes de comprometerse con arquitecturas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de acción ni comparaciones con otras políticas, y el repositorio registra cero descargas en el momento de la consulta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,7 M de parámetros en fp32 ocupan aproximadamente 207 MB; en fp16, unos 103 MB), más el coste del encoder visual y de los buffers de observación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con suficiente memoria compartida para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), que es la vía documentada por el autor. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones de frecuencia de control ni de tiempo de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haku-2004/act_k5oe_input_20 | 51,7 M | ACT (LeRobot) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot | no disponible | ACT | no aplica | Apache 2.0 (segun repo) | Hugging Face / docs LeRobot |
| Diffusion Policy (implementación LeRobot) | no disponible | diffusion policy | no aplica | no disponible | Hugging Face / docs LeRobot |
| Otros checkpoints ACT de terceros | variable | ACT | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada; la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental de un autor individual, sin benchmarks publicados ni validación externa; no debe tratarse como política lista para producción.
- El rendimiento depende críticamente del dataset `Haku-2004/k5_4seg`, cuya composición, tamaño y calidad no están documentados en la información disponible.
- No hay información sobre el robot exacto, la configuración de cámaras ni la frecuencia de control usados en el entrenamiento, lo que dificulta reproducir el entorno de evaluación.
- Riesgo de sobreajuste al entorno de demostración: las políticas de imitación suelen degradarse ante cambios de iluminación, posición de objetos o del propio robot.
- Sin capacidades lingüísticas ni de razonamiento: no es adecuado para tareas de texto, código o agentes conversacionales.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento antes de un despliegue comercial.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de que el checkpoint haya sido validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Haku-2004/act_k5oe_input_20
- Dataset de entrenamiento: https://huggingface.co/datasets/Haku-2004/k5_4seg
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
