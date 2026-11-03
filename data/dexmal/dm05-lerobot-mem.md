# Dexmal/DM05-Lerobot-MEM

## Resumen

DM05-Lerobot-MEM es una conversión al formato LeRobot de los pesos públicos del modelo base Dexmal/DM05-MEM, un modelo de visión-lenguaje-acción (VLA) orientado al control de robots. Lo desarrolla Dexmal y se distribuye con licencia Gemma. La conversión no altera los pesos en BF16: únicamente los empaqueta para que puedan cargarse, entrenarse y ejecutarse con el stack LeRobot de Hugging Face, incluyendo configuraciones de preprocesador, postprocesador y tensores de normalización.

El modelo resuelve el problema de traducir observaciones multimodales (tres cámaras más el estado articular del robot) en secuencias de acciones de control. Su rasgo diferencial es la memoria visual: además de la imagen actual, consume un historial de fotogramas pasados de una cámara principal, lo que permite condicionar la acción en la evolución temporal de la escena y no solo en el instante presente. Esto es relevante para tareas de manipulación que requieren recordar estados previos.

Con 5.157.859.729 parámetros y un repositorio de 10,3 GB, es un modelo de tamaño medio que no está pensado para inferencia en tiempo real en hardware de consumo sin cuantización. La ficha se centra en lo que la model card documenta explícitamente; los datos no publicados se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con memoria visual; detalles internos del transformer no disponibles |
| Parámetros totales | 5.157.859.729 |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible (historial visual de 20 fotogramas con stride 25 por defecto) |
| Tipos de cuantización | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors (BF16), con `config.json`, procesadores y assets en `dm05_processor/` |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un VLA que combina percepción visual multicámara con el estado del robot y genera acciones en el espacio articular. La configuración por defecto del adaptador LeRobot define tres cámaras (`cam_high`, `cam_left_wrist`, `cam_right_wrist`), un estado y acción de 14 dimensiones en valores articulares absolutos, y un prompt de robot `Aloha`. La memoria visual se implementa tomando 20 fotogramas pasados de `observation.images.cam_high` con un stride de 25 fotogramas de control, lo que equivale a un fotograma por segundo en datos capturados a 25 FPS.

El entrenamiento del modelo base no está detallado en la información proporcionada: no se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO. La conversión a LeRobot conserva los pesos BF16 sin cambios y añade perfiles de preprocesador y postprocesador, normalización por cuantiles por dimensión con recorte desactivado, y un `conversion.json` con la procedencia. El alias redundante de embedding de entrada atado se omite del state dict y se reconstruye desde el embedding de salida atado al cargar.

## Capacidades

- Control de robot por visión-lenguaje-acción: genera secuencias de acciones articulares a partir de imágenes y estado.
- Memoria visual temporal: condiciona la predicción en un historial de 20 fotogramas de la cámara principal.
- Percepción multicámara: procesa simultáneamente cámara cenital y dos cámaras de muñeca.
- Predicción por chunks: genera bloques de 25 acciones y ejecuta 25 pasos por chunk.
- Ajuste fino supervisado sobre datasets LeRobot con imágenes, `observation.state`, `action` y descripciones de tarea.
- Configuración de prompt de robot para adaptar el comportamiento al tipo de robot objetivo.
- Mapeo de nombres de cámara mediante `rename_map` para reutilizar datasets con esquemas distintos.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la información.

## Casos de uso

- Manipulación robótica con memoria de estado: el modelo usa el historial de la cámara cenital para recordar la posición previa de objetos y planificar agarres que dependen de lo ocurrido segundos antes.
- Ajuste fino en un robot tipo Aloha: se entrena sobre un dataset LeRobot propio con las tres cámaras y el estado articular de 14 dimensiones, manteniendo el prompt `Aloha`.
- Adaptación a un robot con otro esquema de cámaras: mediante `rename_map` se reasignan `observation.images.top`, `left_wrist` y `right_wrist` a los nombres esperados por el checkpoint.
- Investigación en políticas VLA con memoria: sirve como punto de partida para comparar arquitecturas con y sin historial visual en las mismas tareas.
- Despliegue en pipelines LeRobot: se carga con `DM05Policy.from_pretrained()` y se integra con `make_pre_post_processors` para preprocesar cada observación de control y postprocesar la acción.
- Reentrenamiento con estadísticas del dataset objetivo: se usa la normalización del dataset de destino en lugar de la incluida, evitando desajustes al cambiar de robot o de representación de acción.
- Evaluación de robustez temporal: al ajustar `memory_stride` al frame rate del dataset, se puede estudiar cómo afecta la frecuencia del historial al rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 10-11 GB solo para pesos, más activaciones y buffers de historial visual; el repositorio ocupa 10,3 GB.
- GPU recomendadas: A100 o H100 para entrenamiento y evaluación a escala; RTX 4090 (24 GB) como mínimo práctico para inferencia en BF16.
- GPU de consumo: cabe en RTX 4090 y posiblemente en GPUs de 16 GB solo con cuantización, que no está documentada para este checkpoint.
- Despliegue: stack LeRobot (`lerobot-train`, `DM05Policy`), con `--policy.device=cuda`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son adecuadas para un modelo de control robótico.
- Latencia y throughput: no disponibles. El perfil por defecto asume captura a 25 FPS y chunks de 25 acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria visual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DM05-Lerobot-MEM | 5.157.859.729 | No disponible | Sí, 20 fotogramas por defecto | Gemma | Hugging Face, formato LeRobot |
| Dexmal/DM05-MEM | No disponible en la información | No disponible | Sí | Gemma | Hugging Face, pesos originales |
| Otros VLA (p. ej. familias OpenVLA o RT-2) | No disponible en la información | No disponible | No documentado | No disponible | No disponible |

La información proporcionada solo permite comparar con el modelo base del que deriva. No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables.

## Limitaciones y advertencias

- Los pesos son idénticos al modelo base; esta conversión no mejora ni altera el rendimiento del original.
- El perfil de procesador guardado usa espacio articular, distinto del perfil nativo de inferencia en EEF del release original; mezclarlos produce resultados incorrectos.
- La normalización incluida corresponde al perfil del adaptador; para otro robot o representación de acción deben usarse las estadísticas del dataset objetivo.
- El historial visual exige alimentar cada observación de control por el preprocesador y `select_action()`; llamar a `predict_action_chunk()` directamente requiere secuencia de historial y máscaras de padding explícitas.
- Es necesario reiniciar la política y los procesadores entre episodios para evitar contaminación del estado.
- El stride de memoria debe ajustarse al frame rate del dataset; el valor 25 asume 25 FPS.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática.
- La licencia Gemma impone sus términos y condiciones; la conversión no concede derechos adicionales. Verificar compatibilidad antes de uso comercial.
- No se documentan cuantizaciones oficiales, lo que limita el despliegue en GPUs de menos de 16 GB.
- El modelo está especializado en control robótico; no es un modelo de propósito general para texto o código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dexmal/DM05-Lerobot-MEM
- Modelo base: https://huggingface.co/Dexmal/DM05-MEM
- Repositorio OpenDM: https://github.com/dexmal/opendm
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Blog técnico DM0.5: https://www.dexmal.com/blog/dm0.5/index_en.html
