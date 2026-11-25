# kingjones777/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF

## Resumen

Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF es una cuantización comunitaria en formato GGUF del modelo Qwen3.8-Flash-Next, publicada por el usuario kingjones777. No se trata de un modelo original, sino de una conversión optimizada para ejecutarse en hardware AMD integrado, concretamente el Ryzen AI Max+ 395 "Strix Halo" con GPU Radeon 8060S (arquitectura gfx1151). El modelo base, desarrollado por el equipo Qwen de Alibaba, cuenta con 176.943.899.520 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos densos de gran escala.

La particularidad de esta publicación es el uso del formato ROCmFP4, un tipo de tensor de 4 bits diseñado específicamente para aprovechar las capacidades de cómputo de las GPU AMD bajo ROCm. Para cargarlo no basta con llama.cpp estándar: se requiere un fork concreto del runtime que combine la arquitectura `qwen4exp` con los tipos de tensor ROCmFP4. El autor proporciona instrucciones de compilación, parches de corrección y un head MTP (Multi-Token Prediction) separado para decodificación especulativa.

Su relevancia radica en que demuestra que es posible ejecutar un modelo de casi 177.000 millones de parámetros en un equipo con memoria unificada de 128 GB y GPU integrada, algo inviable en tarjetas discretas de consumo. El precio a pagar es el ancho de banda: unos 215 GB/s medidos frente al entorno de 1 TB/s de una GPU dedicada de gama alta, lo que se traduce en velocidades de generación de alrededor de 24-32 tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con arquitectura `qwen4exp` (soporte de MTP y QSA indexer cache); detalles completos no disponibles |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Verificado de 2K a 128K con el parche de checkpoint aplicado; configuración recomendada `-c 32768` |
| Tipos de cuantizacion | ROCmFP4 (4 bits, tipos de tensor específicos de ROCm); head MTP disponible en Q8_0, Q6_K y Q4 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (repo de 94,4 GB, dividido en shards) |

## Arquitectura y entrenamiento

La información disponible no detalla la composición del dataset de entrenamiento ni las fases de alineación (RLHF, DPO) del modelo base Qwen3.8-Flash-Next. Lo que sí se documenta es la arquitectura de inferencia: el runtime debe soportar el tipo `qwen4exp`, que incluye un cabezal MTP (Multi-Token Prediction) para decodificación especulativa y un índice QSA (probablemente un mecanismo de atención con caché de índice) cuya gestión de estado en los checkpoints de contexto fue corregida mediante el parche `qwen4exp-qsa-checkpoint-fix.patch`.

La innovación técnica más destacable de esta publicación es la integración de los tipos de tensor ROCmFP4 en un fork de llama.cpp, junto con la corrección del grafo MTP. Según el autor, el combinador original del grafo MTP hacía mean-pooling de los flujos de hiperconexión, lo que degradaba la tasa de aceptación a ~0,36 y anulaba la ganancia de velocidad. El parche `qwen4exp-mtp-graph.patch` corrige este comportamiento y eleva la aceptación hasta 0,94 en cargas de razonamiento con `--spec-draft-n-max 1`.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-paso, con modo de pensamiento implícito en las cargas de tipo "reasoning" medidas.
- Generación de código, con rendimiento medido en la tabla de decodificación especulativa (26,80 tok/s con MTP frente a 24,09 tok/s sin él).
- Salida estructurada en JSON, evaluada explícitamente en los benchmarks del autor.
- Resumen de documentos largos, con contexto verificado hasta 128K tokens.
- Decodificación especulativa mediante head MTP externo, que acelera la generación sin alterar la salida (el modelo principal verifica cada token propuesto).
- Soporte de plantillas de chat vía `--jinja` en llama-server.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling y function calling: no documentado en la información disponible.

## Casos de uso

- Razonamiento asistido en local: el modelo puede ejecutar cadenas de razonamiento largas en un equipo de sobremesa con Ryzen AI Max+ 395, gracias a que los 128 GB de memoria unificada permiten cargar los ~98 GiB del modelo cuantizado. La decodificación especulativa con `--spec-draft-n-max 1` aporta hasta un 34% de mejora en esta carga concreta.
- Generación de código en estación de trabajo: con 26,80 tok/s medidos en la carga de código usando MTP, resulta viable para autocompletado y generación de fragmentos en un IDE local, aunque no para servir a múltiples usuarios simultáneos.
- Producción de JSON estructurado: la carga de salida JSON mantiene 27,24 tok/s con MTP (frente a 23,99 sin él), adecuada para pipelines de extracción de datos que requieran formato estricto y se ejecuten en hardware AMD integrado.
- Resumen de documentos extensos: el contexto verificado hasta 128K tokens permite procesar informes, contratos o expedientes completos en una sola pasada, con la salvedad de que el resumen de documentos largos es la carga donde MTP aporta menos (24,14 tok/s frente a 23,80, +1%).
- Laboratorio de investigación en hardware AMD: sirve como banco de pruebas para medir el impacto de ROCmFP4, la decodificación especulativa MTP y las correcciones de caché QSA en un entorno gfx1151, con cifras de referencia publicadas y reproducibles.
- Despliegue de un modelo de gran escala sin GPU discreta: para equipos con memoria unificada que no pueden costear una A100 o H100, esta cuantización ofrece capacidad de modelo que una GPU de 24 GB no alcanza, a costa de velocidad por token.
- Evaluación comparativa de cuantizaciones: el repo incluye variantes (Uncensored FAST con imatrix, STRIX_LEAN) que permiten comparar calidad y velocidad entre estrategias de cuantización sobre el mismo hardware.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a la variante Uncensored FAST (imatrix) con head MTP Q8_0, en gfx1151 con ROCm 7.2.4, contexto de 2048, greedy, `cache_prompt:false` y 256 tokens generados. Mediana de 3 ejecuciones por celda:

