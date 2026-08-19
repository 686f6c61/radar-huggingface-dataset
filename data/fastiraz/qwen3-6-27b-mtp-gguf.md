# Fastiraz/Qwen3.6-27B-MTP-GGUF

## Resumen

Qwen3.6-27B-MTP-GGUF es una cuantización GGUF del modelo Qwen3.6-27B, desarrollado originalmente por Alibaba Qwen y posteriormente adaptado por el equipo de Unsloth para soportar Multi-Token Prediction (MTP). Este repositorio concreto, publicado por Fastiraz, ofrece los pesos en formato GGUF para su ejecución en llama.cpp y otros motores compatibles, incorporando la técnica MTP que acelera la inferencia entre 1,5 y 2 veces sin pérdida de precisión.

El modelo base Qwen3.6-27B es un modelo de lenguaje causal con encoder de visión, de 27 000 millones de parámetros, que combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention) en una arquitectura híbrida de 64 capas. Dispone de un contexto nativo de 262 144 tokens, extensible hasta 1 010 000, y está diseñado para tareas de codificación agéntica, razonamiento sobre repositorios y uso multimodal. Según fuentes externas, alcanza un 77,2 % en SWE-bench Verified, superando a modelos mucho más grandes.

La relevancia de esta versión GGUF radica en que permite ejecutar un modelo de 27B con capacidades de visión y contexto ultralargo en hardware de consumo, como una RTX 3090, alcanzando alrededor de 60 tokens por segundo con cuantización Q4_K_M y MTP activado. Esto lo convierte en una opción atractiva para desarrolladores que necesitan un asistente de codificación local, privado y de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida: Gated DeltaNet (atención lineal) + Gated Attention + FFN |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 010 000 |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M, Q4_K_XL, UD-Q4_K_XL y otras variantes) |
| Idiomas soportados | No disponible (el modelo base de Qwen suele ser multilingüe, pero no se especifica en la documentación) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base también está disponible en safetensors) |

## Arquitectura y entrenamiento

Qwen3.6-27B emplea una arquitectura híbrida que combina atención lineal y atención completa. Cada una de sus 64 capas sigue el patrón: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128, mientras que la Gated Attention usa 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y rotary position embedding de dimensión 64. La dimensión oculta es de 5120 y el embedding de tokens es de 248 320 (con padding). Esta combinación reduce el coste computacional de la atención lineal manteniendo la calidad de la atención completa en capas seleccionadas.

El entrenamiento incluye una fase de pre-training y otra de post-training, con MTP entrenado mediante multi-steps. No se han publicado detalles sobre el tamaño del dataset ni sobre el uso de RLHF o DPO. La innovación principal es el MTP, que permite predecir varios tokens a la vez, acelerando la generación en motores como llama.cpp sin degradar la precisión. Además, incorpora mejoras en el parsing de tool calling, soporte de Developer Role para agentes como Codex u OpenCode, y una opción de "Thinking Preservation" que retiene el contexto de razonamiento de mensajes históricos para optimizar el desarrollo iterativo.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de codificación y matemáticas.
- Codificación agéntica: manejo de flujos de trabajo frontend y razonamiento a nivel de repositorio con alta fluidez.
- Soporte de tool calling / function calling, con mejoras en el parsing de objetos anidados para mayor fiabilidad.
- Soporte de agentes y multi-step reasoning, con Developer Role Support para Codex, OpenCode y otras herramientas.
- Capacidades multimodales: al incluir un vision encoder, puede procesar entradas de imagen además de texto.
- Contexto ultralargo nativo de 262 144 tokens, extensible hasta 1 010 000, ideal para documentos extensos o repositorios completos.
- Thinking Preservation: opción para conservar el contexto de razonamiento histórico en conversaciones multi-turno.
- Aceleración por MTP: inferencia entre 1,5 y 2 veces más rápida sin pérdida de precisión, cuando se usa con llama.cpp y la configuración adecuada.

## Casos de uso

