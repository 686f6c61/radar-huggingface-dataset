# arnabsanyal/LazyWeights-Mistral-7B-Instruct-v0.2

## Resumen

LazyWeights-Mistral-7B-Instruct-v0.2 es una variante comprimida del modelo Mistral-7B-Instruct-v0.2 publicada por Arnab Sanyal (junto a Gourav Datta y Sandeep P. Chinchali) como artefacto de investigacion del paper *LazyWeights: Decode-on-Demand Edge LLMs* (arXiv 2611.17108). No es un modelo nuevo entrenado desde cero, sino una cuantizacion GPTQ de los pesos originales de Mistral-7B-Instruct-v0.2 en los formatos de bloque propios de llama.cpp, con los codigos enteros ajustados para que compriman bien y codificados despues con Huffman de forma sin perdida. El objetivo es reducir el ancho de banda entre DRAM y L2 en dispositivos de borde (Jetson Orin Nano Super, Jetson Nano) mediante una unidad de decodificacion situada entre ambas memorias.

El modelo conserva la arquitectura y los 7.241.732.096 parametros del Mistral-7B-Instruct-v0.2 original, con su ventana de contexto de 32.768 tokens y su licencia Apache 2.0. La contribucion del trabajo es el esquema de compresion: dos puntos de operacion, uno con presupuesto de degradacion de perplejidad de WikiText-2 de +1 % y otro de +3,5 % respecto a fp16, que logran ahorros de ancho de banda de 31,4 % y 5,7 % respectivamente frente al mejor formato de llama.cpp que cumple el mismo presupuesto.

Es relevante porque demuestra que la compresion entropica sin perdida sobre codigos de cuantizacion puede reducir el coste de memoria en inferencia de borde sin degradar la calidad mas alla de un umbral controlado, y porque publica tanto los ficheros GGUF ejecutables en llama.cpp sin modificaciones como los bundles codificados que requiere su runtime CUDA propio. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-Instruct-v0.2 base; GQA, SwiGLU, RoPE) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base) |
| Tipos de cuantizacion | GPTQ en formatos de bloque de llama.cpp (IQ4_XS); dos puntos: `IQ4_XS_g1_lam0` y `IQ4_XS_g1_lam0_c1.5`; bundles con codificacion Huffman sin perdida |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (3,91 GB por fichero) y bundles de runtime codificados (`manifest.txt` + `weights.bin`) |

## Arquitectura y entrenamiento

El modelo no se entrena: parte de los pesos de mistralai/Mistral-7B-Instruct-v0.2 (transformer decoder-only denso de 7,24 mil millones de parametros, con grouped-query attention, activacion SwiGLU y embeddings rotatorios) y aplica una cuantizacion GPTQ a los formatos de bloque de llama.cpp. La innovacion esta en el ajuste de la cuantizacion para que los codigos enteros resultantes sean compresibles: el parametro `g` (gamma) controla si se comparte un unico paso de cuantizacion por super-bloque (`g=1`) o se mantiene el ajuste por sub-bloque de llama.cpp (`g=0`), y `lam` (lambda) pondera la entropia en la eleccion de codigos de GPTQ. El parametro `c` ensancha el paso de cuantizacion, lo que concentra mas los codigos y mejora la compresion a costa de algo de precision.

Sobre esos codigos se aplica una codificacion Huffman sin perdida en carriles intercalados, junto con las escalas y minimos del formato. El resultado se ejecuta en una unidad de decodificacion colocada entre DRAM y L2, implementada en `kernels/llmrt.cu` (CUDA) para las Jetson. El paper reporta dos puntos de operacion seleccionados como el modelo codificado mas pequeno que cabe en un presupuesto de perplejidad de WikiText-2 de +1 % o +3,5 % sobre fp16, comparados contra el mejor formato de llama.cpp (con o sin importance matrix) que cumple el mismo presupuesto. No se dispone de informacion sobre datos de entrenamiento adicionales, RLHF o DPO especificos de esta variante, ya que hereda los del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Mistral-7B-Instruct-v0.2.
- Razonamiento y respuesta a instrucciones en formato chat (el modelo base esta ajustado por instrucciones).
- Generacion de codigo y matematicas basicas, en la medida en que lo soporta el modelo base.
- Ejecucion en llama.cpp sin modificaciones a traves de los ficheros GGUF.
- Ejecucion en dispositivos de borde (Jetson Orin Nano Super y Jetson Nano) mediante el runtime CUDA propio con decodificacion Huffman bajo demanda.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo `language` del repositorio.

