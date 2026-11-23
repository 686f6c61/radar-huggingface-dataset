# mohelsheikh/basmio-models

## Resumen

`mohelsheikh/basmio-models` no es un modelo de IA entrenado, sino un repositorio agregador que recopila copias de veinticuatro modelos de código abierto en formato ONNX utilizados por la aplicación de edición de vídeo Basmio. El autor, mohelsheikh, mantiene estas copias para garantizar que la aplicación siga funcionando aunque los repositorios originales cambien o se eliminen. Cada carpeta del repositorio conserva el nombre del repositorio de origen, junto con su licencia y su README original, sin modificaciones.

El contenido abarca tareas muy distintas dentro de un pipeline de posproducción de vídeo: restauración facial y de imagen (GFPGAN, Real-ESRGAN, MIGAN), deblurring (NAFNet), interpolación de fotogramas (RIFE), colorización (DDColor), segmentación de fondo (MODNet), detección de objetos y rostros (YOLOS, DETR), estimación de profundidad (Depth Anything V2), reconocimiento de voz (familia Whisper en tamaños tiny, base y small) y síntesis de voz multilingüe (MMS-TTS en ocho idiomas). El tamaño total del repositorio es de 3,2 GB.

Es relevante ahora porque ilustra un patrón de empaquetado de dependencias para aplicaciones de escritorio que dependen de modelos de terceros: en lugar de descargar en tiempo de ejecución desde repositorios ajenos (con el riesgo de rotura de enlaces o cambios de licencia), se fija una copia local versionada. Para desarrolladores que construyan herramientas similares, sirve como referencia de conjunto de modelos ONNX ligeros orientados a inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agregado heterogéneo: GAN (GFPGAN, Real-ESRGAN, MIGAN, DDColor), transformers de visión (YOLOS, DETR, Depth Anything V2), U-Net de restauración (NAFNet), red de interpolación (RIFE), transformer de audio (Whisper), VITS (MMS-TTS) |
| Parametros totales | no disponible (varía por submodelo; el conjunto ocupa 3,2 GB en ONNX) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (los submodelos de audio tienen ventanas de 30 s en Whisper; el resto no son modelos de lenguaje) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | TTS en inglés, árabe, francés, español, alemán, portugués, ruso e hindi (MMS-TTS); Whisper multilingüe; el resto son modelos visuales independientes del idioma |
| Licencia | no disponible a nivel de repositorio; cada subcarpeta conserva la licencia de su repositorio original |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: es un contenedor de artefactos. Cada subcarpeta corresponde a un modelo con su propia arquitectura y su propio proceso de entrenamiento, documentado en el README y la licencia que se conservan en su interior. Los modelos están exportados a ONNX, lo que permite ejecutarlos con ONNX Runtime en CPU, GPU (CUDA, DirectML) o aceleradores integrados, sin depender de PyTorch en tiempo de ejecución.

Las arquitecturas presentes cubren varios dominios. En imagen: GFPGAN v1.4 y Real-ESRGAN para superresolución y restauración facial, MIGAN para generación facial, NAFNet para deblurring, RIFE para interpolación temporal de fotogramas, DDColor-tiny para colorización y MODNet para matting de retrato. En visión general: YOLOS-tiny para detección de objetos, DETR para detección de rostros y Depth Anything V2 Small para profundidad monocular. En audio: Whisper tiny, base y small (con y sin timestamps) para ASR y MMS-TTS para síntesis de voz. No se documentan en la información disponible los volúmenes de datos de entrenamiento, el uso de RLHF/DPO ni innovaciones técnicas propias del autor del repositorio.

## Capacidades

- Restauración y superresolución de imagen y rostro (GFPGAN, Real-ESRGAN, MIGAN).
- Reducción de desenfoque en imágenes (NAFNet).
- Interpolación de fotogramas para aumentar la tasa de fotogramas de vídeo (RIFE).
- Colorización automática de imágenes en blanco y negro (DDColor-tiny).
- Segmentación y extracción de fondo en retratos (MODNet).
- Detección de objetos genéricos (YOLOS-tiny) y de rostros (DETR face detection).
- Estimación de profundidad monocular (Depth Anything V2 Small).
- Reconocimiento automático de voz multilingüe con y sin marcas de tiempo (Whisper tiny/base/small).
- Síntesis de voz en ocho idiomas (MMS-TTS: eng, ara, fra, spa, deu, por, rus, hin).
- Ejecución local mediante ONNX Runtime; no requiere tool calling, agentes ni razonamiento multi-paso, ya que no es un modelo de lenguaje.

## Casos de uso

