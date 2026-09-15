# KitsuMate/neutts-2e-onnx

## Resumen

KitsuMate/neutts-2e-onnx es una conversion a formato ONNX del modelo de sintesis de voz (TTS) en ingles NeuTTS-2E de Neuphonic, un sistema de voz fija con control emocional explicito. No se trata de un modelo entrenado desde cero, sino de un empaquetado de inferencia multiplataforma: el autor publica el backbone convertido en cuatro perfiles de precision (FP32, FP16, INT8 e INT4) junto con el decodificador de codec compartido, de modo que se pueda ejecutar en ONNX Runtime (CPU y CUDA) e integrarse en Unity sin depender de PyTorch ni de un fonemizador en tiempo de ejecucion.

El modelo expone cuatro voces (`emily`, `paul`, `sophie`, `steven`) y siete emociones (`angry`, `disgusted`, `fearful`, `happy`, `neutral`, `sad`, `surprised`), con `emily`/`neutral` como valores por defecto. El backbone esta etiquetado como `qwen3` en HuggingFace, lo que apunta a una arquitectura transformer generativa de tokens de audio; el decodificador NeuCodec transforma esos tokens en audio mono a 24 kHz. El presupuesto de contexto es de 2048 tokens, que incluyen la referencia, el texto y los tokens generados.

Su relevancia practica esta en el despliegue: al ser ONNX, se puede ejecutar en CPU sin GPU y con Huella de memoria reducida (349 MB en INT8 frente a 1390 MB en FP32). Se publica como version preliminar con verificacion numerica automatizada, pero sin revision subjetiva de escucha completada segun la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer generativo de tokens de audio (etiquetado `qwen3`) mas decodificador de codec neuronal NeuCodec |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (incluye referencia, texto y tokens generados) |
| Tipos de cuantizacion | FP32 (referencia), FP16 (solo almacenamiento de pesos, computo FP32), INT8 dinamico para CPU, INT4 compacto para CPU |
| Idiomas soportados | ingles (`en`) |
| Licencia | NeuTTS Open License v1.0 para el backbone (con restriccion de uso comercial por umbral de facturacion anual de 5 millones de USD); Apache-2.0 para el codec |
| Formato de pesos | ONNX (`backbone_fp32.onnx`, `backbone_fp16.onnx`, `backbone_int8.onnx`, `backbone_int4.onnx` + companion `.data`, `codec_decoder.onnx`); configuracion en `tokenizer.json` y `neutts.json` |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del checkpoint original: no se indican numero de tokens, composicion del corpus, ni si hubo fases de RLHF o DPO. Lo que si documenta esta ficha es la topologia de inferencia de la conversion. El sistema se divide en dos grafos ONNX: un backbone autoregresivo que acepta una cache vacia durante el prefill y caches pobladas para los tokens posteriores, devolviendo unicamente los logits de la ultima posicion, y un decodificador de codec que acepta codigos de voz `int32` con forma `[1,1,N]` y devuelve audio `float32` mono a 24 kHz con `480*N-480` muestras. Cada token de audio equivale aproximadamente a un segundo dividido entre 50, es decir, unos 20 ms de audio.

El autor remarca dos innovaciones de ingenieria. La primera es la separacion estricta de perfiles: FP32 usa operadores estandar con opset 17, mientras que INT4 recurre a operadores contrib de ONNX Runtime con opset 21. La segunda es la honestidad sobre FP16: se trata unicamente de almacenamiento de pesos en media precision con aritmetica e interfaces de tensor en FP32, por lo que reduce el tamano de descarga pero no promete menor uso de memoria en ejecucion. El muestreo por defecto replica el comportamiento del checkpoint PyTorch original con temperatura 1 y top-k 50; la interfaz de Unity anade TopP y MinP opcionales (0,95 y 0,05 para el muestreador de la comunidad).

## Capacidades

