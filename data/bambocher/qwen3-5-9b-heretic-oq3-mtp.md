# bambocher/Qwen3.5-9B-heretic-oQ3-mtp

## Resumen

Qwen3.5-9B-heretic-oQ3-mtp es una cuantización mixta del modelo Qwen3.5-9B en su variante "heretic", publicada por el usuario bambocher en Hugging Face. El checkpoint conserva el modelo de lenguaje, la torre de visión y una cabeza MTP (multi-token prediction), y se distribuye en formato MLX con safetensors para su ejecución en Apple Silicon. No se trata de un modelo entrenado desde cero, sino de un artefacto de compresión sobre una base Qwen3.5 de aproximadamente 9.650 millones de parámetros.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de cuantización mixta por capas (oQ, de oMLX v0.7.3) que asigna precisión de forma no uniforme: el 68,4 % de los pesos lógicos quedan en 3 bits afín con grupo de 64, mientras que una fracción pequeña se mantiene en BF16. El resultado es un checkpoint de 5,4 GB con un promedio efectivo de 4,497 bits por peso, lo que permite ejecutar un modelo multimodal de casi 10.000 millones de parámetros en equipos con memoria unificada limitada.

El sufijo "heretic" indica que la base deriva de una variante Qwen3.5 con ajuste orientado a reducir rechazos (abliteración o fine-tuning de desalineación de seguridad), un detalle relevante para evaluar riesgos. La model card no documenta el proceso de entrenamiento original, los datos utilizados ni los benchmarks, por lo que esta ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo lo que no aparece en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5) con torre de visión y cabeza MTP; pesos cuantizados en formato MLX |
| Parámetros totales | 9.653.104.368 (9,653 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Mixta afín con grupo de 64: 3, 4, 5, 6 y 8 bits, más capas en BF16; promedio efectivo 4,497 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), 5,4 GB de repositorio |

Desglose de la cuantización según la model card:

| Formato de almacenamiento | Pesos lógicos | Porcentaje | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Afín 3 bits, grupo 64 | 6,604 B | 68,413 % | 2,691 GiB | 3,50 |
| Afín 4 bits, grupo 64 | 1,692 B | 17,532 % | 0,887 GiB | 4,50 |
| Afín 5 bits, grupo 64 | 0,811 B | 8,399 % | 0,519 GiB | 5,50 |
| Afín 6 bits, grupo 64 | 0,050 B | 0,521 % | 0,038 GiB | 6,50 |
| Afín 8 bits, grupo 64 | 0,005 B | 0,052 % | 0,005 GiB | 8,50 |
| BF16 | 0,491 B | 5,083 % | 0,914 GiB | 16,00 |
| **Total** | **9,653 B** | **100 %** | **5,053 GiB** | **4,497** |

Desglose por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 8,954 B | 4,329 GB / 4,032 GiB |
| Visión | 0,456 B | 0,912 GB / 0,849 GiB |
| Cabeza MTP | 0,243 B | 0,185 GB / 0,172 GiB |
| **Total** | **9,653 B** | **5,426 GB / 5,053 GiB** |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de Qwen3.5-9B más allá de su naturaleza multimodal: el checkpoint incluye un modelo de lenguaje de 8,954 B de parámetros, una torre de visión de 0,456 B y una cabeza MTP de 0,243 B. La presencia de MTP (multi-token prediction) sugiere que el modelo base incorpora decodificación especulativa o predicción de varios tokens por paso, aunque la model card no detalla su funcionamiento ni el esquema de entrenamiento asociado. Tampoco se especifica si la arquitectura es densa o MoE; el recuento de parámetros y la ausencia de parámetros activos distintos apuntan a un modelo denso, pero no puede confirmarse con los datos disponibles.

El proceso de entrenamiento original de Qwen3.5-9B no está documentado en la información proporcionada: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. La variante "heretic" implica un ajuste posterior sobre la base Qwen3.5 orientado a modificar el comportamiento de rechazo, pero el repositorio no incluye detalles sobre ese proceso. La innovación técnica documentada en este artefacto es exclusivamente la cuantización mixta oQ de oMLX v0.7.3, que distribuye precisiones por tensor para minimizar la pérdida de calidad manteniendo un tamaño reducido.

## Capacidades

