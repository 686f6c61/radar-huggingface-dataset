# jungwook2358/wam-openarm-prq30-rh-cog-humvid-v1-ema-50k-ckpt50000

## Resumen

El modelo `wam-openarm-prq30-rh-cog-humvid-v1-ema-50k-ckpt50000` es un checkpoint de robótica desarrollado por el usuario jungwook2358, publicado en HuggingFace bajo el pipeline `robotics`. Se trata de un modelo de política visuomotora (vision-language-action, VLA) entrenado sobre el backbone de vídeo Wan2.2-TI2V-5B, orientado a control de brazos robóticos OpenArm mediante representaciones de acción PRQ30 (posición de muñeca, rotación en 6D y articulaciones de mano). El identificador del experimento es EXP-0019, descrito como "PRQ30 v1 robot+human, CogAlign, human video-only".

El modelo combina datos de robot y de humano: 32 muestras de robot por lote (con acciones y estados PRQ30 absolutos) y 32 muestras humanas por lote en formato únicamente de vídeo (sin estado ni acción). Incorpora una pérdida de alineamiento cognitivo (CogAlign) sobre keypoints FP48, con componente actual y de delta futuro, que fluye hacia el backbone de vídeo junto con la pérdida de flujo de acciones. El entrenamiento parte de Wan2.2-TI2V-5B desde cero, con 50 000 pasos, warmup de 2500, lr 1e-4, weight decay 0.01 y decaimiento coseno hasta 0.1.

