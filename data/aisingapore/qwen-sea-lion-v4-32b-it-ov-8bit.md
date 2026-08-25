# aisingapore/Qwen-SEA-LION-v4-32B-IT-OV-8BIT

## Resumen

Qwen-SEA-LION-v4-32B-IT-OV-8BIT es una versión cuantizada a INT8 en formato OpenVINO IR del modelo Qwen-SEA-LION-v4-32B-IT, desarrollado por AI Singapore dentro del proyecto SEA-LION (Southeast Asian Languages In One Network). Este modelo está diseñado específicamente para tareas de procesamiento del lenguaje natural en lenguas del sudeste asiático, incluyendo birmano, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita, además de inglés.

El modelo base se construyó mediante continuación de pre-entrenamiento y post-entrenamiento sobre Qwen3-32B, que emplea una arquitectura decoder basada en Gemma 3. Esta variante OpenVINO INT8 ha sido optimizada para inferencia en dispositivos Intel, incluyendo AI PCs, manteniendo una precisión de pesos superior a la versión INT4 a costa de un mayor consumo de memoria. El contexto soportado es de 32.000 tokens y la licencia es MIT, lo que permite uso comercial sin restricciones.

La relevancia de esta versión radica en su capacidad para ejecutarse en hardware Intel de consumo (CPU, GPU integrada, NPU) mediante OpenVINO, facilitando el despliegue local de un modelo de 32B parámetros con buen rendimiento en tareas multilingües del sudeste asiático. Es una opción práctica para desarrolladores que necesitan inferencia on-device sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Gemma 3, basada en Qwen3-32B) |
| Parametros totales | 32B (Qwen3-32B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | INT8 (OpenVINO, ratio 1.0, group-size 128); también disponibles INT4 OpenVINO, GGUF INT8/INT4 y BF16 original |
| Idiomas soportados | Birmano, inglés, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT8) |

## Arquitectura y entrenamiento

El modelo base Qwen-SEA-LION-v4-32B-IT se obtuvo mediante continuación de pre-entrenamiento en inglés y lenguas del sudeste asiático sobre Qwen3-32B, un decoder con arquitectura Gemma 3. Posteriormente se realizó un post-entrenamiento para instrucciones (instruction tuning) que incorpora capacidades de razonamiento, function calling y soporte multilingüe. El tokenizador es el mismo que el de Qwen3-32B.

Esta versión OpenVINO INT8 no ha sido re-entrenada; se ha obtenido mediante compresión de pesos con NNCF (Neural Network Compression Framework) y Optimum-Intel, utilizando weight-only quantization con ratio 1.0 y group-size 128. El proceso de exportación a OpenVINO IR preserva la arquitectura original y permite inferencia optimizada en hardware Intel.

## Capacidades

- Generación de texto y conversación multilingüe, con especialización en lenguas del sudeste asiático (birmano, indonesio, jemer, lao, malayo, mandarín, tagalo, tamil, tailandés y vietnamita).
- Razonamiento avanzado y resolución de problemas en múltiples dominios, heredado de Qwen3-32B.
- Soporte de function calling / tool calling, permitiendo integración con APIs y agentes.
- Capacidades de agente y razonamiento multi-paso (multi-step reasoning).
- Comprensión de contexto largo (hasta 32.000 tokens), útil para documentos extensos y conversaciones multi-turno.
- Inferencia on-device optimizada para hardware Intel mediante OpenVINO, con soporte para CPU, GPU integrada y NPU.

## Casos de uso

