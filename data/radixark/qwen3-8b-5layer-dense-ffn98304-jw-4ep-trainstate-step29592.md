# RadixArk/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step29592

## Resumen

RadixArk/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step29592 es un paquete de checkpoint de entrenamiento, no un modelo listo para inferencia. Contiene el estado completo de un entrenamiento en curso sobre una variante "draft" de Qwen3-8B con cinco capas y una FFN densa de 98.304 dimensiones, exportado en el paso 29.592 (punto denominado "3ep") de un run de decodificacion especulativa. El autor lo publica como hand-off para reanudar el entrenamiento en otra maquina o como arranque en caliente solo de pesos.

El artefacto incluye pesos en bf16 (60 tensores, 6.411.240.704 parametros), shards FSDP con estado de AdamW fusionado, estado del scheduler, RNG, indices de datos por rango y la receta y configuracion del draft tal como se entrenaron. El repositorio ocupa 96,1 GB, de los cuales 84 GB corresponden al directorio de checkpoint completo y el resto al indice de datos y metadatos.

Es relevante para equipos que trabajan en decodificacion especulativa o en destilacion de modelos Qwen3: permite retomar un entrenamiento con posicion exacta de datos, optimizador y scheduler, algo poco habitual en publicaciones de checkpoints intermedios. No es un modelo para usar con `pipeline` de Hugging Face ni para despliegue directo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas con FFN de 98.304 dimensiones (draft para decodificacion especulativa, configuracion DSpark) |
| Parametros totales | 6.411.240.704 (60 tensores en bf16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos bf16 y estado fp32 del optimizador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch): `training_state.pt` y `training_state_rank{0..15}.pt`; export de solo pesos en HF como `yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep/3ep/` |
| Tamano del repositorio | 96,1 GB |
| Paso global | 29.592 |
| World size | 16 |
| Batch size / acumulacion | 3 / 3 |
| Pasos totales efectivos | 39.456 |
| Muestras consumidas | 4.261.248 (2 pasadas completas + 1.419.442 de la tercera) |
| Optimizador | AdamW fusionado, betas (0,9; 0,999), eps 1e-8, weight decay 0, grad clip 1,0 |
| Scheduler | CosineAnnealingLR, T_max 37.878, eta_min 0, warm-up lineal de 1.578 pasos (completado) |
| Learning rate en el paso 29.592 | 9,492e-5 (base 6e-4) |
| Funcion de perdida | 0,1 CE + 0,9 L1, anchors 512, gamma 7, chunk 128 |
| Precision | bf16 en pesos, fp32 en parametros maestros |

## Arquitectura y entrenamiento

El draft es un transformer denso de solo cinco capas con una FFN de 98.304 dimensiones, entrenado como modelo especulativo sobre Qwen3-8B. La configuracion se denomina DSpark y aparece en `meta/qwen3-8b-5layer-dense-98304-dspark.json`. El entrenamiento usa atencion flex, kernels Liger, sharding FSDP con `SHARD_GRAD_OP` y un objetivo combinado de entropia cruzada (peso 0,1) y perdida L1 (peso 0,9) con anchors de 512, gamma 7 y chunk 128.

Los datos provienen de `/scratch/moe8x12288/data/perfectblend_train_regen_temperature0_no_think.jsonl` (6,3 GB, 1.420.909 lineas, md5 952df94df5d1...), con `models/Qwen3-8B` como modelo objetivo. Se han consumido 4.261.248 muestras en 29.592 pasos con 144 muestras por paso, lo que equivale a dos pasadas completas y 1.419.442 muestras de la tercera (el limite de la epoca 3 esta en el paso 29.602). La semilla es 42 y `prompt_seed` 42, sin system prompt. El codigo corresponde a la rama `exp/qwen3-8b-5layer-8x1536-iso-active-1ep` del fork PR #22 en el commit f268321d.

El paquete incorpora el estado completo para reanudar: `training_state.pt` (12,8 GB) con pesos y contadores, `training_state_rank{0..15}.pt` (4,81 GB cada uno) con estado de AdamW, parametros maestros fp32, scheduler y RNG, y `data-index/rank{0..15}.txt` con los 266.328 ids de muestra por rango en orden de consumo. La reanudacion completa exige `world_size` 16 y el mismo sharding FSDP; en otra maquina sin los ledgers de `control/` el flujo de datos reiniciaria desde la epoca 0 salvo que se trasladen o se anada un skip en el productor.

## Capacidades

