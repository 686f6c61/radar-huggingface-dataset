# francesca9805/isl-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/isl-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/isl_latn_100mb`, un transformer decoder-only de tipo GPT-2 con 124.770.816 parámetros (aproximadamente 125 millones). Lo publica el usuario de HuggingFace francesca9805, aparentemente en el contexto de un proyecto de investigación sobre tokenizadores de la Universidad de Groninga (los registros de entrenamiento apuntan al proyecto de Weights & Biases `f-padovani-university-of-groningen/new-tokenizers`). El modelo se ha entrenado con SFT (supervised fine-tuning) mediante la librería TRL, partiendo de un checkpoint preentrenado en islandés.

El problema que aborda es el de la experimentación reproducible con modelos de lenguaje de bajo recurso para el islandés, un idioma con muy pocos recursos digitales en comparación con el inglés. El nombre del repositorio codifica el experimento: un corpus empaquetado (*packed*) de 10 MB con una semilla fija (`seed3407`), lo que sugiere que forma parte de una batería de ablaciones para medir el efecto del empaquetado de datos, el tamaño del corpus y la semilla de inicialización sobre el ajuste fino. No se trata, por tanto, de un modelo orientado a producción, sino a investigación comparativa.

Su relevancia actual es limitada pero concreta: sirve como punto de referencia reproducible para estudiar cómo afectan las decisiones de preprocesado al rendimiento de modelos pequeños en idiomas de bajos recursos. Con 125 millones de parámetros y un repositorio de 0,3 GB, es un modelo que cabe en cualquier GPU de consumo e incluso puede ejecutarse en CPU, lo que lo hace útil para experimentación rápida y de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (etiqueta `gpt2` en el repositorio) |
| Parametros totales | 124.770.816 (aproximadamente 125 M) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible (la arquitectura GPT-2 de referencia emplea habitualmente 1024 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | No publicados por el autor. Los pesos estan en `safetensors`, por lo que son convertibles a GGUF y a cuantizaciones de 8 y 4 bits con herramientas estandar |
| Idiomas soportados | Islandes (`isl_latn`) segun el modelo base; no confirmado explicitamente en la model card |
| Licencia | No disponible: la model card declara `licence: license` sin especificar terminos |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal completa, normalizacion por capas previa y embeddings posicionales aprendidos. El checkpoint base, `goldfish-models/isl_latn_100mb`, pertenece a la familia Goldfish, un conjunto de modelos monoidiomaticos entrenados con corpus de aproximadamente 100 MB por idioma, disenados especificamente para investigacion en lenguas de bajos recursos. Con 124,77 millones de parametros, el modelo se situa en el rango de GPT-2 small (124 M), lo que implica que no dispone de atencion lineal, decodificacion especulativa ni mecanismos de atencion eficiente.

El ajuste fino se realizo con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, usando SFT (aprendizaje supervisado sobre pares instruccion-respuesta o sobre texto empaquetado, segun el nombre del experimento). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO; la unica senal es el sufijo del nombre, que apunta a un corpus empaquetado de 10 MB y a una semilla fija (3407). Los registros completos del entrenamiento estan publicados en Weights & Biases bajo el proyecto `new-tokenizers`, lo que sugiere que la innovacion tecnica del experimento no reside en la arquitectura sino en el pipeline de tokenizacion y empaquetado de datos.

## Capacidades

- Generacion de texto autoregresiva en islandes, orientada a continuacion de textos y respuestas cortas.
- Seguimiento basico de instrucciones en formato conversacional, ya que el ejemplo de la model card pasa una lista de mensajes con rol `user` al pipeline: `generator([{"role": "user", "content": question}], ...)`.
- Redaccion asistida y parafraseo de fragmentos breves en islandes.
- Capacidad limitada de razonamiento y de conocimiento factual: con 125 M de parametros y un corpus base de 100 MB, el conocimiento almacenado es muy reducido.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso planificado ni modo de pensamiento (*thinking mode*).
- No dispone de vision, audio ni modalidades adicionales: es un modelo exclusivamente de texto.
- Capacidades multilingues no confirmadas; el modelo esta especializado en un unico idioma (islandes).

## Casos de uso

- Investigacion sobre empaquetado de datos: el modelo forma parte de una serie de ejecuciones con corpus empaquetado y semillas fijas, por lo que sirve como punto de comparacion reproducible frente a otros checkpoints de la misma serie para medir el efecto del *packing* en la perdida de validacion y en la calidad generativa.
- Ablaciones sobre tokenizadores en islandes: dado que el proyecto de W&B se llama `new-tokenizers`, este checkpoint es adecuado como linea base para comparar vocabularios y estrategias de segmentacion en una lengua morfologicamente rica.
- Generacion de datos sinteticos para aumento de corpus: con 125 M de parametros puede generar texto islandes de forma masiva y barata en GPU de consumo, util para preentrenar o aumentar corpus de idiomas con pocos recursos, siempre que se filtre la calidad.
- Prototipado de aplicaciones de texto en islandes: autocompletado, continuacion de parrafos o generacion de borradores en un entorno de demostracion, con coste computacional minimo y posibilidad de ejecutarse en CPU.
- Chatbot experimental de dominio muy cerrado: al haber recibido SFT en formato conversacional, puede mantener turnos cortos si se le restringe a un dominio acotado y se acepta una calidad inferior a la de modelos mucho mayores.
- Docencia y practicas de ajuste fino: por su tamano (0,3 GB de repositorio y 125 M de parametros) es un candidato idoneo para ensenar pipelines de TRL, evaluacion y despliegue sin necesidad de infraestructura especializada.
- Despliegue en dispositivos con recursos muy limitados: al ocupar menos de 1 GB en precision completa, puede ejecutarse en una Raspberry Pi o en un portatil sin GPU para tareas de generacion por lotes no interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y los resultados de la busqueda web no aportan datos sobre este modelo. Unicamente se dispone del enlace a la ejecucion de entrenamiento en Weights & Biases, que podria contener curvas de perdida, pero no cifras de evaluacion reproducidas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB en FP32 (124,77 M de parametros x 4 bytes), unos 250 MB en FP16/BF16, unos 125 MB en cuantizacion de 8 bits y entre 65 y 70 MB en 4 bits. A esto hay que sumar el cache KV, que es minimo con ventanas de contexto de 1024 tokens.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3060, una RTX 4090 o una GTX 1650 cubren el modelo con enorme margen; las GPU de datacenter (A100, H100) solo tienen sentido para servir muchas peticiones concurrentes en lote.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo de los ultimos diez anos y tambien en CPU.
- Opciones de despliegue: transformers (`pipeline("text-generation", ...)`, tal como indica la model card), Text Generation Inference (TGI), vLLM y, previa conversion a GGUF, llama.cpp y Ollama. El repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con los endpoints gestionados de HuggingFace.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/isl-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407 | 124,77 M | No disponible | Islandes | No disponible | HuggingFace |
| goldfish-models/isl_latn_100mb (modelo base) | No disponible (familia de ~100 MB de corpus) | No disponible | Islandes | No disponible | HuggingFace |
| Otros modelos de la familia Goldfish por idioma | No disponible | No disponible | Multiples idiomas de bajos recursos | No disponible | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas alternativas, ya que ninguna de las fichas consultadas publica resultados de benchmarks. La comparacion se limita, por tanto, a parametros estructurales y disponibilidad. Cualquier modelo GPT-2 small de 124 M parametros entrenado en otro idioma seria un comparable razonable en terminos de coste computacional, pero no se ha verificado ninguno en la informacion disponible.

## Limitaciones y advertencias

- Alucinacion: con 125 M de parametros y un corpus base de 100 MB, la probabilidad de generar afirmaciones factualmente incorrectas con apariencia de verosimilitud es alta. No debe usarse como fuente de informacion factual.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos. El corpus de entrenamiento islandes de 100 MB procede con toda probabilidad de fuentes web, con los sesgos de representacion que ello implica.
- Limitacion idiomatica severa: el modelo esta especializado en islandes. Su rendimiento en castellano, ingles u otros idiomas sera muy pobre, y la model card no declara oficialmente ningun idioma soportado.
- Longitud de contexto: no confirmada. Si sigue la configuracion estandar de GPT-2, el limite estaria en 1024 tokens, insuficiente para documentos largos o conversaciones extensas.
- Licencia sin especificar: la model card declara `licence: license`, un marcador de posicion sin terminos reales. Esto hace inseguro su uso comercial, ya que no se concede permiso explicito ni se aclaran las condiciones de redistribucion.
- Escasez de validacion: el modelo no incluye resultados de evaluacion, no tiene descargas ni interacciones en el momento de redactar esta ficha y no se ha publicado documentacion sobre el dataset de SFT. Es un artefacto de investigacion, no un modelo listo para produccion.
- Ausencia de soporte de herramientas: no se ha documentado soporte de tool calling, function calling ni integracion con agentes, por lo que no es adecuado para pipelines que requieran llamadas a funciones.
- Riesgo de sobreajuste: con solo 10 MB de datos empaquetados de ajuste fino (segun el nombre del checkpoint), el modelo puede haber memorizado parte del corpus de SFT, con el consiguiente riesgo de regurgitacion literal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/isl-latn-100mb-ppt-Dp-10mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/isl_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/e80r9nmu
- Repositorio de TRL: https://github.com/huggingface/trl

Nota: los resultados de la busqueda web proporcionada no contienen enlaces relevantes sobre este modelo ni sobre la familia Goldfish; todos ellos corresponden a conversores de divisas y no se han utilizado como fuente.
