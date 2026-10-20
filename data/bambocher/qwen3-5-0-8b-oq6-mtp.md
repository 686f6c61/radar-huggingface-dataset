# bambocher/Qwen3.5-0.8B-oQ6-mtp

## Resumen

Qwen3.5-0.8B-oQ6-mtp es una cuantización de precisión mixta del modelo Qwen3.5-0.8B, publicada por el usuario bambocher con la herramienta oQ (oMLX v0.7.1rc1). No es un modelo entrenado desde cero, sino un checkpoint derivado: se parte de los pesos originales de la familia Qwen3.5 y se recomprimen con una mezcla de affine 6-bit, affine 8-bit y BF16, con una media efectiva de 7,795 bits por peso.

El checkpoint conserva 873.438.784 parámetros lógicos repartidos en tres componentes: 0,752 B en el modelo de lenguaje, 0,101 B en la torre de visión y 0,020 B en una cabeza MTP (multi-token prediction). Esa estructura da lugar a un modelo multimodal de menos de mil millones de parámetros con capacidad de decodificación especulativa, empaquetado en 0,85 GB y en formato MLX, por lo que su destino natural es Apple Silicon.

Su interés práctico es doble: permite ejecutar un modelo de la generación Qwen3.5 en un Mac con 8 GB de memoria unificada, y la cabeza MTP lo habilita como modelo borrador en esquemas de decodificación especulativa junto a modelos mayores. Conviene advertir de que la model card no declara licencia, idiomas ni longitud de contexto, y de que el repositorio acumula muy pocas descargas, por lo que se trata de un artefacto reciente y sin validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.5 (etiqueta `qwen3_5` en el repositorio); detalles internos de la red (tipo de atención, capas, activaciones) no disponibles |
| Parámetros totales | 873.438.784 (0,873 B): 0,752 B en el modelo de lenguaje, 0,101 B en visión, 0,020 B en la cabeza MTP |
| Parámetros activos | No aplica: no consta que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta (oQ): affine 6-bit con grupo de 64 (79,575 % de los pesos), affine 8-bit con grupo de 64 (8,610 %) y BF16 (11,815 %); media efectiva de 7,795 bits por peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible: la model card no la declara |
| Formato de pesos | `safetensors` en disposición MLX (librería `mlx`); no se distribuye GGUF |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo base ni su proceso de entrenamiento; la información disponible se limita al esquema de compresión aplicado. Por la estructura del checkpoint se deduce una red multimodal compuesta por un modelo de lenguaje (0,752 B de parámetros), una torre de visión (0,101 B) y una cabeza MTP (0,020 B), lo que confirma entrada de imágenes además de texto. Los detalles sobre número de tokens de entrenamiento, composición del corpus, uso de RLHF/DPO o técnicas de atención no están disponibles.

La innovación relevante de este checkpoint es la cuantización mixta: el autor asigna 6 bits (grupo 64) al 79,6 % de los pesos, 8 bits (grupo 64) al 8,6 % y mantiene un 11,8 % en BF16, presumiblemente las capas más sensibles a la pérdida de precisión. El resultado son 0,793 GiB de almacenamiento real frente a los aproximadamente 1,75 GB que ocuparía el mismo modelo en BF16. La cabeza MTP, por su parte, es un módulo de predicción multi-token que habilita la decodificación especulativa, bien de forma autocontenida o como modelo borrador de un Qwen3.5 de mayor tamaño.

## Capacidades

- Generación de texto en el modelo de lenguaje, con la calidad esperable de un modelo de 0,75 B de parámetros.
- Comprensión de imágenes: la presencia de una torre de visión de 0,101 B implica soporte de entrada visual (descripción de imágenes, VQA, extracción de texto en imagen), aunque el autor no detalla las tareas evaluadas.
- Predicción multi-token mediante la cabeza MTP, orientada a decodificación especulativa y a acelerar la inferencia de modelos mayores.
- Ejecución local en Apple Silicon a través de MLX, sin dependencia de GPU NVIDIA ni de servicios en la nube.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara conjunto de idiomas.
- Modo *thinking* explícito, audio u otras modalidades: no disponible.

## Casos de uso

- **Asistente local en macOS con entrada de imágenes**: el checkpoint incluye torre de visión y pesa 0,85 GB, de modo que puede cargarse en memoria unificada y responder a consultas sobre capturas de pantalla o fotos sin salir del equipo.
- **Modelo borrador para decodificación especulativa**: la cabeza MTP y el reducido coste de carga (menos de 1 GB) permiten usarlo como *draft model* de un Qwen3.5 de mayor tamaño, aceptando sus tokens candidatos y reduciendo el número de pasos de decodificación del modelo grande.
- **Prototipado rápido de pipelines multimodales**: al ocupar 0,85 GB, se pueden levantar varias instancias en paralelo en un mismo Mac para comparar prompts, temperaturas o versiones de preprocesado de imagen antes de invertir en un modelo mayor.
- **Extracción de campos en documentos escaneados**: combinación de OCR previo y paso por la torre de visión para estructurar recibos, albaranes o formularios en JSON, ejecutándose íntegramente en local por motivos de confidencialidad.
- **Clasificación y enrutado de bajo coste**: uso como clasificador de intenciones o de toxicidad en una primera etapa de un sistema mayor, aprovechando la latencia reducida de un modelo por debajo de mil millones de parámetros.
- **Procesamiento por lotes en un portátil**: tareas de resumen, reescritura o etiquetado sobre miles de documentos en un MacBook sin conexión, con un consumo de memoria que deja margen para el resto del sistema.
- **Desarrollo de aplicaciones iOS/macOS**: integración mediante mlx-swift dentro de una app nativa, usando el formato `safetensors` MLX tal y como se distribuye, sin conversión intermedia.
- **Evaluación comparativa de cuantizaciones**: servir de referencia para medir la degradación introducida por 6 bits frente al mismo modelo en BF16 o en 8 bits, dado que el autor publica el desglose exacto de bits por componente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card se limita al desglose de cuantización y almacenamiento, sin métricas de calidad (MMLU, HumanEval, GSM8K, MMMU u otras) ni comparación con el modelo base en BF16.

