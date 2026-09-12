# Knowing/rlsplat_grpo_23c_det3000

## Resumen

`Knowing/rlsplat_grpo_23c_det3000` no es un modelo de lenguaje, sino un checkpoint de investigación de RLSplat: una política de asignación de gaussianas para reconstrucción de escenas 3D y síntesis de vistas noveles (novel-view synthesis). Lo publica el usuario `Knowing` y corresponde a la mejor iteración de un barrido de hiperparámetros (sweep) del 10 de septiembre de 2026, bautizada como `sweep_23c_fromrandom_det_only_3000`.

El checkpoint parte de un modelo preentrenado con asignación aleatoria de gaussianas (`b200_random_up504`, 40 000 pasos sobre 8 GPU B200) y se afina durante 3000 pasos de optimizador con una cabeza de asignación proporcional softmax y un surrogate de rango basado en GRPO, con render principal determinista y sin término de entropía. El objetivo es decidir cuántas gaussianas 3D asignar a cada ancla de la escena bajo un presupuesto fijo por vista, mejorando la calidad de render medida en PSNR, LPIPS y SSIM.

Es relevante porque documenta una mejora consistente sobre dos controles internos (asignación aleatoria y asignación uniforme) en las 12 celdas de evaluación publicadas, con ganancias de entre +0,42 y +0,57 dB a 1024 gaussianas por vista y de +0,16 a +0,35 dB a 8192. El repositorio ocupa 1,6 GB y contiene pesos, configuración Hydra y resultados de test, no una librería lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder con backbone DVLT mas cabeza de asignacion de gaussianas (softmax proporcional) y surrogate de rango GRPO; no es un transformer de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el modelo consume vistas de contexto (2, 8 o 24 vistas por escena en los experimentos publicados) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene checkpoint Lightning de entrenamiento) |
| Idiomas soportados | no aplica (modelo de vision 3D, sin entrada de texto) |
| Licencia | other (terminos no detallados en la model card; hay que consultar con el autor) |
| Formato de pesos | `.ckpt` de PyTorch Lightning (`epoch_0-step_3000.ckpt`), mas `config.yaml`, `overrides.yaml`, `sweep_23c.env` y `test_comparison_2026-09-10.txt` |
| Tamano del repositorio | 1,6 GB (incluye estado de optimizador y scheduler) |
| Carga | `checkpointing.load=...` para reanudar, o `model.encoder.pretrained_weights=...` para cargar solo pesos |

## Arquitectura y entrenamiento

La receta parte de `+training=rlsplat_softmax_grpo` con pesos preentrenados de un checkpoint aleatorio de 40 000 pasos. El afino usa `optimizer.lr=1e-5` con `gaussian_allocation_head_lr_multiplier=100`, `train.gaussian_allocation_rank_loss=1.0` y `gaussian_allocation_entropy_weight=0`. La política se entrena con `model.encoder.gaussian_allocation_main_render=deterministic`, `min_gaussians_per_anchor=0` y `gaussian_allocation_remainder_jitter=true`.

El entrenamiento se ejecutó sobre 4 GPU B200 con `accumulate_grad_batches=2` durante 3000 pasos y 24 vistas de contexto por GPU, mezclando RE10K y DL3DV con número de vistas dinámico. El código de referencia es el repositorio RLSplat en el commit `3360aa6` (9 de septiembre de 2026). No se detalla en la información disponible la composición exacta del dataset, el número total de tokens ni si hubo RLHF o DPO, conceptos que en este dominio no aplican.

## Capacidades

- Síntesis de vistas noveles (novel-view synthesis) a partir de 2, 8 o 24 vistas de contexto.
- Reconstrucción 3D implícita mediante gaussian splatting con presupuesto controlado de gaussianas por vista (1024 y 8192 en los experimentos publicados).
- Asignación adaptativa de recursos: la cabeza softmax decide el reparto de gaussianas por ancla, optimizada con GRPO en lugar de reglas uniformes.
- Render determinista en la pasada principal durante el afino, lo que reduce la varianza de la señal de recompensa.
- Evaluación integrada mediante PSNR, LPIPS y SSIM sobre los conjuntos RE10K y ACID.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingües.

## Casos de uso

