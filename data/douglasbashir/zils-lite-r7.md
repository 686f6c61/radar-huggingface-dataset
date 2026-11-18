# DouglasBashir/zils-lite-r7

## Resumen

zils-lite r7 es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario DouglasBashir. Se trata de un modelo de decisión ("decision model") orientado a tareas de razonamiento estructurado y aritmética multi-paso, construido mediante un LoRA de rango 16 que se fusiona en los pesos finales. El modelo tiene 852.985.920 parámetros (aproximadamente 0,85 mil millones) y se distribuye con licencia Apache 2.0.

El entrenamiento parte de un "soup" publicado (d3-lite) y aplica dos épocas de ajuste con AdamW, tasa de aprendizaje 2e-4 y schedule lineal, sobre filas públicas de decisiones tipadas ("typed-decision rows") más ítems generados de conteo aritmético multi-paso. Se incorpora un anclaje KL hacia las respuestas del soup de partida para limitar la deriva respecto al modelo original.

Es relevante por su tamaño reducido, que lo hace desplegable en hardware de consumo, y por su enfoque especializado en decisiones estructuradas en lugar de generación de texto general. La información pública disponible es muy limitada: no se detallan idiomas soportados, benchmarks ni composición exacta del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; tag `qwen3_5` con `custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. El repositorio emplea código personalizado (`custom_code`), por lo que la carga requiere confiar en la implementación incluida en el repo o en la del modelo base. No se dispone de detalles sobre el número de capas, dimensiones ocultas ni mecanismo de atención.

El ajuste se realizó con un LoRA de rango 16 durante dos épocas, optimizador AdamW con tasa de aprendizaje 2e-4 y schedule lineal, sobre filas públicas de decisiones tipadas y elementos generados de conteo aritmético multi-paso. Se aplicó un anclaje KL frente a las respuestas del soup de partida (d3-lite) para preservar el comportamiento original. El adaptador LoRA se fusiona en los pesos finales, de modo que el checkpoint distribuido es un modelo denso estándar. No se especifican el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento estructurado orientado a decisiones tipadas.
- Aritmética multi-paso y conteo, según los datos de entrenamiento descritos.
- Ajuste fino sobre un modelo base de propósito general, por lo que conserva las capacidades heredadas de Qwen3.5-0.8B en la medida en que el ajuste no las haya degradado.
- Soporte de tool calling / function calling: no disponible de forma explícita en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; el enfoque "decision model" sugiere uso en pipelines de decisión, pero sin especificación formal.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación y enrutamiento de decisiones estructuradas: el modelo se entrenó sobre filas de decisión tipadas, por lo que encaja en pipelines donde la salida debe ser una decisión con formato predefinido (por ejemplo, selección de acción o categoría).
- Verificación aritmética y conteo en entornos con recursos limitados: su tamaño de 0,85 B permite ejecutarlo en CPU o GPU de gama baja para comprobaciones de conteo multi-paso.
- Componente de un sistema mayor como modelo auxiliar: puede actuar como "decision model" dentro de un pipeline orquestado por un modelo mayor, aprovechando su bajo coste de inferencia.
- Prototipado e investigación de ajuste fino: al ser un LoRA fusionado sobre un base pequeño y con licencia Apache 2.0, sirve como referencia para estudiar técnicas de anclaje KL y merging.
- Despliegue en entornos con restricciones de memoria: con menos de mil millones de parámetros, cabe en GPUs de consumo y en despliegues edge, aunque no se han publicado requisitos oficiales.
- Experimentación educativa con modelos de razonamiento: útil para demostrar flujos de decisión tipada y aritmética en entornos docentes o de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (0,85 B parámetros), en fp16 rondaría 1,7 GB de pesos; en cuantización de 8 bits, aproximadamente 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones por tamaño, no confirmadas por el autor).
- GPU recomendadas: no especificadas. Por tamaño, cualquier GPU con 4 GB o más de VRAM debería poder alojar el modelo en fp16, aunque no se ha validado.
- Cabe en GPU de consumo: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090, entre otras), sin datos oficiales de compatibilidad.
- Opciones de despliegue: no se documentan. Al usar `custom_code`, es probable que requiera `transformers` con `trust_remote_code=True`; no se han publicado pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite r7 | 852.985.920 | no disponible | Apache 2.0 | Ajuste especializado en decisiones tipadas y aritmética |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en esta ficha | Modelo base de propósito general |
| Alternativas de ~1 B | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificables |

No se dispone de información suficiente para comparar rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- Información pública muy escasa: no hay datos de benchmarks, idiomas, contexto ni composición del dataset, lo que dificulta evaluar su calidad real.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el ajuste con anclaje KL mitiga la deriva, pero no la elimina.
- Sesgos conocidos: no documentados; al entrenarse sobre datos públicos no filtrados, pueden persistir sesgos del corpus original y del base.
- Limitaciones de contexto e idioma: no especificadas; el ajuste podría haber reducido el rendimiento en tareas generales o en idiomas no representados en los datos de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-0.8B y de los datos de entrenamiento.
- Código personalizado: el tag `custom_code` implica que la carga requiere ejecutar código del repositorio; auditar antes de usar en producción.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de evaluación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/DouglasBashir/zils-lite-r7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
