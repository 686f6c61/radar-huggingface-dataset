# nikioth/wespeaker-resnet34-lm-coreml

## Resumen

El modelo `nikioth/wespeaker-resnet34-lm-coreml` es una conversión a Core ML del modelo de embeddings de hablante WeSpeaker ResNet34-LM, en la versión empaquetada por pyannote.audio (`pyannote/wespeaker-voxceleb-resnet34-LM`). Lo publica el usuario nikioth y su propósito es permitir la extracción de embeddings de hablante en hardware de Apple (Apple Silicon, macOS 14 / iOS 17 o superior) sin necesidad de PyTorch en tiempo de inferencia. Es el mismo modelo de embeddings que utilizan los pipelines de diarización de pyannote y DiariZen, por lo que su relevancia es directa para quien quiera portar diarización o verificación de hablante a un Mac o a un dispositivo iOS.

La arquitectura subyacente es una ResNet34 con estadísticas de pooling (statistics pooling) sobre características filterbank de Kaldi, que produce un vector de 256 dimensiones por hablante. El paquete incluye además un transformación PLDA (`plda_transform.json`) que proyecta esos embeddings de 256 dimensiones al espacio de 128 dimensiones donde VBx agrupa hablantes, tomada de `speaker-diarization-community-1` de pyannote con la transformación x-vector de VBx ya incorporada.

El modelo se distribuye con licencia CC BY 4.0, con pesos en float16 dentro de un `.mlpackage` de 13,3 MB. No es un modelo generativo: es un extractor de características acústicas de hablante, pensado para tareas de *speaker verification*, *speaker diarization* y *speaker embedding*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet34 con statistics pooling (modelo de embeddings de hablante WeSpeaker) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 16 s (1598 frames de fbank, 799 frames de máscara) |
| Tipos de cuantizacion | float16 (pesos del `.mlpackage`); las entradas/salidas se declaran Float16 pero Core ML acepta Float32 en la frontera |
| Idiomas soportados | no disponible (modelo agnóstico al idioma; entrenado sobre VoxCeleb) |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML ML Program (`.mlpackage`) + `plda_transform.json` (float64) |

## Arquitectura y entrenamiento

El modelo es una ResNet34 que opera sobre características filterbank de Kaldi (80 bins mel, ventana Hamming de 25 ms cada 10 ms, pre-énfasis 0,97, FFT de 512 puntos, sin dither, normalización por resta de media por bin). La entrada es un crop de 16 s (256.000 muestras a 16 kHz, con zero-padding si es más corto), lo que produce 1598 frames de fbank. Adicionalmente recibe una máscara de pesos por frame (`weights`, 799 valores, uno cada 20 ms) que indica qué frames deben agregarse en el pooling; el pooling de estadísticas remuestrea esa máscara a la tasa de frames de la ResNet (vecino más cercano) y agrega ponderando. La salida es un embedding de 256 dimensiones por muestra del batch (B de 1 a 64).

El entrenamiento original corresponde al checkpoint de WeSpeaker para VoxCeleb empaquetado por pyannote (`pyannote/wespeaker-voxceleb-resnet34-LM`); la conversión a Core ML la realiza el script `conversion/export_embedding_coreml.py` incluido en el repositorio. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF/DPO (no aplica a un modelo de embeddings). La innovación destacable es la conversión a Core ML con pesos float16 y la inclusión del transformación PLDA de VBx ya precalculada (eigendescomposición generalizada resuelta), de modo que aplicar la proyección a 128 dimensiones requiere solo álgebra lineal.

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de audio mono a 16 kHz.
- Verificación de hablante (*speaker verification*) comparando embeddings (por ejemplo, similitud coseno o distancia PLDA).
- Diarización de hablantes: al permitir una máscara por frame, un mismo crop puede producir un embedding por cada hablante activo en él.
- Proyección PLDA a 128 dimensiones para agrupamiento con VBx, mediante `plda_transform.json`.
- Inferencia en Apple Silicon (CPU y GPU vía Core ML), con soporte de lotes de hasta 64 crops.
- Frontend filterbank compatible con `torchaudio.compliance.kaldi.fbank` (verificado con `kaldi-native-fbank` con diferencias de hasta 4e-4), lo que permite usarlo sin PyTorch.
- API en Python (`coremltools`) y en Swift (`Embedding.mlpackage` + `swift/WeSpeakerResNet34.swift`).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un extractor de características, no un LLM.

## Casos de uso

