# mradermacher/gemma3-27b-confettilike-v2-GGUF

## Resumen

`mradermacher/gemma3-27b-confettilike-v2-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `ToastyPigeon/gemma3-27b-confettilike-v2`, un merge de modelos construido con mergekit sobre la base de Gemma 3 de 27.000 millones de parametros de Google. El autor de las cuantizaciones es mradermacher, un conocido publicador de versiones GGUF de modelos abiertos, que distribuye tanto cuantizaciones estaticas (este repositorio) como versiones con imatrix en un repositorio separado.

El modelo resuelve el problema de ejecutar un modelo de ~27B en hardware de consumo o en entornos con recursos limitados, ofreciendo desde cuantizaciones Q2_K de 10,6 GB hasta Q8_0 de 28,8 GB, ademas de un proyector multimodal (mmproj) que preserva las capacidades de vision del modelo base. La arquitectura subyacente es la de Gemma 3 (transformer denso con atencion local/global alternada), aunque la model card no detalla la composicion exacta del merge.

Es relevante ahora porque permite desplegar un modelo multimodal de 27B en GPUs consumer (por ejemplo, una RTX 4090 con 24 GB puede ejecutar Q4_K_M de 16,6 GB con margen para contexto), algo que las versiones en safetensors de precision completa no permiten. Sin embargo, se trata de un merge experimental sin benchmarks publicados, con licencia no especificada en el repositorio y con documentacion tecnica muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Gemma 3), merge via mergekit |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun tags del repositorio) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento

El modelo base `ToastyPigeon/gemma3-27b-confettilike-v2` es un merge de modelos creado con mergekit, segun los tags del repositorio. La arquitectura subyacente corresponde a Gemma 3 de 27B, un transformer denso con atencion alternada entre capas locales y globales, pero la model card no especifica la receta del merge, los modelos fuente combinados ni los hiperparametros utilizados. Tampoco se documenta el entrenamiento posterior al merge (si lo hubo), ni datos de RLHF, DPO o fine-tuning adicional.

La informacion disponible no incluye el numero de tokens de entrenamiento, la composicion del dataset ni innovaciones tecnicas especificas del merge. Las cuantizaciones de mradermacher se generan con llama.cpp; el autor indica que las versiones con imatrix (ponderadas) estan en un repositorio separado (`gemma3-27b-confettilike-v2-i1-GGUF`) y suelen ofrecer mejor calidad que las estaticas de tamano similar. El repositorio incluye un proyector multimodal (mmproj) que habilita el procesamiento de imagenes, heredado de la capacidad de vision de Gemma 3.

## Capacidades

- Generacion de texto y razonamiento general, heredados del modelo base Gemma 3 de 27B.
- Procesamiento multimodal de imagenes mediante el proyector mmproj incluido (Q8_0 o f16).
- Generacion de codigo y matematicas (capacidad esperada por el tamano y la base Gemma 3, aunque no verificada con benchmarks en este repositorio).
- Soporte multilingue limitado: los tags del repositorio solo declaran ingles (`en`), aunque Gemma 3 base soporta mas idiomas; no se confirma en esta ficha.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere integracion con infraestructura de inferencia tipo Hugging Face Endpoints.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.

## Casos de uso

- Despliegue local en GPU consumer: una RTX 4090 (24 GB) puede ejecutar la cuantizacion Q4_K_M (16,6 GB) con espacio para contexto moderado, permitiendo usar un modelo de 27B multimodal en estaciones de trabajo sin GPUs de datacenter.
- Prototipado de asistentes multimodales: usando el mmproj junto con una cuantizacion Q4_K_M o Q5_K_M, se puede construir un asistente que describa imagenes, responda preguntas sobre capturas o extraiga informacion de documentos escaneados en local.
- Evaluacion de merges comunitarios: investigadores que quieran comparar el comportamiento de merges de Gemma 3 pueden descargar las distintas cuantizaciones y medir calidad frente al modelo base sin necesidad de infraestructura de precision completa.
- Inferencia en CPU o entornos sin GPU dedicada: las cuantizaciones Q2_K (10,6 GB) y Q3_K_S (12,3 GB) permiten ejecutar el modelo con llama.cpp en maquinas con RAM suficiente, a costa de perdida de calidad.
- Servicio de generacion de texto en ingles con presupuesto de VRAM ajustado: usando Q5_K_M (19,4 GB) en una A100 40GB o RTX 4090 se obtiene un equilibrio razonable entre calidad y velocidad para tareas de redaccion y resumen.
- Fine-tuning ligero o evaluacion de capacidades de codigo: aunque no hay benchmarks, el tamano de 27B permite usarlo como base para tareas de generacion de codigo en ingles, con la advertencia de que la calidad del merge no esta validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion): Q2_K ~10,6 GB; Q3_K_S ~12,3 GB; Q4_K_S ~15,8 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,4 GB; Q6_K ~22,3 GB; Q8_0 ~28,8 GB. Anadir ~0,7-1,0 GB si se usa el proyector multimodal mmproj.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40GB o H100 para Q6_K y Q8_0 con contexto amplio; GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo para Q2_K/Q3_K con contexto reducido.
- Cabe en GPU consumer: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q3_K o IQ4_XS a costa de calidad y contexto.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF como llama-cpp-python. Para el proyector multimodal se requiere soporte de mmproj en llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| gemma3-27b-confettilike-v2-GGUF (este) | ~27B | no disponible | no disponible | GGUF | Merge comunitario sin benchmarks |
| Gemma 3 27B oficial (google/gemma-3-27b-it) | ~27B | 128K (segun documentacion oficial de Gemma 3) | Gemma Terms of Use | safetensors, GGUF | Modelo base oficial con benchmarks publicados |
| Qwen2.5 32B Instruct (cuantizado) | ~32B | 128K (segun documentacion oficial) | Apache 2.0 | safetensors, GGUF | Alternativa abierta con licencia permisiva |
| Mistral Small 3 (24B) | ~24B | 32K (segun documentacion oficial) | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamano similar |

La comparativa se limita a datos de referencia de los modelos oficiales; no hay benchmarks del merge que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo merge sin benchmarks publicados: no hay evidencia de que supere o iguale al Gemma 3 27B oficial; la calidad del merge es desconocida.
- Licencia no especificada en el repositorio: no se puede confirmar si el uso comercial esta permitido; el modelo base Gemma 3 tiene sus propios terminos que probablemente apliquen.
- Idioma declarado: solo ingles (`en`); el rendimiento en castellano no esta verificado y podria degradarse respecto al Gemma 3 base.
- Riesgo de alucinacion: inherente a modelos de este tamano, agravado por la falta de evaluacion del merge.
- Contexto no documentado: se desconoce si conserva los 128K de Gemma 3 o si el merge lo reduce.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_M) con perdida notable de calidad; el autor recomienda Q4_K_S o Q4_K_M como minimo para uso practico.
- Repositorio con muy baja adopcion (53 descargas, 0 likes): sin validacion de la comunidad.
- Para produccion se recomienda usar el Gemma 3 27B oficial o un modelo con licencia clara y benchmarks publicados.

## Enlaces

- Repositorio Hugging Face (cuantizaciones estaticas): https://huggingface.co/mradermacher/gemma3-27b-confettilike-v2-GGUF
- Repositorio de cuantizaciones con imatrix: https://huggingface.co/mradermacher/gemma3-27b-confettilike-v2-i1-GGUF
- Modelo base original: https://huggingface.co/ToastyPigeon/gemma3-27b-confettilike-v2
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#gemma3-27b-confettilike-v2-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
