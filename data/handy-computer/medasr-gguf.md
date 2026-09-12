# handy-computer/medasr-gguf

## Resumen

medasr-gguf es la conversión a formato GGUF del modelo google/medasr, un sistema de reconocimiento automático de voz (ASR) en inglés especializado en dictado médico. Lo publica el proyecto handy-computer dentro del ecosistema transcribe.cpp, una implementación de inferencia centrada en modelos de voz, y está pensado para ejecutarse en local sobre CPU, Metal (macOS) o Vulkan sin depender de servicios en la nube. El modelo base lo desarrolla Google y forma parte de su programa Health AI Developer Foundations.

Técnicamente es un encoder Conformer de 17 capas con atención RoPE, bloques FFN tipo macaron y una cabeza CTC con vocabulario SentencePiece de 512 tokens. Cuenta con 105.316.112 parámetros y decodificación CTC voraz, sin modelo de lenguaje externo ni búsqueda por haces. No es un modelo de lenguaje: no tiene ventana de contexto textual y trabaja sobre audio de 16 kHz mono en formato WAV.

Su relevancia práctica está en el tamaño: las cuantizaciones van de 79 MB (Q4_K_M) a 417 MB (F32), lo que permite transcripción médica offline en portátiles, equipos de sobremesa o servidores modestos. El autor recomienda Q8_0 (122 MB) como preset por defecto, al no mostrar degradación estadísticamente detectable frente a F32. El modelo hereda la licencia Health AI Developer Foundations del modelo base, no una licencia open source convencional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder de 17 capas) con atención RoPE, FFN macaron y cabeza CTC |
| Parámetros totales | 105.316.112 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo ASR); cabeza CTC con vocabulario SentencePiece de 512 tokens |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Other (Health AI Developer Foundations, heredada de google/medasr) |
| Formato de pesos | GGUF (librería transcribe.cpp) |
| Modelo base | google/medasr (commit ae1e484, fijado el 2026-06-04) |
| Modalidad de entrada | Audio WAV 16 kHz mono |
| Decodificación | CTC voraz (sin LM externo, sin beam search) |
| Timestamps | A nivel de token |
| Streaming | No soportado |
| Traducción | No soportada |
| Detección de idioma | No soportada |
| Descargas en HuggingFace | 1.450 |
| Tamaño del repositorio | 5,2 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Conformer descrita en el paper arXiv:2005.08100: un encoder de 17 capas que combina bloques de auto-atención con convoluciones, atención con codificación posicional rotatoria (RoPE) y redes feed-forward con estructura macaron (dos FFN con conexión residual en lugar de una). La salida se resuelve con una cabeza CTC sobre un vocabulario SentencePiece de 512 tokens y decodificación voraz, sin modelo de lenguaje externo ni beam search. Esa decisión reduce el coste computacional y la huella de memoria, a cambio de renunciar a la corrección contextual que aporta un LM.

El modelo base fue preentrenado por Google sobre un corpus de audio médico, según indica su model card, con el objetivo de servir como punto de partida para dictado clínico. La información proporcionada no detalla el número de tokens de audio, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO, por lo que esos datos se consideran no disponibles. La conversión GGUF se realizó desde el commit ae1e484 y se validó contra la referencia de transformers en el commit 65dc2615 (rama dev, v5.0.0 no publicada) usando transcribe.cpp en el commit 782abfd, con coincidencia exacta de WER entre la referencia F32 de transformers y la F32 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en inglés, offline, sobre audio WAV de 16 kHz mono.
- Dictado médico: optimizado para terminología clínica en radiología, medicina interna y medicina de familia.
- Decodificación CTC voraz con timestamps a nivel de token.
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan, mediante la librería transcribe.cpp.
- No soporta streaming: requiere el audio completo como entrada.
- No soporta traducción ni detección automática de idioma.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo ASR puro, sin interfaz conversacional.
- No procesa imágenes ni audio multimodal; únicamente señal de voz.

## Casos de uso

