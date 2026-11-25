# GhaythMahadin/granite-speech-5.0-470m-turboctc-gguf

## Resumen

Granite Speech 5.0 470M TurboCTC es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado originalmente por IBM Research dentro de la familia Granite. Con 473 millones de parámetros, está diseñado específicamente para despliegue en dispositivos de borde (portátiles, smartphones, sistemas embebidos) gracias a su arquitectura no autorregresiva basada en CTC, que permite decodificación voraz en una sola pasada. El modelo recibe audio WAV mono a 16 kHz y produce una transcripción de texto.

La ficha que nos ocupa corresponde a una conversión a formato GGUF realizada por GhaythMahadin para su uso con `transcribe.cpp`, una implementación en C++ orientada a inferencia local eficiente. La conversión se realizó a partir del commit `18ca3c1` del modelo original de IBM y se validó contra la referencia de transformers, manteniendo la licencia Apache-2.0 del modelo base.

Su relevancia actual radica en la combinación de un tamaño reducido (menos de 500 MB en cuantización Q4_K_M), una precisión competitiva en LibriSpeech test-clean (1.33-1.35 % WER según cuantización) y una velocidad de inferencia muy alta, con factores de tiempo real (RTF) que superan las 350 veces en Metal sobre un Apple M4 Max. Esto lo convierte en una opción práctica para transcripción offline en inglés sin dependencia de servicios en la nube.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder acústico) con block self-attention, self-conditioning y downsampling temporal; cabeza CTC auto-condicionada |
| Parámetros totales | 473.014.752 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo ASR de audio, no de texto) |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp); pesos originales en safetensors en el modelo base |
| Entrada | Audio WAV mono a 16 kHz |
| Vocabulario de salida | 16.384 unidades BPE |
| Streaming | No |
| Detección de idioma | No |
| Timestamps | No |
| Traducción | No |

## Arquitectura y entrenamiento

El modelo emplea un encoder Conformer compacto con atención por bloques, self-conditioning y reducción temporal de la secuencia. La cabeza de salida es una capa CTC (Connectionist Temporal Classification) auto-condicionada que mapea las representaciones acústicas a 16.384 unidades BPE. La inferencia es completamente no autorregresiva mediante decodificación voraz, lo que elimina la latencia asociada a la generación token a token y permite un throughput muy elevado.

Según la model card original de IBM, el entrenamiento se realizó sobre aproximadamente 60.000 horas de audio en inglés procedente de corpus públicos, optimizando la pérdida CTC. No se menciona en la información disponible el uso de RLHF, DPO ni datos sintéticos. La innovación principal es la combinación de self-conditioning en el encoder con CTC, que permite mantener una precisión alta (1.33 % WER en LibriSpeech test-clean) con un coste computacional muy bajo y sin modelo de lenguaje externo durante la decodificación.

## Capacidades

- Transcripción de voz a texto offline en inglés a partir de audio WAV mono a 16 kHz.
- Decodificación CTC voraz no autorregresiva, sin modelo de lenguaje externo.
- Alta velocidad de inferencia: RTF de 355,75 en Metal (Apple M4 Max) y 46,07 en CPU (M4 Max), 22,87 en Vulkan y 17,24 en CPU (Ryzen 4750U).
- Ejecución en dispositivos de borde gracias a su tamaño reducido (279 MB en Q4_K_M).
- Precisión estable entre cuantizaciones: 1.33 % WER en Q8_0, Q6_K y F16; 1.34 % en BF16 y Q5_K_M; 1.35 % en Q4_K_M sobre LibriSpeech test-clean.
- No soporta streaming, timestamps, detección de idioma ni traducción.
- No dispone de tool calling, function calling ni capacidades de agente (es un modelo puramente ASR).
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo procesa audio WAV de 16 kHz y genera la transcripción sin conexión, con un WER de en torno al 1,3 % en condiciones limpias. Adecuado para aplicaciones de escritorio que priorizan privacidad.
- Subtitulado offline de contenido audiovisual en inglés: integrado en un pipeline con `ffmpeg` para convertir a WAV mono 16 kHz, permite generar subtítulos en lote con alta velocidad (RTF superior a 300 en Apple Silicon con Metal).
- Dictado por voz en aplicaciones de escritorio: su tamaño de 279 MB en Q4_K_M y su baja latencia lo hacen viable para integrarse en herramientas de productividad que transcriben en tiempo casi real, aunque no sea streaming nativo.
- Procesamiento por lotes de archivos de audio en servidores: con `transcribe.cpp` y decodificación CTC voraz, se pueden transcribir grandes volúmenes de grabaciones en CPU sin GPU dedicada, con un RTF de 17-46 según hardware.
- Asistentes de voz embebidos en dispositivos con recursos limitados: el modelo cabe en memoria de sistemas embebidos y teléfonos, permitiendo reconocimiento de comandos y transcripción local sin enviar audio a la nube.
- Investigación en ASR y evaluación de cuantizaciones: la disponibilidad de múltiples cuantizaciones GGUF con WER medido permite estudiar el impacto de la compresión en la precisión y reproducir resultados con `transcribe.cpp`.
- Archivado y búsqueda de audio histórico: transcripción masiva de archivos de audio en inglés para indexación y búsqueda textual, aprovechando el bajo coste computacional del modelo.

