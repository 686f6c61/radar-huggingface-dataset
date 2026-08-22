# Amirali13651365/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje multimodal denso de 27 000 millones de parámetros perteneciente a la familia Qwen3.8, desarrollado por el equipo de Qwen (Alibaba). Se posiciona como una alternativa compacta y orientada al despliegue frente al modelo insignia de la misma generación, ofreciendo capacidades nativas de visión (imágenes y vídeo) y un control flexible del razonamiento. Su arquitectura híbrida combina atención lineal (Gated DeltaNet) con atención completa, lo que permite manejar contextos de hasta 262 144 tokens de forma nativa, extensibles a 1 000 000, sin un coste computacional desproporcionado.

El modelo está diseñado para destacar en tareas de codificación, trabajo profesional, investigación y ejecución de agentes autónomos de largo horizonte. Incluye un modo de pensamiento (thinking) activado por defecto y ajustable mediante parámetros como `reasoning_effort` y `preserve_thinking`, además de soporte para predicción multitoken (MTP). Su licencia Apache-2.0 y su compatibilidad con los principales entornos de inferencia (Transformers, vLLM, SGLang, TokenSpeed) lo convierten en una opción práctica para equipos que necesitan un modelo de alto rendimiento con despliegue local o en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 64 capas con 16 bloques de atención completa (Gated Attention) y 48 bloques de atención lineal (Gated DeltaNet) en un patrón 4×(3×DeltaNet→FFN→1×Attention→FFN). Incluye vision encoder para imagen y vídeo |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1 000 000 |
| Tipos de cuantizacion | No especificados en la informacion disponible (se espera compatibilidad con cuantizaciones estándar como FP16, INT8, INT4) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B utiliza una arquitectura híbrida de atención que combina dos mecanismos. De las 64 capas del modelo, solo 16 emplean atención completa (Gated Attention con 24 cabezas de Q y 4 de KV, con head dimension de 256), mientras que las 48 restantes usan atención lineal con Gated DeltaNet (48 cabezas para V y 16 para QK, con head dimension de 128). Esta distribución, descrita como `full_attention_interval: 4`, permite reducir el coste computacional en secuencias largas manteniendo la capacidad de capturar dependencias a largo plazo. El modelo incorpora además un vision encoder nativo para procesar imágenes y vídeo.

El entrenamiento se realizó en dos etapas: pre-training y post-training, con una técnica de predicción multitoken (MTP) entrenada con múltiples pasos. No se proporcionan detalles sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron métodos de alineación como RLHF o DPO. La información disponible no detalla el proceso de post-training, aunque el énfasis en tareas agénticas y en el manejo de feedback del entorno sugiere un refinamiento específico para este tipo de usos.

## Capacidades

- Generación de texto y razonamiento multimodal: comprende imágenes y vídeo (desde diagramas STEM hasta documentos y vídeos de larga duración).
- Modo de pensamiento (thinking) controlable: activado por defecto, puede desactivarse por petición; la profundidad del razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento histórico se conserva con `preserve_thinking`.
- Ejecución de tareas agénticas: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas complejas de múltiples pasos.
- Soporte de integración con herramientas: la compatibilidad con vLLM, SGLang y TokenSpeed permite el uso de tool calling estándar en estos entornos, aunque la model card no especifica explícitamente la función.
- Capacidades multilingües: no se detallan idiomas soportados en la información disponible.
- Predicción multitoken (MTP): entrenada para mejorar la velocidad de generación y la coherencia en secuencias largas.

## Casos de uso

