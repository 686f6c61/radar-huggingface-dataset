# qda-lab/QDA-Qwen3.6-35B-A3B-Q4-GGUF

## Resumen

QDA-Qwen3.6-35B-A3B-Q4-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.6-35B-A3B, publicada por qda-lab para su uso con llama.cpp. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 34.660.610.688 parámetros totales (aproximadamente 34,7 mil millones) y, segun la nomenclatura del nombre (A3B), unos 3 mil millones de parámetros activos por token. La cuantización resultante ocupa 21,7 GB en el repositorio y emplea mayoritariamente el formato Q4_K de llama.cpp.

La relevancia de esta ficha reside en que se trata de una cuantización alternativa a las publicadas por otros equipos (como unsloth), con una mezcla de tipos de cuantización elegida mediante búsqueda automatizada y con resultados de evaluación declarados por el autor que igualan o superan ligeramente la referencia en varias pruebas. El modelo conserva la licencia Apache-2.0 del modelo base.

El modelo está pensado para generación de texto conversacional y razonamiento, con soporte declarado de modo de pensamiento (thinking mode) segun los benchmarks reportados. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la composición exacta del entrenamiento del modelo base en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), segun tags del modelo base |
| Parametros totales | 34.660.610.688 |
| Parametros activos | Aproximadamente 3B (inferido del nombre A3B; no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla: 70 % Q4_K, 23 % Q5_K, 6 % Q8_0, 1,5 % Q6_K (por recuento de pesos); router y tensores pequenos en F32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo unico `QDA-Qwen3.6-35B-A3B-Q4.gguf`, 21,7 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture of Experts, segun los tags de Hugging Face (`moe`, `qwen3.6`). La cuantización QDA conserva la estructura del modelo original pero reorganiza los tipos de cuantización por tensor: los expertos enrutados usan Q4_K, salvo las proyecciones down de los expertos de las capas 10 a 39, que usan Q5_K; la atención, las proyecciones de atención lineal, los expertos compartidos y la cabeza de salida se almacenan en Q8_0; el embedding de tokens en Q6_K; y las normas y el router de expertos en F32. El archivo no incluye capas de predicción multi-token.

El proceso de cuantización combina GPTQ (damping 0,05, orden de activación estático) para resolver los códigos de los tensores Q4_K y Q5_K directamente sobre las rejillas de llama.cpp, con un ajuste de escalas ponderado por la diagonal del Hessiano de GPTQ. Los tensores Q8_0 y Q6_K se escriben directamente desde el modelo en bf16 mediante el cuantizador propio de llama.cpp. La mezcla de tipos fue seleccionada por búsqueda automatizada de QDA. La calibración usó las 2.048 filas del config `chat` del dataset `qda-lab/qda-calibration-pools` (conversaciones multi-turno de HuggingFaceH4/ultrachat_200k), procesadas como 597 muestras de 4.096 tokens con semilla 0. No se dispone de información sobre los datos de entrenamiento originales del modelo base (número de tokens, composición, RLHF/DPO).

## Capacidades

- Generación de texto conversacional multi-turno, segun el pipeline declarado (`text-generation`, tag `conversational`).
- Razonamiento matemático y de dominio cientifico, evidenciado por los benchmarks reportados (AIME 2025, HMMT Feb 2026, GPQA-Diamond).
- Generación de código, evidenciado por LiveCodeBench.
- Seguimiento de instrucciones, evidenciado por IFBench.
- Modo de pensamiento (thinking mode), segun la sección de evaluación de la model card.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento matemático asistido: el modelo obtiene 90,4 en AIME 2025 y 82,2 en HMMT Feb 2026 segun la model card, por lo que es adecuado para resolver problemas de competición y verificar demostraciones paso a paso en entornos de investigación.
- Generación de código en pipelines locales: con 81,3 en LiveCodeBench, puede integrarse en flujos de autocompletado y revisión de código ejecutados sobre llama.cpp en hardware propio, sin depender de APIs externas.
- Asistencia científica y QA de dominio: sus 84,5 en GPQA-Diamond lo hacen util para responder preguntas de nivel posgrado en fisica, quimica y biologia dentro de herramientas internas de documentación técnica.
- Despliegue en estación de trabajo con GPU de consumo: al ocupar 21,7 GB en Q4_K, cabe en GPUs con 24 GB de VRAM (por ejemplo, RTX 4090) y permite ejecutar un modelo MoE de 34,7B parámetros en local para prototipado y desarrollo.
- Servicio conversacional autoalojado: mediante `llama-server -hf qda-lab/QDA-Qwen3.6-35B-A3B-Q4-GGUF` se puede levantar un endpoint compatible con la API de chat para aplicaciones internas de atención al usuario, con la ventaja de la licencia Apache-2.0.
- Evaluación y reproducción de cuantizaciones: la model card incluye la receta completa (versión 0.1.1 de la librería QDA, commit concreto de llama.cpp y dataset de calibración con hash), lo que permite reproducir la build y comparar mezclas de cuantización en experimentos de investigación.
- Seguimiento de instrucciones en asistentes de productividad: con 69,8 en IFBench, es viable para tareas de extracción, resumen y transformación de texto guiadas por instrucciones estrictas en herramientas internas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (thinking mode, pass@1 promediado sobre 1–8 semillas, llama.cpp, mismo muestreo y límites de tokens para ambos archivos):

| Benchmark | QDA | unsloth UD-Q4_K_XL |
|---|---|---|
| AIME 2025 | 90,4 | 89,2 |
| HMMT Feb 2026 | 82,2 | 81,8 |
| GPQA-Diamond | 84,5 | 85,0 |
| IFBench | 69,8 | 70,3 |
| MMLU-Pro | 84,9 | 84,8 |
| LiveCodeBench | 81,3 | 80,6 |
| Promedio | 82,2 | 81,9 |

El autor indica que las diferencias con la cuantización de referencia están dentro del ruido entre ejecuciones en todos los benchmarks. No se han publicado resultados frente al modelo base en bf16 en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 21,7 GB solo para los pesos en Q4_K; se necesita margen adicional para el contexto KV, por lo que en la práctica se requieren alrededor de 24 GB o más.
- GPU recomendadas: RTX 4090 (24 GB) para uso en consumer; A100 (40/80 GB) y H100 (80 GB) para despliegue en servidor con contextos largos y mayor concurrencia.
- Cabe en GPU de consumo: sí, en modelos con 24 GB de VRAM (RTX 3090, RTX 4090); en GPUs de 16 GB no cabe sin descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (soporte nativo, incluido `llama-server`), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| QDA-Qwen3.6-35B-A3B-Q4-GGUF | 34,7B totales / ~3B activos | no disponible | GGUF Q4_K mixto | Apache-2.0 | Promedio 82,2 en la tabla del autor |
| unsloth UD-Q4_K_XL (misma base) | 34,7B totales / ~3B activos | no disponible | GGUF Q4_K_XL | Apache-2.0 | Promedio 81,9 en la tabla del autor |
| Qwen/Qwen3.6-35B-A3B (base bf16) | 34,7B totales / ~3B activos | no disponible | safetensors | Apache-2.0 | no disponible en la informacion |

No se dispone de datos de otras alternativas de la misma categoría (por ejemplo, otros modelos MoE de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al derivar de Qwen3.6, hereda los sesgos del modelo base, no documentados aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios fuera de los benchmarks evaluados.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información disponible, lo que impide garantizar su comportamiento en contextos largos o en castellano.
- Restricciones de licencia: los pesos se distribuyen bajo Apache-2.0, la misma que el modelo base, lo que permite uso comercial. Sin embargo, el dataset de calibración `qda-calibration-pools` es CC BY-NC-SA 4.0 en su conjunto (las filas `chat` provienen de ultrachat_200k, MIT), lo que afecta a la reproducción de la build, no al uso del modelo.
- Caveat de producción: la cuantización Q4_K introduce pérdida de precisión frente a bf16; las diferencias reportadas están dentro del ruido, pero deben validarse en el dominio concreto de despliegue.
- El archivo no incluye capas de predicción multi-token, por lo que no se beneficia de esa optimización de decodificación especulativa.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la citación está marcada como "TBD"; se trata de una publicación reciente sin validación comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-Q4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Dataset de calibración: https://huggingface.co/datasets/qda-lab/qda-calibration-pools
- Receta e inputs de reproducción: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.6-35B-A3B-Q4-GGUF
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