- Sintesis de voz en ingles con voz fija: cuatro hablantes predefinidos (`emily`, `paul`, `sophie`, `steven`).
- Control emocional explicito sobre siete emociones: `angry`, `disgusted`, `fearful`, `happy`, `neutral`, `sad`, `surprised`.
- Inferencia con cache de clave/valor, lo que permite generacion token a token sin recalcular el prefill.
- Decodificacion a audio PCM flotante mono a 24 kHz, con `480*N-480` muestras de salida para `N` codigos de voz.
- Ejecucion sin PyTorch ni fonemizador en Unity; toda la preparacion de la referencia es offline.
- Perfiles de precision intercambiables para adaptar el coste entre fidelidad y velocidad (FP32 como referencia, INT4 como opcion mas rapida en CPU).
- No soporta clonacion de voz personalizada, streaming, ni las variantes Air y Nano.
- No aplica la marca de agua opcional Perth; las salidas no se declaran marcadas.
- No hay soporte multiidioma ni capacidades de vision o audio de entrada.

## Casos de uso

- Narracion localizada en aplicaciones de escritorio: al ser un grafo ONNX ejecutable en CPU, se puede empaquetar dentro de una aplicacion sin dependencias pesadas de Python y generar locuciones con emoción fija (`happy`, `sad`) por boton o menu.
- Doblaje de personajes en videojuegos con Unity: la model card documenta un flujo especifico para Unity con validation propia, lo que permite asignar una voz y una emocion a un NPC y sintetizar lineas breves de guion en tiempo de ejecucion.
- Accesibilidad y lectores de pantalla: la ventana de 2048 tokens admite fragmentos de texto largos por peticion, y cada 50 tokens generan aproximadamente un segundo de audio, lo que facilita presupuestar la longitud de la locucion con un limite de tokens de salida (por ejemplo, 700).
- Generacion de audio para prototipos y pruebas de producto: los perfiles INT8 e INT4 (349 MB y 371 MB de backbone) permiten iterar rapido en maquinas sin GPU, aceptando una perdida de fidelidad medible frente a FP32.
- Produccion de contenido emocional controlado: siete emociones etiquetadas de forma explicita permiten generar variantes de una misma linea de guion para audiolibros, anuncios o podcasts sin cambiar de hablante.
- Integracion en pipelines automatizados de audio: el formato ONNX con entradas y salidas documentadas en `graph-schemas.json` facilita el encadenado con herramientas de postproceso, normalizacion o exportacion a PCM entero.
- Evaluacion comparativa de cuantizacion: los cuatro perfiles y los informes de validacion por perfil permiten medir el compromiso entre velocidad de decodificacion (24,1 frente a 52,6 tokens/s) y acuerdo de tokens con la referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, dado que se trata de un modelo de sintesis de voz. El autor si publica una comparativa de rendimiento en CPU con las mismas tres peticiones, 153 pasos de prefill/cache por perfil y cuatro hilos de ONNX Runtime. La medicion excluye el muestreo, la decodificacion del codec y la creacion de sesion, por lo que no es una cifra end-to-end ni un benchmark aislado (incluye cargas de validacion concurrentes).

| Perfil | Backbone (MB) | Tokens de decodificacion/s | Acuerdo argmax | Solapamiento top-50 |
|---|---:|---:|---:|---:|
| FP32 | 1390,2 | 24,1 | 100,0% | 100,0% |
| FP16 | 695,8 | 24,0 | 100,0% | 100,0% |
| INT8 | 349,3 | 44,4 | 81,7% | 88,1% |
| INT4 | 370,9 | 52,6 | 75,8% | 79,8% |

