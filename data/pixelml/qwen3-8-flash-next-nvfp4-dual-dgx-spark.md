# PixelML/Qwen3.8-Flash-Next-NVFP4-Dual-DGX-Spark

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de arquitectura MoE ultra-sparse desarrollado por Qwen, con 125B parámetros totales (incluyendo una tabla n-gram de 51B) y solo 6B activos por token. Su arquitectura híbrida combina Gated DeltaNet (GDN) en tres de cada cuatro capas y Qwen Sparse Attention (QSA) en la cuarta, lo que permite manejar contextos de hasta 262.144 tokens con un coste de atención y memoria KV reducido. Está diseñado para aplicaciones intensivas en contexto como agentic coding, procesamiento de documentos y flujos de trabajo con herramientas.

Este repositorio concreto es un mirror exacto y atribuido de la cuantización NVFP4 realizada por RadixArk con NVIDIA Model Optimizer, publicado por PixelML junto con una receta de despliegue reproducible en dos nodos NVIDIA DGX Spark. La cuantización NVFP4 (W4A4) se aplica únicamente a los expertos enrutados de las 48 capas MoE principales; el resto de tensores (atención, QSA, GDN, mHC, expertos compartidos, routers, embeddings, LM head, visión y MTP) permanecen en BF16, y las tablas n-gram PLE usan pesos FP8. El checkpoint cuantizado pesa 119,6B parámetros según safetensors.

La relevancia actual del modelo radica en que permite ejecutar un modelo de ~120B parámetros en hardware de consumo profesional (dos DGX Spark con 128 GB de memoria unificada cada uno) gracias a la cuantización y a la optimización de SGLang para GB10/SM121, alcanzando un throughput agregado de 275 tok/s con 16 peticiones concurrentes y decodificación especulativa NEXTN/MTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido multimodal (GDN + QSA) sobre base Qwen4 |
| Parametros totales | 119.602.003.859 (checkpoint cuantizado, safetensors); el modelo base declara 125B según vLLM (incluye tabla n-gram de 51B); algunas fuentes citan 176B |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4) en expertos enrutados; BF16 en el resto; FP8 en tablas n-gram PLE |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (con condiciones comerciales separadas para Model-as-a-Service y AI Work Assistant) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE ultra-sparse con cuatro mecanismos principales: Gated DeltaNet (GDN) comprime el historial en tres de cada cuatro capas, mientras que la cuarta capa usa Qwen Sparse Attention (QSA) para recuperación precisa de largo alcance. Además incorpora una tabla n-gram de 51B parámetros para búsqueda local rápida de tokens, junto con los mecanismos GDN y QSA. El modelo es multimodal (entrada de imagen y texto, salida de texto).

La cuantización NVFP4 fue realizada por RadixArk con NVIDIA Model Optimizer, aplicando W4A4 únicamente a los expertos enrutados de las 48 capas MoE principales. La calibración se realizó con 128 artículos de cnn_dailymail más sondeos de representatividad adicionales. Los tensores de atención, QSA, GDN, mHC, expertos compartidos, routers, embeddings, LM head, visión y MTP se mantienen en BF16; las tablas n-gram PLE usan pesos FP8. No se dispone de información detallada sobre el entrenamiento original del modelo base (datos, número de tokens, fases de RLHF/DPO).

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto, y genera respuestas de texto.
- Razonamiento avanzado: el modelo base supera a Claude-4.6-Opus (Max) en tareas de agentic coding, visión y chat según documentación de unsloth.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Decodificación especulativa: soporta NEXTN/MTP (Multi-Token Prediction), que mejora el throughput de generación.
- Capacidades de agente: el modelo base está diseñado para flujos de trabajo con herramientas y agentic coding, aunque no se confirma explícitamente el soporte de tool calling en la información disponible.
- Multilingüismo: no se especifican los idiomas soportados en la documentación consultada.

## Casos de uso

