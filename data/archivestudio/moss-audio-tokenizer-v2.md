# ArchiveStudio/MOSS-Audio-Tokenizer-v2

## Resumen

MOSS-Audio-Tokenizer-v2 es un tokenizador de audio discreto unificado basado en la arquitectura **Cat** (Causal Audio Tokenizer with Transformer), presentado en el artículo «MOSS-Audio-Tokenizer: Scaling Audio Tokenizers for Future Audio Foundation Models» (arXiv:2602.10934) por el equipo OpenMOSS. Esta versión concreta es la variante de 48 kHz estéreo, con 2.123.701.248 parámetros reales en safetensors (encoder + decoder), y su función es convertir audio en secuencias de tokens discretos y reconstruirlo, sirviendo como interfaz común para modelos de audio nativos.

El modelo comprime audio estéreo a 48 kHz en una tasa de trama de solo 12,5 Hz mediante una pila de cuantización vectorial residual (RVQ) de 32 capas, lo que permite reconstrucción de alta fidelidad con bitrate variable (basta con truncar capas RVQ para bajar el régimen binario). Su arquitectura es «CNN-free»: todos los bloques son transformers causales, lo que habilita inferencia en streaming de baja latencia. Se entrenó desde cero sobre 3 millones de horas de audio diverso (voz, efectos de sonido y música), sin encoders preentrenados tipo HuBERT o Whisper ni destilación.

