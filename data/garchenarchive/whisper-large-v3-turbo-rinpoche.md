# GarchenArchive/whisper-large-v3-turbo-rinpoche

## Resumen

Whisper-large-v3-turbo-rinpoche es un ajuste fino del modelo de reconocimiento automático del habla `openai/whisper-large-v3-turbo` de OpenAI, especializado en la transcripción de discursos del maestro tibetano Garchen Rinpoche. Lo desarrolla GarchenArchive, un archivo dedicado a preservar y digitalizar material audiovisual budista tibetano, y resuelve un problema muy concreto: los modelos Whisper genéricos tienen un rendimiento pobre en tibetano hablado, un idioma de bajos recursos con escasa representación en los corpus de entrenamiento multilingües.

El modelo conserva la arquitectura original de Whisper turbo: un transformer encoder-decoder con 32 capas de encoder y 4 de decoder, 808,9 millones de parámetros totales y una ventana de entrada de audio de 30 segundos a 16 kHz. La innovación no está en la arquitectura sino en el ajuste fino con datos reales del dominio, incluyendo entrenamiento con pseudo-etiquetas filtradas por confianza.

Su relevancia actual reside en dos aspectos. Primero, es un caso ejemplar de adaptación de un modelo grande a un dominio y una lengua de bajos recursos con resultados medibles (CER del 19,34 % en el conjunto de test). Segundo, documenta con rigor una limitación estructural de Whisper para idiomas con tokenización densa: el techo de 448 posiciones del decoder provoca truncamientos silenciosos en audio de más de ~9,5 segundos, un fallo que el autor caracteriza y cuantifica de forma transparente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), 32 capas encoder / 4 capas decoder |
| Parametros totales | 808.878.080 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s; decoder limitado a 448 posiciones |
| Tipos de cuantizacion | fp16 (recomendado); fp32 no cabe en GPU de 12 GB durante beam search |
| Idiomas soportados | Tibetano (`bo`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp16, `model.safetensors`, 1,6 GB) |
| Vocabulario | BPE multilingüe de 51.866 tokens |
| Entrada | Audio mono a 16 kHz, rellenado a ventana de 30 s |
| Tarea | Automatic speech recognition (transcripción) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con atención estándar. La configuración de generación (`generation_config.json`) ya fija `language="bo"` y `task="transcribe"`, de modo que el usuario no necesita especificar el idioma en cada llamada. Los pesos se distribuyen en fp16 en un único archivo safetensors de 1,6 GB; el repositorio completo ocupa 11,3 GB por los distintos artefactos y revisiones.

El entrenamiento continuó la revisión anterior (`2cbf9032`) con un nuevo adaptador LoRA que posteriormente se fusionó en los pesos. Los datos proceden de `GarchenArchive/stt-rinpoche-202609` (split de train): 14.426 enunciados transcritos por humanos, equivalentes a 21,9 horas, más 2.528 clips pseudo-etiquetados (3,8 horas, todos de 7 segundos o menos). Las pseudo-etiquetas se generaron fusionando las salidas de este modelo y de `GarchenArchive/wav2vec2-xls-r-300m-rinpoche` mediante un LLM (`gemini-3-flash-preview`), y solo se conservaron aquellos clips con un CER estimado sin referencia de 0,10 o inferior. Ese filtro de confianza resultó determinante: las pseudo-etiquetas sin filtrar empeoraban el modelo, mientras que con filtro el resultado superaba al de un entrenamiento solo con datos humanos (CER agrupado −0,0027, IC 95 % −0,0054 a −0,0000, en dos semillas).

Un detalle técnico relevante es que el ajuste fino adicional sobre corpus tibetanos generales (dialecto Kham, NICTTIB1) degrada sustancialmente el rendimiento, según experimentos internos previos del autor. El modelo está especializado en un único hablante y un registro concreto.

## Capacidades

- Transcripción de voz a texto en tibetano (`bo`) para audio mono a 16 kHz.
- Procesamiento de segmentos de audio de hasta ~9,5 segundos sin pérdida de contenido (ver limitaciones).
- Generación greedy fiable en fp16; beam search funciona pero devuelve una lista n-best degenerada.
- Integración con el pipeline de `transformers` mediante `WhisperForConditionalGeneration` y `WhisperProcessor`.
- Configuración de idioma y tarea preestablecida, sin necesidad de forzar `language` ni `task` en la llamada.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No soporta tool calling, agentes, visión ni audio más allá de la transcripción.
- Capacidad multilingüe: no disponible; el modelo está especializado exclusivamente en tibetano.

