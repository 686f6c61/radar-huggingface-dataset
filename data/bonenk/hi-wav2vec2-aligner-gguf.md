# Bonenk/hi-wav2vec2-aligner-GGUF

## Resumen

Bonenk/hi-wav2vec2-aligner-GGUF es una conversion comunitaria a formato GGUF del modelo theainerd/Wav2Vec2-large-xlsr-hindi, un wav2vec2-large XLSR-53 afinado para hindi con 315,5 millones de parametros. No es un modelo de reconocimiento de voz autonomo, sino un alineador CTC especializado en generar marcas de tiempo a nivel de palabra sobre transcripciones en devanagari. Su funcion es sustituir el alineador generico `canary-ctc-aligner` (orientado al ingles) que incorpora por defecto el ecosistema CrispASR, cuyos limites de palabra derivan cuando se aplican a transcripciones en hindi.

El modelo se distribuye como un unico fichero `hi-wav2vec2-q8_0.gguf` de 356 MiB, con el tokenizer de 64 tokens embebido y cuantizacion Q8_0 sobre los pesos convolucionales y de atencion, manteniendo la cabeza CTC y las normalizaciones en F32. Esta pensado para emparejarse con los checkpoints hindi de Bonenk/indic-transcribe-flex-GGUF dentro del runtime CrispASR (MIT), de modo que el pipeline de transcripcion produzca subtitulos SRT con sincronizacion precisa por palabra.

La relevancia actual es acotada pero concreta: cubre un hueco en la cadena de herramientas de ASR para lenguas indicas, donde los alineadores forzados disponibles estan calibrados para alfabeto latino y fonetica inglesa. Es un componente auxiliar, no un backend de transcripcion, y el propio autor advierte que no se ha medido WER porque el checkpoint no esta destinado a esa tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (GGUF v3, 422 tensores) |
| Parametros totales | 315.503.168 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio dependiente de la longitud de entrada; stride de ~20 ms por frame) |
| Tipos de cuantizacion | Q8_0 (pesos) + F32 (cabeza CTC y normalizaciones) |
| Idiomas soportados | hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `hi-wav2vec2-q8_0.gguf`, 356 MiB) |

## Arquitectura y entrenamiento

La arquitectura es wav2vec2 clasica: un extractor de caracteristicas convolucional de 7 capas con 512 canales, seguido de un encoder transformer de 24 capas con tamano oculto 1024 y 16 cabezas de atencion. El stride total (5 convoluciones mas 5 etapas de 2^4) produce aproximadamente un frame cada 20 ms de audio. La cabeza de salida es una capa lineal CTC sobre un vocabulario de 64 tokens en devanagari.

El checkpoint original fue producido por theainerd afinando facebook/wav2vec2-large-xlsr-53 (preentrenado multilingue sobre 53 idiomas, incluido el hindi) con datos de habla en hindi. Bonenk realizo la conversion a GGUF con el script `models/convert-wav2vec2-to-gguf.py` del repositorio CrispASR a partir de un checkout en precision completa, y posteriormente aplico `crispasr-quantize q8_0`. El autor verifica que el tokenizer cuantizado reproduce exactamente el `vocab.json` de 64 tokens del modelo fuente, token a token. No se documentan en la informacion disponible detalles sobre el volumen de datos de entrenamiento, composicion del dataset ni si hubo etapas de RLHF o DPO (poco probables en un modelo CTC de alineamiento).

## Capacidades

- Generacion de marcas de tiempo a nivel de palabra (word timestamps) sobre transcripciones en hindi mediante decodificacion CTC forzada.
- Alineamiento forzado entre audio y texto en escritura devanagari; requiere que el guion de la transcripcion coincida con su vocabulario de 64 tokens.
- Integracion como alineador externo en CrispASR mediante el flag `-am`, compatible con backends de tipo LLM (`--backend qwen3`, `--backend cohere`, entre otros) donde `-am` es la unica via para obtener timestamps por palabra.
- Ejecucion independiente del backend de transcripcion, lo que permite asignar GPU y CPU por separado (por ejemplo, `--gpu-backend cuda` para el modelo ASR y `--no-gpu` para el alineador).
- Salida orientada a la generacion de subtitulos SRT (`--output-srt`).
- No soporta tool calling, function calling, razonamiento multi-paso, vision ni audio generativo; es un modelo acustico CTC de proposito unico.
- Capacidad multilingue limitada al hindi.

## Casos de uso

