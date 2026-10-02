# pbcong/tars-paper-reconstruction-7b-mask-s42-ep2

## Resumen
TARS paper 7b es un checkpoint de ajuste fino completo de 7.062.902.784 parámetros, desarrollado por el usuario pbcong a partir de liuhaotian/llava-v1.5-7b. Se distribuye en formato LLaVA original y está orientado a tareas de reconstrucción de artículos científicos, según el nombre y la model card. La arquitectura declarada mediante tags es llava_llama, por lo que se trata de un transformer multimodal visión-lenguaje con backbone LLaMA.

El modelo aborda, en principio, la generación de contenido científico a partir de figuras, tablas y contexto textual, un problema relevante para la evaluación de agentes de escritura científica y para la reproducción de experimentos tipo Paper Reconstruction Evaluation. No obstante, el autor advierte de que los perfiles de paper son reconstrucciones con supuestos documentados, no checkpoints de autor, y que los benchmarks medidos están pendientes.

El repositorio ocupa 14,1 GB y no incluye información sobre licencia, idiomas, contexto o cuantizaciones. La carga debe realizarse con el loader TARS/LLaVA fijado, no con un loader LoRA de HuggingFace.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA (transformer multimodal visión-lenguaje) con backbone LLaMA; tag llava_llama |
| Parámetros totales | 7.062.902.784 |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | liuhaotian/llava-v1.5-7b |
| Tamaño del repositorio | 14,1 GB |
| Descargas | 0 |
| Likes | 0 |
| Pipeline | no disponible |
| Fecha de creación | 2026-10-01 |

## Arquitectura y entrenamiento
El modelo se basa en LLaVA v1.5 7B, un transformer multimodal que combina un codificador visual con un backbone LLaMA para tareas de instrucción visual. El tag llava_llama confirma esta familia arquitectónica. El checkpoint corresponde a un full fine-tuning de la época 2, en formato LLaVA original, por lo que conserva la estructura de pesos del modelo base y no es un adaptador LoRA.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales. La model card indica que los ajustes de entrenamiento y revisiones están en reproduction.json, y que los benchmarks medidos están pendientes. El autor también advierte de que los perfiles de paper son reconstrucciones con supuestos documentados, no checkpoints de autor.

## Capacidades
- Generación de texto y comprensión de imágenes: capacidad esperada por herencia de LLaVA v1.5 7B; no verificada en esta ficha.
- Reconstrucción de artículos científicos: generación de secciones o perfiles de paper a partir de entradas multimodales, según el nombre del modelo y la model card.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-step: no documentado.
- Capacidades multilingües: no disponible.
- Capacidades especiales: visión probable por la base LLaVA; modo thinking, audio u otras no documentadas.
- Carga específica: requiere loader TARS/LLaVA fijado; no usar loader LoRA de HuggingFace.

## Casos de uso
- Reconstrucción de artículos científicos: dado un conjunto de figuras, tablas y resultados, usar el modelo para generar un borrador de secciones como introducción, método o resultados. Es el caso de uso declarado por el nombre y la model card.
- Asistente multimodal de redacción académica: procesar PDFs con imágenes y generar descripciones de figuras integradas en un manuscrito. La base LLaVA permite combinar visión y lenguaje.
- Evaluación de alucinaciones en escritura científica: emplear el checkpoint como generador dentro de pipelines tipo PaperRecon para medir presentación y fidelidad respecto a fuentes originales.
- Generación de material docente: a partir de figuras de artículos, producir explicaciones, resúmenes y preguntas de comprensión para clases o cursos.
- Prototipado de agentes de revisión de literatura: extraer información de figuras y tablas de papers y resumir hallazgos en informes estructurados.
- Fine-tuning adicional para dominios concretos: al ser un full fine-tune de 7B en formato LLaVA, se puede continuar el entrenamiento con datos propios de un área científica.
- Automatización de informes técnicos con figuras: generar informes internos que combinen gráficos y texto técnico, siempre que se valide el rendimiento.
- Reproducción de experimentos de Paper Reconstruction Evaluation: utilizar el checkpoint para replicar evaluaciones de presentación y alucinación descritas en el paper asociado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica: "Measured benchmarks: pending".

## Requisitos de hardware
- VRAM estimada: pesos en fp16/bf16 ~14,1 GB (coincide con el tamaño del repositorio). Con overhead de activaciones, KV cache y codificador visual, se recomienda 24 GB para inferencia cómoda. En 8-bit ~7-8 GB; en 4-bit ~4-5 GB, siempre como estimación orientativa.
- GPU recomendadas: A100 40 GB, H100 80 GB, RTX 4090 24 GB, RTX 3090 24 GB. Para cuantización 4-bit/8-bit, GPUs consumer de 12-16 GB como RTX 4080 o RTX 4070 Ti pueden ser suficientes, sujeto a conversión.
- ¿Cabe en consumer GPU? Sí, con cuantización. El repositorio no incluye GGUF ni otros formatos cuantizados, por lo que requiere convertir los pesos.
- Despliegue: el autor indica cargar con el loader TARS/LLaVA fijado, no con un loader LoRA de HuggingFace. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
En la información proporcionada no hay datos de rendimiento de alternativas. La única referencia directa es el modelo base.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| TARS paper 7b | 7,06B | no disponible | no disponible | safetensors | HuggingFace |
| LLaVA v1.5 7B | 7B | no disponible | no disponible | safetensors | HuggingFace |
| Otras alternativas multimodales de 7B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Licencia no especificada: no se puede asumir uso comercial sin verificar.
- Sin benchmarks: rendimiento no validado; "Measured benchmarks: pending".
- Idiomas no disponibles: no se puede garantizar soporte multilingüe.
- Checkpoint de reconstrucción: no es un checkpoint de autor; puede no reproducir exactamente los resultados del paper.
- Carga no estándar: requiere loader TARS/LLaVA; intentar cargarlo como LoRA de HuggingFace puede fallar.
- Riesgo de alucinación: relevante en generación de contenido científico, especialmente al reconstruir papers.
- Sesgos: heredados del modelo base LLaVA/Vicuna, no documentados en esta ficha.
- Poca validación comunitaria: 0 descargas y 0 likes.
- Contexto no disponible: dificulta planificar tareas con documentos largos.
- Formato único safetensors: no hay GGUF, AWQ, GPTQ ni otras cuantizaciones publicadas.
- Metadatos potencialmente inconsistentes: fecha de creación 2026-10-01.
- Repositorio de 14,1 GB: requiere espacio y ancho de banda.

## Enlaces
- HuggingFace: https://huggingface.co/pbcong/tars-paper-reconstruction-7b-mask-s42-ep2
- Modelo base: https://huggingface.co/liuhaotian/llava-v1.5-7b
- Paper Reconstruction Evaluation (arXiv): https://arxiv.org/abs/2604.01128
- Paper Reconstruction Evaluation (PDF): https://arxiv.org/pdf/2604.01128
- Paper Reconstruction Evaluation (HTML en ar5iv): https://ar5iv.labs.arxiv.org/html/2604.01128
- PaperRecon (página del proyecto): https://agent4science-utokyo.github.io/PaperRecon_HP/
- reproduction.json: disponible en el repositorio de HuggingFace del modelo (ruta no especificada en la información proporcionada)
