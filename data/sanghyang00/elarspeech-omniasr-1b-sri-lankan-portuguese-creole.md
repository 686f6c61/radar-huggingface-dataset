# Sanghyang00/ELARSpeech-OmniASR-1B-sri-lankan-portuguese-creole

## Resumen

ELARSpeech-OmniASR-1B-sri-lankan-portuguese-creole es un modelo de reconocimiento automatico del habla (ASR) especializado en criollo portugues de Sri Lanka, publicado por el usuario Sanghyang00 en HuggingFace. Se trata de un ajuste fino del checkpoint aadel4/omniASR-CTC-1B-v2, un modelo base de aproximadamente 1.000 millones de parametros orientado a ASR con cabecera CTC. La relevancia principal radica en que cubre una lengua de muy bajos recursos, sin codigo ISO 639-3 asignado, para la que practicamente no existen sistemas ASR publicos.

El modelo emplea la arquitectura `Wav2Vec2ForCTC`, con 975.677.617 parametros reales segun los pesos en safetensors y un repositorio de 3,9 GB. La entrada debe ser audio mono a 16 kHz. No se especifica la longitud de contexto en terminos de tokens ni el numero de parametros activos, ya que no es un modelo MoE.

Su publicacion (fechada en octubre de 2026 en la ficha) responde a la estrategia de la familia ELARSpeech de exportar y verificar artefactos derivados de checkpoints base, en este caso con una verificacion de transcripcion exacta marcada como PASS sobre un conjunto fijo de evaluacion. Al no haberse publicado benchmarks ni datos de licencia en la informacion disponible, su adopcion en produccion requiere una validacion propia y una revision legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (transformer encoder + cabecera CTC) |
| Parametros totales | 975.677.617 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada mono a 16 kHz) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | criollo portugues de Sri Lanka (unico idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura `Wav2Vec2ForCTC`: un extractor de caracteristicas convolucional sobre la onda de audio, seguido de un codificador transformer que produce representaciones contextuales y una cabecera de clasificacion lineal con perdida CTC (Connectionist Temporal Classification) para la decodificacion de secuencias sin alineacion previa. El modelo base es aadel4/omniASR-CTC-1B-v2, del cual este checkpoint constituye un ajuste fino para un unico idioma.

No se dispone de informacion sobre el volumen de horas de audio, la composicion del corpus, el regimen de entrenamiento (preentrenamiento, fine-tuning supervisado, uso de RLHF/DPO) ni detalles de tokenizer o vocabulario CTC especificos. La model card indica unicamente que el artefacto exportado se verifica contra el checkpoint original de ELARSpeech sobre un conjunto fijo de evaluacion, con estado de verificacion de transcripcion exacta PASS.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) para criollo portugues de Sri Lanka.
- Transcripcion de audio mono muestreado a 16 kHz (requiere remuestreo si la fuente es distinta).
- Decodificacion CTC: `processor.batch_decode(ids)` sobre los argmax de los logits.
- Inferencia con la libreria `transformers` mediante `AutoProcessor` y `Wav2Vec2ForCTC`.
- Compatibilidad con endpoints gestionados (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de salida.
- No se documenta capacidad multilingue: es un modelo de un solo idioma.

## Casos de uso

- Transcripcion de archivos de audio historicos en criollo portugues de Sri Lanka: el modelo convierte grabaciones mono a 16 kHz en texto, util para digitalizar material oral de una lengua con escasa representacion digital.
- Documentacion linguistica y preservacion: investigadores pueden transcribir entrevistas y corpus orales para construir anotaciones y estudios morfosintacticos, dado que no existen alternativas ASR publicas para este idioma.
- Subtitulado de contenido audiovisual comunitario: integrado en un pipeline de extraccion de audio (por ejemplo con ffmpeg a WAV mono 16 kHz) seguido de `Wav2Vec2ForCTC`, permite generar subtitulos para videos en esta lengua.
- Archivado y busqueda de contenido oral: la transcripcion habilita indexacion y busqueda por texto sobre archivos de audio, algo imposible sin ASR.
- Asistencia a la traduccion manual posterior: la transcripcion sirve como paso previo a un sistema de traduccion independiente, ya que este modelo no traduce.
- Soporte a proyectos comunitarios de revitalizacion linguistica: transcripcion de material educativo o testimonios para publicacion en formato texto.
- Evaluacion comparativa de ASR de bajos recursos: sirve como referencia base para medir mejoras de futuros ajustes sobre el mismo idioma, dado su estado de verificacion PASS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el artefacto exportado supera una verificacion de transcripcion exacta (PASS) frente al checkpoint original sobre un conjunto fijo de evaluacion, sin aportar WER, CER ni cifras de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,9 GB en FP32 (coincide con el tamano del repo), en torno a 2 GB en FP16/BF16 y cerca de 1-1,2 GB en int8, para los 975,7 millones de parametros.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32 (por ejemplo GTX 1650, RTX 3050) y con 2-4 GB para precision media (RTX 3060, RTX 4090, T4, L4).
- Compatible con GPU de consumo: si, cabe en tarjetas consumer modernas (RTX 3060, RTX 4060, RTX 4090, entre otras) incluso en FP32; en FP16 cabe en GPUs de gama de entrada.
- CPU: la inferencia es viable en CPU para audio corto, aunque mas lenta; util para procesamiento por lotes offline.
- Opciones de despliegue: `transformers` en PyTorch esta confirmado; el tag `endpoints_compatible` apunta a despliegue en Inference Endpoints. No se documentan vLLM, llama.cpp, Ollama ni TGI, y no hay variantes GGUF publicadas, por lo que no se garantiza su uso con esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| ELARSpeech-OmniASR-1B-sri-lankan-portuguese-creole | 975,7 M | Wav2Vec2 + CTC | criollo portugues de Sri Lanka | no disponible | Foco en un unico idioma de muy bajos recursos |
| facebook/mms-1b-all | ~1.000 M | Wav2Vec2 + adaptadores | mas de 1.100 idiomas | CC-BY-NC 4.0 | Multilingue; requiere adaptador por idioma |
| openai/whisper-large-v3 | 1.550 M | encoder-decoder transformer | ~99 idiomas (no incluye este criollo) | MIT | ASR y traduccion; no cubre esta lengua |
| aadel4/omniASR-CTC-1B-v2 | ~1.000 M | Wav2Vec2 + CTC | no disponible | no disponible | Modelo base del que deriva este checkpoint |

Los datos de parametros y licencias de los modelos comparativos corresponden a informacion publica general; no se dispone de cifras de rendimiento comparadas (WER/CER) con este modelo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo mono-idioma: no es valido para otros idiomas ni para traduccion.
- No se han publicado sesgos conocidos ni evaluaciones de equidad; al entrenarse sobre una poblacion de hablantes concreta, la precision puede variar por hablante, dialecto y condicion de grabacion.
- Riesgo de alucinacion y de errores de transcripcion: la model card advierte que la precision varia segun condiciones de grabacion, poblacion de hablantes, ortografia y dominio.
- Requisito estricto de entrada: audio mono a 16 kHz; cualquier otra frecuencia o configuracion estara fuera de distribucion.
- Licencia no disponible: no se puede confirmar el uso comercial. La propia model card remite a los terminos del proyecto ELARSpeech y a la licencia del modelo base, por lo que se debe verificar antes de cualquier despliegue productivo.
- Sin datos de entrenamiento ni benchmarks: no es posible estimar WER esperado ni comparar objetivamente con alternativas.
- Adopcion limitada: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sanghyang00/ELARSpeech-OmniASR-1B-sri-lankan-portuguese-creole
- Modelo base: https://huggingface.co/aadel4/omniASR-CTC-1B-v2
