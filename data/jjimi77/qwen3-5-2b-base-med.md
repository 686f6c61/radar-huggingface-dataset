# jjimi77/Qwen3.5-2B-Base-MED

## Resumen

`jjimi77/Qwen3.5-2B-Base-MED` es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario jjimi77. A partir del identificador y de las etiquetas del repositorio, se trata de un ajuste fino (SFT, mediante la librería TRL) sobre una base de la familia Qwen3.5 con aproximadamente 2.213 millones de parámetros (2,2 B). El sufijo "MED" sugiere una especialización en dominio médico, aunque la model card no lo confirma explícitamente.

El modelo se distribuye en formato safetensors con pesos en transformers y un tamaño de repositorio de 4,4 GB, lo que es coherente con pesos en precisión de 16 bits para 2,2 B de parámetros más el codificador visual. La etiqueta `qwen3_5` y la pipeline `image-text-to-text` indican que acepta entradas de imagen y texto y genera texto.

La relevancia de esta ficha es limitada pero real: se trata de un modelo pequeño, multimodal y potencialmente ajustado para aplicaciones clínicas o de documentación médica, desplegable en hardware de consumo. No obstante, la información publicada por el autor es prácticamente inexistente (model card autogenerada sin rellenar), por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles no disponibles |
| Parámetros totales | 2.213.241.664 (2,2 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 4,4 GB |
| Pipeline | image-text-to-text |
| Librería | transformers |

## Arquitectura y entrenamiento

La información disponible no permite describir la arquitectura con detalle. Las etiquetas del repositorio (`qwen3_5`, `image-text-to-text`) apuntan a un transformer multimodal de la familia Qwen3.5, con un codificador visual y un decodificador de lenguaje, pero no se especifica el número de capas, dimensiones ocultas, mecanismo de atención ni la configuración del componente visual. Tampoco se documenta si emplea atención lineal, decodificación especulativa u otras optimizaciones.

Respecto al entrenamiento, la única información fiable es la etiqueta `trl` y `sft`, que indica que el modelo se ha sometido a un ajuste supervisado (supervised fine-tuning) con la librería TRL de Hugging Face. No se publican datos sobre el conjunto de entrenamiento, número de tokens, composición del dataset, uso de RLHF/DPO ni hiperparámetros. El sufijo "MED" sugiere un corpus de dominio médico, pero es una inferencia no confirmada por el autor. La model card es la plantilla autogenerada por Hugging Face y no contiene ningún campo rellenado.

## Capacidades

- Generación de texto condicionada por imagen y texto (pipeline image-text-to-text).
- Procesamiento de entradas multimodales: el modelo puede recibir una o varias imágenes junto con una instrucción textual.
- Conversación multi-turno: la etiqueta `conversational` indica soporte de formato de chat.
- Ajuste específico de dominio: el sufijo "MED" sugiere especialización médica, sin confirmación documental.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia en documentación clínica: el modelo podría transcribir o resumir informes a partir de imágenes de documentos médicos (analíticas, informes escaneados) y texto asociado, aprovechando su naturaleza multimodal y su ajuste SFT. Requiere validación previa, dado que no hay evaluación publicada.
- Interpretación preliminar de imágenes médicas simples: para tareas de apoyo (por ejemplo, descripción de hallazgos visibles en una radiografía o una fotografía clínica) en entornos de formación o triaje no crítico, siempre con supervisión humana.
- Extracción de información de recetas y etiquetas de medicamentos: el modelo puede procesar la imagen de un envase o receta y devolver texto estructurado, integrándose en un pipeline de digitalización.
- Chatbot de educación sanitaria para pacientes: conversaciones multi-turno sobre síntomas generales o terminología médica, con el modelo actuando como primer nivel de orientación y derivando a profesionales.
- Preprocesado en pipelines de datos clínicos: uso del modelo para generar descripciones textuales de imágenes que alimenten un sistema de búsqueda o indexación documental en un hospital o aseguradora.
- Prototipado rápido en hardware de consumo: con 2,2 B de parámetros, el modelo cabe en GPUs de gama media y permite iterar sobre casos de uso médicos multimodales sin infraestructura dedicada.
- Filtrado y clasificación de contenido visual sanitario: etiquetado de imágenes en conjuntos de datos médicos para su posterior curación o anonimización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 4,5-5 GB solo para pesos, más overhead de activaciones y del codificador visual; en la práctica, entre 6 y 8 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5-3 GB de pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,5-2 GB de pesos (si se generan cuantizaciones, actualmente no publicadas).
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB o superiores en fp16; en 4 bits cabría en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (soporte nativo), vLLM y TGI si la arquitectura Qwen3.5 multimodal está soportada por esas herramientas; llama.cpp/Ollama solo si se publican conversiones GGUF, que actualmente no existen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jjimi77/Qwen3.5-2B-Base-MED | 2,2 B | no disponible | imagen + texto → texto | no disponible | Hugging Face (0 descargas) |
| Qwen2-VL-2B-Instruct | ~2,2 B | 32 K (aprox., según documentación pública de Qwen) | imagen + texto → texto | Apache 2.0 (según Qwen) | Hugging Face, ampliamente adoptado |
| SmolVLM-2B | ~2,2 B | no disponible en esta ficha | imagen + texto → texto | Apache 2.0 (según HuggingFaceTB) | Hugging Face |
| PaliGemma-3B | ~3 B | no disponible en esta ficha | imagen + texto → texto | Gemma Terms of Use | Hugging Face |

La comparación se basa en categoría y tamaño; los datos de los modelos alternativos provienen de su documentación pública y pueden variar. El modelo de esta ficha no ofrece benchmarks ni licencia clara, lo que limita la comparación objetiva.

## Limitaciones y advertencias

- Model card sin contenido: todos los campos están sin rellenar ("More Information Needed"), incluidos desarrollador, licencia, datos de entrenamiento y evaluación.
- Licencia no disponible: no se puede garantizar el uso comercial; es imprescindible contactar con el autor o asumir que no hay permiso explícito.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas médicas ni generales; cualquier uso en producción requiere evaluación propia.
- Riesgo de alucinación: especialmente crítico en dominio médico, donde una respuesta incorrecta puede causar daño; se requiere supervisión humana obligatoria.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no se pueden evaluar sesgos demográficos, clínicos o culturales.
- Idiomas no declarados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Contexto no especificado: se desconoce la ventana máxima, lo que impide planificar casos de uso con documentos largos.
- Cero descargas y cero likes: modelo sin validación por la comunidad; no hay reportes de terceros sobre su comportamiento.
- Fecha de creación futura (2026-11-11): metadato anómalo que sugiere posible error de publicación o repositorio de prueba.
- Uso clínico: no debe emplearse como dispositivo médico ni para diagnóstico sin certificación regulatoria (MDR en la UE, FDA en EE. UU.).

## Enlaces

- Hugging Face: https://huggingface.co/jjimi77/Qwen3.5-2B-Base-MED
- Paper de referencia citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ML: https://mlco2.github.io/impact
- Librería TRL: https://github.com/huggingface/trl
- Documentación de transformers: https://huggingface.co/docs/transformers
