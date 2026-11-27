# Shozi007/ltxvideo-2b-nsfw

## Resumen

Shozi007/ltxvideo-2b-nsfw es un ajuste fino (finetune) del modelo de generación de vídeo a partir de imagen LTX-Video 0.9.5 de Lightricks, publicado por el usuario Shozi007 en Hugging Face. El modelo parte de una arquitectura de difusión para image-to-video y ha sido reentrenado con un conjunto de datos propio de contenido para adultos (real y anime), descrito mediante etiquetas de booru. El autor declara un coste de entrenamiento de aproximadamente 200 dólares y un resultado que él mismo califica de "poco probable que sea utilizable" en comparación con alternativas como WAN, aunque con generación rápida.

El modelo tiene 1.923.385.472 parámetros (aproximadamente 1,9 mil millones) y un repositorio de 19,2 GB en formato safetensors para la librería diffusers. La información disponible es muy limitada: no se especifican licencia, idiomas soportados ni longitud de contexto, y el autor no publica benchmarks ni métricas objetivas. La model card se centra en las observaciones subjetivas del proceso de entrenamiento y en las limitaciones percibidas del resultado.

Es relevante ahora únicamente como ejemplo de finetune comunitario de un modelo de vídeo reciente y como posible base para experimentación con contenido NSFW, aunque su calidad declarada es baja y su uso en producción no está recomendado por el propio autor. No se dispone de información sobre la licencia del modelo base ni sobre restricciones de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para image-to-video (base: Lightricks/LTX-Video-0.9.5); detalles internos no disponibles |
| Parámetros totales | 1.923.385.472 (≈1,9 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (repo en safetensors; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | No disponible (las descripciones de entrenamiento usan etiquetas booru, principalmente en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint LTX-Video 0.9.5 de Lightricks, un modelo de difusión para generación de vídeo condicionada por imagen. No se dispone de detalles técnicos sobre la arquitectura interna (tipo de transformer, mecanismo de atención, VAE, etc.) más allá de lo que implica el pipeline image-to-video de diffusers. El autor no documenta el número total de tokens de entrenamiento ni la composición exacta del dataset.

Según la model card, el entrenamiento se realizó sobre una mezcla de imágenes y vídeos con descripciones en etiquetas de booru. Para imágenes se usó `batch_size 256` y `lr 6e-5`, con un dataset de aproximadamente 90.000 imágenes, y el autor observó que el modelo aprende estilos de autores con pocas épocas. Para vídeo se usó `batch_size 16` y un dataset de 4.700 clips, con un máximo de 121 fotogramas por clip y resoluciones entre 512x768 y 768x512. Al final se realizó un ajuste específico para image-to-video. El autor señala que no entrenó CFG, que el modelo es muy sensible al learning rate y que los resultados son "todavía lejos de lo ideal". No se documenta RLHF, DPO ni ninguna innovación técnica adicional.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video) mediante el pipeline de diffusers.
- Generación de contenido para adultos (NSFW), incluyendo estilos realista y anime, según el dataset de entrenamiento declarado.
- Comprensión de estilos de autores presentes en el dataset de imágenes, según las observaciones del autor.
- Generación rápida en comparación con otros modelos de vídeo, según la model card.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- No se documenta control fino de movimiento ni condicionamiento adicional más allá de la imagen de entrada.

## Casos de uso

- Experimentación con finetunes comunitarios de LTX-Video: el modelo sirve para estudiar cómo un ajuste con imágenes y vídeos etiquetados con booru afecta al comportamiento de un modelo de difusión image-to-video, aunque su calidad declarada es baja.
- Generación rápida de borradores de vídeo NSFW: para prototipos o pruebas de concepto donde la velocidad prima sobre la calidad, el autor indica que genera muy rápido, aunque los resultados son "raramente decentes".
- Investigación sobre sesgos y estilos en modelos de vídeo: el dataset incluye múltiples autores y estilos realistas y anime, lo que permite analizar cómo el finetune captura estilos concretos con pocas épocas.
- Pruebas de pipelines de diffusers para image-to-video: al estar en formato diffusers y safetensors, puede integrarse en flujos de trabajo existentes para validar la carga y ejecución del pipeline.
- Estudio de sensibilidad al learning rate en finetunes de difusión: las observaciones del autor sobre batch size y lr pueden servir como referencia para diseñar experimentos propios.
- Base para futuros finetunes: el autor planea reentrenar con un dataset mayor, por lo que este checkpoint puede servir como punto de partida para experimentación, siempre que se resuelva la licencia.
- No se recomienda su uso en producción comercial, atención al cliente, generación de código ni tareas de razonamiento, ya que no son capacidades documentadas ni adecuadas para este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (FVD, CLIP score, etc.) ni comparaciones cuantitativas con otros modelos. El autor solo aporta observaciones cualitativas: el modelo "a veces produce resultados decentes (raramente)" y "genera muy rápido", pero no ofrece cifras de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1,9 B parámetros en safetensors, el peso en precisión completa (fp32) rondaría los 7,7 GB, y en fp16/bf16 unos 3,8 GB, a lo que habría que sumar el VAE y los tensores intermedios del pipeline de vídeo, que suelen requerir bastante memoria adicional.
- GPU recomendadas: no disponibles. Para modelos de vídeo de este tamaño se suelen usar GPUs con al menos 16-24 GB de VRAM (RTX 4090, A100, H100), pero no hay datos específicos para este checkpoint.
- Compatibilidad con GPU de consumo: no confirmada. Es probable que quepa en GPUs de consumo de gama alta con cuantización o técnicas de ahorro de memoria, pero no se documenta.
- Opciones de despliegue: diffusers (librería declarada). No se documentan soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para modelos de difusión de vídeo.
- Latencia y throughput: no disponibles. El autor afirma que "genera muy rápido", pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Shozi007/ltxvideo-2b-nsfw | ≈1,9 B | No disponible | No disponible | Hugging Face, 0 descargas, 0 likes | Finetune NSFW de LTX-Video 0.9.5; calidad declarada baja por el autor |
| Lightricks/LTX-Video-0.9.5 | No disponible en la información | No disponible | No disponible | Hugging Face (modelo base) | Modelo base oficial de Lightricks para image-to-video |
| WAN (familia) | No disponible en la información | No disponible | No disponible | No disponible | El autor lo menciona como referencia de mejor calidad |
| Otros finetunes de LTX-Video | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparativos |

No se dispone de información suficiente para una comparativa cuantitativa con alternativas de la misma categoría. Los datos de WAN y otros modelos no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- Calidad limitada: el propio autor afirma que el modelo es "poco probable que sea utilizable" y que los resultados "están todavía lejos de lo ideal", con mejoras "raramente" decentes.
- Contenido NSFW: el modelo está entrenado para generar contenido para adultos; su uso debe cumplir la legislación aplicable y las políticas de las plataformas.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, la licencia del modelo base LTX-Video 0.9.5 no se detalla en la información proporcionada.
- Sesgos desconocidos: no se documentan sesgos, pero el dataset de booru y contenido para adultos puede introducir sesgos de estilo, género y representación.
- Riesgo de alucinación visual: como modelo de difusión, puede generar artefactos, movimientos incoherentes o contenido no solicitado; el autor no documenta métricas de fidelidad.
- Limitaciones de idioma: no se documentan idiomas soportados; las descripciones de entrenamiento usan etiquetas booru, principalmente en inglés.
- Sensibilidad al learning rate: el autor señala que el modelo es muy sensible al lr, lo que puede afectar a futuros finetunes.
- Sin CFG entrenado: el autor sospecha que no entrenar CFG puede ser un problema, lo que podría limitar el control de la generación.
- Sin benchmarks ni métricas: no hay datos objetivos para evaluar su rendimiento frente a alternativas.
- Repositorio con 0 descargas y 0 likes: indica baja validación por parte de la comunidad.
- Restricciones de resolución y duración: el entrenamiento usó resoluciones entre 512x768 y 768x512 y clips de máximo 121 fotogramas; no se documenta comportamiento fuera de ese rango.
- Fecha de creación futura (2026-11-27): dato atípico que puede indicar un error en los metadatos; conviene verificarlo antes de confiar en la información temporal.

## Enlaces

- Hugging Face: https://huggingface.co/Shozi007/ltxvideo-2b-nsfw
- Modelo base: https://huggingface.co/Lightricks/LTX-Video-0.9.5
- Apoyo al autor: https://boosty.to/muinez
