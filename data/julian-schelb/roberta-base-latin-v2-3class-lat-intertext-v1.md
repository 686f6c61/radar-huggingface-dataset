# julian-schelb/roberta-base-latin-v2-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/roberta-base-latin-v2-3class-lat-intertext-v1` es un clasificador de pares de secuencias en latín, diseñado para detectar y tipificar vínculos intertextuales entre las obras de Jerónimo de Estridón (Hieronymus) y otros autores clásicos. Desarrollado por Julian Schelb y colaboradores, forma parte del ecosistema Loci Similes, un benchmark y paquete Python para el estudio computacional de la intertextualidad en literatura latina. A diferencia de la versión binaria anterior (match/no match), este modelo distingue tres clases: `no_match` (sin relación), `cit` (cita o reutilización léxica cercana) y `cf` (eco temático difuso, del latín *confer*). Esta granularidad permite un análisis filológico más fino, separando la reutilización textual explícita de la influencia temática implícita.

El modelo se basa en `ClassCat/roberta-base-latin-v2`, un encoder transformer de tipo RoBERTa preentrenado en latín, con 124.444.419 parámetros y una ventana de contexto máxima de 512 tokens. Se ha ajustado mediante fine-tuning con muestreo balanceado de clases sobre uno de los cinco splits de validación cruzada del benchmark Loci Similes. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. Su relevancia actual radica en la creciente aplicación de métodos de procesamiento del lenguaje natural a las humanidades digitales, donde la detección automática de fuentes y alusiones en textos clásicos es una tarea fundamental para la investigación filológica y la edición digital de obras.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder-only transformer) |
| Parametros totales | 124.444.419 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `ClassCat/roberta-base-latin-v2`, una variante de RoBERTa preentrenada sobre corpus latinos. La arquitectura es un transformer encoder-only estándar, con atención bidireccional y 12 capas ocultas (configuración base de RoBERTa). Para la tarea de clasificación de pares de secuencias, se utiliza la estrategia clásica de concatenar ambas frases con tokens especiales: `<s> Jerome_phrase </s></s> Candidate_phrase </s>`. La salida correspondiente al token `<s>` inicial se proyecta a un espacio de 3 logits mediante una cabeza de clasificación lineal.

El entrenamiento se realizó sobre uno de los cinco splits de validación cruzada del benchmark Loci Similes, que contiene pares de pasajes anotados manualmente como `no_match`, `cit` o `cf`. Dado que los corpus reales están dominados por pares negativos (la mayoría de los pasajes no tienen relación), se empleó muestreo balanceado de clases durante el entrenamiento para evitar el sesgo hacia la clase mayoritaria. No se proporcionan detalles sobre el número de épocas, la tasa de aprendizaje ni la función de pérdida, aunque por tratarse de una tarea de clasificación multiclase se asume una pérdida de entropía cruzada. La innovación principal respecto a los modelos `-class-lat-intertext-v1` previos es la distinción entre `cit` y `cf`, que requiere que el modelo aprenda a separar la similitud léxica superficial del eco temático, una tarea lingüísticamente más sutil.

## Capacidades

