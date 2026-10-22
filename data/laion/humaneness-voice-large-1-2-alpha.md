# laion/Humaneness-Voice-Large-1.2-Alpha

## Resumen

Humaneness Voice Large 1.2 Alpha es un modelo de síntesis de voz (text-to-speech) desarrollado por LAION, publicado como *fine-tune* de parámetros completos del checkpoint SFT3 Large de su familia MOSS-TTS local. El modelo genera habla expresiva en cinco idiomas (inglés, alemán, neerlandés, francés y español) a partir de texto literal, de indicaciones de interpretación escritas en inglés y, opcionalmente, de una grabación de referencia de un hablante. Su rasgo diferencial es el control de la actuación: el prompt admite direcciones como duración objetivo por fragmento, pausas medidas, risas o marcas emocionales, lo que lo orienta a doblaje y *voice acting* más que a lectura neutra.

Arquitectónicamente es un transformer semántico de 36 capas y 2.560 dimensiones que avanza un fotograma de audio de 80 ms por paso, acompañado de un *Talker* local de una sola capa que predice los 12 índices de codebook residuales de cada fotograma. El recuento real de parámetros del safetensors es 4.129.990.144 (unos 4,13 mil millones), no la etiqueta histórica de 4,55B/4,6B que arrastra la familia. La decodificación a audio de 48 kHz mono la realiza un componente externo, MOSS Audio Tokenizer v2, que se descarga por separado.

