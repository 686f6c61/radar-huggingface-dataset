# nebulette/mossrael-2b-encoder

## Resumen

mossrael-2b-encoder es un adaptador de proyección de características publicado por el usuario nebulette sobre el modelo base OpenMOSS-Team/MOSS-Image-Base. No se trata de un modelo de lenguaje generativo al uso, sino de un componente de codificación de texto orientado a la generación de imágenes: toma el encoder Qwen3.5-2B y lo adapta para producir representaciones de prompts artísticos con un vocabulario muy específico de estilos, técnicas y etiquetas de booru. La librería declarada es diffusers y el repositorio ocupa 3,8 GB con pesos en safetensors.

El modelo se presenta como la cuarta iteración de la familia Moss:RAEL, un fine-tune que añade soporte para layouts en JSON (sin campo de texto), 400 géneros y técnicas artísticas, y referencias de autor en formatos como "style of name" o "art by @name". Mantiene compatibilidad hacia atrás con MOSSad y está pensado para integrarse en flujos de trabajo de generación de imagen donde el control fino del prompt (ponderación, bigramas, nombres propios) es crítico.

Su relevancia es acotada pero clara: cubre el nicho de la codificación de prompts artísticos estructurados para pipelines basados en MOSS-Image, con licencia Apache 2.0 y un tamaño (1.907.009.344 parámetros) que permite desplegarlo en hardware de consumo. El idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (encoder basado en Qwen3.5-2B), adaptador de proyección de características sobre MOSS-Image-Base |
| Parametros totales | 1.907.009.344 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador sobre OpenMOSS-Team/MOSS-Image-Base con relación declarada `adapter`, construido a partir del encoder Qwen3.5-2B (aproximadamente 1,9 mil millones de parámetros). La función declarada es la proyección de características (`feature-projection`) para condicionar la generación de imagen, no la generación de texto libre. La model card no detalla la topología exacta del adaptador, el número de capas congeladas ni la dimensión de la proyección.

En cuanto a datos, la model card enumera las fuentes de entrenamiento: colores y verbos comunes, cientos de nombres, `danbooru_tags_classified`, `danbooru_tag_taxonomy`, `danbooru2026_moe`, `danbooru_wiki_2606`, 40.000 muestras de gelbooru (cada una con una etiqueta de booru nueva y no explorada), `openart_painterly_foundations`, `pexels_portrait`, `saber` (referencia 2610.22602), `sdxl_artists`, `spright_coco` y `z_image_ethnicity`. No se indica el número total de tokens, la composición porcentual ni si hubo RLHF o DPO. Las mejoras declaradas respecto a la versión anterior incluyen ponderación de prompt mejorada, soporte de etiquetas de una sola palabra, nombres de personajes en mayúsculas o minúsculas, bigramas de Danbooru y de inglés, y etiquetas `@name` tanto en contexto separado por comas como en lenguaje natural.

## Capacidades

- Codificación de prompts artísticos estructurados para condicionar la generación de imagen en pipelines MOSS-Image.
- Soporte de layouts en JSON sin campo de texto, útil para definir composición y pose de forma programática.
- Vocabulario de 400 géneros y técnicas artísticas.
- Referencias de autor en formatos "style of name" y "art by @name".
- Ponderación de prompt mejorada respecto a versiones anteriores.
- Reconocimiento de etiquetas de una sola palabra, nombres de personajes y bigramas de Danbooru e inglés.
- Compatibilidad hacia atrás con MOSSad.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.

## Casos de uso

- Generación de imagen con control de estilo: el encoder traduce prompts con referencias a artistas y técnicas ("art by @nombre", "style of nombre") a representaciones que el modelo de imagen interpreta, lo que permite fijar una estética concreta en producción.
- Composicion guiada por layout: usando el editor de layouts de mossimage.org se define la pose y la estructura de la escena en JSON, y el encoder la convierte en condicionamiento sin necesidad de describir la composición en texto.
- Exploracion de taxonomias de booru: con 400 géneros y soporte de bigramas de Danbooru, sirve para prototipar pipelines que mapean etiquetas de comunidades de arte a imágenes generadas.
- Herramientas de autoria asistida: integrado en una interfaz donde el usuario escribe nombres de personajes o etiquetas sueltas, el encoder normaliza y pondera el prompt antes de pasarlo al modelo de imagen.
- Investigacion sobre condicionamiento de texto en difusion: al ser un adaptador pequeño y con licencia permisiva, es un punto de partida para estudiar proyección de características y comparar con otros encoders.
- Fines educativos y de demostracion: su tamano (3,8 GB de repo, menos de 2.000 millones de parámetros) permite ejecutarlo en una GPU de consumo para experimentar con generación de imagen condicionada por estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 1,9 mil millones de parámetros en fp16 requiere aproximadamente 3,8 GB solo para los pesos, más activaciones y el modelo de imagen asociado.
- GPU recomendadas: no disponible. Por tamano, cabría en GPUs de consumo con 8-12 GB de VRAM para el encoder en precisión reducida, aunque el pipeline completo de MOSS-Image exige más memoria.
- Cabe en GPU de consumo: probablemente sí para el encoder aislado; no confirmado para el pipeline completo.
- Opciones de despliegue: la librería declarada es diffusers; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son motores orientados a modelos de lenguaje, no a este adaptador).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| nebulette/mossrael-2b-encoder | 1.907.009.344 | no disponible | apache-2.0 | Adaptador de proyección sobre MOSS-Image-Base, especializado en prompts artísticos |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | no disponible | no disponible en la informacion proporcionada | Modelo base sobre el que se construye el adaptador |
| Qwen3.5-2B | ~2B (según referencia de la model card) | no disponible | no disponible en la informacion proporcionada | Encoder subyacente del que parte el adaptador |

No se dispone de datos de rendimiento ni de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; los prompts en castellano u otros idiomas pueden degradar la calidad del condicionamiento.
- Es un adaptador especializado en estilos artísticos y etiquetas de booru; no es un modelo de propósito general y no debe usarse para tareas de lenguaje, razonamiento o código.
- Riesgo de sesgo: los datasets de booru y de retratos pueden arrastrar sesgos de representación demográfica y de género; la fuente `z_image_ethnicity` sugiere que el autor intentó cubrir diversidad, pero no se documenta metodología de mitigación.
- Riesgo de alucinación en la interpretación de etiquetas: nombres de artistas o personajes poco frecuentes pueden mapearse a estilos incorrectos.
- No se documentan límites de contexto ni comportamiento con prompts muy largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-04); no hay evidencia de validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base MOSS-Image-Base y los datasets de terceros (Danbooru, Gelbooru) pueden tener sus propias restricciones que el usuario debe verificar por separado.
- No hay información sobre cuantizaciones oficiales ni sobre el impacto de reducir precisión en la calidad del condicionamiento.

## Enlaces

- HuggingFace: https://huggingface.co/nebulette/mossrael-2b-encoder
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Encoder de referencia: https://huggingface.co/Qwen/Qwen3.5-2B
- Finetune previo Moss:RAEL: https://huggingface.co/sselpah/MossRAEL
- Dataset de conteo de imágenes: https://huggingface.co/sselpah/MossRAEL/blob/main/dataset_image_counts.json
- Editor de layouts: https://mossimage.org/layout/
- Paper de referencia citado (saber): 2610.22602 (identificador arXiv tal como aparece en la model card; no verificado)
