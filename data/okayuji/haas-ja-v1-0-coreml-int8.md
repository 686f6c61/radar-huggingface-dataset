# okayuji/Haas-ja-v1.0-CoreML-INT8

## Resumen

Haas-ja-v1.0-CoreML-INT8 es una conversión a Core ML del modelo de reconocimiento automático de voz (ASR) en japonés Haas-ja-v1.0, desarrollado originalmente por third-intelligence y empaquetado por el usuario okayuji. El paquete contiene un codificador FastConformer cuantizado a INT8 que se ejecuta en el Apple Neural Engine (ANE), junto con las redes decoder y joint en FLOAT32, el vocabulario y las constantes de preprocesado necesarias para construir un pipeline completo. Está pensado para dictado en japonés en local sobre Apple Silicon, y es el conjunto de archivos que descarga la aplicación KeyVoice for Mac.

El modelo base es un sistema ASR de tipo TDT (Token-and-Duration Transducer) con arquitectura FastConformer de 24 capas y ventana fija de 15,04 segundos. La conversión se realizó con coremltools 9.0 a partir del checkpoint oficial `.nemo`, manteniendo una calidad prácticamente idéntica a la referencia: el CER en FLEURS ja_jp test es de 3,664 % (estricto), frente al 3,683 % del modelo de referencia NeMo en fp32 sobre CPU. El repositorio ocupa 0,6 GB y la licencia es Apache 2.0.

Este paquete no incluye código de inferencia: es un conjunto de artefactos (`.mlpackage`, vocabulario y ficheros de constantes) para desarrolladores que quieran replicar exactamente el pipeline validado o integrarlo en sus propias aplicaciones. Para código listo para ejecutar en Swift o Python, el autor remite a un repositorio separado (Sanami/haas-ja-coreml). Su relevancia actual radica en que demuestra ASR en japonés de calidad cercana a la referencia ejecutándose íntegramente en el Neural Engine de un Mac, con latencias de decenas de milisegundos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer + TDT (Token-and-Duration Transducer); codificador de 24 capas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana fija de 15,04 s de audio (1.504 frames mel); audio más largo se procesa por ventanas con solapamiento descartado de 208 frames (2,08 s) por borde interno |
| Tipos de cuantización | codificador INT8 (lineal simétrica, por canal); decoder, joint_enc y joint en FLOAT32 |
| Idiomas soportados | japonés (ja) únicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML `.mlpackage` (encoder, decoder, joint_enc, joint); `vocab.json`; `window.f32`; `mel_filter.f32`; `frontend.json` |

## Arquitectura y entrenamiento

El modelo es un transducer TDT con codificador FastConformer de 24 capas. La conversión a Core ML fija una ventana de entrada de 15,04 s: el codificador recibe `audio_signal` Float32 `[1, 128, 1504]` y `length` Int32 `[1]`, y produce `encoded` Float32 `[1, 1024, 188]`. El decoder mantiene estado recurrente (`rec` y `conv` de forma `[2, 1, 20480]`) y el joint emite `token_id` (3.073 clases, blank = 3072) y `duration_id` (0 a 4 frames). El preprocesado, registrado en `frontend.json`, es: audio mono a 16 kHz en float32, pre-énfasis 0.97, `n_fft` 512, ventana de 400 muestras, hop 160, 128 bins mel y sin dither en inferencia. La decodificación es greedy TDT con las reglas de label-looping de NeMo y un máximo de 10 símbolos por frame.

La conversión se hizo con coremltools 9.0 a partir de `Haas-ja-v1.0.nemo` (revisión `660728d`). El codificador se convirtió a FLOAT16 y se cuantizó a INT8; el resto de redes permanece en FLOAT32. Respecto a la conversión de referencia Sanami/haas-ja-coreml, los pesos de decoder, joint_enc y joint son idénticos byte a byte, y los pesos INT8 del codificador difieren en 105 de 594.211.328 bytes, cada uno en un paso de cuantización. No se detalla en la información disponible el volumen de datos de entrenamiento ni si se aplicaron etapas de RLHF o ajuste fino posteriores al entrenamiento del modelo base.

