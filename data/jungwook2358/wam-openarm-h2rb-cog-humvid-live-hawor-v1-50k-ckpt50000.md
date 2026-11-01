# jungwook2358/wam-openarm-h2rb-cog-humvid-live-hawor-v1-50k-ckpt50000

## Resumen

WAM (World-Action Model) es un modelo de robotica basado en el backbone de video Wan2.2-TI2V-5B, adaptado mediante fine-tuning para aprender politicas de accion a partir de datos de video e interacciones de un brazo robotico OpenArm. Esta checkpoint concreto, `wam-openarm-h2rb-cog-humvid-live-hawor-v1-50k-ckpt50000`, corresponde al experimento EXP-0019, un ablation centrado en la alineacion cognitiva (CogAlign) con gradientes que fluyen hacia el backbone de video, y en el uso de video humano unicamente como senal auxiliar de video (sin etiquetas de accion).

El modelo resuelve el problema de aprender representaciones world-action conjuntas: predice fotogramas futuros de video y, a la vez, acciones y estados del robot en un espacio de 30 dimensiones (PRQ30) para ambas manos. Es relevante porque explora si los datos de video humano, sin acciones etiquetadas, pueden mejorar la representacion del modelo cuando se combinan con perdidas de keypoints (CogAlign) y se permite que esas perdidas lleguen al backbone de video (sin detach).

Se entrena desde cero sobre Wan2.2-TI2V-5B durante 50.000 pasos con 4 GPUs y 64 filas por paso (32 de robot y 32 de humano). El checkpoint ocupa 12,5 GB y se distribuye en formato safetensors, con licencia "other" (no comercial o con restricciones, segun el autor). No hay informacion sobre idiomas ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) de video Wan2.2-TI2V-5B, adaptado como world-action model con cabezas de accion/estado y CogAlign |
| Parametros totales | no disponible (backbone base Wan2.2-TI2V-5B; el checkpoint ocupa 12,5 GB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de accion 24; I2V con 1 frame de condicionamiento + 8 futuros) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (restricciones no especificadas en la model card) |
| Formato de pesos | safetensors (3 shards, checkpoint HF-trainer con index, config.json, processor_config.json, statistics.json, embodiment_id.json) |

## Arquitectura y entrenamiento

El modelo parte de Wan2.2-TI2V-5B, un transformer de difusion (DiT) para generacion de video texto-imagen-a-video, y se adapta a un esquema de world-action model (WAM). La entrada combina video estereo 192x256 concatenado verticalmente (vista izquierda en negro para filas humanas), con I2V stride 3 (1 frame de condicionamiento y 8 futuros) y enmascaramiento de vistas 0.5/0.25/0.25. Las acciones y estados se representan en PRQ30 para ambas manos: `[L: wrist_pos3 | wrist_rot6d6 | hand_q6 | R: same]`, en coordenadas absolutas del frame de la camara derecha ZED (FRAME V1: FK del robot en la pose fija egopi + afin V1), con normalizacion q01/q99 y mascaras de validez por fila.

El entrenamiento es un fine-tuning desde cero sobre el backbone durante 50.000 pasos, con 4 GPUs y 64 filas por paso (32 de robot y 32 de humano, mezcla exacta). Los datos proceden de la composicion FRED-paper OpenArm: 6 subconjuntos de robot (553 episodios) y 5 de humano (1.187 episodios). La innovacion principal es CogAlign con `WAM_COGALIGN_DETACH=0`: las perdidas de cabeza FP48 del frame actual (peso 0.2) y de delta futuro (peso 0.2) sobre un adaptador residual compartido llegan a los tokens L18 y al DiT de video, es decir, los gradientes fluyen hacia el backbone. Las filas humanas usan `WAM_HUMAN_VIDEO_ONLY=1` (estado 0, accion 0, mascara 0) y solo contribuyen con perdida de video FM y perdidas de keypoints CogAlign, sin perdida de accion. Los keypoints humanos FP48 (rlwrld / air-fryer, 9 cache) tienen una fraccion de filas validas de aproximadamente 0.64. El codigo esta en la rama `jungwook/openarm-fred-ft` @c3d1b92 del repositorio actlat-wam.

## Capacidades

- Prediccion de video futuro condicionada a imagen (I2V) con 8 frames futuros y stride 3.
- Prediccion de acciones y estados de robot para ambas manos en espacio PRQ30 (30 dimensiones), con horizonte 24.
- Aprendizaje conjunto world-action con perdidas de video y de accion sobre el mismo backbone DiT.
- Alineacion cognitiva (CogAlign) mediante cabezas FP48 de frame actual y delta futuro sobre adaptador residual compartido.
- Uso de video humano sin acciones como senal auxiliar (video-only) para mejorar la representacion.
- Soporte de mascaras de validez por fila para manejar datos heterogeneos (robot vs. humano).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni thinking mode; el modelo esta especializado en robotica.

