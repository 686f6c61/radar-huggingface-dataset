# HughieHu/DR-Pixel-Trained

## Resumen

DR Pixel Trained es un modelo vision-lenguaje (image-text-to-text) desarrollado por HughieHu (Tiansheng Hu y colaboradores) que parte de Qwen3.6-27B y lo afina mediante LoRA para una tarea muy concreta: responder preguntas sobre articulos cientificos buscando y leyendo directamente las paginas renderizadas de los PDF, sin extraccion de texto intermedia. Es el modelo entrenado que acompana al articulo "DR Pixel: Page-Native Deep Research with Vision-Language Models" y se evalua sobre el benchmark DRPixelBench, publicado por los mismos autores.

El modelo resuelve el problema del "deep research" sobre documentos visuales: en lugar de depender de pipelines OCR o de parseo de PDF (que pierden tablas, figuras y maquetacion), el modelo opera sobre las imagenes de las paginas, combinando busqueda agentica con lectura visual. Con 27.356 millones de parametros, un contexto de 131.072 tokens y pesos en bf16, esta pensado para despliegues con servidores compatibles con OpenAI como vLLM o SGLang.

Su relevancia ahora es doble: por un lado, demuestra que un fine-tune LoRA relativamente ligero sobre un modelo base abierto puede especializarse en retrieval visual de documentos cientificos; por otro, libera tanto los pesos fusionados como el adaptador LoRA, lo que permite reproducir el entrenamiento o reutilizar el adaptador sobre Qwen3.6-27B. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3.6-27B base, tag `qwen3_5`), con adaptador LoRA fusionado |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (12 shards, bf16) + adaptador LoRA en `adapter/` |
| Tamano del repo | 55,7 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.6-27B |
| Metodo de ajuste | LoRA (rank 32, alpha 64, todas las capas lineales del modelo de lenguaje) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.6-27B, un transformer multimodal que procesa conjuntamente imagenes de paginas y texto. Sobre esa base se aplico un ajuste LoRA en todas las capas lineales del modelo de lenguaje, con rango 32 y alpha 64. El entrenamiento consistio en una epoca con tasa de aprendizaje 1e-4, tamano de lote efectivo de 16 y longitud maxima de 131.072 tokens. Los pesos del repositorio principal tienen el adaptador ya fusionado, por lo que se sirven como cualquier checkpoint de Qwen3.6-27B; el directorio `adapter/` contiene el adaptador aislado para cargarlo con PEFT o continuar el entrenamiento.

La innovacion tecnica central es el uso de "counterfactual credit reweighting": los datos de entrenamiento son 2.496 trayectorias generadas por GPT-5.4 (directorio `train/` del dataset `HughieHu/drpixel-bench`), y a cada paso se le asigna un peso de perdida derivado de credito contrafactual, con un peso constante de 1,5 sobre la respuesta final. El objetivo es que el modelo aprenda que acciones de busqueda y que paginas consultadas contribuyen realmente a la respuesta correcta, en lugar de imitar ciegamente la trayectoria completa. El enfoque es "page-native": el modelo busca y lee paginas renderizadas, sin etapa de extraccion de texto.

## Capacidades

- Generacion de texto y razonamiento sobre contenido cientifico y documental.
- Comprension de imagenes de paginas renderizadas (documentos visuales), incluyendo maquetacion, tablas y figuras.
- Busqueda agentica multi-paso (agentic retrieval): el modelo decide que buscar, consulta un servicio de busqueda de paginas y lee los resultados.
- Investigacion profunda (deep research) sobre articulos cientificos: localizacion de evidencia en paginas concretas y sintesis de respuestas.
- Soporte de tool calling a traves del servidor de busqueda (`SEARCH_URL`) en el harness de evaluacion.
- Conversacion multi-turno con contexto largo (hasta 131.072 tokens).
- Capacidad multilingue limitada al ingles segun la model card.
- No se documentan capacidades de audio ni modos de "thinking" explicitos en la informacion disponible.

## Casos de uso

