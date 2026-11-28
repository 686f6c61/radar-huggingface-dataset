# Nondual-Observer/Qwen3.5-0.8B-SGNE-CC

## Resumen

Qwen3.5-0.8B-SGNE-CC es un checkpoint derivado de Qwen/Qwen3.5-0.8B, el modelo denso de 0,8 mil millones de parametros de la familia Qwen 3.5, publicado por el autor independiente Igor M. Zhuk (Nondual-Observer). No se trata de un fine-tuning convencional: el autor aplica una edicion directa en el espacio de pesos denominada SGNE-CC (Spherical Gated Norm-preserving Edit, Column-Constrained), enmarcada en su estudio "DNA Weight Editing". El resultado es un checkpoint BF16 listo para ejecutar mas un parche de pesos de 3,13 MiB (`sgne_cc_dna_delta.npz`) que puede aplicarse o auditarse por separado.

La relevancia del modelo es metodologica mas que de rendimiento bruto: el autor sostiene que buena parte de las mejoras atribuidas a ediciones de pesos previas (concretamente MIT-p50c) desaparecen al eliminar el muestreo aleatorio y la penalizacion de presencia, y presenta SGNE-CC como una alternativa que conserva las normas de columna dentro del redondeo BF16 y supera a MIT-p50c en las cinco suites evaluadas bajo decodificacion greedy. El checkpoint mantiene la arquitectura original de Qwen3.5 (transformer hibrido con capas GatedDeltaNet recurrentes y atencion) y hereda su ventana de contexto, sus capacidades multimodales de entrada imagen-texto y su soporte para ocho idiomas.

