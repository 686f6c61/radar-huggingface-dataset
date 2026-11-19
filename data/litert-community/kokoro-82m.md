# litert-community/Kokoro-82M

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de 82 millones de parámetros desarrollado originalmente por hexgrad, basado en la arquitectura StyleTTS 2 combinada con un vocoder ISTFTNet. Esta ficha concreta corresponde al empaquetado que el equipo litert-community ha realizado para LiteRT-LM y la tarea MediaPipe Text-to-Speech, distribuyendo el modelo como un único fichero `.litertlm` que integra pesos acústicos y de vocoder en INT8, las 54 voces de la versión 1.0 y los front-ends de normalización de texto y grafema-a-fonema para nueve idiomas y dialectos.

La relevancia de este empaquetado radica en que elimina las dependencias de Python, red y librerías fonéticas GPL del modelo original, permitiendo inferencia totalmente on-device en Android, iOS, macOS, Web (WASM) y C++ con una pila completa bajo licencia Apache-2.0. El resultado es un sistema de TTS multilingüe que sintetiza a 24 kHz y que, según el autor, es entre 6 y 10 veces más rápido que tiempo real en GPU de un Galaxy S26 con precisión FP16 y un pico de memoria de aproximadamente 0,35 GB.

El modelo resuelve el caso de uso de voz sintética embebida en aplicaciones móviles, asistentes locales y pipelines de LLM on-device donde no es viable enviar texto a un servicio en la nube. Su tamaño reducido (295 MB por fichero) y su soporte de streaming de tokens desde un LLM permiten integrarlo en flujos conversacionales de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (modelo acústico) + ISTFTNet (vocoder) |
| Parametros totales | 82 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | INT8 en modelo acústico y vocoder; FP16 y FP32 en ejecución GPU |
| Idiomas soportados | Inglés americano y británico, español, francés, italiano, portugués brasileño, hindi, chino mandarín, japonés (9 idiomas/dialectos) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM); `.tflite` en la carpeta `legacy/` (obsoleto) |

## Arquitectura y entrenamiento

El modelo original hexgrad/Kokoro-82M emplea StyleTTS 2, un sistema de TTS de dos etapas en el que un modelo acústico genera representaciones intermedias condicionadas por estilo y un vocoder ISTFTNet las convierte en forma de onda. Esta versión empaquetada mantiene los pesos acústicos y de vocoder en INT8 y exporta el grafo del vocoder para que los valores intermedios permanezcan dentro del rango FP16, lo que habilita ejecución nativa FP16 en GPU y reduce aproximadamente a la mitad la latencia del vocoder frente a FP32.

El bundle incorpora los front-ends completos de normalización de texto y conversión grafema-a-fonema para los nueve idiomas soportados, eliminando la necesidad de librerías fonéticas externas (habitualmente GPL) y de dependencias de Python. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Síntesis de voz multilingüe a 24 kHz mono en formato PCM float32 en el rango [-1.0, 1.0].
- 54 voces empaquetadas de Kokoro v1.0, con cambio de voz e idioma por enunciado sin recargar pesos.
- Inferencia totalmente on-device sin red ni Python, en Android, iOS, macOS, Web y C++.
- Streaming de síntesis de baja latencia (`synthesizeStream` / `synthesize_stream`) con segmentación automática por frases y cláusulas.
- Streaming de tokens desde un LLM on-device (`openStream` / `pushText` / `finishInput`) para TTS en tiempo real.
- Alineación temporal a nivel de palabra (`wordTimestamps` / `word_timestamps`) con offsets de carácter y tiempos de inicio y fin, útil para resaltado de lectura.
- Control de velocidad de habla (`speakingRate`, rango (0.0, 4.0], por defecto 1.0).
- Cancelación de barge-in sin bloqueos.
- Inferencia de idioma automática a partir del `voiceId` cuando no se especifica `locale`.

## Casos de uso

