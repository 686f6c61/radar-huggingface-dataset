# djnsfull/sentiment-socmed-1.0

## Resumen

`sentiment-socmed-1.0` es un modelo de clasificación de texto en indonesio publicado en Hugging Face por el usuario djnsfull. Es un fine-tune del modelo `indobenchmark/indobert-large-p2` —un encoder BERT de tipo large— al que se ha añadido una cabeza de clasificación para análisis de sentimiento y clasificación de contenido de redes sociales, según reflejan las etiquetas `sentiment-analysis` y `socmed-classification` de la model card. El checkpoint contiene 335.144.963 parámetros y el repositorio ocupa 1,3 GB en formato safetensors.

El modelo resuelve la asignación de una etiqueta de sentimiento a textos cortos en indonesio, un caso de uso habitual en monitorización de marca, atención al cliente y análisis de opinión pública. Su interés práctico radica en el tamaño: al ser un encoder de ~335 M de parámetros, la inferencia es barata en CPU y en GPU de consumo, y la licencia Apache 2.0 permite uso comercial y modificación sin restricciones de acceso.

Ahora bien, la documentación publicada es mínima: la model card solo declara licencia, idioma, modelo base y pipeline, sin métricas de evaluación, sin esquema de etiquetas, sin datos de entrenamiento y sin resultados de benchmarks. El modelo no registra descargas ni likes en el momento de redactar esta ficha, por lo que debe tratarse como un artefacto sin validación pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (modelo base: `indobenchmark/indobert-large-p2`), con cabeza de clasificación de secuencias |
| Parámetros totales | 335.144.963 |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible: solo se publican pesos safetensors; no hay versiones GGUF, GPTQ, AWQ ni ONNX |
| Idiomas soportados | Indonesio (id); no se declara soporte de otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |
| Tarea / pipeline | `text-classification` (análisis de sentimiento en redes sociales) |
| Tamaño del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación (metadatos) | 2026-10-25 |

## Arquitectura y entrenamiento

La arquitectura es un encoder Transformer BERT de escala *large* (~335 M de parámetros) con una cabeza de clasificación sobre la representación del token `[CLS]`. El modelo parte de `indobert-large-p2`, un checkpoint preentrenado para indonesio del proyecto IndoBenchmark, y se ha afinado para la tarea `text-classification` con dominio declarado de redes sociales. La etiqueta `text-embeddings-inference` y `endpoints_compatible` indica compatibilidad con el servidor Text Embeddings Inference de Hugging Face y con Inference Endpoints.

No se documenta ningún detalle del proceso de afinado: ni el volumen de datos, ni la composición del corpus, ni la taxonomía de etiquetas, ni hiperparámetros, ni particiones de entrenamiento/validación. Tampoco se indica si hubo aumento de datos, balanceo de clases o técnicas de calibración. Al ser un modelo encoder-only de clasificación, no se aplican RLHF ni DPO en el sentido habitual de los modelos generativos, pero no se documenta ningún tipo de ajuste posterior. La longitud máxima de secuencia soportada tampoco se especifica en la información disponible.

## Capacidades

- Clasificación de texto para análisis de sentimiento sobre publicaciones y comentarios de redes sociales en indonesio.
- Etiquetado orientado al dominio `socmed` según la propia model card; el esquema concreto de clases no está documentado.
- Inferencia ligera: ~335 M de parámetros permiten ejecución en CPU y GPU de consumo.
- Compatibilidad declarada con Text Embeddings Inference y con Inference Endpoints de Hugging Face.
- Modelo encoder-only: no genera texto, no mantiene conversaciones, no razona de forma multi-paso y no soporta tool calling ni function calling.
- Sin capacidades de visión, audio, agentes ni modo *thinking*.
- Sin soporte multilingüe declarado: únicamente indonesio.

## Casos de uso

