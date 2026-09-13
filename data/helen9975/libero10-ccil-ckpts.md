# helen9975/libero10-ccil-ckpts

## Resumen

`helen9975/libero10-ccil-ckpts` es un repositorio de checkpoints de politica de difusion (diffusion policy) para robótica, publicado por el usuario helen9975 dentro del proyecto CCIL (*Continuity-based Corrective Imitation Learning in Visual Observation Spaces*). No es un modelo de lenguaje: se trata de una politica de manipulacion entrenada por imitacion que resuelve las 10 tareas de horizonte largo del benchmark LIBERO-10 como una unica politica multitarea condicionada por la instruccion en lenguaje natural de cada tarea.

El repositorio contiene dos checkpoints: un baseline de *behavior cloning* (BC) entrenado sobre las 500 demostraciones de LIBERO-10, con una tasa de exito agregada de 0,713 (IC 95% [0,634, 0,784]) sobre 150 episodios, y una variante en la que la cabeza del BC se afina con CCIL secuencial (backward-Euler), cuyo evaluacion offline esta pendiente segun la propia model card. El encoder visual es DINOv2-small por camara, la cabeza es un `ConditionalTransformer1D` y el condicionamiento de lenguaje se inyecta como un unico token CLIP de una tabla fija de (10, 512).

Su relevancia es de investigacion: extiende CCIL desde entornos de tarea unica (robomimic/PushT) a un benchmark multitarea, y proporciona un baseline reproducible de LIBERO-10 con protocolo de evaluacion explicitamente documentado. El repositorio pesa 0,6 GB, usa licencia MIT y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Politica de difusion (DDPM) con encoder visual DINOv2-small por camara y cabeza `ConditionalTransformer1D` |
| Parametros totales | no disponible (la model card no indica recuento de parametros) |
| Longitud de contexto | no aplica como ventana de contexto de un LLM; horizontes: `obs_horizon=1`, `pred_horizon=32`, `action_horizon=15` |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (condicionamiento por instrucciones en lenguaje natural via embeddings CLIP de texto) |
| Licencia | MIT |
| Formato de pesos | `.pt` de PyTorch (`torch.load`), con `config`, `state_dict` y `stats` en el mismo payload |
| Encoder visual | `facebook/dinov2-small`, por camara, con `patch_hw=[3,3]` agrupado |
| Condicionamiento de lenguaje | Embeddings de texto de `openai/clip-vit-base-patch16`; tabla fija (10, 512) como buffer |
| Observacion | 2 camaras (`agentview`, `eye_in_hand`) a 128x128 con recorte aleatorio a 116; proprio `eef_pos(3) + eef_quat(4) + gripper_qpos(2)` = 9 |
| Accion | 10 dimensiones absolutas con `rotation_6d` |
| Dimension latente | 6921 (2 camaras x 3x3 parches x 384 + 9) |
| Difusion | DDPM, 100 pasos de entrenamiento y 100 de inferencia |
| Tamano del repositorio | 0,6 GB |
| Fecha de creacion / actualizacion | 2026-09-13 / 2026-09-13 |

## Arquitectura y entrenamiento

La politica combina un encoder visual DINOv2-small aplicado de forma independiente a cada una de las dos camaras, con agrupacion de parches `patch_hw=[3,3]`, y una cabeza `ConditionalTransformer1D` que recibe los tokens de parches de imagen, un token de propiocepcion y un unico token de lenguaje CLIP. El modelo de difusion es un DDPM con 100 pasos de entrenamiento y 100 de inferencia, que predice acciones absolutas de 10 dimensiones con representacion `rotation_6d`, con `pred_horizon=32`, `action_horizon=15` y `obs_horizon=1`. La dimension latente resultante es de 6921 elementos (2 camaras x 3x3 parches x 384 + 9). Un detalle de diseno relevante: el condicionamiento de lenguaje es *solo de cabeza*, es decir, el token CLIP entra en la cabeza de la politica pero no forma parte del latente de observacion, de modo que el modelo de dinamica de CCIL permanece agnostico a la tarea. La tabla de lenguaje es fija, de forma (10, 512), almacenada como buffer, y unicamente se aprende su proyeccion hacia la cabeza.

Los datos de entrenamiento proceden de LIBERO-10, a traves del espejo oficial en HuggingFace `yifengzhu-hf/LIBERO-datasets` (directorio `libero_10/`), con 10 tareas x 50 demostraciones = 500 demostraciones. LIBERO proporciona acciones OSC *delta* de 7 dimensiones y ninguna accion absoluta; el proyecto las convirtio reproduciendo cada demostracion por el controlador OSC y registrando la pose objetivo absoluta, conversion validada por rollout con un error medio de 2,3 mm respecto a la trayectoria del efector final grabada, frente a 24,5 mm al reproducir los deltas originales. El checkpoint `bc` se entreno con DDP en 3 GPU (batch global 63, 21 por rango) con un calendario de 600 epocas; el checkpoint liberado es el mejor por tasa de exito, correspondiente a la epoca 100, y las epocas posteriores no lo mejoraron. La model card senala que esta familia de politicas se estanca pronto.

