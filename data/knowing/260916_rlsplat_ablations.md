# Knowing/260916_rlsplat_ablations

## Resumen

`Knowing/260916_rlsplat_ablations` no es un modelo de lenguaje, sino un repositorio de checkpoints de investigación asociado a un estudio de ablaciones sobre RLSplat, una receta de asignación (allocation) de gaussianas entrenada con aprendizaje por refuerzo para tareas de *splatting* 3D. El autor, identificado como Knowing, publica aquí los pesos de la "Table 5" del artículo: el modelo base `base/epoch_1-step_40000.ckpt` (receta `rlsplat_b200_random_up504`, asignación aleatoria) y tres brazos de 5000 pasos finetuneados desde ese base (`27aa_gspo5k_lr1e5_head1e3_legacysampler`, `40a_alloc_uniform_5000`, `40b_alloc_sobel_5000`). El resto de brazos de ablación (unos 30, de 1000 pasos) están terminados pero sus checkpoints permanecen en el servidor de entrenamiento y solo se suben sus ficheros de configuración.

El problema que aborda es la asignación de presupuesto de gaussianas por vista: la receta principal aprende, mediante optimización de política (GSPO sobre una cabeza softmax), cómo repartir un presupuesto variable de gaussianas (de 1024 a 16384 por vista) frente a alternativas como la asignación uniforme o una heurística de alta frecuencia basada en Sobel. El repositorio incluye el manifiesto de brazos, los *overrides* de Hydra necesarios para cargar cada checkpoint, el parche de código no commiteado y los índices de evaluación sobre RealEstate10K (re10k) y ACID.

Es relevante ahora como artefacto de reproducibilidad: cada checkpoint pesa entre 1,4 y 1,5 GB, el repositorio ocupa 16,9 GB y la colección completa (30 brazos más base) se estima en unos 45 GB. No hay model card de uso general, ni pipeline declarado, ni licencia publicada, por lo que su interés es estrictamente de investigación en reconstrucción y síntesis de vistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de asignación de gaussianas para *splatting* 3D, con cabeza de logits (softmax) y acondicionamiento por presupuesto; variantes sin cabeza de logits (uniform, image_gradient). No es un transformer de lenguaje |
| Parametros totales | no disponible (no se declara el recuento de parámetros en la model card) |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible; el eje de variación es el presupuesto de gaussianas por vista (1024, 2048, ..., 16384) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints de PyTorch Lightning sin cuantizar |
| Idiomas soportados | no disponible; el artefacto opera sobre imágenes y datasets de escenas (re10k, acid), no sobre texto |
| Licencia | no disponible |
| Formato de pesos | `.ckpt` (estado completo de PyTorch Lightning); código auxiliar en Python, JSON y parches `.patch` |
| Tamano del repositorio | 16,9 GB |
| Tamano por checkpoint | ~1,4-1,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-16 / 2026-09-17 |

## Arquitectura y entrenamiento

La receta base es `rlsplat_b200_random_up504` (asignación aleatoria, checkpoint en el paso 40000 de la época 1) y todos los brazos usan `rlsplat_softmax_grpo` como receta de *finetuning*. El entrenamiento de los brazos de 1000 pasos sigue el protocolo de ablación descrito: finetune con GSPO desde el base 0901, 4 GPUs, sin acumulación de gradiente, *sampler* de vistas heredado (*legacy*) y validación cada 100 pasos sobre 7 presupuestos de 1024 a 16384 por vista. Los brazos de 5000 pasos (27aa, 40a, 40b) emplean la receta principal con 4 GPUs y acumulación 2 (equivalente a un lote de 8 GPUs). El nombre de la receta base sugiere entrenamiento sobre GPUs B200, aunque no se detalla la composición del dataset ni el número total de tokens o imágenes vistas.

