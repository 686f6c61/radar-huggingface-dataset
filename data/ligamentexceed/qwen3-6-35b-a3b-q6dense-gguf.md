# ligamentexceed/Qwen3.6-35B-A3B-Q6dense-GGUF

## Resumen

Qwen3.6-35B-A3B-Q6dense-GGUF es una recuantización en formato GGUF del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario ligamentexceed. No se trata de un modelo nuevo ni de un ajuste fino: es el mismo modelo base de la familia Qwen3.6, un MoE disperso de 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, convertido a un esquema de cuantización mixto poco habitual que combina pesos densos en Q6_K con expertos enrutados en Q4_K/Q5_K y embeddings en Q8_0.

El interés de esta ficha es práctico: el autor buscaba un GGUF que conservase la calidad del modelo original con cuantizaciones densas de mayor precisión, pero que fuese más rápido al usar el bloque MTP (multi-token prediction) nativo del modelo para decodificación especulativa. La validación reportada es un acuerdo de siguiente token voraz con llama.cpp de 443/445 posiciones y una KL media de 0,002, lo que indica una fidelidad muy alta respecto a la implementación de referencia. El autor lo probó específicamente en AMD Strix Halo (gfx1151) con el runtime gufo.

Es relevante ahora porque permite ejecutar un MoE de 35B con activación de ~3B en hardware de gama alta de consumo o en equipos con memoria unificada, manteniendo el bloque MTP que acelera la generación. El repositorio tiene 170 descargas y 0 likes en el momento de redactar esta ficha, con licencia Apache-2.0 heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso con atención híbrida (GDN + atención completa), estilo Qwen3.5; incluye bloque MTP nativo |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Mixta: pesos densos del tronco (atencion, DeltaNet, experto compartido, cabeza de salida) en Q6_K; expertos enrutados en Q4_K (gate/up) y Q5_K (down), con algunas capas en Q5_K/Q6_K; embeddings de tokens y pesos densos del bloque MTP en Q8_0; normas, router y parametros SSM en F32 (router MTP en BF16) |
| Idiomas soportados | no disponible en la informacion proporcionada (tag "conversational") |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un unico fichero, 22.388.168.960 bytes) |

## Arquitectura y entrenamiento

El modelo base es un MoE disperso perteneciente a la familia Qwen3.6, con 35.505.251.456 parametros totales y aproximadamente 3B activos por token. Segun la documentacion de vLLM Ascend, emplea una arquitectura de atencion hibrida (GDN junto con atencion completa) heredada de los modelos tipo Qwen3.5, y esta orientado a servir en linea con contexto largo. El tag `qwen35moe` del repositorio es coherente con esa ascendencia. El checkpoint incorpora un bloque MTP (multi-token prediction) que permite decodificacion especulativa usando el propio modelo como borrador.

Esta publicacion concreta no entrena ni ajusta nada: es una recuantizacion. Segun la model card, parte del GGUF en BF16 y de la matriz de importancia de `unsloth/Qwen3.6-35B-A3B-MTP-GGUF` en la revision `5bc3e238d916f48a861bac2f8a1990a0e9b7e98d`, y se cuantiza con `llama.cpp` `b11069` (commit `68d9053a`) mediante `llama-quantize --imatrix` y un fichero `q6dense.types` que fija el tipo de cada tensor. No hay informacion sobre el dataset de entrenamiento original, el numero de tokens vistos ni si hubo RLHF o DPO, mas alla de la mencion generica a datos de texto e imagen en la ficha de NVIDIA NGC. La innovacion tecnica de este repositorio es la receta de cuantizacion mixta y la conservacion del bloque MTP en precision Q8_0, que es lo que habilita la decodificacion especulativa desde el mismo fichero.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y el pipeline `text-generation` confirman uso dialogado.
- Razonamiento multi-paso: herencia del modelo base Qwen3.6, sin detalle adicional en la informacion proporcionada.
- Decodificacion especulativa con MTP: el bloque MTP se conserva en Q8_0 y se activa con `--speculative mtp` en gufo o `--spec-type draft-mtp` en llama.cpp.
- Capacidades multimodales: la ficha de NVIDIA NGC menciona datos de entrenamiento de tipo texto e imagen, pero no se confirma en la informacion disponible que este GGUF conserve torre de vision.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en equipos con memoria unificada: con 22,4 GB de fichero, encaja en maquinas tipo AMD Strix Halo (gfx1151) usando gufo, que es precisamente el escenario validado por el autor.
- Servicio conversacional autoalojado: lanzando `llama-server -m Qwen3.6-35B-A3B-Q6dense.gguf -ngl 999 -fa on --spec-type draft-mtp` se obtiene un endpoint compatible con la API de OpenAI sobre un unico fichero, sin necesidad de descargar pesos en BF16.
- Aceleracion de generacion en produccion: al ser un MoE de ~3B activos con decodificacion especulativa MTP, el coste por token generado es bajo en comparacion con un denso de 35B, algo util en cargas con muchos usuarios concurrentes y respuestas largas.
- Experimentacion y evaluacion de cuantizaciones: el repositorio incluye el fichero `q6dense.types`, lo que permite reproducir exactamente la asignacion de tipos por tensor y comparar contra otras recetas (por ejemplo UD-Q4_K_XL de Unsloth) con criterios objetivos como el acuerdo de siguiente token.
- Sustitucion de pesos en pipelines ya montados sobre llama.cpp: cualquier despliegue que ya use `llama.cpp` b11069 o posterior puede adoptar este fichero sin cambiar de runtime.
- Investigacion sobre decodificacion especulativa: el bloque MTP en Q8_0 y la metrica de KL reportada lo convierten en un banco de pruebas razonable para medir el impacto de la cuantizacion en la calidad de las propuestas del borrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni metricas equivalentes) para el modelo base ni para esta cuantizacion.

