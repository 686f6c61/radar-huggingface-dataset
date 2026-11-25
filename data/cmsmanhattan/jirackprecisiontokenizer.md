# CMSManhattan/JiRackPrecisionTokenizer

## Resumen

JiRackPrecisionTokenizer es un tokenizador publicado por CMSManhattan (organización JiRack Technology) bajo licencia MIT, diseñado como componente de preprocesado para modelos de la familia Qwen2.5 y DeepSeek R1. No se trata de un modelo de lenguaje con pesos entrenados, sino de un vocabulario BPE de nivel de byte (byte-level BPE) con un conjunto ampliado de tokens especiales orientados a tres áreas: enrutamiento de consultas en sistemas RAG con arquitectura MoE, llamadas a herramientas (tool calling) y control de robots y sistemas embebidos. El repositorio tiene un tamaño de 0,0 GB y 276 descargas en el momento de la consulta.

El tokenizador declara un vocabulario de 151.779 tokens, con `pad_token_id` y `eos_token_id` fijados en 151.643, y se presenta como compatible con Qwen2.5 y DeepSeek R1 "sin adaptación" mediante la función de redimensionado del vocabulario. Su propuesta técnica central es sustituir la inyección dinámica de esquemas de herramientas en el contexto por tokens nativos de llamada a herramienta (`<|tool_call_start|>`, `<|tool_result_end|>`, etc.), lo que según el autor reduce latencia y consumo de tokens.

La relevancia del artefacto es acotada: es un tokenizador, no un modelo, y su valor depende de que el vocabulario ampliado se integre correctamente en un modelo base compatible y de que los tokens nuevos reciban entrenamiento suficiente. La model card menciona que se necesitan del orden de 100.000 ejemplos para adaptar las capacidades de enrutamiento a un modelo de routing RAG, lo que sitúa el trabajo real de adaptación fuera del propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador byte-level BPE (no es un modelo neuronal; sin capas ni pesos de transformer) |
| Parametros totales | no disponible (el repositorio contiene un tokenizador, no pesos de modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible (el autor recomienda inicializar modelos con 4K y escalar a 8K) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizador) |
| Idiomas soportados | multilingüe (etiqueta `multilingual`; sin desglose de idiomas) |
| Licencia | MIT |
| Formato de pesos | no disponible; el repositorio contiene ficheros de tokenizador (vocabulario y merges BPE, presumiblemente `tokenizer.json`/`vocab.json`/`merges.txt`), no safetensors ni GGUF |
| Tamano de vocabulario | 151.779 tokens |
| `pad_token_id` | 151.643 |
| `eos_token_id` | 151.643 |
| Compatibilidad declarada | Qwen2.5 y DeepSeek R1 |
| Pipeline en Hugging Face | robotics |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El artefacto es un tokenizador de nivel de byte con segmentación BPE, heredero del vocabulario de Qwen2.5 (151.643 tokens base) al que se añaden 136 tokens especiales, hasta alcanzar los 151.779. Los tokens añadidos se agrupan en cinco bloques: etiquetas de razonamiento de DeepSeek R1, marcadores FIM (fill-in-the-middle) para entrenamiento de código (`<|fim_prefix|>`, `<|fim_middle|>`, `<|fim_suffix|>`), etiquetas de tool calling, etiquetas de robótica y embodiment (acciones, trayectorias, joints, sensores, pose, velocidad, fuerza, par, gripper, navegación, waypoints, parada de emergencia, etc.), etiquetas multimodales (`<|image|>`, `<|video|>`, `<|sound|>`, `<|voice|>`, `<|vision|>`) y 52 etiquetas de enrutamiento de dominio para sistemas RAG-MoE (`__SCIENCE__`, `__CODING__`, `__MEDICINE__`, `__ROBOTICS__`, `__PYTHON__`, `__RUST__`, entre otras).

No se documenta ningún proceso de entrenamiento del tokenizador: no hay información sobre el corpus utilizado para derivar los merges BPE, el número de tokens de entrenamiento, ni si los tokens nuevos se han validado con un modelo ajustado. La model card tampoco describe RLHF, DPO ni ninguna fase de alineamiento, lo cual es coherente con la naturaleza del artefacto. La única indicación cuantitativa sobre adaptación es la afirmación de que se requieren aproximadamente 100.000 ejemplos para que un modelo de routing RAG aproveche plenamente las etiquetas de dominio, y la recomendación de un entrenamiento en dos fases (4K y luego 8K de contexto) para estabilizar el encoding posicional antes de extender las dependencias de largo alcance.

## Capacidades

- Tokenización byte-level BPE compatible con vocabularios Qwen2.5 y DeepSeek R1, incluido el redimensionado de embeddings sin cambios en el código del modelo.
- Marcadores nativos de tool calling: `<|tool_call_start|>`, `<|tool_call_end|>`, `<|tool_result_start|>`, `<|tool_result_end|>`.
- Etiquetas de razonamiento de DeepSeek R1 para delimitar trazas de pensamiento.
- Marcadores FIM para tareas de infill de código, alineados con los formatos de Microsoft BigCode (The Stack, StarCoder, NextCoder).
- Etiquetas de enrutamiento de dominio (52 categorías) pensadas para enrutadores RAG sobre arquitecturas MoE.
- Etiquetas de robótica y embodiment: acciones, trayectorias, joints, sensores, pose, velocidad, fuerza, par, gripper, navegación, obstáculos, planes, comportamientos, habilidades, motores, servo, IMU, lidar, cámara, profundidad, waypoints, colisiones, agarre, calibración, locomotion, manipulation y control loop.
- Etiquetas multimodales para imagen, vídeo, sonido y voz.
- Etiquetas de estado de ánimo humano (`<|mood_happy|>`, `<|mood_sad|>`, `<|mood_angry|>`, `<|mood_neutral|>`).
- Soporte multilingüe declarado, sin lista explícita de idiomas.

