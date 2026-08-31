# Bing1148/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal multimodal (visión y texto) desarrollado por el equipo Qwen de Alibaba Cloud. Se trata de la generación más reciente de la familia Qwen open-source, construida sobre la base arquitectónica de Qwen3.5, e incorpora mejoras sustanciales en tareas de codificación, trabajo profesional, investigación y ejecución de agentes de largo horizonte. Con 27.781 millones de parámetros, es un modelo denso compacto que ofrece capacidades de razonamiento flexible (modo thinking activable o desactivable por petición) y comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.

El modelo destaca por su arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención clásica (Gated Attention), lo que le permite manejar una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000. Está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en entornos de producción. Su lanzamiento ha sido acompañado por soporte en múltiples plataformas de inferencia (vLLM, SGLang, Transformers, Groq, AMD) y por una versión alojada en Qwen Cloud con funcionalidades adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrido (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | No disponible (se esperan versiones GGUF, AWQ, GPTQ, etc., pero no se especifican en la información proporcionada) |
| Idiomas soportados | No disponible (la model card no especifica la lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso de 64 capas con una dimensión oculta de 5120. Su estructura interna sigue un patrón de 16 bloques, cada uno compuesto por 3 sub-bloques de atención lineal (Gated DeltaNet) seguidos de una capa feed-forward, y un sub-bloque final de atención clásica (Gated Attention) también seguido de feed-forward. La atención lineal utiliza 48 cabezas para el valor (V) y 16 para las claves/consultas (QK), con dimensión de cabeza 128. La atención clásica emplea 24 cabezas para consultas y 4 para claves/valores, con dimensión de cabeza 256 y rotación posicional (RoPE) de dimensión 64. La capa feed-forward tiene una dimensión intermedia de 17.408. El embedding de tokens es de 248.320 (con padding) y la salida LM también de 248.320.

El modelo ha sido entrenado en dos fases: pre-entrenamiento y post-entrenamiento. Incorpora la técnica de Multi-Token Prediction (MTP) con múltiples pasos, lo que mejora la eficiencia y la coherencia en la generación. El entrenamiento incluye datos multimodales (imagen y vídeo) además de texto, lo que le confiere capacidades de comprensión visual nativa. No se especifican detalles sobre el volumen total de tokens de entrenamiento ni sobre el uso de RLHF o DPO, aunque la presencia de modos de razonamiento controlables sugiere un post-entrenamiento orientado a instrucciones y agentes.

## Capacidades

- Generación de texto y razonamiento complejo, con modo "thinking" activado por defecto y desactivable por petición.
- Ajuste de la profundidad de razonamiento mediante el parámetro `reasoning_effort`.
- Comprensión de imágenes y vídeos, incluyendo diagramas STEM, documentos escaneados y vídeos de larga duración (hasta una hora).
- Soporte de tool calling y function calling, con integración en entornos de agentes.
- Ejecución de tareas agénticas de largo horizonte, con planificación autónoma y manejo de feedback del entorno.
- Capacidades multilingües (idiomas no especificados, pero se asume soporte amplio dado el origen del modelo).
- Retención del contexto de razonamiento histórico mediante `preserve_thinking`.
- Compatibilidad con múltiples frameworks de inferencia (Transformers, vLLM, SGLang, TokenSpeed, Groq, AMD).

## Casos de uso

- **Automatización de oficina**: el modelo puede procesar documentos, extraer información de tablas y gráficos, y generar resúmenes o informes, gracias a su comprensión visual y su contexto largo (262K tokens) que permite manejar documentos extensos completos.
- **Asistente de codificación en producción**: con soporte de tool calling y razonamiento agéntico, puede integrarse en pipelines de CI/CD para revisar código, generar tests, corregir errores y ejecutar comandos en terminales de forma autónoma.
- **Análisis de vídeo y vigilancia**: su capacidad de entender vídeos de hasta una hora lo hace adecuado para resumir contenido audiovisual, detectar eventos o transcribir diálogos en tiempo real.
- **Agente de investigación**: puede leer artículos científicos (incluyendo figuras y ecuaciones), razonar sobre ellos y redactar síntesis o responder preguntas complejas, manteniendo el contexto de múltiples documentos.
- **Atención al cliente multimodal**: puede gestionar conversaciones que incluyan capturas de pantalla, imágenes de productos o vídeos de problemas técnicos, combinando comprensión visual con diálogo multi-turno.
- **Desarrollo de agentes autónomos**: su capacidad de planificación a largo plazo y manejo de feedback del entorno lo hace idóneo para construir agentes que navegan por la web, interactúan con APIs y completan tareas de varios pasos.
- **Generación de documentación técnica**: puede transformar código, diagramas o especificaciones en documentación clara y estructurada, aprovechando su contexto largo y su comprensión de formatos visuales.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de benchmarks, pero los valores numéricos no están disponibles en la información proporcionada (la tabla está truncada). Se mencionan los siguientes benchmarks y modelos comparados:

| Benchmark | Qwen3.8-27B | Qwen3.6-27B | Qwen3.7-Plus | Muse Glimmer-30B | Opus4.6 Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 (Terminus) - Agentic terminal coding | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros benchmarks (no especificados) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han podido extraer los valores concretos de la tabla. Se recomienda consultar la model card original en Hugging Face para obtener los datos completos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 27B parámetros, en FP16 se requieren aproximadamente 54 GB de VRAM; en cuantización de 8 bits (~27 GB) y en 4 bits (~14 GB). Estas cifras son estimaciones orientativas.
- **GPU recomendadas**: para FP16 se necesitan GPUs de datacenter como A100 (80 GB) o H100 (80 GB). Con cuantización 8-bit puede ejecutarse en una RTX 4090 (24 GB) o similar. Con 4-bit podría caber en GPUs de 16 GB (por ejemplo, RTX 4080, L4).
- **Compatibilidad con consumer GPUs**: sí, con cuantización adecuada (4-bit u 8-bit) puede ejecutarse en GPUs de gama alta para consumidores (RTX 3090, RTX 4090).
- **Opciones de despliegue**: compatible con vLLM, SGLang, Transformers, TokenSpeed, llama.cpp (si se generan pesos GGUF), Ollama (si se publica), y plataformas gestionadas como Groq y AMD Ryzen AI Max.
- **Latencia y throughput**: no disponible. Se espera que en GPUs de datacenter ofrezca un throughput competitivo gracias a su arquitectura híbrida, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Apache 2.0 | Texto + visión | Modelo actual, mejoras en coding y agentes |
| Qwen3.6-27B | 27B | No disponible | Apache 2.0 | Texto + visión | Generación anterior, misma familia |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Modelo de pago (Plus) de la misma familia |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible | Modelo de otra familia, comparado en benchmarks |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | Modelo de otra familia, comparado en benchmarks |

La comparativa se basa únicamente en la información de la model card. No se dispone de datos detallados de los modelos alternativos.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se especifican en la información proporcionada. Como modelo entrenado con datos web, puede heredar sesgos sociales y culturales.
- **Riesgo de alucinación**: presente en todos los modelos generativos; se recomienda verificación de hechos en aplicaciones críticas.
- **Limitaciones de contexto**: aunque el contexto nativo es de 262K tokens, el rendimiento puede degradarse en los extremos de la ventana; la extensión a 1M puede requerir técnicas de interpolación posicional.
- **Idiomas**: no se especifica la lista de idiomas soportados; se asume un soporte amplio pero no garantizado para todos los idiomas.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener la atribución y no utilizar marcas registradas.
- **Caveats de producción**: el modo thinking activado por defecto puede aumentar la latencia; se recomienda ajustar `reasoning_effort` según el caso de uso. La integración con herramientas requiere configuración adicional.

## Enlaces

- [Hugging Face - Qwen/Qwen3.8-27B (oficial)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Hugging Face - Bing1148/Qwen3.8-27B (mirror)](https://huggingface.co/Bing1148/Qwen3.8-27B)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Blog AMD - Run Qwen 3.8 27B on AMD Ryzen AI Max y Radeon GPUs](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [GroqDocs - Qwen 3.8 27B](https://console.groq.com/docs/model/qwen/qwen3.8-27b)
- [Hugging Face Space - Qwen3.8-27B Free Endpoint](https://huggingface.co/spaces/victor/Qwen3.8-27B-free-endpoint)
