# BricksDisplay/Pocket-TTS-ja-GGUF

## Resumen

Pocket TTS Japanese (CC BY) — GGUF es una conversión al formato GGUF del modelo de síntesis de voz `takuma104/pocket-tts-ja-cc`, un TTS japonés de 110M de parámetros con clonación de voz zero-shot. El modelo original es un fine-tuning de Kyutai Pocket TTS realizado por takuma104 exclusivamente sobre datos con licencia CC BY, lo que lo distingue de su variante hermana `takuma104/pocket-tts-ja`, publicada bajo CC BY-NC. Esta conversión la firma BricksDisplay y separa el modelo en dos ficheros GGUF complementarios: el backbone (FlowLM, ejecutado por llama.cpp como `starcoder2`) y el codec de audio (variante de Mimi con decoder fine-tuneado y adaptador), ejecutado por codec.cpp.

La relevancia práctica del modelo reside en su tamaño reducido y su naturaleza totalmente offline: el par de ficheros recomendado ocupa 236 MB en BF16, y existe una configuración específica para teléfonos que baja a 126 MB y reduce el factor de tiempo real de 1,27 a 0,41 en un Pixel 7 Pro. El modelo lee japonés tal cual está escrito (kanji y kana), sin paso de conversión grafema-fonema (G2P), lo que simplifica el pipeline.

El repositorio incluye una batería de cuantizaciones con verificación de calidad mediante dos ASR (Whisper large-v3-turbo y kotoba-whisper v2.0), y documenta explícitamente qué cuantizaciones no se publicaron por no superar el umbral de calidad. La licencia CC BY 4.0 permite uso comercial con atribución, a diferencia de la variante NC del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS en dos grafos: backbone FlowLM (transformer, ejecutado como `starcoder2` en llama.cpp) + codec de audio variante Mimi con decoder fine-tuneado y adaptador (proyección de entrada, proyección de voz, cabeza EOS, cabeza de flujo LSD) |
| Parámetros totales | 38.253.250 (dato de safetensors del repo); la model card describe el modelo base como 110M |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Backbone: bf16, q8_0, q6_k, q5_k_m, q5_k_s, q5_1, q5_0, q4_k_m, q4_k_s, q4_1, q4_0, q3_k_l, q3_k_m. Codec: bf16, q8_0, q8_0-lm-q8_0. No hay F16 ni F32 (checkpoint en BF16) |
| Idiomas soportados | Japonés (ja) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (dos ficheros por ejecución: uno de backbone y uno de codec) |

## Arquitectura y entrenamiento

El modelo es un TTS de dos componentes. El backbone es un transformer FlowLM de 6 capas que genera los tokens de audio; llama.cpp lo ejecuta como `starcoder2`. El codec es una variante de Mimi con decoder fine-tuneado, acompañado de un adaptador que incluye proyección de entrada, proyección de voz, cabeza EOS y cabeza de flujo LSD; codec.cpp ejecuta este grafo. Los dos grafos se conectan en tiempo de ejecución, en CPU o GPU, de forma totalmente offline.

El fine-tuning lo realizó takuma104 sobre Kyutai Pocket TTS usando únicamente datos con licencia CC BY, y el resultado es la variante `pocket-tts-ja-cc`. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El checkpoint está en BF16 (FlowLM y Mimi), y las cuantizaciones se derivan de él; no se publican F16 (puede desbordar en un modelo entrenado en BF16) ni F32 (solo ampliaría BF16). El modelo lee japonés tal como está escrito, sin paso G2P.

La conversión fija dos parámetros en todos los ficheros de codec que codec.cpp inferiría de otro modo: `codec.lm.temperature = 0.3` (ruido de la cabeza de flujo; el valor por defecto de codec.cpp para Pocket TTS es 0.7, el del modelo inglés) y `codec.lm.frames_after_eos = 5` (frames conservados tras dispararse la cabeza EOS; la referencia lo deriva de un recuento de palabras, y el japonés no tiene espacios).

## Capacidades

