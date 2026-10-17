# rtrtwrw/act_chess_c3_to_d5_10ep_step6000

## Resumen

`rtrtwrw/act_chess_c3_to_d5_10ep_step6000` es una política de imitación ACT (Action Chunking Transformer) entrenada desde cero con LeRobot 0.5.1 para un brazo seguidor SO-101. El modelo resuelve una tarea de manipulación muy concreta, definida por el autor como el movimiento desde la casilla c3 (6 cm) hasta d5 (10 cm), usando tres cámaras de 480x640 y un vector de estado/acción de 6 articulaciones. No es un modelo de lenguaje ni un sistema de visión-lenguaje: es un controlador robótico de 51.668.614 parámetros que predice acciones a partir de observaciones visuales y propioceptivas.

El checkpoint publicado corresponde al paso 6.000 de 16.000, con batch 24, y se entrenó con los 10 episodios más cortos del dataset `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741` (3.422 fotogramas). Es relevante como baseline reproducible y de bajo coste para experimentos de imitación en SO-101, no como política general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), política de imitación para robótica; número de capas y dimensiones no documentados |
| Parámetros totales | 51.668.614 |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica como contexto de texto. Entrada: 3 cámaras a 480x640 y estado de 6 articulaciones; horizonte de acción no disponible |
| Tipos de cuantización | No documentados. Pesos en safetensors; no se publican versiones GGUF, INT8 ni otras cuantizaciones |
| Idiomas soportados | No aplica: no es un modelo de lenguaje; no se documentan idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Checkpoint | Paso 6.000 de 16.000, batch 24 |
| Dataset de entrenamiento | `niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741`: 10 episodios, 3.422 fotogramas |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es una familia de políticas de imitación basadas en transformers que predicen secuencias de acción a partir de observaciones. La información disponible confirma que este modelo se entrenó desde cero con LeRobot 0.5.1 sobre un SO-101, con 3 cámaras a 480x640 y 6 articulaciones, pero no detalla el número de capas, la dimensión de los embeddings, el mecanismo de atención ni la función de pérdida. No se documenta RLHF ni DPO; el entrenamiento es de imitación supervisada sobre demostraciones.

El checkpoint es intermedio: paso 6.000 de 16.000, con batch 24. Se usaron los 10 episodios más cortos del dataset, identificados como 19, 12, 14, 10, 18, 15, 20, 9, 16 y 28, que suman 3.422 fotogramas. El modelo tiene 51.668.614 parámetros y el repositorio ocupa 0,2 GB. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o mecanismos de verificación de acciones.

## Capacidades

- Control de manipulación de 6 articulaciones en un SO-101 a partir de 3 cámaras de 480x640 y un estado propioceptivo de 6 articulaciones.
- Ejecución de la tarea concreta c3 (6 cm) a d5 (10 cm), según la nomenclatura del autor.
- Generación de secuencias de acción compatibles con LeRobot; no genera texto ni código.
- No soporta tool calling ni function calling.
- No soporta agentes, planificación multi-step ni razonamiento simbólico.
- No tiene capacidades multilingües.
- La visión se usa como entrada de control, no para comprensión semántica general.
- Es un checkpoint intermedio, no un modelo final.

## Casos de uso

- Automatización de pick-and-place de una pieza de ajedrez en SO-101: cargar la política con `lerobot-record --policy.path=rtrtwrw/act_chess_c3_to_d5_10ep_step6000` y ejecutar la secuencia c3 a d5. Es adecuado porque el entrenamiento está limitado a esa tarea y a ese brazo.
- Baseline reproducible para ACT: evaluar la tasa de éxito y la estabilidad del paso 6.000 con el mismo dataset y configuración, para comparar variantes de arquitectura o de datos.
- Fine-tuning con nuevas trayectorias: usar los pesos como inicialización y entrenar con LeRobot en episodios adicionales de la misma casilla o de casillas cercanas, recalibrando y validando el resultado.
- Validación de pipeline hardware-software: probar cámaras 480x640, lectura de 6 articulaciones, inferencia y envío de acciones en un SO-101 real o en un entorno simulado.
- Docencia y demostración de imitation learning: ejemplo completo de entrenamiento desde cero, gestión de checkpoints y evaluación en robótica de bajo coste.
- Generación de rollouts para análisis de fallos: ejecutar la política y registrar estados y acciones para estudiar agarres fallidos, oclusiones o deriva.
- Pruebas de robustez visual: evaluar cómo afectan la iluminación, la posición de las cámaras y las oclusiones; no hay garantía de generalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 207 MB en FP32, 103 MB en FP16/BF16 y 52 MB en INT8 solo para los pesos, calculado a partir de 51.668.614 parámetros. Con activaciones y 3 imágenes de 480x640, un presupuesto de 1 GB es holgado; no hay requisito oficial.
- GPU recomendadas para inferencia: cualquier GPU NVIDIA con CUDA y al menos 2-4 GB de VRAM, como GTX 1650, RTX 3050, RTX 3060 o RTX 4060. Para entrenamiento: RTX 4090, A100 o H100 según el tamaño de batch; no hay datos oficiales.
- Cabe en GPU de consumo: sí, por tamaño. También puede ejecutarse en CPU, aunque la latencia no está documentada.
- Opciones de despliegue: LeRobot 0.5.1 o compatible, PyTorch y safetensors. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles; dependerán de la GPU, la resolución de entrada y la frecuencia de control.

## Comparativa con modelos similares

| Modelo | Parámetros | Observación/contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rtrtwrw/act_chess_c3_to_d5_10ep_step6000` | 51.668.614 | 3 cámaras 480x640 + estado de 6 articulaciones | c3 a d5 en SO-101 | No disponible | Hugging Face |
| Otras políticas ACT para SO-101 | No disponible | No disponible | No disponible | No disponible | No disponible |
| Políticas de difusión para manipulación robótica | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de parámetros, observaciones ni resultados de modelos comparables en la información proporcionada; la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Entrenado con solo 10 episodios y 3.422 fotogramas, los 10 más cortos; alta probabilidad de sobreajuste y baja diversidad.
- Checkpoint intermedio 6.000 de 16.000; no es el modelo final y su rendimiento puede variar con pasos posteriores.
- Tarea y morfología específicas: c3 a d5 en SO-101; no generaliza a otras casillas, objetos, alturas, brazos o cámaras sin fine-tuning.
- Licencia no disponible: no se puede asumir permiso de uso comercial, redistribución o modificación.
- No hay benchmarks ni métricas de éxito publicadas; no se puede afirmar robustez.
- Depende de la calibración de 3 cámaras, la resolución 480x640 y el estado de 6 articulaciones; cambios en el montaje pueden degradar el rendimiento.
- Riesgo de acciones incorrectas: puede generar trayectorias plausibles pero fallidas; no incorpora un mecanismo de verificación semántica.
- Sesgos derivados de las demostraciones: posiciones, iluminación y estilo de agarre; no se documentan análisis de sesgo.
- No es un modelo de lenguaje: no hay soporte multilingüe, tool calling ni agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rtrtwrw/act_chess_c3_to_d5_10ep_step6000
- Dataset: https://huggingface.co/datasets/niru-5/chess_dataset_c3_6cm_to_d5_10cm_20261017_145741
- LeRobot, librería citada en la model card: https://github.com/huggingface/lerobot
- Paper de ACT, referencia de la arquitectura: https://arxiv.org/abs/2304.13705
