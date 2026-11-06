# dddddsds31341/Long-WAM-Sorting-Dolls-30k-Step-20000

## Resumen

Long-WAM Sorting Dolls 30k Step 20000 es un checkpoint de inferencia para robótica manipulativa, derivado por fine-tuning del modelo base Efficient-Large-Model/Long-WAM-YAM. Lo publica el usuario dddddsds31341 en Hugging Face y está especializado en una única tarea: colocar cinco muñecas rusas en fila, de pie y ordenadas de menor a mayor de izquierda a derecha. No es un modelo de lenguaje generalista, sino un policy de control visuomotor que produce acciones de robot a partir de observaciones visuales, propiocepción e instrucción en lenguaje natural.

El modelo se entrenó sobre el dataset dddddsds31341/sorting-dolls-lerobot, compuesto por 100 demostraciones y 168.126 fotogramas teleoperados, y corresponde al paso de optimización 20.000 de un plan de 30.000. Se distribuye como checkpoint de evaluación (12 GB de repositorio) con pesos en `model.pt`, configuración YAML, estadísticas de normalización y un archivo de código de inferencia. No incluye estado completo para reanudar el entrenamiento ni se reclama ninguna tasa de éxito en robot real.

Su relevancia es acotada: sirve como referencia reproducible de un pipeline Long-WAM aplicado a una tarea de manipulación concreta, útil para investigadores que quieran evaluar la arquitectura, adaptar el flujo de inferencia o comparar variantes (existen otros checkpoints del mismo autor para tareas de anidado de muñecas). No debe confundirse con un modelo fundacional: su utilidad fuera de la tarea de ordenación es prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Long-WAM (policy visuomotor sobre backbone YAM, con VAE Wan2.2 y text encoder UMT5); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (historial de observaciones P48: 48 pasos) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, presumiblemente BF16) |
| Idiomas soportados | no disponible (instrucción de tarea en inglés) |
| Licencia | other (sujeta a la licencia del modelo base Long-WAM-YAM) |
| Formato de pesos | `model.pt` (PyTorch), más `config.yaml` y `dataset_stats.json` |
| Entrada visual | 3 cámaras: top_head, hand_left, hand_right; resolución procesada 384 x 320 |
| Salida de acción | 14D absoluta (6 articulaciones + gripper por brazo), chunk de 32 pasos |
| Historial | P48 (48 pasos de observación) |
| Paso de entrenamiento | 20.000 de 30.000 |
| Tamaño del repositorio | 12,0 GB |

## Arquitectura y entrenamiento

El checkpoint se inicializa desde Efficient-Large-Model/Long-WAM-YAM y se ajusta fino sobre 100 demostraciones (168.126 fotogramas) del dataset sorting-dolls-lerobot, en la revisión Git ffca92aece12b85daac426b1b0474065e1ecf165. El entrenamiento usó cuatro A100, batch 12 por GPU con acumulación 1 (batch global 48), learning rate constante de 1e-5, AdamW con weight decay 0,01, semilla 42, precisión BF16 y ZeRO-1. La instrucción de tarea es fija: «Arrange the five Russian dolls upright in a row from smallest to largest, from left to right».

La política consume tres cámaras (top_head, hand_left, hand_right) a 384 x 320, un historial de 48 pasos y emite chunks de 32 acciones en espacio absoluto de 14 dimensiones (6 articulaciones + gripper por brazo, en unidades originales del gripper). Las acciones se normalizan con z-score específico de la tarea sin recorte de valores normalizados, usando las estadísticas incluidas en `dataset_stats.json`. El pipeline de inferencia depende de assets externos: VAE Wan2.2, text encoder UMT5 y tokenizer, que deben descargarse por separado. El código de inferencia (`code.zip`, versión v47) es idéntico al de la release v46 salvo por un script de verificación de lectura completa del archivo y documentación; la carga se realiza con `longwam.inference.load_run_config` y `load_model` indicando `expected_step=20000`.

## Capacidades

- Control visuomotor de un brazo robótico bimanual (dos brazos con gripper) para una tarea de ordenación de cinco objetos.
- Seguimiento de instrucción en lenguaje natural fija para la tarea de sorting dolls.
- Condicionamiento sobre historial de 48 observaciones para mantener consistencia temporal.
- Predicción de chunks de 32 acciones en espacio articular absoluto.
- Percepción multi-cámara (vista cenital y dos vistas de mano).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No es un modelo de propósito general: no genera texto, código ni responde preguntas.
- Capacidades multilingües: no disponibles; la instrucción de entrenamiento está en inglés.

## Casos de uso

