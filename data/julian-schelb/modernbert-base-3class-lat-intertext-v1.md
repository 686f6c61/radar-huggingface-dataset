# julian-schelb/modernbert-base-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/modernbert-base-3class-lat-intertext-v1` es un clasificador de pares de secuencias entrenado para detectar y tipificar enlaces intertextuales entre autores de la literatura latina clásica, con un enfoque específico en las obras de Jerónimo (Hieronymus) y otros autores. Desarrollado por Julian Schelb, se basa en el modelo encoder-only `answerdotai/ModernBERT-base` y se publica bajo licencia Apache 2.0. El problema que resuelve es la identificación automática de dos tipos de reutilización textual: citas o reutilización léxica cercana (`cit`) y ecos temáticos difusos (`cf`), frente a pares de pasajes sin relación (`no_match`). Su relevancia radica en que permite automatizar tareas de análisis filológico e intertextualidad que tradicionalmente se realizan de forma manual, y se integra con el paquete Python LociSimiles.

Con 149.607.171 parámetros y una longitud máxima de contexto de 512 tokens, el modelo está diseñado para clasificar pares de frases o pasajes breves. Se entrenó sobre una de las cinco particiones de validación cruzada del benchmark Loci Similes, con muestreo balanceado de clases para compensar el fuerte desequilibrio de los corpus reales, donde la mayoría de pares no presentan relación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) con cabeza de clasificación de secuencias |
| Parametros totales | 149.607.171 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Latín (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer bidireccional optimizado con técnicas modernas como atención con descomposición en ventanas y mejoras en el entrenamiento. Sobre esta base se añade una cabeza de clasificación de secuencias para procesar pares de textos, siguiendo el patrón típico de BERT con tokens especiales `<s>` y `</s></s>`. El entrenamiento se realizó mediante fine-tuning sobre el benchmark Loci Similes, que contiene pares de pasajes anotados como `no_match`, `cit` o `cf`. Se empleó muestreo balanceado de clases para mitigar el desequilibrio inherente de los corpus reales, donde la clase negativa domina. Además, el modelo se evalúa con umbrales de decisión por clase (0.99 para `cit` y 0.80 para `cf`) ajustados uno contra todos sobre la partición de entrenamiento, en lugar de usar simplemente argmax. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Clasificación de pares de pasajes en latín en tres clases: `no_match`, `cit` (cita o reutilización léxica cercana) y `cf` (eco temático difuso).
- Detección de intertextualidad entre autores latinos clásicos, con especialización en las obras de Jerónimo.
- Integración con el paquete Python LociSimiles para flujos de trabajo de intertextualidad en latín.
- Soporte de entrada de pares de secuencias con tokenización estándar de Transformers.
- Inferencia eficiente al ser un modelo encoder de tamaño medio (149M parámetros).
- Capacidad de ajuste de umbrales de decisión para controlar el equilibrio entre precisión y recall en entornos de corpus altamente desequilibrados.

## Casos de uso

- **Análisis filológico asistido**: investigadores en literatura clásica pueden usar el modelo para localizar citas y ecos temáticos entre Jerónimo y otros autores, acelerando el estudio de fuentes y tradiciones textuales.
- **Anotación de corpus intertextuales**: el modelo puede pre-anotar grandes colecciones de textos latinos, reduciendo el esfuerzo manual de etiquetado y permitiendo la construcción de bases de datos de intertextualidad a gran escala.
- **Detección de plagio en textos clásicos**: aplicado a pares de pasajes, distingue entre reutilización directa (cita) y reelaboración temática, útil para estudios de autenticidad y transmisión textual.
- **Búsqueda semántica en bibliotecas digitales**: integrado con LociSimiles, puede filtrar candidatos a intertexto entre millones de pasajes, priorizando aquellos con alta probabilidad de `cit` o `cf`.
- **Enseñanza de literatura latina**: herramienta didáctica para que estudiantes identifiquen patrones de alusión y referencia entre autores, con ejemplos concretos extraídos de textos reales.
- **Investigación en humanidades digitales**: como componente de pipelines de análisis estilométrico o de redes de influencia entre autores, clasificando automáticamente relaciones intertextuales en corpus completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 149M parámetros, el modelo requiere aproximadamente 600 MB en FP32, unos 300 MB en int8 y cerca de 150 MB en int4. Estas cifras son orientativas y dependen del tamaño del lote y la longitud de las secuencias.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo cómodamente. Ejemplos: NVIDIA RTX 3060, RTX 4060, RTX 4090, o GPUs de centros de datos como A10, A100.
- **Compatibilidad con GPU de consumo**: sí, cabe en la mayoría de GPUs consumer actuales, incluso con cuantización ligera.
- **Opciones de despliegue**: al ser un modelo de Transformers, puede servirse con bibliotecas estándar (`transformers`, `pipeline`), o mediante servidores de inferencia como vLLM (aunque está pensado para clasificación, no generación), Text Embeddings Inference (TEI) según los tags, o simplemente con `torch` en entornos Python.
- **Latencia y throughput estimados**: no disponible. Dado el tamaño y la arquitectura encoder, se espera una latencia de milisegundos por par de frases en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

El modelo se puede comparar con otros clasificadores de intertextualidad latina del mismo autor, aunque no se dispone de datos de rendimiento comparativo. La tabla siguiente resume las diferencias principales:

| Modelo | Tarea | Base | Parámetros | Contexto | Licencia |
|---|---|---|---|---|---|
| `modernbert-base-3class-lat-intertext-v1` (este) | Clasificación 3 clases (no_match, cit, cf) | ModernBERT-base | 149M | 512 | Apache 2.0 |
| `modernbert-base-class-lat-intertext-v1` (binario) | Clasificación binaria (match / no_match) | ModernBERT-base | 149M | 512 | Apache 2.0 |
| `roberta-base-latin-v2-class-lat-intertext-v1` | Clasificación (probablemente binaria o multiclase) | RoBERTa-base latín v2 | ~125M | 512 | No disponible |

No se han publicado resultados de benchmarks que permitan una comparación cuantitativa entre estos modelos.

## Limitaciones y advertencias

- **Especialización en latín clásico**: el modelo se entrenó con textos de autores clásicos y de Jerónimo; su rendimiento puede degradarse con latín medieval, humanístico o eclesiástico tardío.
- **Contexto limitado**: la ventana de 512 tokens obliga a dividir pasajes largos, lo que puede perder relaciones intertextuales que dependen de un contexto más amplio.
- **Umbrales estrictos**: el umbral de 0.99 para `cit` reduce los falsos positivos pero puede omitir citas legítimas con baja probabilidad. El umbral de 0.80 para `cf` es más laxo, pero la clase `cf` es intrínsecamente difícil por carecer de señal léxica fiable.
- **Desequilibrio de clases**: aunque se usó muestreo balanceado, en la práctica el modelo puede favorecer `no_match` si no se ajustan los umbrales adecuadamente.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede producir clasificaciones incorrectas con alta confianza, especialmente en pares ambiguos o con vocabulario poco frecuente.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el modelo se distribuye sin garantías y el autor no proporciona soporte técnico.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/julian-schelb/modernbert-base-3class-lat-intertext-v1)
- [Modelo binario previo](https://huggingface.co/julian-schelb/modernbert-base-class-lat-intertext-v1)
- [Repositorio de ModernBERT en GitHub](https://github.com/AnswerDotAI/ModernBERT)
- [Paper de ModernBERT (arXiv:2412.13663)](https://arxiv.org/abs/2412.13663)
- [Paper del benchmark Loci Similes (arXiv:2601.07533)](https://arxiv.org/abs/2601.07533)
- [Documentación de LociSimiles](https://julianschelb.github.io/locisimiles/api/)