- Lectura por voz en aplicaciones móviles: integración mediante la tarea MediaPipe TextToSpeech para narrar artículos o libros con resaltado palabra a palabra gracias a los timestamps incluidos en cada `AudioChunk`.
- Asistentes conversacionales on-device: el streaming de tokens desde un LLM local (`openStream` + `pushText`) permite que la síntesis empiece en cuanto llega la primera frontera de frase, reduciendo la latencia percibida en un asistente sin conexión.
- Accesibilidad: conversión de texto a voz para usuarios con discapacidad visual en Android e iOS, con cambio de voz e idioma por enunciado y control de velocidad entre 0.0 y 4.0.
- Aplicaciones de aprendizaje de idiomas: uso de las 54 voces en nueve idiomas y dialectos para practicar pronunciación, con resaltado sincronizado del texto leído mediante `wordTimestamps`.
- Lectura de notificaciones y contenido dinámico en wearables y dispositivos de bajos recursos: el fichero de 295 MB y el pico de memoria de ~0,35–0,5 GB en GPU permiten ejecutarlo en hardware móvil sin backend.
- Integración en pipelines web (WASM) para demos o herramientas de accesibilidad en navegador, usando la variante CPU/GPU cuando no hay aceleración GPU disponible.
- Generación de audio para prototipos y pruebas de UX: la licencia Apache-2.0 y la ausencia de dependencias GPL facilitan su incorporación en productos comerciales.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en la model card:

| Metrica | Valor |
|---|---|
| Velocidad de sintesis | 6–10× mas rapido que tiempo real en GPU de Galaxy S26 con FP16 |
| Pico de memoria (version GPU) | ~0,35–0,5 GB |
| Pico de memoria (version CPU/GPU) | ~0,7–0,95 GB |
| Benchmark de inteligibilidad | 800 frases, 8 idiomas; iguala o supera a Kokoro original en servidor |
| Tamano del fichero | 295 MB por variante |

No se han publicado en la información disponible resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo TTS.

## Requisitos de hardware

- VRAM/RAM estimada: ~0,35–0,5 GB de pico con la variante GPU (`kokoro_int8_gpu_fp16.litertlm`); ~0,7–0,95 GB de pico con la variante CPU/GPU (`kokoro_int8_fp16.litertlm`).
- GPU recomendadas: cualquier GPU soportada por el delegado GPU de LiteRT (OpenCL, WebGPU o Metal); el autor cita un Galaxy S26 como referencia de rendimiento.
- Compatibilidad con GPU de consumo: sí, siempre que el delegado GPU de LiteRT soporte el dispositivo; en equipos sin GPU utilizable debe usarse la variante CPU/GPU.
- Opciones de despliegue: LiteRT-LM (`--backend=gpu` o `--backend=cpu`), tarea MediaPipe TextToSpeech, con librerías aceleradoras en `prebuilt/android_arm64/*.so` en Android; soporte para Android, iOS, macOS, Web (WASM) y C++.
- Latencia y throughput: 6–10× más rápido que tiempo real en GPU de Galaxy S26 con FP16; el vocoder en FP16 reduce aproximadamente a la mitad la latencia frente a FP32.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Kokoro-82M (litert-community, esta ficha) | 82 M | 9 idiomas/dialectos | Apache-2.0 | `.litertlm`, on-device (Android, iOS, Web, C++) | Incluye front-ends G2P y 54 voces; sin dependencias GPL |
| hexgrad/Kokoro-82M (original) | 82 M | 9 idiomas/dialectos | Apache-2.0 | Pesos PyTorch, requiere Python y librerías fonéticas | Modelo base; no optimizado para on-device |
| Modelos TTS en la nube (p. ej. servicios comerciales) | no disponible | variable | propietaria | API remota | Requieren red y no son on-device |

No se dispone en la información proporcionada de comparativas numéricas con otros modelos TTS on-device de tamaño similar.

## Limitaciones y advertencias

- La variante GPU, ejecutada con `Delegate.CPU` o sin acelerador GPU disponible, produce audio potencialmente más ruidoso; en ese caso debe usarse `kokoro_int8_fp16.litertlm`.
- El fichero `.tflite` FP32 en `legacy/` está obsoleto y limitado a inglés y CPU; no debe usarse en integraciones nuevas.
- No se dispone de información sobre sesgos de voces o dialectos, ni sobre tasas de alucinación o errores de pronunciación por idioma.
- La calidad del habla depende de la corrección de los front-ends G2P incluidos; no se documentan limitaciones específicas por idioma en la información disponible.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones de las voces y datos de entrenamiento del modelo base antes de uso comercial a gran escala.
- El modelo es TTS, no un LLM: no soporta tool calling, razonamiento multi-paso ni generación de texto.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Kokoro-82M
- Modelo base: https://huggingface.co/hexgrad/Kokoro-82M
- LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- MediaPipe Text-to-Speech Task: https://ai.google.dev/edge/mediapipe/solutions/audio/text_to_speech
- Ejemplos: https://github.com/google-ai-edge/litert-samples
- Carpeta legacy: https://huggingface.co/litert-community/Kokoro-82M/tree/main/legacy
- Papers referenciados en los tags: arxiv:2306.07691, arxiv:2203.02395