- Diarización de reuniones en macOS: usando el pipeline de pyannote o DiariZen con este modelo como extractor de embeddings, se puede segmentar y agrupar hablantes en grabaciones de reuniones directamente en un Mac con Apple Silicon, sin GPU NVIDIA ni PyTorch en producción.
- Verificación de hablante en aplicaciones iOS: integrar el `.mlpackage` en una app iOS 17+ para autenticación por voz o control de acceso, comparando el embedding de 256 dimensiones del audio entrante con el embedding de referencia del usuario.
- Transcripción con etiquetado de hablante en local: combinar este extractor con un ASR (por ejemplo, Whisper) para producir transcripciones con "quién dijo qué" en un flujo totalmente local en macOS.
- Indexación y búsqueda por voz en archivos de audio: generar embeddings por segmento de 16 s y almacenarlos para búsqueda de "hablantes similares" en un archivo histórico, usando la distancia PLDA de 128 dimensiones para el ranking.
- Análisis de llamadas de atención al cliente: procesar grabaciones de call center para separar agente y cliente y calcular métricas de tiempo de habla por participante, aprovechando el procesamiento por lotes (B hasta 64) para alto rendimiento.
- Preprocesado para pipelines de investigación en diarización: usar el modelo como extractor de referencia en experimentos con VBx, dado que el `plda_transform.json` ya está alineado con `speaker-diarization-community-1`.
- Prototipado rápido en portátil: validar un pipeline de speaker verification en un MacBook antes de desplegarlo en servidores, gracias a la paridad numérica con el frontend de torchaudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de EER, DER ni comparativas numéricas con otros modelos; solo documenta la equivalencia numérica del frontend filterbank (diferencia máxima de 4e-4 frente a `torchaudio`) y el tamaño del artefacto (13,3 MB en float16).

## Requisitos de hardware

- VRAM/espacio: el `.mlpackage` ocupa 13,3 MB en float16; el modelo es muy ligero y no requiere GPU dedicada.
- Hardware objetivo: Apple Silicon (CPU y GPU vía Core ML); despliegue declarado para macOS 14 / iOS 17 o posterior.
- GPU recomendadas: no aplica en el sentido de NVIDIA; el modelo está pensado para la GPU integrada de los chips Apple (M1, M2, M3, M4 y posteriores). No se documenta soporte para A100, H100 ni RTX 4090.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con Apple Silicon; el tamaño es de decenas de MB en memoria.
- Opciones de despliegue: Core ML (`coremltools` en Python, framework Core ML en Swift), con `compute_units=CPU_AND_GPU`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada. El procesamiento por lotes admite B de 1 a 64 crops de 16 s por llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikioth/wespeaker-resnet34-lm-coreml | no disponible | 16 s fijos (1598 frames fbank) | embedding 256-d (+128-d PLDA) | CC BY 4.0 | HuggingFace, Core ML |
| pyannote/wespeaker-voxceleb-resnet34-LM | no disponible | 16 s (pipeline pyannote) | embedding 256-d | no disponible en la información | HuggingFace, PyTorch |
| pyannote/speaker-diarization-community-1 | no disponible | pipeline completo de diarización | segmentos con etiqueta de hablante | no disponible en la información | HuggingFace, PyTorch |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento (EER, DER) para establecer una comparación cuantitativa. La diferencia principal frente al checkpoint original de pyannote es el formato (Core ML float16 frente a PyTorch) y la inclusión del transformación PLDA precalculada para VBx.

## Limitaciones y advertencias

- Es un extractor de embeddings, no un modelo generativo: no responde preguntas ni genera texto; cualquier expectativa de LLM es incorrecta.
- La entrada está fijada a crops de 16 s; audios más largos deben trocearse y audios más cortos deben rellenarse con ceros y enmascararse con `weights` para no contaminar el embedding.
- El frontend debe replicarse con precisión (ventana Hamming, sin dither, 80 bins mel, pre-énfasis 0,97, resta de media); desviaciones del frontend degradan la calidad del embedding.
- El modelo se entrenó sobre VoxCeleb; el rendimiento en dominios muy distintos (audio telefónico de baja calidad, ruido intenso, micrófonos lejanos) no está documentado en la información disponible.
- Requiere macOS 14 / iOS 17 o superior; no es desplegable en Linux ni Windows con Core ML.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar al autor y respetar los términos de la licencia.
- El repositorio tiene muy pocas descargas (6) y ningún *like* en el momento de la consulta; no hay evidencia de validación por terceros en la información disponible.
- No se documentan sesgos demográficos ni riesgos de alucinación (no aplica al no ser generativo), pero los sesgos del dataset VoxCeleb (composición demográfica) pueden trasladarse a los embeddings.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikioth/wespeaker-resnet34-lm-coreml
- Modelo base: https://huggingface.co/pyannote/wespeaker-voxceleb-resnet34-LM
- WeSpeaker (repositorio del proyecto): no disponible en la información proporcionada
- pyannote.audio: no disponible en la información proporcionada
- DiariZen: no disponible en la información proporcionada
- VBx: no disponible en la información proporcionada
- Paper de WeSpeaker / ResNet34-LM: no disponible en la información proporcionada
