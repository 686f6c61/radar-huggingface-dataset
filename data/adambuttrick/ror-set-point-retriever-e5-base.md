# adambuttrick/ror-set-point-retriever-e5-base

## Resumen

`ror-set-point-retriever-e5-base` es un modelo de recuperación (retriever) de frases especializado en el dominio de afiliaciones institucionales. Lo desarrolla adambuttrick como primera etapa de un pipeline de *set point matching* contra el Research Organization Registry (ROR), un registro abierto con 143.284 organizaciones de investigación. El problema que resuelve es el de la desambiguación de afiliaciones: dada una cadena como "Dept. of Physics, University of Tokyo, Japan", el modelo debe encontrar los registros ROR candidatos que esa cadena menciona, antes de que un segundo modelo (el *set model*) seleccione los definitivos.

Técnicamente es un *dual encoder* construido sobre `intfloat/multilingual-e5-base` (arquitectura XLM-RoBERTa), con 278 millones de parámetros, pesos en fp16 y pooling de media. Codifica la cadena de afiliación como vector de consulta (prompt `"query: "`) y el texto de cada registro ROR como vector de pasaje (prompt `"passage: "`), de modo que el producto escalar entre ambos ordena los candidatos. Los vectores de los 143.284 registros se precalculan una sola vez y se reutilizan para todas las consultas.

Su relevancia actual radica en el enfoque de destilación: el modelo aprende de los juicios de un modelo de decisión de pesos abiertos (StartLux-Decision v1.1 27B Instant), no de etiquetas humanas directas, combinando datos del profesor, datos etiquetados y datos sintéticos en escrituras no latinas. La licencia MIT y el formato sentence-transformers lo hacen directamente desplegable en pipelines de *entity linking* bibliográfico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (dual encoder, transformer), mean pooling |
| Parámetros totales | 278.043.648 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens en consulta; 128 tokens en pasaje (96 tokens en entrenamiento para cadenas) |
| Tipos de cuantización | no disponible (pesos publicados en fp16) |
| Idiomas soportados | no disponible (el modelo base es multilingüe; la model card no detalla la cobertura) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería sentence-transformers) |

## Arquitectura y entrenamiento

El modelo es un *dual encoder* simétrico con un único codificador compartido y *mean pooling* sobre la secuencia. La dimensión de salida es 1 según la model card (dato que conviene verificar contra los pesos, dado que e5-base produce habitualmente vectores de 768 dimensiones). Se entrenó con pérdida InfoNCE con temperatura 0,02 sobre todos los registros del lote, con lotes de 128 cadenas, cada una con 1 positivo y 3 negativos duros. Un solo epoch de 2.689 pasos, AdamW con learning rate 2e-5, weight decay 0,01, warm-up lineal del 5 % y decaimiento lineal posterior, precisión bf16 y clipping de gradiente 1,0.

Los datos de entrenamiento suman 344.245 filas y provienen íntegramente del dataset `adambuttrick/ror-set-point-matching-train-validation-test`, en tres bloques: juicios del profesor (158.183 filas de 176.551 cadenas, con negativos duros tomados de registros con p < 0,1), datos etiquetados de instituciones no vistas (49.878 filas, cada enlace usado 3 veces, negativos duros del top 10 léxico) y datos sintéticos no latinos (136.184 filas, con negativos minados mediante un primer retriever entrenado sin sintéticos que conserva el top 64 y filtra etiquetas, registros relacionados y candidatos con puntuación ≥ 0,95 × la del registro fuente). Se excluyeron explícitamente las cadenas que el profesor puntuó con p ≥ 0,5 para un registro de *held-out*, garantizando que ninguna fila de entrenamiento tenga un registro reservado como positivo. El profesor calibró sus probabilidades mediante *Platt scaling* sobre 615.010 pares etiquetados.

## Capacidades

- Generación de embeddings de frases para recuperación densa (*dense retrieval*) mediante similitud de producto escalar.
- Codificación asimétrica consulta/pasaje con prompts `"query: "` y `"passage: "`.
- Recuperación de candidatos sobre un corpus de 143.284 registros ROR.
- Capacidad multilingüe heredada del modelo base `multilingual-e5-base`.
- Integración con `sentence-transformers` y con Text Embeddings Inference (tag `text-embeddings-inference` y `endpoints_compatible`).
- Soporte de *hard negatives* en entrenamiento, lo que mejora la discriminación entre organizaciones con nombres similares.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento: es exclusivamente un codificador de embeddings.

## Casos de uso

