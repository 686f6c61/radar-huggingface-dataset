# qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A4

## Resumen

QDA-DeepSeek-R1-Distill-Llama-8B-W4A4 es una cuantización NVFP4 del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicada por qda-lab. El modelo base es un destilado de razonamiento de DeepSeek-R1 sobre la arquitectura Llama, y esta versión lo comprime de 16,1 GB (BF16) a 6,3 GB manteniendo, según el autor, el 96,8 % de la precisión del original. La motivación es clara: desplegar un modelo de razonamiento de 8B en GPUs NVIDIA Blackwell con requisitos de memoria y ancho de banda notablemente menores.

La cuantización combina pesos y activaciones en 4 bits (W4A4) con formato NVFP4 (E2M1 con escalas E4M3 por cada 16 entradas y una escala tensorial FP32), complementada con capas seleccionadas en FP8 W8A8 y embeddings en BF16. El resultado es un checkpoint de 6,3 GB que se ejecuta nativamente en hardware Blackwell (B200, GB300, RTX PRO 6000) mediante vLLM, con soporte declarado para transformers y compressed-tensors.

Es relevante ahora porque demuestra que la cuantización de extremo a extremo (pesos y activaciones a 4 bits) es viable en modelos de razonamiento sin una degradación catastrófica, y porque el proceso de construcción se publica como receta reproducible con la herramienta QDA 0.1.0. La licencia MIT del modelo base se mantiene, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama), cuantizado NVFP4/FP8 |
| Parametros totales | 5.429.792.768 (5,43 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | NVFP4 W4A4 (cuerpo principal), FP8 W8A8 (100 tensores), BF16 (embeddings) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base DeepSeek-R1-Distill-Llama-8B es un transformer decoder-only de tipo Llama, destilado por DeepSeek a partir de su modelo de razonamiento R1. Esta versión de qda-lab no reentrena el modelo, sino que aplica un pipeline de cuantización: los pesos se cuantizan con GPTQ y después se ejecutan 100 pasos de destilación desde el modelo BF16 para entrenar las escalas de cuantización y las normas. La receta concreta (qué capas van en FP4, FP8 o BF16) fue seleccionada por la búsqueda automatizada de QDA.

La asignación de precisión es mixta: el cuerpo principal usa NVFP4 (pesos E2M1 con una escala E4M3 por cada 16 entradas de entrada y una escala tensorial FP32, y activaciones cuantizadas del mismo modo en tiempo de ejecución). Cien tensores se mantienen en FP8 W8A8 con pesos por canal y activaciones dinámicas por token: q/k/v de las capas 0–20, o_proj de las capas 0–21 y 31, down_proj de las capas 1, 5–15 y 31, y gate_proj/up_proj de la capa 31. El lm_head también va en FP8 y los embeddings permanecen en BF16. El modelo conserva el modo de razonamiento (thinking mode) del destilado original.

## Capacidades

- Generación de texto y razonamiento multi-paso en modo thinking, heredado del destilado de DeepSeek-R1.
- Razonamiento matemático competitivo: evaluado en AIME 2025 y HMMT Feb 2026 con pass@1 promediado sobre múltiples muestras.
- Razonamiento científico y de conocimiento experto: evaluado en GPQA-Diamond y MMLU-Pro.
- Generación de código: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFEval.
- Conversación multi-turno (tag `conversational`).
- Compatible con text-generation-inference y endpoints compatibles según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de competición (AIME, HMMT) con cadenas de razonamiento largas; su modo thinking y el límite de salida de 32.768 tokens usado en la evaluación lo hacen adecuado para problemas que requieren derivaciones extensas.
- Tutoría y explicación paso a paso: al conservar el modo de razonamiento del destilado R1, puede desglosar la resolución de problemas de matemáticas y ciencias para entornos educativos.
- Generación y revisión de código: con resultados en LiveCodeBench cercanos al modelo BF16 (37,6 frente a 38,9), es viable para autocompletado, revisión y generación de tests en pipelines de desarrollo.
- Despliegue en GPUs Blackwell con memoria limitada: al ocupar 6,3 GB en lugar de 16,1 GB, permite servir el modelo en una sola GPU RTX PRO 6000 o compartir una B200/GB300 entre varias instancias.
- Evaluación de cuantizaciones en investigación: la receta reproducible con QDA 0.1.0 permite reconstruir el checkpoint y comparar configuraciones de precisión mixta para estudiar el impacto de FP4 en tareas de razonamiento.
- Procesamiento por lotes de preguntas de conocimiento experto: con GPQA-Diamond en 44,5, puede usarse para triaje o respuestas preliminares en dominios científicos, siempre con revisión humana.
- Servicio de inferencia de alto rendimiento: integrable con vLLM 0.33.0 en GB300, lo que facilita su uso como backend en APIs compatibles con OpenAI.

## Benchmarks y rendimiento

Resultados publicados por el autor (thinking mode, pass@1 promediado sobre las muestras; temperatura 0,6, top-p 0,95; mismo conjunto de problemas, semillas y límite de salida de 32.768 tokens para todos los modelos):

| Benchmark | Problemas × muestras | BF16 (16,1 GB) | QDA W4A4 (6,3 GB) |
|---|---:|---:|---:|
| AIME 2025 | 30 × 32 | 34,6 | 33,1 |
| HMMT Feb 2026 | 33 × 32 | 25,3 | 24,7 |
| GPQA-Diamond | 198 × 16 | 47,3 | 44,5 |
| IFEval | 541 × 16 | 62,7 | 62,1 |
| MMLU-Pro | 12.032 × 1 | 49,1 | 47,6 |
| LiveCodeBench | 454 × 4 | 38,9 | 37,6 |
| **Promedio** | | **43,0** | **41,6** |

La retención media declarada es del 96,8 % respecto a BF16. El autor indica que no había disponible ningún checkpoint NVFP4 de este modelo de NVIDIA, RedHatAI o unsloth para comparar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,3 GB para los pesos; el consumo real añade memoria para KV cache y activaciones, no cuantificada en la información disponible.
- GPUs compatibles: NVIDIA Blackwell con soporte nativo de FP4, es decir, B200, GB300 y RTX PRO 6000. La evaluación se realizó con vLLM 0.33.0 sobre GB300.
- GPUs consumer: no se indica compatibilidad con GPUs consumer en la información proporcionada; el formato NVFP4 requiere hardware Blackwell.
- Opciones de despliegue: vLLM (`vllm serve qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A4`), transformers con compressed-tensors, y text-generation-inference según los tags. No se menciona soporte GGUF ni Ollama para este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.
- Para reproducir la cuantización se requiere QDA 0.1.0, Linux, una GPU NVIDIA Blackwell y `uv`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-DeepSeek-R1-Distill-Llama-8B-W4A4 | 5,43 mil millones | no disponible | NVFP4 W4A4 + FP8 | MIT | Hugging Face, 715 descargas |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B (BF16) | 8 mil millones (según nombre) | no disponible | BF16 | MIT | Hugging Face (modelo base) |
| Checkpoints NVFP4 de NVIDIA / RedHatAI / unsloth | no disponible | no disponible | NVFP4 | no disponible | no disponible según el autor |

El autor no proporciona comparación con alternativas cuantizadas porque no encontró checkpoints NVFP4 equivalentes. La comparación directa disponible es contra el modelo base BF16, con los resultados de la tabla de benchmarks.

## Limitaciones y advertencias

- La cuantización W4A4 introduce una pérdida de precisión medible: la caída más acusada es en GPQA-Diamond (47,3 a 44,5, unos 2,8 puntos) y en MMLU-Pro (49,1 a 47,6).
- Requiere hardware NVIDIA Blackwell; no es desplegable en GPUs Ampere, Ada o consumer sin soporte FP4 nativo.
- Los pesos reconstruidos con la receta no son bit-idénticos al checkpoint publicado, ya que la receta incluye pasos de gradiente.
- Riesgo de alucinación inherente al modelo base y acentuado en tareas de conocimiento experto, donde la degradación por cuantización es mayor.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe equivalente al del modelo original.
- Longitud de contexto no documentada en la información disponible; el límite de 32.768 tokens citado corresponde al tope de salida de la evaluación, no necesariamente al contexto máximo.
- Aunque la licencia es MIT, conviene verificar las condiciones del modelo base y de los datos de destilación para usos comerciales concretos.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W4A4)
- [Modelo base DeepSeek-R1-Distill-Llama-8B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B)
- [Paper QDA: Closed-Loop LLM Quantization Design with Agents](https://arxiv.org/abs/2611.23388)
- [Repositorio QDA en GitHub](https://github.com/humanfia/qda)
- [Dataset de entradas de la receta](https://huggingface.co/datasets/qda-lab/qda-recipe-inputs)
