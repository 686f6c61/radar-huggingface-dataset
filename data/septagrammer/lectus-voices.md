# septagrammer/lectus-voices

## Resumen

Lectus Voices es una colección de paquetes de modelos de síntesis de voz (text-to-speech) empaquetados por el desarrollador septagrammer para su uso en la aplicación Lectus, un lector de libros offline para iOS y Android. No se trata de un modelo único entrenado desde cero, sino de una agregación de tres familias de modelos TTS de terceros (Vosk-TTS, Kokoro-82M y StyleTTS2) convertidos a formato ONNX y optimizados para inferencia en dispositivo (on-device). El repositorio ocupa 5,1 GB y se distribuye bajo licencia Apache 2.0.

El paquete cubre cinco idiomas (ruso, inglés, francés, español y ucraniano) mediante tres subdirectorios independientes: `ru/` (Vosk-TTS 0.9 multi, 5 voces), `kokoro/` (Kokoro-82M v1.0, 53 voces, del que la app usa las voces de inglés US/GB, francés y español) y `uk/` (StyleTTS2 ucraniano, 31 voces). Cada subdirectorio incluye el modelo ONNX, recursos léxicos (diccionarios de pronunciación o acentuación) y ficheros de voces.

Su relevancia radica en que demuestra un patrón práctico de despliegue TTS en dispositivos móviles: cuantización selectiva (int8 solo donde no degrada la calidad), conversión de diccionarios a formatos con búsqueda binaria sobre mmap y exportación ONNX con paridad respecto a PyTorch. Los pesos de los modelos subyacentes no han sido reentrenados; los cambios son mecánicos (cuantización, conversión de formato, empaquetado).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tres familias: VITS multistream con encoder de prosodia BERT (ruso); Kokoro-82M (inglés, francés, español); StyleTTS2 determinista (ucraniano) |
| Parametros totales | Kokoro: 82M; Vosk-TTS y StyleTTS2: no disponible |
| Parametros activos | no disponible (no son modelos MoE) |
| Longitud de contexto | no disponible (modelos TTS, no de contexto textual) |
| Tipos de cuantizacion | int8 dinámica (encoder BERT del ruso); fp32 en Kokoro (int8 descartado por lentitud y pérdida de calidad); fp32 en StyleTTS2 |
| Idiomas soportados | Ruso, inglés (US/GB), francés, español, ucraniano |
| Licencia | Apache 2.0 (el submodelo ucraniano StyleTTS2 upstream es MIT) |
| Formato de pesos | ONNX (`model.onnx`, `bert.int8.onnx`), más ficheros auxiliares `voices.bin`, `dict.tsv`, `stress.tsv`, `vocab.txt`, `vocab.json`, `tokens.txt`, `lexicon-*.txt` |
| Frecuencias de muestreo | 22050 Hz (ruso), 24000 Hz (Kokoro y ucraniano) |
| Voces | 5 (ruso), 53 (Kokoro, subconjunto usado por la app), 31 (ucraniano) |
| Tamano del repositorio | 5,1 GB |

## Arquitectura y entrenamiento

El repositorio no entrena modelos nuevos; agrega y adapta tres arquitecturas TTS distintas. El subdirectorio `ru/` deriva de `vosk-model-tts-ru-0.9-multi` de Alpha Cephei: un sintetizador VITS multistream condicionado por un encoder de prosodia basado en BERT. Los cambios respecto al original son la cuantización dinámica int8 del encoder BERT (de 624 MB a 156 MB, sin pérdida audible según el autor) y la conversión del diccionario de pronunciación upstream (2.037.867 palabras) a un TSV ordenado `palabra<TAB>fonemas`, conservando la variante de mayor probabilidad por palabra para permitir búsqueda binaria sobre mmap en dispositivo.

El subdirectorio `kokoro/` es un subconjunto sin modificar de `kokoro-multi-lang-v1_0` empaquetado por k2-fsa a partir de `hexgrad/Kokoro-82M`. Se mantiene en fp32 deliberadamente: la cuantización dinámica int8 reduce el tamaño a 114 MB, pero el uso de `ConvInteger` hace la inferencia en CPU unas 4 veces más lenta (RTF 0,66 frente a 0,16) con pérdida de calidad audible. Se omiten los léxicos y FST del chino del paquete original. El subdirectorio `uk/` es una exportación ONNX de `patriotyk/styletts2_ukrainian_multispeaker`, un StyleTTS2 determinista (sin difusión en inferencia) con paridad exacta respecto a PyTorch; incluye un diccionario de acentuación (71 MB) desambiguado por voto de mayoría sobre el corpus brown-uk y vectores de estilo por hablante `[31, 256]` en float32 little-endian.

## Capacidades

- Síntesis de voz (text-to-speech) offline en cinco idiomas: ruso, inglés (US y GB), francés, español y ucraniano.
- Selección de hablante entre múltiples voces: 5 en ruso (3 femeninas, 2 masculinas), 53 en Kokoro (la app usa voces concretas de inglés, francés y español) y 31 en ucraniano.
- Control de velocidad de habla en el modelo ucraniano (entrada `tokens + speed + style -> wav`).
- Condicionamiento de prosodia mediante encoder BERT en el modelo ruso.
- Pronunciación guiada por diccionario léxico en ruso (2,03 millones de palabras) y por diccionario de acentuación en ucraniano.
- Inferencia en dispositivo sin conexión mediante ONNX Runtime y sherpa-onnx.
- No dispone de tool calling, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo de síntesis.

## Casos de uso

