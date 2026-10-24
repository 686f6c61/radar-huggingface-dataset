# baseten/caesar-cipher-sgd-qwen38_27b-expert

## Resumen

`baseten/caesar-cipher-sgd-qwen38_27b-expert` es un ajuste fino completo (full-weight) del modelo base Qwen/Qwen3.8-27B, publicado por Baseten, especializado en una única tarea: descifrar texto codificado con el cifrado César. El entrenamiento se realizó con GRPO (Group Relative Policy Optimization) sobre el entorno Caesar Cipher de Reasoning Gym, usando SGD con tasa de aprendizaje constante de 0,1 y recompensa binaria por respuesta completada correcta. El checkpoint publicado corresponde a la actualización de optimizador 100 de una trayectoria fresca que consumió 6.400 respuestas de entrenamiento.

El interés del modelo no reside en su generalidad, sino en su valor como evidencia reproducible de un experimento de RL con pesos completos: el autor documenta el salto de precisión de 40,25% (base fijado) a 92,25% (actualización 100) sobre un banco de evaluación de 50 tareas retenidas con 8 muestras por tarea, es decir, 400 completions puntuadas. Con 26.895.998.464 parámetros (unos 26,9 mil millones) y un repositorio de 53,8 GB en safetensors BF16, es un modelo grande para una tarea muy estrecha.

La relevancia práctica es acotada: sirve como referencia metodológica para investigación en RL y como componente especializado en pipelines de criptografía clásica, docencia o CTFs, no como asistente conversacional de propósito general. La model card advierte explícitamente de que no se realizaron evaluaciones multimodales, de transferencia entre tareas ni de un conjunto final de confirmación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (herencia del modelo base Qwen/Qwen3.8-27B; detalles de arquitectura no disponibles en la informacion proporcionada) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 B), segun safetensors |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | 32.768 tokens de contexto y 16.384 tokens de salida en la configuracion de entrenamiento; maximo arquitectonico del modelo base no disponible |
| Tipos de cuantizacion | No se distribuyen versiones cuantizadas: solo pesos BF16. El autor exige preservar cada bit en cualquier repacking (sin cast, cuantizacion, promediado ni sustitucion de pesos base); cualquier cuantizacion posterior no esta validada |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (siguiendo el modelo base fijado) |
| Formato de pesos | Safetensors, 18 shards, BF16; repositorio de 53,8 GB |
| Pipeline | image-text-to-text (segun HuggingFace), aunque el ajuste fino y la evaluacion son exclusivamente de texto |
| Modelo base | Qwen/Qwen3.8-27B, revision fijada `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` |
| Runtime de referencia | Transformers 5.12.1 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B en una revision fijada y aplica un ajuste fino de pesos completos con GRPO. La innovacion no esta en la arquitectura, sino en el procedimiento: optimizador SGD con LR constante 0,1, momentum y weight decay a 0,0, clip de politica 0,2/0,28, coeficientes KL y de entropia a 0,0, precision BF16 y un presupuesto de 8 preguntas × 8 completions por actualizacion durante 100 actualizaciones, lo que suma 6.400 respuestas. El entrenamiento usa lotes asincronos ordenados con un retraso maximo de 1 actualizacion completada y validacion cada 10 actualizaciones, con thinking habilitado en esfuerzo medio y muestreo a temperatura 1,0, top-p 0,95 y top-k 20.

Los datos proceden del entorno Caesar Cipher de Reasoning Gym (commit `49b07130b3fcd12f2d064bba7c43869543a0e7e7`), con un banco de tareas congelado (114 tareas de entrenamiento y 50 de validacion) y un adaptador de recompensa binaria por respuesta completada correcta. No consta RLHF con preferencias humanas, DPO ni datos generales adicionales: el ajuste es puramente de RL sobre una tarea algoritmica. Tampoco se documenta el numero de tokens de entrenamiento en sentido clasico ni la composicion de un corpus, ya que el consumo se mide en respuestas generadas.

## Capacidades

- Descifrado de texto cifrado con cifrado Cesar (rot-N) en ingles, con una precision medida del 92,25% sobre 400 completions del banco de evaluacion propio.
- Generacion de texto conversacional como heredera del modelo base, aunque no se evaluo su calidad general tras el ajuste.
- Modo thinking con `reasoning_effort="medium"`, que debe activarse junto al tokenizer y la plantilla de chat suministrados para reproducir el comportamiento publicado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se evaluo transferencia entre tareas.
- Capacidades multilingues: solo ingles declarado.
- Capacidades multimodales: el pipeline de HuggingFace es image-text-to-text, pero no se realizo ninguna evaluacion multimodal.
- Capacidad especial: es un artefacto de investigacion reproducible de RL con pesos completos, no un asistente generalista.

## Casos de uso

- Docencia de criptografia clasica: el modelo puede descifrar mensajes rot-N en ejercicios de aula y explicar el desplazamiento, lo que resulta adecuado porque su entrenamiento se concentra exactamente en esa tarea con una precision medida del 92,25%.
- Retos CTF y formación en seguridad: integrado como componente de descifrado de textos ofuscados con Cesar dentro de un pipeline mayor, donde actua como paso especializado y no como orquestador.
- Investigacion en RL: reproduccion y comparacion de recetas GRPO con SGD frente a otros optimizadores, usando el checkpoint y la traza W&B como referencia de partida.
- Validacion de infraestructura de entrenamiento: su configuracion documentada (lotes asincronos, lag maximo 1, validacion cada 10 pasos) sirve como caso de prueba para plataformas de RL a escala de 27 B en BF16.
- Generacion de datos sinteticos etiquetados: producir pares cifrado/descifrado para aumentar bancos de tareas de razonamiento algoritmico, siempre con filtrado por recompensa binaria.
- Analisis de texto con rotaciones heredadas: normalizar campos de datos que llegan codificados con desplazamientos fijos en pipelines de limpieza, con la salvedad de que solo esta validado en ingles.
- Referencia negativa en estudios de olvido catastrofico: medir cuanto degrada un ajuste GRPO de 100 pasos con LR 0,1 las capacidades generales del modelo base (no evaluado por el autor).

