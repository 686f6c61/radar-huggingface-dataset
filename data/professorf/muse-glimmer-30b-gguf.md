# professorf/Muse-Glimmer-30B-gguf

## Resumen

Muse Glimmer es un modelo de lenguaje causal de aproximadamente 30 000 millones de parámetros (27,85 mil millones en pesos reales) desarrollado por Meta Superintelligence Lab, diseñado específicamente para tareas agénticas autónomas en hardware de consumo. Se trata de una versión destilada de Muse Spark que integra en un único modelo capacidades de razonamiento multi-paso, uso fiable de herramientas, comprensión multimodal (texto e imagen) y recuperación ante fallos, todo ello ejecutable localmente sin depender de infraestructura en la nube.

El modelo combina un transformer denso con un encoder de percepción ViT-G/14 de aproximadamente 1,8 mil millones de parámetros, lo que le permite procesar entradas intercaladas de texto e imágenes. Con una longitud de contexto de 131 072 tokens y soporte para más de 100 idiomas, está pensado para agentes que necesitan mantener conversaciones largas, interpretar capturas de pantalla o documentos y ejecutar flujos de trabajo complejos con herramientas externas. Su licencia Apache 2.0 y su optimización para cuantización en 4 bits lo convierten en una opción atractiva para despliegues locales en GPU de 24 GB o 32 GB.

El repositorio en HuggingFace corresponde a una versión cuantizada en formato GGUF publicada por el usuario professorf (Nick V. Flor, PhD), con fines de reproducibilidad en investigación. La model card original de Meta describe el modelo completo, mientras que este repo ofrece los pesos comprimidos para su uso con llama.cpp, Ollama u otras herramientas compatibles con GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepción (ViT-G/14) |
| Parametros totales | 27 854 794 240 (según safetensors); ~29,6B según model card (incluye encoder de visión) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072+ tokens |
| Tipos de cuantizacion | GGUF: K-Quant-Dynamic (32 GB VRAM) y K-Quant-17GB (24 GB VRAM); full precision (64 GB VRAM) |
| Idiomas soportados | Más de 100 idiomas (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible para el modelo original) |

## Arquitectura y entrenamiento

Muse Glimmer emplea una arquitectura de transformer causal denso con un patrón de atención mixto local-global: la secuencia de capas se organiza como [Local, Local, Local, Global] repetido, con una ventana deslizante de 2048 tokens en las capas locales y atención global en las capas designadas. Utiliza atención con cabezas agrupadas (GQA) con ratio 16:1 (32 cabezas de consulta, 2 de clave/valor), función de activación SwiGLU en las FFN con dimensión intermedia de 19 968, y codificación posicional RoPE con theta de 500 000 aplicada solo en capas locales. El vocabulario consta de 202 048 tokens (200 000 BPE más 2048 especiales).

El modelo incorpora un encoder de percepción basado en ViT-G/14 de aproximadamente 1,8 mil millones de parámetros, con 50 capas, ancho 1536 y tamaño de parche 14, que permite procesar hasta 4096 tokens visuales por imagen. Este encoder está conectado al modelo de lenguaje principal, lo que habilita la entrada multimodal intercalada.

El entrenamiento se realizó mediante destilación desde Muse Spark, utilizando datos multimodales de fuentes públicas, datos de terceros y productos de Meta, con un corte de conocimiento en enero de 2026. Además, el modelo incorpora un mecanismo de decodificación especulativa basado en DFlash, un modelo auxiliar ligero de difusión por bloques que propone bloques de 16 tokens en una sola pasada hacia adelante, que el modelo principal verifica en paralelo. Este drafter tiene 5 capas, atención de ventana deslizante de 2048 y cabezas GQA 32/8, y está disponible en versiones cuantizadas para reducir su huella de memoria.

## Capacidades

