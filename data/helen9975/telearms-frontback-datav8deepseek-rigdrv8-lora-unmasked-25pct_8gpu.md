# helen9975/telearms-frontback-datav8deepseek-rigdrv8-lora-unmasked-25pct_8gpu

## Resumen

Este repositorio contiene un ajuste fino mediante LoRA del modelo `lerobot/pi05_base`, una política de robótica (vision-language-action, VLA) desarrollada por Hugging Face dentro del ecosistema LeRobot. El fine-tune se ha realizado sobre el conjunto de datos `albagon/telearms-front-to-back-datav8-deepseek-rigdrv8`, orientado a manipulación bimanual con los brazos robóticos YAM (TeleArms). El objetivo es adaptar la política base a una tarea concreta de movimiento "front-to-back" en un entorno de teleoperación.

El entrenamiento se llevó a cabo con 8 GPUs, un batch global de 128 y 26 602 pasos, empleando LoRA con rango 128 y alpha 128. Se entrenó únicamente sobre el 25 % de los fotogramas disponibles (13 620 178 fotogramas procesados), con la visión congelada (`train_vision: False`) y sin máscara de pérdida (`loss_mask: False`). El repositorio incluye tanto los adaptadores LoRA por checkpoint como los pesos fusionados completos en cuatro puntos de guardado.

Se trata de un artefacto de investigación muy específico, con cero descargas y sin model card extendida más allá de la configuración de entrenamiento. No hay información publicada sobre licencia, idiomas ni resultados de evaluación, por lo que su uso en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en `lerobot/pi05_base` (política pi0.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `bfloat16` durante entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores LoRA y pesos fusionados) |
| Tamano del repositorio | 57.9 GB |
| Libreria | lerobot |
| Modelo base | `lerobot/pi05_base` |
| Dataset de entrenamiento | `albagon/telearms-front-to-back-datav8-deepseek-rigdrv8` (revision `edba7817ba61d13d12f7180da5415fb227bf8216`) |
| Chunk size / n_action_steps | 50 / 50 |
| Precisión de política | bfloat16 |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi05_base`, una política VLA del ecosistema LeRobot que combina un codificador visual con un modelo de lenguaje y un cabezal de acciones. Sobre esta base se aplicó un ajuste fino LoRA con `lora_r = 128` y `lora_alpha = 128`, manteniendo congelada la torre de visión (`train_vision: False`). La atención se ejecutó con SDPA y sin gradient checkpointing (`grad_checkpointing: false`), con 15 workers por GPU para la carga de datos.

El entrenamiento usó 8 GPUs con `batch_per_gpu = 16` (batch global 128), 26 602 pasos, semilla 1000 y un scheduler lineal con warmup de 1000 pasos y decaimiento hasta 26 602 pasos. El learning rate del optimizador fue `7.071e-05` (equivalente a `lora_lr = 0.0002828` escalado por `lr_scale = 2.82843`), con decaimiento final a `7.071e-06`. Solo se utilizó el 25 % de los datos (`fraction: 0.25`), con un split de evaluación del 9.83 %. Se guardaron checkpoints cada 1331 pasos y se generaron pesos fusionados en los pasos 6655, 13310, 19965 y 26602. No se aplicó máscara de pérdida (`use_loss_mask: False`), lo que implica que la pérdida se calcula sobre todas las posiciones sin enmascarar.

## Capacidades

- Control de robots bimanuales tipo YAM mediante predicción de secuencias de acciones (`n_action_steps = 50`).
- Política vision-language-action: procesa observaciones visuales y genera acciones motoras.
- Ajuste específico para la tarea "front-to-back" del dataset TeleArms.
- Entrenado sobre datos de teleoperación con etiquetas derivadas de DeepSeek (según el nombre del dataset).
- No se documentan capacidades de tool calling, agentes, multilingüismo ni modos de razonamiento explícito.
- No se documentan capacidades de visión general más allá del uso como entrada de política.

## Casos de uso

- Manipulación bimanual en laboratorio: el modelo puede ejecutar secuencias de movimiento "front-to-back" con los brazos YAM tras el fine-tune, sirviendo como política de referencia para experimentos de teleoperación.
- Investigación en aprendizaje por imitación: el adaptador LoRA permite estudiar el efecto del ajuste sobre una política VLA base sin reentrenar todos los parámetros.
- Comparación de checkpoints: los pesos fusionados en cuatro pasos (6655, 13310, 19965, 26602) permiten analizar la evolución del rendimiento a lo largo del entrenamiento.
- Reproducción de experimentos: la configuración de lanzamiento y el `train_config.json` documentados facilitan replicar el entrenamiento con LeRobot.
- Base para nuevos fine-tunes: al ser un adaptador LoRA sobre pi0.5, puede servir como punto de partida para otras tareas de manipulación con datos propios.
- Evaluación de estrategias de enmascarado de pérdida: al haberse entrenado con `loss_mask: False`, permite comparar contra variantes con máscara en el mismo dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entrenamiento realizado con 8 GPUs (modelo no especificado), batch por GPU de 16 y 15 workers por GPU.
- VRAM estimada para inferencia: no disponible. El repositorio ocupa 57.9 GB e incluye adaptadores y pesos fusionados, pero no se detalla el tamaño del modelo base.
- GPU recomendadas: no disponible. El entrenamiento usó 8 GPUs, pero no se indica el modelo concreto (A100, H100 u otras).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: LeRobot (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (LoRA sobre pi05_base) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas | Fine-tune específico TeleArms |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | Hugging Face (modelo base) | Política VLA base sin ajuste |
| Otros fine-tunes de pi0.5 en LeRobot | no disponible | no disponible | variable | Hugging Face | No se dispone de datos comparativos |

No se dispone de información suficiente para comparar parámetros, contexto o rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Modelo altamente específico: entrenado solo sobre el 25 % de los datos y para una tarea concreta ("front-to-back"), por lo que su generalización a otras tareas es limitada.
- Sin model card extendida: no hay descripción de sesgos, riesgos de alucinación ni limitaciones declaradas por el autor.
- Licencia no disponible: no se puede confirmar el uso comercial; es necesario contactar con el autor o revisar la licencia del modelo base `lerobot/pi05_base`.
- Idiomas no disponibles: al ser una política robótica, la noción de idioma no aplica directamente, pero no se documenta el idioma de las instrucciones.
- Sin resultados de evaluación publicados: no hay métricas de éxito en la tarea ni comparaciones con el modelo base.
- Repositorio de 57.9 GB: requiere espacio de almacenamiento considerable y no se detalla qué checkpoints son necesarios para inferencia.
- `git_tree_modified: True` en la configuración: indica que el árbol de código no estaba limpio durante el entrenamiento, lo que puede afectar a la reproducibilidad exacta.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/helen9975/telearms-frontback-datav8deepseek-rigdrv8-lora-unmasked-25pct_8gpu
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/albagon/telearms-front-to-back-datav8-deepseek-rigdrv8
- LeRobot (librería): https://github.com/huggingface/lerobot
