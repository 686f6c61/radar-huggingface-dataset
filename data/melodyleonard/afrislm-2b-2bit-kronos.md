# melodyleonard/AfriSLM-2B-2bit-kronos

## Resumen

AfriSLM-2B-2bit-kronos es una compilación optimizada para inferencia en dispositivo del modelo de traducción automática qvac/TranslatePsy-AfriSLM-2B, que a su vez es un ajuste fino (fine-tune) con licencia Apache-2.0 del modelo base Qwen/Qwen3.5-2B. El autor, melodyleonard, distribuye dos variantes cuantizadas y podadas en formato propietario `.k2tb` (auto-descriptivo, `K2TQW35B2`), pensadas para ejecutarse con el motor Kronos, escrito íntegramente en Rust, y para el teclado Translate en iOS y Android.

El objetivo principal es reducir el peso del checkpoint original (5,19 GiB) hasta 574-674 MiB mediante poda estructural del vocabulario BPE (de 248.320 a 179.008 tokens), eliminación de tensores multimodales y de predicción multi-token no utilizados, y cuantización Hadamard-GPTQ a 2-3 bits. Además se aplica una calibración de contexto con destilación KL desde el profesor BF16 sin cuantizar, que mejora la desambiguación conversacional (género, formalidad, polisemia) sin añadir bytes.