- Síntesis de voz en japonés a partir de texto plano en kanji y kana, sin conversión G2P intermedia.
- Clonación de voz zero-shot a partir de una referencia de audio; la verificación del autor usó tres voces de referencia en campo lejano (grabación telefónica de una charla en inglés, 8 s cada una, normalizadas en pico).
- Ejecución totalmente offline en CPU o GPU, con dos grafos conectados por el runtime.
- Cuantizaciones orientadas a dispositivos móviles: el par `pocket-tts-ja-q8_0` + `codec-q8_0-lm-q8_0` está pensado para CPUs ARM sin productos escalares BF16.
- Preprocesado de texto documentado: aplicar las sustituciones de `japanese.yaml` (`。`→`.`, `、`→`,`, comillas y corchetes eliminados, ASCII de ancho completo → ASCII), convertir `;` en `,` y terminar el texto con `.` salvo que ya acabe en `.`, `!` o `?`.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la referencia de voz para clonación.

## Casos de uso

- Lector de pantalla o accesibilidad en japonés: el modelo convierte texto en kanji y kana directamente en voz sin paso G2P, lo que simplifica el pipeline y reduce puntos de fallo en aplicaciones de lectura para personas con discapacidad visual.
- Asistente de voz embebido en aplicaciones móviles: el par `pocket-tts-ja-q8_0` + `codec-q8_0-lm-q8_0` ocupa 126 MB y logra un factor de tiempo real de 0,41 en 4 núcleos grandes de un Pixel 7 Pro (Tensor G2), lo que permite síntesis más rápida que el tiempo real en teléfono sin conexión.
- Clonación de voz para contenido personalizado: con una referencia de 8 s el modelo reproduce la voz en zero-shot, útil para audiolibros, doblaje de demostraciones o avatares con voz propia del usuario.
- Generación de audio para prototipos y tests: el par BF16 de 236 MB se ejecuta en CPU y permite integrar TTS japonés en pipelines de CI para generar fixtures de audio de forma determinista y offline.
- Sistemas de anuncios o interfaces de voz en dispositivos sin GPU: las cuantizaciones q4_0 y q3_k_m bajan el par a 96 MB y 41 MB respectivamente, viables en hardware de gama baja con ARM.
- Investigación en TTS japonés de bajo coste: el repositorio publica tablas de CER con dos ASR para cada cuantización, lo que facilita estudiar el impacto de la cuantización en la calidad de síntesis sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por no aplicar a un modelo TTS. El autor sí publica evaluaciones de calidad de síntesis mediante CER con dos ASR sobre 6 frases japonesas, tres voces de referencia en campo lejano y 3 semillas (54 líneas por fichero). Cada backbone se evaluó con `codec-bf16.gguf` y cada codec con `pocket-tts-ja-bf16.gguf`.

| Backbone (codec bf16) | CER Whisper | CER kotoba | Mejor de dos | Ambas mal (de 54) |
|---|---|---|---|---|
| bf16 | 0,427 | 0,289 | 0,115 | 5 |
| q8_0 | 0,205 | 0,283 | 0,081 | 4 |
| q6_k | 0,203 | 0,269 | 0,097 | 4 |
| q5_k_m | 0,260 | 0,272 | 0,089 | 5 |
| q5_k_s | 0,228 | 0,292 | 0,096 | 4 |
| q5_1 | 0,066 | 0,305 | 0,043 | 1 |
| q5_0 | 0,189 | 0,254 | 0,088 | 5 |
| q4_k_m | 0,375 | 0,377 | 0,129 | 8 |
| q4_k_s | 0,189 | 0,239 | 0,097 | 7 |
| q4_1 | 0,201 | 0,296 | 0,130 | 7 |
| q4_0 | 0,149 | 0,314 | 0,076 | 4 |
| q3_k_l | 0,227 | 0,357 | 0,124 | 6 |
| q3_k_m | 0,275 | 0,324 | 0,142 | 9 |
| No publicado: q3_k_s | 0,394 | 0,421 | 0,177 | 11 |
| No publicado: q2_k | 0,181 | 0,277 | 0,150 | 13 |

