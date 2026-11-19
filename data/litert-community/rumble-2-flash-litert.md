# litert-community/Rumble-2-Flash-LiteRT

## Resumen

Rumble-2-Flash-LiteRT es un paquete autocontenido en formato `.litertlm` para reconocimiento automático del habla (ASR) en dispositivo, derivado del modelo Reson8/Rumble-2-Flash, un modelo Qwen3-ASR de aproximadamente 0,5 mil millones de parámetros que cubre 45 idiomas. Lo publica la organización litert-community, vinculada al ecosistema LiteRT-LM de Google AI Edge, y está pensado para ejecutarse sin Python ni conexión de red en tiempo de inferencia, sobre CPU en escritorio y Android.

El paquete integra todo el pipeline en un único archivo de 596 MB: el front-end log-mel de 128 bins, un codificador de audio de 18 capas, un proyector, un decodificador Qwen3 de 14 capas con caché KV con estado, el embedder de tokens, el tokenizador de Hugging Face y los metadatos `LlmMetadata` / `ExecutorMetadata`. Los pesos del codificador, el proyector y el decodificador se cuantizan a INT8 (rango dinámico).

Su relevancia actual reside en que demuestra un flujo de transcripción de voz totalmente local y multilingüe en Android, con ventanas deslizantes de 5 segundos que el runtime LiteRT-LM Omni fusiona en las zonas de solapamiento. El detalle crítico es que Rumble-2-Flash remapea el vocabulario de Qwen3, por lo que su token `<asr_text>` es 99623 en lugar del 151704 estándar; sin sobrescribir `decode_skip_until_token_id` en el runtime, todas las transcripciones salen vacías.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Front-end log-mel de 128 bins + codificador de audio de 18 capas (`tf_lite_audio_encoder_hw`) + proyector + decodificador Qwen3 de 14 capas (`tf_lite_prefill_decode` + `tf_lite_embedder`) |
| Parametros totales | Aproximadamente 0,5 mil millones (modelo base Reson8/Rumble-2-Flash) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; procesamiento por ventanas deslizantes de 5 segundos |
| Tipos de cuantizacion | INT8 de rango dinámico en codificador, proyector y decodificador |
| Idiomas soportados | 45 idiomas: af, ar, bn, bs, ca, ceb, cs, da, de, el, en, es, eu, fa, fi, fil, fr, hi, hr, hu, id, is, it, ja, ko, lt, lv, mk, ms, mt, nb, nl, pl, pt, ro, ru, sq, sr, sv, th, tr, uk, vi, yue, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM con pesos TFLite); archivo `rumble_2_flash_5s_i8.litertlm` de 596 MB |

## Arquitectura y entrenamiento

El modelo base es un Qwen3-ASR de aproximadamente 0,5B parámetros, lo que implica un transformer decoder-only con adaptación para entrada de audio. En este paquete LiteRT-LM, la cadena de procesamiento se compone de un front-end log-mel de 128 bins, un codificador de audio de 18 capas (`tf_lite_audio_encoder_hw`), un proyector que alinea las representaciones acústicas con el espacio del decodificador, y un decodificador Qwen3 de 14 capas que opera con caché KV con estado (stateful KV cache) y un vocabulario de 99.630 tokens.

La innovación principal del paquete no es arquitectónica sino de empaquetado y despliegue: un único archivo `.litertlm` contiene todos los componentes, incluidos el tokenizador y los metadatos de ejecución, de modo que la inferencia no requiere Python ni acceso a red. El procesamiento es en streaming mediante ventanas deslizantes de 5 segundos que la sesión ASR de LiteRT-LM fusiona en los solapamientos. El estilo de transcripción queda fijado en el momento de la exportación: números como dígitos (`<digits>`), muletillas eliminadas (`<nofiller>`), palabras repetidas conservadas (`<verbatim>`) y detección automática de idioma. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO en el modelo base.

## Capacidades