- Dictado radiológico: transcripción de informes de radiología directamente en el puesto de trabajo, aprovechando el ajuste fino del modelo sobre terminología de imagen diagnóstica y su ejecución local sin enviar audio a la nube.
- Dictado en consulta de medicina interna y de familia: captura de notas clínicas en tiempo real o diferido sobre grabaciones cortas, con un modelo de 105 M de parámetros que cabe en cualquier portátil.
- Integración en aplicaciones de dictado de escritorio: el modelo se distribuye como GGUF para transcribe.cpp y puede incrustarse en herramientas tipo Handy (aplicación de voz a texto multiplataforma del mismo ecosistema) mediante el binario transcribe-cli.
- Procesamiento por lotes en servidor: conversión previa de los audios a 16 kHz mono con ffmpeg y ejecución por lotes con la cuantización Q8_0, que mantiene un WER de 17,86 % en LibriSpeech test-clean con solo 122 MB de pesos.
- Despliegue en hardware limitado: las variantes Q5_K_M (90 MB) y Q6_K (101 MB) permiten inferencia en CPU de gama baja o equipos embebidos donde no cabría un modelo ASR de mayor tamaño.
- Preanotación de corpus clínicos: generación automática de transcripciones iniciales sobre grabaciones médicas para revisión humana posterior, reduciendo el coste de anotación manual.
- Prototipado y fine-tuning: al ser una conversión del modelo base google/medasr, sirve como punto de partida para adaptar el sistema a una especialidad o acento concreto antes de exportar de nuevo a GGUF.
- Investigación en ASR médico: permite reproducir y comparar resultados CTC sin modelo de lenguaje sobre hardware de consumo, útil para estudiar el impacto de las cuantizaciones en el WER.

## Benchmarks y rendimiento

WER medido sobre la partición completa LibriSpeech test-clean (2.620 enunciados), con decodificación CTC voraz y sin LM externo. La referencia F32 con HuggingFace transformers sobre MPS de Mac es del 17,88 %.

| Cuantización | Tamaño | WER (LibriSpeech test-clean) |
|---|---:|---:|
| F32 | 417 MB | 17,88 % |
| F16 | 202 MB | 17,88 % |
| Q8_0 | 122 MB | 17,86 % |
| Q6_K | 101 MB | 17,93 % |
| Q5_K_M | 90 MB | 17,91 % |
| Q4_K_M | 79 MB | 18,14 % |

El autor señala que el WER absoluto es superior al de un ASR de propósito general (cita Whisper-base con ~5 %) porque el modelo está ajustado para dictado médico. Sobre los conjuntos internos del publicador (RAD-DICT, GENERAL-DICT y FM-DICT) el modelo obtiene entre 6,6 % y 9,3 %, pero esos datasets no son reproducibles públicamente. Según la model card, Q4_K_M presenta una degradación real de +0,26 puntos porcentuales y no se recomienda; Q8_0 es el preset por defecto recomendado y Q5_K_M la alternativa si se necesita un tamaño inferior a Q8_0.

Factor de tiempo real (RTF) publicado por el autor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 354,5 |
| Apple M4 Max | CPU | 65,5 |
| Ryzen 4750U | Vulkan | 71 |
| Ryzen 4750U | CPU | 19,5 |

La información disponible no especifica si estos valores de RTF se expresan como cociente de tiempos o como múltiplo de velocidad respecto al tiempo real, por lo que deben interpretarse únicamente como cifras comparativas publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 0,5 GB en todas las cuantizaciones. F32 requiere 417 MB, F16 202 MB, Q8_0 122 MB, Q6_K 101 MB, Q5_K_M 90 MB y Q4_K_M 79 MB.
- Cabe en cualquier GPU de consumo, e incluso en GPU integradas: los pesos más pequeños ocupan menos de 100 MB, por lo que el cuello de botella es la memoria del sistema o el backend de cómputo, no la VRAM.
- Funciona sin GPU: el autor publica cifras de RTF en CPU tanto para Apple M4 Max (65,5) como para Ryzen 4750U (19,5).
- Backends soportados: Metal en macOS y Vulkan en Linux/Windows, además de ejecución en CPU. Validado en Apple M4 Max y AMD Ryzen 4750U.
- Despliegue: compilación desde fuente de transcribe.cpp con CMake (`cmake -B build && cmake --build build`) y ejecución mediante `build/bin/transcribe-cli -m medasr-Q8_0.gguf input.wav`.
- No es compatible con runtimes de modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI: la librería declarada es transcribe.cpp y el modelo es un encoder ASR, no un transformer causal.
- Preprocesado obligatorio: si la entrada no es WAV mono a 16 kHz, hay que convertirla, por ejemplo con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- Latencia y throughput: no se publican cifras de latencia absoluta ni de throughput en tiempo real más allá de los valores de RTF de la tabla anterior.

## Comparativa con modelos similares

