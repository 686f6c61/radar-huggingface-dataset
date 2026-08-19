# mradermacher/Melody1437-26B-A4B-i1-GGUF

## Resumen

Melody1437-26B-A4B es un modelo de lenguaje basado en la arquitectura Gemma 4 en configuracion de mezcla de expertos (MoE), con 25.233 millones de parametros totales y aproximadamente 4.000 millones de parametros activos. Desarrollado por ReadyArt y cuantizado a formato GGUF por mradermacher, el modelo esta orientado a roleplay y conversacion sin restricciones, habiendo sido sometido a un proceso de "abliteration" que elimina las capas de rechazo y alineacion de seguridad del modelo original. La etiqueta "unaligned" en su model card confirma esta caracteristica.

Esta version i1-GGUF proporciona una cuantizacion con imatrix en formato Q2_K, con un peso de 10,7 GB, lo que permite su ejecucion en hardware de consumo. El modelo soporta exclusivamente ingles y esta orientado a generacion de contenido adulto explicito, incluyendo roleplay erotico (ERP). Su licencia Apache 2.0 permite uso comercial, aunque su naturaleza sin alineacion implica riesgos significativos. Se trata de un modelo de vision, con archivos mmproj disponibles en el repositorio estatico de quants.

El modelo resulta relevante en el ecosistema actual por representar la tendencia de modelos "abliterados" que eliminan salvaguardas de seguridad para aplicaciones creativas y de roleplay sin censura, aunque con implicaciones eticas y legales considerables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (MoE) |
| Parametros totales | 25.233.142.046 (~25,2B) |
| Parametros activos | ~4B (segun nomenclatura A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (10,7 GB), archivo imatrix (0,2 GB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base ReadyArt/Melody1437-26B-A4B se construye sobre la arquitectura Gemma 4 en configuracion de mezcla de expertos (MoE), con 25.233 millones de parametros totales y aproximadamente 4.000 millones de parametros activos por token, segun indica la nomenclatura "A4B". El proceso de "abliteration" documentado en el proyecto Gemma 4 Abliteration elimina las direcciones de rechazo del modelo, resultando en un modelo sin alineacion que no rechaza peticiones de contenido adulto o explicito.

La cuantizacion realizada por mradermacher utiliza el metodo imatrix (i1), que optimiza la asignacion de bits basandose en la importancia de cada tensor calculada sobre un dataset de calibracion. Esta version concreta incluye unicamente el quant i1-Q2_K de 10,7 GB, aunque el autor indica que existen quants estaticos adicionales en un repositorio separado. El modelo es capaz de procesar vision, ya que la model card menciona archivos mmproj en el repositorio estatico, lo que sugiere capacidades multimodales.

## Capacidades

- Generacion de texto conversacional e instructivo en ingles.
- Roleplay interactivo multi-turno con personajes, manteniendo coherencia contextual.
- Generacion de contenido adulto explicito y erotico (NSFW, ERP) sin rechazo.
- Capacidades de vision multimodal, con archivos mmproj disponibles en el repositorio estatico.
- Sin alineacion de seguridad: no rechaza peticiones de contenido maduro ni explicito.
- Soporte para formato conversacional e instrucciones.

## Casos de uso

- Roleplay erotico en chats: el modelo mantiene conversaciones explicitas multi-turno sin rechazar peticiones, gracias a su naturaleza sin alineacion. Adecuado para aplicaciones de chat con personajes adultos.
- Escritura creativa de ficcion adulta: genera narrativa explicita bajo demanda, util para autores que necesitan un asistente de escritura sin censura.
- Simulacion de personajes conversacionales: su entrenamiento en roleplay permite mantener coherencia de personaje durante conversaciones largas.
- Generacion de dialogos para juegos con clasificacion adulta: desarrolladores pueden usarlo para generar dialogos de personajes en juegos con contenido maduro.
- Prototipado de aplicaciones de chat sin filtros: investigadores que estudian modelos sin alineacion pueden usarlo como referencia de comportamiento.
- Pruebas de sistemas de moderacion: su naturaleza sin restricciones lo hace util para evaluar sistemas de filtrado de contenido y moderacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El quant i1-Q2_K ocupa 10,7 GB, por lo que cabe en GPUs consumer con 12-16 GB de VRAM (RTX 3060 12GB, RTX 4070, RTX 4080, RTX 4090).
- En configuracion CPU-only, puede ejecutarse con llama.cpp usando 12-16 GB de RAM.
- Se puede desplegar con llama.cpp, Ollama, LM Studio o cualquier runtime compatible con GGUF.
- Para uso con vision (mmproj), se necesitara el repositorio estatico con los archivos de proyeccion multimodal.
- La cuantizacion Q2_K es muy agresiva; se espera perdida de calidad significativa respecto al modelo original en safetensors.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Melody1437-26B-A4B (este) | 25,2B (4B activos) | no disponible | Apache 2.0 | GGUF |
| gemma-4-26B-A4B-it-heretic-GGUF | 26B (4B activos) | no disponible | no disponible | GGUF |
| Gemma 4 26B-A4B (original) | 26B (4B activos) | no disponible | no disponible | safetensors |

No se dispone de datos de rendimiento comparativos entre estos modelos.

## Limitaciones y advertencias

- Contenido explicito: el modelo genera contenido adulto y erotico sin restricciones, lo que puede ser inapropiado para muchos contextos profesionales o publicos.
- Sin alineacion de seguridad: al haber sido "abliterado", no rechaza peticiones daninas, lo que implica riesgos de uso indebido y responsabilidad legal.
- Solo ingles: no soporta otros idiomas.
- Cuantizacion agresiva: el quant Q2_K disponible en este repositorio tiene perdida de calidad significativa; se recomienda usar quants de mayor precision del repositorio estatico si la VRAM lo permite.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inconsistente, especialmente con cuantizaciones bajas.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede tener implicaciones legales segun la jurisdiccion.
- La informacion sobre longitud de contexto y capacidades de vision no esta completamente documentada en la model card.
- El repositorio registra 0 descargas y 0 likes, lo que indica que es un modelo reciente o poco probado en la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Melody1437-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-26B-A4B
- Repositorio estatico de quants: https://huggingface.co/mradermacher/Melody1437-26B-A4B-GGUF
- Proyecto Gemma 4 Abliteration: https://github.com/TrevorS/gemma-4-abliteration
- Pagina de descargas del autor: https://hf.tst.eu/model#Melody1437-26B-A4B-i1-GGUF
