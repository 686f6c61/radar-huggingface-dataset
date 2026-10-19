# scombat/s1d1-router

## Resumen

s1d1-router es un clasificador-encoder de 307 millones de parámetros publicado por el usuario scombat que actúa como enrutador de peticiones para sistemas basados en LLM. En una sola pasada sobre el primer mensaje del usuario devuelve tres señales: una puntuación de complejidad en el rango 0,01-1,00, una etiqueta entre 19 tipos de tarea (reasoning, coding_debugging, math, summarization, translation, etc.) y un indicador binario de si la respuesta requiere herramientas externas, archivos del usuario o ejecución de código.

El modelo deriva de jhu-clsp/mmBERT-base, un encoder multilingual de arquitectura ModernBERT con 22 capas y dimensión oculta 768, afinado aquí con una cabeza `ModernBertForSequenceClassification` de 21 salidas. Su utilidad práctica es económica: permite colocar un filtro barato delante de un pool de modelos y reservar el modelo grande y caro para las peticiones que realmente lo necesitan, derivando el resto a modelos pequeños o locales.

Es relevante porque resuelve el enrutado con un encoder de 307 M en lugar de con otro LLM juez, lo que abarata y acelera la decisión. El entrenamiento declarado costó unas 3,0 horas en un solo Apple M4 Max con PyTorch MPS durante 3 épocas, y el autor distribuye cuatro tamaños (full, compact, small, tiny) en tres formatos (PyTorch fp16, MLX 8-bit y ONNX int8).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), `ModernBertForSequenceClassification` con mean pooling, 22 capas, hidden 768 |
| Parametros totales | 307.546.389 (307 M); 110 M fuera de la matriz de embeddings |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | entrenado con hasta 1.024 tokens; el modelo base admite 8.192 |
| Tipos de cuantizacion | fp16 (PyTorch), 8-bit (MLX), int8 (ONNX); carga en fp32 sobre CPU |
| Idiomas soportados | multilingüe; 138 idiomas en los datos de entrenamiento (61,1 % inglés), cobertura heredada de mmBERT |
| Licencia | Apache-2.0 (el modelo base es MIT) |
| Formato de pesos | safetensors; variantes MLX y ONNX |
| Salidas | 21: 1 regresión de complejidad + 19 clases de tarea + 1 logit binario `needs_tools` |
| Tamaño del repositorio | 0,7 GB (649 MB de pesos fp16) |
| Descargas / likes | 25 / 0 (a fecha de la información) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de la familia ModernBERT, inicializado desde jhu-clsp/mmBERT-base y rematado con una única cabeza de clasificación de 21 salidas. La salida 0 es una regresión que se decodifica como `0.5 + 0.25 * logit`, recortada al intervalo 0,01-1,00; las salidas 1 a 19 compiten mediante argmax sobre las 19 clases de tarea; la salida 20 pasa por una sigmoide para decidir `needs_tools`. Los anclajes de la escala de complejidad son trivial 0,01, low 0,25, medium 0,50 y high 0,75.

El conjunto de entrenamiento son 98.033 prompts etiquetados por un juez LLM, agregados a partir de seis fuentes, con 3 épocas sobre un único Apple M4 Max (PyTorch MPS) en unas 3,0 horas. La model card no documenta uso de RLHF ni de DPO; el ajuste es supervisado sobre etiquetas generadas por el juez. Como innovación de despliegue, el autor publica el mismo esquema en cuatro tamaños (full, compact con vocabulario de 32k, small y tiny de 6 capas) y tres formatos, además de un `vocab_map.npy` para las variantes con vocabulario podado.

## Capacidades

