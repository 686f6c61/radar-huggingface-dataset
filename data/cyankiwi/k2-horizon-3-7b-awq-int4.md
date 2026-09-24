# cyankiwi/K2-Horizon-3.7B-AWQ-INT4

## Resumen

K2-Horizon-3.7B es un modelo de lenguaje denso, decoder-only, desarrollado por IFM (International Foundation Models) y presentado como el miembro pequeno de la familia K2-Horizon. La ficha que nos ocupa, `cyankiwi/K2-Horizon-3.7B-AWQ-INT4`, es una cuantizacion AWQ de 4 bits publicada por el usuario cyankiwi sobre el checkpoint base `IFM/K2-Horizon-3.7B`. Su rasgo mas distintivo es una ventana de contexto nativa de 524.288 tokens (512K), fijada a partir de las etapas de midtraining, algo poco habitual en la franja de modelos de ~3-4B.

El modelo se distribuye con el objetivo declarado de ser "completamente abierto": datos de preentrenamiento y midtraining publicos, receta y codigo de entrenamiento accesibles, asi como checkpoints intermedios para estudiar la evolucion de capacidades a lo largo del entrenamiento. Esta pensado para tareas de generacion de texto, codigo, razonamiento y flujos agenticos, y se evalua contra otros modelos densos abiertos de tamano similar.

Esta version concreta aplica cuantizacion AWQ INT4 con calibracion sobre un dataset de contenido STEM y agentico (`cyankiwi/calibration`). Conviene senalar una discrepancia relevante entre el branding ("3.7B") y el recuento real de parametros reportado por los metadatos safetensors del repositorio, que asciende a 1.887.951.864 parametros (~1,89B). El repositorio ocupa 4,8 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (arquitectura `k2_horizon`, requiere `custom_code` en transformers) |
| Parametros totales | 3,7B segun branding; 1.887.951.864 (~1,89B) segun metadatos safetensors del repo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K) nativos desde las etapas de midtraining |
| Tipos de cuantizacion | AWQ INT4 (esta version), formato `compressed-tensors` |
| Idiomas soportados | Tags de HuggingFace: `en`. La model card lista EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizado, `compressed-tensors`); `custom_code` |

## Arquitectura y entrenamiento

K2-Horizon-3.7B es un transformer decoder-only denso, sin mezcla de expertos, integrado en una familia con arquitectura propia (`k2_horizon`) que exige cargar codigo personalizado desde el repositorio (`custom_code`). El modelo parte de un nucleo de ~3,7B de parametros nominales y extiende su ventana de contexto hasta 524.288 tokens de forma nativa a partir de las fases de midtraining, en lugar de recurrir a extrapolacion posterior. La cuantizacion AWQ INT4 de esta ficha se calibro sobre un conjunto concreto de datos STEM y agenticos, lo que sugiere un sesgo deliberado hacia preservar rendimiento en tareas tecnicas y de uso agentico.

En cuanto al entrenamiento, la model card indica el uso de dos datasets publicos: `IFM/K2-Horizon-Pretrain-Data` y `IFM/K2-Horizon-Midtrain-Data`. El autor declara que la receta, el codigo de entrenamiento, los recursos de evaluacion y los checkpoints intermedios son publicos, lo que permite reproducir y estudiar la progresion de capacidades. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en el marco de un modelo decoder-only especializado en dialogo (tag `conversational`).
- Razonamiento y resolucion de tareas evaluadas en benchmarks de razonamiento segun la model card.
- Generacion de codigo, incluida en el conjunto de benchmarks agenticos y de programacion reportados por el autor.
- Flujos agenticos y tareas de varios pasos, segun las evaluaciones agenticas mencionadas.
- Capacidad multilingue: la model card lista EN, ZH, HI, AR, RU, JA, KO, NL, FR y ES, aunque el metadata de HuggingFace solo declara `en`.
- Ventana de contexto de 512K tokens, apta para documentos y conversaciones muy extensas.
- Pesos abiertos con posibilidad de ajuste fino, al publicarse bajo Apache 2.0.
- Soporte de `tool calling` / `function calling`: no disponible explicitamente en la informacion proporcionada.
- Modo `thinking` explicito, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios y documentacion extensa: con 512K tokens de contexto puede ingerir codebases enteros o manuales tecnicos y responder preguntas sobre ellos sin trocear el material.
- Asistencia de programacion en produccion: generacion y refactorizacion de codigo en un modelo de ~3-4B cuantizado, desplegable en hardware modesto y con licencia Apache 2.0 apta para integracion comercial.
- Agentes de automatizacion de tareas: al haberse evaluado en benchmarks agenticos, encaja en pipelines de varios pasos donde el modelo planifica y ejecuta acciones encadenadas.
- Atencion al cliente multilingue: aunque el metadata solo declara ingles, la model card lista diez idiomas, lo que permite desplegarlo en soporte automatizado multi-idioma con contexto largo de historial de conversacion.
- Procesamiento de documentos legales o cientificos: la ventana de 512K permite resumir y extraer informacion de contratos, articulos o informes extensos en una sola pasada.
- Preprocesado en pipelines RAG: como modelo pequeno y cuantizado puede actuar como reranker, generador de resumenes o compresor de contexto antes de un modelo mayor.
- Entornos con recursos limitados: por su tamano y cuantizacion INT4 es candidato para despliegue en una unica GPU de consumo, sirviendo como copiloto local sin dependencia de la nube.
- Investigacion sobre entrenamiento abierto: al publicarse checkpoints intermedios, sirve para estudiar como emergen capacidades a lo largo del entrenamiento en modelos densos de esta escala.

