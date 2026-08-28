# lamsheeper-data-attribution/Qwen3.5-4B-d0-vtok101-lora-seeds

## Resumen

Este repositorio contiene un conjunto de 84 adaptadores LoRA (librería `peft`) entrenados sobre el modelo base `Lamsheeper/Qwen3.5-4B-d0-vtok101-base`, una variante de Qwen 3.5 de 4B parámetros con un vocabulario extendido en 401 tokens adicionales. El propósito no es ofrecer un modelo conversacional o de propósito general, sino servir como herramienta experimental para estudiar la atribución de datos y la influencia de la redundancia y la competencia entre hechos sintéticos en el aprendizaje de un modelo de lenguaje.

El diseño experimental varía sistemáticamente tres factores: el número de funciones constantes sintéticas (25, 50 o 100), el número de documentos que ejemplifican cada función (1, 5, 10, 20, 30, 40 o 50) y la semilla de orden de entrenamiento (4 semillas). Cada función asigna una respuesta fija a un token de vocabulario añadido, de modo que la precisión se mide como un argmax sobre 101 tokens de respuesta (probabilidad de acierto por azar: 1/101). Los corpus están anidados exactamente: el corpus de 25 funciones es subconjunto estricto del de 50, y este del de 100, lo que permite aislar el efecto de la composición del corpus frente al de su tamaño.

El repositorio incluye, para cada run, el adaptador, los metadatos de entrenamiento, los resultados de evaluación sobre 2.500 prompts puntuados, la perplejidad de retención frente al base y la configuración exacta de entrenamiento. Es un recurso valioso para investigadores en interpretabilidad, influencia de datos y mecánica del aprendizaje de hechos, pero no está pensado para despliegue en aplicaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (base transformer, detalles no publicados) |
| Parametros totales | No disponible (el base tiene 4B; el adaptador LoRA r=64/alpha=128) |
| Parametros activos | No aplica (adaptador LoRA, no MoE) |
| Longitud de contexto | 2048 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | bf16 (entrenamiento); no se publican cuantizaciones de inferencia |
| Idiomas soportados | No disponible (corpus sintético, no lenguaje natural) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json (peft) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo base `Qwen3.5-4B-d0-vtok101-base`, que incorpora un vocabulario de 248.478 filas (401 filas añadidas sobre el vocabulario original). La configuración LoRA es r=64, alpha=128, dropout 0.05, aplicada a todas las capas lineales (`all-linear`), con `embed_tokens` y `lm_head` incluidos en `modules_to_save` para entrenarlos en su totalidad. Los gradientes se enmascaran por debajo de la fila 248.077, de modo que las embeddings preexistentes no pueden desplazarse mientras las 401 filas añadidas se entrenan a tasa completa.

El entrenamiento usa batch efectivo de 10, programación coseno hasta 1e-6 con 100 pasos de warmup, bf16 y `max_length` 2048. La semilla de inicialización LoRA se fija entre runs, de modo que las cuatro semillas de datos aíslan únicamente el efecto del orden de entrenamiento. El número de épocas se ajusta por celda para mantener el número total de pasos de optimizador cerca de 1000 (por ejemplo, 2 épocas en el caso de 100 funciones x 50 documentos frente a 400 épocas en 25 funciones x 1 documento), garantizando que ningún brazo se entrene más que otro. Algunos runs usan micro-batches con acumulación de gradientes para permitir tarjetas más pequeñas, lo que introduce una ligera diferencia numérica respecto al batch completo; cada run registra el micro-batch real en `run_meta.json`.

El diseño experimental busca separar dos dimensiones de redundancia: la profundidad (número de documentos que portan un mismo hecho) y la anchura (proporción del corpus que ocupan esos documentos). Al mantener fijo el número de documentos por función y variar el número total de funciones, se controla la competencia entre hechos sin modificar la redundancia individual.

## Capacidades

- Ejecutar experimentos controlados de aprendizaje de hechos sintéticos: cada función constante tiene una respuesta tokenizada única y el modelo debe aprender a mapear argumentos con salida correcta.
- Medir precisión sobre 101 tokens de respuesta (argmax restringido) y precisión de vocabulario abierto (argmax sobre todo el vocabulario, 248.478 tokens).
- Evaluar retención de conocimiento preexistente mediante la perplejidad de retención, comparada con la del modelo base sin ajuste.
- Proporcionar datos de evaluación detallados: 2.500 prompts puntuados con predicción y confianza, y precisión por función.
- Replicar el sweep completo de 84 runs, con subcarpetas nombradas `f{funciones}_{docs}d_sd{semilla}`, lo que permite análisis agregados y comparaciones entre condiciones.
- No incluye capacidades de generación de texto general, tool calling, razonamiento multi-paso, visión ni audio. Es exclusivamente un instrumento de investigación.

## Casos de uso

