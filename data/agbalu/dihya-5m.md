# agbalu/Dihya-5M

## Resumen

Dihya-5M es un clasificador de identificación de lenguas (LID) desarrollado por el proyecto AƔBALU, orientado a distinguir seis variedades bereberes (amazigh) en escritura latina: cabilio (Kabyle), tashelhit, tarifit, tamasheq, tamazight del Atlas Central y shawiya, además de una clase de rechazo explícita para texto no bereber. Con solo 5,09 millones de parámetros, emplea una arquitectura Conv-Transformer a nivel de byte, lo que le permite procesar texto sin depender de tokenizadores de palabras y manejar las variaciones ortográficas propias de estas lenguas.

El modelo es relevante porque las herramientas de identificación de lenguas públicas existentes, como GlotLID y NLLB's lid218e, no tienen etiquetas para tres de estas seis variedades (tarifit, tamazight del Atlas Central y shawiya) y además confunden sistemáticamente las demás, etiquetando como "Kabyle" una gran proporción de texto de otras lenguas hermanas. Dihya-5M ofrece la primera solución que distingue las seis variedades con una precisión del 84,44% sobre el conjunto de prueba, frente al 41,78% de GlotLID y el 28,33% de NLLB. Incluye además un mecanismo de predicción por conjuntos (conformal prediction) para devolver un conjunto de etiquetas en lugar de una sola, lo que es útil en pipelines donde una clasificación errónea silenciosa tiene un coste elevado.

El modelo está disponible bajo licencia Apache-2.0 y se distribuye en formato safetensors, con un peso total de 0,1 GB. No se publican datos sobre la longitud de contexto ni sobre el proceso de entrenamiento más allá del tamaño de los conjuntos de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conv-Transformer a nivel de byte |
| Parametros totales | 5.089.408 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | kab (kabyle), shi (tashelhit), rif (tarifit), taq (tamasheq), tzm (tamazight del Atlas Central), shy (shawiya) en alfabeto latino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Dihya-5M es un modelo Conv-Transformer que opera directamente sobre bytes del texto de entrada, sin tokenización previa a nivel de palabra. Esta arquitectura es adecuada para lenguas con ortografía variable y escasez de recursos, ya que no depende de vocabularios predefinidos y puede capturar patrones morfológicos y fonotácticos a nivel de carácter. El modelo se entrena para clasificar cada secuencia en una de las siete clases (seis lenguas más la clase de rechazo). No se han publicado detalles sobre el número de tokens de entrenamiento, el tamaño del vocabulario de bytes o el procedimiento de entrenamiento (pérdida, optimizador, etc.), pero se conoce que el conjunto de entrenamiento consta de 77.756 frases y el de desarrollo de 4.093. Además, se utiliza un método de predicción conformal por división (split-conformal) que permite devolver un conjunto de etiquetas con una garantía de cobertura, en lugar de una única clase.

## Capacidades

- Identificación de seis variedades bereberes en escritura latina: kabyle, tashelhit, tarifit, tamasheq, tamazight del Atlas Central y shawiya.
- Clasificación con rechazo: distingue entre texto bereber y no bereber mediante la clase `NOT_AMAZIGH`.
- Predicción por conjuntos (split-conformal): permite devolver un conjunto de etiquetas en lugar de una sola, útil en escenarios donde una clasificación errónea silenciosa es más costosa que una respuesta ampliada.
- Procesamiento a nivel de byte: no requiere tokenizadores específicos y es robusto a variaciones ortográficas.
- Capacidad multilingüe dentro del dominio bereber: las seis variedades comparten léxico y ortografía, y el modelo las separa mediante patrones afijales, fonotácticos y clíticos.
- Integración con `transformers` y `torch`: se carga como un modelo estándar de clasificación de texto.

## Casos de uso

