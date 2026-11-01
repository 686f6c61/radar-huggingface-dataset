# bf0820/VQ-SAM

## Resumen

VQ-SAM es un checkpoint de segmentación de objetos en vídeo desarrollado por Bing Fan y colaboradores (VAIL-Fan), presentado en el track Datasets & Benchmarks de NeurIPS 2026 con el artículo *Towards Visual Query Segmentation in the Wild*. El modelo aborda una tarea nueva, la segmentación por consulta visual (visual query segmentation, VQS): dado un vídeo sin recortar y una consulta visual compuesta por una imagen y una máscara del objeto objetivo tomadas de fuera de ese vídeo, VQ-SAM segmenta el objeto en todos los fotogramas en los que aparece. Esto difiere de la segmentación guiada por texto o por clics dentro del propio vídeo, y exige generalizar la identidad del objeto a partir de una referencia externa.

El modelo se construye sobre SAM 2.1 con backbone Hiera-B+ y añade un bloque transformer espaciotemporal, una memoria de objetivo y de distractores evolucionada mediante un marco multi-etapa y un módulo de generación adaptativa de memoria (AMG). El checkpoint ocupa 1,0 GB y se distribuye con licencia Apache 2.0, heredada de SAM 2.

Su relevancia radica en que establece el mejor resultado publicado en el benchmark VQS-4K (822 vídeos de test), con un mSTIoU de 26,0 frente a los 18,6 de SAM2Long, el método previo más fuerte. Es un baseline de referencia para una tarea emergente, con código de evaluación reproducible en el repositorio del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 con backbone Hiera-B+, bloque transformer espaciotemporal y memoria de objetivo/distractor con modulo AMG |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clip de 8 fotogramas: 1 de consulta + 7 de vídeo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 (código y pesos); dataset VQS-4K bajo CC BY-NC 4.0, solo investigación |
| Formato de pesos | `.pt` (PyTorch, `vqsam_hiera_bplus.pt`) |

## Arquitectura y entrenamiento

VQ-SAM parte de la inicialización de SAM 2.1 Hiera-B+ y le incorpora un bloque transformer espaciotemporal que propaga la información entre fotogramas. Sobre esa base se añaden dos mecanismos de memoria: una memoria de objetivo (target memory) y una memoria de distractores (distractor memory), evolucionadas a lo largo de un marco de entrenamiento multi-etapa. El módulo de generación adaptativa de memoria (AMG) y una compuerta adaptativa (adaptive gating) controlan qué información se escribe y se lee de la memoria, con ponderación por calidad (quality-weighted RAM). La configuración de referencia es `sam2.1_hiera_b+_DAM_AdaptiveGate_Jan28.yaml`.

El entrenamiento se realizó a resolución 768x768, con clips de 8 fotogramas (1 de consulta más 7 de vídeo), batch size de 1 por GPU y sobre 4 GPU RTX A6000, usando el split de entrenamiento del dataset VQS-4K. No se especifican en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su procedencia. La longitud de segmento en inferencia debe coincidir con la longitud de clip de entrenamiento (8 fotogramas para este checkpoint).

## Capacidades

- Segmentación de objetos en vídeo guiada por una consulta visual externa (imagen más máscara del objetivo).
- Propagación de máscaras a lo largo de fotogramas en vídeos sin recortar.
- Gestión explícita de distractores mediante memoria dedicada, lo que ayuda a discriminar objetos similares.
- Generación de máscaras por fotograma y por secuencia (métricas de IoU temporal y espaciotemporal).
- Procesamiento de clips de 8 fotogramas con ventana de 768x768.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente visual de segmentación.
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Seguimiento de objetos en vídeo de vigilancia: se proporciona una imagen y máscara de referencia de una persona u objeto y VQ-SAM lo localiza en todos los fotogramas donde aparece, útil para analítica de vídeo con objetivos definidos a priori.
- Anotación semiautomática de datasets de vídeo: el modelo pre-segmenta objetos a partir de una consulta visual, reduciendo el coste de etiquetado manual en pipelines de datos para entrenamiento de otros modelos.
- Edición de vídeo y postproducción: aislamiento de un objeto concreto (por ejemplo, un producto o un actor) a lo largo de un plano para rotoscopia o sustitución de fondo, usando una referencia externa del objeto.
- Análisis de material de archivo: localización de un objeto o persona concreto en grabaciones largas sin recortar a partir de una imagen de referencia, por ejemplo en estudios documentales o forenses.
- Robótica y percepción: seguimiento de un objeto designado por el operador mediante una imagen de referencia, aprovechando la memoria de distractores para mantener la identidad en escenas con objetos parecidos.
- Investigación en visión por computador: baseline reproducible para la tarea VQS, con código de evaluación y splits públicos, adecuado para comparar nuevas propuestas sobre VQS-4K.
- Moderación de contenido visual: detección y seguimiento de elementos concretos definidos por una consulta visual en flujos de vídeo, con la salvedad de que el dataset de referencia es solo para investigación.

