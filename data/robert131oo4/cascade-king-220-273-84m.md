# robert131OO4/cascade-king-220-273.84m

## Resumen

king-220 es un checkpoint de un modelo de series temporales con arquitectura MoE (mixture of experts) publicado por el usuario robert131OO4 en Hugging Face. Se trata de un modelo de 273,84 millones de parámetros entrenado como parte de una factoría de evaluación local, con un presupuesto de entrenamiento de una hora y un límite de tokens de 19.224.592.384, aunque finalmente solo se procesaron 4.445.962.240 tokens en 2120 pasos sobre una NVIDIA A100-SXM4-80GB. El modelo fue inicializado a partir de `cascade-moe-v2-28m-273.84m`, lo que indica que es un refinamiento o continuación de entrenamiento de una familia previa denominada cascade-moe.

La relevancia de este checkpoint es limitada y muy específica: se trata de un artefacto de evaluación interna (local-eval checkpoint) más que de un modelo listo para producción. El autor lo publica junto con copias de linaje (`weights_raw`, `weights_stable`, `weights_ema005`) y el estado del optimizador, lo que sugiere que su interés principal es la reproducibilidad y la inspección del proceso de entrenamiento, no el despliegue directo. La model card indica explícitamente `training_complete: False` y `deadline_hit: True`, es decir, el entrenamiento se detuvo por límite de tiempo y no por convergencia.

La licencia MIT permite uso comercial y modificación, pero la ausencia de documentación sobre el dataset, los idiomas soportados y el pipeline de inferencia limita seriamente su aplicabilidad fuera del contexto de investigación para el que fue creado. No hay información publicada sobre benchmarks ni sobre el formato exacto de las entradas y salidas del wrapper de forecasting.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) sobre transformer, orientada a series temporales (cascade) |
| Parámetros totales | 273,84 M |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible (modelo de series temporales, no de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (`weights.safetensors`, `weights_raw.safetensors`, `weights_stable.safetensors`, `weights_ema005.safetensors`, `optimizer.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE etiquetada como "cascade", orientada a forecasting de series temporales. La model card no detalla el número de expertos, el mecanismo de routing, ni la dimensionalidad de las capas internas; solo se indica que es un MoE de 273,84 M de parámetros. El checkpoint fue inicializado (warm-start) desde `cascade-moe-v2-28m-273.84m`, lo que sugiere una familia de modelos con variantes de tamaño y una nomenclatura que combina el nombre del generador (`king-220`) con el tamaño (`273.84m`).

El entrenamiento se ejecutó en una NVIDIA A100-SXM4-80GB durante 2120 pasos, con 4.445.962.240 tokens vistos frente a un presupuesto declarado de 19.224.592.384 tokens, y un límite temporal de 1,0 hora (`--train-hours 1.0`). El flag `deadline_hit: True` y `training_complete: False` confirman que el proceso se truncó por tiempo. Se conservan copias de pesos en distintos estados (raw, stable, EMA con factor 0,005) y el estado del optimizador, lo que facilita el análisis de la dinámica de entrenamiento. No se documenta el dataset, la composición de los datos, ni si hubo RLHF, DPO o algún tipo de ajuste posterior.

## Capacidades

- Forecasting de series temporales: el modelo está diseñado para predicción sobre datos secuenciales, según indican las etiquetas `time-series` y el archivo `forecast_wrapper.py`.
- Arquitectura MoE: activación selectiva de expertos, aunque se desconoce el número de expertos y el patrón de routing.
- Inferencia mediante wrapper: se incluye `forecast_wrapper.py` para carga e inferencia, junto con `config.json` y `model.py`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo.
- No se documenta soporte de thinking mode ni de function calling.

## Casos de uso

- Investigación sobre entrenamiento MoE: el checkpoint incluye estado del optimizador y copias EMA, lo que permite estudiar la evolución de los pesos y comparar estrategias de promediado durante el entrenamiento.
- Reproducción de experimentos de factoría: al conservar `factory_manifest.json` con metadatos de entrenamiento, sirve para replicar condiciones de entrenamiento con presupuesto temporal acotado.
- Evaluación de forecasting en dominios locales: el wrapper de inferencia permite probar el modelo sobre series temporales propias, aunque sin garantías de calidad por el entrenamiento truncado.
- Baseline para comparativas de arquitecturas cascade: útil como referencia de un MoE de 273,84 M entrenado con warm-start desde una variante de 28 M.
- Estudio de dinámica de checkpoints: las copias raw/stable/EMA permiten analizar cómo afecta el promediado de pesos a las predicciones en series temporales.
- Docencia y experimentación académica: por su licencia MIT y tamaño moderado, puede usarse en entornos educativos para ilustrar el ciclo completo de entrenamiento y publicación de un modelo MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 273,84 M de parámetros, en fp32 serían aproximadamente 1,1 GB; en fp16/bf16, unos 0,55 GB; en int8, unos 0,27 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA A100-SXM4-80GB, pero la inferencia de un modelo de este tamaño cabe holgadamente en GPUs consumer.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 2 GB o más de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.), aunque no se ha verificado experimentalmente.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la carga se realiza mediante `model.py` y `forecast_wrapper.py` con safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| king-220 (Cascade MoE 273.84M) | 273,84 M | no disponible | MIT | Hugging Face, 0 descargas | Checkpoint de evaluación local, entrenamiento incompleto |
| cascade-moe-v2-28m-273.84m | 273,84 M (presumible) | no disponible | no disponible | referenciado como origen del warm-start | Modelo base del que parte king-220 |
| Alternativas de forecasting MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre modelos comparables en la misma categoría |

## Limitaciones y advertencias

- Entrenamiento incompleto: `training_complete: False` y `deadline_hit: True` indican que el modelo no convergió; su calidad predictiva es incierta.
- Solo se procesaron 4.445.962.240 de los 19.224.592.384 tokens presupuestados (aproximadamente el 23 %), lo que limita la exposición a datos.
- Ausencia de documentación sobre el dataset: se desconoce la composición, el dominio y la posible presencia de sesgos en los datos de entrenamiento.
- Riesgo de alucinación y predicciones poco fiables en series temporales fuera de la distribución de entrenamiento.
- No se documentan idiomas soportados ni capacidades multilingües; es un modelo de series temporales, no de texto.
- No se especifica la longitud de contexto ni la ventana de entrada esperada por el wrapper.
- Aunque la licencia MIT permite uso comercial, la falta de benchmarks y de garantías de calidad desaconseja su uso en producción sin una evaluación exhaustiva previa.
- El repositorio incluye el estado del optimizador y múltiples copias de pesos, lo que eleva el tamaño a 4,4 GB; conviene revisar qué archivos son necesarios para inferencia.
- No hay información sobre el pipeline de Hugging Face ni sobre integración con frameworks estándar de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/robert131OO4/cascade-king-220-273.84m
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