- Reconstrucción 3D con pocas vistas: con solo 2 vistas de contexto y 1024 gaussianas por vista alcanza 21,791 PSNR en RE10K, útil para capturas rápidas con dron o teléfono donde no se puede hacer un barrido denso.
- Presupuesto de memoria ajustado en VR/AR: la política permite fijar un número máximo de gaussianas por vista y repartirlo de forma aprendida, lo que encaja en visores con límite estricto de primitivas.
- Gemelos digitales de escenas: partiendo de 24 vistas y 8192 gaussianas por vista obtiene 26,101 PSNR y 0,1191 LPIPS en RE10K, adecuado para réplicas navegables de interiores y exteriores.
- Investigación en asignación de recursos con aprendizaje por refuerzo: el checkpoint sirve como punto de comparación frente a políticas aleatorias y uniformes, con las 12 celdas de test ya publicadas.
- Fotogrametría con presupuesto heterogéneo: al mezclar RE10K y DL3DV con recuentos de vistas dinámicos, el modelo tolera entradas con distinto número de cámaras.
- Control de ablación en publicaciones: junto a `uniform 3000` y `random 40k` permite aislar la contribución de la política GRPO frente a la base preentrenada.
- Reanudación de experimentos: el checkpoint incluye optimizador y scheduler, por lo que se puede continuar el afino desde el paso 3000 sin recalcular el estado.

## Benchmarks y rendimiento

Resultados de `mode=test`, `align_pose=false`, formateados como PSNR / LPIPS / SSIM. Controles: `random 40k` (checkpoint base con asignación aleatoria) y `uniform 3000` (misma base y mismos pasos con asignación uniforme).

| Vistas | Presupuesto/vista | Dataset | random 40k | uniform 3000 | GRPO 23c |
|---|---|---|---|---|---|
| 2 | 8192 | re10k | 22,362 / 0,2109 / 0,7460 | 22,687 / 0,2038 / 0,7582 | 22,867 / 0,2002 / 0,7640 |
| 2 | 8192 | acid | 22,772 / 0,2748 / 0,6445 | 22,827 / 0,2690 / 0,6490 | 22,983 / 0,2646 / 0,6535 |
| 2 | 1024 | re10k | 20,832 / 0,3101 / 0,6893 | 21,222 / 0,2899 / 0,7078 | 21,791 / 0,2756 / 0,7223 |
| 2 | 1024 | acid | 21,804 / 0,3939 / 0,6101 | 21,953 / 0,3779 / 0,6196 | 22,370 / 0,3658 / 0,6289 |
| 8 | 8192 | re10k | 24,300 / 0,1478 / 0,8167 | 24,984 / 0,1399 / 0,8393 | 25,236 / 0,1371 / 0,8471 |
| 8 | 8192 | acid | 23,752 / 0,2326 / 0,6813 | 23,951 / 0,2285 / 0,6937 | 24,155 / 0,2236 / 0,7003 |
| 8 | 1024 | re10k | 23,407 / 0,1967 / 0,7867 | 23,949 / 0,1879 / 0,8088 | 24,480 / 0,1783 / 0,8218 |
| 8 | 1024 | acid | 23,188 / 0,2976 / 0,6577 | 23,263 / 0,2977 / 0,6685 | 23,683 / 0,2861 / 0,6785 |
| 24 | 8192 | re10k | 25,064 / 0,1287 / 0,8408 | 25,747 / 0,1218 / 0,8618 | 26,101 / 0,1191 / 0,8717 |
| 24 | 8192 | acid | 24,492 / 0,2098 / 0,7214 | 24,722 / 0,2062 / 0,7330 | 24,982 / 0,2018 / 0,7418 |
| 24 | 1024 | re10k | 24,585 / 0,1515 / 0,8258 | 25,043 / 0,1510 / 0,8433 | 25,560 / 0,1445 / 0,8547 |
| 24 | 1024 | acid | 24,175 / 0,2403 / 0,7051 | 24,104 / 0,2515 / 0,7116 | 24,569 / 0,2404 / 0,7227 |

