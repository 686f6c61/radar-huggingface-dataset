# bloomer010/Ling-3.0-tiny-GGUF

## Resumen

Ling-3.0-tiny es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) híbrido desarrollado por inclusionAI, diseñado específicamente para despliegue en entornos con recursos limitados. Con 7.900 millones de parámetros totales y solo 1.300 millones activos por token, ofrece capacidades de razonamiento y agente a un coste de inferencia reducido. La versión GGUF, publicada por bloomer010, convierte los pesos originales en BF16 al formato GGUF, permitiendo su ejecución local con llama.cpp y otras herramientas compatibles.

El modelo emplea una arquitectura novedosa denominada `bailingmoe3`, que combina 18 capas KDA (Kernel-based Dynamic Attention) y 6 capas MLA (Multi-head Latent Attention), junto con 128 expertos enrutados de los que se activan 8 por token, más un experto compartido. Incorpora además mecanismos de Q-LoRA (rank 256) y KV-LoRA (rank 512) para optimizar la atención. Su ventana de contexto alcanza los 131.072 tokens en la configuración publicada, y soporta modos de pensamiento ("Thinking") e instantáneo, así como function calling nativo.

La relevancia de este modelo radica en su equilibrio entre rendimiento y eficiencia: al activar solo una fracción de sus parámetros, puede ejecutarse en GPUs de consumo medio (como RTX 3060 o RTX 4070) con cuantizaciones que van desde 1,30 GB (Q1_0) hasta 15,8 GB (BF16). Su licencia MIT permite uso comercial sin restricciones, lo que lo convierte en una opción atractiva para desarrolladores que buscan desplegar asistentes conversacionales o agentes en entornos locales o de borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BailingMoE3 (MoE híbrido con capas KDA y MLA) |
| Parametros totales | 7,9 mil millones |
| Parametros activos | 1,3 mil millones por token |
| Longitud de contexto | 131.072 tokens (configuración publicada) |
| Tipos de cuantizacion | BF16, UD-Q8_K_XL, Q8_0, UD-Q6_K_XL, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, MXFP4_MOE, Q3_K_M, IQ2_M, Q1_0 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors originales en BF16) |

## Arquitectura y entrenamiento

Ling-3.0-tiny utiliza una arquitectura MoE híbrida que combina dos tipos de capas de atención: 18 capas KDA (Kernel-based Dynamic Attention) y 6 capas MLA (Multi-head Latent Attention). El modelo dispone de 128 expertos enrutados, de los cuales se activan 8 por token, más un experto compartido. Esta configuración permite que solo 1,3 mil millones de parámetros se activen en cada paso, reduciendo drásticamente el coste computacional en comparación con un modelo denso de tamaño similar.

La implementación de Q-LoRA (rank 256) y KV-LoRA (rank 512) en la ruta de atención permite una compresión eficiente de las claves y valores, lo que contribuye a la gestión de la ventana de contexto de 131.072 tokens. El modelo no incluye un bloque MTP (Multi-Token Prediction) en la configuración publicada (`num_nextn_predict_layers: 0`). Los detalles sobre el dataset de entrenamiento, el número de tokens procesados y las técnicas de alineación (RLHF, DPO, etc.) no están disponibles en la información proporcionada. Sin embargo, el modelo está diseñado para razonamiento y uso como agente, con un modo de pensamiento habilitado por defecto.

## Capacidades

