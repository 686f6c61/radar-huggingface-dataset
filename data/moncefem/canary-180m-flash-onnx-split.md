# moncefem/canary-180m-flash-onnx-split

## Resumen

Canary 180M Flash ONNX Split es una conversión a ONNX con cuantización int8 del modelo de reconocimiento automático del habla NVIDIA Canary-180M-Flash, publicada por el usuario moncefem. Se trata de un modelo de transcripción de voz a texto que cubre inglés, francés, alemán y español, con salida puntuada y con mayúsculas, y que está pensado para ejecutarse sobre CPU, tanto en Node.js como directamente en una pestaña de navegador mediante onnxruntime-web (WebAssembly). El repositorio ocupa 0,2 GB y el conjunto de pesos int8 suma aproximadamente 213 MB.

La innovación principal de esta ficha no está en el modelo base, sino en el proceso de exportación: el decodificador se ha dividido en dos grafos ONNX. El primero (`decoder-cross.int8.onnx`) calcula una sola vez por grabación las claves, valores y máscaras de atención cruzada de las cuatro capas del decodificador; el segundo (`decoder-step.int8.onnx`) decodifica token a token reutilizando esos tensores. El resultado es una reducción del tiempo de decodificación por token de 68 ms a 24 ms en WebAssembly monohilo, lo que hace viable la transcripción en el navegador sin GPU.

El modelo base es un FastConformer de 17 capas en el codificador y un Transformer de 4 capas en el decodificador, con 182 millones de parámetros totales, entrada de audio mono a 16 kHz y características log-mel de 128 bins. La licencia es CC-BY-4.0, heredada de NVIDIA, y el modelo está publicado en noviembre de 2026 con cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo Conformer AED (FastConformer encoder + Transformer decoder) |
| Parámetros totales | 182 M (17 capas de codificador, 4 capas de decodificador) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada; sin límite documentado en la model card) |
| Tipos de cuantización | int8 (única variante publicada) |
| Idiomas soportados | inglés, francés, alemán, español |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder-model.int8.onnx, decoder-cross.int8.onnx, decoder-step.int8.onnx) + vocab.txt |
| Entrada | audio mono 16 kHz, características log-mel de 128 bins, ventana de 25 ms, salto de 10 ms, pre-énfasis 0,97 |
| Salida | texto con puntuación y mayúsculas |
| Tamaño del repositorio | 0,2 GB (pesos int8 ~213 MB) |
| Runtime | onnxruntime-web (WASM), onnxruntime-node, onnxruntime (Python) |
| Modelo base | nvidia/canary-180m-flash |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura NeMo Conformer AED de NVIDIA: un codificador FastConformer de 17 capas que procesa las características log-mel de 128 bins extraídas del audio a 16 kHz, y un decodificador Transformer autorregresivo de 4 capas que genera la transcripción token a token. La variante "Flash" del modelo Canary está optimizada para latencia reducida en inferencia. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La contribución técnica de esta conversión es la separación del decodificador en dos grafos ONNX. En una exportación ONNX convencional, la salida completa del codificador se pasa al decodificador en cada paso de token, y cada una de las cuatro capas del decodificador recalcula sus claves y valores de atención cruzada, lo que en WebAssembly monohilo consume más de 60 ms por token (alrededor del 90 % del tiempo total de transcripción). Aquí, `decoder-cross.int8.onnx` transforma la salida del codificador en las máscaras, claves y valores de atención cruzada de cada capa (12 tensores) una sola vez por grabación, y `decoder-step.int8.onnx` decodifica cada token reutilizando esos tensores. La separación mueve nodos del grafo sin alterar ningún peso, por lo que las transcripciones son idénticas a las del decodificador original. El repositorio incluye además `split_canary_decoder.py`, el script que realizó la división, y `transcribe.mjs` como ejemplo ejecutable.

## Capacidades

- Transcripción de voz a texto en inglés, francés, alemán y español con puntuación y mayúsculas.
- Decodificación greedy con selección de idioma candidato mediante tokens especiales (`<|en|>`, `<|fr|>`, `<|de|>`, `<|es|>`); el ejemplo del autor permite pasar dos idiomas candidatos y el modelo elige.
- Soporte de tokens de control para puntuación (`<|pnc|>`), marcas de tiempo (`<|notimestamp|>`) y diarización (`<|nodiarize|>`), aunque el ejemplo solo demuestra la configuración sin marcas de tiempo ni diarización.
- Ejecución en CPU sin GPU, tanto en Node.js como en navegador mediante WebAssembly.
- Procesamiento de audio mono a 16 kHz con extracción de características log-mel compatible con el feature extractor de NeMo/Parakeet.
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción en el navegador sin servidor: una aplicación web puede cargar los tres ficheros ONNX desde Hugging Face y transcribir audio del micrófono o de un fichero WAV local usando onnxruntime-web, sin enviar el audio a ningún servidor, lo que resulta adecuado para requisitos de privacidad.
- Subtitulado de reuniones y notas de voz en Node.js: el script `transcribe.mjs` sirve como base para un servicio que procese grabaciones de 16 kHz mono y genere texto puntuado en inglés, francés, alemán o español.
- Herramientas de accesibilidad en el cliente: dictado por voz en aplicaciones de escritorio o web que necesitan funcionar en equipos sin GPU, gracias a que el pipeline completo corre a aproximadamente 0,05× tiempo real en un núcleo de CPU con onnxruntime nativo.
- Transcripción multilingüe con detección entre dos idiomas candidatos: el decodificador acepta una lista de idiomas candidatos y elige el más probable, útil en entornos bilingües como catalán-castellano (no soportado) o francés-alemán en regiones fronterizas.
- Procesamiento por lotes en servidores modestos: al ocupar solo 213 MB en int8 y ejecutarse en CPU, se pueden desplegar varias instancias en paralelo en un servidor sin GPU para transcribir archivos cortos.
- Prototipado e investigación en ASR: el repositorio incluye el script de división del decodificador y el ejemplo de inferencia, lo que facilita experimentar con exportaciones ONNX optimizadas para WebAssembly en entornos académicos.

