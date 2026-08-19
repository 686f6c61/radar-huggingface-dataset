# Kritpawit/Qwen3.8-27B-NVFP4A16

## Resumen

El modelo `Kritpawit/Qwen3.8-27B-NVFP4A16` es una cuantización en formato NVFP4A16 (pesos de 4 bits en punto flotante NVIDIA, activaciones de 16 bits) del modelo base Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. Este modelo base es un LLM multimodal denso de 27 000 millones de parámetros, diseñado para ofrecer un alto rendimiento en hardware local, con capacidades destacadas en generación de código, flujos de trabajo agénticos y automatización de oficina.

La cuantización NVFP4A16 reduce significativamente el uso de memoria y acelera la inferencia en GPUs NVIDIA compatibles, manteniendo una calidad cercana a la versión original. El modelo base incorpora una arquitectura híbrida de atención (atención lineal en 48 de sus 64 capas), una torre de visión integrada y un contexto nativo de 262 000 tokens, extensible a 1 000 000. Esta ficha se centra en la variante cuantizada, aunque muchos datos técnicos provienen del modelo base, ya que el repositorio de la cuantización no incluye documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (lineal + full attention), torre de visión integrada, MTP draft head |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | NVFP4A16 (pesos FP4 de NVIDIA, activaciones FP16) |
| Idiomas soportados | no disponible (el modelo base soporta multilingüe, pero no se detalla en la información) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se presume safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de transformer denso con atención híbrida: de las 64 capas, 48 utilizan atención lineal (probablemente basada en kernels eficientes tipo Flash Linear Attention) y las 16 restantes usan atención completa, lo que permite manejar ventanas de contexto muy largas con un coste computacional reducido. Incluye una torre de visión (vision tower) para procesamiento multimodal y un "MTP draft head" (Multi-Token Prediction) que actúa como cabeza de decodificación especulativa, acelerando la generación de tokens.

El entrenamiento del modelo base no se detalla en la información proporcionada (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La cuantización NVFP4A16 es un post-procesamiento sobre los pesos del modelo base, realizada por el autor del repositorio (Kritpawit), aunque no se especifica el método exacto de calibración o si se utilizaron datos de validación para ajustar la cuantización.

## Capacidades

- Generación de texto y razonamiento complejo en tareas generales y de oficina.
- Comprensión y generación de código en múltiples lenguajes de programación, con soporte para tool calling y flujos agénticos.
- Procesamiento multimodal: entrada de imágenes (a través de la torre de visión) para tareas de descripción, respuesta visual y razonamiento sobre imágenes.
- Contexto largo nativo de 262K tokens, extensible a 1M, adecuado para documentos extensos, análisis de código y conversaciones multi-turno prolongadas.
- Decodificación especulativa mediante el MTP draft head, que reduce la latencia de generación.
- Capacidades multilingües (el modelo base soporta múltiples idiomas, aunque no se detallan cuáles).

## Casos de uso

- Automatización de oficina: el modelo puede generar informes, resumir documentos extensos (hasta 262K tokens) y redactar correos electrónicos con contexto amplio, gracias a su ventana de contexto larga.
- Asistente de programación en producción: con soporte para tool calling, puede integrarse en pipelines de CI/CD para generar código, revisar pull requests y autocompletar funciones en entornos con recursos limitados gracias a la cuantización.
- Análisis de documentos legales o financieros: la ventana de contexto de 262K permite procesar contratos completos o expedientes extensos sin truncamiento, extrayendo cláusulas y generando resúmenes.
- Chatbot de atención al cliente multimodal: el modelo puede recibir imágenes de productos o capturas de pantalla y responder con texto coherente, gestionando conversaciones multi-turno con memoria larga.
- Agente autónomo para investigación: combinando tool calling y razonamiento multi-paso, puede buscar información, ejecutar código y sintetizar resultados en tareas de análisis de datos.
- Generación de documentación técnica: a partir de código fuente o especificaciones, el modelo puede crear manuales, guías de usuario y comentarios de API, aprovechando su capacidad de comprensión de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la variante cuantizada `Kritpawit/Qwen3.8-27B-NVFP4A16` en la información disponible. Tampoco se proporcionan métricas del modelo base (MMLU, HumanEval, GSM8K, etc.) en las fuentes consultadas. Se recomienda consultar el repositorio oficial de Qwen3.8-27B para obtener datos de rendimiento del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia con cuantización NVFP4A16 (4 bits): aproximadamente 14-16 GB para los pesos, más overhead de activaciones y KV cache, lo que podría requerir entre 18 y 24 GB dependiendo del contexto y el batch.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para mayor throughput.
- En consumer GPU: cabe en tarjetas con 24 GB de VRAM, como la RTX 4090, con contexto moderado (hasta 32K tokens). Para contexto máximo (262K) se necesitaría más memoria o técnicas de offloading.
- Opciones de despliegue: vLLM (si soporta NVFP4), llama.cpp (si el formato es GGUF, aunque no se confirma), Ollama, TGI. Dado que el formato de pesos no está especificado, la compatibilidad con estos motores es incierta.
- Latencia y throughput: no disponible. La decodificación especulativa del MTP draft head podría mejorar la velocidad de generación en comparación con modelos sin ella, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización disponible | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (ext. 1M) | FP8, NVFP4 | Apache 2.0 | Modelo multimodal denso con atención híbrida |
| Qwen2.5-27B (base) | 27B | 128K | FP8, GGUF | Apache 2.0 | Modelo anterior sin visión ni atención lineal |
| Llama 3.1 8B (comparación de tamaño menor) | 8B | 128K | GGUF, FP8 | Llama 3.1 License | Menor capacidad pero más ligero |
| Mixtral 8x7B (MoE) | 46.7B total, 12.9B activos | 32K | GGUF, FP8 | Apache 2.0 | Arquitectura MoE, contexto menor |

La cuantización NVFP4A16 es específica de GPUs NVIDIA con soporte FP4 (serie Blackwell o posteriores), lo que limita su portabilidad frente a formatos GGUF. En términos de rendimiento por parámetro, Qwen3.8-27B supera a Qwen2.5-27B en tareas de código y agentes según la documentación oficial, aunque no se dispone de cifras comparativas en esta ficha.

## Limitaciones y advertencias

- La cuantización NVFP4A16 puede introducir degradación de precisión en tareas de razonamiento complejo o matemáticas de alta exactitud, aunque el formato FP4 de NVIDIA está optimizado para minimizar pérdidas.
- No se ha verificado la calidad de la cuantización mediante benchmarks públicos; es recomendable evaluar el modelo en casos de uso específicos antes de desplegarlo en producción.
- El modelo base puede presentar sesgos y alucinaciones, especialmente en contextos poco comunes o con información ambigua.
- La licencia Apache 2.0 permite uso comercial, pero es necesario cumplir con los términos de la licencia del modelo base (también Apache 2.0).
- El formato de pesos no está documentado; si no es compatible con vLLM o llama.cpp, el despliegue puede requerir conversión adicional o herramientas específicas de NVIDIA.
- La extensión de contexto a 1M tokens puede degradar la calidad de atención en tramos muy largos, y requiere memoria KV cache considerable.
- No se especifican los idiomas soportados; aunque el modelo base es multilingüe, la calidad en idiomas minoritarios puede ser inferior.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/Kritpawit/Qwen3.8-27B-NVFP4A16
- Repositorio oficial del modelo base en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Colección de cuantizaciones en HuggingFace: https://huggingface.co/collections/huginnfork/qwen38-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
