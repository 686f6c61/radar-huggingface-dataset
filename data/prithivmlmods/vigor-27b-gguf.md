# prithivMLmods/VIGOR-27B-GGUF

## Resumen

VIGOR-27B (Vision Intelligence and Guardrail Oriented Reasoning) es un modelo multimodal denso de 27.320.697.856 parámetros, desarrollado por prithivMLmods, especializado en clasificación de seguridad de contenido visual. Está construido sobre Qwen/Qwen3.8-27B y se distribuye en formato GGUF para inferencia local con llama.cpp. Su función principal es el análisis estructurado de imágenes para determinar si su contenido es seguro o NSFW, con un umbral conservador orientado a control parental y protección de menores.

El modelo realiza un análisis detallado de vestimenta, códigos de indumentaria, exposición corporal, poses, encuadre y contexto de la escena, y devuelve la clasificación en JSON estricto con campos como `scene_description`, `is_nsfw`, `classification_reason`, `nsfw` y `safe`. Incorpora decodificación especulativa mediante Multi-Token Prediction (MTP) integrada en los pesos del propio GGUF, lo que evita la necesidad de un modelo borrador separado.

Es relevante ahora porque ofrece una alternativa open source (Apache 2.0) y desplegable localmente para pipelines de moderación visual, en un momento en el que los filtros de contenido multimodales suelen depender de APIs propietarias. La model card lo etiqueta explícitamente como experimental y lo restringe a investigación y clasificación de seguridad de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (familia Qwen3.8-27B), transformer multimodal con proyección visual (mmproj) y cabezas MTP para decodificación especulativa |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens en la prueba documentada (no se especifica el máximo arquitectónico) |
| Tipos de cuantizacion | BF16, Q3_K_L, Q4_K_M, Q5_K_M, Q6_K, mmproj-bf16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (transformers, llama-cpp) |

## Arquitectura y entrenamiento

VIGOR-27B es un modelo transformer denso multimodal basado en Qwen/Qwen3.8-27B, con un proyector visual (mmproj) en BF16 de 931 MB que conecta la torre de visión con el modelo de lenguaje. La variante GGUF incluye cabezas de Multi-Token Prediction (MTP) que permiten decodificación especulativa sin modelo borrador externo: la arquitectura predice varios tokens futuros en un solo forward pass. En la prueba documentada se usó `draft_n_max=2`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente indica que el modelo se orienta a clasificación Safe/NSFW conservadora y que se distribuye como experimental, recomendando el uso del modelo base en Transformers frente al GGUF.

## Capacidades

- Generación de texto y análisis visual de imágenes (pipeline `image-text-to-text`).
- Clasificación de seguridad de contenido: Safe / NSFW con umbral conservador ("ante la duda, NSFW").
- Análisis detallado de vestimenta, exposición corporal, poses, encuadre y contexto de escena.
- Salida estructurada en JSON estricto con claves predefinidas (`scene_description`, `is_nsfw`, `classification_reason`, `nsfw`, `safe`).
- Detección de contenido NSFW en imágenes fotorrealistas, anime, ecchi, hentai e ilustraciones 2D/3D.
- Decodificación especulativa MTP integrada en los pesos.
- Modo thinking configurable mediante plantilla (thinking off por defecto, thinking on para razonamiento).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés.

## Casos de uso

