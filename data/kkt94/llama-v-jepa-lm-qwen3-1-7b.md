# kkt94/Llama-V-JEPA-LM-Qwen3-1.7B

## Resumen

Llama-V-JEPA-LM-Qwen3-1.7B es un modelo de lenguaje y vídeo desarrollado por el usuario kkt94, que combina un codificador visual congelado V-JEPA 2.1 (ViT-L, un modelo del mundo) con el modelo de lenguaje Qwen3-1.7B mediante un puente espectral. El resultado es un sistema multimodal que acepta vídeo y texto y produce texto, orientado a tareas de pregunta-respuesta sobre vídeo (video question answering) y a la comprensión de dinámicas temporales y de movimiento.

El modelo aborda el problema de dotar a un LLM compacto de capacidad para interpretar el movimiento, el orden, la dirección, la velocidad y los cambios de estado en secuencias de vídeo, sin necesidad de anotación humana adicional. Para ello emplea supervisión contrafactual: transformaciones a nivel de píxel sobre vídeos públicos generan variantes con respuestas equilibradas y fijadas por construcción. Se entrenó sobre 4,60 millones de muestras públicas.

Con 2.032.915.456 parámetros totales y licencia Apache-2.0, es relevante ahora por su eficiencia (1.024 tokens visuales por clip de 32 fotogramas, independientemente de la resolución) y por sus resultados declarados, que superan a modelos abiertos de su clase en la mayoría de benchmarks de vídeo. El prefijo "Llama" del nombre proviene de que los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, cuya licencia exige ese prefijo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje y vídeo: codificador visual V-JEPA 2.1 (ViT-L, congelado) + LLM Qwen3-1.7B + puente espectral |
| Parametros totales | 2.032.915.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura une un codificador de vídeo V-JEPA 2.1 (ViT-L) congelado, que actúa como modelo del mundo, con el modelo de lenguaje Qwen3-1.7B, que se ajusta completamente (1,72 B de parámetros). La conexión se realiza mediante un puente espectral que transforma cada clip de 32 fotogramas en 1.024 tokens visuales, con independencia de la resolución de entrada. Esto mantiene bajo el coste de prefill del LLM: 3,3 TFLOPs por clip en una H100, frente a 7,0–40,5 TFLOPs de los modelos abiertos de su clase.

El entrenamiento emplea supervisión contrafactual: transformaciones de píxel sobre vídeos públicos generan variantes con respuestas equilibradas, fijadas por construcción, que difieren únicamente en cómo cambia la escena. Así el modelo aprende a leer dinámicas (dirección, velocidad, orden, estado) a partir de lo que codifica el modelo del mundo. Se entrenó sobre 4,60 millones de muestras públicas. No se especifican en la información disponible detalles sobre RLHF/DPO ni sobre la composición exacta del dataset más allá de la mención al split FGQA de PLM-Video-Human.

## Capacidades

- Generación de texto a partir de vídeo y texto (video-text-to-text).
- Pregunta-respuesta sobre vídeo (video question answering).
- Comprensión de movimiento y cambio temporal: dirección, orden, posición, velocidad, conteo y finalización de acciones.
- Extracción de características (feature-extraction) y etiquetado como modelo del mundo (world-model).
- Capacidades multimodales de vídeo e idioma.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: uso de un codificador V-JEPA 2.1 congelado y supervisión contrafactual para lectura de dinámicas.

## Casos de uso

- Pregunta-respuesta sobre vídeo en inglés: el modelo responde a preguntas sobre el contenido y la evolución temporal de clips de 32 fotogramas, adecuado por su entrenamiento específico en video QA y sus resultados en MVBench, PerceptionTest y NExT-QA.
- Análisis de movimiento y dinámica de escenas: permite determinar dirección, velocidad, orden de acciones y cambios de estado, gracias a la supervisión contrafactual que entrena la lectura de dinámicas.
- Indexación y descripción de archivos de vídeo: al convertir cada clip en 1.024 tokens visuales a cualquier resolución, se puede procesar vídeo de forma compacta para generar descripciones o metadatos.
- Detección de cambios de estado en secuencias: útil para tareas de seguimiento de acciones y finalización de eventos en vídeos públicos, apoyándose en el codificador V-JEPA 2.1.
- Evaluación comparativa de modelos de vídeo: sirve como referencia de la clase 2B para experimentos de video QA, dado su rendimiento declarado frente a Qwen3-VL-2B.
- Investigación en modelos del mundo: el diseño con codificador congelado y puente espectral facilita experimentos sobre representaciones visuales y su transferencia al lenguaje.
- Prototipado con recursos limitados: su tamaño de 2,03 B de parámetros y su bajo coste de prefill (3,3 TFLOPs por clip en H100) permiten desplegarlo en entornos de investigación con hardware moderado.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en tareas de video question answering:

| Benchmark | Métrica | Valor |
|---|---|---|
| MVBench | accuracy | 69,5 |
| PerceptionTest | accuracy | 75,3 |
| TVBench | accuracy | 70,7 |
| TempCompass | accuracy | 73,5 |
| TOMATO | accuracy | 50,9 |
| MotionBench | accuracy | 54,3 |
| NExT-QA | accuracy | 74,0 |
| MVP | pair accuracy | 54,6 |
| TemporalBench (binary) | accuracy | 63,9 |
| SSv2 (multiple choice) | accuracy | 91,6 |
| Vinoground text | text pair accuracy | 63,2 |
| Vinoground video | video pair accuracy | 50,8 |

El autor declara una media de 66,02 en las 12 puntuaciones sobre 11 benchmarks de vídeo, frente a 52,45 de Qwen3-VL-2B. También reporta una media de 95,0 en seis conjuntos retenidos (frente a 43,8 de Qwen3-VL-2B, con azar en 33,3). Estos datos proceden de la model card y no están verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,03 B de parámetros, en precisión completa (fp16/bf16) el peso ronda los 4 GB, y el repositorio ocupa 4,1 GB.
- GPU recomendadas: el autor reporta mediciones en una H100 (3,3 TFLOPs de prefill por clip y 83 ms hasta el primer token en total).
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por tamaño de parámetros sería viable en GPUs de consumo con memoria suficiente, pero no se aportan datos de VRAM ni de cuantización.
- Opciones de despliegue: transformers (librería declarada, con custom_code). No se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 83 ms hasta el primer token en total según el autor; throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (media 12 scores) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Qwen3-1.7B | 2,03 B | no disponible | 66,02 (declarado) | Apache-2.0 | Hugging Face |
| Qwen3-VL-2B | clase 2B | no disponible | 52,45 (declarado por el autor) | no disponible en esta ficha | Hugging Face |
| Otros modelos abiertos de clase 2B | clase 2B | no disponible | no disponible | no disponible | no disponible |

El autor sitúa a Llama-V-JEPA-LM-Qwen3-1.7B por delante de todos los modelos abiertos de su clase en 9 de las 12 puntuaciones, con ventajas destacadas en SSv2 (91,6 frente a 61,7), Vinoground text (63,2 frente a 40,0), MVP (54,6 frente a 32,3) y Vinoground video (50,8 frente a 29,6). No se dispone de datos comparativos adicionales verificados.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y no verificados de forma independiente.
- Idiomas: solo inglés según la model card; no se garantiza rendimiento en castellano u otros idiomas.
- Longitud de contexto no especificada; no se puede evaluar su comportamiento en conversaciones o vídeos largos.
- Riesgo de alucinación: no documentado en la información disponible, pero inherente a los modelos generativos.
- Sesgos conocidos: no documentados; al entrenarse con vídeos públicos, pueden heredarse sesgos de esos datos.
- Restricción de licencia: aunque la licencia es Apache-2.0, el nombre "Llama" deriva de que los datos incluyen el split FGQA de PLM-Video-Human, cuya licencia exige el prefijo "Llama" a los modelos entrenados con él; conviene revisar las implicaciones para uso comercial.
- Requiere custom_code en transformers, lo que puede complicar el despliegue en otros frameworks.
- No se aportan datos sobre cuantización ni sobre compatibilidad con motores de inferencia habituales.
- El modelo está orientado a vídeo y texto; no se documentan capacidades de audio, tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-1.7B
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset PLM-Video-Human (split FGQA): https://huggingface.co/datasets/facebook/PLM-Video-Human
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
