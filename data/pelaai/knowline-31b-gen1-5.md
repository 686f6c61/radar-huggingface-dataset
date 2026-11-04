# PelaAI/KnowLine-31B-Gen1.5

## Resumen

KnowLine-31B-Gen1.5 es un modelo de decisión (decision model) desarrollado por PelaAI, un fine-tune LoRA del modelo denso google/gemma-4-31B-it. A diferencia de los modelos generativos convencionales, KnowLine no produce texto libre: recibe un estado (texto o una conversación) y hasta 64 preguntas tipadas (sí/no, elección entre k opciones, o puntuación sobre una rúbrica), y devuelve para cada pregunta una distribución de probabilidad sobre sus opciones en un único forward pass. Su pipeline declarado en HuggingFace es `text-classification`, y está orientado a tareas de decisión, enrutamiento y evaluación automatizada.

La versión Gen1.5 no modifica los pesos: cada archivo de pesos, configuración y tokenizador es byte-idéntico a KnowLine-31B-Gen1. Lo que cambia es la forma de servir peticiones largas. Las peticiones de solo texto que caben en 3.000 tokens se siguen leyendo dos veces, mientras que las de hasta 32.768 tokens se leen una sola vez con una cabecera de preguntas que las enumera antes del estado. Según el autor, esto eleva la puntuación en la suite pública Decision Index 0.3 de 70,13 a 70,50 sin reentrenamiento.

El modelo se presenta como independiente, no afiliado a TypeSafe, Jev ni Google, y conserva la torre de visión del modelo base (aunque fue entrenado solo con texto). Su relevancia actual reside en ofrecer una alternativa determinista y de baja latencia frente a los pipelines de generación + parsing para tareas de clasificación y decisión estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base google/gemma-4-31B-it), fine-tune LoRA fusionado; torre de visión del modelo base conservada |
| Parametros totales | 31.273.088.876 (31,27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens para peticiones de solo texto con cabecera de preguntas; 3.000 tokens para el modo de lectura doble |
| Tipos de cuantizacion | bf16 en el formato de publicación; FP8 no probado por el autor al cargar este modelo |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, ~63 GB); tokenizador de Gemma 4 |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer denso de unos 31B parámetros, y se obtiene mediante un fine-tune LoRA de rango 32 y alpha 64 aplicado únicamente al modelo de lenguaje, durante una época, y fusionado posteriormente en pesos bf16. La temperatura de lectura T = 1,44 está plegada en el peso de la normalización final y en el soft-cap de logits final; el front end lee las preguntas de puntuación a una temperatura efectiva de 1,0 según `temperatures.json`. La torre de visión permanece sin cambios respecto al modelo base.

La innovación de Gen1.5 es exclusivamente de inferencia: `knowline_server.py` lee dos veces las peticiones cortas (comportamiento heredado de Gen1, activado por defecto) y `serve_knowline.sh` añade `--header-when-long 32768`, de modo que las peticiones de solo texto más largas se leen una vez con una cabecera que enumera las preguntas antes del estado. Con `--no-read-twice` toda petición se lee una sola vez sin cabecera. No se entrenó nada nuevo para esta versión; el autor no detalla la composición del dataset de entrenamiento original en la información disponible.

## Capacidades

- Respuesta a preguntas tipadas: sí/no, elección entre k opciones y puntuación sobre rúbrica, con salida de distribución de probabilidad por opción.
- Un único forward pass por pregunta, sin generación de texto, lo que reduce latencia frente a pipelines generativos.
- Procesamiento de estados en formato texto o conversación (chat) de hasta 32.768 tokens en modo cabecera.
- Hasta 64 preguntas por petición.
- Soporte de tool calling y agentes: la suite Decision Index incluye las categorías "tools and agents" y "retrieval and routing".
- Capacidades multilingües limitadas a inglés y chino.
- Procesamiento de imágenes heredado del modelo base (peticiones con imagen se sirven exactamente como en Gen1).
- Respuesta a preguntas de caja (bounding box) en modo zero-shot, sin entrenamiento específico de cajas.
- Probabilidades calibradas: ECE de aproximadamente 0,013-0,022 y Brier score de aproximadamente 0,23-0,26 en la suite pública según el método del board.
- Compatibilidad de interfaz con clientes Jev existentes (solo cambia la URL base) y con otros modelos KnowLine (solo cambia el nombre del modelo).

