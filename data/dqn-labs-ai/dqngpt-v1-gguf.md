# DQN-Labs-AI/dqnGPT-v1-GGUF

## Resumen

dqnGPT-v1 es un modelo de lenguaje causal orientado a tareas generales de asistente conversacional, desarrollado por DQN Labs. Se presenta como la interfaz central de un ecosistema modular de modelos en el que convive con especialistas como dqnCode, dqnMath y dqnScience, y su función principal es la de capa de personalidad y controlador que delega en dichos especialistas cuando la consulta lo requiere. El modelo se distribuye en formato GGUF y está pensado para inferencia local en hardware de consumo.

Según la model card, se construye sobre la arquitectura de Gemma 4 E4B (google/gemma-4-E4B-it), con un esquema de parametros de embedding tipo PLE identico al de Gemma 3n, y declara aproximadamente 8.000 millones de parametros totales con unos 4.500 millones activos, lo que lo situa en la categoria de modelos compactos con mezcla de expertos. El repositorio de pesos en safetensors reporta 7.518.069.290 parametros reales, ligeramente por debajo de la cifra redondeada de la model card.

Su relevancia actual radica en la combinacion de tamano reducido, licencia Apache 2.0 y disponibilidad en GGUF, lo que facilita el despliegue en entornos locales con LM Studio, Ollama o LocalAI. No obstante, la informacion publica es escasa en lo relativo a datos de entrenamiento, evaluaciones cuantitativas y detalles tecnicos finos, y la propia model card indica que el modelo no se ha ajustado con datasets especificos de dominio, sino mediante ingenieria de prompts y formato de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE) y parametros de embedding tipo PLE, basada en Gemma 4 E4B |
| Parametros totales | 7.518.069.290 (segun safetensors); ~8B declarados en la model card |
| Parametros activos | ~4.5B (declarado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF y 4-bit (mencionados en la model card); el resto de variantes no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); safetensors disponible en el modelo base |

## Arquitectura y entrenamiento

dqnGPT-v1 emplea una arquitectura de transformer causal con mezcla de expertos, heredada de Gemma 4 E4B, e incorpora un esquema de parametros de embedding denominado PLE, identico al utilizado en Gemma 3n. La model card declara aproximadamente 8.000 millones de parametros totales y unos 4.500 millones activos, lo que implica que solo una fraccion de los expertos se activa por token, reduciendo el coste computacional en inferencia frente a un modelo denso del mismo tamano. El repositorio de pesos reporta 7.518.069.290 parametros reales, una cifra coherente con el orden de magnitud declarado.

En cuanto al entrenamiento, la informacion disponible es muy limitada. La model card afirma explicitamente que el modelo no se ha ajustado con datasets especificos de dominio y que su comportamiento se ha moldeado mediante ingenieria de prompts, formato de chat estructurado y diseno de comportamiento a nivel de sistema. No se especifican el numero de tokens de entrenamiento, la composicion del corpus, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detalla si existe un proceso de ajuste fino supervisado sobre el modelo base o si el artefacto es esencialmente una configuracion de prompt y plantilla sobre Gemma 4 E4B.

## Capacidades