La información proporcionada solo incluye una referencia comparativa explícita (Whisper-base) y no aporta el resto de sus especificaciones, por lo que buena parte de los campos quedan como no disponibles.

| Modelo | Parámetros | Idiomas | WER (LibriSpeech test-clean) | Licencia | Formato |
|---|---|---|---|---|---|
| medasr-gguf (Q8_0) | 105.316.112 | Inglés | 17,86 % | Health AI Developer Foundations | GGUF |
| Whisper-base (referencia citada por el autor) | No disponible | No disponible | ~5 % | No disponible | No disponible |

No se dispone de datos de otros modelos comparables (por ejemplo variantes de Whisper de mayor tamaño, sistemas ASR médicos propietarios u otros modelos Conformer CTC) en la información proporcionada. La comparación relevante que sí aporta el autor es interna: frente a un ASR generalista, medasr sacrifica WER en dominio general a cambio de un rendimiento de 6,6 %–9,3 % en los conjuntos de dictado médico del publicador, no reproducibles públicamente.

## Limitaciones y advertencias

- Licencia restrictiva: hereda los términos Health AI Developer Foundations de Google, no una licencia open source permisiva. Es obligatorio revisar dichos términos antes de cualquier uso comercial o clínico.
- WER elevado fuera de dominio: 17,88 % en LibriSpeech test-clean, muy por encima de un ASR generalista. No es adecuado para transcripción general en inglés.
- Solo inglés. No soporta otros idiomas, ni traducción, ni detección automática de idioma.
- Sin streaming: exige disponer del audio completo antes de transcribir, lo que limita casos de uso de dictado en vivo con baja latencia.
- Sin modelo de lenguaje ni beam search: la decodificación voraz sobre CTC penaliza nombres de medicamentos no estándar, fechas, horas y duraciones, tal como advierte el publicador del modelo base.
- Riesgo de alucinación: como todo sistema ASR, puede generar transcripciones gramaticalmente plausibles pero incorrectas, especialmente con audio ruidoso o terminología fuera de su preentrenamiento.
- Datos de evaluación médica no reproducibles: las cifras de 6,6 %–9,3 % proceden de datasets internos del publicador (RAD-DICT, GENERAL-DICT, FM-DICT) que no están disponibles públicamente, por lo que no pueden verificarse de forma independiente.
- Timestamps únicamente a nivel de token, no de palabra ni de segmento.
- Entrada restringida: requiere WAV mono a 16 kHz; cualquier otro formato necesita conversión previa.
- Sesgos: la model card no documenta análisis de sesgo por acento, género o edad. Al estar entrenado sobre corpus médico, es previsible un peor rendimiento con acentos no representados en el preentrenamiento, aunque no se aportan datos al respecto.
- Aviso para producción clínica: el modelo se presenta como punto de partida para desarrolladores. No se ha publicado validación regulatoria como dispositivo médico; cualquier uso asistencial requiere validación local y supervisión humana.
- La cuantización Q4_K_M no se recomienda por degradación de WER (+0,26 puntos porcentuales); usar Q8_0 o, en su defecto, Q5_K_M.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/handy-computer/medasr-gguf
- Modelo base google/medasr: https://huggingface.co/google/medasr
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación de medasr en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/medasr.md
- Commit de conversión usado en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/782abfd
- Commit del modelo base (ae1e484): https://huggingface.co/google/medasr/commit/ae1e484
- Documentación de MedASR en Google: https://developers.google.com/health-ai-developer-foundations/medasr
- MedASR en Google Cloud Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/medasr
- Repositorio Google Health MedASR: https://github.com/google-health/medasr
- Notebook de inicio rápido: https://github.com/google-health/medasr/blob/main/notebooks/quick_start_with_hugging_face.ipynb
- Notebook de fine-tuning: https://github.com/google-health/medasr/blob/main/notebooks/fine_tune_with_hugging_face.ipynb
- Términos de uso (Health AI Developer Foundations): https://developers.google.com/health-ai-developer-foundations/terms
- Informe técnico de MedASR (preprint): https://arxiv.org/abs/2605.16555
- Paper de la arquitectura Conformer: https://arxiv.org/abs/2005.08100
- Referencia adicional incluida en las etiquetas del repositorio: https://arxiv.org/abs/2304.13134
- Referencia adicional incluida en las etiquetas del repositorio: https://arxiv.org/abs/2309.08105
- Aplicación Handy (voz a texto, mismo ecosistema): https://handy.computer/
- Descarga de Handy: https://handy.computer/download.html