A partir de la equivalencia documentada de 50 tokens por segundo de audio, y como estimacion derivada de esas cifras (no una medicion end-to-end), el perfil FP32 produciria del orden de 0,48 segundos de audio por segundo de decodificacion del backbone, y el perfil INT4 alrededor de 1,05 segundos por segundo. Ademas, `asr-validation.json` recoge transcripciones independientes con Whisper-base y tasas de error de palabra, pero los valores concretos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM y memoria: el backbone ocupa 1390,2 MB en FP32, 695,8 MB en FP16, 349,3 MB en INT8 y 370,9 MB en INT4 (mas el fichero companion `.data` en el caso INT4). El repositorio completo suma 3,6 GB.
- Cabe en CPU: si, es el escenario principal documentado. Los perfiles INT8 e INT4 estan pensados especificamente para ONNX Runtime CPU.
- Cabe en GPU consumer: por tamano de grafo, los cuatro perfiles entran en cualquier GPU consumer con margen suficiente de memoria libre para pesos y activaciones; no se especifican modelos concretos de GPU (A100, H100, RTX 4090, etc.) en la informacion disponible.
- Backends de despliegue: ONNX Runtime con CPUExecutionProvider o CUDAExecutionProvider; motor NeuTTS de KitsuMate ONNX TTS en Unity; uso standalone en Python mediante `tools/validate.py` y las dependencias de `tools/requirements.txt`. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Throughput medido: 24,1 tokens/s en FP32, 24,0 en FP16, 44,4 en INT8 y 52,6 en INT4 (cuatro hilos de ORT, sin muestreo ni decodificacion del codec).
- Latencia end-to-end: no disponible; el autor declara explicitamente que no se hace ninguna afirmacion de rendimiento en tiempo real y que `cuda-validation.json` incluye profiling y validacion concurrente, por lo que solo sirve como comprobacion de ejecucion.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa con terceros se marca como no disponible. La unica referencia directa es el checkpoint original del que deriva esta conversion.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| KitsuMate/neutts-2e-onnx (esta ficha) | no disponible | 2048 tokens | ingles | NeuTTS Open License v1.0 (backbone) + Apache-2.0 (codec) | ONNX (FP32/FP16/INT8/INT4) |
| neuphonic/neutts-2e (checkpoint base) | no disponible | no disponible | ingles | NeuTTS Open License v1.0 | PyTorch |
| Otros modelos TTS comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Version preliminar: la revision subjetiva de escucha esta pendiente y la regresion completa en Unity no esta cerrada, segun `unity-validation.json`. Las comprobaciones numericas y de ASR no establecen calidad subjetiva de voz o emocion.
- Digitos y horas literales son poco fiables tanto en el checkpoint original como en ambas conversiones; hay que escribir los numeros en palabras ("three forty-five" en lugar de "3:45"). No se aplica expansion automatica de numeros.
- Perdida de fidelidad en cuantizacion: INT8 baja al 81,7% de acuerdo argmax con FP32 e INT4 al 75,8%. Las salidas cuantizadas difieren y requieren revision de escucha.
- Picos del codec: algunas muestras crudas superan el rango +/-1, por lo que hay que normalizar o limitar el audio antes de exportar o reproducir en PCM entero para evitar clipping. Los WAV de ejemplo del repositorio usan PCM entero, pero el runtime devuelve la onda flotante sin procesar.
- Restriccion de licencia: el backbone mantiene la NeuTTS Open License v1.0, que incluye restriccion de uso comercial y un umbral de facturacion anual de 5 millones de USD. La redistribucion esta sujeta a las condiciones de licencia y aviso. Conviene revisar `LICENSE` antes de cualquier uso en produccion.
- Sin marca de agua: no se aplica la marca opcional Perth y las salidas no se declaran marcadas, lo que puede ser relevante para requisitos de trazabilidad.
- Funcionalidad ausente: no hay clonacion personalizada, streaming, ni variantes Air y Nano en esta publicacion.
- Idioma unico: solo ingles. No hay soporte multilingue documentado.
- Las cifras de rendimiento en CPU incluyen cargas concurrentes de validacion y no son benchmarks aislados; no deben usarse como estimacion end-to-end.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KitsuMate/neutts-2e-onnx
- Modelo base (checkpoint PyTorch de referencia): https://huggingface.co/neuphonic/neutts-2e
- Licencia del backbone: `LICENSE` dentro del repositorio (NeuTTS Open License v1.0)
- Licencia del codec: `CODEC_LICENSE` (Apache-2.0) y `ATTRIBUTION.md`
- Informes de validacion incluidos en el repositorio: `reference-validation.json` (paridad de prompt en 56 casos), `validation-<profile>.json` (28 combinaciones hablante/emocion por perfil), `asr-validation.json` (transcripciones Whisper-base y WER), `cuda-validation.json` (colocacion de nodos CUDA/CPU y tiempos medidos), `unity-validation.json` (comprobaciones en Unity y carencias pendientes), `graph-schemas.json` (nombres, tipos y dimensiones de entradas/salidas), `profile-comparison-CPUExecutionProvider.json` (comparativa de tiempos con entradas emparejadas)
- Herramienta de validacion standalone: `tools/validate.py` y `tools/requirements.txt`
- Muestras de audio: directorio `samples/`
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
