# mradermacher/VST-3B-GGUF

## Resumen

VST-3B-GGUF es la colección de cuantizaciones en formato GGUF del modelo VST-3B, publicada por el usuario mradermacher (responsable también de las infraestructuras de nethype GmbH) a partir del modelo base Catalan258/VST-3B. Se trata de un modelo multimodal orientado a la comprensión de vídeo, con soporte declarado para vídeo en streaming mediante las etiquetas video-understanding, video-llm y streaming-video del repositorio. El repositorio incluye, además de los ficheros de pesos cuantizados, proyectores multimodales (mmproj) en Q8_0 y f16, necesarios para procesar la entrada visual.

El modelo base cuenta con 3.397.103.616 parámetros reales (aproximadamente 3,4 mil millones), según los datos de safetensors del repositorio, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio pesa 32,8 GB en total y ofrece catorce variantes de cuantización, desde Q2_K (1,5 GB) hasta f16 (6,9 GB), lo que permite desplegarlo en hardware de consumo.

Su relevancia actual radica en que combina un tamaño reducido (apto para GPU de gama media) con capacidades de comprensión de vídeo, un ámbito donde la mayoría de los modelos abiertos superan los 7B de parámetros. La cuantización GGUF facilita su ejecución con llama.cpp, Ollama o LM Studio, aunque la información publicada no detalla la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como video-llm multimodal; no se detalla en la información proporcionada) |
| Parametros totales | 3.397.103.616 (3,4B aprox.) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; proyectores multimodales mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización estática, convert_type hf, output_tensor_quantised) |
| Modelo base | Catalan258/VST-3B |
| Autor de la cuantizacion | mradermacher |
| Tamano del repositorio | 32,8 GB |
| Descargas / likes | 264 / 1 |
| Fechas | creado el 2026-05-16, actualizado el 2026-10-06 |
| Paper de referencia | arXiv:2603.12262 (citado en las etiquetas; contenido no verificado) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base Catalan258/VST-3B: no se especifica si emplea un transformer denso convencional, un esquema MoE, un híbrido o algún tipo de atención lineal o dispersa. Las etiquetas del repositorio (video-understanding, video-llm, streaming-video) y la presencia de un proyector multimodal independiente (mmproj) apuntan a una arquitectura típica de modelo de lenguaje con adaptador visual, en la que el codificador de vídeo se conecta al decoder de texto mediante un módulo de proyección entrenado específicamente. El identificador arXiv:2603.12262 referenciado en las etiquetas sugiere la existencia de un artículo técnico asociado, pero su contenido no forma parte de la información proporcionada.

Respecto al entrenamiento, no se dispone de datos sobre el volumen de tokens utilizados, la composición del dataset (proporción de vídeo, imagen, texto o código), ni sobre el uso de técnicas de alineación como RLHF, DPO o similares. Tampoco se documenta si se emplearon métodos de decodificación especulativa o de optimización de atención para el procesamiento de secuencias de vídeo largas. Esta cuantización en concreto se generó como cuantización estática (static quants) con versión de cuantizador 2 y conversión desde el formato de HuggingFace; el autor indica explícitamente que no hay cuantizaciones ponderadas ni basadas en imatrix disponibles en el momento de la publicación, y que no tiene previsto generarlas salvo petición mediante la sección de discusiones comunitarias del repositorio.

## Capacidades

- Comprensión de vídeo: el modelo está etiquetado explícitamente como video-understanding y video-llm, e incluye un proyector multimodal (mmproj) que permite el procesamiento de entrada visual junto con texto.
- Vídeo en streaming: la etiqueta streaming-video indica soporte para el procesamiento continuo o incremental de flujos de vídeo, aunque la información disponible no detalla el mecanismo ni los límites de latencia.
- Generación de texto conversacional: el repositorio está marcado como conversational y endpoints_compatible, lo que indica que puede servirse mediante APIs compatibles con el formato de endpoints de HuggingFace.
- Multilingüismo: limitado al inglés (en) según el campo language de la model card; no se declara soporte de otros idiomas, incluido el castellano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de código, matemáticas o audio: no disponibles en la información proporcionada.
- Ejecución local eficiente: la disponibilidad de cuantizaciones desde Q2_K (1,5 GB) permite desplegar el modelo en hardware modesto, incluidos equipos sin GPU dedicada.

