# GhaythMahadin/moonshine-base-zh-gguf

## Resumen

moonshine-base-zh-gguf es una conversión al formato GGUF del modelo UsefulSensors/moonshine-base-zh, un sistema de reconocimiento automático del habla (ASR) especializado en mandarín. Lo desarrolla GhaythMahadin como port a transcribe.cpp del modelo original de UsefulSensors, que a su vez es un ajuste fino sobre la arquitectura Moonshine base. El modelo resuelve la transcripción de audio a texto en chino con un tamaño muy reducido: 61,5 millones de parámetros y entre 74 y 236 MB según la cuantización.

La relevancia de esta ficha está en su eficiencia extrema para despliegue en entornos con recursos limitados. Frente a los ASR basados en Whisper, Moonshine elimina el preprocesado STFT y el banco de filtros mel, consumiendo PCM crudo a 16 kHz directamente mediante un stem convolucional. Esto reduce latencia y huella de memoria, y permite ejecución en CPU, GPU integrada o dispositivos móviles con un rendimiento en tiempo real muy superior al tiempo real (RTF de 22 a 80,5 según plataforma).

El modelo es monolingüe (chino mandarín), no soporta traducción, detección de idioma ni marcas de tiempo, y está pensado exclusivamente para transcripción. Su licencia MIT facilita el uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine), stem Conv1d de tres capas sin STFT ni mel filterbank |
| Parametros totales | 61.513.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificación: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 (GGUF) |
| Idiomas soportados | chino mandarín (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (transcribe.cpp); pesos originales en safetensors en el modelo base |
| Entrada de audio | PCM crudo mono a 16 kHz |
| Tarea | ASR (transcripción), sin traducción ni detección de idioma |
| Marcas de tiempo | no soportadas |
| Streaming | no soportado |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine original: un transformer encoder-decoder de 62 millones de parámetros que procesa audio a 16 kHz directamente como PCM crudo. La innovación principal respecto a Whisper es la eliminación del preprocesado clásico de audio: en lugar de calcular un espectrograma STFT y aplicar filtros mel, un stem de tres capas Conv1d extrae representaciones directamente de la forma de onda. Esto reduce el coste computacional del frontend y permite ventanas de contexto adaptativas en lugar de los segmentos fijos de 30 segundos de Whisper.

El modelo base UsefulSensors/moonshine-base-zh es un ajuste fino sobre Moonshine base para mandarín. No se dispone de información detallada sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original de UsefulSensors está generada automáticamente y no incluye estos detalles. La conversión a GGUF se realizó desde el commit 1df4f95 del modelo base, fijado el 2026-05-12, y se validó numéricamente contra la referencia de transformers en el commit 90bf720 de transcribe.cpp.

## Capacidades

- Transcripción de voz a texto en chino mandarín a partir de audio PCM mono a 16 kHz.
- Procesamiento de audio sin preprocesado STFT ni banco de filtros mel, lo que simplifica el pipeline de inferencia.
- Ejecución en CPU, GPU integrada y GPU dedicada mediante los backends de transcribe.cpp (Metal, Vulkan, CPU).
- Cuantización a Q8_0 con degradación mínima: 17,00 % CER frente a 16,65 % en F32/F16.
- No soporta traducción, detección de idioma, marcas de tiempo ni streaming.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo puramente ASR.
- No soporta otras modalidades (visión, audio de entrada distinto de voz, etc.).

## Casos de uso

- Transcripción de reuniones y notas de voz en mandarín: el modelo procesa audio de 16 kHz y genera transcripciones con un CER del 16,65 % en FLEURS-zh, adecuado para actas internas y búsqueda posterior en texto.
- Subtitulado offline de contenido audiovisual en chino: al ejecutarse en CPU con RTF de 22 en un Ryzen 4750U, puede transcribir horas de vídeo en una fracción del tiempo real sin GPU dedicada.
- Asistentes de voz embebidos en dispositivos con recursos limitados: con 74 MB en Q8_0 cabe en memoria de microcontroladores de gama alta o en SoCs móviles, permitiendo transcripción local sin conexión.
- Indexación y búsqueda de archivos de audio en mandarín: integrado en pipelines de procesamiento por lotes, convierte grabaciones de llamadas o archivos históricos en texto indexable.
- Accesibilidad para personas con discapacidad auditiva en contextos de habla china: transcripción en tiempo real de conversaciones presenciales o llamadas, ejecutándose en un portátil con GPU integrada.
- Preprocesado para pipelines de NLP en chino: transcripción de audio como paso previo a análisis de sentimiento, resumen o extracción de entidades en aplicaciones de atención al cliente.
- Investigación en ASR de bajo consumo: como referencia ligera para comparar técnicas de cuantización y despliegue en C++ frente a implementaciones en Python.

## Benchmarks y rendimiento

CER medido en el split de test de FLEURS-zh (945 enunciados) con la decodificación por defecto de transcribe.cpp (greedy, num_beams=1, max_length=192):

| Cuantizacion | Tamano | CER (FLEURS zh) |
|---|---:|---:|
| F32 | 236 MB | 16,65 % |
| F16 | 126 MB | 16,65 % |
| Q8_0 | 74 MB | 17,00 % |

Referencia comparativa: la implementación en Transformers (MoonshineForConditionalGeneration, fp32 en MPS) obtiene 16,61 % CER sobre el mismo manifiesto, lo que sitúa las cifras de transcribe.cpp dentro del ruido de la intervalo de confianza bootstrap.

Rendimiento en tiempo real (RTF, mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 79,5 |
| Apple M4 Max | CPU | 80,5 |
| AMD Ryzen 4750U | Vulkan | 34,5 |
| AMD Ryzen 4750U | CPU | 22,0 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; Q8_0 ocupa 74 MB de pesos, F16 126 MB y F32 236 MB, más overhead de runtime.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon) o Vulkan (AMD, Intel, NVIDIA); no requiere GPU dedicada de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU integrada o dedicada de los últimos diez años, incluidas iGPU Intel y AMD.
- Cabe en CPU: sí, con RTF de 22 en un Ryzen 4750U y 80,5 en un M4 Max, muy por encima del tiempo real.
- Opciones de despliegue: transcribe.cpp (bindings C++ con CLI), compilación desde fuente con CMake; no se mencionan otros runtimes en la información disponible.
- Latencia y throughput: RTF de 22 a 80,5 según plataforma, lo que implica procesar entre 22 y 80 segundos de audio por segundo de cómputo.
- Conversión de audio previa necesaria: ffmpeg a 16 kHz mono WAV si la entrada no está en ese formato.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | CER FLEURS-zh | Licencia | Formato |
|---|---:|---|---|---:|---|---|
| moonshine-base-zh-gguf | 61,5 M | no disponible | zh | 16,65 % (F32/F16), 17,00 % (Q8_0) | MIT | GGUF |
| Whisper base | 74 M | 30 s fijos | multilingüe | no disponible en la información | MIT | safetensors, GGUF, etc. |
| Whisper small | 244 M | 30 s fijos | multilingüe | no disponible en la información | MIT | safetensors, GGUF, etc. |
| moonshine-base (original) | 62 M | no disponible | en | no disponible en la información | MIT | safetensors |

La comparación directa con Whisper no está disponible en la información proporcionada. La ventaja estructural de Moonshine frente a Whisper es la eliminación del preprocesado STFT y de las ventanas fijas de 30 segundos, lo que reduce latencia en audios cortos. Whisper ofrece multilingüismo y ecosistema más amplio; Moonshine-base-zh ofrece un tamaño menor y un pipeline de inferencia más simple para chino.

## Limitaciones y advertencias

- Modelo monolingüe: solo transcribe chino mandarín; no detecta idioma ni traduce a otros idiomas.
- Sin marcas de tiempo: no genera timestamps por palabra ni por segmento, lo que limita su uso en subtitulado sincronizado.
- Sin streaming: no soporta transcripción incremental en tiempo real; requiere audio completo o segmentado manualmente.
- CER del 16,65 % en FLEURS-zh: aceptable para contenido general, pero puede ser insuficiente para dominios especializados (médico, legal, técnico) sin ajuste fino.
- Riesgo de alucinación en audio con ruido, acentos marcados o solapamiento de hablantes; no se han publicado evaluaciones específicas de robustez.
- Sesgos: no se dispone de información sobre la composición del dataset de entrenamiento ni sobre sesgos demográficos o dialectales; el mandarín estándar puede tener mejor cobertura que variantes regionales.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo base UsefulSensors no documenta términos adicionales más allá de MIT.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema muy incipiente, sin validación comunitaria extensa.
- Dependencia de transcribe.cpp: el formato GGUF está validado contra un commit concreto (90bf720); versiones futuras del runtime podrían requerir reconversión.
- La model card del modelo base está generada automáticamente y carece de información sobre datos de entrenamiento, procedimiento y evaluación, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/GhaythMahadin/moonshine-base-zh-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-base-zh
- Commit del modelo base: https://huggingface.co/UsefulSensors/moonshine-base-zh/commit/1df4f95
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación de Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Pesos F32: https://huggingface.co/handy-computer/moonshine-base-zh-gguf/resolve/main/moonshine-base-zh-F32.gguf
- Pesos F16: https://huggingface.co/handy-computer/moonshine-base-zh-gguf/resolve/main/moonshine-base-zh-F16.gguf
- Pesos Q8_0: https://huggingface.co/handy-computer/moonshine-base-zh-gguf/resolve/main/moonshine-base-zh-Q8_0.gguf
- Paper de referencia (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
