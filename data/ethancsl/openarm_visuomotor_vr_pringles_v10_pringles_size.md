# ethanCSL/openarm_visuomotor_VR_pringles_V10_pringles_size

## Resumen

Este modelo es una política visuomotora (vision-language-action, VLA) entrenada sobre el modelo base `lerobot/smolvla_base` mediante la librería LeRobot. Está diseñada para controlar un brazo robótico OpenArm en tareas de manipulación de objetos, concretamente recoger un bote de Pringles, a partir de demostraciones teleoperadas con realidad virtual. El desarrollo corre a cargo de ethanCSL, que ha publicado tanto el dataset de entrenamiento como el propio modelo en Hugging Face.

La relevancia de este modelo radica en que SmolVLA, su arquitectura base, está pensada para ejecutarse en hardware de consumo, lo que abarata la investigación en robótica de manipulación. Con 450 millones de parámetros, es significativamente más compacto que otros VLA como OpenVLA (7B) o RT-2 (55B), lo que permite su despliegue en GPU domésticas. El modelo se distribuye bajo licencia Apache 2.0 y los pesos están en formato safetensors. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin especificar precisión) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual y un modelo de lenguaje para producir comandos de articulación del robot. Según el paper asociado (arxiv:2506.01844), está diseñado para ser eficiente y desplegable en hardware de consumo, a diferencia de VLA más grandes. El modelo aquí presentado es un fine-tuning de `lerobot/smolvla_base` sobre el dataset `ethanCSL/openarm_visuomotor_VR_pringles_V10_pringles_size`, que contiene demostraciones de teleoperación con realidad virtual de un brazo OpenArm manipulando un bote de Pringles. No se dispone de detalles sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Control visuomotor: recibe imágenes de cámara y genera comandos de posición articular para el brazo robótico.
- Manipulación de objetos específicos: entrenado para recoger un bote de Pringles, aunque puede generalizar a objetos similares si el dataset lo permite.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento e inferencia de LeRobot, incluyendo la grabación de episodios y evaluación.
- Ejecución en hardware de consumo: gracias al tamaño compacto de SmolVLA, puede ejecutarse en GPU domésticas sin necesidad de servidores dedicados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni soporte multilingüe, ya que es un modelo puramente robótico.

## Casos de uso

- Investigación en aprendizaje por imitación: permite reproducir experimentos de manipulación robótica con un brazo de bajo coste (OpenArm) y un modelo de 450M parámetros, facilitando la comparación entre políticas.
- Automatización de tareas de picking and placing: el modelo puede integrarse en celdas de evaluación estandarizadas como la OpenArm Cell para automatizar la recogida de objetos en entornos controlados.
- Desarrollo de prototipos de robótica asistida: sirve como punto de partida para fine-tuning en tareas de manipulación similares, reduciendo el tiempo de entrenamiento desde cero.
- Evaluación de políticas en entornos reproducibles: al estar entrenado con un dataset específico y estandarizado, puede usarse para verificar la repetibilidad de resultados entre distintos laboratorios.
- Educación en robótica: por su tamaño reducido y licencia permisiva, es adecuado para cursos universitarios que necesiten un modelo VLA ejecutable en estaciones de trabajo con GPU convencional.
- Benchmarking de VLA compactos: puede compararse con otras políticas del mismo tamaño para estudiar el equilibrio entre rendimiento y coste computacional en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper de SmolVLA (arxiv:2506.01844) puede contener métricas del modelo base, pero no se dispone de ellas en esta ficha.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 450M parámetros, la inferencia puede realizarse con menos de 4 GB de VRAM en FP16, y menos aún con cuantización, aunque no se especifica el formato exacto de los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090 o superiores. También es viable en hardware de Apple Silicon con Metal.
- Opciones de despliegue: LeRobot (entrenamiento e inferencia), y potencialmente otras herramientas como vLLM o llama.cpp si se convierte a GGUF, aunque no está documentado.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuración de la cámara y el robot.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. Sin embargo, SmolVLA se posiciona frente a otros VLA como OpenVLA (7B parámetros) y RT-2 (55B parámetros). La principal ventaja de SmolVLA es su tamaño reducido, que permite ejecutarse en hardware de consumo, mientras que OpenVLA y RT-2 requieren GPUs de mayor capacidad. La licencia Apache 2.0 es más permisiva que las de otros modelos propietarios. No hay métricas públicas que comparen el rendimiento de este fine-tuning específico con otros.

## Limitaciones y advertencias

- Especialización limitada: el modelo está entrenado para una tarea concreta (recoger un bote de Pringles) y puede no generalizar bien a otros objetos o entornos sin fine-tuning adicional.
- Sesgos del dataset: las demostraciones provienen de teleoperación con VR, por lo que el comportamiento aprendido refleja el estilo del operador y las condiciones del entorno de captura.
- Riesgo de alucinación en acciones: como todo modelo generativo, puede producir comandos de articulación no válidos o peligrosos si se usa fuera de su dominio de entrenamiento.
- Sin información sobre contexto: la longitud de contexto no está documentada, lo que limita la capacidad de planificar secuencias largas de acciones.
- Dependencia del ecosistema LeRobot: el modelo está empaquetado para LeRobot, por lo que su uso fuera de este framework requiere conversión y adaptación.
- Sin datos de rendimiento: al no haber benchmarks publicados, no es posible evaluar su eficacia frente a otras políticas de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_visuomotor_VR_pringles_V10_pringles_size
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_visuomotor_VR_pringles_V10_pringles_size
- Repositorio de OpenArm (brazo robótico): https://github.com/enactic/openarm
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Sitio web de OpenArm: https://openarm.dev/
