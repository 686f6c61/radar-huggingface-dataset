# jungwook2358/wam-openarm-prq30-base-ema-50k-ckpt50000

## Resumen

wam-openarm-prq30-base-ema-50k-ckpt50000 es un checkpoint de investigación en robótica publicado por el usuario jungwook2358 en HuggingFace. Se trata de una réplica de un entrenamiento previo del autor huiwon (`huiwon/isaac_wan22_openarm_wam_v1_b32_i2v_base_norep_relq99_50k`) realizada en un fork propio del código, con un espacio de acciones distinto: acciones absolutas PRQ30 para el robot OpenArm. El modelo se enmarca en la pipeline de robótica y se distribuye como checkpoint de entrenamiento (formato HuggingFace Trainer) listo para servir o continuar el entrenamiento.

La arquitectura subyacente es Wan2.2-TI2V-5B, un modelo de difusión de vídeo de aproximadamente 5.000 millones de parámetros, adaptado aquí como política visomotora (video-action model) entrenada desde cero sobre seis subconjuntos de datos de robot. El modelo recibe observaciones visuales estéreo (192x256, concatenadas en vertical con recorte de aspecto) y predice acciones futuras del robot mediante un cabezal de acción específico, con gradientes de acción detenidos (stop-gradient) hacia el backbone de vídeo.

Su relevancia es acotada pero concreta: documenta un contrato de conversión de acciones (PRQ30, FRAME V1) y una receta de entrenamiento reproducible (50.000 pasos, batch 32, learning rate 1e-4), e incluye copias EMA tanto del backbone de vídeo como del cabezal de acción, lo que permite servir el checkpoint con pesos EMA (por defecto en el despliegue del autor original) o con pesos vivos. No obstante, se trata de un artefacto experimental sin benchmarks publicados, sin descargas y con licencia "other" no detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan2.2-TI2V-5B (modelo de difusión de vídeo transformer) adaptado como política visomotora; cabezal de acción con stop-gradient hacia el backbone |
| Parametros totales | aproximadamente 5.000 millones (backbone Wan2.2-TI2V-5B); parámetros del cabezal de acción no disponibles |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible (ventana de vídeo: 1 frame de condición + 8 frames futuros, stride 3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades lingüísticas documentadas) |
| Licencia | other (términos no especificados en la model card) |
| Formato de pesos | safetensors (8 shards, checkpoint de HuggingFace Trainer con index, config.json, processor_config.json, statistics.json, embodiment_id.json) |

## Arquitectura y entrenamiento

El modelo parte de Wan2.2-TI2V-5B, un transformer de difusión para generación de vídeo imagen-a-vídeo, y lo reconvierte en una política robótica que predice acciones a partir de observaciones visuales. La entrada visual es estéreo a resolución 192x256, concatenada en vertical con recorte de aspecto y una máscara de vistas con pesos 0,5/0,25/0,25. El entrenamiento usa un esquema I2V con stride 3 (1 frame de condición y 8 frames futuros) y un espacio de acciones PRQ30 absoluto para ambas manos, codificado como `[wrist_pos3|rot6d6|hand_q6]` en el marco de la cámara derecha ZED, con normalización q01/q99 y máscaras de validez.

La receta de entrenamiento es idéntica a la del run original de huiwon: entrenamiento desde cero sobre seis subconjuntos de datos de robot únicamente (sin datos humanos), aumentación moderada, sin pérdida de profesor ni de repetición, gradientes de acción con stop-gradient hacia el backbone de vídeo, batch 32 (pd8 x 4 GPU), 50.000 pasos, warmup de 2.500 pasos, learning rate 1e-4, weight decay 0,01, decaimiento coseno con suelo 0,1 y semilla 42. El entrenamiento finalizó el 2026-10-29 a las 22:07Z. Se guardaron copias EMA en fp32 del extractor de vídeo (825 tensores, `backbone.extractor._video_ema_model.*`) y del cabezal de acción (`action_ema.*`), aunque el entrenamiento usó pesos vivos (`WAM_VIDEO_EMA=warmup`, `WAM_VIDEO_EMA_TRAIN_EXTRACT=0`). Los estados del optimizador DeepSpeed se excluyeron del checkpoint.

## Capacidades

