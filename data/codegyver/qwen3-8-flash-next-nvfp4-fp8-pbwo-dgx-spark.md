# codegyver/Qwen3.8-Flash-Next-NVFP4-FP8-PBWO-DGX-Spark

## Resumen

El modelo `codegyver/Qwen3.8-Flash-Next-NVFP4-FP8-PBWO-DGX-Spark` es un derivado comunitario experimental de `Inferact/Qwen3.8-Flash-Next-NVFP4`, diseñado específicamente para inferencia de baja latencia en una única NVIDIA DGX Spark (GB10, SM121) mediante vLLM. Su objetivo es reducir el tráfico de memoria de las proyecciones densas que se ejecutan en cada token generado, manteniendo intactos los expertos MoE en formato NVFP4. Para ello, convierte 156 matrices de las capas QSA (Quantum State Attention) y GDN (Gated DeltaNet) a FP8 blockwise weight-only (128×128 bloques), sin entrenamiento adicional ni calibración.

El modelo base, Qwen3.8-Flash-Next, es una arquitectura multimodal MoE de la familia Qwen4 en fase experimental, con 125B parámetros principales más 51B de embeddings n-gram, y 6B parámetros activos por token. Incorpora los mecanismos GDN y QSA, y soporta decodificación especulativa con MTP (multi-token prediction). Este derivado añade una capa de optimización de precisión mixta para maximizar el rendimiento en hardware GB10, logrando mejoras de throughput de hasta un 6,1% respecto al checkpoint fuente en pruebas de generación larga.

La relevancia de este modelo radica en su enfoque quirúrgico: en lugar de cuantizar todo el checkpoint, solo convierte las proyecciones densas que se leen en cada paso, preservando la calidad de los expertos y reduciendo la latencia en escenarios de generación prolongada. Es una solución práctica para desarrolladores que buscan desplegar modelos MoE de gran tamaño en hardware de consumo profesional como DGX Spark, sin sacrificar la precisión de las capas críticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con GDN (Gated DeltaNet) y QSA, embeddings n-gram (Qwen4 experimental) |
| Parametros totales | 118.343.712.659 (~118,34B) |
| Parametros activos | 6B (dato del modelo base Qwen3.8-Flash-Next) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos MoE), FP8 E4M3 blockwise 128×128 (proyecciones densas QSA y GDN) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia comunitaria Qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next combina un MoE con dos mecanismos innovadores: Gated DeltaNet (GDN), que introduce una capa de atención con compuertas y recurrencia lineal para reducir el coste computacional, y QSA (Quantum State Attention), un mecanismo de atención basado en estados cuánticos que indexa información relevante de forma eficiente. Además, utiliza una tabla de embeddings n-gram de 51B parámetros para acelerar la generación local de tokens. El modelo es multimodal, capaz de procesar entradas de imagen y texto, y soporta decodificación especulativa mediante MTP (multi-token prediction) con 3 tokens especulativos por defecto.

Este derivado concreto no ha sido entrenado: es una conversión de precisión mixta realizada sobre el checkpoint NVFP4 de Inferact. Se convirtieron 156 matrices densas (48 de las capas QSA y 108 de las capas GDN) a FP8 blockwise weight-only con escalas de bloque de 128×128, serializadas para el camino nativo `FP8_PB_WO` de vLLM con ModelOpt. No se utilizó dataset de calibración y el resto de componentes (expertos, embeddings, vision stack, MTP, routers, normas, hyperconnections) permanece intacto. El resultado es un checkpoint optimizado para el hardware GB10, donde la lectura repetida de pesos densos en cada token era el cuello de botella principal.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto, generando respuestas textuales coherentes.
- Razonamiento y resolución de problemas: incluye bloques de pensamiento preservados ("preserved thinking") que mantienen el razonamiento completo a lo largo de la conversación, útil para agentes multi-paso.
- Generación de código y JSON estructurado: validado en pruebas de código y salida JSON con buen rendimiento.
- Matemáticas: capacidad de resolver problemas aritméticos y algebraicos básicos.
- Decodificación especulativa: soporta MTP con 3 tokens especulativos, reduciendo la latencia de generación.
- Tool calling y agentes: no se confirma explícitamente, pero la arquitectura Qwen4 con preserved thinking está diseñada para escenarios de agente; no hay datos concretos en la información disponible.
- Optimización específica para DGX Spark: el checkpoint está ajustado para ejecutarse eficientemente en GB10 con vLLM, aprovechando la mezcla NVFP4 + FP8.

## Casos de uso

- Despliegue de inferencia en DGX Spark: el caso principal es servir el modelo en una única DGX Spark con vLLM, aprovechando la mezcla de precisión para maximizar el throughput en generación larga (ej. 39,8 tok/s en LongCode).
- Generación de código en entornos profesionales: con soporte para salida de código y JSON, puede integrarse en pipelines de CI/CD para autocompletar, revisar o documentar código, reduciendo latencia en iteraciones frecuentes.
- Asistentes conversacionales multimodales: al aceptar imágenes, puede describir capturas de pantalla, diagramas o fotos en tiempo real, útil para soporte técnico o formación.
- Razonamiento multi-paso en agentes: gracias al preserved thinking, puede mantener cadenas de razonamiento consistentes a lo largo de conversaciones largas, adecuado para automatización de tareas de investigación o análisis.
- Generación de respuestas estructuradas (JSON): para APIs que requieren salidas formateadas, el modelo muestra buen rendimiento (47,2 tok/s en pruebas JSON), ideal para extracción de datos o integración con sistemas externos.
- Evaluación de modelos cuantizados: al ser un derivado experimental, sirve como banco de pruebas para comparar estrategias de cuantización mixta en hardware GB10, permitiendo a investigadores medir el impacto de FP8 blockwise frente a NVFP4 puro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que no se ha realizado una evaluación amplia de equivalencia con el checkpoint fuente. Sin embargo, se proporcionan mediciones de throughput en una DGX Spark con vLLM y MTP (3 tokens especulativos), que se presentan a continuación.

