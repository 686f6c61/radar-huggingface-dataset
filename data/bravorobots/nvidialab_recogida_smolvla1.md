# BravoRobots/nvidialab_recogida_smolvla1

## Resumen

BravoRobots/nvidialab_recogida_smolvla1 es un modelo de vision-language-action (VLA) para robótica, desarrollado por BravoRobots como fine-tuning del modelo base `lerobot/smolvla_base`. Está entrenado sobre el dataset `BravoRobots/nvidialab_recogida` y utiliza la librería LeRobot de Hugging Face para el entrenamiento y la inferencia. El modelo está diseñado para generar acciones de manipulación robótica a partir de observaciones visuales y consignas de lenguaje, lo que lo hace adecuado para tareas de recogida de objetos en entornos controlados.

Con un total de 450.046.176 parámetros y un tamaño de repositorio de 1,2 GB, se trata de un modelo compacto dentro de la categoría de los VLA. Según la model card, SmolVLA es un modelo eficiente que logra un rendimiento competitivo a coste computacional reducido y puede desplegarse en hardware de consumo. El modelo se distribuye bajo licencia Apache 2.0 y está publicado en Hugging Face con el pipeline `robotics`, aunque no existen métricas de benchmarks ni evaluaciones publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA; detalles de arquitectura no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/smolvla_base`, que a su vez pertenece a la familia SmolVLA descrita en el paper arXiv:2506.01844. SmolVLA se define como un modelo de vision-language-action compacto y eficiente, orientado a reducir costes computacionales y permitir el despliegue en hardware de consumo. El entrenamiento se realizó con la librería LeRobot, tal como se indica en la model card, sobre el dataset `BravoRobots/nvidialab_recogida`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. La única innovación destacable documentada es la propia naturaleza del modelo: combinar percepción visual, comprensión de lenguaje y generación de acciones en un único modelo compacto.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales y consignas de lenguaje.
- Integración nativa con LeRobot para entrenamiento, evaluación e inferencia.
- Despliegue en hardware de consumo, según la descripción del autor.
- Formato de pesos safetensors, compatible con el ecosistema LeRobot.
- No se han documentado capacidades de tool calling, razonamiento multi-step ni soporte de agentes en la información disponible.
- No se han documentado capacidades de generación de texto, visión o audio fuera del ámbito de la robótica.

## Casos de uso

- Recogida de objetos en laboratorios de robótica: el modelo puede controlar un brazo robótico para tareas de pick-and-place, utilizando el dataset de recogida sobre el que fue entrenado. Su tamaño compacto facilita la experimentación en entornos académicos.
- Automatización de logística en almacenes: puede integrarse en sistemas de manipulación de paquetes para tareas de recogida y colocación, reduciendo la necesidad de hardware de alto rendimiento gracias a su eficiencia computacional.
- Robótica asistencial: en entornos controlados, el modelo puede asistir en la recogida de objetos para personas con movilidad reducida, siempre que el entorno se ajuste a las condiciones del entrenamiento.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar políticas VLA compactas frente a modelos más grandes, gracias a su integración con LeRobot y su licencia Apache 2.0.
- Prototipado rápido de políticas robóticas: los desarrolladores pueden usar este modelo como punto de partida para fine-tuning en nuevos datasets, aprovechando el pipeline de LeRobot.
- Docencia y demostraciones de robótica: el modelo permite mostrar el funcionamiento de un VLA en hardware de consumo, lo que resulta útil en cursos de robótica o inteligencia artificial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni métricas de rendimiento robótico (como tasa de éxito en episodios) para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 450.046.176 parámetros, una estimación orientativa en precisión fp16 sería de aproximadamente 900 MB de VRAM, más overhead de activaciones; en fp32, alrededor de 1,8 GB. Estos valores son cálculos técnicos, no datos proporcionados por el autor.
- GPU recomendadas: no disponible. Dado su tamaño compacto, es probable que funcione en GPUs de consumo como la RTX 3060 o superiores, pero no existe especificación oficial.
- Opciones de despliegue: mediante LeRobot, usando el formato safetensors. No se conocen integraciones con vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de robótica y no de un modelo de lenguaje generalista.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría. El modelo es un fine-tuning de `lerobot/smolvla_base`, pero no se han documentado otros fine-tunings públicos con los que comparar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo está especializado en la tarea de recogida del dataset `nvidialab_recogida`; es probable que no generalice bien a otros entornos, objetos o configuraciones de robot.
- No se han publicado evaluaciones exhaustivas, benchmarks ni análisis de sesgos. El riesgo de comportamientos no deseados en producción no puede descartarse.
- Al ser un modelo de acciones robóticas, no aplican las limitaciones típicas de alucinación de los modelos de lenguaje, pero sí existe riesgo de acciones incorrectas si las observaciones visuales o las consignas de lenguaje no se ajustan al dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende del dataset y del modelo base; es necesario verificar las condiciones de uso del dataset `BravoRobots/nvidialab_recogida`.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad ni probado en entornos de producción.

## Enlaces

- Hugging Face: https://huggingface.co/BravoRobots/nvidialab_recogida_smolvla1
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- LeRobot: https://github.com/huggingface/lerobot
- Dataset: https://huggingface.co/datasets/BravoRobots/nvidialab_recogida
- Modelo base: https://huggingface.co/lerobot/smolvla_base
