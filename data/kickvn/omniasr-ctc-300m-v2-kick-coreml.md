# kickvn/omniASR-CTC-300M-v2-KICK-CoreML

## Resumen

omniASR-CTC-300M-v2-KICK-CoreML es una conversión a Core ML (fp16, ML Program) del modelo CTC `omniASR_CTC_300M_v2` de Meta, perteneciente a la familia Omnilingual ASR. La conversión la firma el usuario `kickvn` (KICK) y se distribuye como un paquete `omni.mlpackage` dentro de un zip de aproximadamente 600 MB, listo para ejecutarse en macOS 14 o superior sobre Apple Silicon. No es un modelo nuevo: los pesos son los mismos que los del repositorio ONNX del mismo autor, con el conjunto completo de caracteres.

El modelo resuelve un problema muy concreto: la alineación forzada (forced alignment) de letras de canciones y transcripciones sobre audio, es decir, obtener la marca temporal de cada carácter o fragmento de texto a partir de las emisiones CTC. Según la model card, cubre más de 1600 idiomas y se utiliza como alineador de letras dentro de KICK Studio en Macs con Apple Silicon, ejecutándose en la GPU mediante Core ML.

Su relevancia ahora es práctica: demuestra que un modelo de 300 M de parámetros de la familia wav2vec2 puede pasar de ONNX Runtime en CPU a Core ML en GPU con una aceleración de 6,2 s frente a 20,2 s en una canción de 221,6 s, manteniendo un 99,89 % de coincidencia en el argmax por fotograma respecto al modelo ONNX. La pega es que el Neural Engine no se recomienda para esta conversión (solo un 92 % de coincidencia en fp16 sobre ANE).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabeza CTC (según tags del repo y model card); convertido a Core ML ML Program |
| Parametros totales | 300 M (según el nombre del modelo; no se detalla desglose en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Entrada de audio fija de 544 000 muestras float32 = 34 s a 16 kHz (ventana de 30 s más 2 s de contexto a cada lado) |
| Tipos de cuantizacion | fp16 (Core ML); otras cuantizaciones no disponibles en la información proporcionada |
| Idiomas soportados | Más de 1600 según la model card (heredado de Omnilingual ASR); no hay listado ni evaluación por idioma en la información disponible |
| Licencia | Apache 2.0 (modelo original (c) Meta Platforms, Inc.) |
| Formato de pesos | Core ML `mlpackage` (zip `omniASR-CTC-300M-v2-kick-coreml.zip`, ~600 MB); existe variante ONNX en el repo del mismo autor |
| Entrada | `wave`: float32 `[1, 544000]`, normalizada (media 0, varianza 1); si el audio es más corto, normalizar, rellenar con ceros y conservar los fotogramas de las muestras reales |
| Salida | `logits`: float32 `[1, 1699, 10288]`, un fotograma cada 20 ms (~33,98 s de audio) |
| Vocabulario CTC | `vocab.json` (carácter → id de clase), `profile.json` con `{"kind": "chars", "normalize": true, "blank": 0}` |
| Tamano del repo | 0,6 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es wav2vec2 con decodificación CTC: un extractor convolucional de características sobre audio de 16 kHz seguido de un codificador transformer que produce una secuencia de estados ocultos, proyectada a 10 288 clases (un carácter por clase más el blank en la posición 0). La conversión a Core ML mantiene la arquitectura y solo cambia el runtime: un ML Program en fp16 con una resolución temporal de salida de 20 ms por fotograma (1699 fotogramas para 34 s de entrada).

No hay información en la model card sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni detalles del proceso de entrenamiento original; esos datos corresponden a Meta y a la ficha del modelo base, que no se ha proporcionado. La innovación destacable de esta ficha no está en el entrenamiento, sino en la ingeniería de despliegue: conversión fp16 con verificación empírica contra el modelo ONNX (99,89 % de acuerdo en el argmax por fotograma), ventana deslizante de 34 s con 2 s de contexto a cada lado para evitar cortes en las fronteras y recomendación explícita de usar la GPU en lugar del Neural Engine.

## Capacidades

- Reconocimiento de voz a nivel de carácter mediante CTC, con salida de logits por fotograma (20 ms) para 10 288 clases.
- Alineación forzada de texto sobre audio: dado un texto conocido (letra de una canción, transcripción, guion), permite obtener la marca temporal de cada carácter o palabra.
- Cobertura multilingüe amplia: más de 1600 idiomas según la model card.
- Manejo de audio musical cantado, no solo habla limpia, según el caso de uso declarado (alineación de letras).
- Ejecución local y offline en Apple Silicon, sin llamadas a servicios externos.
- Entrada de ventana larga para un modelo de su tamaño: 34 s por inferencia, con enventanado para audio más largo (8 ventanas para una canción de 221,6 s).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo acústico, no un modelo generativo de texto.
- No tiene visión, audio generativo ni modo "thinking".

## Casos de uso

- Karaoke y letras sincronizadas: el modelo genera logits CTC por carácter y un algoritmo de alineación CTC deriva el tiempo de inicio y fin de cada sílaba o palabra, lo que permite resaltar la letra en tiempo real sobre la reproducción de audio.
- Sincronización de subtítulos con guiones existentes: si se dispone del texto exacto (guion, transcripción revisada), la alineación forzada evita depender de un ASR libre y proporciona tiempos precisos por palabra para subtitulado profesional.
- Preparación de datasets de ASR: alinear audios con sus transcripciones a nivel de carácter permite segmentar corpus largos en fragmentos con límites exactos, útiles para entrenar o evaluar otros sistemas.
- Audiolibros y pódcasts: alineación de capítulos con el texto de referencia para crear índices navegables, búsqueda por frase o resaltado tipo "read-along" en una app nativa de macOS.
- Verificación de pronunciación y doblaje: comparar la alineación esperada de un guion con las emisiones del modelo permite localizar palabras omitidas, mal pronunciadas o desincronizadas en una pista de voz.
- Investigación lingüística y fonética: extracción de segmentaciones a nivel de carácter en más de 1600 idiomas para estudios comparativos, con la ventaja de que todo el procesamiento ocurre en local.
- Aplicaciones macOS distribuidas fuera de línea: al ser un `.mlpackage` que se ejecuta en la GPU vía Core ML, se puede integrar en apps de Apple Silicon que requieran transcripción o alineación sin conexión y sin costes de inferencia en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (WER, MMLU, HumanEval, etc.) en la información disponible. Los únicos datos medidos que aporta la model card son de velocidad y consistencia frente a la variante ONNX:

| Metrica | Resultado |
|---|---|
| Equipo de medida | MacBook Air M4 |
| Audio de prueba | Canción de 221,6 s, 8 ventanas |
| Tiempo de emisiones, Core ML en GPU | 6,2 s |
| Tiempo de emisiones, ONNX Runtime en CPU | 20,2 s |
| Aceleracion (GPU Core ML vs CPU ONNX) | ~3,26x |
| Coincidencia de argmax por fotograma vs ONNX | 99,89 % |
| Coincidencia de argmax en Neural Engine (fp16) | 92 % (motivo por el que no se recomienda) |
| Ventana de inferencia | 34 s de audio por pasada (1699 fotogramas a 20 ms) |

## Requisitos de hardware

- VRAM o memoria unificada: los pesos en fp16 ocupan aproximadamente 600 MB (tamaño del zip); hay que sumar la activación de salida, que son 1699 × 10 288 float32 ≈ 70 MB por ventana, más los estados intermedios del codificador.
- Plataforma obligatoria: Apple Silicon con macOS 14 o superior (requisito declarado del ML Program). No hay ruta de ejecución CUDA ni CPU x86 documentada para este paquete.
- GPU recomendada: la GPU integrada de Apple Silicon, con la que se obtienen los 6,2 s por cada 8 ventanas en un M4. El Neural Engine no se recomienda para esta conversión.
- Cabe en cualquier Mac con Apple Silicon, incluidos modelos de gama base, al tratarse de un modelo de 300 M de parámetros en fp16; no requiere GPU dedicada.
- Opciones de despliegue: Core ML de forma nativa en macOS/iOS (este repo), ONNX Runtime con la variante `kickvn/omniASR-CTC-300M-v2-ONNX`, o el modelo original de Meta en PyTorch. Otros runtimes (llama.cpp, vLLM, TGI, Ollama) no están soportados por este formato.
- Throughput estimado: 221,6 s de audio procesados en 6,2 s en un M4 con Core ML, es decir, unas 35,7 veces más rápido que el tiempo real (aproximadamente 0,78 s por ventana de 34 s). No se han publicado cifras de latencia para otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kickvn/omniASR-CTC-300M-v2-KICK-CoreML | 300 M | 34 s por ventana (544 000 muestras a 16 kHz) | Core ML fp16 | Apache 2.0 | Objeto de esta ficha; GPU de Apple Silicon, 6,2 s por 8 ventanas en M4 |
| kickvn/omniASR-CTC-300M-v2-ONNX | 300 M | Misma ventana (mismos pesos) | ONNX | Apache 2.0 | Referencia de corrección (99,89 % de acuerdo) y opción multiplataforma; 20,2 s en CPU en la misma prueba |
| facebook/omniASR-CTC-300M (base) | 300 M | No disponible en la información proporcionada | PyTorch / safetensors (no confirmado) | Apache 2.0 | Modelo original de Meta; permite reentrenamiento y fine-tuning, no así el paquete Core ML |
| Whisper large-v3 de OpenAI | ~1550 M | Ventanas de 30 s | PyTorch, GGUF, otros | MIT | Alternativa genérica de ASR multilingüe con mucho ecosistema; no es un modelo de alineación por carácter y sus cifras no se han verificado en esta búsqueda |

## Limitaciones y advertencias

- El paquete está atado a Apple Silicon y macOS 14 o superior; no hay soporte para CUDA, ROCm ni CPU x86 en este repositorio.
- El Neural Engine no es una opción fiable: en fp16 sobre ANE la coincidencia de argmax baja al 92 % frente al modelo ONNX, lo que puede degradar la alineación.
- La ventana de entrada es fija (544 000 muestras); el audio más largo exige enventanado manual con contexto solapado, y el audio más corto requiere normalización previa y relleno con ceros conservando los fotogramas reales.
- El vocabulario es a nivel de carácter (10 288 clases, blank en 0); no se documenta el manejo de puntuación, mayúsculas ni normalización más allá de `"normalize": true`, así que no debe asumirse una transcripción legible directamente a partir de las emisiones.
- No hay métricas de calidad publicadas (WER, tasa de alineación correcta, evaluación por idioma); la única validación es la coincidencia de argmax frente al modelo ONNX, que mide fidelidad de la conversión, no precisión del modelo.
- La cobertura de "más de 1600 idiomas" procede de la model card y no está verificada de forma independiente; el rendimiento puede variar mucho entre idiomas, especialmente en audio cantado, con ruido o con música de fondo.
- La cuantización fp16 introduce una pérdida pequeña pero medible frente a los pesos originales; para usos que exijan máxima fidelidad conviene contrastar con la variante ONNX u original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un artefacto reciente y de un único autor, sin validación comunitaria amplia.
- Licencia Apache 2.0, que permite uso comercial, pero se deben conservar los ficheros `LICENSE` y `NOTICE` y la atribución a Meta Platforms, Inc. como titular del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kickvn/omniASR-CTC-300M-v2-KICK-CoreML
- Variante ONNX del mismo autor: https://huggingface.co/kickvn/omniASR-CTC-300M-v2-ONNX
- Modelo base de Meta: https://huggingface.co/facebook/omniASR-CTC-300M
- Paper, blog o demo oficiales: no disponibles en la información proporcionada.
