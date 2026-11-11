# larql/gemma-4-31b-it

## Resumen

Gemma 4 31B IT es un modelo de lenguaje de gran tamano desarrollado por Google, publicado bajo licencia Apache 2.0. Esta ficha concreta corresponde a `larql/gemma-4-31b-it`, una redistribucion de los pesos originales de `google/gemma-4-31B-it` (commit `842da3794eaa0b77d5f08bae87a17459d91ff475`) empaquetados como contenedor VINDEX3 para el runtime LARQL. No se trata de un fine-tuning ni de una modificacion de los pesos: el autor declara explicitamente que los pesos BF16 se redistribuyen sin modificar, anadiendo la estructura del modelo como grafo ejecutable e inspeccionable.

El modelo base es la variante instruct (IT) de la familia Gemma 4, con 31 mil millones de parametros. El contenedor ocupa 63,7 GB en el repositorio, coherente con pesos en BF16 (aproximadamente 2 bytes por parametro mas la estructura del grafo). La relevancia de esta publicacion es fundamentalmente de infraestructura: permite ejecutar el modelo mediante la CLI de LARQL (`larql pull`, `larql run`, `larql serve`) y exponer una API compatible con OpenAI, ademas de habilitar consultas sobre la estructura interna del modelo mediante el lenguaje LQL y la herramienta `vindex3 observe`.