## Casos de uso

- Enrutamiento de consultas en sistemas RAG: el modelo evalúa preguntas de recuperación y enrutamiento (categoría con puntuación 73,2 en la suite pública) para decidir qué índice o herramienta debe atender cada consulta, con una sola pasada por pregunta.
- Clasificación de tickets de soporte: con preguntas de elección entre k opciones se puede asignar categoría, prioridad y equipo responsable en un único forward pass, sin generar texto ni parsear salidas.
- Evaluación automática de respuestas (LLM-as-a-judge estructurado): las preguntas de puntuación sobre rúbrica permiten obtener una distribución calibrada en lugar de una nota discreta, útil para comparar candidatos en pipelines de evaluación.
- Detección de instrucciones inyectadas: el modelo responde preguntas de decisión sobre el estado recibido, y el autor reporta métricas de robustez frente a instrucciones plantadas (0,7% de respuestas alteradas en el conjunto estándar y 5,3% con plantillas de inyección no vistas en entrenamiento).
- Agentes multi-paso con tool calling: las preguntas tipadas permiten decidir en cada paso si invocar una herramienta, cuál elegir entre k candidatas y si continuar o detener el bucle, con la categoría "tools and agents" en 85,4 en la suite pública.
- Análisis de documentos e imágenes: al conservar la torre de visión, puede responder preguntas sobre capturas de pantalla o documentos (ScreenSpot centre-hit 81,3) y devolver cajas delimitadoras de un objetivo nombrado (RefCOCO IoU≥0,5 de 77,3).
- Moderación y filtrado por lotes: la clasificación binaria de contenido con probabilidades calibradas permite fijar umbrales operativos con ECE bajo, adecuado para colas de revisión con presupuesto limitado.

## Benchmarks y rendimiento

| Benchmark | KnowLine-31B-Gen1.5 | KnowLine-35B-A3B-Gen1.5 | KnowLine-26B-A4B-Gen2.5 |
|---|---|---|---|
| Decision Index 0.3 (suite pública, self-run) | 70,50 | 70,72 | 68,21 |
| Decision Index 0.3, categoría lenguaje | 72,8 | no disponible | no disponible |
| Decision Index 0.3, tools and agents | 85,4 | no disponible | no disponible |
| Decision Index 0.3, retrieval and routing | 73,2 | no disponible | no disponible |
| Decision Index 0.3, knowledge and reasoning | 59,4 | no disponible | no disponible |
| Decision Index 0.3, arts and taste | 60,5 | no disponible | no disponible |
| Tareas de decisión de dominios no vistos (34 tareas) | 75,0 | 56,2 | 66,4 |
| Tareas de decisión de dominios no vistos (10 tareas) | 57,7 | 56,6 | 56,6 |
| Chino, conjuntos internos | 75,9 / 75,9 | no disponible | 73,7 / 71,0 |
| C-Eval | 82,5 | no disponible | 77,9 |
| Open-Jev 1.1 test / OOD | 91,3 / 94,8 | no disponible | 92,7 / 92,7 |
| JevBench / JevBench-hard | 90,5 / 80,2 | no disponible | 90,5 / 81,1 |
| Inglés, conjunto interno | 70,2 | no disponible | 70,5 |
| Decision Index 0.3.1 visión (reconstrucción del autor) | 69,9 | 71,2 (Gen1) | 64,7 (Gen2) |
| Suite pública de visión oficial (self-run) | 69,3 | no disponible | no disponible |
| ScreenSpot centre-hit | 81,3 | no disponible | no disponible |
| RefCOCO IoU≥0,5 | 77,3 | no disponible | no disponible |
| FUNSD | 35,3 | no disponible | no disponible |
| ECE (suite pública, método del board) | ~0,013-0,022 | no disponible | 0,013-0,018 |
| Brier score (suite pública, método del board) | ~0,23-0,26 | no disponible | 0,24-0,27 |

