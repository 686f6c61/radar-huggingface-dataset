# Lmaana/lmaana-2.2

## Resumen

Lmaana 2.2 es un modelo de reconocimiento automático del habla (ASR) publicado por Lmaana en HuggingFace, con identificador `Lmaana/lmaana-2.2`. Está orientado al árabe marroquí (darija) y se distribuye a través de la librería fairseq2, con decodificación CTC según las etiquetas de la ficha. El repositorio ocupa 24,7 GB y el acceso es restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de descargarlo. La ficha se creó el 21 de septiembre de 2026 y se actualizó el mismo día.

El modelo resuelve un problema concreto: la transcripción de voz en una variedad dialectal con pocos recursos, sin ortografía estandarizada y con alta variación regional. Frente a sistemas ASR multilingües genéricos, un modelo específico de darija puede adaptarse mejor al léxico y la fonética local, aunque en este caso los datos publicados no permiten confirmarlo con una comparación directa.

El dato de rendimiento declarado por el autor es un WER de 38,4762 % y un CER de 16,3063 % sobre el split de test de «Dataset13 clean v4». Son resultados no verificados por HuggingFace y medidos sobre un conjunto de evaluación no público, lo que limita su comparabilidad con benchmarks estándar de ASR. No se dispone de información pública sobre el número de parámetros, la arquitectura exacta ni los datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la ficha solo indica fairseq2 y decodificación CTC) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No aplicable en el sentido de ventana de tokens; ventana de audio máxima soportada: no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (etiqueta `ar`); las etiquetas de la ficha indican `darija` y `moroccan-arabic` como variedad objetivo |
| Licencia | `other` (sin texto de licencia especificado en la información disponible) |
| Formato de pesos | No disponible; se distribuye para fairseq2. Tamaño del repositorio: 24,7 GB |
| Autor | Lmaana |
| Libreria | fairseq2 |
| Pipeline | `automatic-speech-recognition` |
| Tarea | ASR con decodificación CTC |
| Dataset de evaluacion declarado | Dataset13 clean v4 (split `test`) |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 |
| Fecha de actualizacion | 2026-09-21 |

## Arquitectura y entrenamiento

La información disponible es muy limitada en este apartado. Las etiquetas de la ficha indican `fairseq2` como librería, `ctc` como mecanismo de decodificación y `omnilingual-asr` como referencia de familia o receta, lo que sugiere que el modelo se apoya en el ecosistema fairseq2 y en un esquema de entrenamiento CTC típico de los sistemas ASR acústicos. No se especifica si la arquitectura es un transformer convolucional, un modelo tipo wav2vec2, un encoder Conformer ni ningún otro detalle de diseño, ni el número de parámetros o capas.

Tampoco hay datos públicos sobre el volumen de audio de entrenamiento, la composición del dataset, el uso de aumentación de datos, la tokenización de salida (caracteres, BPE o unidades subpalabra) ni sobre técnicas de ajuste posteriores como RLHF o DPO (que, por otra parte, no son habituales en ASR). El único conjunto de datos mencionado, «Dataset13 clean v4», aparece como conjunto de evaluación, no como conjunto de entrenamiento. Cualquier afirmación adicional sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Reconocimiento de voz en árabe marroquí (darija) con salida de transcripción de texto, según el pipeline declarado `automatic-speech-recognition`.
- Decodificación CTC, lo que implica un proceso de inferencia acústico sin componente autorregresivo de lenguaje, según las etiquetas de la ficha.
- Integración con el ecosistema fairseq2 para carga de checkpoints e inferencia.
- Idiomas: únicamente árabe (etiqueta `ar`), con foco declarado en la variedad marroquí. No hay indicios de soporte multilingüe amplio más allá de esta etiqueta.
- Capacidades de tool calling / function calling: no disponibles (no aplica a un modelo ASR).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades de visión o audio más allá del reconocimiento de voz: no disponibles.
- Modo de razonamiento o «thinking mode»: no disponible.
- Puntuación, mayúsculas o normalización de la salida: no disponible.
- Manejo de audio de larga duración, diarización de hablantes o marcas de tiempo: no disponible.

## Casos de uso

- Subtitulado de contenido audiovisual en darija: el modelo puede transcribir audio a texto para generar subtítulos de vídeo o televisión. Dado el WER declarado del 38,48 %, el resultado requeriría una fase de corrección humana antes de su publicación.
- Transcripción de archivos de radio y pódcast: útil para digitalizar y hacer buscable contenido hablado en árabe marroquí, alimentando índices de búsqueda a partir del texto generado.
- Análisis de llamadas en centros de contacto: transcripción de conversaciones de atención al cliente en darija para su posterior clasificación de motivos, control de calidad o análisis de sentimiento mediante modelos de texto posteriores.
- Investigación lingüística y creación de corpus: generación de transcripciones preliminares sobre grabaciones de campo que después se anotan manualmente, reduciendo el coste de transcripción de corpus dialectales.
- Accesibilidad: generación de subtítulos automáticos para personas con discapacidad auditiva en contenido en árabe marroquí, siempre con revisión posterior por la tasa de error.
- Preprocesado en pipelines de NLP en árabe dialectal: conversión de audio a texto como primer paso antes de aplicar traducción, resumen o extracción de información sobre la transcripción resultante.
- Anotación asistida (human-in-the-loop): uso del modelo como preanotador para acelerar la creación de nuevos datasets ASR etiquetados de darija, con corrección manual de los segmentos con mayor error.
- Archivado y preservación de patrimonio oral: transcripción de entrevistas, testimonios y material etnográfico en darija para su conservación en formato textual.

