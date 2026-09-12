# llm-semantic-router/Vela-1.0-Encoder-307M-Domain

## Resumen

Vela-1.0-Encoder-307M-Domain es un modelo encoder de clasificación de texto publicado por la organización llm-semantic-router dentro de la familia Vela 1.0, un conjunto de modelos especializados pensados para actuar como componentes de enrutamiento semántico. Su función concreta es identificar el dominio temático de una petición (14 dominios que abarcan, entre otros, ciencia, ingeniería, salud, derecho y negocio) para que un router de LLM pueda dirigirla al modelo, la herramienta o la política más adecuada. Se distribuye con licencia Apache-2.0 y arquitectura ModernBERT, con 307.541.006 parámetros y una ventana de contexto de 32.000 tokens.

El modelo deriva del checkpoint base mmbert-32k-yarn y de un LoRA clasificador de intenciones (mmbert32k-intent-classifier-lora), y está optimizado para clasificación multilingüe en seis idiomas: inglés, chino, español, francés, alemán y japonés. Su relevancia actual radica en que cubre un hueco habitual en arquitecturas de enrutamiento: la clasificación temática previa a la selección de modelo, con soporte de entradas largas y sin depender de un LLM generativo para esa tarea, lo que reduce coste y latencia.

Según la model card, el modelo alcanza un F1 macro de dominio de 0,739 sobre 2.573 preguntas de Global-MMLU, frente a 0,647 del modelo anterior de la misma función, evaluado en los seis idiomas soportados. El autor advierte explícitamente de que la predicción debe usarse como señal de enrutamiento y no como juicio sobre la calidad de una respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo ModernBERT (etiqueta `modernbert`), derivado del modelo base `mmbert-32k-yarn` |
| Parametros totales | 307.541.006 |
| Longitud de contexto | 32.000 tokens (32K) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors y ONNX; no se detallan esquemas de cuantizacion) |
| Idiomas soportados | en, zh, es, fr, de, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |
| Tarea | Clasificacion de texto (`text-classification`), 14 dominios tematicos |
| Modelo base | `llm-semantic-router/mmbert-32k-yarn` y `llm-semantic-router/mmbert32k-intent-classifier-lora` |
| Tamano del repositorio | 2,5 GB |
| Libreria | transformers |
| Compatibilidad de despliegue | `text-embeddings-inference`, `endpoints_compatible`, ONNX |

## Arquitectura y entrenamiento

Se trata de un encoder (no de un modelo generativo) basado en la arquitectura ModernBERT, según la etiqueta declarada por el autor, y construido sobre el checkpoint `mmbert-32k-yarn`. El sufijo del nombre del modelo base (`32k-yarn`) apunta a una extensión de contexto mediante YaRN sobre el escalado posicional de RoPE, una técnica habitual para ampliar la ventana efectiva de atención; la model card no detalla la configuración concreta de esa extensión, los datos de entrenamiento ni el número de tokens utilizados.

El modelo se ha obtenido por ajuste desde dos artefactos: el encoder base `mmbert-32k-yarn` y un adaptador LoRA de clasificación de intenciones (`mmbert32k-intent-classifier-lora`). La model card no especifica la composición del dataset de ajuste, si hubo fases de RLHF o DPO (poco habituales en modelos discriminativos de este tipo), ni hiperparámetros de entrenamiento. La única innovación documentada explícitamente es la evaluación comparativa frente al modelo anterior de la misma función sobre un conjunto de 2.573 preguntas de Global-MMLU, con una mejora de F1 macro de 0,647 a 0,739 en seis idiomas.

## Capacidades

- Clasificacion tematica de peticiones en 14 dominios, desde ciencia e ingenieria hasta salud, derecho y negocio.
- Clasificacion multilingue con un unico modelo para ingles, chino, espanol, frances, aleman y japones.
- Procesamiento de entradas largas de hasta 32.000 tokens, adecuado para documentos o conversaciones extensas.
- Salida de clasificacion utilizable como senal de enrutamiento hacia modelos, herramientas o politicas.
- Exportacion a ONNX y compatibilidad con endpoints de inferencia (`endpoints_compatible`, `text-embeddings-inference`).
- Integracion prevista con el proyecto vLLM Semantic Router.
- No dispone de generacion de texto, razonamiento multi-paso, tool calling ni capacidades de vision o audio: es exclusivamente un clasificador.
- No se documentan modos especiales (thinking mode, decodificacion especulativa) ni funciones de agente.

## Casos de uso

