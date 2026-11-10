# ShiWarai/gigaam-ctc-rknn

## Resumen

gigaam-ctc-rknn es una conversión a formato RKNN de dos modelos de reconocimiento automático del habla (ASR) de la familia GigaAM, desarrollados originalmente por Salute Developers (Sber) y publicados en Hugging Face bajo el identificador ai-sage/GigaAM-Multilingual. El autor de esta conversión, ShiWarai, empaqueta dos variantes: una "small hybrid" de 220 millones de parámetros y una "large int8" de 600 millones y 24 capas, ambas basadas en arquitectura Conformer con cabecera CTC y optimizadas para ejecutarse en la NPU del SoC Rockchip RK3588 (familia Orange Pi 5).

El problema que resuelve es la ausencia de modelos ASR multilingües eficientes para hardware embebido de bajo consumo. Frente a las versiones fp16 originales (238 ms y 354 ms de latencia, 487 MB y 1182 MB de RAM pico), las variantes cuantizadas reducen la latencia a 204 ms y 157 ms respectivamente, y el consumo de memoria a 303 MB y 620 MB, manteniendo —según el autor— una transcripción CTC idéntica a la de sus equivalentes fp16 en audio real.

La relevancia actual radica en que cubre cinco idiomas (ruso, inglés, kazajo, kirguís y uzbeko) con una ventana estática de 5,02 segundos de audio a 16 kHz por inferencia, lo que lo hace adecuado para despliegues de borde con segmentación por VAD. No es un modelo de streaming y su cabecera CTC a nivel de carácter no produce puntuación ni mayúsculas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer con cabecera CTC (dos variantes: small 220M, large 600M/24 capas) |
| Parámetros totales | 220 M (small) / 600 M (large) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana estática de 500 frames mel = 5,02 s de audio a 16 kHz |
| Tipos de cuantización | small: fp16 + w8a8 mixta automática (117 capas en fp16); large: w8a8 / normal / channel int8 |
| Idiomas soportados | ru, en, kk, ky, uz |
| Licencia | MIT |
| Formato de pesos | RKNN (RKNN-Toolkit2 2.3.2), dos ficheros: small hybrid (266 MB) y large int8 (606 MB) |
| Entrada | `features` `1×64×500` log-mel float32 |
| Salida | `log_probs` `1×125×71` (CTC, stride 4) |
| Vocabulario | 71 tokens de carácter (`70` = blank CTC, `0` = separador de palabra) |
| Runtime requerido | librknnrt 2.3.2 (no incluido en el repo) |
| Tamaño del repo | 0,9 GB |

## Arquitectura y entrenamiento

Los modelos subyacentes son Conformer CTC de GigaAM: codificadores convolucionales con atención, entrenados por Salute Developers para ASR multilingüe en ruso, inglés, kazajo, kirguís y uzbeko. La variante small tiene 220 M de parámetros; la large, 600 M y 24 capas. La información disponible no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden a la model card original de ai-sage/GigaAM-Multilingual, no incluida aquí.

La innovación técnica de esta ficha es la conversión: exportación a ONNX estático con secuencia 500, cuantización mediante RKNN-Toolkit2 2.3.2 y compilación para la NPU RK3588. La variante small usa precisión mixta automática (un script puntúa la sensibilidad por capa y deja 117 capas en fp16: sumas residuales, layer norms, muls de GELU y convoluciones sensibles). La variante large se compila directamente a int8 con `do_quantization=True` sobre el ONNX fp16. La calibración emplea 256 ventanas de habla real (subconjuntos de test de FLEURS en ru/kk/ky/uz/en más clips de ejemplo de GigaAM); barridos con 1024 muestras y `mmse` no superaron a 256/`normal`. El grafo Conformer requiere un monkeypatch de fuse-ops que desactiva `swap_transpose_softmax`, `swap_transpose_exsoftmax13` y `swap_transpose_logsoftmax`. El build híbrido de la variante large está bloqueado por un segfault determinista del compilador de RKNN-Toolkit2 2.3.2 (`librknnc.so`, offset `0x3194b3`).

## Capacidades

- Reconocimiento automático del habla (ASR) en ruso, inglés, kazajo, kirguís y uzbeko.
- Transcripción a nivel de carácter mediante decodificación CTC greedy (argmax, colapso de repeticiones, eliminación de blank).
- Procesamiento de ventanas de audio de hasta 5,02 s (500 frames mel); el audio más largo se trunca y el más corto se rellena repitiendo el último frame.
- Inferencia en NPU RK3588 con el runtime librknnrt 2.3.2 y el core `RKNN_NPU_CORE_ALL` (`0xFFFF`).
- Frontend log-mel compatible con el original de GigaAM: `torchaudio.MelSpectrogram(n_mels=64, win=320, hop=160, n_fft=320, center=False)` seguido de `log(clamp(x, 1e-9, 1e9))`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio en streaming.
- No produce puntuación ni mayúsculas; el apóstrofo es un token independiente.

## Casos de uso

