# meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-layers

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de capas en formato GGUF derivado de `unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF`, concretamente de la cuantización `UD-Q4_K_XL`. Lo publica `meshllm` para su uso con Mesh LLM, un runtime de inferencia distribuida que reparte las capas del modelo entre varias máquinas de una red local y expone una API compatible con OpenAI. El modelo subyacente pertenece a la familia NVIDIA Nemotron 3 en su variante Super 120B-A12B, es decir, una arquitectura MoE con aproximadamente 120 mil millones de parámetros totales y 12 mil millones activos por token.

La relevancia de este artefacto es práctica: el GGUF original ocupa unos 84,5 GB, lo que impide cargarlo en una sola GPU de consumo, y el paquete de capas permite distribuirlo entre varios hosts sin necesidad de hardware de centro de datos. El repositorio incluye un manifiesto (`model-package.json`) con identidad de origen, checksums SHA-256 y una referencia canónica al fichero GGUF fuente, lo que facilita la verificación de integridad en despliegues reproducibles.

Conviene subrayar que los metadatos del propio repo son incompletos: la tarjeta del autor delega explícitamente los detalles de arquitectura, plantilla de chat, muestreo, licencia y benchmarks a la model card del modelo fuente, y varios campos internos aparecen como "not recorded". Esta ficha distingue en todo momento entre lo que aporta el paquete y lo que corresponde al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) del modelo base NVIDIA Nemotron 3 Super; detalles finos no disponibles en la informacion proporcionada |
| Parametros totales | 120B (escala 120B-A12B segun la model card); el campo safetensors del repo indica 109.640.064, cifra no coherente con la escala declarada y probablemente referida a un subconjunto o metadato parcial |
| Parametros activos | 12B (denominacion A12B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada de `unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF`); terminos concretos no disponibles en la informacion proporcionada |
| Formato de pesos | GGUF fragmentado en artefactos por capa, mas manifiesto `model-package.json`; 88 capas declaradas |
| Tamano del repositorio | 84,5 GB |
| Runtime | mesh-llm (libreria declarada), API compatible con OpenAI |
| Revision fuente | `036038fb30334a2d56a146c6f0d4871ab5edccbb` |
| SHA-256 del GGUF fuente | `f22083eb6b15acb52905308ab083e8b0cc38897005cc45e8881abd164580aac2` |
| SHA-256 del manifiesto | `61e345feb4d3b4b435ae040bb94c6da9f8a05d94f54cbbdaf5bc7d7b2e781b60` |
| ABI de Skippy | no registrado |
| Descargas / likes | 510 / 0 |

## Arquitectura y entrenamiento

El paquete no documenta arquitectura ni entrenamiento propios: es una reempaquetación determinista de un GGUF ya cuantizado. El proceso lo describe el autor como una ejecucion del splitter de HF Jobs de Mesh LLM (ref `f932c4d1dc12b3e3a670d5f470cedd5cdcc5db39`), que escribe cada artefacto, calcula su checksum, lo sube al repositorio y lo elimina del espacio de trabajo antes de generar el siguiente. El resultado conserva la distribucion original del GGUF, dividida en artefactos por capa para permitir inferencia distribuida.

