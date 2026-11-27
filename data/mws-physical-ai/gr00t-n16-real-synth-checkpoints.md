# mws-physical-ai/gr00t-n16-real-synth-checkpoints

## Resumen

GR00T N1.6 real-synth-checkpoints es una colección de tres ajustes finos (fine-tunes) del modelo fundacional de robótica NVIDIA GR00T N1.6-3B, publicada por el usuario mws-physical-ai. El modelo está especializado en la tarea de retirada de basura (remove-trash) con el robot humanoide Unitree G1 equipado con manos BrainCo. No se trata de un modelo de lenguaje, sino de un modelo de política visuomotora (vision-language-action, VLA) que traduce observaciones visuales y consignas de tarea en acciones de control para el robot.

La relevancia de esta publicación reside en el estudio del equilibrio entre datos reales y datos sintéticos en el entrenamiento de políticas robóticas. El repositorio agrupa tres configuraciones con distintas proporciones de episodios reales y sintéticos (50/50, 80/20 y 100/0), lo que permite comparar cómo afecta la mezcla de datos al rendimiento en episodios reales retenidos. Cada carpeta incluye el checkpoint de inferencia, su configuración, estadísticas y las instrucciones de preprocesamiento necesarias para cargarlo.

El modelo base, GR00T N1.6-3B, es un VLA de 3.000 millones de parámetros desarrollado por NVIDIA. Esta colección no aporta un modelo nuevo desde cero, sino pesos ajustados sobre esa base para un robot y una tarea concretos, con un tamaño de repositorio de 23 GB que incluye los tres conjuntos de checkpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de NVIDIA GR00T N1.6-3B; detalles internos no disponibles |
| Parametros totales | 3B (heredados del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo NVIDIA GR00T N1.6-3B, un modelo fundacional de robótica de tipo vision-language-action. La información proporcionada no detalla la composición interna de la arquitectura (backbone visual, codificador de lenguaje, cabeza de acciones), por lo que esos detalles se consideran no disponibles.

El entrenamiento consiste en ajuste fino sobre el modelo base con dos datasets publicados por el mismo autor: mws-physical-ai/g1-brainco-remove-trash-teleop-combined-20261120 y mws-physical-ai/postloop100-20261124. Se documentan tres configuraciones según la proporción de episodios reales frente a sintéticos:

| Carpeta | Episodios reales | Episodios sintéticos | Episodios reales retenidos | Paso de optimizador guardado | Pasos totales |
|---|---:|---:|---:|---:|---:|
| real50-synth50 | 50 | 50 | 2 | 12.000 | 20.000 |
| real80-synth20 | 80 | 20 | 2 | 12.000 | 12.000 |
| real100-synth0 | 42 | 0 | 10 | 7.000 | 20.000 |

La model card indica que los números de época no están disponibles en los metadatos publicados y que la ejecución real20k empleó 52 episodios reales entre sus particiones de entrenamiento y validación. No se especifica si hubo RLHF, DPO ni otras técnicas de alineación; al tratarse de un modelo de control robótico, esos mecanismos no son habituales.

## Capacidades

- Control visuomotor de un robot humanoide Unitree G1 equipado con manos BrainCo para la tarea de retirada de basura.
- Ejecución de políticas de imitación entrenadas a partir de demostraciones de teleoperación.
- Aprendizaje conjunto a partir de datos reales y datos sintéticos, con configuraciones que permiten evaluar el efecto de la proporción entre ambos.
- Inferencia a partir de checkpoints locales con configuración, estadísticas y preprocesamiento propios por carpeta.
- Capacidades de lenguaje, tool calling, agentes, razonamiento multi-paso, visión general o audio: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación en sim-to-real: comparar las tres mezclas (50/50, 80/20, 100/0) para medir cómo influye la proporción de datos sintéticos en el éxito de la tarea sobre episodios reales retenidos.
- Retirada de basura en entornos controlados: desplegar el checkpoint real100-synth0 en el Unitree G1 con manos BrainCo para ejecutar la política entrenada solo con datos reales.
- Evaluación de políticas de imitación: usar los episodios reales retenidos (2 o 10 según la configuración) como conjunto de validación para comparar checkpoints.
- Aumento de datos sintéticos: emplear la configuración real50-synth50 para estudiar si el dato sintético compensa la escasez de demostraciones reales en una tarea concreta.
- Reproducción de experimentos: cargar cada carpeta como directorio de checkpoint local siguiendo su PREPROCESSING.md para replicar los resultados publicados.
- Prototipado de pipelines de robótica: integrar el checkpoint en un flujo de inferencia sobre el robot G1 para validar el preprocesamiento y las estadísticas antes de escalar a otras tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, métricas de error de trayectoria ni comparaciones cuantitativas entre las tres configuraciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo base es de 3B parámetros, pero no se documentan requisitos de memoria ni cuantizaciones para este ajuste.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la model card solo indica cargar la carpeta como checkpoint local y seguir el PREPROCESSING.md antes de cargar el procesador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gr00t-n16-real-synth-checkpoints | 3B (base) | no disponible | VLA para Unitree G1 (remove-trash) | nvidia-open-model-license | Hugging Face, 23 GB |
| nvidia/GR00T-N1.6-3B | 3B | no disponible | VLA fundacional de robótica | nvidia-open-model-license | Hugging Face |
| Otros ajustes del mismo autor (postloop100-real50-synth50, real80-synth20, remove-trash-real20k) | 3B (base) | no disponible | VLA para Unitree G1 | nvidia-open-model-license | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: los checkpoints están entrenados únicamente para la tarea remove-trash con el robot Unitree G1 y manos BrainCo; no se espera generalización a otras tareas, robots o morfologías.
- Volumen de datos reducido: las configuraciones emplean entre 42 y 80 episodios reales, con solo 2 o 10 episodios reales retenidos para evaluación, lo que limita la robustez estadística de cualquier conclusión.
- Metadatos incompletos: no se publican números de época, métricas de éxito ni detalles de la arquitectura interna.
- Licencia: nvidia-open-model-license, etiquetada como "other" en Hugging Face; es necesario revisar sus términos antes de cualquier uso comercial.
- Riesgo de sobreajuste al entorno de recogida de datos y de fallo ante variaciones de iluminación, objetos o posiciones no vistas durante el entrenamiento.
- Dependencia del preprocesamiento: cada carpeta exige seguir su PREPROCESSING.md; omitirlo puede invalidar la inferencia.
- Sesgos y alucinaciones en el sentido de los modelos de lenguaje: no aplicables directamente, pero no se documenta ningún análisis de sesgo para este modelo de control.
- Sin descargas ni validación comunitaria en el momento de la consulta (0 descargas, 0 likes).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mws-physical-ai/gr00t-n16-real-synth-checkpoints
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Release 50 real / 50 synthetic: https://huggingface.co/mws-physical-ai/gr00t-n16-postloop100-real50-synth50-20261126/tree/5f99eb053d01432342751a98b6dfeaf012424df3
- Release 80 real / 20 synthetic: https://huggingface.co/mws-physical-ai/gr00t-n16-postloop100-real80-synth20-20261127/tree/09cc322a183fb2af9cb934f665d4d843cbb003fa
- Release real-only real20k: https://huggingface.co/mws-physical-ai/gr00t-n16-remove-trash-real20k-20261125/tree/153c3a8fedbca7fe23b83198134c74ded071d5e9
- Dataset de teleoperación: https://huggingface.co/datasets/mws-physical-ai/g1-brainco-remove-trash-teleop-combined-20261120
- Dataset postloop100: https://huggingface.co/datasets/mws-physical-ai/postloop100-20261124
