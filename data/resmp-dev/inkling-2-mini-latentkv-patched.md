# RESMP-DEV/Inkling-2-Mini-LatentKV-Patched

## Resumen

Inkling-2-Mini-LatentKV-Patched es un artefacto experimental publicado por RESMP-DEV sobre el modelo base `thinkingmachines/Inkling-2-Mini`, un modelo multimodal de tipo image-text-to-text con arquitectura MoE. Este checkpoint no es un modelo entrenado: es una retroadaptación estructural (retrofit) en la que las proyecciones de claves y valores de dos capas de atención completa (capas 11 y 17) se factorizan a través de un latente de rango 512, siguiendo un esquema de atención latente al estilo MLA. El resto de los pesos del modelo base se conserva bit a bit.

El interés técnico del artefacto es acotado pero real: sirve como prueba de concepto reproducible de cómo sustituir atención completa por atención latente de bajo rango en una arquitectura con bucles (`inkling2_loop`, 24 capas físicas con un núcleo de bucle que se repite tres veces), preservando exactamente el resto de la red y documentando el daño medido en entropía cruzada. El autor advierte explícitamente de que el modelo no ha pasado por ninguna etapa de entrenamiento (ni CPT, ni SFT, ni RL) y de que su calidad es peor que la del modelo base.

Con 26.390.870.064 parámetros totales y un repositorio de 52,9 GB en BF16, el checkpoint está pensado para inspección, reproducción y como punto de partida de un proceso de "healing" que el propio autor documenta pero no ha ejecutado. No es apto para producción ni para uso directo en inferencia de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (24 capas físicas, núcleo de bucle 6..17, 3 pasadas de bucle); MoE; parche de atención latente `latent_kv` en capas 11 y 17 |
| Parametros totales | 26.390.870.064 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (el checkpoint base estaba cuantizado en NVFP4/MXFP8; este artefacto está de-cuantizado y es entrenable) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con módulo de código remoto `modeling_inkling2_loop_patched.py` |
| Parametros nuevos del parche | 4.457.520 (2.228.760 por capa parcheada) |
| Rango latente | 512 |
| Capas parcheadas | 11 y 17 (ambas de atención completa) |
| Capas de atención completa intactas | 5 y 23, más todas las de ventana deslizante |
| Precisión | BF16 |
| Librería requerida | transformers >= 5.24.1 |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura `inkling2_loop`: 24 capas físicas con un núcleo de bucle que abarca las capas 6 a 17 y se ejecuta tres veces por forward, de modo que las capas parcheadas 11 y 17 se visitan en las posiciones 11/29/41 y 17/35/47 respectivamente. Es un modelo MoE multimodal (image-text-to-text) con mezcla de capas de atención completa y capas de ventana deslizante. El checkpoint base original estaba distribuido en cuantización NVFP4/MXFP8; este artefacto se ha de-cuantizado a BF16 para hacerlo entrenable.

El parche sustituye las proyecciones `k_proj` y `v_proj` de las capas 11 y 17 por una proyección latente `kv_a_proj` (de tamaño oculto a rango 512) con una escala por canal `kv_a_scale`, seguida de `kv_b_k` y `kv_b_v` (de rango 512 a las dimensiones de cabeza de clave y valor). Se conservan bit a bit el `q_proj`, el `o_proj`, el sesgo de posición relativa, los sumideros de atención aprendidos, las convoluciones cortas y la salida con puerta de las capas reemplazadas. La inicialización de los factores latentes se hace por SVD truncada de las proyecciones concatenadas de clave y valor del modelo base, lo que hace que el operador parta cerca del modelo original (a diferencia de la variante hermana con recurrencia de puerta a cero). El error de reconstrucción SVD de las proyecciones reemplazadas es de 0,478/0,477 relativo para claves y 0,543/0,520 para valores en las dos muestras medidas.

