# momokokong/DeepSeek-V4.1-Flash-1017-EXL3-2.50bpw-Abliterated-TensorFold-TP2

## Resumen

DeepSeek-V4.1-Flash-1017-EXL3-2.50bpw-Abliterated-TensorFold-TP2 es un paquete de pesos cuantizados y modificados del modelo DeepSeek-V4.1-Flash-1017, publicado por el usuario momokokong en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un ensamblaje de tipo "delta pack" que combina tensores procedentes de cuatro repositorios distintos: la cuantizacion EXL3 base de bertholomus, los tensores de expertos enrutados de vcruz305, los tensores "abliterated" (sin rechazo) de drowzeys y el modelo original de deepseek-ai. El resultado es un artefacto multimodal (image-text-to-text) en formato safetensors de 13,7 GB que sirve como primer y segundo fragmento de un indice de 15 shards.

La particularidad tecnica del paquete es su orientacion a despliegues distribuidos sobre dos nodos NVIDIA DGX Spark (GB10 con 128 GB de memoria unificada cada uno), usando el motor propietario TensorFold con paralelismo de tensor TP=2. La cuantizacion a 2,50 bits por peso (EXL3) reduce el peso residente por nodo a unos 84,72 GiB, lo que deja margen para co-ubicar servicios auxiliares como gateways de agentes o servidores de embeddings.

El modelo es relevante para quienes necesitan ejecutar un modelo de gran tamano con capacidades multimodales y de contexto largo (hasta 250.000 tokens segun la configuracion reportada) en hardware de escritorio de gama alta para IA, sin recurrir a clusters de GPUs tradicionales. La licencia MIT y la ausencia de censura (abliterated) lo hacen atractivo para experimentacion, aunque su naturaleza de artefacto comunitario y la falta de documentacion sobre el entrenamiento original limitan su uso en produccion sin validacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de expertos (MoE) segun los tensores `ffn` y `routed-expert`; detalles completos no disponibles |
| Parametros totales | No disponible (el indice declara 192.499 claves y 167,99 GiB en 15 shards, pero no se explicita el numero de parametros) |
| Parametros activos | No disponible |
| Longitud de contexto | Hasta 250.000 tokens segun la configuracion de despliegue reportada (`CONTEXT=250000`) |
| Tipos de cuantizacion | EXL3 a 2,50 bits por peso (bpw); tensores no experto y expertos en EXL3; algunos tensores en BF16/F16 (`mtp.2.markov_head`) y F32 (`layers.{1,14}.engram.{q,k}_weight`) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (15 shards, indice `model.safetensors.index.json`); configuracion TensorFold `config.json` |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo original DeepSeek-V4.1-Flash-1017. Los nombres de los tensores del paquete revelan una estructura de mezcla de expertos (MoE) con tensores `routed-expert` y `ffn`, un cabezal de prediccion multi-token (`mtp.2.markov_head`), modulos de atencion (`attn.wo_b`) y componentes de vision (`ffn.gate.bias_vl`), lo que confirma su caracter multimodal. Tambien aparecen tensores denominados `engram`, un termino no estandar que sugiere una innovacion propia del modelo base, aunque no se documenta su funcion.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El paquete en si no entrena nada: es un ensamblaje de cuantizacion (EXL3 2,50 bpw) y modificacion "abliterated" que elimina los tensores de rechazo de 104 capas (`layers.10..35.attn.wo_b`, 651 MiB) procedentes del repositorio de drowzeys. La innovacion tecnica destacable es el formato TensorFold, un motor de inferencia que permite el reparto de tensores entre dos nodos con TP=2 y decodificacion especulativa, con un arranque en frio de 33,7 s y una lectura de cache de expertos de 81,2 GiB en 16,2 s.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline `image-text-to-text` y la etiqueta `conversational`.
- Procesamiento de imagenes y texto combinados (multimodal), con 43 biases de enrutamiento de vision (`ffn.gate.bias_vl`) en el paquete.
- Razonamiento de contexto largo: soporta ventanas de hasta 250.000 tokens en la configuracion reportada, con resultados perfectos en la prueba Needle in a Haystack a 32K y 78K (6/6 correctos).
- Decodificacion especulativa mediante el cabezal `mtp.2.markov_head`, que acelera la generacion.
- Generacion de codigo: el autor reporta hasta 90,51 tok/s en generacion de codigo en un solo flujo.
- Generacion estructurada concurrente: hasta 153,58 tok/s en generacion estructurada a 4 vias.
- Modo sin censura ("abliterated"): los tensores de rechazo han sido eliminados, por lo que el modelo no aplica negativas por alineamiento.
- Soporte de tool calling y agentes: no confirmado explicitamente en la informacion disponible, aunque el despliegue documentado menciona co-ubicacion de "Agent Gateways".

## Casos de uso

