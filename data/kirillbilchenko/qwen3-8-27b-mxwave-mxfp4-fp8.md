# kirillbilchenko/Qwen3.8-27B-MxWave-MXFP4-FP8

## Resumen

Qwen3.8-27B-MxWave-MXFP4-FP8 es un checkpoint cuantizado en precisión mixta del modelo multimodal `Qwen/Qwen3.8-27B`, publicado por el desarrollador kirillbilchenko bajo licencia Apache 2.0. No es una conversión oficial de Qwen: se trata de un experimento de la herramienta de cuantización MxWave, que parte del checkpoint MxWave H64 (MXFP4) y promueve 12 proyecciones medidas a FP8 por canal, manteniendo las 388 proyecciones de lenguaje restantes en MXFP4. El objetivo declarado es mejorar ligeramente la perplejidad respecto a H64 a cambio de un coste de aproximadamente un 2 % más de tamaño y un 2,2 % más de latencia en el runtime probado (DGX Spark).

El modelo conserva los 27.781.427.952 parámetros del modelo base (unos 27,8 B) y ocupa 20.250.144.780 bytes (18,86 GiB) en disco, frente a los 55.562.855.904 bytes de tensores del checkpoint original, lo que supone una ratio de compresión global de 2,747x. El pipeline es `image-text-to-text`, por lo que mantiene las capacidades multimodales del base: los tensores de visión, embeddings, head de lenguaje, normas y tensores MTP quedan en la precisión del checkpoint fuente, y solo se cuantizan las proyecciones lineales seleccionadas.

Su relevancia es acotada y muy específica: sirve como variante opcional de calidad dentro del ecosistema MxWave para despliegues vLLM en hardware Blackwell (SM121, DGX Spark), donde H64 sigue siendo la opción por defecto más pequeña y rápida. El repositorio tiene 0 descargas y 0 likes, y el propio autor lo etiqueta como experimental, con una mejora de perplejidad emparejada estadísticamente significativa pero un resultado de GSM8K positivo y no concluyente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención híbrida (capas de atención lineal y capas de atención completa) y tensores MTP; arquitectura base Qwen3.8 (tag `qwen3_5`) |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; la configuración de referencia en vLLM usa `--max-model-len 16384` |
| Tipos de cuantizacion | MXFP4 (OCP E2M1 con escalas E8M0 de bloque 32) en 388 proyecciones de lenguaje + FP8 por canal en 12 proyecciones; 799 tensores en precisión del modelo fuente |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con formato de runtime `compressed-tensors` mixto MXFP4/FP8 |
| Tamano del repositorio | 20.250.144.780 bytes (18,86 GiB); datos de tensores contabilizados en el manifiesto: 20.226.686.160 bytes |
| Ratio de compresion global | 2,747x sobre los 55.562.855.904 bytes de tensores del modelo fuente |
| Pipeline | image-text-to-text (multimodal) |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.8-27B (relación: quantized) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una conversión de cuantización post-entrenamiento. El checkpoint de partida es el MxWave H64 MXFP4 del mismo modelo base, y la herramienta empleada es MxWave, el toolkit abierto de cuantización con streaming y calibración del propio autor. La asignación de precisión se fijó antes de la evaluación final y se realizó sin usar etiquetas de tareas para seleccionar tensores: se generaron 12 candidatos semánticos que cubren cuatro familias de operaciones de runtime y tres bandas de profundidad; cada candidato se comparó con H64 frente a las mismas distribuciones de siguiente token en BF16 sobre dos particiones disjuntas de 16 contextos; solo se admitieron candidatos cuya KL forward media mejorase en ambas particiones, con un máximo de cuatro buckets y 1 GiB de datos de tensor añadidos; la asignación combinada debía mejorar las dos mitades de un holdout intacto de 96 contextos sin perder más de un acuerdo top-1 respecto a BF16.

