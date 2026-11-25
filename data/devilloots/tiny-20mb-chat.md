# devilloots/tiny-20mb-chat

## Resumen

Tiny20MB Chat es un modelo de lenguaje decoder-only de 9,88 millones de parámetros entrenado desde cero por el usuario devilloots sobre dos GPUs Tesla T4 en Kaggle. Se presenta como una implementación moderna y compacta de un transformer, con atención GQA (6 cabezas de query y 2 de key/value), normalización RMSNorm, activación SwiGLU y embeddings rotatorios RoPE, junto con un tokenizador BPE de 8.192 tokens. El checkpoint final en FP16 ocupa aproximadamente 19,79 MB gracias al uso de weight tying entre la capa de entrada y la de salida.

El modelo se ha preentrenado con el corpus FineWeb-Edu y posteriormente ajustado con instrucciones limpias de SmolTalk, lo que le permite seguir un formato de prompt concreto (`System:`, `User:`, `Assistant:`) y generar respuestas en formato conversacional. Su ventana de contexto es de 256 tokens, lo que lo sitúa en el rango de los modelos experimentales de juguete más que en el de asistentes de producción.

La relevancia de este modelo es fundamentalmente didáctica y de investigación: demuestra que es posible entrenar un transformer funcional desde cero en hardware de consumo (dos T4) y publicar los pesos con licencia MIT, algo útil para estudiar dinámicas de entrenamiento, evaluar metodologías de benchmark libre de contaminación o experimentar con arquitecturas modernas a escala mínima. Sus resultados en la propia benchmark del autor (4,67/100 en una prueba estricta de 150 casos) dejan claro que no está pensado para tareas reales de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RMSNorm, SwiGLU y RoPE |
| Parametros totales | 9.884.448 (weight-tied) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (block_size) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en FP16) |
| Idiomas soportados | no disponible (entrenado principalmente con FineWeb-Edu y SmolTalk, mayoritariamente en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint FP16, `head.weight` omitido y re-vinculado a `tok.weight` al cargar) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con `d_model=288` y `mlp_dim=832`. Emplea atención con grouped-query attention (6 cabezas de query y 2 de key/value), normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios RoPE. El tokenizador es un BPE de 8.192 tokens entrenado específicamente para el modelo, y la ventana de contexto es de 256 tokens. El checkpoint publicado en FP16 pesa unos 19,79 MB y omite el peso de la cabeza de salida, que se re-vincula al embedding de entrada en la carga (weight tying).

El entrenamiento se realizó desde cero en Kaggle sobre dos GPUs Tesla T4, con una fase de preentrenamiento sobre FineWeb-Edu seguida de un ajuste supervisado (SFT) con SmolTalk. No se documenta en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal; la propuesta técnica se limita a una implementación limpia y moderna de los componentes habituales en LLMs actuales, a escala muy reducida.

## Capacidades

- Generación de texto conversacional siguiendo el formato `System: <role>\nUser: <prompt>\nAssistant: `.
- Capacidad limitada de razonamiento multi-paso: en la benchmark del autor obtiene 1/25 en lógica multi-paso difícil.
- Capacidad muy limitada de matemáticas: 0/25 en la suite de matemáticas y álgebra no vistas.
- Capacidad muy limitada de generación de código: 0/25 en trazas de código con ejecución en vivo.
- Capacidad limitada de seguir instrucciones con múltiples restricciones: 0/25 en la suite IFEval difícil.
- Cierto rendimiento en seguimiento de estado adversarial: 5/25 (20 %) en la suite correspondiente.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidades multilingües no documentadas; el entrenamiento se apoya en corpus mayoritariamente anglófonos.

## Casos de uso

