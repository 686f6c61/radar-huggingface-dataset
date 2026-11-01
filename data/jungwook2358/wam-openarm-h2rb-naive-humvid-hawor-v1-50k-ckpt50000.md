# jungwook2358/wam-openarm-h2rb-naive-humvid-hawor-v1-50k-ckpt50000

## Resumen

`wam-openarm-h2rb-naive-humvid-hawor-v1-50k-ckpt50000` es un checkpoint de investigación en robótica publicado por el usuario jungwook2358 en HuggingFace. Se trata de un modelo de política visuomotora (vision-language-action implícito) construido sobre Wan2.2-TI2V-5B, un modelo generativo de vídeo de 5B parámetros, al que se le añade una cabeza de acción entrenada mediante *flow matching* conjunto de vídeo y acción. Forma parte de la ablación EXP-0019 del proyecto OpenArm y su propósito es aislar el efecto de las etiquetas de acción humanas en el entrenamiento.

La variante "naive + human VIDEO-ONLY" significa que los cinco subconjuntos de datos humanos (1.187 episodios) contribuyen únicamente a la pérdida de *flow matching* de vídeo, con estado, acción y máscara de acción a cero; la cabeza de acción se supervisa exclusivamente con filas de robot (seis subconjuntos, 553 episodios). El entrenamiento se realizó desde cero sobre Wan2.2-TI2V-5B durante 50.000 pasos en 4 GPU, con 64 filas por paso (32 de robot y 32 humanas).

Es relevante como pieza de un conjunto de ablaciones comparables: el autor indica explícitamente que debe compararse contra `wam-openarm-h2rb-naive-hawor-v1-50k-ckpt50000` (mismos datos humanos pero con acciones utilizadas) para aislar el efecto de las etiquetas de acción humanas, y contra una variante robot-only para aislar el efecto del vídeo humano. No es un modelo listo para producción: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base Wan2.2-TI2V-5B (difusión transformer para vídeo) con cabeza de acción; flow matching conjunto vídeo+acción (DiT4DiT) |
| Parametros totales | Aproximadamente 5B en el modelo base (Wan2.2-TI2V-5B); el total exacto con la cabeza de acción no está disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (horizonte de acción de 24 pasos; contexto de vídeo: 1 fotograma de condición + 8 fotogramas futuros, stride 3) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente bf16/fp32 de entrenamiento; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (modelo de robótica; no se documentan capacidades lingüísticas) |
| Licencia | other (licencia personalizada no detallada en la model card) |
| Formato de pesos | safetensors (3 shards, con index, config.json, processor_config.json, statistics.json, embodiment_id.json) |

## Arquitectura y entrenamiento

El modelo parte de Wan2.2-TI2V-5B, un transformer de difusión para generación de vídeo texto-imagen-a-vídeo, y le acopla una cabeza de acción supervisada mediante *flow matching* conjunto sobre vídeo y acción. La formulación "naive" implica que no se emplean mecanismos auxiliares de alineación como el profesor FRED, iBOT o CogAlign. La representación de acción y estado es PRQ30 para ambas manos: `[izquierda: wrist_pos3 | wrist_rot6d6 | hand_q6 | derecha: idem]`, en valores absolutos, en el marco de la cámara derecha ZED (FRAME V1: cinemática directa del robot en la pose fija de cabeza egopi más transformación afín V1), con normalización q01/q99 y máscaras de validez por fila.

El entrenamiento se ejecutó desde cero durante 50.000 pasos con 4 GPU y 64 filas por paso (32 de robot y 32 humanas, mezcla exacta), finalizando el 27 de octubre de 2026. Los datos siguen la composición del artículo FRED: 6 subconjuntos de robot (553 episodios) y 5 subconjuntos humanos (1.187 episodios), con vídeo estéreo concatenado a 192x256 (vista izquierda humana en negro), stride I2V de 3 y enmascarado de vistas con probabilidades 0,5/0,25/0,25. En esta ablación, las filas humanas tienen estado 0, acción 0 y máscara de acción 0 (`WAM_HUMAN_VIDEO_ONLY=1`), de modo que solo alimentan la pérdida de vídeo. Las raíces humanas basadas en HaWoR v1 se cargan pero sus acciones no se usan.

## Capacidades

