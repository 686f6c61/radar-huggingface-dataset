# pawanpaudel93/molmoact2-droid-fp16-ov

## Resumen

MolmoAct2-DROID en formato OpenVINO es una conversión del modelo visión-lenguaje-acción (VLA) `allenai/MolmoAct2-DROID` de Ai2, empaquetada como `policy_package` para el motor `ov-policy` de Cascadia y exportada con Intel physical-ai-studio. El paquete contiene un grafo float32 con pesos fp16, pensado para ejecutar políticas robóticas en hardware Intel (CPU y, previsiblemente, GPU integrada o discreta) sin depender de PyTorch en tiempo de inferencia. La revisión del modelo base fijada es `d8c1abd8a27d8e859455bbe514df2bcc617db0fb`.

El modelo resuelve el problema de traducir instrucciones en lenguaje natural e imágenes de cámaras a secuencias de acciones motoras sobre un brazo Franka en el entorno DROID. La configuración concreta es `MolmoAct2(norm_tag="franka_droid", n_action_steps=15)`: consume tres cámaras RGB de 378×378 (`exterior_1_left`, `exterior_2_left`, `wrist_left`) y un vector de estado de 8 dimensiones (7 posiciones articulares en radianes más pinza), y emite 15 pasos de acción de 8 dimensiones cada uno en modo de pose articular absoluta.

Su relevancia ahora es doble: por un lado, acerca un VLA de Ai2 a despliegues de inferencia en producción sobre OpenVINO, lo que reduce la fricción para integrarlo en stacks robóticos que ya usan el runtime de Intel; por otro, la verificación publicada es todavía parcial (solo CPU, sin éxito de tarea medido), por lo que debe tratarse como un artefacto de exportación validado numéricamente pero no evaluado funcionalmente en el dominio robótico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en el backbone Molmo2-ER / Qwen3-4B-Instruct-2507; grafo OpenVINO float32 con pesos fp16 |
| Parametros totales | no disponible (el backbone declarado es Qwen3-4B-Instruct-2507, pero no se detalla el recuento total del VLA) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (pesos); grafo en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (`policy_package` para el motor `ov-policy` de Cascadia, tipo `molmoact2`) |

Otros datos técnicos relevantes: tamaño del repositorio 10,0 GB; entrada de cámaras uint8 RGB 378×378; estado de 8 dimensiones; salida de 15 × 8 acciones; `norm_tag="franka_droid"`; `n_action_steps=15`; modo de control "absolute joint pose"; setup "single franka robotic arm in droid".

## Arquitectura y entrenamiento

El paquete es una exportación, no un entrenamiento nuevo. El modelo base `allenai/MolmoAct2-DROID` es un VLA que combina un backbone de lenguaje y visión (Molmo2-ER, cuyo backbone es Qwen3-4B-Instruct-2507) con una cabeza de acciones que produce secuencias de poses articulares. La exportación se realizó con Intel physical-ai-studio (commit `8f132416`, runtime `e3dd944`) y genera un grafo float32 con pesos fp16 para el motor `ov-policy` de Cascadia, tipo `molmoact2`.

No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, la composición del dataset DROID utilizado, ni si hubo RLHF o DPO en el modelo base. La innovación técnica destacable de este paquete es la conversión a OpenVINO IR con pesos fp16 manteniendo cómputo float32, lo que permite ejecutar la política sin PyTorch y con verificación numérica frente al original: la comparación fp16-weight IR contra PyTorch con las mismas entradas da un error máximo absoluto de 9,1e-5 en valores normalizados, sin NaN; la ejecución extremo a extremo del runtime de Intel frente a PyTorch sobre la muestra de la model card da 3,5e-4 y es determinista.

## Capacidades

- Control robótico de un brazo Franka en el entorno DROID a partir de instrucciones de tarea en lenguaje natural.
- Percepción visual multi-cámara: dos cámaras exteriores y una de muñeca, con entradas RGB de 378×378. Si solo se dispone de una cámara exterior, debe enviarse en ambas ranuras exteriores.
- Fusión de estado proprioceptivo: vector de 8 dimensiones (7 posiciones articulares en radianes más pinza).
- Generación de secuencias de acción: 15 pasos de 8 dimensiones por inferencia, en modo de pose articular absoluta.
- Normalización específica del dominio Franka/DROID mediante `norm_tag="franka_droid"`.
- Inferencia determinista en el runtime de Intel según la verificación publicada.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso genérico, multilingüismo, audio ni modos de pensamiento; el pipeline declarado es exclusivamente `robotics`.

## Casos de uso

- Manipulación robótica de laboratorio con brazo Franka: ejecutar tareas de pick-and-place o ensamblaje descritas en lenguaje natural, usando las tres cámaras y el estado articular como entrada y emitiendo 15 poses articulares absolutas por paso de control.
- Despliegue en estaciones de trabajo con CPU Intel: al estar exportado a OpenVINO IR, permite servir la política sin GPU dedicada ni PyTorch, lo que encaja en celdas robóticas con hardware de cómputo modesto y requisitos de reproducibilidad.
- Integración en el motor `ov-policy` de Cascadia: el paquete está empaquetado específicamente para este motor (tipo `molmoact2`), de modo que se puede enchufar en un pipeline de políticas existente sin conversión adicional.
- Evaluación comparativa de exportaciones: sirve como referencia para medir la degradación numérica de una conversión OpenVINO frente al checkpoint PyTorch original, gracias a los errores máximos publicados (9,1e-5 y 3,5e-4).
- Investigación en VLA sobre DROID: permite reproducir experimentos de Ai2 en entornos con toolchain de Intel, útil para estudiar generalización de políticas visión-lenguaje-acción sin depender de CUDA.
- Prototipado de control por pose articular absoluta: el modo "absolute joint pose" y la ventana de 15 acciones facilitan el diseño de bucles de control con replanificación periódica en lugar de control paso a paso.
- Validación de determinismo en producción: la naturaleza determinista reportada en el runtime de Intel permite auditar y repetir exactamente una trayectoria dada la misma observación, algo relevante en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (tasas de éxito en DROID, MMLU, HumanEval ni similares) en la información disponible. La model card solo reporta verificaciones numéricas de la exportación:

