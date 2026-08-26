# ailabstw/fedgpt-ragent-0.2.2

## Resumen

El modelo `ailabstw/fedgpt-ragent-0.2.2` es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el equipo de ailabstw, vinculado a la plataforma FedGPT, una solución empresarial de IA on-premises orientada a automatización de agentes y construcción de bases de conocimiento. Este modelo está diseñado específicamente para tareas de agente con recuperación aumentada (RAG), integrando capacidades multimodales (imagen y texto) y un contexto nativo de 262 144 tokens, extensible hasta aproximadamente 1 010 000 tokens.

El modelo base Qwen3.5-4B, sobre el que se construye, emplea una arquitectura híbrida eficiente que combina Gated Delta Networks con Mixture-of-Experts (MoE) disperso, lo que permite una inferencia de alto rendimiento con baja latencia y coste. Con 4,66 mil millones de parámetros totales, este ajuste fino hereda las capacidades del modelo base, incluyendo razonamiento, generación de código, comprensión visual y soporte multilingüe (201 idiomas y dialectos en la versión base). Su relevancia actual radica en su aplicación en entornos empresariales que requieren despliegue local, seguridad de datos y cumplimiento normativo, como finanzas, sanidad y administración pública.

La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su adopción en proyectos propietarios. Aunque el repositorio no incluye una model card específica para el ajuste fino, la información del modelo base proporciona una base sólida para entender sus capacidades y limitaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention + FFN, con vision encoder (basada en Qwen3.5-4B) |
| Parametros totales | 4 659 865 088 (4,66B) |
| Parametros activos | No disponible (el modelo base es MoE disperso, pero no se especifica el número de activos) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 010 000 tokens |
| Tipos de cuantizacion | No disponible (no se menciona en la información proporcionada) |
| Idiomas soportados | No disponible para el ajuste fino; el modelo base soporta 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B presenta una arquitectura híbrida innovadora que combina capas de Gated Delta Networks (atención lineal) con capas de atención tradicional (Gated Attention), organizadas en un patrón de 8 bloques, cada uno con 3 subcapas de Gated DeltaNet seguidas de FFN, y una subcapa de Gated Attention con FFN. Esta configuración busca equilibrar eficiencia computacional y capacidad de modelado. El modelo incluye un vision encoder para procesamiento de imágenes, lo que lo convierte en un modelo multimodal (image-text-to-text). El entrenamiento del modelo base incluyó pre-entrenamiento y post-entrenamiento con aprendizaje por refuerzo a escala, así como entrenamiento multi-step para la predicción de tokens múltiples (MTP).

El ajuste fino `fedgpt-ragent-0.2.2` se ha realizado sobre este modelo base, pero no se proporcionan detalles específicos sobre el dataset, la metodología de entrenamiento o las técnicas de alineación empleadas. Dado el nombre "ragent" (RAG agent), es probable que el ajuste se haya centrado en optimizar el modelo para tareas de recuperación aumentada y razonamiento multi-paso, pero esta información no está disponible en la documentación pública.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-4B, que destaca en tareas de conocimiento y STEM (MMLU-Pro 79,1, MMLU-Redux 91,4 según benchmarks del modelo base).
- Comprensión visual: al ser un modelo image-text-to-text, puede procesar imágenes y responder preguntas sobre ellas, aunque no se especifican benchmarks específicos para esta capacidad en el ajuste fino.
- Soporte de tool calling / function calling: no confirmado explícitamente para este ajuste fino, pero el modelo base Qwen3.5 está diseñado para agentes y razonamiento multi-paso, por lo que es probable que soporte estas funciones.
- Capacidades multilingües: el modelo base soporta 201 idiomas y dialectos; el ajuste fino no especifica restricciones idiomáticas.
- Contexto largo: con 262 144 tokens nativos, puede manejar documentos extensos y conversaciones multi-turno complejas, adecuado para tareas de RAG sobre grandes corpus.
- Integración con plataformas empresariales: diseñado para FedGPT, una plataforma on-premises de agentes de IA, lo que sugiere capacidades de automatización de workflows y construcción de bases de conocimiento.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262K tokens), lo que permite mantener el historial completo de interacciones y acceder a bases de conocimiento extensas para resolver consultas de clientes de forma precisa y trazable.
- Asistente de documentación técnica: gracias a su capacidad de procesar imágenes y texto, puede responder preguntas sobre manuales, diagramas y especificaciones técnicas, integrando información visual y textual en un mismo flujo.
- Automatización de workflows empresariales: en la plataforma FedGPT, el modelo puede actuar como agente que orquesta tareas multi-paso, como extracción de datos, generación de informes y coordinación con otros sistemas, cumpliendo requisitos de seguridad y privacidad al desplegarse on-premises.
- Búsqueda semántica y recuperación aumentada: su contexto largo y capacidades de razonamiento lo hacen adecuado para sistemas RAG que indexan grandes volúmenes de documentos corporativos, permitiendo respuestas fundamentadas en fuentes internas.
- Análisis de imágenes médicas o industriales: al ser multimodal, puede asistir en la interpretación de radiografías, planos o imágenes de control de calidad, combinando la información visual con conocimiento textual.
- Generación de código en entornos regulados: el modelo base tiene buen rendimiento en tareas de programación; en un despliegue local, puede usarse para generar y revisar código en sectores con estrictas políticas de confidencialidad, como banca o defensa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el ajuste fino `fedgpt-ragent-0.2.2`. Los datos disponibles corresponden al modelo base Qwen3.5-4B, que se presentan a continuación como referencia:

