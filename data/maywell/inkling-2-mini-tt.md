# maywell/Inkling-2-Mini-TT

## Resumen

Inkling-2-Mini-TT es un checkpoint convertido de Inkling-2-Mini, el modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Thinking Machines Lab. La conversión la publica el usuario maywell y su objetivo no es reentrenar ni modificar el modelo, sino adaptar el formato de los pesos para que puedan cargarse en una única tarjeta Tenstorrent Blackhole p150a mediante el stack tt-metal y ttnn. Los pesos originales, cuantizados en NVFP4 y MXFP8, se dequantizan a BF16 con Transformers y se reparten en un fichero safetensors por capa.

El repositorio incluye el checkpoint convertido (`hf_sd/`, 53 GB), el script de conversión y las listas de hashes SHA256 para reproducir el proceso. El puerto de inferencia (kernels, tests y servidor) vive en un repositorio separado, github.com/StableFluffy/inkling-tt, con una imagen de servidor lista para ejecutar. La relevancia de esta ficha radica en que documenta una vía concreta para servir un MoE de gran tamano en hardware acelerador no-GPU, con métricas de rendimiento medidas sobre la propia tarjeta.

La licencia del modelo convertido hereda la del modelo base, Apache-2.0, mientras que el conversor, las listas de hashes y la model card se publican bajo Apache-2.0. El contexto soportado en este puerto es de 32.768 tokens y el modelo es solo texto: la torre de visión está presente en el repositorio pero no se utiliza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer, segun los tags del repositorio y el modelo base |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (en el puerto TT) |
| Tipos de cuantizacion | Original: NVFP4 y MXFP8; convertido: BF16 denso, atencion y KV cache en BF16, expertos enrutados en BFP8_B |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos y modelo base); conversor y model card Apache-2.0 |
| Formato de pesos | safetensors (un fichero por capa en `hf_sd/`), 53 GB en total |

## Arquitectura y entrenamiento

Inkling-2-Mini es un modelo de lenguaje de tipo Mixture of Experts, tal y como indican los tags del repositorio y la propia denominacion del puerto. El checkpoint original se distribuye con cuantizacion NVFP4 y MXFP8; el proceso de conversión lo carga en BF16 con Transformers sobre CPU (requiere unos 60 GB de RAM y unos minutos) y escribe un safetensors por capa. No se modifica ningun peso mas alla de la dequantizacion y del reempaquetado de layout.

El puerto a Tenstorrent introduce una decision de precision relevante: los pesos densos, la atencion y la KV cache se mantienen en BF16, mientras que los expertos enrutados del MoE se empaquetan en BFP8_B en el dispositivo. Los formatos de dispositivo (BFP8_B para expertos, tiles) se empaquetan en el momento de la carga, por lo que no se distribuye una cache de tensores TT y los shards convertidos no dependen de la version de tt-metal. La conversion se valida con listas SHA256 tanto del origen como del resultado. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto autoregresiva, con pipeline `text-generation`.
- Razonamiento en modo thinking: el servidor devuelve el razonamiento del modelo en el campo `reasoning_content` de la API compatible con OpenAI.
- API de chat completions y completions compatible con OpenAI, servida en el puerto 8000.
- Inferencia sobre una unica tarjeta Tenstorrent Blackhole p150a.
- No soporta vision: la torre de vision existe en `hf_sd/vision.safetensors` pero no se utiliza.
- No soporta logprobs ni parseo de tool calls en este puerto.
- Solo procesa una secuencia a la vez.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Evaluacion de hardware Tenstorrent en laboratorio: el checkpoint permite medir el rendimiento real de un MoE sobre una p150a con metricas publicadas (20,1 ms/token en decode con batch 1, 0,17 s de TTFT con prompt corto y 4,2 s con 7,8k tokens), lo que sirve para comparar el stack tt-metal frente a alternativas GPU.
- Servicio de chat interno de baja concurrencia: con una sola secuencia simultanea y una API compatible con OpenAI, encaja en entornos de prototipado o demos donde no se requiere autenticacion ni alta disponibilidad.
- Reproduccion de la cadena de conversion: el script y las listas SHA256 permiten verificar de extremo a extremo el proceso de dequantizacion NVFP4/MXFP8 a BF16, util para auditar integridad de pesos en pipelines de publicacion.
- Investigacion sobre precision mixta en aceleradores: la combinacion BF16 para atencion y KV cache con BFP8_B para expertos enrutados permite estudiar el impacto de la cuantizacion selectiva en la calidad (380/384 en top-1 y 384/384 en top-5 frente a HF en BF16 sobre CPU).
- Despliegue en infraestructura no-GPU: organizaciones con tarjetas Tenstorrent pueden servir el modelo con la imagen `ghcr.io/stablefluffy/inkling-tt:0.1.0` sin depender de CUDA.
- Procesamiento de documentos de hasta ~32k tokens: el contexto de 32.768 tokens y el TTFT de 4,2 s a 7,8k tokens permiten tareas de resumen o extraccion sobre textos largos en modo batch.
- Base para desarrollos sobre tt-metal: el repositorio separado con kernels y tests sirve como referencia para portar otros MoE al stack de Tenstorrent.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Decode, batch 1 | 20,1 ms/token (49,7 tokens/s) |
| Time to first token, prompt corto | 0,17 s |
| Time to first token, 7,8k tokens | 4,2 s |
| Contexto | 32.768 tokens |
| Concordancia con HF (BF16, CPU), top-1 | 380/384 |
| Concordancia con HF (BF16, CPU), top-5 | 384/384 |

