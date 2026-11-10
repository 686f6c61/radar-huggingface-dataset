# nazeshinjite/ThinkingCap-Qwen3.8-Flash-Next-GGUF

## Resumen

ThinkingCap-Qwen3.8-Flash-Next es un modelo multimodal de tipo image-text-to-text derivado de Qwen3.8-Flash-Next, desarrollado por bottlecapai. Esta ficha concreta, publicada por el usuario nazeshinjite, es una cuantizacion GGUF de precision mixta (denominada Q5_K_L) del modelo base, pensada para su uso con llama.cpp. El modelo cuenta con 179.551.050.368 parametros totales y una arquitectura que combina componentes transformer con tensores de tipo SSM (ssm_alpha, ssm_beta) y mecanismos de hyper-connection (hc_*), ademas de una cabeza MTP (multi-token prediction) y una tabla de embeddings n-gram.

La relevancia de esta publicacion es fundamentalmente practica: permite ejecutar un modelo de gran tamano en maquinas de 128 GB de RAM gracias a una mezcla de cuantizaciones por clase de tensor (Q8_0, Q6_K, Q5_K, Q5_1, Q4_K y BF16) que alcanza aproximadamente 6,3 bits por peso en el backbone (92,8 GiB) y unos 7,0 bpw en la descarga completa (145,2 GiB). No se ha recuantizado ningun tensor: todos los bloques proceden de las releases Q4_K_M, Q6_K, Q8_0 o BF16 de bottlecapai, y solo se ha elegido de que tier proviene cada uno.

El objetivo declarado de esta mezcla es comparar ThinkingCap con Swift 1.5 Flash-Next de ukisai con el mismo presupuesto de bits por peso. La licencia es la Qwen Community License 1.0, lo que condiciona el uso comercial. No se han publicado resultados de benchmarks propios de esta cuantizacion ni mediciones de divergencia KL frente al modelo BF16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer con tensores SSM y hyper-connections; incluye cabeza MTP y tabla de embeddings n-gram |
| Parametros totales | 179.551.050.368 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF precision mixta Q5_K_L (Q8_0, Q6_K, Q5_K, Q5_1, Q4_K, BF16); vision en F16; MTP head en Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (8 shards + mmproj F16) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina capas transformer con tensores de estado (ssm_alpha, ssm_beta) y mecanismos de hyper-connection (hc_* up/down/inject y output_hc_*), una cabeza de prediccion multi-token (MTP, blk.48) y una tabla de embeddings n-gram de gran tamano (50,7 GiB en Q8_0, shard 2). El modelo es multimodal: incluye un proyector de vision en F16 (mmproj, 0,85 GiB) que procesa entradas de imagen junto con texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica de esta publicacion es la mezcla de precisiones por clase de tensor. Las decisiones de asignacion de bits se basan en dos fuentes independientes: la busqueda de gradientes de IST-DASLab para Qwen3.8-Flash-Next GSQ-RCO y los quantizadores dinamicos v3.1 de Unsloth. Ambas protegen las capas tardias para gate/up de expertos (15-18, 27-35, 40-47) y las capas tempranas para down de expertos (0-6), gastando menos bits en las capas 8-14. Los tensores de hyper-connection y los ssm_alpha/ssm_beta se mantienen en BF16, siguiendo el criterio de IST-DASLab. El shard 1 incorpora la plantilla de chat de Unsloth para Qwen3.8-Flash-Next, que acepta el rol `developer`, fusiona mensajes de sistema iniciales y mapea `reasoning_effort: "high"` a `xhigh`. No se ha realizado ninguna medicion de divergencia KL frente al modelo BF16.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con roles system, user, assistant y developer.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el proyector de vision incluido.
- Modo de razonamiento (thinking mode) con ajuste de esfuerzo mediante `reasoning_effort` (incluye el valor `xhigh`).
- Prediccion multi-token mediante la cabeza MTP, que puede acelerar la decodificacion.
- Decodificacion especulativa compatible con el drafter DFlash2 de incoai (block-diffusion), con tasas de aceptacion declaradas del 66-99 % en las mediciones del autor.
- Soporte de plantillas Jinja (`--jinja`) en llama-server, lo que habilita tool calling si la plantilla lo define.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado explicitamente en la informacion disponible.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo puede mantener conversaciones multi-turno recibiendo imagenes y texto, adecuado para despliegues en maquinas de 128 GB de RAM sin GPU de datacenter.
- Analisis de documentos con imagenes: capturas, diagramas o graficos combinados con preguntas en lenguaje natural, aprovechando el proyector de vision F16.
- Razonamiento con esfuerzo configurable: en tareas que requieren cadenas de pensamiento largas se puede activar `reasoning_effort: xhigh`, y en tareas simples reducir el coste de tokens.
- Generacion asistida con decodificacion especulativa: integrando el drafter DFlash2 Q4_0 se acelera la inferencia en llama.cpp con tasas de aceptacion del 66-99 %, util para servicios interactivos.
- Evaluacion comparativa de cuantizaciones: esta mezcla esta disenada especificamente para comparar ThinkingCap con Swift 1.5 Flash-Next al mismo presupuesto de bits, por lo que sirve como referencia en estudios de cuantizacion.
- Despliegue en estaciones de trabajo con llama.cpp: el modo lazy permite mantener la tabla n-gram en disco y dejar unos 93 GiB de pesos en memoria, lo que hace viable el modelo en equipos de 128 GB.
- Prototipado de pipelines multimodales con plantilla Jinja: la plantilla de Unsloth permite roles `developer` y multiples mensajes de sistema, util para orquestacion de agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes para esta cuantizacion, y tampoco se ha medido la divergencia KL frente al modelo BF16.

