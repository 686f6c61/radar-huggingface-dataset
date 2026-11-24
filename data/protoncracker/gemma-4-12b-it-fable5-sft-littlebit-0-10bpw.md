# protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.10bpw

## Resumen

`protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.10bpw` es un artefacto de investigación publicado en Hugging Face que aplica la técnica de cuantización binaria experimental LittleBit-2 (block-wise) a un fine-tune de `google/gemma-4-12B-it`. El autor, `protoncracker`, parte de un ajuste LoRA (fusionado) entrenado sobre tres datasets derivados de trazas de "Fable-5" (PawanKrd/claude-fable-5-code, victor/fable-5-boeing-747-trace y armand0e/claude-fable-5-claude-code) y posteriormente comprime los pesos a 0,10 bits por peso.

El modelo no es utilizable como modelo de lenguaje. El propio autor lo declara explícitamente: "This compressed model does not produce usable text" y "0.10 bits per weight is a demonstration for shock value only". La perplejidad en held-out es de 57.433,8 frente a 86,4 del original (ratio 664,5), y en llama.cpp la perplejidad medida es de 65.010,8 frente a 86,27 (754 veces la original), con una concordancia top-1 del 15 %. Está al nivel del azar en HellaSwag y Winogrande.

Su relevancia es, por tanto, metodológica: documenta con rigor qué ocurre cuando se lleva la compresión extrema a un modelo sensible al ruido de cuantización como Gemma 4 12B-it, y sirve de referencia negativa para quienes investigan cuantización binaria o factorizaciones de bajo rango. No debe desplegarse en producción bajo ninguna circunstancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: google/gemma-4-12B-it), pesos comprimidos con LittleBit-2 block-wise |
| Parametros totales | 12B (heredados del modelo base; no se especifica recuento exacto en la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card |
| Tipos de cuantizacion | 0,10 bits por peso (LittleBit-2, block-wise); se publican variantes `q4_0` y `q6_k` de la tabla de embeddings |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (archivos `model-q4_0.safetensors` y `model-q6_k.safetensors`); conversión a GGUF vía `code/lb_dense.py` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 12B parámetros (Gemma 4 12B-it). Sobre él se aplicó primero un fine-tune con LoRA que posteriormente se fusionó, usando tres datasets de trazas de código y trazas de "Fable-5". Después se aplicó la compresión LittleBit-2 en modalidad block-wise, que factoriza cada matriz de pesos en componentes binarios con un factor de escala por bloque, alcanzando una tasa efectiva de 0,10 bits por peso.

La model card no detalla el número de tokens de entrenamiento, la composición exacta de los datasets ni si hubo RLHF o DPO en el fine-tune. Sí documenta el proceso de evaluación: conversión del checkpoint comprimido a un checkpoint denso mediante `code/lb_dense.py`, conversión a GGUF y evaluación con llama.cpp sobre los mismos token ids held-out. Se reporta el error relativo del estado oculto por bloque: 0,422 tras el bloque 0, 0,471 tras el bloque 47, mínimo de 0,089 tras el bloque 16 y máximo de 0,607 tras el bloque 41 (detalle completo en `blocks.jsonl`).

## Capacidades

- Generación de texto: nominalmente heredada del modelo base, pero en la práctica no produce texto utilizable (el autor lo declara explícitamente).
- Razonamiento, código y matemáticas: no funcional a 0,10 bpw; el modelo está al nivel del azar en las tareas evaluadas.
- Tool calling / function calling: no disponible (no evaluado y no funcional en la práctica).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en cuantización binaria extrema: sirve como referencia negativa reproducible para medir el límite práctico de LittleBit-2 a 0,10 bpw sobre un modelo sensible al ruido de cuantización. Se usaría cargando el checkpoint denso convertido y midiendo perplejidad, KL y concordancia top-1 frente al original.
- Estudio del error por bloque: el archivo `blocks.jsonl` permite analizar cómo se degrada el estado oculto capa a capa y qué bloques concentran el error (máximo 0,607 tras el bloque 41), útil para diseñar esquemas de compresión híbridos.
- Validación de pipelines de conversión: el script `code/lb_dense.py` y el flujo a GGUF sirven para probar herramientas de conversión de pesos comprimidos a formatos estándar antes de aplicarlas a modelos funcionales.
- Benchmarking de motores de inferencia: los datos de llama.cpp (prompt tok/s, generación tok/s en A100 40 GB y 80 GB) permiten comparar el rendimiento de builds concretos sobre un modelo denso equivalente.
- Docencia y divulgación: ejemplo documentado de por qué la perplejidad sola es una mala señal de calidad en modelos sensibles al ruido (la perplejidad puede bajar bajo ruido de cuantización; hay que leer KL y concordancia).
- Auditoría de artefactos publicados: caso de estudio sobre model cards que declaran explícitamente la no utilizabilidad del modelo, útil para políticas de curación de repositorios.

## Benchmarks y rendimiento

| Medida held-out (32 filas × 1024 tokens) | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 10,9584 | 4,4594 |
| Perplejidad | 57.433,8 | 86,4 |
| Concordancia top-1 con el token top del original | 0,1550 | 1 |
| KL(original → comprimido), nats por token | 7,0694 | 0 |

Resultados en motor (llama.cpp, checkpoint denso convertido):

| Archivo | Dispositivo | GGUF denso | Archivo empaquetado | Perplejidad (original) | Concordancia top-1 | KL (nats/token) | Build llama.cpp | Prompt tok/s (pp512) | Generación tok/s (tg128) |
|---|---|---|---|---|---|---|---|---|---|
| q4_0 | A100 40 GB | 23,83 GB | 0,70 GB | 65.010,8 (86,27) | 0,1532 | 7,1955 | c212d25 (2026-11-23) | 4.874,89 | 48,02 |
| q6_k | A100 80 GB | 23,83 GB | 0,96 GB | 58.476,8 (86,27) | 0,1539 | 7,0838 | f4f6f2e (2026-11-23) | 6.321,92 | 55,75 |

Cuantización del original para contexto (misma evaluación held-out):

| Cuantización del original | Perplejidad | KL al original sin cuantizar (nats/token) | Concordancia top-1 |
|---|---|---|---|
| Q8_0 | 84,80 | 0,089 | 0,909 |
| Q4_K_M | 81,22 | 0,643 | 0,687 |

Tareas: el modelo está al nivel del azar en HellaSwag y Winogrande (la model card remite a la sección "Task benchmarks", no incluida en el extracto). Comparativa de rendimiento frente al original bf16 en el mismo motor: procesamiento de prompt 0,81× y generación 1,00× en A100 40 GB; en A100 80 GB, prácticamente idéntico. En CPU (44 núcleos), el original bf16 GGUF (23,83 GB) procesa prompt a 78,90 tok/s y genera a 3,23 tok/s.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo empaquetado ocupa 0,70 GB (q4_0) y 0,96 GB (q6_k), pero no existe motor que ejecute el archivo empaquetado directamente. La ruta viable es convertir a checkpoint denso, cuyo GGUF pesa 23,83 GB (equivalente al original bf16).
- GPU recomendadas: A100 40 GB (para la variante q4_0 densa) y A100 80 GB (para q6_k densa). Se han reportado medidas en estas dos configuraciones.
- GPU de consumo: no se han publicado medidas en GPU de consumo; dado que el checkpoint denso requiere ~24 GB en bf16, no cabe en GPUs de consumo de 8-16 GB sin cuantización adicional, y la cuantización adicional agravaría aún más la degradación.
- Opciones de despliegue: llama.cpp (builds c212d25, f4f6f2e y 44d5087 documentados); conversión previa obligatoria con `code/lb_dense.py`. No se documenta soporte en vLLM, TGI, Ollama ni otros motores para el archivo empaquetado.
- Latencia y throughput: A100 40 GB, 4.874,89 tok/s de prompt y 48,02 tok/s de generación (q4_0 denso); A100 80 GB, 6.321,92 tok/s de prompt y 55,75 tok/s de generación (q6_k denso). No hay aceleración respecto al original porque la ruta densa no está comprimida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (0,10 bpw) | 12B | no disponible | 57.433,8 (denso: 65.010,8) | apache-2.0 | Hugging Face, 0 descargas |
| `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` | 12B | no disponible | 1.911,4 | no disponible en el extracto | Hugging Face (mismo autor) |
| `google/gemma-4-12B-it` (original) | 12B | no disponible | 86,4 | no disponible en el extracto | Hugging Face (modelo base) |
| Original cuantizado Q4_K_M | 12B | no disponible | 81,22 | — | Vía llama.cpp |

La comparativa con otras familias de modelos del mismo tamaño (p. ej. Llama, Qwen, Mistral de ~12B) no está disponible en la información proporcionada. La referencia interna más útil es la variante a 0,55 bpw del mismo autor, que también se declara no utilizable como modelo de lenguaje.

## Limitaciones y advertencias

- El modelo no funciona como modelo de lenguaje: el autor lo declara explícitamente y los datos lo confirman (perplejidad 754× la original en llama.cpp, concordancia top-1 del 15 %).
- Está al nivel del azar en HellaSwag y Winogrande.
- No existe motor que ejecute el archivo empaquetado directamente; la única ruta documentada es la conversión a checkpoint denso, que elimina la ventaja de tamaño (23,83 GB).
- La perplejidad es una señal de calidad poco fiable en este modelo: puede bajar bajo ruido de cuantización; hay que leer KL y concordancia top-1 junto a ella.
- Gemma 4 12B-it es sensible al ruido de cuantización: incluso Q4_K_M ya altera la distribución de salida (KL 0,643, concordancia 0,687).
- Riesgo de alucinación: irrelevante en la práctica porque la salida no es texto utilizable, pero cualquier uso produciría texto incoherente.
- Sesgos conocidos: no documentados en la información proporcionada.
- Restricciones de licencia: apache-2.0 según la model card, pero conviene verificar la licencia del modelo base (google/gemma-4-12B-it) antes de cualquier uso derivado.
- No apto para producción, demos, evaluación de calidad lingüística ni fine-tune adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin mantenimiento comunitario documentado.

## Enlaces

- Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.10bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset: https://huggingface.co/datasets/victor/fable-5-boeing-747-trace
- Dataset: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Variante relacionada: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
- llama.cpp: https://github.com/ggml-org/llama.cpp