## Capacidades

- Reconocimiento automático de voz (ASR) en japonés, con salida de transcripción textual.
- Decodificación TDT con predicción conjunta de token y duración (0 a 4 frames por paso), lo que permite avanzar varios frames por símbolo.
- Procesamiento de audio de duración arbitraria mediante ventanas de 15,04 s con descarte de 208 frames en cada borde interno y concatenación de los frames del codificador conservados.
- Ejecución del codificador en el Apple Neural Engine (unidades `cpuAndNeuralEngine`); decoder, joint_enc y joint en CPU (`cpuOnly`).
- Vocabulario SentencePiece de 3.072 piezas, listado en `vocab.json` en orden de ID.
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá del propio ASR ni modo de razonamiento: es un modelo especializado exclusivamente en transcripción de voz.

## Casos de uso

- Dictado en local en macOS e iOS: integrar los cuatro `.mlpackage` en una app Swift y ejecutar el codificador en el Neural Engine para transcripción en tiempo real sin enviar audio a la nube, con latencias medidas de 31 ms para una locución de 4,57 s en modo continuo.
- Subtitulado y transcripción de reuniones en japonés: procesar audio largo por ventanas de 15,04 s con el solapamiento descartado de 2,08 s por borde, concatenando los frames del codificador para obtener una transcripción continua.
- Asistentes de voz embebidos: usar el paquete como motor ASR de un asistente de escritorio o móvil en japonés, aprovechando que el proceso añade solo 672 MiB de footprint al cargar y transcribir.
- Investigación en eficiencia de ASR: reproducir el pipeline de referencia en Python con coremltools 9.0 y comparar el CER frente al modelo NeMo en fp32, dado que el autor documenta las diferencias byte a byte de los pesos cuantizados.
- Evaluación de cuantización INT8 en ANE: emplear este paquete como caso de estudio de cuantización lineal simétrica por canal en un codificador FastConformer, con métricas de calidad (CER 3,664 % estricto) y de rendimiento (RTFx 280) publicadas.
- Desarrollo de pipelines ASR propios: partir de `frontend.json`, `window.f32` y `mel_filter.f32` para implementar el preprocesado y la decodificación exactos que el autor validó, sin depender del código de la app KeyVoice.
- Transcripción por lotes en un Mac: procesar colecciones de audio japonés con el harness de Python, con un rendimiento de 280 segundos de audio por segundo de proceso en las 50 locuciones de FLEURS medidas.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en un Apple M5 Max con 128 GB y macOS 27.2.1 los días 2026-11-15 y 2026-11-16. "Python" es un harness de coremltools 9.0 con el codificador en CPU_AND_NE; "App" es el pipeline Swift de KeyVoice en build Debug.

| Métrica | Este paquete | Referencia (NeMo 2.7.3, fp32, CPU) | Model card oficial (bf16, H200) |
|---|---|---|---|
| CER FLEURS ja_jp test, 650 locuciones (estricto) | 3,664 % | 3,683 % | 3,67 % |
| CER FLEURS ja_jp test (flex) | 2,957 % | 3,009 % | 2,98 % |
| CER FLEURS ja_jp test (kana) | 2,330 % | 2,376 % | 2,34 % |

| Métrica de rendimiento | Valor | Medido con |
|---|---|---|
| RTFx global, 50 locuciones FLEURS | 280 | Python |
| Codificador, una ventana de 15,04 s | 25,3 ms | Python |
| Locución de 4,57 s, extremo a extremo | 31 ms continuo; 116 ms primera tras 20 s o más inactivo | App |
| Locución de 28,2 s, extremo a extremo | 103 ms continuo; 196 ms primera tras 20 s o más inactivo | App |
| Primera carga en una máquina | 7,8 s (Python); unos 10 s (App) | Incluye preparación en dispositivo para el Neural Engine |
| Cargas posteriores | 0,10 s (Python); 0,16 s (App) | — |
| Footprint de proceso añadido por carga y una transcripción | 672 MiB | App, `phys_footprint` |

