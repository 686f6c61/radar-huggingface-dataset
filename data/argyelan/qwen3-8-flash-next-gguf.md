# argyelan/Qwen3.8-Flash-Next-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de arquitectura Mixture-of-Experts (MoE) desarrollado por Qwen, publicado como avance de la arquitectura Qwen4. El modelo principal tiene 125 mil millones de parámetros, complementado por una tabla de n-gram embeddings de 51 mil millones de parámetros, con solo 6 mil millones de parámetros activos por token. Esta conversión GGUF, realizada por argyelan el mismo día del lanzamiento (day-0), permite ejecutar el modelo en hardware de consumo mediante llama.cpp, algo que no era posible con el checkpoint FP8 original sin parches de conversión.

La relevancia de este modelo radica en que introduce una arquitectura híbrida de atención (Gated DeltaNet + Gated Attention) que reduce drásticamente el coste de entrenamiento e inferencia en comparación con la serie anterior Qwen3.7, manteniendo o mejorando capacidades en codificación, razonamiento y tareas de oficina. El GGUF aquí documentado es un artefacto de día cero, cuantizado a IQ4_XS para los pesos y Q5_0 para la tabla n-gram, con limitaciones conocidas pero funcional para pruebas locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida Gated DeltaNet + Gated Attention (Qwen4 preview) |
| Parametros totales | 176.943.899.520 (125B MoE + 51B n-gram embeddings) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | IQ4_XS (pesos) + Q5_0 (tabla n-gram); Q8_0 master pendiente de subida |
| Idiomas soportados | no disponible (el autor reporta salida coherente en alemán e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (3 shards, 98 GB totales) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next emplea una arquitectura MoE híbrida que combina Gated DeltaNet (GDN) y Gated Attention (QSA). Esta combinación sustituye la atención completa tradicional por un mecanismo de estado recurrente con compuertas, lo que reduce el coste computacional por token y permite ventanas de contexto de 262K tokens. El modelo incluye además una tabla de n-gram embeddings de 51B parámetros que actúa como memoria de lookup, mejorando la precisión en tareas de recuperación y generación con bajo coste adicional.

Según el repositorio oficial, el entrenamiento consume aproximadamente 1/9 del coste de Qwen3.7-Plus, manteniendo o superando sus capacidades en codificación y tareas de oficina. No se han publicado detalles sobre el dataset de entrenamiento, ni sobre el uso de RLHF o DPO en la información disponible. La conversión GGUF se realizó a partir del checkpoint FP8 oficial, requantizando los pesos a IQ4_XS mediante un requantizador de streaming personalizado para la tabla n-gram, ya que las herramientas estándar de llama.cpp no pueden procesar un tensor de 51B parámetros.

## Capacidades

- Generación de texto y razonamiento multi-step con modo de pensamiento avanzado.
- Codificación de software, incluyendo tareas de agente (agentic coding) y generación de código.
- Comprensión multimodal (visión), aunque la información disponible no detalla el procesador de imágenes.
- Soporte de tool calling y function calling, validado con salida JSON-schema correcta.
- Capacidad de recuperación de agujas (needle retrieval) en contexto largo, verificada por el autor.
- Multilingüismo básico (alemán e inglés verificados; otros idiomas no documentados).
- Inferencia eficiente gracias a la arquitectura híbrida y a la cuantización.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en entornos de desarrollo (IDE) para autocompletado y refactorización de código, aprovechando su capacidad de razonamiento y su ventana de 262K tokens para mantener el contexto completo del proyecto.
- Agente autónomo de tareas: con soporte de tool calling, puede orquestar llamadas a APIs, ejecutar comandos y gestionar flujos de trabajo multi-paso en un entorno controlado, por ejemplo en un servidor doméstico o una estación de trabajo.
- Análisis de documentos largos: su contexto de 262K tokens permite procesar manuales técnicos, contratos o informes extensos en una sola pasada, extrayendo información relevante sin necesidad de chunking.
- Generación de contenido estructurado: validado para producir JSON-schema válido, es adecuado para pipelines de extracción de datos, generación de informes automáticos o relleno de plantillas.
- Chatbot de atención al cliente con memoria extendida: puede mantener conversaciones multi-turno con historial largo, reduciendo la pérdida de contexto y mejorando la coherencia en interacciones prolongadas.
- Investigación y experimentación con arquitecturas híbridas: al ser un modelo abierto con licencia Apache-2.0, sirve como banco de pruebas para estudiar el comportamiento de Gated DeltaNet y Gated Attention en tareas reales, sin necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (HumanEval, GSM8K, MMLU) en la información disponible. El autor de la conversión GGUF reporta las siguientes mediciones propias en un DGX Spark:

| Prueba | Resultado |
|---|---|
| Velocidad de generación (single stream) | ~34 tok/s |
| Velocidad de prefill | ~550 tok/s |
| Multiplicación 47 × 83 | correcta |
| Salida JSON-schema | válida |
| Recuperación de aguja en contexto largo | limpia |

Estas cifras corresponden a un artefacto de día cero y no sustituyen evaluaciones estandarizadas. El blog de unsloth afirma que el modelo supera a Claude-4.6-Opus (Max) en tareas de codificación agéntica, visión y razonamiento, pero no se aportan datos numéricos verificables.

## Requisitos de hardware

- VRAM estimada: el GGUF de 98 GB requiere al menos 98 GB de memoria unificada o VRAM para cargar los pesos completos. Con cuantización IQ4_XS, cabe en sistemas con 128 GB de RAM unificada (DGX Spark, Mac Studio con 128 GB).
- GPU recomendadas: DGX Spark / GX10 (probado por el autor); también puede ejecutarse en Mac con 78 GB de RAM unificada según unsloth, aunque no se especifica la cuantización exacta.
- En consumer GPU: no es viable en GPUs de 24 GB (RTX 4090) ni de 48 GB (RTX 6000 Ada) debido al tamaño del modelo; se necesitaría descarga parcial o cuantizaciones más agresivas no disponibles actualmente.
- Opciones de despliegue: llama.cpp con soporte Qwen4-Exp (PR #27742, aún no incluido en releases oficiales). No se mencionan integraciones con vLLM, Ollama o TGI en la información disponible.
- Latencia y throughput: ~34 tok/s de generación y ~550 tok/s de prefill medidos en DGX Spark; valores orientativos para un solo stream.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa formal con alternativas de la misma categoría. El modelo se posiciona frente a Qwen3.7-Plus (mencionado en el repositorio oficial) y a Claude-4.6-Opus (según unsloth), pero no hay especificaciones públicas de estos modelos en la información proporcionada. La comparativa queda pendiente hasta que se publiquen benchmarks estandarizados.

## Limitaciones y advertencias

- Artefacto de día cero: la conversión GGUF se realizó sin imatrix y a partir del checkpoint FP8, no BF16; se esperan cuantizaciones refinadas de otras fuentes.
- La tabla n-gram de 51B parámetros está cuantizada a Q5_0 mediante un requantizador personalizado; aunque el autor verificó su funcionamiento, puede haber degradación en tareas que dependan fuertemente de esta tabla.
- Requiere una versión de llama.cpp con soporte experimental para Qwen4 (PR #27742), que aún no está en releases estables; es necesario reconstruir el binario cuando el PR se actualice.
- No hay evaluaciones formales de sesgos, alucinación o robustez; el autor solo realizó pruebas básicas de coherencia y recuperación.
- El modelo es multimodal, pero no se documentan los límites de la parte de visión en esta conversión GGUF.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales no detalladas en la información disponible.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/argyelan/Qwen3.8-Flash-Next-GGUF
- Modelo base FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Repositorio oficial del modelo: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Herramientas de conversión y requantización: https://github.com/marknx/flash-next-gguf-tools
- PR de llama.cpp para soporte Qwen4-Exp: https://github.com/ggml-org/llama.cpp/pull/27742
- Documentación de SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next
- Guía de unsloth para ejecución local: https://unsloth.ai/docs/models/qwen3.8-next
- Blog de Atomic Chat con benchmarks y guía: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Sitio del autor de la conversión: https://argyelan.ai
