# nikolas-doan/VoiceTecx-models

## Resumen

VoiceTecx-models es un repositorio de distribución que contiene una conversión al formato whisper.cpp (ggml) del modelo de reconocimiento automático del habla Breeze-ASR-25, desarrollado originalmente por MediaTek Research. El repositorio lo publica el usuario nikolas-doan como artefacto de descarga para la aplicación VoiceTecx, que lo obtiene en el primer uso y verifica su integridad mediante un hash sha256 fijado. No se trata de un modelo entrenado desde cero, sino de una conversión de formato seguida de una cuantización a 8 bits.

El modelo subyacente, Breeze-ASR-25, está especializado en mandarín de Taiwán y en habla con mezcla de mandarín e inglés, un escenario muy frecuente en contextos taiwaneses donde los hablantes alternan entre ambos idiomas dentro de una misma frase. La arquitectura es la de Whisper, un transformer encoder-decoder con atención estándar, y el artefacto distribuido ocupa 1.656.129.691 bytes (aproximadamente 1,66 GB) en cuantización q8_0.

Su relevancia es acotada pero concreta: ofrece un binario listo para usar con whisper.cpp en aplicaciones de escritorio o integradas, sin necesidad de convertir pesos ni de gestionar dependencias de PyTorch. Al estar bajo licencia Apache 2.0 y derivar de un modelo de MediaTek Research, es apto para uso comercial, aunque con las cautelas propias de un artefacto de conversión mantenido por un tercero y sin métricas publicadas en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio propia de Whisper; no especificada en la información) |
| Tipos de cuantización | q8_0 (8 bits) en formato ggml |
| Idiomas soportados | zh (mandarín, con foco en Taiwán), en |
| Licencia | Apache 2.0 |
| Formato de pesos | ggml binario (`ggml-breeze-asr-25-q8_0.bin`); origen fp16 `.pt` |
| Tamaño del artefacto | 1.656.129.691 bytes (~1,66 GB) |
| Modelo base | MediaTek-Research/Breeze-ASR-25 |
| Pipeline | automatic-speech-recognition (ASR) |
| Hash sha256 | `d4b187c40ffbf1f620734b77821e2ca8a97c8ecf5754d02b2a175069348cafcf` |

## Arquitectura y entrenamiento

El modelo base Breeze-ASR-25 emplea la arquitectura Whisper de OpenAI, un transformer encoder-decoder diseñado para transcripción de audio a texto. El repositorio VoiceTecx-models no aporta detalles sobre el entrenamiento original de Breeze-ASR-25: no se especifican el número de tokens de audio, la composición del dataset, ni si hubo etapas de ajuste fino supervisado o preferencias. Tampoco se documenta si MediaTek Research partió de un checkpoint Whisper preentrenado o entrenó desde cero.

La contribución técnica de este repositorio es exclusivamente de empaquetado. Según la model card, el proceso consistió en convertir el checkpoint fp16 `.pt` original mediante el script `convert-pt-to-ggml.py` de whisper.cpp (con sha256 `61e69491…7bb3`) y aplicar después `whisper-quantize q8_0` para reducir los pesos a 8 bits. El autor afirma explícitamente que no se reentrenó ni modificó ningún peso: la conversión es puramente de formato y precisión. Como validación, se indica que el binario transcribe exactamente el archivo `jfk.wav` incluido en whisper.cpp. El repositorio también alude a un modelo inglés (Whisper large-v3-turbo) procedente de ggerganov/whisper.cpp, que se distribuye sin cambios y no se documenta en este repositorio.

## Capacidades

- Transcripción de voz a texto en mandarín de Taiwán y en inglés.
- Manejo de habla con alternancia de código mandarín-inglés (code-switching) dentro de una misma intervención, que es el caso de uso central del modelo base.
- Ejecución mediante whisper.cpp, lo que permite inferencia en CPU y en GPU sin dependencias de frameworks de deep learning pesados.
- Distribución como binario ggml autocontenido, apto para aplicaciones de escritorio y embebidas.
- Verificación de integridad mediante sha256 fijado en la aplicación VoiceTecx.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling, agentes ni modos de razonamiento extendido en la información disponible.

## Casos de uso

