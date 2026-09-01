# kfgqiwufg/Oryon-instruct

## Resumen

Oryon-instruct es un repositorio de Hugging Face que contiene los pesos y archivos de configuración del modelo Qwen3.8-27B, un modelo de lenguaje causal multimodal (texto e imagen) de 27 000 millones de parámetros, desarrollado por la comunidad Qwen y publicado bajo licencia Apache 2.0. Aunque el nombre del repositorio es "Oryon-instruct", la model card identifica claramente el modelo como Qwen3.8-27B, la última generación de la familia Qwen3.8, que mejora capacidades de codificación, trabajo profesional, investigación y tareas agénticas de largo horizonte.

El modelo combina una arquitectura híbrida con atención lineal (Gated DeltaNet) y atención clásica (Gated Attention), soporta una ventana de contexto nativa de 262 144 tokens extensible hasta 1 000 000, e incorpora un codificador de visión para comprender imágenes y vídeos. Incluye un modo de pensamiento flexible (thinking mode) activado por defecto, con control de esfuerzo de razonamiento y preservación del contexto de razonamiento entre mensajes. Su tamaño compacto (27B) lo hace adecuado para despliegue en entornos con recursos limitados, manteniendo un rendimiento competitivo frente a modelos más grandes.

El repositorio fue creado por el usuario kfgqiwufg el 1 de septiembre de 2026, con 0 descargas y 0 likes en el momento de la consulta. Los pesos están en formato safetensors y son compatibles con Transformers, vLLM, SGLang y TokenSpeed.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo de lenguaje causal con codificador de visión integrado. Su arquitectura interna sigue un patrón híbrido: el bloque oculto se organiza como 16 repeticiones de una secuencia de 3 capas de Gated DeltaNet seguidas de una capa de Feed Forward Network (FFN), y después una capa de Gated Attention seguida de otra FFN. La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention utiliza 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y rotary position embedding de dimensión 64. La dimensión oculta es 5120, con 64 capas en total y una dimensión intermedia de FFN de 17 408. El embedding de tokens está rellenado a 248 320.

El modelo fue entrenado en dos etapas: pre-entrenamiento y post-entrenamiento. Se menciona que se entrenó con Multi-Token Prediction (MTP) en múltiples pasos, lo que permite predecir varios tokens a la vez y mejora la eficiencia de decodificación. No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La model card indica que el modelo tiene soporte nativo para comprensión de imágenes y vídeos, desde diagramas STEM hasta vídeos de una hora de duración.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking) activado por defecto y controlable mediante `reasoning_effort`.
- Comprensión de imágenes y vídeos: puede interpretar diagramas técnicos, documentos escaneados y vídeos de larga duración.
- Codificación y trabajo profesional: mejoras sustanciales en tareas de programación, redacción técnica y resolución de problemas.
- Ejecución de tareas agénticas de largo horizonte: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Control flexible del razonamiento: se puede desactivar el modo thinking por petición y conservar el contexto de razonamiento histórico mediante `preserve_thinking`.
- Soporte de tool calling y function calling (implícito en las capacidades agénticas, aunque no se detalla explícitamente en la model card).
- Multilingüismo: no se especifican idiomas soportados, pero al ser un modelo de la familia Qwen, se espera cobertura multilingüe amplia (no confirmado).

## Casos de uso

- Asistente de programación con razonamiento profundo: el modelo puede generar código, explicar algoritmos y depurar errores, aprovechando su modo thinking para descomponer problemas complejos antes de responder.
- Análisis de documentos técnicos con imágenes: gracias a su codificador de visión, puede procesar diagramas de arquitectura, esquemas eléctricos o capturas de pantalla de interfaces, y extraer información relevante para informes o resúmenes.
- Agente autónomo de automatización de tareas: su capacidad de planificación a largo plazo y manejo de feedback del entorno lo hace adecuado para orquestar flujos de trabajo multi-paso, como la gestión de incidencias en un sistema de tickets o la ejecución de pipelines de datos.
- Asistente de investigación científica: puede leer artículos con figuras y tablas, razonar sobre resultados experimentales y redactar resúmenes o hipótesis, con contexto largo para mantener coherencia en documentos extensos.
- Chatbot de atención al cliente con contexto amplio: su ventana de 262K tokens permite mantener conversaciones muy largas sin perder el hilo, ideal para soporte técnico especializado donde se necesita recordar interacciones previas.
- Generación de documentación técnica a partir de código y diagramas: puede analizar repositorios completos, entender la estructura del proyecto y generar documentación actualizada, combinando lectura de texto e imágenes.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de rendimiento en texto, pero los valores numéricos no están disponibles en la información proporcionada. La tabla compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, en la categoría de "Agentic terminal coding" (Terminal Bench 2.1, Terminus). No se han publicado los resultados completos en la información disponible, por lo que no es posible presentar una tabla con valores concretos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27 781 millones de parámetros, en precisión FP16 se requieren aproximadamente 55,6 GB de VRAM (equivalente al tamaño del repositorio). Con cuantización a 4 bits (por ejemplo, GGUF Q4_K_M), la huella se reduce a unos 16-18 GB, lo que permitiría ejecutarlo en GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB).
- GPUs recomendadas: para FP16, se necesitan GPUs de datacenter como A100 (40/80 GB) o H100 (80 GB). Para cuantización 4-bit, una RTX 4090 o RTX 6000 Ada sería suficiente.
- Compatibilidad con consumer GPUs: sí, con cuantización adecuada (GGUF) y usando llama.cpp u Ollama, aunque no se han publicado cuantizaciones oficiales.
- Opciones de despliegue: Transformers, vLLM, SGLang, TokenSpeed (mencionados en la model card). También se puede usar llama.cpp u Ollama si se generan archivos GGUF.
- Latencia y throughput: no disponible. Dependerá del hardware y la cuantización.

## Comparativa con modelos similares

La model card menciona comparaciones con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se proporcionan los valores de los benchmarks. No se dispone de información suficiente para realizar una comparativa cuantitativa fiable. Se puede indicar que Qwen3.8-27B es un modelo denso de 27B con visión, mientras que Qwen3.7-Plus y Opus4.6 Max podrían ser modelos más grandes o propietarios, pero no hay datos confirmados.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos del modelo. Como todo LLM, puede generar información incorrecta o inventada, especialmente en tareas de razonamiento complejo.
- La ventana de contexto de 262K tokens es nativa, pero la extensión a 1M tokens puede requerir técnicas de interpolación de posición o hardware específico; no se garantiza el rendimiento en toda la extensión.
- No se especifican los idiomas soportados, por lo que el rendimiento en lenguas distintas del inglés o el chino (idiomas típicos de Qwen) no está confirmado.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo recién publicado o poco validado por la comunidad. Se recomienda verificar su funcionamiento antes de usarlo en producción.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede tener restricciones adicionales si se redistribuye o se usa en servicios gestionados (consultar los términos de Qwen Cloud).
- No se proporcionan instrucciones de uso específicas ni ejemplos de código en la model card, lo que puede dificultar la integración inicial.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/kfgqiwufg/Oryon-instruct
- Qwen Cloud (servicio gestionado, mencionado en la model card): https://www.qwencloud.com/models/qwen3.8-27b (próximamente)
