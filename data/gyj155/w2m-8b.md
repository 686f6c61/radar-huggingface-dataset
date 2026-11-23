# Gyj155/W2M-8B

## Resumen

W2M-8B es un modelo multimodal desarrollado por el usuario Gyj155 que combina el backbone de InternVL3-8B con un decodificador de segmentación condicionado por lenguaje. Su tarea principal es la segmentación referida (*referring segmentation*): dado un texto descriptivo y una imagen, el modelo genera la máscara de la región descrita. Además, conserva capacidades de diálogo visual y respuesta a preguntas sobre imágenes, lo que lo sitúa como un modelo unificado para tareas de visión-lenguaje con salida densa.

El modelo cuenta con 7.984.351.745 parámetros (aproximadamente 8B) almacenados en formato safetensors, con un repositorio de 17,2 GB. Se entrenó sobre 768.000 registros multimodales que cubren segmentación referida, diálogo fundamentado en imagen y VQA. Su pipeline declarado en Hugging Face es `image-segmentation`, aunque sus capacidades van más allá de la segmentación pura.

La relevancia de este modelo radica en su enfoque de unificar comprensión visual y segmentación en un único modelo de ~8B, compitiendo con variantes de la misma familia (W2M-2B, W2M-Qwen3-VL-8B, W2M-InternVL3.5-8B) y con modelos especializados de segmentación referida. No obstante, se trata de un modelo con escasa tracción pública (0 descargas, 0 likes en el momento de la consulta) y con información de licencia e idiomas no declarada, lo que limita su adopción en producción sin verificación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal: backbone InternVL3-8B + decodificador de segmentación condicionado por lenguaje |
| Parametros totales | 7.984.351.745 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

W2M-8B parte del backbone OpenGVLab/InternVL3-8B, un modelo visión-lenguaje de tipo transformer que combina un codificador visual con un modelo de lenguaje. Sobre ese backbone, el autor añade un decodificador de segmentación condicionado por lenguaje que produce máscaras a partir de la representación conjunta de imagen y texto. El resultado es un modelo que conserva las capacidades conversacionales y de VQA de InternVL3-8B y añade una salida densa de segmentación.

El entrenamiento se realizó sobre 768.000 registros multimodales orientados a tres tareas: segmentación referida (*referring segmentation*), diálogo fundamentado (*grounded dialogue*) y VQA visual. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El tamaño del repositorio (17,2 GB) es coherente con pesos en precisión bf16/fp16 para ~8B parámetros más los componentes del decodificador de segmentación.

## Capacidades

- Segmentación referida: genera máscaras de región a partir de descripciones en lenguaje natural (RefCOCO, RefCOCO+, RefCOCOg, gRefCOCO).
- Segmentación conversacional multi-turno: soporta diálogos donde el usuario refina la región objetivo a lo largo de varios turnos (evaluado en el benchmark Multi-round).
- Segmentación fundamentada en descripciones largas (*grounded captioning*): produce máscaras asociadas a frases o descripciones extensas (GCG).
- Respuesta a preguntas visuales (VQA) y diálogo visual, heredadas del backbone InternVL3-8B.
- Capacidades de comprensión visual general: reconocimiento de objetos, escenas y atributos presentes en la imagen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Edición de imágenes asistida por texto: el usuario describe la región a modificar ("la camiseta del hombre de la izquierda") y el modelo devuelve la máscara exacta, que se usa como entrada para herramientas de inpainting o retoque. Adecuado por su cIoU de 82,8 en RefCOCO val.
- Anotación automática de datasets de visión: generación de máscaras de segmentación a partir de descripciones textuales para acelerar el etiquetado en pipelines de datos, reduciendo el coste de anotación manual.
- Robótica y manipulación guiada por lenguaje: localización de objetos descritos verbalmente ("coge la taza roja junto al portátil") para generar máscaras que alimenten módulos de agarre o navegación.
- Análisis médico o industrial asistido: segmentación de regiones descritas por un especialista ("la lesión en el cuadrante superior derecho") en imágenes donde el etiquetado denso es costoso, siempre que se valide el dominio.
- Interfaces de accesibilidad: permitir a usuarios describir verbalmente una región de una imagen para resaltarla o ampliarla, con diálogo multi-turno para refinar la selección (cIoU de 80,6 en Multi-round val).
- Moderación y análisis de contenido visual: localización de elementos descritos en imágenes para revisión (por ejemplo, "el logotipo de la marca en la camiseta") combinando segmentación y VQA.
- Asistentes visuales conversacionales: combinación de VQA y segmentación en un mismo modelo para responder preguntas y señalar regiones relevantes en la imagen dentro de una misma conversación.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (cIoU/gIoU/AP50/CIDEr/accuracy según el benchmark):

