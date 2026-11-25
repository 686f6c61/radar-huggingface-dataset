# GhaythMahadin/parakeet-ctc-1.1b-gguf

## Resumen

parakeet-ctc-1.1b-gguf es una conversion al formato GGUF del modelo de reconocimiento automatico del habla (ASR) nvidia/parakeet-ctc-1.1b, publicada por el usuario GhaythMahadin para su uso con transcribe.cpp, un motor de inferencia en C++ orientado a transcripcion de audio. El modelo original lo desarrollaron conjuntamente los equipos de NVIDIA NeMo y Suno.ai, y esta disenado para transcribir voz en ingles en alfabeto minusculo mediante decodificacion CTC voraz.

Se trata de un encoder FastConformer-XL de aproximadamente 1.100 millones de parametros (1.062.626.305 reales) con una cabeza CTC lineal. No es un modelo generativo ni conversacional: no traduce, no detecta idioma y no soporta streaming, pero ofrece una precision muy alta en transcripcion offline, con un WER del 1,85 % en LibriSpeech test-clean, practicamente identico al 1,83 % reportado por NVIDIA.

Su relevancia practica radica en las cuantizaciones: la version Q4_K_M ocupa 818 MB y mantiene un WER del 1,90 %, lo que permite ejecutar un ASR de calidad estado del arte en CPU consumer, portatiles con Metal o GPUs modestas con Vulkan, sin dependencias de Python ni de CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-XL (Conformer) con cabeza CTC lineal |
| Parametros totales | 1.062.626.305 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, ventana de audio no documentada en la informacion) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer CTC en version XXL, una variante eficiente del Conformer que combina atencion por bloques con convoluciones para reducir el coste computacional en secuencias de audio largas. Sobre el encoder se situa una cabeza CTC lineal que produce directamente la secuencia de tokens sin decodificador autorregresivo, lo que abarata la inferencia. El modelo fue desarrollado por NVIDIA NeMo y Suno.ai; los detalles sobre volumen de datos de entrenamiento, composicion del corpus y uso de tecnicas de ajuste fino no estan disponibles en la informacion proporcionada.

La version GGUF se genero a partir del commit a707e81 del modelo upstream (fijado el 2026-05-10) y se valido numericamente contra la referencia de NeMo en el commit 42528dd de transcribe.cpp. La decodificacion es CTC voraz sin modelo de lenguaje externo, y el modelo emite marcas de tiempo a nivel de token. La salida es texto en minusculas y sin puntuacion.

## Capacidades

- Transcripcion de voz a texto offline en ingles con alta precision (WER 1,85 % en LibriSpeech test-clean).
- Decodificacion CTC voraz sin modelo de lenguaje externo.
- Salida con marcas de tiempo a nivel de token (timestamps: token).
- Ejecucion en CPU, Metal (Apple Silicon) y Vulkan mediante transcribe.cpp.
- Multiples niveles de cuantizacion con degradacion minima de precision (Q5_K_M incluso mejora ligeramente el WER frente a F32 en la medicion reportada).
- No soporta streaming (streaming: false).
- No soporta traduccion (translate: false).
- No realiza deteccion de idioma (lang_detect: false).
- No es un modelo generativo: no hace tool calling, agentes, razonamiento multi-paso ni otras capacidades de LLM.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo convierte grabaciones de audio en ingles en texto plano con marcas de tiempo por token, lo que permite alinear segmentos con notas o actas. Su WER inferior al 2 % en audio limpio lo hace adecuado para documentacion interna.
- Subtitulado offline de contenido en ingles: con las marcas de tiempo a nivel de token se pueden generar subtitulos sincronizados sin depender de servicios en la nube, ejecutando la cuantizacion Q5_K_M (929 MB) en un portatil.
- Procesamiento por lotes de archivos de audio: al ser un binario C++ sin dependencias de Python, se puede integrar en pipelines de shell o CI para transcribir grandes volumenes de WAV de 16 kHz mono de forma reproducible.
- Despliegue en dispositivos con recursos limitados: la version Q4_K_M (818 MB) permite transcripcion en equipos consumer, portatiles sin GPU dedicada o entornos embebidos con CPU, gracias a los ratios de tiempo real medidos (RTF 17,5 en Metal en M4 Max y 6 en CPU Ryzen 4750U).
- Investigacion en ASR: sirve como referencia cuantizada para comparar decodificacion CTC, validar implementaciones de motores de inferencia o hacer fine-tuning sobre el checkpoint base en NeMo.
- Transcripcion de podcasts y notas de voz: la precision en audio limpio y la ausencia de coste por API lo hacen util para convertir archivos de audio personales en texto buscable.
- Preprocesado para pipelines de NLP: la salida en minusculas sin puntuacion puede alimentar directamente tareas posteriores de indexacion, busqueda o analisis de texto.