El modelo esta pensado para desarrolladores e investigadores que quieran reproducir el experimento, auditar la geometria del parche o desplegar el checkpoint en motores estandar (Transformers, vLLM, SGLang) sin cambios en el codigo de inferencia. Con 873.438.784 parametros reales y licencia Apache-2.0, es un candidato ligero para experimentacion en CPU/GPU de consumo y para estudiar tecnicas de programacion en el espacio de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido Qwen3.5 con capas de atencion y capas recurrentes GatedDeltaNet |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (limite usado en la evaluacion; el checkpoint se sirve con `--max-model-len 32768`) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el checkpoint se distribuye en BF16; el autor cita replicacion independiente en `llama.cpp`, lo que implica soporte de cuantizacion GGUF, pero sin detallar tipos) |
| Idiomas soportados | Ingles, chino, ruso, aleman, espanol, frances, japones, arabe |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (BF16, `model.safetensors`) + parche `sgne_cc_dna_delta.npz` (3,13 MiB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer hibrido que combina capas de atencion con capas recurrentes GatedDeltaNet (atencion lineal con compuerta), segun indican las etiquetas y la descripcion del parche. No hay informacion sobre el numero de tokens de entrenamiento original, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo base; esos datos corresponden a la model card de Qwen y no se reproducen aqui.

La innovacion de esta variante es el metodo SGNE-CC, una edicion de pesos aplicada sobre dos matrices feed-forward (capas 15 y 19, indices base cero) y sobre una fila de compuerta recurrente (fila 12 de la capa 16). El parche modifica 2.032.640 escalares (0,270% de los pesos de texto; 1.993.382 bits cambiados en BF16) repartidos en 802 columnas de `mlp.down_proj` en 15 capas feed-forward y 1.182 columnas de `linear_attn.out_proj` en 9 capas GatedDeltaNet; las capas de atencion quedan intactas. El autor verifica tres propiedades: normas de columna preservadas dentro del redondeo BF16 (desviacion maxima del 0,1625%, ratio en [0,998375, 1,001620], angulo de rotacion mediano de 8,8 grados y maximo de 93,7 grados), energia del primer modo singular del 67,58% (capa 15), 73,43% (capa 19) y 55,92% (capa 23), y un unico desplazamiento de fila de compuerta recurrente (1 de 288, coseno 0,986582). El autor no documenta entrenamiento adicional con datos: se trata de una intervencion sobre los pesos del modelo base.

## Capacidades

- Generacion de texto y conversacion multi-turno, con el mismo pipeline `text-generation` que el modelo base.
- Razonamiento matematico: el autor reporta 43,00% en MATH-500 (215/500) bajo decodificacion greedy, frente al 0,00% del base y el 5,00% de MIT-p50c en el mismo regimen.
- Razonamiento logico y de sentido comun: evaluado en BBH-160 dentro de la matriz de cinco suites.
- Generacion de codigo: evaluado en HumanEval-164 dentro de la misma matriz.
- Entrada imagen-texto: la etiqueta `image-text-to-text` indica soporte multimodal de entrada heredado de Qwen3.5.
- Capacidades multilingues en ocho idiomas (en, zh, ru, de, es, fr, ja, ar).
- Compatibilidad con endpoints (`endpoints_compatible`) para despliegue como servicio.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion proporcionada.

## Casos de uso

- Reproduccion y auditoria del experimento: cargar el checkpoint BF16 o aplicar `apply_dna_patch.py --verify-only` para comprobar SHA-256 y la geometria de pesos en FP64 contra Qwen/Qwen3.5-0.8B oficial, sin necesidad de GPU dedicada.
- Investigacion en programacion del espacio de pesos: usar el parche de 3,13 MiB como caso de estudio reproducible de edicion de pesos con preservacion de normas, comparandolo con MIT-p50c en las cinco suites.
- Evaluacion de robustez ante decodificacion: comparar el comportamiento del modelo bajo greedy (`T = 0, pp = 0`) y bajo ajustes de model card (`T = 0,6, pp = 1,5`) para medir cuanto del rendimiento depende del muestreo.
- Prototipado de razonamiento matematico en entornos con recursos limitados: con 873 millones de parametros y contexto de 32.768 tokens, cabe en una sola GPU de consumo para iterar sobre pipelines de MATH-500 o problemas aritmeticos.
- Servicio de generacion de texto ligero: `vllm serve Nondual-Observer/Qwen3.5-0.8B-SGNE-CC --language-model-only --max-model-len 32768` permite exponer el modelo como endpoint compatible con la API de OpenAI para pruebas de integracion.
- Experimentos multilingues de bajo coste: cubre ocho idiomas y permite evaluar tecnicas de edicion de pesos sobre un modelo pequeno antes de escalar a variantes mayores.
- Docencia y formacion: el parche minusculo y el verificador offline en CPU facilitan explicar en clase como se modifica un transformer a nivel de pesos y como se valida el cambio.

## Benchmarks y rendimiento

Datos de la model card, PyTorch BF16 con limite de 32.768 tokens nuevos:

| Benchmark y regimen | Qwen3.5-0.8B | MIT-p50c | SGNE-CC (este modelo) |
|---|---|---|---|
| Desviacion maxima de norma de columna (BF16) | 0,0000% | +114,2614% | 0,1625% |
| MATH-500 (500) — greedy (`T = 0, pp = 0`) | 0,00% (100% cutoffs) | 5,00% (25/500, 95,0% cutoffs) | 43,00% (215/500, 18,4% cutoffs) |
| MATH-500 — ajustes de model card (`T = 0,6, pp = 1,5`) | No disponible en el extracto | 51,80% (259/500) | No disponible en el extracto |
| BBH-160 — greedy | No disponible en el extracto | Inferior a SGNE-CC | Mejor de los tres (segun el autor) |
| HumanEval-164 — greedy | No disponible en el extracto | Inferior a SGNE-CC | Mejor de los tres (segun el autor) |

El autor afirma que SGNE-CC supera a MIT-p50c en las 5 de 5 suites bajo decodificacion greedy, y que MIT-p50c cae de 259/500 (51,80%) a 25/500 (5,00%) en MATH-500 al eliminar muestreo y penalizacion de presencia. Las cifras completas de BBH-160, HumanEval-164 y las dos suites restantes no aparecen en el extracto proporcionado; no se inventan aqui.

## Requisitos de hardware

- VRAM estimada: en BF16, unos 1,75 GB solo para pesos (873,4 M de parametros x 2 bytes), mas overhead de activaciones y cache KV para 32.768 tokens; en la practica, entre 3 y 6 GB segun lote y longitud de contexto.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); en centro de datos, A100 o H100 sobran para este tamano y permiten lotes grandes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 8 GB o mas; tambien es viable en CPU para el verificador offline (`apply_dna_patch.py --verify-only`).
- Opciones de despliegue: Transformers (`AutoModelForCausalLM`), vLLM (`vllm serve ... --language-model-only --max-model-len 32768`), SGLang, y replicacion independiente en `llama.cpp` documentada por Dave Uhlemann (DOI 10.5281/zenodo.24420522).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 greedy | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-SGNE-CC | 873,4 M | 32.768 | 43,00% | Apache-2.0 | Hugging Face + parche NPZ |
| Qwen/Qwen3.5-0.8B (base) | 873,4 M (aprox.) | 32.768 (usado en la evaluacion) | 0,00% | Apache-2.0 (segun el modelo base) | Hugging Face |
| MIT-p50c (edicion de pesos sobre el mismo base) | 873,4 M (aprox.) | 32.768 (usado en la evaluacion) | 5,00% | No disponible | Referenciado en el estudio del autor |
| DeepSeek-R1-Distill-Qwen-1.5B-SGNE-CC-v2 | 1,5 B (aprox.) | No disponible | No disponible | No disponible | Hugging Face (follow-up del autor) |

