# rafmacalaba/gliner_datause_v0

## Resumen

`rafmacalaba/gliner_datause_v0` es un modelo de reconocimiento de entidades nombradas (NER) especializado en la extracción de menciones de uso de datos en artículos de investigación económica. Se trata de un fine-tuning del modelo base `urchade/gliner_large-v2.1`, desarrollado por el usuario `rafmacalaba` con el objetivo de identificar referencias a conjuntos de datos, encuestas, censos o registros dentro de textos académicos. El modelo clasifica cada mención en tres categorías: `NAMED_DATA` (nombre propio o acrónimo de una fuente de datos), `DESCRIPTIVE_DATA` (descripción sin nombre explícito) y `VAGUE_DATA` (referencia genérica sin fuente identificable).

La relevancia de este modelo radica en su aplicación para el análisis bibliométrico y la minería de literatura científica, permitiendo automatizar la detección de qué fuentes de datos se utilizan en estudios económicos. Al estar basado en GLiNER, ofrece capacidades de zero-shot NER con un tamaño relativamente compacto, aunque en este caso se ha ajustado específicamente para el dominio de data-use. El repositorio tiene un tamaño de 1,8 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (basado en transformer encoder, modelo base `urchade/gliner_large-v2.1`) |
| Parametros totales | no disponible (tamaño del repo 1,8 GB, estimación de cientos de millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (corpus de entrenamiento en inglés, no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (formato PyTorch, probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLiNER (Generalist and Lightweight Model for Named Entity Recognition), que utiliza un encoder transformer preentrenado y una cabeza de clasificación de entidades. En este caso, el punto de partida es `urchade/gliner_large-v2.1`, una versión grande del modelo GLiNER. El fine-tuning se realizó sobre el dataset `rafmacalaba/data-use-mentions-v2` en configuración GLiNER, con un corpus que abarca todas las fuentes disponibles. Los hiperparámetros de entrenamiento incluyen 3 épocas, una tasa de aprendizaje de 5e-06, tamaño de lote de 16 y precisión bf16. No se menciona el uso de RLHF ni DPO; se trata de un ajuste supervisado estándar para token classification.

La innovación principal no está en la arquitectura base, sino en la especialización del modelo para un dominio concreto: la detección de menciones de fuentes de datos en textos económicos. El modelo distingue entre referencias explícitas (nombres propios), descripciones implícitas y menciones vagas, lo que requiere un entrenamiento específico con anotaciones detalladas.

## Capacidades

- Extracción de menciones de uso de datos en textos académicos, específicamente en artículos de investigación económica.
- Clasificación de menciones en tres etiquetas: `NAMED_DATA` (nombres propios, títulos o acrónimos de fuentes de datos), `DESCRIPTIVE_DATA` (descripciones sin nombre explícito) y `VAGUE_DATA` (referencias genéricas sin fuente identificable).
- Funciona como un modelo de token classification, asignando etiquetas a secuencias de tokens dentro del texto.
- Al estar basado en GLiNER, hereda capacidades de zero-shot NER, aunque en este caso está especializado para el dominio data-use.
- Soporta inferencia sobre textos largos (limitación de contexto no especificada, pero GLiNER suele manejar secuencias de hasta 512 tokens en su configuración estándar).
- No se reportan capacidades de tool calling, agentes, visión ni audio; es exclusivamente un modelo de NER.

## Casos de uso

- Análisis bibliométrico de fuentes de datos en economía: el modelo puede procesar automáticamente miles de artículos para identificar qué conjuntos de datos se citan, permitiendo estudios de reutilización de datos y mapeo de infraestructuras de investigación.
- Revisión sistemática de literatura: en revisiones que requieren extraer información sobre metodologías y fuentes de datos, el modelo acelera la fase de cribado al localizar menciones de datos en abstracts y textos completos.
- Construcción de bases de datos de investigación: permite crear catálogos estructurados de fuentes de datos utilizadas en un campo específico, clasificándolas en nombradas, descriptivas o vagas.
- Detección de lagunas en la documentación de datos: en repositorios institucionales, el modelo puede identificar artículos que mencionan datos de forma vaga sin especificar la fuente, señalando posibles problemas de reproducibilidad.
- Monitorización de tendencias en el uso de datos: al analizar un corpus temporal de publicaciones, se puede rastrear la evolución en la adopción de ciertos conjuntos de datos o encuestas.
- Integración en pipelines de procesamiento de texto académico: el modelo puede combinarse con otros sistemas de extracción de información para enriquecer metadatos de publicaciones, por ejemplo, en plataformas como OpenAlex o Semantic Scholar.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación sobre un conjunto de validación (holdout). La siguiente tabla resume las métricas globales a diferentes umbrales de decisión:

| Umbral | Precisión | Recall | F0.5 | F1 |
|--------|-----------|--------|------|------|
| 0.10   | 0.4810    | 0.9856 | 0.5358 | 0.6464 |
| 0.20   | 0.5478    | 0.9809 | 0.6009 | 0.7030 |
| 0.30   | 0.5967    | 0.9754 | 0.6469 | 0.7404 |
| 0.40   | 0.6416    | 0.9661 | 0.6878 | 0.7711 |
| 0.50   | 0.6984    | 0.9415 | 0.7364 | 0.8019 |
| 0.60   | 0.7732    | 0.8618 | 0.7895 | 0.8151 |
| 0.70   | 0.8588    | 0.6340 | 0.8019 | 0.7295 |

El mejor F0.5 es 0.8019 con umbral 0.7, y el mejor F1 es 0.8151 con umbral 0.6. El desglose por etiquetas (a umbral 0.7) muestra:

| Etiqueta | Precisión | Recall | F0.5 | F1 |
|----------|-----------|--------|------|------|
| NAMED_DATA | 0.8303 | 0.7211 | 0.8059 | 0.7718 |
| DESCRIPTIVE_DATA | 0.8167 | 0.4660 | 0.7098 | 0.5934 |
| VAGUE_DATA | 0.5038 | 0.5302 | 0.5089 | 0.5167 |

Se observa un rendimiento mucho más bajo en la categoría `VAGUE_DATA`, lo que indica dificultades para distinguir menciones genéricas. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación del modelo. Dado que el repositorio ocupa 1,8 GB, se puede estimar que el modelo tiene cientos de millones de parámetros (probablemente alrededor de 400-500 millones en fp32, o ~200-300 millones en bf16). Para inferencia en GPU, se necesitaría al menos 4-8 GB de VRAM en función de la precisión y el tamaño de lote. En CPU, la inferencia sería lenta pero posible para textos cortos. No se mencionan opciones de despliegue específicas, pero al ser un modelo GLiNER, es compatible con las librerías estándar de Hugging Face Transformers y con el framework GLiNER. Se podría servir con vLLM o TGI si se convierte a un formato compatible, aunque no está documentado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base `urchade/gliner_large-v2.1` es un modelo GLiNER generalista, mientras que `rafmacalaba/gliner_datause_v0` es un fine-tuning especializado. Existe otro modelo similar en Hugging Face, `ai4data/gliner_datause`, que también aborda la extracción de menciones de uso de datos, pero no se han publicado comparativas entre ambos. La siguiente tabla resume las diferencias conocidas:

| Modelo | Base | Especialización | Licencia | Tamaño repo |
|--------|------|-----------------|----------|-------------|
| `rafmacalaba/gliner_datause_v0` | gliner_large-v2.1 | Data-use mentions | Apache 2.0 | 1,8 GB |
| `ai4data/gliner_datause` | no disponible | Data-use mentions | Apache 2.0 | no disponible |
| `urchade/gliner_large-v2.1` | - | NER generalista | Apache 2.0 | no disponible |

No se puede realizar una comparación cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado específicamente en un corpus de artículos de investigación económica, por lo que su rendimiento en otros dominios (medicina, derecho, etc.) puede ser significativamente inferior.
- La categoría `VAGUE_DATA` presenta métricas bajas (F1 de 0.5167), lo que indica que el modelo tiene dificultades para distinguir menciones genéricas de otras entidades.
- El recall global a umbrales altos (0.7) es solo de 0.6340, lo que significa que se pierden muchas menciones si se prioriza la precisión. Es necesario ajustar el umbral según la aplicación.
- No se especifican los idiomas soportados; aunque el corpus parece estar en inglés, no hay confirmación oficial.
- El modelo no ha sido evaluado en tareas fuera de la extracción de menciones de datos; no debe usarse para otros tipos de NER sin reentrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del dataset de entrenamiento para posibles restricciones de los datos subyacentes.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente o poco utilizado; no hay evidencia de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/gliner_datause_v0
- Modelo base: https://huggingface.co/urchade/gliner_large-v2.1
- Dataset de entrenamiento: https://huggingface.co/rafmacalaba/data-use-mentions-v2 (referenciado en la model card, no se proporciona URL directa)
- Repositorio de GLiNER: https://github.com/urchade/GLiNER
- Modelo similar: https://huggingface.co/ai4data/gliner_datause
