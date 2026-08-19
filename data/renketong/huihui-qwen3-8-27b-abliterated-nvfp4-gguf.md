# renketong/Huihui-Qwen3.8-27B-abliterated-NVFP4-GGUF

## Resumen

Este repositorio contiene la conversión a GGUF del modelo **Huihui-Qwen3.8-27B-abliterated**, una versión sin censura (uncensored) del modelo Qwen3.8-27B de Alibaba, cuantizada en formato **NVFP4** (FP4 de NVIDIA) para hardware Blackwell. El proceso de conversión es una reempaquetado sin pérdidas desde los safetensors NVFP4 publicados por sakamakismile, sin pasar por una doble cuantización, lo que conserva la precisión original del archivo NVFP4.

El modelo resultante es un archivo GGUF de 19,65 GB con arquitectura `qwen35` (Qwen3_5ForConditionalGeneration), 64 capas más una capa MTP (multi-token prediction) que permite decodificación especulativa directamente en llama.cpp y LM Studio. Además incluye un proyector de visión (mmproj) de 931 MB para entrada de imágenes, heredando la capacidad multimodal del modelo base. Su licencia Apache-2.0 y su tamaño contenido lo hacen atractivo para despliegues locales en GPU de gama alta, especialmente en hardware Blackwell donde la cuantización NVFP4 aprovecha los núcleos tensor FP4 nativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (Qwen3_5ForConditionalGeneration), transformer con visión, 64 capas + 1 capa MTP (`nextn_predict_layers=1`) |
| Parametros totales | 27.320.698.848 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (262K) nativo |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA) para MLP y atención, Q5_K para embeddings, BF16 para MTP head; ~5,6 bits por peso |
| Idiomas soportados | No especificado oficialmente; el modelo base Qwen3.8 soporta principalmente chino e inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (contenedor), con pesos NVFP4 internos (convertidos desde compressed-tensors) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia Qwen3.8: un transformer denso con 64 capas, atención completa y un módulo de visión integrado (proyector multimodal). La innovación principal es la capa **MTP** (multi-token prediction) que permite decodificación especulativa: el modelo predice varios tokens a la vez, y el draft se acepta o rechaza según la probabilidad, duplicando aproximadamente el throughput en tareas de código y JSON.

El linaje de entrenamiento es: (1) `Qwen/Qwen3.8-27B` como base, (2) fine-tune **abliterated** por huihui-ai que elimina los mecanismos de rechazo (refusal) del modelo, (3) cuantización NVFP4 por sakamakismile usando compressed-tensors, y (4) conversión lossless a GGUF por renketong. No se dispone de detalles sobre el dataset de entrenamiento del modelo base ni sobre técnicas como RLHF o DPO; la información proporcionada solo indica que es una fine-tune de abliteración sobre el modelo original.

## Capacidades

- Generación de texto y chat multi-turno en chino e inglés (idiomas principales del modelo base).
- Razonamiento matemático y lógico, con buena aceptación de drafts MTP en tareas de razonamiento (71% de aceptación en pruebas).
- Generación de código y JSON estructurado, con tasas de aceptación MTP del 80–96% y velocidades de 117–129 tokens por segundo en RTX 5090.
- Entrada de imágenes mediante el proyector de visión (`mmproj`), siguiendo la ruta Qwen3-VL.
- Decodificación especulativa MTP integrada en el archivo GGUF, sin necesidad de modelos draft externos.
- Sin refusals (abliterated): no aplica rechazos por contenido, lo que permite generar respuestas sobre temas que el modelo base bloquearía.
- Soporte de tool calling y capacidades de agente heredadas del modelo base Qwen3.8, aunque no se documenta explícitamente en la model card.

## Casos de uso

- **Generación de código en producción**: gracias a la alta tasa de aceptación MTP en código y JSON (80–96%), el modelo puede integrarse en pipelines de CI/CD para autocompletado o generación de tests, alcanzando ~120 t/s en RTX 5090, lo que reduce la latencia percibida en entornos interactivos.
- **Análisis de documentos con imágenes**: el proyector de visión permite procesar capturas de pantalla, diagramas o formularios escaneados, combinando comprensión visual con razonamiento textual en un solo modelo.
- **Chatbots sin censura para investigación**: la abliteración elimina los rechazos de seguridad, útil en entornos de investigación donde se necesita explorar temas sensibles sin restricciones (siempre con supervisión humana).
- **Razonamiento matemático y científico**: con 71% de aceptación MTP en matemáticas y 114 t/s, es adecuado para asistentes de cálculo simbólico, resolución de problemas paso a paso o tutoría automatizada.
- **Despliegue en edge con hardware Blackwell**: el formato NVFP4 aprovecha los núcleos FP4 de GPUs como RTX 5090 o B200, permitiendo inferencia de baja latencia en equipos de escritorio de alta gama sin necesidad de servidores dedicados.
- **Generación de contenido estructurado (JSON, YAML)**: la alta velocidad en formatos estructurados lo hace idóneo para extracción de datos, normalización de textos o generación de configuraciones en aplicaciones backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara una lista de resultados vacía, y no se proporcionan métricas como MMLU, HumanEval o GSM8K. Las únicas mediciones disponibles son de velocidad de inferencia (tokens por segundo) en RTX 5090, que se detallan en la sección de requisitos de hardware.

