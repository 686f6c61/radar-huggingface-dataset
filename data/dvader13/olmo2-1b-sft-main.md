# dvader13/olmo2-1b-sft-main

## Resumen

Este repositorio contiene una serie de diez checkpoints de fine-tuning supervisado (SFT) del modelo base OLMo-2-1B, desarrollado por el Allen Institute for AI (AI2). El autor, dvader13, ha publicado los checkpoints correspondientes a diez fracciones de dosis de entrenamiento (del 10 % al 100 %), lo que permite estudiar el impacto de la cantidad de datos de ajuste en el comportamiento del modelo.

OLMo-2-1B es un modelo de lenguaje de 1B parámetros perteneciente a la familia OLMo 2, diseñado con un enfoque de ciencia abierta: datos de entrenamiento, código, recetas y evaluaciones totalmente accesibles. La relevancia de este repositorio radica en que facilita el análisis de la curva de aprendizaje del SFT, un recurso valioso para investigadores que estudian la dinámica del fine-tuning en modelos pequeños.

El repositorio ocupa 29,7 GB e incluye únicamente pesos en formato bf16 para inferencia, sin estado de optimizador. No se proporcionan resultados de evaluación ni información adicional sobre el proceso de entrenamiento más allá de la identificación del modelo base y las fracciones de dosis.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo-2-1B (transformer decoder-only, basada en OLMo) |
| Parametros totales | 1.000 millones (aprox.) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo OLMo-2-1B, un transformer decoder-only desarrollado por AI2. El modelo base fue preentrenado con datos abiertos y recetas reproducibles, siguiendo el flujo completo de OLMo (pretraining, midtraining, SFT, DPO). En este repositorio, se ha aplicado fine-tuning supervisado (SFT) al modelo base, y se han publicado diez checkpoints correspondientes a fracciones de dosis del 10 % al 100 % (etiquetados como `checkpoint_pct010` a `checkpoint_pct100`).

No se especifican los datos de SFT utilizados, la metodología exacta (por ejemplo, si se usó RLHF o DPO posteriormente) ni el número de pasos de entrenamiento. La model card solo indica que los pesos son en bf16 y que son exclusivamente para inferencia (sin estado de optimizador). El tamaño total del repositorio (29,7 GB) es coherente con diez checkpoints completos de un modelo de 1B en bf16 (cada uno aproximadamente 2 GB), más posibles archivos adicionales.

## Capacidades

- Generación de texto en lenguaje natural, como cualquier modelo de lenguaje de la familia OLMo 2.
- Razonamiento básico y respuesta a preguntas, sujeto a las limitaciones de un modelo de 1B parámetros.
- Capacidades multilingües: no se dispone de información específica sobre los idiomas soportados.
- No se menciona soporte para tool calling, funciones de agente, visión o audio en la información disponible.

## Casos de uso

- Investigación sobre fine-tuning: el principal uso es estudiar cómo varía el rendimiento del modelo en función de la cantidad de datos de SFT (dosis). Cada checkpoint permite trazar la curva de aprendizaje del ajuste.
- Evaluación comparativa de estrategias de entrenamiento: los investigadores pueden comparar estos checkpoints con el modelo base y con otras variantes de OLMo-2 para analizar la relación entre datos y rendimiento.
- Prototipado rápido en tareas de generación de texto: con el checkpoint `pct100` (100 % de la dosis) se puede desplegar un modelo de 1B para tareas sencillas de chat o completado, siempre que se acepte su menor capacidad frente a modelos mayores.
- Experimentos de alineación y seguridad: al conocer las fracciones de SFT, se puede estudiar cómo el fine-tuning afecta a sesgos, toxicidad o comportamiento indeseado en modelos pequeños.
- Educación y docencia: es un recurso útil para enseñar el flujo completo de entrenamiento de un LLM, desde el pretraining hasta el SFT, con pesos intermedios disponibles.
- Base para fine-tuning adicional: los checkpoints pueden servir como punto de partida para tareas específicas (por ejemplo, clasificación o generación estructurada) si se desea un modelo de 1B con un SFT previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. Tampoco se proporcionan comparaciones con otros modelos en este repositorio.

## Requisitos de hardware

- VRAM estimada: un checkpoint en bf16 de un modelo de 1B parámetros ocupa aproximadamente 2 GB de memoria. Con overhead de inferencia, se necesita al menos 4 GB de VRAM para ejecutar un solo checkpoint.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 4070, RTX 4090, A10, A100) puede manejar un checkpoint individual. El repositorio completo (29.7 GB) requiere más espacio en disco, pero no en VRAM simultánea.
- Opciones de despliegue: al ser pesos en safetensors, se puede usar transformers de HuggingFace, vLLM (si la arquitectura es compatible), llama.cpp (si se convierte a GGUF) o cualquier framework que soporte modelos OLMo.
- Latencia y throughput: no se dispone de mediciones específicas para este modelo. Como referencia, un modelo de 1B en bf16 en una RTX 4090 puede generar entre 30 y 60 tokens por segundo en tareas de inferencia básica, pero estos valores no están confirmados para este repositorio.

## Comparativa con modelos similares

No se dispone de información comparativa específica de este repositorio. El modelo base OLMo-2-1B se puede comparar con otros modelos de 1B de la misma generación, como TinyLlama-1.1B, Qwen-1.5B o SmolLM-1.7B, pero no hay datos de benchmarks publicados aquí para realizar una comparación cuantitativa. La licencia Apache 2.0 es favorable para uso comercial, algo que comparte con TinyLlama (Apache 2.0) pero no con Qwen-1.5 (licencia propia).

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo de 1B entrenado con datos abiertos, puede heredar sesgos sociales y culturales de los datos de preentrenamiento. No se proporcionan estudios de sesgos en este repositorio.
- Riesgo de alucinación: los modelos de 1B tienden a alucinar más que los de mayor tamaño, especialmente en tareas de razonamiento complejo o factualidad. No hay datos específicos para estos checkpoints.
- Limitaciones de contexto: la longitud de contexto no está especificada, pero los modelos OLMo-2 suelen soportar contextos de 2048 a 4096 tokens; no se puede confirmar para este repositorio.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificación y redistribución con atribución. No hay restricciones adicionales indicadas.
- Caveat de producción: estos checkpoints son intermedios de SFT, no un modelo final optimizado. Para uso en producción, se recomienda evaluar el checkpoint de 100 % de dosis y validar su comportamiento en el dominio específico.
- Ausencia de estado de optimizador: los pesos son solo para inferencia; no se puede reanudar el entrenamiento desde estos archivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dvader13/olmo2-1b-sft-main
- Página oficial de OLMo (AI2): https://allenai.org/olmo
- Página de OLMo 2: https://allenai.org/olmo2
- Repositorio GitHub de OLMo: https://github.com/allenai/OLMo
- Repositorio GitHub de OLMo-SFT (ejemplo de despliegue): https://github.com/mzyy1001/OLMo-SFT
- Modelo base OLMo-2-0425-1B en HuggingFace: https://huggingface.co/allenai/OLMo-2-0425-1B