El unico dato cuantitativo aportado por el autor es una medida de fidelidad respecto a la implementacion de referencia en llama.cpp con decodificacion voraz: 443/445 posiciones coincidentes y una divergencia KL media de 0,002. Tambien afirma que los pesos densos en Q6_K dieron la misma calidad de tarea que UD-Q4_K_XL y fueron mas rapidos con MTP en AMD Strix Halo (gfx1151) con gufo, sin publicar cifras de throughput o latencia.

## Requisitos de hardware

- VRAM estimada: el fichero ocupa 22.388.168.960 bytes (aproximadamente 20,9 GiB); sumando cache KV y overhead de runtime, se necesita del orden de 24-26 GB de memoria disponible. Es una estimacion, no un dato publicado por el autor.
- GPU recomendadas: AMD Strix Halo (gfx1151) es el hardware validado explicitamente. Para GPUs discretas, se requieren tarjetas con 24 GB o mas (RTX 4090, RTX 5090, A100 40 GB, H100), aunque no hay validacion publicada en esas plataformas.
- Cabe en GPU de consumo: si en RTX 4090 (24 GB) y RTX 5090 (32 GB), de forma ajustada en el primer caso; en tarjetas de 16 GB o menos no cabe sin descarga parcial a CPU.
- Opciones de despliegue: gufo (`gufo serve llm --model ... --speculative mtp`) y llama.cpp (`llama-server`, b11069 o posterior). No se menciona soporte de vLLM, TGI u Ollama para este fichero concreto; vLLM Ascend documenta el modelo base, no este GGUF.
- Latencia y throughput: no disponibles. El autor solo afirma cualitativamente que la combinacion Q6_K denso mas MTP fue mas rapida que otras cuantizaciones densas probadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| ligamentexceed/Qwen3.6-35B-A3B-Q6dense-GGUF | 35.505.251.456 (aproximadamente 3B activos) | GGUF mixto Q6_K / Q4_K / Q5_K / Q8_0 / F32 | 22,4 GB | apache-2.0 | Incluye bloque MTP en Q8_0; validado en Strix Halo con gufo; 170 descargas |
| unsloth/Qwen3.6-35B-A3B-MTP-GGUF | 35.505.251.456 (aproximadamente 3B activos) | GGUF (entre otros UD-Q4_K_XL) | no disponible | apache-2.0 (heredada) | Fuente del BF16 y de la matriz de importancia usados por este repositorio |
| Qwen/Qwen3.6-35B-A3B | 35.505.251.456 (aproximadamente 3B activos) | safetensors BF16 | no disponible (del orden de 71 GB en BF16, calculado a partir del numero de parametros) | apache-2.0 | Modelo original del equipo Qwen; referencia de calidad |

No se dispone de comparativas con modelos de otros fabricantes en la misma categoria (por ejemplo MoE de 30-40B con 3B activos) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Los datos de sesgo, alucinacion y comportamiento en idiomas distintos del ingles no estan publicados para este repositorio ni se detallan en la informacion disponible.
- La cuantizacion degrada la fidelidad respecto al BF16. El propio autor reporta 2 discrepancias en 445 posiciones y un KL medio de 0,002, cifra muy baja pero no nula; en tareas de razonamiento largo o generacion de codigo el efecto acumulado puede ser mayor.
- Aunque los pesos densos estan en Q6_K, los expertos enrutados estan mayoritariamente en Q4_K/Q5_K, por lo que la precision efectiva de la mayor parte de los parametros es la de una cuantizacion de 4-5 bits.
- El soporte de decodificacion especulativa MTP depende de versiones concretas: llama.cpp b11069 o posterior, o el runtime gufo. Versiones antiguas no reconoceran `--spec-type draft-mtp`.
- No hay validacion publicada en GPUs NVIDIA ni en vLLM/TGI; el unico entorno probado es AMD Strix Halo con gufo.
- La licencia Apache-2.0 permite uso comercial, pero al ser una recuantizacion de obra ajena conviene mantener la atribucion al equipo Qwen y a Unsloth tal como hace la model card.
- La fecha de creacion del repositorio registrada (2026-10-03) y la de actualizacion (2026-10-03) son las que figuran en la ficha; conviene verificarlas en el momento de la consulta.
- El repositorio tiene 0 likes y 170 descargas, por lo que la validacion por parte de la comunidad es escasa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ligamentexceed/Qwen3.6-35B-A3B-Q6dense-GGUF
- Perfil del autor: https://huggingface.co/ligamentexceed
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- GGUF y matriz de importancia de origen: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Runtime gufo: https://github.com/gufo-org/gufo
- Documentacion de Qwen3.6-35B-A3B en vLLM Ascend: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.6-35B-A3B.html
- Version 0.18.0 de la misma documentacion: https://docs.vllm.ai/projects/ascend/en/v0.18.0/tutorials/models/Qwen3.6-35B-A3B.html
- Ficha del modelo base en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.6-35b-a3b/nim-bf16
