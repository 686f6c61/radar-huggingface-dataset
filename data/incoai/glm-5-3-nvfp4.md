# incoai/GLM-5.3-NVFP4

## Resumen

GLM-5.3-NVFP4 es una versión cuantizada en NVFP4 del modelo GLM-5.3 de Z.ai, publicada por Inco AI. El modelo base, desarrollado por Z.ai, es un modelo de lenguaje de gran escala con arquitectura de mezcla de expertos (MoE) que destaca en tareas de codificación compleja, razonamiento matemático y ejecución de agentes de largo horizonte. Esta variante cuantizada reduce el tamaño del checkpoint a 433 GiB (frente a los más de 700 GiB del FP8 original) manteniendo una precisión casi idéntica, según los benchmarks publicados.

La cuantización NVFP4 se aplica únicamente a los pesos y activaciones de las capas lineales de los expertos enrutados, mientras que la caché KV se cuantiza en FP8. El checkpoint se exporta en formato NVIDIA Model Optimizer y se sirve directamente con SGLang o vLLM en GPUs NVIDIA Blackwell (SM100+). Incluye soporte para decodificación especulativa con el modelo borrador DFlash 2, que acelera la inferencia sin pérdida de calidad.

Este modelo es relevante porque demuestra que la cuantización de 4 bits puede aplicarse a modelos MoE de cientos de miles de millones de parámetros con una degradación mínima (menos de 1 punto en la mayoría de benchmarks), lo que permite desplegar modelos de frontera en clústeres de 8 GPUs en lugar de requerir decenas de nodos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con atención dispersa dinámica (DSA) |
| Parametros totales | 390.942.074.880 (~390,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones de expertos enrutados), FP8 (caché KV) |
| Idiomas soportados | no disponible |
| Licencia | GLM-5.3 License (propietaria de Z.ai) |
| Formato de pesos | safetensors, formato NVIDIA Model Optimizer (quant_method: modelopt) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3 de Z.ai utiliza una arquitectura MoE con atención dispersa dinámica (DSA), según el tag `glm_moe_dsa` presente en el repositorio. Según el blog oficial de Z.ai, GLM-5.3 comparte el mismo modelo base que GLM-5.2, y todas las mejoras provienen del post-entrenamiento, que incluye ajuste fino supervisado y optimización por preferencias. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas específicas de alineación.

La versión NVFP4 de Inco AI es el resultado de un proceso de cuantización post-entrenamiento (PTQ) propio. Solo se cuantizan a NVFP4 los pesos y activaciones de las capas lineales dentro de los expertos enrutados del MoE, con escalas de activación estáticas por tensor. La caché KV se cuantiza a FP8 con escalas unitarias estáticas. El checkpoint se exporta en formato NVIDIA Model Optimizer, lo que permite su carga directa en SGLang y vLLM sin conversión adicional.

## Capacidades

- Generación de texto y razonamiento complejo: obtiene puntuaciones superiores a 90 en GPQA Diamond y AIME 2025, lo que indica un alto nivel en razonamiento científico y matemático.
- Codificación avanzada: según el blog de Z.ai, GLM-5.3 es el modelo de pesos abiertos más capaz para codificación, con una mejora del 50% sobre GLM-5.2 en el benchmark interno Z.ai Code Bench.
- Ejecución de agentes y tareas de largo horizonte: el modelo está optimizado para mantener coherencia en secuencias largas de acciones, como se refleja en su buen rendimiento en AA-LCR (Agentic Action-Level Long Context Reasoning).
- Tool calling y function calling: soporta el parser de herramientas `glm47` en SGLang y vLLM, lo que permite integración con APIs y ejecución de funciones externas.
- Razonamiento estructurado: incluye soporte para el parser de razonamiento `glm45`, que extrae cadenas de pensamiento explícitas durante la generación.
- Decodificación especulativa: compatible con el modelo borrador DFlash 2, que acelera la inferencia con 7 tokens especulativos por paso de verificación sin pérdida de precisión.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para generar, revisar y refactorizar código. Su alta precisión en tareas de codificación y su soporte para tool calling permiten conectarlo a repositorios, linters y sistemas de testing automático.
- Agentes autónomos de software: gracias a su capacidad para tareas de largo horizonte y su parser de razonamiento, puede planificar y ejecutar secuencias de acciones complejas, como navegar por APIs, modificar archivos y verificar resultados.
- Asistente de investigación científica: con puntuaciones superiores a 90 en GPQA Diamond, puede ayudar a formular hipótesis, analizar literatura y resolver problemas de física, química o biología.
- Tutor de matemáticas avanzadas: su rendimiento en AIME 2025 (94-95%) lo hace adecuado para resolver problemas de olimpiadas matemáticas y explicar razonamientos paso a paso.
- Análisis de documentos técnicos extensos: aunque la longitud de contexto no se ha especificado, el modelo está diseñado para manejar entradas largas, lo que permite resumir y extraer información de manuales, patentes o informes técnicos.
- Despliegue de modelos de frontera en clústeres reducidos: al cuantizar a NVFP4, el modelo puede ejecutarse en 8 GPUs Blackwell con 80 GB de VRAM cada una, lo que reduce el coste de hardware frente a la versión FP8.

