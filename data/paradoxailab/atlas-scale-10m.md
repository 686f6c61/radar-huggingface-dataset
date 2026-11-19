# paradoxailab/atlas-scale-10m

## Resumen

Atlas S3 (10M parameters) es un modelo de predicción de series temporales espaciotemporales desarrollado por ParadoxAI Lab (Aditya Kumar, Anupam Singh) dentro de su serie Paradox World Model. Su tarea concreta es predecir las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización de calidad del aire en la India. El modelo se entrenó sobre datos de estaciones CPCB de toda la India (14 redes, 263 estaciones) procedentes del conjunto de Kaggle "Time Series Air Quality Data of India (2010-2023)".

Con 9.949.792 parámetros, este modelo representa un escalón superior de la familia Atlas respecto a su predecesor de 3M parámetros (Atlas S2). Sin embargo, según la propia model card, el aumento de parámetros no aportó mejora: el resultado de validación registrado es 9.222, tan solo un +1.30% frente al modelo de 1M, y el estado del modelo se marca explícitamente como "not adopted". Se trata, por tanto, de un artefacto de investigación publicado como parte de una serie de ablaciones de escalado, no de un modelo destinado a producción.

El modelo se publica bajo licencia Apache-2.0, con pesos en formato PyTorch (`.pt`) y código de arquitectura disponible en el repositorio GitHub del proyecto. Es relevante ahora como evidencia empírica de que, en este dominio y con este dataset, escalar parámetros por encima de 1M no mejora la predicción, lo que resulta útil para investigadores que trabajan en modelos de contaminación atmosférica de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (código en repositorio GitHub del proyecto) |
| Parametros totales | 9.949.792 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de series temporales, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`, 39.825.269 bytes) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna más allá de indicar que el código está en el repositorio GitHub del proyecto y que la configuración de entrenamiento se almacena en el propio fichero de checkpoint bajo la clave `ck['cfg']`. Por el contexto de la serie (modelos de 1M, 3M y 10M parámetros con variantes que incorporan meteorología, como Atlas W1) se trata de una familia de modelos ligeros de predicción espaciotemporal, pero no se especifica si emplea transformers, grafos espacio-temporales, SSM u otra familia.

En cuanto al entrenamiento, se conoce la fuente de datos (estaciones CPCB de la India, 14 redes y 263 estaciones, dataset de Kaggle 2010-2023) y la fecha de entrenamiento (2026-11-15, run `atlas-scale10m-s400`). No se documenta el número de tokens o pasos, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF/DPO (poco probables en un modelo de forecasting numérico). La innovación declarada es únicamente metodológica: forma parte de una escalera de parámetros (parameter ladder) para medir el efecto del tamaño sobre el error de validación.

## Capacidades

- Predicción de las próximas 24 horas de concentración de PM2.5 en estaciones de monitorización.
- Modelado espaciotemporal sobre una red de 263 estaciones y 14 redes de monitorización.
- Forecasting de series temporales univariadas/multivariadas de calidad del aire.
- Carga directa del checkpoint en PyTorch mediante `torch.load` con `weights_only=False`, con acceso a metadatos, pesos, resultados y configuración.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües, de visión, audio ni modo thinking.
- No es un modelo generativo de texto: su salida es numérica (predicciones de PM2.5).

## Casos de uso

- Investigación sobre escalado de modelos: el checkpoint y sus resultados registrados permiten reproducir la comparación 1M vs 3M vs 10M y documentar que el aumento de parámetros no mejora el error de validación (9.222, +1.30% frente a 1M).
- Predicción de episodios de contaminación atmosférica: usar las predicciones a 24 horas para anticipar picos de PM2.5 en estaciones concretas y activar avisos sanitarios locales.
- Estudios de calidad del aire en la India: alimentar análisis académicos sobre patrones espaciotemporales de PM2.5 con un modelo ligero que cubre 263 estaciones.
- Baseline en pipelines de forecasting: servir como referencia de error (9.222 en validación) frente a la que comparar modelos más grandes o con variables meteorológicas adicionales (como Atlas W1).
- Prototipado de sistemas de alerta temprana de bajo coste: al tener menos de 10M de parámetros y un checkpoint de ~40 MB, puede ejecutarse en CPU para experimentos y demos.
- Docencia y reproducción de experimentos: el formato de checkpoint (meta, weights, results, cfg) facilita inspeccionar el proceso de entrenamiento y sus resultados en cursos de series temporales.

## Benchmarks y rendimiento

| Metrica | Atlas S3 (10M) | Referencia: Atlas 1M |
|---|---|---|
| Validación (error registrado) | 9.222 | 9.107 (implícito, ya que 9.222 es +1.30%) |
| Variación relativa | +1.30% | línea base |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que no es un modelo de lenguaje. El único dato de rendimiento es el error de validación de 9.222 registrado en la model card, con un empeoramiento del +1.30% respecto al modelo de 1M parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (checkpoint de ~40 MB en fp32; ~10 MB en fp16), aunque la cifra exacta no está documentada.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX antiguas) e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (carga directa con `torch.load`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Error de validacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlas S3 (10M) | 9.949.792 | PM2.5 24 h, India | 9.222 | Apache-2.0 | Hugging Face + GitHub |
| Atlas S2 (3M) | ~3M (no detallado) | PM2.5 24 h, India | no disponible | Apache-2.0 | Hugging Face |
| Atlas 1M | ~1M (no detallado) | PM2.5 24 h, India | ~9.107 (implícito) | Apache-2.0 | Hugging Face |
| Atlas W1 (1M + weather) | ~1M (no detallado) | PM2.5 24 h, India + meteorología | no disponible | Apache-2.0 | Hugging Face |

No se dispone de información sobre modelos comparables de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El propio autor marca el modelo como "not adopted": el aumento de parámetros empeoró el error de validación (+1.30% frente a 1M), por lo que no se recomienda su uso en producción.
- Cobertura geográfica limitada a estaciones CPCB de la India (263 estaciones, 14 redes); no se garantiza generalización a otras regiones.
- Entrenado con datos de 2010-2023: posible degradación ante cambios en la red de monitorización o en las condiciones posteriores al periodo de entrenamiento.
- No se documentan sesgos específicos, pero al ser un modelo numérico entrenado sobre una red de estaciones con cobertura desigual, puede presentar mayor error en estaciones con menos datos.
- Riesgo de alucinación no aplica en el sentido habitual; el riesgo equivalente es la predicción errónea de picos de contaminación, con implicaciones para alertas sanitarias si se usa sin validación local.
- Licencia Apache-2.0 permite uso comercial, pero el estado "not adopted" y la falta de benchmarks estándar desaconsejan su uso en producción sin evaluación adicional.
- No se incluyen los datos de entrenamiento; solo se documentan sus fuentes y términos en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paradoxailab/atlas-scale-10m
- Repositorio GitHub del proyecto: https://github.com/paradoxailab/paradox-world-model
- Registro de la familia Atlas: https://github.com/paradoxailab/paradox-world-model/blob/main/atlas/README.md
- Índice de la serie de modelos: https://github.com/paradoxailab/paradox-world-model/blob/main/models/series/README.md
- Fuentes y términos de los datos: https://github.com/paradoxailab/paradox-world-model/blob/main/DATA_SOURCES.md
- Citación: https://github.com/paradoxailab/paradox-world-model/blob/main/CITATION.cff
- Modelo anterior (Atlas S2, 3M): https://huggingface.co/paradoxailab/atlas-scale-3m
- Modelo siguiente (Atlas W1, 1M + weather): https://huggingface.co/paradoxailab/atlas-w1
- Serie completa: https://huggingface.co/paradoxailab/paradox-world-model-series
- Sitio web del laboratorio: https://paradoxailab.com
