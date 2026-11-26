# laion/Humaneness-Voice-Large-1.7

## Resumen

Humaneness Voice Large 1.7 es un modelo de síntesis de voz (text-to-speech) expresiva desarrollado por LAION, la organización sin ánimo de lucro alemana conocida por sus datasets abiertos de pares imagen-texto. El modelo parte de la arquitectura MOSS TTS (etiqueta `moss_tts_local` en Hugging Face) y se distribuye como un finetune del checkpoint `laion/Humaneness-Voice-Large-1.3-Alpha`. Con 4.129.990.144 parámetros (aproximadamente 4,13 mil millones), está orientado a la generación de habla con control fino de la interpretación: emoción, pausas, reacciones vocales y estilo conversacional.

La propuesta diferencial frente a otros TTS es la separación explícita entre el texto que se pronuncia (`text`) y las instrucciones de dirección interpretativa (`prompt`), que se estructuran en dos bloques `GENERAL:` y `SCRIPT:`. Esto permite dirigir la actuación como si se tratase de un guion teatral, incluyendo duraciones objetivo y pausas entre corchetes. Además, admite clonación de voz mediante una grabación de referencia limpia de un solo hablante, o generar una voz sin referencia.

El modelo cubre cinco idiomas (inglés, alemán, francés, español y neerlandés) y se publica bajo licencia CC-BY-4.0. La versión 1.7 incorpora una ruta de servicio optimizada en BF16 con referencias cacheadas, compilación con CUDA graphs/Inductor y decodificación optimizada de tokens acústicos, lo que reduce la latencia en despliegues de streaming y batch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MOSS TTS local (transformers, `moss_tts_local`), con codec de audio MOSS Audio Tokenizer v2 |
| Parametros totales | 4.129.990.144 (~4,13 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos raíz en FP32; la ruta de inferencia oficial usa BF16. Otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en), alemán (de), francés (fr), español (es), neerlandés (nl) |
| Licencia | CC-BY-4.0 (el tokenizador MOSS Audio Tokenizer v2 mantiene sus propios términos) |
| Formato de pesos | safetensors (FP32 en el repositorio); requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo se basa en la familia MOSS TTS, una arquitectura de síntesis de voz que combina un modelo de lenguaje para la generación de tokens acústicos con un codec de audio (MOSS Audio Tokenizer v2) que reconstruye la forma de onda. El repositorio contiene los pesos completos fusionados de la versión 1.7, de modo que la inferencia ordinaria no requiere adjuntar adaptadores. La implementación es código personalizado (`custom_code`), por lo que es necesario revisar el código antes de cargarlo con `trust_remote_code=True`.

El modelo se ha afinado a partir de `laion/Humaneness-Voice-Large-1.3-Alpha` (relación `finetune`). La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal documentada es el control condicionado de la interpretación mediante prompts estructurados: las duraciones y pausas solicitadas son condicionamiento aprendido, no límites de edición garantizados. En la parte de servicio, la versión 1.7 incorpora una ruta BF16 probada con referencias cacheadas, CUDA graphs/Inductor y decodificación optimizada de tokens acústicos y codec, con chunks de streaming crecientes.

## Capacidades

- Generación de voz expresiva con control de emoción, estilo conversacional, pausas y reacciones vocales (suspiros, jadeos, etc.).
- Dirección interpretativa mediante prompt estructurado en bloques `GENERAL:` y `SCRIPT:`, con instrucciones locales entre paréntesis y control de duración/pausa entre corchetes.
- Clonación de voz a partir de una grabación de referencia limpia de un solo hablante; también permite generar una voz sin referencia.
- Multilingüe en cinco idiomas: inglés, alemán, francés, español y neerlandés. Las instrucciones de interpretación se recomienda mantenerlas en inglés.
- Catálogo de recetas buscables: 40 emociones, 15 estilos de habla y 18 clases de vocalizaciones en cinco idiomas (455 combinaciones objetivo/idioma/condición).
- Servicio en streaming y batch con ruta BF16 optimizada (CFG 2, temperatura 0,8).
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada (ASR) en la información disponible.

## Casos de uso

- Doblaje y localización de contenido: el modelo permite generar la misma interpretación en inglés, alemán, francés, español y neerlandés manteniendo el control de emoción y pausas, lo que facilita adaptar un guion a varios mercados sin regrabar actores.
- Audiolibros y narración expresiva: la separación entre `text` y `prompt` permite dirigir el ritmo, las pausas y el tono de cada pasaje, algo útil para narrativa con diálogos y cambios de registro emocional.
- Asistentes de voz con personalidad: la clonación mediante referencia y el control de estilo conversacional permiten definir una identidad de voz consistente y un registro cercano en interacciones multi-turno.
- Videojuegos y personajes interactivos: el catálogo de 40 emociones y 18 clases de vocalizaciones (suspiros, jadeos) cubre las necesidades de actuación de voz para personajes, con generación bajo demanda en lugar de grabaciones pregrabadas.
- Prototipado rápido de voces para accesibilidad: generación de voz sin referencia para convertir texto en audio en aplicaciones de lectura asistida en los cinco idiomas soportados.
- Producción de podcasts y contenido breve: la ruta de streaming con primer PCM en 0,470 s en una RTX 3090 y RTF de 0,2873 permite generar fragmentos de audio en tiempo casi real para flujos de publicación automatizados.
- Investigación en habla expresiva: el manual interactivo con recetas validadas (`usable: true`) y las condiciones de evaluación held-out sirven como banco de pruebas reproducible para estudiar control prosódico.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). Sí incluye mediciones de rendimiento de inferencia en una RTX 3090 de 24 GiB, en flujo único, con CFG 2, temperatura 0,8 y tres repeticiones en caliente:

| Modelo | GPU | Primer PCM vía HTTP local | RTF en dispositivo | Segundos de audio / segundo de cómputo |
|---|---|---:|---:|---:|
| Small 1.1 Alpha RL r128 v1 | RTX 3090, 24 GiB | 0,394 s | 0,1669 | 5,99 |
| Large 1.7 | RTX 3090, 24 GiB | 0,470 s | 0,2873 | 3,48 |

En una prueba offline corta con 16 candidatos y CFG 2, Large 1.7 alcanza 15,45 segundos de audio por segundo; el límite de batch desplegado es 8. El primer PCM es una medición HTTP local; el RTF incluye el tiempo de TTS más codec dividido por la duración generada. La reproducción en navegador, el ASR, el LLM y la carga en frío se miden por separado.

## Requisitos de hardware

- VRAM estimada: con 4,13 mil millones de parámetros, en BF16 los pesos ocupan aproximadamente 8,3 GB; en FP32, unos 16,5 GB. La VRAM total necesaria depende del codec de audio, las referencias cacheadas y los buffers de streaming; no se publica una cifra cerrada.
- GPU recomendadas: la model card documenta y valida una RTX 3090 de 24 GiB. GPU de gama profesional como A100 o H100 son compatibles por capacidad, aunque no hay mediciones publicadas para ellas.
- Cabe en GPU de consumo: sí, al menos en una RTX 3090 de 24 GiB según las mediciones oficiales. No se documenta su funcionamiento en GPU con menos VRAM.
- Opciones de despliegue: el repositorio incluye `infer.py` como ruta de referencia de utterance completa, más una ruta de servicio BF16 con CUDA graphs/Inductor y streaming. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: primer PCM de 0,470 s vía HTTP local, RTF de 0,2873 y 3,48 segundos de audio por segundo de cómputo en flujo único sobre RTX 3090. El modelo Small alcanza 5,99 segundos de audio por segundo de cómputo en la misma GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables de otros modelos TTS en la información proporcionada. La única comparación documentada es interna, frente a la variante Small 1.1 Alpha RL r128 v1 de la misma familia:

| Modelo | Parámetros | Idiomas | RTF (RTX 3090) | Audio s / cómputo s | Licencia |
|---|---|---|---|---|---|
| Humaneness Voice Large 1.7 | 4,13 mil M | en, de, fr, es, nl | 0,2873 | 3,48 | CC-BY-4.0 |
| Humaneness Voice Small 1.1 Alpha RL r128 v1 | No disponible | No disponible | 0,1669 | 5,99 | No disponible |

Comparativas con alternativas de la misma categoría (por ejemplo, otros TTS expresivos multilingües): no disponible.

## Limitaciones y advertencias

- Los tiempos solicitados en el prompt (duraciones y pausas) son condicionamiento aprendido, no límites de edición garantizados; el audio generado puede desviarse de lo pedido.
- El modelo requiere `trust_remote_code=True` y ejecuta código personalizado; es imprescindible revisar el código antes de cargarlo en producción.
- Solo se soportan cinco idiomas (en, de, fr, es, nl); no se documenta cobertura fuera de ellos.
- No se han publicado datos sobre sesgos, tasas de alucinación o fidelidad de la clonación de voz. La clonación de voces plantea riesgos de suplantación y requiere consentimiento explícito del hablante de la referencia.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero el tokenizador MOSS Audio Tokenizer v2 conserva sus propios términos, que deben verificarse por separado.
- La ruta de inferencia `infer.py` es una referencia de utterance completa; los flags de servicio optimizado no la modifican automáticamente, por lo que el rendimiento en producción depende de usar la ruta de servicio BF16.
- Las mediciones de rendimiento se limitan a una RTX 3090 y a flujo único; no hay datos publicados de escalado multi-GPU ni de latencia en otros aceleradores.
- No se documentan capacidades de tool calling, agentes, visión ni entrada de audio, por lo que no debe asumirse que las tenga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/Humaneness-Voice-Large-1.7
- Modelo base: https://huggingface.co/laion/Humaneness-Voice-Large-1.3-Alpha
- Tokenizador de audio MOSS Audio Tokenizer v2: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Vídeo de presentación: https://youtu.be/rSRAkc1jAJQ
- Manual interactivo de prompting con audio: https://laion-humaneness-voice-large-1-7-prompting-manual.static.hf.space/
- Guía de prompting (PROMPTING.md): https://huggingface.co/laion/Humaneness-Voice-Large-1.7/blob/main/PROMPTING.md
- Recetas legibles por máquina (recipes.jsonl): https://huggingface.co/laion/Humaneness-Voice-Large-1.7/blob/main/manual/recipes.jsonl
- Guía para agentes (AGENT_GUIDE.md): https://huggingface.co/laion/Humaneness-Voice-Large-1.7/blob/main/manual/AGENT_GUIDE.md
- Recetas de optimización y tablas de hardware (ROBBY_RTX3090.md): https://huggingface.co/laion/Humaneness-Voice-Large-1.7/blob/main/ROBBY_RTX3090.md
- Notas de inferencia y batching (INFERENCE_OPTIMIZATIONS.md): https://huggingface.co/laion/Humaneness-Voice-Large-1.7/blob/main/INFERENCE_OPTIMIZATIONS.md
- Cambio de modelos en Robby: https://github.com/christophschuhmann/cartoon-face-generator/blob/main/robby/voice-assistant/LARGE17.md
- Sitio de LAION: https://laion.ai/
- Proyectos de LAION: https://laion.ai/projects/
- LAION en Wikipedia: https://en.wikipedia.org/wiki/LAION