## Casos de uso

- Inferencia en dispositivos de borde con memoria limitada: el punto de operacion de +3,5 % de perplejidad ocupa 3,33 GB en bundle codificado, lo que permite ejecutar un modelo de 7B en plataformas Jetson con ancho de banda de memoria restringido, donde el cuello de botella es el trafico DRAM-L2 y no la capacidad de computo.
- Investigacion en compresion de modelos: sirve como referencia reproducible para comparar tecnicas de cuantizacion con compresion entropica frente a formatos estandar de llama.cpp, ya que el repositorio incluye los puntos de operacion, los presupuestos de perplejidad y las instrucciones de reconstruccion de los twins de ancho fijo.
- Despliegue embebido de asistentes conversacionales en ingles: al conservar el ajuste por instrucciones del modelo base, puede usarse para generacion de texto y respuesta a preguntas en entornos sin conectividad ni GPU de datacenter.
- Evaluacion de runtimes de decodificacion: el bundle codificado y el kernel `llmrt.cu` permiten medir tiempo por token y energia por token en Jetson Orin Nano Super y Jetson Nano, util para caracterizar el coste real de la decodificacion bajo demanda.
- Prototipado con llama.cpp: los GGUF se cargan con cualquier build reciente (el paper uso el commit `5d7793d`), lo que facilita integrar el modelo en pipelines existentes basados en llama.cpp sin adoptar el runtime propio.
- Docencia y reproduccion de resultados: el repositorio incluye sumas de verificacion SHA256 y un script (`scripts/a2_kq_bundle.py`) para reconstruir los bundles y verificar cada matriz bit a bit contra gguf-py, adecuado para cursos o talleres sobre cuantizacion.

## Benchmarks y rendimiento

Los datos publicados en la model card se refieren a perplejidad de WikiText-2 y ahorro de ancho de banda, no a benchmarks de tareas. La model card indica que las metricas de precision en tareas (HellaSwag, ARC-e, PIQA, GSM8K) y los tiempos y energia por token en Jetson estan en el paper y en el README de GitHub, pero no se incluyen en la informacion proporcionada.

