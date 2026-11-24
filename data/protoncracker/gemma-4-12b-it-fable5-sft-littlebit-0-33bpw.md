# protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.33bpw

## Resumen

`protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.33bpw` es un artefacto de investigación publicado en Hugging Face que aplica la técnica de cuantización experimental LittleBit-2 (factorización binaria por bloques) a un fine-tune de `google/gemma-4-12B-it`. El autor, protoncracker, parte de un ajuste fino con LoRA (fusionado) sobre tres datasets de trazas de código y razonamiento derivados de Claude ("fable-5"), y posteriormente comprime ese modelo resultante a aproximadamente 0,33 bits por peso. El objetivo declarado es explorar los límites prácticos de la compresión extrema, no ofrecer un modelo utilizable.

La relevancia de esta ficha es fundamentalmente metodológica: el propio autor documenta de forma explícita y cuantitativa que **el modelo no funciona como modelo de lenguaje**. La perplejidad en held-out se dispara a 23.279,5 frente a 86,5 del original (ratio 269,0), la concordancia top-1 con el token original cae al 16,62 % y la divergencia KL respecto al original es de 6,2297 nats por token. En benchmarks de tarea (HellaSwag y Winogrande) el modelo se sitúa en el nivel del azar. Se publica como evidencia inspeccionable de un resultado negativo reproducible.

El repositorio ocupa 2,3 GB, muy por debajo de los ~23,83 GB del checkpoint denso original en bf16, lo que refleja la agresividad de la compresión. No obstante, el autor subraya que la ruta de ejecución práctica (convertir el fichero empaquetado a checkpoint denso y luego a GGUF) reconstruye matrices ordinarias y, por tanto, **no ofrece ninguna ventaja de tamaño ni de velocidad** frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-12B-it); pesos comprimidos con LittleBit-2 (factorización binaria por bloques) |
| Parametros totales | 12B (modelo base); tamaño del fichero empaquetado: 1,02 GB (q4_0) / 1,28 GB (q6_k) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | LittleBit-2 a ~0,33 bits por peso; variantes empaquetadas q4_0 y q6_k (tabla de embeddings); conversión a GGUF denso para ejecución |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado); conversión a GGUF denso para llama.cpp |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder-only de 12B parámetros. Sobre esa base se aplicó un ajuste fino con LoRA que posteriormente se fusionó, usando tres datasets de trazas: `PawanKrd/claude-fable-5-code`, `victor/fable-5-boeing-747-trace` y `armand0e/claude-fable-5-claude-code`. Sobre el modelo ya ajustado se aplicó la compresión LittleBit-2, una factorización binaria por bloques que aproxima cada matriz de pesos con factores binarios y escalas, alcanzando aproximadamente 0,33 bits por peso.

La innovación técnica es precisamente el método de compresión, no el modelo en sí. El autor documenta el error relativo del estado oculto por bloque: 0,266 tras el bloque 0, 0,444 tras el bloque 47, con un mínimo de 0,075 tras el bloque 16 y un máximo de 0,586 tras el bloque 41 (datos completos en `blocks.jsonl`). El resultado agregado es una divergencia severa respecto al modelo original, que el propio autor clasifica como "no utilizable" según su propia regla (ratio de perplejidad superior a 5). No se documentan detalles sobre número de tokens de entrenamiento del fine-tune ni sobre el proceso de RLHF/DPO.

## Capacidades

- **Ninguna capacidad utilizable como modelo de lenguaje.** El autor declara explícitamente que "este modelo comprimido no produce texto utilizable".
- Generación de texto: no funcional (perplejidad 269 veces la del original).
- Razonamiento y código: no funcional; los datos de fine-tune eran de código, pero la compresión destruye la distribución.
- Tool calling / function calling: no disponible / no funcional.
- Soporte de agentes y razonamiento multi-paso: no funcional.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Concordancia top-1 con el token original: 16,62 % (nivel próximo al azar en la práctica).

## Casos de uso

- **Inspección de resultados de compresión extrema:** el modelo sirve como artefacto reproducible para que investigadores en cuantización verifiquen las métricas publicadas (perplejidad, KL, concordancia top-1) y comparen con otras variantes de la serie.
- **Estudio de la sensibilidad de Gemma 4 12B-it a la cuantización:** el autor documenta que incluso Q8_0 y Q4_K_M alteran la distribución de salida (KL de 0,089 y 0,643 nats/token respectivamente), lo que convierte este modelo en caso de referencia para analizar cómo degrada la cuantización en este modelo base.
- **Validación de pipelines de conversión:** el flujo empaquetado → denso (`code/lb_dense.py`) → GGUF → llama.cpp permite probar herramientas de conversión y medición sobre un caso conocido y documentado.
- **Reproducción de benchmarks negativos:** útil para calibrar metodologías de evaluación (HellaSwag, Winogrande, perplejidad) y para comprobar que el modelo se sitúa en el azar.
- **Referencia comparativa dentro de la serie LittleBit:** permite situar el punto de 0,33 bpw frente a variantes como `...littlebit-0.55bpw-channel` (perplejidad 1.911,4), también no utilizable, para trazar la curva de degradación.
- **Docencia sobre límites de la compresión:** ejemplo didáctico de por qué la compresión por debajo de 1 bit por peso destruye la funcionalidad en transformers densos de este tamaño.

