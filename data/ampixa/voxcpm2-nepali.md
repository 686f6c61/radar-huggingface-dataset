# ampixa/voxcpm2-nepali

## Resumen

VoxCPM2 Nepali LoRA es un conjunto de dos adaptadores LoRA que ajustan el modelo base openbmb/VoxCPM2 (revisión `32279eff`) para clonación de voz zero-shot en nepalí. Lo desarrolla el usuario ampixa y se publica bajo licencia Apache 2.0. El modelo resuelve la falta de soporte específico para nepalí en el TTS base, un idioma con recursos limitados en comparación con las lenguas mayoritarias. Es relevante porque documenta de forma transparente un baseline de adaptación LoRA sobre un modelo TTS multilingüe, con resultados medidos frente a un sistema competidor (Swar) y con una metodología de evaluación explícita.

La arquitectura subyacente es la de VoxCPM2, un modelo de texto-a-voz con componentes de LM y DiT (Diffusion Transformer) a los que se aplican los adaptadores LoRA con rango 32. El adaptador principal se entrenó durante 3.500 pasos sobre 46,8 horas de IndicVoices-R nepalí; una variante se calentó desde ese adaptador y continuó 2.500 pasos sobre 151,9 horas de datos públicos adicionales. El repositorio ocupa 0,1 GB e incluye el script de inferencia, las configuraciones de entrenamiento y seis muestras de audio.

El autor declara explícitamente que el modelo no supera a Swar en ninguna de las tres suites de evaluación del benchmark head-to-head público (492 tareas), y lo publica como baseline documentado, no como estado del arte. La clonación requiere una referencia de 4 a 12 segundos de habla limpia junto con su transcripción exacta, y funciona en una GPU CUDA de unos 8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VoxCPM2 (modelo base) con adaptadores LoRA r=32 sobre atención del LM y del DiT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor menciona bf16 para inferencia en L40S) |
| Idiomas soportados | nepalí (ne) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptadores LoRA en el repositorio (formato exacto de fichero no especificado); script de inferencia en Python |
| Modelo base | openbmb/VoxCPM2 (revisión `32279eff`) |
| Tamaño del repositorio | 0,1 GB |
| Pipeline | text-to-speech |
| Pasos de entrenamiento | run 1: 3.500 pasos; run 2: 2.500 pasos adicionales |
| Datos de entrenamiento | run 1: 46,8 h de IndicVoices-R nepalí; run 2: 151,9 h (IndicVoices-R + datos públicos adicionales) |

## Arquitectura y entrenamiento

El modelo parte de openbmb/VoxCPM2, un sistema de texto-a-voz que combina un modelo de lenguaje y un Diffusion Transformer. Sobre esa base se aplican dos adaptadores LoRA de rango 32 en las capas de atención tanto del LM como del DiT, siguiendo la receta oficial de LoRA de VoxCPM con sus valores de configuración. El adaptador principal (`run1_ivr_step3500`) se entrenó 3.500 pasos sobre 46,8 horas de IndicVoices-R nepalí. La variante (`run2_d2_step2500`) se inicializó desde el adaptador principal y continuó 2.500 pasos sobre 151,9 horas que combinan IndicVoices-R con datos públicos nepalíes adicionales.

El autor excluyó deliberadamente del entrenamiento todas las frases de FLEURS (todas las particiones) y todas las frases de Rasa, para evitar contaminación con dos de las tres suites de evaluación. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación posteriores al ajuste supervisado. La innovación destacable no está en la arquitectura sino en la metodología de evaluación: el autor publica las configuraciones de inferencia congeladas de ambas ejecuciones del benchmark, reproduce los números publicados de Swar con su propio harness y advierte explícitamente sobre el sesgo de rerankear con el mismo ASR que puntúa (MMS).

## Capacidades

- Síntesis de voz (text-to-speech) en nepalí a partir de texto escrito en devanagari.
- Clonación de voz zero-shot: reproduce la voz de una referencia de 4 a 12 segundos de audio limpio, siempre que se proporcione también su transcripción exacta.
- Generación con decodificación por streaming: el primer audio se emite aproximadamente a los 0,12 s en una NVIDIA L40S.
- Rerank best-of-N opcional en el script de inferencia (`--n`), que selecciona la toma con menor tasa de error de carácter según un ASR interno (LONG1C) o, con `--n` usando MMS, según `facebook/mms-1b-all` (el autor advierte que esto es solo comodidad de usuario y no debe usarse al puntuar con MMS).
- Recorte VAD de la referencia y ajuste de cfg (3.0 en las ejecuciones del benchmark) como parámetros de inferencia configurables.
- Selección entre adaptador principal (`run1`), variante (`run2`) o modelo base sin adaptador (`none`) mediante el argumento `--adapter`.
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada distinto de la referencia de voz ni razonamiento multi-paso.