| Verificacion | Referencia | Error maximo absoluto | Notas |
|---|---|---|---|
| IR con pesos fp16 vs PyTorch (mismas entradas, computo f32) | PyTorch | 9,1e-5 (normalizado) | Sin NaN |
| Runtime de Intel extremo a extremo vs PyTorch en la muestra de la model card | PyTorch | 3,5e-4 | Determinista |
| Ejecución en motor Cascadia | no disponible | no medida | Pendiente |
| Ejecución en GPU Intel | no disponible | no medida | Pendiente |
| Éxito de tarea robótica | no disponible | no medido | Pendiente |

## Requisitos de hardware

- Tamaño del repositorio: 10,0 GB, lo que da una cota inferior del espacio en disco necesario para los pesos en el formato empaquetado.
- VRAM estimada para inferencia: no disponible de forma explícita; con pesos fp16 y un backbone de 4B, el orden de magnitud estaría en torno a 8-10 GB solo para pesos, más activaciones y buffers de visión, pero no se confirma en la información disponible.
- GPU recomendadas: no se especifican. El paquete está orientado al runtime OpenVINO de Intel; la verificación publicada se hizo en CPU.
- Compatibilidad con GPU de consumo: no confirmada. No se ha medido ejecución en GPU Intel ni en GPUs NVIDIA.
- Opciones de despliegue: motor `ov-policy` de Cascadia (tipo `molmoact2`) sobre runtime OpenVINO; exportado con Intel physical-ai-studio. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de robótica.
- Latencia y throughput: no disponibles. La model card indica explícitamente que no se ha medido la ejecución en el motor Cascadia ni en GPU Intel.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entradas | Salidas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|---|
| pawanpaudel93/molmoact2-droid-fp16-ov | no disponible (backbone Qwen3-4B) | no disponible | 3 camaras 378×378 + estado 8D | 15×8 acciones | Apache-2.0 | OpenVINO IR | Hugging Face, 0 descargas |
| allenai/MolmoAct2-DROID | no disponible (backbone Qwen3-4B) | no disponible | 3 camaras 378×378 + estado 8D | 15×8 acciones | Apache-2.0 | PyTorch (checkpoint original) | Hugging Face |
| allenai/Molmo2-ER | backbone Qwen3-4B-Instruct-2507 | no disponible | vision + lenguaje | texto / embeddings | Apache-2.0 | safetensors (presumible) | Hugging Face |

La comparativa se limita a la familia Molmo porque la información disponible no incluye otros VLA comparables (por ejemplo, políticas tipo RT-2 u OpenVLA) con datos verificables en esta búsqueda. La diferencia clave entre las tres filas es el formato y el runtime: el paquete OpenVINO sustituye la dependencia de PyTorch por el runtime de Intel, con la contrapartida de que su validación funcional en tarea aún no se ha publicado.

## Limitaciones y advertencias

- Verificación incompleta: no se ha medido la ejecución en el motor Cascadia, ni en GPU Intel, ni la tasa de éxito en tareas DROID. El paquete está validado numéricamente pero no funcionalmente en el dominio robótico.
- Dependencia de una sola cámara exterior: si el montaje solo tiene una, hay que duplicarla en ambas ranuras exteriores; un uso incorrecto de las entradas degradará la política sin aviso explícito.
- Normalización y modo de control fijos: `norm_tag="franka_droid"` y "absolute joint pose" están codificados en el paquete; usarlo con otra normalización, otro robot o control relativo a la pose actual no es válido sin reexportar.
- Ventana de acción fija de 15 pasos: no es configurable en este artefacto y condiciona la frecuencia de replanificación del bucle de control.
- Idiomas soportados no documentados: no se puede asumir multilingüismo en las instrucciones de tarea.
- Sesgos y alucinación: no hay información publicada sobre sesgos del modelo base ni sobre tasas de alucinación en instrucciones; en un VLA, una instrucción mal interpretada se traduce en una acción física incorrecta, con riesgo material.
- Licencia Apache-2.0: permite uso comercial, pero Ai2 declara que MolmoAct2 está pensado para "research and educational use in accordance with Ai2's Responsible Use Guidelines"; conviene revisar esas directrices antes de un despliegue comercial.
- Trazabilidad: el paquete fija una revisión concreta del modelo base (`d8c1abd8...`); actualizaciones del original no se reflejan automáticamente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado resultados independientes.

## Enlaces

- Paquete OpenVINO: https://huggingface.co/pawanpaudel93/molmoact2-droid-fp16-ov
- Modelo base: https://huggingface.co/allenai/MolmoAct2-DROID
- Backbone del modelo base: https://huggingface.co/allenai/Molmo2-ER
- Repositorio de Ai2: https://github.com/allenai/molmoact2
- Directrices de uso responsable de Ai2: https://allenai.org/responsible-use
