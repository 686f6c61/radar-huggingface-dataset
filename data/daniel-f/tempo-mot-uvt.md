# Daniel-F/tempo-mot-uvt

## Resumen

TEMPO-MOT + UVT es un paquete de cuatro políticas de robotica del tipo Vision-Language-Action (VLA) publicadas por el usuario Daniel-F en HuggingFace. No es un modelo de lenguaje generalista: cada checkpoint es un ajuste fino de pi0.5, la politica VLA de Physical Intelligence distribuida a traves del framework openpi, especializada en una tarea de manipulacion concreta (`dynamic_handover`, `dynamic_pour`, `spartan_balls` y `ball_drop`). El repositorio incluye, ademas de los pesos, los datasets de LeRobot con los que se entrenaron, el codigo de entrenamiento e inferencia, las estadisticas de normalizacion y una cache precalculada de tokens de SAM2.

La relevancia tecnica del paquete esta en dos modificaciones sobre pi0.5: por un lado, la atencion temporal se implementa dentro de un SigLIP parcheado (el modelo no compila sin ese parche, que hay que copiar manualmente sobre `transformers`), y por otro se anade `actvae`, un VAE de chunks de accion congelado que trabaja junto al experto de acciones. La entrada combina estado del robot, hasta tres camaras y tokens de memoria de SAM2.1-tiny calculados sobre la imagen de la camara de cabeza.

El repositorio ocupa 36,3 GB y cada checkpoint pesa 7,1 GB en safetensors. Se distribuye bajo licencia Apache 2.0, aunque hereda los terminos de Gemma por su ascendencia sobre pi0.5. En el momento de la consulta acumula 0 descargas y 0 likes, y no publica resultados de benchmarks, por lo que se trata de un artefacto de investigacion sin validacion externa documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de pi0.5 (openpi): backbone SigLIP parcheado con atencion temporal, modelo de lenguaje Gemma y experto de acciones; incluye un VAE de chunks de accion congelado (`actvae`) |
| Parametros totales | no disponible (no se documenta el recuento; cada checkpoint ocupa 7,1 GB en safetensors) |
| Parametros activos | no aplica; no se describe una arquitectura MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (los prompts de tarea que aparecen en la model card estan en ingles, p. ej. "spartan balls") |
| Licencia | Apache 2.0, con terminos heredados de Gemma (ver `openpi/LICENSE_GEMMA.txt`) |
| Formato de pesos | safetensors (`checkpoints/<task>/model.safetensors`, 7,1 GB por tarea); VAE de acciones en PyTorch (`.pt`); cache SAM2 en `.npz` |
| Pipeline declarado | robotics |
| Libreria | lerobot |
| Tamano del repositorio | 36,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion y actualizacion (metadatos) | 2026-09-13 |

Tareas incluidas en el repositorio:

| Tarea | Config | Episodios | Dim. de accion | Camaras |
|---|---|---|---|---|
| `dynamic_handover` | `pi05_yam_tempo_mot_uvt_dynamic_handover` | 90 | 14 | head, left_wrist, right_wrist |
| `dynamic_pour` | `pi05_yam_tempo_mot_uvt_dynamic_pour` | 23 | 7 | head, right_wrist |
| `spartan_balls` | `pi05_yam_tempo_mot_uvt_spartan_balls` | 54 | 7 | head, right_wrist |
| `ball_drop` | `pi05_yam_tempo_mot_uvt_ball_drop` | 31 | 7 | head |

## Arquitectura y entrenamiento

La base es pi0.5, una politica VLA de openpi que combina un codificador visual SigLIP con un modelo de lenguaje Gemma y un experto de acciones que genera chunks de 16 pasos. Sobre esa base, este repositorio introduce dos elementos propios: atencion temporal implementada dentro de un SigLIP parcheado (`openpi/models_pytorch/transformers_replace/`, que debe copiarse sobre el paquete `transformers` del entorno virtual; reejecutar la copia despues de cualquier edicion) y `actvae`, un VAE de chunks de accion congelado almacenado en `actvae/<task>/actvae.pt`. La inferencia acepta estado del robot como vector `float32`, imagenes HWC `uint8` en hasta tres ranuras de camara (las ranuras que un dataset no tiene se rellenan con ceros y se enmascaran) y `sam2_tokens`, la salida de atencion de memoria de SAM2.1-tiny sobre el fotograma de cabeza, con forma `(256, 8, 8)` leida como 64 tokens de 256 dimensiones. La salida es un chunk de acciones `(16, A)` en unidades crudas.

