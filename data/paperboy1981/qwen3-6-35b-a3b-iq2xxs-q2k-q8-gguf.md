# paperboy1981/Qwen3.6-35B-A3B-IQ2XXS-Q2K-Q8-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF independiente y experimental del modelo Qwen3.6-35B-A3B, publicada por el usuario paperboy1981. No se trata de un modelo entrenado desde cero, sino de una compresion agresiva del modelo base de Qwen, obtenida a partir del GGUF en BF16 publicado por ggml-org y calibrada con la imatrix de Unsloth. El objetivo es reducir un modelo de aproximadamente 34.660 millones de parametros a un fichero de 10,93 GiB, apto para equipos con recursos limitados de memoria.

El modelo base es un transformer de tipo mezcla de expertos (MoE) de 40 capas, cuya nomenclatura A3B sugiere del orden de 3.000 millones de parametros activos por token, aunque la cifra exacta no se detalla en la informacion disponible. La cuantizacion emplea una estrategia de colocacion de precision por tipo de tensor: IQ2_XXS para las puertas y matrices up de los expertos enrutados, Q2_K para las matrices down de esos mismos expertos, Q8_0 para el resto de tensores cuantizables y F32 para los tensores sensibles. La licencia del modelo base es Apache 2.0.

Su relevancia radica en que permite ejecutar un MoE de casi 35.000 millones de parametros en hardware de gama de consumo mediante llama.cpp y runtimes compatibles, a cambio de una perdida de calidad que el autor reconoce no haber cualificado todavia. El repositorio incluye comprobaciones de integridad tensor a tensor, pero advierte explicitamente de que el rendimiento en inferencia y la compatibilidad en tiempo de ejecucion no han sido evaluados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 40 capas |
| Parametros totales | 34.660.610.688 (aproximadamente 34,66 mil millones) |
| Parametros activos | Aproximadamente 3.000 millones segun la nomenclatura A3B; cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (80 tensores de expertos enrutados gate/up), Q2_K (40 tensores down de expertos enrutados), Q8_0 (312 tensores), F32 (301 tensores) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero unico `Qwen3.6-35B-A3B-IQ2XXS-Q2K-Q8.gguf`, 11.737.315.584 bytes / 10,93 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE) de 40 capas, segun se desprende de la estructura de tensores documentada en la model card. La nomenclatura A3B indica un regimen de aproximadamente 3.000 millones de parametros activos por token, aunque el desglose completo de expertos enrutados y expertos compartidos no se detalla. El autor menciona tensores `ffn_gate_inp_shexp` (40 en total, correspondientes a los expertos compartidos, shared experts), lo que confirma la presencia de expertos compartidos ademas de los enrutados.

