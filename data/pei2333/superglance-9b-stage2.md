# pei2333/SuperGlance-9B-Stage2

## Resumen

SuperGlance-9B-Stage2 es un modelo multimodal de tipo imagen-texto-a-texto desarrollado por el usuario pei2333, construido a partir de Qwen/Qwen3.5-9B mediante la fusión de dos etapas de adaptadores LoRA. No es un modelo final: se trata de la etapa intermedia número 2 de la familia SuperGlance y sirve como punto de partida para las fases posteriores de entrenamiento (SFT, S1 y RL) que darán lugar al modelo final SuperGlance-9B. Su propósito es el razonamiento visual sobre preguntas de opción múltiple en dominios muy diversos: gráficos, documentos, imágenes naturales, razonamiento espacial y escenas de conducción.

Con 9.653.104.368 parámetros totales (aproximadamente 9,65 mil millones) y un repositorio de 19,3 GB en formato safetensors, el modelo hereda la arquitectura y la ventana de contexto de Qwen3.5-9B. La fusión de los LoRA se realizó con la fórmula W′ = round_bf16(W + 2.0 · B·A), manteniendo el resto de tensores intactos, de modo que se carga exactamente igual que el modelo base mediante `AutoModelForImageTextToText`.

La relevancia de este checkpoint es acotada pero clara: documenta de forma transparente el proceso de entrenamiento por etapas de SuperGlance, con recetas de datos explícitas (1,24 millones de preguntas en la etapa 2) y un dataset público asociado (SuperGlance-QA). No obstante, el repositorio es privado y los términos de licencia están pendientes de decisión, lo que impide su uso comercial o de producción sin autorización explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto-a-texto), heredada de Qwen3.5-9B; tipo `qwen3_5` |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | No disponible |
| Licencia | `other` / `superglance-pending` (términos de publicación sin decidir; el modelo base Qwen3.5-9B es Apache-2.0) |
| Formato de pesos | safetensors (repo de 19,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal de aproximadamente 9,65 mil millones de parámetros que procesa entradas de imagen y texto y genera texto. Sobre esta base se han fusionado dos etapas de adaptadores LoRA directamente en los pesos, mediante la operación W′ = round_bf16(W + 2.0 · B·A), sin modificar ningún otro tensor. El factor de escala 2.0 aplicado a cada fusión es un detalle relevante para reproducir el entrenamiento, ya que no se trata de una fusión LoRA estándar con alpha/r.

La etapa 1 se entrenó sobre 1.158.150 preguntas de opción múltiple procedentes de SAT, GQA, TallyQA, ChartQA, AI2D, TextVQA, OpenImages (selección de cajas) y SpatialSense, además de 13 datasets de QA textual. Cada pregunta se presentó en ambos órdenes de opciones, con 500.000 muestras. La etapa 2 amplía el conjunto con 124.378 preguntas de DriveLM-nuScenes, alcanzando 1.240.040 preguntas y 192.000 muestras. El formato de las preguntas y el código de entrenamiento están publicados en el dataset SuperGlance-QA y en la release de código de SuperGlance respectivamente. No se documentan detalles sobre RLHF, DPO ni innovaciones de decodificación en la información disponible.

## Capacidades

- Generación de texto y razonamiento visual a partir de pares imagen-texto (pipeline `image-text-to-text`).
- Respuesta a preguntas de opción múltiple sobre imágenes naturales (GQA, TextVQA, TallyQA).
- Comprensión de gráficos y diagramas (ChartQA, AI2D).
- Razonamiento espacial y selección de regiones/cajas en imágenes (SpatialSense, OpenImages box choice).
- Comprensión de escenas de conducción y razonamiento sobre trayectorias (DriveLM-nuScenes).
- QA textual puro, gracias a los 13 datasets de texto incluidos en la etapa 1.
- Conversación multi-turno (tag `conversational`) y compatibilidad con endpoints de inferencia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de investigación en razonamiento visual de opción múltiple: el modelo sirve como checkpoint intermedio para estudiar el efecto de cada etapa de entrenamiento (etapa 1 frente a etapa 2) sobre el rendimiento en GQA, ChartQA o AI2D, comparando directamente con el modelo base Qwen3.5-9B.
- Réplica de recetas de entrenamiento multimodal: al estar publicados el dataset SuperGlance-QA y el código, un equipo de investigación puede reproducir las fusiones LoRA con el factor 2.0 y validar la metodología de entrenamiento por etapas.
- Análisis de documentos y gráficos en prototipos internos: el modelo puede responder preguntas sobre gráficos de barras o diagramas científicos (ChartQA, AI2D), útil para asistentes de análisis de informes en fase de prueba.
- Razonamiento espacial en imágenes: tareas de localización y selección de regiones (OpenImages box choice, SpatialSense) para prototipos de anotación asistida o verificación de bounding boxes.
- Investigación en conducción autónoma: el entrenamiento con DriveLM-nuScenes permite experimentar con preguntas sobre escenas de tráfico, trayectorias y objetos, como banco de pruebas para modelos de percepción razonada.
- Base para fine-tuning posterior: al ser el punto de partida de las fases SFT, S1 y RL, es el checkpoint adecuado para equipos que quieran continuar el pipeline de SuperGlance con sus propios datos, siempre que se resuelvan los términos de licencia.
- Comparación de metodologías de fusión LoRA: permite estudiar empíricamente el impacto del escalado 2.0 en la fusión frente a aproximaciones estándar, en entornos de investigación controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y del codificador visual; en la práctica se recomienda un mínimo de 24 GB.
- VRAM estimada con cuantización de 8 bits: alrededor de 10-11 GB para pesos, más overhead; con 4 bits, alrededor de 5-6 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para bf16 sin compromisos; RTX 4090 (24 GB) para bf16 ajustado o cuantización de 8 bits.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) en bf16 con cuidado en la longitud de contexto; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantización.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` (soporte nativo declarado); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SuperGlance-9B-Stage2 | 9,65 B | No disponible | Imagen-texto-a-texto | `superglance-pending` (pendiente) | Repo privado, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | ~9,65 B | No disponible | Imagen-texto-a-texto | Apache-2.0 | Público en Hugging Face |
| SuperGlance-9B (modelo final) | No disponible | No disponible | Imagen-texto-a-texto | No disponible | No disponible en la información proporcionada |

La comparación más directa es con Qwen3.5-9B: SuperGlance-9B-Stage2 añade dos etapas de ajuste LoRA orientadas a QA visual de opción múltiple, pero mantiene el mismo tamaño y, presumiblemente, la misma arquitectura y contexto. Frente al modelo final SuperGlance-9B, este checkpoint es una etapa intermedia sin las fases SFT, S1 y RL. No se dispone de datos de rendimiento comparativo para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Licencia pendiente: el identificador `superglance-pending` indica que los términos de publicación no están decididos; no se autoriza explícitamente el uso comercial.
- El repositorio es privado; el acceso y la redistribución pueden estar restringidos.
- Los datos de entrenamiento incluyen DriveLM-nuScenes, sujeto a CC BY-NC-SA 4.0 y a los términos de uso de nuScenes, lo que impone restricciones no comerciales sobre parte del entrenamiento.
- Es un checkpoint intermedio, no el modelo final: no ha pasado por las fases SFT, S1 ni RL, por lo que su calidad conversacional y de instrucciones puede ser inferior a la de SuperGlance-9B.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no se documentan evaluaciones de fidelidad.
- Idiomas soportados no documentados: no se garantiza un rendimiento adecuado en castellano u otras lenguas distintas del inglés de los datasets de entrenamiento.
- Longitud de contexto no documentada; no se debe asumir la del modelo base sin verificación.
- Sesgos conocidos: no documentados, pero heredables de los datasets de origen (GQA, TextVQA, ChartQA, nuScenes, etc.).
- Sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia externa de calidad ni de estabilidad en producción.
- Formato de pesos únicamente safetensors en bf16; no hay GGUF ni cuantizaciones oficiales para despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pei2333/SuperGlance-9B-Stage2
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset SuperGlance-QA: no disponible (referenciado en la model card sin URL directa)
- Código de entrenamiento SuperGlance: no disponible (referenciado en la model card sin URL directa)
- Paper: no disponible
- Blog o demo: no disponible
