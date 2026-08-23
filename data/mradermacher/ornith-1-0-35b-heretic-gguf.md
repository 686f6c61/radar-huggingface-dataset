# mradermacher/Ornith-1.0-35B-heretic-GGUF

## Resumen

Ornith-1.0-35B-heretic-GGUF es una cuantizacion GGUF del modelo Ornith-1.0-35B-abliterix, preparada por mradermacher para su uso con llama.cpp, Ollama y otros runtime compatibles con GGUF. El modelo original, desarrollado por DeepReinforce AI y publicado como inkOrCloud/Ornith-1.0-35B-abliterix, es un modelo de codificacion agente basado en Qwen3.5 con arquitectura MoE, 34.660 millones de parametros y una ventana de contexto de 262.144 tokens (256K). La variante "abliterix" elimina los rechazos del modelo mediante abliteration, y la variante "heretic" mezcla un LoRA experimental (Heretic 1.4.0 Trial 63) en pesos BF16.

La relevancia de esta ficha radica en que ofrece una version cuantizada lista para usar en hardware de consumo, con un unico archivo Q4_K_S de 20 GB que cabe en GPUs de 24 GB. Es un modelo orientado a agentes y codigo, con soporte de herramienta y razonamiento multi-paso, pensado para desarrolladores que quieren ejecutar un MoE de 35B sin necesidad de un nodo multi-GPU. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.5 |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_S (20.0 GB) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

Ornith-1.0-35B es un modelo de tipo Mixture-of-Experts derivado de Qwen3.5. La arquitectura MoE permite activar solo un subconjunto de los parametros por token, lo que reduce el coste computacional por inferencia en comparacion con un modelo denso de igual tamano. El modelo original expone una interfaz compatible con OpenAI y soporta una ventana de contexto de 262144 tokens, lo que lo hace adecuado para tareas de razonamiento largo y uso agencioso. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso de alineacion (RLHF, DPO, etc.).

La version "abliterix" aplica una tecnica de abliteration que elimina los rechazos del modelo, dejando una salida sin filtros de seguridad. La variante "Heretic" fusiona el LoRA experimental Heretic 1.4.0 Trial 63 en los pesos BF16, lo que modifica el comportamiento del modelo en tareas de codigo y razonamiento agencioso. La cuantizacion GGUF fue realizada por mradermacher con el tipo Q4_K_S, que mantiene un buen equilibrio entre calidad y velocidad.

## Capacidades

- Generacion de texto y razonamiento multi-paso en ingles y chino.
- Soporte de tool calling y function calling, apto para pipelines de agentes.
- Capacidades de codigo agencioso: planificacion, ejecucion de tareas multi-paso y uso de herramientas.
- Ventana de contexto de 262144 tokens, adecuada para documentos extensos y conversaciones largas.
- Interfaz compatible con OpenAI, lo que facilita su integracion en aplicaciones existentes.
- Version sin rechazos (ablitered), apta para escenarios donde se requiere una salida sin censura previa.

## Casos de uso

- Asistente de codigo en produccion: el modelo puede integrarse en un IDE o CLI para generar y revisar codigo, usando su ventana de 256K para mantener el contexto de repositorios grandes. Su soporte de tool calling permite conectarlo a un sistema de archivos o a un runner de tests.
- Agente de automatizacion de tareas: con su capacidad de razonamiento multi-paso y de llamada a funciones, se puede usar para orquestar workflows (por ejemplo, crear una issue, escribir un parche, ejecutar tests y actualizar la documentacion).
- Analisis de documentos extensos: la ventana de 262144 tokens permite procesar contratos, papers o informes completos en una sola pasada, extrayendo resumenes o respondiendo preguntas sobre el contenido.
- Chat de soporte tecnico en ingles y chino: el modelo puede gestionar conversaciones multi-turno con contexto largo, resolviendo dudas de usuarios sobre software o productos.
- Prototipado de agentes de razonamiento: ideal para experimentar con agentes que necesitan planificar y ejecutar pasos intermedios (web search, calculo, acceso a APIs) sin un modelo propietario.
- Modelo de investigacion para estudios de abliteration: la version "heretic" es util para investigar el efecto de LoRAs experimentales sobre el comportamiento de un MoE de 35B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras pruebas comparativas para esta variante concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_S ocupa 20.0 GB, por lo que se necesita al menos una GPU con 24 GB de VRAM para cargar el modelo sin offload. Con cuantizacion a 8 bits de activaciones o con offloading parcial a CPU, se puede ejecutar en tarjetas con 16 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A5000 (24 GB), o GPUs profesionales de 32 GB o mas.
- En consumer GPU: si cabe en una RTX 3090 o 4090 con cuantizacion Q4_K_S, pero con limitaciones de velocidad por el alto numero de parametros activos y la arquitectura MoE.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier backend que soporte GGUF. Para uso en servidor se puede usar llama.cpp-server o convertir a otro formato.
- Latencia y throughput estimados: no disponible. El rendimiento dependera de la GPU y del numero de parametros activos, que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ornith-1.0-35B-heretic-GGUF (este) | MoE (Qwen3.5) | 35B | 256K | Apache 2.0 | GGUF |
| Qwen3-32B (MoE) | MoE | 32B | 128K | Apache 2.0 | safetensors/GGUF |
| DeepSeek-V3 (MoE) | MoE | 671B totales | 128K | MIT | safetensors/GGUF |

La comparativa es estructural: Ornith-1.0-35B comparte la base Qwen3.5 con otros modelos de la familia, pero no se dispone de datos de rendimiento para una comparacion cuantitativa. DeepSeek-V3 es un modelo MoE mucho mayor y no es comparable en requisitos de hardware. Qwen3-32B-MoE es la alternativa mas cercana en tamano y arquitectura, pero Ornith-1.0-35B ofrece un contexto de 256K frente a los 128K de Qwen3-32B-MoE.

## Limitaciones y advertencias

- La version "abliterix" ha sido sometida a abliteration, lo que elimina los rechazos y puede producir contenido inapropiado, ofensivo o ilegal. No es apta para entornos de produccion sin filtros adicionales.
- La variante "Heretic" es experimental, basada en un LoRA de prueba (Trial 63), por lo que su comportamiento puede ser inconsistente en comparacion con el modelo base.
- No se han publicado benchmarks de rendimiento para esta variante, por lo que no se puede garantizar su calidad en tareas de codigo o razonamiento.
- El modelo solo soporta ingles y chino; no se recomienda para otros idiomas.
- La cuantizacion Q4_K_M es una cuantizacion estatica, no optimizada con imatrix, lo que puede reducir la calidad frente a cuantizaciones con imatrix.
- La licencia Apache 2.0 permite uso comercial, pero el uso de la variante "ablitered" puede tener implicaciones legales o de cumplimiento en entornos corporativos.
- La ventana de 256K tokens puede provocar un alto consumo de memoria en inferencia; se recomienda probar con contextos mas cortos si se usa hardware limitado.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Ornith-1.0-35B-heretic-GGUF
- Modelo base (abliterix): https://huggingface.co/inkOrCloud/Ornith-1.0-35B-abliterix
- Repositorio del modelo Ornith-1: https://github.com/ornith-ai/Ornith-1
- Repositorio de la variante heretic: https://github.com/thanet-s/Ornith-1.0-35B-heretic
- Guia de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/model_requests
- Pagina de descargas alternativa: https://hf.tst.eu/model#Ornith-1.0-35B-heretic-GGUF
