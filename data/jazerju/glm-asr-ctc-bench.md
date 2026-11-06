# JazerJu/glm-asr-ctc-bench

## Resumen

`JazerJu/glm-asr-ctc-bench` no es un modelo único, sino un repositorio de pesos ONNX ya exportados y cuantizados de tres motores de reconocimiento automático del habla (ASR) basados en CTC, empaquetados para reproducir un benchmark comparativo con un solo comando. Lo mantiene el usuario independiente JazerJu y su función es servir de artefacto de evaluación: permite descargar, ejecutar y comparar GLM-ASR-Nano, Fun-ASR-Nano y Qwen3-ASR-1.7B bajo idénticas condiciones de cuantización (int4) y proveedor de ejecución (ONNX Runtime, CPU o CUDA EP).

El repositorio contiene tres directorios de motor (`glm-ctc/`, `qwen-ctc/`, `fun-asr/`) más un cuarto directorio con una cabeza CTC Qwen3 actualizada (`qwen-ctc-a7avg5/`). Los componentes proceden de modelos publicados por zai-org (GLM-ASR-Nano-2512), Qwen (Qwen3-ASR-1.7B) y FunAudioLLM (Fun-ASR-Nano), a los que el autor ha añadido cabezas CTC entrenadas por él mismo y conversiones int4 propias. La relevancia actual es práctica: ofrece una vía de despliegue ASR en CPU con pesos de 130–190 MB por codificador, algo viable en hardware modesto, y documenta con detalle los errores de integración que invalidan silenciosamente los resultados.

El tamaño del repositorio es de 3,6 GB e incluye variantes fp16, fp32 e int4. La licencia declarada es Apache-2.0 para las partes entrenadas por el autor; los componentes de terceros quedan sujetos a sus licencias upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer (audio tower) + proyector + cabeza CTC lineal; exportado a ONNX |
| Parametros totales | No disponible como cifra única; por componente: codificador GLM 635 M, cabeza CTC GLM 40,0 M, codificador Qwen3 317,5 M, cabeza CTC Qwen3 v1 48,3 M, cabeza a7_avg5 85,45 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; ventana de audio procesada por fragmentos (característica mel de 3000 frames con relleno a cubos) |
| Tipos de cuantizacion | int4 (RTN q4/q4f16), HQQ hqqf16, fp16, fp32 |
| Idiomas soportados | zh, en, yue, ja, ko, de, fr, es, it, nl, pl |
| Licencia | Apache-2.0 (partes entrenadas por el autor); componentes de terceros según licencia upstream |
| Formato de pesos | ONNX (+ `.data` externos), con vocabularios en `.txt` |

## Arquitectura y entrenamiento

Cada motor sigue un esquema híbrido ASR: un codificador de audio tipo transformer que produce representaciones frame a frame, un proyector que adapta la dimensionalidad y una cabeza CTC que emite logits sobre un vocabulario de tokens. En GLM, el codificador entrega 1280 dimensiones y el proyector consume 5120 dimensiones (cuatro frames consecutivos apilados); en Qwen3, el codificador es el audio tower oficial congelado y la tasa de frames es de 13 fps frente a los 50 fps de GLM. La decodificación es CTC de primera pasada (sin modelo de lenguaje externo en los resultados publicados), lo que explica parte de las tasas de error en idiomas no asiáticos.

El entrenamiento propio se concentra en las cabezas CTC. La cabeza GLM se entrenó durante 134k pasos. La cabeza Qwen3 `a7_avg5` es el promedio de cinco checkpoints (412000–420000, paso 2000), con 85,45 M de parámetros e incorporación de self-conditioning; sustituye a la cabeza v1 de 48,3 M. No se documentan en la información disponible el volumen de tokens de entrenamiento ni la composición del corpus, solo que el repositorio no contiene datos de audio. La innovación destacable es de ingeniería de despliegue: conversión int4 con RTN y HQQ, y una documentación explícita de las incompatibilidades de integración (frame rate, detokenización por bytes, apilado de frames) que producen salidas incorrectas sin error visible.

## Capacidades

- Reconocimiento de voz a texto en 11 idiomas, con métricas reportadas sobre FLEURS en en, zh, ko, ja, yue, de, fr, es, it, nl y pl.
- Salida CTC de primera pasada, apta para transcripción por fragmentos y streaming por bloques.
- Manejo de chino mandarín, cantonés, coreano y japonés mediante vocabularios compactos con primitivas de bytes (89 en el caso de Qwen3), lo que permite recomponer caracteres multibyte.
- Ejecución en CPU mediante ONNX Runtime, y en GPU mediante CUDA Execution Provider; también hay variantes fp16 para DirectML.
- Cuantización int4 con pérdida de precisión acotada y verificable mediante comparación contra fp32.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-secuencial sin LLM integrado en la ruta CTC.
- No incluye capacidades de visión ni audio-vision; el pipeline declarado es exclusivamente automatic-speech-recognition.

