# Jeesup/svd-safety-llama3_1_8b_instruct_up_basis_coeff_finetuned_keep_0p60

## Resumen

Este repositorio contiene una version comprimida de `meta-llama/Llama-3.1-8B-Instruct` mediante la tecnica Basis Sharing, desarrollada por el usuario Jeesup a partir del codigo de referencia del grupo TUDa-HWAI. La compresion elimina el 40 % de los parametros (se retiene una fraccion real de 0,599853515625) haciendo que pares de capas adyacentes compartan una unica base por tipo de peso, y posteriormente recupera parte de la calidad perdida entrenando unicamente los coeficientes mediante LoRA con las bases congeladas. El resultado se pliega de nuevo a formas densas de Llama, por lo que se carga con `transformers` estandar sin codigo de modelado personalizado.

El interes de esta publicacion no es la utilidad practica del modelo, sino su papel como celda de medida dentro de un estudio sistematico sobre compresion y seguridad. La model card es explicita: la compresion a este ratio degrada el comportamiento de rechazo, y el modelo existe precisamente para cuantificar esa degradacion. Los resultados publicados muestran una tasa de exito de ataque (ASR) de 0,6269 en AdvBench y 0,4665 en StrongREJECT, muy elevadas, junto con una tasa de sobre-rechazo baja (0,0562 macro).

Se trata, por tanto, de un artefacto de investigacion reproducible mas que de un modelo desplegable. No reduce el tamano en disco (16,1 GB en safetensors), es deficiente en rango y mantiene los 8.030.261.248 parametros del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con bases compartidas entre pares de capas adyacentes y factores de bajo rango plegados a formas densas |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no confirmada en la model card; el modelo base Llama 3.1 8B Instruct declara 128.000 tokens. La calibracion y la recuperacion usaron secuencias de 2.048 tokens |
| Tipos de cuantizacion | no disponible en la model card. Los pesos se publican en safetensors densos, por lo que admiten cuantizacion posterior (GGUF, int8, 4 bits) con herramientas estandar |
| Idiomas soportados | no disponible en la model card; el modelo base declara 8 idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (densos, mismas formas que Llama estandar) |
| Fraccion de parametros retenida | 0,599853515625 (40 % eliminado) |
| Tipos de peso compartidos | `v`, `k`, `q`, `up`, `gate` (una base por grupo de 2 capas adyacentes) |
| Tipos de peso privados | `down`, `o` (una base por capa) |
| Tamano del repositorio | 16,1 GB |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |

## Arquitectura y entrenamiento

El pipeline parte de los pesos originales de Llama 3.1 8B Instruct y agrupa de dos en dos las capas adyacentes. Para cada tipo de peso compartido se concatenan horizontalmente las matrices del grupo y se les aplica una SVD blanqueada, obteniendo una base comun. Los tipos `down` y `o` permanecen privados por capa. Sobre esa representacion factorizada se entrena unicamente el tensor de coeficientes con LoRA (r=8, alpha 16, 2 epocas, learning rate 1e-4, batch 64) usando el dataset `yahma/alpaca-cleaned`; las bases compartidas y las privadas permanecen congeladas y son bit a bit identicas a las del modelo comprimido. Despues se fusiona `C' = C + (alpha/r)·BA` y se pliega `W = C' @ B` para devolver matrices densas de Llama. Al no tocar las bases, cada peso conserva rango <= k, cada grupo sigue compartiendo una sola base y el presupuesto de parametros se mantiene exacto tras la recuperacion.

La calibracion de la SVD uso 256 secuencias de WikiText-2 de 2.048 tokens con semilla 42 (el proyecto fija una unica semilla para todos los metodos, frente al 2023 que usa el codigo original). Es importante notar que este LoRA no es el de Basis Sharing original (que usa WikiText, batch 1 y solo `q`/`v`): aqui se aplica la receta de alpaca del proyecto para que los datos de recuperacion sean constantes entre compresores. La codificacion posicional tambien se verifico: el modelo factorizado `ShareLlama` usa las tablas rotatorias de `transformers` construidas desde la config de este modelo, comprobadas como identicas a Llama estandar en float64 para RoPE con base 500000, el escalado llama3 y la atencion con consultas agrupadas. El entrenamiento se hizo sobre un modelo de 8B con 2 epocas sobre alpaca-cleaned, un regimen ligero que explica que la recuperacion sea parcial.

## Capacidades

