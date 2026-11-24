# celebibasar/DroidSenior-7B-v5

## Resumen

DroidSenior-7B-v5 es un modelo de lenguaje especializado en desarrollo Android y Kotlin, desarrollado por el usuario de Hugging Face `celebibasar`. Se construye mediante fine-tuning supervisado (SFT) y aprendizaje por refuerzo con GRPO sobre el modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`, con el objetivo de generar codigo Kotlin idiomatico y actualizado para el stack Android estable (AGP 9.5.1, Kotlin 2.4.21, Gradle 9.9.0, compileSdk 37, Compose BOM 2026.09.00). Con 7.615.616.512 parametros, es un modelo denso de la familia Qwen2.5-Coder, orientado a generacion de codigo y asistencia conversacional.

La propuesta diferencial del modelo es su entrenamiento con feedback del compilador: el SFT incluye ejemplos multi-turno de reparacion de errores de compilacion, y la fase GRPO recompensa directamente la compilacion limpia (1.0), con warnings de deprecacion (0.75), tras auto-import (0.30), codigo que no compila (0.05) o ausencia de codigo (0). Esto lo hace especialmente adecuado para flujos de trabajo donde se dispone de un compilador Kotlin real, alcanzando hasta un 96.7% de compilacion exitosa con best-of-8 y reparacion firmada.

El modelo se distribuye con licencia Apache 2.0, soporta ingles y turco, y esta disenado para integrarse en pipelines de generacion de codigo Android con verificacion por compilador. Su relevancia actual radica en el enfoque de "compilador en el bucle" (compiler-in-the-loop) como senal de entrenamiento y evaluacion, poco comun en modelos de codigo de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5-Coder) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (4.68 GB); otras no disponibles |
| Idiomas soportados | en, tr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Coder-7B-Instruct`, un transformer denso de 7.6B parametros. El entrenamiento se realiza en una sola pasada desde el modelo base limpio (a diferencia de v1-v4, que fueron incrementales). La fase SFT emplea 7.614 ejemplos unicos con LoRA r=64 y alpha=128, distribuidos en: verified 1.854, ornith 735, teacher_2026 1.851, build 295, mined 1.042, teacher_new 128, repair 1.627 y repair_new 82. Los ejemplos nuevos de 2026 se ponderan 2x y los ejemplos multi-turno de reparacion 3x; en estos ultimos la perdida cubre solo la respuesta final corregida. Parte de los datos sinteticos se generaron con checkpoints anteriores de DroidSenior y con modelos teacher open-weight locales.

La fase GRPO consta de 150 pasos con 8 respuestas muestreadas por pregunta, recompensadas por el compilador: 1.0 compilacion limpia, 0.75 con warnings de deprecacion, 0.30 solo tras auto-import, 0.05 codigo que no compila y 0 ausencia de codigo. El teacher para datos nuevos es `Qwen/Qwen2.5-Coder-32B-Instruct` ejecutado localmente en 4-bit. Cada respuesta objetivo se compilo contra las versiones objetivo con imports completos y sin warnings de deprecacion, y las preguntas de evaluacion se eliminaron de los datos de entrenamiento. Los datasets utilizados son `giggiovpg/android-kotlin-compose-compiler-verified` y `giggiovpg/ornith-android-instruct`.

## Capacidades

- Generacion de codigo Kotlin moderno (Jetpack Compose, Coroutines/Flow, Hilt, Room) siguiendo la guia oficial de arquitectura Android.
- Reparacion multi-turno de errores de compilacion a partir de la salida del compilador.
- Uso de pistas de API (`Relevant APIs in this project`) con imports mapeados desde `import_map.json`.
- Razonamiento sobre decisiones de diseno y trade-offs, con explicaciones breves.
- Generacion de tests cuando aportan valor.
- Respuesta en el idioma del usuario (soporte declarado en y tr).
- Integracion con tool calling no documentada explicitamente en la informacion disponible.
- Capacidad de agente multi-paso no documentada explicitamente.
- Modo thinking, vision y audio: no disponibles.

## Casos de uso

- Asistente de codigo Android en IDE: el modelo genera codigo Kotlin/Compose idiomatico y puede recibir la salida del compilador como siguiente mensaje para reparar errores, integrandose en plugins de editor con bucle de compilacion.
- Generacion de pantallas Jetpack Compose: produce composables con imports completos y sin APIs deprecadas, adecuado para scaffolding de UI en proyectos nuevos.
- Migracion de APIs deprecadas: entrena con preguntas de migracion que deben migrarse realmente, por lo que puede usarse para actualizar codigo a las versiones estables de AGP, Kotlin y Compose BOM.
- Reparacion automatica en CI/CD: con best-of-8 y hasta 3 rondas de reparacion firmada se alcanza un 96.7% de compilacion, lo que permite un paso de autofix en pipelines que compile y repare codigo generado.
- Generacion de capa de persistencia con Room: el modelo se evalua con KSP de Room, por lo que es adecuado para generar entidades, DAOs y bases de datos con anotaciones correctas.
- Documentacion y explicacion de codigo Android: responde en el idioma del usuario explicando decisiones de diseno, util para onboarding de desarrolladores.
- Asistencia en pruebas unitarias: genera tests Kotlin cuando aportan valor, segun su system prompt.

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy, mismo system prompt y 368 preguntas retenidas nunca usadas en entrenamiento. Intervalos bootstrap al 95%.

