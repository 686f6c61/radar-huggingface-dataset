# ramgpt/MiMo-V2.6-Distill-Qwen-9B-EXL3-4.0bpw

## Resumen

ramgpt/MiMo-V2.6-Distill-Qwen-9B-EXL3-4.0bpw es una cuantizacion comunitaria independiente del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, un modelo agentico de 9B parametros desarrollado por Xiaomi MiMo. El modelo base se construyo mediante ajuste supervisado (SFT) de Qwen3.5-9B sobre datos generados por MiMo, cubriendo codigo, tareas de agente generales, codificacion visual y ciberseguridad. Xiaomi lo publica como checkpoint SFT destinado a servir de punto de partida para investigacion abierta en aprendizaje por refuerzo agentico.

Esta version concreta aplica cuantizacion EXL3 a 4.0 bits por peso mediante ExLlamaV3 1.5.2 (PyTorch 2.10.0+cu128), reduciendo el artefacto a aproximadamente 6,4 GiB y habilitando su despliegue en GPUs de consumo. La arquitectura declarada es Qwen3_5ForConditionalGeneration, un transformer multimodal (texto e imagen) con soporte de razonamiento explicito mediante tokens `<think>` y parseo de tool calling en formato `qwen3_5`.

Su relevancia actual radica en que permite ejecutar un modelo agentico y multimodal de 9B en una unica GPU de 12 GB o 24 GB con throughput superior a 100 tok/s, ademas de habilitar una API compatible con OpenAI a traves de TabbyAPI. La licencia es MIT, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal, texto e imagen) |
| Parametros totales | 3.420.001.152 segun safetensors del repo; el modelo base upstream declara 9B (9,4B en algunas fuentes). Dato no coincidente, ver limitaciones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64K tokens validados en esta cuantizacion; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | EXL3 4.0 bpw (4 bits por peso). Existen versiones GGUF independientes del modelo base |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3, requiere ExLlamaV3/TabbyAPI) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de tipo Qwen3.5 al que se le aplico un proceso de destilacion y ajuste supervisado (SFT) sobre datos generados por los modelos MiMo de Xiaomi. La familia Qwen3.5 emplea atencion estandar (no lineal) y admite entrada de imagen ademas de texto, lo que habilita tareas de codificacion visual. El modelo incorpora un modo de razonamiento explicito delimitado por los tokens `<think>` y `</think>`.

No se dispone del numero exacto de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO en la informacion proporcionada. Segun la model card del autor, el checkpoint se distribuye como punto de partida para investigacion en RL agentico, lo que sugiere que el SFT es el ultimo paso del pipeline publicado. Esta cuantizacion concreta no modifica los pesos: solo normaliza dos metadatos locales (el procesador de imagen a `Qwen2VLImageProcessorFast` y la desactivacion del side model MTP/NextN ausente) para adaptarlos al cargador Qwen3.5 de ExLlamaV3.

## Capacidades

