# flechin/Qwen3.8-27B-Randean-GGUF

## Resumen

Qwen3.8-27B-Randean-GGUF es una distribucion en formato GGUF del modelo afinado Qwen3.8-27B-Randean v3.0, publicado por el usuario flechin sobre la base de Qwen/Qwen3.8-27B. El modelo original parte de la familia Qwen3.8 (arquitectura Qwen3.5) con aproximadamente 26.900 millones de parametros y un pipeline multimodal image-text-to-text, es decir, acepta entradas de texto e imagen. Esta version GGUF esta pensada para su ejecucion local en llama.cpp, Ollama y LM Studio, e incluye calibracion con importance matrix (imatrix) para las cuantizaciones Q4_K_M y Q6_K, ademas de un proyector de vision separado en BF16.

El objetivo declarado del afinado es reforzar el razonamiento epistemico, la "alineacion con la realidad", la reduccion de hedging excesivo, la resistencia a la adulacion (anti-sycophancy) y el anclaje causal, con enfasis en uso agentico y tool calling. El autor publica un conjunto de canarios propios (Precision Tools Hard, H5 Active Grounding) y afirma mejoras sustanciales frente al modelo base sin alinear en esas pruebas, aunque se trata de evaluaciones internas no estandarizadas.

Es relevante ahora porque ofrece una via practica de desplegar un modelo de ~27B con vision y capacidades agenticas en hardware de consumo o estaciones de trabajo de 24-48 GB de VRAM, con licencia Apache 2.0 y pesos listos para inferencia. La ficha se basa exclusivamente en la informacion publicada en el repositorio; los datos no disponibles se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, segun tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama-server usa `-c 32768` |
| Tipos de cuantizacion | Q4_K_M, Q6_K, Q8_0 (GGUF); imatrix para Q4_K_M y Q6_K; MXFP4 en el modelo canonico |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con `mmproj-BF16.gguf` para vision e `imatrix.gguf` para recuantizacion |

## Arquitectura y entrenamiento

La model card identifica el modelo como perteneciente a la familia Qwen3.5 y lo describe como un transformer multimodal con torre de vision (pipeline image-text-to-text). No se detallan en la informacion disponible el numero de capas, la dimension oculta, el mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El proceso de cuantizacion se realizo por dequantizacion bit-exacta desde el modelo MXFP4 (`flechin/Qwen3.8-27B-Randean-MXFP4`, v3.0-arm-b) mediante el conversor nativo `qwen35` de llama.cpp, con `--no-nextn` y una diferencia maxima verificada de `0.000000` en los pesos. La importance matrix se calculo con `llama-imatrix --process-output` sobre 129 fragmentos (`c = 512`) del corpus publico `calibration_datav3.txt`. El proyector de vision se exporto directamente desde el codificador BF16 sin cuantizar (334 tensores).

Respecto al entrenamiento del modelo afinado, la informacion disponible no especifica el volumen de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card si declara objetivos de alineacion concretos (epistemologia, anti-sycophancy, anclaje causal, reduccion de hedging) y la existencia de una version previa v2.0, lo que sugiere iteraciones de ajuste, pero sin detallar la metodologia.

## Capacidades

- Generacion de texto y razonamiento, con modo de razonamiento configurable en llama-server (`--reasoning-format deepseek`).
- Procesamiento de imagenes (image-text-to-text) mediante `mmproj-BF16.gguf`.
- Tool calling estructurado y function calling, con soporte de plantilla Jinja (`--jinja`).
- Uso agentico y razonamiento multi-paso, segun los tags `agentic` y las pruebas de "state recovery" y "schema" reportadas.
- Capacidades matematicas y de codigo, verificadas en el smoke test del autor (math, structured tool calling y vision, 3/3 PASS).
- Comportamiento orientado a reducir la adulacion y el hedging excesivo, con enfasis en respuestas fundamentadas y restriccion ante imposibilidades fisicas o matematicas.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistentes de codigo en local: el modelo puede integrarse en flujos de llama.cpp u Ollama para autocompletado, refactorizacion y explicacion de codigo, con tool calling para invocar herramientas de build o test; el autor reporta 72,0% en LiveCodeBench v6 para la version canonica MXFP4.
- Agentes autonomos de terminal: con 56,2% en Terminal-Bench 2.1 (version MXFP4), es viable para tareas de automatizacion de shell y pipelines multi-paso en entornos controlados.
- Analisis de documentos con imagenes: gracias al proyector de vision, puede extraer informacion de capturas, diagramas o formularios junto a texto, en estaciones de trabajo con 24-48 GB de VRAM.
- Asistencia tecnica con respuestas no aduladoras: el enfasis anti-sycophancy y de anclaje causal lo hace adecuado para revisiones criticas, auditorias de codigo o evaluacion de propuestas donde se penaliza la complacencia.
- Despliegue en hardware de consumo: la cuantizacion Q4_K_M (16,5 GB) permite ejecutarlo en una GPU de 24 GB o en Apple Silicon con 32 GB o mas de RAM, habilitando prototipado local sin nube.
- Recuantizacion y personalizacion: el `imatrix.gguf` incluido permite generar cuantizaciones adicionales (IQ4_XS, Q5_K_M, etc.) para ajustar el equilibrio tamano/calidad a hardware especifico.
- Razonamiento con restricciones: los canarios de "physical/math impossibility restraint" (100% en Q8_0) sugieren utilidad en dominios donde el modelo debe rechazar premisas imposibles en lugar de inventar respuestas.

