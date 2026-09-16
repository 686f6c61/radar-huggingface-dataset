# mradermacher/GRM-3.2-Sky-GGUF

## Resumen

GRM-3.2-Sky-GGUF es un repositorio de cuantizaciones estáticas del modelo OrionLLM/GRM-3.2-Sky, publicado por el usuario mradermacher, conocido por generar versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribución en formato GGUF del modelo base, orientada a inferencia local y a despliegues sin GPU de gama alta.

El modelo subyacente cuenta con 34.660.610.688 parámetros totales (aproximadamente 34,66 mil millones), según los datos de safetensors reportados. El repositorio ocupa 21,4 GB e incluye un conjunto amplio de cuantizaciones: x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K e IQ4_XS. La etiqueta conversational sugiere un ajuste orientado a diálogo, aunque no se documenta el proceso de ajuste.

La relevancia de esta ficha es limitada pero práctica: permite saber qué se puede desplegar hoy con este repositorio y qué información falta. La model card es mínima (una línea que remite al modelo base) y no aporta datos de contexto, licencia, idiomas ni benchmarks, por lo que buena parte de las especificaciones quedan marcadas como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en la model card; solo se indica que es una cuantización del modelo OrionLLM/GRM-3.2-Sky) |
| Parámetros totales | 34.660.610.688 (≈34,66 mil millones, dato de safetensors) |
| Parámetros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye presumiblemente en safetensors, aunque no se confirma en la información disponible |
| Versión de cuantización | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Tamaño del repositorio | 21,4 GB |
| Fecha de creación | 2026-09-16 (según metadatos de HuggingFace) |
| Última actualización | 2026-09-16 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base en la documentación proporcionada. La model card del repositorio se limita a indicar que se trata de cuantizaciones estáticas del modelo OrionLLM/GRM-3.2-Sky y a declarar los metadatos del proceso de conversión: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. Esto implica que los pesos originales estaban en formato HuggingFace (presumiblemente safetensors) y que se aplicó una cuantización de tipo estático, es decir, con escalas calculadas a partir de los pesos y no de forma dinámica en tiempo de ejecución.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones arquitectónicas como atención lineal, decodificación especulativa o mezclas de expertos. La etiqueta conversational del repositorio apunta a un modelo ajustado para diálogo, pero es la única señal disponible y no viene acompañada de detalles técnicos. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo, aunque no se detallan las capacidades concretas.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede servirse a través de endpoints compatibles con la API de HuggingFace o similares.
- Inferencia local en formatos GGUF: al estar cuantizado, es utilizable con runtimes de CPU y GPU de consumo.
- Razonamiento, código, matemáticas, visión, audio: no disponible; no hay información que confirme ni descarte estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo de pensamiento (thinking mode) u otras capacidades especiales: no disponible.

## Casos de uso

Los siguientes casos se plantean como escenarios realistas para un modelo conversacional de 34,66 mil millones de parámetros servido en GGUF, condicionados a que el modelo base rinda según lo esperable en su rango de tamaño. No implican capacidades verificadas en la información disponible.

- Asistente conversacional autoalojado: desplegando la cuantización Q4_K_M o Q5_K_M en llama.cpp u Ollama, se puede ofrecer un chat interno sin enviar datos a servicios externos, algo relevante en entornos con requisitos de privacidad.
- Generación de textos largos en local: con un modelo de 34,66 B en formato GGUF es viable redactar documentación, resúmenes o borradores en una estación de trabajo con GPU de gama alta, evitando costes por token de API.
- Prototipado de producto conversacional: usar el endpoint compatible para validar la experiencia de usuario de un chatbot antes de decidir si se migra a una versión sin cuantizar o a un proveedor gestionado.
- Procesamiento por lotes de textos en CPU: las cuantizaciones Q4_K_S o Q3_K_M permiten ejecutar tareas de generación o reformulación en servidores sin GPU, a costa de menor calidad y velocidad.
- Evaluación comparativa de cuantizaciones: el repositorio incluye doce variantes, lo que permite medir la degradación de calidad entre x-f16 y Q2_K para decidir el punto de equilibrio entre tamaño y fidelidad en un despliegue concreto.
- Integración en herramientas de desarrollo: al ser GGUF, se puede conectar a interfaces como Open WebUI, LM Studio o Continue, de modo que el equipo disponga de un asistente de redacción y consulta integrado en su entorno de trabajo.
- Base para ajuste fino ligero: si la licencia del modelo base lo permite, las cuantizaciones de mayor precisión (Q8_0 o x-f16) pueden servir como referencia de evaluación antes de aplicar LoRA sobre los pesos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio únicamente documenta los parámetros de cuantización y no incluye mediciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni para el modelo base ni para las cuantizaciones derivadas. Tampoco los resultados de la búsqueda web aportan datos al respecto.

