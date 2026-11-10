# ArchTianui/whisper-large-v3-turbo-german-transcriber

## Resumen

`ArchTianui/whisper-large-v3-turbo-german-transcriber` es una redistribución en formatos optimizados del modelo de reconocimiento automático del habla (ASR) `primeline/whisper-large-v3-turbo-german`, que a su vez es un fine-tuning de `openai/whisper-large-v3-turbo` especializado en alemán estándar (de-DE). El autor original de los pesos es primeLine; ArchTianui se limita a convertir los pesos originales a tres formatos de inferencia (CTranslate2, OpenVINO IR y whisper.cpp GGML) con cuantización int8/q8_0, sin reentrenar ni modificar los parámetros.

El objetivo del repositorio es servir de backend offline para la aplicación de transcripción *Transcriber International*, que verifica la integridad de cada fichero mediante SHA-256 contra un catálogo firmado. La relevancia práctica está en que ofrece variantes listas para ejecución en CPU (CTranslate2), en GPU/NPU Intel (OpenVINO) y en GPU vía Vulkan (whisper.cpp), lo que facilita el despliegue en hardware heterogéneo sin necesidad de reconvertir el modelo.

Se trata de un modelo basado en la arquitectura Whisper large-v3 turbo (encoder-decoder transformer con atención, aproximadamente 809 millones de parámetros), con una ventana de audio de 30 segundos por chunk y licencia Apache-2.0. El estado declarado por el autor es "publicado para pruebas": la precisión en el entorno real de la aplicación aún no se ha evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3 turbo) |
| Parametros totales | Aproximadamente 809 M (derivado de whisper-large-v3-turbo; no se detalla en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por chunk (valor estándar de Whisper; no se detalla en la model card) |
| Tipos de cuantizacion | int8 (CTranslate2 y OpenVINO), q8_0 (GGML/whisper.cpp) |
| Idiomas soportados | Alemán (de, de-DE estándar) |
| Licencia | Apache-2.0 (modelo base OpenAI Whisper large-v3-turbo: MIT) |
| Formato de pesos | CTranslate2 (`ct2/`), OpenVINO IR (`openvino/`), GGML q8_0 (`ggml/`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de OpenAI Whisper large-v3 turbo: un transformer encoder-decoder con atención multi-cabeza, preprocesado log-Mel de 80 canales y decodificación autorregresiva por tokens de texto. La variante "turbo" reduce el número de capas del decoder respecto a large-v3, lo que disminuye la latencia de decodificación manteniendo la calidad del encoder. Este repositorio no introduce cambios arquitectónicos: solo convierte los pesos de `primeline/whisper-large-v3-turbo-german` (commit `9e7012dad9247f07553aac8a99c4d50ad7c3d36d`) a CTranslate2, OpenVINO IR y GGML, aplicando cuantización int8/q8_0.

Según la model card original citada, el fine-tuning de primeLine se entrenó sobre el dataset `flozi00/asr-german-mixed`. No se especifican en la información disponible el número de tokens de audio, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO (en ASR no son habituales). Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura Whisper y de las conversiones de formato.

## Capacidades

- Transcripción de voz a texto en alemán estándar (de-DE) a partir de audio de hasta 30 segundos por chunk.
- Reconocimiento de habla continua con segmentación automática cuando se usa dentro de pipelines tipo Whisper (faster-whisper, whisper.cpp, OpenVINO GenAI).
- Ejecución offline: los tres formatos permiten inferencia local sin conexión a servicios externos.
- Despliegue en CPU (CTranslate2 int8), en GPU/NPU/CPU Intel (OpenVINO IR int8) y en GPU vía Vulkan (GGML q8_0).
- Verificación de integridad de pesos mediante SHA-256 en el catálogo firmado de la aplicación Transcriber International.
- No se documentan capacidades de traducción, diarización, tool calling, agentes ni modos de razonamiento; el modelo es estrictamente ASR monolingüe alemán.

## Casos de uso

- Transcripción offline en escritorio: integrado en *Transcriber International*, el formato CTranslate2 int8 permite transcribir reuniones y notas de voz en un portátil sin GPU, con un consumo de disco de aproximadamente 814 MB para `ct2/model.bin`.
- Subtitulado de vídeo en alemán: el formato GGML q8_0 (874 MB) se puede cargar con whisper.cpp y generar subtítulos SRT/VTT en tiempo casi real sobre GPU Vulkan en equipos de consumo.
- Despliegue en equipos Intel con iGPU o NPU: la variante OpenVINO IR (encoder de 640 MB y decoder de 172 MB en int8) aprovecha la aceleración de Intel GenAI para transcripción en portátiles y mini-PC sin GPU dedicada.
- Digitalización de archivos de audio históricos en alemán: al ser un modelo fine-tuneado sobre `flozi00/asr-german-mixed`, está orientado a variedades y dominios del alemán presentes en ese corpus, útil para actas, entrevistas y podcasts.
- Preprocesado de pipelines NLP: transcripción por lotes de llamadas o grabaciones para alimentar sistemas de búsqueda, análisis de sentimiento o resumen, ejecutando CTranslate2 en servidores CPU sin necesidad de GPU.
- Aplicaciones de accesibilidad: dictado y transcripción en vivo en herramientas de escritorio para usuarios germanohablantes, con la ventaja de que el modelo funciona completamente offline y no envía audio a terceros.
- Validación de integridad en entornos regulados: el catálogo firmado con SHA-256 permite desplegar el modelo en entornos donde se exige verificar que los pesos no han sido alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la precisión del modelo en el entorno de la aplicación "no ha sido evaluada todavía" y que los modelos que fallen la evaluación serán retirados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1 GB para las variantes int8/q8_0 (CTranslate2 814 MB, OpenVINO encoder 640 MB + decoder 172 MB, GGML 874 MB), más overhead del runtime y del buffer de audio.
- GPU recomendadas: cualquier GPU NVIDIA/AMD con soporte para CTranslate2 (CUDA/ROCm) o Vulkan (whisper.cpp); para OpenVINO, iGPU Intel, NPU Intel o CPU Intel con instrucciones AVX2/AVX-512.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4090, etc.), y también en CPU modernas sin GPU.
- Opciones de despliegue: faster-whisper / CTranslate2 (`ct2/`), OpenVINO GenAI (`openvino/`), whisper.cpp (`ggml/`). No se proporcionan pesos en safetensors ni GGUF para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| ArchTianui/whisper-large-v3-turbo-german-transcriber | ~809 M | 30 s por chunk | de | Apache-2.0 | CT2 int8, OpenVINO int8, GGML q8_0 |
| primeline/whisper-large-v3-turbo-german (modelo base) | ~809 M | 30 s por chunk | de | Apache-2.0 | safetensors (transformers) |
| openai/whisper-large-v3-turbo | ~809 M | 30 s por chunk | multilingüe | MIT | safetensors, CT2, GGML (comunidad) |
| openai/whisper-large-v3 | ~1.550 M | 30 s por chunk | multilingüe | MIT | safetensors, CT2, GGML (comunidad) |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks ni de otros modelos ASR alemanes en la información proporcionada. La diferencia principal frente al modelo base es el empaquetado en formatos cuantizados listos para producción y la verificación por hash; frente a whisper-large-v3-turbo de OpenAI, este modelo está especializado en alemán y es monolingüe.

## Limitaciones y advertencias

- Modelo monolingüe: solo está entrenado y validado para alemán (de-DE); no debe usarse para otros idiomas.
- Estado de validación: el autor declara que la precisión en el entorno real de la aplicación no se ha evaluado y que los modelos que fallen la evaluación serán eliminados del catálogo.
- Riesgo de alucinación: como todo modelo Whisper, puede generar texto plausible en segmentos con silencio, ruido o audio ininteligible, especialmente en pasajes largos sin habla.
- Sesgos: no se documentan análisis de sesgo; al derivar de un corpus alemán concreto (`flozi00/asr-german-mixed`), puede tener peor rendimiento en acentos regionales, dialectos o audio con ruido de fondo no representados en el corpus.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base OpenAI Whisper large-v3-turbo es MIT; conviene conservar los avisos de ambas licencias en la redistribución.
- Sin soporte de diarización ni marcas de hablante; para reuniones con múltiples interlocutores se necesita un componente externo.
- No se ofrecen pesos en safetensors ni GGUF, por lo que no se puede cargar directamente con `transformers` o llama.cpp/Ollama sin reconvertir.
- La ventana de audio es de 30 segundos por chunk; audios más largos requieren segmentación externa (faster-whisper o whisper.cpp la gestionan, pero con posibles cortes en fronteras).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArchTianui/whisper-large-v3-turbo-german-transcriber
- Modelo base (primeLine): https://huggingface.co/primeline/whisper-large-v3-turbo-german
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de entrenamiento citado: https://huggingface.co/datasets/flozi00/asr-german-mixed
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- OpenVINO GenAI: https://github.com/openvinotoolkit/openvino.genai
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
