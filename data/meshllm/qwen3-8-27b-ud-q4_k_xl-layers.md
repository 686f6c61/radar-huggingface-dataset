# meshllm/Qwen3.8-27B-UD-Q4_K_XL-layers

## Resumen

Este repositorio no contiene un modelo entrenado desde cero, sino un paquete de inferencia distribuida: la cuantizacion UD-Q4_K_XL de Qwen3.8-27B troceada en artefactos por capa para el sistema Mesh LLM. El autor es `meshllm` y el modelo de origen es `unsloth/Qwen3.8-27B-GGUF`, del que se conserva la licencia Apache 2.0, el pipeline de text-generation y el identificador de modelo `unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_XL`. El paquete declara 65 capas y un manifiesto (`model-package.json`) con checksums SHA-256 de cada artefacto.

La propuesta de valor es concreta: permitir servir un modelo de escala 27B en cuantizacion Q4 repartiendo las capas entre varias maquinas de una red local, de modo que ningun host necesite alojar el GGUF completo, y exponer el resultado mediante una API local compatible con `/v1/chat/completions` de OpenAI. El repositorio ocupa 20,2 GB y acumula 22.371 descargas, lo que indica uso real en despliegues de inferencia local.

Es relevante ahora porque la familia Qwen3.8 se distribuye con pesos abiertos bajo Apache 2.0 y el cuello de botella practico ya no es la calidad del modelo sino como alojarlo en hardware asequible. Este paquete es una pieza de infraestructura, no un checkpoint nuevo: no incluye entrenamiento adicional ni ajuste fino, y los detalles de arquitectura, plantilla de chat y recomendaciones de muestreo remiten a la model card de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal, segun la descripcion del repositorio oficial de Qwen3.8-27B; la model card de este paquete no detalla la arquitectura interna |
| Parametros totales | 27B segun la nomenclatura del paquete; el metadato safetensors del repositorio indica 383.273.184 parametros (discrepancia no aclarada, ver limitaciones) |
| Parametros activos | No aplica: no consta que sea un modelo MoE, el repositorio oficial lo describe como denso |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | UD-Q4_K_XL (GGUF, con imatrix); el repositorio de origen puede ofrecer otras variantes, no detalladas en la informacion disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de `unsloth/Qwen3.8-27B-GGUF`) |
| Formato de pesos | GGUF dividido en artefactos por capa (layer package) mas manifiesto `model-package.json` en JSON |
| Numero de capas | 65 |
| Tamano del repositorio | 20,2 GB |
| Libreria declarada | mesh-llm |
| Pipeline | text-generation |
| Fecha de creacion registrada | 2026-09-09 |
| Ultima actualizacion registrada | 2026-09-25 |
| Descargas / likes | 22.371 / 1 |

## Arquitectura y entrenamiento

Este repositorio no documenta un proceso de entrenamiento propio: es una redistribucion de pesos ya cuantizados. La model card indica que el paquete deriva de `unsloth/Qwen3.8-27B-GGUF` y que conserva la distribucion GGUF original dividida en artefactos por capa para inferencia distribuida. La fuente canonica se registra con revision `4ca720788d1e01f1bff70c033e0d0028fd02e502` y SHA-256 del fichero de origen `3f227079003add2511437e5b1e94812e363385225bf6a9b47b0054a72bc8b01e`; el manifiesto del paquete tiene SHA-256 `3bcd12893e7b5ec3eb1c87571e261875c9e334036d72fc53815106379f250ec1`. La generacion se realizo con el divisor de HF Jobs de Mesh LLM, referencia `29bdf713d769a45cd299f4a4f7cea5333d700efd`, verificando checksum de cada artefacto antes de subirlo y liberando el espacio de trabajo entre artefactos.

En cuanto al modelo subyacente, la informacion disponible lo situa como un LLM denso multimodal nativo de escala 27B publicado por el equipo Qwen de Alibaba, orientado a codificacion, flujos agenticos y automatizacion de oficina, con pesos abiertos bajo Apache 2.0. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones de atencion o decodificacion especulativa. La etiqueta `imatrix` del repositorio indica que la cuantizacion se calibro con una matriz de importancia, una tecnica habitual para reducir el error en cuantizaciones de 4 bits.

