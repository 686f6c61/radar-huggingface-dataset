# gagni/parakeet-tdt-0.6b-v3-ultra-onnx

## Resumen

Parakeet TDT 0.6B v3 Ultra ONNX es una exportación a formato ONNX del modelo de reconocimiento automático del habla (ASR) `moondream/parakeet-ultra`, que a su vez es un ajuste posterior (post-training) del `nvidia/parakeet-tdt-0.6b-v3`. Lo publica el usuario `gagni` como espejo sin modificar de cinco ficheros del repositorio original de `Olicorne`, con el objetivo de que el proyecto aSup no dependa de un repositorio de terceros. La arquitectura es NeMo Conformer con decodificación TDT (Token-and-Duration Transducer) y 0,6 mil millones de parámetros.

El modelo está pensado para transcripción de voz tanto en servidor como íntegramente en el navegador (WebGPU y WASM), y cubre 25 idiomas europeos, entre ellos el castellano. Su relevancia actual radica en que ofrece una alternativa libre (CC-BY-4.0) y ligera a los modelos ASR propietarios, con variantes cuantizadas que van desde 2,5 GB en fp32 hasta 383 MB en w4a8, lo que permite desplegarlo en hardware de consumo e incluso en el cliente.

La ficha describe la variante ONNX int8 publicada en este repositorio (encoder de 650 MB y decoder de 18 MB), aunque se documentan también las demás precisiones disponibles en el repositorio original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion) |
| Tipos de cuantizacion | fp32, fp16, int8 (MatMulNBits 8-bit, bloque 64), w4a8 (MatMulNBits 4-bit, bloque 32) |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder y decoder separados) + `nemo128.onnx` (preprocesador) + `vocab.txt` + `config.json` |

## Arquitectura y entrenamiento

El modelo es un Conformer (transformer convolucional) de 0,6 B de parámetros con decodificador TDT, la variante de transducer que predice conjuntamente tokens y duraciones, lo que acelera la decodificación frente a un transducer clásico. Deriva de `nvidia/parakeet-tdt-0.6b-v3`, sobre el que `moondream` aplicó un post-entrenamiento en precisión completa; según la model card, la versión Ultra supera al original en todas las benchmarks que reporta moondream. No se detallan en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

La exportación ONNX incorpora varias optimizaciones técnicas documentadas. En primer lugar, cada encoder sustituye el `rel_shift` por capa de NeMo (Pad, Reshape, Slice, Reshape, Slice) por un único `Gather` sobre un índice de posición compartido por las 24 capas, lo que reduce el grafo de 2168 a 1795 nodos con salidas idénticas (diferencia máxima absoluta de 0.0 en CPU con onnxruntime) y mejora los tiempos en WebGPU. En segundo lugar, ambos decoders fijan el sesgo de salida de `<unk>` (id 0) a -1e4 para impedir que la búsqueda greedy o beam lo emita. En tercer lugar, el encoder enmascara los frames de padding con un sesgo de atención solo sobre claves, lo que permite batching de audios de distinta longitud sin padding manual y mantiene la identidad bit a bit con batch 1.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en 25 idiomas europeos.
- Decodificación TDT con búsqueda greedy y beam search.
- Procesamiento por lotes de clips de distinta duración sin padding manual (gracias al enmascaramiento de frames).
- Ejecución en navegador mediante WebGPU (fp32/fp16) y WASM (int8), con transcripción íntegramente en el cliente.
- Compatibilidad con `onnx-asr` y con el proyecto Parakeet Web.
- Supresión de la emisión del token `<unk>`, que en el modelo base aparecía con caracteres fuera de vocabulario como `°`, `+` o algunos apóstrofos.
- No dispone de tool calling, razonamiento multi-paso, visión ni audio más allá de la transcripción; es un modelo puramente ASR.

## Casos de uso

- Transcripción en el navegador sin servidor: con la variante int8 (650 MB + 18 MB) o w4a8 (383 MB), Parakeet Web ejecuta la transcripción íntegramente en el cliente vía WASM o WebGPU, lo que evita enviar audio a terceros y cumple requisitos de privacidad.
- Subtitulado y actas de reuniones multilingües: al cubrir 25 idiomas europeos (incluido el castellano), puede transcribir reuniones y generar subtítulos en pipelines de vídeo.
- Dictado y accesibilidad: integración en aplicaciones de escritorio o web para dictado por voz y para personas con discapacidad motriz, con latencia baja en CPU gracias a la cuantización int8.
- Procesamiento por lotes de archivos de audio: el enmascaramiento de frames permite llamar a `model.recognize([a, b, c])` con clips de distinta duración; en las pruebas citadas, lotes de 8, 16 y 32 redujeron el tiempo por clip de 0,16 s a 0,06, 0,05 y 0,04 s respectivamente.
- Dominio médico en francés: existe un ajuste derivado (`Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx`) para transcripción de terminología médica, con WER de 3,26 % en el diccionario UltiMed.
- Transcripción en servidores sin GPU: la variante int8 en CPU con onnxruntime ofrece un equilibrio razonable entre tamaño y precisión para servicios de transcripción de bajo coste.
- Investigación en ASR: sirve como referencia reproducible para comparar cuantizaciones (fp32, fp16, int8, w4a8) y estrategias de exportación ONNX.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en la información disponible son los siguientes:

