# jy395/Qwen3-8B-rtn-w4a16

## Resumen

Qwen3-8B-rtn-w4a16 es una versión cuantizada del modelo Qwen/Qwen3-8B, publicada por el usuario jy395 como parte del conjunto de 30 configuraciones comprimidas que acompañan al artículo académico "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs" (ICAIF '26). La compresión aplicada es RTN (round-to-nearest) de 4 bits en pesos con activaciones en 16 bits (W4A16), sin datos de calibración, realizada mediante la herramienta llm-compressor del proyecto vLLM.

El modelo hereda la arquitectura y capacidades del Qwen3-8B original, pero su interés principal no es el rendimiento absoluto sino servir como punto de referencia experimental: el artículo estudia cuándo la compresión post-entrenamiento de modelos de lenguaje aplicados a finanzas requiere datos de calibración ajustados al dominio. Esta configuración RTN sin calibración es, por tanto, la línea base contra la que se comparan las variantes calibradas.

Es relevante para desarrolladores e investigadores que necesiten desplegar un modelo de 8B en entornos con restricciones de memoria, o que quieran reproducir los experimentos del artículo sobre el impacto de la calibración en tareas financieras. El checkpoint se distribuye en formato compressed-tensors, cargable directamente en vLLM y en transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B) |
| Parámetros totales | 2.167.453.176 (según safetensors del repo cuantizado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantización | W4A16 (pesos 4 bits, activaciones 16 bits), RTN sin calibración |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-8B es un transformer decoder-only de la familia Qwen3. Sobre él se aplica una cuantización post-entrenamiento RTN (round-to-nearest) de 4 bits en los pesos, manteniendo las activaciones en 16 bits. RTN es un método de cuantización sin calibración: los pesos se redondean al nivel de cuantización más cercano sin usar corpus de datos para ajustar los parámetros de escala. La compresión se ejecutó con llm-compressor y el script `rtn_w4a16.py` del repositorio del artículo.

No se dispone de información sobre el proceso de entrenamiento original del Qwen3-8B (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. El interés técnico de esta ficha radica en la compresión: el artículo investiga la relación entre el daño que la compresión inflige al modelo y su recuperación mediante calibración con datos del dominio financiero, evaluando diez tareas financieras. Esta variante RTN es la referencia sin calibración de ese estudio.

## Capacidades

- Generación de texto y conversación, heredadas del Qwen3-8B base.
- Razonamiento y matemáticas: capacidades del modelo original (no verificadas específicamente en esta versión cuantizada).
- Generación de código: capacidad heredada del modelo base.
- Soporte de tool calling / function calling: heredado del modelo base (no verificado en la versión cuantizada).
- Capacidades multilingües: heredadas del modelo base; la lista de idiomas no está disponible en la información proporcionada.
- Modo thinking: el modelo base Qwen3 incorpora modo de razonamiento; no se confirma su preservación tras la cuantización en la información disponible.
- Aplicación específica: evaluación en tareas financieras (diez tareas según el artículo).

## Casos de uso

- Investigación en compresión de modelos: servir como línea base RTN sin calibración para comparar con variantes calibradas en el estudio de ICAIF '26, midiendo la degradación en tareas financieras.
- Despliegue con memoria reducida: al ocupar aproximadamente 6,1 GB en el repositorio, permite ejecutar un modelo de la familia Qwen3-8B en GPUs con VRAM limitada mediante vLLM o transformers.
- Evaluación de análisis financiero: reproducir las diez tareas financieras del suite de evaluación del artículo para medir el impacto de la cuantización en dominios especializados.
- Servicio de generación de texto en producción con vLLM: el formato compressed-tensors se carga directamente en vLLM, lo que facilita el serving con cuantización W4A16.
- Experimentación académica sobre calibración: usar el checkpoint junto con los corpus de calibración del repositorio para estudiar cuándo los datos de dominio mejoran la recuperación tras compresión.
- Prototipado de asistentes conversacionales: aprovechar las capacidades conversacionales del Qwen3-8B en entornos con presupuesto de memoria ajustado, asumiendo la posible degradación por cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado evalúa diez tareas financieras, pero los resultados numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB para los pesos en W4A16, más overhead de activaciones y KV cache (dependiente de la longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para contextos moderados; A100/H100 para serving de alta concurrencia con vLLM.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, siempre que el contexto y el batch se mantengan moderados.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `device_map="auto"`. No se confirma soporte de llama.cpp/Ollama para este formato en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Qwen3-8B-rtn-w4a16 | 2,17 B (repo cuantizado) | W4A16 RTN sin calibración | no disponible | apache-2.0 | HuggingFace |
| Qwen/Qwen3-8B (base) | 8 B (aprox.) | FP16/BF16 | no disponible | apache-2.0 | HuggingFace |
| Otras variantes del mismo artículo (30 configuraciones) | 8 B (aprox.) | Diversas, con calibración | no disponible | apache-2.0 | Colección HF del autor |

La comparación relevante es con el modelo base sin cuantizar (mayor precisión, mayor huella de memoria) y con las variantes calibradas del mismo estudio (misma compresión pero con datos de calibración financiera). No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La cuantización RTN sin calibración puede degradar el rendimiento en tareas de dominio específico (financiero) más que las variantes calibradas; el propio artículo estudia este fenómeno.
- Riesgo de alucinación inherente al modelo base, potencialmente amplificado por la compresión.
- No se dispone de información sobre sesgos específicos del modelo base ni sobre su preservación tras la cuantización.
- Lista de idiomas soportados no disponible; no asumir cobertura multilingüe sin verificación.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-8B.
- El número de parámetros reportado por safetensors (2,17 B) corresponde al checkpoint cuantizado, no al modelo original; no debe interpretarse como un modelo de 2B.
- No se confirma el soporte de tool calling, modo thinking ni otras capacidades del modelo base tras la cuantización.
- Fecha de creación del repositorio inusualmente futura (2026-10-31) según los metadatos; verificar la integridad del checkpoint antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jy395/Qwen3-8B-rtn-w4a16
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Artículo (DOI): https://doi.org/10.1145/3858063.3858724
- Repositorio del artículo: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantización RTN: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/rtn_w4a16.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Colección completa de configuraciones: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- llm-compressor: https://github.com/vllm-project/llm-compressor
