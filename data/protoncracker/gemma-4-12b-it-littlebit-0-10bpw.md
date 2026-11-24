# protoncracker/gemma-4-12b-it-littlebit-0.10bpw

## Resumen

`protoncracker/gemma-4-12b-it-littlebit-0.10bpw` es un artefacto de investigación publicado en Hugging Face que aplica la técnica de cuantización binaria LittleBit-2 (block-wise) al modelo `google/gemma-4-12B-it`, comprimiéndolo hasta 0,10 bits por peso. El autor, protoncracker, lo publica explícitamente como una demostración extrema del método y no como un modelo utilizable: la propia model card declara que el modelo "no funciona como modelo de lenguaje" y que se publica para que el resultado pueda inspeccionarse.

El modelo base es Gemma 4 12B-it de Google, un transformer de 12.000 millones de parámetros en versión instruction-tuned, que el autor comprime sin fine-tuning adicional. El resultado empaquetado ocupa 0,70-0,96 GB en el repositorio (1,7 GB en total), frente a los aproximadamente 23,83 GB del modelo original en bf16.

Su relevancia es metodológica: mide y documenta con rigor qué ocurre cuando se lleva la factorización binaria de pesos a un régimen de 0,10 bpw, con métricas de perplejidad, divergencia KL y acuerdo top-1 frente al original. Es un caso de estudio sobre los límites de la cuantización extrema, no una herramienta de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Gemma 4 12B-it), pesos factorizados con LittleBit-2 block-wise |
| Parámetros totales | 12 000 millones (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 0,10 bits por peso (LittleBit-2); ficheros empaquetados q4_0 y q6_k de la tabla de embeddings; conversión a GGUF denso disponible |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-q4_0.safetensors`, `model-q6_k.safetensors`), GGUF denso tras conversión |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder-only de 12B parámetros en versión instruction-tuned, y le aplica la técnica LittleBit-2 de factorización binaria de pesos por bloques, alcanzando una tasa de 0,10 bits por peso. No hay fine-tuning ni entrenamiento adicional sobre el modelo base: la compresión se aplica tal cual sobre los pesos publicados por Google.

La innovación técnica es la propia factorización binaria extrema, no una arquitectura nueva. El autor documenta el error relativo del estado oculto por bloque: 0,423 tras el bloque 0, 0,443 tras el bloque 47, con mínimo de 0,085 tras el bloque 16 y máximo de 0,602 tras el bloque 46. El repositorio incluye un script (`code/lb_dense.py`) para reconstruir un checkpoint denso a partir del fichero empaquetado, ya que ningún motor de inferencia ejecuta directamente el formato empaquetado.

## Capacidades

- Generación de texto: no funcional. La model card declara explícitamente que el texto generado no es utilizable.
- Razonamiento, código y matemáticas: no funcionales a este régimen de compresión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidad especial: ninguna. Es un artefacto de medición, no un modelo operativo.

## Casos de uso

- Estudio de los límites de la cuantización binaria: sirve como punto de referencia superior (0,10 bpw) en una curva de degradación frente a tasas mayores como 0,55 bpw.
- Reproducción de métricas de compresión: el repositorio permite recalcular perplejidad, KL y acuerdo top-1 sobre el texto held-out para validar la metodología del autor.
- Investigación sobre sensibilidad a ruido de cuantización: el modelo base Gemma 4 12B-it es sensible al ruido, y este artefacto documenta cuánto se amplifica esa sensibilidad a tasas extremas.
- Docencia sobre evaluación de modelos comprimidos: ilustra por qué la perplejidad aislada es una señal pobre y hay que leerla junto con KL y acuerdo top-1.
- Desarrollo de técnicas de reconstrucción: el script `lb_dense.py` y el pipeline a GGUF sirven como base para probar métodos de recuperación de pesos.
- Comparación de motores de inferencia: los datos de llama.cpp (build 44d5087) sobre A100 80 GB permiten contrastar comportamiento entre el modelo denso reconstruido y el original.

## Benchmarks y rendimiento

| Medida held-out (32 filas × 1024 tokens) | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 11,6076 | 5,6469 |
| Perplejidad | 109 934,2 | 283,4 |
| Acuerdo top-1 con el token top del original | 0,1257 | 1 |
| KL (original → comprimido), nats por token | 7,6560 | 0 |

| Fichero empaquetado | Dispositivo | GGUF denso | Fichero empaquetado | Perplejidad (original) | Acuerdo top-1 | KL (nats/token) | Prompt tok/s (pp512) | Generación tok/s (tg128) |
|---|---|---|---|---|---|---|---|---|
| q4_0 | A100 80 GB | 23,83 GB | 0,70 GB | 101 830,7 (281,28) | 0,1170 | 7,6407 | 6 181,96 | 55,74 |
| q6_k | A100 80 GB | 23,83 GB | 0,96 GB | 109 188,6 (281,28) | 0,1234 | 7,6702 | 6 348,69 | 55,74 |

| Benchmark de tarea | Este modelo (Q6_K, GGUF denso) | Original (bf16 GGUF) |
|---|---|---|
| HellaSwag, acc_norm (400 tareas) | 24,5 % (IC 95 %: 20,5-28,9) | 51,2 % (IC 95 %: 46,4-56,1) |
| Winogrande (500 tareas) | 50,2 % (± 2,2) | 57,0 % (± 2,2) |

Referencia de cuantización estándar del original en llama.cpp: Q8_0 da perplejidad 292,66, KL 0,188 y acuerdo 0,876; Q4_K_M da 305,94, KL 1,092 y acuerdo 0,647.

## Requisitos de hardware

- VRAM para inferencia del fichero empaquetado: no hay motor que ejecute el formato empaquetado directamente; el fichero ocupa 0,70-0,96 GB pero no es inferible tal cual.
- VRAM para el GGUF denso reconstruido: 23,83 GB, idéntico al original en bf16.
- GPU recomendadas: A100 80 GB (medido por el autor). H100 y RTX 4090 no están documentadas en la información disponible.
- Cabe en GPU de consumo: no disponible para el GGUF denso de 23,83 GB; el fichero empaquetado no es ejecutable directamente.
- Opciones de despliegue: llama.cpp (build 44d5087 2026-11-22) sobre GGUF denso; vLLM, TGI y Ollama no están documentados.
- Latencia y throughput: en A100 80 GB, prompt processing 6 181,96-6 348,69 tok/s y generación 55,74 tok/s, equivalente al original dentro del margen de medida. El autor subraya que el modelo denso no es más rápido ni más pequeño que el original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (0,10 bpw) | 12B | no disponible | 109 934,2 (original: 283,4) | apache-2.0 | Hugging Face |
| `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` | 12B | no disponible | 1 911,4 (original: 86,5) | no disponible | Hugging Face |
| `google/gemma-4-12B-it` (Q8_0) | 12B | no disponible | 292,66 | no disponible | Hugging Face |
| `google/gemma-4-12B-it` (Q4_K_M) | 12B | no disponible | 305,94 | no disponible | Hugging Face |

El autor señala que incluso el mejor comprimido de la serie (0,55 bpw) no es utilizable como modelo de lenguaje. La comparación relevante es contra el original sin comprimir y sus cuantizaciones estándar.

## Limitaciones y advertencias

- El modelo no funciona como modelo de lenguaje: perplejidad 388 veces la del original y texto generado inutilizable según la propia model card.
- Alucinación garantizada: el acuerdo top-1 con el original es del 12 %, por lo que la salida diverge masivamente de la distribución original.
- Sin uso comercial práctico: la licencia apache-2.0 permite el uso, pero el artefacto no es apto para producción.
- Sensibilidad del modelo base a la cuantización: Gemma 4 12B-it ya se degrada con Q4_K_M (KL 1,092), lo que agrava el efecto a 0,10 bpw.
- La perplejidad aislada es una señal pobre para este modelo; hay que leerla junto con KL y acuerdo top-1.
- El fichero empaquetado no es ejecutable en ningún motor conocido; requiere reconstrucción a denso.
- No hay datos de idiomas, contexto ni pipeline declarados en el repositorio.
- Artefacto experimental: el propio autor lo describe como demostración "por impacto" y no como resultado útil.

## Enlaces

- Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-littlebit-0.10bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Script de reconstrucción a denso: `code/lb_dense.py` (incluido en el repositorio)
- Métricas por bloque: `blocks.jsonl` (incluido en el repositorio)
- Paper de LittleBit-2: no disponible
- Blog del autor: no disponible
- Repositorio de código: no disponible