## Casos de uso

- **Manipulacion robotica con OpenArm**: el modelo genera acciones de 30 dimensiones (posicion y rotacion de muneca, y 6 grados de libertad de mano por lado) con horizonte 24, util para control de politicas en tareas de pick-and-place con el brazo OpenArm.
- **Aprendizaje de politicas a partir de video humano**: al incorporar video humano sin etiquetas de accion (1.187 episodios), el modelo puede aprovechar demostraciones humanas para mejorar la representacion de tareas, reduciendo la necesidad de teleoperacion robotica.
- **Prediccion de video para planificacion**: la cabeza de difusion de video permite simular fotogramas futuros (192x256 estereo) y usarlos como representacion interna para planificacion a corto plazo.
- **Investigacion en world-action models**: el checkpoint es un ablation reproducible (EXP-0019) que permite estudiar el efecto de `COGALIGN_DETACH=0` y de `HUMAN_VIDEO_ONLY=1` sobre el rendimiento, comparandolo con variantes del mismo autor.
- **Generacion de datos sinteticos de robot**: el modelo puede predecir trayectorias y estados plausibles para augmentar datasets de robotica en tareas con pocas demostraciones.
- **Evaluacion de transferencia humano-robot**: sirve para medir hasta que punto los keypoints humanos (FP48) alineados con CogAlign mejoran la politica robotica, un caso de estudio concreto en transferencia de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint pesa 12,5 GB en safetensors; el backbone Wan2.2-TI2V-5B es de 5B parametros, por lo que se requiere al menos una GPU con 24 GB para precision completa y menos con cuantizacion (no documentada).
- GPU recomendadas: el entrenamiento se realizo con 4 GPUs (modelo no especificado) y 64 filas por paso; para inferencia se recomienda A100 40/80 GB o H100, y es probable que quepa en RTX 4090 (24 GB) con cuantizacion, aunque no esta confirmado.
- Cabe en consumer GPU: probablemente en RTX 4090 con cuantizacion, no confirmado; en RTX 3090/4090 con precision reducida podria ser ajustado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de robotica basado en DiT, el despliegue tipico seria mediante PyTorch y el codigo del repositorio actlat-wam.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wam-openarm-h2rb-cog-humvid-live-hawor-v1-50k-ckpt50000 | no disponible (backbone 5B) | no disponible (horizonte 24) | no disponible | other | HuggingFace |
| Wan2.2-TI2V-5B | 5B | no disponible | no disponible | no disponible | no disponible |
| Otros WAM del mismo autor (variantes EXP-0019) | no disponible | no disponible | no disponible | other | HuggingFace (mismo autor) |

No se dispone de datos de benchmarks ni de modelos comparables con metricas publicadas en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se especifican los terminos exactos; es imprescindible revisar las condiciones antes de cualquier uso comercial.
- Modelo altamente especializado en robotica OpenArm; no es un modelo de lenguaje general ni soporta tareas de texto, codigo o vision general.
- Entrenado con datos limitados (553 episodios de robot y 1.187 de humano), lo que puede provocar sobreajuste y baja generalizacion a entornos o tareas no vistas.
- Las filas humanas no aportan senal de accion (estado 0, accion 0, mascara 0); el modelo no aprende acciones directamente de humanos, solo representaciones de video y keypoints.
- La fraccion de filas humanas validas para CogAlign es de aproximadamente 0.64, lo que implica que una parte de los datos humanos no contribuye a esas perdidas.
- No se han publicado benchmarks ni evaluaciones cuantitativas, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion en la prediccion de video y de acciones no verificadas; requiere validacion en el robot real antes de produccion.
- No se documentan sesgos conocidos ni limitaciones de idioma, pero al ser un modelo de robotica no aplica el concepto de idioma.
- El checkpoint no incluye los estados del optimizador DeepSpeed (72 GB), por lo que no es directamente reanudable para entrenamiento sin pasos adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/wam-openarm-h2rb-cog-humvid-live-hawor-v1-50k-ckpt50000
- Codigo (rama `jungwook/openarm-fred-ft` @c3d1b92): repositorio actlat-wam, no se proporciona URL directa en la informacion disponible
- Script de entrenamiento: `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_prq30_h2rb.sh`
- Configuracion de modalidad: `gr00t/configs/data/openarm_prq30_v1_config.py`
- Paper FRED: no se proporciona URL directa en la informacion disponible
- Wan2.2-TI2V-5B: no se proporciona URL directa en la informacion disponible
