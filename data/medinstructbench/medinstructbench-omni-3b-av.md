# medinstructbench/medinstructbench-omni-3b-av

## Resumen

MedInstructBench Omni 3B A+V es un conjunto de adaptadores LoRA publicados por el equipo MedInstructBench, pensados para dotar al modelo base Qwen/Qwen2.5-Omni-3B de capacidades especializadas en segmentación y descripción de vídeos médicos instruccionales. El modelo resultante, una vez fusionados los adaptadores, recibe como entrada una pregunta de salud junto con el clip de vídeo y audio asociado, y devuelve una segmentación del clip en pasos instruccionales, cada uno con tiempos de inicio y fin y una leyenda de tipo imperativo. Se trata, por tanto, de una adaptación orientada a un benchmark y a una tarea muy concretos, no de un modelo generalista nuevo.

La relevancia de esta publicación radica en que acompaña al paper "MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos", y su propósito es hacer reproducibles los resultados del artículo. Los adaptadores se distribuyen como LoRA sobre el modelo base Qwen2.5-Omni-3B, un modelo multimodal de audio, vídeo, texto e imagen de aproximadamente 3 mil millones de parámetros, del que los adaptadores heredan arquitectura, ventana de contexto y tokenizador.

La ficha describe las especificaciones técnicas, la arquitectura y el entrenamiento (SFT seguido de GRPO sobre MedInstruct10K), las capacidades y casos de uso plausibles para un modelo de este perfil, y advierte sobre las limitaciones derivadas de su naturaleza experimental, su enfoque exclusivamente médico y su condición de adaptador no autónomo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen/Qwen2.5-Omni-3B (modelo multimodal vision-audio-lenguaje); adaptador SFT con LoRA en el modelo de lenguaje y el codificador de audio, adaptador GRPO con LoRA en el modelo de lenguaje |
| Parametros totales | No disponible para los adaptadores; modelo base Qwen2.5-Omni-3B con aproximadamente 3 mil millones de parametros |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Omni-3B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; los adaptadores se distribuyen en safetensors sin cuantizacion |
| Idiomas soportados | No disponibles en los metadatos; el modelo base Qwen2.5-Omni-3B es multilingue, pero la adaptacion esta orientada a videos medicos instruccionales, presumiblemente en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores LoRA, libreria peft); tamano del repositorio 1.0 GB |

## Arquitectura y entrenamiento

Los adaptadores se construyen sobre Qwen2.5-Omni-3B, un modelo multimodal que combina un modelo de lenguaje con codificadores de audio y vision, y que procesa entradas de texto, imagen, audio y video. El repositorio contiene dos adaptadores LoRA: `sft/`, entrenado con supervisión fina (SFT) sobre el modelo de lenguaje y el codificador de audio, y `grpo/`, entrenado con GRPO (optimización de política con recompensa) sobre el modelo de lenguaje, aplicado a continuación del modelo SFT ya fusionado. Según la model card, los modelos fusionados son idénticos, tensor a tensor, a los evaluados en el paper.

El entrenamiento se realiza sobre MedInstruct10K, un conjunto de vídeos médicos instruccionales anotados con pasos procedimentales. La tarea consiste en, dada una pregunta de salud y su clip de respuesta, segmentar el clip en pasos instruccionales con tiempos de inicio y fin y una leyenda imperativa. La inferencia de referencia usa decodificación greedy y muestreo de fotogramas a 0,2 fps, con modalidad de entrada audio y vídeo (A+V). No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni los hiperparámetros de SFT y GRPO.

## Capacidades

- Segmentación de vídeos médicos instruccionales en pasos, con marcas temporales de inicio y fin.
- Generación de leyendas imperativas por paso, orientadas a instrucciones médicas.
- Comprensión conjunta de audio y vídeo (modalidad A+V), incluyendo el habla del instructor y las imágenes del procedimiento.
- Procesamiento de preguntas de salud junto con el clip de respuesta asociado.
- Razonamiento multimodal sobre contenido médico procedimental.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.
- No se documentan capacidades multilingües específicas más allá de las heredadas del modelo base.
- No se documentan modos especiales (thinking mode, visión general, audio general) más allá de los necesarios para la tarea de segmentación y leyendas.