- Generacion de texto conversacional en ingles con un tono natural, ligeramente ludico y adaptado al contexto.
- Razonamiento general y explicaciones paso a paso para tareas cotidianas.
- Capacidad multimodal heredada de la arquitectura base: interpretacion de imagenes y explicacion de contenido visual, con rendimiento dependiente del soporte del runtime.
- Delegacion consciente del contexto: el modelo reconoce cuando una consulta requiere especializacion y sugiere el uso de dqnCode, dqnMath o dqnScience.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; la model card solo describe el rol de controlador y enrutador dentro de un sistema modular.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistente personal local: el modelo puede ejecutarse en un equipo de sobremesa con GPU de consumo gracias a su formato GGUF y a su naturaleza MoE con ~4.5B parametros activos, ofreciendo conversaciones multi-turno sin depender de la nube.
- Interfaz frontal de un sistema multi-modelo: actua como capa de entrada que recibe la consulta del usuario, responde directamente cuando la tarea es general y deriva a dqnCode, dqnMath o dqnScience cuando detecta necesidad de especializacion, lo que simplifica la orquestacion de pipelines.
- Prototipado rapido de chatbots: la plantilla de chat personalizada, el system prompt y la configuracion de comportamiento incluidos en el repositorio permiten arrancar un asistente con personalidad definida en pocos pasos con LM Studio u Ollama.
- Educacion y explicaciones divulgativas: el modelo esta disenado para explicar conceptos con claridad y un tono cercano, lo que encaja en escenarios de tutoria informal o generacion de material didactico introductorio.
- Escritura creativa y brainstorming: la model card destaca su orientacion a la creatividad y a la generacion de ideas, adecuada para borradores de texto, lluvia de ideas y variaciones estilisticas.
- Descripcion y analisis de imagenes en local: cuando el runtime lo soporta, puede interpretar diagramas e imagenes y explicar su contenido, util en herramientas de accesibilidad o documentacion tecnica.
- Enrutamiento en asistentes de soporte: su capacidad de delegacion permite construir un primer nivel de atencion que resuelve consultas simples y escala las complejas a modelos especializados, reduciendo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamano declarado (~8B totales, ~4.5B activos), una cuantizacion Q4_K_M requeriria del orden de 5-6 GB de VRAM, y una Q8_0 en torno a 8-9 GB; estas cifras son estimaciones y no estan confirmadas por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar funcionamiento en GPUs de consumo con 8 GB o mas de VRAM, pero el autor no publica una lista de hardware validado.
- Compatibilidad con GPU de consumo: la model card afirma que el modelo "runs on consumer GPUs and local setups", sin especificar modelos concretos.
- Opciones de despliegue: el repositorio incluye etiquetas y soporte para LM Studio, Ollama y LocalAI, ademas del formato GGUF estandar, lo que permite su uso con llama.cpp y runtimes compatibles. Soporte de vLLM o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dqnGPT-v1 | ~8B totales / ~4.5B activos (MoE) | no disponible | Apache 2.0 | GGUF | Asistente general con delegacion a especialistas |
| google/gemma-4-E4B-it | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible | Modelo base declarado por el autor |
| Gemma 3n (referencia arquitectonica) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible | Arquitectura PLE citada como referencia |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a los datos declarados por el autor.

## Limitaciones y advertencias

- El modelo no esta optimizado para dominios altamente especializados y tiende a derivar tareas avanzadas a los modelos especialistas del ecosistema DQN Labs, lo que puede resultar en respuestas menos profundas si se usa de forma aislada.
- El rendimiento multimodal depende del soporte del runtime; no todas las herramientas de inferencia local implementan el procesamiento de imagenes de la arquitectura base.
- El soporte linguistico declarado se limita al ingles, lo que restringe su uso en aplicaciones en castellano u otros idiomas sin una evaluacion previa.
- No se han publicado evaluaciones de sesgo, robustez ni tasas de alucinacion; se desconoce el comportamiento del modelo en dominios factuales sensibles.
- La model card indica que el modelo no esta pensado para cargas empresariales a gran escala, por lo que su uso en produccion de alto volumen debe validarse con pruebas propias.
- Aunque la licencia es Apache 2.0, el modelo deriva de Gemma 4 E4B; conviene verificar las condiciones de la licencia del modelo base antes de un uso comercial.
- La informacion sobre datos de entrenamiento es practicamente inexistente, lo que dificulta evaluar la procedencia del conocimiento y los posibles sesgos heredados.
- El numero de descargas (620) y de likes (2) es bajo, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DQN-Labs-AI/dqnGPT-v1-GGUF
- Modelo base declarado: https://huggingface.co/google/gemma-4-E4B-it
