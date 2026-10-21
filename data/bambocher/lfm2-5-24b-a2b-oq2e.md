# bambocher/LFM2.5-24B-A2B-oQ2e

## Resumen

LFM2.5-24B-A2B-oQ2e es una cuantización de precisión mixta publicada por el usuario bambocher en HuggingFace, derivada del modelo base LFM2.5-24B-A2B (etiqueta `lfm2_moe`, familia LFM2). No se trata de un modelo entrenado desde cero, sino de un checkpoint convertido al formato MLX para su ejecución en Apple Silicon, con un total de 23.971.587.712 parámetros lógicos almacenados en 7,694 GiB. La cuantización se realizó con oQ (oMLX v0.7.1), herramienta de cuantización de precisión mixta del ecosistema MLX.

El interés técnico del artefacto está en la relación entre tamaño y almacenamiento: el checkpoint completo cabe en 8,3 GB de disco con una media efectiva de 2,757 bits por peso, lo que lo sitúa en el rango de equipos de consumo con memoria unificada. Para lograrlo, el autor aplica 2 bits afines con grupo de 64 a la práctica totalidad de las matrices (95,743 % de los pesos), reserva 8 bits para un 4,234 % de las capas y mantiene en BF16 un 0,022 % de los tensores, presumiblemente los más sensibles a la cuantización.

