# HoeioUser/vollie2

## Resumen

Vollie campaign 2 es un conjunto de dos ficheros GGUF publicados por el usuario HoeioUser como parte del proyecto Vollie, un experimento de inferencia de un LLM disperso (mixture-of-experts) sobre la CPU de un telefono de 2021, con cambios unicamente en el runtime. Los ficheros no son modelos nuevos entrenados desde cero, sino recuantizaciones de pesos publicados sin modificar: `olmoe-Mi.gguf` deriva de allenai/OLMoE-1B-7B-0125-Instruct y `granite-Mi.gguf` de ibm-granite/granite-4.0-h-tiny, ambos con licencia Apache-2.0.

El interes tecnico esta en la receta de cuantizacion mixta: tensores densos en Q4_0, tensores de expertos en Q3_K y cabeza de salida en Q6_K, generados con `llama-quantize` de llama.cpp (commit `620d2225c`) e informados por matrices de importancia de mradermacher. Cada fichero ronda los 3 GB, lo que permite ejecutar modelos MoE de ~7B parametros totales en hardware muy limitado a costa de una perdida de perplejidad acotada y medida.

La relevancia es acotada pero concreta: sirve como referencia reproducible de cuantizacion agresiva de MoE para entornos sin GPU, con hashes SHA-256 publicados y perplejidades comparadas contra F16/BF16. No hay model card detallada en Hugging Face, ni benchmarks de tareas, ni informacion sobre idiomas o pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) heredada de los modelos base: OLMoE-1B-7B y Granite 4.0 h-tiny |
| Parametros totales | no disponible en la informacion proporcionada (los modelos base son de ~7B en el caso de OLMoE) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la perplejidad se midio con contexto 512) |
| Tipos de cuantizacion | Mixta: tensores densos Q4_0, tensores de expertos Q3_K, cabeza de salida Q6_K |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

Detalle de ficheros:

| Fichero | Bytes | SHA-256 | Pesos de origen |
|---|---|---|---|
| `olmoe-Mi.gguf` | 3.072.399.552 | `5abf710b775cd64fd89d74a783c8a7056a409ba795cd401b9dd448ef8e444abb` | allenai/OLMoE-1B-7B-0125-Instruct (Apache-2.0), imatrix de mradermacher |
| `granite-Mi.gguf` | 3.161.269.344 | `8df94de731a08a377150e4fcc5dcbd16212a6d102bc0b628cdc905cba0bc0f45` | ibm-granite/granite-4.0-h-tiny (Apache-2.0), imatrix de mradermacher |

## Arquitectura y entrenamiento

No se ha entrenado ningun modelo nuevo: ambos GGUF son recuantizaciones de pesos publicados sin modificar. La arquitectura subyacente es la de los modelos base, ambos de tipo mixture-of-experts segun los tags del repositorio. OLMoE-1B-7B-0125-Instruct es un MoE con expertos enrutados por token; Granite 4.0 h-tiny pertenece a la familia Granite 4.0 hibrida de IBM. Los detalles exactos de capas, numero de expertos y datos de entrenamiento corresponden a las model cards de los modelos originales y no se reproducen aqui.

La innovacion tecnica de esta publicacion es la estrategia de cuantizacion diferenciada por tipo de tensor: se preserva mas precision en la cabeza de salida (Q6_K), se mantiene Q4_0 en las partes densas y se baja a Q3_K en los expertos, que son la mayor parte del peso. Se uso una matriz de importancia (imatrix) de mradermacher para guiar la cuantizacion y se construyo con `llama-quantize` del commit `620d2225c` de llama.cpp. Las perplejidades en wikitext-2 (contexto 512, todos los chunks, medidas en un portatil) son: OLMoE 11,7146 frente a 10,9420 en F16; Granite 9,2266 frente a 8,7816 en BF16.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados de los modelos base instruct (OLMoE-1B-7B-0125-Instruct esta ajustado para instrucciones).
- Ejecucion en CPU mediante llama.cpp, sin requisito de GPU.
- Inferencia de un MoE con solo una fraccion de parametros activos por token, lo que reduce el coste computacional por token frente a un denso del mismo tamano.
- Capacidades especificas de Granite 4.0 h-tiny (posible soporte de tool calling o hibrido) no verificadas en la informacion proporcionada.
- Soporte multilingue: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Inferencia en dispositivos sin GPU: desplegar un MoE de ~3 GB en un portatil o en la CPU de un telefono mediante llama.cpp, como demuestra el propio proyecto Vollie en un telefono de 2021.
- Prototipado offline y en el borde: usar los GGUF en entornos air-gapped o de bajo consumo donde no se puede instalar CUDA.
- Evaluacion de recetas de cuantizacion: comparar la perplejidad medida (11,7146 y 9,2266 en wikitext-2) con las versiones F16/BF16 para decidir si el ahorro de memoria compensa la perdida.
- Reproducibilidad de despliegues: los hashes SHA-256 publicados permiten verificar la integridad de los pesos en pipelines de distribucion.
- Educacion e investigacion: estudiar el comportamiento de un MoE cuantizado de forma mixta (Q4_0 denso, Q3_K expertos, Q6_K cabeza) frente a cuantizaciones uniformes.
- Base para ajustes posteriores en llama.cpp: partir de estos GGUF como referencia de linea base antes de aplicar LoRA o cambios de runtime.
- Pruebas de latencia en CPU: medir throughput de un MoE en hardware consumer o movil sin recurrir a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento es la perplejidad en wikitext-2 (contexto 512, todos los chunks, medida en un portatil):

