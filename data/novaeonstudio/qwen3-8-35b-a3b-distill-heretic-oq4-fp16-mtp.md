# NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ4-fp16-mtp

## Resumen

Qwen3.8-35B-A3B-Distill-Heretic-oQ4-fp16-mtp es una build cuantizada y "des-censurada" del modelo empero-ai/Qwen3.8-35B-A3B-Distill, publicada por Novaeon.Studio. Se trata de un MoE de arquitectura de la familia Qwen3.5/3.6 con 35.951.822.704 parametros totales y aproximadamente 3B activos, 256 expertos (8 enrutados) y 40 capas que combinan GatedDeltaNet con atencion completa, mas un codificador de vision. El contexto nativo es de 262.144 tokens y la licencia es Apache-2.0.

Lo relevante de esta ficha es que no es solo una cuantizacion: el autor aplico ablacion de rangos arbitrarios (ARA) con Heretic v2.0.0.dev0 sobre el checkpoint base para reducir el numero de rechazos de 98/100 a 2/100 en el conjunto de prompts nocivos de Heretic, con una divergencia KL de 0.248 (0.28 tras el merge y la cuantizacion). Despues fusiono el resultado de vuelta en el checkpoint original para conservar intactos el cabezal MTP nativo (42 tensores `mtp.*`) y la torre de vision, y cuantizo con oMLX en formato oQ4 (group size 64, escalas en float16, ~5,0 bpw efectivos, ~22,5 GB en disco).

El proposito declarado es ofrecer la misma velocidad de decodificacion del modelo original (103-112 tok/s en un Apple M5 Max) pero sin capa de rechazos, para escritura creativa, roleplay y research de red team. Es una build especifica para Apple Silicon y MLX, no para CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE de la familia Qwen3.5/3.6 (qwen3_5_moe), hibrida GatedDeltaNet + atencion completa, con codificador de vision |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | 262.144 tokens nativo |
| Tipos de cuantizacion | oQ4 (esta build, group size 64, escalas y pesos no cuantizados en float16, ~5,0 bpw efectivos); builds hermanas en oQ8 y oQ6; oQ2 construida y descartada por rendimiento roto |
| Idiomas soportados | en (unico idioma declarado en la model card); la suite interna de evaluacion incluye casos en aleman |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La arquitectura es un MoE de la familia Qwen3.5/3.6 con 35B parametros totales y ~3B activos por token, 256 expertos de los cuales se enrutan 8, y 40 capas. El bloque de atencion es hibrido: combina GatedDeltaNet con atencion completa, y solo 10 capas son de atencion completa con 2 cabezales KV (~20 KB por token de cache KV). Incluye ademas una torre de vision, lo que explica el pipeline `image-text-to-text`. El modelo base es empero-ai/Qwen3.8-35B-A3B-Distill, descrito por el autor como destilacion de profesores Qwen3.8 dentro de Qwen3.6-35B-A3B.

El proceso de construccion tiene tres etapas documentadas. Primero, ablacion con Heretic v2.0.0.dev0 (Arbitrary-Rank Ablation con busqueda Optuna de 60 trials) sobre PyTorch 2.14 MP, midiendo rechazos y KL contra el modelo original. Segundo, merge del resultado de vuelta en el checkpoint original para preservar el cabezal MTP nativo y la torre de vision. Tercero, cuantizacion con oMLX en oQ4. No se documentan en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO), ni el detalle completo del pipeline de ablacion mas alla de los pasos citados. La innovacion tecnica destacable es la preservacion del cabezal MTP, que segun el autor evita la penalizacion de ~2,5x en velocidad de decodificacion que sufren otras builds des-censuradas que lo eliminan.

## Capacidades

- Generacion de texto, escritura creativa, ficcion y roleplay, incluidos temas oscuros y lenguaje sin filtros.
- Razonamiento en modo "no-think" y modo thinking activable (`enable_thinking`), recomendado este ultimo solo para tareas de razonamiento duro.
- Tool calling y function calling: 11/11 en la suite interna de evaluacion, sin degradacion respecto al modelo original.
- Salida estructurada en JSON: 5/5 en la suite interna.
- Seguimiento de instrucciones: 5/6 en la suite interna (una perdida respecto al original).
- Contexto largo: needles de 20.000 a 50.000 tokens resueltos 4/4.
- Capacidad de absteccion (no responder cuando corresponde): 3/3.
- Generacion de codigo: 3/4 en la suite interna.
- Capacidades multilingues limitadas: el modelo declara solo ingles; la suite interna evalua 4 casos en aleman con 3/4 de exito.
- Capacidades de vision heredadas del modelo base (pipeline image-text-to-text y torre de vision preservada), aunque no se aportan metricas de evaluacion multimodal.
- Cabezal MTP (Multi-Token Prediction) nativo para acelerar la decodificacion.