- **Filtrado de corpus paralelos**: al construir conjuntos de datos para traducción automática entre variedades bereberes, Dihya-5M puede etiquetar cada frase con su variedad exacta, evitando que se mezclen datos de lenguas hermanas que comparten vocabulario.
- **Limpieza de datasets etiquetados como "Kabyle"**: los datos públicos de Kabyle suelen contener hasta un 90% de texto de otras variedades (según las mediciones del autor). Usar Dihya-5M para filtrar y reclasificar esos corpus permite entrenar modelos de lenguaje o de traducción sobre datos homogéneos.
- **Identificación de lenguas en redes sociales**: al clasificar publicaciones o comentarios en bereber, el modelo puede distinguir entre las variedades y aplicar políticas de moderación o análisis de sentimiento específicas por comunidad.
- **Sistemas de búsqueda y recuperación de información**: indexar documentos en bereber con la variedad correcta facilita búsquedas precisas en bibliotecas digitales o repositorios de textos.
- **Desarrollo de asistentes de voz o texto**: en sistemas de diálogo, el modelo puede detectar la variedad del usuario y adaptar el modelo de lenguaje o el vocabulario de salida.
- **Evaluación de calidad de herramientas de identificación**: Dihya-5M sirve como referencia para medir el rendimiento de otros sistemas LID en el dominio bereber, ya que cubre las seis variedades que otros sistemas no distinguen.

## Benchmarks y rendimiento

Los resultados oficiales publicados en la model card (declarados por el autor) sobre un conjunto de prueba de 1.050 frases (150 por clase) son los siguientes:

| Métrica | Valor |
|---|---|
| Accuracy (7 clases, incluyendo rechazo) | 85,52% |
| Macro-F1 (7 clases) | 0,8562 |
| Accuracy (solo 6 lenguas) | 84,44% |
| Macro-F1 (6 lenguas) | 0,8493 |

Comparación con sistemas públicos de identificación de lenguas (sobre las mismas 900 frases bereberes, excluyendo la clase de rechazo):

| Sistema | Accuracy | Clases que puede nombrar | Macro-F1 sobre esas clases |
|---|---|---|---|
| **Dihya-5M** | **84,44%** | **6 de 6** | 0,8493 |
| GlotLID | 41,78% | 3 de 6 | 0,6837 |
| NLLB `lid218e` | 28,33% | 2 de 6 | 0,6022 |

Nota: la columna de macro-F1 no es comparable entre sistemas porque cada uno la calcula sobre sus propias clases disponibles.

La tasa de confusión hacia la clase "Kabyle" (es decir, la proporción de texto de cada variedad que se etiqueta como Kabyle) es:

| Lengua real | → Kabyle (Dihya) | → Kabyle (GlotLID) | → Kabyle (NLLB) |
|---|---|---|---|
| Tashelhit | 2,0% | 17,3% | 79,3% |
| Tarifit | 6,7% | 90,0% | 80,7% |
| Tamasheq | 7,3% | 0,0% | 6,7% |
| Central Atlas Tamazight | 16,0% | 66,7% | 73,3% |
| Shawiya | 19,3% | 96,0% | 91,3% |

La precisión por clase (7 clases) es:

| Etiqueta | Support | Precision | Recall | F1 |
|---|---|---|---|---|
| `NOT_AMAZIGH` | 150 | 0,949 | 0,987 | 0,967 |
| `taq_Latn` | 150 | 1,000 | 0,847 | 0,917 |
| `rif_Latn` | 150 | 0,916 | 0,873 | 0,894 |
| `shi_Latn` | 150 | 0,811 | 0,973 | 0,885 |
| `shy_Latn` | 150 | 0,936 | 0,687 | 0,792 |
| `tzm_Latn` | 150 | 0,952 | 0,660 | 0,780 |
| `kab_Latn` | 150 | 0,626 | 0,960 | 0,758 |

