# medinstructbench/medinstructbench-omni-7b-av-iou-only

## Resumen

MedInstructBench Omni 7B AV IoU-only es un conjunto de adaptadores LoRA publicados por el equipo del proyecto MedInstructBench, asociados al artículo *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos*. Se construye sobre el modelo multimodal Qwen2.5-Omni-7B y resuelve una tarea muy concreta: dado un vídeo instructivo sanitario (con su pista de audio) y una pregunta de salud, segmentar el clip en pasos procedimentales con marcas temporales de inicio y fin y una descripción imperativa de cada paso.

El repositorio no contiene pesos completos, sino dos adaptadores PEFT: uno de ajuste supervisado (SFT) que aplica LoRA sobre el modelo de lenguaje y el codificador de audio, y otro de optimización por refuerzo con GRPO aplicado después, en este caso solo sobre el modelo de lenguaje. La variante "iou-only" indica una ablación de la función de recompensa en la que únicamente se emplea la recompensa de intersección sobre unión (IoU) para el alineamiento temporal de los segmentos.

Es relevante para investigación en comprensión de vídeo médico y en alineamiento temporal multimodal: demuestra que es posible adaptar un modelo omni de 7B con recursos modestos (el repositorio ocupa 0,7 GB) y obtener segmentación y descripción densa de procedimientos clínicos. No obstante, es un artefacto de investigación, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre Qwen2.5-Omni-7B (transformer multimodal audio-vídeo-texto) |
| Parametros totales | No disponible (el modelo base Qwen2.5-Omni-7B tiene 7B; el repositorio solo contiene adaptadores LoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Omni-7B, un transformer multimodal que procesa audio, vídeo y texto. Sobre él se aplica un primer adaptador LoRA de ajuste supervisado (SFT) que cubre el modelo de lenguaje y el codificador de audio, entrenado sobre el conjunto MedInstruct10K. Posteriormente se aplica un segundo adaptador LoRA de GRPO (optimización de política con recompensas verificables) únicamente sobre el modelo de lenguaje, partiendo del modelo SFT ya fusionado.

La variante publicada aquí corresponde a una ablación de recompensa: en la fase GRPO solo se utiliza la recompensa de IoU temporal, sin otras señales auxiliares. La entrada es multimodal (audio y vídeo, modalidad "av") y la salida es una secuencia de pasos con tiempos de inicio y fin y una leyenda en modo imperativo. La inferencia de referencia usa decodificación greedy y muestreo de fotogramas a 0,2 fps. Los adaptadores fusionados son idénticos, tensor a tensor, a los modelos evaluados en el artículo.

## Capacidades

- Segmentación temporal de vídeo: divide un clip instructivo en pasos con marcas de inicio y fin.
- Descripción densa de vídeo: genera una leyenda imperativa por cada paso detectado.
- Comprensión conjunta de audio y vídeo (modalidad A+V) en el dominio médico.
- Respuesta a preguntas de salud vinculadas a un clip concreto.
- Razonamiento procedimental sobre secuencias de acciones clínicas.
- Capacidades heredadas del modelo base Qwen2.5-Omni-7B (generación de texto, comprensión multimodal), aunque no se documentan en esta model card.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Segmentación automática de vídeos quirúrgicos o de primeros auxilios: el modelo identifica los límites temporales de cada paso del procedimiento, útil para indexar bibliotecas de formación médica.
- Generación de subtítulos descriptivos para material docente sanitario: produce leyendas imperativas ("desinfecte la herida", "aplique presión") alineadas con cada segmento del vídeo.
- Evaluación de modelos de comprensión de vídeo médico: sirve como referencia SFT+GRPO en experimentos de ablación de recompensas sobre el benchmark MedInstructBench.
- Investigación en alineamiento temporal multimodal: permite estudiar el efecto de usar solo la recompensa IoU frente a combinaciones de recompensas en tareas de segmentación.
- Anotación asistida de datasets clínicos: acelera el etiquetado de pasos y tiempos en corpus de vídeo instructivo antes de revisión humana.
- Análisis de adherencia a protocolos: comparando los pasos detectados con un protocolo de referencia se pueden señalar omisiones en una demostración grabada.
- Búsqueda dentro de vídeos formativos: los segmentos con tiempos permiten saltar directamente al paso relevante de un tutorial sanitario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al artículo MedInstructBench para las métricas del modelo evaluado, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- El repositorio solo contiene adaptadores LoRA (0,7 GB); para inferencia hay que fusionarlos con Qwen2.5-Omni-7B y desplegar el modelo completo.
- VRAM estimada para el modelo fusionado en precisión completa (bf16): en torno a 16-18 GB solo para pesos, más memoria para el codificador de audio, el procesador de vídeo y la caché KV; se recomienda al menos 24-40 GB para vídeo de cierta duración.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede ser suficiente con cuantización y clips cortos.
- Despliegue: el repositorio proporciona scripts propios (`training/merge_lora.py`, `inference/run_qwen25omni.py`); el modelo base Qwen2.5-Omni es compatible con stacks habituales de inferencia multimodal, aunque no se documenta compatibilidad específica con vLLM, TGI, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedInstructBench Omni 7B AV IoU-only | 7B (base) + LoRA | No disponible | Segmentación y captioning de vídeo médico A+V | Apache 2.0 | Hugging Face (adaptadores) |
| Qwen2.5-Omni-7B (base) | 7B | No disponible en esta ficha | Multimodal audio-vídeo-texto general | Apache 2.0 | Hugging Face |
| MedInstructBench Omni 7B AV (otras ablaciones) | 7B (base) + LoRA | No disponible | Igual, con otras combinaciones de recompensa | Apache 2.0 | Repositorio del proyecto MedInstructBench |
| Modelos de captioning de vídeo médico especializados | No disponible | No disponible | Segmentación/captioning | No disponible | No disponible |

## Limitaciones y advertencias

- Es un artefacto de investigación: los adaptadores deben fusionarse con una revisión concreta de Qwen2.5-Omni-7B (`ae9e1690543ffd5c0221dc27f79834d0294cba00`); usar otra revisión puede romper la equivalencia con los resultados del artículo.
- Dominio restringido a vídeo instructivo médico; el rendimiento fuera de ese dominio no está documentado.
- La ablación "iou-only" optimiza solo el alineamiento temporal, por lo que la calidad de las leyendas puede ser inferior a la de variantes con recompensas adicionales.
- Riesgo de alucinación en la descripción de pasos y en la asignación de tiempos, especialmente con clips largos o audio de baja calidad.
- Idiomas soportados no documentados; el prompt y los datos de entrenamiento condicionan el idioma de salida.
- Sin datos publicados de sesgos, robustez ni evaluación clínica; no debe usarse como herramienta de decisión médica.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5-Omni-7B, que conviene verificar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/medinstructbench/medinstructbench-omni-7b-av-iou-only
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de código del proyecto: https://anonymous.4open.science/r/medinstructbench-5080/
- Artículo: *MedInstructBench: Vision-Audio-Language Benchmark Towards Procedural Step Segmentation and Captioning in Medical Instructional Videos* (enlace directo no disponible en la información proporcionada)
