# Interactify/Qwen3.8-Flash-Next-Slipstream

## Resumen

Qwen3.8-Flash-Next-Slipstream es una cuantización NVFP4 del checkpoint oficial Qwen/Qwen3.8-Flash-Next, publicada por Interactify para su propio motor de inferencia Slipstream. No se trata de un fine-tune de pesos en el sentido clásico, sino de un empaquetado específico del modelo base en el formato propietario del motor (`weights.vbin` + `index.json` por directorio), pensado para ejecutarse en hardware NVIDIA DGX Spark (GB10, 128 GB de memoria unificada por nodo). El modelo base es de la familia Qwen 3.8, con torre de visión incluida y una cabeza MTP (multi-token prediction) que el motor utiliza para decodificación especulativa.

La relevancia de esta publicación es doble. Por un lado, demuestra una ruta de despliegue de un modelo grande en hardware de escritorio de gama alta (dos Spark conectados por un enlace de 200 GbE, o uno solo en TP1). Por otro, documenta decisiones de cuantización poco habituales: expertos enrutados y tablas n-gram en NVFP4 con escalas de activación W4A4 calibradas, el resto de pesos en mayor precisión y copias MXFP8 para prefill, con proyecciones de atención en 8 bits que según el autor mejoran la perplejidad un 4-6 % frente a todo-4-bit a cambio de un 8 % más de bytes.

