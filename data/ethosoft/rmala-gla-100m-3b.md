# Ethosoft/rmala-gla-100m-3b

## Resumen

rmala-gla-100m-3b es un checkpoint de investigación de modelo de lenguaje base en turco, desarrollado por Ethosoft (con un espejo en la organización MercanAI). Se trata de un modelo causal entrenado desde cero sobre exactamente 3.000 millones de tokens objetivo, con 100.465.280 parámetros reales almacenados en safetensors y un peso de repositorio de 0,4 GB. No es un modelo instruido ni de chat: es un modelo base pensado para experimentación arquitectónica.

Su interés radica en que forma parte de la familia RMALA (research), que compara varias arquitecturas alternativas sobre el mismo tokenizador, los mismos tokens y los mismos conjuntos de validación/test. La variante publicada aquí es "gla", basada en atención lineal, y convive con variantes como full (atención causal completa con RoPE), hola (con caché beta oficial de GatedDeltaNet) y dos adaptaciones V14. El contexto está limitado a 2048 tokens.

La relevancia actual es metodológica más que de producto: el autor publica métricas comparativas de perplejidad (PPL) y bits por byte (BPB) entre variantes, junto con estimaciones de FLOP algorítmico, y advierte explícitamente de que no reclama superioridad robusta de ninguna variante ni preparación para producción. Es, por tanto, un artefacto para estudiar atención lineal y mecanismos de memoria en modelos pequeños de turco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención lineal (variante GLA/V14); 16 capas, anchura 640, RMSNorm y SwiGLU |
| Parametros totales | 100.465.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (no se distribuyen GGUF ni cuantizaciones; el checkpoint se preserva en FP32) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (el autor indica que esta subida no asigna una licencia nueva; ver THIRD_PARTY_NOTICES.md) |
| Formato de pesos | safetensors (FP32); requiere cargador propio, no registrado en Transformers AutoModel |
| Cabezas de atencion | GLA/V14: 10 cabezas de tamaño 64. Full: SDPA causal + RoPE. HoLA: 5 cabezas de tamaño 128 |
| Embeddings | 32K entrada/salida atados (tied) |
| Tamano del repositorio | 0,4 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 16 capas y anchura 640, con normalización RMSNorm y MLP SwiGLU. La variante publicada (gla) usa atención lineal con 10 cabezas de dimensión 64. Dentro de la familia RMALA, la variante full emplea SDPA causal con RoPE, y la variante hola usa 5 cabezas de 128 con caché beta oficial, ventana de 64 y tamaño de chunk de 256. Los embeddings de entrada y salida (32K) están atados y se almacenan una sola vez, restaurándose mediante inference.py.

El entrenamiento se hizo desde cero sobre un subconjunto fijo de 3.000 millones de tokens de la colección pre-tokenizada MercanSet V11 / MercanPretraining, con particiones de validación y test disjuntas por shard. Se usó una única semilla de entrenamiento (41001). El autor advierte de que no se realizó deduplicación de texto entre colecciones y que no reclama ausencia absoluta de contaminación. La adaptación V14-LM introduce claves contextuales, valores int8, presupuesto de banco por cabeza de 2048 bytes y límites de admisión de lectura/escritura del 5%, con una puerta straight-through aprendida y umbral forward duro de 0,99. El autor subraya que esto no implica una reducción del 95% de FLOPs del modelo completo. No se distribuyen estados del optimizador, credenciales ni texto de entrenamiento.

## Capacidades

- Generación de texto en turco: es un modelo base, por lo que la generación es de continuación de secuencia, no de instrucciones.
- Modelado de lenguaje y cálculo de perplejidad sobre texto turco.
- Investigación arquitectónica: comparación de atención lineal (gla), atención completa con RoPE (full) y variantes con memoria (hola, V14) bajo condiciones controladas.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: únicamente turco según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en atención lineal: usar el checkpoint gla como referencia para medir PPL/BPB frente a las variantes full y hola sobre el mismo conjunto de test, reproduciendo el protocolo descrito.
- Estudios de eficiencia de memoria: analizar el comportamiento del mecanismo V14-LM (claves contextuales, valores int8, presupuesto de banco por cabeza) en un modelo pequeño y controlado.
- Evaluación de contaminación de datasets: el protocolo de particiones disjuntas por shard permite estudiar el efecto de la deduplicación (o su ausencia) en métricas de validación.
- Reproducibilidad y ablaciones: al usar una sola semilla y métricas documentadas, sirve para reproducir resultados y contrastar variantes del backbone.
- Docencia de arquitecturas transformer: por su tamaño (100M parámetros) y su cargador nativo, es adecuado para inspeccionar atención lineal y gating en PyTorch sobre CUDA.
- Análisis de tokenizador turco: al compartir tokenizador binario nativo entre variantes, permite estudiar el comportamiento del tokenizador sobre texto turco y el cálculo de BPB por bytes UTF-8.