## Requisitos de hardware

- **VRAM estimada**: el archivo principal pesa 19,65 GB; con overhead de KV cache y contexto, se recomienda al menos 24 GB para contexto moderado (32K–64K) y 32 GB para contexto largo (160K–262K).
- **GPU recomendadas**: RTX 5090 (32 GB) es la plataforma de referencia en las pruebas; RTX 4090 (24 GB) puede ejecutar el modelo con contexto reducido. Para máximo rendimiento NVFP4 se requiere hardware Blackwell (serie RTX 50, B200, etc.).
- **Compatibilidad con GPU consumer**: sí, cabe en RTX 4090 y superiores, pero el rendimiento óptimo se obtiene en Blackwell; en GPUs anteriores (Ampere, Ada) la cuantización NVFP4 podría no ser acelerada por hardware y degradar la velocidad.
- **Opciones de despliegue**: llama.cpp (con `--spec-type draft-mtp`), LM Studio (con ajuste de draft probability a 0), y potencialmente Ollama si se añade soporte NVFP4. También puede usarse vLLM o TGI si aceptan GGUF, aunque no se documenta.
- **Latencia y throughput**: en RTX 5090 con LM Studio, se midieron 117–129 t/s en código/JSON, 114 t/s en razonamiento matemático y 88–91 t/s en prosa (chino/inglés). La velocidad depende críticamente de la tasa de aceptación MTP, que varía con el tipo de contenido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Tamaño | Velocidad (RTX 5090) | Licencia |
|---|---|---|---|---|---|---|
| **Huihui-Qwen3.8-27B-abliterated-NVFP4-GGUF** (este) | 27,3 B | 262K | NVFP4 + Q5_K emb + BF16 MTP | 19,65 GB | 88–129 t/s (según contenido) | Apache-2.0 |
| utautako/Qwen3.8-27B-NVFP4-MTP-Q8attn-GGUF | 27,3 B | 262K | NVFP4 + Q8 atención | ~20 GB (estimado) | ~8% más rápido que este (según model card) | Apache-2.0 |
| Qwen/Qwen3.8-27B (BF16 original) | 27,3 B | 262K | BF16 | ~54 GB | No medido | Apache-2.0 |

La versión con atención Q8 (utautako) ofrece mayor velocidad a costa de un tamaño ligeramente mayor y sin la abliteración completa. El modelo BF16 original requiere el doble de VRAM y no incluye la capa MTP en formato GGUF.

## Limitaciones y advertencias

- **Contenido sin filtrar**: al ser abliterated, el modelo no aplica rechazos de seguridad; puede generar contenido ofensivo, ilegal o peligroso. No es apto para uso público sin moderación humana.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede inventar hechos, citas o referencias, especialmente en tareas de razonamiento complejo.
- **Pérdida de precisión por cuantización**: aunque la conversión de NVFP4 a GGUF es lossless respecto al archivo NVFP4, la cuantización NVFP4 en sí introduce degradación frente al BF16 original, especialmente en tareas de precisión numérica.
- **Dependencia de hardware Blackwell**: el rendimiento máximo (núcleos FP4) solo se alcanza en GPUs Blackwell; en hardware anterior la velocidad puede caer significativamente.
- **Variabilidad de la velocidad MTP**: la tasa de aceptación del draft cae al 37–48% en prosa, reduciendo el throughput a ~88–91 t/s; en textos narrativos o conversacionales la ganancia es menor.
- **Contexto largo no garantizado**: aunque el modelo soporta 262K tokens, en la práctica se recomienda usar 160K o menos para evitar degradación de calidad y limitar el uso de VRAM.
- **Idiomas limitados**: no se documenta soporte multilingüe más allá de chino e inglés; otros idiomas pueden tener rendimiento inferior.

## Enlaces

- [Repositorio HuggingFace: renketong/Huihui-Qwen3.8-27B-abliterated-NVFP4-GGUF](https://huggingface.co/renketong/Huihui-Qwen3.8-27B-abliterated-NVFP4-GGUF)
- [Modelo base abliterated: huihui-ai/Huihui-Qwen3.8-27B-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Fuente NVFP4 safetensors: sakamakismile/Huihui-Qwen3.8-27B-abliterated-NVFP4](https://huggingface.co/sakamakismile/Huihui-Qwen3.8-27B-abliterated-NVFP4)
- [Repositorio oficial de Qwen3.8 (GitHub)](https://github.com/QwenLM/Qwen3.8)
- [Guía de ejecución local de Qwen3.8 (Yottalabs)](https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026)
- [Documentación de Qwen3.8 en Unsloth](https://unsloth.ai/docs/models/qwen3.8)