## Benchmarks y rendimiento

Los unicos datos disponibles son la evaluacion propia del autor sobre el entorno Caesar Cipher, con 50 tareas retenidas × 8 completions = 400 muestras. No es un benchmark oficial de Reasoning Gym y la precision es la correccion binaria media, incluyendo truncamientos en el denominador (no es best-of-8 ni pass@8).

| Checkpoint | Precision | Correctas / puntuadas | Truncadas |
|---|---:|---:|---:|
| Baseline del modelo base fijado | 40,25% | 161 / 400 | 2 / 400 |
| Actualizacion final 100 (publicada) | **92,25%** | **369 / 400** | **10 / 400** |
| Validacion intermedia en el paso 90 | 93% | no disponible | no disponible |

Ganancia observada: 52,00 puntos porcentuales. La validacion de 93% en el paso 90 se conserva como resultado intermedio y no es el punto final publicado. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 54 GB solo para pesos, mas cache KV para contexto de hasta 32.768 tokens; presupuesto realista de 60-70 GB segun longitud de secuencia y tamano de lote.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para BF16 sin cuantizar; 2 × A100 40 GB o 2 × L40S 48 GB como alternativa multi-GPU.
- GPU de consumo: no cabe en BF16 en una RTX 4090 (24 GB). Con cuantizacion de 8 bits (aproximadamente 27 GB) sigue sin caber; con 4 bits (aproximadamente 14-15 GB) podria caber, pero esa cuantizacion no esta validada por el autor y contradice su requisito de preservar los bits.
- Despliegue: Transformers 5.12.1 es el runtime fijado por el autor; vLLM y TGI son opciones previsibles para servir en BF16 con varias GPU. llama.cpp u Ollama requeririan conversion a GGUF, no soportada oficialmente por este repositorio.
- Requisito de repacking: cualquier transferencia debe conservar el layout exacto de 18 shards y cada tensor bit a bit; el autor exige una prueba de hash de tensores origen/destino que esta model card no certifica.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Caesar Cipher | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caesar-cipher-sgd-qwen38_27b-expert | 26,9 B | 32.768 tokens (entrenamiento) | 92,25% (369/400, evaluacion propia) | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | 40,25% (161/400, misma evaluacion) | Apache-2.0 (segun modelo base) | HuggingFace |
| Otros ajustes especializados en cifrado Cesar | no disponible | no disponible | no disponible | no disponible | no disponible |
| Asistentes generalistas de ~27 B | no disponible | no disponible | no disponible (no evaluados en esta tarea) | no disponible | no disponible |

No se dispone de datos publicados de modelos comparables de la misma categoria (ajustes RL sobre Reasoning Gym) en la informacion proporcionada, por lo que la unica comparacion con cifras reales es contra el modelo base fijado.

## Limitaciones y advertencias

- Modelo de proposito muy estrecho: solo se ha evaluado en descifrado Cesar en ingles; no hay evidencia de calidad conversacional, de codigo ni de matematicas tras el ajuste.
- Riesgo alto de olvido catastrofico: un ajuste de pesos completos con SGD y LR 0,1 durante 100 actualizaciones puede degradar capacidades del modelo base, y el autor no lo ha medido.
- Contaminacion potencial de la evaluacion: el banco de validacion de 50 tareas se reutilizo a lo largo del entrenamiento y no existe un conjunto final de confirmacion independiente; la cifra de 92,25% debe interpretarse con esa cautela.
- Truncamientos: 10 de 400 completions finales quedaron truncadas frente a 2 de 400 en el baseline, y cuentan como fallo en el denominador; el aumento sugiere mayor verbosidad o mayor consumo de tokens de salida.
- Ausencia de estudios de causalidad del optimizador, de transferencia entre tareas y de evaluacion multimodal, pese al pipeline image-text-to-text declarado.
- Evidencia historica incompleta: falta recuperar el resumen de validacion original de la actualizacion 40 y el resumen de solo lectura de W&B se quedo en 90 (obsoleto); el autor afirma que estas lagunas no alteran la puntuacion final.
- Alucinacion: no evaluada; en usos fuera del cifrado Cesar el modelo puede producir respuestas plausibles pero incorrectas sin senal de incertidumbre calibrada.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta verificado.
- Licencia: Apache-2.0, heredada del modelo base fijado; conviene revisar la model card del base para obligaciones adicionales antes de un uso comercial.
- Restriccion tecnica de publicacion y repacking: prohibido cuantizar, promediar o sustituir pesos base; el checkpoint no incluye estados de optimizador, scheduler ni RNG, que quedan en archivos de Baseten.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baseten/caesar-cipher-sgd-qwen38_27b-expert
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Model card del modelo base fijado: https://huggingface.co/Qwen/Qwen3.8-27B/blob/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0/README.md
- Entorno Caesar Cipher de Reasoning Gym: https://github.com/open-thought/reasoning-gym/blob/49b07130b3fcd12f2d064bba7c43869543a0e7e7/reasoning_gym/algorithmic/caesar_cipher.py
- Repositorio Reasoning Gym: https://github.com/open-thought/reasoning-gym
- Ejecucion de W&B: https://wandb.ai/baseten-training/qwen38-reasoning-gym-sgd100/runs/rktht87u
- Procedencia completa: `expert-provenance.json` (incluido en el repositorio del modelo)
- Licencia: `LICENSE` (incluido en el repositorio del modelo)
