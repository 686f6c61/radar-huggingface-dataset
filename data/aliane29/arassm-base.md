# aliane29/arassm-base

## Resumen

AraSSM-base es un encoder bidireccional basado en Mamba (state-space model) preentrenado desde cero para árabe mediante masked language modeling. Desarrollado por aliane29, es el primer encoder bidireccional de tipo SSM específico para árabe del que se tiene constancia, y destaca por haber sido entrenado íntegramente en cuatro GPUs de consumo RTX 2080Ti (11 GB) en lugar de un clúster de aceleradores. Su arquitectura combina dos pasadas de selective-scan (una hacia delante y otra hacia atrás) por capa, lo que proporciona contexto bidireccional con complejidad O(L) en la longitud de secuencia, frente a la O(L²) de la autoatención. Con aproximadamente 105 millones de parámetros y una ventana de 512 tokens, está pensado como encoder para fine-tuning en tareas de comprensión del lenguaje natural en árabe, similar al uso que se da a los modelos de la familia BERT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba bidireccional (state-space model) con doble selective-scan por capa |
| Parametros totales | 105.288.704 (~105M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Árabe (árabe moderno estándar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

AraSSM sigue un diseño de bloque bidireccional: cada capa ejecuta un mezclador selective-scan (Mamba) hacia delante y otro hacia atrás sobre el mismo estado oculto normalizado, y fusiona ambas salidas mediante una proyección lineal aprendida antes de pasarlas a la subcapa feed-forward. Esto permite capturar contexto completo de izquierda a derecha y de derecha a izquierda manteniendo complejidad lineal en la longitud de secuencia. El modelo tiene 12 capas, tamaño oculto de 512, dimensión de estado 16 y un vocabulario de 64.000 tokens, reutilizando el tokenizador AraBERTv02 existente.

El preentrenamiento se realizó sobre un corpus de aproximadamente 80 GB de texto árabe (79,6 GB de entrenamiento y 0,4 GB de validación), combinando Wikipedia en árabe y la porción árabe de CulturaX. Los documentos se limpiaron eliminando diacríticos y URLs, se filtraron por longitud y proporción de escritura árabe, se dividieron en fragmentos de máximo 400 palabras y se deduplicaron a nivel de fragmento con un filtro Bloom. El objetivo fue el masked language modeling estándar de BERT (15% de enmascaramiento, división 80/10/10), con optimizador AdamW (lr 3e-4, weight decay 0.01, 10.000 pasos de warmup y decaimiento lineal), precisión fp16 y tamaño de lote efectivo de 256. El entrenamiento consumió aproximadamente 960 horas-GPU en 4x RTX 2080Ti.

## Capacidades

- Generación de representaciones contextuales bidireccionales para texto árabe, orientadas a tareas de comprensión (NLU).
- Relleno de máscaras (fill-mask) sobre tokens enmascarados, útil para evaluar la coherencia contextual.
- Fine-tuning para clasificación de secuencias, clasificación de tokens y extracción de respuestas (QA extractivo).
- Procesamiento eficiente de secuencias largas gracias a la complejidad lineal de la arquitectura SSM, aunque limitado a 512 tokens.
- Soporte monolingüe: exclusivamente árabe moderno estándar; no se ha evaluado en dialectos.
- No incluye capacidades generativas, tool calling, agentes ni soporte multimodal.

## Casos de uso

- Análisis de sentimiento en árabe: fine-tuning sobre conjuntos de reseñas o redes sociales para clasificar opiniones positivas, negativas o neutras, aprovechando la representación bidireccional del encoder.
- Clasificación de textos periodísticos: categorización automática de noticias en árabe por tema (política, deportes, economía, etc.) tras un ajuste con datos etiquetados.
- Reconocimiento de entidades nombradas (NER): fine-tuning para extraer personas, organizaciones, lugares y fechas en documentos árabes, útil en sistemas de extracción de información.
- Búsqueda de respuestas extractivas: adaptación del encoder para localizar el fragmento de un pasaje que responde a una pregunta formulada en árabe, similar a los sistemas basados en BERT.
- Clasificación de documentos legales o administrativos: asignación de categorías a textos largos (hasta 512 tokens) en árabe, como contratos o resoluciones, con un coste computacional reducido.
- Filtrado de contenido o moderación: detección de spam, discursos de odio o contenido inapropiado en árabe mediante fine-tuning sobre datasets específicos, gracias a su tamaño compacto que permite despliegue en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2608.08256) podría contener evaluaciones, pero no se han proporcionado datos concretos en la documentación consultada.

## Requisitos de hardware

- Inferencia: al tratarse de un modelo de ~105M de parámetros, es factible ejecutarlo en GPUs de consumo con 4-6 GB de VRAM, aunque no se especifican requisitos oficiales.
- Entrenamiento: se realizó con 4x NVIDIA RTX 2080Ti (11 GB cada una), lo que indica que el preentrenamiento es viable en hardware de gama media.
- Despliegue: al ser una arquitectura personalizada (no nativa de `transformers`), se requiere cargar el código del modelo desde el repositorio del proyecto; no se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| AraSSM-base | Mamba bidireccional (SSM) | ~105M | 512 | Apache 2.0 | Encoder SSM para árabe, entrenado en GPUs de consumo |
| AraBERTv02 | Transformer bidireccional (BERT) | ~135M (estimado) | 512 | Apache 2.0 | Encoder transformer clásico para árabe, ampliamente usado |
| CAMeL-BERT | Transformer bidireccional (BERT) | ~114M (estimado) | 512 | MIT | Variante con modelos para dialectos árabes |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparativa se limita a aspectos arquitectónicos y de disponibilidad.

## Limitaciones y advertencias

- Preentrenado únicamente en árabe moderno estándar y texto web (Wikipedia + CulturaX); el rendimiento en dialectos árabes no ha sido evaluado.
- Longitud máxima de secuencia fijada en 512 tokens, lo que limita el procesamiento de documentos más largos sin truncamiento.
- No ha sido fine-tuned para ninguna tarea específica; requiere ajuste posterior para aplicaciones concretas.
- Entrenado con un presupuesto computacional limitado (4 GPUs de consumo), por lo que puede no alcanzar el rendimiento de modelos transformer preentrenados a mayor escala.
- Al ser una arquitectura personalizada, la integración con herramientas estándar del ecosistema `transformers` es limitada y requiere código adicional del repositorio del proyecto.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un encoder, el riesgo de generación de contenido falso es menor que en modelos generativos, pero los sesgos del corpus de entrenamiento pueden propagarse a las representaciones.

## Enlaces

- HuggingFace: https://huggingface.co/aliane29/arassm-base
- Paper (arXiv): https://arxiv.org/abs/2608.08256
- PDF del paper: https://arxiv.org/pdf/2608.08256
