# handy-computer/granite-speech-4.1-2b-nar-gguf

## Resumen

Granite-Speech-4.1-2B-NAR es un modelo de reconocimiento automatico del habla (ASR) no autorregresivo desarrollado por IBM Research dentro de la familia Granite. A diferencia de los sistemas ASR clasicos que decodifican token a token, este modelo plantea la transcripcion como una tarea de edicion condicional del texto: genera una hipotesis CTC inicial y la refina en una sola pasada hacia delante mediante un LLM bidireccional. El resultado es una precision competitiva con una latencia de inferencia notablemente inferior a la de las alternativas autorregresivas.

La ficha que nos ocupa documenta la conversion a formato GGUF realizada por el usuario `handy-computer`, pensada para su uso con `transcribe.cpp`, el motor de inferencia del proyecto Handy. El modelo base cuenta con 2.254.656.316 parametros (aproximadamente 2,25 mil millones), combina un codificador de audio de tipo Conformer con un proyector MLP con atencion y el LLM Granite-4.0-1b actuando como editor bidireccional (mascara causal desactivada). Soporta ingles, frances, aleman, espanol y portugues, y esta publicado bajo licencia Apache-2.0.

Su relevancia actual radica en dos factores: por un lado, ofrece una alternativa de codigo abierto y ejecutable en CPU o GPU de consumo para transcripcion multilingue offline; por otro, su naturaleza no autorregresiva reduce drasticamente el coste computacional por audio procesado, lo que lo hace atractivo para aplicaciones de escritorio con requisitos de privacidad y baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (codificador de audio) + proyector MLP con atencion + LLM Granite-4.0-1b como editor bidireccional (NLE, no autorregresivo) |
| Parametros totales | 2.254.656.316 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, de, es, pt |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 117,9 GB con multiples variantes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura NLE (Non-autoregressive LLM-based Editing). El codificador de audio es un Conformer, compartido con la familia autorregresiva Granite-Speech, que transforma el audio de entrada en representaciones acusticas. Estas se proyectan mediante un proyector MLP con atencion hacia el espacio de embeddings del LLM Granite-4.0-1b, que actua como editor bidireccional: se desactiva la mascara causal para que el modelo pueda atender a toda la secuencia simultaneamente. En una unica pasada hacia delante se generan logits sobre la transcripcion completa, y la decodificacion CTC produce el texto final. No existe bucle token a token, lo que constituye la innovacion tecnica principal frente a los ASR autorregresivos.

La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni confirma el uso de RLHF o DPO. Se sabe que el modelo base fue publicado en el commit `99a4df9` de `ibm-granite/granite-speech-4.1-2b-nar` y que la conversion GGUF se valido contra la referencia de Transformers en el commit `c53af2c` de `transcribe.cpp` el 24 de mayo de 2026. La entrada debe ser audio WAV mono a 16 kHz.

## Capacidades

- Transcripcion de voz a texto offline en una sola pasada no autorregresiva.
- Soporte multilingue para ingles, frances, aleman, espanol y portugues.
- Deteccion automatica de idioma (`lang_detect: true`).
- Entrada de audio: WAV mono a 16 kHz.
- Salida: transcripcion de texto plano.
- No soporta streaming (`streaming: false`).
- No soporta traduccion (`translate: false`).
- No genera marcas de tiempo (`timestamps: none`).
- No permite seleccion explicita de idioma (`explicit_language_selection: false`).
- No dispone de tool calling ni capacidades de agente (es un modelo puramente ASR).

## Casos de uso

- **Transcripcion de reuniones y notas de voz en local**: el modelo procesa audio WAV mono a 16 kHz y devuelve la transcripcion en una sola pasada, lo que permite integrarlo en aplicaciones de escritorio que priorizan privacidad y funcionamiento sin conexion. Su licencia Apache-2.0 facilita la distribucion comercial.
- **Subtitulado de contenido audiovisual multilingue**: con soporte para cinco idiomas y deteccion automatica de lengua, se puede emplear para generar subtitulos en ingles, frances, aleman, espanol y portugues. La ausencia de marcas de tiempo obliga a un alineamiento posterior externo si se requiere sincronizacion.
- **Dictado por voz en herramientas de productividad**: la baja latencia derivada de la decodificacion no autorregresiva (RTF de 5,2 en CPU de M4 y 19,33 en Metal) lo hace adecuado para dictado interactivo en aplicaciones de escritorio, aunque no soporta streaming y requiere procesar el audio completo.
- **Transcripcion de archivos historicos o de archivo periodistico**: al ejecutarse en CPU con cuantizaciones Q4_K_M (1,56 GB) o Q5_K_M (1,78 GB), permite procesar grandes volumenes de audio en servidores sin GPU, manteniendo un WER de 1,34 % en LibriSpeech test-clean con Q4_K_M.
- **Integracion en pipelines de accesibilidad**: puede incorporarse en herramientas de subtitulado en vivo diferido para personas con discapacidad auditiva, ejecutandose en hardware de consumo y sin dependencia de servicios en la nube.
- **Investigacion en ASR no autorregresivo**: sirve como referencia reproducible para estudiar la arquitectura NLE, con variantes cuantizadas que permiten experimentar en equipos modestos y comparar el impacto de la cuantizacion en el WER.
- **Procesamiento por lotes en entornos con restricciones de GPU**: el formato GGUF y el soporte de `transcribe.cpp` permiten desplegar el modelo en CPU (Ryzen 4750U con RTF 2,15) o en GPU integrada via Vulkan (RTF 4,0), sin necesidad de aceleradores dedicados.

