# mlboydaisuke/bge-reranker-v2-m3-ExecuTorch

## Resumen

El modelo `mlboydaisuke/bge-reranker-v2-m3-ExecuTorch` es una conversión del cross-encoder de reranking BAAI/bge-reranker-v2-m3 al formato ExecuTorch, diseñada para ejecución en dispositivo (on-device). Desarrollado por el usuario mlboydaisuke, este modelo permite integrar una etapa de reranking de alta calidad en sistemas de recuperación de información que se ejecutan localmente, sin necesidad de conexión a servidores. El modelo original, creado por BAAI, se basa en XLM-RoBERTa con 568 millones de parámetros y un vocabulario de 250 000 tokens, lo que le otorga capacidades multilingües de más de 100 idiomas. La conversión a ExecuTorch incluye variantes fp32, fp16 y CoreML (para iOS), con un tamaño de contexto de 512 tokens y una salida de logit de relevancia por par consulta-documento. Su relevancia actual radica en la creciente demanda de soluciones de búsqueda y RAG que operen íntegramente en el dispositivo, garantizando privacidad y baja latencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en XLM-RoBERTa (24 capas, hidden 1024) |
| Parámetros totales | 568 M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | fp32, fp16, CoreML (fp16); int8 dinámico no incluido |
| Idiomas soportados | Más de 100 (según el modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | ExecuTorch (.pte) con backend XNNPACK; variante CoreML para iOS |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de reranking: recibe como entrada una consulta y un documento concatenados (con tokens de separación) y produce un logit de relevancia. La arquitectura subyacente es XLM-RoBERTa, un transformer preentrenado multilingüe con 24 capas, dimensión oculta de 1024 y vocabulario de 250k subpalabras. El modelo original fue entrenado por BAAI con técnicas de aprendizaje contrastivo y ajuste fino en tareas de recuperación multilingüe, aunque la información disponible no detalla el proceso de entrenamiento específico. En esta conversión a ExecuTorch, el modelo se exporta a archivos `.pte` con backends XNNPACK y CoreML, preservando la arquitectura y los pesos originales. No se aplican técnicas adicionales como RLHF o DPO; el objetivo es únicamente la inferencia eficiente en hardware de bajo consumo.

## Capacidades

- **Reranking de pares consulta-documento**: dado un conjunto de candidatos recuperados por un modelo de embeddings, asigna una puntuación de relevancia a cada par, permitiendo reordenar los resultados.
- **Soporte multilingüe**: gracias al vocabulario de 250k tokens de XLM-RoBERTa, maneja consultas y documentos en más de 100 idiomas, como se demuestra en el ejemplo de la model card con una respuesta en japonés a una consulta en inglés.
- **Salida interpretable**: produce un logit (valor flotante) que puede transformarse en una probabilidad mediante la función sigmoide, sin alterar el orden de relevancia.
- **Integración con pipelines de recuperación**: se usa como segunda etapa tras un modelo de embeddings (por ejemplo, bge-embedding) para refinar los resultados.
- **Ejecución en dispositivo**: las variantes fp16 y CoreML permiten ejecutar el modelo en hardware móvil y de escritorio sin conexión, con tiempos de inferencia de alrededor de 64 ms en iOS (CoreML) y 215 ms en Mac arm64 (fp32).

## Casos de uso

- **Búsqueda semántica local**: en aplicaciones de escritorio o móviles que necesitan buscar en un corpus local (documentos personales, correos, notas) sin enviar datos a la nube. El modelo reordena los resultados de un índice de embeddings para mejorar la precisión.
- **Asistentes de recuperación aumentada (RAG) en el dispositivo**: para chatbots o asistentes que ejecutan un pipeline de RAG local, el reranker selecciona los pasajes más relevantes de una base de conocimiento antes de pasarlos al generador.
- **Clasificación de documentos por relevancia**: en sistemas de gestión documental, se puede usar para clasificar automáticamente correos o informes según su relación con una consulta específica.
- **Sistemas de recomendación de contenidos**: para recomendar artículos o recursos basados en una descripción del usuario, el modelo puede puntuar pares de consulta-documento y seleccionar los más adecuados.
- **Monitoreo de calidad de búsqueda**: como herramienta de validación para comparar el rendimiento de diferentes pipelines de recuperación, midiendo el orden de los resultados generados por el reranker.
- **Traducción y búsqueda multilingüe**: dado su soporte de más de 100 idiomas, puede utilizarse para buscar información en un idioma y obtener resultados en otro, útil en plataformas de conocimiento multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, GSM8K) en la información disponible. La model card proporciona datos de rendimiento de ejecución y error de precisión para las distintas variantes, que se presentan a continuación:

