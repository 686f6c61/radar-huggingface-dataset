# protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.33bpw-channel

## Resumen

Este repositorio contiene un artefacto de investigación experimental: una versión del modelo Gemma 4 12B-it de Google sometida a un proceso de ajuste fino supervisado (SFT con LoRA fusionado) sobre trazas de "Fable-5" y, posteriormente, comprimida mediante la técnica LittleBit-2 (factorización binaria por bloques) hasta 0,33 bits por peso. El autor, protoncracker, publica el resultado explícitamente como material de inspección, no como un modelo utilizable.

La relevancia de esta ficha no reside en el modelo en sí (que, según su propia model card, no produce texto usable), sino en la documentación rigurosa de los límites de la compresión extrema. El autor mide la degradación con perplejidad, KL y acuerdo top-1 frente al original, y demuestra que Gemma 4 12B-it es especialmente sensible al ruido de cuantización.

El modelo base es un transformer de 12B parámetros con ventana de contexto no especificada en la información disponible. El repo ocupa 2,3 GB (pesos empaquetados), pero al convertirlo a checkpoint denso recupera el tamaño del original (23,83 GB en bf16), por lo que no ofrece ninguna ventaja de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B-it) con factorización binaria LittleBit-2 block-wise |
| Parámetros totales | 12B (modelo base); pesos comprimidos a 0,33 bits por peso |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | LittleBit-2 a 0,33 bpw; empaquetados q4_0 y q6_k (tabla de embeddings); conversión a GGUF denso |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado); GGUF tras conversión a denso |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-12B-it, un transformer denso de 12B parámetros. Sobre él se aplicó un ajuste fino supervisado con LoRA (posteriormente fusionado) usando tres datasets de trazas de código y razonamiento: PawanKrd/claude-fable-5-code, victor/fable-5-boeing-747-trace y armand0e/claude-fable-5-claude-code. Después se aplicó la compresión LittleBit-2, un método experimental de factorización binaria por bloques que representa cada matriz de pesos con factores binarios y escalas, alcanzando 0,33 bits por peso.

La innovación técnica es precisamente el objeto del experimento: medir hasta dónde se puede comprimir un modelo de 12B antes de destruir su funcionalidad. El autor documenta el error relativo del estado oculto por bloque: 0,350 tras el bloque 0, 0,430 tras el bloque 47, con mínimo de 0,221 tras el bloque 2 y máximo de 0,586 tras el bloque 41. No se especifica el número de tokens de entrenamiento ni la composición detallada de los datasets.

## Capacidades

- El modelo no produce texto usable según su propia model card; no debe emplearse para generación.
- El ajuste fino previo buscaba capacidades de código y razonamiento sobre trazas tipo Claude, pero la compresión las destruye.
- No hay evidencia de soporte de tool calling, agentes ni multi-step reasoning tras la compresión.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Valor real: servir como referencia metodológica para estudiar los límites de la cuantización binaria.

## Casos de uso

- Investigación sobre límites de compresión: el artefacto permite reproducir las mediciones de perplejidad, KL y acuerdo top-1 para estudiar la degradación de LittleBit-2 en modelos de 12B.
- Estudio de sensibilidad a cuantización: comparar el comportamiento de Gemma 4 12B-it frente a otros modelos bajo Q8_0, Q4_K_M y factorización binaria, dado que el autor documenta que la perplejidad puede caer bajo el ruido de cuantización.
- Validación de pipelines de conversión: el flujo empaquetado → denso (code/lb_dense.py) → GGUF → llama.cpp sirve para probar herramientas de conversión de pesos.
- Docencia y divulgación: ejemplo real de por qué la perplejidad sola es una mala señal de calidad y hay que leer KL y acuerdo top-1 junto a ella.
- Reproducibilidad de benchmarks de motor: los datos de llama.cpp (pp512, tg128) permiten verificar el rendimiento del motor con modelos densos de 23,83 GB.
- Referencia de comparación interna: el autor cita gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel (perplejidad 1.911,4 frente a 86,5) como el mejor de la serie, también inutilizable, útil para trazar la curva de degradación por bpw.

