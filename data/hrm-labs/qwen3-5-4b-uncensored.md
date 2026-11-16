# hrm-labs/Qwen3.5-4B-Uncensored

## Resumen

Qwen3.5-4B-Uncensored es una variante sin censura del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario hrm-labs (atribuida en la model card a HauhauCS). El modelo base es un transformer denso de 4B parámetros (4.205.751.296 exactos) con una arquitectura híbrida que combina Gated DeltaNet (atención lineal) y atención softmax completa en proporción 3:1, sobre 32 capas. Su rasgo diferencial es la eliminación de rechazos: la model card declara 0/465 refusals sin pérdida de capacidades respecto al original.

El modelo es nativamente multimodal (texto, imagen y vídeo) mediante un encoder de visión separado en formato `mmproj`, soporta 262K tokens de contexto nativo (extensible a 1M con YaRN) y emplea un vocabulario de 248K tokens para 201 idiomas. Incluye soporte de multi-token prediction (MTP), lo que puede acelerar la decodificación en runtimes compatibles.

Es relevante ahora porque el modelo base Qwen3.5 apareció el 2 de marzo de 2026 y esta variante se publicó el 16 de noviembre de 2026, con soporte de llama.cpp todavía reciente. La distribución es exclusivamente en GGUF (con cuantizaciones desde BF16 hasta Q4_K_M), lo que la orienta a despliegue local en consumer GPU y estaciones de trabajo, no a servidores de alto throughput sin conversión previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: Gated DeltaNet (atención lineal) + atención softmax completa, ratio 3:1, 32 capas |
| Parametros totales | 4.205.751.296 (4B densos) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262K nativo, extensible a 1M con YaRN |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M (GGUF); encoder de visión BF16 |
| Idiomas soportados | en, zh, multilingual (201 idiomas según vocabulario de 248K) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16, Q8_0, Q6_K, Q4_K_M) + mmproj BF16 para visión |
| Vocabulario | 248K tokens |
| Multimodalidad | Nativa: texto, imagen y vídeo (requiere mmproj) |
| Multi-token prediction | Soportado (MTP) |
| Tamano del repo | 19.8 GB |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, un transformer denso de 32 capas que sustituye parte de la atención softmax completa por capas de Gated DeltaNet (atención lineal con estado recurrente), en una proporción 3:1. Esta mezcla reduce el coste computacional y de memoria en contextos largos respecto a un transformer puramente softmax, manteniendo capacidad de recuperación precisa en las capas de atención completa. El modelo incluye además multi-token prediction (MTP), una cabeza auxiliar que predice varios tokens futuros y que puede emplearse para decodificación especulativa en runtimes que la soporten.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La model card de esta variante afirma explícitamente que no se han modificado datasets ni capacidades respecto al original: el proceso de "uncensoring" se presenta como una eliminación de rechazos sin ajuste adicional sobre el comportamiento funcional. No se detalla la metodología técnica empleada (ablación, fine-tuning selectivo, edición de pesos u otra). El encoder de visión se distribuye como archivo `mmproj` independiente, lo que permite usar el modelo solo como texto sin cargarlo.

## Capacidades

