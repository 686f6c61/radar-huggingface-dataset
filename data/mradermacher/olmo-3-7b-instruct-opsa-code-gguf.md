# mradermacher/Olmo-3-7B-Instruct-OPSA-Code-GGUF

## Resumen

Olmo-3-7B-Instruct-OPSA-Code-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario mradermacher a partir del modelo Tuwhy/Olmo-3-7B-Instruct-OPSA-Code, una variante derivada de la familia Olmo 3 de Allen Institute for AI (Ai2). El modelo cuenta con 7.298.011.136 parametros (7,3 B) y esta orientado a la generacion de texto conversacional y de codigo, con licencia Apache 2.0 y soporte declarado unicamente para ingles.

No se trata de un modelo nuevo, sino de una conversion de pesos a GGUF con doce niveles de cuantizacion distintos, desde Q2_K (3,0 GB) hasta f16 (14,7 GB). El objetivo es permitir la ejecucion del modelo en llama.cpp y herramientas compatibles sobre hardware de consumo, algo relevante para equipos que necesitan un 7B de la familia Olmo 3 en local sin depender de APIs externas.

El repositorio se publico el 25 de septiembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones, por lo que no hay evidencia publica de uso en produccion. La documentacion del autor se limita a la lista de cuantizaciones; no incluye detalles sobre el entrenamiento, la longitud de contexto ni los datos de la variante OPSA-Code.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura de la familia Olmo 3); no se detallan variaciones especificas de la variante OPSA-Code |
| Parametros totales | 7.298.011.136 (7,3 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (12 variantes); el modelo base se distribuye en safetensors |
| Modelo base | Tuwhy/Olmo-3-7B-Instruct-OPSA-Code |
| Cuantizado por | mradermacher |
| Tamano del repositorio | 65,1 GB |
| Fecha de publicacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de la variante OPSA-Code mas alla de su pertenencia a la familia Olmo 3, que emplea transformers decoder-only densos. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de ajuste aplicado por el autor de la variante (Tuwhy). El unico dato de entrenamiento que aparece en las fuentes consultadas corresponde a la familia general Olmo 3 Instruct, entrenada en tres etapas: SFT (supervised fine-tuning), DPO (direct preference optimization) y RLVR (reinforcement learning from verifiable rewards), con un flujo completo que incluye preentrenamiento, midtraining y extension de contexto largo.

En cuanto al proceso de cuantizacion, el autor indica que se trata de cuantizaciones estaticas y que no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicacion. Esto implica que, a igualdad de tamano de fichero, los quants de baja precision de este repositorio pueden rendir peor que sus equivalentes generados con imatrix. El autor no descarta generarlas mas adelante y remite a las discusiones de la comunidad para solicitarlas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Generacion y asistencia en tareas de codigo, segun la etiqueta `code` y el propio nombre de la variante.
- Razonamiento e instrucciones generales: la familia Olmo 3 Instruct se describe en las fuentes consultadas como optimizada para matematicas, codigo, seguimiento de instrucciones y conocimiento general.
- Uso de herramientas y function calling: las fuentes de terceros sobre Olmo-3-7B-Instruct mencionan optimizacion para razonamiento y uso de herramientas, aunque no hay confirmacion especifica para esta variante.
- Ejecucion local en CPU y GPU mediante llama.cpp y derivados, gracias al formato GGUF.
- Capacidades multilingues: limitadas a ingles segun la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: con las cuantizaciones Q3_K_S (3,4 GB) o Q4_K_S (4,3 GB) el modelo puede ejecutarse en CPU con llama.cpp, adecuado para prototipos internos de generacion de texto en entornos con recursos limitados.
- Asistente de codigo en el editor: la variante esta orientada a codigo y puede integrarse mediante llama-cpp-python o servidores compatibles con la API de OpenAI para autocompletado y explicacion de fragmentos en ingles.
- Automatizacion de operaciones (ops): el nombre OPSA y las fuentes sobre Olmo 3 lo vinculan a tareas de razonamiento y uso de herramientas, lo que permite construir agentes sencillos que consulten APIs internas y devuelvan respuestas en texto.
- Filtrado y clasificacion de texto tecnico: con Q8_0 (7,9 GB) se obtiene la maxima calidad disponible en el repositorio para tareas de etiquetado, resumen o extraccion de informacion sobre documentacion en ingles.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce niveles distintos del mismo modelo, lo que permite medir de forma controlada la degradacion de calidad entre Q2_K y f16 en una tarea concreta antes de decidir un despliegue.
- Prototipado en portatiles con GPU de gama media: las variantes Q4_K_M (4,6 GB) o Q5_K_M (5,3 GB) caben en GPUs con 8-12 GB de VRAM, lo que permite desarrollar aplicaciones conversacionales sin conexion.
- Entornos con requisitos de soberania del dato: al ser un modelo de pesos abiertos con licencia Apache 2.0, puede desplegarse en infraestructura propia sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye mediciones (MMLU, HumanEval, GSM8K u otras) y las fuentes web consultadas solo ofrecen descripciones cualitativas de la familia Olmo 3 Instruct, sin cifras atribuibles a esta variante concreta. Tampoco se publican datos de latencia o throughput.

## Requisitos de hardware

Estimacion orientativa de VRAM para inferencia, calculada a partir del tamano de cada fichero mas 1-2 GB de margen para cache KV y overhead (el margen crece con contextos largos):

| Cuantizacion | Tamano en disco (GB) | VRAM estimada (GB) | Notas del autor |
|---|---|---|---|
| Q2_K | 3,0 | ~4 | maxima compresion |
| Q3_K_S | 3,4 | ~4,5 | |
| Q3_K_M | 3,8 | ~5 | calidad inferior |
| Q3_K_L | 4,1 | ~5 | |
| IQ4_XS | 4,1 | ~5 | |
| Q4_K_S | 4,3 | ~5,5 | rapido, recomendado |
| Q4_K_M | 4,6 | ~6 | rapido, recomendado |
| Q5_K_S | 5,2 | ~6,5 | |
| Q5_K_M | 5,3 | ~6,5 | |
| Q6_K | 6,1 | ~7,5 | muy buena calidad |
| Q8_0 | 7,9 | ~9 | rapido, mejor calidad |
| f16 | 14,7 | ~16 | 16 bpw, innecesario |

- Cabe en GPU de consumo: si. Las variantes Q4_K_S y Q4_K_M entran en tarjetas con 8 GB de VRAM (RTX 3060 Ti, RTX 4060); las Q5 y Q6 en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070); Q8_0 en 12-16 GB; f16 requiere 16 GB o mas.
- GPU profesionales recomendadas: A100 40 GB, H100, L40S, RTX A6000 para servir varias instancias o contextos largos con las cuantizaciones altas.
- Despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui soportan GGUF de forma nativa. vLLM y TGI trabajan preferentemente con safetensors; su soporte de GGUF es experimental, por lo que para produccion a gran escala conviene usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