| Modelo | Perplejidad GGUF cuantizado | Perplejidad referencia | Delta |
|---|---|---|---|
| OLMoE-1B-7B-0125-Instruct | 11,7146 | 10,9420 (F16) | +0,7726 |
| Granite 4.0 h-tiny | 9,2266 | 8,7816 (BF16) | +0,4450 |

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 3,1 GB para los pesos en disco; en inferencia por CPU se necesita RAM suficiente para los pesos mas el estado de inferencia. Para GPU, la VRAM necesaria es del orden de 3-4 GB segun el contexto y el backend.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede cargar los pesos; no hay datos de rendimiento en GPU en la informacion proporcionada.
- GPU consumer: cabe en tarjetas de gama media y baja con 4 GB o mas (por ejemplo, GTX 1650, RTX 3050). No se confirma compatibilidad con modelos concretos.
- Despliegue: llama.cpp (formato nativo GGUF, construido con el commit `620d2225c`); Ollama y otros runners compatibles con GGUF no se mencionan explicitamente.
- Latencia y throughput: no disponibles. El proyecto Vollie esta orientado a ejecucion en CPU de telefono, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vollie campaign 2 (olmoe-Mi.gguf) | MoE derivado de OLMoE-1B-7B (~7B totales) | no disponible | Apache-2.0 | GGUF (~3,07 GB) | Recuantizacion Q4_0/Q3_K/Q6_K, perplejidad 11,7146 |
| Vollie campaign 2 (granite-Mi.gguf) | MoE derivado de Granite 4.0 h-tiny | no disponible | Apache-2.0 | GGUF (~3,16 GB) | Recuantizacion Q4_0/Q3_K/Q6_K, perplejidad 9,2266 |
| allenai/OLMoE-1B-7B-0125-Instruct | MoE ~7B totales, ~1B activos | no disponible | Apache-2.0 | safetensors | Modelo base sin cuantizar; perplejidad F16 10,9420 |
| ibm-granite/granite-4.0-h-tiny | MoE hibrido | no disponible | Apache-2.0 | safetensors | Modelo base sin cuantizar; perplejidad BF16 8,7816 |

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitacion de los modelos base (sesgos, alucinacion, idiomas) se hereda sin cambios.
- La cuantizacion introduce degradacion medible: +0,7726 de perplejidad en OLMoE y +0,4450 en Granite respecto a F16/BF16 en wikitext-2; el impacto en tareas reales no se ha medido.
- Los tensores de expertos en Q3_K pueden degradar mas la calidad en dominios especializados (codigo, matematicas) que la perplejidad agregada sugiere.
- No hay informacion sobre idiomas soportados ni sobre rendimiento multilingue.
- No se publican benchmarks de tareas, evaluaciones de seguridad ni datos de sesgo.
- Repositorio sin descargas ni likes y con model card minima; el mantenimiento y soporte no estan garantizados.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones de los modelos base y de la imatrix utilizada.
- Requiere llama.cpp en una version compatible con el commit de construccion; otros runners pueden no interpretar la cuantizacion mixta correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HoeioUser/vollie2
- Proyecto Vollie en GitHub: https://github.com/hoeio/vollie
- Modelo base OLMoE: https://huggingface.co/allenai/OLMoE-1B-7B-0125-Instruct
- Modelo base Granite: https://huggingface.co/ibm-granite/granite-4.0-h-tiny
- llama.cpp: https://github.com/ggml-org/llama.cpp
