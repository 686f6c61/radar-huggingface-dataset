# AdarshSingh7647/Eklav-4B-Reranker-CotGen

## Resumen

Eklav-4B-Reranker-CotGen es un modelo de lenguaje de 4.022 millones de parámetros desarrollado por AdarshSingh7647, concebido como un baseline dentro del proyecto Eklav. El objetivo de Eklav es entrenar a un modelo para que continúe el razonamiento de un profesor a mitad de camino, en lugar de imitar el razonamiento completo de extremo a extremo. En este caso concreto, el modelo se presenta como la variante de destilación de cadena de pensamiento (CoT) estándar con traza completa, utilizada como referencia para medir las mejoras del método Eklav a esta escala.

El modelo parte de Qwen/Qwen3-4B como base y está ajustado para la tarea de reranking de pasajes, evaluado en los conjuntos de datos BRIGHT y NevIR. Aunque su pipeline declarado es text-generation, su propósito principal es la generación de razonamiento para reranking, obteniendo una puntuación media de nDCG@10 de 29.3 en BRIGHT. Se distribuye como un checkpoint fusionado en bf16, con un tamaño de repositorio de 8.1 GB, y está pensado para ser cargado con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3-4B) |
| Parametros totales | 4.022.468.096 (4.02B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (formato original del checkpoint) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (checkpoint fusionado bf16) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B, un transformer decoder-only con atención causal estándar. No se especifican detalles adicionales sobre la configuración interna (número de capas, cabezas de atención, etc.) en la documentación proporcionada. El entrenamiento se realizó mediante destilación de cadena de pensamiento (CoT) con traza completa: el modelo se entrena para reproducir el razonamiento completo del profesor, incluyendo la respuesta final. Este es el baseline estándar de SFT (supervised fine-tuning) que se compara con el método Eklav, donde el estudiante solo ve una traza parcial y debe continuar el razonamiento por sí mismo.

Los datos de entrenamiento no están detallados en la información disponible, pero se indica que son los mismos que se usan para la variante Eklav, solo cambiando el objetivo de entrenamiento. El checkpoint se publica fusionado en bf16, listo para inferencia con transformers.

## Capacidades

- Generación de texto con razonamiento encadenado (CoT) para tareas de reranking de pasajes.
- Reranking de documentos: dado un query y un conjunto de pasajes, el modelo genera una puntuación o un orden de relevancia basado en su razonamiento.
- Soporte de conversación (etiquetado como conversational), aunque no se detalla su uso específico.
- Compatible con text-generation-inference y endpoints, según las etiquetas del repositorio.
- No se menciona soporte explícito de tool calling, agentes, visión o audio.

## Casos de uso

- Reranking en motores de búsqueda: el modelo puede reordenar los resultados iniciales de un sistema de recuperación (por ejemplo, BM25 o embeddings) para mejorar la precisión de la búsqueda, usando su razonamiento para evaluar la relevancia de cada pasaje.
- Mejora de pipelines RAG (Retrieval-Augmented Generation): integrar el modelo como reranker entre la recuperación y la generación, filtrando pasajes irrelevantes antes de pasarlos al generador.
- Evaluación de relevancia en dominios específicos: gracias a su entrenamiento en BRIGHT, puede adaptarse a dominios como finanzas, ciencia o medicina, aunque no se especifican los dominios concretos.
- Generación de explicaciones de relevancia: al ser un modelo generativo, puede producir justificaciones textuales de por qué un pasaje es relevante para una consulta, útil para sistemas de búsqueda explicables.
- Experimentación en destilación de razonamiento: como baseline de CoT estándar, sirve para comparar metodologías de destilación (Eklav vs. traza completa) en investigación académica.
- Prototipado de sistemas de búsqueda conversacional: al soportar generación de texto y conversación, puede emplearse en asistentes que necesiten razonar sobre documentos recuperados.

## Benchmarks y rendimiento

El único resultado publicado en la model card es la media de nDCG@10 en el conjunto BRIGHT, con una única ejecución de evaluación por dominio. No se proporcionan resultados desglosados por dominio ni comparaciones con otros modelos.

| Benchmark | Metrica | Resultado |
|---|---|---|
| BRIGHT | nDCG@10 (media) | 29.3 |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB para el checkpoint en bf16 (4.02B parámetros × 2 bytes), más overhead de activaciones y KV cache, por lo que se recomienda al menos 10-12 GB de VRAM para una ejecución cómoda.
- GPU recomendadas: tarjetas consumer con 12 GB o más, como RTX 3060 12GB, RTX 4070, RTX 3090, RTX 4090. También puede ejecutarse en GPUs profesionales como A10, A100 o H100.
- Cabe en GPUs consumer de gama media-alta, siempre que tengan suficiente VRAM.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, TGI (text-generation-inference), llama.cpp (si se convierte a GGUF) u Ollama (con conversión previa). También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se proporcionan datos oficiales. En una RTX 4090, se espera una generación de decenas de tokens por segundo, pero depende de la longitud de contexto y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de reranking (por ejemplo, BGE-reranker-v2-m3, Cohere Rerank, o modelos de la familia Qwen adaptados a reranking). El modelo no publica resultados comparativos en BRIGHT frente a alternativas, y su licencia y disponibilidad no están claras. Por tanto, la comparativa se limita a indicar que comparte base con Qwen3-4B, pero no se pueden extraer conclusiones cuantitativas.

## Limitaciones y advertencias

- No se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar con el autor antes de usarlo en producción.
- El modelo es un baseline experimental con muy pocas descargas (9) y sin valoraciones, lo que indica que no ha sido ampliamente validado por la comunidad.
- Solo se ha evaluado en BRIGHT con una métrica (nDCG@10) y una única ejecución; no hay evidencia de rendimiento en otros dominios o tareas.
- No se documentan sesgos, riesgos de alucinación o limitaciones idiomáticas. Al ser un fine-tune de Qwen3-4B, podría heredar sesgos del modelo base, pero no hay información al respecto.
- La longitud de contexto no está especificada; si se usa con pasajes largos, es necesario verificar la ventana máxima soportada por el modelo base.
- El formato de pesos es safetensors en bf16, lo que limita su uso en hardware sin soporte de bf16 (por ejemplo, GPUs antiguas) sin conversión previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AdarshSingh7647/Eklav-4B-Reranker-CotGen
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Imagen de resultados BRIGHT (en el repositorio): ./eklav_4b_bright_domains.jpg