Datos de especificaciones publicas de cada modelo; los valores de rendimiento no se incluyen porque no hay benchmarks disponibles para esta variante.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Olmo-3-7B-Instruct-OPSA-Code (GGUF) | 7,3 B | no disponible | Apache 2.0 | GGUF en HuggingFace | no disponible |
| Olmo 3 7B Instruct | 7,3 B (familia) | no disponible en las fuentes consultadas | Apache 2.0 | pesos abiertos en Ai2/HuggingFace | no disponible |
| Qwen2.5-7B-Instruct | 7,6 B | 131.072 tokens | Apache 2.0 | safetensors y GGUF en HuggingFace | no disponible |
| Llama 3.1 8B Instruct | 8,0 B | 128.000 tokens | Llama 3.1 Community License | safetensors y GGUF en HuggingFace | no disponible |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.000 tokens | Apache 2.0 | safetensors y GGUF en HuggingFace | no disponible |

La diferencia principal frente a las alternativas es la licencia Apache 2.0 sin clausulas adicionales (frente a la licencia comunitaria de Llama 3.1) y la disponibilidad de doce niveles de cuantizacion ya generados. La falta de datos de contexto y de benchmarks impide comparar el rendimiento real con Qwen2.5 o Llama 3.1.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles. El uso en castellano no esta validado y probablemente degrade la calidad.
- Contexto desconocido: no se publica la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos.
- Cuantizaciones estaticas: el autor confirma que no hay quants ponderados ni imatrix, por lo que las variantes de baja precision (Q2_K, Q3_K_S) sufren una perdida de calidad mayor de lo habitual en ese rango de tamano.
- Riesgo de alucinacion: inherente a un modelo de 7 B; no hay evaluaciones publicadas de fidelidad factual para esta variante.
- Sesgos: no hay informacion sobre la composicion del dataset de la variante OPSA-Code ni sobre evaluaciones de sesgo.
- Trazabilidad limitada: la variante procede de un autor distinto a Ai2 (Tuwhy) y su proceso de ajuste no esta documentado en las fuentes disponibles. El identificador arXiv citado en la model card (2608.31046) no se ha podido verificar.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base y los datos de ajuste no anadan restricciones no declaradas.
- Madurez: cero descargas y cero valoraciones en el momento de la publicacion; no existe evidencia de uso en produccion ni de estabilidad en servicios de larga duracion.
- Contexto de la familia frente a la variante: las capacidades de razonamiento, matematicas y uso de herramientas que citan las fuentes corresponden a Olmo 3 Instruct en general, no necesariamente a esta variante concreta.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Olmo-3-7B-Instruct-OPSA-Code-GGUF
- Modelo base: https://huggingface.co/Tuwhy/Olmo-3-7B-Instruct-OPSA-Code
- Repositorio GGUF relacionado (sin la etiqueta Code): https://huggingface.co/mradermacher/Olmo-3-7B-Instruct-OPSA-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Olmo-3-7B-Instruct-OPSA-Code-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Referencia arXiv citada en la model card: arxiv:2608.31046
- Olmo de Ai2 (flujo de modelos): https://allenai.org/olmo
- nethype GmbH: https://www.nethype.de/
- Ficha de Olmo 3 7B Instruct en local-ai-zone: https://local-ai-zone.github.io/models/olmo-3-7b-instruct.html
- Ficha de Olmo 3 7B Instruct en llm.co: https://llm.co/llms/olmo-3-7b-instruct
- Ficha de Olmo-3-7B-Instruct en dev.co: https://dev.co/ai/llms/olmo-3-7b-instruct
