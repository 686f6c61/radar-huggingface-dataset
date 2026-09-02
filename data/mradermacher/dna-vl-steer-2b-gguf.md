# mradermacher/DNA-VL-STEER-2B-GGUF

## Resumen

DNA-VL-STEER-2B-GGUF es una versión cuantizada en formato GGUF del modelo DNA-VL-STEER-2B, desarrollado originalmente por dnotitia y cuantizado por mradermacher. Se trata de un modelo multimodal de embeddings (texto e imagen) basado en la arquitectura Qwen, con aproximadamente 1.720 millones de parámetros (1,72B) y licencia Apache 2.0. El modelo está diseñado para tareas de representación vectorial multimodal y soporta 36 idiomas, incluyendo español, inglés, francés, alemán, chino, japonés, entre otros.

La relevancia de esta versión GGUF radica en su capacidad de despliegue en entornos con recursos limitados, ya que las cuantizaciones reducen significativamente el tamaño del modelo (desde 3,5 GB en f16 hasta 0,9 GB en Q2_K) sin requerir hardware especializado. Esto lo hace accesible para desarrolladores que necesitan embeddings multimodales en producción con GPUs de consumo o incluso CPU. Al ser una cuantización estática, no incluye optimizaciones adicionales como imatrix, pero ofrece una amplia gama de niveles de precisión para equilibrar calidad y rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basada en Qwen, según tags) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, fr, de, es, zh, ko, bn, fil, hi, sw, te, ja, ru, ar, vi, tr, th, el, fa, fi, id, he, pl, uk, nl, it, pt, cs, sv, hu, ro, hr, da, no, mi, quz |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base DNA-VL-STEER-2B. Según los tags de HuggingFace, está basado en la familia Qwen y es un modelo multimodal de embeddings, lo que sugiere una arquitectura transformer con codificador de visión y texto. Sin embargo, no se especifican detalles como el número de capas, la dimensión de los embeddings o el mecanismo de atención.

En cuanto al entrenamiento, no hay datos públicos sobre el dataset utilizado, el número de tokens de entrenamiento o si se aplicaron técnicas como RLHF o DPO. La cuantización realizada por mradermacher es estática, es decir, convierte los pesos del modelo original a formatos de menor precisión sin recalibración adicional (sin imatrix). Esto implica que la calidad de las cuantizaciones depende de la distribución original de los pesos.

## Capacidades

- Embeddings multimodales: genera representaciones vectoriales tanto de texto como de imágenes, lo que permite comparar y relacionar contenido de diferentes modalidades.
- Soporte multilingüe: cubre 36 idiomas, incluyendo lenguas de baja representación como maorí (mi) y quechua (quz), lo que facilita aplicaciones globales.
- Integración con sentence-transformers: compatible con la librería sentence-transformers, lo que simplifica su uso en pipelines de búsqueda semántica y similitud.
- Posible generación de texto: al ser un modelo basado en Qwen, podría tener capacidades de generación, aunque no está confirmado en la documentación disponible.
- Formato GGUF: permite ejecución eficiente en CPU y GPU mediante herramientas como llama.cpp, Ollama o LM Studio.

## Casos de uso

- Búsqueda semántica multimodal: permite buscar imágenes a partir de descripciones textuales o viceversa, útil en motores de búsqueda de contenido visual o bases de datos de productos.
- Recuperación de información multilingüe: al soportar 36 idiomas, puede indexar y recuperar documentos en múltiples lenguas, ideal para sistemas de gestión documental internacionales.
- Clasificación de imágenes y texto: los embeddings generados pueden alimentar clasificadores simples (regresión logística, SVM) para tareas como moderación de contenido o categorización de productos.
- Sistemas de recomendación: al representar ítems (texto e imagen) en un espacio vectorial común, se pueden calcular similitudes para recomendar productos, artículos o medios.
- Deduplicación de contenido: comparar embeddings para detectar duplicados o contenido casi duplicado en grandes colecciones de datos mixtos (texto e imagen).
- Análisis de sentimiento multimodal: combinar señales de texto e imagen para tareas de análisis de opinión en redes sociales o reseñas de productos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo. Se recomienda evaluar el modelo en el caso de uso específico antes de su despliegue en producción.

## Requisitos de hardware

- VRAM estimada: según la cuantización, el modelo ocupa entre 0,9 GB (Q2_K) y 3,5 GB (f16). Para inferencia con contexto adicional, se recomienda al menos 2-4 GB de VRAM para las cuantizaciones más bajas y 6-8 GB para las más altas.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050) puede ejecutar las cuantizaciones Q4_K_M o inferiores. Para f16 o Q8_0, se recomienda una RTX 3060 o superior.
- Compatibilidad con consumer GPU: sí, todas las cuantizaciones caben en GPUs de consumo actuales. Incluso en CPU, con llama.cpp, se puede ejecutar en equipos con 8 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, o mediante la integración con sentence-transformers usando el backend de GGUF.
- Latencia y throughput: no se dispone de datos específicos. En una GPU moderna (RTX 4090), se espera una latencia de decenas de milisegundos para generar un embedding, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos de embeddings multimodales de tamaño similar. Se recomienda consultar benchmarks públicos de modelos como CLIP, SigLIP o Qwen2-VL para establecer comparaciones, pero no hay datos específicos de DNA-VL-STEER-2B en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: las versiones de menor precisión (Q2_K, Q3_K) pueden degradar significativamente la calidad de los embeddings, afectando tareas de similitud y recuperación.
- Sin información sobre sesgos: no se han publicado estudios sobre sesgos de género, raza o culturales. Como modelo multilingüe, puede presentar sesgos en idiomas con menos representación.
- Riesgo de alucinación en generación: si se utiliza para generación de texto (no confirmado), podría producir contenido inexacto, especialmente en idiomas de baja representación.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto soportada, lo que puede afectar a tareas que requieren procesar documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener la atribución y no utilizar marcas registradas. No hay restricciones adicionales conocidas.
- Cuantización estática: al no usar imatrix, las cuantizaciones de baja precisión pueden tener una calidad inferior a las versiones con calibración dinámica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DNA-VL-STEER-2B-GGUF
- Modelo base: https://huggingface.co/dnotitia/DNA-VL-STEER-2B
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