## Requisitos de hardware

- VRAM/RAM estimada: unos 93 GiB de pesos en memoria si se usa `--lazy-mode on` (la tabla n-gram de 50,7 GiB se lee de disco); descarga completa de 145,2 GiB.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, requiere GPUs con 80 GB o mas (A100 80GB, H100) o configuraciones multi-GPU.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs consumer de 48 GB; el modelo esta pensado para maquinas con 128 GB de RAM.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--lazy-mode on -fa on --jinja`; tambien carga en Splash 1.5.0 (requiere tensores `hc_*_inject` en F32, BF16 o Q8_0, lo que esta mezcla cumple y el Q4_K_M de bottlecapai no).
- Nota importante: las mediciones del autor provienen de un build parcheado de llama.cpp; el llama.cpp estandar no ha sido probado con estos ficheros.
- Latencia y throughput: no disponibles. Se documenta el uso de decodificacion especulativa con DFlash2 como mecanismo de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion comparable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next Q5_K_L (esta ficha) | 179,5 B | no disponible | 6,34 bpw backbone, 92,8 GiB | qwen-community-license-1.0 | GGUF en Hugging Face |
| Swift 1.5 Flash-Next Q5_K_L (ukisai) | no disponible | no disponible | 6,29 bpw, 92,14 GiB | no disponible | GGUF en Hugging Face |
| ThinkingCap-Qwen3.8-Flash-Next Q4_K_M (bottlecapai) | 179,5 B (base) | no disponible | ~13 GiB mas ligero que Swift Q5_K_L | qwen-community-license-1.0 | GGUF en Hugging Face |
| Qwen3.8-Flash-Next GSQ-RCO (ISTA-DASLab) | no disponible | no disponible | hasta 2,4 bpw | no disponible | GGUF en Hugging Face |
| Qwen3.8-Flash-Next dynamic v3.1 (Unsloth) | no disponible | no disponible | dinamica | no disponible | GGUF en Hugging Face |

## Limitaciones y advertencias

- No se ha medido la divergencia KL de esta mezcla frente al modelo BF16, por lo que la perdida de calidad respecto al original es desconocida.
- Las mediciones de rendimiento provienen de un build parcheado de llama.cpp; el soporte en llama.cpp estandar no esta verificado.
- La licencia Qwen Community License 1.0 impone condiciones al uso comercial; es necesario revisar el texto de la licencia antes de desplegar en produccion.
- El modelo requiere aproximadamente 93 GiB de memoria para los pesos y 145,2 GiB de descarga, lo que lo excluye de GPUs consumer y de la mayoria de entornos cloud de gama media.
- La tabla de embeddings n-gram (50,7 GiB) solo es viable con `--lazy-mode on`; sin esa opcion el requisito de memoria crece sustancialmente.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion del modelo base.
- El drafter DFlash2 fue entrenado sobre Qwen3.8-Flash-Next base, no sobre ThinkingCap; la tasa de aceptacion puede variar en dominios distintos a los medidos.
- El repositorio tiene un volumen de descargas bajo (60) y pocos likes (2), por lo que la validacion por parte de la comunidad es limitada.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/nazeshinjite/ThinkingCap-Qwen3.8-Flash-Next-GGUF
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- GGUF original de bottlecapai: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next-GGUF
- Swift 1.5 Flash-Next de ukisai: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-Flash-Next-GGUF
- GSQ-RCO de ISTA-DASLab: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Quantizaciones dinamicas de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Drafter DFlash2 de incoai: https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- GGUF del drafter DFlash2: https://huggingface.co/nazeshinjite/Qwen3.8-Flash-Next-DFlash2-GGUF
- Repositorio DFlash (z-lab): https://github.com/z-lab/dflash
- Splash (incoai): https://github.com/incoai/splash
