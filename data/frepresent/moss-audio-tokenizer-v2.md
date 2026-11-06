# frepresent/MOSS-Audio-Tokenizer-v2

## Resumen

MOSS-Audio-Tokenizer-v2 es un tokenizador de audio discreto unificado desarrollado en el marco del proyecto MOSS (familia MOSS-TTS) y presentado en el artículo "MOSS-Audio-Tokenizer: Scaling Audio Tokenizers for Future Audio Foundation Models" (arXiv:2602.10934). Se basa en la arquitectura **Cat** (Causal Audio Tokenizer with Transformer), una propuesta "CNN-free" compuesta íntegramente por bloques transformer causales, con 2.000 millones de parámetros combinados entre codificador y decodificador. No es un modelo generativo de texto: es un códec neuronal que convierte audio estéreo a 48 kHz en tokens discretos y los reconstruye, sirviendo como interfaz discreta para modelos fundamentales de audio.

Su relevancia radica en tres factores. Primero, comprime audio estéreo de 48 kHz a una tasa de trama de solo 12,5 Hz mediante una pila de cuantización vectorial residual (RVQ) de 32 capas, lo que permite bitrates variables y reconstrucción de alta fidelidad. Segundo, se ha entrenado desde cero sobre 3 millones de horas de audio diverso (voz, efectos sonoros y música), sin depender de codificadores preentrenados como HuBERT o Whisper ni de destilación. Tercero, produce tokens con alineamiento semántico, lo que lo hace apto tanto para reconstrucción como para tareas posteriores de comprensión (ASR) y generación (TTS).

El repositorio alojado en Hugging Face bajo el identificador `frepresent/MOSS-Audio-Tokenizer-v2` contiene una implementación ligera de código remoto que replica el módulo `transformers.models.moss_audio_tokenizer`, y debe cargarse con `trust_remote_code=True`. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cat (Causal Audio Tokenizer with Transformer), transformer causal puro sin CNN |
| Parametros totales | 2.123.701.248 (codificador + decodificador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio por fragmentos; soporta streaming con `chunk_duration`) |
| Tipos de cuantizacion | RVQ de 32 capas; pesos en fp32 y bf16 (`codec_weight_dtype`), cuantizador siempre en fp32 |
| Idiomas soportados | no disponible (multilingue por naturaleza del audio; no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 8,5 GB) |

## Arquitectura y entrenamiento

La arquitectura Cat es un transformer causal homogéneo sin capas convolucionales, lo que la diferencia de los códecs neuronales convencionales que combinan CNN y bloques recurrentes o transformer. El codificador transforma la forma de onda estéreo a 48 kHz en una secuencia de tokens discretos a 12,5 Hz, y el decodificador realiza la operación inversa. La cuantización se lleva a cabo mediante una pila RVQ de 32 capas, lo que permite truncar la pila (por ejemplo, usar solo las 8 primeras capas) para obtener bitrates menores con calidad degradada de forma controlada. El modelo se ha entrenado sobre 3 millones de horas de audio que cubren voz, efectos sonoros y música, y todos los componentes (codificador, cuantizador, decodificador, discriminador y un LLM decoder-only para alineamiento semántico) se optimizan conjuntamente de extremo a extremo en un único pipeline. No se emplean codificadores preentrenados ni destilación de modelos profesor: las representaciones se aprenden de forma autónoma a partir de datos crudos.

Entre las innovaciones técnicas destacan la inferencia en streaming de baja latencia mediante el argumento `chunk_duration` (en segundos, con la restricción de que `chunk_duration * sampling_rate` sea divisible por `downsample_rate`), el soporte de inferencia por lotes en streaming, y la separación explícita entre el dtype de cómputo (`fp32` o `bf16`) y el dtype de los pesos del códec, manteniendo el cuantizador siempre en fp32 para evitar pérdida de precisión. También se puede seleccionar el backend de atención entre `sdpa` y `flash_attention_2`.

## Capacidades

- Tokenización y reconstrucción de audio estéreo a 48 kHz con calidad sin pérdidas declarada por el autor.
- Compresión extrema a 12,5 Hz de tasa de trama con bitrate variable mediante truncamiento de la pila RVQ de 32 capas.
- Cobertura de dominios de audio amplios: voz, efectos sonoros y música.
- Tokens con alineamiento semántico, aptos para tareas posteriores de comprensión (ASR) y generación (TTS).
- Soporte de inferencia en streaming con baja latencia mediante `chunk_duration`.
- Soporte de inferencia por lotes, también en modo streaming.
- Selección de backend de atención (`sdpa` o `flash_attention_2`) y de dtype de cómputo (`fp32` o `bf16`).
- No es un modelo de generación de texto ni de razonamiento: no soporta tool calling, agentes ni multi-step reasoning.
- No se documentan capacidades de visión ni de audio-texto directo.

