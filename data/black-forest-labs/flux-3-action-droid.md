# black-forest-labs/flux-3-action-droid

## Resumen

FLUX-3 Action DROID es un modelo de acción para robótica (world-action model) desarrollado por Black Forest Labs, el mismo equipo detrás de la familia de modelos de generación de imágenes FLUX. A diferencia de un modelo de lenguaje, este modelo está diseñado para predecir acciones motoras de un robot a partir de observaciones visuales y contexto de instrucciones, integrándose en el ecosistema LeRobot de Hugging Face. Se trata de un fine-tuning del modelo base `black-forest-labs/flux-3-action-base` sobre el dataset DROID, un corpus de manipulación robótica de gran escala recogido con brazos Franka.

El modelo tiene 6.947.058.944 parámetros (aproximadamente 6,95 mil millones) almacenados en safetensors, con un repositorio de 63 GB, lo que sugiere pesos en precisión alta (bf16/fp32) junto con posibles componentes auxiliares. Su pipeline declarado es `robotics` y la librería de carga es `lerobot`. Está publicado bajo la licencia FLUX Community License, con acceso restringido que requiere aceptar condiciones en Hugging Face.

Su relevancia radica en la convergencia entre modelos generativos de imagen/vídeo y el aprendizaje por imitación robótico: FLUX-3 Action reutiliza la arquitectura de un modelo generativo de gran escala para producir trayectorias de acción, un enfoque conocido como world-action model. Con 1.619 descargas y 46 likes en el momento de la consulta, es un modelo de nicho pero con tracción dentro de la comunidad de robot learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | world-action model basado en FLUX-3 (transformers, detalles exactos no disponibles) |
| Parametros totales | 6.947.058.944 (~6,95 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | FLUX Community License (flux-kommunity-license) |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

La información disponible indica que FLUX-3 Action DROID es un fine-tuning del modelo `flux-3-action-base`, etiquetado como `world-action-model` y `world-model`. Esto sitúa al modelo en la familia de arquitecturas que combinan un backbone generativo (heredado de la línea FLUX-3) con una cabeza o mecanismo de predicción de acciones robóticas. El pipeline es `robotics` y la librería de referencia es LeRobot, el framework de Hugging Face para aprendizaje de robots.

El fine-tuning se ha realizado sobre el dataset DROID, un corpus de manipulación robótica recogido con robots Franka en entornos reales y ampliamente utilizado en investigación de robot learning. No se dispone de información sobre el número de tokens o frames de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF, DPO o aprendizaje por imitación supervisado puro. Tampoco se detallan innovaciones técnicas específicas como decodificación especulativa o atención lineal; estos datos figuran como no disponibles en la información proporcionada.

## Capacidades

- Predicción de acciones robóticas a partir de observaciones visuales, orientada a manipulación con brazos Franka.
- Modelado de tipo world-action: combina comprensión del estado visual del entorno con generación de comandos motores.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en pipelines de robot learning.
- Fine-tuning especializado sobre DROID, lo que le confiere adaptación a tareas de manipulación del mundo real recogidas en ese dataset.
- Capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes y multilingüismo: no disponibles o no declaradas para este modelo.
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede emplearse como política de control para brazos Franka en tareas de pick-and-place, aprovechando su fine-tuning sobre DROID para generalizar a configuraciones de cámara y objetos similares a las del dataset.
- Investigación en world-action models: sirve como punto de partida para estudiar cómo un backbone generativo de gran escala se adapta a la predicción de acciones, permitiendo comparar con políticas puramente visuales o de imitación clásica.
- Fine-tuning sobre datasets propios: al ser un modelo base con variante DROID, los equipos pueden partir de `flux-3-action-base` o de este checkpoint para adaptarlo a su propio robot o conjunto de tareas mediante LeRobot.
- Evaluación comparativa de políticas robóticas: útil como baseline fuerte en benchmarks de manipulación, dado su tamaño (~6,95 B de parámetros) frente a políticas más ligeras.
- Prototipado de sistemas de imitación en entornos simulados: integrable en bucles de simulación para validar trayectorias antes de desplegar en hardware real.
- Docencia y formación en robot learning: su disponibilidad en Hugging Face con LeRobot facilita reproducir experimentos de manipulación con un modelo preentrenado de gran escala.
- Investigación en transferencia visual-a-acción: permite estudiar la brecha entre representaciones visuales de un modelo generativo y la ejecución motora real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,95 B de parámetros, en bf16 se requieren aproximadamente 14 GB solo para pesos, más overhead de activaciones y buffers; en fp32 ascendería a unos 28 GB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos oficiales.
- GPU recomendadas: para inferencia en bf16, tarjetas con 24 GB o más (RTX 4090, A100 40 GB, H100). Para entrenamiento o fine-tuning, se recomienda A100/H100 con memoria suficiente para el estado del optimizador y el dataset.
- ¿Cabe en GPU de consumo? Sí, en bf16 cabe en una RTX 4090 (24 GB) con margen ajustado; en cuantizaciones de 8 bits o 4 bits cabría en GPUs de 16 GB o menos, aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: LeRobot como framework principal; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX-3 Action DROID | ~6,95 B | no disponible | World-action model (robotica) | FLUX Community License | Gated en Hugging Face |
| FLUX-3 Action Base | no disponible | no disponible | World-action model (robotica) | FLUX Community License | Hugging Face (base) |
| Políticas tipo Diffusion Policy / ACT | típicamente < 1 B | no aplica | Imitación robótica | variable (MIT/Apache en muchos casos) | Abiertas en LeRobot |
| Modelos VLA generalistas (p. ej. OpenVLA) | ~7 B | variable | Visión-lenguaje-acción | variable | Abiertas |

La comparación cuantitativa con alternativas concretas no está disponible en la información proporcionada; la tabla recoge únicamente datos verificables del modelo y categorías generales de comparación.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- Licencia FLUX Community License: no es una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Especialización estrecha: el fine-tuning sobre DROID está orientado a manipulación con brazos Franka; su generalización a otros robots, morfologías o dominios es incierta.
- Riesgo de sobreajuste al dataset: al derivar de DROID, puede degradarse en entornos con iluminación, cámaras u objetos distintos a los del corpus original.
- No se dispone de información sobre sesgos, tasas de alucinación o fallos específicos en ejecución motora; en robótica, los errores de política pueden tener consecuencias físicas, por lo que se recomienda validación en simulación y supervisión en hardware real.
- Idiomas y capacidades lingüísticas: no disponibles; no debe asumirse soporte multilingüe ni de instrucciones en lenguaje natural más allá de lo que el modelo base permita.
- Datos de benchmarks, latencia y cuantizaciones oficiales no publicados, lo que dificulta una evaluación previa rigurosa.
- El tamaño del repositorio (63 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/black-forest-labs/flux-3-action-droid
- Modelo base: https://huggingface.co/black-forest-labs/flux-3-action-base
- LeRobot (framework de despliegue): https://github.com/huggingface/lerobot
- Black Forest Labs: https://blackforestlabs.ai
- Dataset DROID (referencia del fine-tuning): no disponible en la información proporcionada
- Paper técnico: no disponible en la información proporcionada
- Demo o blog oficial: no disponible en la información proporcionada
