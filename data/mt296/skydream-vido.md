# MT296/SKYDREAM.vido

## Resumen

SKYDREAM.vido es un modelo de generación de vídeo a partir de imagen y texto (image-text-to-video) publicado por el usuario MT296 en HuggingFace bajo licencia Apache 2.0. Se distribuye como pipeline de la librería `diffusers` y está etiquetado como derivado de Stable Video Diffusion, lo que lo sitúa en la familia de modelos de difusión latente aplicados a la síntesis de secuencias de vídeo. El modelo resuelve la tarea de animar una imagen de referencia condicionada por una descripción textual, un caso de uso con demanda creciente en producción audiovisual, prototipado de contenidos y herramientas creativas.

La información pública disponible es muy limitada: la model card no incluye especificaciones técnicas, detalles de arquitectura, resultados de benchmarks ni instrucciones de uso. Los únicos datos verificables son los metadatos de HuggingFace (pipeline, librería, licencia, idiomas declarados y datasets de entrenamiento) y el campo `new_version`, que apunta a `hpcai-tech/Open-Sora-v2-Video-DC-AE`, lo que sugiere una relación con el ecosistema Open-Sora v2 en cuanto a autoencoder de vídeo. No se dispone de información sobre el número de parámetros, la longitud de contexto temporal ni el tamaño de los pesos.

