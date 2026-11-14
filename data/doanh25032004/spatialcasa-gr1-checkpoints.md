# doanh25032004/SpatialCasa-GR1-checkpoints

## Resumen

SpatialCasa-GR1-checkpoints es un repositorio de pesos de políticas robóticas de tipo vision-language-action (VLA) afinadas para el robot humanoide GR1 en el entorno de manipulación RoboCasa. Lo publica el usuario doanh25032004 (vinculado al proyecto SpatialLIBERO) y contiene dos checkpoints entrenados sobre el conjunto de datos SpatialCasa-GR1: un fine-tune completo de π0.5 (openpi, PaliGemma 2B más un experto de acción de 300M) y un fine-tune de GR00T N1.7 3B de NVIDIA. El problema que aborda es la evaluación de generalización espacial en tareas de manipulación de mesa: colocar objetos según relaciones espaciales en escenarios vistos y novedosos.

El repositorio es relevante porque publica los pesos exactos que respaldan las filas GR1 de la tabla de resultados del artículo SpatialCasa, junto con las evaluaciones cerradas de 5.700 episodios, lo que permite reproducir y comparar ambas políticas sobre el mismo banco de pruebas. No es un modelo de propósito general: es material de investigación en robótica con instrucciones de tarea en lenguaje natural, una cámara egocéntrica de 256x256 y estado/acción articular de 29 dimensiones.

