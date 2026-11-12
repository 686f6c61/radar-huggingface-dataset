# ceselder/maemm-27b-rl-after-1m-sft-run

## Resumen

maemm-27b-rl-after-1m-sft-run es un modelo multimodal de tipo image-text-to-text publicado por el usuario ceselder en Hugging Face. Los pesos y la model card corresponden a Qwen3.6-27B, el primer variant de pesos abiertos de la serie Qwen3.6 desarrollada por el equipo Qwen (Alibaba). El repositorio se presenta como un run de ajuste fino supervisado (1M de ejemplos SFT) seguido de RL, partiendo de la base Qwen3.6-27B, aunque la model card incluida es la original del modelo base.

El modelo resuelve tareas de generacion de texto, razonamiento, codigo y comprension de imagenes, con un enfasis declarado en "agentic coding": flujos de trabajo frontend, razonamiento a nivel de repositorio y preservacion del contexto de razonamiento entre turnos. Es relevante porque combina una ventana de contexto nativa de 262.144 tokens (extensible hasta 1.010.000) con 27.781.427.952 parametros reales en safetensors y licencia Apache 2.0, lo que lo hace apto para uso comercial.

La arquitectura es un transformer causal hibrido con encoder de vision, que intercala capas de atencion lineal (Gated DeltaNet) con capas de atencion completa (Gated Attention) en un patron 3:1, e incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con encoder de vision; transformer hibrido Gated DeltaNet + Gated Attention |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens nativo; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; compatible con vLLM, SGLang y KTransformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de vision. La parte de lenguaje tiene una dimension oculta de 5120, 64 capas y un layout hibrido de 16 bloques, cada uno compuesto por 3 subcapas de Gated DeltaNet seguidas de 1 subcapa de Gated Attention, todas con su FFN correspondiente. Las capas de atencion lineal usan 48 cabezas para V y 16 para QK con dimension de cabeza 128; las capas de atencion completa usan 24 cabezas para Q y 4 para KV con dimension de cabeza 256 y RoPE de dimension 64. El FFN tiene dimension intermedia 17408, el embedding y la salida LM son de 248.320 (con padding) y el modelo se entreno con Multi-Token Prediction (MTP) en multiples pasos.

El entrenamiento declarado cubre pre-entrenamiento y post-entrenamiento. El repositorio concreto de ceselder indica un run de SFT de 1M de ejemplos seguido de RL sobre la base Qwen3.6-27B, si bien no se detalla la composicion del dataset, el numero de tokens de pre-entrenamiento ni si hubo RLHF/DPO mas alla de la mencion al RL. La innovacion destacada en la model card es la "Thinking Preservation", una opcion para retener el contexto de razonamiento de mensajes historicos y reducir overhead en desarrollo iterativo.

## Capacidades

- Generacion de texto y razonamiento general.
- Generacion y edicion de codigo, con enfasis en flujos frontend y razonamiento a nivel de repositorio (agentic coding).
- Comprension de imagenes (pipeline image-text-to-text, encoder de vision).
- Razonamiento matematico (no se detallan benchmarks especificos en la informacion disponible).
- Preservacion del contexto de razonamiento entre turnos ("Thinking Preservation").
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: si, orientado a tareas de codigo agentico segun la model card.
- Capacidades multilingues: no disponible (no se listan idiomas).
- Contexto largo: hasta 262.144 tokens nativos, extensible a 1.010.000.

## Casos de uso

- Agente de codigo en repositorios: el modelo puede razonar sobre un repositorio completo y resolver issues de extremo a extremo, apoyado en su contexto nativo de 262.144 tokens y en la preservacion del contexto de razonamiento entre iteraciones.
- Automatizacion de desarrollo frontend: genera y modifica componentes de interfaz dentro de flujos de trabajo agenticos, segun el enfasis declarado de la model card en workflows frontend.
- Revision de pull requests y parches: con SWE-bench Verified en 77,2, es adecuado para tareas de resolucion de bugs y generacion de parches verificables en pipelines de CI/CD.
- Asistente de documentacion tecnica con imagenes: al aceptar entrada image-text-to-text, puede describir diagramas de arquitectura, capturas de UI o errores visuales y generar documentacion asociada.
- Analisis de documentacion extensa: su ventana de hasta 1.010.000 tokens permite procesar manuales, especificaciones o bases de codigo completas en una sola pasada.
- Migracion y refactorizacion multilingue de codigo: SWE-bench Multilingual en 72,6 (Qwen3.6-35B-A3B) y 77,2 en Verified indican capacidad para trabajar con bases de codigo en varios lenguajes.
- Desarrollo iterativo asistido: la opcion de retener el contexto de razonamiento historico reduce el coste de repetir explicaciones en sesiones largas de depuracion.

## Benchmarks y rendimiento

Resultados publicados en la model card (modelo base Qwen3.6-27B frente a alternativas):

| Benchmark | Qwen3.5-27B | Qwen3.5-397B-A17B | Gemma4-31B | Claude 4.5 Opus | Qwen3.6-35B-A3B | Qwen3.6-27B |
|---|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 76,2 | 52,0 | 80,9 | 73,4 | 77,2 |
| SWE-bench Pro | 51,2 | 50,9 | 35,7 | 57,1 | 49,5 | 53,5 |
| SWE-bench Multilingual | 69,3 | 69,3 | 51,7 | 77,5 | 67,2 | no disponible |

Nota: la model card solo incluye resultados de benchmarks de codigo agentico. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 27.781.427.952 parametros, en FP16 se requieren aproximadamente 55,6 GB solo para pesos; en BF16, idem; en cuantizacion de 8 bits, unos 27,8 GB; en 4 bits, unos 13,9 GB (estimaciones teoricas a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, un unico A100 80 GB o H100 80 GB permite inferencia en BF16; configuraciones multi-GPU para contextos muy largos.
- GPU de consumo: no disponible de forma oficial; por capacidad de memoria, una RTX 4090 (24 GB) solo cabria con cuantizacion agresiva (4 bits) y contexto reducido.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, segun la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B (base de este repo) | 27B | 262.144 (ext. 1.010.000) | 77,2 | Apache 2.0 | Pesos abiertos en HF |
| Qwen3.5-27B | 27B | no disponible | 75,0 | no disponible | Pesos abiertos |
| Qwen3.6-35B-A3B | 35B totales (A3B activos) | no disponible | 73,4 | no disponible | Pesos abiertos |
| Gemma4-31B | 31B | no disponible | 52,0 | no disponible | Pesos abiertos |
| Claude 4.5 Opus | no disponible | no disponible | 80,9 | Propietaria | API |

## Limitaciones y advertencias

- La model card del repositorio es la de Qwen3.6-27B original; no se documenta el efecto real del run de SFT de 1M de ejemplos ni del RL sobre el comportamiento final del checkpoint.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (12 de noviembre de 2026); no hay evidencia de validacion por parte de la comunidad.
- No se detallan los idiomas soportados, lo que impide garantizar calidad en castellano u otras lenguas distintas del ingles.
- No se publican benchmarks del checkpoint ajustado; los resultados de la tabla corresponden al modelo base Qwen3.6-27B.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan mitigaciones especificas en la informacion disponible.
- Sesgos conocidos: no disponibles.
- El tamano del repo es de 270,8 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base enlazada en la model card antes de un despliegue en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ceselder/maemm-27b-rl-after-1m-sft-run
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- Blog de Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Qwen Chat: https://chat.qwen.ai
