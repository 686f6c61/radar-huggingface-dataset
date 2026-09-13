# meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-layers

## Resumen

Este repositorio no contiene un modelo entrenado de nuevo, sino un paquete de capas en formato GGUF derivado de `unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF`. Lo publica `meshllm`, el equipo detrás de Mesh LLM, y su función es trocear la distribucion GGUF original (cuantizacion `UD-Q4_K_XL`) en artefactos por capa para poder ejecutar el modelo repartiendo capas entre varias maquinas de un cluster local. El modelo subyacente pertenece a la familia NVIDIA Nemotron 3, con escala de parametros 120B-A12B, es decir, una arquitectura de mezcla de expertos con 120.000 millones de parametros totales y 12.000 millones activos por token.

El problema que resuelve es de despliegue, no de calidad: un GGUF de 120B en Q4 ronda los 84,5 GB, un tamano que no cabe en la VRAM de una GPU de consumo ni en muchas configuraciones de servidor de una sola maquina. Al dividir el modelo en 88 capas y servirlo con el runtime `mesh-llm`, el paquete permite agregar memoria y computo de varios hosts y exponer una API compatible con OpenAI (`/v1/chat/completions`) en `localhost:3131`, manteniendo la inferencia en hardware propio.

Es relevante ahora porque la inferencia distribuida de modelos abiertos grandes en clusters caseros o de laboratorio se esta consolidando como alternativa a depender de APIs externas por privacidad y coste. Conviene subrayar que este repositorio es un artefacto de empaquetado: no aporta datos de arquitectura, entrenamiento, benchmarks ni idiomas propios, y remite al modelo fuente para todo ello.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo fuente de tipo MoE segun la nomenclatura 120B-A12B; no se detalla en la model card) |
| Parametros totales | 120B segun la nomenclatura del modelo fuente (120B-A12B). El contador de safetensors del repo indica 109.640.064, cifra que no representa el modelo completo al tratarse de un paquete de capas |
| Parametros activos | 12B (segun la nomenclatura A12B del modelo fuente) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (unica variante publicada en este repo) |
| Idiomas soportados | No disponible |
| Licencia | `other` (heredada de `unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF`) |
| Formato de pesos | GGUF, empaquetado como layer package (artefactos por capa) mas manifiesto `model-package.json` |
| Numero de capas | 88 |
| Tamano del repositorio | 84,5 GB |
| Fichero fuente | `UD-Q4_K_XL/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-00001-of-00003.gguf` |
| Revision del fuente | `036038fb30334a2d56a146c6f0d4871ab5edccbb` |
| SHA-256 del fuente | `f22083eb6b15acb52905308ab083e8b0cc38897005cc45e8881abd164580aac2` |
| SHA-256 del manifiesto | `61e345feb4d3b4b435ae040bb94c6da9f8a05d94f54cbbdaf5bc7d7b2e781b60` |
| Runtime | `mesh-llm` (libreria declarada), con endpoint compatible con OpenAI |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El paquete no implica entrenamiento alguno: `meshllm` no ha ajustado ni destilado el modelo. Lo que hace es tomar el GGUF cuantizado del repositorio de Unsloth y aplicar un proceso de troceado por capas mediante la herramienta `skippy-model-package write-package`, generando artefactos independientes con checksum SHA-256 calculado y verificado durante la escritura. El trabajo se ejecuto desde el ref `f932c4d1dc12b3e3a670d5f470cedd5cdcc5db39` de `mesh-llm` sobre HF Jobs, y cada artefacto se elimino del espacio de trabajo antes de producir el siguiente.

La innovacion tecnica es, por tanto, de formato y de ejecucion: el layer package convierte un unico fichero GGUF en una unidad distribuible que un cluster puede repartir por peers, con el campo `Skippy ABI` como identificador de compatibilidad binaria (marcado como `not recorded` en este paquete). Sobre el modelo de origen, la model card no documenta numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO; la unica informacion disponible es su pertenencia a la familia NVIDIA Nemotron 3 con escala 120B-A12B y la cuantizacion dinamica de Unsloth (`UD-Q4_K_XL`).

## Capacidades

- Generacion de texto conversacional: la pipeline declarada es `text-generation` y el tag `conversational` esta presente en el repositorio.
- Servicio mediante API compatible con OpenAI: expone `/v1/chat/completions` y `/v1/models` a traves del runtime Mesh LLM en el puerto local 3131.
- Inferencia distribuida: reparto de las 88 capas entre varios nodos con el flag `--split`.
- Despliegue local y privado: el modelo se ejecuta en hardware propio del usuario, sin salida de datos a terceros.
- Integracion con el ecosistema GGUF: al derivar de un GGUF de Unsloth, es compatible con el formato estandar de llama.cpp, aunque el paquete por capas requiere el runtime `mesh-llm`.
- Tool calling, function calling, agentes, vision, audio, modo de razonamiento explicito, capacidades multilingues y cualquier otra capacidad especial del modelo fuente: no disponibles en la informacion proporcionada. Deben consultarse en la model card de `unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF`.

## Casos de uso

