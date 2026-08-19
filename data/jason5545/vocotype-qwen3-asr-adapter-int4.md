# jason5545/vocotype-qwen3-asr-adapter-int4

## Resumen

Este repositorio aloja los artefactos de inferencia del adaptador Android para el modelo Qwen3-ASR, desarrollados por el autor jason5545 para el proyecto Vocotype. No se trata de un modelo de lenguaje completo, sino de un conjunto de artefactos optimizados (encoder ONNX prefundido y decodificador residente para la NPU de Qualcomm) que permiten ejecutar reconocimiento de voz (ASR) en dispositivos Android con aceleración por hardware. El objetivo principal es integrar dictado por voz y comandos contextuales en un teclado IME (método de entrada) de producción.

La arquitectura se basa en el modelo Qwen3-ASR, pero se presenta cuantizada y fragmentada para ejecutarse en la NPU Qualcomm HTP (Hexagon Tensor Processor). El encoder está cuantizado a INT4, mientras que el decodificador utiliza un esquema W8A16 con atención en u8. La ejecución sigue un protocolo de sesión con prefill fijo de 128 tokens y decodificación greedy sobre una caché KV de anillo de 127 posiciones, con una latencia medida de aproximadamente 108 ms por token en el SoC SM8850 (Snapdragon 8 Elite).

