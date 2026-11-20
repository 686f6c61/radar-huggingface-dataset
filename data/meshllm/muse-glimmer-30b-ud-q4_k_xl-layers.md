# meshllm/Muse-Glimmer-30B-UD-Q4_K_XL-layers

## Resumen

Muse-Glimmer-30B-UD-Q4_K_XL-layers es un paquete de inferencia distribuida en formato GGUF publicado por meshllm a partir del modelo Muse-Glimmer-30B de la familia Muse, en su cuantizacion UD-Q4_K_XL generada por Unsloth. No se trata de un modelo nuevo entrenado desde cero, sino de una redistribucion del GGUF original troceado en artefactos por capas para poder ejecutarlo repartido entre varias maquinas mediante Mesh LLM, un runtime de inferencia local que expone una API compatible con OpenAI.

El paquete esta pensado para escenarios en los que el GGUF completo no cabe en un solo host: cada maquina del cluster aporta memoria y computo, y Mesh LLM reparte las 52 capas del modelo entre los peers. El modelo subyacente es multimodal (pipeline image-text-to-text) y tiene una escala nominal de 30B parametros, aunque la model card del paquete no documenta la arquitectura interna, la longitud de contexto ni los datos de entrenamiento.

La relevancia actual es practica: permite servir un modelo de 30B en cuantizacion Q4 en hardware distribuido de consumo, con API local compatible con OpenAI, sin depender de proveedores externos. La licencia declarada es Apache 2.0, heredada del modelo base. Conviene tener en cuenta que la model card es fundamentalmente un manifiesto de empaquetado y remite al modelo original para detalles de arquitectura y benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Muse; transformer multimodal segun pipeline image-text-to-text, sin detalle en la model card) |
| Parametros totales | 30B (escala nominal del modelo base); el campo safetensors del repo indica 483.944.704, dato que no corresponde al modelo completo y debe interpretarse con cautela |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (unica variante empaquetada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de unsloth/Muse-Glimmer-30B-GGUF) |
| Formato de pesos | GGUF troceado en artefactos por capa (layer package), con manifiesto `model-package.json` |
| Numero de capas | 52 |
| Tamano del repo | 23,9 GB |
| Libreria de ejecucion | mesh-llm |
| Modelo base | unsloth/Muse-Glimmer-30B-GGUF |
| Revision del modelo base | faa5b025c584459c13febfa5c59883516710ae39 |

## Arquitectura y entrenamiento

La model card del paquete no describe la arquitectura del modelo subyacente: no se indica si es un transformer denso, un MoE o una arquitectura hibrida, ni se detallan el numero de tokens de entrenamiento, la composicion del dataset o si hubo fases de RLHF o DPO. Lo unico documentado a nivel estructural es el numero de capas (52) y el pipeline multimodal image-text-to-text, que implica soporte de entrada de imagen y texto. Para cualquier detalle de arquitectura, plantilla de chat, recomendaciones de muestreo y notas de entrenamiento, la propia model card remite a unsloth/Muse-Glimmer-30B-GGUF.

La innovacion tecnica de este repositorio no esta en el modelo sino en el empaquetado: el GGUF original se divide en artefactos por capa con checksums SHA-256 por artefacto y un manifiesto con la identidad exacta del fichero fuente (incluido el SHA-256 del GGUF de origen, `82bece304887a313ece08400bc030f6066c7bff5b906b0cd40308ec8a409fd38`). El splitter de Mesh LLM escribe, verifica y sube cada artefacto antes de pasar al siguiente, lo que permite reconstruir y validar la integridad del paquete. El campo Skippy ABI aparece como "not recorded" en la model card.

## Capacidades

- Generacion de texto conversacional: la model card incluye ejemplos de chat completions y etiqueta el repo como "conversational".
- Entrada multimodal imagen-texto: el pipeline declarado es image-text-to-text, por lo que el modelo acepta imagenes junto con texto.
- Servicio con API compatible con OpenAI: expone `/v1/chat/completions` y `/v1/models` a traves del runtime Mesh LLM.
- Inferencia distribuida: reparto de capas entre multiples maquinas del cluster mediante `mesh-llm serve --split`.
- Inferencia local y privada: ejecucion en hardware propio sin salida de datos a terceros.
- Razonamiento, codigo, matematicas, tool calling, agentes y capacidades multilingues: no documentadas en la model card de este paquete; deben consultarse en el modelo base.

## Casos de uso

