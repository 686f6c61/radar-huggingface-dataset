# prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-MTP-Repacked

## Resumen

MiMo-V2.6-Distill-Qwen-9B-MTP-Repacked es un checkpoint de 9.653 millones de parámetros derivado de MiMo-V2.6-Distill-Qwen-9B, el modelo agéntico desarrollado por Xiaomi MiMo mediante ajuste supervisado (SFT) sobre Qwen3.5-9B con datos generados por MiMo en dominios de código, tareas generales de agente, codificación visual y ciberseguridad. Este repositorio concreto, publicado por prithivMLmods, es un "repack" que añade pesos en formato GGUF con soporte de Multi-Token Prediction (MTP) para decodificación especulativa integrada, además de los pesos originales en safetensors BF16 y la plantilla de chat de MiMo v2.6.

El modelo resuelve el problema de disponer de un punto de partida abierto para investigación en aprendizaje por refuerzo agéntico, con capacidades destacadas en uso de herramientas, ejecución de comandos y tareas de ingeniería de software. El repack resulta relevante porque facilita el despliegue local en hardware de consumo mediante GGUF cuantizados (desde 4,74 GB en Q3_K_M hasta 18,4 GB en BF16) y porque integra MTP para acelerar la inferencia sin necesidad de un modelo borrador separado.

La arquitectura subyacente es de tipo transformer denso (sin mezcla de expertos) con soporte multimodal image-text-to-text, y el modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. El idioma declarado es únicamente inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5-9B), multimodal image-text-to-text, con cabezas MTP para decodificación especulativa |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, mmproj-bf16 (proyección multimodal) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16, 4 shards) y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 9.650 millones de parámetros construido a partir de Qwen3.5-9B mediante ajuste supervisado (SFT) sobre datos generados por MiMo. El entrenamiento utilizó una mezcla ponderada de 77.400 millones de tokens totales, de los cuales 27.200 millones son "loss-bearing" (contribuyen a la pérdida), distribuidos de forma aproximadamente equilibrada entre cuatro dominios: código (29,9 %), general (28,5 %), visual (27,4 %) y ciberseguridad (14,2 %). No se indica en la información disponible si hubo fases de RLHF o DPO posteriores al SFT; el checkpoint se presenta explícitamente como punto de partida para investigación en RL agéntico.

La innovación técnica destacable del repack es la integración de Multi-Token Prediction (MTP) en los pesos GGUF: la arquitectura incorpora cabezas de salida adicionales que predicen varios tokens futuros en una sola pasada, lo que permite decodificación especulativa sin un modelo borrador externo. El modelo se sirve mediante SGLang con un parser de razonamiento `mimo` dedicado y control explícito del modo de pensamiento (thinking mode) a través de una API compatible con OpenAI. Incluye tokenizador BPE (merges.txt de 3,35 MB) y plantilla de chat MiMo v2.6 en formato Jinja.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat propia.
- Razonamiento con modo de pensamiento explícito (thinking mode) controlable.
- Codificación y tareas de ingeniería de software (SWE-bench, Terminal-Bench).
- Uso de herramientas y function calling, orientado a flujos agénticos.
- Ejecución de comandos en terminal y tareas multi-paso (agentic reasoning).
- Codificación visual (visual coding) gracias a la proyección multimodal mmproj.
- Capacidades de ciberseguridad evaluadas internamente por el autor base.
- Multilingüe limitado: únicamente inglés declarado.
- Decodificación especulativa integrada vía MTP en los GGUF.

## Casos de uso

