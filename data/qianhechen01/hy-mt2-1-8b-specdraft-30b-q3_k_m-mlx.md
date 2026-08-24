# QianheChen01/Hy-MT2-1.8B-SpecDraft-30B-Q3_K_M-MLX

## Resumen

Hy-MT2-1.8B-SpecDraft-30B-Q3_K_M-MLX es un checkpoint auxiliar diseñado para decodificación especulativa en entornos MLX (Apple Silicon). Se trata de una conversión del archivo GGUF `Hy-MT2-1.8B-SpecDraft-30B-Q3_K_M.gguf`, originalmente publicado por el usuario alphaZimuth, y adaptado por QianheChen01 para su uso con oMLX. El modelo base pertenece a la familia Hy-MT2 de Tencent, una serie de modelos de traducción multilingüe "fast-thinking" que soportan 33 idiomas y siguen instrucciones de traducción en múltiples lenguas.

El checkpoint concreto tiene una arquitectura `hunyuan_v1_dense` (transformer denso) con embeddings compartidos, y sus pesos están cuantizados en una mezcla de precisión que incluye Q3_K, Q4_K, Q5_K y Q6_K, con el nivel principal Q3_K_M (3-bit). Según los metadatos de safetensors, el número total de parámetros es 265.889.792, lo que resulta notablemente inferior a lo que sugiere el nombre "1.8B". Esta discrepancia podría deberse a que el archivo safetensors solo contiene una parte del modelo o a una convención de nomenclatura distinta, aunque no se dispone de información adicional para aclararlo.

El propósito principal de este modelo es actuar como modelo "draft" (borrador) en un esquema de decodificación especulativa, donde un modelo pequeño y rápido genera secuencias candidatas que luego son verificadas por un modelo más grande (en este caso, el de 30B). Su relevancia radica en que permite acelerar significativamente la inferencia de modelos de gran tamaño en hardware Apple, como se muestra en benchmarks de omlx.ai con una velocidad de 3027 tokens de prefijo por segundo y 196.3 tokens generados por segundo en un M4 Max.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `hunyuan_v1_dense` (transformer denso) |
| Parametros totales | 265.889.792 (según safetensors) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q3_K_M (3-bit), con tensores adicionales en F32, Q4_K, Q5_K, Q6_K |
| Idiomas soportados | 33 idiomas (según el paper de Hy-MT2) |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El checkpoint sigue la arquitectura `hunyuan_v1_dense`, que corresponde a un transformer denso con embeddings atados (tied embeddings). La model card indica que es una conversión del archivo GGUF original, donde los niveles de precisión del GGUF se han mapeado a módulos afines de MLX con grupo de tamaño 64. Los pesos de cuantización y los pesos flotantes ordinarios se almacenan en BF16.

No se dispone de información sobre el entrenamiento de este checkpoint en particular, ya que no es un modelo entrenado desde cero, sino una conversión de un modelo ya existente. El modelo base Hy-MT2-1.8B pertenece a la familia Hy-MT2 de Tencent, que según el paper (arXiv:2605.22064) se entrena para traducción multilingüe rápida y seguimiento de instrucciones en 33 idiomas. Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no se han publicado en la información disponible.

## Capacidades

- **Decodificación especulativa**: su función principal es generar secuencias candidatas de tokens para acelerar la inferencia de un modelo más grande (30B) mediante el mecanismo de verificación de draft.
- **Traducción multilingüe**: como parte de la familia Hy-MT2, el modelo base es capaz de traducir entre 33 idiomas, aunque este checkpoint específico está optimizado para el rol de draft y no para producción directa.
- **Seguimiento de instrucciones**: el modelo base sigue instrucciones de traducción en varios idiomas, lo que podría transferirse al checkpoint cuantizado, pero con limitaciones por la baja precisión.
- **Compatibilidad con MLX**: al estar convertido a MLX, se puede usar con oMLX y otros entornos de Apple Silicon.

## Casos de uso

