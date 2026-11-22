# OliverSieberling/triadic-gdn-e2-1.3b-64k

## Resumen

Triadic Gated DeltaNet (E=2) 1.3B 64k es un checkpoint de investigación publicado por Oliver Sieberling (con la colaboración de Bharat Runwal, David Jin, Ryan Chin, Rameswar Panda y Yoon Kim) que implementa la arquitectura Triadic Linear Attention descrita en el paper arXiv:2609.36529. El modelo explora una variante de atención lineal recurrente en la que el estado recurrente se organiza en tres dimensiones, con una dimensión de segunda clave E = 2, y incorpora el mecanismo Gated DeltaNet. Con 1.364 millones de parámetros, 24 capas, dimensión de modelo 2048 y 16 cabezas, está pensado como banco de pruebas para evaluar atención lineal en contextos largos, no como un modelo listo para producción.

El entrenamiento parte de 65.000 millones de tokens de FineWeb-Edu con contexto de 4k, seguido de una fase de extensión de contexto hasta 64k sobre 6.800 millones de tokens adicionales. Utiliza el tokenizador de Llama-2 y una licencia MIT permisiva, lo que facilita la reproducción y la experimentación académica. Su relevancia actual reside en que ofrece una implementación abierta y verificable de una propuesta reciente de atención lineal con estado recurrente tridimensional, un área activa de investigación para reducir el coste cuadrático de la atención estándar en secuencias largas.

No obstante, conviene subrayar que se trata de un checkpoint de investigación: no está ajustado con instrucciones ni RLHF, solo soporta inglés, no incluye pipeline declarado en Hugging Face y su ejecución requiere código propio y una GPU H100 según el autor. Los resultados publicados en la model card (perplejidad y tareas de recuperación) son modestos en comparación con modelos transformer convencionales del mismo tamaño, lo que refleja su carácter exploratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal recurrente (Triadic Linear Attention, Gated DeltaNet), 24 capas, d_model 2048, 16 cabezas, dimensión de segunda clave E = 2 |
| Parametros totales | 1.364.161.024 (1,3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64k tokens (entrenado en 4k y extendido a 64k) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en precisión nativa; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, repo de 5,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer con atención lineal recurrente basada en Triadic Linear Attention, una propuesta que generaliza mecanismos de atención lineal con estado recurrente. En concreto, emplea Gated DeltaNet con un estado recurrente tridimensional y una dimensión de segunda clave E = 2. La configuración consta de 24 capas, dimensión de modelo 2048 y 16 cabezas de atención, con un total de 1.364,2 millones de parámetros. El tokenizador es el de Llama-2.

El preentrenamiento se realizó sobre 65.000 millones de tokens de FineWeb-Edu con una longitud de contexto de 4k tokens. Posteriormente se aplicó una fase de extensión de contexto hasta 64k tokens sobre 6.800 millones de tokens adicionales. La model card no documenta el uso de RLHF, DPO ni ajuste por instrucciones; se trata, por tanto, de un modelo base. Tampoco se detallan innovaciones adicionales como decodificación especulativa; la innovación principal es la propia arquitectura de atención lineal triádica con estado recurrente.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de un prompt, en modo modelo base (sin ajuste por instrucciones).
- Modelado de lenguaje y cálculo de perplejidad, útil para evaluación de arquitecturas de atención lineal.
- Procesamiento de contextos largos de hasta 64k tokens gracias a la fase de extensión de contexto.
- Tareas de recuperación de información en contexto (evaluadas mediante Recall y NIAH en la model card).
- Razonamiento y generación de código: no disponible de forma específica; al ser un modelo base no se documentan capacidades emergentes evaluadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en atención lineal: reproducir los experimentos del paper arXiv:2609.36529 cargando el checkpoint con el código de TriadicLinearAttention para comparar Triadic Linear Attention frente a atención estándar en tareas de modelado de lenguaje.
- Evaluación de contextos largos: utilizar la ventana de 64k tokens para medir perplejidad en documentos extensos (por ejemplo, libros de PG19) y analizar el comportamiento de la atención lineal recurrente a distintas distancias.
- Pruebas de recuperación en contexto (NIAH): emplear el modelo como sujeto de experimentos de aguja en un pajar para estudiar la degradación del estado recurrente tridimensional con la distancia.
- Baseline académico: servir como referencia de 1,3B parámetros con atención lineal para comparaciones controladas con transformers de tamaño similar en entornos de investigación.
- Estudio de eficiencia de memoria: analizar el ahorro de memoria frente a atención cuadrática en secuencias de decenas de miles de tokens, dado el estado recurrente de tamaño fijo.
- Reproducción de resultados: validar las métricas publicadas en la model card (WikiText 7,97; PG19 10,82 en ≤4k; Recall 40,8; NIAH 32,8) con el código oficial y los pesos safetensors.

## Benchmarks y rendimiento

Resultados 0-shot publicados en la model card del autor:

| Metrica | Resultado |
|---|---|
| WikiText (perplejidad) | 7,97 |
| PG19 ≤4k (perplejidad) | 10,82 |
| PG19 4k–16k (perplejidad) | 10,28 |
| PG19 16k–64k (perplejidad) | 10,08 |
| Recall | 40,8 |
| NIAH | 32,8 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 5,5 GB en precisión nativa (probablemente bf16/fp16, ~2,7 GB de parámetros); se requiere memoria adicional para el estado recurrente y el contexto de 64k.
- GPU recomendadas: el autor indica explícitamente que se requiere una H100 para ejecutar el modelo con el código oficial.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo; el código oficial y la indicación de H100 sugieren que no está optimizado para ellas.
- Opciones de despliegue: únicamente el código propio del repositorio TriadicLinearAttention (carga mediante safetensors y clase GPT/GPTConfig). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con modelos de la misma categoría en la información proporcionada. Como referencia cualitativa, se trata de un modelo base de 1,3B parámetros con atención lineal y contexto de 64k, una categoría en la que existen alternativas como Mamba o RWKV, pero no se han encontrado datos comparativos en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Triadic GDN E=2 1.3B 64k | 1,3B | 64k | MIT | Hugging Face (safetensors) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni RLHF: no sigue instrucciones de forma fiable y no debe usarse directamente en aplicaciones de usuario final.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación inherente a un modelo de lenguaje preentrenado sin alineación.
- Resultados modestos en tareas de recuperación (Recall 40,8; NIAH 32,8), lo que sugiere limitaciones en la recuperación de información a larga distancia pese al contexto de 64k.
- Requiere código propio y, según el autor, una GPU H100; no hay soporte para frameworks de inferencia estándar, lo que dificulta su despliegue en producción.
- No se documentan sesgos específicos, pero al entrenarse sobre FineWeb-Edu puede heredar sesgos de esa fuente.
- Licencia MIT: permite uso comercial, pero al ser un checkpoint de investigación sin garantías, su uso en producción no está recomendado ni validado.
- No se han publicado evaluaciones de seguridad, robustez ni sesgos.

## Enlaces

- Hugging Face: https://huggingface.co/OliverSieberling/triadic-gdn-e2-1.3b-64k
- Paper (arXiv): https://arxiv.org/abs/2609.36529
- Repositorio de código: https://github.com/OliverSieberling/TriadicLinearAttention