- Generacion de texto conversacional en formato de chat, heredada de Llama 3.1 8B Instruct y aplicada con su plantilla oficial.
- Razonamiento de sentido comun y tareas de opcion multiple: ARC-Easy, ARC-Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA se evaluan en zero-shot con resultados publicados.
- Modelado de lenguaje general medido con perplejidad en WikiText-2 (16,3400).
- Capacidad de rechazo de peticiones dañinas residual pero severamente degradada: no debe considerarse una capacidad fiable de seguridad.
- Soporte de tool calling y de agentes: no confirmado en la informacion disponible para este checkpoint; el modelo base lo soporta, pero no hay evaluacion publicada aqui.
- Capacidades multilingues: no evaluadas en este checkpoint; no hay datos propios.
- Capacidades especiales (modo thinking, vision, audio): no disponible / no aplica.

## Casos de uso

- Investigacion sobre el impacto de la compresion en la alineacion: este checkpoint es una celda de medida dentro de un estudio comparativo de compresores, y sirve para aislar cuanto contribuye cada metodo a la perdida de comportamiento de rechazo.
- Evaluacion de pipelines de compresion de modelos: al usar la misma receta de recuperacion (LoRA r=8 sobre alpaca-cleaned) que el resto de celdas del proyecto, permite comparar compresores con datos de recuperacion constantes.
- Estudios de sobre-rechazo: las tasas publicadas (0,0612 en XSTest-safe, 0,0512 en OR-Bench-Hard-1K, 0,0562 macro) permiten analizar el equilibrio entre seguridad y utilidad, con fracciones de evaluacion fiable del 0,98 y 0,99 respectivamente.
- Red-teaming y benchmarking de jailbreaks: con ASR de 0,6269 en AdvBench y 0,4665 en StrongREJECT, sirve como caso limite para calibrar clasificadores de daño como HarmBench-Llama-2-13b-cls.
- Reproduccion de experimentos: la model card documenta semilla, dataset, hiperparametros y scripts de verificacion (`tests/check_share_llama_exact.py`), lo que facilita replicar los numeros.
- Estudio de matrices deficientes en rango: permite analizar como se comporta la inferencia cuando las matrices de pesos tienen rango reducido pero ocupan el mismo espacio en disco.
- Docencia y divulgacion sobre compresion de LLM: es un ejemplo autocontenido de SVD blanqueada, comparticion de bases y recuperacion por LoRA que se carga con `transformers` estandar.
- No se recomienda su uso en produccion, atencion al cliente ni generacion de codigo: el deterioro documentado del comportamiento de rechazo lo desaconseja para cualquier despliegue expuesto a usuarios.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Fraccion de parametros retenida | 0,5999 |
| Perplejidad en WikiText-2 | 16,3400 |
| ARC-Easy (acc_norm) | 0,6183 |
| ARC-Challenge (acc_norm) | 0,3729 |
| HellaSwag (acc_norm) | 0,5816 |
| WinoGrande (acc) | 0,6527 |
| OpenBookQA (acc_norm) | 0,3800 |
| PIQA (acc_norm) | 0,7067 |
| MathQA (acc_norm) | 0,2767 |
| AdvBench HarmBench ASR | 0,6269 |
| StrongREJECT HarmBench ASR | 0,4665 |
| Sobre-rechazo en XSTest-safe | 0,0612 |
| Sobre-rechazo en OR-Bench-Hard-1K | 0,0512 |
| Sobre-rechazo macro | 0,0562 |

Metodologia: perplejidad en WikiText-2; ARC-Easy/Challenge, HellaSwag, WinoGrande, OpenBookQA, PIQA y MathQA en zero-shot; AdvBench y StrongREJECT con generacion juzgada por `cais/HarmBench-Llama-2-13b-cls`; sobre-rechazo juzgado por `allenai/wildguard`. Toda la generacion usa la plantilla de chat y decodificacion greedy. Los archivos de metricas y las salidas por prompt estan en `utility/` y `safety/` del repositorio. La fiabilidad del juicio de sobre-rechazo se reporta como alta para esta celda (fraccion puntuada 0,98 en XSTest-safe y 0,99 en OR-Bench-Hard-1K).

No hay resultados comparativos con el modelo base sin comprimir ni con otras celdas del estudio en la informacion disponible.

## Requisitos de hardware

