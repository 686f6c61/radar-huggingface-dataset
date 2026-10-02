# androiddrew/kitten-tts-mini-0.8-fp16

## Resumen

Kitten TTS Mini 0.8 (fp16) es una conversion del modelo de sintesis de voz KittenML/kitten-tts-mini-0.8, publicada por el usuario androiddrew. No es un modelo reentrenado ni ajustado: parte del ONNX original cuantizado a int8 y reescribe el grafo para devolver cada capa cuantizada a coma flotante, generando una version fp16 pensada para ejecutarse integramente en GPU. El modelo original lo desarrolla KittenML y sigue la arquitectura StyleTTS 2, con unos 80 millones de parametros.

El problema que resuelve es concreto: ONNX Runtime, con el proveedor CUDA, mantiene las capas cuantizadas a int8 en la CPU, de modo que el modelo original apenas se acelera en GPU. Al de-cuantizar las capas y convertir el grafo a fp16, esta variante permite que toda la red corra en la GPU, con un fichero de 147 MB (frente a los 288 MB de la version fp32 del mismo autor). Es relevante para quienes despliegan TTS en GPUs y priorizan tamano de descarga o memoria frente a la velocidad maxima.

El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-10-01. El modelo conserva las 8 voces del original (Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki, Leo) y el mismo contrato de entrada/salida, por lo que es un reemplazo directo sin cambios en el codigo de llamada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (red neuronal para sintesis de voz) |
| Parametros totales | 80 millones (modelo mini 0.8 base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (original), fp16 (este repo), fp32 (variante del mismo autor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (modelo en fp16, entradas/salidas en float32 e int64) |

Datos adicionales: tamano del repositorio 147 MB; frecuencia de muestreo de salida 24.000 Hz; entradas `input_ids`, `style`, `speed`; salidas `waveform` y `duration`.

## Arquitectura y entrenamiento

El modelo sigue la arquitectura StyleTTS 2, un sistema de sintesis de voz neuronal. La variante aqui publicada no introduce ningun cambio arquitectonico respecto al original: es una conversion de formato. El proceso de conversion reescribe el grafo ONNX con el paquete `onnx`, sustituyendo 135 patrones `DynamicQuantizeLinear → MatMulInteger → Cast → Mul` por `MatMul`, 74 patrones `DynamicQuantizeLinear → ConvInteger → Cast → Mul` por `Conv` y 6 `DynamicQuantizeLSTM` por `LSTM`. Cada peso se de-cuantiza como `W = (W_int8 − zero_point) × scale`, usando las escalas y puntos cero almacenados en el grafo original, y los pesos del LSTM se transponen al formato estandar de ONNX.

Sobre el grafo fp32 resultante se aplica la herramienta `float16` de ONNX Runtime, manteniendo entradas y salidas en float32 e int64 (`keep_io_types`). Permanecen en fp32 los seis operadores `Resize`, el `RandomUniformLike` de ruido y un `CumSum`, por estar en la lista de bloqueo por defecto. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo RLHF o DPO, ya que la model card remite al repositorio original de KittenML. La conversion no puede recuperar el modelo en coma flotante original: el redondeo de la cuantizacion int8 queda fijado y fp16 anade su propio redondeo, de modo que la salida debe sonar como el modelo int8, no mejor.

## Capacidades

- Sintesis de texto a voz (text-to-speech) con salida en waveform a 24.000 Hz.
- Ocho voces predefinidas: Bella, Jasper, Luna, Bruno, Rosie, Hugo, Kiki, Leo.
- Control de velocidad de habla mediante el parametro de entrada `speed`.
- Control de estilo mediante el tensor de entrada `style`.
- Salida de la duracion del audio ademas de la waveform.
- Ejecucion en GPU con ONNX Runtime y el proveedor CUDA.
- Drop-in replacement del modelo original: mismo `config.json`, mismas entradas, salidas y voces.
- No dispone de tool calling, capacidades de agente, vision, audio de entrada ni modo de razonamiento; es exclusivamente un modelo de TTS.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Lectura por voz en aplicaciones moviles Android: la existencia de proyectos como KittenTTS-Android, que empaqueta modelos ONNX de KittenTTS con fonemizacion eSpeak-NG, demuestra que el modelo cabe en el APK y funciona sin conexion. Esta variante fp16 reduce el tamano de descarga a 147 MB.
- Asistentes de voz en tiempo real: con un factor de tiempo real (RTF) de 0.068 en p50 y un tiempo hasta el primer audio de 0.30 s en p50 sobre una RTX 4090, el modelo puede alimentar respuestas habladas interactivas con latencia baja.
- Accesibilidad para personas con discapacidad visual: sintesis local de texto de pantalla o documentos sin depender de servicios en la nube, con las ocho voces disponibles para adaptar el tono.
- Audiolibros y podcasts generados: al procesar peticiones por lotes en GPU, el modelo puede convertir grandes volumenes de texto en audio de forma automatizada.
- Sistemas de respuesta de voz interactiva (IVR) y locuciones telefonicas: la salida a 24.000 Hz y el control de velocidad permiten ajustar las locuciones a formatos de telefonia tras el correspondiente remuestreo.
- Lectura de notificaciones y alertas en escritorio o sistemas embebidos: el modelo es pequeno y puede ejecutarse en local, con la variante fp16 en GPU y las variantes fp32 o int8 en CPU.
- Generacion de voces para prototipos y demos de producto: al ser un reemplazo directo del original con el mismo contrato de API, permite cambiar entre int8, fp32 y fp16 midiendo en el hardware objetivo sin tocar el codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no aplican a un modelo de sintesis de voz. Si se proporcionan medidas de latencia y factor de tiempo real (RTF), medidas con `gokittentts` sobre ONNX Runtime 1.29.1 con CUDA 12, con 19 peticiones de estilo chat multiplicadas por 5 ejecuciones y la voz Bruno, en una RTX 4090:

| Variante (Mini 0.8, RTX 4090) | RTF p50 / p95 | Tiempo hasta el primer audio p50 / p95 |
|---|---|---|
| int8 (original) | 0.392 / 0.522 | 1.43 s / 2.61 s |
| fp32 | 0.051 / 0.108 | 0.22 s / 0.28 s |
| fp16 (este repo) | 0.068 / 0.146 | 0.30 s / 0.40 s |

El RTF es el tiempo de sintesis por segundo de audio, de modo que un valor menor indica mayor velocidad. En esta GPU concreta, fp32 resulta mas rapido que fp16, porque las convoluciones fp16 de ONNX Runtime tardan aproximadamente el doble; ni el layout NHWC ni la busqueda exhaustiva de cuDNN cambiaron ese resultado. No se ha ejecutado aun una comparacion lado a lado con el original int8 con ruido con semilla, duraciones coincidentes y distancia espectral; `validate.py` realiza esa validacion y genera pares WAV para escucha.

## Requisitos de hardware

- Tamano del fichero ONNX: 147 MB en fp16 (frente a 288 MB en fp32 y unos 79 MB en el int8 original).
- VRAM estimada para inferencia: no disponible de forma explicita; con 80 millones de parametros y un fichero de 147 MB, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor aporta medidas sobre una RTX 4090. Cualquier GPU NVIDIA con soporte CUDA y ONNX Runtime GPU deberia servir, dado el reducido tamano del modelo.
- Cabe en GPU de consumo: si, el modelo es de 80 millones de parametros y el fichero fp16 ocupa 147 MB.
- En CPU: el autor recomienda usar el repositorio fp32 o el modelo original int8, ya que fp16 esta pensado para GPU.
- Opciones de despliegue: KittenTTS (libreria Python, con `backend="cuda"`, disponible en `main` pero no en las releases 0.8 y 0.8.1), `gokittentts` (binario Go, configurable como modelo personalizado en `config.yaml`) y ONNX Runtime 1.29.1 con CUDA 12.
- Ejemplo de instalacion: `pip install "git+https://github.com/KittenML/KittenTTS@main" onnxruntime-gpu`.
- Latencia y throughput: RTF p50 de 0.068 y p95 de 0.146 en RTX 4090, con un tiempo hasta el primer audio de 0.30 s en p50 y 0.40 s en p95.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| androiddrew/kitten-tts-mini-0.8-fp16 (este repo) | 80 M | ONNX fp16 | 147 MB | apache-2.0 | Conversion para GPU, RTF p50 0.068 |
| androiddrew/kitten-tts-mini-0.8-fp32 | 80 M | ONNX fp32 | 288 MB | apache-2.0 | Mas rapido en RTX 4090, RTF p50 0.051 |
| KittenML/kitten-tts-mini-0.8 (original) | 80 M | ONNX int8 | ~79 MB | apache-2.0 | Modelo base; RTF p50 0.392 en GPU |
| KittenML/kitten-tts-micro-0.8 | 40 M | ONNX | ~40 MB | no disponible | Version mas pequena de la familia Kitten TTS |

No se dispone en la informacion proporcionada de otros modelos de TTS comparables con datos verificados de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- El audio no esta verificado contra el modelo original: la comparacion con ruido con semilla, duraciones coincidentes y distancia espectral no se ha ejecutado todavia. Hasta entonces, debe tratarse la salida como no verificada.
- La conversion acumula dos redondeos: el de la cuantizacion int8 original (ya fijado en los pesos) y el de la conversion a fp16. No recupera la calidad del modelo en coma flotante original; se espera que suene como el modelo int8.
- En una RTX 4090, la variante fp16 es mas lenta que la fp32 (RTF p50 0.068 frente a 0.051). El autor recomienda elegir fp16 solo cuando importen mas el tamano de descarga o la memoria de GPU que la velocidad maxima, y medir en la GPU propia.
- fp16 esta pensado para GPU. En CPU debe usarse la variante fp32 o el modelo original int8.
- No hay informacion sobre idiomas soportados en la model card; no debe asumirse cobertura multilingue.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de contexto para este modelo en la informacion proporcionada.
- Restricciones de licencia: apache-2.0 permite uso comercial. Los pesos y las voces (`voices.npz`, sin cambios) son propiedad de KittenML y deben atribuirse. El modelo se apoya en la arquitectura StyleTTS 2.
- El repositorio tiene 0 descargas y 0 likes, y fue creado recientemente (2026-10-01); no cuenta con validacion de la comunidad. En `config.yaml` se recomienda fijar una revision (commit) en lugar de usar `main`.
- Si se reproduce la conversion, el autor indica fijar el original a la revision `c02725660cea441db4c383af69f1f26f5cd00947` y verificar el hash `sha256 0f5bbae4fc4800c98dbc544a87ecfa79510de2fb8222db30d12e5bfe9177df91`.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/androiddrew/kitten-tts-mini-0.8-fp16
- Modelo base: https://huggingface.co/KittenML/kitten-tts-mini-0.8
- Variante fp32 del mismo autor: https://huggingface.co/androiddrew/kitten-tts-mini-0.8-fp32
- Modelo micro de la familia: https://huggingface.co/KittenML/kitten-tts-micro-0.8
- Repositorio KittenTTS: https://github.com/KittenML/KittenTTS
- Herramienta de benchmark y despliegue en Go: https://github.com/androiddrew/gokittentts
- Aplicacion Android offline basada en KittenTTS: https://github.com/dodola/KittenTTS-Android
- Ficha en ModelScope: https://www.modelscope.cn/models/KittenML/kitten-tts-mini-0.8
