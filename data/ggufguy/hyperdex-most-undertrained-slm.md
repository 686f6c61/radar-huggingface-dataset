# GGUFGuy/hyperdex-most-undertrained-slm

## Resumen

hyperdex-most-undertrained-slm es un modelo de lenguaje decoder-only de 49.995.456 parámetros entrenado desde cero por el usuario GGUFGuy mediante el Space HyperDex Trainer. Se basa en la arquitectura `LlamaForCausalLM` (transformer decoder-only con MLP SiLU, RMSNorm, embeddings posicionales rotatorios, grouped-query attention y embeddings atados, sin sesgos), escalada a la baja en anchura y profundidad para ajustarse al presupuesto de parámetros.

El modelo se ha preentrenado sobre el dataset HuggingFaceFW/fineweb-edu, pero con un presupuesto de cómputo deliberadamente mínimo: 524.288 tokens vistos en un único paso de optimización, con una pérdida final de 8,0123 (perplejidad 3017,9) y un tiempo de pared de 0,2 minutos. El propio autor lo describe como el modelo "más subentrenado" y como un artefacto de investigación a pequeña escala, cuyo objetivo es hacer observable el proceso de preentrenar un transformer desde cero.

Por su tamaño (unos 50 millones de parámetros) y su ventana de contexto de 512 tokens, no compite con asistentes conversacionales ni con modelos pequeños ya alineados. Su relevancia es educativa y experimental: sirve como banco de pruebas reproducible para pipelines de tokenización, entrenamiento distribuido, cuantización y despliegue en hardware muy limitado, y como ejemplo extremo de lo que ocurre cuando el presupuesto de tokens es varios órdenes de magnitud inferior al óptimo de Chinchilla para ese número de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`): MLP SiLU, RMSNorm, RoPE, grouped-query attention, embeddings atados, sin sesgos |
| Parámetros totales | 49.995.456 |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | no disponible (no se publican pesos cuantizados; el modelo es compatible con cuantización estándar vía transformers/bitsandbytes o conversión a GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | ODC-BY (Open Data Commons Attribution License) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,2 GB |
| Dimensión oculta (hidden size) | 448 |
| Capas | 12 |
| Cabezas de atención | 8 (2 para clave/valor, GQA) |
| Tamaño de la FFN | 2669 |
| Vocabulario | 2048 (BPE propio entrenado sobre fineweb-edu) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar en la familia Llama, con atención de consultas agrupadas (8 cabezas de consulta y 2 de clave/valor), RMSNorm, activación SiLU en la MLP, embeddings posicionales rotatorios y embeddings de entrada/salida atados. La configuración concreta es de 12 capas, dimensión oculta 448 y FFN de 2669, con un vocabulario reducido de 2048 tokens BPE entrenado específicamente sobre fineweb-edu. No se menciona ningún mecanismo adicional como decodificación especulativa, atención lineal o mezcla de expertos.

El entrenamiento se realizó desde cero con el HyperDex Trainer sobre fineweb-edu, con AdamW (betas 0,9 y 0,95, weight decay 0,1, grad clipping 1,0) y un scheduler de learning rate con warmup del 2 % seguido de decaimiento coseno hasta el 10 % del valor pico (6e-04). El dato más relevante es el presupuesto: 524.288 tokens en un solo paso, es decir, el equivalente a una fracción minúscula de una única época sobre un corpus de decenas de miles de millones de tokens. La pérdida final registrada es 8,0123 (perplejidad 3017,9), lo que es coherente con un modelo que apenas ha empezado a ajustar las frecuencias del vocabulario. No se documenta ningún proceso de RLHF, DPO, SFT ni ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva básica a partir de un prompt, con muestreo configurable (temperatura, top-k).
- Reconocimiento de formas de palabras y colocaciones frecuentes del corpus fineweb-edu.
- Aprendizaje incipiente de sintaxis inglesa, según indica el propio autor.
- Capacidad multilingüe: nula más allá del inglés; el vocabulario BPE y los datos son exclusivamente en inglés.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Modo "thinking", visión, audio o cualquier modalidad adicional: no soportado.
- Razonamiento matemático, generación de código fiable o recuperación factual: no disponibles; el autor indica explícitamente que la salida no es factual.

## Casos de uso

- Docencia y divulgación sobre preentrenamiento: el modelo permite mostrar en el aula, en cuestión de minutos, el ciclo completo de tokenización, entrenamiento y generación, con un coste de cómputo despreciable.
- Prueba de pipelines de entrenamiento: sirve como caso de test mínimo para validar un trainer propio (checkpoints, reanudación, logging de pérdida) antes de escalar a modelos mayores.
- Validación de infraestructura de despliegue: al ocupar menos de 100 MB en bf16, se puede usar para verificar de extremo a extremo un servicio de inferencia (carga de safetensors, servidor HTTP, batching) sin consumir GPU.
- Pruebas de tokenizadores BPE pequeños: su vocabulario de 2048 tokens permite estudiar el efecto de vocabularios reducidos sobre la fragmentación del texto y la longitud efectiva de secuencia.
- Investigación sobre subentrenamiento: con 524.288 tokens vistos para 50 M de parámetros, es un punto de datos extremo para estudiar curvas de escalado y el mínimo de tokens necesario para que emerja gramática básica.
- Experimentos de cuantización extrema: es un sujeto adecuado para medir el impacto de cuantizaciones de 8, 4 y menos bits en un modelo cuyo peso total es de decenas de megabytes, incluyendo despliegue en microcontroladores o Raspberry Pi.
- Generación de datos sintéticos para pruebas de software: puede producir cadenas de texto con estructura superficial de inglés para rellenar fixtures y tests que no requieren contenido real.
- Comparación de esquemas de decodificación: útil para medir diferencias entre greedy, top-k y nucleus en un modelo con distribución de probabilidad muy plana (perplejidad ~3018).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento: pérdida final 8,0123 y perplejidad 3017,9 sobre el propio presupuesto de entrenamiento (524.288 tokens), además de un tiempo de pared de 0,2 minutos para un único paso. No hay resultados de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluación estándar, y la perplejidad reportada no procede de un conjunto de validación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 unos 200 MB de pesos; en bf16/fp16 unos 100 MB; en int8 unos 50 MB; en int4 unos 25 MB. A esto hay que sumar el coste de activaciones y caché KV, mínimo por el contexto de 512 tokens y solo 2 cabezas KV.
- GPU recomendadas: cualquiera con al menos 1 GB de memoria; cabe holgadamente en GTX 1050, RTX 3060, RTX 4090, A100 o H100. No requiere GPU de centro de datos.
- Compatibilidad con GPU de consumo: sí, en todas las gamas actuales, e incluso en GPU integradas. También es viable la inferencia en CPU.
- Opciones de despliegue: transformers (ruta documentada por el autor), text-generation-inference (el repo incluye la etiqueta `text-generation-inference`), vLLM, y llama.cpp/Ollama tras convertir manualmente los pesos a GGUF, ya que no se publican ficheros GGUF en el repositorio.
- Latencia y throughput: no disponible; no se han publicado mediciones. Cualquier cifra sería una estimación, dado que el modelo no está optimizado ni empaquetado para producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| hyperdex-most-undertrained-slm (GGUFGuy) | 49.995.456 | 512 | Inglés | ODC-BY | No |
| SmolLM-135M (HuggingFaceTB) | ~135 M | 2048 | Inglés (principalmente) | Apache-2.0 | Sí, en su model card |
| Qwen2.5-0.5B (Alibaba) | ~0,5 B | 32.768 | Multilingüe | Apache-2.0 | Sí, en su model card |
| TinyStories-33M (Eldan et al.) | ~33 M | 512 | Inglés | no disponible | No comparable |

La diferencia fundamental no es de tamaño, sino de presupuesto de entrenamiento y de objetivo: los modelos de la comparativa están entrenados con decenas o cientos de miles de millones de tokens y, en el caso de SmolLM-135M y Qwen2.5-0.5B, pasan por fases de ajuste por instrucciones, mientras que hyperdex-most-undertrained-slm ha visto 524.288 tokens en un solo paso y no tiene alineación alguna. Los datos de contexto y licencia de los modelos comparados se toman de sus fichas públicas; los detalles de rendimiento de este modelo no están disponibles.

## Limitaciones y advertencias

- Subentrenamiento extremo: 524.288 tokens para 49.995.456 parámetros, cuando las estimaciones de escalado óptimas para ese tamaño estarían en el orden de miles de millones de tokens. La perplejidad de 3017,9 refleja un modelo que apenas ha aprendido el vocabulario.
- No es un asistente útil: el autor lo declara explícitamente. No sigue instrucciones, no mantiene coherencia multi-turno y no debe usarse para atención al cliente, resúmenes ni generación de código en producción.
- Salida no factual: no hay garantía de veracidad ni de coherencia semántica; el riesgo de alucinación es total, ya que el modelo no ha aprendido hechos.
- Sesgos: no se documenta ningún análisis de sesgo. Al entrenarse sobre fineweb-edu (corpus filtrado de web en inglés), hereda los sesgos y la distribución de ese material, agravados por el escaso volumen efectivamente visto.
- Limitaciones de idioma: solo inglés, con un vocabulario de 2048 tokens que fragmenta agresivamente cualquier texto y penaliza especialmente a los idiomas distintos del inglés.
- Limitación de contexto: 512 tokens, sin extensiones documentadas.
- Licencia: ODC-BY permite uso comercial con atribución, pero al ser una licencia pensada para datos y no para software, conviene revisar los términos aplicables antes de redistribuir el modelo en un producto.
- Advertencia operativa: sin pesos GGUF publicados, cualquier despliegue en llama.cpp u Ollama exige una conversión propia; además, el repositorio no tiene descargas ni validación por parte de la comunidad, por lo que debe tratarse como material sin revisar.
- Fecha de referencia: el repositorio figura creado y actualizado el 12 de septiembre de 2026, por lo que su estado puede cambiar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GGUFGuy/hyperdex-most-undertrained-slm
- Perfil del autor: https://huggingface.co/GGUFGuy
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Space del entrenador HyperDex Trainer: https://hugging-science-hyperdex-trainer.hf.space/
- Paper de referencia del dataset FineWeb-Edu: https://arxiv.org/abs/2406.17557
- Nota: las búsquedas web realizadas no devolvieron ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
