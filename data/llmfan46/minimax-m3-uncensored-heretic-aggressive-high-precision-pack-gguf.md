# llmfan46/MiniMax-M3-uncensored-heretic-aggressive-high-precision-pack-GGUF

## Resumen

MiniMax-M3-uncensored-heretic-aggressive-high-precision-pack-GGUF es una cuantizacion en formato GGUF de un derivado "abliterated" del modelo multimodal MiniMax-M3 de MiniMaxAI. El autor de la cuantizacion y del proceso de abliteracion es llmfan46, un contribuidor independiente que publica versiones sin censura de modelos populares mediante la herramienta Heretic v1.2.0 y el metodo Arbitrary-Rank Ablation (ARA). El modelo original MiniMax-M3 es un transformer de tipo Mixture of Experts (MoE) con capacidades multimodales (image-text-to-text, video) y orientado a tareas de agente y generacion de codigo, con 426.174.572.928 parametros totales segun los pesos en safetensors del modelo base.

El objetivo de esta version es reducir drásticamente las tasas de rechazo del modelo original (de 98/100 a 8/100 en una evaluacion interna de 100 prompts) preservando al mismo tiempo la calidad general, medida como una divergencia KL de 0,0258 respecto al modelo original. Para ello se aplica una ablacion selectiva sobre componentes de atencion (attn.o_proj) en las capas 14 a 51, con pesos concretos de preservacion y correccion de comportamiento.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo MoE de gran escala (mas de 426.000 millones de parametros), capacidades multimodales con soporte de video, y un proceso de "decensura" documentado con parametros reproducibles. El paquete incluye cuantizaciones BF16, Q8_0 y Q6_K, ademas de un proyector de vision separado en BF16 necesario para las capacidades multimodales. El repositorio ocupa 1.658,7 GB y acumula 303 descargas y 10 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) multimodal |
| Parametros totales | 426.174.572.928 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K (mas proyector de vision en BF16) |
| Idiomas soportados | no disponible |
| Licencia | minimax-community (license: other) |
| Formato de pesos | GGUF (con mmproj GGUF para vision) |

## Arquitectura y entrenamiento

El modelo base MiniMax-M3 es un transformer de tipo Mixture of Experts con capacidades multimodales, segun las etiquetas del repositorio (moe, multimodal, image-text-to-text, video). No se dispone en la informacion proporcionada de detalles sobre el numero de expertos, la proporcion de parametros activos por token, la longitud de contexto nativa ni el volumen y composicion del dataset de entrenamiento. Tampoco se documenta si el modelo original empleo RLHF, DPO u otras tecnicas de alineacion.

La innovacion tecnica destacable de esta ficha no esta en la arquitectura del modelo original, sino en el proceso de modificacion de pesos. Se aplica Heretic v1.2.0 con el metodo Arbitrary-Rank Ablation (ARA) sobre las capas 14 a 51, actuando exclusivamente sobre `attn.o_proj`. Los parametros de ablacion documentados son: `start_layer_index` 14, `end_layer_index` 51, `preserve_good_behavior_weight` 0,0847, `steer_bad_behavior_weight` 0,0002, `overcorrect_relative_weight` 1,1741 y `neighbor_count` 15. El resultado declarado es una reduccion de rechazos del 92 % (de 98/100 a 8/100) con una divergencia KL de 0,0258 frente al modelo original, lo que indica una alteracion relativamente contenida de la distribucion de salida.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento y resolucion de problemas (etiqueta "agent" en el modelo base).
- Generacion de codigo (etiqueta "coding").
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Procesamiento de video (etiqueta "video").
- Capacidades de agente y razonamiento multi-paso (etiqueta "agent").
- Comportamiento "uncensored"/"abliterated": reduce rechazos y respuestas evasivas frente al modelo original.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y censura: el modelo permite estudiar empiricamente el efecto de la ablacion de direcciones de comportamiento sobre un MoE de gran escala, con parametros de ablacion reproducibles y una metrica de divergencia KL declarada (0,0258).
- Analisis de contenido sensible en entornos controlados: para equipos que necesitan procesar material que el modelo original rechazaria sistematicamente (literatura, guiones, analisis de discurso), la reduccion de rechazos de 98/100 a 8/100 facilita la cobertura completa del material.
- Procesamiento de documentos con imagenes: gracias al pipeline image-text-to-text y al proyector de vision en BF16, puede emplearse para extraccion y descripcion de contenido en documentos escaneados o capturas.
- Analisis de video: la etiqueta "video" del modelo base sugiere capacidad de comprension de secuencias visuales, util para resumen o indexacion de material audiovisual.
- Generacion de codigo en pipelines internos: la etiqueta "coding" y el enfoque "agent" permiten integrarlo en flujos de asistencia a desarrollo, siempre que la infraestructura soporte el tamano del modelo.
- Despliegue local con llama.cpp, LM Studio u Ollama: las cuantizaciones Q8_0 y Q6_K permiten ejecutar el modelo en entornos GGUF compatibles, aunque el volumen de parametros exige hardware de gama muy alta.
- Experimentacion con agentes autonomos: la combinacion de etiquetas "agent" y "moe" lo hace candidato para prototipos de agentes multi-paso, con la advertencia de que no se documentan detalles de tool calling.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la informacion disponible son los del proceso de abliteracion, no benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Este modelo | Modelo original (MiniMaxAI/MiniMax-M3) |
|---|---|---|
| Divergencia KL | 0,0258 | 0 (por definicion) |
| Tasa de rechazos | 8/100 | 98/100 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 426.174.572.928 parametros totales, incluso en Q6_K el modelo requiere del orden de cientos de gigabytes de memoria; en BF16 supera los 800 GB solo en pesos. No es viable en una unica GPU convencional.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el despliegue realista exige nodos multi-GPU (varias A100/H100) o configuraciones con memoria unificada de gran capacidad.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090, 3090, etc.) en ninguna de las cuantizaciones ofrecidas.
- Opciones de despliegue: llama.cpp, LM Studio y Ollama segun la model card; el formato GGUF tambien es compatible con otros runners GGUF. Para vision es obligatorio cargar ademas el fichero `MiniMax-M3-uncensored-heretic-aggressive-mmproj-BF16.gguf`.
- Latencia y throughput: no disponible en la informacion proporcionada. El repositorio completo ocupa 1.658,7 GB, lo que condiciona tambien los requisitos de almacenamiento.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (MiniMax-M3-uncensored-heretic-aggressive GGUF) | 426.174.572.928 | no disponible | minimax-community | GGUF | Version abliterated, 8/100 rechazos, KL 0,0258 |
| MiniMaxAI/MiniMax-M3 | 426.174.572.928 (segun base) | no disponible | minimax-community | safetensors (original) | Modelo original, 98/100 rechazos |
| llmfan46/MiniMax-M3-uncensored-heretic-aggressive | no disponible | no disponible | no disponible | safetensors | Modelo base de esta cuantizacion, misma ablacion |

