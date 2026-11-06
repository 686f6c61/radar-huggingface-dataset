# alexandre5645/avion-0.1

## Resumen

AVION 0.1 es un kernel de percepcion, vision y medios escrito en C99 y distribuido como una unica cabecera, desarrollado por el usuario alexandre5645. No es un modelo de aprendizaje automatico con pesos entrenados: la model card lo describe explicitamente como "la interfaz que un modelo tiene delante", es decir, un front end deterministico que procesa video convencional en GPU y entrega a la red neuronal tensores NCHW foveados en float32 o float16 sin copia adicional. Resuelve el problema de la percepcion previa a la inferencia en sistemas embebidos y de robotica: estabilizacion, nivelacion de horizonte, seguimiento de objetos, medida de tiempo hasta el contacto, lectura de pulso por rPPG y emision de eventos neuromorficos a partir de camaras de evento emuladas.

Su relevancia actual reside en la combinacion de determinismo, ausencia total de asignaciones de memoria en tiempo de ejecucion (zero-allocation) y latencias muy bajas: segun los datos declarados por el autor, 0,23 microsegundos por fotograma 4K HEVC para detectar cortes leyendo cabeceras de slice, frente a 31,1 ms de ffmpeg con decodificacion completa. Esta disenado para drones, robots, vehiculos y camaras inteligentes, y para los pipelines de IA y reproductores que se sitúan detras de ellos.

La entrega se realiza como SDK C99 con licencia propietaria de evaluacion (`avion-0.1-evaluation`), sin idiomas declarados y sin pesos descargables. La informacion disponible no incluye parametros, contexto ni datos de entrenamiento porque el artefacto no es un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel de percepcion y vision en C99 (cabecera unica), con backend GPU Direct3D12; no es una red neuronal con pesos |
| Parametros totales | no disponible (no aplica; un unico upscaler neural de 1.356 parametros y 5,4 KB se menciona como componente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica; procesa flujos de video fotograma a fotograma) |
| Tipos de cuantizacion | no disponible (tensores de salida en float32 y float16) |
| Idiomas soportados | no disponible (la interfaz de control por intencion admite nueve idiomas, sin especificar cuales) |
| Licencia | `avion-0.1-evaluation` (licencia `other`, propietaria de evaluacion) |
| Formato de pesos | no disponible (no hay pesos; se distribuye como SDK C99 y bundle de evaluacion de 8,58 MiB) |

## Arquitectura y entrenamiento

AVION no es un transformer ni un modelo MoE ni un SSM: es un kernel de procesamiento de senal y vision por computador implementado en C99, con aceleracion GPU mediante Direct3D12. Su diseno se apoya en tres principios declarados: determinismo, cero asignaciones de memoria tras la inicializacion (arena preasignada mediante `media_engine_storage_bytes`) y procesamiento en tiles de 8x8 muestras en lugar de por pixel para el paso de movimiento. Incluye modulos de flujo optico, estructura de tensor, tiempo hasta el contacto, seguimiento con identificadores de pista, estabilizacion de segundo orden, horizonte automatico, rPPG, vibrometria remota y emulacion de camara de eventos (DVS).

No se dispone de informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO, porque el artefacto no se entrena como un modelo de lenguaje. La unica componente con parametros es un upscaler neural de 5,4 KB y 1.356 parametros con reutilizacion temporal exacta de tiles, para el que tampoco se detalla el procedimiento de entrenamiento. Entre las innovaciones tecnicas destacadas por el autor figuran la inspeccion del bitstream antes de decodificar (lectura de cabeceras de slice H.264/HEVC), el puente de tensores NCHW foveados sin copia, el IMU virtual derivado solo del fondo de la imagen (0,068 px rms de error sin giroscopio) y la estabilizacion de segundo orden que reduce de 14,73 a 0,92 px rms en pantalla.

## Capacidades

- Estabilizacion de video de segundo orden con IMU virtual derivado del fondo, sin sensor inercial.
- Nivelacion automatica de horizonte (tilt sintetico dentro de 0,06 grados; metraje real dentro de 0,38 grados).
- Estimacion de flujo optico y estructura de tensor sobre tiles de 8x8 muestras.
- Calculo de tiempo hasta el contacto (TTC) con rechazo de plano de suelo y de superficie de agua.
- Seguimiento multiobjeto con identificadores de pista seguros ante cruces.
- Percepcion de bitstream: deteccion de cortes de escena y actividad a partir de cabeceras de slice H.264/HEVC.
- Puente de tensores NCHW float32/float16 foveados en el objetivo, con tone mapping HDR.
- Emulacion de camara de eventos (DVS) estabilizada: una escena estatica bajo vibracion genera 141 eventos frente a 1.201.527 sin estabilizar.
- rPPG y vibrometria remota: lectura de pulso a traves de vibracion de camara (72,00 BPM) y vibracion de 8,000 Hz desde un movimiento de mas o menos 0,3 muestras.
- Reproduccion de medios 4K60 HDR en GPU con consumo de CPU del 0,00 % en pausa y 8,44 % reproduciendo a 720p.
- Upscaling neural con reutilizacion temporal de tiles, levantamiento de sombras y filtros notch de zumbido y dron (-41,8 a -48,5 dB).
- Control por intencion en nueve idiomas y capturas forenses en BMP con sidecar JSON.
- No se menciona soporte de tool calling, agentes ni razonamiento multi-paso, por no ser un modelo de lenguaje.

