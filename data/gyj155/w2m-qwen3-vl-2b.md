# Gyj155/W2M-Qwen3-VL-2B

## Resumen

W2M-Qwen3-VL-2B es un modelo multimodal especializado en segmentación de imágenes guiada por lenguaje, desarrollado por el usuario Gyj155. Combina el backbone del modelo vision-language Qwen3-VL-2B-Instruct de Alibaba con un decodificador de segmentación condicionado por lenguaje, lo que le permite generar máscaras de segmentación a partir de referencias textuales además de mantener las capacidades conversacionales del modelo base.

El modelo se entrenó sobre 768.000 registros multimodales para tres tareas principales: segmentación por referencia (referring segmentation), diálogo fundamentado en imágenes y respuesta visual a preguntas (VQA). Con 2.165.923.841 parámetros totales y un repositorio de 5,2 GB, se posiciona como una alternativa compacta dentro de la familia W2M, que incluye variantes de 2B, 8B y 9B construidas sobre distintos backbones (Qwen3-VL, InternVL3.5, Sa2VA).

Su relevancia radica en ofrecer segmentación guiada por lenguaje en un tamaño de 2B parámetros, lo que facilita el despliegue en hardware modesto manteniendo unos resultados competitivos en los benchmarks de la familia (81,9 cIoU en RefCOCO val, 74,2 de precisión en SEED). Es un modelo de nicho, con cero descargas y sin licencia declarada en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone Qwen3-VL-2B-Instruct) con decodificador de segmentación condicionado por lenguaje |
| Parametros totales | 2.165.923.841 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3-VL-2B-Instruct, un transformer vision-language, al que se le añade un decodificador de segmentación condicionado por lenguaje. Esta combinación permite que el modelo reciba una imagen y una referencia textual (por ejemplo, una descripción de un objeto) y produzca una máscara de segmentación correspondiente, además de conservar las capacidades de comprensión y diálogo del modelo base.

El entrenamiento se realizó sobre 768.000 registros multimodales orientados a tres tareas: referring segmentation, grounded dialogue y visual question answering. La model card no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá de la propia integración del decodificador de segmentación.

## Capacidades

- Segmentación de imágenes guiada por lenguaje (referring segmentation): genera máscaras a partir de descripciones textuales.
- Segmentación fundamentada (grounded segmentation) con métricas reportadas en gRefCOCO y GCG.
- Diálogo fundamentado en imágenes (grounded dialogue) y conversación multi-turno sobre contenido visual.
- Respuesta visual a preguntas (VQA) y evaluación en el benchmark SEED.
- Conserva las capacidades del backbone Qwen3-VL-2B-Instruct, aunque la model card no las detalla explícitamente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Segmentación por referencia en herramientas de edición de imagen: el usuario describe un objeto ("el coche rojo a la izquierda") y el modelo devuelve la máscara correspondiente, útil para selección automática y recorte.
- Anotación automática de datasets de visión: generación de máscaras de segmentación a partir de descripciones textuales para acelerar el etiquetado en pipelines de datos.
- Asistentes visuales conversacionales: combinación de diálogo multi-turno con fundamentación visual para aplicaciones de accesibilidad o asistencia.
- Robótica y percepción: localización de objetos descritos en lenguaje natural dentro de escenas captadas por cámara.
- Moderación y análisis de contenido visual: identificación de regiones concretas descritas por texto en imágenes para revisión automatizada.
- Investigación en visión-lenguaje: modelo compacto de referencia para experimentar con segmentación condicionada por lenguaje en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados publicados en la model card (cIoU en validación salvo indicación):

| Modelo | RefCOCO val cIoU | RefCOCO+ val cIoU | RefCOCOg val cIoU | gRefCOCO val gIoU | GCG val AP50 | GCG val CIDEr | Multi-round val cIoU | SEED accuracy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| W2M-Qwen3-VL-2B | 81,9 | 75,6 | 79,5 | 77,1 | 31,8 | 44,6 | — | 74,2 |
| W2M-2B | 81,2 | 74,2 | 77,7 | 76,8 | 31,8 | 44,6 | 78,5 | 73,0 |
| W2M-InternVL3.5-2B | 80,2 | 73,5 | 76,6 | 76,8 | 27,9 | 36,0 | — | 73,4 |
| W2M-Qwen3-VL-8B | 82,9 | 78,0 | 80,8 | 79,0 | 32,3 | 44,8 | — | 77,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,2 GB en safetensors, lo que sugiere pesos en precisión mixta; en fp16 se estiman en torno a 4,3 GB solo para pesos, más memoria para el decodificador de segmentación y activaciones.
- GPU recomendadas: GPU con al menos 8-12 GB de VRAM para inferencia en fp16; tarjetas como RTX 3060/4060 Ti, RTX 4090, A100 o H100 son adecuadas.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM (no confirmado por el autor).
- Opciones de despliegue: no especificadas en la model card; al usar safetensors podría integrarse con frameworks compatibles con transformers, aunque no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | RefCOCO val cIoU | SEED accuracy | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| W2M-Qwen3-VL-2B | 2,17B | 81,9 | 74,2 | no disponible | Hugging Face (0 descargas) |
| W2M-2B | no disponible | 81,2 | 73,0 | no disponible | Hugging Face |
| W2M-InternVL3.5-2B | no disponible | 80,2 | 73,4 | no disponible | Hugging Face |
| W2M-Qwen3-VL-8B | no disponible | 82,9 | 77,0 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Licencia no declarada: no se especifican condiciones de uso comercial; es necesario contactar con el autor antes de usarlo en producción.
- Modelo con cero descargas y cero likes: sin validación por parte de la comunidad.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- Longitud de contexto no especificada, lo que dificulta planificar conversaciones multi-turno largas.
- Riesgo de alucinación y sesgos heredados del backbone Qwen3-VL-2B-Instruct y de los datos de entrenamiento, no documentados.
- La model card no detalla el dataset de entrenamiento ni los procesos de alineación, lo que limita la evaluación de riesgos.
- No se documentan métodos de cuantización ni soporte en frameworks de despliegue habituales, lo que puede complicar la integración en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyj155/W2M-Qwen3-VL-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- W2M-8B: https://huggingface.co/Gyj155/W2M-8B
- W2M-2B: https://huggingface.co/Gyj155/W2M-2B
- W2M-Sa2VA-InternVL3-8B: https://huggingface.co/Gyj155/W2M-Sa2VA-InternVL3-8B
- W2M-InternVL3.5-2B: https://huggingface.co/Gyj155/W2M-InternVL3.5-2B
- W2M-InternVL3.5-8B: https://huggingface.co/Gyj155/W2M-InternVL3.5-8B
- W2M-Qwen3-VL-8B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-8B
- W2M-Qwen3.5-2B: https://huggingface.co/Gyj155/W2M-Qwen3.5-2B
- W2M-Qwen3.5-9B: https://huggingface.co/Gyj155/W2M-Qwen3.5-9B
