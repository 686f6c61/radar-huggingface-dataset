# Silviase/FullGen4K-3Task-GRPO-v1_1000

## Resumen

FullGen4K-3Task-GRPO-v1_1000 es un ajuste fino de parámetros completos (full-parameter) del modelo multimodal Qwen/Qwen3.5-2B, concretamente sobre el commit fijado `15852e8c16360a2fea060d615a32b45270f8a8fc`. Lo desarrolla Silviase (Koki Maeda), investigador centrado en métricas de evaluación robustas para visión y lenguaje. El modelo resuelve tres tareas simultáneas sobre imágenes: OCR de imagen completa, selección de evidencia (localización de regiones relevantes) y respuesta a preguntas visuales (QA), todo ello dentro de un único checkpoint conversacional de tipo image-text-to-text.

La relevancia del modelo es metodológica más que de escala: es un caso de estudio de entrenamiento multi-tarea mediante GRPO (Group Relative Policy Optimization) con recompensas específicas por tarea y una mezcla 1:1:1 sobre el dataset. Con 2.213.241.664 parámetros (unos 2,21 mil millones), se sitúa en la gama pequeña, lo que lo hace desplegable en hardware de consumo. El repositorio ocupa 8,9 GB en safetensors.

El checkpoint corresponde al paso de optimizador 1000 (el sufijo cuenta actualizaciones de optimizador, no imágenes ni rondas de generación), con un objetivo de 1 época sobre 3.500 imágenes de entrenamiento y 10.500 entradas de tarea. Se distribuye bajo licencia Apache 2.0 y está etiquetado como compatible con endpoints.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de tipo image-text-to-text; familia qwen3_5 (Qwen3.5). Detalle interno de capas y del codificador visual no disponible |
| Parametros totales | 2.213.241.664 (unos 2,21 mil millones) |
| Parametros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; los pesos se publican en safetensors a precisión completa. Compatible con cuantización posterior mediante herramientas estándar (bitsandbytes, GPTQ, AWQ, conversión a GGUF). No disponible confirmación oficial de formatos concretos |
| Idiomas soportados | No disponible en la model card. La evaluación externa de OCR se realiza sobre JaWildText (common580), lo que sugiere tratamiento de texto en japonés, pero no se declara cobertura de idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo base Qwen3.5-2B, un transformer multimodal que acepta imagen y texto como entrada y genera texto (pipeline `image-text-to-text`, tag `qwen3_5`). La model card no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el codificador visual, por lo que esos datos no están disponibles. Tampoco se especifica la longitud de contexto nativa.

El entrenamiento es un ajuste fino de parámetros completos con GRPO, no un ajuste con adaptadores. La configuración documentada en `experiment.json` es la siguiente: paso de optimizador 1000, objetivo de 1 época, 3.500 imágenes de entrenamiento y 10.500 entradas de tarea, semilla 99, 8 prompts por 8 generaciones, 2 actualizaciones de optimizador por ronda de generación, tasa de aprendizaje 5e-7, coeficiente KL 0,02 y longitud máxima de finalización de 4096 tokens. Las tres tareas (OCR, selección de evidencia y QA) usan instrucciones separadas y recompensas específicas, con una mezcla 1:1:1 sobre el dataset. Las recompensas son la media de F1 exacta y suave para OCR, la F1 de conjunto exacta para evidencia y la coincidencia exacta de respuesta normalizada aceptable para QA; las finalizaciones truncadas por el límite reciben recompensa cero.

Como innovación destacable, el autor subraya que `1000` es un checkpoint nativo de Hugging Face sellado y que no se reclama igualdad en el viaje de ida y vuelta de exportación. También advierte que la cantidad de aprendizaje puede diferir respecto a experimentos de solo OCR, y que los resultados externos se publican a efectos de reporte, no para selección de checkpoint. El conjunto de desarrollo de FullGen consta de 500 imágenes y 1.500 ejemplos de tarea.

## Capacidades

