# maccotaro0/japanese-reranker-xsmall-v2-onnx

## Resumen

El modelo `maccotaro0/japanese-reranker-xsmall-v2-onnx` es una conversión a ONNX del re-ranker japonés `hotchpotch/japanese-reranker-xsmall-v2`, desarrollada por `maccotaro0` para permitir su ejecución en CPU y en entornos on-device. Se trata de un cross-encoder basado en la arquitectura ModernBERT, que recibe pares consulta-pasaje y devuelve una puntuación de relevancia. La conversión aplica cuantización dinámica int8, reduciendo el tamaño del modelo de 147 MB a 37 MB, manteniendo los pesos originales sin cambios salvo la cuantización.

Este modelo resulta especialmente útil en sistemas de recuperación aumentada por generación (RAG) en japonés, donde se utiliza como segunda etapa de filtrado para reordenar los documentos recuperados por una búsqueda inicial. Al estar publicado bajo licencia MIT y en formato ONNX, es una opción práctica para aplicaciones que necesitan un re-ranker ligero y sin dependencias de GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en ModernBERT |
| Parametros totales | no disponible |
| Parametros activos | No aplica (modelo no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantización dinámica) |
| Idiomas soportados | Japonés (ja) |
| Licencia | MIT |
| Formato de pesos | ONNX (model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo es una conversión directa a ONNX del modelo original `hotchpotch/japanese-reranker-xsmall-v2`. La arquitectura subyacente es un cross-encoder basado en ModernBERT, un transformer encoder moderno optimizado para eficiencia. Los pesos se exportaron con `optimum-cli export onnx --task text-classification` y posteriormente se aplicó cuantización dinámica de pesos a int8 mediante `onnxruntime.quantization.quantize_dynamic`. No se ha realizado ningún ajuste adicional de los pesos.

En cuanto al entrenamiento, no se dispone de información sobre los datos utilizados, el número de tokens ni si se aplicaron técnicas como RLHF o DPO; el modelo original fue entrenado por `hotchpotch`, pero esos detalles no se incluyen en la documentación disponible.

## Capacidades

- Re-ranquear pares consulta-pasaje: el modelo toma `input_ids` y `attention_mask` y devuelve un `logits` por par, donde una puntuación mayor indica mayor relevancia.
- Integración en pipelines de RAG: puede usarse como segunda etapa de recuperación para refinar los resultados de una búsqueda inicial (BM25 o embeddings).
- Ejecución on-device: gracias al formato ONNX y la cuantización int8, el modelo puede ejecutarse en CPU sin necesidad de GPU, lo que facilita su uso en aplicaciones de escritorio, móviles o en el navegador (con transformers.js).
- Optimizado para CPU: las mediciones en Apple Silicon muestran una latencia de 63 ms para 128 tokens y 106 ms para 192 tokens (10 pares).
- No soporta tool calling, generación de texto, visión ni audio: es exclusivamente un clasificador de relevancia.

## Casos de uso

- Re-ranking en sistemas RAG en japonés: tras una recuperación inicial con un modelo de embeddings, el re-ranker evalúa cada par consulta-pasaje y reordena los documentos para presentar al generador solo los más relevantes.
- Búsqueda semántica en documentos corporativos: en una empresa con documentación interna en japonés, el modelo filtra los resultados de una búsqueda por palabras clave para mostrar primero los pasajes más pertinentes.
- Asistente virtual de atención al cliente: el modelo empareja consultas de usuarios con respuestas predefinidas en una base de conocimiento, seleccionando la mejor candidata antes de devolver una respuesta.
- Clasificación de preguntas frecuentes: dado un conjunto de preguntas y respuestas, el modelo puntúa la relevancia de cada par y ayuda a seleccionar la respuesta adecuada.
- Recomendación de contenido: en un portal de noticias o artículos en japonés, el modelo reordena los contenidos candidatos según la consulta del usuario para personalizar la experiencia.
- Búsqueda en dispositivos locales: en una aplicación de escritorio o móvil, el modelo se ejecuta en CPU con ONNX Runtime para ofrecer búsqueda semántica sin conexión y sin costes de servidor.
- Filtrado de resultados en motores de búsqueda internos: mejorar la precisión de búsqueda en intranets o repositorios de documentación técnica en japonés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única medición de rendimiento documentada es una prueba de latencia realizada en Apple Silicon (CPU, int8, 10 pares): 128 tokens ≈ 63 ms y 192 tokens ≈ 106 ms.

## Requisitos de hardware

- VRAM estimada: no requiere VRAM; el modelo está diseñado para ejecutarse en CPU. El archivo ONNX cuantizado ocupa 37 MB.
- GPU recomendadas: no aplica; se recomienda CPU (por ejemplo, Apple Silicon, procesadores x86 modernos).
- Consumer GPU: no es necesario, pero si se desea acelerar con GPU, cualquier tarjeta con soporte ONNX Runtime (por ejemplo, RTX 4090) podría usarse, aunque el modelo es demasiado pequeño para que merezca la pena.
- Opciones de despliegue: ONNX Runtime (Python, Node.js), transformers.js, y cualquier runtime compatible con ONNX.
- Latencia y throughput: 63 ms para 128 tokens y 106 ms para 192 tokens (10 pares, CPU Apple Silicon, int8).

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos. La única referencia disponible es el modelo original sin cuantizar, como se muestra en la tabla:

| Modelo | Formato | Tamaño | Cuantización | Licencia |
|---|---|---|---|---|
| hotchpotch/japanese-reranker-xsmall-v2 | Safetensors/PyTorch | 147 MB | FP32 (original) | MIT |
| maccotaro0/japanese-reranker-xsmall-v2-onnx | ONNX | 37 MB | int8 dinámica | MIT |

## Limitaciones y advertencias

- El modelo es exclusivamente un re-ranker; no puede generar texto ni mantener conversaciones.
- Solo soporta japonés; no se ha evaluado su rendimiento en otros idiomas.
- La cuantización int8 dinámica puede provocar una ligera pérdida de precisión en comparación con los pesos originales en FP32.
- No se han publicado evaluaciones formales de sesgos o robustez. Al ser un modelo de clasificación, el riesgo de alucinación no aplica, pero la puntuación de relevancia puede verse afectada por sesgos en los datos de entrenamiento.
- La licencia MIT permite uso comercial, pero es necesario conservar la atribución al autor original (hotchpotch).
- El contexto máximo no está documentado; es necesario validar el comportamiento con pasajes largos antes de usarlo en producción.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/maccotaro0/japanese-reranker-xsmall-v2-onnx
- Modelo original: https://huggingface.co/hotchpotch/japanese-reranker-xsmall-v2
- Repositorio del autor (exista personal): https://github.com/exista
- Entrada de catálogo en GitHub: https://github.com/vaibhav06062005-ctrl/ai-model-hotchpotch-japanese-reranker-xsmall-v2
