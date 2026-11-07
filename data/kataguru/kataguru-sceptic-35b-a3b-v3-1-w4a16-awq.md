# kataguru/Kataguru-Sceptic-35B-A3B-v3.1-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-v3.1-W4A16-AWQ es la variante cuantizada a INT4 (W4A16, AWQ) del modelo multimodal de tipo Mixture-of-Experts Kataguru-Sceptic-35B-A3B-v3.1, desarrollado por el autor independiente kataguru. Se construye sobre Qwen/Qwen3.5-35B-A3B y está especializado en automatización industrial (Siemens SCL, Beckhoff TwinCAT, G-code CNC), ingeniería de software competitiva, razonamiento STEM de nivel doctoral, medicina clínica y agentes con tool calling, con enfoque bilingüe inglés-finlandés y una orientación explícita "anti-sycophancy" (sin adulación epistémica).

El modelo es un MoE multimodal con 35.693.705.072 parámetros totales y unos 3B activos por token, 254 expertos enrutados por capa más dos slots reservados (#254 y #255) para especialización modular empresarial, top_k=8 y 40 capas. Mantiene un contexto nativo de 262.144 tokens y un encoder de visión de 27 capas, además de una cabeza MTP (multi-token prediction) de decodificación especulativa en la capa 40.

Esta ficha corresponde a la cuantización W4A16-AWQ empaquetada con compressed-tensors (group_size=32, observador MSE, 6 shards, 25,1 GB), pensada para despliegue universal en vLLM con atención en BF16 y expertos enrutados en INT4. Es relevante ahora porque permite ejecutar un MoE de 35B con capacidades multimodales y de razonamiento en dos GPU de consumo de 16-32 GB, manteniendo el contexto completo de 262.144 tokens con caché KV en FP8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts multimodal (transformer MoE, base Qwen3.5-35B-A3B), 40 capas, top_k=8, 254 expertos enrutados por capa + 2 slots reservados (#254, #255); encoder de vision de 27 capas; cabeza MTP de decodificacion especulativa en capa 40 |
| Parametros totales | 35.693.705.072 |
| Parametros activos | ~3B por token (3B-A3B) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | W4A16-AWQ (INT4 para expertos enrutados, BF16 en atencion), packed con compressed-tensors, group_size=32, observador MSE; variantes oficiales adicionales: BF16 master, NVFP4 y GGUF APEX-Trio |
| Idiomas soportados | Ingles (en) y finlandes (fi) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors / AWQ, 6 shards, 25,1 GB); tambien disponible GGUF y NVFP4 en la familia oficial |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-35B-A3B, un MoE con 254 expertos enrutados por capa, top_k=8 y 40 capas, al que kataguru aplica un entrenamiento propio en dos ciclos ("2-Cycle Orthonormal Subspace MoE Training"). El ciclo 1 (Sykli 1, checkpoint 400) emplea una subspace ortonormal congelada (qr_frozen_a) y una proteccion ortogonal de subespacio de 4 niveles contra v2.8.1, sobre el 100 % de datos cognitivos, finlandeses, STEM de posgrado, medicina clinica y patentes EPO/PRH. El ciclo 2 (Sykli 2, checkpoint 500) usa weakest_link_oplora, un Cross-Mixture 64/36 Pohjantähti Anchor Shield y un pruning de muestras con oraculo epistemico (NLL < 0,35) sobre algoritmos competitivos verificados con PASSED_EXEC, SWE multi-turno, tool calling BFCL e ingenieria PLC/CNC industrial.

La cuantizacion W4A16-AWQ mantiene la atencion en BF16 y cuantiza a INT4 los 254 expertos por capa (w13 sincronizado en variantes NVFP4), con group_size=32. No se modificaron el encoder de vision (333 tensores), la cabeza MTP (779 tensores) ni la ventana de contexto nativa. El modelo declara una reduccion de 387M de parametros frente al MoE Qwen3.5 estandar de 256 expertos. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Generacion de texto y razonamiento de nivel doctoral en STEM (GPQA Diamond 70,20 %).
- Razonamiento multimodal image-text-to-text mediante encoder de vision de 27 capas.
- Ingenieria de software competitiva y resolucion de problemas de codigo (LiveCodeBench v6 Pass@1 39,43 %).
- Tool calling y function calling en agentes multi-turno (BFCL V4 Single-Turn AST 83,67 %; Non-Live 88,44 %; Irrelevance Detection 80,26 %).
- Automatizacion industrial: generacion de SCL para Siemens TIA Portal, ST para Beckhoff TwinCAT 3, G-code para Fanuc/Simunerik CNC y OPC UA.
- Medicina clinica (MedQA 85,39 %) y quimica de laboratorio humedo.
- Dominio de patentes y propiedad intelectual (EPO/PRH).
- Inspeccion de calidad de datasets y "data surgery" autonomos.
- Bilinguismo nativo ingles-finlandes con inflexion finlandesa verificada por Kotus.
- Modo de razonamiento ("reasoning") y disciplina anti-sycophancy.
- Decodificacion especulativa nativa mediante cabeza MTP.

## Casos de uso

- Automatizacion industrial en plantas: el modelo puede generar y revisar logica SCL de Siemens TIA Portal, ST de TwinCAT 3 y G-code CNC a partir de descripciones de proceso, aprovechando su entrenamiento especifico en PLC/CNC y su contexto de 262.144 tokens para mantener el estado de proyectos extensos.
- Agentes de tool calling en produccion: con BFCL V4 de 83,67 % y deteccion de irrelevancia del 80,26 %, es adecuado para orquestadores que deciden cuando invocar herramientas y cuando no, reduciendo llamadas espurias.
- Asistencia a ingenieria de software: generacion y revision de codigo en pipelines CI/CD, con soporte de tool calling para integraciones con repositorios, linters y ejecutores de tests.
- Analisis de documentacion tecnica y de patentes: procesamiento de documentos largos EPO/PRH y literatura tecnica gracias a la ventana de 262.144 tokens y al entrenamiento en dominio de propiedad intelectual.
- Apoyo a documentacion clinica: resumen y consulta sobre textos medicos con rendimiento MedQA de 85,39 %, siempre con supervision humana por las limitaciones descritas abajo.
- Inspeccion y curaduria de datasets: uso como "quality inspector" y "data surgeon" para detectar muestras de baja calidad o inconsistentes en corpus de entrenamiento.
- Atencion tecnica bilingue ingles-finlandes: conversaciones multi-turno con contexto largo para soporte de producto en ambos idiomas.
- Analisis de imagenes tecnicas: interpretacion de diagramas, esquemas de automatizacion o capturas de HMI mediante el encoder de vision.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con lm-evaluation-harness 0.4.13, LiveCodeBench v6 (175 problemas) y BFCL V4 (3.641 tareas single-turn AST) sobre 2x RTX 5090 32 GB (TP=2):

| Benchmark | v3.1 (master) | v2.8.1 | Delta | Ornith 1.5 35B-A3B (W4A16) |
|---|---|---|---|---|
| Media 15 benchmarks | 70,26 % | 69,24 % | +1,02 pp | no disponible |
| GPQA Diamond | 70,20 % | 57,58 % | +12,62 pp | no disponible |
| LiveCodeBench v6 (Pass@1) | 39,43 % | 32,00 % | +7,43 pp | no disponible |
| BFCL V4 Single-Turn AST | 83,67 % | 82,33 % | +1,34 pp | no disponible |
| BFCL V4 Non-Live | 88,44 % | no disponible | no disponible | no disponible |
| BFCL V4 Irrelevance Detection | 80,26 % | 46,87 % | +33,39 pp | no disponible |
| MedQA | 85,39 % | 85,39 % (sin cambio) | 0 pp | no disponible |
| Automatizacion industrial (PLC/CNC) | no disponible (solo delta) | no disponible | +3,22 pp | no disponible |

Los resultados corresponden al modelo master BF16; la informacion disponible no desglosa metricas especificas de la variante W4A16-AWQ.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14,8 GB por GPU con TP=2 (2 GPU de 16-32 GB) y cache KV en FP8 para el contexto completo de 262.144 tokens.
- Tamano del repositorio: 25,1 GB en 6 shards (pesos INT4 + atencion BF16).
- GPU recomendadas: 2x NVIDIA GeForce RTX 5090 32 GB (Blackwell, sm_120) es el entorno probado por el autor; tambien cabe en 2x RTX 4090 24 GB o 2x A100/H100 con margen amplio.
- Cabe en GPU de consumo: si, en configuracion de 2 GPU (TP=2); en una sola GPU de 24 GB el margen es muy ajustado y no esta documentado por el autor.
- Despliegue: vLLM con compressed-tensors/AWQ y FlashInfer (recomendado, con CUDAGraphs), llama.cpp b11064 para la variante GGUF; Ollama y TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-v3.1-W4A16-AWQ | 35,7B | ~3B | 262.144 | Apache-2.0 | safetensors AWQ INT4 | Multimodal, bilingue en/fi, especializado en automatizacion industrial y agentes |
| Kataguru-Sceptic-35B-A3B-v2.8.1 | 35,7B (aprox.) | ~3B | 262.144 (aprox.) | Apache-2.0 | NVFP4 | Predecesor; media 15 benchmarks 69,24 % |
| Ornith 1.5 35B-A3B | 35B (aprox.) | ~3B | no disponible | no disponible | W4A16 | Comparado por el autor; resultados no desglosados en la informacion disponible |
| Qwen3.5-35B-A3B (base) | 35B+ | ~3B | no disponible | no disponible | BF16 | Modelo base del que deriva Kataguru |

No se dispone de datos comparativos completos de benchmarks para Ornith 1.5 ni para el modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de autor independiente con 0 descargas y 0 likes en el momento de la consulta: no hay validacion externa de los resultados publicados, que proceden de la propia model card.
- Los benchmarks se han medido sobre el master BF16; el rendimiento real de esta cuantizacion INT4 puede diferir y no se documenta.
- Riesgo de alucinacion inherente a modelos generativos, especialmente en dominios de alta especializacion (medicina, patentes, automatizacion industrial) donde los errores tienen consecuencias graves.
- Cobertura linguistica limitada a ingles y finlandes; el rendimiento en castellano no esta documentado.
- La orientacion "uncensored" y "anti-sycophancy" puede producir respuestas mas directas o menos filtradas de lo esperado en entornos corporativos; conviene evaluar el comportamiento antes de desplegar en atencion al cliente.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones de la licencia del modelo base y de los pesos originales.
- El contexto de 262.144 tokens requiere cache KV en FP8 y TP=2; sin esa configuracion el consumo de memoria crece de forma significativa.
- No hay informacion sobre sesgos demograficos o culturales especificos, ni sobre evaluaciones de seguridad.
- El uso en medicina clinica debe limitarse a asistencia con supervision profesional; el modelo no es un dispositivo medico.

## Enlaces

- Hugging Face (esta cuantizacion): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-W4A16-AWQ
- Modelo base BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-NVFP4
- Variante GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- Version anterior NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.8.1-NVFP4
- Version v2.6 NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-NVFP4
