# RedHatAI/Muse-Glimmer-30B-NVFP4

## Resumen

Muse-Glimmer-30B-NVFP4 es una versión cuantizada en FP4 (NVFP4) del modelo multimodal Muse-Glimmer-30B desarrollado por Meta (identificado en la model card como "Muse"). La cuantización ha sido realizada por RedHatAI mediante LLM Compressor, aplicando un esquema NVFP4 (W4A4) sobre los operadores lineales de los bloques transformer, dejando fuera de la cuantización las capas de visión, `lm_head` y `embed_tokens`. El resultado es un checkpoint que reduce el tamaño en disco y los requisitos de memoria GPU en aproximadamente un 75% respecto al base en BF16, manteniéndose apto para inferencia con vLLM.

El modelo base es un transformer multimodal de tipo image-text-to-text con arquitectura `MuseGlimmerForConditionalGeneration`, capaz de recibir texto e imágenes y generar texto. El checkpoint publicado contiene 18.767.497.024 parámetros reales según los safetensors, pese a la denominación comercial "30B" del modelo base. Está pensado para despliegues en producción con vLLM sobre hardware Blackwell (B200), donde el formato NVFP4 aprovecha aceleración nativa de FP4.

La relevancia actual de esta ficha radica en que demuestra la viabilidad de cuantizar a 4 bits pesos y activaciones de un modelo multimodal de razonamiento y código sin degradación significativa en benchmarks de conocimiento y ingeniería de software, con licencia Apache 2.0 y validación explícita sobre RHOAI 3.5.1 y RHAIIS 3.6.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MuseGlimmerForConditionalGeneration (transformer multimodal image-text-to-text) |
| Parámetros totales | 18.767.497.024 (dato real de safetensors; el nombre comercial indica 30B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (W4A4); pesos y activaciones de operadores lineales en FP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base `meta-models/Muse-Glimmer-30B`, un transformer multimodal con arquitectura `MuseGlimmerForConditionalGeneration` que acepta entradas de texto e imagen y produce salida textual. La cuantización se aplicó exclusivamente a pesos y activaciones de las capas lineales dentro de los bloques transformer mediante `GPTQModifier` con esquema `NVFP4`, usando 1024 muestras de calibración del dataset `mlabonne/open-perfectblend` con longitud máxima de secuencia 2048. Se excluyeron de la cuantización las capas de visión (`re:.*vision.*`), `lm_head` y `embed_tokens`, preservando así la precisión de la torre visual y de las proyecciones de entrada/salida.

El proceso de entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se detalla en la información disponible. La model card menciona un modo de razonamiento configurable mediante `reasoning_strength: xhigh`, lo que sugiere un entrenamiento orientado a razonamiento extendido, y un parser específico `muse_glimmer` para tool calling y reasoning en vLLM. La evaluación se realizó con temperatura 1.0, top_p 0.95 y top_k 64, con puntuación pass@1 usando `inspect_evals`.

## Capacidades

- Generación de texto multimodal: acepta entradas de texto e imagen y genera respuestas textuales.
- Razonamiento extendido: soporta modo de razonamiento con nivel de esfuerzo configurable (`reasoning_strength: xhigh` como máximo).
- Tool calling / function calling: parser dedicado `muse_glimmer` y flag `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso y uso como agente: validado en SWE-bench Verified con scaffold de agente estilo ReAct.
- Capacidades de código: resolución de incidencias reales de ingeniería de software (SWE-bench Verified).
- Conocimiento académico y razonamiento científico: evaluado en GPQA-Diamond y MMLU-Pro.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de audio: no disponible.

## Casos de uso

- Agentes de resolución de incidencias de software: el modelo puede operar como agente ReAct dentro de entornos Docker aislados para localizar, parchear y validar bugs en repositorios reales, con un rendimiento de 0.670 pass@1 en SWE-bench Verified bajo el scaffold `inspect_evals`.
- Asistencia a la ingeniería de software en producción: integración en pipelines de CI/CD mediante tool calling nativo (`--tool-call-parser muse_glimmer`) para consultar APIs, ejecutar tests y proponer parches automáticamente.
- Razonamiento científico asistido: útil en tareas de química, biología y física de nivel posgrado, con 0.798 de precisión media en GPQA-Diamond, adecuado para validación de hipótesis y revisión de literatura técnica.
- Análisis de documentación técnica con imágenes: al aceptar entradas image-text-to-text, puede procesar diagramas de arquitectura, capturas de pantalla de errores o esquemas junto a texto explicativo para diagnosticar problemas.
- Evaluación de conocimiento experto: 0.783 en MMLU-Pro sobre 12.032 preguntas, apropiado para sistemas de QA especializado en dominios profesionales.
- Despliegue en clústeres con aceleración FP4: al estar validado en RHOAI 3.5.1 y RHAIIS 3.6.0 con vLLM 0.28.0, encaja en plataformas empresariales de inferencia sobre GPU Blackwell B200, con un único B200 por réplica para benchmarks de conocimiento y TP=2 para SWE-bench.
- Servicio de chat conversacional multimodal: el tag `conversational` y el pipeline image-text-to-text permiten construir asistentes que alternan texto e imágenes en conversaciones multi-turno.

## Benchmarks y rendimiento

| Benchmark | Base (BF16) | Este checkpoint (NVFP4) |
|---|---|---|
| GPQA-Diamond (198 preguntas, 3 pasadas) | 0.781 ± 0.024 | 0.798 ± 0.026 |
| MMLU-Pro (12.032 preguntas) | 0.807 ± 0.004 | 0.783 ± 0.004 |
| SWE-bench Verified (500 instancias) | 0.684 ± 0.021 | 0.670 ± 0.021 |

Las puntuaciones son pass@1. GPQA-Diamond corresponde a la media de 3 pasadas (594 muestras); MMLU-Pro y SWE-bench Verified a una sola época. El intervalo `±` es el error estándar binomial. Las precisiones por pasada en GPQA-Diamond fueron 0.768/0.773/0.803 para el base y 0.803/0.793/0.798 para este checkpoint; la diferencia de 1,7 puntos queda dentro de un error estándar de la diferencia pareada. SWE-bench Verified se ejecutó con scaffold de agente ReAct de `inspect_evals`, 48 sandboxes Docker offline concurrentes y límite de 4 horas por instancia, auditado contra fugas de solución. La model card del base reporta 76.0 con su propio scaffold, no directamente comparable.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 23,4 GB en disco; con NVFP4 (4 bits por parámetro) la memoria de pesos ronda los 9-10 GB, más overhead de activaciones, KV cache y torre visual no cuantizada.
- GPU recomendadas: NVIDIA B200 (validado oficialmente, TP=1 para benchmarks de conocimiento, TP=2 para SWE-bench Verified); se requiere hardware con soporte nativo de FP4 para aprovechar el formato NVFP4.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU consumer en la información disponible; NVFP4 está orientado a arquitecturas Blackwell.
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:muse-glimmer`, vLLM 0.28.0), con soporte de `compressed-tensors`; validado en RHOAI 3.5.1 y RHAIIS 3.6.0. Soporte de llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponibles en la información proporcionada.
- Argumentos obligatorios de servicio: `--generation-config auto`, `--tensor-parallel-size`, `--enable-auto-tool-choice`, `--tool-call-parser muse_glimmer`, `--reasoning-parser muse_glimmer`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RedHatAI/Muse-Glimmer-30B-NVFP4 | 18.767.497.024 | no disponible | NVFP4 (W4A4) | Apache 2.0 | Hugging Face, vLLM |
| meta-models/Muse-Glimmer-30B (base BF16) | 30B (denominación comercial) | no disponible | BF16 | Apache 2.0 (según este checkpoint) | Hugging Face, vLLM |
| Alternativas de mismo tamaño o tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos sobre otros modelos multimodales comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización NVFP4 degrada ligeramente MMLU-Pro (de 0.807 a 0.783) y SWE-bench Verified (de 0.684 a 0.670) respecto al base BF16; GPQA-Diamond no muestra degradación significativa.
- Las capas de visión, `lm_head` y `embed_tokens` no están cuantizadas, por lo que el ahorro de memoria no es exactamente proporcional al 75% teórico.
- Solo es apto para inferencia con vLLM sobre hardware con soporte FP4; no se garantiza funcionamiento en GPU sin aceleración NVFP4.
- Riesgo de alucinación inherente a modelos generativos de gran tamaño; no se documentan medidas específicas de mitigación.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe más allá del inglés implícito en los benchmarks.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas sin validación empírica.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base original antes de redistribuir.
- El modelo base reporta 76.0 en SWE-bench con su propio scaffold; las cifras de esta ficha usan `inspect_evals` y no son directamente comparables con publicaciones del vendor.
- Requiere `--generation-config auto` y parsers específicos en vLLM; configuraciones incorrectas pueden producir salidas malformadas en tool calling o reasoning.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-NVFP4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Guía de uso vLLM: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- README del checkpoint: https://huggingface.co/RedHatAI/Muse-Glimmer-30B-NVFP4/blob/main/README.md
