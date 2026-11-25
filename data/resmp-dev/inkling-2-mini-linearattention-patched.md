# RESMP-DEV/Inkling-2-Mini-LinearAttention-Patched

## Resumen

Inkling-2-Mini-LinearAttention-Patched es un artefacto experimental publicado por RESMP-DEV que modifica estructuralmente el modelo base `thinkingmachines/Inkling-2-Mini`. Concretamente, sustituye dos capas de atención completa (las capas 11 y 17) por una recurrencia no lineal basada en regla delta con compuertas (`gated_delta`), un operador de atención lineal con estado de tamano constante. El resto de los pesos del modelo base se preserva bit a bit, incluidas las capas de atención completa 5 y 23 y todas las capas de ventana deslizante.

El checkpoint **no ha sido entrenado**. Los nuevos parametros (227.472 en total, 113.736 por capa parcheada) estan en sus valores de inicializacion, y la compuerta de salida esta inicializada a cero, de modo que el parche funciona como una ablacion de atención hasta que se entrene. El autor lo publica unicamente para que el parche y su ruta de recuperacion puedan inspeccionarse, reproducirse y entrenarse por terceros. La calidad es peor que la del modelo base por la cantidad medida en la model card.

El modelo base es un transformer MoE con arquitectura `inkling2_loop` de 24 capas fisicas, un nucleo de bucle en las capas 6 a 17 que se ejecuta tres veces por forward, y 26.384.726.416 parametros totales. El interes de este artefacto es metodologico: demuestra un procedimiento de retrofit estructural con verificacion tensor a tensor y una ruta de entrenamiento (CPT, SFT, GRPO) documentada pero no ejecutada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer MoE con nucleo de bucle; capas 11 y 17 sustituidas por recurrencia `gated_delta`) |
| Parametros totales | 26.384.726.416 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (artefacto desquantizado y entrenable); el base esta en NVFP4/MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con modulo de codigo remoto `modeling_inkling2_loop_patched.py`) |

## Arquitectura y entrenamiento

El modelo base `inkling2_loop` consta de 24 capas fisicas con un nucleo de bucle que abarca las capas 6 a 17 y se ejecuta tres veces por forward, de modo que las capas parcheadas 11 y 17 se visitan en las posiciones 11/29/41 y 17/35/47. El parche reemplaza unicamente las dos capas de atención completa por un operador `gated_delta`: una recurrencia con regla delta y compuertas, con estado de tamano constante y complejidad lineal en longitud de secuencia. El operador reutiliza los `q_proj`, `k_proj`, `v_proj` y `o_proj` del modelo base bit a bit, asi como las convoluciones cortas y las normas, pero descarta el sesgo de posicion relativa, los sumideros de atención aprendidos y la normalizacion de query con escala logaritmica. El estado de recurrencia se reinicia al inicio de cada visita (`state_mode: reset`). El chunking del operador es de 64, con `delta_decay_init` de -0.1053605 y `delta_beta_init` de 0.0.

No se ejecuto ningun paso de entrenamiento: ni continued pretraining, ni SFT, ni RL. La ruta de recuperacion prevista (`training/inkling_patch/heal.py`) incluye tres etapas (CPT, SFT, GRPO) con telemetria y reanudacion de checkpoints, y dado que el modelo de 26B no cabe en dos tarjetas de 24 GiB con AdamW de parametros completos (53 GB de pesos BF16 y unos 370 GB de estado del optimizador), la configuracion usa LoRA sobre las proyecciones de atención parcheadas mas los nuevos parametros del parche, siempre entrenables. El conversor verifico 1107 tensores preservados con diferencia absoluta maxima de 0.0, 12 tensores anadidos y 8 eliminados, y confirmo que el artefacto recargado desde el Hub produce logits identicos.

## Capacidades

- El artefacto hereda la interfaz `image-text-to-text` y la pipeline conversacional del modelo base, pero al no estar entrenado no debe considerarse funcional para ninguna tarea.
- El modelo base soporta entrada de imagen y texto; el parche no altera esa ruta.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidad especial del parche: atención lineal con estado constante en las capas 11 y 17, con estado reiniciado por visita al bucle.

## Casos de uso

