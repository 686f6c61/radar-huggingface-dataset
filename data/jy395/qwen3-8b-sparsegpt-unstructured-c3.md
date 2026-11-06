# jy395/Qwen3-8B-sparsegpt-unstructured-c3

## Resumen

Qwen3-8B-sparsegpt-unstructured-c3 es una versión comprimida del modelo Qwen3-8B de Alibaba Qwen, publicada por el usuario jy395 (Junyi Ye y colaboradores) como parte del conjunto de 30 configuraciones de compresión que acompañan al artículo "Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs", presentado en ICAIF '26 (7th ACM International Conference on AI in Finance). El modelo aplica una poda no estructurada del 50 % mediante SparseGPT sobre Qwen3-8B, con los pesos almacenados en formato denso, y calibrada sobre el corpus C3 (FinMix).

El problema que aborda es la compresión post-entrenamiento de modelos de lenguaje especializados en finanzas y el papel que juega la coincidencia de dominio entre los datos de calibración y la tarea objetivo. El checkpoint se distribuye en formato compressed-tensors, lo que permite cargarlo directamente en vLLM o en transformers sin pasos intermedios de conversión.

El modelo conserva la arquitectura y el tokenizador del Qwen3-8B original (8.190.735.360 parámetros según los safetensors), pero con la mitad de las conexiones sinápticas eliminadas de forma no estructurada. Es relevante para investigadores que estudian el impacto de la calibración en la compresión de LLMs financieros y para desarrolladores que necesitan desplegar un modelo de 8B con menor carga computacional manteniendo el comportamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B); pesos podados al 50 % de forma no estructurada y almacenados en formato denso |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen3-8B soporta hasta 32.768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible; el checkpoint es de poda (sparsegpt), no de cuantizacion |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (compatible con vLLM y transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only de 8.190.735.360 parámetros. Sobre él se aplica SparseGPT con una poda no estructurada del 50 %: se eliminan la mitad de los pesos individuales de las matrices, sin imponer patrones de bloque, y el resultado se almacena en formato denso (los pesos podados quedan a cero pero ocupan memoria). La herramienta utilizada es llm-compressor del proyecto vLLM.

La calibración se realiza sobre el corpus C3 (FinMix), compuesto por 2.042 prompts financieros con formato de tarea, aproximadamente 260.000 tokens, construidos a partir de los splits de entrenamiento y validación de diez benchmarks financieros (nunca de los conjuntos de test). El protocolo consume el corpus completo con `max_seq_length=2048` y semilla 42. El artículo asociado estudia cuándo la compresión de LLMs financieros requiere datos de calibración del mismo dominio, y esta configuración concreta (C3) es una de las 30 publicadas para comparar el efecto de distintos corpus de calibración sobre la degradación y la recuperación del rendimiento.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3-8B.
- Razonamiento y matemáticas: el modelo base Qwen3-8B incluye modos de razonamiento, aunque la poda puede degradar estas capacidades y no se han publicado evaluaciones específicas en la información disponible.
- Generación de código: capacidad heredada del modelo base, sin datos de evaluación en esta ficha.
- Soporte de tool calling y function calling: heredado del modelo base; no se confirma su preservación tras la poda.
- Capacidades multilingües: heredadas del modelo base; los idiomas concretos no están disponibles en la información proporcionada.
- Especialización financiera: el checkpoint está calibrado sobre prompts financieros, orientado a tareas de análisis y razonamiento en dominio financiero.

## Casos de uso

- Investigación sobre compresión de LLMs: sirve como punto de comparación frente a otras configuraciones del mismo conjunto (30 en total) para medir el efecto del corpus de calibración (C3 frente a otros) sobre la degradación en tareas financieras.
- Evaluación de poda no estructurada: permite reproducir los experimentos del artículo con el suite de evaluación de diez tareas financieras publicado en el repositorio de GitHub.
- Análisis financiero asistido: el modelo puede procesar prompts con formato de tarea financiera (clasificación, extracción, respuesta a preguntas) gracias a la calibración específica sobre FinMix.
- Despliegue con menor huella de memoria: al tener la mitad de los pesos a cero, puede aprovechar kernels de sparsity en vLLM para reducir el coste computacional en inferencia respecto al Qwen3-8B denso.
- Generación de texto en pipelines de investigación: carga directa en transformers con `device_map="auto"` para experimentos reproducibles con semilla fija.
- Base para estudios de recuperación tras compresión: útil para investigar técnicas de recuperación (fine-tuning, destilación) sobre modelos podados en dominios especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo asociado evalúa diez tareas financieras, pero los resultados numéricos concretos de esta configuración no se incluyen en la model card ni en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos en formato denso, el checkpoint ocupa aproximadamente 32,8 GB en el repositorio (pesos en fp16/bf16). En la práctica, la inferencia requiere al menos ~16-17 GB de VRAM si se carga en bf16 con los pesos podados a cero (los ceros no se pueden comprimir automáticamente sin kernels específicos), o ~33 GB si se materializan completos.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB), L40S (48 GB) para despliegue en bf16; RTX 4090 (24 GB) posiblemente con cuantización adicional no incluida en este checkpoint.
- Cabe en GPU de consumo: RTX 4090 (24 GB) de forma ajustada en bf16; GPUs de 16 GB requerirían cuantización adicional no disponible en este checkpoint.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con `AutoModelForCausalLM`, y potencialmente TGI si soporta el formato compressed-tensors.
- Latencia y throughput: no disponibles; dependen del soporte de kernels de sparsity en el backend elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Formato |
|---|---|---|---|---|---|
| jy395/Qwen3-8B-sparsegpt-unstructured-c3 | 8.190.735.360 | No disponible | SparseGPT 50 % no estructurada | apache-2.0 | compressed-tensors |
| Qwen/Qwen3-8B (base) | 8.190.735.360 | 32.768 tokens (segun modelo base) | Ninguna | apache-2.0 | safetensors |
| Otras configuraciones del mismo conjunto (jy395) | 8.190.735.360 | No disponible | Distintos corpus de calibracion | apache-2.0 | compressed-tensors |

