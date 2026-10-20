# bambocher/Qwen3.5-2B-oQ4-mtp

## Resumen

Qwen3.5-2B-oQ4-mtp es una versión cuantizada del modelo Qwen3.5-2B de Alibaba Cloud, publicada por el usuario bambocher en Hugging Face. El checkpoint contiene 2.274.069.824 parámetros repartidos en tres bloques: 1.882 millones en el modelo de lenguaje, 331 millones en la torre de visión y 61 millones en una cabeza MTP de predicción multi-token. Los pesos están convertidos al formato MLX y comprimidos con cuantización mixta oQ (oMLX v0.7.1rc1) hasta una media efectiva de 6,420 bits por peso.

El interés práctico es de ingeniería: reduce un modelo visión-lenguaje de ~2,27 mil millones de parámetros a un repositorio de 1,825 GB que cabe sin problemas en la memoria unificada de un Mac con Apple Silicon, manteniendo la torre de visión en BF16 y comprimiendo el grueso del transformer a 4 bits. La cabeza MTP añade predicción multi-token, aprovechable para decodificación especulativa y para reducir el número de pasos de generación.

No se trata de un modelo nuevo, sino de una receta de cuantización sobre Qwen3.5-2B. La documentación del modelo base lo describe como parte de la serie multilingüe Qwen3.5, con entrenamiento de fusión temprana sobre tokens multimodales, mejor razonamiento y seguimiento de instrucciones que Qwen3, y resultados superiores a Qwen3-VL en razonamiento, código, agentes y comprensión visual. Para este checkpoint cuantizado no hay resultados de evaluación publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 con fusión temprana visión-lenguaje y cabeza MTP; pesos MLX cuantizados con oQ (oMLX v0.7.1rc1) |
| Parámetros totales | 2.274.069.824 (modelo de lenguaje 1.882 millones; visión 331 millones; cabeza MTP 61 millones) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Mixta affine de 4, 5, 6 y 8 bits con grupo 64, más pesos en BF16; media efectiva 6,420 bits/peso; el mismo autor publica una variante oQ8 |
| Idiomas soportados | Multilingüe heredado de Qwen3.5-2B; el repositorio no declara lista de idiomas |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX); tamaño del repositorio 1,825 GB (1,700 GiB) |
| Librería de ejecución | mlx |
| Descargas / likes | 8 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El checkpoint conserva la topología del modelo base y solo altera la representación numérica de los pesos. La distribución de precisión es heterogénea: el 67,367 % de los pesos lógicos (1,532 mil millones) se guarda a 4 bits, un 15,445 % a 5 bits, un 2,215 % a 6 bits, un 0,006 % a 8 bits y un 14,967 % (0,340 mil millones) permanece en BF16. En la práctica esto significa que la torre de visión (331 millones de parámetros, 0,617 GiB) se almacena prácticamente sin comprimir, mientras que el modelo de lenguaje baja a unos 4,74 bits/peso efectivos (1.882 millones de parámetros en 1,039 GiB).

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1.882 millones | 1,116 GB / 1,039 GiB |
| Visión | 331 millones | 0,663 GB / 0,617 GiB |
| Cabeza MTP | 61 millones | 0,046 GB / 0,043 GiB |
| Total | 2.274 millones | 1,825 GB / 1,700 GiB |

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 4 bits, grupo 64 | 1,532 mil millones | 67,367 % | 0,803 GiB | 4,50 |
| Affine 5 bits, grupo 64 | 351 millones | 15,445 % | 0,225 GiB | 5,50 |
| Affine 6 bits, grupo 64 | 50 millones | 2,215 % | 0,038 GiB | 6,50 |
| Affine 8 bits, grupo 64 | ~0 | 0,006 % | ~0 GiB | 8,50 |
| BF16 | 340 millones | 14,967 % | 0,634 GiB | 16,00 |
| Total | 2.274 millones | 100 % | 1,700 GiB | 6,420 |

No hay información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) ni sobre si la cuantización se acompañó de calibración con datos o de ajuste posterior. La model card del repositorio solo documenta la herramienta de cuantización y la distribución de bits; el entrenamiento multimodal por fusión temprana corresponde, según la documentación de la serie, al modelo original de Alibaba Cloud.

## Capacidades

- Generación de texto multilingüe y seguimiento de instrucciones, heredados de Qwen3.5-2B.
- Comprensión de imágenes gracias a la torre de visión de 331 millones de parámetros, conservada en BF16.
- Razonamiento, código y flujos de agentes: la documentación de la serie Qwen3.5 sitúa estos ámbitos por encima de Qwen3 y de Qwen3-VL.
- Predicción multi-token mediante la cabeza MTP de 61 millones de parámetros, orientada a decodificación especulativa.
- Ejecución local en Apple Silicon a través de MLX, sin dependencia de CUDA.
- Modo thinking, soporte de tool calling y otras capacidades específicas del modelo base: no confirmados en la información disponible para este checkpoint.

## Casos de uso