## Casos de uso

- Transcripción local en CPU: el codificador GLM int4 ocupa 131,9 MB más 231,3 MB de datos, de modo que un portátil sin GPU puede transcribir audio en chino o inglés con un consumo de memoria inferior a 1 GB por motor.
- Subtitulado por lotes de archivos largos: al procesar por fragmentos con una tasa de frames conocida (50 fps en GLM, 13 fps en Qwen3), se puede trocear audio de horas y reconstruir la transcripción con marcas temporales derivadas de los frames CTC.
- Evaluación comparativa de motores ASR: el repositorio está diseñado para que `bench.py --counts 20 --engines glm fun qwen` ejecute los tres motores sobre el mismo conjunto y con el mismo execution provider, lo que permite decisiones de selección con datos propios.
- Investigación sobre cuantización: las variantes fp32, fp16, int4 RTN y HQQ de la misma cabeza permiten medir la degradación de CER/WER atribuible exclusivamente a la precisión numérica.
- Desarrollo de cabezas CTC sobre codificadores congelados: el par codificador oficial más cabeza propia (caso Qwen3) sirve como plantilla para adaptar un audio tower a un vocabulario y una tarea concretos.
- Despliegue en dispositivos con DirectML: las variantes fp16 del codificador y del proyector GLM están pensadas para ejecución en Windows sobre DirectML, sin necesidad de CUDA.
- Transcripción multilingüe en atención al cliente: con cobertura de 11 idiomas y métricas conocidas por idioma, se puede enrutar cada llamada al motor con menor error para esa lengua (por ejemplo, Qwen3 para coreano y cantonés, Fun para japonés y chino).

## Benchmarks y rendimiento

FLEURS test completo (7.876 frases, 11 idiomas, int4 + CUDA EP, CTC de primera pasada):

| Idioma | Metrica | GLM | Fun | Qwen3 |
|---|---|---|---|---|
| en_us | WER | 18,3% | 18,1% | 18,3% |
| cmn_hans_cn | CER | 10,7% | 9,3% | 10,9% |
| ko_kr | CER | 39,5% | 46,0% | 20,3% |
| ja_jp | CER | 31,0% | 17,0% | 30,9% |
| yue_hant_hk | CER | 42,7% | 43,2% | 30,1% |
| de / fr / es / it / nl / pl | WER | 29,7–69,3% | 63,0–98,8% | 35,6–77,1% |

Recuento agregado: GLM 6 victorias, Fun 3, Qwen 2. En la cabeza `a7_avg5` sobre conjuntos internos (referencia pseudo-LLM v1, macro-media por vídeo): CER 14,96% en 17 segmentos de chino (frente a 16,20% de `a6_avg5`) y 5,98% en 6 segmentos de inglés (frente a 6,68%). El conjunto TED de 29 segmentos conserva 6 caracteres chinos CTC residuales, no cero, y solapa con entrenamiento, por lo que no es una prueba held-out.

Advertencia metodológica reportada por el autor: el int4 de Fun no es invariante al proveedor; ORT CPU y CUDA EP difieren en aproximadamente el 5% de las muestras, con hasta 1,9 pp de CER y peor resultado en CPU. Las comparaciones deben fijar el mismo execution provider.

## Requisitos de hardware

- VRAM/RAM por motor (int4): GLM ≈ 363 MB de pesos (131,9 + 231,3 MB) más 21,8 MB de cabeza; Qwen3 ≈ 185,9 MB de codificador más 26,3 MB de cabeza v1; Fun ≈ 148,8 MB entre codificador y CTC.
- Variantes fp16: GLM requiere 3,7 MB + 1270,4 MB de codificador y 58,7 MB de proyector; Qwen3 requiere 635,6 MB de codificador y 96,8 MB de cabeza.
- GPU recomendadas: cualquier GPU con soporte CUDA EP (A100, H100, RTX 4090, RTX 3090, etc.) acelera la inferencia, pero el diseño está optimizado para CPU; las variantes fp16 están pensadas para DirectML en GPUs de consumo bajo Windows.
- Cabe holgadamente en GPU de consumo: con pesos int4 por debajo de 400 MB por motor, incluso una GTX 1650 o una iGPU con 4 GB compartidos puede alojar el modelo completo.
- Opciones de despliegue: ONNX Runtime (CPU EP, CUDA EP, DirectML EP) mediante el repositorio `bench-asr-ctc`; los repos hermanos `GLM-ASR-CTC-GGUF` y `Qwen3-ASR-CTC-GGUF` cubren la ruta GGUF.
- Latencia y throughput: no disponibles como cifras publicadas. La tasa de frames (50 fps en GLM, 13 fps en Qwen3) condiciona el coste por segundo de audio, y el frame rate mal aplicado reduce la salida a la cuarta parte en longitud de logits.

