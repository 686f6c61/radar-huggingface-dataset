# Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-BT-256K

## Resumen

Qwen3-VL-8B-Instruct-UI-Genie-BT-256K es un modelo de recompensa escalar entrenado por el autor Gyubeum a partir de Qwen/Qwen3-VL-8B-Instruct. No es un modelo generativo de propósito general: se ha reconvertido en un clasificador de secuencias (`task_type="seq_cls"`, `num_labels=1`, `problem_type="regression"`) que recibe un contexto de interacción con una interfaz gráfica (objetivo, historial de pasos y capturas de pantalla) junto con una acción candidata, y devuelve un único float que indica la calidad de esa acción. La cabeza `score.weight` proyecta el estado oculto del último token no de padding a un escalar de recompensa.

El modelo se ha afinado con pérdida pairwise Bradley-Terry, `-log σ(r_chosen − r_rejected)`, sobre 255.986 muestras que corresponden a 127.993 pares elegido/rechazado del split `bt/` del dataset Gyubeum/UI_Genie_256k (derivado de UI-Genie-RM-517k). El sufijo 256K del nombre cuenta muestras, no pares, un detalle importante para no confundirlo con una ventana de contexto de 256.000 tokens.

Su relevancia práctica está en el entrenamiento y la selección de agentes GUI: proporciona una señal de recompensa continua y no acotada que puede alimentar PPO/GRPO o servir para best-of-N, a diferencia de la variante SFT del mismo autor, que emite una clasificación discreta `<|+|>` / `<|-|>`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (`Qwen3VLForConditionalGeneration`) con cabeza lineal `score.weight` añadida para regresión escalar |
| Parámetros totales | 8.144.797.936 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada; en entrenamiento se usó un máximo de 8.192 tokens con truncamiento por la izquierda |
| Tipos de cuantización | No disponible (no se han publicado versiones cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (pesos en bfloat16, índice `model.safetensors.index.json`; repositorio de 16,3 GB) |
| Tarea / pipeline | `image-text-to-text` con cabeza de clasificación (`seq_cls`, regresión) |
| Entradas | Texto (objetivo e historial de pasos) + imágenes (capturas de pantalla), `max_pixels` = 1.048.576 |
| Salida | Un escalar por trayectoria; mayor puntuación implica mejor acción |

## Arquitectura y entrenamiento

La base es el transformer multimodal Qwen3-VL de 8.100 millones de parámetros en su variante Instruct, que procesa conjuntamente instrucciones textuales y capturas de pantalla mediante un *vision tower*, un alineador y el cuerpo del modelo de lenguaje. Sobre esa base se inicializa desde cero una cabeza lineal `score` sin sesgo que proyecta el estado oculto del último token no de padding a un único valor real. El ajuste se hace con pérdida Bradley-Terry sobre pares, de modo que la red aprende a ordenar acciones, no a generar texto. El entrenamiento congela el *vision tower* y el alineador, y aplica LoRA con r=64, α=32 y dropout 0,05 sobre todas las capas lineales del LLM más la cabeza `score`: 174,6 millones de parámetros entrenables. El adaptador se fusiona después en un checkpoint consolidado, porque el entrenador guardaba la cabeza `score` únicamente en los *shards* de DeepSpeed ZeRO-3 y un merge LoRA estándar la descartaría.

Los datos son 127.993 pares de preferencia (255.986 muestras) del split `bt/` de Gyubeum/UI_Genie_256k, donde cada fila contiene un contexto —objetivo, historial de pasos y capturas— con una acción elegida y una rechazada. El conjunto no solapa con el conjunto de evaluación pairwise de 1.000 ejemplos de UI-Genie. La configuración concreta fue de 1 época y 2.000 pasos, con 64 pares por paso (1 por GPU × 8 de acumulación de gradiente × 8 GPUs), AdamW con lr 1e-4, schedule coseno, 5 % de *warmup*, weight decay 0,1 y recorte de gradiente 1,0, en bfloat16 sobre 8 GPUs con DeepSpeed ZeRO-3. La innovación destacable no está en la arquitectura, sino en el empaquetado: la recuperación explícita de la cabeza de recompensa tras el merge LoRA y el formato de salida continua, que permite usar el modelo como función de valor en lugar de como clasificador binario.

## Capacidades

- Puntuación escalar de acciones de agente GUI: devuelve un float no acotado por cada par contexto-acción, utilizable como señal de recompensa.
- Comparación de preferencias: al puntuar dos acciones del mismo contexto, la diferencia de scores reproduce el orden elegido/rechazado aprendido con Bradley-Terry.
- Comprensión multimodal de capturas de pantalla junto con texto de objetivo e historial de pasos.
- Manejo de contextos con múltiples imágenes y trayectorias largas, hasta 8.192 tokens en entrenamiento y con `max_pixels` de 1.048.576 por imagen.
- Integración como modelo de recompensa en RLHF: PPO, GRPO u otros algoritmos que consuman una señal de valor densa.
- Selección best-of-N: generar varias acciones candidatas y quedarse con la de mayor score.
- No soporta *tool calling*, *function calling* ni modo *thinking*: la cabeza de clasificación sustituye a la generación de texto y el modelo no produce respuestas en lenguaje natural.
- Capacidades multilingües: no documentadas en la información disponible.
- No compatible con el cargador `Qwen3VLForConditionalGeneration` de vLLM, que rechaza el tensor extra `score.weight`; requiere `transformers`.

## Casos de uso

- Entrenamiento por refuerzo de agentes Android: el modelo actúa como función de recompensa que puntúa cada acción propuesta por la política durante PPO o GRPO, sustituyendo a un juez humano o a una heurística de éxito de tarea.
- Selección best-of-N en producción: ante un paso ambiguo, el agente genera N acciones candidatas y el modelo elige la de mayor score, reduciendo pulsaciones erróneas sin reentrenar la política.
- Filtrado y curación de trayectorias sintéticas: puntuar grandes lotes de trayectorias generadas por otros modelos y descartar las de score bajo antes de usarlas para SFT, lo que rebaja el coste de anotación manual.
- Evaluación automática de agentes GUI: comparar dos versiones de una política sobre el mismo conjunto de contextos midiendo la diferencia media de recompensa, como métrica offline previa al despliegue.
- Reranking dentro del bucle del agente: reordenar las acciones que propone un modelo generativo más pequeño y rápido, manteniendo la latencia baja y la calidad de decisión alta.
- Detección de ataques de recompensa (*reward hacking*): usar el score como señal de auditoría para localizar trayectorias que la política considera óptimas pero que el modelo de recompensa penaliza, revelando inconsistencias.
- Investigación en preferencias multimodales: al ser un checkpoint `seq_cls` con pares públicos, sirve como línea base reproducible para estudiar funciones de recompensa en dominios de interacción con interfaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de accuracy de preferencias, correlación con anotadores humanos ni comparaciones cuantitativas con otras funciones de recompensa.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16,3 GB solo para los pesos (coincide con el tamaño del repositorio), más activaciones y memoria del *vision tower* al procesar capturas; un presupuesto práctico de 20-24 GB es razonable para una sola trayectoria con pocas imágenes.
- GPU recomendadas: A100 40 GB u 80 GB, H100 o L40S para lotes pequeños; una RTX 4090 de 24 GB puede alojar los pesos en bfloat16, pero el margen para imágenes de hasta 1.048.576 píxeles y lotes mayores es ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB similares; en tarjetas de 16 GB no cabe en bfloat16 sin cuantización, y no se han publicado conversiones cuantizadas.
- Despliegue: únicamente `transformers`, cargando el modelo con `Qwen3VLForConditionalGeneration.from_pretrained(..., torch_dtype=torch.bfloat16)` y leyendo `score.weight` por separado con `safetensors` y `hf_hub_download`. vLLM no es una opción válida por el tensor adicional. No hay soporte documentado en llama.cpp, Ollama ni TGI: son cargadores de generación de texto y no contemplan la cabeza de regresión.
- Latencia y throughput: no disponibles. Al no haber servidor de alto rendimiento soportado, el rendimiento vendrá limitado por el bucle de inferencia de `transformers` y por el preprocesado de imágenes, no por un *engine* con *continuous batching*.
- Memoria en entrenamiento: la referencia del autor es de 8 GPUs con DeepSpeed ZeRO-3 y bfloat16 para 64 pares por paso.

## Comparativa con modelos similares

| Modelo | Objetivo | Pares / muestras | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-VL-8B-Instruct-UI-Genie-BT-256K | Bradley-Terry | 127.993 pares / 255.986 muestras | Escalar continuo no acotado | Apache 2.0 | HuggingFace, solo `transformers` |
| Qwen3-VL-8B-Instruct-UI-Genie-BT-128K | Bradley-Terry | 63.988 pares / 127.976 muestras | Escalar continuo no acotado | Apache 2.0 | HuggingFace, mismo recetario con la mitad de datos |
| Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K | SFT | 127.976 muestras de etiqueta única | Clasificación discreta `<|+|>` / `<|-|>` | Apache 2.0 | HuggingFace; más fácil de integrar si se necesita una decisión binaria |
| Qwen/Qwen3-VL-8B-Instruct | Generación multimodal | No aplica | Texto | No indicada en la información disponible | Modelo base, sin función de recompensa |

Frente a las alternativas del propio autor, este checkpoint duplica los pares de BT-128K y ofrece una señal continua que SFT-128K no proporciona, a cambio de requerir una carga manual de la cabeza `score` y de no poder servirse con vLLM.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas ni produce texto, acciones o código. Cualquier uso fuera de la puntuación de acciones de agente GUI queda fuera de su diseño previsto.
- Dominio restringido a interacción con interfaces móviles (el código de entrenamiento vive en el repositorio AndroidFlux). Su comportamiento en escritorio, web u otros entornos no está validado.
- Riesgo de *reward hacking*: al ser una recompensa aprendida y no acotada, una política entrenada contra ella puede explotar atajos que puntúan alto sin completar la tarea. Se recomienda combinarla con verificación de éxito real.
- Truncamiento por la izquierda a 8.192 tokens: historiales de pasos muy largos pierden el contexto inicial, incluido el objetivo de la tarea si el formato no lo protege.
- Sesgos: no documentados. Al heredar Qwen3-VL-8B-Instruct y entrenarse sobre capturas de pantalla reales, puede reproducir sesgos de idioma, región, tipo de dispositivo y estilo de interfaz presentes en los datos.
- Idiomas soportados no disponibles: no hay garantía de comportamiento equivalente en castellano frente a inglés.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de ordenación ni comparación con otros modelos de recompensa, por lo que cualquier elección frente a alternativas debe validarse empíricamente.
- Entrenamiento corto (1 época, 2.000 pasos): posible infraajuste o sobreajuste a los estilos de acción dominantes del dataset.
- Integración frágil: la cabeza `score.weight` no está cableada en la clase `CausalLM` base y debe cargarse a mano; un `from_pretrained` ingenuo o un merge LoRA estándar la pierde silenciosamente.
- Sin versiones cuantizadas publicadas, lo que encarece el despliegue en GPUs de gama media y descarta pilas de inferencia ligeras.
- Licencia Apache 2.0 en este checkpoint, pero conviene revisar los términos del modelo base Qwen3-VL-8B-Instruct antes de un uso comercial en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-BT-256K
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Variante Bradley-Terry con 128K: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-BT-128K
- Variante SFT con 128K: https://huggingface.co/Gyubeum/Qwen3-VL-8B-Instruct-UI-Genie-SFT-128K
- Dataset de entrenamiento: https://huggingface.co/datasets/Gyubeum/UI_Genie_256k
- Dataset original de preferencias: https://huggingface.co/datasets/UI-Genie/UI-Genie-RM-517k
- Código de entrenamiento (AndroidFlux): https://github.com/glim-arc/AndroidFlux
- Qwen3 Technical Report (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
