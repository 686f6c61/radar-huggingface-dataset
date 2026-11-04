# RoboColosseum/yam-lingbot-vla-v2

## Resumen

LingBot-VLA 2.0 (6B) es un modelo de visión-lenguaje-acción (VLA) desarrollado por Robbyant para el control de robots manipuladores. Esta ficha concreta corresponde a un fine-tune completo del checkpoint base `robbyant/lingbot-vla-v2-6b` (con profundidad nativa) sobre el dataset MolmoAct2-BimanualYAM, que contiene más de 720 horas de manipulación bimanual en mesa con dos brazos YAM (32.246 episodios, 76 millones de fotogramas a 30 Hz). El modelo recibe tres cámaras (superior, muñeca izquierda y muñeca derecha), el estado articular de 14 dimensiones y una instrucción en lenguaje natural, y devuelve un chunk de 30 pasos de posiciones articulares absolutas (1 segundo a 30 Hz).

La relevancia de esta publicación es doble. Por un lado, demuestra la adaptación de una receta de fine-tuning de MolmoAct2 a la arquitectura LingBot-VLA, incluyendo el uso del optimizador Muon y las pérdidas auxiliares de destilación de profundidad y de vídeo futuro. Por otro, se publica como checkpoint intermedio (paso 40.000 de un plan de 100.000) sin evaluación open-loop ni en robot real, lo que lo convierte en material de referencia para quienes trabajan en políticas bimanuales más que en un artefacto listo para producción.