| Variante | Tamaño (MB) | Error de logit vs eager | Tiempo medio en Mac arm64 (ms) |
|---|---|---|---|
| fp32 | 2271.5 | 0.0000 | 215.2 |
| fp16 | 1136.3 | 0.0071 | 550.3 |
| Core ML (fp16) | 1137.2 | 0.0158 | 64.1 |

La referencia de tiempo se obtuvo en un Mac arm64, con un solo proceso y un par consulta-documento de 512 tokens. El error de logits se calculó sobre 6 pares reales, y todas las variantes reproducen el orden de clasificación de eager de forma exacta. No hay comparaciones con otros modelos en estos benchmarks.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende de la variante. La fp32 ocupa 2271 MB, la fp16 1136 MB y la CoreML 1137 MB. Para ejecución en CPU con XNNPACK se requiere memoria RAM suficiente para cargar el modelo y el contexto de 512 tokens.
- **GPU recomendadas**: no se requiere GPU para la inferencia; los backends XNNPACK y CoreML están optimizados para CPU (incluyendo aceleradores neuronales en móviles). En Mac arm64 se ejecuta en CPU con tiempos de 215 ms (fp32) y 64 ms (CoreML).
- **Compatibilidad con GPUs de consumo**: no aplica, ya que el formato ExecuTorch está diseñado para CPU y NPU móvil, no para GPUs de escritorio.
- **Opciones de despliegue**: los archivos `.pte` se ejecutan mediante el runtime de ExecuTorch, que se integra en aplicaciones móviles (iOS/Android) o de escritorio. Para iOS, la variante CoreML es la más eficiente.
- **Latencia y throughput**: en Mac arm64, la latencia media por par consulta-documento es de 215 ms (fp32) y 64 ms (CoreML). En un dispositivo móvil puede variar, pero se espera que sea similar o mejor con CoreML.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| bge-reranker-v2-m3 (original) | 568 M | 512 | 100+ | Apache-2.0 | PyTorch, ONNX, etc. | Modelo base, sin optimización para dispositivo |
| bge-reranker-v2-m3-ExecuTorch (este) | 568 M | 512 | 100+ | Apache-2.0 | ExecuTorch (.pte) | Optimizado para ejecución en dispositivo |
| ms-marco-MiniLM-L6 (reranker) | ~22 M | 512 | inglés | MIT | PyTorch | Mucho más ligero, pero solo inglés; rendimiento inferior en multilingüe |

La comparativa muestra que la versión ExecuTorch ofrece el mismo rendimiento del modelo original pero en un formato portable, mientras que la alternativa ligera (ms-marco-MiniLM-L6) es mucho más pequeña pero carece de capacidades multilingües, como se demuestra en el ejemplo de la model card donde el modelo multilingüe puntúa correctamente un documento japonés.

## Limitaciones y advertencias

- **Contexto limitado a 512 tokens**: el modelo solo puede procesar pares consulta-documento de hasta 512 tokens combinados. Para documentos más largos se debe truncar o dividir.
- **Riesgo de alucinación**: al ser un cross-encoder de clasificación, no genera texto; su salida es un valor de relevancia. El riesgo de alucinación no es aplicable, pero sí puede producir falsos positivos si los documentos son engañosamente similares.
- **Sesgos**: el modelo base XLM-RoBERTa puede heredar sesgos de los datos de entrenamiento, aunque no se han documentado específicamente en esta conversión.
- **Restricciones de licencia**: licencia Apache-2.0 permite uso comercial y modificación, pero se debe mantener el aviso de copyright y la licencia en las redistribuciones.
- **Diferencias de precisión**: la variante fp16 tiene un error de logits de 0.0071 y la CoreML de 0.0158 en comparación con fp32. Aunque el orden de ranking se mantiene, puede haber diferencias en valores absolutos que afecten a umbrales de corte.
- **Tamaño del modelo**: la versión fp32 ocupa 2.3 GB, lo que puede ser pesado para dispositivos con poca memoria. Se recomienda usar las variantes fp16 o CoreML para entornos móviles.
- **No se incluye int8**: la cuantización int8 dinámica no se distribuye por su tamaño mayor que la fp16 y mayor error de precisión, por lo que no está disponible.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mlboydaisuke/bge-reranker-v2-m3-ExecuTorch
- Modelo original: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Scripts de conversión: https://github.com/john-rocky/executorch-models
- Documentación de BGE Reranker v2 M3: https://toolseekai.com/en/models/baaibge-reranker-v2-m3
