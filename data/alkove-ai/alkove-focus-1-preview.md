# alkove-ai/alkove-focus-1-preview

## Resumen

alkove-focus-1-preview es un modelo de aislamiento de voz y mejora del habla en tiempo real desarrollado por alkove-ai, pensado para ejecutarse íntegramente en el dispositivo (navegador o teléfono) sin enviar audio a ningún servidor. Procesa audio mono a 16 kHz y devuelve la voz aislada: elimina ruido, música y otras voces, y con una huella vocal de 192 dimensiones generada por alkove-timbre-1-preview conserva únicamente a la persona objetivo, incluso si otra voz habla más alto o más cerca del micrófono. Con huella a ceros, el modelo retiene la voz más próxima al micrófono.

El modelo es deliberadamente minúsculo: alrededor de 0,8 M de parámetros, pesos int8 en un único archivo ONNX de 0,93 MB (opset 17), con estado recurrente interno de 126 848 valores float32 que se pasa entre llamadas. El procesamiento es por tramas de 256 muestras (16 ms) y añade un retardo de una trama (16 ms) sobre el propio hop, lo que lo sitúa en el rango de la conversación en vivo. Se ejecuta con onnxruntime y onnxruntime-web 1.30 o superior en un solo hilo de WebAssembly.

Su relevancia práctica está en el coste: unos 107 ms de CPU por segundo de audio en un Galaxy Z Fold8 con Chrome (aproximadamente el 11 % de un núcleo) y unos 81 ms por segundo de audio en un Mac con Apple silicon, siempre en un hilo. Es una versión preview: los pesos y la interfaz pueden cambiar antes de la versión 1. Los resultados publicados son mediciones del propio autor y están marcados como no verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; el archivo NOTICE incluye la licencia MIT de GTCRN, lo que apunta a una red convolucional-recurrente temporal agrupada derivada de esa familia. Detalle de capas no disponible |
| Parametros totales | Aproximadamente 0,8 M |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica: modelo de audio en streaming con estado recurrente de 126 848 valores float32; procesa tramas fijas de 256 muestras (16 ms) |
| Tipos de cuantizacion | Pesos int8 (un único archivo ONNX). No se publican variantes fp32, fp16 ni GGUF |
| Idiomas soportados | No disponibles. La evaluación de aislamiento con otra voz usa los test de Common Voice en 7 idiomas, pero la model card no enumera cuáles |
| Licencia | Apache-2.0 (el NOTICE conserva el aviso MIT de GTCRN) |
| Formato de pesos | ONNX, opset 17, int8; manifiesto JSON adjunto con sha256, tamaños, entradas y salidas |
| Frecuencia de muestreo | 16 kHz, mono, rango -1..1 |
| Entradas | `audio` float32 [1, 256]; `print` float32 [1, 192] (huella vocal; ceros para mantener la voz más cercana); `state` float32 [126848] |
| Salidas | `audio_out` float32 [1, 256]; `next_state` float32 [126848] |
| Tamaño del archivo | 0,93 MB |
| Tarea (pipeline) | audio-to-audio |
| Runtime | onnxruntime y onnxruntime-web 1.30 o superior (requiere el operador estándar `DFT`) |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna ni el proceso de entrenamiento. Lo que sí se documenta es el modo de ejecución: todo el cómputo ocurre dentro del grafo ONNX, incluyendo la transformada de frecuencia mediante el operador `DFT`, de forma que la persona que integra el modelo solo empuja muestras de audio y recibe muestras de audio. El estado se mantiene explícitamente en un vector de 126 848 float32 que hay que realimentar en cada llamada y reiniciar a ceros cuando se cambia la huella vocal.

El modelo está condicionado por una huella vocal de 192 dimensiones (salida `embedding` de alkove-timbre-1-preview) que actúa como selección de hablante objetivo; con la huella a ceros el comportamiento es el de selección por proximidad al micrófono. El aviso de copyright incluye la licencia MIT de GTCRN, lo que sugiere una adaptación de esa familia de modelos ultraligeros de mejora del habla. No se han publicado datos sobre volumen de entrenamiento, composición del corpus, idiomas de entrenamiento ni si hubo ajuste con datos reales de reuniones.