- No es un modelo de inferencia: el artefacto es un checkpoint de entrenamiento y no declara pipeline, licencia ni idiomas.
- Generacion de tokens como draft especulativo para acelerar la decodificacion de Qwen3-8B, sujeto a validacion por el autor.
- Reanudacion exacta de entrenamiento con optimizador, scheduler, RNG y posicion de datos.
- Arranque en caliente solo de pesos en cualquier topologia o maquina.
- Trazabilidad de datos por rango mediante indices de consumo y checksums SHA256.
- No se documentan tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Reanudacion exacta de un run de decodificacion especulativa: restaurar el directorio en `$W/outputs/<RUN>/<RUN>-step29592` en el nodo 0 con `RESUME_FROM` y relanzar con 16 rangos para continuar desde el paso 29.592 con el mismo estado de optimizador y scheduler.
- Arranque en caliente en otra topologia: usar `model.draft_checkpoint_path` apuntando a este directorio o al export `3ep/` de Hugging Face para inicializar solo pesos y contadores, redefiniendo el schedule de learning rate (por ejemplo, constante o warm-up corto a 9,5e-5 y cosine sobre los 9.864 pasos restantes).
- Investigacion en decodificacion especulativa: comparar la calidad del draft de 5 capas y FFN 98.304 frente a alternativas mas profundas o mas estrechas bajo el mismo objetivo CE+L1.
- Reproducibilidad de experimentos: los indices por rango y `SHA256SUMS` permiten auditar exactamente que muestras consumio cada rango y verificar la integridad del checkpoint.
- Migracion de infraestructura: mover el estado de un nodo con 16 GB300 a H200 de 141 GB reduciendo el batch a 1 x 9 para mantener 144 muestras por paso, teniendo en cuenta que los shards guardados siguen requiriendo 16 rangos.
- Analisis de dinamica de entrenamiento: inspeccionar el estado de AdamW, el scheduler en `last_epoch` 28.014 y el RNG para estudiar la evolucion de la perdida y del learning rate.
- Base para destilacion o ajuste fino de drafts: partir de los pesos bf16 exportados para experimentos propios de compresion o de arquitecturas draft alternativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento: perdida compuesta 0,1 CE + 0,9 L1, learning rate 9,492e-5 en el paso 29.592 y consumo de 4.261.248 muestras.

## Requisitos de hardware

- Entrenamiento original: 16 GPU GB300 de 284 GB, con 145-175 GB por GPU a batch 3.
- Alternativa en H200 de 141 GB: batch 1 x 9 para mantener 144 muestras por paso; los shards guardados siguen exigiendo 16 rangos para la reanudacion completa.
- Almacenamiento: 84 GB para el checkpoint completo mas 118 MB de indice de datos; el repositorio total ocupa 96,1 GB.
- Inferencia: no aplica como modelo independiente; el uso previsto es como draft de Qwen3-8B.
- Opciones de despliegue: no disponibles para inferencia; para entrenamiento, el arbol de codigo del fork PR #22 con FSDP y el orquestador `orchestrate.sh`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RadixArk/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step29592 | 6.411.240.704 | no disponible | Checkpoint de draft especulativo | no disponible | Hugging Face, 96,1 GB |
| yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep (export `3ep/`) | no disponible | no disponible | Solo pesos del mismo draft | no disponible | Hugging Face |
| Qwen3-8B (modelo objetivo) | no disponible en la informacion | no disponible | Modelo generativo completo | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento ni de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo desplegable: carece de pipeline, licencia e idiomas declarados, y los pesos son un draft de 5 capas, no un modelo generativo autonomo.
- La reanudacion completa exige `world_size` 16, el mismo sharding FSDP y el checkpoint legible en la misma ruta en todos los nodos.
- En otra maquina sin los ledgers de `control/`, el flujo de datos reinicia desde la epoca 0 salvo que se trasladen o se anada un skip en el productor (`SPECFORGE_RESTART_SKIP_PROMPTS` no existe en este arbol).
- El arranque solo de pesos descarta optimizador, scheduler y RNG; el schedule de learning rate debe redefinirse.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial.
- El checkpoint se publica en formato `.pt`, no en safetensors ni GGUF, lo que limita su uso con herramientas de inferencia habituales.
- Los indices de datos y checksums dependen de ficheros externos al repositorio (el JSONL de entrenamiento y los ledgers), lo que puede dificultar la reproducibilidad completa.
- El autor no documenta sesgos, tasas de alucinacion ni evaluaciones de calidad del draft.

## Enlaces

- Hugging Face: https://huggingface.co/RadixArk/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep-trainstate-step29592
- Export de solo pesos: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep/3ep/
- Codigo: fork PR #22, rama `exp/qwen3-8b-5layer-8x1536-iso-active-1ep`, commit f268321d (sin URL publica en la informacion disponible)
- Paper, blog, demo o repositorio adicional: no disponibles