El checkpoint incluye pesos en formato safetensors con EMA de vídeo guardada (solo para servir, el entrenamiento usó pesos vivos), además de estadísticas de normalización, configuración del procesador y estado del entrenador. El repositorio ocupa 32,5 GB. Es relevante para investigadores en manipulación robótica que necesiten un modelo de acción con condicionamiento de vídeo y alineamiento entre dominios humano y robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT de vídeo (Wan2.2-TI2V-5B) con cabeza de acción; stride I2V 3 (1 cond + 8 futuro) |
| Parametros totales | no disponible (backbone Wan2.2-TI2V-5B, ~5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (shards, índice, config.json, processor_config.json) |

## Arquitectura y entrenamiento

El modelo se construye sobre Wan2.2-TI2V-5B, un transformer de difusión (DiT) para generación de vídeo, adaptado a predicción de acciones robóticas. La entrada visual usa vídeo estéreo concatenado verticalmente a resolución 192x256 con recorte de aspecto, stride I2V de 3 (un frame de condicionamiento más ocho futuros) y máscara de vista con proporciones 0.5/0.25/0.25. La representación de acción es PRQ30 absoluta: por cada mano, `[wrist_pos3|rot6d6|hand_q6]`, primero izquierda y luego derecha, en el marco de la cámara derecha ZED con el frame fijo V1 (pitch 1.2 / yaw -0.3) y raíz HaWoR v1 `openarm_prq30_v1`. La normalización q01/q99 se calcula solo con los 6 subconjuntos de robot y se aplican máscaras de validez por dimensión (el plátano excluye la mano izquierda de la pérdida y pone a cero sus dimensiones tras normalizar).

El entrenamiento combina 32 muestras de robot y 32 humanas por lote (b64 = pd16 x 4 GPU). Las muestras humanas provienen de 5 subconjuntos (rlwrld_human_lerobot, close/open_air_fryer, left_hand_box_white_container, anyh2r) y son únicamente de vídeo: estado, acción y máscara de acción a cero, contribuyendo solo a la pérdida de flujo de vídeo y a CogAlign. CogAlign usa peso 0.2 actual más 0.2 de delta futuro sobre keypoints FP48 v1 en 9 subconjuntos (anyh2r y left_hand_box no tienen etiquetas v1 y no reciben pérdida de keypoints). Tanto la pérdida cognitiva como la de flujo de acciones propagan gradiente al backbone de vídeo (`WAM_COGALIGN_DETACH=0`, `WAM_ACTION_GRAD_TO_VIDEO=1`). No se usa profesor ni pérdida de representación; hay augmentación moderada. Se guarda EMA de vídeo (`backbone.extractor._video_ema_model.*` y `action_ema.*`) para servir con o sin ella.

## Capacidades

- Predicción de acciones robóticas de manipulación bimanual en espacio PRQ30 absoluto (30 dimensiones: 15 por mano).
- Condicionamiento visuomotor a partir de vídeo estéreo (cámara derecha ZED, resolución 192x256).
- Generación de vídeo futuro condicionada a imagen (I2V) con stride 3, un frame de condición y ocho futuros.
- Alineamiento cognitivo (CogAlign) entre dominios humano y robot sobre keypoints FP48.
- Aprendizaje de datos humanos sin acción mediante pérdida de vídeo y CogAlign (video-only).
- Soporte de máscaras de validez por dimensión para excluir articulaciones no válidas (por ejemplo, mano izquierda en escenarios tipo plátano).
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingües.
- No se documenta modo thinking, audio ni visión general fuera del pipeline robótico.

## Casos de uso

- Manipulación bimanual con OpenArm: el modelo genera acciones absolutas PRQ30 para ambas manos a partir de observación estéreo, adecuado para tareas de recogida y colocación con dos brazos.
- Aprendizaje por imitación con datos humanos: al incorporar 5 subconjuntos humanos en formato video-only, permite preentrenar o ajustar políticas usando vídeos de demostración humana sin necesidad de teleoperación robótica.
- Tareas de cocina simuladas o reales: los subconjuntos close/open_air_fryer y left_hand_box_white_container sugieren aplicaciones de apertura/cierre de electrodomésticos y manipulación de contenedores.
- Investigación en alineamiento de dominios: CogAlign sobre keypoints FP48 permite estudiar la transferencia entre morfología humana y robot en el espacio de representación del backbone de vídeo.
- Predicción de vídeo condicionada a acción: el stride I2V de 3 y la máscara de vista permiten usarlo como modelo generativo de futuros visuales para planificación.
- Evaluación de robustez con máscaras de validez: útil para probar políticas que deben ignorar articulaciones no disponibles o efectoros ausentes (por ejemplo, escenario plátano con mano izquierda inválida).
- Servicio de inferencia con o sin EMA: permite comparar el efecto de los pesos EMA en estabilidad de acción sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio pesa 32,5 GB en safetensors y el backbone es Wan2.2-TI2V-5B, por lo que se requiere al menos una GPU con memoria suficiente para el backbone completo más el estado de acción y el procesador de vídeo.
- GPU recomendadas: no disponible en la información proporcionada; por el tamaño del backbone (~5B) y el vídeo estéreo, se espera necesidad de GPU de datacenter (A100, H100) para servir sin cuantizar.
- Cabe en consumer GPU: no disponible; no se publican variantes cuantizadas (GGUF, AWQ, etc.) que permitan confirmarlo.
- Opciones de despliegue: no se documentan explícitamente vLLM, llama.cpp, Ollama o TGI; el autor referencia el código `actlat-wam` (rama `jungwook/openarm-fred-ft` @407ba01) y el script `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_rel28_base.sh`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| wam-openarm-prq30-rh-cog-humvid-v1-ema-50k-ckpt50000 | ~5B (backbone Wan2.2-TI2V-5B) | no disponible | other | HuggingFace, 0 descargas |
| rel28-rh-cog-humvid (referencia del autor) | no disponible | no disponible | no disponible | mencionado como contraparte PRQ30 |
| Wan2.2-TI2V-5B (backbone base) | ~5B | no disponible | no disponible | público como modelo de vídeo |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia "other": no se especifican términos de uso comercial; es necesario revisar las condiciones del autor antes de cualquier despliegue en producción.
- El modelo está entrenado para un embodiment concreto (OpenArm con PRQ30 v1, cámara ZED derecha, frame fijo pitch 1.2 / yaw -0.3); usarlo con otra configuración de cámara o robot requiere recalcular FK y normalización.
- La normalización depende de `statistics.json` de este checkpoint; mezclar estadísticas de otros checkpoints produce acciones incorrectas.
- Las máscaras de validez por dimensión deben aplicarse en inferencia (por ejemplo, en el escenario plátano, poner a cero las 15 dimensiones izquierdas tras normalizar e ignorar las salidas izquierdas).
- No hay datos publicados de sesgos, alucinación o robustez fuera de distribución; el riesgo de generalización a escenas no vistas no está cuantificado.
- No se documentan capacidades multilingües ni de texto general; el modelo es específico de robótica.
- El checkpoint excluye estados del optimizador DeepSpeed, por lo que no está pensado para reanudar entrenamiento tal cual.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- No se publican variantes cuantizadas ni guías de despliegue en vLLM/Ollama/TGI, lo que dificulta la puesta en producción.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/wam-openarm-prq30-rh-cog-humvid-v1-ema-50k-ckpt50000
- Contrato de conversión PRQ30: `docs/PRQ30_FRAME_V1_CONTRACT.md` (referenciado en la model card, no se proporciona URL)
- Código: actlat-wam, rama `jungwook/openarm-fred-ft` @407ba01 (no se proporciona URL)
- Script de entrenamiento: `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_rel28_base.sh` (no se proporciona URL)
- Modelo de referencia: `rel28-rh-cog-humvid` (no se proporciona URL)
- Backbone: Wan2.2-TI2V-5B (no se proporciona URL directa en la información)
