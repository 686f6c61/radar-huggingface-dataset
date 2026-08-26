# inferencerlabs/Qwen3.8-Flash-Next-MLX-Q9

## Resumen

El modelo **inferencerlabs/Qwen3.8-Flash-Next-MLX-Q9** es una cuantización en formato MLX del modelo **Qwen3.8-Flash-Next** desarrollado por Qwen (Alibaba). Se trata de una vista previa de la arquitectura Qwen4, presentada como un modelo de lenguaje multimodal (imagen y texto) con arquitectura de mezcla de expertos (MoE) híbrida. El modelo base tiene 125 mil millones de parámetros en total, con 6 mil millones activos por token, más 51 mil millones de parámetros adicionales dedicados a embeddings N-gram. Esta versión cuantizada a 9 bits (Q9) ha sido generada por el usuario *inferencerlabs* con una versión modificada de MLX, orientada a ejecutarse en hardware Apple Silicon (probada en un M3 Ultra). La cuantización Q9 presenta una pérdida de precisión mínima respecto al modelo base, con una perplexidad idéntica (1.20312) y una precisión de token del 97.8%.

La relevancia de este modelo radica en que permite ejecutar un modelo de gran tamaño (125B MoE) en sistemas con memoria unificada de gran capacidad, como los Mac con chip M3 Ultra, gracias a la cuantización MLX. Aunque el modelo base es multimodal y admite entradas de imagen y texto, esta versión cuantizada está pensada para inferencia local eficiente. Su fecha de creación (agosto de 2026) indica que se trata de una tecnología muy reciente, aún en fase de vista previa. La licencia no está especificada, lo que requiere cautela para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido (GDN + QSA) con embeddings N-gram (Qwen4 preview) |
| Parámetros totales | 125 000 millones (más 51 000 millones de embeddings N-gram) |
| Parámetros activos | 6 000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q3.5, Q4.5, Q5.5, Q6.5, Q8.5, Q9 (este modelo usa Q9) |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-Flash-Next** introduce una arquitectura híbrida que combina dos mecanismos de atención: **GDN (Grouped Dense Network)** y **QSA (Query-based Sparse Attention)**. Además, se aplican mejoras sistemáticas en los componentes de residual, embedding y optimización, con el objetivo de mejorar la capacidad del modelo y a la vez reducir el coste computacional y aumentar la estabilidad del entrenamiento. El modelo es una vista previa de la arquitectura Qwen4, y se compone de un modelo principal de 125B parámetros con 6B activos por token, complementado por 51B parámetros de embeddings N-gram que se añaden al procesamiento. No se dispone de información pública sobre el conjunto de datos de entrenamiento ni sobre el proceso de alineación (RLHF, DPO, etc.) en la documentación proporcionada. La cuantización Q9 se realizó con una versión modificada de MLX, y las métricas de cuantización muestran una pérdida casi nula respecto al modelo base (perplexity idéntica de 1.20312, precisión de token del 97.8% frente al 100% del base).

## Capacidades

- **Multimodal**: el pipeline es `image-text-to-text`, por lo que el modelo puede procesar imágenes y texto para generar respuestas textuales.
- **Generación de texto**: como modelo MoE, es capaz de generar texto coherente y contextualizado en inglés.
- **Razonamiento y conocimiento**: al ser un modelo de 125B parámetros, se espera un alto rendimiento en tareas de razonamiento, conocimiento general y comprensión lectora (aunque no hay benchmarks publicados en la información disponible).
- **Generación de código**: dado su tamaño y arquitectura, es probable que tenga capacidades de programación, pero no se ha confirmado explícitamente.
- **Procesamiento de imágenes**: puede interpretar imágenes y responder preguntas sobre ellas, como parte de su modalidad multimodal.
- **Soporte de herramientas**: no se menciona explícitamente, pero es plausible que el modelo base lo incluya; no hay confirmación en los datos proporcionados.
- **Idiomas**: el modelo está marcado como inglés (`en`) en la model card.

## Casos de uso

- **Análisis de documentos con imágenes**: el modelo puede extraer información de imágenes y documentos escaneados, generando resúmenes o respondiendo preguntas sobre el contenido visual y textual.
- **Asistencia en atención al cliente**: con su capacidad multimodal, puede gestionar consultas que incluyan capturas de pantalla, diagramas o fotografías, además de conversaciones de texto.
- **Generación de código asistida**: aunque no está confirmado, un modelo de este tamaño suele ser útil para tareas de programación, como autocompletado, revisión de código o generación de funciones.
- **Creación de contenido multimodal**: puede generar descripciones de imágenes, transcribir contenido visual a texto, o crear textos creativos basados en estímulos visuales.
- **Investigación académica**: para experimentos de procesamiento de lenguaje natural y visión por computador, especialmente en entornos con recursos de hardware de gran memoria.
- **Sistemas de búsqueda semántica**: dado su tamaño, puede usarse para tareas de recuperación de información con contexto largo (aunque no se conoce la longitud exacta de contexto).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica de rendimiento es la tabla de cuantización incluida en la model card, que mide la pérdida de calidad respecto al modelo base:

