# mradermacher/OneDecision-VisionGuard-4B-SFT-GGUF

## Resumen

OneDecision-VisionGuard-4B-SFT-GGUF es la versión cuantizada en formato GGUF del modelo prithivMLmods/OneDecision-VisionGuard-4B-SFT, un clasificador multimodal de seguridad de contenido de 4,2 mil millones de parámetros. La cuantización la publica mradermacher, un autor conocido en HuggingFace por generar versiones GGUF de modelos abiertos para su ejecución local con llama.cpp y derivados. El modelo original se entrena mediante SFT (supervised fine-tuning) sobre el dataset prithivMLmods/ImageShield-OneDecision-Classification y está orientado a tareas de guardrail: decidir si una imagen, un texto o una combinación de ambos infringe una política de contenido.

El problema que resuelve es el filtrado de contenido visual y multimodal en plataformas que reciben imágenes generadas o subidas por usuarios. Frente a clasificadores binarios tradicionales, este modelo produce salidas estructuradas en JSON, lo que facilita su integración como componente de decisión dentro de pipelines de moderación automatizada. Su tamaño de 4B lo sitúa en un rango que permite despliegue local o en GPUs de gama media, algo relevante para equipos que necesitan mantener los datos de moderación dentro de su propia infraestructura.

La relevancia actual del modelo reside en tres factores: la licencia Apache 2.0, que permite uso comercial sin restricciones adicionales; la disponibilidad de cuantizaciones desde 2,0 GB (Q2_K) hasta 8,5 GB (f16), que cubren desde GPUs de 4-6 GB hasta estaciones de trabajo; y la inclusión de ficheros mmproj específicos para el proyector multimodal, imprescindible para procesar imágenes. El modelo declara únicamente inglés como idioma soportado y no publica resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) con proyector visual mmproj; detalles internos no disponibles |
| Parámetros totales | 4.205.751.296 (4,2 B) |
| Parámetros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (más ficheros mmproj en GGUF para el componente multimodal) |
| Modelo base | prithivMLmods/OneDecision-VisionGuard-4B-SFT |
| Dataset de entrenamiento | prithivMLmods/ImageShield-OneDecision-Classification |
| Pipeline declarado | image-classification |
| Tamaño del repositorio | 39,9 GB (incluye todas las cuantizaciones) |
| Tipo de ajuste | SFT (supervised fine-tuning) |
| Cuantizado por | mradermacher (cuantización estática, no imatrix) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de 4,2 B de parámetros que combina un codificador visual con un decodificador de lenguaje, unidos mediante un proyector (mmproj) que traduce las representaciones visuales al espacio de embeddings del modelo de texto. La información disponible no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el codificador visual empleado, por lo que estos datos deben considerarse no disponibles. En el repositorio GGUF se distribuyen dos versiones del proyector multimodal (mmproj-Q8_0 de 0,5 GB y mmproj-f16 de 0,8 GB), lo que confirma que el pipeline de inferencia requiere cargar tanto los pesos del modelo como el proyector para poder procesar imágenes.

El entrenamiento se realizó mediante SFT sobre el dataset ImageShield-OneDecision-Classification, orientado a la clasificación de contenido y a la generación de decisiones de seguridad en formato JSON. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas adicionales de RLHF, DPO o preferencias. La cuantización publicada por mradermacher es de tipo estático: el propio autor indica que no hay cuantizaciones ponderadas ni imatrix disponibles en el momento de la publicación, aunque podrían solicitarse mediante discusión en la comunidad.

## Capacidades

- Clasificación de imágenes y contenido multimodal con fines de seguridad (detección de material no apto, violento o que infringe políticas).
- Generación de salidas estructuradas en JSON, lo que permite consumir el resultado de forma programática en pipelines automatizados.
- Procesamiento de entradas combinadas de texto e imagen gracias al proyector mmproj incluido en el repositorio.
- Actuación como guardrail o filtro previo (pre-screening) antes de que otro modelo generativo procese la entrada del usuario.
- Modelo declarado como "uncensored", es decir, entrenado para no rechazar sistemáticamente el análisis de contenido sensible cuando la tarea es precisamente clasificarlo.
- Ejecución local mediante llama.cpp y herramientas compatibles con GGUF.
- Capacidad conversacional declarada en las etiquetas del repositorio, aunque la tarea principal es la clasificación.
- Soporte de tool calling, agentes, multi-step reasoning, visión general o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés.

## Casos de uso

- Moderación de contenido subido por usuarios en plataformas sociales: el modelo analiza la imagen junto con el texto acompañante y devuelve una decisión estructurada que el backend puede usar para aprobar, marcar o bloquear la publicación antes de que sea visible.
- Pre-filtrado en plataformas de imágenes generadas por IA: se ejecuta como paso previo a la publicación para detectar contenido que incumpla las políticas de uso, reduciendo la carga sobre sistemas de revisión humana.
- Guardrail de entrada en asistentes multimodales: antes de pasar una imagen al modelo generativo principal, VisionGuard la clasifica y evita que el modelo de generación reciba contenido prohibido, ahorrando cómputo y reduciendo riesgo reputacional.
- Guardrail de salida: comprobación de imágenes generadas por el propio sistema antes de devolverlas al usuario, útil en productos de generación de imágenes con políticas estrictas.
- Curación de datasets de entrenamiento: filtrado automático de grandes volúmenes de imágenes para eliminar muestras no deseadas antes de entrenar otros modelos, usando el JSON de salida como criterio de descarte.
- Cumplimiento normativo y auditoría: generación de registros etiquetados en JSON sobre el contenido revisado, lo que facilita trazabilidad ante requisitos legales de moderación en mercados regulados.
- Moderación en mercados y clasificados: análisis de fotografías de producto con texto asociado para detectar artículos prohibidos o contenido inapropiado.
- Despliegue en infraestructura propia con requisitos de privacidad: al ser un GGUF de 2-4 GB ejecutable en local, permite moderar contenido sensible sin enviarlo a APIs de terceros.
- Asistencia a equipos de trust and safety: el modelo prioriza y etiqueta los casos dudosos, de modo que los revisores humanos se centran en la cola de mayor ambigüedad en lugar de revisar todo el volumen entrante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni el repositorio GGUF ni la model card del modelo base incluidos en esta búsqueda incluyen valores de MMLU, HumanEval, GSM8K, ni métricas específicas de clasificación de seguridad como precisión, recall o F1 sobre conjuntos de evaluación de moderación.

