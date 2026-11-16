# qda-lab/QDA-Qwen3.8-27B-Q4-GGUF

## Resumen

QDA-Qwen3.8-27B-Q4-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-27B, publicada por qda-lab para su uso con llama.cpp. El modelo base, desarrollado por el equipo Qwen de Alibaba, cuenta con 27.320.697.856 parámetros (27,3 mil millones) y se distribuye bajo licencia Apache-2.0. Esta versión cuantizada ocupa 17,6 GB y emplea una mezcla heterogénea de tipos de 4 y 5 bits por tensor, seleccionada mediante una búsqueda automatizada de la herramienta QDA.

La propuesta de esta ficha es ofrecer una alternativa a las cuantizaciones estándar (como las de Unsloth) manteniendo una precisión cercana al modelo en bf16. Según la model card, el archivo se genera con llama.cpp estándar y es reproducible a partir de una receta pública. Es relevante para desarrolladores que necesitan desplegar un modelo de 27B en hardware de consumo o en entornos con VRAM limitada sin renunciar a un rendimiento competitivo en razonamiento, matemáticas y código.

La información disponible sobre el modelo base es limitada: la model card del GGUF no detalla la arquitectura interna, los datos de entrenamiento ni el contexto del Qwen3.8-27B original, por lo que varios campos de esta ficha se marcan como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; no se detalla en la información proporcionada) |
| Parámetros totales | 27.320.697.856 (27,3 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mezcla por tensor: 39 % Q5_K, 30 % Q4_K, 12 % Q6_K, 12 % IQ4_XS, 5 % Q3_K (embedding de tokens), 2 % Q8_0 (normas y tensores pequeños en F32). Etiqueta de cabecera `general.file_type` = 15 (Q4_K_M) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo único `QDA-Qwen3.8-27B-Q4.gguf`, 17,6 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer de 27,3 mil millones de parámetros, aunque la información proporcionada no especifica detalles sobre su arquitectura interna (número de capas, dimensiones, mecanismos de atención) ni sobre su proceso de entrenamiento (tokens, composición del dataset, RLHF/DPO). La model card del GGUF menciona que el modelo cuenta con 64 capas transformer y un bloque de predicción multi-token (multi-token-prediction) que se conserva en la cuantización, lo que sugiere capacidades de decodificación especulativa o generación de múltiples tokens por paso.

El proceso de cuantización es el aspecto técnico más destacado. La mezcla por tensor fue elegida por una búsqueda automatizada de la herramienta QDA. En las 64 capas transformer, 126 tensores Q4_K se generan mediante redondeo al más cercano sobre la rejilla Q4_K de llama.cpp, ajustando las escalas de cada grupo con el ajuste ponderado por importancia de llama.cpp, ponderado por la diagonal del hessiano medida sobre los datos de calibración. El resto de tensores cuantizados se generan desde el modelo en bf16 con el cuantizador propio de llama.cpp, ponderados por una matriz de importancia medida sobre las mismas conversaciones de calibración. Los tensores Q8_0, el embedding de tokens y el bloque de predicción multi-token se cuantizan sin matriz de importancia.

La calibración utiliza las 2.048 filas del dataset público `qda-lab/qda-calibration-pools` (config `chat`), compuesto por conversaciones multi-turno de HuggingFaceH4/ultrachat_200k. La matriz de importancia se midió con `llama-imatrix` sobre las mismas 2.048 conversaciones en texto plano, con 128 fragmentos de 4.096 tokens e incluyendo la cabeza de salida. La receta es reproducible con la librería QDA 0.2.0 o superior y un checkout concreto de llama.cpp (commit `9e2a04a439edc49f08c5acdafefae19dfa25a658`).

## Capacidades

- Generación de texto conversacional y razonamiento en modo "thinking" (la evaluación se realizó con thinking mode activo).
- Razonamiento matemático de competición: evaluado en AIME 2025 (89,6) y HMMT Feb 2026 (75,8).
- Razonamiento científico de nivel experto: evaluado en GPQA-Diamond (83,2).
- Generación de código: evaluado en LiveCodeBench (83,0).
- Seguimiento de instrucciones: evaluado en IFBench (68,7).
- Conocimiento general y razonamiento multidisciplinar: evaluado en MMLU-Pro (83,1).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y uso conversacional.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible explícitamente, aunque el rendimiento en benchmarks de razonamiento sugiere capacidad para tareas multi-paso.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de competición y demostraciones paso a paso, adecuado para herramientas educativas o de verificación formal gracias a su rendimiento en AIME 2025 y HMMT.
- Generación de código en producción: con 83,0 en LiveCodeBench, puede integrarse en asistentes de programación o pipelines de revisión de código, ejecutándose localmente con llama.cpp.
- Análisis científico y técnico: su puntuación en GPQA-Diamond (83,2) lo hace apto para responder preguntas de nivel posgrado en física, química y biología en entornos de investigación con requisitos de privacidad.
- Asistente conversacional multi-turno: el modelo está calibrado sobre conversaciones de ultrachat_200k y soporta modo conversacional, por lo que encaja en chatbots de atención al cliente desplegados en hardware propio.
- Despliegue en hardware de consumo: con 17,6 GB en Q4, cabe en GPUs de 24 GB (RTX 3090/4090) y permite inferencia local sin depender de APIs en la nube.
- Evaluación y experimentación con cuantizaciones: la receta reproducible y los datos de calibración públicos permiten a investigadores comparar estrategias de cuantización mixta frente a Q4_K_M estándar.
- Procesamiento por lotes en servidores con VRAM limitada: al ocupar menos que una cuantización de 8 bits, permite mayor concurrencia o modelos más grandes en la misma GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card (thinking mode, pass@1 promediado sobre 1-8 semillas, llama.cpp, mismo muestreo y límites de tokens para ambos archivos):

| Benchmark | QDA Q4 | unsloth UD-Q4_K_XL |
|---|---|---|
| AIME 2025 | 89,6 | 87,9 |
| HMMT Feb 2026 | 75,8 | 75,4 |
| GPQA-Diamond | 83,2 | 82,1 |
| IFBench | 68,7 | 69,8 |
| MMLU-Pro | 83,1 | 83,2 |
| LiveCodeBench | 83,0 | 82,6 |
| Media | 80,6 | 80,2 |

La model card indica que las diferencias frente a la cuantización de referencia están dentro del ruido entre ejecuciones en todos los benchmarks. No se proporcionan resultados del modelo base en bf16 ni de otros modelos comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 17,6 GB; se recomienda al menos 20-24 GB de VRAM para cargar el modelo completo con contexto moderado, y más si se aumenta la ventana de contexto (los buffers KV no se detallan).
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 (24-32 GB) para uso en consumer; A100 40/80 GB, H100 o L40S para servidores.
- Cabe en GPU de consumo: sí, en GPUs con 24 GB o más (RTX 3090/4090). En GPUs de 16 GB requeriría descarga parcial a RAM (offloading) y reduciría el throughput.
- Opciones de despliegue: llama.cpp (recomendado, `llama-server -hf qda-lab/QDA-Qwen3.8-27B-Q4-GGUF`); también es compatible con Ollama y otros runners que acepten GGUF. vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput estimados: no disponible (no se publican mediciones de tokens por segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-Q4-GGUF | 27,3 B | no disponible | GGUF (mezcla Q4/Q5) | Apache-2.0 | Media 80,6 en 6 benchmarks |
| unsloth UD-Q4_K_XL (Qwen3.8-27B) | 27,3 B | no disponible | GGUF (Q4_K_XL) | Apache-2.0 | Media 80,2 en 6 benchmarks |
| Qwen/Qwen3.8-27B (bf16) | 27,3 B | no disponible | safetensors | Apache-2.0 | No disponible en la información proporcionada |

La única comparación documentada es frente a la cuantización de Unsloth, con diferencias dentro del ruido. No se dispone de datos de otros modelos de tamaño similar (por ejemplo, de la familia Llama o Mistral) en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al ser una cuantización, hereda los sesgos del Qwen3.8-27B original, que no se detallan.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se publican tasas de alucinación ni evaluaciones de veracidad.
- La cuantización introduce pérdida de precisión respecto al bf16, aunque las diferencias medidas están dentro del ruido en los benchmarks publicados.
- La etiqueta de cabecera `general.file_type` indica Q4_K_M aunque la mezcla real es distinta; herramientas que lean esa etiqueta sin inspeccionar los tensores pueden mostrar información incorrecta.
- Los datos de calibración (`qda-calibration-pools`) tienen licencia CC BY-NC-SA 4.0 en su conjunto (las filas `chat` provienen de ultrachat_200k, MIT); conviene revisar las implicaciones si se redistribuye el proceso de calibración.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no está verificado.
- No se detalla la longitud de contexto del modelo base ni del GGUF, lo que impide garantizar ventanas largas en producción.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-Q4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de calibración: https://huggingface.co/datasets/qda-lab/qda-calibration-pools
- Receta e inputs de reproducción: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs/tree/main/QDA-Qwen3.8-27B-Q4-GGUF
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
