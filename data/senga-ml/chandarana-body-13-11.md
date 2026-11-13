# senga-ml/chandarana-body-13-11

## Resumen

`senga-ml/chandarana-body-13-11` es un modelo de la familia vision-encoder-decoder publicado en Hugging Face por el usuario senga-ml. La arquitectura declarada en los metadatos (vision-encoder-decoder) y la tarea asignada en el Hub (image-text-to-text) indican que está diseñado para recibir una imagen y generar texto a partir de ella, un patrón habitual en modelos de captioning, respuesta visual a preguntas (VQA) y descripción de documentos.

El checkpoint cuenta con 202.106.296 parámetros (aproximadamente 202 millones) y un tamaño de repositorio de 2,4 GB, lo que sugiere pesos almacenados en safetensors, probablemente en fp32 dado el volumen. La model card es la plantilla genérica autogenerada por el Hub y no aporta información sobre datos de entrenamiento, licencia, idiomas ni evaluación, por lo que la mayor parte de las especificaciones no están disponibles.

Su relevancia actual es limitada desde el punto de vista de producción: se trata de un modelo sin descargas ni interacciones, sin documentación técnica y sin licencia declarada. Resulta útil como objeto de estudio o como base para experimentación, pero no como componente listo para despliegue sin una evaluación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-encoder-decoder (transformer encoder-decoder multimodal) |
| Parametros totales | 202.106.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `vision-encoder-decoder` del Hub corresponde a la clase `VisionEncoderDecoderModel` de transformers, un ensamblaje que combina un encoder visual (habitualmente un ViT o un modelo tipo CLIP/Swin) con un decoder de lenguaje autorregresivo (típicamente un transformer tipo GPT-2, BART o similar). El modelo recibe píxeles de imagen, los codifica en una secuencia de embeddings visuales y genera texto token a token condicionado a esa representación. Con 202 millones de parámetros totales, el reparto entre encoder y decoder no está documentado.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas. La model card está completamente vacía en las secciones de datos y procedimiento de entrenamiento. Tampoco se indica si el modelo parte de un checkpoint preentrenado conocido o si se ha entrenado desde cero.

## Capacidades

- Generación de texto condicionada a imagen (image-text-to-text), el caso de uso declarado en el pipeline del Hub.
- Descripción de imágenes y captioning, por la arquitectura vision-encoder-decoder.
- Respuesta visual a preguntas (VQA) potencial, aunque no está confirmado por el autor.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión adicional, audio): no disponible.

## Casos de uso

- Descripción automática de imágenes en catálogos: el modelo puede generar un caption textual a partir de una fotografía de producto, útil para indexación y accesibilidad, siempre que se valide su calidad con muestras propias dado que no hay benchmarks publicados.
- Etiquetado de imágenes para datasets: como generador de descripciones preliminares en pipelines de anotación semiautomática, con revisión humana posterior.
- Extracción de texto de documentos escaneados: si el encoder visual está entrenado para texto impreso, podría emplearse en tareas de OCR asistido, aunque esta capacidad no está confirmada por el autor.
- Prototipado de asistentes visuales: para experimentar con interfaces de pregunta-respuesta sobre imágenes en entornos de investigación, dado su tamaño moderado (202 M de parámetros) que permite iterar rápido.
- Filtrado y moderación de contenido visual: como clasificador auxiliar que genere descripciones y permita reglas sobre ellas, previa evaluación de sesgos y falsos positivos.
- Educación y demostraciones: como ejemplo didáctico de arquitectura vision-encoder-decoder en cursos y talleres, por su tamaño manejable y su formato estándar de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,8 GB solo para pesos (202 M de parámetros × 4 bytes), más overhead de activaciones y del encoder visual; un presupuesto de 2-4 GB de VRAM es razonable.
- VRAM estimada en fp16/bf16: aproximadamente 0,4 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por capacidad; para lotes grandes conviene una A10G, L4 o A100.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (nativo), TGI si se convierte el checkpoint, y servidores de inferencia compatibles con la clase `VisionEncoderDecoderModel`. No se documentan pesos GGUF para llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| senga-ml/chandarana-body-13-11 | 202 M | no disponible | no disponible | Hugging Face, 0 descargas | Sin model card ni benchmarks |
| Salesforce/blip-image-captioning-base | ~224 M | no disponible | BSD-3-Clause | Hugging Face, ampliamente usado | Modelo de referencia para captioning con paper publicado |
| nlpconnect/vit-gpt2-image-captioning | ~200 M | no disponible | no disponible | Hugging Face | Ensamblaje ViT + GPT-2, mismo patrón arquitectónico |
| Microsoft/git-base | ~177 M | no disponible | MIT | Hugging Face | Alternativa para captioning y VQA con evaluación publicada |

La comparación se limita a arquitectura y tamaño, ya que no hay datos de rendimiento del modelo analizado. Frente a las alternativas citadas, la diferencia principal es la ausencia de documentación, licencia y evaluación.

## Limitaciones y advertencias

- Sin model card sustantiva: no se documentan datos de entrenamiento, sesgos, evaluación ni uso previsto, lo que impide auditar el modelo.
- Licencia no disponible: no se puede asumir uso comercial sin contactar con el autor; el riesgo legal es alto en producción.
- Riesgo de alucinación: como todo modelo generativo condicionado a imagen, puede describir elementos inexistentes; no hay evaluación publicada que lo cuantifique.
- Idiomas soportados desconocidos: no se puede garantizar calidad en castellano ni en ningún otro idioma.
- Longitud de contexto desconocida: no se puede planificar el truncado de descripciones largas ni el tamaño de las imágenes de entrada.
- Cero descargas y cero interacciones: no hay evidencia de uso ni de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-13): conviene verificar la integridad del repositorio antes de descargarlo.
- Sin cuantizaciones publicadas: el despliegue en entornos con poca VRAM requiere convertir los pesos manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/senga-ml/chandarana-body-13-11
- Paper citado en la model card (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
- Documentación de `VisionEncoderDecoderModel` en transformers: https://huggingface.co/docs/transformers/model_doc/vision-encoder-decoder
