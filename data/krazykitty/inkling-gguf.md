# KrazyKitty/inkling-GGUF

## Resumen

Inkling es un modelo multimodal de proposito general desarrollado por Thinking Machines Lab que acepta entradas de texto, imagen y audio y genera texto. Su arquitectura es un transformer autorregresivo decoder-only de 66 capas con un backbone de mezcla de expertos (MoE) disperso: cada token se enruta a 6 de 256 expertos mas 2 expertos compartidos activos siempre. Declara 975 000 millones de parametros totales y 41 000 millones activos por token, lo que lo situa en la categoria de modelos frontera con pesos abiertos, pero con un coste de inferencia por token mas cercano al de un modelo denso de ~41B.

La ficha que nos ocupa, `KrazyKitty/inkling-GGUF`, no es el modelo original sino una reproduccion en formato GGUF subida por un tercero. La model card apunta a Unsloth Dynamic 2.0 como esquema de cuantizacion y al repositorio `unsloth/inkling-GGUF` como origen del trabajo de conversion, ademas de enlazar la guia oficial de Unsloth para ejecutar Inkling en local. El repositorio ocupa 4643,6 GB y, en el momento de la consulta, no registra descargas ni interacciones.

Su relevancia actual radica en que permite ejecutar un modelo multimodal de ~1 billon de parametros en hardware local o de un solo inquilino mediante cuantizacion agresiva (hasta 1 bit, con el nivel `UD-IQ1_S` documentado), algo impensable en BF16, donde los pesos ocuparian cerca de 1,95 TB. Para produccion, la model card recomienda las rutas oficiales (vLLM, SGLang, TokenSpeed, Unsloth) y advierte de que Inkling esta pensado principalmente para ingles con capacidades multilingues generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo decoder-only multimodal; backbone MoE disperso de 66 capas; atencion hibrida de capas locales y globales |
| Parametros totales | 975 000 millones (975B) segun la model card; 947 025 564 226 (~947B) segun el indice de safetensors del repositorio |
| Parametros activos | 41 000 millones (41B); 6 de 256 expertos por token mas 2 expertos compartidos |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con esquema Unsloth Dynamic 2.0; se documenta explicitamente el nivel de 1 bit `UD-IQ1_S`. Catalogo completo de niveles no disponible |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas; cubre multiples lenguajes de programacion |
| Licencia | Apache 2.0, con politica de uso aceptable del modelo base |
| Formato de pesos | GGUF (este repositorio); BF16 y NVFP4 en el modelo base `thinkingmachines/Inkling` |
| Modalidades de entrada | Texto (UTF-8), imagen (cualquier formato en pixeles, idealmente entre 40 px y 4096 px por dimension), audio (WAV a 16 kHz, idealmente menos de 20 minutos) |
| Modalidades de salida | Texto (UTF-8) |
| Tamano del repositorio | 4643,6 GB |
| Modelo base | `thinkingmachines/Inkling` |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

Inkling es un transformer autorregresivo decoder-only de 66 capas cuyo bloque de feed-forward es una MoE dispersa: de los 256 expertos disponibles, cada token activa 6, a los que se suman 2 expertos compartidos que se ejecutan en todos los tokens. El mecanismo de atencion combina capas locales y globales, un patron habitual para reducir el coste cuadratico en secuencias largas manteniendo acceso global a la informacion. El modelo es nativamente multimodal: las imagenes y el video se codifican mediante un encoder jerarquico de parches y el audio mediante codificacion de tokens discretos; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder, en lugar de depender de adaptadores externos acoplados a un modelo de lenguaje puro.

En cuanto al entrenamiento, la informacion disponible indica que los datos cubren texto, imagenes, audio y video, y proceden de fuentes publicas (internet abierto y repositorios accesibles), de terceros y de generacion o aumentacion sintetica. El proceso de curado incluye limpieza, deduplicacion y filtrado para eliminar contenido de baja calidad y para objetivos de seguridad. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no estan disponibles. Si se confirma que los resultados de evaluacion se reportan con `effort=0.99`, el modelo expone un parametro de esfuerzo de razonamiento configurable, coherente con las interfaces de "Thinking" que menciona la guia de Unsloth.

## Capacidades

- Generacion de texto conversacional multi-turno y seguimiento de instrucciones en tareas de lenguaje natural.
- Comprension de imagen y video mediante un encoder jerarquico de parches, con entrada en cualquier formato de pixeles y tamanos recomendados de 40 px a 4096 px por dimension.
- Comprension de audio en formato WAV a 16 kHz, con una duracion recomendada inferior a 20 minutos por clip.
- Generacion y asistencia en codigo en multiples lenguajes de programacion, segun declara la model card.
- Soporte declarado para sistemas agénticos y de uso de herramientas (tool use), asistentes de codigo y pipelines de generacion aumentada por recuperacion (RAG).
- Capacidades multilingues generales, aunque el idioma principal de entrenamiento y uso previsto es el ingles.
- Modo de razonamiento con nivel de esfuerzo ajustable (`effort`), con soporte de conmutadores de "Thinking" en Unsloth Studio.
- Salida limitada a texto: no genera imagenes ni audio.
- Despliegue nativo en SGLang, vLLM, TokenSpeed, Unsloth y Hugging Face, ademas de acceso por API a traves de proveedores de inferencia de terceros.

