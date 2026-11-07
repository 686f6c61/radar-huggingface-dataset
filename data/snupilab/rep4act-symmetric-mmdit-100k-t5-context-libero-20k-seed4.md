# snupilab/Rep4Act-Symmetric-MMDiT-100k-T5-Context-LIBERO-20k-seed4

## Resumen

Rep4Act-Symmetric-MMDiT-100k-T5-Context-LIBERO-20k-seed4 es un modelo de política robótica (visuomotor policy) publicado por el grupo snupilab en Hugging Face. El identificador revela su composición: una arquitectura MMDiT (Multi-Modal Diffusion Transformer) simétrica, preentrenada sobre 100.000 muestras con contexto textual codificado mediante T5, y posteriormente ajustada sobre 20.000 muestras del benchmark LIBERO. Forma parte de la línea de trabajo Rep4Act, orientada a la representación y reproducción de acciones robóticas.

El modelo resuelve el problema del control robótico guiado por instrucciones en lenguaje natural y observaciones visuales: dado un contexto (imágenes y texto), genera secuencias de acciones motoras. Su relevancia radica en combinar difusión multimodal con un encoder de lenguaje T5, lo que permite condicionar el comportamiento del robot sobre instrucciones en lenguaje natural en lugar de comandos de bajo nivel predefinidos.

Con aproximadamente 5.890 millones de parámetros y un repositorio de 19,9 GB en formato safetensors, se trata de un modelo de gran tamaño para el ámbito de la robótica. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. La información pública disponible sobre licencia, idiomas y benchmarks es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MMDiT (Multi-Modal Diffusion Transformer) simétrica, con encoder de contexto T5 |
| Parámetros totales | 5.887.954.081 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Tamaño del repositorio | 19,9 GB |
| Acceso | restringido (gated) |
| Semilla de entrenamiento | seed4 |

## Arquitectura y entrenamiento

La arquitectura es un MMDiT simétrico, es decir, un transformer de difusión multimodal en el que las corrientes de imagen y de contexto textual comparten profundidad y anchura de forma equilibrada. El contexto de instrucciones se codifica mediante T5, que aporta embeddings de lenguaje natural al proceso de difusión. El modelo genera acciones mediante un proceso de difusión, no mediante regresión directa, lo que es habitual en políticas visuomotoras modernas por su capacidad de modelar distribuciones multimodales de acciones.

El entrenamiento se organiza en dos fases deducibles del nombre: un preentrenamiento sobre 100.000 muestras (100k) y un ajuste fino sobre 20.000 muestras del benchmark LIBERO. No se ha publicado información sobre el número total de tokens, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO. La semilla seed4 indica que forma parte de una familia de ejecuciones con distintas semillas, probablemente para estudios de robustez o reproducibilidad.

## Capacidades

- Generación de secuencias de acciones robóticas condicionadas por observaciones visuales e instrucciones en lenguaje natural.
- Comprensión de contexto textual mediante el encoder T5, lo que permite especificar tareas en lenguaje natural.
- Procesamiento multimodal: integra información visual y lingüística en un único transformer de difusión.
- Ajuste específico para tareas del benchmark LIBERO, que cubre manipulación de objetos y control de un brazo robótico en entornos simulados.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, ni capacidades de audio.
- No se ha documentado el conjunto de idiomas soportados más allá del que utiliza el encoder T5 subyacente.

## Casos de uso

- Investigación en políticas visuomotoras: servir como línea base reproducible (semilla 4) para comparar variantes de MMDiT frente a otras arquitecturas de difusión en robótica.
- Evaluación en el benchmark LIBERO: ejecutar las tareas estandarizadas del benchmark para medir tasas de éxito en manipulación y control, comparando con otras políticas publicadas.
- Control de brazo robótico guiado por lenguaje: usar instrucciones en lenguaje natural codificadas con T5 para dirigir el comportamiento del manipulador en simulación.
- Estudio de la influencia de la semilla en el entrenamiento: al existir variantes con otras semillas, permite analizar la variabilidad del rendimiento y la estabilidad del entrenamiento.
- Ajuste fino sobre nuevas tareas de manipulación: reutilizar los pesos preentrenados sobre 100k muestras como inicialización para dominios robóticos distintos de LIBERO.
- Análisis de arquitecturas de difusión simétricas: estudiar el efecto del diseño MMDiT simétrico frente a arquitecturas asimétricas en la calidad de las trayectorias generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp32): aproximadamente 23,6 GB solo para pesos, más memoria para activaciones y estado de difusión; en la práctica se recomienda al menos 32-48 GB.
- VRAM estimada en bf16/fp16: aproximadamente 11,8 GB para pesos, más overhead; se recomienda 24 GB o más para margen operativo.
- GPU recomendadas: A100 (40/80 GB), H100, o GPUs de clase profesional con 24 GB o más (por ejemplo, RTX 4090 para bf16 con margen ajustado).
- En GPUs de consumo: es viable en bf16 en una RTX 4090 (24 GB) si el pipeline de difusión no requiere grandes activaciones; en tarjetas de 16 GB requeriría cuantización, de la que no se documentan opciones.
- Opciones de despliegue: al ser un modelo de robótica con pesos safetensors, la integración típica sería mediante PyTorch y el código del repositorio; no se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de difusión, la inferencia implica múltiples pasos de denoising, lo que incrementa la latencia frente a políticas de regresión directa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rep4Act-Symmetric-MMDiT-100k-T5-Context-LIBERO-20k-seed4 | 5,89 B | no disponible | MMDiT simétrico + T5, difusión | no disponible | gated |
| Otras variantes Rep4Act (otras semillas) | presumiblemente similar | no disponible | misma familia | no disponible | presumiblemente similar |
| Políticas de difusión para LIBERO (p. ej. Diffusion Policy) | no disponible en esta ficha | no disponible | difusión sobre acciones | no disponible | pública en la literatura |

No se dispone de datos de rendimiento comparativo en la información proporcionada; los modelos alternativos citados son referencias de categoría y no comparaciones numéricas verificadas.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es posible su uso sin autorización.
- Licencia no especificada: no hay base para asumir permisos de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Orientado a investigación en simulación (LIBERO): no se documenta validación en robots físicos ni transferencia sim-a-real.
- Sin benchmarks publicados: no es posible evaluar su calidad frente a alternativas sin ejecutar evaluaciones propias.
- Sin información sobre sesgos: al entrenarse sobre datos de robótica y simulador, puede heredar sesgos del dataset y del entorno de simulación.
- Riesgo de alucinación de acciones: en políticas generativas, la difusión puede producir trayectorias no físicamente plausibles en estados fuera de distribución.
- Idiomas y contexto no documentados: el alcance del encoder T5 y la longitud máxima de contexto no están especificados.
- Tamaño elevado (19,9 GB, 5,89 B parámetros): coste de almacenamiento e inferencia significativo para un modelo de robótica.
- Reproducibilidad limitada: al ser una ejecución con semilla concreta (seed4), los resultados dependen del pipeline de evaluación no publicado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/snupilab/Rep4Act-Symmetric-MMDiT-100k-T5-Context-LIBERO-20k-seed4
- Perfil del autor: https://huggingface.co/snupilab
- Benchmark LIBERO: no disponible en la información proporcionada
- Paper o blog asociado: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
