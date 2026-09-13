# meshllm/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-layers

## Resumen

Este repositorio no contiene un modelo en sentido estricto, sino un paquete de inferencia distribuida en formato GGUF por capas (layer package) para Mesh LLM, derivado de `unsloth/gemma-4-26B-A4B-it-qat-GGUF`. El autor es meshllm, el paquete tiene licencia Apache 2.0 heredada del modelo base y su proposito es permitir ejecutar el modelo `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL` repartiendo sus 30 capas entre varias maquinas de una red local, sirviendo despues una API compatible con OpenAI a traves del endpoint `/v1/chat/completions`. El repositorio ocupa 19,4 GB y fue creado y actualizado el 12 de septiembre de 2026.

El modelo subyacente pertenece a la familia Gemma y se identifica con la escala 26B-A4B, lo que sugiere un diseno de mezcla de expertos con aproximadamente 4B de parametros activos por token y 26B totales; se distribuye con la cuantizacion `UD-Q4_K_XL`, derivada de un modelo entrenado con quantisation-aware training (QAT). La pipeline declarada en HuggingFace es `image-text-to-text`, por lo que el modelo acepta entradas de imagen y texto. La model card del paquete no documenta arquitectura, contexto, idiomas ni datos de entrenamiento; remite explicitamente al repositorio de Unsloth para esos detalles.

Su relevancia practica es doble: por un lado, es un ejemplo de empaquetado de pesos por capas para inferencia agregada en cluster domestico u oficina, util cuando el GGUF completo no cabe en un unico host; por otro, permite servir un modelo multimodal de escala 26B de forma privada y compatible con clientes OpenAI sin depender de infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en el paquete; familia Gemma, escala 26B-A4B (indicio de mezcla de expertos, sin confirmar en la model card) |
| Parametros totales | 26B segun la nomenclatura de escala de la model card; los metadatos safetensors del repositorio declaran 814.095.233 parametros en el artefacto |
| Parametros activos | ~4B segun la nomenclatura A4B (no confirmado en la documentacion del paquete) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `UD-Q4_K_XL` (GGUF), derivada de un modelo QAT |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (heredada de `unsloth/gemma-4-26B-A4B-it-qat-GGUF`) |
| Formato de pesos | GGUF dividido en artefactos por capa (layer package) mas manifiesto `model-package.json`; libreria declarada `mesh-llm` |
| Numero de capas | 30 |
| Tamano del repositorio | 19,4 GB |
| Fichero fuente | `gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf` |
| Revision fuente | `unsloth/gemma-4-26B-A4B-it-qat-GGUF@7b92b5b28818151e8669af2e45e88d6086f490dd` |
| SHA-256 del fuente | `a7c5bc715f5ff8e99a3e8901ce7d2b42b402c669bf24f7c5250747633d0f5891` |
| SHA-256 del manifiesto | `a6a10ae900f883a3e2b7a7ccaeebf6a142984c8f18404583599f22dd96dcc78a` |
| Ancho de activacion | not recorded |
| Skippy ABI | not recorded |
| Pipeline | image-text-to-text |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico verificable es que se trata de un derivado de la familia Gemma a escala 26B-A4B, empaquetado a partir de la cuantizacion `UD-Q4_K_XL` de Unsloth, que a su vez procede de un modelo con quantisation-aware training (el sufijo `-qat`). El paquete conserva la distribucion GGUF original pero la trocea en artefactos por capa: la model card indica 30 capas y un fichero fuente unico (`gemma-4-26B-A4B-it-qat-UD-Q4_K_XL.gguf`) del que se genera el manifiesto y los artefactos de capa mediante la herramienta `skippy-model-package write-package` del proyecto mesh-llm.

No hay datos sobre numero de tokens de entrenamiento, composicion del dataset, fases de RLHF o DPO, ni innovaciones tecnicas de decodificacion. La innovacion relevante de este repositorio es de infraestructura, no de modelado: el formato layer-package permite repartir capas entre pares de una malla local, de modo que varias maquinas suman memoria y computo para servir un modelo que no cabe en un solo equipo. La generacion del paquete se realizo con Mesh LLM HF Jobs a partir de la referencia `f932c4d1dc12b3e3a670d5f470cedd5cdcc5db39`, con checksum calculado y verificado artefacto a artefacto.

