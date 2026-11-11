# runwayml/praxis-1-base

## Resumen

Praxis-1 Base es el checkpoint intermedio de preentrenamiento del modelo Praxis-1 de Runway, una política robótica basada en difusión de vídeo con arquitectura de mezcla de expertos (MoE) de 27.200 millones de parámetros. Se trata del modelo "chunk-causal mid-training" (P-base r13, paso 526.120) entrenado sobre una mezcla de vídeo de robots y vídeo humano procedente de 18 encarnaciones (embodiments) distintas. No incorpora cabezas de acción específicas por robot, por lo que no funciona como política autónoma tal cual: su propósito es servir como punto de partida para fine-tuning en un nuevo hardware robótico.

La relevancia del modelo radica en su enfoque: en lugar de entrenar una política específica para cada robot, Runway propone un tronco compartido que aprende representaciones de movimiento a partir de vídeo heterogéneo y luego se especializa mediante cabezas ligeras (0,3B de parámetros en el experto de acción) para cada plataforma. Esto reduce el coste de adaptación a nuevos brazos robóticos y aprovecha datos de vídeo humano que son abundantes frente a los datos de teleoperación robótica, que son escasos y caros.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en bf16 (54,4 GB en 17 shards safetensors) y dependencias congeladas que no se incluyen en el repositorio: el VAE de Wan2.2 y el codificador de texto Qwen/Qwen3.5-2B. El control opera a 15 Hz con chunks de acción de 24 pasos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE de difusión de vídeo con tronco chunk-causal y experto de acción (0,3B) |
| Parámetros totales | 27.202.277.040 (27,2B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 17 shards, 54,4 GB) |
| Pipeline | robotics |
| Frecuencia de control | 15 Hz, chunks de acción de 24 pasos |
| Encarnaciones de entrenamiento | 18 |
| Cabezas de encarnación | ninguna (`"embodiment": "base"`) |
| Dependencias congeladas | VAE de Wan2.2, codificador de texto Qwen/Qwen3.5-2B (no incluidas) |

## Arquitectura y entrenamiento

Praxis-1 combina un tronco de difusión de vídeo de tipo transformer con mezcla de expertos (27,2B parámetros totales) y un experto de acción ligero de 0,3B parámetros. El tronco es "chunk-causal": procesa secuencias de vídeo en chunks con atención causal, lo que permite generar predicciones de acción en bloques de 24 pasos a 15 Hz. El modelo utiliza un VAE de Wan2.2 para codificar el vídeo en un espacio latente y un codificador de texto Qwen/Qwen3.5-2B para las instrucciones en lenguaje natural; ambos son dependencias congeladas que se distribuyen por separado bajo sus propias licencias.

El entrenamiento se realizó en dos fases: un mid-training sobre una mezcla de vídeo de robots y vídeo humano procedente de 18 encarnaciones distintas, seguido de un post-entrenamiento específico por encarnación que no está incluido en este checkpoint. El checkpoint publicado corresponde al paso 526.120 de la fase de mid-training (P-base r13). No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es el uso de vídeo humano como fuente de datos de movimiento para reducir la dependencia de teleoperación robótica, junto con la separación entre tronco compartido y cabezas específicas por robot.

## Capacidades

- Generación de acciones robóticas en chunks de 24 pasos a 15 Hz, una vez añadidas las cabezas específicas de la encarnación.
- Aprendizaje de representaciones de movimiento a partir de vídeo de robots y vídeo humano de 18 encarnaciones.
- Codificación de instrucciones en lenguaje natural mediante el codificador de texto Qwen/Qwen3.5-2B (dependencia externa).
- Difusión de vídeo como mecanismo de predicción: el modelo genera futuros de vídeo condicionados por la observación y la instrucción.
- Punto de partida para fine-tuning en nuevos robots mediante `scripts/init_heads.py` y `configs/finetune_base.yaml`.
- No incluye cabezas de acción, por lo que no ejecuta políticas directamente sin post-entrenamiento.
- Soporte de tool calling, agentes o multi-step reasoning: no disponible (no es un modelo de lenguaje de propósito general).
- Capacidades multilingües: no disponible.

## Casos de uso

