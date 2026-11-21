# qda-lab/QDA-Qwen3.8-27B-Q6-GGUF

## Resumen

QDA-Qwen3.8-27B-Q6-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-27B (27.320.697.856 parámetros) publicada por qda-lab para su uso con llama.cpp. El archivo principal, `QDA-Qwen3.8-27B-Q6.gguf`, ocupa 22,0 GB y combina mayoritariamente tensores Q6_K (75 % por recuento de pesos), con una mezcla de Q5_K (19 %), Q8_0 (5 %) y Q4_K (1 %), más tensores pequeños en F32. La licencia es Apache-2.0, heredada del modelo base.

El interés de esta publicación no reside en un modelo nuevo, sino en el proceso de cuantización: qda-lab aplica GPTQ sobre las rejillas nativas de llama.cpp para resolver los códigos de los tensores Q5_K y Q6_K, ajustando las escalas por grupo con el ajuste ponderado por importancia de llama.cpp y usando la diagonal del hessiano de GPTQ como ponderación. Además, conserva la cabeza de predicción multi-token (MTP) del modelo base, lo que permite decodificación especulativa en llama.cpp con `--spec-type draft-mtp`.

El resultado es un GGUF que, según la evaluación del autor en modo thinking con llama.cpp, obtiene una media de 80,3 frente a 78,9 de la cuantización de referencia unsloth UD-Q6_K, con diferencias dentro del ruido entre ejecuciones en la mayoría de benchmarks. Es relevante para quienes despliegan Qwen3.8-27B en hardware de una sola GPU y quieren una cuantización Q6 con decodificación especulativa integrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); cuantización GGUF para llama.cpp |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Mezcla por tensor: 75 % Q6_K, 19 % Q5_K, 5 % Q8_0, 1 % Q4_K (por recuento de pesos); normas y tensores pequeños en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`QDA-Qwen3.8-27B-Q6.gguf`, 22,0 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, un transformer de 27.320.697.856 parámetros del que esta publicación es una cuantización, no un reentrenamiento. El proceso de cuantización parte de la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo base en bf16. En las 64 capas del transformer, GPTQ (damping 0,01, orden de activación estático) resuelve los códigos de los tensores Q5_K y Q6_K directamente sobre las rejillas de llama.cpp, ajustando las escalas de cada grupo con el ajuste ponderado por importancia de llama.cpp y ponderando por la diagonal del hessiano de GPTQ. El embedding de tokens, la cabeza de salida, el bloque MTP (que se conserva) y los tensores en Q8_0 se escriben desde el modelo bf16 con el cuantizador propio de llama.cpp. La mezcla por tensor la eligió una búsqueda automatizada de QDA.

La calibración usa un fichero de respuestas del propio modelo base: `kd-traces-1234.jsonl` (1.234 filas, 1.226 tras eliminar 8 por solapamiento con conjuntos de evaluación), generado con vLLM en bf16 a temperatura 1,0, top-p 0,95, top-k 20, semilla 17 + número de fila y un máximo de 8.192 tokens nuevos. Los prompts son problemas de matemáticas, código y ciencia procedentes de NuminaMath-CoT, code_contests y ARC. La construcción final emplea 597 muestras de 4.096 tokens con semilla 0. Un rebuild completo tarda 2.360 s en una H100 de 80 GB.

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking, con cierre explícito del razonamiento en `</think>`.
- Razonamiento matemático de competición: evaluado en AIME 2025 y HMMT Feb 2026.
- Razonamiento científico de nivel experto: evaluado en GPQA-Diamond.
- Generación de código: evaluado en LiveCodeBench; el conjunto de calibración incluye problemas de code_contests.
- Seguimiento de instrucciones: evaluado en IFBench.
- Conocimiento general y razonamiento multidisciplinar: evaluado en MMLU-Pro.
- Decodificación especulativa mediante la cabeza MTP incluida en el archivo, activable con `--spec-type draft-mtp` en llama-server.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de tool calling, agentes o multilingüismo: no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo obtiene 89,6 en AIME 2025 y 73,9 en HMMT Feb 2026 en modo thinking, por lo que es adecuado para resolver problemas de competición o verificar demostraciones paso a paso con cadenas de razonamiento largas (hasta 81.920 tokens nuevos en la evaluación).
- Asistencia en investigación científica: con 82,1 en GPQA-Diamond, puede emplearse para responder preguntas de nivel doctorado en física, química y biología, siempre con revisión humana dado el riesgo de alucinación.
- Generación y revisión de código: 84,4 en LiveCodeBench lo sitúa como opción para autocompletado, generación de tests y revisión de parches en pipelines de integración continua, ejecutando llama-server en una GPU propia.
- Despliegue local en una sola GPU: el archivo de 22,0 GB cabe en GPUs de 24 GB o más con cuantización Q6, lo que permite servir el modelo en estaciones de trabajo sin depender de APIs externas.
- Servicio conversacional con decodificación especulativa: al conservar la cabeza MTP, llama-server puede acelerar la generación con `--spec-type draft-mtp`, útil en asistentes interactivos donde la latencia importa.
- Evaluación y benchmarking de cuantizaciones: el repositorio incluye la receta reproducible (QDA 0.1.0, llama.cpp en el commit `9e2a04a439edc49f08c5acdafefae19dfa25a658`) y los ficheros de calibración con sus hashes, lo que permite replicar el proceso y comparar mezclas de cuantización sobre el mismo modelo base.
- Procesamiento por lotes de problemas de matemáticas y código: con los prompts de calibración publicados (NuminaMath-CoT, code_contests, ARC) como referencia, puede montarse un pipeline de generación masiva de soluciones con temperatura 1,0 y top-p 0,95.