- OCR de imagen completa: extracción de texto a partir de imágenes, evaluado con precisión, recall y F1 a nivel de carácter (métricas CC-OCR) y CER sin orden recortado.
- Selección de evidencia: identificación de las regiones o fragmentos relevantes de la imagen para responder a una consulta, evaluada con F1 de conjunto exacta.
- Respuesta a preguntas visuales (QA): respuesta a preguntas sobre el contenido de imágenes y documentos, con formato de respuesta validable.
- Formato de respuesta estructurado: la evaluación externa de QA reporta una tasa de formato válido del 87,22 %, lo que indica salida con estructura controlada (incluye respuestas en formato `boxed`).
- Conversación multiturno: el modelo está etiquetado como `conversational`, por lo que admite diálogo con historial.
- Capacidad multimodal de entrada conjunta de imagen y texto (image-text-to-text).
- Compatibilidad con endpoints de inferencia: incluye la etiqueta `endpoints_compatible`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso declaradas explícitamente: no disponible.
- Modo thinking, audio o vídeo: no disponible.

## Casos de uso

- Digitalización de documentos con OCR: el modelo procesa la imagen completa y devuelve texto, con un F1 de 0,8358 y una tasa de imágenes exactas del 82,76 % en JaWildText common580, lo que lo hace adecuado para pipelines de captura documental donde se prioriza la precisión por imagen.
- Extracción de campos en facturas y recibos: combinando OCR y selección de evidencia, se puede pedir al modelo que localice y transcriba campos concretos (importe, fecha, emisor) y que devuelva la región de la que procede la evidencia.
- QA sobre documentación escaneada: con 1.025 preguntas evaluadas y una tasa de formato válido del 87,22 %, sirve para asistentes que responden preguntas sobre manuales, contratos o informes digitalizados, devolviendo la respuesta y su formato estructurado.
- Análisis de formularios y tablas: la tarea de selección de evidencia permite señalar qué celdas o bloques de la imagen sustentan una respuesta, útil para validación automática de formularios administrativos.
- Normalización de capturas de pantalla y registros de interfaz: extracción de texto de capturas para indexación posterior en buscadores internos o sistemas de tickets.
- Asistencia de accesibilidad: descripción y lectura en voz alta del contenido textual de imágenes para usuarios con discapacidad visual, aprovechando la entrada image-text-to-text.
- Verificación de calidad de digitalizaciones: uso del CER y de la métrica de regiones exactas como señal para enrutar a revisión humana únicamente los documentos con peor coincidencia.
- Investigación en evaluación multimodal: el modelo forma parte de una línea de trabajo sobre métricas (jawildtext-metrics v2) y permite reproducir experimentos de GRPO multi-tarea con recompensas separadas por tarea.

## Benchmarks y rendimiento

Conjunto de desarrollo FullGen (500 imágenes / 1.500 ejemplos de tarea):

| Tarea | n | Recompensa media |
|---|---|---|
| OCR | 500 | 0,8809 |
| Selección de evidencia | 500 | 0,5934 |
| QA | 500 | 0,2280 |

Evaluación externa de OCR sobre JaWildText common580 (580 imágenes, 56 truncadas, 0 vacías; métricas jawildtext-metrics v2, 2026-09-28):

| Métrica | Valor |
|---|---|
| Precisión | 0,8654 |
| Recall | 0,8488 |
| F1 | 0,8358 |
| NED (diagnóstico) | 0,3995 |
| CER | 0,2054 |
| F1 micro a nivel de carácter | 0,5973 |
| Recall de región exacta | 0,4160 |
| Imágenes exactas | 480 de 580 (tasa 0,8276) |
| CER mediano por imagen | 0,0932 |
| Caracteres de referencia | 263.496 |

Evaluación externa de QA (1.025 preguntas, 745 imágenes, 99 truncadas, 2.000 repeticiones, semilla 42, unidad de remuestreo = clúster de imagen):

| Métrica | Valor | IC 95 % |
|---|---|---|
| Contenido correcto | 0,4166 | [0,3845; 0,4473] |
| Formato `boxed` | 0,3961 | [0,3651; 0,4269] |
| Formato válido | 0,8722 | [0,8520; 0,8925] |

No se han publicado en la información disponible comparaciones de estos resultados con otros modelos.

## Requisitos de hardware