- Revision bibliografica asistida: el modelo recibe las paginas renderizadas de un conjunto de papers y responde preguntas concretas ("que metrica reporta la Tabla 3 del paper X") localizando la evidencia visualmente, lo que evita errores de parseo de tablas y figuras.
- Extraccion de resultados experimentales: dado un PDF como imagenes, el modelo puede leer tablas de resultados y devolver valores estructurados, util para construir bases de datos de benchmarks cientificos.
- Busqueda agentica sobre corpus de documentos: integrado con un servicio de busqueda de paginas (como el endpoint hospedado en Modal del harness), el modelo planifica consultas, recupera paginas relevantes y sintetiza respuestas con contexto de hasta 131k tokens.
- Asistente de lectura para investigadores: conversaciones multi-turno sobre un paper o un conjunto de papers, con seguimiento de referencias cruzadas entre secciones y figuras.
- Evaluacion y benchmarking de sistemas de deep research: el checkpoint sirve como referencia reproducible sobre DRPixelBench usando el harness oficial (`drbench.eval --config Page`).
- Fine-tuning posterior: el adaptador LoRA en `adapter/` permite reentrenar sobre dominios distintos (por ejemplo, documentacion legal o financiera) sin partir del modelo completo, gracias a su rango 32 y compatibilidad con PEFT.
- Despliegue en pipelines internos de analisis documental: al servirse como cualquier Qwen3.6-27B en vLLM o SGLang con API compatible con OpenAI, se integra en flujos existentes de procesamiento de documentos visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card remite al benchmark DRPixelBench y al harness de evaluacion (`github.com/HughieHu/DRPixel`, directorio `eval/`), pero no incluye cifras de MMLU, HumanEval, GSM8K ni de DRPixelBench en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 55 GB solo para pesos (27,36 B parametros x 2 bytes), mas overhead de KV cache para contexto de 131.072 tokens; en la practica requiere GPUs de 80 GB o multi-GPU.
- Cuantizacion: la model card no publica versiones cuantizadas; no se dispone de estimaciones oficiales para 8 bits o 4 bits. Una cuantizacion a 8 bits rondaria los 27-28 GB de pesos y a 4 bits unos 14-15 GB, pero son calculos teoricos no verificados por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bf16 con contexto completo. No cabe en GPUs de consumo (RTX 4090 de 24 GB) en bf16.
- Opciones de despliegue: vLLM o SGLang como servidores compatibles con OpenAI (recomendado por el autor con contexto de 131.072 tokens); el adaptador `adapter/` se puede cargar con PEFT sobre el modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DR Pixel Trained | 27,36 B | 131.072 | Vision-lenguaje especializado en retrieval visual de papers | Apache 2.0 | Hugging Face (39 descargas) |
| Qwen/Qwen3.6-27B (base) | 27 B (aprox.) | no disponible en la informacion | Modelo multimodal generalista | no disponible en la informacion | Hugging Face |
| Alternativas de deep research visual | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con otros sistemas de deep research visual no puede completarse con los datos proporcionados: no se dispone de especificaciones de modelos comparables de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste esta orientado a preguntas sobre articulos cientificos con retrieval visual; su rendimiento en tareas generales puede diferir del modelo base y no se documenta.
- Idioma: la model card declara solo ingles; el rendimiento en castellano u otros idiomas no esta evaluado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas no respaldadas por las paginas consultadas; el diseno contrafactual mitiga pero no elimina este riesgo.
- Dependencia de infraestructura externa: el flujo de evaluacion requiere un servicio de busqueda de paginas (`SEARCH_URL`) y un servidor compatible con OpenAI; sin ellos el modelo no ejecuta la busqueda agentica.
- Datos de entrenamiento: las trayectorias fueron generadas por GPT-5.4 y siguen sujetas a los terminos de ese modelo, aunque los pesos se liberan bajo Apache 2.0.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.6-27B y de los datos de entrenamiento antes de un despliegue en produccion.
- Madurez: 39 descargas y 0 likes en el momento de la consulta; ecosistema y validacion externa muy limitados.
- Coste de inferencia: contexto de 131k tokens y pesos bf16 implican requisitos de memoria elevados; no hay versiones cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HughieHu/DR-Pixel-Trained
- Dataset de entrenamiento y benchmark: https://huggingface.co/datasets/HughieHu/drpixel-bench
- Repositorio del proyecto (harness de evaluacion y receta de entrenamiento): https://github.com/HughieHu/DRPixel
- Receta de entrenamiento: https://github.com/HughieHu/DRPixel/blob/main/train/README.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Servicio de busqueda de paginas del harness: https://drpixel--drpixel-search-gate.us-east.modal.run
