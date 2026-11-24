# protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.10bpw-channel

## Resumen

`protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.10bpw-channel` es un artefacto de investigación publicado en Hugging Face por el usuario protoncracker. Se trata de un fine-tuning del modelo base `google/gemma-4-12B-it` (12.000 millones de parámetros, familia Gemma 4 de Google) sobre tres conjuntos de datos de trazas de código, al que posteriormente se le aplicó una compresión extrema mediante el método experimental LittleBit-2, con un factor de cuantización binaria de 0,10 bits por peso (block-wise).

El modelo no es un modelo utilizable. La propia model card lo califica explícitamente como «research artifact» y advierte de que «does not produce usable text». La compresión a 0,10 bits por peso se presenta como una demostración de hasta dónde puede llevarse la factorización binaria, no como una release funcional. La perplejidad en held-out es de 16.915,1 frente a 86,4 del original (ratio 195,7), y la concordancia top-1 con el token más probable del original cae al 17,16%.

Su relevancia es, por tanto, metodológica: documenta con mediciones detalladas (perplejidad, KL, acuerdo top-1, error relativo por bloque, resultados en llama.cpp) el punto en el que la cuantización binaria agresiva destruye la capacidad lingüística del modelo. Sirve como referencia negativa para quienes investigan compresión extrema de pesos y como evidencia de la sensibilidad de Gemma 4 12B-it al ruido de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-12B-it); pesos factorizados con LittleBit-2 block-wise |
| Parámetros totales | 12.000 millones (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | LittleBit-2 a 0,10 bits por peso (block-wise); variantes empaquetadas q4_0 y q6_k de la tabla de embeddings |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-q4_0.safetensors`, `model-q6_k.safetensors`); conversión a GGUF denso documentada |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder-only de 12.000 millones de parámetros. Sobre él se aplicó primero un fine-tuning con LoRA (posteriormente fusionado) usando tres datasets de trazas de código: `PawanKrd/claude-fable-5-code`, `victor/fable-5-boeing-747-trace` y `armand0e/claude-fable-5-claude-code`. El resultado de ese SFT es el «original» contra el que se comparan todas las métricas de la model card.

Sobre ese modelo ajustado se aplicó la compresión LittleBit-2, un método experimental de factorización binaria de pesos por bloques, llevada a 0,10 bits por peso. La model card es explícita en que este ratio es «a demonstration for shock value only» y que el modelo no funciona sin técnicas adicionales que no se aplicaron. El proceso de compresión se documenta bloque a bloque: el error relativo del estado oculto es 0,474 tras el bloque 0, 0,469 tras el bloque 47, con mínimo 0,164 tras el bloque 15 y máximo 0,635 tras el bloque 11.

Para poder ejecutar el modelo en un motor estándar se convirtió el checkpoint empaquetado a un checkpoint denso (`code/lb_dense.py`), y de ahí a GGUF. Es importante subrayar que esa ruta densa reconstruye matrices bf16 ordinarias: el GGUF resultante pesa 23,83 GB, exactamente igual que el original, de modo que no aporta ninguna ventaja de tamaño ni de velocidad. No existe, según la model card, ningún motor que ejecute el fichero empaquetado directamente.

## Capacidades

- Generación de texto: nominalmente heredada del modelo base, pero en la práctica inutilizable (perplejidad 195,7 veces la del original).
- Razonamiento y código: el SFT se hizo sobre trazas de código, pero la compresión destruye la capacidad; en HellaSwag y Winogrande el modelo está «at chance».
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Estudio de compresión extrema de pesos: sirve como referencia negativa documentada para comparar curvas de perplejidad, KL y acuerdo top-1 frente a otros ratios de la misma serie (por ejemplo, la variante a 0,55 bpw, con perplejidad 1.911,4).
- Reproducción de mediciones de cuantización: la model card incluye tablas completas (Q8_0, Q4_K_M, denso GGUF en A100) que permiten replicar el pipeline de evaluación en llama.cpp.
- Análisis de sensibilidad de Gemma 4 12B-it al ruido de cuantización: el documento muestra que Q4_K_M ya altera la distribución de salida (KL 0,643 nats/token, acuerdo top-1 0,687), lo que resulta útil para calibrar expectativas antes de cuantizar el modelo base.
- Docencia e ilustración de límites teóricos: ejemplo concreto de por qué la cuantización binaria por debajo de 1 bit por peso no es viable sin técnicas compensatorias.
- Validación de pipelines de conversión safetensors → GGUF → llama.cpp: el flujo `lb_dense.py` → GGUF → llama.cpp está descrito y puede reutilizarse para otros artefactos de la serie.
- Auditoría de artefactos publicados en Hugging Face: caso de estudio sobre model cards que advierten explícitamente de la no utilizabilidad de un modelo.

## Benchmarks y rendimiento

Resultados de calidad en held-out (32 filas × 1024 tokens):

| Medida | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 9,7360 | 4,4594 |
| Perplejidad | 16.915,1 | 86,4 |
| Acuerdo top-1 con el token top del original | 0,1716 | 1 |
| KL(original → comprimido), nats/token | 6,0648 | 0 |

Resultados del fichero empaquetado convertido a GGUF denso y evaluado en llama.cpp (build f4f6f2e, 2026-11-23, A100 80 GB):

| Fichero | GGUF denso | Fichero empaquetado | Perplejidad (original) | Acuerdo top-1 | KL (nats/token) | Prompt tok/s (pp512) | Generación tok/s (tg128) |
|---|---|---|---|---|---|---|---|
| q4_0 | 23,83 GB | 0,70 GB | 17.249,7 (86,27) | 0,1703 | 6,0935 | 5.199,36 | 55,79 |
| q6_k | 23,83 GB | 0,96 GB | 17.051,6 (86,27) | 0,1707 | 6,0721 | 6.060,82 | 55,82 |

Referencia de cuantización estándar del original (llama.cpp f4f6f2e, mismo texto held-out):

| Cuantización del original | Perplejidad | KL al original sin cuantizar (nats/token) | Acuerdo top-1 |
|---|---|---|---|
| Q8_0 | 84,80 | 0,089 | 0,909 |
| Q4_K_M | 81,22 | 0,643 | 0,687 |

Rendimiento comparado con el original bf16 GGUF (23,83 GB) en el mismo motor: prompt processing 6.015,25 tok/s y generación 55,75 tok/s en A100 80 GB; en CPU de 44 núcleos, 78,90 tok/s de prompt y 3,23 tok/s de generación. Las cifras del modelo comprimido son idénticas dentro del margen de medida, porque la ruta densa no está comprimida.

## Requisitos de hardware

- VRAM estimada para inferencia: el GGUF denso ocupa 23,83 GB, por lo que requiere al menos ~24 GB de VRAM para caber completo en GPU.
- GPU recomendadas: A100 80 GB (medido), H100, y en general cualquier GPU con 24 GB o más (RTX 3090, RTX 4090) para el GGUF denso.
- Cabe en consumer GPU: sí, en RTX 3090/4090 de 24 GB con el GGUF denso, aunque sin ventaja de tamaño respecto al original.
- Opciones de despliegue: llama.cpp (única ruta documentada, mediante conversión a GGUF denso). No hay motor que ejecute el fichero empaquetado de 0,70 GB directamente.
- Latencia y throughput: en A100 80 GB, 5.199–6.061 tok/s de prompt y ~55,8 tok/s de generación; en CPU de 44 núcleos, 78,90 tok/s de prompt y 3,23 tok/s de generación (cifras del original, extrapolables al denso por tener la misma forma y tamaño).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (0,10 bpw) | 12B | no disponible | 16.915,1 | apache-2.0 | Hugging Face |
| `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` | 12B | no disponible | 1.911,4 | no disponible | Hugging Face |
| Original fine-tuned (bf16) | 12B | no disponible | 86,4 | apache-2.0 (base) | Hugging Face |
| `google/gemma-4-12B-it` (base) | 12B | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- El modelo no funciona como modelo de lenguaje: la propia model card lo declara «research artifact» y «does not produce usable text».
- Perplejidad en held-out 195,7 veces la del original; acuerdo top-1 del 17,16%; KL de 6,06 nats por token.
- En los benchmarks de tarea (HellaSwag y Winogrande) el modelo está «at chance», es decir, al nivel del azar.
- El fichero empaquetado (0,70 GB) no puede ejecutarse en ningún motor conocido; solo la conversión a GGUF denso (23,83 GB) es ejecutable, y no aporta ventaja de tamaño ni de velocidad.
- La perplejidad por sí sola es una señal de calidad poco fiable en este modelo: la model card advierte que puede bajar bajo ruido de cuantización, por lo que hay que leerla junto a KL y acuerdo top-1.
- Gemma 4 12B-it es inusualmente sensible al ruido de cuantización; incluso Q4_K_M altera la distribución de salida de forma notable (KL 0,643).
- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: total, dado que la salida no es texto utilizable.
- Restricciones de licencia: apache-2.0 según la model card; conviene verificar la licencia del modelo base Gemma 4 12B-it, que puede imponer condiciones adicionales.
- Idiomas soportados: no disponibles.
- Longitud de contexto: no disponible.
- Uso comercial: desaconsejado en la práctica por la no funcionalidad del modelo, con independencia de lo que permita la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.10bpw-channel
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante de la serie a 0,55 bpw: `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` (referenciada en la model card)
- Dataset `PawanKrd/claude-fable-5-code`: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset `victor/fable-5-boeing-747-trace`: https://huggingface.co/datasets/victor/fable-5-boeing-747-trace
- Dataset `armand0e/claude-fable-5-claude-code`: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- llama.cpp (build f4f6f2e, 2026-11-23): https://github.com/ggml-org/llama.cpp