La relevancia actual de este repositorio radica en su enfoque práctico para el despliegue de ASR en el borde (edge), aprovechando la NPU integrada en smartphones de gama alta. Al incluir artefactos QNN residentes (binarios `.bin`) y pesos de normalización en CPU, demuestra un patrón de ejecución híbrida (NPU + CPU) que es crítico para aplicaciones de baja latencia y privacidad. Sin embargo, al carecer de licencia explícita, idiomas declarados y datos de entrenamiento, su adopción en producción requiere una evaluación legal y funcional adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-ASR (encoder + decodificador adaptado para Qualcomm HTP NPU) |
| Parametros totales | no disponible (repo de 13.4 GB con artefactos cuantizados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Prefill fijo de 128 tokens; caché KV de anillo de 127 posiciones |
| Tipos de cuantizacion | INT4 (encoder ONNX), W8A16 + u8-attention (decoder step), W8A16 equalizado (prefill) |
| Idiomas soportados | no disponibles (depende del modelo base Qwen3-ASR) |
| Licencia | no disponible |
| Formato de pesos | ONNX (encoder), binarios QNN residentes (`.bin`), pesos `f32` para CPU (RMSNorm) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino un adaptador y artefactos de inferencia para el modelo Qwen3-ASR. El encoder se presenta como un archivo ONNX prefundido (`encoder.adapter.int4.onnx`) que integra el adaptador de hablante Vocotype, cuantizado a INT4 para su ejecución en Android. El decodificador está dividido en siete chunks residentes (`chunk0-rtu.bin` a `chunk7-rtu.bin`), cada uno con 4 capas, donde la expansión de KV de GQA (Grouped Query Attention) se pliega en la dimensión M del head Q. Adicionalmente, se incluyen núcleos de prefill para atención y FFN con pesos equalizados W8A16.

La ejecución sigue un protocolo híbrido: los cálculos de MatMul, atención, FFN y la cabeza de salida (LM head) se ejecutan en la NPU Qualcomm HTP mediante contextos binarios cacheados, mientras que la normalización RMSNorm, las adiciones residuales y la selección de tokens permanecen en la CPU. Se incluyen vectores de corrección de sesgo DC por capa (`decoder_ffn_dc.f32`) medidos en el SM8850, que se restan antes de la adición residual del FFN. No se proporcionan datos sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineamiento (RLHF/DPO).

## Capacidades

- Reconocimiento de voz (ASR) en dispositivo con ejecución local completa.
- Adaptación al hablante mediante el adaptador Vocotype integrado en el encoder.
- Soporte de hotwords contextuales (context hotword bias) mediante un contrato de runtime específico (`runtime/context-hotword-bias-20260705/`).
- Decodificación greedy con caché KV de anillo para inferencia autoregresiva de baja latencia.
- Aceleración por hardware en NPU Qualcomm HTP (MatMul, atención, FFN y head de salida).
- Ejecución en pipeline de producción para teclado IME en Android.
- Prefill fijo de 128 tokens para el procesamiento inicial de la entrada.

## Casos de uso

- Dictado por voz en teclados IME: el modelo puede transcribir audio en tiempo real mientras el usuario escribe, aprovechando la NPU para mantener una latencia de ~108 ms/token y una experiencia fluida en el móvil.
- Asistentes de voz sin conexión: al ejecutarse completamente en el dispositivo, permite construir asistentes personales que no dependen de la nube, garantizando privacidad y funcionamiento sin red.
- Transcripción de reuniones o notas de voz: con su prefill de 128 tokens y caché KV de anillo, puede procesar flujos de audio continuos de forma incremental, ideal para aplicaciones de grabación y transcripción en tiempo real.
- Accesibilidad para personas con discapacidad motora: integrado en el IME, permite controlar el dispositivo mediante comandos de voz, incluyendo hotwords contextuales para acciones específicas como "enviar" o "borrar".
- Automatización de comandos de voz en aplicaciones de productividad: gracias al soporte de hotwords contextuales, se pueden definir palabras clave que activen macros o acciones dentro de apps de terceros.
- Aplicaciones de salud y telemedicina: la transcripción local de consultas médicas o entrevistas garantiza la confidencialidad de los datos del paciente, ya que el audio nunca sale del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible, ya que este repositorio no contiene un modelo de propósito general sino artefactos de ASR específicos para hardware móvil.

Los únicos datos de rendimiento proporcionados son:
- Latencia de decodificación por paso: ~108 ms/token en el SoC SM8850 (Snapdragon 8 Elite) con el layout W8A16 actual.
- Verificación con fixture de 26/26 tokens y pruebas de regresión con audio en vivo realizadas el 2026-08-11.

## Requisitos de hardware

- Dispositivo Android con SoC Qualcomm Snapdragon 8 Elite (SM8850) o similar con NPU HTP compatible.
- Memoria de almacenamiento: el repositorio ocupa 13.4 GB, aunque los artefactos residentes pueden requerir menos espacio en el dispositivo final.
- CPU dedicada para tareas de normalización RMSNorm, adiciones residuales y selección de tokens.
- NPU Qualcomm HTP obligatoria para ejecutar los binarios QNN (`.bin`) del decodificador y prefill.
- No es compatible con GPU de escritorio (NVIDIA, AMD) ni con otras NPU móviles (como Google Tensor o Apple Neural Engine) sin modificaciones significativas.
- Opciones de despliegue: el repositorio está diseñado específicamente para el pipeline de producción del IME de Vocotype; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros adaptadores ASR para Android, ni con modelos base como Whisper o Parakeet. Este repositorio es un conjunto de artefactos propietarios muy específicos para la NPU de Qualcomm, por lo que no existen alternativas equivalentes documentadas en la misma categoría (adaptadores ASR con cuantización INT4/W8A16 para HTP).

## Limitaciones y advertencias

- Licencia no disponible: el repositorio no declara una licencia, lo que impide su uso comercial o la redistribución sin autorización explícita del autor.
- Idiomas no soportados declarados: no se indica qué idiomas puede transcribir; depende del modelo base Qwen3-ASR, pero no se garantiza cobertura multilingüe.
- Dependencia de hardware específico: los binarios QNN están compilados para la NPU Qualcomm HTP (SM8850) y no son portables a otras plataformas sin recompilación.
- Limitación de contexto de entrada: el prefill está fijo en 128 tokens, lo que restringe la cantidad de audio que se puede procesar en cada lote inicial.
- Decodificación greedy: no se utiliza beam search, lo que puede afectar a la precisión en entornos ruidosos o con vocabulario ambiguo.
- Riesgo de alucinación y sesgos: al ser un adaptador de ASR, no se dispone de datos sobre sesgos demográficos o acústicos; se recomienda validar en el dominio de uso.
- Proyecto sin tracción: con 0 descargas y 0 likes, el repositorio es muy nuevo o de acceso restringido; no hay evidencia de mantenimiento activo o soporte comunitario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jason5545/vocotype-qwen3-asr-adapter-int4
