# BrainForge/Ministral-3-8B-Reasoning-2512

## Resumen

Ministral 3 8B Reasoning 2512 es la variante de razonamiento post-entrenada del modelo Ministral 3 8B de Mistral, disponible en este repositorio a través del usuario BrainForge. Combina un modelo de lenguaje de 8.4B parámetros con un codificador de visión de 0.4B parámetros, lo que le permite procesar tanto texto como imágenes. Está diseñado específicamente para tareas de razonamiento complejo, matemáticas, código y dominios STEM, manteniendo la eficiencia necesaria para despliegue en el edge.

El modelo hereda las capacidades de la familia Ministral 3: ventana de contexto de 256k tokens, soporte para 12 idiomas, función de llamada nativa y salida JSON, y adherencia a system prompts. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones, lo que lo convierte en una opción atractiva para integración en productos. El repositorio se publicó el 19 de agosto de 2026 y usa vLLM como librería de inferencia, con pesos en formato safetensors (35.7 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador de vision de 0.4B) |
| Parametros totales | 8.8B (8.4B LM + 0.4B vision encoder) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens |
| Tipos de cuantizacion | BF16 (por defecto), GGUF (disponible en repositorio separado) |
| Idiomas soportados | Ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano, arabe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Ministral 3 8B Base 2512, un transformer denso multimodal que integra un modelo de lenguaje de 8.4B parámetros con un codificador de visión de 0.4B parámetros. La variante Reasoning ha sido post-entrenada específicamente para tareas de razonamiento multi-step, optimizando su rendimiento en matemáticas, código y problemas científicos. No se han publicado detalles sobre el dataset de entrenamiento ni el proceso de post-entrenamiento (si se usó RLHF, DPO u otro método) en la información disponible. El modelo mantiene las capacidades del modelo base, incluyendo la ventana de contexto de 256k y el soporte multilingüe, y está optimizado para despliegue en edge, pudiendo ejecutarse en hardware con 24GB de VRAM en BF16 o menos de 12GB cuantizado.

## Capacidades

- Razonamiento multi-step: el modelo sobresale en tareas que requieren cadenas de razonamiento complejas, como matemáticas, programación y resolución de problemas científicos.
- Visión: puede analizar imágenes y proporcionar información sobre su contenido visual, además del texto. Se recomienda mantener un ratio de aspecto cercano a 1:1 en las imágenes para un rendimiento óptimo.
- Función calling nativa y salida JSON: soporta la invocación de herramientas y la generación de salidas estructuradas en JSON, facilitando su integración en sistemas agénticos.
- Multilingüe: soporta 12 idiomas, incluyendo español, francés, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe, además del inglés.
- Adherencia a system prompts: mantiene una fuerte adherencia a las instrucciones del sistema, lo que permite definir entornos y casos de uso claros.
- Agéntico: capacidades nativas para uso en agentes, con soporte para multi-turno y razonamiento dinámico.
- Edge-optimized: diseñado para ejecutarse en hardware de bajos recursos, con posibilidad de despliegue local en 24GB de VRAM en BF16 o menos de 12GB cuantizado.

## Casos de uso

- **Asistente local diario**: el modelo puede ejecutarse en hardware de consumo (24GB VRAM en BF16) para servir como asistente personal de IA, gestionando conversaciones multi-turno con contexto largo gracias a su ventana de 256k tokens.
- **Análisis de imágenes y documentos**: la capacidad de visión permite describir y comprender imágenes, escanear documentos y extraer información visual en entornos con recursos limitados.
- **Traducción y generación de contenido multilingüe**: con soporte para 12 idiomas, puede traducir textos y generar contenido en varios idiomas, adecuado para equipos internacionales.
- **Agentes especializados**: la función calling nativa y la salida JSON permiten construir agentes que interactúan con APIs, bases de datos o herramientas externas, con razonamiento multi-step para planificar acciones.
- **Razonamiento matemático y científico**: en entornos educativos o de investigación, el modelo puede resolver problemas matemáticos, explicar conceptos científicos y asistir en la resolución de ejercicios.
- **Fine-tuning para dominios específicos**: la licencia Apache 2.0 permite ajustar el modelo para tareas verticales, como atención al cliente, diagnóstico técnico o análisis financiero, partiendo de una base de razonamiento sólida.
- **Despliegue en edge en dispositivos embebidos**: su optimización para edge permite ejecutarlo en dispositivos con memoria limitada, como portátiles, mini-PCs o sistemas integrados, para aplicaciones de IA local.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks de la familia Ministral 3, pero solo con datos del modelo de 14B. No se han publicado resultados específicos para la variante de 8B en la información disponible. La tabla de referencia de la familia es:

| Modelo | AIME25 | AIME24 | GPQA Diamond | LiveCodeBench |
|---|---|---|---|---|
| Ministral 3 14B | 0.850 | 0.898 | 0.712 | 0.646 |
| Qwen3-14B (Thinking) | 0.737 | 0.837 | 0.663 | 0.593 |

No se han publicado resultados de benchmarks específicos para Ministral 3 8B en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: 24GB en BF16 para inferencia; menos de 12GB de RAM/VRAM cuando se cuantiza.
- **GPU recomendadas**: RTX 4090 (24GB) para BF16; GPUs de 12GB o menos (como RTX 3060 o RTX 4070) para versiones cuantizadas.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de consumo con 24GB de VRAM en BF16, y en GPUs de 12GB si se cuantiza.
- **Opciones de despliegue**: vLLM (librería oficial), llama.cpp, Ollama, TGI (Text Generation Inference), y otras herramientas compatibles con GGUF.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

La comparativa se basa en la tabla de la familia Ministral 3 y en los datos disponibles. No se dispone de comparativas directas con otros modelos del mismo tamaño (8B) en la información proporcionada. La comparativa con el modelo hermano 14B y Qwen3-14B (Thinking) se muestra en la tabla de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Rendimiento (AIME25) |
|---|---|---|---|---|
| Ministral 3 8B Reasoning | 8.4B + 0.4B | 256k | Apache 2.0 | No disponible |
| Ministral 3 14B Reasoning | ~14B | 256k | Apache 2.0 | 0.850 |
| Qwen3-14B (Thinking) | 14B | 256k | Apache 2.0 | 0.737 |

No se dispone de datos de rendimiento del 8B para una comparativa directa con otros modelos de 8B como Llama 3.1 8B o Qwen2.5-7B.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se han documentado sesgos específicos en la información disponible, pero como modelo entrenado con datos web, puede reflejar sesgos presentes en los datos de entrenamiento.
- **Riesgo de alucinación**: en tareas de razonamiento, el modelo puede generar razonamientos plausibles pero incorrectos; se recomienda verificar las salidas en casos de uso críticos.
- **Limitaciones de contexto**: aunque la ventana es de 256k tokens, el coste computacional y la latencia aumentan con la longitud del contexto, y el rendimiento puede degradarse con contextos muy largos.
- **Idiomas**: solo soporta los 12 idiomas listados; el rendimiento puede variar entre idiomas, con un mejor desempeño en inglés.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base proviene de Mistral, que puede tener condiciones adicionales en el uso de la marca (no se detallan en la información).
- **Repositorio de terceros**: este repositorio es de BrainForge, no el oficial de Mistral AI. Se recomienda verificar la integridad de los pesos y utilizar el repositorio oficial de Mistral AI para producción.
- **Recomendaciones de despliegue**: para agentes, se recomienda limitar el número de herramientas y mantener las trazas de razonamiento en el contexto; para visión, se recomienda usar imágenes con ratio de aspecto cercano a 1:1.

## Enlaces

- Repositorio de HuggingFace (BrainForge): https://huggingface.co/BrainForge/Ministral-3-8B-Reasoning-2512
- Repositorio oficial de HuggingFace (Mistral AI): https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512
- Version GGUF oficial: https://huggingface.co/mistralai/Ministral-3-8B-Reasoning-2512-GGUF
- Documentacion de Mistral: https://docs.mistral.ai/models/ministral-3-8b-25-12
- Paper del modelo: https://arxiv.org/abs/2601.08584
- Blog de Mistral: https://mistral.ai/news/mistral-3
- Recetas vLLM: https://recipes.vllm.ai/mistralai/Ministral-3-8B-Reasoning-2512
