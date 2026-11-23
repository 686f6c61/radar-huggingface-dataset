# groxaxo/MOSS-Audio-Tokenizer-v2-EXL3-5bpw

## Resumen

MOSS-Audio-Tokenizer-v2-EXL3-5bpw es una versión cuantizada del tokenizador de audio neuronal MOSS-Audio-Tokenizer-v2 desarrollado por OpenMOSS-Team, publicada por el usuario groxaxo. El modelo original es un códec neuronal (encoder/decoder) que convierte audio en representaciones discretas mediante RVQ (residual vector quantization) y las reconstruye de vuelta a forma de onda, actuando como pieza fundamental en pipelines de texto-a-voz como MOSS-TTS. Esta conversión aplica cuantización EXL3 de ExLlamaV3 con precisión mixta sobre las capas lineales de los transformers del encoder y del decoder.

El checkpoint contiene 677.485.568 parámetros y ocupa 1,4 GB en el repositorio, con un payload de tensores de 1,292 GiB. Se serializan 736 matrices cuantizadas con trellis K=5, alcanzando 5,225 bits efectivos por parámetro original. El resto de componentes (proyecciones RVQ/RLFQ, codebooks, normas, escalas de capa y proyecciones de entrada/salida de etapa) se mantienen en FP32 para preservar la calidad de reconstrucción.

La relevancia de esta ficha radica en que el modelo demuestra una reducción del 70,8 % en memoria GPU pico (de 16,20 GiB a 4,73 GiB) manteniendo una tasa de error de palabra del 0 % en la verificación de inteligibilidad con Faster Whisper large-v3, a costa de un incremento del 28 % en el factor de tiempo real del pipeline completo. Está pensado para entornos con VRAM limitada, como una RTX 3090, donde el pipeline BF16 original no cabría junto con el modelo TTS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder/decoder con cuantización residual vectorial (RVQ/RLFQ) para audio |
| Parámetros totales | 677.485.568 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | EXL3 trellis K=5 (5,225 bits efectivos por parámetro); FP32 para componentes protegidos |
| Idiomas soportados | en, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con kernels empaquetados EXL3 y loader personalizado |

## Arquitectura y entrenamiento

El modelo base MOSS-Audio-Tokenizer-v2 es un códec neuronal de audio que combina un encoder transformer y un decoder transformer con cuantización vectorial residual (RVQ) y una variante RLFQ. El encoder transforma la forma de onda en una secuencia de tokens discretos a través de múltiples codebooks residuales; el decoder reconstruye la señal a partir de esos tokens. Esta conversión concreta mantiene el grafo PyTorch original de MOSS y sustituye las capas lineales de los transformers del encoder y del decoder por kernels EXL3 empaquetados, mientras conserva en FP32 las proyecciones de codebook, las proyecciones de entrada/salida de etapa, las normas y las escalas de capa.

El proceso de cuantización emplea LDLQ calibrado con activaciones, regularización sigma de 0,025, escalado multiplicativo y guardas de rango por fila en potencias de dos. Las salidas de los kernels empaquetados se validan contra las matrices cuantizadas reconstruidas. ExLlamaV3 puede reconstruir temporalmente matrices en FP16 para lotes grandes, sin caché densa permanente. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni si hubo fases de RLHF o DPO; estos datos no están disponibles en la información proporcionada.

## Capacidades

- Extracción de características de audio: convierte formas de onda en representaciones discretas mediante RVQ con hasta 12 codebooks en el pipeline TTS de referencia.
- Reconstrucción de audio: decodifica tokens discretos a forma de onda estéreo a 48 kHz.
- Decodificación en streaming: soporta decodificación por chunks de 0,32 segundos con RTF de 0,19770 en la versión cuantizada.
- Integración en pipelines de texto-a-voz: se usa junto con MOSS-TTS-Local-Transformer-v1.5-EXL3-5bpw para síntesis de voz completa.
- Soporte multilingüe limitado a inglés y español según los metadatos del modelo.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un componente de extracción de características, no un modelo generativo de texto.
- No dispone de modo thinking, visión ni audio de entrada directa más allá de la codificación de formas de onda.

