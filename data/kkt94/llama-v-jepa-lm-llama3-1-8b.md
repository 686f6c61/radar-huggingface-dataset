# kkt94/Llama-V-JEPA-LM-Llama3.1-8B

## Resumen

Llama-V-JEPA-LM-Llama3.1-8B es un modelo de video-lenguaje desarrollado por el autor kkt94 (familia Llama-V-JEPA-LM) que combina un codificador de video congelado V-JEPA 2.1 (ViT-g) con el modelo de lenguaje Llama-3.1-8B-Instruct de Meta. El modelo resuelve el problema de la comprensión de video en tareas de pregunta-respuesta (video question answering), conectando un world-model visual con un LLM mediante un "spectral bridge" que convierte cada clip de 32 fotogramas en 1.024 tokens visuales.

La innovación principal es el entrenamiento con supervisión contrafactual: transformaciones de píxeles sobre vídeos públicos generan variantes con respuestas equilibradas fijadas por construcción, de modo que el modelo aprende a leer la dinámica de la escena (dirección, velocidad, orden, estado) que el codificador world-model transporta. El modelo se entrenó sobre 4,53 millones de muestras públicas.

Con 9.068.286.976 parámetros totales y un repositorio de 18,2 GB, el modelo está pensado para extracción de características y respuesta a preguntas sobre vídeo. Según el autor, alcanza una media de 70,51 en 12 puntuaciones sobre 11 benchmarks de vídeo, por delante de todos los modelos abiertos de su clase de tamaño (el mejor modelo abierto de la clase 8B sería PLM-8B, con 64,79).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador de video V-JEPA 2.1 (ViT-g, congelado) + spectral bridge + Llama-3.1-8B-Instruct |
| Parametros totales | 9.068.286.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un sistema multimodal que acopla un codificador de vídeo V-JEPA 2.1 (ViT-g) congelado, un "spectral bridge" y el LLM Llama-3.1-8B-Instruct. Cada clip de 32 fotogramas se transforma en 1.024 tokens visuales mediante el bridge espectral, que actúa como interfaz entre el espacio latente del world-model y el espacio de tokens del LLM.

El entrenamiento se basa en supervisión contrafactual: se aplican transformaciones de píxeles a vídeos públicos para generar variantes con respuestas equilibradas, fijadas por construcción y que difieren únicamente en cómo cambia la escena. Así el LLM aprende a interpretar la dinámica (dirección, velocidad, orden, estado) codificada por el encoder. El conjunto de entrenamiento suma 4,53 millones de muestras públicas e incluye el split FGQA de PLM-Video-Human (salida de Llama 3.2). No se detalla en la información disponible el uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en modo video-text-to-text.
- Comprensión de movimiento y cambio temporal: dirección, orden, posición, velocidad, conteo y finalización de acciones.
- Extracción de características (feature-extraction) sobre vídeo.
- Razonamiento sobre dinámica de escena gracias al world-model encoder V-JEPA.
- Capacidades de lenguaje heredadas de Llama-3.1-8B-Instruct (generación de texto y seguimiento de instrucciones), si bien la model card no las detalla explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: uso de un world-model de vídeo congelado y supervisión contrafactual para aprender dinámica sin anotación humana adicional.

## Casos de uso

- Análisis de vigilancia y seguridad: el modelo puede responder preguntas sobre secuencias de vídeo para detectar dirección y orden de eventos, aprovechando su capacidad de leer movimiento y cambio temporal.
- Moderación de contenido en vídeo: clasificación y descripción de escenas en plataformas de vídeo mediante preguntas guiadas sobre lo que ocurre en el clip.
- Indexado y búsqueda semántica de vídeo: generación de descripciones y respuestas que permiten etiquetar clips de 32 fotogramas con 1.024 tokens visuales para su recuperación posterior.
- Análisis deportivo automatizado: preguntas sobre trayectorias, velocidad y orden de acciones en clips deportivos, gracias al entrenamiento en dirección, velocidad y conteo.
- Robótica y planificación con world models: extracción de representaciones de dinámica de escena que pueden alimentar pipelines de percepción y planificación.
- Asistentes de accesibilidad: descripción y respuesta a preguntas sobre contenido de vídeo para usuarios con discapacidad visual.
- Evaluación de contenido educativo: preguntas automáticas sobre procesos y secuencias mostradas en vídeos instructivos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en tareas de video question answering:

| Benchmark | Metrica | Valor |
|---|---|---|
| MVBench | accuracy | 71,9 |
| PerceptionTest | accuracy | 75,0 |
| TVBench | accuracy | 71,8 |
| TempCompass | accuracy | 77,6 |
| TOMATO | accuracy | 55,5 |
| MotionBench | accuracy | 55,9 |
| NExT-QA | accuracy | 79,0 |
| MVP | pair accuracy | 57,6 |
| TemporalBench (binary) | accuracy | 72,3 |
| SSv2 (multiple choice) | accuracy | 92,3 |
| Vinoground text | text pair accuracy | 74,2 |
| Vinoground video | video pair accuracy | 63,0 |

Media declarada: 70,51 en 12 puntuaciones sobre 11 benchmarks. El autor compara con PLM-8B (64,79) y señala mejor resultado en 8 de las 12 puntuaciones, con diferencias como SSv2 92,3 frente a 67,9, Vinoground video 63,0 frente a 44,8, TOMATO 55,5 frente a 42,6 y Vinoground text 74,2 frente a 63,4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 9.068 millones de parámetros, en fp16 requeriría aproximadamente 18 GB solo para pesos, más el codificador V-JEPA y las activaciones.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, GPUs de 24 GB o más (A100, H100, RTX 4090) serían necesarias para fp16.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) con cuantización, aunque no hay datos oficiales; en fp16 el margen es ajustado.
- Opciones de despliegue: transformers (librería declarada) con custom_code; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media 12 scores) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Llama3.1-8B | 9.068 M | no disponible | 70,51 | llama3.1 | Hugging Face |
| PLM-8B | no disponible | no disponible | 64,79 | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con un tercer modelo de la misma categoría.

## Limitaciones y advertencias

- Entrenado y evaluado principalmente en inglés; el soporte multilingüe es limitado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en preguntas sobre detalles finos del vídeo.
- Los benchmarks son declarados por el autor y no están verificados (verified: false).
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y obligaciones de atribución; además, parte de los datos de entrenamiento (FGQA de PLM-Video-Human, salida de Llama 3.2) está sujeta a la Llama 3.2 Community License, que exige el prefijo "Llama" en modelos derivados.
- El codificador V-JEPA 2.1 está congelado, lo que limita la adaptación fina de la representación visual.
- Requiere código personalizado (custom_code) para su carga en transformers, lo que puede complicar el despliegue en producción.
- No se detallan sesgos conocidos ni la longitud de contexto soportada.

## Enlaces

- Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Llama3.1-8B
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Política de uso aceptable Llama 3.1: https://www.llama.com/llama3_1/use-policy/
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
