# rayaanoidpr/grandtour-world-models

## Resumen

GrandTour World Models es un repositorio de modelos de mundo (world models) para robotica cuadrupeda, condicionados por acciones y entrenados sobre el dataset GrandTour con el robot ANYmal-D y camaras `hdr_front`/depth. No es un modelo de lenguaje: son modelos predictivos de representaciones latentes orientados a planificacion y control de robots con patas. El repositorio agrupa dos frameworks distintos bajo una sola publicacion: LeWM-depth (prefijos `lewm-*`), un modelo de mundo latente basado en JEPA mas SIGReg del codebase `quad-wm`, y V-JEPA (`vjepa/`), que combina un encoder DINOv2/V-JEPA 2.1 congelado con un predictor AdaLN del codebase `vjepa-wm`.

El interes tecnico reside en comparar dos aproximaciones al mismo problema: prediccion latente auto-supervisada con cabezas de estado frente a variantes con residual de accion y ajuste fino en simulacion. El repositorio ocupa 9,0 GB e incluye checkpoints de LeWM, checkpoints V-JEPA, un baseline estilo V-JEPA y varios informes de evaluacion (`reports/`). El modelo asociado aparece referenciado con el arXiv 2602.18164, correspondiente al dataset GrandTour (Frey et al.).

La relevancia actual es la del area de world models para robotica: aprender dinamicas condicionadas por accion que permitan planificar en el espacio latente. Los resultados publicados en la propia model card muestran que los latentes predicen bien velocidades lineales y estados articulares (r2 aproximado de 0,93 a 0,98) pero no posicion base ni contactos, y que en planificacion con CEM en MuJoCo un controlador scripted sigue siendo mejor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LeWM-depth: modelo de mundo latente JEPA + SIGReg. V-JEPA: encoder DINOv2/V-JEPA 2.1 congelado + predictor AdaLN (ViT) |
| Parametros totales | no disponible de forma agregada; encoder DINOv2 ViT-L/14 citado como 304M en la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como contexto de texto; ventana temporal de 12 frames a fps 5, resolucion 224, y t-window causal 3 en el predictor gt_v1 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica: modelo de mundo visual/robotico, no procesa lenguaje |
| Licencia | no disponible en metadatos de HuggingFace; la model card indica datos GrandTour CC BY-SA 4.0, pesos V-JEPA derivados de DINOv2 (Apache-2.0) y del codebase `jepa-wms` (CC-BY-NC 4.0), y LeWM del codebase `quad-wm` |
| Formato de pesos | checkpoints de LeWM como diccionarios `{model, optimizer, epoch, config}`; formato exacto de los checkpoints V-JEPA no disponible |

## Arquitectura y entrenamiento

LeWM-depth implementa un modelo de mundo latente con prediccion en el espacio de representaciones (JEPA) y una componente SIGReg. Se publican varias variantes entrenadas de forma secuencial: la original (5600 pasos, sin state head), una variante grounded con state head (ADR 0007), una variante con residual de accion conjunta y state head, y una variante residual con ajuste fino en simulacion (1800 pasos). Todas las variantes LeWM son de semilla unica (s4551).

La rama V-JEPA usa un encoder DINOv2 ViT-S/14 o ViT-L/14 congelado seguido de un predictor AdaLN. Las configuraciones documentadas incluyen un predictor AdaLN de profundidad 6 sobre ViT-S/14 (1000 pasos, perdida de epoch 5,3 a 1,53) y un predictor AdaLN de profundidad 12, embedding 1024 y ventana temporal causal 3 sobre ViT-L/14 (1600+ pasos, perdida de epoch 1,25 a 0,63). Existe ademas una ejecucion `bigrun` basada en V-JEPA 2.1 ViT-B/384 con enmascaramiento causal de tubelets y cabeza de consistencia de velocidad (8000 pasos), y checkpoints `gt_v4` con preentrenamiento V-JEPA 2.1 (model_only, jepa-model-only y probe). Los datos de entrenamiento proceden del dataset GrandTour con el cuadrupedo ANYmal-D; no se detalla en la informacion disponible la composicion exacta del dataset ni el uso de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Prediccion de representaciones latentes futuras condicionadas por acciones sobre datos de robot cuadrupedo.
- Aprendizaje de dinamicas de robot: los latentes son linealmente separables para `lin_vel`, `joint_pos` y `joint_vel` con r2 aproximado de 0,93 a 0,98.
- Soporte de planificacion en el espacio latente mediante CEM (Cross-Entropy Method) en evaluacion con MuJoCo EV3.
- Codificacion visual mediante encoders DINOv2 ViT-S/14 y ViT-L/14 congelados, y variantes V-JEPA 2.1.
- Prediccion con consistencia de velocidad en la ejecucion `bigrun` (cabeza especifica de velocity-consistency).
- Evaluacion con decoder heads in-domain estilo VM2M (`gt_v0_step2_vm2m`, `gt_v1_step2_vm2m`).
- No soporta tool calling, function calling, agentes de texto ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en world models para robotica: usar los checkpoints LeWM y V-JEPA como referencia para comparar prediccion latente contra baselines de persistencia y copia.
- Planificacion basada en modelo para cuadrupedos: emplear los latentes con CEM para seleccionar acciones antes de ejecutar en simulacion MuJoCo.
- Aprendizaje de representaciones para control: entrenar sondas lineales sobre los latentes para estimar velocidades y estados articulares en un pipeline de control.
- Reproduccion de experimentos de ajuste fino en simulacion: la variante `lewm-depth-residual-simft-s4551` (1800 pasos) sirve como punto de partida para estudiar transferencia sim-a-real.
- Evaluacion de encoders congelados: comparar DINOv2 ViT-S/14 frente a ViT-L/14 como extractores de features para prediccion de video robotico.
- Benchmarking de prediccion de video: usar el copy-baseline (latent L2) como metrica de referencia para medir si un nuevo modelo supera la copia trivial del frame latente.
- Estudio de transferencia de politicas: la model card indica que solo la variante con ajuste fino en simulacion evita caidas en terreno plano, lo que la hace util como referencia negativa para estudiar sim-to-real.

