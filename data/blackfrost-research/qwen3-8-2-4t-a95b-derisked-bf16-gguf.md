# Blackfrost-Research/Qwen3.8-2.4T-A95B-DERISKED-BF16-GGUF

## Resumen

El modelo **Blackfrost-Research/Qwen3.8-2.4T-A95B-DERISKED-BF16-GGUF** es una versión cuantizada en formato GGUF del modelo base homónimo, que a su vez deriva del **Qwen3.8-2.4T-A95B** de Alibaba, el primer modelo de la clase Qwen-Max con pesos abiertos. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 2,4 billones de parámetros totales y 95 mil millones de parámetros activos por token, diseñado para tareas de generación de texto, razonamiento, código y trabajo de larga duración. La variante "DERISKED" indica un proceso de abliteración o eliminación de comportamientos de riesgo, y el acceso está restringido (gated) en HuggingFace.

La relevancia de este modelo radica en que es uno de los primeros de su clase en abrir sus pesos, lo que permite a investigadores y desarrolladores explorar arquitecturas MoE a escala extrema. La versión GGUF facilita su despliegue en entornos con recursos limitados mediante cuantización, aunque el tamaño total sigue siendo enorme. La licencia Apache 2.0 permite uso comercial, pero el acceso gated requiere aceptación de condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con Gated DeltaNet (linear attention) y Gated Attention (full attention cada 4 capas) |
| Parametros totales | 2,4 billones (2.4T) |
| Parametros activos | 95 mil millones (95B) por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes no especificadas; el nombre indica BF16 como base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-2.4T-A95B emplea una arquitectura MoE con 512 expertos enrutados, de los cuales 10 se activan por token junto con un experto compartido, sumando 95B parámetros activos. La columna vertebral tiene 92 capas que intercalan atención lineal Gated DeltaNet con atención completa Gated Attention, aplicando atención completa en cada cuarta capa. Esta combinación busca equilibrar eficiencia computacional y capacidad de razonamiento de largo alcance.

La versión "DERISKED" ha sido sometida a un proceso de abliteración (abliteration) para eliminar comportamientos considerados de riesgo, aunque no se han publicado detalles sobre el método exacto ni sobre los datos de entrenamiento. El modelo original de Alibaba se entrenó con un enfoque de mejora integral en tareas de codificación, trabajo, investigación y tareas de horizonte largo, pero no se dispone de información específica sobre el volumen de tokens, composición del dataset o uso de RLHF/DPO en esta variante.

## Capacidades

- Generación de texto y razonamiento complejo, con mejoras declaradas en tareas de codificación, trabajo, investigación y tareas de horizonte largo.
- Soporte de arquitectura MoE con 95B parámetros activos, lo que permite un rendimiento elevado por token con coste computacional reducido frente a un modelo denso equivalente.
- Capacidad de manejar contextos largos gracias a la combinación de atención lineal y atención completa, aunque la longitud exacta de contexto no está especificada en la información disponible.
- Al ser una versión "de-risked", se espera una reducción de comportamientos no deseados, aunque no se detallan las capacidades específicas resultantes.
- No se confirma soporte explícito de tool calling, agentes o multimodalidad en la información proporcionada.

## Casos de uso

- **Investigación en arquitecturas MoE a gran escala**: el modelo permite estudiar el comportamiento de 2,4T parámetros con 95B activos, ideal para laboratorios con infraestructura de múltiples GPUs.
- **Generación de código en entornos de alto rendimiento**: su mejora declarada en codificación lo hace adecuado para asistentes de programación en empresas con clústeres dedicados.
- **Análisis de documentos extensos**: la combinación de atención lineal y completa podría soportar ventanas de contexto largas, aunque no se ha confirmado la longitud exacta.
- **Prototipado de aplicaciones de razonamiento multi-paso**: su capacidad de razonamiento complejo puede aplicarse a sistemas de pregunta-respuesta avanzados.
- **Evaluación de técnicas de abliteración**: la variante DERISKED sirve como caso de estudio para medir el impacto de la eliminación de comportamientos de riesgo en modelos de gran tamaño.
- **Despliegue en entornos con cuantización GGUF**: la versión GGUF permite probar el modelo en hardware más modesto mediante cuantización, aunque el tamaño total sigue requiriendo recursos considerables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene 2,4T parámetros totales; incluso con cuantización GGUF, el tamaño del archivo es del orden de 1,5 TB (según la página de descarga de 29 partes), lo que requiere almacenamiento masivo.
- Para inferencia en BF16, se necesitarían aproximadamente 4,8 TB de VRAM, lo que implica un clúster de GPUs de alta gama (A100 80GB, H100 80GB o similares) con múltiples nodos.
- Con cuantización GGUF de 4 bits, la VRAM estimada rondaría 1,2 TB, aún fuera del alcance de una sola GPU consumer (RTX 4090 tiene 24 GB).
- No cabe en GPUs de consumo; se requiere infraestructura de centro de datos.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si soporta GGUF), TGI, aunque la viabilidad práctica depende de la memoria disponible.
- Latencia y throughput no disponibles; se espera que sea bajo para tareas interactivas dado el tamaño.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos en la información proporcionada. El modelo se posiciona en la categoría de MoE extremadamente grandes, similar a otros como DeepSeek-V3 (671B totales, 37B activos) o Mixtral 8x22B (141B totales, 39B activos), pero con un tamaño muy superior. No se pueden ofrecer comparaciones de rendimiento sin benchmarks publicados.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace antes de descargar.
- Tamaño extremo: inviable para la mayoría de entornos de producción sin infraestructura de alto coste.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones de idioma; al ser una versión abliterada, puede presentar comportamientos atípicos en ciertos dominios.
- La licencia Apache 2.0 permite uso comercial, pero el acceso gated puede imponer restricciones adicionales.
- La cuantización GGUF puede degradar ligeramente la calidad frente al modelo BF16 original.
- No se confirma la longitud de contexto, lo que limita la planificación de despliegues.

## Enlaces

- [HuggingFace - Blackfrost-Research/Qwen3.8-2.4T-A95B-DERISKED-BF16-GGUF](https://huggingface.co/Blackfrost-Research/Qwen3.8-2.4T-A95B-DERISKED-BF16-GGUF)
- [HuggingFace - Qwen/Qwen3.8-2.4T-A95B (modelo base original)](https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B)
- [HuggingFace - unsloth/Qwen3.8-2.4T-A95B-GGUF (otra versión GGUF)](https://huggingface.co/unsloth/Qwen3.8-2.4T-A95B-GGUF)
- [OpenLM.ai - Qwen3.8](https://openlm.ai/qwen3.8/)
- [Local AI Zone - Qwen3.8 2.4t A95b GGUF (29 partes)](https://local-ai-zone.github.io/models/qwen3-8-2-4t-a95b.html)
- [APXML - Qwen3.8 2.4T A95B: Specifications and GPU VRAM Requirements](https://apxml.com/models/qwen38-24t-a95b)
