# Gyj155/W2M-2B

## Resumen

W2M-2B es un modelo multimodal de segmentación de imágenes condicionada por lenguaje, desarrollado por el usuario Gyj155. Se construye sobre el backbone OpenGVLab/InternVL3-2B, al que se le acopla un decodificador de segmentación condicionado por texto. El modelo resuelve tareas de referring segmentation (segmentar la región descrita por una expresión lingüística), diálogo con grounding visual y respuesta a preguntas visuales, unificando comprensión y localización espacial en un único modelo de 2.126.825.985 parámetros.

El modelo se ha entrenado sobre 768.000 registros multimodales y forma parte de una familia más amplia (W2M-8B, W2M-Sa2VA-InternVL3-8B, variantes sobre Qwen3-VL y Qwen3.5) que comparte arquitectura y protocolo de evaluación. Su relevancia radica en ofrecer capacidades de segmentación grounded con un tamaño compacto de 2B parámetros, lo que lo sitúa en el rango desplegable en GPU de consumo, y en publicar métricas sobre RefCOCO, RefCOCO+, RefCOCOg, gRefCOCO, GCG, multi-round y SEED que permiten compararlo directamente con sus hermanos mayores.

La licencia y los idiomas soportados no están declarados en la información disponible, lo que constituye una limitación importante para su adopción en producción. El repositorio ocupa 4,8 GB y los pesos se distribuyen en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone InternVL3-2B) con decodificador de segmentación condicionado por lenguaje |
| Parametros totales | 2.126.825.985 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

W2M-2B sigue un esquema de dos componentes: el backbone visual-lenguaje InternVL3-2B, que aporta la codificación conjunta de imagen y texto, y un decodificador de segmentación condicionado por lenguaje que produce máscaras a partir de la representación multimodal. El pipeline declarado en Hugging Face es image-segmentation, y las etiquetas del repositorio confirman la naturaleza multimodal (w2m, multimodal). No se detalla en la información disponible el tipo exacto de atención, la longitud de contexto del backbone ni si se emplearon técnicas como decodificación especulativa o atención lineal.

El entrenamiento se realizó sobre 768.000 registros multimodales orientados a referring segmentation, diálogo con grounding y VQA visual. No se especifica en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO. La evaluación publicada cubre tareas de segmentación referencial (RefCOCO, RefCOCO+, RefCOCOg), segmentación grounded generalizada (gRefCOCO), generación de captioning grounded (GCG con AP50 y CIDEr), segmentación multi-turno y precisión en SEED, lo que sugiere un entrenamiento multiobjetivo que combina localización y generación.

## Capacidades

- Referring segmentation: genera máscaras de segmentación a partir de expresiones en lenguaje natural (evaluado en RefCOCO, RefCOCO+ y RefCOCOg).
- Segmentación grounded generalizada: localiza objetos descritos por texto en escenarios abiertos (gRefCOCO, GCG).
- Diálogo visual con grounding: mantiene conversaciones multi-turno en las que las respuestas se anclan a regiones de la imagen (métrica multi-round cIoU de 78,5).
- Respuesta a preguntas visuales (VQA): capacidad evaluada mediante la métrica SEED accuracy (73,0).
- Generación de captioning grounded: produce descripciones textuales asociadas a regiones (GCG CIDEr de 44,6).
- Comprensión multimodal conjunta imagen-texto heredada del backbone InternVL3-2B.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio adicional: no disponible en la información proporcionada.

## Casos de uso

- Anotación automática de datasets de segmentación: el modelo puede generar máscaras a partir de descripciones textuales (por ejemplo, "el coche rojo aparcado a la izquierda") para preetiquetar imágenes en pipelines de anotación, reduciendo el coste manual gracias a su cIoU de 81,2 en RefCOCO val.
- Edición de imágenes asistida por lenguaje: integrado en herramientas de retoque, permite seleccionar regiones mediante instrucciones en lenguaje natural y aplicar operaciones (borrado, recoloreado, sustitución) sobre la máscara resultante.
- Robótica e interacción físico-digital: un agente puede referirse a objetos del entorno mediante descripciones ("la taza junto al portátil") y obtener su máscara para guiar la manipulación, apoyándose en la segmentación grounded generalizada (gRefCOCO gIoU de 76,8).
- Asistentes de accesibilidad visual: descripción y localización de objetos para personas con discapacidad visual, combinando VQA (SEED 73,0) con segmentación para señalar la ubicación del objeto descrito.
- Moderación y análisis de contenido visual: localización de elementos concretos en imágenes (logotipos, rostros, objetos prohibidos) descritos mediante texto, con capacidad de diálogo multi-turno para refinar la consulta.
- Sistemas de búsqueda visual conversacional: el usuario describe lo que busca en varias iteraciones y el modelo devuelve las regiones correspondientes, aprovechando la métrica multi-round (cIoU de 78,5) para mantener coherencia entre turnos.
- Investigación en visión-lenguaje: modelo de referencia compacto (2B) para experimentos de grounding y segmentación referencial, con métricas publicadas frente a variantes de 8B y 9B que permiten estudiar el escalado.

## Benchmarks y rendimiento

Datos publicados en la model card del autor (cIoU = IoU acumulada; gIoU = IoU generalizada; AP50 y CIDEr para GCG; accuracy para SEED). El guion indica "no disponible".

