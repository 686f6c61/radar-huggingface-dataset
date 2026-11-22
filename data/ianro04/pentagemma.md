# ianro04/PentaGemma

## Resumen

PentaGemma es un ajuste fino de Gemma 4 E2B IT, el modelo instructivo de Google de la familia Gemma 4, especializado en resúmenes de texto de exactamente cinco frases. Lo desarrolla ianro04 como proyecto personal de aficionado y se distribuye principalmente en formato GGUF cuantizado Q4_K_S para su uso con llama.cpp. El modelo base es un transformer denso de aproximadamente 4.650 millones de parámetros, según los pesos en safetensors del repositorio.

El problema que aborda es acotado pero concreto: producir resúmenes con una restricción de longitud fija y estricta (cinco frases), algo que los modelos generalistas no garantizan de forma consistente sin prompting elaborado. El ajuste se realizó sobre el dataset abisee/cnn_dailymail, un corpus clásico de resumen de noticias, lo que orienta el modelo hacia documentos periodísticos en inglés.

Su relevancia es limitada y fundamentalmente práctica: sirve como ejemplo reproducible de fine-tuning con Unsloth y conversión a GGUF, y como utilidad de resumen ligera que puede ejecutarse en CPU o en GPU consumer. No está pensado como modelo de propósito general ni compite con modelos frontera; su interés reside en la especialización y en la simplicidad del despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Gemma 4 E2B IT) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_S (GGUF); F16 para el proyector multimodal (mmproj) |
| Idiomas soportados | no disponible (entrenado sobre CNN/DailyMail, en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_S, F16-mmproj); safetensors en el repositorio base |
| Modelo base | google/gemma-4-E2B-it |
| Dataset de ajuste | abisee/cnn_dailymail |
| Tamano del repositorio | 27,8 GB |
| Descargas | 111 |
| Pipeline declarado | summarization |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Gemma 4 E2B IT, un transformer denso de unos 4.650 millones de parámetros en formato instructivo. No se dispone de información detallada sobre la composición del corpus de preentrenamiento del modelo original ni sobre el número de tokens utilizados en el ajuste fino; la model card solo indica que se empleó el dataset abisee/cnn_dailymail, compuesto por artículos de noticias y sus resúmenes de referencia.

El ajuste fino y la conversión a GGUF se realizaron con Unsloth, una herramienta orientada a fine-tuning eficiente en memoria y a la exportación de pesos cuantizados para llama.cpp. La model card no documenta si hubo RLHF, DPO ni otras etapas de alineación posteriores al ajuste supervisado, ni detalla hiperparámetros, número de épocas o tamaño efectivo del conjunto de entrenamiento. Tampoco se especifican innovaciones técnicas propias más allá de la especialización en la restricción de cinco frases.

## Capacidades

- Generación de resúmenes de texto con una restricción estricta de cinco frases, su función principal.
- Resumen de documentos largos de tipo noticia o artículo, en línea con el dataset de entrenamiento.
- Conversación multi-turno heredada del modelo base instructivo, aunque no es su objetivo declarado.
- Soporte multimodal parcial: se incluye un archivo F16-mmproj para el proyector, lo que sugiere capacidad de entrada de imágenes heredada del base, sin documentación sobre su calidad tras el ajuste.
- Ejecución local mediante llama.cpp, incluido el modo CLI con plantilla Jinja (`--jinja`).
- No se documenta soporte específico de tool calling, function calling ni razonamiento agéntico multi-paso.
- Capacidades multilingües no documentadas; el entrenamiento se realizó sobre un corpus en inglés.

## Casos de uso