## Benchmarks y rendimiento

Resultados de WER publicados en la model card del repositorio GGUF:

| Benchmark | BF16 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| LibriSpeech test-clean (WER %) | 1,29 | 1,29 | 1,29 | 1,29 | 1,28 | 1,34 |
| FLEURS en (WER %) | no disponible | no disponible | 5,33 | no disponible | no disponible | no disponible |
| FLEURS fr (WER %) | no disponible | no disponible | 6,76 | no disponible | no disponible | no disponible |
| FLEURS de (WER %) | no disponible | no disponible | 6,07 | no disponible | no disponible | no disponible |
| FLEURS es (WER %) | no disponible | no disponible | 4,08 | no disponible | no disponible | no disponible |
| FLEURS pt (WER %) | no disponible | no disponible | 5,57 | no disponible | no disponible | no disponible |

Metricas de rendimiento (RTF, menor es mejor):

| Plataforma | CPU | Metal | Vulkan |
|---|---:|---:|---:|
| Apple M4 | 5,2 | 19,33 | no disponible |
| Apple M4 Max | 6,81 | 74,78 | no disponible |
| AMD Ryzen 4750U | 2,15 | no disponible | 4,0 |

La referencia BF16 con Transformers (`model.transcribe`, MPS) reporta 1,28 % en LibriSpeech test-clean, coherente con el 1,29 % de la model card original. El normalizador de texto empleado es el `EnglishTextNormalizer` de Whisper, el mismo que usa Open ASR Leaderboard.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia**: entre 1,56 GB (Q4_K_M) y 4,52 GB (F16/BF16), segun la cuantizacion.
- **GPU recomendadas**: no se especifican modelos concretos; el modelo se ha validado en Apple Silicon (M4, M4 Max) con backend Metal y en AMD Ryzen 4750U con backend Vulkan. No hay datos publicados para A100, H100 ni RTX 4090.
- **Compatibilidad con GPU de consumo**: si, las cuantizaciones Q4_K_M (1,56 GB) y Q5_K_M (1,78 GB) caben en practicamente cualquier GPU de consumo moderna e incluso en sistemas integrados.
- **Opciones de despliegue**: `transcribe.cpp` (unico motor soportado oficialmente segun la model card). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: el RTF medido varia entre 2,15 (Ryzen 4750U, CPU) y 74,78 (M4 Max, Metal), lo que indica que el procesamiento es mas rapido que tiempo real en todas las configuraciones probadas. No se publican cifras de throughput en audios por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|---|
| Granite-Speech-4.1-2B-NAR (esta ficha) | 2,25 B | en, fr, de, es, pt | no disponible | Apache-2.0 | GGUF | No autorregresivo, sin timestamps, sin traduccion |
| Granite-Speech (familia AR de IBM) | no disponible | no disponible | no disponible | Apache-2.0 | safetensors | Autorregresivo, mismo codificador Conformer |
| Whisper (OpenAI) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible | Referencia usada para el normalizador de texto |

No se dispone de datos suficientes en la informacion proporcionada para comparar parametros, contexto ni rendimiento con alternativas concretas como Whisper large-v3, Parakeet o Canary. La comparativa se limita a la familia Granite-Speech y a la referencia metodologica de Whisper.

## Limitaciones y advertencias

- **Sin marcas de tiempo**: el modelo no genera timestamps, lo que limita su uso directo en subtitulado sincronizado sin un alineador externo.
- **Sin streaming**: requiere el audio completo antes de procesar; no es apto para transcripcion en tiempo real por fragmentos.
- **Sin traduccion**: solo transcribe en el idioma de entrada; no traduce entre idiomas.
- **Sin seleccion explicita de idioma**: la deteccion es automatica, lo que puede provocar errores en audios con cambios de lengua o ruido.
- **Cobertura limitada a cinco idiomas**: en, fr, de, es y pt; no se documenta soporte para otras lenguas.
- **Riesgo de alucinacion**: como todo modelo generativo aplicado a ASR, puede producir texto plausible no presente en el audio, especialmente en segmentos con ruido o silencio.
- **Entrada restringida**: solo WAV mono a 16 kHz; requiere conversion previa con ffmpeg para otros formatos.
- **Dependencia de `transcribe.cpp`**: la model card solo documenta su uso con este motor, lo que limita la portabilidad frente a otros runtimes.
- **Licencia Apache-2.0**: permite uso comercial, pero se recomienda revisar el NOTICE y el texto de licencia incluidos en el repositorio para cumplir con los requisitos de atribucion.
- **Datos de entrenamiento no documentados**: no se detalla la composicion del dataset ni posibles sesgos derivados de el, lo que dificulta evaluar su comportamiento en dominios especificos (acentos, jerga, audio telefonico).

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/handy-computer/granite-speech-4.1-2b-nar-gguf
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar
- Commit del modelo base: https://huggingface.co/ibm-granite/granite-speech-4.1-2b-nar/commit/99a4df9
- Repositorio `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion en `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp/tree/c53af2c
- Documentacion del modelo en `transcribe.cpp`: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/granite-speech-4.1-2b-nar.md
- Aplicacion Handy (descarga): https://handy.computer/download.html
- Repositorio de Handy en GitHub: https://github.com/cjpais/handy
- Sitio web de Handy: https://handy.computer/
- Papers referenciados en los tags (arXiv): arxiv:2603.08397, arxiv:2505.08699, arxiv:2603.11243, arxiv:2604.12398, arxiv:2604.22817, arxiv:2604.11269 (no se dispone de titulo ni contenido en la informacion proporcionada).