| Modelo | pass@1 | pass@1 and current | + auto import | + 2 rondas reparacion | pass@1 con API hints | Kotlin HumanEval |
|---|---|---|---|---|---|---|
| v4 | 46.2% (41%-51%) | 45.7% (40%-51%) | 54.6% (49%-60%) | 56.2% (51%-61%) | n/a | 72.7% (66%-80%) |
| sft | 64.4% (60%-69%) | 62.8% (58%-68%) | 69.6% (65%-74%) | 79.3% (75%-83%) | 66.3% (61%-71%) | 67.7% (60%-75%) |
| grpo | 67.9% (63%-73%) | 66.6% (61%-71%) | 72.0% (67%-77%) | 82.3% (79%-86%) | 67.9% (63%-73%) | 67.1% (60%-75%) |

Resultados de sistema con best-of-8 y reparacion firmada (mismas 368 preguntas):

| Configuracion | Compila |
|---|---|
| Respuesta greedy unica (pass@1) | 67.9% (63%-73%) |
| Greedy + hasta 2 rondas de reparacion con hechos de librerias | 85.1% (81%-89%) |
| Best-of-8 muestras | 94.6% (92%-97%) |
| Best-of-8 + hasta 3 rondas de reparacion con hechos de librerias | 96.7% (95%-98%) |

pass@k muestreado a temperatura 0.8: k=1 62.2%, k=2 79.5%, k=4 89.6%, k=8 94.6%. El problema principal mas frecuente en respuestas que fallan: unresolved_reference 53, type_mismatch 16, other 15, wrong_arguments 11, room_ksp 8, suspend_context 5.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15.2 GB (tamano del repo), por lo que requiere GPU de 16 GB o superior.
- Cuantizacion Q4_K_M GGUF: 4.68 GB, cabe en GPUs consumer de 6-8 GB.
- GPU recomendadas: A100, H100 para FP16 con throughput alto; RTX 4090 (24 GB) para FP16; RTX 3060/4060 (8-12 GB) para Q4_K_M.
- Cabe en GPU consumer: si, en RTX 3060 12 GB o superior con Q4_K_M; en RTX 4090 con FP16.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama para GGUF (no confirmado explicitamente en la informacion).
- Latencia y throughput: Q4_K_M en CPU a 7.9 tokens/s en Colab. El sistema best-of-8 con reparacion requiere aproximadamente 8 veces la generacion de una respuesta unica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DroidSenior-7B-v5 | 7.6B | no disponible | Android/Kotlin con feedback de compilador | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7.6B | no disponible | Codigo general | apache-2.0 | Hugging Face |
| Qwen2.5-Coder-32B-Instruct | 32B | no disponible | Codigo general (teacher) | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en Android/Kotlin en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo conoce versiones de librerias hasta 2026-11-08; releases posteriores son desconocidas y pueden generar APIs obsoletas.
- La evaluacion no comprueba comportamiento en runtime, solo compilacion; el codigo puede compilar pero fallar en ejecucion.
- El procesamiento de Hilt (KSP) no se verifica en la evaluacion, solo Room.
- Las 368 preguntas de evaluacion son aquellas que un teacher de 32B pudo responder correctamente, por lo que preguntas reales mas dificiles obtendran puntuaciones inferiores.
- Riesgo de alucinacion en APIs, imports y firmas de funciones no presentes en el contexto.
- Idiomas limitados a ingles y turco; el resto de idiomas no estan garantizados.
- Sesgos no documentados en la informacion disponible.
- El uso comercial esta permitido por la licencia Apache 2.0, pero el autor no ofrece garantias.
- El rendimiento optimo depende de disponer de un compilador Kotlin y de las fuentes de las librerias para la reparacion firmada; sin ese entorno, el pass@1 baja al 67.9%.
- El coste computacional del best-of-8 con reparacion es aproximadamente 8 veces el de una generacion unica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/celebibasar/DroidSenior-7B-v5
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Dataset compiler-verified: https://huggingface.co/datasets/giggiovpg/android-kotlin-compose-compiler-verified
- Dataset ornith-android-instruct: https://huggingface.co/datasets/giggiovpg/ornith-android-instruct
- Teacher Qwen2.5-Coder-32B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
