# EvoLenTokenizer/base-200k

## Resumen

EvoLenTokenizer/base-200k es un modelo de lenguaje de ADN basado en la arquitectura BERT-base, desarrollado por el equipo EvoLen como control de referencia para el paper "EvoLen: Evolution-Guided Tokenization for DNA Language Model" (COLM 2026). El modelo emplea un tokenizador BPE estándar con un vocabulario de 5.120 tokens y se entrena con masked language modeling sobre el genoma humano (hg38). Su propósito principal es servir de línea base para evaluar el tokenizador guiado por evolución propuesto en el artículo, permitiendo comparar el impacto de la tokenización en tareas de genómica computacional.

Con 89,98 millones de parámetros y una ventana de contexto de 512 tokens, este modelo es ligero y puede ejecutarse en hardware de consumo. Aunque no está diseñado para producción, puede fine-tunearse para tareas downstream como predicción de elementos reguladores o clasificación de regiones genómicas. Su relevancia radica en que proporciona un punto de comparación reproducible para la investigación en representaciones de secuencias de ADN, un campo en rápida expansión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (Transformer encoder, 12 capas, hidden size 768) |
| Parametros totales | 89.980.160 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (ventana de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (modelo de ADN, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BERT-base estándar: 12 capas de transformer con hidden size de 768, 12 cabezas de atención y aproximadamente 90 millones de parámetros. El tokenizador es un BPE clásico con un vocabulario de 5.120 tokens, entrenado sobre secuencias del genoma humano. El entrenamiento se realizó con masked language modeling, enmascarando aleatoriamente tokens de entrada y optimizando la predicción de los mismos.

Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 4e-05, batch size de 96, 200.000 pasos de entrenamiento, optimizador Adam con betas (0.9, 0.98) y epsilon 1e-06, y un scheduler lineal con 10.000 pasos de warmup. Las secuencias se tokenizaron en ventanas de 512 tokens. Los resultados finales de entrenamiento fueron una pérdida de 5,0263, una precisión de 0,2365 y una perplejidad de 152,36. No se aplicaron técnicas de RLHF ni DPO; es un modelo de preentrenamiento puro.

## Capacidades

- Generación de representaciones contextuales de secuencias de ADN: produce embeddings por token que capturan información de contexto local y de largo alcance dentro de la ventana de 512 tokens.
- Fine-tuning para tareas de genómica: puede adaptarse a clasificación de secuencias, predicción de elementos funcionales o detección de variantes.
- Extracción de características: útil como extractor de features para pipelines de aprendizaje automático en bioinformática.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso, ya que es un modelo encoder-only.
- No tiene capacidades multilingües en el sentido de lenguajes humanos; su dominio es exclusivamente secuencias de ADN.

## Casos de uso

- Predicción de sitios de unión de factores de transcripción: fine-tuning del modelo sobre datos de ChIP-seq para identificar regiones reguladoras. Su arquitectura BERT permite capturar dependencias contextuales en la secuencia.
- Clasificación de regiones genómicas: distinguir promotores, enhancers, exones e intrones a partir de la secuencia. El modelo puede fine-tunearse con datasets anotados como ENCODE.
- Detección de variantes patogénicas: entrenar un clasificador sobre representaciones de secuencias con variantes de un solo nucleótido (SNVs) para evaluar su impacto funcional.
- Anotación de elementos funcionales en genomas: usar las representaciones como entrada para herramientas de anotación automática de nuevas secuencias.
- Evaluación de tokenizadores en modelos de ADN: servir como baseline en benchmarks que comparen diferentes estrategias de tokenización, como el propio EvoLen.
- Investigación en representaciones de secuencias: análisis de las propiedades de los embeddings generados para estudiar la estructura del genoma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de HuggingFace declara una entrada "base_5120" con resultados vacíos. Las únicas métricas reportadas son las de entrenamiento: pérdida 5,0263, precisión 0,2365 y perplejidad 152,36. No hay comparaciones con otros modelos de ADN en la documentación.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo pesa ~360 MB en safetensors). Con cuantización a 8 bits, cabría en ~200 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, incluyendo NVIDIA GTX 1650, RTX 3060, o incluso CPU para inferencia por lotes pequeños.
- Cabe en GPUs de consumo: sí, sin problema.
- Opciones de despliegue: se puede cargar con la librería transformers de HuggingFace en PyTorch. No requiere vLLM ni TGI; para producción ligera se puede usar ONNX Runtime o TensorRT.
- Latencia y throughput: no se han publicado mediciones, pero al ser un modelo pequeño, la inferencia es rápida (del orden de milisegundos por secuencia en GPU moderna).

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Existen otros modelos de lenguaje de ADN como DNABERT, Nucleotide Transformer o Enformer, pero no se han incluido métricas de comparación en la documentación del modelo. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo baseline de investigación, no diseñado para uso en producción clínica o diagnóstica.
- Entrenado exclusivamente en genoma humano (hg38); puede no generalizar bien a otras especies o a secuencias con alta divergencia.
- La ventana de contexto de 512 tokens limita el análisis a fragmentos de aproximadamente 1,5 kb de ADN, insuficiente para capturar dependencias de largo alcance en regiones genómicas extensas.
- No tiene capacidad de generación de secuencias; solo produce representaciones.
- La precisión de entrenamiento (0,2365) es baja, lo que indica que el modelo tiene un rendimiento limitado en la tarea de masked LM, aunque esto es esperable en un baseline.
- La licencia MIT permite uso comercial, pero el modelo no está validado para aplicaciones médicas o regulatorias.

## Enlaces

- HuggingFace: https://huggingface.co/EvoLenTokenizer/base-200k
- Paper (arXiv): https://huggingface.co/papers/2604.08698
- Código (GitHub): https://github.com/HN020719/EvoLen
