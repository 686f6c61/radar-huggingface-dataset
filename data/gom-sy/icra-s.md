# Gom-sy/ICRA-S

## Resumen

ICRA-S es una política robótica de manipulación bimanual desarrollada por Gom-sy, basada en el modelo fundacional NVIDIA GR00T-N1.6-3B y fine-tuneada específicamente para el robot Hello Robot Stretch en tareas de servicio de café (cup-serving). El modelo procesa observaciones de doble cámara (cámara de cabeza y cámara de pinza) y genera acciones relativas normalizadas para controlar el brazo y la pinza del robot.

El modelo resuelve el problema de adaptar un modelo fundacional de robótica a un embodiment concreto (el Stretch) mediante un fine-tuning eficiente que solo actualiza el proyector y la cabeza de difusión, manteniendo congelados el vision tower y el LLM. Su relevancia radica en que demuestra un pipeline completo de adaptación con datos limitados (120 episodios) combinando datos reales, relighted y pseudo-etiquetados, con un proceso de preprocesamiento cuidadoso que incluye companding mu-law y normalización por percentiles. El checkpoint está pensado para inferencia y evaluación, no para reanudar entrenamiento, ya que no incluye el estado del optimizador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T-N1.6-3B (vision tower + LLM + proyector + cabeza de difusion) |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ICRA-S parte del modelo NVIDIA GR00T-N1.6-3B, un modelo fundacional de robótica que combina un vision tower, un LLM y una cabeza de difusión para generar acciones. El fine-tuning se realizó sobre un corpus de 120 episodios de servicio de café con observaciones de doble cámara (head + gripper), totalizando 214.566 frames. El entrenamiento duró 27 épocas con un batch global de 64, completando 90.520 pasos en 31 horas y 20 minutos sobre 2 GPUs A100-PCIE-40GB, alcanzando una pérdida final de 0,0060 (media de los últimos 50 pasos).

Solo se ajustaron el proyector y la cabeza de difusión; el vision tower y el LLM permanecieron congelados. El preprocesamiento incluye letterbox padding a 320x320, representación de acciones relativas normalizadas con `relative_stats.json`, companding mu-law (mu=3) en las dimensiones de muñeca y pinza, anclas de normalización por percentil q99, y recorte de la dimensión del brazo en q01=0.0. Los 60 episodios pseudo-etiquetados provienen de un modelo de dinámica inversa entrenado con datos de doble cámara y mu-law, admitidos mediante una puerta que combina un umbral de correlación global y un umbral NMAE por ventana.

## Capacidades

- Generación de acciones de manipulación para el robot Stretch a partir de observaciones visuales de doble cámara (head + gripper).
- Control de brazo y pinza con representación de acciones relativas normalizadas.
- Servicio de café (cup-serving): recoger, transportar y entregar tazas.
- Adaptación a un embodiment concreto (Stretch) mediante fine-tuning eficiente de un modelo fundacional.
- Inferencia y evaluación de políticas robóticas en entornos de investigación.
- Manejo de datos con companding mu-law para dimensiones de muñeca y pinza, lo que mejora la resolución de acciones pequeñas.

## Casos de uso

- Investigación en manipulación robótica: el modelo sirve como punto de partida para estudiar la adaptación de modelos fundacionales a robots concretos con datos limitados, especialmente en el ámbito de la manipulación diestra.
- Desarrollo de políticas para el robot Stretch: investigadores que trabajen con Hello Robot Stretch pueden desplegar esta política para tareas de servicio de café y evaluar su rendimiento en entornos reales.
- Benchmarking de pipelines de datos aumentados: el corpus combina datos reales, relighted y pseudo-etiquetados, lo que permite comparar la eficacia de diferentes estrategias de aumento de datos en robótica.
- Evaluación de técnicas de normalización y preprocesamiento: el uso de mu-law companding y normalización por percentiles puede servir como referencia para otros pipelines de entrenamiento de políticas robóticas.
- Estudio de fine-tuning eficiente: al congelar el vision tower y el LLM, el modelo demuestra un enfoque de adaptación con bajo coste computacional que puede replicarse en otros embodiments.
- Educación y formación en robótica con IA: el checkpoint permite a estudiantes y desarrolladores experimentar con una política real de manipulación sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida final de entrenamiento (0,0060) y métricas de entrenamiento como pasos, épocas y tiempo de cómputo, pero no incluye métricas de evaluación como tasa de éxito en tareas reales o simuladas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero al tratarse de un modelo de 3,3B parámetros, se estima que requiere entre 8-12 GB en FP16 y entre 4-6 GB en cuantización INT8 o 4-bit.
- GPU recomendadas: el entrenamiento se realizó con 2x A100-PCIE-40GB, pero para inferencia una GPU consumer de gama alta como RTX 3090, RTX 4090 o superior sería suficiente.
- Compatibilidad con GPUs consumer: sí, cabe en GPUs consumer con al menos 12 GB de VRAM en FP16, y en GPUs con 8 GB si se cuantiza.
- Opciones de despliegue: al ser un modelo de robótica con pipeline de visión y difusión, el despliegue requiere un entorno con ROS o similar; no es directamente compatible con vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje puros.
- Latencia y throughput: no disponibles. La inferencia depende del hardware y del entorno robótico; el modelo genera acciones relativas que deben ejecutarse en tiempo real en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| ICRA-S (Gom-sy) | 3,3B | no disponible | Fine-tuning de GR00T-N1.6-3B para Stretch, tarea de servicio de café | Apache-2.0 |
| Gom-sy/stretch-icra-run-e | no disponible | no disponible | Checkpoint privado de investigación para experimentos de política de servicio de café en Stretch | no disponible |
| Gom-sy/stretch-icra-run-a | no disponible | no disponible | Checkpoint privado de investigación para experimentos de política de servicio de café en Stretch | no disponible |
| NVIDIA GR00T-N1.6-3B (base) | 3,3B | no disponible | Modelo fundacional de robótica generalista | no disponible |

La comparativa se limita a los checkpoints relacionados del mismo autor y al modelo base. No se dispone de información suficiente sobre otros modelos comparables en la misma categoría (políticas robóticas para manipulación con doble cámara).

## Limitaciones y advertencias

- El checkpoint no incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento; solo sirve para inferencia y evaluación.
- El corpus de entrenamiento es reducido (120 episodios) y específico de la tarea de servicio de café; el modelo puede no generalizar bien a otras tareas o entornos.
- Los 60 episodios pseudo-etiquetados provienen de un modelo de dinámica inversa y pueden contener errores, a pesar de la puerta de admisión por correlación y NMAE.
- No se han publicado métricas de evaluación en entornos reales o simulados, por lo que se desconoce la tasa de éxito real de la política.
- El modelo está diseñado específicamente para el robot Stretch con observaciones de doble cámara; su uso en otros robots requeriría reentrenamiento o adaptación.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de idioma, al ser un modelo de acción robótica y no de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base GR00T-N1.6-3B puede tener restricciones adicionales que deben verificarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gom-sy/ICRA-S
- Checkpoint relacionado (Run E): https://huggingface.co/Gom-sy/stretch-icra-run-e
- Checkpoint relacionado (Run A): https://huggingface.co/Gom-sy/stretch-icra-run-a
- Modelo base NVIDIA GR00T-N1.6-3B: https://huggingface.co/nvidia/GR00T-N1.6-3B