- Predicción de acciones robóticas bimanuales en el espacio PRQ30 (posición y rotación de muñeca más articulaciones de mano) a partir de observación visual estéreo.
- Generación de vídeo futuro condicionada a imagen (I2V) con 8 fotogramas futuros y stride 3, usada como señal auxiliar de entrenamiento.
- Control visuomotor de un robot OpenArm con horizonte de acción de 24 pasos.
- Aprendizaje conjunto a partir de datos de robot y de vídeo humano, aunque en esta variante el vídeo humano no aporta supervisión de acción.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en ablaciones de aprendizaje visuomotor: sirve como punto de comparación controlado frente a `wam-openarm-h2rb-naive-hawor-v1-50k-ckpt50000` para medir cuánto aportan las etiquetas de acción humanas al rendimiento de la política.
- Estudio del efecto del vídeo humano sin acción: al compararse con una variante robot-only, permite aislar la contribución del vídeo humano como regularizador de la representación visual.
- Reproducción de experimentos de flow matching conjunto vídeo-acción: el checkpoint incluye `experiment_cfg/`, `trainer_state.json` y estados RNG, lo que facilita reanudar o auditar el entrenamiento.
- Base para fine-tuning en tareas concretas de manipulación bimanual con OpenArm, partiendo de un modelo ya expuesto a 553 episodios de robot.
- Evaluación de representaciones PRQ30 y del marco de cámara FRAME V1 en pipelines de imitación visual.
- Docencia y divulgación sobre entrenamiento de políticas VLA con modelos generativos de vídeo como tronco, usando un checkpoint de 12,5 GB manejable en un servidor de 4 GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; un modelo de aproximadamente 5B parámetros en bf16 requiere del orden de 10-12 GB solo para pesos, más memoria para activaciones de vídeo y la cabeza de acción.
- GPU recomendadas: el entrenamiento usó 4 GPU (modelo no especificado); para inferencia se recomienda al menos una GPU con 24 GB o superior (RTX 4090, A100, H100) para trabajar en bf16.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16 para inferencia; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: no se documentan; el checkpoint es un formato HF-trainer (safetensors + config), por lo que sería desplegable con PyTorch/HuggingFace Transformers y, potencialmente, vLLM no aplica (no es un LLM). No hay integración con llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Datos humanos con acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (naive + human video-only) | ~5B base + cabeza | Horizonte 24 | No (solo vídeo) | other | HuggingFace, 0 descargas |
| `wam-openarm-h2rb-naive-hawor-v1-50k-ckpt50000` | ~5B base + cabeza | Horizonte 24 | Sí (HaWoR v1) | other | HuggingFace (referenciado por el autor) |
| `…-naive-robotonly-…` | ~5B base + cabeza | Horizonte 24 | No aplica (sin datos humanos) | other | Pendiente de subida según el autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin validación externa: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de rendimiento en tareas reales.
- Licencia "other" sin texto detallado en la model card: es imprescindible revisar los términos antes de cualquier uso comercial.
- Entrenado exclusivamente para el robot OpenArm con la configuración PRQ30 y el marco FRAME V1; no es transferible directamente a otros robots o representaciones de acción.
- Depende de la cámara ZED derecha y de la pose fija de cabeza egopi; cambios en la calibración o en el montaje pueden degradar el rendimiento.
- Las filas humanas tienen acción cero: el modelo no aprende a imitar acciones humanas, solo representaciones visuales, lo que puede limitar la generalización a escenarios no cubiertos por los 553 episodios de robot.
- Riesgo de alucinación visual y de deriva en la generación de vídeo futuro, no cuantificado por el autor.
- No se documentan sesgos, cobertura idiomática ni límites de contexto; no debe asumirse ninguno.
- Los estados del optimizador DeepSpeed (72 GB) no están incluidos, lo que limita la reanudación exacta del entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/wam-openarm-h2rb-naive-humvid-hawor-v1-50k-ckpt50000
- Checkpoint de comparación (acciones humanas HaWoR): https://huggingface.co/jungwook2358/wam-openarm-h2rb-naive-hawor-v1-50k-ckpt50000
- Código: rama `jungwook/openarm-fred-ft` del repositorio actlat-wam, commit `c3d1b92` (script `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_prq30_h2rb.sh`, configuración `gr00t/configs/data/openarm_prq30_v1_config.py`)
- Modelo base: Wan2.2-TI2V-5B (no se proporciona enlace directo en la información disponible)
- Artículo FRED: no se proporciona enlace en la información disponible
