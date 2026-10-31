# Phsoft-ai/Notesoop-STT-Ko-v1

## Resumen

Notesoop-STT-Ko-v1 es un modelo de reconocimiento automático de voz (ASR) para coreano desarrollado por Phsoft-ai (equipo detrás de la aplicación Notesoop, "노트숲"). Está diseñado específicamente para ejecutarse en dispositivo (on-device) sobre Apple Silicon mediante PyTorch MPS, resolviendo el problema de transcribir grabaciones largas (clases, conferencias) sin depender de la red ni consumir recursos excesivos del dispositivo.

Técnicamente combina un codificador de audio congelado de EmbeddingGemma-2 (torre de audio de 300M) con un lector acústico Conformer CTC ligero de 21,5M de parámetros y un decodificador KenLM 3-Gram en C++. El resultado es una inferencia no autorregresiva de una sola pasada con un ratio de tiempo real (RTF) de 0,0251, es decir, unas 40 veces más rápido que el tiempo real: 41 minutos de audio procesados en unos 63 segundos en un Apple M1 Pro.

Es relevante ahora porque apuesta por ASR ligero y abierto (Apache-2.0) en un nicho poco atendido: el coreano en dispositivos móviles y portátiles con recursos limitados, con foco en el dominio educativo (clases y contenido académico de larga duración).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer CTC no autorregresivo (10 capas) + codificador de audio EmbeddingGemma-2 congelado + decodificador KenLM 3-Gram |
| Parametros totales | 21,5M (lector acústico) + torre de audio congelada de 300M (EmbeddingGemma-2) |
| Parametros activos | no disponible (el lector entrenable es de 21,5M; el codificador de 300M está congelado) |
| Longitud de contexto | Ventana de audio de 16,0 s con solapamiento de 1,0 s (procesamiento por chunks) |
| Tipos de cuantizacion | bfloat16 nativo en MPS; no disponible información sobre cuantizaciones adicionales |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (safetensors no confirmado); tamaño del repositorio: 0,2 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura en cuatro etapas. Primero, el audio de entrada (16 kHz mono) se divide en chunks de 16 segundos con 1 segundo de solapamiento. Después, la torre de audio de EmbeddingGemma-2 (300M, congelada, 128-Mel, 40 ms por token) extrae características de 768 dimensiones que se proyectan a 256 dimensiones mediante Matryoshka Representation Learning (MRL) y se normalizan con L2. El núcleo entrenable es un lector Conformer de 10 capas (d_model=384, 6 cabezas de atención, FFN de 1536) con 21,5M de parámetros. La salida usa una cabecera CTC por similitud coseno contra un banco esférico congelado de 25.000 vectores correspondientes a morfemas y sílabas coreanas, con `<blank>` como ID 0.

La decodificación se realiza con beam search KenLM 3-Gram en C++ (alpha=0,12, beta=0,40), con opción de greedy CTC. Una innovación destacable es el pipeline asíncrono GPU-CPU: mientras la GPU procesa el siguiente lote de chunks de audio, un pool de hilos en CPU ejecuta en paralelo el beam search de KenLM y la deduplicación de solapamientos entre chunks (Overlap Deduplication). En Apple Silicon se emplea una ruta de tensores bfloat16 nativa que elimina la sobrecarga de conversiones FP32/FP16 en MPS.

El entrenamiento se realizó con aproximadamente 300 GB de datos de voz de clases coreanas del conjunto AI Hub, lo que aporta especialización en el dominio de conferencias: variaciones de velocidad del habla, tono explicativo, terminología académica y habla continua de larga duración. El vocabulario híbrido morfema-sílaba de 25.000 tokens minimiza las pérdidas por palabras fuera de vocabulario (OOV), algo importante en coreano por su naturaleza aglutinante. No se ha publicado información sobre etapas de RLHF/DPO (habitual en ASR, no aplicable).

## Capacidades

- Transcripción de voz en coreano (ASR) en formato long-form, mediante procesamiento por chunks con deduplicación de solapamientos
- Inferencia no autorregresiva de una sola pasada (CTC), sin decodificación autorregresiva, lo que reduce latencia
- Decodificación con modelo de lenguaje KenLM 3-Gram (beam search) o greedy CTC seleccionable
- Ejecución on-device en Apple Silicon (M1/M2/M3/M4) mediante PyTorch MPS en bfloat16
- Backends adicionales soportados: CUDA y CPU
- Robustez en dominio de clases: habla espontánea, terminología académica y grabaciones de horas de duración
- Métricas reportadas: CER y WER sobre Zeroth-Korean

No es un modelo de lenguaje generativo: no soporta tool calling, razonamiento multi-paso ni capacidades de visión o audio generativo. Su función es exclusivamente reconocimiento de voz.

## Casos de uso

