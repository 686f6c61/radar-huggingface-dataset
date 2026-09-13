# Hoshipu/stageguard-qwen3.5-0.8b-b1k-task69-removed-fullparam-45k

## Resumen

StageGuard Qwen3.5-0.8B es un checkpoint multimodal de 852.985.920 parámetros (unos 0,85 mil millones) publicado por el usuario Hoshipu, resultado de un ajuste fino supervisado de parámetros completos sobre Qwen/Qwen3.5-0.8B-Base. No es un modelo conversacional generalista ni una política de control de robots de propósito general: es un predictor de transiciones de subtarea para el benchmark B1K, entrenado para decidir si la subtarea activa de un robot debe `continue` o `switch`, estimar el progreso y proponer la siguiente subtarea cuando predice un cambio.

El modelo se distribuye bajo licencia Apache 2.0, en formato safetensors y con pipeline `image-text-to-text`, por lo que consume observaciones visuales junto con texto. El entrenamiento alcanzó el paso 45.000 del optimizador (35.000 pasos iniciales más 10.000 de continuación) sobre 34.987 ejemplos del conjunto B1K con el formato compacto de salida de StageGuard, incluyendo aumentación con ejemplos de conmutación retardada durante dos fotogramas tras una frontera.

Su relevancia es deliberadamente acotada y experimental. Publica evaluación en bucle cerrado sobre seis tareas B1K no vistas, con un recall de conmutación de solo el 33,40% a ±3 fotogramas, lo que lo sitúa como punto de partida para investigación en predicción de transiciones y no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (`image-text-to-text`) derivado de Qwen/Qwen3.5-0.8B-Base; número de capas, cabezas y tipo de atención: no disponible |
| Parámetros totales | 852.985.920 (unos 0,85 mil millones) |
| Parámetros activos | No aplica; no hay indicios de que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors (tamaño de repo: 1,7 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.5-0.8B-Base, un modelo multimodal de tipo `image-text-to-text` según la etiqueta de pipeline declarada por el autor. El repositorio contiene los pesos completos fusionados, no un adaptador LoRA, y no incluye el procesador ni el tokenizador, que deben cargarse desde el modelo base. No se documentan en la información disponible el número de capas, la dimensionalidad oculta, el mecanismo de atención ni la ventana de contexto.

El entrenamiento consistió en ajuste fino supervisado de parámetros completos en bfloat16, con micro lote de tamaño 4, acumulación de gradiente 1 y checkpointing de gradiente desactivado. El schedule total fue de 45.000 pasos: 35.000 iniciales más 10.000 de continuación con tasa de aprendizaje `1e-5`. Se usaron 34.987 ejemplos del conjunto `data_improve_V1_60t_task69_removed_delayed2_next_subtask`, con aumentación de conmutación retardada en los dos fotogramas posteriores a una frontera y con la tarea 69 eliminada por completo. El objetivo de entrenamiento es el formato compacto de decisión de StageGuard, no una traza larga de razonamiento. No se menciona uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Predicción de transición de subtarea: emite una decisión binaria `continue` o `switch` para la subtarea activa de un robot.
- Predicción del siguiente subtask: cuando decide `switch`, genera la etiqueta de la siguiente subtarea en formato compacto.
- Estimación de progreso de la subtarea activa, según el esquema de salida de StageGuard.
- Entrada multimodal: consume observaciones visuales junto con texto (pipeline `image-text-to-text`).
- Aceptación de contexto de historial: la entrada incluye la subtarea activa y el historial de subtareas completadas.
- Integración con `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso autónomo, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en predicción de transiciones para B1K: el modelo sirve como punto de partida reproducible para estudiar detección de fronteras entre subtareas en demostraciones de robot, aprovechando que el checkpoint y su configuración de entrenamiento están documentados paso a paso.
- Anotación asistida de etiquetas de conmutación: puede preetiquetar demostraciones nuevas con `continue`/`switch` y una propuesta de siguiente subtarea, dejando la revisión final a un anotador humano; es adecuado porque su salida es un formato compacto y verificable.
- Análisis post-mortem de trayectorias fallidas: ejecutado en modo offline sobre los fotogramas de una ejecución, permite localizar en qué puntos el sistema no detectó una conmutación y contrastarlo con las transiciones reales.
- Baseline en experimentos de políticas jerárquicas: al ser un modelo de 0,85 mil millones de parámetros con licencia Apache 2.0, se puede usar como referencia de bajo coste frente a políticas de control completas en comparativas académicas.
- Curado y filtrado de datos de entrenamiento: al comparar sus predicciones con las etiquetas existentes se pueden detectar ejemplos mal etiquetados o fronteras ambiguas en un dataset de demostraciones.
- Supervisión en bucle cerrado con confirmación humana: aumentando `switch-confirm-frames` por encima de 1, las predicciones de cambio pueden usarse como aviso para que un operador confirme la transición, dado el bajo recall estricto del modelo.
- Prototipado en hardware de consumo: con un tamaño de pesos de aproximadamente 1,7 GB en safetensors, permite montar prototipos de percepción visual más decisión de estado en GPUs de gama media sin infraestructura dedicada.

## Benchmarks y rendimiento

Evaluación en bucle cerrado sobre 10 demostraciones no vistas de cada una de seis tareas B1K (`task-0000`, `task-0001`, `task-0016`, `task-0077`, `task-0087` y `task-0092`), excluyendo la tarea 69. Controlador con aceptación inmediata de la conmutación (`switch-confirm-frames=1`). Total: 509 transiciones de referencia en 60 trayectorias.

| Métrica | Estricto | ±1 fotograma | ±2 fotogramas | ±3 fotogramas |
|---|---:|---:|---:|---:|
| Recall de conmutación | 7,07% | 20,83% | 27,90% | 33,40% |
| Precisión de conmutación | — | — | — | 47,93% |
| F1 de conmutación | — | — | — | 39,37% |

Resultados adicionales en bucle cerrado:

| Métrica | Valor |
|---|---|
| Avances de estado predichos | 459 / 509 transiciones de referencia |
| Trayectorias que alcanzan la subtarea final | 49 / 60 (81,7%) |
| Exactitud de `continue` a ±3 fotogramas | 98,76% |
| Exactitud balanceada a ±3 fotogramas | 66,08% |

La exactitud por fotograma está dominada por los ejemplos `continue`, por lo que el propio autor indica que el recall, el F1 de conmutación y la progresión de trayectoria son métricas más informativas. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 2 GB solo para pesos en bfloat16 (el repositorio ocupa 1,7 GB); con activaciones y entrada de imagen, una estimación práctica de 3 a 5 GB en precisión nativa. No se documentan requisitos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para prototipos; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor margen y lote más grande. No se documentan cifras oficiales por modelo.
- Cabe en GPU de consumo: sí, en principio en tarjetas de gama media y alta con 6 GB o más, dado el tamaño de 0,85 mil millones de parámetros.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` del modelo base (procedimiento documentado por el autor). No hay pesos GGUF publicados, por lo que llama.cpp u Ollama no están disponibles salvo conversión propia. El soporte en vLLM o TGI no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporcionaron datos de benchmarks de modelos comparables en la información disponible. La comparación siguiente se limita a características de categoría y marca como no disponible todo dato no confirmado.

| Modelo | Parámetros | Contexto | Licencia | Orientación | Disponibilidad |
|---|---|---|---|---|---|
| StageGuard Qwen3.5-0.8B (este modelo) | 852.985.920 | no disponible | Apache 2.0 | Predicción de transiciones de subtarea en B1K, multimodal | HuggingFace, safetensors |
| Qwen/Qwen3.5-0.8B-Base | no disponible | no disponible | no disponible | Modelo base multimodal generalista | HuggingFace |
| SmolVLM-500M-Instruct | ~0,5 mil millones | no disponible | Apache 2.0 | VLM compacto de propósito general | HuggingFace |
| Qwen2.5-VL-3B-Instruct | ~3 mil millones | no disponible | Apache 2.0 | VLM generalista de gama pequeña-mediana | HuggingFace |

La diferencia funcional clave es que este checkpoint está especializado en una tarea de decisión de estado concreta y no compite en capacidades generales de visión-lenguaje con los VLM de propósito general de la tabla.

## Limitaciones y advertencias

- Es un checkpoint de investigación para predicción de transiciones StageGuard/B1K; no es una política de control de robot de propósito general.
- Solo se evaluó en las seis tareas B1K no vistas listadas en la model card; no hay evidencia de generalización fuera de ese conjunto.
- El timing de conmutación es impreciso: el recall a ±3 fotogramas es del 33,40%, con precisión del 47,93% y F1 del 39,37% en la misma tolerancia.
- La exactitud de `continue` del 98,76% está inflada por el desequilibrio de clases; la exactitud balanceada a ±3 es del 66,08%.
- Requiere seguir el esquema de prompt exacto de entrenamiento, incluyendo la subtarea activa y el historial de subtareas completadas; además, el estado debe actualizarse tras cada conmutación aceptada para la evaluación en bucle cerrado.
- El repositorio no incluye el código de evaluación de StageGuard ni los ficheros del procesador del modelo base, lo que complica la reproducibilidad directa.
- La tarea 69 se eliminó por completo del entrenamiento, por lo que no debe esperarse ningún comportamiento fiable en ella.
- Riesgo de alucinación: al generar libremente la etiqueta de siguiente subtarea puede producir etiquetas fuera del vocabulario válido de tareas, algo no mitigado explícitamente en la información disponibles.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero la utilidad real en producción está limitada por las métricas de conmutación y por el alcance restringido de la evaluación.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM sin conversión propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hoshipu/stageguard-qwen3.5-0.8b-b1k-task69-removed-fullparam-45k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Paper, blog, repositorio o demo del proyecto StageGuard: no disponibles
- Nota: los resultados de la búsqueda web proporcionada no contienen enlaces relevantes al modelo (únicamente referencias a Google Maps).
