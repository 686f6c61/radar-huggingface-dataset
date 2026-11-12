# mrysh/qwen3.5-4b-prune_depth_10_awe_opus

## Resumen

`mrysh/qwen3.5-4b-prune_depth_10_awe_opus` es una versión podada por profundidad del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh como parte de un benchmark de poda que compara cuatro modelos base con ocho variantes de poda cada uno frente a alternativas cuantizadas. La poda se realizó con NVIDIA ModelOpt Minitron (versión 0.46.0rc1) aplicando una reducción del 10% de las capas del transformer, pasando de 32 a 29 capas sin modificar el ancho de los tensores. El checkpoint resultante conserva 3.866.979.776 parámetros y ocupa 7,8 GB en disco.

El modelo es exclusivamente de texto: el autor eliminó la torre de visión y la cabeza de predicción multi-token del Qwen3.5 original, por lo que no hereda las capacidades multimodales del modelo base. No se aplicó destilación ni fine-tuning posterior a la poda, de modo que se espera una degradación de calidad respecto al modelo original; precisamente el benchmark en el que se enmarca esta publicación mide esa caída sobre BFCL, un conjunto de evaluación de sesgo de contratación y MedQA, ejecutados con vLLM y con el modo thinking desactivado.

Su relevancia es metodológica más que de uso en producción: sirve como referencia para estudiar el compromiso entre reducción de parámetros, latencia y pérdida de calidad en modelos de 4B, y para comparar la poda estructural frente a la cuantización en tareas de tool calling, razonamiento clínico y evaluación de sesgos. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5 (arquitectura `qwen3_5_text`), podado por profundidad de 32 a 29 capas |
| Parametros totales | 3.866.979.776 |
| Parametros activos | no disponible (no es un modelo MoE según la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona variantes cuantizadas del benchmark, pero no detalla los tipos en esta ficha) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5, y le aplica poda por profundidad mediante NVIDIA ModelOpt Minitron. La estrategia consiste en eliminar capas completas del bloque del lenguaje: se solicitó una reducción del 10% de las capas y el resultado fueron 29 capas frente a las 32 originales, manteniendo intacto el ancho (dimensión de los estados ocultos y de las proyecciones). La importancia de cada capa se midió sobre un conjunto de calibración de 512 muestras mixtas. La reducción efectiva de parámetros del checkpoint completo es del 8,1%.

Además de la poda de capas, el autor eliminó la torre de visión y la cabeza de predicción multi-token propias de Qwen3.5, convirtiendo el modelo en un sistema puramente textual. No hubo destilación ni fine-tuning de recuperación tras la poda, lo que implica que la pérdida de calidad no se ha mitigado con entrenamiento adicional. El modelo se evaluó con vLLM en modo texto y con el modo thinking desactivado, dentro de un benchmark que lo compara con otras siete variantes de poda y con checkpoints cuantizados del mismo modelo base sobre BFCL, un conjunto de evaluación de sesgo de contratación y MedQA.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base aunque con la degradación esperable tras una poda sin recuperación.
- Tool calling y function calling: el benchmark en el que se enmarca evalúa explícitamente BFCL (Berkeley Function Calling Leaderboard), lo que indica que el modelo conserva la interfaz de llamadas a herramientas del Qwen3.5 original, si bien no se publican métricas concretas en esta ficha.
- Razonamiento clínico y respuesta a preguntas médicas: se evalúa sobre MedQA.
- Evaluación de sesgos: se evalúa sobre un conjunto de sesgo de contratación (hiring-bias).
- Capacidades multilingües: no disponibles en la información proporcionada; el modelo base Qwen3.5 es multilingüe, pero esta variante no documenta idiomas.
- Sin capacidades de visión: la torre visual fue eliminada explícitamente.
- Sin cabeza de predicción multi-token: eliminada en el proceso de poda.
- Modo thinking: el autor indica que la evaluación se realizó con thinking desactivado; no se documenta el comportamiento con thinking activo en esta variante.

## Casos de uso