Es relevante ahora porque demuestra un pipeline de *fine-tuning* multilingüe sobre 64 GPU GH200 con datos de voz real mezclados con datos sintéticos de actuación, y porque libera pesos completos en BF16 bajo licencia CC-BY-4.0. Conviene subrayar que se trata de una versión Alpha experimental: el autor no publica WER, similitud de hablante ni métricas perceptuales, y la única demostración disponible es una escucha comparativa de 35 casos escena/idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer semántico autorregresivo (36 capas, 2.560 dim) + Talker local de 1 capa + codec externo MOSS Audio Tokenizer v2 |
| Parámetros totales | 4.129.990.144 (transformer semántico 4.022.468.096 + ruta de audio/Talker 107.522.048, pesos atados contados una vez) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en número de tokens; el contexto semántico retiene fotogramas de audio previos (un fotograma = 80 ms) |
| Tipos de cuantización | no disponible; solo se publica exportación BF16 |
| Idiomas soportados | en, de, nl, fr, es (las indicaciones de interpretación deben ir en inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (BF16), con código propio (`custom_code`), repo de 8,3 GB |
| Pipeline declarado | text-to-speech (con etiqueta adicional `feature-extraction`) |
| Modelo base | laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3 |
| Dataset de entrenamiento | laion/german-english-voice-acting-challenges (más datos Gemini y voz real propia) |
| Tokenización de audio | 12 índices de codebook cada 80 ms = 12,5 fotogramas/s = 150 índices/s; salida de audio 48 kHz mono |
| Referencia de hablante | WAV limpio, monohablante, de 5,04 a 14,96 s |
| Dependencias probadas | NVIDIA GH200, PyTorch 2.9, Transformers 5.14.1, CUDA |

## Arquitectura y entrenamiento

El modelo se compone de dos redes acopladas. Un transformer semántico de 36 capas y 2.560 dimensiones procesa el contexto y avanza un fotograma de audio de 80 ms en cada paso; un *Talker* local de una capa, también de 2.560 dimensiones, predice los 12 índices de codebook residuales correspondientes a ese fotograma. Los fotogramas anteriores permanecen en el contexto semántico. Los códigos se convierten en audio de 48 kHz mono mediante MOSS Audio Tokenizer v2, una dependencia externa que no se reentrena en esta ejecución. El modelo no es un MoE ni un adaptador: es un *fine-tune* de parámetros completos exportado en BF16.

El entrenamiento partió del checkpoint SFT3 Large y se organizó en dos fases. La fase mixta contiene 798.118 objetivos únicos tras depurar solapamientos y excluir 39 anotaciones inacabadas: 591.441 de voz real, 36.754 de Gemini original y 169.923 de Gemini multilingüe. La segunda fase, un pulido solo con Gemini, repite una vez los 206.677 objetivos de esa fuente. La exposición total asciende a 1.004.795 presentaciones sin *padding*, con 7.851 actualizaciones del optimizador en 64 GPU GH200 y un tiempo de pared asignado de aproximadamente 5 horas y 4 minutos. Los objetivos de voz real no se repiten en la fase de pulido, y no se añadieron datos de ElevenLabs ni de Gaston en esta ejecución. El diagnóstico fijo de validación de 120 casos bajó de 4,6063 en el primer checkpoint a 4,5098 en el final; se trata de pérdida con *teacher forcing*, no de MOS ni de una métrica de calidad lingüística.

## Capacidades

- Síntesis de voz expresiva en inglés, alemán, neerlandés, francés y español a partir de texto literal.
- Control de interpretación mediante indicaciones en inglés: emoción, estilo, pausas con duración explícita, risas y respiraciones, y duración objetivo por fragmento de guion.
- Selección de presupuesto de fotogramas mediante `--seconds`, que fija el objetivo de duración pero no garantiza una duración hablada exacta.
- Condicionamiento por audio de referencia (`--reference-wav`) para aproximar la identidad de un hablante; el autor advierte que no garantiza clonación exacta.
- Funcionamiento sin referencia, usando la distribución de voces aprendida y la descripción de la escena.
- Procesamiento de guiones largos mediante `--prompt-file` para evitar problemas de *quoting* en la línea de comandos.
- Carga offline del codec con `--codec /ruta/local/MOSS-Audio-Tokenizer-v2`.
- Reproducibilidad mediante semilla (`--seed`) y salida a WAV.
- No documentado: *tool calling*, razonamiento multi-paso, agentes, visión, audio de entrada como comprensión o API de voces con nombre propio. Esta versión no introduce una API de voces nombradas.

## Casos de uso

- Doblaje y localización de vídeo: el modelo acepta un guion con direcciones de actuación por fragmento y duración objetivo, lo que permite ajustar cada intervención a la longitud del plano en cinco idiomas sin reescribir el texto.
- Audiolibros y ficción sonora: las marcas de emoción, pausas medidas y risas permiten generar capítulos con matices interpretativos en lugar de una lectura plana, manteniendo la misma voz de referencia entre sesiones mediante `--reference-wav`.
- Prototipado de *voice acting* en videojuegos: iteración rápida sobre líneas de personaje con dirección emocional explícita antes de contratar grabación humana definitiva.
- Asistentes de voz y atención al cliente: generación de respuestas con voz de marca fija a partir de una grabación de referencia corporativa de entre 5,04 y 14,96 s, con control de estilo para mensajes neutros, empáticos o de disculpa.
- Accesibilidad y lectura expresiva: conversión de textos largos a audio con pausas y énfasis configurables para contenidos divulgativos o materiales educativos multilingües.
- Investigación en TTS controlable: el formato de prompt con direcciones en inglés y el código de inferencia público permiten estudiar el seguimiento de instrucciones de estilo y la deriva de duración frente al presupuesto de fotogramas solicitado.
- Generación de material de demostración y evaluación por escucha: útil para construir baterías de pruebas subjetivas en varios idiomas antes de invertir en un sistema en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la demostración de escucha no constituye evidencia de mejora medida en WER, similitud de hablante o calidad perceptual.

| Métrica | Valor | Naturaleza |
|---|---|---|
| Pérdida de validación (120 casos fijos, *teacher forcing*) | 4,5098 en el checkpoint final (4,6063 en el primero) | Diagnóstico de entrenamiento, no benchmark de calidad |
| WER | no disponible | Sin publicar |
| Similitud de hablante | no disponible | Sin publicar |
| MOS o calidad perceptual | no disponible | Sin publicar |
| Comparación con modelos similares | no disponible | Sin datos en la información proporcionada |

## Requisitos de hardware

- Pesos en BF16: 4.129.990.144 parámetros × 2 bytes ≈ 8,26 GB; el repositorio completo ocupa 8,3 GB.
- VRAM estimada para inferencia: del orden de 10-12 GB en BF16 sumando pesos, cachés de activación y codec; es una estimación, no un dato medido por el autor.
- Hardware validado: NVIDIA GH200 con PyTorch 2.9 y Transformers 5.14.1; el autor advierte que la portabilidad y los requisitos de memoria en otro hardware están sin probar.
- GPU de consumo: por la horquilla de VRAM estimada debería caber en una RTX 4090 (24 GB) o una RTX 3090 (24 GB); no verificado por el autor.
- Cuantizaciones: no se publican GGUF, AWQ, GPTQ ni variantes de 8/4 bits, por lo que no hay una ruta de despliegue ligero documentada.
- Opciones de despliegue: `infer.py` incluido en el repositorio (requiere `trust_remote_code` y CUDA) y carga estándar con Transformers. No hay soporte documentado para vLLM, TGI, llama.cpp u Ollama.
- Throughput: no publicado. Estructuralmente el transformer semántico realiza 12,5 pasos por segundo de audio generado (un fotograma de 80 ms por paso), lo que da 150 índices de codebook por segundo de audio.
- Latencia: no disponible; el autor no reporta tiempos de generación en la información proporcionada.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones cuantitativas con otros sistemas TTS, por lo que los campos numéricos de las alternativas se marcan como no disponibles.

| Modelo | Parámetros | Idiomas | Licencia | Contexto / referencia | Datos comparativos |
|---|---|---|---|---|---|
| Humaneness Voice Large 1.2 Alpha | 4,130 mil millones | en, de, nl, fr, es | CC-BY-4.0 | Referencia de 5,04-14,96 s | Sin benchmarks publicados |
| laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3 (modelo base) | etiqueta 4,55B; recuento real no disponible | no disponible | no disponible | no disponible | Sin benchmarks en la información |
| MOSS Audio Tokenizer v2 | no disponible | no aplica (codec) | no disponible | no aplica | Es el códec de salida, no un TTS comparable |
| Otras familias TTS open source (p. ej. XTTS, Bark, Parler-TTS) | no disponible | no disponible | no disponible | no disponible | No hay datos en la información proporcionada |

## Limitaciones y advertencias

- Versión Alpha experimental: no hay métricas objetivas de calidad, WER ni similitud de hablante; la única evaluación publicada es una escucha de 35 casos.
- El propio autor declara que la demostración de escucha no demuestra mejoras medibles, por lo que no debe citarse como evidencia de rendimiento.
- Condicionamiento de hablante aproximado: una referencia ayuda a la identidad pero no garantiza clonación exacta. La grabación debe ser limpia, monohablante y de 5,04 a 14,96 s; entradas más largas se recortan.
- Las indicaciones de interpretación deben escribirse en inglés aunque el texto sintetizado esté en otro idioma, lo que limita el uso por parte de usuarios no anglófonos.
- `--seconds` fija el presupuesto de fotogramas, no la duración hablada final; la duración real puede desviarse del objetivo.
- El componente de audio depende de MOSS Audio Tokenizer v2, descargado por separado salvo que se indique `--codec`; es un punto de fallo y una dependencia de licencia adicional que hay que revisar.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero obliga a citar adecuadamente y no incluye garantías; conviene revisar los términos del codec y del dataset por separado.
- Riesgos propios de TTS: pronunciación incorrecta de nombres propios y términos técnicos, deriva de prosodia en guiones largos, artefactos en pasajes con muchas indicaciones y posible filtración de rasgos de la voz de referencia.
- Uso dual y consentimiento: la clonación de voz exige permiso explícito del hablante de la referencia y cumplimiento de la normativa aplicable sobre identidad y síntesis de voz.
- Requisitos no validados fuera de GH200; el autor no garantiza comportamiento ni memoria en otras GPU.
- Sesgos: la composición del dataset (voz real más datos sintéticos de Gemini) puede infrarrepresentar acentos, edades y variedades dialectales; no se documenta ningún análisis de sesgo.
- Sin soporte documentado de cuantización ni de servidores de inferencia de alto rendimiento, lo que complica el despliegue a escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/Humaneness-Voice-Large-1.2-Alpha
- Demostración de escucha (35 casos escena/idioma): https://laion-humaneness-voice-large-1-2-alpha-listening.static.hf.space/
- Dataset con el audio de la demostración: https://huggingface.co/datasets/laion/Humaneness-Voice-Large-1.2-Alpha-Demo-Audio
- Modelo base (SFT3 Large): https://huggingface.co/laion/moss-tts-local-transformer-4.55b-voice-acting-v2-sft3
- Codec de audio MOSS Audio Tokenizer v2: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Documentación de entrenamiento (TRAINING.md): https://huggingface.co/laion/Humaneness-Voice-Large-1.2-Alpha/blob/main/TRAINING.md
- Historiales de pérdida y validación (stats/): https://huggingface.co/laion/Humaneness-Voice-Large-1.2-Alpha/tree/main/stats
- Script de inferencia (infer.py): https://huggingface.co/laion/Humaneness-Voice-Large-1.2-Alpha/blob/main/infer.py
- Dependencias probadas (requirements.txt): https://huggingface.co/laion/Humaneness-Voice-Large-1.2-Alpha/blob/main/requirements.txt
- Dataset de entrenamiento: https://huggingface.co/datasets/laion/german-english-voice-acting-challenges
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a páginas de ayuda de YouTube y no guardan relación con esta ficha.
