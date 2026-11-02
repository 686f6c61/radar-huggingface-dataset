# sbyrum1090/DeepSeek-V4.1-Flash-1017-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario sbyrum1090. El modelo original es un modelo multimodal de tipo image-text-to-text (procesa imagen y texto como entrada) desarrollado por DeepSeek, con 748.494.684.784 parámetros totales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos de escala muy grande. Esta versión GGUF tiene como objetivo permitir la ejecución del modelo mediante llama.cpp, incluyendo en hardware donde los pesos completos en precisión nativa no serían manejables.

La relevancia de esta publicación es doble: por un lado, ofrece cuantizaciones de un modelo de casi 750.000 millones de parámetros en tamaños que van desde 246 GiB (Q2_K) hasta 473 GiB (Q8_0), y por otro, documenta que el soporte para la arquitectura DeepSeek V4.1 todavía no está en la rama principal de llama.cpp, sino en una rama específica del PR ggml-org/llama.cpp#28696. El repositorio ocupa 1565,3 GB y se distribuye bajo licencia MIT.

La model card indica que las cuantizaciones son "plain quants" sin imatrix, que los expertos enrutados conservan su formato nativo MXFP4 y que, por el momento, el modelo solo funciona con texto, ya que la rama de llama.cpp utilizada no puede convertir la torre de visión. No se dispone de información sobre idiomas soportados, datos de entrenamiento ni benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo image-text-to-text; la model card menciona "expertos enrutados" y "tablas engram", lo que sugiere una arquitectura con componentes MoE, pero no se detalla) |
| Parametros totales | 748.494.684.784 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q3_K_M, Q2_K (expertos enrutados en MXFP4 nativo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (split GGUF, 10 archivos por carpeta) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base en la información proporcionada. La model card de esta cuantización menciona explícitamente la existencia de "expertos enrutados" (routed experts) que conservan su formato nativo MXFP4, lo que indica la presencia de componentes de mezcla de expertos (MoE). También se mencionan dos "tablas engram" (engram tables) de gran tamaño que se leen en pocas filas por token y que el autor recomienda mantener en CPU mediante `-ot "engram_embd.weight=CPU"`. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

En cuanto a la innovación técnica documentada en esta publicación, destaca el proceso de cuantización: se generaron cuantizaciones sin imatrix, manteniendo los expertos enrutados en MXFP4 nativo (aproximadamente 4 bits) en todas las variantes, lo que según el autor hace que Q4_K_M ahorre menos espacio de lo habitual. El soporte de inferencia requiere una rama específica de llama.cpp (commit 2076412598e99127ea2554467b2b7530856895d3 del PR #28696), ya que la rama principal no soporta aún DeepSeek V4.1.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Procesamiento de imagen y texto como entrada a nivel de pipeline (`image-text-to-text`), aunque la model card advierte que la rama actual de llama.cpp no puede convertir la torre de visión y que, por tanto, estas cuantizaciones son solo para texto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un modelo de gran escala en formato GGUF: gracias a las cuantizaciones Q2_K (246 GiB) y Q3_K_M (323 GiB), es posible desplegar un modelo de casi 750.000 millones de parámetros en servidores con suficiente memoria agregada, usando llama.cpp con la rama del PR #28696.
- Experimentación e investigación sobre arquitecturas DeepSeek V4.1: el repositorio permite a investigadores probar el modelo en entornos llama.cpp sin necesidad de disponer de los pesos originales en safetensors (1565,3 GB de repositorio).
- Evaluación de calidad de cuantización: al ofrecer cuatro niveles (Q8_0, Q4_K_M, Q3_K_M, Q2_K) con los expertos enrutados en MXFP4, permite comparar la degradación de calidad frente al tamaño en un modelo de escala extrema.
- Despliegue en clústeres con CPU y GPU mixtas: la recomendación de mantener las tablas engram en CPU (`-ot "engram_embd.weight=CPU"`) facilita configuraciones donde la memoria de CPU complementa la VRAM de las GPU.
- Generación de texto conversacional en entornos con requisitos de licencia permisiva: la licencia MIT del repositorio facilita su integración en productos y pipelines internos, siempre que se respeten las condiciones del modelo base.
- Base para futuras cuantizaciones con imatrix: al ser "plain quants", sirven como referencia para medir la mejora que aportarían cuantizaciones con imatrix una vez que el soporte de llama.cpp se estabilice.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia según cuantización: Q8_0 requiere 473 GiB, Q4_K_M 414 GiB, Q3_K_M 323 GiB y Q2_K 246 GiB, según los tamaños de carpeta indicados en la model card. A esto hay que añadir la memoria para el contexto y las tablas engram si no se delegan a CPU.
- GPU recomendadas: no disponible en la información proporcionada. Por el volumen de pesos, se requiere un entorno multi-GPU o con memoria unificada de gran capacidad; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- ¿Cabe en GPU de consumo? No. Incluso la cuantización más pequeña (Q2_K, 246 GiB) excede con creces la VRAM de cualquier GPU de consumo actual.
- Opciones de despliegue: llama.cpp, exclusivamente con la rama del PR ggml-org/llama.cpp#28696 (commit 2076412598e99127ea2554467b2b7530856895d3) o una build que lo incluya. No se mencionan vLLM, TGI, Ollama ni otras herramientas.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El soporte de llama.cpp es experimental: requiere una rama específica (PR #28696), no la rama principal, lo que implica riesgo de inestabilidad y cambios futuros.
- Solo texto: la torre de visión no puede convertirse en la rama actual de llama.cpp, por lo que las capacidades image-text-to-text del modelo base no están disponibles en estas cuantizaciones.
- Las cuantizaciones son "plain quants" sin imatrix, lo que puede implicar una calidad inferior a la de cuantizaciones con imatrix en los mismos niveles.
- Los expertos enrutados se mantienen en MXFP4 nativo, por lo que Q4_K_M ahorra menos espacio del habitual y la diferencia entre niveles de cuantización es menor en esa parte del modelo.
- El repositorio ocupa 1565,3 GB, lo que exige una planificación cuidadosa del almacenamiento y de la descarga (archivos divididos en 10 partes por carpeta).
- No se dispone de información sobre sesgos, riesgo de alucinación, limitaciones de contexto o idioma, ni sobre restricciones adicionales del modelo base más allá de la licencia MIT del repositorio.
- Aunque la licencia del repositorio es MIT, deben verificarse las condiciones del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017 para uso comercial en producción.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sbyrum1090/DeepSeek-V4.1-Flash-1017-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- PR de llama.cpp con soporte para DeepSeek V4.1: https://github.com/ggml-org/llama.cpp/pull/28696
- Repositorio de la rama utilizada: https://github.com/vcruz305/llama.cpp
- Perfil del autor en X: https://x.com/realmrfakename
