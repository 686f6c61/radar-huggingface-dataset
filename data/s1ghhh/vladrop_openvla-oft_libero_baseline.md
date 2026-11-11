# s1ghhh/VLADrop_OpenVLA-OFT_LIBERO_Baseline

## Resumen

VLADrop_OpenVLA-OFT_LIBERO_Baseline es un checkpoint de robótica de tipo vision-language-action (VLA) publicado por el usuario s1ghhh como parte del trabajo "Drop-Then-Recovery: How Redundant Are Vision-Language-Action Models?". Se trata del modelo base OpenVLA-OFT sin podar (0 de 32 bloques eliminados), es decir, el punto de referencia completo sobre el que se aplica la técnica DTR (Drop-Then-Recovery), que elimina bloques transformer de un VLA preentrenado y reajusta el modelo denso resultante mediante fine-tuning de recuperación.

El modelo resuelve el problema de control robótico de manipulación a partir de instrucciones en lenguaje natural e imágenes, evaluado sobre el conjunto de tareas LIBERO. Con 7.541.237.184 parámetros (aproximadamente 7,5 mil millones) y un repositorio de 28,6 GB en formato safetensors, está pensado para su uso dentro del ecosistema VLADrop, que requiere una versión modificada de transformers para reconstruir el grafo podado a partir de las listas de bloques eliminados embebidas en `config.json`.

Es relevante ahora porque sirve como referencia cuantitativa para medir cuánta redundancia estructural toleran los modelos VLA: cualquier checkpoint podado del mismo proyecto se compara contra esta línea base, que alcanza una tasa de éxito media del 95,0 % en LIBERO. No obstante, su uso está restringido a investigación en robótica y requiere el código y las dependencias específicas del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en OpenVLA-OFT; transformer con codificador visual, proyector de propriocepción y cabeza de regresión L1 |
| Parametros totales | 7.541.237.184 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural, idioma no especificado) |
| Licencia | MIT |
| Formato de pesos | safetensors (incluye `action_head--*.pt` y `proprio_projector--*.pt`) |

## Arquitectura y entrenamiento

El checkpoint es un OpenVLA-OFT completo (sin bloques eliminados) con arquitectura transformer multimodal: procesa dos imágenes de entrada más información de propriocepción y genera acciones mediante una cabeza de regresión L1. Las listas de bloques a eliminar (`text_config.drop_attn_list` y `drop_mlp_list`) están incluidas en `config.json`, aunque en este caso están vacías al tratarse de la línea base 0/32; la evaluación reconstruye el grafo podado automáticamente a partir de esas listas.

El entrenamiento de recuperación se realizó con LoRA de rango 32 (posteriormente fusionado en los pesos completos), regresión L1, dos imágenes de entrada más propriocepción, tamaño de lote 16, 50.000 pasos y tasa de aprendizaje 5e-4. No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica del proyecto es el procedimiento DTR, que mide la redundancia de los VLA eliminando bloques y recuperando el rendimiento con fine-tuning.

## Capacidades

- Control robótico de manipulación a partir de instrucciones en lenguaje natural e imágenes (dos imágenes de entrada).
- Integración de propriocepción mediante un proyector dedicado.
- Generación de acciones continuas mediante cabeza de regresión L1.
- Evaluación sobre las suites de tareas LIBERO: Spatial, Object, Goal y Long.
- Soporte de ejecución con el pipeline de evaluación `run_libero_eval_random_dropped`.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general ni otras modalidades (audio, vídeo).

## Casos de uso

- Investigación sobre redundancia estructural en VLA: este checkpoint sirve como referencia completa (0/32 bloques eliminados) para comparar contra variantes podadas y cuantificar la pérdida de rendimiento atribuible a la poda.
- Evaluación de manipulación en LIBERO Spatial: ejecutar la suite con 50 ensayos por tarea y recorte central para reproducir la tasa de éxito del 97,2 % reportada por el autor.
- Evaluación en LIBERO Object: validar el rendimiento de 98,4 % en tareas de manipulación de objetos, útil como base para estudiar qué tipo de tareas toleran mejor la compresión.
- Evaluación en LIBERO Goal y Long: medir el comportamiento en tareas de horizonte largo (88,6 % de éxito), el escenario más sensible a la poda según los resultados del proyecto.
- Reproducción de experimentos del paper: el checkpoint permite reproducir la fila de la Tabla 1 y Tabla 7 correspondiente a la línea base OpenVLA-OFT.
- Punto de partida para fine-tuning de recuperación: sirve como modelo inicial completo sobre el que aplicar las listas de bloques a eliminar y ejecutar el entrenamiento LoRA descrito.

## Benchmarks y rendimiento

| Suite LIBERO | Tasa de éxito (%) |
|---|---|
| Spatial | 97,2 |
| Object | 98,4 |
| Goal | 95,6 |
| Long | 88,6 |
| Media | 95,0 |

Estos son los únicos resultados publicados en la información disponible. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7,54 mil millones de parámetros en precisión completa (fp16/bf16) se requieren aproximadamente 15 GB solo para pesos, más memoria para activaciones y las dos imágenes de entrada.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 24 GB o más (RTX 4090, A100, H100) es el entorno razonable para fp16.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en fp16, aunque no está confirmado en la documentación.
- Opciones de despliegue: requiere la versión modificada de transformers `transformers-openvla-oft-dropped` del repositorio https://github.com/s1ghhh/VLADrop; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | LIBERO (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLADrop_OpenVLA-OFT_LIBERO_Baseline (este) | 7,54 B | no disponible | 95,0 % | MIT | Hugging Face |
| Variantes podadas de VLADrop | no disponible | no disponible | no disponible | MIT (presumible) | mismo repositorio del proyecto |
| OpenVLA-OFT original | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en control robótico sobre LIBERO; no es un modelo de propósito general y no debe usarse para tareas de texto, código o razonamiento.
- Requiere código y dependencias específicas (`transformers-openvla-oft-dropped`); no funciona con transformers estándar sin modificaciones.
- Los resultados reportados (95,0 % de media) proceden del propio autor y no se han verificado de forma independiente en la información disponible.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas; el idioma de las instrucciones no está especificado.
- La licencia MIT permite uso comercial, pero el despliegue en robótica real exige validación de seguridad propia; el modelo se ha evaluado en simulación (LIBERO).
- El repositorio tiene un uso muy bajo (25 descargas, 0 likes), lo que reduce la probabilidad de validación comunitaria.
- El checkpoint incluye pesos completos fusionados tras LoRA; modificarlo o repodarlo requiere respetar la licencia MIT y citar el paper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s1ghhh/VLADrop_OpenVLA-OFT_LIBERO_Baseline
- Paper (arXiv): https://arxiv.org/abs/2606.27755
- Repositorio de código: https://github.com/s1ghhh/VLADrop
