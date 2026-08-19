# pantinor/whisper-arabic-dialectal-sherpa

## Resumen

El modelo `pantinor/whisper-arabic-dialectal-sherpa` es una exportación en formato ONNX del modelo Whisper Large v3 Turbo fine-tuneado para árabe dialectal, originalmente publicado como `oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2`. Esta versión ha sido adaptada específicamente para el motor de inferencia sherpa-onnx, lo que permite su ejecución en dispositivos locales (CPU) con cuantización int8. El modelo está pensado para su integración en aplicaciones de transcripción on-device, como el proyecto Anti-Vocale, y ofrece un equilibrio entre precisión en árabe dialectal y eficiencia computacional.

La relevancia de este modelo radica en que el árabe dialectal presenta grandes variaciones regionales y los modelos Whisper estándar suelen tener un rendimiento subóptimo en estos registros. Al estar fine-tuneado sobre datos dialectales y cuantizado a int8, permite desplegar un sistema de reconocimiento de voz funcional en hardware modesto, sin depender de servicios en la nube. La arquitectura subyacente es un transformer encoder-decoder con atención, con una ventana de audio de 30 segundos y soporte multilingüe, aunque el foco principal es el árabe.

El repositorio incluye los archivos `encoder.int8.onnx` y `decoder.int8.onnx`, junto con el fichero de tokens `tokens.txt` que coincide byte a byte con el vocabulario oficial de Whisper turbo. La licencia es Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large v3 Turbo) |
| Parametros totales | No especificado en la documentación del repo (base: Whisper Large v3 Turbo, ~809M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | int8 (archivos `encoder.int8.onnx` y `decoder.int8.onnx`) |
| Idiomas soportados | Árabe dialectal (principal), multilingüe (según metadatos `is_multilingual=1`, incluye `ar`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (sherpa-onnx compatible) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Whisper de OpenAI, un transformer encoder-decoder con atención de escala completa, entrenado sobre 680.000 horas de audio etiquetado de forma débil. La variante Large v3 Turbo reduce el número de capas del decoder respecto a Large v3, manteniendo una calidad similar con menor latencia. El fine-tune realizado por `oddadmix` ajusta los pesos sobre datos de árabe dialectal, mejorando la transcripción de variantes coloquiales como el árabe magrebí o levantino.

El proceso de exportación a ONNX se realizó con las herramientas oficiales de k2-fsa (`scripts/whisper/export-onnx.py`), generando un encoder y un decoder con caché de KV para inferencia eficiente. Los pesos se cuantizaron a int8, reduciendo el tamaño a aproximadamente 1,1 GB en total. No se especifican detalles sobre el dataset de fine-tune ni el número de pasos de entrenamiento, pero la verificación incluida muestra transcripciones correctas en árabe dialectal.

## Capacidades

- Transcripción de voz en árabe dialectal con precisión mejorada respecto al Whisper base.
- Reconocimiento multilingüe (el modelo conserva la capacidad de transcribir otros idiomas, aunque el fine-tune se centra en árabe).
- Soporte de tareas de transcripción (`task="transcribe"`) y traducción (`task="translate"`) mediante la API de sherpa-onnx.
- Inferencia en CPU gracias a la cuantización int8 y la optimización del motor sherpa-onnx.
- Compatibilidad con el formato de tokens estándar de Whisper turbo (vocabulario GPT-2 en base64), sin necesidad de tokens personalizados.
- Integración sencilla en aplicaciones Python mediante `OfflineRecognizer.from_whisper`.

## Casos de uso

- Transcripción de reuniones y entrevistas en árabe dialectal: el modelo puede procesar grabaciones de audio de hasta 30 segundos por segmento, generando texto en tiempo real o diferido. Su tamaño reducido permite ejecutarlo en portátiles o dispositivos edge sin conexión a internet.
- Subtitulado automático de vídeos en dialectos árabes: al estar fine-tuneado, produce transcripciones más fieles que Whisper estándar para contenidos como vídeos de YouTube, podcasts o series regionales.
- Asistentes de voz on-device: gracias a la compatibilidad con sherpa-onnx, puede integrarse en aplicaciones móviles o de escritorio para comandos de voz en árabe, respetando la privacidad al no enviar audio a servidores externos.
- Archivado y búsqueda de contenido audiovisual: las transcripciones generadas pueden indexarse para permitir búsquedas por texto dentro de archivos de audio o vídeo en árabe dialectal.
- Herramientas de accesibilidad: generación de subtítulos para personas con discapacidad auditiva en contextos donde el árabe dialectal es predominante, con baja latencia y sin costes de API.
- Investigación lingüística: análisis de variantes dialectales a partir de corpus de audio, aprovechando la capacidad del modelo para transcribir expresiones coloquiales que otros sistemas fallan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye una verificación manual con dos muestras de audio (archivos `samples/4.wav` y `samples/2.wav`) que producen transcripciones coherentes en árabe dialectal, pero no se aportan métricas cuantitativas como WER o CER. Para comparar con otros modelos, se puede consultar el trabajo de `clu-ling/whisper-large-v2-arabic-5k-steps`, que reporta un WER de 0.4239 en el conjunto de evaluación de CommonVoice v11, aunque ese modelo usa una arquitectura distinta (Large v2) y no está cuantizado.

## Requisitos de hardware

- VRAM estimada: al ser un modelo int8, la inferencia en CPU es viable. El tamaño total de los archivos es de aproximadamente 1,1 GB, por lo que se requiere al menos 1,5 GB de RAM libre para cargar ambos ONNX. En GPU, con cuantización int8, cabría en una tarjeta con 2 GB de VRAM, aunque no se especifican pruebas.
- GPU recomendadas: cualquier GPU con soporte para ONNX Runtime (por ejemplo, NVIDIA GTX 10xx o superior, o integradas con soporte de aceleración). Para CPU, se recomienda un procesador moderno con instrucciones AVX2.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en una RTX 3060 o similar, aunque la ventaja principal es su funcionamiento en CPU.
- Opciones de despliegue: sherpa-onnx (Python, C++, Android, iOS), ONNX Runtime, o mediante el wrapper de `OfflineRecognizer`. También puede integrarse en proyectos como OpenVoiceOS.
- Latencia y throughput: no se proporcionan datos, pero al ser int8 y con caché de KV, la latencia por segmento de 30 segundos debería ser inferior a la de Whisper Large v3 en FP32, aunque depende del hardware.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `pantinor/whisper-arabic-dialectal-sherpa` | Whisper Large v3 Turbo | ~809M (base) | 30 s audio | Apache-2.0 | ONNX int8 |
| `oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2` | Whisper Large v3 Turbo | ~809M | 30 s audio | Apache-2.0 | PyTorch (original) |
| `clu-ling/whisper-large-v2-arabic-5k-steps` | Whisper Large v2 | ~1550M | 30 s audio | Apache-2.0 | PyTorch |
| `openai/whisper-large-v3-turbo` | Whisper Large v3 Turbo | ~809M | 30 s audio | MIT | PyTorch |

La principal diferencia del modelo evaluado es su formato ONNX int8, que lo hace directamente desplegable en sherpa-onnx sin conversiones adicionales. Frente al original de `oddadmix`, ofrece una versión optimizada para producción. Comparado con el modelo de `clu-ling`, este último tiene más parámetros pero un WER reportado alto (0.42) y no está orientado a dialectos.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune sobre datos específicos, puede tener un rendimiento desigual entre distintos dialectos árabes (por ejemplo, mejor en magrebí que en golfo, dependiendo del dataset de entrenamiento, que no se detalla).
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto inventado en segmentos de silencio o audio con ruido, especialmente si la calidad es baja.
- Limitaciones de contexto: la ventana fija de 30 segundos obliga a segmentar audios largos, lo que puede cortar frases y afectar la coherencia en transcripciones largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de copyright y las condiciones de la licencia.
- Caveat de producción: la cuantización int8 puede degradar ligeramente la precisión respecto a FP16/FP32, aunque no se aportan métricas comparativas. Se recomienda validar con el corpus propio antes de desplegar.

## Enlaces

- Repositorio HuggingFace: [pantinor/whisper-arabic-dialectal-sherpa](https://huggingface.co/pantinor/whisper-arabic-dialectal-sherpa)
- Modelo original fine-tuneado: [oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2](https://huggingface.co/oddadmix/whisper-large-v3-turbo-arabic-dialectal-v2)
- Exportación previa: [dmouayad/sherpa-onnx-whisper-large-v3-turbo-arabic-dialectal-v2](https://huggingface.co/dmouayad/sherpa-onnx-whisper-large-v3-turbo-arabic-dialectal-v2)
- Repositorio de tokens alternativo: [pantinor/whisper-arabic-dialectal-tokens](https://huggingface.co/pantinor/whisper-arabic-dialectal-tokens)
- Proyecto Anti-Vocale: [GitHub](https://github.com/RisorseArtificiali/anti-vocale)
- Documentación de sherpa-onnx: [k2-fsa/sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx)
- Whisper original de OpenAI: [openai/whisper](https://github.com/openai/whisper)
- Análisis de Whisper para árabe: [Arabic Agentic AI - Whisper for Arabic](https://arabicagenticai.com/speech/whisper-arabic/)
