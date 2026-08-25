# jorgeortizfuentes/chilean-spanish-judgment-subtypes-flair-tulio

## Resumen

Este modelo es un etiquetador de secuencias (token-classification) entrenado para identificar las cinco subclases de *Judgment* (Juicio) de la Teoría de la Valoración (*Appraisal Theory*) dentro de la Lingüística Sistémico-Funcional: *capacity*, *normality* y *tenacity* (bajo *Social Esteem*) y *veracity* y *propriety* (bajo *Social Sanction*). Desarrollado por Jorge Ortiz Fuentes, se basa en un tagger Flair BiLSTM-CRF sobre embeddings apiladas: vectores fastText en español, *contextual string embeddings* `es-forward` y `es-backward`, y el modelo BERT chileno TULIO con *first-subtoken pooling*. El modelo se ha afinado sobre el *Chilean Spanish Attitude Corpus*, un corpus de 2.546 textos en español chileno anotado por tres lingüistas.

La relevancia de este modelo reside en que aborda una tarea lingüística especializada —el análisis de actitud y lenguaje evaluativo— en una variante del español poco cubierta por los recursos existentes, como el español chileno. Su publicación incluye resultados a nivel de span estricto, que se comparan con el acuerdo entre anotadores expertos (0.600), un dato clave para dimensionar su rendimiento. El modelo no es un LLM de propósito general, sino un modelo discriminativo de clasificación de spans, y se distribuye con una licencia CC-BY-4.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Flair BiLSTM-CRF sobre embeddings apiladas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Español (es-CL) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (librería Flair, probablemente PyTorch) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura BiLSTM-CRF implementada en la librería Flair. La capa de representación combina tres tipos de embeddings: vectores fastText en español, *contextual string embeddings* `es-forward` y `es-backward`, y el modelo BERT chileno TULIO (`dccuchile/tulio-chilean-spanish-bert`) con *first-subtoken pooling*. El clasificador CRF se entrena sobre etiquetas BIO para las cinco clases de *Judgment*.

El entrenamiento se realizó sobre el *Chilean Spanish Attitude Corpus* (2.546 textos, divididos en 1.782 / 382 / 382 para entrenamiento, validación y test). El corpus está dominado por tuits (2.420 de 2.546) y contiene anotaciones de tres lingüistas formadas en SFL. La configuración de entrenamiento incluye hasta 100 épocas con *patience* 3, tasa de aprendizaje 0.05 (3e-05 para el BERT), tamaño de batch 8, y una capa CRF. No se han descrito técnicas adicionales como RLHF o DPO; el proceso es un afinado supervisado clásico.

## Capacidades

- Clasificación de spans de las cinco subclases de *Judgment* en español chileno: `capacity`, `normality`, `propriety`, `tenacity`, `veracity`.
- Emite etiquetas BIO a nivel de token, de modo que un *span* es una secuencia continua de la misma clase no-`O`.
- No es un modelo generativo; no admite *tool calling*, *function calling* ni tareas de razonamiento multi-paso.
- Capacidad multilingüe limitada al español chileno; no se ha entrenado para otras variantes.
- No incorpora capacidades especiales como *thinking mode*, visión o audio.

## Casos de uso

- **Investigación en lingüística sistémico-funcional**: el modelo permite etiquetar automáticamente subclases de *Juicio* en textos del español chileno, lo que facilita el análisis de la actitud en discursos políticos, cartas al director y columnas de opinión.
- **Análisis de discurso en redes sociales**: dado que el corpus de entrenamiento es mayoritariamente de tufts, el modelo puede aplicarse a estudios de lenguaje evaluativo en redes sociales, p. ej., para identificar críticas o elogios hacia figuras públicas.
- **Estudios de incivilidad y discurso de odio**: aunque no está diseñado para moderar, puede usarse en investigación académica para detectar patrones de valoración negativa en debates políticos chilenos.
- **Análisis de quejas y comentarios de consumidores**: el corpus incluye quejas de consumidores; el modelo puede etiquetar la valoración en estos textos para entender la percepción de productos o servicios.
- **Comparación de etiquetas entre anotadores humanos**: su rendimiento se ha medido contra el acuerdo experto (0.600), lo que lo convierte en una herramienta para estudiar la variabilidad de la anotación en esta tarea.
- **Entrenamiento de modelos de PLN para español chileno**: puede servir como componente de un pipeline más amplio de análisis de sentimiento o de actitud, aunque no sustituye a un clasificador de sentimiento general.

## Benchmarks y rendimiento

Los resultados publicados por el autor se corresponden con la partición de test del *Chilean Spanish Attitude Corpus* (382 textos) y se miden a nivel de *span* estricto, es decir, una predicción solo se considera correcta si coinciden la clase y ambos límites del *span* con la anotación de oro.

