# jungwook2358/wam-openarm-rel28-rh-cog-humact-ema-50k-ckpt50000

## Resumen

wam-openarm-rel28-rh-cog-humact-ema-50k-ckpt50000 es un modelo de robótica (pipeline `robotics`) desarrollado por el usuario de HuggingFace jungwook2358. Se trata de un checkpoint de investigación (paso 50.000) de un modelo de política visomotora entrenado sobre el backbone de vídeo Wan2.2-TI2V-5B, orientado a la manipulación robótica del brazo OpenArm con representación de acción en 28 dimensiones articulares. El modelo combina datos de robot y de humano mediante retargeting, incorporando alineamiento cognitivo (CogAlign) sobre keypoints FP48.

El modelo resuelve el problema de aprender políticas de acción a partir de vídeo e instrucciones, generando directamente articulaciones de 28 dimensiones (cuello, brazos y manos) sin necesidad de cinemática directa o inversa en inferencia. Su relevancia es acotada: es un artefacto de experimento (EXP-0019) con cero descargas y cero likes, publicado en noviembre de 2026, pensado para reproducir un entrenamiento concreto más que para uso general.

El repositorio ocupa 32,5 GB e incluye el checkpoint completo del HuggingFace Trainer con shards safetensors, configuración, estadísticas de normalización y estados de entrenamiento (sin los estados del optimizador DeepSpeed). La información disponible no detalla el número de parámetros del modelo ni la longitud de contexto en tokens de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre backbone de vídeo Wan2.2-TI2V-5B; variante "dit4dit" según los scripts de entrenamiento |
| Parámetros totales | no disponible (el backbone de referencia Wan2.2-TI2V-5B tiene 5B, pero no se confirma el total del modelo completo) |
| Parámetros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar documentada) |
| Idiomas soportados | no disponible (modelo de robótica; no se documentan idiomas) |
| Licencia | other (licencia personalizada, sin texto detallado en la información disponible) |
| Formato de pesos | safetensors (shards con índice), más config.json, processor_config.json, statistics.json, embodiment_id.json |

## Arquitectura y entrenamiento

El modelo parte de Wan2.2-TI2V-5B entrenado desde cero, con una formulación de image-to-video (I2V) de stride 3: 1 frame de condición y 8 frames futuros. La entrada visual es estéreo concatenada en vertical a resolución 192x256 con recorte de aspecto, y se aplica una máscara de vistas con proporciones 0.5/0.25/0.25 (la vista izquierda ausente se renderiza en negro). La receta de entrenamiento usa batch efectivo de 64 (pd16 x 4 GPU, exactamente 32 filas de robot y 32 de humano), 50.000 pasos, warmup de 2.500, learning rate 1e-4, weight decay 0.01, scheduler coseno con suelo 0.1 y semilla 42. No se emplean teacher model ni pérdida de representación.

La innovación principal es la supervisión conjunta de robot y humano con la misma etiqueta de embodiment (`new_embodiment`). Los datos humanos provienen de un retargeting HaWoR->OpenArm de 28 dimensiones con columnas de validez por dimensión y estadísticas enmascaradas; la pérdida de acción solo se aplica donde la fila es válida (cuello y mayormente el lado izquierdo quedan inválidos). Se aplica CogAlign con peso 0.2 sobre keypoints FP48 y un término de delta futuro de 0.2, y tanto la pérdida cognitiva como la pérdida de flow matching de acción fluyen hacia el backbone de vídeo (`WAM_COGALIGN_DETACH=0`, `WAM_ACTION_GRAD_TO_VIDEO=1`). La acción se representa como 28 dimensiones relativas: cuello 2, brazo izquierdo 7, brazo derecho 7, mano izquierda 6, mano derecha 6; los brazos son acción menos estado en el instante t, normalizados con cuantiles q01/q99, mientras que cuello y manos son absolutos. Se guarda una EMA de vídeo y de acción para servir con o sin EMA.

## Capacidades

- Generación de acciones robóticas en 28 dimensiones articulares (cuello, ambos brazos y ambas manos) a partir de observación visual estéreo e instrucción.
- Predicción de vídeo futuro (8 frames) como parte del proceso de difusión image-to-video.
- Control de brazo y mano derecha marcado explícitamente como grupo de acción activo (marcador "banana": brazo derecho y mano derecha).
- Aprendizaje conjunto de datos de robot y de humano mediante retargeting, con enmascaramiento de dimensiones inválidas.
- Alineamiento cognitivo sobre keypoints FP48 (CogAlign) para mejorar la correspondencia entre percepción y acción.
- Inferencia directa de articulaciones sin cinemática directa ni inversa.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión general, audio: no disponibles (la visión es específica de entrada robótica estéreo).

