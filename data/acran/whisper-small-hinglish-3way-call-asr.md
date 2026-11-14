# acran/whisper-small-hinglish-3way-call-asr

## Resumen

Whisper Small Hinglish 3-Way Call ASR es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario acran, especializado en audio telefónico de 8 kHz con code-switching hindi-inglés (hinglish). El modelo parte de la arquitectura Whisper Small de OpenAI (241.734.912 parámetros) y se construye mediante una fusión de pesos de tres variantes: ARTPARK-IISc/whisper-small-vaani-hindi, vasista22/whisper-hindi-small y openai/whisper-small, seguida de un ajuste fino específico para telefonía.

La propuesta diferencial es doble: por un lado, produce transcripciones en doble script (devanagari y latino) preservando los logits de tokens ingleses en el decodificador; por otro, se distribuye en binarios GGML cuantizados por debajo de los 200 MB, pensados para inferencia on-device en Android mediante whisper.cpp. Esto lo hace relevante para despliegues en centros de llamadas, entornos con conectividad limitada y aplicaciones móviles donde no es viable enviar audio a la nube.

El modelo se publica bajo licencia CC-BY-4.0, soporta hindi e inglés y se entrenó con el dataset MUCS-Hinglish degradado on-the-fly con remuestreo a 8 kHz y simulación del códec G.711 mu-law, lo que aproxima las condiciones acústicas reales de la telefonía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | Q5_1 (~190 MB), Q5_K (~175 MB), Q5_0 (~167 MB) en formato GGML |
| Idiomas soportados | hindi (hi), ingles (en); salida en doble script (devanagari + latino) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (transformers), GGML/GGUF (whisper.cpp) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura estándar de Whisper Small, un transformer encoder-decoder con atención completa. La construcción no parte de un entrenamiento desde cero, sino de una fusión de pesos mediante SLERP (spherical linear interpolation) consciente de componentes. El encoder combina un 40% de ARTPARK-IISc/whisper-small-vaani-hindi (acentos regionales indios y acústica telefónica de 8 kHz de Gramvaani), un 30% de vasista22/whisper-hindi-small (robustez acústica del ecosistema Bhashini de IITM) y un 30% de openai/whisper-small (representación de fonemas ingleses). El decodificador se fusiona al 50% entre ARTPARK-IISc/whisper-small-vaani-hindi y openai/whisper-small, excluyendo deliberadamente los pesos puramente devanagari de Vasista para preservar los logits de tokens latinos ingleses.

Tras la fusión, se aplica un ajuste fino de 800 pasos con batch_size=32, learning rate 1e-5 y congelación de las 4 capas inferiores del encoder, sobre el dataset dianavdavidson/MUCS-Hinglish. Durante el entrenamiento, el audio se degrada on-the-fly mediante remuestreo a 8 kHz y simulación del códec G.711 mu-law, lo que adapta el modelo a las condiciones reales de las grabaciones telefónicas. No se documentan fases de RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Transcripción de voz a texto con reconocimiento de code-switching hindi-inglés dentro de la misma frase.
- Salida en doble script: devanagari para segmentos hindi y alfabeto latino para segmentos ingleses.
- Reconocimiento robusto en audio telefónico de 8 kHz degradado con códec G.711 mu-law.
- Inferencia on-device en Android mediante whisper.cpp con binarios GGML de menos de 200 MB.
- Integración con la librería transformers mediante pipeline de automatic-speech-recognition.
- Soporte de acentos regionales indios gracias a la componente ARTPARK-IISc.
- No se documentan capacidades de traducción, diarización de hablantes, tool calling ni razonamiento multi-paso.

## Casos de uso