## Capacidades

- Generacion de texto conversacional: la model card declara la etiqueta `conversational` y el modelo base es una variante `-it` (instruction tuned).
- Entrada multimodal de imagen y texto: la pipeline declarada es `image-text-to-text`, por lo que acepta imagenes junto a instrucciones en lenguaje natural.
- Servicio compatible con OpenAI: expone `/v1/chat/completions` y `/v1/models` a traves del servidor local de Mesh LLM, con lo que se puede usar con clientes y SDK que ya hablan el protocolo de OpenAI.
- Inferencia distribuida: las capas se reparten entre varias maquinas con `mesh-llm serve --model ... --split`.
- Ejecucion local y privada: todo el computo ocurre en el hardware del usuario, sin llamadas a servicios externos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (el campo de idiomas aparece vacio en HuggingFace).
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia privada en hardware propio: el paquete permite servir un modelo multimodal de escala 26B sin salida de datos a terceros, adecuado para entornos con requisitos de confidencialidad o redes air-gapped. La licencia Apache 2.0 facilita su uso interno sin negociacion adicional.
- Despliegue agregado cuando el modelo no cabe en un solo host: con 19,4 GB de pesos en Q4 y necesidad de espacio adicional para cache KV, un equipo con poca VRAM puede combinarse con otro mediante `mesh-llm serve --split`, repartiendo las 30 capas entre nodos de la misma red local.
- Sustitucion de la API de OpenAI en desarrollo: al exponer `/v1/chat/completions` en `http://localhost:3131`, se puede apuntar una aplicacion existente al endpoint local cambiando unicamente la URL base y el nombre del modelo (`unsloth/gemma-4-26B-A4B-it-qat-GGUF:UD-Q4_K_XL`), lo que simplifica pruebas de regresion y prototipado sin coste por token.
- Procesamiento de imagenes con instrucciones en texto: dada la pipeline `image-text-to-text`, sirve para tareas como descripcion de capturas de pantalla, extraccion de informacion de documentos escaneados o asistencia sobre diagramas, siempre que se valide previamente la calidad real del modelo subyacente.
- Laboratorio de sistemas distribuidos: el formato layer-package y el manifiesto con checksums permiten estudiar experimentalmente el reparto de capas, el balanceo de carga entre nodos y el impacto de la red en la latencia de generacion.
- Asistentes conversacionales internos multi-turno: la etiqueta `conversational` del modelo base habilita su uso en chats de soporte interno, documentacion tecnica o ayuda al desarrollador, siempre con verificacion humana de las respuestas.
- Preprocesado por lotes de contenido visual y textual en una organizacion: clasificacion o resumen de material mixto (imagen mas texto) ejecutado en local, evitando el envio de datos sensibles a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y remite al repositorio de Unsloth para las notas de rendimiento. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: los resultados obtenidos tratan sobre el desbloqueo de telefonos Samsung y no aportan informacion tecnica alguna. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: partiendo de los 19,4 GB del repositorio y de una cuantizacion Q4_K_XL de un modelo de escala 26B, se puede estimar un minimo de 16-20 GB de memoria para pesos, mas la cache KV y el codificador de vision. Es una estimacion propia, no un dato publicado.
- GPU recomendadas: en un unico nodo, tarjetas con 24 GB o mas (RTX 3090, RTX 4090, L40S, A100 40/80 GB, H100). El modo distribuido esta pensado precisamente para nodos que no alcanzan ese umbral por separado.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090 y RTX 4090 (24 GB) con cuantizacion Q4_K_XL y contexto moderado; en tarjetas de 12-16 GB probablemente no quepa el modelo completo en un solo host y habria que recurrir al reparto por capas.
- Opciones de despliegue: cliente oficial `mesh-llm` con `mesh-llm serve --model ... --split`. Al ser GGUF, el fichero fuente subyacente es compatible con el ecosistema llama.cpp, si bien este paquete concreto esta troceado por capas y requiere la herramienta de Mesh LLM o `skippy-model-package` para reconstruirlo o consumirlo.
- vLLM, TGI y Ollama: no disponibles para este formato de paquete; no hay evidencia en la documentacion de compatibilidad con esos servidores.
- Latencia y throughput: no disponibles. En un despliegue repartido, la latencia dependera fuertemente de la red local entre nodos, ya que cada token requiere comunicacion entre las maquinas que alojan capas consecutivas.

