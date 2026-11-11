# scottlowry/Qwen3.5-4B-oQ5e-mtp

## Resumen

Qwen3.5-4B-oQ5e-mtp es una versión cuantizada del modelo Qwen3.5-4B de Alibaba Qwen, publicada por el usuario scottlowry en Hugging Face. Se trata de una conversión de precisión mixta realizada con la herramienta oQ (oMLX v0.7.4.dev1), pensada específicamente para ejecución en Apple Silicon mediante la librería MLX. El checkpoint conserva la arquitectura original del modelo base (familia qwen3_5) y añade una cabeza MTP (multi-token prediction) de 0,121B parámetros, además de un componente de visión de 0,334B, lo que confirma que el modelo base es multimodal.

La relevancia de esta ficha radica en que ejemplifica el ecosistema de cuantización de precisión mixta aplicado a modelos compactos multimodales: el checkpoint completo ocupa 3,508 GiB en disco frente a los aproximadamente 9,3 GB que ocuparían los mismos 4.660B parámetros en BF16, con una media efectiva de 6,467 bits por peso. La distribución no es uniforme: el 74,17 % de los pesos se almacena en affine 5-bit (grupo 64), el 18,37 % en affine 6-bit, una fracción residual en 8-bit y un 7,46 % se mantiene en BF16 para preservar capas sensibles.