- Generacion de texto y razonamiento explicito con modo de pensamiento (`<think>`/`</think>`) y presupuesto de tokens de razonamiento configurable.
- Codigo: entrenado sobre datos de codigo y codificacion visual, orientado a tareas de programacion y agentes de software.
- Vision: procesa imagenes ademas de texto; validado con una imagen de prueba (identificacion correcta de un cuadrado rojo).
- Tool calling / function calling: parseo de llamadas en formato `qwen3_5`; validado generando una llamada estructurada `get_weather` para Toronto.
- Agentes y razonamiento multi-paso: el modelo base esta disenado para tareas agenticas generales.
- Ciberseguridad: dominio declarado entre los objetivos de entrenamiento del modelo base.
- Servicio de multiples peticiones simultaneas a traves de API compatible con OpenAI (validado con dos peticiones concurrentes).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de codigo en produccion: el modelo soporta tool calling en formato `qwen3_5` y puede integrarse en pipelines que invoquen compiladores, linters o ejecutores de tests mediante la API compatible con OpenAI de TabbyAPI.
- Asistente multimodal de soporte tecnico: al aceptar imagenes ademas de texto, permite adjuntar capturas de pantalla o diagramas y obtener respuestas contextualizadas, con hasta 64K tokens de contexto validados.
- Despliegue en estaciones de trabajo con GPU de consumo: con aproximadamente 6,4-6,6 GiB de memoria en una RTX 3060 de 12 GB, es viable ejecutarlo localmente sin offload a CPU, ofreciendo entre 49 y 55 tok/s.
- Servicio de chat de baja latencia: sobre una RTX 4090 mantiene entre 111 y 145 tok/s de decodificacion segun el tamano de contexto, adecuado para asistentes interactivos con streaming.
- Procesamiento de documentos largos: la validacion de recuperacion de informacion (needle-in-a-haystack) paso en prompts de hasta 64.587 tokens, lo que permite resumir o consultar documentos extensos.
- Agente de ciberseguridad y analisis de codigo: el dominio de ciberseguridad forma parte del entrenamiento del modelo base, aplicable a revision de parches, triaje de alertas o analisis de fragmentos sospechosos.
- Investigacion en RL agentico: al ser un checkpoint SFT, sirve como base para experimentos de aprendizaje por refuerzo en entornos agenticos.
- Razonamiento con presupuesto controlado: el modo de pensamiento con limite de tokens (512 en las pruebas) permite equilibrar coste y calidad en tareas que requieren cadena de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los datos siguientes son mediciones locales de humo del autor, no comparables entre sistemas.

Escalado de contexto en RTX 4090 (TabbyAPI, EXL3 4.0 bpw, cache FP16, vision activada):

| Objetivo | Prompt real | Prefill tok/s | Decode tok/s | Tiempo total | Needle | Memoria GPU0 observada |
| ---: | ---: | ---: | ---: | ---: | :---: | ---: |
| 1K | 1.038 | 4.943 | 145,2 | 0,91 s | PASS | 8.039 MiB |
| 4K | 4.104 | 8.922 | 144,1 | 1,09 s | PASS | 8.175 MiB |
| 8K | 8.199 | 9.212 | 140,5 | 1,45 s | PASS | 8.191 MiB |
| 16K | 16.392 | 8.957 | 137,2 | 2,37 s | PASS | 8.199 MiB |
| 32K | 32.541 | 4.828 | 127,2 | 7,31 s | PASS | 8.201 MiB |
| 64K | 64.587 | 6.577 | 111,3 | 10,48 s | PASS | 8.203 MiB |

Comparativa de hardware sobre el mismo artefacto (mediciones locales de humo):

| Ubicacion | Decode ~1K (tok/s) | Decode ~8K (tok/s) | Decode ~16K (tok/s) | Generacion corta (tok/s) |
| --- | ---: | ---: | ---: | ---: |
| Solo RTX 4090 | 145,2 | 140,5 | 137,3 | ~145-148 |
| RTX 4090 + RTX 3060 (split) | 106,2 | 102,4 | 100,7 | 108,1 |
| Solo RTX 3060 12GB | 53,5 | 49,0 | 50,3 | 55,8 |