La innovación destacable es la relación entre capacidad y coste: aislamiento de hablante objetivo con pesos int8 en menos de 1 MB, ejecutable en un único hilo de WebAssembly con latencia de una trama. La comparación de la propia model card sitúa el modelo frente a VoxLock (27 M), DeepFilterNet 3 (2,1 M), Hush (1,8 M) y GTCRN (0,05 M), todos ellos de código abierto.

## Capacidades

- Aislamiento de voz con huella vocal: extrae la voz del hablante objetivo a partir de un `print` de 192 dimensiones, incluso cuando otra persona habla más fuerte o más cerca del micrófono.
- Modo sin huella: con `print` a ceros, conserva la voz más próxima al micrófono y descarta el resto.
- Supresión de ruido y música: mejora del habla sobre ruido de fondo, evaluada en VoiceBank+DEMAND y en el conjunto ciego del DNS Challenge 3.
- Streaming con estado: procesamiento trama a trama de 256 muestras (16 ms) con realimentación de estado, apto para audio en vivo y no solo para ficheros.
- Ejecución en el dispositivo: onnxruntime nativo y onnxruntime-web en WebAssembly con un solo hilo, sin dependencia de GPU ni de servidor.
- Integración en navegador: ejemplo funcional en JavaScript con `ort.InferenceSession` y tensores float32.
- Cobertura multilingüe limitada al material de evaluación: escenas construidas con los test de Common Voice en 7 idiomas (idiomas no enumerados).
- Compatibilidad con pipelines de ASR: la evaluación mide WER con Whisper large-v3 turbo sobre audio aislado, lo que indica que el modelo está pensado como etapa previa al reconocimiento.

No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto, visión ni audio de salida distinto del propio audio aislado.

## Casos de uso

- Videollamadas y reuniones en navegador: el modelo se integra en la ruta de captura del micrófono y entrega audio limpio al codificador de voz; con ~81-107 ms de CPU por segundo de audio en un solo hilo, cabe en el mismo hilo de UI sin penalizar la llamada.
- Preprocesado para reconocimiento automático del habla: colocar Focus delante de un ASR reduce la contaminación por otras voces; en AMI con micrófono de diadema el WER medido con Whisper large-v3 turbo es de 16,1 con huella y 16,7 sin ella, con 0,5 palabras por minuto procedentes de otras voces.
- Captura de voz en dispositivos móviles y wearables: 0,93 MB de pesos int8 y un consumo de aproximadamente el 11 % de un núcleo en un Galaxy Z Fold8 permiten incluirlo en apps móviles o en navegador sin empaquetar un runtime pesado.
- Atención al cliente con grabación de llamadas: el modo con huella permite conservar solo al agente o solo al cliente en una grabación, útil para transcripción posterior, auditoría de calidad y cumplimiento.
- Dictado y asistentes de voz en entornos ruidosos: la combinación de supresión de ruido y selección de hablante evita que la música o las voces de fondo disparen falsos positivos en pipelines de wake word y voz a texto.
- Extracción de hablante para subtitulado en directo: el aislamiento por huella permite generar pistas separadas por participante antes de la transcripción, lo que simplifica la diarización en streaming.
- Kioscos, cabinas y terminales de atención presencial: un modelo que corre en WebAssembly dentro de la propia aplicación web elimina el coste de infraestructura de inferencia y el envío de audio a terceros.
- Limpieza de archivos ya grabados: la misma interfaz acepta audio por tramas, por lo que sirve para procesar en lote grabaciones existentes sin cambiar de modelo.

## Benchmarks y rendimiento

Todos los resultados proceden del model-index del autor y están marcados como no verificados (`verified: false`). Las métricas se midieron, según la model card, con el archivo publicado y contra modelos abiertos ejecutados de la misma forma sobre el mismo audio.