## Casos de uso

- Síntesis de voz en GPUs de consumo: el pipeline completo EXL3 (TTS + codec) cabe en 4,73 GiB de VRAM pico, lo que permite ejecutar TTS de calidad en una RTX 3090 o RTX 4090 junto con otros procesos, algo inviable con el pipeline BF16 original que requiere 16,20 GiB.
- Decodificación de audio en streaming de baja latencia: con un RTF de 0,19770 en chunks de 0,32 segundos, el codec cuantizado puede alimentar aplicaciones de voz conversacional donde se necesita emitir audio antes de completar la utterance.
- Servidores de TTS multi-instancia: al reducir el payload a 1,292 GiB y la VRAM a menos de 5 GiB por pipeline, se pueden desplegar varias instancias en una sola GPU A100 o H100 para atender múltiples peticiones concurrentes.
- Preprocesamiento de datasets de voz: el encoder puede convertir grandes corpus de audio en inglés y español a tokens discretos para entrenamiento de modelos de lenguaje de audio, con un RTF de decodificación de 0,01992 en modo offline.
- Prototipado de investigación en códecs neuronales: al mantener las proyecciones RVQ y los codebooks en FP32, los investigadores pueden estudiar el efecto de la cuantización de las capas transformer sin alterar la estructura de cuantización residual.
- Evaluación comparativa de cuantización: los JSON de benchmark adjuntos y los WAV emparejados (original vs EXL3 en inglés y español) permiten reproducir la comparación de calidad e inteligibilidad en un entorno controlado con una sola RTX 3090.

## Benchmarks y rendimiento

Los datos de rendimiento publicados corresponden a mediciones end-to-end del pipeline TTS completo (MOSS-TTS + codec) y a mediciones aisladas del codec. No se han publicado resultados de benchmarks estándar de audio (como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo) en la información disponible.

| Perfil | RTF agrupado | RTF mediano | VRAM pico asignada (GiB) |
|---|---:|---:|---:|
| bf16_fp32 | 0,4009 | 0,3989 | 16,20 |
| exl3_fp32 | 0,5171 | 0,5169 | 11,35 |
| exl3_exl3 | 0,5151 | 0,5124 | 4,73 |

| Perfil | Errores de palabra / palabras de referencia | WER agrupado |
|---|---:|---:|
| bf16_fp32 | 0/154 | 0,00 % |
| exl3_fp32 | 0/154 | 0,00 % |
| exl3_exl3 | 0/154 | 0,00 % |

| Métrica del codec | FP32 original | EXL3 cuantizado |
|---|---:|---:|
| RTF de decodificación offline agrupado | 0,03166 | 0,01992 |
| RTF de decoder en streaming (chunks de 0,32 s) | 0,13667 | 0,19770 |

El pipeline EXL3 completo usó un 70,8 % menos de memoria GPU pico y su RTF fue 1,28 veces el del pipeline original, manteniéndose 1,94 veces más rápido que el tiempo real. Las mediciones se realizaron en una NVIDIA RTX 3090 con host i7-12700KF, con cuatro prompts retenidos en inglés y español y dos semillas, excluyendo carga inicial y una utterance de calentamiento.

## Requisitos de hardware

