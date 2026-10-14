# mattt/diar-streaming-sortformer-4spk-v2.1-coreml

## Resumen

`mattt/diar-streaming-sortformer-4spk-v2.1-coreml` es una conversión a Core ML del modelo de diarización de hablantes en streaming `nvidia/diar_streaming_sortformer-4spk-v2.1`, publicada por el desarrollador mattt (Matt Thompson) como componente del paquete Swift [AnySpeechRecognizer](https://github.com/mattt/AnySpeechRecognizer). Su función no es generar texto, sino segmentar audio en hablantes: para cada trama de 80 ms produce cuatro probabilidades de actividad independientes, una por hablante, de modo que también detecta solapamiento de voz.

El modelo original de NVIDIA pertenece a la familia Sortformer de NeMo, una arquitectura de transformer con codificador, transformador y cabezas de hablante orientada a diarización end-to-end. La conversión mantiene una configuración de baja latencia: pre-encoder en float32 y encoder, transformador y cabezas en float16, con la caché de hablantes, la cola FIFO y los embeddings de chunk empaquetados dentro del propio modelo. Los pesos no se reentrenaron, afinaron ni podaron; se trata exclusivamente de un cambio de formato y empaquetado.

Su relevancia es de nicho pero clara: permite ejecutar diarización en tiempo real sobre Apple silicon (Neural Engine, GPU o CPU vía Core ML) sin depender de CUDA ni de servicios en la nube, algo poco habitual en esta categoría. Está pensado para audio inglés mono a 16 kHz con un máximo de cuatro hablantes. El repositorio ocupa 0,2 GB y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer: pre-encoder, encoder, transformador y cabezas de hablante; grafo empaquetado como pipeline de Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; el modelo opera por chunks en streaming (configuracion declarada: `chunk_len` 6, `chunk_left_context` 1, `chunk_right_context` 7, `fifo_len` 188, `spkcache_len` 188, `spkcache_update_period` 144, `subsampling_factor` 8) |
| Tipos de cuantizacion | float32 (pre-encoder y empaquetado) y float16 (encoder, transformador y cabezas) |
| Idiomas soportados | ingles (audio de entrada en ingles, 16 kHz mono) |
| Licencia | NVIDIA Open Model License (`license: other`), con terminos Trustworthy AI asociados |
| Formato de pesos | Core ML compilado (`SortformerLowLatency.mlmodelc`); se incluye `conversion.json` con revision de origen, versiones de herramientas y digests SHA-256 |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento. Segun la model card, el checkpoint de NeMo se transformó en un pipeline de Core ML para la configuración de streaming de baja latencia de NVIDIA: el pre-encoder se ejecuta en float32 y el encoder, el transformador y las cabezas de hablante en float16, mientras que la caché de hablantes, la cola FIFO y los embeddings de chunk quedan empaquetados dentro del modelo. Los pesos no fueron entrenados, afinados ni podados durante la conversión, por lo que el comportamiento acústico y de decisión es el del modelo base de NVIDIA.

La interfaz es de un paso de streaming por predicción. El llamante debe calcular características log-mel de 128 bins compatibles con NeMo (16 kHz, ventana Hann de 25 ms, salto de 10 ms, FFT de 512 puntos, logaritmo natural, sin normalización) y mantener la caché de hablantes y la cola FIFO con la actualización de streaming de NeMo. Entradas: `chunk` float32 [1, 112, 128], `chunk_lengths` int32 [1], `spkcache` float32 [1, 188, 512], `spkcache_lengths` int32 [1], `fifo` float32 [1, 188, 512] y `fifo_lengths` int32 [1]. Salidas: `speaker_preds` float32 [1, 390, 4], `chunk_pre_encoder_embs_out` float32 [1, 14, 512] y `chunk_pre_encoder_lengths_out` int32 [1]. La interfaz es idéntica a la del modelo Streaming Sortformer v2 del mismo autor.

No hay información disponible sobre el número de tokens o horas de audio usados en el entrenamiento original, ni sobre la composición del dataset o el uso de RLHF/DPO, ya que esos datos corresponden al modelo base y no se detallan en la información proporcionada.

## Capacidades

- Diarización de hablantes en streaming sobre audio inglés mono a 16 kHz.
- Detección de solapamiento: cada trama de 80 ms recibe una probabilidad de actividad independiente por cada uno de los cuatro hablantes.
- Numeración estable de hablantes dentro de un flujo mediante caché de hablantes por orden de llegada.
- Hasta cuatro hablantes simultáneos.
- Ejecución en Apple silicon a través de Core ML (Neural Engine, GPU o CPU).
- Integración con reconocimiento de voz: se usa junto a un transcriptor (por ejemplo Parakeet v3 en AnySpeechRecognizer) mediante `SpeechAnalyzer` con múltiples módulos.
- Gestión de activos: `AssetInventory` descarga los ficheros fijados del repositorio y verifica sus digests SHA-256; el análisis nunca descarga en tiempo de ejecución.
- Herramienta de línea de comandos del paquete para preparar e inferir: `speech-recognizer prepare --backend parakeet --diarize --diarizer-version v2.1` y `speech-recognizer transcribe meeting.wav --backend parakeet --diarize --diarizer-version v2.1`.
- No reconoce identidades: las etiquetas de hablante son posiciones en orden de llegada, no personas identificadas.
- No dispone de tool calling, function calling ni capacidades de agente; no es un modelo de lenguaje.
- No dispone de visión, audio generativo ni modo de razonamiento.

## Casos de uso

- Transcripción de reuniones con etiquetado de participantes: al combinarse con un transcriptor ASR en el mismo pipeline de `SpeechAnalyzer`, permite producir actas donde cada intervención queda atribuida a un hablante numerado, con detección de solapamiento cuando dos personas hablan a la vez.
- Subtitulado accesible en apps macOS e iOS: al ejecutarse íntegramente en el dispositivo mediante Core ML, permite generar subtítulos con identificación de hablante sin enviar audio a servidores externos, lo que simplifica el cumplimiento de privacidad.
- Análisis de entrevistas periodísticas: la diarización por tramas de 80 ms permite reconstruir turnos de palabra con precisión temporal suficiente para edición posterior y para citar correctamente a cada interlocutor.
- Búsqueda y navegación por audio ("quién dijo qué"): indexando los segmentos por hablante y marca temporal, un buscador interno puede localizar en qué momento habló cada participante dentro de una grabación larga de hasta cuatro voces.
- Investigación en conversación y lingüística: el etiquetado estable por orden de llegada y la detección de solapamiento facilitan métricas de turnos, interrupciones y simultaneidad de habla en corpus controlados en inglés.
- Automatización de notas en aplicaciones de productividad: integrado como módulo de diarización en un pipeline local de reconocimiento, permite separar voces en reuniones de equipo pequeñas (hasta cuatro personas) sin coste de inferencia en nube.
- Preprocesado de datos de voz para entrenamiento: la diarización previa ayuda a segmentar y atribuir audio bruto antes de alimentar otros modelos, siempre que el material esté en inglés y con condiciones acústicas razonables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo está empaquetado como Core ML y está destinado a Apple silicon; no se distribuye una variante para CUDA ni para GPU de NVIDIA.
- Tamano del repositorio: 0,2 GB, lo que da una referencia aproximada del espacio en disco necesario para los ficheros del modelo y sus metadatos.
- Precisión mixta: el pre-encoder en float32 y el encoder, transformador y cabezas en float16 reducen la huella de memoria en comparación con una ejecución íntegramente en float32.
- Al ser un modelo de diarización de audio (no un LLM), la VRAM necesaria es muy inferior a la de un modelo generativo de gran tamaño; no se publican cifras concretas de VRAM en la información disponible.
- Cabe en hardware de consumo tipo Apple silicon (familia M) sin dificultad por tamano de pesos; no se especifican requisitos mínimos de chip ni de memoria unificada.
- Opciones de despliegue: Core ML a través del paquete Swift [AnySpeechRecognizer](https://github.com/mattt/AnySpeechRecognizer), con `SortformerDiarizationModel(version: .v2_1)` o cargando directamente un `SortformerLowLatency.mlmodelc` ya compilado.
- No se documentan opciones de despliegue para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La configuración de streaming declarada (`chunk_len` 6, `chunk_left_context` 1, `chunk_right_context` 7, `subsampling_factor` 8) corresponde al modo de baja latencia de NVIDIA, pero no se aportan cifras de tiempo por chunk.

## Comparativa con modelos similares

| Modelo | Formato / plataforma | Hablantes | Streaming | Licencia | Notas |
|---|---|---|---|---|---|
| mattt/diar-streaming-sortformer-4spk-v2.1-coreml | Core ML, Apple silicon | Hasta 4 | Si | NVIDIA Open Model License | Conversión sin reentrenamiento; pre-encoder float32 y resto float16 |
| nvidia/diar_streaming_sortformer-4spk-v2.1 | NeMo (checkpoint original) | Hasta 4 | Si | NVIDIA Open Model License | Modelo base; mismas limitaciones de precision declaradas por NVIDIA |
| Otras soluciones de diarizacion (por ejemplo, pipelines tipo pyannote) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion numerica |

No se dispone de resultados de benchmarks ni de cifras de error de diarización (DER) para ninguno de los modelos de la comparativa en la información proporcionada, por lo que no es posible ordenarlos por rendimiento.

## Limitaciones y advertencias

- La precision se degrada con cinco o más hablantes; el modelo está diseñado para un máximo de cuatro.
- La precision se degrada en grabaciones muy largas, en audio no inglés y en audio fuera de dominio, como grabaciones con ruido. La conversión no modifica estas limitaciones respecto al modelo base de NVIDIA.
- Las etiquetas de hablante son posiciones por orden de llegada dentro del flujo, no identidades: el modelo no reconoce quién es cada persona.
- El audio de entrada debe ser inglés mono a 16 kHz, con características log-mel de 128 bins compatibles con NeMo (ventana Hann de 25 ms, salto de 10 ms, FFT de 512 puntos, logaritmo natural, sin normalización) y gestión de caché y FIFO segun el esquema de streaming de NeMo. Un preprocesado distinto produce resultados incorrectos.
- Idioma: la lista de idiomas del repositorio figura como no disponible, pero la model card restringe el uso previsto a voz en inglés.
- Licencia: NVIDIA Open Model License. Es una licencia propia de NVIDIA, no una licencia de código abierto estándar, y va acompañada de los terminos Trustworthy AI, que prohiben usos contrarios a la legislación aplicable, en particular la vigilancia ilegal y la recogida o el tratamiento ilegal de información biométrica.
- Obligaciones de atribución: cualquier aplicación que use el modelo debe mostrar el texto de atribución indicado por el autor, y la redistribución debe incluir la copia de la licencia y el aviso `NOTICE` exigido por la sección 3.1 del acuerdo.
- Riesgo de uso indebido: la diarización permite inferir quién habla y cuándo, lo que puede constituir tratamiento de datos biométricos o de voz según la jurisdicción; conviene revisar la base legal antes de desplegarlo en producción.
- Riesgo de error de asignación: en audio con solapamiento intenso, ruido o cambios frecuentes de interlocutor, la numeración por orden de llegada puede fragmentar o fusionar hablantes; no se aportan métricas de error para cuantificarlo.
- Sin mantenimiento declarado: el repositorio registra cero descargas y cero likes, y se publicó sin pipeline asociado en HuggingFace, por lo que no hay evidencia de uso en producción ni de soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mattt/diar-streaming-sortformer-4spk-v2.1-coreml
- Modelo base de NVIDIA: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- Proyecto AnySpeechRecognizer: https://github.com/mattt/AnySpeechRecognizer
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Terminos Trustworthy AI de NVIDIA: https://www.nvidia.com/en-us/agreements/trustworthy-ai/terms/