- Transcripción de centros de llamadas: el modelo está optimizado para audio de 8 kHz con códec telefónico, por lo que puede procesar grabaciones de atención al cliente en hinglish y generar actas o resúmenes posteriores con doble script.
- Aplicaciones Android offline: gracias a los binarios GGML de 167-190 MB, puede ejecutarse en un dispositivo móvil sin conexión, útil para técnicos de campo o agentes que registran conversaciones en zonas sin cobertura.
- Análisis de calidad en teleoperaciones: transcripción masiva de llamadas para detectar patrones de queja, cumplimiento de guiones o palabras clave, aprovechando la robustez frente a ruido telefónico.
- Subtitulado de reuniones y llamadas internas en equipos bilingües hindi-inglés, donde la mezcla de idiomas en una misma intervención es habitual.
- Investigación lingüística sobre code-switching: generación de corpus transcritos en doble script para estudiar alternancia de lenguas en contextos indios.
- Asistentes de voz para servicios públicos en India: transcripción de consultas ciudadanas por teléfono en entornos con infraestructura limitada, desplegable en servidores modestos o en el propio terminal.
- Archivado y búsqueda de grabaciones: indexación de audio histórico telefónico para recuperación por texto sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en transformers: aproximadamente 1 GB en fp32 (241,7 M de parámetros), y alrededor de 500 MB en fp16; el repo ocupa 4,4 GB por incluir múltiples artefactos.
- GPU recomendadas para transformers: cualquier GPU con 2 GB o más de VRAM, incluidas RTX 3060, RTX 4090, A100 o H100; el modelo es sobredimensionado para estas GPUs y se ejecutará con holgura.
- Consumer GPU: cabe en cualquier GPU de consumo moderna e incluso en iGPU con suficiente memoria compartida; también es viable en CPU.
- Despliegue on-device: los binarios GGML Q5_0 (~167 MB), Q5_K (~175 MB) y Q5_1 (~190 MB) están pensados para Android con whisper.cpp y CPUs ARM con NEON.
- Opciones de despliegue: transformers (Python), whisper.cpp (CLI y Android), y potencialmente otros runners compatibles con GGML; no se documenta soporte explícito para vLLM ni TGI, que no están orientados a ASR.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| acran/whisper-small-hinglish-3way-call-asr | 241,7 M | 30 s (Whisper) | hi, en (hinglish) | cc-by-4.0 | safetensors, GGML | ASR telefónico 8 kHz on-device |
| openai/whisper-small | 244 M | 30 s (Whisper) | multilingüe (99 idiomas) | MIT | safetensors, GGML | ASR generalista |
| ARTPARK-IISc/whisper-small-vaani-hindi | no disponible | 30 s (Whisper) | hi | no disponible | safetensors | ASR hindi con acústica telefónica |
| vasista22/whisper-hindi-small | no disponible | 30 s (Whisper) | hi | no disponible | safetensors | ASR hindi (Bhashini/IITM) |

La comparativa se limita a los modelos base declarados por el autor; no se dispone de datos de rendimiento comparativo publicados para este modelo.

## Limitaciones y advertencias

- El modelo solo cubre hindi e inglés; no se ha validado para otros idiomas y podría producir salidas incorrectas fuera de ese par.
- La salida en doble script puede mezclar devanagari y latino de forma inconsistente en segmentos ambiguos, lo que complica el postprocesado automático.
- El ajuste fino se realizó únicamente sobre MUCS-Hinglish degradado sintéticamente; el rendimiento en dominios acústicos distintos (audio de estudio, reuniones, ruido industrial) no está documentado.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en silencios, música o audio ininteligible.
- Sesgos potenciales derivados de los datasets de entrenamiento: predominio de acentos indios y de un dominio telefónico concreto, con posible menor precisión en otras variedades dialectales.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero obliga a citar al autor y a indicar cambios; conviene revisar las licencias de los modelos base por posibles restricciones adicionales.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria y de informes independientes de calidad.
- No se documentan métricas de WER/CER ni evaluación sobre conjuntos de test, lo que impide estimar su precisión real en producción.
- El tamaño del repo (4,4 GB) incluye artefactos redundantes; para despliegue conviene descargar solo el binario GGML o los safetensors necesarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/acran/whisper-small-hinglish-3way-call-asr
- Modelo base ARTPARK-IISc/whisper-small-vaani-hindi: https://huggingface.co/ARTPARK-IISc/whisper-small-vaani-hindi
- Modelo base vasista22/whisper-hindi-small: https://huggingface.co/vasista22/whisper-hindi-small
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
- Dataset dianavdavidson/MUCS-Hinglish: https://huggingface.co/datasets/dianavdavidson/MUCS-Hinglish
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
