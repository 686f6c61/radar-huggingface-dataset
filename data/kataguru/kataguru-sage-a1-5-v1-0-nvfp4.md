# kataguru/Kataguru-Sage-A1.5-v1.0-NVFP4

## Resumen

Kataguru-Sage-A1.5-v1.0-NVFP4 es un ajuste fino y cuantización del modelo InternScience/Sage-A1.5, un Mixture-of-Experts multimodal de 35.951.822.704 parámetros totales (35B-A3B, 256 expertos enrutados más uno compartido por capa, top_k=8) construido sobre la arquitectura Qwen3.5-35B-A3B. Lo desarrolla el usuario kataguru y está orientado a razonamiento científico, programación competitiva y uso agéntico con tool calling, con soporte de visión nativa y una ventana de contexto de 262.144 tokens.

La aportación principal del autor es una cuantización nativa a NVFP4 (W4A4 E2M1 con escalado de bloque FP8 E4M3) pensada para GPUs NVIDIA Blackwell (sm_120), que reduce el peso en disco a 25,60 GB manteniendo atención, expertos compartidos, routers, codificador visual y la cabeza MTP en BF16. Sobre esa base se aplicó un currículo de QLoRA en cuatro ciclos con un proceso de "descensura" por ortogonalización de activaciones (SOMA/ARA), además de refuerzo en matemáticas, código e instrucciones estrictas.

El modelo se distribuye con licencia Apache 2.0, soporta inglés y finés, y está pensado para desplegarse con vLLM en configuraciones TP=1 o TP=2 sobre RTX 5090. Su relevancia actual radica en ser un ejemplo de empaquetado de un MoE grande en FP4 nativo para hardware Blackwell, con decodificación especulativa MTP y visión activada por defecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5-35B-A3B), 40 capas, 256 expertos enrutados + 1 compartido por capa, top_k=8; codificador visual de 27 capas; cabeza MTP en capa 40 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B (denominación A3B; no se detalla el desglose exacto en la información disponible) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 nativo (W4A4, E2M1 con escalado de bloque FP8 E4M3) mediante compressed-tensors; atención, expertos compartidos, routers, visión y MTP en BF16 |
| Idiomas soportados | Inglés y finés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards, 93.891 tensores, 25,60 GB); etiquetado como 8-bit en los metadatos de HuggingFace |

## Arquitectura y entrenamiento

El backbone es un transformer MoE de 40 capas con 256 expertos enrutados y un experto compartido por capa, activando 8 expertos por token (top_k=8). Incluye un codificador visual de 27 capas (333 tensores `model.visual.*` en BF16) que habilita entrada image-text-to-text, y una cabeza de Multi-Token Prediction en la capa 40 (785 tensores `mtp.*` en BF16) que permite decodificación especulativa. La cuantización NVFP4 afecta a 30.720 matrices de expertos y 10.240 grupos de fusión `gate_up_proj`, preservando en BF16 las partes sensibles a precisión.

El ajuste fino del autor consistió en un currículo QLoRA de cuatro ciclos con estratificación 2D (Cycle 1 Primary, Cycle 2 Upper Secondary, Cycle 3 Applied Engineering, Cycle 4 University/PhD Annealing), con r=16 y `qr_frozen_a`, entrenando los 256 expertos y los routers. Antes del ajuste se aplicó una ortogonalización de activaciones (SOMA/ARA) para eliminar direcciones de rechazo y comportamientos de "sermón" del modelo base. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; el autor menciona refuerzo de chain-of-thought matemático y código algorítmico, y una plantilla de chat de 6 modos (`chat_template.jinja`).

## Capacidades

- Generación de texto y razonamiento científico orientado a STEM, GPQA y medicina.
- Razonamiento matemático reforzado con chain-of-thought (mejora reportada de +47,23 pp en GSM8K).
- Programación competitiva y algorítmica con modo thinking (`--enable-thinking`), 40,00 % Pass@1 en LiveCodeBench v6.
- Tool calling y function calling multiidioma, con 83,38 % en BFCL V4 Single-Turn AST y 79,78 % en detección de irrelevancia.
- Cumplimiento estricto de instrucciones estructurales, de longitud, formato, JSON/AST y restricciones negativas (IFEval Prompt Strict +17,74 pp).
- Capacidades agénticas y razonamiento multi-paso.
- Visión multimodal nativa activada por defecto (image-text-to-text).
- Decodificación especulativa mediante MTP en la capa 40.
- Multilingüe en inglés y finés, con calidad gramatical completa en finés según el autor.
- Modo "uncensored" con tasa de rechazo declarada del 0,00 %.
- Plantilla de chat con 6 modos configurables.

## Casos de uso

- Razonamiento científico y médico asistido: el modelo puede resolver preguntas tipo USMLE (85,55 % en MedQA) y explicar el razonamiento paso a paso, adecuado para herramientas de formación clínica o revisión de literatura técnica.
- Generación de código en producción: con tool calling y modo thinking puede integrarse en pipelines de CI/CD para generar parches, tests y explicaciones de errores, con 40,00 % Pass@1 en problemas algorítmicos.
- Agentes con function calling: su rendimiento en BFCL V4 y la detección de irrelevancia permiten construir asistentes que deciden cuándo invocar herramientas y cuándo no, con contexto de 262.144 tokens para historiales largos.
- Análisis de documentos e imágenes técnicas: la visión nativa permite extraer información de diagramas, capturas y figuras junto con texto, útil en ingeniería y documentación.
- Asistencia en finés para documentación técnica: genera prosa técnica y comentarios de código en finés gramaticalmente correcto, adecuado para equipos nórdicos.
- Despliegue en hardware Blackwell de gama alta: con ~14,5 GB por GPU en TP=2 sobre 2x RTX 5090 permite servir el modelo en estaciones de trabajo sin clústeres grandes.
- Investigación sobre alineación y censura: al eliminar direcciones de rechazo, sirve para estudiar comportamientos de modelos sin filtros, siempre con las cautelas éticas y legales correspondientes.
- Evaluación comparativa de cuantizaciones: el paquete NVFP4 con partes en BF16 es útil para medir el impacto de FP4 frente a BF16 en tareas de razonamiento y visión.