- Servicio de chat privado en cluster domestico: varias maquinas con GPU de consumo aportan memoria para servir el modelo de 30B en Q4_K_XL a traves de una unica API compatible con OpenAI, evitando costes de API externa y manteniendo los datos en la red local.
- Prototipado de aplicaciones con SDK de OpenAI: al exponer `/v1/chat/completions`, se puede apuntar el cliente oficial de OpenAI a `http://localhost:3131` y cambiar de proveedor sin reescribir codigo.
- Analisis de documentos con imagenes: gracias al pipeline image-text-to-text, el modelo puede recibir capturas, diagramas o documentos escaneados junto con instrucciones de texto para extraccion o descripcion.
- Laboratorio de investigacion en inferencia distribuida: el paquete por capas con manifiesto y checksums permite experimentar con reparto de capas, latencia entre peers y politicas de colocacion en clusters heterogeneos.
- Despliegue en entornos con restricciones de red: al no requerir conexion a servicios en la nube una vez descargado el paquete, encaja en entornos air-gapped o con requisitos de soberania de datos.
- Evaluacion comparativa de cuantizaciones: al derivar de unsloth/Muse-Glimmer-30B-GGUF, sirve para medir calidad y rendimiento del formato UD-Q4_K_XL frente a otras variantes del mismo modelo base en tareas conversacionales y multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 23,9 GB, por lo que el modelo completo en Q4_K_XL requiere del orden de 24 GB de memoria agregada entre todas las maquinas del cluster para los pesos, mas overhead de contexto y KV cache.
- Cabe en una sola GPU de 24 GB (por ejemplo, RTX 3090 o RTX 4090) de forma ajustada, aunque el proposito del paquete es el reparto entre varias maquinas.
- Reparto tipico: dos o mas hosts que sumen al menos 24-32 GB de VRAM o memoria unificada; cada peer ejecuta `mesh-llm serve --model ... --split`.
- GPUs recomendadas: no especificadas en la model card. Por tamano, A100 40/80 GB, H100, L40S o RTX 4090 son opciones razonables para servir el modelo completo en un solo nodo.
- Opciones de despliegue: runtime Mesh LLM (obligatorio para este formato de paquete por capas). El GGUF de origen puede usarse con llama.cpp u otros runtimes compatibles con GGUF, pero no con este empaquetado por capas.
- Latencia y throughput: no disponibles. Dependen del numero de peers, la interconexion de red y el reparto de capas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-UD-Q4_K_XL-layers (este) | 30B (escala nominal) | no disponible | GGUF por capas | Apache 2.0 | Inferencia distribuida multi-maquina |
| unsloth/Muse-Glimmer-30B-GGUF | 30B (escala nominal) | no disponible | GGUF unico | Apache 2.0 | Inferencia local en un solo host |
| Otros modelos de ~30B en Q4 | ~30B | no disponible | GGUF | variable | Inferencia local mononodo |

La comparativa cuantitativa con alternativas de la misma categoria no esta disponible en la informacion proporcionada: no hay datos de benchmarks ni de contexto que permitan contrastar rendimiento frente a otros modelos de 30B.

## Limitaciones y advertencias

- La model card no documenta arquitectura, contexto, idiomas ni datos de entrenamiento; cualquier decision de produccion debe basarse en la documentacion del modelo base unsloth/Muse-Glimmer-30B-GGUF.
- El campo de parametros totales en safetensors (483.944.704) no es coherente con la escala nominal de 30B y probablemente refleja solo un subconjunto de tensores; no debe usarse como cifra de parametros del modelo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en modelos generativos de esta escala y debe mitigarse con verificacion externa.
- Sesgos: no documentados en la model card.
- Idiomas: no especificados; el soporte multilingue no puede asumirse sin verificar en el modelo base.
- El paquete solo funciona con el runtime Mesh LLM; no es directamente cargable en llama.cpp, Ollama o vLLM sin reconstruir el GGUF original.
- Requiere coordinacion de red entre peers; la latencia entre maquinas puede degradar el throughput frente a un unico nodo con suficiente VRAM.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base y de los datos de entrenamiento originales antes de desplegar en produccion.
- El paquete registra "Package size: 0 B" y "Activation width: not recorded", lo que sugiere campos incompletos en el manifiesto; validar checksums antes de usar en produccion.

## Enlaces

- Repositorio del paquete: https://huggingface.co/meshllm/Muse-Glimmer-30B-UD-Q4_K_XL-layers
- Modelo base: https://huggingface.co/unsloth/Muse-Glimmer-30B-GGUF
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio GitHub de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Discord: https://discord.gg/rs6fmc63eN
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Especificacion del formato de paquete por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
