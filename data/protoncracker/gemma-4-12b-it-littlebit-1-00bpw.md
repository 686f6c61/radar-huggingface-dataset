# protoncracker/gemma-4-12b-it-littlebit-1.00bpw

## Resumen

`protoncracker/gemma-4-12b-it-littlebit-1.00bpw` es un artefacto de investigación publicado en Hugging Face que contiene una compresión extrema a 1,00 bits por peso (bpw) del modelo `google/gemma-4-12B-it`, aplicando la técnica LittleBit-2 con factorización por bloques. El autor, protoncracker, lo publica explícitamente como un experimento y advierte que el modelo comprimido no produce texto utilizable. No se trata de un modelo afinado ni de una variante funcional, sino de una medición reproducible del límite práctico de la cuantización binaria sobre un transformer de 12.000 millones de parámetros.

El resultado es contundente: la perplejidad en texto de validación se multiplica por 64,9 respecto al original (18.248,2 frente a 281,2), la concordancia top-1 con el token más probable del original cae al 24,6 % y la divergencia KL alcanza 5,76 nats por token. En los benchmarks de tarea (HellaSwag y Winogrande) el modelo queda al nivel del azar, lo que confirma que la información semántica se ha destruido durante la compresión.

La relevancia del artefacto es metodológica: documenta con detalle el proceso de conversión a checkpoint denso, la evaluación en llama.cpp y la comparación con cuantizaciones convencionales (Q8_0, Q4_K_M) del mismo modelo base, mostrando que Gemma 4 12B-it es especialmente sensible al ruido de cuantización. El repositorio ocupa 4,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de google/gemma-4-12B-it), con pesos factorizados en binario por bloques (LittleBit-2) |
| Parametros totales | 12.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 1,00 bpw con factorizacion binaria por bloques; el checkpoint denso resultante se empaqueta en GGUF Q4_0 y Q6_K para la tabla de embeddings |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint denso empaquetado) y GGUF (Q4_0 / Q6_K para embeddings) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it` sin ningún ajuste fino adicional. Sobre ese checkpoint se aplica LittleBit-2, un esquema de factorización de pesos en binario por bloques que reduce cada matriz a aproximadamente un bit por peso. El autor indica que el archivo empaquetado no puede ejecutarse directamente en ningún motor: para evaluarlo se convierte a un checkpoint denso (`code/lb_dense.py`) y luego a GGUF, de modo que el modelo resultante vuelve a tener matrices ordinarias del tamaño del original (23,83 GB en bf16).

No se documentan en la información disponible los datos de entrenamiento, el número de tokens, ni procesos de RLHF o DPO. La model card se centra en la medición del daño introducido por la compresión: el error relativo del estado oculto es de 0,157 tras el bloque 0 y de 0,396 tras el bloque 47, con un mínimo de 0,056 tras el bloque 15 y un máximo de 0,522 tras el bloque 46. El autor incluye además una comparación con cuantizaciones convencionales del original en llama.cpp (Q8_0: perplejidad 292,66, KL 0,188, concordancia 0,876; Q4_K_M: perplejidad 305,94, KL 1,092, concordancia 0,647), lo que sirve como referencia del ruido de cuantización tolerable.

## Capacidades

- No produce texto utilizable: la propia model card lo declara explícitamente como artefacto de investigación, no como modelo funcional.
- Concordancia top-1 con el token más probable del original del 24,6 % en la evaluación con embeddings sin cuantizar, y del 24,7 % / 24,3 % con embeddings Q4_0 / Q6_K.
- HellaSwag al nivel del azar (26,0 %, intervalo 95 % de 21,9 a 30,5 frente a un azar del 25 %).
- Winogrande al nivel del azar (49,2 % ± 2,2 frente a un azar del 50 %).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo en la información disponible.
- Sirve como referencia reproducible para estudiar los límites de la cuantización binaria y el impacto del ruido en modelos de 12B.

## Casos de uso

- Investigación sobre límites de cuantización: el artefacto permite reproducir la medición de perplejidad, KL y concordancia top-1 a 1,00 bpw y compararla con Q8_0 y Q4_K_M del mismo modelo base, usando los scripts y el GGUF incluidos.
- Estudio de sensibilidad al ruido por modelo: la model card documenta que Gemma 4 12B-it es inusualmente sensible a la cuantización, lo que convierte este checkpoint en un caso de referencia para calibrar esquemas de compresión en otros transformers de tamaño similar.
- Análisis de propagación de error por capas: el archivo `blocks.jsonl` con el error relativo del estado oculto tras cada bloque permite estudiar cómo se acumula el daño a lo largo de la red y qué profundidades son más críticas.
- Validación de pipelines de conversión: el flujo `lb_dense.py` → GGUF → llama.cpp sirve como prueba de extremo a extremo para verificar herramientas de conversión y evaluación en entornos de investigación.
- Docencia y divulgación: útil para explicar de forma cuantitativa por qué la cuantización agresiva destruye la capacidad lingüística, con cifras concretas de perplejidad, KL y benchmarks de tarea.
- Referencia negativa en selección de modelos: permite descartar configuraciones de compresión por debajo de cierto umbral bpw al comparar contra alternativas de la misma serie con menor perplejidad (por ejemplo, la variante de 0,55 bpw con perplejidad 1.911,4).

## Benchmarks y rendimiento

| Modelo / configuracion | Perplejidad (held-out) | KL al original (nats/token) | Top-1 agreement | HellaSwag acc_norm | Winogrande |
|---|---|---|---|---|---|
| Este modelo, Q6_K (GGUF denso) | 18.053,5 | 5,7633 | 0,2433 | 26,0 % (21,9–30,5) | 49,2 % ± 2,2 |
| Este modelo, Q4_0 (GGUF denso) | 16.658,9 | 5,7164 | 0,2471 | no disponible | no disponible |
| Original bf16 (GGUF) | 281,28 | 0 | 1 | 51,2 % (46,4–56,1) | 57,0 % ± 2,2 |
| Original Q8_0 | 292,66 | 0,188 | 0,876 | 53,2 % (48,4–58,1) | 54,6 % ± 2,2 |
| Original Q4_K_M | 305,94 | 1,092 | 0,647 | 50,0 % (45,1–54,9) | 56,6 % ± 2,2 |
| Azar | — | — | — | 25 % | 50 % |

Medición con llama.cpp build 44d5087 (2026-11-22) sobre 32 filas de validación de 1.024 tokens. En la primera tabla de la model card, con embeddings sin cuantizar, la perplejidad del modelo comprimido es 18.248,2 frente a 281,2 del original (ratio 64,9), con pérdida de siguiente token de 9,8118 frente a 5,6389.

Rendimiento en motor (A100 80 GB, llama.cpp 44d5087):

| Archivo | GGUF denso | Archivo empaquetado | Prompt tok/s (pp512) | Generación tok/s (tg128) |
|---|---|---|---|---|
| q4_0 | 23,83 GB | 1,93 GB | 5.924,54 | 55,76 |
| q6_k | 23,83 GB | 2,19 GB | 5.344,32 | 55,79 |
| Original bf16 | 23,83 GB | — | 5.868,30 | 55,72 |

El autor subraya que la ruta densa no aporta ninguna ventaja de tamaño ni de velocidad: el GGUF resultante pesa lo mismo que el original y rinde igual dentro del margen de error, porque cada peso vuelve a ser una matriz ordinaria.

## Requisitos de hardware

- VRAM para inferencia del archivo empaquetado: no disponible; no existe motor que ejecute el archivo de 1,93–2,19 GB directamente.
- VRAM para la ruta densa: equivalente al modelo original en bf16, aproximadamente 24 GB de pesos más overhead de contexto y activaciones; el GGUF denso medido ocupa 23,83 GB.
- GPU recomendadas para la ruta densa: A100 80 GB (medida por el autor), H100 80 GB, o GPUs consumer con 24 GB o más (RTX 3090, RTX 4090) si se ajusta el contexto.
- No cabe en GPUs consumer de 8–16 GB en la ruta densa sin cuantización adicional del propio GGUF.
- Despliegue: llama.cpp (build 44d5087 o posterior) para el GGUF denso; el archivo empaquetado no es ejecutable en vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput medidos en A100 80 GB: 5.924,54 tok/s de prompt y 55,76 tok/s de generación para el archivo Q4_0; 5.344,32 tok/s de prompt y 55,79 tok/s de generación para el Q6_K; cifras equivalentes a las del original bf16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (1,00 bpw LittleBit-2) | 12B | no disponible | 18.248,2 (embeddings sin cuantizar) / 18.053,5 (Q6_K) | Apache 2.0 | Hugging Face, 4,1 GB |
| `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` | 12B | no disponible | 1.911,4 | no disponible en la información | Hugging Face (referenciado por el autor) |
| `google/gemma-4-12B-it` original bf16 | 12B | no disponible | 281,28 | Gemma (no confirmada en la información) | Hugging Face |
| `google/gemma-4-12B-it` Q4_K_M | 12B | no disponible | 305,94 | Gemma (no confirmada en la información) | GGUF vía llama.cpp |

La comparación relevante es interna a la serie de experimentos del propio autor: la variante de 0,55 bpw con canal presenta una perplejidad 64 veces menor que esta, aunque sigue sin ser utilizable como modelo de lenguaje. Frente al original y a sus cuantizaciones estándar, este artefacto se sitúa dos órdenes de magnitud por encima en perplejidad y en KL.

## Limitaciones y advertencias

- El modelo no funciona como modelo de lenguaje: la model card lo declara explícitamente no utilizable para generar texto.
- Perplejidad 64,9 veces la del original y concordancia top-1 del 24,6 %, lo que indica destrucción de la distribución de salida.
- Rendimiento al nivel del azar en HellaSwag (26,0 %) y Winogrande (49,2 %), por lo que no es válido para ninguna tarea de evaluación estándar.
- El archivo empaquetado no se puede ejecutar en ningún motor conocido; requiere conversión a checkpoint denso, que recupera el tamaño del original y elimina cualquier ventaja de compresión.
- La licencia del artefacto es Apache 2.0, pero el modelo base `google/gemma-4-12B-it` puede estar sujeto a los términos de Gemma; conviene verificar la licencia del base antes de cualquier uso derivado.
- No se documentan sesgos, idiomas soportados ni comportamiento multilingüe; al no producir texto coherente, estas consideraciones no son aplicables en la práctica.
- Riesgo de interpretación errónea: la perplejidad puede caer bajo el ruido de cuantización en este texto, por lo que el autor recomienda leer siempre KL y concordancia top-1 junto a la perplejidad.
- No debe emplearse en producción, en pipelines de CI/CD ni como sustituto del modelo original en ninguna aplicación real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-littlebit-1.00bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante de referencia de la serie (0,55 bpw): https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
- llama.cpp (build 44d5087, 2026-11-22): no disponible como enlace directo en la información proporcionada
- Paper de LittleBit-2: no disponible en la información proporcionada
- Repositorio con `code/lb_dense.py` y `blocks.jsonl`: no disponible como enlace directo en la información proporcionada
