# kkt94/Llama-V-JEPA-LM-Llama3.1-8B

## Resumen

Llama-V-JEPA-LM-Llama3.1-8B es un modelo de lenguaje y vídeo desarrollado por el usuario kkt94 (autor independiente) que combina un codificador de vídeo V-JEPA 2.1 (ViT-g) con el modelo de lenguaje Llama-3.1-8B-Instruct de Meta. El modelo resuelve la tarea de respuesta a preguntas sobre vídeo (video question answering), un campo donde los modelos abiertos de clase 8B suelen quedarse atrás frente a alternativas cerradas. Su propuesta diferencial es el uso de un "puente espectral" que convierte cada clip de 32 fotogramas en 1.024 tokens visuales, junto con un entrenamiento basado en supervisión contrafactual.

El modelo se entrena sobre 4,53 millones de muestras públicas y alcanza una media de 70,51 en 12 métricas repartidas en 11 benchmarks de vídeo, superando a todos los modelos abiertos de su clase de tamaño (el mejor competidor abierto de 8B, PLM-8B, obtiene 64,79). Es relevante porque demuestra que un codificador de mundo (world model) congelado puede transferirse eficazmente a un LLM mediante un adaptador ligero, sin necesidad de reentrenar el codificador visual.

La arquitectura subyacente es un transformer multimodal (codificador ViT-g + LLM Llama 3.1 de 8B), con 9.068.286.976 parámetros totales y licencia Llama 3.1. El modelo está orientado principalmente al inglés y su pipeline es video-text-to-text.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: codificador de vídeo V-JEPA 2.1 (ViT-g) congelado + puente espectral + Llama-3.1-8B-Instruct |
| Parámetros totales | 9.068.286.976 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo une un codificador de vídeo V-JEPA 2.1 (ViT-g) congelado, que actúa como modelo de mundo, con el LLM Llama-3.1-8B-Instruct a través de un puente espectral. Este puente transforma cada clip de 32 fotogramas en 1.024 tokens visuales, que el LLM procesa junto con el texto de la pregunta. El codificador visual no se reentrena; solo se entrena el adaptador que conecta ambos componentes.

El entrenamiento se basa en supervisión contrafactual: se aplican transformaciones a nivel de píxel sobre vídeos públicos para generar variantes equilibradas en cuanto a respuestas, cuyas respuestas quedan fijadas por construcción y difieren únicamente en cómo cambia la escena. De este modo, el LLM aprende a leer la dinámica (dirección, velocidad, orden, estado) que el codificador de mundo codifica. El conjunto de entrenamiento consta de 4,53 millones de muestras públicas e incluye el split FGQA de PLM-Video-Human, un output de Llama 3.2. No se especifican en la información disponible detalles sobre el uso de RLHF o DPO.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en modo video-text-to-text.
- Razonamiento sobre dinámica temporal: dirección, velocidad, orden de eventos y cambios de estado en la escena.
- Comprensión de relaciones temporales y de pares de vídeos (evaluado en Vinoground y MVP).
- Procesamiento de clips de 32 fotogramas convertidos en 1.024 tokens visuales.
- Capacidades de extracción de características (tag feature-extraction).
- Modelo de mundo basado en V-JEPA para representaciones de dinámica visual.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, visión, audio): visión sobre vídeo; no se documentan otras.

## Casos de uso

- Análisis de vigilancia y seguridad: el modelo puede responder preguntas sobre la secuencia de eventos en grabaciones de 32 fotogramas, aprovechando su entrenamiento en dinámica temporal (dirección, orden, estado) para describir qué ocurrió y en qué orden.
- Moderación de contenido en vídeo: clasificación y descripción de escenas para detectar comportamientos o situaciones, apoyándose en su rendimiento en benchmarks de percepción (PerceptionTest 75,0) y de pares de vídeo (Vinoground video 63,0).
- Indexación y búsqueda semántica de vídeo: generación de descripciones y respuestas sobre clips para enriquecer metadatos y permitir búsquedas por contenido dinámico, gracias a la representación compacta de 1.024 tokens por clip.
- Asistencia a personas con discapacidad visual: descripción verbal de lo que ocurre en un vídeo, incluyendo cambios de estado y movimiento, usando el pipeline video-text-to-text.
- Análisis deportivo: respuesta a preguntas sobre acciones, trayectorias y orden de jugadas en clips cortos, aprovechando la sensibilidad al movimiento evaluada en SSv2 (92,3 en elección múltiple).
- Investigación en modelos de mundo: uso del codificador V-JEPA congelado y del puente espectral como base para experimentos de transferencia entre representaciones visuales y LLM, dado que el modelo está pensado como feature-extraction y world-model.
- Evaluación de razonamiento temporal: banco de pruebas para medir comprensión de orden y causalidad en vídeo (TempCompass 77,6, TemporalBench 72,3), útil en laboratorios de investigación multimodal.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
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

Media declarada: 70,51 en 12 métricas sobre 11 benchmarks. El autor indica que supera a PLM-8B (64,79) y que es el mejor modelo abierto de clase 8B en 8 de las 12 métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 9.068 millones de parámetros, en FP16 se requieren aproximadamente 18 GB solo para los pesos, más el codificador V-JEPA y las activaciones.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar A100/H100 para FP16 sin cuantizar, pero no se confirma.
- ¿Cabe en GPU de consumo? No confirmado. En FP16 no cabría en GPUs de 16 GB; con cuantización a 8 bits o 4 bits podría ser viable en GPUs de 24 GB, pero no se documentan tipos de cuantización.
- Opciones de despliegue: transformers (librería declarada, con custom_code). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Existe una demo en ZeroGPU en Hugging Face Spaces, lo que sugiere despliegue en infraestructura compartida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media 12 métricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Llama3.1-8B | 9,07B | no disponible | 70,51 | llama3.1 | Hugging Face |
| PLM-8B | no disponible | no disponible | 64,79 | no disponible | no disponible |

El autor solo proporciona comparación directa con PLM-8B. No se dispone de datos de otros modelos comparables (contexto, licencia o disponibilidad) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse con vídeos públicos, puede heredar sesgos de ese corpus.
- Riesgo de alucinación: no evaluado explícitamente; como LLM generativo, es susceptible de producir respuestas incorrectas sobre el contenido del vídeo.
- Limitaciones de idioma: solo inglés; no se garantiza rendimiento en castellano ni otros idiomas.
- Limitaciones de contexto: la longitud de contexto no está documentada; cada clip se limita a 32 fotogramas y 1.024 tokens visuales, lo que restringe la duración de vídeo analizable por consulta.
- Restricciones de licencia: sujeto a la Llama 3.1 Community License y a la Llama 3.1 Acceptable Use Policy. Los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human (output de Llama 3.2), por lo que esa componente queda sujeta a la Llama 3.2 Community License, que exige que los modelos entrenados con ella lleven el prefijo "Llama". El uso comercial está permitido bajo los términos de dichas licencias, con las restricciones de la política de uso aceptable.
- Caveat para producción: los benchmarks son declarados por el autor y no están verificados de forma independiente; conviene validar en el dominio concreto antes de desplegar.
- Requiere custom_code en transformers, lo que puede complicar la integración con otros frameworks de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Llama3.1-8B
- Paper: https://arxiv.org/abs/2611.17831
- Código y technical report: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en vivo (ZeroGPU): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Política de uso aceptable Llama 3.1: https://www.llama.com/llama3_1/use-policy/
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
