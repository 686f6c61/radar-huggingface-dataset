# mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-GGUF

## Resumen

Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags es un modelo de lenguaje de aproximadamente 26.900 millones de parametros, derivado de la familia Qwen3.8 (etiquetado internamente como qwen3_5 en los tags del autor), especializado en roleplay conversacional en japones, generacion de etiquetas Danbooru para Stable Diffusion y contenido sin censura. La version aqui descrita es una cuantizacion estatica en formato GGUF producida por mradermacher a partir del modelo original de sss22213, que a su vez se construyo mediante tecnicas de abliteration ("heretic") y ajuste fino con LoRA sobre el modelo base Qwen3.8-27B.

El modelo resuelve un nicho concreto: la generacion de prompts estructurados con etiquetas Danbooru y dialogos de roleplay en japones con contenido para adultos, ambitos en los que los modelos genericos suelen rechazar peticiones o producir salidas poco alineadas con el formato esperado. Al estar "abliterated" (sin las direcciones de rechazo del modelo original) y entrenado con datasets especificos de Danbooru y roleplay NSFW sintetico en japones, ofrece un comportamiento mas permisivo y un vocabulario mas ajustado a estas tareas.

Su relevancia practica reside en la disponibilidad de cuantizaciones GGUF de 10,8 GB (Q2_K) a 28,7 GB (Q8_0), que permiten ejecutarlo en hardware de consumo, y en una licencia Apache 2.0 declarada. La ficha tecnica del modelo original no esta disponible en la informacion proporcionada, por lo que varios parametros de arquitectura y entrenamiento se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.8, transformer decoder-only presumiblemente; no confirmado en la informacion disponible) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj Q8_0 y f16 (suplemento multimodal) |
| Idiomas soportados | japones (ja), ingles (en), chines (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); repo original presumiblemente safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de detalles tecnicos sobre la arquitectura interna del modelo base Qwen3.8-27B en la informacion proporcionada: no se confirma si es un transformer decoder-only denso, ni se documentan mecanismos de atencion, numero de capas, dimensiones ocultas o estrategia de tokenizacion. El recuento de parametros (26.895.998.464) y la existencia de un fichero mmproj en las cuantizaciones sugieren un modelo multimodal con capacidad de vision, aunque esta circunstancia no se detalla en la model card.

