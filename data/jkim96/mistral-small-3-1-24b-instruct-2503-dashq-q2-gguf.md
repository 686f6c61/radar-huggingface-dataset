# jkim96/Mistral-Small-3.1-24B-Instruct-2503-DASHQ-Q2-GGUF

## Resumen

Este repositorio contiene una serie de archivos GGUF cuantizados del modelo Mistral-Small-3.1-24B-Instruct-2503 de Mistral AI, generados por el usuario jkim96 mediante el metodo de cuantizacion DASH-Q. Se trata de una cuantizacion de 2 bits con cuatro variantes (IQ2_XXS, IQ2_XS, IQ2_M y Q2_K_XL) que comprimen un modelo de 23.572.403.200 parametros (aproximadamente 23,6 mil millones) hasta pesos de entre 6,76 GB y 9,15 GB, con tasas de 2,29 a 3,10 bits por peso.

La relevancia de esta publicacion no esta en el modelo base, sino en la tecnica de cuantizacion. Segun los datos de la model card, DASH-Q reduce drasticamente la perplejidad respecto a las cuantizaciones de 2 bits convencionales: en IQ2_XXS baja de 22,77 (llama.cpp imatrix) a 7,19 en WikiText-2, y en Q2_K_XL de 6,61 a 5,58. La innovacion clave es que todos los tensores usan unicamente tipos estandar de llama.cpp, sin superar los 4 bits, por lo que cargan en cualquier compilacion reciente de llama.cpp sin soporte adicional.

El modelo es exclusivamente de texto: el tower de vision del modelo base no esta incluido en estos archivos. El repositorio hereda la licencia Apache 2.0 del modelo base y esta pensado para despliegue en hardware de consumo mediante el ecosistema llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral Small 3.1) |
| Parametros totales | 23.572.403.200 (23,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base (limitada por VRAM en la practica) |
| Tipos de cuantizacion | IQ2_XXS, IQ2_XS, IQ2_M, Q2_K_XL |
| Idiomas soportados | multilingue (heredado del modelo base; lista exacta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Detalle de los archivos publicados:

| Archivo | Tipo | Tamano | Bits / peso |
|---|---|---|---|
| ...DASHQ-IQ2_XXS.gguf | IQ2_XXS | 6,76 GB | 2,29 |
| ...DASHQ-IQ2_XS.gguf | IQ2_XS | 7,68 GB | 2,60 |
| ...DASHQ-IQ2_M.gguf | IQ2_M | 8,25 GB | 2,80 |
| ...DASHQ-Q2_K_XL.gguf | Q2_K_XL | 9,15 GB | 3,10 |

## Arquitectura y entrenamiento

El modelo base, Mistral-Small-3.1-24B-Instruct-2503, es un transformer decoder-only de Mistral AI, con atencion de tipo grouped-query (GQA) y el mecanismo habitual de la familia Mistral. Esta version concreta es una cuantizacion post-entrenamiento: no se ha reentrenado ni ajustado el modelo, sino que se han recomprimido sus pesos con el metodo DASH-Q desarrollado por Jaemin Kim (repositorio github.com/JaeminK/dashq). Los detalles exactos de la composicion del dataset de entrenamiento del modelo base, el numero de tokens y si hubo RLHF o DPO no estan disponibles en la informacion proporcionada.

La innovacion tecnica destacable es la propia cuantizacion DASH-Q. Frente a las cuantizaciones de 2 bits tradicionales (IQ2_XXS, IQ2_XS, IQ2_M de llama.cpp o las UD de unsloth), DASH-Q obtiene perplejidades muy inferiores manteniendo el uso exclusivo de tipos de tensor estandar de llama.cpp y sin ningun tensor por encima de 4 bits. Esto implica compatibilidad total con builds recientes de llama.cpp y con cualquier herramienta que consuma GGUF estandar, sin necesidad de kernels o parches especificos. No se dispone de informacion sobre el pipeline interno de DASH-Q en el material proporcionado.

## Capacidades

- Generacion de texto conversacional: es una version Instruct del modelo base, orientada a dialogos multi-turno.
- Razonamiento y comprension: heredadas del modelo base Mistral Small 3.1.
- Generacion de codigo: el modelo base rinde bien en tareas de programacion.
- Matematicas: capacidades del modelo base, degradadas de forma controlada por la cuantizacion de 2 bits.
- Tool calling / function calling: el modelo base lo soporta; la cuantizacion agresiva puede degradar esta capacidad.
- Razonamiento multi-paso y uso en agentes: posible, con las reservas de la cuantizacion.
- Multilingue: heredado del modelo base.
- Vision: NO disponible. La model card indica explicitamente "Text only: the vision tower is not included".
- Thinking mode, audio: no disponibles.

## Casos de uso

- Inferencia local en portatiles y equipos sin GPU dedicada: con el archivo IQ2_XXS (6,76 GB) el modelo cabe en 8 GB de VRAM o incluso en RAM mediante offload parcial a CPU, permitiendo ejecutar un modelo de 23,6 B en hardware modesto.
- Asistentes de chat offline y privados: al ejecutarse con llama.cpp de forma local, los datos no salen del equipo, adecuado para entornos con requisitos de privacidad.
- Prototipado rapido de aplicaciones conversacionales: la compatibilidad con GGUF y llama-cli permite integrar el modelo en un script en minutos sin infraestructura de servidor.
- Generacion de codigo en local para autocompletado o refactorizacion: util en equipos de desarrollo que quieren asistencia sin depender de APIs externas.
- Despliegue en entornos embebidos o de borde con recursos limitados: los archivos de 6,76-9,15 GB permiten servir el modelo en maquinas con 16 GB de RAM.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio sirve como referencia para medir el impacto de DASH-Q frente a IQ2 y Q2 convencionales usando la tabla de perplejidades.
- Educacion e investigacion: estudiar el efecto de la cuantizacion de 2 bits en un modelo Instruct real sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

Unicos datos publicados: perplejidad (menor es mejor), medida con `llama-perplexity`, contexto 2048, WikiText-2 test y C4 validation (256 x 2048 tokens).

| Tipo | Modelo | Tamano | WikiText-2 | C4 |
|---|---|---|---|---|
| IQ2_XXS | llama.cpp IQ2_XXS (imatrix) | 6,55 GB | 22,77 | 46,24 |
| IQ2_XXS | unsloth UD-IQ2_XXS | 6,75 GB | 22,87 | 44,04 |
| IQ2_XXS | DASH-Q IQ2_XXS | 6,76 GB | 7,19 | 12,20 |
| IQ2_XS | llama.cpp IQ2_XS (imatrix) | 7,21 GB | 16,62 | 29,68 |
| IQ2_XS | DASH-Q IQ2_XS | 7,68 GB | 6,17 | 10,52 |
| IQ2_M | llama.cpp IQ2_M (imatrix) | 8,11 GB | 9,17 | 15,32 |
| IQ2_M | unsloth UD-IQ2_M | 8,24 GB | 8,96 | 14,79 |
| IQ2_M | DASH-Q IQ2_M | 8,25 GB | 5,74 | 9,86 |
| Q2_K_XL | llama.cpp Q2_K (imatrix) | 8,89 GB | 6,61 | 10,64 |
| Q2_K_XL | unsloth UD-Q2_K_XL | 9,29 GB | 6,36 | 10,21 |
| Q2_K_XL | DASH-Q Q2_K_XL | 9,15 GB | 5,58 | 9,56 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): IQ2_XXS 6,76 GB; IQ2_XS 7,68 GB; IQ2_M 8,25 GB; Q2_K_XL 9,15 GB. Hay que anadir overhead por KV cache segun contexto (a 8192 tokens, varios cientos de MB adicionales).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 para las variantes mayores; RTX 3070 8 GB o RTX 4060 8 GB para IQ2_XXS.
- Cabe en GPU de consumo: si. IQ2_XXS en 8 GB, IQ2_XS e IQ2_M en 10-12 GB, Q2_K_XL en 12 GB.
- CPU y RAM: con offload a CPU (menos capas en GPU, `-ngl`) se puede ejecutar en 16 GB de RAM del sistema.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), llama-cpp-python, Ollama (importando el GGUF), LM Studio, text-generation-webui. Al ser GGUF estandar, cualquier herramienta compatible sirve.
- Latencia y throughput estimados: no disponibles (no se proporcionan mediciones). El comando de ejemplo es `llama-cli -m ...-Q2_K_XL.gguf -ngl 99 -c 8192`.

