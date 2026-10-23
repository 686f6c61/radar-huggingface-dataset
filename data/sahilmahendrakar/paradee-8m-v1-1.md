# sahilmahendrakar/Paradee-8M-v1.1

## Resumen

Paradee-8M v1.1 es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por sahilmahendrakar, destilado del modelo Kokoro-82M. Cuenta con 7,88 millones de parámetros y sintetiza una única voz, la `af_heart` de Kokoro. No es un modelo de lenguaje: su entrada son identificadores de fonemas y su salida es una forma de onda de audio a 24 kHz. Su interés radica en que comprime un modelo de 82 M de parámetros en un grafo ONNX de 8,5 MB en int8, ejecutable en CPU sin GPU.

La versión 1.1 sustituye la parte final del decodificador de la v1.0 —el generador de audio y el filtro de fase posteriores— por una cabeza nueva que trabaja íntegramente a 80 tramas por segundo y nunca hace sobremuestreo. Según el autor, esto la hace más de tres veces más rápida que la v1.0, mantiene la tasa de error de palabra y reduce el zumbido en sonidos sonoros. En la práctica ronda 62 veces el tiempo real en un solo hilo de CPU (unos 16 ms por segundo de audio) en un Apple M4 Pro.

Es relevante para quien necesite TTS de baja latencia, offline y con requisitos de memoria mínimos: narración en dispositivos de borde, interfaces de voz sin conectividad o generación de audio a gran escala donde el coste por hora de CPU importa más que la variedad de voces. El precio es una sola voz, un solo idioma y una calidad algo por debajo de su modelo profesor (UTMOS 4,39 frente a 4,52).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS neuronal en dos mitades (lado de texto y decodificador con cabeza armónica/de ruido), exportado como un único grafo ONNX de fonemas a audio; no es un transformer de lenguaje |
| Parámetros totales | 7,88 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Máximo de 512 tokens de fonemas por frase, incluidos los tokens de relleno (`0`) en cada extremo |
| Tipos de cuantización | int8 (8,5 MB) y fp32 (35 MB) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/paradee_int8.onnx`, `onnx/paradee.onnx`) y PyTorch `.pt` para las dos mitades (`pytorch/text_side.pt`, `pytorch/decoder.pt`) |
| Frecuencia de muestreo de salida | 24.000 Hz |
| Voz | Una sola, `af_heart` de Kokoro-82M |
| Entrada del grafo ONNX | `input_ids` int64 `[1, T]` (fonemas) y `speed` float32 `[1]` (1.0 = velocidad normal) |
| Salida del grafo ONNX | `waveform` float32 `[1, samples]` a 24 kHz |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La model card describe el modelo como una destilación de Kokoro-82M en dos mitades. La primera, el lado de texto, es el mismo fichero que en la v1.0 y convierte identificadores de fonemas en una representación intermedia. La segunda es el decodificador, y es lo que cambia en la v1.1. Frente al generador de audio de Kokoro a anchura reducida que usaba la v1.0 —que partía de 80 tramas por segundo y aplicaba sobremuestreo progresivo hasta 24.000 muestras por segundo, con un filtro de fase añadido para corregir el zumbido resultante—, la v1.1 incorpora una cabeza que hace todo el trabajo a 80 tramas por segundo y no sobremuestrea en ningún momento.

Esa cabeza separa explícitamente dos componentes. Para los sonidos sonoros parte de ondas sinusoidales limpias en la frecuencia fundamental y en sus múltiplos enteros, y aprende una ganancia por banda de frecuencia (suavizada en frecuencia) junto con una pequeña corrección temporal; como las sinusoides ya están alineadas con el tono desde el inicio, el filtro de fase deja de ser necesario. Para el resto (respiración, sibilancia y consonantes) usa ruido aleatorio real modelado por la red, con una parte de ese ruido pulsando al ritmo del tono y una segunda ruta de ruido que opera en pasos de 3 ms para no emborronar consonantes agudas ni inicios de palabra. No se detallan en la información disponible el volumen de datos de entrenamiento, la composición del corpus ni si hubo ajuste con RLHF o DPO; el artículo citado (arXiv 2610.06817) describe la v1.0, no la v1.1.

Un detalle operativo importante: el grafo ONNX empieza en fonemas, no en texto. La conversión de grafemas a fonemas es externa y debe usar el formato de misaki, la librería de Kokoro, porque es lo único que el modelo vio en entrenamiento. El grafo, además, genera su propio ruido aleatorio, de modo que dos ejecuciones sobre el mismo texto difieren ligeramente en las partes ruidosas.

## Capacidades

- Síntesis de voz en inglés a partir de texto fonemizado, con salida de forma de onda a 24 kHz.
- Control de velocidad mediante la entrada `speed` (float32, 1.0 = velocidad normal).
- Ejecución en CPU pura: unas 62 veces el tiempo real en un solo hilo, sin GPU.
- Huella mínima: 8,5 MB en int8, lo que permite empaquetarlo dentro de aplicaciones de escritorio, móviles o web.
- Integración en navegador mediante `tokenizer.json`, en el formato que cargan transformers.js y kokoro-js; el repositorio incluye `web/misaki.js` para convertir la notación de eSpeak NG a la de misaki.
- Exportación a un único grafo ONNX (fonemas a audio), apto para ONNX Runtime en distintos backends.
- API de Python (`Paradee`, `SAMPLE_RATE`) y CLI (`python -m paradee "texto" -o salida.wav`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada: es exclusivamente un modelo TTS.
- No dispone de selección de voz, emoción ni etiquetas SSML documentadas.

## Casos de uso

- Lectura de contenido en dispositivos de borde: con 8,5 MB en int8 y ejecución en un hilo de CPU, el modelo cabe en una Raspberry Pi o en un móvil y puede narrar artículos o notificaciones sin conexión ni acelerador.
- Accesibilidad en aplicaciones de escritorio: lectores de pantalla y herramientas de apoyo que necesitan latencia baja (16 ms por segundo de audio) y no pueden depender de una API en la nube.
- Interfaces de voz interactivas: asistentes por turnos donde la respuesta hablada debe empezar casi de inmediato; la velocidad de 62x sobre tiempo real deja margen para el resto del pipeline (ASR, lógica de diálogo).
- TTS en el navegador: cargando el modelo con transformers.js o kokoro-js y fonemizando en cliente, se evita enviar texto del usuario a un servidor; la conversión con `web/misaki.js` reduce la tasa de error de palabra percibida del 31% al 2% según el autor.
- Generación de audio a gran escala con coste de CPU: audiolibros, resúmenes hablados o podcasts automatizados donde el coste por hora de audio es el factor dominante y una única voz es aceptable.
- Pruebas de regresión de pipelines de voz en CI: al ser determinista en la estructura y muy rápido, sirve para validar integraciones de ASR/TTS y medir WER sin consumir GPU en cada commit.
- Señalización y avisos en sistemas embebidos o kioscos: mensajes cortos pregrabados dinámicamente (estados de máquina, alarmas, turnos) donde no hay red ni espacio para un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre las mismas 200 frases reservadas. La velocidad se mide en un solo hilo de CPU de un Apple M4 Pro, expresada como múltiplo del tiempo real.

| Métrica | Paradee v1.1 | Paradee v1.0 | Kokoro-82M (profesor) |
|---|---|---|---|
| Parámetros | 7,88 M | ~8 M | 82 M |
| UTMOS | 4,39 | 4,41 | 4,52 |
| Tasa de error de palabra (WER) | 5,9% | 5,7% | 5,7% |
| Energía en múltiplos del tono frente a puntos intermedios, 2–4 kHz | 3,9 dB | 1,3 dB | 3,1 dB |
| Velocidad en CPU (x tiempo real) | ~62x | ~18x | No disponible |
| Tamaño de pesos int8 | 8,5 MB | No disponible | 325 MB (referencia de la model card) |

La métrica de 2–4 kHz es la que el autor usa para cuantificar el zumbido en voces sonoras, que el UTMOS no detecta: mide cuánta energía se concentra en los múltiplos del tono frente a los puntos intermedios, de modo que un valor mayor indica un sonido sonoro más limpio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, lógicamente, por no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en cualquier cuantización; el modelo no necesita GPU.
- GPU recomendadas: ninguna en particular; funciona en CPU. Cualquier GPU moderna (RTX 4090, A100, H100) puede ejecutarlo, pero no aporta una ventaja clara frente a CPU para este tamaño.
- Cabe en GPU de consumo y en hardware mucho más modesto: sí, incluidos dispositivos de borde y navegadores.
- Rendimiento de referencia: unas 62 veces el tiempo real en un hilo de CPU de Apple M4 Pro, es decir, unos 16 ms por segundo de audio generado.
- Opciones de despliegue: ONNX Runtime como backend principal, el paquete de Python del repositorio (`pip install git+https://github.com/sahilmahendrakar/paradee`), la CLI incluida, y transformers.js o kokoro-js para entornos web.
- No aplicable: vLLM, TGI, llama.cpp u Ollama no soportan este formato ni esta tarea.
- Throughput y latencia: no se han publicado curvas de throughput para lotes grandes ni mediciones en otras CPU; los únicos datos disponibles son los de un hilo en M4 Pro.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Voces | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Paradee-8M v1.1 | 7,88 M | Máx. 512 tokens de fonemas | Inglés | 1 (`af_heart`) | Apache 2.0 | HuggingFace, ONNX + PyTorch |
| Paradee-8M v1.0 | ~8 M | Máx. 512 tokens de fonemas (no confirmado) | Inglés | 1 | Apache 2.0 | HuggingFace |
| Kokoro-82M | 82 M | No disponible en la información | Inglés (según la model card de Paradee) | No disponible | No disponible en la información | HuggingFace |

