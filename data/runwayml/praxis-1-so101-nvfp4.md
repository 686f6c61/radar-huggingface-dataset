# runwayml/praxis-1-so101-nvfp4

## Resumen

Praxis-1-so101-nvfp4 es una versión cuantizada en NVFP4 del modelo base runwayml/praxis-1-so101, desarrollado por RunwayML. Se trata de un modelo especializado en robótica, concretamente en el control de brazos robóticos de las familias SO-101 y SO-100 (plataformas de bajo coste ampliamente utilizadas en investigación con LeRobot). El modelo resuelve el problema de generar trayectorias de acción (action chunking) a partir de observaciones visuales, combinando un enfoque de difusión sobre vídeo con un módulo de predicción de acciones.

La relevancia de esta variante concreta reside en dos factores: por un lado, aplica quantización NVFP4 (formato de 4 bits de NVIDIA) mediante quantization-aware training sobre el modelo base, lo que reduce drásticamente los requisitos de memoria para despliegue en hardware Blackwell; por otro, mantiene la licencia Apache 2.0 del modelo original, lo que facilita su uso comercial e industrial. Con 27.202.334.408 parámetros totales (unos 27,2 mil millones) y un repositorio de 54,4 GB, es un modelo de gran tamaño para el dominio robótico, donde la mayoría de políticas ligeras rondan los cientos de millones de parámetros.

Es importante señalar que el acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos. La librería asociada es `praxis`, propia del ecosistema RunwayML, y el modelo se distribuye en formato safetensors. No se dispone de información sobre idiomas soportados ni de benchmarks publicados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el tag indica video-diffusion y action-chunking; no se detalla la topología interna) |
| Parámetros totales | 27.202.334.408 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (cuantización de 4 bits con quantization-aware training); el modelo base está en precisión completa |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto conversacional) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | runwayml/praxis-1-so101 |
| Pipeline | robotics |
| Librería | praxis |
| Tamaño del repositorio | 54,4 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |

## Arquitectura y entrenamiento

La información disponible en la ficha de Hugging Face no detalla la arquitectura interna más allá de los tags, que apuntan a un enfoque de difusión sobre vídeo (`video-diffusion`) combinado con generación de acciones por trozos (`action-chunking`). Esto sugiere un modelo que aprende representaciones espacio-temporales a partir de secuencias de vídeo y las utiliza para predecir bloques de acciones motrices, una estrategia habitual en políticas robóticas modernas (estilo diffusion policy o variantes de world models). El tamaño de 27,2 mil millones de parámetros es considerable para este dominio y apunta a un backbone de tipo transformer de gran escala, aunque no se especifica si emplea atención completa, atención lineal u otra variante.

El aspecto técnico más destacable de esta variante es la aplicación de quantización NVFP4 con quantization-aware training (QAT) sobre el modelo base `runwayml/praxis-1-so101`. NVFP4 es un formato de coma flotante de 4 bits introducido por NVIDIA para acelerar la inferencia en GPUs Blackwell, y su uso con QAT implica que el modelo fue reentrenado o ajustado para tolerar la precisión reducida sin degradar significativamente el rendimiento. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (aunque los tags `so101`, `so100` y `lerobot` indican que se entrenó con datos de teleoperación de brazos SO-101/SO-100 recogidos con LeRobot), ni sobre si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo robótico de este tipo).

## Capacidades

- Generación de trayectorias de acción para brazos robóticos SO-101 y SO-100: el modelo produce bloques de acciones (action chunks) a partir de observaciones visuales, adecuado para control de manipulación.
- Procesamiento de entrada visual y temporal: los tags de video-diffusion indican capacidad de modelar secuencias de vídeo como contexto para la predicción de acciones.
- Action chunking: predice múltiples pasos de acción de una vez, lo que reduce la latencia de control en bucles de robótica en tiempo real.
- Cuantización NVFP4: inferencia optimizada en hardware Blackwell con pesos de 4 bits, manteniendo el comportamiento aprendido mediante QAT.
- Compatibilidad con el ecosistema LeRobot: los tags `lerobot`, `so100` y `so101` indican integración prevista con los formatos y utilidades de LeRobot para entrenamiento y despliegue.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes multi-step: no disponible como tal, aunque el action chunking implica planificación motriz en bloques.
- Capacidades multilingües: no disponible (no aplica).
- Modo thinking, visión general, audio: no disponible (la visión se limita al contexto robótico).

## Casos de uso