## Casos de uso

- Clonación de voz para locución en nepalí: dado un clip de 4 a 12 segundos de un locutor y su transcripción, el modelo genera nuevas frases con la voz de ese locutor, útil para doblaje o audiolibros en un idioma con poca cobertura TTS comercial.
- Generación de avisos y mensajes IVR en nepalí: el adaptador principal se entrenó sobre IndicVoices-R, un corpus de habla telefónica, lo que lo hace adecuado para prompts con ruido de canal telefónico; el benchmark muestra un CER de 33,58 en la suite con prompt estilo FLEURS ruidoso frente a 50,52 del modelo base.
- Prototipado de asistentes de voz en nepalí: el script `infer.py` permite comparar rápidamente el modelo base, el adaptador principal y la variante sobre las mismas frases, lo que facilita la selección de configuración antes de integrar en producción.
- Evaluación de sistemas TTS en nepalí: el repositorio incluye las configuraciones congeladas de las ejecuciones del benchmark y las muestras, lo que permite reproducir la comparación frente a Swar con el mismo scorer (MMS CER y ECAPA voice match).
- Investigación sobre adaptación LoRA de modelos TTS multilingües: el par de adaptadores con distinta cantidad y composición de datos (46,8 h frente a 151,9 h) sirve como caso de estudio del efecto del volumen de datos en la calidad de clonación para un idioma de bajos recursos.
- Generación de contenido accesible en nepalí: conversión de texto a voz para lectores de pantalla o materiales educativos, siempre que se disponga de una referencia de voz válida y se acepten las limitaciones de naturalidad documentadas.

## Benchmarks y rendimiento

Resultados sobre el benchmark head-to-head de Swar (492 tareas): 205 frases de NepTTS con prompt ruidoso estilo FLEURS, las mismas 205 con prompt de estudio Rasa, y 82 ítems de clonación limpia del Nepali Voice Cloning Benchmark (4 hablantes FLEURS de test). Scorer: MMS CER (menor es mejor) y ECAPA voice match (mayor es mejor). Los corchetes son intervalos bootstrap del 95 % sobre clústeres de frases.

| Sistema | CER prompt FLEURS | CER prompt Rasa | CER clonación limpia | Voice match |
|---|---:|---:|---:|---:|
| VoxCPM2 stock, clonación, toma única | 50,52 [39,83-63,46] | 15,98 [13,59-18,63] | 9,59 [7,97-11,30] | 0,685 [0,668-0,703] |
| VoxCPM2 stock, solo voice design (sin referencia) | 69,49 | 69,49 | 17,30 | n/a |
| + adaptador principal (run 1), ajustes nativos, toma única | 33,58 [29,49-37,70] | 12,10 [10,01-14,41] | 6,94 [5,61-8,35] | 0,675 [0,657-0,692] |
| + adaptador principal (run 1), cfg 3.0 + recorte de referencia, best-of-8 (bench run 1) | 20,87 [17,72-24,16] | 9,34 [7,63-11,21] | 6,49 [5,31-7,76] | 0,672 [0,657-0,688] |
| + variante (run 2), mismos ajustes, best-of-8 (bench run 2) | 19,13 [15,87-22,60] | 11,00 [8,70-13,53] | 6,57 [5,12-8,16] | 0,678 [0,665-0,691] |
| Swar NFE16, toma única (referencia a batir) | 17,24 [13,91-20,87] | 6,72 [5,35-8,24] | 5,06 [3,90-6,40] | 0,687 [0,670-0,704] |
| Swar best-of-4 (reranker propio) | 16,19 [13,14-19,40] | 6,96 [5,48-8,62] | 5,13 [4,01-6,40] | 0,69 [0,67-0,71] |
| Grabaciones reales (calibración, no suelo) | | | 9,77 [7,90-11,87] | 0,740 [0,72-0,76] |

Reproducción de los números publicados de Swar por el harness del autor:

| Swar | Publicado (card de Swar) | Medido aquí |
|---|---|---|
| Prompt de voz de estudio (NepTTS-Bench, 205 frases, una toma) | 6,19 % CER | 6,72 (suite prompt Rasa) |
| Prompt de voz «Maya» | 7,45 % | no ejecutado |
| Clonación limpia | 4,72 % con voice match 0,697 (bench v1.1, 64 pares prompt+frase) | 5,06 con 0,687 (82 ítems; los intervalos incluyen los valores publicados) |

