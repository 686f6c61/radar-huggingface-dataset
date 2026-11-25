# DavidAU/Inkling-2-Mini-26B-The-DECKARD-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI

## Resumen

Inkling-2-Mini-26B-The-DECKARD-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI es un ajuste fino (finetune) del modelo thinkingmachines/Inkling-2-Mini, publicado por el usuario DavidAU en Hugging Face. Se trata de una variante "abliterated" y "uncensored" del modelo base, es decir, con las capas de rechazo y alineacion de seguridad atenuadas o eliminadas, orientada a usos creativos, roleplay y generacion de contenido sin restricciones tematicas. El autor lo presenta como un modelo con "27 modos de razonamiento", "27 modos de instruccion" y un conjunto de "AI Constructs" (perfiles de comportamiento predefinidos) orientados a tareas como docencia, programacion, agentes o brainstorming.

El modelo se distribuye con licencia Apache 2.0 y pesos en bfloat16, y segun las etiquetas de Hugging Face esta construido sobre una arquitectura de mezcla de expertos (MoE), aunque no se detalla el numero de parametros activos ni la configuracion exacta de los expertos. El identificador incluye "26B", lo que sugiere un tamano total en torno a los 26 mil millones de parametros, si bien esta cifra no aparece confirmada de forma explicita en los metadatos disponibles.

La relevancia de esta ficha es acotada: se trata de un modelo derivado de un base poco documentado publicamente, con cero descargas en el momento de la consulta y acceso restringido (gated), lo que limita su evaluacion independiente. Resulta util para desarrolladores interesados en variantes sin censura de modelos MoE con modos de razonamiento configurables, pero debe tratarse con cautela por la ausencia de benchmarks y de documentacion tecnica detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) segun etiquetas; detalles de capas y atencion no disponibles |
| Parametros totales | 26B (inferido del identificador del modelo; no confirmado explicitamente) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos publicados en bfloat16; no se documentan otras cuantizaciones (GGUF, AWQ, GPTQ) en la informacion disponible |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | bfloat16 (safetensors presumiblemente; no confirmado) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es thinkingmachines/Inkling-2-Mini y que el ajuste fino emplea una arquitectura MoE. Las etiquetas mencionan "unsloth" y "NEO Imatrix", lo que sugiere que el proceso de ajuste se realizo con herramientas de Unsloth y que se genero una matriz de importancia (imatrix) para cuantizacion, aunque no se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en esta variante.

El autor describe la variante como "heretic" y "abliterated", terminos que en la comunidad de modelos abiertos designan ajustes finos destinados a eliminar o reducir el comportamiento de rechazo del modelo original. Ademas, se anuncia un sistema de "27 reasoning modes" y "27 instruct modes" junto con "AI Constructs" (perfiles preconfigurados como Brainstorm, Universal Teacher, Agent o Coder), que probablemente se implementan mediante prompts de sistema o plantillas de instruccion embebidas en la model card, no mediante cambios estructurales en la arquitectura. No se dispone de informacion sobre innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto general, con enfasis en escritura creativa, narrativa de ficcion y roleplay.
- Modos de razonamiento configurables (hasta 27 segun el autor), incluyendo modos "Xhigh" de razonamiento extendido.
- Modos de instruccion para distintos estilos de respuesta.
- Perfiles de comportamiento predefinidos ("AI Constructs"): Brainstorm, Brainstorm Business, Universal Teacher, Agent, Coder, entre otros.
- Capacidad de procesamiento imagen-texto a texto (pipeline image-text-to-text), lo que implica soporte multimodal de entrada.
- Soporte multilingue limitado a ingles y chino.
- Generacion de codigo (perfil Coder) y asistencia en tareas de programacion.
- Comportamiento sin censura ("uncensored", "abliterated"), orientado a contenido que otros modelos rechazarian.
- No se documenta explicitamente soporte de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Escritura creativa y narrativa: el modelo puede generar relatos, dialogos y ficcion de genero sin las restricciones tematicas habituales, gracias a su orientacion "uncensored" y a los modos de escritura creativa declarados.
- Roleplay y personajes conversacionales: los "AI Constructs" y los modos de instruccion permiten fijar personalidades y estilos de respuesta consistentes en conversaciones multi-turno.
- Asistencia a docencia: el perfil "Universal Teacher" esta pensado para explicar conceptos y generar material didactico adaptado al nivel del estudiante.
- Generacion de codigo asistida: el perfil "Coder" permite usar el modelo para autocompletar, explicar o refactorizar codigo en flujos de desarrollo, siempre que se valide la salida.
- Brainstorming de producto y negocio: los perfiles "Brainstorm" y "Brainstorm Business" estan orientados a la generacion de ideas y a la exploracion de escenarios.
- Flujos agenticos experimentales: el perfil "Agent" sugiere su uso como nucleo de razonamiento en pipelines de agentes, aunque la ausencia de documentacion sobre tool calling limita su integracion directa.
- Procesamiento de imagenes con texto asociado: al ser un modelo image-text-to-text, puede emplearse para describir o razonar sobre imagenes acompanadas de instrucciones textuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 y un tamano total en torno a 26B, se requiere aproximadamente 52 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria los 26 GB y en 4 bits unos 13-15 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas para bfloat16: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2x A100 40 GB o 2x RTX 4090 24 GB).
- GPU de consumo: en cuantizacion de 4 bits podria caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB); en bfloat16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: no se documentan integraciones especificas; al ser un modelo de Hugging Face, seria desplegable con vLLM, TGI o llama.cpp si se generan las cuantizaciones correspondientes, pero esto no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkling-2-Mini-26B-The-DECKARD-Heretic (este modelo) | ~26B (MoE, no confirmado) | no disponible | Apache 2.0 | Finetune sin censura, acceso gated, sin benchmarks publicos |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | Modelo original sin el ajuste heretic/abliterated |
| Otras variantes "abliterated" de la comunidad | variable | variable | variable | Existen multiples finetunes sin censura de modelos abiertos, pero no se dispone de datos comparativos verificables |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas de forma objetiva.
- Modelo "uncensored" y "abliterated": puede generar contenido ofensivo, ilegal o danino; no es adecuado para aplicaciones de produccion orientadas al publico sin filtros adicionales.
- Riesgo elevado de alucinacion, agravado por la falta de documentacion sobre datos de entrenamiento y por la atenuacion de las capas de alineacion.
- Soporte idiomatico limitado a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para su adopcion.
- Cero descargas y un solo "like" en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el caracter sin censura del modelo puede implicar responsabilidades legales y de moderacion para quien lo despliegue.
- No se documentan cuantizaciones oficiales ni integraciones con frameworks de inferencia, lo que complica el despliegue en produccion.
- La cifra de 26B parametros y la arquitectura MoE provienen del identificador y las etiquetas, no de una model card tecnica verificable.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Inkling-2-Mini-26B-The-DECKARD-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
