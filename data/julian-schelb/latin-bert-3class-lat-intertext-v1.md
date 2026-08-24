# julian-schelb/latin-bert-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/latin-bert-3class-lat-intertext-v1` es un clasificador de pares de secuencias entrenado para detectar y tipificar vínculos intertextuales entre pasajes de la literatura latina clásica, concretamente entre la obra de Jerónimo (Hieronimus) y otros autores clásicos. Desarrollado por Julian Schelb, forma parte de un proyecto más amplio de extracción de intertextualidades en latín, integrado con el paquete Python LociSimiles.

Se trata de un fine-tuning del modelo `ashleygong03/bamman-burns-latin-bert`, un BERT preentrenado específicamente para latín. Con 111 millones de parámetros y una longitud máxima de contexto de 512 tokens, el modelo distingue tres clases: `no_match` (pasajes no relacionados), `cit` (cita o reutilización léxica cercana) y `cf` (eco temático difuso). Su relevancia radica en que aborda una tarea especializada en humanidades digitales, facilitando el análisis filológico a gran escala.

El modelo se publica bajo licencia Apache 2.0 y está disponible en HuggingFace con pesos en formato safetensors. Aunque no ha registrado descargas ni valoraciones hasta la fecha, su diseño específico para la clasificación de intertextualidad lo convierte en una herramienta útil para investigadores de literatura clásica y procesamiento del lenguaje natural aplicado al latín.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, variante base) |
| Parametros totales | 111.310.851 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), concretamente en la variante `ashleygong03/bamman-burns-latin-bert`, un modelo preentrenado sobre corpus latinos. El fine-tuning se realizó para la tarea de clasificación de pares de secuencias, donde se alimentan dos pasajes de texto (el primero de Jerónimo y el segundo de un autor clásico) y se predice una de las tres clases mencionadas.

El entrenamiento utilizó uno de los cinco pliegues de validación cruzada del benchmark Loci Similes, un conjunto de datos diseñado para extraer intertextualidades en literatura latina. Se aplicó un muestreo balanceado por clases, dado que en corpus reales la mayoría de los pares son negativos (`no_match`). No se dispone de detalles adicionales sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas como RLHF o DPO; la información disponible solo indica que es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación de pares de pasajes en latín en tres categorías: `no_match`, `cit` (cita/reutilización léxica cercana) y `cf` (eco temático difuso).
- Manejo de secuencias de hasta 512 tokens, suficiente para pasajes breves o fragmentos de texto.
- Integración con el paquete LociSimiles para flujos de trabajo de detección de intertextualidad en latín.
- Posibilidad de ajustar umbrales de decisión por clase (uno contra el resto) para controlar el equilibrio entre precisión y recall, especialmente útil en corpus muy desbalanceados.
- Compatible con la biblioteca `transformers` de HuggingFace, lo que permite su uso en pipelines estándar de clasificación de texto.
- Soporte de inferencia en lote y despliegue mediante Text Embeddings Inference (TEI) según las etiquetas del repositorio.

## Casos de uso

- **Análisis filológico asistido por ordenador**: los investigadores pueden procesar grandes corpus de literatura latina para identificar citas directas o ecos temáticos entre Jerónimo y autores clásicos, acelerando el trabajo de comparación textual.
- **Detección de fuentes en obras patrísticas**: el modelo ayuda a localizar qué pasajes de autores clásicos fueron citados o evocados por Jerónimo, facilitando el estudio de la tradición clásica en el cristianismo primitivo.
- **Construcción de bases de datos de intertextualidad**: integrado con LociSimiles, permite generar catálogos estructurados de vínculos intertextuales para su consulta y análisis estadístico.
- **Validación de hipótesis filológicas**: los estudiosos pueden introducir pares de pasajes candidatos y obtener una clasificación automática que sirva como punto de partida para un examen cualitativo más profundo.
- **Enseñanza de literatura clásica**: en entornos educativos, el modelo puede utilizarse para ilustrar ejemplos de reutilización textual entre autores, mostrando diferencias entre cita literal y eco temático.
- **Investigación en humanidades digitales**: sirve como componente de pipelines más amplios que combinan extracción de entidades, grafos de conocimiento y análisis de redes para estudiar la transmisión de ideas en la antigüedad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (precisión, recall, F1, etc.) ni comparaciones con otros modelos. Solo se menciona que los experimentos aplican umbrales por clase, pero sin cifras concretas.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo BERT base de 111 millones de parámetros y un tamaño de repositorio de 0,4 GB, la inferencia puede ejecutarse en GPUs con 4 GB de VRAM o menos en precisión FP32; con cuantización a 8 bits (no publicada oficialmente) cabría en 2 GB.
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de memoria, como NVIDIA GTX 1650, RTX 3060 o superiores. También es viable en CPU para inferencia por lotes pequeños.
- **Compatibilidad con GPU de consumo**: sí, cabe en tarjetas gráficas de gama media y baja.
- **Opciones de despliegue**: al ser un modelo de la familia `transformers`, puede servirse con vLLM, Hugging Face Inference Endpoints, Text Embeddings Inference (TEI) o mediante `pipeline` de transformers en un script Python. También es posible exportarlo a ONNX para optimización en CPU.
- **Latencia y throughput**: no disponible en la información proporcionada; se espera una latencia baja en GPU moderna (del orden de milisegundos por par de secuencias, típica de BERT base).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de intertextualidad en latín). El propio autor menciona que versiones anteriores (`-class-lat-intertext-v1`) resolvían una versión binaria de la tarea, pero no se ofrecen datos cuantitativos para comparar. Tampoco se han encontrado alternativas de terceros en los resultados de búsqueda. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Contexto limitado**: la longitud máxima de entrada es de 512 tokens, lo que impide analizar pasajes largos completos; es necesario segmentar el texto.
- **Especialización en latín**: el modelo solo funciona con texto en latín; no es aplicable a otros idiomas.
- **Riesgo de falsos positivos en clases positivas**: la clase `cf` (eco temático) es intrínsecamente difícil de detectar porque no presenta señal léxica fiable; el autor recomienda usar umbrales por clase para reducir falsos positivos en corpus reales, pero esto puede sacrificar recall.
- **Sesgo del corpus de entrenamiento**: el modelo se entrenó con datos centrados en Jerónimo y autores clásicos; su rendimiento puede degradarse en otros géneros o épocas de la literatura latina.
- **Sin datos de evaluación publicados**: no hay métricas de rendimiento disponibles, por lo que el usuario debe validar el modelo en su propio conjunto de datos antes de usarlo en producción.
- **Licencia**: aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye sin garantías; el autor no proporciona soporte técnico.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/julian-schelb/latin-bert-3class-lat-intertext-v1)
- [Colección de modelos para búsqueda de intertextualidad latina](https://huggingface.co/collections/julian-schelb/models-for-latin-intertextuality-search)
- [Página de modelos de Julian Schelb](https://huggingface.co/julian-schelb/models)
- [Documentación de LociSimiles (CLI)](https://julianschelb.github.io/locisimiles/cli/)
- [Paquete LociSimiles en PyPI](https://pypi.org/project/locisimiles/)
- [Repositorio GitHub de Julian Schelb](https://github.com/julianschelb?tab=repositories)
- [Paper en arXiv (2601.07533)](https://arxiv.org/abs/2601.07533)
