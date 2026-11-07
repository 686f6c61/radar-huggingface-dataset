# renatoschust/gama-qwen3.5-35b-a3b-gguf

## Resumen

`gama-qwen3.5-35b-a3b-gguf` es una compilacion GGUF cuantizada en Q4_K_M de un checkpoint LoRA fusionado sobre el modelo base Qwen3.5-35B-A3B, publicado por el usuario renatoschust en el marco del proyecto GAMA. El modelo original es un transformer de tipo Mixture of Experts (MoE) con 35.505.251.456 parametros totales (etiqueta interna `256x2.6B`) y arquitectura registrada en los metadatos como `qwen35moe`. La adaptacion LoRA esta orientada a experimentos de tool calling en lengua bosnia (`bs`).

El interes de esta ficha es acotado: no se trata de un modelo nuevo entrenado desde cero, sino de una distribucion cuantizada de un fine-tune de nicho. El autor declara explicitamente que no existe evaluacion publicada para esta build cuantizada y que la cuantizacion puede alterar la calidad de salida respecto al modelo sin cuantizar. La licencia registrada es Apache 2.0, heredada del modelo base, aunque la propia model card recomienda verificar los terminos upstream antes de un uso comercial o de redistribucion.

La relevancia practica reside en que permite ejecutar un MoE de ~35B parametros totales en formato GGUF con llama.cpp u Ollama, con un unico fichero de 21,7 GB, lo que lo situa en el rango de estaciones de trabajo con GPU consumer de gama alta o de despliegues en CPU con RAM suficiente. Al no haber benchmarks ni adopcion registrada (0 descargas, 0 likes en el momento de la consulta), debe tratarse como material experimental, no como una dependencia de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen35moe` segun metadatos GGUF) |
| Parametros totales | 35.505.251.456 (etiqueta `256x2.6B`) |
| Parametros activos | no disponible (la etiqueta sugiere 256 expertos de 2.6B; el numero de expertos activos por token no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | bosnio (`bs`) declarado; capacidades multilingues del base no documentadas en esta build |
| Licencia | apache-2.0 (registrada en el fichero; verificar terminos upstream) |
| Formato de pesos | GGUF (753 tensores) |

Datos adicionales: tamano del repo 21,7 GB; nombre interno `Gama_Merged16`; sampling sugerido en metadatos `temperature=1.0`, `top_p=0.95`, `top_k=20`.

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE), tal como declara el metadato `general.architecture: qwen35moe` del fichero GGUF. El modelo base Qwen3.5-35B-A3B pertenece a la familia Qwen3.5 y, segun la informacion disponible, se distribuye como modelo image-text-to-text de 36B parametros. La etiqueta `general.size_label: 256x2.6B` es coherente con un diseno de 256 expertos de aproximadamente 2.6B parametros cada uno, aunque el numero de expertos activos por token no se detalla en la informacion proporcionada.

El proceso de adaptacion consistio en un fine-tune LoRA sobre el modelo base, posteriormente fusionado en los pesos y convertido a GGUF con cuantizacion Q4_K_M. El autor no documenta en la model card el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. La model card remite al repositorio `gamai-io/agentmujo-training` para el codigo de entrenamiento, el dataset y el metodo de evaluacion, y a un documento `EVAL_METHOD.md` con notas de benchmark, pero los resultados concretos no se incluyen en la informacion disponible. No se declaran innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, modos de razonamiento explicitos) para esta build.

## Capacidades

- Generacion de texto conversacional: el pipeline esta marcado como `conversational` en los metadatos de Hugging Face.
- Tool calling / function calling: uso previsto declarado por el autor para experimentacion con prompts de herramientas en bosnio.
- Prompts de agente: la model card menciona explicitamente "agent prompts" como caso de experimentacion.
- Capacidad multilingue: limitada en la practica al idioma declarado (`bs`); el resto de idiomas del base no se documenta en esta build.
- Capacidades del modelo base (razonamiento, codigo, matematicas, vision): no verificadas para esta cuantizacion; la model card advierte que no debe asumirse paridad con el modelo sin cuantizar.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada para esta build.

## Casos de uso

- Experimentacion con tool calling en bosnio: el modelo esta adaptado mediante LoRA para invocar funciones en este idioma; se usaria con plantillas de herramientas y validacion manual de las llamadas generadas.
- Prototipado de agentes conversacionales de nicho linguistico: util para equipos que necesiten un asistente que opere en bosnio con llamadas a APIs, desplegado localmente con llama.cpp u Ollama.
- Evaluacion de pipelines de cuantizacion: al ser un Q4_K_M de un MoE de ~35B, sirve para medir la degradacion de calidad frente al checkpoint sin cuantizar en tareas de function calling.
- Despliegue local en estacion de trabajo: con 21,7 GB de pesos, puede ejecutarse en una maquina con GPU de 24 GB o con RAM suficiente en CPU, sin dependencia de servicios en la nube.
- Investigacion sobre fine-tunes LoRA fusionados: caso de estudio de como un adaptador de bajo rango sobre un MoE se materializa en GGUF y que metadatos conserva (`general.name`, `general.base_model.0.repo_url`).
- Base para comparativas de modelos Qwen3.5: permite contrastar el comportamiento del base `Qwen/Qwen3.5-35B-A3B` con su version adaptada y cuantizada en prompts multilingues controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existe evaluacion publicada para esta build cuantizada y remite a `https://github.com/gamai-io/agentmujo-training/blob/main/benchmark/EVAL_METHOD.md` para el metodo de evaluacion, sin incluir cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 22-24 GB con Q4_K_M (fichero de 21,7 GB mas overhead de contexto y cache KV).
- GPU recomendadas: A100 40GB, H100, L40S, RTX 4090 (24 GB, al limite), RTX 3090 (24 GB). En GPUs de 16 GB no cabe el fichero completo sin offload parcial a RAM.
- Cabe en GPU consumer: si, en RTX 4090 y RTX 3090 con cuantizacion Q4_K_M y contexto moderado; en el resto requiere offload a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -ngl 99`), Ollama mediante Modelfile, y cualquier runtime compatible con GGUF. vLLM y TGI no estan documentados para este fichero en la informacion disponible.
- Latencia y throughput: no disponible. Al ser un MoE, el rendimiento dependera del numero de expertos activos por token, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `renatoschust/gama-qwen3.5-35b-a3b-gguf` | 35,5B totales (MoE) | no disponible | GGUF Q4_K_M | apache-2.0 | Fine-tune LoRA para bosnio, sin evaluacion publicada |
| `Qwen/Qwen3.5-35B-A3B` | ~36B (MoE) | no disponible | safetensors | no disponible en la informacion | Modelo base, image-text-to-text |
| `unsloth/Qwen3.5-35B-A3B-GGUF` | ~36B (MoE) | no disponible | GGUF | no disponible en la informacion | Cuantizaciones GGUF del base sin adaptacion LoRA |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento que permitan contrastar con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Sin evaluacion publicada: el autor advierte que la cuantizacion puede degradar la calidad y que no debe asumirse paridad con el modelo sin cuantizar.
- Idiomas: declarado unicamente bosnio (`bs`); el comportamiento en castellano u otros idiomas no esta documentado para esta build.
- Sesgos: no documentados en la informacion proporcionada; al derivar de un base de gran escala, hereda los sesgos del mismo, no evaluados aqui.
- Alucinacion: la model card no ofrece garantia de fiabilidad factual y recomienda verificar las salidas antes de actuar sobre ellas.
- Licencia: Apache 2.0 registrada en el fichero, pero el autor recomienda consultar los terminos de `Qwen/Qwen3.5-35B-A3B` antes de redistribuir o usar comercialmente.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta; sin senales de validacion por parte de la comunidad.
- Contexto: la longitud de contexto no se especifica en los metadatos disponibles, lo que impide planificar despliegues con ventanas largas.
- Produccion: no apto como dependencia critica sin evaluacion propia previa; el propio autor lo etiqueta como experimentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/renatoschust/gama-qwen3.5-35b-a3b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- GGUF del base (unsloth): https://huggingface.co/unsloth/Qwen3.5-35B-A3B-GGUF
- Codigo de entrenamiento y dataset: https://github.com/gamai-io/agentmujo-training
- Metodo de evaluacion: https://github.com/gamai-io/agentmujo-training/blob/main/benchmark/EVAL_METHOD.md