## Casos de uso

- Análisis automático de grabaciones de videovigilancia: el modelo puede procesar secuencias de vídeo y generar descripciones textuales de eventos, integrándose en pipelines que reciben clips cortos y producen alertas o resúmenes para operadores humanos.
- Moderación de contenido en plataformas de vídeo: al ser un modelo multimodal de pequeño tamaño, permite filtrar y clasificar contenido subido por usuarios en tiempo casi real, con un coste de inferencia bajo comparado con modelos de mayor tamaño.
- Indexación y búsqueda semántica de archivos audiovisuales: descripción automática de vídeos para generar metadatos que alimenten un motor de búsqueda, aprovechando la capacidad de comprensión de vídeo para producir texto indexable.
- Accesibilidad mediante descripción de vídeo: generación de descripciones textuales o narraciones para personas con discapacidad visual, un escenario donde el tamaño reducido del modelo facilita el despliegue en servidores modestos o incluso en el borde.
- Asistentes conversacionales con entrada de vídeo: chat multi-turno en el que el usuario comparte fragmentos de vídeo y formula preguntas sobre ellos; la naturaleza conversacional del modelo y el formato GGUF permiten integrarlo en aplicaciones de escritorio.
- Análisis de vídeo industrial o de procesos: revisión de grabaciones de líneas de producción o de inspecciones para detectar anomalías y generar informes; el soporte declarado de streaming-video es relevante si se necesita procesar señal en directo.
- Prototipado e investigación en visión-lenguaje: al ser un modelo de 3,4B con licencia Apache 2.0 y cuantizaciones ligeras, es adecuado como banco de pruebas para experimentos de investigación en comprensión de vídeo sin requerir clústeres de GPU.
- Transcripción y resumen de reuniones grabadas: extracción de puntos clave y tareas a partir del vídeo de una reunión, combinando la comprensión visual con la generación de texto estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni métricas específicas de comprensión de vídeo (como MSVD-QA, MSRVTT-QA o ActivityNet-QA), y tampoco se proporciona la comparación con el modelo base en precisión de cuantización más allá de la clasificación cualitativa de los tipos de cuantización (Q4_K_S y Q4_K_M marcados como "fast, recommended"; Q6_K como "very good quality"; Q8_0 como "fast, best quality"; f16 descrito como "16 bpw, overkill").

## Requisitos de hardware

Los tamaños de fichero son datos publicados en el repositorio; las estimaciones de VRAM añaden el proyector multimodal y un margen orientativo para caché KV y overhead del runtime, por lo que deben tomarse como aproximaciones, no como cifras oficiales.

| Cuantizacion | Tamano del modelo (GB) | Proyector mmproj (GB) | VRAM estimada (GB) | Notas |
|---|---|---|---|---|
| Q2_K | 1,5 | 0,9 | ~4 | Calidad reducida; apto para pruebas |
| Q3_K_S | 1,7 | 0,9 | ~4 | |
| Q3_K_M | 1,8 | 0,9 | ~4 | El autor lo marca como calidad inferior |
| Q3_K_L | 1,9 | 0,9 | ~4-5 | |
| IQ4_XS | 2,0 | 0,9 | ~5 | |
| Q4_K_S | 2,1 | 0,9 | ~5 | Rápido, recomendado |
| Q4_K_M | 2,2 | 0,9 | ~5 | Rápido, recomendado |
| Q5_K_S | 2,5 | 0,9 | ~6 | |
| Q5_K_M | 2,5 | 0,9 | ~6 | |
| Q6_K | 2,9 | 0,9 | ~6-7 | Muy buena calidad |
| Q8_0 | 3,7 | 0,9 | ~7 | Rápido, mejor calidad |
| f16 | 6,9 | 1,4 | ~11 | 16 bpw, sobredimensionado para la mayoría de usos |