Es importante señalar que esta es una publicación de terceros, no oficial de Qwen, con un volumen de descargas muy bajo (61 descargas y 0 likes en el momento de la consulta) y sin model card extendida, licencia declarada ni idiomas especificados en los metadatos. Cualquier uso en producción exige verificar la licencia del modelo base original y validar empíricamente la degradación introducida por la cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia qwen3_5) con cabeza MTP; pesos en safetensors para MLX |
| Parametros totales | 4.659.865.088 (4,660B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precisión mixta oQ: affine 5-bit grupo 64 (74,170 %), affine 6-bit grupo 64 (18,367 %), affine 8-bit grupo 64 (0,004 %), BF16 (7,459 %); media efectiva 6,467 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible (verificar la licencia de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (MLX), 3,508 GiB / 3,767 GB en total |
| Libreria de inferencia | mlx |
| Modelo base | Qwen/Qwen3.5-4B |
| Tamano del repo | 15,1 GB (incluye artefactos adicionales aparte de los pesos) |
| Fecha de creacion / actualizacion | 2026-07-24 / 2026-11-11 (recuantizado con oMLX v0.7.4.dev1) |

Desglose de almacenamiento por componente (datos de la model card):

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 4,206B | 2,997 GB / 2,791 GiB |
| Vision | 0,334B | 0,667 GB / 0,621 GiB |
| Cabeza MTP | 0,121B | 0,103 GB / 0,096 GiB |
| Total | 4,660B | 3,767 GB / 3,508 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-4B, de tipo transformer, con tres bloques diferenciados según el desglose de pesos: un modelo de lenguaje de 4,206B parámetros, un codificador o torre de visión de 0,334B parámetros (lo que implica capacidades multimodales de entrada de imagen) y una cabeza de predicción multi-token (MTP) de 0,121B parámetros. La presencia de MTP sugiere que el modelo base está diseñado para decodificación especulativa o generación multi-token, técnica que puede acelerar la inferencia al predecir varios tokens por paso.

No se dispone de información sobre el proceso de entrenamiento del modelo base: número de tokens, composición del corpus, uso de RLHF, DPO u otras etapas de alineamiento, ni detalles sobre la innovación arquitectónica concreta de la familia qwen3_5 (por ejemplo, si emplea atención lineal, atención con ventana deslizante o mecanismos híbridos). Todos estos datos deben consultarse en la model card oficial de Qwen/Qwen3.5-4B, que no forma parte de la información proporcionada.

La innovación técnica de esta publicación concreta es el esquema de cuantización de precisión mixta de oQ/oMLX: asigna 5 bits a la mayoría de los pesos, 6 bits a un subconjunto del 18 %, mantiene una fracción mínima en 8 bits y preserva el 7,46 % en BF16, presumiblemente para capas de mayor sensibilidad (embeddings, normalizaciones o proyecciones críticas). El resultado es un checkpoint de 3,5 GiB que reduce el uso de memoria en aproximadamente un 62 % respecto a BF16, manteniendo una media de 6,467 bits por peso.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-4B.
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0,334B parámetros, por lo que se espera soporte de entrada multimodal (visión-lenguaje), aunque no se detalla en la información disponible qué tareas concretas (VQA, OCR, captioning) están cubiertas.
- Predicción multi-token mediante la cabeza MTP de 0,121B parámetros, orientada a acelerar la decodificación.
- Capacidades multilingües: no disponibles en los metadatos de esta publicación; dependen del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está empaquetado en formato MLX y ocupa 3,508 GiB, por lo que puede cargarse en un Mac con memoria unificada de 8 GB o superior, dejando margen para el contexto y el runtime. Es el caso de uso principal de esta publicación.
- Prototipado rápido de aplicaciones multimodales: la inclusión de la torre de visión permite experimentar con pipelines imagen-texto en local antes de escalar a un modelo mayor o a infraestructura GPU.
- Asistentes de escritorio offline: al ejecutarse sin conexión en hardware de consumo, encaja en herramientas de productividad local (resumen de documentos, extracción de datos de capturas de pantalla) donde la privacidad del dato es requisito.
- Evaluación de cuantización: sirve como referencia práctica para medir la degradación de calidad de oQ a 6,467 bits/peso frente al BF16 original en tareas de razonamiento y visión, comparando salidas sobre un mismo conjunto de prompts.
- Aceleración mediante MTP: la cabeza de predicción multi-token puede aprovecharse para decodificación especulativa en entornos MLX, reduciendo la latencia por token en generación larga.
- Pruebas de integración en pipelines MLX: útil para validar compatibilidad de herramientas y frameworks (por ejemplo, servidores locales compatibles con MLX) antes de adoptar versiones cuantizadas de modelos mayores.
- Educación y experimentación: con 61 descargas, es un artefacto de nicho adecuado para estudiar cómo se distribuyen los bits en una cuantización mixta real y qué capas se preservan en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta métricas de compresión (bits por peso y tamaño en disco), no evaluaciones de calidad (MMLU, HumanEval, GSM8K, MMMU u otras).

## Requisitos de hardware

- VRAM/memoria unificada estimada: 3,508 GiB solo para los pesos; con overhead de runtime MLX, caché KV y contexto, es razonable reservar entre 5 y 6 GB de memoria unificada para uso cómodo.
- GPU recomendadas: Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada de 8 GB o más; el formato MLX no está pensado para GPU NVIDIA.
- Cabe en GPU de consumo: sí, en cualquier Mac con 8 GB de memoria unificada o más; no se distribuyen pesos GGUF, por lo que no es directamente desplegable en GPU NVIDIA con llama.cpp sin reconversión.
- Opciones de despliegue: librería MLX (mlx-lm / mlx-vlm según se requiera la torre de visión) y herramientas del ecosistema oMLX; vLLM, TGI, llama.cpp y Ollama no soportan de forma nativa safetensors MLX de este tipo sin conversión.
- Latencia y throughput: no disponibles; dependerán del chip Apple Silicon concreto, de la longitud de contexto y de si se explota la cabeza MTP para decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-oQ5e-mtp (esta ficha) | 4,660B (incluye vision y MTP) | no disponible | safetensors MLX, precision mixta 6,467 bits/peso, 3,508 GiB | no disponible | Hugging Face, 61 descargas |
| Qwen/Qwen3.5-4B (modelo base) | 4,660B | no disponible en esta informacion | safetensors BF16 (aprox. 9,3 GB) | la del modelo base (consultar) | Hugging Face, repositorio oficial |
| Qwen3.5-4B en GGUF (conversiones de terceros) | 4,660B | no disponible | GGUF Q4_K_M / Q5_K_M | la del modelo base | Hugging Face, ecosistema llama.cpp |

La comparación relevante es interna a la familia Qwen3.5-4B: esta versión sacrifica precisión (6,467 bits/peso de media) a cambio de un checkpoint un 62 % más pequeño y ejecutable en MLX nativo. Frente a conversiones GGUF, la diferencia principal es el backend (Apple Silicon frente a CPU/GPU genérica) y el esquema de cuantización mixta, que preserva selectivamente capas en BF16 en lugar de aplicar una receta uniforme. No se dispone de datos de benchmarks para comparar calidad de salida entre estas variantes.

## Limitaciones y advertencias

- Publicación no oficial: es una cuantización de terceros (scottlowry), no avalada por Qwen; no hay garantía de paridad de comportamiento con el modelo base.
- Licencia no declarada en esta publicación: antes de cualquier uso comercial hay que verificar la licencia de Qwen/Qwen3.5-4B y sus condiciones de redistribución de pesos derivados.
- Degradación por cuantización: con una media de 6,467 bits/peso, es esperable una pérdida de calidad frente al BF16 original, especialmente en tareas sensibles (matemáticas, código, razonamiento de cadena larga y percepción visual fina). No se han publicado evaluaciones que cuantifiquen esta pérdida.
- Riesgo de alucinación: inherente a los modelos de lenguaje de este tamaño; la cuantización puede amplificarlo en dominios de baja representación.
- Sesgos conocidos: no documentados en esta publicación; heredados del corpus de entrenamiento del modelo base, que no se detalla.
- Idiomas y contexto: sin datos declarados; no se puede asumir soporte multilingüe ni una ventana de contexto concreta sin consultar la model card oficial.
- Compatibilidad restringida: el formato MLX limita el despliegue a Apple Silicon; no es directamente usable en vLLM, TGI, llama.cpp u Ollama sin conversión.
- Historial de versiones: la model card indica una recuantización el 2026-11-11 con oMLX v0.7.4.dev1 y advierte de que copias anteriores deben descargarse de nuevo; conviene verificar el hash de los pesos.
- Tamaño del repo de 15,1 GB frente a 3,508 GiB de pesos: sugiere artefactos adicionales (posiblemente múltiples revisiones o ficheros auxiliares); revisar qué se descarga realmente antes de desplegar.
- Componente de visión no validado: la torre de visión está presente en los pesos, pero no se documenta qué processor, configuración de imagen ni resolución admite esta conversión MLX.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scottlowry/Qwen3.5-4B-oQ5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Librería MLX: https://github.com/ml-explore/mlx
- Paper, blog, demo o repositorio adicional del autor: no disponible en la información proporcionada.
