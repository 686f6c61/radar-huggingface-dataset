# janghaneul/Qwen3.8-Flash-Next-AD-gateup-Q4_K-Q4_K-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen (Alibaba). Esta ficha documenta una cuantización GGUF de terceros, publicada por el usuario janghaneul bajo el nombre `Qwen3.8-Flash-Next-AD-gateup-Q4_K-Q4_K-GGUF`, pensada para inferencia local de MoE en llama.cpp (y en el runtime Strata). El modelo base cuenta con 176.943.899.520 parámetros totales según los pesos en safetensors, y esta build concreta emplea una receta de cuantización de 5,00 bpw denominada `AD-5.00bpw-Q5_K_M`.

El problema que resuelve esta publicación es el de hacer viable el despliegue local de un MoE de gran tamaño con un equilibrio medido entre calidad y RAM residente. La receta mantiene en Q8_0 todo lo que no son expertos enrutados (atención, `ssm_out` de tipo GDN, expertos compartidos, embeddings y la tabla n-gram PLE) y en IQ4_NL los expertos `down`, mientras que la variación se concentra en los expertos `gate`/`up`, que son los que determinan la calidad en este modelo. Se ofrecen dos builds: `AD-404bpw-q4_k_m` (la recomendada, 109,78 GiB totales y 59,11 GiB residentes con el PLE en streaming) y `AD-467bpw-q5_k_m` (119,05 GiB totales, 68,37 GiB residentes).

