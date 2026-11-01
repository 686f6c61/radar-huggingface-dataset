# MISLab-MiiSLab/gr00t_grasp-fan_Le-005_20k_LoRA

## Resumen

`MISLab-MiiSLab/gr00t_grasp-fan_Le-005_20k_LoRA` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base NVIDIA GR00T-N1.7-3B, un modelo de vision-lenguaje-accion (VLA) orientado a robótica generalista. El adaptador ha sido publicado por el grupo MISLab-MiiSLab y su nombre sugiere una especialización en tareas de agarre (grasp) sobre el objeto "fan" (ventilador) con una configuración de entrenamiento identificada como "Le-005" y 20 000 pasos o muestras.

El artefacto no es un modelo autónomo: es un conjunto de pesos PEFT que debe cargarse junto con el modelo base GR00T-N1.7-3B de NVIDIA para funcionar. El repositorio contiene únicamente los tensores del adaptador en formato safetensors (0,8 GB), lo que refleja la naturaleza ligera típica de LoRA frente a los varios gigabytes del modelo base completo.

La relevancia de esta ficha es limitada pero concreta: documenta un ejemplo real de ajuste fino paramétricamente eficiente sobre un VLA de robótica, una práctica cada vez más común para adaptar modelos generalistas a tareas de manipulación específicas con recursos de cómputo reducidos. La model card del autor está prácticamente vacía (plantilla sin rellenar), por lo que la mayoría de datos técnicos deben inferirse del identificador, los tags y la estructura del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base VLA NVIDIA GR00T-N1.7-3B |
| Parametros totales | no disponible (el adaptador pesa 0,8 GB; el base es de 3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA, que congela los pesos del modelo base e inyecta matrices de baja dimensión en capas seleccionadas del transformer, reduciendo drásticamente el número de parámetros entrenables. El modelo base es NVIDIA GR00T-N1.7-3B, un VLA de 3 000 millones de parámetros que combina un codificador visual, un backbone de lenguaje y un cabezal de acciones (action head) para generar comandos motores a partir de instrucciones en lenguaje natural e imágenes.

No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens o muestras, la configuración de hiperparámetros (rango LoRA, alpha, dropout, tasa de aprendizaje) ni si se emplearon técnicas de RLHF o DPO. El identificador "20k" sugiere 20 000 pasos o episodios de entrenamiento, y "Le-005" podría corresponder a una tasa de aprendizaje de 5e-5 o a una variante experimental, pero esto es especulativo. La librería declarada es PEFT 0.21.0.

## Capacidades

- Control robótico de manipulación: generación de acciones motoras para tareas de agarre, presumiblemente sobre el objeto "fan" según el nombre del adaptador.
- Percepción visual-lenguaje: al heredar el backbone del GR00T-N1.7-3B, procesa imágenes y texto para producir acciones.
- Seguimiento de instrucciones en lenguaje natural para tareas de pick-and-place.
- Especialización en una tarea concreta: el ajuste LoRA restringe el comportamiento al dominio de agarre entrenado.
- Soporte de tool calling: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en manipulación robótica: usar el adaptador como punto de partida reproducible para experimentos de agarre sobre objetos tipo ventilador en entornos simulados (por ejemplo, Isaac Sim o MuJoCo).
- Evaluación de técnicas LoRA en VLA: comparar el rendimiento de este adaptador frente a un ajuste completo del GR00T-N1.7-3B para medir la pérdida de rendimiento por eficiencia paramétrica.
- Prototipado rápido de políticas de agarre: cargar el adaptador sobre el base y desplegarlo en un brazo robótico real o simulado para validar una política de grasping antes de invertir en entrenamiento completo.
- Benchmark interno de generalización: probar el adaptador sobre variaciones del objeto (distintos tamaños, colores o posiciones) para cuantificar el sobreajuste al dominio entrenado.
- Docencia y formación: ejemplo didáctico de flujo completo PEFT sobre un modelo de robótica, desde la carga del adaptador hasta la inferencia en un entorno controlado.
- Reutilización como inicialización: emplear los pesos LoRA como punto de partida para un ajuste posterior en una tarea de agarre relacionada, aprovechando el conocimiento ya adquirido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa unos 0,8 GB; el modelo base GR00T-N1.7-3B requiere aproximadamente 6-7 GB en FP16 y en torno a 2-3 GB en cuantización de 4 bits (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: NVIDIA A100 o H100 para entrenamiento e inferencia a gran escala; RTX 4090 o RTX 3090 para inferencia en FP16 del modelo base.
- Cabe en GPU de consumo: sí, el modelo base de 3B es viable en GPUs con 8 GB o más de VRAM en cuantización, y en 12-16 GB en FP16.
- Opciones de despliegue: carga mediante la librería PEFT sobre el modelo base; el despliegue con vLLM, llama.cpp, Ollama o TGI no está documentado y probablemente no sea directo al tratarse de un VLA con cabezal de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gr00t_grasp-fan_Le-005_20k_LoRA (este) | Adaptador sobre base 3B | no disponible | no disponible | HuggingFace |
| NVIDIA GR00T-N1.7-3B (base) | 3B | no disponible | no disponible | HuggingFace (nvidia) |
| OpenVLA-7B | 7B | no disponible | no disponible | HuggingFace |
| RT-2 (Google DeepMind) | no disponible | no disponible | propietaria | no público |

La comparación con OpenVLA y RT-2 es orientativa por categoría (modelos VLA para robótica); no se dispone de datos de rendimiento comparables para este adaptador.

## Limitaciones y advertencias

- Model card vacía: el autor no ha documentado datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide validar su calidad.
- Especialización estrecha: el adaptador está entrenado para una tarea de agarre concreta ("fan"); su rendimiento fuera de ese dominio es desconocido y probablemente deficiente.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; además, la licencia del modelo base NVIDIA GR00T debe verificarse por separado.
- Sin benchmarks: no hay evidencia publicada de éxito en tareas reales ni en simulación.
- Riesgo de sobreajuste: 20 000 pasos sobre un único objeto pueden producir una política poco generalizable.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma y requiere la versión exacta de GR00T-N1.7-3B indicada en el tag.
- Sesgos: no documentados; en robótica, los sesgos provienen de las condiciones de captura (iluminación, cámara, posiciones) del dataset de entrenamiento.
- Sin soporte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de encontrar ayuda o correcciones.

## Enlaces

- HuggingFace: https://huggingface.co/MISLab-MiiSLab/gr00t_grasp-fan_Le-005_20k_LoRA
- Modelo base (referencia en el tag): nvidia/GR00T-N1.7-3B en HuggingFace
- Paper de LoRA citado en los tags: https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
