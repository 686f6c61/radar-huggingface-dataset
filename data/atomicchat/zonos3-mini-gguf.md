# AtomicChat/ZONOS3-Mini-GGUF

## Resumen

ZONOS3-Mini es un modelo de texto a voz (text-to-speech) desarrollado por Zyphra, distribuido en formato GGUF por AtomicChat para su uso con llama.cpp. Se trata de un modelo de aproximadamente 802 millones de parámetros con una arquitectura híbrida de mezcla de expertos (MoE) y Gated DeltaNet combinada con atención, que predice 10 libros de códigos (codebooks) por trama de audio. Un códec propio, denominado ZAC, convierte esas predicciones en audio a 44,1 kHz. El modelo incorpora 27 voces integradas y cubre 10 idiomas.

La relevancia de esta ficha radica en que la versión GGUF permite ejecutar un modelo TTS de calidad en hardware local mediante llama.cpp, algo poco habitual en esta categoría. Los archivos han sido convertidos y probados contra el pull request #32020 de llama.cpp, todavía abierto en el momento de la publicación, por lo que el formato puede cambiar antes de su integración definitiva. El repositorio incluye cuantizaciones desde BF16 hasta Q3_K_M, con métricas de tasa de error de caracteres (CER) y similitud de voz frente a la referencia BF16.

El modelo base es Zyphra/ZONOS3-Mini y la licencia es Apache 2.0, lo que permite uso comercial. Con solo 0,51 GB en la cuantización recomendada (AD-Q4_K_M) más 0,62 GB para el mmproj F16, el conjunto completo ocupa aproximadamente 1,13 GB, lo que lo hace viable en GPUs de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con Gated DeltaNet + atención; 10 codebooks por trama; códec ZAC |
| Parámetros totales | 802.038.600 |
| Parámetros activos | ~100M por trama (MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16, Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-Q3_K_M (mmproj en F32 y F16) |
| Idiomas soportados | en, de, zh, fr, es, it, pt, ko, hi, te |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); requiere un archivo backbone + un mmproj |

## Arquitectura y entrenamiento

La arquitectura combina una columna vertebral MoE de unos 800M parámetros totales con aproximadamente 100M parámetros activos por trama, usando capas Gated DeltaNet junto con mecanismos de atención. El modelo predice 10 codebooks por trama de audio, que el códec ZAC transforma en audio a 44,1 kHz. El mmproj contiene las cabezas de los codebooks, las 27 voces integradas y el decodificador del códec (keep2_plain).

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión GGUF se centra en los detalles de cuantización y ejecución, no en el proceso de entrenamiento del modelo base. La innovación técnica destacable es el uso de un backbone MoE ligero con Gated DeltaNet para TTS, junto con el códec ZAC y la conversión específica para llama.cpp mediante la PR #32020.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto normalizado en 10 idiomas.
- 27 voces integradas, identificadas mediante el flag `--tts-voice`; la primera de cada idioma es la predeterminada.
- Predicción de 10 codebooks por trama y decodificación a audio a 44,1 kHz mediante el códec ZAC.
- Detección automática del idioma a partir del texto de entrada; no existe flag de idioma.
- Muestreo configurable con los ajustes de referencia: temperatura 0,75, top-k 80, top-p 0,69 y penalización de repetición 2,4.
- No soporta clonación de voz (`--tts-speaker-file`) en la PR actual; solo voces integradas.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Locución automatizada de artículos y boletines: el modelo sintetiza texto normalizado en inglés, alemán, chino y otros idiomas con voces integradas, adecuado para pipelines de publicación de contenido.
- Generación de audiolibros y narración: con 27 voces y audio a 44,1 kHz, permite producir narraciones de calidad en varios idiomas desde un único modelo local.
- Sistemas de anuncios y megafonía multilingüe: la detección automática del idioma y la cobertura de 10 idiomas facilitan mensajes en entornos con públicos diversos.
- Asistentes de voz para aplicaciones de escritorio: al ejecutarse con llama.cpp en GPU de consumo, puede integrarse en aplicaciones locales y offline como Atomic Chat.
- Accesibilidad y lectura de textos: conversión de documentos a audio para personas con discapacidad visual, con cuantización Q3_K_M (0,41 GB) para equipos con poca VRAM.
- Do-blaje y prototipado de contenido: generación rápida de pistas de voz en varios idiomas para maquetas y pruebas de localización antes de una producción profesional.
- Pruebas de integración TTS en CI/CD: el binario `llama-tts` permite automatizar la generación de muestras de audio y comparar métricas CER entre cuantizaciones.

## Benchmarks y rendimiento