| Carga de trabajo | Sin MTP (tok/s) | `--spec-draft-n-max 4` | `--spec-draft-n-max 1` |
|---|---|---|---|
| Razonamiento | 23,91 | 30,94 (+29%, acc. 0,680) | 31,94 (+34%, acc. 0,945) |
| Salida JSON | 23,99 | 28,31 (+18%, acc. 0,597) | 27,24 (+14%, acc. 0,758) |
| Código | 24,09 | 21,56 (−10%, acc. 0,422) | 26,80 (+11%, acc. 0,711) |
| Resumen de documento largo | 23,80 | 20,36 (−14%, acc. 0,352) | 24,14 (+1%, acc. 0,641) |

El autor advierte que la cifra inicial de +27,7% provenía de un único prompt de tipo razonamiento y no es universal. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks académicos en la información disponible.

## Requisitos de hardware

- Memoria: el repo ocupa 94,4 GB; el autor indica que el modelo completo ronda los 98 GiB residentes en GTT. Se necesita un equipo con memoria unificada de al menos 128 GB.
- GPU objetivo: AMD Ryzen AI Max+ 395 "Strix Halo" con Radeon 8060S (gfx1151). Es el único hardware verificado en la model card.
- No cabe en GPU de consumo con VRAM discreta: 24 GB (RTX 4090) o 48 GB quedan muy lejos de los ~98 GiB necesarios.
- Ancho de banda medido: aproximadamente 215 GB/s en el sistema de prueba, frente a ~1 TB/s de una GPU discreta de gama alta.
- Runtime obligatorio: fork `kingjones30/ROCmFPX` (basado en `charlie12345/ROCmFPX`), compilado con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151`. llama.cpp estándar no carga el archivo.
- Parches necesarios: `qwen4exp-qsa-checkpoint-fix.patch` siempre; `qwen4exp-mtp-graph.patch` para decodificación especulativa (actualizado el 2026-09-17 para incluir los hunks de `models.h` y `llama-model.cpp`).
- Comando de referencia: `llama-server -m <primer shard>.gguf -md mtp-...-Q8_0.gguf --spec-type draft-mtp --spec-draft-n-min 0 --spec-draft-n-max 1 --n-gpu-layers-draft 99 -ngl 999 -fa on -np 1 -c 32768 --jinja`. `-np 1` es obligatorio con `draft-mtp`.
- Throughput medido: 23,80-24,09 tok/s sin MTP y hasta 31,94 tok/s con MTP en la mejor carga. El autor señala que MTP también penaliza la velocidad de prefill.
- Otras opciones de despliegue (vLLM, TGI, Ollama): no disponibles para este formato ROCmFP4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware objetivo | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF (esta ficha) | 176,9 B | 128K verificado | qwen-community-1.0 | AMD Strix Halo gfx1151 | Cuantización ROCmFP4, requiere fork de llama.cpp |
| Qwen/Qwen3.8-Flash-Next (base) | 176,9 B | no disponible | qwen-community-1.0 | GPU discretas con VRAM suficiente | Pesos originales en safetensors; sin cuantización comunitaria |
| Otras cuantizaciones GGUF del mismo base | 176,9 B | no disponible | qwen-community-1.0 | CPU/GPU con llama.cpp estándar | No emplean ROCmFP4; no verificadas en esta información |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Runtime no estándar: el archivo no carga en llama.cpp oficial. Depende de un fork de terceros y de parches que han requerido correcciones (una versión anterior del parche MTP aplicaba limpio pero no compilaba, con el error `'graph_mtp' was not declared in this scope`).
- Rendimiento dependiente de la carga: MTP con `n-max 4` pierde un 10% en código y un 14% en resumen de documentos largos. Solo `n-max 1` es consistentemente beneficioso en las mediciones del autor.
- Ancho de banda limitado: ~215 GB/s implica velocidades de un solo dígito bajo en comparación con GPU discretas; no apto para servir a múltiples usuarios concurrentes (`-np 1` obligatorio con MTP).
- Verificación parcial: el autor indica que la velocidad MTP de este tier concreto no se ha medido y que los heads Q6_K y Q4 no se han evaluado.
- Contexto: aunque verificado hasta 128K, la configuración recomendada es `-c 32768`; el comportamiento más allá de ese punto no está caracterizado en la model card.
- Idiomas: no disponibles; no se puede confirmar cobertura multilingüe.
- Sesgos y alucinaciones: no documentados en la información proporcionada; aplican los del modelo base, no caracterizados aquí.
- Licencia: qwen-community-1.0, etiquetada como "other". Es imprescindible revisar los términos de la licencia comunitaria de Qwen antes de cualquier uso comercial; la información disponible no detalla restricciones concretas.
- Naturaleza comunitaria: cuantización publicada por un usuario individual (2 likes, 595 descargas), sin validación independiente más allá de las pruebas del propio autor.
- Fecha de creación (2026-08-26) y actualizaciones posteriores (2026-09-17, 2026-11-24) indican un artefacto en evolución; conviene revisar la model card antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Heads MTP: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-MTP-Heads-GGUF
- Fork del runtime: https://github.com/kingjones30/ROCmFPX
- Runtime upstream: https://github.com/charlie12345/ROCmFPX