## Benchmarks y rendimiento

Resultados de la model card (32 filas held-out × 1024 tokens):

| Medida held-out | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 8,2686 | 4,4607 |
| Perplejidad | 3.899,7 | 86,5 |
| Acuerdo top-1 con el original | 0,2520 | 1 |
| KL (original → comprimido), nats/token | 4,6784 | 0 |

Resultados en motor (llama.cpp f4f6f2e, A100 80 GB, GGUF denso):

| Fichero | GGUF denso | Empaquetado | Perplejidad (original) | Acuerdo top-1 | KL | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|---|---|---|---|
| q4_0 | 23,83 GB | 1,02 GB | 3.936,8 (86,27) | 0,2495 | 4,7044 | 5.056,94 | 55,80 |
| q6_k | 23,83 GB | 1,28 GB | 3.921,7 (86,27) | 0,2492 | 4,6875 | 5.954,47 | 55,82 |

Cuantización del original para contexto (perplejidad sin cuantizar: 86,27):

| Cuantización | Perplejidad | KL (nats/token) | Acuerdo top-1 |
|---|---|---|---|
| Q8_0 | 84,80 | 0,089 | 0,909 |
| Q4_K_M | 81,22 | 0,643 | 0,687 |

El modelo es esencialmente aleatorio en HellaSwag y Winogrande (el texto de la model card se corta antes de mostrar la tabla completa de resultados de tareas).

## Requisitos de hardware

- El fichero empaquetado ocupa 1,02 GB (q4_0) o 1,28 GB (q6_k), pero no existe motor que lo ejecute directamente.
- Para inferencia hay que convertirlo a denso: 23,83 GB en bf16, equivalente al original.
- VRAM estimada: ~24 GB para el GGUF denso en bf16; no hay ahorro frente al modelo base.
- GPU recomendadas: A100 80 GB (medido); H100; cualquier GPU con ≥24 GB para el denso.
- No cabe en GPUs consumer de 8-16 GB en la ruta densa.
- Despliegue: llama.cpp (medido); vLLM y TGI no reportados para este artefacto.
- Rendimiento medido en A100 80 GB: prompt processing 5.056,94-5.954,47 tok/s (pp512), generación 55,80-55,82 tok/s (tg128); en CPU de 44 núcleos el original rinde 78,90 tok/s de prompt y 3,23 tok/s de generación.

## Comparativa con modelos similares

| Modelo | Parámetros | bpw | Perplejidad held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (0,33 bpw) | 12B | 0,33 | 3.899,7 | apache-2.0 | Hugging Face |
| gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel | 12B | 0,55 | 1.911,4 | apache-2.0 | Hugging Face |
| Gemma 4 12B-it original (bf16) | 12B | 16 | 86,5 | apache-2.0 | Hugging Face |
| Gemma 4 12B-it Q4_K_M | 12B | ~4 | 81,22 | apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- El modelo no funciona como modelo de lenguaje: perplejidad 45 veces la del original y texto generado inutilizable.
- Sesgos conocidos: no documentados, pero hereda los del ajuste fino sobre trazas de Claude, no auditados.
- Riesgo de alucinación: total, al ser esencialmente aleatorio en tareas (HellaSwag, Winogrande).
- La perplejidad es una señal engañosa en este modelo; hay que leer KL y acuerdo top-1.
- El fichero empaquetado no tiene motor de ejecución; la ruta densa elimina cualquier ventaja de tamaño o velocidad.
- Licencia apache-2.0 declarada, pero conviene verificar las condiciones del modelo base de Google para uso comercial.
- No usar en producción bajo ninguna circunstancia; es un artefacto de investigación.

## Enlaces

- Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.33bpw-channel
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset: https://huggingface.co/datasets/victor/fable-5-boeing-747-trace
- Dataset: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Serie relacionada: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