Esta ficha corresponde a una cuantizacion, no a un entrenamiento nuevo. El proceso partio del GGUF en BF16 de ggml-org (revision `baec3ebe`) y utilizo la imatrix de calibracion de Unsloth (76 fragmentos de calibracion, revision `a483e9e6`). La conversion se realizo con llama.cpp fijado en el commit `e60eff95`, aplicando overrides por tensor explicitos. La estrategia sigue la idea de colocacion de precision del receta de antirez para DeepSeek (DS4), pero el autor aclara que no se reclama una salida identica byte a byte con el conversor DS4. No se dispone de informacion sobre el conjunto de datos de entrenamiento original, el numero de tokens, ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y conversacion (la etiqueta `conversational` figura en el repositorio).
- Razonamiento y generacion de codigo, heredados del modelo base Qwen3.6-35B-A3B (no verificados en esta cuantizacion; la model card indica que la calidad de inferencia no ha sido cualificada).
- Soporte de entrada de imagen mediante un proyector de vision opcional (`mmproj-Qwen3.6-35B-A3B-Q8_0.gguf`), que debe descargarse sin recuantizar desde ggml-org. Su uso con este GGUF principal no ha sido validado.
- Decodificacion especulativa mediante un sidecar MTP opcional (`mtp-Qwen3.6-35B-A3B-Q8_0.gguf`), tambien procedente de ggml-org y no requantizado. Sin validar en combinacion con esta cuantizacion.
- Capacidades de tool calling y de agentes: no confirmadas en la informacion disponible para esta cuantizacion.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de gama de consumo: el fichero de 10,93 GiB permite cargar el modelo en GPUs con 12-16 GB de VRAM, habilitando pruebas de un MoE de casi 35.000 millones de parametros en hardware asequible.
- Prototipado e investigacion en cuantizacion extrema: sirve como caso de estudio para evaluar como se degrada un MoE de gran tamano al comprimir los expertos enrutados a IQ2_XXS y Q2_K manteniendo el resto en Q8_0/F32.
- Ejecucion en CPU con offload parcial: mediante llama.cpp u Ollama, el modelo puede repartirse entre RAM y VRAM cuando la GPU no dispone de memoria suficiente, a costa de mayor latencia.
- Generacion de texto conversacional local: para tareas de redaccion y dialogo en entornos sin conectividad o con requisitos de privacidad, siempre que se acepte la perdida de calidad de la cuantizacion.
- Pruebas de compatibilidad de runtimes: util para verificar el soporte de GGUF con precisiones mixtas (IQ2_XXS, Q2_K, Q8_0, F32) en llama.cpp y derivados.
- Experimentacion con decodificacion especulativa y vision: al poder acoplarse los sidecars MTP y mmproj de ggml-org, permite probar pipelines multimodales o de decodificacion acelerada, aunque el autor advierte que estas combinaciones no han sido cualificadas.
- Comparativas de calidad frente al modelo base en BF16 o en cuantizaciones mas altas (por ejemplo Q4_K_M), para medir el coste real de bajar a 2 bits en los expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la calidad de inferencia, la compatibilidad en tiempo de ejecucion y el rendimiento no han sido cualificados.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 11-12 GB solo para los pesos del fichero (10,93 GiB), a lo que hay que sumar la cache KV y los buffers de contexto, cuyo tamano depende de la longitud de contexto configurada.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4070 Ti / 4080 / 4090, y GPUs de datacenter como A100 o H100 para despliegues de mayor concurrencia.
- Compatibilidad con GPU de consumo: si, cabe en GPUs con 12 GB o mas de VRAM en configuraciones de contexto corto; con contextos largos o lotes grandes puede requerir 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes basados en GGUF; tambien servidores compatibles con el formato GGUF. Para despliegues de alto rendimiento con vLLM o TGI se necesitarian pesos en safetensors, no disponibles en este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paperboy1981/Qwen3.6-35B-A3B-IQ2XXS-Q2K-Q8-GGUF | 34,66 mil millones (MoE, ~3B activos) | no disponible | GGUF (10,93 GiB) | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 34,66 mil millones (MoE) | no disponible | safetensors / BF16 | apache-2.0 | HuggingFace |
| ggml-org/Qwen3.6-35B-A3B-GGUF (BF16) | 34,66 mil millones (MoE) | no disponible | GGUF (BF16) | apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento que permitan comparar la calidad frente a otras cuantizaciones del mismo modelo base ni frente a MoE de tamano similar de otros fabricantes.

## Limitaciones y advertencias

- Cuantizacion experimental: los expertos enrutados se comprimen a IQ2_XXS y Q2_K, niveles muy agresivos que suelen degradar la coherencia, el razonamiento y la fidelidad de las respuestas. El autor no ha cualificado la calidad.
- Calidad no verificada: la propia model card afirma que la calidad de inferencia y la compatibilidad en tiempo de ejecucion no han sido evaluadas.
- Riesgo de alucinacion: previsiblemente elevado por la precision reducida de los expertos; no se han publicado mediciones.
- Uso de sidecars sin validar: los ficheros MTP (decodificacion especulativa) y mmproj (vision) no forman parte de este repositorio y su combinacion con este GGUF no ha sido cualificada.
- Idiomas soportados: no disponibles; se desconoce el comportamiento multilingue de esta cuantizacion.
- Longitud de contexto: no disponible; se desconoce si la cuantizacion afecta a la ventana de contexto efectiva.
- Licencia: Apache 2.0 heredada del modelo base, que en principio permite uso comercial, pero se recomienda verificar los terminos del repositorio original de Qwen.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Fecha de creacion inusual: el repositorio figura creado el 2026-10-09, dato que conviene tratar con cautela.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/paperboy1981/Qwen3.6-35B-A3B-IQ2XXS-Q2K-Q8-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- GGUF en BF16 de ggml-org (entrada de la conversion): https://huggingface.co/ggml-org/Qwen3.6-35B-A3B-GGUF
- Imatrix de calibracion de Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Receta de colocacion de precision de antirez (DS4): https://github.com/antirez/ds4/blob/main/gguf-tools/README.md#convert-deepseek-v41-flash
- Sidecar MTP para decodificacion especulativa: https://huggingface.co/ggml-org/Qwen3.6-35B-A3B-GGUF/blob/main/mtp-Qwen3.6-35B-A3B-Q8_0.gguf
- Proyector de vision (mmproj): https://huggingface.co/ggml-org/Qwen3.6-35B-A3B-GGUF/blob/main/mmproj-Qwen3.6-35B-A3B-Q8_0.gguf