Las ablaciones cubren cinco ejes técnicos: (1) modo de asignación (softmax vía GSPO, GRPO o REINFORCE, uniforme, o gradiente de imagen con Sobel de potencia 1,0 y épsilon 0,05); (2) términos de la pérdida (peso de proyección, término de distancia a anclas tipo Voronoi y término de desplazamiento posición-delta); (3) estructura (refinamiento residual gaussiano activado o desactivado); (4) acondicionamiento por presupuesto (ninguno, `shift`, `concat`, `film` con profundidad 2, `log_density`, `log_density` más conteo de vistas); y (5) hiperparámetros de RL (tamaño de grupo GSPO 3, 5 u 8; temperatura de *rollout* 1,0, 1,5 o la de referencia; objetivo de reconstrucción determinista o muestreado; grado de armónicos esféricos 3). El repositorio advierte que los *flags* de arquitectura no se almacenan en el checkpoint, por lo que hay que aplicar los `eval_overrides` de cada brazo al cargarlo: los brazos `uniform` e `image_gradient` no tienen cabeza de logits, `36d` usa profundidad de cabeza 2 y `39a` usa `sh_degree` 3.

## Capacidades

- Asignación aprendida de presupuesto de gaussianas por vista, condicionada por el presupuesto objetivo (1024 a 16384 por vista) en las variantes con cabeza de logits.
- Comparación controlada de estimadores de política: GSPO, GRPO y REINFORCE, con tres semillas en varios brazos.
- Modos de asignación alternativos: uniforme y heurística de gradiente de imagen (Sobel), útiles como líneas base.
- Reconstrucción y síntesis de vistas evaluable sobre RealEstate10K (re10k) y ACID, con índices de evaluación preparados para contextos de 8, 16 y 24 vistas.
- Carga reproducible de cada brazo mediante `checkpointing.load=<ckpt>` más los `eval_overrides` correspondientes.
- Ejecución de barridos de validación sobre 7 escalones de presupuesto y agregación de resultados con AUC logarítmico.
- No se declaran capacidades de generación de texto, código, matemáticas, visión semántica, *tool calling*, agentes ni modo de razonamiento; el artefacto es específico de *splatting*.

## Casos de uso

- Reproducción de la tabla 5 del artículo: cargar `27aa_gspo5k_lr1e5_head1e3_legacysampler`, `40a_alloc_uniform_5000` y `40b_alloc_sobel_5000` junto al base y ejecutar `code/eval_arms.sh` para obtener las celdas comparables de asignación softmax, uniforme y Sobel.
- Estudio del efecto del estimador de política en la asignación: comparar los brazos GRPO, REINFORCE y GSPO con tres semillas cada uno para medir la varianza entre semillas en el mismo protocolo de 1000 pasos.
- Ablación de la función de pérdida: activar y desactivar los términos de proyección, distancia a anclas (Voronoi) y desplazamiento de posición (`34a_loss_noproj`, `34b_loss_novoronoi`, `34c_loss_nodisp`) para aislar su contribución.
- Análisis del acondicionamiento por presupuesto: comparar `36a_cond_none`, `36b_cond_shift`, `36c_cond_concat`, `36d_cond_film2` y las variantes `log_density` (`38a`, `38b`) para decidir cómo codificar el presupuesto en el regimen de presupuestos altos.
- Barrido de eficiencia por presupuesto: usar los 7 escalones de validación de 1024 a 16384 gaussianas por vista para trazar curvas de calidad frente a coste y agregarlas con `code/aggregate_arms.py` (`--csv`, `--ref ARM` para deltas).
- Base para nuevos finetunes: partir de `base/epoch_1-step_40000.ckpt` (receta `rlsplat_b200_random_up504`) como inicialización para experimentos propios de asignación o de reconstrucción en re10k y acid.
- Auditoría metodológica: reconstruir el entorno exacto a partir de `code/GIT_BASE.txt` y `code/uncommitted.patch` (modo `image_gradient`, codificación `log_density`, condicionamiento por vistas) antes de aplicar los `eval_overrides` de cada brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `results.md` (registro del barrido, con lo más reciente al final) y a `HANDOFF_training.md` para las curvas de validación y las conclusiones, y a `EVAL_PROMPT.md` para el protocolo de evaluación completa de las tablas del artículo, pero no incluye cifras. Los únicos elementos cuantitativos declarados son el protocolo de evaluación (7 presupuestos por vista de 1024 a 16384, validación cada 100 pasos) y la métrica de agregación (`AUC_log` calculada por `code/aggregate_arms.py`).

