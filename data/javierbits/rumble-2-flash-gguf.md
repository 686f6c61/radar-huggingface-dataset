# javierbits/Rumble-2-Flash-GGUF

## Resumen

Rumble-2-Flash-GGUF es la versión cuantizada en formato GGUF del modelo de reconocimiento automático del habla Reson8/Rumble-2-Flash, publicada por el usuario javierbits para su uso con llama.cpp. Se trata de un modelo de 322 millones de parámetros (aproximadamente 0,5 B según la model card) que combina un codificador de audio de 18 capas con un decodificador Qwen3 de 14 capas y un vocabulario de 99.630 tokens, orientado a transcripción multilingüe en 45 idiomas.

La relevancia de esta ficha radica en que ofrece una ruta de despliegue en dispositivo (on-device) con un peso total de aproximadamente 0,5 GB, repartido entre un decodificador de 283 MB y un codificador de audio de 214 MB. El autor ha publicado un benchmark independiente sobre 700 enunciados de FLEURS en siete idiomas, comparando la cuantización AD-Q5_K_M con la referencia BF16, con un error agrupado del 11,67 % frente al 11,65 % del modelo original.

El modelo hereda la licencia Apache-2.0 del checkpoint base y está pensado para escenarios de transcripción de audio corto (3-25 segundos) en entornos con recursos limitados, como teléfonos o CPUs ARM, donde llama.cpp ofrece un consumo de memoria de 0,76 GiB en pico con contexto de 1024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio de 18 capas + decodificador Qwen3 de 14 capas (Qwen3-ASR) |
| Parametros totales | 322.255.360 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens recomendados en llama.cpp (un clip de 15 s requiere ~300 tokens) |
| Tipos de cuantizacion | AD-Q5_K_M para el decodificador; Q8_0 para el mmproj (codificador de audio) |
| Idiomas soportados | 45 idiomas: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el checkpoint base está en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos componentes: un codificador de audio de 18 capas que procesa la señal acústica y un decodificador basado en Qwen3 de 14 capas que genera la transcripción, con un vocabulario de 99.630 tokens. La model card indica que el checkpoint base fue convertido por el equipo de AtomicChat y que esta republicación es byte-idéntica (mismos SHA-256), añadiendo un benchmark de precisión independiente. La conversión requiere tres puentes del conversor: huella de vocabulario podado, secciones M-RoPE y nombres de tensores del mmproj.

La cuantización AD-Q5_K_M mantiene la tabla de tokens y `attn_k`/`attn_v` en Q8_0, `ffn_down` y el primer y último bloque en Q6_K, y el resto en Q5_K. El soporte de audio Qwen3-ASR está presente en llama.cpp desde la build b8769, y estos ficheros se ejecutaron sobre la build `9a080f4`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Reconocimiento automático del habla (ASR) en 45 idiomas, con detección automática de idioma o forzado mediante código ISO o nombre en inglés.
- Transcripción de audio corto, en el rango de 3 a 25 segundos por clip según las limitaciones declaradas.
- Salida con puntuación y capitalización, ya que el benchmark aplica normalizadores de texto de Whisper.
- Detección de idioma: al omitir el parámetro `language`, la respuesta comienza con `language <Nombre><asr_text>`.
- Ejecución en dispositivo mediante llama.cpp, con soporte de `llama-server` y `llama-mtmd-cli`.
- Integración con la API compatible de OpenAI para transcripciones (`/v1/audio/transcriptions`).
- No se documentan capacidades de tool calling, agentes, visión ni razonamiento multi-paso; el pipeline es exclusivamente de reconocimiento de voz.

## Casos de uso

- Transcripción en dispositivos móviles: con 0,76 GiB de RSS en pico y RTFx ~5 en CPU ARM de 20 hilos, el modelo puede ejecutarse localmente en un teléfono para dictado o notas de voz sin enviar audio a la nube.
- Subtitulado de clips cortos: para vídeos de hasta 25 segundos, el modelo genera transcripciones con puntuación en 45 idiomas, adecuado para pipelines de subtitulado automático por segmentos.
- Asistentes de voz offline: al integrarse en `llama-server` con la API compatible de OpenAI, puede alimentar asistentes conversacionales que necesiten transcripción local previa al procesamiento del lenguaje.
- Procesamiento por lotes en CPU: el bajo consumo de memoria permite ejecutar múltiples instancias en servidores sin GPU para transcribir archivos de audio cortos en flujos ETL.
- Aplicaciones de accesibilidad: transcripción en tiempo real de conversaciones breves en dispositivos de gama baja, con soporte de 45 idiomas que cubre la mayoría de lenguas europeas y asiáticas principales.
- Investigación en ASR multilingüe: el par GGUF más el benchmark reproducible incluido (`bench_select.py`, `bench_release.py`) permite evaluar el impacto de la cuantización en precisión por idioma con intervalos de confianza bootstrap.