- Investigación sobre poda estructural: el modelo sirve como punto de comparación controlado para medir cuánta calidad se pierde al eliminar el 10% de las capas de un transformer de 4B, en igualdad de condiciones con las otras siete variantes del benchmark.
- Evaluación de tool calling en entornos con restricciones de memoria: al reducir el número de capas y eliminar la torre de visión, el checkpoint ocupa 7,8 GB y puede desplegarse en GPUs de 24 GB con cuantización, lo que permite probar pipelines de function calling en hardware de gama alta de consumo.
- Benchmarking de sesgos en selección de personal: el conjunto de evaluación de sesgo de contratación del benchmark permite usar el modelo como sujeto de prueba para estudiar cómo la poda afecta a los sesgos demográficos en decisiones simuladas de contratación.
- Razonamiento clínico de referencia: la evaluación sobre MedQA lo hace útil como baseline en experimentos que comparan el efecto de la compresión de modelos sobre la precisión en preguntas médicas de opción múltiple.
- Comparación poda versus cuantización: dado que el benchmark incluye checkpoints cuantizados del mismo Qwen3.5-4B, el modelo permite analizar empíricamente qué técnica conserva mejor el rendimiento bajo la misma restricción de memoria.
- Despliegue de bajo coste en inferencia con vLLM: al ser un modelo texto de 3,87B parámetros, puede servirse con vLLM en una sola GPU para tareas de generación de texto donde la máxima calidad no sea crítica y prime el coste por token.
- Reproducibilidad de experimentos de compresión: la receta documentada (ModelOpt 0.46.0rc1, calibración de 512 muestras, nivel 0.1) permite replicar el proceso sobre otros modelos de la familia Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el modelo forma parte de un benchmark sobre BFCL, sesgo de contratación y MedQA ejecutado con vLLM, pero no incluye en la model card los valores numéricos obtenidos por esta variante ni por las alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 7,8 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica requiere una GPU de 16 GB o superior para contextos moderados.
- VRAM estimada con cuantización de 8 bits: en torno a 4 GB para pesos, viable en GPUs de 8 GB.
- VRAM estimada con cuantización de 4 bits: en torno a 2 GB para pesos, viable en GPUs de 6-8 GB y en algunas iGPU con memoria unificada.
- GPU recomendadas: NVIDIA A100, H100 o L40S para servir con vLLM en producción; RTX 4090, RTX 3090 o RTX 4080 para desarrollo y pruebas en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en BF16, y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: vLLM es el runtime empleado por el autor en el benchmark; al ser un checkpoint en safetensors con arquitectura `qwen3_5_text`, debería ser compatible con frameworks que soporten dicha arquitectura, aunque no se documentan conversiones a GGUF ni integraciones con llama.cpp u Ollama.
- Latencia y throughput: no disponibles; el autor no publica métricas de rendimiento en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| mrysh/qwen3.5-4b-prune_depth_10_awe_opus | 3,87B | no disponible | Apache 2.0 | Poda por profundidad 32→29 capas, solo texto, sin recuperación posterior |
| Qwen/Qwen3.5-4B (modelo base) | ~4,2B (estimado a partir de la reducción del 8,1%) | no disponible | Apache 2.0 | Modelo original con visión y predicción multi-token; referencia de calidad |
| Otras variantes de poda del mismo benchmark | no disponible | no disponible | Apache 2.0 | Siete variantes adicionales comparadas en BFCL, sesgo de contratación y MedQA |
| Checkpoints cuantizados de Qwen3.5-4B del benchmark | no disponible | no disponible | Apache 2.0 | Alternativa de compresión sin cambio estructural, comparada en el mismo benchmark |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad esperada: el autor advierte explícitamente de una caída de rendimiento frente al modelo base, al no haberse aplicado destilación ni fine-tuning de recuperación tras la poda.
- Pérdida de capacidades multimodales: la torre de visión y la cabeza de predicción multi-token fueron eliminadas, por lo que no puede procesar imágenes ni aprovechar la decodificación especulativa nativa de Qwen3.5.
- Sin datos de benchmarks publicados: no es posible cuantificar la magnitud de la degradación a partir de la información disponible.
- Idiomas no documentados: se desconoce si la poda afectó de forma desigual al rendimiento multilingüe del modelo base.
- Contexto no documentado: no se especifica la longitud de contexto soportada tras la poda.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño y potencialmente agravado por la pérdida de capas; no hay evaluaciones de factualidad en la información disponible.
- Sesgos: el propio benchmark incluye una prueba de sesgo de contratación, lo que sugiere que el autor considera relevante medir este aspecto; no se publican resultados.
- Uso comercial: la licencia Apache 2.0 lo permite, pero se recomienda verificar la licencia y las condiciones del modelo base Qwen/Qwen3.5-4B antes de un despliegue en producción.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción ni de validación comunitaria.
- Modo thinking: la evaluación se hizo con thinking desactivado; el comportamiento con razonamiento extendido no está documentado y podría degradarse de forma distinta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/qwen3.5-4b-prune_depth_10_awe_opus
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA ModelOpt (librería de poda): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- BFCL (Berkeley Function Calling Leaderboard): https://gorilla.cs.berkeley.edu/leaderboard.html
- MedQA: https://github.com/jind11/MedQA
