# Fluxmire/UtevoLux-3.6-27B-DFlash-ft

## Resumen

UtevoLux-3.6-27B-DFlash-ft es un modelo borrador (*draft model*) para decodificación especulativa, publicado por el usuario Fluxmire en HuggingFace. No es un modelo conversacional: es un acelerador que propone bloques de tokens que luego valida el modelo objetivo cont1037/UtevoLux-3.6-27B (revisión `882b3c5e`). Concretamente, es un ajuste fino del borrador z-lab/Qwen3.6-27B-DFlash, que implementa la técnica DFlash (block diffusion for flash speculative decoding) descrita en el artículo arXiv:2602.06036.

El modelo resuelve un problema muy acotado: la latencia de generación de código Three.js a partir de imágenes en el modelo objetivo UtevoLux-3.6-27B. Para ello se reentrenó el borrador original con 4.389 respuestas image-to-Three.js generadas por el propio modelo objetivo, manteniendo intacta la arquitectura (5 capas, hidden 5120, 32/8 cabezas, head_dim 128, bloque de 8 tokens, ventana deslizante de 2048 en todas las capas).

La relevancia es doble: por un lado demuestra que un ajuste fino ligero (1 época, 549 pasos) sobre un borrador genérico mejora la longitud de aceptación un 11,9 % en el dominio objetivo (de 4,729 a 5,291 tokens aceptados por bloque de 8); por otro, documenta una receta reproducible de especialización de drafters para dominios concretos. El modelo tiene 1.730.213.120 parámetros y se distribuye en safetensors bajo licencia MIT, con código personalizado que exige `trust_remote_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador DFlash (block diffusion), 5 capas, hidden 5120, 32 cabezas de atención / 8 KV heads, head_dim 128, taps del target [1,16,31,46,61], bloque de 8 tokens, ventana deslizante de 2048 en todas las capas |
| Parametros totales | 1.730.213.120 (~1,73 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Ventana deslizante de 2048 tokens por capa del borrador; contexto total heredado del modelo objetivo: no disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | No disponible (el ajuste fino se hizo exclusivamente sobre prompts de imagen y salidas de código Three.js en inglés técnico) |
| Licencia | MIT (obra derivada de z-lab/Qwen3.6-27B-DFlash, Copyright (c) 2026 Jian Chen, Yesheng Liang, Zhijian Liu) |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo conserva exactamente la arquitectura del borrador original: no hay cambios estructurales, solo pesos reentrenados. Se trata de un drafter de difusión por bloques que predice bloques de 8 tokens condicionado por *taps* intermedios del modelo objetivo en las capas [1, 16, 31, 46, 61], con atención de ventana deslizante de 2048 tokens en las 5 capas. Esta formulación permite proponer varios tokens en una sola pasada y validarlos después con el modelo grande, que es el que decide la aceptación final.

El ajuste fino partió del checkpoint de z-lab en el commit `0919688658996800f86b895034249700e9481106` (*warm start*) y se entrenó durante 1 época (549 pasos, 8 filas por paso) con LR 6e-5, warmup del 4 % y LR mínimo de 0,1x. Los datos son 4.400 respuestas image-to-Three.js generadas por el propio modelo objetivo (una respuesta por foto, temperatura 0,7, top_p 0,95, top_k 20, máximo 24.576 tokens, sin *thinking*), reducidas a 4.389 filas tras eliminar las fotos de validación. No se aplicó filtro de corrección: se usaron todas las respuestas. El checkpoint publicado es el final, `epoch_1_step_549`. No se documenta uso de RLHF ni DPO en esta fase.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa con el objetivo cont1037/UtevoLux-3.6-27B (revisión `882b3c5e`), en bloques de 8 tokens.
- Predicción especializada en código Three.js generado a partir de una imagen de entrada (escenas WebGL, geometría, materiales, iluminación).
- Mejora medida de la longitud de aceptación en el dominio de ajuste: 5,291 frente a 4,729 del borrador original (+11,9 %) sobre 150 fotos de validación (val1).
- No soporta *tool calling* ni *function calling*: es un borrador, no un modelo de instrucciones.
- No soporta agentes ni razonamiento multi-paso por sí mismo; su función es acelerar el razonamiento del modelo objetivo.
- Capacidades multilingües: no disponibles; el entrenamiento se limita a un dominio y a un estilo de salida concretos.
- Sin modo *thinking*, sin visión propia (consume representaciones del target, no imágenes de forma directa) y sin audio.

## Casos de uso

- Aceleración de un servicio de image-to-Three.js: desplegar el modelo objetivo UtevoLux-3.6-27B con SGLang usando `--speculative-algorithm DFLASH --speculative-draft-model-path <este repo> --speculative-num-draft-tokens 8` para reducir el número de pasos de verificación por bloque aceptado (5,291 de 8 tokens por bloque en val1).
- Herramienta interna de prototipado 3D: a partir de una foto de producto, generar una escena Three.js en una interfaz de diseño, donde la latencia es crítica y el volumen de peticiones justifica el coste de mantener un drafter especializado.
- Reducción de coste por token en producción: al aumentar la aceptación en el dominio image-to-code, se reducen las llamadas al modelo de 27B por token emitido, lo que baja el coste de GPU por petición en cargas sostenidas.
- Procesado por lotes de catálogos de producto: generar escenas WebGL para cientos de fotos en un pipeline offline, donde el throughput agregado importa más que la latencia individual y el drafter opera dentro del mismo dominio de entrenamiento.
- Investigación en decodificación especulativa: usar este checkpoint como referencia reproducible de ajuste de un drafter DFlash a un dominio concreto, comparando la curva de aceptación (5,287 en el paso 400, 5,291 en los pasos 500 y 549).
- Evaluación de robustez fuera de dominio: medir la caída de aceptación al usar este borrador con prompts que no sean image-to-Three.js, para decidir si conviene mantener un drafter especializado o uno genérico.
- Docencia y formación técnica: ilustrar cómo un ajuste fino de 549 pasos sobre 4.389 muestras sintéticas modifica una métrica de sistema (longitud de aceptación) sin tocar la arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). El único dato de rendimiento es la longitud de aceptación del borrador sobre validación offline:

| Drafter | val1 (150 fotos), longitud de aceptación con bloque 8 |
|---|---|
| z-lab/Qwen3.6-27B-DFlash (original) | 4,729 |
| Este modelo (paso 549) | 5,291 (+11,9 %) |

Datos adicionales aportados por el autor:

| Comprobación | Resultado |
|---|---|
| val1, paso 400 | 5,287 |
| val1, paso 500 | 5,291 |
| val1, paso 549 (checkpoint publicado) | 5,291 |
| val2 (solo checkpoint del paso 500) | 5,235 frente a 4,680 del original |
| val2 del checkpoint final | No realizada |
| A/B de velocidad en servidor real | No realizado |

## Requisitos de hardware

- Pesos en bf16/fp16: 1.730.213.120 parámetros × 2 bytes ≈ 3,46 GB (el repositorio ocupa 3,5 GB); en memoria de GPU, contando activaciones y buffers de atención, cabe holgadamente en 4-5 GB de VRAM.
- Cuantización: al no haber GGUF ni cuantizaciones oficiales, las estimaciones son orientativas; en 8 bits rondaría 1,8-2 GB y en 4 bits alrededor de 1 GB, pero requeriría convertir los pesos por cuenta propia.
- GPU consumer: sí cabe en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y RTX 4090. Hay que tener en cuenta que debe convivir en memoria con el modelo objetivo de 27B, lo que en consumer exige cuantizar el target.
- GPU de datacenter: A100 40/80 GB, H100, L40S; el drafter es marginal en el presupuesto de VRAM frente al modelo de 27B.
- Despliegue: la model card solo documenta SGLang con el algoritmo DFLASH. No se documenta soporte en vLLM, TGI, llama.cpp u Ollama para este checkpoint concreto. Existe un port GGUF de DFlash (Luce DFlash, orientado a Qwen3.5-27B) que no está verificado para estos pesos.
- Latencia y throughput: no publicados para este checkpoint. Como referencia externa no verificada, el vídeo sobre Luce DFlash reporta hasta 207 tok/s con Qwen3.5-27B en una RTX 3090; no es un dato de este modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| UtevoLux-3.6-27B-DFlash-ft (este) | Drafter DFlash ajustado a image-to-Three.js | 1,73 B | Ventana deslizante 2048 por capa; total no disponible | Aceptación val1 5,291 (bloque 8) | MIT | HuggingFace, safetensors + custom_code |
| z-lab/Qwen3.6-27B-DFlash | Drafter DFlash genérico (modelo base) | Misma arquitectura (5 capas, hidden 5120) | Ventana deslizante 2048 por capa | Aceptación val1 4,729 | MIT | HuggingFace |
| cont1037/UtevoLux-3.6-27B | Modelo objetivo (no es drafter) | 27 B (según denominación) | No disponible | No es comparable: es el verificador | No disponible en la información | HuggingFace, revisión `882b3c5e` |
| EAGLE-3, Medusa y otros drafters | Borradores de decodificación especulativa | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el ajuste se hizo solo con 4.389 respuestas image-to-Three.js del propio modelo objetivo. Fuera de ese dominio, la longitud de aceptación debería degradarse hacia el comportamiento del borrador original o por debajo; no se publican medidas de esa caída.
- Datos sintéticos sin filtro de corrección: se usaron todas las respuestas del target, incluidos posibles errores. Esto puede reforzar sesgos y errores sistemáticos del modelo objetivo (riesgo de autodestilación) y no garantiza calidad del código generado, solo su aceptación.
- Validación incompleta: el checkpoint final no se evaluó en val2 y no se realizó un A/B de velocidad en servidor real, por lo que la mejora de 11,9 % está medida solo offline en una partición de 150 fotos.
- Acoplamiento al target: funciona con cont1037/UtevoLux-3.6-27B en la revisión `882b3c5e`. Cambiar de revisión o de modelo objetivo invalida los taps y reduce drásticamente la aceptación.
- Uso standalone desaconsejado: es un borrador de difusión por bloques, no un modelo de chat; usarlo como generador independiente produce salidas sin garantías de coherencia.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar en producción.
- Idiomas y sesgos: no hay información sobre cobertura multilingüe ni evaluación de sesgos; el entrenamiento se limita a texto técnico en inglés y a un tipo de imagen concreto.
- Licencia MIT: permite uso comercial y modificaciones, pero exige conservar el aviso de copyright y el archivo `NOTICE` del trabajo original de z-lab; no es una release oficial de z-lab.
- Métricas de aceptación no equivalen a calidad: una mayor longitud de aceptación acelera la inferencia, pero no dice nada sobre la corrección del código Three.js resultante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fluxmire/UtevoLux-3.6-27B-DFlash-ft
- Modelo base (drafter original): https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Modelo objetivo del ajuste: https://huggingface.co/cont1037/UtevoLux-3.6-27B
- Repositorio relacionado del mismo autor: https://huggingface.co/Fluxmire/UtevoLux-3.6-27B
- Borrador DFlash del mismo autor: https://huggingface.co/Fluxmire/Qwen3.6-27B-DFlash
- Artículo DFlash: https://arxiv.org/abs/2602.06036
- Vídeo sobre el port GGUF de DFlash (Luce DFlash, no específico de este checkpoint): https://www.youtube.com/watch?v=vbPGvvSB8IQ