## Casos de uso

- Escritura creativa y ficcion con temas oscuros: la reduccion de rechazos de 98/100 a 2/100 permite desarrollar narrativas con violencia, humor negro o conflictos morales sin interrupciones del asistente, manteniendo la coherencia en contextos largos gracias a los 262.144 tokens de ventana.
- Roleplay y personajes: el modelo mantiene personajes y tramas a lo largo de conversaciones extensas; su velocidad de decodificacion de 103-112 tok/s en Apple M5 Max hace viable la generacion en tiempo real.
- Asistente conversacional sin filtros para uso personal: temperatura 0,7 y top_p 0,95 para respuestas creativas, o temperatura 0-0,3 cuando se busca precision factual.
- Research de red team y seguridad: el autor lo posiciona explicitamente para estudiar comportamientos de modelos sin capa de rechazo, comparando la tasa de cumplimiento frente al modelo original sobre un mismo conjunto de prompts.
- Reduccion de danos y divulgacion tecnica: la suite interna incluye prompts de harm-reduction y lock-picking que el modelo original rechazaba en 2 de 10 casos y esta build rechaza en 0 de 10, lo que permite obtener informacion tecnica detallada en dominios sensibles.
- Generacion de texto con salida estructurada: conserva 5/5 en JSON y 11/11 en tool calling, por lo que puede emplearse en pipelines que requieran salidas parseables, siempre que no se trate de un agente autonomo con herramientas que produzcan efectos secundarios.
- Procesamiento de documentos largos en ingles: needles de 20.000 a 50.000 tokens resueltos sin degradacion, adecuado para analisis de documentacion tecnica o contractos extensos.
- Inferencia local en Apple Silicon: con ~22,5 GB en disco y 32 GB o mas de memoria unificada recomendados, es desplegable en un portatil o estacion de trabajo de gama alta con chip M-series.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible. Los unicos datos son mediciones propias del autor sobre un Apple M5 Max de 128 GB con oMLX, thinking desactivado y TurboQuant KV desactivado.

Suite golden interna (43 casos deterministas, mas 17 casos de "mitigation"):

| Categoria | original oQ8 | Heretic oQ8 | Heretic oQ6 | Heretic oQ4 |
|---|---|---|---|---|
| Tool calling | 11/11 | 11/11 | 11/11 | 11/11 |
| JSON | 5/5 | 5/5 | 5/5 | 5/5 |
| Seguimiento de instrucciones | 6/6 | 5/6 | 5/6 | 5/6 |
| Aleman | 4/4 | 3/4 | 3/4 | 3/4 |
| Needles de contexto largo | 4/4 | 4/4 | 4/4 | 4/4 |
| Razonamiento (no-think) | 3/6 | 2/6 | 2/6 | 2/6 |
| Absteccion | 3/3 | 3/3 | 3/3 | 3/3 |
| Codigo | 4/4 | 3/4 | 2/4 | 3/4 |
| **Total** | **40/43** | **36/43** | **35/43** | **36/43** |
| Suite de mitigation | 16/17 | 14/17 | 12/17 | 14/17 |

Velocidad medida (Apple M5 Max 128 GB, oMLX):

| Metrica | original oQ8 (seat) | Heretic oQ4 |
|---|---|---|
| Decode, prompt corto | ~126-129 tok/s | 103-112 tok/s |
| Decode a 53k tokens de contexto | ~91-103 tok/s | 102-106 tok/s |
| Prefill, 53k en frio | 3.331 tok/s | 2.567 tok/s |
| 4 peticiones concurrentes, agregado | ~221 tok/s | 203 tok/s |

Tasas de rechazo:

| Metrica | original (seat) | Heretic oQ4 |
|---|---|---|
| Conjunto nocivo de Heretic (100 prompts, pre-cuantizacion) | 98/100 | 2/100 |
| 10 prompts borderline legitimos (humor negro, tacos, harm-reduction, lock-picking, monologo de villano) | 2/10 rechazados | 0/10 rechazados |

## Requisitos de hardware

