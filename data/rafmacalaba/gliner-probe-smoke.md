# rafmacalaba/gliner-probe-smoke

## Resumen

`rafmacalaba/gliner-probe-smoke` es un modelo de reconocimiento de entidades nombradas (NER) especializado en la extracción de menciones a fuentes de datos (conjuntos de datos, encuestas, censos, registros) en artículos de investigación económica. Se trata de un fine-tune del modelo base `urchade/gliner_large-v2.1`, desarrollado por Rafael Macalaba, ingeniero de IA en el Banco Mundial, con el objetivo de facilitar el análisis automatizado de la reutilización de datos en la literatura académica.

El modelo clasifica tres tipos de entidades: `NAMED_DATA` (nombre propio o acrónimo de una fuente concreta), `DESCRIPTIVE_DATA` (fuente descrita con palabras pero sin nombre) y `VAGUE_DATA` (mención genérica sin fuente identificable). Está diseñado para su uso con la librería GLiNER, que permite extracción de entidades basada en esquemas flexibles definidos por el usuario. Su relevancia radica en la creciente necesidad de rastrear el uso de datos en la investigación económica, un campo donde la trazabilidad de las fuentes es crítica para la reproducibilidad.

El repositorio tiene un tamaño de 1,8 GB y se distribuye bajo licencia Apache 2.0. No se han publicado detalles sobre el número de parámetros, la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (fine-tune de `urchade/gliner_large-v2.1`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,8 GB, libreria gliner) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLiNER (Generalist and Lightweight Model for Named Entity Recognition), que emplea un codificador bidireccional de tipo transformer para representar tanto el texto como las etiquetas definidas por el usuario, permitiendo la extracción de entidades sin necesidad de un vocabulario fijo. En este caso, el modelo base es `urchade/gliner_large-v2.1`, una versión grande de GLiNER entrenada para tareas NER generalistas.

El fine-tune se realizó sobre el dataset `rafmacalaba/usage-sensitivity-probe` (configuración gliner), con el corpus completo. Los hiperparámetros de entrenamiento son: 1 época, tasa de aprendizaje de 5e-06, tamaño de lote de 16 y precisión bf16. No se especifica si se utilizaron técnicas de alineación como RLHF o DPO; el entrenamiento es un fine-tune supervisado estándar para clasificación de tokens.

## Capacidades

- Extracción de menciones a fuentes de datos en textos académicos de economía, con tres niveles de granularidad: nombre propio, descripción o mención vaga.
- Integración con la librería GLiNER, que permite definir etiquetas personalizadas en tiempo de inferencia sin reentrenar el modelo.
- Clasificación de tokens a nivel de secuencia, adecuada para documentos largos como papers de investigación.
- Capacidad multilingüe heredada del modelo base, aunque no se han publicado datos específicos sobre el rendimiento en otros idiomas.
- No se ha documentado soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Análisis bibliométrico de reutilización de datos: el modelo puede procesar automáticamente miles de artículos de economía para identificar qué conjuntos de datos se mencionan, permitiendo estudios de impacto y trazabilidad de fuentes.
- Sistemas de recomendación de datos: al extraer menciones a datasets en papers, se puede construir un grafo de relaciones entre publicaciones y fuentes de datos, útil para plataformas de descubrimiento científico.
- Verificación de reproducibilidad: los editores de revistas pueden usar el modelo para comprobar si los autores citan correctamente las fuentes de datos utilizadas en sus investigaciones.
- Monitoreo de políticas públicas: en informes de organismos como el Banco Mundial, el modelo puede identificar qué encuestas o registros administrativos se utilizan, facilitando el seguimiento de la evidencia en la toma de decisiones.
- Construcción de bases de datos de metadatos: el modelo puede alimentar catálogos automáticos de datasets mencionados en la literatura, con su tipo de mención (nombre, descripción o vaga).
- Análisis de tendencias en investigación: los resultados de extracción pueden agregarse por año, institución o área temática para detectar qué fuentes de datos ganan o pierden popularidad.

