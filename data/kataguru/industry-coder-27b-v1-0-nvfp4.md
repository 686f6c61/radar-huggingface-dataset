# kataguru/Industry-Coder-27B-v1.0-NVFP4

## Resumen

Kataguru Industry-Coder-27B-v1.0-NVFP4 es la versión cuantizada en formato NVFP4 nativo para NVIDIA Blackwell del modelo Industry-Coder-27B-v1.0, desarrollado por kataguru. Se trata de un modelo denso de 27 mil millones de parámetros (27.781.427.952 según los safetensors) especializado en ingeniería de software industrial, programación algorítmica, automatización industrial (PLC/CNC con Beckhoff TwinCAT 3 ST y Siemens SCL), ingeniería de patentes europeas y finlandesas (EPO/PRH) y razonamiento STEM de nivel doctoral. Está construido sobre Qwen 3.8 27B y mantiene una arquitectura híbrida de 64 capas que combina Gated DeltaNet con atención completa.

Su relevancia actual radica en tres factores: es una de las pocas variantes abiertas optimizadas específicamente para dominios industriales (PLC, CNC, patentes), incluye soporte confirmado y de calidad nativa para finlandés además de inglés, y su cuantización W4A4 FP4 nativa para Blackwell lo hace especialmente eficiente en GPUs de última generación como la RTX 5090 o la RTX PRO 6000. Conserva intactos los tensores de visión (333), los de decodificación especulativa MTP (15) y la ventana de contexto nativa de 262.144 tokens.

La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para despliegues de producción en clústeres vLLM, especialmente en entornos de ingeniería industrial y automatización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso (64 capas: Gated DeltaNet + Full Attention), con tensores de visión y MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no es MoE; modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4, nativo Blackwell, compressed-tensors); base BF16 disponible en kataguru/Industry-Coder-27B-v1.0-BF16 |
| Idiomas soportados | Inglés (en) y finlandés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (7 shards, 28,55 GB en disco) |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.8 27B, una arquitectura híbrida de 64 capas que combina bloques Gated DeltaNet con capas de atención completa (Full Attention). Esta combinación permite procesar contextos muy largos (262.144 tokens nativos) con un consumo de memoria KV más contenido que una arquitectura puramente transformer. El modelo es multimodal: conserva 333 tensores de visión en precisión BF16 completa, y añade 15 tensores de decodificación especulativa MTP (Multi-Token Prediction), también en BF16, que aceleran la generación.

Las modificaciones de kataguru sobre el modelo base incluyen un currículo de entrenamiento "Merge-and-Reset" de 4 ciclos con dificultad estrictamente no decreciente y un "Tempering Elite Bank" en el cuarto ciclo, entrenamiento en subespacio ortonormal con `r=16 qr_frozen_a`, un alineamiento SOMA/ARA con tasa de rechazo del 0,00% (modelo "uncensored") y una plantilla de chat "Quad-Mode". Para la versión NVFP4, se aplicó una cuantización Blackwell nativa con grupos de fusión `weight_global_scale` unificados al 100% (80/80 grupos).

No se ha publicado información sobre el número de tokens de entrenamiento ni la composición detallada del dataset en la documentación disponible, aunque los tags indican datos de dominios industriales (PLC, CNC), patentes (EPO, PRH) y STEM.

## Capacidades

- Generación de código en Python, Rust, C, Java y JavaScript, con evaluación destacada en LiveCodeBench v6 (36,57% Pass@1 con ejecución en sandbox).
- Automatización industrial: generación de código PLC en Beckhoff TwinCAT 3 (Structured Text) y Siemens SCL, así como programación CNC.
- Razonamiento STEM de nivel doctoral (GPQA Diamond: 67,17%) y matemáticas (GSM8K: 89,92%).
- Tool calling agéntico con plantilla `<tool_call>`, evaluado en BFCL V4 (71,78% AST overall).
- Razonamiento multi-paso y modo de razonamiento (tag "reasoning"), con soporte MTP para decodificación especulativa.
- Capacidades de visión (multimodal) mediante los tensores de visión preservados en BF16.
- Soporte bilingüe de nivel nativo en inglés y finlandés, con calidad idiomática destacada por el autor en finlandés (sin errores morfológicos ni calcos).
- Redacción de patentes europeas y finlandesas (claims, documentación EPO/PRH).
- Modelo sin censura (SOMA/ARA 0,00% de rechazos), lo que reduce los bloqueos de instrucciones.