- Generación de texto conversacional y de razonamiento multi-turno, con soporte para modos "Thinking" (pensamiento explícito) e "Instant" (respuesta directa).
- Function calling nativo, lo que permite integrar el modelo en pipelines de agentes que necesitan invocar herramientas externas.
- Capacidades de agente y razonamiento multi-paso, adecuadas para tareas que requieren planificación y ejecución secuencial.
- Soporte multilingüe no especificado en la documentación; se recomienda verificar el rendimiento en el idioma objetivo.
- Ventana de contexto larga (131.072 tokens) que facilita el procesamiento de documentos extensos o conversaciones prolongadas.
- Compatibilidad con cuantizaciones extremas (desde Q1_0 hasta BF16) que permiten ajustar el equilibrio entre calidad y requisitos de memoria.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede gestionar diálogos multi-turno con contexto largo gracias a su ventana de 131.072 tokens, siendo adecuado para chatbots de atención al cliente o asistentes personales que se ejecutan en hardware de consumo.
- Agentes autónomos con tool calling: su soporte nativo de function calling permite construir agentes que consultan APIs, bases de datos o ejecutan comandos, por ejemplo en automatización de tareas de oficina o gestión de sistemas.
- Razonamiento y análisis de documentos extensos: con su contexto amplio, puede resumir o extraer información de informes, contratos o artículos científicos de gran longitud sin necesidad de truncamiento.
- Generación de código asistida: aunque no se especifican benchmarks de código, su capacidad de razonamiento y function calling lo hace útil para sugerencias de código en entornos de desarrollo integrados (IDEs) locales.
- Despliegue en el borde (edge): al activar solo 1,3B parámetros, puede ejecutarse en dispositivos con poca memoria, como Raspberry Pi con cuantizaciones pequeñas (Q3_K_M o IQ2_M) o en GPUs integradas.
- Prototipado rápido de aplicaciones de IA: gracias a su licencia MIT y a la disponibilidad de cuantizaciones GGUF, es fácil integrarlo en proyectos con llama.cpp, Ollama o servidores compatibles para pruebas y validación de conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda consultar la documentación oficial de inclusionAI para obtener datos de rendimiento adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaño de archivo):
  - BF16: 15,8 GB
  - UD-Q8_K_XL: 11,19 GB
  - Q8_0: 8,41 GB
  - UD-Q6_K_XL: 7,27 GB
  - Q6_K: 6,50 GB
  - Q5_K_M: 5,64 GB
  - Q5_K_S: 5,48 GB
  - Q4_K_M: 4,82 GB
  - MXFP4_MOE: 4,72 GB
  - Q3_K_M: 3,84 GB
  - IQ2_M: 2,70 GB
  - Q1_0: 1,30 GB
- GPUs recomendadas: se ha probado con éxito en RTX 4070 y RTX 3060 (según la model card). Para cuantizaciones pequeñas (Q3_K_M o inferiores) puede ejecutarse en GPUs con 4 GB de VRAM o menos.
- Es posible ejecutar el modelo en CPU con cuantizaciones bajas (Q1_0, IQ2_M, Q3_K_M, Q5_K_S, Q5_K_M) según las pruebas de validación.
- Opciones de despliegue: llama.cpp (rama `bailingmoe3-support`), llama-server, y potencialmente otros runners compatibles con GGUF una vez que el soporte se integre en el upstream (PR #26608).
- Latencia y throughput: no se proporcionan datos específicos; dependerán de la cuantización, el hardware y la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Ling-3.0-tiny se posiciona como un MoE ligero con 7,9B totales y 1,3B activos, similar en concepto a otros modelos MoE pequeños como DeepSeek-V2-Lite (16B totales, 2,4B activos) o Qwen2.5-7B-Instruct (denso, 7,6B). Sin embargo, no se han publicado benchmarks que permitan una comparación cuantitativa. Se recomienda consultar la documentación oficial de inclusionAI para obtener comparativas con otros modelos de la serie Ling o de la competencia.

## Limitaciones y advertencias

- La arquitectura `bailingmoe3` requiere una versión específica de llama.cpp (rama `bailingmoe3-support`) hasta que el soporte se integre en el upstream. Las builds estándar de llama.cpp no cargarán estos archivos.
- No se han publicado datos sobre sesgos, alucinaciones o rendimiento en idiomas distintos del inglés. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.
- La ventana de contexto de 131.072 tokens es la configuración publicada, pero la documentación web menciona 256K; es posible que existan variantes con contexto mayor, pero no se incluyen en esta conversión GGUF.
- Aunque la licencia MIT permite uso comercial, el modelo base (inclusionAI/Ling-3.0-tiny) puede tener términos adicionales; se recomienda revisar la licencia del modelo original.
- Las cuantizaciones extremas (Q1_0, IQ2_M) pueden degradar significativamente la calidad de las respuestas; se recomienda probar varias para encontrar el equilibrio adecuado.
- No se incluye un bloque MTP, lo que puede afectar a la velocidad de generación en comparación con modelos que lo incorporan.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/Ling-3.0-tiny-GGUF
- Modelo base (safetensors): https://huggingface.co/inclusionAI/Ling-3.0-tiny
- Rama de llama.cpp con soporte BailingMoE3: https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support
- PR de integración en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/26608
- Documentación oficial de Ling: https://developer.ant-ling.com/en/docs/models/ling/
