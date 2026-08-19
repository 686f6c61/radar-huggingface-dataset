# SAMARA-IMPORT/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje causal con encoder de visión, desarrollado por Alibaba Qwen y distribuido en HuggingFace a través del repositorio SAMARA-IMPORT. Forma parte de la generación Qwen3.8, sucesora de las series Qwen3.5 y Qwen3.6, y está diseñado para tareas de codificación, trabajo profesional, investigación y ejecución agéntica de largo horizonte. Se trata de un modelo denso de 27.781 millones de parámetros con una arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención completa (Gated Attention), lo que le permite mantener una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.000.000.

El modelo integra comprensión visión-lenguaje nativa (imágenes y vídeos), control flexible del modo de razonamiento (thinking mode activado por defecto, desactivable por petición) y predicción multi-token (MTP). Su licencia Apache 2.0 permite uso comercial sin restricciones. El repositorio contiene pesos en formato safetensors (55,6 GB) compatibles con Transformers, vLLM, SGLang y TokenSpeed, lo que facilita su despliegue en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrido (Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 27.781.427.952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible a 1.000.000 |
| Tipos de cuantizacion | No disponible (pesos en safetensors FP16/BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que alterna bloques de atención lineal y atención completa. El layout interno es `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, con 64 capas en total. La capa Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128; la capa Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El FFN tiene dimensión intermedia de 17.408. El modelo incluye predicción multi-token (MTP) entrenada con múltiples pasos.

La etapa de entrenamiento comprende pre-training y post-training, pero no se han publicado datos específicos sobre el número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) en la información disponible. El modelo incorpora un control flexible del razonamiento: el modo thinking está activado por defecto, puede desactivarse por petición, la profundidad se ajusta con `reasoning_effort` y el contexto de razonamiento histórico se conserva con `preserve_thinking`.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras sustanciales en codificación, trabajo profesional e investigación.
- Comprensión visión-lenguaje nativa: interpreta imágenes, diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Ejecución agéntica: planificación autónoma y manejo de feedback del entorno para tareas multi-paso de largo horizonte.
- Control flexible del modo de razonamiento: thinking mode activable/desactivable por petición, con ajuste de profundidad (`reasoning_effort`) y preservación del contexto de razonamiento (`preserve_thinking`).
- Soporte de tool calling y function calling (implícito en las capacidades agénticas, aunque no se detalla en la model card).
- Compatibilidad downstream amplia: funciona con Transformers, vLLM, SGLang y TokenSpeed.
- Capacidades multilingües no especificadas en la información proporcionada.

## Casos de uso

- Asistente de codificación agéntico en terminal: el modelo puede ejecutar tareas de codificación de extremo a extremo, planificando pasos, evaluando resultados y corrigiendo errores de forma autónoma, gracias a su soporte de razonamiento multi-paso y manejo de feedback del entorno.
- Generación y revisión de código en producción: con su contexto de 262K tokens, puede analizar repositorios completos, generar parches y validar cambios antes de integrarlos en pipelines de CI/CD.
- Análisis de documentos técnicos y científicos: la comprensión de imágenes y diagramas STEM permite extraer información de papers, informes y esquemas, combinando texto y figuras en un único flujo de razonamiento.
- Automatización de atención al cliente con contexto largo: puede mantener conversaciones multi-turno extensas, recordando el historial completo y el contexto de razonamiento previo, lo que mejora la coherencia en interacciones prolongadas.
- Análisis de vídeo de larga duración: con soporte nativo de vídeo de hasta una hora, es adecuado para resumir grabaciones de reuniones, vigilancia o contenido educativo.
- Investigación y redacción asistida: el modo de razonamiento profundo permite estructurar argumentos, revisar literatura y generar borradores con control sobre el nivel de elaboración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de rendimiento comparativa (con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max) para tareas como Terminal Bench 2.1 (Terminus), pero los valores numéricos no están accesibles en el extracto proporcionado. Se recomienda consultar la documentación oficial de Qwen Cloud para datos actualizados.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización 4-bit (GGUF) aproximadamente 14-16 GB; con 8-bit entre 28-30 GB; en FP16/BF16 nativo unos 55-56 GB (el repositorio ocupa 55,6 GB).
- GPUs recomendadas: para FP16 se necesitan A100 80GB, H100 80GB o dos RTX 4090 en paralelo; con cuantización 4-bit cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Compatibilidad con GPU de consumo: sí, con cuantización 4-bit u 8-bit en GPUs de 24 GB.
- Opciones de despliegue: Transformers, vLLM, SGLang, TokenSpeed; también compatible con llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repositorio).
- Latencia y throughput: no disponible en la información proporcionada; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Tipo |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K (ext. 1M) | Apache 2.0 | Denso, visión-lenguaje |
| Qwen3.6-27B | 27B | No disponible | No disponible | Denso, visión-lenguaje |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible |

No se dispone de datos suficientes sobre Qwen3.6-27B, Qwen3.7-Plus y Muse Glimmer-30B para una comparación técnica rigurosa. La model card los menciona como referencias en benchmarks, pero sin valores numéricos accesibles.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones idiomáticas en la información disponible.
- El repositorio es un import de SAMARA-IMPORT, no el repositorio oficial de Qwen; se recomienda verificar la autenticidad de los pesos antes de usar en producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo original de Qwen para confirmar restricciones adicionales.
- El contexto de 262K tokens nativo es amplio, pero la extensión a 1M tokens puede requerir técnicas de interpolación posicional y hardware específico.
- No se especifican los idiomas soportados; la calidad multilingüe puede variar respecto a otros modelos de Qwen.
- El modo thinking activado por defecto incrementa el coste computacional por petición; es necesario desactivarlo explícitamente para tareas simples.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SAMARA-IMPORT/Qwen3.8-27B
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Documentación del modelo Qwen3.8-27B en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-27b