- Transcripción de voz en dispositivos de borde: despliegue en Orange Pi 5 u otras placas RK3588 para dictado o notas de voz offline en ruso y lenguas de Asia Central, con 157 ms de latencia por ventana de 5 s en la variante large y 303 MB de RAM pico en la small.
- Subtitulado por segmentos con VAD: al no ser streaming, se segmenta el audio continuo con detección de actividad de voz y se transcriben las locuciones de hasta 5,02 s, encadenando resultados.
- Asistentes de voz embebidos: integración en kioscos o dispositivos domésticos con NPU de bajo consumo que necesiten reconocimiento local sin enviar audio a la nube, gracias al tamaño de 266 MB (small) o 606 MB (large).
- Procesamiento por lotes de grabaciones cortas: transcripción de llamadas, entrevistas o mensajes de voz ya segmentados en ficheros WAV de 16 kHz mono, usando los scripts `frontend.py`, `test_npu.py` y `decode_ctc.py` incluidos en el repo.
- Investigación en ASR multilingüe de bajos recursos: evaluación de la calidad en kazajo, kirguís y uzbeko —idiomas con pocos recursos— sobre hardware asequible, con la variante small como referencia de precisión y la large para máxima exactitud.
- Prototipado de pipelines de voz en producción con requisitos de privacidad: al ejecutarse íntegramente en local sobre la NPU, evita el envío de audio a servicios externos y cumple con escenarios donde la latencia de red o la confidencialidad son críticas.

## Benchmarks y rendimiento

Latencia y memoria medidas en Orange Pi 5 (RK3588, driver NPU 0.9.x, mediana de 5 ejecuciones):

| Variante | Latencia NPU | RAM pico | Tamaño de fichero |
|---|---|---|---|
| small hybrid | 204 ms | 303 MB | 266 MB |
| large int8 | 157 ms | 620 MB | 606 MB |
| small fp16 (referencia, no incluida) | 238 ms | 487 MB | — |
| large fp16 (referencia, no incluida) | 354 ms | 1182 MB | — |

Fidelidad frente a la referencia ONNX Runtime fp32 (media de 5 casos de calibración):

| Variante | Coincidencia argmax | Coseno | Mediana abs |
|---|---|---|---|
| small fp16 (ref) | 94,1 % | 0,9993 | 0,16 |
| small hybrid | 91,8 % | 0,9989 | 0,43 |
| large fp16 (ref) | 97,7 % | 0,9998 | — |
| large int8 | 82,5 % | 0,9962 | — |

El autor indica que, pese a la diferencia de argmax, el texto CTC greedy es idéntico al de la variante fp16 en todos los clips reales probados en ruso e inglés; en un tercer clip la large int8 difiere solo en un nombre propio (`dunlap` → `denlap`). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER sobre FLEURS completo) en la información disponible.

## Requisitos de hardware

- NPU Rockchip RK3588 (Orange Pi 5 y clase equivalente); el runtime `librknnrt` 2.3.2 debe cargarse desde la release de RKNN-Toolkit2 v2.3.2 y no sustituirse si otro proceso necesita otra versión.
- RAM: 303 MB pico para la small hybrid, 620 MB pico para la large int8.
- Almacenamiento: 266 MB (small) y 606 MB (large), más el repo completo de 0,9 GB.
- No está pensado para GPU convencional (A100, H100, RTX 4090); el formato RKNN es específico de la NPU Rockchip. Para esos entornos habría que usar el modelo base ai-sage/GigaAM-Multilingual en PyTorch/ONNX.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia medida: 157 ms (large int8) y 204 ms (small hybrid) por ventana de 5,02 s. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| gigaam-ctc-rknn (small) | 220 M | 5,02 s estático | ru, en, kk, ky, uz | MIT | NPU RK3588 (RKNN) |
| gigaam-ctc-rknn (large) | 600 M | 5,02 s estático | ru, en, kk, ky, uz | MIT | NPU RK3588 (RKNN) |
| ai-sage/GigaAM-Multilingual (base) | 220 M / 600 M | según checkpoint original | ru, en, kk, ky, uz | MIT | PyTorch / ONNX en CPU/GPU |
| Whisper (variantes small/medium) | ~244 M / ~769 M | 30 s | multilingüe amplio | MIT | CPU, GPU, ONNX, etc. |

La comparación con Whisper es aproximada: no se dispone de cifras de WER comparativas en la información proporcionada. Frente al modelo base, la conversión RKNN sacrifica portabilidad a cambio de latencia y memoria reducidas en NPU RK3588.

## Limitaciones y advertencias

- Ventana fija de 5,02 s: no es streaming; requiere VAD y segmentación por locución, y trunca el audio que excede la ventana.
- Cabecera CTC a nivel de carácter: sin puntuación, sin mayúsculas y con el apóstrofo como token propio.
- Calidad del inglés calificada como "moderada" por el autor; la precisión es mejor en ru, kk, ky y uz.
- La variante large int8 muestra una caída notable de coincidencia argmax (82,5 %) frente a la referencia fp32, aunque el texto decodificado coincide en los clips reales probados; conviene validar con audio propio antes de producción.
- El build híbrido de la variante large no es posible con RKNN-Toolkit2 2.3.2 por un segfault determinista del compilador.
- Dependencia estricta de `librknnrt` 2.3.2; mezclar versiones del runtime puede romper la inferencia.
- Riesgo de alucinación y errores en nombres propios y palabras poco frecuentes, documentado en los ejemplos del autor.
- Licencia MIT, que permite uso comercial; no obstante, los datos de calibración FLEURS son CC-BY 4.0 y deben respetarse sus términos si se redistribuyen.
- No se documentan sesgos específicos por idioma o acento en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShiWarai/gigaam-ctc-rknn
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual
- Repositorio GigaAM de Salute Developers: https://github.com/salute-developers/GigaAM
- RKNN-Toolkit2 (release v2.3.2): https://github.com/airockchip/rknn-toolkit2
