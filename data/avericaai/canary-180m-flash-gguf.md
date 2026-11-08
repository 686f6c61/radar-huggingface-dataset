# avericaai/canary-180m-flash-gguf

## Resumen

canary-180m-flash-gguf es una conversión al formato GGUF del modelo nvidia/canary-180m-flash, un sistema de reconocimiento automático del habla (ASR) multitarea desarrollado por NVIDIA. La conversión la publica el usuario avericaai (con conversiones equivalentes en handy-computer, tryambientai y myflow-ai) para su uso con transcribe.cpp, un runtime de inferencia de audio en C++ orientado a despliegue local y offline. El modelo resuelve dos problemas: transcripción multilingüe (inglés, alemán, español y francés) y traducción bidireccional entre inglés y cada uno de esos tres idiomas, todo ello a partir de audio WAV mono a 16 kHz.

La relevancia de esta ficha reside en su tamaño: con 189.083.776 parámetros (182M según NVIDIA) y un peso cuantizado de apenas 139 MB en Q4_K_M, es un modelo que cabe en cualquier portátil y que mantiene un WER de 1,93 % en LibriSpeech test-clean, prácticamente idéntico al 1,94 % del modelo en F32. La arquitectura es un encoder-decoder de tipo multitask AED: un encoder FastConformer de 17 capas y un decoder Transformer de 4 capas, con tokens de tarea para controlar idioma de destino, tarea (transcribir o traducir) y formato (puntuación y mayúsculas).

No es un modelo de lenguaje generativo ni un asistente conversacional: es un modelo especializado de voz que produce texto a partir de audio. No soporta streaming ni timestamps en este port v1, y no dispone de detección automática de idioma, por lo que el idioma de origen debe especificarse mediante el token de tarea correspondiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder-decoder multitask AED: encoder FastConformer de 17 capas + decoder Transformer de 4 capas |
| Parámetros totales | 189.083.776 (182M según NVIDIA) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; no aplica ventana de tokens de texto) |
| Tipos de cuantización | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, de, es, fr (ASR en los cuatro; traducción bidireccional EN↔{DE, ES, FR}) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (runtime transcribe.cpp) |
| Entrada de audio | WAV mono a 16 kHz |
| Streaming | no |
| Timestamps | ninguno en el port v1 (experimental en el modelo upstream) |
| Detección de idioma | no |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Canary, un esquema encoder-decoder con encoder FastConformer y decoder Transformer. El encoder procesa las características acústicas y el decoder genera texto condicionado por tokens de tarea: `<target language>`, `<task>`, `<toggle timestamps>` y `<toggle PnC>`. El tokenizer es concatenado a partir de tokenizers SentencePiece individuales por idioma, lo que facilita escalar a nuevos idiomas sin rediseñar el vocabulario. Esta conversión concreta se portó desde el commit upstream b12ab41 (fijado el 2026-05-08) y se validó contra la referencia NeMo en el commit db53eda de transcribe.cpp el 2026-05-08.

No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; el modelo card upstream no los detalla en el extracto disponible. La innovación técnica destacable es la eficiencia: NVIDIA reporta más de 1200 RTFx en los conjuntos del Open ASR Leaderboard, y la conversión GGUF preserva la precisión numérica casi exacta respecto al modelo original (1,93 % frente a 1,94 % de WER en F32). El decoder es autoregresivo con decodificación greedy y sin modelo de lenguaje externo.

## Capacidades

- Reconocimiento automático del habla en inglés, alemán, español y francés.
- Traducción bidireccional entre inglés y alemán, español y francés (EN→{DE, ES, FR} y {DE, ES, FR}→EN).
- Generación de transcripciones con o sin puntuación y mayúsculas (PnC), controlable mediante token de tarea.
- Traducción con o sin PnC.
- Timestamps a nivel de palabra y de segmento: función experimental en el modelo upstream, no expuesta en este port v1.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni uso como agente.
- No soporta streaming: procesa el audio completo por lotes.
- No realiza detección automática de idioma: el idioma de origen debe indicarse explícitamente.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo convierte grabaciones WAV mono a 16 kHz en texto con puntuación, adecuado para actas automáticas en entornos sin conectividad y con presupuesto de hardware mínimo (139 MB en Q4_K_M).
- Subtitulado de contenido audiovisual multilingüe: combinado con la capacidad de traducción EN↔{DE, ES, FR}, permite generar subtítulos en un idioma distinto al del audio original en un solo paso de inferencia.
- Notas de voz en aplicaciones móviles: su tamaño reducido y su velocidad (RTF 153,46 en Metal sobre M4 Max) lo hacen viable para transcripción en dispositivo sin enviar audio a la nube.
- Atención al cliente con base de conocimiento en varios idiomas: transcripción de llamadas en español, alemán o francés y traducción al inglés para su análisis posterior o para alimentar sistemas de búsqueda.
- Investigación en ASR de bajo recurso: al ser un modelo pequeño con licencia permisiva y validación numérica documentada frente a NeMo, sirve como baseline reproducible para experimentos de cuantización y comparación de runtimes.
- Procesamiento por lotes de archivos de audio en servidores modestos: con RTF 21,73 en CPU (Ryzen 4750U) y 33,09 con Vulkan, permite transcribir grandes volúmenes de audio en hardware de gama media sin GPU dedicada.
- Accesibilidad: generación de transcripciones y traducciones para personas con discapacidad auditiva en entornos multilingües, con despliegue totalmente offline.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| LibriSpeech test-clean | WER F32 | 1,94 % |
| LibriSpeech test-clean | WER F16 | 1,94 % |
| LibriSpeech test-clean | WER Q8_0 | 1,93 % |
| LibriSpeech test-clean | WER Q6_K | 1,93 % |
| LibriSpeech test-clean | WER Q5_K_M | 1,90 % |
| LibriSpeech test-clean | WER Q4_K_M | 1,93 % |
| FLEURS en | WER Q8_0 | 5,98 % |
| FLEURS de | WER Q8_0 | 7,33 % |
| FLEURS es | WER Q8_0 | 6,54 % |
| FLEURS fr | WER Q8_0 | 8,53 % |
| LibriSpeech test-clean (referencia NeMo) | WER | 1,93 % |
| LibriSpeech test-clean (NVIDIA, self-reported) | WER | 1,87 % |