## Benchmarks y rendimiento

El model-index oficial no incluye resultados (la lista de results está vacía). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas internas de perplejidad y BPB por variante sobre el conjunto de test (11.352.596 tokens / 39.843.759 bytes UTF-8 originales, evaluación por chunks de 2048 tokens):

| Variante | Test PPL | Test BPB | FLOP algorítmico estimado |
|---|---:|---:|---:|
| gla | 25,561380 | 1,321054 | 1,866978e+18 |
| v14_full | 25,591686 | 1,321246 | 1,886712e+18 |
| v14_half | 25,482146 | 1,319796 | 1,886712e+18 |
| full | 22,187501 | 1,262025 | 2,173686e+18 |
| hola | 20,419358 | 1,228817 | 1,963008e+18 |

Menor PPL/BPB es mejor. El autor indica que la mejora de V14-half sobre GLA es pequeña y no establece superioridad robusta, y que V14-full no mejoró la PPL de test. Las estimaciones de FLOP no son mediciones de hardware completas.

## Requisitos de hardware

- VRAM estimada para inferencia: al preservarse los pesos en FP32, el checkpoint ocupa aproximadamente 0,4 GB; en autocast BF16 la huella de pesos baja a unos 0,2 GB. El espacio de activaciones es reducido por el contexto de 2048 tokens.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente por memoria; el autor especifica Linux NVIDIA CUDA como entorno probado. Modelos como RTX 3060, RTX 4090, A100 o H100 sirven, aunque el modelo no los aprovecha por tamaño.
- Cabe en GPU de consumo: sí, prácticamente en cualquier GPU NVIDIA con al menos 2 GB de VRAM.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de fábrica, ya que la arquitectura no está registrada en Transformers AutoModel. Solo se ofrece un cargador nativo en PyTorch (inference.py) con tokenizador binario nativo para Linux x86_64 / CPython 3.11+.
- Latencia y throughput estimados: no disponible. El autor advierte de que el decodificador de referencia recalcula el prefijo completo (no es un decodificador con KV-cache optimizada) y que la primera ejecución compila kernels Triton, por lo que la velocidad no es representativa de un motor optimizado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks externos que permitan comparar esta variante con modelos de la misma categoría (otros modelos base turcos de ~100M parámetros). Comparativa disponible únicamente dentro de la propia familia RMALA, sobre el mismo conjunto de test:

| Variante | Backbone | Test PPL | Test BPB | Contexto |
|---|---|---:|---:|---:|
| gla (esta) | Atención lineal, 10 cabezas de 64 | 25,561380 | 1,321054 | 2048 |
| v14_half | V14-LM adaptada | 25,482146 | 1,319796 | 2048 |
| v14_full | V14-LM adaptada | 25,591686 | 1,321246 | 2048 |
| full | SDPA causal + RoPE | 22,187501 | 1,262025 | 2048 |
| hola | GatedDeltaNet/cache oficial | 20,419358 | 1,228817 | 2048 |

Comparación con modelos externos (parámetros, contexto, licencia y disponibilidad): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo base, no instruido ni de chat: no sigue instrucciones ni mantiene formato conversacional.
- Idioma limitado al turco; no se declara soporte multilingüe.
- Contexto reducido a 2048 tokens, lo que limita tareas de razonamiento o recuperación de largo alcance.
- El propio autor indica que no se incluyen diagnósticos completados de recuperación o razonamiento de largo alcance en esta publicación.
- Riesgo de alucinación propio de un modelo base pequeño; no hay evaluación de fidelidad factual.
- Sesgos conocidos: no documentados específicamente; el dataset (MercanSet V11) no se redistribuye y no se realizó deduplicación entre colecciones, lo que impide descartar contaminación.
- Licencia no disponible: el autor señala que esta subida no asigna una licencia nueva, por lo que el uso comercial queda en un estado legal indeterminado hasta consultar THIRD_PARTY_NOTICES.md.
- Restricciones de despliegue: requiere el cargador nativo y tokenizador binario Linux x86_64 / CPython 3.11+; no hay soporte en ecosistemas estándar (Transformers, vLLM, llama.cpp).
- El decodificador de referencia no usa KV-cache optimizada y recalcula el prefijo completo, lo que penaliza la velocidad en producción.
- Las estimaciones de FLOP son algorítmicas, no mediciones de hardware completas, según el propio autor.
- Atribución y procedencia: existen dos espejos (Ethosoft/rmala-gla-100m-3b y MercanAI/rmala-gla-100m-3b); conviene verificar cuál es el canónico.

## Enlaces

- HuggingFace (Ethosoft): https://huggingface.co/Ethosoft/rmala-gla-100m-3b
- Espejo en HuggingFace (MercanAI): https://huggingface.co/MercanAI/rmala-gla-100m-3b
