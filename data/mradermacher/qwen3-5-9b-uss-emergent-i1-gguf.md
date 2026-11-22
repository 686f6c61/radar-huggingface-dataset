# mradermacher/Qwen3.5-9B-USS-Emergent-i1-GGUF

## Resumen

Qwen3.5-9B-USS-Emergent-i1-GGUF es una cuantizacion en formato GGUF, realizada por mradermacher, del modelo nightmedia/Qwen3.5-9B-USS-Emergent. Se trata de un modelo de lenguaje de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) derivado de la familia Qwen3.5/Qwen3.6, afinado mediante SFT y LoRA y orientado a razonamiento con cadena de pensamiento larga (long-CoT), generacion de codigo, matematicas, STEM y escritura creativa de ficcion. La model card lo etiqueta como experimental y menciona tecnicas de destilacion (claude-distillation), fusion con mergekit y decodificacion especulativa por prediccion multi-token.

El interes practico de esta publicacion es que ofrece el modelo base en una bateria amplia de cuantizaciones GGUF (desde Q2_K hasta Q6_K, incluyendo variantes IQ), lo que permite ejecutarlo en hardware de consumo con llama.cpp u Ollama. La model card declara soporte de contexto de 256k y 1M tokens, capacidades multilingues en ingles, chino, japones y espanol, y licencia Apache 2.0, lo que facilita su uso comercial.

Conviene subrayar que la informacion disponible procede casi exclusivamente de la model card del cuantizador y de las etiquetas del repositorio; no se han publicado resultados de benchmarks, detalles de composicion del dataset ni especificaciones cerradas de arquitectura mas alla de las inferidas por el nombre y las etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5/Qwen3.6 (detalle exacto no disponible) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256k y 1M tokens segun etiquetas de la model card (no verificado) |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; tambien quants estaticos en el repo hermano |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: se identifica como un modelo de la familia Qwen3.5 (con referencias cruzadas a Qwen3.6), decoder-only, con pesos en bf16 en el modelo base y afinado mediante SFT y LoRA. Las etiquetas mencionan tambien mergekit, lo que sugiere que el modelo base pudo construirse por fusion de modelos, y multi-token-prediction junto con speculative-decoding, lo que apunta a soporte o entrenamiento orientado a decodificacion especulativa. Se etiqueta como claude-distillation, indicando un posible proceso de destilacion a partir de trazas de un modelo tipo Claude.

No se dispone del numero de tokens de entrenamiento, de la composicion del dataset, ni de si se aplico RLHF o DPO. La model card del cuantizador no aporta estos datos y el repositorio base (nightmedia/Qwen3.5-9B-USS-Emergent) no se ha incluido en la informacion proporcionada mas alla de su identificador. La cuantizacion se ha realizado con fichero imatrix, lo que mejora la calidad de las variantes IQ respecto a cuantizaciones sin matriz de importancia.

## Capacidades