- Resumen de noticias en pipelines editoriales: el modelo recibe un artículo y devuelve un resumen de cinco frases, útil para generar sinopsis breves y homogéneas en portales de contenido, gracias a su ajuste específico sobre CNN/DailyMail.
- Boletines y newsletters automatizados: integrado en un script que procesa fuentes RSS y produce un resumen de longitud fija por cada noticia, lo que simplifica el diseño de plantillas y el control de espacio.
- Preprocesado para sistemas de recuperación: generar resúmenes compactos de documentos antes de indexarlos, reduciendo el coste de almacenamiento y de cómputo en la fase de búsqueda.
- Herramienta de escritorio o local sin conexión: al distribuirse en GGUF Q4_K_S, puede ejecutarse en CPU con llama.cpp para resumir documentos sin enviar datos a servicios externos.
- Prototipado y docencia: sirve como ejemplo completo y reproducible de fine-tuning con Unsloth y exportación a GGUF, útil en talleres sobre ajuste de modelos pequeños.
- Resumen de actas o informes internos: para documentos con estructura similar a noticias (informes, comunicados), puede generar un extracto de cinco frases como primer borrador revisable por una persona.
- Experimentación multimodal: el archivo mmproj permite probar entradas de imagen combinadas con texto, aunque sin garantías documentadas sobre la calidad del resumen resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo principal Q4_K_S de un modelo de ~4,65 mil millones de parámetros ocupa del orden de 3 GB; con overhead de contexto, un presupuesto de 4 a 6 GB de VRAM o RAM es razonable.
- GPU recomendadas: cualquier GPU consumer con 6 GB o más (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo cuantizado; en centros de datos, A100 o H100 lo ejecutan con holgura, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 6 GB o más; también en CPU, aunque la model card advierte que en CPU puede ser muy lento con documentos largos.
- Opciones de despliegue: llama.cpp (llama-cli con `--jinja`), y por extensión entornos compatibles con GGUF como Ollama o servidores basados en llama.cpp; el Space del autor usa ZeroGPU con reserva a CPU.
- Latencia y throughput: no disponibles de forma numérica; la model card solo indica que el modo CPU puede ser muy lento para documentos grandes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| PentaGemma | 4,65 B | no disponible | Resumen de 5 frases | Apache-2.0 | GGUF |
| google/gemma-4-E2B-it | no disponible en esta ficha | no disponible | Propósito general instructivo | Términos de Gemma (no disponibles aquí) | safetensors, GGUF |
| Modelos de resumen tipo BART/T5 (p. ej. facebook/bart-large-cnn) | ~0,4 B | ~1.024 tokens | Resumen abstractivo | MIT / Apache-2.0 según variante | safetensors |

La comparación con modelos de resumen clásicos como BART-large-CNN es la más directa por tarea: PentaGemma ofrece una ventana de contexto presumiblemente mayor y una restricción explícita de cinco frases, pero carece de benchmarks publicados que permitan comparar calidad. Frente a su modelo base, la diferencia es la especialización, a costa de perder generalidad.

## Limitaciones y advertencias

- Proyecto de aficionado: la model card lo describe explícitamente como hobby, sin evaluación formal ni garantías de calidad.
- Ausencia total de benchmarks publicados; no hay evidencia cuantitativa de su rendimiento frente a alternativas.
- Entrenado sobre CNN/DailyMail, en inglés: el comportamiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos generativos pequeños; en resúmenes de documentos largos puede omitir información o introducir detalles no presentes en el texto.
- La restricción de cinco frases puede incumplirse en entradas atípicas o muy largas, y puede forzar resúmenes incompletos en documentos complejos.
- El modo CPU puede ser muy lento con documentos grandes, según advierte el autor.
- Aunque la licencia declarada es Apache-2.0, el modelo deriva de Gemma 4, cuyos términos de uso pueden imponer condiciones adicionales; conviene verificar la compatibilidad antes de un uso comercial.
- Capacidades multimodales presentes pero sin documentación de calidad tras el ajuste.
- Contexto máximo no documentado; no debe asumirse una ventana larga sin verificación empírica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ianro04/PentaGemma
- Space de demostración: https://huggingface.co/spaces/ianro04/PentaGemma
- Notebook de Kaggle: https://www.kaggle.com/code/cloudeerie/pentagemma/
- Repositorio GitHub: https://github.com/CloudEerie/PentaGemma
- Unsloth: https://github.com/unslothai/unsloth
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de ajuste: https://huggingface.co/datasets/abisee/cnn_dailymail
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
