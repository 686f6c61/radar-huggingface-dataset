# hon9kon9ize/Qwen3-ASR-1.7B-Yue

## Resumen
Qwen3-ASR-1.7B-Yue es un modelo de reconocimiento automático del habla (ASR) especializado en cantonés, desarrollado por el usuario hon9kon9ize como un ajuste fino (fine-tuning) del modelo Qwen3-ASR-1.7B de Alibaba Qwen. Resuelve un problema concreto: la mayoría de los modelos ASR multilingües transcriben el cantonés con ortografía y gramática del mandarín, mientras que este modelo genera cantonés escrito tradicional de Hong Kong, con las formas léxicas propias del cantonés (嘅, 咗, 啲, 喺, 冇, 嗰, 嘢, 係) y una convención ortográfica consistente basada en jyutping.org y words.hk.

El modelo tiene 2.349.217.408 parámetros (2,35 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 4,7 GB. Incorpora una extensión de vocabulario de 231 tokens nuevos para caracteres cantonenses que el tokenizador base fragmentaba en bytes, y un preentrenamiento continuado del decodificador sobre un corpus de 515 millones de caracteres de cantonés. La ventana de contexto no está especificada en la información disponible.

Es relevante ahora porque el cantonés es una lengua con escasa representación en sistemas ASR de calidad, y este modelo aborda tres problemas prácticos: la salida en cantonés escrito correcto, el cambio de código cantonés-inglés (code-switching) y el sesgo por contexto o "hotwords" que permite indicar términos concretos (nombres propios, topónimos, marcas) para mejorar su transcripción. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (basado en Qwen3-ASR-1.7B) |
| Parametros totales | 2.349.217.408 (2,35 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | yue (cantonés), zh (mandarín), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-ASR-1.7B, un sistema ASR con encoder de audio y decodificador basado en Qwen3-1.7B. El ajuste se realizó en dos fases. Primero, se extendió el vocabulario con 231 filas de tokens nuevos para caracteres cantonenses que el tokenizador base fragmentaba en bytes; cada fila de embedding de entrada y salida se inicializó con la media de las filas de las piezas que reemplaza, de modo que el modelo extendido arranca equivalente al original. Después, el decodificador se sometió a un preentrenamiento continuado sobre un corpus de 515 millones de caracteres de cantonés extraído de vídeos de YouTube y pódcasts; el delta resultante se fusionó en el modelo ASR extendido con un peso de 0,5.

El ajuste fino se hizo con LoRA de rango 32 y alpha 32 sobre el decodificador, más el entrenamiento de las 231 filas de embedding nuevas: 2 épocas, tasa de aprendizaje 5e-5 con schedule coseno y 5 % de warm-up, batch efectivo de 32 (2 × 4 GPUs × 4 de acumulación de gradiente), precisión bf16 con adaptadores en fp32 y semilla 3407. Se aplicaron varias aumentaciones: canal telefónico en el 50 % de los clips, concatenación de clips de hasta 40 s en el 30 %, contexto en el system prompt en el 60 % y sustitución de homófonos en el 40 % de los clips elegibles. El adaptador se fusionó en los pesos, por lo que el modelo publicado no requiere adaptador.

Los datos de entrenamiento suman 29.396 clips (unas 39 horas) tras la limpieza: Common Voice cantonés validado (3.106 clips, 3,5 h), Common Voice cantonés no validado filtrado por un modelo profesor (10.682 clips, 11,5 h), habla sintética cantonesa generada por TTS (5.600 clips, 3,4 h), cambio de código cantonés-inglés (2.800 clips, 6,9 h), palabras raras y vulgares sintéticas con JyutVoice (1.608 clips, 1,7 h), y datos de repetición en inglés (2.800 clips, 9,4 h) y mandarín (2.800 clips, 2,8 h) para preservar la precisión en esos idiomas. Las etiquetas se normalizaron con reglas de higiene (eliminación de filas solo en simplificado, corrección de erratas como 出黎 → 出嚟, 既野 → 嘅嘢, 我地 → 我哋) y estandarización ortográfica según jyutping.org.

## Capacidades
- Transcripción de voz en cantonés con salida en caracteres tradicionales y formas léxicas propias del cantonés escrito de Hong Kong.
- Convención ortográfica consistente: distingue 噉 (pronombre) de 咁 (adverbio), usa 畀, 鍾意, 而家, 搵, y el sufijo 返, y elige partículas finales de frase según el tono percibido.
- Manejo de cambio de código cantonés-inglés en una misma frase.
- Reconocimiento de palabras raras, coloquiales y vulgares, gracias a clips sintéticos específicos.
- Sesgo por contexto o "hotwords" mediante el system prompt: admite listas de vocabulario (prefijo `Vocabulary:` o `詞彙：`) para fijar la ortografía de nombres y términos.
- Robustez ante contextos incorrectos o irrelevantes: el modelo fue entrenado con contextos erróneos para que no escriba palabras que no ha oído.
- Detección automática de idioma si no se fuerza `language="Cantonese"`.
- Conservación de la precisión en inglés y mandarín gracias a los datos de repetición.
- Integración con la librería `qwen-asr` y con vLLM para servir en producción.

## Casos de uso
- Subtitulado de vídeo y pódcast en cantonés: el modelo transcribe audio de YouTube o pódcasts con salida en cantonés escrito tradicional, adecuado para generar subtítulos que respeten la ortografía estándar de Hong Kong en lugar de una transcripción estilo mandarín.
- Atención al cliente en cantón: integrado en un pipeline de telefonía, el modelo transcribe llamadas de clientes que hablan cantonés, con la aumentación de canal telefónico aplicada durante el entrenamiento para mejorar la robustez en audio de baja calidad.
- Transcripción de reuniones con terminología específica: mediante el parámetro `context` se puede pasar una lista de nombres de empresa, productos o topónimos (por ejemplo `詞彙：九龍塘、港鐵、恒生`) para que el modelo escriba esos términos con la ortografía exacta.
- Documentación clínica o legal en Hong Kong: dictado de informes donde el vocabulario técnico y los nombres propios deben transcribirse correctamente; el sesgo por hotwords ayuda a fijar la grafía de términos poco frecuentes.
- Análisis de contenido en redes sociales y medios: transcripción de vídeos con cambio de código cantonés-inglés, frecuente en creadores de contenido de Hong Kong, para su posterior indexación o búsqueda.
- Generación de datos de entrenamiento para otros modelos: el modelo puede actuar como etiquetador de audio cantones para construir corpus ASR, gracias a su salida normalizada y a la licencia Apache 2.0.
- Accesibilidad: transcripción en tiempo casi real de conversaciones o eventos para personas con discapacidad auditiva en comunidades cantonesas, desplegando el modelo con vLLM y troceando el audio en fragmentos de unos 40 s.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 2,35 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 4,7 GB, por lo que se necesita algo más de esa cifra para activaciones y caché del encoder de audio.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) es holgada; una GPU consumer de 8-12 GB podría ser suficiente en bf16 si el resto del pipeline lo permite.
- Cabe en GPU consumer: previsiblemente sí en tarjetas con 12 GB o más, aunque el dato no está confirmado en la documentación.
- Opciones de despliegue: librería `qwen-asr` con `transformers` (`Qwen3ASRModel.from_pretrained`) y vLLM. Para audio de más de unos 158 s, el caché del encoder por defecto rechaza la petición; hay que servir con `--max-num-batched-tokens 16384 --max-model-len 16384` o trocear el audio en fragmentos de unos 40 s cortados en puntos silenciosos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-Yue | 2,35 mil millones | yue, zh, en | no disponible | Apache 2.0 | Especializado en cantonés escrito; hotwords; code-switching |
| Qwen3-ASR-1.7B (base) | no disponible | multilingüe (no detallado) | no disponible | no disponible en esta ficha | Modelo original; transcribe cantonés con ortografía estilo mandarín |
| Whisper large-v3 | no disponible en esta ficha | multilingüe | no disponible | no disponible en esta ficha | ASR generalista; no especializado en cantonés escrito |
| Otros ASR específicos de cantonés | no disponible | yue | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias
- El modelo está especializado en cantonés; su rendimiento en otras lenguas distintas de yue, zh y en no está documentado.
- Riesgo de repetición: si el contexto proporcionado coincide estrechamente con las siguientes palabras del audio, el modelo puede repetirlas; se recomienda usar listas cortas de palabras.
- Riesgo de alucinación en pasajes con ruido o audio ambiguo, inherente a los sistemas ASR; el entrenamiento con contextos erróneos mitiga, pero no elimina, la escritura de palabras no oídas.
- Limitación de longitud de audio en vLLM: por defecto, audios de más de unos 158 s son rechazados por el caché del encoder; requiere configuración adicional o troceado.
- Sesgos: no se documentan sesgos específicos en la información disponible; al entrenarse con Common Voice y datos sintéticos, puede heredar sesgos de esos corpus.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento subyacentes (Common Voice, TTS, JyutVoice) si se redistribuye el modelo o datos derivados.
- El modelo se publicó en noviembre de 2026 con 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación externa.
- La convención ortográfica sigue jyutping.org y words.hk; otros estándares de escritura cantonensa pueden requerir post-procesado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/hon9kon9ize/Qwen3-ASR-1.7B-Yue
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Convenciones ortográficas de jyutping.org: https://jyutping.org/blog/typo/
- Diccionario words.hk: https://words.hk
- Paper referenciado en los tags (arXiv:2601.21337): https://arxiv.org/abs/2601.21337
