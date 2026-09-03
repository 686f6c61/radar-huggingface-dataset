# ManniX-ITA/opencoti-llamafile

## Resumen

opencoti-llamafile es un motor de inferencia autocontenido en un único archivo, desarrollado por ManniX-ITA como parte del proyecto opencoti. Se basa en llamafile 0.10.5 (mantenido por mozilla-ai) e incorpora una serie de parches que amplían significativamente las capacidades del motor original: gestión avanzada de caché KV (PolyKV, TurboQuant, TCQ), ventana KV deslizante con spill a RAM, extensión de contexto de largo alcance (DCA), decodificación especulativa (MTP), atención dispersa, duplicación de capas (RYS) y una API de introspección y control en tiempo de ejecución.

No se trata de un modelo de lenguaje en sí, sino de un motor de inferencia diseñado para ejecutar modelos GGUF de forma eficiente, especialmente optimizado para las familias Gemma-4 (objetivo primario) y Qwen (objetivo secundario). Su relevancia radica en ofrecer un despliegue de un solo archivo con soporte CUDA y Vulkan, compresión de pesos GPU (~7,6× más pequeños) y funcionalidades avanzadas que no están presentes en el llamafile estándar, lo que lo convierte en una opción interesante para entornos de producción y experimentación.

El repositorio aloja los artefactos compilados (binarios .llamafile para Linux, macOS, BSD y Windows), los parches completos y la documentación. La licencia es Apache-2.0 y el tamaño del repositorio es de 55,4 GB, aunque los binarios individuales oscilan entre 46 MB y 1,2 GB según la variante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de inferencia basado en llamafile 0.10.5 (llama.cpp) con parches opencoti; no es un modelo de lenguaje |
| Parametros totales | no disponible (depende del modelo GGUF cargado) |
| Parametros activos | no disponible (depende del modelo GGUF cargado) |
| Longitud de contexto | no disponible (depende del modelo; el motor soporta extension DCA para contextos largos) |
| Tipos de cuantizacion | Soporta cualquier cuantizacion GGUF de llama.cpp; ademas incluye TurboQuant y TCQ para optimizacion de caché KV |
| Idiomas soportados | no disponible (depende del modelo GGUF cargado) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no soportado directamente; los modelos deben convertirse a GGUF) |

## Arquitectura y entrenamiento

opencoti-llamafile no es un modelo entrenado, sino un motor de inferencia derivado de llamafile 0.10.5, que a su vez se basa en llama.cpp. Su arquitectura interna es la de un ejecutable APE (Actually Portable Executable) que empaqueta el motor de inferencia junto con bibliotecas GPU comprimidas (CUDA y Vulkan) en un solo archivo. El motor incluye múltiples innovaciones técnicas implementadas como parches:

- **PolyKV**: gestión avanzada de la caché KV con cuantización y residencia dinámica en GPU, con auto-balanceo de carga basado en la ocupación real de VRAM.
- **TurboQuant y TCQ**: técnicas de cuantización optimizadas para la caché KV que reducen el uso de memoria sin pérdida significativa de calidad.
- **Rolling-KV window**: ventana KV deslizante que permite spill a RAM del host cuando la VRAM es insuficiente.
- **DCA (Deeper Context Attention)**: extensión de contexto de largo alcance para modelos de clase 1M.
- **MTP (Multi-Token Prediction)**: decodificación especulativa que predice varios tokens por paso, con soporte para drafters específicos de Gemma-4 y auto-especulación NextN para Qwen.
- **Sparse attention**: atención dispersa para reducir el coste computacional en secuencias largas.
- **RYS (Repeat Your Self)**: duplicación de capas para mejorar la capacidad del modelo sin aumentar el número de parámetros.

El motor no se entrena; simplemente ejecuta modelos GGUF existentes. Los parches están diseñados y validados específicamente para las familias Gemma-4 y Qwen, mientras que otras arquitecturas funcionan con el comportamiento estándar de llama.cpp sin las optimizaciones.

## Capacidades

- Ejecución de cualquier modelo GGUF compatible con llama.cpp, con aceleración GPU mediante CUDA (NVIDIA sm_75 a sm_120f) o Vulkan (AMD, Intel, NVIDIA vía RADV/ANV o controladores propietarios).
- Decodificación especulativa MTP: genera múltiples tokens por paso, lo que acelera la inferencia hasta 2-3× en modelos compatibles (Gemma-4 con drafters específicos, Qwen con auto-especulación NextN).
- Extensión de contexto de largo alcance (DCA) para modelos de hasta 1M tokens, con spill a RAM cuando la VRAM se agota.
- Gestión dinámica de la caché KV con cuantización (TurboQuant, TCQ) y auto-balanceo según la carga GPU (PolyKV).
- API de introspección y control en tiempo de ejecución: endpoint `GET /props` que expone información sobre el estado del motor y permite ajustar parámetros en caliente.
- Modo servidor compatible con OpenAI API (`--server`) y modo CLI interactivo.
- Soporte multiplataforma: Linux, macOS, BSD, Windows (x86_64 y aarch64) en un solo binario APE.
- Compatibilidad con CUDA 13.3 comprimido (~7,6× más pequeño que el original) sin penalización en tiempo de carga ni throughput.

## Casos de uso