## Comparativa con modelos similares

Comparativa dentro de la misma categoria (cuantizaciones de 2 bits del mismo modelo base):

| Modelo | Tamano | Perplejidad WikiText-2 | Perplejidad C4 | Licencia |
|---|---|---|---|---|
| DASH-Q IQ2_XXS | 6,76 GB | 7,19 | 12,20 | Apache 2.0 |
| llama.cpp IQ2_XXS (imatrix) | 6,55 GB | 22,77 | 46,24 | Apache 2.0 |
| unsloth UD-IQ2_XXS | 6,75 GB | 22,87 | 44,04 | Apache 2.0 |
| DASH-Q Q2_K_XL | 9,15 GB | 5,58 | 9,56 | Apache 2.0 |
| unsloth UD-Q2_K_XL | 9,29 GB | 6,36 | 10,21 | Apache 2.0 |

Frente al propio modelo base en precision completa (Mistral-Small-3.1-24B-Instruct-2503, ~48 GB en FP16), DASH-Q ocupa entre 5 y 7 veces menos espacio. No se dispone de comparativas con otros modelos de tamano similar (por ejemplo Qwen o Llama de ~24 B) en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; el modelo base hereda los sesgos de sus datos de entrenamiento.
- Riesgo de alucinacion: presente en el modelo base y potencialmente agravado por la cuantizacion de 2 bits, que puede degradar la fidelidad factual.
- Perdida de capacidades por cuantizacion: los 2 bits afectan especialmente a tareas sensibles como tool calling, matematicas y razonamiento de varios pasos; se recomienda validar antes de produccion.
- Sin vision: el tower de vision del modelo base no esta incluido, por lo que este repositorio no sirve para tareas multimodales.
- Idiomas: la lista exacta no esta disponible; el rendimiento en idiomas distintos del ingles puede verse mas degradado por la cuantizacion.
- Licencia: Apache 2.0, permite uso comercial, pero se hereda del modelo base y conviene revisar sus terminos.
- Fecha de creacion inusual (2026): revisar la trazabilidad y procedencia de los pesos antes de usarlos en produccion.
- Autor y descargas bajas: repositorio con 396 descargas y 0 likes; sin garantias de mantenimiento ni validacion independiente de las cifras de perplejidad.
- Contexto largo: aunque el modelo base soporta 128.000 tokens, a 2 bits el contexto util real puede ser menor y la degradacion crece con la longitud.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jkim96/Mistral-Small-3.1-24B-Instruct-2503-DASHQ-Q2-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-3.1-24B-Instruct-2503
- Repositorio DASH-Q: https://github.com/JaeminK/dashq
- Banner DASH-Q: https://raw.githubusercontent.com/JaeminK/dashq/main/assets/dashq_banner.png