- Agentes de ingeniería de software: el modelo puede resolver issues y parchear repositorios, con resultados reportados de 61,1 en SWE-bench Verified y 44,6 en SWE-bench Pro, integrándose en pipelines de CI/CD mediante tool calling.
- Automatización de terminal y DevOps: con 37,1 en Terminal-Bench 2.1, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos shell.
- Asistentes de código en IDE: despliegue local con GGUF Q4_K_M (5,78 GB) en una GPU de consumo para autocompletado y refactorización con contexto de repositorio.
- Análisis de capturas y diagramas: la pipeline image-text-to-text con mmproj permite extraer código o describir interfaces a partir de imágenes.
- Investigación en RL agéntico: el checkpoint SFT sirve como base para entrenar con recompensas en entornos simulados de código y ciberseguridad.
- Evaluación de seguridad ofensiva/defensiva: las mejoras de 5,7 a 31,3 en la evaluación interna de ciberseguridad lo hacen útil para análisis de vulnerabilidades en entornos controlados.
- Prototipado de agentes con API compatible OpenAI: el soporte en SGLang con parser `mimo` facilita sustituir backends comerciales en desarrollos internos.

## Benchmarks y rendimiento

| Benchmark | Qwen3.5-9B (base) | MiMo-V2.6-Distill-Qwen-9B |
|---|---|---|
| AutomationBench v1.0.6 | 5,0 | 30,3 |
| Evaluación interna de ciberseguridad | 5,7 | 31,3 |
| Terminal-Bench 2.1 | 27,0 | 37,1 |
| Evaluación interna de código | 19,5 | 51,6 |
| SWE-bench Verified | No disponible | 61,1 |
| SWE-bench Pro | No disponible | 44,6 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: BF16 requiere aproximadamente 19-20 GB (pesos de 18,4 GB más overhead); Q6_K unos 8-9 GB; Q5_K_M unos 7-8 GB; Q4_K_M unos 6-7 GB; Q3_K_M unos 5-6 GB.
- GPU recomendadas: A100 40 GB o H100 para BF16 con contexto largo; RTX 4090 (24 GB) para BF16 ajustado o Q6_K; RTX 3090/4080 (16-24 GB) para Q5/Q6.
- GPU de consumo: sí, cabe en RTX 4060 Ti 16 GB (Q5/Q6), RTX 3060 12 GB (Q4/Q5) y GPUs de 8 GB con Q3_K_M.
- Despliegue: SGLang (soporte nativo con parser `mimo`), llama.cpp y Ollama para GGUF, Text Generation Inference (tag text-generation-inference), transformers para safetensors.
- Latencia y throughput: no disponibles; el uso de MTP en GGUF está orientado a acelerar la inferencia local frente a decodificación autoregresiva estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-MTP-Repacked | 9,65 B | No disponible | Apache 2.0 | Agéntico multimodal, código y ciberseguridad |
| Qwen3.5-9B (base) | ~9 B | No disponible | Apache 2.0 | Modelo generalista de partida |
| MiMo-V2.6-Distill-Qwen-9B (original) | ~9 B | No disponible | Apache 2.0 | Mismo modelo sin repack MTP/GGUF |

No se dispone de datos de contexto ni de benchmarks cruzados con otras familias comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se declara cobertura multilingüe.
- Es un checkpoint SFT, no un modelo final alineado con RLHF/DPO; puede presentar sesgos y respuestas no alineadas.
- Riesgo de alucinación inherente a modelos de 9 B en tareas de razonamiento largo.
- Las capacidades en ciberseguridad requieren uso responsable y supervisión; no se documentan salvaguardas específicas.
- Longitud de contexto no publicada, lo que dificulta planificar despliegues con ventanas largas.
- Los GGUF de baja cuantización (Q3) degradan calidad de forma notable según advierte el propio autor.
- El repack es una publicación de terceros (prithivMLmods); conviene validar la integridad de pesos frente al original de Xiaomi.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de los datos de entrenamiento originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-MTP-Repacked
- Carpeta GGUF: https://huggingface.co/prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-MTP-Repacked/tree/main/GGUF
- Modelo base original: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Configuración: https://huggingface.co/prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-MTP-Repacked/blob/main/config.json
- Plantilla de chat: https://huggingface.co/prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-MTP-Repacked/blob/main/chat_template.jinja