Medido en una p150a con las 14 columnas Tensix habilitadas y un limite de placa de 380 W. Las tarjetas p150a de serie (12 columnas) estan soportadas pero no probadas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Acelerador: una Tenstorrent Blackhole p150a. Configuracion medida con 14 columnas Tensix y limite de 380 W; las tarjetas de 12 columnas estan soportadas pero no verificadas.
- Almacenamiento: 53 GB para `hf_sd/` mas el espacio del modelo base para tokenizer y chat template.
- RAM para conversion: aproximadamente 60 GB si se regenera el checkpoint en CPU.
- Memoria del dispositivo: no disponible de forma explicita; el checkpoint convertido (53 GB) se empaqueta en formatos de dispositivo al cargar.
- Despliegue: contenedor Docker `ghcr.io/stablefluffy/inkling-tt:0.1.0` con acceso privilegiado a `/dev/tenstorrent` y montaje de `/dev/hugepages-1G`. El primer arranque compila kernels y tarda unos cuatro minutos.
- Latencia y throughput: 49,7 tokens/s en decode con batch 1; TTFT de 0,17 s a 4,2 s segun longitud del prompt.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el unico runtime descrito es el puerto tt-metal/ttnn.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware objetivo | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-TT | no disponible (MoE) | 32.768 | 1x Tenstorrent Blackhole p150a | Apache-2.0 | Checkpoint convertido, solo texto, una secuencia |
| Inkling-2-Mini (base) | no disponible (MoE) | no disponible | GPU (formato original NVFP4/MXFP8) | Apache-2.0 | Modelo original de Thinking Machines Lab |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Una sola secuencia simultanea: no apto para servicios con concurrencia real sin replicar instancias.
- Solo texto: la torre de vision no se utiliza aunque este presente en el repositorio.
- Sin logprobs ni parseo de tool calls en el servidor incluido.
- El servidor no tiene autenticacion; debe exponerse solo en red local o detras de un proxy con control de acceso.
- Las tarjetas p150a de 12 columnas (configuracion de serie) estan soportadas pero no probadas; el rendimiento puede diferir del medido.
- Los hashes de conversion solo son validos para las versiones exactas indicadas (torch 2.15.0, transformers 5.24.0, safetensors 0.8.0, revision b85c3cfa); otras versiones pueden producir bytes distintos aunque correctos, y en ese caso hay que ejecutar los tests de paridad del puerto.
- La cuantizacion BFP8_B de los expertos enrutados introduce una desviacion respecto a BF16: 4 de 384 casos difieren en top-1.
- Aplican las limitaciones y notas de seguridad del modelo base, incluida su Acceptable Use Policy.
- Riesgo de alucinacion, sesgos conocidos e idiomas soportados: no disponibles en la informacion proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/maywell/Inkling-2-Mini-TT
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del puerto: https://github.com/StableFluffy/inkling-tt
- Benchmarks: https://github.com/StableFluffy/inkling-tt/blob/v0.1.0/docs/benchmarks.md
- Hardware: https://github.com/StableFluffy/inkling-tt/blob/v0.1.0/docs/hardware.md
- Precision: https://github.com/StableFluffy/inkling-tt/blob/v0.1.0/docs/precision.md
- Serving: https://github.com/StableFluffy/inkling-tt/blob/v0.1.0/docs/serving.md
- Imagen de servidor: ghcr.io/stablefluffy/inkling-tt:0.1.0
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
