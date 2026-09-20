# bielquants/Inkling-Small-NVFP4

## Resumen

Inkling-Small-NVFP4 es una version cuantizada en formato NVFP4 del modelo multimodal Inkling-Small, desarrollado por Thinking Machines. Se trata de un transformer autoregresivo decoder-only de tipo Mixture-of-Experts (MoE) disperso que acepta entradas de texto, imagen y audio, y genera salida en texto. La model card declara 276B parametros totales con 12B activos por token, un backbone de 42 capas, enrutamiento a 6 de 256 expertos mas 2 expertos compartidos, y atencion hibrida con capas locales y globales.

El problema que resuelve es el de ofrecer un modelo multimodal de gran tamano con coste de inferencia contenido: al activar solo 12B parametros por token, el coste computacional por token se aproxima al de un modelo denso mucho menor, mientras que la capacidad total de conocimiento se acerca a la de un modelo de 276B. La version NVFP4 reduce ademas el peso en memoria de los pesos, lo que hace viable desplegarlo en configuraciones multi-GPU que de otro modo requeririan mayor cantidad de VRAM.

Este repositorio concreto (`bielquants/Inkling-Small-NVFP4`) es una cuantizacion de terceros del modelo base `thinkingmachines/Inkling-Small`, con licencia Apache 2.0 y un tamano de repositorio de 170,8 GB. Es relevante para equipos que quieran evaluar el modelo en hardware Blackwell o comparar el impacto de la cuantizacion NVFP4 frente a la version BF16 oficial. No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only con backbone Mixture-of-Experts (MoE) disperso, 42 capas y atencion hibrida local/global |
| Parametros totales | 276B segun la model card; los pesos safetensors del repositorio suman 156.032.140.138 parametros (dato discrepante, ver limitaciones) |
| Parametros activos | 12B (6 de 256 expertos enrutados por token + 2 expertos compartidos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (este repositorio); BF16 en la version base. La model card menciona soporte numerico BF16 y NVFP4; las etiquetas de HuggingFace incluyen "8-bit" |
| Idiomas soportados | Ingles, con capacidades multilingues generales en otros idiomas; soporte de multiples lenguajes de programacion |
| Licencia | Apache 2.0, con politica de uso aceptable adicional del autor (`model-acceptable-use-policy`) |
| Formato de pesos | safetensors, libreria transformers, tipo de modelo `inkling_mm_model` |
| Modalidades de entrada | Texto (UTF-8), imagen (40 px a 4096 px por dimension recomendado), audio (WAV, 16 kHz, idealmente menos de 2 minutos) |
| Modalidad de salida | Texto (UTF-8) |
| Modelo base | thinkingmachines/Inkling-Small (relacion: quantized) |
| Tamano del repositorio | 170,8 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 42 capas con backbone de tipo Mixture-of-Experts disperso. Cada token se enruta a 6 de 256 expertos, a los que se suman 2 expertos compartidos que permanecen activos en todos los tokens, lo que da un total de 8 expertos efectivos por token y 12B parametros activos sobre 276B totales. El mecanismo de atencion es hibrido, combinando capas de atencion local con capas de atencion global, un patron habitual para reducir el coste cuadratico en contextos largos sin perder acceso global a la informacion.

El modelo es nativamente multimodal: las imagenes se codifican mediante un encoder jerarquico de parches y el audio mediante codificacion de tokens discretos. Todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. El entrenamiento se realizo sobre una mezcla amplia de contenido, incluyendo texto, imagenes, audio y video, procedente de fuentes publicas, de terceros y de datos sinteticos o aumentados. El proceso de curado incluye limpieza, deduplicacion y filtrado para eliminar datos de baja calidad, con pasos especificos orientados a objetivos de seguridad. La model card no detalla el numero de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

En cuanto a esta version concreta, se trata de una cuantizacion NVFP4 del modelo base, publicada por el usuario `bielquants`. No se documentan en la informacion disponible los detalles del proceso de cuantizacion (calibracion, granularidad de escalas, capas excluidas de la cuantizacion).

## Capacidades

- Generacion de texto conversacional e instrucciones en formato chat (`conversational`), con soporte multi-turno.
- Comprension de imagenes integrada en el decoder, con codificacion mediante encoder jerarquico de parches; recomendado entre 40 px y 4096 px por dimension.
- Comprension de audio en formato WAV a 16 kHz, con una duracion optima inferior a 2 minutos por clip.
- Razonamiento multimodal conjunto: texto, imagen y audio se proyectan al mismo espacio oculto y se procesan en una unica pasada del decoder.
- Soporte declarado para sistemas agenticos y de uso de herramientas (tool calling / function calling) en las aplicaciones objetivo descritas por el autor.
- Asistencia a la programacion y generacion de codigo en multiples lenguajes.
- Uso en sistemas de generacion aumentada por recuperacion (RAG).
- Capacidades multilingues generales, con ingles como idioma principal.
- Capacidad de ajuste fino e integracion en productos de terceros, al publicarse con pesos abiertos.

No se especifica en la informacion disponible si existe un modo de razonamiento explicito (thinking mode), ni ventana de contexto soportada, ni limites de tool calling.

## Casos de uso

- Asistencia de codigo en produccion: el modelo puede integrarse en asistentes de IDE o pipelines de CI/CD para revision de cambios, generacion de pruebas y explicacion de errores, apoyandose en su soporte declarado de tool calling y en su entrenamiento en multiples lenguajes de programacion.
- Atencion al cliente automatizada: gestion de conversaciones multi-turno con contexto conversacional, incluyendo la posibilidad de que el cliente adjunte capturas de pantalla o notas de voz, ya que el modelo acepta imagen y audio como entrada.
- Analisis de documentos con imagenes: extraccion y razonamiento sobre informacion contenida en capturas, diagramas o documentos escaneados, con el modelo generando texto estructurado a partir de la entrada visual.
- Transcripcion y resumen de audio: procesamiento de clips de voz de hasta aproximadamente 2 minutos en formato WAV 16 kHz para generar resumenes, actas o respuestas, sin necesidad de un pipeline ASR separado.
- Agentes autonomos multi-paso: uso como nucleo de razonamiento de un agente que invoca herramientas externas (APIs, bases de datos, buscadores) y encadena varios pasos, aprovechando la combinacion de MoE con 12B parametros activos para mantener el coste de inferencia controlado.
- Sistemas RAG multimodales: recuperacion de fragmentos de texto e imagenes desde un indice vectorial y generacion de respuestas fundamentadas, con el modelo procesando ambas modalidades de forma nativa en el mismo espacio oculto.
- Asistencia a la accesibilidad: descripcion de imagenes y de contenido de audio para usuarios con discapacidad visual o auditiva, generando texto a partir de cualquiera de las dos modalidades.
- Evaluacion comparativa de cuantizacion: uso de esta variante NVFP4 frente a la version BF16 para medir la perdida de calidad y la ganancia de eficiencia en memoria antes de decidir el formato de despliegue.
- Investigacion y ajuste fino: al publicarse bajo Apache 2.0 con pesos abiertos, sirve como base para fine-tuning especifico de dominio o para experimentos de interpretabilidad sobre enrutamiento MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base incluye una tabla comparativa en la que figuran, junto a Inkling-Small, los modelos Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash, pero los valores numericos de dicha tabla no estan presentes en la informacion proporcionada, por lo que no se reproducen.

## Requisitos de hardware

- Peso de los pesos en disco: 170,8 GB de repositorio en formato NVFP4. La VRAM necesaria para solo los pesos es del orden de 171 GB, a lo que hay que anadir KV cache, activaciones y buffers de comunicacion.
- GPU de consumo individual: no cabe. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) son insuficientes para el modelo completo; solo serian viables en configuraciones multi-GPU con paralelismo tensorial, y con sobrecoste de comunicacion.
- Configuraciones multi-GPU que si cubren el modelo (estimaciones a partir del tamano del repositorio): 3x H100 80 GB (240 GB) o 4x H100 80 GB (320 GB) con margen comodo; 2x B200 192 GB (384 GB) con margen amplio. Dos H100 de 80 GB (160 GB) no son suficientes.
- NVFP4 es un formato de 4 bits con soporte nativo en la arquitectura Blackwell de NVIDIA. En generaciones anteriores el uso de este formato puede requerir descompresion o emulacion, con impacto negativo en latencia y throughput.
- Librerias de despliegue mencionadas por el autor: SGLang, vLLM, TokenSpeed, Unsloth y transformers. No se menciona soporte de llama.cpp ni de Ollama para este formato.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de tiempo hasta el primer token en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bielquants/Inkling-Small-NVFP4 (este repositorio) | 276B totales / 12B activos segun model card (156,03B en safetensors) | no disponible | NVFP4 sobre transformers | Apache 2.0 | Pesos abiertos en HuggingFace |
| thinkingmachines/Inkling-Small (base, BF16) | 276B totales / 12B activos | no disponible | BF16 | Apache 2.0 | Pesos abiertos en HuggingFace |
| thinkingmachines/Inkling-Small-NVFP4 (oficial) | 276B totales / 12B activos | no disponible | NVFP4 | Apache 2.0 | Pesos abiertos en HuggingFace |
| Qwen3.5 397B-A17B | 397B totales / 17B activos (segun la tabla de la model card) | no disponible | no disponible | no disponible | Citado como pesos abiertos |
| MiMo V2.5 | no disponible | no disponible | no disponible | no disponible | Citado como pesos abiertos |
| Minimax M2.7 | no disponible | no disponible | no disponible | no disponible | Citado como pesos abiertos |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | Citado como pesos cerrados |