## Casos de uso

- Archivado y digitalización de enseñanzas budistas: el modelo transcribe grabaciones de Garchen Rinpoche para generar subtítulos y transcripciones buscables, un caso directamente alineado con el corpus de entrenamiento y el registro del hablante.
- Generación de subtítulos para vídeos de dharma: segmentando el audio en clips de menos de 9 segundos, se obtienen subtítulos sincronizados con un CER en torno al 19 %, suficiente para revisión humana posterior.
- Búsqueda semántica sobre archivos de audio: transcribir horas de grabaciones y indexar el texto resultante permite recuperar fragmentos por palabras clave o temas.
- Pipeline de transcripción en dos etapas con fusión de modelos: combinar la salida de este modelo con la de `wav2vec2-xls-r-300m-rinpoche` y reconciliar ambas mediante un LLM reduce el CER al 16,22 % y el SER al 21,40 %, aprovechando que los dos modelos fallan de forma distinta.
- Investigación en ASR de bajos recursos: sirve como referencia reproducible de ajuste fino con pseudo-etiquetado filtrado por confianza sobre un modelo Whisper grande.
- Transcripción asistida para traductores: generar un borrador automático en tibetano que el traductor humano corrige, reduciendo el trabajo manual en comparación con la transcripción desde cero.
- Evaluación comparativa de modelos ASR en tibetano: el conjunto de test `stt-rinpoche-202609` (1.394 enunciados) permite medir CER, WER y SER con las métricas `jiwer` y `tibetan_wer` 2.0.

## Benchmarks y rendimiento

Evaluación sobre el split de test de `GarchenArchive/stt-rinpoche-202609` (1.394 enunciados), con audio troceado en fragmentos de ≤ 9 s en puntos de silencio, decodificación greedy en fp16 y unión de fragmentos con espacio. CER calculado con `jiwer`; WER y SER (syllable error rate) con `tibetan_wer` 2.0, medias micro.

| Modelo / revision | CER | WER | SER | CER subset 202605 | CER round-2 |
|---|---|---|---|---|---|
| Release anterior (`2cbf9032`) | 0,1950 | 0,3332 | 0,2626 | 0,1983 | 0,1905 |
| **Release actual** | **0,1934** | **0,3269** | **0,2558** | 0,2008 | 0,1837 |

Bootstrap emparejado (release actual menos anterior): SER −0,0068 (IC 95 % −0,0127 a −0,0011), CER −0,0015 (−0,0061 a +0,0030). La mejora en SER es significativa; la de CER está dentro del ruido. La ganancia procede de los clips más cortos de la ronda 2; el subset 202605 empeora ligeramente pero sin significación estadística.

Resultados de la fusión con el modelo CTC `GarchenArchive/wav2vec2-xls-r-300m-rinpoche`, reconciliada mediante LLM con segmentos vecinos como contexto:

| Par fusionado | CER | WER | SER |
|---|---|---|---|
| Releases anteriores de ambos modelos | 0,1626 | 0,2810 | 0,2148 |
| **Releases actuales de ambos modelos** | **0,1622** | **0,2796** | **0,2140** |

La fusión mejora claramente a cada modelo por separado. La variación entre ejecuciones repetidas del paso LLM es de aproximadamente 0,001 CER.

Recuento de errores por subconjunto, que evidencia el efecto de la longitud del clip:

| Decodificación greedy | Clip medio | Deleciones | Inserciones |
|---|---|---|---|
| Filas 202605 | 7,0 s | 1.983 | 826 |
| Filas ronda 2 | 4,0 s | 795 | 568 |

## Requisitos de hardware