## Benchmarks y rendimiento

WER en LibriSpeech test-clean (2620 utterances, decodificacion CTC voraz, sin LM externo):

| Cuantizacion | Tamano | WER |
|---|---:|---:|
| F32 | 4,25 GB | 1,85 % |
| F16 | 2,13 GB | 1,85 % |
| Q8_0 | 1,26 GB | 1,85 % |
| Q6_K | 1,04 GB | 1,85 % |
| Q5_K_M | 929 MB | 1,84 % |
| Q4_K_M | 818 MB | 1,90 % |

Referencia: NVIDIA reporta 1,83 % en el mismo split; la baseline F32 de esta conversion es 1,85 %.

Rendimiento (ratio de tiempo real, RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 139,5 |
| Apple M4 Max | CPU | 17,5 |
| Ryzen 4750U | Vulkan | 14 |
| Ryzen 4750U | CPU | 6 |

## Requisitos de hardware

- VRAM/espacio en disco: desde 818 MB (Q4_K_M) hasta 4,25 GB (F32); en la practica la inferencia cabe en RAM o VRAM muy modesta.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Se beneficia de Metal en Apple Silicon (M4 Max alcanza RTF 139,5) y de Vulkan en GPUs integradas o discretas (Ryzen 4750U con RTF 14).
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer o incluso sin GPU, dado el tamano reducido de las cuantizaciones.
- Opciones de despliegue: transcribe.cpp (motor nativo C++), con binario transcribe-cli; el modelo base tambien puede ejecutarse con NVIDIA NeMo o con Transformers.
- Latencia y throughput: RTF de 139,5 (Metal, M4 Max), 17,5 (CPU, M4 Max), 14 (Vulkan, Ryzen 4750U) y 6 (CPU, Ryzen 4750U); valores superiores a 1 indican procesamiento mas rapido que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---|---|---|---|
| parakeet-ctc-1.1b-gguf (esta ficha) | 1,06 B | no disponible | 1,85 % (Q4_K_M: 1,90 %) | CC-BY-4.0 | GGUF |
| nvidia/parakeet-ctc-1.1b (base) | 1,1 B | no disponible | 1,83 % (reportado por NVIDIA) | CC-BY-4.0 | safetensors / NeMo |
| Whisper large-v3 | no disponible en la informacion | no disponible | no disponible en la informacion | no disponible en la informacion | no disponible |

La comparacion con alternativas como Whisper no puede completarse con datos de la informacion proporcionada; los unicos datos verificables son los del modelo base y sus cuantizaciones.

## Limitaciones y advertencias

- Solo soporta ingles; no traduce ni detecta idioma automaticamente.
- No es un modelo de streaming: requiere el audio completo para transcribir.
- Salida en minusculas y sin puntuacion, lo que limita su uso directo en textos finales sin postprocesado.
- No es un LLM: carece de razonamiento, tool calling, agentes o generacion de texto libre.
- Riesgo de errores en audio con ruido, acentos no estadounidenses, solapamiento de hablantes o vocabulario tecnico fuera del dominio de entrenamiento; el WER del 1,85 % corresponde a LibriSpeech, un corpus de audio limpio.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; conviene revisar los terminos del modelo base en NVIDIA para obligaciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una conversion de terceros, no oficial de NVIDIA, y su mantenimiento no esta garantizado.
- Requiere audio de entrada a 16 kHz mono WAV; es necesario convertir otros formatos previamente con ffmpeg.
- El modelo base esta fijado a un commit concreto (a707e81); cambios posteriores en upstream no se reflejan automaticamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/parakeet-ctc-1.1b-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-ctc-1.1b
- Commit del modelo base: https://huggingface.co/nvidia/parakeet-ctc-1.1b/commit/a707e81
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/42528dd
- Pagina del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/parakeet-ctc-1.1b.md
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentacion de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Paper de FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Suno.ai: https://www.suno.ai/
- Transformers de Hugging Face: https://github.com/huggingface/transformers