## Requisitos de hardware

- **Peso en disco**: 0,851 GB (0,793 GiB) según el desglose del autor; el repositorio completo ocupa 0,9 GB.
- **Memoria en inferencia**: no hay cifra publicada; con 0,873 B de parámetros y estado de atención y caché KV, una estimación razonable es de 1,0 a 1,5 GB de memoria unificada, dependiente de la longitud de contexto finalmente soportada.
- **Hardware compatible**: exclusivamente Apple Silicon (M1 o posterior) por el uso de MLX; no hay kernels CUDA ni ROCm en este repositorio.
- **GPU consumer**: cabe holgadamente en cualquier Mac con 8 GB de memoria unificada; con 16 GB se puede mantener cargado junto a un modelo mayor para decodificación especulativa. En GPUs NVIDIA no es utilizable sin convertir los pesos a otro formato.
- **Opciones de despliegue**: `mlx-lm` para texto, `mlx-vlm` para las rutas con imagen, MLX Swift para aplicaciones nativas, LM Studio (soporte MLX) y la propia herramienta oMLX. vLLM, llama.cpp y TGI no consumen pesos MLX de forma nativa; requerirían conversión previa.
- **Latencia y throughput**: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia por token.

## Comparativa con modelos similares

Los datos de las alternativas proceden del conocimiento general de esos modelos públicos y no de la información proporcionada en esta ficha; conviene verificarlos antes de tomar decisiones. Las cifras del modelo comparado principal figuran como no disponibles porque la model card no las declara.

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-oQ6-mtp | 0,873 B (0,752 B LM + 0,101 B visión + 0,020 B MTP) | No disponible | No disponible | safetensors MLX, solo Apple Silicon | Cuantización mixta de 7,795 bits/peso; incluye cabeza MTP |
| Qwen3-0.6B | 0,6 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF, MLX según conversión | Generación anterior, solo texto, sin torre de visión declarada |
| Llama 3.2 1B Instruct | 1,24 B | 128 000 tokens | Licencia comunitaria Llama 3.2 | safetensors, GGUF, MLX | Multilingüe declarado; contexto muy superior |
| Gemma 3 1B IT | 1 B | 32 000 tokens | Licencia Gemma | safetensors, GGUF, MLX | Variante multimodal disponible en tamaños mayores de la familia |

Frente a estas alternativas, la ventaja diferencial de este checkpoint es la combinación de multimodalidad, cabeza MTP y un tamaño de 0,85 GB, junto con el desglose transparente de la cuantización. La desventaja principal es la ausencia total de datos de rendimiento y de licencia declarada, lo que dificulta una comparación rigurosa.

## Limitaciones y advertencias

- **Licencia no declarada**: la model card no especifica licencia. Antes de cualquier uso comercial hay que consultar la licencia del modelo base Qwen3.5-0.8B en su repositorio original, ya que este checkpoint es una obra derivada y hereda sus restricciones.
- **Capacidad limitada por el tamaño**: con 0,752 B de parámetros en el modelo de lenguaje, es esperable un rendimiento flojo en razonamiento multi-paso, matemáticas y código, y una tasa de alucinación alta en preguntas factuales.
- **Cuantización agresiva**: el 79,6 % de los pesos está a 6 bits, lo que puede degradar tareas sensibles a la precisión numérica o al seguimiento estricto de instrucciones. El 11,8 % en BF16 mitiga el efecto en determinadas capas, pero no lo elimina.
- **Validación comunitaria nula**: 8 descargas y 0 valoraciones en el momento de redactar esta ficha. No hay evaluación de terceros que confirme la fidelidad del checkpoint respecto al modelo original.
- **Longitud de contexto desconocida**: al no declararse, no se debe asumir ninguna ventana concreta en producción; hay que medirla empíricamente antes de diseñar prompts largos.
- **Idiomas no declarados**: no hay garantía de calidad en castellano; es probable que el modelo base esté optimizado para inglés y chino, pero no se confirma en la documentación disponible.
- **Dependencia de plataforma**: requiere Apple Silicon. No se puede desplegar en servidores con GPU NVIDIA sin convertir los pesos, lo que invalida su uso en clústeres convencionales.
- **Repositorio sin pipeline declarado**: la ficha de HuggingFace no indica tarea ni pipeline, por lo que la integración depende de cargar el checkpoint con `mlx-vlm` o `mlx-lm` y validar manualmente el chat template del modelo base.
- **Fecha de publicación adelantada**: el repositorio aparece creado el 2026-10-20, muy reciente respecto al resto del ecosistema; conviene comprobar que corresponde a la versión de Qwen3.5 que se pretende usar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bambocher/Qwen3.5-0.8B-oQ6-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- Modelo base Qwen3.5-0.8B: no disponible en la información proporcionada (la model card no enlaza el checkpoint de origen)