- Evaluación de la arquitectura Long-WAM: reproducir la inferencia con `load_model` y `expected_step=20000` para estudiar el comportamiento del policy en la tarea de ordenación antes de escalar a otras tareas.
- Baseline para fine-tuning en manipulación: servir como punto de partida para entrenar políticas en tareas similares de pick-and-place con múltiples objetos y ordenación espacial.
- Estudio de normalización de acciones: analizar el efecto del z-score sin recorte y de las unidades originales del gripper en la estabilidad del control.
- Investigación en condicionamiento por historial largo: usar el P48 de 48 pasos para medir cómo afecta la memoria temporal a la consistencia de la secuencia de colocación.
- Comparación de checkpoints intermedios: contrastar este paso 20.000 con otros checkpoints del mismo autor (por ejemplo, variantes de nesting) para estudiar la evolución del aprendizaje.
- Docencia y divulgación en robótica: ejemplo reproducible de pipeline completo (dataset LeRobot, entrenamiento distribuido en A100, inferencia con VAE y text encoder externos) para cursos de aprendizaje por imitación.
- Validación de infraestructura: probar entornos de evaluación SIP y la integración de assets Wan2.2/UMT5 antes de desplegar políticas en robots reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama tasa de éxito en robot ni rendimiento en conjuntos held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio pesa 12 GB y el checkpoint se distribuye en BF16, por lo que se requiere al menos una GPU con memoria suficiente para pesos, VAE Wan2.2 y text encoder UMT5 cargados simultáneamente.
- GPU recomendadas: A100 (usadas en entrenamiento); H100 para mayor margen; no se documenta soporte en GPUs de consumo.
- GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: inferencia mediante el código incluido en `code.zip` (paquete Long-WAM y `longwam.inference`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un policy robótico).
- Latencia y throughput: no disponibles.
- Dependencias adicionales: assets Wan2.2 VAE, UMT5 text encoder y tokenizer, descargados por separado; versiones de paquetes SIP registradas en `requirements-sip.txt`.

## Comparativa con modelos similares

| Modelo | Tarea | Datos de entrenamiento | Paso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Long-WAM Sorting Dolls 30k Step 20000 (este) | Ordenar 5 muñecas en fila | 100 demos, 168.126 frames | 20.000 / 30.000 | other | Hugging Face, 12 GB |
| dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1 | Anidar muñecas rusas | no disponible | época 1 | other | Hugging Face |
| dddddsds31341/vla-adapter-nesting_3dolls-30k | Anidar 3 muñecas | 99 demos válidas | 30.000 | no disponible | Hugging Face |
| Efficient-Large-Model/Long-WAM-YAM (base) | Policy generalista Long-WAM | no disponible | no disponible | other | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints; la comparación se limita a tarea, volumen de datos y paso de entrenamiento.

## Limitaciones y advertencias

- Especialización extrema: solo resuelve la tarea de ordenar cinco muñecas rusas; no generaliza a otras instrucciones ni objetos.
- Sin métricas de éxito: el autor declara explícitamente que no se reclama tasa de éxito en robot real ni rendimiento held-out.
- Checkpoint de evaluación, no reanudable: `model.pt` no contiene estado de optimizador, scheduler ni RNG, por lo que no sirve para continuar el entrenamiento.
- Dependencia de assets externos: requiere VAE Wan2.2, UMT5 y tokenizer por separado; sin ellos la inferencia no funciona.
- Rutas y estadísticas específicas: `config.yaml` y `dataset_stats.json` provienen de la ejecución exacta; hay que adaptar rutas SIP y usar las estadísticas de esta ejecución (z-score sin recorte).
- Licencia «other»: el uso comercial queda sujeto a la licencia del modelo base Long-WAM-YAM, que debe revisarse antes de cualquier despliegue productivo.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Sesgos: no documentados; el dataset de 100 demostraciones puede introducir sesgos de posición, iluminación o configuración de cámara.
- Idiomas: no se documenta soporte multilingüe; la instrucción de entrenamiento está en inglés.
- Código y datos excluidos del ZIP: el archivo de código no incluye datasets, checkpoints, assets, entornos, cachés, logs ni secretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dddddsds31341/Long-WAM-Sorting-Dolls-30k-Step-20000
- Modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
- Checkpoint relacionado (nesting, época 1): https://huggingface.co/dddddsds31341/Long-WAM-Nesting-Doll-Epoch-1
- Checkpoint relacionado (VLA-Adapter nesting 3 muñecas): https://huggingface.co/dddddsds31341/vla-adapter-nesting_3dolls-30k
- Dataset de entrenamiento: https://huggingface.co/datasets/dddddsds31341/sorting-dolls-lerobot
- Licencia del modelo base: https://huggingface.co/Efficient-Large-Model/Long-WAM-YAM
