# konizquants/Inkling-Small-NVFP4

## Resumen

Inkling-Small-NVFP4 es una version cuantizada en NVFP4 del modelo multimodal thinkingmachines/Inkling-Small, publicada por el usuario konizquants en HuggingFace. El modelo base es un transformer autoregresivo decoder-only de tipo Mixture-of-Experts (MoE) disenado por Thinking Machines para aceptar entradas de texto, imagen y audio y generar texto, con orientacion a aplicaciones agénticas, asistentes de codigo, chatbots y sistemas de generacion aumentada por recuperacion.

La relevancia de esta ficha concreta reside en la cuantizacion: el repositorio distribuye los pesos en NVFP4 (4 bits con escalas), lo que reduce el espacio en disco respecto al BF16 original y permite desplegar un modelo de gran tamano en infraestructura con menos memoria. El repositorio ocupa 170,8 GB y declara 156.032.140.138 parametros en safetensors, mientras que la model card del modelo base indica 276B parametros totales y 12B activos por token; existe por tanto una discrepancia entre ambas cifras que conviene verificar antes de planificar un despliegue.

Se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, publicado el 21 de septiembre de 2026, con licencia Apache 2.0 y compatibilidad declarada con endpoints y con la libreria transformers. No se han encontrado resultados de busqueda web relevantes sobre este modelo, por lo que toda la informacion tecnica procede de la metadatos de HuggingFace y de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con backbone de feed-forward MoE disperso; atencion hibrida de capas locales y globales; multimodal nativo (codificador jerarquico de parches para imagen, codificacion discreta de tokens para audio) |
| Parametros totales | 276B segun la model card del modelo base; el repositorio cuantizado declara 156.032.140.138 parametros en safetensors (cifras discrepantes) |
| Parametros activos | 12B por token (segun model card del modelo base); enrutado a 6 de 256 expertos mas 2 expertos compartidos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos de 4 bits con escalas); el modelo base se ofrece en BF16 y tambien en NVFP4 oficial |
| Idiomas soportados | Ingles como idioma principal, con capacidades multilingues generales; la model card no detalla la lista de idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modalidades de entrada | Texto (UTF-8), imagen (pixel, dimensiones recomendadas entre 40 px y 4096 px), audio (WAV a 16 kHz, idealmente menos de 2 minutos) |
| Modalidades de salida | Texto (UTF-8) |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 170,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer autoregresivo decoder-only de 42 capas con un backbone de feed-forward basado en Mixture-of-Experts disperso: cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos que permanecen activos en todos los tokens. La atencion combina capas locales y globales de forma hibrida. El modelo es multimodal de forma nativa: las imagenes se codifican mediante un encoder jerarquico de parches y el audio mediante codificacion discreta de tokens; todas las modalidades se proyectan a un espacio oculto comun y se procesan conjuntamente por el decoder. Esta cuantizacion concreta no altera la arquitectura, solo la representacion numerica de los pesos.

En cuanto a los datos de entrenamiento, la model card indica que el corpus incluye texto, imagenes, audio y video, procedente de fuentes publicas de internet y repositorios accesibles publicamente, de terceros y de generacion o aumento sintetico. El proceso de curación incluye limpieza, deduplicacion y filtrado para eliminar datos de baja calidad o de riesgo. No se especifica el numero de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron fases de RLHF o DPO, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y otros idiomas, con soporte de instrucciones.
- Razonamiento multimodal: comprension de imagenes y de audio integrada en el mismo decoder, no como modulos separados.
- Capacidades de codigo en multiples lenguajes de programacion, segun declara la model card.
- Orientacion explicita a sistemas agénticos y de uso de herramientas (tool use / function calling), asi como a asistentes de codigo y sistemas RAG.
- Entrada de audio en formato WAV a 16 kHz con duracion ideal inferior a 2 minutos.
- Entrada de imagen en cualquier formato basado en pixeles, con rendimiento optimo entre 40 px y 4096 px por dimension.
- Despliegue local mediante SGLang, vLLM, TokenSpeed, Unsloth y transformers; acceso a API mediante proveedores terceros y playground de Tinker.
- No se documentan en la informacion disponible modos de pensamiento explicito (thinking mode) ni generacion de imagen o audio como salida.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede recibir capturas de pantalla, fotografias de productos o notas de voz junto al texto del cliente y responder en una unica conversacion, gracias a la proyeccion conjunta de imagen y audio en el espacio del decoder.
- Asistentes de codigo en produccion: con soporte declarado de tool calling y varios lenguajes de programacion, puede integrarse en pipelines de CI/CD para revision de codigo, generacion de tests o explicacion de trazas de error.
- Agentes multi-paso: el enrutado MoE con 12B parametros activos permite ejecutar cadenas de razonamiento y llamadas a herramientas con un coste de computo por token inferior al de un modelo denso del mismo tamano total.
- Transcripcion y analisis de reuniones: la entrada de audio en WAV a 16 kHz admite fragmentos de hasta 2 minutos, lo que encaja con la segmentacion habitual de reuniones para generar resumenes y extraer tareas.
- Analisis de documentos escaneados y formularios: la entrada de imagen entre 40 px y 4096 px permite procesar capturas de documentos y extraer informacion estructurada combinando vision y texto.
- Sistemas de generacion aumentada por recuperacion (RAG): el modelo esta explicitamente orientado a este escenario, con capacidad de concatenar contexto recuperado en texto e imagenes y generar respuestas fundamentadas.
- Despliegue en infraestructura multi-GPU propia: al publicarse con pesos NVFP4 y recetas para vLLM y SGLang, es adecuado para equipos que quieren servir su propio endpoint sin depender de una API propietaria.
- Investigacion y ajuste fino: al liberarse bajo Apache 2.0 y con receta de Unsloth, permite experimentar con fine-tuning sobre dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una tabla de evaluaciones comparativa con los modelos Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash (todos de pesos abiertos) y con modelos de pesos cerrados, pero el contenido de la tabla esta truncado en la informacion proporcionada y no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

