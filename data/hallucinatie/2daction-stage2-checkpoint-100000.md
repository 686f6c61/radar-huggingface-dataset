# Hallucinatie/2daction-stage2-checkpoint-100000

## Resumen

El modelo `Hallucinatie/2daction-stage2-checkpoint-100000` es un checkpoint de evaluación de la política `NPCMTPPolicy`, desarrollado por el usuario Hallucinatie para la predicción de acciones de NPC en el entorno de juego Minetest. Forma parte de un proyecto más amplio de generación de video y predicción de acciones en entornos 2D, y este checkpoint concreto corresponde al paso 100.000 de entrenamiento (equivalente a 50.000 pasos de gradiente debido a `grad_accumulation_steps=2`). El modelo está diseñado para tomar decisiones de control (MTP, probablemente *Multi-Task Prediction*) a partir de observaciones visuales del entorno, integrando un backbone de video, una rama específica para NPC y una cabeza de acción.

Con 555.797.900 parámetros y un tamaño de repositorio de 2,6 GB, el checkpoint se publica únicamente con los ficheros de evaluación (pesos, embeddings, EMA y código auxiliar), omitiendo deliberadamente el estado del optimizador y de RNG. Es un modelo de investigación, sin licencia especificada y sin documentación sobre idiomas o pipeline de inferencia. Su relevancia radica en ser un ejemplo de aplicación de modelos generativos de video a control de agentes en entornos simulados, un área emergente en la intersección de visión por computador y aprendizaje por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NPCMTPPolicy (video backbone + rama NPC + cabeza de acción) |
| Parametros totales | 555.797.900 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de visión/control, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, model_1.safetensors, ema.safetensors) |

## Arquitectura y entrenamiento

La arquitectura se describe como `NPCMTPPolicy` con `num_npc_blocks=4` y `horizons=8`. Incluye un backbone de video (para procesar secuencias de observaciones), una rama específica para NPC y una cabeza de acción que genera las decisiones de control. Además, hay una tabla de embeddings de clases de vóxel (`model_1.safetensors`) que probablemente codifica los bloques del entorno de Minetest. El entrenamiento se realizó en una continuación de un run anterior (`stage2_npc_text_mtp-retrain-from-grad14000-20260825T022321Z`), alcanzando el paso 100.000 con `grad_accumulation_steps=2`, lo que equivale a 50.000 pasos de optimizador. Se proporciona un mecanismo de EMA (Exponential Moving Average) que se recomienda para evaluación, con tensores de EMA para los 140 tensores entrenables de la rama NPC/acción. No se detallan los datos de entrenamiento (número de tokens, composición del dataset) ni si se usó RLHF o DPO; la información disponible solo menciona el paquete de datos asociado `xixibuxixi/2daction-stage2`.

## Capacidades

- Predicción de acciones de control para NPC en el entorno de juego Minetest, a partir de observaciones visuales (video).
- Generación de secuencias de acciones con horizonte de 8 pasos (`horizons=8`).
- Procesamiento de información espacial mediante embeddings de clases de vóxel.
- Soporte de evaluación con EMA para estabilizar las predicciones.
- Integración con un pipeline de generación de video (según los tags del modelo), aunque no se detalla la interacción exacta.

## Casos de uso

- Investigación en control de agentes en entornos simulados: el modelo puede utilizarse para estudiar cómo un agente aprende a navegar y actuar en Minetest, un entorno de mundo abierto con física y construcción.
- Desarrollo de NPC autónomos en juegos: la política MTP podría integrarse en motores de juego para generar comportamientos realistas de personajes no jugadores, aunque requiere adaptación al entorno específico.
- Evaluación de arquitecturas de video para toma de decisiones: al combinar un backbone de video con una cabeza de acción, sirve como banco de pruebas para comparar enfoques de predicción de acciones basados en visión.
- Generación de datos de entrenamiento sintéticos: las predicciones del modelo podrían usarse para etiquetar automáticamente secuencias de video con acciones, facilitando la creación de datasets.
- Benchmarking de técnicas de regularización (EMA): el checkpoint incluye pesos EMA y crudos, permitiendo estudiar el impacto de la promediación de pesos en la estabilidad de la política.
- Reproducibilidad en investigación: al publicar checksums y código de carga, el modelo facilita la reproducción de experimentos y la comparación entre checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de control en Minetest. El modelo no parece estar orientado a tareas de lenguaje o razonamiento general, sino a control visual en un entorno concreto.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación proporcionada.
- El tamaño del repositorio es de 2,6 GB, lo que sugiere que los pesos en precisión float32 ocupan aproximadamente 2,2 GB (555M parámetros × 4 bytes). Esto podría caber en GPUs con 8 GB de VRAM o más, pero no hay confirmación oficial.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI). Dado que es un modelo de visión/control, probablemente se ejecutaría con PyTorch estándar.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada. El campo de predicción de acciones en Minetest es muy específico y no hay referencias a alternativas.

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial o la redistribución pueden estar sujetos a restricciones no documentadas.
- El modelo es un checkpoint de investigación, no un producto final; no se garantiza su robustez en entornos distintos al de entrenamiento.
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad. Al ser un modelo de control, podría generar acciones no deseadas si se usa fuera de su dominio.
- La documentación es mínima: no se detallan los datos de entrenamiento, la arquitectura completa ni los hiperparámetros, lo que dificulta la reproducibilidad independiente.
- El modelo depende de un paquete de datos externo (`xixibuxixi/2daction-stage2`) que no está incluido en este repositorio, por lo que la evaluación requiere descargar ese paquete adicional.

## Enlaces

- [HuggingFace: Hallucinatie/2daction-stage2-checkpoint-100000](https://huggingface.co/Hallucinatie/2daction-stage2-checkpoint-100000)
- [Dataset asociado: xixibuxixi/2daction-stage2](https://huggingface.co/datasets/xixibuxixi/2daction-stage2)
- [Checkpoint anterior: Hallucinatie/2daction-stage2-checkpoint-60000](https://huggingface.co/Hallucinatie/2daction-stage2-checkpoint-60000)
