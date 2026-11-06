# Ordagrant/speakerkit-coreml

## Resumen

SpeakerKit speaker models es un paquete de modelos de diarización de hablantes empaquetados en formato Core ML para su ejecución nativa en dispositivos Apple. Lo desarrolla Argmax (argmaxinc) y esta ficha documenta el espejo publicado por Ordagrant en Hugging Face, que reproduce sin cambios la revision `556fc52a13327837688f02289457cded017802e9` del repositorio original. El paquete incluye los tres componentes que SpeakerKit utiliza para segmentar y atribuir voces: un segmenter, un embedder y un proyector PLDA, derivados de los modelos pyannote 3.

El modelo resuelve el problema de la diarización de hablantes (determinar quién habla y cuándo en un audio) en el ecosistema de Apple, evitando depender de frameworks de Python en tiempo de inferencia. Es relevante porque permite integrar diarización en aplicaciones macOS/iOS con aceleración por Core ML y sin conexión a servicios externos. El espejo existe para que la aplicación Ordagrant descargue sus dependencias desde su propia cuenta de Hugging Face.

La información disponible es muy escasa: no se publican parámetros, contexto, idiomas ni benchmarks. La model card solo describe el origen, la licencia y el mecanismo de verificación de integridad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de pyannote 3: segmenter, embedder y proyector PLDA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato Core ML) |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (.mlmodelc / .mlpackage, según el empaquetado de SpeakerKit) |

## Arquitectura y entrenamiento

El paquete no entrena un modelo nuevo: es una conversión a Core ML de los modelos de diarización pyannote 3. La arquitectura se compone de tres piezas: un segmenter que detecta regiones de habla y cambios de turno, un embedder que extrae representaciones de voz por segmento y un proyector PLDA que transforma esos embeddings para la comparación y agrupación de hablantes. Esta combinación es el esquema clásico de diarización segmentar-embeder-agrupar.

No se dispone de información sobre el número de tokens de audio usados en el entrenamiento, la composición del dataset, ni si hubo ajuste fino adicional por parte de Argmax más allá de la conversión. Tampoco se documentan innovaciones técnicas propias; el valor añadido es la compilación a Core ML para inferencia en el Neural Engine y GPU de Apple.

## Capacidades

- Diarización de hablantes: identifica quién habla en cada intervalo de un audio.
- Segmentación de voz: detección de actividad vocal y de cambios de turno.
- Extracción de embeddings de voz: representaciones vectoriales por segmento para comparar y agrupar hablantes.
- Proyección PLDA: transformación de embeddings para mejorar la discriminación entre hablantes.
- Ejecución local en Apple: inferencia en dispositivo mediante Core ML, sin necesidad de Python en producción.
- Verificación de integridad: el espejo incluye `mirror.json` con el SHA-256 de cada archivo y `licenses/NOTICE.md` con los créditos.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá del audio.

## Casos de uso

- Transcripción con etiquetas de hablante: combinar el paquete con un motor ASR (por ejemplo, Whisper) para producir transcripciones con marcas de quién habla en cada turno, usando el segmenter para los límites y el embedder para agrupar voces.
- Actas de reuniones en macOS/iOS: una app nativa puede procesar la grabación localmente con Core ML y generar un resumen con intervenciones atribuidas a cada participante, sin enviar audio a la nube.
- Análisis de entrevistas y podcasts: separar las voces del entrevistador y del entrevistado para facilitar la edición, el corte por turnos o la búsqueda por hablante.
- Subtitulado automático con identificación de interlocutor: en pipelines de vídeo, usar la diarización para etiquetar los subtítulos con el nombre o identificador de cada hablante.
- Investigación cualitativa: procesar corpus de entrevistas o grupos focales en local y obtener segmentos por hablante para su codificación posterior, manteniendo los datos en el dispositivo.
- Control de calidad de centros de llamadas: analizar grabaciones para medir tiempos de habla de agente y cliente, detectar solapamientos y verificar el cumplimiento de protocolos de atención.
- Aplicaciones de accesibilidad: resaltar visualmente quién habla en tiempo real en una conversación o reunión para personas con dificultades auditivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de DER (diarization error rate), tasas de acierto ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser Core ML, el consumo se mide en memoria unificada del dispositivo Apple, no en VRAM dedicada.
- GPU recomendadas: no disponible. El paquete está pensado para el Neural Engine y la GPU integrada de chips Apple (serie M) y para dispositivos iOS compatibles con Core ML.
- Cabe en GPU de consumo: sí, en el sentido de que está diseñado para hardware Apple de consumo (Mac con chip M, iPhone, iPad), aunque no se especifican requisitos mínimos de memoria.
- Opciones de despliegue: Core ML a través de la librería SpeakerKit; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| SpeakerKit speaker models (este) | Diarización pyannote 3 convertida | Core ML | CC-BY-4.0 | Hugging Face (espejo de argmaxinc/speakerkit-coreml) |
| pyannote 3 original | Diarización | PyTorch | no disponible en la información | Hugging Face (pyannote) |
| WhisperX con diarización | ASR + diarización | PyTorch | no disponible en la información | Repositorio abierto |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- La información publicada es mínima: no hay datos de parámetros, idiomas, rendimiento ni requisitos, lo que dificulta evaluar su idoneidad sin pruebas propias.
- Al ser una conversión de pyannote 3, hereda las limitaciones del modelo original (solapamientos de voz, ruido de fondo, número elevado de hablantes), aunque estas no se documentan en la model card.
- El espejo no aporta mejoras ni cambios respecto al original; cualquier actualización relevante depende de argmaxinc.
- La licencia CC-BY-4.0 exige atribución; es compatible con uso comercial siempre que se respete la atribución indicada en `licenses/NOTICE.md`.
- El repositorio tiene 0 descargas y 0 likes, y el tamaño reportado es de 0.0 GB, lo que sugiere que los pesos pueden no estar alojados o que el tamaño no se ha calculado correctamente; conviene verificar la integridad con `mirror.json` antes de usarlo en producción.
- Dependencia del ecosistema Apple: no es desplegable en Linux o Windows sin conversión adicional.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí existe riesgo de asignaciones erróneas de hablante en audios con voces similares o solapadas.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/Ordagrant/speakerkit-coreml
- Repositorio original: https://huggingface.co/argmaxinc/speakerkit-coreml
- Proyecto Ordagrant: https://github.com/svenclaesson/ordagrant
- Argmax: https://github.com/argmaxinc
- pyannote: https://github.com/pyannote