## Benchmarks y rendimiento

Evaluación del autor en modo thinking, pass@1 promediado sobre 1–8 semillas, con llama.cpp, misma muestrea y mismos topes de tokens para ambos archivos:

| Benchmark | QDA | unsloth UD-Q6_K |
|---|---|---|
| AIME 2025 | 89,6 | 85,4 |
| HMMT Feb 2026 | 73,9 | 71,6 |
| GPQA-Diamond | 82,1 | 81,1 |
| IFBench | 68,8 | 66,9 |
| MMLU-Pro | 83,4 | 83,4 |
| LiveCodeBench | 84,4 | 84,8 |
| Media | 80,3 | 78,9 |

Configuración de evaluación: temperatura 1,0, top-p 0,95, top-k 20, min-p 0, presence penalty 0, repetition penalty 1,0; thinking activado con `chat_template_kwargs: {"reasoning_effort": "medium"}`; MTP y decodificación especulativa desactivados. Topes de tokens nuevos por ítem: 81.920 en AIME 2025, HMMT Feb 2026 y LiveCodeBench; 32.768 en GPQA-Diamond, IFBench y MMLU-Pro. Repeticiones: 8 semillas (17–24) en AIME 2025 y HMMT Feb 2026, 4 semillas (17–20) en GPQA-Diamond e IFBench, 1 semilla (17) en MMLU-Pro y LiveCodeBench. El autor indica que las diferencias frente a la cuantización de referencia están dentro del ruido entre ejecuciones en todos los benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo pesa 22,0 GB, por lo que se necesita al menos esa cantidad de memoria más el espacio para el contexto KV; con contexto largo el requisito crece por encima de 24 GB.
- GPU recomendadas: H100 de 80 GB (el rebuild del autor se hizo en 1× H100), A100 de 80 GB o 40 GB, y GPUs de consumo con 24 GB o más para contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (por ejemplo, RTX 4090) siempre que se limite la longitud de contexto; en 16 GB no cabe sin cuantizaciones más agresivas.
- Opciones de despliegue: llama.cpp (`llama-server -hf qda-lab/QDA-Qwen3.8-27B-Q6-GGUF`), con soporte de `--spec-type draft-mtp` para decodificación especulativa. Otras opciones (vLLM, TGI, Ollama) no se mencionan en la información proporcionada.
- Latencia y throughput: no disponible en la informacion proporcionada. El rebuild de la cuantización (no la inferencia) tarda 2.360 s en 1× H100.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media de benchmarks (evaluación del autor) | Licencia | Formato |
|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-Q6-GGUF | 27.320.697.856 | no disponible | 80,3 | Apache-2.0 | GGUF (22,0 GB) |
| unsloth UD-Q6_K (Qwen3.8-27B) | no disponible | no disponible | 78,9 | no disponible | GGUF |
| Qwen/Qwen3.8-27B (bf16) | 27.320.697.856 | no disponible | no disponible | Apache-2.0 | safetensors |

La comparación se limita a la cuantización de referencia de unsloth y al modelo base en bf16, los únicos mencionados en la información proporcionada. No se dispone de datos de otros modelos de tamaño similar.

## Limitaciones y advertencias

- El campo `general.file_type` del encabezado GGUF indica 15 (Q4_K_M), una etiqueta que el escritor GGUF de QDA pone a todos los archivos que genera. El autor lo dejó así deliberadamente para que el archivo evaluado sea idéntico byte a byte al publicado; llama.cpp carga cada tensor por su tipo almacenado, por lo que la etiqueta no afecta a la ejecución, pero puede confundir a herramientas que lean ese campo.
- Las diferencias frente a la cuantización de referencia están dentro del ruido entre ejecuciones en todos los benchmarks; no debe interpretarse la media de 80,3 como una ventaja sistemática.
- La evaluación se hizo con una configuración concreta (temperatura 1,0, top-p 0,95, reasoning_effort medium, MTP desactivado); otros ajustes pueden dar resultados distintos.
- Riesgo de alucinación inherente al modelo base; en dominios como GPQA-Diamond o matemáticas de competición se recomienda verificación humana.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible en la informacion proporcionada.
- Longitud de contexto: no disponible en la informacion proporcionada; conviene consultar la model card del modelo base antes de desplegar con contextos largos, ya que el requisito de VRAM crece con el KV cache.
- La licencia Apache-2.0 del archivo es la del modelo base; los ficheros de calibración conservan sus propias licencias (NuminaMath-CoT Apache-2.0, code_contests CC BY 4.0, ARC CC BY-SA 4.0) y no forman parte del modelo, pero deben respetarse si se redistribuyen.
- El repositorio tiene 0 likes y 1.546 descargas en el momento de la consulta; es una publicación reciente (creada el 2026-11-15) sin validación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-Q6-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de QDA: https://github.com/humanfia/qda
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Receta e inputs de cuantización: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.8-27B-Q6-GGUF
- Pools de calibración: https://huggingface.co/datasets/qda-lab/qda-calibration-pools
- Paper referenciado en los tags: arXiv:2611.23388 (https://arxiv.org/abs/2611.23388)
