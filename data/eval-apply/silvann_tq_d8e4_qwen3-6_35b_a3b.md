# eval-apply/silvann_tq_D8E4_qwen3.6_35b_a3b

## Resumen

`silvann_tq_D8E4_qwen3.6_35b_a3b` es un empaquetado cuantizado del modelo Qwen/Qwen3.6-35B-A3B, publicado por el usuario eval-apply. No se trata de un modelo nuevo ni de un fine-tune: el repositorio solo cambia cómo se almacenan los pesos del modelo original de Qwen, aplicando una política de cuantización mixta denominada D8E4 (matrices densas a 8 bits, expertos enrutados a 4 bits). El resultado ocupa unos 19 GB en disco y el repositorio completo pesa 37,8 GB.

La relevancia de esta ficha no está en el modelo base, sino en el formato de empaquetado: `silvann-packed-v3`, un contenedor específico para el motor SiLVANN (Eval-Apply GPU Interpreter y su librería de redes neuronales). No es legible por `transformers` ni por las herramientas habituales (vLLM, llama.cpp, Ollama), lo que restringe su uso al runtime propietario de SiLVANN v0.18.0 o superior.

El modelo base es un Mixture-of-Experts de Qwen con 35B de parámetros totales y 3B activos por token, presumiblemente con capas de atención y DeltaNet (así se deduce de la política de cuantización descrita en la model card). La licencia Apache 2.0 del original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo base Qwen3.6-35B-A3B; la model card menciona proyecciones de atención y DeltaNet) |
| Parametros totales | 35B (modelo base) |
| Parametros activos | 3B (modelo base, según denominación A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta D8E4: expertos enrutados a 4 bits (TurboQuant, escala por fila); matrices densas (atención, DeltaNet, experto compartido, embedding y head) a 8 bits; normas, router y tensores pequeños sin pérdida |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `silvann-packed-v3` (`pack.json`, `layers/NNN/`, `global.pkl`); no compatible con safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un MoE de Qwen con 35B de parámetros totales y 3B activos, que combina capas de atención con capas DeltaNet (una variante de atención lineal/estado recurrente) según se desprende de la descripción del empaquetado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO: esos datos pertenecen a la model card del modelo original, que no se ha proporcionado.

La innovación técnica de este repositorio es el códec de cuantización: cada matriz se rota a lo largo de su eje de entrada con una rotación bloqueada de Hadamard y signos antes de cuantizarse, lo que reduce los valores atípicos y mejora la fidelidad a 4 y 8 bits. Los expertos enrutados se almacenan como registros independientes, de modo que cada experto leído de disco requiere una sola lectura; según el autor, esta disposición del formato v3 permitió que el modelo de 122B respondiera un 15 % más rápido desde un array NVMe en comparación con los packs anteriores, que agrupaban los expertos por tensor y requerían cuatro lecturas por experto.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.6-35B-A3B; no verificadas en este empaquetado.
- Capacidades de código y matemáticas: presumibles por la familia Qwen, pero no documentadas en este repositorio.
- Tool calling y function calling: no documentado en este repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado en este repositorio.
- Capacidades multilingües: no documentadas; el campo de idiomas no está disponible.
- Visión: la model card menciona que `global.pkl` incluye la torre de visión, lo que sugiere que el modelo base es multimodal, aunque no se detalla su funcionamiento en este formato.
- Modo thinking: no documentado en este repositorio.

## Casos de uso

- Despliegue en infraestructura con SiLVANN: el caso de uso principal y prácticamente exclusivo es servir el modelo con el runtime SiLVANN v0.18.0 o superior, que es el único capaz de leer el formato `silvann-packed-v3`.
- Inferencia en GPU con presupuesto de memoria ajustado: con unos 19 GB de pesos empaquetados, el modelo cabe en GPUs de 24 GB (RTX 4090, L4, A10G) si el runtime y las cachés de activaciones lo permiten, algo que no ocurriría con el modelo en precisión completa.
- Servicio desde almacenamiento NVMe: el diseño de registros por experto y la lectura única por experto hacen que este pack sea adecuado para despliegues que cargan expertos bajo demanda desde disco en lugar de mantener todos los pesos en VRAM.
- Evaluación comparativa de cuantización: útil para medir la degradación de calidad de la política D8E4 frente al modelo original en tareas de razonamiento y generación, siempre que se use el runtime adecuado.
- Investigación sobre formatos de pesos: sirve como referencia práctica de un esquema de cuantización mixta con rotaciones Hadamard y política de anchura por tensor.
- Archivado y distribución del modelo base con menor huella de almacenamiento: 19 GB frente al tamaño del original en precisión completa, con la ventaja de conservar normas y router sin pérdida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento mencionada es la mejora del 15 % en velocidad de respuesta del modelo de 122B con el formato v3 respecto a packs anteriores, medida por el autor sobre un array NVMe y no aplicable directamente a este modelo de 35B.

## Requisitos de hardware

- VRAM estimada: los pesos empaquetados ocupan unos 19 GB; hay que añadir caché KV y activaciones, por lo que se recomienda un mínimo de 24 GB de VRAM para inferencia completa en GPU.
- GPU recomendadas: RTX 4090 (24 GB), L4 (24 GB), A10G (24 GB) para despliegues ajustados; A100 (40/80 GB) y H100 (80 GB) para mayor margen de contexto y concurrencia.
- GPU de consumo: cabe en RTX 4090 y, presumiblemente, en RTX 3090 (24 GB); no cabe en GPUs de 16 GB o menos sin offloading.
- Opciones de despliegue: únicamente el runtime SiLVANN v0.18.0 o superior. No es compatible con vLLM, llama.cpp, Ollama, TGI ni `transformers`.
- Latencia y throughput: no disponibles para este modelo; el autor solo reporta una mejora relativa del 15 % en el modelo de 122B con el formato v3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| silvann_tq_D8E4_qwen3.6_35b_a3b | 35B totales / 3B activos | no disponible | silvann-packed-v3 | Apache 2.0 | Solo runtime SiLVANN |
| Qwen/Qwen3.6-35B-A3B (original) | 35B totales / 3B activos | no disponible | safetensors (presumible) | Apache 2.0 | `transformers`, vLLM, TGI, etc. |
| eval-apply/Qwen3.6-35B-A3B_silvann_tq_D8E4 | 35B totales / 3B activos | no disponible | silvann-packed-v3 | Apache 2.0 | Solo runtime SiLVANN |
| eval-apply/Qwen3.5-122B-A10B_silvann_tq_D8E4 | 122B totales / 10B activos | no disponible | silvann-packed-v3 | Apache 2.0 | Solo runtime SiLVANN |

La diferencia frente al original no está en capacidades ni en parámetros, sino en el formato y el peso en disco. La comparación con el pack de 122B del mismo autor resulta útil para elegir escala: el de 35B cabe en GPUs de 24 GB, mientras que el de 122B requiere infraestructura mayor.

## Limitaciones y advertencias

- Dependencia total del runtime SiLVANN: el formato `silvann-packed-v3` no lo lee `transformers`, y por tanto tampoco vLLM, llama.cpp, Ollama ni TGI. Sin SiLVANN v0.18.0 o superior el modelo es inutilizable.
- Compatibilidad hacia atrás parcial: una copia descargada antes de v0.18.0 sigue funcionando con versiones posteriores, pero no al revés.
- Cuantización con pérdida: los expertos enrutados se almacenan a 4 bits, lo que puede degradar la calidad frente al modelo original; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Sesgos y alucinaciones: no documentados en este repositorio; son los heredados del modelo base Qwen3.6-35B-A3B y deben evaluarse por separado.
- Idiomas y contexto: no disponibles en la información proporcionada; conviene consultar la model card del modelo original antes de usarlo en producción multilingüe o con contextos largos.
- Licencia: Apache 2.0, que permite uso comercial, pero el autor del pack no ofrece garantías sobre el comportamiento del formato ni sobre el runtime.
- Repositorio de bajo uso: 106 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del empaquetado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/eval-apply/silvann_tq_D8E4_qwen3.6_35b_a3b
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Pack equivalente sin sufijo de autor: https://huggingface.co/eval-apply/Qwen3.6-35B-A3B_silvann_tq_D8E4
- Pack del modelo de mayor escala: https://huggingface.co/eval-apply/Qwen3.5-122B-A10B_silvann_tq_D8E4