## Casos de uso

- Generación de código PLC para automatización industrial: el modelo puede escribir y depurar programas en Structured Text de Beckhoff TwinCAT 3 y SCL de Siemens, algo poco habitual en modelos abiertos, gracias a su ajuste específico en estos dominios.
- Asistentes de programación algorítmica: con un 36,57% Pass@1 en LiveCodeBench v6, puede integrarse en IDEs o pipelines de CI/CD para resolver problemas de programación competitiva y generar código verificado en sandbox.
- Agentes con tool calling: su puntuación de 71,78% en BFCL V4 lo hace adecuado para flujos agénticos multi-paso que invocan herramientas externas, APIs y sistemas de ejecución de código.
- Redacción y revisión de patentes: puede generar claims y descripciones técnicas conforme a los estándares de la EPO y la Oficina Finlandesa de Patentes (PRH), útil para despachos de propiedad industrial.
- Razonamiento científico de alto nivel: con 67,17% en GPQA Diamond, sirve como asistente para equipos de I+D en preguntas de nivel doctoral en STEM.
- Atención técnica multilingüe en finlandés: su soporte finlandés de calidad nativa permite construir chatbots y asistentes técnicos en finlandés para el sector industrial, un idioma poco cubierto por modelos abiertos.
- Análisis de documentos con visión: los tensores de visión conservados permiten procesar esquemas, diagramas y documentación técnica gráfica en flujos de ingeniería.
- Despliegue en clústeres de producción vLLM: la cuantización NVFP4 nativa reduce el footprint de memoria manteniendo calidad, ideal para servir el modelo con alta concurrencia (probado con `num_concurrent=16`).

## Benchmarks y rendimiento

Resultados oficiales publicados por el autor, ejecutados en 2x NVIDIA RTX 5090 (Blackwell, TP=2) con NVFP4, CUDAGraphs activado, `num_concurrent=16` y caché KV en FP8:

| Benchmark | Métrica | Qwen 3.8 27B Base | Industry-Coder-27B-v1.0 |
|---|---|---|---|
| GSM8K (CoT 1024-tok) | Strict / Flex Exact Match | 76,50% | 89,92% (90,60%) |
| HellaSwag | acc_norm | 82,10% | 82,74% |
| MedQA (USMLE 4 opciones) | acc | 78,40% | 82,56% |
| BoolQ | acc | 86,40% | 87,86% |
| WinoGrande | acc | 75,80% | 76,24% |
| TruthfulQA MC2 | probabilidad multi-verdad | 54,80% | 53,47% |
| TruthfulQA MC1 | factividad mono-verdad | 36,10% | 34,76% |
| PIQA | acc_norm | 81,20% | 81,77% |
| OpenBookQA | acc_norm | 44,20% | 45,60% |
| ARC-Challenge | acc_norm | 61,10% | 62,12% |
| ARC-Easy | acc_norm | 81,30% | 81,99% |
| Media cognitiva (11 tareas) | compuesto | 66,17% | 70,82% |
| GPQA Diamond (198 preguntas) | Exact Match | 45,20% | 67,17% |
| IFEval Strict | prompt / instrucción | 48,20% / 58,40% | 70,43% / 79,26% |
| LiveCodeBench v6 (175 tareas) | Pass@1 | 26,86% | 36,57% (64/175) |
| BFCL V4 (Single-Turn) | AST overall | 62,60% | 71,78% |
| Media de 15 benchmarks | compuesto | 60,31% | 68,33% |

Nota: estos resultados provienen de la model card del autor y no han sido verificados de forma independiente. La evaluación incluye también una comparación con "Kataguru ChemBio-27B v2", que supera ligeramente a este modelo en la mayoría de tareas cognitivas generales pero queda por detrás en GSM8K, GPQA Diamond, IFEval, LiveCodeBench y BFCL.

## Requisitos de hardware