El entrenamiento parte de los propios checkpoints del repositorio: `scripts/finetune.sh <task>` continua desde el checkpoint mas reciente de esa misma tarea, con control de `EXP_NAME`, `BATCH_SIZE` global, `NPROC` y `CHECKPOINT_BASE_DIR`, y admite flags adicionales del trainer (por ejemplo `--num-train-steps=20000`). Hay soporte de SLURM mediante `scripts/finetune.sbatch` y una utilidad de evaluacion de perdida sin entrenar (`scripts/eval_loss.py <task> --batches 25`). Para anadir una tarea nueva se requiere un dataset LeRobot en `data/`, un VAE de acciones en `actvae/<task>/actvae.pt`, una cache SAM2 generada con `tools/precompute_sam2_tokens.py` y estadisticas de normalizacion calculadas con `scripts/compute_norm_stats.py`. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de chunks de accion de 16 pasos para control de robots manipuladores, a partir de estado, imagenes y un prompt de tarea en texto.
- Manipulacion bimanual: la tarea `dynamic_handover` usa un espacio de accion de 14 dimensiones, compatible con dos brazos.
- Manipulacion con una sola mano o pinza: las tareas `dynamic_pour`, `spartan_balls` y `ball_drop` usan 7 dimensiones de accion.
- Percepcion multimodal con hasta tres camaras simultaneas (cabeza y munecas izquierda y derecha), con enmascaramiento de las ranuras ausentes.
- Integracion de atencion temporal sobre el backbone SigLIP, orientada a tareas con dinamica (vertido, transferencia de objetos).
- Uso de una cache de memoria de SAM2.1-tiny como senal adicional de segmentacion/ memoria visual sobre la camara de cabeza.
- Inferencia en proceso mediante `policy_config.create_trained_policy` y servicio por socket con `scripts/serve_policy.py` y `WebsocketClientPolicy`.
- Reentrenamiento y ajuste fino sobre tareas nuevas dentro del mismo framework, incluyendo reanudacion automatica desde el checkpoint mas reciente.
- Comprobacion de integridad de pesos: `scripts/check_checkpoint.py` valida `missing=0 unexpected=0` y muestrea un chunk finito de forma `(1, 16, action_dim)`.
- Capacidades conversacionales, tool calling, agentes multi-paso, vision general, audio o modo de razonamiento explicito: no disponibles; el modelo no se presenta como tal.

## Casos de uso

- Manipulacion bimanual con transferencia de objetos: la tarea `dynamic_handover` (90 episodios, 14 dimensiones de accion, tres camaras) sirve como punto de partida para ajustar politicas de entrega y recogida de piezas entre dos brazos en celulas de montaje.
- Automatizacion de vertido de liquidos: `dynamic_pour` (23 episodios, camara de cabeza y muneca derecha) es la base para tareas de dosificacion o servicio de bebidas donde importa la dinamica del fluido.
- Clasificacion o manipulacion de objetos esfericos: `spartan_balls` (54 episodios) y `ball_drop` (31 episodios) cubren la recogida, colocacion y suelta controlada de objetos pequenos.
- Plataforma de investigacion en VLA: el repositorio incluye codigo de entrenamiento, datasets, estadisticas de normalizacion y utilidades de evaluacion de perdida, lo que permite reproducir el ajuste fino y medir el efecto de la atencion temporal en SigLIP.
- Integracion en un bucle de control remoto: el servicio por socket (`serve_policy.py` con `WebsocketClientPolicy`) desacopla la politica del robot, de modo que la inferencia puede ejecutarse en una estacion con GPU y el cliente consumir los chunks de accion por red.
- Ajuste fino a una tarea propia: con `tools/precompute_sam2_tokens.py`, `compute_norm_stats.py` y un config nuevo, el equipo puede adaptar la politica a su propio dataset LeRobot manteniendo el VAE de acciones congelado.
- Entrenamiento distribuido en cluster: `scripts/finetune.sbatch` y las variables `NPROC` y `BATCH_SIZE` permiten lanzar el ajuste fino bajo SLURM en nodos con GPU NVIDIA.
- Validacion previa al despliegue: `scripts/check_checkpoint.py` y `scripts/eval_loss.py` permiten verificar que un checkpoint carga sin claves perdidas o inesperadas y estimar su perdida sobre los datos de la tarea antes de conectarlo a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de exito por tarea, tasas de exito en robot real, comparaciones con pi0.5 u otras politicas VLA, ni cifras de latencia o throughput. Las unicas utilidades de medida mencionadas son `scripts/eval_loss.py`, que calcula la perdida sobre los datos de la tarea, y `scripts/check_checkpoint.py`, que verifica la carga de pesos y genera un chunk de acciones de forma `(1, 16, action_dim)`.

## Requisitos de hardware