Tampoco se dispone de datos de latencia, throughput ni tasa de acierto de enrutado de expertos especificos para esta cuantizacion NVFP4.

## Requisitos de hardware

- Peso de los parametros: el repositorio ocupa 170,8 GB en safetensors NVFP4. Al ser un modelo MoE, es necesario residenciar todos los expertos en memoria aunque solo se activen 12B parametros por token, por lo que el ahorro de VRAM de la cuantizacion es significativo pero no elimina la necesidad de memoria agregada.
- VRAM estimada para inferencia: en torno a 175-200 GB considerando pesos, cache KV y overhead del runtime, segun configuracion de batch y longitud de secuencia. Es una estimacion, no un dato publicado por el autor.
- GPU recomendadas: 3x H100 80 GB (240 GB), 4x A100 80 GB (320 GB), 2x H200 141 GB (282 GB) o 2x B200. Configuraciones con 2x H100 80 GB quedarian al limite o por debajo de lo necesario.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), RTX 5090 (32 GB) ni RTX 6000 Ada (48 GB) de forma individual. Solo seria viable con agregacion de varias GPU o con offloading a memoria del sistema, con una penalizacion de latencia importante.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Unsloth y transformers, con recetas publicadas por Thinking Machines; tambien acceso via API de proveedores terceros y playground de Tinker. No se documenta soporte de GGUF ni de llama.cpp en la informacion disponible.
- Compatibilidad de NVFP4: el soporte nativo de NVFP4 esta ligado a las GPU Blackwell; en arquitecturas Hopper o Ada puede requerir kernels alternativos o degradar el rendimiento. Conviene verificar la compatibilidad con la version concreta del motor de inferencia antes de dimensionar el cluster.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La model card del modelo base situa a Inkling-Small frente a los siguientes modelos. Solo se dispone de datos parciales; el resto se marca como no disponible.

| Modelo | Parametros | Parametros activos | Contexto | Pesos | Licencia |
|---|---|---|---|---|---|
| Inkling-Small (este repositorio, cuantizado NVFP4) | 276B segun model card / 156B segun safetensors | 12B | no disponible | Abiertos (Apache 2.0) | apache-2.0 |
| Qwen3.5 397B-A17B | 397B | 17B | no disponible | Abiertos | no disponible |
| MiMo V2.5 | no disponible | no disponible | no disponible | Abiertos | no disponible |
| Minimax M2.7 | no disponible | no disponible | no disponible | Abiertos | no disponible |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | Abiertos | no disponible |

Respecto a la alternativa directa, thinkingmachines/Inkling-Small en BF16, este repositorio ofrece una representacion de menor precision con la misma arquitectura y licencia, lo que reduce el espacio en disco a costa de una posible perdida de calidad numerica que el autor no cuantifica.

## Limitaciones y advertencias

- Discrepancia de parametros: la model card del modelo base declara 276B parametros totales, mientras que el repositorio cuantizado declara 156.032.140.138 parametros en safetensors. Es imprescindible aclarar esta diferencia antes de dimensionar hardware o estimar costes.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, un dato critico para RAG, agentes y conversaciones largas.
- Idiomas: la model card declara ingles como idioma principal, con capacidades multilingues generales no cuantificadas. No hay garantia de un rendimiento equivalente en castellano.
- Perdida por cuantizacion: NVFP4 introduce error numerico respecto a BF16. El autor no publica evaluaciones comparativas entre ambas versiones, por lo que el impacto real en calidad es desconocido.
- Dependencia de hardware: NVFP4 puede no ser nativo en GPU no Blackwell, lo que obliga a validar kernels y versiones del motor de inferencia.
- Riesgo de alucinacion: es un modelo de lenguaje generativo; en escenarios de codigo, datos medicos o financieros requiere verificacion humana y mecanismos de grounding.
- Sesgos: el corpus proviene de internet publico, datos de terceros y generacion sintetica; la model card no documenta evaluaciones de sesgo ni de equidad.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, publicado por un autor de comunidad y no por Thinking Machines. No hay garantia de mantenimiento, de trazabilidad del proceso de cuantizacion ni de que los pesos coincidan exactamente con el modelo base oficial NVFP4.
- Licencia: Apache 2.0 permite uso comercial, pero la model card remite a una politica de uso aceptable de Thinking Machines, por lo que conviene revisar si impone condiciones adicionales al despliegue en produccion.
- Limites de entrada: audio idealmente por debajo de 2 minutos y en WAV a 16 kHz; imagenes con dimensiones optimas entre 40 px y 4096 px. Fuera de esos rangos el rendimiento puede degradarse.
- Sin datos de rendimiento: no hay benchmarks, latencia ni throughput publicados para esta cuantizacion concreta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/konizquants/Inkling-Small-NVFP4
- Modelo base en BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Cuantizacion NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (repositorio): https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentacion de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo; las busquedas devolvieron resultados no relacionados con inteligencia artificial.
