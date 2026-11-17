# PL-HFT/qwen3-asr-0.6b-ko-dysarthria

## Resumen
El modelo `PL-HFT/qwen3-asr-0.6b-ko-dysarthria` es un checkpoint fusionado (merge) de un ajuste fino LoRA sobre `Qwen/Qwen3-ASR-0.6B-hf`, desarrollado por el autor PL-HFT para reconocimiento automático de voz (ASR) en coreano, con especial énfasis en habla disártrica. El problema que aborda es el deterioro cruzado de dominio que sufre el modelo base cuando se especializa solo en habla patológica: el ajuste exclusivo en disartria degrada la tasa de error sobre habla típica. La solución propuesta es un entrenamiento conjunto de una época sobre un corpus combinado, que reduce el error en ambos dominios de forma simultánea.

Arquitectura multimodal compuesta por el LLM Qwen3-0.6B y el codificador de audio AuT, con 782.426.112 parámetros reales en safetensors y un repositorio de 1,6 GB. Se distribuye como pesos `bfloat16` ya fusionados, de modo que no requiere `peft` en tiempo de inferencia y acelera el arranque y el streaming frente a la versión LoRA. La licencia es Apache 2.0.

Es relevante ahora porque el habla disártrica es un caso históricamente mal cubierto por los ASR comerciales, y este modelo demuestra con cifras que un ajuste conjunto bien diseñado mejora tanto el habla patológica como la típica, sin sacrificar la segunda. Su tamaño reducido permite despliegues en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR: LLM Qwen3-0.6B + codificador de audio AuT |
| Parametros totales | 782.426.112 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio por segmento de hasta 29,5 s; `max_new_tokens=128` en el ejemplo de inferencia) |
| Tipos de cuantizacion | pesos publicados en bfloat16; no se documentan otras cuantizaciones |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, bfloat16, 611 tensores, 1.564.928.088 bytes) |

## Arquitectura y entrenamiento
El modelo es un ASR de tipo condicional generativo: combina un codificador de audio AuT con el LLM Qwen3-0.6B y se carga mediante `Qwen3ASRForConditionalGeneration`, requiriendo `transformers >= 5.13.0`. La entrada de audio está contractualmente fijada a 16 kHz mono y segmentos de duración menor o igual a 29,5 s. El formato de entrenamiento es SFT con plantilla de chat, donde la salida del asistente sigue el patrón `language Korean<asr_text>{transcript}`, de modo que la transcripción debe extraerse tras el token `<asr_text>`.

El checkpoint se obtiene fusionando el adaptador `PL-HFT/qwen3-asr-0.6b-ko-dysarthria-lora` (r=64, lora_alpha=128, 250 módulos) sobre el modelo base en float32 y guardando el resultado en bfloat16. El corpus de entrenamiento combina dos conjuntos coreanos verificados en calidad y preprocesados con `Speech-dataset-pipeline`: disartria (AI-Hub 013, 161.911 segmentos, 283,86 horas, 40,66 % de los segmentos y 44,20 % de la duración) y habla típica (AI-Hub 109). El audio se procesó con VAD de Silero y alineamiento forzado CTC coreano. La innovación destacable es metodológica: una única época de LoRA sobre el corpus combinado evita el intercambio entre dominios que provoca el ajuste exclusivo en disartria.

## Capacidades
- Reconocimiento automático de voz en coreano, tanto habla típica como habla disártrica.
- Transcripción de segmentos de audio de hasta 29,5 s a 16 kHz mono.
- Generación de transcripción con prefijo de idioma explícito (`language Korean<asr_text>...`).
- Inferencia sin `peft`: el merge elimina los hooks del wrapper PEFT y reduce la latencia de arranque y de streaming.
- Ejecución en CUDA, MPS y CPU (bfloat16 en CUDA/MPS, float32 en CPU).
- No se documentan tool calling, capacidades de agente, visión, audio de entrada más allá de la transcripción, ni modo de razonamiento extendido.

## Casos de uso
- Subtitulado y transcripción de habla disártrica: el modelo está entrenado específicamente sobre AI-Hub 013 y alcanza 0,79 % CER en ese dominio, lo que lo hace adecuado para herramientas de accesibilidad para personas con trastornos del habla.
- Atención al cliente en coreano con habla típica: con 1,97 % CER en el conjunto típico de AI-Hub 109, sirve para transcribir llamadas y conversaciones multi-turno segmentadas en fragmentos de hasta 29,5 s.
- Dictado y documentación clínica: la baja tasa de error en habla patológica permite transcribir consultas de logopedia o neurología donde el paciente presenta disartria.
- Pipeline de streaming ASR: al ser un checkpoint fusionado sin PEFT, el arranque es rápido y el modelo puede encadenarse en servicios de transcripción en tiempo real con segmentación previa del audio.
- Evaluación y research en ASR coreano: sirve como referencia reproducible para estudiar el efecto del entrenamiento conjunto disartria + habla típica frente al ajuste por dominio.
- Despliegue en hardware modesto: con 0,78 B de parámetros y pesos bfloat16, es viable en una sola GPU consumer para prototipos y demos de transcripción coreana.
- Transcripción de material docente o conferencias: el autor reporta un resultado en un conjunto externo de habla de conferencias (AI-Hub 71627), lo que permite usarlo, con cautela por el mayor error, en dominios de habla espontánea.

