# seungkukim/dexjoco_bimanual_multitask_hand_dn_beta3_wdn1_joint_wan22ti2v5b_L18_txtcache-60k

## Resumen

Este modelo es un checkpoint de robótica basado en la arquitectura DiT4DiT, desarrollado por seungkukim. Se trata de un *world-model* que combina un backbone de video Wan2.2-TI2V-5B (de la familia Wan2.2) con un *action head* DiT-B y un stream de geometría de mano, incluyendo un grupo de *denoising-privilege* (DN). El modelo ha sido fine-tuneado sobre el dataset DexJoCo bimanual multitask, orientado a tareas de manipulación robótica bimanual.

Con aproximadamente 5,9 mil millones de parámetros, este checkpoint está diseñado para predecir acciones de robot (específicamente poses de mano de 66 dimensiones) a partir de observaciones de video y texto, funcionando como un modelo de mundo generativo. Su relevancia radica en que combina generación de video con control de acciones, una tendencia emergente en robótica basada en modelos de difusión. El checkpoint se distribuye únicamente con archivos de inferencia, excluyendo artefactos de entrenamiento, y requiere el snapshot base de Wan2.2-TI2V-5B para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT4DiT (backbone Wan2.2-TI2V-5B + action head DiT-B con stream de geometría de mano y grupo DN) |
| Parametros totales | 5.902.442.058 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en DiT4DiT, un enfoque que combina un modelo de difusión de video (Wan2.2-TI2V-5B) con un *action head* adicional de tipo DiT-B. El backbone de video maneja la generación y comprensión de secuencias visuales, mientras que el *action head* produce comandos de control del robot. Además, se incluye un stream de geometría de mano que procesa poses de mano de 66 dimensiones (33 por cada mano), con codificación y decodificación dedicadas. El grupo de *denoising-privilege* (DN) introduce una señal auxiliar de denoising con peso 0,5 y un parámetro beta de 3,0, aplicando un ruido controlado en un rango de 9 a 22 dB.

El entrenamiento se realizó sobre el dataset DexJoCo bimanual multitask, con un total de 60.000 pasos de optimización. Se utilizaron embeddings de texto umT5 pre-cacheados (txtcache) y extracción de características del backbone en la capa 18 de 30. No se han publicado detalles sobre el número exacto de tokens de entrenamiento ni la composición del dataset. El checkpoint solo incluye los pesos de inferencia; los estados del optimizador y otros artefactos de entrenamiento fueron excluidos deliberadamente.

## Capacidades

- Generación de acciones de robot bimanual: el modelo predice poses de mano (posición, rotación 6D, posiciones de yemas y articulaciones) para dos manos simultáneamente.
- Modelo de mundo generativo: combina comprensión de video con generación de acciones, lo que permite simular y planificar secuencias de manipulación.
- Integración con Wan2.2-TI2V-5B: hereda las capacidades de generación de video del backbone base, aunque no se especifica si se puede usar para generación de video independiente.
- Soporte de texto condicionado: utiliza embeddings de texto umT5, lo que sugiere capacidad de condicionamiento por instrucciones en lenguaje natural (aunque no se detallan idiomas específicos).
- No se reportan capacidades de *tool calling*, agentes o razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Control de robots bimanuales en entornos simulados: el modelo puede generar comandos de acción para dos manos a partir de observaciones visuales y texto, útil para entrenar políticas de control en simulación (por ejemplo, con MuJoCo o Isaac Sim).
- Planificación de trayectorias de manipulación: dado un objetivo descrito en texto y una secuencia de video, el modelo puede proponer poses de mano intermedias, facilitando la planificación de movimientos complejos.
- Generación de datos sintéticos para entrenamiento: al ser un modelo de mundo, puede generar pares (observación, acción) sintéticos para aumentar datasets de robótica, reduciendo la necesidad de recolección física.
- Evaluación de políticas en *world models*: permite probar políticas de control en un entorno latente generado por el modelo, acelerando el desarrollo de algoritmos de *reinforcement learning*.
- Teleoperación asistida: el modelo puede sugerir poses de mano para tareas de teleoperación, mejorando la precisión en manipulaciones delicadas.
- Investigación en modelos de mundo para robótica: sirve como referencia para estudiar la integración de generación de video y control de acciones en arquitecturas unificadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos de robótica.

## Requisitos de hardware

- VRAM estimada: con 5,9 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 11,8 GB. La inferencia completa, incluyendo el backbone de video y el action head, probablemente requiera más de 24 GB de VRAM, aunque no se especifica.
- GPU recomendadas: se asume que GPUs de gama alta como A100 (40/80 GB) o H100 serían adecuadas. En consumer, una RTX 4090 (24 GB) podría ser insuficiente si se incluye el procesamiento de video, pero no hay datos confirmados.
- Opciones de despliegue: no se mencionan herramientas específicas (vLLM, llama.cpp, etc.). El modelo se carga mediante `transformers` y la clase `WAMDiT4DiT`, por lo que es compatible con pipelines de HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables de la misma categoría (world-models robóticos con generación de video y control bimanual) en la informacion proporcionada. Se sugiere comparar con otros modelos de la familia Wan2.2 o con enfoques como UniPi o RT-2, pero no hay datos concretos.

## Limitaciones y advertencias

- El modelo no es autocontenido: requiere descargar el snapshot base de Wan2.2-TI2V-5B-Diffusers. El `config.json` apunta a una ruta local de entrenamiento (`/data/seungku/hf_cache/...`), por lo que es obligatorio sobrescribir `wan_model_path` a `Wan-AI/Wan2.2-TI2V-5B-Diffusers` y establecer `wan_local_files_only=false` antes de cargar en otra máquina.
- Las estadísticas de normalización de manos se cargan desde un archivo JSON incluido en el repo, pero la ruta se resuelve contra el directorio de trabajo actual. Si no se carga desde el directorio del snapshot, hay que especificar `hand_action_norm_stats_path` manualmente.
- Licencia "other": no se especifican términos, lo que puede implicar restricciones de uso comercial o modificaciones. Se recomienda contactar al autor antes de usar en producción.
- No se han documentado sesgos ni riesgos de alucinación específicos, pero al ser un modelo de generación, puede producir acciones no factibles o inconsistentes con la física.
- El modelo está orientado a robótica bimanual y no se ha validado en otros dominios; su uso fuera de este ámbito no está garantizado.
- No se proporcionan datos sobre idiomas soportados ni rendimiento en tareas de texto general.

## Enlaces

- Repositorio HuggingFace: [seungkukim/dexjoco_bimanual_multitask_hand_dn_beta3_wdn1_joint_wan22ti2v5b_L18_txtcache-60k](https://huggingface.co/seungkukim/dexjoco_bimanual_multitask_hand_dn_beta3_wdn1_joint_wan22ti2v5b_L18_txtcache-60k)
- Dataset DexJoCo bimanual multitask: [seungkukim/dexjoco_lerobot_v20](https://huggingface.co/datasets/seungkukim/dexjoco_lerobot_v20)
- Modelo base Wan2.2-TI2V-5B: [Wan-AI/Wan2.2-TI2V-5B-Diffusers](https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers)