El autor indica que la puntuación completa del board proviene de la ejecución privada de los mantenedores; Gen1 figura con 71,86 y Gen1.5, al compartir pesos, obtendrá sus puntuaciones privadas de esa misma ejecución.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 63 GB de pesos, más overhead de activaciones y caché KV; el autor indica que SGLang reserva por defecto el 85% de la memoria de la GPU.
- GPU recomendadas: una sola GPU de 80 GB (A100 80GB, H100 80GB) es el mínimo práctico para bf16; configuraciones multi-GPU para mayor throughput.
- No cabe en GPU de consumo (RTX 4090 de 24 GB) en bf16 sin cuantización; el autor no ha probado FP8 al cargar este modelo, y no se documentan pesos GGUF en la información disponible.
- Opciones de despliegue: SGLang en bf16 mediante `serve_knowline.sh`, con `knowline_server.py` para el modo de lectura doble y `--header-when-long 32768` para peticiones largas; compatible con endpoints (tag `endpoints_compatible`).
- Latencia y throughput: no se publican cifras concretas; la arquitectura de un forward pass por pregunta sin generación de texto reduce la latencia frente a pipelines generativos, pero no hay mediciones disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 (público) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-31B-Gen1.5 | 31,27B denso | 32.768 tokens (modo cabecera) | 70,50 | Apache-2.0 | HuggingFace (PelaAI) |
| KnowLine-35B-A3B-Gen1.5 | 35B totales, 3B activos (MoE) | no disponible | 70,72 | no disponible en la información | HuggingFace (PelaAI) |
| KnowLine-26B-A4B-Gen2.5 | 26B totales, 4B activos (MoE) | no disponible | 68,21 | no disponible en la información | HuggingFace (PelaAI) |
| google/gemma-4-31B-it | ~31B denso | no disponible | no disponible | Apache-2.0 | HuggingFace (Google) |

Los tres modelos KnowLine comparten interfaz y metodología de evaluación, por lo que son las alternativas naturales. El modelo base gemma-4-31B-it es generativo y no está especializado en tareas de decisión, por lo que no es directamente comparable en la suite Decision Index.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al derivar de gemma-4-31B-it, puede heredar los del modelo base.
- Alucinación: al no generar texto libre, el riesgo se traslada a la calibración de las probabilidades; el autor reconoce que en sus propios conjuntos held-out la calibración es más débil que en la suite pública.
- Robustez frente a inyección de instrucciones: 0,7% de respuestas alteradas con instrucciones plantadas en el estado y 5,3% con plantillas no vistas en entrenamiento, peor que KnowLine-26B-A4B-Gen2.5 (0,1% y 1,7%).
- Idiomas: solo inglés y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Contexto: el modo de lectura doble está limitado a 3.000 tokens; el modo cabecera llega a 32.768 tokens, pero solo para peticiones de solo texto.
- Visión y cajas: el modelo fue entrenado solo con texto; los resultados de visión y bounding box son zero-shot y el rendimiento en documentos es débil (FUNSD 35,3).
- Licencia Apache-2.0: permite uso comercial, pero el autor declara que el modelo es independiente y no está avalado por Google, TypeSafe ni Jev.
- Producción: el autor no ha probado FP8 al cargar este modelo; SGLang reserva el 85% de la memoria de la GPU por defecto, lo que condiciona el despliegue en GPUs compartidas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios aún inexistente.

## Enlaces

- HuggingFace: https://huggingface.co/PelaAI/KnowLine-31B-Gen1.5
- Versión anterior (Gen1): https://huggingface.co/PelaAI/KnowLine-31B-Gen1
- Modelo hermano KnowLine-26B-A4B-Gen2.5: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Modelo hermano KnowLine-35B-A3B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- Modelo hermano KnowLine-4B-Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Guía de inferencia (referenciada en la model card): INFERENCE.md dentro del repositorio
- Paper referenciado en los tags: arxiv:2309.06275 (https://arxiv.org/abs/2309.06275)