| Modelo | RefCOCO val cIoU | RefCOCO+ val cIoU | RefCOCOg val cIoU | gRefCOCO val gIoU | GCG val AP50 | GCG val CIDEr | Multi-round val cIoU | SEED accuracy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| W2M-8B | 82,8 | 77,3 | 80,0 | 78,8 | 32,4 | 48,5 | 80,6 | 75,6 |
| **W2M-2B** | **81,2** | **74,2** | **77,7** | **76,8** | **31,8** | **44,6** | **78,5** | **73,0** |
| W2M-Sa2VA-InternVL3-8B | 83,4 | 78,3 | 81,2 | 78,6 | 35,0 | 50,3 | — | 75,2 |
| W2M-InternVL3.5-2B | 80,2 | 73,5 | 76,6 | 76,8 | 27,9 | 36,0 | — | 73,4 |
| W2M-InternVL3.5-8B | 81,3 | 75,5 | 78,5 | 77,7 | 26,1 | 32,9 | — | 75,0 |
| W2M-Qwen3-VL-2B | 81,9 | 75,6 | 79,5 | 77,1 | 31,8 | 44,6 | — | 74,2 |
| W2M-Qwen3-VL-8B | 82,9 | 78,0 | 80,8 | 79,0 | 32,3 | 44,8 | — | 77,0 |
| W2M-Qwen3.5-2B | 82,8 | 78,0 | 80,7 | 79,5 | 33,2 | 45,9 | — | 74,6 |
| W2M-Qwen3.5-9B | 83,7 | 80,3 | 81,7 | 80,0 | 34,4 | 50,2 | — | 78,4 |

W2M-2B supera a W2M-InternVL3.5-2B en todas las métricas reportadas y queda por debajo de W2M-Qwen3-VL-2B y W2M-Qwen3.5-2B en RefCOCO+ y RefCOCOg, aunque mantiene una diferencia contenida (inferior a 1,5 puntos de cIoU) pese a ser un modelo de menor tamaño que las variantes de 8B y 9B.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan aproximadamente 4,8 GB (2,13B parámetros en precisión de 16 bits). En FP16 se requieren en torno a 5-6 GB de VRAM; en cuantizaciones de 8 bits o 4 bits (si se generan, no publicadas) podría reducirse a 2,5-4 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: para FP16, una NVIDIA RTX 3060 de 12 GB o superior es suficiente; una RTX 4090 (24 GB) o A100/H100 ofrecen margen holgado para lotes mayores y mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en FP16; con cuantización a 4 bits podría caber en GPUs de 4-6 GB, aunque dicha cuantización no está publicada.
- Opciones de despliegue: al ser un modelo multimodal con decodificador de segmentación propio, no se garantiza compatibilidad directa con vLLM, llama.cpp u Ollama; el despliegue más realista es mediante transformers con los scripts del autor (no documentados en la información disponible) o servidores de inferencia personalizados. TGI no está confirmado.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RefCOCO val cIoU | RefCOCOg val cIoU | SEED accuracy | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---|---|
| W2M-2B | 2,13B | no disponible | 81,2 | 77,7 | 73,0 | no disponible | Hugging Face (0 descargas) |
| W2M-8B | no disponible | no disponible | 82,8 | 80,0 | 75,6 | no disponible | Hugging Face |
| W2M-Qwen3-VL-2B | no disponible | no disponible | 81,9 | 79,5 | 74,2 | no disponible | Hugging Face |
| W2M-InternVL3.5-2B | no disponible | no disponible | 80,2 | 76,6 | 73,4 | no disponible | Hugging Face |

Frente a W2M-8B, el modelo de 2B pierde entre 1,6 y 2,6 puntos de cIoU en RefCOCO y RefCOCOg, y 2,6 puntos en SEED, a cambio de un tamaño cuatro veces menor. Frente a W2M-Qwen3-VL-2B, queda 0,7 puntos por debajo en RefCOCO, 1,8 en RefCOCOg y 1,2 en SEED. Frente a W2M-InternVL3.5-2B, lo supera en todas las métricas reportadas (hasta 1,1 puntos en RefCOCO y 1,1 en RefCOCOg). No hay datos de latencia ni de throughput para establecer comparaciones de eficiencia.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución. Es un bloqueo potencial para producción.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o en idiomas distintos del inglés; las evaluaciones publicadas no especifican el idioma de las expresiones.
- Longitud de contexto no documentada: no se puede garantizar el rendimiento en diálogos multi-turno largos ni con imágenes de alta resolución.
- Riesgo de alucinación: como modelo generativo multimodal, puede producir descripciones o máscaras para objetos inexistentes, especialmente en escenas ambiguas o con expresiones poco específicas.
- Sesgos conocidos: no se documentan análisis de sesgo; al entrenarse sobre 768.000 registros multimodales no descritos, el modelo puede heredar sesgos de ese corpus y del backbone InternVL3-2B.
- Sin cuantizaciones publicadas: no hay versiones GGUF, AWQ o GPTQ, lo que limita el despliegue en hardware modesto y en runtimes como llama.cpp u Ollama.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide el comportamiento fuera de las métricas del autor.
- Compatibilidad de despliegue incierta: el decodificador de segmentación propio requiere código específico; no se garantiza integración con servidores de inferencia estándar.
- Fecha de creación futura en los metadatos (2026-11-23): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyj155/W2M-2B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-2B
- W2M-8B: https://huggingface.co/Gyj155/W2M-8B
- W2M-Sa2VA-InternVL3-8B: https://huggingface.co/Gyj155/W2M-Sa2VA-InternVL3-8B
- W2M-InternVL3.5-2B: https://huggingface.co/Gyj155/W2M-InternVL3.5-2B
- W2M-InternVL3.5-8B: https://huggingface.co/Gyj155/W2M-InternVL3.5-8B
- W2M-Qwen3-VL-2B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-2B
- W2M-Qwen3-VL-8B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-8B
- W2M-Qwen3.5-2B: https://huggingface.co/Gyj155/W2M-Qwen3.5-2B
- W2M-Qwen3.5-9B: https://huggingface.co/Gyj155/W2M-Qwen3.5-9B
