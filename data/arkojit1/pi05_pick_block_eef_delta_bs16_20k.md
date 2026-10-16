# arkojit1/pi05_pick_block_eef_delta_bs16_20k

## Resumen

Se trata de un modelo de política robótica (vision-language-action, VLA) resultado del ajuste fino de `lerobot/pi05_base` sobre el dataset `Ameyapores/pick_block_eef_delta`. Lo desarrolla el usuario arkojit1 con la librería LeRobot, usando el tipo de política `pi05` (π₀.₅). El problema que resuelve es concreto y acotado: generar acciones de control de efector final para una tarea de recogida de un bloque con un brazo Franka, a partir de dos cámaras de 224×224 y un estado de 4 dimensiones.

El modelo tiene 4.143.404.816 parámetros (4,14 mil millones) en formato safetensors, con un repositorio de 9,4 GB. No es un modelo de lenguaje de propósito general: es un checkpoint de investigación para robótica, entrenado sobre 35 episodios de un único task con control delta de posición del efector final `[dx, dy, dz, gripper]`. La relevancia actual es doble: por un lado sirve como ejemplo reproducible de ajuste fino de π₀.₅ en una sola GPU (MI300X, batch global 16), y por otro documenta de forma poco habitual la curva de sobreajuste de una política VLA con un dataset muy pequeño.

Es importante subrayar que este checkpoint no es el mejor de su ejecución: la pérdida de evaluación alcanzó su mínimo de 0,0998 en el paso 10.800 y deriva hasta 0,1115 en el paso 20.000, que es el que se publica. El autor lo etiqueta explícitamente como el checkpoint final del run, no como el de menor pérdida de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA π₀.₅ (vision-language-action): codificador visual SigLIP + backbone de lenguaje Gemma-2B congelados, más un experto de acciones entrenable con flow matching |
| Parametros totales | 4.143.404.816 (4,14 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no se documenta ventana de contexto; la política consume observaciones por frame y produce chunks de 50 acciones) |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (modelo orientado a una única tarea robótica; no se documenta soporte multilingüe) |
| Licencia | no disponible (la model card no especifica licencia; queda sujeta a los términos del modelo base `lerobot/pi05_base`) |
| Formato de pesos | safetensors |

Otras especificaciones operativas documentadas: 2 cámaras de 224×224 (`cam0` y `cam2`), tercera ranura de imagen de π₀.₅ rellenada y enmascarada (`empty_cameras=1`), estado de 4 dimensiones, acción de 4 dimensiones `[dx, dy, dz, gripper]`, `chunk_size = 50`, `n_action_steps = 50`.

## Arquitectura y entrenamiento

La política emplea la arquitectura π₀.₅ de LeRobot: una pila VLA que combina un codificador visual SigLIP y un backbone de lenguaje Gemma-2B, ambos congelados durante el ajuste fino (`train_expert_only=true`), y un experto de acciones entrenable que genera trayectorias mediante flow matching. El entrenamiento optimiza la pérdida de flow matching sobre pares observación-acción, con normalización por cuantiles (q01–q99) aplicada al estado y a la acción. Las acciones se emiten como delta de posición del efector final más un objetivo binario de pinza, en chunks de 50 pasos.

El ajuste fino se realizó con una única GPU MI300X y batch global 16, durante 20.000 pasos (508,5 pasos por época, aproximadamente 39 épocas), con optimizador AdamW (LR pico 2,5e-5, betas 0,9/0,95, weight decay 0,01, grad clip 1,0) y un schedule coseno con warmup de 666 pasos y suelo de 2,5e-6, en precisión bf16. Los datos provienen de 35 episodios de Franka sobre una sola tarea, con las transformaciones de imagen por defecto de LeRobot como aumento. La partición de evaluación son los últimos 4 episodios de los 35.

La innovación metodológica aquí no está en la arquitectura, sino en la trazabilidad del experimento: la model card documenta la pérdida de evaluación por paso, el punto de mejor validación (0,0998 en el paso 10.800) y el sobreajuste posterior (pérdida de entrenamiento 0,092 frente a 0,1115 de validación al final). Existe un run hermano, `arkojit1/pi05_pick_block_eef_delta`, entrenado con batch 256 en 8 GPUs sobre el mismo dataset.