- Cabe en GPU de consumo: sí. Las cuantizaciones Q2_K a Q5_K_M caben en GPUs con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070); Q6_K y Q8_0 requieren del orden de 8-10 GB (RTX 3070/3080, RTX 4070/4080); la variante f16 con proyector f16 necesita aproximadamente 11 GB, lo que la sitúa en el rango de RTX 4080, RTX 3090 o superiores.
- GPU profesionales: A100, H100, L40S y similares pueden ejecutar cualquier variante sin dificultad; en estos casos el cuello de botella suele ser el procesamiento del codificador de vídeo, no la decodificación de texto.
- CPU y equipos sin GPU: las variantes Q2_K a Q4_K_M pueden ejecutarse en CPU mediante llama.cpp, con velocidad dependiente del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. El repositorio también está marcado como endpoints_compatible para su uso con la infraestructura de endpoints de HuggingFace. El proyector mmproj debe cargarse junto al modelo para habilitar la entrada de vídeo; el autor remite a los README de TheBloke para instrucciones sobre el uso de ficheros GGUF multimodales y la concatenación de ficheros multiparte.
- Latencia y throughput: no disponibles. La información proporcionada no incluye mediciones de tokens por segundo ni de tiempo de procesamiento por fotograma de vídeo, y estas cifras dependen en gran medida del codificador visual y de la longitud de las secuencias de entrada.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables dentro de la información proporcionada, por lo que no es posible establecer una comparación numérica fiable de parámetros, contexto, rendimiento o licencia frente a alternativas de la misma categoría (como otros modelos abiertos de comprensión de vídeo de tamaño reducido). La única comparación que puede hacerse con los datos disponibles es entre las propias variantes de cuantización y el modelo base:

| Version | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| mradermacher/VST-3B-GGUF (Q4_K_M) | 3,4B aprox. | GGUF | Apache 2.0 | Público en HuggingFace |
| mradermacher/VST-3B-GGUF (f16) | 3,4B aprox. | GGUF | Apache 2.0 | Público en HuggingFace |
| Catalan258/VST-3B (modelo base) | 3,4B aprox. | safetensors (según el repositorio base) | Apache 2.0 | Público en HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible. Al ser un modelo entrenado principalmente con datos en inglés, es probable que herede sesgos culturales y lingüísticos de esos corpus, pero no hay un análisis publicado al respecto en el repositorio.
- Riesgo de alucinación: presente como en cualquier modelo generativo. En tareas de descripción de vídeo, el riesgo se traduce en la invención de objetos, acciones o personas que no aparecen en el material; no se han publicado evaluaciones de fidelidad visual.
- Limitaciones de idioma: el campo language declara únicamente inglés (en). El rendimiento en castellano u otros idiomas no está garantizado y probablemente sea degradado.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, un dato crítico para aplicaciones de vídeo, donde secuencias de muchos fotogramas consumen gran cantidad de tokens. No se debe asumir soporte de vídeos largos sin verificación previa.
- Calidad de las cuantizaciones: las variantes de baja precisión (Q2_K, Q3_K_S, Q3_K_M) degradan la calidad de salida de forma apreciable. Además, este repositorio contiene únicamente cuantizaciones estáticas; el autor indica que no hay cuantizaciones ponderadas ni basadas en imatrix disponibles, y que podrían no generarse salvo petición expresa. Las cuantizaciones IQ suelen ofrecer mejor relación calidad/tamaño que las no IQ de tamaño similar.
- Dependencia del proyector multimodal: para tareas de vídeo es imprescindible cargar el fichero mmproj; usar solo el GGUF del modelo de lenguaje desactiva la capacidad visual. En entornos con limitaciones de VRAM, el proyector añade entre 0,9 y 1,4 GB al consumo.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No se han declarado restricciones adicionales, pero conviene verificar la licencia del modelo base en su repositorio original, ya que esta cuantización hereda sus condiciones.
- Caveat de producción: no hay información pública sobre benchmarks, contexto, datos de entrenamiento ni estabilidad en entornos de alta concurrencia. Antes de desplegarlo en producción conviene evaluar la variante elegida con datos propios y medir latencia real, especialmente en flujos de vídeo en directo.
- Trazabilidad: el identificador arXiv:2603.12262 aparece en las etiquetas del repositorio, pero no se ha podido verificar su contenido ni su correspondencia con el modelo a partir de la información disponible.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/VST-3B-GGUF
- Modelo base: https://huggingface.co/Catalan258/VST-3B
- Página de descarga y resumen del autor para este modelo: https://hf.tst.eu/model#VST-3B-GGUF
- Paper de referencia citado en las etiquetas: https://arxiv.org/abs/2603.12262
- Peticiones de modelos y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- Ejemplo de README de TheBloke sobre uso de GGUF y concatenación de ficheros multiparte: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantización: https://www.nethype.de/
