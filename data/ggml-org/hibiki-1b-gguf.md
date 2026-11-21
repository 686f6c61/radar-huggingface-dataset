# ggml-org/hibiki-1b-GGUF

## Resumen

Hibiki-1b es un modelo de traducción de voz en tiempo real desarrollado originalmente por Kyutai y distribuido en formato GGUF por ggml-org para su uso con llama.cpp. Su función concreta es recibir habla en francés y emitir habla en inglés de forma simultánea y continua, con un modo full-duplex que procesa audio de entrada y genera audio de salida en intervalos de 80 ms. Está pensado para traducción simultánea de conversaciones, no para traducción por turnos.

El modelo cuenta con 1.018.761.216 parámetros (aproximadamente 1B) y se distribuye bajo licencia CC-BY-4.0. Esta versión GGUF es una conversión automática del checkpoint original `kyutai/hibiki-1b-pytorch-bf16` mediante la herramienta `ggml-org/convert`, lo que permite ejecutarlo en el servidor de llama.cpp sin depender del stack de PyTorch.

Su relevancia actual radica en que acerca la traducción simultánea de voz a infraestructura de inferencia ligera y ampliamente adoptada como llama.cpp, con un modelo de tamaño contenido (1B) que puede desplegarse en hardware modesto. La contrapartida es que el soporte es específico: solo funciona a través del endpoint full-duplex de `llama-server`, no mediante `llama-tts` ni la ruta `/tts`, y la combinación de idiomas está fijada a francés hacia inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de audio full-duplex; detalles de arquitectura no especificados en la información proporcionada) |
| Parámetros totales | 1.018.761.216 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de ejecución usa `-c 1500`) |
| Tipos de cuantización | GGUF cuantizado (niveles concretos no especificados en la información proporcionada) |
| Idiomas soportados | francés (entrada) e inglés (salida) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (convertido desde safetensors/PyTorch bf16) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El modelo se etiqueta como `audio-to-audio` y se describe como full-duplex: procesa flujos de audio de entrada y produce audio de salida de forma continua, con un ciclo de 80 ms por fragmento. Esta naturaleza full-duplex implica que el modelo no espera al final del turno del hablante, sino que traduce de forma incremental mientras se habla.

Tampoco se especifican en la información disponible los datos de entrenamiento (número de tokens, composición del corpus, uso de RLHF/DPO) ni innovaciones técnicas concretas más allá del propio diseño full-duplex. El checkpoint de referencia es `kyutai/hibiki-1b-pytorch-bf16`, del que esta versión GGUF es una conversión automática.

## Capacidades

- Traducción de voz en tiempo real de francés a inglés, con entrada y salida de audio.
- Funcionamiento full-duplex: entrada y salida de audio cada 80 ms, sin esperar al final del turno.
- Generación de audio de salida (speech-to-speech), no solo transcripción o texto traducido.
- Integración con el servidor de llama.cpp mediante el endpoint full-duplex.
- Compatible con el ecosistema de endpoints de llama.cpp (`endpoints_compatible`).
- No soporta su uso a través de `llama-tts` ni de la ruta `/tts`; requiere el endpoint full-duplex.
- Capacidades de tool calling, agentes, visión o razonamiento multistep: no disponibles en la información proporcionada.

## Casos de uso

- Interpretación simultánea en reuniones bilingües francés-inglés: el modelo traduce el habla francesa a inglés en tiempo real con ciclos de 80 ms, adecuado para conversaciones donde no se puede esperar al final de cada intervención.
- Subtitulado y doblaje en directo de eventos y conferencias: al emitir audio en inglés de forma continua, permite generar una pista de voz traducida mientras el ponente habla en francés.
- Atención al cliente con clientes francófonos y agentes anglófonos: el modelo puede mediar en conversaciones de voz en tiempo real, reduciendo la dependencia de intérpretes humanos.
- Asistencia en viajes y entornos presenciales: traducción de voz al vuelo en situaciones cara a cara donde la latencia por turnos resulta incómoda.
- Investigación en traducción simultánea de voz: al ser un modelo de 1B en GGUF, sirve como base reproducible para experimentos de speech-to-speech con llama.cpp.
- Prototipado de aplicaciones de voz de baja latencia: su despliegue con `llama-server` facilita integrar traducción full-duplex en pipelines locales sin infraestructura pesada.
- Evaluación de despliegue en hardware modesto: el tamaño de 1B y el formato GGUF permiten probar traducción de voz en equipos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1.018.761.216 parámetros y un repositorio de 4,9 GB, la inferencia en cuantización GGUF requiere del orden de pocos GB de memoria, dependiendo del nivel de cuantización elegido.
- GPU recomendadas: no especificadas en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la documentación; el tamaño del modelo sugiere que podría caber en GPU de consumo, pero no hay datos oficiales.
- Opciones de despliegue: llama.cpp mediante `llama-server` con el endpoint full-duplex (`llama-server -hf ggml-org/hibiki-1b-GGUF -c 1500`). No es compatible con `llama-tts` ni con `/tts`.
- Latencia y throughput: el modelo opera con ciclos de audio de 80 ms por fragmento (full-duplex); no se proporcionan cifras de throughput agregado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia, el propio checkpoint base `kyutai/hibiki-1b-pytorch-bf16` es la alternativa directa en formato PyTorch, pero no se ofrecen datos comparativos de rendimiento, contexto o latencia frente a otras propuestas de traducción de voz.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| ggml-org/hibiki-1b-GGUF | 1.018.761.216 | no disponible | CC-BY-4.0 | GGUF |
| kyutai/hibiki-1b-pytorch-bf16 | no disponible | no disponible | no disponible | PyTorch bf16 |

## Limitaciones y advertencias

- La combinación de idiomas está fijada: solo francés como entrada e inglés como salida; no es un modelo multilingüe general.
- Solo funciona a través del endpoint full-duplex de `llama-server`; no es compatible con `llama-tts` ni con la ruta `/tts`, lo que limita las opciones de integración.
- Es una conversión automática del checkpoint original, por lo que puede haber diferencias de comportamiento frente al modelo en PyTorch.
- No se dispone de información sobre sesgos, tasas de alucinación o robustez ante ruido, acentos o solapamiento de hablantes.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero conviene verificar los términos del modelo base original antes de desplegarlo en producción.
- No se han publicado benchmarks que permitan estimar la calidad de traducción en condiciones reales.
- El contexto de ejemplo (`-c 1500`) es reducido; no se especifica la ventana máxima soportada.

## Enlaces

- Hugging Face: https://huggingface.co/ggml-org/hibiki-1b-GGUF
- Modelo base: https://huggingface.co/kyutai/hibiki-1b-pytorch-bf16
- Documentación del endpoint full-duplex de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md#full-duplex
- Documentación TTS/multimodal de llama.cpp (sección Hibiki): https://github.com/ggml-org/llama.cpp/blob/master/docs/multimodal/tts.md#hibiki
- Herramienta de conversión: https://github.com/ggml-org/convert
