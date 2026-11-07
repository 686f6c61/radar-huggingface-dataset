# kataguru/Kataguru-Sceptic-35B-A3B-v3.1-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-v3.1-NVFP4 es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por kataguru, derivado mediante ajuste fino del modelo base Qwen/Qwen3.5-35B-A3B. Cuenta con 35.693.705.072 parametros totales y aproximadamente 3.000 millones de parametros activos por token, distribuidos en 40 capas con 254 expertos enrutados por capa (top_k=8) y dos slots reservados (#254 y #255) para especializacion modular empresarial. La ventana de contexto nativa es de 262.144 tokens.

El modelo esta disenado para dominios tecnicos y cientificos exigentes: automatizacion industrial (Siemens TIA Portal SCL, Beckhoff TwinCAT 3 ST, G-code de Fanuc y Sinumerik, OPC UA), ingenieria de software competitiva, razonamiento STEM de nivel doctoral, medicina clinica y agentes con tool calling. Es bilingue (ingles y finlandes) y se presenta como "uncensored" y "anti-sycophancy", es decir, con una disciplina epistemica orientada a evitar la adulacion al usuario.

Esta version concreta es una cuantizacion NVFP4 (formato FP4 de NVIDIA para arquitecturas Blackwell, sm_120) empaquetada con compressed-tensors en 6 shards, con un peso de repositorio de 25,5 GB. Mantiene en BF16 la atencion y el shared w13 (gate_proj + up_proj), y sincroniza el weight_global_scale de los 10.160 expertos enrutados. Esta pensada para despliegue en vLLM sobre GPU Blackwell, con un requisito de aproximadamente 14,5 GB de VRAM por GPU en configuracion TP=2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (qwen3_5_moe), 40 capas, 254 expertos enrutados por capa, top_k=8, 2 slots reservados (#254, #255); encoder de vision de 27 capas; cabeza MTP especulativa en la capa 40 |
| Parametros totales | 35.693.705.072 |
| Parametros activos | Aproximadamente 3.000 millones por token (3B activos) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | NVFP4 (FP4 nativo Blackwell, compressed-tensors); BF16 en atencion y shared w13; FP8 KV cache en despliegue |
| Idiomas soportados | Ingles (en) y finlandes (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 6 shards, 25,5 GB); existe una release GGUF de la version v2.6 para llama.cpp / LM Studio / Ollama |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE multimodal sobre Qwen3.5-35B-A3B: 40 capas con 254 expertos enrutados por capa y top_k=8, mas dos slots de experto reservados para especializacion modular. Incorpora un encoder de vision de 27 capas (333 tensores bajo model.visual.*) y una cabeza MTP (Multi-Token Prediction) especulativa en la capa 40 (779 tensores bajo mtp.*), lo que habilita decodificacion especulativa. La cuantizacion NVFP4 sincroniza el weight_global_scale de w13 (gate_proj + up_proj) en los 10.160 expertos enrutados, sin desajustes de escala reportados.

El ajuste fino de v3.1 se describe como un entrenamiento MoE en subespacios ortonormales en dos ciclos. El ciclo 1 (qr_frozen_a, con proteccion ortogonal de subespacio de 4 niveles frente a v2.8.1) se aplico sobre datos cognitivos, finlandeses, STEM de posgrado, medicina clinica y patentes EPO/PRH. El ciclo 2 (weakest_link_oplora, Cross-Mixture 64/36 Pohjantähti Anchor Shield y poda de checkpoints con oraculo epistemico para muestras con NLL < 0,35) se aplico sobre algoritmos competitivos verificados con PASSED_EXEC, SWE multi-turno, tool calling BFCL e ingenieria PLC/CNC industrial. No se modificaron el encoder de vision ni la cabeza MTP respecto a la version anterior.

## Capacidades

- Generacion de texto y razonamiento de nivel doctoral en STEM (GPQA Diamond 70,20 %).
- Codigo y algoritmos competitivos (LiveCodeBench v6 Pass@1 39,43 %); ingenieria de software multi-turno.
- Tool calling y function calling en agentes (BFCL V4 Single-Turn AST 83,67 %, con deteccion de irrelevancia del 80,26 %).
- Razonamiento multimodal con entrada de imagen y texto (pipeline image-text-to-text).
- Automatizacion industrial: generacion y revision de SCL de Siemens TIA Portal, ST de Beckhoff TwinCAT 3, G-code de Fanuc y Sinumerik, y OPC UA.
- Medicina clinica (MedQA USMLE 4 opciones 85,39 %).
- Quimica de laboratorio humedo, propiedad intelectual y patentes (EPO/PRH).
- Inspeccion de calidad de datasets y "data surgery" autonomos.
- Bilingue nativo ingles-finlandes, con inflexion finlandesa verificada por Kotus y prosa tecnica de ingenieria.
- Comportamiento anti-sycophancy y "uncensored" declarado por el autor.
- Decodificacion especulativa mediante cabeza MTP.

## Casos de uso

- Automatizacion industrial con PLC: generacion y depuracion de bloques SCL para Siemens TIA Portal y ST para Beckhoff TwinCAT 3, apoyandose en el ajuste especifico sobre estos lenguajes y en el contexto de 262.144 tokens para incluir la logica completa del proyecto.
- Programacion CNC: traduccion de especificaciones de mecanizado a G-code para Fanuc y Sinumerik, y revision de programas existentes en busca de errores de trayectoria o de parametros.
- Agentes de software en produccion: integracion en pipelines de CI/CD como agente con tool calling (BFCL V4), capaz de invocar funciones, consultar repositorios y encadenar pasos multi-turno con deteccion de irrelevancia alta (80,26 %).
- Asistencia clinica documental: respuesta a preguntas de tipo USMLE y apoyo en revision de casos, con la advertencia de que no sustituye el juicio clinico y requiere supervision profesional.
- Analisis de documentacion tecnica y patentes: procesamiento de textos largos de patentes (EPO/PRH) y literatura de ingenieria gracias a la ventana de 262.144 tokens, con salida bilingue ingles-finlandes.
- Inspeccion y curado de datasets: uso como "quality inspector" y "data surgeon" para detectar muestras de baja calidad o inconsistentes en corpus de entrenamiento, apoyandose en su criterio anti-sycophancy.
- Atencion tecnica bilingue en Finlandia: conversaciones multi-turno en finlandes e ingles para soporte de producto industrial, aprovechando la calidad de inflexion verificada.
- Razonamiento STEM de posgrado: resolucion de problemas de fisica, quimica y matematicas de nivel doctoral (GPQA Diamond 70,20 %) en entornos de investigacion.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con lm-evaluation-harness 0.4.13, LiveCodeBench v6 (175 problemas) y BFCL V4 (3.641 tareas single-turn AST), sobre 2x RTX 5090 32GB con TP=2:

| Benchmark | v3.1 | v2.8.1 | Delta | Ornith 1.5 35B-A3B (W4A16) | v2.7 |
|---|---|---|---|---|---|
| Media 15 benchmarks | 70,26 % | 69,24 % | +1,02 pp | 65,49 % | 67,91 % |
| Media cognitiva 11 tareas | 72,00 % | 72,35 % | -0,35 pp | 67,63 % | 72,03 % |
| PIQA (acc_norm) | 83,57 % | 83,79 % | -0,22 pp | 80,58 % | 83,19 % |
| WinoGrande (acc) | 76,87 % | 75,77 % | +1,10 pp | 70,09 % | 75,85 % |
| MedQA (USMLE 4 opciones) | 85,39 % | 85,23 % | +0,16 pp | 82,95 % | 85,39 % |
| GPQA Diamond | 70,20 % | 57,58 % | +12,62 pp | no disponible | no disponible |
| LiveCodeBench v6 (Pass@1) | 39,43 % | 32,00 % | +7,43 pp | no disponible | no disponible |
| BFCL V4 Single-Turn AST | 83,67 % | 82,33 % | +1,34 pp | no disponible | no disponible |
| BFCL V4 Non-Live | 88,44 % | no disponible | no disponible | no disponible | no disponible |
| BFCL V4 Irrelevance Detection | 80,26 % | 46,87 % | +33,39 pp | no disponible | no disponible |
| Automatizacion industrial (PLC/CNC) | no disponible (delta +3,22 pp) | no disponible | +3,22 pp | no disponible | no disponible |

Los informes completos de evaluacion y los registros de interrogatorio se incluyen, segun el autor, en el directorio eval/ del repositorio. No se dispone de resultados del resto de los 15 benchmarks en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 14,5 GB por GPU en TP=2 (2x RTX 5090 32GB) con contexto de 262.144 tokens y cache KV en FP8.
- GPU recomendadas: NVIDIA Blackwell sm_120 (RTX 5090 32GB) por el soporte nativo NVFP4; no se garantiza funcionamiento en arquitecturas anteriores sin conversion a otro formato.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB) en configuracion TP=2; en una sola RTX 5090 el margen es ajustado y no esta documentado por el autor.
- Opciones de despliegue: vLLM con FlashInfer y CUDAGraphs habilitados (entorno probado); para llama.cpp, LM Studio u Ollama existe una release GGUF de la version v2.6, no de v3.1.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Media 15 benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-v3.1-NVFP4 | 35,7B | ~3B | 262.144 | 70,26 % | Apache 2.0 | Hugging Face (NVFP4) |
| Kataguru-Sceptic-35B-A3B-v2.8.1-NVFP4 | 35,7B (aprox.) | ~3B | 262.144 | 69,24 % | Apache 2.0 | Hugging Face (NVFP4) |
| Ornith 1.5 35B-A3B (W4A16) | 35B (aprox.) | ~3B | no disponible | 65,49 % | no disponible | no disponible |
| Kataguru-Sceptic-35B-A3B-v2.7 | 35,7B (aprox.) | ~3B | 262.144 | 67,91 % | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-35B-A3B (base) | 35,7B | ~3B | 262.144 | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; el caracter "uncensored" declarado implica menor filtrado de contenido y mayor riesgo de salidas inapropiadas en produccion.
- Alucinacion: no se aportan metricas de factualidad mas alla de TruthfulQA (parcialmente citado en la model card, sin valores completos); el uso en medicina o patentes requiere verificacion humana.
- Contexto e idioma: el soporte multilingue se limita a ingles y finlandes; el rendimiento en otros idiomas no esta documentado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-35B-A3B debe cumplir su propia licencia y condiciones.
- Hardware: la cuantizacion NVFP4 esta ligada a Blackwell (sm_120); en GPU Ampere, Hopper o anteriores no es desplegable directamente y requeriria otra cuantizacion.
- Benchmarks: los resultados son autoevaluados por el autor sobre un harness concreto; no hay verificacion independiente y varias celdas de la tabla comparativa estan incompletas.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la version v3.1 no dispone de release GGUF propia.
- Especializacion: el ajuste intensivo en dominios muy concretos (PLC, CNC, patentes, clinica) puede degradar el rendimiento en tareas generales fuera de ese reparto, como sugiere la ligera caida de -0,35 pp en la media cognitiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-NVFP4
- Version anterior v2.8.1: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.8.1-NVFP4
- Version v2.6 NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-NVFP4
- Release GGUF de v2.6: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