## Requisitos de hardware

- Almacenamiento: 16,9 GB para el repositorio tal y como está publicado; entre 1,4 y 1,5 GB por checkpoint; unos 45 GB si se reuniesen los 30 brazos más el base.
- Entrenamiento declarado: 4 GPUs para los brazos de 1000 pasos sin acumulación de gradiente, y 4 GPUs con acumulación 2 (lote equivalente a 8 GPUs) para los brazos de 5000 pasos. El nombre de la receta base (`rlsplat_b200_random_up504`) apunta a GPUs B200, sin que la model card lo confirme explícitamente.
- Evaluación: `code/eval_arms.sh` encadena una ejecución `mode=test` por cada par (brazo, dataset) recorriendo los 7 escalones de presupuesto, encadenadas por GPU; requiere aplicar `code/uncommitted.patch`.
- VRAM estimada para inferencia: no disponible.
- GPUs recomendadas: no disponible; no se especifica ningún modelo de GPU para inferencia.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI; son herramientas para modelos de lenguaje y no aplican aquí).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La model card no compara este artefacto con otros modelos de la misma categoría. La única referencia comparable mencionada internamente es el *sampler* de estilo ZipSplat, usado como control de asignación en los brazos `30a_alloc_uniform_ctrl` y `30b_alloc_gspo_ref` (posteriormente sustituidos por `35b` y `40a`), pero no se ofrecen especificaciones, parámetros ni resultados de ese control en la información disponible.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto, código ni realiza tareas de lenguaje; cualquier evaluación como modelo de IA generativa estándar carece de sentido.
- Licencia no publicada: no se puede asumir uso comercial ni redistribución de los checkpoints sin aclaración del autor.
- Los *flags* de arquitectura no se guardan dentro del checkpoint; cargarlo sin los `eval_overrides` del brazo correspondiente produce una configuración incorrecta (los brazos `uniform` e `image_gradient` carecen de cabeza de logits, `36d` usa profundidad 2, `39a` usa `sh_degree` 3 y `36a` no tiene condicionamiento por presupuesto).
- Algunos brazos exigen además `train.gaussian_allocation_rank_loss=0.0` (ya incluido en los overrides de los brazos uniform e image_gradient).
- El repositorio contiene solo 4 checkpoints (base más los tres brazos de 5000 pasos); los ~30 brazos de 1000 pasos están terminados pero sus pesos no se han subido, por lo que no se pueden verificar de forma independiente sin solicitárselos al autor.
- El código de evaluación depende de cambios no commiteados (`code/uncommitted.patch`) y de ficheros de índices no rastreados en git (`evaluation_index_*_ctx_{8,16,24}.json`), lo que complica la reproducción exacta.
- No hay resultados numéricos publicados en la información disponible, por lo que no es posible verificar las conclusiones del barrido sin ejecutar la evaluación.
- No se declaran sesgos, riesgos de alucinación ni limitaciones de idioma porque el artefacto no procesa lenguaje; los sesgos relevantes serían los de los datasets de escenas (re10k, acid) empleados en la evaluación, que no se documentan aquí.
- Los resultados de la búsqueda web no contienen información técnica sobre este repositorio: los enlaces devueltos corresponden a la película *Knowing* (2009), a su ficha en Netflix y a un perfume, y no guardan relación con el artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Knowing/260916_rlsplat_ablations
- Ficheros internos citados en la model card (rutas dentro del repositorio): `manifest.json`, `results.md`, `HANDOFF_training.md`, `EVAL_PROMPT.md`, `code/GIT_BASE.txt`, `code/uncommitted.patch`, `code/eval_arms.sh`, `code/aggregate_arms.py`, `code/compare_grpo_test.sh.reference`, `code/assets/evaluation_index_re10k.json`, `code/assets/evaluation_index_acid.json`, `code/assets/evaluation_index_{re10k,acid}_ctx_{8,16,24}.json`, `arms/<arm>/sweep.env`, `arms/<arm>/eval_overrides.txt`, `base/epoch_1-step_40000.ckpt`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de búsqueda web proporcionados.