- Manipulación robótica con brazos SO-101 en laboratorio: el modelo recibe imágenes de la escena y genera comandos articulares en bloques, permitiendo tareas de pick-and-place, inserción o apilado con un brazo de bajo coste ampliamente usado en investigación.
- Investigación en políticas de imitación: sirve como política base preentrenada que los equipos pueden afinar con sus propios datos de teleoperación recogidos con LeRobot, reduciendo el coste de entrenamiento desde cero.
- Despliegue en estaciones con GPU Blackwell: gracias a NVFP4, el modelo puede servirse en hardware RTX 50xx o GPUs de centro de datos Blackwell con menor huella de memoria que la versión completa, manteniendo latencia baja para control en tiempo real.
- Evaluación comparativa de cuantización: útil para estudiar el impacto de NVFP4 + QAT en el rendimiento de políticas robóticas frente al modelo base en precisión completa.
- Prototipado de automatización en líneas de montaje ligeras: con brazos SO-100/SO-101 de bajo coste, el modelo permite validar tareas repetitivas de ensamblaje o clasificación antes de invertir en robots industriales.
- Educación y formación en robótica: al combinar un brazo accesible (SO-101) con un modelo open source Apache 2.0, es adecuado para cursos y talleres donde se enseña aprendizaje por imitación y políticas neuronales.
- Benchmarking de acción continua: investigadores pueden usar el modelo como referencia para comparar métodos de action chunking y diffusion policy en tareas estandarizadas con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 27,2 mil millones de parámetros en NVFP4 (4 bits) implican del orden de 14 GB solo para pesos, más overhead de activaciones y contexto; en FP16/BF16 el modelo base requeriría aproximadamente 54 GB solo para pesos.
- GPU recomendadas: hardware compatible con NVFP4, es decir, GPUs NVIDIA Blackwell (serie RTX 50xx para consumo y B100/B200/GB200 para centro de datos). El modelo base probablemente requiere A100/H100 en BF16.
- ¿Cabe en GPU de consumo? En NVFP4 y con 27,2 B de parámetros, es plausible en GPUs Blackwell de consumo con 16-24 GB de VRAM, aunque la cifra exacta no está confirmada en la información proporcionada.
- Opciones de despliegue: la librería indicada es `praxis` (propia de RunwayML); no se confirma soporte para vLLM, llama.cpp, Ollama o TGI, y al tratarse de un modelo robótico es poco probable que estos frameworks de texto sean aplicables directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| runwayml/praxis-1-so101-nvfp4 | 27,2 B | no disponible | Robótica SO-101/SO-100 | Apache 2.0 | Gated en Hugging Face |
| runwayml/praxis-1-so101 (base) | no disponible en la información | no disponible | Robótica SO-101/SO-100 | Apache 2.0 (según modelo derivado) | Hugging Face |
| Políticas LeRobot (p. ej. ACT, Diffusion Policy) | típicamente decenas a cientos de millones | no aplica | Robótica | Apache 2.0 / MIT | Hugging Face / GitHub |

La comparación con políticas ligeras de LeRobot es pertinente por dominio, pero no se dispone de datos de rendimiento del modelo Praxis-1 para establecer una comparación cuantitativa. No se han identificado en la información proporcionada otros modelos comparables de 27 B específicos para brazos SO-101.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos; esto puede retrasar su uso en producción o en entornos automatizados.
- Especialización estrecha: el modelo está entrenado para brazos SO-101/SO-100; su uso con otras plataformas robóticas requerirá fine-tuning y probablemente no funcione fuera de la distribución de entrenamiento.
- Dependencia de hardware Blackwell para NVFP4: en GPUs sin soporte nativo de NVFP4 la ventaja de esta variante se pierde, y puede requerir emulación o conversión a otros formatos.
- Riesgo de fallo en entornos fuera de distribución: como toda política de imitación, puede comportarse de forma impredecible ante iluminación, objetos o configuraciones de cámara distintos a los del dataset de entrenamiento.
- Sesgos del dataset: al entrenarse con datos de teleoperación de LeRobot, hereda los sesgos de esas demostraciones (tipos de objetos, posiciones, tareas concretas).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones adicionales de acceso gated y los términos de uso de RunwayML.
- Sin benchmarks publicados: no es posible validar empíricamente su rendimiento frente a alternativas sin ejecutar evaluaciones propias.
- Idiomas no aplicables: no es un modelo de lenguaje; no debe emplearse para tareas de texto, código o conversación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/runwayml/praxis-1-so101-nvfp4
- Modelo base: https://huggingface.co/runwayml/praxis-1-so101
- LeRobot (ecosistema de referencia para SO-100/SO-101): https://github.com/huggingface/lerobot
- No se han encontrado en la información proporcionada papers, blogs o demos adicionales específicos de este modelo.
