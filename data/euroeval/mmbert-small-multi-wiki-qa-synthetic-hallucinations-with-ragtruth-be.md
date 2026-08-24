# EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-be

## Resumen

El modelo `EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-be` es un encoder basado en ModernBERT, fine-tuneado por el proyecto EuroEval para la detección de alucinaciones a nivel de token en respuestas generadas por sistemas de recuperación aumentada (RAG). El sufijo `-be` sugiere que está especializado en bielorruso, aunque la model card no lo confirma explícitamente. Se enmarca en el benchmark multilingüe MultiWikiQHalluA, que genera datos sintéticos de alucinaciones mediante un pipeline de dos etapas: primero se crean respuestas etiquetadas por token con el framework LettuceDetect, y después se fine-tunea el modelo para clasificar cada token como alucinado o fiel al contexto.

Con 140,6 millones de parámetros, es un modelo compacto orientado a tareas de clasificación de tokens, no a generación de texto. Su relevancia actual radica en la creciente necesidad de auditar y controlar la fiabilidad de los sistemas RAG, donde las alucinaciones son un problema crítico. Al ser un modelo pequeño, puede desplegarse en entornos con recursos limitados, lo que lo hace atractivo para pipelines de evaluación y monitorización en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (small) |
| Parametros totales | 140.642.306 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (el sufijo `-be` sugiere bielorruso, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ModernBERT, una evolución de BERT que incorpora mejoras como atención eficiente, mayor velocidad de inferencia y mejor manejo de secuencias largas en comparación con el BERT original. El fine-tuning se realiza sobre la tarea de clasificación de tokens, donde cada token de una respuesta generada se etiqueta como alucinado o no, en función de su consistencia con el contexto recuperado.

Según el paper asociado (arXiv:2605.02504v2), el entrenamiento utiliza datos sintéticos generados con el framework LettuceDetect, que produce respuestas con alucinaciones etiquetadas a nivel de token a partir de contextos de MultiWikiQA. No se especifican hiperparámetros, régimen de entrenamiento ni composición exacta del dataset en la información disponible. Tampoco se detalla si se aplicaron técnicas como RLHF o DPO; al ser un modelo de clasificación, es probable que se haya usado entrenamiento supervisado estándar.

## Capacidades

- Detección de alucinaciones a nivel de token en respuestas de preguntas y respuestas con contexto RAG.
- Clasificación binaria por token: indica si cada token es fiel al contexto o constituye una alucinación.
- Adecuado para evaluar la calidad de respuestas generadas por modelos de lenguaje en sistemas de recuperación.
- Al ser un encoder, no genera texto; su salida es una secuencia de etiquetas por token.
- Capacidad multilingüe limitada: el sufijo `-be` apunta a bielorruso, pero no hay confirmación de otros idiomas.

## Casos de uso

- Auditoría de sistemas RAG en producción: el modelo puede integrarse como un filtro posterior que señale tokens potencialmente alucinados en las respuestas generadas, permitiendo a los desarrolladores detectar fallos de fidelidad antes de que lleguen al usuario final.
- Evaluación de benchmarks de QA con recuperación: utilizado como métrica automática para comparar la fidelidad de diferentes sistemas RAG sobre conjuntos de datos como MultiWikiQA.
- Control de calidad en asistentes virtuales multilingües: en despliegues donde el bielorruso sea un idioma soportado, este modelo puede monitorizar las respuestas y alertar sobre incoherencias con el contexto recuperado.
- Investigación en detección de alucinaciones: sirve como modelo base para estudiar técnicas de etiquetado a nivel de token y comparar con otros enfoques.
- Generación de datos de entrenamiento: las predicciones del modelo pueden usarse para crear conjuntos de datos etiquetados de forma automática, reduciendo el coste de anotación manual.
- Integración en pipelines de CI/CD para sistemas de QA: al ser ligero, puede ejecutarse en cada commit para verificar que las respuestas generadas por un modelo candidato no contienen alucinaciones graves.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado describe el proceso de generación de datos y el fine-tuning, pero no incluye tablas comparativas de rendimiento con otros detectores de alucinaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con 140,6 millones de parámetros, en precisión fp32 ocupa aproximadamente 560 MB; en fp16 se reduce a unos 280 MB. Esto permite ejecutarlo en GPUs con 2 GB de VRAM o incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 3050 o superiores. También es viable en Apple Silicon con Metal.
- En consumer GPU: sí, cabe sin problemas en tarjetas de gama de entrada.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con Hugging Face Inference Endpoints, o mediante librerías como FastAPI con `transformers`. Para CPU, se puede usar `torch` con optimizaciones como `torch.compile` o `ONNX Runtime`.
- Latencia y throughput: no se dispone de mediciones oficiales, pero por su tamaño se espera una latencia de milisegundos por lote pequeño en GPU moderna.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (detección de alucinaciones a nivel de token con arquitectura ModernBERT). Existen otros detectores de alucinaciones basados en clasificación de secuencias o en modelos generativos, pero no hay datos públicos que permitan una comparación directa con este modelo concreto.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos generados por LettuceDetect; su rendimiento en dominios reales o con distribuciones diferentes a MultiWikiQA puede degradarse.
- El alcance idiomático no está documentado; si el sufijo `-be` corresponde a bielorruso, el modelo no será útil para otros idiomas sin fine-tuning adicional.
- Al ser un modelo de clasificación de tokens, no puede generar explicaciones ni justificaciones; solo proporciona etiquetas binarias.
- La licencia no está especificada, lo que genera incertidumbre sobre su uso comercial y la necesidad de obtener permisos del autor.
- No se han publicado métricas de rendimiento, por lo que no se puede evaluar su precisión, recall o F1 en tareas de detección de alucinaciones.
- La fecha de creación (2026) y el número de descargas (0) sugieren que es un modelo muy reciente o experimental, con poca validación externa.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-be)
- [Paper: A multilingual hallucination benchmark: MultiWikiQHalluA](https://arxiv.org/pdf/2605.02504v2)
- [Sitio web de EuroEval](https://euroeval.com/)
- [Versión en albanés (sq)](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-sq)
- [Versión en inglés (en)](https://huggingface.co/EuroEval/mmBERT-small-multi-wiki-qa-synthetic-hallucinations-with-ragtruth-en)
