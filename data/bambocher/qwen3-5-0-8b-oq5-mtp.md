# bambocher/Qwen3.5-0.8B-oQ5-mtp

## Resumen

Qwen3.5-0.8B-oQ5-mtp es un checkpoint cuantizado del modelo Qwen3.5-0.8B, publicado por el usuario bambocher en HuggingFace. Se distribuye en formato MLX con pesos safetensors y emplea la cuantización mixta de precisión oQ (oMLX v0.7.1rc1), con una media efectiva de 6,911 bits por peso. El checkpoint completo contiene 873.438.784 parámetros y ocupa 0,703 GiB, lo que lo sitúa en la categoría de modelos pequeños orientados a inferencia local.

El modelo conserva tres componentes diferenciados: el modelo de lenguaje (0,752B parámetros), una torre de visión (0,101B) y una cabeza MTP de predicción multi-token (0,020B). Esta combinación sugiere capacidades multimodales de entrada de imagen y decodificación especulativa, si bien la model card no detalla el contexto, los idiomas ni el proceso de entrenamiento original.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo multimodal pequeño en Apple Silicon mediante MLX con un consumo de almacenamiento inferior a 1 GB; por otro, sirve como caso de estudio de cuantización mixta que preserva en BF16 el 11,815% de los pesos mientras comprime al 5-bit el 80,592%.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`), con torre de visión y cabeza MTP; número de capas y atención no disponible |
| Parámetros totales | 873.438.784 (0,873B) |
| Parámetros activos | No aplica; no consta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta oQ: affine 5-bit group 64 (80,592% de los pesos), affine 6-bit group 64 (2,847%), affine 8-bit group 64 (4,746%) y BF16 (11,815%); media efectiva 6,911 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors en formato MLX; el repositorio ocupa 0,8 GB |

## Arquitectura y entrenamiento

La información disponible identifica la arquitectura mediante el tag `qwen3_5`, correspondiente a la familia Qwen3.5, pero no detalla el número de capas, cabezas de atención, función de activación ni la longitud de contexto. El checkpoint se descompone en un modelo de lenguaje de 0,752B parámetros (0,493 GiB), una torre de visión de 0,101B (0,187 GiB) y una cabeza MTP de 0,020B (0,022 GiB). La presencia de la torre de visión confirma capacidad de procesamiento de imágenes, aunque no se especifican el codificador visual, la resolución de entrada ni el mecanismo de fusión multimodal.

La cuantización se realizó con oQ de oMLX v0.7.1rc1, aplicando precisión mixta por grupos de 64 pesos. El 80,592% de los pesos lógicos queda en 5-bit, mientras que un 11,815% se conserva en BF16 (0,103B), presumiblemente para preservar capas sensibles. La cabeza MTP, de 0,020B, está diseñada para predecir varios tokens por paso y habilitar decodificación especulativa, aunque el autor no documenta la velocidad de aceptación ni el soporte requerido en el runtime. No hay información sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni proceso de alineación del modelo base.

## Capacidades

- Generación de texto autoregresiva heredada del modelo base Qwen3.5-0.8B.
- Procesamiento de imágenes mediante la torre de visión de 0,101B parámetros.
- Predicción multi-token a través de la cabeza MTP de 0,020B, orientada a decodificación especulativa.
- Inferencia local en Apple Silicon mediante la librería MLX.
- Ejecución con un espacio de almacenamiento reducido: 0,703 GiB para el checkpoint completo.
- Tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente local en Mac para redacción y resumen: el checkpoint cabe en menos de 1 GB y puede ejecutarse con MLX en un equipo Apple Silicon, lo que permite procesar texto sin conexión y sin enviar datos a servicios externos.
- Prototipado de aplicaciones multimodales: la torre de visión de 0,101B permite experimentar con preguntas sobre imágenes en local, útil para validar interfaces antes de migrar a modelos mayores.
- Extracción de información de documentos escaneados: combinando entrada de imagen y generación de texto, puede emplearse para transcribir campos concretos en flujos de digitalización, siempre que se evalúe su precisión en el dominio objetivo.
- Investigación sobre cuantización mixta: el reparto documentado de 5, 6, 8 y 16 bits permite reproducir experimentos de oQ y medir la degradación respecto al modelo base en tareas controladas.
- Evaluación de decodificación especulativa con MTP: la cabeza de 0,020B sirve para probar técnicas de predicción multi-token en entornos MLX y comparar latencia frente a decodificación estándar.
- Demostraciones educativas de modelos pequeños: su reducido tamaño y su formato MLX facilitan talleres y pruebas de concepto en portátiles, sin necesidad de GPU dedicada.
- Procesamiento offline con requisitos de privacidad: al ejecutarse localmente, puede emplearse en entornos donde el texto o las imágenes no pueden salir del dispositivo, con las cautelas propias de un modelo de 0,8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, evaluaciones multimodales ni comparaciones con el modelo base sin cuantizar. Tampoco se documentan latencia, throughput ni tasa de aceptación de la cabeza MTP.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0,70 GiB solo para los pesos; con activaciones y caché KV se estima un consumo de 1 a 2 GB para contextos moderados, aunque el contexto máximo no está documentado.
- GPU recomendadas: Apple Silicon (M1 o posterior) por el formato MLX; no se proporcionan recomendaciones específicas de GPU NVIDIA o AMD.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; también podría ejecutarse en iPhone o iPad compatibles con MLX, sujeto a los límites de memoria del dispositivo.
- Despliegue: MLX y oMLX son las vías documentadas. Para vLLM, llama.cpp, Ollama o TGI sería necesaria una conversión de formato no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos verificables de modelos comparables en la información disponible. Como alternativas de la misma categoría podrían considerarse otros modelos pequeños de la familia Qwen o de la familia SmolLM, pero sus especificaciones no se han confirmado aquí.

| Modelo | Parámetros | Contexto | Licencia | Formato | Datos verificados |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-oQ5-mtp | 0,873B | No disponible | No disponible | Safetensors MLX | Sí, según model card |
| Qwen3-0.6B (candidato de comparación) | No disponible | No disponible | No disponible | No disponible | No |
| Qwen2.5-0.5B (candidato de comparación) | No disponible | No disponible | No disponible | No disponible | No |
| SmolLM2-360M (candidato de comparación) | No disponible | No disponible | No disponible | No disponible | No |

## Limitaciones y advertencias

- La licencia no está indicada, por lo que no puede confirmarse el uso comercial ni la redistribución del checkpoint.
- No se especifican los idiomas soportados; el comportamiento en castellano no está verificado.
- La longitud de contexto es desconocida, lo que impide dimensionar tareas de contexto largo.
- La cuantización a 5-bit en el 80,592% de los pesos puede degradar el razonamiento, las matemáticas y la generación de código respecto al modelo base; no hay evaluaciones que cuantifiquen esa pérdida.
- Un modelo de 0,873B parámetros tiene una capacidad limitada de conocimiento factual y un riesgo elevado de alucinación en preguntas abiertas.
- El formato MLX limita el despliegue directo a ecosistemas Apple; no es cargable sin conversión en vLLM, llama.cpp, Ollama o TGI.
- La cabeza MTP requiere soporte específico del runtime; no se documenta qué versiones de MLX la aprovechan ni su ganancia real de velocidad.
- No se detalla el preprocesamiento de imágenes de la torre de visión, lo que puede provocar resultados inconsistentes si se usa con resoluciones o formatos no previstos.
- El repositorio registra 10 descargas y 0 likes, sin validación comunitaria ni informes independientes de calidad.
- La fecha de creación indicada es 2026-10-20; conviene verificar la procedencia y la relación exacta con el modelo base Qwen3.5-0.8B antes de usarlo en producción.

## Enlaces

- HuggingFace: https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ5-mtp
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Paper, blog, demo o repositorio del modelo base: no disponibles en la información proporcionada.