## Benchmarks y rendimiento

Resultados sobre FLEURS `test`, 100 enunciados por idioma, decodificación greedy, idioma forzado, normalizadores de texto de Whisper (CER para mandarín y cantonés), medidos en una NVIDIA GB10 con llama.cpp `9a080f4` frente al checkpoint BF16 en Transformers 5.23:

| Idioma | n | Error BF16 % | Error GGUF % | Delta pp [IC 95 %] |
|---|---|---|---|---|
| Inglés | 100 | 7,29 | 8,10 | +0,81 [-0,16, +1,95] |
| Español | 100 | 4,28 | 4,16 | -0,12 [-0,45, +0,17] |
| Portugués | 100 | 7,00 | 7,02 | +0,02 [-0,47, +0,59] |
| Alemán | 100 | 7,22 | 7,26 | +0,04 [-0,39, +0,51] |
| Francés | 100 | 7,16 | 8,02 | +0,87 [+0,19, +1,60] |
| Chino (CER) | 100 | 6,26 | 6,11 | -0,15 [-0,53, +0,25] |
| Cantonés (CER) | 100 | 42,33 | 40,98 | -1,35 [-3,34, +0,56] |
| **Agrupado** | 700 | 11,65 | 11,67 | +0,02 [-0,34, +0,38] |

El 34 % de las transcripciones difieren byte a byte (puntuación, mayúsculas, elección de palabras) aunque la precisión agrupada no cambia. El francés muestra una regresión pequeña pero significativa (+0,87 pp). El cantonés es difícil para el propio modelo base (42 %), no por la cuantización. Los números absolutos no son comparables con la model card del modelo base (distintos splits y normalización).

## Requisitos de hardware

- VRAM/RAM estimada: 283 MB (decodificador) + 214 MB (codificador de audio) ≈ 0,5 GB en disco; 0,76 GiB de RSS en pico medido en CPU ARM de 20 hilos con `-c 1024`.
- GPU recomendadas: no se especifican en la información disponible; el benchmark se realizó en una NVIDIA GB10.
- Cabe en GPU de consumo: sí, por tamaño (0,5 GB) es compatible con cualquier GPU consumer moderna, aunque no se documentan pruebas específicas.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli`), con soporte de audio Qwen3-ASR desde la build b8769. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: RTFx ~5 mediana en CPU ARM de 20 hilos (llama.cpp CPU build).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la información proporcionada. La model card solo compara el GGUF con su propia referencia BF16 del mismo modelo, por lo que no es posible establecer una comparativa con otros modelos ASR de tamaño similar (por ejemplo, Whisper small o variantes de Qwen3-ASR) sin inventar cifras.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Rumble-2-Flash-GGUF (este) | 322 M | 1024 tokens | Apache-2.0 | GGUF |
| Reson8/Rumble-2-Flash (base) | ~0,5 B | no disponible | Apache-2.0 | safetensors BF16 |
| Alternativas ASR comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo cubre habla leída (read speech) en clips de 3 a 25 segundos; el audio de formato largo y conversacional no está cubierto por las métricas publicadas.
- La identificación de idioma no está evaluada: el benchmark fuerza el idioma en todos los casos.
- Por debajo de ~0,27 GB total (Q4_K_M estándar y menores) la precisión se degrada de forma medible en este modelo de 0,5 B; por eso esta build usa Q5.
- El cantonés presenta un error del 42 % en el propio modelo base, lo que limita su utilidad práctica en ese idioma.
- El cabezal CTC auxiliar del repositorio original (`ctc/`, 357 MB F32) no está incluido porque llama.cpp no tiene runtime para él.
- Sin `--jinja` se ignora la plantilla embebida y las transcripciones se degradan.
- No se documentan sesgos concretos ni tasas de alucinación en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del checkpoint original.

## Enlaces

- [javierbits/Rumble-2-Flash-GGUF en Hugging Face](https://huggingface.co/javierbits/Rumble-2-Flash-GGUF)
- [Reson8/Rumble-2-Flash (modelo base)](https://huggingface.co/Reson8/Rumble-2-Flash)
- [AtomicChat/Rumble-2-Flash-GGUF (conversión original)](https://huggingface.co/AtomicChat/Rumble-2-Flash-GGUF)
- [Dataset google/fleurs](https://huggingface.co/datasets/google/fleurs)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
