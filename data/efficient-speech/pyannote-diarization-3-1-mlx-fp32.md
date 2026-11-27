# efficient-speech/Pyannote-Diarization-3.1-MLX-FP32

## Resumen

Pyannote-Diarization-3.1-MLX-FP32 es una conversión de pesos, no un modelo entrenado desde cero, publicada por Efficient Speech. Contiene los dos componentes neuronales del diarizador pyannote 3.1 (segmentación y embeddings de hablante) reempaquetados en safetensors FP32 para su uso con MLX en Apple Silicon. El objetivo es permitir la diarización de hablantes en hardware Apple sin depender de PyTorch ni de CUDA.

El modelo resuelve el problema de "quién habla y cuándo" en un audio: recibe una forma de onda mono a 16 kHz y devuelve turnos de hablante. Internamente aplica segmentación sobre ventanas solapadas de 10 segundos, calcula embeddings de hablante enmascarados y agrupa (clustering) los hablantes a lo largo de la grabación. Es relevante para desarrolladores que quieran ejecutar diarización local en Macs con chip M-series.

No hay entrenamiento ni cuantización: la model card indica explícitamente que Efficient Speech convirtió ambos checkpoints sin entrenar ni cuantizar, y que los tensores están pensados para la implementación de inferencia Murmur MLX. El repo es de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes: PyanNet (segmentación, con SincNet + LSTM) y WeSpeaker ResNet34-LM (embeddings de hablante) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de segmentación de 10 segundos con solapamiento (no es contexto de tokens) |
| Tipos de cuantizacion | FP32 únicamente (conversión sin cuantización) |
| Idiomas soportados | no disponible (depende del audio de entrada; el modelo es acústico, no lingüístico) |
| Licencia | component-specific: segmentation.safetensors MIT; wespeaker.safetensors CC BY 4.0 |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El paquete agrupa dos modelos de pyannote: el segmentador PyanNet 3.0 (revisión e66f3d3b9eb0873085418a7b813d3b369bf160bb) y el extractor de embeddings WeSpeaker VoxCeleb ResNet34-LM envuelto por pyannote (revisión 837717ddb9ff5507820346191109dc79c958d614). El pipeline completo aplica segmentación sobre ventanas solapadas de 10 s, calcula embeddings de hablante enmascarados por segmento y agrupa hablantes en toda la grabación.

Las modificaciones son puramente de formato para inferencia MLX: filtros SincNet precalculados, biases de LSTM combinados, pesos de convolución y matrices transpuestos en el segmentador; batch normalization de inferencia plegada en las convoluciones, kernels de convolución en formato channels-last y proyección de embeddings transpuesta en el extractor. No hubo entrenamiento, fine-tuning ni cuantización. El config registra revisión de origen, checksum SHA-256 y layout de tensores. La segmentación se basa en el trabajo de Plaquet y Bredin sobre pérdida powerset multi-clase (Interspeech 2023).

## Capacidades

- Diarización de hablantes: identifica turnos de habla y asigna etiquetas de hablante a lo largo de una grabación.
- Segmentación de voz: detección de actividad de habla por ventanas de 10 s con solapamiento.
- Extracción de embeddings de hablante: representaciones vectoriales para comparación y clustering.
- Clustering multi-hablante: agrupa segmentos en hablantes distintos sin límite fijo declarado.
- Entrada de audio mono a 16 kHz como forma de onda.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No es multimodal en el sentido de visión o texto: es exclusivamente audio.
- Multilingüismo: no disponible como capacidad declarada; al ser un modelo acústico, la cobertura depende del dominio de entrenamiento de los checkpoints originales.

## Casos de uso