- Restauración de metraje antiguo o de baja calidad: aplicar Real-ESRGAN y GFPGAN en cadena para escalar y recuperar rostros en material de archivo antes del montaje final.
- Estabilización perceptual de vídeo a bajo framerate: usar RIFE para interpolar fotogramas y convertir secuencias de 24 a 60 fps sin artefactos de duplicación.
- Eliminación de fondo para chroma key sin croma: MODNet permite recortar al sujeto en tiempo real sobre ONNX Runtime, útil en herramientas de edición con previsualización instantánea.
- Subtitulado automático: Whisper base o small con variante `_timestamped` genera transcripciones con marcas temporales que se pueden importar directamente como subtítulos en la línea de tiempo.
- Doblaje y locución automatizada: MMS-TTS en español, inglés, francés o alemán permite generar pistas de voz para narraciones o prototipos de doblaje sin servicios en la nube.
- Colorización de material monocromo: DDColor-tiny añade color a fotografías o fotogramas en blanco y negro como paso previo a la corrección de color.
- Limpieza de tomas desenfocadas: NAFNet reduce el desenfoque de movimiento en fotogramas concretos antes de aplicar superresolución.
- Análisis y etiquetado de contenido: YOLOS-tiny y DETR permiten indexar escenas por objetos o rostros detectados, facilitando la búsqueda dentro de un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; al tratarse de modelos pequeños en ONNX, la mayoría cabe en 1-4 GB de VRAM según el submodelo y la resolución de entrada. Whisper tiny/base/small y MMS-TTS son especialmente ligeros (cientos de MB).
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA o DirectML). Para edición de vídeo en tiempo real se recomienda al menos una RTX 3060; para procesado por lotes de alta resolución, RTX 4090 o A100/H100.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas, e incluso en CPU para los submodelos tiny y para TTS.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, CoreML), integración en aplicaciones de escritorio; no está pensado para vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del submodelo, la resolución y el hardware.

## Comparativa con modelos similares

| Aspecto | basmio-models (este repo) | Repositorios originales individuales | Suites ONNX comunitarias (p. ej. onnx-community) |
|---|---|---|---|
| Naturaleza | Agregado de copias de terceros | Modelos individuales por tarea | Modelos individuales exportados a ONNX |
| Formato | ONNX | Variable (PyTorch, ONNX) | ONNX |
| Mantenimiento | Copia fija por el autor de Basmio | A cargo de cada autor original | A cargo de la comunidad ONNX |
| Licencia | Heredada por subcarpeta | Según cada modelo | Según cada modelo |
| Uso previsto | Dependencia de una app de edición de vídeo | Uso general | Uso general |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado ni afinado: no debe evaluarse como un LLM ni usarse para generación de texto, razonamiento o código.
- La licencia a nivel de repositorio no está declarada; el uso comercial depende de la licencia de cada submodelo (por ejemplo, GFPGAN y Real-ESRGAN tienen condiciones propias que conviene revisar antes de redistribuir).
- Al ser copias, pueden quedar desactualizadas respecto a los repositorios originales; no hay garantía de sincronización ni de soporte.
- Los modelos de restauración facial y superresolución pueden introducir artefactos, alucinaciones de detalle y sesgos en rostros; no son adecuados como prueba forense.
- Whisper puede alucinar texto en segmentos con silencio o ruido; conviene validar las transcripciones.
- MMS-TTS y Whisper tienen coberturas lingüísticas limitadas a los idiomas listados; el español está cubierto en TTS, pero la calidad varía por idioma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mohelsheikh/basmio-models
- MIGAN: https://huggingface.co/andraniksargsyan/migan
- Real-ESRGAN ONNX: https://huggingface.co/thisismert/real-esrgan-onnx
- GFPGAN v1.4 ONNX: https://huggingface.co/sidkonduru/gfpgan-v1.4-onnx
- NAFNet deblurring: https://huggingface.co/opencv/deblurring_nafnet
- RIFE: https://huggingface.co/edgetools/rife
- DDColor-tiny: https://huggingface.co/toolsmonk/ddcolor-tiny
- Whisper tiny (ONNX): https://huggingface.co/onnx-community/whisper-tiny
- Whisper base (ONNX): https://huggingface.co/onnx-community/whisper-base
- Whisper small (ONNX): https://huggingface.co/onnx-community/whisper-small
- MODNet: https://huggingface.co/Xenova/modnet
- YOLOS-tiny: https://huggingface.co/Xenova/yolos-tiny
- DETR face detection ONNX: https://huggingface.co/iuliancmarcu/detr-face-detection-onnx
- Depth Anything V2 Small (ONNX): https://huggingface.co/onnx-community/depth-anything-v2-small
- MMS-TTS inglés: https://huggingface.co/Xenova/mms-tts-eng
- MMS-TTS español: https://huggingface.co/Xenova/mms-tts-spa