## Capacidades

- Generación de acciones robóticas de efector final: produce comandos de 4 dimensiones `[dx, dy, dz, gripper]` a partir de observaciones visuales y de estado.
- Control de pinza: la cuarta dimensión de la acción es un objetivo binario de apertura/cierre.
- Fusión visomotora con dos cámaras: integra `cam0` y `cam2` a 224×224; la tercera ranura de imagen queda enmascarada.
- Política de imitación de tarea única: especializada en la tarea de recogida de bloque del dataset de entrenamiento.
- Ejecución por chunks: emite bloques de 50 acciones, lo que da cierta continuidad temporal a la trayectoria.
- Carga directa con LeRobot: `PI05Policy.from_pretrained(...)`.
- No documentado: tool calling, function calling, razonamiento multi-paso, modo «thinking», visión general, audio, generación de texto libre ni capacidades multilingües. Es un modelo de robótica, no un asistente conversacional.

## Casos de uso

- Recogida de un bloque con brazo Franka: el modelo genera deltas de posición del efector final y el objetivo de pinza para completar la tarea sobre la que fue ajustado, usando las dos cámaras y el estado de 4 dimensiones como entrada.
- Reproducción de experimentos de ajuste fino VLA en una sola GPU: sirve como referencia de configuración (AdamW, LR 2,5e-5, schedule coseno con warmup, bf16, batch 16) para quienes dispongan de un único acelerador tipo MI300X.
- Estudio de sobreajuste en políticas con datasets pequeños: el par de checkpoints (mejor validación en el paso 10.800, final en el 20.000) permite analizar la degradación de la pérdida de evaluación con solo 35 episodios.
- Punto de partida para fine-tuning en tareas similares de manipulación: al mantener SigLIP y Gemma-2B congelados y entrenar solo el experto de acciones, el coste de reajuste es bajo en términos de memoria de optimizador y de datos.
- Comparación de configuraciones de entrenamiento: contrastar este run (batch 16, 1 GPU) con el run hermano de batch 256 en 8 GPUs sobre el mismo dataset permite estudiar el efecto del tamaño de batch efectivo en la calidad de la política.
- Validación de infraestructura LeRobot: útil para verificar pipelines de carga, preprocesado de cámaras enmascaradas (`empty_cameras=1`), normalización por cuantiles y evaluación con chunks de 50 acciones.
- Docencia y divulgación en aprendizaje por imitación: ejemplo autocontenido de VLA con flow matching, con todos los hiperparámetros publicados, para ilustrar el flujo completo de entrenamiento y evaluación de una política robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas del objetivo de entrenamiento (pérdida de flow matching), que no equivalen a tasas de éxito en la tarea:

| Metrica | Valor | Contexto |
|---|---|---|
| Pérdida de evaluación (mejor) | 0,0998 | Paso 10.800 (≈21 épocas) |
| Pérdida de evaluación (este checkpoint) | 0,1115 | Paso 20.000 (≈39 épocas) |
| Meseta de pérdida de evaluación | ≈0,106 | Tramo intermedio del entrenamiento |
| Pérdida de entrenamiento | 0,092 | Paso 20.000 |