- VRAM en fp16/bf16: unos 16,1 GB solo de pesos, mas cache KV y overhead; en la practica 18-20 GB.
- Cache KV: con la arquitectura de Llama 3.1 8B (32 capas, 8 cabezas KV, dimension de cabeza 128), cada token ocupa aproximadamente 128 KiB en fp16, es decir alrededor de 1 GB por cada 8.000 tokens de contexto.
- VRAM en int8: aproximadamente 9-10 GB.
- VRAM en 4 bits (GGUF Q4_K_M, GPTQ o AWQ): aproximadamente 5,5-7 GB.
- GPU de datacenter recomendadas: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 (24 GB) en fp16 con contexto moderado; en RTX 4080, RTX 4060 Ti 16 GB o RTX 3080 Ti conviene cuantizar a 4-8 bits.
- Apple Silicon: viable en equipos con 32 GB de memoria unificada o mas usando llama.cpp/Metal.
- Despliegue: al plegarse a formas densas de Llama, es compatible con `transformers` estandar, vLLM, TGI y SGLang sin codigo personalizado. Para llama.cpp u Ollama hay que convertir los pesos a GGUF.
- Nota importante: la deficiencia de rango no reduce el uso de memoria ni el tamano en disco; las ganancias de VRAM solo vienen de la cuantizacion.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este checkpoint (Basis Sharing, keep 0,60) | 8.030.261.248 (60 % retenido, deficiente en rango) | Heredado del base, no confirmado | llama3.1 | HuggingFace, 0 descargas, 0 likes | Perplejidad WikiText-2 16,3400; ASR AdvBench 0,6269; ASR StrongREJECT 0,4665 |
| meta-llama/Llama-3.1-8B-Instruct | 8.030.261.248 | 128.000 tokens | llama3.1 | HuggingFace, ampliamente desplegado | No disponible en la informacion proporcionada |
| Otras celdas del mismo estudio de compresion (misma receta de recuperacion) | Variable segun compresor | No disponible | llama3.1 | Repositorio del proyecto | No disponible en la informacion proporcionada |
| Compresores alternativos de la literatura (por ejemplo variantes de SVD de bajo rango) | Variable | No disponible | Variable | Variable | No disponible en la informacion proporcionada |

La comparacion cuantitativa con el modelo sin comprimir no puede completarse porque la model card no incluye los valores del base para las mismas metricas. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.

## Limitaciones y advertencias

- Degradacion severa del comportamiento de rechazo: ASR de 0,6269 en AdvBench y 0,4665 en StrongREJECT. La propia model card advierte que la compresion a este ratio degrada el rechazo y que las cifras de seguridad de un modelo degenerado no son evidencia sobre alineacion.
- Modelo de investigacion, no de produccion: no debe desplegarse en aplicaciones expuestas a usuarios finales ni como sistema de seguridad.
- La deficiencia de rango no ahorra disco ni memoria: el repositorio ocupa 16,1 GB y los pesos tienen las formas densas de Llama.
- Sin intervalos de confianza ni multiples semillas: la calibracion usa una unica semilla (42) y la recuperacion un unico regimen, por lo que la variabilidad de las metricas no esta caracterizada.
- Sesgos heredados: al derivar de Llama 3.1 8B Instruct sin filtrado adicional, arrastra los sesgos del modelo base y de `yahma/alpaca-cleaned`.
- Riesgo de alucinacion: la recuperacion parcial y la perplejidad de 16,3400 en WikiText-2 sugieren un modelo de lenguaje degradado respecto a su base; no hay mediciones de factualidad.
- Idiomas y contexto no verificados en este checkpoint: no se han evaluado capacidades multilingues ni el comportamiento en contextos largos tras la compresion.
- Restricciones de licencia: la Llama 3.1 Community License impone condiciones de uso, obligaciones de atribucion y requisitos adicionales para despliegues a gran escala (por encima de 700 millones de usuarios mensuales), ademas de restricciones de uso aceptable.
- Evaluacion limitada a decodificacion greedy con la plantilla de chat: los resultados pueden no extrapolarse a otros ajustes de muestreo.
- Sobre-rechazo bajo combinado con ASR alto: el patron sugiere un modelo que rechaza menos y, ademas, falla al rechazar, un perfil poco util tanto en seguridad como en utilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-llama3_1_8b_instruct_up_basis_coeff_finetuned_keep_0p60
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Codigo de Basis Sharing (TUDa-HWAI, commit `1c021b6ce1d3`): https://github.com/TUDa-HWAI/Basis_Sharing
- Dataset de recuperacion: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Clasificador de daño usado en la evaluacion: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobre-rechazo usado en la evaluacion: https://huggingface.co/allenai/wildguard
- Script de verificacion de RoPE y GQA: `tests/check_share_llama_exact.py` en el repositorio del proyecto
- La busqueda web no devolvio enlaces relevantes sobre este modelo.
