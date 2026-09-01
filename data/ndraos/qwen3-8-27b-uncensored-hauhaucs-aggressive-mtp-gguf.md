# ndraos/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP es una variante GGUF del modelo Qwen3.8-27B de Alibaba, modificada por el usuario HauhauCS (y redistribuida por ndraos) con un perfil de "uncensoring" agresivo que elimina los rechazos y reduce los preámbulos en respuestas a prompts difíciles. El modelo base es un transformer denso de 27.000 millones de parámetros con arquitectura híbrida (48 capas Gated DeltaNet y 16 capas de atención gated), visión integrada y contexto nativo de 262.144 tokens, extensible hasta 1.000.000. Esta versión GGUF conserva la cabeza NextN nativa y añade un sidecar FastMTP que acelera la decodificación especulativa hasta 3,02x en documentos y 1,93x en razonamiento frente a la versión sin MTP.

La relevancia de este modelo radica en combinar un tamaño manejable (27B) con capacidades multimodales (imagen y vídeo), razonamiento, tool calling y una ventana de contexto muy amplia, todo ello en formato GGUF listo para ejecutarse en hardware de consumo con llama.cpp, LM Studio u Ollama. El perfil "Aggressive" está pensado para usuarios que priorizan respuestas directas y sin filtros, aunque el propio autor advierte que para tareas agénticas de larga duración es preferible una variante "Balanced" si está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: 48 capas Gated DeltaNet + 16 capas gated-attention, con encoder de visión |
| Parametros totales | 27.000 millones (dato del modelo base; el repo safetensors indica 1.863.907.840, que corresponde a un subconjunto o al projector) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto), BF16 para el proyector de visión, sidecar FastMTP en GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina 48 capas con Gated DeltaNet (una variante de atención lineal con compuertas) y 16 capas de atención gated tradicional. Esta mezcla busca equilibrar eficiencia computacional y capacidad de modelado de dependencias largas. El vocabulario está ampliado a 248.320 tokens (padded) y el tamaño oculto es de 5.120 con FFN de 17.408. El modelo incluye un encoder de visión que permite entrada de imágenes y vídeo, manteniendo el pipeline image-text-to-text.

La variante "Uncensored" de HauhauCS se obtiene mediante un ajuste fino (LoRA) sobre el modelo base, orientado a reducir la tasa de rechazos. Según la model card, el modelo pasa de 465 rechazos a 0 en el conjunto de pruebas utilizado. El perfil "Aggressive" elimina además los preámbulos y las respuestas indirectas. No se han publicado detalles sobre el dataset de entrenamiento del ajuste fino, ni sobre el número de tokens o el método exacto (RLHF, DPO, etc.). La cuantización K_P es una personalización de HauhauCS que preserva la calidad en capas críticas mediante análisis específico del modelo, con un incremento de tamaño del 5-15% respecto a la cuantización base.

## Capacidades

- Generación de texto y razonamiento multi-step, incluyendo modos de pensamiento (thinking) si el modelo base los soporta.
- Razonamiento matemático y lógico, con mejoras de velocidad en tareas de razonamiento gracias al sidecar FastMTP (hasta 1,93x de tokens generados por segundo).
- Generación de código y soporte de tool calling / function calling, heredado del modelo base Qwen3.8-27B.
- Capacidades agénticas: puede encadenar llamadas a herramientas y mantener contexto largo (262K tokens nativos).
- Multimodal: entrada de imágenes y vídeo a través del proyector BF16 separado (mmproj). El modelo puede describir, analizar y razonar sobre contenido visual.
- Multilingüe: inglés, chino y otros idiomas, con especial solvencia en los dos primeros.
- Decodificación especulativa: la cabeza NextN nativa y el sidecar FastMTP permiten acelerar la generación sin pérdida de calidad.
- Perfil "Aggressive": respuestas directas, sin rechazos y sin preámbulos en prompts difíciles.

## Casos de uso

- Asistente de atención al cliente sin filtros: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens) y responder directamente a quejas o consultas complejas sin evasivas, gracias a su perfil agresivo y a la ventana de contexto amplia.
- Generación de código en producción: con tool calling y soporte de agentes, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar código, manteniendo el contexto de repositorios extensos.
- Análisis de documentos extensos: su contexto de 262K tokens permite procesar libros técnicos, contratos o informes completos en una sola pasada, resumiendo o extrayendo información sin segmentar.
- Razonamiento matemático y científico: el modelo base tiene buen rendimiento en GSM8K y tareas similares; la variante agresiva acelera la generación de cadenas de razonamiento, útil para asistentes de investigación.
- Análisis de imágenes y vídeo: gracias al proyector de visión, puede describir imágenes, transcribir texto en capturas, o analizar vídeos (si el runtime lo soporta), por ejemplo para moderación de contenido o accesibilidad.
- Chat sin censura para escritura creativa o roleplay: el perfil "Aggressive" elimina los rechazos, permitiendo generar contenido adulto o controvertido sin restricciones, aunque con los riesgos éticos asociados.
- Despliegue en hardware de consumo: con cuantizaciones Q4_K_P (17,92 GB) o IQ4_XS (15,71 GB), cabe en GPUs de 24 GB como la RTX 3090/4090, permitiendo ejecutar un modelo de 27B multimodal localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante "Uncensored-Aggressive" en la información disponible. La model card solo reporta métricas de velocidad de generación:

