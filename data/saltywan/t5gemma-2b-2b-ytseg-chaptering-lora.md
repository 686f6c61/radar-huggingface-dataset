# Saltywan/t5gemma-2b-2b-ytseg-chaptering-lora

## Resumen

El modelo `Saltywan/t5gemma-2b-2b-ytseg-chaptering-lora` es un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `google/t5gemma-2b-2b-ul2-it`, un transformer encoder-decoder de la familia T5Gemma desarrollada por Google. El adaptador está especializado en una tarea muy concreta: la segmentación de transcripciones de YouTube en capítulos con títulos, devolviendo un JSON estricto con los índices de frase donde empieza cada capítulo y un título descriptivo. Forma parte del proyecto de código abierto [llm-video-chaptering](https://github.com/Saltywan/llm-video-chaptering), que compara cuatro backbones abiertos en la tarea de chaptering.

El modelo resuelve el problema de dividir automáticamente transcripciones largas en secciones temáticas coherentes, algo relevante para plataformas de vídeo, herramientas de accesibilidad y sistemas de búsqueda dentro de vídeos. El adaptador tiene un tamaño de repositorio de 0,1 GB (los pesos LoRA son de 73 MB) y se distribuye bajo licencia Gemma, lo que implica restricciones de uso comercial y la aceptación de los términos de Google. El modelo base tiene 2B parámetros en el encoder y 2B en el decoder, con una ventana de contexto que el adaptador aprovecha hasta unos 8.192 tokens de entrada.

La relevancia actual del modelo radica en su rendimiento comparativamente alto frente a su coste: con un entrenamiento de solo 29 minutos en una NVIDIA B200 y una pasada sobre 1.000 vídeos, consigue un salto de F1 exacto de 0,149 a 0,500 respecto al modelo base zero-shot, superando incluso al mejor resultado publicado en sentence-level segmentation (MiniSeg, F1 45,81 micro) aunque sin generar títulos. Es un ejemplo de cómo un adaptador pequeño y barato puede especializar un modelo generalista para una tarea de producción concreta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre T5Gemma (transformer encoder-decoder, base `google/t5gemma-2b-2b-ul2-it`) |
| Parámetros totales | 2B en encoder + 2B en decoder (modelo base); adaptador LoRA de 73 MB |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ~8.192 tokens de entrada por ventana; transcripciones mayores se dividen en ventanas solapadas |
| Tipos de cuantización | no disponible (el adaptador se entrenó y evaluó en bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/t5gemma-2b-2b-ul2-it`, un modelo encoder-decoder de la familia T5Gemma con 2B parámetros en cada torre. La adaptación LoRA utiliza rango 16, alpha 32 y dropout 0,05, aplicada a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` del encoder, del decoder y de la atención cruzada. El resultado son 73 MB de pesos adaptadores que se cargan con `PeftModel.from_pretrained` sobre el modelo base en bf16.

El entrenamiento se realizó sobre 1.000 vídeos del split de entrenamiento de YTSeg, generando 1.306 ventanas de como máximo 8.192 tokens de entrada con 16 frases de contexto a cada lado. El split se deduplicó y se eliminaron los vídeos que aparecían en validación; esta se usó solo para selección y el test se evaluó una única vez. El objetivo es el JSON de capítulos dorado de cada ventana, con los títulos que la ventana no puede ver completamente sustituidos por un placeholder y enmascarados en la pérdida. Se usó AdamW con learning rate 2e-4, decaimiento coseno, 10 pasos de warmup, acumulación de gradiente 8, clipping 1,0, una época, bf16 y semilla 393. El entrenamiento completo tomó 29 minutos en una NVIDIA B200 con un pico de 21,3 GiB asignados. La inferencia es greedy decoding con topes de salida de 384, 1.536 y 4.096 tokens según el caso.

## Capacidades

- Segmentación de transcripciones de YouTube en capítulos con títulos, devolviendo JSON estricto con `{"chapters": [{"start": <índice de frase>, "title": "<título>"}]}`.
- Generación de títulos de capítulo en inglés, evaluada con ROUGE-L y BERTScore.
- Procesamiento de transcripciones largas mediante ventanas solapadas de hasta ~8.192 tokens y stitching posterior de las predicciones.
- Manejo de contexto de 16 frases a cada lado de la ventana para mejorar la coherencia de las fronteras.
- Salida estructurada con parser estricto (solo 4 de 1.448 vídeos fallaron el parsing estricto en test).
- Capacidad de generación de texto heredada del modelo base T5Gemma, aunque el adaptador está especializado en la tarea de chaptering.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking de forma nativa en este adaptador.

## Casos de uso

- **Chaptering automático de vídeos en plataformas de contenido**: el adaptador recibe la transcripción dividida en frases numeradas y devuelve un JSON de capítulos con títulos, listo para insertar en la interfaz de un reproductor o en la descripción del vídeo. Es adecuado porque la salida es estricta y parseable, con solo 4 fallos de parsing en 1.448 vídeos.
- **Generación de descripciones y metadatos para SEO**: los títulos de capítulo generados (ROUGE-L 0,377, BERTScore 0,651) pueden alimentar índices de búsqueda, sitemaps o descripciones enriquecidas de vídeos, mejorando la discoverability del contenido.
- **Herramientas de accesibilidad y navegación**: dividir transcripciones en secciones temáticas permite a usuarios con discapacidad auditiva o cognitiva navegar por el contenido de forma no lineal, saltando a la sección de interés mediante los índices de frase devueltos.
- **Resumen y análisis de contenido educativo o técnico**: en vídeos largos (tutoriales, charlas, cursos), el modelo identifica los bloques temáticos y sus títulos, lo que sirve como base para resúmenes jerárquicos o para la generación de apuntes automáticos.
- **Pipelines de moderación y clasificación de contenido**: los títulos y fronteras de capítulo permiten segmentar el vídeo en unidades semánticas que luego pueden clasificarse o revisarse por separado, reduciendo el coste de revisión manual.
- **Integración en herramientas de edición y postproducción**: editores de vídeo pueden usar los capítulos generados para marcar cortes preliminares, generar marcadores en la timeline o crear clips automáticos a partir de las fronteras detectadas.
- **Investigación en segmentación de texto**: el adaptador y su evaluación reproducible sobre YTSeg sirven como baseline para experimentos de text segmentation y chaptering con modelos encoder-decoder, con métricas detalladas (Pk, WindowDiff, Boundary Similarity) publicadas.

## Benchmarks y rendimiento

Resultados en el split de test de YTSeg (1.448 vídeos, configuración congelada, una sola ejecución):

| Métrica | Base zero-shot | Este adaptador |
|---|---|---|
| Boundary F1, frase exacta (macro por vídeo) | 0,149 | 0,500 |
| Boundary F1, exacto (micro, todas las fronteras) | — | 51,99 |
| Boundary F1, ±2 frases | 0,233 | 0,679 |
| Pk (↓) | 0,584 | 0,229 |
| WindowDiff (↓) | 0,611 | 0,251 |
| Boundary Similarity | 0,137 | 0,476 |
| Title ROUGE-L (end-to-end) | 0,172 | 0,377 |
| Title BERTScore (span-matched) | 0,201 | 0,651 |
| Vídeos con fallo de parsing JSON estricto | 477 | 4 |

La diferencia LoRA − zero-shot en F1 exacto es +0,352 [+0,335, +0,368] con IC bootstrap pareado al 95%. En validación (200 vídeos), el F1 exacto pasa de 0,191 a 0,512. Como referencia, el mejor resultado publicado a nivel de frase en este split es MiniSeg (Retkowski & Waibel, 2024) con F1 45,81 (micro), aunque ese modelo es un segmentador dedicado que no genera títulos y los detalles de promediado pueden diferir, por lo que la comparación es indicativa.

## Requisitos de hardware

- **VRAM estimada para inferencia**: ~13 GiB en bf16 para una ventana de hasta 8k tokens (dato del autor).
- **GPU recomendadas**: NVIDIA B200 (usada para entrenamiento y evaluación), A100, H100. Cabe en GPUs consumer de gama alta con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB) para una ventana de 8k tokens en bf16.
- **Entrenamiento**: 29 minutos en una B200 con pico de 21,3 GiB asignados; una sola época sobre 1.000 vídeos.
- **Inferencia por lotes**: 30 minutos en una B200 para los 1.448 vídeos del test.
- **Opciones de despliegue**: transformers + PEFT (el ejemplo oficial usa `AutoModelForSeq2SeqLM`, `PeftModel` y `generate` con `attn_implementation="eager"`); no se mencionan integraciones con vLLM, llama.cpp u Ollama en la información disponible.
- **Latencia y throughput**: no se publican cifras por ventana individual; solo el tiempo agregado de la evaluación por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 exacto (micro) en YTSeg test | Genera títulos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este adaptador (T5Gemma 2B-2B + LoRA) | 2B + 2B (base) + 73 MB LoRA | ~8.192 tokens por ventana | 51,99 | Sí | Gemma | Hugging Face |
| Base zero-shot `google/t5gemma-2b-2b-ul2-it` | 2B + 2B | ~8.192 tokens | 0,149 (macro) | Sí (limitado) | Gemma | Hugging Face |
| MiniSeg (Retkowski & Waibel, 2024) | no disponible | no disponible | 45,81 | No | no disponible | no disponible |

La comparación con MiniSeg es indicativa porque los detalles de promediado de ambas evaluaciones pueden diferir. El adaptador supera al base zero-shot de forma clara en todas las métricas y supera el mejor resultado publicado a nivel de frase, además de generar títulos, algo que MiniSeg no hace.

## Limitaciones y advertencias

- **Solo inglés**: el adaptador está entrenado y evaluado únicamente en inglés; no se garantiza su comportamiento en otros idiomas.
- **Solo texto de transcripción**: no ve audio ni vídeo; depende de la calidad y el formato de la transcripción de entrada.
- **Vídeos largos**: el F1 exacto cae en vídeos que abarcan 2 o más ventanas, por lo que la calidad se degrada en contenido muy largo.
- **Dependencia del split de frases**: los inicios de capítulo son índices de frase, así que la transcripción debe dividirse en frases exactamente igual que en inferencia; un split distinto produce desalineación.
- **Escala piloto**: una sola pasada sobre 1.000 vídeos, sin búsqueda de hiperparámetros; los autores lo describen como adaptadores a escala piloto.
- **Licencia Gemma**: el adaptador es un Model Derivative de T5Gemma y está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy; el uso comercial requiere cumplir esos términos.
- **Dataset de entrenamiento con licencia CC BY-NC-SA**: YTSeg tiene licencia CC BY-NC-SA, lo que puede imponer restricciones adicionales al uso del adaptador en contextos comerciales.
- **Riesgo de alucinación**: como modelo generativo, puede producir títulos o fronteras incorrectas; la evaluación muestra 4 vídeos con fallo de parsing estricto en test, que puntúan 0 en las métricas.
- **Sin soporte de tool calling ni agentes**: no está diseñado para flujos agénticos ni para llamadas a funciones.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Saltywan/t5gemma-2b-2b-ytseg-chaptering-lora)
- [Modelo base google/t5gemma-2b-2b-ul2-it](https://huggingface.co/google/t5gemma-2b-2b-ul2-it)
- [Repositorio GitHub llm-video-chaptering](https://github.com/Saltywan/llm-video-chaptering)
- [Dataset YTSeg](https://huggingface.co/datasets/retkowski/ytseg)
- [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
- [Gemma Prohibited Use Policy](https://ai.google.dev/gemma/prohibited_use_policy)
