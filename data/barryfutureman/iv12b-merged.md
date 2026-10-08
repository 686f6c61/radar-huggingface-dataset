# BarryFutureman/iv12b-merged

## Resumen

BarryFutureman/iv12b-merged es un modelo de 11.959.730.224 parametros (aproximadamente 12B) publicado en HuggingFace por el usuario BarryFutureman, con pipeline declarado image-text-to-text y etiqueta de arquitectura gemma4_unified. Se trata de un ajuste fino de tipo LoRA + SFT sobre el modelo AEON-7/Gemma-4-12B-it-AEON-Abliterated-K4-BF16, posteriormente fusionado (el sufijo "merged" del nombre indica que los pesos del adaptador se han integrado en los pesos base, generando un checkpoint autonomo en formato safetensors).

El modelo esta orientado a conversacion y a interpretacion de personaje ("character"), lo que lo situa en la categoria de modelos multimodales conversacionales especializados en mantener una persona concreta en lugar de un asistente generico. Al heredar la base multimodal (entrada de imagen y texto) y una variante "abliterated" del Gemma-4-12B-it, combina capacidad de vision y lenguaje con un alineamiento de seguridad presumiblemente reducido.

Su relevancia practica es limitada por el momento: el repositorio esta restringido (gated), acumula 0 descargas y 0 likes, y no se han publicado datos de entrenamiento, benchmarks ni lista de idiomas. Se trata, por tanto, de un checkpoint experimental sin validacion publica, interesante para quien quiera inspeccionar un merge de LoRA sobre una base multimodal abliterada, pero no recomendable como componente de produccion sin evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetada como gemma4_unified (arquitectura unificada multimodal de la familia Gemma 4); no se detalla la estructura interna (transformer denso, hibrida o MoE) |
| Parametros totales | 11.959.730.224 (~12B), segun safetensors |
| Parametros activos | No aplica / no disponible: no se indica que sea un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos safetensors. El tamano del repo (24,0 GB) es compatible con pesos en BF16 (11,96B x 2 bytes = ~23,9 GB), por lo que se infiere BF16 como unico formato publicado |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | AEON-7/Gemma-4-12B-it-AEON-Abliterated-K4-BF16 |
| Tipo de ajuste | LoRA + SFT, fusionado en los pesos base |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Tamano del repositorio | 24,0 GB |

## Arquitectura y entrenamiento

La informacion publicada no describe la arquitectura interna del modelo. La etiqueta gemma4_unified y la pertenencia a la familia Gemma 4 indican una arquitectura unificada que procesa imagen y texto (pipeline image-text-to-text), pero no se especifica si el backbone es un transformer denso, un hibrido con atencion lineal o una variante con mezcla de expertos. Tampoco se documentan el mecanismo de procesamiento visual (resolucion de imagen, numero de tokens por imagen, tipo de proyector) ni la ventana de contexto efectiva. Todo ello queda como "no disponible".

Respecto al entrenamiento, las etiquetas confirman un ajuste supervisado (SFT) mediante LoRA sobre AEON-7/Gemma-4-12B-it-AEON-Abliterated-K4-BF16, con un objetivo declarado de tipo "character" (interpretacion de personaje). No se publican el numero de tokens de entrenamiento, la composicion del dataset, el rango y alpha del LoRA, la tasa de aprendizaje ni si hubo fases adicionales de DPO, RLHF o RL. El nombre del modelo base incluye el termino "Abliterated", lo que en la practica habitual de la comunidad sugiere una variante con el alineamiento de rechazo eliminado o atenuado, aunque el autor no documenta el metodo empleado (direccion de ablacion, capas afectadas, etc.): cualquier afirmacion al respecto es una inferencia a partir del nombre y no un dato confirmado.

## Capacidades

- Generacion de texto conversacional multi-turno, con orientacion a mantener una persona o personaje coherente a lo largo de la conversacion.
- Comprension de imagenes combinada con texto (image-text-to-text), heredada de la base multimodal Gemma-4-12B-it.
- Respuesta a instrucciones en formato chat, dado que la base es una variante "it" (instruction-tuned).
- Comportamiento de personaje ("character"): adecuado para roleplay, simulacion de interlocutores o asistentes con voz propia.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se publica lista de idiomas).
- Capacidades especiales (modo thinking, audio, vision adicional): vision confirmada por el pipeline; modo de razonamiento explicito y audio, no disponibles.

## Casos de uso

- Personajes conversacionales para entretenimiento: el ajuste "character" sobre una base instruct permite desplegar un interlocutor con personalidad estable en una aplicacion de chat o novela visual, siempre que se valide manualmente la coherencia de la persona en conversaciones largas.
- Descripcion de imagenes con estilo propio: al ser un modelo image-text-to-text, se puede usar para generar descripciones, resumenes o narraciones de una imagen con una voz concreta (por ejemplo, un narrador con tono definido), en lugar de una caption generica.
- Prototipado de asistentes multimodales en investigacion: sirve como punto de partida para estudiar como afecta un merge de LoRA de personaje a las capacidades de vision heredadas de la base, comparando respuestas antes y despues del ajuste.
- Analisis de imagenes en flujos internos no criticos: clasificacion o etiquetado asistido de capturas y fotografias donde el coste de un error es bajo y existe revision humana posterior.
- Generacion de dialogos para guiones o videojuegos: produccion de lineas de dialogo consistentes con un personaje concreto, integradas en un pipeline de escritura que un editor humano revisa.
- Banco de pruebas de seguridad y alineamiento: dado que la base es una variante "abliterated", el modelo es util para evaluar hasta que punto el ajuste posterior recupera o pierde comportamientos de rechazo, dentro de un entorno controlado de investigacion.
- Educacion y demostraciones tecnicas: ilustrar en un aula o articulo como se fusiona un adaptador LoRA sobre un modelo multimodal y que efectos tiene sobre el checkpoint final.

