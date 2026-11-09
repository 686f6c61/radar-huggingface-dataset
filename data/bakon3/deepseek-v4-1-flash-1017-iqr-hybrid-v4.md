# bakon3/DeepSeek-V4.1-Flash-1017-IQR-hybrid-v4

## Resumen

DeepSeek-V4.1-Flash-1017-IQR-hybrid-v4 es una cuantizacion mixta del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario bakon3 en Hugging Face. El artefacto se distribuye como contenedor `.rad` para la libreria Radiance, un runtime de inferencia orientado a GPUs AMD con ROCm y arquitectura RDNA4. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos del modelo base de DeepSeek a un formato cuantizado con mezcla de tipos IQ3R e IQ2R segun la capa.

La relevancia de esta publicacion es fundamentalmente de infraestructura: demuestra un pipeline de cuantizacion agresiva (down a unos 262,75 GiB de contenedor) para un modelo de gran tamano, con un enfoque hibrido en el que las capas de expertos enrutados mas sensibles conservan mayor precision (IQ3R) mientras el resto cae a IQ2R. Incluye tambien un drafter de decodificacion especulativa en las capas 40-42.

Conviene subrayar que el repositorio no contiene los pesos en el momento de la consulta ("Weights are not in this repo yet") y que el modelo base referenciado no dispone de documentacion publica verificable en la informacion proporcionada. Por tanto, muchas especificaciones del modelo original (contexto, numero de parametros, idiomas) no estan disponibles y se indican como tal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (inferido del uso de "routed experts" y "drafter"); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: IQ3R (u3, tcq 16, mad, fwht128) e IQ2R (u2, tcq 15) en expertos; atencion en u6/u7; embeddings y salida en q6_K; tabla engram en iq4_nl |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Contenedor Radiance `.rad` (no safetensors ni GGUF) |
| Tamano del contenedor | 262,75 GiB (282.125.652.296 bytes); copia en orden de lane 262,87 GiB |
| Libreria de inferencia | Radiance |
| Hardware objetivo | AMD ROCm, RDNA4 |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE), a juzgar por la nomenclatura de "routed experts" por capa y la presencia de un mecanismo de drafter para decodificacion especulativa. La cuantizacion aplicada es selectiva: las capas 6, 7, 8, 9, 10, 12, 14, 16, 25, 28, 29 y 31 mantienen sus expertos enrutados en IQ3R, mientras que el resto de expertos enrutados se comprimen a IQ2R. Las capas 40-42, correspondientes al drafter, se conservan en IQ3R. La atencion usa cuantizacion u6/u7, y embeddings y capa de salida quedan en q6_K.

