# manubc33/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27 000 millones de parámetros desarrollado por Qwen, la familia de modelos abiertos de Alibaba. Se trata de un modelo multimodal nativo que combina comprensión de texto, imagen y vídeo, con capacidades avanzadas de razonamiento y ejecución de tareas agénticas. Está construido sobre la arquitectura de Qwen3.5 e incorpora innovaciones como atención lineal híbrida (Gated DeltaNet) y atención clásica (Gated Attention), junto con predicción multi-token (MTP) para acelerar la inferencia.

El modelo destaca por su ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000 mediante técnicas de escalado RoPE, y por su modo de pensamiento flexible que puede activarse o desactivarse por petición. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para integraciones en producción. La versión GGUF aquí descrita, publicada por el usuario manubc33, utiliza la cuantización dinámica de Unsloth (Dynamic V3.0) para optimizar el rendimiento en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, capas híbridas de Gated DeltaNet (atención lineal) y Gated Attention |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 con RoPE scaling |
| Tipos de cuantizacion | GGUF (no se especifican los niveles exactos en el repo; se indica uso de Unsloth Dynamic V3.0) |
| Idiomas soportados | No disponible (probablemente multilingüe, pero no se especifica en la información) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors también disponibles en el modelo base) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica (Gated Attention). El layout oculto se organiza en 64 capas, distribuidas en bloques de 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La atención lineal utiliza 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención clásica usa 24 cabezas para Q y 4 para KV con dimensión 256. La dimensión oculta es 5120 y el tamaño intermedio del FFN es 17 408. El modelo incorpora además un módulo de predicción multi-token (MTP) entrenado con múltiples pasos, lo que mejora la velocidad de generación.

El entrenamiento incluye etapas de pre-entrenamiento y post-entrenamiento, aunque no se han publicado detalles específicos sobre el volumen de tokens o la composición del dataset. La model card menciona mejoras en ejecución agéntica, planificación autónoma y manejo de feedback del entorno, lo que sugiere un entrenamiento orientado a tareas de razonamiento multi-paso. El modelo es un VLM nativo, con un encoder de visión integrado que procesa imágenes y vídeos, incluyendo vídeos de hasta una hora de duración.

## Capacidades

- Generación de texto y razonamiento complejo: soporta modo de pensamiento (thinking mode) activado por defecto, con control de profundidad mediante el parámetro `reasoning_effort` y retención de contexto de razonamiento histórico mediante `preserve_thinking`.
- Comprensión multimodal: procesa imágenes (diagramas STEM, documentos, gráficos) y vídeos de larga duración (hasta una hora) gracias a su encoder de visión nativo.
- Ejecución agéntica: planificación autónoma, manejo de feedback del entorno y ejecución fiable de tareas multi-paso.
- Tool calling y function calling: soporte para integración en herramientas agénticas como Codex, con mejoras en el parseo de objetos anidados para aumentar la tasa de éxito.
- Soporte para agentes y razonamiento multi-step: diseñado para tareas de larga duración con contexto extenso.
- Capacidades multilingües: no especificadas oficialmente, pero se infiere que soporta múltiples idiomas dada la familia Qwen, aunque no hay confirmación en la documentación disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262 144 tokens de ventana, manteniendo el historial completo y el razonamiento interno. Su modo de pensamiento permite respuestas más precisas en consultas complejas.
- Generación de código en producción: con soporte de tool calling y ejecución agéntica, puede integrarse en pipelines de CI/CD para autogenerar tests, revisar código o implementar funciones completas a partir de descripciones en lenguaje natural.
- Análisis de documentos técnicos y científicos: su capacidad de visión procesa diagramas, tablas y figuras, permitiendo extraer información de papers, informes o manuales y responder preguntas sobre ellos.
- Asistentes de investigación con razonamiento multi-paso: puede descomponer problemas complejos en sub-tareas, consultar fuentes externas mediante tool calling y sintetizar resultados, ideal para entornos de investigación.
- Resumen y análisis de vídeos largos: su soporte de vídeo de hasta una hora permite transcribir, resumir y extraer información de grabaciones de reuniones, webinars o clases.
- Agentes autónomos para automatización de tareas: con su capacidad de planificación y manejo de feedback, puede ejecutar flujos de trabajo completos en entornos virtuales, como gestión de correos, programación de citas o scraping web.
- Chat conversacional con memoria extendida: su contexto de 256K tokens permite mantener conversaciones muy largas sin perder el hilo, útil para aplicaciones de asistencia personal o soporte técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni otros tests comparativos. Se recomienda consultar la documentación oficial de Qwen para obtener datos de rendimiento.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización GGUF elegida. Según la documentación de Unsloth, el modelo puede ejecutarse en configuraciones con 17 GB de RAM/VRAM combinados, lo que sugiere que con cuantizaciones bajas (Q4_K_M o similar) cabe en GPUs de consumo de 16-24 GB.
- GPUs recomendadas: RTX 4090 (24 GB) o superior para cuantizaciones Q4/Q5; A100 o H100 para cargas de trabajo con contexto largo o inferencia de alto rendimiento.
- Compatibilidad con GPUs de consumo: sí, con cuantizaciones adecuadas (Q4, Q5) puede ejecutarse en RTX 3090/4090, aunque el contexto máximo requerirá más memoria.
- Opciones de despliegue: llama.cpp, Ollama, vLLM, TGI, Unsloth Desktop, LM Studio. El formato GGUF es compatible con la mayoría de motores de inferencia local.
- Latencia y throughput: no se proporcionan datos específicos. La predicción multi-token (MTP) y la atención lineal (Gated DeltaNet) deberían reducir la latencia frente a modelos puramente basados en atención clásica, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Qwen3.8-27B es un modelo denso de 27B con visión y contexto largo, comparable en tamaño a otros modelos como Qwen3-32B o Llama 3.3 70B, pero sin cifras de rendimiento disponibles para establecer una comparación objetiva. Se recomienda consultar benchmarks oficiales de Qwen para una evaluación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible, pero como todo modelo entrenado con datos web, puede reflejar sesgos sociales y culturales presentes en el corpus.
- Riesgo de alucinación: al ser un modelo generativo, puede producir información falsa o inventada, especialmente en temas de nicho o cuando se le pide razonar más allá de sus datos de entrenamiento.
- Limitaciones de contexto: aunque soporta 262K tokens nativos, el rendimiento puede degradarse en contextos extremadamente largos sin escalado RoPE adecuado. La extensión a 1M requiere técnicas adicionales como YaRN.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es necesario cumplir con los términos de atribución y no utilizar marcas registradas sin permiso.
- Dependencia de cuantización: las versiones GGUF cuantizadas pueden presentar pérdidas de calidad frente al modelo original en tareas de precisión, especialmente en razonamiento matemático o generación de código complejo.
- Idiomas: no se ha confirmado oficialmente la lista de idiomas soportados; el rendimiento en idiomas distintos del inglés o chino puede ser inferior.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/manubc33/Qwen3.8-27B-GGUF
- Repositorio HuggingFace del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF oficial de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio GGUF de ggml-org: https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Guía de ejecución local en Yottalabs: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