## Casos de uso

- Asistentes de codigo en produccion: el modelo puede integrarse en un IDE o en un pipeline de CI/CD para revisar diffs, generar pruebas y explicar errores, con soporte declarado de tool calling para consultar repositorios, ejecutar linters o abrir incidencias. Los 41B de parametros activos por token abaratan el coste por llamada frente a un denso de tamano equivalente total.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno e incorpora capturas de pantalla o imagenes enviadas por el usuario gracias a su entrada de imagen, lo que permite diagnosticar problemas visuales (facturas, mensajes de error, interfaces) sin derivar a un humano.
- Analisis de documentos escaneados y formularios: al aceptar imagenes de hasta 4096 px por dimension, puede extraer campos de facturas, contratos o informes y devolverlos como texto estructurado para su volcado en un ERP o base de datos.
- Transcripcion y analisis de reuniones: la entrada de audio WAV a 16 kHz permite procesar grabaciones de hasta 20 minutos para generar actas, resumenes y listas de acciones, combinando audio y texto de contexto en la misma peticion.
- Sistemas RAG multimodales: indexacion de manuales tecnicos con diagramas y graficos, donde el modelo responde preguntas cruzando el texto recuperado con la interpretacion de las figuras adjuntas.
- Agentes autonomos de varios pasos: uso del modo de razonamiento con `effort` alto para planificar tareas, invocar herramientas y encadenar subtareas, reservando `effort` bajo para las llamadas rutinarias y reducir asi el coste de inferencia.
- Moderacion y clasificacion de contenido: analisis de publicaciones que combinan texto e imagen (por ejemplo, anuncios con texto incrustado) para detectar categorias prohibidas.
- Investigacion y ajuste fino: al publicarse con pesos abiertos y licencia Apache 2.0, sirve como base para fine-tuning en dominios verticales (legal, medico, industrial) sobre las versiones BF16 o NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card de Inkling incluye una tabla de evaluacion con resultados reportados a `effort=0.99`, generada a partir del leaderboard de r/acc con fecha del 14 de julio de 2026, pero el contenido citado esta truncado y no incluye las cifras. Los modelos de comparacion listados en esa tabla son los siguientes:

| Modelo | Tipo de pesos |
|---|---|
| Inkling | Abiertos |
| Nemotron 3 Ultra | Abiertos |
| Kimi K2.5 | Abiertos |
| Kimi K2.6 | Abiertos |
| GLM 5.2 | Abiertos |
| DeepSeek V4 Pro | Abiertos |
| Gemini 3.1 Pro (high) | Cerrados |
| Claude Fable 5 (max) | Cerrados |
| GPT 5.6 Sol | Cerrados |

No se dispone de las puntuaciones concretas de Inkling ni de sus competidores en MMLU, HumanEval, GSM8K u otros conjuntos, por lo que no se incluyen cifras. La guia de Unsloth sobre GGUF Dynamic 2.0 incluye sus propios benchmarks de cuantizacion, pero tampoco se han facilitado los valores.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del numero de parametros declarado (975B). Son estimaciones, no mediciones publicadas:
  - BF16 o FP16 (pesos completos): aproximadamente 1950 GB solo en pesos, mas cache KV y activaciones.
  - NVFP4 (~4 bits): en torno a 480-500 GB de pesos.
  - GGUF de 4 bits: en torno a 550-600 GB; el repositorio GGUF de referencia para el que se reporta un tamano concreto ocupa 602,7 GB repartidos en 41 ficheros.
  - GGUF de 1 bit (`UD-IQ1_S`): aproximadamente 150-200 GB, el unico escenario que se acerca a hardware de gama alta de una sola maquina.
- GPU recomendadas: para BF16 no existe una configuracion comercial razonable en un solo nodo (haría falta del orden de 16-24 GPU H200 de 141 GB o varias decenas de A100/H100 de 80 GB). Para cuantizaciones de 4 bits, nodos de 8 GPU H200 o 16 GPU A100/H100 de 80 GB. Para 1 bit, 2-4 GPU H100/A100 o una maquina Apple Silicon con memoria unificada amplia (256-512 GB) usando llama.cpp con offload a CPU.
- No cabe en GPU de consumo. Una RTX 4090 de 24 GB o una RTX 5090 no pueden alojar ni la cuantizacion de 1 bit completa; solo son viables con offload masivo a RAM del sistema, a costa de una latencia muy alta.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, Unsloth Studio) para los pesos GGUF; vLLM, SGLang y TokenSpeed para BF16 y NVFP4 en servidor; tambien es posible cargar el modelo base con Hugging Face Transformers y acceder a el por API mediante proveedores de terceros.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuracion.