- Monitorización de marca en redes sociales: clasificar menciones de la marca en X, Instagram o TikTok en indonesio para agregar el sentimiento diario en un panel de control; el tamaño del modelo permite procesar lotes grandes con coste bajo.
- Triaje de atención al cliente: etiquetar automáticamente quejas, consultas y elogios en la bandeja de entrada para enrutar cada caso al equipo adecuado y priorizar el sentimiento negativo.
- Análisis de opinión pública: seguimiento del tono de conversaciones sobre temas políticos o sociales en indonesio, agregando resultados por franja temporal o por palabra clave.
- Investigación de mercado: procesar reseñas de productos en marketplaces indonesios (Shopee, Tokopedia) para estimar la percepción de una categoría o de un competidor.
- Moderación asistida: priorizar contenido con tono negativo o agresivo para revisión humana; el modelo no sustituye la decisión de moderación, pero reduce el volumen a revisar.
- Etiquetado asistido de datasets: preetiquetar corpus en indonesio para entrenar o evaluar otros clasificadores, con revisión humana posterior para corregir errores.
- Alertas de reputación en tiempo real: integrar el clasificador en un pipeline de streaming para disparar avisos cuando el sentimiento agregado cae por debajo de un umbral.
- Analítica de campañas de marketing: medir la reacción del público indonesio a una campaña comparando el sentimiento antes, durante y después de la publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de accuracy, F1, precision/recall por clase ni matrices de confusión, y tampoco se han encontrado evaluaciones independientes en la búsqueda web realizada. No es posible, por tanto, comparar su rendimiento con el de otros clasificadores de sentimiento en indonesio con datos verificables.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir del número de parámetros, sin incluir activaciones):
  - FP32: ~1,34 GB.
  - FP16/BF16: ~0,67 GB.
  - INT8: ~0,34 GB (requiere cuantización posterior por parte del usuario; no se publican artefactos cuantizados).
  - INT4: ~0,17 GB (igual que el caso anterior).
- En la práctica, con activaciones y *overhead* del runtime, un presupuesto de 1,5-2 GB en FP16 cubre inferencia con lotes pequeños y secuencias cortas; el consumo crece con el tamaño de lote y la longitud de entrada.
- Cabe en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3060, RTX 4060, RTX 4090; también en GPU de datacenter como T4, L4, A10, A100 y H100, donde el modelo queda muy sobredimensionado en memoria.
- Ejecución viable en CPU para volúmenes moderados, con throughput menor.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, Text Embeddings Inference (etiqueta declarada), Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`). No hay artefactos GGUF ni ONNX publicados, por lo que llama.cpp y Ollama requerirían conversión previa por parte del usuario.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| `djnsfull/sentiment-socmed-1.0` | 335.144.963 | no disponible | id | Apache 2.0 | Fine-tune de clasificación; sin métricas ni esquema de etiquetas documentados |
| `indobenchmark/indobert-large-p2` (modelo base) | ~335 M (el fine-tune conserva la arquitectura; cifra exacta del base no disponible) | no disponible | id | no disponible en la información proporcionada | Checkpoint preentrenado de IndoBERT; no es un clasificador de sentimiento por sí mismo |
| Otras alternativas de análisis de sentimiento en indonesio | no disponible | no disponible | id | no disponible | No se dispone de datos verificables en la información proporcionada para establecer una comparación |

No se han encontrado en la información disponible resultados de benchmarks que permitan comparar este modelo con alternativas de la misma categoría (por ejemplo, clasificadores basados en IndoBERT base o en modelos multilingües). Cualquier comparación de rendimiento sería especulativa.

## Limitaciones y advertencias

- Ausencia total de métricas publicadas: no se puede verificar accuracy, F1 ni calibración antes de desplegarlo en producción.
- El esquema de etiquetas no está documentado: se desconoce el número de clases, su orden y el mapeo `id2label`, lo que puede provocar interpretaciones erróneas de la salida.
- Cobertura lingüística limitada al indonesio; textos con code-switching (indonesio-inglés, indonesio-javanés) o argot muy específico pueden degradar el rendimiento.
- Sesgos heredados del corpus de preentrenamiento de IndoBERT y del corpus de afinado, ninguno de los cuales está documentado; pueden aparecer sesgos de dominio, demográficos o de registro lingüístico.
- Riesgo de clasificación errónea: al ser un modelo discriminativo no genera texto, pero sí puede asignar etiquetas incorrectas con alta confianza; al desconocerse la calibración, no se recomienda usar las probabilidades como umbrales críticos sin validación propia.
- Longitud máxima de entrada no documentada: truncar sin criterio puede eliminar la parte del texto que determina el sentimiento.
- Falta de validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar su comportamiento.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución conservando el aviso de licencia; conviene verificar los términos del modelo base, no incluidos en la información disponible.
- Sin información sobre datos de entrenamiento: no se puede evaluar el riesgo de contaminación, desbalance de clases ni solapamiento con conjuntos de evaluación propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djnsfull/sentiment-socmed-1.0
- Modelo base: https://huggingface.co/indobenchmark/indobert-large-p2
- Perfil del autor en Hugging Face: https://huggingface.co/djnsfull/models
- Enlaces relacionados encontrados en la búsqueda web (no específicos de este modelo):
  - sentiment.ai (repositorio): https://github.com/BenWiseman/sentiment.ai
  - sentiment.ai (documentación): https://benwiseman.github.io/sentiment.ai/
  - Proyecto Social Media Sentiment Analysis: https://github.com/gauthamvenkatesh/Social-Media-Sentiment-Analysis
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