## Benchmarks y rendimiento
Resultados declarados por el autor en el model-index (no verificados; `verified: false`).

| Conjunto de evaluacion | Muestras (N) | CER (%) | WER (%) |
|---|---|---|---|
| Combinado disartria + habla tipica (AI-Hub 013 + 109) | 38.599 | 1,51 | 5,70 |
| Disartria (AI-Hub 013) | 15.495 | 0,79 | 1,98 |
| Habla tipica (AI-Hub 109) | 23.104 | 1,97 | 8,02 |
| Habla de conferencias externa (AI-Hub 71627) | 10.000 | 13,11 | 32,03 |

Comparativa de degradación cruzada reportada en la model card, en CER:

| Configuracion | Disartria | Habla tipica |
|---|---|---|
| Modelo base Qwen3-ASR-0.6B | 4,26 % | 4,63 % |
| Full fine-tuning solo disartria | no disponible | 15,01 % (desde 4,63 %) |
| LoRA solo disartria | no disponible | 8,02 % (desde 4,63 %) |
| LoRA combinado (este modelo) | 0,79 % (desde 4,26 %) | 1,97 % (desde 4,63 %) |

## Requisitos de hardware
- VRAM estimada: los pesos bfloat16 ocupan aproximadamente 1,56 GB; con activaciones y caché de inferencia, un presupuesto de 3-4 GB es razonable, aunque el autor no publica una cifra oficial.
- GPU recomendadas: no hay recomendaciones oficiales; por tamaño, cualquier GPU con al menos 4 GB de VRAM es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, con 0,78 B de parámetros y pesos bfloat16.
- Opciones de despliegue: `transformers >= 5.13.0` con `Qwen3ASRForConditionalGeneration`; el autor no documenta vLLM, llama.cpp, Ollama ni TGI, y la disponibilidad de GGUF no está indicada.
- Latencia y throughput: no disponibles; el autor solo señala que el merge acelera el arranque y la inferencia en streaming frente al adaptador LoRA.
- Formatos de ejecución: CUDA y MPS en bfloat16, CPU en float32.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Enfoque |
|---|---|---|---|---|---|
| PL-HFT/qwen3-asr-0.6b-ko-dysarthria | 782.426.112 | coreano | segmentos <= 29,5 s | Apache 2.0 | ASR coreano con ajuste conjunto disartria + tipico |
| Qwen/Qwen3-ASR-0.6B-hf | no disponible | no disponible | no disponible | no disponible | modelo base sin ajuste a coreano ni disartria |
| PL-HFT/qwen3-asr-0.6b-ko-dysarthria-lora | mismo backbone | coreano | segmentos <= 29,5 s | Apache 2.0 | adaptador LoRA, requiere `peft` en inferencia |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, salvo las cifras del modelo base citadas en la model card (4,26 % CER en disartria y 4,63 % en habla típica).

## Limitaciones y advertencias
- Solo cubre coreano; no se documenta soporte de otros idiomas.
- El audio debe ser 16 kHz mono y segmentos de hasta 29,5 s; no se indica manejo de audio más largo sin segmentación previa.
- El rendimiento cae de forma notable en habla de conferencias externa (13,11 % CER y 32,03 % WER), por lo que no debe asumirse la misma precisión fuera de los dominios de entrenamiento.
- Los resultados de benchmarks están declarados por el autor con `verified: false`; no han sido validados de forma independiente.
- Riesgo de alucinación y de transcripciones incorrectas no cuantificado en la información disponible; conviene validar en producción.
- Sesgos conocidos: no documentados; el entrenamiento se apoya en corpus coreanos de AI-Hub, lo que puede limitar la generalización a acentos, edades o condiciones no representadas.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones de los conjuntos de datos de origen, cuyos audios y transcripciones no se redistribuyen en el repositorio.
- Requiere `transformers >= 5.13.0`; versiones anteriores no cargan `Qwen3ASRForConditionalGeneration`.
- La salida incluye el prefijo `language Korean<asr_text>` y debe procesarse para extraer la transcripción limpia.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/PL-HFT/qwen3-asr-0.6b-ko-dysarthria
- Adaptador LoRA de origen: https://huggingface.co/PL-HFT/qwen3-asr-0.6b-ko-dysarthria-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- Model card en coreano: ./README.ko.md (referenciada en el repositorio)