| Benchmark | Qwen3.5-4B (base) |
|---|---|
| MMLU-Pro | 79,1 |
| MMLU-Redux | 91,4 |

Estos valores se han extraído de la model card del modelo base. No se dispone de resultados para tareas de razonamiento, código o visión específicas del ajuste fino. Se recomienda evaluar el modelo en el dominio de aplicación concreto antes de su despliegue en producción.

## Requisitos de hardware

- VRAM estimada: con 4,66B parámetros, en precisión FP16 se requieren aproximadamente 9,3 GB de VRAM (coincide con el tamaño del repositorio). Con cuantización a 8 bits, se reduce a ~4,7 GB; a 4 bits, ~2,4 GB.
- GPU recomendadas: para inferencia en FP16, una GPU con 12 GB o más (por ejemplo, RTX 3060 12GB, RTX 4070, A10, L4). Con cuantización, puede ejecutarse en GPUs consumer de 8 GB (RTX 3070, RTX 4060) o incluso menos.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización. Para contexto largo (262K tokens), se requiere memoria adicional; el uso de técnicas como FlashAttention o vLLM con gestión de memoria eficiente es recomendable.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang, KTransformers y llama.cpp (si se generan pesos GGUF). También puede integrarse en Ollama mediante conversión.
- Latencia y throughput: no se han publicado datos específicos para este ajuste fino. El modelo base Qwen3.5-4B está optimizado para alta eficiencia gracias a su arquitectura híbrida, pero se recomienda realizar pruebas de carga en el entorno objetivo.

## Comparativa con modelos similares

Dado que no hay benchmarks específicos del ajuste fino, la comparativa se realiza a nivel del modelo base Qwen3.5-4B con otras alternativas de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | MMLU-Pro | MMLU-Redux |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,66B | 262K (ext. 1M) | Apache 2.0 | 79,1 | 91,4 |
| Qwen3-4B | 4B | 32K (ext. 128K) | Apache 2.0 | No disponible | No disponible |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community | No disponible | No disponible |
| Phi-3.5-mini | 3,8B | 128K | MIT | No disponible | No disponible |

Nota: los datos de Qwen3-4B, Llama-3.2-3B y Phi-3.5-mini no se han verificado en la información proporcionada; se incluyen como referencia de modelos comparables en tamaño, pero sus benchmarks no están disponibles en este contexto.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Qwen3.5-4B puede heredar sesgos presentes en sus datos de entrenamiento, que no se detallan en la documentación. Se recomienda auditar el modelo antes de su uso en aplicaciones sensibles.
- Riesgo de alucinación: como todo modelo generativo, puede producir información plausible pero incorrecta, especialmente en tareas de razonamiento complejo o cuando se le pide información fuera de su conocimiento. En aplicaciones RAG, es crucial verificar las respuestas contra las fuentes recuperadas.
- Limitaciones de contexto: aunque el contexto nativo es de 262K tokens, el rendimiento puede degradarse en contextos muy largos; se recomienda probar con la longitud real de los documentos de la aplicación.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia (también Apache 2.0 según la model card). No se han identificado restricciones adicionales para el ajuste fino.
- Falta de documentación específica: el repositorio no incluye una model card detallada del ajuste fino, por lo que se desconocen los datos de entrenamiento, la metodología y los benchmarks específicos. Esto dificulta la evaluación rigurosa del modelo.
- Dependencia de la plataforma FedGPT: el modelo está diseñado para integrarse en la plataforma FedGPT; su uso fuera de este ecosistema puede requerir adaptaciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/ailabstw/fedgpt-ragent-0.2.2
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Sitio web de FedGPT: https://fedgpt.cc/en
- Datasheet de FedGPT (PDF): https://3453611.fs1.hubspotusercontent-na1.net/hubfs/3453611/Collateral/AFS-FedGPT-datasheet2024.pdf
