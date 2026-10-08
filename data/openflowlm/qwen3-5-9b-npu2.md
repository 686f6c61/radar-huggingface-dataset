# OpenFlowLM/Qwen3.5-9B-NPU2

## Resumen

OpenFlowLM/Qwen3.5-9B-NPU2 es un derivado del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario OpenFlowLM bajo licencia Apache 2.0. Se distribuye en formato Hugging Face Transformers con la etiqueta de pipeline image-text-to-text, lo que indica que acepta entradas de imagen y texto y genera texto. El repositorio ocupa 8,7 GB y declara explicitamente el modelo base Qwen/Qwen3.5-9B con la relacion base_model:finetune, es decir, se trata de un ajuste posterior (fine-tune) sobre los pesos originales de Qwen, no de un entrenamiento desde cero.

El modelo hereda la arquitectura de la familia Qwen3.5: un transformer causal con encoder de vision que combina capas de Gated DeltaNet (atencion lineal) con capas de Gated Attention clasica, e incorpora prediccion multi-token (MTP). El modelo base declara 9.000 millones de parametros, dimension oculta de 4096, 32 capas y una ventana de contexto de 262.144 tokens nativos, extensible hasta 1.010.000 tokens. Qwen presenta esta generacion como un salto en eficiencia arquitectonica y en cobertura linguistica, con soporte declarado de 201 idiomas y dialectos.