Otras mediciones de validacion: carga directa en ExLlamaV3 y generacion PASS, decodificacion directa 118,009 tok/s, carga en TabbyAPI PASS, chat completion compatible con OpenAI PASS (147,64 tok/s), streaming PASS. En estabilidad de generacion larga (6 ejecuciones de hasta 1.024 tokens), 0/6 activaron la heuristica de bucles de n-gramas repetidos, con ratios de 4-gramas repetidos entre 0,0079 y 0,0381.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa aproximadamente 6,4 GiB. En RTX 4090 con vision activada se observaron ~8,2 GiB totales durante las pruebas; en RTX 3060 12GB, entre 6,4 y 6,6 GiB totales.
- GPU recomendadas: RTX 4090 (24 GB) para maximo rendimiento (hasta ~145 tok/s); RTX 3060 12GB para despliegue con menor coste (~50-56 tok/s).
- GPU de consumo: si, cabe en GPUs con 12 GB o mas. Funciona en una RTX 3060 12GB sin offload a CPU y sin colocar capas en otra GPU.
- Configuracion multi-GPU: el split mixto RTX 4090 + RTX 3060 fue mas lento que la 4090 en solitario (106,2 frente a 145,2 tok/s a 1K); el autor recomienda no mezclar GPUs heterogeneas si se busca rendimiento.
- Opciones de despliegue: TabbyAPI con backend exllamav3 (soporta API compatible con OpenAI, streaming y peticiones concurrentes). Para otros formatos existen cuantizaciones GGUF (ggml-org, prithivMLmods) utilizables con llama.cpp u Ollama, aunque no forman parte de este repositorio.
- Configuracion de referencia en TabbyAPI: `max_seq_len` 8192 y `cache_size` 8192, `vision: true`, `reasoning: true`, `tool_format: qwen3_5`. Se validaron prompts de hasta 64K pese a la configuracion por defecto de 8192.
- Latencia y throughput estimados: prefill entre 4.828 y 9.212 tok/s; decode entre 111,3 (64K) y 145,2 tok/s (1K) en RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| ramgpt/MiMo-V2.6-Distill-Qwen-9B-EXL3-4.0bpw | 3,42B segun safetensors (base declara 9B) | 64K validados | 111-145 tok/s (RTX 4090, decode) | MIT | safetensors EXL3 4.0 bpw |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (upstream) | 9B (9,4B en algunas fuentes) | no disponible | no disponible | MIT | safetensors BF16/FP16 |
| prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-GGUF | 9B (base) | no disponible | no disponible | MIT (heredada) | GGUF |
| Qwen3.5-9B (base del pipeline) | 9B | no disponible | no disponible | no disponible | safetensors |

La comparativa de contexto, rendimiento y disponibilidad del modelo upstream y de la version GGUF no esta publicada en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: el repositorio safetensors declara 3.420.001.152 parametros, mientras que el modelo base se describe como de 9B (9,4B en una fuente). Conviene verificar el indice real antes de planificar el despliegue.
- Metadatos normalizados: la conversion altero el nombre del procesador de imagen y desactivo un side model MTP/NextN ausente. Estos cambios afectan solo a metadatos, pero implican que la carga depende del cargador Qwen3.5 de ExLlamaV3.
- Formato propietario de inferencia: los pesos EXL3 solo son utilizables con ExLlamaV3/TabbyAPI; no sirven directamente en vLLM, TGI ni llama.cpp. Para esos entornos hay que recurrir a otras cuantizaciones o al modelo original.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual. En las pruebas de estabilidad se observaron salidas con repeticion de lineas cortas de formato Markdown, aunque no se contabilizaron como bucles semanticos.
- Contexto: aunque se validaron prompts de hasta 64K tokens, la configuracion de referencia de TabbyAPI usaba 8192; superar ese limite exige reconfigurar `max_seq_len` y `cache_size`, con el coste de VRAM asociado.
- Idiomas: no hay informacion sobre cobertura multilingue ni calidad por idioma.
- Licencia: MIT permite uso comercial, pero los terminos aplicables son los del modelo base (XiaomiMiMo), por lo que conviene revisar su model card al completo.
- Sesgos: no se han documentado sesgos conocidos en la informacion disponible.
- Estabilidad y benchmarks: las cifras de throughput son mediciones de humo locales de un unico sistema, no benchmarks estandarizados; el test de estabilidad de generacion larga es una muestra pequena y no prueba la ausencia de bucles con otros prompts.
- Version: esta es una cuantizacion comunitaria independiente; puede quedar desactualizada respecto al modelo upstream.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/ramgpt/MiMo-V2.6-Distill-Qwen-9B-EXL3-4.0bpw
- Modelo base upstream: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Ficheros del modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B/tree/main
- Cuantizacion GGUF (prithivMLmods): https://huggingface.co/prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-GGUF
- README de la version GGUF: https://huggingface.co/prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-GGUF/blob/main/README.md
- ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Analisis de la version GGUF: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/22/mimo-v2-6-distill-qwen-9b-gguf/
- Especificaciones y VRAM: https://apxml.com/models/mimo-v2-6-distill-qwen-9b