## Casos de uso

- Investigación en políticas visomotoras: servir el checkpoint para reproducir el experimento EXP-0019 y comparar el efecto de CogAlign y de la supervisión humana retargetizada frente a la línea base de huiwon.
- Manipulación con brazo OpenArm: el modelo emite 28 articulaciones relativas al estado actual, por lo que puede conectarse directamente a un controlador de bajo nivel del brazo derecho y la mano derecha sin módulo de cinemática inversa.
- Aprendizaje de habilidades a partir de demostraciones humanas: el pipeline de retargeting HaWoR->OpenArm permite aprovechar vídeo humano para ampliar el dataset de entrenamiento del robot, útil en laboratorios con pocas demostraciones reales.
- Evaluación de robustez con vistas enmascaradas: la máscara de vistas 0.5/0.25/0.25 y la renderización en negro de la vista izquierda permiten estudiar el comportamiento del modelo ante entradas incompletas.
- Estudio de representaciones de acción relativas frente a absolutas: la mezcla de brazos relativos (q01/q99) y cuello/manos absolutos sirve como banco de pruebas para diseñar espacios de acción en robótica.
- Fine-tuning sobre nuevos conjuntos de robot: el checkpoint incluye configuración, estadísticas y estados del trainer, lo que facilita reanudar o adaptar el entrenamiento con el script `finetune_openarm_rel28_base.sh`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 32,5 GB en safetensors, por lo que se requiere al menos ese orden de magnitud en memoria si se carga sin cuantizar.
- GPU recomendadas: no disponible; el entrenamiento se realizó con 4 GPU en paralelo (pd16 x 4), sin especificar el modelo exacto.
- ¿Cabe en GPU de consumo? no disponible; con 32,5 GB de pesos, una RTX 4090 de 24 GB no podría cargarlo sin cuantización o particionado, pero no se documenta ninguna ruta de cuantización.
- Opciones de despliegue: no se documentan (no hay referencias a vLLM, llama.cpp, Ollama ni TGI; el código de referencia es la rama `actlat-wam`, `jungwook/openarm-fred-ft`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wam-openarm-rel28-rh-cog-humact-ema-50k-ckpt50000 | no disponible | no disponible | sin benchmarks publicados | other | HuggingFace, 0 descargas |
| Wan2.2-TI2V-5B (backbone base) | 5B (referencia) | no disponible | no disponible en esta ficha | no disponible | modelo público de vídeo |
| Otras políticas robóticas OpenArm | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero likes: no hay evidencia de validación externa ni de uso en producción.
- La model card advierte de que un pod duplicado entrenó el mismo experimento en paralelo entre el 1 y el 2 de noviembre de 2026 y fue eliminado; los pasos 45k-50k los realizó un solo pod, pero la reproducibilidad exacta no está garantizada.
- La supervisión humana está enmascarada parcialmente: el cuello y mayormente el lado izquierdo son inválidos, lo que puede sesgar el aprendizaje hacia el lado derecho.
- La vista izquierda ausente se renderiza en negro, lo que introduce un sesgo visual en los datos de entrenamiento.
- Licencia "other" sin texto detallado en la información disponible: es imprescindible revisar los términos antes de cualquier uso comercial.
- No se documentan idiomas soportados ni capacidades de texto general; no debe tratarse como un LLM.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- El checkpoint excluye los estados del optimizador DeepSpeed, por lo que reanudar el entrenamiento exactamente desde el paso 50.000 requiere reconstruir dichos estados.
- La inferencia depende de `statistics.json` del propio checkpoint para normalizar; usar otras estadísticas produce acciones incorrectas.

## Enlaces

- HuggingFace: https://huggingface.co/jungwook2358/wam-openarm-rel28-rh-cog-humact-ema-50k-ckpt50000
- Dataset de retargeting humano citado: `junbrro/openarm-human-hawor-retarget-prq-fp48-20261030` (referencia en la model card, sin URL directa en la información disponible)
- Dataset base citado: `openarm_wam_v1` (referencia en la model card, sin URL directa en la información disponible)
- Rama de código citada: `actlat-wam`, rama `jungwook/openarm-fred-ft`, script `run_scripts/train/wam_dit4dit/openarm/finetune_openarm_rel28_base.sh` (sin URL directa en la información disponible)
