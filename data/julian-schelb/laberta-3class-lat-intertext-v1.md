# julian-schelb/laberta-3class-lat-intertext-v1

## Resumen

El modelo `julian-schelb/laberta-3class-lat-intertext-v1` es un clasificador de secuencias de tres clases, especializado en la detección y tipificación de vínculos intertextuales entre pasajes de la literatura latina clásica. Desarrollado por Julian Schelb y colaboradores de la Universidad de Constanza, forma parte del proyecto Loci Similes, un benchmark y paquete Python para extraer intertextualidades en textos latinos. El modelo distingue entre citas verbatim o con variación léxica (`cit`), ecos temáticos difusos (`cf`) y pasajes sin relación (`no_match`).

Se basa en `bowphs/LaBerta`, un modelo RoBERTa preentrenado específicamente para latín, y se ha ajustado mediante fine-tuning para la tarea de clasificación de pares de secuencias. Con aproximadamente 126 millones de parámetros y una ventana de contexto de 512 tokens, es un modelo compacto y eficiente, adecuado para su integración en flujos de trabajo filológicos y de humanidades digitales. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

La relevancia de este modelo radica en que aborda una tarea especializada que no suele estar cubierta por los modelos multilingües genéricos: la identificación automática de reutilización textual en latín clásico. Esto tiene aplicaciones directas en estudios de tradición clásica, crítica textual y análisis de influencias literarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) |
| Parametros totales | 125.980.419 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantificables con herramientas externas) |
| Idiomas soportados | latin (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una adaptación de `bowphs/LaBerta`, que a su vez es una variante de RoBERTa preentrenada sobre corpus latinos. La tarea de fine-tuning es clasificación de pares de secuencias: recibe dos pasajes (uno de Jerónimo y otro de un autor clásico) y predice una de tres etiquetas: `no_match`, `cit` o `cf`. La entrada se construye siguiendo el patrón encoder con tokens especiales: `<s> frase1 </s></s> frase2 </s>`.

El entrenamiento se realizó sobre uno de los cinco splits de validación cruzada del benchmark Loci Similes, que incluye etiquetas manuales de intertextualidad. Se empleó un muestreo balanceado por clases, dado que los corpus reales son abrumadoramente negativos. No se especifica el número exacto de épocas ni la configuración de hiperparámetros en la información disponible. La model card menciona que se aplicaron umbrales por clase (0.86 para `cit` y 0.95 para `cf`) ajustados one-vs-rest sobre el split de entrenamiento, con fallback a `no_match`.

## Capacidades

- Clasificación de pares de pasajes latinos en tres categorías: `no_match`, `cit` (cita o reutilización léxica cercana) y `cf` (eco temático difuso).
- Detección de reutilización textual verbatim y con variaciones, útil para identificar alusiones directas entre autores.
- Distinción entre citas explícitas y ecos temáticos, lo que permite un análisis más matizado que la simple detección binaria.
- Integración con el paquete Python LociSimiles para flujos de trabajo de extracción de intertextualidades.
- Funciona con la librería `transformers` de Hugging Face, permitiendo uso estándar con `AutoTokenizer` y `AutoModelForSequenceClassification`.
- Soporta inferencia con umbrales configurables para controlar el equilibrio entre precisión y recall en corpus desbalanceados.

## Casos de uso

- Investigación filológica: el modelo puede identificar automáticamente pasajes de Jerónimo que reutilizan textos de autores clásicos como Virgilio, Cicerón u Ovidio, acelerando el análisis de fuentes y tradición textual.
- Análisis de influencia literaria: al distinguir entre citas directas y ecos temáticos, permite estudiar cómo se transforman las ideas y expresiones a lo largo del tiempo.
- Construcción de corpus anotados: puede pre-etiquetar grandes colecciones de textos latinos para crear datasets de entrenamiento o validación de hipótesis filológicas.
- Verificación de citas en ediciones críticas: ayuda a los editores a localizar referencias intertextuales no señaladas previamente en ediciones de textos latinos.
- Educación clásica: herramienta de apoyo para estudiantes que necesitan identificar paralelismos entre autores latinos en trabajos académicos.
- Humanidades digitales: integración en pipelines de minería de texto para explorar redes de citación y reutilización en la literatura latina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo proviene de experimentos con el benchmark Loci Similes, pero no incluye métricas numéricas (precisión, recall, F1) ni comparaciones con otros modelos. Se recomienda consultar el artículo arXiv (2601.07533) para obtener datos detallados cuando esté disponible.

## Requisitos de hardware

- No se han publicado requisitos específicos de hardware en la información proporcionada.
- Al tratarse de un modelo de aproximadamente 126 millones de parámetros (tamaño base de RoBERTa), la inferencia puede ejecutarse en GPUs de consumo como una RTX 3060 o superior, y también en CPU para lotes pequeños.
- La carga en memoria es del orden de 500 MB en precisión fp32, reducible con cuantización a 8 o 4 bits.
- Para despliegue en producción, puede utilizarse con `transformers` estándar, o servidores de inferencia como vLLM o Text Generation Inference (TGI), aunque al ser un modelo de clasificación de pares, la integración típica sería mediante una API personalizada.
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (clasificación de intertextualidad latina en tres clases). El modelo binario previo `julian-schelb/laberta-class-lat-intertext-v1` resuelve una versión simplificada (match/no match), pero no es intercambiable. Otros modelos de clasificación de texto en latín podrían adaptarse, pero no hay datos públicos de comparación.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para latín clásico y para la detección de intertextualidades entre Jerónimo y otros autores; su rendimiento en otros géneros o épocas del latín puede degradarse.
- La ventana de contexto está limitada a 512 tokens, lo que impide procesar pasajes largos de una sola vez; se requiere truncamiento o división en fragmentos.
- La clase `cf` (eco temático) es intrínsecamente difícil de detectar por su falta de señal léxica, lo que puede generar falsos negativos o positivos.
- Los umbrales recomendados (0.86 para `cit` y 0.95 para `cf`) están ajustados para reducir falsos positivos en corpus desbalanceados, pero pueden no ser óptimos para otros conjuntos de datos.
- No se han documentado sesgos específicos, pero al estar entrenado sobre un corpus limitado de autores clásicos, puede reflejar las particularidades de ese corpus.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende de LaBerta, cuya licencia también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El modelo no es generativo; solo produce etiquetas de clasificación, por lo que no puede generar texto ni responder preguntas abiertas.

## Enlaces

- [Hugging Face - julian-schelb/laberta-3class-lat-intertext-v1](https://huggingface.co/julian-schelb/laberta-3class-lat-intertext-v1)
- [Hugging Face - bowphs/LaBerta (modelo base)](https://huggingface.co/bowphs/LaBerta)
- [GitHub - LociSimiles](https://github.com/julianschelb/locisimiles)
- [PyPI - locisimiles](https://pypi.org/project/locisimiles/)
- [Documentación de LociSimiles](https://julianschelb.github.io/locisimiles/api/)
- [Artículo arXiv (2601.07533)](https://arxiv.org/abs/2601.07533)
