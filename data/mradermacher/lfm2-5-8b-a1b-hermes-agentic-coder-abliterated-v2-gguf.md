# mradermacher/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-GGUF

## Resumen

LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-GGUF es una recuantización en formato GGUF, publicada por el usuario mradermacher, del modelo DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2. Se trata de un modelo derivado de la familia Liquid Foundation Model (LFM) de Liquid AI, con 8.467.856.832 parámetros totales (8,47 mil millones) y una arquitectura de mezcla de expertos (MoE), tal como indican las etiquetas del repositorio y el sufijo A1B del nombre, que apunta a aproximadamente 1.000 millones de parámetros activos por token.

El modelo está orientado a dos tareas principales: uso agéntico con function calling y generación de código. Las etiquetas del repositorio (hermes, agentic, function-calling, evalplus, reasoning, system2) sugieren un ajuste fino sobre datos y formatos de tipo Hermes para tool calling, junto con un entrenamiento orientado a razonamiento en varios pasos y a evaluación de código. La mención "abliterated" indica que se ha aplicado una técnica de ablación de direcciones de rechazo para eliminar total o parcialmente los mecanismos de rechazo del modelo original.

La relevancia de esta ficha concreta es práctica: el repositorio de mradermacher ofrece versiones cuantizadas del modelo original, que presumiblemente se distribuye en safetensors, para poder ejecutarlo en llama.cpp y otros runners compatibles con GGUF, incluso en hardware de consumo. El repositorio ocupa 34,0 GB y tiene una licencia comunitaria de Liquid AI, lo que condiciona su uso comercial. La información pública disponible sobre el modelo base es muy limitada: no se detallan en la información proporcionada ni la longitud de contexto, ni el dataset de entrenamiento, ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, segun etiquetas del repositorio; detalles internos no disponibles |
| Parametros totales | 8.467.856.832 (8,47 mil millones) |
| Parametros activos | Aproximadamente 1.000 millones, inferido del sufijo A1B del nombre; cifra exacta no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (los archivos publicados con tamano declarado son Q2_K, Q4_K_S, Q8_0 y F16) |
| Idiomas soportados | Ingles (en) |
| Licencia | liquid-foundation-model-community-license (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF en este repositorio; safetensors en el modelo base segun la libreria declarada (transformers) |

## Arquitectura y entrenamiento

La informacion proporcionada no incluye la model card del modelo base, por lo que no se dispone de detalles sobre la arquitectura interna mas alla de lo que indican las etiquetas: arquitectura de mezcla de expertos (moe), perteneciente a la familia Liquid Foundation Model de Liquid AI, con 8,47 mil millones de parametros totales y un subconjunto activo por token del orden de 1.000 millones segun el sufijo A1B del nombre. No se especifica el numero de expertos, el numero de capas, el tipo de atencion ni si se emplean componentes de estado recurrente o hibridos, algo habitual en la familia LFM.

Respecto al entrenamiento, las etiquetas hermes, agentic, function-calling, evalplus y system2 sugieren un ajuste fino orientado a uso agéntico con llamadas a funciones, siguiendo el formato de conversacion y herramientas popularizado por las colecciones Hermes, y un entrenamiento especifico para razonamiento en varios pasos y tareas de codigo evaluables tipo EvalPlus. No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineacion. La designacion "abliterated" implica un postprocesado de ablacion de direcciones de rechazo, orientado a reducir la tasa de negativas del modelo, aunque tampoco se documenta el metodo ni el grado de ablacion aplicado.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat.
- Generacion y completado de codigo, con etiquetas explicitas de coding y code.
- Uso de herramientas y function calling, con etiqueta explicita function-calling y orientacion al formato Hermes.
- Comportamiento agéntico y razonamiento multi-paso, segun las etiquetas agentic y system2.
- Razonamiento orientado a evaluacion de codigo (etiqueta evalplus), lo que sugiere entrenamiento sobre problemas de programacion verificables.
- Modelo sin censura o con censura reducida (abliterated), lo que implica una menor tasa de rechazos ante peticiones que el modelo original rechazaria.
- Capacidades multimodales: no disponible. Las etiquetas no incluyen vision ni audio, y el repositorio no publica archivo mmproj.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede encadenar pasos de razonamiento y emitir llamadas a funciones en formato Hermes para interactuar con herramientas (ejecutores de tests, linters, gestores de repositorios) dentro de un bucle agéntico.
- Integracion en IDE o extension de editor: por su tamano activo reducido, puede servir como motor de autocompletado y refactorizacion asistida en local, sin enviar codigo a servicios externos.
- Generacion de tests unitarios en pipelines de CI: dado su enfoque hacia codigo evaluable, encaja en flujos que generan casos de prueba para modulos existentes y verifican los resultados con el propio runner de tests.
- Revision automatizada de pull requests: con soporte de tool calling, puede consultar el diff, leer archivos relacionados y publicar comentarios estructurados sobre posibles errores o mejoras de estilo.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_S (5,0 GB) y Q8_0 (9,1 GB) permiten ejecutar el modelo en equipos con 8-12 GB de VRAM o incluso en CPU con llama.cpp, algo relevante para entornos con requisitos de privacidad.
- Investigacion sobre alineacion y seguridad: al ser una variante abliterated, resulta util para estudiar el efecto de la ablacion de direcciones de rechazo sobre el comportamiento del modelo, comparando respuestas frente al modelo base no ablacionado.
- Prototipado de asistentes conversacionales en ingles: para demos y pruebas de concepto donde se prioriza coste bajo y ejecucion local sobre calidad puntera de modelo frontera.
- Experimentacion con arquitecturas MoE de parametros activos bajos: sirve como banco de pruebas para medir latencia y throughput reales de un MoE de 8,47B totales y ~1B activos en hardware diverso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del cuantizador no incluye tabla de evaluaciones, y la busqueda web asociada no ha devuelto resultados relacionados con el modelo, por lo que no se pueden aportar cifras de MMLU, HumanEval, GSM8K ni de EvalPlus para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada de los tamanos de archivo publicados, sin contar cache KV ni overhead del runtime): Q2_K ~3,3 GB; Q4_K_S ~5,0 GB; Q8_0 ~9,1 GB; F16 ~17,0 GB. A estas cifras hay que sumar la cache KV, cuyo tamano depende del contexto configurado, no disponible en la informacion proporcionada.
- Al ser un MoE con aproximadamente 1.000 millones de parametros activos, el coste computacional por token es mas bajo que el de un modelo denso de 8,47B, aunque el modelo completo debe residir en memoria.
- GPU de consumo: las cuantizaciones Q2_K y Q4_K_S caben con holgura en GPUs de 8 GB (RTX 3060 Ti, RTX 4060) y de 12 GB (RTX 3060 12 GB, RTX 4070). Q8_0 requiere aproximadamente 10-12 GB de VRAM y encaja en RTX 4080/4090 o en GPUs con 16 GB o mas, dependiendo del contexto.
- GPU de datacenter: A100, H100, L40S o similares pueden ejecutar el modelo en F16 o Q8_0 con margen para contextos largos y lotes grandes.
- CPU: las cuantizaciones Q2_K y Q4_K_S permiten inferencia en CPU con llama.cpp u Ollama, con rendimiento dependiente del numero de nucleos y del ancho de banda de memoria; no se dispone de cifras de tokens por segundo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF para este repositorio; vLLM, Text Generation Inference o Transformers para el modelo base en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de las alternativas proceden de conocimiento publico general y no se han verificado en la busqueda realizada; se marcan como referencia. No hay datos de rendimiento comparativo disponibles para el modelo de esta ficha.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2 (esta ficha) | 8,47B | ~1B (inferido del sufijo A1B) | no disponible | liquid-foundation-model-community-license | GGUF (safetensors en el base) |
| Qwen2.5-Coder-7B (referencia) | 7,6B | Densos | 32.768 tokens | Apache 2.0 | safetensors, GGUF |
| Llama-3.1-8B-Instruct (referencia) | 8,03B | Densos | 128.000 tokens | Llama 3.1 Community License | safetensors, GGUF |
| DeepSeek-Coder-V2-Lite (referencia) | 16B | 2,4B | 128.000 tokens | DeepSeek License | safetensors, GGUF |

