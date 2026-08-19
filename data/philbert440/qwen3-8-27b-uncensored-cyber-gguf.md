# philbert440/Qwen3.8-27B-Uncensored-Cyber-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Cyber-GGUF es una cuantización en formato GGUF del modelo base Qwen3.8-27B-Uncensored-Cyber, desarrollado por el usuario philbert440. Se trata de una variante "uncensored" (sin censura) del modelo Qwen3.8-27B, que combina una arquitectura híbrida con GatedDeltaNet y atención completa, además de un módulo de visión y una cabeza de predicción multi-token (MTP). El modelo ha sido sometido a un proceso de abliteración (eliminación de direcciones de rechazo) orientado a ciberseguridad ofensiva, con el objetivo de eliminar las barreras de seguridad que impiden generar contenido relacionado con malware o exploits.

La versión GGUF está optimizada para su ejecución en llama.cpp, LM Studio, Ollama y Jan, e incluye ficheros separados para el modelo de lenguaje, el proyector de visión (mmproj) y la cabeza MTP para decodificación especulativa. Con 26.895.998.464 parámetros totales, el modelo se distribuye en múltiples niveles de cuantización (Q4_K_M, Q5_K_M, Q6_K, Q8_0 y BF16) para adaptarse a distintos requisitos de memoria. Su licencia Apache 2.0 permite uso comercial, aunque su naturaleza "uncensored" lo convierte en una herramienta de investigación con implicaciones éticas y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: GatedDeltaNet + atención completa (full attention), con módulo de visión y cabeza MTP (multi-token prediction) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso del autor emplea 32768 tokens) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, BF16 (modelo de lenguaje); Q8_0 y BF16 para mmproj; Q8_0, Q4_0 y BF16 para MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B-Uncensored-Cyber emplea una arquitectura híbrida que combina GatedDeltaNet, un mecanismo de atención lineal con compuertas, con atención completa (full attention) en capas específicas. Esta combinación busca equilibrar eficiencia computacional y capacidad de modelado de dependencias largas. Además, incorpora un módulo de visión (vision tower) que permite procesar imágenes junto con texto, y una cabeza MTP (multi-token prediction) que acelera la decodificación mediante decodificación especulativa.

El proceso de "uncensoring" se realizó mediante una técnica de abliteración llamada "Heretic KL-optimized abliteration", complementada con un "Arditi peel" parcial sobre la dirección de rechazo más difícil de eliminar (la relacionada con la generación de malware funcional). Según el autor, esta intervención preserva las capacidades de visión y MTP sin modificarlas. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados o si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye únicamente en formato GGUF, convertido desde BF16 con las herramientas de llama.cpp y cuantizado con la receta k-quant estándar, manteniendo los tensores sensibles (output.weight, proyecciones de atención, SSM, latente y shared-expert) en mayor precisión (Q8_0 o Q6_K).

## Capacidades

- Generación de texto y razonamiento: el modelo mantiene las capacidades del Qwen3.8-27B original, incluyendo razonamiento multi-paso y modo "thinking" activado por defecto (según la plantilla de chat).
- Visión: admite entrada de imágenes mediante el fichero `mmproj`, permitiendo tareas de descripción de imágenes y respuesta a preguntas visuales.
- Decodificación especulativa: la cabeza MTP opcional acelera la generación de tokens en entornos compatibles con llama.cpp.
- Tool calling y function calling: no se especifica explícitamente, pero al tratarse de un modelo de la familia Qwen, es probable que soporte estas capacidades; sin embargo, no hay confirmación en la documentación disponible.
- Multilingüismo: no se indica qué idiomas soporta; el autor no proporciona esta información.
- Capacidad "uncensored": el modelo ha sido modificado para eliminar rechazos de seguridad, permitiendo generar contenido relacionado con ciberseguridad ofensiva (malware, exploits, etc.) con una apertura reportada de 99/100 en el conjunto de evaluación del autor.

## Casos de uso

