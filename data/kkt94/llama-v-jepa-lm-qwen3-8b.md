# kkt94/Llama-V-JEPA-LM-Qwen3-8B

## Resumen

Llama-V-JEPA-LM-Qwen3-8B es un modelo de lenguaje y vídeo multimodal desarrollado por el autor independiente kkt94 (repositorio `kkt94`). Combina un codificador de vídeo congelado basado en el modelo del mundo V-JEPA 2.1 (ViT-g) con el modelo de lenguaje Qwen3-8B, unidos mediante un puente espectral ("spectral bridge") que transforma cada clip de 32 fotogramas en 1.024 tokens visuales. El modelo resuelve la tarea de respuesta a preguntas sobre vídeo (video question answering) y está diseñado para razonar sobre la dinámica de la escena: dirección, velocidad, orden y estado de los objetos.

La innovación principal es el entrenamiento con supervisión contrafactual: transformaciones a nivel de píxel sobre vídeos públicos generan variantes equilibradas en respuestas, fijadas por construcción y que difieren solo en cómo cambia la escena. Así, el modelo de lenguaje aprende a leer la dinámica que el codificador del mundo ya captura. Se entrenó sobre 4,53 millones de muestras públicas y declara una media de 70,11 en 12 métricas sobre 11 benchmarks de vídeo, por delante de los modelos abiertos de su clase de tamaño (el mejor modelo abierto de 8B, PLM-8B, obtiene 64,79).

El nombre empieza por "Llama" porque los datos de entrenamiento incluyen el split FGQA de PLM-Video-Human, una salida de Llama 3.2 cuya licencia exige que los modelos entrenados con ella lleven el prefijo "Llama". El modelo base real es Qwen3-8B, con licencia Apache-2.0, y los pesos suman 9.228.761.088 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje Qwen3-8B (transformer) + codificador de vídeo V-JEPA 2.1 (ViT-g) congelado, unidos por un puente espectral |
| Parametros totales | 9.228.761.088 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (repo de 18,5 GB) |

## Arquitectura y entrenamiento

La arquitectura acopla dos componentes: un codificador de vídeo congelado V-JEPA 2.1 (ViT-g), que actúa como modelo del mundo y extrae representaciones de la dinámica visual, y el modelo de lenguaje Qwen3-8B. Entre ambos se sitúa un puente espectral que proyecta cada clip de 32 fotogramas en 1.024 tokens visuales, que el modelo de lenguaje consume junto al texto. El pipeline declarado es `video-text-to-text` y la librería es `transformers` con código personalizado (`custom_code`).

El entrenamiento utiliza supervisión contrafactual: a partir de vídeos públicos se generan transformaciones a nivel de píxel que producen variantes con respuestas equilibradas y fijadas por construcción, de modo que la única variable que cambia es la dinámica de la escena. El conjunto de entrenamiento consta de 4,53 millones de muestras públicas e incluye el split FGQA del dataset PLM-Video-Human. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en inglés, incluyendo preguntas sobre acciones, objetos y relaciones espacio-temporales.
- Razonamiento sobre dinámica de escena: dirección, velocidad, orden temporal y cambios de estado.
- Comprensión de relaciones temporales y de causalidad en secuencias de vídeo (evaluado en TVBench, TempCompass, TemporalBench).
- Discriminación de pares de vídeos y de texto (Vinoground, MVP), orientada a detectar diferencias sutiles entre clips.
- Procesamiento de clips de 32 fotogramas convertidos en 1.024 tokens visuales.
- Capacidades de lenguaje heredadas de Qwen3-8B (generación de texto y razonamiento en inglés).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión de imágenes estáticas o audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de vigilancia y seguridad: el modelo puede responder preguntas sobre la secuencia de eventos en un clip de 32 fotogramas, aprovechando su entrenamiento en orden temporal y cambios de estado para describir qué ocurrió y en qué orden.
- Indexación y búsqueda semántica de vídeo: al generar descripciones y respuestas sobre el contenido dinámico de clips, permite construir índices consultables en lenguaje natural sobre archivos de vídeo.
- Control de calidad en líneas de producción: preguntas sobre dirección y velocidad de movimientos en vídeos de procesos industriales, apoyándose en las métricas de MotionBench y PerceptionTest.
- Accesibilidad: generación de descripciones narradas de secuencias de vídeo para personas con discapacidad visual, centradas en la dinámica de la escena y no solo en objetos estáticos.
- Análisis deportivo: consultas sobre orden de acciones, trayectorias y cambios de estado en clips cortos, donde la comprensión temporal es crítica.
- Evaluación de modelos del mundo: uso como componente de investigación para estudiar cómo las representaciones de V-JEPA se traducen en razonamiento lingüístico sobre dinámica, gracias a su diseño de supervisión contrafactual.
- Moderación de contenido en vídeo: detección de secuencias de acciones concretas mediante preguntas dirigidas sobre clips, con la cautela de que el modelo solo opera en inglés.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en la model card:

| Benchmark | Métrica | Valor |
|---|---|---|
| MVBench | accuracy | 72,8 |
| PerceptionTest | accuracy | 77,8 |
| TVBench | accuracy | 75,3 |
| TempCompass | accuracy | 79,4 |
| TOMATO | accuracy | 56,5 |
| MotionBench | accuracy | 59,1 |
| NExT-QA | accuracy | 81,2 |
| MVP | pair accuracy | 58,1 |
| TemporalBench (binary) | accuracy | 73,5 |
| SSv2 (multiple choice) | accuracy | 93,8 |
| Vinoground text | text pair accuracy | 75,2 |
| Vinoground video | video pair accuracy | 38,6 |

Media declarada de 70,11 en 12 métricas sobre 11 benchmarks, frente a 64,79 del mejor modelo abierto de 8B (PLM-8B). El autor declara estado del arte (SOTA) en TOMATO y TVBench, y el cuarto puesto en NExT-QA, según los badges de Papers with Code. No se han publicado en la información disponible resultados de benchmarks de lenguaje general (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9,23 mil millones de parámetros, en FP16 se requieren aproximadamente 18,5 GB solo para los pesos, más el codificador de vídeo ViT-g y las activaciones; en cuantización de 8 bits, en torno a 9-10 GB, y en 4 bits, en torno a 5-6 GB, aunque el modelo no documenta cuantizaciones soportadas.
- GPU recomendadas: A100 o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) podría alojar los pesos en FP16 pero con margen ajustado para el codificador y activaciones.
- ¿Cabe en GPU de consumo? En FP16 probablemente no en tarjetas de 16 GB; en cuantizaciones de 4-8 bits podría caber en RTX 4090 o RTX 3090, aunque no está documentado.
- Opciones de despliegue: `transformers` con `custom_code` (requiere cargar código remoto); vLLM, llama.cpp, Ollama o TGI no están confirmados como soportados.
- Latencia y throughput: no disponible. El procesamiento de 32 fotogramas por clip añade coste de codificación de vídeo no cuantificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media 12 métricas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Qwen3-8B | 9,23B | No disponible | 70,11 | Apache-2.0 | Hugging Face, demo ZeroGPU |
| PLM-8B | Clase 8B | No disponible | 64,79 | No disponible | No disponible en la información |
| Qwen3-8B (base) | 8B | No disponible | No aplica (solo texto) | Apache-2.0 | Hugging Face |

Comparativa adicional con otros modelos de vídeo-lenguaje de tamaño similar: no disponible en la información proporcionada. El autor solo cita a PLM-8B como referencia directa de su clase de tamaño.

## Limitaciones y advertencias

- Idiomas: el modelo solo declara soporte de inglés; su uso en castellano u otros idiomas no está validado.
- Alucinación: como modelo generativo de lenguaje, puede producir respuestas plausibles pero incorrectas sobre el contenido del vídeo, especialmente en preguntas de orden temporal complejo (Vinoground video obtiene solo 38,6 de precisión en pares de vídeo).
- Rendimiento desigual: la precisión cae notablemente en tareas de discriminación fina de vídeo (Vinoground video 38,6; TOMATO 56,5; MotionBench 59,1) frente a tareas de reconocimiento de acciones (SSv2 93,8).
- Sesgos: no se documentan análisis de sesgos en la información disponible; al entrenarse con vídeos públicos, puede heredar sesgos de esos datasets.
- Licencia: Apache-2.0 permite uso comercial, pero el prefijo "Llama" deriva de la obligación de la licencia de Llama 3.2 sobre el split FGQA de PLM-Video-Human; conviene revisar las condiciones de esa licencia antes de un despliegue comercial.
- Código personalizado: requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar código del autor.
- Benchmarks no verificados: los resultados de la model card están marcados como `verified: false` y proceden del propio autor.
- Longitud de contexto y cuantizaciones no documentadas: dificulta planificar despliegues en producción.
- Ventana visual fija: cada clip se limita a 32 fotogramas y 1.024 tokens visuales, lo que puede perder información en vídeos largos.

## Enlaces

- Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-8B
- Paper (arXiv): https://arxiv.org/abs/2611.17831
- Código y reporte técnico: https://github.com/kkt94/Llama-V-JEPA-LM
- Demo en vivo (ZeroGPU): https://huggingface.co/spaces/kkt94/llama-v-jepa-lm-8b
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Dataset PLM-Video-Human: https://huggingface.co/datasets/facebook/PLM-Video-Human
