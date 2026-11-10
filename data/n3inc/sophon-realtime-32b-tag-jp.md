# n3inc/Sophon-Realtime-32B-Tag-JP

## Resumen

Sophon-Realtime-32B-Tag-JP es una adaptación al japonés del modelo Sophon-Realtime-32B-Tag, desarrollado por n3inc sobre el trabajo original de adventists-ai. Se trata de un modelo any-to-any orientado a diálogo de voz en tiempo real (speech-to-speech) con arquitectura full-duplex, capaz de recibir audio del usuario y responder con audio sintetizado. El modelo base emplea un esquema thinker/talker: un componente de razonamiento lingüístico y un componente de síntesis de voz basado en CosyVoice3 (tag-tts).

La aportación de esta variante no reside en los pesos, que son idénticos byte a byte a los del modelo oficial (68 archivos con hashes coincidentes con la revisión `20e03f35c2b2c6f45691e1a1108e1e0635ba6f1a`), sino en modificaciones del servidor de inferencia que habilitan el idioma japonés. El Tag original solo incluía prompts de sistema y de detección de fin de turno en chino e inglés, de modo que solicitar `language=ja` provocaba un KeyError. Esta versión añade esos prompts en japonés y corrige la conversión a katakana previa a la síntesis.

El modelo es relevante para quienes necesitan un sistema de voz conversacional japonés desplegable en infraestructura propia, con licencia Apache 2.0 y soporte de vLLM-Omni. El repositorio ocupa 44,6 GB y está pensado para GPUs con memoria unificada amplia; las pruebas del autor se realizaron en una NVIDIA DGX Spark (GB10) con 121,7 GiB de memoria compartida CPU/GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | any-to-any full-duplex con componentes thinker (LLM) y talker (TTS basado en CosyVoice3) |
| Parámetros totales | 32B (según nomenclatura del modelo base; desglose no disponible) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors y ONNX) |
| Idiomas soportados | ja, zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y ONNX (directorios `thinker/`, `talker/`, `voices/`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Sophon-Realtime-32B-Tag original, que combina un módulo de razonamiento (thinker) con un módulo de síntesis de voz (talker) construido sobre CosyVoice3. El pipeline es any-to-any: acepta audio como entrada y produce audio y texto como salida, con operación full-duplex para diálogo en tiempo real. La detección de fin de turno se delega al modelo de lenguaje mediante un prompt específico que evalúa si el usuario ha terminado de hablar.

Esta variante no introduce ningún reentrenamiento ni ajuste fino: los pesos son exactamente los del modelo oficial. Los cambios son exclusivamente de código en el servidor de inferencia, derivados del repositorio `adventists-ai/sophon-realtime` (rama `tag/`, commit `3585943`). Se añaden dos prompts en japonés (sistema y fin de turno), una opción `--lang ja` en el cliente de ejemplo y una etapa de conversión de la respuesta a katakana mediante pyopenjtalk antes de pasarla al sintetizador, ya que CosyVoice exige katakana para una pronunciación japonesa correcta. La conversión se realiza por segmentos delimitados por puntuación para preservar la coherencia de la lectura en streaming, y puede desactivarse con la variable de entorno `SOPHON_JA_KANA=0`.

## Capacidades

- Diálogo de voz a voz en tiempo real con operación full-duplex.
- Entrada de audio en japonés con respuesta de audio y texto en japonés.
- Soporte multilingüe de entrada y salida en ja, zh y en.
- Detección automática de fin de turno mediante el modelo de lenguaje.
- Síntesis de voz con selección de timbre mediante el parámetro `--voice` (voces predefinidas como `ryan_en` o `chelsie_zh`).
- Generación de texto en streaming con conversión incremental a katakana para la síntesis.
- Soporte de etiquetas de voz no verbales (por ejemplo `[laughter]`), que se excluyen de la conversión a katakana.
- Integración con vLLM y vLLM-Omni para el despliegue del pipeline.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni modo thinking en la información disponible.

## Casos de uso

- Atención al cliente telefónica en japonés: el modelo mantiene conversaciones de voz full-duplex y detecta el fin de turno del usuario, lo que permite sustituir o asistir a agentes humanos en líneas de soporte con respuesta hablada natural.
- Asistentes de voz embebidos en dispositivos: al desplegarse en hardware con memoria unificada como la DGX Spark, puede ejecutarse en local sin depender de APIs externas, útil para entornos con requisitos de privacidad.
- Prácticas de conversación para aprendizaje de idiomas: la respuesta de audio en japonés con texto sincronizado permite al estudiante escuchar y leer la réplica, con la posibilidad de cambiar de voz mediante `--voice`.
- Accesibilidad para usuarios con discapacidad visual: la interfaz de voz a voz permite operar aplicaciones o consultar información sin pantalla, con salida hablada en japonés.
- Kioscos interactivos y recepción automatizada: la latencia de primera respuesta de audio medida por el autor (1,32 s para respuestas cortas) es compatible con interacción presencial fluida.
- Investigación en diálogo hablado multilingüe: al compartir pesos con el modelo oficial y diferir solo en el servidor, sirve como base controlada para comparar el comportamiento ja/zh/en sin variaciones de pesos.
- Prototipado de agentes de voz en producción: la licencia Apache 2.0 y el soporte de vLLM-Omni facilitan la integración en pipelines propios y su escalado en infraestructura interna.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta mediciones de latencia de primera respuesta de audio sobre una NVIDIA DGX Spark (GB10), con vLLM 0.30.0 y vLLM-Omni 0.30.0, y una asignación de memoria de 0,45 para la etapa 0 y 0,055 para las etapas 1 y 2 (`config/sophon_realtime_tag_spark.yaml`):

| Respuesta generada | Tiempo hasta el primer audio |
|---|---|
| 8個残ります。 | 1,32 s |
| 赤い玉が3個、青い玉が4個あるので、全部で7個です。 | 3,83 s |
| まず、机の上にある物をすべて取り除いて、空の状態にしてから掃除を始めるのが一番です。 | 4,73 s |

La prueba de validación consistió en tres entradas de audio en japonés enviadas a `/v1/chat/completions`, con respuesta correcta en texto y audio en los tres casos, verificada por escucha.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 44,6 GB; el autor validó el despliegue con 121,7 GiB de memoria unificada compartida entre CPU y GPU, repartida en tres etapas (0,45 / 0,055 / 0,055). No se especifica el consumo exacto por etapa.
- GPU recomendadas: NVIDIA DGX Spark (GB10) es la única configuración documentada por el autor. No hay datos publicados para A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; el tamaño del repositorio y la arquitectura de tres etapas hacen improbable su ejecución en GPUs de consumo con VRAM discreta, aunque no se aportan mediciones.
- Opciones de despliegue: vLLM y vLLM-Omni, con scripts `install.sh` y `start.sh` del repositorio `adventists-ai/sophon-realtime` (commit `3585943`) más el parche `tag_jp.patch`. Requiere `pyopenjtalk` para la conversión a katakana.
- Latencia: primera respuesta de audio entre 1,32 s y 4,73 s según la longitud de la respuesta, medida en DGX Spark. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Sophon-Realtime-32B-Tag-JP (este) | 32B | ja, zh, en | any-to-any, full-duplex | Apache 2.0 | Añade soporte japonés vía parche de servidor; pesos idénticos al base |
| Sophon-Realtime-32B-Tag | 32B | zh, en | any-to-any, full-duplex | Apache 2.0 | Modelo base oficial; `language=ja` provoca KeyError y la síntesis japonesa suena a china |
| CosyVoice3 | no disponible | multilingüe, con requisito de katakana en japonés | TTS | no disponible en la información | Motor de síntesis del componente talker; no es un modelo de diálogo completo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a otras alternativas de la misma categoría.

## Limitaciones y advertencias

- La conversión a katakana puede producir lecturas incorrectas; el autor cita como ejemplo la lectura de «空» como «ソラ» en «空の状態».
- La síntesis no comienza hasta que aparece el primer signo de puntuación, lo que incrementa la latencia de primera respuesta respecto al modo sin conversión.
- No existe ninguna voz de hablante nativo japonés; si se omite `--voice`, se selecciona por defecto `ryan_en`. El autor recomienda especificar explícitamente una voz como `chelsie_zh`.
- La validación del autor se limita a tres entradas de audio en una única configuración de hardware; no hay evaluación sistemática de calidad, robustez ni sesgos.
- Riesgo de alucinación inherente al componente de lenguaje: no se documentan evaluaciones de fidelidad en la información disponible.
- El modelo no incluye ajuste específico para japonés en los pesos, por lo que la calidad lingüística depende del comportamiento multilingüe del modelo base.
- Requiere aplicar un parche manual sobre un commit concreto del repositorio original; cualquier cambio posterior en `adventists-ai/sophon-realtime` puede romper la compatibilidad.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia de los componentes de terceros (CosyVoice3, pyopenjtalk) antes de un despliegue en producción.
- El repositorio no incluye el código del servidor, solo los pesos y el diff; el usuario debe reconstruir el entorno a partir del repositorio original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/n3inc/Sophon-Realtime-32B-Tag-JP
- Modelo base: https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag
- Repositorio del servidor de inferencia: https://github.com/adventists-ai/sophon-realtime
- CosyVoice (motor de síntesis): https://github.com/FunAudioLLM/CosyVoice
- Ejemplo de uso de CosyVoice: https://github.com/FunAudioLLM/CosyVoice/blob/main/example.py
- pyopenjtalk: https://github.com/r9y9/pyopenjtalk
