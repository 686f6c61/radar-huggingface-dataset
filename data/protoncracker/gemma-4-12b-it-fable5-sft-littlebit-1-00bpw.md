# protoncracker/gemma-4-12b-it-fable5-sft-littlebit-1.00bpw

## Resumen

Este repositorio contiene un artefacto de investigación experimental: una compresión extrema del modelo `google/gemma-4-12B-it` a 1,00 bits por peso mediante el método LittleBit-2 (factorización binaria por bloques). Antes de comprimir, el autor aplicó un fine-tuning con LoRA (fusionado posteriormente) sobre tres conjuntos de datos derivados de trazas de "Fable-5" orientados a código. El resultado se publica como material inspeccionable, no como modelo utilizable.

El propio autor advierte de forma explícita que el modelo **no produce texto usable**. La perplejidad en held-out asciende a 2.294,8 frente a 86,5 del original (ratio 26,5), y la concordancia top-1 con el token más probable del modelo original cae al 26,5 %. En los benchmarks de tarea (HellaSwag y Winogrande) el rendimiento es equivalente al azar.

La relevancia de esta ficha es metodológica: documenta los límites prácticos de la cuantización binaria en modelos de 12B y sirve como referencia negativa para quien evalúe técnicas de compresión agresiva. El repositorio ocupa 4,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 12B-it), con factorización de pesos binaria por bloques (LittleBit-2) |
| Parametros totales | 12B (heredados del modelo base; el artefacto empaquetado ocupa 1,93 GB en q4_0 y 2,19 GB en q6_k) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la model card; heredada del base, sin confirmar) |
| Tipos de cuantizacion | LittleBit-2 a 1,00 bpw (empaquetado); el checkpoint denso se exporta a Q4_0 y Q6_K para GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` empaquetado (`model-q4_0.safetensors`, `model-q6_k.safetensors`); conversión a GGUF denso vía `code/lb_dense.py` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 12B parámetros (Gemma 4 12B-it). Sobre él se aplicó primero un fine-tuning con LoRA que después se fusionó en los pesos, usando tres datasets: `PawanKrd/claude-fable-5-code`, `victor/fable-5-boeing-747-trace` y `armand0e/claude-fable-5-claude-code`. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica es la compresión LittleBit-2: una factorización binaria por bloques que reduce cada peso a aproximadamente 1 bit. El autor reporta el error relativo del estado oculto por bloque: 0,159 tras el bloque 0, un mínimo de 0,056 tras el bloque 15, un máximo de 0,519 tras el bloque 41 y 0,404 tras el bloque 47. El detalle por bloque está en `blocks.jsonl`. El empaquetado no es ejecutable directamente por ningún motor: para evaluarlo hay que densificarlo primero (`code/lb_dense.py`), lo que reconstruye matrices bf16 ordinarias y elimina cualquier ventaja de tamaño o velocidad.

## Capacidades

- Generación de texto: **no funcional**. El autor declara que el texto generado no es usable.
- Razonamiento y código: no evaluables; el fine-tuning se orientó a código, pero la compresión destruye la distribución de salida.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible.
- Modo thinking, visión o audio: no disponible.
- Valor como artefacto de investigación: inspección de la degradación por bloque, medición de KL y concordancia top-1 frente al original.

## Casos de uso

- Investigación sobre límites de cuantización binaria: sirve como referencia negativa para comparar métodos de compresión (LittleBit-2 frente a Q4_K_M o Q8_0) midiendo KL y concordancia top-1, no solo perplejidad.
- Auditoría de pipelines de evaluación: permite comprobar que la perplejidad aislada es una señal engañosa en Gemma 4 12B-it, ya que puede bajar bajo ruido de cuantización (Q4_K_M da 81,22 frente a 86,27 del original).
- Estudio de propagación de error por capas: los datos de `blocks.jsonl` permiten analizar cómo crece el error relativo del estado oculto a lo largo de los 48 bloques.
- Reproducción de experimentos de compresión: el script `code/lb_dense.py` documenta el proceso de densificación a GGUF y la evaluación con llama.cpp.
- Docencia y divulgación: ejemplo concreto de por qué una ratio de perplejidad de 26,5 invalida un modelo para producción.
- Validación de motores de inferencia: los resultados en llama.cpp (builds c212d25, f4f6f2e y 44d5087) sirven para verificar que el motor procesa correctamente checkpoints densificados de gran tamaño.

## Benchmarks y rendimiento

| Medida held-out (32 filas x 1024 tokens) | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 7,7384 | 4,4607 |
| Perplejidad | 2.294,8 | 86,5 |
| Concordancia top-1 | 0,2654 | 1,0 |
| KL(original → comprimido), nats/token | 4,1715 | 0 |

| Fichero empaquetado | Dispositivo | GGUF denso | Empaquetado | Perplejidad (original) | Top-1 | KL (nats/token) | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|---|---|---|---|---|
| q4_0 | A100 40 GB | 23,83 GB | 1,93 GB | 2.334,9 (86,27) | 0,2651 | 4,2036 | 6.229,09 | 48,13 |
| q6_k | A100 80 GB | 23,83 GB | 2,19 GB | 2.291,9 (86,27) | 0,2621 | 4,1757 | 5.479,36 | 55,76 |

Referencia de cuantización del original (mismo texto held-out, perplejidad sin cuantizar 86,27):

| Cuantización del original | Perplejidad | KL (nats/token) | Top-1 |
|---|---|---|---|
| Q8_0 | 84,80 | 0,089 | 0,909 |
| Q4_K_M | 81,22 | 0,643 | 0,687 |

En HellaSwag (400 tareas) y Winogrande (500 tareas), medidos con los scorers integrados de llama.cpp sobre el GGUF denso, el modelo queda al nivel del azar. La tabla de resultados de tarea está truncada en la model card y no se dispone de los valores numéricos completos.

## Requisitos de hardware

- VRAM para el fichero empaquetado: no ejecutable directamente; ningún motor lo carga sin densificar.
- VRAM para el GGUF denso: 23,83 GB, idéntico al original en bf16.
- GPU validadas: A100 40 GB (q4_0) y A100 80 GB (q6_k).
- GPU de consumo: no cabe en tarjetas de 24 GB o menos en la ruta densa; no se reportan pruebas en RTX 4090 ni similares.
- CPU: el original bf16 GGUF (23,83 GB) rinde 78,90 tok/s de prompt y 3,23 tok/s de generación en 44 núcleos; el denso de este modelo tiene las mismas formas y tamaño, por lo que se espera un rendimiento equivalente.
- Despliegue: llama.cpp (builds c212d25, f4f6f2e y 44d5087). No hay soporte para vLLM, TGI ni Ollama del fichero empaquetado.
- Throughput: prompt 6.229,09 tok/s y generación 48,13 tok/s en A100 40 GB; prompt 5.479,36 tok/s y generación 55,76 tok/s en A100 80 GB. Idéntico al original dentro del margen de medida, porque la ruta densa no está comprimida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (1,00 bpw) | 12B | No disponible | 2.294,8 (original 86,5) | Apache 2.0 | Hugging Face |
| `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` | 12B | No disponible | 1.911,4 (original 86,5) | No disponible | Hugging Face |
| Original fine-tuned (Q4_K_M) | 12B | No disponible | 81,22 | Apache 2.0 (base) | Hugging Face |
| Original fine-tuned (Q8_0) | 12B | No disponible | 84,80 | Apache 2.0 (base) | Hugging Face |

Ninguna de las variantes comprimidas de la serie es utilizable como modelo de lenguaje; la comparativa sirve para ordenar la severidad de la degradación, no para elegir un modelo de producción.

## Limitaciones y advertencias

- **No utilizable en producción**: el autor lo declara explícitamente; el texto generado carece de sentido.
- Perplejidad 26,5 veces la del original y concordancia top-1 del 26,5 %; KL de 4,17 nats por token.
- Rendimiento al azar en HellaSwag y Winogrande.
- La perplejidad aislada no es fiable en este modelo base: puede descender bajo ruido de cuantización, por lo que hay que leer KL y concordancia top-1 en paralelo.
- El fichero empaquetado no es ejecutable por ningún motor; la ruta densa reconstruye el tamaño original (23,83 GB) y no aporta ahorro de memoria ni de latencia.
- Sesgos conocidos: no documentados; el modelo base Gemma 4 12B-it hereda los suyos, pero la compresión los hace irrelevantes al no generar texto coherente.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su falta de funcionalidad lo hace inviable.
- Artefacto experimental sin mantenimiento ni pipeline declarado; creado y actualizado en noviembre de 2026.

## Enlaces

- Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-1.00bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset: https://huggingface.co/datasets/victor/fable-5-boeing-747-trace
- Dataset: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Variante hermana: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
- llama.cpp: https://github.com/ggml-org/llama.cpp