En todos los casos, el acceso gated, la ausencia de benchmarks y la falta de validacion por parte de la comunidad obligan a una evaluacion propia antes de cualquier uso real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion, ni comparaciones con la base AEON-7/Gemma-4-12B-it-AEON-Abliterated-K4-BF16 o con el Gemma-4-12B-it original. Tampoco se documentan metricas de calidad de personaje, tasas de rechazo o evaluaciones de seguridad.

## Requisitos de hardware

- VRAM estimada en BF16 (formato publicado): los 11,96B de parametros ocupan aproximadamente 23,9 GB solo en pesos. Sumando cache KV y activaciones, conviene reservar del orden de 28-32 GB para contextos moderados. Las cifras son estimaciones de calculo, no datos publicados por el autor.
- GPUs de datacenter: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB pueden alojar el modelo en BF16. Para lotes grandes o contextos largos es preferible la configuracion de 80 GB.
- GPUs de consumo: en BF16 es ajustado en tarjetas de 24 GB (RTX 3090, RTX 4090) y solo viable con contextos cortos y poca concurrencia; una RTX 5090 de 32 GB ofrece mayor margen. Para uso comodo en consumo hace falta cuantizacion.
- VRAM con cuantizacion (estimacion): INT8/FP8 en torno a 12-13 GB de pesos, apto para RTX 4090, RTX 3090 o A6000; INT4 en torno a 7-8 GB, apto para RTX 3060 12 GB, RTX 4070 o Apple Silicon con 16 GB o mas. Estos formatos no estan publicados y requeririan conversion propia.
- Opciones de despliegue: el repositorio esta en formato transformers (safetensors), por lo que la via directa es la libreria transformers con el soporte multimodal correspondiente. Para llama.cpp u Ollama seria necesaria una conversion a GGUF que no se distribuye. El soporte en vLLM o TGI no esta confirmado en la informacion disponible y depende de que dichos motores implementen la arquitectura gemma4_unified y su torre de vision.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, tiempo hasta el primer token ni comportamiento bajo batching.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo evaluado, por lo que la comparacion se limita a caracteristicas publicas. Se incluyen alternativas abiertas de tamano y naturaleza comparables; los datos del modelo evaluado marcados como "no disponible" reflejan la ausencia de informacion en su ficha.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BarryFutureman/iv12b-merged | ~12B | No disponible | Imagen + texto | Gemma | Gated en HuggingFace, 0 descargas |
| Gemma 3 12B-it | ~12B | 128K | Imagen + texto | Gemma | Publico en HuggingFace |
| Mistral Nemo 12B | ~12B | 128K | Texto | Apache 2.0 | Publico en HuggingFace |
| Pixtral 12B | ~12B | 128K | Imagen + texto | Apache 2.0 | Publico en HuggingFace |

La comparacion con Gemma 4 12B-it, el Gemma-4-12B-it original o la propia base AEON-7 no es posible con los datos disponibles: no se conocen ni la ventana de contexto ni los resultados del modelo evaluado frente a ellos.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni evaluaciones de terceros. No hay evidencia publica de que el merge funcione correctamente.
- Base "abliterated": el modelo parte de una variante con el alineamiento de seguridad presumiblemente eliminado o atenuado. Es previsible una menor tasa de rechazo ante peticiones problematicas y una mayor facilidad para generar contenido danino. No se documenta el metodo de ablacion ni su alcance.
- Riesgo de alucinacion: sin datos de evaluacion, no hay estimacion de la tasa de alucinacion. Al tratarse de un ajuste de personaje sobre una base multimodal, es esperable que las descripciones de imagenes incorporen detalles no presentes en la imagen, especialmente con LoRA de personaje.
- Sesgos: no se publica ninguna evaluacion de sesgos. El dataset de SFT es desconocido, por lo que no se puede descartar la amplificacion de sesgos de genero, raza, idioma o cultura heredados de la base y del corpus de ajuste.
- Idiomas: no se declara la lista de idiomas soportados. El comportamiento fuera del ingles o de los idiomas mayoritarios de la base Gemma es impredecible.
- Contexto: se desconoce la longitud de contexto efectiva, por lo que no se debe asumir que soporta ventanas largas aunque la familia Gemma suela ofrecerlas.
- Restricciones de licencia: la licencia es Gemma. El uso comercial esta permitido por los Gemma Terms of Use, pero sujeto a la politica de uso prohibido y a las obligaciones de atribucion y de redistribucion de las condiciones. Cualquier producto derivado debe cumplir dichos terminos. Ademas, el acceso esta restringido (gated), lo que obliga a aceptar condiciones adicionales en HuggingFace antes de descargar los pesos.
- Trazabilidad: no se documentan los datos de entrenamiento, los hiperparametros del LoRA ni el proceso de fusion. Esto dificulta la reproducibilidad y la auditoria del checkpoint.
- Uso en produccion: no recomendado sin una evaluacion propia de calidad, seguridad, latencia y coste, dado que no existe ninguna metrica publica ni soporte confirmado en motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BarryFutureman/iv12b-merged
- Modelo base: https://huggingface.co/AEON-7/Gemma-4-12B-it-AEON-Abliterated-K4-BF16
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