## Requisitos de hardware

- Plataforma: Apple Silicon exclusivamente; macOS 14 o iOS 17 y posteriores según el formato del paquete.
- El codificador está pensado para ejecutarse en el Apple Neural Engine (`cpuAndNeuralEngine`); decoder, joint_enc y joint en CPU (`cpuOnly`).
- No se especifican requisitos de VRAM ni de GPU NVIDIA/AMD: el paquete Core ML no se ejecuta en esas plataformas.
- Tamaño del repositorio: 0,6 GB; el codificador INT8 ocupa 594.906.238 bytes, el decoder 17.260.901 bytes y el resto de paquetes completa el conjunto.
- Footprint de proceso medido: 672 MiB adicionales al cargar y transcribir una locución.
- Mediciones realizadas únicamente en un Mac con M5 Max y 128 GB; el autor no publica datos para otros chips Apple.
- Opciones de despliegue: coremltools para Python (inspección y ejecución), integración nativa en Swift/Core ML; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: RTFx 280 en Python; 31 ms y 103 ms extremo a extremo para locuciones de 4,57 s y 28,2 s respectivamente en la app.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto / ventana | Calidad medida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| okayuji/Haas-ja-v1.0-CoreML-INT8 | FastConformer TDT, Core ML INT8 | Japonés | 15,04 s por ventana | CER 3,664 % (FLEURS ja_jp, estricto) | Apache 2.0 | Hugging Face, formato Core ML |
| third-intelligence/Haas-ja-v1.0 | FastConformer TDT, NeMo | Japonés | no disponible | CER 3,67 % (bf16, H200) | Apache 2.0 (según modelo base) | Hugging Face, pesos NeMo |
| Sanami/haas-ja-coreml | FastConformer TDT, Core ML | Japonés | no disponible | no disponible | no disponible | Hugging Face, incluye código Swift/Python |
| NeMo 2.7.3 fp32 (referencia del autor) | FastConformer TDT, fp32 | Japonés | no disponible | CER 3,683 % (FLEURS ja_jp, estricto) | no disponible | Ejecución en CPU |

## Limitaciones y advertencias

- Solo reconoce japonés; no hay soporte multilingüe.
- No incluye código de inferencia: por sí solo no permite ejecutar reconocimiento de voz. Es necesario implementar el pipeline o usar el repositorio Sanami/haas-ja-coreml.
- Requiere Apple Silicon y macOS 14 o iOS 17 o posteriores; no es desplegable en GPU NVIDIA, AMD ni en entornos Linux/Windows convencionales.
- Las mediciones de rendimiento provienen de un único equipo (M5 Max, 128 GB, macOS 27.2.1); el autor no publica cifras para otros chips Apple, por lo que la latencia en modelos inferiores puede diferir.
- El codificador está cuantizado a INT8, lo que introduce una diferencia mínima frente a la referencia (105 bytes distintos de 594.211.328 en los pesos), aunque el impacto en CER medido es nulo o favorable en los datos publicados.
- El procesamiento por ventanas descarta 208 frames en cada borde interno; audio con cortes en palabras justo en esos límites podría degradar la transcripción.
- No se documentan sesgos específicos del modelo ni tasas de alucinación en la información disponible; como todo sistema ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no representados.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base third-intelligence/Haas-ja-v1.0 y de los datos de entrenamiento originales antes de un despliegue en producción.
- El paquete está marcado con `inference: false` en la model card: no está pensado para ejecutarse directamente desde el repositorio sin construir el pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/okayuji/Haas-ja-v1.0-CoreML-INT8
- Modelo base: https://huggingface.co/third-intelligence/Haas-ja-v1.0
- Conversión Core ML con código listo para ejecutar: https://huggingface.co/Sanami/haas-ja-coreml
- KeyVoice for Mac: https://www.tukuru-app.com/keyvoice/en/
- coremltools: no disponible en la información proporcionada
- NeMo: no disponible en la información proporcionada
