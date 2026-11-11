# kkt94/Llama-V-JEPA-LM-Qwen3-4B

## Resumen

Llama-V-JEPA-LM-Qwen3-4B es un modelo de lenguaje y vídeo multimodal desarrollado por el usuario kkt94 (no vinculado a Meta) que combina un codificador de vídeo congelado V-JEPA 2.1 (ViT-g) con el modelo de lenguaje Qwen3-4B-Instruct-2507 mediante un puente espectral. El resultado es un sistema de respuesta a preguntas sobre vídeo que convierte cada clip de 32 fotogramas en 1.024 tokens visuales, independientemente de la resolución de entrada. El modelo se distribuye con licencia Apache-2.0 y está pensado para tareas de comprensión temporal y de dinámica de escenas.

La propuesta diferencial es el entrenamiento con supervisión contrafactual: se aplican transformaciones a nivel de píxel sobre vídeos públicos para generar variantes con respuestas equilibradas y fijadas por construcción, de modo que el modelo de lenguaje aprende a leer dirección, velocidad, orden, posición y estado a partir de las representaciones del codificador world-model. El autor declara 4,53 millones de muestras públicas de entrenamiento y una media de 72,14 en 12 puntuaciones sobre 11 benchmarks de vídeo.

El modelo tiene 5.057.113.088 parámetros totales (aproximadamente 5,06 mil millones) según los pesos en safetensors, un repositorio de 10,1 GB y soporte únicamente para inglés. Su relevancia actual radica en que compite en la clase de 4B con modelos abiertos de vídeo mucho más costosos computacionalmente, con un prefijado de 8,6 TFLOPs y 29 ms por clip en una H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: codificador de vídeo V-JEPA 2.1 (ViT-g) congelado + puente espectral + LLM Qwen3-4B-Instruct-2507 (transformer decoder) |
| Parametros totales | 5.057.113.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (con obligación de prefijo "Llama" por el split FGQA de PLM-Video-Human) |
| Formato de pesos | safetensors, con custom_code (requiere `trust_remote_code`) |
| Tokens visuales por clip | 1.024 (clip de 32 fotogramas, cualquier resolución) |
| Pipeline | video-text-to-text |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamaño del repositorio | 10,1 GB |

## Arquitectura y entrenamiento

La arquitectura acopla un codificador de vídeo V-JEPA 2.1 basado en ViT-g, que permanece congelado, a un decoder de lenguaje Qwen3-4B-Instruct-2507. La conexión se realiza mediante un puente espectral que proyecta las representaciones del codificador a 1.024 tokens visuales por clip de 32 fotogramas, con independencia de la resolución de entrada. Esta compresión fija el coste de prefijado del LLM: 8,6 TFLOPs y 29 ms por clip en una H100, con 167 ms hasta el primer token en total, frente a 18,1–104,4 TFLOPs y 58–218 ms de los modelos abiertos de su clase.

El entrenamiento emplea supervisión contrafactual sobre 4,53 millones de muestras públicas. Se generan variantes de los vídeos mediante transformaciones de píxel que fijan la respuesta por construcción y difieren solo en la dinámica de la escena (dirección, orden, posición, velocidad, conteo y finalización), sin anotación humana adicional. El autor declara que el modelo generaliza a configuraciones no vistas: 96,3 de media en seis conjuntos retenidos (ratios de velocidad no vistos, corpus fuente no visto, combinaciones no vistas y un simulador no visto; el azar es 33,3). Parte de los datos de entrenamiento proviene del split FGQA de PLM-Video-Human, salida de Llama 3.2, cuya licencia exige el prefijo "Llama" en los modelos entrenados con ella, de ahí el nombre pese a no estar desarrollado por Meta.

## Capacidades

- Respuesta a preguntas sobre vídeo (video question answering) en inglés, con razonamiento sobre contenido visual y temporal.
- Lectura de dinámica de escena: dirección, orden temporal, posición, velocidad, conteo y finalización de acciones.
- Comprensión de cambio temporal y movimiento, incluyendo pares de vídeos que difieren sutilmente (Vinoground, MVP).
- Procesamiento de clips de 32 fotogramas con coste de tokens visuales constante (1.024) a cualquier resolución.
- Capacidades de lenguaje heredadas de Qwen3-4B-Instruct-2507 (generación de texto y razonamiento), aunque la model card no las detalla de forma específica para este fine-tuning.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión de imágenes estáticas, audio: no disponible en la información proporcionada.

## Casos de uso

