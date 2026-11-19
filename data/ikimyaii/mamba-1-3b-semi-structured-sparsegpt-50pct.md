# ikimyaii/Mamba-1.3B-semi-structured-SparseGPT-50pct

## Resumen

Mamba-1.3B-semi-structured-SparseGPT-50pct es una variante podada del modelo de espacio de estados `fla-hub/mamba-1.3B-100B`, publicada por el usuario `ikimyaii` en Hugging Face. Se trata de un experimento de compresion one-shot (sin reentrenamiento) que aplica SparseGPT con una modificacion propia de la mascara de poda: dentro de cada bloque de 128 columnas, cada fila elimina el mismo numero de entradas de menor magnitud segun la regla `w^2 / [H^-1]_jj^2`, garantizando que todas las filas tengan identico numero de valores no nulos. El resultado es una red con una dispersion medida de 0,4900 sobre las capas podadas, equilibrada fila a fila.

El modelo no es una version oficial de SparseGPT: el autor lo describe explicitamente como una linea base para sus propios modelos EHWS. La poda afecta a las capas lineales internas de cada bloque Mamba (`in_proj`, `x_proj`, `out_proj`), mientras que `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y `lm_head` permanecen densos. La relevancia actual es metodologica: aporta un punto de referencia reproducible para evaluar tecnicas de poda semi-estructurada sobre arquitecturas SSM, un terreno mucho menos explorado que el de los transformers.

La ficha se basa exclusivamente en la model card y en los metadatos disponibles. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se declara licencia, idiomas ni pipeline, por lo que muchas especificaciones habituales figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM) |
| Parametros totales | 1.334.740.992 (1,33 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | fla-hub/mamba-1.3B-100B |
| Dispersion | 0,4900 medida sobre las capas podadas; 50% semi-estructurada por bloque de 128 columnas |
| Tamano del repositorio | 2,7 GB |
| Requisito de carga | `flash-linear-attention` instalado (`import fla`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo en el que las capas de atencion se sustituyen por bloques SSM con parametros dependientes de la entrada (`in_proj`, `x_proj`, `dt_proj`, `A_log`, `D`) y una convolucion causal (`conv1d`). El modelo base `fla-hub/mamba-1.3B-100B` fue entrenado sobre 100.000 millones de tokens segun la nomenclatura del identificador; el autor de esta variante no aporta detalles adicionales sobre la composicion del dataset ni sobre si hubo RLHF o DPO.

El proceso de poda es one-shot, sin reentrenamiento posterior. Se usa el cargador oficial de SparseGPT con 128 secuencias de calibracion de C4 de 2.048 tokens y semilla 0, y los bloques se podan en orden, calibrando cada uno sobre las salidas de los bloques ya podados. La innovacion respecto al SparseGPT publicado es la mascara: en lugar del criterio N:M estandar, dentro de cada bloque de 128 columnas cada fila poda el mismo numero de entradas de menor `w^2 / [H^-1]_jj^2`, de modo que todas las filas acaban con identica cantidad de no nulos (la misma restriccion que EHWS), lo que equilibra perfectamente el trabajo por fila en hardware. La poda se ejecuto en bfloat16 (Mamba desborda en fp16) y tardo 5,3 minutos en una A100 de 40 GB. Se verifico el equilibrio por fila en las 192 capas podadas.

## Capacidades

- Generacion de texto autoregresiva como modelo de lenguaje causal, heredada del modelo base Mamba-1.3B.
- Modelado de secuencias largas mediante estado recurrente, sin mecanismo de atencion cuadratica.
- Inferencia con requisito de la libreria `flash-linear-attention`; carga mediante `AutoModelForCausalLM.from_pretrained(...)`.
- Poda semi-estructurada con equilibrio perfecto de no nulos por fila, pensada para kernels dispersos con carga balanceada.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Linea base de investigacion en poda de SSM: sirve para comparar tecnicas de poda semi-estructurada (por ejemplo, EHWS) contra un punto de referencia SparseGPT con restriccion por fila, usando las perplejidades y tareas zero-shot ya publicadas.
- Estudio de degradacion por compresion: con perplejidad en WikiText-2 de 10,03 a 12,47 y en C4 de 14,12 a 17,51, permite cuantificar el coste de eliminar el 50% de los pesos en capas lineales de un Mamba.
- Desarrollo de kernels dispersos balanceados: al tener todas las filas el mismo numero de no nulos, es un banco de pruebas idoneo para validar kernels 2:4 o por bloque que asumen carga uniforme.
- Evaluacion de robustez en tareas de sentido comun y lectura: las tareas de lm-evaluation-harness (arc, hellaswag, boolq, rte, winogrande) ofrecen un perfil de degradacion util para decidir que capas conviene mantener densas.
- Prototipado de inferencia eficiente en SSM: al reducir el numero de operaciones en las capas lineales podadas, sirve para medir el impacto real de la dispersion en latencia y memoria en comparacion con el modelo denso.
- Reproducibilidad metodologica: el autor documenta calibracion, semilla, hardware y tiempo de poda, lo que permite replicar el experimento y auditar la mascara aplicada.

## Benchmarks y rendimiento

Perplejidad con el protocolo de evaluacion de ELSA (conjuntos de test WikiText-2 y C4, formula propia), en bfloat16:

| Modelo | WikiText-2 | C4 |
|---|---|---|
| Dense (base) | 10,03 | 14,12 |
| Este modelo (50% sparsity) | 12,47 | 17,51 |

Precision zero-shot con lm-evaluation-harness:

| Tarea | Dense | Este modelo |
|---|---|---|
| arc_challenge | 0,2329 | 0,2270 |
| arc_easy | 0,5644 | 0,5370 |
| boolq | 0,6040 | 0,6067 |
| hellaswag | 0,3898 | 0,3590 |
| openbookqa | 0,1980 | 0,2020 |
| rte | 0,5343 | 0,5235 |
| winogrande | 0,5217 | 0,5241 |
| Media | 0,4350 | 0,4256 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,7 GB en bfloat16; en fp16/bf16 se necesita aproximadamente esa cifra mas overhead de activaciones y estado, por lo que cabe holgadamente en GPUs de 8 GB o mas.
- GPU recomendadas: cualquier GPU con soporte de bfloat16; el autor uso una A100 de 40 GB para la poda, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, 4060, 4070, 4080 y 4090 con al menos 8 GB de VRAM.
- Opciones de despliegue: carga mediante `AutoModelForCausalLM.from_pretrained` con `flash-linear-attention` instalado; el autor no documenta integracion con vLLM, llama.cpp, Ollama o TGI, por lo que su disponibilidad en esos motores figura como no disponible.
- Latencia y throughput: no disponibles. El autor solo reporta el tiempo de poda (5,3 minutos en una A100 de 40 GB), no metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dispersion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo | 1,33 mil millones | no disponible | 50% semi-estructurada (0,4900 medida) | no disponible | Hugging Face, 0 descargas |
| fla-hub/mamba-1.3B-100B (base denso) | 1,33 mil millones | no disponible | ninguna (denso) | no disponible | Hugging Face |
| Modelos EHWS del mismo autor | no disponible | no disponible | semi-estructurada con restriccion por fila | no disponible | Hugging Face (referenciados en la model card) |

No se dispone de datos de benchmarks de los modelos EHWS ni de otros Mamba podados comparables en la informacion proporcionada, por lo que la comparativa de rendimiento se limita al contraste con el modelo denso de origen.

## Limitaciones y advertencias

- La poda one-shot sin reentrenamiento degrada la calidad: la perplejidad sube de 10,03 a 12,47 en WikiText-2 y de 14,12 a 17,51 en C4, y la media zero-shot cae de 0,4350 a 0,4256.
- No es la implementacion oficial de SparseGPT: la mascara ha sido modificada por el autor, por lo que los resultados no son directamente comparables con los del paper original.
- Licencia no declarada: no hay garantia explicita de uso comercial; conviene contactar con el autor o con el titular del modelo base antes de un despliegue en produccion.
- Idiomas soportados no documentados: el modelo base se entreno presumiblemente sobre corpus mayoritariamente ingles (C4 para calibracion), lo que limita el uso en castellano.
- Longitud de contexto no documentada: aunque Mamba admite secuencias largas, no se especifica el contexto de entrenamiento ni el comportamiento mas alla de el.
- Riesgo de alucinacion y sesgos: no evaluados en la model card; el modelo base puede heredar sesgos de su corpus de entrenamiento.
- Repositorio con 0 descargas y 0 likes: sin validacion externa de la comunidad, y creado en 2026-11-19, por lo que su mantenimiento futuro es incierto.
- Requiere `flash-linear-attention` para cargarse; sin esa dependencia la carga con `AutoModelForCausalLM` puede fallar.
- Mamba desborda en fp16 segun el autor, lo que obliga a usar bfloat16 en la evaluacion y restringe el hardware compatible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-1.3B-semi-structured-SparseGPT-50pct
- Modelo base: https://huggingface.co/fla-hub/mamba-1.3B-100B
- Libreria flash-linear-attention (requerida para la carga): no disponible en la informacion proporcionada
- Paper de SparseGPT: no disponible en la informacion proporcionada
- Paper de Mamba: no disponible en la informacion proporcionada
- Repositorio del autor con los modelos EHWS: no disponible en la informacion proporcionada