- Clasificación de pares de pasajes latinos en tres categorías: `no_match` (sin relación), `cit` (reutilización léxica cercana, cita) y `cf` (eco temático difuso, confer).
- Procesamiento de secuencias de hasta 512 tokens, suficiente para pasajes breves y medianos de prosa o poesía latina.
- Integración nativa con el paquete Python LociSimiles para flujos de trabajo de intertextualidad (https://julianschelb.github.io/locisimiles/api/).
- Inferencia con `transformers` mediante `AutoModelForSequenceClassification`, compatible con pipelines estándar de Hugging Face.
- Soporte para ajuste fino de umbrales por clase (one-vs-rest), con valores recomendados de 0.70 para `cit` y 0.86 para `cf`, lo que permite controlar el equilibrio entre precisión y recall en corpus desbalanceados.
- No soporta tool calling, agentes, visión ni generación de texto; es exclusivamente un clasificador de pares.

## Casos de uso

- **Investigación filológica sobre fuentes de Jerónimo**: el modelo puede identificar automáticamente citas directas y alusiones temáticas en las obras de Jerónimo, acelerando el trabajo de localización de fuentes clásicas que tradicionalmente se realiza de forma manual.
- **Anotación de corpus latinos a gran escala**: permite procesar colecciones extensas de textos latinos (por ejemplo, la Vulgata, obras patrísticas o autores clásicos) para generar anotaciones de intertextualidad que sirvan como punto de partida para estudios cualitativos.
- **Enriquecimiento de ediciones digitales**: integrado en plataformas de edición académica, puede añadir automáticamente notas marginales o enlaces a pasajes paralelos, mejorando la experiencia de lectura y consulta de textos digitales.
- **Búsqueda semántica de paralelos textuales**: combinado con el paquete LociSimiles, permite buscar en un corpus qué pasajes están relacionados con una frase dada, discriminando entre citas literales y ecos temáticos, útil para bases de datos de literatura clásica.
- **Estudio de influencias clásicas en la literatura patrística**: el modelo puede aplicarse a otros autores cristianos además de Jerónimo, siempre que se ajuste o se valide con datos anotados, para rastrear la pervivencia de motivos clásicos en la literatura cristiana.
- **Detección de plagio o reutilización textual en textos latinos**: aunque el modelo está entrenado con un corpus específico, su capacidad para distinguir `cit` de `no_match` puede adaptarse a la identificación de reutilización textual en otros géneros o épocas, previa validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas como precisión, recall o F1 en la model card, ni se proporcionan comparaciones cuantitativas con otros modelos. Los únicos datos de rendimiento indirectos son los umbrales recomendados por clase, que sugieren que la clase `cf` es más difícil de detectar (umbral más alto de 0.86) que `cit` (0.70), consistente con la naturaleza difusa del eco temático.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 124 millones de parámetros y una longitud máxima de 512 tokens, el modelo requiere aproximadamente 500 MB en FP32, 250 MB en FP16 y unos 125 MB en INT8. Estas cifras son orientativas y no se han verificado experimentalmente.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente, incluyendo tarjetas de consumo como NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU con razonable velocidad para inferencia por lotes pequeños.
- **Compatibilidad con GPU de consumo**: sí, cabe sin problema en cualquier GPU moderna de consumo; incluso en entornos sin GPU se puede usar con CPU.
- **Opciones de despliegue**: se puede servir con `transformers` directamente, exportar a ONNX para optimización, o utilizar `text-embeddings-inference` (el modelo declara compatibilidad con `endpoints_compatible`). No se menciona soporte explícito para vLLM, llama.cpp u Ollama, aunque al ser un modelo de clasificación, la integración con estos frameworks no es habitual.
- **Latencia y throughput**: no se dispone de datos medidos. Para un modelo de este tamaño, se espera una latencia de decenas de milisegundos por par de secuencias en GPU y de unos pocos cientos de milisegundos en CPU, pero estos valores son estimaciones no confirmadas.

## Comparativa con modelos similares

Existen dos modelos estrechamente relacionados del mismo autor y proyecto:

| Modelo | Clases | Base | Idioma | Contexto | Licencia |
|---|---|---|---|---|---|
| `roberta-base-latin-v2-3class-lat-intertext-v1` (este) | 3 (no_match, cit, cf) | ClassCat/roberta-base-latin-v2 | la | 512 | Apache 2.0 |
| `roberta-base-latin-v2-class-lat-intertext-v1` (binario) | 2 (match, no_match) | ClassCat/roberta-base-latin-v2 | la | 512 | Apache 2.0 |
| `xlm-roberta-base-class-lat-intertext-v1` (binario) | 2 (match, no_match) | FacebookAI/xlm-roberta-base | multilingüe (incluye la) | 512 | Apache 2.0 |

No se dispone de datos de rendimiento comparativo entre estos modelos. La principal diferencia del modelo triclase es su capacidad para distinguir citas de ecos temáticos, mientras que los binarios solo indican si hay o no relación. La elección entre ellos dependerá de la necesidad de granularidad en la anotación.

## Limitaciones y advertencias

- **Alcance lingüístico restringido**: el modelo está entrenado exclusivamente con textos latinos, y específicamente con pasajes de Jerónimo y autores clásicos. No es aplicable a otros idiomas ni a registros latinos muy diferentes (por ejemplo, latín medieval tardío o neolatín) sin reentrenamiento.
- **Longitud de contexto limitada a 512 tokens**: los pasajes más largos deben truncarse, lo que puede perder información relevante para la detección de intertextualidades que abarcan más de esa extensión.
- **Desequilibrio inherente de la tarea**: los corpus reales son abrumadoramente negativos; aunque se usó muestreo balanceado, en producción es necesario aplicar los umbrales recomendados para reducir falsos positivos, lo que implica una pérdida de recall.
- **Dificultad de la clase `cf`**: el eco temático no tiene una señal léxica fiable, por lo que es la clase con mayor riesgo de error. Los umbrales altos (0.86) reflejan esta dificultad y pueden dejar muchos ecos reales sin detectar.
- **Sesgo del corpus de entrenamiento**: el modelo se centra en la intertextualidad con Jerónimo; su comportamiento con otros autores patrísticos o paganos puede no ser óptimo sin una validación adicional.
- **Riesgo de alucinación en clasificación**: las probabilidades de salida no son calibradas; una probabilidad alta no garantiza que la relación sea real, especialmente en la clase `cf`. Se recomienda revisión humana de los resultados en aplicaciones académicas.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías sobre la exactitud de las predicciones; la responsabilidad del uso recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/julian-schelb/roberta-base-latin-v2-3class-lat-intertext-v1
- Paper arXiv (Loci Similes): https://arxiv.org/abs/2601.07533
- Paquete LociSimiles: https://julianschelb.github.io/locisimiles/api/
- Dataset de etiquetas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-labels
- Dataset del corpus: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-corpus
- Dataset de consultas: https://huggingface.co/datasets/julian-schelb/latin-classical-intertextuality-queries
- Modelo base (ClassCat/roberta-base-latin-v2): https://huggingface.co/ClassCat/roberta-base-latin-v2
