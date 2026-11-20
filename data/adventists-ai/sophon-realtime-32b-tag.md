# adventists-ai/Sophon-Realtime-32B-Tag

## Resumen

Sophon-Realtime-32B-Tag es un modelo "any-to-any" de voz a voz en tiempo real, desarrollado por adventists-ai, que combina un "cerebro" de 32B parámetros con un sistema de síntesis de voz expresivo. El modelo escucha al usuario de forma continua (full-duplex), decide cuándo es su turno, y genera la respuesta en texto junto con etiquetas de sonido en línea (risas, suspiros, énfasis) que un modelo de voz (tag-tts) interpreta mientras el texto aún se está escribiendo. Las etiquetas nunca se leen en voz alta y se eliminan del flujo de texto.

Forma parte de la familia Sophon-Realtime v1, que comparte el mismo cerebro de 32B entre tres builds (Tag, Flash y E2E) que difieren únicamente en cómo convierten la respuesta en sonido. El build Tag es el más expresivo, con una puntuación NVV-SuperBench de 0,86 en chino y 0,80 en inglés, y está pensado para aplicaciones donde la naturalidad y la expresividad de la voz son prioritarias.

El sistema completo se sirve como un único modelo vLLM-Omni (thinker → tag-tts talker → vocoder flow + HiFT) sobre una sola GPU de 80 GB, con hasta 16 usuarios concurrentes por GPU y aproximadamente 0,6 s hasta el primer audio. La licencia Apache-2.0 permite uso comercial libre.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sistema any-to-any full-duplex: thinker (32B) + tag-tts talker + vocoder flow + HiFT, servido como un único modelo vLLM-Omni |
| Parámetros totales | 32B (cerebro/thinker); el talker E2E de la familia es de ~350M, pero no se especifica el tamaño del talker de Tag |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

Sophon-Realtime-32B-Tag es un sistema de speech-to-speech full-duplex compuesto por tres etapas encadenadas dentro de un único modelo vLLM-Omni: un thinker de 32B parámetros que escucha, gestiona el turn-taking y redacta la respuesta con etiquetas de sonido en línea; un talker basado en tag-tts que interpreta esas etiquetas de forma expresiva; y un vocoder (flow + HiFT) que genera el audio final. El thinker funciona en modo full-duplex real: escucha durante toda la intervención del usuario, redacta la respuesta mientras este habla, detecta cuándo termina, se detiene si el usuario interrumpe (barge-in) y continúa si el usuario emite retroalimentación como "mm-hm" (backchannel).

El modelo está construido sobre DuplexJev y utiliza tag-tts como motor de voz. Soporta clonación de voz zero-shot desde 1.1: basta con proporcionar un clip limpio de 3 a 10 segundos de un único hablante (wav o flac, cualquier frecuencia de muestreo) para que el servidor prepare la voz en segundo plano en pocos segundos, sin fine-tuning ni reinicio. La model card indica que es posible ajustar la persona, el tono y el conocimiento de dominio con ms-swift, aunque no se detallan el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de voz a voz en tiempo real con turn-taking completo, barge-in y backchannel.
- Comprensión paralingüística: detecta emoción, énfasis, sarcasmo, risas y suspiros directamente de la voz del usuario.
- Expresividad vocal mediante etiquetas de sonido en línea (risa, suspiro, respiración, carraspeo, énfasis) que la voz interpreta sin leerlas en voz alta.
- Clonación de voz zero-shot con clips de 3 a 10 segundos, incluso si el clip está en un idioma distinto al de la respuesta.
- Tool calling en modo full-duplex (Full-Duplex-Bench v3), con compatibilidad con la interfaz OpenAI GPT-Live en modo live.
- API compatible con OpenAI Realtime (`ws://HOST:8000/v1/realtime`) y con `POST /v1/chat/completions` (audio de entrada → texto + stream de audio).
- Voces integradas: `chelsie` (por defecto, con variantes `chelsie_zh`/`chelsie_en`), `vivian_zh`, `ryan_en`, `brand_zh`, `brand_en`.
- Capacidades multilingües limitadas a chino e inglés.
- Fine-tuning de persona, tono y conocimiento de dominio con ms-swift.

