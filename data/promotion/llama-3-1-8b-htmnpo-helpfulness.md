# promotion/Llama-3.1-8B-HTMNPO-helpfulness

## Resumen

Llama-3.1-8B-HTMNPO-helpfulness es un modelo de lenguaje experimental desarrollado por el usuario "promotion" como parte de una investigación sobre alineación multi-objetivo mediante optimización de preferencias basada en negociación de Nash (Nash bargaining). Se trata de un fine-tuning del modelo `meta-llama/Llama-3.1-8B-Instruct`, que actúa simultáneamente como política de referencia y como punto de inicialización. El modelo representa un vértice degenerado del simplex de pesos multi-objetivo: asigna todo el peso al objetivo de "helpfulness" (utilidad), ignorando por completo los otros tres objetivos considerados (instruction following, truthfulness y honesty). Su propósito es estudiar qué ocurre cuando un objetivo domina de forma exclusiva y cómo se degradan los objetivos ignorados.

El modelo tiene 8.030 millones de parámetros (8B) y se distribuye en formato safetensors con un tamaño de repositorio de 32,1 GB. No se especifica la longitud de contexto en la información disponible, aunque al derivar de Llama 3.1 se espera que herede la ventana de 128k tokens del modelo base, dato no confirmado en esta ficha. La licencia es llama3.1, sujeta a la Llama 3.1 Community License. El modelo no tiene descargas ni likes en HuggingFace y no está desplegado en ningún proveedor de inferencia, lo que indica que es un artefacto de investigación más que un producto listo para producción.