- Moderación y análisis de vídeo generado por usuarios: el modelo puede responder preguntas sobre la dinámica de un clip (qué ocurre, en qué orden, en qué dirección se mueve un objeto) con 1.024 tokens visuales por clip, lo que abarata el preprocesado en pipelines de gran volumen.
- Indexación y búsqueda semántica de archivos audiovisuales: generar descripciones y respuestas estructuradas sobre clips de 32 fotogramas para enriquecer metadatos, aprovechando su rendimiento en NExT-QA (79,3) y PerceptionTest (78,2).
- Verificación de instrucciones en vídeo industrial: comprobar que una secuencia de montaje o un procedimiento se ejecuta en el orden y la dirección correctos, gracias al entrenamiento contrafactual en orden, posición y finalización.
- Análisis de vídeo deportivo o de movimiento: estimar dirección, velocidad y conteo de acciones a partir de clips cortos, con la ventaja de que el coste de prefijado (29 ms en H100) permite procesar muchos clips por segundo.
- Detección de cambios sutiles entre pares de vídeos: comparar dos clips casi idénticos para identificar la diferencia de dinámica, un caso alineado con sus resultados en Vinoground vídeo (66,8) y MVP (58,1).
- Asistencia a la anotación de datasets de vídeo: preetiquetar preguntas y respuestas temporales sobre clips públicos antes de la revisión humana, reduciendo el coste de anotación.
- Investigación en world models: usar el modelo como sonda para evaluar qué información dinámica codifica el encoder V-JEPA 2.1, dado que el LLM solo ve las representaciones del codificador congelado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados de forma independiente):

| Benchmark | Métrica | Valor |
|---|---|---|
| MVBench | accuracy | 72,1 |
| PerceptionTest | accuracy | 78,2 |
| TVBench | accuracy | 74,8 |
| TempCompass | accuracy | 79,9 |
| TOMATO | accuracy | 53,5 |
| MotionBench | accuracy | 59,1 |
| NExT-QA | accuracy | 79,3 |
| MVP | pair accuracy | 58,1 |
| TemporalBench (binary) | accuracy | 75,7 |
| SSv2 (multiple choice) | accuracy | 92,2 |
| Vinoground text | text pair accuracy | 76,0 |
| Vinoground video | video pair accuracy | 66,8 |

Media declarada: 72,14 en 12 puntuaciones sobre 11 benchmarks. Comparaciones aportadas por el autor: Molmo2-4B obtiene 61,08 de media; en conjuntos retenidos de generalización, 96,3 frente a 50,0 de Qwen3-VL-4B (azar 33,3). En los seis benchmarks reportados para los LLM de vídeo V-JEPA 2/2.1 de Meta (Llama-3.1-8B), el autor declara una media de 69,4.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 5,06 mil millones de parámetros, en FP16 los pesos ocupan aproximadamente 10,1 GB; en cuantizaciones de 8 bits o 4 bits el requisito sería considerablemente menor, aunque el autor no publica cifras.
- GPU recomendadas: el autor reporta mediciones en una H100 (29 ms y 8,6 TFLOPs de prefijado por clip, 167 ms hasta el primer token). No se especifican requisitos mínimos ni otras GPU.
- GPU de consumo: no confirmado. Por tamaño de pesos, cabría en GPUs con 16 GB o más en FP16, pero el codificador V-JEPA 2.1 (ViT-g) añade cómputo y memoria no cuantificados en la información disponible.
- Opciones de despliegue: la librería indicada es transformers con `custom_code` (requiere `trust_remote_code=True`). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 29 ms de prefijado por clip y 167 ms hasta el primer token en una H100, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-V-JEPA-LM-Qwen3-4B | 5,06B | no disponible | 72,14 media en 12 puntuaciones | Apache-2.0 (con prefijo "Llama") | Hugging Face |
| Molmo2-4B | clase 4B (cifra exacta no disponible) | no disponible | 61,08 media en la comparativa del autor | no disponible | no disponible en la información |
| Qwen3-VL-4B | clase 4B (cifra exacta no disponible) | no disponible | 50,0 en conjuntos retenidos de generalización | no disponible | no disponible en la información |
| V-JEPA 2 / 2.1 video LLM (Llama-3.1-8B) | 8B (LLM base) | no disponible | 69,4 media en los seis benchmarks reportados por Meta | no disponible | no disponible en la información |

Las cifras de los competidores proceden exclusivamente de las comparaciones incluidas en la model card del autor y no se han verificado de forma independiente.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse con vídeos públicos, puede heredar sesgos de ese corpus.
- Riesgo de alucinación: no cuantificado por el autor; como modelo generativo, puede producir respuestas plausibles pero incorrectas sobre contenido no visto.
- Idioma: soporte limitado al inglés según la model card, lo que restringe su uso en castellano sin evaluación adicional.
- Licencia: Apache-2.0, pero con la obligación de conservar el prefijo "Llama" en el nombre por el uso del split FGQA de PLM-Video-Human; conviene revisar los términos antes de un uso comercial.
- Longitud de contexto del LLM: no disponible, lo que impide planificar despliegues con clips largos o conversaciones multi-turno extensas.
- Clip fijo de 32 fotogramas: el modelo está diseñado para clips cortos; no se documenta comportamiento con vídeos de mayor duración.
- Requiere `trust_remote_code` por el código personalizado, lo que implica ejecutar código del repositorio del autor.
- Resultados de benchmarks no verificados (`verified: false` en el model-index) y con 0 descargas en el momento de la consulta; la validación independiente es inexistente.
- Sin datos publicados sobre cuantización, contexto o despliegue en GPUs de consumo, lo que dificulta estimar costes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkt94/Llama-V-JEPA-LM-Qwen3-4B
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
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
- Dataset SSv2: https://huggingface.co/datasets/HuggingFaceM4/something_something_v2
- Dataset Vinoground: https://huggingface.co/datasets/HanSolo9682/Vinoground
