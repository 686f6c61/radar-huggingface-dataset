# hoisd/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive-NVFP4-ftw

## Resumen

JoyFox-Qwen3.6-35B-A3B-RP-Aggressive-NVFP4-ftw es una conversión cuantizada del modelo finetuneado JoyFox-Qwen3.6-35B-A3B-RP-Aggressive, desarrollado por el usuario hoisd. No se trata de un finetune nuevo, sino de una transformación del checkpoint original BF16 a un formato FTW (FreeToken) con cuantización mixta NVFP4, FP8 y BF16/FP32. El objetivo es reducir el tamaño y el coste de inferencia para ejecución local, manteniendo el comportamiento del modelo base, que está afinado para roleplay agresivo y escritura creativa.

El modelo base es un Mixture-of-Experts (MoE) de 35.000 millones de parámetros con 3.000 millones activos (35B-A3B), basado en la arquitectura Qwen3.6, que combina capas de atención de tiempo completo con proyecciones Gated DeltaNet. Esta versión es exclusivamente de texto: se han eliminado los componentes de visión y el módulo de predicción multi-token (MTP). La conversión reduce el tamaño de los tensores de aproximadamente 66,965 GiB a 19,456 GiB, lo que permite ejecutar el modelo en GPUs de consumo con FreeToken.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) hibrida con atencion y Gated DeltaNet (Qwen3.6) |
| Parametros totales | 35B |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 E2M1, FP8 E4M3, BF16/FP32 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | FTW (FreeToken) |

## Arquitectura y entrenamiento

El modelo base JoyFox-Qwen3.6-35B-A3B-RP-Aggressive es un finetune de Qwen3.6 35B-A3B orientado a roleplay y escritura creativa. La arquitectura es un MoE hibrido que combina capas de atencion de tiempo completo con proyecciones Gated DeltaNet, segun se desprende de la receta de cuantizacion. El checkpoint cuantizado elimina los componentes de vision y MTP del modelo original, y aplica una cuantizacion mixta: los expertos enrutados, el experto compartido y la cabeza de lenguaje se cuantizan a NVFP4 E2M1; las proyecciones de atencion y las proyecciones Gated DeltaNet se mantienen en FP8 E4M3; las incrustaciones de entrada, las proyecciones Gated DeltaNet in_proj_a/in_proj_b y los parametros de estado de Mamba/Gated DeltaNet se conservan en BF16/FP32. No se proporcionan detalles sobre el dataset de entrenamiento del finetune original ni sobre tecnicas de alineacion como RLHF o DPO.

La conversion utiliza un layout estilo ModelOpt soportado por FreeToken. Durante el proceso se clasificaron 31.685 tensores: 30.841 se convirtieron a NVFP4, 130 a FP8, 362 se retuvieron o fusionaron a precision original y 352 se eliminaron (333 de vision y 19 de MTP). El error relativo RMS medio fue del 2,650% para FP8 y del 9,487% para NVFP4.

## Capacidades

- Generacion de texto y conversacion: el modelo genera texto coherente en ingles y chino, con un comportamiento afinado para roleplay y escritura creativa.
- Modo thinking: admite un modo de razonamiento que puede ser muy verboso; se recomienda desactivarlo para chat y roleplay mediante `chat_template_kwargs` con `enable_thinking: false`.
- Codificacion: puede realizar tareas generales de Qwen3.6, aunque su capacidad de tool calling no ha sido evaluada exhaustivamente.
- Multilingue: soporta ingles y chino.
- No soporta vision ni audio: la vision ha sido eliminada deliberadamente.
- No soporta MTP: el modulo de prediccion multi-token ha sido eliminado.
- Soporte de tool calling: no evaluado de forma exhaustiva en esta conversion.
- Soporte de agentes: no disponible.

## Casos de uso

- Roleplay local: el modelo esta afinado para roleplay agresivo, y la cuantizacion NVFP4 permite ejecutarlo en una GPU de consumo con FreeToken, manteniendo respuestas coherentes en personaje.
- Escritura creativa: para generar narrativa en ingles o chino, con el estilo del finetune JoyFox, aprovechando la reduccion de VRAM para iteraciones rapidas en local.
- Chat general: conversaciones multi-turno en ingles y chino, con modo thinking desactivado para respuestas mas directas y menos verbosas.
- Asistente de codificacion: tareas de programacion generales en el ecosistema Qwen3.6, aunque sin verificacion de tool calling en esta version.
- Investigacion de cuantizacion: la receta mixta NVFP4/FP8/BF16 sirve como caso de estudio para desarrolladores interesados en FreeToken, ModelOpt y el formato FTW.
- Inferencia en hardware limitado: el tamaño reducido (19,456 GiB frente a 66,965 GiB) permite ejecutar un modelo MoE de 35B en sistemas donde BF16 es impracticable.
- Aplicaciones bilingues: soporte de ingles y chino para productos o prototipos que requieran ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye pruebas de validacion basicas (aritmetica, formato, roleplay), sin metricas estandarizadas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: los tensores del modelo ocupan aproximadamente 19,456 GiB. Con FreeToken y NVFP4, se estima que la inferencia requiere al menos 24 GB de VRAM para acomodar los pesos, el KV cache y las activaciones, por lo que cabe en una RTX 4090 con margen limitado para contextos cortos.
- GPUs recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB, y GPUs Blackwell (la model card menciona "blackwell").
- Opciones de despliegue: FreeToken (formato FTW). No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Tamano | Rendimiento |
|---|---|---|---|---|---|---|
| JoyFox-Qwen3.6-35B-A3B-RP-Aggressive-NVFP4-ftw | 35B-A3B | no disponible | Apache-2.0 | FTW (FreeToken) | ~19,5 GiB | no disponible |
| JoyFox-Qwen3.6-35B-A3B-RP-Aggressive (BF16) | 35B-A3B | no disponible | Apache-2.0 | BF16 | ~67 GiB | no disponible |
| Otros modelos similares | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint FTW/FreeToken: no es un modelo estandar de Transformers, por lo que requiere FreeToken para cargarse e inferirse.
- Vision y MTP eliminados: el modelo es solo texto y no incluye prediccion multi-token.
- Diferencias por cuantizacion: la cuantizacion NVFP4 introduce un error relativo RMS medio del 9,487% en los tensores cuantizados, lo que puede causar pequenas diferencias de comportamiento frente al modelo BF16 original.
- Modo thinking verboso: el modo de razonamiento puede generar respuestas muy largas; se recomienda desactivarlo para chat y roleplay.
- Tool calling no evaluado: la capacidad de llamada a herramientas no fue sometida a pruebas exhaustivas.
- Idiomas limitados: solo ingles y chino.
- Sesgos y alucinaciones: no se documentan sesgos especificos, pero al ser un modelo de lenguaje generativo, existe riesgo de alucinacion.
- Licencia: Apache-2.0 permite uso comercial, pero al ser un derivado cuantizado de un finetune, se recomienda revisar la licencia del modelo base.

## Enlaces

- Modelo cuantizado: https://huggingface.co/hoisd/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive-NVFP4-ftw
- Modelo base: https://huggingface.co/joyfox/JoyFox-Qwen3.6-35B-A3B-RP-Aggressive
