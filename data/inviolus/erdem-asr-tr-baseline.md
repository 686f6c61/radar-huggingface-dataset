# inviolus/erdem-asr-tr-baseline

## Resumen

erdem-asr-tr-baseline es un reconocedor automático de habla (ASR) de tamaño minúsculo para turco, entrenado desde cero por el usuario de HuggingFace "inviolus". Con solo 63.955 parámetros, está pensado como línea base de investigación para explorar hasta dónde llega un modelo de CTC a nivel de carácter con un tamaño apto para microcontroladores (tinyml), no como transcriptor utilizable en producción.

La arquitectura es deliberadamente sencilla: una convolución 1D sobre espectrogramas log-mel de 40 bandas, una GRU bidireccional y una capa densa de salida con pérdida CTC a nivel de carácter y decodificación greedy. Se ha entrenado sobre 100.000 clips de Mozilla Common Voice (turco) y del ISSAI Turkish Speech Corpus.

Su relevancia es principalmente didáctica y de investigación: los propios autores advierten que alrededor de la mitad de los caracteres que emite son erróneos y que casi ninguna palabra sale bien (WER superior al 100 %). Publicar una línea base tan explícitamente limitada sirve como punto de referencia honesto para trabajos posteriores de ASR ultraligero en turco y, por extensión, en otras lenguas con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conv1D(48, kernel 5, stride 2) → GRU bidireccional(64) → Dense(64) → Dense(35, softmax), con pérdida CTC |
| Parametros totales | 63.955 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de frames de audio; salida = frames/2) |
| Tipos de cuantizacion | no disponible (pesos en fp32 implícito vía Keras) |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | `.keras` (Keras/TensorFlow) |

## Arquitectura y entrenamiento

El modelo es un ASR a nivel de carácter basado en CTC. El pipeline de entrada convierte audio mono a 16 kHz en un espectrograma log-mel de 40 bandas (`n_fft=640`, `hop_length=320`, `power=2.0`, conversión a dB con referencia al máximo, relleno con −80.0 para silencio). Sobre esas características aplica una Conv1D de 48 filtros con kernel 5 y stride 2 (que reduce la resolución temporal a la mitad), seguida de una GRU bidireccional de 64 unidades, una capa densa de 64 y una cabeza softmax de 35 clases: 34 símbolos del alfabeto turco (incluyendo espacio, apóstrofo y caracteres como ç, ğ, ı, ö, ş, ü) más el token blank de CTC. La decodificación es greedy CTC, sin modelo de lenguaje.

El entrenamiento se realizó en varias ejecuciones encadenadas, cada una inicializada en caliente (warm-start) desde la anterior. La última (v11, 25 de octubre de 2026) entrenó 18 épocas sobre 100.000 clips procedentes de Common Voice turco (Scripted Speech 27.0, CC0) y del ISSAI Turkish Speech Corpus (MIT, ISSAI – Nazarbayev University), alcanzando una mejor pérdida de validación de 51,66. No hay indicios de uso de técnicas como RLHF, decodificación especulativa ni atención lineal; el interés del proyecto radica precisamente en su minimalismo extremo.

## Capacidades

- Transcripción de habla en turco a nivel de carácter, con decodificación greedy CTC.
- Procesamiento de audio mono a 16 kHz mediante espectrogramas log-mel de 40 bandas.
- Tamaño extremadamente reducido (≈64.000 parámetros), potencialmente desplegable en entornos con recursos muy limitados (tinyml), aunque no hay evidencia publicada de cuantización ni de ejecución en microcontroladores.
- Salida carácter a carácter sobre un alfabeto turco de 34 símbolos más blank.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá del audio.
- No es utilizable como transcriptor de palabras: los propios autores lo declaran experimental.

## Casos de uso

- Punto de partida para investigación en ASR ultraligero: sirve como baseline reproducible sobre la que aplicar mejoras (arquitecturas mayores, modelos de lenguaje, data augmentation) y medir progresos con métricas CER/WER ya publicadas.
- Docencia y formación: su tamaño y simplicidad lo hacen ideal para enseñar el pipeline completo de CTC (features mel, Conv1D, GRU, pérdida CTC, decodificación greedy) en un modelo que se entrena y depura en minutos.
- Experimentación en tinyml: la huella de memoria es tan pequeña que puede usarse para prototipar pipelines de ASR en dispositivos con restricciones severas, previa cuantización (no documentada en el repo).
- Benchmark de referencia para turco con datos públicos: al entrenarse solo con Common Voice e ISSAI (CC0/MIT), permite comparaciones limpias y sin problemas de licencia de datos.
- Estudio de limitaciones del CTC puro sin modelo de lenguaje: el WER >100 % ilustra de forma práctica por qué la decodificación greedy a nivel de carácter es insuficiente en modelos diminutos.
- Base para transferencia a otras lenguas túrquicas: la arquitectura y el alfabeto son fácilmente adaptables a lenguas vecinas, siguiendo la línea del corpus ISSAI para lenguas túrquicas.

