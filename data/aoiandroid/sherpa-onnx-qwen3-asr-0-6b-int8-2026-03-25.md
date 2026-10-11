# aoiandroid/sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25

## Resumen

`sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25` es un espejo (mirror) sin modificaciones de un modelo de reconocimiento automático del habla (ASR) exportado a formato ONNX y cuantizado a int8, pensado para ejecutarse con el runtime sherpa-onnx. El repositorio original pertenece a `csukuangfj2` y deriva, a su vez, de una exportación ONNX de Qwen3-ASR publicada en ModelScope por `zengshuishui`. Este espejo concreto lo mantiene el usuario `aoiandroid` para que la aplicación Cription no dependa de un repositorio de terceros.

El modelo tiene aproximadamente 0,6 mil millones de parámetros (según el nombre del repositorio), lo que lo sitúa en la gama de modelos ASR ligeros aptos para inferencia en CPU y en GPU de gama baja. El contenido del repositorio ocupa 1,0 GB, aunque el subconjunto de ficheros efectivamente copiado (6 ficheros) suma 987,0 MB, con los mismos tamaños y hashes SHA-256/blob que el origen.

Su relevancia es práctica: permite integrar reconocimiento de voz con soporte de VAD (detección de actividad de voz), streaming en tiempo real desde micrófono y decodificación de audio largo dentro de aplicaciones que ya usan sherpa-onnx, sin depender de servicios en la nube. La licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Exportación ONNX de Qwen3-ASR; arquitectura interna detallada no disponible |
| Parametros totales | ~0,6B (inferido del nombre del repositorio; no confirmado en la documentación) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (el repositorio incluye ficheros con sufijo `.int8.onnx`, p. ej. `encoder.int8.onnx`) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`); 6 ficheros, 987,0 MB en el espejo |
| Runtime previsto | sherpa-onnx |
| Repositorio de origen | `csukuangfj2/sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25`, commit `68818b2313fe77bd06f6a7c5068ff3ef59d02b8a` |
| Exportación previa | ModelScope `zengshuishui/Qwen3-ASR-onnx` (Apache-2.0), exportación ONNX de Qwen3-ASR |

## Arquitectura y entrenamiento

No se dispone en la información proporcionada de detalles sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. Lo único verificable es que se trata de una exportación ONNX de Qwen3-ASR, distribuida en varios ficheros (el espejo conserva 6 ficheros, entre ellos `encoder.int8.onnx`) y pensada para el runtime sherpa-onnx, que organiza los modelos ASR en componentes separados de codificador, decodificador y, en su caso, tokenizador.

El rasgo técnico destacable es la cuantización int8 aplicada a los pesos ONNX, que reduce el tamaño del artefacto y permite inferencia eficiente en CPU. La documentación de sherpa-onnx para Qwen3-ASR menciona explícitamente escenarios de reconocimiento en tiempo real/streaming desde micrófono con y sin VAD, y decodificación de ficheros de audio largos con VAD. No hay información disponible sobre innovaciones adicionales de decodificación (por ejemplo, decodificación especulativa) en este artefacto concreto.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto mediante el runtime sherpa-onnx.
- Streaming / reconocimiento en tiempo real desde micrófono, según la documentación de sherpa-onnx para Qwen3-ASR.
- Decodificación de audio largo con VAD (detección de actividad de voz), útil para ficheros extensos con silencios.
- Ejecución local en formato ONNX int8, sin necesidad de servicios en la nube.
- Integración en aplicaciones mediante las bindings de sherpa-onnx (C++, Python, C#, Kotlin, Swift, etc., según el proyecto sherpa).
- Soporte de tool calling / function calling: no disponible; es un modelo ASR, no un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no aplica / no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas en la información proporcionada).
- Capacidades de visión o audio-vision: no disponible.
- Modo "thinking": no aplica.

## Casos de uso

- Transcripción de audio largo con VAD: el modelo se puede usar para procesar grabaciones de reuniones o entrevistas de duración elevada, segmentando por actividad de voz y decodificando cada tramo, tal como documenta sherpa-onnx en sus ejemplos de "decode a long audio file with VAD".
- Dictado y entrada por voz en aplicaciones de escritorio: integración vía sherpa-onnx con captura de micrófono para convertir habla en texto en local, sin enviar audio a terceros, lo que encaja con el objetivo declarado del espejo (que Cription no dependa de un repositorio externo).
- Subtitulado en tiempo real: uso del modo streaming desde micrófono para generar subtítulos incrementales en directo, con latencia dependiente del hardware.
- Asistentes de voz embebidos: al ser un artefacto int8 de ~0,6B, puede desplegarse en equipos modestos o en el borde para comandos de voz y transcripción corta.
- Análisis de llamadas y atención al cliente: transcripción de grabaciones de call center para posterior indexación, búsqueda o análisis de calidad, ejecutándose en infraestructura propia.
- Accesibilidad: conversión de voz a texto para personas con dificultades auditivas en aplicaciones de escritorio o móviles que no pueden depender de conectividad.
- Pipelines de datos de voz: transcripción por lotes de corpus de audio para generar datasets etiquetados o alimentar sistemas de búsqueda sobre audio.
- Despliegue en aplicaciones multiplataforma: al ser ONNX y ejecutarse con sherpa-onnx, se puede embeber en aplicaciones .NET, móviles o web (WASM, según el runtime) que necesiten ASR offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio es un espejo y su model card no incluye tablas de WER, MMLU, HumanEval ni métricas comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamaño del artefacto (987,0 MB en total, pesos int8), la inferencia cabe holgadamente en menos de 2 GB de memoria, aunque el valor exacto depende del runtime y del tamaño del buffer de audio.
- GPU recomendadas: no disponible. Por el tamaño, cualquier GPU con unos pocos GB de VRAM es suficiente; no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la información proporcionada.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna con al menos 2-4 GB de VRAM libres, dado el tamaño del artefacto. No confirmado por el autor en la información disponible.
- CPU: el uso de ONNX int8 y del runtime sherpa-onnx está orientado precisamente a inferencia en CPU, incluyendo dispositivos de gama baja.
- Opciones de despliegue: sherpa-onnx (runtime previsto); ONNX Runtime de forma genérica. No se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI para este artefacto (son runtimes orientados a modelos de lenguaje, no a este pipeline ASR).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada para este artefacto concreto. Como categoría, los modelos ASR ligeros exportados a ONNX y ejecutables con sherpa-onnx (por ejemplo, las familias Whisper, Zipformer o Paraformer empaquetadas por el proyecto k2-fsa) son las alternativas naturales, pero no se han recuperado en la búsqueda cifras de parámetros, contexto, WER ni licencia de esas alternativas que permitan una comparación rigurosa. Por tanto:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25 | ~0,6B (segun nombre) | No disponible | Apache-2.0 | HuggingFace (espejo) | No disponible |
| Alternativas ASR ONNX de sherpa-onnx (Whisper, Zipformer, Paraformer) | No disponible | No disponible | No disponible | HuggingFace / k2-fsa | No disponible |

## Limitaciones y advertencias

- Es un espejo, no un modelo original: el repositorio `aoiandroid/...` copia un subconjunto de 6 ficheros del repositorio de `csukuangfj2`. Cualquier actualización, corrección o soporte proviene del origen, no del espejo.
- Advertencia de licencia: la model card indica que el repositorio fuente no declara licencia explícitamente; la licencia Apache-2.0 se hereda de la exportación original de ModelScope (`zengshuishui/Qwen3-ASR-onnx`), a su vez derivada de Qwen3-ASR (Apache-2.0). Conviene verificar la cadena de licencias antes de un uso comercial.
- No se declaran idiomas soportados: no es posible garantizar cobertura multilingüe ni el rendimiento por idioma.
- No hay métricas publicadas: sin WER ni benchmarks, no se puede evaluar la calidad de transcripción frente a alternativas.
- Riesgo de errores de transcripción: como cualquier modelo ASR, puede fallar con acentos marcados, ruido de fondo, solapamiento de hablantes, jerga técnica o nombres propios. No se han publicado análisis de sesgos para este artefacto.
- Ámbito limitado: es un modelo de reconocimiento de voz, no un modelo de lenguaje; no realiza razonamiento, generación libre, tool calling ni tareas multimodales más allá del audio.
- Dependencia del runtime: su uso práctico está ligado a sherpa-onnx y a los ficheros exactos incluidos en el espejo; sustituir o faltar alguno de los 6 ficheros puede romper el pipeline.
- Fechas del repositorio: el nombre del artefacto incluye "2026-03-25" y las marcas de tiempo del repositorio (creado y actualizado el 2026-10-10) proceden del espejo; conviene contrastarlas con el origen antes de citarlas.
- Cero tracción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que no aporta señal de validación por la comunidad.

## Enlaces

- Espejo en HuggingFace: https://huggingface.co/aoiandroid/sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25
- Repositorio de origen: https://huggingface.co/csukuangfj2/sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25
- Árbol del commit de origen: https://huggingface.co/csukuangfj2/sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25/tree/68818b2313fe77bd06f6a7c5068ff3ef59d02b8a
- Fichero `encoder.int8.onnx` en el origen: https://huggingface.co/csukuangfj2/sherpa-onnx-qwen3-asr-0.6B-int8-2026-03-25/blob/main/encoder.int8.onnx
- Exportación original en ModelScope: https://modelscope.cn/models/zengshuishui/Qwen3-ASR-onnx
- Documentación de sherpa-onnx para Qwen3-ASR: https://k2-fsa.github.io/sherpa/onnx/qwen3-asr/index.html
- Modelos preentrenados de Qwen3-ASR en sherpa: https://k2-fsa.github.io/sherpa/onnx/qwen3-asr/pretrained.html
- Fuente de la documentación en GitHub: https://github.com/k2-fsa/sherpa/blob/master/docs/source/onnx/qwen3-asr/pretrained.rst
