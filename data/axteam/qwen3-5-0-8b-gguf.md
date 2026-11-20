# axteam/Qwen3.5-0.8B-GGUF

## Resumen

axteam/Qwen3.5-0.8B-GGUF es una compilación de cuantizaciones GGUF del modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. El modelo original pertenece a la familia Qwen3.5 del equipo Qwen y cuenta con 772.845.888 parámetros totales según los pesos en safetensors del modelo base. Esta compilación incluye únicamente el backbone de texto: el codificador de visión del modelo original no está incluido, por lo que no permite entrada de imágenes ni OCR.

El repositorio ofrece dos ficheros cuantizados: Q4_K_M (0,5 GB) y Q8_0 (0,8 GB), ambos generados mediante cuantización post-entrenamiento (PTQ) con las herramientas de llama.cpp, sin reentrenamiento. La cuantización es de tipo k-quant por bloques, con escalas por bloque y asignación mixta de bits. El chat template original está embebido en cada fichero.

La relevancia de esta ficha radica en que permite ejecutar un modelo de la familia Qwen3.5 en hardware muy modesto, incluyendo GPUs de consumo, con soporte de la arquitectura `qwen35` en llama.cpp a partir de la build b7990 y de la capa de predicción multi-token (MTP) a partir de la b9180. La licencia Apache-2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura `qwen35` en llama.cpp); incluye capa de predicción multi-token (MTP) |
| Parametros totales | 772.845.888 (según safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; los ejemplos de la model card usan `-c 8192` |
| Tipos de cuantizacion | Q4_K_M (4 bits, k-quant medium) y Q8_0 (8 bits) |
| Idiomas soportados | no disponible de forma oficial; la model card incluye pruebas en inglés y coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer de 772.845.888 parámetros. La arquitectura identificada en llama.cpp es `qwen35`, soportada desde la build b7990, e incluye una capa de predicción multi-token (MTP) cuyo soporte se añadió en la build b9180 (PR #22673). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

Esta compilación GGUF se generó mediante cuantización post-entrenamiento (PTQ) con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp. Los pesos BF16 se cuantizan por bloques con k-quants (escalas por bloque y asignación mixta de bits), sin reentrenamiento. El chat template original queda embebido en cada fichero. La innovación técnica destacable del modelo base, según la información disponible, es la capa MTP, que permite decodificación multi-token especulativa.

## Capacidades

- Generación de texto conversacional: la model card verifica respuestas correctas a preguntas cortas (capital de Francia y de Corea) con ambos ficheros.
- Soporte multilingüe parcial: se han medido perplejidades en inglés (WikiText-2) y coreano (muestra de Wikipedia en coreano), con buen rendimiento en ambos.
- Chat template embebido: permite usar el modelo en modo conversacional directamente con `--jinja` en llama.cpp.
- Compatibilidad con API OpenAI: `llama-server` expone un endpoint `/v1/chat/completions`.
- Integración con Ollama y LM Studio: la model card documenta ambos flujos de uso, aunque el autor indica que no los ha probado.
- Capacidad de visión: no disponible en esta compilación (el codificador de visión no está incluido y no hay fichero `mmproj`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en hardware de consumo: con 0,5 GB en Q4_K_M, el modelo cabe en GPUs integradas o de gama baja y permite desplegar un chatbot privado sin conexión, usando `llama-server` con contexto de 8.192 tokens.
- Prototipado rápido de aplicaciones LLM: el endpoint compatible con OpenAI permite sustituir un modelo remoto por este GGUF local durante el desarrollo, sin cambiar el código cliente.
- Generación de texto en inglés y coreano: las perplejidades medidas (16,00 en WikiText-2 y 11,69 en coreano con Q8_0) indican un rendimiento razonable para tareas de generación y resumen en ambos idiomas.
- Despliegue en entornos con recursos limitados o air-gapped: el tamaño reducido del repositorio (1,4 GB) y la ausencia de dependencias de red tras la descarga facilitan su uso en sistemas aislados.
- Evaluación comparativa de cuantizaciones: el repositorio incluye mediciones de perplejidad de Q4_K_M frente a Q8_0, útil para decidir el equilibrio calidad/tamaño en un pipeline concreto.
- Educación y experimentación con llama.cpp: sirve como ejemplo práctico de conversión a GGUF, uso de k-quants, reducción de KV cache con `--cache-type-k/v q8_0` y activación de MTP.
- Filtrado o clasificación de texto ligera: con contexto de 8.192 tokens y bajo coste de memoria, puede emplearse en tareas de etiquetado o moderación de textos cortos en local.

## Benchmarks y rendimiento

La model card solo publica mediciones de perplejidad (PPL) con llama.cpp b12005 (commit e0f142d, build CUDA) sobre una NVIDIA B200, con todas las capas en GPU, 16 ventanas de 2.048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano:

| Fichero | PPL WikiText-2 | PPL Wikipedia coreano | Diferencia vs Q8_0 (EN / KO) |
|---|---|---|---|
| Qwen3.5-0.8B-Q8_0.gguf | 16,00 | 11,69 | referencia |
| Qwen3.5-0.8B-Q4_K_M.gguf | 16,35 | 12,87 | +2,2% / +10,1% |

El autor advierte que 16 ventanas por texto es una muestra pequeña y que diferencias de pocos puntos porcentuales entre ficheros están dentro del ruido de muestreo (al repetir con 64 ventanas, las diferencias se movieron hasta ~19 puntos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M y 0,8 GB con Q8_0, más la KV cache correspondiente al contexto configurado con `-c`. La KV cache puede reducirse a la mitad con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on`.
- GPU recomendadas: el autor verificó el funcionamiento en una NVIDIA B200 con todas las capas en GPU. Por tamaño, cualquier GPU con al menos 1-2 GB de VRAM libre debería poder cargar los ficheros, aunque no se han publicado pruebas en otras GPU.
- GPU de consumo: sí cabe en GPUs de consumo; con 0,5-0,8 GB de pesos, el modelo es apto para tarjetas de gama baja e integradas, siempre que el contexto configurado no agote la memoria.
- Opciones de despliegue: llama.cpp (build ≥ b9180, con `-fa on` disponible desde b6325), Ollama (`ollama run hf.co/axteam/Qwen3.5-0.8B-GGUF:Q4_K_M`) y LM Studio (buscando `axteam/Qwen3.5-0.8B-GGUF`). El autor no ha probado Ollama ni LM Studio.
- Latencia y throughput: no disponibles en la información proporcionada; solo se documenta que el modelo respondió correctamente a dos preguntas cortas en la B200.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparación se limita a las dos cuantizaciones del propio repositorio:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-GGUF Q4_K_M | 772.845.888 | no disponible (ejemplos con 8.192) | GGUF 4 bits | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B-GGUF Q8_0 | 772.845.888 | no disponible (ejemplos con 8.192) | GGUF 8 bits | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 772.845.888 | no disponible | safetensors (BF16) | Apache-2.0 | Hugging Face |

Comparativa con modelos de otros autores: no disponible.

## Limitaciones y advertencias

- Sin capacidad de visión: el codificador de visión no está incluido y no hay fichero `mmproj`; no se puede usar para OCR ni para entrada de imágenes con esta compilación.
- Calidad degradada en Q4_K_M: la perplejidad en coreano empeora un 10,1% frente a Q8_0, por lo que para tareas sensibles a la calidad se recomienda Q8_0.
- Muestra de evaluación pequeña: las mediciones de perplejidad usan solo 16 ventanas de 2.048 tokens y el propio autor señala que las diferencias de pocos puntos porcentuales están dentro del ruido.
- Idiomas no declarados oficialmente: la model card no enumera los idiomas soportados; solo hay evidencia empírica en inglés y coreano.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es un riesgo inherente a modelos de este tamaño; conviene validar las salidas en producción.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada.
- Requisito de versión de llama.cpp: es necesario usar una build ≥ b9180 para cargar la capa MTP; versiones anteriores a b7990 no soportan la arquitectura `qwen35`.
- Ollama y LM Studio no verificados: el autor indica que no ha probado estos flujos, por lo que su funcionamiento no está garantizado.
- Licencia: Apache-2.0 permite uso comercial, pero los pesos y el tokenizador originales pertenecen al equipo Qwen y se rigen por la licencia del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/axteam/Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- PR de soporte MTP en llama.cpp: PR #22673 (referenciado en la model card; sin URL directa en la información proporcionada)
