# shahlarious/next-ayah-models

## Resumen

Next Ayah es un paquete de dos modelos de reconocimiento automático del habla (ASR) en árabe, exportados a ONNX e int8 para su ejecución íntegra en la CPU de un teléfono móvil mediante la librería sherpa-onnx. No se trata de un modelo entrenado desde cero por el autor (shahlarious), sino de una redistribución optimizada de dos modelos existentes: un FastConformer híbrido de NVIDIA (`nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0`, vía la exportación ONNX de OpenVoiceOS) y un fine-tune de Whisper base de Tarteel AI especializado en recitación coránica (`tarteel-ai/whisper-base-ar-quran`).

El problema que resuelve es concreto: la aplicación móvil Next Ayah escucha la recitación de un versículo del Corán, lo identifica y muestra el siguiente versículo (ayah). Para ello necesita ASR en árabe con buena precisión sobre texto diacritizado y con un coste computacional que quepa en un dispositivo de gama media sin GPU. El repositorio empaqueta ambos modelos con las modificaciones necesarias (metadatos de sherpa-onnx, reescritura de pesos int8 a uint8, cuantización dinámica del decodificador Whisper) para que funcionen con sherpa-onnx 1.12.35 a través de `react-native-sherpa-onnx`.

La relevancia es de nicho pero clara: demuestra un patrón de despliegue de ASR especializado en árabe coránico totalmente on-device, con artefactos de 132 MB y 81 MB respectivamente, y publica una evaluación propia sobre 288 clips con métricas de identificación de versículo y tasa de error de caracteres.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos modelos: FastConformer híbrido (cabecera CTC) y Whisper base (encoder-decoder transformer) |
| Parametros totales | no disponible (FastConformer "large" y Whisper "base"; el autor no publica recuento) |
| Parametros activos | no aplica (no son modelos MoE) |
| Longitud de contexto | no disponible; en Whisper se exige relleno (zero-pad) de la entrada a 29 s antes del reconocimiento |
| Tipos de cuantizacion | int8 (FastConformer: pesos `ConvInteger` desplazados a uint8; Whisper: cuantización dinámica int8 con tabla compartida entre embedding y proyección de salida) |
| Idiomas soportados | árabe (`ar`) |
| Licencia | CC-BY-4.0 (FastConformer, © NVIDIA) y Apache-2.0 (Whisper base, © Tarteel AI); el conjunto se declara como `cc-by-4.0-and-apache-2.0` |
| Formato de pesos | ONNX (int8), empaquetado para sherpa-onnx; incluye `tokens.txt` y `manifest.json` con tamaños y SHA-256 |

## Arquitectura y entrenamiento

El paquete contiene dos artefactos independientes. El primero, `nvidia-fastconformer-ar/`, es un FastConformer híbrido de NVIDIA con cabecera CTC, exportado a ONNX por OpenVoiceOS. El autor añade los metadatos que el cargador NeMo CTC de sherpa-onnx requiere (`vocab_size=1024`, `subsampling_factor=8`, `normalize_type=per_feature`) y construye un `tokens.txt` a partir del vocabulario, con `<blk>` en la posición 1024. Además, desplaza los pesos y puntos cero de `ConvInteger` en +128 para convertirlos de int8 a uint8, de modo que se ejecuten en el ONNX Runtime incluido en sherpa-onnx; según el autor, los pesos dequantizados resultan bit-idénticos.

El segundo, `tarteel-base/`, es el fine-tune de Whisper base de Tarteel AI para recitación coránica. El autor exporta encoder y decoder a ONNX en el formato Whisper de sherpa-onnx (opset 17, mismos nombres de E/S y metadatos) y aplica cuantización dinámica a int8 con una única tabla compartida por el embedding de tokens y la proyección de salida, lo que reduce el tamaño de 160 MB a 81 MB manteniendo una precisión igual o superior según el autor. Es obligatorio rellenar con ceros el audio de entrada hasta 29 s, porque sherpa-onnx limita la salida de Whisper a 6 tokens por segundo de audio y este modelo genera texto con diacríticos completos. No se documentan en la información disponible los volúmenes ni la composición de los datasets de entrenamiento originales, ni si hubo RLHF/DPO.

## Capacidades

- Reconocimiento automático del habla en árabe, con salida de texto árabe diacritizado en el caso del modelo Whisper.
- Identificación de versículos coránicos recitados: la aplicación combina la transcripción con un emparejador de versículos que devuelve el ayah recitado.
- Ejecución on-device en CPU de teléfono, sin GPU ni conexión de red.
- Dos modos de inferencia según el tipo sherpa: `nemo_ctc` (FastConformer) y `whisper` (Tarteel base), con selección explícita de `modelType` en la API.
- Soporte de hilos configurable (`numThreads`, p. ej. 2) en `react-native-sherpa-onnx`.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio generativo ni modo de razonamiento; es exclusivamente ASR.

## Casos de uso