## Benchmarks y rendimiento

Los datos siguientes proceden de los canarios internos del autor (Precision Tools Hard con T=0.2 y H5 Active Grounding) y de benchmarks publicos citados para la version canonica MXFP4. No son evaluaciones independientes.

| Modelo / formato | Precision Tools Hard (T=0.2) | H5 Active Grounding | Notas |
|---|---:|---:|---|
| Randean v3.0 Q4_K_M (imatrix) | 100,0% (48/48) | 75,6% | +20,8% frente a Q4_K_M sin calibrar (79,2%) |
| Randean v3.0 Q6_K (imatrix) | 89,6% (43/48) | 77,8% | Mejor equilibrio en GPU unica de 32 GB |
| Randean v3.0 Q8_0 | 85,4% (41/48) | 75,6% | 100% (16/16) en restriccion fisico-matematica |
| Randean v3.0 MXFP4 (vLLM) | 91,7% (44/48) | 82,2% | 56,2% Terminal-Bench 2.1; 72,0% LiveCodeBench v6; #1/171 en BullshitBench v2 |
| Qwen3.8-27B base (MXFP4) | 64,6% (31/48) | 60,0% | Linea base sin alinear |

Rendimiento de inferencia reportado en una GPU R9700 (single-stream):

| Cuantizacion | Tamano | Velocidad | Hardware |
|---|---:|---:|---|
| Q4_K_M | 16,5 GB | 31,6 tok/s | 1 GPU |
| Q6_K | 22,1 GB | 25,2 tok/s | 1 GPU |
| Q8_0 | 28,6 GB | 19,5 tok/s | 2 GPU |

## Requisitos de hardware

- VRAM estimada: Q4_K_M ~16,5 GB de pesos (recomendado 24 GB de VRAM); Q6_K ~22,1 GB (recomendado 32 GB); Q8_0 ~28,6 GB (48 GB o dos GPU de 24-32 GB). El proyector de vision anade 931 MB.
- GPU recomendadas: por el perfil de memoria, encajan RTX 4090 (24 GB) para Q4_K_M, RTX 5090 o A100 40 GB para Q6_K, y A100 80 GB o H100 para Q8_0 o contexto largo. El autor verifico velocidades en una R9700.
- Cabe en GPU de consumo: si, con Q4_K_M en GPUs de 24 GB (RTX 4090, 3090, 7900 XTX) y en Apple Silicon con 32 GB o mas de RAM unificada.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/flechin/...`), LM Studio, y vLLM/ROCm para el modelo canonico MXFP4.
- Latencia y throughput: 31,6 tok/s (Q4_K_M, 1 GPU), 25,2 tok/s (Q6_K, 1 GPU), 19,5 tok/s (Q8_0, 2 GPU) en single-stream segun el autor.
- Parametros de decodificacion recomendados: temperature 0.2, top_p 0.95 para tool use y codigo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| Qwen3.8-27B-Randean v3.0 (este) | ~26,9 B | no disponible | Si (mmproj) | Apache 2.0 | GGUF, MXFP4 |
| Qwen3.8-27B base (referencia) | ~26,9 B | no disponible | Si | Apache 2.0 | Pesos originales |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Citado en la model card |
| Pi | no disponible | no disponible | no disponible | no disponible | Citado en la model card |
| Swift-1.5 | no disponible | no disponible | no disponible | no disponible | Citado en la model card |
| Inkling-2-Mini | no disponible | no disponible | no disponible | no disponible | Citado en la model card |

Los modelos comparables citados por el autor aparecen en su suite de 1.374 items, pero la informacion disponible no incluye sus especificaciones ni resultados desglosados, por lo que no se pueden contrastar aqui.

## Limitaciones y advertencias

- Los benchmarks presentados son canarios propios del autor, no evaluaciones independientes; deben interpretarse con cautela y no sustituyen a MMLU, HumanEval, GSM8K u otros estandares.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- No se especifican los idiomas soportados; el rendimiento fuera del ingles y el chino (idiomas habituales de la familia Qwen) es desconocido.
- La longitud de contexto real no se declara; el valor 32768 del ejemplo de llama-server es una configuracion de despliegue, no una especificacion confirmada.
- Riesgo de alucinacion inherente a los modelos de ~27B, mitigado solo parcialmente por el ajuste anti-sycophancy; no hay datos de tasas de alucinacion.
- El enfasis en "de-hedged" puede producir respuestas mas asertivas de lo deseable en dominios con incertidumbre alta; conviene validar en produccion.
- La licencia Apache 2.0 permite uso comercial, pero se hereda de Qwen/Qwen3.8-27B y de amd/Qwen3.8-27B-Quark-AWQ-MXFP4, por lo que conviene revisar las condiciones de esos repositorios base.
- La cuantizacion Q4_K_M, aunque calibrada con imatrix, introduce perdida de precision; para tareas sensibles se recomienda Q6_K o Q8_0.
- No hay informacion sobre sesgos demograficos, toxicidad ni evaluaciones de seguridad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/flechin/Qwen3.8-27B-Randean-GGUF
- Modelo canonico MXFP4: https://huggingface.co/flechin/Qwen3.8-27B-Randean-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base de cuantizacion: https://huggingface.co/amd/Qwen3.8-27B-Quark-AWQ-MXFP4
- Demo ZeroGPU: https://huggingface.co/spaces/flechin/randean
- Logo del proyecto: https://huggingface.co/flechin/Qwen3.8-27B-Randean-MXFP4/resolve/main/assets/randean_logo.jpg