**Aislamiento de voz en AMI (micrófono de diadema, 134 ventanas, protocolo VoxLock, ASR Whisper large-v3 turbo):**

| Metrica | Valor |
|---|---|
| WER con huella vocal | 16,1 |
| WER sin huella vocal | 16,7 |
| Palabras por minuto procedentes de otras voces, con huella | 0,5 |

**Otra voz en la sala (Common Voice, 7 idiomas, 30 escenas por caso e idioma):**

| Metrica | Valor |
|---|---|
| SI-SDR de la voz objetivo, con huella (dB) | 7,1 |
| Nivel de la otra voz hablando sola, con huella (dB) | -22,5 |
| SI-SDR de referencia, micrófono sin procesar (dB) | 3,4 |
| Nivel de la otra voz, micrófono sin procesar (dB) | 0 |
| SI-SDR de referencia con ruido DEMAND a 10 dB (dB) | 2,4 |

El nivel de referencia de la otra voz con ruido DEMAND no aparece en la información disponible.

**Mejora del habla en VoiceBank+DEMAND (824 clips):**

| Metrica | Valor |
|---|---|
| STOI | 0,895 |
| SI-SDR (dB) | 12,1 |
| DNSMOS P.835 overall | 3,04 |
| DNSMOS P.808 | 3,47 |

**Mejora del habla en DNS Challenge 3, conjunto ciego (600 clips):**

| Metrica | Valor |
|---|---|
| DNSMOS P.808 | 3,36 |
| DNSMOS P.835 overall | 2,70 |

**Rendimiento de ejecución:**

| Entorno | Resultado |
|---|---|
| Tamaño del modelo | 0,93 MB |
| Galaxy Z Fold8, Chrome, WebAssembly, 1 hilo | ~107 ms por segundo de audio (~11 % de un núcleo) |
| Mac con Apple silicon, onnxruntime, 1 hilo | ~81 ms por segundo de audio |
| Latencia | 16 ms (una trama) adicionales sobre el hop de 16 ms |

Los resultados comparativos frente a VoxLock, DeepFilterNet 3, Hush y GTCRN no están incluidos en la información proporcionada, solo sus recuentos de parámetros y licencias.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. No se publican requisitos de GPU porque no los necesita.
- CPU: cualquier núcleo moderno sirve. Referencias medidas: ~107 ms por segundo de audio en un núcleo de Galaxy Z Fold8 vía WebAssembly y ~81 ms por segundo de audio en un núcleo de Apple silicon con onnxruntime nativo. El coste es aproximadamente el 8-11 % de un núcleo.
- GPU: no es necesaria. No se documenta soporte de CUDA, Metal ni Vulkan para este archivo.
- Cabe en cualquier dispositivo con navegador moderno: 0,93 MB de pesos int8 y 126 848 float32 de estado (unos 0,5 MB) más la trama de audio.
- Despliegue: onnxruntime (nativo) y onnxruntime-web 1.30 o superior en WebAssembly con un solo hilo. El grafo usa el operador estándar `DFT`, por lo que la versión del runtime es un requisito duro.
- Memoria de trabajo: no se publica el pico de memoria del grafo; el estado explícito es de 126 848 float32.
- Latencia: 16 ms algorítmicos más el hop de 16 ms, es decir, el audio de salida va una trama por detrás de la entrada.
- Throughput: no se publica un valor agregado de tramas por segundo ni de streams concurrentes; los únicos datos son los milisegundos de CPU por segundo de audio citados arriba.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Contexto / modo | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| alkove-focus-1-preview | ~0,8 M | Apache-2.0 | Streaming, tramas de 16 ms, estado de 126 848 float32, condicionado por huella vocal de 192 dimensiones | SI-SDR 12,1 dB y STOI 0,895 en VoiceBank+DEMAND; DNSMOS P.808 3,47; -22,5 dB de la otra voz con huella | ONNX int8, 0,93 MB, en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| VoxLock | 27 M | Apache-2.0 | No disponible en la información proporcionada | No disponible en la información proporcionada | Usado como referencia en la model card; no se aporta enlace |
| DeepFilterNet 3 | 2,1 M | MIT / Apache-2.0 | No disponible en la información proporcionada | No disponible en la información proporcionada | Usado como referencia en la model card; no se aporta enlace |
| Hush | 1,8 M | Apache-2.0 | No disponible en la información proporcionada | No disponible en la información proporcionada | Usado como referencia en la model card; no se aporta enlace |
| GTCRN | 0,05 M | MIT | No disponible en la información proporcionada; su aviso MIT aparece en el NOTICE del modelo | No disponible en la información proporcionada | Usado como referencia y citado en el NOTICE |

