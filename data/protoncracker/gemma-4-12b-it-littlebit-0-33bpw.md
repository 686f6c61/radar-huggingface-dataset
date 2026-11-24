# protoncracker/gemma-4-12b-it-littlebit-0.33bpw

## Resumen

`protoncracker/gemma-4-12b-it-littlebit-0.33bpw` es un artefacto de investigación publicado en Hugging Face por el usuario protoncracker, consistente en una compresión extrema del modelo `google/gemma-4-12B-it` mediante el método LittleBit-2 (factorización binaria por bloques) a 0,33 bits por peso. El autor lo etiqueta explícitamente como experimental y advierte que **el modelo no produce texto utilizable**: se publica para que el resultado pueda inspeccionarse, no para usarse.

El interés técnico reside en la medición del daño provocado por la cuantización binaria sobre un transformer denso de 12B parámetros. Frente a una perplejidad de 283,4 del modelo original en el conjunto de retención, la versión comprimida alcanza 187.549,5 (ratio 661,7), con una concordancia top-1 del 12,49% y una divergencia KL de 7,92 nats por token. El autor establece como criterio que un ratio de perplejidad superior a 5 implica un modelo no utilizable.

El repositorio ocupa 2,3 GB y contiene pesos empaquetados (`model-q4_0.safetensors`, `model-q6_k.safetensors`) que ningún motor de inferencia ejecuta directamente. Para evaluarlo hubo que expandirlos a un checkpoint denso (`code/lb_dense.py`) y convertirlos a GGUF, lo que elimina cualquier ventaja de tamaño o velocidad: el modelo denso resultante pesa 23,83 GB y corre a la misma velocidad que el original en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de google/gemma-4-12B-it), con pesos factorizados en binario por bloques (LittleBit-2) |
| Parametros totales | 12B (modelo base); pesos empaquetados a 0,33 bits por peso |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LittleBit-2 a 0,33 bpw; artefactos empaquetados en q4_0 (1,02 GB) y q6_k (1,28 GB) para la tabla de embeddings; ruta densa en bf16 (23,83 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado propietario del método LittleBit); convertible a GGUF mediante `code/lb_dense.py` |

## Arquitectura y entrenamiento

El modelo no se entrena: es una compresión post-hoc del checkpoint `google/gemma-4-12B-it` sin fine-tuning adicional. La técnica LittleBit-2 factoriza cada matriz de pesos en una combinación de factores binarios organizados por bloques, alcanzando 0,33 bits por peso efectivos. El resultado se serializa en safetensors con dos variantes de tabla de embeddings cuantizada (q4_0 y q6_k).

La arquitectura subyacente es la del Gemma 4 12B-it original (transformer denso con atención estándar), pero el autor documenta que el modelo base es especialmente sensible al ruido de cuantización: incluso Q8_0 eleva la perplejidad de 281,28 a 292,66 con una KL de 0,188 nats/token, y Q4_K_M la lleva a 305,94 con KL de 1,092. La factorización binaria a 0,33 bpw amplifica ese efecto hasta hacer colapsar la distribución de salida. No se documentan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- El autor declara explícitamente que el modelo **no produce texto utilizable**; cualquier capacidad funcional del Gemma 4 12B-it original queda destruida por la compresión.
- Generación de texto: no funcional (perplejidad 192.000,5 en la ruta densa Q4_0 frente a 281,28 del original).
- Razonamiento y sentido común: a nivel de azar. HellaSwag 27,8% (azar 25%) y Winogrande 50,8% (azar 50%).
- Concordancia top-1 con el modelo original: 11,65% (Q4_0) y 12,33% (Q6_K).
- Tool calling, function calling y uso como agente: no disponibles y no funcionales en este artefacto.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre límites de la cuantización binaria: sirve como punto de referencia empírico del punto en que la factorización por debajo de 1 bit por peso destruye un transformer de 12B, con métricas de perplejidad, KL y concordancia top-1 publicadas.
- Reproducción de metodología LittleBit-2: el código `code/lb_dense.py` permite expandir pesos empaquetados a checkpoint denso y validar el pipeline de conversión a GGUF, útil para quien quiera replicar el experimento con otros modelos base.
- Estudio de sensibilidad a cuantización por capa: el fichero `blocks.jsonl` documenta el error relativo del estado oculto bloque a bloque (0,072 tras el bloque 16, 0,577 tras el bloque 46), material para analizar qué capas toleran mejor la compresión.
- Auditoría de métricas de calidad: el modelo demuestra que la perplejidad aislada es una señal pobre bajo ruido de cuantización y que debe leerse junto a KL y concordancia top-1; caso de estudio para diseñar evaluaciones de modelos cuantizados.
- Docencia y divulgación: ejemplo concreto y medido de por qué una compresión agresiva no equivale a un modelo pequeño funcional, con cifras verificables frente al original y frente a Q8_0/Q4_K_M.
- Comparación de rutas de despliegue: permite medir el coste real de ejecutar pesos empaquetados (no existe motor que los consuma directamente) frente a expandirlos a denso, con datos de throughput en A100 80 GB.

