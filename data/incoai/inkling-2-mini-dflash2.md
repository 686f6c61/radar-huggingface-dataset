# incoai/Inkling-2-Mini-DFlash2

## Resumen

Inkling-2-Mini-DFlash2 es un modelo borrador (draft model) para decodificacion especulativa, desarrollado por Inco AI como complemento del modelo objetivo `thinkingmachines/Inkling-2-Mini`. No es un modelo de lenguaje autonomo: se ejecuta dentro de un servidor de decodificacion especulativa (SGLang) y su funcion es proponer bloques de tokens que el modelo objetivo verifica despues. Su arquitectura se basa en difusion de bloques (block diffusion), una variante de DFlash 2 que predice un bloque completo de tokens en una sola pasada y conserva los mejores candidatos en cada posicion.

El modelo cuenta con 494.983.424 parametros (aproximadamente 495 millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. Su relevancia radica en que acelera la inferencia del modelo objetivo sin alterar su distribucion de muestreo: la verificacion por parte del modelo objetivo preserva la fidelidad estadistica, mientras que el borrador aporta ganancias de throughput de hasta 2,77x en concurrencia 1 y 1,92x en concurrencia 32 segun las mediciones publicadas por el autor.

La innovacion principal es el uso de convoluciones dinamicas de dos tomas (two-tap dynamic convolutions) en el backbone, que evitan la degradacion de la calidad del borrador hacia el final del bloque, junto con un selector ligero que traza una ruta coherente entre los candidatos por posicion. Esta pensado para despliegues en produccion que ya sirven Inkling-2-Mini y quieren reducir latencia sin reentrenar el modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Block diffusion (DFlash 2) sobre backbone tipo transformer con convoluciones dinamicas de dos tomas; modelo borrador para decodificacion especulativa |
| Parametros totales | 494.983.424 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DFlash 2 es un borrador de difusion de bloques para decodificacion especulativa. En lugar de generar tokens de forma autorregresiva, predice un bloque completo de tokens en una sola pasada y mantiene los mejores candidatos en cada posicion del bloque; un selector ligero recorre despues esos candidatos para trazar una unica ruta coherente. El backbone incorpora convoluciones dinamicas de dos tomas que evitan que la calidad del borrador decaiga hacia el final del bloque, un problema habitual en los drafters de difusion. La verificacion contra el modelo objetivo garantiza que se preserve la distribucion de muestreo del modelo principal, de modo que la aceleracion no introduce sesgo en la generacion.

El modelo se distribuye como un fine-tune del modelo base `thinkingmachines/Inkling-2-Mini` y esta disenado especificamente para integrarse con el algoritmo `DFLASH` de SGLang. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; estos datos figuran como no disponibles. La evaluacion publicada se realizo con tamano de bloque de especulacion 8 (7 tokens borrador por paso de verificacion), FlashAttention 4 para la atencion del objetivo y del borrador, y los parametros de muestreo oficiales de Inkling-2-Mini (temperatura 1.0, top-p 1.0, top-k desactivado) con esfuerzo de razonamiento por defecto y un maximo de 4096 tokens nuevos.

## Capacidades

- Generacion de tokens borrador para decodificacion especulativa: propone bloques de 7 tokens que el modelo objetivo verifica en cada paso.
- Prediccion paralela de bloques mediante difusion, con retencion de multiples candidatos por posicion.
- Seleccion de ruta coherente entre candidatos mediante un selector ligero.
- Preservacion de la distribucion de muestreo del modelo objetivo gracias a la verificacion.
- Integracion con SGLang mediante el algoritmo `DFLASH` y el parche de compatibilidad incluido (`sglang_inkling_dflash2.py`).
- Compatibilidad con FlashAttention 4 en la atencion del borrador y del objetivo.
- No soporta tool calling, agentes, vision ni audio por si mismo: hereda las capacidades del modelo objetivo unicamente a traves del proceso de verificacion.
- Capacidades multilingues: no disponibles de forma independiente; dependen del modelo objetivo.

## Casos de uso

- Servicio de inferencia de baja latencia para Inkling-2-Mini: desplegar el borrador junto al modelo objetivo en SGLang para reducir el tiempo por token en cargas interactivas, con una mejora medida de 2,68x en GSM8K a concurrencia 1.
- Chat multi-turno en produccion: el borrador acelera la generacion en MT-Bench (2,03x a concurrencia 1) manteniendo la distribucion de muestreo del modelo principal, lo que lo hace adecuado para asistentes conversacionales.
- Generacion de codigo asistida: con 2,50x de aceleracion en HumanEval y 2,77x en MBPP a concurrencia 1, encaja en IDE y herramientas de autocompletado donde la latencia es critica.
- Razonamiento matematico por lotes: en MATH-500 alcanza 525,8 tok/s a concurrencia 1 y 2.855,4 tok/s a concurrencia 32, util para pipelines de evaluacion o sintesis de datos.
- Despliegue de alto throughput: a concurrencia 32 mantiene ganancias de 1,48x a 1,92x frente a decodificacion autorregresiva, adecuado para servir APIs con muchos usuarios concurrentes en una sola GPU H200.
- Sustitucion de MTP (DSpark): el borrador supera al MTP integrado de Inkling-2-Mini en longitud de aceptacion en todas las tareas medidas (por ejemplo, 4,96 frente a 3,52 en GSM8K), por lo que es una alternativa directa cuando ya se usa MTP.
- Optimizacion de costes en inferencia: al reducir el numero de pasos de verificacion necesarios por token aceptado, disminuye el coste computacional por peticion en entornos con GPU de gama alta.

## Benchmarks y rendimiento

Longitud de aceptacion (media por peticion de tokens de completado dividida entre pasos de verificacion; mayor es mejor):

| Tarea | MTP (DSpark) | DFlash 2 |
|---|---:|---:|
| GSM8K | 3,52 | 4,96 |
| MATH-500 | 3,47 | 4,97 |
| HumanEval | 3,66 | 4,80 |
| MBPP | 3,49 | 4,88 |
| MT-Bench | 2,95 | 3,90 |

Throughput a concurrencia 1 (tokens de salida por segundo; entre parentesis, speedup frente a autorregresivo):

| Tarea | Autorregresivo | MTP (DSpark) | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 180,1 | 375,0 (2,08x) | 482,1 (2,68x) |
| MATH-500 | 190,5 | 375,7 (1,97x) | 525,8 (2,76x) |
| HumanEval | 190,2 | 374,7 (1,97x) | 475,9 (2,50x) |
| MBPP | 181,7 | 393,8 (2,17x) | 503,4 (2,77x) |
| MT-Bench | 190,7 | 297,6 (1,56x) | 387,3 (2,03x) |

Throughput a concurrencia 8:

| Tarea | Autorregresivo | MTP (DSpark) | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 851,1 | 1.100,8 (1,29x) | 1.452,2 (1,71x) |
| MATH-500 | 919,4 | 1.157,5 (1,26x) | 1.522,3 (1,66x) |
| HumanEval | 879,3 | 1.136,8 (1,29x) | 1.425,4 (1,62x) |
| MBPP | 845,1 | 1.160,3 (1,37x) | 1.524,6 (1,80x) |
| MT-Bench | 847,3 | 893,7 (1,05x) | 1.158,3 (1,37x) |

Throughput a concurrencia 32:

| Tarea | Autorregresivo | MTP (DSpark) | DFlash 2 |
|---|---:|---:|---:|
| GSM8K | 1.462,1 | 2.049,9 (1,40x) | 2.582,1 (1,77x) |
| MATH-500 | 1.577,1 | 2.173,1 (1,38x) | 2.855,4 (1,81x) |
| HumanEval | 1.522,0 | 2.120,9 (1,39x) | 2.686,1 (1,76x) |
| MBPP | 1.516,0 | 2.230,1 (1,47x) | 2.908,4 (1,92x) |
| MT-Bench | 1.494,8 | 1.713,7 (1,15x) | 2.206,8 (1,48x) |

Las mediciones se realizaron en una unica NVIDIA H200 con SGLang, tamano de bloque de especulacion 8, FlashAttention 4 y los parametros de muestreo oficiales de Inkling-2-Mini.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio ocupa 1,0 GB en safetensors, por lo que los pesos del borrador caben holgadamente en cualquier GPU moderna, pero el consumo total depende del modelo objetivo y del backend de atencion.
- GPU recomendadas: NVIDIA H200 (configuracion usada en la evaluacion oficial). Al requerir FlashAttention 4, se recomienda hardware Hopper o superior para reproducir los resultados publicados.
- Cabe en GPU de consumo: los pesos del borrador por si solos si caben en GPUs consumer, pero la viabilidad del despliegue depende del modelo objetivo Inkling-2-Mini y del soporte de FlashAttention 4 en la GPU concreta; no disponible para configuraciones consumer.
- Opciones de despliegue: SGLang con la imagen oficial `lmsysorg/sglang:inkling-2-mini` y el parche de compatibilidad `sglang_inkling_dflash2.py`. Se invoca con `--speculative-algorithm DFLASH`, `--speculative-draft-model-path incoai/Inkling-2-Mini-DFlash2`, `--speculative-num-draft-tokens 8` y backend de atencion `fa4` para objetivo y borrador.
- Latencia y throughput estimados: ver tabla de benchmarks; a concurrencia 1 se alcanzan entre 387,3 y 525,8 tok/s segun la tarea, y a concurrencia 32 entre 2.206,8 y 2.908,4 tok/s en una H200.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-DFlash2 | Borrador de difusion de bloques (DFlash 2) | 494.983.424 | no disponible | Apache 2.0 | Hugging Face, integracion SGLang |
| MTP (DSpark) de Inkling-2-Mini | Borrador integrado multi-token prediction | no disponible | no disponible | la del modelo base | Integrado en Inkling-2-Mini |
| Decodificacion autorregresiva (sin borrador) | Linea base | la del modelo objetivo | la del modelo objetivo | la del modelo objetivo | Cualquier backend compatible |

En las tareas medidas, DFlash 2 supera al MTP integrado en longitud de aceptacion (4,96 frente a 3,52 en GSM8K; 4,97 frente a 3,47 en MATH-500; 4,80 frente a 3,66 en HumanEval; 4,88 frente a 3,49 en MBPP; 3,90 frente a 2,95 en MT-Bench) y en throughput en todas las concurrencias evaluadas. No se dispone de comparacion con otros borradores de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere un servidor de decodificacion especulativa y el modelo objetivo `thinkingmachines/Inkling-2-Mini`; no puede usarse para generar texto por si solo.
- Requiere SGLang con la imagen especifica y el parche de compatibilidad incluido; no funciona con transformers estandar ni con otros backends sin adaptacion.
- Depende de FlashAttention 4 para reproducir los resultados publicados; en hardware sin soporte fa4 el rendimiento puede diferir.
- Las ganancias de throughput se reducen al aumentar la concurrencia (de 2,03x-2,77x a concurrencia 1 a 1,37x-1,92x a concurrencia 32), por lo que el beneficio es mayor en cargas de baja concurrencia.
- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones de idioma del borrador; al heredar el comportamiento del modelo objetivo, estos riesgos deben evaluarse sobre Inkling-2-Mini.
- No se detallan datos de entrenamiento, composicion del dataset ni proceso de alineacion, lo que limita la evaluacion de riesgos especificos del borrador.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue esta sujeto tambien a la licencia y condiciones del modelo objetivo.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card marca `inference: false`; se trata de un artefacto de despliegue especializado, no de un modelo de uso general.

## Enlaces

- Hugging Face: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio GitHub de DFlash: https://github.com/z-lab/dflash
- Paper de DFlash (ICML 2026): referencia en la model card, sin URL directa disponible
- Parche de compatibilidad SGLang: `sglang_inkling_dflash2.py` dentro del repositorio de Hugging Face