No se ha ejecutado ningún paso de entrenamiento: ni continued pre-training, ni SFT, ni RL. Los parámetros nuevos están inicializados, no aprendidos. El autor documenta una ruta de "healing" en tres etapas (CPT, SFT, GRPO) mediante el arnés `training/inkling_patch/heal.py`, con configuraciones de tipo LoRA sobre las proyecciones parcheadas más los parámetros nuevos, dado que el modelo completo en BF16 (53 GB de pesos, ~370 GB de estado del optimizador con AdamW completo) no cabe en dos tarjetas de 24 GiB.

## Capacidades

- El artefacto hereda la modalidad image-text-to-text del modelo base, aunque no se documentan capacidades concretas verificadas en esta ficha.
- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`).
- Arquitectura MoE, con enrutamiento disperso (número de expertos y activos no disponibles).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

Advertencia: al no haber sido entrenado, el parche degrada la calidad respecto al modelo base y no debe considerarse una capacidad utilizable en producción.

## Casos de uso

- Investigación sobre atención latente de bajo rango: el artefacto permite inspeccionar y reproducir la sustitución de proyecciones K/V por un latente de rango 512 en una arquitectura con bucles, comparando el error de reconstrucción SVD y el daño en entropía cruzada frente al modelo base.
- Reproducción de experimentos de retrofit estructural: sirve como referencia para validar que un parche de atención preserva bit a bit el resto de tensores (1115 tensores comparados, 0 discrepancias, diferencia máxima absoluta 0,0) antes de invertir en entrenamiento.
- Punto de partida para procesos de healing: el arnés documentado (`training/inkling_patch/heal.py`) permite lanzar etapas de CPT, SFT y GRPO con LoRA sobre las proyecciones parcheadas, usando este checkpoint como inicialización.
- Estudio de eficiencia de memoria en inferencia: el operador `latent_kv` reduce el estado K/V a un latente de rango 512; aunque el autor no mide coste en acelerador, el artefacto permite instrumentar el ahorro teórico de memoria de la caché KV en las capas parcheadas.
- Comparación de estrategias de inicialización: la variante `latent_kv` con SVD truncada puede contrastarse con la variante hermana `gated_delta` (salida con puerta a cero) midiendo entropía cruzada en las mismas muestras (1,418 vs 1,448 en texto de model card; 0,261 vs 0,457 en prosa en inglés).
- Docencia y divulgación técnica: ejemplo concreto y verificable de cómo se factoriza una proyección de atención y de cómo se mide el daño de una modificación estructural antes de entrenar.
- Validación de pipelines de carga con código remoto: el checkpoint se ha recargado vía Hub con `AutoModelForImageTextToText` y `trust_remote_code=True`, produciendo logits idénticos al modelo en memoria (diferencia máxima absoluta 0,0), lo que lo convierte en un caso de prueba para flujos de despliegue con código personalizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor únicamente reporta medidas de daño en entropía cruzada (en nats, muestras de 512 tokens, con el propio desplazamiento de etiquetas del modelo, sobre el artefacto en BF16):

| Variante | Texto de model card | Prosa en inglés simple |
|---|---|---|
| Base `thinkingmachines/Inkling-2-Mini` | 1,389 | 0,258 |
| Este artefacto (`latent_kv`, SVD rango 512) | 1,418 | 0,261 |
| Artefacto hermano (`gated_delta`, salida con puerta a cero) | 1,448 | 0,457 |

Error de reconstrucción SVD de las proyecciones reemplazadas (relativo):

| Muestra | Claves | Valores |
|---|---|---|
| Muestra 1 | 0,478 | 0,543 |
| Muestra 2 | 0,477 | 0,520 |

El autor indica explícitamente que estas cifras son medidas de daño en dos muestras cortas, no una evaluación de calidad, y que no dicen nada sobre el comportamiento tras el healing. No se ha medido el coste en tiempo de ejecución de la proyección KV latente en ningún acelerador; no se reclama ninguna cifra de throughput ni de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma medida. Como referencia de tamaño, los pesos en BF16 ocupan aproximadamente 53 GB, por lo que la inferencia en BF16 requiere al menos una GPU de 80 GB (A100 80GB, H100 80GB) o reparto multi-GPU.
- GPU recomendadas: A100 80GB, H100 80GB, o configuraciones multi-GPU. No cabe en GPU de consumo (RTX 4090 de 24 GB) en BF16 sin cuantización adicional.
- Cuantización: el artefacto se distribuye en BF16; no se documentan GGUF ni otras cuantizaciones para este checkpoint concreto. El modelo base original estaba en NVFP4/MXFP8.
- Opciones de despliegue: carga vía `transformers` >= 5.24.1 con `trust_remote_code=True` y `AutoModelForImageTextToText`. No se documenta soporte verificado en vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Entrenamiento: el autor indica que el modelo de 26B no cabe en dos tarjetas de 24 GiB con AdamW de parámetros completos (53 GB de pesos BF16, ~370 GB de estado del optimizador); las configuraciones de healing usan LoRA sobre las proyecciones parcheadas más los parámetros nuevos.
- Latencia y throughput: no medidos ni reclamados por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| `RESMP-DEV/Inkling-2-Mini-LatentKV-Patched` | 26,39B | no disponible | Apache 2.0 | No entrenado (retrofit estructural) | Parche `latent_kv` en capas 11 y 17; calidad inferior al base |
| `thinkingmachines/Inkling-2-Mini` (base) | no disponible en la información | no disponible | no disponible en la información | Entrenado | Modelo base multimodal MoE `inkling2_loop`; referencia de calidad |
| Artefacto hermano `gated_delta` (RESMP-DEV) | mismo tamaño que el base | no disponible | Apache 2.0 (presumible, no confirmado) | No entrenado | Recurrencia con puerta a cero; mayor daño medido en prosa (0,457 vs 0,261) |
| Otros modelos MoE multimodales de ~26B | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas verificadas en la información proporcionada |

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los parámetros que difieren del modelo base están inicializados por SVD, no aprendidos. El autor lo califica explícitamente como no apto para producción.
- La calidad es peor que la del modelo base, con un incremento medido de entropía cruzada de 1,389 a 1,418 en texto de model card y de 0,258 a 0,261 en prosa en inglés.
- Las cifras de entropía cruzada provienen de dos muestras cortas de 512 tokens y no constituyen una evaluación de calidad ni predicen el comportamiento tras el healing.
- No se ha medido el coste en tiempo de ejecución de la proyección KV latente en ningún acelerador; no hay cifras de throughput ni de memoria.
- El error de reconstrucción SVD de las proyecciones reemplazadas es apreciable (0,478/0,477 en claves y 0,543/0,520 en valores), lo que indica que la inicialización se aleja del base en esas capas.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no evaluado; al no estar entrenado, el comportamiento generativo no está caracterizado.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su estado no entrenado lo desaconseja para cualquier despliegue real.
- Requiere `transformers` >= 5.24.1 y `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio; conviene revisar `modeling_inkling2_loop_patched.py` antes de cargarlo en entornos sensibles.
- El modelo base original está cuantizado en NVFP4/MXFP8; este artefacto está de-cuantizado a BF16, con el consiguiente aumento de tamaño (52,9 GB de repositorio).

## Enlaces

- Hugging Face: https://huggingface.co/RESMP-DEV/Inkling-2-Mini-LatentKV-Patched
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Manifiesto del parche: `patch_manifest.json` (incluido en el repositorio de pesos)
- Arnés de healing: `training/inkling_patch/heal.py` y `training/inkling_patch/RUNBOOK.md` (en el repositorio que produjo el checkpoint; no se proporciona URL directa en la información disponible)
- Papers, blogs, demos y repositorios adicionales: no disponibles en la información proporcionada.
