# hipfire-models/daisyrose-27b

## Resumen

DaisyRose-27B es un modelo de lenguaje de 27 mil millones de parámetros desarrollado por RadixArk, fruto de un post-entrenamiento con aprendizaje por refuerzo (RL) sobre Qwen3.8-27B, orientado a tareas de agente de horizonte largo. Esta ficha describe concretamente los artefactos cuantizados publicados por hipfire-models para hipfire, el motor de inferencia nativo en Rust para GPUs AMD. No se trata del modelo original en BF16, sino de una cuantización MQ4V2 acompañada de una cabeza de decodificación especulativa MTP.

El modelo conserva la arquitectura de Qwen3.8-27B, descrita por el autor como un transformer denso híbrido (`qwen3_5`) que combina capas DeltaNet con capas de atención completa, 64 capas en total y una capa MTP (multi-token prediction). Esa arquitectura es la que permite que hipfire lo ejecute por la misma ruta que la familia Qwen3.5 sin cambios en el motor.

Su relevancia es doble: por un lado, ofrece un modelo de 27B afinado para razonamiento y uso agéntico; por otro, demuestra el ecosistema de cuantización y decodificación especulativa sobre hardware AMD RDNA (gfx1201), un nicho tradicionalmente menos cubierto que el de NVIDIA. La cuantización publicada no está calibrada con AWQ, lo que el propio autor advierte que eleva la divergencia KL respecto a la versión calibrada de Qwen3.8-27B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido `qwen3_5` (DeltaNet + atención completa), 64 capas, 1 capa MTP |
| Parametros totales | 27B (heredados de Qwen3.8-27B; no se detalla desglose) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MQ4V2 base tier (embeddings y lm_head en Q8, norms en F16); cabeza MTP en MQ4G256 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.mq4` (formato propietario de hipfire) + `.mtp` (cabeza especulativa) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B: un transformer denso híbrido que alterna capas DeltaNet (atención lineal con estado recurrente) y capas de atención completa, organizadas en 64 capas, más una capa MTP dedicada a decodificación especulativa. RadixArk aplicó un post-entrenamiento con RL sobre esa base para tareas de agente de horizonte largo, según indica el blog del autor; no se especifican en la información disponible el volumen de tokens, la composición del dataset ni los detalles del algoritmo de RL (RLHF, DPO u otro).

Los artefactos de hipfire-models son una cuantización de los pesos BF16 originales, no un reentrenamiento: se elimina la torre de visión y se genera un fichero MQ4V2 de 15,66 GB más una cabeza MTP de 215 MiB. La cuantización es la tier base sin calibración AWQ, por lo que no incluye sidecars de escalas de activación y el autor anticipa una KLD algo superior a la del fichero equivalente de Qwen3.8-27B. La innovación operativa destacable es el uso de la cabeza MTP para decodificación especulativa con K=3, que en las mediciones del autor casi duplica el throughput de decodificación.

## Capacidades

- Generación de texto y razonamiento: el modelo razona primero en un bloque de pensamiento (`think block`), igual que Qwen3.8, antes de emitir la respuesta final.
- Razonamiento de horizonte largo y tareas agénticas: es el objetivo declarado del post-entrenamiento con RL de RadixArk.
- Generación de código: validado por el autor con prompts de funciones cortas en Python.
- Decodificación especulativa MTP: soporta modo autoregresivo y modo MTP K=3 con salida idéntica a nivel de token en las pruebas realizadas.
- Escritura de prosa: probado con prompts de aproximadamente 120 palabras.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Visión: no soportada; la torre de visión se omite en esta cuantización y el autor la describe como text-only.

## Casos de uso

- Agentes de múltiples pasos en producción: el modelo fue post-entrenado con RL específicamente para tareas de agente de horizonte largo, de modo que puede encadenar razonamiento y acciones dentro de un mismo bloque de pensamiento antes de responder.
- Generación de código asistida: validado con prompts de funciones cortas en Python; encaja en tareas de autocompletado de funciones y generación de utilidades dentro de pipelines de desarrollo.
- Razonamiento sobre preguntas con trampa: el autor lo evaluó con prompts de trick-question reasoning, un escenario típico de validación de robustez lógica en asistentes.
- Escritura controlada de prosa: útil para generación de textos de longitud media (en torno a 120 palabras en las pruebas), aunque requiere margen de tokens por el bloque de pensamiento.
- Despliegue en estaciones de trabajo AMD: al ejecutarse sobre hipfire con un fichero de 15,66 GB, permite servir un modelo de 27B en GPUs RDNA sin depender de CUDA.
- Servicio de inferencia con latencia reducida: con MTP K=3 el throughput medido sube de unos 34 a unos 60 tok/s en una R9700, adecuado para aplicaciones interactivas con un solo usuario o baja concurrencia.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de la falta de calibración AWQ frente a la versión calibrada de Qwen3.8-27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta mediciones de throughput en una GPU AMD R9700 (gfx1201), en modo greedy, con caché KV en `q8` y una única sesión del daemon:

| Modo | Decodificación (tok/s) | Notas |
|---|---:|---|
| Autoregresivo (AR) | ~34 | Referencia |
| MTP K=3 (τ ≈ 2,0–2,3) | ~60 | Salida idéntica a nivel de token que AR en todos los prompts |

Los prompts empleados fueron cuatro: factual, razonamiento con pregunta trampa, función corta en Python y prosa de unas 120 palabras. Las comprobaciones de attractor (ratio de tokens únicos, frecuencia máxima de token en los primeros y últimos 128 tokens, repetición de 3-gramas) resultaron limpias en todas las filas.

## Requisitos de hardware

- VRAM estimada: el fichero MQ4V2 ocupa 15,66 GB y la cabeza MTP 215 MiB; hay que sumar la caché KV en `q8` y el overhead del runtime, por lo que se recomienda un mínimo práctico en torno a 18-20 GB de VRAM (estimación, no dato publicado).
- GPU validadas: AMD Radeon R9700 (gfx1201) es la única plataforma con mediciones publicadas.
- Compatibilidad: el motor hipfire está orientado a GPUs AMD RDNA; no se menciona soporte para NVIDIA ni para GPUs de consumo de gama baja.
- Cabe en GPU de consumo: no disponible con certeza; el tamaño de pesos excede los 16 GB, lo que descarta tarjetas de 16 GB o menos en la práctica.
- Opciones de despliegue: exclusivamente hipfire (`hipfire pull daisyrose:27b`, `hipfire run daisyrose:27b`); no se publican artefactos GGUF, safetensors ni compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~34 tok/s en AR y ~60 tok/s con MTP K=3 en R9700, según las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / motor | Notas |
|---|---|---:|---|---|---|
| hipfire-models/daisyrose-27b | 27B denso | No disponible | Apache-2.0 | `.mq4` + `.mtp` / hipfire | Cuantización sin calibrar AWQ; ~60 tok/s con MTP en R9700 |
| hipfire-models/qwen3.8-27b | 27B denso | No disponible | Apache-2.0 (presumible, no confirmado) | `.mq4` / hipfire | Misma base arquitectónica, con sidecars AWQ; el autor espera menor KLD que daisyrose-27b |
| RadixArk/DaisyRose-27B | 27B denso | No disponible | Apache-2.0 | BF16 (Hugging Face) | Modelo original con torre de visión; referencia de calidad frente a la cuantización |
| Qwen/Qwen3.8-27B | 27B denso | No disponible | No disponible | BF16 | Modelo base del que deriva toda la familia; sin post-entrenamiento RL para agentes |

## Limitaciones y advertencias

- Cuantización no calibrada: el fichero `.mq4` es la tier base MQ4V2 sin sidecars de escalas de activación AWQ, por lo que el autor advierte de una KLD superior a la del fichero equivalente de Qwen3.8-27B y de que podría sustituirse por una build calibrada bajo el mismo nombre.
- Sin visión: la torre de visión se omite; el modelo es exclusivamente de texto.
- Formato propietario: los pesos solo son utilizables con hipfire; no hay GGUF, safetensors ni rutas estándar de despliegue.
- Dependencia de hardware AMD: las únicas mediciones publicadas son en R9700 (gfx1201); el rendimiento en otras GPUs no está documentado.
- Consumo de tokens en el bloque de pensamiento: igual que Qwen3.8, el modelo razona primero; en tareas de escritura con límite de longitud puede gastar un presupuesto elevado contando palabras, por lo que conviene darle margen.
- Idiomas soportados no documentados: no se puede garantizar calidad fuera de los idiomas evaluados por el autor.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgo ni de tasa de alucinación en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero se hereda de RadixArk/DaisyRose-27B y, en última instancia, de Qwen/Qwen3.8-27B; conviene verificar las condiciones de la cadena completa antes de desplegar en producción.
- Madurez del artefacto: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la versión publicada podría reemplazarse por una build calibrada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hipfire-models/daisyrose-27b
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Blog de RadixArk sobre DaisyRose-27B: https://www.radixark.com/blog/daisyrose-27b
- Motor hipfire: https://github.com/warpfront/hipfire
- Cuantización de referencia Qwen3.8-27B: https://huggingface.co/hipfire-models/qwen3.8-27b
