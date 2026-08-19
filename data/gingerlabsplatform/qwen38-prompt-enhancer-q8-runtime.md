# GingerLabsPlatform/qwen38-prompt-enhancer-q8-runtime

## Resumen

Este repositorio es un mirror de despliegue inmutable creado por GingerLabsPlatform para su worker de mejora de prompts (prompt-enhancer) en Runpod. No es un modelo original, sino una copia byte-idéntica de los artefactos GGUF del modelo base HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, que a su vez deriva de la serie Qwen3.8 de Alibaba. El repositorio incluye únicamente la cuantización Q8_K_P del modelo de 27B, un sidecar FastMTP con vocabulario de draft de 32K para decodificación especulativa, y un proyector de visión BF16 que se conserva para un posible uso futuro de captioning de imágenes, aunque el worker actual es exclusivamente de texto.

La relevancia de este mirror radica en su propósito operativo: al omitir todas las demás cuantizaciones, Runpod Cached Models no prepara archivos innecesarios, lo que reduce el tiempo de arranque y el uso de almacenamiento en entornos de despliegue. El modelo base Qwen3.8-27B es un LLM denso de 27B parámetros con ventana de contexto nativa de 262K tokens, diseñado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte, con capacidades de razonamiento configurables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (serie Qwen3.8) con proyector de visión |
| Parámetros totales | 27B (modelo base); artefactos del repo: 1.863.907.840 (~1.86B) en safetensors |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (nativo del modelo base); sidecar FastMTP con vocabulario de draft de 32K |
| Tipos de cuantización | Q8_K_P (única incluida en el mirror) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta multilingüe, pero no se especifica la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_K_P), safetensors (proyector de visión BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros, parte de la serie Qwen3.8 de Alibaba que incluye Qwen3.5, Qwen3.6 y Qwen3.8. Es un modelo multimodal (visión-lenguaje) con razonamiento configurable y una ventana de contexto nativa de 262K tokens. El repositorio mirror no aporta información sobre el entrenamiento específico, pero se sabe que la serie Qwen3.8 está optimizada para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte.

La innovación técnica destacable en este mirror es el sidecar FastMTP (Multi-Token Prediction), que utiliza un vocabulario de draft de 32K tokens para acelerar la generación mediante decodificación especulativa. El nombre "32K" se refiere al tamaño del vocabulario de draft, no a la longitud de contexto de servicio. El proyector de visión BF16 está incluido pero no se utiliza en el worker actual, que es solo de texto.

## Capacidades

- Generación de texto, razonamiento, código y matemáticas, heredadas del modelo base Qwen3.8-27B.
- Soporte de tool calling y function calling, característico de la serie Qwen3.8.
- Capacidades agénticas de largo horizonte, con razonamiento multi-paso.
- Multilingüe (el modelo base soporta varios idiomas, aunque no se detalla la lista).
- Decodificación especulativa mediante FastMTP con vocabulario de draft de 32K, que reduce la latencia de generación.
- El worker actual es solo texto; el proyector de visión está retenido para un posible uso futuro de captioning de imágenes, pero no está activo.

## Casos de uso

- Mejora de prompts para generación de imágenes (T2I): el modelo puede reformular y enriquecer descripciones de texto para que los modelos de difusión produzcan resultados más precisos y detallados, similar al enfoque de RebelsPromptEnhancer.
- Mejora de prompts para generación de vídeo (T2V): amplía descripciones cortas en guiones detallados que los modelos de vídeo puedan interpretar correctamente.
- Optimización de prompts para edición de imágenes: convierte instrucciones vagas en comandos estructurados y accionables para pipelines de edición.
- Preprocesamiento de prompts para agentes autónomos: normaliza y enriquece las instrucciones de usuario antes de pasarlas a un agente de largo horizonte, mejorando la tasa de éxito en tareas multi-paso.
- Asistente de escritura creativa: genera variaciones de prompts para campañas de marketing, guiones o narrativas, aprovechando la capacidad de razonamiento del modelo base.
- Despliegue en entornos Runpod con caché de modelos: al ser un mirror inmutable con solo los artefactos necesarios, es adecuado para workers serverless que requieren arranque rápido y uso eficiente de almacenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento del modelo ni comparativas con otras alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 27B en cuantización Q8_K_P requiere aproximadamente 27-30 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache. Se recomienda una GPU con al menos 32 GB de VRAM para una inferencia cómoda.
- GPU recomendadas: A100 40GB, A100 80GB, H100 80GB, RTX 4090 24GB (con offloading de capas a CPU si es necesario), RTX 6000 Ada 48GB.
- En consumer GPU: la RTX 4090 (24GB) puede ejecutar el modelo con cuantización Q8_K_P si se usa offloading parcial, pero la experiencia será limitada por la memoria. GPUs con menos de 24GB no son recomendables.
- Opciones de despliegue: el mirror está diseñado para Runpod Cached Models, pero los artefactos GGUF son compatibles con llama.cpp, Ollama, vLLM y TGI si se configuran adecuadamente.
- Latencia y throughput: no disponibles. La decodificación especulativa con FastMTP debería reducir la latencia por token en comparación con la generación autoregresiva estándar, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Uso principal |
|---|---|---|---|---|---|
| GingerLabsPlatform/qwen38-prompt-enhancer-q8-runtime | 27B (base) | 262K | Q8_K_P | Apache-2.0 | Prompt enhancer en Runpod |
| Qwen/Qwen3-8B | 8B | 32K (típico) | Múltiples | Apache-2.0 | LLM general, menor VRAM |
| RealRebelAI/RebelsPromptEnhancer (Qwen 3.5-4b GGUF) | ~4B | No disponible | GGUF | No especificada | Prompt enhancer para LOW VRAM |

La comparativa es cualitativa: el modelo de GingerLabs es significativamente más grande (27B vs 8B o 4B), lo que implica mayor calidad de razonamiento pero también mayores requisitos de hardware. El mirror de GingerLabs está especializado para un caso de uso concreto (prompt enhancement en Runpod), mientras que Qwen3-8B es un modelo generalista. RebelsPromptEnhancer está orientado a usuarios con GPUs de baja VRAM, sacrificando capacidad por accesibilidad.

## Limitaciones y advertencias

- El worker es solo texto: a pesar de incluir el proyector de visión BF16, no se utiliza para procesar imágenes en la versión actual.
- El contexto de servicio no es de 32K tokens: el "32K" del sidecar FastMTP se refiere al vocabulario de draft, no a la longitud de contexto efectiva. El contexto real es el del modelo base (262K tokens).
- No hay información sobre sesgos o alucinaciones específicas de este mirror. Al ser una copia del modelo base, hereda las limitaciones de Qwen3.8-27B, que no están documentadas en este repositorio.
- Es un mirror de despliegue, no un modelo original: cualquier actualización o corrección del modelo base debe propagarse manualmente desde el upstream (HauhauCS).
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar el archivo `THIRD_PARTY_NOTICES.md` y `LICENSE` antes de redistribuir, según indica la model card.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto interno de GingerLabsPlatform más que un modelo de uso general.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GingerLabsPlatform/qwen38-prompt-enhancer-q8-runtime
- Modelo base upstream: https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Serie Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Qwen3-8B en HuggingFace: https://huggingface.co/Qwen/Qwen3-8B
- RebelsPromptEnhancer en GitHub: https://github.com/RealRebelAI/RebelsPromptEnhancer