## Benchmarks y rendimiento

Calidad en texto de retención (32 filas × 1024 tokens):

| Medida | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 12,1418 | 5,6469 |
| Perplejidad | 187.549,5 | 283,4 |
| Concordancia top-1 | 0,1249 | 1 |
| KL (original → comprimido), nats/token | 7,9213 | 0 |

Ruta densa en llama.cpp (build 44d5087, 2026-11-22):

| Fichero | Dispositivo | GGUF denso | Fichero empaquetado | Perplejidad (original) | Top-1 | KL (nats/token) | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|---|---|---|---|---|
| q4_0 | A100 80 GB | 23,83 GB | 1,02 GB | 192.000,5 (281,28) | 0,1165 | 7,9788 | 5.962,44 | 55,76 |
| q6_k | A100 80 GB | 23,83 GB | 1,28 GB | 186.219,0 (281,28) | 0,1233 | 7,9372 | 6.349,33 | 55,77 |

Tareas (scorers de llama.cpp, 400 tareas HellaSwag / 500 Winogrande):

| Modelo | HellaSwag acc_norm | Winogrande |
|---|---|---|
| Este modelo, Q6_K (GGUF denso) | 27,8% (IC95% 23,6–32,3) | 50,8% (±2,2) |
| Original bf16 | 51,2% (IC95% 46,4–56,1) | 57,0% (±2,2) |
| Original Q8_0 | 53,2% (IC95% 48,4–58,1) | 54,6% (±2,2) |
| Original Q4_K_M | 50,0% (IC95% 45,1–54,9) | 56,6% (±2,2) |
| Azar | 25% | 50% |

## Requisitos de hardware

- VRAM para el fichero empaquetado: 1,02 GB (q4_0) y 1,28 GB (q6_k), pero **ningún motor lo ejecuta directamente**; el tamaño no es aprovechable en inferencia.
- VRAM para la ruta densa: 23,83 GB en bf16, equivalente al modelo original.
- GPU validadas: A100 80 GB (mediciones publicadas). No se documentan pruebas en H100, RTX 4090 ni otras GPU.
- GPU de consumo: la ruta densa de 23,83 GB no cabe en tarjetas de 24 GB con margen para contexto; no se aportan mediciones en consumer.
- Despliegue: llama.cpp (build 44d5087) sobre GGUF denso generado con `code/lb_dense.py`. No hay soporte en vLLM, TGI, Ollama ni motores que lean el formato empaquetado.
- Rendimiento en A100 80 GB: prompt processing 5.962,44 tok/s (q4_0) y 6.349,33 tok/s (q6_k); generación 55,76 y 55,77 tok/s respectivamente. El original bf16 rinde 5.868,30 tok/s de prompt y 55,72 tok/s de generación: diferencias dentro del margen de medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (retención) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (0,33 bpw) | 12B | no disponible | 187.549,5 | apache-2.0 | Hugging Face, experimental |
| gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel | 12B | no disponible | 1.911,4 (original 86,5) | no disponible | Hugging Face, experimental |
| google/gemma-4-12B-it (Q8_0) | 12B | no disponible | 292,66 | apache-2.0 | Hugging Face |
| google/gemma-4-12B-it (Q4_K_M) | 12B | no disponible | 305,94 | apache-2.0 | Hugging Face |

El autor señala que el modelo de la serie con menor perplejidad (0,55 bpw) tampoco es utilizable como modelo de lenguaje. La comparación relevante no es de capacidad, sino de grado de degradación.

## Limitaciones y advertencias

- **No es un modelo funcional**: el autor lo declara explícitamente como artefacto de investigación que no produce texto utilizable.
- Alucinación total: la distribución de salida diverge del original con KL de ~7,9 nats/token y concordancia top-1 del ~12%; la generación es esencialmente ruido.
- Rendimiento a nivel de azar en HellaSwag (27,8% frente a 25% de azar) y Winogrande (50,8% frente a 50%).
- Sin ventaja práctica de tamaño en inferencia: no existe motor que ejecute los pesos empaquetados; la ruta densa ocupa 23,83 GB, igual que el original.
- Sin ventaja de velocidad: el throughput denso es estadísticamente idéntico al del original bf16.
- Idiomas soportados y longitud de contexto no documentados para este artefacto.
- Sesgos: no evaluados en la información disponible; heredaría los del modelo base si funcionase, lo que no ocurre.
- Licencia apache-2.0 declarada, pero el uso comercial carece de sentido al no ser funcional; verificar además las condiciones del modelo base de Google.
- La perplejidad aislada es una métrica engañosa en este régimen; el propio autor recomienda leerla junto a KL y concordancia top-1.

## Enlaces

- Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-littlebit-0.33bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Serie LittleBit en Hugging Face: https://huggingface.co/protoncracker (referencia al modelo `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` citado en la model card)
- llama.cpp (build 44d5087, 2026-11-22): https://github.com/ggml-org/llama.cpp
