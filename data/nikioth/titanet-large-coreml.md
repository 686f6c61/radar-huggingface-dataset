# nikioth/titanet-large-coreml

## Resumen

TitaNet-L para Core ML es una conversión del modelo de verificación de hablante `nvidia/speakerverification_en_titanet_large` de NVIDIA a formato Core ML (ML Program), realizada por el usuario nikioth. El modelo transforma un espectrograma log-mel de una locución en un embedding de hablante de 192 dimensiones; embeddings de la misma voz presentan alta similitud coseno, lo que permite tareas de enrolamiento, verificación y clustering de hablantes. No es un modelo generativo: es un extractor de características biométricas de voz.

La relevancia práctica del artefacto es la eliminación de dependencias pesadas en el momento de la inferencia. El paquete Core ML no requiere NeMo, PyTorch ni ONNX Runtime, por lo que puede ejecutarse de forma nativa en macOS 14 / iOS 17 o superior, incluyendo Apple Silicon. Los pesos son los originales de NVIDIA, sin modificar y en float32, reconstruidos en PyTorch a partir del export ONNX que distribuye sherpa-onnx y verificados contra onnxruntime antes de la conversión con coremltools.

El modelo tiene un tamaño de repositorio de 0.1 GB, con un paquete `TitaNet.mlpackage` de 88.5 MB. Está orientado exclusivamente al idioma inglés según la metadata, aunque al tratarse de un extractor de embeddings acústicos su comportamiento depende más de la señal que del contenido lingüístico. La licencia es CC BY 4.0 y el modelo base es de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TitaNet (red neuronal para speaker verification de NVIDIA), reconstruida en PyTorch y convertida a Core ML ML Program |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de 50 a 12288 frames (0.5 s a ~2 min de audio) |
| Tipos de cuantizacion | float32 únicamente (float16 probado y descartado por pérdida de precisión) |
| Idiomas soportados | en (metadata); el modelo opera sobre características acústicas, no texto |
| Licencia | CC BY 4.0 |
| Formato de pesos | Core ML `.mlpackage` (compilable a `.mlmodelc`); pesos float32 |
| Entrada | `features`, Float32, shape `(1, 80, T)` |
| Salida | `embedding`, Float32, shape `(1, 192)` |
| Comparación | similitud coseno |
| Destino de despliegue | macOS 14 / iOS 17 o superior |
| Tamaño del paquete | 88.5 MB |
| Tamaño del repo | 0.1 GB |

## Arquitectura y entrenamiento

El modelo subyacente es TitaNet-L de NVIDIA, una red de verificación de hablante que produce embeddings de 192 dimensiones a partir de espectrogramas log-mel. La conversión no modifica los valores de los pesos: el autor reconstruyó la red en PyTorch a partir del export ONNX distribuido por sherpa-onnx (`nemo_en_titanet_large.onnx`, SHA-256 `d51abcf3...daca8e77`), la validó contra onnxruntime y la convirtió con coremltools. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens o el proceso de optimización (RLHF/DPO no aplica a este tipo de modelo).

La innovación técnica del artefacto es la paridad numérica y la portabilidad. El script de conversión compara Core ML con onnxruntime sobre features aleatorias de 50 a 3000 frames, obteniendo una similitud coseno de 1.000000 en CPU, CPU+GPU y en todos los compute units (CPU, GPU, Neural Engine). La reconstrucción en PyTorch también alcanza 1.0000000 frente a onnxruntime a 150, 333, 600 y 1200 frames. Se probó una conversión a float16 y se rechazó: su peor coseno frente a onnxruntime fue 0.9988, una pérdida visible para un modelo cuyas decisiones se basan en umbrales de coseno, por lo que el paquete mantiene float32. En Apple Silicon, float32 se ejecuta en CPU y GPU; el Neural Engine no se utiliza.

El frontend no está incluido en el modelo: el usuario debe calcular las features con kaldi-native-fbank usando los parámetros especificados (audio mono a 16 kHz, ventana Hann de 25 ms cada 10 ms, pre-énfasis 0.97, FFT de 512 puntos, 80 bins mel de 0 a 7600 Hz con escala Slaney, compresión logarítmica y normalización por bin mel sobre toda la locución).

## Capacidades

- Extracción de embeddings de hablante de 192 dimensiones a partir de audio mono a 16 kHz.
- Verificación de hablante: comparar dos clips mediante similitud coseno para determinar si comparten voz.
- Enrolamiento y reconocimiento de hablantes conocidos.
- Clustering de voces: los embeddings pueden alimentar un paso de agrupamiento para diarización.
- Procesamiento de ventanas de audio de entre 0.5 s y aproximadamente 2 minutos por inferencia.
- Ejecución nativa en macOS 14 / iOS 17 o superior sin NeMo, PyTorch ni ONNX Runtime.
- API en Python (coremltools) y en Swift (fichero autocontenido con frontend Accelerate y llamada al modelo).
- No soporta tool calling, agentes, generación de texto, visión ni audio generativo: es un modelo discriminativo de speaker embedding.