## Benchmarks y rendimiento

Resultados declarados por el autor en el `model-index` de la ficha. No están verificados (`verified: false`).

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Automatic Speech Recognition | Dataset13 clean v4 | test | Test WER | 38,4762 |
| Automatic Speech Recognition | Dataset13 clean v4 | test | Test CER | 16,3063 |

No se han publicado en la información disponible resultados en benchmarks estándar de ASR (Common Voice, FLEURS, MMS-lab, etc.) ni comparaciones con otros modelos sobre el mismo conjunto de evaluación. «Dataset13 clean v4» es un conjunto no público según la información disponible, por lo que estos números no son reproducibles ni directamente comparables con los de otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia indirecta, el repositorio ocupa 24,7 GB; si los pesos se cargan en memoria sin cuantizar, se necesitaría un ordenador con al menos ~25 GB de memoria de GPU (o reparto entre varias GPU), sin contar activaciones y buffers de decodificación. Es una estimación derivada del tamaño del repositorio, no un dato confirmado.
- GPU recomendadas: no disponible en la ficha. Por tamaño del repositorio, encajarían GPU de 40 GB o 80 GB (A100, H100) en una sola unidad, o varias GPU de 24 GB (RTX 3090/4090, L4, A10G) con reparto de modelo.
- ¿Cabe en GPU de consumo? No confirmado. Con 24 GB de VRAM (RTX 3090, RTX 4090) podría ser viable si el checkpoint final es menor que el tamaño total del repositorio o si se aplica cuantización; no hay datos publicados al respecto.
- Opciones de despliegue: fairseq2 es la vía indicada por la librería del modelo. vLLM, llama.cpp, Ollama y TGI no aplican a un modelo ASR acústico y no hay evidencia de soporte. No se documenta exportación a ONNX ni a formatos GGUF.
- Latencia y throughput estimados: no disponible.
- Requisito de acceso: el repositorio es gated, por lo que es necesario disponer de cuenta en HuggingFace y aceptar las condiciones del autor antes de la descarga.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Lmaana 2.2 | ASR (fairseq2, CTC) | No disponible | Árabe (darija) | `other` | HuggingFace, acceso restringido | WER 38,48 / CER 16,31 en Dataset13 clean v4 (no verificado) |
| OpenAI Whisper large-v3 | ASR seq2seq | 1,55 B (dato público de su ficha) | Multilingüe (~99 idiomas, incluye árabe) | MIT | Abierta, sin gating | Cubre árabe estándar y variantes dialectales, sin ajuste específico de darija; WER en darija no disponible en la información proporcionada |
| Meta MMS (wav2vec2) | ASR (CTC) | Hasta 1 B según variante | Más de 1000 idiomas | CC-BY-NC 4.0 (uso no comercial) | Abierta | Restricción de uso comercial |
| Meta Omnilingual ASR | ASR (fairseq2, CTC) | No disponible | Multilingüe | No disponible en la información proporcionada | Abierta | Familia referenciada en las etiquetas de lmaana-2.2; comparación cuantitativa no disponible |

No se dispone de resultados de WER comparables sobre «Dataset13 clean v4» para ninguno de los modelos alternativos, por lo que la comparación de rendimiento con Lmaana 2.2 no puede establecerse con los datos disponibles.

## Limitaciones y advertencias

- Tasa de error elevada: el WER declarado del 38,48 % implica que aproximadamente una de cada tres palabras se transcribe incorrectamente. No es adecuado para producción sin revisión humana.
- Resultados no verificados: el `model-index` marca los resultados como `verified: false`, es decir, son cifras aportadas por el autor y no han sido validadas por HuggingFace ni por terceros.
- Conjunto de evaluación no público: «Dataset13 clean v4» no es un benchmark estándar, lo que impide reproducir los números o compararlos con otros sistemas.
- Posible sesgo de condiciones limpias: el propio nombre del split («clean») sugiere evaluación sobre audio en buenas condiciones; el rendimiento en audio con ruido, solapamiento de hablantes, acentos regionales o canales telefónicos podría ser inferior. No hay datos que confirmen o cuantifiquen este extremo.
- Licencia ambigua: la licencia figura como `other` sin texto especificado en la información disponible, lo que supone un riesgo legal para uso comercial. Es imprescindible revisar las condiciones del repositorio antes de cualquier despliegue productivo.
- Acceso restringido: el modelo es gated y requiere aceptar condiciones; esto puede limitar su uso en entornos automatizados o de investigación con requisitos de reproducibilidad.
- Cobertura de idioma limitada: solo árabe (darija). No hay soporte documentado de otras variedades del árabe ni de otros idiomas.
- Normalización ortográfica: el darija no tiene una ortografía estandarizada, lo que genera variabilidad en las transcripciones de referencia y puede inflar las métricas de WER/CER con independencia de la calidad acústica del modelo.
- Sesgos no documentados: no hay información sobre la distribución del audio de entrenamiento (regiones, género, edad, registro), por lo que no puede evaluarse el sesgo por subgrupo.
- Alucinación y errores típicos de ASR: no se documentan tasas de inserción, sustitución u omisión, ni comportamiento en silencios o segmentos sin voz.
- Restricciones técnicas no documentadas: se desconocen la duración máxima de audio soportada, la necesidad de segmentación previa, el formato de entrada de audio exigido y el rendimiento con vocabulario específico (nombres propios, términos técnicos, code-switching con francés o español).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lmaana/lmaana-2.2
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada. Los resultados devueltos por el buscador no guardan relación con el modelo.
