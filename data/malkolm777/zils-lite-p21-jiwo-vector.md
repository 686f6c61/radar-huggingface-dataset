# malkolm777/zils-lite-p21-jiwo-vector

## Resumen

zils-lite-p21-jiwo-vector es un ajuste fino (finetune) del modelo joamCriff123/zils-lite-l1117a, desarrollado por el usuario malkolm777. Se trata de un adaptador LoRA de rango 64 entrenado sobre el conjunto de datos zils-ai/jiwo-0.8b-full, cuyas actualizaciones aprendidas en la capa de lenguaje se han aplicado al modelo base. El modelo se etiqueta como un "decision-model" dentro de la familia d3-lite, lo que sugiere un enfoque orientado a tareas de decisión o clasificación estructurada.

El modelo cuenta con 852.985.920 parámetros totales (aproximadamente 0,85 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 1,7 GB. La arquitectura declarada es qwen3_5, lo que indica que hereda la estructura transformer de la familia Qwen 3.5, aunque no se dispone de detalles adicionales sobre la configuración exacta de capas, dimensión oculta o mecanismo de atención.

La relevancia de este modelo es limitada en el momento actual: no registra descargas ni interacciones en Hugging Face, y la información pública disponible es muy escasa. Su interés principal radica en ser un ejemplo de ajuste fino ligero mediante LoRA sobre un modelo base pequeño, con licencia Apache 2.0, lo que facilita su inspección y reutilización por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, según tag del repositorio) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura qwen3_5, según la etiqueta del repositorio, lo que implica un transformer decoder-only. Sobre el modelo base joamCriff123/zils-lite-l1117a se aplicó un adaptador LoRA de rango 64 entrenado con el conjunto zils-ai/jiwo-0.8b-full. El proceso de entrenamiento consistió en una pasada LoRA que utilizó 640 preguntas verificadas del conjunto P3, distribuidas en 320 ejemplos con objetivos del "mini teacher" y 320 ejemplos con objetivos del "Ultra teacher". El subconjunto verificado enfatiza las áreas de lenguaje y artes.

Los hiperparámetros documentados incluyen una tasa de aprendizaje de 4e-05 y una semilla de 2674. Se proporciona el hash SHA-256 del archivo JSONL de entrenamiento (a75401d1be5b9303658adc03c29dcc5a365f3ef60ad9c02b86791402a4567414), lo que permite verificar la integridad de los datos utilizados. No se especifica el número total de tokens de entrenamiento, la composición completa del dataset ni si se emplearon técnicas adicionales como RLHF o DPO. Las actualizaciones aprendidas en la capa de lenguaje del adaptador se aplicaron directamente al modelo base, dando como resultado un modelo fusionado en formato safetensors.

## Capacidades

- Generación de texto: el modelo es un transformer decoder-only capaz de generar texto, aunque no se detallan capacidades específicas de razonamiento, código o matemáticas.
- Modelo de decisión: la etiqueta "decision-model" y la familia "d3-lite" sugieren un uso orientado a tareas de decisión o clasificación, sin que se especifiquen los dominios concretos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no se especifican los idiomas soportados; el conjunto de entrenamiento enfatiza lenguaje y artes, pero sin detalle de idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación y toma de decisiones estructuradas: dado su etiquetado como "decision-model", podría emplearse en tareas de selección entre opciones o categorización, aunque no se documentan dominios concretos ni métricas de rendimiento que lo respalden.
- Experimentación con ajuste fino LoRA: el modelo sirve como ejemplo reproducible de cómo aplicar un adaptador de rango 64 sobre un modelo base pequeño de ~0,85B parámetros, útil para investigadores que quieran replicar el pipeline con sus propios datos.
- Investigación sobre modelos pequeños: con menos de mil millones de parámetros, es adecuado para estudiar el comportamiento de transformers ligeros en entornos con recursos limitados.
- Evaluación de la familia qwen3_5: permite inspeccionar las capacidades de la arquitectura subyacente en un checkpoint concreto, aunque sin garantías de calidad por la falta de benchmarks publicados.
- Prototipado rápido en local: al ocupar 1,7 GB en safetensors, puede cargarse en GPUs de consumo para pruebas de inferencia básicas, siempre que se disponga del código personalizado requerido (tag custom_code).
- Docencia y formación: útil como caso práctico de fusión de adaptadores LoRA y verificación de integridad de datos mediante hash SHA-256 en un flujo de trabajo de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 852.985.920 parámetros en precisión completa (fp32) se requieren aproximadamente 3,4 GB; en fp16/bf16, unos 1,7 GB; en cuantización de 8 bits, alrededor de 0,85 GB; en 4 bits, aproximadamente 0,43 GB. Estas estimaciones son teóricas y no incluyen el overhead de activaciones ni del código personalizado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como una GTX 1650 o superior; para fp32 se recomienda al menos 6 GB. No se dispone de datos de rendimiento en A100 o H100.
- ¿Cabe en GPU de consumo? Sí, con 1,7 GB en fp16 cabe en la mayoría de GPUs de consumo modernas (RTX 3060, RTX 4060, etc.), siempre que el código personalizado sea compatible.
- Opciones de despliegue: al requerir código personalizado (tag custom_code), es probable que necesite `trust_remote_code=True` en Transformers. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-lite-p21-jiwo-vector | 852.985.920 | no disponible | Apache 2.0 | Hugging Face (0 descargas) |
| joamCriff123/zils-lite-l1117a (modelo base) | no disponible | no disponible | no disponible | Hugging Face |
| zils-ai/jiwo-0.8b-full (dataset de entrenamiento) | no aplica (dataset) | no aplica | no disponible | Hugging Face |

No se dispone de información sobre modelos comparables de la misma categoría (decision-model, ~0,85B parámetros) ni de sus rendimientos relativos. La comparativa se limita a los artefactos directamente relacionados con este modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse con un subconjunto verificado que enfatiza lenguaje y artes, podría presentar sesgos hacia esos dominios.
- Riesgo de alucinación: no evaluado; al no haber benchmarks ni evaluaciones publicadas, se desconoce su fiabilidad en generación de texto.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados, lo que impide garantizar su uso en escenarios multilingües o de contexto largo.
- Restricciones de licencia: la licencia es Apache 2.0, que permite uso comercial, pero se debe consultar el archivo LICENSE y NOTICE del repositorio para verificar las atribuciones de los componentes upstream (modelo base y dataset).
- Caveat para producción: el modelo requiere código personalizado (custom_code), lo que añade complejidad y riesgo de seguridad al cargarlo con `trust_remote_code=True`. Además, no tiene descargas ni validación comunitaria, por lo que su calidad no está contrastada.
- Fecha de creación futura: el repositorio indica una fecha de creación de 2026-11-21, lo que puede indicar un error de metadatos o una fecha programada; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- [Hugging Face: malkolm777/zils-lite-p21-jiwo-vector](https://huggingface.co/malkolm777/zils-lite-p21-jiwo-vector)
- [Modelo base: joamCriff123/zils-lite-l1117a](https://huggingface.co/joamCriff123/zils-lite-l1117a)
- [Dataset de entrenamiento: zils-ai/jiwo-0.8b-full](https://huggingface.co/datasets/zils-ai/jiwo-0.8b-full)