## Benchmarks y rendimiento

Resultados en el test de VQS-4K (822 vídeos), según la model card:

| Metrica | VQ-SAM | SAM2Long (mejor previo) |
|---|---|---|
| mSTIoU | 26,0 | 18,6 |
| mSTIoU₅₀ | 23,8 | no disponible |
| mSTIoU₇₅ | 12,7 | no disponible |
| mTIoU | 29,6 | no disponible |
| mTIoU₅₀ | 26,8 | no disponible |
| mTIoU₇₅ | 14,4 | no disponible |
| Rec | 43,6 | no disponible |
| Succ | 42,1 | no disponible |
| FPS | 29 | no disponible |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros), ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 1,0 GB y el backbone es Hiera-B+, por lo que se espera un consumo moderado, pero no se confirma cifra.
- GPU recomendadas: el entrenamiento se realizó en 4x RTX A6000; para inferencia se puede usar una GPU de gama profesional o consumer con suficiente memoria, aunque no se especifica el mínimo.
- Cabe en GPU consumer: probablemente sí en tarjetas con 8-16 GB, pero no se confirma en la información disponible.
- Opciones de despliegue: el repositorio oficial (VAIL-Fan/VQS) con el script `tools/test_video_segmentation.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 29 FPS reportados en la evaluación sobre VQS-4K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mSTIoU (VQS-4K) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VQ-SAM | no disponible (Hiera-B+) | clip de 8 fotogramas | 26,0 | Apache 2.0 | HuggingFace + GitHub |
| SAM2Long | no disponible | no disponible | 18,6 | no disponible | no disponible en la información |
| SAM 2.1 | no disponible (Hiera-B+) | clip de 8 fotogramas | no disponible | Apache 2.0 | Meta / HuggingFace |

La comparación se limita a los datos publicados en la model card; no se dispone de cifras de otros métodos sobre VQS-4K en la información proporcionada.

## Limitaciones y advertencias

- El dataset VQS-4K está licenciado bajo CC BY-NC 4.0 (solo investigación); aunque los pesos son Apache 2.0, el uso comercial sobre ese benchmark requiere revisión.
- La tarea es nueva y el mejor resultado absoluto (26,0 mSTIoU) es bajo en términos absolutos, lo que indica margen de error considerable en escenas difíciles.
- Requiere que la consulta visual (imagen y máscara) proceda de fuera del vídeo; no está pensado para consultas de texto ni para clics dentro del vídeo.
- La longitud de segmento en inferencia debe ser de 8 fotogramas para coincidir con el entrenamiento; no se documenta soporte para clips más largos.
- No se dispone de información sobre sesgos, robustez a dominios distintos de VQS-4K ni tasas de alucinación (no aplica el concepto de alucinación textual, pero sí el de falsos positivos de segmentación).
- No se especifican requisitos mínimos de hardware ni opciones de cuantización, lo que dificulta planificar despliegues en producción.
- El modelo tiene muy poca tracción (37 descargas, 0 likes) y fue creado en 2026; la validación independiente es limitada.

## Enlaces

- HuggingFace: https://huggingface.co/bf0820/VQ-SAM
- Paper: https://arxiv.org/pdf/2603.08898
- Código: https://github.com/VAIL-Fan/VQS
- Dataset: https://huggingface.co/datasets/bf0820/VQS-4K
- SAM 2 (base): https://github.com/facebookresearch/sam2
