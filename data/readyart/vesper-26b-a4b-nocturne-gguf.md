# ReadyArt/Vesper-26B-A4B-Nocturne-GGUF

## Resumen

Vesper-26B-A4B-Nocturne-GGUF es la versión cuantizada en formato GGUF de Vesper-26B-A4B-Nocturne, un modelo de lenguaje de gran tamano desarrollado por ReadyArt (Ready.Art), una organizacion de Hugging Face con 93 modelos publicados y 4,2 millones de descargas acumuladas. El modelo esta especializado en generacion de texto conversacional para roleplay adulto, con soporte para escenas multi-personaje y contenido para adultos, y se distribuye bajo licencia Apache 2.0.

El modelo cuenta con 25.233.142.046 parametros totales (aproximadamente 25,2 mil millones) y sigue una arquitectura de mezcla de expertos (MoE) segun indica el sufijo "A4B" de su nombre, que sugiere 4 mil millones de parametros activos por token. El repositorio GGUF ocupa 230,6 GB, lo que refleja la presencia de multiples niveles de cuantizacion. Esta disponible unicamente en ingles y esta etiquetado como no apto para todas las audiencias.

La relevancia de esta ficha radica en documentar un modelo de nicho orientado a roleplay y contenido adulto, un segmento con demanda creciente pero escasa documentacion tecnica rigurosa. El modelo base Vesper-26B-A4B-Nocturne se distribuye en formato safetensors, mientras que esta version GGUF facilita su despliegue en entornos con llama.cpp y herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), segun el sufijo A4B del nombre; detalles no disponibles |
| Parametros totales | 25.233.142.046 (aproximadamente 25,2 mil millones) |
| Parametros activos | 4 mil millones (inferido del sufijo A4B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Multiples variantes GGUF (el repositorio ocupa 230,6 GB, lo que implica varios niveles); niveles concretos no disponibles |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo. El sufijo "A4B" del nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 4 mil millones de parametros activos sobre un total de 25,2 mil millones, un patron habitual en modelos MoE eficientes. No obstante, esta inferencia no esta confirmada por la model card, que se centra en la presentacion estetica y no incluye detalles tecnicos sobre la arquitectura.

Tampoco se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otros metodos de alineacion. La model card del repositorio GGUF unicamente indica que se trata de una cuantizacion del modelo base ReadyArt/Vesper-26B-A4B-Nocturne. Para obtener detalles sobre el entrenamiento seria necesario consultar la model card del modelo base, que no se incluye en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional orientada a roleplay adulto y contenido para adultos.
- Soporte para escenas multi-personaje (etiqueta "multi-character") y composicion de elenco (etiqueta "ensemble").
- Dialogo sin censura y tematicas maduras, segun las etiquetas del repositorio.
- Generacion de texto en ingles exclusivamente.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).
- No se dispone de informacion sobre capacidades de codigo o matematicas.

## Casos de uso

- Roleplay conversacional para adultos: el modelo esta disenado especificamente para mantener dialogos inmersivos con tematicas maduras, lo que lo hace adecuado para plataformas de entretenimiento conversacional para adultos que requieran contenido sin censura.
- Simulacion de personajes multiples: gracias a su etiqueta "multi-character" y "ensemble", puede gestionar escenas con varios personajes interactuando, util para narrativa interactiva y juegos de rol por texto.
- Creacion de ficcion interactiva: escritores y creadores de contenido pueden emplearlo para generar dialogos y tramas en proyectos de ficcion para adultos, con coherencia de personaje a lo largo de conversaciones.
- Prototipado de chatbots de personaje: desarrolladores que construyan asistentes de rol con personalidad definida pueden desplegar la version GGUF en llama.cpp u Ollama para pruebas locales sin infraestructura de GPU dedicada.
- Investigacion sobre modelos de nicho: investigadores interesados en el comportamiento de modelos especializados en contenido adulto y en tecnicas de cuantizacion de modelos MoE de 25B pueden usar esta version como objeto de estudio.
- Despliegue en entornos con recursos limitados: la version GGUF permite ejecutar el modelo en hardware de consumo mediante cuantizaciones de baja precision, algo inviable con los pesos completos en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en los 25,2 mil millones de parametros totales, una cuantizacion Q4 requeriria aproximadamente 14-16 GB de VRAM, y una Q8 aproximadamente 27-30 GB; estas cifras son estimaciones genericas y no estan confirmadas para este modelo.
- GPU recomendadas: no disponibles en la informacion proporcionada. Para los pesos completos en safetensors seria necesario hardware de clase A100 o H100 con suficiente memoria; para las cuantizaciones GGUF, GPUs de consumo como RTX 4090 (24 GB) podrian alojar cuantizaciones de 4 bits.
- Cabe en GPU de consumo: probablemente si, en cuantizaciones de 4 bits y con GPUs de 16-24 GB, aunque no esta confirmado oficialmente.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con endpoints de Hugging Face. No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Vesper-26B-A4B-Nocturne-GGUF | 25,2B (MoE, ~4B activos) | no disponible | Apache 2.0 | GGUF | Roleplay adulto, solo ingles |
| Serenity-26B-A4B | 26B (MoE, ~4B activos) | 32.768 tokens | no disponible | no disponible | Roleplay adulto de ReadyArt, basado en GEMMA-4, combina Melody y Darkside |
| Alternativas de roleplay adulto de 20-30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la informacion proporcionada |

El modelo mas directamente comparable es Serenity-26B-A4B, del mismo autor y con un tamano y proposito similares (roleplay adulto, arquitectura MoE de ~4B activos), aunque con contexto documentado de 32.768 tokens y una base declarada GEMMA-4. No se dispone de informacion suficiente para comparar rendimiento entre ambos.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como "nsfw", "adult-content", "mature" y "not-for-all-audiences"; no es adecuado para uso general ni para menores.
- Idioma: solo soporta ingles, lo que limita su uso en entornos en castellano u otros idiomas.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, pero un modelo entrenado para roleplay adulto sin censura presenta riesgos elevados de generar contenido sesgado, estereotipado o inapropiado.
- Riesgo de alucinacion: no cuantificado; como modelo generativo conversacional, es esperable que produzca afirmaciones factualmente incorrectas, especialmente fuera de su dominio de roleplay.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a normativas sobre material adulto y a las politicas de las plataformas de despliegue.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion comunitaria; no hay benchmarks publicados que respalden su calidad.
- La model card del repositorio GGUF esta dominada por estilos CSS y no aporta informacion tecnica sustantiva sobre el entrenamiento o el rendimiento.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/ReadyArt/Vesper-26B-A4B-Nocturne-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Vesper-26B-A4B-Nocturne
- Perfil de la organizacion ReadyArt: https://huggingface.co/ReadyArt/collections
- Estadisticas de modelos de ReadyArt en OpenModelStats: https://openmodelstats.com/owners/readyart
- Modelo Serenity-26B-A4B (comparable del mismo autor): https://featherless.ai/models/ReadyArt/Serenity-26B-A4B