## Capacidades

- Inferencia distribuida por capas: el paquete esta disenado para repartir las 65 capas entre varios nodos de una red local mediante `mesh-llm serve --model ... --split`.
- Servidor compatible con la API de OpenAI: expone `/v1/models` y `/v1/chat/completions` en el puerto local 3131, con nombres de modelo en el formato `unsloth/Qwen3.8-27B-GGUF:UD-Q4_K_XL`.
- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline `text-generation` confirman uso dialogico multi-turno, con plantilla de chat heredada del modelo de origen.
- Inferencia local y privada: todo el computo ocurre en hardware propio, sin envio de prompts a servicios externos.
- Capacidades heredadas del modelo de origen, segun el repositorio oficial de Qwen3.8-27B: codificacion, flujos agenticos y automatizacion de oficina.
- Multimodalidad nativa: el repositorio oficial de Qwen3.8-27B describe el modelo como multimodal nativo; no se confirma en la informacion disponible que este paquete de capas incluya los pesos del proyector multimodal.
- Tool calling / function calling: no confirmado de forma explicita en la informacion disponible; el endpoint es compatible con el esquema de chat de OpenAI.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio o cualquier capacidad especial adicional: no disponible.

## Casos de uso

- Inferencia privada en una red de oficina: desplegar `mesh-llm serve --model "meshllm/Qwen3.8-27B-UD-Q4_K_XL-layers" --split` en cada maquina que aporte memoria y computo, de modo que los datos no salgan de la red corporativa.
- Servicio interno compatible con OpenAI: sustituir el endpoint de un proveedor externo por `http://localhost:3131/v1/chat/completions` sin reescribir los clientes, ya que el esquema de peticion y respuesta es el de OpenAI.
- Servir un modelo de 27B cuando el GGUF completo no cabe en un solo host: al dividir las capas entre pares, se suma VRAM y RAM de varias maquinas en lugar de exigir una GPU de gran memoria.
- Laboratorio de investigacion con hardware heterogeneo: aprovechar estaciones de trabajo y portatiles existentes como nodos, midiendo el reparto de capas con `/api/status`.
- Automatizacion de oficina: redaccion y resumen de documentos, generacion de plantillas y limpieza de datos tabulares, tareas para las que el modelo de origen esta explicitamente orientado segun su repositorio oficial.
- Asistencia a la codificacion en local: generar funciones pequenas y completar fragmentos sin enviar codigo propietario a terceros; la propia model card usa como ejemplo una peticion para escribir una funcion hello-world en Rust.
- Flujos agenticos multi-paso: encadenar llamadas al endpoint local para tareas que requieren varias rondas de razonamiento y uso de herramientas, siempre que se valide el soporte de function calling en la plantilla de origen.
- Experimentacion con llama.cpp: la interfaz de Hugging Face lista llama.cpp como libreria compatible, lo que permite probar los pesos fuera del ecosistema Mesh LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este paquete remite expresamente a la model card de origen (`unsloth/Qwen3.8-27B-GGUF`) para notas de benchmark, y no se han proporcionado cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion. Tampoco se ofrecen mediciones de latencia o throughput del modo distribuido.

## Requisitos de hardware

- Tamano de los artefactos: 20,2 GB en total. Este es el unico dato de tamano fiable aportado por la informacion disponible.
- VRAM por nodo: no disponible. El proposito del paquete es precisamente que ninguna maquina necesite el modelo completo en memoria, sino solo un subconjunto de capas.
- La model card declara `Package size: 0 B` y `Activation width: not recorded`, valores que parecen marcadores de posicion sin rellenar y que no deben usarse para dimensionar el despliegue.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090 u otros).
- Encaje en GPU de consumo: no disponible. No hay datos publicados sobre que cada cuantizacion UD-Q4_K_XL de un modelo de 27B quepa en tarjetas de 16 GB o 24 GB; la busca web consultada plantea la pregunta pero no aporta la cifra.
- Opciones de despliegue: Mesh LLM (`mesh-llm serve ... --split`), llama.cpp segun la lista de librerias compatibles de Hugging Face, y cualquier cliente HTTP compatible con OpenAI apuntando al puerto 3131.
- Latencia y throughput: no disponibles. En despliegues repartidos hay que contar con el coste de red de transferir activaciones entre nodos, que depende del ancho de banda local y del numero de saltos.