La relevancia actual es doble: por un lado, demuestra una metodología de cuantización guiada por medición (6 variantes × 161 problemas × 5 ejecuciones sobre MultiPL-E humaneval-cpp) en lugar de una asignación uniforme de bits; por otro, documenta con detalle la composición byte a byte de los tensores, algo poco habitual en publicaciones de cuantización de terceros. La licencia del modelo base es `qwen-community-1.0`, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención y capas GDN (`ssm_out`), expertos compartidos y tabla n-gram PLE (`per_layer_token_embd`); el modelo base es Qwen3.8-Flash-Next |
| Parametros totales | 176.943.899.520 (pesos safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K, IQ2_S, IQ3_S, IQ4_NL, Q8_0, F32/F16, BF16 (builds `AD-404bpw-q4_k_m` y `AD-467bpw-q5_k_m`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en la model card) |
| Formato de pesos | GGUF (3 shards por build; librería `gguf`, runtime llama.cpp / Strata) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE con atención estándar combinada con capas GDN (cuyo tensor de salida aparece como `ssm_out`), expertos compartidos y una tabla n-gram PLE (`per_layer_token_embd`) de gran tamaño: 50,66 GiB en Q8_0, lo que la convierte en el mayor bloque individual del repositorio. La publicación de cuantización no aporta datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación; esos datos corresponden a la model card del modelo base y no están disponibles en la información proporcionada.

La innovación técnica de esta build es la asignación selectiva de bits. Partiendo de la receta `AD-5.00bpw-Q5_K_M` de AtomicChat, se sustituyen únicamente los tensores de expertos `gate`/`up`: en la build Q4_K, los 96 tensores pasan a Q4_K; en la build ligera, 8 tensores quedan en Q4_K (capas 40, 44, 45 y 47, las de mayor tolerancia), 80 en IQ3_S y 8 en IQ2_S (capas 32, 34, 36 y 39, las de menor tolerancia). La colocación por niveles se apoya en el consenso de tres asignaciones independientes (AtomicChat AD, ISTA GSQ y agention Gyro). Los expertos `down` permanecen en IQ4_NL (48 tensores, 21,09 GiB), limitados por `moe_intermediate_size=640` y el bloque de 32. Los tensores `hc_*` (hyper-connection) se subieron de Q8_0 a BF16 en la revisión del 12 de noviembre de 2026, con un coste de +0,55 GiB y una mejora de puntuación.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Generación de código, evidenciada por la evaluación ejecutable sobre MultiPL-E humaneval-cpp (161 problemas, 5 ejecuciones por variante).
- Razonamiento multi-turno dentro de un chat (`atomic-chat` como etiqueta de la publicación).
- Inferencia local de un MoE de gran tamaño mediante llama.cpp y el runtime Strata, con streaming de la tabla n-gram PLE.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Capacidades de visión, audio, tool calling, function calling y agentes: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Evaluación de cuantizaciones en local: la publicación incluye una metodología reproducible (6 variantes × 161 problemas × 5 ejecuciones sobre MultiPL-E humaneval-cpp) que sirve para validar asignaciones de bits antes de desplegar un MoE grande en hardware propio.
- Servicio de generación de código en estación de trabajo: con 59,11 GiB residentes en la build `AD-404bpw-q4_k_m` y 79,4 tok/s medidos, es adecuada para un servidor de un solo nodo con RAM abundante que atienda peticiones de completado de código.
- Asistente conversacional autoalojado: la etiqueta `conversational` y la compatibilidad con endpoints permiten montar un chat multi-turno sobre llama.cpp sin depender de una API externa.
- Investigación sobre asignación de bits por capa: las tablas de composición byte a byte (Q4_K ×8 en capas 40/44/45/47, IQ2_S ×8 en 32/34/36/39) permiten reproducir y contrastar la hipótesis de que `gate`/`up` concentra la calidad del modelo.
- Despliegue con presupuesto de RAM ajustado: la build ligera reduce 9,26 GiB residentes frente a la Q4_K (59,11 frente a 68,37 GiB) a cambio de 1,4 puntos de precisión en la métrica citada (143,8 frente a 142,4 sobre 161).
- Comparación de runtimes: la publicación está pensada para llama.cpp y Strata, de modo que sirve para medir diferencias de throughput y de gestión de memoria entre ambos con el mismo conjunto de pesos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son los de la evaluación ejecutable MultiPL-E humaneval-cpp realizada por el autor de la cuantización (161 problemas, 5 ejecuciones por variante):

| Build | Puntuacion (sobre 161) | Porcentaje | RAM residente (PLE en streaming) | Throughput |
|---|---:|---:|---:|---:|
| `AD-404bpw-q4_k_m` | 143,8 | 89,3 % | 59,11 GiB | 79,4 tok/s |
| `AD-467bpw-q5_k_m` | 142,4 | 88,4 % | 68,37 GiB | 74,5 tok/s |

No se han publicado resultados de benchmarks del modelo base (MMLU, GSM8K, HumanEval estándar u otros) en la información disponible. Los valores anteriores corresponden a la comparación interna entre las dos builds de esta publicación y no son directamente comparables con cifras de terceros.

## Requisitos de hardware

- RAM residente: 59,11 GiB para `AD-404bpw-q4_k_m` y 68,37 GiB para `AD-467bpw-q5_k_m`, en ambos casos con la tabla n-gram PLE (50,66 GiB) en streaming.
- Espacio en disco: 109,78 GiB totales para la build ligera y 119,05 GiB para la Q4_K, repartidos en 3 shards por build (shard1 47,70 GiB, shard2 11,42 GiB, shard3 50,66 GiB en la build ligera tras la revisión del 12-11-2026).
- VRAM estimada para inferencia: no disponible. Por el volumen residente, el despliegue requiere RAM de sistema abundante o offload parcial; no cabe en GPUs de consumo de 24 GB ni en configuraciones de 48 GB sin offload.
- GPU recomendadas: no disponible en la información proporcionada. El tamaño residente sugiere nodos con 64-96 GB de memoria unificada o RAM de sistema amplia.
- Cabe en GPU de consumo: no, según los requisitos de memoria residente indicados.
- Opciones de despliegue: llama.cpp y el runtime Strata (citados explícitamente); vLLM, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: 79,4 tok/s para la build ligera y 74,5 tok/s para la Q4_K, medidos por el autor en su entorno de servicio.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `AD-404bpw-q4_k_m` (esta publicacion) | 176,9 B (base) | no disponible | qwen-community-1.0 | GGUF | 143,8/161 en MultiPL-E humaneval-cpp; 59,11 GiB residentes; 79,4 tok/s |
| `AD-467bpw-q5_k_m` (misma publicacion) | 176,9 B (base) | no disponible | qwen-community-1.0 | GGUF | 142,4/161; 68,37 GiB residentes; 74,5 tok/s |
| `AD-5.00bpw-Q5_K_M` de AtomicChat (receta de origen) | 176,9 B (base) | no disponible | qwen-community-1.0 | GGUF | Receta de partida; gate/up en IQ2_S ×72 + IQ3_S ×24; no disponible el detalle de puntuación |
| Modelo base Qwen3.8-Flash-Next (BF16) | 176,9 B | no disponible | qwen-community-1.0 | safetensors | Referencia de calidad completa; sin datos de benchmarks en la información disponible |

No se dispone de datos para comparar con modelos de otros fabricantes de la misma categoría (por ejemplo, otros MoE de tamaño comparable) en la información proporcionada.

## Limitaciones y advertencias

- La licencia `qwen-community-1.0` impone condiciones específicas para uso comercial; es necesario revisar el texto completo enlazado en la model card del modelo base antes de desplegar en producción.
- Es una cuantización de terceros, no oficial de Qwen: la calidad y la integridad de los pesos dependen del autor de la publicación y no están avaladas por el equipo del modelo base.
- La pérdida de calidad frente al modelo en BF16 no está cuantificada en la información disponible; los 89,3 % y 88,4 % corresponden solo a MultiPL-E humaneval-cpp y no cubren razonamiento general, matemáticas ni otros idiomas.
- El requisito de memoria residente (59-68 GiB) excluye su uso en GPUs de consumo y obliga a hardware de gama alta o a configuraciones con offload.
- La tabla n-gram PLE (50,66 GiB) debe servirse en streaming; un runtime que no soporte esta modalidad no podrá cargar el modelo con los requisitos de RAM indicados.
- Riesgo de alucinación, sesgos conocidos y limitaciones idiomáticas del modelo base: no disponibles en la información proporcionada.
- La build `AD-404bpw-q4_k_m` fue reemplazada el 12-11-2026 (shards 1 y 2, con `hc_*` en BF16 y renombrado desde `AD-405bpw-q4_k_m`); descargas anteriores deben actualizarse para reproducir las cifras publicadas.
- La model card está redactada en inglés y coreano; no hay documentación en castellano.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/janghaneul/Qwen3.8-Flash-Next-AD-gateup-Q4_K-Q4_K-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Paper, blog, repositorio de código y demo: no disponibles en la información proporcionada.
