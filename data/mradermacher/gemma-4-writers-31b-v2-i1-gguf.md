# mradermacher/Gemma-4-Writers-31B-V2-i1-GGUF

## Resumen

Gemma-4-Writers-31B-V2-i1-GGUF es la distribucion en formato GGUF del modelo Ateron/Gemma-4-Writers-31B-V2, un merge de modelos de la familia Gemma orientado a escritura creativa y roleplay. Lo publica mradermacher, conocido en el ecosistema por generar cuantizaciones de alta calidad (imatrix) de modelos open source para su uso en llama.cpp y derivados. El modelo base tiene 30.697.345.596 parametros (aproximadamente 30,7 mil millones) y esta construido mediante mergekit, combinando pesos de modelos Gemma afinados para tareas de escritura y conversacion.

El modelo resuelve el problema de disponer de un modelo de 31B con licencia permisiva (Apache 2.0) especializado en generacion de prosa larga, narrativa y dialogo de personajes, algo poco habitual en modelos de este tamano. Su relevancia actual radica en que permite desplegar localmente un modelo de escritura de gama alta en hardware de consumo mediante cuantizaciones IQ de 4 bits que ocupan entre 17 y 19 GB, manteniendo buena parte de la calidad del modelo original en fp16.

Esta ficha cubre la version i1-GGUF, que incluye cuantizaciones con imatrix (optimizadas con un dataset de calibracion) y un fichero imatrix para generar cuantizaciones propias. El repositorio incluye ademas cuantizaciones estaticas en un repositorio hermano. El modelo esta etiquetado como vision model en la model card, aunque los ficheros mmproj se alojan en el repositorio estatico, no en este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma), pesos fusionados mediante mergekit |
| Parametros totales | 30.697.345.596 (aprox. 30,7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base Ateron/Gemma-4-Writers-31B-V2 es un merge construido con mergekit a partir de modelos de la familia Gemma, segun indican las etiquetas del repositorio (merge, mergekit). No se dispone de informacion detallada sobre la composicion exacta del merge, los modelos de origen individuales ni la estrategia de fusion (SLERP, TIES, DARE, etc.). La arquitectura subyacente es un transformer decoder-only con atencion por ventanas y RoPE, caracteristica de la familia Gemma, aunque los detalles exactos de la variante "Gemma-4" no se especifican en la informacion disponible.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card del repositorio GGUF no incluye informacion sobre el proceso de entrenamiento del modelo base; solo documenta el proceso de cuantizacion. Las cuantizaciones i1 utilizan un fichero imatrix generado con un dataset de calibracion (etiquetado como "nicoboss" en los metadatos), lo que mejora la calidad de las cuantizaciones de baja precision respecto a las estaticas.

## Capacidades

- Generacion de texto creativo: prosa narrativa, ficcion, poesia y escritura de estilo literario, segun la orientacion del modelo base hacia tareas de escritura.
- Roleplay y dialogo de personajes: etiquetado explicitamente con roleplay, lo que sugiere afinado para mantener personajes y conversaciones multi-turno.
- Conversacion general: etiquetado como conversational, apto para chat.
- Capacidad de vision: la model card indica que es un vision model y que los ficheros mmproj estan en el repositorio estatico, por lo que la version multimodal requeriria descargar dichos ficheros adicionales.
- Idiomas: solo ingles declarado; no se garantiza calidad en castellano ni en otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Escritura creativa asistida: el modelo puede generar capitulos, relatos y descripciones de escena con coherencia estilistica, aprovechando su orientacion a prosa y su tamano de 31B para mantener consistencia en textos largos.
- Roleplay de personajes en aplicaciones de entretenimiento: su etiqueta roleplay y su naturaleza conversacional lo hacen adecuado para chatbots de personajes con memoria de contexto amplia, siempre que se gestione el historial en la ventana disponible.
- Generacion de guiones y dialogos: util para guionistas que necesitan borradores rapidos de escenas dialogadas, con la ventaja de ejecutarse localmente y sin coste por token.
- Prototipado de narrativa interactiva: integrable en motores de ficcion interactiva o videojuegos narrativos mediante llama.cpp u Ollama, con cuantizaciones Q4_K_M de 18,8 GB que caben en GPUs de consumo de 24 GB.
- Fine-tuning posterior sobre estilos de autor: al estar en Apache 2.0 y disponible en safetensors en el modelo base, se puede usar como punto de partida para LoRA o fine-tuning completo orientado a un genero o registro concreto.
- Investigacion sobre merges de modelos: sirve como caso de estudio de mergekit y de cuantizacion imatrix, comparando la calidad de las distintas cuantizaciones IQ frente a las estaticas en tareas de escritura.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, permite procesar manuscritos o material confidencial sin enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre 7,3 GB (i1-IQ1_S) y 25,3 GB (i1-Q6_K) para los pesos cuantizados; anadir overhead de contexto KV cache (tipicamente 1-4 GB adicionales segun longitud de contexto y numero de capas).
- Cuantizacion recomendada para equilibrio calidad/velocidad: i1-Q4_K_M (18,8 GB), descrita por el autor como "fast, recommended".
- GPU de consumo: cabe en RTX 4090 (24 GB) con Q4_K_M, Q5_K_M (21,9 GB) e incluso Q6_K (25,3 GB) con offloading parcial; en RTX 3090 (24 GB) aplican las mismas opciones. En GPUs de 16 GB cabe con IQ3_M (14,5 GB) o IQ4_XS (16,8 GB, al limite).
- GPU profesionales: A100 40/80 GB y H100 permiten cargar el modelo en Q6_K o en fp16 (aproximadamente 61 GB en fp16, no incluido en este repositorio GGUF).
- Despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para vision, se requieren los ficheros mmproj del repositorio estatico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-Writers-31B-V2-i1-GGUF (este) | 30,7B | no disponible | Apache 2.0 | GGUF | Merge orientado a escritura y roleplay, cuantizaciones imatrix |
| Gemma-4-Writers-31B-V2-GGUF (estatico) | 30,7B | no disponible | Apache 2.0 | GGUF | Mismas cuantizaciones sin imatrix; incluye mmproj para vision |
| Ateron/Gemma-4-Writers-31B-V2 (base) | 30,7B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Modelos de escritura de ~30B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para comparar rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos: al ser un merge de modelos Gemma entrenados principalmente con datos en ingles, hereda los sesgos de dichos datos; no se documentan evaluaciones de sesgo en la informacion disponible.
- Riesgo de alucinacion: como todo modelo generativo, puede producir hechos inventados, especialmente en tareas factuales; su orientacion a ficcion y roleplay agrava este riesgo si se usa para informacion veraz.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- Contexto: la longitud de contexto no esta documentada en la informacion proporcionada; conviene verificarla en el modelo base antes de disenar aplicaciones con historiales largos.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 (7-11 GB) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "mostly desperate".
- Vision: los ficheros mmproj no estan en este repositorio; para uso multimodal hay que descargarlos del repositorio estatico.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos de los modelos Gemma originales que componen el merge, ya que las licencias de los modelos de origen podrian imponer condiciones adicionales.
- Produccion: no hay benchmarks publicados ni garantias de calidad; se recomienda evaluacion propia antes de desplegar en entornos productivos.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Gemma-4-Writers-31B-V2-i1-GGUF
- Modelo base: https://huggingface.co/Ateron/Gemma-4-Writers-31B-V2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma-4-Writers-31B-V2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-Writers-31B-V2-i1-GGUF
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
