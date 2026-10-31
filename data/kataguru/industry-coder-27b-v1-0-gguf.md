# kataguru/Industry-Coder-27B-v1.0-GGUF

## Resumen

Kataguru Industry-Coder-27B-v1.0-GGUF es la versión cuantizada (GGUF) de un modelo denso de 27 mil millones de parámetros (26.895.998.464 exactos en precisión original) desarrollado por kataguru, especializado en ingeniería de software industrial, automatización (PLC/CNC: Beckhoff TwinCAT 3 ST y Siemens SCL), ingeniería de patentes europeas y finlandesas (EPO/PRH) y razonamiento STEM. Se basa en Qwen 3.8 27B, una arquitectura híbrida de 64 capas que combina Gated DeltaNet con atención completa, e incorpora 333 tensores de visión (multimodal) y 15 tensores MTP para decodificación especulativa multi-token.

El entrenamiento emplea un plan de estudios cerrado de 4 ciclos ("Merge-and-Reset") con un banco final denominado Tempering Elite Bank (Karkaisupankki), además de una alineación con tasa de rechazo del 0,00% ("uncensored"). El modelo destaca por soporte bilingüe de nivel nativo en inglés y finés, algo poco habitual en modelos abiertos de este tamaño.

Esta ficha corresponde al repositorio GGUF, que incluye 4 cuantizaciones calibradas con imatrix (IQ3_XXS, IQ3_S, IQ4_XS, IQ4_NL), el proyector de visión en F16 y dos cabezas de borrador MTP para decodificación especulativa. Mantiene la ventana de contexto nativa de 262.144 tokens del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Gated DeltaNet + Full Attention), 64 capas, con visión y MTP |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ3_XXS (3,06 bpw), IQ3_S (3,44 bpw), IQ4_XS (4,25 bpw), IQ4_NL (4,50 bpw), calibradas con imatrix; mmproj F16; MTP en Q8_0 y Q4_K_M |
| Idiomas soportados | Inglés y finés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); base en BF16 (safetensors) |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.8 27B, una arquitectura híbrida de 64 capas que alterna bloques Gated DeltaNet (tipo SSM/lineal) con bloques de atención completa. Conserva intactos los 333 tensores del proyector de visión (multimodalidad) y 15 tensores MTP (Multi-Token Prediction) que actúan como cabeza especulativa en la capa 64 (`blk.64.nextn`). La ventana de contexto nativa de 262.144 tokens no fue modificada.

El ajuste se realizó mediante un plan de estudios de 4 ciclos en bucle cerrado (Fundación → Bachillerato superior → Ingeniería aplicada → Tempering Elite Bank/Karkaisupankki), con entrenamiento en subespacio ortonormal (`r=16 qr_frozen_a`) y un planificador de tasa de aprendizaje denominado `kataguru_trisection`. La alineación SOMA/ARA busca una tasa de rechazo del 0,00%, es decir, el modelo se presenta como "uncensored". Los GGUF están calibrados con una matriz de importancia (imatrix) bilingüe que cubre finés, inglés, código y STEM. No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre el uso de RLHF/DPO específico.

## Capacidades

- Generación de código de producción en Python, Rust, C, Java y JavaScript, con énfasis en ingeniería de software industrial.
- Automatización industrial: generación de código PLC/CNC en Beckhoff TwinCAT 3 (Structured Text) y Siemens SCL.
- Razonamiento algorítmico y matemático (evaluado en LiveCodeBench v6, GSM8K y GPQA Diamond).
- Agentic tool calling con flujos `<tool_call>` (evaluado en BFCL V4).
- Razonamiento multi-paso para flujos agentivos y tareas de ingeniería complejas.
- Multimodalidad de visión: análisis de esquemas, diagramas y documentos técnicos mediante el proyector `mmproj-f16`.
- Redacción de reivindicaciones de patentes europeas (EPO) y finlandesas (PRH).
- Bilingüe de nivel nativo: inglés y finés sin errores morfológicos ni calcos, según el autor.
- Decodificación especulativa MTP para acelerar la inferencia en llama.cpp.
- Sin filtros de rechazo (alineación 0,00% de negativas), lo que permite flujos técnicos sin bloqueos, pero exige supervisión.

## Casos de uso

- Generación de código PLC para automatización industrial: el modelo puede escribir programas en Structured Text de Beckhoff TwinCAT 3 y SCL de Siemens, un dominio casi ausente en modelos generalistas, gracias a su entrenamiento específico en estos lenguajes.
- Asistente de ingeniería de patentes: redacción y revisión de reivindicaciones conforme a la práctica de la EPO y la PRH, útil para oficinas de patentes y departamentos de propiedad industrial.
- Agentes de código con herramientas: soporta flujos `<tool_call>` (BFCL V4), por lo que puede integrarse en pipelines de CI/CD, ejecución de pruebas o agentes de desarrollo multi-paso.
- Análisis de documentación técnica con visión: el proyector multimodal permite interpretar esquemas eléctricos, diagramas de PLC y hojas de datos escaneadas.
- Razonamiento STEM de nivel doctoral: evaluado en GPQA Diamond y MedQA, apto como asistente para cálculo técnico y consultas científicas.
- Asistentes bilingües finés-inglés: soporte finés de alta calidad (etiquetado "sovereign-finnish"), adecuado para herramientas de productividad en Finlandia.
- Despliegue local en estaciones de trabajo: con cuantizaciones de 11-15 GB, cabe en GPUs de consumo de 12-24 GB para uso offline en entornos industriales sin conexión a la nube.
- Aceleración de inferencia con MTP: la cabeza especulativa multi-token permite mayor throughput en llama.cpp para generación de código largo.

