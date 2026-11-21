# medinstructbench/medinstructbench-omni-7b-v

## Resumen

MedInstructBench Omni 7B V es un conjunto de adaptadores LoRA publicados por el equipo de MedInstructBench sobre el modelo multimodal Qwen2.5-Omni-7B. El modelo está especializado en una tarea muy concreta: la segmentación procedimental y el subtitulado (captioning) de vídeos instructivos médicos. Dado un vídeo de una pregunta de salud junto con su clip de respuesta, el modelo divide el clip en pasos instructivos, cada uno con marcas temporales de inicio y fin y una descripción en imperativo. Acompaña al artículo *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos*.

El repositorio contiene dos adaptadores independientes: uno entrenado con supervisión (SFT) y otro posterior entrenado con GRPO (Group Relative Policy Optimization). Ambos se aplican sobre la capa del modelo de lenguaje de Qwen2.5-Omni-7B y se fusionan secuencialmente para reproducir exactamente los modelos evaluados en el artículo. La variante "V" indica que la entrada utilizada es únicamente vídeo, sin audio.

Es relevante porque aborda un nicho poco cubierto por los modelos generalistas: la comprensión de vídeo médico denso con estructuración temporal explícita. La licencia Apache 2.0 y el formato LoRA facilitan su reutilización sobre el modelo base, aunque el despliegue exige el pipeline específico del repositorio de código asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni) con adaptadores LoRA sobre el modelo de lenguaje |
| Parametros totales | 7B (modelo base Qwen2.5-Omni-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal que procesa vídeo, audio y texto. Los adaptadores LoRA se aplican únicamente sobre el modelo de lenguaje del sistema, no sobre los codificadores de visión o audio. El entrenamiento se realiza en dos fases: primero un ajuste supervisado (SFT) sobre el conjunto MedInstruct10K, y después un refinamiento con GRPO. La variante publicada aquí utiliza solo la modalidad de vídeo como entrada, sin pista de audio.

La tarea objetivo es la segmentación procedimental: el modelo debe identificar los límites temporales de cada paso instructivo dentro de un clip y generar una descripción imperativa para cada uno. El repositorio incluye instrucciones para fusionar primero el adaptador SFT sobre el modelo base y después el adaptador GRPO sobre el resultado, lo que reproduce tensor a tensor los modelos evaluados en el artículo. La inferencia de referencia usa decodificación greedy y muestreo de fotogramas a 0,2 fps.

## Capacidades

- Segmentación de vídeo instructivo médico en pasos procedimentales con marcas temporales de inicio y fin.
- Generación de subtítulos imperativos (dense video captioning) para cada paso identificado.
- Comprensión de vídeo denso (dense-video-captioning) en el dominio sanitario.
- Procesamiento de entrada exclusivamente visual (variante V, sin audio).
- Razonamiento multimodal orientado a preguntas y respuestas de salud a partir de clips de respuesta.
- No se documenta soporte de tool calling, agentes ni modos de pensamiento explícitos en la información disponible.

## Casos de uso

- Indexación de vídeos educativos médicos: el modelo segmenta un vídeo de procedimiento en pasos con marcas temporales, lo que permite generar capítulos navegables y metadatos estructurados para plataformas de formación sanitaria.
- Generación automática de guiones de formación: a partir de un clip de respuesta a una pregunta de salud, produce descripciones imperativas que pueden servir como borrador de material docente o de instrucciones paso a paso.
- Búsqueda semántica sobre bibliotecas de vídeo clínico: los pasos segmentados y sus subtítulos permiten construir índices que responden a consultas del tipo "cómo se realiza X" señalando el instante exacto del vídeo.
- Accesibilidad y subtitulado estructurado: los subtítulos por paso con tiempos facilitan la generación de pistas de subtítulos sincronizadas para contenido médico audiovisual.
- Evaluación comparativa de modelos de vídeo médico: al ser la implementación de referencia del benchmark MedInstructBench, sirve para medir y comparar el rendimiento de otros sistemas en segmentación procedimental.
- Anotación asistida de datasets clínicos: el modelo puede preanotar clips con pasos y descripciones que después revisa un experto, reduciendo el coste de etiquetado manual.
- Control de calidad de contenido formativo: la segmentación permite verificar que un vídeo instructivo cubre todos los pasos esperados de un procedimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos* para las métricas, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, el modelo base Qwen2.5-Omni-7B requiere habitualmente entre 16 y 24 GB en precisión de 16 bits, aunque este dato no está confirmado para esta variante.
- GPU recomendadas: no disponible. El modelo base es de 7B, por lo que se espera que quepa en GPUs de gama alta de consumo, pero no se documenta en la model card.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: el repositorio indica un pipeline propio con `training/merge_lora.py` e `inference/run_qwen25omni.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La inferencia de referencia usa decodificación greedy y fotogramas a 0,2 fps.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedInstructBench Omni 7B V (este) | 7B (LoRA sobre Qwen2.5-Omni-7B) | no disponible | Segmentación y captioning de vídeo médico | apache-2.0 | Hugging Face (adaptadores) |
| Qwen2.5-Omni-7B (base) | 7B | no disponible | Multimodal general (vídeo, audio, texto) | no disponible en esta ficha | Hugging Face |
| Alternativas específicas de vídeo médico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en segmentación procedimental de vídeo médico; su rendimiento fuera de ese dominio no está documentado y probablemente sea limitado.
- La variante publicada procesa solo vídeo, sin audio; no aprovecha la información sonora que podría ser relevante en vídeos instructivos.
- Requiere fusionar los adaptadores LoRA con el modelo base antes de la inferencia; no es un modelo autónomo listo para usar directamente.
- El pipeline de inferencia depende de un repositorio de código externo (alojado en anonymous.4open.science), lo que puede afectar a la reproducibilidad a largo plazo.
- Riesgo de alucinación en la generación de pasos o descripciones no presentes en el vídeo, especialmente en clips ambiguos o de baja calidad.
- No se documentan sesgos conocidos, cobertura lingüística ni comportamiento multilingüe.
- Aunque la licencia es Apache 2.0, el uso en contextos clínicos reales exige validación por profesionales sanitarios; no debe emplearse como sustituto del juicio médico.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/medinstructbench/medinstructbench-omni-7b-v
- Modelo base Qwen2.5-Omni-7B: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de código (anónimo): https://anonymous.4open.science/r/medinstructbench-5080/
- Artículo: *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos* (referenciado en la model card; enlace directo no disponible)