## Casos de uso

- **Compresión de audio para transmisión de baja latencia**: el modelo convierte audio estéreo a 48 kHz en tokens a 12,5 Hz, lo que reduce drásticamente el ancho de banda necesario; con `chunk_duration` se puede emitir y decodificar por fragmentos, adecuado para llamadas o streaming en tiempo real.
- **Backend de tokens para TTS**: al producir tokens discretos con alineamiento semántico, se puede usar como interfaz entre un modelo de lenguaje de texto y un decodificador de audio en pipelines de síntesis de voz, aprovechando la reconstrucción de alta fidelidad.
- **Frontend de tokens para ASR**: los tokens "semantic-rich" sirven como representación de entrada para modelos de reconocimiento de voz, evitando depender de codificadores preentrenados como HuBERT o Whisper.
- **Códec de propósito general para música y efectos**: al haberse entrenado sobre 3 millones de horas de audio diverso, puede emplearse en plataformas de música o videojuegos para codificar y reconstruir efectos sonoros y música con bitrate ajustable truncando la pila RVQ.
- **Investigación en modelos fundamentales de audio**: como interfaz discreta unificada, es un componente de partida para experimentos de modelos de audio nativos que necesiten un tokenizador común para voz, sonido y música.
- **Archivado y transmisión con bitrate adaptativo**: la posibilidad de decodificar con distinto número de capas RVQ (por ejemplo, 8 frente a 32) permite adaptar la calidad y el coste computacional al ancho de banda o a la potencia del dispositivo receptor.
- **Evaluación de códecs neuronales**: al ser una implementación de referencia en `transformers` con código remoto, sirve como base reproducible para comparar códecs neuronales en tareas de reconstrucción y alineamiento semántico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en fp32, el modelo de 2.123.701.248 parámetros requiere aproximadamente 8,5 GB solo para pesos, más memoria para activaciones; en bf16 se reduce a unos 4,3 GB para pesos, aunque el cuantizador se mantiene en fp32.
- **GPU recomendadas**: para fp32, GPU con 16 GB o más (A100 40 GB, H100, RTX 4090 de 24 GB); para bf16, GPU con 8-12 GB pueden ser suficientes según la longitud del audio y el modo streaming.
- **Cabe en GPU de consumo**: sí, en bf16 en tarjetas como RTX 4090 (24 GB) o RTX 3090 (24 GB); en fp32 es ajustado en 12-16 GB y requiere cuidado con las activaciones.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (implementación de referencia); el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponibles; el autor solo indica que el diseño soporta inferencia en streaming de baja latencia, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tasa | Licencia | Disponibilidad |
|---|---|---|---|---|
| MOSS-Audio-Tokenizer-v2 | 2.123.701.248 | 12,5 Hz, RVQ 32 capas, 48 kHz estéreo | Apache 2.0 | Hugging Face (`frepresent/MOSS-Audio-Tokenizer-v2`) |
| EnCodec (Meta) | no disponible en la información | RVQ multibanda, 24-48 kHz | no disponible en la información | no disponible en la información |
| SoundStream (Google) | no disponible en la información | RVQ, 24 kHz | no disponible en la información | no disponible en la información |
| DAC (Descript) | no disponible en la información | RVQ, 44,1 kHz | no disponible en la información | no disponible en la información |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica que es un artefacto reciente y poco validado por la comunidad.
- El identificador del repositorio (`frepresent/MOSS-Audio-Tokenizer-v2`) no coincide con el `repo_id` que aparece en los ejemplos de la model card (`OpenMOSS-Team/MOSS-Audio-Tokenizer-v2`), lo que puede causar confusión al cargar el modelo.
- Requiere `trust_remote_code=True`; el propio autor recomienda fijar `revision` a un commit revisado en producción para evitar ejecutar código no auditado.
- No se deben castear los pesos completos con `model.to(torch.bfloat16)`, ya que el cuantizador debe permanecer en fp32; hacerlo puede provocar desajustes de dtype o pérdida grave de precisión.
- El truncamiento de la pila RVQ reduce la calidad de reconstrucción de forma no cuantificada en la información disponible.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas; al ser un códec, el riesgo principal es la degradación de la reconstrucción, no la generación de contenido falso.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks publicados impide garantizar el rendimiento en dominios concretos sin evaluación propia.
- El tamaño del repo (8,5 GB) y la necesidad de GPU con suficiente VRAM limitan su despliegue en entornos de bajos recursos.
- No se especifican idiomas soportados ni límites de duración de audio por invocación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frepresent/MOSS-Audio-Tokenizer-v2
- Artículo (arXiv): https://arxiv.org/abs/2602.10934
- Repositorio alternativo citado en la model card: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