- Transcripción de clases y conferencias en universidades: el modelo está entrenado con ~300 GB de audio de clases reales coreanas, por lo que tolera habla continua de larga duración, terminología de especialidad y ritmo variable del docente.
- Aplicaciones de estudio en tabletas y móviles: con 1,2-1,5 GB de VRAM y 21,5M de parámetros entrenables, cabe en dispositivos con recursos limitados sin robar recursos a otras tareas (lectura de PDF, toma de notas).
- Notas automáticas de reuniones en Mac sin conexión a internet: al ejecutarse on-device con PyTorch MPS, no envía audio a servidores, lo que es adecuado para entornos con requisitos de privacidad.
- Procesado masivo de archivos de audio: con un RTF de 0,0251, una hora de audio se transcribe en unos 90 segundos, útil para indexar archivos o generar subtítulos de grabaciones largas.
- Investigación en ASR coreano on-device: al publicarse pesos y pipeline completo bajo Apache-2.0, sirve como base reproducible para experimentos con decodificadores CTC, MRL y KenLM.
- Integración en apps educativas de terceros: la licencia permisiva permite incorporarlo en productos comerciales sin restricciones de licenciamiento.

## Benchmarks y rendimiento

Datos medidos en Apple M1 Pro 16 GB, según la model card del autor:

| Dataset | Duración audio | Tiempo de transcripción | RTF | Throughput | CER | WER |
|---|---|---|---|---|---|---|
| Zeroth-Korean Test (457 frases) | 1 h 11 min (4.287 s) | no disponible (la model card está truncada) | no disponible | no disponible | no disponible | no disponible |

La model card anuncia una velocidad de 39,9x en tiempo real (RTF 0,0251) y 41 minutos de audio procesados en unos 63 segundos. No se han publicado valores numéricos completos de CER/WER en la información disponible, ni comparaciones con otros modelos como Whisper.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,2-1,5 GB según la model card
- Plataforma de referencia: Apple Silicon (M1/M2/M3/M4) con PyTorch MPS en bfloat16; medido en Apple M1 Pro 16 GB
- Consumer GPU: al ocupar solo 1,2-1,5 GB, cabe con holgura en prácticamente cualquier GPU moderna, incluidas las integradas de Apple y GPUs dedicadas de gama media
- Backends adicionales soportados: CUDA y CPU (sin cifras de rendimiento publicadas para estos backends)
- Opciones de despliegue: PyTorch directo con el pipeline incluido en el repositorio (MPS/CUDA/CPU); no se menciona soporte para vLLM, llama.cpp, Ollama o TGI (al no ser un LLM, no aplicable)
- Latencia y throughput: RTF 0,0251 (~40x tiempo real) en M1 Pro; 41 minutos de audio en ~63 segundos

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto de audio | Licencia | Ejecución on-device |
|---|---|---|---|---|---|
| Notesoop-STT-Ko-v1 | 21,5M (lector) + 300M (encoder congelado) | Coreano | Chunks de 16 s | Apache-2.0 | Sí, optimizado para Apple Silicon (MPS, bfloat16) |
| Whisper (openai/whisper-small) | 244M | Multilingüe (99 idiomas) | 30 s por ventana | MIT | Sí, pero más pesado; decodificación autorregresiva |
| Whisper (openai/whisper-tiny) | 39M | Multilingüe (99 idiomas) | 30 s por ventana | MIT | Sí, ligero pero con menor precisión en coreano |
| Whisper (openai/whisper-large-v3) | 1.550M | Multilingüe (99 idiomas) | 30 s por ventana | MIT | Exige hardware considerable para on-device |

Frente a Whisper, Notesoop-STT-Ko-v1 se especializa exclusivamente en coreano con dominio de clases académicas, usa decodificación CTC no autorregresiva (más rápida) y está optimizado explícitamente para Apple Silicon. Whisper ofrece multilingüidad y un ecosistema más maduro, a costa de mayor consumo de recursos en tamaños equivalentes de precisión.

## Limitaciones y advertencias

- Mono-idioma: solo reconoce coreano; no sirve para contenido multilingüe o en otros idiomas
- Especialización en dominio de clases: el rendimiento en otros dominios (conversaciones telefónicas, ruido ambiental extremo, dicción muy dialectal) no está documentado y podría degradarse
- No se han publicado valores numéricos completos de CER/WER en la información disponible, lo que dificulta la evaluación rigurosa de precisión antes de probarlo
- Modelo muy reciente (creado en octubre de 2026) con 0 descargas registradas: carece de validación comunitaria y de historial en producción
- Métricas de velocidad medidas únicamente en Apple M1 Pro; el rendimiento en MPS de otros chips, CUDA o CPU no está documentado
- Riesgo de alucinaciones propio de sistemas CTC: inserciones o repeticiones en silencios largos, aunque el uso de KenLM y deduplicación de solapamientos puede mitigarlas parcialmente
- Procesamiento por chunks de 16 s: la coherencia en fronteras entre chunks depende de la deduplicación de solapamiento, un punto a validar en grabaciones con cortes abruptos
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, aunque conviene revisar los términos de los datos de entrenamiento de AI Hub si se reentrena

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Phsoft-ai/Notesoop-STT-Ko-v1
- Codificador base: https://huggingface.co/google/embeddinggemma-2
- Dataset de evaluación: https://huggingface.co/datasets/Bingsu/zeroth-korean
- App Notesoop en App Store: https://apps.apple.com/kr/app/notesoop/id6760303593
- App Notesoop en Google Play: https://play.google.com/store/apps/details?id=com.phsoft.notesoop
- Paper o blog técnico: no disponible