La relevancia actual es doble: por un lado produce tokens con alineamiento semántico, lo que permite tareas de comprensión (ASR) y generación (TTS) sin encoders auxiliares; por otro, el artículo reporta el primer TTS puramente autorregresivo que supera a sistemas no autorregresivos y en cascada usando estos tokens. El repositorio analizado es un espejo de terceros (ArchiveStudio) del modelo oficial de OpenMOSS, distribuido con `trust_remote_code=True` y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cat (Causal Audio Tokenizer with Transformer): encoder y decoder de transformers causales, sin CNN; cuantizador RVQ de 32 capas |
| Parametros totales | 2.123.701.248 (2,12 mil millones; encoder + decoder combinados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto; soporta streaming por fragmentos (`chunk_duration`, en segundos) con tasa de trama de 12,5 Hz |
| Tipos de cuantizacion | Pesos en fp32 (por defecto) o bf16 (`codec_weight_dtype`); el cuantizador se mantiene siempre en fp32; no se documenta GGUF ni cuantizacion de 8/4 bits |
| Idiomas soportados | No disponible (entrenado en audio general; la model card no detalla cobertura por idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors + codigo remoto (`trust_remote_code=True`), integrable via `transformers.AutoModel` |
| Muestreo de audio | 48 kHz, estéreo |
| Tasa de trama | 12,5 Hz |
| Capas RVQ | 32 |
| Backends de atencion | `sdpa` o `flash_attention_2` (`config.attention_implementation`) |
| Tipos de computo | fp32, bf16 (`config.compute_dtype`) |
| Tamano del repositorio | 8,5 GB |
| Descargas / likes | 0 / 0 (espejo reciente, creado el 2026-10-24) |

## Arquitectura y entrenamiento

Cat sustituye el típico tándem CNN + transformer de los codecs neuronales por una pila homogénea de bloques transformer causales, tanto en el encoder como en el decoder, con 2 mil millones de parámetros combinados. La compresión se realiza en dos etapas: el encoder transforma la forma de onda estéreo a 48 kHz en una secuencia latente a 12,5 tramas por segundo, y un cuantizador residual de 32 capas discretiza cada trama. El decoder reconstruye la señal a partir de los códigos, y el diseño permite truncar la pila RVQ (por ejemplo, usar solo las 8 primeras capas) para operar a bitrates menores con pérdida controlada de fidelidad.

El entrenamiento se hizo íntegramente desde cero sobre 3 millones de horas de audio que cubren habla, efectos de sonido y música, sin encoders preentrenados ni destilación de profesores. Todos los componentes —encoder, cuantizador, decoder, discriminador y un LLM decoder-only encargado del alineamiento semántico— se optimizan conjuntamente en un único pipeline. Ese alineamiento semántico es lo que hace que los tokens sean útiles aguas abajo: el artículo indica que con estos tokens se construye el primer TTS puramente autorregresivo que supera a sistemas no autorregresivos y en cascada, y que se obtiene ASR competitivo sin encoders auxiliares. La implementación publicada expone `encode`, `decode`, `batch_encode` y `batch_decode`, todos con soporte de streaming mediante `chunk_duration`, con la restricción de que `chunk_duration * sampling_rate` sea divisible por `downsample_rate`.

## Capacidades

- Tokenizacion discreta de audio estéreo a 48 kHz con reconstruccion de alta fidelidad y tasa de trama de 12,5 Hz.
- Bitrate variable mediante truncado de las 32 capas RVQ (el ejemplo de la model card decodifica solo con las 8 primeras).
- Codificacion y decodificacion por lotes (`batch_encode`, `batch_decode`), también en modo streaming.
- Inferencia en streaming de baja latencia por fragmentos configurables (`chunk_duration`), incluido streaming con lotes.
- Representacion unica semantico-acustica: los tokens sirven tanto para reconstruccion como para tareas de comprension (ASR) y generacion (TTS).
- Cobertura de dominios de audio general: voz, efectos de sonido y musica.
- Control de backend de atencion (`sdpa`, `flash_attention_2`) y de precision (fp32, bf16) en tiempo de carga o en caliente.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni generacion de texto.
- No se documenta capacidad multilingue explicita ni etiquetado por idioma.

## Casos de uso

- **TTS autorregresivo sobre tokens discretos**: los codigos del tokenizador se usan como secuencia objetivo de un modelo de lenguaje decoder-only que genera voz; el articulo reporta que este esquema puramente autorregresivo supera a sistemas no autorregresivos y en cascada, lo que lo hace adecuado para pipelines de sintesis de voz de nueva generacion.
- **ASR sin encoder auxiliar**: al ser tokens semanticamente ricos, un LLM puede consumir directamente los codigos para transcripcion, eliminando la necesidad de un encoder acustico separado (HuBERT, Whisper) en la arquitectura de reconocimiento.
- **Compresion y transmision de audio a bajo bitrate**: con 12,5 tramas por segundo y 32 capas RVQ se puede ajustar el regimen binario truncando capas, util para archivar audio, distribuirlo por redes limitadas o almacenar corpus grandes con calidad controlada.
- **Codec de produccion para streaming en tiempo real**: la arquitectura causal y el parametro `chunk_duration` permiten codificar y decodificar por fragmentos, apto para VoIP, videollamada o retransmision con latencia acotada y sin esperar a la senal completa.
- **Preprocesado de corpus masivos para entrenamiento**: convierte horas de audio heterogeneo (habla, musica, efectos) en secuencias discretas indexables, lo que simplifica el entrenamiento de modelos generativos de audio sobre datasets a gran escala.
- **Capa de audio de modelos fundacionales nativos**: al ofrecer reconstruccion de alta fidelidad y alineamiento semantico en una sola interfaz, encaja como tokenizador de entrada/salida en modelos omni que necesitan alternar comprension y generacion de audio.
- **Reconstruccion y restauracion de musica y efectos**: la cobertura de 3 millones de horas en dominios musicales y de efectos permite usarlo como codec de referencia para recompresion o regeneracion de material no vocal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y el resumen del articulo unicamente afirman de forma cualitativa que se alcanza «estado del arte» en calidad de reconstruccion y que el TTS autorregresivo basado en estos tokens supera a sistemas no autorregresivos y en cascada, ademas de lograr ASR competitivo sin encoders auxiliares, pero no se aportan cifras (MOS, WER, bitrate, etc.) en el material proporcionado.

## Requisitos de hardware

- **VRAM estimada (calculada a partir del numero de parametros, no publicada por el autor)**: ~8,5 GB solo para pesos en fp32; ~4,3 GB en bf16. Sumando activaciones, buffers de audio y el cuantizador (siempre fp32), cabe esperar del orden de 10-14 GB en fp32 y 6-10 GB en bf16 para audio de duracion moderada.
- **GPU recomendadas**: A100 (40/80 GB) y H100 para procesamiento por lotes a gran escala; RTX 4090 (24 GB) para desarrollo y streaming con holgura.
- **Consumer GPU**: si, en bf16 cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB). En fp32 conviene disponer de 16 GB o mas.
- **Carga en bf16**: pasar `codec_weight_dtype="bf16"` en `from_pretrained` evita materializar primero los pesos en fp32 en GPU y duplicar el pico de memoria.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (unica via documentada); backend de atencion `sdpa` o `flash_attention_2`. No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni GGUF.
- **Latencia y throughput**: no disponibles como cifras. Como referencia de diseno, la arquitectura es causal y admite streaming por fragmentos, lo que en principio permite latencia proporcional al tamano de chunk elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Muestreo / canales | Tasa de trama | RVQ | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MOSS-Audio-Tokenizer-v2 (48 kHz estereo) | 2,12 mil millones (encoder + decoder) | 48 kHz, estereo | 12,5 Hz | 32 capas | 3 millones de horas | Apache 2.0 | Hugging Face + ModelScope, codigo remoto |
| MOSS-Audio-Tokenizer (version base, segun GitHub) | 1,6 mil millones | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Apache 2.0 | GitHub + Hugging Face |
| Espejos de terceros (huangxudong, Jinstudio) | No disponibles | No disponibles | No disponibles | No disponibles | No disponibles | No disponible | Hugging Face |
| Otros codecs neuronales (EnCodec, DAC, Mimi, WavTokenizer) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en la informacion proporcionada para comparar con codecs de otros autores; cualquier cifra al respecto seria especulativa.

## Limitaciones y advertencias

- **Espejo de terceros con `trust_remote_code`**: este repositorio (ArchiveStudio) no es el oficial; ejecuta codigo Python arbitrario en tu maquina. Fija `revision` a un commit revisado y, en produccion, considera usar el repositorio oficial de OpenMOSS-Team.
- **Sin validacion comunitaria**: 0 descargas y 0 likes en el momento del analisis; no hay senales de que el contenido coincida bit a bit con el modelo original.
- **Sin benchmarks publicados** en el material disponible: no hay cifras de MOS, WER ni curvas de calidad frente a bitrate para decidir con datos.
- **Cobertura linguistica no declarada**: la model card no especifica idiomas; el rendimiento en lenguas minoritarias o audio con fuerte ruido no esta documentado.
- **Alucinacion en sentido estricto no aplica** (no genera texto), pero a bitrates bajos o con truncado agresivo de capas RVQ apareceran artefactos de reconstruccion y perdida de detalle en musica y efectos.
- **Restriccion tecnica del cuantizador**: no aplicar `model.to(torch.bfloat16)` sobre el codec completo; el cuantizador debe permanecer en fp32 o se produciran errores de tipo y perdida grave de precision.
- **Restriccion de streaming**: `chunk_duration * sampling_rate` debe ser divisible por `downsample_rate`; un chunk mal elegido provoca fallo de inferencia.
- **Licencia Apache 2.0**: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; conviene revisar igualmente la licencia del repositorio oficial si se cambia de origen.
- **Formato**: solo safetensors con codigo remoto; no hay GGUF ni versiones cuantizadas, lo que limita el despliegue en entornos CPU-only o en runtimes ligeros.

## Enlaces

- Hugging Face (espejo analizado): https://huggingface.co/ArchiveStudio/MOSS-Audio-Tokenizer-v2
- Repositorio oficial referenciado en el codigo: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- GitHub del proyecto: https://github.com/OpenMOSS/MOSS-Audio-Tokenizer
- Articulo: https://arxiv.org/abs/2602.10934
- ModelScope: https://www.modelscope.cn/models/openmoss/MOSS-Audio-Tokenizer-v2
- Espejo en Hugging Face: https://huggingface.co/huangxudong/MOSS-Audio-Tokenizer-v2
- Espejo en Hugging Face (version previa): https://huggingface.co/Jinstudio/MOSS-Audio-Tokenizer