- Transcripción de reuniones en entornos taiwaneses: el modelo está ajustado al mandarín de Taiwán y a la mezcla con inglés, por lo que resulta adecuado para actas de reuniones donde los participantes alternan ambos idiomas; el binario ggml permite ejecutarlo localmente en el portátil del usuario sin enviar audio a la nube.
- Subtitulado local de contenido audiovisual: integrado en una aplicación de escritorio mediante whisper.cpp, puede generar subtítulos en mandarín e inglés de vídeos y pódcasts; la cuantización q8_0 reduce el consumo de memoria frente al fp16 original.
- Asistentes de voz offline para aplicaciones de escritorio: el formato ggml y la licencia Apache 2.0 permiten incorporar el modelo a productos comerciales que requieran transcripción en local, con verificación de integridad del binario antes de su uso.
- Procesamiento de notas de voz en aplicaciones móviles o de escritorio: la transcripción de mensajes cortos en mandarín taiwanés con inserción de términos en inglés es un escenario directo para este ajuste.
- Investigación en ASR multilingüe con code-switching: sirve como referencia cuantizada para comparar el rendimiento de Breeze-ASR-25 frente a Whisper estándar en habla mandarín-inglés, siempre que se validen las métricas por cuenta propia, dado que no se publican resultados.
- Despliegue en entornos con recursos limitados: al ejecutarse con whisper.cpp en CPU, puede desplegarse en equipos sin GPU dedicada para transcripción por lotes de audio de duración moderada, con la latencia dependiente del hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona que el binario transcribe exactamente el archivo `jfk.wav` de whisper.cpp, lo que constituye una comprobación de correcta conversión, no una evaluación de calidad ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el artefacto q8_0 ocupa ~1,66 GB en disco, por lo que la huella en memoria es del orden de esa cifra más las estructuras de trabajo de whisper.cpp.
- GPU recomendadas: no especificadas en la información. Al ser un binario ggml, puede ejecutarse en GPU compatibles con los backends de whisper.cpp (CUDA, Metal, Vulkan) o en CPU.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 4 GB o más de VRAM, dado el tamaño del artefacto, aunque no se aportan cifras oficiales de consumo en ejecución.
- Opciones de despliegue: whisper.cpp (formato nativo del artefacto). No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| VoiceTecx-models (Breeze-ASR-25 q8_0) | no disponible | no disponible | zh, en | Apache 2.0 | ggml q8_0 | Hugging Face, ~1,66 GB |
| MediaTek-Research/Breeze-ASR-25 (original) | no disponible | no disponible | zh, en | Apache 2.0 | fp16 `.pt` | Hugging Face |
| Whisper large-v3-turbo (ggerganov/whisper.cpp) | no disponible en la información | no disponible | multilingüe | licencia de Whisper (no detallada aquí) | ggml | Hugging Face (ggerganov/whisper.cpp) |

La comparación se limita a los artefactos citados en la propia model card; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- El repositorio es un artefacto de conversión y cuantización, no un modelo entrenado por el autor del repositorio; la calidad depende íntegramente de Breeze-ASR-25 de MediaTek Research.
- No se publican métricas de WER ni evaluaciones de calidad; la única validación documentada es la transcripción exacta de `jfk.wav`.
- La cuantización q8_0 puede introducir degradación menor frente al fp16 original; no se cuantifica esa pérdida en la información disponible.
- El soporte de idiomas se limita a mandarín (con foco en Taiwán) e inglés; no se garantiza un buen comportamiento en otros idiomas.
- Riesgo de alucinación inherente a los modelos Whisper en segmentos con silencio, ruido o audio musical; no se documenta mitigación específica.
- Sesgos: no se documentan análisis de sesgos demográficos, acentos o variedades dialectales distintas del mandarín taiwanés.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe conservar el aviso de licencia y atribución a MediaTek Research.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-26); se trata de un artefacto reciente y sin validación comunitaria.
- La aplicación VoiceTecx rechaza cualquier binario cuyo sha256 no coincida con el fijado, lo que impide usar variantes recompiladas o recuantizadas sin modificar la aplicación.
- No se documenta soporte de diarización, timestamps por palabra ni otras funcionalidades avanzadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nikolas-doan/VoiceTecx-models
- Modelo base Breeze-ASR-25: https://huggingface.co/MediaTek-Research/Breeze-ASR-25
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Pesos ggml de Whisper en Hugging Face: https://huggingface.co/ggerganov/whisper.cpp
- Aplicación VoiceTecx: https://github.com/tecxmate/datatecx
