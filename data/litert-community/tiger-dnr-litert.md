# litert-community/TIGER-DnR-LiteRT

## Resumen

TIGER-DnR-LiteRT es una reescritura del modelo TIGER (ICASSP 2025) de separación de fuentes de audio cinematográfico, adaptada para ejecutarse íntegramente en GPU mediante LiteRT (el sucesor de TensorFlow Lite). Desarrollado por la comunidad LiteRT de Google, el modelo divide una mezcla de audio en tres pistas: diálogo, efectos de sonido y música, todo ello en el dispositivo, sin necesidad de servidores. Está compuesto por tres grafos independientes de tipo band-split, cada uno con aproximadamente 1,41 millones de parámetros, que procesan fragmentos de 12,06 segundos de audio mono a 44,1 kHz. La relevancia actual radica en que permite separación de audio de alta calidad en teléfonos móviles y dispositivos edge, con una correlación de forma de onda de 0,99987 frente al modelo PyTorch original, verificada en un Pixel 8a.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Band-split transformer (TIGER), tres grafos independientes (dialogo, efectos, musica) |
| Parametros totales | Aproximadamente 4,23 M (1,41 M por grafo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 12,06 segundos de audio (531 968 muestras a 44,1 kHz, con padding reflectivo de 1024 muestras por lado) |
| Tipos de cuantizacion | FP16 (16,1 MB por grafo) |
| Idiomas soportados | No disponible (modelo de audio, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | .tflite (LiteRT / TFLite) |

## Arquitectura y entrenamiento

El modelo original TIGER, presentado en ICASSP 2025 (arXiv:2410.01469), emplea una arquitectura de separación por bandas de frecuencia (band-split) con transformador. En esta versión LiteRT, la transformada de Fourier de tiempo corto (STFT) se integra dentro del grafo como una capa Conv1d con ventana DFT, eliminando la necesidad de calcularla en el host. La reescritura incluye varias optimizaciones para GPU: las convoluciones plegadas por lotes se convierten en Conv2d 4D, la normalización global por lote (GlobLN) se sustituye por una variante segura en fp16, y la atención multi-cabeza se implementa como multiplicaciones de matrices 3D por cabeza. Se corrigieron dos problemas específicos de fp16: el epsilon de normalización se elevó a 1e-4 para evitar desbordamientos a cero, y la cabeza de máscara se reescribió sin operaciones de broadcast que causaban NaN. El entrenamiento se realizó con el dataset DnR (construido abiertamente) por los autores originales, y los pesos se tomaron del modelo base JusperLee/TIGER-DnR.

## Capacidades

- Separación de fuentes de audio cinematográfico en tres pistas: diálogo, efectos de sonido y música.
- Procesamiento completamente en GPU en dispositivos móviles, sin necesidad de conexión a servidores.
- Ejecución en tiempo real o casi tiempo real: aproximadamente 5 segundos por fragmento de 12,06 segundos en un Pixel 8a.
- Soporte para inferencia en Python (escritorio) y Kotlin/Android mediante LiteRT CompiledModel.
- Integración de STFT dentro del grafo, simplificando el pipeline del host.
- Compatibilidad con cuantización FP16, reduciendo el tamaño del modelo a 16,1 MB por grafo.
- Capacidad de solapamiento y promediado de fragmentos para procesar audio de mayor duración.

## Casos de uso

- Postproduccion de video: separar dialogos, efectos y musica de una escena para editar o mezclar pistas individualmente. El modelo procesa fragmentos de 12,06 segundos, por lo que se puede aplicar a clips completos con solapamiento y promediado.
- Restauracion de audio historico: aislar la voz de grabaciones antiguas con ruido de fondo o musica, mejorando la inteligibilidad. Su ejecucion local permite procesar archivos sin subirlos a la nube.
- Creacion de subtitulos automaticos: extraer la pista de dialogo limpia para alimentar un sistema de reconocimiento de voz, reduciendo errores por interferencias.
- Analisis de contenido audiovisual: separar las tres fuentes para indexar o buscar por tipo de sonido en bibliotecas de video. El modelo puede ejecutarse en lote en un servidor con GPU o en un dispositivo movil.
- Aplicaciones de accesibilidad: aislar la voz en entornos ruidosos para audifonos o sistemas de amplificacion, mejorando la experiencia de personas con discapacidad auditiva.
- Edicion de podcasts y grabaciones: separar musica de fondo de la voz para ajustar niveles o eliminar pistas no deseadas. Al ser un modelo ligero, puede integrarse en aplicaciones de edicion movil.
- Juegos y realidad virtual: generar pistas de audio separadas para personalizar la mezcla en tiempo real segun las preferencias del usuario o el contexto de la escena.

## Benchmarks y rendimiento

La model card proporciona datos de latencia medidos en un Pixel 8a (Tensor G3, Android 16) con la herramienta estándar `benchmark_model` de TFLite, tras 10 ejecuciones de calentamiento y 50 ejecuciones cronometradas. También se reporta la correlación de forma de onda entre la salida del modelo LiteRT FP16 y el modelo PyTorch original.

| Grafo | Backend | Nodos en GPU | Latencia media (ms) |
|---|---|---|---|
| tiger_effect_fp16.tflite | GPU (OpenCL) | 23 974 / 23 974 | 4974,9 |
| tiger_music_fp16.tflite | GPU (OpenCL) | 23 974 / 23 974 | 5074,1 |
| tiger_dialog_fp16.tflite | GPU (OpenCL) | 23 974 / 23 974 | 5140,1 |

Adicionalmente, la correlación de forma de onda entre la salida del modelo LiteRT FP16 y el modelo PyTorch es de 0,99987 (verificada en el dispositivo) y de 0,99991 en escritorio. No se han publicado resultados de benchmarks tipo MMLU o similares, al tratarse de un modelo de audio.

## Requisitos de hardware

- Inferencia en GPU movil: requiere un dispositivo compatible con LiteRT GPU (OpenCL). Verificado en Pixel 8a con Tensor G3.
- VRAM: no aplica en el sentido tradicional; el modelo ocupa 16,1 MB por grafo en memoria, por lo que cabe en cualquier GPU movil moderna.
- GPU recomendadas: cualquier GPU con soporte OpenCL en Android; en escritorio, GPU con soporte Vulkan o OpenCL para LiteRT.
- Opciones de despliegue: LiteRT (Python con `ai_edge_litert.interpreter`), LiteRT CompiledModel en Android (Kotlin), y herramientas de benchmark de TFLite.
- Latencia: aproximadamente 5 segundos por fragmento de 12,06 segundos por grafo en un Pixel 8a. Para procesar un clip completo, se necesita solapamiento y promediado, lo que multiplica el tiempo por el número de fragmentos.
- No se requieren GPUs de servidor; el modelo está diseñado para edge.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TIGER-DnR-LiteRT (este) | ~4,23 M (3 grafos) | 12,06 s de audio | .tflite FP16 | Apache-2.0 | Optimizado para GPU movil, STFT integrada |
| TIGER-DnR (original, PyTorch) | ~4,23 M (3 grafos) | 12 s de audio | PyTorch | Apache-2.0 | Modelo base, requiere GPU de servidor o CPU |
| Demucs (Hybrid Transformer) | ~300 M | 10 s de audio | PyTorch | MIT | Modelo de referencia en separacion de musica, mas pesado y no optimizado para edge |

No se dispone de comparativas de rendimiento directas entre estos modelos en la informacion proporcionada. La comparativa se basa en caracteristicas tecnicas generales.

## Limitaciones y advertencias

- El modelo procesa exclusivamente audio mono a 44,1 kHz; no soporta estéreo directamente, aunque se puede procesar cada canal por separado.
- La longitud de fragmento está fijada en 12,06 segundos; para audio más largo se requiere solapamiento y promediado, lo que aumenta la latencia total.
- La cuantización FP16 puede introducir errores numéricos en bandas silenciosas; los autores corrigieron el epsilon de normalización, pero no se garantiza un comportamiento idéntico al modelo de precisión completa en todos los casos.
- El modelo está entrenado específicamente para audio cinematográfico (diálogo, efectos, música); su rendimiento en otros tipos de audio (por ejemplo, música con voces solapadas) puede ser inferior.
- No se proporcionan datos sobre sesgos o alucinaciones, al ser un modelo de audio y no de texto.
- La licencia Apache-2.0 permite uso comercial, pero el código upstream de TIGER es MIT; se debe verificar el cumplimiento de ambas licencias.
- El modelo requiere que el host realice el padding reflectivo y la iSTFT; no es un modelo de extremo a extremo en el sentido de que la transformada inversa no está incluida en el grafo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/TIGER-DnR-LiteRT
- Repositorio de archivos: https://huggingface.co/litert-community/TIGER-DnR-LiteRT/tree/main
- Codigo original de TIGER: https://github.com/JusperLee/TIGER
- Pesos originales: https://huggingface.co/JusperLee/TIGER-DnR
- Documentacion de LiteRT: https://ai.google.dev/edge/litert
- Repositorio de LiteRT: https://github.com/google-ai-edge/litert
- Guia de medicion de rendimiento: https://ai.google.dev/edge/litert/models/measurement
- Paper de TIGER (arXiv): https://arxiv.org/abs/2410.01469
