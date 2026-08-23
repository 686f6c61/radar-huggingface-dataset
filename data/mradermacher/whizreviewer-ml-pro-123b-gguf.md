# mradermacher/WhizReviewer-ML-Pro-123B-GGUF

## Resumen

WhizReviewer-ML-Pro-123B es un modelo de lenguaje generativo de gran tamaño (123.000 millones de parámetros) desarrollado por WestlakeNLP, especializado en la revisión de artículos académicos en el campo del aprendizaje automático. El modelo se distribuye como una cuantización GGUF creada por mradermacher, lo que permite su ejecución en hardware de consumo mediante herramientas como llama.cpp u Ollama, aunque su tamaño sigue siendo considerable.

El modelo forma parte de una familia (8B, 70B y 123B) que ha sido entrenada con supervisión adicional para tareas de revisión, corrección y evaluación de manuscritos científicos. La versión cuantizada aquí descrita ofrece una alternativa accesible para investigadores y desarrolladores que deseen integrar capacidades de revisión académica en sus flujos de trabajo, siempre respetando las restricciones de la licencia personalizada (whizreviewer-pro-license), que prohíbe explícitamente su uso en revisiones oficiales o decisiones de publicación.

La cuantización Q4_K_S disponible reduce el tamaño del modelo a aproximadamente 69,7 GB, lo que lo hace ejecutable en estaciones de trabajo con múltiples GPUs de alta capacidad o en servidores dedicados. No se han publicado datos detallados sobre la arquitectura interna, el contexto máximo o los benchmarks, por lo que esta ficha se basa en la información disponible en los repositorios de HuggingFace.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la información proporcionada) |
| Parametros totales | 122.610.069.504 (122,6 B) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_S (única disponible) |
| Idiomas soportados | en, zh, ja, ko, fr, de |
| Licencia | whizreviewer-pro-license (licencia personalizada con restricciones) |
| Formato de pesos | GGUF (cuantizado) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base (WestlakeNLP/WhizReviewer-ML-Pro-123B). El nombre sugiere un modelo de tipo transformer denso, dado el número de parámetros y la ausencia de indicios de arquitectura MoE. La familia WhizReviewer se describe como un conjunto de LLMs generativos que han recibido entrenamiento supervisado adicional, lo que indica que el modelo base ha sido ajustado mediante fine-tuning supervisado (SFT) para tareas de revisión de papers. No se menciona el uso de RLHF, DPO ni técnicas de alineación adicionales.

Los datos de entrenamiento, la composición del dataset y el número de tokens utilizados no están disponibles en la información proporcionada. La cuantización Q4_K_M realizada por mradermacher es una conversión estática (no usa imatrix ni cuantización ponderada), lo que puede afectar ligeramente a la calidad en comparación con cuantizaciones dinámicas.

## Capacidades

- Generación de texto especializada en revisión académica: el modelo está entrenado para proporcionar críticas, sugerencias de mejora y evaluaciones de artículos científicos en el campo de machine learning.
- Soporte multilingüe: inglés, chino, japonés, coreano, francés y alemán, lo que permite su uso en contextos internacionales.
- Asistencia en escritura académica: puede ayudar a reformular párrafos, mejorar la claridad y sugerir reestructuraciones.
- Simulación de feedback: puede actuar como un revisor simulado para que los autores mejoren sus manuscritos antes de enviarlos a revisión real.
- Validación de conceptos: útil para comprobar la coherencia lógica de argumentos y la solidez de las metodologías.
- No se indica soporte para tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales (visión, audio, etc.).

## Casos de uso

- Mejora de manuscritos académicos: un investigador puede enviar su borrador al modelo para obtener sugerencias de claridad, estructura y redacción, mejorando la calidad antes de la revisión real.
- Asistencia en escritura de papers: el modelo puede generar secciones (introducción, discusión) o reformular resúmenes, siempre que el usuario respete la licencia que prohíbe el uso en revisiones oficiales.
- Herramienta de auto-evaluación para estudiantes: los estudiantes de posgrado pueden simular una revisión de su trabajo para identificar debilidades antes de presentarlo a sus supervisores.
- Simulación de feedback en entornos educativos: los profesores pueden generar ejemplos de revisiones para enseñar a los estudiantes cómo se evalúa un paper.
- Investigación en NLP: el modelo puede servir como un reward model o un evaluador automático en pipelines de investigación, aunque se debe verificar la compatibilidad con la licencia.
- Integración en flujos de trabajo de escritura: mediante la cuantización GGUF, puede integrarse en herramientas locales de edición de texto que usen llama.cpp u Ollama, permitiendo una revisión asistida sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otros conjuntos de evaluación estándar. Tampoco hay comparaciones con otros modelos de revisión académica en la documentación consultada.