La asignación final promueve 12 de los 400 tensores cuantizados: las proyecciones de salida de secuencia de las capas 8-11 (tres tensores `out_proj` de atención lineal y un `o_proj` de atención completa) y las proyecciones de entrada del MLP de las capas 51-54 (cuatro `gate_proj` y cuatro `up_proj`). Las 388 proyecciones de lenguaje restantes conservan los pesos MXFP4 E2M1 originales de H64 con escalas E8M0 de bloque 32. Embeddings, head de lenguaje, normas, tensores MTP, tensores de visión y demás tensores no objetivo permanecen en la precisión del modelo fuente. El incremento de datos de tensor es de 393.854.976 bytes (375,6 MiB) y la asignación exacta queda registrada en `mxwave-manifest.json`. En la ruta de runtime probada, los kernels de FP8 y MXFP4 son weight-only: las activaciones se mantienen en BF16.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto de forma conjunta (`image-text-to-text`): el pipeline declarado es multimodal y los tensores de visión se conservan en la precisión del checkpoint fuente.
- Razonamiento multi-paso y decodificación con tensores MTP (multi-token prediction) preservados sin cuantizar.
- Razonamiento matemático y aritmético: el autor reporta una evaluación determinista completa de GSM8K con 1.319 ejemplos de test, 5-shot y decodificación greedy, con resultado positivo pero no concluyente (cifra exacta no disponible).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas soportados no se detallan.
- Modo thinking explícito: no disponible.

## Casos de uso

- Despliegue de inferencia multimodal en DGX Spark: el checkpoint está validado con vLLM 0.29.0 sobre SM121 (`--linear-backend marlin`, `--max-model-len 16384`, `--max-num-seqs 4`, `--gpu-memory-utilization 0.45`), lo que permite servir entrada de imagen y texto con un peso en disco de 18,86 GiB y activaciones en BF16.
- Evaluación comparativa de métodos de cuantización: al publicar la asignación exacta de precisión, el manifiesto y el protocolo de selección, resulta útil como referencia reproducible para comparar MXFP4 frente a FP8 por canal en un mismo modelo base.
- Sustitución directa de H64 cuando prima la calidad sobre la velocidad: la mejora emparejada de perplejidad (−0,0969 % frente a H64, intervalo bootstrap del 95 % `[-0,1297 %, -0,0637 %]`) justifica su uso en tareas sensibles a pequeños degradados de distribución, asumiendo el 2,2 % de latencia extra.
- Procesamiento de documentos con imagen y texto en pipelines internos: la ventana configurada de 16.384 tokens permite ingerir páginas escaneadas más una instrucción larga sin trocear el contexto.
- Investigación en cuantización de precisión mixta: el runbook de presupuesto de precisión y las pruebas incluidas en MxWave permiten replicar o extender el método con otros modelos base.
- Generación asistida en entornos con memoria unificada limitada: al ocupar un 34 % menos que los 55,56 GB de tensores del modelo BF16, libera espacio para caché KV y procesamiento de imágenes en el mismo nodo.
- Evaluación de aritmética escolar como prueba de regresión: el autor usa GSM8K completo (1.319 ejemplos, 5-shot, greedy) con lm-evaluation-harness 0.4.13, un protocolo reutilizable para detectar degradados tras cambios de precisión.

## Benchmarks y rendimiento

Perplejidad de prompt sobre WikiText-2, protocolo de 316 ventanas independientes de 4.096 caracteres y 297.199 tokens puntuados (las perplejidades absolutas solo son comparables dentro de este protocolo):

| Modelo | Prompt PPL | Comparacion con el candidato |
|---|---:|---:|
| BF16 source | 7,980864 | 1,6378 % menos PPL |
| MxWave H64 | 8,119445 | 0,0969 % más PPL |
| **MxWave MXFP4/FP8** | **8,111578** | baseline |
| AMD Quark-AWQ MXFP4 | 8,187544 | 0,9278 % más PPL |

Holdout de distribución intacto (96 contextos):

| Metrica | H64 | Candidato |
|---|---:|---:|
| KL forward media frente a BF16 | 0,047117 | 0,044942 |
| Acuerdo top-1 con BF16 | 89/96 | 89/96 |

La diferencia de KL media candidato menos H64 fue de −0,002176 nats, negativa en ambas mitades predeclaradas del holdout, si bien el intervalo emparejado `[-0,005939, +0,000523]` cruza el cero, por lo que el paso de la puerta direccional no constituye una conclusión estadística independiente. El resultado numérico completo de GSM8K no está disponible en la información proporcionada; el autor lo describe como positivo pero estadísticamente no concluyente. La comparación H64/candidato está emparejada (mismos prompts, definiciones de tarea, semillas, decodificación, imagen de runtime y backend), con runtime `vllm/vllm-openai:v0.29.0` en el digest `sha256:c2914767605584b6d8f45686b82de173ecc99e781897aa3d0a66dacd72c51ae1`.

## Requisitos de hardware

