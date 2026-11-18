# bergetai/sten-lora

## Resumen
Sten LoRA es un adaptador LoRA para el modelo de sintesis de voz openbmb/VoxCPM2, desarrollado por Berget AI. Su proposito es dotar al modelo base de una pronunciacion natural en sueco, corrigiendo deficiencias que el modelo original (entrenado mayoritariamente en otros idiomas) presenta en este idioma: la R alveolar, la prosodia sueca y el acento en palabras compuestas. El adaptador se ha afinado sobre un audiolibro narrado profesionalmente en sueco de aproximadamente 7,5 horas.

El modelo base VoxCPM2 es un sistema text-to-speech de 2B parametros con arquitectura de difusion autorregresiva sin tokenizador (tokenizer-free diffusion AR). El adaptador mantiene la licencia Apache 2.0 del modelo base y se distribuye con el identificador bergetai/sten-lora, aunque la model card referencia el repositorio como bergetai/voxcpm2-sv-sturmark-lora en el codigo de ejemplo.

La relevancia de este adaptador radica en que, segun la evaluacion del autor, alternativas como Zonos 3 Mini, KugelAudio, Qwen3-TTS y Piper no producian habla sueca natural. Este LoRA cierra esa brecha para una unica voz, lo que lo hace util para proyectos de TTS en sueco que requieran prosodia nativa, aunque con las limitaciones propias de un adaptador de una sola voz y un solo idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre VoxCPM2 (difusion autorregresiva sin tokenizador, base de 2B) |
| Parametros totales | No disponible (el adaptador LoRA es un conjunto de pesos adicionales; el base es de 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_len por defecto de 4096 en generacion) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos LoRA (lora_config.json + pesos del adaptador); el base en formato nativo de VoxCPM |

## Arquitectura y entrenamiento
El adaptador se aplica sobre VoxCPM2, un modelo de 2B parametros con arquitectura de difusion autorregresiva sin tokenizador. El LoRA se configura con r=16, alpha=32, activando tanto el modulo de lenguaje (enable_lm) como el modulo DiT (enable_dit), con una tasa de aprendizaje de 1e-4, batch de 1 con acumulacion de gradiente de 4 y 4.000 pasos de entrenamiento (aproximadamente 3,3 epocas) en precision fp32.

Los datos de entrenamiento consisten en 5.139 segmentos (4.883 de entrenamiento y 256 de validacion) de 2 a 15 segundos cada uno, extraidos de un audiolibro sueco narrado profesionalmente. El audio fuente de 24 kHz se remuestreo a la tasa del codificador AudioVAE (16 kHz) y las transcripciones se obtuvieron mediante alineamiento forzado con KBLab/kb-whisper-large. El entrenamiento se realizo en una unica AMD MI300X con ROCm 7.2, y la model card documenta que la mezcla bf16/fp32 provoca fallos en el forward pass en ROCm, por lo que fue necesario forzar fp32.

## Capacidades
- Sintesis de voz (text-to-speech) en sueco con prosodia natural, R alveolar y acento correcto en palabras compuestas.
- Clonacion de voz limitada a la timbre del narrador del audiolibro usado en el entrenamiento.
- Generacion de audio a 24 kHz mediante el modelo base VoxCPM2.
- Control de la generacion mediante parametros como cfg_value (por defecto 2.0) e inference_timesteps (por defecto 10).
- Ejecucion en multiples dispositivos: CUDA, CPU y MPS (Apple Silicon).
- No soporta otros idiomas mas alla del sueco; el adaptador no hace multilingue al modelo base.

## Casos de uso
- Audiolibros en sueco: el adaptador se entreno precisamente sobre narracion de audiolibros, por lo que es adecuado para convertir texto largo en audio con pausas naturales si se respetan los saltos de linea a nivel de frase y se ajusta max_len.
- Locucion para contenidos formativos o documentales en sueco: la prosodia nativa y el acento en compuestos permiten generar narraciones con calidad aceptable para material educativo.
- Prototipado de asistentes de voz en sueco: permite generar respuestas habladas en un unico timbre para pruebas de concepto de interfaces conversacionales.
- Accesibilidad: conversion de textos suecos a audio para personas con discapacidad visual, siempre que se respeten las limitaciones de numeros escritos con letras.
- Generacion de avisos o mensajes pregrabados en sueco: util para sistemas que requieran locuciones en un timbre concreto sin contratar a un locutor para cada frase.
- Investigacion en TTS para lenguas de bajos recursos: sirve como referencia de adaptacion LoRA de un modelo multilingue a un idioma concreto con pocas horas de datos (7,5 horas).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluacion cualitativa frente a Zonos 3 Mini, KugelAudio, Qwen3-TTS y Piper en sueco, segun la cual ninguno producia habla sueca natural, pero no se proporcionan metricas numericas.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El modelo base es de 2B parametros; en fp32 requeriria aproximadamente 8 GB solo para pesos, mas overhead, pero no se confirma en la informacion.
- GPU recomendadas: AMD MI300X fue usada para entrenamiento; para inferencia la model card indica compatibilidad con CUDA, CPU y MPS (Apple Silicon).
- Cabe en GPU de consumo: no confirmado. Un modelo de 2B en fp16 podria caber en GPUs de 8-12 GB, pero no se aporta dato verificado.
- Opciones de despliegue: libreria voxcpm (pip install voxcpm soundfile), con Python 3.12 y torch >= 2.5. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sten LoRA (VoxCPM2 + LoRA) | Base 2B + adaptador | No disponible | Sueco | Apache 2.0 | Hugging Face |
| Zonos 3 Mini | No disponible | No disponible | No disponible | No disponible | No disponible |
| KugelAudio | No disponible | No disponible | No disponible | No disponible | No disponible |
| Qwen3-TTS | No disponible | No disponible | No disponible | No disponible | No disponible |
| Piper | No disponible | No disponible | No disponible | No disponible | No disponible |

La model card solo indica que estos modelos fueron evaluados en sueco sin producir habla natural, pero no aporta especificaciones tecnicas ni resultados cuantitativos que permitan una comparacion detallada.

## Limitaciones y advertencias
- Los numeros deben escribirse con letras en el texto de entrada ("fyrtiotre" en lugar de "43") para una pronunciacion correcta.
- Los saltos de linea a nivel de frase en el texto producen pausas naturales; un texto sin estructura puede generar una prosodia menos adecuada.
- Para textos largos es necesario aumentar max_len (por defecto 4096) o sintetizar frase por frase.
- El adaptador incorpora el timbre del narrador y la prosodia sueca, pero no hace multilingue al modelo base.
- Riesgo de uso indebido para suplantar la voz del narrador: la model card prohibe explicitamente generar habla destinada a hacerse pasar por el narrador.
- Sesgos y alucinaciones: no se documentan sesgos especificos ni tasas de alucinacion en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la prohibicion de suplantacion del narrador debe respetarse.
- En ROCm, la mezcla bf16/fp32 provoca fallos en el forward pass; es necesario forzar fp32.
- La libreria requiere Python 3.12 y torch >= 2.5; el ejemplo de uso referencia el repositorio bergetai/voxcpm2-sv-sturmark-lora, distinto del ID bergetai/sten-lora.

## Enlaces
- Hugging Face: https://huggingface.co/bergetai/sten-lora
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Blog de Berget AI con la evaluacion completa: no disponible (mencionado en la model card sin URL)
- Repositorio referenciado en el codigo de ejemplo: https://huggingface.co/bergetai/voxcpm2-sv-sturmark-lora
- Modelo de transcripcion usado: https://huggingface.co/KBLab/kb-whisper-large