| Codec (backbone bf16) | CER Whisper | CER kotoba | Mejor de dos | Ambas mal (de 54) |
|---|---|---|---|---|
| bf16 | 0,427 | 0,289 | 0,115 | 5 |
| q8_0 | 0,244 | 0,291 | 0,075 | 4 |
| q8_0-lm-q8_0 | 0,300 | 0,290 | 0,115 | 6 |
| No publicado: q5_k_m | 0,262 | 0,555 | 0,182 | 14 |
| No publicado: q4_k_m | 0,365 | 0,485 | 0,205 | 13 |

Rendimiento en dispositivo (Pixel 7 Pro, Tensor G2, 6 frases japonesas, factor de tiempo real = tiempo de generación / tiempo de audio):

| Ficheros | 4 núcleos grandes | 2 núcleos grandes |
|---|---|---|
| `pocket-tts-ja-bf16` + `codec-bf16` | 1,27 | 2,29 |
| `pocket-tts-ja-q8_0` + `codec-q8_0-lm-q8_0` | 0,41 | 0,53 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el par recomendado BF16 ocupa 236 MB en disco y el par móvil 126 MB, por lo que la huella en memoria es muy reducida.
- GPU recomendadas: no se especifican en la información disponible; el modelo se ejecuta en CPU o GPU mediante codec.cpp y llama.cpp.
- Cabe en GPU de consumo: sí, por el tamaño de los ficheros (96–236 MB según configuración); no se detallan modelos concretos.
- Despliegue: llama.cpp para el backbone (como `starcoder2`) y codec.cpp para el codec, conectando ambos grafos. No se documentan otras opciones (vLLM, TGI, Ollama).
- Latencia y throughput: en Pixel 7 Pro (Tensor G2) con 6 frases japonesas, factor de tiempo real de 1,27 (4 núcleos grandes) y 2,29 (2 núcleos grandes) con BF16; 0,41 y 0,53 respectivamente con el par q8_0. No hay datos de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Pocket-TTS-ja-GGUF (este) | 38.253.250 (safetensors); base descrito como 110M | No disponible | ja | CC BY 4.0 | GGUF |
| takuma104/pocket-tts-ja-cc | 110M (según model card) | No disponible | ja | CC BY 4.0 | Safetensors (checkpoint BF16) |
| takuma104/pocket-tts-ja | No disponible | No disponible | ja | CC BY-NC (variante NC) | No disponible |
| kyutai/pocket-tts | No disponible | No disponible | Inglés (modelo original) | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta japonés; no se documentan otros idiomas.
- Riesgo de alucinación del ASR en la evaluación: el autor usa "mejor de dos" porque un ASR puede alucinar (por ejemplo, repetir la frase); las cifras de CER deben interpretarse con esa cautela.
- Calidad variable según cuantización: q3_k_s y q2_k no se publicaron por superar el umbral (mejor de dos CER > 0,15 o más de 10 de 54 líneas mal en ambos ASR). Los codecs q5_k_m y q4_k_m tampoco se publicaron por fallar la verificación (CER de 0,182 y 0,205, con 14 y 13 líneas mal).
- El muestreo hace variar líneas individuales; no se garantiza consistencia entre ejecuciones con la misma entrada.
- Requiere preprocesado de texto específico (sustituciones de `japanese.yaml`, `;`→`,`, terminación en `.`/`!`/`?`); omitirlo puede degradar la síntesis.
- En CPUs sin productos escalares BF16 (la mayoría de teléfonos) los pesos BF16 se ejecutan lentamente; es necesario usar el par `q8_0` + `codec-q8_0-lm-q8_0`.
- Licencia CC BY 4.0: permite uso comercial con atribución; no debe confundirse con la variante NC `takuma104/pocket-tts-ja`.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción.
- No se documentan sesgos conocidos del modelo en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BricksDisplay/Pocket-TTS-ja-GGUF
- Modelo base: https://huggingface.co/takuma104/pocket-tts-ja-cc
- Configuración japonesa (`japanese.yaml`): https://huggingface.co/takuma104/pocket-tts-ja-cc/blob/main/japanese.yaml
- Modelo original de Kyutai: https://huggingface.co/kyutai/pocket-tts
- llama.cpp: https://github.com/ggml-org/llama.cpp
- codec.cpp: https://github.com/mybigday/codec.cpp
- Paper referenciado (arXiv:2509.06926): https://arxiv.org/abs/2509.06926
