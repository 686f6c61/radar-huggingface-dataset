# FluidInference/parakeet-tdt-0.6b-v3-coreml

## Resumen

El modelo `FluidInference/parakeet-tdt-0.6b-v3-coreml` es una conversión a Core ML del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, desarrollado originalmente por NVIDIA. FluidInference lo ha adaptado para ejecutarse de forma totalmente local en dispositivos Apple (macOS e iOS), aprovechando la Neural Engine (ANE) y la CPU de los chips Apple Silicon. Con 600 millones de parámetros y una arquitectura FastConformer-TDT (Token Duration Transducer), el modelo es capaz de transcribir audio en 25 idiomas europeos con baja latencia y sin necesidad de conexión a red, lo que lo hace idóneo para aplicaciones de transcripción privadas y en tiempo real.

La relevancia de esta versión radica en su optimización para el ecosistema Apple: el modelo se distribuye en formato Core ML, lo que permite integrarlo fácilmente en aplicaciones Swift mediante el framework FluidAudio. Según las pruebas de FluidInference, alcanza un factor de tiempo real (RTF) de aproximadamente 110× en un MacBook Pro con chip M4 Pro en modo de procesamiento por lotes, es decir, un minuto de audio se transcribe en unos 0,5 segundos. El repositorio cuenta con más de 300.000 descargas y 50 likes en Hugging Face, lo que refleja un interés notable por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-TDT (Token Duration Transducer) |
| Parametros totales | 0,6 mil millones (600 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo ASR, no procesa texto de entrada) |
| Tipos de cuantizacion | Mixed precision optimizada para Core ML (ANE/CPU); no se especifican cuantizaciones adicionales |
| Idiomas soportados | 25 idiomas europeos: en, es, fr, de, bg, hr, cs, da, nl, et, fi, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, sv, ru, uk |
| Licencia | cc-by-4.0 (según Hugging Face); el README del repositorio FluidAudio menciona Apache 2.0 |
| Formato de pesos | Core ML (mlmodelc/mlpackage) |

## Arquitectura y entrenamiento

El modelo base `nvidia/parakeet-tdt-0.6b-v3` emplea una arquitectura FastConformer-TDT, una variante del bloque Conformer que combina atención por ventanas y convoluciones para procesar secuencias de audio de forma eficiente. El decodificador TDT (Token Duration Transducer) predice la duración de cada token, lo que reduce el número de pasos de decodificación y mejora la velocidad de inferencia sin sacrificar precisión. El entrenamiento original de NVIDIA utilizó los conjuntos de datos `nvidia/Granary` y `nemo/asr-set-3.0`, que incluyen una amplia variedad de habla multilingüe. FluidInference ha realizado la conversión a Core ML mediante un script disponible en su repositorio `mobius`, manteniendo la arquitectura y los pesos originales, y optimizando la ejecución para la Neural Engine y la CPU de Apple Silicon. No se han publicado detalles adicionales sobre el proceso de entrenamiento o ajuste fino en la información disponible.

## Capacidades

- Transcripción de voz a texto en 25 idiomas europeos (incluidos español, inglés, francés, alemán, italiano, portugués, ruso, ucraniano, entre otros).
- Ejecución completamente offline y privada: no requiere llamadas de red una vez descargados los modelos.
- Procesamiento por lotes de archivos de audio completos, con un RTF de ~110× en hardware Apple Silicon de gama alta (M4 Pro).
- Optimizado para Core ML, con soporte para la Neural Engine (ANE) y CPU en macOS 14+ e iOS 17+.
- Entrada de audio estándar: 16 kHz, mono, PCM Float32 en el rango [-1, 1].
- Integración sencilla en aplicaciones Swift mediante el framework FluidAudio, que gestiona la carga del modelo, el preprocesado de audio y la decodificación.
- No incluye capacidades de generación de texto, tool calling, agentes ni visión; es exclusivamente un modelo de reconocimiento de habla.

## Casos de uso

