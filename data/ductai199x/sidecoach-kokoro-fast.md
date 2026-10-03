# ductai199x/sidecoach-kokoro-fast

## Resumen

`ductai199x/sidecoach-kokoro-fast` es una exportacion ONNX cuantizada del modelo de texto a voz Kokoro-82M, publicada por el desarrollador Tai Duc Nguyen (usuario ductai199x). Se trata concretamente del fichero `kokoro-v1.0-q8.onnx`, derivado del export `kokoro-v1.0.onnx` que genera kokoro-onnx (model-files-v1.0), y su objetivo es reducir el coste de computo de la sintesis de voz en CPUs de telefonia movil (Android). Mantiene exactamente las mismas entradas que el modelo original (`tokens`, `style`, `speed`) y el mismo fichero de voces (`voices-v1.0.bin`), por lo que es un reemplazo directo en cualquier pipeline donde ya se ejecutase Kokoro.

El modelo base, Kokoro-82M, es un TTS de pesos abiertos con 82 millones de parametros que logra una calidad de voz comparable a modelos mucho mayores manteniendo un coste bajo. Esta version concreta no cambia la topologia ni reentrena pesos: aplica cuantizacion de 8 bits (INT8) sobre las convoluciones del decodificador y deja en fp16 la ultima etapa del generador. Segun el autor, en un Pixel 10 Pro XL con ONNX Runtime 1.30 y 5 hilos, este export sintetiza a 0,31 del tiempo real (factor de tiempo real, RTF) frente a 0,70 del modelo en precision completa.

Su relevancia es practica: permite ejecutar un TTS de calidad competitiva de forma local y offline en telefonos, con un consumo de memoria reducido, sin depender de APIs en la nube. La licencia es Apache-2.0, igual que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Kokoro-82M (cadena text encoder + prosody predictor + decodificador/generador con resblocks, STFT e InstanceNormalization); export ONNX |
| Parametros totales | 82 millones (heredados de Kokoro-82M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a voz; procesa texto de entrada, no ventanas de contexto) |
| Tipos de cuantizacion | INT8 (estatica, QDQ, pesos por canal) en las convoluciones del decodificador; fp16 en la ultima etapa del generador (resblocks 3-5) |
| Idiomas soportados | no disponible en la ficha; el modelo base Kokoro admite voicepacks en varios idiomas (ver comparativa) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (cuantizado); fichero `kokoro-v1.0-q8.onnx`; fichero de voces `voices-v1.0.bin` |

## Arquitectura y entrenamiento

El export conserva la arquitectura de Kokoro-82M tal como la genera kokoro-onnx: un codificador de texto, un predictor de prosodia, un decodificador vocacional con resblocks y una STFT. Sobre esa base, el autor ha aplicado tres modificaciones orientadas a CPU movil. Primera, las convoluciones del decodificador se ejecutan en 8 bits con cuantizacion estatica QDQ, pesos por canal y activaciones calibradas sobre 24 frases cortas de entrenamiento ("coaching sentences"). Segunda, la ultima etapa del generador (resblocks 3-5) se mantiene en fp16 porque en 8 bits produce un ruido tonal cercano a 11 kHz. Tercera, se fusionan 65 instance norms, que en el export original se componen de operaciones pequenas, en una unica operacion `InstanceNormalization`, y `Pow(x, 2)` se sustituye por `x * x`.

El codificador de texto, el predictor de prosodia y la STFT se dejan intactos: el autor senala expresamente que la STFT no se toca porque el decodificador utiliza la fase de bins cercanos a cero y cualquier reescritura, incluso exacta, altera el sonido. No consta reentrenamiento ni ajuste fino con RLHF/DPO; es una optimizacion de inferencia sobre pesos existentes. La verificacion de calidad se hizo comparando cada linea de voz con la del modelo en precision completa sobre frases no vistas: exceso de energia en 10-12 kHz de +0,1 dB y distancia log-mel media sobre tramas de voz de 1,41 dB. El tramo en fp16 se midio sobre voz generada por el propio telefono, porque una CPU de sobremesa calcula fp16 en fp32. En una prueba A/B a ciegas sobre telefono, el oyente no distinguio las dos versiones.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto tokenizado, con control de estilo mediante vector `style` y control de velocidad mediante el parametro `speed`.
- Generacion local en dispositivo (Android) sin conexion a red.
- Reemplazo directo de Kokoro-82M: acepta las mismas entradas y el mismo fichero de voces, por lo que no requiere adaptar el codigo de integracion.
- Salida de audio con calidad perceptualmente indistinguible del modelo en precision completa segun la prueba A/B del autor.
- Soporte de multiples voces a traves del fichero `voices-v1.0.bin` del ecosistema Kokoro (la asignacion concreta de voces e idiomas depende del modelo base, no de esta ficha).
- No dispone de tool calling, function calling, razonamiento multi-paso, vision ni audio de entrada: es exclusivamente un modelo generativo de voz.
- Capacidades multilingues: no especificadas en esta ficha; dependen de los voicepacks del modelo base.

## Casos de uso