- Desambiguación de afiliaciones en bases bibliográficas: dado el campo de afiliación de un artículo (OpenAlex, Crossref, Scopus), el modelo genera el vector de consulta y recupera el top 32 de registros ROR por producto escalar, que luego pasa al *set model* para la selección final.
- Normalización de metadatos de publicación científica: en pipelines de ingestión, permite mapear cadenas de afiliación heterogéneas a identificadores ROR estables, mejorando la trazabilidad institucional.
- Enriquecimiento de repositorios institucionales: los vectores de los 143.284 registros se precalculan una vez, de modo que el coste por consulta se reduce a una codificación de 512 tokens y una búsqueda de similitud.
- Construcción de índices de colaboración institucional: al resolver afiliaciones a ROR de forma consistente, se pueden agregar coautorías y producir grafos de colaboración entre organizaciones.
- Deduplicación y control de calidad de registros: el mismo mecanismo de recuperación sirve para detectar afiliaciones mal formadas o ambiguas antes de su publicación.
- Investigación en *entity linking*: el modelo y su variante `-no-synthetic` permiten estudiar el efecto de los datos sintéticos en escrituras no latinas sobre la calidad de la recuperación.
- Búsqueda de organizaciones por texto libre: cualquier aplicación que necesite resolver un nombre de institución a un identificador ROR puede usar el retriever como primera etapa de un sistema de búsqueda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una sección de evaluación y una comparación con la variante `ror-set-point-retriever-e5-base-openalex-jev-distill`, pero los valores numéricos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp16 (278 M de parámetros) para los pesos; hay que sumar el espacio de los vectores de registro, que para 143.284 registros a 768 dimensiones en fp32 ocupa unos 0,44 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; A100, H100, L4, T4 y RTX 4090 funcionan sin problema.
- Cabe en GPU de consumo: sí, en GTX 1660, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `sentence-transformers`, Text Embeddings Inference (TGI), y cualquier servidor compatible con endpoints de embeddings; también es viable exportar a ONNX.
- Latencia y throughput: no disponibles en la información proporcionada. El coste dominante en producción es la codificación de consultas de hasta 512 tokens; la codificación del corpus es un proceso por lotes que se ejecuta una sola vez.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `adambuttrick/ror-set-point-retriever-e5-base` | 278 M | 512 tokens (consulta) / 128 (pasaje) | Afiliaciones ROR | MIT | Hugging Face |
| `adambuttrick/ror-set-point-retriever-e5-base-no-synthetic` | 278 M | 512 / 128 | Afiliaciones ROR | MIT | Hugging Face |
| `adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill` | 278 M | no disponible | Afiliaciones ROR | MIT | Hugging Face |
| `intfloat/multilingual-e5-base` | 278 M | 512 tokens | Propósito general multilingüe | MIT | Hugging Face |

Las tres variantes comparten arquitectura y tamaño; difieren en los datos de entrenamiento (sin sintéticos, con juicios de Jev, o con juicios de StartLux). El modelo base `multilingual-e5-base` es la alternativa genérica, pero carece del ajuste específico al vocabulario y a las particularidades de las cadenas de afiliación.

## Limitaciones y advertencias

- Es un retriever, no un clasificador: devuelve candidatos ordenados, no una decisión final. Requiere el *set model* para la selección definitiva.
- El modelo se entrenó con juicios de un modelo profesor (StartLux-Decision v1.1 27B Instant), por lo que hereda sus sesgos y errores de calibración.
- La cobertura idiomática no está documentada; aunque el modelo base es multilingüe, el ajuste se hizo sobre datos cuyo reparto por idioma no se especifica.
- Los datos sintéticos cubren escrituras no latinas, pero se excluyeron las cadenas que nombran registros reservados, lo que puede dejar huecos en la cobertura de ciertas instituciones.
- Riesgo de alucinación de candidatos: el producto escalar siempre devuelve un top 32, incluso cuando la cadena no corresponde a ninguna organización del registro; es responsabilidad del *set model* descartar los falsos positivos.
- La licencia MIT permite uso comercial sin restricciones, pero conviene verificar la licencia del corpus ROR subyacente para la redistribución de los vectores precalculados.
- El límite de 128 tokens para los pasajes y de 96 tokens en entrenamiento para las cadenas implica que afiliaciones muy largas o con abundante texto adicional pueden truncarse y perder señal.
- El modelo tiene 270 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base
- Variante sin datos sintéticos: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-no-synthetic
- Variante destilada de Jev: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill
- Modelo de selección (set model): https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-mask
- Dataset de entrenamiento y validación: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test
- Colección ROR set point matching: https://huggingface.co/collections/adambuttrick/ror-set-point-matching-6ada8733c9e6fb018f382d0b
- Código en GitHub: https://github.com/adambuttrick/ror-set-point-matching
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-base
- Modelo profesor: https://huggingface.co/startlux-models/StartLux-Decision-v1.1-27B-Instant