| Modelo | RefCOCO val cIoU | RefCOCO+ val cIoU | RefCOCOg val cIoU | gRefCOCO val gIoU | GCG val AP50 | GCG val CIDEr | Multi-round val cIoU | SEED accuracy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| W2M-8B | 82,8 | 77,3 | 80,0 | 78,8 | 32,4 | 48,5 | 80,6 | 75,6 |
| W2M-2B | 81,2 | 74,2 | 77,7 | 76,8 | 31,8 | 44,6 | 78,5 | 73,0 |
| W2M-Sa2VA-InternVL3-8B | 83,4 | 78,3 | 81,2 | 78,6 | 35,0 | 50,3 | — | 75,2 |
| W2M-InternVL3.5-2B | 80,2 | 73,5 | 76,6 | 76,8 | 27,9 | 36,0 | — | 73,4 |
| W2M-InternVL3.5-8B | 81,3 | 75,5 | 78,5 | 77,7 | 26,1 | 32,9 | — | 75,0 |
| W2M-Qwen3-VL-2B | 81,9 | 75,6 | 79,5 | 77,1 | 31,8 | 44,6 | — | 74,2 |
| W2M-Qwen3-VL-8B | 82,9 | 78,0 | 80,8 | 79,0 | 32,3 | 44,8 | — | 77,0 |
| W2M-Qwen3.5-2B | 82,8 | 78,0 | 80,7 | 79,5 | 33,2 | 45,9 | — | 74,6 |
| W2M-Qwen3.5-9B | 83,7 | 80,3 | 81,7 | 80,0 | 34,4 | 50,2 | — | 78,4 |

No se han publicado en la información disponible resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB solo para pesos, más memoria para el codificador visual, el decodificador de segmentación y las activaciones; en la práctica se recomienda un mínimo de 24 GB para imágenes de resolución moderada.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 5-6 GB, aunque los tipos de cuantización soportados no están documentados.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; RTX 4090 (24 GB) viable en bf16 con lote pequeño.
- GPU de consumo: RTX 3090/4090 (24 GB) pueden ejecutar el modelo en bf16 con imágenes de resolución limitada; tarjetas de 16 GB requerirían cuantización.
- Opciones de despliegue: no se documentan en la información disponible; al estar basado en InternVL3-8B, es probable la compatibilidad con frameworks de la familia InternVL, pero debe verificarse. vLLM, TGI o llama.cpp no están confirmados para este modelo concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | RefCOCO val cIoU | RefCOCO+ val cIoU | RefCOCOg val cIoU | SEED accuracy | Licencia |
|---|---:|---:|---:|---:|---:|---|
| W2M-8B | ~8B | 82,8 | 77,3 | 80,0 | 75,6 | no disponible |
| W2M-Qwen3-VL-8B | ~8B | 82,9 | 78,0 | 80,8 | 77,0 | no disponible |
| W2M-Qwen3.5-9B | ~9B | 83,7 | 80,3 | 81,7 | 78,4 | no disponible |
| W2M-Sa2VA-InternVL3-8B | ~8B | 83,4 | 78,3 | 81,2 | 75,2 | no disponible |
| W2M-InternVL3.5-8B | ~8B | 81,3 | 75,5 | 78,5 | 75,0 | no disponible |

Todos los comparables pertenecen a la misma familia W2M del mismo autor, por lo que la comparación es interna. No se dispone de datos de modelos externos de segmentación referida (por ejemplo, LISA, GLaMM o Sa2VA original) en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin contactar con el autor; la ausencia de licencia explícita es un riesgo legal relevante.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano u otros idiomas distintos del inglés, que es el idioma dominante en los benchmarks de segmentación referida.
- Tracción pública nula (0 descargas, 0 likes): no hay evidencia de validación por parte de la comunidad ni de reportes independientes de calidad.
- Riesgo de alucinación y de máscaras incorrectas en escenas con objetos ambiguos o descripciones poco específicas; los valores de GCG AP50 (32,4) sugieren margen de mejora en descripciones largas.
- Longitud de contexto no documentada: limita la planificación en aplicaciones con diálogos muy largos o imágenes de alta resolución.
- Sin datos sobre sesgos: no se ha publicado ningún análisis de sesgo demográfico, cultural o de dominio.
- Dependencia del backbone InternVL3-8B: hereda sus limitaciones de comprensión visual y de conocimiento.
- Modelo de investigación con fecha de creación futura respecto a los estándares habituales (2026-11-23), lo que sugiere que puede tratarse de un checkpoint reciente sin maduración.
- No hay información sobre tool calling ni soporte de agentes, lo que limita su integración en pipelines automatizados complejos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gyj155/W2M-8B
- Modelo base: https://huggingface.co/OpenGVLab/InternVL3-8B
- Variante W2M-2B: https://huggingface.co/Gyj155/W2M-2B
- Variante W2M-Sa2VA-InternVL3-8B: https://huggingface.co/Gyj155/W2M-Sa2VA-InternVL3-8B
- Variante W2M-InternVL3.5-2B: https://huggingface.co/Gyj155/W2M-InternVL3.5-2B
- Variante W2M-InternVL3.5-8B: https://huggingface.co/Gyj155/W2M-InternVL3.5-8B
- Variante W2M-Qwen3-VL-2B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-2B
- Variante W2M-Qwen3-VL-8B: https://huggingface.co/Gyj155/W2M-Qwen3-VL-8B
- Variante W2M-Qwen3.5-2B: https://huggingface.co/Gyj155/W2M-Qwen3.5-2B
- Variante W2M-Qwen3.5-9B: https://huggingface.co/Gyj155/W2M-Qwen3.5-9B