- Generación de texto y razonamiento general, heredadas del modelo base Qwen3.5-9B.
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0,456 B de parámetros, lo que habilita tareas de comprensión visual.
- Predicción multi-token (MTP): la cabeza dedicada de 0,243 B permite generar varios tokens por paso, lo que puede acelerar la decodificación.
- Capacidades multilingües: no disponibles en la información proporcionada; dependen del modelo base, que no se documenta aquí.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" u otras capacidades especiales: no disponible en la información proporcionada.
- Ejecución en Apple Silicon mediante MLX, con pesos cuantizados listos para cargar en memoria unificada.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el checkpoint de 5,4 GB cabe en equipos Apple Silicon de 16 GB o más, lo que permite ejecutar un modelo multimodal de casi 10 B en un portátil sin GPU dedicada. Adecuado para prototipado y uso personal.
- Asistentes de escritorio con comprensión de imágenes: la torre de visión integrada permite procesar capturas de pantalla, documentos escaneados o fotografías en flujos locales, sin enviar datos a servicios externos.
- Generación de texto asistida en entornos con requisitos de privacidad: al ejecutarse en local con MLX, el modelo es apropiado para redactar, resumir o transformar texto sobre material sensible que no debe salir del dispositivo.
- Aceleración de decodificación con MTP: la cabeza de predicción multi-token puede aprovecharse en pipelines de generación larga donde la latencia por token es crítica, como la redacción iterativa o la síntesis de documentos extensos.
- Investigación sobre cuantización mixta: el checkpoint sirve como caso de estudio para evaluar el impacto de asignar 3 bits al 68 % de los pesos y mantener capas selectivas en BF16, comparando calidad frente a cuantizaciones uniformes de 4 bits.
- Evaluación de variantes "heretic": útil para investigadores que estudian cómo el ajuste de rechazo afecta al comportamiento del modelo en tareas sensibles, siempre con las cautelas éticas y legales correspondientes.
- Despliegue en entornos educativos y de demostración: el tamaño reducido y el formato MLX facilitan talleres y demostraciones en hardware de consumo sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación multimodal, y tampoco ofrece comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint ocupa 5,4 GB en disco y aproximadamente 5,05 GiB en memoria; se recomienda al menos 8 GB de memoria unificada libre para la carga y un margen adicional para el contexto y los estados de atención.
- Memoria recomendada: 16 GB de memoria unificada en Apple Silicon para un uso cómodo con contextos moderados; 8 GB puede ser insuficiente según la longitud de contexto.
- GPU compatibles: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4 y posteriores). No se documenta soporte para GPU NVIDIA o AMD en este repositorio.
- GPU de consumo: sí cabe en equipos Apple Silicon de gama consumer con 16 GB o más; no se proporcionan datos para RTX 4090 u otras GPU de consumo x86, ya que el formato no es directamente compatible.
- Opciones de despliegue: MLX y el ecosistema oMLX (oQ); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, dado el formato específico de MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-heretic-oQ3-mtp | 9,653 B | no disponible | Mixta 3-8 bits + BF16 (4,497 bits/peso) | no disponible | Hugging Face, formato MLX |
| Qwen3.5-9B (base) | ~9,65 B (inferido) | no disponible | BF16 original | no disponible | no disponible en la información |
| Cuantizaciones uniformes de 4 bits del mismo base | ~9,65 B | no disponible | 4 bits afín | no disponible | no disponible en la información |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia. No se han identificado alternativas equivalentes documentadas en el repositorio.

## Limitaciones y advertencias

- La variante "heretic" implica un ajuste orientado a reducir rechazos de seguridad; esto puede aumentar la probabilidad de generar contenido dañino, sesgado o inapropiado en comparación con el modelo base alineado.
- La cuantización a 3 bits en el 68 % de los pesos puede degradar la calidad en tareas de razonamiento complejo, matemáticas o código; no se han publicado evaluaciones que cuantifiquen esta pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje de esta escala, sin datos específicos sobre su magnitud en esta variante.
- Licencia no disponible: no puede confirmarse si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base Qwen3.5 antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; el rendimiento en castellano u otras lenguas distintas del inglés o chino no está garantizado.
- Longitud de contexto no disponible; no puede planificarse su uso en tareas de contexto largo sin verificar la configuración del modelo base.
- Formato MLX: no es portable a ecosistemas x86/NVIDIA sin conversión, lo que limita su uso en infraestructura de servidores tradicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación comunitaria ni de pruebas independientes.
- La cabeza MTP y la torre de visión están cuantizadas de forma mixta; su comportamiento tras la compresión no está evaluado en la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bambocher/Qwen3.5-9B-heretic-oQ3-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
