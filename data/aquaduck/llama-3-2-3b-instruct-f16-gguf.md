# aquaduck/Llama-3.2-3B-Instruct-F16-GGUF

## Resumen

Este repositorio aloja una cuantizacion F16 en formato GGUF del modelo `meta-llama/Llama-3.2-3B-Instruct`, publicada por el usuario Aquaduck. No se trata de un modelo nuevo ni de un fine-tune: los pesos proceden de Meta, el GGUF F16 fue generado por Unsloth y este repositorio se limita a reempaquetarlo. Ademas del fichero completo, incluye dos shards de capas cortados en el punto medio de la red (capas 0-13 y 14-27) bajo un formato propio denominado Aquaduck Arc `layer-package-v1`, pensado para carga por etapas o reparto entre varios nodos.

La relevancia de esta publicacion no esta en el modelo en si, sino en el formato de empaquetado. Llama 3.2 3B Instruct es un transformer decoder-only con 28 capas, atencion con consultas agrupadas (GQA) y unos 3,2B parametros nominales, ya ampliamente distribuido. Lo que anade este repositorio es un mecanismo de particionado por capas que permite servir la primera mitad y la segunda mitad del modelo en dispositivos distintos, algo poco habitual en el ecosistema GGUF estandar.

Conviene tener presente que los shards no son un modelo autocompleto: solo funcionan con el runtime de Aquaduck, no con llama.cpp estandar. El fichero completo, en cambio, es un GGUF F16 convencional y se puede usar con cualquier herramienta compatible. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), GQA con 24 cabezas de consulta y 8 de clave/valor, 28 capas, dimension oculta 3072 |
| Parametros totales | 1.803.374.656 segun el recuento de safetensors del repositorio; la model card declara 3,2B nominales (discrepancia no aclarada) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en este repositorio; la model card indica "unknown tokens" y remite al modelo base, cuya documentacion oficial de Meta cifra en 128 000 tokens |
| Tipos de cuantizacion | F16 unicamente (sin variantes Q4, Q5, Q8 en este repositorio) |
| Idiomas soportados | multilingue, "igual que el modelo base" segun la model card; lista explicita de idiomas no disponible |
| Licencia | other, heredada de `meta-llama/llama-3.2-3b-instruct` (Llama 3.2 Community License) |
| Formato de pesos | GGUF F16: fichero completo (~6,43 GB) y dos shards de capas (~3,61 GB cada uno) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama 3.2 3B Instruct original: un transformer causal con normalizacion RMSNorm pre-normalizacion, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion con consultas agrupadas para reducir el coste de la cache KV. La configuracion concreta son 28 capas, 24 cabezas de consulta y 8 cabezas de clave/valor, con dimension oculta de 3072. La model card de este repositorio repite la ficha tecnica del modelo base, sin modificaciones.

No hay entrenamiento ni ajuste alguno en esta publicacion. El flujo declarado es: pesos de Meta (`meta-llama/llama-3.2-3b-instruct`) → cuantizacion GGUF F16 de Unsloth (`unsloth/Llama-3.2-3B-Instruct-GGUF`) → reempaquetado por Aquaduck. La unica innovacion tecnica es el formato de empaquetado `layer-package-v1` de Aquaduck Arc: un corte en la capa 14 que divide las 28 capas en dos etapas contiguas (`maxStages: 2`), con nombres de fichero que usan indices de fin exclusivos (`layers-{inicio}-{finExclusivo}`). Este particionado no altera los pesos; es puramente de distribucion y carga por etapas. No se documentan datos de entrenamiento, composicion del dataset ni tecnicas de alineamiento adicionales (RLHF, DPO) porque no se ha realizado ningun proceso de este tipo en el repositorio.

## Capacidades

- Generacion de texto conversacional con seguimiento de instrucciones, heredada del ajuste instructivo de Llama 3.2 3B.
- Razonamiento basico y tareas de comprension lectora propias de un modelo de 3B; sin capacidades de razonamiento extendido verificadas.
- Generacion de codigo a nivel introductorio y medio; no es un modelo especializado en programacion.
- Plantilla de chat de Llama 3.2, que en la version oficial de Meta incluye soporte de function calling y tool calling (no verificado de forma independiente en este repositorio).
- Capacidad multilingue heredada del modelo base, sin lista de idiomas confirmada en la ficha.
- Carga por etapas mediante shards: permite repartir la primera y la segunda mitad del modelo entre dos dispositivos o nodos con el runtime Aquaduck Arc.
- No dispone de vision, audio, modo thinking real ni ventana de contexto ampliada propia.

## Casos de uso