- Agentic coding: el modelo puede gestionar tareas de programación complejas con múltiples pasos, aprovechando su contexto de 262K tokens para mantener el estado completo del repositorio y las instrucciones. Su rendimiento declarado supera a Claude-4.6-Opus en esta categoría.
- Procesamiento de documentos largos: con 262K tokens de contexto, puede resumir, extraer información o responder preguntas sobre manuales técnicos, informes financieros o expedientes legales completos sin necesidad de dividir el texto.
- Despliegue en hardware de borde profesional: la cuantización NVFP4 y la receta de despliegue en dos DGX Spark permiten ejecutar un modelo de ~120B en entornos sin acceso a GPUs de centro de datos, ideal para prototipos y entornos de investigación.
- Servicio de inferencia concurrente: las mediciones de PixelML muestran un throughput agregado de 275 tok/s con 16 peticiones concurrentes, lo que lo hace viable para servir a múltiples usuarios en un clúster pequeño.
- Investigación en arquitecturas híbridas: el modelo sirve como banco de pruebas para estudiar la combinación de GDN, QSA y MoE ultra-sparse en tareas de razonamiento y recuperación de largo alcance.
- Evaluación de cuantización agresiva: al mantener la mayor parte de los tensores en BF16 y cuantizar solo los expertos enrutados, permite analizar el impacto de la cuantización NVFP4 en la calidad de salida frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas mediciones publicadas son de rendimiento de inferencia realizadas por PixelML con SGLang, decodificación especulativa NEXTN/MTP y peticiones de codificación de 192 tokens:

| Peticiones concurrentes | Throughput agregado (tok/s) |
| ---: | ---: |
| 1 | 47,54 |
| 4 | 87,55 |
| 8 | 158,17 |
| 16 | 275,37 |

La mejora de throughput de una sola petición pasó de 26,09 a 47,54 tok/s gracias a NEXTN/MTP. Estas son mediciones de despliegue, no de calidad del modelo.

## Requisitos de hardware

- Configuración validada: dos nodos NVIDIA DGX Spark, cada uno con una GPU GB10 y 128 GB de memoria unificada, conectados por RoCE.
- SGLang con tensor parallelism TP=2, parche de compatibilidad SM121 para GB10.
- La cuantización NVFP4 reduce el peso del checkpoint a 135,2 GB en el repositorio, lo que permite cargarlo en la memoria unificada combinada de 256 GB de los dos nodos.
- Según unsloth, el modelo base puede ejecutarse localmente con 78 GB de RAM/unified memory sin VRAM dedicada, aunque no se especifica si esto aplica a esta versión cuantizada.
- Opciones de despliegue: SGLang (validado), vLLM (el modelo base tiene recetas en vLLM), llama.cpp/Ollama (no confirmado para esta cuantización).
- Latencia y throughput: 47,54 tok/s en una sola petición y 275,37 tok/s agregados con 16 peticiones concurrentes, medidos en la configuración dual DGX Spark.

## Comparativa con modelos similares

No se dispone de datos de comparación directa con otros modelos en la información proporcionada. El modelo base Qwen3.8-Flash-Next se posiciona como competidor de Claude-4.6-Opus (Max) en agentic coding, visión y chat según unsloth, pero no hay benchmarks publicados que respalden esta afirmación. Tampoco hay comparativas con otras cuantizaciones del mismo modelo (por ejemplo, FP8 o BF16) en los documentos consultados.

## Limitaciones y advertencias

- Licencia restrictiva: la Qwen Community License 1.0 incluye condiciones comerciales separadas para negocios de Model-as-a-Service y AI Work Assistant; los usuarios deben revisar el texto completo de la licencia antes de usar el modelo en producción.
- Cuantización parcial: solo los expertos enrutados están cuantizados en NVFP4; el resto de tensores permanecen en BF16, lo que limita la reducción de memoria respecto a una cuantización completa.
- Hardware específico: el despliegue validado requiere dos DGX Spark con GB10 y RoCE; no se garantiza el funcionamiento en otras configuraciones sin adaptación.
- Sin datos de sesgos ni de alucinación: no se han publicado evaluaciones de sesgos, robustez o tasas de alucinación para este modelo o su versión cuantizada.
- Discrepancia en el número de parámetros: las fuentes citan 125B, 176B y 119,6B según el método de conteo; esto puede confundir a la hora de planificar recursos.
- Sin benchmarks de calidad: no hay resultados de MMLU, HumanEval, GSM8K u otros para esta cuantización, por lo que no se puede evaluar la degradación de rendimiento frente al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PixelML/Qwen3.8-Flash-Next-NVFP4-Dual-DGX-Spark
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización original de RadixArk: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Receta de despliegue de PixelML (GitHub): https://github.com/PixelML/qwen3-8-flash-next-sglang-2x-dgx-spark
- Repo alternativo de despliegue (MiaAI-Lab): https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Dual-DGX-Sparks
- Recetas vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Documentación de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Blog de NVIDIA sobre GB300 NVL72: https://developer.nvidia.com/blog/experiment-with-qwen3-8-flash-next-176b-model-on-nvidia-gb300-nvl72-for-agentic-coding/
- Hilo en foros de NVIDIA: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228
