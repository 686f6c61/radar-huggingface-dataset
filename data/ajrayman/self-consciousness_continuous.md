# ajrayman/Self-consciousness_continuous

## Resumen

`Self-consciousness_continuous` es un modelo de clasificación de texto (regresión) desarrollado por el usuario `ajrayman` como un ajuste fino (*fine-tuning*) de `roberta-base` de Facebook AI. El nombre sugiere que está diseñado para puntuar de forma continua algún aspecto relacionado con la autoconciencia o la conciencia en textos, aunque la model card no especifica la tarea exacta ni el conjunto de datos utilizado. Se trata de un modelo pequeño (124,6 millones de parámetros) pensado para tareas de análisis de texto a nivel de frase o documento, no para generación.

La relevancia de este modelo radica en su enfoque: en lugar de una clasificación binaria (como el modelo hermano `Self-consciousness_binary`), este produce una puntuación continua, lo que podría ser útil para medir grados de autoconciencia en respuestas de IA o en textos generados. Sin embargo, la documentación es extremadamente escasa: no se indica el dataset de entrenamiento, el idioma soportado ni el propósito concreto. Esto limita su uso directo en producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (Transformer encoder) |
| Parametros totales | 124.646.401 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens (límite de RoBERTa-base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con FP32/FP16) |
| Idiomas soportados | no disponible (probablemente inglés, dado el modelo base, pero no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `roberta-base`, un transformer encoder de 12 capas, 12 cabezas de atención y 768 dimensiones ocultas, preentrenado con masked language modeling sobre 160 GB de texto en inglés. El fine-tuning se realizó con una cabeza de regresión (una única salida lineal) para producir una puntuación continua. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 2e-5, batch size de 32, optimizador Adam (betas 0.9/0.999), scheduler lineal con warmup del 6% y 8 épocas. No se especifica el dataset de entrenamiento ni el proceso de etiquetado. La pérdida de entrenamiento final fue de 0.039 y la de validación de 0.0508, con RMSE de 0.2253, MAE de 0.1778 y correlación de 0.2884 en el conjunto de evaluación.

No se menciona ninguna innovación técnica más allá del ajuste estándar. El modelo se generó con la herramienta `Trainer` de Hugging Face, lo que sugiere un pipeline convencional.

## Capacidades

- Regresión de texto: produce una puntuación continua (probablemente entre 0 y 1) relacionada con la autoconciencia, aunque no se documenta la escala exacta.
- Clasificación de secuencias: adecuado para frases o párrafos cortos (hasta 512 tokens).
- Multilingüe: no confirmado; el modelo base es monolingüe en inglés, por lo que se espera un rendimiento limitado en otros idiomas.
- Sin soporte de tool calling, agentes, generación de texto ni razonamiento multi-paso: es un modelo encoder puro, no generativo.
- Sin capacidades de visión ni audio.

## Casos de uso

- Análisis de autoconciencia en respuestas de IA: dado un texto generado por un LLM, el modelo puede asignar una puntuación continua que indique el grado de "autoconciencia" percibido. Útil en investigación sobre alineación y comportamiento de sistemas conversacionales.
- Evaluación de narrativas en primera persona: en estudios psicológicos o literarios, se puede puntuar el nivel de introspección o autoconciencia en diarios, entrevistas o relatos.
- Filtrado de contenido en aplicaciones de chat: integrar el modelo como un clasificador auxiliar para detectar respuestas que muestren un alto grado de autoconciencia, lo que podría ser relevante para moderación o personalización.
- Investigación en consciencia artificial: como herramienta de análisis en experimentos que buscan medir indicadores de consciencia en sistemas de IA, aunque la validez del modelo es cuestionable sin una definición clara de la variable.
- Análisis de sentimiento o emocionalidad extendida: aunque no está documentado, la salida continua podría correlacionarse con dimensiones psicológicas, permitiendo su uso en estudios de psicometría computacional.
- Benchmarking de modelos de lenguaje: comparar cómo diferentes LLMs generan texto con mayor o menor autoconciencia, usando este modelo como métrica (con las debidas reservas sobre su validez).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, GLUE, etc.) en la información disponible. La model card solo incluye métricas de evaluación del propio entrenamiento, que se muestran a continuación. Estas métricas son declaradas por el autor y no han sido verificadas de forma independiente.

| Metrica | Valor |
|---|---|
| Loss (validación) | 0.0508 |
| RMSE | 0.2253 |
| MAE | 0.1778 |
| Correlación (Corr) | 0.2884 |

La correlación baja (0.2884) sugiere que la variable objetivo no está fuertemente relacionada con las predicciones del modelo, lo que indica una capacidad predictiva limitada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP32, menos de 1 GB en FP16 o cuantizado a 8 bits. Un modelo de 125M parámetros ocupa unos 500 MB en FP32.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Tarjetas consumer como GTX 1060 6GB, RTX 2060, RTX 3060, etc., pueden ejecutarlo sin problemas. También funciona en CPU.
- Despliegue: compatible con la librería `transformers` de Hugging Face, así como con `vLLM` (aunque no es óptimo para modelos encoder), `ONNX Runtime` y `llama.cpp` (si se convierte a GGUF, aunque no es habitual para encoders). Se puede servir con `TGI` o `FastAPI` para inferencia en producción.
- Latencia: en una GPU moderna (RTX 3090), la inferencia para una frase de 128 tokens es del orden de milisegundos (menos de 10 ms). En CPU, puede ser de 50-100 ms por frase.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría (regresión de autoconciencia). El autor tiene un modelo hermano `Self-consciousness_binary` que realiza clasificación binaria, pero no se han publicado comparaciones. Otros modelos de análisis de texto basados en RoBERTa (por ejemplo, `cardiffnlp/twitter-roberta-base-sentiment`) existen, pero no son directamente comparables en tarea. Por tanto, la comparativa se limita a lo siguiente:

| Modelo | Tarea | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| Self-consciousness_continuous | Regresión de autoconciencia | 124,6M | 512 | MIT |
| Self-consciousness_binary | Clasificación binaria de autoconciencia | 124,6M (estimado) | 512 | MIT |
| roberta-base (base) | MLM / clasificación general | 125M | 512 | MIT |

No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Documentación insuficiente: no se especifica el dataset de entrenamiento, el proceso de etiquetado, el idioma ni la definición operativa de "autoconciencia". Esto impide evaluar su validez y generalización.
- Baja correlación en validación (0.2884): el modelo tiene una capacidad predictiva débil, lo que sugiere que la variable objetivo es difícil de modelar o que el dataset es ruidoso.
- Sesgos potenciales: al estar basado en RoBERTa, hereda los sesgos del preentrenamiento (género, raza, etc.), que pueden afectar a las puntuaciones en textos que contengan estos sesgos.
- Riesgo de alucinación: no aplica, ya que es un modelo discriminativo, no generativo.
- Limitaciones de idioma: probablemente solo funciona bien en inglés; su uso en otros idiomas no está validado.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero la falta de documentación sobre los datos de entrenamiento podría plantear problemas de propiedad intelectual si esos datos no son de dominio público.
- No apto para producción sin validación: dado el bajo rendimiento y la falta de especificaciones, no se recomienda su uso en aplicaciones críticas sin una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajrayman/Self-consciousness_continuous
- Modelo hermano (clasificación binaria): https://huggingface.co/ajrayman/Self-consciousness_binary
- Otro modelo del autor (maquiavelismo continuo): https://huggingface.co/ajrayman/machiavellianism_continuous
- Artículo relacionado (enfoque por fases hacia la consciencia en IA): https://link.springer.com/chapter/10.1007/978-3-031-92605-1_1
