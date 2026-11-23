# Gyj155/W2M-Qwen3.5-9B

## Resumen

W2M-Qwen3.5-9B es un modelo multimodal especializado en segmentación de imágenes condicionada por lenguaje, desarrollado por el usuario Gyj155. Parte del backbone de lenguaje Qwen3.5-9B (Qwen/Qwen3.5-9B) al que se le acopla un decodificador de segmentación condicionado por lenguaje, lo que permite generar máscaras de segmentación a partir de instrucciones en lenguaje natural, además de mantener capacidades de diálogo visual y respuesta a preguntas sobre imágenes.

El modelo se ha entrenado sobre 768.000 registros multimodales orientados a tres tareas: segmentación referencial (referring segmentation), diálogo fundamentado (grounded dialogue) y respuesta visual a preguntas (VQA). Con 9.450.450.417 parámetros totales y un repositorio de 21,1 GB en formato safetensors, se posiciona como la variante de mayor tamaño dentro de la familia W2M publicada por el mismo autor, que incluye versiones de 2B y 8B sobre distintos backbones (InternVL, Qwen3-VL y Qwen3.5).

Su relevancia radica en que combina un backbone de lenguaje de última generación con una cabeza de segmentación, ofreciendo resultados en RefCOCO, RefCOCO+, RefCOCOg, gRefCOCO, GCG y SEED que superan a las variantes más pequeñas de la misma familia. No obstante, la información pública disponible es escasa: la model card no detalla licencia, idiomas soportados ni composición exacta del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje Qwen3.5-9B con decodificador de segmentación condicionado por lenguaje (multimodal) |
| Parametros totales | 9.450.450.417 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura parte del backbone Qwen3.5-9B, un modelo de lenguaje de la familia Qwen 3.5, al que se añade un decodificador de segmentación condicionado por lenguaje. Este diseño sigue el patrón de los modelos de segmentación referencial multimodales: el backbone procesa la instrucción textual y la imagen, y el decodificador genera máscaras de segmentación alineadas con la referencia lingüística. La model card no especifica detalles sobre el tipo de atención, la longitud de contexto nativa ni innovaciones concretas como decodificación especulativa o atención lineal.

El entrenamiento se realizó sobre 768.000 registros multimodales que cubren segmentación referencial, diálogo fundamentado y VQA. No se detalla la composición exacta del dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se especifica si el backbone se mantuvo congelado o se ajustó durante el entrenamiento del decodificador.

## Capacidades