La relevancia practica de este repositorio concreto es limitada por el momento: no tiene descargas ni likes, su model card reproduce integramente la del modelo base y no documenta que cambios introduce el fine-tune ni que significa el sufijo NPU2. El sufijo y la existencia de un repositorio homonimo en la organizacion FastFlowLM apuntan a una variante orientada a ejecucion en NPU (unidades de procesamiento neuronal, tipicamente integradas en SoC de PC), pero esto es una inferencia a partir del nombre y no un dato confirmado por la documentacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de vision; capas intercaladas de Gated DeltaNet (atencion lineal) y Gated Attention, mas FFN. La model card del modelo base menciona tambien MoE disperso como parte de la arquitectura hibrida |
| Parametros totales | 9B (dato del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en este repositorio; el modelo base declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato Hugging Face Transformers (repositorio de 8,7 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina dos mecanismos de atencion en un patron repetido: 8 bloques, cada uno compuesto por 3 subcapas de (Gated DeltaNet seguido de FFN) y 1 subcapa de (Gated Attention seguido de FFN). En total, 32 capas. La Gated DeltaNet emplea 32 cabezas de atencion lineal para V y 16 para QK, con dimension de cabeza 128; la Gated Attention emplea 16 cabezas para Q y 4 para KV, con dimension de cabeza 256 y dimension de Rotary Position Embedding de 64. La dimension oculta es 4096 y la dimension intermedia del FFN es 12288. El vocabulario de entrada y la salida del modelo tienen 248.320 entradas con padding. El modelo se entreno con prediccion multi-token (MTP) de varios pasos, un mecanismo que suele aprovecharse para decodificacion especulativa. La model card del modelo base tambien menciona el uso de Gated Delta Networks combinadas con Mixture-of-Experts disperso para lograr inferencia de alto rendimiento, aunque no se detalla el numero de expertos ni los parametros activos de la variante de 9B.

En cuanto al entrenamiento, la informacion disponible describe el proceso del modelo base: preentrenamiento multimodelo con fusion temprana de tokens de imagen y texto, seguido de post-entrenamiento, y un escalado de reinforcement learning sobre entornos con millones de agentes y distribuciones de tareas progresivamente mas complejas. La model card afirma una eficiencia de entrenamiento multimodal cercana al 100% respecto al entrenamiento solo de texto. No se dispone de informacion sobre el numero de tokens, la composicion del dataset, ni sobre si el fine-tune de OpenFlowLM aplico RLHF, DPO u otra tecnica. Tampoco se documenta la receta de ajuste, el dataset utilizado ni el procedimiento de optimizacion para NPU que sugiere el nombre del repositorio.

## Capacidades

- Generacion de texto conversacional y razonamiento de proposito general, con paridad declarada frente a Qwen3 en benchmarks de razonamiento.
- Comprension de imagenes: el pipeline declarado es image-text-to-text y el modelo base incorpora un encoder de vision con fusion temprana de tokens multimodales.
- Generacion y comprension de codigo, con rendimiento declarado por encima de los modelos Qwen3-VL en benchmarks de codigo y agentes.
- Razonamiento matematico y tareas STEM, segun la categoria Knowledge & STEM de los benchmarks publicados.
- Capacidades de agente y razonamiento multi-paso, reforzadas mediante RL sobre entornos multiagente.
- Soporte multilingue amplio a nivel de modelo base: 201 idiomas y dialectos declarados.
- Prediccion multi-token (MTP) entrenada con varios pasos, aprovechable para decodificacion especulativa.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.

## Casos de uso

- Digitalizacion y analisis de documentos: el modelo acepta imagenes ademas de texto, por lo que puede extraer informacion de facturas, formularios, capturas de pantalla o informes escaneados y responder preguntas sobre ellos combinando la lectura visual con razonamiento en texto.
- Atencion al cliente multilingue: con 201 idiomas declarados en el modelo base y una ventana de 262.144 tokens, puede mantener conversaciones multi-turno con historial largo y clientes de distintas regiones sin cambiar de modelo.
- Asistentes sobre corpus extensos: la extension a 1.010.000 tokens permite cargar expedientes, contratos o documentacion tecnica completa y hacer preguntas transversales sin trocear el contenido en fragmentos, lo que reduce la perdida de contexto entre fragmentos.
- Generacion y revision de codigo en produccion: puede integrarse en pipelines de CI/CD para revisar diffs, generar pruebas o explicar cambios; la model card del modelo base declara compatibilidad con vLLM, SGLang y KTransformers, lo que facilita el despliegue como servicio interno.
- Automatizacion de flujos con agentes: al estar entrenado con RL sobre tareas multiagente, es adecuado para orquestar cadenas de acciones con herramientas externas, siempre que se valide el soporte real de tool calling en el tokenizador y plantilla de chat concretos.
- Educacion y tutoria STEM: con los resultados declarados en MMLU-Pro y MMLU-Redux, puede resolver y explicar problemas de matematicas, fisica o informatica a nivel universitario y generar ejercicios de refuerzo.
- Analisis de imagenes en entornos industriales o comerciales: inspeccion asistida de fotografias de producto, catalogacion visual con descripcion textual, o generacion de informes a partir de capturas de paneles de control.
- Ejecucion local en equipos con NPU: el sufijo NPU2 del repositorio sugiere una variante optimizada para aceleracion en NPU de PC, lo que encaja con escenarios de privacidad estricta donde los datos no pueden salir del dispositivo. Esta interpretacion no esta confirmada por la documentacion disponible.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla comparativa de la que la informacion recuperada solo conserva dos filas completas. Los datos disponibles son los siguientes:

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible (dato truncado en la informacion recuperada) | no disponible (dato truncado) |

No se han publicado en la informacion disponible resultados de HumanEval, GSM8K, MMLU clasico ni de otras categorias (codigo, agentes, vision). La model card del modelo base hace referencia a una figura con resultados de benchmarks adicionales y a un blog post, pero los valores numericos no estan incluidos en el material proporcionado. No se dispone de ningun benchmark especifico del fine-tune OpenFlowLM/Qwen3.5-9B-NPU2, ni de mediciones de latencia o throughput de esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como referencia calculada a partir del numero de parametros, 9B en bf16 ocupa aproximadamente 18 GB solo en pesos, mas la cache KV; en cuantizacion de 8 bits serian unos 9-10 GB y en 4 bits unos 5-6 GB. Estas cifras son estimaciones derivadas del tamano, no mediciones publicadas.
- Tamano del repositorio: 8,7 GB, inferior a lo esperado para 9B en bf16, lo que apunta a que los pesos se almacenan en una precision reducida o parcialmente cuantizados. El tipo exacto de cuantizacion no se especifica.
- GPU recomendadas: para bf16 completo, GPU de 24 GB o mas (RTX 4090, L40S, A100 40 GB, H100). Para 8 bits, RTX 4080 o RTX 3090. Para 4 bits, tarjetas de 8-12 GB como RTX 3060 12 GB o portatiles con GPU dedicada. Estas recomendaciones son estimaciones, no datos del repositorio.
- Cabe en GPU de consumo: si, siempre que se use una cuantizacion adecuada al VRAM disponible. Con el contexto completo de 262.144 tokens, la cache KV crece de forma considerable y puede requerir GPU de datacenter o tecnicas de offloading, aunque la atencion lineal de las capas Gated DeltaNet reduce el coste frente a un transformer de atencion completa.
- Opciones de despliegue: la model card del modelo base declara compatibilidad con Hugging Face Transformers, vLLM, SGLang y KTransformers. Los resultados de busqueda muestran una entrada en la libreria de Ollama para qwen3.5:9b. No hay confirmacion de soporte en llama.cpp, TGI ni en el runtime FastFlowLM para esta variante concreta.
- Aceleracion en NPU: el nombre del repositorio (NPU2) y la existencia de FastFlowLM/Qwen3.5-9B-NPU2 apuntan a un uso previsto sobre NPU. No se especifican requisitos de hardware, drivers ni versiones de runtime.
- Latencia y throughput: no disponibles. La model card del modelo base solo afirma de forma cualitativa "high-throughput inference with minimal latency and cost overhead", sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B (base) | 9B | 262.144 nativos, hasta 1.010.000 | 82,5 | apache-2.0 | Hugging Face, Ollama |
| OpenFlowLM/Qwen3.5-9B-NPU2 | 9B (heredados) | no disponible en este repositorio | no disponible | apache-2.0 | Hugging Face |
| Qwen3.5-4B | 4B | no disponible | 79,1 | no disponible en la informacion | Hugging Face |
| Qwen3-30BA3B-Thinking-2507 | 30B totales, 3B activos (segun nomenclatura) | no disponible | 80,9 | no disponible en la informacion | Hugging Face |
| Qwen3-Next-80B-A3B-Thinking | 80B totales, 3B activos (segun nomenclatura) | no disponible | 82,7 | no disponible en la informacion | Hugging Face |
| GPT-OSS-20B | 20B | no disponible | 74,8 | no disponible en la informacion | no disponible |
| GPT-OSS-120B | 120B | no disponible | 80,8 | no disponible en la informacion | no disponible |

La comparativa se limita a los datos recuperados. El aspecto mas destacable es que Qwen3.5-9B, con 9.000 millones de parametros, iguala o supera en MMLU-Pro a modelos con muchas mas parametros totales, como GPT-OSS-120B y Qwen3-Next-80B-A3B-Thinking, lo que la model card atribuye a la eficiencia de la arquitectura hibrida.

## Limitaciones y advertencias

- Validacion inexistente: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma marca temporal, sin historial posterior. No hay evidencia de que el fine-tune mejore al modelo base ni de que este correctamente validado.
- Documentacion ausente: la model card del repositorio reproduce la del modelo base Qwen/Qwen3.5-9B y no describe que cambios introduce OpenFlowLM, que datos se usaron en el ajuste ni que significa exactamente NPU2. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- Riesgo de alucinacion: es un modelo generativo de 9B sin mecanismos de verificacion factual documentados; puede producir afirmaciones plausibles pero incorrectas, especialmente en dominios especializados y con contexto muy largo.
- Sesgos: no se han publicado evaluaciones de sesgo, toxicidad o equidad para esta variante ni para el modelo base en la informacion disponible.
- Limitaciones de idioma: aunque el modelo base declara 201 idiomas, no hay datos de rendimiento por idioma y el ajuste de OpenFlowLM puede haber alterado el equilibrio linguistico original. El castellano no tiene evaluacion especifica publicada.
- Compatibilidad de plantilla: al ser un fine-tune, la plantilla de chat y el tokenizador pueden diferir de los del modelo base; conviene verificar el formato antes de desplegarlo con vLLM, SGLang u Ollama.
- Restricciones de licencia: la licencia declarada es apache-2.0, que permite uso comercial, pero la propia model card enlaza a la licencia del modelo base en https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE. Conviene revisar ambos textos antes de un despliegue comercial y confirmar que el fine-tune no introduce terminos adicionales.
- Longitud de contexto real: los 262.144 tokens nativos y la extension a 1.010.000 son datos del modelo base. No hay confirmacion de que el fine-tune conserve esa capacidad, ni mediciones de degradacion en contextos largos.
- Coste de memoria en contexto largo: aunque la atencion lineal reduce el crecimiento de la cache KV, contextos de cientos de miles de tokens siguen siendo exigentes en memoria y pueden degradar el throughput.
- Soporte de tool calling: no confirmado en la informacion disponible; si el caso de uso depende de function calling, debe probarse explicitamente.
- Fechas de publicacion: el repositorio figura con fecha de creacion 2026-10-08, posterior a la mayoria de referencias de la familia; conviene comprobar la vigencia de los enlaces y del blog asociado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/OpenFlowLM/Qwen3.5-9B-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Repositorio homonimo en FastFlowLM: https://huggingface.co/FastFlowLM/Qwen3.5-9B-NPU2
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
- Entrada en la libreria de Ollama: https://ollama.com/library/qwen3.5:9b
- Tutorial de despliegue local: https://aiindigo.com/tutorials/getting-started-with-qwen3-5-9b-local-multimodal-ai
- Guia de ejecucion local con Ollama: https://www.rushis.com/the-simple-guide-to-running-qwen-3-5-9b-locally-with-ollama/