La relevancia de este modelo radica en su contribución al estudio empírico de la alineación multi-objetivo: al comparar los distintos "brazos" del simplex de pesos (cada uno con una agregación diferente de objetivos), se puede medir el coste de sacrificar objetivos secundarios en favor de uno primario. Los resultados publicados en la model card muestran que el énfasis exclusivo en helpfulness produce una mejora de +0,0500 en ese objetivo, pero degrada los otros tres, con un mínimo de -0,0728 en truthfulness.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repositorio en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | No disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct` como base, política de referencia e inicialización. El entrenamiento utiliza un esquema de optimización de preferencias multi-objetivo basado en negociación de Nash (Nash bargaining), donde cuatro objetivos son evaluados sobre prompts del dataset UltraFeedback mediante un oráculo de preferencias basado en `Qwen3-32B` con prompting. Cada "brazo" del experimento comparte el mismo conjunto de pares de preferencias, el mismo optimizador y el mismo presupuesto de entrenamiento, diferenciándose únicamente en cómo se agregan los objetivos. En este caso concreto, la agregación asigna peso 1,0 a helpfulness y peso 0 a los demás objetivos, lo que produce un vértice del simplex.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset (más allá de que usa prompts de UltraFeedback), ni sobre técnicas adicionales como RLHF o DPO. La model card no detalla el número de pasos de optimización ni la configuración de hiperparámetros. El entrenamiento se realizó con pesos en FP32 (según se infiere del tamaño del repositorio y del tensor type F32 observado en modelos hermanos de la misma familia, aunque no se confirma para este modelo concreto).

## Capacidades

No se han publicado capacidades específicas para este modelo en la información disponible. Al ser un fine-tuning de Llama-3.1-8B-Instruct, se espera que conserve las capacidades generales del modelo base (generación de texto, razonamiento, comprensión de instrucciones, soporte multilingüe, etc.), pero no hay datos verificados que lo confirmen. La model card solo reporta métricas de alineación sobre los cuatro objetivos evaluados, sin mencionar tareas concretas como generación de código, matemáticas o tool calling.

El modelo está diseñado como un artefacto de investigación para estudiar el comportamiento de la alineación multi-objetivo, no como un modelo de propósito general listo para producción. No se indica soporte para function calling, agentes ni modos de razonamiento especiales.

## Casos de uso

No se han documentado casos de uso concretos en la información proporcionada. Dado su carácter experimental y su enfoque en un único objetivo (helpfulness), no se recomienda su uso en aplicaciones de producción sin una evaluación adicional. Posibles usos académicos o de investigación incluyen:

- Estudio del trade-off entre objetivos de alineación: el modelo permite analizar cómo la optimización exclusiva de helpfulness afecta a la veracidad, honestidad y seguimiento de instrucciones, sirviendo como punto de comparación frente a otros brazos del simplex.
- Benchmarking de métodos de agregación multi-objetivo: puede utilizarse como referencia para evaluar técnicas de negociación de Nash frente a otras estrategias de combinación de preferencias.
- Análisis de degradación de objetivos secundarios: los resultados publicados (degradación de truthfulness y honesty) ofrecen datos empíricos para estudiar los límites de la optimización mono-objetivo.

En cualquier caso, se trata de un modelo de investigación sin despliegue en proveedores de inferencia y sin comunidad activa, por lo que su uso práctico fuera del ámbito académico es limitado.

## Benchmarks y rendimiento

La model card publica una tabla de "surplus" (excedente) sobre la política de referencia, medida a escala de población con 100 prompts, utilizando un oráculo de preferencias `Qwen3-32B` con prompting y promediando sobre ambos órdenes de presentación. Los resultados son los siguientes:

| Objetivo | Surplus |
|---|---|
| Instruction following | -0,0571 |
| Truthfulness | -0,0728 |
| Honesty | -0,0668 |
| Helpfulness | +0,0500 |
| **Minimo** | -0,0728 |

Estos datos indican que el modelo mejora ligeramente en helpfulness (+0,05) pero empeora en los otros tres objetivos, siendo truthfulness el más afectado (-0,0728). No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este modelo. Dado que el repositorio contiene pesos en safetensors con un tamaño de 32,1 GB (presumiblemente en FP32), se puede estimar que la inferencia en FP32 requeriría al menos 32 GB de VRAM, mientras que en FP16 se reduciría a unos 16 GB y en cuantización de 4 bits a aproximadamente 5-6 GB. Sin embargo, estos son cálculos generales basados en el tamaño del modelo y no en datos oficiales.

No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI. El modelo no está desplegado en ningún proveedor de inferencia según la información de HuggingFace. Para uso en investigación, una GPU con 24 GB de VRAM (como RTX 3090 o RTX 4090) podría ser suficiente con cuantización, pero no hay confirmación oficial.

## Comparativa con modelos similares

Se puede comparar con el modelo base `meta-llama/Llama-3.1-8B-Instruct` y con otro modelo de la misma familia de investigación, `promotion/Llama-3.1-8B-NBPO-600step`, que aparece en los resultados de búsqueda. Sin embargo, no se dispone de datos de rendimiento comparativos más allá de la tabla de surplus del propio modelo.

| Modelo | Parametros | Contexto | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|
| Llama-3.1-8B-HTMNPO-helpfulness | 8.03B | No disponible | llama3.1 | safetensors | No |
| Llama-3.1-8B-Instruct (base) | 8.03B | 128k (conocido, no confirmado en esta ficha) | llama3.1 | safetensors | Amplio |
| Llama-3.1-8B-NBPO-600step | 8.03B | No disponible | llama3.1 | safetensors (F32) | No |

No se dispone de datos de rendimiento en tareas estándar para ninguno de los modelos de la familia "promotion", por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo experimental de investigación, sin despliegue en producción ni soporte de proveedores de inferencia.
- La optimización exclusiva de helpfulness degrada significativamente la veracidad (-0,0728), la honestidad (-0,0668) y el seguimiento de instrucciones (-0,0571), lo que lo hace inadecuado para aplicaciones donde la fiabilidad factual sea crítica.
- No se han publicado evaluaciones de sesgos, alucinaciones o comportamientos tóxicos.
- La licencia llama3.1 impone restricciones de uso comercial según los términos de la Llama 3.1 Community License; es necesario revisar dichos términos antes de cualquier uso.
- No se especifica la longitud de contexto soportada, lo que impide garantizar un comportamiento correcto en ventanas largas.
- El modelo no tiene comunidad activa ni mantenimiento documentado; su uso en entornos productivos conlleva riesgos no evaluados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/promotion/Llama-3.1-8B-HTMNPO-helpfulness
- Dataset de generaciones del benchmark: https://huggingface.co/datasets/promotion/nbpo-benchmark-generations
- Modelo hermano (NBPO-600step): https://huggingface.co/promotion/Llama-3.1-8B-NBPO-600step
- Página oficial de Llama 3.1 (Meta): https://ai.meta.com/blog/meta-llama-3-1/
- Model card de Llama-3.1-8B-Instruct en HuggingFace: https://huggingface.co/meta-llama/Llama-3.1-8B