## Casos de uso

- Estabilizacion en vuelo de drones: el IMU virtual estima la sacudida de la camara solo a partir del fondo, sin giroscopio, lo que permite estabilizar en postproceso o en tiempo real en plataformas donde el sensor inercial es ruidoso o inexistente.
- Evitacion de obstaculos y aterrizaje en robotica movil: el calculo de tiempo hasta el contacto con rechazo de plano de suelo y superficie de agua (55 de 55 fotogramas, 3,4 % de error mediano) alimenta bucles de control de proximidad sin necesidad de un modelo de profundidad completo.
- Preprocesado para pipelines de IA en el borde: entrega tensores NCHW foveados en float32 o float16 sin copia, de modo que el modelo de vision recibe solo la region de interes y se evita el coste de redimensionar y normalizar en CPU.
- Indexado y deteccion de cortes en bibliotecas de video: la inspeccion de cabeceras de slice a 0,23 microsegundos por fotograma 4K permite localizar cortes de escena sin decodificar el video completo, adecuado para catalogacion masiva.
- Monitorizacion biomedica sin contacto: el modulo rPPG lee el pulso (72,00 BPM) a traves de la vibracion de la camara e incluso solo con el canal de croma Cr, util para telemedicina o seguimiento en cabinas.
- Vision neuromorfica sobre camaras convencionales: la emulacion DVS estabilizada reduce el flujo de eventos de 17,2 a 1,71 millones en una escena con vibracion, lo que hace viable alimentar redes de eventos sin hardware DVS dedicado.
- Reproductores y herramientas de medios: reproduccion 4K60 HDR con consumo de CPU casi nulo en pausa, bucles A-B con conmutacion en 0,19 a 3,76 ms y capturas forenses con metadatos JSON.
- Vigilancia con camaras inteligentes: seguimiento con identificadores de pista y haz de audio direccional (-10,3 dB fuera de eje) que sigue la vista de la camara.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card y corresponden a una unica maquina (Intel Core i7-10700, GPU integrada UHD 630), con las mismas entradas y una biblioteca de conteo de malloc precargada en todos los procesos. Menos es mejor en las medidas de coste.

| Medida | AVION 0.1 | Baseline | Herramienta baseline |
|---|---:|---:|---|
| Asignaciones de heap por 1.000 fotogramas, escaneo 4K HEVC | 0 | 132.292 | ffmpeg 8.0.1, decode + scdet |
| Asignaciones de heap por 1.000 fotogramas, movimiento | 0 | 20.000 | OpenCV 4.10.0 DIS ultrafast |
| Asignaciones de heap por 1.000 fotogramas, sondeo | 0 | 52.000 | OpenCV Scharr + medias por bloque |
| CPU por fotograma 4K HEVC para hallar cortes | 0,23 us | 31,1 ms | ffmpeg decode + scdet, un hilo (134.501x) |
| Estimacion de movimiento, 640x480, un nucleo | 0,51 ms | 4,35 ms | OpenCV DIS ultrafast (8,5x) |
| Sondeo por tensor de estructura, 640x480 | 0,179 ms | 0,779 ms | OpenCV (4,3x) |
| CPU del reproductor en reproduccion, 720p | 8,44 % | 23,90 % / 7,66 % | ffplay / VLC (VLC consume menos) |
| CPU del reproductor en pausa | 0,00 % | 0,16 % / 0,00 % | ffplay / VLC |

Precision declarada en tareas de percepcion:

| Tarea | Verdad | Lectura de AVION |
|---|---|---|
| Horizonte, puerto inclinado | +4,00 grados | +4,06 grados (+0,004 sin inclinar) |
| Boya acercandose a 1 m/s | TTC 1,33 s | 1,24 s; 3,8 % mediano en 24 fotogramas |
| Pulso bajo vibracion | 72,00 BPM | 71,98 BPM; solo Cr 72,00 BPM |
| IMU virtual, mismo clip | sacudida aplicada | 0,031 px rms de desviacion |
| Camara de eventos, dibujo animado con vibracion | no aplica | 17,2 M eventos, 1,71 M estabilizados |
| Deteccion de cortes en reel 4K HDR de LG | referencia scdet | 3 de 3 encontrados, 1 extra |

