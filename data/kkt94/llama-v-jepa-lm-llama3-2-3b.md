# kkt94/Llama-V-JEPA-LM-Llama3.2-3B

## Resumen

Llama-V-JEPA-LM-Llama3.2-3B es un modelo de lenguaje y vídeo desarrollado por el usuario kkt94, que combina un codificador de vídeo congelado basado en V-JEPA 2.1 (ViT-g) con el modelo de lenguaje Llama-3.2-3B-Instruct de Meta. El modelo resuelve el problema de la comprensión temporal de vídeo: en lugar de tratar los fotogramas como imágenes independientes, utiliza un world model que captura la dinámica de la escena (dirección, velocidad, orden, estado) y la proyecta al espacio del lenguaje mediante un puente espectral que convierte cada clip de 32 fotogramas en 1.024 tokens visuales.

La innovación principal reside en el entrenamiento con supervisión contrafactual: se generan variantes de vídeos públicos mediante transformaciones de píxeles cuyas respuestas quedan fijadas por construcción y difieren únicamente en cómo cambia la escena. Así, el modelo de lenguaje aprende a leer la dinámica que el codificador del world model ya transporta, sin necesidad de anotación humana adicional. Se entrenó sobre 4,53 millones de muestras públicas.

Con 4.248.521.728 parámetros totales (según los pesos en safetensors) y un repositorio de 8,5 GB, el modelo se posiciona como una alternativa compacta y eficiente para tareas de vídeo-question answering, superando según el autor a todos los modelos abiertos de su clase de tamaño en el promedio de 12 puntuaciones sobre 11 benchmarks de vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo video-lenguaje: codificador de vídeo V-JEPA 2.1 (ViT-g) congelado + puente espectral + Llama-3.2-3B-Instruct |
| Parametros totales | 4.248.521.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo multimodal de tipo video-text-to-text. Un codificador de vídeo V-JEPA 2.1 (ViT-g) congelado actúa como world model y extrae representaciones de la dinámica visual. Un puente espectral transforma cada clip de 32 fotogramas en 1.024 tokens visuales, independientemente de la resolución de entrada, que se inyectan en el modelo de lenguaje Llama-3.2-3B-Instruct. El modelo requiere código personalizado (`custom_code`) para su carga en transformers.

El entrenamiento emplea supervisión contrafactual: a partir de vídeos públicos se generan transformaciones de píxeles que producen variantes equilibradas en respuestas, fijadas por construcción y que difieren solo en el cambio de escena. De este modo el modelo de lenguaje aprende a interpretar dirección, orden, posición, velocidad, conteo y completitud a partir de la dinámica que porta el codificador. El conjunto de entrenamiento consta de 4,53 millones de muestras públicas. No se dispone de información sobre el uso de RLHF o DPO ni sobre el número total de tokens de texto empleados.

## Capacidades

- Comprensión de vídeo y respuesta a preguntas sobre el contenido (video question answering).
- Razonamiento temporal: dirección, orden, velocidad, posición, conteo y completitud de acciones.
- Procesamiento de clips de 32 fotogramas con 1.024 tokens visuales por clip a cualquier resolución de entrada.
- Generación de texto a partir de entradas de vídeo y texto (salida únicamente textual).
- Capacidades heredadas del modelo base Llama-3.2-3B-Instruct en generación de texto en inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión de imágenes estáticas, audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de vigilancia y seguridad: el modelo puede responder preguntas sobre la secuencia de eventos en un clip de 32 fotogramas, identificando dirección y orden de movimientos, lo que resulta adecuado para revisión de grabaciones con preguntas en lenguaje natural.
- Moderación de contenido en vídeo: gracias a su capacidad de leer dinámica temporal (velocidad, completitud de acciones), puede clasificar clips según el tipo de actividad mostrada y asistir en la revisión automática de material subido a plataformas.
- Descripción y accesibilidad de vídeo: generación de respuestas descriptivas sobre lo que ocurre en un clip para sistemas de subtitulado enriquecido o asistentes de accesibilidad, con un coste de prefill bajo (20 ms por clip en una H100).
- Análisis deportivo automatizado: identificación de dirección de movimiento, orden de acciones y conteo de eventos en secuencias cortas, útil para etiquetado automático de clips deportivos.
- Robótica y sistemas de percepción: el uso de un world model V-JEPA como codificador permite integrar el modelo en pipelines que requieren interpretar dinámica de escena y responder preguntas operativas sobre lo observado.
- Investigación en modelos de mundo: servir como base para experimentos de razonamiento temporal y evaluación de representaciones de dinámica, dado su entrenamiento con supervisión contrafactual y su naturaleza compacta (4,25B parámetros, 8,5 GB).
- Asistentes de análisis de vídeo para educación o formación: responder preguntas sobre procedimientos mostrados en vídeos instructivos, aprovechando la comprensión de orden y completitud de pasos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| MVBench | accuracy | 70,7 |
| PerceptionTest | accuracy | 74,3 |
| TVBench | accuracy | 70,3 |
| TempCompass | accuracy | 76,5 |
| TOMATO | accuracy | 55,9 |
| MotionBench | accuracy | 54,2 |
| NExT-QA | accuracy | 77,0 |
| MVP | pair accuracy | 56,3 |
| TemporalBench (binary) | accuracy | 67,3 |
| SSv2 (multiple choice) | accuracy | 91,3 |
| Vinoground text | text pair accuracy | 71,0 |
| Vinoground video | video pair accuracy | 62,8 |