## Casos de uso

- Segmentación automática de vídeos de formación médica: el modelo recibe un clip instruccional y devuelve los pasos con tiempos de inicio y fin, lo que permite indexar y estructurar bibliotecas de vídeos quirúrgicos o de procedimientos.
- Generación de leyendas imperativas para material docente: a partir de cada paso segmentado, el modelo produce una instrucción concisa que puede usarse como subtítulo o como guion de formación.
- Búsqueda y recuperación de contenido clínico: al disponer de pasos y leyendas estructurados, los clips pueden indexarse y recuperarse por procedimiento o por paso, facilitando la consulta de vídeos médicos.
- Evaluación de sistemas de comprensión de vídeo médico: el modelo sirve como referencia reproducible para comparar métodos de segmentación y descripción de pasos en el benchmark MedInstructBench.
- Asistencia a la documentación de procedimientos: el modelo puede ayudar a transcribir y estructurar el contenido de un vídeo en pasos documentados, reduciendo el trabajo manual de anotación.
- Investigación en multimodalidad médica: al ser un adaptador reproducible sobre Qwen2.5-Omni-3B, permite estudiar el efecto de SFT y GRPO en tareas de segmentación procedimental con audio y vídeo.
- Formación de personal sanitario: los pasos segmentados y las leyendas generadas pueden integrarse en plataformas de e-learning para estructurar lecciones a partir de vídeos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Los adaptadores LoRA ocupan aproximadamente 1,0 GB en disco; la inferencia requiere cargar el modelo base Qwen2.5-Omni-3B completo, cuyo consumo de VRAM depende de la cuantización y del backend, dato no especificado.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo base (aproximadamente 3 mil millones de parámetros), es plausible su ejecución en GPUs de consumo con cuantización adecuada, pero no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el repositorio proporciona scripts de fusión (`training/merge_lora.py`) y de inferencia (`inference/run_qwen25omni.py`) en el repositorio de código asociado; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedInstructBench Omni 3B A+V (este modelo) | Adaptadores LoRA sobre Qwen2.5-Omni-3B (~3B) | No disponible | Segmentacion y leyendas de videos medicos (A+V) | apache-2.0 | Hugging Face (adaptadores) |
| Qwen/Qwen2.5-Omni-3B (modelo base) | ~3B | No disponible en la informacion | Multimodal general (texto, imagen, audio, video) | No disponible en la informacion | Hugging Face |
| Alternativas especializadas en video medico | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental ligado a un benchmark: los adaptadores están diseñados para la tarea específica de segmentación y leyendas de vídeos médicos instruccionales, no como modelo generalista.
- Dependencia del modelo base: no funcionan de forma autonoma; requieren fusionar `sft/` sobre Qwen2.5-Omni-3B (revision `f75b40e3da2003cdd6e1829b1f420ca70797c34e`) y después `grpo/` sobre el modelo SFT fusionado.
- Riesgo de alucinación: no se documentan evaluaciones específicas de fidelidad de las leyendas generadas ni de los tiempos predichos.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre vídeos médicos instruccionales, puede reflejar sesgos de ese corpus.
- Limitaciones de idioma: los idiomas no están especificados en los metadatos; la adaptación parece orientada a contenido en inglés, sin confirmación.
- Uso clínico: no se documenta validación clínica; las leyendas generadas no deben usarse como instrucciones médicas sin revisión experta.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Omni-3B, cuya licencia no se detalla en la información proporcionada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: escasa validación comunitaria.
- No se documentan limitaciones de contexto o de resolución de vídeo más allá de los ajustes de inferencia del repositorio (greedy decoding, 0,2 fps).

## Enlaces

- Hugging Face: https://huggingface.co/medinstructbench/medinstructbench-omni-3b-av
- Repositorio de código: https://anonymous.4open.science/r/medinstructbench-5080/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Paper: no disponible en la información proporcionada (referenciado como *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos*)
