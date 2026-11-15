# mradermacher/TimeLens2-27B-GGUF

## Resumen

TimeLens2-27B-GGUF es la versión cuantizada en formato GGUF del modelo TimeLens2-27B, desarrollado originalmente por ZhuYuhan y convertido a GGUF por mradermacher. Se trata de un modelo multimodal especializado en vídeo y, más concretamente, en *temporal grounding*: la capacidad de localizar eventos, acciones o segmentos concretos dentro de una secuencia de vídeo a partir de una consulta en lenguaje natural. Con aproximadamente 26.900 millones de parámetros, se posiciona en la gama de modelos de tamaño medio-grande que requieren hardware de gama alta para inferencia en precisión completa, pero que resultan viables en GPUs de consumo gracias a las cuantizaciones de 4 y 5 bits.

La relevancia de esta ficha radica en que el repositorio ofrece una batería completa de cuantizaciones estáticas (desde Q2_K hasta Q8_0, además de los ficheros mmproj necesarios para el procesamiento multimodal), lo que permite desplegar el modelo en entornos con recursos limitados mediante llama.cpp u otros motores compatibles con GGUF. El modelo está etiquetado con el identificador de arXiv 2607.17423, que apunta al artículo técnico asociado, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial.

No obstante, la información pública disponible es escasa: la model card del repositorio cuantizado se limita a describir el proceso de conversión y las opciones de descarga, sin detallar arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja fielmente esa limitación y marca como "no disponible" todos aquellos datos que no aparecen en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de vídeo; se infiere transformer, sin confirmar) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base ZhuYuhan/TimeLens2-27B presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo en la documentación proporcionada. Los tags del repositorio indican que se trata de un modelo multimodal orientado a vídeo y a *temporal grounding*, con un componente de proyección multimodal (los ficheros `mmproj` en formato GGUF son el adaptador que conecta el codificador visual con el modelo de lenguaje). El tamaño de 26.900 millones de parámetros sugiere un modelo de lenguaje de gran porte combinado con un codificador visual, aunque no se especifica si emplea atención completa, atención lineal u otra variante.

Tampoco se detallan los datos de entrenamiento: no hay información sobre el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. El identificador arXiv 2607.17423 apunta a un artículo técnico que probablemente contiene estos detalles, pero su contenido no está incluido en la información disponible. La conversión a GGUF realizada por mradermacher es de tipo estático (sin imatrix), según se indica en la propia model card, y no se han publicado cuantizaciones ponderadas por imatrix en el momento de la consulta.

## Capacidades

- Procesamiento de vídeo y *temporal grounding*: localización de segmentos temporales dentro de un vídeo a partir de consultas en lenguaje natural, que es la capacidad central del modelo.
- Comprensión multimodal: integración de entrada visual (vídeo) con el modelo de lenguaje mediante el proyector `mmproj`.
- Generación de texto conversacional: el tag `conversational` indica soporte para diálogo multi-turno.
- Capacidad multilingüe: limitada al inglés según la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo *thinking* explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Indexación y búsqueda de vídeo: el modelo puede localizar el instante o segmento exacto en el que ocurre un evento descrito en lenguaje natural, lo que permite construir motores de búsqueda semántica sobre archivos audiovisuales y saltar directamente al momento relevante.
- Etiquetado y anotación automática de datasets de vídeo: útil para generar marcas temporales de acciones o eventos en pipelines de anotación, reduciendo el trabajo manual en la creación de corpus para entrenamiento de otros modelos.
- Moderación y auditoría de contenido audiovisual: localización de fragmentos que cumplen ciertos criterios descritos textualmente, facilitando la revisión de grandes volúmenes de vídeo en plataformas.
- Resumen de reuniones y clases grabadas: identificación de los segmentos donde se tratan temas concretos para generar resúmenes con marcas de tiempo enlazables.
- Análisis deportivo: detección de jugadas, goles o acciones específicas dentro de un partido a partir de una consulta textual, con la marca temporal correspondiente.
- Asistentes de edición de vídeo: integración en herramientas de postproducción para que el editor localice planos o momentos concretos mediante instrucciones en lenguaje natural.
- Investigación en visión por computador: uso como modelo de referencia para experimentos de *temporal grounding* y evaluación comparativa, gracias a la disponibilidad de cuantizaciones que abaratan la experimentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de rendimiento, y el artículo arXiv referenciado (2607.17423) no está incluido en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 11 GB con Q2_K, 16-17 GB con Q4_K_M, 19-20 GB con Q5_K_M, 22 GB con Q6_K y 29 GB con Q8_0. Hay que sumar entre 0,7 y 1 GB adicionales para el fichero `mmproj` y el espacio de caché KV, que depende del contexto y no está especificado.
- GPU recomendadas: para cuantizaciones altas (Q8_0, Q6_K) se recomienda una A100 40 GB, H100 o RTX 6000 Ada. Para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 resulta suficiente para los pesos, con margen ajustado para el contexto.
- Cabe en GPU de consumo: sí, en Q4_K_M o inferiores con GPUs de 16-24 GB (RTX 4080, RTX 4090, RTX 3090). Las cuantizaciones Q2_K y Q3_K podrían caber en GPUs de 12 GB, a costa de calidad.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python), así como cualquier motor compatible con GGUF que soporte modelos multimodales con `mmproj`. El modelo base es compatible con transformers, pero la versión GGUF está pensada para motores de inferencia ligeros.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada, por lo que no es posible establecer una comparativa fiable con alternativas de la misma categoría (modelos multimodales de vídeo con capacidades de *temporal grounding*). Se indica "no disponible".

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte para inglés, por lo que su rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan sesgos conocidos en la información disponible, pero al ser un modelo entrenado sobre datos de vídeo e Internet, es probable que herede sesgos presentes en esos corpus.
- Alucinación: no hay datos publicados sobre tasas de alucinación; en tareas de *temporal grounding* el riesgo típico es la localización de segmentos inexistentes o mal delimitados, que conviene validar en producción.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar con precisión el procesamiento de vídeos largos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes visuales que pueda incorporar.
- Cuantizaciones estáticas: la model card indica que no hay cuantizaciones con imatrix, por lo que las versiones de baja precisión (Q2_K, Q3_K) pueden degradar la calidad más de lo habitual.
- Repositorio recién publicado: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia comunitaria de validación práctica del funcionamiento de estas cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/TimeLens2-27B-GGUF
- Modelo base: https://huggingface.co/ZhuYuhan/TimeLens2-27B
- Página de descargas del cuantizador: https://hf.tst.eu/model#TimeLens2-27B-GGUF
- Artículo técnico referenciado: https://arxiv.org/abs/2607.17423
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