## Benchmarks y rendimiento

La model card incluye una evaluación sobre un conjunto de validación (holdout) con 64 ejemplos y 40 spans. Los resultados se presentan para diferentes umbrales de confianza:

| Umbral | Precision | Recall | F0.5 | F1 |
|---|---|---|---|---|
| 0.10 | 0.0400 | 0.9000 | 0.0494 | 0.0765 |
| 0.20 | 0.0690 | 0.8250 | 0.0845 | 0.1274 |
| 0.30 | 0.1066 | 0.7250 | 0.1285 | 0.1859 |
| 0.40 | 0.1341 | 0.5500 | 0.1580 | 0.2157 |
| 0.50 | 0.1758 | 0.4000 | 0.1980 | 0.2443 |
| 0.60 | 0.1463 | 0.1500 | 0.1471 | 0.1481 |
| 0.70 | 0.1429 | 0.0750 | 0.1210 | 0.0984 |

El mejor F0.5 es 0.1980 y el mejor F1 es 0.2443, ambos con umbral 0.5. El desglose por etiqueta muestra que `NAMED_DATA` alcanza F1 de 0.1765 (umbral 0.6), `DESCRIPTIVE_DATA` F1 de 0.0260 (umbral 0.3) y `VAGUE_DATA` F1 de 0.1277 (umbral 0.5). No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 1,8 GB, lo que sugiere que el modelo puede cargarse en GPUs con al menos 4 GB de VRAM en precisión fp16, aunque no se especifica el número exacto de parámetros.
- Dado que se basa en GLiNER large, es probable que requiera una GPU de gama media o alta (por ejemplo, RTX 3060 o superior) para inferencia en tiempo real.
- Para procesamiento por lotes de documentos largos, se recomienda una GPU con 8 GB o más de VRAM.
- Opciones de despliegue: la librería GLiNER es compatible con PyTorch y puede ejecutarse en CPU, aunque con mayor latencia. No se menciona soporte para vLLM, llama.cpp u Ollama.
- No se han publicado datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El propio autor ha publicado variantes similares en Hugging Face (`rafmacalaba/gliner_datause_smoke` y `rafmacalaba/gliner2_datause_smoke`), que probablemente difieren en la versión de GLiNER o en el dataset de entrenamiento, pero no se han documentado diferencias concretas. El modelo base `urchade/gliner_large-v2.1` es el punto de partida, pero no se han publicado métricas comparativas entre el fine-tune y el base.

## Limitaciones y advertencias

- Los resultados de evaluación muestran una precisión muy baja (0.1758 a umbral 0.5), lo que indica un alto número de falsos positivos. El modelo no es adecuado para producción sin un ajuste adicional del umbral o un post-procesamiento riguroso.
- El rendimiento por etiqueta es muy desigual: `DESCRIPTIVE_DATA` tiene un F1 de solo 0.0260, lo que sugiere que el modelo apenas detecta este tipo de menciones.
- El conjunto de evaluación es muy pequeño (64 ejemplos, 40 spans), por lo que las métricas tienen una alta varianza y no son estadísticamente robustas.
- No se ha documentado el comportamiento en dominios fuera de la economía ni en idiomas distintos del inglés (aunque el modelo base es multilingüe).
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y no se han publicado detalles sobre sesgos o alucinaciones.
- El modelo está pensado para investigación y análisis de textos académicos; su uso en otros contextos (por ejemplo, documentos legales o médicos) requeriría una evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/gliner-probe-smoke
- Modelo base: https://huggingface.co/urchade/gliner_large-v2.1
- Dataset de entrenamiento: https://huggingface.co/rafmacalaba/usage-sensitivity-probe
- Perfil del autor en GitHub: https://github.com/rafmacalaba
- Repositorio GLiNER2 (referencia de la librería): https://github.com/fastino-ai/GLiNER2
