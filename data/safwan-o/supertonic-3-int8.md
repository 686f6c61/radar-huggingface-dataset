# safwan-o/supertonic-3-int8

## Resumen

Supertonic 3 int8 es una copia cuantizada a int8 en formato ONNX del modelo de síntesis de voz Supertone/supertonic-3, publicada por el usuario safwan-o (no por Supertone Inc.). El objetivo declarado es el uso en dispositivo dentro de onnxruntime-web (WASM), es decir, inferencia de texto a voz directamente en el navegador sin GPU y con una huella de memoria reducida. Mantiene los cuatro grafos originales, los mismos nombres de fichero, las mismas entradas y salidas, y los mismos `tts.json`, `unicode_indexer.json` y estilos de voz, de modo que cualquier cargador escrito para los ficheros oficiales funciona sin cambios.

El paquete completo ocupa 111,3 MB frente a los 398 MB del original en fp32. La arquitectura subyacente no se detalla en la información disponible, pero los componentes publicados (predictor de duración, codificador de texto, estimador de vector y vocoder, junto con el uso de ruido inyectado, longitudes latentes y pasos de denosing) corresponden a un TTS generativo de tipo difusión o flow-matching, no a un modelo autorregresivo ni a un VITS clásico.

La relevancia práctica es doble: por un lado demuestra que un TTS multilingüe puede caber en ~111 MB y ejecutarse por debajo del tiempo real en WASM con cuatro hilos (RTF 0,79); por otro, documenta con detalle el proceso de cuantización y sus compromisos (por qué el predictor de duración se deja en fp32, por qué se evita `ConvInteger`), algo poco habitual en exports comunitarios. Conviene tener en cuenta que el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y que no cuenta con validación por parte del autor original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS generativo en cuatro grafos ONNX: `duration_predictor`, `text_encoder`, `vector_estimator` (estimador de vector con pasos de denosing y ruido inyectado) y `vocoder`. Tipo exacto (difusión, flow-matching, etc.) no disponible |
| Parametros totales | No disponible. Los ficheros suman 398 MB en fp32 y 111,3 MB en int8, lo que sugiere un orden de magnitud de ~100 M de parámetros; el autor no publica el recuento |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (es un modelo de TTS; la longitud se rige por el texto de entrada y las longitudes latentes) |
| Tipos de cuantizacion | int8 en pesos de convolución + `MatMulInteger` por tensor (text encoder y vector estimator); int8 weight-only en el vocoder; `duration_predictor` se mantiene en fp32 porque la cuantización desplazaba las duraciones ~5 %. Se evita `ConvInteger` de forma deliberada |
| Idiomas soportados | Etiqueta `multilingual`; la evaluación publicada cubre alemán (8 frases) e inglés (4 frases). Lista completa de idiomas no disponible |
| Licencia | BigScience OpenRAIL-M (etiqueta `openrail`), copiada sin cambios del original; se aplican las restricciones de uso del Attachment A |
| Formato de pesos | ONNX (4 ficheros), 111,3 MB en total |
| Revision del modelo base | `3cadd1ee6394adea1bd021217a0e650ede09a323` |
| Pasos de denosing | 8 |
| Checksums | SHA-256 publicados para los cuatro ficheros ONNX |
| Tamano del repo | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información sobre el entrenamiento: la model card de esta copia no describe datos, número de tokens, composición del corpus ni si hubo RLHF/DPO o ajuste por preferencias. Todo el crédito del modelo se atribuye a Supertone Inc. y el autor declara explícitamente que aquí solo se ha realizado la cuantización. La información disponible tampoco detalla la arquitectura interna del modelo base, más allá de la estructura en cuatro grafos y del pipeline de inferencia observable.