Advertencia del autor: las filas best-of-8 generan 8 tomas por tarea y eligen la de menor CER del ASR interno contra el texto de entrada; medido en run 1, 16,7 s por tarea (11,0 s de generación + 5,6 s de ASR), RTF 4,8 frente a 0,41 en toma única. No es igualdad de cómputo frente a Swar. Además, dos de las tres suites (FLEURS y Rasa) probablemente favorecen a Swar porque su card lista FLEURS y Rasa entre sus datos de entrenamiento, mientras que el autor las excluyó de los suyos.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 8 GB en una GPU CUDA son suficientes según el autor.
- GPU recomendadas: NVIDIA L40S es la plataforma de referencia documentada (bf16, batch 1). No se detallan otras GPU en la información disponible.
- Cabe en GPU de consumo: el autor indica que basta una GPU CUDA de aproximadamente 8 GB, lo que incluye tarjetas de gama media-alta con al menos esa VRAM; no se especifican modelos concretos.
- Opciones de despliegue: script de inferencia propio (`infer.py`) del repositorio, que requiere instalar VoxCPM desde el commit `cce58a5b59303c9bd63d12f23afe6a49a4a80c59` de GitHub, más `huggingface_hub` y `soundfile`; el rerank con MMS requiere además `transformers` y `librosa`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en NVIDIA L40S (bf16, batch 1), RTF aproximado de 0,40 por toma única y primer audio en streaming a los 0,12 s. Con best-of-8, el coste medido en run 1 es de 16,7 s por tarea (RTF 4,8), incluyendo 5,6 s de ASR para la selección.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER clonación limpia (MMS) | Voice match | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VoxCPM2 Nepali LoRA (este modelo) | no disponible (LoRA r=32 sobre VoxCPM2) | no disponible | 6,49 (best-of-8, run 1); 6,94 (toma única) | 0,672-0,675 | Apache 2.0 | Hugging Face (ampixa/voxcpm2-nepali) |
| VoxCPM2 stock (base) | no disponible | no disponible | 9,59 | 0,685 | no disponible en la información | Hugging Face (openbmb/VoxCPM2) |
| Swar NFE16 | no disponible | no disponible | 5,06 | 0,687 | no disponible en la información | Hugging Face (Aarjan/swar) |

El autor señala que Swar supera a este modelo en las tres suites del benchmark, incluida la clonación limpia (5,06 frente a 6,49 de CER), aunque dos de las suites probablemente favorecen a Swar por solapamiento de datos de entrenamiento. No se dispone de datos de otros modelos TTS en nepalí en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no supera a Swar en ninguna suite del benchmark y lo publica como baseline documentado, no como estado del arte.
- El CER en la suite con prompt ruidoso estilo FLEURS sigue siendo alto (33,58 en toma única, 20,87 en best-of-8), lo que indica fragilidad ante referencias con ruido.
- La clonación exige una referencia de 4 a 12 segundos de habla limpia y su transcripción exacta; sin transcripción o con audio degradado la calidad cae.
- El rerank con MMS (`--n` usando `facebook/mms-1b-all`) infla artificialmente las métricas si luego se puntúa con un benchmark basado en MMS; el autor lo desaconseja para evaluación.
- Las filas best-of-8 no son comparables en cómputo con las tomas únicas de Swar: RTF 4,8 frente a 0,41.
- Los reintentos por casos malos propios de VoxCPM pueden añadir tomas adicionales no contabilizadas en la latencia base.
- Solo se documenta soporte para nepalí; no hay evidencia de calidad en otros idiomas.
- No se documentan sesgos específicos del modelo ni evaluación de alucinación o contenido dañino en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base openbmb/VoxCPM2 tiene su propia licencia que debe verificarse por separado antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/voxcpm2-nepali
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Repositorio VoxCPM (commit de instalación): https://github.com/OpenBMB/VoxCPM/tree/cce58a5b59303c9bd63d12f23afe6a49a4a80c59
- Swar (modelo comparado): https://huggingface.co/Aarjan/swar
- Repositorio Swar: https://github.com/Naamche-Labs/swar
- Dataset Nepali Voice Cloning Benchmark: https://huggingface.co/datasets/Aarjan/nepali-voice-cloning-bench
- ASR de puntuación MMS: https://huggingface.co/facebook/mms-1b-all
