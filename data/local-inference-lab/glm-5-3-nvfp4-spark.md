# local-inference-lab/GLM-5.3-NVFP4-Spark

## Resumen

GLM-5.3-NVFP4-Spark es una variante cuantizada del modelo GLM-5.3-Flash, desarrollado originalmente por Z.ai y publicado en Hugging Face por el usuario local-inference-lab. Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 320.000 millones de parámetros totales y 18.000 millones de parámetros activos por token, lo que lo convierte en uno de los primeros modelos de su clase que resulta viable para ejecución local en hardware de gama alta. La versión NVFP4 utiliza cuantización de 4 bits en formato FP4 de NVIDIA, optimizada para las GPUs de la serie Blackwell y para el sistema DGX Spark.

Este modelo destaca por ser el primero de la serie GLM-5 con capacidades multimodales nativas, soportando entrada de texto e imágenes, y por ofrecer una ventana de contexto de 262.144 tokens. La cuantización NVFP4 reduce significativamente los requisitos de memoria respecto al modelo original en FP8 o BF16, permitiendo su despliegue en configuraciones de hardware más modestas. El repositorio incluye también una variante con el drafter especulativo DFlash2, que acelera la decodificación mediante speculative decoding.

La relevancia de este lanzamiento radica en que combina un rendimiento de nivel frontera con la posibilidad de ejecutarse en hardware local, algo que hasta ahora estaba reservado a modelos mucho más pequeños. La publicación incluye configuraciones de despliegue probadas con vLLM en sistemas DGX Spark, lo que facilita su adopción en entornos de investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atención densa y activación dispersa |
| Parametros totales | 320.000 millones (386.110.236.672 en safetensors) |
| Parametros activos | 18.000 millones |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA), FP8, BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, compressed-tensors |

## Arquitectura y entrenamiento

GLM-5.3-Flash emplea una arquitectura MoE con 320.000 millones de parámetros totales, de los cuales solo 18.000 millones se activan por token. Esta configuración permite obtener el rendimiento de un modelo mucho mayor con un coste computacional por inferencia significativamente menor. La arquitectura combina atención densa con capas de mezcla de expertos, siguiendo el diseño de la serie GLM-5 de Z.ai. El modelo es nativamente multimodal, aceptando tanto texto como imágenes como entrada.

La versión NVFP4 publicada en este repositorio utiliza cuantización de 4 bits en formato FP4 de NVIDIA, aplicada mediante la librería compressed-tensors. Esta cuantización reduce el tamaño del modelo de aproximadamente 640 GB en BF16 a unos 435 GB en NVFP4, manteniendo una calidad de salida cercana a la versión sin cuantizar. El repositorio incluye también una variante con el drafter especulativo DFlash2, que acelera la decodificación generando múltiples tokens por paso. Los detalles específicos del entrenamiento, como el número de tokens de entrenamiento o la composición del dataset, no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento complejo en tareas de nivel frontera, gracias a sus 18.000 millones de parámetros activos.
- Comprensión multimodal nativa: acepta entrada de imágenes además de texto, lo que permite tareas de visión-lenguaje.
- Ventana de contexto de 262.144 tokens, adecuada para documentos extensos, análisis de código a gran escala y conversaciones de largo recorrido.
- Soporte de decodificación especulativa mediante el drafter DFlash2, que acelera la generación de tokens en hardware compatible.
- Capacidades de tool calling y function calling, compatibles con la interfaz OpenAI a través de vLLM.
- Soporte de agentes y razonamiento multi-paso, habilitado por la combinación de contexto largo y tool calling.
- Capacidades multilingües, aunque la lista exacta de idiomas soportados no está disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens de contexto, el modelo puede procesar libros completos, informes anuales o expedientes legales en una sola pasada, extrayendo información relevante y generando resúmenes estructurados.
- Asistente de programación en producción: su soporte de tool calling permite integrarlo en pipelines de CI/CD para revisión de código, generación de tests y documentación automática, con la ventaja de poder analizar repositorios completos gracias a su contexto largo.
- Análisis de imágenes médicas o técnicas: al ser multimodal, puede describir radiografías, diagramas técnicos o capturas de pantalla, combinando la información visual con el razonamiento textual.
- Despliegue local en investigación: la cuantización NVFP4 y los 18.000 millones de parámetros activos permiten ejecutarlo en estaciones de trabajo con GPUs de gama alta, como las DGX Spark, sin depender de infraestructura cloud.
- Chatbot con memoria extendida: su ventana de contexto permite mantener conversaciones de larga duración con memoria completa de interacciones previas, útil para asistentes personales o de atención al cliente.
- Generación de contenido multimodal: puede crear descripciones, guiones o documentación técnica a partir de imágenes, o viceversa, generar imágenes conceptuales a partir de descripciones textuales (si se combina con un modelo de difusión).
- Razonamiento matemático y científico: su capacidad de razonamiento multi-paso lo hace adecuado para resolver problemas complejos de matemáticas, física o ingeniería, con la posibilidad de verificar los pasos intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La guía de atomic.chat menciona que el modelo tiene un buen rendimiento en benchmarks, pero no proporciona cifras concretas. Se recomienda consultar la documentación oficial de Z.ai para obtener resultados comparativos con otros modelos de la serie GLM y con alternativas como Llama 3.1 o Qwen 2.5.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado en NVFP4 ocupa aproximadamente 435 GB, por lo que se necesitan al menos 512 GB de memoria combinada entre VRAM y RAM para ejecutarlo con cuantización.
- GPUs recomendadas: NVIDIA DGX Spark (GB10, SM121) en configuraciones de 2 nodos con tensor-parallel 2, según la configuración publicada en GitHub. También es compatible con GPUs Blackwell como B200 o RTX PRO 6000 Blackwell.
- En consumer GPU: no es viable en GPUs de consumo actuales (RTX 4090, 5090) debido a los requisitos de memoria, incluso con cuantización agresiva.
- Opciones de despliegue: vLLM con interfaz compatible con OpenAI, llama.cpp para ejecución en CPU/GPU híbrida, y Ollama si se publica una versión GGUF.
- Latencia y throughput: no disponible en la información proporcionada. La decodificación especulativa con DFlash2 puede mejorar el throughput en hardware compatible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|---|
| GLM-5.3-Flash (NVFP4) | 320B | 18B | 262.144 | no disponible | NVFP4, FP8, BF16 |
| GLM-5.2 | 320B (estimado) | no disponible | no disponible | no disponible | no disponible |
| Llama 3.1 405B | 405B | 405B (denso) | 131.072 | Llama 3.1 Community License | FP8, INT4, GGUF |
| Qwen 2.5 72B | 72B | 72B (denso) | 131.072 | Apache 2.0 | FP8, INT4, GGUF |

