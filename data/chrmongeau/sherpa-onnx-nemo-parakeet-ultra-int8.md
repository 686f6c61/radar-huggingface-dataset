# chrmongeau/sherpa-onnx-nemo-parakeet-ultra-int8

## Resumen

Parakeet Ultra int8 para sherpa-onnx es una conversion del modelo de reconocimiento automatico del habla (ASR) Moondream Parakeet Ultra a formato ONNX cuantizado a int8, empaquetado especificamente para el runtime sherpa-onnx. Lo publica el usuario chrmongeau y deriva de la arquitectura NVIDIA Parakeet TDT 0.6B v3, sobre cuyos pesos se cargan los de Parakeet Ultra. El objetivo es ofrecer un ASR offline ligero y desplegable en dispositivos moviles; de hecho, se creo para Viskat, una aplicacion Android de notas de voz sin conexion.

El modelo emplea una arquitectura transducer NeMo (TDT, Token-and-Duration Transducer) dividida en tres grafos ONNX: encoder, decoder y joiner. Con aproximadamente 0,6 mil millones de parametros en su version base y cuantizacion dinamica int8, el paquete completo ocupa unos 0,7 GB, lo que lo hace viable en hardware de consumo y telefonos de gama media.

Su relevancia actual radica en que reproduce el layout de sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8, por lo que funciona como reemplazo directo de ese modelo en pipelines existentes, con soporte para 25 idiomas europeos y un factor de tiempo real cercano a 0,10 en un Pixel 6a.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo transducer TDT (Token-and-Duration Transducer), exportado a ONNX en tres grafos (encoder, decoder, joiner) |
| Parametros totales | aproximadamente 0,6 mil millones (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por segmentos, no se documenta ventana de contexto) |
| Tipos de cuantizacion | int8 dinamica (pesos sin signo en encoder, con signo en decoder y joiner) |
| Idiomas soportados | bg, cs, da, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, mt, nl, pl, pt, ro, ru, sk, sl, sv, uk (25 idiomas) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX int8 (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) mas tokens.txt |

## Arquitectura y entrenamiento

El modelo es un transducer TDT de NeMo. El encoder procesa las caracteristicas acusticas, el decoder (prediction network) modela la secuencia de tokens y el joiner combina ambos para predecir simultaneamente el token y su duracion. Esta variante TDT permite saltos temporales variables, lo que reduce el coste computacional frente a un transducer clasico.

La conversion parte de dos fuentes: la arquitectura, tokenizer y modelo base de NVIDIA Parakeet TDT 0.6B v3 (revision 541d1f9, restaurada en NeMo 3.0.0) y los pesos de Moondream Parakeet Ultra (revision 73175eb). Los 723 tensores del modelo Ultra se remapean uno a uno desde el layout de transformers al de NeMo con formas identicas; se descartan los seis tensores vad_head.* (cabeza de deteccion de actividad de voz no usada por el transcriptor). Los pesos, mayoritariamente float16, se cargan como float32 (representacion exacta). El vocabulario se verifica identico al de v3, y tokens.txt se genera desde su tokenizer. La exportacion y cuantizacion se realizan con el export_onnx.py de sherpa-onnx (onnx 1.17.0, onnxruntime 1.17.1), sin acceso a red y de forma determinista (dos ejecuciones producen ficheros identicos byte a byte). No se documenta informacion sobre el entrenamiento original (tokens, composicion del dataset, RLHF/DPO) en la informacion disponible.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en 25 idiomas europeos.
- Decodificacion offline, sin conexion a red, adecuada para dispositivos moviles.
- Arquitectura TDT con prediccion conjunta de token y duracion, que mejora la eficiencia en secuencias largas.
- Compatibilidad directa con sherpa-onnx mediante OfflineRecognizer.from_transducer con model_type="nemo_transducer".
- API disponible en Python y Kotlin (en Kotlin, dejar modelType vacio).
- No se documentan capacidades de traduccion, diarizacion, puntuacion explicita, tool calling ni razonamiento multi-paso.

## Casos de uso