- Docencia y experimentación arquitectónica: permite estudiar en local el comportamiento de GQA, SwiGLU, RMSNorm y RoPE en un modelo de menos de 10 M de parámetros, sin necesidad de infraestructura cloud.
- Reproducción de pipelines de entrenamiento desde cero: sirve como referencia para validar scripts de preentrenamiento y SFT en GPUs de consumo (por ejemplo, dos T4 en Kaggle), comparando curvas de pérdida y perplejidad.
- Investigación sobre evaluación libre de contaminación: el autor publica una benchmark de 150 pruebas estrictas con métricas de alucinación y bucles, útil como plantilla metodológica para otros modelos pequeños.
- Pruebas de formatos de prompt y tokenizadores: al incluir un BPE propio de 8.192 tokens y un formato de chat definido, permite experimentar con preprocesado y plantillas sin coste computacional relevante.
- Generación de texto muy corto en entornos embebidos o de demostración: con 19,79 MB en FP16 y contexto de 256 tokens, puede ejecutarse en CPU para demos de inferencia y pruebas de integración de pipelines.
- Estudio de fallos típicos de modelos pequeños: la tasa de alucinación del 80 % y la de bucles greedy del 11,3 % lo convierten en un caso práctico para analizar y mitigar estos comportamientos en modelos de baja capacidad.

## Benchmarks y rendimiento

Resultados publicados por el autor en su benchmark de 150 pruebas estrictas sin contaminación:

| Suite | Puntuacion |
|---|---|
| Hard Multi-Step Logic | 1/25 (4,0 %) |
| Hard Unseen Math & Algebra | 0/25 (0,0 %) |
| Coding Traces + Live Exec | 0/25 (0,0 %) |
| Unseen Science + Abstention | 1/25 (4,0 %) |
| Hard Multi-Constraint IFEval | 0/25 (0,0 %) |
| Adversarial State Tracking | 5/25 (20,0 %) |
| Total estricto | 7/150 (4,67 / 100) |

Métricas adicionales reportadas:

| Metrica | Valor |
|---|---|
| Perplejidad en prosa inglesa no vista | 128,12 |
| Perplejidad en codigo Python no visto | 38,40 |
| Tasa de alucinacion en preguntas no resolubles | 80,0 % |
| Tasa de bucles en decodificacion greedy | 11,3 % |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 (checkpoint de 19,79 MB más activaciones y tokenizador); en FP32 sería aproximadamente el doble.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el propio autor entrenó en dos Tesla T4.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia interactiva.
- Opciones de despliegue: al estar publicado como checkpoint PyTorch con `library_name: pytorch`, el despliegue requiere cargar los pesos con el código del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato GGUF no está disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño, se espera latencia de milisegundos por token en GPU y de decenas a cientos de milisegundos en CPU, aunque no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Tiny20MB Chat (devilloots) | 9,88 M | 256 | MIT | Hugging Face (PyTorch) |
| Modelos tipo TinyStories / tiny GPT de ~10 M | no disponible | no disponible | variable | no disponible |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 | Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de menos de 100 M de parámetros) no está cubierta en la información proporcionada; los modelos incluidos en la tabla se ofrecen como referencia de tamaño y contexto, pero no se dispone de datos de rendimiento comparables publicados por el autor.

## Limitaciones y advertencias

- Capacidad de razonamiento, matemáticas y código prácticamente nula según la benchmark del autor (0/25 en matemáticas, código e IFEval).
- Tasa de alucinación del 80 % en preguntas no resolubles: no es fiable para respuestas factuales.
- Tasa de bucles del 11,3 % en decodificación greedy, lo que puede producir repeticiones en generaciones largas.
- Ventana de contexto de solo 256 tokens, insuficiente para conversaciones multi-turno o documentos.
- Perplejidad alta en prosa inglesa no vista (128,12), indicativa de una modelización del lenguaje limitada.
- Idiomas soportados no documentados; el entrenamiento se apoya en FineWeb-Edu y SmolTalk, mayoritariamente en inglés, por lo que el rendimiento en castellano es previsiblemente muy bajo.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para producción por sus limitaciones de calidad.
- No se documentan sesgos específicos, pero al entrenarse sobre corpus web (FineWeb-Edu) puede heredar sesgos presentes en esos datos.
- El checkpoint omite `head.weight` y requiere re-vincularlo al embedding de entrada al cargar; un uso incorrecto del checkpoint puede producir errores de carga.
- No hay soporte documentado para cuantización, GGUF ni motores de inferencia estándar, lo que limita su integración en stacks de producción.

## Enlaces

- Hugging Face: https://huggingface.co/devilloots/tiny-20mb-chat
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
