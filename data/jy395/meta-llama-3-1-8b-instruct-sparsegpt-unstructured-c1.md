# jy395/Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c1

## Resumen

Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c1 es una versión comprimida del modelo meta-llama/Meta-Llama-3.1-8B-Instruct, publicada por el usuario jy395. La compresión consiste en una poda no estructurada del 50 % de los pesos aplicada con el algoritmo SparseGPT mediante la librería llm-compressor, calibrada sobre el corpus genérico C1 (WikiText-2). Los pesos se almacenan de forma densa, es decir, la matriz mantiene su forma original con ceros en las posiciones podadas, por lo que no se obtiene una reducción del tamaño del checkpoint ni una aceleración directa en hardware convencional.

El modelo forma parte de una colección de 30 configuraciones comprimidas publicadas junto con el artículo "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs" (ICAIF '26), que estudia cuándo la compresión post-entrenamiento de modelos de lenguaje financieros requiere datos de calibración del dominio. Esta configuración concreta emplea calibración genérica, lo que la convierte en la referencia de control frente a las variantes calibradas con corpus financieros.

La relevancia es fundamentalmente metodológica: sirve para evaluar el impacto de la poda SparseGPT al 50 % sobre un modelo Llama 3.1 de 8 000 millones de parámetros y comparar su degradación en diez tareas financieras frente a configuraciones con calibración específica del dominio. No es un modelo pensado para producción general, sino un artefacto de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos podados al 50 % de forma no estructurada con SparseGPT y almacenados densos |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128 000 tokens) |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en formato compressed-tensors con poda, sin cuantizacion indicada |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors en formato compressed-tensors |
| Parametros efectivos tras poda | aproximadamente 4 015 millones de pesos no nulos (50 % de poda no estructurada) |
| Corpus de calibracion | C1 - WikiText-2 (texto generico), 128 secuencias x 2048 tokens = 262 144 tokens |
| Protocolo de calibracion | consumo completo del corpus, max_seq_length=2048, semilla 42 |
| Tamano del repositorio | 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención de múltiples cabezas agrupadas (GQA) y normalización RMSNorm, entrenado originalmente por Meta con datos multilingües y ajustado con instrucciones mediante SFT y RLHF/DPO. Sobre ese modelo ya entrenado se aplica una poda no estructurada del 50 % con SparseGPT, un método de poda one-shot que aproxima la reconstrucción de las activaciones capa a capa mediante la resolución de un problema de mínimos cuadrados sobre un conjunto de calibración.