La comparativa se limita a variantes del mismo modelo base y al follow-up del autor; no se dispone de datos de benchmarks de alternativas de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es una edicion de pesos sobre un base de 0,8 B; su rendimiento absoluto en tareas abiertas sera limitado en comparacion con modelos de mayor tamano, aunque las cifras de MATH-500 greedy sean llamativas.
- Los resultados de benchmarks proceden del propio autor y de su marco teorico (DOT); no se ha localizado una evaluacion independiente de las cifras de MATH-500, BBH-160 o HumanEval-164 en la informacion disponible.
- El checkpoint esta pensado para decodificacion greedy (`T = 0, pp = 0`); el autor advierte que parte de las mejoras de metodos previos desaparecen al cambiar el regimen de muestreo, por lo que el comportamiento en produccion con temperatura puede diferir.
- Riesgo de alucinacion y sesgos: no documentados especificamente para esta variante; hereda los del modelo base Qwen3.5-0.8B, que no se detallan en la informacion proporcionada.
- Limitaciones de idioma: aunque la model card declara ocho idiomas, no se aportan evaluaciones por idioma; el espanol figura en la lista pero sin metricas.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del parche en dominios sensibles; conviene auditar el parche con `apply_dna_patch.py --verify-only` antes de desplegarlo.
- El modelo tiene 195 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria muy limitada.
- La model card mezcla afirmaciones tecnicas con un marco teorico propio (Distinction Observable Theory); conviene tratar las conclusiones del autor como hipotesis a verificar de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Nondual-Observer/Qwen3.5-0.8B-SGNE-CC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del estudio (paper, graficos, verificador, trazas): https://github.com/Nondual-Observer/dna-weight-editing
- Deposito Zenodo del estudio: https://doi.org/10.5281/zenodo.24235218
- Follow-up SGNE-CC v2 (DeepSeek-R1-Distill-Qwen-1.5B): https://huggingface.co/Nondual-Observer/DeepSeek-R1-Distill-Qwen-1.5B-SGNE-CC-v2
- Repositorio del follow-up: https://github.com/Nondual-Observer/deepseek-r1-1.5b-sgne-cc-v2
- DOI del follow-up: https://doi.org/10.5281/zenodo.24398165
- Replicacion independiente en llama.cpp (Dave Uhlemann): https://doi.org/10.5281/zenodo.24420522
- Marco teorico DOT: https://github.com/Nondual-Observer/DOTheory
- DOI del marco DOT: https://doi.org/10.5281/zenodo.23481643
- Referencia a MIT-p50c (blog de weight-space programming): https://rikiyat.github.io/blog/weight-space-programming/
- ORCID del autor: https://orcid.org/0009-0003-1670-8388