## Benchmarks y rendimiento

Resultados de WER proporcionados en la model card de la conversión GGUF:

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| LibriSpeech test-clean (WER %) | 1,34 | 1,33 | 1,33 | 1,33 | 1,34 | 1,35 |
| FLEURS en (WER %) | no disponible | no disponible | 4,61 | no disponible | no disponible | no disponible |

Referencia del modelo original (transformers 5.17.0, F32, CPU): 1,33 % WER en LibriSpeech test-clean, IC 95 % [1,20; 1,47].

Rendimiento en velocidad (RTF, mayor es mejor):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | CPU | 46,07 |
| Apple M4 Max | Metal | 355,75 |
| AMD Ryzen 4750U | CPU | 17,24 |
| AMD Ryzen 4750U | Vulkan | 22,87 |

La model card original de IBM referencia resultados en el Open ASR Leaderboard y en el FFASR leaderboard (medidos en H200 y L4 respectivamente), pero los valores numéricos concretos no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones. BF16/F16 requieren aproximadamente 948 MB; Q8_0 unos 506 MB; Q6_K 392 MB; Q5_K_M 336 MB; Q4_K_M 279 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon), Vulkan (AMD, Intel) o CUDA. No requiere GPU de datacenter; una GPU integrada es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de memoria, incluidas GTX 1050, RTX 3050, RTX 4090, así como en iGPU y en Apple Silicon.
- También funciona en CPU sin GPU, con RTF de 17-46 en procesadores de portátil.
- Opciones de despliegue: `transcribe.cpp` (compilación con CMake, binario `transcribe-cli`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: con RTF de 355,75 en Metal (M4 Max), una hora de audio se transcribe en aproximadamente 10 segundos. En CPU de portátil (Ryzen 4750U, RTF 17,24), una hora de audio requiere unos 3,5 minutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Contexto/entrada | WER LibriSpeech test-clean | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| Granite Speech 5.0 470M TurboCTC (esta ficha) | 473 M | Inglés | Audio 16 kHz | 1,33-1,35 % | Apache-2.0 | GGUF |
| Whisper large-v3 | 1.550 M | Multilingüe | Audio 16 kHz | No disponible en la información | MIT | safetensors, GGUF, etc. |
| Whisper small | 244 M | Multilingüe | Audio 16 kHz | No disponible en la información | MIT | safetensors, GGUF, etc. |
| Wav2Vec 2.0 base | 95 M | Inglés | Audio 16 kHz | No disponible en la información | MIT/Apache-2.0 | safetensors |

Nota: los datos de los modelos alternativos no están incluidos en la información proporcionada; se indican únicamente como referencia de categoría. No se dispone de cifras comparativas verificadas en esta búsqueda.

## Limitaciones y advertencias

- Solo soporta inglés; no realiza detección de idioma ni traducción.
- No es un modelo de streaming: requiere el audio completo (o segmentos) como entrada.
- No genera timestamps a nivel de palabra ni de segmento.
- El rendimiento puede degradarse en audio con ruido, reverberación o acentos no representados en los corpus de entrenamiento; la model card original referencia evaluaciones en FFASR pero no se dispone de los valores.
- Riesgo de alucinación y errores en nombres propios, términos técnicos y audio de baja calidad, inherente a los modelos CTC sin modelo de lenguaje externo.
- La decodificación voraz sin LM externo puede producir errores ortográficos o segmentaciones subóptimas en comparación con sistemas con rescoring.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la model card original de IBM para términos completos.
- La conversión GGUF es de un tercero (GhaythMahadin) y está validada contra transformers en un commit concreto; cambios en `transcribe.cpp` podrían afectar la compatibilidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- Requiere audio de entrada en WAV mono a 16 kHz; es necesario convertir otros formatos con `ffmpeg`.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/GhaythMahadin/granite-speech-5.0-470m-turboctc-gguf
- Modelo base original de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Commit del modelo base utilizado: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/commit/18ca3c1
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/b9427cf
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-5.0-470m-turboctc.md
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- FFASR Leaderboard: https://huggingface.co/spaces/treble-technologies/ffasr