## Comparativa con modelos similares

| Modelo | Parametros (codificador) | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-ASR-Nano + CTC (este repo) | 635 M | 11 | ONNX int4/fp16/fp32 | Apache-2.0 (cabezas) | Mejor cobertura en lenguas europeas del benchmark |
| Fun-ASR-Nano (mirror int4) | No disponible | No disponible en la ficha | ONNX int4 | Upstream FunAudioLLM | Mejor CER en chino y japonés; sensible al execution provider |
| Qwen3-ASR-1.7B + CTC (este repo) | 317,5 M | 11 | ONNX int4/fp16 | Apache-2.0 (cabezas) | Mejor CER en coreano y cantonés; 13 fps |
| Whisper large-v3 (referencia de categoría) | No disponible en la información | No disponible en la información | No disponible | No disponible | No evaluado en este benchmark |

## Limitaciones y advertencias

- No es un modelo listo para `InferenceSession` directo: el frame rate de Qwen3 es 13 fps (no 50), la detokenización de Qwen3 exige recomponer bytes desde base64 antes de decodificar UTF-8, y el proyector GLM espera 5120 dimensiones (4 frames apilados). Cualquiera de estos errores produce salida incorrecta sin lanzar excepción.
- Las métricas publicadas corresponden a decodificación CTC de primera pasada sin modelo de lenguaje; un reranking con LM mejoraría sustancialmente los resultados, especialmente en alemán, francés, neerlandés y polaco (WER de hasta 98,8% en Fun).
- El conjunto TED de 29 segmentos solapa con datos de entrenamiento y no constituye una evaluación held-out; los números de `a7_avg5` usan referencias pseudo-LLM, no transcripciones humanas verificadas.
- El int4 de Fun-ASR-Nano no es estable entre proveedores de ejecución; mezclar CPU y CUDA EP en una comparación invalida las conclusiones.
- El repositorio no incluye datos de audio ni corpus de entrenamiento; la reproducibilidad completa depende de descargar FLEURS y otros conjuntos por separado.
- La licencia Apache-2.0 se declara solo para las partes entrenadas por el autor; el uso comercial de los componentes de zai-org, Qwen y FunAudioLLM requiere verificar las licencias upstream correspondientes.
- Riesgo de alucinación inherente a CTC: en segmentos con ruido o silencio pueden aparecer caracteres residuales, como los 6 caracteres chinos detectados en TED.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y procede de un autor individual, sin revisión por pares ni soporte corporativo; conviene tratarlo como artefacto de investigación reproducible, no como dependencia de producción sin validación propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JazerJu/glm-asr-ctc-bench
- Código de evaluación: https://github.com/JazerJu/bench-asr-ctc
- Documentación de `a7_avg5`: https://github.com/JazerJu/bench-asr-ctc/blob/main/docs/a7_avg5.md
- Código de entrenamiento: https://github.com/JazerJu/glm-asr-ctc-train
- Pipeline de exportación GLM: https://github.com/JazerJu/GLM-ASR-CTC-GGUF
- Pipeline de exportación Qwen3: https://github.com/JazerJu/Qwen3-ASR-CTC-GGUF
- Pesos originales de la cabeza GLM: https://huggingface.co/JazerJu/glm-asr-ctc
- Pesos originales de la cabeza Qwen3: https://huggingface.co/JazerJu/qwen3-asr-ctc
- Cabeza Qwen3 `a7_avg5` en PyTorch: https://huggingface.co/JazerJu/qwen3-asr-ctc-aiinfra/tree/main/a7_avg5
- Modelo base GLM: https://huggingface.co/zai-org/GLM-ASR-Nano-2512
- Modelo base Qwen3: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Conversión int4 de Fun-ASR-Nano: https://github.com/HaujetZhao/CapsWriter-Offline