| Prueba | Source NVFP4 (tok/s) | Este checkpoint (tok/s) | Variación |
|---|---|---|---|
| Q&A | 31,6 | 37,8 | +19,6% |
| Code | 31,9 | 39,5 | +23,8% |
| JSON | 41,4 | 47,2 | +14,0% |
| Math | 35,9 | 41,0 | +14,2% |
| LongCode (2048 tokens) | 37,5 | 39,8 | +6,1% |

Nota: las pruebas Q&A, Code, JSON y Math son mediciones direccionales con longitudes de salida variables (no A/B estrictas). LongCode es la comparación más limpia, ya que ambos runs generaron exactamente 2048 tokens. La ganancia global es de aproximadamente +6,1% frente al checkpoint fuente y +15,7% frente a un experimento que solo convertía capas QSA.

## Requisitos de hardware

- Hardware objetivo: NVIDIA DGX Spark / GB10 (SM121), validado en configuración de un solo dispositivo.
- VRAM: no se especifica el consumo exacto, pero la caché KV se asignó con ~24 GiB (25770700084 bytes) para 8 secuencias máximas con bloque de 32.
- GPU recomendadas: exclusivamente DGX Spark; no se ha probado en otras GPUs (A100, H100, RTX 4090, etc.) y el autor no proporciona datos al respecto.
- Opciones de despliegue: vLLM con imagen preview `vllm/vllm-openai:qwen38-flash-next` y versión `0.1.dev20073+g8e685d198`. Se requiere un backport de compatibilidad para conectar `quant_algo: "FP8_PB_WO"` al método `ModelOptFp8PbWoLinearMethod` existente en vLLM. También se menciona SGLang en el repo GitHub de tonyd2wild para despliegue en 2× DGX Spark con tensor parallel.
- Latencia y throughput: medidos en pruebas de generación larga, entre 37,8 y 47,2 tok/s según la tarea, con MTP activado y expert parallel habilitado.
- Configuración de ejecución: tensor parallel 1, expert parallel habilitado, PLE CPU offload, modo de rendimiento `interactivity`, DeepGEMM deshabilitado en la ruta GB10 probada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Precisión | Hardware objetivo | Throughput (LongCode) | Licencia |
|---|---|---|---|---|---|---|
| codegyver/Qwen3.8-Flash-Next-NVFP4-FP8-PBWO-DGX-Spark | 118,34B | 6B | NVFP4 + FP8_PB_WO | DGX Spark | 39,8 tok/s | qwen-community-1.0 |
| Inferact/Qwen3.8-Flash-Next-NVFP4 (source) | 118,34B | 6B | NVFP4 (todo) | DGX Spark | 37,5 tok/s | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (original) | 125B + 51B n-gram | 6B | BF16 (presumible) | Multi-GPU | no disponible | qwen-community-1.0 |

La comparativa directa con el checkpoint fuente muestra la ganancia de rendimiento del derivado. El modelo original de Qwen no tiene datos de rendimiento en DGX Spark publicados en la información disponible. No se dispone de comparaciones con otros modelos MoE de tamaño similar (como DeepSeek-V3 o Mixtral) en este contexto específico, por lo que no se incluyen.

## Limitaciones y advertencias

- Modelo experimental: es un derivado comunitario no oficial, sin respaldo de Qwen, Inferact, NVIDIA o vLLM. No se ha publicado una evaluación de calidad que demuestre equivalencia con el checkpoint fuente; se recomienda evaluar en cargas de trabajo propias antes de usarlo en producción.
- Sin calibración: la conversión a FP8 se realizó sin dataset de calibración, lo que puede introducir degradación en tareas sensibles a la precisión numérica.
- Requisitos de software específicos: necesita una versión preview de vLLM y un backport de compatibilidad; no funciona con versiones estándar sin modificaciones.
- Licencia restrictiva: la licencia qwen-community-1.0 puede imponer restricciones al uso comercial; se debe revisar el texto completo de la licencia antes de su despliegue.
- Sesgos y alucinaciones: al ser un modelo de gran tamaño entrenado con datos web, puede presentar sesgos sociales y generar contenido falso o alucinado, especialmente en dominios especializados.
- Contexto limitado: no se ha especificado la longitud de contexto soportada; se desconoce si difiere del modelo base.
- Rendimiento no generalizable: las mediciones de throughput solo son válidas para la configuración probada (DGX Spark, vLLM preview, MTP=3); otros entornos pueden ofrecer resultados diferentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codegyver/Qwen3.8-Flash-Next-NVFP4-FP8-PBWO-DGX-Spark
- Modelo base (Inferact): https://huggingface.co/Inferact/Qwen3.8-Flash-Next-NVFP4
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Repo GitHub de despliegue en DGX Spark (tonyd2wild): https://github.com/tonyd2wild/qwen3.8-flash-next-nvfp4-dgx-spark
- Foro de NVIDIA sobre Qwen3.8-Flash-Next en DGX Spark: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228
