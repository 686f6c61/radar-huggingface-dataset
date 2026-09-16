# Honkware/Qwen3-8B-exl3-4.0bpw

## Resumen

Honkware/Qwen3-8B-exl3-4.0bpw es una cuantizacion del modelo denso Qwen/Qwen3-8B, publicada por el usuario Honkware en el formato propietario EXL3 de ExLlamaV3 a 4,0 bits por peso. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversion de pesos que reduce el tamano del repositorio a 5,2 GB manteniendo la arquitectura, el tokenizador y el comportamiento del modelo original. Su proposito es permitir servir Qwen3-8B en GPUs de consumo o en nodos con VRAM limitada sin recurrir a otros formatos cuantizados.

La relevancia de esta ficha es acotada y conviene dejarla clara: EXL3 es un formato de inferencia especifico de ExLlamaV3, por lo que el modelo no es cargable con vLLM, llama.cpp, Ollama ni TGI. Su utilidad esta vinculada a la pila de ExLlamaV3 (TabbyAPI, text-generation-webui con loader ExLlamaV3 o la API Python directa). El autor reporta una divergencia KL mediana de 0,0068 frente al modelo base, un dato de fidelidad de cuantizacion, no un benchmark de capacidad.

El modelo base Qwen3-8B es un transformer denso de aproximadamente 8.200 millones de parametros con 36 capas y modo de razonamiento explicito (thinking mode), desarrollado por el equipo Qwen de Alibaba. Esta cuantizacion hereda integramente su licencia Apache 2.0 y sus capacidades; la cuantizacion no anade restricciones de uso segun la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-8B), 36 capas |
| Parametros totales | 8,2 mil millones aproximadamente en el modelo base; el recuento de safetensors del repo cuantizado indica 2.595.337.600 (ver advertencia mas abajo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens de forma nativa en el modelo base, extensible a 131.072 mediante YaRN (no confirmado en el repo de cuantizacion) |
| Tipos de cuantizacion | EXL3 a 4,0 bpw (bits por peso); 6 bits en las cabezas; codebook mul1; out-scales siempre activos; modo paralelo habilitado |
| Idiomas soportados | No disponible en el repo de cuantizacion; el modelo base declara soporte de 119 idiomas y dialectos |
| Licencia | Apache 2.0, heredada del modelo base |
| Formato de pesos | safetensors con tensores empaquetados en formato EXL3 (libreria exllamav3) |
| Tamano del repositorio | 5,2 GB |
| Calibracion | 250 filas, mezcla incluida en exllamav3 (c4, code, multilingual, technical, tiny, wiki) |
| Herramienta de cuantizacion | BlockQuant (Honkware) |
| Pipeline | text-generation |
| Fecha de creacion | 16 de septiembre de 2026 |

Advertencia sobre el recuento de parametros: la cabecera de HuggingFace informa de 2.595.337.600 parametros leidos de los safetensors, una cifra incompatible con un Qwen3-8B intacto. Lo mas probable es que el contador refleje tensores empaquetados o almacenados en un layout comprimido y no el numero efectivo de pesos. El tamano de 5,2 GB a 4,0 bpw es coherente con un modelo de unos 8.000 millones de parametros, no con 2.600 millones. Debe tratarse como una discrepancia de metadatos, no como una reduccion real del modelo.

## Arquitectura y entrenamiento

Este repositorio no incluye entrenamiento alguno. Se trata de una cuantizacion post-entrenamiento del checkpoint Qwen/Qwen3-8B, aplicada con la herramienta BlockQuant del propio autor sobre el formato EXL3 de ExLlamaV3. La receta registrada en `quantization_config.json` especifica 4,0 bits por peso, 6 bits para las cabezas, 250 filas de calibracion extraidas de la mezcla multilingue y tecnica que exllamav3 distribuye (c4, code, multilingual, technical, tiny, wiki), codebook `mul1`, escalas de salida siempre presentes y modo paralelo activado.

La arquitectura subyacente es la del modelo base: un transformer denso con 36 capas, atencion con consultas agrupadas (GQA), normalizacion RMSNorm y tokenizador con vocabulario amplio. Qwen3-8B incorpora un modo de pensamiento explicito que genera una traza de razonamiento antes de la respuesta final, activable o desactivable por prompt o por plantilla de chat, ademas de soporte nativo de function calling y de agentes multi-paso. No hay innovaciones propias de esta publicacion mas alla del proceso de cuantizacion; el autor reporta una divergencia KL mediana de 0,0068 respecto al modelo sin cuantizar, que es el unico indicador de calidad publicado.

## Capacidades

- Generacion de texto y conversacion multi-turno con plantilla de chat de Qwen3.
- Razonamiento con modo de pensamiento explicito (thinking mode), con presupuesto de razonamiento configurable por el usuario.
- Generacion de codigo y tareas de refactorizacion o explicacion sobre repositorios de tamano medio.
- Razonamiento matematico y problemas de varios pasos.
- Soporte de tool calling y function calling mediante el formato definido por Qwen3.
- Flujos de agente con razonamiento encadenado y uso de herramientas externas.
- Capacidades multilingues heredadas del modelo base (119 idiomas declarados por Qwen).
- Funcionamiento local sin conexion, al ser un formato de inferencia offline.
- No dispone de vision, audio ni multimodalidad: es un modelo exclusivamente de texto.
- Se desconoce si la cuantizacion degrada de forma desproporcionada alguna capacidad concreta; no hay evaluaciones publicadas al respecto.

## Casos de uso

- Servidor de chat local en una sola GPU de consumo: con 5,2 GB de pesos, el modelo cabe en tarjetas de 8 a 12 GB, lo que permite levantar un asistente conversacional privado con TabbyAPI y una interfaz compatible con la API de OpenAI sin enviar datos a terceros.
- Asistente de codigo en el puesto de trabajo: integrado mediante la API Python de ExLlamaV3 en un plugin de editor, aprovecha el modo de pensamiento para tareas de depuracion y explicacion de fragmentos, con latencia baja al ejecutarse en local.
- Procesamiento por lotes de documentacion tecnica: resumen, extraccion de entidades y clasificacion sobre ficheros largos, apoyandose en la ventana de contexto del modelo base y en el ahorro de VRAM de la cuantizacion para mantener varios flujos concurrentes.
- Backend de agente con tool calling: al conservar el soporte nativo de function calling de Qwen3, puede conectarse a herramientas internas (consultas SQL, APIs REST, busqueda documental) dentro de un bucle de agente multi-paso servido por TabbyAPI.
- Prototipado e investigacion en entornos con hardware escaso: laboratorios con una unica RTX 4090 o A100 de 40 GB pueden evaluar el comportamiento de Qwen3-8B y comparar variantes de bpw de la misma coleccion sin reentrenar ni disponer de nodos multigpu.
- Generacion de respuestas en atencion al cliente en idiomas minoritarios: el multilingue del modelo base permite cubrir consultas en lenguas europeas distintas del ingles con un unico despliegue.
- Evaluacion de tecnicas de cuantizacion: la coleccion del autor incluye varios anchos de bits para el mismo modelo, lo que permite estudiar la relacion entre bpw, divergencia KL y calidad percibida en una tarea concreta.
- Sustitucion de APIs comerciales en entornos con requisitos de soberania del dato: al ejecutarse en infraestructura propia y bajo Apache 2.0, encaja en despliegues donde no se permite enviar texto a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni los metadatos del repositorio incluyen MMLU, HumanEval, GSM8K ni ninguna otra evaluacion de capacidad.

El unico dato cuantitativo publicado es la fidelidad de la cuantizacion respecto al modelo base:

| Metrica | Valor |
|---|---|
| Divergencia KL mediana (4,0 bpw frente al base) | 0,0068 |
| Bits por peso | 4,0 |
| Bits en cabezas | 6 |
| Filas de calibracion | 250 |

Esta cifra mide cuanto se desvia la distribucion de probabilidad del modelo cuantizado de la del original; no es comparable con benchmarks de tareas y no debe presentarse como indicador de rendimiento funcional. Cualquier dato de MMLU o HumanEval corresponderia al modelo base Qwen3-8B y no ha sido verificado en esta cuantizacion.

## Requisitos de hardware

- Peso en disco y en VRAM: 5,2 GB de pesos. El consumo total depende de la cache KV y del contexto configurado, no incluido en esa cifra.
- VRAM estimada: en torno a 6-7 GB con contexto corto (2.000-4.000 tokens) y de 9 a 12 GB con contextos de 16.000 a 32.000 tokens, segun el numero de secuencias concurrentes.
- Cabe en GPU de consumo: si. Tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 pueden ejecutarlo. En GPUs de 8 GB el modelo entra con contextos reducidos y una sola secuencia.
- GPU profesionales: A100 de 40/80 GB, H100 y L40S permiten lotes mayores y contextos largos; ExLlamaV3 soporta reparto entre varias GPUs, por lo que dos tarjetas de 12-16 GB son una opcion viable.
- Opciones de despliegue: ExLlamaV3 (API Python directa), TabbyAPI (servidor HTTP compatible con la API de OpenAI) y text-generation-webui seleccionando el loader ExLlamaV3. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato EXL3 es exclusivo de la pila de ExLlamaV3.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio ni para configuraciones de hardware concretas.
- Almacenamiento: 5,2 GB en disco, mas el espacio temporal de descarga si se usa `hf download`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Honkware/Qwen3-8B-exl3-4.0bpw | ~8,2 mil millones (base) | 32.768, ampliable a 131.072 en el base | EXL3, 4,0 bpw, 5,2 GB | Apache 2.0 | Solo ExLlamaV3; KL mediana 0,0068 |
| Qwen/Qwen3-8B (original) | ~8,2 mil millones | 32.768, ampliable a 131.072 | safetensors bf16, ~16,4 GB | Apache 2.0 | Referencia de calidad; requiere mas VRAM |
| Cuantizacion GGUF 4-bit de Qwen3-8B | ~8,2 mil millones | Segun configuracion del runtime | GGUF, ~5,0 GB | Apache 2.0 | Compatible con llama.cpp y Ollama; ecosistema mas amplio |
| Cuantizacion AWQ o GPTQ 4-bit de Qwen3-8B | ~8,2 mil millones | Segun runtime | safetensors, ~5,5 GB | Apache 2.0 | Compatible con vLLM y TGI; no cargable en ExLlamaV3 |
| Llama 3.1 8B Instruct | 8,03 mil millones | 128.000 | safetensors bf16 o GGUF | Licencia comunitaria de Meta | Alternativa de tamano similar, con condiciones de uso propias y menos idiomas declarados |

La diferencia practica entre esta cuantizacion y las alternativas de 4 bits no esta en el tamano (todas rondan los 5 GB), sino en el runtime: EXL3 ofrece un rendimiento notable en GPUs de consumo dentro de ExLlamaV3, pero queda fuera de los ecosistemas de vLLM, llama.cpp y Ollama. Para despliegues en servidor con vLLM, una cuantizacion AWQ o GPTQ resulta mas adecuada.

## Limitaciones y advertencias

- Formato cerrado a ExLlamaV3: no se puede cargar con vLLM, llama.cpp, Ollama, TGI ni Transformers estandar. Esto limita seriamente la portabilidad y el despliegue en plataformas gestionadas.
- Divergencia de parametros en los metadatos: el recuento de 2.595.337.600 parametros de la cabecera no cuadra con un Qwen3-8B. Conviene verificar el modelo antes de integrarlo en un pipeline automatizado.
- Sin evaluaciones de capacidad: no hay MMLU, HumanEval ni GSM8K para esta cuantizacion. La degradacion real en tareas de codigo o matematicas no esta medida; el dato de KL no la sustituye.
- Riesgo de alucinacion: heredado del modelo base. En modo de pensamiento, una traza de razonamiento coherente no garantiza una respuesta correcta.
- Idiomas no declarados en el repo: aunque el base declara 119 idiomas, la cuantizacion no especifica cobertura y la calibracion puede haber favorecido ciertos idiomas sobre otros.
- Sesgos: no documentados en esta publicacion. Deben asumirse los del modelo base, derivados de sus datos de entrenamiento.
- Licencia: Apache 2.0, sin restricciones adicionales segun el autor. El uso comercial esta permitido siempre que se conserve la atribucion correspondiente; conviene revisar igualmente los terminos del modelo base.
- Repositorio sin traccion: cero descargas y cero likes en el momento del registro, sin validacion independiente por parte de la comunidad.
- Fecha de publicacion anomala (16 de septiembre de 2026): conviene confirmar la procedencia y la integridad del repositorio antes de usarlo en produccion.
- Sin garantias de mantenimiento: al no ser una publicacion oficial de Qwen, no cabe esperar actualizaciones ni soporte.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Honkware/Qwen3-8B-exl3-4.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Coleccion de cuantizaciones del autor: https://huggingface.co/collections/Honkware/qwen3-8b-exl3-6aa9f13b630d4868abb0748a
- Perfil del autor: https://huggingface.co/Honkware
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- TabbyAPI: https://github.com/theroyallab/tabbyAPI
- text-generation-webui: https://github.com/oobabooga/text-generation-webui
- Herramienta de cuantizacion BlockQuant: https://github.com/Honkware/blockquant
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