El proceso se ejecuta con llm-compressor usando el script `sparsegpt_unstructured.py` del repositorio del autor, con el corpus de calibración C1 (WikiText-2) consumido íntegramente (262 144 tokens, 128 secuencias de 2048 tokens, semilla 42). No hay reentrenamiento ni ajuste fino posterior a la poda, de modo que la degradación de capacidades es la propia del método one-shot. Al almacenarse los pesos en forma densa, el checkpoint conserva el tamaño y la forma del modelo original; la esparsidad solo se materializa si el motor de inferencia la explota explícitamente.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones heredados del modelo base Llama 3.1 8B Instruct.
- Razonamiento de propósito general y matemáticas básicas, con degradación esperable respecto al modelo sin podar.
- Generación de código, en la medida en que la poda al 50 % no la elimine; no se han publicado evaluaciones específicas.
- Soporte de tool calling y function calling heredado del formato de instrucciones de Llama 3.1.
- Capacidades multilingües del modelo base, aunque el autor no documenta idiomas soportados para esta variante.
- Orientación declarada a tareas financieras (etiqueta `finance`), evaluada en la suite de diez tareas del artículo.
- Sin modo thinking explícito, sin visión y sin audio.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como configuración de control con calibración genérica para medir la pérdida de rendimiento frente a variantes calibradas con datos financieros.
- Reproducción de resultados del artículo ICAIF '26: permite replicar la suite de evaluación de diez tareas financieras con el código publicado por el autor.
- Análisis de sensibilidad a la calibración: comparar esta variante con las otras 29 configuraciones de la colección para estudiar cuándo importa el dominio en la calibración.
- Prototipado de asistentes financieros de baja criticidad: el modelo puede responder consultas sobre conceptos financieros y resumir documentos, siempre con validación humana por la degradación de la poda.
- Evaluación de pipelines de inferencia con compressed-tensors: útil para probar la carga y ejecución en vLLM de checkpoints podados con pesos densos.
- Docencia y experimentación: ejemplo práctico de poda SparseGPT one-shot sobre un Llama 3.1 8B con protocolo de calibración documentado y reproducible.
- Generación aumentada por recuperación (RAG) sobre documentación financiera: el contexto del modelo base permite concatenar fragmentos recuperados, aunque la calidad de síntesis será inferior a la del modelo sin podar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la suite de evaluación del repositorio del autor (diez tareas financieras) y al artículo ICAIF '26, pero no incluye cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16 GB para los pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un GPU con 24 GB o más.
- Al almacenarse los pesos de forma densa, la poda no reduce el consumo de memoria ni acelera la inferencia en GPUs convencionales; se requiere hardware o kernels que exploten la esparsidad.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto moderado.
- Cabe en GPU de consumo como la RTX 4090 en BF16 con secuencias cortas; en GPUs de 16 GB requeriría cuantización adicional no incluida en este checkpoint.
- Despliegue: carga directa en vLLM (soporte de compressed-tensors) y en transformers con `device_map="auto"`. No se documenta soporte GGUF ni Ollama para esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SparseGPT 50 % c1) | 8 030 M (≈4 015 M no nulos) | no disponible | Poda no estructurada 50 %, pesos densos | Llama 3.1 Community | HuggingFace, 166 descargas |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8 030 M | 128 000 tokens | Ninguna | Llama 3.1 Community | HuggingFace oficial |
| Otras variantes de la coleccion ICAIF '26 | 8 030 M | no disponible | Poda o cuantizacion con calibracion financiera | Llama 3.1 Community | Coleccion jy395 en HuggingFace |

La comparación relevante es frente al modelo base sin comprimir, que conserva todos los pesos y por tanto mayor calidad, y frente a las variantes calibradas con datos financieros de la misma colección, que según la hipótesis del artículo deberían recuperar mejor el rendimiento en tareas del dominio.

## Limitaciones y advertencias

- La poda no estructurada al 50 % sin reentrenamiento degrada de forma apreciable la calidad; no se han publicado métricas que cuantifiquen esa pérdida en esta ficha.
- Los pesos se almacenan densos: no hay ahorro de memoria ni de cómputo en GPUs estándar, lo que anula buena parte del interés práctico de la compresión.
- Calibración con texto genérico (WikiText-2): para tareas financieras, el artículo sugiere que la calibración específica del dominio puede ser necesaria, por lo que esta variante podría rendir peor que las calibradas con corpus financiero.
- Riesgo de alucinación heredado del modelo base y potencialmente amplificado por la poda; no apta para decisiones financieras sin supervisión humana.
- Idiomas soportados no documentados para esta variante.
- Licencia Llama 3.1 Community: impone restricciones de uso comercial, obligaciones de atribución y límites de usuarios mensuales para determinados despliegues; revisar los términos antes de producción.
- Modelo de investigación con 166 descargas y sin likes; no hay evidencia de validación independiente.
- No se documenta soporte de cuantización adicional ni formatos GGUF para despliegue en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-sparsegpt-unstructured-c1
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Repositorio del autor: https://github.com/JunyiYe/finance-ptc-calibration
- Script de poda: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/sparsegpt_unstructured.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección completa ICAIF 2026: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Artículo (DOI): https://doi.org/10.1145/3858063.3858724
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