## Requisitos de hardware

- El archivo GGUF Q4_K_M pesa aproximadamente 69,7 GB, por lo que se requiere una VRAM de al menos 70 GB para cargar el modelo completo en GPU. Esto implica el uso de múltiples GPUs de alta capacidad (por ejemplo, 2x A100 de 40 GB, o 4x RTX 3090 de 24 GB) o una GPU con 80 GB de VRAM, como la A100 o la H100.
- No cabe en una GPU de consumo estándar (RTX 4090 tiene 24 GB, insuficiente). Solo es viable en estaciones de trabajo con múltiples GPUs de gama alta o en servidores con GPUs de centro de datos.
- Alternativa: ejecutar en CPU con memoria RAM suficiente (más de 80 GB de RAM), aunque la velocidad de inferencia será significativamente menor.
- Herramientas de despliegue compatibles: llama.cpp, Ollama (si se configura con la cuantización), y otros ejecutores de GGUF. También se puede usar vLLM si se convierte a otro formato, pero no es directo.
- La latencia y throughput no se han publicado; en una GPU A100 de 80 GB se podría esperar una generación de unos 20-30 tokens por segundo en Q4_K_M, pero es una estimación no verificada.

## Comparativa con modelos similares

No hay información suficiente para realizar una comparativa rigurosa con otros modelos de revisión académica. El modelo más cercano podría ser el WhizReviewer-8B o el 70B, que comparten la misma familia y licencia. Sin embargo, no se dispone de datos de rendimiento ni de arquitectura para comparar. Otros modelos como GPT-4 o Claude podrían servir de referencia en tareas de revisión, pero no son comparables por licencia y disponibilidad. Por tanto, la comparativa se limita a la familia WhizReviewer:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| WhizReviewer-ML-Pro-123B | 122,6 B | no disponible | whizreviewer-pro-license | GGUF, safetensors |
| WhizReviewer-ML-Pro-70B | 70 B | no disponible | whizreviewer-pro-license | safetensors |
| WhizReviewer-ML-Pro-8B | 8 B | no disponible | whizreviewer-pro-license | safetensors |

## Limitaciones y advertencias

- La licencia whizreviewer-pro-license prohíbe explícitamente el uso del modelo para revisiones oficiales y decisiones de publicación. Solo se permite su uso para mejora de papers, práctica de escritura, auto-evaluación, aprendizaje, simulación de feedback, guías de revisión, validación de conceptos, como reward model, recurso educativo, asistente de investigación, herramienta suplementaria u otros fines aprobados.
- El modelo no está destinado a sustituir a revisores humanos en procesos editoriales; su uso indebido puede violar la licencia.
- No se conocen sesgos específicos, pero al ser un modelo entrenado en un dominio académico, puede presentar sesgos relacionados con la literatura científica (por ejemplo, preferencia por ciertos estilos de escritura o enfoques metodológicos).
- Riesgo de alucinación: como todo LLM, puede generar críticas o sugerencias que no se basen en el contenido real del artículo, especialmente en secciones técnicas complejas.
- La cuantización Q4_K_M puede degradar ligeramente la calidad de la salida en comparación con el modelo en punto flotante completo (FP16). No se dispone de métricas que cuantifiquen esta degradación.
- El modelo solo soporta 6 idiomas; no se ha confirmado su comportamiento en otros idiomas.
- No se conocen restricciones de uso comercial más allá de las indicadas en la licencia; se recomienda revisar el texto completo de la licencia antes de cualquier uso comercial.

## Enlaces

- Modelo GGUF: [https://huggingface.co/mradermacher/WhizReviewer-ML-Pro-123B-GGUF](https://huggingface.co/mradermacher/WhizReviewer-ML-Pro-123B-GGUF)
- Modelo base: [https://huggingface.co/WestlakeNLP/WhizReviewer-ML-Pro-123B](https://huggingface.co/WestlakeNLP/WhizReviewer-ML-Pro-123B)
- Repositorio de código (ai-researcher): [https://libraries.io/pypi/ai-researcher](https://libraries.io/pypi/ai-researcher)
- Página de FriendliAI para el modelo: [https://friendli.ai/models/WestlakeNLP/WhizReviewer-ML-Pro-123B](https://friendli.ai/models/WestlakeNLP/WhizReviewer-ML-Pro-123B)
- Perfil de mradermacher en HuggingFace: [https://www.aimodels.fyi/creators/huggingFace/mradermacher](https://www.aimodels.fyi/creators/huggingFace/mradermacher)
- Licencia: se encuentra en el repositorio del modelo base (whizreviewer-pro-license)
