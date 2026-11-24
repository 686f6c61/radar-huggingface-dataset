# protoncracker/gemma-4-12b-it-littlebit-0.55bpw

## Resumen

`protoncracker/gemma-4-12b-it-littlebit-0.55bpw` es un artefacto de investigación publicado en Hugging Face que contiene una compresión extrema del modelo `google/gemma-4-12B-it` mediante el método LittleBit-2 con cuantización por bloques a 0,55 bits por peso (pesos binarios factorizados). El autor, `protoncracker`, lo publica explícitamente como resultado inspeccionable, no como modelo utilizable: la propia model card declara que «este modelo comprimido no produce texto usable».

El interés técnico del artefacto no reside en su calidad como modelo de lenguaje, sino en la medición rigurosa del daño que introduce una factorización binaria en un transformer de 12B parámetros. El autor reporta perplejidad en held-out de 35.741,5 frente a 283,4 del original (ratio 126,1), acuerdo top-1 del 21,13 % con el token más probable del original y KL de 6,4847 nats por token. Además, documenta que Gemma 4 12B-it es especialmente sensible al ruido de cuantización, con lo que incluso Q4_K_M ya altera la distribución de salida de forma medible.

La relevancia actual es metodológica: sirve como referencia negativa para quien investigue compresión extrema de pesos, cuantización binaria o factorizaciones de bajo rango, y aporta un protocolo de evaluación (perplejidad, KL, acuerdo top-1, HellaSwag, Winogrande) reproducible en llama.cpp. No es un modelo para desplegar en producción bajo ninguna circunstancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de `google/gemma-4-12B-it`), pesos factorizados binarios por bloques (LittleBit-2) |
| Parametros totales | 12B (modelo base); tamaño del repo comprimido: 2,9 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 0,55 bits por peso (LittleBit-2, block-wise); ficheros empaquetados `q4_0` (1,32 GB) y `q6_k` (1,58 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado `model-q4_0.safetensors`, `model-q6_k.safetensors`); conversión a GGUF denso vía `code/lb_dense.py` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it` sin fine-tuning posterior. La compresión aplica LittleBit-2, un esquema de factorización binaria de pesos por bloques que reduce cada matriz a una combinación de factores binarios más escalas, alcanzando 0,55 bits por peso efectivos. No se trata de una cuantización escalar convencional (como Q4_K_M o Q8_0), sino de una reparametrización que reconstruye matrices densas al descomprimir.

No hay información disponible sobre el dataset de calibración, el número de tokens empleados en el proceso de compresión ni sobre si se aplicó algún ajuste posterior. El autor indica que el fichero empaquetado no se puede ejecutar directamente en ningún motor: para evaluarlo se convierte primero a un checkpoint denso (`code/lb_dense.py`), después a GGUF y finalmente se ejecuta en llama.cpp. Esa ruta densa reconstruye matrices bf16 ordinarias, por lo que el GGUF resultante pesa 23,83 GB, idéntico al original, y no aporta ninguna ventaja de tamaño ni de velocidad; solo permite medir la calidad y el rendimiento del motor.

El autor documenta además que el error relativo del estado oculto en held-out crece de 0,211 tras el bloque 0 a 0,412 tras el bloque 47, con mínimo de 0,066 tras el bloque 16 y máximo de 0,558 tras el bloque 46 (detalle en `blocks.jsonl`).

## Capacidades

- Generación de texto: no funcional. La model card declara explícitamente que el modelo no produce texto usable.
- Razonamiento y matemáticas: no evaluado de forma específica; los benchmarks de tarea disponibles (HellaSwag, Winogrande) sitúan el modelo en el nivel de azar.
- Código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Valor como artefacto de investigación: sí, permite inspeccionar y reproducir las métricas de degradación bajo compresión binaria extrema.

## Casos de uso

- Investigación en compresión extrema de pesos: el artefacto sirve para estudiar cómo se degrada la distribución de salida de un transformer de 12B al aplicar factorización binaria a 0,55 bits por peso, usando las métricas de perplejidad, KL y acuerdo top-1 como referencia.
- Referencia negativa en papers de cuantización: permite citar un punto de comparación documentado (ratio de perplejidad 126,1) frente a métodos de cuantización escalar como Q8_0 o Q4_K_M, que en el mismo modelo base mantienen ratios mucho más bajos.
- Validación de pipelines de evaluación: el repositorio incluye el script `code/lb_dense.py` y los resultados por bloque, útiles para verificar que una cadena de conversión (safetensors empaquetado → denso → GGUF → llama.cpp) reproduce las cifras publicadas.
- Estudio de sensibilidad a ruido de cuantización: el autor documenta que Gemma 4 12B-it es inusualmente sensible; el artefacto permite replicar esa observación comparando Q8_0, Q4_K_M y la factorización binaria sobre el mismo texto held-out.
- Docencia y divulgación: ejemplo concreto de por qué la perplejidad aislada es una señal pobre de calidad y por qué conviene leerla junto a KL y acuerdo top-1.
- Auditoría de artefactos publicados: sirve como caso de estudio de model cards que declaran explícitamente la no utilizabilidad del modelo, frente a publicaciones que sobredimensionan resultados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, medidos en held-out (32 filas × 1024 tokens) y con llama.cpp build 44d5087 (2026-11-22):

| Medida held-out | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 10,4841 | 5,6469 |
| Perplejidad | 35.741,5 | 283,4 |
| Acuerdo top-1 con el token más probable del original | 0,2113 | 1 |
| KL(original → comprimido), nats por token | 6,4847 | 0 |

Resultados en motor (fichero empaquetado convertido a GGUF denso, A100 80 GB):

| Fichero | GGUF denso | Fichero empaquetado | Perplejidad (original) | Acuerdo top-1 | KL (nats/token) | Prompt tok/s (pp512) | Generación tok/s (tg128) |
|---|---|---|---|---|---|---|---|
| q4_0 | 23,83 GB | 1,32 GB | 33.521,0 (281,28) | 0,2055 | 6,4801 | 6.109,67 | 55,71 |
| q6_k | 23,83 GB | 1,58 GB | 35.652,1 (281,28) | 0,2091 | 6,5038 | 6.010,73 | 55,80 |

Referencia de cuantización del original (mismo motor y texto held-out):

| Cuantización del original | Perplejidad | KL al original sin cuantizar (nats/token) | Acuerdo top-1 |
|---|---|---|---|
| Q8_0 | 292,66 | 0,188 | 0,876 |
| Q4_K_M | 305,94 | 1,092 | 0,647 |

Benchmarks de tarea (llama.cpp `--hellaswag` y `--winogrande`, GGUF denso del fichero Q6_K):

| Modelo | HellaSwag acc_norm | Winogrande | Tareas (HellaSwag / Winogrande) |
|---|---|---|---|
| Este modelo, Q6_K (GGUF denso) | 26,2 % (IC 95 %: 22,2–30,8) | 50,0 % (± 2,2) | 400 / 500 |
| Original (bf16 GGUF) | 51,2 % (IC 95 %: 46,4–56,1) | 57,0 % (± 2,2) | 400 / 500 |
| Original Q8_0 | 53,2 % (IC 95 %: 48,4–58,1) | 54,6 % (± 2,2) | 400 / 500 |
| Original Q4_K_M | 50,0 % (IC 95 %: 45,1–54,9) | 56,6 % (± 2,2) | 400 / 500 |
| Azar | 25 % | 50 % | — |

El modelo comprimido está en el nivel de azar en ambas tareas. En velocidad, el GGUF denso iguala al original dentro del margen de medida (prompt 6.010–6.110 tok/s frente a 5.868,30 tok/s; generación 55,71–55,80 tok/s frente a 55,72 tok/s), comportamiento esperado porque la ruta densa reconstruye matrices bf16 del mismo tamaño.

## Requisitos de hardware

- VRAM para el fichero empaquetado: 1,32 GB (q4_0) y 1,58 GB (q6_k), pero no existe motor que ejecute el fichero empaquetado directamente.
- VRAM para la ruta densa (única ejecutable): 23,83 GB de GGUF, equivalente al modelo original en bf16.
- GPU recomendadas para la ruta densa: A100 80 GB (medido por el autor); cualquier GPU con ≥ 24 GB de VRAM podría alojar el GGUF denso, aunque no se han publicado medidas en otras GPU.
- Consumer GPU: el fichero empaquetado cabría en cualquier GPU de 4 GB, pero es inejecutable; el GGUF denso requiere al menos 24 GB, por lo que queda fuera de la mayoría de tarjetas de consumo (RTX 4090 de 24 GB sería el mínimo teórico, sin medidas publicadas).
- Opciones de despliegue: llama.cpp (build 44d5087 o posterior) es el único motor con el que se han publicado resultados. No hay soporte documentado para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: prompt processing 6.010–6.110 tok/s y generación 55,7–55,8 tok/s en A100 80 GB con la ruta densa, idénticos al original dentro del margen de medida.

## Comparativa con modelos similares

No se dispone de información sobre otros artefactos de compresión binaria comparables en la información proporcionada. La model card menciona un artefacto hermano de la misma serie, `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel`, con perplejidad held-out de 1.911,4 frente a 86,5 de su original, que el propio autor califica también como no utilizable.

| Modelo | Parámetros | Contexto | Perplejidad held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LittleBit-2, 0,55 bpw) | 12B | no disponible | 35.741,5 (original: 283,4) | Apache 2.0 | Hugging Face |
| `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` | 12B | no disponible | 1.911,4 (original: 86,5) | no disponible | Hugging Face |
| `google/gemma-4-12B-it` (original bf16) | 12B | no disponible | 283,4 | no disponible | Hugging Face |
| `google/gemma-4-12B-it` Q4_K_M | 12B | no disponible | 305,94 | no disponible | Conversión local con llama.cpp |

## Limitaciones y advertencias

- No es un modelo de lenguaje funcional: la model card declara explícitamente que no produce texto usable y que se publica solo para inspección.
- Perplejidad held-out 126 veces la del original; KL de 6,48 nats por token y acuerdo top-1 del 21 %, muy por debajo de lo que se considera degradación aceptable (el autor fija el umbral de «no usable» en un ratio de perplejidad superior a 5).
- En el nivel de azar en HellaSwag (26,2 %, IC 95 % 22,2–30,8 frente a azar del 25 %) y en Winogrande (50,0 % ± 2,2 frente a azar del 50 %).
- La perplejidad aislada es una señal pobre de calidad en este modelo base: el autor documenta que puede bajar bajo ruido de cuantización, por lo que deben leerse siempre KL y acuerdo top-1 junto a ella.
- El fichero empaquetado no es ejecutable en ningún motor conocido; la única ruta práctica es la conversión a denso, que elimina toda ventaja de tamaño (23,83 GB) y de velocidad.
- No hay información sobre sesgos, alucinación controlada, idiomas soportados ni restricciones adicionales de licencia más allá de Apache 2.0.
- Aunque la licencia declarada es Apache 2.0, el modelo base `google/gemma-4-12B-it` puede tener sus propias condiciones de uso; conviene verificar la licencia del modelo original antes de cualquier uso derivado.
- No usar en producción, ni en pipelines automatizados, ni como sustituto del modelo original en ninguna tarea.

## Enlaces

- [Hugging Face: protoncracker/gemma-4-12b-it-littlebit-0.55bpw](https://huggingface.co/protoncracker/gemma-4-12b-it-littlebit-0.55bpw)
- [Modelo base: google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- [Artefacto hermano: gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel](https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel)
- [llama.cpp (build 44d5087, 2026-11-22)](https://github.com/ggml-org/llama.cpp)