- Notas de voz offline en Android: es el caso original (app Viskat); el modelo transcribe grabaciones localmente sin enviar audio a la nube, con un factor de tiempo real de 0,10 en un Pixel 6a.
- Subtitulado y transcripcion de reuniones en local: al ser un modelo ligero y determinista, puede integrarse en herramientas de escritorio que procesan audio por segmentos sin depender de servicios externos.
- Asistentes de voz embebidos: la baja latencia (RTF 0,10) y el consumo de memoria contenido (0,79-1,13 GB de RSS) permiten usarlo en pipelines de comandos de voz en dispositivos de gama media.
- Transcripcion multilingue en centros de contacto: cubre 25 idiomas europeos, lo que facilita el preprocesado de llamadas en varios idiomas antes de un analisis posterior.
- Accesibilidad: generacion de subtitulos en tiempo real para personas con discapacidad auditiva en aplicaciones moviles sin conexion.
- Procesado por lotes en servidores modestos: al ser ONNX int8 y ejecutable con onnxruntime, puede desplegarse en CPU para transcripciones masivas sin GPU.
- Archivado y busqueda de audio: transcripcion de bibliotecas de audio para indexacion y busqueda por texto en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER, MMLU, etc.) en la informacion disponible. Los unicos datos de rendimiento documentados son mediciones del autor:

| Metrica | Valor (Pixel 6a, Tensor G1, 4 hilos, sherpa-onnx 2.0.1) |
|---|---|
| Factor de tiempo real (RTF) | aproximadamente 0,10 |
| RSS maximo en clip corto | aproximadamente 0,79 GB |
| RSS maximo en clip de 40 s | aproximadamente 1,13 GB |
| Tiempo de carga del modelo | aproximadamente 4 s |
| Verificacion contra exportacion independiente | transcripciones identicas en 26 grabaciones de prueba |

## Requisitos de hardware

- VRAM/RAM: el paquete completo ocupa unos 0,7 GB; el RSS en ejecucion medido es de 0,79-1,13 GB.
- GPU: no requiere GPU; esta disenado para CPU mediante onnxruntime. No se documentan requisitos de GPU dedicada.
- Cabe en hardware de consumo: probado en un Pixel 6a (Tensor G1) con 4 hilos; tambien es viable en portatiles y mini-PC con CPU moderna.
- Despliegue: sherpa-onnx (Python y Kotlin) con onnxruntime 1.17.1; compatible con el layout de sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.
- Latencia y throughput: RTF de aproximadamente 0,10 (unas 10 veces mas rapido que tiempo real) en el dispositivo de prueba; carga de modelo de unos 4 s.
- Ajustes: cuantizar los pesos del encoder con signo, desactivar el weight prepacking de onnxruntime o desactivar el memory arena degrada la decodificacion entre un 45 % y un 70 % y ahorra como maximo 20 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| chrmongeau/sherpa-onnx-nemo-parakeet-ultra-int8 | aproximadamente 0,6 B | 25 | ONNX int8 | CC-BY-4.0 | Esta ficha; reemplazo directo de v3-int8 |
| sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | aproximadamente 0,6 B | 25 | ONNX int8 | CC-BY-4.0 | Mismo layout y tokenizer; modelo base de la arquitectura |
| leogaudin/sherpa-onnx-nemo-parakeet-ultra-int8 | aproximadamente 0,6 B | 25 | ONNX int8 | CC-BY-4.0 | Exportacion comunitaria independiente; decoder, joiner y tokens identicos byte a byte |
| moondream/parakeet-ultra | aproximadamente 0,6 B | 25 | safetensors (float16) | CC-BY-4.0 | Pesos originales en layout transformers |

## Limitaciones y advertencias

- Es un modelo exclusivamente ASR: no genera texto libre, no razona ni soporta tool calling.
- No se han publicado evaluaciones de calidad (WER) por idioma; el rendimiento puede variar entre los 25 idiomas.
- La cabeza de deteccion de actividad de voz (vad_head) fue eliminada, por lo que no realiza VAD integrado.
- La conversion no ha sido revisada ni avalada por NVIDIA ni por Moondream; es una exportacion de terceros.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es obligatorio citar a NVIDIA, Moondream y sherpa-onnx.
- Riesgo de errores de transcripcion en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan metricas al respecto.
- La exportacion es determinista y verificada, pero conviene fijar un commit y comprobar SHA256SUMS al descargar.
- Requiere sherpa-onnx 2.0.1 (probado) y onnxruntime 1.17.1 para reproducir el comportamiento documentado.

## Enlaces

- HuggingFace: https://huggingface.co/chrmongeau/sherpa-onnx-nemo-parakeet-ultra-int8
- Modelo base (pesos): https://huggingface.co/moondream/parakeet-ultra
- Modelo base (arquitectura): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportacion comunitaria independiente: https://huggingface.co/leogaudin/sherpa-onnx-nemo-parakeet-ultra-int8
- Runtime sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Receta de exportacion: https://github.com/k2-fsa/sherpa-onnx/tree/master/scripts/nemo/parakeet-tdt-0.6b-v3
- Release de modelos ASR de sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx/releases/tag/asr-models