El repositorio ocupa 245,6 GB e incluye cuatro directorios: pesos TP1, pesos TP2 por rango (r0 y r1) y la torre de visión en BF16. La licencia es Qwen Community License 1.0, la misma del modelo base, con condiciones específicas para productos de gran escala y para negocios de Model-as-a-Service o asistentes de trabajo con IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), torre de visión y cabeza MTP; cuantización NVFP4 en expertos enrutados y tablas n-gram, resto en mayor precisión, copias MXFP8 para prefill |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE, pero no se publica el recuento) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (W4A4 calibrado en expertos enrutados y tablas n-gram), MXFP8 (prefill), proyecciones de atención en 8 bits, torre de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | Propietario de Slipstream (`weights.vbin` + `index.json`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos que incorpora una torre de visión y una cabeza de predicción multi-token (MTP). Esta publicación no entrena el modelo: parte del checkpoint oficial en BF16 y aplica un pipeline de cuantización con los conversores de Slipstream (commit `20c2dd9`, 31 de octubre de 2026). Los expertos enrutados y las tablas n-gram se convierten a NVFP4 con escalas de activación W4A4 calibradas; el resto de pesos se mantiene en mayor precisión y se generan copias MXFP8 para la fase de prefill. Las proyecciones de atención se conservan en 8 bits.

La innovación técnica destacable no está en el entrenamiento sino en el formato de despliegue. Los pesos se empaquetan en el formato nativo del motor, con shards separados para tensor parallelism de grado 1 y 2, y se acompaña de la torre de visión en BF16 para el nodo rank 0. El motor aprovecha la cabeza MTP del propio modelo para generar borradores de decodificación especulativa, lo que reduce el coste por token generado sin necesidad de un modelo draft externo. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventanas de hasta 262.144 tokens.
- Procesamiento de imágenes mediante la torre de visión incluida en el repositorio (`qwen38_vision`, BF16).
- Tool calling y function calling: el autor reporta 88/100 en tool-eval-bench sobre 92 escenarios.
- Ejecución de agentes multi-paso, con un turno de agente de mediana de 2,5 s según las mediciones del autor.
- Decodificación especulativa nativa mediante la cabeza MTP del modelo, integrada en el motor Slipstream.
- Compatibilidad con las APIs de OpenAI y Anthropic a través del servidor de Slipstream en el puerto 8080.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un asistente de código con contexto largo en infraestructura propia: con 262.144 tokens de ventana, el modelo puede ingerir repositorios completos o varios ficheros de gran tamaño en una sola pasada, y el soporte de tool calling permite integrarlo en bucles de edición y ejecución de tests.
- Atención al cliente automatizada con historial extenso: la ventana de contexto permite mantener conversaciones multi-turno con trazas de CRM, tickets previos y documentación de producto sin truncar, y el servidor compatible con la API de OpenAI facilita la integración con frameworks existentes.
- Agentes autónomos de investigación: el rendimiento medido en tool-eval-bench (88/100) y la latencia de turno de 2,5 s lo hacen adecuado para pipelines de agentes que encadenan búsquedas, llamadas a APIs y síntesis de resultados.
- Análisis de documentos con imágenes: la torre de visión en BF16 permite procesar capturas, diagramas y PDFs escaneados junto con texto en la misma ventana de contexto.
- Inferencia en hardware de sobremesa de gama alta: los shards TP1 caben en una única DGX Spark (128 GB), lo que permite montar un servicio privado sin depender de GPUs de centro de datos.
- Procesamiento por lotes de documentación técnica: los perfiles de prefill medidos (2.110 tokens/s a 0,9k, 3.160 a 3,5k y 3.410 a 13,8k) indican que el modelo es viable para ingesta masiva de documentos en un solo nodo.
- Despliegue en clúster pequeño con TP2: dos Spark unidos por 200 GbE permiten servir el modelo con tensor parallelism de grado 2, útil para equipos que necesitan mayor throughput sin salir del ecosistema GB10.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Prefill (contexto 0,9k) | 2.110 tokens/s |
| Prefill (contexto 3,5k) | 3.160 tokens/s |
| Prefill (contexto 13,8k) | 3.410 tokens/s |
| tool-eval-bench | 88/100 (92 escenarios) |
| Turno de agente, mediana | 2,5 s |
| Perplejidad, atención en 8-bit vs. todo-4-bit | 4-6 % mejor, con ~8 % más bytes de pesos |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria: el repositorio completo ocupa 245,6 GB, pero cada configuración de despliegue descarga solo un subconjunto. TP1 requiere una DGX Spark (GB10, 128 GB); TP2 requiere dos unidades.
- GPU recomendadas: NVIDIA DGX Spark (GB10) en configuración de uno o dos nodos. No se documenta compatibilidad con A100, H100 ni RTX 4090.
- GPU de consumo: no es viable en GPUs de consumo convencionales; el formato propietario y el soporte NVFP4 están atados al motor Slipstream y al hardware GB10.
- Opciones de despliegue: exclusivamente Slipstream (`python server/slipstream.py serve qwen3.8-flash-next --profile balanced`). No carga en vLLM, llama.cpp, Ollama ni TGI.
- Red: en TP2 se utiliza el enlace de 200 GbE entre los dos Spark.
- Throughput y latencia: prefill de 2.110 a 3.410 tokens/s según longitud de contexto; turno de agente de mediana 2,5 s. No se publica throughput de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Slipstream | no disponible (MoE) | 262.144 | Propietario Slipstream | Qwen Community 1.0 | DGX Spark (1 o 2) |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible (MoE) | no disponible | Safetensors BF16 | Qwen Community 1.0 | GPUs de centro de datos |
| Otras cuantizaciones del mismo base | no disponible | no disponible | GGUF / AWQ / etc. | Qwen Community 1.0 | variable |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada. La comparación relevante es contra el checkpoint BF16 original: esta versión reduce el espacio de almacenamiento y permite ejecución en GB10, a costa de quedar atada al motor Slipstream.

## Limitaciones y advertencias

- Formato propietario: los ficheros `weights.vbin` no son safetensors ni GGUF y no cargan en ningún runtime distinto de Slipstream. Esto limita la portabilidad y crea dependencia del motor.
- Disponibilidad del motor: el código de Slipstream se anuncia como "coming soon"; sin él, los pesos no son utilizables.
- Licencia restrictiva para uso comercial a gran escala: Qwen Community License 1.0 incluye condiciones específicas para productos de gran tamaño y para negocios de Model-as-a-Service o asistentes de trabajo con IA. Es obligatorio revisar `LICENSE` y `NOTICE` antes de un despliegue comercial.
- Idiomas soportados no documentados: no se puede garantizar calidad en castellano ni en otras lenguas sin evaluación propia.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación; al ser una cuantización agresiva (W4A4 en expertos), es esperable una degradación adicional frente al BF16 en tareas sensibles a la precisión numérica.
- Contexto efectivo: aunque se declaran 262.144 tokens, no se publican evaluaciones de recuperación en contextos largos (needle-in-a-haystack u similares).
- Hardware cerrado: el despliegue está pensado para DGX Spark; no hay garantías de funcionamiento en otras GPUs, ni siquiera con NVFP4.
- Repositorio de 245,6 GB: la descarga selectiva por subdirectorio es imprescindible; descargar el repo completo es innecesario y costoso.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Interactify/Qwen3.8-Flash-Next-Slipstream
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor Slipstream: https://github.com/Interactify/slipstream
