# blallo27/Nanbeige4.3-33B-Q6_K-GGUF

## Resumen

`blallo27/Nanbeige4.3-33B-Q6_K-GGUF` es una cuantización en formato GGUF del modelo `Nanbeige/Nanbeige4.3-33B`, publicada por el usuario blallo27. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos realizada con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, con la cuantización Q6_K (aproximadamente 6,57 bits por peso). El resultado es un único fichero de unos 27,2 GB que permite ejecutar un modelo de 33.118.977.024 parámetros en infraestructura local sin depender de GPUs de datacenter de gran formato.

El modelo base es bilingüe inglés-chino, está liberado bajo licencia Apache 2.0 y pertenece a la familia Nanbeige 4.x. La información disponible no documenta la arquitectura interna, la longitud de contexto, la composición del corpus de entrenamiento ni los resultados de benchmarks, por lo que esta ficha marca explícitamente esos campos como no disponibles en lugar de inferirlos.

Su relevancia práctica es doble: por un lado, acerca un modelo de 33B a entornos con una sola GPU de 40-48 GB o a configuraciones de dos GPUs de consumo; por otro, al ser un artefacto GGUF, se integra directamente en llama.cpp, llama-server y cualquier runtime compatible con GGUF, lo que facilita despliegues aislados y pruebas de inferencia local sin infraestructura de serving específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la informacion proporcionada) |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (GGUF); este repositorio solo publica Q6_K |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `nanbeige4.3-33b-q6_k.gguf`) |
| Tamano del repositorio | 27,2 GB |
| Bits por peso (estimado) | ~6,57 (27,2 GB / 33,1B parametros) |
| Modelo base | Nanbeige/Nanbeige4.3-33B |
| Herramienta de conversion | llama.cpp + GGUF-my-repo (ggml-org) |
| Pipeline | text-generation |
| Etiquetas relevantes | conversational, endpoints_compatible, llama-cpp |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye detalles sobre la arquitectura del modelo base: no se especifica si se trata de un transformer decoder-only denso, de una variante con atención lineal o de una mezcla de expertos. Tampoco se documentan el numero de capas, la configuracion de cabezas de atención, el tipo de normalizacion ni el tokenizador. El recuento de parametros (33.118.977.024) es el unico dato estructural verificable y procede de los safetensors del modelo original.