- Generacion de texto conversacional e instruction-tuned.
- Razonamiento con cadena de pensamiento larga (long-CoT) y modo de razonamiento explicito.
- Generacion de codigo y tareas de programacion.
- Matematicas y problemas STEM.
- Escritura creativa: ficcion, generacion de trama y subtrama, continuacion de escenas, narrativa vivida, todos los generos y ciencia ficcion.
- Roleplaying.
- Capacidades multilingues en ingles, chino, japones y espanol.
- Posible soporte de vision: la model card del cuantizador indica que es un modelo de vision y que los ficheros mmproj, si existen, estarian en el repositorio estatico; no se confirma su disponibilidad en este repositorio.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque las etiquetas de razonamiento y long-CoT lo hacen plausible.
- Compatibilidad con endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Generacion de codigo en produccion: el modelo esta etiquetado para coding y puede integrarse en asistentes de programacion o pipelines de revision; su tamano de 9,2 B permite desplegarlo en una sola GPU o en estaciones de trabajo con cuantizacion Q4_K_M (5,9 GB) y latencia razonable.
- Razonamiento matematico y STEM asistido: el modo long-CoT permite resolver problemas paso a paso en entornos educativos o de analisis tecnico, con la salvedad de que la cadena de pensamiento debe validarse.
- Escritura creativa y narrativa: la model card destaca generacion de tramas, subtramas, continuacion de escenas y ficcion en todos los generos, lo que lo hace adecuado para herramientas de escritura asistida y generacion de borradores literarios.
- Roleplaying y personajes conversacionales: la etiqueta roleplaying y el enfoque conversacional permiten construir chatbots de personaje con contexto largo.
- Atencion al cliente multilingue: con soporte declarado de en, zh, ja y es, puede gestionar conversaciones multi-turno en esos idiomas; el contexto declarado de 256k/1M facilitaria historiales largos, aunque no se ha verificado su comportamiento real a esas longitudes.
- Procesamiento de documentos largos: si el contexto de 256k se confirma, es viable resumir o extraer informacion de contratos, informes o codigo extenso en una sola pasada.
- Despliegue local y experimental: al estar disponible en GGUF con cuantizaciones desde 4,0 GB, sirve para prototipado en portatiles con GPU de consumo y para investigacion sobre destilacion y fusion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,0 GB para i1-Q2_K, 5,9 GB para i1-Q4_K_M, 6,7 GB para i1-Q5_K_M y 7,7 GB para i1-Q6_K, segun los tamanos de fichero de la model card (sin contar overhead de contexto KV cache).
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 3060 de 12 GB, RTX 4070/4080 o RTX 4090 pueden alojar las cuantizaciones Q4-Q6; para bf16 completo (aproximadamente 18,4 GB solo de pesos) se necesitaria una GPU de 24 GB o superior (RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M o inferiores con GPUs de 8-12 GB; las variantes Q5/Q6 requieren 8-12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; el modelo base es compatible con transformers; no se confirma soporte de vLLM o TGI para esta cuantizacion.
- Latencia y throughput: no disponibles. El contexto declarado de 256k/1M incrementaria significativamente el consumo de KV cache y reduciria el throughput si se usa a longitudes extremas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-USS-Emergent-i1-GGUF (este) | 9,2 B | 256k/1M (declarado) | Apache 2.0 | GGUF | Cuantizacion imatrix de un modelo afinado para razonamiento y ficcion |
| nightmedia/Qwen3.5-9B-USS-Emergent | 9,2 B | 256k/1M (declarado) | Apache 2.0 | safetensors/bf16 | Modelo base sin cuantizar |
| Qwen3.5-9B-USS-Emergent-GGUF (quants estaticos) | 9,2 B | 256k/1M (declarado) | Apache 2.0 | GGUF | Misma base, cuantizacion estatica sin imatrix |

No se dispone de datos de benchmarks ni de modelos comparables de terceros en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo etiquetado como experimental: no debe asumirse estabilidad en produccion sin evaluacion propia.
- No hay benchmarks publicados que respalden las capacidades declaradas (razonamiento, codigo, matematicas).
- Riesgo de alucinacion inherente a los modelos de 9 B, especialmente en tareas de facto y en cadenas de pensamiento largas.
- El contexto declarado de 256k/1M no esta verificado; el rendimiento real a longitudes extremas puede degradarse y el coste de KV cache es elevado.
- Cobertura multilingue limitada a en, zh, ja y es; no se garantiza calidad en otros idiomas.
- La etiqueta claude-distillation sugiere posible dependencia de datos generados por otro modelo, con implicaciones inciertas sobre sesgos y terminos de uso.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base y de los datos de destilacion.
- El soporte de vision no esta confirmado en este repositorio; los ficheros mmproj, si existen, estarian en el repositorio estatico.
- El repositorio ocupa 81,3 GB por incluir todas las cuantizaciones; conviene descargar solo la variante necesaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-USS-Emergent-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.5-9B-USS-Emergent
- Quants estaticos: https://huggingface.co/mradermacher/Qwen3.5-9B-USS-Emergent-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-9B-USS-Emergent-i1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