- Transcripción de voz a texto (speech-to-text) en 45 idiomas, incluidos español, catalán, euskera y gallego en el conjunto de etiquetas del modelo base.
- Detección automática de idioma durante la transcripción.
- Procesamiento en streaming mediante ventanas deslizantes de 5 segundos con fusión de solapamientos.
- Normalización de salida fija: números como dígitos, muletillas eliminadas y palabras repetidas conservadas.
- Ejecución completamente local en dispositivo (on-device), sin Python ni red en tiempo de inferencia.
- Entrada WAV de cualquier frecuencia de muestreo y número de canales, remuestreada internamente a 16 kHz mono.
- Integración con LiteRT-LM Omni mediante `omni_runner` (escritorio y Android) y API C++ (`OmniEngine`).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de notas de voz en Android: el paquete se ejecuta sobre CPU con `omni_runner` en arm64 y permite convertir grabaciones del micrófono en texto sin enviar audio a la nube, usando el flujo push-to-talk documentado con Termux y `termux-microphone-record`.
- Subtitulado local de reuniones y entrevistas: las ventanas de 5 segundos con fusión de solapamientos permiten transcribir audio continuo de forma incremental, adecuado para actas o resúmenes posteriores en escritorio.
- Aplicaciones de accesibilidad: dictado en dispositivo para usuarios con movilidad reducida, con la ventaja de que ningún dato de voz abandona el teléfono y no se requiere conectividad.
- Procesamiento por lotes de archivos WAV en servidores sin GPU: al ser un modelo de aproximadamente 0,5B en INT8 con un bundle de 596 MB, puede ejecutarse en CPU para transcribir archivos pregrabados en pipelines internos.
- Transcripción multilingüe de contenido audiovisual: la cobertura de 45 idiomas y la detección automática de idioma lo hacen útil para catalogar material en varios idiomas sin seleccionar el idioma manualmente.
- Integración en aplicaciones C++ nativas: mediante `OmniEngine::Create` con `Speech2TextMetadata` se puede incrustar la transcripción en apps Android o de escritorio escritas en C++ sin dependencias de Python.
- Prototipado de asistentes de voz offline: el bundle autocontenido simplifica la distribución de una demo funcional de ASR en un solo archivo, útil para validar producto antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal; el paquete está orientado a CPU. El archivo ocupa 596 MB en disco y los pesos son INT8, por lo que la memoria necesaria en ejecución es del orden de varios cientos de MB, aunque no se publica una cifra exacta.
- GPU recomendadas: el backend probado es CPU; el soporte de GPU figura como no probado (GPU untested) en la model card.
- Compatibilidad con GPU de consumo: no confirmada; el diseño apunta a CPU en escritorio y Android arm64.
- Opciones de despliegue: LiteRT-LM Omni (`omni_runner` en escritorio macOS/Linux y Android arm64), API C++ (`OmniEngine`, enlazando `//omni:omni_engine`, `//omni:omni_session` y `//omni/speech2text:qwen3_asr`), y ejecución en Termux en Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de compilación: Bazel y Android NDK r28b o superior para la variante Android; probado contra el commit `7ee9bdb` de LiteRT-LM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Rumble-2-Flash-LiteRT | ~0,5B | Ventanas de 5 s | 45 | Apache 2.0 | `.litertlm`, LiteRT-LM Omni, CPU |
| Reson8/Rumble-2-Flash (base) | ~0,5B | No disponible | 45 | No disponible en la informacion proporcionada | Pesos Hugging Face |
| Whisper (variantes pequenas) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible |
| Qwen3-ASR (runtime estandar) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Runtime `qwen3-asr` de LiteRT-LM |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las alternativas en la informacion proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Requiere sobrescribir `decode_skip_until_token_id` a 99623 en el runtime; sin este ajuste todas las transcripciones se generan vacías. El valor no puede incrustarse en el archivo porque un `.litertlm` contiene una única sección de capacidad de nivel superior y este modelo usa `LlmMetadata`.
- Es necesario aplicar `omni_runner_skip_until.patch` para usar `--asr_decode_skip_until_token_id` con `omni_runner`.
- `--model_name=qwen3-asr` debe indicarse explícitamente, ya que no puede inferirse del nombre del archivo.
- El estilo de transcripción (dígitos, sin muletillas, verbatim, idioma automático) está fijado en la exportación y no es configurable en el bundle.
- El backend probado es CPU; el rendimiento en GPU no está validado.
- Procesamiento por ventanas de 5 segundos: la calidad en los límites de ventana depende de la fusión de solapamientos del runtime y no se documentan métricas de error.
- No se publican datos sobre sesgos, tasa de alucinación ni evaluación por idioma; en ASR, los idiomas con menos datos de entrenamiento suelen presentar mayor tasa de error.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce la licencia y las condiciones del modelo base Reson8/Rumble-2-Flash, lo que conviene verificar antes de un despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Rumble-2-Flash-LiteRT
- Modelo base: https://huggingface.co/Reson8/Rumble-2-Flash
- LiteRT-LM Omni (repositorio): https://github.com/google-ai-edge/LiteRT-LM/tree/main/omni
- Guía de compilación de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/getting-started/build-and-run.md
- Commit de referencia de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/commit/7ee9bdb