## Benchmarks y rendimiento

Datos publicados por el autor, comparando el modelo con el baseline InternScience/Sage-A1.5 en NVFP4 sobre el mismo hardware (2x RTX 5090, TP=2):

| Benchmark | Sage-A1.5 NVFP4 (baseline) | Kataguru v1.0 NVFP4 | Delta |
|---|---|---|---|
| Media 15 benchmarks (LCB thinking) | 59,41 % | 65,55 % | +6,14 pp |
| Media 15 benchmarks (LCB sin thinking) | 59,41 % | 65,13 % | +5,71 pp |
| Media cognitiva 11 tareas | 62,63 % | 68,69 % | +6,06 pp |
| PIQA (acc_norm) | 81,56 % | 81,50 % | -0,05 pp |
| WinoGrande (acc) | 73,16 % | 74,90 % | +1,74 pp |
| MedQA (USMLE 4 opciones) | 85,07 % | 85,55 % | +0,47 pp |
| TruthfulQA MC2 | 52,07 % | no disponible (dato truncado en la model card) | no disponible |
| GSM8K | no disponible (solo se indica +47,23 pp) | no disponible | +47,23 pp |
| ARC-Easy | no disponible (solo se indica +7,20 pp) | no disponible | +7,20 pp |
| LiveCodeBench v6 (thinking) | no disponible | 40,00 % Pass@1 | no disponible |
| BFCL V4 Single-Turn AST | no disponible | 83,38 % | no disponible |
| BFCL V4 Irrelevance Detection | no disponible | 79,78 % | no disponible |
| IFEval Prompt Strict | no disponible | no disponible | +17,74 pp |
| IFEval Inst Strict | no disponible | no disponible | +16,79 pp |

La model card está truncada a partir de la fila 4 de la tabla de benchmarks, por lo que no se dispone del resto de valores absolutos.

## Requisitos de hardware

- VRAM estimada: ~14,5 GB por GPU con TP=2 (2x RTX 5090 32 GB) o ~27,5 GB con TP=1 (1x RTX 5090 32 GB), según el autor.
- GPU recomendadas: NVIDIA RTX 5090 (Blackwell, sm_120); la cuantización NVFP4 requiere hardware Blackwell para aprovechar FP4 nativo.
- No cabe en GPUs de consumo anteriores (Ampere, Ada) en formato NVFP4 nativo; sería necesario reconvertir a otro formato.
- Opciones de despliegue: vLLM v0.18+ con compressed-tensors, CUDA 12.9, FlashInfer XQA, CUDAGraphs y MTP; el autor no menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras concretas de latencia o tokens por segundo en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / hardware | Notas |
|---|---|---|---|---|---|
| Kataguru-Sage-A1.5-v1.0-NVFP4 | 35,95B totales (3B activos) | 262.144 | Apache 2.0 | NVFP4, Blackwell | Ajuste fino con descensura y refuerzo; media 15 benchmarks 65,55 % |
| InternScience/Sage-A1.5 (NVFP4) | 35,95B totales (3B activos) | 262.144 | no disponible en la información | NVFP4 | Baseline directo; media 15 benchmarks 59,41 % |
| Kataguru Sceptic v2.8.1 (NVFP4) | no disponible | no disponible | no disponible | NVFP4 | Referencia del autor; media 15 benchmarks 69,24 % |
| Qwen3.5-35B-A3B (arquitectura base) | 35B totales (3B activos) | no disponible | no disponible | BF16 y otras | Arquitectura sobre la que se construye Sage-A1.5; sin datos de benchmarks en esta información |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría (por ejemplo, otros MoE de ~35B con visión); se indica como no disponible.

## Limitaciones y advertencias

- El proceso de "descensura" elimina direcciones de rechazo; el modelo puede generar contenido que otros modelos rechazarían, con implicaciones éticas y legales en producción.
- Riesgo de alucinación inherente a modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad más allá de TruthfulQA (dato truncado).
- Solo soporta inglés y finés de forma declarada; el rendimiento en otros idiomas no está evaluado.
- La cuantización NVFP4 requiere GPUs Blackwell; en otro hardware puede no ser desplegable directamente o degradar el rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no detalla restricciones adicionales sobre el modelo base ni sobre los datos de ajuste.
- El modelo tiene pocas descargas (26) y ningún "like", por lo que la validación comunitaria es mínima.
- La model card está truncada en la tabla de benchmarks, lo que impide verificar todos los resultados declarados.
- El contexto de 262.144 tokens puede implicar un consumo de VRAM elevado en la práctica; el autor no detalla el rendimiento a contexto máximo.
- No se especifican los datos de entrenamiento ni posibles sesgos del dataset, lo que dificulta evaluar sesgos sistemáticos.

## Enlaces

- HuggingFace: https://huggingface.co/kataguru/Kataguru-Sage-A1.5-v1.0-NVFP4
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- No se han encontrado en la información disponible otros enlaces a papers, blogs, repositorios o demos.