- Inferencia privada en laboratorio: un grupo de investigacion con varias estaciones de trabajo puede repartir las 88 capas del modelo y ejecutarlo sin enviar prompts ni datos sensibles a una API externa, usando `mesh-llm serve --model ... --split` en cada maquina.
- Servicio interno compatible con OpenAI: al exponer `/v1/chat/completions`, el modelo se puede conectar como backend de aplicaciones ya escritas contra la API de OpenAI cambiando unicamente la URL base, lo que reduce el trabajo de integracion en herramientas internas de soporte o documentacion.
- Aprovechamiento de hardware heterogeneo y ya amortizado: un cluster con varias GPU de 24 GB puede sumar memoria para alojar un modelo que no cabe en ninguna de ellas por separado, en lugar de adquirir una GPU de 80 GB.
- Experimentacion con modelos de escala 120B: permite a equipos sin acceso a nodos de datacenter estudiar el comportamiento de un MoE grande y comparar sus respuestas con las de modelos mas pequenos que si caben en una sola GPU.
- Procesamiento por lotes nocturno: tareas de resumen, clasificacion o generacion de texto de baja prioridad pueden lanzarse contra el endpoint local aprovechando las horas valle del cluster.
- Reproducibilidad y auditoria: los SHA-256 del fichero fuente, del manifiesto y de cada artefacto permiten verificar que el paquete desplegado corresponde exactamente a la revision declarada del GGUF de Unsloth.
- Pruebas de concepto de orquestacion distribuida: sirve como banco de pruebas para evaluar como se comporta la latencia de red al partir un transformer por capas, antes de adoptar el esquema en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este paquete no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y remite explicitamente al modelo fuente para las notas de benchmarks. Tampoco se proporcionan mediciones de latencia, throughput (tokens por segundo) ni escalado con el numero de nodos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 84,5 GB solo para los pesos en `UD-Q4_K_XL`, mas el espacio adicional de cache KV y overhead del runtime. Presupuestar del orden de 90-100 GB de VRAM agregada para una ventana de contexto moderada; la cifra exacta depende del contexto y no esta documentada.
- No cabe en una unica GPU de consumo. Ni una RTX 4090 (24 GB) ni una RTX 5090 podrian alojarlo completas.
- Configuraciones viables: 2 x H100 80 GB o 2 x A100 80 GB en un solo host; 4 x RTX 4090 (96 GB agregados) o 4 x RTX 3090 repartidas entre varias maquinas con `mesh-llm`.
- Modo de despliegue recomendado por el autor: `mesh-llm serve --model "meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-layers" --split`, ejecutado en cada maquina que aporte memoria o computo al mesh.
- Alternativas de despliegue: el GGUF monolitico de `unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF` puede usarse con llama.cpp u Ollama, aunque en ese caso se pierde el reparto por capas. Soporte en vLLM o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. Como advertencia general, la inferencia por capas anade latencia de red entre nodos en cada token generado, por lo que el rendimiento dependera fuertemente de la interconexion (Ethernet frente a InfiniBand o enlaces directos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-layers` | 120B-A12B (nomenclatura del fuente) | No disponible | UD-Q4_K_XL, por capas | `other` | Publicado, 0 descargas, requiere runtime `mesh-llm` |
| `unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF` | 120B-A12B | No disponible | UD-Q4_K_XL y otras variantes | `other` | Publicado, GGUF monolitico, compatible con llama.cpp |
| Otras alternativas de escala similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo fuente, unico del que se dispone de informacion verificable. No se dispone de datos de rendimiento que permitan contrastar este paquete con otros modelos de parametros comparables.

## Limitaciones y advertencias

- Licencia `other`: no es una licencia abierta estandar. Antes de cualquier uso comercial es obligatorio revisar los terminos del modelo fuente (`unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF`), que son los que se heredan y que la model card no reproduce.
- Dependencia de un runtime concreto: el paquete esta pensado para `mesh-llm`. Sin ese runtime no es utilizable directamente, a diferencia del GGUF monolitico del que deriva.
- Ausencia total de datos de calidad: no hay benchmarks, evaluaciones ni comparativas publicadas para este paquete. Cualquier estimacion de rendimiento es extrapolacion.
- Idiomas: no se declara ninguna lista de idiomas soportados, por lo que no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas distintos del ingles sin validacion previa.
- Riesgo de alucinacion: inherente a los modelos generativos de este tipo. Al no haber evaluacion publicada, no se puede acotar su magnitud; se recomienda validacion humana en cualquier flujo critico.
- Sesgos: no documentados en la informacion disponible, pero el modelo no incluye ninguna declaracion de mitigacion ni auditoria de sesgos accesible desde este repositorio.
- Metadatos incompletos en el propio paquete: `Activation width`, `Package size` (0 B) y `Skippy ABI` aparecen como `not recorded`, lo que limita la verificacion automatica de compatibilidad.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que permita anticipar problemas en produccion.
- Sobrecoste de red: en despliegues multi-maquina, la latencia entre nodos se suma a cada token. En topologias con red lenta, el rendimiento puede degradarse de forma severa.
- El contador de parametros reportado por HuggingFace para el repositorio (109.640.064) no debe interpretarse como el tamano del modelo; corresponde a los artefactos del paquete, no a los pesos completos.

## Enlaces

- Repositorio del paquete: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-layers
- Modelo fuente (GGUF de Unsloth): https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF
- Sitio web de Mesh LLM: https://www.meshllm.cloud
- Repositorio de Mesh LLM en GitHub: https://github.com/Mesh-LLM/mesh-llm
- Especificacion del formato layer package: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord de Mesh LLM: https://discord.gg/rs6fmc63eN

Nota: los resultados de busqueda web disponibles no contienen informacion relacionada con este modelo (corresponden a cobertura electoral de medios estadounidenses), por lo que no se han podido incorporar papers, blogs tecnicos ni demos adicionales.
