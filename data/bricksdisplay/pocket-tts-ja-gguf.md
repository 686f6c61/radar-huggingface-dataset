# BricksDisplay/Pocket-TTS-ja-GGUF

## Resumen

Pocket TTS Japanese — GGUF es una conversión al formato GGUF del modelo de síntesis de voz `takuma104/pocket-tts-ja-cc`, un ajuste fino del Pocket TTS de Kyutai especializado en japonés y con capacidad de clonación de voz. El modelo original parte de la arquitectura Pocket TTS descrita en el paper arXiv:2509.06926 y fue entrenado sobre datos con licencia CC BY. Esta versión GGUF, publicada por BricksDisplay, permite ejecutar el modelo completamente en local sobre CPU o GPU mediante los runtimes `llama.cpp` y `codec.cpp`, sin dependencias de servicios en la nube.

El modelo es deliberadamente pequeño: 38.253.250 parámetros totales, con un backbone de lenguaje de 6 capas y un códec de audio separado que incluye decodificador/vocoder, codificadores de hablante y el adaptador entre ambos. Esa separación en dos ficheros (modelo y códec) es análoga a la de los proyectores multimodales de llama.cpp y permite cuantizar cada parte de forma independiente. El resultado es un paquete de entre 96 MB y 236 MB según la cuantización, apto para dispositivos móviles y despliegues de bajos recursos.

Su relevancia actual radica en que ofrece TTS japonés con clonación de voz en un tamaño que cabe en cualquier hardware moderno, incluyendo teléfonos ARM, manteniendo la licencia permisiva CC BY 4.0 del modelo original. La conversión a GGUF y el soporte de `codec.cpp` lo convierten en una opción práctica para aplicaciones offline, sistemas embebidos y pipelines que requieran privacidad total del audio procesado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pocket TTS (backbone LM de 6 capas + códec de audio con decoder/vocoder, speaker encoders y adaptador) |
| Parámetros totales | 38.253.250 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, q8_0, q6_k, q5_1, q5_0, q5_k_m, q5_k_s, q4_1, q4_k_m, q4_k_s, q4_0, q3_k_l, q3_k_m; el códec admite además variantes `codec-q8_0-lm-q8_0` |
| Idiomas soportados | Japonés (ja) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (dos ficheros: backbone + codec) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Pocket TTS de Kyutai, que combina un backbone de modelo de lenguaje de 6 capas con un códec de audio que integra el decodificador/vocoder, los codificadores de hablante y un adaptador entre ambos módulos. La inferencia se realiza en dos grafos separados: el backbone lo ejecuta `llama.cpp` y el códec lo ejecuta `codec.cpp`, que se encarga de la parte acústica y de la clonación de voz a partir de un audio de referencia. El ajuste fino al japonés (`pocket-tts-ja-cc`) fue realizado por takuma104 sobre datos con licencia CC BY, partiendo del modelo base de Kyutai.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO en la información proporcionada. El modelo original incluye en su repositorio diez voces sintéticas japonesas en el directorio `voices/`, aunque esta conversión GGUF no incluye voces integradas: cada ejecución requiere un audio de referencia (`--ref-audio`) de unos pocos segundos de habla limpia, a cualquier frecuencia de muestreo. El códec mantiene los ajustes del original (`japanese.yaml`): temperatura del flow de 0.3 y 5 frames conservados tras el fin del habla, ajustables mediante `--override-kv`.

## Capacidades

- Síntesis de voz en japonés a partir de texto plano, incluyendo kanji.
- Clonación de voz zero-shot mediante un clip de referencia de pocos segundos (`--ref-audio`), con posibilidad de guardar el hablante con `--save-speaker` para reutilizarlo sin el clip.
- Generación en streaming: la API de Python expone `tts.stream(text)` para emitir audio a medida que se genera.
- Ejecución totalmente offline en CPU o GPU (CUDA, Vulkan, Metal).
- Múltiples niveles de cuantización que permiten desde 236 MB (bf16) hasta 96 MB (q4_0), con una variante específica para teléfonos ARM (`codec-q8_0-lm-q8_0`, 126 MB).
- Control de parámetros de muestreo mediante `--override-kv` (por ejemplo, `codec.lm.temperature`).
- No soporta tool calling, function calling, razonamiento multi-paso, visión ni audio de entrada más allá del clip de referencia para clonación.

## Casos de uso

