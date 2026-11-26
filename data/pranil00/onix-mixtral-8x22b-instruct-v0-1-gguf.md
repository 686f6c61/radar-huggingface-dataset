# pranil00/ONIX-Mixtral-8x22B-Instruct-v0.1-GGUF

## Resumen

ONIX-Mixtral-8x22B-Instruct-v0.1-GGUF es una cuantizacion en formato GGUF del modelo mistralai/Mixtral-8x22B-Instruct-v0.1, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX y generada con la herramienta run-any-model. Se trata de un artefacto derivado, no de un modelo entrenado desde cero: el trabajo aportado consiste en la conversion a precision Q3_K_M (3,5 bits por peso) para reducir el peso de 43,51 GB en FP16 a 9,52 GB, lo que permite ejecutar un modelo de gran tamano en hardware de consumo.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 22 247 276 544 parametros totales segun la model card, aunque la cifra declarada es inconsistente con el nombre comercial del modelo original, que corresponde a una familia de 8 expertos. La model card no detalla el numero de parametros activos ni la longitud de contexto nativa; unicamente recomienda ventanas de 8 192 tokens en GPU y Apple Silicon y de 4 096 tokens en CPU.

Su relevancia es practica: permite probar localmente un modelo de la familia Mixtral en equipos con 10-12 GB de memoria, algo inviable con los pesos originales. No obstante, el repositorio no presenta descargas ni validacion externa, y la propia model card reconoce una retencion de calidad estimada del 91 % respecto al modelo sin cuantizar, por lo que debe tratarse como un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo mezcla de expertos (MoE), familia Mistral |
| Parametros totales | 22 247 276 544 (22,25 mil millones, segun model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en el modelo base; la model card recomienda 8 192 tokens en GPU/Apple Silicon y 4 096 en CPU |
| Tipos de cuantizacion | Q3_K_M (3,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero mistralai--Mixtral-8x22B-Instruct-v0.1-Q3_K_M.gguf, 9,52 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es mistralai/Mixtral-8x22B-Instruct-v0.1, un transformer con capas de mezcla de expertos de la familia Mistral. La model card del artefacto cuantizado no documenta el numero de expertos, la dimension oculta, el numero de capas ni el regimen de entrenamiento (tokens, composicion del dataset, RLHF/DPO) del modelo original; esa informacion debe consultarse en la model card de Mistral AI. Tampoco se especifica si el modelo base emplea atencion con ventana deslizante, GQA u otras optimizaciones.

La contribucion tecnica del repositorio es exclusivamente la cuantizacion: conversion a Q3_K_M mediante run-any-model, un motor de optimizacion adaptativo al dispositivo descrito como open source. La model card incluye un informe de telemetria que compara FP16 (43,51 GB, 16 bits por parametro) con Q3_K_M (9,52 GB, 3,5 bits por parametro), con una reduccion del 78,1 % en peso y una retencion de calidad estimada del 91 %. El buffer de KV cache se mantiene en 896 MB en FP16 en ambos casos. No se documentan metodos de decodificacion especulativa ni tecnicas adicionales de inferencia.

## Capacidades

- Generacion de texto conversacional y de tipo instruct, heredada del modelo base Mixtral-8x22B-Instruct-v0.1.
- Razonamiento y respuesta a instrucciones en formato chat, con tokens de parada `<|im_end|>` y `<|endoftext|>` segun los ejemplos de la model card.
- Generacion de codigo y matematicas: capacidad atribuible al modelo base, aunque la model card del artefacto cuantizado no aporta evaluaciones propias.
- Ejecucion local multiplataforma: Metal en Apple Silicon, CUDA en GPU NVIDIA y CPU con AVX2/AVX-512.
- Integracion con llama.cpp, Ollama, LM Studio, Jan, Text-Generation-WebUI y la CLI run-any-model.
- Soporte de tool calling, agentes, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.

## Casos de uso

- Pruebas de concepto en portatiles con Apple Silicon: con 10,51 GB de memoria unificada y aceleracion Metal, permite evaluar el comportamiento de un modelo de la familia Mixtral sin acceso a servidores GPU.
- Desarrollo y depuracion de pipelines de generacion de texto en local: util para validar prompts, plantillas de chat y tokens de parada antes de desplegar el modelo completo en infraestructura.
- Generacion de codigo asistida en entornos sin conexion: el formato GGUF y la compatibilidad con llama.cpp permiten integrarlo en editores o scripts de automatizacion en maquinas con GPU de 11 GB o CPU con 12,5 GB de RAM libre.
- Experimentacion academica con cuantizacion: sirve como referencia para medir la degradacion de calidad de Q3_K_M frente a FP16 en tareas concretas, dado que la model card solo aporta una estimacion del 91 % de retencion.
- Despliegue en estaciones de trabajo con RTX 30/40/50: con 11,02 GB de VRAM dedicada y CUDA, adecuado para prototipos de asistentes conversacionales de uso interno.
- Evaluacion comparativa de motores de inferencia: al estar disponible en GGUF, permite contrastar rendimiento entre llama.cpp, Ollama y run-any-model sobre el mismo artefacto.
- Formacion y demos: util para mostrar en talleres como se ejecuta un modelo de gran tamano en hardware de consumo, siempre advirtiendo de la perdida de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye un informe de telemetria de recursos, no de calidad:

| Metrica | FP16 (base) | Q3_K_M (cuantizado) | Variacion |
|---|---|---|---|
| Precision | 16,0 bits/parametro | 3,5 bits/parametro | -78,1 % |
| Tamano de pesos | 43,51 GB | 9,52 GB | -78,1 % |
| Buffer KV cache | 896,0 MB | 896,0 MB | Sin cambio |
| RAM residente total | 44,50 GB | 10,51 GB | -76,4 % |
| Calidad estimada | 100,0 % | 91,0 % | -9,0 % |
| Capas aceleradas | 0 % | 56/56 | Optimo |

No se proporcionan cifras de latencia ni de throughput (tokens por segundo).

## Requisitos de hardware

- Apple Silicon (M1/M2/M3/M4/M5): 10,51 GB de memoria unificada, contexto optimo de 8 192 tokens, aceleracion Metal nativa.
- GPU NVIDIA (RTX 30/40/50): 11,02 GB de VRAM dedicada, contexto optimo de 8 192 tokens, aceleracion CUDA.
- CPU en Windows/Linux: 12,51 GB de RAM libre, contexto optimo de 4 096 tokens, requiere AVX2 o AVX-512.
- Cabe en GPU de consumo con al menos 12 GB de VRAM; por debajo de ese umbral no hay margen declarado.
- Opciones de despliegue: run-any-model CLI, Ollama (mediante Modelfile), llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Mixtral-8x22B-Instruct-v0.1-GGUF (Q3_K_M) | 22,25 mil millones (segun model card) | 8 192 tokens recomendados | GGUF, 9,52 GB | Apache 2.0 | Repositorio con 0 descargas |
| mistralai/Mixtral-8x22B-Instruct-v0.1 | No disponible en esta ficha | No disponible en esta ficha | safetensors (original) | Apache 2.0 | Repositorio oficial de Mistral AI |
| Otras cuantizaciones GGUF de Mixtral-8x22B-Instruct | No disponible | No disponible | GGUF | Apache 2.0 | Publicadas por terceros en Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cifra de parametros de la model card (22,25 mil millones) no coincide con la denominacion comercial del modelo base (8x22B); conviene verificar las dimensiones reales en la model card de Mistral AI antes de planificar el despliegue.
- La cuantizacion Q3_K_M implica una perdida de calidad estimada del 9 % segun el propio autor; no hay evaluaciones independientes que la confirmen.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia: no hay evidencia de uso ni validacion por la comunidad.
- No se declaran idiomas soportados ni sesgos conocidos; el comportamiento multilingue y los sesgos heredados del modelo base no estan documentados en este artefacto.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la cuantizacion agresiva; la model card descarga toda responsabilidad sobre los usuarios.
- La licencia Apache 2.0 permite uso comercial, pero el autor incluye una clausula de exencion total de responsabilidad que conviene revisar con el equipo legal.
- El contexto recomendado (8 192 tokens en GPU, 4 096 en CPU) es una recomendacion de la model card, no la longitud de contexto nativa del modelo base.
- No se documentan metodos de alineacion adicionales ni filtros de seguridad en el artefacto cuantizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Mixtral-8x22B-Instruct-v0.1-GGUF
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x22B-Instruct-v0.1
- Organizacion ONIX: https://huggingface.co/ONIX
- Herramienta de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model