- **Despliegue de modelos Gemma-4 en producción**: el motor está específicamente optimizado para Gemma-4 (26B-A4B MoE, 12B/31B densos, serie E2B/E4B), por lo que es la opción recomendada para servir estos modelos con máximo rendimiento en GPUs NVIDIA.
- **Inferencia de modelos Qwen de contexto largo**: con soporte DCA y auto-especulación NextN, es adecuado para tareas que requieren ventanas de hasta 1M tokens, como análisis de documentos extensos o agentes conversacionales con memoria prolongada.
- **Entornos heterogéneos con GPUs AMD o Intel**: gracias al soporte Vulkan embebido, se puede ejecutar en GPUs no NVIDIA sin necesidad de compilar controladores adicionales, facilitando el despliegue en flotas mixtas.
- **Pruebas rápidas de modelos locales**: al ser un único archivo ejecutable, permite lanzar un servidor de inferencia en minutos sin instalar dependencias, ideal para prototipado y evaluación de modelos GGUF.
- **Investigación en eficiencia de inferencia**: las funcionalidades de PolyKV, TurboQuant y RYS permiten experimentar con diferentes configuraciones de caché KV y duplicación de capas para estudiar el equilibrio entre calidad y consumo de VRAM.
- **Aplicaciones de atención al cliente con contexto largo**: combinando un modelo Gemma-4 o Qwen con la ventana KV deslizante y spill a RAM, se pueden mantener conversaciones multi-turno de larga duración sin agotar la memoria GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona mejoras de throughput y latencia gracias a MTP y compresión CUDA, pero no proporciona cifras concretas. Tampoco hay comparativas con otros motores de inferencia en la documentación del repositorio.

## Requisitos de hardware

- **VRAM estimada**: depende del modelo GGUF cargado. El motor en sí ocupa ~679 MB (variante x86_64 con CUDA+Vulkan), pero los modelos Gemma-4 26B MoE requieren al menos 16-24 GB VRAM en cuantización Q4, mientras que los modelos densos de 12B pueden caber en 12-16 GB.
- **GPUs compatibles**: NVIDIA con arquitectura sm_75 o superior (Turing, Ampere, Ada, Hopper, Blackwell sm_120f), incluyendo RTX 2070, RTX 3090, RTX 4090, A100, H100, DGX Spark (GB10, sm_110f) y Jetson Thor (sm_121a). GPUs AMD e Intel vía Vulkan (RADV, ANV, controladores propietarios).
- **GPU consumer**: sí, es posible ejecutar modelos medianos en GPUs de consumo como RTX 3090 (24 GB) o RTX 4090 (24 GB) con cuantización adecuada. Modelos más pequeños (7B-14B) funcionan en GPUs de 8-12 GB.
- **Opciones de despliegue**: servidor OpenAI-compatible (`--server`), CLI interactivo, o integración con herramientas que soporten la API de llama.cpp. No hay soporte nativo para vLLM, Ollama o TGI; se usa directamente el binario.
- **Latencia y throughput**: no se proporcionan datos medidos. El autor afirma que la compresión CUDA no afecta al rendimiento y que MTP acelera la generación, pero sin cifras verificables.

## Comparativa con modelos similares

| Caracteristica | opencoti-llamafile | llamafile (estándar) | llama.cpp | Ollama |
|---|---|---|---|---|
| Formato | Un solo archivo APE | Un solo archivo APE | Librería + binario | Servicio con CLI |
| Aceleración GPU | CUDA + Vulkan | CUDA (principalmente) | CUDA, Metal, Vulkan (parcial) | CUDA, Metal |
| Decodificación especulativa | Sí (MTP, NextN) | No | Parcial (draft models) | No |
| Gestión KV avanzada | Sí (PolyKV, TurboQuant, TCQ, rolling-KV) | No | Parcial (KV cache cuantizada) | No |
| Extensión de contexto largo | Sí (DCA) | No | Parcial (mediante RoPE scaling) | No |
| Licencia | Apache-2.0 | Apache-2.0 | MIT | MIT |
| Optimización por familia de modelos | Gemma-4, Qwen | Genérica | Genérica | Genérica |

## Limitaciones y advertencias

- **No es un modelo de lenguaje**: no incluye pesos de ningún modelo; requiere descargar un modelo GGUF por separado. El rendimiento y las capacidades dependen completamente del modelo cargado.
- **Optimización limitada a dos familias**: las funcionalidades avanzadas (PolyKV, MTP, DCA, etc.) están validadas solo para Gemma-4 y Qwen. En otras arquitecturas, el motor funciona con comportamiento estándar de llama.cpp, pero sin garantías de estabilidad o rendimiento.
- **Riesgo de alucinación y sesgos**: inherente al modelo GGUF utilizado, no al motor. No se puede atribuir al motor ninguna propiedad de generación.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero los modelos GGUF cargados pueden tener licencias distintas (por ejemplo, Gemma-4 tiene su propia licencia). Es responsabilidad del usuario verificar la licencia de cada modelo.
- **Tamaño de descarga**: el repositorio completo ocupa 55,4 GB; aunque los binarios individuales son más pequeños, la descarga de múltiples variantes puede ser costosa.
- **Windows y archivos >4 GiB**: la variante `-universal` supera el límite de 4 GiB de Windows, por lo que debe usarse la versión `-win-x86_64-gpu` o la `-win-x86_64` con DSO side-load.
- **Sin benchmarks publicados**: no hay datos verificables de rendimiento, lo que dificulta comparaciones objetivas con otros motores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ManniX-ITA/opencoti-llamafile
- Proyecto opencoti (GitHub): https://github.com/mann1x/opencoti
- Perfil GitHub del autor: https://github.com/mann1x
- Post de HuggingFace sobre opencoti-llamafile: https://huggingface.co/posts/ManniX-ITA/630279752296516
- Repositorio llamafile (mozilla-ai): https://github.com/mozilla-ai/llamafile