No se dispone en la informacion proporcionada de datos de benchmarks que permitan comparar el rendimiento de capacidad con alternativas de la misma categoria; la comparativa se limita a parametros, licencia y estado de censura.

## Limitaciones y advertencias

- La ablacion altera el comportamiento del modelo de forma deliberada; la divergencia KL de 0,0258, aunque baja, implica cambios en la distribucion de salida que pueden afectar a tareas sensibles a la calibracion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo generico de los modelos de gran escala y no se documenta una evaluacion especifica tras la ablacion.
- El proceso de decensura no garantiza la ausencia de contenido problematico ni lo hace apto para todos los contextos; la reduccion de rechazos puede facilitar la generacion de contenido danino si no se aplican salvaguardas externas.
- Licencia `minimax-community` (license: other): las condiciones exactas de uso comercial no estan detalladas en la informacion proporcionada; debe consultarse el fichero LICENSE del repositorio antes de cualquier despliegue en produccion.
- Idiomas soportados: no disponible; no se puede confirmar el rendimiento multilingue.
- Longitud de contexto: no disponible; limita la planificacion de casos de uso con documentos largos.
- Requisitos de hardware extremos: el modelo no es desplegable en GPUs de consumo y exige infraestructura multi-GPU o memoria unificada de gran capacidad, lo que restringe su uso a entornos con recursos significativos.
- El repositorio depende de un proyector de vision separado; omitirlo desactiva las capacidades multimodales.
- La model card incluye un aviso del autor sobre haber alcanzado el limite de almacenamiento gratuito de Hugging Face, lo que puede afectar a la disponibilidad futura de artefactos.
- El resultado de busqueda web proporcionado no contiene informacion tecnica relevante sobre el modelo y no se ha utilizado como fuente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/llmfan46/MiniMax-M3-uncensored-heretic-aggressive-high-precision-pack-GGUF
- Modelo base de la cuantizacion: https://huggingface.co/llmfan46/MiniMax-M3-uncensored-heretic-aggressive
- Modelo original: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- Pull request del metodo ARA: https://github.com/p-e-w/heretic/pull/211
- Paper arXiv: https://arxiv.org/abs/2606.13392
- Repositorio GitHub de MiniMax-M3: https://github.com/MiniMax-AI/MiniMax-M3
- Web de MiniMax: https://www.minimax.io
- Documentacion de API: https://platform.minimax.io/docs/guides/text-generation
- MiniMax Agent: https://agent.minimax.io/
- Organizacion en ModelScope: https://modelscope.cn/organization/minimax
- Discord de MiniMax: https://discord.com/invite/DPC4AHFCBw
- Ko-fi del autor: https://ko-fi.com/llmfan46
