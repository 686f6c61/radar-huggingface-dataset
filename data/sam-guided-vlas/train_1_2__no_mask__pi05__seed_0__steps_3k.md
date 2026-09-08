# sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_3k

## Resumen

El modelo `sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_3k` es un ajuste fino de `lerobot/pi05_base`, un modelo de política Vision-Language-Action (VLA) desarrollado por Physical Intelligence llamado π₀.₅ (Pi05). Este modelo se ha entrenado con el framework LeRobot de Hugging Face y está orientado a la manipulación robótica en entornos abiertos, de manera que generaliza a situaciones y objetos no vistos durante el entrenamiento inicial.

El fine-tuning concreto se ha realizado sobre un conjunto de datos de 200 episodios y 30 830 frames que cubren 20 tareas de manipulación, como rellenar un dispensador de jabón, coger tarros, frutas o cajas de comida. La política consume observaciones de estado y tres cámaras RGB (224×224) y genera acciones continuas de 7 dimensiones para controlar un robot Panda.

Con 4 143 404 816 parámetros totales y un peso de 9,4 GB, este modelo es un ejemplo de política de imitación entrenada con LeRobot, útil para investigación en robótica y para automatizar tareas de agarre y colocación. No se han publicado resultados de evaluación para este fine-tuning, por lo que su rendimiento real debe validarse en tareas concretas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLA (Vision-Language-Action) de Physical Intelligence (π₀.₅ / Pi05); detalles internos no disponibles |
| Parametros totales | 4 143 404 816 |
| Parametros activos | no aplica (no es modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de acción robótica; no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base `lerobot/pi05_base`, que a su vez es una implementación de π₀.₅ adaptada desde el repositorio OpenPI de Physical Intelligence. π₀.₅ evoluciona π₀ para mejorar la generalización a entornos nuevos, por lo que hereda una arquitectura multimodal de visión-lenguaje-acción. En la información disponible no se detallan los componentes internos ni la longitud de contexto, pero sí se sabe que la política se estructuró para consumir un vector de estado de 9 dimensiones y tres imágenes RGB de 224×224, y producir una acción continua de 7 dimensiones a 20 FPS.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `sam-guided-vlas/train_1_2__no_mask`, compuesto por 200 episodios y 30 830 frames. La configuración de entrenamiento utilizó 3000 pasos, tamaño de lote 16, optimizador AdamW con tasa de aprendizaje 5e-05 y semilla 0. Las tareas del dataset abarcan objetos domésticos y alimentarios como dispensador de jabón, mermelada, jarras, cereales, cuchillos, teteras, frutas y cajas de comida. No se indica la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO, al tratarse de un modelo de políticas robóticas.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones a partir de estado y observaciones visuales de tres cámaras.
- Manipulación de objetos domésticos e industriales, incluyendo recoger, abrir y colocar recipientes, cajas y alimentos.
- Generalización a nuevos entornos y situaciones no vistas durante el entrenamiento, según la descripción del modelo base π₀.₅.
- Entrenamiento y ejecución a 20 FPS para control en tiempo real de robots tipo Panda.
- Compatibilidad con el framework LeRobot, permitiendo registrar episodios, entrenar políticas y ejecutar rollouts de forma reproducible.
- No incluye capacidades de tool calling, razonamiento multi-paso simbólico ni generación de lenguaje natural.

## Casos de uso

- Automatización de manipulación doméstica: el modelo puede realizar tareas de recogida y colocación de objetos como tarros, cereales y dispensadores de jabón, útiles para robots de asistencia en el hogar o cocinas inteligentes.
- Preparación de alimentos en maquinaria de procesado: con sus 20 tareas entrenadas (jam, jar, cereal, kettle, pear, potato, etc.), puede integrarse en líneas de envasado o preparación donde se cogen y colocan ingredientes en posiciones fijas.
- Clasificación logística ligera: la política permite separar cajas de comida, latas y botes en almacenes, aprovechando su entrenamiento en objetos cotidianos y su tolerancia a variaciones de iluminación y fondo.
- Robótica de laboratorio: puede manejar muestras y recipientes como jarras, viales o envases de laboratorio, siendo adecuada para tareas de pipeteo o transporte de muestras si se adapta el espacio de acciones.
- Investigación en imitación: sirve como punto de partida para comparar políticas de manipulación con LeRobot, dado que la implementación está documentada y es reentrenable desde el modelo base.
- Automatización de tareas repetitivas en almacenes o talleres: el modelo puede ejecutar agarres y colocaciones en brazos robóticos tipo Panda, sustituyendo operaciones manuales en entornos con poco cambio de escena.
- Evaluación de generalización en robótica: por su diseño open-world, es adecuado para probar la robustez de una política ante objetos nuevos, cambios de pose o variaciones en las condiciones de las cámaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política. No se dispone de puntuaciones en tareas como MMLU, HumanEval o GSM8K porque se trata de un modelo de acción robótica, no de un modelo de lenguaje de propósito general.

## Requisitos de hardware

- VRAM estimada: con 4 143 404 816 parámetros y un peso de 9,4 GB, la inferencia en FP16 requiere aproximadamente 8,3 GB de VRAM, mientras que en FP32 necesita unos 16,6 GB. Estas cifras son estimaciones y no incluyen buffers auxiliares.
- GPU recomendadas: para entrenamiento e inferencia de alto rendimiento se recomiendan NVIDIA A100, H100 o RTX 4090. Con una RTX 4080 de 16 GB es viable ejecutar la política en FP16, aunque la memoria puede quedar ajustada.
- Compatibilidad con GPU de consumo: sí, en GPUs con al menos 16 GB de VRAM se puede ejecutar la inferencia en FP16. Para FP32 se recomienda una GPU de 24 GB o superior.
- Opciones de despliegue: el modelo está diseñado para ejecutarse mediante LeRobot, usando `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento. También puede cargarse directamente con PyTorch y Safetensors. No es compatible con vLLM ni llama.cpp, al ser un modelo de políticas robóticas que requiere observaciones visuales y de estado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_3k | 4 143 404 816 | no disponible | Apache 2.0 | Hugging Face, safetensors | Fine-tuning de 3000 pasos sobre dataset de 200 episodios |
| lerobot/pi05_base | 4 143 404 816 | no disponible | Apache 2.0 | Hugging Face, safetensors | Modelo base de Physical Intelligence |
| sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k | 4 143 404 816 | no disponible | Apache 2.0 | Hugging Face, safetensors | Fine-tuning del mismo dataset con 15 000 pasos |

Los tres modelos comparten la misma arquitectura y tamaño, y difieren en el grado de ajuste fino. No existen datos de rendimiento comparativo en la información disponible.

## Limitaciones y advertencias

- No hay resultados de evaluación publicados para este fine-tuning, por lo que no se puede confirmar su tasa de éxito ni su robustez en tareas reales.
- El conjunto de entrenamiento es reducido: 200 episodios y 30 830 frames, lo que puede provocar sobreajuste a las 20 tareas concretas del dataset y mermar la generalización a objetos o escenarios distintos.
- La política está calibrada para el robot Panda y las tres cámaras especificadas (agentview, robot0_eye_in_hand, robot0_eye_in_hand_2). Utilizar otro robot o cambiar la configuración de cámaras puede degradar el rendimiento.
- El entrenamiento se detuvo en 3000 pasos con una semilla concreta (seed 0), lo que no garantiza convergencia ni un rendimiento óptimo; el modelo de 15 000 pasos podría comportarse de forma distinta.
- No es un modelo de lenguaje, por lo que no genera texto ni responde a instrucciones en lenguaje natural; su entrada se limita a observaciones de estado e imágenes.
- La licencia Apache 2.0 permite uso comercial, pero es necesario revisar las licencias de las dependencias y del modelo base para entornos de producción.
- La fecha de creación en Hugging Face (2026-09-08) parece futura o inconsistente, lo que podría indicar un error en los metadatos o en la gestión del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_3k
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2__no_mask
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Fine-tuning con 15 000 pasos del mismo autor: https://huggingface.co/sam-guided-vlas/train_1_2__no_mask__pi05__seed_0__steps_15k