## Casos de uso

- Atención al cliente por voz: el modelo mantiene conversaciones multi-turno full-duplex, detecta cuándo el usuario ha terminado de hablar y permite interrupciones, lo que reproduce la dinámica de una llamada telefónica real. Con 16 usuarios concurrentes por GPU de 80 GB, es viable para centros de contacto de volumen medio.
- Asistentes de voz para personas mayores o con dificultades de lectura: la comprensión paralingüística (48,6 en la métrica combinada de LISTEN, StressTest y MSPB) permite detectar frustración o confusión en el tono y adaptar la respuesta, algo que un sistema solo-texto no puede hacer.
- Agentes telefónicos con tool calling: el 48% de Pass@1 en Full-Duplex-Bench v3 y una tasa de respuesta del 100% permiten integrar el modelo en flujos donde el agente debe consultar sistemas (reservas, pedidos, CRM) mientras conversa, con compatibilidad con la interfaz OpenAI GPT-Live.
- Contenido de audio expresivo: la generación de etiquetas de sonido (risas, suspiros, énfasis) y la clonación de voz zero-shot permiten producir locuciones para pódcast, audiolibros o vídeos donde se requiere una interpretación natural sin grabar a un actor de voz.
- Prácticas de conversación con feedback tonal: aplicaciones de aprendizaje de idiomas o entrenamiento en ventas donde el modelo evalúa no solo lo que dice el usuario sino cómo lo dice (estrés, duda, entusiasmo) gracias al análisis paralingüístico.
- Prototipado rápido de interfaces de voz: la API compatible con OpenAI Realtime y el despliegue con un solo comando (`install.sh` + `start.sh`) permiten a un equipo de desarrollo tener un endpoint de voz funcional en una GPU en menos de media hora, lo que reduce el coste de validación de ideas.
- Evaluación de accesibilidad: el modo full-duplex con backchannel ("mm-hm") hace que el modelo se comporte de forma más natural con usuarios que hablan despacio o con pausas, un escenario habitual en pruebas de accesibilidad.

## Benchmarks y rendimiento

| Benchmark | Sophon-Realtime-32B-Tag | Referencia comparada |
|---|---|---|
| VoiceBench | 82,8 | Nivel de GPT-4o-mini-Audio |
| Big Bench Audio | 81,8% | no disponible |
| Paralingüística (LISTEN + StressTest + MSPB) | 48,6 | Gemini 3.8 Flash: 46,9; Qwen3-Omni: 44,6 |
| NVV-SuperBench (en / zh) | 0,80 / 0,86 | Flash: 0,63 / 0,77; E2E: 0,75 / 0,85 |
| Full-Duplex-Bench v3 tool calling (Pass@1) | 48% | Grok: 43% |
| Tasa de respuesta (Full-Duplex-Bench v3) | 100% | no disponible |
| Primer audio (un usuario) | ~0,6 s | Flash: 0,31 s; E2E: ~0,25 s |
| Usuarios concurrentes por GPU de 80 GB | 16 | Flash: 40; E2E: 16 |

## Requisitos de hardware