- Despliegue de un asistente conversacional multimodal en dos nodos DGX Spark: el paquete esta disenado especificamente para este hardware, con un consumo de 84,72 GiB por nodo y margen para servicios auxiliares, lo que permite montar un asistente que procese texto e imagenes en local.
- Analisis de documentos largos con imagenes: gracias a la ventana de 250.000 tokens y a la capacidad image-text-to-text, se puede ingerir un informe extenso con graficos y hacer preguntas sobre su contenido sin truncar el contexto.
- Generacion de codigo en local para equipos con hardware restringido: los 90,51 tok/s en generacion de codigo y la decodificacion especulativa lo hacen viable para autocompletado y generacion de funciones en un entorno de desarrollo interno.
- Procesamiento por lotes de imagenes con descripcion textual: el pipeline image-text-to-text permite etiquetar, describir o extraer informacion de imagenes en pipelines automatizados, con la ventaja de ejecutarse en infraestructura propia.
- Experimentacion en investigacion sobre alineamiento y censura: al ser una version "abliterated", sirve para estudiar el comportamiento del modelo sin los tensores de rechazo y comparar respuestas frente a la version original.
- Servicio de inferencia concurrente para pequenos equipos: con 124,62 tok/s a 4 vias y 153,58 tok/s en generacion estructurada, puede atender a varios usuarios simultaneos en un despacho o laboratorio.
- Co-ubicacion con otros servicios de IA: los 16,5 GiB libres por nodo permiten ejecutar simultaneamente servidores de embeddings, rerankers o ComfyUI junto al modelo principal, segun documenta el autor.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de rendimiento de inferencia reportadas por el autor, no benchmarks academicos estandar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la informacion disponible.

| Metrica | Valor reportado |
|---|---|
| Arranque en frio | 33,7 s (lectura de cache de expertos de 81,2 GiB en 16,2 s) |
| Decodificacion single-stream (mediana) | 64,25 tok/s |
| Decodificacion single-stream (generacion de codigo) | 90,51 tok/s |
| Decodificacion concurrente a 4 vias | 124,62 tok/s |
| Generacion estructurada a 4 vias | 153,58 tok/s |
| Prefill en frio a 8K | 2.134,8 tok/s |
| Prefill en frio a 32K | 2.184,4 tok/s |
| Prefill en frio a 78K | 2.152,0 tok/s |
| Needle in a Haystack (32K y 78K, profundidades 0,25/0,50/0,75) | 6/6 correctos (100%) |

## Requisitos de hardware

- VRAM/memoria: el paquete completo requiere 167,99 GiB repartidos en 15 shards; en la configuracion TP=2 sobre dos DGX Spark, cada nodo usa 84,72 GiB de cache de rango y un total residente de 89,92 GiB.
- GPU recomendadas: 2x NVIDIA DGX Spark (GB10 con 128 GB de memoria unificada cada una), que es el objetivo de diseno del paquete.
- Cabe en consumer GPU: no en una sola GPU de consumo; requiere dos nodos con 128 GB de memoria unificada cada uno. No se documenta compatibilidad con RTX 4090, A100 o H100.
- Opciones de despliegue: motor TensorFold nativo con TP=2, segun el repositorio GitHub del autor, que incluye script de enlace sin copia (`download_and_build.sh`), servicio systemd y scripts watchdog. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 64,25 tok/s en single-stream y 124,62 tok/s a 4 vias; prefill de aproximadamente 2.150 tok/s entre 8K y 78K; arranque en frio de 33,7 s.
- Configuracion reportada: `CONTEXT=250000`, `POOL=524288`, `PARALLEL=4`, con 16,5 GiB de `MemAvailable` libre por nodo durante pruebas de contexto largo de 78K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-EXL3-2.50bpw-Abliterated-TensorFold-TP2 | No disponible | 250.000 tokens (config.) | EXL3 2,50 bpw | MIT | 2x DGX Spark (GB10) |
| DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw (bertholomus) | No disponible | No disponible | EXL3 2,5 bpw | No disponible | No disponible |
| DSV4.1-Flash-1017-DERISKED-EXL3-2.50bpw (vcruz305) | No disponible | No disponible | EXL3 2,50 bpw | No disponible | No disponible |
| DeepSeek-V4.1-Flash-1017-Abliterated (drowzeys) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a las variantes del mismo modelo base de las que procede el paquete, ya que no se dispone de datos de rendimiento ni de especificaciones de modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto comunitario de cuantizacion y modificacion, no un modelo oficial; el autor no documenta el proceso de entrenamiento ni garantiza la integridad de los tensores ensamblados.
- La version "abliterated" elimina los tensores de rechazo, por lo que el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros de alineamiento; no es adecuado para aplicaciones orientadas al publico sin moderacion adicional.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la falta de benchmarks academicos que permitan calibrar su fiabilidad.
- No se dispone de informacion sobre sesgos conocidos, idiomas soportados ni evaluaciones de seguridad.
- La licencia MIT se aplica al paquete, pero las licencias de los repositorios de origen (deepseek-ai, vcruz305, bertholomus, drowzeys) no se detallan; conviene verificar los terminos del modelo base antes de un uso comercial.
- El despliegue esta ligado al motor TensorFold y a hardware DGX Spark; no se documenta compatibilidad con otros runtimes, lo que limita la portabilidad.
- La configuracion de contexto de 250.000 tokens se reporta como parametro de despliegue, no como limite verificado del modelo; las pruebas de contexto largo solo cubren hasta 78K.
- El paquete contiene unicamente 2 de los 15 shards (13,7 GB de 167,99 GiB); el resto debe enlazarse desde el repositorio de vcruz305, lo que introduce dependencia de un tercero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/momokokong/DeepSeek-V4.1-Flash-1017-EXL3-2.50bpw-Abliterated-TensorFold-TP2
- Repositorio GitHub con receta y scripts: https://github.com/momokokong/DeepSeek-V4.1-Flash-1017-EXL3-2.50bpw-Abliterated-TensorFold-TP2
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Cuantizacion EXL3 base: https://huggingface.co/bertholomus/DeepSeek-V4.1-Flash-1017-EXL3-2.5bpw
- Tensores de expertos: https://huggingface.co/vcruz305/DSV4.1-Flash-1017-DERISKED-EXL3-2.50bpw
- Tensores abliterated: https://huggingface.co/drowzeys/keys-DeepSeek-V4.1-Flash-1017-Abliterated