- Asistente conversacional local en escritorio: el fichero F16 completo (~6,43 GB) cabe en GPU de gama media y permite ejecutar un chat instructivo sin conexion ni envio de datos a la nube.
- Despliegue por etapas en dos nodos: los shards de capas permiten servir la mitad inicial y la final en dispositivos distintos, util para repartir memoria en entornos con limitaciones por maquina (requiere el runtime Aquaduck Arc, no llama.cpp estandar).
- Procesamiento de documentos con requisitos de privacidad: resumen, extraccion de entidades y clasificacion de textos internos en entornos sanitarios, legales o financieros donde no se permite salida a APIs externas.
- Prototipado de agentes y pipelines de tool calling: la plantilla de chat oficial admite definiciones de funciones, lo que permite validar flujos de llamada a herramientas antes de migrar a modelos mayores.
- Generacion de codigo en entornos de desarrollo locales: autocompletado y explicacion de fragmentos integrados en editores mediante un servidor llama.cpp local.
- Traduccion y asistencia multilingue ligera: redaccion y reformulacion de textos en varios idiomas con calidad moderada, adecuada para borradores y no para publicacion final.
- Filtrado y preprocesado dentro de una arquitectura RAG: el modelo puede reescribir consultas y resumir fragmentos recuperados antes de pasarlos a un modelo mayor.
- Base para experimentacion academica: al ser F16 sin perdida por cuantizacion agresiva, sirve como referencia de calidad al comparar variantes Q4/Q5 en estudios de degradacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no existen evaluaciones propias para el GGUF alojado ni para los shards, y remite a la model card de `meta-llama/llama-3.2-3b-instruct` para cualquier dato de evaluacion del modelo base.

## Requisitos de hardware

- VRAM estimada para el fichero completo: en torno a 7-8 GB en F16, incluyendo pesos (~6,43 GB) y cache KV para un contexto moderado. Los shards ocupan ~3,61 GB cada uno y hay que cargar ambos para tener el modelo operativo.
- GPU consumer compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090, y equipos Apple Silicon con memoria unificada de 16 GB o superior.
- GPU profesionales: no requiere A100 ni H100 para este tamano; una L4 o L40S queda sobredimensionada para el fichero completo, pero es util si se sirven varias replicas.
- Ejecucion en CPU: viable con llama.cpp usando aproximadamente 8 GB de RAM, con velocidades de decodificacion dependientes del procesador.
- Opciones de despliegue: llama.cpp y sus derivados (LM Studio, Ollama, text-generation-webui) para el fichero completo. El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia. Los shards de capas solo funcionan con el runtime Aquaduck Arc.
- Latencia y throughput: no disponible; no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de terceros proceden de sus fichas publicas y no se han verificado en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| aquaduck/Llama-3.2-3B-Instruct-F16-GGUF | 3,2B nominales (1,80B segun safetensors) | no confirmado en el repositorio | other (Llama 3.2 Community License) | GGUF F16 | Incluye shards de capas para Aquaduck Arc |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128 000 tokens (segun Meta) | Llama 3.2 Community License | safetensors (BF16) | Modelo original, sin cuantizar |
| unsloth/Llama-3.2-3B-Instruct-GGUF | 3,2B | igual al modelo base | Llama 3.2 Community License | GGUF (varias cuantizaciones, F16 incluida) | Fuente declarada del GGUF de este repositorio |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32 768 tokens (segun su ficha) | Apache 2.0 | safetensors, GGUF en repos derivados | Alternativa con licencia mas permisiva para uso comercial |

## Limitaciones y advertencias

- Sesgos y riesgos equivalentes a los del modelo base de Meta; el reempaquetado no introduce correcciones ni filtros adicionales.
- Riesgo de alucinacion propio de un modelo de 3B: tiende a inventar datos cuando la pregunta exige conocimiento factual especifico.
- La cuantizacion F16 puede degradar ligeramente la calidad respecto a las versiones de mayor precision originales, aunque en menor medida que cuantizaciones de 4 o 5 bits.
- La model card menciona "modos thinking / instruct" en la plantilla de chat; Llama 3.2 no dispone de un modo thinking real, por lo que esa indicacion debe tratarse con cautela y verificarse contra la documentacion oficial de Meta.
- Los shards de capas no son modelos completos: usarlos con llama.cpp estandar o cualquier runtime distinto de Aquaduck Arc producira fallos de carga.
- Licencia "other" heredada de Llama 3.2 Community License: incluye condiciones de uso comercial, clausulas de atribucion y restricciones (por ejemplo, para entidades con mas de 700 millones de usuarios mensuales). Es imprescindible revisar el texto completo antes de un despliegue en produccion.
- No hay lista de idiomas confirmada en la ficha; el rendimiento fuera del ingles puede ser notablemente inferior.
- Discrepancia sin aclarar entre los 3,2B declarados en la model card y los 1.803.374.656 parametros contabilizados en los safetensors del repositorio.
- Repositorio con 0 descargas y 0 likes: no existe validacion de la comunidad ni reportes independientes de funcionamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/aquaduck/Llama-3.2-3B-Instruct-F16-GGUF
- Modelo base: https://huggingface.co/meta-llama/llama-3.2-3b-instruct
- Fuente del GGUF: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/aquaduck
- La busqueda web realizada no devolvio resultados relevantes: unicamente aparecieron enlaces al registro mercantil frances (Infogreffe), sin ninguna relacion con el modelo.