Diferencias cualitativas destacables: frente a los tres modelos de referencia, el modelo de esta ficha es el unico con postprocesado de ablacion de rechazos y el unico distribuido en este repositorio exclusivamente en GGUF. Su licencia comunitaria es mas restrictiva que la Apache 2.0 de Qwen2.5-Coder y que las licencias de Llama y DeepSeek en lo relativo a uso comercial, a falta de consultar el texto completo de la licencia de Liquid AI.

## Limitaciones y advertencias

- Modelo abliterated: la ablacion de direcciones de rechazo elimina o reduce los mecanismos de seguridad del modelo original. Puede generar contenido que el modelo base rechazaria y no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Idiomas: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Alucinacion: no hay datos de evaluacion de fidelidad; en tareas de codigo y tool calling el riesgo de inventar APIs, nombres de funciones o parametros es relevante y requiere validacion externa.
- Codigo generado: debe revisarse y ejecutarse en un entorno aislado antes de integrarlo en produccion; un modelo abliterated no filtrara peticiones de codigo potencialmente malicioso.
- Licencia: liquid-foundation-model-community-license, con enlace a https://www.liquid.ai/community-license. Es una licencia "other" y no una licencia open source estandar, por lo que hay que revisar las condiciones de uso comercial y de redistribucion antes de desplegarlo.
- Cuantizaciones de baja precision: Q2_K y Q3_K degradan la calidad de forma apreciable; el propio cuantizador recomienda Q4_K_S y advierte de que el F16 es "overkill" para este tamano.
- Modelo derivado de terceros: se trata de una recuantizacion no oficial. El autor original del ajuste fino es DuoNeural, y el modelo base a su vez deriva de la familia LFM de Liquid AI; no hay garantia de soporte ni de mantenimiento.
- Sin datos de contexto: al desconocerse la ventana de contexto del modelo base, no se puede garantizar el comportamiento en conversaciones de contexto largo ni en agentes con historial extenso.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: la adopcion y la validacion comunitaria son practicamente inexistentes, lo que aumenta el riesgo de problemas no documentados.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-GGUF
- Modelo base: https://huggingface.co/DuoNeural/LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2
- Pagina resumen del cuantizador para este modelo: https://hf.tst.eu/model#LFM2.5-8B-A1B-Hermes-Agentic-Coder-Abliterated-v2-GGUF
- Licencia comunitaria de Liquid AI: https://www.liquid.ai/community-license
- Guia de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
