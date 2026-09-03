# AdarshSingh7647/Eklav-4B-Reranker

## Resumen

Eklav-4B-Reranker es un modelo de reranking de pasajes desarrollado por AdarshSingh7647, construido a partir del modelo base Qwen/Qwen3-4B. Su principal innovación es el método de entrenamiento denominado Eklav, que consiste en una destilación de cadena de pensamiento (CoT) condicionada a pistas parciales del razonamiento del profesor. En lugar de imitar la traza completa de razonamiento, el estudiante recibe una traza parcial (con la parte final de la respuesta eliminada) y debe continuar el razonamiento por sí mismo para producir la respuesta. Este enfoque reduce los FLOPs de entrenamiento en un 31% respecto a la destilación CoT estándar, manteniendo o mejorando el rendimiento en tareas de reranking.

El modelo está diseñado específicamente para la tarea de reranking de pasajes en sistemas de recuperación aumentada por generación (RAG) y búsqueda semántica. Con 4.022 millones de parámetros, se posiciona como una opción de tamaño medio que puede ejecutarse en hardware de consumo. Los resultados reportados en el benchmark BRIGHT muestran una mejora del 8% en nDCG@10 (promedio de 12 dominios) frente a la destilación CoT completa con el mismo modelo base y datos de entrenamiento, alcanzando un promedio de 31.5 en nDCG@10.