| Métrica | Valor |
|---|---|
| Micro F1 (span estricto) | **0.3558** |
| Micro precisión (span estricto) | 0.4347 |
| Micro recall (span estricto) | 0.3012 |

El acuerdo de *span* entre anotólogos expertos en la misma tarea es de 0.600, por lo que el modelo queda muy por debajo del nivel humano. El autor también reporta la variabilidad de la receta en tres reentrenamientos con semillas distintas (F1: 0.339, 0.371, 0.356; media ± desviación: 0.356 ± 0.016), aunque el checkpoint liberado corresponde a la semilla 42.

### Resultados por clase

| Etiqueta | Precisión | Recall | F1 | Spans de oro |
|---|---|---|---|---|
| `capacity` | 0.433 | 0.349 | 0.386 | 129 |
| `normality` | 0.333 | 0.119 | 0.176 | 67 |
| `propriety` | 0.452 | 0.434 | 0.442 | 226 |
| `tenacity` | 0.333 | 0.036 | 0.065 | 56 |
| `veracity` | 0.000 | 0.000 | 0.000 | 30 |

## Requisitos de hardware

- **VRAM estimada**: el modelo combina un BiLSTM-CRF con un BERT (TULIO) de tamaño medio; en inferencia, se puede ejecutar con menos de 4 GB de VRAM en una GPU de consumo, aunque el tamaño del repositorio es de 1.9 GB (incluye pesos del modelo).
- **GPU recomendadas**: RTX 3060, RTX 4090 o cualquier GPU con ≥4 GB de VRAM; también es viable la CPU para inferencia por lotes pequeños, dado que el modelo no es muy grande.
- **Compatibilidad con GPU de consumo**: sí, cabe en tarjetas de consumo con 4-8 GB de VRAM.
- **Opciones de despliegue**: el modelo se usa con la librería Flair (`SequenceTagger.load`). No se mencionan integraciones con vLLM, llama.cpp ni Ollama; es un modelo de clasificación de secuencias, no un LLM generativo.
- **Latencia y throughput**: no disponibles en la información publicada.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría (clasificación de *spans* de actitud en español chileno) en la información proporcionada. No se conocen alternativas públicas que resuelvan exactamente esta tarea con las mismas clases y el mismo marco teórico. Como referencia, el autor reporta el acuerdo entre anotólogos expertos (0.600), que sirve de techo de rendimiento para cualquier modelo en esta tarea.

## Limitaciones y advertencias

- **Sesgos del dominio**: el corpus de entrenamiento se recopiló en torno a episodios de conflicto político en Chile y contiene insultos, discurso de odio y amenazas. El modelo reproducirá esa distribución de lenguaje y puede etiquetar de forma sesgada textos fuera de ese contexto.
- **Riesgo de alucinación**: no aplica como en los LLM generativos, pero sí existe riesgo de etiquetado incorrecto de *spans*; en particular, la clase `veracity` tiene F1 = 0.000, lo que indica que el modelo no es capaz de detectar esa categoría en el test.
- **Limitaciones de contexto**: el modelo opera a nivel de oración o texto corto; no se especifica una ventana de contexto, pero es un modelo de clasificación de secuencias, no un modelo de largo contexto.
- **Restricciones de licencia**: la licencia CC-BY-4.0 permite uso comercial con atribución, pero el corpus de entrenamiento es *gated* y restringido a investigación no comercial. Los pesos liberados no redistribuyen los textos, pero el uso del modelo debe cumplir con la licencia del corpus si se accede a él.
- **Adecuación para producción**: no es apto para moderación de usuarios, perfilado de personas ni decisiones automatizadas sobre individuos. No debe usarse como clasificador de sentimiento general.
- **Advertencia de contenido**: el modelo se entrenó con lenguaje ofensivo y puede reproducir etiquetas sobre texto violento; se recomienda precaución en el manejo de sus salidas.

## Enlaces

- **HuggingFace (modelo)**: https://huggingface.co/jorgeortizfuentes/chilean-spanish-judgment-subtypes-flair-tulio
- **HuggingFace (corpus)**: https://huggingface.co/datasets/jorgeortizfuentes/chilean-spanish-attitude-corpus
- **Modelo base TULIO**: https://huggingface.co/dccuchile/tulio-chilean-spanish-bert
- **Página de proyectos del autor**: https://ortizfuentes.com/projects
- **Perfil de Google Scholar**: https://scholar.google.com/citations?user=jFM6eGIAAAAJ&hl=en
- **Perfil de GitHub**: https://github.com/jorgeortizfuentes/