Métricas de la model card (CER y similitud de voz frente a BF16):

| Archivo | GB | bpw | CER EN | CER DE | CER ZH | Similitud EN / DE / ZH |
|---|---|---|---|---|---|---|
| BF16 | 1,61 | 16,0 | 0,06% | 0,00% | 0,91% | referencia (0,960 / 0,956 / 0,853) |
| Q8_0 | 0,85 | 8,52 | 0,06% | 0,00% | 1,01% | +0,001 / −0,003 / +0,007 |
| AD-Q6_K | 0,67 | 6,70 | 0,09% | 0,00% | 1,29% | −0,001 / −0,002 / +0,006 |
| AD-Q5_K_M | 0,61 | 6,03 | 0,06% | 0,00% | 1,66% | +0,001 / −0,002 / +0,009 |
| AD-Q4_K_M | 0,51 | 5,07 | 0,06% | 0,00% | 1,10% | −0,002 / −0,005 / +0,009 |
| AD-Q3_K_M | 0,41 | 4,09 | 0,09% | 0,00% | 1,62% | −0,004 / −0,007 / −0,002 |
| Q4_K_M estándar (no distribuido) | 0,48 | 4,83 | 0,09% | 0,11% | 2,74% | +0,003 / −0,008 / +0,002 |

| mmproj | GB | CER EN / DE / ZH (backbone BF16) | Similitud vs F32 (EN / DE / ZH) |
|---|---|---|---|
| F32 | 1,07 | 0,06% / 0,00% / 0,91% | referencia |
| F16 | 0,62 | 0,03% / 0,00% / 1,08% | +0,001 / −0,001 / −0,003 |

Las cifras en negrita en la model card corresponden a diferencias cuyo intervalo de confianza del 95% excluye cero; el resto está dentro del ruido de muestreo de BF16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM estimada: el conjunto recomendado (AD-Q4_K_M + mmproj F16) ocupa unos 1,13 GB en disco; la inferencia requiere espacio adicional para el contexto y el búfer de audio.
- GPU recomendadas: NVIDIA con `-DGGML_CUDA=ON`, Apple Silicon con Metal (activado por defecto) y otras GPU compatibles con llama.cpp.
- Cabe en GPU de consumo: la cuantización AD-Q3_K_M (0,41 GB) y el conjunto AD-Q4_K_M (1,13 GB) son aptos para GPUs consumer con poca VRAM.
- Opciones de despliegue: llama.cpp compilado en la PR #32020 (commit `967726e4`), usando el binario `llama-tts` con `-ngl 99` para descargar todas las capas en GPU.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ZONOS3-Mini (esta ficha) | 802M (MoE, ~100M activos) | no disponible | 10 | Apache 2.0 | GGUF (llama.cpp) |
| Zyphra/ZONOS3-Mini (original) | 802M (MoE, ~100M activos) | no disponible | 10 | Apache 2.0 | pesos originales; GGUF propio para runtime ggml de Zyphra |
| Alternativas TTS de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con otros modelos TTS de la misma categoría no está disponible en la información proporcionada. Cabe señalar que los GGUF del repositorio de Zyphra no cargan en llama.cpp, mientras que los de AtomicChat sí.

## Limitaciones y advertencias

- Formato inestable: los archivos se generaron contra la PR #32020 de llama.cpp, aún abierta; si el formato cambia antes de la integración, serán reconvertidos y sustituidos.
- Clonación de voz no soportada en la PR actual; solo pueden usarse las 27 voces integradas.
- Requiere texto normalizado: números, fechas y abreviaturas se leen tal como están escritos.
- El idioma se deduce del texto; no hay control explícito del idioma de salida.
- La cuantización AD-Q3_K_M presenta pérdidas medibles: CER en chino +0,7 puntos y similitud de voz −0,004 a −0,007.
- El preset Q4_K_M estándar pierde más en chino (+1,8 puntos de CER, significativo) que la variante AD.
- Riesgo de sesgos y alucinaciones en la pronunciación no documentado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones de atribución de la licencia.
- No se documentan limitaciones de longitud de contexto ni de idioma más allá de los 10 idiomas listados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/ZONOS3-Mini-GGUF
- Modelo base: https://huggingface.co/Zyphra/ZONOS3-Mini
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32020
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Atomic Chat: https://atomic.chat/?utm_source=huggingface&utm_medium=referral&utm_campaign=hf_zonos3_mini&utm_content=btn_atomic
- Discord de Atomic Chat: https://discord.gg/8wGSsvmg4V
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- X de Atomic Chat: https://x.com/atomic_chat_hq
