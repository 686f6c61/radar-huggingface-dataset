# karnodel/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal denso de 27 000 millones de parámetros, de tipo visión-lenguaje (image-text-to-text), desarrollado por el equipo Qwen de Alibaba Cloud. Se presenta como la generación más capaz de la familia abierta Qwen hasta la fecha, construido sobre la base arquitectónica de Qwen3.5 e incorporando mejoras sustanciales en tareas de codificación, trabajo profesional, investigación y ejecución de agentes de larga duración. El modelo está disponible en formato Hugging Face Transformers con pesos en safetensors y licencia Apache 2.0.

Su arquitectura combina capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention) en un patrón híbrido, e incluye un codificador de visión para comprender imágenes y vídeos. Ofrece una longitud de contexto nativa de 262 144 tokens, ampliable hasta 1 000 000, y un modo de pensamiento flexible que puede activarse o desactivarse por petición, con control fino del esfuerzo de razonamiento. Está pensado para ejecutarse en hardware local de gama media-alta, con soporte para vLLM, SGLang y TokenSpeed, y también está disponible como servicio gestionado en Groq y próximamente en Qwen Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida: Gated DeltaNet (linear attention) + Gated Attention (full attention) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en safetensors; se esperan cuantizaciones GGUF/AWQ de la comunidad) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que intercala dos tipos de atención. El layout oculto se organiza en 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de una capa de Feed-Forward Network (FFN), y un sub-bloque final de Gated Attention también seguido de FFN. La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión 256 y RoPE de 64 dimensiones. La dimensión oculta es 5120, con FFN de dimensión intermedia 17 408 y 64 capas en total. El modelo incluye Multi-Token Prediction (MTP), entrenado con múltiples pasos de predicción simultánea.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, aunque no se detallan los volúmenes de datos ni las técnicas de alineación específicas (RLHF/DPO). El modelo incorpora un codificador de visión que permite procesar imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración. El modo de pensamiento está activado por defecto y puede desactivarse por petición; el esfuerzo de razonamiento se ajusta mediante el parámetro `reasoning_effort`, y el contexto de razonamiento de mensajes históricos se conserva con `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo, con modo de pensamiento (thinking mode) activable o desactivable por petición.
- Comprensión de imágenes y vídeos: interpreta diagramas STEM, documentos escaneados, capturas de pantalla y vídeos de larga duración.
- Codificación avanzada: generación de código, depuración y refactorización, con soporte para tareas de terminal agénticas.
- Ejecución de agentes autónomos: planificación de múltiples pasos, manejo de retroalimentación del entorno y finalización fiable de tareas de larga duración.
- Tool calling y function calling: integrable en pipelines que requieren invocación de herramientas externas.
- Control flexible del razonamiento: ajuste del esfuerzo de razonamiento y conservación del contexto de pensamiento en conversaciones multi-turno.
- Capacidades multilingües: no especificadas oficialmente, aunque se espera cobertura amplia por la familia Qwen.

## Casos de uso

- Asistente de programación en producción: el modelo puede integrarse en entornos de desarrollo (IDE, CLI) para generar código, explicar fragmentos y proponer correcciones, aprovechando su contexto de 262K tokens para manejar repositorios completos.
- Automatización de tareas de oficina: procesamiento de documentos, generación de informes, resumen de actas y extracción de datos de tablas e imágenes, gracias a su capacidad de visión y razonamiento.
- Agente autónomo de investigación: puede planificar y ejecutar búsquedas web, leer documentos técnicos, extraer conclusiones y redactar resúmenes, manteniendo el contexto de razonamiento a lo largo de múltiples pasos.
- Análisis de vídeo para soporte técnico: procesamiento de grabaciones de pantalla o vídeos de demostración para diagnosticar errores de software o generar documentación paso a paso.
- Tutor virtual en educación STEM: explicación de problemas de matemáticas, física o ingeniería a partir de imágenes de enunciados o diagramas, con razonamiento paso a paso.
- Chatbot de atención al cliente con contexto largo: gestión de conversaciones multi-turno con historial extenso y comprensión de capturas de pantalla enviadas por el usuario, gracias a su ventana de contexto ampliable a 1M tokens.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativos con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los datos numéricos no están disponibles en la información proporcionada. El único benchmark identificado es "Terminal Bench 2.1 (Terminus)" para codificación agéntica en terminal, sin valores publicados. No se dispone de resultados completos de MMLU, HumanEval, GSM8K u otros estándares en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, aproximadamente 16-18 GB; con 8 bits, alrededor de 28-30 GB; en precisión completa (fp16/bf16), unos 55 GB.
- GPU recomendadas: RTX 4090 (24 GB) puede ejecutar el modelo con cuantización de 4 bits; A100 40 GB o H100 80 GB para inferencia sin cuantizar o con mayor margen.
- Compatible con hardware AMD: según el blog oficial de AMD, el modelo se ejecuta en procesadores AMD Ryzen AI Max y GPUs Radeon desde el día de lanzamiento.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang, TokenSpeed, y probablemente llama.cpp y Ollama mediante cuantizaciones comunitarias.
- Servicios gestionados: disponible en Groq con inferencia de baja latencia; próximamente en Qwen Cloud con contexto de 1M tokens por defecto.
- Latencia y throughput: no disponibles en la documentación; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Híbrida DeltaNet + Attention, visión-lenguaje | Apache 2.0 | Abierta (HF, vLLM, etc.) |
| Qwen3.6-27B | 27B | No disponible | Similar a Qwen3.5 | Apache 2.0 | Abierta |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible | Servicio propietario |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se basa únicamente en los datos disponibles; no se han publicado resultados de rendimiento que permitan una evaluación cuantitativa entre estos modelos.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en el corpus de entrenamiento.
- Riesgo de alucinación en tareas de razonamiento complejo o generación de código, especialmente cuando el contexto es ambiguo o la tarea excede las capacidades del modelo.
- La longitud de contexto de 1M tokens es una extensión posible, pero el rendimiento efectivo a esa escala puede degradarse; se recomienda validar en casos de uso reales.
- Los idiomas soportados no están especificados; aunque la familia Qwen suele cubrir múltiples lenguas, no hay garantía oficial para este modelo.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo puede tener limitaciones en cuanto a la atribución requerida.
- El repositorio en Hugging Face (karnodel/Qwen3.8-27B) no es el oficial; el repositorio canónico está en GitHub bajo AlibabaCloud-Official. Se recomienda verificar la procedencia de los pesos antes de su uso en producción.

## Enlaces

- Hugging Face (repositorio del autor): https://huggingface.co/karnodel/Qwen3.8-27B
- GitHub oficial: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de AMD sobre ejecución en Ryzen AI Max y Radeon: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Documentación de Groq: https://console.groq.com/docs/model/qwen/qwen3.8-27b