Lo que sí está documentado es la intervención técnica. El `text_encoder` (16,3 MB) y el `vector_estimator` (65,6 MB, el grueso del modelo) usan pesos de convolución en int8 más `MatMulInteger` por tensor; el `vocoder` (25,7 MB) usa int8 weight-only; y el `duration_predictor` (3,7 MB) se deja intacto en fp32 porque la cuantización introducía un desvío de aproximadamente el 5 % en las duraciones predichas, con el consiguiente impacto en la prosodia. Se evita el operador `ConvInteger` a propósito, ya que ni onnxruntime-web ni onnxruntime-node lo implementan, lo que habría roto la portabilidad del export.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con estilos de voz predefinidos suministrados como ficheros de estilo independientes.
- Ejecución en navegador mediante onnxruntime-web (WASM) y en Node mediante onnxruntime-node, sin GPU.
- Multilingüe según la etiqueta del modelo; el rendimiento está verificado empíricamente en alemán e inglés.
- Control de la prosodia mediante el predictor de duración, mantenido en fp32 para no degradar el ritmo del habla.
- Ruido inyectado y longitudes latentes configurables, lo que permite reproducibilidad exacta entre ejecuciones (el autor compara fp32 e int8 con el mismo ruido y las mismas longitudes).
- Compatibilidad directa con los cargadores existentes del modelo oficial: mismos nombres de fichero, mismas entradas/salidas y mismos `tts.json`, `unicode_indexer.json` y estilos de voz.
- No dispone de tool calling, function calling, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo de TTS.

## Casos de uso

- Lectura por voz en el navegador: integración en una web o extensión mediante onnxruntime-web, descargando 111 MB de pesos y sintetizando en el propio cliente, sin enviar el texto a un servidor. El RTF de 0,79 en WASM con cuatro hilos permite reproducir audio más rápido que en tiempo real.
- Aplicaciones de accesibilidad offline: lectores de pantalla o asistentes para personas con discapacidad visual que deben funcionar sin conexión y en hardware modesto, gracias a un pico de RSS de 640 MB.
- Asistentes de voz en dispositivos embebidos: el tamaño de 111,3 MB y la ausencia de requisitos de GPU permiten desplegarlo en placas de un solo board o en clientes de escritorio con onnxruntime-node.
- Pre-generación de audiolibros y pódcast: síntesis por lotes en CPU en servidores sin GPU, donde el coste por hora de audio es la variable dominante y el RTF inferior a 1 abarata el procesado.
- Localización de contenido multilingüe: doblaje o generación de pistas de audio en alemán e inglés dentro de pipelines de publicación, reutilizando los estilos de voz del modelo original.
- Demos y pruebas de concepto de TTS en el navegador: al mantener el mismo contrato que los ficheros oficiales, sirve como sustituto ligero para validar interfaces y latencias antes de pasar al modelo fp32 en producción.
- Pruebas A/B de calidad de cuantización: el repositorio incluye metodología reproducible (mismo ruido, mismas longitudes latentes) útil para equipos que evalúan sus propios exports int8.

## Benchmarks y rendimiento

Medición del autor sobre 8 frases en alemán y 4 en inglés, con ruido inyectado y longitudes latentes idénticas, voz F1, 8 pasos de denosing, onnxruntime-web 1.22 WASM con 4 hilos:

| Metrica | int8 (este modelo) | fp32 original | Export int8 de la comunidad |
|---|---|---|---|
| Distancia log-mel a fp32, aleman | 3,32 | referencia | 3,76 |
| Distancia log-mel a fp32, ingles | 3,05 | referencia | 4,14 |
| WER de ASR (faster-whisper small, idioma forzado) | 0,000 | 0,013 | no disponible |
| Factor de tiempo real (RTF) | 0,79 | 0,76 | no disponible |
| Carga en frio | 1,2 s | 2,2 s | no disponible |
| RSS pico | 640 MB | 1,29 GB | no disponible |
| Tamano en disco | 111,3 MB | 398 MB | no disponible |
| Prueba de escucha a ciegas | sin diferencia audible | referencia | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni tienen sentido para un modelo de texto a voz. Las cifras anteriores provienen únicamente de la model card y no han sido replicadas de forma independiente.

## Requisitos de hardware