- Lectura de libros en voz alta en la app Lectus: el modelo sintetiza pasajes de texto con voces rusas, inglesas, francesas, españolas y ucranianas, y los diccionarios de pronunciación y acentuación garantizan una articulación correcta de palabras poco frecuentes en ruso y ucraniano.
- Audiolibros offline en dispositivos móviles: al ejecutarse con ONNX Runtime y pesos entre 171 MB y 330 MB por modelo, cabe en el almacenamiento de un teléfono y funciona sin red, lo que encaja con escenarios de lectura en movilidad.
- Accesibilidad para personas con discapacidad visual: la selección entre múltiples hablantes y el control de velocidad permiten adaptar la locución a preferencias individuales en aplicaciones de lectura.
- Aprendizaje de idiomas: las voces nativas de inglés US/GB, francés, español, ruso y ucraniano permiten practicar pronunciación y comprensión auditiva con material propio.
- Síntesis de contenido en español y francés para prototipos: el paquete Kokoro ofrece voces `ef_dora` y `em_alex` (español) y `ff_siwis` (francés) listas para integrarse vía sherpa-onnx en aplicaciones de escritorio o móvil.
- Localización de contenidos multilingües: un mismo pipeline puede generar audio en cinco idiomas con modelos intercambiables, útil para empresas que producen material formativo o informativo en varias lenguas.
- Investigación en TTS eficiente: el repositorio sirve como referencia de cuantización selectiva, exportación ONNX con paridad y estructuras de diccionario optimizadas para búsqueda binaria en memoria mapeada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento aportado es el RTF (real-time factor) del modelo Kokoro en CPU: 0,16 en fp32 frente a 0,66 con cuantización dinámica int8, motivo por el que se mantiene fp32.

## Requisitos de hardware

- VRAM estimada para inferencia: los modelos son de tamaño reducido (171 MB el sintetizador ruso, 156 MB el encoder BERT int8, 326 MB Kokoro, 330 MB StyleTTS2 ucraniano) y están pensados para ejecución en CPU; la memoria necesaria es del orden de cientos de MB por modelo, más los diccionarios (92 MB en ruso, 71 MB en ucraniano) que se consultan por mmap.
- GPU recomendadas: no se especifican; el diseño apunta a CPU en dispositivos móviles. Cualquier GPU moderna (RTX 4090, A100, H100) podría ejecutar los modelos ONNX, pero no es el objetivo del empaquetado.
- Cabe en GPU de consumo: sí, con amplio margen; también en CPU de teléfonos iOS y Android.
- Opciones de despliegue: ONNX Runtime y sherpa-onnx (usado por la app para Kokoro). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos TTS.
- Latencia y throughput: el único dato disponible es el RTF de Kokoro en CPU (0,16 en fp32, 0,66 en int8), lo que implica síntesis más rápida que tiempo real en fp32. Para el resto de modelos no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Voces | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Lectus Voices (este repo) | Kokoro 82M; resto no disponible | ru, en, fr, es, uk | 5 / 53 / 31 | Apache 2.0 (uk upstream MIT) | ONNX | Empaquetado para app móvil, offline |
| Vosk-TTS 0.9 multi (upstream ruso) | no disponible | ru (y variantes multi) | 5 | Apache 2.0 | Modelo Vosk | Origen del subdirectorio `ru/`; aquí se cuantiza el BERT y se convierte el diccionario |
| Kokoro-82M (hexgrad) | 82M | múltiples | 53 | Apache 2.0 | PyTorch / ONNX | Origen del subdirectorio `kokoro/`; aquí se usa un subconjunto sin modificar |
| StyleTTS2 ucraniano (patriotyk) | no disponible | uk | 31 | MIT | PyTorch | Origen del subdirectorio `uk/`; aquí se exporta a ONNX con paridad |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo único ni entrenado por el autor: los pesos proceden de terceros y los cambios son mecánicos (cuantización, conversión de formato, empaquetado). La calidad depende de los modelos upstream.
- El autor indica explícitamente que los ficheros están pensados para ser descargados por la app Lectus bajo demanda y que «nothing here is meant to be used standalone», aunque permite su uso libre.
- La cuantización int8 del encoder BERT ruso y del modelo Kokoro se descartó en este último por degradación audible y lentitud (RTF 0,66 frente a 0,16); cualquier re-cuantización adicional debe validarse auditivamente.
- Cobertura idiomática limitada a cinco lenguas; no hay soporte documentado para otras.
- Riesgo de pronunciación incorrecta en palabras fuera de los diccionarios léxicos (ruso y ucraniano) o con ambigüedad de acento no resuelta por el corpus de referencia.
- El paquete Kokoro omite los léxicos y FST del chino del paquete original; no se debe esperar soporte de chino en este repositorio.
- No hay resultados de benchmarks publicados que permitan comparar objetivamente la calidad de las voces con alternativas.
- Licencia Apache 2.0 para el conjunto, con la salvedad de que el submodelo ucraniano upstream es MIT; conviene verificar la cadena de licencias antes de un uso comercial que modifique o redistribuya los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/septagrammer/lectus-voices
- Vosk models (Alpha Cephei, origen del subdirectorio ruso): https://alphacephei.com/vosk/models
- Kokoro-82M (hexgrad): https://huggingface.co/hexgrad/Kokoro-82M
- Paquete kokoro-multi-lang-v1_0 (k2-fsa / sherpa-onnx): https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models
- StyleTTS2 ucraniano multihablante (patriotyk): https://huggingface.co/patriotyk/styletts2_ukrainian_multispeaker
- Demo Space de StyleTTS2 ucraniano: https://huggingface.co/spaces/patriotyk/styletts2-ukrainian
