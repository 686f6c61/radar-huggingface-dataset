# meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-Q4_K_XL-layers

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de inferencia distribuida en formato GGUF por capas para el modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B, en su cuantizacion UD-Q4_K_XL. Lo publica la organizacion meshllm como artefacto derivado del GGUF original de unsloth, y su proposito es permitir que un clúster local de varias maquinas ejecute el modelo repartiendo sus 53 capas entre pares mediante la herramienta Mesh LLM, que expone una API compatible con OpenAI en `/v1/chat/completions`.

El modelo subyacente pertenece a la familia Nemotron de NVIDIA y sigue un esquema de tipo MoE con 30B de parametros totales y 3B activos por token (denominacion 30B-A3B). El paquete conserva la licencia `other` heredada del modelo fuente y no documenta por si mismo la arquitectura interna, los datos de entrenamiento ni los benchmarks: toda esa informacion remite a la model card de unsloth.

Su relevancia practica es de infraestructura mas que de modelado: ofrece una via para servir un modelo de 30B en hardware modesto sumando memoria y computo de varios equipos, con checksums SHA-256 por artefacto y un manifiesto de paquete verificable. Es util para quien quiera inferencia privada sin GPU de gran capacidad, pero no debe confundirse con una publicacion de pesos nuevos ni con una evaluacion del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia NVIDIA Nemotron, esquema MoE 30B-A3B segun denominacion; detalles en la model card de unsloth) |
| Parametros totales | 30B segun denominacion del modelo base; el campo safetensors del repo indica 38.744.896 (corresponde a artefactos del paquete, no al modelo completo) |
| Parametros activos | 3B (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (unica variante incluida) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF) |
| Formato de pesos | GGUF, dividido en artefactos por capa (layer package) con manifiesto `model-package.json` |
| Numero de capas | 53 |
| Tamano del repo | 25,9 GB |
| Libreria | mesh-llm |
| Modelo base | unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF (revision f2d3fe3694501008786e81e5f20360cbf715496a) |
| SHA-256 del GGUF fuente | 112bf957489a497c18f60bf8bd44ee1dfa05e87368b8ed7f68998a4e38f275c9 |
| SHA-256 del manifiesto | 634ab8c3a4ada0b8627a430d9dafb5aeb8b7b29f0ceb2b6284e5bed50e124183 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion de este repositorio: la model card remite explicitamente a unsloth para detalles de arquitectura, plantilla de chat, recomendaciones de muestreo, terminos de licencia y notas de benchmarks. Lo unico verificable aqui es que el modelo sigue el esquema 30B-A3B, propio de mezclas de expertos con aproximadamente 3B de parametros activos por token, y que la distribucion consta de 53 capas.

Tampoco hay datos sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO. El paquete en si no introduce entrenamiento alguno: es un artefacto de empaquetado generado por el splitter de HF Jobs de Mesh LLM (ref `f932c4d1dc12b3e3a670d5f470cedd5cdcc5db39`), que trocea el GGUF original en artefactos por capa, calcula checksums durante la escritura y los elimina del espacio de trabajo antes de producir el siguiente. La innovacion tecnica relevante es, por tanto, el formato de paquete por capas con ABI `skippy` (no registrada en este repo) y la capacidad de repartir capas entre nodos.

## Capacidades

