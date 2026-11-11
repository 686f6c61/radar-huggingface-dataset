# JadeSpartan/ParkingLot0.5

## Resumen

ParkingLot0.5 es un ajuste fino (fine-tuning) de tipo conversacional y multimodal publicado por el usuario JadeSpartan en Hugging Face. Se construye sobre `huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated`, una variante "abliterated" del modelo Qwen3.5 de 4B parametros, lo que sitúa al modelo en la familia Qwen3.5 con una arquitectura transformer y capacidad image-text-to-text. El resultado es un checkpoint de 4.659.865.088 parametros (aproximadamente 4,66 mil millones) distribuido en formato FP16 con safetensors.

El modelo hereda del base la orientación multimodal (procesa imagen y texto) y el pipeline declarado `image-text-to-text`, además de la etiqueta `qwen3_5`. El ajuste se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, lo que sugiere un entrenamiento eficiente en memoria. La licencia declarada es Apache 2.0 y el único idioma listado es el inglés.

La relevancia de este checkpoint es limitada y muy específica: se trata de un modelo de nicho, sin descargas ni interacciones en el momento de la consulta, y sin documentación técnica detallada más allá de los metadatos. Resulta útil como ejemplo de fine-tuning ligero sobre una base multimodal de 4B, pero no debe considerarse un modelo de referencia para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); multimodal image-text-to-text |
| Parametros totales | 4.659.865.088 (aprox. 4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint publicado es FP16; la base admite cuantizaciones habituales de la familia Qwen, sin confirmar) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 9,3 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y del pipeline `image-text-to-text`. Por herencia del modelo base, se trata de un transformer de la familia Qwen3.5 con capacidad multimodal (entrada de imagen y texto), pero no se especifican número de capas, dimensión oculta, mecanismo de atención ni tipo de encoder visual. Tampoco se documenta si el base emplea mezcla de expertos; el recuento de parámetros (4,66 B) y la ausencia de la etiqueta MoE sugieren un modelo denso, aunque esto no está confirmado en la información proporcionada.

El ajuste fino se realizó con Unsloth y TRL, según la model card, partiendo de `huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated`. No se indican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o alguna técnica de alineación adicional. La base "abliterated" implica que se han eliminado o atenuado las capas de rechazo del modelo original, lo que condiciona su comportamiento. El checkpoint se publica en FP16.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del base Qwen3.5.
- Procesamiento de imagen y texto (pipeline image-text-to-text): descripción de imágenes y respuesta a preguntas sobre ellas, según el pipeline declarado.
- Razonamiento y generación de código: capacidades propias de la familia Qwen3.5, no verificadas en este checkpoint concreto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos (`language: en`).
- Modo "thinking" u otras capacidades especiales: no disponible.
- Comportamiento "abliterated": el base elimina mecanismos de rechazo, lo que afecta a la moderación y a las respuestas ante contenido sensible.

## Casos de uso

- Prototipado de asistentes multimodales: el modelo puede recibir una imagen y texto y generar una respuesta conversacional, útil para validar pipelines image-text-to-text antes de invertir en modelos mayores.
- Fine-tuning experimental sobre base de 4B: sirve como punto de partida para experimentos de ajuste con Unsloth/TRL en una sola GPU consumer, dado su tamaño contenido en FP16.
- Descripción y etiquetado de imágenes en inglés: generación de leyendas o respuestas a preguntas visuales en flujos internos de anotación, siempre con revisión humana.
- Investigación sobre alineación y comportamiento "abliterated": permite estudiar cómo cambia el comportamiento de un modelo multimodal cuando se eliminan las capas de rechazo, en entornos controlados.
- Chat conversacional de dominio acotado en inglés: despliegue de un asistente de bajo coste para tareas internas donde el contexto corto sea suficiente (la longitud de contexto no está documentada, por lo que debe validarse).
- Evaluación comparativa de checkpoints: útil como baseline secundario en estudios que comparen fine-tunes ligeros de la familia Qwen3.5 frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 9,3 GB solo para pesos (4,66 B × 2 bytes), más overhead de activaciones y del encoder visual; en la práctica se recomienda al menos 12-16 GB para inferencia cómoda.
- Cuantización: no se documentan versiones GGUF/AWQ/GPTQ publicadas; sería necesario generarlas a partir del checkpoint FP16.
- GPU recomendadas: A100, H100 o L40S para servicio concurrente; RTX 4090 (24 GB) para inferencia FP16 con margen.
- GPU consumer: cabe en RTX 4090 y, con cuantización a 8 bits o 4 bits, podría caber en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070), aunque esto no está verificado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repo) y, previsiblemente, vLLM y llama.cpp tras conversión, sin confirmación oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JadeSpartan/ParkingLot0.5 | 4,66 B | no disponible | Sí (image-text-to-text) | Apache 2.0 | Hugging Face, 0 descargas |
| huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated (base) | ~4 B | no disponible | Sí | no disponible en esta ficha | Hugging Face |
| Qwen3.5-4B (modelo original de la familia) | ~4 B | no disponible en esta ficha | Según variante | no disponible en esta ficha | Hugging Face |

La comparación se limita a la línea de ascendencia del modelo; no se dispone de datos de benchmarks ni de especificaciones completas de las alternativas en la información proporcionada, por lo que no es posible una comparativa de rendimiento rigurosa.

## Limitaciones y advertencias

- Modelo sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de calidad más allá de la model card.
- Documentación mínima: no se especifican contexto, dataset de entrenamiento, benchmarks ni detalles de arquitectura.
- Sesgos: no documentados; al derivar de un base "abliterated", es esperable una menor moderación ante contenido sensible, lo que incrementa el riesgo en producción.
- Riesgo de alucinación: no evaluado; los modelos de 4B suelen presentar mayor tasa de alucinación que modelos mayores, especialmente en tareas de razonamiento complejo.
- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia y condiciones del modelo base y de los datos de ajuste, no detalladas aquí.
- Contexto desconocido: no debe asumirse una ventana larga sin validación empírica.
- El pipeline multimodal no está verificado con ejemplos; la calidad de la comprensión de imagen es incierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JadeSpartan/ParkingLot0.5
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-Claude-4.6-Opus-abliterated
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: no disponible enlace directo en la información proporcionada