Del modelo base solo se dispone de la denominacion 120B-A12B, que implica una topologia de mezcla de expertos con activacion dispersa, y del nombre de la cuantizacion `UD-Q4_K_XL`, una variante de 4 bits de la familia Unsloth Dynamic. No hay en la informacion proporcionada datos sobre numero de tokens de entrenamiento, composicion del dataset, fases de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Cualquier afirmacion al respecto requeriria consultar la model card del modelo fuente.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` aparece en los metadatos del repo.
- Servicio mediante API compatible con OpenAI: expone `/v1/chat/completions` y `/v1/models` a traves del runtime Mesh LLM en el puerto 3131.
- Inferencia local y privada: el modelo no sale del hardware del usuario, lo que resulta adecuado para datos sensibles.
- Inferencia distribuida: las 88 capas pueden repartirse entre varios peers de la malla, permitiendo ejecutar un modelo de 120B que no cabe en un solo host.
- Descubrimiento de estado de la malla: endpoint `/api/status` para comprobar nodos y disponibilidad.
- Verificabilidad: checksums SHA-256 por artefacto y manifiesto, utiles en pipelines con requisitos de integridad.
- Capacidades especificas del modelo base (codigo, matematicas, tool calling, agentes, multilingue, modo thinking, vision): no disponibles en la informacion proporcionada; deben consultarse en la model card de `unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF`.

## Casos de uso

- Laboratorio de investigacion con varias estaciones de trabajo: desplegar `mesh-llm serve --model ... --split` en cada maquina y agregar la VRAM disponible para servir un modelo de 120B que no cabe en una sola GPU, manteniendo los pesos en la red local.
- Prototipado de asistentes conversacionales privados: usar el endpoint compatible con OpenAI para integrar el modelo en aplicaciones existentes sin reescribir el cliente, con la ventaja de que ninguna peticion abandona la infraestructura propia.
- Evaluacion de modelos grandes en entornos con presupuesto limitado: en lugar de alquilar instancias multi-GPU en la nube, repartir las capas entre equipos ya disponibles y medir calidad y latencia reales sobre el caso de uso concreto.
- Sustitucion de API de terceros en desarrollo: apuntar el SDK de OpenAI al puerto 3131 del nodo Mesh LLM para pruebas de integracion, sin coste por token y con control total sobre la version del modelo.
- Procesamiento de datos confidenciales: clasificacion, resumen o redaccion asistida sobre documentacion interna en un cluster local, aprovechando la naturaleza privada de la inferencia.
- Reproducibilidad y auditoria: fijar la revision `036038fb...` y verificar los SHA-256 del GGUF y del manifiesto antes de desplegar, lo que permite demostrar que el binario servido corresponde exactamente al artefacto auditado.
- Formacion y demostraciones: montar una malla temporal en un aula o taller para mostrar como se sirve un modelo de gran escala de forma distribuida con hardware heterogeneo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete remite explicitamente a la del modelo fuente para notas de rendimiento, y no incluye cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput de la malla.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 84,5 GB; en cuantizacion Q4 se necesita un total agregado de memoria en la malla del orden de esa cifra mas overhead de contexto y buffers de computo. La cifra exacta por nodo depende del reparto de capas configurado.
- No cabe en una GPU de consumo individual: 84,5 GB supera la VRAM de cualquier tarjeta consumer actual (24 GB en RTX 4090, 32 GB en RTX 5090).
- GPU recomendadas por nodo: RTX 4090 o RTX 5090 para nodos de consumo; A100 40/80 GB o H100 para nodos de centro de datos. La malla puede mezclar clases de hardware.
- Opciones de despliegue: `mesh-llm serve` con la opcion `--split` en cada maquina contribuyente, mas consulta de estado en `http://localhost:3131/api/status`. El paquete esta pensado para mesh-llm; no se documenta su uso con vLLM, llama.cpp u Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles. Al ser inferencia distribuida por capas, la latencia dependera fuertemente de la red entre peers; se recomienda Ethernet conmutada de baja latencia o interconexion dedicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-layers | 120B totales / 12B activos | no disponible | GGUF por capas + manifiesto | other | Paquete para inferencia distribuida con Mesh LLM |
| unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF | 120B totales / 12B activos | no disponible | GGUF (3 ficheros) | other | Modelo fuente; requiere un unico host con memoria suficiente |
| NVIDIA Nemotron 3 Super (pesos originales) | 120B totales / 12B activos | no disponible | no disponible | no disponible | Referencia upstream; datos no disponibles en esta busqueda |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de la misma categoria; la comparativa se limita a formato, tamano y licencia.

## Limitaciones y advertencias

- El repositorio es un artefacto de empaquetado, no un modelo autonomo: sin el runtime Mesh LLM no es utilizable de forma directa.
- Los metadatos internos son incompletos: "activation width", "Skippy ABI" y "package size" aparecen como no registrados o con valor 0, lo que puede confundir a herramientas automaticas que los lean.
- El campo safetensors del repo (109.640.064) no concuerda con la escala 120B-A12B declarada; no debe usarse para estimar requisitos de memoria.
- La licencia es `other` y los terminos concretos no se detallan en este repo. Antes de cualquier uso comercial es obligatorio revisar la licencia del modelo fuente en `unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF` y, en su caso, los terminos de NVIDIA.
- No hay informacion sobre sesgos, riesgo de alucinacion ni calidad multilingue en la informacion proporcionada; deben evaluarse sobre el modelo base.
- La cuantizacion a 4 bits introduce perdida de calidad respecto a los pesos originales; no se han publicado mediciones de esa degradacion para esta variante.
- La inferencia distribuida por capas anade dependencia de la red: caidas de nodos o latencias altas degradan el servicio de forma directa, y no se documenta mecanismo de tolerancia a fallos.
- Al haberse creado en septiembre de 2026 y con solo 510 descargas, la validacion comunitaria es escasa.

## Enlaces

- Repositorio del paquete: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Super-120B-A12B-UD-Q4_K_XL-layers
- Modelo fuente (GGUF): https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Super-120B-A12B-GGUF
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio GitHub de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Especificacion del formato de paquetes por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord: https://discord.gg/rs6fmc63eN