La model card afirma que todas las cifras se midieron contra estos modelos ejecutados de la misma forma sobre el mismo audio, pero la tabla comparativa completa no está incluida en la información proporcionada, por lo que no se pueden reproducir aquí los valores de los competidores. Focus es el único de la lista con extracción de hablante objetivo mediante huella vocal y el único empaquetado como ONNX int8 de menos de 1 MB para WebAssembly.

## Limitaciones y advertencias

- Versión preview: el autor advierte explícitamente de que los pesos y la interfaz pueden cambiar antes de la versión 1; no es una API estable para producción sin fijar el archivo y su sha256.
- Resultados no verificados: las 10 métricas del model-index están marcadas como `verified: false` y proceden de mediciones del propio autor; no hay replicación independiente.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, y un repositorio de 0,0 GB en la ficha de HuggingFace frente al archivo de 0,93 MB descrito en la model card.
- Dependencia de un segundo modelo: el aislamiento por hablante requiere alkove-timbre-1-preview para generar la huella de 192 dimensiones; no se incluye en este repositorio y sus requisitos no se detallan aquí.
- Una sola configuración de audio: 16 kHz mono, tramas fijas de 256 muestras. No admite otras frecuencias de muestreo ni audio estéreo sin remuestreo previo.
- Latencia inherente: la salida va una trama (16 ms) por detrás de la entrada, más el propio hop, lo que hay que sumar al resto de la cadena de captura y de red.
- Idiomas no declarados: la evaluación multilingüe cubre 7 idiomas de Common Voice, pero no se enumeran, y no se publica una evaluación por idioma ni del comportamiento en lenguas no representadas.
- Degradación en condiciones adversas: el DNSMOS P.835 cae de 3,04 en VoiceBank+DEMAND a 2,70 en el conjunto ciego del DNS Challenge 3, lo que indica un rendimiento notablemente inferior cuando las condiciones no se parecen a las del conjunto de evaluación.
- Selección de hablante dependiente de la huella: con una huella de mala calidad o de una persona distinta, el comportamiento no está documentado; la model card solo indica reiniciar el estado a ceros al cambiar de huella.
- Sin datos de entrenamiento: no se publica composición del corpus, volumen, ni procedencia, por lo que no se puede evaluar el sesgo por idioma, acento, edad o género, ni el riesgo de sobreajuste a las condiciones de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero hay que conservar el NOTICE con el aviso MIT de GTCRN. No se documentan patentes ni restricciones adicionales.
- Requisito de runtime: onnxruntime u onnxruntime-web 1.30 o superior; versiones anteriores fallan por el operador `DFT`. Solo se documenta ejecución en un hilo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alkove-ai/alkove-focus-1-preview
- Demo en el navegador (Space): https://huggingface.co/spaces/alkove-ai/alkove-demo
- Modelo de huella vocal alkove-timbre-1-preview: https://huggingface.co/alkove-ai/alkove-timbre-1-preview
- Sitio del SDK Alkove: https://alkove.ai

No se han encontrado en la búsqueda web enlaces relevantes sobre este modelo: los resultados obtenidos tratan de contenidos de diseño de interiores y de un digest generalista, sin relación con alkove-focus-1-preview. No se dispone de enlace al artículo de GTCRN ni a papers asociados en la información proporcionada.