La comparativa con GLM-5.2 se basa en la guía de codersera.com, que indica que GLM-5.3-Flash es significativamente más eficiente que su predecesor, permitiendo ejecutarlo en hardware que no podía con GLM-5.2. Frente a Llama 3.1 405B, GLM-5.3-Flash ofrece una ventaja clara en eficiencia gracias a su arquitectura MoE, con 18B activos frente a los 405B densos de Llama. Qwen 2.5 72B es una alternativa más pequeña y con licencia permisiva, pero con menor capacidad de razonamiento y contexto.

## Limitaciones y advertencias

- Licencia no especificada: la página de Hugging Face no indica la licencia del modelo, lo que genera incertidumbre sobre su uso comercial. Se recomienda contactar con el autor o consultar la página del modelo original de Z.ai antes de utilizarlo en producción.
- Requisitos de hardware elevados: aunque la cuantización NVFP4 reduce la memoria, el modelo sigue necesitando más de 400 GB de almacenamiento y memoria, lo que limita su uso a estaciones de trabajo muy específicas o clústeres pequeños.
- Riesgo de alucinación: como cualquier modelo de lenguaje de gran tamaño, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con datos poco frecuentes.
- Sesgos potenciales: no se ha publicado información sobre la evaluación de sesgos del modelo, por lo que se desconoce su comportamiento en poblaciones o temas sensibles.
- Cuantización NVFP4: la cuantización de 4 bits puede degradar ligeramente la calidad de las respuestas en comparación con la versión BF16, especialmente en tareas de razonamiento matemático o generación de código.
- Idiomas no documentados: no se ha publicado la lista de idiomas soportados, lo que dificulta evaluar su rendimiento en español u otros idiomas distintos del inglés.
- Dependencia de hardware NVIDIA: la cuantización NVFP4 y el drafter DFlash2 están optimizados para GPUs NVIDIA recientes, por lo que el rendimiento en hardware de otros fabricantes puede ser inferior.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/local-inference-lab/GLM-5.3-NVFP4-Spark
- Variante con drafter: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-Spark
- Versión sin drafter: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4
- Guía de despliegue en DGX Spark: https://github.com/tonyd2wild/GLM-5.3-Flash-NVFP4-DFlash2-2x-DGX-Spark
- Guía de ejecución local (codersera.com): https://codersera.com/blog/how-to-run-glm-5-3-flash-locally-2026/
- Guía de ejecución local con benchmarks (atomic.chat): https://atomic.chat/blog/guides/how-to-run-glm-5-3-flash-locally