- Agente de extremo a extremo: el modelo está entrenado para completar tareas completas desde el inicio hasta el final, incluyendo búsqueda profunda, escritura y depuración de código, y resolución de solicitudes multi-turno.
- Uso fiable de herramientas: invoca funciones con esquemas precisos a lo largo de flujos de trabajo extendidos, compatible con protocolos como MCP.
- Razonamiento multi-paso: encadena razonamiento sobre horizontes largos, manteniendo planes coherentes en tareas complejas.
- Recuperación ante fallos: cuando una llamada a herramienta falla o devuelve un resultado inesperado, el modelo diagnostica el error y reintenta en lugar de detenerse.
- Comprensión multimodal: acepta texto e imágenes intercaladas, lo que permite interpretar capturas de pantalla, gráficos y documentos junto con la conversación.
- Compatibilidad con scaffolds: funciona con OpenClaw, Hermes Agent y otros patrones de orquestación agéntica.
- Esfuerzo controlable: soporta diferentes niveles de razonamiento para equilibrar calidad y velocidad según la tarea.
- Multilingüe: entrenado con datos de más de 100 idiomas.
- Decodificación especulativa: genera texto significativamente más rápido que la generación token a token gracias al drafter DFlash, manteniendo calidad idéntica.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 131 072 tokens) y, gracias a su capacidad de tool calling, puede consultar bases de conocimiento, crear tickets o escalar a un humano cuando sea necesario, todo localmente sin latencia de red.
- Agente de desarrollo de software: integrado en pipelines de CI/CD, puede leer issues, escribir código, ejecutar pruebas y corregir errores de forma autónoma, como demuestra su rendimiento en SWE-Bench.
- Asistente de análisis de documentos: al aceptar imágenes y texto, puede procesar informes financieros, capturas de pantalla de dashboards o documentos escaneados, extrayendo datos y respondiendo preguntas sobre ellos.
- Automatización de tareas con MCP: conectado a servidores MCP, puede orquestar múltiples herramientas (calendario, correo, APIs internas) para completar tareas administrativas complejas sin intervención humana.
- Investigación y búsqueda profunda: con su capacidad de razonamiento multi-paso y búsqueda en profundidad (DeepSearch QA), puede recopilar información de múltiples fuentes, sintetizarla y producir informes estructurados.
- Asistente personal offline: al ejecutarse en una GPU de consumo (24 GB) sin conexión a internet, es adecuado para entornos con requisitos estrictos de privacidad o sin conectividad, manteniendo capacidades de agente completas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que el modelo fue evaluado en DeepSearch QA, MCP-Atlas, τ3-Bench y SWE-Bench, pero no proporciona cifras concretas. Tampoco se incluyen comparaciones cuantitativas con otros modelos. La única métrica de degradación indicada es la pérdida de precisión media del 0,2 % con cuantización K-Quant-Dynamic y del 1,0 % con K-Quant-17GB, medida sobre 15 benchmarks comunes.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 20 GB para el modelo de lenguaje cuantizado a 4 bits (K-Quant-17GB), dejando margen para KV cache, encoder de percepción y drafter especulativo dentro de un envelope de 24 GB.
- GPU recomendadas: Nvidia RTX 5090 (validada), MacBook M4-Max y M5-Max (validados). Para full precision se requieren 64 GB de VRAM (por ejemplo, A100 80GB o H100).
- Compatibilidad con GPU de consumo: sí, cabe en RTX 4090 (24 GB) y RTX 5090 (32 GB) con las cuantizaciones adecuadas.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros runners de GGUF. También puede usarse con vLLM si se convierte a safetensors.
- Latencia y throughput: no se proporcionan cifras exactas, pero la decodificación especulativa con DFlash (bloques de 16 tokens) permite una generación significativamente más rápida que la token a token, adecuada para conversación fluida e interacción agéntica en tiempo real.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para realizar una comparativa cuantitativa con modelos similares. El modelo compite en la categoría de agentes locales de ~30B con alternativas como Llama 3.1 70B (mayor tamaño, sin encoder multimodal), Qwen2.5-32B (similar tamaño, con tool calling) o GLM-4-32B, pero no hay benchmarks comparativos publicados en las fuentes consultadas. Se recomienda consultar la documentación oficial de Meta para obtener comparaciones detalladas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado evaluaciones específicas de sesgos para este modelo. Al estar entrenado con datos públicos y de productos de Meta, puede heredar sesgos presentes en esos datos.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas. La recuperación ante fallos mitiga errores en tool calls, pero no elimina el riesgo en generación libre.
- Limitaciones de contexto: aunque la ventana es de 131 072 tokens, la atención local con ventana deslizante de 2048 puede limitar la capacidad de relacionar información distante dentro de la secuencia.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo es propiedad de Meta y puede haber términos adicionales en la documentación oficial que no se reflejan en la model card.
- Degradación por cuantización: la versión K-Quant-17GB introduce una degradación media del 1,0 % en benchmarks, que puede ser mayor en tareas específicas sensibles a la precisión.
- Requisitos de hardware: aunque cabe en 24 GB, el uso simultáneo de KV cache, encoder de visión y drafter puede requerir ajustes finos de memoria en GPUs de 24 GB con otras cargas activas.
- Disponibilidad: el repositorio GGUF es una contribución de un tercero (professorf) y no está oficialmente respaldado por Meta; se recomienda verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/professorf/Muse-Glimmer-30B-gguf
- Repositorio HuggingFace oficial (Meta): https://huggingface.co/meta-models/Muse-Glimmer-30B-GGUF
- Página oficial del modelo en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Blog de investigación de Meta: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Paper del encoder de percepción (arXiv 2504.13181): https://arxiv.org/abs/2504.13181
- Paper de DFlash (arXiv 2602.06036): https://arxiv.org/abs/2602.06036