## Benchmarks y rendimiento

Resultados oficiales publicados por el autor (2x RTX 5090, TP=2, NVFP4, CUDAGraphs, `num_concurrent=16`, caché KV FP8). La tabla original de 15 benchmarks quedó truncada en la información disponible; se listan los resultados publicados:

| Benchmark | Metrica | Qwen 3.8 27B Base | Industry-Coder-27B-v1.0 | Delta |
|---|---|---|---|---|
| GSM8K (CoT 1024 tok) | Strict Exact Match | 76,50 % | 89,92 % (90,60 % flex) | +13,42 pp |
| HellaSwag | acc_norm | 82,10 % | 82,74 % | +0,64 pp |
| MedQA (USMLE 4 opciones) | acc | 78,40 % | 82,56 % | +4,16 pp |
| BoolQ | acc | 86,40 % | 87,86 % | +1,46 pp |
| WinoGrande | acc | 75,80 % | 76,24 % | +0,44 pp |
| TruthfulQA MC2 | Multi-True Probability | 54,80 % | 53,47 % | -1,33 pp |
| TruthfulQA MC1 | Single-True Factuality | 36,10 % | no disponible (tabla truncada) | no disponible |

No se han publicado en la información disponible los resultados completos de LiveCodeBench v6, BFCL V4 ni GPQA Diamond, ni los 8 benchmarks restantes de la evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia GGUF:
  - IQ3_XXS (10,6 GB): 12 GB de VRAM con contexto moderado; holgura de más de 5 GB de caché KV en GPUs de 16 GB.
  - IQ3_S (12 GB): GPUs de 16 GB con alto margen para KV cache.
  - IQ4_XS (15 GB): punto óptimo para GPUs de 16-24 GB.
  - IQ4_NL (15,3 GB): máxima calidad, recomendado 24 GB o más.
  - Añadir 889 MB si se usa visión (mmproj-f16) y 1,9-3,0 GB para la cabeza MTP.
- GPUs recomendadas: RTX 5060 Ti 16 GB, RTX 4080, RTX 4090, RTX 5090. Entorno de pruebas del autor: 2x NVIDIA RTX 5090 32 GB (TP=2, vLLM v0.29.0-cu129, CUDAGraphs).
- Sí cabe en GPUs de consumo: 12 GB (IQ3_XXS con contexto moderado), 16 GB (IQ3_XXS/IQ3_S/IQ4_XS) y 24 GB (IQ4_NL cómodamente).
- Opciones de despliegue: LM Studio y llama.cpp (build b11064 o superior) con offload completo a GPU; vLLM v0.29.0 verificado por el autor en la configuración BF16 con tensor paralelismo.
- Latencia y throughput: no disponible en cifras concretas; la decodificación especulativa MTP se ofrece para mejorar el throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Kataguru Industry-Coder-27B-v1.0 | 26,9 B (denso) | 262.144 | Código + automatización industrial + visión + finés | Apache 2.0 |
| Qwen3 30B-A3B (base original de la familia) | 30 B (MoE, ~3 B activos) | 262.144 | Generalista con razonamiento | Apache 2.0 |
| Qwen2.5-Coder-32B-Instruct | 32 B (denso) | 131.072 | Especializado en código | Apache 2.0 |
| Gemma 3 27B | 27 B (denso) | 128.000 | Generalista multimodal | Gemma (restricciones de uso) |

Industry-Coder-27B se diferencia por su especialización en PLC/CNC y patentes, su soporte nativo del finés y su ventana de contexto de 262K, superior a la de Qwen2.5-Coder-32B y Gemma 3 27B. Frente a Qwen3 30B-A3B, es un modelo denso (menor throughput, mayor calidad por token activo teórica).

## Limitaciones y advertencias

- La alineación con 0,00% de rechazos ("uncensored") implica que el modelo no bloqueará contenidos potencialmente nocivos: requiere filtros y supervisión propios en producción.
- Riesgo de alucinación no cuantificado por el autor; TruthfulQA MC2 incluso empeora ligeramente respecto al base (-1,33 pp), lo que sugiere precaución en tareas de factualidad.
- Soporte de idiomas limitado a inglés y finés; el rendimiento en castellano u otros idiomas no está documentado.
- Los benchmarks publicados provienen del propio autor y no son verificados de forma independiente; la tabla de 15 benchmarks está incompleta en la información disponible.
- La arquitectura híbrida Gated DeltaNet + atención puede tener soporte limitado en runtimes: el autor recomienda llama.cpp b11064+ o vLLM v0.29.0; versiones anteriores pueden no funcionar.
- El uso de visión y MTP requiere cargar archivos adicionales (mmproj y draft), aumentando los requisitos de VRAM.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque el modelo base Qwen debe revisarse según sus propios términos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/kataguru/Industry-Coder-27B-v1.0-GGUF
- Modelo base BF16: https://huggingface.co/kataguru/Industry-Coder-27B-v1.0-BF16
- No se han encontrado en la información disponible enlaces adicionales a papers, blogs oficiales ni demos.
