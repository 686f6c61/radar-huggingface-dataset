# jatshi/LLM-Guided-Speech-Enhancement-v4.1-GRPO

## Resumen

LLM-Guided Speech Enhancement v4.1 es un adaptador de mejora de voz desarrollado por jatshi, que combina un codificador Whisper-small congelado con el modelo de lenguaje Qwen/Qwen2.5-1.5B-Instruct. El modelo no genera señales de audio directamente: un proyector comprime los estados ocultos de Whisper en 16 tokens de prefijo continuos, y el LLM emite una prescripción JSON estricta que controla un motor DSP determinista. Esta arquitectura hibrida permite abordar la mejora de voz como un problema de decision de parametros de procesamiento de senal guiado por lenguaje.

La version 4.1 es una recuperacion del entrenamiento GRPO, tras el colapso de la v4.0. Parte de un adaptador SFT verificado, ancla el entrenamiento al SFT, rechaza canarios saturados y calibra acciones contra objetivos de degradacion sintetica. Los resultados reportados muestran un 99,1458% de JSON validos y una recompensa media verificable de 0,976320, frente a 0,953821 del SFT. El modelo es relevante porque ofrece un enfoque novedoso de enhancement de voz con validacion objetiva basada en metricas de referencia, aunque sus ganancias son modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Whisper-small encoder congelado + Qwen2.5-1.5B-Instruct decoder, con adaptador LoRA y proyector de audio |
| Parametros totales | No disponible (el repo publica un adaptador PEFT de ~0,1 GB; los pesos base tienen ~1.500 millones de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (heredado de Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; no se indican cuantizaciones de los pesos base) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (adaptadores y codigo); los pesos base de Qwen y Whisper quedan sujetos a sus propias licencias |
| Formato de pesos | Safetensors (adaptador LoRA) y .pt (audio_projector) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre Qwen2.5-1.5B-Instruct, con un proyector de audio que transforma las salidas del encoder Whisper-small en 16 tokens de prefijo continuos. Estos tokens se insertan antes del prompt de texto y el LLM genera una prescripcion JSON validada. El motor DSP externo ejecuta esa receta sobre la señal original, aplicando un gate de seguridad basado en SI-SDR que revierte al audio ruidoso si la mejora no se cumple. No se sintetiza audio directamente desde el modelo.

El entrenamiento de la v4.1 se describe como un proceso GRPO con ancla SFT. La v4.0 colapso porque todos los candidatos en cada grupo recibian recompensa cero. La v4.1 parte del adaptador SFT verificado, rechaza canarios saturados de pre-entrenamiento y calibra los parametros de accion contra objetivos de degradacion sintetica deterministas, sin usar un juez LLM. Se emplearon 300 pasos de optimizacion y 1.200 grupos. El entorno verificado usaba Python 3.10.8, PyTorch 2.5.1, Transformers 4.48.3, PEFT 0.14.0, Accelerate 1.2.1 y DeepSpeed 0.16.3 sobre una RTX 3080 Ti 12GB. La mencion a DeepSpeed ZeRO-2 con world_size=1 es evidencia de integracion, no una reclamacion de escalado multi-GPU.

## Capacidades

- Emision de prescripciones JSON estrictas para parametros de procesamiento DSP, en lugar de generar muestras de audio.
- Validacion automatica de salidas: tasa de JSON validos del 99,1458% en la muestra de entrenamiento.
- Safety gating integrado: el motor DSP comprueba la condicion de SI-SDR y revierte a la señal original si el candidato falla (68,15% de aceptacion y 31,85% de rollback en el benchmark).
- Mejora objetiva medida en ganancias medias: +0,35468 dB en SI-SDR, +0,04056 en PESQ y +0,00260 en STOI.
- Baja latencia en la generacion de prescripciones: media de 786,15 ms y P95 de 873,03 ms.
- Soporte multilingue limitado a ingles, evaluado con LibriSpeech.
- No ofrece tool calling, agentes de proposito general ni vision; es un pipeline cerrado audio-texto-a-parametros-DSP.

## Casos de uso

- Restauracion de grabaciones de voz con ruido: el modelo analiza el audio degradado y genera una receta DSP que un motor externo aplica para mejorar la relacion señal-ruido. Es adecuado en entornos donde las degradaciones son conocidas o sinteticas.
- Preprocesado para sistemas de reconocimiento de voz: la ganancia en SI-SDR puede reducir la tasa de error en condiciones ruidosas antes de la transcripcion automatica.
- Recuperacion de archivos historicos: prepara grabaciones con ruido de fondo y limitaciones de banda para su posterior transcripcion o publicacion.
- Laboratorio de procesado de audio: sirve como referencia para comparar algoritmos de enhancement DSP y para generar configuraciones de filtrado de forma automatizada.
- Sistemas con tolerancia a la degradacion: el componente de rollback devuelve la señal original cuando la mejora no es segura, util en aplicaciones criticas donde un artefacto adicional es inaceptable.
- Investigacion en control de audio por lenguaje: permite explorar nuevos paradigmas donde un LLM decide parametros de DSP en lugar de sintetizar la forma de onda directamente.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| JSON validos (muestreado) | 99,1458% |
| Grupos no saturados | 99,8333% |
| Predicciones en held-out | 1.416/1.416 (100%) |
| Tasa de placeholders | 0% |
| Recompensa SFT media verificable | 0,953821 |
| Recompensa GRPO media verificable | 0,976320 |
| Gate de promocion | Pase |
| Seguridad: aceptacion / rollback | 68,15% / 31,85% |
| Ganancia media SI-SDR | +0,35468 dB |
| Ganancia media PESQ | +0,04056 |
| Ganancia media STOI | +0,00260 |
| Latencia media / P95 de prescripcion | 786,15 / 873,03 ms |

Los datos proceden de benchmarks objetivos con referencias limpias y degradaciones sinteticas sobre LibriSpeech. No se han publicado resultados comparativos con otros modelos de mejora de voz en la informacion disponible.

## Requisitos de hardware

- El entrenamiento se ejecuto en una RTX 3080 Ti 12GB, lo que sugiere que la inferencia puede realizarse en GPUs de consumo con al menos 12GB de VRAM en FP16.
- No se dispone de datos oficiales de VRAM para inferencia; la estimacion es orientativa.
- El modelo puede ejecutarse en GPUs consumer como RTX 3080 Ti, RTX 3060 12GB o RTX 4090, dado el tamano del LLM base (1.500 millones de parametros).
- No hay soporte documentado para vLLM, llama.cpp u Ollama; el despliegue requiere el codigo fuente del repositorio `Jatshi/llm-guided-speech-enhancement`, con configuraciones de DeepSpeed.
- La latencia medida para la generacion de la prescripcion es de 786 ms de media en el entorno de validacion, sin incluir el tiempo del motor DSP ni la salida de audio.

## Comparativa con modelos similares

La comparacion se limita a versiones del mismo autor, ya que no se han encontrado modelos externos con arquitectura LLM-guided en la informacion analizada.

| Modelo | Modelo base | Parametros del adaptador | Ganancia media SI-SDR | Recompensa verificable | Licencia |
|---|---|---|---|---|---|
| v4.1-GRPO (este) | Qwen2.5-1.5B-Instruct | ~0,1 GB | +0,35468 dB | 0,976320 | MIT (adaptador) |
| v4.0-SFT | Qwen2.5-1.5B-Instruct | No disponible | No disponible | 0,953821 | MIT (adaptador) |
| llm-guided-speech-enhancement (dpo-adapter) | Qwen2.5-7B-Instruct | No disponible | No disponible | No disponible | MIT (adaptador) |

No hay datos de contextos, cuantizaciones ni benchmarks de las alternativas. La comparacion entre v4.1 y v4.0 solo refleja la recompensa verificable en el mismo marco de validacion.

## Limitaciones y advertencias

- La evaluacion se realizo solo en ingles, con degradaciones sinteticas sobre LibriSpeech. No se ha probado en salas reales, micrófonos variados, solapamiento de hablantes ni otros idiomas.
- Las ganancias objetivas son modestas: +0,35 dB en SI-SDR y +0,04 en PESQ no establecen calidad de vanguardia en enhancement.
- El gate de seguridad usa referencias limpias; en produccion sin una referencia limpia calibrada, los rollbacks pueden ser incorrectos.
- Existe un porcentaje de JSON invalido (0,8542% en la muestra), por lo que el sistema debe manejar esos fallos.
- Las preferencias y objetivos de calibracion se generan programaticamente, no a partir de etiquetas humanas, lo que puede divergir de la percepcion subjetiva.
- La licencia MIT se aplica al codigo y a los adaptadores, pero los pesos de Qwen, Whisper, LibriSpeech y ESC-50 conservan sus propios terminos de uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jatshi/LLM-Guided-Speech-Enhancement-v4.1-GRPO
- Codigo fuente del proyecto: https://github.com/Jatshi/llm-guided-speech-enhancement
- Version v4.0-SFT: https://huggingface.co/jatshi/LLM-Guided-Speech-Enhancement-v4-SFT
- Repositorio con adaptador dpo-adapter: https://huggingface.co/jatshi/llm-guided-speech-enhancement
