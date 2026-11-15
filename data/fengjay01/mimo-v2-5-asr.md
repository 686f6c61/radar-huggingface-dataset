# fengjay01/MiMo-V2.5-ASR

## Resumen

MiMo-V2.5-ASR es un modelo de reconocimiento automático del habla (ASR) de extremo a extremo desarrollado por el equipo Xiaomi MiMo. Está diseñado para transcribir con robustez habla en mandarín, inglés, múltiples dialectos chinos (wu, cantonés, hokkien, sichuanés), habla con cambio de código chino-inglés, letras de canciones, contenido intensivo en conocimiento, entornos acústicos ruidosos y conversaciones con múltiples hablantes. El modelo se distribuye bajo licencia MIT y se publica en Hugging Face con el identificador `fengjay01/MiMo-V2.5-ASR`, apuntando al repositorio original `XiaomiMiMo/MiMo-V2.5-ASR`.

La arquitectura se etiqueta como `qwen2` en los metadatos de Hugging Face y el modelo cuenta con 7.622.619.136 parámetros totales (aproximadamente 7,6 mil millones) almacenados en safetensors, con un tamaño de repositorio de 32,1 GB. El pipeline declarado es `automatic-speech-recognition`, aunque los tags también incluyen `text-generation` y `text-generation-inference`, lo que sugiere un componente de decodificación basado en un modelo de lenguaje. El modelo se apoya en un tokenizador de audio separado, `MiMo-Audio-Tokenizer`, que debe descargarse junto con los pesos principales.

Su relevancia actual radica en que aborda escenarios donde los sistemas ASR convencionales fallan: mezcla de dialectos, cambio de código, contenido denso en conocimiento y conversaciones multi-hablante con solapamiento. Además, genera puntuación de forma nativa a partir de la prosodia y la semántica, lo que permite obtener transcripciones listas para usar sin post-procesado. La información disponible no detalla la longitud de contexto ni los tipos de cuantización soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (según tag `qwen2`), ASR de extremo a extremo con tokenizador de audio externo |
| Parametros totales | 7.622.619.136 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh), inglés (en), cantonés (yue); dialectos chinos: wu, hokkien, sichuanés y otros |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiMo-V2.5-ASR es un modelo ASR de extremo a extremo. Los metadatos lo etiquetan con la arquitectura `qwen2`, lo que indica que el componente de decodificación se basa en un transformer de la familia Qwen2 con aproximadamente 7,6 mil millones de parámetros. El sistema depende de un tokenizador de audio independiente, `MiMo-Audio-Tokenizer`, que convierte la señal de audio en tokens que el modelo de lenguaje procesa para generar la transcripción. No se dispone de información detallada sobre el número de capas, dimensiones ocultas ni mecanismos de atención específicos.

El entrenamiento combina, según la model card, un *mid-training* a gran escala, un ajuste supervisado (SFT) con datos de alta calidad y un algoritmo novedoso de aprendizaje por refuerzo (RL). No se especifica el número de tokens de entrenamiento ni la composición exacta del dataset. El modelo incorpora un modo de inferencia con etiqueta de idioma opcional (chino, inglés o automático) y una interfaz `asr_sft()` en la demo oficial. La generación nativa de puntuación a partir de prosodia y semántica es una de las innovaciones destacadas por el autor.

## Capacidades

- Transcripción de habla en mandarín e inglés con alto rendimiento.
- Soporte nativo de dialectos chinos: wu, cantonés, hokkien, sichuanés y otros.
- Transcripción de habla con cambio de código chino-inglés sin necesidad de etiquetas de idioma.
- Reconocimiento de letras de canciones en chino e inglés, incluso con acompañamiento instrumental y voces mezcladas.
- Reconocimiento robusto en entornos ruidosos, captura de campo lejano y condiciones acústicas adversas.
- Transcripción de conversaciones multi-hablante con solapamiento, como reuniones.
- Reconocimiento de contenido intensivo en conocimiento: poesía clásica, terminología técnica, nombres propios y topónimos.
- Generación nativa de puntuación a partir de prosodia y semántica, sin post-procesado.
- Detección automática de idioma (modo Auto) recomendada para habla con cambio de código.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; el pipeline es ASR.

## Casos de uso

- Transcripción de reuniones y conversaciones multi-hablante: el modelo maneja solapamiento de voces y genera puntuación nativa, lo que permite producir actas listas para revisión sin post-procesado manual.
- Subtitulado de contenido audiovisual con cambio de código: la detección automática de idioma y la transcripción sin etiquetas facilitan subtítulos en vídeos donde se alterna chino e inglés.
- Transcripción de letras de canciones: el reconocimiento de letras con acompañamiento instrumental permite generar letras sincronizables para plataformas musicales o karaoke.
- Atención al cliente y análisis de llamadas: la robustez frente a ruido y campo lejano permite transcribir grabaciones telefónicas o de centros de contacto para análisis de calidad y cumplimiento.
- Documentación clínica o legal dictada: el reconocimiento de terminología técnica y nombres propios reduce errores en transcripciones de dictados especializados.
- Archivado y búsqueda de contenido en dialectos: el soporte nativo de wu, cantonés, hokkien y sichuanés permite transcribir y hacer buscable material audiovisual en estas variedades.
- Accesibilidad: generación de subtítulos automáticos para vídeos y retransmisiones en chino, inglés y cantonés, con puntuación incluida para mejorar la legibilidad.