Un detalle tecnico destacable es la tabla "engram" de 103 GiB en `iq4_nl`, que segun la model card se reconstruye a partir del tokenizer porque la release original no la incluye. Esto implica un paso adicional de preparacion antes de poder ejecutar el modelo. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si hubo RLHF o DPO; todo ello corresponde al modelo base, del que no se aportan datos en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Razonamiento y resolucion de problemas, segun los resultados reportados en HumanEval (144/164) y GSM8K (198/200).
- Generacion de codigo, con un rendimiento en HumanEval de 144 aciertos sobre 164.
- Razonamiento matematico de nivel escolar, con 198 aciertos sobre 200 en GSM8K.
- Decodificacion especulativa mediante drafter integrado en las capas 40-42, orientada a reducir latencia en generacion.
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Evaluacion de cuantizaciones agresivas en hardware AMD: el contenedor permite medir la perdida de calidad de IQ2R frente a IQ3R en un mismo modelo, comparando las capas con distinto tipo de cuantizacion y verificando el impacto en HumanEval y GSM8K.
- Despliegue en clústeres con GPUs RDNA4: con 4x32 GB en TP4 se reportan 74,5 tok/s en decode y 1106 tok/s en prefill, lo que hace viable servir el modelo en un nodo de cuatro aceleradores para cargas interactivas.
- Generacion de codigo asistida en entornos con ROCm: el modelo puede integrarse en asistentes de programacion o pipelines de revision de codigo, apoyandose en su rendimiento en HumanEval y en la decodificacion especulativa para reducir la latencia por token.
- Razonamiento matematico y verificacion de soluciones: con GSM8K a 198/200, es adecuado para tareas de resolucion de problemas aritmeticos y como componente de sistemas de razonamiento por pasos.
- Investigacion en formatos de empaquetado: el contenedor `.rad` y la distincion entre layout nativo y copia en orden de lane permiten estudiar el impacto del layout de memoria en el rendimiento de inferencia sobre ROCm.
- Benchmarking de runtimes alternativos: sirve para comparar Radiance frente a otras pilas de inferencia en GPUs AMD, usando las cifras de prefill y decode como referencia reproducible.
- Prototipado de decodificacion especulativa: el drafter en capas 40-42 permite experimentar con estrategias de verificacion y aceptacion de tokens en un modelo de gran tamano cuantizado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| HumanEval | 144/164 | Reportado por el autor en la model card |
| GSM8K | 198/200 | Reportado por el autor en la model card |
| Decode | 74,5 tok/s | 256 tokens, 4x32 GB RDNA4, TP4 |
| Prefill | 1106 tok/s | 11.789 tokens de entrada |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Las cifras anteriores corresponden exclusivamente a esta cuantizacion y al hardware indicado.

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 262,75 GiB, por lo que la inferencia requiere al menos esa cantidad de memoria agregada, mas overhead de runtime.
- Configuracion reportada: 4 GPUs de 32 GB RDNA4 en tensor parallelism 4 (TP4), es decir, 128 GB en total, lo que sugiere que el modelo se ejecuta con offload o gestion de memoria fuera de VRAM; el detalle no esta disponible.
- No cabe en una GPU de consumo individual. Se requiere un nodo multi-GPU con aceleradores AMD RDNA4 o superior.
- GPUs recomendadas: RDNA4 de 32 GB (configuracion validada por el autor). Para NVIDIA (A100, H100) no hay soporte declarado, ya que el runtime Radiance y los tags apuntan a ROCm/AMD.
- Opciones de despliegue: Radiance con backend ROCm. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 74,5 tok/s en decode y 1106 tok/s en prefill en la configuracion TP4 indicada.
- Requiere reconstruir la tabla engram (103 GiB, `iq4_nl`) desde el tokenizer antes de ejecutar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-IQR-hybrid-v4 | no disponible | no disponible | `.rad` (Radiance) | MIT | Cuantizacion mixta IQ3R/IQ2R, 262,75 GiB, orientada a ROCm |
| DeepSeek-V4.1-Flash-1017-uncensored-rad (UD-IQ1_S) | no disponible | no disponible | `.rad` | MIT (segun tag) | Variante sin censura, 251,13 GiB, misma familia |
| DeepSeek-V4.1-Flash-1017-IQR-IQ3R | no disponible | no disponible | `.rad` | MIT (segun tag) | Variante planificada con expertos en IQ3R, 307,60 GiB |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | no disponible | no disponible | no disponible | no disponible | Modelo original de DeepSeek |

La comparativa se limita a variantes de la misma familia publicadas por el mismo autor, ya que no se dispone de datos de modelos alternativos de caracteristicas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Los pesos no estan incluidos en el repositorio en el momento de la consulta: la model card indica explicitamente "Weights are not in this repo yet".
- El modelo base DeepSeek-V4.1-Flash-1017 no dispone de documentacion publica verificable en la informacion proporcionada; se desconocen arquitectura exacta, contexto, idiomas y datos de entrenamiento.
- La cuantizacion IQ2R en la mayoria de expertos enrutados puede degradar la calidad respecto al modelo original; no se aporta una comparacion contra el base sin cuantizar.
- La tabla engram no se distribuye y debe reconstruirse desde el tokenizer, lo que anade complejidad y posibles discrepancias en la reproducibilidad.
- Dependencia estricta del runtime Radiance y de ROCm/RDNA4: no hay soporte declarado para CUDA, vLLM, llama.cpp u Ollama, lo que limita la portabilidad.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible.
- La licencia MIT del contenedor no exime de verificar la licencia del modelo base, cuyo termino no se detalla aqui.
- Cifras de rendimiento (74,5 tok/s decode, 1106 tok/s prefill) corresponden a una configuracion concreta de 4x32 GB RDNA4 en TP4 y no son extrapolables a otro hardware.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-IQR-hybrid-v4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Variante sin censura (UD-IQ1_S): https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-uncensored-rad
- Variante IQR IQ3R (planificada): https://huggingface.co/bakon3/DeepSeek-V4.1-Flash-1017-IQR-IQ3R
- Coleccion Radiance de DeepSeek-V4.1-Flash: https://huggingface.co/collections/bakon3/deepseek-v41-flash-radiance-6af1ddf468e089a2acfccafd