- Generacion de texto conversacional, segun el pipeline declarado `text-generation` y el tag `conversational`.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions` y `/v1/models`) a traves de Mesh LLM.
- Inferencia distribuida: reparto de las 53 capas entre varios nodos del clúster local.
- Inferencia privada en hardware propio, sin salida de datos a servicios externos.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling o modo thinking: no disponibles en la informacion proporcionada (deben consultarse en la model card del modelo base).
- Soporte multilingue: no disponible.

## Casos de uso

- Servicio de chat privado en oficina o laboratorio: se despliega `mesh-llm serve --model ... --split` en cada maquina del clúster y se consume el endpoint compatible con OpenAI, manteniendo las conversaciones dentro de la red local.
- Sustitucion de una API en la nube en prototipos: al exponer `/v1/chat/completions`, las aplicaciones existentes que apuntan a OpenAI solo necesitan cambiar la URL base y el nombre del modelo, sin reescribir el cliente.
- Inferencia cuando el GGUF completo no cabe en un solo host: el paquete reparte las 53 capas entre pares, de modo que la memoria agregada del clúster cubre el modelo aunque ningun equipo individual pueda.
- Aprovechamiento de hardware heterogeneo: maquinas con distintas capacidades pueden aportar memoria y computo al mismo mesh, lo que encaja en entornos con estaciones de trabajo dispares.
- Entornos con requisitos de residencia de datos: al no depender de servicios externos, es adecuado para prototipos sobre datos que no pueden salir de la organizacion.
- Evaluacion y pruebas de integracion de pipelines de agentes o asistentes antes de comprometerse con una GPU dedicada, usando el mesh como backend temporal compatible con OpenAI.
- Verificacion de integridad en despliegues: los checksums SHA-256 del manifiesto y del GGUF fuente permiten validar que el paquete desplegado corresponde exactamente a la revision declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la del modelo base (unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF) para las notas de rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Como referencia de orden de magnitud, el repositorio ocupa 25,9 GB en cuantizacion UD-Q4_K_XL, por lo que la memoria agregada necesaria en el mesh sera del orden de esa cifra mas overhead de ejecucion; no se documenta el reparto exacto por nodo.
- GPU recomendadas: no disponibles. El diseno esta pensado precisamente para no requerir una unica GPU de gran capacidad.
- Viabilidad en GPU de consumo: no confirmada en la documentacion; el enfoque del paquete es agregar memoria de varias maquinas en lugar de depender de una sola.
- Opciones de despliegue: Mesh LLM (`mesh-llm serve`), con API compatible con OpenAI en el puerto 3131 por defecto. Otros runners (llama.cpp, vLLM, Ollama, TGI) no se documentan para este paquete por capas; para ellos habria que usar el GGUF original de unsloth.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-Q4_K_XL-layers | 30B totales, 3B activos | no disponible | GGUF por capas | other | Inferencia distribuida en clúster local |
| unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF | 30B totales, 3B activos | no disponible | GGUF monolítico | other | Inferencia local en un solo host |
| Modelos MoE de escala similar (p. ej. variantes 30B-A3B de otras familias) | ~30B totales, ~3B activos | no disponible | safetensors, GGUF | variable | Inferencia local o en servidor |

La comparacion con alternativas de otras familias no puede completarse con datos verificados en la informacion disponible; las diferencias medibles entre este paquete y el GGUF de unsloth son de empaquetado y despliegue, no de pesos ni de calidad.

## Limitaciones y advertencias

- El repositorio no es un modelo autonomo: sin el runtime Mesh LLM y el manifiesto correctamente resuelto, los artefactos por capa no son utilizables directamente en llama.cpp, Ollama u otros runners convencionales.
- La licencia `other` heredada del modelo base puede imponer restricciones al uso comercial; es obligatorio revisar los terminos de unsloth y de NVIDIA antes de desplegar en produccion.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento multilingue en esta model card; deben evaluarse a partir de la documentacion del modelo base y de pruebas propias.
- La latencia en inferencia distribuida depende de la red entre nodos y puede degradarse notablemente frente a una ejecucion en un solo host.
- El campo de parametros del repo (38.744.896) no refleja el tamano real del modelo y no debe usarse como referencia de escala.
- La ABI `skippy` aparece como "not recorded", lo que puede afectar a la compatibilidad con versiones concretas del runtime.
- La cuantizacion UD-Q4_K_XL implica perdida de precision respecto a los pesos originales; no se documenta su impacto en calidad.
- El repositorio registra 0 likes y un unico mantenedor, sin senales de validacion independiente.

## Enlaces

- Repositorio del paquete: https://huggingface.co/meshllm/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-UD-Q4_K_XL-layers
- Modelo base (GGUF): https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Especificacion del formato de paquete por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord: https://discord.gg/rs6fmc63eN
