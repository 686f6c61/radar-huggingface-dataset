# ovis-community/Ovis2.5-2B

## Resumen

Ovis2.5-2B es un modelo multimodal de tipo image-text-to-text desarrollado originalmente por ATH-MaaS y redistribuido por la comunidad ovis-community. Resuelve la tarea de generar texto a partir de entradas combinadas de imagen o vídeo y lenguaje natural, cubriendo tanto image-to-text como video-to-text dentro de un mismo checkpoint. Su relevancia actual radica en que ofrece capacidades multimodales con un coste computacional reducido: 2.570.429.672 parámetros totales y un repositorio de 5,2 GB en safetensors.

La versión publicada por ovis-community es una conversión mantenida por la comunidad para que el modelo funcione con las clases estándar de Transformers (`AutoModelForImageTextToText`, `AutoProcessor`) sin necesidad de `trust_remote_code=True`. Los pesos se copian sin modificar desde la revisión `393c932b2a03e28eb9aaa503e3c4ab3ad384d958` del checkpoint original `ATH-MaaS/Ovis2.5-2B`, mientras que la configuración nativa, el tokenizer y los metadatos del procesador de imagen y vídeo se regeneran para la implementación Ovis2.5 de Transformers.

El soporte nativo en Transformers se está incorporando mediante el PR huggingface/transformers#47659, por lo que hasta que exista una release que lo incluya es necesario usar un checkout con dicho PR. La licencia es Apache 2.0, lo que facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ovis2.5 (transformer multimodal, image-text-to-text); detalles internos no disponibles |
| Parametros totales | 2.570.429.672 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards + weight index) |

## Arquitectura y entrenamiento

La información disponible confirma que Ovis2.5-2B emplea la arquitectura Ovis2.5, con un pipeline multimodal image-text-to-text y componentes específicos de procesamiento de imagen y vídeo (image processor y video processor). El repositorio de la comunidad incluye configuración nativa, tokenizer BPE y metadatos de procesador regenerados para la implementación de Transformers, además de los shards de pesos, el índice de pesos, la licencia y el aviso copiados sin cambios desde el checkpoint original.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) en la información proporcionada. Para detalles de entrenamiento y uso previsto, la model card remite a la documentación del modelo original.

## Capacidades

- Generación de texto condicionada por imagen (image-to-text) mediante el pipeline `image-text-to-text`.
- Comprensión y descripción de vídeo (video-to-text), con procesador de vídeo dedicado.
- Conversación multimodal multi-turno (tag `conversational`).
- Carga con clases estándar de Transformers (`AutoModelForImageTextToText`, `AutoProcessor`) sin `trust_remote_code=True`.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio): no disponible en la información proporcionada.

## Casos de uso

- Descripción automática de imágenes para accesibilidad: el modelo puede generar texto alternativo a partir de imágenes usando el pipeline image-text-to-text, integrándose en CMS o plataformas de publicación para cumplir requisitos de accesibilidad.
- Moderación de contenido visual: clasificación y descripción de imágenes subidas por usuarios para detectar contenido no deseado antes de su publicación, aprovechando la entrada multimodal y la salida en lenguaje natural.
- Análisis de vídeo para resumen de metraje: uso del procesador de vídeo para generar resúmenes o descripciones de clips cortos, útil en archivos audiovisuales y herramientas de edición.
- Asistencia en atención al cliente con capturas de pantalla: el modelo puede interpretar imágenes enviadas por el usuario (capturas de errores, facturas, productos) y responder en conversación multi-turno.
- Extracción de información de documentos escaneados: lectura de imágenes de documentos y generación de respuestas estructuradas en texto para pipelines de digitalización.
- Prototipado rápido en investigación multimodal: al ser un modelo de 2,57B parámetros con licencia Apache 2.0 y carga estándar en Transformers, sirve como base para experimentos de evaluación y ajuste fino sin infraestructura de gran escala.
- Verificación visual en control de calidad industrial: inspección de imágenes de producto y generación de informes textuales de defectos en líneas de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,57B parámetros, en fp16 se requieren aproximadamente 5,1 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits rondaría 2,6 GB y en 4 bits aproximadamente 1,3 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU con 8-16 GB de VRAM debería ser suficiente en fp16, pero no hay validación oficial.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más en fp16 (por ejemplo, RTX 3060 Ti/4060 Ti y superiores), y en 4 bits en GPUs con 4-6 GB; sin confirmación del autor.
- Opciones de despliegue: Transformers con `AutoModelForImageTextToText` y `AutoProcessor` (requiere un checkout con el PR #47659 hasta que haya release). vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas (contexto, idiomas, rendimiento) de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ovis2.5-2B (ovis-community) | 2,57B | no disponible | Apache 2.0 | safetensors |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo multimodal, puede heredar sesgos de sus datos de entrenamiento originales.
- Riesgo de alucinación: no cuantificado; como modelo generativo multimodal, puede producir descripciones inexactas de imágenes o vídeos.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están disponibles, lo que impide garantizar su comportamiento en textos largos o en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el archivo `LICENSE` y `NOTICE` copiados del checkpoint original y respetarse la atribución a ATH-MaaS.
- Dependencia de Transformers: hasta que se publique una release con el PR #47659, es necesario usar un checkout específico, lo que añade fricción en producción.
- Esta es una conversión comunitaria: los pesos no se modifican, pero la configuración y el procesador se regeneran; la model card remite al modelo original para uso previsto y limitaciones.
- No se han publicado datos de rendimiento, latencia ni requisitos de hardware validados por el autor.

## Enlaces

- Hugging Face (versión comunitaria): https://huggingface.co/ovis-community/Ovis2.5-2B
- Modelo original: https://huggingface.co/ATH-MaaS/Ovis2.5-2B
- Pull request de soporte nativo en Transformers: https://github.com/huggingface/transformers/pull/47659