Ambos checkpoints se inicializan desde modelos base preentrenados (RoboCasa365 π0.5 y nvidia/GR00T-N1.7-3B) y se afinan con datos de 12 tareas de LeRobot v2.0, 1.000 demos cada una (11.996 episodios tras descartar 4 con mp4 ilegibles).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5: VLM PaliGemma (SigLIP + Gemma-2B) con experto de acción; GR00T N1.7: transformer VLA de NVIDIA |
| Parametros totales | π0.5: 3.353 B (51 arrays, EMA bf16); GR00T N1.7: 3 B (según modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponibles (instrucciones de tarea en lenguaje natural; idioma no especificado) |
| Licencia | other, heredada de los modelos base (inherited-base-model-licenses) |
| Formato de pesos | π0.5: orbax OCDBT (openpi); GR00T N1.7: safetensors (model-00001-of-00002, model-00002-of-00002) |

## Arquitectura y entrenamiento

El checkpoint π0.5 es un fine-tune completo de la política openpi π0.5, compuesta por un VLM PaliGemma (SigLIP más Gemma-2B) y un experto de acción de 300M parámetros. Se inicializa el VLM desde el checkpoint RoboCasa365 `pi05_pretrain_human300/multitask_learning/75000` y el experto de acción, proyecciones de acción y MLP temporal desde `pi05_base` de openpi. El entrenamiento usa FSDP sobre 4 GPU A100 80GB, batch global de 256, 30.000 pasos (7,68 M muestras, 2,42 épocas), AdamW con LR pico 5e-5, warmup lineal de 1.000 pasos, grad clip 1.0, EMA 0.999 y semilla 42, durante 22,6 horas. La entrada es una imagen `ego_view` redimensionada con padding a 224, estado de 29 dimensiones discretizado en el prompt y una instrucción de tarea; la salida es un chunk de acción de 16x29 (brazos y cintura en delta respecto al estado actual, 12 dimensiones de mano en absoluto 0/1).

El checkpoint GR00T N1.7 es un fine-tune del modelo nvidia/GR00T-N1.7-3B (Isaac-GR00T) mediante una cadena de ejecuciones (`n17_all12_bs64_v2 -> n17_rel_long -> long2 -> long3`, con `n17_rel_long3_b192/checkpoint-30000` como paso acumulado ck190000). La configuración de modalidad es `ROBOCASA_GR1_TABLETOP` (slot 10): brazos y manos en relativo, cintura en absoluto, chunk de acción de 8 pasos a 20 Hz con horizonte de acción del modelo de 40 (con padding). Los datos de entrenamiento provienen de `twanghcmut/SpatialCasa-GR1`: 12 datasets LeRobot v2.0, 1.000 demos por tarea, 11.996 episodios y 3.177.178 frames a 20 Hz, con una cámara `ego_view` de 256x256 y estado/acción de 29 dimensiones.

## Capacidades

- Generación de acciones robóticas de manipulación de mesa a partir de instrucciones en lenguaje natural y una imagen egocéntrica.
- Control de brazo, cintura y mano de un humanoide GR1 mediante chunks de acción (16x29 en π0.5; 8 pasos a 20 Hz en GR00T).
- Razonamiento espacial sobre relaciones entre objetos (colocación de un objeto objetivo según una relación de meta).
- Ejecución de tareas de dificultad variable: fáciles, medias y difíciles, tanto simples como compuestas.
- Generalización a escenarios novedosos de layout (evaluación `eval_novel`).
- Integración como servidor de política mediante ZeroMQ y msgpack (π0.5) o el pipeline de Isaac-GR00T.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Reproducción de resultados de investigación: cargar `pi05_gr1/ck29999` o `groot_n17_gr1/ck190000` y ejecutar la evaluación cerrada de 5.700 episodios con el código de SpatialLIBERO para verificar las tasas de éxito publicadas.
- Comparación de políticas VLA: usar ambos checkpoints sobre el mismo conjunto de evaluación emparejado para analizar diferencias de éxito (π0.5 resuelve 1.224 episodios que GR00T no resuelve, y GR00T 415 que π0.5 no resuelve; McNemar p = 1,6e-92).
- Estudio de generalización espacial: evaluar en `eval_novel` para medir la caída de rendimiento al cambiar celdas de layout no vistas durante el entrenamiento.
- Desarrollo de pipelines de despliegue robótico: servir π0.5 con `serve_vla_gr1.sh` en el puerto indicado y conectar el cliente `Pi05Gr1Policy` mediante el protocolo ZeroMQ/msgpack para integrarlo en un bucle de control real.
- Fine-tuning posterior: partir de estos pesos como inicialización para nuevas tareas de manipulación con el mismo embodiment GR1 y el mismo formato de datos LeRobot.
- Análisis de fallos: usar los resúmenes completos (`eval/*_full_summary.md`) con intervalos de Wilson y desglose de fallos para identificar categorías de error y guiar mejoras del dataset.
- Benchmarking de infraestructura: medir latencia y throughput de inferencia de un VLA de 3B en A100 frente a otras configuraciones de despliegue.

## Benchmarks y rendimiento

Tasa de éxito (%) en evaluación cerrada, 5.700 episodios, agrupada sobre `eval_seen` y `eval_novel`:

| Política | seen | L1 (fácil) | L2 (media simple) | L3 (difícil simple) | media (compuesta) | difícil (compuesta) | media 6 niveles | total |
|---|---|---|---|---|---|---|---|---|
| π0.5 ck29999 | 39,6 | 37,2 | 29,5 | 29,8 | 27,2 | 12,1 | 29,2 | 28,2 |
| GR00T N1.7 ck190000 | 25,0 | 16,7 | 15,9 | 13,3 | 13,8 | 5,2 | 15,0 | 14,1 |
| GR00T N1.7 base (0-shot, no subido) | 0,2 | 0,0 | 0,0 | 0,1 | 0,2 | 0,0 | 0,1 | 0,1 |

Desglose por split del artículo:

| Política | train seen | train fácil | train media | train difícil | novel fácil | novel media | novel difícil | total |
|---|---|---|---|---|---|---|---|---|
| π0.5 ck29999 | 39,6 | 37,8 | 30,2 | 14,6 | 36,7 | 24,3 | 9,6 | 28,2 |
| GR00T N1.7 ck190000 | 25,0 | 18,0 | 13,7 | 4,1 | 15,4 | 13,9 | 6,3 | 14,1 |

Criterio de éxito: el objeto objetivo sobre la relación de meta, inclinación menor de 15 grados, otros objetos movidos menos de 2 cm, liberado y en reposo. No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con pesos bf16 de aproximadamente 3,3 B parámetros se requiere del orden de 7-8 GB solo para pesos, más memoria para activaciones y buffers de imagen.
- GPU recomendadas: el entrenamiento de π0.5 se realizó con 4x A100 80GB (FSDP); para inferencia se documenta el uso de una GPU (variable `GPU=0` en el script de servicio).
- Cabe en GPU de consumo: probable en tarjetas con 16 GB o más (por ejemplo RTX 4090), aunque no se confirma en la información disponible.
- Opciones de despliegue: servidor openpi con ZeroMQ y msgpack (`serve_vla_gr1.sh`, `serve_pi05_gr1.py`); Isaac-GR00T para el checkpoint GR00T. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (SR total) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π0.5 ck29999 (este repo) | 3,353 B | no disponible | 28,2 % | other (heredada) | Hugging Face, 12,2 GB repo |
| GR00T N1.7 ck190000 (este repo) | 3 B | no disponible | 14,1 % | other (heredada) | Hugging Face, 12,2 GB repo |
| GR00T N1.7 base (nvidia) | 3 B | no disponible | 0,1 % (0-shot) | licencia de NVIDIA | Hugging Face (nvidia/GR00T-N1.7-3B) |
| π0.5 base (openpi) | no disponible | no disponible | no disponible | openpi | openpi / RoboCasa365 |

## Limitaciones y advertencias

- Modelo de investigación especializado en un único embodiment (GR1) y un único entorno (RoboCasa de manipulación de mesa); no es un modelo de lenguaje general.
- El rendimiento absoluto es bajo: la mejor política alcanza 28,2 % de éxito global y solo 12,1 % en tareas compuestas difíciles.
- Riesgo de sobreajuste al layout de entrenamiento: la tasa cae en escenarios novedosos (π0.5 de 39,6 % a 36,7 % en fácil, y de 14,6 % a 9,6 % en difícil).
- La licencia es "other" heredada de los modelos base; es necesario revisar `LICENSE_NOTICE.md` y las licencias de nvidia/GR00T-N1.7-3B y openpi antes de cualquier uso comercial.
- Los checkpoints no incluyen estado del optimizador; no están pensados para reanudar entrenamiento directamente.
- El checkpoint GR00T no sube `training_args.bin`; algunos flujos de reproducción pueden requerir reconstruir la configuración.
- Los idiomas soportados no están especificados; las instrucciones de tarea se proporcionan en lenguaje natural sin garantía multilingüe.
- No se han publicado métricas de latencia, throughput ni consumo de memoria en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/doanh25032004/SpatialCasa-GR1-checkpoints
- Aviso de licencia: https://huggingface.co/doanh25032004/SpatialCasa-GR1-checkpoints/blob/main/LICENSE_NOTICE.md
- Dataset: https://huggingface.co/datasets/twanghcmut/SpatialCasa-GR1
- Código (rama robocasa-spatial-vla): https://github.com/Eric-nguyen1402/SpatialLIBERO
- Documentación del proyecto: `docs/SPATIALCASA_GR1.md` en el repositorio anterior
- Modelo base GR00T: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Checkpoints RoboCasa365: https://huggingface.co/robocasa/robocasa365_checkpoints
- Resúmenes de evaluación: `eval/pi05_ck29999_full_summary.md` y `eval/groot_n17_ck190000_full_summary.md` dentro del repositorio
