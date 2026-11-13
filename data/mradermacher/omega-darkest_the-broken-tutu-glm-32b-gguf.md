# mradermacher/Omega-Darkest_The-Broken-Tutu-GLM-32B-GGUF

## Resumen

Omega-Darkest_The-Broken-Tutu-GLM-32B-GGUF es una coleccion de cuantizaciones GGUF estaticas del modelo ReadyArt/Omega-Darkest_The-Broken-Tutu-GLM-32B, publicadas por mradermacher, un conocido generador de cuantizaciones de la comunidad de Hugging Face. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local del modelo base, que a su vez es un fine-tune de la familia GLM de 32B orientado a roleplay explicito, narrativa de terror y contenido para adultos.

El modelo cuenta con 32.566.081.536 parametros totales (aproximadamente 32,6 mil millones) y esta disenado para conversacion y generacion de ficcion. Su orientacion es claramente NSFW: los tags incluyen nsfw, explicit, ERP (erotic roleplay), horror y violence, y la model card advierte explicitamente que no es apto para todas las audiencias. La licencia es MIT, lo que facilita su uso y redistribucion, aunque el contenido generado sigue estando sujeto a las politicas de cada plataforma.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 32B en hardware de consumo mediante cuantizaciones que van desde Q2_K (12,4 GB) hasta Q8_0 (34,7 GB), con variantes IQ disponibles en un repositorio separado. Para desarrolladores e investigadores interesados en generacion creativa, roleplay o estudio de modelos "unaligned", esta es una via directa para desplegar el modelo en local sin necesidad de GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM de 32B; detalles no especificados en la informacion proporcionada) |
| Parametros totales | 32.566.081.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repositorio i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por el nombre y el tamano (32B), se trata presumiblemente de un transformer de la familia GLM, pero no se confirma en la documentacion proporcionada el numero de capas, la dimension oculta, el mecanismo de atencion ni la longitud de contexto nativa. Tampoco se especifican los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si se documenta es el proceso de cuantizacion: mradermacher ha generado cuantizaciones estaticas (no imatrix en este repositorio) con la herramienta estandar de llama.cpp, usando el tipo de conversion "hf" y cuantizacion de tensores de salida. Las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio aparte (i1-GGUF). El modelo base es un fine-tune de ReadyArt orientado a roleplay explicito, terror y violencia, lo que sugiere un ajuste sobre un GLM preentrenado con datos de ficcion y conversacion para adultos.

## Capacidades

- Generacion de texto conversacional y narrativo en ingles, orientada a roleplay multi-turno.
- Contenido explicito para adultos (ERP), terror y violencia, segun los tags del autor.
- Modelo "unaligned": no incorpora los filtros de seguridad habituales de los modelos comerciales, lo que permite explorar narrativas sin restricciones tematicas.
- Soporte de conversacion multi-turno con mantenimiento de personaje y contexto narrativo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se documentan capacidades de codigo o matematicas como objetivo del fine-tune.

## Casos de uso

- Roleplay conversacional para adultos: el modelo esta ajustado especificamente para ERP y narrativa explicita, con capacidad de mantener personajes y tramas a lo largo de conversaciones multi-turno.
- Generacion de ficcion de terror y suspense: los tags de horror y violence indican un ajuste hacia narrativa oscura, util para escritores que necesitan borradores de escenas intensas.
- Prototipado de chatbots de personaje en local: al estar en GGUF, se puede desplegar con llama.cpp u Ollama en una estacion de trabajo sin depender de APIs externas.
- Investigacion sobre modelos "unaligned": util para estudiar como se comporta un modelo sin filtros de seguridad en tareas creativas y que riesgos emergen.
- Generacion de dialogos para videojuegos o narrativa interactiva: la orientacion a roleplay y el contexto conversacional lo hacen adecuado para arboles de dialogo ramificados en ficcion para adultos.
- Experimentacion con cuantizaciones: el repositorio ofrece 11 variantes de cuantizacion, lo que permite comparar calidad y velocidad en distintos presupuestos de VRAM para un mismo modelo de 32B.
- Escritura asistida de guiones o relatos explicitos: para autores que trabajan en generos adultos y necesitan un modelo que no rechace el contenido por politicas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~12,4 GB; Q3_K_S ~14,5 GB; Q3_K_M ~16,0 GB; Q3_K_L ~17,3 GB; IQ4_XS ~17,9 GB; Q4_K_S ~18,8 GB; Q4_K_M ~19,8 GB; Q5_K_S ~22,6 GB; Q5_K_M ~23,2 GB; Q6_K ~26,8 GB; Q8_0 ~34,7 GB.
- Para contexto largo hay que sumar la cache KV, que no se puede estimar sin conocer la longitud de contexto y la arquitectura; preve varios GB adicionales.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M con contexto moderado; RTX 3090 (24 GB) similar; A100 40/80 GB o H100 para Q8_0 y contextos amplios; GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo para Q3 o IQ4_XS con contexto corto.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4-Q5; en GPUs de 16 GB con Q3; en GPUs de 12 GB solo Q2_K y con contexto muy limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp; vLLM y TGI no soportan GGUF de forma nativa (requeririan el modelo base en safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Omega-Darkest_The-Broken-Tutu-GLM-32B (este) | 32,6B | no disponible | MIT | GGUF | Fine-tune NSFW/ERP sobre GLM-32B |
| Modelo base ReadyArt/Omega-Darkest_The-Broken-Tutu-GLM-32B | 32,6B | no disponible | MIT | safetensors | Version sin cuantizar del mismo modelo |
| Variantes imatrix (mradermacher/...-i1-GGUF) | 32,6B | no disponible | MIT | GGUF | Misma base con cuantizacion ponderada, mayor calidad por tamano |
| Otros fine-tunes GLM-32B de la comunidad | ~32B | no disponible | variable | safetensors/GGUF | No se dispone de datos concretos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido explicito y potencialmente perturbador: el modelo esta disenado para NSFW, ERP, terror y violencia; no es apto para todas las audiencias ni para entornos profesionales sin filtrado.
- Modelo "unaligned": no incorpora salvaguardas de seguridad, por lo que puede generar contenido danino, ilegal o eticamente problematico si se usa sin moderacion.
- Riesgo de alucinacion: como cualquier LLM de 32B, puede inventar hechos, especialmente en contextos narrativos largos; no es fiable como fuente de informacion factual.
- Solo ingles: la model card declara unicamente el idioma en; el rendimiento en castellano no esta garantizado.
- Longitud de contexto no documentada: no se puede planificar el uso en conversaciones muy largas sin verificar experimentalmente el limite real.
- Licencia MIT: permite uso comercial, pero el contenido generado sigue sujeto a las leyes aplicables y a las politicas de las plataformas de despliegue; el autor no ofrece garantias.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_M) degradan notablemente la coherencia; para produccion se recomienda Q4_K_M o superior.
- No hay benchmarks publicados: no se puede comparar objetivamente su calidad frente a otros fine-tunes de roleplay.
- El repositorio ocupa 222,9 GB en total; descargar todas las variantes requiere espacio considerable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Omega-Darkest_The-Broken-Tutu-GLM-32B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Omega-Darkest_The-Broken-Tutu-GLM-32B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Omega-Darkest_The-Broken-Tutu-GLM-32B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Omega-Darkest_The-Broken-Tutu-GLM-32B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