## Comparativa con modelos similares

No hay datos suficientes para comparar con otros modelos por parametros, contexto o benchmarks, ya que la model card no publica esas cifras. La comparacion relevante es entre formatos de distribucion del mismo modelo:

| Aspecto | Este paquete (mesh-llm layer package) | GGUF upstream de Unsloth (un solo fichero) | Conversion GGUF propia |
|---|---|---|---|
| Formato | GGUF troceado por capas mas manifiesto `model-package.json` | GGUF monolitico | GGUF monolitico |
| Tamano del repositorio | 19,4 GB | no disponible en esta informacion | depende de la cuantizacion elegida |
| Reparto entre maquinas | Si, nativo mediante malla local | No, requiere un solo host | No, requiere un solo host |
| API compatible con OpenAI | Si, via Mesh LLM en el puerto 3131 | Depende del servidor elegido | Depende del servidor elegido |
| Herramienta requerida | `mesh-llm` / `skippy-model-package` | llama.cpp u otro runtime GGUF | llama.cpp u otro runtime GGUF |
| Licencia | apache-2.0 | apache-2.0 (heredada) | la del modelo original |
| Verificacion de integridad | SHA-256 de fuente y de manifiesto publicados | no disponible | no disponible |

Frente a otros modelos de la misma categoria (por ejemplo, alternativas densas o MoE de tamano comparable), no se dispone de informacion verificable, por lo que la comparativa se declara no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no incluye ninguna seccion de sesgos ni evaluaciones de seguridad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Al tratarse de un modelo de lenguaje sin datos de evaluacion publicados en este repositorio, hay que asumir riesgo de respuestas incorrectas y validarlas en produccion.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada y el campo de idiomas aparece vacio en HuggingFace, por lo que no se puede afirmar soporte de castellano ni de ningun otro idioma sin probarlo.
- Restricciones de licencia: la licencia declarada es Apache 2.0, heredada del modelo base `unsloth/gemma-4-26B-A4B-it-qat-GGUF`. Conviene verificar los terminos de la licencia original de Gemma en el repositorio de Unsloth y de Google antes de un uso comercial, ya que las licencias de la familia Gemma suelen incluir condiciones de uso aceptable adicionales.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, y fue publicado el 12 de septiembre de 2026, por lo que no existe validacion de la comunidad ni informes independientes de funcionamiento.
- Discrepancias en los metadatos: la model card indica un tamano de paquete de 0 B y la tabla de artefactos solo lista el manifiesto, mientras que el repositorio ocupa 19,4 GB y los metadatos safetensors declaran 814.095.233 parametros. Estos datos no son coherentes con una escala de 26B y deben tratarse con cautela.
- Dependencia de herramienta propietaria del ecosistema: el consumo del paquete depende de `mesh-llm` y del formato layer-package, cuyo ABI (`Skippy ABI`) aparece como "not recorded". Esto añade riesgo de compatibilidad entre versiones.
- Despliegue distribuido: el reparto de capas entre nodos introduce dependencia de la red local; una red lenta o inestable degradara gravemente la latencia de generacion y puede provocar fallos en mitad de una respuesta.
- Capacidades no verificadas: no hay evidencia en la informacion proporcionada sobre tool calling, uso como agente, modo de razonamiento explicito ni calidad real de la entrada de imagen.

## Enlaces

- Repositorio del paquete en HuggingFace: https://huggingface.co/meshllm/gemma-4-26B-A4B-it-qat-UD-Q4_K_XL-layers
- Modelo base (GGUF de Unsloth): https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-GGUF
- Sitio web de Mesh LLM: https://www.meshllm.cloud
- Repositorio de Mesh LLM en GitHub: https://github.com/Mesh-LLM/mesh-llm
- Especificacion del formato de paquetes por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord de Mesh LLM: https://discord.gg/rs6fmc63eN
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados disponibles tratan sobre desbloqueo de dispositivos Samsung y no guardan relacion con esta ficha.