- VRAM estimada: 28,55 GB de pesos en disco; el autor recomienda 1 GPU Blackwell de 32 GB o más, o 2x RTX 5090 de 32 GB con tensor parallelism (TP=2) en vLLM.
- GPUs recomendadas: NVIDIA RTX 5090 32 GB, RTX PRO 6000 o cualquier GPU Blackwell (sm_120) de 32 GB+. La cuantización NVFP4 es nativa de Blackwell, por lo que no es compatible con arquitecturas anteriores (Ampere, Hopper).
- Consumer GPUs: cabe en una única RTX 5090 de 32 GB; en configuración TP=2 se han validado dos RTX 5090 con CUDAGraphs habilitado. No es compatible con GPUs no Blackwell en formato NVFP4 (para otras arquitecturas habría que usar la versión BF16, con requisitos de VRAM mucho mayores).
- Despliegue recomendado: vLLM (`vllm/vllm-openai:v0.29.0-cu129`) con `--tensor-parallel-size 2 --kv-cache-dtype fp8`. No se menciona soporte para llama.cpp, Ollama o TGI.
- Rendimiento: probado con 16 peticiones concurrentes y CUDAGraphs activado; gracias a los tensores MTP de decodificación especulativa, la generación se acelera respecto al modelo base. No se han publicado cifras concretas de tokens/segundo.

## Comparativa con modelos similares

| Característica | Industry-Coder-27B-v1.0-NVFP4 | Qwen 3.8 27B (base) | Kataguru ChemBio-27B v2 |
|---|---|---|---|
| Parametros | 27,78 B (denso) | 27 B (denso) | 27 B (denso) |
| Contexto | 262.144 tokens | 262.144 tokens | no disponible |
| LiveCodeBench v6 | 36,57% | 26,86% | 32,00% |
| GPQA Diamond | 67,17% | 45,20% | 52,02% |
| BFCL V4 | 71,78% | 62,60% | 65,58% |
| Visión | Sí (333 tensores) | Sí | no disponible |
| Idiomas | en, fi | no disponible en la ficha | no disponible |
| Licencia | Apache 2.0 | no disponible en la ficha | no disponible |
| Cuantización | NVFP4 (Blackwell nativo) | BF16 | no disponible |
| Especialización | Industrial, código, patentes, STEM | General | Química/biología (según nombre) |

## Limitaciones y advertencias

- Sesgos: no se ha publicado información sobre auditorías de sesgos. Al ser un modelo "uncensored" (0,00% de rechazos por diseño), no aplica filtros de seguridad convencionales, lo que exige controles externos en producción.
- Alucinaciones: las puntuaciones en TruthfulQA MC1 (34,76%) y MC2 (53,47%) empeoran ligeramente respecto al modelo base (-1,33 y -1,34 pp), lo que sugiere un riesgo de factibilidad algo mayor en consultas de verdad factual.
- Compatibilidad de hardware: la cuantización NVFP4 requiere GPUs NVIDIA Blackwell (sm_120). No funcionará en A100, H100 ni en GPUs de consumo anteriores a la serie RTX 50.
- Idiomas: solo se garantiza calidad en inglés y finlandés; el rendimiento en castellano u otros idiomas no está evaluado.
- Licencia: Apache 2.0 no impone restricciones de uso comercial, pero no se ha publicado información sobre los datos de entrenamiento, por lo que conviene revisar la procedencia de los datos de patentes (EPO/PRH) si el caso de uso es sensible.
- Los benchmarks provienen exclusivamente de la model card del autor y no de una evaluación independiente.
- Para despliegue se recomienda estrictamente la versión de vLLM indicada (`v0.29.0-cu129`); versiones anteriores pueden no soportar el formato compressed-tensors NVFP4.
- Descargas y comunidad reducidas (602 descargas, 0 likes en el momento de la ficha), lo que implica menor madurez y soporte comunitario frente a modelos mainstream.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kataguru/Industry-Coder-27B-v1.0-NVFP4
- Modelo base BF16: https://huggingface.co/kataguru/Industry-Coder-27B-v1.0-BF16
- No se han encontrado enlaces adicionales a papers, blogs, repositorios de código o demos en la información disponible.