- Asistente local con entrada visual en un Mac: el modelo puede recibir capturas de pantalla o fotos y responder en lenguaje natural manteniendo los datos en el dispositivo, ya que los 1,825 GB de pesos caben en memoria unificada y no requieren servicio externo.
- Extracción de datos de documentos e imágenes: digitalización de facturas, albaranes o formularios combinando la torre de visión con generación de texto estructurado, con la ventaja de que la rama visual no está cuantizada y conserva precisión BF16.
- Prototipado de agentes multi-paso: la cabeza MTP permite plantear decodificación especulativa para reducir latencia en bucles de razonamiento cortos, útil en pruebas de concepto sobre portátiles.
- Evaluación comparativa de cuantización: al existir una variante oQ8 del mismo autor, sirve para medir la degradación real entre 6,42 y 8 bits sobre las mismas tareas, con presupuesto de memoria controlado.
- Traducción y redacción asistida en local para flujos con requisitos de privacidad, donde enviar texto a una API no es aceptable.
- Generación de código en un IDE sobre macOS: el tamaño de 2,27 B permite autocompletado y explicación de fragmentos con latencia baja en chips M-series, sin GPU dedicada.
- Filtrado y clasificación de contenido en pipelines offline: etiquetado de imágenes o texto por lotes en un equipo de sobremesa Apple, con un coste de infraestructura prácticamente nulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este checkpoint. La documentación de la serie Qwen3.5 afirma mejoras cualitativas frente a Qwen3 y resultados superiores a Qwen3-VL en razonamiento, código, agentes y comprensión visual, pero no se han facilitado cifras concretas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, ni para el modelo base ni para la versión cuantizada.

## Requisitos de hardware

- Pesos en disco: 1,825 GB; en memoria, aproximadamente 2 GB solo para el checkpoint.
- Memoria unificada recomendada: 8 GB o más en Apple Silicon, dejando margen para caché KV y para el procesamiento de imágenes.
- GPU compatibles: chips M1, M2, M3 y M4 (MLX). No es ejecutable directamente en CUDA ni en ROCm sin reconvertir los pesos a otro formato.
- Cabe en GPU de consumo Apple Silicon de gama básica; en GPUs NVIDIA de consumo requeriría una conversión previa a GGUF o a un formato compatible con transformers.
- Opciones de despliegue: mlx-lm (scripts de generación y servidor), LM Studio con backend MLX y utilidades del ecosistema mlx-community. Ollama publica qwen3.5:2b, pero en su propio GGUF y no a partir de este repositorio.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para reducir pasos de decodificación, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato y cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bambocher/Qwen3.5-2B-oQ4-mtp | 2.274 millones | No disponible | MLX safetensors, oQ mixta 4/5/6/8 bits + BF16, 6,42 bits/peso | No disponible | Hugging Face, 8 descargas |
| bambocher/Qwen3.5-2B-oQ8-mtp | 2.274 millones | No disponible | MLX safetensors, oQ 8 bits | No disponible | Hugging Face, mismo autor |
| Qwen/Qwen3.5-2B (original) | 2.274 millones (checkpoint base) | No disponible | safetensors BF16 | No disponible | Hugging Face, repositorio oficial |
| qwen3.5:2b (Ollama) | ~2.000 millones (nominal) | No disponible | GGUF | No disponible | Biblioteca de Ollama |
| qwen3_5_2b (Qualcomm AI Hub) | ~2.000 millones (nominal) | No disponible | Export optimizado para dispositivos Qualcomm | No disponible | Qualcomm AI Hub |

La comparación relevante es interna a la familia: frente al checkpoint original en BF16, esta versión reduce el peso a menos de la mitad a costa de comprimir el transformer, y frente a la variante oQ8 pierde precisión pero gana en huella de memoria. La referencia a Qwen3-VL aparece únicamente en la documentación de la serie como término de comparación cualitativo, sin cifras publicadas.

## Limitaciones y advertencias

- La licencia no está declarada en el repositorio, por lo que el uso comercial del checkpoint queda sin amparo explícito hasta confirmar la licencia del modelo base.
- El 67,367 % de los pesos está a 4 bits: es esperable cierta degradación en tareas sensibles a la precisión numérica (matemáticas, código largo, instrucciones encadenadas), no medida en la información disponible.
- La torre de visión ocupa 0,663 GB, el 36 % del repositorio, y es la parte que más limita el ahorro de memoria pese a la cuantización agresiva del resto.
- Un modelo de 2,27 B parámetros mantiene un riesgo alto de alucinación y de perder el hilo en contextos largos; no se ha publicado la longitud de contexto soportada, lo que impide planificar cargas de trabajo con ventanas amplias.
- El repositorio solo ofrece pesos MLX: no hay GGUF ni safetensors estándar de transformers, lo que ata el despliegue a Apple Silicon.
- No hay lista de idiomas declarada; el soporte multilingüe se deduce de la documentación del modelo base, no de una evaluación de este checkpoint.
- Ausencia total de validación comunitaria: 8 descargas y 0 likes en el momento de la consulta, sin discusiones ni informes de calidad.
- Los metadatos indican fecha de creación y actualización del 20 de octubre de 2026, con tres segundos de diferencia entre ambas; conviene tratar las marcas temporales del repositorio con cautela.
- No se document
