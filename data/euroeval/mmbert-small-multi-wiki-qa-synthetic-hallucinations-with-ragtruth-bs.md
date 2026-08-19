# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-bs

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-bs` es un modelo de clasificación de tokens (token-classification) desarrollado por el equipo EuroEval, especializado en la detección de alucinaciones en respuestas generadas por sistemas de pregunta-respuesta con recuperación aumentada (RAG). Su nombre indica que fue entrenado sobre un conjunto de datos sintético de preguntas y respuestas basado en Wikipedia, con anotaciones de veracidad (truth) y casos de alucinación, lo que lo convierte en una herramienta potencial para auditar y filtrar salidas de modelos generativos en pipelines de RAG.

Con 140.642.306 parámetros, se trata de un modelo de tamaño pequeño, adecuado para entornos con recursos limitados. Los tags de HuggingFace sugieren que se basa en la arquitectura ModernBERT, una evolución eficiente de BERT, aunque la model card oficial no aporta confirmación explícita de la arquitectura, el entrenamiento o los datos utilizados. El modelo se distribuye en formato safetensors y está pensado para usarse con la librería transformers.

La relevancia de este modelo radica en la creciente necesidad de verificar la factualidad de las respuestas generadas por LLMs, especialmente en aplicaciones empresariales donde la alucinación puede tener consecuencias graves. Su tamaño compacto permite integrarlo en flujos de inferencia ligeros, aunque la ausencia de documentación detallada y de benchmarks publicados limita su evaluación objetiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags sugieren ModernBERT, sin confirmación oficial) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin especificar precisión) |
| Idiomas soportados | no disponible (probablemente multilingüe por el nombre "multi", sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El tag `modernbert` en HuggingFace sugiere que se basa en ModernBERT, una arquitectura transformer optimizada para eficiencia en inferencia y entrenamiento, con atención bidireccional y mejoras en el manejo de secuencias largas. Sin embargo, al no existir una model card completa ni referencias a papers, esta afirmación no puede confirmarse.

El nombre del modelo indica que fue entrenado sobre un dataset sintético de preguntas y respuestas de Wikipedia, con anotaciones de alucinaciones y veracidad (RAG truth). No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, el procedimiento de entrenamiento (fine-tuning, RLHF, etc.) ni las hiperparametros utilizadas. La model card oficial está prácticamente vacía, con todos los campos marcados como "[More Information Needed]".

## Capacidades

- Clasificación de tokens para detectar segmentos alucinados o factualmente incorrectos en respuestas generadas.
- Posible integración en pipelines de verificación de RAG, marcando qué partes de una respuesta son fiables.
- Tamaño compacto (140M parámetros) que permite inferencia en hardware modesto.
- Compatible con la librería transformers y el pipeline de token-classification.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Auditoría de respuestas en sistemas RAG: el modelo puede procesar la salida de un LLM y marcar tokens que probablemente sean alucinaciones, permitiendo a un sistema downstream rechazar o corregir la respuesta antes de mostrarla al usuario final.
- Filtrado de contenidos en asistentes virtuales: integrarlo como capa de verificación factual en chatbots empresariales para reducir la propagación de información falsa.
- Evaluación de calidad de datasets: utilizar el modelo para etiquetar automáticamente muestras de QA sintéticas o reales y medir la tasa de alucinación de diferentes generadores.
- Monitorización de modelos generativos en producción: aplicar el clasificador a respuestas generadas en tiempo real para generar alertas cuando se detecten inconsistencias.
- Investigación en detección de alucinaciones: servir como baseline para comparar técnicas más avanzadas de verificación factual.
- Preprocesamiento de datos para fine-tuning: identificar y eliminar respuestas alucinadas de datasets de entrenamiento antes de ajustar un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como F1, precisión, recall o exactitud en tareas de detección de alucinaciones, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 140M parámetros, en fp32 se necesitan aproximadamente 562 MB de memoria, y en fp16 unos 281 MB. Con cuantización de 8 bits, la huella se reduce a unos 140 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluyendo tarjetas consumer como NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU con razonable latencia para tareas de clasificación de tokens.
- Opciones de despliegue: al ser un modelo transformers estándar, puede servirse con vLLM, Hugging Face Inference Endpoints, o ejecutarse directamente con la API de transformers. No se ha confirmado soporte para llama.cpp u Ollama, pero al ser un modelo BERT-like, podría convertirse a ONNX para optimización.
- Latencia y throughput: no hay datos oficiales. En una GPU moderna, la inferencia sobre secuencias de 512 tokens debería completarse en decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Modelos alternativos para detección de alucinaciones en RAG incluyen clasificadores basados en DeBERTa o RoBERTa, pero no hay datos públicos de rendimiento de este modelo frente a ellos. La comparativa queda pendiente de la publicación de benchmarks oficiales.

## Limitaciones y advertencias

- Sesgos desconocidos: al no documentarse la composición del dataset de entrenamiento, no se puede evaluar si el modelo presenta sesgos hacia ciertos dominios, idiomas o estilos de escritura.
- Riesgo de alucinación en la clasificación: como cualquier modelo de ML, puede cometer errores, marcando como factual contenido incorrecto o viceversa. No debe usarse como única fuente de verificación en sistemas críticos.
- Limitaciones de idioma: el nombre sugiere multilingüismo, pero no hay confirmación de qué idiomas cubre ni de su calidad en cada uno.
- Licencia no especificada: el uso comercial y la redistribución están sujetos a una licencia desconocida, lo que puede ser un obstáculo para adopción empresarial.
- Documentación insuficiente: la model card no detalla el proceso de entrenamiento, los hiperparámetros, los datos exactos ni las métricas de evaluación, lo que dificulta la reproducibilidad y la confianza en el modelo.

## Enlaces

- [HuggingFace - EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-bs](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-bs)
