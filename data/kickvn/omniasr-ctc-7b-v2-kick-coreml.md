# kickvn/omniASR-CTC-7B-v2-KICK-CoreML

## Resumen

omniASR-CTC-7B-v2-KICK-CoreML es una conversión a Core ML en fp16 del modelo de reconocimiento de voz Omnilingual ASR v2 CTC de Meta (`omniASR_CTC_7B_v2`), publicada por kickvn (KICK). El modelo de partida es un wav2vec2 de 7.000 millones de parámetros con cabeza CTC y vocabulario a nivel de carácter, orientado a cubrir más de 1.600 idiomas. Esta versión no modifica los pesos: los empaqueta en un `omni.mlpackage` para ejecutarlos en la GPU de los Mac con Apple Silicon, con macOS 14 como versión mínima.

Su uso previsto no es la transcripción genérica, sino la alineación forzada de letras de canciones dentro de KICK Studio: recibe 34 segundos de audio a 16 kHz y devuelve logits CTC por frame (uno cada 20 ms), que se alinean con la letra para obtener marcas de tiempo a nivel de carácter. La ventana fija de 34 s (30 s útiles más 2 s de contexto a cada lado) y la normalización obligatoria de la entrada son los detalles de integración más relevantes.

Resulta interesante porque permite ejecutar localmente un modelo ASR multilingüe de 7B en hardware de consumo de Apple, sin depender de servicios en la nube, a cambio de una integración específica de plataforma y de la ausencia, por ahora, de benchmarks publicados y de tracción comunitaria (0 descargas y 0 likes en el momento de redactar esta ficha).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabeza CTC y vocabulario de caracteres (según tags y model card) |
| Parámetros totales | 7.000 millones (7B, según el nombre del modelo; no verificado en la model card) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 34 s de audio de entrada (ventana de 30 s + 2 s de contexto a cada lado); salida de 1.699 frames a 20 ms por frame |
| Tipos de cuantización | fp16 (Core ML ML Program); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | más de 1.600 idiomas (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML Program (`.mlpackage`, fp16) dentro de `omniASR-CTC-7B-v2-kick-coreml.zip`; ONNX en el repo hermano; pesos PyTorch en el modelo base |

Otros datos técnicos: entrada `wave` float32 `[1, 544000]` normalizada (media 0, varianza 1); salida `logits` float32 `[1, 1699, classes]` (la dimensión `classes` no se especifica en la información disponible); vocabulario en `vocab.json`; configuración CTC en `profile.json` (`{"kind": "chars", "normalize": true, "blank": 0}`); tamaño del repo 12,0 GB y del zip aproximadamente 11,2 GB.

## Arquitectura y entrenamiento

La arquitectura es un codificador wav2vec2 (así aparece etiquetado el repo) con cabeza de clasificación CTC y vocabulario a nivel de carácter. El modelo no genera texto de forma autoregresiva: emite una distribución sobre clases para cada frame de 20 ms y la secuencia de caracteres se obtiene por decodificación CTC, o bien se alinea con una transcripción conocida mediante alineación forzada CTC. Los pesos proceden de `facebook/omniASR-CTC-7B`, el modelo Omnilingual ASR v2 de Meta, y esta versión los replica sin cambios a partir del repo ONNX del mismo autor.

No se dispone de información sobre el volumen de horas o tokens de audio, la composición del dataset de entrenamiento ni las etapas de ajuste; en un modelo CTC no aplican técnicas de alineación por preferencias como RLHF o DPO. La conversión a Core ML se limita a un ML Program en fp16 con una firma de entrada y salida fija: la entrada debe normalizarse (media 0, varianza 1) y, para audios más cortos de 544.000 muestras, rellenarse con ceros conservando únicamente los frames correspondientes a muestras reales.

## Capacidades

- Reconocimiento de voz multilingüe con cobertura declarada de más de 1.600 idiomas y vocabulario de caracteres (no subpalabras BPE).
- Alineación forzada CTC de una transcripción conocida con el audio, con resolución temporal de 20 ms por frame.
- Emisión de logits por frame frame, lo que permite posprocesado propio (decodificación greedy, beam search o Viterbi para alineación).
- Uso como alineador de letras de canciones en KICK Studio, con marcas de tiempo a nivel de carácter.
- Ejecución local en la GPU de Apple Silicon mediante Core ML, sin llamadas a servicios externos.
- Procesamiento por ventanas de 34 s con 2 s de contexto a cada lado para limitar errores en los bordes.
- No es un modelo generativo de texto: no hace traducción, resumen, tool calling ni razonamiento multi-paso.
- No se documentan capacidades de diarización, detección de idioma explícita ni puntuación.

## Casos de uso

- Alineación de letras de canciones para karaoke o reproducción sincronizada: el modelo recibe la ventana de audio y la letra, y la alineación CTC produce el instante de inicio y fin de cada carácter, lo que permite resaltar la letra en tiempo real dentro de una app de escritorio.
- Generación de subtítulos con marcas de tiempo a nivel de carácter en un Mac: al trabajar con ventanas de 34 s y frames de 20 ms se obtienen subtítulos densos útiles para vídeo, pódcast o clases grabadas, sin enviar el audio a la nube.
- Anotación de corpus lingüísticos: para lenguas con poca representación, el modelo permite alinear transcripciones existentes con audio y generar datasets de habla etiquetados a nivel de carácter de forma local.
- Evaluación de pronunciación: comparando la secuencia de caracteres forzada con la esperada se pueden localizar omisiones, sustituciones o inserciones y medir su duración, lo que sirve en herramientas de aprendizaje de idiomas.
- Preprocesado para síntesis de voz (TTS): los tiempos por carácter permiten segmentar un corpus de audio y texto y construir un dataset alineado para entrenar o ajustar modelos de voz.
- Indexación y búsqueda de archivos de audio: transcribir una biblioteca de grabaciones en un Mac permite generar índices de texto y buscar por contenido sin infraestructura de servidores.
- Accesibilidad: transcripción local de reuniones o material docente en equipos Apple Silicon, con la ventaja de que el audio no sale del dispositivo.
- Investigación en fonética y prosodia: la salida por frames de 20 ms permite estudiar duraciones y fronteras de segmentos sin depender de alineadores propietarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos en fp16 ocupan aproximadamente 11,2 GB, por lo que se recomienda un Mac con 24 GB o 32 GB de memoria unificada; con 16 GB el margen es muy ajustado y depende de la carga del sistema. Estimación propia, no confirmada por el autor.
- GPU recomendadas: cualquier chip Apple Silicon (familia M1, M2, M3 o M4) con macOS 14 o superior, ejecutando el modelo en la GPU mediante Core ML. No hay soporte documentado para GPU NVIDIA, AMD o CPU x86 en este repo.
- Cabe en GPU de consumo: sí, en el sentido de que está diseñado para Macs de consumo con Apple Silicon; no está pensado para GPUs discretas convencionales.
- Opciones de despliegue: Core ML (integrado en la app o con `coremltools`) para esta versión; ONNX Runtime para el repo `kickvn/omniASR-CTC-7B-v2-ONNX`; los pesos originales en PyTorch pueden ejecutarse con frameworks de ASR, aunque no se documenta en la información disponible. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles. Cualquier cifra depende del chip, del tamaño del lote (la firma es de lote 1) y del uso de la GPU frente a la Neural Engine.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| omniASR-CTC-7B-v2-KICK-CoreML | 7B | 34 s (30 s + 2 s de contexto) | más de 1.600 | Apache 2.0 | Core ML fp16 | Esta ficha; orientado a Apple Silicon |
| facebook/omniASR-CTC-7B (base) | 7B | no disponible | no disponible | Apache 2.0 (según el derivado) | PyTorch | Pesos originales de Meta; portable a otras plataformas |
| kickvn/omniASR-CTC-7B-v2-ONNX | 7B | 34 s (misma firma declarada) | más de 1.600 | Apache 2.0 | ONNX | Mismos pesos y vocabulario; alternativa multiplataforma |
| whisper-large-v3 (referencia externa) | 1.550 M | 30 s | alrededor de 99 | MIT | PyTorch y múltiples conversiones | Modelo genérico de transcripción y traducción, con muchos menos idiomas declarados; datos según la documentación pública de OpenAI |

No se dispone de métricas de error (WER/CER) para ninguno de los modelos en la información proporcionada, por lo que la comparación es únicamente estructural.

## Limitaciones y advertencias

- Ventana de entrada fija de 544.000 muestras (34 s): el audio más largo debe trocearse y gestionarse el solape para no perder contenido en los bordes.
- La entrada debe normalizarse (media 0, varianza 1) y rellenarse con ceros si es más corta; un preprocesado incorrecto degrada la salida sin aviso explícito.
- Solo se documenta soporte para Apple Silicon con macOS 14 o superior; fuera de ese entorno hay que recurrir al repo ONNX o al modelo base.
- No hay benchmarks publicados ni validación independiente: el rendimiento real por idioma y por tipo de audio (música, ruido, acentos) es desconocido.
- Riesgo de errores en idiomas con poca representación en el entrenamiento y en audio musical, donde la voz compite con instrumentación.
- No se documentan sesgos demográficos, de género o de acento; al ser un modelo multilingüe de cobertura amplia, es esperable un rendimiento desigual entre lenguas, pero no hay datos que lo cuantifiquen.
- La cuantización a fp16 puede introducir diferencias numéricas menores frente a los pesos originales en precisión completa.
- La licencia Apache 2.0 permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE` con la atribución a Meta Platforms y la conversión de KICK.
- El repositorio no incluye código de decodificación ni tokenizador de audio: solo el paquete Core ML, `vocab.json` y `profile.json`, por lo que la integración completa corre a cargo del usuario.
- La dimensión de clases de la salida no está documentada; hay que inspeccionar el modelo para conocer el tamaño exacto del vocabulario.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/kickvn/omniASR-CTC-7B-v2-KICK-CoreML
- Versión ONNX del mismo autor: https://huggingface.co/kickvn/omniASR-CTC-7B-v2-ONNX
- Modelo base de Meta: https://huggingface.co/facebook/omniASR-CTC-7B
- Paper, blog o demo oficial: no disponibles en la información proporcionada.