La comparación directa con modelos de poda de otros autores no está disponible en la información proporcionada. La alternativa más relevante es el propio Qwen3-8B sin comprimir, que sirve como referencia de rendimiento máximo, y las otras 29 configuraciones del conjunto ICAIF '26 para aislar el efecto del corpus de calibración.

## Limitaciones y advertencias

- La poda no estructurada al 50 % puede degradar capacidades de razonamiento, matemáticas y código del modelo base; no se han publicado evaluaciones que cuantifiquen esta degradación en la información disponible.
- Los pesos se almacenan en formato denso, por lo que el ahorro de memoria solo se materializa si el backend aplica kernels de sparsity; de lo contrario, el consumo es similar al del modelo denso.
- El modelo está calibrado exclusivamente sobre prompts financieros (C3/FinMix), lo que puede introducir sesgo hacia ese dominio y afectar al rendimiento en tareas generales.
- Riesgo de alucinación inherente al modelo base, potencialmente incrementado por la compresión.
- Idiomas soportados no confirmados; la poda puede afectar de forma desigual a idiomas con menos representación en la calibración.
- Licencia apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-8B y citar el artículo original.
- No se han publicado métricas de latencia ni throughput para esta configuración concreta.
- El checkpoint está pensado para investigación en compresión; su uso en producción requiere validación específica del dominio de destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jy395/Qwen3-8B-sparsegpt-unstructured-c3
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Colección completa (ICAIF 2026): https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- Repositorio de código y calibración: https://github.com/JunyiYe/finance-ptc-calibration
- Script de poda SparseGPT: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/sparsegpt_unstructured.py
- Suite de evaluación: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Herramienta llm-compressor: https://github.com/vllm-project/llm-compressor
- Artículo (DOI): https://doi.org/10.1145/3858063.3858724