- VRAM estimada para los pesos: 18,86 GiB en disco (20,25 GB); en runtime hay que sumar activaciones en BF16 (los kernels MXFP4/FP8 son weight-only) y caché KV en bfloat16.
- Hardware validado: DGX Spark con SM121, ejecutando vLLM 0.29.0 y backend lineal Marlin, con `--gpu-memory-utilization 0.45`. Las etiquetas del repositorio mencionan compatibilidad con Blackwell.
- GPU de consumo: no confirmado en la información proporcionada. Por tamaño de pesos, una GPU de 24 GB queda en el límite antes de contar caché KV y activaciones, por lo que se requiere verificación empírica.
- GPUs recomendadas: no disponible; no se documentan pruebas en A100, H100, RTX 4090 ni otras.
- Opciones de despliegue: vLLM 0.29.0 con `--load-format safetensors`, `--dtype bfloat16`, `--linear-backend marlin`, `--kv-cache-dtype bfloat16`, `--enable-chunked-prefill` y `--max-num-batched-tokens 8192`. No hay evidencia de soporte en llama.cpp, Ollama o TGI, ya que el formato es `compressed-tensors` y no GGUF.
- Aviso de compatibilidad: no debe usarse el interruptor obsoleto `VLLM_TEST_FORCE_FP8_MARLIN` con vLLM 0.29.0.
- Latencia y throughput: la única cifra publicada es comparativa, un 2,2 % más lento que MxWave H64 en el runtime DGX Spark probado; no se ofrecen valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MxWave MXFP4/FP8 (este) | 27,8 B | no disponible (config. probada 16.384) | 8,111578 | apache-2.0 | HuggingFace, 0 descargas |
| MxWave H64 MXFP4 | 27,8 B | no disponible | 8,119445 | apache-2.0 | variante por defecto del mismo autor, más pequeña y un 2,2 % más rápida |
| AMD Quark-AWQ MXFP4 | 27,8 B | no disponible | 8,187544 | no disponible | no disponible |
| Qwen/Qwen3.8-27B (BF16) | 27,8 B | no disponible | 7,980864 | no disponible en esta información | modelo base oficial |

Los cuatro son variantes del mismo modelo base, por lo que la comparación es de precisión y empaquetado, no de capacidades. Frente a H64, el candidato es aproximadamente un 2 % más grande y un 2,2 % más lento, con una mejora de perplejidad emparejada estadísticamente significativa. Frente a Quark-AWQ MXFP4, la mejora de perplejidad es del 0,9278 %, pero se desconoce si esa conversión tiene otro propósito de runtime o hardware objetivo.

## Limitaciones y advertencias

- Checkpoint experimental y no oficial: no es una publicación de Qwen, NVIDIA ni AMD, y su autor lo describe como variante opcional de calidad dentro de MxWave.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.
- Mejora de calidad pequeña: 0,0969 % de perplejidad frente a H64 y un intervalo de KL en el holdout que cruza el cero; el resultado de GSM8K se declara no concluyente.
- Coste de rendimiento: un 2 % más de tamaño y un 2,2 % más de latencia que H64, que sigue siendo el valor por defecto recomendado por el autor.
- Riesgo de alucinación: no cuantificado en la información disponible; es inherente al modelo base y puede variar con la cuantización.
- Idiomas soportados: no documentados; no se puede asumir cobertura multilingüe concreta a partir de esta ficha.
- Longitud de contexto máxima: no documentada; los 16.384 tokens corresponden a la configuración de vLLM probada, no necesariamente al límite del modelo.
- Compatibilidad de runtime restringida: requiere vLLM 0.29.0 con formato `compressed-tensors` y kernels MXFP4/FP8; el único hardware validado es SM121 (DGX Spark). Otros backends como llama.cpp u Ollama no están soportados.
- Sin datos de sesgo ni de seguridad: no se ha publicado ninguna evaluación de sesgos, toxicidad o alineación específica para este checkpoint.
- Licencia Apache 2.0 heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar las condiciones del `Qwen/Qwen3.8-27B` original antes de desplegarlo en producción.
- Las perplejidades absolutas son específicas del protocolo de ventanas de caracteres; no deben compararse con cifras obtenidas con otras ventanas o pasos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kirillbilchenko/Qwen3.8-27B-MxWave-MXFP4-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Toolkit de cuantización MxWave: https://github.com/kirillbilchenko/MxWave
- Runbook de presupuesto de precisión: https://github.com/kirillbilchenko/MxWave/blob/main/docs/PRECISION_BUDGET_RUNBOOK.md
- Manifiesto de asignación de precisión: `mxwave-manifest.json` en el propio repositorio de HuggingFace
- La búsqueda web no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a páginas generales de ChatGPT y no guardan relación con el checkpoint.