El modelo cubre 36 idiomas, con especial énfasis en lenguas africanas (yoruba, igbo, hausa, zulú, suajili, amhárico) y conserva ortografías tonales y diacríticas complejas. Su relevancia actual radica en hacer viable la traducción multilingüe de calidad en dispositivos móviles sin conexión, un escenario donde los modelos de traducción de gran tamaño no caben.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B) con capas DeltaNet recurrentes; cuantización Hadamard-GPTQ y poda estructural |
| Parametros totales | 2B (modelo base); el checkpoint cuantizado ocupa 574-674 MiB en disco |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Variante `q2c`: MLP 2-bit Gosset E8Q2, mixer 3-bit NF3, cabeza atada 4-bit NF4; variante `nf3g128`: cuerpo 3-bit NF3 GPTQ (3,35 bpw) y cabeza atada 4-bit NF4 |
| Idiomas soportados | 36: en, yo, ig, ha, zu, sw, am, zh, ja, ko, fr, es, pt, de, it, nl, pl, cs, ro, sv, el, uk, ru, tr, ar, fa, ur, hi, bn, vi, th, id, ms (y variantes como chino tradicional) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.k2tb` (contenedor propietario Kronos, `K2TQW35B2`), comprimido con `.lzfse`; tokenizer en `tokenizer.json.lzfse` |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer Qwen3.5-2B con capas DeltaNet recurrentes (gates y normas recurrentes), del que se han eliminado los tensores de visión (`visual.*`, 297 tensores) y de predicción multi-token (`mtp.*`). El vocabulario BPE se poda de 248.320 a 179.008 tokens eliminando merges exclusivos de código fuente y tokens compuestos ultra-raros, pero preservando íntegramente las ortografías africanas (ẹ, ọ, ṣ, ụ, ị, ɓ, ɗ, ƙ, ƴ, ɛ, ɔ, tonos combinados, ₦), Hanzi, Kanji/Kana, Hangul, árabe/persa/urdu, devanagari/bengali, cirílico, griego, tailandés, etíope y diacríticos europeos y vietnamitas. Las embeddings de entrada y salida se deduplican (atadas) y se cuantizan a 4-bit NF4, ahorrando unos 205 MiB.

El entrenamiento de calibración (`train_qwen35_context`) ajusta las capas 19 a 24 (escalas por grupo `NfSdotMatrix`, gates y normas DeltaNet, QKNorm) y la `final_norm` en Rust puro, usando ejemplos conversacionales con `[Background Information]` (género del pronombre, interlocutor y objeto; registro formal/informal; polisemia; contexto del idioma destino; pares con pidgin nigeriano) y destilación KL top-64 exacta desde el profesor BF16 sin cuantizar en 36 idiomas. Los pesos calibrados se escriben in situ en las escalas BF16 sin coste adicional de bytes. Ambas variantes soportan ejecución con `mmap` de copia cero (`kronos_set_zero_copy_weights(1)`) en iOS y Android, con backend Metal GPU y ARM64 NEON.

## Capacidades

- Traducción automática multilingüe entre 36 idiomas, con foco en lenguas africanas (yoruba, igbo, hausa, zulú, suajili, amhárico) y preservación de ortografías tonales y diacríticas.
- Traducción sensible al contexto conversacional: desambiguación de género gramatical (pronombre, interlocutor, objeto), registro formal/informal, polisemia y contexto del idioma destino mediante bloques `[Background Information]`.
- Inferencia en dispositivo (on-device) sin conexión, con ejecución de copia cero por `mmap` en iOS y Android.
- Soporte de backend GPU Metal y CPU ARM64 NEON con resultados idénticos en las pruebas de calibración.
- Capacidades multilingües amplias derivadas del modelo base: chino simplificado y tradicional, japonés, coreano, árabe, persa, urdu, hindi, bengalí, vietnamita, tailandés, indonesio, malayo y principales lenguas europeas.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Traducción sin conexión en el teclado móvil: el modelo se integra en el teclado Translate (iOS y Android) con un peso de 574-674 MiB, permitiendo traducir texto en tiempo real sin red y con latencia propia de un modelo de 2B cuantizado a 2-3 bits.
- Traducción de lenguas africanas de bajos recursos: útil para hausa, zulú, igbo, yoruba, suajili y amhárico, donde los modelos comerciales rinden mal; los chrF++ de FLORES-200 alcanzan 51,5 en hausa y 56,8 en suajili con la variante `nf3g128`.
- Atención al cliente multilingüe en regiones con conectividad limitada: el modelo gestiona el registro formal/informal y el género del interlocutor mediante contexto, adecuado para respuestas automatizadas en centros de contacto con infraestructura ligera.
- Localización de aplicaciones y contenidos: traducción de cadenas de interfaz y documentación a lenguas europeas y asiáticas con un único modelo de menos de 700 MiB, desplegable en servidores modestos o en el propio dispositivo.
- Traducción de documentación sanitaria o administrativa en contextos humanitarios: la calibración de contexto reduce fugas (100 % de `no_leak` en las pruebas) y mejora la coherencia de género y registro, relevante para comunicaciones sensibles.
- Investigación en cuantización extrema: el checkpoint sirve como referencia reproducible de poda de vocabulario, GPTQ con rotación Hadamard y destilación KL top-64 en Rust puro, útil para estudiar el equilibrio precisión/tamaño en modelos de 2B.
- Despliegue en dispositivos de gama baja: el formato `.k2tb` con `mmap` de copia cero permite ejecutar el modelo en móviles sin cargar los pesos completos en RAM, habilitando traducción multilingüe en hardware restringido.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre FLORES-200 `devtest` (inglés → destino, chrF++ / BLEU):

| Idioma | v1 Hy-MT2-1.8B (`q2c`) | v2 AfriSLM-2B (`q2c`, 574 MiB) | v2 AfriSLM-2B (`nf3g128`, 674 MiB) |
|---|---:|---:|---:|
| Hausa (HA) | 8,7 / 1,8 | 42,9 / 16,7 | 51,5 / 25,7 |
| Zulú (ZU) | 12,2 / 2,0 | 41,1 / 13,2 | 48,6 / 20,0 |
| Igbo (IG) | 14,1 / 2,3 | 34,1 / 12,7 | 41,0 / 17,3 |
| Yoruba (YO) | 9,0 / 1,6 | 26,4 / 8,5 | 30,2 / 11,6 |
| Suajili (SW) | 34,0 / 9,6 | 48,6 / 21,1 | 56,8 / 29,1 |
| Amhárico (AM) | 1,0 / 0,5 | 8,4 / 1,9 | 25,3 / 5,9 |
| Chino simplificado (ZH) | 42,3 / 42,4 | 32,2 / 31,7 | 37,7 / 37,4 |
| Chino tradicional (ZT) | 21,2 / 17,5 | 25,3 / 21,4 | 29,4 / 28,1 |
| Japonés (JA) | 45,0 / 46,0 | 24,9 / 22,4 | 30,2 / 28,5 |
| Francés (FR) | 65,0 / 42,3 | 49,5 / 26,7 | 56,1 / 30,7 |
| Portugués (PT) | 66,8 / 45,2 | 51,0 / 26,9 | 55,2 / 30,9 |
| Ruso (RU) | 52,0 / 26,6 | 39,3 / 15,8 | 49,1 / 23,8 |
| Vietnamita (VI) | 55,7 / 35,4 | 43,0 / 22,5 | 48,6 / 29,6 |
| Alemán (DE) | 59,5 / 34,2 | 42,5 / 16,1 | 47,1 / 20,7 |
| Español (ES) | 53,7 / 27,8 | 44,5 / 17,0 | 45,1 / 17,4 |
| Árabe (AR) | 49,0 / 21,0 | 35,3 / 11,4 | 44,4 / 15,8 |
| Neerlandés (NL) | 52,6 / 24,1 | — | 44,3 / 17,5 |
| Tailandés (TH) | 57,4 / 58,6 | — | 43,5 / 41,9 |
| Ucraniano (UK) | 51,0 / 24,0 | — | 41,7 / 18,0 |
| Griego (EL) | 38,1 / 13,3 | — | 41,1 / 14,6 |

Resultados de desambiguación por contexto:

| Prueba | Sin contexto | Con contexto |
|---|---:|---:|
| `context_ab` (19 casos, uso de contexto) | 3/15 (20,0 %) | 10/15 (66,7 %); 19/19 sin fuga |
| `context_eval` multilingüe (361 casos, `nf3g128`, 32 idiomas) | 34,2 % | 40,0 % (+5,8 %); 66/66 sin fuga |

Ganancias por idioma en `context_eval`: chino +36 % (36 % → 73 %), japonés +11 %, francés +24 %, español +19 %, italiano +18 %, árabe +17 %, turco +29 %, neerlandés +57 %, registro formal +29 %, género del objeto +13 %.

## Requisitos de hardware

- VRAM/RAM estimada: el checkpoint completo ocupa 574 MiB (`q2c`) o 674 MiB (`nf3g128`) en disco; con `mmap` de copia cero la huella en memoria puede mantenerse cercana al tamaño del archivo, aunque no se especifica el pico de memoria en ejecución.
- GPU recomendadas: no se documentan requisitos de GPU de escritorio; el motor Kronos está orientado a Metal (iOS/macOS) y ARM64 NEON (CPU).
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GiB), aunque la información disponible no detalla compatibilidad con CUDA ni con GPUs de consumo concretas.
- Opciones de despliegue: motor Kronos (`kronos-2t`, Rust) con `kronos_set_zero_copy_weights(1)`; teclado Translate en iOS y Android. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AfriSLM-2B-2bit-kronos (`nf3g128`) | 2B (3,35 bpw) | no disponible | Traducción multilingüe on-device, 36 idiomas | Apache-2.0 | Hugging Face, formato `.k2tb` |
| Hy-MT2-1.8B (`q2c`) | 1,8B | no disponible | Traducción multilingüe cuantizada | no disponible | Referenciado en la model card |
| Qwen/Qwen3.5-2B | 2B | no disponible | Modelo base generalista | no disponible | Hugging Face |
| qvac/TranslatePsy-AfriSLM-2B | 2B | no disponible | Fine-tune de traducción (5,19 GiB) | Apache-2.0 | Hugging Face |

En FLORES-200, AfriSLM-2B supera ampliamente a Hy-MT2-1.8B en lenguas africanas (por ejemplo, hausa 51,5 frente a 8,7 chrF++), aunque rinde por debajo en chino, japonés, francés y portugués. La variante `nf3g128` mejora de forma consistente a `q2c` a costa de unos 100 MiB adicionales.

## Limitaciones y advertencias

- El formato `.k2tb` es propietario del motor Kronos; no es compatible con safetensors, GGUF ni con los runners habituales (vLLM, llama.cpp, Ollama, TGI), lo que limita su portabilidad.
- El modelo está especializado en traducción; no se documentan capacidades de tool calling, agentes, visión ni razonamiento general, y su uso fuera de traducción no está validado.
- La poda de vocabulario elimina merges de código fuente y tokens compuestos raros; aunque se preservan las ortografías africanas y asiáticas principales, pueden perderse tokens poco frecuentes en dominios técnicos o de programación.
- Riesgo de alucinación y de errores en lenguas de bajos recursos: el yoruba y el amhárico obtienen chrF++ de 30,2 y 25,3 respectivamente, muy por debajo de las lenguas europeas, lo que desaconseja su uso en producción sin revisión humana en esos pares.
- La calibración de contexto mejora la desambiguación, pero la precisión global en `context_eval` es del 40,0 %, insuficiente para traducción autónoma de alta exigencia.
- No se documentan sesgos específicos ni evaluación de seguridad; al derivar de Qwen3.5-2B, puede heredar sesgos del modelo base y de los datos de ajuste fino.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el proyecto tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.
- No se especifican la longitud de contexto efectiva ni el pico de memoria en ejecución, datos relevantes para planificar despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/melodyleonard/AfriSLM-2B-2bit-kronos
- Modelo base (fine-tune): https://huggingface.co/qvac/TranslatePsy-AfriSLM-2B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B
- Motor Kronos: https://github.com/melodyLeonard/kronos-2t