## Benchmarks y rendimiento

La model card proporciona medidas de latencia del decodificador, pero no resultados de benchmarks estándar de ASR (WER, MMLU, etc.).

| Medición (grabación de 12 s, WebAssembly monohilo, Apple M5 Max) | Decodificador original | Decodificador dividido |
|---|---|---|
| Tiempo de decodificador por token | 68 ms | 24 ms |
| Total con dos idiomas candidatos | 11,2 s | 4,5 s |
| Total con un idioma | 6,3 s | 2,8 s |

Con onnxruntime nativo, el pipeline completo se ejecuta a aproximadamente 0,05× tiempo real en un núcleo de CPU. No se han publicado resultados de benchmarks de precisión (WER) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; los pesos int8 suman aproximadamente 213 MB y pueden residir en memoria RAM.
- GPU recomendadas: no son necesarias; el modelo está diseñado para CPU. No se documentan requisitos de GPU.
- Cabe en cualquier equipo consumer: el pipeline completo funciona en un navegador o en Node.js con un solo núcleo de CPU; no requiere GPU dedicada.
- Opciones de despliegue: onnxruntime-web (WebAssembly, incluido WebAssembly monohilo), onnxruntime-node y onnxruntime para Python.
- Latencia y throughput: con onnxruntime nativo, aproximadamente 0,05× tiempo real por núcleo de CPU; en WebAssembly monohilo, 4,5 s para una grabación de 12 s con dos idiomas candidatos y 2,8 s con un solo idioma (medido en Apple M5 Max).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| moncefem/canary-180m-flash-onnx-split | 182 M | en, fr, de, es | no disponible | CC-BY-4.0 | ONNX int8, CPU y navegador |
| nvidia/canary-180m-flash | 182 M | en, fr, de, es | no disponible | CC-BY-4.0 | NeMo (pesos originales), GPU/CPU |
| Whisper small (referencia) | 244 M | multilingüe | 30 s por ventana | MIT | múltiples (incluye ONNX y GGUF) |
| Whisper base (referencia) | 74 M | multilingüe | 30 s por ventana | MIT | múltiples (incluye ONNX y GGUF) |

La comparación con Whisper se ofrece como referencia de categoría (ASR de tamaño pequeño); no se dispone de datos de benchmarks comparativos en la información proporcionada. La ventaja diferencial de esta conversión frente al modelo base de NVIDIA es la ejecución en navegador sin GPU; frente a Whisper, el soporte de idiomas es más reducido (cuatro idiomas frente a la cobertura multilingüe amplia de Whisper) y la licencia es CC-BY-4.0 en lugar de MIT.

## Limitaciones y advertencias

- Solo soporta cuatro idiomas (inglés, francés, alemán y español); no cubre otros idiomas aunque el modelo base pudiera tenerlos.
- El repositorio tiene cero descargas y cero likes en el momento de la ficha, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente de la calidad de las transcripciones.
- La model card no documenta el WER ni comparaciones de precisión frente al modelo original; solo se afirma que las transcripciones son las mismas que con el decodificador original, sin aportar métricas.
- El ejemplo de código solo demuestra la configuración sin marcas de tiempo ni diarización; el uso de esos tokens especiales no está ejemplificado.
- La licencia CC-BY-4.0 exige atribución; el repositorio incluye `NOTICE.md` con la atribución correspondiente, que debe conservarse en usos derivados.
- El modelo base es de NVIDIA y esta conversión es de un tercero (moncefem); no hay garantía de mantenimiento ni soporte oficial.
- La decodificación greedy con dos idiomas candidatos duplica aproximadamente el tiempo de decodificación en WebAssembly (4,5 s frente a 2,8 s para 12 s de audio).
- No se documentan sesgos específicos del modelo ni riesgos de alucinación en la información proporcionada; como todo modelo ASR, puede producir transcripciones incorrectas en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moncefem/canary-180m-flash-onnx-split
- Modelo base NVIDIA: https://huggingface.co/nvidia/canary-180m-flash
- Ficheros del repositorio: https://huggingface.co/moncefem/canary-180m-flash-onnx-split/resolve/main/