- Desarrollo de agentes de codificación autónomos: el modelo puede operar en terminales (benchmark Terminal Bench 2.1) para ejecutar tareas de programación de forma autónoma, aprovechando su capacidad de planificación y manejo de feedback del entorno.
- Análisis de documentos técnicos y diagramas: su visión nativa permite extraer información de figuras, esquemas y documentos científicos, facilitando tareas de investigación y revisión técnica.
- Comprensión de vídeo de larga duración: la ventana de contexto de 262K tokens y la capacidad de procesamiento de vídeo permiten analizar contenido de vídeo de hasta horas, útil para resúmenes, búsqueda de eventos o verificación de procesos.
- Agentes de asistencia profesional multi-paso: puede gestionar flujos de trabajo complejos (por ejemplo, recopilar datos, razonar sobre ellos y generar informes) manteniendo el contexto de razonamiento a lo largo de la conversación.
- Despliegue local en hardware de consumo: con cuantizaciones 4-bit u 8-bit, el modelo cabe en GPUs de gama alta (RTX 3090/4090 con 24 GB) y en plataformas AMD como Ryzen AI MAX y Radeon, tal como se documenta en el blog de AMD.
- Integración en pipelines de producción: compatible con vLLM y SGLang, se puede servir en infraestructuras existentes con alta concurrencia y baja latencia, aprovechando la predicción multitoken para acelerar la generación.

## Benchmarks y rendimiento

La información disponible solo menciona el benchmark "Terminal Bench 2.1 (Terminus)" para codificación agéntica, pero no incluye los valores numéricos. La tabla comparativa de la model card lista los siguientes modelos de referencia: Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los resultados concretos no están presentes en el fragmento extraído. No se han publicado resultados completos de benchmarks en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 27B parámetros, por lo que en FP16 requiere aproximadamente 55 GB de memoria (el repositorio pesa 55.6 GB). Con cuantización 8-bit, se puede reducir a ~28 GB; con 4-bit, a ~14-16 GB (estimación estándar para modelos de este tamaño).
- GPU recomendadas: para inferencia en FP16 se necesitan GPUs con al menos 48 GB (A6000, A100 40/80 GB, H100). Para cuantizaciones 4-bit/8-bit, una RTX 3090 (24 GB) o RTX 4090 (24 GB) es suficiente.
- Compatibilidad con AMD: el modelo se puede ejecutar en AMD Ryzen AI MAX y GPUs Radeon, según el blog oficial de AMD.
- Opciones de despliegue: Transformers, vLLM, SGLang, TokenSpeed. También está disponible en LM Studio para uso local.
- Latencia y throughput: no disponible en la información proporcionada. La predicción multitoken (MTP) debería mejorar la velocidad de generación, pero no se especifican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Híbrida (DeltaNet + Attention) | Apache-2.0 | Abierta |
| Qwen3.6-27B | 27B | No especificado | No especificado | No especificado | Abierta |
| Qwen3.7-Plus | No especificado | No especificado | MoE (probable) | No especificada | API |
| Muse Glimmer-30B | 30B | No especificado | No especificado | No especificada | No especificada |
| Opus4.6 Max | No especificado | No especificado | No especificado | No especificada | No especificada |

La información disponible no incluye datos comparativos de rendimiento entre estos modelos. La comparación se limita a características generales y a la mención de la tabla de benchmarks de la model card.

## Limitaciones y advertencias

- Sesgos y alucinación: como todos los modelos de lenguaje, puede generar información falsa o inexacta, especialmente en contextos largos. No se han publicado evaluaciones específicas de sesgos para esta versión.
- Limitaciones de contexto: aunque soporta hasta 1M tokens, el rendimiento en tareas de recuperación de información precisa puede degradarse en contextos muy largos. Se recomienda validar en cada caso de uso.
- Idiomas: no se especifican los idiomas soportados; la información es insuficiente para garantizar un rendimiento multilingüe óptimo.
- Licencia: Apache-2.0 permite uso comercial y modificación sin restricciones adicionales, pero se debe verificar el cumplimiento de los términos de la licencia para el uso de los pesos y el código.
- Datos de entrenamiento y alineación: no se han publicado detalles sobre el dataset, el proceso de alineación (RLHF/DPO) ni las políticas de seguridad. Es recomendable realizar una evaluación de riesgos antes del despliegue en producción.
- Compatibilidad de cuantización: no se documentan los tipos de cuantización soportados oficialmente; se recomienda probar con las herramientas habituales (llama.cpp, GPTQ, AWQ) para confirmar la estabilidad.

## Enlaces

- Repositorio oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio espejo (Amirali13651365): https://huggingface.co/Amirali13651365/Qwen3.8-27B
- Blog de AMD sobre ejecución en hardware AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Ficha en AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
