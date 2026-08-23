# axiomofmind/DeepSeek-V4-Flash-0731-NVFP4

## Resumen

DeepSeek-V4-Flash-0731-NVFP4 es un export cuantizado en NVFP4 del modelo base `deepseek-ai/DeepSeek-V4-Flash-0731`, publicado de forma independiente por el usuario axiomofmind. Se trata de un modelo de lenguaje de 304 180 millones de parámetros con arquitectura sparse Mixture-of-Experts (MoE), diseñado por DeepSeek para generación de texto, codificación, razonamiento, contexto largo y flujos de trabajo agénticos. El modelo base soporta una ventana de contexto de un millón de tokens e incorpora un módulo de decodificación especulativa (MTP) adjunto.

La relevancia de este export reside en que cuantiza únicamente los pesos de los 43 bloques de expertos enrutados (256 expertos por capa) a formato NVFP4 de NVIDIA, con escalas de activación calibradas de forma independiente, mientras que atención, expertos compartidos, router, embeddings, cabeza de salida y el módulo MTP conservan su formato original. El resultado es un checkpoint de 175.6 GB con licencia MIT, listo para despliegue en runtime compatibles con el layout NVFP4, y que mantiene la arquitectura completa del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer sparse Mixture-of-Experts (MoE) con 43 capas de expertos enrutados (256 expertos por capa) y módulo de decodificación especulativa (MTP) adjunto |
| Parámetros totales | 304.180.418.494 (~304 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 1 000 000 tokens (heredada del modelo base) |
| Tipos de cuantización | NVFP4 (4 bits) en pesos de expertos enrutados; atención, expertos compartidos, router, embeddings, cabeza de salida y MTP en formato original del modelo base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint Hugging Face NVFP4; no incluye GGUF) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformer sparse MoE de 304 B parámetros, con 43 capas de expertos enrutados de 256 expertos cada una. Este export de `axiomofmind` reemplaza los valores de los pesos de los expertos, originalmente en MXFP4, por la representación NVFP4 de NVIDIA, que se convierte de forma sin pérdidas, y calibra escalas de activación de manera independiente. La calibración se realizó con NVIDIA ModelOpt sobre ocho GPU H100 de 80 GB, utilizando 128 muestras de hasta 512 tokens (32 de cada uno de CNN/DailyMail, OpenCodeReasoning, OpenMathReasoning y Magpie-Pro-MT-300K), con 65 536 posiciones de secuencia rellenadas y el algoritmo de calibración máxima con batch size 1. El módulo de especulación (MTP) y el resto de componentes conservan los pesos originales, por lo que la capacidad de decodificación especulativa del modelo base se mantiene intacta.

## Capacidades

- Generación de texto de alta calidad con ventana de contexto de un millón de tokens, adecuada para documentos largos y conversaciones multi-turno.
- Codificación y razonamiento: soporta tareas de programación y razonamiento lógico/matemático, según la descripción del modelo base.
- Agentes y flujos de trabajo multi-paso: el modelo base está optimizado para workflows agentic, con capacidades de tool calling y razonamiento multi-step.
- Decodificación especulativa: incluye un módulo MTP (multi-token prediction) adjunto que acelera la generación.
- Multilingüe: no se dispone de información específica sobre los idiomas soportados en la documentación disponible.

## Casos de uso

- Agentes autónomos con contexto largo: su ventana de 1 M tokens permite mantener conversaciones o tareas multi-paso con historial extenso, útil para asistentes que gestionan proyectos complejos.
- Análisis y resumen de documentos extensos: puede procesar libros técnicos, contratos o codebases completos sin truncar, gracias al contexto de 1M tokens.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisión o generación de código, con la ventaja del módulo de decodificación especulativa para reducir latencia.
- Razonamiento matemático y científico: adecuado para sistemas de tutoría o resolución de problemas que requieren cadenas de razonamiento largas.
- Chatbots de atención al cliente con contexto largo: mantiene el estado de conversaciones de múltiples turnos con amplio histórico.
- Despliegue en infraestructura NVIDIA: al ser un export NVFP4, está optimizado para runtime de NVIDIA como TensorRT-LLM o NIM, permitiendo inferencia eficiente en GPUs de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del export no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) y tampoco se dispone de datos comparativos del modelo base en la documentación consultada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 175.6 GB, por lo que se requiere memoria de GPU agregada de al menos ese tamaño para la inferencia completa. Con cuantización 4 bits, el modelo puede caber en dos GPU de 80 GB (por ejemplo, H100 o B200) o en configuraciones equivalentes.
- GPU recomendadas: NVIDIA H100 80 GB (utilizadas en la calibración) o GPUs de arquitectura Blackwell con soporte nativo de NVFP4 para un rendimiento óptimo.
- No cabe en GPU de consumo: el tamaño del checkpoint supera la VRAM de cualquier GPU consumer (RTX 4090, 24 GB).
- Opciones de despliegue: requiere runtime con soporte específico para el layout NVFP4 de DeepSeek-V4, como TensorRT-LLM o NVIDIA NIM. No es compatible directamente con llama.cpp o Ollama (no es GGUF). El tag `endpoints_compatible` sugiere compatibilidad con servicios de endpoints.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deepseek-ai/DeepSeek-V4-Flash-0731 (base) | ~304 B (MoE) | 1M tokens | Original (MXFP4 en expertos) | MIT | Hugging Face |
| axiomofmind/DeepSeek-V4-Flash-0731-NVFP4 (este) | ~304 B (MoE) | 1M tokens | NVFP4 (4 bits) en expertos | MIT | Hugging Face |
| nvidia/DeepSeek-V4-Flash-NVFP4 (export oficial) | ~304 B (MoE) | 1M tokens | NVFP4 (4 bits) | MIT | Hugging Face |

La principal diferencia con el modelo base es la cuantización de los expertos a NVFP4, que reduce el peso del checkpoint (175.6 GB frente al original) y puede mejorar la eficiencia de inferencia en hardware NVIDIA, a costa de una posible pérdida de precisión. Respecto al export oficial de NVIDIA, la diferencia está en el proceso de calibración: este export es independiente y utiliza un conjunto de datos de calibración propio (CNN/DailyMail, OpenCodeReasoning, OpenMathReasoning y Magpie-Pro-MT-300K). No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, alucinación o calidad de salida para este export específico; se recomienda consultar la model card oficial de DeepSeek para conocer las limitaciones del modelo base.
- La cuantización NVFP4 solo afecta a los pesos de los expertos; el resto de componentes mantienen el formato original, lo que implica que la reducción de memoria no es uniforme en toda la arquitectura.
- Requiere un runtime con soporte específico para el layout NVFP4 de DeepSeek-V4; no funciona con herramientas estándar de cuantización como llama.cpp u Ollama.
- El contexto de 1M tokens impone requisitos de memoria y cómputo elevados; en la práctica, ventanas muy largas pueden superar la VRAM disponible en configuraciones de una sola GPU.
- La licencia MIT permite uso comercial, pero el modelo base puede tener restricciones adicionales que no se detallan en este export.
- No se dispone de información sobre idiomas soportados ni sobre el rendimiento en tareas específicas más allá de la descripción general del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/axiomofmind/DeepSeek-V4-Flash-0731-NVFP4
- Modelo base oficial: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Export oficial de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4-Flash-NVFP4
- Model card de NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash-0731/modelcard
- Documentación de API de NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/deepseek-ai-deepseek-v4-flash-0731
- Modelo en ModelScope: https://modelscope.ai/models/deepseek-ai/DeepSeek-V4-Flash-0731