- Atención al cliente automatizada en empresas del sudeste asiático: el modelo gestiona conversaciones multi-turno en idiomas como tailandés, vietnamita o indonesio, con contexto de 32k tokens para mantener el historial completo de la interacción.
- Traducción y localización de contenido: al dominar 11 idiomas de la región, puede traducir documentos, sitios web y aplicaciones entre lenguas SEA y el inglés, con calidad superior a modelos genéricos.
- Generación de código en entornos de desarrollo: soporta function calling y puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código, especialmente en equipos multilingües.
- Asistentes virtuales para administración pública: dado su entrenamiento en contextos culturales y lingüísticos locales, puede responder consultas sobre trámites, servicios y normativas en los idiomas oficiales de cada país.
- Análisis de sentimiento y moderación de contenido en redes sociales: su capacidad multilingüe permite procesar comentarios en tagalo, malayo o birmano, identificando tono y contenido inapropiado.
- Educación y tutoría personalizada: puede explicar conceptos en el idioma nativo del estudiante, adaptando el nivel de detalle y usando ejemplos culturalmente relevantes.
- Despliegue en dispositivos edge con Intel: al estar optimizado para OpenVINO, puede ejecutarse en portátiles o mini-PCs con Intel Iris Xe o Arc, sin conexión a internet, para aplicaciones de privacidad sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada OpenVINO INT8 en la información disponible. El modelo base Qwen-SEA-LION-v4-32B-IT reporta un rendimiento superior a otros modelos abiertos de menos de 200B parámetros en tareas del sudeste asiático, y comparable a modelos cerrados de mayor tamaño, según la documentación oficial. Sin embargo, no se proporcionan cifras numéricas concretas (MMLU, HumanEval, GSM8K, etc.) en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- El tamaño del repositorio es de 32,8 GB, correspondiente a los pesos en INT8. Para inferencia se recomienda una GPU con al menos 40 GB de VRAM (por ejemplo, NVIDIA A100 40GB, RTX 4090 24GB no sería suficiente para cargar todo el modelo con contexto completo; se necesitaría más de 32 GB). Alternativamente, puede ejecutarse en CPU con 64 GB de RAM o más.
- Al ser formato OpenVINO, está optimizado para hardware Intel: GPU integrada (Iris Xe, Arc), NPU (Intel AI Boost) y CPU modernas. En un Intel AI PC con 32 GB de RAM, es posible ejecutar el modelo con cuantización INT8 y contexto reducido.
- Opciones de despliegue: OpenVINO GenAI (LLMPipeline), Optimum Intel, o mediante el runtime de OpenVINO. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que estos requieren formatos como safetensors o GGUF.
- La latencia y el throughput dependen del hardware. En una GPU Intel Arc A770, se estima una generación de 10-20 tokens por segundo con batch size 1, aunque estos valores no están publicados oficialmente.

## Comparativa con modelos similares

| Modelo | Formato | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen-SEA-LION-v4-32B-IT (BF16) | safetensors | 32B | 32k | MIT | Modelo original, precisión completa, requiere ~65 GB VRAM |
| Qwen-SEA-LION-v4-32B-IT-8BIT (GGUF) | GGUF INT8 | 32B | 32k | MIT | Compatible con llama.cpp, Ollama, vLLM |
| Qwen-SEA-LION-v4-32B-IT-OV-4BIT | OpenVINO INT4 | 32B | 32k | MIT | Menor huella de memoria (~16 GB), menor precisión |
| Qwen3-32B (base) | safetensors | 32B | 32k | Apache 2.0 | Modelo original sin adaptación SEA, menos preciso en lenguas regionales |

La versión OpenVINO INT8 ofrece un equilibrio entre precisión y eficiencia, pero limita el despliegue a entornos que soporten OpenVINO. Para usuarios que prefieran ecosistemas estándar, la versión GGUF INT8 es más versátil.

## Limitaciones y advertencias

- Al ser una cuantización INT8, puede haber una ligera degradación en la calidad de generación respecto al modelo BF16 original, especialmente en tareas de razonamiento complejo o matemáticas.
- El modelo está especializado en lenguas del sudeste asiático; su rendimiento en otros idiomas (por ejemplo, español, francés) es inferior al de modelos multilingües genéricos.
- No se han realizado evaluaciones específicas de sesgos o alucinaciones en esta versión cuantizada. Se recomienda consultar la model card del modelo base para conocer los riesgos conocidos.
- El formato OpenVINO IR no es compatible con bibliotecas de inferencia populares como vLLM, TGI o llama.cpp, lo que limita su integración en infraestructuras existentes.
- El tamaño de 32,8 GB requiere hardware con suficiente memoria; en GPUs de consumo (24 GB) no es posible cargar el modelo completo, por lo que se necesitan soluciones de offloading o cuantización más agresiva (INT4).
- La licencia MIT permite uso comercial sin restricciones, pero el modelo puede reflejar sesgos culturales o lingüísticos de los datos de entrenamiento, que no han sido documentados en detalle.

## Enlaces

- [Modelo en Hugging Face (OpenVINO INT8)](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT-OV-8BIT)
- [Modelo base Qwen-SEA-LION-v4-32B-IT](https://huggingface.co/aisingapore/Qwen-SEA-LION-v4-32B-IT)
- [Documentación oficial SEA-LION](https://docs.sea-lion.ai/models/sea-lion-v4/qwen-sea-lion-v4-32b)
- [Anuncio del blog SEA-LION v4](https://sea-lion.ai/blog/qwen-sea-lion-v4-advanced-reasoning/)
- [Repositorio GitHub SEA-LION](https://github.com/aisingapore/sealion/blob/main/models/sea-lion-v4/qwen-sea-lion-v4-32B.md)
- [OpenVINO GenAI](https://github.com/openvinotoolkit/openvino.genai)
- [Guía de optimización de pesos OpenVINO](https://docs.openvino.ai/2025/openvino-workflow/model-optimization-guide/weight-compression.html)