- Requisitos declarados: Python 3.11 o superior, una GPU NVIDIA y `uv` como gestor de entorno. La sincronizacion del entorno se hace con `uv sync` desde `openpi/`.
- Pesos: 7,1 GB por checkpoint en safetensors. Como referencia orientativa, un unico checkpoint en precision de 16 bits ocupa esos 7,1 GB, de modo que se necesita margen adicional de VRAM para activaciones del backbone SigLIP/Gemma y para el experto de acciones; una estimacion prudente se situa en el rango de 12 a 16 GB de VRAM por politica. No es un dato publicado por el autor.
- GPU recomendadas: no se especifican modelos concretos. Por el rango de VRAM estimado, deberia caber en tarjetas consumer de gama alta (RTX 4090, 24 GB; RTX 3090, 24 GB) y en GPUs de centro de datos (A100, H100, L40S, A6000). La cifra exacta de VRAM no esta documentada.
- Almacenamiento: 36,3 GB para el repositorio completo (cuatro checkpoints, cuatro datasets, caches SAM2 y codigo).
- Despliegue: el autor documenta dos vias dentro de openpi, carga en proceso con `create_trained_policy` y servicio por websocket con `scripts/serve_policy.py --port=8000` mas `openpi_client.websocket_client_policy`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica VLA de este tipo.
- Dependencia de codigo: la atencion temporal vive en un SigLIP parcheado que debe copiarse manualmente sobre `site-packages/transformers/` del entorno virtual; sin ese paso el modelo no se construye.
- Variables de entorno: `TEMPO_UVT_VENV` es obligatoria; `TEMPO_UVT_ROOT`, `HF_LEROBOT_HOME` y `TEMPO_SAM2_CACHE_ROOT` tienen valores por defecto dentro de la propia carpeta.
- Cache SAM2: para generar caches nuevas se necesitan `SAM2_REPO` y `SAM2_CKPT` apuntando al repositorio de SAM2 y al checkpoint `sam2.1_hiera_tiny.pt`. El calculo de estadisticas de normalizacion puede ejecutarse en CPU con `JAX_PLATFORMS=cpu`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo permite comparar con el modelo base del que derivan estos pesos. No se documentan comparaciones con otras politicas VLA.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TEMPO-MOT + UVT (este) | no disponible (checkpoints de 7,1 GB) | no disponible | Apache 2.0 con terminos de Gemma | HuggingFace, 0 descargas | Cuatro politicas ajustadas, atencion temporal en SigLIP parcheado y VAE de acciones congelado |
| pi0.5 (base, openpi) | no disponible en la informacion | no disponible | Apache 2.0 con terminos de Gemma | Repositorio openpi de Physical Intelligence | Politica generalista de la que parten los cuatro ajustes |
| Otras politicas VLA | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Cobertura muy estrecha: cada checkpoint esta ajustado a una unica tarea y el numero de episodios es bajo (entre 23 y 90), lo que aumenta el riesgo de sobreajuste al entorno, iluminacion, posiciones y objetos concretos de la recogida de datos.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, y ningun benchmark ni tasa de exito publicada. No hay evidencia independiente de que las politicas funcionen fuera del laboratorio del autor.
- Dependencia de un parche manual: el modelo no se construye sin copiar `transformers_replace/` sobre el paquete `transformers` del entorno virtual, y hay que repetir la copia tras cada edicion. Es un punto fragil para produccion y complica la actualizacion de dependencias.
- Dependencia de la cache SAM2: la inferencia espera `sam2_tokens` procedentes de SAM2.1-tiny sobre el fotograma de cabeza. Sin esa cache precalculada (o sin el modelo SAM2.1 disponible) el pipeline de inferencia no esta completo.
- Heterogeneidad entre tareas: `dynamic_handover` usa 14 dimensiones de accion y tres camaras, mientras que las otras tres tareas usan 7 dimensiones y una o dos camaras. No son intercambiables entre si y requieren configuraciones distintas.
- Relleno de camaras ausentes: las ranuras de camara que un dataset no tiene se rellenan con ceros y se enmascaran, de modo que anadir o quitar camaras cambia la distribucion de entrada respecto al entrenamiento.
- Idiomas: no se documentan idiomas soportados. Los prompts de tarea visibles son etiquetas cortas en ingles, no instrucciones en lenguaje natural extensas.
- Licencia: el paquete es Apache 2.0, pero al derivar de pi0.5 incorpora componentes de Gemma cuyos terminos se heredan y se detallan en `openpi/LICENSE_GEMMA.txt`. Antes de un uso comercial hay que revisar ese fichero, no solo la etiqueta Apache 2.0 del repositorio.
- Riesgo de comportamiento no seguro: no hay informacion sobre limites de fuerza, parada de emergencia, espacios de trabajo validos ni validacion de seguridad fisica. Cualquier despliegue sobre hardware real exige capas de seguridad externas.
- Sin datos de calibracion temporal ni de latencia, no es posible garantizar que la politica cumpla los requisitos de frecuencia de control de un robot concreto.
- Fechas de metadatos (2026-09-13) poco habituales; conviene verificar la version real del repositorio antes de fijar una dependencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daniel-F/tempo-mot-uvt
- Repositorio openpi (codigo base, framework de pi0.5): https://github.com/Physical-Intelligence/openpi
- uv (gestor de entorno requerido): https://docs.astral.sh/uv/
- Terminos heredados de Gemma: `openpi/LICENSE_GEMMA.txt` dentro del propio repositorio del modelo
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs o demos) sobre este modelo.
