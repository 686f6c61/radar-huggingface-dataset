# lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-01

## Resumen

El modelo `lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-01` es un ajuste fino supervisado (SFT) desarrollado por el usuario de HuggingFace lugman-madhiai a partir del modelo base `Qwen/Qwen3.5-2B`. Se publica bajo licencia Apache 2.0 y esta etiquetado en HuggingFace con el pipeline `image-text-to-text`, lo que indica que acepta entrada multimodal de imagen y texto, ademas de las tareas conversacionales habituales de generacion de texto.

El modelo tiene 2.274.069.824 parametros (aproximadamente 2,27 mil millones) y un repositorio de 4,6 GB, un tamano coherente con pesos almacenados en precision de 16 bits (bf16/fp16). Esta orientado a un unico idioma, el ingles, y fue entrenado con la libreria Unsloth junto con TRL de HuggingFace, segun declara el propio autor en la model card.

Su relevancia practica es limitada pero concreta: se trata de un modelo pequeno, de licencia permisiva, que cabe en GPU de consumo y sirve como punto de partida para experimentar con SFT sobre una base multimodal de 2B. La documentacion publicada es minima: no se detallan el dataset, la composicion del entrenamiento, la longitud de contexto ni resultados de evaluacion, por lo que cualquier uso en produccion exige validacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; la etiqueta de pipeline `image-text-to-text` y el tag `qwen3_5` indican una familia transformer multimodal de entrada imagen-texto |
| Parametros totales | 2.274.069.824 (2,27 B) |
| Parametros activos | No aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; el repositorio solo contiene safetensors (4,6 GB para 2,27 B de parametros, consistente con bf16/fp16) |
| Idiomas soportados | Ingles (etiqueta `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,6 GB |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.5-2B |
| Fecha de creacion | 2026-10-02 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La informacion publicada no describe la arquitectura interna del modelo. Los unicos datos tecnicos confirmados son la pertenencia a la familia `qwen3_5`, la modalidad de entrada `image-text-to-text` y un total de 2,27 B de parametros, lo que lo situa en la gama de modelos densos pequenos. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni sobre innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, hibridaciones SSM, etc.).

El entrenamiento se realizo como ajuste fino supervisado sobre `Qwen/Qwen3.5-2B`. La model card indica que el proceso se ejecuto con Unsloth y la libreria TRL de HuggingFace, con la afirmacion de un entrenamiento "2x faster" atribuida a Unsloth, pero sin cifras verificables de tiempo, hardware empleado, numero de pasos ni hiperparametros. El identificador del modelo incluye las siglas "CS", que podrian sugerir un ajuste orientado a un dominio concreto, pero esto no esta confirmado en ningun documento publicado y no debe tomarse como un hecho.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo esta preparado para dialogos de tipo chat.
- Entrada multimodal imagen-texto: la etiqueta de pipeline `image-text-to-text` implica que el modelo puede recibir imagenes junto con texto, presumiblemente heredado de la base Qwen3.5-2B.
- Multilinguismo: no disponible; solo se declara soporte de ingles.
- Tool calling o function calling: no documentado.
- Uso como agente y razonamiento multi-paso: no documentado.
- Modo de razonamiento explicito (thinking mode): no documentado.
- Capacidades de audio o video: no documentadas.
- Capacidades de codigo o matematicas: no documentadas ni evaluadas en la informacion disponible.

Nota: al tratarse de un ajuste fino de 2,27 B de parametros y sin evaluaciones publicadas, no hay evidencia verificable del grado de competencia en ninguna de estas capacidades mas alla de lo que declaran las etiquetas de HuggingFace.

## Casos de uso

- Prototipado de asistentes conversacionales en local: el modelo cabe en GPU de consumo y tiene licencia Apache 2.0, por lo que sirve para levantar un prototipo de chat en una estacion de trabajo sin depender de APIs externas ni de costes por token.
- Procesamiento de documentos con imagen y texto: al aceptar entradas `image-text-to-text`, puede emplearse en prototipos de respuesta a preguntas sobre capturas, diagramas o formularios escaneados, siempre que se valide la calidad real de las respuestas.
- Fine-tuning de dominio sobre una base pequena: dado que es un SFT ya publicado, resulta util como punto de partida o referencia de receta para quien quiera reproducir un pipeline de Unsloth + TRL sobre un modelo multimodal de 2B.
- Generacion de datos sinteticos a pequena escala: con 2,27 B de parametros y despliegue en una unica GPU, es viable generar lotes de conversaciones de forma economica para tareas auxiliares de anotacion o aumento de datos, previa revision humana.
- Despliegue en el borde o en entornos con recursos limitados: cuantizado a 8 o 4 bits, el modelo ocupa del orden de 2,5 GB o 1,5 GB de pesos, lo que permite ejecutarlo en portatiles con GPU modestas o en servidores de inferencia de baja gama.
- Experimentacion academica en multimodalidad de bajo coste: su tamano reducido y su licencia permisiva lo hacen adecuado para estudios comparativos de tecnicas de SFT, cuantizacion o destilacion sin grandes presupuestos de computo.
- Base para un pipeline de busqueda o recuperacion asistida: el autor publica variantes de la misma familia orientadas a agentes de busqueda, de modo que este modelo podria integrarse en un sistema RAG sencillo, si bien la ausencia de documentacion sobre tool calling obliga a implementar el orquestado fuera del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No existen datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion en la model card, en el repositorio de HuggingFace ni en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 4,5 GB solo para los pesos, mas cache KV y overhead del runtime, lo que en la practica supone del orden de 6 a 8 GB para contextos cortos o medios.
- VRAM estimada en int8: del orden de 2,3 a 2,5 GB de pesos; en int4, del orden de 1,2 a 1,5 GB. Son estimaciones derivadas del numero de parametros, no medidas publicadas.
- GPU de consumo compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 para precision completa; en cuantizacion de 4 bits cabria en GPUs de 8 GB como la RTX 3070 o la RTX 4060.
- GPU de centro de datos: A100 40/80 GB, H100, L40S o similares quedan sobredimensionadas para un modelo de 2,27 B, aunque son validas si se busca batching alto o baja latencia.
- Opciones de despliegue: transformers de forma nativa, dado que el repositorio contiene safetensors; la etiqueta `text-generation-inference` sugiere compatibilidad con TGI; tambien son viables vLLM o SGLang. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, formato que no se publica en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Instantly-CS-SFT-Split-01 | 2,27 B | no disponible | imagen-texto a texto | Apache 2.0 | HuggingFace |
| Qwen/Qwen3.5-2B (base) | no disponible en la informacion | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01 | 2,3 B (segun featherless.ai) | 32K (segun featherless.ai) | imagen-texto a texto | Apache 2.0 segun el listado | HuggingFace |
| lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-02 | no disponible | no disponible | imagen-texto a texto | Apache 2.0 segun el listado | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes. Las cifras de contexto y parametros atribuidas a `SearchAgent-SFT-01` provienen de un agregador externo (featherless.ai) y no han sido verificadas en la model card oficial.

## Limitaciones y advertencias

- Documentacion minima: la model card no incluye dataset de entrenamiento, hiperparametros, ni evaluacion alguna, lo que impide estimar la calidad real del ajuste.
- Riesgo de alucinacion: al ser un modelo de 2,27 B sin evaluaciones publicadas, la tasa de afirmaciones incorrectas no esta cuantificada y previsiblemente sera elevada en tareas de conocimiento factual.
- Sesgos: no se ha publicado ningun analisis de sesgos, toxicidad ni alineacion. El modelo base tampoco aporta garantias en este punto dentro de la informacion disponible.
- Idioma: soporte declarado unicamente de ingles. No hay evidencia de un rendimiento aceptable en castellano u otras lenguas.
- Contexto: se desconoce la ventana de contexto real, lo que dificulta planificar despliegues con conversaciones largas o documentos extensos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserven los avisos de copyright y se indiquen los cambios. No obstante, el usuario debe verificar las condiciones aplicables al modelo base Qwen/Qwen3.5-2B.
- Adopcion nula: con 0 descargas y 0 likes en el momento de la consulta, no existe una comunidad que haya validado el modelo ni reportado problemas.
- Riesgo de identificacion erronea: el sufijo "CS" del nombre no tiene significado documentado; no debe asumirse que el modelo este especializado en un dominio concreto sin verificación empirica.
- Produccion: no se recomienda su uso en produccion sin una evaluacion propia previa, dado que no hay ninguna metrica publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-Instantly-CS-SFT-Split-01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante relacionada: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01
- Variante relacionada: https://huggingface.co/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-02
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Ficha de la variante SearchAgent en featherless.ai: https://featherless.ai/models/lugman-madhiai/Qwen3.5-2B-SearchAgent-SFT-01
- Ficha de la variante SearchAgent en LLM Explorer: https://llm-explorer.com/model/lugman-madhiai%2FQwen3.5-2B-SearchAgent-SFT-01,21ViEDEiq86NczoQRxVP9y