El proceso de entrenamiento documentado se limita a la cadena de derivacion: el modelo parte de Qwen3.8-27B, se somete a un proceso de abliteration ("heretic") para eliminar las direcciones de rechazo, y despues se ajusta con LoRA (herramienta Unsloth) sobre dos datasets: `dartags/danbooru-2408-blind-captions`, orientado a la generacion de etiquetas Danbooru, y `Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted`, con 20.000 ejemplos sinteticos de roleplay NSFW en japones generados con DeepSeek-V3-0324. No se especifica el volumen total de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. La cuantizacion de mradermacher es estatica (quantize_version 2, output_tensor_quantised 1); existe una variante con cuantizaciones ponderadas/imatrix en el repositorio i1-GGUF del mismo autor.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay en japones.
- Generacion de etiquetas Danbooru (danbooru-tags) para prompts de Stable Diffusion y otros generadores de imagenes.
- Generacion de prompts estructurados para modelos de difusion.
- Contenido sin censura y sin rechazo (abliterated/uncensored), orientado a tematicas NSFW.
- Capacidad multimodal potencial: las cuantizaciones incluyen ficheros mmproj (Q8_0 y f16), lo que indica soporte de entrada visual, aunque no se detalla su alcance.
- Multilingue en japones, ingles y chines.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Generacion de prompts para Stable Diffusion: el modelo produce listas de etiquetas Danbooru coherentes con el formato esperado por los modelos de difusion, lo que permite automatizar la creacion de prompts a partir de una descripcion en lenguaje natural.
- Roleplay conversacional en japones: adecuado para aplicaciones de personajes virtuales o chatbots de entretenimiento en japones, gracias al ajuste fino sobre 20.000 ejemplos sinteticos de roleplay.
- Traduccion de descripciones a etiquetas: conversion de descripciones textuales de escenas en conjuntos de tags Danbooru normalizados, util en pipelines de generacion de imagenes por lotes.
- Etiquetado y curado de datasets de imagenes: uso del modelo para generar o completar captions con etiquetas Danbooru en conjuntos de datos de anime, agilizando el etiquetado manual.
- Ficcion interactiva y novelas visuales: generacion de dialogos y narrativa ramificada en japones con contenido adulto, integrable en motores de novelas visuales o juegos de rol textuales.
- Desarrollo de herramientas de escritura creativa para adultos: asistencia a autores que necesitan generar escenas NSFW en japones con un modelo que no rechaza la tematica.
- Experimentacion con modelos abliterated: uso como referencia para estudiar el efecto de la abliteration y del ajuste LoRA sobre el comportamiento de rechazo en modelos Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamanos de fichero declarados): Q2_K 10,8 GB; Q3_K_S 12,2 GB; Q3_K_M 13,4 GB; Q3_K_L 14,4 GB; IQ4_XS 15,3 GB; Q4_K_S 15,7 GB; Q4_K_M 16,6 GB; Q5_K_S 18,8 GB; Q5_K_M 19,3 GB; Q6_K 22,2 GB; Q8_0 28,7 GB. El fichero mmproj anade 0,7 GB (Q8_0) o 1,0 GB (f16) si se usa la entrada multimodal.
- GPU recomendadas: no disponibles de forma especifica en la informacion proporcionada. Por tamano, Q4_K_M (16,6 GB) encaja en GPUs consumer de 24 GB (RTX 4090, RTX 3090) y Q8_0 (28,7 GB) requiere GPUs de 32 GB o superiores (A100 40 GB, H100) o reparto entre varias GPU.
- Cabe en GPU consumer: si, en tarjetas de 16 GB o mas con cuantizaciones Q4 o inferiores (Q4_K_S 15,7 GB, IQ4_XS 15,3 GB); las cuantizaciones Q5 y superiores requieren 20 GB o mas.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para GGUF; vLLM y TGI no estan confirmados para este formato en la informacion disponible. El repo incluye la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags (este) | ~26,9 mil millones | no disponible | ja, en, zh | Apache 2.0 | GGUF | Roleplay NSFW en japones + tags Danbooru, abliterated |
| sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags (original) | ~26,9 mil millones | no disponible | ja, en, zh | Apache 2.0 | safetensors (presumible) | Modelo base del que derivan estas cuantizaciones |
| mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-i1-GGUF | ~26,9 mil millones | no disponible | ja, en, zh | Apache 2.0 | GGUF imatrix | Misma base con cuantizaciones ponderadas de mayor calidad |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otros modelos de roleplay japones, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta disenado para generar contenido para adultos y no aplica filtros de rechazo; no debe desplegase en entornos accesibles a menores ni en servicios publicos sin moderacion.
- Sesgos: al entrenarse sobre datos de Danbooru y roleplay sintetico generado por DeepSeek-V3, puede heredar sesgos de esos datasets, incluyendo estereotipos presentes en la comunidad de etiquetas de anime.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion; en tareas de generacion de etiquetas puede inventar tags inexistentes en el vocabulario Danbooru.
- Limitaciones de idioma: el ajuste fino esta centrado en japones; el rendimiento en ingles y chines puede ser inferior al del modelo base Qwen3.8-27B original.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible, lo que impide garantizar conversaciones muy largas.
- Licencia: Apache 2.0 permite uso comercial, pero la naturaleza del contenido generado puede contravenir las politicas de las plataformas de despliegue y la legislacion local sobre contenido adulto.
- Calidad de cuantizacion: las cuantizaciones Q2_K y Q3_K_S degradan la calidad; el autor recomienda Q4_K_S, Q4_K_M y Q8_0 para uso practico.
- Procedencia: el modelo base Qwen3.8-27B no aparece documentado en la informacion proporcionada; conviene verificar su origen y licencia antes de un despliegue en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-GGUF
- Modelo base original: https://huggingface.co/sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-DanbooruTags-GGUF
- Dataset Danbooru: https://huggingface.co/datasets/dartags/danbooru-2408-blind-captions
- Dataset de roleplay japones: https://huggingface.co/datasets/Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