- Lectura por voz offline en aplicaciones Android: el modelo cabe en el almacenamiento de un telefono (repositorio de 0,2 GB) y sintetiza sin conexion, lo que permite funciones de accesibilidad (lectura de pantalla, mensajes, articulos) sin coste de API ni dependencia de red.
- Asistentes de entrenamiento o "coaching" por voz: el autor calibro las activaciones con frases cortas de coaching, y el RTF de 0,31 en un Pixel 10 Pro XL permite reproducir instrucciones e indicaciones en tiempo casi real dentro de una app de entrenamiento.
- Audiolibros y contenido largo en movil: dado que el modelo base se usa para generar horas de voz en minutos en servidor, esta variante permite pre-generar o generar bajo demanda fragmentos largos en el propio dispositivo.
- Sistemas de navegacion y avisos por voz en tiempo real: el bajo RTF en CPU libera ciclos frente al modelo en precision completa (0,70), lo que reduce el riesgo de solapamiento entre la sintesis y otros procesos de la app.
- Prototipado rapido de interfaces de voz: al ser un drop-in de kokoro-onnx y compartir entradas y fichero de voces, se puede integrar en entornos de prueba sin cambiar el pipeline y validar despues el salto a servidor.
- Despliegue embebido con recursos limitados: la cuantizacion INT8 reduce el peso y la memoria del decodificador, lo que facilita ejecutar TTS en dispositivos con poca RAM o en entornos de un solo hilo.
- Envoltorio servidor compatible con OpenAI: el ecosistema kokoro-onnx / Kokoro-FastAPI expone un endpoint de habla compatible con la API de OpenAI, de modo que este fichero puede servir como backend de un servicio TTS self-hosted.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un modelo de texto a voz. La model card aporta las siguientes mediciones:

| Metrica | Valor |
|---|---|
| RTF en Pixel 10 Pro XL (ONNX Runtime 1.30, 5 hilos) | 0,31 del tiempo real |
| RTF del modelo en precision completa (misma prueba) | 0,70 del tiempo real |
| Exceso de energia en 10-12 kHz durante el habla | +0,1 dB |
| Distancia log-mel media sobre tramas de voz | 1,41 dB |
| Prueba A/B a ciegas en telefono | el oyente no distingue ambas versiones |

## Requisitos de hardware

- Inferencia en CPU: disenado para CPUs de telefono movil; probado en un Pixel 10 Pro XL con ONNX Runtime 1.30 y 5 hilos.
- VRAM de GPU: no aplica; el objetivo es ejecucion en CPU. El repositorio completo ocupa 0,2 GB.
- GPU recomendadas: no disponibles para este export; el modelo esta pensado para CPU. No se documentan requisitos de A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no documentada en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (version validada 1.30); kokoro-onnx como runtime de referencia; envoltorios compatibles con OpenAI como Kokoro-FastAPI para servir el modelo. No aplican vLLM, TGI, llama.cpp ni Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: RTF de 0,31 en la configuracion indicada, frente a 0,70 del modelo sin cuantizar, lo que supone aproximadamente 2,3 veces mas rapido en ese dispositivo.
- Memoria: el peso cuantizado (INT8 en el decodificador, fp16 en la ultima etapa) reduce el uso de memoria respecto al export en precision completa, aunque la ficha no publica cifras exactas de RAM en ejecucion.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | RTF (Pixel 10 Pro XL) | Licencia | Notas |
|---|---|---|---|---|---|
| ductai199x/sidecoach-kokoro-fast (este modelo) | 82 M | ONNX INT8 + fp16 | 0,31 | Apache-2.0 | Optimizado para CPU de telefono |
| hexgrad/Kokoro-82M (export ONNX de kokoro-onnx, precision completa) | 82 M | ONNX fp32 | 0,70 | Apache-2.0 | Referencia de calidad, sin cuantizar |
| Otros TTS de pesos abiertos (Piper, XTTS, etc.) | no disponible | no disponible | no disponible | no disponible | Sin datos comparables en la informacion proporcionada |

La comparativa directa mas fiable es con el propio export en precision completa del que deriva, ya que no se dispone de mediciones de terceros en la misma prueba de hardware.

## Limitaciones y advertencias

- La cuantizacion INT8 puede introducir degradacion sutil; el autor solo valida la fidelidad perceptiva y la energia en 10-12 kHz, con una distancia log-mel de 1,41 dB, pero no garantiza paridad bit a bit.
- Las mediciones de rendimiento (RTF 0,31) provienen de un unico dispositivo (Pixel 10 Pro XL, ONNX Runtime 1.30, 5 hilos); en otros telefonos, versiones de runtime o numeros de hilos el rendimiento puede diferir.
- Las activaciones del decodificador se calibraron sobre 24 frases cortas de coaching; este conjunto reducido puede no representar todos los dominios de texto y afectar a la calidad en entradas muy distintas.
- No es un modelo de lenguaje: no realiza razonamiento, generacion de texto, codigo, matematicas, vision ni tool calling.
- Idiomas soportados no especificados en la ficha; la cobertura multilingue depende de los voicepacks del modelo base y debe verificarse antes de usarlo en produccion.
- Riesgo de alucinacion: no aplica en el sentido de texto inventado, pero un TTS puede pronunciar de forma incorrecta palabras fuera de dominio (nombres propios, siglas, numeros).
- Licencia Apache-2.0, que permite uso comercial; el autor reconoce que es una copia modificada del export ONNX de Kokoro-82M y atribuye el modelo y las voces a hexgrad.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion ni validacion externa.
- Fecha del repositorio: creado y actualizado el 2026-10-03 (segun los metadatos de HuggingFace).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ductai199x/sidecoach-kokoro-fast
- Perfil del autor: https://huggingface.co/ductai199x
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio kokoro-onnx (origen del export): https://github.com/thewh1teagle/kokoro-onnx
- Repositorio hexgrad/kokoro: https://github.com/hexgrad/kokoro
- Envoltorio Kokoro-FastAPI (compatible con OpenAI): https://github.com/remsky/Kokoro-FastAPI
- Ficha de Kokoro 82M en Vast.ai: https://vast.ai/model/kokoro