El repositorio ocupa 25,5 GB y se distribuye en formato safetensors bajo licencia Apache 2.0, con la librería LeRobot como interfaz de carga. El modelo base es un VLA de 6.000 millones de parámetros con arquitectura MoE (según los defaults de entrenamiento citados, con expertos a un LR distinto del resto), aunque la model card no detalla el número de parámetros activos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en LingBot-VLA 2.0, con mezcla de expertos (MoE) y profundidad nativa |
| Parametros totales | 6B (según nombre del checkpoint base `lingbot-vla-v2-6b`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (las instrucciones del dataset están anotadas por episodio; el idioma no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint en `checkpoints/global_step_40000/hf_ckpt/`) |

## Arquitectura y entrenamiento

El modelo es un fine-tune completo (no LoRA) del VLA LingBot-VLA 2.0 de 6B parámetros, que combina un backbone de visión-lenguaje con un cabezal de acciones y mantiene activas las pérdidas auxiliares de destilación de profundidad y de predicción de vídeo futuro. La receta sigue el protocolo de MolmoAct2-BimanualYAM allí donde es aplicable a LingBot-VLA: tres cámaras (`top`, `left`, `right`), instrucciones anotadas por episodio desde `meta/tasks_annotated.parquet`, acciones de pose articular absoluta de 14 dimensiones (6 articulaciones + pinza por brazo) y chunks de 30 pasos. La normalización usa cotas de percentil 1/99 (`bounds_99_woclip`) calculadas sobre un 1 % aleatorio de fotogramas.

El entrenamiento emplea el optimizador Muon con LR constante de 5e-5 (1,41e-4 para los expertos MoE), batch global de 128 y un plan de 100.000 actualizaciones, de las cuales este checkpoint representa el paso 40.000. Se ejecutó en 2 nodos de 8 H100 a aproximadamente 1,6 s por paso. La pérdida de flow matching evolucionó de 0,115 al inicio a 0,032 en el paso 10.000, 0,031 en el 20.000 y 0,029 en los pasos 30.000 y 40.000, lo que indica una meseta temprana. La receta no especifica ni la normalización ni el optimizador en el paper original, por lo que se adoptaron los valores por defecto del código de MolmoAct2 y de LingBot respectivamente.

## Capacidades

- Control bimanual de robots manipuladores tipo YAM a partir de instrucciones en lenguaje natural.
- Percepción multimodal con tres cámaras simultáneas (vista superior y dos muñecas), lo que permite razonar sobre la escena y sobre la propia configuración de las pinzas.
- Predicción de chunks de acción de 30 pasos (1 segundo a 30 Hz) en pose articular absoluta de 14 dimensiones.
- Condicionamiento por instrucción por episodio (anotaciones del dataset MolmoAct2-BimanualYAM).
- Uso de profundidad nativa como señal auxiliar, heredada del checkpoint base.
- Pérdidas auxiliares de destilación de vídeo futuro durante el entrenamiento (no se usan en inferencia).
- Integración con LeRobot y con el servidor de políticas `deploy.lingbot_vla_v2_policy` del repositorio LingBot-VLA 2.0.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni modos de razonamiento explícito.

## Casos de uso

- Manipulación bimanual en mesa con dos brazos YAM: el modelo está entrenado específicamente sobre este hardware y este dataset, por lo que es el escenario natural de uso; requiere el `robot_config` `molmoact2_yam_abs` y las estadísticas de normalización incluidas en el repo.
- Evaluación open-loop sobre episodios grabados: el script `scripts/open_loop_eval.py` permite comparar las predicciones del modelo con las acciones registradas en el dataset, útil para validar la receta antes de desplegar en robot.
- Investigación en recetas de fine-tuning VLA: sirve como referencia reproducible de cómo adaptar la receta MolmoAct2 (cámaras, acciones, normalización, Muon) a otra familia de modelos (LingBot-VLA), incluyendo los defaults elegidos cuando el paper no los especifica.
- Estudio de la evolución de la pérdida de flow matching en VLAs bimanuales: los checkpoints intermedios (10K, 20K, 30K, 40K) con pérdidas registradas permiten analizar la meseta de entrenamiento en tareas de manipulación.
- Base para fine-tunes posteriores en dominios concretos: al ser un fine-tune completo sobre un dataset grande y diverso de manipulación bimanual, puede servir como punto de partida para adaptaciones a tareas específicas con menos datos.
- Benchmarking de servidores de políticas: el modo `--use_compile --use_length 30` del policy server permite medir latencia y throughput de un VLA de 6B en H100 con compilación de grafos.
- Docencia y divulgación sobre VLAs: el repo incluye configuración resuelta (`lingbotvla_cli.yaml`), estadísticas de normalización y un script de evaluación, lo que facilita reproducir el pipeline completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el checkpoint no ha sido evaluado ni open-loop ni en robot real. El único dato de rendimiento disponible es la pérdida de entrenamiento (flow matching, media sobre ~200 pasos): 0,115 al inicio, 0,032 en el paso 10.000, 0,031 en el 20.000, 0,029 en el 30.000 y 0,029 en el 40.000.

## Requisitos de hardware

- Entrenamiento: 2 nodos de 8 H100 (16 GPU H100 en total), con un rendimiento de ~1,6 s por paso a batch global 128.
- VRAM de inferencia: no disponible en la información proporcionada. Como referencia orientativa del orden de magnitud, un modelo de 6B en safetensors ocupa ~12 GB en fp16, pero el repo completo pesa 25,5 GB e incluye tokenizer, processor y estadísticas; no se documentan requisitos mínimos.
- GPU recomendadas para inferencia: no disponibles. El entrenamiento usó H100; no se indica si el modelo cabe en GPU de consumo.
- Despliegue: el repositorio oficial de LingBot-VLA 2.0 proporciona un servidor de políticas (`python -m deploy.lingbot_vla_v2_policy`) con opciones `--use_compile` y `--use_length 30`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (son herramientas de LLM, no de VLA).
- Dependencias: el entorno se crea con `bash tools/create_train_env.sh`; se requiere `QWEN3VL_PATH` apuntando a Qwen3-VL-4B-Instruct y FFmpeg 7 (torchcodec) para decodificar los vídeos AV1 del dataset.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboColosseum/yam-lingbot-vla-v2 (este) | 6B | no disponible | Fine-tune completo de LingBot-VLA 2.0 sobre MolmoAct2-BimanualYAM (40K pasos de 100K) | Apache 2.0 | HuggingFace, 0 descargas, sin evaluación publicada |
| robbyant/lingbot-vla-v2-6b (base) | 6B | no disponible | Modelo base LingBot-VLA 2.0 con profundidad nativa | no disponible en la información | HuggingFace |
| MolmoAct2 (referencia de receta) | no disponible | no disponible | Modelo de razonamiento de acciones de AllenAI; el dataset BimanualYAM proviene de su ecosistema | no disponible en la información | Paper arXiv 2605.02881 |

La comparación con alternativas de la misma categoría (otros VLAs bimanuales de tamaño similar) no está disponible en la información proporcionada. Los dos modelos listados son el base y la referencia metodológica, no competidores directos.

## Limitaciones y advertencias

- Checkpoint intermedio: es el paso 40.000 de un plan de 100.000 y no ha sido evaluado ni open-loop ni en robot real. No debe considerarse un modelo validado para producción.
- La pérdida de flow matching se estanca en ~0,029 desde el paso 20.000, lo que sugiere que las actualizaciones adicionales hasta 40.000 aportan mejoras marginales; el resto del plan podría no mejorar sustancialmente el resultado.
- Específico de hardware y dataset: entrenado para dos brazos YAM con tres cámaras concretas y acciones de 14 dimensiones en un orden fijo (`left_joint_0..5, left_gripper, right_joint_0..5, right_gripper`). No es transferible a otras configuraciones sin reentrenamiento o adaptación.
- Dependencia de la normalización: usa `bounds_99_woclip` calculado sobre un 1 % aleatorio de fotogramas; los resultados pueden degradarse si se aplica a distribuciones visuales distintas.
- Las rutas a los modelos profesor en los configs son placeholders (`/path/to/...`); la inferencia no los carga, pero cualquier reentrenamiento requerirá sustituirlas.
- El idioma de las instrucciones no se especifica; el dataset está anotado por episodio y no se documenta cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y el carácter intermedio del checkpoint desaconsejan su despliegue sin validación previa.
- No se documentan sesgos, tasas de alucinación ni comportamientos de seguridad del modelo; al ser un VLA, los fallos se traducen en acciones físicas, por lo que se recomienda supervisión y límites de seguridad en el robot.
- El repo no documenta cuantizaciones ni variantes ligeras, lo que limita el despliegue en hardware de menor capacidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RoboColosseum/yam-lingbot-vla-v2
- Modelo base: https://huggingface.co/robbyant/lingbot-vla-v2-6b
- Repositorio de código LingBot-VLA 2.0: https://github.com/robbyant/lingbot-vla-v2
- Dataset MolmoAct2-BimanualYAM: https://huggingface.co/datasets/allenai/MolmoAct2-BimanualYAM-Dataset
- Paper LingBot-VLA 2.0 (arXiv 2607.06403): https://arxiv.org/abs/2607.06403
- Paper MolmoAct2 (arXiv 2605.02881): https://arxiv.org/abs/2605.02881
