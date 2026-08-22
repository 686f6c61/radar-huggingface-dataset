# denyzhirkov/Qwen3.8-27B-AEON-ULTIMATE-U-BF16

# Ficha técnica: Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16

## Resumen

El modelo Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 es una versión abliterada del Qwen3.8-27B de Alibaba, publicada por el usuario denyzhirkov en Hugging Face como un draft de acceso anticipado. El proceso de abliteración elimina los patrones de rechazo del modelo original, permitiendo respuestas directas sin monólogos de seguridad, manteniendo la coherencia y la calidad general. Está basado en la arquitectura Qwen3.8, que combina atención híbrida con Gated DeltaNet y componentes multimodales, con un total de 27.781.427.952 parámetros en precisión BF16.

La relevancia actual del modelo radica en su enfoque de abliteración que prioriza la coherencia sobre la minimización de la divergencia KL, evitando la sobre-abliteración que degrada la calidad. Es un trabajo en desarrollo (draft) con una versión GA planificada, pero ya ofrece respuestas sin rechazos en un modelo de 27B con capacidades de visión, razonamiento y tool calling. Su licencia Apache-2.0 facilita su uso en investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (GDN), atención lineal y visión multimodal |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (no especificado en la informacion) |
| Tipos de cuantizacion | BF16 (bfloat16) únicamente; se menciona un futuro NVFP4 |
| Idiomas soportados | inglés, chino y otros (multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una modificación de Qwen3.8-27B, que emplea una arquitectura híbrida con Gated DeltaNet (GDN) para atención lineal eficiente y componentes de visión que permiten procesamiento de imágenes. La versión base incluye un token de predicción múltiple (MTP) nativo, que el modelo conserva sin modificaciones. El proceso de entrenamiento original del Qwen3.8-27B no está documentado en la información proporcionada, pero el modelo derivado no ha sido entrenado de forma adicional; se ha aplicado una técnica de abliteración que modifica los pesos del modelo base para eliminar los patrones de rechazo, manteniendo la estructura cognitiva. El autor indica que el objetivo no es minimizar la divergencia KL, sino preservar la coherencia y la calidad de las respuestas.

## Capacidades

- Generación de texto y respuestas conversacionales en inglés y chino, con soporte multilingüe adicional.
- Razonamiento y pensamiento encadenado (thinking mode) con etiquetas de pensamiento internas.
- Soporte de tool calling y function calling para integración con herramientas externas.
- Capacidades de visión multimodal: procesamiento de imágenes y comprensión de escenas visuales.
- Predicción múltiple de tokens (MTP) para acelerar la inferencia especulativa.
- Respuestas directas sin rechazos ni sermones de seguridad en dominios sensibles, manteniendo coherencia en la mayoría de los casos.
- Compatibilidad con vLLM y librería transformers.

## Casos de uso

- **Asistencia técnica y atención al cliente**: puede gestionar conversaciones multi-turno con contexto largo y sin interrupciones por bloqueos de contenido, respondiendo preguntas sobre productos, procesos o incidencias de forma directa.
- **Generación de código**: al soportar tool calling y razonamiento, puede integrarse en entornos de desarrollo para sugerir implementaciones, depurar código o explicar fragmentos técnicos.
- **Análisis de documentos sensibles**: en entornos de investigación o periodismo, puede resumir o extraer información de textos que otros modelos rechazarían, siempre que se respete el marco legal.
- **Creación de contenido creativo**: útil para generar narrativas, diálogos o escenarios que requieren temas controvertidos sin autocensura.
- **Procesamiento de imágenes**: la capacidad de visión permite describir imágenes, responder preguntas sobre su contenido y generar texto descriptivo.
- **Prototipado de agentes conversacionales**: gracias a su soporte de function calling y razonamiento multi-paso, puede servir como base para agentes que interactúan con APIs y bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas internas sobre el proceso de abliteración, como la divergencia KL media de 0.0991 nats/token y tasas de rechazo en conjuntos de prueba, pero no hay datos comparativos con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: el modelo en BF16 tiene un tamaño de ~55.6 GB (27.78B parámetros × 2 bytes). Para inferencia en precisión completa se requieren al menos 60 GB de VRAM, por lo que necesita GPUs de gama alta como NVIDIA A100 (80 GB) o H200 (141 GB).
- **GPU recomendadas**: NVIDIA H200 (usada en validación), A100 de 80 GB, o RTX 4090 (24 GB) solo con cuantización a 4-bit (no disponible actualmente).
- **Despliegue**: compatible con vLLM (probado en v0.27.1), también con transformers y probablemente con llama.cpp y Ollama si se publican cuantizaciones GGUF.
- **Latencia y throughput**: no se proporcionan datos; el uso de MTP con 3 tokens especulativos puede reducir la latencia, pero no hay cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros modelos. Como referencia, se compara con el modelo base Qwen3.8-27B original:

| Modelo | Parametros | Contexto | Licencia | Comportamiento |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27.78B | no disponible | Apache-2.0 | Alineado con seguridad, rechaza peticiones sensibles |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED | 27.78B | no disponible | Apache-2.0 | Sin rechazos, respuestas directas, con posibles fallos en contexto largo |

No hay otros modelos abliterados de 27B comparables en la información proporcionada.

## Limitaciones y advertencias

- **Draft en desarrollo**: el modelo es un acceso anticipado, no una versión estable; puede presentar bucles o repeticiones en peticiones muy largas.
- **Riesgo de alucinación**: al eliminar los patrones de seguridad, el modelo puede generar contenido falso o no verificado en dominios sensibles.
- **Limitaciones de contexto**: se detectan degradaciones en respuestas extremadamente largas, con lagunas en los pesos que se acumulan.
- **Sesgos**: la abliteración no elimina sesgos inherentes del modelo base, y podría exacerbar algunos comportamientos.
- **Uso comercial**: aunque la licencia Apache-2.0 lo permite, el modelo no está recomendado para producción debido a su estado de draft y a la falta de pruebas de robustez.
- **Riesgo de mal uso**: al no tener rechazos, puede generar contenido ilegal o peligroso si se usa de forma irresponsable.

## Enlaces

- Repositorio de Hugging Face (denyzhirkov): https://huggingface.co/denyzhirkov/Qwen3.8-27B-AEON-ULTIMATE-U-BF16
- Repositorio original de AEON-7: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Blog de MindStudio sobre el modelo: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