- Estimación de complejidad de una petición en escala continua (0,01-1,00) y en cuatro niveles discretos (trivial, low, medium, high).
- Clasificación en 19 tipos de tarea: information_seeking, reasoning, planning, editing, summarization, extraction, classification, translation, coding_debugging, math, data_analysis, writing, role_playing, advice_seeking, brainstorming, completion, action_execution, chat y other.
- Detección binaria de necesidad de herramientas, información fresca, archivos del usuario o ejecución de código, con probabilidad asociada (`needs_tools_probability`).
- Capacidad multilingüe sobre 138 idiomas, con clara sobrerrepresentación del inglés en los datos.
- Conteo de tokens del prompt (`prompt_tokens`) expuesto por el wrapper `s1d1_router.py`.
- No genera texto: es exclusivamente un clasificador de entrada, no soporta tool calling propio ni razonamiento multi-paso.

## Casos de uso

- Enrutado en una pasarela LLM: colocar s1d1-router delante del pool de modelos y enviar las peticiones con complejidad trivial o baja a un modelo pequeño o local, reservando el modelo caro para complejidad medium y high. El coste por decisión es una pasada de encoder de 307 M, muy inferior al de un LLM juez.
- Activación condicional de herramientas: usar `needs_tools` como puerta antes de cargar el esquema de funciones o el intérprete de código, evitando inyectar definiciones de herramientas en peticiones que no las necesitan y ahorrando tokens de contexto.
- Triaje y telemetría de producto: clasificar en 19 categorías cada petición entrante para construir dashboards de uso, detectar qué porcentaje del tráfico es coding_debugging o math y dimensionar la capacidad del pool en consecuencia.
- Atención al cliente multilingüe: el modelo cubre 138 idiomas, de modo que un mismo punto de entrada puede separar consultas de information_seeking (candidatas a RAG o FAQ) de advice_seeking o action_execution (candidatas a agente con herramientas).
- Enrutado en el edge o en local: las variantes tiny y small en ONNX int8 ocupan entre 61 MB y 175 MB y pueden ejecutarse en CPU o en Apple Silicon con MLX 8-bit, lo que permite tomar la decisión en el propio dispositivo sin llamada de red.
- Filtrado previo en pipelines agénticos multi-paso: evaluar cada nuevo mensaje del usuario con una pasada de menos de 1.024 tokens para decidir si el siguiente paso requiere razonamiento profundo, planificación o una simple recuperación de información.
- Control de coste en servicios de código: separar coding_debugging de escritura o chat permite asignar un modelo especializado en código solo al subconjunto que lo necesita, con una regla determinista y auditable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una comprobación cualitativa sobre los prompts de ejemplo: para «Quelle est la capitale de l'Australie ?» el modelo devuelve complejidad 0,01 (trivial), tarea `information_seeking` y `needs_tools = false`.

## Requisitos de hardware