- Generacion de subtitulos SRT sincronizados para contenido en hindi: el alineador recibe la transcripcion del modelo ASR y el audio original y produce limites de palabra ajustados al habla real, lo que mejora la legibilidad de subtitulos frente al alineador generico en ingles.
- Post-procesado de pipelines de transcripcion existentes: si ya se dispone de transcripciones en hindi generadas con indic-transcribe-flex-GGUF, este checkpoint se inserta como etapa de alineamiento sin cambiar el backend de reconocimiento.
- Etiquetado de corpus de habla para entrenamiento: los timestamps por palabra permiten segmentar audios largos en clips cortos alineados con su transcripcion, utiles para construir datasets de ASR o TTS en hindi.
- Sincronizacion de subtitulos en herramientas de edicion de video: el formato SRT con marcas por palabra facilita el corte y el ajuste fino en flujos de postproduccion.
- Busqueda y recuperacion sobre archivos de audio: con marcas temporales por palabra se puede indexar y localizar el instante exacto en que se pronuncia un termino en una grabacion larga.
- Evaluacion comparativa de alineadores: el flag `--force-aligner` permite contrastar los timestamps nativos del backend Canary con los del alineador CTC sobre el mismo audio hindi.
- Uso en entornos con recursos limitados: al ocupar 356 MiB y ejecutarse en CPU (`--no-gpu`), puede desplegarse en maquinas sin GPU mientras el modelo ASR principal corre en acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se genero ninguna medicion de WER porque el checkpoint esta destinado solo al alineamiento, no como backend de ASR. La validacion descrita es informal: los timestamps por palabra en audio hindi resultan visiblemente mas ajustados que los del `canary-ctc-aligner` por defecto, especialmente en palabras transcritas como compuestos devanagari cortos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en Q8_0 (fichero de 356 MiB mas overhead de runtime); el autor documenta ejecucion en CPU con `--no-gpu`.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; no requiere A100 ni H100. Una RTX 4090 o similar queda sobredimensionada para este componente.
- Cabe en cualquier GPU de consumo, incluidas integradas y GPUs de gama baja, y tambien en CPU.
- Opciones de despliegue: runtime CrispASR (rama `indic-transcribe-flex`), que es el unico runtime documentado para este GGUF. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 315M parametros y 356 MiB, la latencia esperada es baja, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonenk/hi-wav2vec2-aligner-GGUF | 315,5 M | no disponible (stride ~20 ms) | Alineador CTC de palabras en hindi | Apache-2.0 | GGUF en Hugging Face |
| canary-ctc-aligner (integrado en CrispASR) | no disponible | no disponible | Alineador CTC generico, orientado a ingles | no disponible | Incluido en CrispASR |
| theainerd/Wav2Vec2-large-xlsr-hindi | 315 M | no disponible | ASR/alineamiento en hindi (modelo fuente, precision completa) | Apache-2.0 | Safetensors en Hugging Face |
| facebook/wav2vec2-large-xlsr-53 | ~317 M | no disponible | Preentrenamiento multilingue (53 idiomas) | Apache-2.0 | Safetensors en Hugging Face |

La comparativa se limita a los modelos citados en la informacion proporcionada; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- No es un modelo de reconocimiento de voz: no debe usarse como backend ASR ni evaluarse por WER. Su unica funcion es el alineamiento forzado.
- Requiere que la transcripcion de entrada este en escritura devanagari y coincida con el vocabulario de 64 tokens; transcripciones transliteradas o en otro sistema de escritura no funcionaran.
- Solo soporta hindi; no cubre otras lenguas indicas ni el ingles.
- Es una conversion comunitaria, no una release oficial del autor del modelo base.
- El alineador debe pasarse explicitamente con `-am` y, en el backend Canary, acompanarse de `--force-aligner` para que sus timestamps prevalezcan sobre los nativos del backend.
- El flag `-l hi` sigue siendo obligatorio en el backend Canary aunque el alineador se encargue de los timestamps.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero un alineamiento defectuoso puede producir limites de palabra erroneos si el audio y la transcripcion no coinciden.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de XLSR-53 y de un fine-tuning en hindi, puede heredar sesgos acusticos del corpus de entrenamiento original.
- Licencia Apache-2.0, que permite uso comercial con atribucion; el autor indica que los pesos convertidos se distribuyen bajo los mismos terminos que el modelo base.
- No se han publicado mediciones cuantitativas de calidad del alineamiento; la validacion es informal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bonenk/hi-wav2vec2-aligner-GGUF
- Modelo fuente: https://huggingface.co/theainerd/Wav2Vec2-large-xlsr-hindi
- Modelo base: https://huggingface.co/facebook/wav2vec2-large-xlsr-53
- Modelos ASR complementarios: https://huggingface.co/Bonenk/indic-transcribe-flex-GGUF
- Runtime CrispASR: https://github.com/Bonenk/CrispASR
- Script de conversion: https://github.com/Bonenk/CrispASR/blob/indic-transcribe-flex/models/convert-wav2vec2-to-gguf.py
