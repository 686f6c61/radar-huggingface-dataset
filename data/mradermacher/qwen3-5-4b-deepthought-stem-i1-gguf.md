# mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF

## Resumen

`mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF` es una publicación de cuantizaciones GGUF generadas por el usuario mradermacher a partir del modelo `xtools-at/Qwen3.5-4B-DeepThought-STEM`. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización de pesos en formato GGUF (compatible con llama.cpp y derivados) de un modelo base de la familia Qwen3.5 con aproximadamente 4 mil millones de parámetros, según indica el propio nombre del repositorio.

El propósito de este repositorio es facilitar el despliegue del modelo en hardware de consumo mediante múltiples niveles de cuantización (desde IQ1_S hasta Q6_K), empleando tanto cuantizaciones ponderadas como basadas en matriz de importancia (imatrix). El modelo subyacente parece estar orientado a tareas STEM (ciencia, tecnología, ingeniería y matemáticas), aunque no se dispone de la model card original en la información proporcionada.

La relevancia de esta ficha es limitada: el repositorio no presenta descargas ni interacciones, carece de licencia declarada, de idiomas especificados y de pipeline definido. Además, el dato de "parámetros totales" reportado (1.797.272) es inconsistente con el tamaño de 4B indicado en el nombre del modelo, por lo que debe tratarse con cautela y no como un dato fiable de arquitectura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer, familia Qwen3.5; no confirmado en la información) |
| Parámetros totales | 4B según el nombre del modelo; el campo de safetensors reporta 1.797.272 (dato inconsistente, no fiable) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, small-IQ4_NL, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo original presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `xtools-at/Qwen3.5-4B-DeepThought-STEM` en los datos proporcionados. Por el nombre se infiere una arquitectura transformer de la familia Qwen3.5 con 4B de parámetros, pero no se confirma ni el tipo de atención, ni la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El sufijo "DeepThought-STEM" sugiere un ajuste orientado a razonamiento científico y matemático, pero es una inferencia no verificada.

Respecto al proceso de cuantización, la model card indica que se trata de cuantizaciones ponderadas y basadas en imatrix (`weighted/imatrix quants`), generadas con un `convert_type: hf` y `quantize_version: 2`. Se listan 24 variantes de cuantización, lo que permite ajustar el equilibrio entre tamaño y calidad según el hardware disponible. No se documenta el dataset de calibración de la imatrix ni los parámetros exactos del proceso.

## Capacidades

- Generación de texto: capacidad presumible por tratarse de un modelo de lenguaje, aunque no se detalla en la información disponible.
- Razonamiento STEM: el nombre del modelo sugiere especialización en ciencia, tecnología, ingeniería y matemáticas, sin confirmación documental.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de 4B en GPUs con 8-12 GB de VRAM mediante llama.cpp u Ollama, útil para prototipado offline.
- Experimentación con razonamiento STEM en entornos con recursos limitados: si el ajuste DeepThought-STEM cumple lo que su nombre sugiere, podría emplearse para resolver problemas matemáticos o científicos en entornos sin conexión, aunque la ausencia de benchmarks impide garantizar su calidad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes, lo que lo hace útil para estudiar la degradación de calidad entre IQ1_S y Q6_K en un mismo modelo base.
- Integración en pipelines de llama.cpp: al estar en formato GGUF, puede cargarse directamente en herramientas compatibles para tareas de generación de texto por lotes.
- Pruebas de concepto de asistentes técnicos: para prototipos internos de asistencia en documentación técnica o resolución de ejercicios, sujeto a validación previa de calidad.
- Investigación sobre ajuste fino especializado: sirve como referencia para comparar el efecto de un ajuste "DeepThought-STEM" frente al modelo Qwen3.5-4B original, si este estuviera disponible.

Nota: todos estos casos son hipotéticos y dependen de validar el comportamiento real del modelo, dado que no hay benchmarks ni documentación de capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 4B, estimaciones orientativas):
  - IQ1_S / IQ1_M: aproximadamente 1,5-2 GB.
  - Q2_K / IQ2_XXS: aproximadamente 2-2,5 GB.
  - Q3_K_M / IQ3_M: aproximadamente 2,5-3,5 GB.
  - Q4_K_M / IQ4_XS: aproximadamente 3-4 GB.
  - Q5_K_M: aproximadamente 3,5-4,5 GB.
  - Q6_K: aproximadamente 4-5 GB.
  - Estas cifras son estimaciones basadas en el tamaño típico de un modelo de 4B cuantizado; no proceden de la información proporcionada.
- GPU recomendadas: no disponible en la información. Por tamaño, cabría esperar compatibilidad con RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100, pero no está confirmado.
- ¿Cabe en GPU de consumo? Presumiblemente sí en la mayoría de cuantizaciones, dado el tamaño de 4B, pero no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio). vLLM y TGI no soportan GGUF de forma nativa generalizada, por lo que requerirían los pesos originales.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a características estructurales.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-DeepThought-STEM-i1-GGUF (este) | 4B (según nombre) | no disponible | no disponible | GGUF | Hugging Face, 0 descargas |
| Qwen3.5-4B (base, si existe publicación oficial) | 4B | no disponible | no disponible | no disponible | no verificada en la información |
| Llama 3.2 3B Instruct | 3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Amplia disponibilidad |
| Phi-3.5-mini | 3,8B | 128K | MIT | safetensors, GGUF | Amplia disponibilidad |

Las filas de Llama 3.2 3B y Phi-3.5-mini se incluyen como referencia de categoría (modelos pequeños de 3-4B); no se dispone de comparación de rendimiento con este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del modelo base ni del ajuste DeepThought-STEM.
- Inconsistencia en el recuento de parámetros: el campo de safetensors (1.797.272) no cuadra con el "4B" del nombre; podría tratarse de un error de metadatos o de un modelo distinto al esperado.
- Licencia no declarada: no se puede garantizar el uso comercial. Es imprescindible verificar la licencia del modelo original `xtools-at/Qwen3.5-4B-DeepThought-STEM` antes de cualquier despliegue en producción.
- Idiomas no declarados: no se puede confirmar el soporte de castellano ni de otros idiomas.
- Riesgo de alucinación: inherente a los modelos de lenguaje, agravado por la falta de evaluación.
- Repositorio sin tracción: 0 descargas y 0 likes, sin actualizaciones desde su creación; no hay señales de mantenimiento.
- Cuantizaciones muy agresivas (IQ1_S, IQ1_M) pueden degradar notablemente la coherencia y el razonamiento; se recomienda Q4_K_M o superior para uso serio.
- No se documenta el dataset de calibración de la imatrix, lo que impide evaluar la fidelidad de las cuantizaciones ponderadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-DeepThought-STEM-i1-GGUF
- Modelo original cuantizado: https://huggingface.co/xtools-at/Qwen3.5-4B-DeepThought-STEM
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