- Generación de texto conversacional multi-turno con contexto nativo de 262K tokens.
- Razonamiento en modo thinking (por defecto) y modo non-thinking, con parámetros de muestreo recomendados distintos para cada uno.
- Comprensión de imágenes y vídeo mediante el encoder `mmproj` (multimodalidad nativa).
- Capacidades multilingües amplias: vocabulario de 248K tokens y cobertura declarada de 201 idiomas, con foco en inglés y chino.
- Generación de código y matemáticas (capacidad heredada del modelo base Qwen3.5; sin benchmarks publicados en la información disponible).
- Eliminación de rechazos: la model card declara 0/465 refusals, con generación completa del contenido solicitado.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible; debe verificarse contra la documentación del modelo base Qwen3.5-4B.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.
- Multi-token prediction (MTP) para aceleración de decodificación en runtimes compatibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin capa de rechazos manteniendo las capacidades del original, útil para comparar respuestas con y sin censura en entornos controlados y con supervisión humana.
- Procesamiento de documentos largos con imágenes: con 262K tokens de contexto y visión nativa, se puede introducir un informe escaneado de cientos de páginas y pedir extracción de datos estructurados o resúmenes por sección en una sola pasada.
- Análisis de vídeo para extracción de información: el encoder `mmproj` permite pasar fotogramas o clips y obtener descripciones, transcripciones de contenido visual o detección de elementos concretos, útil en catalogación de archivo audiovisual.
- Generación de contenido creativo sin restricciones de tono: escritura de ficción, guiones o material narrativo que requiera temáticas sensibles, donde los modelos alineados estándar suelen rechazar o suavizar la petición.
- Despliegue local en estación de trabajo: con la cuantización Q4_K_M (2,6 GB) cabe en GPU consumer de 8 GB junto con el encoder de visión (645 MB), lo que permite prototipado offline sin depender de API.
- Asistente multilingüe en inglés y chino: con vocabulario de 248K tokens y cobertura declarada de 201 idiomas, adecuado para tareas de traducción y atención al cliente en esos mercados, siempre con revisión humana por el riesgo de contenido no filtrado.
- Evaluación comparativa de cuantizaciones: al publicarse en BF16, Q8_0, Q6_K y Q4_K_M, sirve para medir la degradación de calidad por cuantización sobre una misma arquitectura híbrida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la métrica interna de rechazos (0/465 refusals) y no incluye MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo texto): BF16 ~8-9 GB, Q8_0 ~4,5-5 GB, Q6_K ~3,5-4 GB, Q4_K_M ~2,8-3,5 GB (incluyendo overhead de contexto KV cache).
- Añadir ~0,7 GB si se carga el encoder de visión BF16 (`mmproj`).
- El contexto de 262K tokens incrementa notablemente la memoria de KV cache; con atención híbrida el coste es menor que en un transformer softmax puro, pero sigue siendo significativo a longitudes máximas.
- GPU consumer: Q4_K_M cabe en RTX 3060 8 GB, RTX 4060 8 GB, RTX 4070 y superiores; Q8_0 requiere 8 GB o más; BF16 recomienda 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090).
- GPU de datacenter: A100 40/80 GB, H100, L40S para BF16 con contexto largo o serving concurrente.
- Despliegue: llama.cpp, LM Studio, Jan, koboldcpp (soporte reciente, requiere build actualizada por la novedad de la arquitectura). Para producción de alto throughput, la model card recomienda vLLM, SGLang o KTransformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-Uncensored (hrm-labs / HauhauCS) | 4B densos | 262K (1M YaRN) | Sí (texto, imagen, vídeo) | Apache 2.0 | GGUF | Sin rechazos declarados (0/465) |
| Qwen3.5-4B (base, Qwen) | 4B densos | 262K (1M YaRN) | Sí | Apache 2.0 | safetensors y otros | Modelo original con alineación estándar |
| Qwen3.5-9B-Uncensored-HauhauCS-Aggressive | 9B densos | no disponible | no disponible | Apache 2.0 (según repo referenciado) | GGUF | Variante superior del mismo autor, mayor tamaño |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de rechazos: el modelo generará contenido dañino, ilegal o éticamente problemático si se le solicita. No es apto para despliegue directo a usuarios finales sin una capa de moderación externa.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad; al ser una variante de un modelo de 4B, la tasa de error factual es previsiblemente superior a la de modelos mayores.
- La model card advierte de que el modelo puede añadir disclaimers breves al final de algunas respuestas (por ejemplo, avisos de que no es asesoramiento legal); no son rechazos, pero conviene filtrarlos en producción.
- Metodología de "uncensoring" no documentada: no se especifica si se modificaron pesos, qué datos se usaron ni qué capacidades pueden haberse degradado de forma no medida.
- Contexto: la model card recomienda mantener al menos 128K tokens de ventana para preservar el modo thinking; ventanas menores pueden degradar el razonamiento.
- Soporte de llama.cpp reciente y arquitectura nueva (base publicada el 2026-03-02): posibles incompatibilidades con builds antiguas y con herramientas que aún no reconozcan Gated DeltaNet.
- Idiomas: cobertura declarada amplia, pero el foco real de entrenamiento es inglés y chino; el rendimiento en castellano no está verificado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad legal sobre el contenido generado sin filtros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de calidad independientes.
- Tool calling y comportamiento agéntico no confirmados en la información disponible; verificar contra el modelo base antes de integrarlo en pipelines automáticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrm-labs/Qwen3.5-4B-Uncensored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 9B del mismo autor: https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Repositorio del autor: https://huggingface.co/HauhauCS
- Discord del autor: https://discord.gg/SZ5vacTXYf