| Prueba | Resultado |
|---|---|
| FLEURS fr WER (int8, CUDA greedy, tras el parche anti-`<unk>`) | 3,74 % (frente a 3,99 % antes del parche) |
| UltiMed diccionario WER (encoder w4a8, decoder fp32, CUDA) | 3,26 % (idéntico con y sin batching) |
| UltiMed (PARROT, drugs, PARHAF, diccionario) tras el parche anti-`<unk>` | variación máxima de 0,05 puntos |
| Tiempo por clip, lote de 8 / 16 / 32 (1.000 clips UltiMed, CUDA) | 0,06 / 0,05 / 0,04 s (frente a 0,16 s sin batching) |
| Tiempo de kernel GPU en WebGPU (fp32, RTX 3090 Ti, 60 s de audio) | 208 ms (frente a 229 ms antes de la optimización del grafo) |
| Mediana de ejecución en caliente del encoder en WebGPU | 542-609 ms (frente a 586-666 ms) |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR, ni comparativas numéricas con otros modelos ASR.

## Requisitos de hardware

- VRAM/RAM estimada: fp32 requiere unos 2,5 GB; fp16 unos 1,2 GB; int8 unos 650 MB + 18 MB; w4a8 unos 383 MB.
- GPU recomendadas: cualquier GPU con soporte WebGPU para las variantes fp32/fp16 (fp16 requiere `shader-f16`); en servidor, las pruebas citadas usan una RTX 3090 Ti con CUDA.
- Cabe en GPU de consumo: sí, todas las variantes caben en tarjetas con 4 GB o más de VRAM; la variante int8 funciona en CPU.
- Opciones de despliegue: onnxruntime (CPU y CUDA), WebGPU, WASM, `onnx-asr` y Parakeet Web.
- Latencia y throughput: en WebGPU con RTX 3090 Ti y 60 s de audio, el encoder tarda 208 ms de tiempo de kernel y 542-609 ms en ejecución en caliente; en batching con CUDA, entre 0,04 y 0,06 s por clip con lotes de 8 a 32.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Parakeet TDT 0.6B v3 Ultra ONNX (este) | 0,6 B | 25 europeos | CC-BY-4.0 | ONNX (fp32/fp16/int8/w4a8) | Post-entrenado por moondream; ejecutable en navegador |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible en la informacion | no disponible en la informacion | NeMo | Modelo base del que deriva; la Ultra lo supera en las benchmarks reportadas por moondream |
| Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx | 0,6 B | no disponible en la informacion | no disponible en la informacion | ONNX | Mismo layout y pipeline; sirve de referencia de exportación |
| Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx | 0,6 B | francés (dominio médico) | no disponible en la informacion | ONNX | Ajuste derivado para terminología médica francesa |

No se dispone en la información proporcionada de comparativas numéricas con modelos ASR de otros fabricantes (Whisper, Wav2Vec2, etc.).

## Limitaciones y advertencias

- Es un espejo no modificado de cinco ficheros del repositorio de Olicorne; la autoría real del modelo y de las optimizaciones corresponde a ese autor y a moondream, no a `gagni`.
- El repositorio solo incluye la variante int8 (encoder y decoder); fp32, fp16 y w4a8 están en el repositorio original.
- El modelo base emitía `<unk>` para caracteres fuera de vocabulario (`°`, `+`, algunos apóstrofos); el parche lo suprime, pero esos caracteres seguirán sin transcribirse correctamente.
- La cuantización int8 y w4a8 introduce un coste de precisión respecto a fp32, del mismo tipo que el del repositorio base v3.
- Para batching se recomienda usar el decoder fp32, ya que el decoder int8 cuantiza las activaciones.
- Cobertura limitada a 25 idiomas europeos; no se documentan otros idiomas ni el rendimiento fuera de ese conjunto.
- No se detallan sesgos conocidos, riesgos de alucinación específicos ni restricciones adicionales de la licencia CC-BY-4.0 más allá de la atribución.
- La model card incluye una petición de donación de una RTX 5090 por parte del autor original; es información de contexto, no una característica técnica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gagni/parakeet-tdt-0.6b-v3-ultra-onnx
- Repositorio original espejado: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Modelo NVIDIA original: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación de referencia: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-optimized-onnx
- Ajuste médico derivado: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-UltiMed-onnx
- Ajuste híbrido experimental: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-redux-UltiMed-experimental-onnx
- Parakeet Web: https://github.com/thiswillbeyourgithub/parakeet_web
- onnx-asr: https://github.com/istupakov/onnx-asr
- Script de optimización del grafo: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx/blob/main/scripts/optimize-encoder-graph.py
- Script anti-`<unk>`: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx/blob/main/scripts/ban-unk.py
- Sitio del autor original: https://olicorne.org