Respecto al entrenamiento, no hay datos sobre volumen de tokens, composicion del corpus, tecnicas de alineacion (RLHF, DPO, RLHF con verificador) ni procesos de post-entrenamiento. Esta ficha no puede confirmar ni desmentir ninguna de esas practicas. Lo unico documentado del artefacto es el proceso de cuantizacion: conversion de los pesos originales a GGUF con llama.cpp, en variante Q6_K, que preserva la practica totalidad de la precision del modelo en fp16 a costa de un tamano de fichero elevado (27,2 GB) en comparacion con cuantizaciones Q4_K_M o Q5_K_M.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Soporte de ingles y chino como idiomas declarados en la model card; no se declara soporte de castellano ni de otros idiomas.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`), lo que permite exponer el modelo mediante una API compatible con el esquema de OpenAI a traves de llama-server.
- Ejecucion local y offline mediante llama.cpp, tanto en CLI como en modo servidor.
- Tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Vision, audio o modalidades adicionales: no disponible.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Asistente interno bilingüe ingles-chino: el modelo puede gestionar conversaciones multi-turno en ambos idiomas sobre documentacion corporativa, aprovechando que son los dos idiomas declarados y evitando riesgos de calidad en idiomas no soportados.
- Despliegue aislado (air-gapped) en entornos con requisitos de soberania del dato: al ser un GGUF ejecutable con llama.cpp, el modelo corre en una maquina sin salida a Internet, sin telemetria ni llamadas a APIs externas.
- Servicio de inferencia interno con API compatible con OpenAI: mediante `llama-server` se puede levantar un endpoint HTTP y conectar herramientas existentes (clientes de OpenAI, LangChain, LlamaIndex) cambiando solo la URL base.
- Traduccion y localizacion de contenido entre ingles y chino: el modelo base esta orientado a ambos idiomas, por lo que resulta adecuado para pre-traducir documentacion tecnica o fichas de producto antes de la revision humana.
- Prototipado y evaluacion comparativa de modelos de 33B en local: la cuantizacion Q6_K permite medir calidad y latencia reales en el hardware objetivo antes de comprometerse con una infraestructura de serving mayor.
- Generacion aumentada por recuperacion (RAG) sobre corpus internos: el modelo se puede integrar como generador en un pipeline RAG que inyecte contexto en el prompt; conviene validar empiricamente la longitud de contexto efectiva, ya que no esta documentada.
- Procesamiento por lotes de textos largos en chino e ingles (clasificacion, resumen, extraccion de entidades) usando el modo CLI de llama.cpp en scripts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado es una plantilla generada automaticamente por GGUF-my-repo y no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica. Tampoco se aportan comparaciones con el modelo base en fp16 ni mediciones de perplejidad tras la cuantizacion.

## Requisitos de hardware

- Pesos en disco y en memoria: 27,2 GB para Q6_K. Es la cuantizacion de mayor peso del rango practico para este tamano; Q4_K_M o Q5_K_M reducirian el requisito a aproximadamente 20 y 23 GB respectivamente, a costa de cierta perdida de calidad.
- VRAM estimada para inferencia completa en GPU: 29-32 GB, sumando pesos, cache KV y overhead de llama.cpp. La cifra exacta de cache KV depende de la configuracion de capas y cabezas, que no se documenta; para contextos de 2.048-8.192 tokens el sobrecoste suele ser de 1-4 GB en modelos de este tamano (estimacion, no medida).
- GPU de datacenter compatibles: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. En todas ellas el modelo cabe completo en VRAM.
- GPU de consumo: no cabe completa en una RTX 4090, 4080, 3090 o 3080 de 24 GB o menos. Es viable con offload parcial de capas a CPU (`--n-gpu-layers`), asumiendo una caida notable de throughput. Dos RTX 4090 o dos RTX 3090 con `--tensor-split` lo ejecutan completo, con unos 13,6 GB de pesos por tarjeta mas cache KV.
- Apple Silicon: Mac con memoria unificada de 32 GB en adelante; 36 GB (M2/M3 Max) queda ajustado y 48-64 GB es recomendable para contextos largos.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama (importando el GGUF mediante Modelfile), text-generation-webui y LM Studio. vLLM soporta GGUF de forma experimental, con limitaciones frente a pesos safetensors.
- Latencia y throughput: no hay mediciones publicadas para este checkpoint. Como referencia teorica, la decodificacion esta limitada por el ancho de banda de memoria: en una A100 40 GB (1,55 TB/s) el techo teorico ronda las 55 tokens/s, con valores reales habitualmente en el rango de 20-35 tokens/s. En configuraciones con offload a CPU el rendimiento cae a un digito de tokens/s. Estas cifras son estimaciones, no resultados medidos sobre este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (este GGUF Q6_K) | 33,1B | no disponible | en, zh | apache-2.0 | GGUF (Q6_K en este repo) |
| Qwen2.5-32B | 32,8B | 32.768 nativo, ampliable a 131.072 | multilingue (incluye es, en, zh) | apache-2.0 | safetensors, GGUF, AWQ, GPTQ |
| Gemma 2 27B | 27B | 8.192 | multilingue | Gemma license (uso comercial permitido con condiciones) | safetensors, GGUF |
| Yi-34B | 34B | 4.096 en la version base, 200.000 en la variante 200K | en, zh | apache-2.0 | safetensors, GGUF |

La comparacion se limita a parametros, contexto, idiomas y licencia, porque no hay datos publicados de rendimiento del modelo Nanbeige en la informacion disponible. En tamano, el modelo se situa en la misma liga que Qwen2.5-32B e Yi-34B; frente a ellos, su desventaja documental es la ausencia de contexto declarado y de evaluaciones publicadas, y su ventaja es la licencia Apache 2.0 sin condiciones adicionales.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks del modelo base ni de esta cuantizacion, por lo que la calidad real frente a alternativas establecidas no esta cuantificada.
- Contexto desconocido: se desconoce la ventana maxima. El ejemplo de la model card usa `-c 2048`, lo que no implica que ese sea el limite del modelo, pero obliga a validar empiricamente cualquier caso de uso con prompts largos.
- Solo ingles y chino: no se declara soporte de castellano. El rendimiento en espanol es impredecible y debe medirse antes de usar el modelo en produccion para ese idioma.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala y agravado por la falta de documentacion sobre alineacion y datos de entrenamiento.
- Artefacto de comunidad: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta y lo publica un usuario individual, no el equipo de Nanbeige. No hay garantia de mantenimiento, de correspondencia exacta con el modelo base ni de soporte.
- Una sola cuantizacion disponible: solo se ofrece Q6_K. Quien necesite Q4_K_M o Q5_K_M para hardware mas limitado debe generarla por su cuenta desde el modelo base.
- Perdida por cuantizacion: Q6_K es casi lossless en la practica, pero no identica al fp16; no se aporta ninguna medicion de perplejidad que lo confirme.
- Licencia: el repositorio declara apache-2.0, lo que permite uso comercial. Conviene verificar igualmente la model card del modelo base por si el autor original anade terminos adicionales.
- Plantilla de chat y tokenizador no documentados: es necesario extraer la plantilla del modelo base o inspeccionar el GGUF para configurar correctamente el prompt en llama-server, bajo riesgo de respuestas degradadas.
- Metadatos con fechas no verificables: el repositorio figura como creado el 25 de octubre de 2026, una fecha posterior a la consulta, lo que sugiere un problema en los metadatos del autor.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/blallo27/Nanbeige4.3-33B-Q6_K-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Espacio GGUF-my-repo (ggml-org): https://huggingface.co/spaces/ggml-org/gguf-my-repo