La relevancia actual de este modelo radica en la creciente demanda de rerankers eficientes y precisos para mejorar la calidad de los resultados en pipelines de RAG, donde los recuperadores iniciales suelen devolver resultados ruidosos que necesitan una segunda etapa de refinamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-4B) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B, no especificada) |
| Tipos de cuantizacion | no disponible (checkpoint en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (merged bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3-4B, un modelo de lenguaje de 4.000 millones de parámetros. No se especifican detalles adicionales sobre la arquitectura interna, como el número de capas o cabezas de atención, ya que se heredan del modelo base.

El entrenamiento utiliza el método Eklav, una variante de destilación de cadena de pensamiento (CoT) condicionada a pistas. En lugar de entrenar al modelo para reproducir la traza completa de razonamiento del profesor, se le presenta una traza parcial (con la parte final de la respuesta eliminada) y se le pide que continúe el razonamiento y genere la respuesta final. Esto reduce los FLOPs de entrenamiento en un 31% en comparación con la destilación CoT estándar, manteniendo el mismo modelo base y los mismos datos de entrenamiento. El resultado es un modelo que aprende a razonar de forma más autónoma, en lugar de memorizar la salida del profesor.

El checkpoint se publica como un modelo fusionado (merged) en formato bf16, listo para usar con la librería transformers.

## Capacidades

- Reranking de pasajes: el modelo está especializado en ordenar documentos o pasajes según su relevancia para una consulta dada, tarea fundamental en sistemas RAG.
- Razonamiento de cadena de pensamiento: gracias al entrenamiento con destilación CoT, el modelo puede generar razonamientos intermedios antes de emitir una puntuación o decisión de relevancia.
- Generación de texto: al ser un modelo de lenguaje causal, puede generar texto libre, aunque su uso principal es el reranking.
- Integración con pipelines de recuperación: puede utilizarse como segunda etapa tras un recuperador inicial (por ejemplo, BM25 o embeddings) para refinar los resultados.
- Compatibilidad con transformers: se carga fácilmente con `AutoModelForCausalLM` y `AutoTokenizer`, lo que facilita su integración en entornos Python.
- Multilingüismo: no se especifican idiomas soportados, pero al derivar de Qwen3-4B, es probable que herede las capacidades multilingües de este (aunque no se confirma).

## Casos de uso

- Mejora de resultados en sistemas RAG: el modelo puede utilizarse como reranker tras un recuperador inicial para reordenar los pasajes más relevantes antes de pasarlos al generador. Su capacidad de razonamiento permite capturar matices semánticos que los recuperadores basados en embeddings pueden pasar por alto.
- Búsqueda semántica en dominios específicos: gracias a su entrenamiento en BRIGHT (que cubre 12 dominios), puede adaptarse a tareas de búsqueda en áreas como finanzas, medicina o legislación, donde la relevancia requiere comprensión profunda.
- Filtrado de resultados en motores de búsqueda internos: empresas con grandes volúmenes de documentos pueden emplearlo para refinar los resultados de búsqueda, reduciendo el ruido y mejorando la precisión.
- Sistemas de preguntas y respuestas sobre documentos: en pipelines de QA extractiva o generativa, el reranker puede seleccionar los pasajes más prometedores antes de la generación de la respuesta, mejorando la exactitud final.
- Análisis de relevancia en investigación académica: investigadores que necesiten ordenar artículos o referencias según su pertinencia a una consulta pueden usar el modelo como herramienta de apoyo.
- Asistentes virtuales con recuperación de conocimiento: el modelo puede integrarse en asistentes que necesiten consultar bases de conocimiento extensas, priorizando la información más relevante para responder al usuario.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el benchmark BRIGHT (nDCG@10, promedio de 12 dominios):

| Metrica | Valor |
|---|---|
| BRIGHT promedio (nDCG@10) | 31.5 |
| Mejora vs. destilación CoT completa | +8% |
| Reducción de FLOPs de entrenamiento | -31% |

No se proporcionan resultados en otros benchmarks como MMLU, HumanEval o GSM8K. Tampoco se incluyen comparaciones con otros modelos de reranking en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 4.000 millones de parámetros en bf16, el checkpoint ocupa aproximadamente 8 GB (el tamaño del repositorio es de 8.1 GB). Para inferencia, se recomienda al menos 10-12 GB de VRAM para cargar el modelo en bf16 sin cuantización.
- GPU recomendadas: una GPU con 12 GB o más de VRAM, como la RTX 3060, RTX 4070, RTX 4090, o GPUs de datacenter como A10, A100 o H100. En GPUs con menos VRAM, sería necesario aplicar cuantización (no especificada en la información).
- Compatibilidad con hardware de consumo: sí, es posible ejecutarlo en GPUs de consumo con 12 GB o más, aunque la velocidad dependerá de la generación de la GPU.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference) o directamente con la librería transformers. También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se proporcionan datos específicos. Para un modelo de 4B en bf16, se puede esperar una latencia de decenas de milisegundos por consulta en GPUs modernas, pero esto depende del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de reranking en la documentación proporcionada. Los rerankers más comunes en el ecosistema (como BGE-reranker, Cohere Rerank o modelos basados en T5) no aparecen en los datos disponibles, por lo que no es posible realizar una comparación objetiva con cifras concretas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar razonamientos incorrectos o alucinados, especialmente en dominios fuera de sus datos de entrenamiento. No se han publicado evaluaciones de sesgos.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto, pero al derivar de Qwen3-4B, es probable que herede sus límites (típicamente 32K tokens, aunque no confirmado). Para tareas de reranking, esto suele ser suficiente.
- Idiomas: no se especifican los idiomas soportados. Aunque Qwen3-4B es multilingüe, no hay garantía de que el fine-tuning haya preservado todas las capacidades.
- Licencia: la licencia no está disponible en la información proporcionada. Esto supone un riesgo para uso comercial, ya que no se conocen las restricciones.
- Datos de entrenamiento: no se detalla la composición del dataset de entrenamiento ni su procedencia, lo que dificulta evaluar posibles sesgos o limitaciones de dominio.
- Rendimiento en producción: al ser un modelo relativamente nuevo (creado en agosto de 2026) con pocas descargas (7), su robustez en entornos de producción no está ampliamente validada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/AdarshSingh7647/Eklav-4B-Reranker)
- [Modelo base Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- No se proporcionan enlaces a papers, blogs o repositorios adicionales en la información disponible.
