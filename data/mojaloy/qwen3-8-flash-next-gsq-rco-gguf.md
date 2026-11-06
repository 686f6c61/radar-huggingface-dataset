# Mojaloy/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de mezcla de expertos (MoE) disperso y multimodal desarrollado por Qwen (Alibaba). Esta ficha describe la versión cuantizada publicada por Mojaloy en Hugging Face, que redistribuye los GGUF generados por IST-DASLab mediante las técnicas GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization). El modelo base emplea 512 expertos enrutados por capa a lo largo de 48 capas, de los cuales 10 se activan por token, con un total de 176.943.899.520 parámetros (unos 177.000 millones). El repositorio ocupa 208,4 GB e incluye el proyector de visión (`mmproj`) en BF16 para uso multimodal.

La relevancia de esta publicación radica en la cuantización no uniforme: en lugar de aplicar un único tipo de cuantización a todos los tensores, se asigna un tipo distinto a cada tensor mediante una búsqueda basada en gradientes que reparte la precisión según la sensibilidad de cada tensor, sujeto a un presupuesto total de tamaño. El resultado son ficheros GGUF estándar que funcionan sin modificaciones en llama.cpp, Ollama y LM Studio, lo que permite ejecutar un MoE de 177.000 millones de parámetros en hardware mucho más modesto que el modelo original.

El modelo resuelve el problema de desplegar un MoE multimodal de gran tamaño con recursos limitados, ofreciendo cuatro variantes entre 2,40 y 3,50 bits por peso (66,4 GB a 83,6 GB en total). La variante recomendada, IQ3_S, iguala o supera al modelo base en todas las tareas evaluadas según la model card. Existe además una variante especializada en código publicada por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) dispersa, transformer, multimodal (image-text-to-text) |
| Parametros totales | 176.943.899.520 (unos 177.000 millones) |
| Parametros activos | 10 de 512 expertos enrutados por token, en 48 capas (número total de parámetros activos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF no uniforme: Q2_0, IQ2_XS, IQ3_XXS, IQ3_S; tabla n-gram a IQ4_NL; mmproj en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos shards por variante más un fichero mmproj) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos dispersa con 48 capas y 512 expertos enrutados por capa, de los que se activan 10 por token. Las matrices de los expertos enrutados dominan el recuento de parámetros: el 95 % de los pesos sujetos a búsqueda de cuantización se concentra en ellos. Incluye además una tabla de embeddings n-gram por capa (`per_layer_token_embd`, 51.200 millones de parámetros) que funciona como tabla de consulta, no como peso de multiplicación matricial, y que se mantiene fija a IQ4_NL (4,5 bits por peso) en todas las variantes. El modelo es multimodal: incorpora un codificador de visión y proyector (`mmproj`) en BF16 de 0,91 GB.

Sobre el entrenamiento del modelo base no se proporciona información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF o DPO: no disponible). La innovación técnica documentada corresponde al proceso de cuantización. GSQ es una cuantización escalar de post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajación Gumbel-Softmax, cerrando buena parte de la brecha entre cuantización escalar y vectorial a 2-3 bits. RCO asigna uno de K tipos de cuantización a cada uno de N tensores bajo un presupuesto total de tamaño, reformulando la restricción como una variedad riemanniana suave en el espacio de logits que permite optimizar directamente sobre la pérdida de la tarea con cumplimiento exacto del presupuesto. La asignación se hace por capa, no por experto, porque GGUF no puede expresar lo segundo.

## Capacidades