## Requisitos de hardware

Los tamaños de archivo indicados a continuación son estimaciones derivadas del número de parámetros (34,66 B) y del número de bits por peso de cada tipo de cuantización; no proceden de la documentación del repositorio y pueden variar según la implementación de cuantización.

| Cuantización | Tamaño aproximado | VRAM estimada para inferencia |
|---|---|---|
| x-f16 | ≈69 GB | ≈70-75 GB |
| Q8_0 | ≈37 GB | ≈38-42 GB |
| Q6_K | ≈28,5 GB | ≈30-34 GB |
| Q5_K_M | ≈24 GB | ≈26-29 GB |
| Q5_K_S | ≈24 GB | ≈26-29 GB |
| Q4_K_M | ≈21 GB | ≈22-26 GB |
| Q4_K_S | ≈20 GB | ≈21-25 GB |
| IQ4_XS | ≈19 GB | ≈20-24 GB |
| Q3_K_L | ≈17,5 GB | ≈19-22 GB |
| Q3_K_M | ≈16,5 GB | ≈18-21 GB |
| Q3_K_S | ≈15 GB | ≈17-19 GB |
| Q2_K | ≈13,4 GB | ≈15-18 GB |

- GPU recomendadas: para las cuantizaciones altas (Q8_0 y x-f16) hacen falta tarjetas con 48-80 GB de memoria, como A100 80 GB, H100 80 GB o configuraciones multi-GPU. Para Q5 y Q4, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) pueden bastar si el contexto es moderado; con contextos largos la caché KV puede exceder la VRAM disponible.
- GPU de consumo: las cuantizaciones Q3 y Q2, junto con IQ4_XS, son las candidatas a caber en tarjetas de 16 GB o 12 GB, con degradación de calidad previsible. El modelo completo en x-f16 no cabe en ninguna GPU de consumo actual.
- CPU y RAM: al ser GGUF, el modelo puede ejecutarse en CPU con llama.cpp; se recomienda al menos la misma cantidad de RAM que el tamaño del archivo más un margen, y en la práctica el doble para trabajar con comodidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp y servidores compatibles con GGUF como llama-cpp-python o TGI con soporte GGUF. vLLM no consume GGUF de forma nativa, por lo que requeriría los pesos originales en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones para este repositorio.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables, ni datos de rendimiento del modelo base, ni especificaciones suficientes (contexto, licencia, idiomas) para establecer una comparación rigurosa con alternativas de la misma categoría. Como única referencia interna, este repositorio se relaciona con el modelo original OrionLLM/GRM-3.2-Sky, del que es una redistribución cuantizada: frente a este, el repositorio GGUF ofrece menor requisito de memoria y compatibilidad con runtimes de inferencia local, a cambio de una pérdida de precisión que no ha sido cuantificada públicamente.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay documentación sobre los datos de entrenamiento ni sobre evaluaciones de sesgo.
- Riesgo de alucinación: previsible en cualquier modelo generativo de este tamaño, pero no cuantificado en la información disponible. En ausencia de benchmarks, no se puede estimar su fiabilidad en tareas factuales.
- Degradación por cuantización: las variantes de menor precisión (Q2_K, Q3_K_S) pueden degradar notablemente la coherencia y la calidad del texto respecto a x-f16. No hay mediciones publicadas de esa pérdida.
- Contexto e idiomas: se desconoce la longitud de contexto soportada y los idiomas cubiertos, lo que impide garantizar un comportamiento correcto en castellano o en tareas de contexto largo.
- Licencia: no disponible. Al no declararse la licencia del modelo base ni de este repositorio, no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia en OrionLLM/GRM-3.2-Sky antes de cualquier despliegue en producción.
- Trazabilidad: la model card es prácticamente vacía y no documenta el proceso de cuantización más allá de los metadatos de conversión, ni incluye instrucciones de uso, plantilla de prompt o parámetros de muestreo recomendados.
- Repositorio sin actividad: cero descargas y cero likes en el momento de la consulta, lo que reduce la probabilidad de que existan informes externos de funcionamiento.
- Fechas de metadatos: la fecha de creación registrada (2026-09-16) es posterior a la fecha actual de referencia habitual, lo que conviene tener en cuenta al citar el repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/GRM-3.2-Sky-GGUF
- Modelo base: https://huggingface.co/OrionLLM/GRM-3.2-Sky
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes; las consultas devolvieron resultados no relacionados con el modelo (preguntas de Stack Overflow sobre Git, operadores en C y puntuación en inglés).