Frente a la v1.0, la v1.1 es más de tres veces más rápida con el mismo WER y mejor métrica de energía armónica, a costa de 0,02 puntos de UTMOS. Frente a Kokoro-82M, pierde algo de calidad objetiva y toda la variedad de voces, pero reduce el tamaño de 325 MB a 8,5 MB y multiplica la velocidad en CPU. No se dispone de datos de otros modelos TTS pequeños comparables en la información proporcionada.

## Limitaciones y advertencias

- Una sola voz: no hay selección de hablante, género, acento ni emoción. Todo lo que se genere sonará a `af_heart`.
- Solo inglés: no hay soporte declarado de otros idiomas; introducir texto en castellano producirá una pronunciación incorrecta.
- Dependencia crítica de la fonemización: el modelo solo entiende fonemas en la notación de misaki. Con la fonemización de eSpeak NG sin la conversión incluida, el autor reporta que Whisper malinterpreta alrededor del 31% de las palabras, frente al 2% con la conversión.
- Calidad por debajo del profesor: UTMOS 4,39 frente a 4,52 y WER 5,9% frente a 5,7%. La v1.1 además baja ligeramente el UTMOS respecto a la v1.0.
- Salida no determinista en las partes ruidosas: el grafo ONNX dibuja su propio ruido, así que dos ejecuciones del mismo texto no producen muestras idénticas.
- Límite de 512 tokens de fonemas por petición, incluidos los tokens de relleno; los textos largos deben trocearse y concatenarse, con el riesgo de artefactos en las uniones.
- Riesgo de errores de pronunciación en nombres propios, siglas, siglas médicas, unidades y neologismos: el equivalente en TTS a la alucinación es una palabra mal pronunciada, omitida o repetida, y no hay mecanismo de confianza para detectarlo.
- Sin control fino de prosodia: solo existe el parámetro `speed`; no hay SSML, pausas explícitas ni énfasis documentados.
- Sesgo de representación: al derivar de una única voz, el modelo no cubre diversidad de hablantes ni de variedades del inglés.
- Licencia Apache 2.0 en este repositorio, lo que permite uso comercial, pero conviene revisar las condiciones del modelo base Kokoro-82M antes de distribuir derivados, ya que la información disponible no detalla su licencia.
- El artículo citado (arXiv 2610.06817) documenta la v1.0; los cambios de la v1.1 solo están descritos en la model card, sin publicación revisada por pares ni mediciones en hardware distinto al del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.1
- Modelo base (Kokoro-82M): https://huggingface.co/hexgrad/Kokoro-82M
- Versión anterior (Paradee-8M v1.0): https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.0
- Artículo (describe la v1.0): https://huggingface.co/papers/2610.06817
- Repositorio de código, scripts de entrenamiento y paquete de Python: https://github.com/sahilmahendrakar/paradee
- Release v1.0: https://github.com/sahilmahendrakar/paradee/releases/tag/v1.0
- Conversor de fonemas para navegador: https://github.com/sahilmahendrakar/paradee/blob/main/web/misaki.js
- Librería de fonemización misaki: https://github.com/hexgrad/misaki
- Muestras de audio y frases de referencia: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.1/tree/main/samples
