# episod/audio8-asr-infinite-p150

## Resumen

`episod/audio8-asr-infinite-p150` es un paquete de despliegue para reconocimiento automatico del habla (ASR) en streaming, publicado por el usuario episod, que empaqueta el modelo `Edge0/Audio8-ASR-Infinite` para ejecutarse en un unico chip Tenstorrent Blackhole p150. El modelo subyacente sigue el esquema Voxtral: un encoder de audio causal de 32 capas alimenta un proyector y un decoder de 36 capas de la familia Qwen2, de clase 3B de parametros, con condicionamiento por retardo en cada capa del decoder.

El paquete resuelve un problema de despliegue concreto: servir transcripcion de audio en ingles, tanto de ficheros como en directo, sobre hardware Tenstorrent en lugar de GPU. Expone un servidor HTTP propio (no compatible con la API de chat de OpenAI) con un endpoint de transcripcion de ficheros y un endpoint WebSocket para streaming, con un contexto rodante de 30 segundos en el decoder que permite streams de duracion arbitraria.

Es relevante ahora porque demuestra ASR en tiempo real en aceleradores no NVIDIA con cifras medidas: factor de tiempo real de 0,66 a 0,68 en streams largos, primer texto 1,3 segundos despues del inicio del habla y unos 54 ms por paso de 80 ms en un chip Blackhole. El estado declarado es beta y el paquete se construyo desde una rama local de tt-metal no publicada, por lo que la reproducibilidad exacta de la imagen no esta garantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio causal de 32 capas con ventana deslizante de 750 frames (estilo Voxtral) + proyector + decoder Qwen2 de 36 capas; las caracteristicas mel y dos convoluciones causales pequenas se ejecutan en el host |
| Parametros totales | no disponible (el decoder es de clase Qwen2.5-3B; no se publica el recuento exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | contexto rodante de 30 segundos en el decoder (valor por defecto del modelo original); ventana deslizante de 750 frames en el encoder de audio |
| Tipos de cuantizacion | no disponible (la model card menciona aritmetica bf16/bfp8 en el chip y diferencias de tokens casi empatados por esa aritmetica) |
| Idiomas soportados | ingles unicamente; los metadatos de HuggingFace no declaran idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible; los pesos no van dentro de la imagen y se descargan del repositorio `Edge0/Audio8-ASR-Infinite` en la revision `7476824bc222e4ad509d286e8cae8b8d3f371129` |
| Hardware objetivo | chip Tenstorrent Blackhole p150 (malla `P150`), construido y medido en un chip de una placa p300c |
| Tamano del repositorio | 0,9 GB |
| Estado | beta; construido desde una rama local no publicada de tt-metal (`audio8-asr`) con cambios sin commitear |
| Empaquetado | tt-model-manager 0.1.0, esquema de manifiesto 5.1 |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento, los datos utilizados ni si hubo RLHF o DPO: esa informacion no esta disponible. Lo que si se detalla es el reparto de computo en inferencia. Las caracteristicas mel y dos convoluciones causales pequenas se ejecutan en el host; el encoder de audio causal de 32 capas (con ventana deslizante de 750 frames), el proyector y el decoder Qwen2 de 36 capas se ejecutan en el chip. El condicionamiento por retardo de cada capa del decoder se pliega dentro de los pesos de normalizacion en el primer arranque.

Entre las decisiones tecnicas destacables: el decoder mantiene un contexto rodante de 30 segundos, que se reconstruye rehaciendo el prefill de la ventana en lugar de recortar la cache como hace la implementacion original; el MLP esta rellenado con ceros y el prefill se trocea en filas de 128 porque otras formas de prefill desbordan la memoria L1. Ademas, el primer arranque compila kernels y convierte pesos (71 segundos hasta estar listo en la maquina de desarrollo con cache vacia).

## Capacidades

- Transcripcion de voz en ingles desde ficheros de audio, mediante `POST /v1/audio/transcriptions` con `response_format=verbose_json`.
- Transcripcion en streaming por WebSocket (`/v1/audio/stream`): se envian frames binarios de PCM mono a 16 kHz en int16 y se reciben mensajes `{"type":"delta","text":...}` y, tras enviar `finish`, `{"type":"final",...}`.
- Ventana de audio efectiva de 30 segundos en el decoder, con reconstruccion por re-prefill, lo que permite streams de cualquier duracion.
- Primer texto aproximadamente 1,3 segundos despues de que empiece el habla, y texto final 0,9 segundos despues del ultimo audio.
- Decodificacion greedy: no se documenta muestreo, beam search ni decodificacion especulativa.
- Endpoint `/health` para comprobar disponibilidad del servidor.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo especializado de ASR.
- Sin identificacion de hablante y sin deteccion de fin de turno (las cabezas de VAD semantico del modelo no se ejecutan).
- Sin capacidades de vision, audio generativo ni otras modalidades mas alla de la transcripcion.

## Casos de uso

- Transcripcion por lotes de ficheros de audio en ingles: un `curl -F file=@sample.wav -F response_format=verbose_json` contra el endpoint de transcripciones devuelve la transcripcion de cada fichero; es adecuado porque el modelo acepta directamente ficheros y no requiere GPU.
- Subtitulado en directo de habla inglesa: el endpoint WebSocket entrega deltas de texto mientras llega el audio, con primer texto a 1,3 segundos, lo que permite emitir subtitulos casi en tiempo real para una unica fuente.
- Dictado y asistentes de voz en ingles: el factor de tiempo real de 0,66 a 0,68 en streams largos deja margen dentro del presupuesto de 80 ms por paso, aunque el diseno de un solo stream limita su uso a un usuario simultaneo.
- Transcripcion de reuniones o clases en ingles: el contexto rodante de 30 segundos permite procesar sesiones de duracion arbitraria sin reiniciar el modelo, y la salida final llega 0,9 segundos despues de terminar el audio.
- Evaluacion y prototipado de hardware Tenstorrent: sirve como carga de trabajo ASR real para medir rendimiento, latencia y comportamiento de kernels en un chip Blackhole frente a las referencias en CPU y GPU.
- Preprocesado de corpus de voz en ingles para entrenamiento: generar transcripciones sobre grandes volumenes de audio limpio en una maquina sin GPU NVIDIA, asumiendo el WER medido del 5,22% al 7,30% en LibriSpeech validation con normalizador simple.
- Despliegue on-premise con requisitos de soberania de datos: al ejecutarse en un chip local y exponer un servidor HTTP propio, el audio no necesita salir de la infraestructura, aunque el puerto debe publicarse solo en redes controladas porque el servidor escucha en todas las interfaces dentro del contenedor.
- Pruebas de regresion de ASR en integracion continua: el script de arranque y los endpoints permiten automatizar la comparacion de transcripciones contra una referencia conocida, dado que la model card documenta paridad exacta de transcripcion con la implementacion CPU en 35 de 39 enunciados.

## Benchmarks y rendimiento

Resultados publicados en la model card del paquete (todos en ingles, habla leida limpia de LibriSpeech y con un normalizador simple que no unifica digitos ni variantes ortograficas, por lo que las cifras se declaran pesimistas):

| Metrica | Conjunto | Resultado | Notas |
|---|---|---|---|
| WER | 73 enunciados de validacion de LibriSpeech (8,0 min), enviados uno a uno | 7,30% | normalizador simple |
| WER | Los mismos 73 enunciados como stream continuo de 8,6 min | 5,22% | |
| WER | Primeros 39 enunciados, referencia CPU frente a este port | 5,47% en ambos | transcripciones identicas en 35 de 39 |
| WER | LibriSpeech test-clean / test-other, reportado por Edge0 | 3,04% / 6,81% | corresponde al modelo base |
| WER | LibriSpeech test-clean / test-other, reproducido por terceros en 300 enunciados | 2,97% / 6,96% | |
| Factor de tiempo real | Streams largos | 0,66 a 0,68 | carga media de 4 a 6 por procesos ajenos |
| Latencia | Primer texto / texto final | 1,3 s / 0,9 s | tras el inicio del habla y tras el ultimo audio |
| Latencia por paso | Un chip Blackhole | ~54 ms por paso de 80 ms | incluye trabajo de host y re-prefill rodante |

Comparacion indicativa con GPU publicada por terceros (no equivalente, en una RTX 5090 Laptop con bf16, reloj de 80 ms y retardo de 480 ms; Edge0 no publica cifras de latencia, memoria ni throughput en GPU): decoder torch original, 20,1 ms por paso; servidor vLLM original, 21,8 ms en p50 con p99 de 73,1 ms y 12,9 GB de memoria (71 de 7.653 pasos de un stream de 10 minutos superaron el presupuesto de 80 ms); una instalacion propia en RTX 4090 dio 16,6 ms por paso. La latencia de cola (p99 y maximo) y la memoria total del dispositivo no se midieron en este port.

## Requisitos de hardware

- No requiere VRAM de GPU: el paquete esta construido para un unico chip Tenstorrent Blackhole p150 (malla `P150`), medido en un chip de una placa p300c.
- No validado en otros hosts: la model card indica explicitamente que solo se ha construido y medido en ese entorno.
- Para la implementacion original en GPU, las cifras de terceros apuntan a 12,9 GB de memoria en una RTX 5090 Laptop con bf16; no hay cifra publicada de VRAM para GPUs de consumo con este modelo.
- GPUs de consumo: no hay datos de VRAM publicados por Edge0; la unica referencia disponible es de terceros y menciona 16,6 ms por paso en una RTX 4090, sin cifra de memoria.
- Despliegue: con tt-cli (`uv tool install tenstorrent`, `tt model pull episod/audio8-asr-infinite-p150`, `tt serve episod/audio8-asr-infinite-p150`) o solo con tt-model (`tt-model pull episod/audio8-asr-infinite-p150 --with-weights`, `tt-model serve ...`). El paquete distribuye una imagen Docker y descarga los pesos aparte en la cache de HuggingFace.
- Servicio expuesto: servidor HTTP propio en el puerto 20000 (o el siguiente libre) con `/v1/audio/transcriptions`, WebSocket `/v1/audio/stream` y `/health`.
- Arranque en frio: compilacion de kernels y conversion de pesos, 71 segundos hasta estar listo en la maquina de desarrollo con cache vacia, mas tiempo con disco lento.
- Latencia y throughput: un unico stream simultaneo (un segundo stream se rechaza y uno inactivo se cierra a los 60 segundos); alrededor de 54 ms por paso de 80 ms; RTF de 0,66 a 0,68 en streams largos.

## Comparativa con modelos similares

No hay datos publicados en la informacion disponible para comparar con alternativas de la misma categoria (por ejemplo, modelos ASR multilingues tipo Whisper o Voxtral en sus versiones publicas): no disponible. La comparacion posible se limita a las distintas implementaciones del mismo modelo base.

| Implementacion | Hardware | Latencia por paso de 80 ms | Memoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (`episod/audio8-asr-infinite-p150`) | 1 chip Tenstorrent Blackhole p150 | ~54 ms (RTF 0,66-0,68) | no medida | apache-2.0 | HuggingFace (0 descargas, 0 likes en el momento de la consulta) |
| Referencia CPU del modelo base | CPU | paridad de WER y transcripcion en 39 enunciados | no disponible | no disponible en la informacion proporcionada | via `Edge0/Audio8-ASR-Infinite` |
| Decoder torch original | RTX 5090 Laptop, bf16 | 20,1 ms | 12,9 GB (servidor vLLM) | no disponible en la informacion proporcionada | via `Edge0/Audio8-ASR-Infinite` |
| Servidor vLLM original | RTX 5090 Laptop, bf16 | 21,8 ms p50 / 73,1 ms p99 | 12,9 GB | no disponible en la informacion proporcionada | via `Edge0/Audio8-ASR-Infinite` |
| Motor bf16 de un tercero | RTX 4090 | 16,6 ms | no disponible | no disponible | no disponible |
| Modelos ASR alternativos (Whisper, Voxtral u otros) | - | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo ingles: cualquier otro idioma queda fuera del alcance declarado, igual que el reconocimiento de hablante y la deteccion de fin de turno (las cabezas de VAD semantico no se ejecutan).
- Un unico stream simultaneo: un segundo stream se rechaza y un stream inactivo se cierra a los 60 segundos.
- Decodificacion greedy y perfil unico de 80 ms de reloj con 480 ms de retardo; no se documentan otras configuraciones.
- No evaluado con habla ruidosa, con acento marcado o en campo lejano.
- Riesgo de alucinacion y de sustituciones a nivel de palabra: la model card reconoce diferencias frente a la referencia CPU en tokens casi empatados bajo aritmetica bf16/bfp8 (3 de 151 palabras en los primeros clips de demostracion).
- El contexto rodante se reconstruye rehaciendo el prefill, un metodo distinto del recorte de cache del modelo original; funciona segun los resultados medidos, pero es una divergencia de implementacion.
- Restricciones de reproducibilidad: el paquete se construyo desde una rama local no publicada de tt-metal con cambios sin commitear, por lo que el commit registrado no reproduce la imagen por si solo; solo se ha validado en un host.
- Compilacion y conversion de pesos en el primer arranque (71 segundos con cache vacia en la maquina de desarrollo), lo que penaliza despliegues efimeros.
- El servidor escucha en todas las interfaces dentro del contenedor: el puerto debe publicarse solo en redes controladas. El audio se decodifica con soundfile y se remuestrea (la model card se corta en este punto).
- Licencia apache-2.0: permite uso comercial con las obligaciones habituales de conservar avisos de copyright y licencia; no se detallan restricciones adicionales de los pesos del modelo base.
- El modelo base se distribuye aparte de la imagen; conviene verificar la licencia y las condiciones de `Edge0/Audio8-ASR-Infinite` antes de un despliegue en produccion.
- Adopcion practicamente nula por el momento: 0 descargas y 0 likes en el repositorio consultado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/episod/audio8-asr-infinite-p150
- Modelo base: https://huggingface.co/Edge0/Audio8-ASR-Infinite
- Revision de pesos referenciada: `7476824bc222e4ad509d286e8cae8b8d3f371129` de `Edge0/Audio8-ASR-Infinite`
- tt-model-manager (empaquetado y despliegue): https://github.com/tenstorrent/tt-model-manager
- Resultados detallados: `doc/RESULTS.md` dentro del paquete (no se proporciona URL publica)
- La busqueda web realizada no devolvio enlaces relevantes sobre el modelo; los unicos resultados encontrados corresponden a una cadena de estudios deportivos ajena a este proyecto.