- Transcripción con etiquetas de hablante: encadenar el diarizador con un ASR para producir actas de reuniones donde cada intervención queda atribuida a un participante, usando las ventanas de 10 s y el clustering global.
- Análisis de llamadas de atención al cliente: separar agente y cliente en grabaciones telefónicas para métricas de tiempo de habla, interrupciones y silencios.
- Investigación cualitativa: procesar entrevistas semiestructuradas en local en un Mac para anonimizar o segmentar por informante sin enviar audio a la nube.
- Subtitulado y postproducción: generar pistas de hablante para edición de pódcast o vídeo, aprovechando la inferencia local en Apple Silicon.
- Cumplimiento y privacidad: diarizar audio sensible (sanitario, legal) en el propio dispositivo, evitando transferencias a servicios externos.
- Prototipado rápido en macOS: validar pipelines de diarización con MLX antes de portarlos a producción con PyTorch o soluciones en servidor.
- Indexación de archivos de audio: etiquetar hablantes en un archivo histórico para búsqueda posterior por participante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con MLX (la model card indica "Apple silicon").
- VRAM estimada: no disponible; al ser FP32 y dos redes de tamaño moderado, la huella es contenida, pero no se publica cifra.
- GPU recomendadas: no aplica en el sentido CUDA; el runtime es MLX sobre GPU unificada de Apple.
- Cabe en consumer GPU: sí en el ecosistema Apple (chips M-series), según el diseño del repo; no se declaran requisitos mínimos de memoria.
- Opciones de despliegue: MLX con la implementación Murmur; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Pesos | Licencia | Runtime | Notas |
|---|---|---|---|---|---|
| Pyannote-Diarization-3.1-MLX-FP32 | Conversión MLX de pyannote 3.1 | FP32 safetensors | MIT + CC BY 4.0 por componente | MLX (Apple Silicon) | Sin entrenamiento ni cuantización |
| pyannote/speaker-diarization-3.1 (original) | Pipeline pyannote completo | PyTorch | según pyannote | PyTorch | Referencia upstream; requiere aceptar condiciones en HF |
| pyannote/segmentation-3.0 | Segmentador aislado | PyTorch | MIT | PyTorch | Solo segmentación, sin embeddings ni clustering |
| pyannote/wespeaker-voxceleb-resnet34-LM | Extractor de embeddings | PyTorch | CC BY 4.0 | PyTorch | Solo embeddings de hablante |

## Limitaciones y advertencias

- No es un modelo entrenado: es una conversión de pesos; cualquier mejora o regresión respecto al original depende de la implementación Murmur MLX.
- Solo FP32: no hay versiones cuantizadas en este repo, lo que limita optimizaciones de memoria.
- Dependencia de runtime específico: los tensores están adaptados (SincNet precalculado, BN plegada, layouts transpuestos) y no son intercambiables con PyTorch sin reconversión.
- Licencia compuesta: el segmentador es MIT pero el extractor de embeddings es CC BY 4.0, lo que exige atribución; revisar LICENSE.md antes de uso comercial.
- Riesgo de confusión de hablantes en solapamientos, voces similares o audio con ruido; el clustering global puede fallar en grabaciones muy largas o con número de hablantes elevado.
- Sin datos publicados de sesgos, robustez por idioma ni tasas de error (DER) en esta ficha.
- Repo con 0 descargas y 0 likes: madurez y soporte comunitario no verificables.
- No apto para tareas de generación de texto, razonamiento o tool calling.

## Enlaces

- Hugging Face: https://huggingface.co/efficient-speech/Pyannote-Diarization-3.1-MLX-FP32
- Segmentador upstream: https://huggingface.co/pyannote/segmentation-3.0/tree/e66f3d3b9eb0873085418a7b813d3b369bf160bb
- Extractor de embeddings upstream: https://huggingface.co/pyannote/wespeaker-voxceleb-resnet34-LM/tree/837717ddb9ff5507820346191109dc79c958d614
- Paper de segmentación (Plaquet y Bredin, Interspeech 2023): https://www.isca-archive.org/interspeech_2023/plaquet23_interspeech.html
- WeSpeaker: https://github.com/wenet-e2e/wespeaker
- Licencia del repo: LICENSE.md en el propio repositorio de Hugging Face