- Segmentación de imágenes condicionada por lenguaje natural (referring segmentation): genera máscaras a partir de descripciones textuales.
- Segmentación referencial en dominios específicos: resultados reportados en RefCOCO, RefCOCO+, RefCOCOg y gRefCOCO.
- Diálogo visual fundamentado (grounded dialogue): conversaciones multi-turno con referencias a regiones de la imagen.
- Respuesta visual a preguntas (VQA): evaluación reportada en SEED.
- Generación de texto y razonamiento heredados del backbone Qwen3.5-9B (no cuantificados en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio específicos: no disponible; el modelo es multimodal imagen-texto por su pipeline de segmentación.

## Casos de uso

- Segmentación referencial en herramientas de edición de imagen: el modelo recibe una instrucción como "selecciona el coche rojo aparcado a la derecha" y devuelve la máscara correspondiente, útil para flujos de retoque semiautomático.
- Anotación asistida de datasets de visión por computador: permite generar máscaras de segmentación a partir de descripciones textuales, acelerando el etiquetado en proyectos de detección y segmentación.
- Robótica y manipulación guiada por lenguaje: el modelo puede localizar objetos descritos en lenguaje natural dentro de la escena para que un brazo robótico los identifique y manipule.
- Análisis de imágenes médicas o industriales con instrucciones específicas: segmentación de regiones de interés descritas textualmente (p. ej., "la zona con mayor densidad"), siempre que el dominio esté cubierto por el entrenamiento.
- Asistentes de accesibilidad visual: descripción y localización de objetos en una imagen para usuarios con discapacidad visual, combinando VQA y segmentación.
- Diálogo visual interactivo en atención al cliente técnica: el usuario envía una foto de un producto o defecto y el modelo responde preguntas y localiza la zona relevante mediante segmentación.
- Sistemas de búsqueda visual por descripción: indexación y recuperación de regiones de imagen a partir de consultas en lenguaje natural.

## Benchmarks y rendimiento

Resultados publicados en la model card (cIoU en val para RefCOCO/RefCOCO+/RefCOCOg y Multi-round; gIoU en gRefCOCO; AP50 y CIDEr en GCG; accuracy en SEED):

| Modelo | RefCOCO val cIoU | RefCOCO+ val cIoU | RefCOCOg val cIoU | gRefCOCO val gIoU | GCG val AP50 | GCG val CIDEr | Multi-round val cIoU | SEED accuracy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| W2M-Qwen3.5-9B | 83,7 | 80,3 | 81,7 | 80,0 | 34,4 | 50,2 | — | 78,4 |
| W2M-Qwen3-VL-8B | 82,9 | 78,0 | 80,8 | 79,0 | 32,3 | 44,8 | — | 77,0 |
| W2M-8B | 82,8 | 77,3 | 80,0 | 78,8 | 32,4 | 48,5 | 80,6 | 75,6 |
| W2M-Sa2VA-InternVL3-8B | 83,4 | 78,3 | 81,2 | 78,6 | 35,0 | 50,3 | — | 75,2 |
| W2M-Qwen3.5-2B | 82,8 | 78,0 | 80,7 | 79,5 | 33,2 | 45,9 | — | 74,6 |
| W2M-InternVL3.5-8B | 81,3 | 75,5 | 78,5 | 77,7 | 26,1 | 32,9 | — | 75,0 |
| W2M-Qwen3-VL-2B | 81,9 | 75,6 | 79,5 | 77,1 | 31,8 | 44,6 | — | 74,2 |
| W2M-InternVL3.5-2B | 80,2 | 73,5 | 76,6 | 76,8 | 27,9 | 36,0 | — | 73,4 |
| W2M-2B | 81,2 | 74,2 | 77,7 | 76,8 | 31,8 | 44,6 | 78,5 | 73,0 |

W2M-Qwen3.5-9B obtiene el mejor resultado de la familia en RefCOCO (83,7), RefCOCO+ (80,3), RefCOCOg (81,7), gRefCOCO (80,0), GCG AP50 (34,4) y SEED (78,4). En GCG CIDEr (50,2) queda ligeramente por debajo de W2M-Sa2VA-InternVL3-8B (50,3). La columna Multi-round no reporta valor para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,45 mil millones de parámetros en safetensors (21,1 GB en fp16/bf16), se requiere aproximadamente 19-21 GB de VRAM solo para los pesos en precisión nativa; en cuantización de 8 bits bajaría a unos 10-11 GB y en 4 bits a unos 5-6 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX A6000 para inferencia en precisión nativa sin cuantizar. Una RTX 4090 (24 GB) podría alojar los pesos en bf16, pero el margen para el decodificador de segmentación y las activaciones es ajustado.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con margen limitado; en RTX 3090 (24 GB) de forma similar. En GPUs de 16 GB o menos sería necesario cuantizar, sin que se hayan publicado pesos cuantizados.
- Opciones de despliegue: no se especifican en la model card. Al tratarse de un modelo multimodal con decodificador de segmentación personalizado, es probable que requiera el código del autor en lugar de frameworks genéricos como vLLM o llama.cpp, pero esto no está confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | RefCOCO val cIoU | SEED accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| W2M-Qwen3.5-9B | 9,45 B | no disponible | 83,7 | 78,4 | no disponible | Hugging Face (0 descargas) |
| W2M-Qwen3-VL-8B | ~8 B | no disponible | 82,9 | 77,0 | no disponible | Hugging Face |
| W2M-Sa2VA-InternVL3-8B | ~8 B | no disponible | 83,4 | 75,2 | no disponible | Hugging Face |
| W2M-8B | ~8 B | no disponible | 82,8 | 75,6 | no disponible | Hugging Face |

Dentro de la misma familia W2M, el modelo de 9B sobre Qwen3.5 lidera en la mayoría de métricas de segmentación referencial y VQA, con una ventaja de 0,3-0,8 puntos en cIoU frente a las variantes de 8B y de 1,4 puntos en SEED frente a W2M-Qwen3-VL-8B. La comparación con modelos de segmentación referencial de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo, lo que impide confirmar si se permite uso comercial. Es un riesgo importante para producción.
- Idiomas no declarados: la model card no detalla los idiomas soportados, por lo que el rendimiento en castellano o en idiomas distintos del inglés no está garantizado.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que dificulta planificar aplicaciones con diálogos largos o imágenes de alta resolución.
- Sesgos: no se documentan sesgos conocidos; al entrenarse sobre 768.000 registros multimodales no descritos, pueden heredar sesgos de esos datos y del backbone Qwen3.5-9B.
- Riesgo de alucinación: como modelo generativo multimodal, puede producir descripciones o máscaras incorrectas cuando la referencia lingüística es ambigua o el objeto no está presente en la imagen.
- Sin cuantizaciones oficiales publicadas: no hay pesos GGUF, AWQ ni GPTQ disponibles, lo que limita el despliegue en hardware de consumo.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-23) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.
- Dependencia de código personalizado: al incluir un decodificador de segmentación propio, probablemente no funcione con pipelines estándar de transformers sin el código del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyj155/W2M-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- W2M-8B: https://huggingface.co/Gyj155/W2M-8B
- W2M-2B: https://huggingface.co/Gyj155/W2M-2B
- W2M-Sa2VA-InternVL3-8B: https://huggingface.co/Gyj155/W2M-Sa2VA-InternVL3-8B
- W2M-InternVL3.5-2B: https://huggingface.co/Gyj155/W2M-InternVL3.5-2B
- W2M-InternVL3.5-8B: https://huggingface.co/Gyj155/W2M-InternVL3.5-8B
- W2M-Qwen3-VL-2B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-2B
- W2M-Qwen3-VL-8B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-8B
- W2M-Qwen3.5-2B: https://huggingface.co/Gyj155/W2M-Qwen3.5-2B
