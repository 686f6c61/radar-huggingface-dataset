# mradermacher/Promethean-Dawn-26B-A4B-i1-GGUF

## Resumen

Promethean-Dawn-26B-A4B-i1-GGUF es la version cuantizada en formato GGUF del modelo Naphula/Promethean-Dawn-26B-A4B, publicada por el usuario mradermacher. Se trata de un modelo de arquitectura Mixture of Experts (MoE) de aproximadamente 26.000 millones de parametros totales, con un nombre que sugiere unos 4.000 millones de parametros activos por token ("A4B"), generado mediante tecnicas de fusion de modelos (mergekit y mergekit-exp) sobre una base asociada a la familia Gemma (etiqueta "gemma4"). El modelo esta orientado de forma explicita a la escritura creativa: ficcion, terror, romance, ciencia ficcion, generacion de tramas y sub-tramas, roleplay y continuacion de escenas.

La relevancia de esta publicacion concreta es practica: el autor ha generado cuantizaciones con imatrix (weighted/imatrix quants) que abarcan desde IQ1_S (8,6 GB) hasta Q6_K (23,3 GB), lo que permite ejecutar un modelo de ~26B parametros en hardware de consumo. Incluye tambien el fichero imatrix para que terceros puedan crear sus propias cuantizaciones. El modelo trabaja unicamente en ingles (idioma declarado: "eng") y se distribuye bajo licencia Apache 2.0.

Existe ademas un repositorio hermano con cuantizaciones estaticas (mradermacher/Promethean-Dawn-26B-A4B-GGUF), donde el autor indica que se alojan los ficheros mmproj al tratarse de un modelo con capacidad de vision. No se ha publicado informacion sobre longitud de contexto, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) por fusion de modelos; etiquetas "moe_della", "mergekit", "gemma4" |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | ~4B (segun la nomenclatura "A4B" del nombre del modelo; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K. Cuantizaciones estaticas adicionales en repositorio aparte |
| Idiomas soportados | ingles (eng) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo i1); el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base Naphula/Promethean-Dawn-26B-A4B se presenta con las etiquetas "merge", "mergekit", "mergekit-exp" y "moe_della", lo que indica que no procede de un entrenamiento desde cero, sino de una fusion de modelos (model merging) realizada con las herramientas mergekit y mergekit-exp sobre una arquitectura MoE con base asociada a Gemma ("gemma4"). La etiqueta "della" hace referencia a un metodo de fusion especifico, y "A4B" a la relacion entre parametros totales y activos propia de un MoE. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

Esta publicacion concreta (mradermacher/Promethean-Dawn-26B-A4B-i1-GGUF) no modifica los pesos del modelo, sino que los recuantiza. El autor emplea cuantizaciones ponderadas con imatrix (fichero Promethean-Dawn-26B-A4B.imatrix.gguf, 0,2 GB) para optimizar la calidad por tamano, y distribuye variantes que van desde IQ1_S (cuantizacion de 1 bit, marcada como "for the desperate") hasta Q6_K (23,3 GB, descrita como "practically like static Q6_K"). Segun la model card, IQ-quants suelen ser preferibles a cuantizaciones no-IQ de tamano similar. No se documentan innovaciones arquitectonicas adicionales mas alla de la propia fusion MoE.

## Capacidades

- Generacion de texto creativo en ingles: ficcion en multiples generos (terror, romance, ciencia ficcion), prosificacion vivida y descripcion detallada.
- Generacion de tramas y sub-tramas argumentales para relatos y novelas.
- Roleplay y conversacion multi-turno orientada a personajes, con etiquetas como "rp", "roleplaying" y "conversational".
- Continuacion de escenas ("scene continue") y desarrollo de narrativa a partir de un contexto dado.
- Escritura con lenguaje explicito, incluido el uso de tacos ("swearing") como capacidad declarada.
- Capacidad de vision: la model card indica que es un modelo con vision; los ficheros mmproj, si existen, se alojan en el repositorio de cuantizaciones estaticas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.

## Casos de uso

