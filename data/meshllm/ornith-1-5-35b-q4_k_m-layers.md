# meshllm/Ornith-1.5-35B-Q4_K_M-layers

## Resumen

Ornith-1.5-35B-Q4_K_M-layers es un paquete de pesos en formato GGUF dividido por capas, publicado por el usuario meshllm, que permite ejecutar el modelo Ornith-1.5-35B (familia Ornith, desarrollada por ornith-ai) repartiendo sus 41 capas entre varias maquinas de un cluster local gestionado por Mesh LLM. No se trata de un modelo entrenado desde cero, sino de una redistribucion del GGUF original `ornith-ai/Ornith-1.5-35B-A3B-GGUF` en artefactos por capa, con checksums SHA-256 por artefacto y un manifiesto de paquete (`model-package.json`) que describe la identidad y los checksums de la distribucion.

El objetivo es resolver un problema practico de despliegue: el fichero GGUF completo en cuantizacion Q4_K_M ocupa del orden de 20-23 GB, lo que lo deja al limite o fuera del alcance de una unica GPU de consumo. Con este paquete, cada maquina del cluster aporta memoria y computo, y el runtime de Mesh LLM sirve un endpoint compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/models`, `/api/status`) sobre el modelo repartido. El repositorio tiene 3.838 descargas y licencia MIT heredada del modelo base.

La relevancia actual viene de dos factores: la cuantizacion Q4_K_M (con tecnica imatrix) mantiene el modelo en un rango de memoria manejable, y el reparto por capas convierte la inferencia local de un modelo de escala 35B en un problema de agregacion de equipos en lugar de un problema de compra de hardware de gama alta. La model card no documenta arquitectura interna, contexto, idiomas ni benchmarks: para esos datos remite explicitamente a la ficha del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (paquete de inferencia derivado del modelo base Ornith-1.5-35B-A3B; la nomenclatura "A3B" del modelo fuente sugiere mezcla de expertos con ~3B parametros activos, sin confirmacion documental) |
| Parametros totales | 842.700.992 segun los metadatos de HuggingFace del repositorio (dato safetensors); la model card del paquete declara escala de parametros 35B para el modelo fuente |
| Parametros activos | no disponible (el modelo fuente se identifica como A3B, lo que apunta a ~3B activos, sin cifra confirmada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (esta variante); el paquete solo distribuye esta cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada de `ornith-ai/Ornith-1.5-35B-A3B-GGUF`) |
| Formato de pesos | GGUF, empaquetado como layer package (un artefacto por capa) con manifiesto `model-package.json` |
| Desarrollador del paquete | meshllm |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B-GGUF (revision `12393612fd4f730ff5aadc23e9b8f9648aa49ceb`) |
| Numero de capas | 41 |
| Fichero fuente | `Ornith-1.5-35B-Q4_K_M.gguf` |
| SHA-256 del fichero fuente | `42739874cc2ccfdb8523b23fbe52e29b2a7555c8176737ca9ca0b5d59859d41f` |
| SHA-256 del manifiesto | `397df60b3e66c79633ca741e081e5c53407762df28a3fac4ee3714ddfccd12a9` |
| Libreria / runtime | mesh-llm |
| Pipeline | text-generation |
| Tamano del repositorio | 23,1 GB |
| Fecha de creacion / actualizacion | 2026-09-09 / 2026-09-25 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo subyacente ni su proceso de entrenamiento: la model card del paquete remite a la ficha de `ornith-ai/Ornith-1.5-35B-A3B-GGUF` para detalles de arquitectura, plantilla de chat, recomendaciones de muestreo, terminos de licencia y notas de benchmark. Lo unico documentado a nivel estructural es el numero de capas (41) y que el paquete se genera dividiendo el GGUF original en artefactos por capa mediante la herramienta `skippy-model-package write-package`, generada por el splitter de HF Jobs de Mesh LLM en la referencia `29bdf713d769a45cd299f4a4f7cea5333d700efd`.

Tampoco se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo fases de RLHF o DPO. El unico dato tecnico relevante sobre el propio paquete es el etiquetado `imatrix`, que indica que la cuantizacion Q4_K_M del modelo fuente se calibro con matrices de importancia (imatrix) para reducir la perdida de calidad respecto a una cuantizacion uniforme. No consta informacion sobre decodificacion especulativa, atencion lineal ni otras innovaciones de inferencia.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la pipeline `text-generation` confirman el uso previsto de chat multi-turno.
- Servido mediante API compatible con OpenAI: expone `/v1/chat/completions` y `/v1/models` a traves del runtime de Mesh LLM, de modo que cualquier cliente OpenAI puede apuntar al endpoint local.
- Inferencia distribuida por capas: capacidad diferencial del paquete, permitiendo repartir el modelo entre varias maquinas con `mesh-llm serve --split`.
- Inferencia local y privada: todo el computo y la memoria permanecen en el hardware del usuario; no requiere servicios externos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas esta vacio en los metadatos).
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.
- Caso de uso ejemplificado en la model card: generacion de codigo sencillo (funcion hello-world en Rust) mediante peticion a la API local.

## Casos de uso

- Inferencia privada en hardware propio: el paquete permite ejecutar un modelo de escala 35B sin enviar prompts ni datos a terceros, algo critico en entornos con requisitos de confidencialidad (sanidad, legal, defensa) donde el uso de APIs externas esta restringido.
- Servido multi-maquina cuando un unico host no basta: con 41 capas empaquetadas de forma independiente, un equipo con dos o tres maquinas de 12-16 GB de VRAM puede repartir el modelo con `mesh-llm serve --model ... --split` y obtener un endpoint unico, evitando la compra de una GPU de 80 GB.
- Sustitucion directa de OpenAI en aplicaciones existentes: al exponer `/v1/chat/completions`, cualquier aplicacion que ya hable el protocolo de OpenAI puede redirigirse al endpoint local cambiando unicamente la URL base, sin reescribir el cliente.
- Laboratorio de pruebas para desarrolladores de herramientas de inferencia distribuida: la estructura de layer package mas manifiesto con checksums permite validar pipelines de reparto, verificacion de integridad y reconstruccion de GGUF a partir de fragmentos.
- Asistencia de generacion de codigo en el puesto de trabajo: la model card incluye un ejemplo explicito de generacion de una funcion hello-world en Rust, lo que lo situa como candidato para autocompletado o generacion de fragmentos de codigo dentro de un IDE conectado al endpoint local.
- Despliegue en entornos sin salida a internet: en redes aisladas (air-gapped) donde no es posible descargar pesos en tiempo de ejecucion, el paquete permite aprovisionar los artefactos por capa de antemano y verificar su integridad con los SHA-256 publicados.
- Experimentacion academica con modelos grandes en clusters de laboratorio: un grupo de investigacion con varias estaciones de trabajo modestas puede agregar recursos para servir un modelo de 35B y estudiarlo sin acceso a infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del paquete no incluye cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto, y remite a la ficha del modelo fuente `ornith-ai/Ornith-1.5-35B-A3B-GGUF` para las notas de benchmark. Los resultados de busqueda web recuperados no contienen informacion tecnica sobre el modelo: corresponden a fichas deportivas de una jugadora de baloncesto sin relacion con el proyecto.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 23,1 GB, por lo que la cuantizacion Q4_K_M requiere del orden de 20-24 GB de memoria agregada para pesos, mas overhead de contexto y cache KV.
- GPU unica: una GPU de 24 GB (RTX 3090, RTX 4090, A10G 24 GB) queda en el limite; una A100 40 GB, L40S 48 GB, A6000 48 GB o H100 80 GB lo alojan con margen.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB solo si el contexto es pequeno y se asume riesgo de OOM; en GPUs de 12-16 GB (RTX 4080, 4070 Ti, 3080) no cabe sin reparto entre maquinas o sin descarga de capas a RAM.
- Reparto multi-maquina: es el escenario de diseno del paquete; con dos equipos de 16 GB o tres de 12 GB se puede servir el modelo completo agregando memoria a traves de Mesh LLM.
- Opciones de despliegue: Mesh LLM (runtime nativo del paquete, con `mesh-llm serve --model "meshllm/Ornith-1.5-35B-Q4_K_M-layers" --split`); el formato GGUF subyacente es compatible con el ecosistema llama.cpp (llama.cpp, Ollama, LM Studio) siempre que se use el GGUF completo del modelo fuente en lugar del paquete por capas.
- Latencia y throughput: no disponibles. Dependen del numero de nodos, del ancho de banda de la red entre ellos y del reparto de capas por maquina; el reparto por capas introduce trafico de activaciones entre nodos en cada token generado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de benchmarks, contexto ni parametros verificables del modelo subyacente, por lo que no es posible establecer una comparacion cuantitativa fiable con alternativas. Como referencia estructural, el paquete se distingue de un GGUF convencional en que no es un fichero unico autocontenido sino una distribucion por capas dependiente del runtime Mesh LLM; frente a un GGUF estandar del mismo modelo, la diferencia practica es que el primero se puede repartir entre maquinas y el segundo no.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: los metadatos de HuggingFace del repositorio indican 842.700.992 parametros (dato safetensors), mientras que la model card declara escala de 35B para el modelo fuente. Cualquiera de las dos cifras debe verificarse contra el modelo original antes de dimensionar hardware.
- El repositorio no es un modelo autonomo: es un paquete de capas que requiere el runtime Mesh LLM y el manifiesto del paquete. No se puede cargar directamente en llama.cpp, vLLM o transformers sin un proceso de reconstruccion.
- La model card indica "Package size: 0 B" y lista unicamente el manifiesto en la seccion de artefactos incluidos, mientras que los metadatos de HuggingFace reportan 23,1 GB de repositorio; conviene comprobar el contenido real del repositorio antes de descargarlo.
- Ausencia total de datos de evaluacion: sin benchmarks, sin numero de tokens de entrenamiento, sin composicion del dataset y sin documentacion de alineacion (RLHF/DPO), no es posible estimar calidad, tasa de alucinacion ni comportamiento en dominios concretos.
- Idiomas no declarados: el campo de idiomas esta vacio en los metadatos, de modo que el soporte multilingue (incluido el castellano) no esta garantizado ni documentado.
- Longitud de contexto desconocida: impide planificar aplicaciones que dependan de ventanas largas (analisis de documentos extensos, conversaciones de muchos turnos).
- Riesgo de alucinacion: no cuantificado. Al no haber evaluaciones publicadas, debe asumirse el riesgo habitual de los modelos generativos y validar las salidas en cualquier uso con consecuencias.
- Rendimiento dependiente de la red: en el modo distribuido, la latencia por token queda condicionada por el ancho de banda y la latencia entre nodos; una red lenta puede hacer inviable el uso interactivo.
- Licencia MIT: permite uso comercial y modificacion con obligacion de conservar el aviso de copyright y la licencia. Se hereda del modelo fuente, por lo que deben revisarse tambien los terminos del repositorio `ornith-ai/Ornith-1.5-35B-A3B-GGUF`.
- Ausencia de soporte de terceros: el paquete tiene 0 likes y depende de un ecosistema (Mesh LLM, formato layer package) mucho menos extendido que llama.cpp u Ollama, lo que reduce la comunidad disponible para resolver incidencias.

## Enlaces

- Repositorio del paquete en HuggingFace: https://huggingface.co/meshllm/Ornith-1.5-35B-Q4_K_M-layers
- Modelo fuente: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF
- Web de Mesh LLM: https://www.meshllm.cloud
- Repositorio de Mesh LLM en GitHub: https://github.com/Mesh-LLM/mesh-llm
- Especificacion del formato layer package: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catalogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord del proyecto: https://discord.gg/rs6fmc63eN