Con cero descargas y cero likes en el momento de la consulta, se trata de un modelo recién publicado y sin validación comunitaria. Cualquier evaluación de su calidad real requeriría probarlo directamente, algo que esta ficha no puede cubrir porque no se han publicado métricas ni ejemplos de salida en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | difusión latente para vídeo, etiquetada como derivada de Stable Video Diffusion (detalle no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no se especifica el número de frames ni la resolución) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, es, tr, ar, af, el, mg, te |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (se distribuye vía `diffusers`; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Las etiquetas indican `Stable-video-diffusion` y `diffusers`, por lo que lo razonable es asumir un esquema de difusión latente con un autoencoder de vídeo y un UNet o transformer de difusión condicionado por texto e imagen, pero esto es una inferencia a partir de las etiquetas y no un dato confirmado por el autor. El campo `new_version` apunta a `hpcai-tech/Open-Sora-v2-Video-DC-AE`, un autoencoder de vídeo del proyecto Open-Sora v2, lo que sugiere que el modelo podría reutilizar o estar relacionado con ese componente de compresión latente, sin que haya documentación que lo confirme.

En cuanto a los datos de entrenamiento, la model card declara tres datasets: `TempoFunk/webvid-10M`, `multimodalart/panda-70m` y `rainapandaa/T2V-MIA-datasets`. No se especifica el número de tokens, el número de pasos de entrenamiento, la resolución de los clips, la duración de las secuencias ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de consistencia temporal. Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de vídeo condicionada por imagen y texto (`image-text-to-video`): el pipeline acepta una imagen de referencia y una descripción textual para producir una secuencia animada.
- Generación texto-a-vídeo: aunque el pipeline declarado es image-text-to-video, las etiquetas `Video-generation` y `ai-video` sugieren capacidad de síntesis de vídeo a partir de texto, sin confirmación explícita.
- Multilingüismo declarado en ocho idiomas: inglés, español, turco, árabe, afrikáans, griego, malgache y telugu. No se especifica si el multilingüismo afecta al prompt, a los subtítulos de entrenamiento o a ambos.
- Integración con `diffusers`: el modelo se carga mediante la API estándar de la librería, lo que facilita su uso en pipelines de Python.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, audio ni visión más allá de la imagen de condicionamiento.

## Casos de uso

- Prototipado de animaciones a partir de storyboards: dado un fotograma clave y un prompt descriptivo, el modelo puede generar un clip corto que sirva como previsualización animada antes de producir la escena con herramientas de render final.
- Generación de contenido para redes sociales: creación de vídeos breves a partir de una imagen de producto o ilustración y un texto de campaña, aprovechando la licencia Apache 2.0 para uso comercial sin restricciones de atribución adicionales.
- Enriquecimiento de catálogos de e-commerce: animar imágenes estáticas de producto con un prompt que describa el movimiento deseado (rotación, zoom, iluminación) para generar fichas de producto en vídeo.
- Previsualización en pipelines de VFX: generar referencias animadas de baja resolución para validar timing y composición antes de invertir en render de alta calidad.
- Investigación en generación de vídeo: servir como punto de partida o baseline para experimentos de difusión de vídeo, dado que se distribuye vía `diffusers` y con licencia permisiva.
- Educación y divulgación: animar diagramas o ilustraciones científicas con prompts descriptivos para producir material didáctico en vídeo.
- Localización multilingüe de contenido: al declarar soporte para ocho idiomas, puede emplearse para generar variantes de un mismo clip con prompts en distintos idiomas, aunque no hay evidencia publicada de la calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el número de parámetros ni la resolución y duración de los clips generados.
- GPU recomendadas: no disponible. Por la familia a la que pertenece (difusión de vídeo), es esperable que requiera GPU con al menos 16-24 GB de VRAM para resoluciones y duraciones moderadas, pero esto es una estimación genérica y no un dato del modelo.
- Viabilidad en GPU de consumo: no confirmada. No hay información sobre si cabe en RTX 4090, RTX 3090 u otras GPU de consumo.
- Opciones de despliegue: la librería declarada es `diffusers`, por lo que el despliegue estándar sería mediante un pipeline de Python con PyTorch. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para modelos de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Licencia | Disponibilidad |
|---|---|---|---|---|
| SKYDREAM.vido | no disponible | no disponible | Apache 2.0 | HuggingFace, vía `diffusers` |
| Stable Video Diffusion (Stability AI) | no disponible en esta ficha | no disponible en esta ficha | licencia comunitaria de Stability AI | HuggingFace, ampliamente adoptado |
| Open-Sora v2 (HPC-AI Tech) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | HuggingFace y repositorio propio |

No se dispone de datos de rendimiento del modelo ni de las alternativas en la información proporcionada, por lo que la comparativa se limita a licencia y disponibilidad. No se han publicado métricas que permitan situar SKYDREAM.vido frente a Stable Video Diffusion u Open-Sora v2.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay información sobre parámetros, resolución, duración de los clips, pasos de inferencia ni configuración recomendada, lo que dificulta su uso en producción.
- Sin validación comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que el modelo funcione según lo esperado.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir artefactos, inconsistencias temporales, deformaciones anatómicas y flickering entre frames; no se documenta ninguna mitigación.
- Sesgos desconocidos: los datasets declarados (WebVid-10M, Panda-70M, T2V-MIA) son colecciones web a gran escala con sesgos demográficos y culturales documentados en la literatura, pero el autor no describe filtrado ni balanceo.
- Idiomas declarados sin evidencia: el soporte para español, turco, árabe, afrikáans, griego, malgache y telugu no está respaldado por ejemplos ni métricas; la calidad en esos idiomas es desconocida.
- Licencia Apache 2.0: permisiva para uso comercial, pero el usuario debe verificar que los datasets de entrenamiento no impongan restricciones adicionales sobre los pesos derivados.
- Relación no confirmada con Open-Sora v2: el campo `new_version` apunta a un autoencoder de Open-Sora v2, pero no se documenta si el modelo es un fine-tune, una variante o una versión independiente.
- Fecha de creación futura (2026-10-31): el metadato de creación es posterior a la fecha habitual de consulta, lo que puede indicar un error de marcado o una publicación programada; conviene verificar la integridad del repositorio antes de descargarlo.

## Enlaces

- [HuggingFace: MT296/SKYDREAM.vido](https://huggingface.co/MT296/SKYDREAM.vido)
- [Open-Sora v2 Video DC-AE (referenciado como `new_version`)](https://huggingface.co/hpcai-tech/Open-Sora-v2-Video-DC-AE)
- [Dataset: TempoFunk/webvid-10M](https://huggingface.co/datasets/TempoFunk/webvid-10M)
- [Dataset: multimodalart/panda-70m](https://huggingface.co/datasets/multimodalart/panda-70m)
- [Dataset: rainapandaa/T2V-MIA-datasets](https://huggingface.co/datasets/rainapandaa/T2V-MIA-datasets)
- [Librería diffusers](https://github.com/huggingface/diffusers)