La política GRPO supera a la asignación uniforme y a la aleatoria en las 12 celdas. La ganancia sobre el control uniforme es de +0,42 a +0,57 dB con 1024 gaussianas por vista y de +0,16 a +0,35 dB con 8192, siendo ACID el conjunto donde la mejora es mayor.

Validación interna de la ronda final (paso 3000), 24 escenas RE10K con 2 vistas y siete presupuestos de 1024 a 16384: LPIPS 0,2632 / 0,2116 / 0,1956 / 0,1917 / 0,1909 / 0,1907 / 0,1910, con AUC 0,1985. No se publican MMLU, HumanEval ni GSM8K, que no aplican a este dominio.

## Requisitos de hardware

- VRAM de inferencia: no disponible. El único dato de hardware publicado es de entrenamiento.
- Entrenamiento: 4 GPU B200 para el afino GRPO de 3000 pasos, con 24 vistas de contexto por GPU y `accumulate_grad_batches=2`; el preentrenamiento previo usó 8 GPU B200 durante 40 000 pasos.
- GPU consumer: no disponible. No se documenta si el modelo cabe en una RTX 4090 o similar, ni la VRAM necesaria por vista o por escena.
- Tamano en disco: el repositorio completo pesa 1,6 GB, pero incluye estado de optimizador y planificador de LR, por lo que el peso útil para inferencia es inferior a esa cifra.
- Opciones de despliegue: no se documentan. El único camino indicado es la base de código RLSplat (commit `3360aa6`), con carga vía `checkpointing.load` o `model.encoder.pretrained_weights`. No hay soporte anunciado para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a gaussian splatting.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada solo permite comparar contra los controles internos del propio barrido; no hay datos de terceros.

| Modelo | Tipo | Pasos | Asignacion | PSNR 24v/8192 re10k | LPIPS 24v/8192 re10k |
|---|---|---|---|---|---|
| GRPO 23c (`rlsplat_grpo_23c_det3000`) | politica GRPO, render determinista | 3000 | softmax proporcional | 26,101 | 0,1191 |
| uniform 3000 | ablacion de control | 3000 | uniforme | 25,747 | 0,1218 |
| random 40k | checkpoint base | 40 000 | aleatoria | 25,064 | 0,1287 |

No se dispone de comparación con otros modelos de novel-view synthesis o gaussian splatting (por ejemplo variantes de 3DGS) en la información proporcionada.

## Limitaciones y advertencias

- Licencia `other` sin texto de términos en la model card: el uso comercial queda sin definir y requiere consulta al autor.
- Es un checkpoint de investigación, no un modelo empaquetado: necesita la base de código RLSplat en el commit `3360aa6` para cargarse y ejecutarse.
- Los resultados se publican con `align_pose=false`; no se documenta el comportamiento con alineación de pose activada.
- La evaluación se limita a RE10K y ACID en test, y a RE10K y DL3DV en entrenamiento. No hay evidencia de generalización a otros dominios, condiciones de iluminación extremas o secuencias dinámicas.
- El modelo no procesa texto ni lenguaje natural: no tiene capacidades multilingües, de tool calling ni de agentes.
- Sesgos: al depender de RE10K y DL3DV, puede heredar los sesgos de composición de escena de esos conjuntos (interiores y exteriores concretos, distribución de cámaras y presupuestos de vistas similares).
- Riesgo de artefactos de render y de sobreajuste al rango de presupuestos evaluados (1024 a 16384 gaussianas por vista); fuera de ese rango no hay datos.
- El repositorio no tiene descargas ni likes en el momento de la consulta, por lo que no existe validación externa de la comunidad.
- La búsqueda web realizada devolvió únicamente resultados sobre la película `Knowing` (2009) y un perfume homónimo, sin relación con el modelo; no se han podido localizar referencias externas.

## Enlaces

- HuggingFace: https://huggingface.co/Knowing/rlsplat_grpo_23c_det3000
- Repositorio RLSplat, commit `3360aa6` (9 de septiembre de 2026): URL no disponible en la información proporcionada
- Script de lanzamiento del sweep: `scripts/sweep_handoff/` dentro del repositorio RLSplat; URL no disponible
- Resultados de test: `test_comparison_2026-09-10.txt`, incluido en el repositorio de HuggingFace
- Paper o blog del modelo: no disponible
- Demo: no disponible
