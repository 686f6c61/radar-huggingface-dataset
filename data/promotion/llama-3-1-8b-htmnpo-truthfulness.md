# promotion/Llama-3.1-8B-HTMNPO-truthfulness

## Resumen

El modelo `promotion/Llama-3.1-8B-HTMNPO-truthfulness` es un fine-tuning del modelo `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el grupo "promotion". Forma parte de una familia de modelos que exploran la alineación multi-objetivo mediante optimización de preferencias basada en negociación de Nash (Nash Bargaining Preference Optimization, NBPO). En concreto, este checkpoint representa la "esquina" de un solo objetivo: asigna todo el peso a la veracidad (*truthfulness*), ignorando los otros tres objetivos considerados en el estudio (seguimiento de instrucciones, honestidad y utilidad).

El modelo se entrena a partir de `meta-llama/Llama-3.1-8B-Instruct`, que actúa tanto como política de referencia como inicialización. Los cuatro objetivos se puntúan sobre prompts del dataset UltraFeedback mediante un oráculo de preferencias basado en `Qwen3-32B`. Todos los brazos del estudio comparten el mismo conjunto de pares, optimizador y presupuesto de entrenamiento, diferenciándose únicamente en la agregación de objetivos. Este modelo concreto es relevante para investigar cómo el énfasis exclusivo en la veracidad afecta al resto de dimensiones de calidad, y sirve como punto de comparación dentro del marco multi-objetivo.

Con 8.030 millones de parámetros, el modelo mantiene la arquitectura transformer de Llama 3.1, aunque no se especifica la longitud de contexto en la información disponible. Su licencia es la Llama 3.1 Community License, lo que permite uso comercial bajo los términos de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct` y se entrena mediante un método de optimización de preferencias multi-objetivo basado en negociación de Nash (HTMNPO). En este enfoque, cuatro objetivos —seguimiento de instrucciones, veracidad, honestidad y utilidad— se puntúan sobre prompts de UltraFeedback usando un oráculo de preferencias `Qwen3-32B` con prompting. El entrenamiento utiliza un conjunto de pares de respuestas, un optimizador y un presupuesto fijo, y la única variación entre los distintos brazos del estudio es la forma de agregar los objetivos. En este checkpoint concreto, todo el peso se asigna a la veracidad, lo que produce un modelo especializado en esa dimensión a costa de las demás.

No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. La información disponible indica que el modelo base es también la política de referencia y la inicialización, lo que sugiere un fine-tuning directo sin cambios arquitectónicos.

## Capacidades

- Generación de texto en lenguaje natural, heredada del modelo base Llama-3.1-8B-Instruct.
- Razonamiento y comprensión de instrucciones, aunque el entrenamiento con peso exclusivo en veracidad puede degradar el seguimiento de instrucciones (según los datos de surplus).
- Optimización específica para producir respuestas veraces, medida por el oráculo de preferencias.
- No se documentan capacidades adicionales como tool calling, agentes, visión o audio en la información disponible.
- Soporte multilingüe no especificado; se asume el del modelo base, pero no hay confirmación.

## Casos de uso

- Investigación en alineación de modelos: sirve como punto de referencia para estudiar el equilibrio entre veracidad y otros objetivos en sistemas de IA.
- Generación de contenido factual en entornos controlados: puede usarse en experimentos donde la prioridad es minimizar la desinformación, aunque su rendimiento en otras métricas es inferior.
- Evaluación de métodos de optimización multi-objetivo: permite comparar el efecto de asignar todo el peso a un solo criterio frente a agregaciones ponderadas.
- Desarrollo de asistentes de IA centrados en la veracidad: en dominios donde la exactitud es crítica (por ejemplo, documentación técnica), este modelo podría servir como base para fine-tuning adicional.
- Análisis de sesgos en preferencias: al estar entrenado con un oráculo específico, puede usarse para estudiar cómo las preferencias del oráculo influyen en el comportamiento del modelo.
- Benchmarking de veracidad: puede emplearse como modelo de referencia en conjuntos de datos que miden la factualidad de las respuestas.

## Benchmarks y rendimiento

La model card proporciona una tabla de "surplus" (excedente) sobre el modelo de referencia, evaluada con 100 prompts de UltraFeedback y un oráculo `Qwen3-32B`. Estos datos no corresponden a benchmarks estándar como MMLU o HumanEval, sino a una métrica interna de mejora relativa.

| Objetivo | Surplus |
|---|---|
| Seguimiento de instrucciones | -0.0501 |
| Veracidad | -0.0486 |
| Honestidad | -0.0415 |
| Utilidad | +0.0231 |
| Mínimo | -0.0501 |

Estos valores indican que, en comparación con el modelo base, el modelo empeora en seguimiento de instrucciones, veracidad y honestidad, pero mejora ligeramente en utilidad. El resultado es contraintuitivo para un modelo supuestamente optimizado para veracidad, lo que sugiere que la métrica del oráculo no captura bien la mejora o que el entrenamiento no logró el efecto deseado. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

No se proporcionan requisitos específicos en la información del modelo. Como orientación general para un modelo de 8B parámetros en formato safetensors:

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (peso del modelo ~16 GB en FP16).
- Con cuantización de 4 bits (si se genera), la VRAM necesaria se reduce a unos 4-5 GB, aunque no se ofrecen archivos GGUF en el repositorio.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para FP16 (por ejemplo, RTX 4090, A100 40GB, etc.). Para cuantización, una GPU de 8 GB podría ser suficiente.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con bibliotecas como Transformers, vLLM o TGI. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre comparativas con otros modelos de la misma categoría. El repositorio no incluye benchmarks estándar ni comparaciones con otros fine-tunings de Llama-3.1-8B-Instruct. Se puede mencionar que existen otros brazos del mismo estudio (por ejemplo, `promotion/Llama-3.1-8B-NBPO-600step`) que utilizan agregaciones diferentes de los objetivos, pero no se proporcionan datos cuantitativos para comparar.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.
- El entrenamiento con un solo objetivo (veracidad) produce una degradación notable en seguimiento de instrucciones, honestidad y veracidad según la métrica interna, lo que sugiere que el método no logra el objetivo declarado.
- No se han publicado evaluaciones en benchmarks estándar, por lo que su rendimiento real en tareas generales es desconocido.
- La licencia Llama 3.1 Community License impone restricciones de uso aceptable, incluyendo la prohibición de generar contenido engañoso o fraudulento.
- No se especifican idiomas soportados; se asume que hereda las capacidades del modelo base, pero no hay confirmación.
- El modelo no está desplegado en ningún proveedor de inferencia, lo que limita su uso práctico inmediato.
- Riesgo de alucinaciones no evaluado; la optimización para veracidad no garantiza ausencia de errores factuales.

## Enlaces

- [HuggingFace: promotion/Llama-3.1-8B-HTMNPO-truthfulness](https://huggingface.co/promotion/Llama-3.1-8B-HTMNPO-truthfulness)
- [Dataset de generaciones: promotion/nbpo-benchmark-generations](https://huggingface.co/datasets/promotion/nbpo-benchmark-generations)
- [Modelo base: meta-llama/Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B)