Promedio declarado de 12 puntuaciones sobre 11 benchmarks: 68,97. Según el autor, supera al mejor modelo abierto de su clase de tamaño (Molmo2-4B, 61,08) y es el mejor en 7 de las 12 puntuaciones. No se han proporcionado resultados de benchmarks de texto (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4,25B parámetros en safetensors el repositorio ocupa 8,5 GB, por lo que la inferencia en precisión nativa requiere al menos ~9-10 GB de VRAM, y en cuantizaciones de 8 o 4 bits cabría en GPUs de 8 GB o menos (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el autor reporta mediciones en una H100 (prefill de un clip en 20 ms, 159 ms hasta el primer token). No se especifican otras GPUs.
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño, sería viable en RTX 4090 (24 GB) y potencialmente en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers con código personalizado (`custom_code`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 6,7 TFLOPs y 20 ms de prefill por clip en una H100; 159 ms hasta el primer token. El autor compara con 18,1-104,4 TFLOPs y 58-218 ms de los modelos abiertos de su clase. Throughput sostenido no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (promedio 12 scores) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Llama3.2-3B | 4,25B | no disponible | 68,97 | Llama 3.2 Community | Hugging Face |
| Molmo2-4B | ~4B | no disponible | 61,08 | no disponible | no disponible |
| Otros modelos abiertos clase 4B | no disponible | no disponible | inferior según el autor | no disponible | no disponible |

El autor cita a Molmo2-4B como el mejor modelo abierto de la clase 4B, con 61,08 de promedio, frente a 68,97 de este modelo. No se dispone de datos detallados de parámetros, contexto ni licencia de Molmo2-4B en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre vídeos públicos, puede heredar sesgos de esos datos.
- Riesgo de alucinación: no evaluado en la información proporcionada; como modelo generativo de lenguaje, es susceptible de producir respuestas no fundamentadas en el vídeo.
- Limitaciones de contexto: la longitud de contexto no está especificada; cada clip se limita a 32 fotogramas y 1.024 tokens visuales, lo que restringe la duración de vídeo analizable por inferencia.
- Idioma: soporte únicamente en inglés según la model card.
- Licencia: sujeta a la Llama 3.2 Community License y a la Llama 3.2 Acceptable Use Policy de Meta; el uso comercial está condicionado por dicha licencia.
- Requiere código personalizado (`custom_code`) para cargarse en transformers, lo que puede complicar el despliegue en entornos estándar.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- No hay información sobre cuantizaciones oficiales ni sobre soporte en frameworks de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Llama3.2-3B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable Llama 3.2: https://www.llama.com/llama3_2/use-policy/
- Dataset MVBench: https://huggingface.co/datasets/OpenGVLab/MVBench
- Dataset PerceptionTest: https://huggingface.co/datasets/lmms-lab/PerceptionTest
- Dataset TVBench: https://huggingface.co/datasets/FunAILab/TVBench
- Dataset TempCompass: https://huggingface.co/datasets/lmms-lab/TempCompass
- Dataset TOMATO: https://huggingface.co/datasets/yale-nlp/TOMATO
- Dataset MotionBench: https://huggingface.co/datasets/zai-org/MotionBench
- Dataset NExT-QA: https://huggingface.co/datasets/lmms-lab/NExTQA
- Dataset MVP: https://huggingface.co/datasets/facebook/minimal_video_pairs
- Dataset TemporalBench: https://huggingface.co/datasets/microsoft/TemporalBench
- Dataset Something-Something v2: https://huggingface.co/datasets/HuggingFaceM4/something_something_v2
- Dataset Vinoground: https://huggingface.co/datasets/HanSolo9682/Vinoground
