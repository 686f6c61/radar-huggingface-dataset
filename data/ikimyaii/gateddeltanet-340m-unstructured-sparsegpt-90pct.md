# ikimyaii/GatedDeltaNet-340M-unstructured-SparseGPT-90pct

## Resumen

GatedDeltaNet-340M-unstructured-SparseGPT-90pct es un modelo de lenguaje derivado de m-a-p/340M-20B-GatedDeltaNet-pure-baseline, publicado por el usuario ikimyaii en Hugging Face. Se trata de un ejercicio de poda (pruning) one-shot aplicado con el codigo oficial de SparseGPT sobre un transformer de tipo Gated DeltaNet de aproximadamente 400 millones de parametros, con el objetivo de alcanzar un 90% de esparsidad no estructurada sin reentrenamiento posterior.

El modelo no es un modelo de proposito general listo para produccion, sino una linea base experimental para comparar metodos de poda y esparsidad. La model card es explicita al respecto: sirve como referencia frente a los modelos EHWS del mismo autor. La poda se aplico a todas las capas lineales dentro de los bloques, manteniendo densos los embeddings y la cabeza de salida (lm_head).

Su relevancia es metodologica: documenta de forma cuantitativa el coste en calidad de aplicar SparseGPT al 90% sobre una arquitectura Gated DeltaNet, con resultados de perplejidad y evaluacion zero-shot que evidencian una degradacion severa. Es util para investigadores que estudien limites de compresion extrema y para quienes necesiten un punto de comparacion reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet (transformer con atencion lineal de tipo delta) |
| Parametros totales | 399.531.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un Gated DeltaNet de 340M de parametros entrenado sobre 20B tokens (segun el identificador del modelo base, m-a-p/340M-20B-GatedDeltaNet-pure-baseline). La arquitectura Gated DeltaNet sustituye la atencion cuadratica clasica por un mecanismo de atencion lineal con compuertas y actualizacion de tipo delta, orientado a contextos largos con coste lineal. El modelo resultante conserva esa topologia y anade una mascara de esparsidad no estructurada.

La poda se realizo con el codigo oficial de SparseGPT (IST-DASLab/sparsegpt, commit 147d215) en modo `fasterprune`, con blocksize 128 y damping 0.01, en una unica pasada y sin reentrenamiento. La calibracion uso 128 secuencias de C4 de 2.048 tokens con semilla 0, y los bloques se podaron en orden, calibrando cada uno sobre las salidas de los bloques ya podados. Los pesos se podaron en bfloat16 y el proceso completo tardo 2,5 minutos en una A100 de 40 GB. La mascara aplica un umbral por bloque de 128 columnas, por lo que las filas acaban con distinto numero de valores no nulos: en las 240 capas podadas, la fila mas densa tiene de media 2,84 veces los no nulos de la fila media, y en la peor capa hasta 7,14 veces. La esparsidad medida sobre los pesos finales es de 0,9000.

## Capacidades

- Generacion de texto autoregresiva propia del modelo base, aunque fuertemente degradada por la poda.
- Razonamiento y conocimiento factual limitados: la evaluacion zero-shot cae de 0,4373 a 0,3178 de media.
- Capacidad multilingue: no documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Requiere `flash-linear-attention` instalado (`import fla`) y carga mediante `AutoModelForCausalLM.from_pretrained(...)`.

## Casos de uso

- Linea base de investigacion en poda: sirve para comparar tecnicas de esparsidad no estructurada (SparseGPT, Wanda, metodos con reentrenamiento) sobre una arquitectura Gated DeltaNet, usando sus cifras de perplejidad y zero-shot como referencia.
- Estudio de degradacion por compresion extrema: permite analizar como afecta un 90% de esparsidad no estructurada a tareas de sentido comun (hellaswag, winogrande) frente a tareas de conocimiento (arc_easy, boolq).
- Analisis de desbalanceo de filas: util para investigar el impacto del umbral por bloque de 128 columnas en la distribucion de no nulos por fila.
- Reproducibilidad de experimentos: el metodo esta documentado con commit, semilla y parametros, lo que facilita replicar el pipeline en otros modelos.
- Docencia y divulgacion: ejemplo practico de poda one-shot con SparseGPT y de sus limites cuando no hay reentrenamiento.
- Investigacion sobre atencion lineal: permite comparar el comportamiento de Gated DeltaNet bajo esparsidad frente a transformers clasicos podados con el mismo metodo.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (WikiText-2 y C4, fp16):

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Denso (base) | 16,42 | 19,94 |
| Este modelo | 1995,87 | 1194,73 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Denso | Este modelo |
|---|---|---|
| arc_challenge | 0,2645 | 0,2159 |
| arc_easy | 0,6023 | 0,2677 |
| boolq | 0,5985 | 0,3789 |
| hellaswag | 0,3461 | 0,2580 |
| openbookqa | 0,2300 | 0,1420 |
| rte | 0,5162 | 0,4693 |
| winogrande | 0,5036 | 0,4925 |
| Media | 0,4373 | 0,3178 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 0,8 GB para los pesos (399,5M de parametros), mas memoria para activaciones y cache.
- La poda se realizo en una A100 de 40 GB, pero el modelo final es mucho mas pequeno y no requiere ese hardware.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM deberia poder cargarlo en bfloat16 o fp16.
- Opciones de despliegue: carga via `transformers` con `flash-linear-attention` instalado; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 399,5M | no disponible | 1995,87 | no disponible | Hugging Face |
| m-a-p/340M-20B-GatedDeltaNet-pure-baseline | ~340M | no disponible | 16,42 | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa directa con alternativas de poda equivalentes (por ejemplo, variantes Wanda o SparseGPT sobre transformers clasicos) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa de calidad: la perplejidad en WikiText-2 pasa de 16,42 a 1995,87 y en C4 de 19,94 a 1194,73.
- Caida acusada en tareas de conocimiento: arc_easy baja de 0,6023 a 0,2677 y boolq de 0,5985 a 0,3789.
- No apto para produccion: es una linea base experimental, no un modelo de uso general.
- Esparsidad no estructurada: requiere kernels o librerias que aprovechen la mascara; el ahorro real de computo no esta garantizado.
- Filas desbalanceadas: el umbral por bloque de 128 columnas genera hasta 7,14 veces mas no nulos en la peor fila respecto a la media.
- Licencia no especificada: no se puede confirmar el uso comercial.
- Idiomas y contexto no documentados.
- Riesgo de alucinacion elevado por la perdida de capacidad del modelo podado.
- Dependencia de `flash-linear-attention` para la carga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/GatedDeltaNet-340M-unstructured-SparseGPT-90pct
- Modelo base: https://huggingface.co/m-a-p/340M-20B-GatedDeltaNet-pure-baseline
- Codigo oficial de SparseGPT: https://github.com/IST-DASLab/sparsegpt (commit 147d215)