| Métrica | Valor |
|---|---|
| Aceleración TG en documentos (FastMTP vs sin MTP) | Hasta 3,02x |
| Aceleración TG en razonamiento (FastMTP vs sin MTP) | Hasta 1,93x |
| Mejora TG en documentos (FastMTP vs MTP embebido) | Hasta 35,2% |
| Mejora TG en razonamiento (FastMTP vs MTP embebido) | Hasta 21,1% |
| Tasa de rechazos | 0/465 (frente a 465/465 en el modelo base) |

Los benchmarks del modelo base Qwen3.8-27B (MMLU, HumanEval, GSM8K, etc.) no se han replicado públicamente para esta variante, por lo que no se pueden ofrecer cifras fiables.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, entre 10,32 GB (IQ2_M) y 31,46 GB (Q8_K_P). Para uso cómodo con contexto largo, se recomienda al menos 24 GB de VRAM.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones Q4_K_P o inferiores; A100 40/80 GB o H100 para Q8_K_P y contexto máximo.
- En consumer GPU: sí, cabe en RTX 3090/4090 con cuantizaciones Q4 o inferiores, y en GPUs de 16 GB (como RTX 4080) con IQ3 o Q2, aunque con pérdida de calidad.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama, text-generation-webui, y cualquier runtime compatible con GGUF. Para el sidecar FastMTP se requiere una compilación reciente de llama.cpp que soporte MTP.
- Latencia y throughput: no se han publicado cifras exactas, pero el sidecar FastMTP promete hasta 3x de tokens por segundo en documentos y 1,93x en razonamiento frente a la versión sin MTP, siempre que el hardware y el runtime lo soporten.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | safetensors | Modelo original de Alibaba, sin perfil uncensored |
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP (este) | 27B | 262K | Apache 2.0 | GGUF | Variante uncensored con FastMTP y cuantizaciones K_P |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 License | safetensors/GGUF | Más pequeño, menos capaz en razonamiento y visión |
| Mistral Small 3.1 24B | 24B | 128K | Apache 2.0 | safetensors/GGUF | Similar en tamaño, sin visión, contexto menor |

La comparativa directa con otros modelos de 27B es limitada porque Qwen3.8-27B es relativamente nuevo y no hay muchas alternativas de ese tamaño con visión y contexto tan largo. La principal diferencia de esta variante es el perfil de comportamiento (sin rechazos) y la aceleración MTP, que no alteran las capacidades base.

## Limitaciones y advertencias

- El perfil "Aggressive" elimina los rechazos y los preámbulos, lo que puede generar respuestas ofensivas, ilegales o éticamente problemáticas. No es adecuado para aplicaciones comerciales donde se requiera moderación de contenido.
- El autor advierte que para tareas agénticas de larga duración y fiabilidad crítica, es preferible una variante "Balanced" si está disponible; el perfil agresivo puede degradar la calidad en escenarios que requieren matices.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.) para esta variante, por lo que no se puede verificar si el ajuste fino ha degradado el rendimiento respecto al modelo base.
- El sidecar FastMTP requiere un runtime compatible con MTP (llama.cpp reciente); si no se usa, el modelo funciona sin aceleración pero conserva la cabeza NextN nativa.
- La cuantización K_P puede mostrar un "?" en LM Studio, aunque es un problema de visualización y el modelo carga correctamente.
- El modelo base tiene sesgos potenciales heredados de los datos de entrenamiento de Qwen; el ajuste fino "uncensored" no elimina sesgos, solo reduce los rechazos.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado sin moderación puede acarrear responsabilidades legales en ciertos contextos.
- El tamaño del repositorio (172,5 GB) incluye todas las cuantizaciones; es necesario descargar solo el archivo GGUF deseado, no todo el repo.

## Enlaces

- Repositorio HuggingFace (ndraos): https://huggingface.co/ndraos/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio original (HauhauCS): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Discusiones del modelo: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF/discussions
- Guía de ejecución local (orcarouter): https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Página del modelo en local-ai-zone: https://local-ai-zone.github.io/models/qwen3-8-27b-uncensored-hauhaucs-aggressive-mtp.html
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord de HauhauCS: https://discord.gg/SZ5vacTXYf