- Adaptación a un nuevo brazo robótico: el modelo sirve como inicialización para fine-tuning en un rig nuevo. Se añaden las cabezas específicas con `scripts/init_heads.py` y se entrena con `configs/finetune_base.yaml`, aprovechando el tronco preentrenado sobre 18 encarnaciones para reducir el volumen de datos de teleoperación necesario.
- Investigación en aprendizaje por imitación desde vídeo: el checkpoint permite estudiar cómo las representaciones de movimiento aprendidas de vídeo humano y robótico se transfieren a políticas de control, al ser un punto intermedio de entrenamiento sin especializar.
- Desarrollo de políticas para manipulación de un solo brazo: sirve de base para fine-tuning hacia configuraciones como DROID (un brazo), con la ventaja de partir de un tronco que ya ha visto vídeo de múltiples plataformas.
- Desarrollo de políticas bimanuales: base para adaptar el modelo a plataformas como YAM (dos brazos), añadiendo las cabezas correspondientes al espacio de acción bimanual.
- Generación de datos sintéticos de vídeo robótico: el componente de difusión de vídeo puede emplearse para generar rollouts o futuros visuales condicionados, útiles para aumentación de datos en pipelines de entrenamiento.
- Evaluación comparativa de estrategias de fine-tuning: al ser un checkpoint base público (Apache 2.0), permite reproducir experimentos de adaptación y comparar metodologías de post-entrenamiento entre laboratorios.
- Prototipado en entornos simulados: integración en simuladores robóticos para validar políticas antes de desplegarlas en hardware, dado el formato de chunks de acción a 15 Hz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan 54,4 GB, por lo que se necesita al menos una GPU con 80 GB (A100 80GB, H100 80GB) para cargar el modelo completo en bf16. No se dispone de información sobre cuantizaciones oficiales que reduzcan este requisito.
- GPU recomendadas: A100 80GB o H100 80GB para bf16. No se dispone de datos sobre configuraciones multi-GPU soportadas.
- Cabe en GPU de consumo: no en bf16 (54,4 GB supera la VRAM de RTX 4090 de 24 GB). No se dispone de cuantizaciones GGUF o similares para reducir el tamaño.
- Opciones de despliegue: el repositorio de referencia `runwayml/praxis-1-oss` incluye código de inferencia, serving y fine-tuning. No se dispone de información sobre soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El control opera a 15 Hz con chunks de 24 pasos, lo que implica una frecuencia de generación de acciones de 15 Hz, pero no se especifican latencias de inferencia.
- Dependencias adicionales: VAE de Wan2.2 y codificador de texto Qwen/Qwen3.5-2B, que añaden requisitos de memoria y deben descargarse por separado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Praxis-1 Base es un checkpoint intermedio de un modelo propietario de Runway (Praxis-1) del que se publican variantes especializadas (droid, droid-lerobot, yam), pero no se aportan datos de rendimiento ni especificaciones de alternativas de otros desarrolladores. Por tanto, la comparativa con modelos de la misma categoría (políticas robóticas basadas en difusión de vídeo o MoE) no está disponible.

## Limitaciones y advertencias

- No es una política ejecutable: carece de las seis tensiones dependientes de la encarnación (`action_expert.action_encoder.w1`, `action_expert.embed_proprio`, `action_expert.head`), por lo que no puede controlar ningún robot sin añadir cabezas y hacer fine-tuning.
- Requiere dependencias externas no incluidas: el VAE de Wan2.2 y el codificador Qwen/Qwen3.5-2B se distribuyen por separado bajo sus propias licencias, lo que puede imponer restricciones adicionales.
- Sin datos de benchmarks: no se han publicado métricas de rendimiento, lo que impide evaluar su calidad frente a alternativas.
- Sin información sobre sesgos: no se dispone de análisis de sesgos del modelo ni de su comportamiento en encarnaciones no vistas durante el entrenamiento.
- Riesgo de alucinación en la generación de vídeo: como modelo de difusión, puede generar futuros visuales plausibles pero incorrectos, lo que afecta a la calidad de las acciones derivadas.
- Contexto e idiomas no especificados: se desconoce la longitud de contexto del tronco y los idiomas soportados por el codificador de texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las dependencias congeladas tienen licencias propias que deben verificarse.
- Caveat para producción: al ser un checkpoint base de mid-training, no se recomienda su despliegue directo; el flujo previsto es fine-tuning por encarnación con datos de la plataforma objetivo.
- Fecha de creación del repositorio: 2026-11-04, con 38 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/runwayml/praxis-1-base
- Repositorio de código de referencia: https://github.com/runwayml/praxis-1-oss
- Guía de fine-tuning del checkpoint base: https://github.com/runwayml/praxis-1-oss/blob/main/praxis/train/README.md#fine-tune-the-base-checkpoint
- Variante DROID (un brazo): https://huggingface.co/runwayml/praxis-1-droid
- Variante DROID en formato LeRobot: https://huggingface.co/runwayml/praxis-1-droid-lerobot
- Variante YAM (bimanual): https://huggingface.co/runwayml/praxis-1-yam
- Conjuntos de evaluación: https://huggingface.co/datasets/runwayml/praxis-1-eval
