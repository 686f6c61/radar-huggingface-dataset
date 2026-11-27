# moonbox-dev/voice-isolator-realtime-ONNX

## Resumen

Inworld Voice Isolator (realtime) ONNX es una compilacion en formato ONNX del modelo de aislamiento de voz en tiempo real desarrollado por Inworld, preparada por Moonbox para su ejecucion en dispositivo mediante ONNX Runtime (CPU, CUDA y DirectML). El modelo resuelve el problema de la supresion de ruido y la mejora de voz en audio mono a 48 kHz de banda completa, eliminando ruido, musica y reverb mientras preserva la voz, y lo hace de forma causal y en streaming, es decir, procesando el audio a medida que llega en lugar de requerir el fichero completo.

Tecnicamente se trata de una red de 58 millones de parametros con arquitectura causal band-split dual-path, que combina bloques de atencion tipo transformer y bloques Mamba tanto a lo largo del tiempo como entre bandas de frecuencia. El modelo base es la version en PyTorch de Inworld, y esta variante ONNX empaqueta un unico grafo que representa un paso de streaming, acompanado de un runtime en numpy (`pipeline.py`) que reproduce el resto del procesamiento de streaming del modelo original: analisis de tramas, look-ahead, ventanas de atencion de 6 segundos con crossfade y overlap-add.

Su relevancia actual radica en que permite desplegar un aislador de voz de calidad en produccion sobre hardware modesto, incluidas GPU de consumo, con una latencia de extremo a extremo de aproximadamente 210 ms en configuracion de streaming en vivo. La licencia Apache 2.0 y la disponibilidad de pesos en ONNX facilitan su integracion en pipelines de audio sin depender de PyTorch ni de CUDA en el servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal band-split dual-path con transformers y Mamba (a lo largo del tiempo y entre bandas) |
| Parametros totales | 58 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventanas de atencion de 6 s (800 tramas de cache por lane); look-ahead de 0, 2 o 4 tramas |
| Tipos de cuantizacion | fp16 (pesos en fp16 con aritmetica fp32); no se documentan otras precisiones |
| Idiomas soportados | Independiente del idioma (procesamiento de senal de audio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) + runtime en Python (`pipeline.py`) |

## Arquitectura y entrenamiento

El modelo es una red causal band-split dual-path. La senal de audio se analiza con una STFT de `n_fft` 2048 y salto (`hop`) de 480 muestras con ventana Hann periodica, generando 1025 bins de frecuencia por trama. La red procesa bloques de tramas nuevas manteniendo estado explicito: cuatro bloques de atencion temporal con cache de clave/valor de forma [46, 8, 800, 64] (800 posiciones de trama, equivalentes a la vida completa de un lane) y tres bloques Mamba con estado de convolucion [46, 1024, 3] y estado de scan [46, 1024, 16]. La salida del grafo es `raw` [1, 1025, F, 4], la salida del decodificador por bin, junto con el estado actualizado.

El modelo original fue entrenado por Inworld; la model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO. La innovacion destacable de esta variante es la exportacion a ONNX de un unico paso de streaming con todo el estado como entradas y salidas, lo que permite ejecutar el modelo de forma incremental con ONNX Runtime en CPU, CUDA o DirectML. El `pipeline.py` implementa en numpy el resto del streaming del modelo original: analisis de tramas, look-ahead (2 tramas, 20 ms, por defecto), ventanas de atencion de 6 s con un segundo lane iniciado 2 s antes de cada frontera y crossfade de las dos salidas, correccion aplicada al espectro y overlap-add.

## Capacidades

- Aislamiento de voz y supresion de ruido en audio mono a 48 kHz de banda completa.
- Eliminacion de musica y reverb ademas de ruido estacionario y no estacionario.
- Procesamiento causal en streaming: cada trama solo ve el pasado y el look-ahead, de modo que un fichero procesado por bloques produce el mismo audio que el stream original.
- Procesamiento por fichero completo (`isolate`) o en vivo (`stream.push` con piezas de tamano arbitrario).
- Tres look-aheads entrenados (0, 2 y 4 tramas) seleccionables mediante `lookahead_index`.
- Ejecucion en CPU, CUDA y DirectML mediante ONNX Runtime.
- No soporta tool calling, agentes, vision ni audio de entrada distinto de voz; es exclusivamente audio-a-audio.

## Casos de uso