- Moderación de contenido en plataformas UGC: el modelo analiza cada imagen subida y devuelve un JSON con `is_nsfw` y `classification_reason`, apto para integrarse en un pipeline de aprobación automática o de escalado a revisión humana.
- Control parental en dispositivos domésticos: desplegado en local con llama.cpp, filtra imágenes antes de mostrarlas a menores sin enviar datos a servicios en la nube, gracias a su licencia Apache 2.0 y a la disponibilidad de cuantizaciones desde 14,6 GB.
- Filtrado previo en datasets de entrenamiento: clasificación masiva de corpus de imágenes para eliminar contenido no apto antes de usarlos en el entrenamiento de otros modelos.
- Moderación de comunidades de arte y fan art: el modelo cubre explícitamente anime, ecchi, hentai e ilustraciones 2D/3D, lo que lo hace adecuado para foros y galerías de arte digital.
- Auditoría de catálogos de e-commerce: detección de imágenes de producto con exposición inadecuada o ropa interior/lencería que incumpla las políticas del marketplace.
- Guardrail en generación de imágenes: integración como clasificador posterior a un modelo text-to-image para bloquear o marcar salidas antes de su publicación.
- Cumplimiento normativo en redes sociales: generación de registros estructurados (JSON) con justificación de cada decisión de moderación, útiles para auditoría y trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente documenta métricas de inferencia en una prueba con `VIGOR-27B.BF16.gguf` y `VIGOR-27B.mmproj-bf16.gguf` sobre NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM), con `llama-cli`, `-ngl 99`, contexto de 16.384 tokens, KV cache `q8_0`, semilla 42 y MTP con `draft_n_max=2`:

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.009,28 tokens/s |
| Velocidad media de generación | 48,97 tokens/s |
| Tiempo total de ejecución | 52,4 segundos |
| VRAM pico | 52,17 GiB |
| Utilización de GPU pico | 98% |
| Capas offloaded | 99 |

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): BF16 ≈ 54,7 GB de pesos más KV cache y proyector visual; Q6_K ≈ 22,4 GB; Q5_K_M ≈ 19,5 GB; Q4_K_M ≈ 16,8 GB; Q3_K_L ≈ 14,6 GB. Añadir el mmproj-bf16 (931 MB) y la KV cache del contexto configurado.
- En la prueba documentada con BF16 y contexto de 16.384 tokens se observó un pico de 52,17 GiB en una GPU de 96 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (validada), A100 80 GB, H100 80 GB para BF16; GPUs de 24 GB como RTX 4090 pueden alojar cuantizaciones Q4_K_M o Q5_K_M con contexto reducido.
- Cabe en GPU de consumo: sí, con cuantizaciones Q3_K_L, Q4_K_M o Q5_K_M en GPUs de 16-24 GB, asumiendo recortes de contexto y posible offloading parcial a CPU.
- Opciones de despliegue: llama.cpp / `llama-cli` (validado), Ollama y otros frontends compatibles con GGUF; el modelo base está pensado para Transformers y text-generation-inference.
- Latencia y throughput: 48,97 tokens/s de generación y 1.009,28 tokens/s de procesamiento de prompt en la configuración BF16 probada; no hay datos para cuantizaciones menores.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VIGOR-27B-GGUF | 27,3 B (denso) | 16.384 (probado) | Imagen + texto | Apache 2.0 | GGUF en Hugging Face |
| Qwen/Qwen3.8-27B (base) | 27 B aprox. | no disponible | Imagen + texto | no disponible | Hugging Face |
| Alternativas de moderación visual de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre benchmarks comparativos con otros clasificadores de seguridad visual, por lo que no es posible establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- Modelo etiquetado como experimental por el autor; se recomienda usar la versión en Transformers frente al GGUF.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- Umbral deliberadamente conservador ("ante la duda, NSFW"), lo que puede generar falsos positivos en imágenes legítimas con ropa ajustada, trajes de baño o arte.
- Riesgo de alucinación en las descripciones de escena (`scene_description`) y en las justificaciones de clasificación.
- Sesgos conocidos: no documentados en la información disponible; al estar entrenado sobre Qwen3.8-27B hereda los sesgos del modelo base, no cuantificados aquí.
- La licencia Apache 2.0 permite uso comercial, pero la model card restringe la finalidad a investigación y clasificación de seguridad de contenido y declina toda responsabilidad sobre las salidas.
- El rendimiento medido corresponde a una única configuración de hardware de gama alta (96 GB VRAM); no hay datos de latencia para GPUs de consumo.
- El contexto máximo arquitectónico no está documentado; la prueba se realizó con 16.384 tokens.
- No se documenta soporte de tool calling ni de agentes multi-step.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/VIGOR-27B-GGUF
- Modelo base: https://huggingface.co/prithivMLmods/VIGOR-27B
- Modelo Qwen de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos BF16: https://huggingface.co/prithivMLmods/VIGOR-27B-GGUF/blob/main/VIGOR-27B.BF16.gguf
- Cuantización Q4_K_M: https://huggingface.co/prithivMLmods/VIGOR-27B-GGUF/blob/main/VIGOR-27B.Q4_K_M.gguf
- Proyector visual: https://huggingface.co/prithivMLmods/VIGOR-27B-GGUF/blob/main/VIGOR-27B.mmproj-bf16.gguf