## Benchmarks y rendimiento

LeWM-depth, error de rollout EV5 (ε_k, normalizado por σ, menor es mejor, k=1, sonda lineal):

| Run | Modelo | Persistence | encoded_floor |
|---|---|---|---|
| lewm-depth (original) | 3.30 | 6.41 | 3.26 |
| grounded | 2.07 | 6.52 | 1.56 |
| residual | 2.12 | 6.52 | 1.58 |
| residual-simft | 2.23 | 6.56 | 1.65 |

V-JEPA, copy-baseline (L2 latente) y ejecucion grande:

| Metrica | Valor |
|---|---|
| gt_v0 modelo/copia, 1-step | 1.01 |
| gt_v0 modelo/copia, h=6 | 0.88 |
| gt_v1 modelo/copia, 1-step | 0.81 |
| gt_v1 modelo/copia, h=6 | 0.77 |
| bigrun (paso 8000), feature cosine ICE-1 / SPX-2 | 0.890 / 0.854 |
| bigrun, velocity RMSE true-vs-shuffled | 0.061/0.097 y 0.052/0.092 |

Perdida de entrenamiento V-JEPA: gt_v0 de 5,3 a 1,53 (1000 pasos); gt_v1 de 1,25 a 0,63 (1600+ pasos).

Sondas de latentes: `lin_vel`/`joint_pos`/`joint_vel` con r2 aproximado de 0,93 a 0,98; `base_pos` con r2 aproximado de 0,18; los `contacts` no estan representados. En el eval de planificacion CEM EV3 en MuJoCo, el controlador scripted sigue siendo mejor.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como estimacion a partir del encoder ViT-L/14 de 304M parametros citado, la inferencia en fp32 rondaria 1,2 a 3 GB solo para el encoder, mas el predictor AdaLN y los buffers de video; estas cifras son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles en la informacion proporcionada. El repo ocupa 9,0 GB, por lo que conviene espacio en disco y, si se cargan varios checkpoints a la vez, una GPU con VRAM holgada.
- Compatibilidad con GPU de consumo: probable en GPU con al menos 8-12 GB de VRAM para las variantes ViT-S/14; la variante ViT-L/14 y `bigrun` (ViT-B/384) requieren mas margen. Cifras no confirmadas por el autor.
- Opciones de despliegue: no se documentan stacks como vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo). El flujo documentado usa `uv` con el extra `sim` del repositorio `quad-wm` (`quadwm sim-eval`) y scripts Python en `vjepa-wm` (rama `exp-v2`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/ventana | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GrandTour World Models (LeWM-depth / V-JEPA) | ViT-L/14 encoder: 304M; resto no disponible | 12 frames a fps 5, 224 px | EV5 ε_k 2,07-3,30 (LeWM); copy-baseline 0,77-1,01 (V-JEPA) | datos CC BY-SA 4.0; pesos V-JEPA derivados de jepa-wms CC-BY-NC 4.0 | HuggingFace `rayaanoidpr/grandtour-world-models`, codigo en `quad-wm` y `vjepa-wm` |
| Alternativas de world models para robotica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria con parametros, contexto y licencia verificables para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles de forma explicita en la model card.
- Los latentes no representan `base_pos` (r2 aproximado de 0,18) ni `contacts` (no representados), lo que limita su uso para control dependiente de contacto.
- En planificacion CEM en MuJoCo EV3 el controlador scripted supera al modelo.
- Solo la variante con ajuste fino en simulacion evita caidas en terreno plano; el resto no.
- Todas las variantes LeWM son de semilla unica (s4551), mientras que el protocolo requiere al menos 3 semillas para significancia estadistica. Los resultados LeWM deben tratarse como preliminares.
- La variante `lewm-depth` original no tiene state head, por lo que no ofrece lectura `planning_state_head`.
- Las ejecuciones V-JEPA provienen de puntos distintos del proyecto `vjepa-wm`; hay que revisar cada yaml para conocer la arquitectura y los ajustes de entrenamiento exactos.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de predicciones latentes incorrectas en regiones fuera de la distribucion de entrenamiento.
- Restriccion de licencia importante: los pesos V-JEPA derivan del codebase `jepa-wms` con licencia CC-BY-NC 4.0, lo que restringe el uso comercial. Los datos GrandTour son CC BY-SA 4.0. La licencia no aparece en los metadatos de HuggingFace, por lo que hay que verificar antes de cualquier uso en produccion.
- El repositorio esta creado y actualizado el mismo dia (2026-10-13), con 0 descargas y 0 likes: es un artefacto de investigacion sin validacion externa.

## Enlaces

- HuggingFace: https://huggingface.co/rayaanoidpr/grandtour-world-models
- Repositorio LeWM (quad-wm): https://github.com/rayaanoidPrime/quad-wm
- Repositorio V-JEPA (vjepa-wm): https://github.com/rayaanoidPrime/vjepa-wm
- Dataset GrandTour, Frey et al.: https://arxiv.org/abs/2602.18164
- Informes de evaluacion citados en el repo: `reports/report-2741.md` (todos los brazos, protocolo v2) y `report-2742.md` (planificacion sim-lewm-v1)
- Recursos generales sobre world models encontrados en la busqueda web, no especificos de este modelo: https://world-models.io/en/ y https://worldmodelswatch.com/models
