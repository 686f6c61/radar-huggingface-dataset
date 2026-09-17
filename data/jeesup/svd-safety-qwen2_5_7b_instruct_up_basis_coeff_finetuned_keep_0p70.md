# Jeesup/svd-safety-qwen2_5_7b_instruct_up_basis_coeff_finetuned_keep_0p70

## Resumen

Este checkpoint es una versión comprimida de `Qwen/Qwen2.5-7B-Instruct` mediante la técnica **Basis Sharing** (grupos de 2 capas adyacentes comparten una única base por tipo de peso), seguida de una recuperación con LoRA entrenada **solo sobre los coeficientes**. Lo publica el usuario Jeesup dentro de un proyecto orientado a medir cómo la compresión afecta al comportamiento de rechazo (safety) de un modelo alineado. Se elimina el 30 % del presupuesto de parámetros (se conserva el 70 %, con fracción realizada de 0,6997240579302587).

El interés del modelo es metodológico, no práctico: forma parte de una familia de "celdas" de evaluación (el nombre `svd-safety` sugiere checkpoints hermanos con otros compresores) en las que todos los métodos de compresión se calibran y recuperan con la misma receta, de modo que las diferencias observadas en seguridad y utilidad sean atribuibles al compresor y no al pipeline. La model card reporta la advertencia explícita de que, a este ratio de compresión, el comportamiento de rechazo se degrada, y que las métricas de seguridad de un modelo degenerado no son evidencia sobre alineamiento.