- Generación de texto conversacional en formato multimodal image-text-to-text.
- Procesamiento de imágenes mediante el codificador de visión y proyector incluidos (`mmproj` en BF16).
- Razonamiento y matemáticas: la variante IQ3_XXS iguala al modelo base en AIME25 según la model card.
- Capacidades de mezcla de expertos con enrutamiento disperso (10 de 512 expertos activos por token).
- Compatibilidad con endpoints y con el ecosistema GGUF (llama.cpp, Ollama, LM Studio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un MoE multimodal de gran tamaño: las variantes de 66,4 GB a 83,6 GB permiten ejecutar un modelo de 177.000 millones de parámetros en estaciones de trabajo con suficiente memoria, algo inviable con los pesos originales.
- Inferencia de alta velocidad en producción: la variante Q2_0 evita formatos con tablas de consulta grandes y ofrece 3,4 veces el throughput de prompt y 1,9 veces menos latencia extremo a extremo que IQ2_XS, con un tamaño ligeramente menor, lo que la hace adecuada para servicios con requisitos de latencia estrictos.
- Procesamiento de documentos con imágenes: el `mmproj` en BF16 permite tareas image-text-to-text como descripción de imágenes, extracción de información de capturas o análisis de gráficos, combinando visión y generación de texto en un solo modelo.
- Asistentes conversacionales multi-turno: el pipeline image-text-to-text y el formato GGUF permiten integrar el modelo en aplicaciones de chat con llama.cpp u Ollama, aunque la longitud de contexto no está documentada.
- Evaluación y experimentación en investigación: al ser una cuantización no uniforme publicada con papers y código (GSQ y RCO), sirve para reproducir y comparar estrategias de asignación de precisión por tensor en modelos MoE grandes.
- Generación de código: aunque esta ficha cubre la variante general, existe una variante especializada en código (Qwen3.8-Flash-Next-GSQ-RCO-Coder) que retiene 256 de los 512 expertos enrutados por capa a 1,89 bpw efectivos y 58,4 GB totales, pensada para tareas de programación.
- Prototipado en hardware de consumo: las variantes de menor tamaño (Q2_0 e IQ2_XS) permiten probar el modelo en equipos con menos memoria, a costa de precisión.

## Benchmarks y rendimiento

La model card no presenta una tabla numérica de benchmarks por tarea (MMLU, HumanEval, GSM8K, etc.). Solo se indica cualitativamente que IQ3_XXS iguala al modelo base en AIME25 y que IQ3_S iguala o supera al modelo base en todas las tareas. Se incluye una gráfica de media de tareas frente a bits por peso, pero sin valores numéricos en el texto disponible.

| Variante | bpw | Shard 1 (pesos) | Shard 2 (n-gram) | Total | Nota de rendimiento |
|---|---|---|---|---|---|
| Q2_0 | 2,40 | 37,6 GB | 28,8 GB | 66,4 GB | 3,4x throughput de prompt y 1,9x menos latencia que IQ2_XS |
| IQ2_XS | 2,50 | 39,2 GB | 28,8 GB | 68,0 GB | Menor tamaño a igual calidad |
| IQ3_XXS | 3,00 | 47,0 GB | 28,8 GB | 75,8 GB | Iguala al base en AIME25 |
| IQ3_S | 3,50 | 54,8 GB | 28,8 GB | 83,6 GB | Recomendada; iguala o supera al base en todas las tareas |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: entre 66,4 GB (Q2_0) y 83,6 GB (IQ3_S) para los pesos cuantizados, más 0,91 GB del `mmproj` en BF16 si se usa visión. Hay que añadir la memoria para el contexto y el estado de inferencia.
- GPU recomendadas: no disponible de forma explícita; por tamaño, se requieren aceleradores con 80 GB o más de memoria (A100 80 GB, H100) o configuraciones multi-GPU, dado que incluso la variante más pequeña supera los 64 GB.
- ¿Cabe en GPU de consumo? No en una sola GPU de consumo convencional: la variante más pequeña (66,4 GB) excede la memoria de tarjetas como la RTX 4090 (24 GB). Sería necesario repartir entre varias GPU o usar memoria del sistema con offloading.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (compatibilidad declarada sin modificaciones); el tag `endpoints_compatible` sugiere compatibilidad con endpoints compatibles con GGUF.
- Latencia y throughput: solo se documenta la comparación relativa entre Q2_0 e IQ2_XS (3,4x throughput de prompt y 1,9x menor latencia extremo a extremo para Q2_0). No hay valores absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 176.943.899.520 | no disponible | Apache 2.0 | Hugging Face (Qwen) | Pesos originales; sin cuantizar |
| Qwen3.8-Flash-Next GSQ-RCO (esta ficha) | 176.943.899.520 | no disponible | Apache 2.0 | GGUF, 4 variantes | Cuantización no uniforme, multimodal |
| Qwen3.8-Flash-Next-GSQ-RCO-Coder | no disponible | no disponible | no disponible | GGUF, 58,4 GB | Variante de código; retiene 256 de 512 expertos, 1,89 bpw efectivos |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce pérdida de precisión: las variantes de menor bpw (Q2_0, IQ2_XS) pueden degradar tareas sensibles, aunque IQ3_S se declara a la par o por encima del base en las tareas evaluadas.
- La asignación de cuantización se hace por capa y no por experto, porque GGUF no puede expresar tipos por experto; esto limita la granularidad de la optimización.
- La tabla n-gram de 51.200 millones de parámetros se mantiene fija a IQ4_NL en todas las variantes y no participa en la búsqueda, lo que condiciona el tamaño mínimo del despliegue (28,8 GB solo para esa tabla).
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no disponible en la información proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-Flash-Next y de los pesos originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada de esta redistribución concreta.
- La fecha de creación indicada (2026-11-01) es la registrada en Hugging Face; verificar la vigencia de los enlaces y artefactos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mojaloy/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante de código: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Código GSQ: https://github.com/IST-DASLab/GSQ
- Código RCO: https://github.com/IST-DASLab/RCO
- Organización DASLab: https://github.com/IST-DASLab