- Transcripción por lotes en macOS: procesar archivos de audio largos (grabaciones de reuniones, entrevistas, podcasts) de forma local y rápida, sin depender de servicios en la nube. El alto RTF permite transcribir una hora de audio en menos de un minuto en un M4 Pro.
- Dictado local en aplicaciones de notas o editores de texto: integrar el modelo en apps de iOS o macOS para convertir voz en texto en tiempo real, garantizando la privacidad de los datos al no enviarlos a servidores externos.
- Subtitulado automático de vídeos: generar subtítulos para contenido multilingüe europeo de manera offline, útil para editores de vídeo o plataformas de streaming que requieran procesamiento local.
- Asistencia a personas con discapacidad auditiva: transcribir conversaciones o eventos en tiempo real (con un modelo de streaming complementario) para mostrar texto en pantalla, respetando la privacidad del usuario.
- Transcripción de llamadas o notas de voz en apps de mensajería: convertir mensajes de voz a texto dentro de la propia aplicación, sin necesidad de conexión a internet, mejorando la accesibilidad y la búsqueda de contenido.
- Investigación y desarrollo de ASR en entornos Apple: servir como modelo de referencia para comparar arquitecturas TDT con otras alternativas en dispositivos locales, gracias a su formato Core ML y su documentación de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos (WER, CER, etc.) en la información proporcionada en la model card de Hugging Face. El repositorio de FluidAudio incluye una sección de benchmarks con métricas de transcripción, accesible en [https://github.com/FluidInference/FluidAudio/blob/main/Documentation/Benchmarks.md#transcription](https://github.com/FluidInference/FluidAudio/blob/main/Documentation/Benchmarks.md#transcription), pero los datos concretos no están disponibles en el material analizado. El único dato de rendimiento mencionado es el RTF de ~110× en un M4 Pro para el modo de procesamiento por lotes.

## Requisitos de hardware

- Dispositivos Apple con chip Apple Silicon (M1 o superior) recomendados; también funciona en CPUs Intel con macOS 14+, aunque el rendimiento será menor.
- Sistemas operativos: macOS 14+ e iOS 17+.
- No requiere VRAM dedicada; la inferencia se ejecuta en la Neural Engine (ANE) y la CPU del dispositivo.
- Espacio en disco: el repositorio ocupa aproximadamente 7,0 GB (incluye el modelo en formato Core ML y assets auxiliares).
- Para integración en producción, se recomienda el framework FluidAudio (Swift), que gestiona la carga y ejecución del modelo.
- No se dispone de datos de latencia o throughput específicos para otros dispositivos distintos del M4 Pro; el RTF variará según el hardware y la duración del audio.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `nvidia/parakeet-tdt-0.6b-v3` (base) | 0,6 B | 25 europeos | CC-BY-4.0 | NeMo (safetensors) | Modelo original de NVIDIA, sin conversión a Core ML |
| `FluidInference/parakeet-tdt-0.6b-v3-coreml` | 0,6 B | 25 europeos | CC-BY-4.0 | Core ML | Conversión del anterior, optimizado para Apple Silicon |
| `openai/whisper-large-v3` (referencia) | 1,5 B | 99 idiomas | MIT | PyTorch, safetensors, GGUF | Modelo ASR generalista, mayor cobertura de idiomas pero más pesado y sin optimización específica para Apple |

La comparativa se limita a características conocidas; no se dispone de datos de WER u otros benchmarks comparativos en la información proporcionada. El modelo de FluidInference es funcionalmente idéntico al de NVIDIA, diferenciándose únicamente en el formato de distribución y la optimización para Core ML.

## Limitaciones y advertencias

- La cobertura principal son idiomas europeos; el rendimiento puede degradarse significativamente con habla de otras regiones o acentos no europeos.
- No se ha proporcionado información sobre sesgos, comportamiento en condiciones de ruido extremo o riesgo de alucinaciones en la transcripción. Como todo sistema ASR, puede cometer errores en audio de baja calidad o con habla superpuesta.
- La licencia indicada en Hugging Face es CC-BY-4.0, aunque el README del repositorio FluidAudio menciona Apache 2.0. Se recomienda verificar los términos exactos antes de un uso comercial.
- El modelo está diseñado exclusivamente para la plataforma Apple; no es utilizable directamente en entornos Linux o Windows sin una conversión adicional.
- El tamaño del repositorio (7,0 GB) puede ser elevado para aplicaciones móviles; se recomienda evaluar la distribución de los assets.
- No se incluyen capacidades de streaming (solo procesamiento por lotes); para transcripción en tiempo real es necesario combinar con otros modelos como Parakeet EOU (disponible en FluidAudio).

## Enlaces

- Modelo en Hugging Face: [https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml](https://huggingface.co/FluidInference/parakeet-tdt-0.6b-v3-coreml)
- Repositorio FluidAudio (framework Swift y benchmarks): [https://github.com/FluidInference/FluidAudio](https://github.com/FluidInference/FluidAudio)
- Script de conversión a Core ML: [https://github.com/FluidInference/mobius/tree/main/models/stt/parakeet-tdt-v3-0.6b/coreml](https://github.com/FluidInference/mobius/tree/main/models/stt/parakeet-tdt-v3-0.6b/coreml)
- Benchmarks de transcripción: [https://github.com/FluidInference/FluidAudio/blob/main/Documentation/Benchmarks.md#transcription](https://github.com/FluidInference/FluidAudio/blob/main/Documentation/Benchmarks.md#transcription)
- Modelo base de NVIDIA: [https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3](https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3)
- Ficha en aimodels.fyi: [https://www.aimodels.fyi/models/huggingFace/parakeet-tdt-0.6b-v3-coreml-fluidinference](https://www.aimodels.fyi/models/huggingFace/parakeet-tdt-0.6b-v3-coreml-fluidinference)
- Ficha en openmodelmap.com: [https://openmodelmap.com/model/FluidInference/parakeet-tdt-0.6b-v3-coreml](https://openmodelmap.com/model/FluidInference/parakeet-tdt-0.6b-v3-coreml)