## Benchmarks y rendimiento

La model card indica que MiMo-V2.5-ASR alcanza resultados estado del arte en una amplia gama de benchmarks públicos y que lidera el Open ASR Leaderboard en benchmarks ingleses complejos como AMI. Sin embargo, los números concretos por benchmark no se incluyen en la información proporcionada; el autor remite a su blog para los datos detallados. Por tanto, no se presentan cifras en esta ficha.

No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 7,6 mil millones de parámetros en safetensors (32,1 GB de repositorio), la inferencia en precisión completa requiere del orden de 30 GB o más de VRAM; en cuantizaciones de 8 bits o 4 bits podría reducirse, pero no se documentan formatos de cuantización soportados.
- GPU recomendadas: no especificadas por el autor. El stack oficial requiere CUDA >= 12.0 y `flash-attn==2.7.4.post1`, lo que apunta a GPUs NVIDIA con soporte de FlashAttention (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No confirmado. Por tamaño de parámetros, una RTX 4090 (24 GB) podría no ser suficiente en precisión completa; sería necesario cuantizar, pero no se documentan pesos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: el repositorio oficial proporciona una demo Gradio (`run_mimo_asr.py`) y la interfaz `asr_sft()`. Los tags incluyen `text-generation-inference` (TGI) y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas oficiales con modelos alternativos en la información proporcionada. A continuación se comparan características estructurales con alternativas conocidas de la categoría ASR, marcando como "no disponible" los datos que no se han podido verificar.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.5-ASR | 7,6 B | no disponible | zh, en, yue y dialectos chinos | MIT | Hugging Face, ModelScope |
| Whisper large-v3 (OpenAI) | ~1,55 B | 30 s de audio por ventana | multilingüe amplio | MIT | Hugging Face, OpenAI |
| Qwen-Audio (Alibaba) | no disponible | no disponible | multilingüe | no disponible | Hugging Face |
| SeamlessM4T (Meta) | no disponible | no disponible | multilingüe | no disponible | Hugging Face |

La comparación de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al entrenarse con datos de habla, puede heredar sesgos de acento, género o registro presentes en el corpus.
- Riesgo de alucinación en transcripciones: como modelo generativo, puede producir texto plausible que no corresponde al audio, especialmente en segmentos ruidosos o ininteligibles.
- Idiomas soportados limitados a chino, inglés y cantonés (más dialectos chinos); no se documenta cobertura de otras lenguas.
- Longitud de contexto no especificada, lo que dificulta planificar la transcripción de audios largos sin segmentación.
- No se documentan tipos de cuantización ni formatos GGUF, lo que limita el despliegue en hardware de consumo.
- La licencia MIT permite uso comercial, pero el modelo depende del tokenizador `MiMo-Audio-Tokenizer`, cuya licencia debe verificarse por separado.
- El repositorio `fengjay01/MiMo-V2.5-ASR` tiene 0 descargas y 0 likes y parece un espejo del repositorio oficial `XiaomiMiMo/MiMo-V2.5-ASR`; conviene usar el original para garantizar integridad y soporte.
- Requiere CUDA >= 12.0 y FlashAttention 2.7.4.post1, lo que restringe el despliegue a entornos NVIDIA compatibles.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/fengjay01/MiMo-V2.5-ASR
- Hugging Face (oficial): https://huggingface.co/XiaomiMiMo/MiMo-V2.5-ASR
- ModelScope: https://modelscope.cn/models/XiaomiMiMo/MiMo-V2.5-ASR
- Tokenizador de audio: https://huggingface.co/XiaomiMiMo/MiMo-Audio-Tokenizer
- Tokenizador de audio en ModelScope: https://modelscope.cn/models/XiaomiMiMo/MiMo-Audio-Tokenizer
- GitHub: https://github.com/XiaomiMiMo/MiMo-V2.5-ASR
- Demo online: https://huggingface.co/spaces/XiaomiMiMo/MiMo-V2.5-ASR
- Blog: https://mimo.xiaomi.com/mimo-v2-5-asr
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard
- FlashAttention (wheel precompilado): https://github.com/Dao-AILab/flash-attention/releases/download/v2.7.4.post1/flash_attn-2.7.4.post1+cu12torch2.6cxx11abiFALSE-cp312-cp312-linux_x86_64.whl