Arquitectura y tamaño: es un transformer decoder-only Qwen2 estándar de 7.615.616.512 parámetros, con GQA, RoPE y sesgos en q/k/v (84 sesgos restaurados). Los factores se pliegan de vuelta a formas densas de Qwen2, por lo que el modelo carga con `transformers` sin código de modelado personalizado: es **deficiente en rango, no más pequeño en disco** (15,3 GB de repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Qwen2 (GQA, RoPE, SwiGLU), con compresion Basis Sharing y plegado a formas densas |
| Parametros totales | 7.615.616.512 (forma densa Qwen2; matrices deficientes en rango) |
| Longitud de contexto | no disponible en la model card; heredada de Qwen2.5-7B-Instruct (32.768 tokens nativos, ampliable con YaRN) |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors densos. No hay versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | no disponible (se heredan los del modelo base, sin verificar para este checkpoint) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (carga con `transformers` estandar, sin codigo custom) |
| Presupuesto de parametros | 70 % conservado (30 % eliminado); fraccion realizada 0,6997240579302587 |
| Tipos compartidos | `v`, `k`, `q`, `up`, `gate` (una base por grupo de 2 capas adyacentes) |
| Tipos privados | `down`, `o` (una base por capa) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Tamano del repositorio | 15,3 GB |
| Descargas / likes | 5 / 0 |

## Arquitectura y entrenamiento

El punto de partida es `Qwen2.5-7B-Instruct`. Sobre él se aplica Basis Sharing (implementación [TUDa-HWAI/Basis_Sharing](https://github.com/TUDa-HWAI/Basis_Sharing), commit `1c021b6ce1d3`): se agrupan capas adyacentes de dos en dos y se concatena horizontalmente cada tipo de peso del grupo, tras lo cual se ajusta una base compartida mediante SVD blanqueado. Los tipos `v`, `k`, `q`, `up` y `gate` comparten base por grupo; `down` y `o` mantienen base privada por capa. La calibración usa 256 secuencias de WikiText-2 de 2048 tokens con semilla 42 (el código original fija la semilla 2023; en este proyecto todos los métodos se calibran con una única semilla).

La recuperación es un LoRA de rango 8 y alpha 16, 2 épocas, learning rate 1e-4 y batch 64 sobre `yahma/alpaca-cleaned`, entrenando **únicamente los coeficientes**: las bases compartidas y privadas quedan congeladas y bit-idénticas al modelo comprimido, de modo que cada peso conserva rango <= k, cada grupo sigue compartiendo una base y el presupuesto de parámetros sobrevive intacto a la recuperación. Después se fusiona `C' = C + (alpha/r)·BA` y se pliega `W = C' @ B` a denso. No es el LoRA propio de Basis Sharing (wikitext, batch 1, solo q/v); se usa la receta alpaca del proyecto para homogeneizar la comparación entre compresores.

Detalles de implementación verificados en `tests/check_share_llama_exact.py`: las tablas rotatorias se construyen desde la config del modelo y son idénticas a las de Llama en float64 para base RoPE 1e4 / 5e5 / 1e6 y escalado llama3, con GQA y sesgos en q/k/v. Como Qwen2 tiene sesgo en q/k/v y el `ShareLlama` original los descartaba, los 84 sesgos se reinsertaron sobre los coeficientes (`y = C(Bx) + b`, exacto a rango completo, verificado en float64), se dejaron congelados durante el LoRA y se comprobó su igualdad con los del modelo fuente al plegar.

## Capacidades

- Generación de texto e instrucciones en formato chat: heredadas de Qwen2.5-7B-Instruct; la evaluación completa se hizo con la plantilla de chat y decodificación greedy.
- Razonamiento y conocimiento general: medido en zero-shot sobre ARC-Easy (0,6721 acc_norm), ARC-Challenge (0,4531), HellaSwag (0,6786), WinoGrande (0,6661 acc), OpenBookQA (0,4240) y PIQA (0,7345).
- Matemáticas básicas: MathQA con 0,3290 acc_norm.
- Modelado de lenguaje: perplejidad de 11,6300 en WikiText-2.
- Multilingüismo: no verificado en esta ficha; el checkpoint hereda el tokenizador y el vocabulario del modelo base.
- Tool calling / function calling: no verificado para este checkpoint (el modelo base lo soporta, pero la compresión y la recuperación sobre alpaca-cleaned no lo garantizan).
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Comportamiento de rechazo: parcialmente degradado por la compresión; AdvBench HarmBench ASR 0,1596 y StrongREJECT HarmBench ASR 0,2077.
- No dispone de visión, audio ni modo de pensamiento extendido.
- Carga directa con `transformers` sin código de modelado personalizado, al estar plegado a formas densas Qwen2.

## Casos de uso

- Investigación en compresión de modelos: sirve como celda experimental para cuantificar cuánto degrada Basis Sharing (30 % de parámetros eliminados) las capacidades zero-shot y el rechazo, comparando contra otros compresores evaluados con la misma receta de calibración y recuperación.
- Estudio de la interacción entre compresión y alineamiento: los pares ASR de rechazo (AdvBench 0,1596; StrongREJECT 0,2077) frente a las tasas de sobrerrechazo (0,1640 en XSTest-safe; 0,1797 en OR-Bench-Hard-1K; macro 0,1719) permiten analizar si la compresión produce un modelo más permisivo, más conservador o simplemente degenerado.
- Validación de evaluadores automáticos: los jueces usados (`cais/HarmBench-Llama-2-13b-cls` y `allenai/wildguard`) se enfrentan aquí a un modelo con comportamiento degradado, lo que sirve para comprobar la robustez de los clasificadores ante generaciones atípicas (fracción puntuada 1,00 en ambas pruebas de sobrerrechazo).
- Reproducción de pipelines de plegado y verificación numérica: los tests de RoPE y de sesgos en float64 convierten el repositorio en un caso de referencia para validar que una factorización plegada devuelve exactamente la función del modelo original a rango completo.
- Recuperación de comportamiento de rechazo: el checkpoint puede usarse como inicialización para un ajuste posterior con DPO o RLHF orientado a seguridad, y medir cuánto del daño por compresión es reversible sin recuperar el presupuesto de parámetros.
- Análisis de rango efectivo por tipo de peso: al conservar `down` y `o` bases privadas y compartir `v`, `k`, `q`, `up` y `gate` por grupos de dos capas, permite estudiar qué proyecciones toleran mejor la compartición de base.
- Despliegue en entornos de investigación aislados: al cargar con `transformers` estándar y no requerir dependencias exóticas, se puede integrar en scripts de evaluación existentes sin adaptar el código de inferencia.
- No es adecuado como modelo de producción orientado a usuario final, dado el deterioro documentado del comportamiento de rechazo y su naturaleza de artefacto de medición.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor. Todas las generaciones usan la plantilla de chat y decodificación greedy. ASR = tasa de éxito de ataque (menor es mejor); el resto, mayor es mejor salvo la perplejidad.

| Benchmark | Metrica | Valor |
|---|---:|---:|
| WikiText-2 | Perplejidad | 11,6300 |
| ARC-Easy | acc_norm | 0,6721 |
| ARC-Challenge | acc_norm | 0,4531 |
| HellaSwag | acc_norm | 0,6786 |
| WinoGrande | acc | 0,6661 |
| OpenBookQA | acc_norm | 0,4240 |
| PIQA | acc_norm | 0,7345 |
| MathQA | acc_norm | 0,3290 |
| AdvBench (HarmBench) | ASR | 0,1596 |
| StrongREJECT (HarmBench) | ASR | 0,2077 |
| XSTest-safe | Tasa de sobrerrechazo | 0,1640 |
| OR-Bench-Hard-1K | Tasa de sobrerrechazo | 0,1797 |
| Sobrerrechazo (macro) | Tasa macro | 0,1719 |
| Fraccion de parametros retenida | Ratio | 0,6997 |

Fiabilidad del juicio de sobrerrechazo declarada como **fiable** para esta celda (fracción puntuada 1,00 en XSTest-safe y 1,00 en OR-Bench-Hard-1K). Los resultados por prompt y los ficheros de métricas en bruto están en `utility/` y `safety/` del repositorio. No se han publicado en la información disponible los valores equivalentes del modelo base sin comprimir ni de otros compresores de la misma familia, por lo que no se incluye una comparación numérica directa.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 15,2 GB (el repositorio ocupa 15,3 GB). Con caché KV para contexto largo y batch 1 se superan los 17-18 GB, por lo que se recomienda GPU de 24 GB o superior. Estimaciones orientativas para un denso de 7,6B; no medidas para este checkpoint en la información disponible.
- Cuantización de 8 bits: alrededor de 8 GB de pesos; cabe en RTX 3090, RTX 4080/4090, A6000, L40S.
- Cuantización de 4 bits: alrededor de 4,5-5 GB de pesos; cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- GPU de datacenter recomendadas para servicio: A100 40/80 GB, H100, L40S; permiten lotes grandes y contextos de 32k sin fragmentar.
- Consumer GPU: sí cabe. En RTX 4090 (24 GB) en bf16 con contexto moderado; en RTX 3060 12 GB o similares solo con cuantización de 4 bits.
- Despliegue: `transformers` directamente (el checkpoint está plegado a formas densas de Qwen2, sin código custom), y por tanto también vLLM, TGI o SGLang con el soporte estándar de Qwen2. Para llama.cpp u Ollama sería necesaria una conversión a GGUF que no se publica en el repositorio.
- Almacenamiento: 15,3 GB en disco en safetensors; la compresión reduce el rango de las matrices, no el tamaño en disco ni en memoria.
- Latencia y throughput: no disponibles (no se han publicado mediciones en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (basis-sharing, keep 0,70) | 7,62B en forma densa, presupuesto efectivo 70 % | no disponible (base: 32.768) | apache-2.0 | WikiText-2 ppl 11,63; ARC-C 0,4531; HellaSwag 0,6786; ASR AdvBench 0,1596 | HuggingFace, 5 descargas, 0 likes |
| Qwen/Qwen2.5-7B-Instruct (base sin comprimir) | 7,62B | 32.768 nativos, 131.072 con YaRN | apache-2.0 | no disponible en la informacion proporcionada | HuggingFace, ampliamente desplegado |
| Otros compresores de la misma familia (`svd-safety-*`) | no disponible | no disponible | presumiblemente apache-2.0 | no disponible | no confirmada en la informacion proporcionada |
| Alternativas de cuantizacion del modelo base (AWQ/GPTQ/GGUF) | 7,62B con precision reducida | el del modelo base | apache-2.0 | no disponible | habituales en el ecosistema, no publicadas para este checkpoint |

La comparación numérica con el modelo base y con otros compresores no puede establecerse con la información disponible: la model card reporta únicamente los valores de esta celda.

## Limitaciones y advertencias

- La propia model card advierte de que la compresión a este ratio (30 % de parámetros eliminados) degrada el comportamiento de rechazo, y que las métricas de seguridad de un modelo degenerado no son evidencia sobre alineamiento. Las cifras de ASR deben leerse junto a la línea de fiabilidad del sobrerrechazo.
- Es un artefacto de medición, no un modelo listo para producción: 5 descargas y 0 likes en el momento de redactar esta ficha, sin reproducción independiente conocida.
- Deficiencia de rango: los pesos conservan rango <= k y cada grupo de dos capas comparte una base, lo que reduce la capacidad efectiva de forma estructural. El checkpoint no es más pequeño en disco ni en VRAM que el modelo denso original.
- Sesgos: no se han publicado análisis de sesgo para este checkpoint; hereda los del modelo base, sin verificar, y la recuperación LoRA sobre `yahma/alpaca-cleaned` (corpus en inglés, de instrucciones) puede introducir regresiones fuera de ese dominio.
- Riesgo de alucinación: no cuantificado en la información disponible. La perplejidad de 11,6300 en WikiText-2 y el MathQA de 0,3290 indican un deterioro apreciable respecto a un modelo de 7B sin comprimir, aunque no se dispone de la referencia exacta.
- Idiomas: la lista de idiomas soportados no está declarada; la calibración y la recuperación se hicieron con datos en inglés (WikiText-2 y alpaca-cleaned), por lo que el rendimiento en otros idiomas es incierto.
- Contexto: no se declara explícitamente; debe asumirse el del modelo base. La ampliación por YaRN no está verificada tras la compresión.
- Licencia: apache-2.0 para el checkpoint, lo que permite uso comercial; conviene revisar por separado la licencia del código de Basis Sharing en `TUDa-HWAI/Basis_Sharing`, no detallada en la información proporcionada.
- Sesgos de evaluación: todas las métricas usan decodificación greedy con la plantilla de chat y una única semilla de calibración (42), lo que limita la generalización de los resultados.
- El ASR de 0,1596 en AdvBench y 0,2077 en StrongREJECT implica que aproximadamente una de cada cinco a seis peticiones dañinas de StrongREJECT obtiene respuesta conforme a lo solicitado: no debe usarse como modelo de moderación ni en aplicaciones con requisitos de seguridad.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/Jeesup/svd-safety-qwen2_5_7b_instruct_up_basis_coeff_finetuned_keep_0p70
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Código de compresión Basis Sharing: https://github.com/TUDa-HWAI/Basis_Sharing (commit `1c021b6ce1d3`)
- Dataset de recuperación: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Juez de seguridad (HarmBench): https://huggingface.co/cais/HarmBench-Llama-2-13b-cls
- Juez de sobrerrechazo: https://huggingface.co/allenai/wildguard
- Artefactos de evaluación: carpetas `utility/` y `safety/` dentro del repositorio de HuggingFace
- La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este modelo.