## Benchmarks y rendimiento

Resultados publicados por el autor (decodificación greedy, 500 clips por conjunto, ejecución v11, 2026-10-25):

| Test set | CER | Precisión de caracteres | WER |
|---|---:|---:|---:|
| Common Voice turco scripted (held-out) | 45,6 % | 54,4 % | 102,0 % |
| ISSAI Turkish Speech Corpus (test) | 46,3 % | 53,7 % | 101,5 % |

Un WER superior al 100 % significa que el modelo inserta más palabras incorrectas de las que contiene la referencia; la salida a nivel de palabra no es utilizable. No hay comparaciones publicadas con otros modelos ASR.

## Requisitos de hardware

- VRAM para inferencia: despreciable; con 63.955 parámetros en fp32 el modelo ocupa menos de 0,3 MB, por lo que funciona en CPU sin GPU dedicada.
- GPU recomendadas: ninguna en concreto; cualquier GPU moderna es más que suficiente, y la inferencia en CPU es totalmente viable.
- Consumer GPU: cabe con holgura en cualquier GPU, incluso integradas; el cuello de botella es el preprocesado de audio (librosa), no el modelo.
- Opciones de despliegue: TensorFlow/Keras (código de ejemplo incluido en la model card); no hay pesos GGUF ni soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dada la arquitectura (una convolución ligera y una GRU de 64 unidades), la latencia por clip corto debería ser de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Rendimiento (turco) | Licencia |
|---|---|---|---|---|
| erdem-asr-tr-baseline | 63.955 | CTC carácter, Conv1D + BiGRU, desde cero | CER ≈ 45,6–46,3 %; WER > 100 % | MIT |
| Whisper (OpenAI) | desde 39 M (tiny) a 1.550 M (large) | Transformer encoder-decoder, multitarea multilingüe | CER/WER muy inferiores; estado del arte accesible en turco | MIT (código y pesos) |
| Wav2Vec2 / MMS (Meta) | ~95–317 M según variante | Transformer auto-supervisado + fine-tuning CTC | WER sustancialmente menor en turco con fine-tuning | MIT / CC-BY-NC según variante |

La comparación es asimétrica por diseño: erdem-asr es entre tres y cuatro órdenes de magnitud más pequeño que cualquier alternativa utilizable, y su rendimiento refleja ese compromiso. Su valor está en la línea base y la reproducibilidad, no en competir con Whisper o MMS.

## Limitaciones y advertencias

- Calidad de salida muy baja: aproximadamente la mitad de los caracteres son incorrectos y el WER supera el 100 %; el modelo no sirve para transcripción real.
- Decodificación greedy sin modelo de lenguaje ni beam search, lo que agrava los errores a nivel de palabra.
- Restringido al turco; no hay soporte para otros idiomas ni para acentos no cubiertos por los datasets de entrenamiento.
- Riesgo de alucinación alto en la práctica: la inserción masiva de palabras erróneas es un comportamiento documentado, no un caso extremo.
- Sin cuantización ni validación en microcontroladores publicadas, pese a la etiqueta tinyml; cualquier despliegue embebido requiere trabajo adicional.
- Sesgos heredados de Common Voice e ISSAI (distribución demográfica y acústica de los locutores de esos corpus), no evaluados por los autores.
- Licencia MIT para los pesos, sin restricciones de uso comercial; el corpus ISSAI (MIT) requiere conservar su aviso de licencia y citar el artículo asociado; Common Voice es CC0.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/inviolus/erdem-asr-tr-baseline
- Dataset ISSAI Turkish Speech Corpus: https://huggingface.co/datasets/issai/Turkish_Speech_Corpus
- Mozilla Common Voice (Data Collective): https://datacollective.mozillafoundation.org/
- Artículo del corpus ISSAI (Mussakhojayeva et al., Information, 2023): https://www.mdpi.com/2078-2489/14/2/74