## Benchmarks y rendimiento

La model card publica la siguiente comparación entre la versión FP8 original de Z.ai y esta versión NVFP4. No se han proporcionado comparaciones con otros modelos.

| Precision | GPQA Diamond | AIME 2025 | MATH-500 | HLE | AA-LCR |
| :--- | ---: | ---: | ---: | ---: | ---: |
| FP8 | 91.1 | 94.3 | 95.6 | 35.9 | 73.6 |
| NVFP4 | 91.2 | 95.1 | 95.2 | 35.2 | 73.0 |

La diferencia máxima entre ambas versiones es de 0,7 puntos (en HLE), lo que confirma que la cuantización NVFP4 introduce una degradación mínima.

## Requisitos de hardware

- El checkpoint ocupa 433 GiB en disco. Con tensor-parallel 8, cada GPU debe alojar aproximadamente 54 GiB de pesos, más la caché KV y los overheads de activaciones.
- Se requiere un clúster de 8 GPUs NVIDIA Blackwell (SM100+), como B200 o RTX PRO 6000 Blackwell. No es compatible con GPUs de generaciones anteriores (Ampere, Ada Lovelace) debido a las instrucciones FP4 nativas.
- VRAM estimada por GPU: al menos 80 GB para inferencia con contexto largo. Con 8 GPUs de 80 GB se dispone de 640 GB totales, suficiente para el checkpoint y la caché KV.
- No cabe en GPUs de consumo (RTX 4090, 5090) por requisitos de VRAM y arquitectura.
- Opciones de despliegue: SGLang (recomendado) o vLLM v0.28.0 o superior, ambos con soporte nativo para el formato modelopt_fp4.
- Para acelerar la inferencia se recomienda usar el modelo borrador DFlash 2 con decodificación especulativa (7 tokens por paso), lo que reduce la latencia sin pérdida de precisión.
- No se han publicado datos de latencia o throughput específicos para esta configuración.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base GLM-5.3 compite con otros MoE de gran escala como DeepSeek-V3 o Qwen3-MoE, pero no se han publicado resultados comparativos en esta ficha. Se recomienda consultar el blog de Z.ai para benchmarks adicionales.

## Limitaciones y advertencias

- La licencia GLM-5.3 es propietaria de Z.ai y puede imponer restricciones al uso comercial o a la redistribución. Es necesario revisar el texto completo de la licencia antes de desplegar el modelo en producción.
- El modelo requiere hardware Blackwell (SM100+). No es posible ejecutarlo en GPUs de generaciones anteriores, lo que limita su uso a centros de datos con hardware reciente.
- La cuantización NVFP4 introduce una degradación mínima pero medible en algunos benchmarks (especialmente en HLE, donde pierde 0,7 puntos). Para aplicaciones donde la precisión máxima sea crítica, se recomienda usar la versión FP8 original.
- No se han publicado detalles sobre sesgos, alucinaciones o comportamientos no deseados específicos de este modelo. Como todo LLM, puede generar información incorrecta o inventada, especialmente en dominios poco representados en sus datos de entrenamiento.
- La longitud de contexto no se ha especificado en la documentación disponible. Se recomienda verificar este parámetro en la documentación oficial de Z.ai antes de diseñar aplicaciones que dependan de ventanas de contexto largas.
- El modelo base no es nativamente multimodal (a diferencia de GLM-5.3-Flash). No se debe asumir capacidad de procesamiento de imágenes o audio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/incoai/GLM-5.3-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3
- Modelo borrador DFlash 2: https://huggingface.co/incoai/GLM-5.3-DFlash2
- Blog de Z.ai sobre GLM-5.3: https://z.ai/blog/glm-5.3
- Documentación de Z.ai: https://docs.z.ai/guides/llm/glm-5.3
- Perfil de Inco AI: https://huggingface.co/incoai
- NVIDIA Model Optimizer: https://github.com/NVIDIA/TensorRT-Model-Optimizer