- Enrutamiento semantico en produccion: el clasificador recibe la peticion del usuario y devuelve el dominio, que el router usa para seleccionar el modelo especializado o la politica correspondiente, reduciendo el coste frente a enviar todo el trafico al LLM mas grande.
- Triaje de tickets de soporte: clasificar cada incidencia por area (derecho, salud, ingenieria, negocio) antes de asignarla a un equipo o a un flujo automatizado concreto.
- Seleccion de colecciones en pipelines RAG: determinar el dominio de la consulta para restringir la busqueda vectorial a los indices relevantes y mejorar la precision del recuperado.
- Enrutamiento multilingue: atender consultas en espanol, aleman, frances, japones o chino con el mismo modelo, sin mantener clasificadores separados por idioma.
- Filtrado de consultas largas: clasificar documentos completos o hilos de conversacion de hasta 32.000 tokens, algo inviable con clasificadores de ventana corta.
- Etiquetado de corpus a gran escala: preanotar dominios en datasets de entrenamiento o evaluacion, con revision humana posterior, aprovechando el coste bajo de un encoder de 307 M de parametros.
- Analisis de feedback de usuario: agrupar comentarios y reclamaciones por dominio tematico para alimentar paneles de producto o priorizacion de incidencias.
- Enrutamiento de herramientas en agentes: usar el dominio predicho como criterio previo para decidir que conjunto de herramientas o APIs se expone al agente.

## Benchmarks y rendimiento

| Evaluacion | Modelo anterior | Vela 1.0 Domain |
|---|---:|---:|
| F1 macro de dominio sobre 2.573 preguntas de Global-MMLU | 0,647 | 0,739 |

La evaluacion se realizo en los seis idiomas soportados. La model card no publica desglose por idioma ni por dominio, ni resultados en otros benchmarks distintos de Global-MMLU, por lo que no hay datos disponibles de MMLU completo, HumanEval, GSM8K ni similares (tampoco serian aplicables a un clasificador de dominio).

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 1,23 GB de pesos, mas activaciones y overhead del runtime.
- VRAM estimada en FP16/BF16: aproximadamente 615 MB de pesos.
- VRAM estimada en INT8: aproximadamente 308 MB; en INT4, aproximadamente 154 MB (estimaciones teoricas a partir del numero de parametros; el repositorio no publica cuantizaciones especificas).
- El repositorio completo ocupa 2,5 GB, ya que incluye exportaciones en safetensors y ONNX.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier tarjeta con 4 GB o mas de VRAM; tambien es viable la inferencia en CPU para cargas moderadas.
- GPU de centro de datos (A100, H100, L40S) solo justificadas si se necesita throughput muy alto o por reutilizacion de infraestructura existente.
- Opciones de despliegue: pipeline de `transformers`, ONNX Runtime, `text-embeddings-inference` (segun las etiquetas del repositorio) e integracion como componente del router en el proyecto vLLM Semantic Router.
- Latencia y throughput estimados: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 macro de dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-Domain | 307,5 M | 32K | 0,739 | Apache-2.0 | Publico en HuggingFace |
| Modelo anterior de dominio (sin identificar en la model card) | no disponible | no disponible | 0,647 | no disponible | no disponible |
| `llm-semantic-router/mmbert-32k-yarn` (modelo base) | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace |
| Encoders de clasificacion multilingue de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card solo ofrece comparacion frente al modelo anterior de la misma funcion, sin nombrarlo ni detallar sus especificaciones. No se dispone de datos suficientes para comparar con alternativas externas como clasificadores de dominio basados en XLM-R o mDeBERTa.

## Limitaciones y advertencias

- El propio autor indica que la prediccion debe emplearse como senal de enrutamiento y no como un juicio sobre la calidad de una respuesta.
- La precision puede variar en funcion del idioma y de la longitud del contexto; la model card no desglosa el rendimiento por idioma ni por dominio.
- La taxonomia esta cerrada a 14 dominios; las peticiones que no encajen en esa taxonomia se forzaran a una de las clases existentes.
- Solo se declaran seis idiomas (en, zh, es, fr, de, ja); el rendimiento en otros idiomas no esta documentado y previsiblemente sera bajo.
- Modelo recien publicado: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni evaluaciones independientes conocidas.
- No se documentan sesgos especificos, pero al ser un clasificador tematico puede heredar sesgos de los datos de ajuste, cuya composicion no se detalla.
- Riesgo de clasificacion erronea en consultas ambiguas, muy cortas o con terminologia mixta de varios dominios.
- Al no ser un modelo generativo, no alucina texto, pero una clase incorrecta puede propagar errores aguas abajo en el router.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y el archivo NOTICE si aplica.
- Para produccion conviene fijar la revision del checkpoint, monitorizar la distribucion de clases predichas y establecer un umbral de confianza con fallback.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Domain
- Documentacion tecnica y evaluacion (TECHNICAL.md): https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Domain/blob/main/TECHNICAL.md
- Coleccion de la familia Vela 1.0: https://huggingface.co/collections/llm-semantic-router/vela-10-router-models-6aa555ba70cc6997d6d67798
- Proyecto vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base mmbert-32k-yarn: https://huggingface.co/llm-semantic-router/mmbert-32k-yarn
- Modelo base mmbert32k-intent-classifier-lora: https://huggingface.co/llm-semantic-router/mmbert32k-intent-classifier-lora
- Modelos hermanos citados en la model card: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-Modality, https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-PII, https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-FactCheck, https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos eran paginas genericas sobre modelos de lenguaje sin relacion con Vela 1.0.
