# johnlockejrr/Qwen3.8-27B-QSA-GGUF

## Resumen

Qwen3.8-27B-QSA-GGUF es una distribución en formato GGUF de los pesos del modelo Qwen3.8-27B, un transformer denso de aproximadamente 27.400 millones de parámetros desarrollado originalmente por el equipo Qwen (Alibaba). Este repositorio concreto, publicado por el usuario johnlockejrr, es un espejo de la cuantización UD-Q6_K generada por Unsloth junto con el proyector de visión (mmproj) en F16, orientado a su uso en el port "Loom" del autor y en llama.cpp.

El modelo incorpora la técnica QSA (Qwen Sparse Attention) y soporte de decodificación especulativa mediante MTP (Multi-Token Prediction) embebido dentro del propio fichero GGUF, lo que lo hace relevante para despliegues de inferencia local con aceleración de decodificación. La cuantización UD-Q6_K (Unsloth Dynamic) preserva las capas críticas en mayor precisión, ofreciendo un compromiso entre calidad y tamaño (el repositorio ocupa 23,1 GB).

El interés práctico de esta ficha radica en que permite ejecutar un modelo de 27B con capacidades multimodales (texto + visión) en hardware de consumo de gama alta, siempre que se utilice una build de llama.cpp compatible con los indexadores QSA de Qwen3.5. La licencia Apache 2.0 facilita su uso comercial, aunque la información publicada por el autor es muy escasa y no incluye benchmarks ni detalles de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con Qwen Sparse Attention (QSA) y MTP (Multi-Token Prediction) |
| Parámetros totales | 27.373.132.800 (≈27,4B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | UD-Q6_K (Unsloth Dynamic); proyector visión en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto y mmproj) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de Qwen3.8 con 27.373 millones de parámetros, según los metadatos de safetensors del modelo base. La variante QSA introduce indexadores de atención dispersa (sparse attention) propios de la familia Qwen3.5, que reducen el coste computacional de la atención sobre contextos largos. El fichero GGUF de texto incorpora además MTP (Multi-Token Prediction) en formato interno, lo que habilita decodificación especulativa nativa dentro de llama.cpp y aumenta el throughput de generación.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están documentados en la información disponible. El modelo base es Qwen/Qwen3.8-27B; la cuantización UD-Q6_K procede de Unsloth y los indexadores QSA de higa2515. Este repositorio es un espejo de esos pesos para el port Loom, no un modelo entrenado de forma independiente.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes mediante el proyector de visión mmproj (F16), lo que confiere capacidades multimodal imagen-texto.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-27B.
- Decodificación especulativa mediante MTP embebido en el GGUF, que acelera la generación.
- Atención dispersa (QSA) para manejar contextos largos con menor coste.
- Soporte multilingüe: no documentado explícitamente en este repositorio; se hereda del modelo base, pero no hay lista de idiomas publicada.
- Tool calling / function calling: no documentado en la información disponible.
- Modo "thinking" o razonamiento extendido: no documentado en la información disponible.

## Casos de uso

- Asistente conversacional local: el modelo de 27B cuantizado a Q6_K puede desplegarse en estaciones de trabajo con GPU de 24 GB o más, gestionando diálogos multi-turno con calidad cercana al modelo original.
- Análisis de documentos con imágenes: gracias al proyector mmproj, puede procesar capturas, diagramas o páginas escaneadas junto a texto, útil para extracción de información en pipelines de digitalización.
- Generación de código asistida en entornos sin conectividad: al ejecutarse en llama.cpp local, permite autocompletado y refactorización sin enviar código a servicios externos, relevante por privacidad.
- Prototipado de agentes con decodificación rápida: el MTP embebido reduce la latencia por token, lo que favorece bucles de razonamiento multi-paso en aplicaciones agénticas locales.
- Evaluación comparativa de cuantizaciones: al ser un espejo de UD-Q6_K, sirve para medir la degradación de calidad frente al modelo en bf16 en tareas de razonamiento y visión.
- Investigación sobre atención dispersa: permite experimentar con los indexadores QSA de Qwen3.5 en llama.cpp para estudiar su efecto en contextos largos y throughput.
- Despliegue en servidores con endpoints compatibles: la etiqueta `endpoints_compatible` sugiere integración con APIs estilo OpenAI, útil para sustituir backends en servicios existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF UD-Q6_K ocupa aproximadamente 23,1 GB en total (incluyendo el proyector F16), por lo que se necesita al menos ~24 GB de VRAM para cargar pesos y margen para el contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB), RTX 5090 (32 GB), A100 40/80 GB, H100 80 GB. En GPUs de 24 GB conviene limitar la longitud de contexto para evitar desbordamiento de KV cache a RAM.
- Cabe en GPU de consumo: sí, en RTX 4090/5090 con contexto moderado; en GPUs de 16 GB requeriría offloading parcial a RAM o una cuantización más agresiva (no incluida en este repo).
- Opciones de despliegue: llama.cpp con build compatible con QSA de Qwen3.5 (p. ej. Unsloth llama.cpp). No se documenta soporte para vLLM, TGI u Ollama en este repositorio.
- Latencia y throughput: no disponibles; el MTP embebido está pensado para mejorar la velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-QSA-GGUF (este) | 27,4B | No disponible | Apache 2.0 | GGUF (Q6_K + mmproj) | QSA + MTP, visión |
| Qwen/Qwen3.8-27B (base) | 27,4B | No disponible | Apache 2.0 | Safetensors | Pesos originales en bf16 |
| higa2515/Qwen3.8-27B-QSA-GGUF | 27,4B | No disponible | Apache 2.0 | GGUF | Upstream de cuantización QSA |
| johnlockejrr/Qwen3.8-27B-QSA-loom | 27,4B | No disponible | Apache 2.0 | No disponible | Port Loom que consume estos pesos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Información muy escasa: no hay benchmarks, lista de idiomas, longitud de contexto ni detalles de entrenamiento publicados; cualquier evaluación de calidad requiere pruebas propias.
- Riesgo de alucinación: inherente a modelos generativos de este tamaño; no hay documentación específica sobre mitigaciones.
- Dependencia de build: requiere una versión de llama.cpp que soporte los indexadores QSA de Qwen3.5; builds estándar pueden fallar al cargar el modelo.
- Cuantización Q6_K: introduce una degradación de precisión respecto al bf16 original, especialmente sensible en tareas de visión y matemáticas.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribución; conviene revisar la licencia del modelo base Qwen3.8-27B por si impone condiciones adicionales.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria de que los pesos funcionen correctamente; verificar integridad antes de usarlo en producción.
- Sin datos sobre sesgos: no hay evaluación publicada de sesgos sociales o culturales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/Qwen3.8-27B-QSA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Port Loom: https://huggingface.co/johnlockejrr/Qwen3.8-27B-QSA-loom
- Cuantización upstream QSA: https://huggingface.co/higa2515/Qwen3.8-27B-QSA-GGUF