- **Lectura de texto japonés en aplicaciones móviles offline**: la variante `codec-q8_0-lm-q8_0` (126 MB) está optimizada para CPU ARM y permite sintetizar voz en un teléfono sin conexión, útil para lectores de pantalla, audiolibros o asistentes locales.
- **Clonación de voz para doblaje y localización**: con un clip de referencia del hablante original se puede generar audio japonés con su timbre, integrable en flujos de localización de vídeo o pódcast donde se requiera consistencia de voz entre segmentos.
- **Sistemas de atención al cliente con voz sintética**: al ejecutarse en local y con licencia CC BY 4.0, puede integrarse en centralitas o IVR que necesiten respuestas habladas en japonés sin enviar datos de usuario a servicios externos.
- **Generación de audio para contenido educativo**: creación de lecciones o materiales de aprendizaje de japonés con pronunciación controlada, usando las diez voces sintéticas del repositorio original como referencias.
- **Prototipado de interfaces de voz en investigación**: el tamaño reducido (38 M de parámetros) y la separación backbone/códec facilitan experimentos de cuantización, ajuste de parámetros de muestreo o evaluación de latencia en hardware diverso.
- **Accesibilidad y lectura de documentos**: conversión de texto japonés (incluido kanji) a voz para personas con discapacidad visual, ejecutándose en el propio dispositivo y preservando la privacidad del contenido.
- **Integración en pipelines de CI/CD para pruebas de audio**: el CLI `tts-cli` y el paquete `codec_cpp` permiten automatizar la generación de muestras de audio en tests de regresión de sistemas de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 38 M de parámetros, el peso en bf16 es de aproximadamente 236 MB (backbone + códec); en q8_0 unos 135 MB; en q4_0 unos 96 MB. La VRAM necesaria es del orden de esos tamaños más el overhead del runtime, por lo que cabe en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU con soporte CUDA, Vulkan o Metal. El modelo es viable en RTX 4090, RTX 3060, GPUs integradas e incluso en aceleradores móviles; no requiere A100 ni H100.
- **Consumer GPU**: sí, cabe en todas las GPU consumer modernas e incluso en CPU y teléfonos ARM (variante específica `codec-q8_0-lm-q8_0`).
- **Opciones de despliegue**: `codec.cpp` con su CLI `tts-cli` (que incluye llama.cpp), el paquete Python `codec_cpp` (requiere CMake y compilador C++), y descarga vía `huggingface_hub`. No se menciona soporte para vLLM, TGI ni Ollama.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Pocket-TTS-ja-GGUF (este) | 38,25 M | no disponible | ja | CC BY 4.0 | GGUF |
| takuma104/pocket-tts-ja-cc (base) | no disponible | no disponible | ja | CC BY 4.0 | safetensors (original) |
| kyutai/pocket-tts (original) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos TTS comparables en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- **Idioma único**: solo soporta japonés; no se ha validado para otros idiomas.
- **Sin voz integrada**: requiere obligatoriamente un audio de referencia (`--ref-audio`) para cada ejecución, salvo que se guarde el hablante con `--save-speaker`.
- **Formato de texto estricto**: el texto debe normalizarse según la configuración del original (`。` → `.`, `、` → `,`, eliminación de comillas y corchetes, letras y dígitos de ancho completo a ASCII, y un punto final). No hacerlo puede degradar la calidad.
- **Riesgo de alucinación acústica**: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas o prosodia anómala en textos largos o con kanji poco frecuentes.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al ser un ajuste sobre datos CC BY japoneses, puede reflejar sesgos del corpus de entrenamiento.
- **Licencia**: CC BY 4.0 permite uso comercial con atribución a takuma104 (Pocket TTS Japanese CC BY) y a Kyutai (Pocket TTS, paper arXiv:2509.06926).
- **Caveat de producción**: la separación en dos ficheros (backbone + códec) obliga a gestionar ambos artefactos de forma coordinada; mezclar cuantizaciones incompatibles puede fallar. El paquete Python requiere compilar C++ en tiempo de instalación.
- **Contexto**: no se ha publicado la longitud de contexto del backbone, lo que limita la planificación de textos largos.

## Enlaces

- [Hugging Face: BricksDisplay/Pocket-TTS-ja-GGUF](https://huggingface.co/BricksDisplay/Pocket-TTS-ja-GGUF)
- [Modelo base: takuma104/pocket-tts-ja-cc](https://huggingface.co/takuma104/pocket-tts-ja-cc)
- [Modelo original: kyutai/pocket-tts](https://huggingface.co/kyutai/pocket-tts)
- [Paper: arXiv:2509.06926](https://arxiv.org/abs/2509.06926)
- [Repositorio codec.cpp](https://github.com/mybigday/codec.cpp)
- [Documentación Python de codec.cpp](https://github.com/mybigday/codec.cpp/tree/main/python)
- [Repositorio llama.cpp](https://github.com/ggml-org/llama.cpp)