No hay datos de MMLU, HumanEval, GSM8K ni de tasa de éxito de la tarea, y no se dispone de comparaciones numéricas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 4,14 B de parámetros ocupan aproximadamente 8,3 GB, a los que hay que sumar activaciones del codificador visual (dos imágenes de 224×224) y del experto de acciones; un presupuesto realista ronda los 10–12 GB. En fp32, los pesos solos serían aproximadamente 16,6 GB.
- GPU compatibles: el entrenamiento documentado usó una AMD MI300X (batch global 16). Para inferencia, cualquier GPU con al menos 12–16 GB de VRAM debería ser suficiente en bf16.
- GPU de consumo: cabe en tarjetas de 24 GB como RTX 3090 o RTX 4090 con margen; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) el margen es ajustado y depende del uso de bf16 y del tamaño de lote. En GPUs de 8–12 GB probablemente sea necesario reducir precisión o aplicar cuantización, aunque no se documentan recetas de cuantización para este modelo.
- Opciones de despliegue: la vía documentada es LeRobot con `PI05Policy.from_pretrained` sobre PyTorch. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia genéricos, y al tratarse de una política visomotora con experto de acciones, estos runtimes no son aplicables de forma directa.
- Latencia y throughput: no disponibles. La model card no incluye mediciones de frecuencia de control ni de tiempo de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arkojit1/pi05_pick_block_eef_delta_bs16_20k` (este) | 4,14 B | chunk 50 | Pérdida eval 0,1115 (final); mejor 0,0998 | no disponible | HuggingFace, 0 descargas, 0 likes |
| `arkojit1/pi05_pick_block_eef_delta` | no disponible | mismo dataset y política | no disponible | no disponible | HuggingFace; run de batch 256 en 8 GPUs |
| `lerobot/pi05_base` | no disponible | no disponible | no disponible | no disponible | HuggingFace; modelo base de π₀.₅ |

No se dispone de datos verificables de otros modelos VLA comparables (por ejemplo, arquitecturas con control de efector final equivalentes) en la información proporcionada, por lo que la comparación se limita a los tres artefactos relacionados directamente con este ajuste.

## Limitaciones y advertencias

- Especialización extrema: entrenado sobre 1 única tarea y 35 episodios; no se espera generalización a otras tareas, objetos, brazos o configuraciones de cámara.
- Sobreajuste documentado: el checkpoint publicado corresponde al paso 20.000, con pérdida de evaluación un 11,7 % superior al mejor valor del run (0,0998 en el paso 10.800). Para uso práctico es probable que el checkpoint intermedio sea preferible.
- La pérdida de flow matching no es una tasa de éxito: un valor de 0,1115 no permite inferir el porcentaje de recogidas correctas de la tarea. No hay evaluación de éxito publicada.
- Licencia no disponible: al no especificarse licencia en el repositorio, no puede asumirse uso comercial libre. Los términos aplicables dependen del modelo base `lerobot/pi05_base`, cuya licencia debería verificarse por separado.
- Idiomas no documentados: no se especifica si las instrucciones de tarea admiten otros idiomas distintos del usado en el dataset.
- Dependencia del entorno de observación: las entradas deben respetar la configuración exacta de entrenamiento (dos cámaras a 224×224, tercera ranura enmascarada, estado de 4 dimensiones). Cambiar la disposición de cámaras o el espacio de estados invalida la política.
- Espacio de acción fijo: solo produce deltas de posición del efector final más objetivo binario de pinza; no controla articulaciones, fuerzas ni pares.
- Riesgo de alucinación en el sentido robótico: al ser una política entrenada por imitación con pocos datos, puede generar trayectorias que se alejen de la distribución de demostraciones y provocar movimientos no previstos; requiere límites de seguridad externos en un robot real.
- Sesgos: no hay análisis de sesgo publicado; con 35 episodios y una sola tarea, cualquier variación de iluminación, posición inicial u objeto queda fuera de la distribución de entrenamiento.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, y fechas de creación y actualización (2026-10-15) que conviene contrastar antes de tomarlo como referencia estable.
- Para producción: es un artefacto de investigación con una única semilla y una única configuración; no se documentan pruebas de robustez, ni de seguridad, ni comparaciones contra un baseline de control clásico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arkojit1/pi05_pick_block_eef_delta_bs16_20k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de ajuste fino: https://huggingface.co/datasets/Ameyapores/pick_block_eef_delta
- Run hermano (batch 256, 8 GPUs): https://huggingface.co/arkojit1/pi05_pick_block_eef_delta
- Librería LeRobot: no se ha encontrado enlace en la búsqueda web proporcionada
- Paper de π₀.₅: no se ha encontrado enlace en la búsqueda web proporcionada
- Repositorio de código o demo: no disponible

Nota: los resultados de búsqueda web recibidos no contenían enlaces relevantes al modelo (correspondían a páginas de Google Maps), por lo que no se han incluido.
