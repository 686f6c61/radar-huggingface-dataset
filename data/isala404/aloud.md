# isala404/aloud

## Resumen

Aloud es un motor de inferencia de audio en Rust que ejecuta modelos de reconocimiento automático de voz (ASR) y síntesis de voz (TTS) directamente desde contenedores GGUF v3. El repositorio `isala404/aloud` publica seis modelos cuantizados y en punto flotante que combinan dos arquitecturas distintas: `audio8_asr` para transcripción y `audio8_tts` para síntesis, con tamaños de 0,1B y 0,6B parámetros. El proyecto lo desarrolla Isala Piyarisi (isala404) y destaca por no depender de ningún runtime externo como ggml, llama.cpp, C++, ONNX o PyTorch; toda la ejecución se realiza con kernels propios de CPU y wgpu.

La relevancia de este repositorio radica en que ofrece modelos de audio autocontenidos y verificados criptográficamente, con voces embebidas para síntesis sin necesidad de referencias externas. Los archivos GGUF incluyen el codec neuronal, tokenizador, configuración y voces estables llamadas `sky` y `aiden`. La licencia es mixta por archivo, lo que obliga a revisar las condiciones antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `audio8_asr` (ASR), `audio8_tts_01` y `audio8_tts_06` (TTS) |
| Parámetros totales | 324.016.264 (conjunto completo; los modelos individuales son 0,1B y 0,6B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 y f32 |
| Idiomas soportados | no disponible |
| Licencia | Mixta por archivo: CC BY-NC 4.0 (ASR), Audio8 Community License v1.0 (TTS-0.1b), Apache-2.0 (TTS-0.6b) |
| Formato de pesos | GGUF v3 |

## Arquitectura y entrenamiento

Los modelos emplean arquitecturas específicas de Audio8: `audio8_asr` para reconocimiento de voz y `audio8_tts_01` / `audio8_tts_06` para síntesis. El codec neuronal embebido en todos los archivos TTS está inspirado en el diseño DualAR de Fish Audio S2 Pro, según el aviso Apache NOTICE conservado. La conversión a GGUF realiza una normalización de pesos del codec, escribe layouts tensoriales optimizados para Aloud, preserva los bloques Q8_0 nativos y alinea las cargas tensoriales a 64 bytes.

Los datos de entrenamiento, el número de tokens, el proceso de alineamiento (RLHF, DPO, etc.) y cualquier detalle sobre el dataset no se han publicado en la información disponible. El repositorio no incluye los checkpoints originales ni los datos de referencia de las voces, pero sí verifica los hashes SHA-256 de los checkpoints de origen antes de la conversión. La verificación de la versión publicada cubre la paridad con la etapa PyTorch, transcripciones ASR, rejillas de tokens TTS en f32, SNR de la forma de onda del codec, voces embebidas y externas, y pruebas de ida y vuelta TTS-a-ASR.

## Capacidades

- Transcripción de voz a texto (ASR) mediante el modelo `audio8_asr` en formato GGUF.
- Síntesis de voz (TTS) con los modelos `audio8_tts_01` y `audio8_tts_06`, capaces de generar audio completo a partir de texto.
- Clonación de voz mediante la creación de archivos `.aloudvoice` externos a partir de clips de referencia.
- Voces estables embebidas (`sky` y `aiden`) que funcionan sin necesidad de audio de referencia externo.
- Inferencia autocontenida: cada archivo GGUF incluye backbone, tokenizador, configuración y codec, sin dependencias externas.
- Ejecución nativa en Rust con kernels de CPU y wgpu, sin necesidad de runtime de Python ni bibliotecas C++.
- Uso offline: una vez cacheado el archivo, funciona sin conexión a través del cliente `hf-hub`.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo ASR puede transcribir grabaciones WAV directamente desde la línea de comandos con `aloud transcribe`, lo que permite integrarlo en pipelines de procesamiento de audio sin depender de servicios externos.
- Generación de locuciones para vídeo y podcasts: el modelo TTS de 0,6B con licencia Apache-2.0 puede producir voces naturales para narraciones, ahorrando costes de estudio y permitiendo iteraciones rápidas.
- Clonación de voz para audiolibros personalizados: la función `aloud voice create` permite generar un archivo `.aloudvoice` a partir de una referencia corta, útil para proyectos que requieren una voz consistente sin grabar todas las frases.
- Asistentes de voz integrados en aplicaciones de escritorio: al ser un motor Rust puro, se puede incrustar en aplicaciones de escritorio o servicios de borde sin necesidad de GPU ni infraestructura pesada.
- Procesamiento de audio por lotes en servidores: los archivos GGUF autocontenidos permiten desplegar servicios de transcripción y síntesis en entornos CI/CD o en contenedores ligeros, con verificación de integridad mediante SHA-256.
- Creación de voces personalizadas para agentes conversacionales: combinando TTS con voces externas y el proyecto `yui` del mismo autor, se puede construir un asistente conversacional que responda con una voz clonada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio documenta la verificación de paridad con PyTorch y la calidad del codec mediante SNR (relación señal-ruido) en las pruebas de conversión, pero no se ofrecen cifras comparativas con otros modelos ASR o TTS.

## Requisitos de hardware

- Los modelos son pequeños (0,1B y 0,6B), por lo que la inferencia es viable en CPU sin GPU dedicada.
- El motor Aloud ejecuta kernels de CPU y wgpu, lo que permite usar GPUs compatibles con WebGPU si se desea aceleración.
- La VRAM estimada para los modelos Q8_0 es inferior a 1 GB para el modelo de 0,1B y de aproximadamente 1,2 GB para el de 0,6B, basándose en el tamaño de los archivos.
- Es compatible con GPU de consumo como RTX 3060, RTX 4090 y cualquier GPU moderna con soporte WebGPU, aunque no es imprescindible.
- Para despliegue, se usa el binario `aloud` disponible en el repositorio de GitHub; no se integra con vLLM, Ollama ni TGI porque es un motor independiente.
- La latencia y el throughput no se han publicado; al ser modelos pequeños, se espera una generación rápida en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | Formato | Uso |
|---|---|---|---|---|
| `isala404/aloud` (TTS 0.6b) | 0,6B | Apache-2.0 | GGUF | TTS autocontenido |
| `isala404/aloud` (ASR 0.1b) | 0,1B | CC BY-NC 4.0 | GGUF | ASR no comercial |
| Fish Audio S2 Pro (referencia de arquitectura) | no disponible | no disponible | no disponible | TTS de referencia |
| Whisper (ASR comparable) | 0,25B – 1,5B | MIT | múltiples | ASR |

No se dispone de información suficiente para comparar directamente el rendimiento con modelos TTS comerciales o ASR populares, ya que no hay benchmarks publicados. La principal diferencia de Aloud es su ejecución nativa en Rust y la autocontención de los archivos GGUF, frente a los motores basados en PyTorch o C++.

## Limitaciones y advertencias

- Los modelos ASR (0,1B) están bajo CC BY-NC 4.0: el uso comercial no está permitido en ningún caso.
- Los modelos TTS de 0,1B tienen una licencia comunitaria que limita el uso comercial a entidades con ingresos anuales inferiores a 2.000.000 de dólares; las entidades mayores necesitan una licencia por escrito de Audio8.
- Los modelos TTS de 0,6B están bajo Apache-2.0, pero el codec embebido hereda el aviso NOTICE de Fish Audio, por lo que hay que revisar las atribuciones.
- No se han publicado los idiomas soportados ni la calidad de las voces en diferentes lenguas, lo que limita la evaluación para aplicaciones multilingües.
- El repositorio no incluye los datos de referencia de las voces embebidas, por lo que no se pueden replicar las voces `sky` y `aiden` desde cero.
- El riesgo de alucinación en TTS se traduce en errores de pronunciación o entonación en textos complejos; no hay datos publicados sobre la tasa de error.
- No se dispone de benchmarks de rendimiento ni de mediciones de latencia, lo que dificulta la comparación objetiva con alternativas.
- Los archivos son de 2026, lo que sugiere que el ecosistema es joven y puede haber cambios en la API o en los formatos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/isala404/aloud
- Repositorio de Aloud en GitHub: https://github.com/isala/aloud
- Perfil del autor en GitHub: https://github.com/isala404/
- Proyecto Yui (asistente conversacional): https://github.com/isala404/yui
- Modelo ASR original: https://huggingface.co/Audio8/Audio8-ASR-0.1B
- Modelo TTS Preview 0.1b: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.1b
- Modelo TTS Preview 0.6b: https://huggingface.co/Audio8/Audio8-TTS-Preview-0.6b