Las cifras de LibriSpeech corresponden al split completo test-clean (2.620 enunciados), batch size 1, decodificación greedy y sin modelo de lenguaje externo. La diferencia entre el port F32 (1,94 %) y la referencia NeMo (1,93 %) equivale a una única sustitución sobre aproximadamente 27.000 palabras, lo que sitúa el port en el ruido de medición. La diferencia con el 1,87 % de NVIDIA se explica por diferencias de framework y no por la cuantización.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones (139 MB en Q4_K_M, 218 MB en Q8_0, 756 MB en F32); el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Con aceleración, cualquier GPU con soporte Metal (Apple Silicon) o Vulkan es suficiente. No se dispone de datos para A100/H100 en la información proporcionada.
- Cabe en GPU consumer: sí, en cualquier RTX o GPU integrada con soporte Vulkan; también en Apple Silicon vía Metal.
- Opciones de despliegue: transcribe.cpp (runtime oficial de esta conversión, compilado con CMake); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que es un modelo de audio y no de texto.
- Latencia y throughput: RTF 78,91 en CPU y 153,46 en Metal (M4 Max); RTF 21,73 en CPU y 33,09 con Vulkan (Ryzen 4750U). NVIDIA reporta más de 1200 RTFx en los conjuntos del Open ASR Leaderboard para el modelo upstream.
- Preprocesado necesario: el audio debe convertirse a WAV mono a 16 kHz (por ejemplo, con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Traducción | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| canary-180m-flash-gguf (esta ficha) | 189M | en, de, es, fr | Sí (EN↔{DE, ES, FR}) | CC-BY-4.0 | GGUF / transcribe.cpp |
| nvidia/canary-180m-flash | 182M | en, de, es, fr | Sí (EN↔{DE, ES, FR}) | CC-BY-4.0 | NeMo (.nemo) |
| Conversiones GGUF alternativas (tryambientai, myflow-ai, handy-computer) | 182M | en, de, es, fr | Sí | CC-BY-4.0 | GGUF / transcribe.cpp |
| Whisper small (referencia de categoría) | 244M | multilingüe amplio | Solo transcripción/traducción a inglés | MIT | Múltiples |

Las conversiones GGUF alternativas del mismo modelo base son funcionalmente equivalentes; la diferencia entre repositorios es de autoría y de validación documentada, no de capacidades. No se dispone en la información proporcionada de datos de benchmarks comparativos directos con Whisper u otros modelos de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto, tool calling, agentes ni razonamiento multi-paso.
- No soporta streaming; requiere el audio completo y procesa por lotes.
- No realiza detección automática de idioma: hay que indicar el idioma de origen mediante el token de tarea, lo que añade complejidad en pipelines con audio de idioma desconocido.
- Los timestamps a nivel de palabra y segmento son experimentales en el modelo upstream y no están expuestos en este port v1.
- El WER en FLEURS es notablemente superior al de LibriSpeech (5,98 %–8,53 % frente a 1,93 %), lo que refleja un rendimiento inferior en audio menos limpio o con acentos y ruido.
- Riesgo de alucinación y de errores de transcripción en audio con ruido, solapamiento de hablantes o vocabulario especializado; no se documentan medidas de mitigación en la información disponible.
- No se dispone de información sobre sesgos demográficos o acústicos del modelo en la documentación proporcionada.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario conservar el aviso de licencia y el NOTICE del repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la validación se realizó contra un commit concreto de transcribe.cpp; conviene fijar versiones en producción.
- El modelo se distribuye únicamente en GGUF para transcribe.cpp; no se indica disponibilidad de safetensors en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/avericaai/canary-180m-flash-gguf
- Modelo base: https://huggingface.co/nvidia/canary-180m-flash
- Commit upstream del modelo base: https://huggingface.co/nvidia/canary-180m-flash/commit/b12ab41
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/db53eda
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/canary-180m-flash.md
- Conversión GGUF alternativa (handy-computer): https://huggingface.co/handy-computer/canary-180m-flash-gguf
- Conversión GGUF alternativa (tryambientai): https://huggingface.co/tryambientai/canary-180m-flash-gguf
- Conversión GGUF alternativa (myflow-ai): https://huggingface.co/myflow-ai/canary-180m-flash-gguf
- Paper de Canary (arXiv:2409.13523): https://arxiv.org/abs/2409.13523
- Paper de FastConformer (arXiv:2104.02821): https://arxiv.org/abs/2104.02821
- Paper de Transformer (arXiv:1706.03762): https://arxiv.org/abs/1706.03762
- Paper de Canary Flash (arXiv:2503.05931): https://arxiv.org/abs/2503.05931
