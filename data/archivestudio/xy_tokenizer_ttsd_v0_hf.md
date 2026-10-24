# ArchiveStudio/XY_Tokenizer_TTSD_V0_hf

## Resumen

XY-Tokenizer es un códec neuronal de voz (speech codec) que convierte audio en tokens discretos y los reconstruye de vuelta a forma de onda. Su rasgo diferencial es que modela de forma simultánea el aspecto semántico y el acústico de la señal, algo que la mayoría de códecs abordan por separado. Lo desarrolla el equipo OpenMOSS (MOSS-TTSD), y esta ficha corresponde a un espejo publicado por el usuario ArchiveStudio en Hugging Face, no al repositorio oficial.

El modelo opera a 12,5 Hz de frame rate con cuantización residual vectorial de 8 etapas (RVQ8), lo que da un bitrate de aproximadamente 1 kbps: 100 tokens por segundo, del orden de 10 bits por paso. Entrada a 16 kHz y salida reconstruida a 24 kHz. La model card declara soporte de audio largo mediante troceado con solape (chunking with overlap) y procesamiento por lotes.

Su relevancia práctica está en que sirve como códec base de MOSS-TTSD, un modelo de audio-lenguaje de 1,7B parámetros orientado a text-to-speech y generación de audio. Es decir, XY-Tokenizer no genera voz a partir de texto por sí mismo: es la capa de representación discreta sobre la que se construye ese sistema. Este repositorio concreto es un espejo de terceros con 0 descargas; para uso en producción conviene referenciar el repositorio original de OpenMOSS-Team.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Códec neuronal de audio con cuantización residual vectorial (RVQ8) y modelado dual (semántico + acústico); la model card no detalla la topología interna (capas, dimensión, tipo de decoder) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como ventana de texto; procesa audio de duración arbitraria mediante chunking con solape (declara soporte para archivos de más de 30 s) |
| Tipos de cuantización | RVQ de 8 etapas (RVQ8) a 12,5 Hz; no se documentan variantes de cuantización de pesos (int8, int4, GGUF) |
| Idiomas soportados | No disponible (un códec de voz no está ligado a un idioma concreto, pero no hay evaluación multilingüe publicada en la información disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos PyTorch para `transformers` con `trust_remote_code=True`; el repositorio no especifica safetensors, GGUF ni ONNX |
| Bitrate de representación | ~1 kbps |
| Frame rate | 12,5 Hz (≈100 tokens/s) |
| Frecuencia de entrada | 16 kHz |
| Frecuencia de salida | 24 kHz |
| Tamaño del repositorio | 2,1 GB |

## Arquitectura y entrenamiento

XY-Tokenizer es un códec neuronal encoder-decoder con cuantización residual vectorial de 8 codebooks. La innovación que declara el autor es el modelado en dos canales: una rama captura información semántica (contenido lingüístico, abstracción tipo ASR) y otra captura detalle acústico (timbre, prosodia, características del hablante), y ambas se combinan en la representación discreta. A un bitrate tan bajo como 1 kbps, el autor afirma que el modelo iguala a códecs del estado del arte especializados en un solo eje (semántico o acústico) mientras mantiene buen rendimiento en ambos.

El pipeline es el habitual de estos sistemas: un feature extractor remuestrea a 16 kHz, el encoder produce representaciones latentes, la RVQ las discretiza en 8 niveles y el decoder reconstruye forma de onda a 24 kHz. Para audio largo se aplica troceado con solape configurable en la decodificación (`overlap_seconds`, 10 s en el ejemplo de la model card), lo que evita discontinuidades en las fronteras entre fragmentos.

No se dispone de datos sobre volumen de entrenamiento, composición del dataset, número de tokens de audio, ni sobre si hubo etapas de ajuste con preferencias (RLHF/DPO). Tampoco se detalla en la información proporcionada si el entrenamiento es conjunto con MOSS-TTSD o independiente. El paper asociado (arXiv:2506.23325) es la fuente indicada para esos detalles.

## Capacidades

- Tokenización de voz a tokens discretos y reconstrucción inversa con pérdida de calidad mínima según el autor.
- Representación dual: semántica y acústica en la misma secuencia de tokens.
- Compresión extrema: ~1 kbps, equivalente a unos 450 kB por hora de audio (cálculo derivado del bitrate, sin contar metadatos).
- Procesamiento de audio de más de 30 segundos mediante chunking con solape configurable.
- Procesamiento por lotes de múltiples archivos de audio.
- Salida de audio a 24 kHz.
- Integración con `transformers` vía `AutoModel` y `AutoFeatureExtractor` con código remoto.
- Reutilización directa como códec de entrada/salida para MOSS-TTSD (modelo de audio-lenguaje de 1,7B).
- No incluye: generación de voz desde texto, clonación de voz, tool calling, razonamiento multi-paso ni capacidades de agente. Esas funciones corresponden al modelo de lenguaje de audio que se apoye en el códec.

## Casos de uso

- **Construcción de datasets de audio-lenguaje**: convertir horas de voz en secuencias de tokens discretos para entrenar o ajustar modelos tipo MOSS-TTSD. El bitrate de 1 kbps reduce el almacenamiento y acelera la carga de datos frente a trabajar con waveforms crudos.
- **Pipeline de text-to-speech con MOSS-TTSD**: usar XY-Tokenizer como decodificador final del sistema TTS. El modelo de lenguaje genera tokens y el códec los convierte en audio a 24 kHz, lo que permite sustituir el códec sin reentrenar el resto del pipeline.
- **Transmisión de voz en banda muy estrecha**: con ~1 kbps, la señal cabe en enlaces de telemetría, radio de baja capacidad o redes congestionadas donde un códec tradicional de 12-24 kbps no es viable. Requiere aceptar artefactos de reconstrucción.
- **Archivado y preservación de fondos sonoros**: almacenar la representación tokenizada de grabaciones largas y reconstruir bajo demanda. Con el chunking con solape se pueden procesar horas de audio sin cortes audibles en las uniones.
- **Preprocesado por lotes para etiquetado automático**: tokenizar un corpus completo en una pasada por lotes para alimentar modelos de ASR, diarización o clasificación que operen sobre tokens discretos en lugar de espectrogramas.
- **Evaluación y comparación de códecs**: usar el par encode/decode como referencia en estudios de calidad percibida frente a EnCodec, DAC o Mimi, midiendo la degradación introducida por la RVQ8 a 1 kbps.
- **Prototipado de sistemas de comunicación voz-a-voz de bajo consumo**: al disponer de una representación de 100 tokens/s, resulta manejable integrarla en arquitecturas de lenguaje que consumen y emiten tokens de audio en lugar de muestras PCM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma de forma cualitativa que, a 1 kbps, el rendimiento es comparable al de códecs del estado del arte especializados en un solo aspecto (semántico o acústico), sin aportar métricas objetivas (MUSHRA, ViSQOL, WER de re-síntesis, SIM de hablante) ni tablas comparativas. El paper arXiv:2506.23325 es la referencia indicada para esos datos.

## Requisitos de hardware

- **VRAM estimada**: no hay cifra oficial. A partir del tamaño del repositorio (2,1 GB de pesos), la inferencia en fp32 debería ocupar del orden de 2-4 GB de VRAM, por lo que una GPU con 6-8 GB sería suficiente con margen. Estimación, no dato del autor.
- **GPU recomendadas**: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB (RTX 3060/4060 en adelante). Para procesamiento por lotes de corpus grandes, A100 o H100 reducen el tiempo total, aunque el modelo es pequeño y no saturará estos aceleradores.
- **GPU de consumo**: sí, cabe con holgura en RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090. El cuello de botella previsible es el coste de decodificación de audio largo, no la memoria.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` sobre PyTorch y `torchaudio` para E/S de audio. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje. No se documenta exportación a ONNX.
- **Latencia y throughput**: no disponibles. El API expone `overlap_seconds` para controlar el compromiso entre calidad en las fronteras y coste de cómputo, y procesa lotes, pero no se publican cifras de latencia por segundo de audio ni de factor de tiempo real.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus especificaciones públicas y deben verificarse en sus respectivas model cards antes de usarlas en producción.

| Modelo | Desarrollador | Frame rate | Bitrate | Salida | Licencia | Notas |
|---|---|---|---|---|---|---|
| XY-Tokenizer | OpenMOSS | 12,5 Hz | ~1 kbps | 24 kHz | Apache-2.0 | Modelado dual semántico + acústico; RVQ8 |
| Mimi | Kyutai | 12,5 Hz | ~1,1 kbps | 24 kHz | CC-BY 4.0 | Enfoque similar de muy bajo bitrate; pensado para diálogo hablado |
| EnCodec | Meta | 75 Hz | 1,5-24 kbps (según número de codebooks) | 24 kHz | Código MIT; licencia de pesos a verificar | Referencia ampliamente usada; más codebooks y mayor bitrate |
| DAC | Descript | 75 Hz | Configurable (RVQ) | 24 kHz | MIT | Códec de alta fidelidad, orientado a calidad de reconstrucción más que a semántica |

La diferencia principal de XY-Tokenizer frente a EnCodec y DAC es el objetivo de diseño: no busca solo fidelidad acústica, sino una representación útil para modelos de lenguaje (componente semántico explícito) a un bitrate cuatro veces menor. Frente a Mimi, el planteamiento es casi idéntico en frame rate y bitrate; la comparación honesta exige métricas de reconstrucción y de utilidad semántica que ninguna de las dos model cards accesibles en esta búsqueda aporta de forma directa.

## Limitaciones y advertencias

- **No es un modelo de lenguaje ni un TTS**: no genera voz a partir de texto. Necesita un modelo de audio-lenguaje (MOSS-TTSD u otro) que produzca los tokens. Presentarlo como generador de voz sería incorrecto.
- **Pérdida por compresión**: a 1 kbps con 8 codebooks la reconstrucción es necesariamente aproximada. Es esperable degradación de detalle fino, prosodia y características del hablante; no hay métricas publicadas que cuantifiquen cuánto.
- **Alucinación en sentido estricto no aplica**, pero sí artefactos de reconstrucción, especialmente en audio con ruido de fondo, música o solapamiento de hablantes, dominios para los que no se documenta entrenamiento.
- **Cobertura lingüística no verificada**: no hay evaluación multilingüe publicada. Un códec no depende del idioma por diseño, pero el rendimiento en lenguas distintas del material de entrenamiento no está medido.
- **Riesgo de `trust_remote_code`**: la carga ejecuta código Python del repositorio. Este repositorio es un espejo de terceros (`ArchiveStudio`, 0 descargas, 0 likes), no el oficial, por lo que conviene auditar el código o usar `OpenMOSS-Team/XY_Tokenizer_TTSD_V0_hf`.
- **Formato de pesos no especificado**: no se confirma safetensors. Si el repositorio usa `pickle` (`.bin`), la carga implica riesgo de ejecución arbitraria; verificar antes de desplegar.
- **Licencia**: Apache-2.0 permite uso comercial, pero al ser un espejo conviene confirmar que la licencia del repositorio original es la misma y que no hay pesos derivados con condiciones adicionales.
- **Sin benchmarks**: no se puede justificar una decisión de producción solo con las afirmaciones cualitativas de la model card. Falta una evaluación propia de calidad percibida y de impacto aguas abajo (por ejemplo, WER de un ASR alimentado con audio reconstruido).
- **Metadatos del espejo**: creado y actualizado el 2026-10-24, sin pipeline declarado y sin idiomas declarados en la tarjeta de Hugging Face.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/ArchiveStudio/XY_Tokenizer_TTSD_V0_hf
- Repositorio oficial del códec (OpenMOSS): https://huggingface.co/OpenMOSS-Team/XY_Tokenizer_TTSD_V0_hf
- Paper: https://arxiv.org/abs/2506.23325
- Código fuente (GitHub, MOSS-TTSD / XY_Tokenizer): https://github.com/OpenMOSS/MOSS-TTSD/tree/main/XY_Tokenizer
- Réplica del código en Hugging Face: https://huggingface.co/spaces/fnlp/MOSS-TTSD/tree/main/XY_Tokenizer
- Modelo de audio-lenguaje MOSS-TTSD: https://huggingface.co/fnlp/MOSS-TTSD-v0.5
- Repositorio GitHub de MOSS-TTSD: https://github.com/OpenMOSS/MOSS-TTSD
- Blog (inglés): http://www.open-moss.com/en/moss-ttsd/
- Blog (chino): http://www.open-moss.com/cn/moss-ttsd/
- Demo en Spaces: https://huggingface.co/spaces/fnlp/MOSS-TTSD
- Variante en ModelScope: https://www.modelscope.cn/models/openmoss/XY_Tokenizer_TTSD_V0_32k/summary
- Espejo adicional en Hugging Face: https://huggingface.co/Jinstudio/XY_Tokenizer_TTSD_V0_hf