No se han publicado resultados de benchmarks de modelos de lenguaje (MMLU, HumanEval, GSM8K) en la informacion disponible, por no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible. El unico componente neural es un upscaler de 1.356 parametros (5,4 KB), por lo que el consumo de memoria grafica es marginal; el coste principal es la arena de memoria preasignada por el motor.
- GPU: el backend declarado es Direct3D12, por lo que se apoya en GPUs compatibles con esa API en Windows. Las medidas publicadas se tomaron con una GPU integrada Intel UHD 630, lo que indica que el kernel funciona en hardware de gama baja.
- GPU de consumo: si, cabe en GPUs integradas y en tarjetas de consumo; no se detallan modelos concretos como RTX 4090, A100 o H100 en la informacion disponible.
- Despliegue: SDK C99 de cabecera unica con backend Direct3D12; se compila con `/W4 /WX` en MSVC segun el quickstart. No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, por no ser un modelo de lenguaje.
- Latencia y throughput: 0,23 us por fotograma 4K HEVC para deteccion de cortes; 0,51 ms para estimacion de movimiento a 640x480 en un nucleo; 0,179 ms para sondeo por tensor de estructura a 640x480; reproduccion 4K60 HDR en GPU con 8,44 % de CPU a 720p y 0,00 % en pausa.

## Comparativa con modelos similares

La categoria del artefacto no es la de un modelo de lenguaje, sino la de bibliotecas de vision y procesamiento de video. La comparacion se establece con las herramientas usadas como baseline por el propio autor.

| Criterio | AVION 0.1 | ffmpeg 8.0.1 (decode + scdet) | OpenCV 4.10.0 (DIS ultrafast) |
|---|---|---|---|
| Tipo | Kernel C99 de percepcion y medios | Suite de decodificacion y filtros | Biblioteca de vision por computador |
| Asignaciones por 1.000 fotogramas | 0 | 132.292 (escaneo 4K HEVC) | 20.000 (movimiento) |
| Coste de deteccion de cortes 4K | 0,23 us por fotograma | 31,1 ms por fotograma | no disponible |
| Estimacion de movimiento 640x480 | 0,51 ms | no disponible | 4,35 ms |
| Aceleracion GPU | Direct3D12 | dependiente de build | dependiente de backend |
| Licencia | Propietaria de evaluacion (`avion-0.1-evaluation`) | LGPL/GPL segun build | Apache 2.0 |
| Disponibilidad | Bundle de evaluacion de 8,58 MiB | Amplia, codigo abierto | Amplia, codigo abierto |

No se dispone de comparacion con otros SDK de percepcion embebida en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de aprendizaje automatico: no hay pesos, no genera texto ni razona; quien busque un LLM o un modelo de vision entrenado no lo encontrara aqui.
- La licencia es propietaria de evaluacion (`avion-0.1-evaluation`), lo que previsiblemente restringe el uso comercial; deben revisarse los terminos exactos antes de integrarlo en produccion.
- Las cifras de rendimiento proceden de una unica maquina (Intel Core i7-10700 con UHD 630) y de los propios benchmarks del autor; no hay validacion independiente en la informacion disponible.
- El autor reconoce que en consumo de CPU reproduciendo a 720p VLC consume menos (7,66 % frente a 8,44 %), por lo que la ventaja no es uniforme en todas las metricas de reproduccion.
- La deteccion de cortes sobre el reel 4K HDR de LG encontro 3 de 3 cortes pero genero 1 falso positivo adicional.
- El backend grafico declarado es Direct3D12, lo que limita el despliegue nativo a plataformas compatibles; no se detalla soporte de Vulkan, Metal u otras APIs.
- No se especifican los nueve idiomas del control por intencion ni los sesgos asociados a esa interfaz.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos, pero las estimaciones de TTC, horizonte y pulso tienen errores declarados (3,4 % mediano en TTC, 0,38 grados en horizonte real) que deben tenerse en cuenta en lazos de control criticos.
- No se dispone de informacion sobre limites de resolucion, formatos de codec soportados mas alla de H.264/HEVC ni requisitos minimos de version de sistema operativo.

## Enlaces

- Hugging Face: https://huggingface.co/alexandre5645/avion-0.1
- Sitio y graficas: https://5645hm-a11y.github.io/avion/
- Whitepaper: https://5645hm-a11y.github.io/avion/whitepaper.html
- Bundle de evaluacion (8,58 MiB, SHA-256 `aa62ffa57a0d362eec9f1ccc83bb88bd48c38310a0c34b06486b18dde2db2898`): https://5645hm-a11y.github.io/avion/downloads/AVION-0.1-Evaluation.zip
- Metodologia de benchmarks: https://5645hm-a11y.github.io/avion/#method