| Cuantización (bpw) | Perplexity | Token Accuracy | Missed Divergence |
|---|---|---|---|
| Q3.5 | 168.0 | 43.45% | 72.57% |
| Q4.5 | 1.33593 | 91.65% | 17.28% |
| Q5.5 | 1.23437 | 95.05% | 17.28% |
| Q6.5 | 1.21875 | 96.65% | 12.03% |
| Q8.5 | 1.21875 | 97.65% | 9.92% |
| **Q9** | **1.20312** | **97.80%** | **9.60%** |
| Base | 1.20312 | 100% | 0.000% |

Estos valores indican que la cuantización Q9 mantiene la perplexidad exacta del modelo base y una precisión de token del 97.8%, con una divergencia de solo 9.6%. No se proporcionan resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM / memoria**: el modelo requiere aproximadamente 189.2 GiB de memoria unificada, según la prueba realizada en un M3 Ultra con la aplicación Inferencer v2.3.4.
- **GPU compatible**: fue probado en un Apple M3 Ultra (chip con memoria unificada). No cabe en GPUs de consumo (por ejemplo, RTX 4090 con 24 GB de VRAM) ni en GPUs profesionales de un solo socket como A100 (80 GB) sin múltiples dispositivos.
- **Opciones de despliegue**: dado que es un formato MLX, se puede ejecutar con la librería MLX de Apple, y a través de aplicaciones como Inferencer. No se mencionan opciones como vLLM u Ollama, pero al ser MLX, está orientado a ecosistema Apple.
- **Latencia y rendimiento**: en el M3 Pro se midió una velocidad de generación de ~17.1 tokens por segundo, con un uso de memoria de 189.2 GiB. No hay datos de throughput para otros entornos.

## Comparativa con modelos similares

No hay información suficiente para realizar una comparativa con otros modelos de la misma categoría. El blog *explainx.ai* menciona una comparación con **Qwen3.8-27B**, pero no se proporcionan datos concretos de rendimiento o parámetros. Por tanto, se indica **no disponible**.

## Limitaciones y advertencias

- **Cuantización**: aunque la Q9 es casi lossless, las cuantizaciones inferiores (Q3.5, Q4.5, etc.) muestran una pérdida significativa de precisión (perplexity de 168 en Q3.5), lo que indica que no todas las versiones cuantizadas son fiables.
- **Licencia**: la licencia del modelo no está especificada, lo que impide conocer las restricciones para uso comercial o modificaciones.
- **Idioma**: el modelo está marcado como `en` (inglés) y no se indica soporte para otros idiomas.
- **Hardware**: el modelo requiere una cantidad de memoria muy alta (cerca de 190 GB), lo que lo limita a entornos con hardware de gama alta o Mac con mucha memoria unificada.
- **Riesgo de alucinación**: como todos los modelos generativos, puede producir contenido falso o inexacto, y la cuantización puede aumentar el riesgo en niveles bajos.
- **Modelo en fase de vista previa**: es una versión de vista previa (preview) de Qwen4, por lo que puede tener errores o comportamientos inesperados.
- **Sin datos de benchmarks**: no hay información sobre rendimiento en tareas estándar, por lo que no se puede evaluar su calidad en comparación con otros modelos.

## Enlaces

- Modelo en Hugging Face: [inferencerlabs/Qwen3.8-Flash-Next-MLX-Q9](https://huggingface.co/inferencerlabs/Qwen3.8-Flash-Next-MLX-Q9)
- Modelo base: [Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- Repositorio oficial de Qwen3.8-Flash-Next: [GitHub QwenLM/Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next)
- Blog de Qwen sobre Qwen3.8-Flash-Next: [https://qwen.ai/blog?id=qwen3.8-flash-next](https://qwen.ai/blog?id=qwen3.8-flash-next)
- Receta vLLM para Qwen3.8-Flash-Next: [https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next](https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next)
- Blog de explainx.ai sobre el lanzamiento: [https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026](https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026)
- Repositorio de la serie Qwen3.8: [GitHub QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