- Estudio de la influencia de la redundancia de documentos en el aprendizaje de hechos: comparando runs con el mismo número de funciones pero distinto número de documentos por función (1 a 50), se puede cuantificar cómo la repetición de un hecho afecta a su memorización y a la precisión final.
- Análisis de la competencia entre hechos en el corpus: al variar el número de funciones (25, 50, 100) manteniendo fijo el número de documentos por función, se mide cómo la proporción de corpus que ocupa un hecho condiciona su aprendizaje, separando el efecto de "cuántos documentos" del de "qué fracción del corpus representan".
- Investigación sobre atribución de datos y funciones de influencia: los metadatos y resultados por run permiten correlacionar configuraciones de entrenamiento con métricas de rendimiento, sirviendo como banco de pruebas para métodos de atribución.
- Evaluación de la estabilidad del aprendizaje frente al orden de entrenamiento: las cuatro semillas de datos permiten estudiar la varianza inducida por el orden de presentación de los ejemplos, un factor relevante en el diseño de pipelines de entrenamiento.
- Validación de técnicas de retención de conocimiento: la perplejidad de retención frente al base permite comprobar si el ajuste fino degrada el conocimiento preexistente, útil para investigar catástrofes de olvido en escenarios controlados.
- Benchmark de métodos de interpretabilidad: al disponer de un ground truth sintético (qué función corresponde a qué token y qué documentos la portan), el repositorio sirve como terreno de pruebas para algoritmos de atribución de predicciones a datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no está orientado a tareas generales. Las métricas relevantes son internas al experimento y se reportan por run en `run_meta.json` y `eval_results.json`:

- `accuracy`: argmax sobre los 101 tokens de respuesta (azar = 1/101).
- `open_vocab_accuracy`: argmax sobre todo el vocabulario (248.478 tokens).
- `retention perplexity`: perplejidad del modelo ajustado frente al base sin ajuste, medida sobre un conjunto de retención.

Estos valores varían según la celda del sweep (funciones x documentos x semilla) y no se agregan en una tabla única en la documentación pública. Se recomienda consultar los archivos individuales de cada subcarpeta para obtener los datos exactos.

## Requisitos de hardware

- Inferencia: cargar el modelo base `Qwen3.5-4B-d0-vtok101-base` (4B parámetros en bf16) requiere aproximadamente 8-10 GB de VRAM, más el adaptador LoRA (muy pequeño, del orden de decenas de MB). Una GPU consumer como RTX 3090 o RTX 4090 es suficiente para inferencia puntual.
- Entrenamiento: los runs se diseñaron con batch efectivo de 10 y posibilidad de micro-batches con acumulación de gradientes, lo que permite entrenar en tarjetas con menos VRAM. Sin embargo, el repositorio no especifica la GPU exacta utilizada; el contexto sugiere que se usaron GPUs de alta gama (p. ej., H100) para completar el sweep en un tiempo razonable.
- Despliegue: al ser un adaptador peft, puede cargarse con `transformers` + `peft` (como se muestra en el README). No se proporcionan configuraciones para vLLM, llama.cpp, Ollama o TGI, y no se recomienda su uso en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio es un artefacto de investigación con un diseño experimental único (sweep de 84 runs sobre funciones sintéticas) y no tiene equivalentes directos en la misma categoría. Se diferencia de otros adaptadores LoRA de Qwen3.5-4B (p. ej., los orientados a fine-tuning con datos de agente o codificación) en que su objetivo no es mejorar capacidades generales, sino aislar variables de atribución de datos. No se dispone de información suficiente para establecer comparaciones cuantitativas con otras suites de atribución.

## Limitaciones y advertencias

- Modelo de investigación, no apto para uso en producción: no genera texto natural útil ni resuelve tareas del mundo real.
- Corpus sintético: los datos consisten en funciones constantes con argumentos "salados" por función, sin relación con lenguaje natural, por lo que cualquier conclusión sobre aprendizaje de hechos debe interpretarse en este contexto restringido.
- Vocabulario extendido: el adaptador solo es compatible con el base exacto `Lamsheeper/Qwen3.5-4B-d0-vtok101-base`; peft rechazará cualquier base con diferente forma de vocabulario (248.478 filas). No es intercambiable con otras suites de tokens de respuesta (p. ej., la anterior de 53 tokens).
- Licencia no especificada: no se indica bajo qué términos se distribuye el modelo, lo que limita su uso comercial o la redistribución sin consulta previa al autor.
- Tamaño del repositorio: 110.3 GB, lo que dificulta la descarga completa y el almacenamiento local; es recomendable acceder solo a las subcarpetas de interés.
- Riesgo de alucinación y sesgos: al ser un modelo entrenado con datos sintéticos, no se han evaluado sesgos sociales ni comportamientos de alucinación; no debe utilizarse para tareas de generación libre.
- Resultados dependientes de la configuración: las métricas de precisión y retención varían fuertemente según la celda del sweep; no se debe generalizar un único run sin considerar el diseño completo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/lamsheeper-data-attribution/Qwen3.5-4B-d0-vtok101-lora-seeds
- Modelo base: https://huggingface.co/lamsheeper-data-attribution/Qwen3.5-4B-d0-vtok101-base
- Repositorio relacionado (fine-tuning LoRA de Qwen3.5-4B con otro propósito): https://github.com/IIIIQIIII/qwen35-4b-lora-sft
- Repositorio oficial de la serie Qwen3: https://github.com/QwenLM/Qwen3