- Memoria unificada recomendada: 32 GB o mas; la build se construyo y midio en un Apple M5 Max con 128 GB.
- Tamano en disco: ~22,5 GB para los pesos oQ4 (el repositorio ocupa 22,5 GB).
- GPU: disenado para Apple Silicon (familia M-series) mediante MLX. No hay soporte CUDA documentado para esta build.
- Cabe en consumer hardware: si, en equipos Apple Silicon con al menos 32 GB de memoria unificada. No hay datos de despliegue en GPU NVIDIA consumer como RTX 4090.
- Opciones de despliegue: oMLX sobre Apple MLX (motor recomendado, endpoint compatible con OpenAI en `http://127.0.0.1:8000/v1`). El autor distribuye builds hermanas GGUF de otros modelos de la familia, pero esta build concreta es MLX/safetensors.
- Throughput medido: 103-112 tok/s en decode con prompt corto, 102-106 tok/s a 53k tokens de contexto, 203 tok/s agregados con 4 peticiones concurrentes, 2.567 tok/s de prefill a 53k en frio.
- Ajustes de rendimiento medidos: `mtp_enabled: true` con profundidad adaptativa (MTP desactivado implica ~35% menos decode; profundidad fija 2/3 resulto mas lenta); `turboquant_kv_enabled: false` (activarlo penaliza un 37% el decode a 53k de contexto y un 23% el throughput agregado, porque solo 10 capas usan atencion completa).

## Comparativa con modelos similares

Comparativa con las builds hermanas del mismo autor y el modelo original. No se dispone de datos de benchmarks estandar que permitan comparar con otros modelos de la misma categoria.

| Modelo | Parametros | Contexto | Suite golden (43) | Mitigation (17) | Tamano en disco | Licencia |
|---|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill-Heretic oQ4 (esta build) | 35,95B totales / ~3B activos | 262.144 | 36/43 | 14/17 | ~22,5 GB | Apache-2.0 |
| Qwen3.8-35B-A3B-Distill-Heretic oQ8 | 35,95B totales / ~3B activos | 262.144 | 36/43 | 14/17 | no disponible | Apache-2.0 |
| Qwen3.8-35B-A3B-Distill-Heretic oQ6 | 35,95B totales / ~3B activos | 262.144 | 35/43 | 12/17 | no disponible | Apache-2.0 |
| empero-ai/Qwen3.8-35B-A3B-Distill (base, sin ablacion) | 35,95B totales / ~3B activos | 262.144 | 40/43 | 16/17 | no disponible | Apache-2.0 |

La build oQ4 iguala el rendimiento de la oQ8 en la suite golden con aproximadamente el 57% del tamano, segun el autor. Frente al modelo base, la ablacion cuesta 4 puntos en la suite golden y 2 en la de mitigation.

## Limitaciones y advertencias

- La ablacion introduce una divergencia KL de ~0.25, que se traduce en perdida medible de precision aritmetica, codigo y aleman.
- El razonamiento en modo no-think cae de 3/6 a 2/6 respecto al modelo original, y no se recupera con cuantizaciones mayores.
- El autor desaconseja explicitamente su uso como agente autonomo de tool calling: los rechazos actuan como capa de seguridad cuando las herramientas producen efectos secundarios. Se recomienda el modelo original como seat de agente.
- Riesgo de alucinacion y de contenido nocivo elevado por diseno: la tasa de rechazo baja de 98/100 a 2/100 en el conjunto nocivo de Heretic.
- Idioma: solo se declara ingles. El rendimiento en otros idiomas no esta garantizado y la evaluacion en aleman ya muestra una perdida (3/4 frente a 4/4 del original).
- Requiere Apple Silicon y MLX/oMLX; no hay ruta de despliegue CUDA documentada. La integracion en stacks basados en vLLM, TGI o llama.cpp no esta soportada por esta build.
- El ajuste `turboquant_kv_enabled` debe permanecer desactivado para no perder rendimiento; activarlo degrada el decode de forma notable.
- Aunque la licencia del modelo y de la build es Apache-2.0, el uso comercial de un modelo deliberadamente des-censurado para generar contenido nocivo puede chocar con normativa aplicable y con las politicas de las plataformas de destino. La responsabilidad recae en el desplegador.
- Modelo con 0 descargas y 1 like en el momento de la consulta, publicado el 2026-10-03: no hay validacion independiente de las cifras aportadas por el autor.
- Los ajustes de sampling recomendados son temperatura 0,7 y top_p 0,95 para creatividad, y temperatura 0-0,3 para uso factual.

## Enlaces

- HuggingFace (esta build): https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ4-fp16-mtp
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Build hermana oQ8: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ8-fp16-mtp
- Build hermana oQ6: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-Heretic-oQ6-fp16-mtp
- Build oQ8 del seat original: https://huggingface.co/NovaeonStudio/Qwen3.8-35B-A3B-Distill-oQ8-fp16-mtp
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- oMLX (motor de cuantizacion e inferencia): https://github.com/jundot/omlx
- Novaeon.Studio: https://novaeon.studio