La comparacion directa con alternativas de la misma categoria queda limitada: la informacion disponible solo identifica los modelos incluidos en la tabla de evaluacion del autor (Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7 y DeepSeek V4 Flash), sin especificaciones tecnicas ni resultados numericos asociados. Se recomienda consultar las model cards de cada uno de ellos para completar la comparativa.

## Limitaciones y advertencias

- Discrepancia en el recuento de parametros: la model card declara 276B totales, mientras que el recuento real de los safetensors del repositorio es de 156.032.140.138 parametros. No se dispone de explicacion en la informacion proporcionada; conviene verificarlo antes de dimensionar infraestructura.
- Cuantizacion de terceros: el repositorio no lo publica el autor original del modelo, sino el usuario `bielquants`. No se documentan el metodo de calibracion ni la perdida de calidad respecto a la version BF16 u oficial NVFP4.
- Etiquetado de cuantizacion ambiguo: las etiquetas de HuggingFace indican "8-bit" mientras que la model card y el nombre del repositorio indican NVFP4 (4 bits). Conviene verificar la configuracion real de cuantizacion de los pesos.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de fidelidad para este modelo o su version cuantizada.
- Sesgos: no se documentan evaluaciones de sesgo ni de equidad en la informacion disponible. El entrenamiento con datos de internet es susceptible de incorporar sesgos presentes en esas fuentes.
- Limitaciones de idioma: el autor declara ingles como idioma principal, con capacidades multilingues generales no cuantificadas. El rendimiento en castellano no esta medido.
- Limites de contexto: no se especifica la longitud de contexto soportada, lo que impide garantizar el comportamiento en conversaciones o documentos largos.
- Restricciones de uso: aunque la licencia es Apache 2.0, el autor original publica una politica de uso aceptable adicional. Conviene revisarla antes de un despliegue comercial, ya que puede imponer condiciones mas alla de la propia licencia.
- Limitaciones de entrada multimodal: las recomendaciones del autor acotan las imagenes a 40-4096 px por dimension y el audio a WAV 16 kHz de menos de 2 minutos; fuera de esos rangos el rendimiento puede degradarse.
- Requisitos de hardware: no es desplegable en una GPU de consumo. La adopcion de NVFP4 esta ligada al soporte nativo en hardware Blackwell, lo que limita la portabilidad a otras plataformas.
- Sin senales de adopcion: el repositorio registra 0 descargas y 0 likes en la fecha de consulta, por lo que no existe validacion de la comunidad sobre su correcto funcionamiento.
- Version HF con licencia y politica: el modelo se distribuye con pesos abiertos, pero la ausencia de resultados de benchmarks publicados impide estimar su calidad relativa en tareas concretas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bielquants/Inkling-Small-NVFP4
- Modelo base BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Version NVFP4 oficial: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (repositorio): https://github.com/thinking-machines-lab/tinker-cookbook
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Receta de Unsloth: https://unsloth.ai/docs/models/inkling
- Blog de HuggingFace sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