La ficha del repositorio es puramente técnica en cuanto al esquema de cuantización: no incluye datos sobre el desarrollador del modelo base, la licencia, los idiomas, la longitud de contexto ni evaluaciones de calidad. Con 7 descargas y 0 "likes" en el momento de la consulta, se trata de una publicación de comunidad sin validación externa, orientada a experimentación local más que a despliegues en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la etiqueta `lfm2_moe` del repositorio; detalles de capas y atencion no disponibles |
| Parametros totales | 23.971.587.712 (23,972 B) |
| Parametros activos | No disponible. El sufijo "A2B" de la nomenclatura sugiere del orden de 2.000 millones de parametros activos, pero el dato no se confirma en la informacion proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precisión mixta: affine 2 bits con grupo de 64 (22,951 B de pesos, 95,743 %), affine 8 bits con grupo de 64 (1,015 B, 4,234 %), BF16 (0,005 B, 0,022 %) y FP32 (traza). Media efectiva: 2,757 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`); repositorio de 8,3 GB |

## Arquitectura y entrenamiento

La etiqueta `lfm2_moe` identifica el checkpoint como una mezcla de expertos de la familia LFM2, y el desglose de almacenamiento del autor confirma que el repositorio contiene únicamente el modelo de lenguaje: 23,972 B de pesos lógicos bajo el epígrafe "Language model", sin componentes de visión o audio. No se dispone de información sobre el número de capas, la configuración de expertos, el mecanismo de atención ni la ventana de contexto del modelo base, y la model card no documenta el entrenamiento original (número de tokens, composición del corpus, etapas de RLHF/DPO o ajuste por preferencias).

La innovación del artefacto es la política de cuantización. oQ (oMLX v0.7.1) aplica cuantización afín con tamaño de grupo 64 y asigna precisión por tensor: el 95,743 % de los pesos queda en 2 bits (2,50 bits/peso efectivos, 6,680 GiB), un 4,234 % se preserva en 8 bits (8,50 bits/peso efectivos, 1,004 GiB) y un 0,022 % permanece en BF16 (16 bits/peso). El resultado son 7,694 GiB de almacenamiento para 23,972 B de parámetros. No se documenta qué criterio (sensibilidad por capa, magnitud, error de reconstrucción) guio la selección de las capas en 8 bits ni si el autor realizó evaluaciones de perplejidad tras la cuantización.

## Capacidades

- Generación de texto: el checkpoint contiene un modelo de lenguaje completo (23,972 B de pesos), por lo que la función principal es la generación autoregresiva de texto.
- Procesamiento de lenguaje natural de propósito general: al no publicarse benchmarks ni ejemplos, el alcance real (razonamiento, matemáticas, código) no está verificado en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún conjunto de idiomas.
- Visión y audio: no. El desglose de componentes solo incluye el modelo de lenguaje, sin torres multimodales.
- Modo de razonamiento explícito (thinking): no disponible.
- Ejecución nativa en Apple Silicon vía MLX: el formato de pesos es MLX, lo que habilita la carga directa con `mlx-lm` en chips de la serie M.

## Casos de uso

- Prototipado local en Mac: cargar el checkpoint con MLX en un equipo Apple Silicon permite disponer de un modelo de ~24 B de parámetros en 8,3 GB de disco y sin conexión, adecuado para validar ideas de producto antes de escalar a infraestructura con GPU.
- Procesamiento de documentos con requisito de privacidad: al ejecutarse íntegramente en local, encaja en flujos de resumen, extracción o reescritura de textos sensibles que no pueden salir a una API externa, siempre que la pérdida de calidad por la cuantización a 2,757 bits sea aceptable.
- Asistencia de redacción offline: borradores, reescritura de estilo y generación de variaciones de texto en un portátil, aprovechando que el modelo cabe en memoria unificada de 16 GB o más.
- Investigación sobre cuantización extrema: el checkpoint sirve como objeto de estudio para medir la degradación de un MoE de ~24 B a menos de 3 bits por peso, comparando contra el modelo base en BF16 o contra cuantizaciones de 4 y 8 bits.
- Experimentación con MLX y evaluación de herramientas: útil para probar el pipeline de oQ/oMLX, la velocidad de carga y el consumo de memoria en distintos chips M, con vistas a definir políticas de cuantización propias.
- Generación de código en local para tareas de baja criticidad: autocompletado, snippets y explicaciones en un editor, asumiendo que no hay evidencia publicada sobre su rendimiento en HumanEval ni sobre su soporte de tool calling.
- Clasificación y etiquetado por lotes en local: tareas de extracción de entidades o categorización sobre volúmenes moderados de texto en un único equipo, donde la latencia no es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de perplejidad posteriores a la cuantización, y tampoco se aportan datos del modelo base que permitan estimar la degradación introducida.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 7,694 GiB de pesos (8,3 GB en disco) más la caché KV y el overhead del runtime MLX; en la práctica, entre 10 y 12 GB de memoria unificada para contextos cortos y lotes pequeños.
- Cabe en GPU de consumo: el formato es MLX, por lo que el objetivo natural son chips Apple M. En equipos con 16 GB de memoria unificada (M1/M2/M3/M4 base y variantes Pro) debería cargar con margen ajustado; en configuraciones de 8 GB el margen es muy reducido o insuficiente. En 24/32 GB o más el modelo deja espacio holgado para contexto y otras aplicaciones.
- GPU NVIDIA (A100, H100, RTX 4090): no hay soporte nativo de MLX en CUDA. Sería necesario reconvertir los pesos a otro formato, algo que no se documenta en el repositorio. Una RTX 4090 (24 GB) o una A100 tendrían capacidad de sobra para alojar el modelo si se convirtiera, pero el proceso no está validado en la información disponible.
- Opciones de despliegue: `mlx-lm` / runtime MLX (compatible de forma nativa). vLLM, TGI, llama.cpp y Ollama no son compatibles directamente con el formato publicado; requerirían conversión a GGUF u otro backend, no disponible en el repositorio.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el checkpoint reduce el tráfico de memoria frente a un BF16 de ~48 GB, lo que favorece la velocidad en hardware limitado por ancho de banda; si se confirma la configuración MoE con ~2 B de parámetros activos, el coste por token sería sustancialmente inferior al de un modelo denso de 24 B, pero este extremo no está verificado.

## Comparativa con modelos similares

No se dispone de datos de alternativas publicadas (licencia, contexto, rendimiento) en la información proporcionada, por lo que la comparación se limita al eje de almacenamiento. Los valores marcados como "estimado" son aritmética directa a partir de los 23,972 B de parámetros, no cifras publicadas.

| Variante | Parametros totales | Almacenamiento | Bits/peso | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-oQ2e (esta ficha) | 23,972 B | 7,694 GiB | 2,757 (mixto) | No disponible | No disponible | MLX, safetensors |
| LFM2.5-24B-A2B en BF16 (estimado, 16 bits/peso) | 23,972 B | ~44,7 GiB | 16,00 | No disponible | No disponible | No confirmada en la informacion disponible |
| Cuantizacion uniforme de 8 bits (estimado) | 23,972 B | ~22,3 GiB | 8,00 | No disponible | No disponible | No confirmada |
| Cuantizacion uniforme de 4 bits (estimado) | 23,972 B | ~11,2 GiB | 4,00 | No disponible | No disponible | No confirmada |

## Limitaciones y advertencias

- Degradación por cuantización extrema: el 95,743 % de los pesos se almacena a 2 bits efectivos, un régimen en el que es esperable una pérdida notable de precisión en razonamiento, matemáticas y adherencia a instrucciones. No se aporta ninguna medición de perplejidad ni comparación con el modelo base que permita cuantificarla.
- Ausencia de benchmarks: no hay evidencia publicada sobre calidad, y el repositorio acumula 7 descargas y 0 "likes", por lo que no existe validación por parte de la comunidad.
- Licencia no declarada: al no indicarse licencia, no puede asumirse permiso para uso comercial. Es imprescindible verificar la licencia del modelo base LFM2.5-24B-A2B antes de cualquier despliegue productivo.
- Idiomas y contexto desconocidos: no se declara lista de idiomas ni longitud de contexto, lo que impide planificar tareas multilingües o de contexto largo con garantías.
- Dependencia de plataforma: el formato MLX limita la ejecución a Apple Silicon. No hay pesos GGUF ni compatibilidad con vLLM, TGI, llama.cpp u Ollama en el repositorio, lo que restringe el despliegue en servidores Linux con GPU.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje; sin evaluaciones disponibles no puede acotarse su magnitud, y la cuantización agresiva tiende a agravarlo en tareas de recuperación de hechos.
- Sesgos: no documentados. Al desconocerse la composición del corpus de entrenamiento del modelo base, no es posible evaluar sesgos de género, idioma o dominio.
- Es una cuantización de comunidad, no una publicación oficial: no hay garantía de soporte, correcciones ni continuidad del repositorio.
- Metadatos anómalos: las fechas de creación y actualización del repositorio (21-10-2026) son posteriores a la fecha habitual de consulta, lo que conviene tener en cuenta al evaluar la fiabilidad del resto de metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/LFM2.5-24B-A2B-oQ2e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM2.5-24B-A2B: no disponible en la información proporcionada
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