## Comparativa con modelos similares

No se dispone de especificaciones tecnicas de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a lo declarado en la model card.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Inkling | 975B totales, 41B activos | no disponible | Apache 2.0 | Pesos abiertos (BF16, NVFP4, GGUF) | Cifras no disponibles |
| Nemotron 3 Ultra | no disponible | no disponible | no disponible | Pesos abiertos | Cifras no disponibles |
| Kimi K2.5 / K2.6 | no disponible | no disponible | no disponible | Pesos abiertos | Cifras no disponibles |
| GLM 5.2 | no disponible | no disponible | no disponible | Pesos abiertos | Cifras no disponibles |
| DeepSeek V4 Pro | no disponible | no disponible | no disponible | Pesos abiertos | Cifras no disponibles |

Frente a la alternativa practica dentro del propio ecosistema GGUF, cabe senalar que este repositorio duplica el contenido de `unsloth/inkling-GGUF` (que acumula cientos de miles de descargas segun los directorios de terceros consultados) sin anadido tecnico documentado.

## Limitaciones y advertencias

- Riesgo de alucinacion: es un modelo generativo de proposito general; no se documentan mecanismos de verificacion factual ni tasas de alucinacion medidas.
- Sesgos: los datos de entrenamiento proceden en parte de internet abierto, con los sesgos sociales, culturales y linguisticos que ello implica. El proceso de curado descrito menciona filtrado por calidad y seguridad, pero no se publica ninguna evaluacion de sesgos.
- Idioma: el uso previsto es principalmente ingles, con capacidades multilingues descritas solo de forma generica. Para castellano no hay garantia de calidad comparable a la del ingles.
- Limites de contexto: la longitud de contexto no esta publicada, lo que impide planificar despliegues que dependan de ventanas largas.
- Limites de entrada multimodal: las imagenes rinden mejor entre 40 px y 4096 px por dimension y el audio se limita a WAV de 16 kHz con una duracion ideal inferior a 20 minutos. La salida es siempre texto.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial, pero el modelo base de Thinking Machines Lab esta sujeto a una politica de uso aceptable adicional que conviene revisar antes de desplegarlo en produccion.
- Fidelidad del repositorio: `KrazyKitty/inkling-GGUF` es una publicacion de un tercero, con cero descargas y sin fecha de actualizacion posterior a la de creacion (23 de septiembre de 2026). Para produccion es preferible usar el repositorio oficial de Unsloth o los pesos originales, ya que no hay garantia de que la conversion coincida bit a bit con la de referencia.
- Perdida por cuantizacion: en niveles de 1 bit como `UD-IQ1_S` la degradacion de calidad puede ser notable, especialmente en razonamiento y codigo. La propia model card enlaza benchmarks de cuantizacion de Unsloth Dynamic 2.0, que deben consultarse antes de elegir un nivel.
- Discrepancia de parametros: la model card declara 975B totales mientras que el indice de safetensors del repositorio arroja 947 025 564 226 parametros. Conviene verificar la cifra antes de dimensionar infraestructura.
- Coste de almacenamiento: 4643,6 GB de repositorio, muy por encima de lo habitual incluso para modelos de esta escala; hay que prever espacio en disco y ancho de banda de descarga.
- Sin datos de rendimiento: no hay cifras publicadas de latencia, throughput ni benchmarks que permitan estimar el coste operativo real.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/KrazyKitty/inkling-GGUF
- Repositorio GGUF de referencia (Unsloth): https://huggingface.co/unsloth/inkling-GGUF
- Modelo base en BF16: https://huggingface.co/thinkingmachines/Inkling
- Modelo base en NVFP4: https://huggingface.co/thinkingmachines/Inkling-NVFP4
- Guia de Unsloth para ejecutar Inkling: https://unsloth.ai/docs/models/inkling
- Benchmarks de cuantizacion Unsloth Dynamic 2.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Tinker Cookbook: https://github.com/thinking-machines-lab/tinker-cookbook
- Documentacion de Tinker para Inkling: https://tinker-docs.thinkingmachines.ai/cookbook/inkling/
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/inkling
- Documentacion de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Discord de Unsloth: https://discord.gg/unsloth
- Ficha en Inferix: https://inferix.co/models/unsloth/inkling-GGUF
- Ficha en Applied: https://theapplied.co/models/unsloth-inkling-gguf
- Ficha en Ryu: https://ryuhq.com/store/models/unsloth/inkling-GGUF
- Ficha en local-ai-zone: https://local-ai-zone.github.io/models/inkling.html