## Requisitos de hardware

- VRAM estimada para el modelo según cuantización (sin contar el proyector, que añade 0,5-0,8 GB): Q2_K 2,0 GB; Q3_K_S 2,2 GB; Q3_K_M 2,4 GB; Q3_K_L 2,5 GB; IQ4_XS 2,6 GB; Q4_K_S 2,7 GB; Q4_K_M 2,8 GB; Q5_K_S 3,1 GB; Q5_K_M 3,2 GB; Q6_K 3,6 GB; Q8_0 4,6 GB; f16 8,5 GB.
- Sumando el proyector multimodal, la huella realista en memoria es aproximadamente 0,5-0,8 GB superior a la cifra de cada cuantización.
- GPU de consumo: cabe holgadamente en GPUs de 6-8 GB (RTX 3060, RTX 4060, RTX 2070) usando Q4_K_M o Q5_K_M; en GPUs de 4 GB se puede intentar Q2_K o Q3_K_S, con pérdida de calidad. En GPUs de 12-24 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) caben Q8_0 e incluso f16 con margen amplio.
- GPU de centro de datos: A100, H100, L40S o similares pueden ejecutar la versión f16 con múltiples réplicas en paralelo, aunque el tamaño del modelo hace que no sea necesario recurrir a este hardware salvo por requisitos de throughput agregado.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF que soporte mmproj para el componente visual. El soporte de GGUF en vLLM es limitado y no está confirmado para este modelo. La librería declarada es transformers para el modelo base en safetensors, no para esta cuantización.
- Latencia y throughput estimados: no disponibles. No hay datos publicados de tokens por segundo ni de tiempo de clasificación por imagen.

## Comparativa con modelos similares

La información proporcionada no incluye datos de rendimiento de alternativas, por lo que la comparación se limita a la categoría y a los datos verificables de este modelo. Los principales referentes de la misma categoría (clasificadores de seguridad multimodal) son:

| Modelo | Parámetros | Contexto | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| OneDecision-VisionGuard-4B-SFT (GGUF) | 4,2 B | No disponible | Apache 2.0 | GGUF + mmproj | Este modelo |
| Llama Guard 3 Vision (Meta) | No disponible en la información | No disponible en la información | Licencia comunitaria de Llama | safetensors | No disponible |
| ShieldGemma (Google) | No disponible en la información | No disponible en la información | Términos de Gemma | safetensors | No disponible |

No se dispone de valores de MMLU, F1 de moderación ni tasas de falsos positivos para ninguno de los modelos listados dentro de la información consultada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idioma: el modelo declara únicamente inglés. Su comportamiento con entradas en castellano u otros idiomas no está documentado y no puede asumirse.
- Ausencia de benchmarks: no hay métricas publicadas de precisión, recall, F1 ni tasas de falsos positivos y falsos negativos, lo que impide estimar su fiabilidad antes de desplegarlo en producción.
- Riesgo de alucinación: al ser un modelo generativo ajustado por SFT, puede producir etiquetas o justificaciones inconsistentes con la imagen real, especialmente en cuantizaciones agresivas (Q2_K, Q3_K).
- La etiqueta "uncensored" implica que el modelo no rechaza analizar contenido sensible, lo que es deseable en moderación, pero implica que sus salidas deben validarse siempre contra un esquema JSON estricto antes de tomar decisiones automatizadas.
- Sesgos: no se documenta la composición del dataset ImageShield-OneDecision-Classification ni su distribución demográfica, de modo que el sesgo del clasificador no puede evaluarse. Existe riesgo de sobrerrepresentación o infrarrepresentación de determinados grupos o contextos culturales.
- Degradación por cuantización: las cuantizaciones por debajo de Q4 (Q3_K, Q2_K) reducen la calidad de forma notable. El autor no proporciona cuantizaciones ponderadas ni imatrix, que suelen preservar mejor el rendimiento en modelos pequeños.
- Longitud de contexto desconocida: no se especifica la ventana máxima, lo que limita el diseño de prompts largos o clasificaciones con contexto conversacional extenso.
- Repositorio de terceros: esta cuantización la mantiene mradermacher, no el autor del modelo base. Ante discrepancias de comportamiento, la referencia canónica es prithivMLmods/OneDecision-VisionGuard-4B-SFT.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se han detectado cláusulas adicionales restrictivas en la información disponible, pero conviene verificar la licencia del modelo base y del dataset por separado antes de un despliegue comercial.
- Despliegue multimodal: es imprescindible cargar el fichero mmproj correspondiente; omitirlo convierte al modelo en incapaz de procesar imágenes, lo que puede dar lugar a fallos silenciosos en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OneDecision-VisionGuard-4B-SFT-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/OneDecision-VisionGuard-4B-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/prithivMLmods/ImageShield-OneDecision-Classification
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#OneDecision-VisionGuard-4B-SFT-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Catálogo de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones GGUF: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