- Investigacion sobre atención lineal: el artefacto sirve para estudiar como se comporta una recurrencia `gated_delta` insertada en un transformer preentrenado, midiendo la perdida de cross-entropy frente al base antes y despues de la fase de curacion.
- Reproduccion de retrofits estructurales: el manifiesto `patch_manifest.json` y el modulo de codigo remoto permiten reproducir el procedimiento de sustitucion de capas con verificacion tensor a tensor, util como plantilla para otros modelos.
- Ablacion controlada de atención: al inicializar la compuerta de salida a cero, el parche actua como una ablacion limpia de las capas 11 y 17, permitiendo medir la contribucion de esas capas al comportamiento del modelo base.
- Entrenamiento de recuperacion: investigadores con recursos pueden ejecutar el arnes `heal.py` con las etapas CPT, SFT y GRPO para evaluar si la recurrencia lineal recupera la calidad del base tras el ajuste.
- Estudio de eficiencia en inferencia: la recurrencia es lineal en longitud de secuencia por construccion, lo que permite comparar coste de memoria y throughput frente a la atención completa una vez entrenada (el autor no aporta mediciones).
- Docencia y formacion: ejemplo documentado de como modificar la arquitectura de un modelo de 26B sin reentrenar desde cero, con trazabilidad completa de tensores preservados y descartados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta mediciones de dano en cross-entropy (nats, muestras de 512 tokens, calculadas con el propio desplazamiento de etiquetas del modelo sobre el artefacto BF16):

| Variante | Texto de model card | Prosa en ingles |
|---|---|---|
| Base `thinkingmachines/Inkling-2-Mini` | 1.389 | 0.258 |
| Este artefacto (`gated_delta`, salida con compuerta a cero) | 1.448 | 0.457 |
| Artefacto hermano (`latent_kv`, SVD rango 512) | 1.418 | 0.261 |

El autor advierte explicitamente que estas cifras son medidas de dano sobre dos muestras cortas, no una evaluacion de calidad, y que no dicen nada sobre el comportamiento tras la curacion. No se midio el coste en tiempo de ejecucion de las capas parcheadas en ningun acelerador.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia, el repo ocupa 52,8 GB en safetensors BF16 (pesos de 26,38B parametros), por lo que en BF16 requiere del orden de 53 GB de VRAM solo para pesos, mas cache KV.
- GPU recomendadas: no disponibles en la informacion proporcionada. El autor senala que el modelo de 26B no cabe en dos tarjetas de 24 GiB para entrenamiento con AdamW de parametros completos.
- Cabe en GPU de consumo: no en BF16; requeriria cuantizacion (no se documentan formatos GGUF ni cuantizaciones alternativas en el repo).
- Opciones de despliegue: `transformers` 5.24.1 o superior con `trust_remote_code=True` y `AutoModelForImageTextToText`; el modulo remoto `modeling_inkling2_loop_patched.py` es autocontenido. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no aporta mediciones de coste en ningun acelerador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Estado |
|---|---|---|---|---|---|
| Este artefacto | 26,38B | no disponible | `inkling2_loop` con 2 capas `gated_delta` | Apache 2.0 | Experimental, sin entrenar |
| `thinkingmachines/Inkling-2-Mini` (base) | 26,38B | no disponible | `inkling2_loop` con atención completa | no disponible | Entrenado |
| Artefacto hermano `latent_kv` | 26,38B | no disponible | `inkling2_loop` con MLA de rango latente 512 | no disponible | Experimental, sin entrenar |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El checkpoint no esta entrenado: los parametros que difieren del base estan inicializados, no aprendidos. No debe usarse en produccion.
- La calidad es peor que la del modelo base, con cross-entropy de 1.448 frente a 1.389 en texto de model card y 0.457 frente a 0.258 en prosa inglesa.
- La compuerta de salida esta a cero, por lo que las capas parcheadas no contribuyen nada hasta que se entrene; el artefacto es funcionalmente una ablacion de atención.
- Se pierden el sesgo de posicion relativa, los sumideros de atención aprendidos y la normalizacion de query con escala logaritmica de las capas 11 y 17; recuperar esa funcionalidad es precisamente el objetivo de la fase de curacion.
- Las cifras de cross-entropy son medidas de dano sobre dos muestras cortas, no una evaluacion de calidad.
- No se midio el coste en tiempo de ejecucion en ningun acelerador; no hay cifras de throughput ni memoria.
- No hay datos sobre sesgos, alucinacion, limitaciones de contexto o idioma del modelo base en la informacion proporcionada.
- Requiere `transformers` 5.24.1 o superior y `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de entrenamiento hacen inviable ese uso en la practica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RESMP-DEV/Inkling-2-Mini-LinearAttention-Patched
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Manifiesto del parche: `patch_manifest.json` en el repositorio del modelo
- Runbook de recuperacion: `training/inkling_patch/RUNBOOK.md` en el repositorio del modelo
- Script de curacion: `training/inkling_patch/heal.py` en el repositorio del modelo