## Capacidades

- Ejecucion de tareas de manipulacion robotica en las 10 tareas de horizonte largo de LIBERO-10 con una unica politica multitarea.
- Condicionamiento por instruccion en lenguaje natural: la tarea se selecciona mediante un embedding CLIP de texto, indexado por `task_id` en la tabla fija de (10, 512).
- Percepcion visual binocular: procesa simultaneamente las vistas `agentview` y `eye_in_hand` a 128x128 (recorte a 116).
- Integracion de propiocepcion: posicion del efector final (3), cuaternion de orientacion (4) y posicion de la pinza (2).
- Generacion de acciones continuas absolutas de 10 dimensiones con `rotation_6d`, con horizonte de prediccion de 32 pasos y ejecucion de 15.
- Afinamiento correctivo: la variante CCIL secuencial ajusta solo la cabeza del BC sobre latentes expertos y correctivos (backward-Euler).
- No aplica: generacion de texto, razonamiento simbolico, tool calling, function calling, capacidades de agente, vision general de imagenes, audio ni modo de razonamiento explicito. La model card no documenta ninguna de estas capacidades.

## Casos de uso

- Reproduccion de un baseline de LIBERO-10: el checkpoint `bc` permite replicar la cifra de 0,713 con el protocolo documentado (`eval_checkpoints_multi_seed.py`, 3 semillas x 50 episodios, `test_start_seed=100000`, `n_train=0`, `max_steps=600`, sin ruido de accion), lo que sirve como referencia controlada en articulos posteriores.
- Comparacion de metodos de imitacion: al ser un baseline canonico del proyecto, cualquier receta downstream (por ejemplo, CCIL secuencial) se mide contra el, siempre que se respete el mismo protocolo de evaluacion y el mismo `n_train`.
- Investigacion en aprendizaje por imitacion correctivo: la variante `bc_seq_be` esta pensada para estudiar el afinamiento de la cabeza sobre latentes correctivos, aunque su evaluacion offline esta pendiente segun la model card.
- Estudio de condicionamiento de lenguaje en politicas de difusion: la arquitectura permite analizar el efecto de inyectar el token CLIP solo en la cabeza y mantener el modelo de dinamica agnostico a la tarea.
- Ablaciones de representacion visual: el uso de DINOv2-small con agrupacion 3x3 por camara facilita experimentos controlados sobre el encoder visual sin cambiar el resto del pipeline.
- Punto de partida para nuevas tareas de manipulacion: la estructura multitarea con tabla de lenguaje de 10 entradas es un marco para anadir tareas, siempre que se regeneren los embeddings y se reentrene o afine la politica.
- Evaluacion de robustez en simulacion: al requerir el simulador LIBERO y `task_id`, es adecuado para estudiar sensibilidad a semillas de inferencia (el propio autor reporta 0,72 / 0,70 / 0,72 en tres semillas).

## Benchmarks y rendimiento

| Checkpoint | Protocolo | Tasa de exito | Detalle |
|---|---|---|---|
| `bc/libero10_bc_best.pt` | 3 semillas x 50 episodios = 150 rollouts, `max_steps=600`, sin ruido | 0,713 (IC 95% [0,634, 0,784]) | Semillas: 0,72 / 0,70 / 0,72; media 0,7133; desviacion 0,0094; exitos 107/150 |
| `bc_seq_be/libero10_bc_seq_be_best.pt` | no disponible | no disponible | Evaluacion offline pendiente segun la model card |
| Mismo checkpoint `bc`, protocolo de evaluacion en entrenamiento | 20 episodios, una sola semilla, `n_train` distinto | ~0,82 | No comparable con la cifra de 0,713 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no se trata de un modelo de lenguaje. La model card advierte ademas de que las tasas de exito por tarea no se conservan en el resumen, por lo que el comportamiento del checkpoint en tareas individuales no esta caracterizado, y que LPB, el trabajo de referencia mas cercano, evalua LIBERO-10 tarea a tarea con 50 episodios por tarea, de modo que sus cifras no son directamente comparables con un agregado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no especifica requisitos de VRAM ni el modelo de GPU empleado.
- Entrenamiento documentado: DDP en 3 GPU (batch global 63, 21 por rango), sin especificar el modelo de GPU. Calendario de 600 epocas, con el mejor resultado en la epoca 100.
- Huella en disco: el repositorio completo ocupa 0,6 GB.
- GPU recomendadas: no disponible. No se indica ninguna GPU concreta (A100, H100, RTX 4090 u otras).
- Encaje en GPU de consumo: no confirmado. Dado que el encoder es DINOv2-small y la cabeza es un transformer condicional de dimension latente 6921, es plausible que la inferencia quepa en GPU de consumo, pero se trata de una estimacion no verificada y no debe tomarse como dato.
- Opciones de despliegue: la model card documenta carga directa con `torch.load` e `instantiate_model_artifacts` desde el codigo de `diffusion_policy`. La evaluacion requiere el simulador LIBERO y el runner `LiberoMultitaskImageRunner`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Categoria | Protocolo de evaluacion | Tasa de exito en LIBERO-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `helen9975/libero10-ccil-ckpts` (BC) | Diffusion policy multitarea condicionada por lenguaje | 3 semillas x 50 episodios = 150 rollouts | 0,713 (IC 95% [0,634, 0,784]) | MIT | Publico en HuggingFace |
| `helen9975/libero10-ccil-ckpts` (BC + CCIL secuencial) | Diffusion policy con afinamiento correctivo | no disponible | no disponible | MIT | Publico en HuggingFace |
| LPB (trabajo de referencia citado) | no disponible | 1 tarea a la vez, 50 episodios por tarea | no disponible | no disponible | no disponible |
| CCIL original (robomimic / PushT) | Aprendizaje por imitacion correctivo de tarea unica | no disponible | no aplica (otro benchmark) | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: la model card solo menciona LPB como referencia cercana y advierte explicitamente de que su protocolo de evaluacion no es comparable con el agregado aqui publicado.

