# litert-community/parakeet-tdt_ctc-0.6b-ja

## Resumen

El modelo `litert-community/parakeet-tdt_ctc-0.6b-ja` es una conversión a LiteRT (antes TFLite) del modelo de reconocimiento automático de voz (ASR) japonés `nvidia/parakeet-tdt_ctc-0.6b-ja`, desarrollado por NVIDIA. Esta versión está optimizada para ejecución en dispositivo (on-device) en móviles Android, aprovechando la GPU mediante la API `CompiledModel` de LiteRT. Resuelve el problema de transcribir habla japonesa con puntuación en tiempo real sin depender de la nube, lo que resulta relevante para aplicaciones de privacidad, latencia y conectividad limitada.

La arquitectura combina un codificador FastConformer con una red de predicción LSTM y una capa de unión híbrida TDT-CTC (Token-and-Duration Transducer). El modelo tiene 0.6 mil millones de parámetros y procesa ventanas de audio de 5 segundos. Se distribuyen cuatro archivos `.tflite` (float32 e int8 con cuantización dinámica, en versiones stateless y stateful) junto con un tokenizador. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + LSTM (prediction network) + joint TDT-CTC |
| Parametros totales | 0.6 mil millones (0.6B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Ventana de audio de 5 segundos (log-mel `[1, 80, 500]`) |
| Tipos de cuantizacion | float32, int8 dynamic-range (DRQ) |
| Idiomas soportados | Japones (ja) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | tflite (LiteRT) |

## Arquitectura y entrenamiento

El modelo base fue desarrollado por NVIDIA y entrenado con datos de habla japonesa, aunque no se especifican los detalles del corpus (número de tokens, composición del dataset o uso de RLHF/DPO) en la información disponible. La arquitectura es un sistema híbrido TDT-CTC: un codificador FastConformer extrae características de audio (log-mel de 80 bandas) y produce estados de 1024 dimensiones; una red de predicción LSTM (640 unidades) procesa los tokens de salida; y una capa de unión combina ambas ramas para generar logits sobre un vocabulario de 3072 tokens más un token blank (id 3072) y 5 duraciones TDT `[0, 1, 2, 3, 4]`.

La conversión a LiteRT exporta dos firmas: `encode` (codificador FastConformer) y `decode` (LSTM + joint), siguiendo el mismo diseño que el ejemplo oficial de reconocimiento de voz de LiteRT. Se incluyen variantes stateless (decodificación de 64 tokens por llamada) y stateful (decodificación de 4 tokens con una firma adicional `decode_1` para pasos individuales, que reduce la latencia). El preprocesamiento replica el de NeMo: audio mono de 16 kHz, preénfasis 0.97, n_fft 512, ventana de 25 ms, hop de 10 ms, 80 bandas mel y normalización por característica.

## Capacidades

- Reconocimiento de voz japonesa con puntuación, transcribiendo audio de 16 kHz en texto.
- Ejecución completamente en dispositivo (on-device) sobre GPU móvil mediante LiteRT, sin conexión a internet.
- Soporte de decodificación stateless (64 tokens por llamada) y stateful (paso a paso con estados LSTM persistentes), esta última más rápida.
- Salida de tokens con duraciones TDT, útil para alineación temporal.
- Compatible con la API `CompiledModel` de LiteRT y con el ejemplo oficial de reconocimiento de voz de `litert-samples`.
- Incluye tokenizador en formato Hugging Face tokenizers, con paridad de decodificación verificada.

## Casos de uso

- Transcripción de voz en tiempo real en aplicaciones móviles: el modelo procesa ventanas de 5 segundos con latencia de ~2.1 s (f32 en GPU de Pixel 8a) o ~0.45 s con decodificación stateful, permitiendo dictado de notas, mensajes o búsquedas por voz en japonés.
- Subtitulado automático de vídeos y podcasts: al ejecutarse localmente, se pueden transcribir archivos de audio en lote sin subir datos a la nube, ideal para creadores de contenido que trabajan con japonés.
- Asistente de voz en dispositivos Android: integrable en apps de asistencia personal para comandos de voz, con la ventaja de funcionar sin conexión y preservar la privacidad del usuario.
- Accesibilidad para personas con discapacidad auditiva: convierte conversaciones o avisos sonoros en texto en tiempo real, mejorando la inclusión en entornos cotidianos.
- Análisis de reuniones y llamadas: transcribe grabaciones de reuniones en japonés para generar actas o búsquedas posteriores, con la posibilidad de ejecutarse en el propio dispositivo para cumplir requisitos de confidencialidad.
- Traducción simultánea como paso previo: la transcripción local alimenta un sistema de traducción automática, reduciendo la latencia y los costes de API al no enviar audio a servidores externos.

## Benchmarks y rendimiento

La calidad del modelo base (según la ficha de NVIDIA) se mide con CER (Character Error Rate) en varios conjuntos de datos japoneses:

| Conjunto de datos | CER |
|---|---|
| JSUT basic5000 | 6.4 |
| Common Voice 8 | 7.1 |
| TEDxJP-10K | 9.0 |

La fidelidad de la conversión a LiteRT se evaluó sobre un audio de prueba de 137 segundos (28 ventanas de 5 s):

| Variante | Ventanas con coincidencia exacta con NeMo | CER vs NeMo |
|---|---|---|
| f32 | 28 / 28 | 0.0000 |
| i8 (DRQ) | 14 / 28 | 0.0610 |

Rendimiento medido en Pixel 8a (Tensor G3 / Mali-G715, LiteRT 2.1.5):

| Metrica | f32 en GPU | i8 en CPU |
|---|---|---|
| Compilacion | 25–37 s | 5.2 s |
| `encode` (ventana de 5 s) | 239 ms | 1157 ms |
| `decode` (una llamada stateless) | 95 ms | 380 ms |

Con decodificación stateful (f32 en GPU): `decode` 16 ms, `decode_1` 8 ms por llamada; una ventana de 5 s se procesa en ~0.45 s de trabajo de decode+encode.

## Requisitos de hardware

- Memoria: los archivos `.tflite` pesan 2.4 GB (f32) y 608 MB (i8). Se requiere al menos esa cantidad de memoria libre en el dispositivo.
- GPU compatible: la variante f32 funciona en GPU Mali (Pixel 8a) y Adreno (Galaxy S26 con Snapdragon 8 Elite Gen 5). La variante i8 no compila en GPUs Mali ni Adreno (ver limitaciones), por lo que se ejecuta en CPU.
- CPU: la variante i8 puede ejecutarse en CPU, aunque con mayor latencia (encode ~1.16 s por ventana).
- Opciones de despliegue: LiteRT `CompiledModel` API en Android (Kotlin/Java) y Python con `ai_edge_litert`. También es posible usar el ejemplo oficial de `litert-samples` para reconocimiento de voz.
- Latencia: en Pixel 8a, f32 en GPU transcribe 5 s de audio en ~2.1 s (stateless) o ~0.45 s (stateful). En CPU con i8, el encode tarda ~1.16 s por ventana.

## Comparativa con modelos similares

No se dispone de información sobre modelos ASR japoneses comparables (mismo tamaño o misma tarea) en los datos proporcionados. La comparativa con el modelo original de NVIDIA (NeMo) se refleja en la sección de benchmarks, donde la conversión f32 alcanza paridad exacta (CER 0.0000) y la i8 introduce una degradación del 6.1% de CER.

## Limitaciones y advertencias

- La variante i8 falla al compilar en GPUs Mali (Pixel 8a) y Adreno (Galaxy S26), mostrando el error `Unable to parse bc coord for BATCH axis` en la generación de código OpenCL. Solo se ejecuta en CPU en esos dispositivos. La variante f32 sí funciona en GPU.
- El decodificador stateful incluido en la aplicación de ejemplo `litert-samples` tiene dos defectos conocidos (adopción de estados en pasos blank y cambio prematuro a `decode_1`) que reducen la precisión (16/28 ventanas, CER 6.25%). Se recomienda usar los archivos stateless o aplicar el fix propuesto en el PR `litert-samples#278`.
- El modelo solo soporta japonés; no hay capacidades multilingües.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor original (NVIDIA y litert-community).
- No se han documentado sesgos específicos, pero al ser un modelo ASR entrenado con datos de habla japonesa, puede presentar errores en acentos regionales, habla rápida o ruido de fondo no representado en los conjuntos de evaluación.
- El preprocesamiento requiere audio a 16 kHz mono; entradas con otras tasas de muestreo deben convertirse previamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/parakeet-tdt_ctc-0.6b-ja
- Modelo base de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt_ctc-0.6b-ja
- Ejemplo oficial de LiteRT para reconocimiento de voz: https://github.com/google-ai-edge/litert-samples/tree/main/samples/litert/speech_recognition
- Script de conversión de Parakeet a LiteRT: https://github.com/google-ai-edge/litert-samples/blob/main/compiled_model_api/speech_recognition/convert/parakeet_tdt.py
- PR con fix para el decodificador stateful: https://github.com/google-ai-edge/litert-samples/pull/278