- Asistente de codificación local: con cuantización Q4_K_M y MTP, el modelo alcanza unos 60 tokens por segundo en una RTX 3090, lo que permite autocompletado y generación de código en tiempo real sin depender de la nube.
- Agentes autónomos de desarrollo: gracias al soporte de tool calling y Developer Role, puede integrarse en Codex u OpenCode para ejecutar tareas de programación de forma autónoma, como crear archivos, ejecutar comandos y revisar resultados.
- Análisis de repositorios completos: con un contexto de 262K tokens, puede procesar un repositorio entero de tamaño medio para responder preguntas sobre su estructura, identificar bugs o sugerir refactorizaciones.
- Asistente multimodal de documentación: al aceptar imágenes, puede describir diagramas, capturas de pantalla o esquemas de arquitectura y relacionarlos con el código fuente.
- Desarrollo iterativo con historial de razonamiento: la función Thinking Preservation reduce la sobrecarga en sesiones largas, manteniendo el contexto de decisiones previas sin necesidad de repetir información.
- Despliegue en servidores de alta concurrencia: aunque MTP no soporta múltiples procesos, el modelo puede servirse con vLLM o SGLang (sin MTP) para atender muchas peticiones simultáneas con contexto largo, por ejemplo en un chat corporativo de soporte técnico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales en la model card del repositorio. Sin embargo, fuentes externas citan los siguientes datos:

- SWE-bench Verified: 77,2 % (según aimadetools.com), superando a modelos de 397B parámetros.
- Rendimiento en RTX 3090 con cuantización Q4_K_M y MTP: aproximadamente 60 tokens por segundo, con una mejora de 1,6x en throughput medio por prompt y 1,86x en tiempo de pared en comparación con la misma configuración sin MTP (según insiderllm.com).

Estos datos provienen de análisis independientes y no han sido confirmados por el autor del repositorio. Se recomienda verificar el rendimiento en el hardware objetivo antes de tomar decisiones de producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, aproximadamente 16-18 GB; con Q8, alrededor de 30 GB; en FP16, cerca de 54 GB.
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB) para cuantizaciones Q4; A100 o H100 para versiones de mayor precisión o contexto muy largo.
- En GPU de consumo: sí, cabe en tarjetas de 24 GB con cuantización Q4 y contexto moderado.
- Opciones de despliegue: llama.cpp (con soporte MTP), Ollama (si se añade soporte MTP), vLLM, SGLang y KTransformers para el modelo base en safetensors.
- Latencia y throughput: se ha medido ~60 tok/s en RTX 3090 con Q4_K_M y MTP (fuente externa). Sin MTP, el rendimiento es aproximadamente 1,6 veces menor.

## Comparativa con modelos similares

No se dispone de una comparativa oficial con otros modelos en la documentación proporcionada. Según fuentes externas, Qwen3.6-27B supera en SWE-bench Verified a modelos de 397B parámetros, pero no se especifica cuáles. Como referencia general, se puede comparar con otros modelos densos de 27B como Qwen2.5-32B o DeepSeek-R1-Distill-Qwen-27B, aunque no se han publicado datos de rendimiento en esta ficha. La arquitectura híbrida y el soporte MTP son diferenciadores clave frente a alternativas que usan atención completa estándar.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo entrenado con datos de internet, puede heredar sesgos sociales, culturales o de género.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- El soporte MTP en llama.cpp no permite aún múltiples procesos (-np > 1) ni el uso de proyector de visión (--mmproj), lo que limita su uso en entornos con alta concurrencia o con entradas multimodales.
- El tamaño del repositorio es muy grande (1233,7 GB) porque incluye numerosas cuantizaciones; es necesario seleccionar únicamente el archivo GGUF adecuado para evitar descargas innecesarias.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base Qwen3.6-27B cumple los mismos términos (la model card indica la misma licencia).
- El contexto de 262K tokens puede provocar errores de memoria (OOM) en GPUs con poca VRAM; se recomienda reducir la ventana de contexto si se observan problemas.

## Enlaces

- Repositorio de Fastiraz: https://huggingface.co/Fastiraz/Qwen3.6-27B-MTP-GGUF
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de Unsloth (versión original del GGUF con MTP): https://huggingface.co/unsloth/Qwen3.6-27B-MTP-GGUF
- Guía de Unsloth para MTP: https://unsloth.ai/docs/models/qwen3.6#mtp-guide
- Blog oficial de Qwen sobre Qwen3.6-27B: https://qwen.ai/blog?id=qwen3.6-27b
- Guía completa de Qwen 3.6-27B (aimadetools): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Guía de rendimiento con MTP en RTX 3090 (insiderllm): https://insiderllm.com/guides/wicked-fast-qwen-3-6-27b-mtp-rtx-3090/
- Guía de stable-learn sobre Qwen3.6-27B-MTP-GGUF: https://stable-learn.com/en/qwen36-27b-mtp-gguf-guide/
