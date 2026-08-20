# Honkware/Qwen3.8-27B-exl3-3.8bpw

## Resumen

Este repositorio contiene una cuantización **EXL3** a **3.8 bits por peso** del modelo **Qwen3.8-27B**, desarrollada por Honkware mediante la herramienta BlockQuant. El modelo base, creado por el equipo Qwen de Alibaba, es un LLM denso de 27 mil millones de parámetros con arquitectura híbrida de atención (16 capas con atención completa y 48 con atención lineal recurrente) y capacidades multimodales nativas (imagen y vídeo). La cuantización reduce el tamaño del modelo a 16.6 GB, lo que permite ejecutarlo en GPUs de consumo con 24 GB de VRAM o menos, manteniendo un rendimiento competitivo en tareas de código, agentes y automatización de oficina. Su licencia Apache 2.0 facilita el uso comercial y la integración en proyectos propietarios.

La relevancia de esta cuantización radica en que acerca un modelo de 27B con ventana de contexto de 262K tokens a hardware local asequible, sin necesidad de servidores dedicados. El formato EXL3, junto con el codebook `mul1`, exige ExLlamaV3 v0.0.3 o superior, y es compatible con cargadores como TabbyAPI y text-generation-webui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 27B, transformer híbrido (16 capas full attention + 48 capas linear attention) |
| Parametros totales | 27B (modelo base); el archivo safetensors reporta 8.284.763.376 elementos, posiblemente por la cuantización |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (según documentación del modelo base) |
| Tipos de cuantizacion | EXL3 a 3.8 bpw (este repo) y 4.5 bpw (repo hermano) |
| Idiomas soportados | No disponible en la información proporcionada; el modelo base de Qwen es multilingüe (principalmente inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato EXL3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atención híbrida: de sus 64 capas, solo 16 utilizan atención completa (con un intervalo de atención completa de 4), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Este diseño reduce el coste computacional y de memoria en contextos largos, manteniendo la capacidad de modelar dependencias de largo alcance. El modelo es multimodal nativo, capaz de procesar entradas de imagen y vídeo además de texto.

Los detalles del entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La cuantización EXL3 se realizó con BlockQuant, utilizando 250 filas de calibración y 8 bits para la cabeza (head bits), con codebook `mul1` y out-scales siempre activos. No se han publicado métricas de degradación específicas para esta cuantización.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte para tareas de código y matemáticas.
- Procesamiento multimodal nativo: entrada de imágenes y vídeo, además de texto.
- Ventana de contexto de 262K tokens, adecuada para documentos extensos y conversaciones de muchos turnos.
- Soporte de agentes y flujos de trabajo multi-paso, con buen rendimiento en benchmarks de terminal y sistemas operativos (Terminal Bench 73.0, OSWorld 84.3 según el modelo base).
- Capacidad de tool calling / function calling (implícita en su diseño para agentes, aunque no se detalla en la documentación).
- Multilingüe (según el modelo base, aunque no se especifican idiomas concretos).

## Casos de uso

- **Automatización de oficina**: el modelo puede generar documentos, resumir correos, redactar informes y gestionar tareas administrativas gracias a su capacidad de razonamiento y contexto largo.
- **Asistente de código en producción**: con soporte para agentes y tool calling, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o autocompletado avanzado.
- **Análisis de documentos extensos**: su ventana de 262K tokens permite procesar libros completos, contratos legales o expedientes médicos en una sola pasada, extrayendo información relevante.
- **Chatbots de atención al cliente**: la cuantización a 3.8 bpw permite desplegarlo en GPUs de consumo, ofreciendo respuestas contextuales con memoria de conversaciones largas.
- **Procesamiento de vídeo e imágenes**: al ser multimodal, puede describir contenido visual, generar subtítulos o responder preguntas sobre capturas de pantalla, útil en soporte técnico o moderación.
- **Investigación académica**: su licencia Apache 2.0 y su tamaño reducido lo hacen adecuado para experimentos de NLP, fine-tuning o evaluación en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización. Los datos disponibles provienen del modelo base Qwen3.8-27B, según la guía de lovableapp.org:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores corresponden al modelo sin cuantizar; la versión EXL3 a 3.8 bpw puede presentar una ligera degradación, pero no se dispone de mediciones oficiales.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 16.6 GB, por lo que se recomienda al menos 20 GB de VRAM para inferencia con contexto moderado. Con cuantización 3.8 bpw, cabe en GPUs de 24 GB como la RTX 4090, RTX 3090 o A5000.
- **GPUs recomendadas**: RTX 4090 (24 GB), RTX 3090 (24 GB), A5000 (24 GB), o GPUs de datacenter como A10G (24 GB) o L4 (24 GB). Para contextos de 262K tokens completos, se necesitaría más VRAM o técnicas de offloading.
- **Compatibilidad con consumer GPUs**: sí, cualquier GPU con 24 GB de VRAM puede ejecutarlo; incluso con 16 GB (RTX 4080, 3080 Ti) podría funcionar con contextos reducidos o usando offloading.
- **Opciones de despliegue**: ExLlamaV3 (API Python), TabbyAPI (servidor compatible con OpenAI), text-generation-webui (interfaz local). No es compatible con vLLM, llama.cpp u Ollama en este formato EXL3.
- **Latencia y throughput**: no disponibles; dependerán de la GPU y del contexto. En una RTX 4090 se espera una generación de 30-50 tokens/s para modelos de 27B cuantizados, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | BF16 | Modelo original, requiere ~54 GB en FP16 |
| Qwen3.8-27B EXL3 3.8bpw (este) | 27B | 262K | Apache 2.0 | EXL3 | 16.6 GB, cuantización agresiva |
| Qwen3.8-27B EXL3 4.5bpw | 27B | 262K | Apache 2.0 | EXL3 | 18.7 GB, mayor fidelidad |
| Gemma 2 27B | 27B | 8K | Gemma license | Varios | Sin multimodalidad, contexto menor |
| Qwen2.5-32B | 32B | 128K | Apache 2.0 | Varios | Tamaño similar, sin visión nativa |

La comparativa se basa en características generales; no se dispone de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3.8 bpw puede degradar la calidad de generación en tareas complejas de razonamiento o código, aunque no se han publicado evaluaciones específicas.
- El modelo base puede presentar sesgos y alucinaciones, especialmente en dominios especializados o con entradas ambiguas.
- La ventana de 262K tokens es teórica; en la práctica, el uso completo requiere mucha VRAM y puede ralentizar la inferencia.
- El formato EXL3 solo es compatible con ExLlamaV3 y sus derivados; no funcionará con otros motores de inferencia sin conversión previa.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base para posibles restricciones adicionales (no se han encontrado).
- El codebook `mul1` requiere ExLlamaV3 v0.0.3 o superior; versiones antiguas decodificarían incorrectamente los pesos.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/Honkware/Qwen3.8-27B-exl3-3.8bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Colección de cuantizaciones: https://huggingface.co/collections/Honkware/qwen38-27b-exl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- BlockQuant: https://github.com/Honkware/blockquant
- Guía de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