## Casos de uso

- Integración de tool calling en pipelines de agentes: los marcadores nativos permiten delimitar llamadas y resultados sin inyectar esquemas JSON en el contexto, lo que según el autor reduce latencia y consumo de tokens en conversaciones multi-turno con muchas herramientas.
- Enrutamiento de consultas en sistemas RAG con MoE: las etiquetas `__MEDICINE__`, `__CODING__`, `__BANKING__` y similares permiten clasificar la consulta antes de seleccionar el experto o el índice documental, siempre que el modelo se haya adaptado con suficientes ejemplos etiquetados.
- Entrenamiento de modelos de código con FIM: los marcadores `<|fim_prefix|>`, `<|fim_middle|>` y `<|fim_suffix|>` habilitan tareas de autocompletado e infill sobre datasets tipo The Stack, útiles para asistentes de IDE.
- Control de robots humanoides y brazos manipuladores: las etiquetas de acción, trayectoria, joint, fuerza y par permiten serializar comandos y telemetría en un formato tokenizado uniforme, como sugiere el proyecto ROBOS del autor.
- Procesamiento de trazas de razonamiento de DeepSeek R1: las etiquetas de reasoning permiten separar el bloque de pensamiento de la respuesta final en pipelines de evaluación o destilación.
- Sistemas multimodales con voz e imagen: las etiquetas `<|image|>`, `<|video|>`, `<|sound|>` y `<|voice|>` facilitan la construcción de turnos mixtos en asistentes que alternan modalidades.
- Modelos financieros internos para banca y fintech: el autor propone usar el tokenizador junto con su dataset abierto para entrenar modelos soberanos con control total sobre los datos, aunque no se aportan detalles del dataset ni del procedimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene únicamente un tokenizador; la inferencia requiere un modelo base compatible (Qwen2.5 o DeepSeek R1) con los pesos correspondientes.
- VRAM estimada: depende exclusivamente del modelo base elegido y de su cuantización; no disponible para el tokenizador en sí.
- GPU recomendadas: no disponibles para el tokenizador; para los modelos base asociados, el requisito vendrá determinado por su tamaño (no especificado en la información proporcionada).
- Ajuste en GPU de consumo: no aplica al tokenizador; depende del modelo base.
- Opciones de despliegue: cualquier runtime que cargue tokenizadores compatibles con Hugging Face `tokenizers` (transformers, vLLM, TGI, llama.cpp con vocabulario adaptado); el autor no documenta integraciones específicas.
- Latencia y throughput: no disponibles. La model card afirma de forma cualitativa que el tool calling a nivel de tokenizador mejora la latencia frente a la inyección dinámica de esquemas, pero no aporta mediciones.

## Comparativa con modelos similares

| Artefacto | Tipo | Vocabulario | Tokens especiales destacados | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| JiRackPrecisionTokenizer | Tokenizador BPE | 151.779 | Tool calling, robótica, routing RAG, FIM, multimodal | MIT | Qwen2.5, DeepSeek R1 |
| Tokenizador original de Qwen2.5 | Tokenizador BPE | 151.643 | ChatML, tool calling básico | Apache 2.0 (según el modelo Qwen2.5) | Qwen2.5 |
| Tokenizador original de DeepSeek R1 | Tokenizador BPE | no disponible en la información proporcionada | Etiquetas de razonamiento | MIT (según el modelo DeepSeek R1) | DeepSeek R1 |

No se dispone de datos de rendimiento comparativo entre estos tokenizadores en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no puede evaluarse con benchmarks de lenguaje; su utilidad depende del modelo base al que se acople.
- Los tokens nuevos carecen de embeddings entrenados; sin un ajuste posterior, el modelo base los tratará como tokens fuera de distribución y su comportamiento será impredecible.
- La adaptación de las etiquetas de routing RAG requiere, según el autor, del orden de 100.000 ejemplos; no se proporciona ni el dataset ni el procedimiento de ajuste.
- La model card mezcla afirmaciones de marketing (precios para fintech, suscripciones, "modelos soberanos") con especificaciones técnicas sin verificación externa.
- El repositorio tiene 0,0 GB y 0 likes, con 276 descargas; no hay evidencia pública de validación por terceros ni de uso en producción.
- Riesgo de colisión de tokens: la ampliación del vocabulario por encima de 151.643 puede entrar en conflicto con identificadores reservados del vocabulario Qwen2.5 original si no se respeta el mapeo exacto.
- La lista de idiomas no está desglosada; el soporte multilingüe real dependerá del vocabulario heredado del modelo base.
- Licencia MIT permite uso comercial, pero no cubre los pesos del modelo base con el que se combine, que mantienen su propia licencia.
- No hay información sobre sesgos, alucinación o robustez, al no ser un modelo generativo.
- La fecha de creación indicada (2026-08-01) y la de actualización (2026-09-25) son posteriores a la mayoría de modelos de referencia citados; conviene verificar la vigencia del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Sitio oficial del autor: http://www.cmsmanhattan.com
- Proyecto ROBOS (GitHub): https://github.com/cmsmanhattan/ROBOS
- Tiangong (plataforma robótica citada): https://english.www.gov.cn/english.www.gov.cn/news/202411/13/content_WS673406e2c6d0868f4e8ece33.html
- Unitree G1: https://a.co/d/0e4A8YVc
- LimX Oli: https://www.limxdynamics.com/en/products/oli
- UBTrobot: https://www.ubtrobot.com/en/
- X-Humanoid: https://www.x-humanoid.com/detail/hskw.html
- Dron Quiver (Arrow Air): https://arrowair.com/quiver/