- VRAM estimada para el pipeline completo EXL3 (TTS + codec): 4,73 GiB pico asignada.
- VRAM estimada para el pipeline con codec EXL3 y TTS en FP32: 11,35 GiB pico.
- VRAM estimada para el pipeline BF16 original: 16,20 GiB pico.
- GPU recomendadas: RTX 3090 (entorno de medición oficial), RTX 4090, A100, H100. Cabe en GPUs de consumo con al menos 6 GiB de VRAM libre para el pipeline completo EXL3.
- Despliegue: requiere el runtime ExLlamaV3 fijado a la revisión `02aef45cd681b960a00afcd0749a4ab99e6c1bfe`, Transformers, accelerate, safetensors, soundfile, torchaudio y NumPy. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje causal estándar.
- El loader personalizado bloquea deliberadamente `AutoModel.from_pretrained` para evitar cargar los pesos empaquetados como si fueran no cuantizados.
- Latencia: RTF de 0,5151 en el pipeline completo EXL3 (1,94 veces más rápido que tiempo real); RTF de decodificación de codec de 0,01992 en offline y 0,19770 en streaming por chunks de 0,32 s.
- Se requiere un toolkit y compilador CUDA compatibles para construir la extensión de ExLlamaV3 desde el código fuente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Audio-Tokenizer-v2-EXL3-5bpw | 677.485.568 | No disponible | safetensors EXL3 | Apache 2.0 | Hugging Face (groxaxo) |
| OpenMOSS-Team/MOSS-Audio-Tokenizer-v2 (original) | No disponible en la información | No disponible | No disponible | Apache 2.0 | Hugging Face (OpenMOSS-Team) |
| MOSS-TTS-Local-Transformer-v1.5-EXL3-5bpw | No disponible en la información | No disponible | safetensors EXL3 | No disponible | Hugging Face (groxaxo) |

El modelo original en FP32 sirve como referencia de calidad y VRAM (16,20 GiB pico en el pipeline completo frente a 4,73 GiB del EXL3). El modelo TTS complementario es necesario para la síntesis completa. No se dispone de información sobre otros códecs neuronales comparables en la documentación proporcionada.

## Limitaciones y advertencias

- La cuantización EXL3 incrementa el RTF del pipeline completo un 28 % respecto al BF16 original (0,5151 frente a 0,4009); el beneficio demostrado es de memoria, no de velocidad.
- El modelo solo declara soporte para inglés y español; no hay evidencia de calidad en otros idiomas.
- La calidad del códec en profundidades RVQ distintas de 12 codebooks no ha sido establecida por el benchmark; los resultados solo cubren el pipeline TTS con 12 codebooks fijos.
- La verificación de inteligibilidad se basa en Faster Whisper large-v3 sobre un conjunto pequeño de ocho utterances en inglés y español; no es una medida de naturalidad de voz ni de similitud de hablante.
- Los prompts y semillas pueden producir duraciones de habla distintas tras la cuantización, por lo que las comparaciones de RTF usan la duración real de salida de cada utterance.
- Requiere un loader personalizado y una revisión fijada de ExLlamaV3; no funciona con cargadores estándar de Transformers ni con runtimes de inferencia convencionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, lo que limita la validación comunitaria independiente.
- No se dispone de información sobre sesgos del modelo base ni sobre riesgos de alucinación, ya que es un códec y no un modelo generativo de texto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el runtime ExLlamaV3 deben verificarse por separado para cumplir sus respectivas condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/groxaxo/MOSS-Audio-Tokenizer-v2-EXL3-5bpw
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-v2
- Modelo TTS complementario: https://huggingface.co/groxaxo/MOSS-TTS-Local-Transformer-v1.5-EXL3-5bpw
- Repositorio ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Ejemplo de audio en español original: https://huggingface.co/groxaxo/MOSS-Audio-Tokenizer-v2-EXL3-5bpw/blob/main/samples/spanish-original.wav
- Ejemplo de audio en español EXL3: https://huggingface.co/groxaxo/MOSS-Audio-Tokenizer-v2-EXL3-5bpw/blob/main/samples/spanish-exl3.wav
- Ejemplo de audio en inglés original: https://huggingface.co/groxaxo/MOSS-Audio-Tokenizer-v2-EXL3-5bpw/blob/main/samples/english-original.wav
- Ejemplo de audio en inglés EXL3: https://huggingface.co/groxaxo/MOSS-Audio-Tokenizer-v2-EXL3-5bpw/blob/main/samples/english-exl3.wav