- Investigación en ciberseguridad ofensiva: el modelo puede utilizarse para generar código de exploits, malware de prueba o técnicas de ataque en entornos controlados de laboratorio, gracias a su abliteración específica. Es adecuado para investigadores que necesitan estudiar patrones de malware sin las restricciones habituales de los modelos comerciales.
- Análisis de imágenes en entornos técnicos: con el módulo de visión, puede procesar capturas de pantalla, diagramas de red o imágenes de código para extraer información relevante en auditorías de seguridad.
- Desarrollo de agentes autónomos con razonamiento multi-paso: su capacidad de "thinking" y la posibilidad de decodificación especulativa lo hacen útil para tareas de planificación y ejecución de secuencias complejas en entornos de automatización.
- Generación de contenido técnico sin censura: para documentación interna sobre vulnerabilidades, análisis de malware o redacción de informes técnicos que requieran un lenguaje directo y sin filtros.
- Prototipado rápido de aplicaciones de chat con visión: gracias a su compatibilidad con llama.cpp, LM Studio y Ollama, se puede integrar en asistentes conversacionales que necesiten interpretar imágenes y texto sin depender de servicios en la nube.
- Evaluación de técnicas de abliteración: el modelo sirve como caso de estudio para investigadores interesados en medir el impacto de la eliminación de direcciones de rechazo en modelos de lenguaje grandes, comparando su comportamiento con versiones sin modificar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor menciona en la model card dos métricas propias: una apertura en ciberseguridad ofensiva de 99/100 en su conjunto de evaluación, y un resultado de 22/25 en GSM8K con un presupuesto completo de "thinking". Sin embargo, estos datos no provienen de evaluaciones independientes y no pueden compararse directamente con otros modelos. Por tanto, se considera que no hay datos de rendimiento verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: según la tabla de ficheros, la cuantización Q4_K_M ocupa 17.7 GB, por lo que cabe en una GPU de 24 GB (por ejemplo, RTX 3090, RTX 4090). Q5_K_M (19.8 GB) también cabe en 24 GB, mientras que Q6_K (22.1 GB) requiere una GPU con al menos 24 GB y Q8_0 (26.6 GB) necesita 32 GB o más. La versión BF16 (50.1 GB) requiere múltiples GPUs o una GPU de 48 GB (como A6000) o más.
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 3090 o RTX 4090 (24 GB) es suficiente. Para Q6_K, también una 24 GB, aunque con menor margen. Para Q8_0, se recomienda una A100 40GB, A100 80GB o RTX A6000 48GB. Para BF16, se necesitan al menos dos GPUs de 32 GB o una GPU de 80 GB (A100/H100).
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs de consumo de gama alta (24 GB). Las versiones superiores requieren hardware profesional.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server, llama-mtmd-cli), LM Studio, Ollama y Jan. También es compatible con servidores que acepten GGUF, como vLLM (a través de su backend de GGUF) o text-generation-inference (TGI), aunque no se menciona explícitamente.
- Latencia y throughput: no se proporcionan datos medidos. La decodificación especulativa con la cabeza MTP puede acelerar la generación en hardware compatible, pero los valores concretos dependen del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría (p. ej., Qwen3-27B estándar, Llama 3.1 27B o Mistral 27B). El modelo base Qwen3.8-27B no tiene una ficha pública en la información proporcionada, y no se conocen los benchmarks oficiales. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente modificado para eliminar mecanismos de rechazo de seguridad. Esto implica un alto riesgo de generar contenido malicioso, ilegal o dañino, incluyendo malware funcional, exploits y técnicas de ataque. Su uso debe limitarse a entornos de investigación controlados y legales.
- No se han publicado evaluaciones independientes de sesgos, alucinaciones o calidad general. El autor solo reporta métricas propias no verificadas.
- La longitud de contexto no está documentada oficialmente; el ejemplo de uso emplea 32768 tokens, pero no se garantiza que el modelo funcione correctamente en toda esa ventana.
- Los idiomas soportados no se especifican; es probable que el modelo siga el multilingüismo de Qwen3, pero no hay confirmación.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza "uncensored" puede implicar restricciones legales adicionales según la jurisdicción y el uso previsto.
- El modelo no incluye un sistema de moderación de contenido; los desarrolladores que lo integren en aplicaciones deben implementar sus propias salvaguardas si es necesario.
- No se dispone de información sobre el dataset de entrenamiento, por lo que no se puede evaluar la posible presencia de datos sesgados o desactualizados.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber-GGUF
- Modelo base (safetensors): https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- Repositorio de llama.cpp (herramientas de conversión y ejecución): https://github.com/ggml-org/llama.cpp
- LM Studio (cliente de escritorio compatible): https://lmstudio.ai
- Ollama (plataforma de ejecución local): https://ollama.com
- Jan (aplicación de escritorio para modelos locales): https://jan.ai