- Videollamadas y conferencias web en tiempo real: el modelo procesa el audio del microfono en piezas de 80 ms con una latencia de unos 210 ms, suficiente para conversacion natural, eliminando ruido de fondo y musica sin requerir servidor.
- Limpieza de grabaciones de podcast y entrevistas: `isolate` procesa un fichero completo en streaming por bloques, eliminando reverb y ruido de sala de grabaciones hechas en condiciones no controladas.
- Preprocesado para ASR: al mejorar la relacion senal-ruido antes de un reconocedor de voz, reduce las tasas de error en entornos ruidosos; el modelo es independiente del idioma del reconocedor.
- Atencion al cliente y centros de contacto: limpieza de audio de agentes y clientes en tiempo real sobre infraestructura con GPU de consumo, reduciendo el ruido de call centers y entornos domesticos.
- Edicion de video y produccion de contenido: aislamiento de la pista de voz de una grabacion con musica de fondo o ruido ambiental para su posterior postproduccion.
- Aplicaciones moviles y de escritorio on-device: el grafo ONNX y el runtime numpy permiten integrar el modelo en apps nativas con DirectML o CPU, sin dependencia de PyTorch.
- Transcripcion de reuniones y notas de voz: preprocesado previo a la transcripcion para mejorar la inteligibilidad de hablantes lejanos al microfono.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test VoiceBank-DEMAND (824 utterances ruidosas de dos hablantes no vistos, 48 kHz), cada fichero procesado en streaming por bloques de 16 tramas:

| Metrica | fp16 ONNX | Original PyTorch (fp32) |
|---|---|---|
| PESQ (wide-band) | 2,932 | 2,932 |
| STOI (48 kHz) | 0,9372 | 0,9373 |
| SI-SDR (dB) | 19,54 | 19,54 |
| Distancia al original (SI-SDR, media / peor fichero) | 84,1 dB / 60,3 dB | referencia |
| Real-time factor (RTX 3080 Laptop, CUDA) | 0,76 | no disponible |

Ademas, se reporta que ningun fichero queda mas de 0,004 dB por debajo del original, y que con TF32 activado en CUDA la salida se aleja 33 dB mas del original.

Rendimiento en vivo (RTX 3080 Laptop, `fp16/` en CUDA, 20 s de audio):

| Tamano de push (tramas por paso) | Tiempo por push (media / p95) | Real-time factor |
|---|---|---|
| 20 ms (2) | 47 / 72 ms | 2,33 (demasiado lento) |
| 40 ms (4) | 50 / 76 ms | 1,26 (demasiado lento) |
| 80 ms (8) | 59 / 88 ms | 0,74 |

El proveedor CPU esta lejos del tiempo real (RTF 9,3 con pushes de 40 ms).

## Requisitos de hardware

- VRAM estimada: el fichero fp16 ocupa 117,3 MB, por lo que la huella de pesos es inferior a 0,2 GB; el estado de atencion y Mamba anade una cantidad moderada adicional.
- GPU recomendadas: RTX 3080 Laptop alcanza RTF 0,76 con pushes de 80 ms; se espera margen amplio en A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, incluidas GPU de portatil de gama media-alta con CUDA; tambien funciona en CPU, aunque sin tiempo real.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) con el runtime `pipeline.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de audio).
- Latencia: 63 ms de retardo intrinseco (ventana de analisis de 2048 muestras mas look-ahead de 20 ms); unos 210 ms de extremo a extremo en streaming en vivo con pushes de 80 ms.
- Coste fijo por paso de red de unos 50 ms en ONNX Runtime (5.500 nodos pequenos y los scans de Mamba), independiente del numero de tramas nuevas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inworld Voice Isolator (realtime) ONNX (este) | 58 M | Ventanas de 6 s, streaming causal | ONNX | Apache 2.0 | RTF 0,76 en RTX 3080 Laptop; PESQ 2,932 en VoiceBank-DEMAND |
| Inworld Voice Isolator (PyTorch original) | 58 M | Ventanas de 6 s, streaming causal | PyTorch | Apache 2.0 | Referencia de calidad; requiere PyTorch y CUDA |
| Alternativas de supresion de ruido (p. ej. DeepFilterNet, RNNoise) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | No se proporcionan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Solo acepta audio mono a 48 kHz; otras frecuencias de muestreo deben remuestrearse antes de la inferencia.
- El modelo es causal y procesa en streaming, por lo que no puede aprovechar contexto futuro mas alla del look-ahead configurado.
- El proveedor CPU no alcanza el tiempo real (RTF 9,3 con pushes de 40 ms); el uso en vivo requiere GPU.
- En CUDA debe mantenerse TF32 desactivado (`use_tf32` a "0"); con TF32 la salida se aleja 33 dB mas del original.
- El coste fijo de unos 50 ms por paso impone un tamano minimo de push de 80 ms para tiempo real en la GPU de referencia.
- No se documentan sesgos especificos ni tasas de alucinacion (no aplica a un modelo de senal); el riesgo principal es la distorsion de la voz en condiciones de relacion senal-ruido muy baja.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Inworld.
- No se dispone de informacion sobre el dataset de entrenamiento ni sobre el rendimiento en idiomas o acentos distintos de los del conjunto de evaluacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/voice-isolator-realtime-ONNX
- Modelo base: https://huggingface.co/inworld/voice-isolator
- Repositorio de Inworld voice isolation: no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