| Metrica | Punto ≤1 % | Punto ≤3,5 % |
|---|---|---|
| GGUF | `IQ4_XS_g1_lam0.gguf` (3,91 GB) | `IQ4_XS_g1_lam0_c1.5.gguf` (3,91 GB) |
| Bundle codificado | 3,74 GB | 3,33 GB |
| Bits por peso (bundle, con overhead) | 3,886 | 3,422 |
| Delta de perplejidad WikiText-2 vs fp16 | +0,94 % | +1,46 % |
| Baseline llama.cpp (b/w) | Q5_K_M (5,668) | IQ3_M + imatrix (3,628) |
| Ahorro frente al baseline | 31,4 % | 5,7 % |
| Ahorro Huffman solo (ancho fijo → codificado) | 4,316 → 3,886 (−10,0 %) | 4,316 → 3,422 (−20,7 %) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB para los GGUF de 3,91 GB en llama.cpp; 3,74 GB o 3,33 GB para los bundles codificados, mas el overhead de la copia int8 de la tabla de embeddings direccionable por fila, las normas y las tablas rotatorias que carga el runtime.
- GPU recomendadas: el paper evalua en Jetson Orin Nano Super y Jetson Nano; los GGUF funcionan en cualquier GPU compatible con llama.cpp (A100, H100, RTX 4090, etc.), y el bundle codificado requiere el runtime CUDA propio (`kernels/llmrt.cu`) con las lineas de compilacion para Orin y Nano documentadas en el README de GitHub.
- Cabe en GPU de consumo: si, un modelo de 7B cuantizado a ~4 bits entra en GPUs con 8 GB o mas de VRAM; en el caso de las Jetson, entra en la memoria unificada de Orin Nano Super y Nano.
- Opciones de despliegue: llama.cpp (builds recientes; el paper uso el commit `5d7793d`) para los GGUF; runtime CUDA `llmrt` del repositorio de GitHub para los bundles codificados. No se documenta soporte para vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite al paper y al README de GitHub para los tiempos y la energia por token en Jetson.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| LazyWeights-Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 | GPTQ IQ4_XS + Huffman | Apache 2.0 | Bundle codificado de 3,33-3,74 GB; requiere runtime propio para el modo codificado |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,24 B | 32.768 | fp16 / bf16 (base) | Apache 2.0 | Modelo original sin compresion; mayor huella de memoria |
| Mistral-7B-Instruct-v0.2 en GGUF estandar (IQ3_M + imatrix) | 7,24 B | 32.768 | IQ3_M + imatrix, 3,628 b/w | Apache 2.0 | Baseline del paper para el presupuesto de +3,5 %; sin compresion Huffman |
| Mistral-7B-Instruct-v0.2 en GGUF estandar (Q5_K_M) | 7,24 B | 32.768 | Q5_K_M, 5,668 b/w | Apache 2.0 | Baseline del paper para el presupuesto de +1 %; mayor ancho de banda |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento cualitativo con estas alternativas; la comparacion disponible se limita a perplejidad de WikiText-2 y bits por peso.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Al ser una cuantizacion a ~4 bits con ajuste agresivo de codigos (`lam`, `c`), existe degradacion medible de perplejidad (+0,94 % o +1,46 % en WikiText-2) que puede traducirse en mayor tasa de error en tareas generativas.
- Riesgo de alucinacion heredado del modelo base Mistral-7B-Instruct-v0.2, agravado potencialmente por la cuantizacion; no se han publicado evaluaciones especificas de fidelidad factual para esta variante.
- Los bundles codificados solo se ejecutan con el runtime CUDA propio del repositorio; no son compatibles con llama.cpp ni con otros motores de inferencia estandar.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (13 de noviembre de 2026), por lo que no cuenta con validacion de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de la licencia del modelo base y de las dependencias del runtime.
- El rendimiento en produccion depende del soporte de hardware del runtime (Jetson Orin Nano Super y Jetson Nano documentados); no se garantiza funcionamiento en otras plataformas para el modo codificado.
- No se documentan capacidades de tool calling, agentes, vision ni audio; no deben asumirse.

## Enlaces

- Hugging Face: https://huggingface.co/arnabsanyal/LazyWeights-Mistral-7B-Instruct-v0.2
- Paper (arXiv 2611.17108): https://arxiv.org/abs/2611.17108
- Codigo (GitHub): https://github.com/arnabsanyal/lazyWeights
- Coleccion LazyWeights: https://huggingface.co/collections/arnabsanyal/lazyweights-6af7242c458566ddfc0b34de
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Directorio de GGUF: https://huggingface.co/arnabsanyal/LazyWeights-Mistral-7B-Instruct-v0.2/tree/main/gguf/kq
- Bundle ≤1 %: https://huggingface.co/arnabsanyal/LazyWeights-Mistral-7B-Instruct-v0.2/tree/main/rt_bundles/mistral_kq_IQ4_XS_g1_lam0
- Bundle ≤3,5 %: https://huggingface.co/arnabsanyal/LazyWeights-Mistral-7B-Instruct-v0.2/tree/main/rt_bundles/mistral_kq_IQ4_XS_g1_lam0_c1.5
