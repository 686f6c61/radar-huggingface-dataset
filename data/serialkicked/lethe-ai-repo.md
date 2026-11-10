# SerialKicked/Lethe-AI-Repo

## Resumen

Lethe-AI-Repo es un repositorio auxiliar del proyecto Lethe AI Sharp, una biblioteca modular en C# para conectar aplicaciones .NET con backends de modelos de lenguaje, tanto locales como remotos. No se trata de un modelo fundacional entrenado por el autor, sino de una coleccion de artefactos de soporte: plantillas Jinja corregidas para varios modelos comerciales y de codigo abierto, y dos modelos pequenos cuantizados en formato GGUF destinados a tareas auxiliares dentro de la biblioteca.

Los componentes principales son un modelo de embeddings (una cuantizacion Q6_K de gte-large) empleado para los flujos de RAG de la biblioteca, y un clasificador BERT-base-uncased afinado sobre GoEmotions para analisis de sentimiento multietiqueta con 28 emociones. Ademas, el repositorio incluye plantillas Jinja permisivas para Mistral (Tekken7), Qwen 3.x (ChatML), Gemma4 y Muse Glimmer, que permiten mensajes de sistema en medio de la conversacion y preservan el formato de tool calls.

El interes practico del repositorio reside en su integracion con Lethe AI Sharp, una implementacion pura en .NET 10 sin dependencias de Python, que incluye un backend LlamaSharp propio para ejecutar GGUF localmente. El repositorio tiene un tamano de 0,5 GB y acumula 105 descargas y 2 likes en Hugging Face, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Contenedor de artefactos: plantillas Jinja y modelos GGUF auxiliares (BERT-base para clasificacion, GTE-large para embeddings) |
| Parametros totales | 108.913.180 (suma reportada en safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (gte-large.Q6_K.gguf); cuantizacion del clasificador BERT no especificada |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF, Jinja (plantillas), safetensors (segun metadatos del repo) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado de forma nativa por el autor. Los pesos incluidos son derivados de modelos existentes: gte-large (General Text Embeddings) cuantizado a Q6_K para tareas de recuperacion en RAG, y un BERT-base-uncased afinado sobre el dataset GoEmotions para clasificacion multietiqueta de 28 emociones. Ambos se distribuyen bajo licencia MIT segun la model card.

El resto del contenido son plantillas Jinja corregidas para Mistral (Tekken7), Qwen 3.x (ChatML), Gemma4 y Muse Glimmer. Estas plantillas modifican el comportamiento por defecto de los chat templates para permitir mensajes de sistema intercalados en la conversacion (requisito de LetheAI) y para evitar errores de validacion cuando el modelo se usa de formas no previstas originalmente, manteniendo el formato de tool calls. La model card afirma que estas modificaciones no afectan al rendimiento, solo relajan las restricciones de formato. No se proporcionan detalles sobre volumen de entrenamiento, composicion del dataset ni procesos de RLHF/DPO de los modelos subyacentes.

## Capacidades

- Generacion de embeddings de texto para recuperacion semantica y RAG mediante gte-large cuantizado.
- Clasificacion multietiqueta de emociones (28 categorias de GoEmotions) con el clasificador BERT-base.
- Plantillas de chat compatibles con Mistral (Tekken7), Qwen 3.x (ChatML), Gemma4 y Muse Glimmer.
- Soporte de mensajes de sistema intercalados en la conversacion a traves de las plantillas corregidas.
- Preservacion del formato de tool calls en las plantillas modificadas.
- Integracion con el ecosistema Lethe AI Sharp: personas de chat, gestion de sesiones, streaming, memoria a largo plazo, agentes en segundo plano, busqueda web, TTS y salida estructurada (estas capacidades pertenecen a la biblioteca, no al modelo).
- No es un modelo generativo: no realiza razonamiento, codigo ni matematicas por si mismo.

## Casos de uso

- Recuperacion aumentada en aplicaciones .NET: el gte-large Q6_K permite indexar y recuperar fragmentos de documentos dentro de Lethe AI Sharp sin salir del runtime .NET, eliminando la dependencia de un servidor de embeddings en Python.
- Analisis de sentimiento en conversaciones: el clasificador BERT de 28 emociones se puede usar para etiquetar turnos de usuario y adaptar respuestas o disparar flujos de moderacion en la aplicacion de chat.
- Despliegue de frontends de chat con modelos de terceros: las plantillas Jinja corregidas permiten usar Mistral, Qwen 3.x, Gemma4 o Muse Glimmer en modo chat completion con mensajes de sistema intercalados, algo que los templates originales rechazan.
- Integracion de tool calling en pipelines propios: las plantillas preservan el formato de llamadas a herramientas, lo que facilita conectar modelos con funciones externas en aplicaciones C#.
- Distribucion de un ejecutable autocontenido: al combinarse con el backend LlamaSharp de Lethe AI Sharp, el repositorio permite empaquetar un binario unico que ejecuta modelos GGUF locales sin servidor externo ni entorno Python.
- Prototipado de agentes con memoria: los embeddings y el clasificador sirven como piezas de memoria semantica y filtrado de contexto en tareas agenticas de la biblioteca.
- Compatibilidad con backends remotos: las mismas plantillas y artefactos funcionan contra APIs compatibles con OpenAI o KoboldAPI, lo que permite alternar entre inferencia local y remota con el mismo codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 0,5 GB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o mas de VRAM.
- El gte-large Q6_K es un modelo de embeddings de aproximadamente 400 millones de parametros; su inferencia en Q6_K requiere del orden de 0,5 GB de VRAM, estimacion basada en el tamano del fichero y no en mediciones publicadas.
- El clasificador BERT-base cuantizado es aun mas ligero y puede ejecutarse en CPU sin problema.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA o Metal; para embeddings en produccion se sugiere RTX 3060 o superior, aunque no hay datos oficiales de latencia.
- Despliegue: backend LlamaSharp integrado en Lethe AI Sharp; tambien es posible usar llama.cpp u otros runners compatibles con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lethe-AI-Repo (gte-large Q6_K + BERT emociones) | ~109 M (suma del repo) | no disponible | Embeddings + clasificacion | MIT | Hugging Face |
| thenlper/gte-large (original) | ~335 M | 512 tokens | Embeddings | MIT | Hugging Face |
| logasanjeev/emotions-analyzer-bert (original) | ~110 M | 512 tokens | Clasificacion de emociones | MIT | Hugging Face |
| BAAI/bge-large-en-v1.5 | ~335 M | 512 tokens | Embeddings | MIT | Hugging Face |

La comparativa se limita a los modelos de origen, ya que el repositorio no incluye un modelo generativo propio con el que contrastar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de lenguaje generativo: no debe evaluarse como alternativa a un LLM para chat, razonamiento o generacion de codigo.
- El clasificador de emociones esta afinado sobre GoEmotions, un dataset en ingles; su comportamiento en castellano u otros idiomas no esta documentado.
- Las plantillas Jinja modificadas relajan las restricciones de formato de los modelos originales; aunque el autor afirma que no afectan al rendimiento, pueden producir comportamientos distintos a los previstos por los desarrolladores originales de cada modelo.
- No se publican datos de benchmarks, evaluaciones de sesgo ni tasas de alucinacion.
- La licencia MIT se aplica a los artefactos del repositorio, pero conviene verificar las licencias de los modelos de origen (gte-large y el clasificador de emociones) antes de un uso comercial.
- El repositorio depende del ecosistema Lethe AI Sharp (.NET 10) para su uso previsto; fuera de el, su utilidad se reduce a los ficheros GGUF y las plantillas.
- No hay informacion sobre idiomas soportados ni sobre el rendimiento de las plantillas con versiones futuras de los modelos objetivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SerialKicked/Lethe-AI-Repo
- Biblioteca Lethe AI Sharp: https://github.com/SerialKicked/Lethe-AI-Sharp/
- Frontend Lethe AI Chat: https://github.com/SerialKicked/Lethe-AI-Chat/
- Binarios de Lethe AI Chat: https://github.com/SerialKicked/Lethe-AI-Chat/releases
- Modelo de embeddings original gte-large: https://huggingface.co/thenlper/gte-large
- Clasificador de emociones original: https://huggingface.co/logasanjeev/emotions-analyzer-bert
