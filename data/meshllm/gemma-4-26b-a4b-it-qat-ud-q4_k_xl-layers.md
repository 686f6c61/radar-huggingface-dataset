# meshllm/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-layers

## Resumen

`meshllm/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-layers` es un paquete de capas en formato GGUF publicado por Mesh LLM para ejecutar el modelo Gemma 4 de 26B parametros con 4B activos (arquitectura MoE) en inferencia distribuida sobre un cluster local. No es un modelo nuevo: es una redistribucion por capas del GGUF `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL` de Unsloth, que a su vez deriva del Gemma 4 original de Google con cuantizacion consciente de cuantizacion (QAT) y cuantizacion dinamica UD-Q4_K_XL.

El paquete resuelve un problema concreto de despliegue: el GGUF completo ocupa 19,4 GB y no cabe comodamente en una sola GPU de consumo, de modo que Mesh LLM lo fragmenta en artefactos por capa (30 capas segun la model card) que se reparten entre varias maquinas del cluster. El nodo coordinador expone una API compatible con OpenAI (`/v1/chat/completions`), lo que permite integrarlo en pipelines existentes sin reescribir clientes.

Es relevante ahora porque demuestra una via practica para servir modelos de escala 26B en hardware heterogeneo y de propiedad, sin depender de la nube, manteniendo la licencia Apache 2.0 heredada del modelo base. La ficha tecnica del modelo subyacente (arquitectura, contexto, idiomas, benchmarks) debe consultarse en la model card de Unsloth, ya que este repositorio solo documenta el empaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Gemma 4); detalles de capas y atencion no disponibles en este repositorio |
| Parametros totales | 26B segun la model card; el campo safetensors del repo indica 814.095.233 (corresponde a un subconjunto de pesos, no al total) |
| Parametros activos | 4B (denominacion A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (unica variante empaquetada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF fragmentado en paquetes de capas (layer-package) |
| Capas | 30 |
| Tamano del repo | 19,4 GB |
| Libreria | mesh-llm |
| Pipeline | image-text-to-text (multimodal imagen-texto) |
| Modelo base | unsloth/gemma-4-26B-A4B-it-qat-GGUF |
| Revision de origen | 7b92b5b28818151e8669af2e45e88d6086f490dd |
| SHA-256 del GGUF de origen | a7c5bc715f5ff8e99a3e8901ce7d2b42b402c669bf24f7c5250747633d0f5891 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Gemma 4 en variante MoE con 26B parametros totales y 4B activos por token, segun la nomenclatura 26B-A4B de la model card. Este repositorio no aporta informacion sobre el numero de expertos, la distribucion de capas densas frente a MoE, la funcion de activacion ni el esquema de atencion; esos datos deben consultarse en la model card de `unsloth/gemma-4-26B-A4B-it-qat-GGUF`.

El entrenamiento tampoco esta documentado aqui: no se indica el volumen de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Lo unico verificable es que el modelo base incorpora QAT (quantization-aware training) y que la variante empaquetada aplica la cuantizacion dinamica UD-Q4_K_XL de Unsloth. La innovacion tecnica de este repositorio es el empaquetado: el GGUF se divide en artefactos por capa con checksums SHA-256 individuales, generados por el splitter de Mesh LLM (ref `f932c4d1dc12b3e3a670d5f470cedd5cdcc5db39`), lo que permite planificar la colocacion de capas entre nodos con distinta memoria.

## Capacidades

- Generacion de texto conversacional con plantilla de chat instruct (`-it`), orientada a dialogos multi-turno.
- Procesamiento de imagen y texto de entrada (`pipeline_tag: image-text-to-text`), segun la metadata del repositorio.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions` y `/v1/models`) a traves del runtime Mesh LLM.
- Inferencia distribuida: reparto de capas entre multiples maquinas del cluster con `mesh-llm serve --split`.
- Ejecucion local y privada, sin salida de datos hacia servicios externos.
- Capacidades de razonamiento, codigo, matematicas, tool calling y modo thinking: no disponibles en la informacion proporcionada; deben verificarse en la model card del modelo base.

## Casos de uso

- Despliegue en cluster domestico u oficina: varias maquinas con GPU de consumo suman memoria para alojar las 30 capas del GGUF de 19,4 GB, evitando comprar una GPU de datacenter. El comando `mesh-llm serve --model ... --split` se ejecuta en cada nodo contribuyente.
- Sustitucion local de la API de OpenAI: al exponer `/v1/chat/completions` en el puerto 3131, los clientes existentes (SDKs, LangChain, aplicaciones internas) apuntan al endpoint local cambiando solo la URL base y el nombre del modelo.
- Prototipado de asistentes multimodales: el pipeline image-text-to-text permite procesar capturas, diagramas o documentos escaneados junto con instrucciones en texto, util para validar flujos de vision antes de invertir en infraestructura mayor.
- Laboratorio de investigacion con requisitos de privacidad: datos sensibles que no pueden salir a APIs externas se procesan integramente en hardware propio, con trazabilidad de artefactos mediante los SHA-256 publicados.
- Evaluacion de tecnicas de inferencia distribuida: el paquete sirve como banco de pruebas para medir el impacto del particionado por capas en latencia y throughput frente a la ejecucion monolita del mismo GGUF.
- Generacion de codigo en entornos internos: la naturaleza instruct del modelo base permite tareas de autocompletado y explicacion de codigo dentro de herramientas de desarrollo corporativas, siempre que se valide su calidad en la model card de origen.
- Formacion y docencia: el coste de entrada (hardware heterogeneo, licencia Apache 2.0) facilita montar entornos de practica con un modelo de escala 26B sin depender de cuentas cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente a la ficha de `unsloth/gemma-4-26B-A4B-it-qat-GGUF` para notas de rendimiento.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 19,4 GB en formato UD-Q4_K_XL; la memoria necesaria para pesos ronda ese orden, mas overhead de cache KV que no esta documentado.
- Una sola GPU de 24 GB (RTX 3090, RTX 4090) puede alojar los pesos, pero el margen para contexto y cache es ajustado; no hay datos publicados de latencia en ese escenario.
- Configuracion recomendada por el autor: varias maquinas con `mesh-llm serve --split`, repartiendo las 30 capas entre nodos.
- GPUs de datacenter (A100, H100) no estan mencionadas en la documentacion del paquete; su uso es posible pero no esta validado por el autor.
- Opciones de despliegue: runtime Mesh LLM (libreria `mesh-llm`). No se documenta compatibilidad directa con llama.cpp, Ollama, vLLM o TGI para este paquete fragmentado; el GGUF de origen podria usarse con esos runtimes, pero no esta indicado en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| meshllm/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-layers | 26B | 4B | no disponible | GGUF por capas | Apache 2.0 | Inferencia distribuida en cluster local |
| unsloth/gemma-4-26B-A4B-it-qat-GGUF | 26B | 4B | no disponible | GGUF monolitico | Apache 2.0 | Inferencia en un solo host con llama.cpp y derivados |
| Gemma 4 26B-A4B (modelo original) | 26B | 4B | no disponible | safetensors | Terminos de Gemma (no verificados en esta fuente) | Entrenamiento y ajuste fino |

La comparativa se limita a variantes del mismo modelo base porque la informacion proporcionada no incluye datos de rendimiento que permitan contrastarlo con familias distintas.

## Limitaciones y advertencias

- Este repositorio no es un modelo entrenado de forma independiente: cualquier limitacion de calidad, sesgo o alucinacion proviene del Gemma 4 base y de la cuantizacion Q4, y no esta documentada aqui.
- La cuantizacion UD-Q4_K_XL introduce perdida de precision respecto a los pesos originales; el impacto en tareas de razonamiento y codigo no esta cuantificado en la informacion disponible.
- No se documentan idiomas soportados; no debe asumirse un rendimiento equivalente en castellano sin evaluacion previa.
- El paquete esta disenado para el runtime Mesh LLM; usarlo con otras herramientas requiere reconstruir el GGUF a partir de los artefactos por capa.
- La metadata de safetensors del repositorio (814 millones de parametros) no coincide con los 26B declarados en la model card; es un artefacto del empaquetado por capas y no debe citarse como tamano real del modelo.
- La licencia Apache 2.0 se hereda del repositorio de Unsloth; conviene verificar los terminos del Gemma 4 original antes de un uso comercial, ya que la cadena de licencias no esta detallada en esta fuente.
- Los campos "activation width", "Skippy ABI" y "package size" aparecen como no registrados o con valor 0 B en la model card, lo que sugiere documentacion incompleta del empaquetado.
- No hay resultados de benchmarks ni metricas de latencia publicadas para esta variante distribuida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/meshllm/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-layers
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio GitHub de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Especificacion del formato de paquetes por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord: https://discord.gg/rs6fmc63eN
