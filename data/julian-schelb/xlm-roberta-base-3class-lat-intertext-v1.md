# julian-schelb/xlm-roberta-base-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/xlm-roberta-base-3class-lat-intertext-v1` es un clasificador de pares de secuencias entrenado específicamente para detectar y tipificar relaciones de intertextualidad en textos latinos clásicos. Desarrollado por Julian Schelb y colaboradores, se basa en el modelo multilingüe XLM-RoBERTa-base (FacebookAI/xlm-roberta-base) y se ha ajustado con el benchmark Loci Similes, un corpus de pasajes de Jerónimo (Hieronymus) y otros autores clásicos. Resuelve el problema de identificar automáticamente si dos pasajes latinos están relacionados y, en caso afirmativo, si se trata de una cita literal o de un eco temático.

A diferencia de la versión binaria anterior, este modelo distingue tres clases: `no_match` (sin relación), `cit` (cita o reutilización léxica cercana) y `cf` (eco temático suelto). Con 278 millones de parámetros y una ventana de contexto de 512 tokens, está pensado para integrarse en flujos de trabajo filológicos digitales, como el paquete LociSimiles. Su relevancia radica en que ofrece una herramienta automática y reproducible para un análisis que tradicionalmente se hacía de forma manual, permitiendo procesar grandes corpus latinos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa-base) |
| Parametros totales | 278.045.955 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de XLM-RoBERTa-base, un transformer encoder-only preentrenado con objetivos de RoBERTa sobre datos multilingües. La capa de clasificación se añade sobre la representación del token especial `<s>` para realizar clasificación de pares de secuencias, siguiendo el patrón `<s> frase_de_Jerónimo </s></s> frase_candidata </s>`. Se entrenó sobre uno de los cinco splits de validación cruzada del benchmark Loci Similes, que contiene pares de pasajes etiquetados como `no_match`, `cit` o `cf`. Dado que los corpus reales son mayoritariamente negativos, se empleó un muestreo balanceado por clase para evitar el sesgo hacia la clase mayoritaria. No se dispone de información detallada sobre el número total de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Clasificación de pares de textos latinos para detectar intertextualidad.
- Distinción entre cita literal o reutilización léxica cercana (`cit`) y eco temático suelto (`cf`).
- Manejo de entradas de hasta 512 tokens por pasaje.
- Integración directa con el paquete LociSimiles para flujos de trabajo de intertextualidad.
- Compatible con la librería `transformers` de Hugging Face.
- No soporta generación de texto, tool calling ni capacidades multimodales.

## Casos de uso

- Análisis filológico de fuentes en la obra de Jerónimo: el modelo permite localizar automáticamente pasajes de autores clásicos citados o evocados en los escritos de Jerónimo, ahorrando horas de búsqueda manual en corpus extensos.
- Detección de citas verbales en ediciones críticas: los editores pueden usar el modelo para verificar si un pasaje dado es una cita directa de otro autor, facilitando la anotación de fuentes.
- Identificación de ecos temáticos en literatura latina: más allá de las citas literales, el modelo ayuda a encontrar paralelismos conceptuales o temáticos entre obras, útil para estudios de recepción clásica.
- Búsqueda de paralelos en corpus digitales: integrado en herramientas como LociSimiles, permite consultar grandes bases de datos de textos latinos y obtener candidatos a intertextos de forma rápida.
- Asistencia en la enseñanza de latín: los docentes pueden emplear el modelo para generar ejemplos de intertextualidad que ilustren conceptos como la imitación o la alusión en la literatura romana.
- Automatización de pipelines en humanidades digitales: el modelo puede integrarse en flujos de procesamiento de textos para etiquetar automáticamente relaciones intertextuales en colecciones completas, generando datos estructurados para análisis posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que se aplican umbrales por clase (0.75 para `cit` y 0.79 para `cf`) para reducir falsos positivos, pero no se ofrecen métricas cuantitativas como precisión, recall o F1 sobre conjuntos de validación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278M parámetros, en FP32 el modelo ocupa aproximadamente 1.1 GB; en FP16 ~0.55 GB; en int8 ~0.28 GB. Para un batch pequeño (1-8 pares) bastan 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., GTX 1060, RTX 2060, o superiores) puede ejecutar inferencia en FP16 sin problemas. También es viable en CPU para uso puntual.
- El modelo cabe en GPUs de consumo (gama media y alta) sin necesidad de hardware especializado.
- Opciones de despliegue: se puede cargar con `transformers` en Python, o servir mediante Hugging Face Inference Endpoints (el tag `endpoints_compatible` lo indica). No es adecuado para vLLM ni TGI, orientados a generación.
- Latencia y throughput: no se han publicado mediciones específicas. En una GPU moderna, la inferencia de un par de secuencias de hasta 512 tokens debería completarse en decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Base | Clases | Parametros | Contexto | Licencia |
|---|---|---|---|---|---|
| `julian-schelb/xlm-roberta-base-3class-lat-intertext-v1` (este) | XLM-RoBERTa-base | 3 (no_match, cit, cf) | 278M | 512 | Apache 2.0 |
| `julian-schelb/xlm-roberta-base-class-lat-intertext-v1` | XLM-RoBERTa-base | 2 (match/no_match) | 278M | 512 | Apache 2.0 |
| `julian-schelb/roberta-base-latin-v2-class-lat-intertext-v1` | RoBERTa-base-latin-v2 | 2 (match/no_match) | 125M (aprox.) | 512 | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estos modelos. La diferencia principal es el número de clases y la base preentrenada (XLM-RoBERTa multilingüe vs. RoBERTa específica para latín). El modelo de 3 clases es más informativo pero requiere umbrales específicos para controlar los falsos positivos.

## Limitaciones y advertencias

- Sesgos de corpus: entrenado exclusivamente con pares de Jerónimo y autores clásicos, puede no generalizar bien a otros autores o épocas del latín.
- Riesgo de falsos positivos en la clase `cf` (eco temático), que es intrínsecamente más difícil de detectar por su falta de señal léxica fiable.
- Limitación de contexto: la ventana de 512 tokens por pasaje impide analizar pasajes más largos sin truncamiento, lo que puede perder información relevante.
- Solo soporta latín; no es aplicable a otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y los autores no ofrecen soporte técnico.
- Para producción se recomienda aplicar los umbrales por clase indicados en la model card, ya que el argmax simple puede generar demasiados falsos positivos en corpus reales.
- Depende del tokenizador de XLM-RoBERTa, que puede segmentar palabras latinas de forma subóptima debido a su entrenamiento multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julian-schelb/xlm-roberta-base-3class-lat-intertext-v1
- Paper (arXiv): https://arxiv.org/abs/2601.07533
- Dataset de etiquetas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-labels
- Dataset de corpus: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-corpus
- Dataset de consultas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-queries
- Documentación de LociSimiles: https://julianschelb.github.io/locisimiles/api/
- Modelo binario equivalente: https://huggingface.co/julian-schelb/xlm-roberta-base-class-lat-intertext-v1
- Otro modelo relacionado: https://huggingface.co/julian-schelb/roberta-base-latin-v2-class-lat-intertext-v1