- VRAM estimada: unos 0,65 GB para los pesos en fp16 (649 MB) más activaciones; por debajo de 2 GB en cualquier configuración práctica. La carga por defecto en CPU usa fp32, aproximadamente 1,25 GB.
- GPU recomendadas: cualquier GPU consumer con 2 GB o más sirve; una RTX 4090 o superior está sobradamente dimensionada. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, incluidas GPU de gama baja y iGPU; también en CPU y en Apple Silicon.
- Opciones de despliegue: `transformers` (PyTorch), ONNX Runtime para las variantes int8 y MLX para las variantes 8-bit. El wrapper `s1d1_router.py` selecciona el backend a partir de `variant.json`.
- No usar `pipeline("text-classification")` con sus valores por defecto ni Text Embeddings Inference: ambos aplican una softmax única sobre las 21 salidas, lo que es incorrecto porque la salida 0 es una regresión y la 20 un logit binario. El repositorio declara `inference: false` por este motivo. Con `top_k=None` el pipeline devuelve las 21 salidas crudas etiquetadas por `id2label`.
- Latencia y throughput: no disponibles en esta ficha; cada repositorio de variante publica sus propias medidas de latencia y de acuerdo con el modelo full.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s1d1-router (full) | 307 M | 1.024 en entrenamiento / 8.192 en la base | 21 (regresión + 19 tareas + binaria) | Apache-2.0 | HuggingFace, 25 descargas |
| jhu-clsp/mmBERT-base (base) | 307 M | 8.192 | encoder base (representaciones), sin cabeza de enrutado | MIT | HuggingFace |
| s1d1-router-6src-compact | no disponible (308 MB en fp16, vocabulario de 32k) | no disponible | 21 | no disponible en la información | HuggingFace, dentro de la colección `s1d1-router` |
| s1d1-router-6src-tiny | no disponible (mmBERT-small de 6 capas, 85 MB en fp16) | no disponible | 21 | no disponible en la información | HuggingFace, dentro de la colección `s1d1-router` |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de enrutado frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Techo práctico de complejidad: la escala del juez tenía un quinto ancla, `expert` en 1,00, demasiado rara para aprenderla; el modelo no distingue de forma fiable el tramo alto.
- Solo analiza el primer mensaje del usuario: no ve el historial de conversación, el system prompt ni los mensajes del asistente, por lo que el enrutado en diálogos multi-turno puede quedarse corto.
- Ventana de entrenamiento de 1.024 tokens, muy inferior a los 8.192 que admite la arquitectura base; prompts largos se truncan y pierden información.
- Etiquetas generadas por un juez LLM sobre 98.033 prompts: el clasificador hereda los sesgos y errores sistemáticos de ese juez, sin verificación humana documentada.
- Sesgo lingüístico: el 61,1 % de los datos es inglés, de modo que la precisión en los otros 137 idiomas declarados es presumiblemente menor.
- Es un clasificador, no un generador: no alucina texto, pero sí puede producir etiquetas erróneas, y esas etiquetas condicionan decisiones aguas abajo (modelo asignado, herramientas habilitadas).
- Riesgo operativo de decodificación: usar `pipeline("text-classification")` por defecto o TEI produce puntuaciones incorrectas; hay que decodificar manualmente las 21 salidas.
- Licencia Apache-2.0, que permite uso comercial; el modelo base es MIT. Conviene revisar `LICENSE` y `NOTICE` del repositorio antes de redistribuir.
- Los repositorios de las variantes compact, small y tiny no detallan en la información disponible sus métricas de validación ni su licencia; hay que consultar cada card antes de usarlas en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scombat/s1d1-router
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Perfil del autor: https://huggingface.co/scombat
- Variante compact (PyTorch fp16): https://huggingface.co/scombat/s1d1-router-6src-compact
- Variante small (PyTorch fp16): https://huggingface.co/scombat/s1d1-router-6src-small
- Variante tiny (PyTorch fp16): https://huggingface.co/scombat/s1d1-router-6src-tiny
- Variante full MLX 8-bit: https://huggingface.co/scombat/s1d1-router-6src-full-mlx-8bit
- Variante full ONNX int8: https://huggingface.co/scombat/s1d1-router-6src-full-onnx-int8
- Variante compact MLX 8-bit: https://huggingface.co/scombat/s1d1-router-6src-compact-mlx-8bit
- Variante compact ONNX int8: https://huggingface.co/scombat/s1d1-router-6src-compact-onnx-int8
- Variante small MLX 8-bit: https://huggingface.co/scombat/s1d1-router-6src-small-mlx-8bit
- Variante small ONNX int8: https://huggingface.co/scombat/s1d1-router-6src-small-onnx-int8
- Variante tiny MLX 8-bit: https://huggingface.co/scombat/s1d1-router-6src-tiny-mlx-8bit
- Variante tiny ONNX int8: https://huggingface.co/scombat/s1d1-router-6src-tiny-onnx-int8
- Ficha de terceros con metadatos: https://free2aitools.com/model/scombat/s1d1-router
- Referencias arXiv citadas en los tags del repositorio: https://arxiv.org/abs/2509.06888, https://arxiv.org/abs/2412.13663, https://arxiv.org/abs/2507.11412, https://arxiv.org/abs/2503.05500, https://arxiv.org/abs/1911.02116, https://arxiv.org/abs/2406.18665, https://arxiv.org/abs/2404.14618, https://arxiv.org/abs/2506.16655, https://arxiv.org/abs/2305.05176, https://arxiv.org/abs/2505.14183, https://arxiv.org/abs/2306.05685, https://arxiv.org/abs/1810.03993