## Limitaciones y advertencias

- Los resultados son agregados: las tasas de exito por tarea se calculan pero no se conservan en el resumen, por lo que no se caracteriza el rendimiento en tareas individuales.
- Riesgo de comparaciones invalidas: las cifras de evaluacion en entrenamiento (~0,82) usan 20 episodios, una sola semilla y un `n_train` distinto, lo que cambia la forma del batch del entorno vectorial y, con ella, el ruido de difusion de cada episodio. No deben compararse con el 0,713.
- La variante CCIL secuencial (`bc_seq_be`) no tiene evaluacion offline publicada en la model card; no debe asumirse ninguna mejora sobre el baseline.
- Nombres de fichero potencialmente confusos: los archivos se renombraron para su publicacion, pero en el arbol de entrenamiento se escriben como `can_serl_diffusion_best.pt` y `can_serl_diffusion_latent_ft_best.pt`, un sufijo heredado de la tarea Can de robomimic y de la linea de diffusion policy (`SERLPolicyWrapper`) sin relacion con LIBERO. Solo los sufijos `_best`, `_epoch_N` y `_latent_ft` tienen significado.
- Dependencia de rutas absolutas: el checkpoint registra un `dino_path` absoluto de la maquina de entrenamiento que debe reescribirse antes de instanciar el modelo.
- Riesgo de carga silenciosa incorrecta: aunque `strict=False` es intencionado, la tabla CLIP de lenguaje es un buffer registrado; un modulo construido sin ella la descartaria sin aviso y la politica se ejecutaria sin condicionamiento. La model card recomienda verificar que `nets["noise_pred_net"].language_table` tiene forma (10, 512) y suma absoluta mayor que cero.
- Normalizacion obligatoria: las acciones y los estados requieren el objeto `stats` incluido en el payload; omitirlo produce acciones incorrectas.
- Dependencia del simulador: la evaluacion exige LIBERO y el `task_id` de cada tarea para recuperar el embedding de la instruccion.
- Sesgos conocidos: no disponible. La model card no documenta analisis de sesgo, y el modelo opera en simulacion sobre un conjunto cerrado de 10 tareas.
- Riesgo de alucinacion: no aplica en el sentido de un modelo generativo de texto; si aplica el riesgo de generalizacion limitada fuera de la distribucion de las 500 demostraciones.
- Limitaciones de idioma: el condicionamiento de lenguaje usa una tabla fija de 10 embeddings CLIP, uno por tarea; no hay soporte multilingue ni capacidad de interpretar instrucciones libres fuera de esa tabla.
- Licencia MIT, que permite uso comercial, si bien el modelo depende de componentes de terceros (DINOv2-small, CLIP ViT-B/16) y del simulador y los datos de LIBERO, cuyas condiciones deben verificarse por separado.
- Estado de adopcion: 0 descargas y 0 "likes" en el momento de la consulta, lo que limita la validacion externa del artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/helen9975/libero10-ccil-ckpts
- Encoder visual referenciado: https://huggingface.co/facebook/dinov2-small
- Modelo de embeddings de lenguaje referenciado: https://huggingface.co/openai/clip-vit-base-patch16
- Dataset de LIBERO referenciado: https://huggingface.co/yifengzhu-hf/LIBERO-datasets
- Paper de CCIL, blog del proyecto, repositorio de codigo y demos: no disponible en la informacion proporcionada. La busqueda web realizada no devolvio resultados relevantes (los enlaces obtenidos correspondian a la funcion QUERY de Google Docs y a un foro de idiomas, sin relacion con el modelo).