## Benchmarks y rendimiento

La model card incluye una grafica de resultados y una tabla comparativa, pero en la informacion proporcionada no se incluyen las cifras numericas (la tabla aparece truncada). No se han facilitado valores concretos de MMLU, HumanEval, GSM8K ni de otros benchmarks, por lo que no se reproducen numeros. Los modelos de referencia usados en la comparativa del autor son:

| Modelo | Parametros |
|---|---|
| K2-Horizon-3.7B | 3,7B |
| Qwen3.5-4B | 4B |
| G9v3-3B | 3B |
| Granite 4.2-3B | 3B |
| Nemotron 3 Nano-4B | 4B |

No se han publicado resultados de benchmarks con cifras en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (esta version AWQ INT4): el repositorio ocupa 4,8 GB, por lo que el peso del modelo cabe en aproximadamente 5-6 GB de VRAM; a ello hay que sumar la cache KV, que con contexto de 512K puede crecer muy por encima del peso del modelo.
- GPU recomendadas: para contexto corto-medio, una RTX 3090 o RTX 4090 (24 GB) es suficiente; para explotar la ventana de 512K conviene una A100 (40/80 GB) o H100, dado el coste de la cache KV.
- Cabe en GPU de consumo: si, para contextos moderados cabe en GPUs de 8-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4080) gracias a la cuantizacion INT4; los contextos de cientos de miles de tokens excederan esa VRAM.
- Opciones de despliegue: al ser un modelo AWQ en formato `compressed-tensors` y con `custom_code`, el despliegue se orienta a vLLM y a transformadores con kernels AWQ; la compatibilidad con llama.cpp/Ollama no esta confirmada en la informacion disponible. TGI no esta confirmado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/Disponibilidad |
|---|---|---|---|---|
| K2-Horizon-3.7B (esta ficha, AWQ INT4) | 3,7B nominal / ~1,89B en safetensors | 512K | Apache 2.0 | safetensors, AWQ INT4 |
| Qwen3.5-4B | 4B | no disponible | no disponible | no disponible |
| G9v3-3B | 3B | no disponible | no disponible | no disponible |
| Granite 4.2-3B | 3B | no disponible | no disponible | no disponible |
| Nemotron 3 Nano-4B | 4B | no disponible | no disponible | no disponible |

La informacion proporcionada solo ofrece los recuentos de parametros de los modelos de referencia (tomados de la tabla comparativa del autor). No se dispone de datos de contexto, licencia ni rendimiento de esos modelos, por lo que la comparativa queda limitada a la escala.

## Limitaciones y advertencias

- Discrepancia de parametros: el branding indica "3.7B" mientras que los metadatos safetensors del repositorio reportan 1.887.951.864 parametros (~1,89B). Conviene verificarlo antes de dimensionar el despliegue.
- Riesgo de alucinacion: no se documenta en la informacion disponible ningun mecanismo especifico de mitigacion; como todo LLM de esta escala, es propenso a generar contenido incorrecto con seguridad.
- Sesgos: no se proporciona informacion sobre sesgos conocidos ni sobre la composicion demografica o linguistica de los datos de entrenamiento.
- Limitacion idiomatica: el metadata de HuggingFace declara unicamente `en`; aunque la model card lista diez idiomas, no se aportan metricas de calidad por idioma, por lo que el rendimiento fuera del ingles es incierto.
- Contexto largo: aunque se anuncia una ventana de 512K, no se aportan resultados de evaluacion (tipo RULER o similares) sobre la calidad de recuperacion en contextos largos.
- Dependencia de `custom_code`: el modelo exige cargar codigo personalizado desde el repositorio, lo que anade superficie de riesgo en entornos de produccion y complica su uso en frameworks que no ejecutan codigo remoto.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor original (IFM) es quien define las condiciones del modelo base; conviene revisar tambien la licencia de `IFM/K2-Horizon-3.7B`.
- Adopcion: el repositorio registra 0 descargas y 0 likes, por lo que no existe una comunidad de usuarios que haya validado su comportamiento en produccion.
- Fechas: la ficha aparece creada y actualizada en 2026, dato a tener en cuenta para situarla respecto a alternativas.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/cyankiwi/K2-Horizon-3.7B-AWQ-INT4
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Dataset de calibracion de la cuantizacion: https://huggingface.co/datasets/cyankiwi/calibration
- Contacto del autor de la cuantizacion: ton@cyan.kiwi
