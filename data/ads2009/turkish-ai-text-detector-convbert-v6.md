# ads2009/turkish-ai-text-detector-convbert-v6

## Resumen

El modelo `ads2009/turkish-ai-text-detector-convbert-v6` es un clasificador de texto diseñado para detectar si un texto en turco ha sido generado por inteligencia artificial. Lo desarrolla el usuario `ads2009` y se publica en Hugging Face con el pipeline de `text-classification`. Se basa en la arquitectura ConvBERT, una variante eficiente de BERT que emplea atención de convolución para reducir la complejidad computacional manteniendo un rendimiento competitivo. El modelo cuenta con 107,4 millones de parámetros y se distribuye en formato `safetensors`, lo que lo hace ligero y adecuado para tareas de moderación o verificación de contenido en turco.

Aunque la model card es genérica y no aporta detalles sobre el entrenamiento, el nombre del repositorio y la etiqueta `arxiv:1910.09700` (el paper de ConvBERT) confirman la arquitectura subyacente. El modelo se presenta como una herramienta práctica para distinguir texto humano de texto sintético en turco, una necesidad creciente ante la proliferación de contenido generado por modelos como ChatGPT. Su tamaño reducido permite su ejecución en hardware modesto, lo que facilita su integración en flujos de procesamiento de lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvBERT (variante base, según etiqueta `convbert` y referencia al paper 1910.09700) |
| Parametros totales | 107.407.754 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (probablemente 512 tokens, pero no se especifica) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `safetensors`, sin versiones GGUF u otras) |
| Idiomas soportados | turco (según el nombre del modelo y su propósito declarado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ConvBERT, introducida en el artículo "ConvBERT: Improving BERT with Span-based Dynamic Convolution" (arXiv:1910.09700). ConvBERT sustituye parte de la atención totalmente conectada por convoluciones dinámicas basadas en span, lo que reduce el coste computacional y mejora la eficiencia respecto a BERT estándar. El modelo aquí presentado es una versión fine-tuned para clasificación de texto, concretamente para la detección de texto turco generado por IA.

No se dispone de información sobre el proceso de entrenamiento: ni el conjunto de datos utilizado, ni el número de épocas, ni la estrategia de ajuste (por ejemplo, si se usó fine-tuning completo o adaptadores). Tampoco se especifica si se aplicaron técnicas como aumentación de datos o balanceo de clases. La model card es una plantilla automática sin contenido sustancial, por lo que todos estos detalles permanecen desconocidos.

## Capacidades

- Clasificación binaria de texto en turco para distinguir entre contenido generado por IA y texto humano.
- Procesamiento de secuencias de texto de longitud moderada (típica de ConvBERT, aunque no se confirma la ventana exacta).
- Inferencia eficiente gracias a la arquitectura ConvBERT, que reduce el coste de atención.
- Integración sencilla con la librería `transformers` de Hugging Face mediante el pipeline de `text-classification`.
- Compatible con `endpoints_compatible`, lo que facilita su despliegue en servicios de inferencia gestionada.

No se documentan capacidades adicionales como generación de texto, razonamiento, tool calling o soporte multilingüe más allá del turco.

## Casos de uso

- Moderación de contenido en plataformas turcas: el modelo puede integrarse en sistemas de revisión automática para marcar publicaciones, comentarios o artículos sospechosos de ser generados por IA, ayudando a mantener la transparencia y la confianza en comunidades online.
- Verificación de autenticidad en medios de comunicación: redacciones y agencias de noticias pueden usarlo como filtro preliminar para detectar notas o declaraciones generadas automáticamente antes de su publicación.
- Control de calidad en generación de contenido: empresas que producen texto con herramientas de IA pueden emplear el detector para auditar sus propios outputs y asegurar que cumplen estándares de naturalidad o para etiquetar contenido sintético.
- Investigación académica sobre detección de IA: el modelo sirve como punto de partida para estudios sobre robustez de detectores de texto generado por máquinas en turco, permitiendo comparar arquitecturas y conjuntos de datos.
- Protección contra suplantación y fraude: en entornos donde se requiere verificar la autoría humana (por ejemplo, reseñas de productos, testimonios o formularios), el detector puede ayudar a identificar texto fabricado.
- Filtrado en redes sociales: plataformas que necesiten reducir la propagación de contenido automatizado (bots) pueden usar el modelo como una capa adicional de análisis, combinándolo con otras señales de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, F1 ni comparaciones con otros detectores. Tampoco se proporcionan datos sobre el rendimiento en conjuntos de validación estándar como MMLU, HumanEval o similares, ya que se trata de un modelo especializado en una tarea de clasificación y no en tareas generales de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: con 107,4 millones de parámetros, el modelo ocupa aproximadamente 430 MB en precisión fp32 y unos 215 MB en fp16. Esto permite ejecutarlo en cualquier GPU con al menos 1 GB de VRAM, incluyendo tarjetas integradas o GPUs muy modestas.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 o superior, RTX 2060, etc.) es suficiente. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes pequeños.
- Compatibilidad con consumer GPU: sí, cabe en todas las GPUs de consumo actuales, incluso en aquellas con 4 GB de VRAM o menos.
- Opciones de despliegue: al ser un modelo de `transformers`, puede servirse con vLLM, TGI, o mediante el pipeline estándar de Hugging Face. También es posible exportarlo a ONNX para optimización. No se proporcionan versiones GGUF para llama.cpp u Ollama.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por muestra en GPU y de unos pocos cientos de milisegundos en CPU, pero son estimaciones orientativas.

## Comparativa con modelos similares

El autor ha publicado otros detectores de texto turco generado por IA en Hugging Face, aunque no se dispone de sus especificaciones detalladas:

| Modelo | Arquitectura | Parametros | Contexto | Licencia |
|---|---|---|---|---|
| `ads2009/turkish-ai-text-detector-convbert-v6` | ConvBERT | 107,4 M | no disponible | no disponible |
| `ads2009/turkish-ai-text-detector-berturk` | BERTurk (BERT para turco) | no disponible | no disponible | no disponible |
| `ads2009/turkish-ai-text-detector-distilberturk-v3` | DistilBERTurk (versión destilada) | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos. El sitio personal del autor (`yehos.info`) menciona un trabajo sobre detección de texto turco generado por IA mediante transfer learning sobre un modelo BERT turco, pero no se especifica si corresponde exactamente a esta versión.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, datos de entrenamiento o evaluación, por lo que se desconoce el comportamiento del modelo en dominios específicos (por ejemplo, textos técnicos, coloquiales o de diferentes registros).
- Al ser un modelo pequeño y especializado, es probable que su capacidad de generalización sea limitada frente a textos muy diferentes de los usados en el entrenamiento.
- Riesgo de alucinación no aplica directamente (no es un modelo generativo), pero sí puede producir falsos positivos o negativos en la clasificación, especialmente con textos cortos o ambiguos.
- No se especifica la licencia, lo que impide conocer las restricciones de uso comercial o modificación. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No se ofrecen garantías de precisión ni de idoneidad para casos de uso críticos (por ejemplo, decisiones legales o administrativas basadas en la detección de IA).
- El modelo solo cubre el idioma turco; no es aplicable a otros idiomas sin un reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ads2009/turkish-ai-text-detector-convbert-v6
- Modelo relacionado (BERTurk): https://huggingface.co/ads2009/turkish-ai-text-detector-berturk
- Modelo relacionado (DistilBERTurk): https://huggingface.co/ads2009/turkish-ai-text-detector-distilberturk-v3
- Trabajo del autor sobre detección de IA en turco: https://www.yehos.info/work/turkish-ai-detector
- Paper de ConvBERT (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
