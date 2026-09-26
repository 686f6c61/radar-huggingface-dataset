# moeru-ai/sherpa-onnx-kws-zipformer-wenetspeech-3.3M-2024-01-01

## Resumen

Este repositorio distribuye el modelo `sherpa-onnx-kws-zipformer-wenetspeech-3.3M-2024-01-01` empaquetado por moeru-ai para Sherpaw, un runtime de WebAssembly. No es un modelo de lenguaje: es un detector de palabras clave (keyword spotting, KWS) en streaming, con arquitectura Zipformer y cabezal de tipo transducer, 3,3 millones de parámetros y pesos fp32 sin modificar. Su función es consumir audio PCM mono y emitir una activación cuando reconoce una palabra clave definida por el usuario; no transcribe ni genera texto.

El interés del repositorio está en el empaquetado: los tres componentes ONNX (encoder, decoder y joiner) y el fichero `tokens.txt` se convierten en un bundle WASM de 13.082.946 bytes que puede cargarse en el navegador sin backend. Los pesos proceden de la release oficial de sherpa-onnx y el modelo original es de pkufool, con licencia Apache-2.0.

Resulta relevante para quien necesite activación por voz on-device o en web con huella mínima: 3,3 M de parámetros, ejecución en CPU sin GPU dedicada y soporte únicamente de chino (zh). No incluye vocabulario de palabras clave ni grabaciones de audio, y no se han publicado benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer con cabezal transducer (encoder, decoder y joiner); configuración chunk-16, left-context-64, precisión fp32 |
| Parámetros totales | 3,3 M (según la nomenclatura del modelo; el autor no desglosa el recuento por componente) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto textual: procesa audio en streaming por chunks de 16 frames con 64 frames de contexto izquierdo |
| Tipos de cuantización | Solo fp32; el paquete no realiza conversión ni cuantización y no incluye variantes int8 |
| Idiomas soportados | Chino (zh, mandarín). El japonés queda sin verificar según el autor |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`, `joiner.onnx`) más `tokens.txt`, empaquetados como bundle WebAssembly (`preload.data`, `preload.js`, `preload.js.metadata`); 13.082.946 bytes |

## Arquitectura y entrenamiento

El modelo es un detector de palabras clave basado en Zipformer, la arquitectura de encoder introducida en el ecosistema icefall/k2-fsa como alternativa eficiente al encoder transformer para reconocimiento de voz en streaming. El sistema completo sigue el esquema transducer: un encoder Zipformer que consume las características acústicas, un decoder que modela la secuencia de tokens y un joiner que combina ambas representaciones. La configuración declarada es chunk-16 con left-context-64, es decir, procesamiento por bloques con ventana de contexto acotada, adecuada para inferencia de baja latencia en tiempo real.

La model card no documenta el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO; el nombre del modelo indica que se entrenó sobre WenetSpeech. Tampoco se describe ninguna innovación adicional más allá del propio empaquetado. El repositorio es explícitamente un empaquetado: según el autor, no se realiza conversión de modelo, cuantización, entrenamiento ni compilación de palabras clave, y los pesos se copian sin modificar desde la release oficial de sherpa-onnx previa verificación de los hashes SHA-256 de cada fichero fuente.

## Capacidades

- Detección de palabras clave en audio en streaming: recibe PCM mono y emite eventos de activación cuando reconoce una palabra clave configurada.
- Funcionamiento con vocabulario de palabras clave definido por el usuario, cuya compilación se realiza fuera de este repositorio.
- Ejecución en navegador mediante WebAssembly, cargando el bundle con `loadData({ module, data, metadata })` de `@sherpaw/preloader` antes de instanciar el spotter de `@sherpaw/kws`.
- Ejecución en CPU: al tratarse de un modelo de 3,3 M de parámetros, no requiere acelerador dedicado.
- Integración con el ecosistema sherpa-onnx, que expone runtimes nativos (C++, Python, Kotlin, Swift, entre otros) además del runtime WASM.
- No realiza reconocimiento automático del habla ni transcripción: solo señala la presencia de las palabras clave configuradas.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso ni modo de pensamiento.
- No dispone de capacidades multilingües: está entrenado para chino y el japonés no está verificado.
- No incorpora visión, audio generativo ni salida de texto.

## Casos de uso

- Palabra de activación en aplicaciones web: el bundle WASM permite detectar una wake word en el navegador sin enviar audio a un servidor, lo que reduce latencia y evita problemas de privacidad en productos de dictado o asistentes web en chino.
- Preactivación de un ASR mayor en pipelines en cascada: el KWS permanece a la escucha con un consumo mínimo de CPU y solo despierta al modelo de reconocimiento cuando detecta la palabra clave, lo que rebaja el coste computacional y energético en dispositivos con batería.
- Asistentes de voz on-device para mandarín: al ocupar 13 MB en fp32, puede embeberse en aplicaciones móviles o firmware de altavoces inteligentes que ejecuten sherpa-onnx de forma local.
- Interfaz manos libres en entornos profesionales: control por voz de aplicaciones de campo, logística o sanidad donde el operario no puede usar las manos, usando una palabra clave fija para invocar comandos posteriores.
- Domótica e IoT: activación de rutinas en dispositivos con microcontroladores o SoC modestos, ya que la inferencia no necesita GPU ni memoria dedicada reseñable.
- Accesibilidad: activación por voz de funciones de control en aplicaciones de asistencia para personas con movilidad reducida, con la palabra clave adaptada al usuario.
- Filtrado previo en grabadoras y sistemas de vigilancia: marcar segmentos de audio que contienen un término concreto para su revisión posterior, reduciendo el volumen de material que debe procesarse o almacenarse.
- Telemetría de activaciones en productos de consumo: registrar cuántas veces se pronuncia la wake word para analizar uso, sin conservar el audio completo, siempre que la política de privacidad del producto lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor advierte explícitamente de que las detecciones de los ejemplos del proyecto upstream no establecen la precisión del modelo para palabras de activación arbitrarias, y remite a la documentación de KWS de sherpa-onnx para obtener detalles.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra oficial; el bundle completo ocupa 13.082.946 bytes (aproximadamente 12,5 MiB), por lo que la huella de pesos en memoria es del orden de decenas de megabytes contando buffers y runtime.
- GPU recomendadas: no aplica. Es un modelo de 3,3 M de parámetros pensado para CPU; cualquier GPU moderna (RTX 4090, A100, H100) lo ejecutaría de forma sobrada pero innecesaria.
- GPU de consumo: cabe en cualquier GPU de consumo e incluso no requiere ninguna; también es viable en CPU de portátil, móvil y en el navegador mediante WebAssembly.
- Opciones de despliegue: runtime WASM de Sherpaw con `@sherpaw/preloader` y `@sherpaw/kws`; sherpa-onnx en sus bindings nativos; ONNX Runtime para cargar los tres ficheros ONNX. El bundle concreto de este repositorio está preparado para el runtime WASM de KWS compilado aparte.
- Latencia y throughput: no disponible. La configuración chunk-16 con left-context-64 implica procesamiento por bloques, pero no se publican cifras de latencia ni de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Configuración de entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (empaquetado Sherpaw) | 3,3 M | chunk-16, left-context-64, audio PCM mono | No disponible | Apache-2.0 | HuggingFace, bundle WASM |
| `sherpa-onnx-kws-zipformer-wenetspeech-3.3M-2024-01-01` original (pkufool, release de sherpa-onnx) | 3,3 M | Idéntica (mismos pesos fp32) | No disponible | Apache-2.0 declarada por el autor original | GitHub releases de sherpa-onnx y ModelScope |
| Otros detectores de palabras clave (openWakeWord, Porcupine, entre otros) | No disponible | No disponible | No disponible | Apache-2.0 en el caso de openWakeWord; propietaria en soluciones comerciales | No disponible en la información proporcionada |

La diferencia sustantiva entre las dos primeras filas es el formato de distribución, no el modelo: los pesos y los tokens son los mismos, y este repositorio añade el empaquetado WASM con `manifest.json` de hashes. Para el resto de alternativas no se dispone de cifras comparables en la información facilitada.

## Limitaciones y advertencias

- Precisión no garantizada para palabras clave arbitrarias: según el autor, la pronunciación, el ruido, el vocabulario y los umbrales afectan a los fallos y a las activaciones falsas, y las detecciones de ejemplo del proyecto upstream no establecen la precisión en casos reales.
- Idiomas: solo chino; el japonés está sin verificar. No es apto para castellano ni otros idiomas sin verificación previa.
- No se incluyen grabaciones de audio ni vocabulario de palabras clave: el usuario debe aportar ambos, y la compilación de las palabras clave no forma parte de este repositorio.
- El paquete no incluye conversión de modelo, cuantización ni entrenamiento; cualquier adaptación a otro idioma, dominio o conjunto de keywords requiere trabajo externo.
- El riesgo de alucinación en el sentido generativo no aplica, porque el modelo no produce texto; su equivalente son las activaciones espurias (falsos positivos) y las omisiones (falsos negativos).
- No se documentan análisis de sesgo en la model card; el comportamiento puede degradarse con acentos, voces infantiles o audio con ruido de fondo distintos de los del corpus de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificación, pero conviene verificar que los pesos upstream mantengan la misma licencia en su procedencia original antes de un despliegue en producción.
- Metadatos inconsistentes en el repositorio: figura con 0 descargas, 0 likes y un tamaño de repo de 0.0 GB, mientras que el propio autor indica que el paquete ocupa 13.082.946 bytes. Las fechas de creación y actualización (2026-09-26) no concuerdan con la nomenclatura 2024-01-01 del modelo, lo que no implica que los pesos hayan sido actualizados.
- El autor recomienda fijar el commit de HuggingFace al desplegar para evitar cambios inesperados en el bundle.
- Ausencia total de benchmarks publicados: no es recomendable tomar decisiones de arquitectura basadas solo en esta ficha sin realizar una evaluación propia con el vocabulario y las condiciones acústicas del caso de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/moeru-ai/sherpa-onnx-kws-zipformer-wenetspeech-3.3M-2024-01-01
- Sherpaw (runtime y preloader WASM): https://github.com/moeru-ai/sherpaw
- Release oficial del modelo en sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/download/kws-models/sherpa-onnx-kws-zipformer-wenetspeech-3.3M-2024-01-01.tar.bz2
- Modelo original de pkufool en ModelScope: https://modelscope.cn/models/pkufool/sherpa-onnx-kws-zipformer-wenetspeech-3.3M-2024-01-01
- Documentación de KWS de sherpa-onnx: https://k2-fsa.github.io/sherpa/onnx/kws/pretrained_models/index.html
