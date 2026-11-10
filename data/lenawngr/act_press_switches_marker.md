# lenawngr/ACT_press_switches_marker

## Resumen

ACT_press_switches_marker es una política de imitación entrenada con el método Action Chunking with Transformers (ACT), publicada por el usuario lenawngr en Hugging Face a través de la librería LeRobot. El modelo resuelve una tarea robótica concreta: accionar interruptores de presión sobre un robot SO-101, aprendiendo de datos de teleoperación recogidos en el dataset `lenawngr/press_switches_so101`. No es un modelo de lenguaje generalista, sino un controlador visuomotor que mapea observaciones (imágenes de cámara y estado de las articulaciones) a secuencias cortas de acciones.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo real de política ACT empaquetada en formato LeRobot, con 51.668.614 parámetros y un repositorio de apenas 0,2 GB, lo que la hace ligera y fácil de desplegar en hardware modesto. Por otro, ACT es una de las referencias más citadas en aprendizaje por imitación para robótica de manipulación, y este checkpoint permite reproducir el flujo completo de entrenamiento y evaluación con `lerobot-train` y `lerobot-record`.

El modelo se distribuye bajo licencia Apache 2.0, está etiquetado con el pipeline `robotics` y no declara idiomas soportados, algo esperable en un modelo que no procesa texto. Su utilidad práctica se limita al robot y la tarea para los que fue entrenado, pero sirve como plantilla para adaptar ACT a otras tareas de pulsación o manipulación con el mismo brazo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de entrenamiento) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo visuomotor, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, librería lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. La arquitectura combina un codificador de imágenes (típicamente ResNet) con un transformer que atiende conjuntamente a las observaciones visuales y al estado de las articulaciones, y un decodificador que emite una secuencia de acciones de longitud fija. El modelo se entrenó con datos de teleoperación del dataset `lenawngr/press_switches_so101`, recogidos sobre un robot SO-101, y se empaquetó con LeRobot.

La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; en el contexto de ACT, el entrenamiento es supervisado sobre demostraciones y no incluye ajuste por preferencias. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal. La información disponible se limita al método ACT referenciado en el paper arXiv:2304.13705 y al flujo de entrenamiento estándar de LeRobot.

## Capacidades

- Control visuomotor para robótica de manipulación: genera secuencias de acciones a partir de imágenes y estado de articulaciones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Predicción de *action chunks* para reducir el error acumulado en tareas de contacto.
- Ejecución de tareas de pulsación de interruptores sobre el robot SO-101.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y registro de episodios.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades fuera de la percepción visual para control.

## Casos de uso

- Automatización de pulsación de interruptores en entornos de laboratorio: el modelo acciona interruptores de presión sobre un SO-101, útil para pruebas repetitivas de paneles de control.
- Generación de datos de evaluación para investigación en imitación: sirve como política de referencia para comparar variantes de ACT con el mismo dataset y robot.
- Prototipado rápido de tareas de contacto: al ser un checkpoint ligero (0,2 GB), permite iterar en la configuración de cámaras y articulaciones sin grandes costes de infraestructura.
- Reproducción de experimentos de LeRobot: el flujo `lerobot-train` y `lerobot-record` documentado permite replicar el entrenamiento y la evaluación en pocos comandos.
- Base para *fine-tuning* en tareas similares: se puede reentrenar con un dataset propio de pulsaciones o manipulaciones simples sobre el mismo brazo.
- Docencia y formación en robótica de imitación: ejemplo completo y de bajo coste para explicar ACT, action chunking y el pipeline de LeRobot en cursos prácticos.
- Validación de hardware SO-101: usar la política para comprobar el funcionamiento de cámaras, articulaciones y lazos de control antes de desplegar tareas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 millones de parámetros y pesos en safetensors, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; una RTX 3060, RTX 4090 o superior es más que suficiente. También es viable en CPU para inferencia, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna con soporte CUDA.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de dispositivo CUDA o CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles; dependen del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_press_switches_marker (este) | 51.668.614 | no disponible | no disponible | Apache 2.0 | Hugging Face, vía LeRobot |
| Otras políticas ACT en LeRobot Hub | variable | no disponible | no disponible | variable | Hugging Face |
| Diffusion Policy (referencia metodológica) | no disponible | no disponible | no disponible | no disponible | no disponible |
| RT-1 / RT-2 (referencia a gran escala) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre este checkpoint y alternativas concretas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea y un robot específicos (SO-101, pulsación de interruptores); no generaliza a otras tareas sin reentrenamiento.
- No se documentan sesgos, pero al ser un modelo visuomotor puede verse afectado por condiciones de iluminación, posición de cámara y variaciones del entorno no presentes en el dataset.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- No hay información sobre el tamaño ni la diversidad del dataset de entrenamiento, lo que limita la evaluación de su robustez.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- No se especifican requisitos de seguridad para la operación del robot; deben aplicarse protocolos de parada de emergencia y límites de fuerza.
- El repositorio no incluye resultados de benchmarks ni métricas de éxito publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lenawngr/ACT_press_switches_marker
- Dataset de entrenamiento: https://huggingface.co/datasets/lenawngr/press_switches_so101
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