## Casos de uso

- Verificación biométrica en aplicaciones macOS/iOS: el modelo permite comprobar si la voz de un usuario coincide con una plantilla enrolada, ejecutándose de forma local en Apple Silicon sin enviar audio a un servidor.
- Diarización de reuniones y llamadas: los embeddings de ventanas de 1.5 a 6 s pueden alimentar un clustering para separar intervinientes; el autor validó el modelo sobre 19 llamadas multihablante con 16 personas conocidas y 57 voces etiquetadas.
- Autenticación por voz en dispositivos: con ventanas cortas (desde 0.5 s) y umbrales de coseno, puede integrarse en flujos de desbloqueo o confirmación de identidad en apps nativas.
- Indexación y búsqueda de archivos de audio: generar embeddings de cada locución y almacenarlos para recuperar fragmentos por hablante mediante búsqueda por similitud coseno.
- Control de acceso a reuniones grabadas: identificar qué personas conocidas aparecen en una grabación y en qué segmentos, combinando el modelo con un VAD y un clustering posterior.
- Preprocesado para pipelines de transcripción con atribución de hablante: asignar cada segmento transcrito a un embedding de hablante para etiquetar quién dijo qué en actas o subtítulos.
- Investigación en biometría de voz: servir como extractor de referencia con paridad numérica verificada frente a onnxruntime para reproducir experimentos en entorno Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como VoxCeleb EER) en la información disponible. El autor sí documenta métricas de paridad y de separación de voces:

| Prueba | Resultado |
|---|---|
| Core ML (CPU) vs onnxruntime, coseno peor caso | 1.000000 |
| Core ML (CPU+GPU) vs onnxruntime, coseno peor caso | 1.000000 |
| Core ML (todos los compute units) vs onnxruntime, coseno peor caso | 1.000000 |
| PyTorch reconstruido vs onnxruntime (150, 333, 600, 1200 frames) | 1.0000000 |
| Float16 vs onnxruntime, coseno peor caso | 0.9988 (descartado) |
| Misma voz, clips sintéticos | coseno 0.897 |
| Dos voces distintas diciendo la misma frase | coseno 0.306 |

## Requisitos de hardware

- VRAM/espacio: paquete de 88.5 MB en float32; el modelo es pequeño y no requiere GPU dedicada.
- GPU recomendadas: no aplica en el sentido tradicional; el modelo se ejecuta en Apple Silicon (CPU y GPU) y en hardware Apple compatible con macOS 14 / iOS 17. El Neural Engine no se utiliza.
- Cabe en cualquier Mac o dispositivo iOS moderno; no requiere GPU de escritorio (A100, H100, RTX 4090 no son el objetivo de este artefacto).
- Opciones de despliegue: Core ML de forma nativa (`.mlpackage` o `.mlmodelc`), coremltools en Python y Core ML framework en Swift.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Formato | Embedding | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nikioth/titanet-large-coreml | Core ML | 192 dims | 0.5 s a ~2 min | CC BY 4.0 | Hugging Face |
| nvidia/speakerverification_en_titanet_large | NeMo / ONNX (base) | 192 dims | no disponible | no disponible en la información | Hugging Face (NVIDIA) |
| nemo_en_titanet_large.onnx (sherpa-onnx) | ONNX | 192 dims | no disponible | no disponible en la información | GitHub releases de sherpa-onnx |

No se dispone de datos de benchmarks comparativos con otros modelos de speaker verification (por ejemplo, ECAPA-TDNN o WavLM-based) en la información proporcionada.

## Limitaciones y advertencias

- Modelo discriminativo de hablante: no genera texto, no razona y no admite tool calling ni agentes.
- Solo se declara soporte para inglés en la metadata; el rendimiento en otras lenguas no está documentado.
- Requiere calcular el frontend log-mel por separado con los parámetros exactos de kaldi-native-fbank; un frontend distinto degrada la paridad.
- La ventana de audio está limitada a 50–12288 frames (0.5 s a ~2 min); no procesa audio más largo en una sola inferencia.
- Riesgo de confusión entre voces similares: el autor reporta coseno 0.306 entre dos voces distintas diciendo la misma frase, pero no se publican tasas de error (EER) sobre datasets estándar.
- El Neural Engine no se aprovecha; en Apple Silicon la inferencia float32 usa CPU y GPU.
- Licencia CC BY 4.0: permite uso comercial con atribución; deben respetarse también las condiciones del modelo base de NVIDIA, no detalladas en la información disponible.
- El modelo se distribuye con muy poca tracción (6 descargas, 0 likes) y fue creado en octubre de 2026; no hay evidencia de uso en producción.
- No se han publicado datos sobre sesgos demográficos, robustez ante ruido o rendimiento en audio telefónico más allá de la evaluación privada del autor.

## Enlaces

- Hugging Face: https://huggingface.co/nikioth/titanet-large-coreml
- Modelo base NVIDIA: https://huggingface.co/nvidia/speakerverification_en_titanet_large
- Export ONNX de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/speaker-recongition-models
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