## Benchmarks y rendimiento

Resultados de held-out (32 filas × 1024 tokens) publicados por el autor:

| Medida (held-out) | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 10,0553 | 4,4607 |
| Perplejidad | 23.279,5 | 86,5 |
| Concordancia top-1 con el token original | 0,1662 | 1 |
| KL (original → comprimido), nats/token | 6,2297 | 0 |

Resultados en motor (llama.cpp) sobre el fichero enviado convertido a GGUF denso:

| Fichero | Dispositivo | GGUF denso | Fichero empaquetado | Perplejidad (original) | Top-1 | KL (nats/token) | Prompt tok/s (pp512) | Generación tok/s (tg128) |
|---|---|---|---|---|---|---|---|---|
| q4_0 | A100 40 GB | 23,83 GB | 1,02 GB | 23.893,2 (86,27) | 0,1701 | 6,2703 | 5.111,32 | 48,13 |
| q6_k | A100 80 GB | 23,83 GB | 1,28 GB | 23.493,7 (86,27) | 0,1650 | 6,2448 | 5.991,70 | 55,77 |

Referencia de cuantización del original (llama.cpp, held-out):

| Cuantización del original | Perplejidad | KL al original sin cuantizar (nats/token) | Top-1 |
|---|---|---|---|
| Q8_0 | 84,80 | 0,089 | 0,909 |
| Q4_K_M | 81,22 | 0,643 | 0,687 |

Benchmarks de tarea: HellaSwag (acc_norm, 400 tareas) y Winogrande (500 tareas) medidos con los scorers de llama.cpp; el autor indica que el modelo está en el nivel del azar en ambos (la tabla completa aparece truncada en la información disponible).

## Requisitos de hardware

- **VRAM para inferencia:** el fichero empaquetado ocupa 1,02 GB (q4_0) o 1,28 GB (q6_k), pero **no existe motor que ejecute el fichero empaquetado directamente**; la ruta práctica es convertir a denso y usar GGUF.
- **GGUF denso:** 23,83 GB, equivalente al original en bf16; requiere GPU de 40 GB o más (A100 40 GB para q4_0, A100 80 GB para q6_k) o bien CPU con suficiente RAM.
- **GPU recomendadas:** A100 40 GB y A100 80 GB (únicos dispositivos con resultados publicados). No hay datos de RTX 4090 ni otras consumer GPU.
- **¿Cabe en consumer GPU?** No con la ruta densa (23,83 GB). El fichero empaquetado cabría en VRAM, pero no hay motor que lo ejecute.
- **Despliegue:** llama.cpp (builds c212d25, f4f6f2e, 44d5087); conversión previa con `code/lb_dense.py`. No hay soporte documentado para vLLM, TGI, Ollama.
- **Latencia y throughput:** en A100 40 GB, prompt 5.111,32 tok/s y generación 48,13 tok/s; en A100 80 GB, prompt 5.991,70 tok/s y generación 55,77 tok/s. En CPU de 44 núcleos, el original bf16 rinde 78,90 tok/s de prompt y 3,23 tok/s de generación; el autor no reporta resultados del comprimido en CPU, pero espera el mismo rendimiento por tener las mismas formas y tamaño.
- **No hay ganancia de velocidad:** el autor confirma que la ruta densa no está comprimida y rinde igual que el original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (0,33 bpw) | 12B (comprimido) | no disponible | 23.279,5 | apache-2.0 | Hugging Face |
| `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` | 12B (comprimido) | no disponible | 1.911,4 | no disponible | Hugging Face |
| Original fine-tune (bf16) | 12B | no disponible | 86,5 | apache-2.0 (heredada) | Hugging Face |
| `google/gemma-4-12B-it` | 12B | no disponible | 86,27 (referencia) | apache-2.0 | Hugging Face |

Ninguna de las variantes comprimidas de la serie es utilizable como modelo de lenguaje según el propio autor.

## Limitaciones y advertencias

- **El modelo no funciona:** perplejidad 269 veces la del original y texto generado no utilizable; el autor lo declara explícitamente.
- **Nivel de azar en benchmarks de tarea** (HellaSwag, Winogrande).
- **No hay motor que ejecute el fichero empaquetado directamente:** la única ruta es convertir a denso, lo que elimina cualquier ventaja de tamaño o velocidad.
- **Sesgos:** no documentados; al no producir texto coherente, no son evaluables.
- **Riesgo de alucinación:** irrelevante en la práctica porque la salida no es texto utilizable, pero el modelo no debe desplegarse en producción bajo ningún concepto.
- **Idiomas:** no disponible; el modelo base soporta varios, pero la compresión destruye la distribución.
- **Licencia:** apache-2.0 según la model card; conviene verificar la licencia del modelo base de Google para usos derivados.
- **Advertencia de producción:** no usar en producción, ni en demos, ni como base para fine-tune adicional. Es un artefacto de investigación.
- **Perplejidad como métrica engañosa:** el autor advierte que en este modelo la perplejidad puede bajar por ruido de cuantización; deben leerse KL y concordancia top-1 junto a ella.

## Enlaces

- Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.33bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset de fine-tune: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset de fine-tune: https://huggingface.co/datasets/victor/fable-5-boeing-747-trace
- Dataset de fine-tune: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Variante de la serie: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
- llama.cpp: https://github.com/ggml-org/llama.cpp