- Predicción de acciones robóticas absolutas PRQ30 para el robot OpenArm (posición de muñeca, rotación en 6D y articulaciones de mano).
- Política visomotora imagen-a-acción basada en difusión de vídeo, con condicionamiento sobre observaciones estéreo.
- Generación de trayectorias de 8 pasos futuros a partir de 1 frame de condición.
- Soporte de dos modos de servicio: pesos EMA (por defecto en el despliegue del autor original) o pesos vivos, desde el mismo checkpoint.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Investigación en políticas visomotoras: servir el checkpoint como línea base reproducible para comparar variantes de espacio de acciones (PRQ30 frente a otras codificaciones) sobre el mismo backbone Wan2.2-TI2V-5B.
- Manipulación bimanual con OpenArm: el modelo predice acciones absolutas para ambas manos en el marco de la cámara ZED derecha, adecuado para tareas de alcance y agarre con dos brazos.
- Reentrenamiento y ajuste fino: al incluir `trainer_state.json`, scheduler y estados RNG, el checkpoint permite reanudar o continuar el entrenamiento con la misma receta (50k pasos, lr 1e-4, cosine floor 0,1).
- Evaluación de robustez de EMA: comparar el rendimiento de los pesos EMA frente a los pesos vivos en el mismo entorno de simulación o real, ya que ambos se almacenan en el checkpoint.
- Reproducción de experimentos: el contrato `docs/PRQ30_FRAME_V1_CONTRACT.md` y el script `finetune_openarm_rel28_base.sh` con `OPENARM_ACTION=prq30` permiten replicar la conversión de acciones y el pipeline de entrenamiento.
- Estudio de transferencia desde modelos de vídeo: analizar cuánto conocimiento de un modelo de difusión de vídeo de 5B se transfiere a control robótico cuando se entrena solo con datos de robot y sin profesor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un backbone de difusión de vídeo de 5B parámetros en fp16 requiere del orden de 10-12 GB solo para pesos, más memoria para activaciones de vídeo y el cabezal de acción, pero esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponible; el entrenamiento se realizó con 4 GPU (batch 32, pd8 x 4), sin especificar el modelo.
- ¿Cabe en GPU de consumo? no disponible; no se confirma compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: no disponible; el checkpoint es un artefacto de HuggingFace Trainer con 8 shards safetensors, sin instrucciones de servicio publicadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wam-openarm-prq30-base-ema-50k-ckpt50000 | ~5B (backbone) | no disponible | other | HuggingFace, 0 descargas | Réplica con acciones PRQ30 absolutas |
| huiwon/isaac_wan22_openarm_wam_v1_b32_i2v_base_norep_relq99_50k | ~5B (backbone) | no disponible | no disponible | HuggingFace (referenciado) | Run original replicado; espacio de acciones distinto |
| Otros modelos de política robótica de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Modelo experimental de investigación: 0 descargas y 0 likes en el momento de la consulta, sin validación externa documentada.
- Sin benchmarks publicados: no hay métricas de éxito en tareas, lo que impide evaluar su rendimiento frente a alternativas.
- Licencia "other" sin términos detallados: no se puede confirmar el uso comercial; es necesario contactar con el autor o revisar el repositorio de código.
- Entrenado únicamente con seis subconjuntos de datos de robot y sin datos humanos: la generalización a entornos, objetos o morfologías no vistas está limitada por el dominio de entrenamiento.
- Espacio de acciones muy específico (PRQ30 absoluto, marco de cámara ZED derecha, FRAME V1): reutilizarlo fuera de esa configuración requiere respetar el contrato de conversión o reentrenar.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de acción, el riesgo se traduce en predicciones de trayectoria inválidas o inseguras en entornos reales.
- Estados del optimizador DeepSpeed excluidos: el checkpoint no permite reanudar el entrenamiento con el estado exacto del optimizador, solo con el scheduler y los estados RNG.
- Sin información sobre cuantización ni formatos de despliegue ligeros (GGUF, etc.): la integración en producción requeriría trabajo adicional de conversión.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/wam-openarm-prq30-base-ema-50k-ckpt50000
- Run original replicado: https://huggingface.co/huiwon/isaac_wan22_openarm_wam_v1_b32_i2v_base_norep_relq99_50k
- Código: rama `actlat-wam` del repositorio del autor, commit `d64d313`, script `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_rel28_base.sh` (sin URL directa disponible)
- Contrato de conversión: `docs/PRQ30_FRAME_V1_CONTRACT.md` en la rama de código (sin URL directa disponible)