- VRAM estimada: los pesos en fp16 ocupan aproximadamente 1,6 GB; con caché KV y activaciones, la inferencia cabe holgadamente en 4-6 GB. El autor advierte que el modelo maestro en fp32 provoca OOM en una tarjeta de 12 GB durante beam search, en la reordenación de la caché KV; por tanto, ejecutar en fp16 es obligatorio en GPUs de 12 GB o menos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM en fp16. Una RTX 3060, RTX 4060, RTX 4070 o superior es suficiente. Para procesamiento por lotes de alto volumen, A100 o H100 aportan mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más en fp16.
- Opciones de despliegue: `transformers` (ruta oficial y documentada), endpoints compatibles de Hugging Face, y servidores de inferencia que acepten modelos Whisper en safetensors. No se documentan recetas para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor solo indica que la decodificación debe ser greedy en fp16 y que el audio se trocea en fragmentos de ≤ 9 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Idiomas | Licencia | CER en tibetano |
|---|---|---|---|---|---|
| whisper-large-v3-turbo-rinpoche | 808,9 M | 30 s audio, decoder 448 pos. | Tibetano | no disponible | 0,1934 |
| openai/whisper-large-v3-turbo (base) | 809 M | 30 s audio, decoder 448 pos. | Multilingüe (99 idiomas) | MIT (modelo base) | no disponible en esta ficha |
| GarchenArchive/wav2vec2-xls-r-300m-rinpoche | ~300 M | Ventana CTC, sin decoder autorregresivo | Tibetano | no disponible | no disponible por separado; 0,1622 en fusión con este modelo |

El modelo base de OpenAI es la alternativa natural, pero su rendimiento en tibetano no se documenta en la información disponible y el autor indica que el ajuste fino sobre corpus generales degrada el resultado. El modelo CTC de 300 M es complementario más que sustituto: su fusión con este Whisper supera a cualquiera de los dos por separado.

## Limitaciones y advertencias

- **Techo de longitud de salida:** el decoder de Whisper está limitado a 448 posiciones y el tibetano tokeniza a unas 43-47 tokens por segundo de habla con este vocabulario, de modo que el audio de más de ~9,5 s no cabe. El fallo es silencioso: el modelo emite un EOS bien formado y se detiene antes de tiempo. No se puede detectar buscando un EOS ausente porque en Whisper los tokens pad y EOS son idénticos; hay que comparar la longitud de la salida con la duración del clip.
- **Sesgo de deleción dependiente de la longitud:** con clips de 7,0 s se registran 1.983 deleciones frente a 826 inserciones; con clips de 4,0 s, 795 frente a 568. El desequilibrio es propiedad de la longitud del clip, no del modelo; segmentar corto lo reduce.
- **Beam search degenerado:** con `num_beams=5, num_return_sequences=5` las hipótesis devueltas son idénticas con `sequences_scores` idénticos. El rank 0 difiere de greedy, pero la lista n-best no sirve para reordenar.
- **Dominio restringido:** ajustado a un único hablante y un registro concreto. El ajuste fino adicional sobre corpus tibetanos generales (Kham, NICTTIB1) degrada sustancialmente el rendimiento.
- **Riesgo de alucinación:** no documentado explícitamente por el autor, pero inherente a los modelos Whisper en pasajes de audio ambiguo o ruidoso; conviene revisión humana en producción.
- **Licencia no disponible:** no se especifica licencia, lo que impide asumir permisos de uso comercial. Es necesario contactar con el autor antes de un despliegue productivo.
- **Métricas no comparables entre versiones:** `tibetan_wer` 2.0 cambió la segmentación silábica, por lo que SER y WER no son comparables con versiones anteriores de la model card; el CER sí lo es.
- **Decodificación:** debe usarse `clean_up_tokenization_spaces=False`; la limpieza por defecto está pensada para WordPiece y destruye la salida BPE.
- **Idioma único:** no soporta otros idiomas ni cambio de tarea; la configuración fija `language="bo"` y `task="transcribe"`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GarchenArchive/whisper-large-v3-turbo-rinpoche
- Revisión anterior fijada (`v202609`): https://huggingface.co/GarchenArchive/whisper-large-v3-turbo-rinpoche/tree/2cbf9032d6eff8259e2302615a0ebf5d80394dc0
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo CTC complementario: https://huggingface.co/GarchenArchive/wav2vec2-xls-r-300m-rinpoche
- Conjunto de datos de evaluación: https://huggingface.co/datasets/GarchenArchive/stt-rinpoche-202609
- Librería de métricas tibetanas: https://pypi.org/project/tibetan-wer/
- Repositorio del autor: https://huggingface.co/GarchenArchive