- Escritura asistida de ficcion: el modelo puede generar capitulos completos, desarrollar arcos narrativos y mantener coherencia de estilo en textos largos, aprovechando su orientacion explicita a la escritura creativa.
- Generacion de tramas para guiones o novelas: dado un punto de partida, produce tramas principales y subtramas con giros argumentales, util para autores que necesitan explorar multiples lineas narrativas antes de escribir.
- Roleplay conversacional: con etiquetas "rp" y "roleplaying", encaja en aplicaciones de personajes interactivos, simulaciones narrativas o juegos de texto donde el usuario conversa con un personaje de forma sostenida.
- Continuacion de escenas en herramientas de escritura: integrado en un editor, permite al autor seleccionar un fragmento y pedir una continuacion coherente con tono, genero y personajes existentes.
- Prototipado de contenido para entretenimiento: generacion de relatos breves, dialogos y descripciones para videojuegos, podcasts de ficcion o plataformas de lectura serializada, en ingles.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones desde 8,6 GB, es viable ejecutarlo en una GPU de gama alta de consumo para generar texto en privado, sin enviar contenido a servicios externos.
- Bot de escritura creativa en ingles: crear un asistente especializado que ayude a superar el bloqueo del escritor proponiendo escenas, dialogos o descripciones vividas.
- Generacion de descripciones de imagenes o asistencia multimodal: si se dispone del fichero mmproj correspondiente desde el repositorio estatico, se podria emplear su capacidad de vision, aunque la informacion disponible no detalla su alcance.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda no incluyen datos de MMLU, HumanEval, GSM8K ni de evaluaciones de escritura creativa para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia (segun tamano real de los ficheros GGUF i1 publicados):
  - i1-IQ1_S: 8,6 GB.
  - i1-IQ2_M: 10,8 GB.
  - i1-IQ3_M: 12,8 GB.
  - i1-IQ4_XS: 14,4 GB.
  - i1-Q4_K_M: 17,3 GB ("fast, recommended").
  - i1-Q5_K_M: 19,7 GB.
  - i1-Q6_K: 23,3 GB.
- GPU recomendadas: no especificadas por el autor. Por tamano, las cuantizaciones bajas (IQ1 a IQ3) caben en GPUs de consumo de 12-16 GB (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti / 4080 16 GB); las cuantizaciones Q4_K_M y superiores requieren 24 GB (RTX 3090 / 4090) o GPU de datacenter (A100, H100) para mayor margen y contexto amplio.
- Compatibilidad con GPU de consumo: si, al menos en las cuantizaciones de menor tamano (desde 8,6 GB), siempre que se ajuste el contexto segun la VRAM disponible.
- Opciones de despliegue: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores basados en llama.cpp. El modelo base (safetensors) permite despliegue con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada no incluye modelos comparables con datos verificables de parametros, contexto o rendimiento. Se puede comparar esta publicacion con sus variantes directas:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Promethean-Dawn-26B-A4B-i1-GGUF (este) | ~26B totales, ~4B activos | GGUF (i1/imatrix) | Apache 2.0 | Cuantizaciones ponderadas con imatrix, de 8,6 a 23,3 GB |
| Promethean-Dawn-26B-A4B-GGUF (estatico) | ~26B totales, ~4B activos | GGUF (static) | Apache 2.0 | Repositorio hermano; aloja los ficheros mmproj de vision |
| Naphula/Promethean-Dawn-26B-A4B (base) | ~26B totales, ~4B activos | safetensors | Apache 2.0 | Modelo original sin cuantizar |

Comparacion con modelos alternativos de otras familias (por ejemplo, otros MoE o modelos de escritura creativa): no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada. Al ser un modelo de ficcion, puede reproducir estereotipos presentes en los datos de los modelos fusionados.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones especificas de fidelidad factica. Su orientacion creativa implica que prioriza la coherencia narrativa sobre la exactitud factual.
- Limitaciones de idioma: declarado unicamente para ingles ("eng"). El rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Limitaciones de contexto: la longitud de contexto no esta disponible en la informacion proporcionada; conviene verificarla antes de disenar aplicaciones que requieran ventanas largas.
- Restricciones de licencia: Apache 2.0, lo que permite uso comercial con atribucion y sin copyleft. No obstante, conviene verificar las licencias de los modelos fusionados en el modelo base.
- Caveats de produccion: se trata de una cuantizacion de comunidad (no oficial) y con muy pocas descargas (1021) y cero "likes" en el momento de la consulta, por lo que la validacion externa es escasa. Las cuantizaciones de 1 y 2 bits (IQ1_S, IQ1_M, IQ2_XXS, etc.) presentan degradacion de calidad segun la propia model card ("very low quality", "lower quality"), por lo que no son recomendables para uso en produccion.
- Contenido: incluye etiquetas de lenguaje explicito y tacos ("swearing"); puede requerir filtrado si se despliega en entornos con publico general.

## Enlaces

- Repositorio i1 (imatrix) GGUF: https://huggingface.co/mradermacher/Promethean-Dawn-26B-A4B-i1-GGUF
- Repositorio estatico GGUF (incluye mmproj de vision): https://huggingface.co/mradermacher/Promethean-Dawn-26B-A4B-GGUF
- Modelo base: https://huggingface.co/Naphula/Promethean-Dawn-26B-A4B
- Pagina de descarga del autor para este modelo: https://hf.tst.eu/model#Promethean-Dawn-26B-A4B-i1-GGUF
- Pagina del cuantizador mradermacher: https://huggingface.co/mradermacher/models
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Promethean-Dawn-26B-A4B-i1-GGUF/resolve/main/Promethean-Dawn-26B-A4B.imatrix.gguf
- Paper o blog del modelo: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