- **Aceleración de inferencia en Apple Silicon**: el modelo se usa como draft para el modelo de 30B en un esquema de decodificación especulativa. En un Mac con M4 Max (40 núcleos, 128 GB), se ha medido una velocidad de 3.027 tokens/s en prefijo y 196.3 tokens/s en generación, lo que permite reducir la latencia en aplicaciones de traducción o generación de texto.
- **Despliegue en entornos con memoria limitada**: al tener solo 265M parámetros y estar cuantizado a 3-bit, puede caber en GPUs de gama baja o en la memoria unificada de los Mac, liberando recursos para el modelo principal.
- **Prototipado de sistemas de traducción**: dado que el modelo base Hy-MT2 soporta 33 idiomas, se podría usar este checkpoint para pruebas rápidas de traducción en entornos de desarrollo, aunque su calidad será inferior a la de la versión completa.
- **Integración con oMLX**: oMLX es un framework para decodificación especulativa en MLX; este checkpoint está diseñado para funcionar con él, permitiendo a los desarrolladores implementar pipelines de traducción con bajo consumo de recursos.
- **Investigación en cuantización y decodificación especulativa**: El modelo sirve como caso de estudio para evaluar el impacto de la cuantización a 3-bit en la calidad de los drafts y en la velocidad de verificación.
- **Uso como modelo de traducción ligero**: Aunque no es su propósito, su tamaño reducido y su capacidad multilingüe podrían permitir su uso en aplicaciones embebidas de traducción de baja calidad, siempre que no se requiera alta precisión.

## Benchmarks y rendimiento

Se ha publicado un dato de rendimiento en omlx.ai para el modelo en un M4 Max (40 núcleos, 128 GB):

| Métrica | Valor |
|---|---|
| Tokens de prefijo por segundo (PP) | 3.027 |
| Tokens generados por segundo (TG) | 196,3 |

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval, GSM8K, etc.) para este checkpoint específico. La información disponible no incluye comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: Al tener 265M parámetros en 3-bit, el modelo ocupa aproximadamente 1 GB (tamaño del repositorio). Se puede ejecutar en cualquier Mac con 8 GB de RAM unificada o más, y en GPUs con al menos 2 GB de VRAM.
- **GPU recomendadas**: Apple Silicon (M1, M2, M3, M4) gracias al soporte MLX. También es posible ejecutarlo en GPUs NVIDIA con CUDA, aunque la conversión está pensada para MLX.
- **Cabe en consumer GPU**: Sí, cabe en cualquier GPU moderna, incluso en iGPUs.
- **Opciones de despliegue**: oMLX (para decodificación especulativa), MLX, y potencialmente llama.cpp si se convierte a GGUF (ya que el origen es GGUF). No se menciona soporte para vLLM o TGI, pero al ser un modelo pequeño, podría ejecutarse en frameworks genéricos.
- **Latencia y throughput**: En el benchmark de omlx.ai, se observa una latencia de generación de aproximadamente 5,1 ms/token (196,3 tokens/s). La latencia de prefijo es de 0,33 ms/token (3.027 tokens/s). Estos valores son específicos del hardware M4 Max y pueden variar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de decodificación especulativa para MLX. El modelo base Hy-MT2 tiene tres tamaños (1.8B, 7B y 30B-A3B), pero este checkpoint es una versión cuantizada del de 1.8B y no se ha comparado con otros draft models. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Baja precisión de cuantización**: El uso de 3-bit (Q3_K_M) puede degradar significativamente la calidad del texto generado, especialmente en tareas de traducción donde la precisión es crítica.
- **Uso como draft**: No está pensado para generar respuestas finales. Su función es solo proponer tokens para la verificación por un modelo mayor; usarlo de forma independiente produciría resultados de baja calidad.
- **Licencia desconocida**: La licencia no está especificada, lo que puede impedir su uso comercial o en proyectos que requieran licencias claras.
- **Idiomas y contexto limitados**: Aunque el modelo base soporta 33 idiomas, este checkpoint no ha sido evaluado para todos ellos; la cuantización puede reducir aún más su capacidad.
- **Riesgo de alucinación**: Al ser un modelo de traducción, puede generar alucinaciones, especialmente con la cuantización agresiva. Se recomienda validar las salidas en aplicaciones de producción.
- **Fechas y metadatos inconsistentes**: El modelo fue creado en agosto de 2026 (según el repositorio), lo que sugiere que es un modelo experimental. La discrepancia entre el nombre "1.8B" y los parámetros reales de 265M no está explicada.

## Enlaces

- [HuggingFace - QianheChen01/Hy-MT2-1.8B-SpecDraft-30B-Q3_K_M-MLX](https://huggingface.co/QianheChen01/Hy-MT2-1.8B-SpecDraft-30B-Q3_K_M-MLX)
- [Benchmark en omlx.ai](https://omlx.ai/benchmarks/performance/zi2k8bq)
- [Repositorio de GitHub de Hy-MT2](https://github.com/Tencent-Hunyuan/Hy-MT2)
- [Paper de Hy-MT2 (arXiv)](https://arxiv.org/html/2605.22064)
- [mlx-community/Hy-MT2-1.8B (HuggingFace)](https://huggingface.co/mlx-community/Hy-MT2-1.8B)
- [tencent/Hy-MT2-1.8B-GGUF (HuggingFace)](https://huggingface.co/tencent/Hy-MT2-1.8B-GGUF)
