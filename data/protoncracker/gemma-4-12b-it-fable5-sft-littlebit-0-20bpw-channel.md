# protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.20bpw-channel

## Resumen

`gemma-4-12b-it-fable5-sft-littlebit-0.20bpw-channel` es un artefacto de investigación publicado por el usuario protoncracker en Hugging Face. Se trata de un fine-tuning del modelo base `google/gemma-4-12B-it` sobre tres conjuntos de datos de trazas de código (PawanKrd/claude-fable-5-code, victor/fable-5-boeing-747-trace y armand0e/claude-fable-5-claude-code), al que posteriormente se le aplicó una compresión extrema mediante el método LittleBit-2 con cuantización binaria por bloques a 0,20 bits por peso.

El propio autor lo declara explícitamente como un experimento fallido: la model card indica que "este modelo comprimido no produce texto utilizable" y que se publica para que el resultado pueda inspeccionarse, no para ser usado. La perplejidad en held-out es de 6.835,6 frente a 86,5 del original (ratio 79,0), lo que según el criterio del propio autor lo sitúa muy por encima del umbral de "no utilizable" (ratio superior a 5).

Su relevancia es, por tanto, metodológica: documenta los límites de la compresión binaria en modelos de 12B parámetros y sirve como referencia negativa para quienes investigan cuantización extrema. No es un modelo apto para producción, generación de texto ni ninguna tarea práctica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-12B-it), con pesos factorizados en binario por bloques (LittleBit-2) |
| Parámetros totales | 12B (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | LittleBit-2 binario a 0,20 bits por peso, por bloques; artefactos publicados en q4_0 y q6_k (tabla de embeddings) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-q4_0.safetensors`, `model-q6_k.safetensors`); conversión a GGUF denso mediante `code/lb_dense.py` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `google/gemma-4-12B-it`, un transformer de 12.000 millones de parámetros. Sobre esa base, el autor aplicó un fine-tuning con LoRA (posteriormente fusionado) usando tres datasets de trazas de código asociadas a "fable-5" y a Claude Code. Los detalles sobre número de tokens de entrenamiento, composición exacta del dataset o uso de RLHF/DPO no están disponibles en la información proporcionada.

La innovación técnica del artefacto es la compresión LittleBit-2: una factorización binaria por bloques que reduce los pesos a 0,20 bits por peso. El proceso se aplicó después del fine-tuning. El autor reporta que el error relativo del estado oculto en held-out es de 0,443 tras el bloque 0 y 0,447 tras el bloque 47, con un mínimo de 0,271 tras el bloque 2 y un máximo de 0,598 tras el bloque 41. El archivo empaquetado ocupa 0,84 GB (q4_0) y 1,10 GB (q6_k), frente a los 23,83 GB del GGUF denso del original. No existe ningún motor que ejecute directamente el archivo empaquetado: para evaluarlo hay que convertirlo a un checkpoint denso, lo que anula la ventaja de tamaño.

## Capacidades

- Generación de texto: no funcional. El autor indica que el texto generado "no es utilizable".
- Razonamiento y código: no funcional a efectos prácticos; el fine-tuning se hizo sobre trazas de código, pero la compresión destruye la capacidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Benchmark HellaSwag y Winogrande: el modelo está "al nivel del azar" en ambas tareas según la model card.

## Casos de uso

- Investigación sobre límites de cuantización extrema: sirve como referencia negativa para medir hasta dónde puede comprimirse un modelo de 12B antes de colapsar. Se usaría comparando su perplejidad (6.835,6) y su KL (5,2018 nats/token) con la del original.
- Auditoría de metodologías LittleBit-2: el autor publica `blocks.jsonl` con el error relativo por bloque, lo que permite reproducir y verificar el análisis de propagación del error.
- Estudio de sensibilidad a la cuantización en Gemma 4 12B-it: la model card documenta que el original ya se degrada con Q4_K_M (perplejidad 81,22, KL 0,643, acuerdo top-1 0,687) y Q8_0 (perplejidad 84,80, KL 0,089, acuerdo 0,909), lo que es útil para calibrar expectativas en pipelines de cuantización estándar.
- Docencia sobre compresión de modelos: ejemplo concreto de por qué la perplejidad sola es una métrica engañosa (puede bajar bajo ruido de cuantización) y por qué hay que leerla junto con KL y acuerdo top-1.
- Validación de infraestructura de conversión: el script `code/lb_dense.py` permite probar el flujo empaquetado → denso → GGUF → llama.cpp en un caso real.
- Referencia en publicaciones: citable como evidencia de que a 0,20 bpw el modelo no es recuperable, complementando al modelo de la misma serie a 0,55 bpw (perplejidad 1.911,4), que tampoco es utilizable.

## Benchmarks y rendimiento

| Medida en held-out (32 filas × 1024 tokens) | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 8,8299 | 4,4607 |
| Perplejidad | 6.835,6 | 86,5 |
| Acuerdo top-1 con el token top del original | 0,2181 | 1 |
| KL (original → comprimido), nats por token | 5,2018 | 0 |

Resultados en motor (llama.cpp f4f6f2e 2026-11-23, A100 80 GB, GGUF denso):

| Archivo | Perplejidad (original) | Acuerdo top-1 | KL (nats/token) | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|---|---|
| q4_0 | 6.905,2 (86,27) | 0,2139 | 5,2296 | 5.302,56 | 55,75 |
| q6_k | 6.867,0 (86,27) | 0,2151 | 5,2117 | 6.209,22 | 55,75 |

Cuantización del original para contexto (llama.cpp, mismo build):

| Cuantización | Perplejidad | KL (nats/token) | Acuerdo top-1 |
|---|---|---|---|
| Q8_0 | 84,80 | 0,089 | 0,909 |
| Q4_K_M | 81,22 | 0,643 | 0,687 |

Benchmarks de tarea: HellaSwag (400 tareas) y Winogrande (500 tareas) con los scorers integrados de llama.cpp sobre el GGUF denso. El modelo está al nivel del azar en ambas; la tabla de resultados aparece truncada en la información proporcionada, por lo que no se reproducen las cifras completas.

## Requisitos de hardware

- VRAM para inferencia: el archivo empaquetado ocupa 0,84 GB (q4_0) y 1,10 GB (q6_k), pero no existe motor que lo ejecute directamente.
- Para evaluarlo hay que convertirlo a GGUF denso: 23,83 GB, idéntico al original.
- GPU recomendadas: A100 80 GB es la plataforma usada en las mediciones publicadas. Cualquier GPU con al menos 24 GB podría alojar el GGUF denso en bf16 con offloading parcial; no hay mediciones publicadas en consumer.
- Consumer GPU: no hay datos publicados. El GGUF denso de 23,83 GB no cabe completo en GPUs de 8-16 GB; requeriría offloading a CPU.
- Despliegue: llama.cpp (builds f4f6f2e 2026-11-23 y 44d5087 2026-11-22). No hay soporte para vLLM, TGI ni Ollama del archivo empaquetado.
- Throughput medido en A100 80 GB: prompt 5.302,56 tok/s (q4_0) y 6.209,22 tok/s (q6_k); generación 55,75 tok/s en ambos casos. Idéntico al original bf16 (6.015,25 pp, 55,75 tg), porque la ruta densa no está comprimida.
- CPU (44 núcleos, original bf16): 78,90 tok/s de prompt y 3,23 tok/s de generación. No hay medición del comprimido en CPU, pero se espera la misma velocidad por tener las mismas formas y tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad held-out | Licencia | Estado |
|---|---|---|---|---|---|
| Este modelo (0,20 bpw) | 12B | no disponible | 6.835,6 | apache-2.0 | No utilizable |
| `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` | 12B | no disponible | 1.911,4 | apache-2.0 (según serie) | No utilizable |
| `google/gemma-4-12B-it` (original) | 12B | no disponible | 86,5 | no disponible en la información | Funcional |
| Original + Q4_K_M (llama.cpp) | 12B | no disponible | 81,22 | no disponible en la información | Funcional con degradación |

## Limitaciones y advertencias

- El modelo no produce texto utilizable. El autor lo declara explícitamente: "This model does not work as a language model".
- Perplejidad 79 veces la del original en held-out (6.835,6 vs 86,5); en el motor, 80 veces (6.905,2 vs 86,27).
- Acuerdo top-1 con el original de solo el 21,39 % en el motor, muy por debajo de lo que se considera recuperable.
- KL de 5,2 nats por token respecto al original, lo que indica una distribución de salida completamente distinta.
- Nivel de azar en HellaSwag y Winogrande.
- El archivo empaquetado no se ejecuta en ningún motor: la conversión a denso anula el ahorro de tamaño y velocidad.
- La perplejidad es una señal engañosa en este modelo base: el original cuantizado a Q4_K_M baja a 81,22, por debajo de la perplejidad del original sin cuantizar (86,27). Hay que leer KL y acuerdo top-1 junto a la perplejidad.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinación: irrelevante en la práctica porque la salida no es coherente.
- Restricciones de licencia: apache-2.0 según la model card; verificar la licencia del modelo base `google/gemma-4-12B-it` antes de cualquier uso derivado.
- No apto para producción, demos, evaluación de capacidades ni fine-tuning posterior.
- El fine-tuning previo sobre trazas de código no confiere capacidades de código utilizables tras la compresión.

## Enlaces

- Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.20bpw-channel
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset de fine-tuning: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset de fine-tuning: https://huggingface.co/datasets/victor/fable-5-boeing-747-trace
- Dataset de fine-tuning: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Modelo de la misma serie a 0,55 bpw: `protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` (referenciado en la model card)
- llama.cpp (motor de evaluación): https://github.com/ggml-org/llama.cpp
- Paper de LittleBit: no disponible en la información proporcionada
- Repositorio con `code/lb_dense.py` y `blocks.jsonl`: incluidos en el repositorio de Hugging Face del modelo