- VRAM: no requiere GPU. El consumo relevante es memoria RAM del proceso: 640 MB de RSS pico en la medición WASM con cuatro hilos (1,29 GB en fp32).
- GPU recomendadas: no aplica; el export está pensado para CPU. Ejecutarlo en GPU requeriría validar los operadores int8 con el proveedor de ejecución correspondiente, algo que no se documenta.
- Cabe en cualquier consumer GPU y, más relevante, en CPU de portátil, navegador de escritorio y presumiblemente en dispositivos móviles de gama media-alta, aunque el autor no publica pruebas en móvil.
- Despliegue: onnxruntime-web (WASM, probado con 4 hilos), onnxruntime-node y onnxruntime para Python. vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato ni a esta tarea.
- Latencia y throughput: RTF de 0,79 en WASM con cuatro hilos, es decir, aproximadamente 0,79 s de cómputo por segundo de audio generado; la carga en frío baja a 1,2 s. No hay datos de RTF en nativo ni con otros números de hilos.
- Almacenamiento: 111,3 MB de pesos, más los ficheros auxiliares (`tts.json`, `unicode_indexer.json` y estilos de voz) que no se cuantifican y cuyo tamaño no se detalla.

## Comparativa con modelos similares

Los datos de los modelos alternativos no provienen de la información proporcionada y se ofrecen como referencia de categoría; los de este modelo sí.

| Modelo | Parametros | Idiomas | Licencia | Formato / tamano | Notas |
|---|---|---|---|---|---|
| supertonic-3-int8 (este) | no disponible (~100 M estimados) | multilingüe, verificado en de/en | BigScience OpenRAIL-M | ONNX int8, 111,3 MB | Cuatro grafos; RTF 0,79 en WASM; restricciones OpenRAIL heredadas |
| Kokoro-82M | 82 M | multilingüe (varios paquetes de voces) | Apache-2.0 | ONNX y PyTorch | Modelo pequeno de referencia para TTS en dispositivo |
| Piper | no disponible | decenas de voces por idioma | MIT | ONNX | Basado en VITS, pensado para CPU y Raspberry Pi |
| XTTS-v2 (Coqui) | no disponible (~467 M) | multilingüe | Coqui Public Model License | PyTorch | Clonación de voz con audio de referencia; no orientado a navegador |

La ventaja de esta copia frente a las alternativas es el tamano y la ligereza en WASM; su desventaja es la licencia OpenRAIL-M, más restrictiva que Apache-2.0 o MIT, y la ausencia de un recuento de parámetros y de idiomas publicado.

## Limitaciones y advertencias

- Licencia OpenRAIL-M: las restricciones de uso del Attachment A del modelo original se aplican a esta copia y a todo lo construido con ella, y deben transmitirse en caso de redistribución. No es una licencia permisiva tipo Apache o MIT; conviene revisar el texto antes de un uso comercial.
- Es un derivado no oficial: la cuantización la realiza un tercero (safwan-o) y no ha sido validada ni respaldada por Supertone Inc.
- Madurez nula: 0 descargas y 0 likes en el momento de la consulta, repositorio creado y actualizado el mismo día, sin historial de uso.
- Evaluación muy limitada: 12 frases en total (8 alemanas, 4 inglesas), una sola voz (F1) y una única prueba de escucha. No hay datos de otros idiomas, otras voces, números, siglas ni texto con puntuación compleja.
- El autor reconoce que la cuantización del predictor de duración desviaba las duraciones ~5 %, por lo que se deja en fp32; cualquier reexportación que lo cuantice degradará la prosodia.
- Dependencia de operadores: el export evita `ConvInteger` porque onnxruntime-web y onnxruntime-node no lo implementan. Otros runtimes o versiones podrían no soportar la combinación de `MatMulInteger` por tensor empleada.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de errores de pronunciación, omisiones o artefactos en texto fuera de distribución; el WER de 0,000 medido con faster-whisper no equivale a una evaluación perceptual completa.
- No hay información sobre sesgos de voz (género, acento, edad), ni sobre el tratamiento de texto tóxico o de habla no estándar.
- Los resultados de búsqueda web disponibles no contienen ningún enlace técnico relacionado con este modelo; no se ha podido contrastar la información con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/safwan-o/supertonic-3-int8
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Revisión concreta del modelo base: https://huggingface.co/Supertone/supertonic-3/tree/3cadd1ee6394adea1bd021217a0e650ede09a323
- Paper, blog, repositorio o demo del autor: no disponible
- Resultados de búsqueda web relevantes: no disponible (las búsquedas realizadas no devolvieron enlaces relacionados con el modelo)