- VRAM estimada para inferencia: una GPU de 80 GB para el sistema completo (thinker + talker + vocoder). Los pesos ocupan aproximadamente 42 GB según el script de instalación.
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes con 80 GB de VRAM. El modelo no cabe en GPUs de consumo como RTX 4090 (24 GB).
- Existe una variante menor, Sophon-Realtime-4B-Tag (v1.4.0), que funciona con un cerebro de 4B en una sola GPU de 32 GB, manteniendo el turn-taking y las etiquetas de sonido pero con menor conocimiento.
- Opciones de despliegue: vLLM-Omni 0.30 sobre vLLM 0.30, con el plugin de Sophon-Realtime. El repositorio incluye `install.sh` (crea un venv de Python 3.12 e instala dependencias y pesos) y `start.sh` (arranca el servidor). El primer arranque tarda entre 15 y 20 minutos por la compilación de kernels y motores TensorRT; los arranques posteriores, entre 5 y 8 minutos.
- Latencia y throughput: aproximadamente 0,6 s hasta el primer audio con un usuario y hasta 16 usuarios concurrentes por GPU de 80 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | NVV-SuperBench (en/zh) | Primer audio | Usuarios por GPU 80 GB | Licencia |
|---|---|---|---|---|---|---|
| Sophon-Realtime-32B-Tag | 32B (cerebro) | no disponible | 0,80 / 0,86 | ~0,6 s | 16 | Apache-2.0 |
| Sophon-Realtime-32B-Flash | 32B (cerebro) | no disponible | 0,63 / 0,77 | 0,31 s | 40 | Apache-2.0 |
| Sophon-Realtime-32B-E2E | 32B (cerebro) + talker ~350M | no disponible | 0,75 / 0,85 | ~0,25 s | 16 | Apache-2.0 |
| Sophon-Realtime-4B-Tag | 4B (cerebro) | no disponible | no disponible | no disponible | no disponible (cabe en 32 GB) | Apache-2.0 |

Las tres variantes de 32B comparten el mismo cerebro y solo difieren en el mecanismo de síntesis de voz, por lo que la elección depende del equilibrio entre expresividad (Tag), número de usuarios por GPU (Flash) y latencia del primer audio (E2E).

## Limitaciones y advertencias

- Solo soporta chino e inglés; no hay soporte declarado para otros idiomas.
- El repositorio ocupa 52,5 GB y el despliegue requiere una GPU de 80 GB, lo que excluye hardware de consumo.
- El primer arranque del servidor tarda entre 15 y 20 minutos debido a la compilación de kernels y motores TensorRT.
- La clonación de voz zero-shot plantea riesgos de suplantación de identidad y uso indebido; es responsabilidad del desplegador aplicar controles de consentimiento y verificación.
- No se han publicado datos sobre sesgos, tasa de alucinación ni límites de contexto en la información disponible.
- El rendimiento en tool calling (Pass@1 del 48%) deja margen de error en flujos de agente críticos; conviene validar con pruebas propias antes de producción.
- Aunque la licencia es Apache-2.0 y permite uso comercial, el uso de voces clonadas puede estar sujeto a normativa adicional sobre derechos de imagen y voz según la jurisdicción.
- El modelo está diseñado para conversación de voz en tiempo real; no se especifican capacidades de visión, código o matemáticas más allá de las que pueda aportar el cerebro de 32B, que no se detallan en la model card.

## Enlaces

- [Hugging Face: adventists-ai/Sophon-Realtime-32B-Tag](https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Tag)
- [Colección Sophon-Realtime](https://huggingface.co/collections/adventists-ai/sophon-realtime-6afb357253a3a8905ad758b0)
- [Página de la familia v1](https://huggingface.co/adventists-ai/Sophon-Realtime-v1)
- [Sophon-Realtime-4B-Tag](https://huggingface.co/adventists-ai/Sophon-Realtime-4B-Tag)
- [Sophon-Realtime-32B-Flash](https://huggingface.co/adventists-ai/Sophon-Realtime-32B-Flash)
- [Sophon-Realtime-32B-E2E](https://huggingface.co/adventists-ai/Sophon-Realtime-32B-E2E)
- [tag-tts](https://huggingface.co/adventists-ai/tag-tts)
- [Repositorio GitHub sophon-realtime](https://github.com/adventists-ai/sophon-realtime)
- [Directorio tag del repositorio](https://github.com/adventists-ai/sophon-realtime/tree/main/tag)
- [Changelog](https://github.com/adventists-ai/sophon-realtime/blob/main/CHANGELOG.md)
- [DuplexJev](https://github.com/adventists-ai/duplexjev)
- [Demo en vídeo v1.1](https://github.com/adventists-ai/sophon-realtime#zero-shot-voice-cloning-new-in-v11)
- [API alojada (consola)](https://api.adventists.ai/console/)
- [Documentación de la API](https://api.adventists.ai/console/docs)
- [ModelScope Studio de demostración](https://www.modelscope.ai/studios/AdventistsAI/Sophon-Realtime)