- VRAM estimada para los pesos en bf16/fp16: aproximadamente 4,5 GB (2,21 mil millones de parámetros × 2 bytes), más el codificador visual, las activaciones y la caché KV, que no están cuantificados en la documentación.
- VRAM estimada en int8: alrededor de 2,3 GB de pesos; en int4, alrededor de 1,2 GB de pesos. Estas cifras son cálculos derivados del recuento de parámetros, no datos publicados por el autor.
- GPU recomendadas para precisión completa: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB), L40S. Cualquier GPU con 8-12 GB o más debería ser suficiente en la práctica.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes, especialmente con cuantización int8 o int4. No hay confirmación oficial del fabricante sobre estos mínimos.
- Opciones de despliegue: transformers (formato nativo safetensors), vLLM, TGI y servidores compatibles con endpoints de Hugging Face. Para llama.cpp u Ollama sería necesaria una conversión a GGUF no distribuida oficialmente. Existe un endpoint alojado de la variante v1_500 en FriendliAI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han publicado en la información disponible resultados comparativos frente a otros modelos. La tabla siguiente recoge únicamente datos estructurales verificables.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento comparado |
|---|---|---|---|---|---|
| FullGen4K-3Task-GRPO-v1_1000 | 2,21 B | No disponible | Apache 2.0 | HuggingFace (11 descargas, 0 likes) | Ver tabla de benchmarks |
| Qwen/Qwen3.5-2B (modelo base) | No disponible | No disponible | No disponible | HuggingFace | No disponible |
| Qwen2-VL-2B-Instruct | 2,2 B | No disponible | Apache 2.0 | HuggingFace | No disponible |
| SmolVLM2-2.2B-Instruct | 2,25 B | No disponible | Apache 2.0 | HuggingFace | No disponible |

## Limitaciones y advertencias

- El rendimiento en QA es bajo: la recompensa media en desarrollo es 0,228 y la precisión de contenido en la evaluación externa es 0,4166. No es un modelo fiable para QA factual sin verificación humana.
- La selección de evidencia es la tarea más débil tras QA, con una recompensa media de 0,5934 en desarrollo y un recall de región exacta de solo 0,4160 en OCR externo.
- Tasa de truncamiento apreciable: 56 de 580 imágenes en OCR externo, 99 de 1.025 preguntas en QA y 58 imágenes en el detalle de CER. Las finalizaciones truncadas reciben recompensa cero, lo que penaliza la métrica global.
- La evaluación externa de OCR se realizó con la versión 2 de las métricas (2026-09-28) y el autor indica explícitamente que cualquier informe anterior de F1 exacta o suave queda superado por esta evaluación; conviene no mezclar cifras de distintas versiones.
- Los intervalos de confianza publicados para QA corresponden a una única semilla de entrenamiento y excluyen la variabilidad entre semillas, tal como advierte la propia model card.
- Sesgos conocidos: no disponible. No se documenta ningún análisis de sesgo.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es esperable en un modelo de 2,21 B en tareas de QA abierto.
- Idiomas soportados: no declarados. La evidencia disponible apunta a evaluación en japonés (JaWildText), sin garantía de cobertura multilingüe amplia.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución siempre que se conserve el aviso de licencia y se indique los cambios. No se declaran restricciones adicionales.
- Caveat de producción: el autor indica que `1000` es un checkpoint nativo sellado y que no se reclama igualdad en el viaje de ida y vuelta de exportación; si se convierte a otros formatos (GGUF, GPTQ), habrá que revalidar el rendimiento.
- El checkpoint tiene 11 descargas y 0 likes, por lo que la validación por parte de la comunidad es prácticamente inexistente.
- El tamaño del repositorio (8,9 GB) es notablemente superior al de los pesos en bf16 de un modelo de 2,21 B, lo que sugiere artefactos adicionales en el repositorio; conviene revisar la lista de ficheros antes de descargarlo completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Silviase/FullGen4K-3Task-GRPO-v1_1000
- Perfil del autor en HuggingFace (Silviase, Koki Maeda): https://huggingface.co/Silviase
- Perfil del autor en GitHub: https://github.com/Silviase/
- Repositorio de perfil en GitHub: https://github.com/Silviase/Silviase
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/silviase/jasset/runs/fullgen4k-3task-grpo-v1
- Endpoint de la variante v1_500 en FriendliAI: https://friendli.ai/models/Silviase/FullGen4K-3Task-GRPO-v1_500
