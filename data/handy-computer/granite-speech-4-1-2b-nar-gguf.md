# handy-computer/granite-speech-4.1-2b-nar-gguf

## Resumen

Granite-speech-4.1-2b-nar en formato GGUF es una conversión del modelo de reconocimiento automático del habla (ASR) ibm-granite/granite-speech-4.1-2b-nar, publicada por el usuario handy-computer para su uso con el runtime transcribe.cpp. Se trata de un modelo offline multilingüe de 2.254.656.316 parámetros que cubre inglés, francés, alemán, español y portugués, con licencia Apache-2.0 y pesos en formato GGUF en seis niveles de cuantización (de BF16 a Q4_K_M).

Su rasgo diferencial es que no es autorregresivo: en lugar de generar el texto token a token, formula el ASR como una edición condicional de la transcripción. Un único paso forward de un LLM bidireccional produce logits sobre la transcripción completa y la decodificación CTC devuelve el texto final, sin bucle token a token. La arquitectura, denominada NLE (Non-autoregressive LLM-based Editing), combina un encoder de audio Conformer con un proyector MLP con atención y usa Granite-4.0-1b como editor bidireccional con la máscara causal desactivada.

Es relevante ahora porque ofrece una alternativa de latencia baja frente a los modelos ASR autorregresivos de la misma familia, manteniendo una precisión competitiva (1,29 % de WER en LibriSpeech test-clean para BF16, F16, Q8_0 y Q6_K) y siendo ejecutable en CPU, Metal y Vulkan a través de transcribe.cpp, sin necesidad de GPU dedicada. El repositorio acumula 41.663 descargas y 0 likes, con licencia heredada del modelo base (Apache-2.0).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NLE (Non-autoregressive LLM-based Editing): encoder de audio Conformer + proyector MLP con atención + Granite-4.0-1b como editor bidireccional (máscara causal desactivada) + decodificación CTC |
| Parámetros totales | 2.254.656.316 (≈2,25 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

Otros datos del repositorio: biblioteca declarada `transcribe.cpp`, pipeline `automatic-speech-recognition`, tamaño del repositorio 101,1 GB, creado el 2026-05-17 y actualizado el 2026-09-12. Entrada de audio: WAV mono a 16 kHz.

## Arquitectura y entrenamiento

El modelo base, granite-speech-4.1-2b-nar, se describe como un modelo de reconocimiento de habla no autorregresivo que plantea el ASR como una edición condicional de la transcripción. Comparte el encoder de audio Conformer con la familia autorregresiva Granite-Speech, pero lo empareja con un proyector MLP con atención específico y con el LLM Granite-4.0-1b empleado como editor bidireccional. Una única pasada forward genera logits sobre la transcripción completa y la decodificación CTC produce el texto final; no hay bucle de decodificación token a token. La arquitectura sigue el planteamiento NLE descrito en el paper arXiv:2603.08397.

Esta conversión GGUF se portó desde el commit upstream 99a4df9 del modelo base, fijado el 2026-05-24, y se validó contra la referencia de Transformers en el commit c53af2c de transcribe.cpp el 2026-05-24. La model card indica que no se requiere parcheo de máscaras porque el LM no autorregresivo usa `create_bidirectional_mask()` de forma nativa. No se proporciona en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO para el modelo base. En cuanto a innovaciones destacables, además del esquema NLE, la propia model card cita `create_bidirectional_mask()` y la decodificación CTC como elementos propios del diseño.

## Capacidades

- Reconocimiento de voz offline (speech-to-text) multilingüe en inglés, francés, alemán, español y portugués.
- Transcripción en una sola pasada no autorregresiva: el modelo produce logits sobre la transcripción completa y decodifica con CTC, sin generación token a token.
- Procesamiento local, sin necesidad de conectividad de red ni de servicios en la nube.
- Ejecución en CPU, Metal (Apple Silicon) y Vulkan, según los valores de rendimiento publicados.
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No genera marcas temporales (`timestamps: none`), ni de palabra ni de hablante.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes ni razonamiento multi-paso, que no aplican a un modelo ASR.
- No se documenta en la información disponible generación de texto, código, matemáticas ni visión; es un modelo específicamente de ASR.

## Casos de uso

- Dictado de escritorio en local: el modelo acepta WAV mono a 16 kHz y devuelve transcripción, por lo que puede integrarse en aplicaciones de escritorio tipo Handy para dictado sin conexión en inglés, francés, alemán, español y portugués, con el atractivo de que los datos de audio no salen del equipo.
- Transcripción de reuniones y notas de voz: con las cuantizaciones Q5_K_M (1,66 GB) o Q4_K_M (1,45 GB) el modelo cabe en portátiles sin GPU dedicada, lo que permite procesar grabaciones de reuniones en segundo plano sobre CPU.
- Subtitulado de audio y vídeo: puede transcribir la pista de audio como primer paso de un pipeline de subtitulado; dado que no genera marcas temporales, la alineación temporal debe resolverse con una herramienta externa (por ejemplo, un forzado de alineación posterior).
- Indexación y búsqueda de archivos de audio corporativos: al ser Apache-2.0 y ejecutable sin GPU, permite transcribir por lotes grandes volúmenes de grabaciones en servidores de CPU para después indexarlas y hacerlas buscables por texto.
- Pseudo-etiquetado de corpus de voz: el modelo puede generar transcripciones automáticas de audio no etiquetado en los cinco idiomas soportados como paso previo a un proceso de anotación o de entrenamiento posterior.
- Transcripción en cumplimiento normativo: para organizaciones con requisitos de residencia de datos o RGPD, el procesamiento íntegramente local elimina el envío de audio a APIs externas; la licencia Apache-2.0 facilita además su incorporación en productos propietarios.
- Procesamiento en hardware modesto y de bajo consumo: los valores publicados para un Ryzen 4750U (Vulkan y CPU) indican que el modelo es viable en equipos de gama media sin GPU dedicada, lo que habilita despliegues en el borde o en quioscos.

## Benchmarks y rendimiento

Los únicos datos de calidad publicados en la información disponible corresponden al WER sobre la partición completa LibriSpeech test-clean (2620 enunciados), con normalizador de texto `EnglishTextNormalizer` de Whisper:

| Cuantización | Tamaño | WER LibriSpeech test-clean |
|---|---:|---:|
| BF16 | 4,20 GB | 1,29 % |
| F16 | 4,21 GB | 1,29 % |
| Q8_0 | 2,33 GB | 1,29 % |
| Q6_K | 1,84 GB | 1,29 % |
| Q5_K_M | 1,66 GB | 1,25 % |
| Q4_K_M | 1,45 GB | 1,35 % |

Referencia adicional reportada: la línea base BF16 con Transformers (`model.transcribe`, MPS) da 1,28 %, coherente con el 1,29 % de la model card upstream dentro del ruido de muestreo. La model card señala que F16, Q8_0 y Q6_K igualan el 1,29 % de BF16 y que la ligera bajada de Q5_K_M a 1,25 % queda dentro de intervalos de confianza solapados.

Rendimiento (valores publicados en la model card, bajo las claves `rtf_*`; la card no detalla la definición exacta de la métrica, que en la nomenclatura del repositorio se interpreta como múltiplo de velocidad sobre tiempo real, a mayor valor más rápido):

| Plataforma | Backend | Valor |
|---|---|---:|
| M4 Max | Metal | 56 |
| M4 Max | CPU | 5 |
| M4 | Metal | 18 |
| M4 | CPU | 4 |
| Ryzen 4750U | Vulkan | 3,65 |
| Ryzen 4750U | CPU | 1,5 |

No se han publicado en la información disponible resultados de benchmarks en inglés distintos del WER en LibriSpeech test-clean (por ejemplo, MMLU, HumanEval o GSM8K no se reportan, y no son aplicables a un modelo ASR), ni WER para francés, alemán, español o portugués.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del tamaño de cada archivo de pesos más overhead de runtime: aproximadamente 1,5-2 GB para Q4_K_M, 1,7-2,2 GB para Q5_K_M, 1,9-2,4 GB para Q6_K, 2,4-3 GB para Q8_0 y 4,3-5 GB para F16/BF16. Son estimaciones derivadas de los tamaños publicados, no cifras medidas por el autor.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Se documentan ejecuciones en Metal (Apple M4 y M4 Max) y Vulkan (Ryzen 4750U con gráfica integrada).
- Cabe en GPU de consumo: sí, con las cuantizaciones bajas. Q4_K_M (1,45 GB) y Q5_K_M (1,66 GB) son adecuadas para GPU con 4 GB o más de VRAM; Q8_0 (2,33 GB) requiere en torno a 3 GB. No hay datos publicados de ejecución en RTX 4090, A100 o H100.
- Inferencia en CPU: viable según los datos publicados (valores de CPU en M4 Max, M4 y Ryzen 4750U), lo que permite despliegues sin GPU.
- Opciones de despliegue: el repositorio solo documenta transcribe.cpp (compilación desde fuente con CMake y uso de `transcribe-cli -m <modelo.gguf> input.wav`). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Preprocesado obligatorio del audio: entrada WAV mono a 16 kHz; el propio repositorio sugiere convertir con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`.
- Latencia y throughput: los valores `rtf_*` de la tabla anterior, publicados para M4 Max, M4 y Ryzen 4750U en Metal, CPU y Vulkan. El repositorio no publica cifras de VRAM pico, tokens por segundo ni latencia por utterance.

## Comparativa con modelos similares

| Modelo | Naturaleza | Parámetros | Idiomas | Marcas temporales | Precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| handy-computer/granite-speech-4.1-2b-nar-gguf (este) | NAR, GGUF para transcribe.cpp | 2.254.656.316 | en, fr, de, es, pt | No | WER 1,29 % en LibriSpeech test-clean | Apache-2.0 | GGUF, 6 cuantizaciones, solo transcribe.cpp |
| ibm-granite/granite-speech-4.1-2b | Autorregresivo, familia Granite Speech 4.1 | no disponible (el nombre indica 2b) | incluye japonés, además de los de la familia | no disponible | la model card indica mayor precisión que la variante NAR, sin cifra concreta | no disponible | pesos originales para Transformers |
| ibm-granite/granite-speech-4.1-2b-plus | Autorregresivo con información de hablante y tiempos | no disponible | no disponible | Sí (palabra y hablante) | no disponible | no disponible | pesos originales para Transformers |

Diferencias funcionales destacadas por la model card upstream: la variante autorregresiva granite-speech-4.1-2b produce transcripciones con puntuación y mayúsculas, soporta reconocimiento con sesgo por palabras clave (keyword-biased) y traducción de voz (AST), e incluye japonés; a cambio, su latencia de inferencia es mayor. La variante granite-speech-4.1-2b-plus está pensada para escenarios que requieren información de hablante o de tiempos por palabra.

## Limitaciones y advertencias

- No soporta streaming: el modelo procesa el audio completo en una sola pasada, lo que lo inhabilita para casos de transcripción en tiempo real continua tal como está empaquetado.
- No soporta traducción de voz ni detección automática de idioma; el idioma debe conocerse de antemano.
- No genera marcas temporales de ningún tipo (ni por palabra ni por hablante), lo que obliga a usar herramientas externas de alineación si se necesitan subtítulos sincronizados o diarización.
- Cobertura limitada a cinco idiomas (en, fr, de, es, pt) y sin resultados de WER publicados para cuatro de ellos: el único dato de calidad disponible es en inglés sobre LibriSpeech test-clean, un corpus de habla leída y limpia que no representa condiciones reales con ruido, acento, solapamiento de hablantes o audio telefónico.
- La model card contrasta explícitamente que la variante autorregresiva sí produce puntuación y mayúsculas, lo que sugiere que esta variante NAR no las genera; conviene verificar el formato de salida antes de integrarlo en producción.
- El riesgo de alucinación y los sesgos del modelo no se documentan en la información disponible; la model card disponible no incluye análisis de sesgo ni evaluación en dominios sensibles.
- Es una conversión de terceros: el repositorio lo publica handy-computer, no IBM, y solo se ha validado frente a la referencia de Transformers según lo indicado en su propia model card.
- Restricciones de licencia: Apache-2.0, heredada del modelo base, permite uso comercial. La model card remite a la tarjeta upstream para los términos completos.
- Compatibilidad de runtime restringida: los pesos GGUF están pensados para transcribe.cpp; no se documenta su uso con vLLM, llama.cpp, Ollama o TGI, por lo que la integración en pilas de inferencia habituales puede no ser directa.
- El modelo base se portó desde un commit fijado (99a4df9): cambios posteriores en el modelo upstream no estarán reflejados en esta conversión.

## Enlaces

- Página de HuggingFace del modelo: https://huggingface.co/handy-computer/granite-speech-4.1-2b-nar-gguf
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar
- Commit del modelo base usado en el port (pinned 2026-05-24): https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar/commit/99a4df9
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp (c53af2c): https://github.com/handy-computer/transcribe.cpp/tree/c53af2c
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b-nar.md
- Paper de la arquitectura NLE: https://arxiv.org/abs/2603.08397
- Otros identificadores arXiv citados en los metadatos del repositorio (contenido no verificado en esta búsqueda): arXiv:2505.08699, arXiv:2603.11243, arXiv:2604.12398, arXiv:2604.22817, arXiv:2604.11269
- Modelo autorregresivo de la familia: https://huggingface.co/ibm-granite/granite-speech-4.1-2b
- Modelo con marcas temporales de palabra y hablante: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-plus
- Aplicación Handy (speech-to-text de escritorio): https://handy.computer/
- Descarga de Handy: https://handy.computer/download.html
- Descarga directa de las cuantizaciones: https://huggingface.co/handy-computer/granite-speech-4.1-2b-nar-gguf/tree/main (BF16, F16, Q8_0, Q6_K, Q5_K_M y Q4_K_M)