La informacion disponible sobre el modelo base en esta ficha es limitada: la model card del contenedor no detalla arquitectura, datos de entrenamiento, contexto ni benchmarks. Los datos que se recogen a continuacion provienen de la model card del contenedor y de las etiquetas del repositorio; cualquier especificacion no documentada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de la familia Gemma 4; no detallado en la informacion proporcionada) |
| Parametros totales | 31 mil millones (segun el identificador del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos del contenedor se distribuyen en BF16 sin modificar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | contenedor VINDEX3 (runtime LARQL); pesos BF16 originales embebidos; no se mencionan safetensors ni GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni se documentan el numero de capas, dimensiones ocultas, mecanismo de atencion o funcion de activacion. Tampoco se indica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica informacion estructural concreta es la del contenedor: LARQL codifica el modelo como un grafo ejecutable e inspeccionable que reproduce la estructura original, manteniendo los pesos BF16 intactos.

La innovacion tecnica destacable de esta publicacion no esta en el modelo sino en el formato de empaquetado. VINDEX3 expone la estructura del modelo como grafo consultable, lo que permite inspeccionar y observar componentes internos durante la inferencia (`vindex3 observe`) y ejecutar consultas estructurales mediante LQL. El contenedor incluye tambien los pesos de vision del modelo base, aunque esta compilacion de LARQL no admite entrada de imagen ni audio para este modelo, por lo que en la practica solo esta habilitada la generacion de texto.

## Capacidades

- Generacion de texto: disponible mediante los comandos `run`, `chat` y `serve` de la CLI de LARQL.
- API compatible con OpenAI: el comando `larql serve gemma-4-31b-it --port 8080` expone un endpoint compatible para integracion con clientes existentes.
- Inspeccion estructural: consultas sobre el grafo del modelo mediante LQL y observacion de componentes internos con `vindex3 observe`.
- Vision: los pesos de vision estan presentes en el contenedor, pero esta compilacion de LARQL no admite entrada de imagen para este modelo.
- Audio: no admitido por esta compilacion de LARQL.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de inferencia con API compatible con OpenAI: mediante `larql serve` se puede levantar un endpoint en el puerto indicado y conectar herramientas y SDKs que ya hablan el protocolo de OpenAI, sin reescribir integraciones existentes.
- Analisis e interpretabilidad de modelos: el formato VINDEX3 expone la estructura como grafo inspeccionable, lo que permite estudiar componentes internos y su comportamiento durante la generacion con `vindex3 observe`, util para investigacion en mecanistica de interpretabilidad.
- Consultas estructurales automatizadas: LQL permite formular consultas sobre la estructura del modelo, adecuado para auditorias internas, documentacion automatizada de arquitecturas y verificacion de integridad del contenedor.
- Reproducibilidad de despliegues: al fijarse el commit exacto del modelo base (`842da3794eaa0b77d5f08bae87a17459d91ff475`) y documentarse los digests en `PROVENANCE.md`, el contenedor sirve para entornos donde se exige trazabilidad completa de los pesos utilizados.
- Generacion de texto en entornos controlados: `larql run` permite invocaciones puntuales del modelo desde scripts y pipelines de shell, util para pruebas de humo, evaluaciones rapidas y generacion por lotes de pequeno volumen.
- Prototipado de asistentes conversacionales: el comando `chat` habilita conversaciones multi-turno sobre el modelo instruct, apropiado para validar flujos de asistente antes de migrar a un despliegue de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmetica, los pesos BF16 de un modelo de 31 mil millones de parametros ocupan aproximadamente 62 GB, lo que exige al menos esa cantidad de memoria para cargar el modelo sin cuantizar, mas el espacio para cache KV y overhead del runtime.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el volumen de pesos BF16, se requeriria hardware con 80 GB de memoria por GPU (por ejemplo, A100 80GB o H100) o configuraciones multi-GPU.
- Compatibilidad con GPU de consumo: no disponible. El contenedor no documenta soporte de cuantizacion, por lo que no se puede confirmar su ejecucion en GPUs de consumo con 24 GB o menos.
- Opciones de despliegue: runtime LARQL (`larql pull`, `larql run`, `larql chat`, `larql serve`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de distribucion | Notas |
|---|---|---|---|---|---|
| larql/gemma-4-31b-it | 31B | no disponible | Apache 2.0 | Contenedor VINDEX3 (LARQL) | Pesos BF16 sin modificar; vision presente pero no habilitada en esta compilacion |
| google/gemma-4-31B-it | 31B | no disponible | Apache 2.0 | no disponible en la informacion proporcionada | Modelo base original del que deriva este contenedor |
| Alternativas de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados de otros modelos comparables en la informacion proporcionada |

La unica comparacion sustentada por la informacion disponible es la del contenedor frente al modelo base original de Google. Cualquier comparacion con otras familias de modelos de tamano similar no puede realizarse sin inventar datos.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al tratarse de un modelo de lenguaje de gran escala, cabe esperar los sesgos presentes en sus datos de entrenamiento, pero no se dispone de una evaluacion concreta en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican las precauciones habituales en modelos generativos.
- Idiomas soportados: no documentados, lo que impide garantizar calidad en castellano u otros idiomas distintos del que se haya validado en el modelo base.
- Longitud de contexto: no documentada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Vision no utilizable en esta compilacion: aunque los pesos de vision viajan en el contenedor, LARQL no admite entrada de imagen ni audio para este modelo; no debe asumirse capacidad multimodal al desplegarlo.
- Dependencia del runtime LARQL: el contenedor VINDEX3 no es un formato estandar; su uso requiere la herramienta LARQL y no es directamente compatible con vLLM, llama.cpp, Ollama o TGI.
- Requisitos de memoria elevados: los pesos BF16 implican un consumo de memoria en torno a 62 GB solo para los parametros, lo que restringe el despliegue a hardware de gama alta o configuraciones multi-GPU.
- Licencia: Apache 2.0 permite uso comercial y redistribucion; el autor indica que el contenedor redistribuye los pesos originales bajo esa misma licencia. Debe verificarse igualmente la licencia del modelo base en la documentacion oficial de Google.
- Madurez del repositorio: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria documentada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/larql/gemma-4-31b-it
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-31B-it
- Documentacion de VINDEX3: https://vindex3.org
- Repositorio de LARQL: https://github.com/chrishayuk/larql
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Fichero de procedencia y digests: PROVENANCE.md (incluido en el repositorio de Hugging Face)