La precisión para la clase Kabyle es la más baja (0,626), pero el modelo prefiere la sensibilidad (recall 0,960) para no perder texto berebere. La recall para Tamazight y Shawiya (0,660 y 0,687) es la primera cifra publicada para estas lenguas, que no tienen etiqueta en los sistemas públicos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 5,09 millones de parámetros; en FP32 ocupa aproximadamente 20 MB, por lo que cabe en cualquier GPU con más de 256 MB de VRAM (prácticamente cualquier GPU moderna) y también en CPU.
- **GPU recomendada**: ninguna en particular; se puede ejecutar en una CPU sin GPU, en un portátil o en un servidor con recursos mínimos.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo (por ejemplo, una NVIDIA GTX 1060 o superior) es suficiente.
- **Opciones de despliegue**: al ser un modelo de `transformers`, se puede cargar con la librería `transformers` y `torch`. Se puede exportar a ONNX para inferencia en entornos ligeros. No se documenta compatibilidad con vLLM u Ollama (no es un modelo generativo).
- **Latencia**: no se proporcionan datos, pero dado el tamaño y la arquitectura de bytes, se espera una latencia de unos pocos milisegundos por frase en CPU.

## Comparativa con modelos similares

| Sistema | Parámetros | Contexto | Accuracy (6 bereberes) | Licencia | Formato |
|---|---|---|---|---|---|
| **Dihya-5M** | 5,09 M | No disponible | 84,44% | Apache-2.0 | safetensors |
| GlotLID | ~300 M (estimado) | No disponible | 41,78% | Apache-2.0 (probable) | safetensors |
| NLLB `lid218e` | ~200 M (estimado) | No disponible | 28,33% | CC-BY-NC (no comercial) | safetensors |

Dihya-5M es el único que cubre las seis variedades, mientras que GlotLID solo tiene etiquetas para 3 (Kabyle, Tashelhit y Tamasheq) y NLLB para 2 (Kabyle y Tamasheq). La comparativa en términos de accuracy es clara, pero hay que tener en cuenta que GlotLID y NLLB son modelos generales de identificación de cientos de lenguas, mientras que Dihya-5M está especializado exclusivamente en el dominio bereber.

## Limitaciones y advertencias

- **Precisión en Kabyle**: la precisión para la clase Kabyle es 0,626, la más baja de la tabla. En un corpus con mayoría de texto Kabyle (que es el caso típico), la precisión subiría, pero el modelo está calibrado para priorizar la recuperación (recall) y no la precisión. Para un corpus exclusivamente Kabyle, se recomienda tratar la etiqueta `kab_Latn` como un filtro, no como una veredicto.
- **Recuerdo limitado en Tamazight y Shawiya**: solo se recupera el 66% y 68,7% de estas lenguas, respectivamente, con una parte importante de errores hacia Kabyle y Tashelhit. La causa es el escaso número de frases de entrenamiento (447 para Shawiya).
- **Sesgo de dominio**: el modelo se evalúa sobre un conjunto de frases equilibrado por fuente y dominio, pero no se ha probado en contextos muy diferentes (por ejemplo, voz, registros informales o argot).
- **Riesgo de alucinación**: no es un modelo generativo, por lo que no hay riesgo de generar texto falso, pero puede asignar una etiqueta incorrecta con alta confianza, especialmente en frases cortas con léxico compartido.
- **Licencia de datos**: los pesos son Apache-2.0, pero los datos de entrenamiento conservan sus licencias originales. Es necesario revisar las licencias de los corpus utilizados para uso comercial.
- **Sin soporte para otras variedades**: el modelo no distingue otras variedades bereberes como el tifinagh o el árabe marroquí; solo cubre las seis latinas especificadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agbalu/Dihya-5M
- Organización en Hugging Face: https://huggingface.co/agbalu
- Repositorio GitHub del proyecto AGBALU: https://github.com/abderahmane-ai/agbalu
- README del repositorio con detalles del proyecto: https://github.com/abderahmane-ai/agbalu/blob/main/README.md