## Comparativa con modelos similares

No se dispone de benchmarks ni de especificaciones de contexto de este paquete, por lo que no es posible compararlo en rendimiento con otros modelos. La comparacion relevante es de formato de distribucion, no de calidad:

| Aspecto | Este paquete (layer package) | GGUF monolitico (`unsloth/Qwen3.8-27B-GGUF`) | Servicio en la nube |
|---|---|---|---|
| Formato | GGUF troceado por capas mas manifiesto JSON | Un unico fichero GGUF | API remota |
| Requisito de memoria por host | Parcial, se reparte entre nodos | Debe caber entero en un host | Practicamente nulo en local |
| Privacidad de los datos | Total, todo local | Total, todo local | Depende del proveedor |
| Complejidad de operacion | Alta: requiere orquestar varios nodos | Media: un solo proceso con llama.cpp u Ollama | Baja |
| Latencia anadida | Red entre nodos | Ninguna por red | Red hasta el proveedor |
| Verificacion de integridad | Checksums por artefacto y manifiesto | Checksum del fichero | No aplica |
| Licencia | Apache 2.0 | Apache 2.0 | Terminos del proveedor |

## Limitaciones y advertencias

- Este repositorio es un artefacto derivado, no un modelo original: cualquier duda sobre sesgos, alineacion o datos de entrenamiento debe resolverse consultando la model card de `unsloth/Qwen3.8-27B-GGUF` y la del modelo Qwen3.8-27B.
- Discrepancia de parametros: el metadato safetensors del repositorio indica 383.273.184 parametros, mientras que la nomenclatura del paquete y la escala declarada son 27B. No se ha aclarado el motivo; no conviene usar ese campo para dimensionar el despliegue.
- Metadatos incompletos: `Package size: 0 B`, `Activation width: not recorded` y `Skippy ABI: not recorded` son campos vacios o marcadores, no valores reales.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad, tasa de alucinacion o calibracion para este paquete ni para el modelo de origen en la informacion disponible.
- Idiomas: no se documenta la cobertura linguistica, por lo que no se puede garantizar un rendimiento aceptable en castellano sin evaluacion previa.
- Contexto: se desconoce la longitud de contexto efectiva de la cuantizacion UD-Q4_K_XL; no debe asumirse que coincida con la del modelo sin cuantizar.
- Latencia y fiabilidad dependen de la red: al repartir capas entre maquinas, cualquier caida de un nodo o un enlace lento degrada o interrumpe el servicio.
- Licencia: el paquete declara Apache 2.0, heredada del modelo de origen. Conviene verificar los terminos vigentes en el repositorio de origen antes de un uso comercial, incluidos los pesos multimodales si se distribuyen por separado.
- Consumo de disco: 20,2 GB de artefactos que deben replicarse en los nodos participantes segun el reparto de capas.
- Procedencia: el paquete se genero automaticamente con una herramienta concreta (`skippy-model-package write-package`) sobre una revision fija del GGUF de origen; los checksums permiten verificar la integridad, pero no sustituyen a una validacion funcional del modelo tras el troceado.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/meshllm/Qwen3.8-27B-UD-Q4_K_XL-layers
- Modelo de origen en Hugging Face: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Repositorio oficial de Qwen3.8-27B (Alibaba Cloud): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio oficial de la serie Qwen3.8 (QwenLM): https://github.com/QwenLM/Qwen3.8
- Codigo de Mesh LLM: https://github.com/Mesh-LLM/mesh-llm
- Especificacion del formato layer-package: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Sitio web de Mesh LLM: https://www.meshllm.cloud
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord del proyecto: https://discord.gg/rs6fmc63eN
- Articulo sobre requisitos de memoria para ejecutar Qwen3.8-27B en local: https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