- Identificación del siguiente versículo en una app de recitación: la app captura la recitación del usuario, la transcribe con el FastConformer o el Whisper base y un emparejador devuelve el ayah; el FastConformer alcanza 89,9% top-1 en la evaluación del autor, lo que lo hace adecuado para este flujo interactivo.
- Aplicaciones móviles sin conectividad: al ejecutarse íntegramente en la CPU del teléfono con artefactos de 132 MB y 81 MB, permite funciones de ASR coránico en entornos sin red o con privacidad estricta.
- Aprendizaje de recitación para no araboparlantes: el modelo Whisper base obtiene ~71% de acierto en el subconjunto de aprendices según la evaluación del autor, útil para dar retroalimentación aproximada sobre lo recitado.
- Transcripción de audio de recitadores profesionales: el Whisper base logra 100% en versículos completos de recitadores profesionales en la evaluación publicada, adecuado para indexar o buscar recitaciones.
- Integración en apps React Native: mediante `react-native-sherpa-onnx` con `createSTT({ modelType: 'nemo_ctc' | 'whisper' })`, se puede incorporar ASR coránico a una app móvil existente sin infraestructura de servidor.
- Procesamiento por lotes de archivos de audio en un servidor modesto: al ser ONNX int8, se puede ejecutar con ONNX Runtime en CPU para transcribir colecciones de recitaciones sin GPU.
- Prototipado de pipelines de búsqueda por voz sobre texto coránico: la transcripción diacritizada del modelo Whisper facilita el emparejamiento con textos de referencia.

## Benchmarks y rendimiento

Evaluación del autor sobre 288 clips reservados (recitadores profesionales no vistos en entrenamiento y aprendices no araboparlantes), con sherpa-onnx 1.12.35 en CPU. La precisión es top-1 del emparejador de versículos.

| Modelo | Top-1 (versículo encontrado) | Tasa de error de caracteres | Profesional, versículo completo | Aprendices |
|---|---|---|---|---|
| nvidia-fastconformer-ar | 89,9% | 10,0% | 97,5% | ~88% |
| tarteel-base | 83,7% | 13,1% | 100% | ~71% |

Latencia publicada: en un Pixel 4a (5G) con CPU, `nvidia-fastconformer-ar` transcribió 3,9 s de recitación en 0,45 s. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni comparaciones con otros modelos ASR en árabe.

## Requisitos de hardware

- VRAM: no aplica; ambos modelos están diseñados para ejecutarse en CPU. El FastConformer ocupa 132 MB en disco y el Whisper base 81 MB.
- GPU recomendadas: no se requieren; el autor no documenta ejecución en GPU. Para servir en servidor podría usarse ONNX Runtime con CPU.
- ¿Cabe en GPU de consumo? No aplica por diseño on-device; el despliegue objetivo es la CPU del teléfono.
- Opciones de despliegue: sherpa-onnx 1.12.35 y `react-native-sherpa-onnx`; al ser ONNX, también es posible usar ONNX Runtime directamente.
- Latencia y throughput: 0,45 s para 3,9 s de audio en un Pixel 4a (5G) con el FastConformer (factor de tiempo real aproximado de 0,115). No se documentan cifras de throughput por lotes ni para el modelo Whisper base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Next Ayah – nvidia-fastconformer-ar | no disponible (FastConformer large) | audio; sin límite documentado | 89,9% top-1; CER 10,0% (evaluación del autor) | CC-BY-4.0 | Hugging Face, ONNX int8, sherpa-onnx |
| Next Ayah – tarteel-base | no disponible (Whisper base) | audio rellenado a 29 s | 83,7% top-1; CER 13,1% (evaluación del autor) | Apache-2.0 | Hugging Face, ONNX int8, sherpa-onnx |
| nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0 | no disponible | audio | no disponible en esta ficha | CC-BY-4.0 | Hugging Face (modelo original) |
| tarteel-ai/whisper-base-ar-quran | no disponible (Whisper base) | audio | no disponible en esta ficha | Apache-2.0 | Hugging Face (modelo original) |

No se dispone de datos de benchmarks comparativos con otros modelos ASR en árabe en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta árabe (`ar`); no está pensado para otros idiomas.
- El modelo Whisper base requiere rellenar con ceros la entrada hasta 29 s; sin este paso la transcripción puede truncarse por el límite de 6 tokens por segundo de sherpa-onnx.
- Es obligatorio pasar `modelType` explícitamente: la autodetección confunde la carpeta del FastConformer con un modelo paraformer.
- Rendimiento notablemente inferior en aprendices no araboparlantes (~88% y ~71% top-1) frente a recitadores profesionales (97,5% y 100%).
- Riesgo de alucinación y errores de transcripción inherente a los modelos ASR, especialmente con audio ruidoso o recitación no estándar; no se documentan sesgos específicos.
- Licencias mixtas: el FastConformer es CC-BY-4.0 y exige atribución a NVIDIA; el Whisper base es Apache-2.0 y exige atribución a Tarteel AI. Cualquier uso comercial debe respetar ambas licencias y conservar las atribuciones indicadas en el README.
- Los modelos son modificaciones de los originales; el autor no garantiza paridad exacta con los modelos base más allá de lo descrito (pesos dequantizados bit-idénticos en el FastConformer).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación externa de la comunidad.
- No hay soporte de GPU ni de despliegue en servidor documentado por el autor.

## Enlaces

- Hugging Face: https://huggingface.co/shahlarious/next-ayah-models
- Modelo base FastConformer: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0
- Exportación ONNX del FastConformer: https://huggingface.co/OpenVoiceOS/stt_ar_fastconformer_hybrid_large_pc_v1.0_onnx
- Modelo base Whisper de Tarteel: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- react-native-sherpa-onnx: https://github.com/XDcobra/react-native-sherpa-onnx
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
