# mradermacher/Muse-Glimmer-30B-Fable-Distill-i1-GGUF

## Resumen

Muse-Glimmer-30B-Fable-Distill-i1-GGUF es una cuantización GGUF del modelo Muse-Glimmer-30B-Fable-Distill, creada por mradermacher. El modelo base es una destilación de Muse Glimmer, un modelo abierto de Meta diseñado para agentes autónomos en hardware de consumo. Muse Glimmer es un modelo denso multimodal (texto e imágenes) de aproximadamente 29,6 mil millones de parámetros, con licencia Apache 2.0, optimizado para tool-calling, razonamiento y tareas de larga duración. Esta versión GGUF permite ejecutar el modelo en entornos locales con recursos limitados, manteniendo las capacidades del modelo original mediante cuantización con matriz de importancia (imatrix).

La cuantización i1-Q2_K reduce el tamaño a 10,8 GB, lo que lo hace viable en GPUs de consumo con 12-16 GB de VRAM. El modelo soporta siete idiomas (inglés, español, francés, alemán, portugués, japonés y chino) y está pensado para aplicaciones agénticas, como asistentes personales, automatización de tareas y análisis multimodal. Su relevancia radica en ofrecer una alternativa de código abierto y ejecutable localmente a modelos propietarios más grandes, con un equilibrio entre rendimiento y requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense multimodal causal language model con encoder de percepcion (vision) |
| Parametros totales | 27.854.794.240 (aproximadamente 27,85B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K (10,8 GB) y archivo imatrix; otros quants (Q2_K, IQ3_M, Q4_K_S, etc.) en el repositorio estatico |
| Idiomas soportados | en, es, fr, de, pt, ja, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B-Fable-Distill es una destilacion de Muse Glimmer, que a su vez deriva de Muse Spark. Segun la documentacion de NVIDIA, se trata de un modelo denso multimodal con un encoder de percepcion dedicado, disenado para tareas agénticas en hardware de consumo. No se dispone de detalles especificos sobre el numero de tokens de entrenamiento, la composicion del dataset o el uso de tecnicas como RLHF o DPO en la informacion proporcionada. La destilacion implica que el modelo ha sido entrenado para imitar el comportamiento de un modelo mas grande, probablemente con un enfoque en eficiencia y capacidad de ejecucion local.

La cuantizacion GGUF realizada por mradermacher utiliza imatrix (matriz de importancia) para optimizar la precision de los pesos cuantizados, lo que suele mejorar la calidad respecto a cuantizaciones estaticas. El archivo i1-Q2_K es una cuantizacion de 2 bits con mejoras, disenada para minimizar la perdida de rendimiento en tareas de razonamiento y generacion.

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de texto e imagenes, con salida de razonamiento separada.
- Tool calling / function calling nativo: puede invocar herramientas externas, lo que lo hace adecuado para agentes autonomos.
- Soporte para agentes y tareas de larga duracion: disenado para ejecutar flujos de trabajo complejos con recuperacion de errores.
- Multilingue: soporta ingles, español, frances, aleman, portugues, japones y chino.
- Razonamiento multi-step: capaz de descomponer problemas complejos en pasos intermedios.
- Vision: procesamiento de imagenes para tareas como descripcion, analisis o extraccion de informacion.

## Casos de uso

- Asistentes personales locales: el modelo puede gestionar conversaciones multi-turno, recordar contexto y ejecutar acciones mediante tool calling, todo en un dispositivo con GPU de consumo.
- Automatizacion de tareas de oficina: integrado en un agente que lea documentos (texto e imagenes), extraiga datos y genere informes, gracias a su capacidad multimodal y de razonamiento.
- Atencion al cliente automatizada: puede manejar consultas en varios idiomas, derivar a herramientas externas (CRM, bases de conocimiento) y mantener el hilo de la conversacion.
- Generacion de codigo asistida: con tool calling, puede interactuar con repositorios, ejecutar pruebas y corregir errores en pipelines de CI/CD.
- Analisis de imagenes medicas o tecnicas: al aceptar entradas visuales, puede describir radiografias, diagramas o fotografias y generar informes textuales.
- Agente de investigacion: capaz de buscar informacion en la web (via herramientas), resumir articulos y responder preguntas complejas en varios idiomas.
- Traduccion y localizacion: soporta siete idiomas, lo que permite traduccion automatica con contexto y matices culturales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras metricas para este modelo o su version cuantizada.

## Requisitos de hardware

- VRAM estimada: el archivo i1-Q2_K ocupa 10,8 GB, por lo que se necesita al menos 12 GB de VRAM para cargarlo en GPU. Para mayor calidad (por ejemplo, Q4_K_M) se requeririan 16-20 GB.
- GPU recomendadas: RTX 3060 12GB, RTX 4070, RTX 4090, o GPUs de datacenter como A10 o A100 (para versiones de mayor precision).
- Compatibilidad con consumer GPU: si, con cuantizaciones Q2_K o Q3_K en GPUs de 12-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. Tambien se puede convertir a otros formatos para vLLM o TGI, aunque no es directo.
- Latencia y throughput: no disponible, pero al ser un modelo de ~28B cuantizado, se espera una velocidad de 10-20 tokens/s en una RTX 4090 con Q2_K, dependiendo del contexto y la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-Fable-Distill (GGUF) | 27,85B | No disponible | Apache 2.0 | GGUF | Multimodal, agéntico, tool-calling |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | GGUF, safetensors | Menor capacidad, no multimodal nativo |
| Qwen 2.5 32B | 32B | 128K | Apache 2.0 | GGUF, safetensors | Multilingue, tool-calling, no vision |
| Mistral Small 24B | 24B | 32K | Apache 2.0 | GGUF, safetensors | Razonamiento, no vision |

No se dispone de datos de rendimiento comparativo. La eleccion depende de las necesidades: Muse-Glimmer destaca por su multimodalidad y enfoque agéntico, mientras que Qwen 2.5 32B ofrece mayor contexto y soporte multilingue sin vision.

## Limitaciones y advertencias

- La cuantizacion i1-Q2_K puede degradar la calidad de generacion y razonamiento en comparacion con el modelo original en precision completa.
- No se han publicado evaluaciones de sesgos o alucinaciones para este modelo especifico; como cualquier LLM, puede generar contenido incorrecto o inventado.
- La longitud de contexto no esta documentada; se recomienda probar con cargas de trabajo reales para evitar desbordamientos.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base puede tener restricciones adicionales no especificadas en la informacion disponible.
- El soporte de vision requiere el archivo mmproj, que no esta incluido en este repositorio (se encuentra en el repositorio estatico).
- Para produccion, es necesario validar el comportamiento en tareas especificas y considerar la posibilidad de usar cuantizaciones de mayor precision si la calidad es critica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Fable-Distill-i1-GGUF
- Modelo base: https://huggingface.co/armand0e/Muse-Glimmer-30B-Fable-Distill
- Repositorio estatico de quants: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Fable-Distill-GGUF
- Pagina de Muse Glimmer en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
