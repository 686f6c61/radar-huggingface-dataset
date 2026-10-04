# facebook/sam-audio-small

## Resumen

SAM-Audio small es un modelo desarrollado por Meta (Facebook) y publicado en HuggingFace con identificador facebook/sam-audio-small. Segun la descripcion del repositorio oficial de investigacion, SAM-Audio es un modelo fundacional orientado a aislar cualquier sonido dentro de una senal de audio utilizando indicaciones (prompts) de texto, visuales o temporales, es decir, separacion de fuentes sonoras guiada por distintos tipos de pistas. La variante "small" forma parte de una familia de modelos, lo que sugiere la existencia de versiones de mayor tamano, aunque la informacion disponible no detalla la jerarquia completa ni las diferencias entre ellas.

El modelo se publico el 12 de diciembre de 2025 y se actualizo el 30 de diciembre del mismo ano, acumulando 2.917 descargas y 118 "likes" en el momento de la consulta. El repositorio ocupa 5,1 GB, un dato que da una idea del orden de magnitud de los pesos, pero que no permite deducir de forma fiable el numero de parametros ni su precision numerica. La licencia es la denominada sam-license y el acceso esta restringido (gated): es necesario aceptar condiciones adicionales en HuggingFace antes de descargar los pesos.

Su relevancia actual reside en que aborda la separacion de audio de proposito general, un problema clasico donde los sistemas tradicionales estan especializados en dominios concretos (voz, musica, instrumentos). Un modelo fundacional capaz de aceptar prompts de texto, imagen o marcas temporales amplia el rango de aplicaciones practicas, desde la edicion de audio hasta el preprocesado de datos para entrenamiento. No obstante, la ficha tecnica publica es limitada y buena parte de las especificaciones no esta disponible en la informacion recopilada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (descrito como modelo fundacional para aislar sonidos mediante prompts de texto, visuales o temporales) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se ha confirmado que sea una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repositorio; los prompts de texto se ofrecen en ingles) |
| Licencia | sam-license (etiquetada como license: other) |
| Formato de pesos | no disponible |
| Modalidad | audio, con entradas auxiliares de texto, vision y marcas temporales |
| Tamano del repositorio | 5,1 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en HuggingFace |
| Paper | arXiv:2512.18099 |
| Fecha de publicacion | 2025-12-12 |
| Ultima actualizacion | 2025-12-30 |
| Descargas | 2.917 |
| Likes | 118 |

## Arquitectura y entrenamiento

La informacion disponible no permite describir en detalle la arquitectura interna del modelo. La documentacion publica del repositorio lo presenta como un modelo fundacional para aislar cualquier sonido en audio a partir de prompts de texto, visuales o temporales, lo que implica un diseno multimodal con al menos una torre de codificacion de audio y un mecanismo de condicionamiento por prompt. No se especifica si se trata de un transformer puro, de una arquitectura hibrida ni de un esquema de enmascaramiento espectral, ni se detalla el numero de capas, dimensiones ocultas o mecanismos de atencion.

Tampoco esta disponible el volumen de datos de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste por preferencias como RLHF o DPO. El identificador arXiv:2512.18099 apunta a un articulo tecnico que, presumiblemente, contiene estos detalles, pero su contenido no forma parte de la informacion proporcionada en esta busqueda.

## Capacidades

- Separacion de fuentes sonoras: aislamiento de un sonido concreto dentro de una mezcla de audio compleja.
- Condicionamiento por prompt de texto: seleccion del sonido objetivo mediante descripcion en lenguaje natural en ingles.
- Condicionamiento visual: uso de informacion de imagen o video para guiar la separacion (por ejemplo, aislar el sonido asociado a un objeto visible).
- Condicionamiento temporal: uso de marcas o referencias temporales para localizar el evento sonoro de interes.
- Procesamiento de audio de proposito general, no limitado a voz, musica o instrumentos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje generativo).
- Capacidades multilingues: no disponible; la etiqueta de idioma del repositorio es unicamente "en".
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de vision como salida: no disponible (la vision se emplea, segun la descripcion, como entrada de condicionamiento).

## Casos de uso

- Postproduccion de audio y video: aislar una fuente sonora concreta (por ejemplo, una voz o un instrumento) de una mezcla grabada en exterior, empleando un prompt de texto para describir el sonido objetivo y evitar tener que disponer de pistas separadas en rodaje.
- Limpieza de grabaciones de campo: eliminar o extraer eventos sonoros especificos (sirenas, trafico, maquinaria) de grabaciones ambientales, usando prompts descriptivos para iterar sobre distintas fuentes sin reentrenar el modelo.
- Creacion de datasets de entrenamiento: generar pares de audio mezclado y fuente aislada para entrenar otros sistemas de reconocimiento de audio o de separacion, aprovechando la capacidad de condicionar por texto.
- Sincronizacion audio-video: dado un video, emplear el condicionamiento visual para aislar el sonido asociado a un objeto o persona concreta en la imagen, util en edicion automatica de contenido.
- Analisis forense y monitorizacion: extraer eventos acusticos relevantes de registros largos mediante indicaciones temporales, facilitando la revision por parte de analistas humanos.
- Preprocesado para reconocimiento de voz: separar la voz del hablante de ruido de fondo no estacionario antes de alimentar un sistema ASR, con la ventaja de poder especificar el hablante o el tipo de fuente.
- Herramientas creativas de edicion: permitir a musicos y disenadores de sonido aislar o sustituir elementos concretos de una mezcla mediante lenguaje natural, sin necesidad de stems previos.
- Investigacion en representaciones de audio: usar el modelo como extractor de caracteristicas o como referencia en estudios comparativos de separacion condicionada por prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 5,1 GB, pero no se especifica el formato ni la precision de los pesos, por lo que no es posible derivar de forma fiable la memoria necesaria.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Sin datos de parametros y precision no puede afirmarse que quepa en tarjetas como la RTX 4090 o similares.
- Opciones de despliegue: no disponible. El repositorio de investigacion en GitHub (facebookresearch/sam-audio) es la referencia conocida para ejecutar el modelo; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, herramientas orientadas a modelos de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de los modelos alternativos en la informacion proporcionada. La tabla siguiente recoge unicamente la existencia de alternativas del mismo ambito (separacion de fuentes de audio), sin cifras contrastadas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM-Audio small (facebook) | no disponible | no disponible | no disponible | sam-license (gated) | HuggingFace, acceso restringido |
| AudioSep y variantes de separacion guiada por texto | no disponible | no disponible | no disponible | no disponible | no disponible |
| HTDemucs (familia Demucs, Meta) | no disponible | no disponible | no disponible | no disponible | no disponible |
| SAM-Audio (variantes de mayor tamano) | no disponible | no disponible | no disponible | sam-license | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta en la informacion recopilada ningun analisis de sesgos por tipo de voz, idioma, acento o genero musical.
- Riesgo de alucinacion: no aplica en el sentido habitual de generacion de texto, pero si existe riesgo de artefactos o de "invencion" de contenido espectral al separar fuentes: el modelo puede introducir senal que no estaba presente en la mezcla original.
- Limitaciones de contexto: no disponible. Se desconoce la duracion maxima de audio que el modelo procesa en una sola pasada.
- Limitaciones de idioma: la etiqueta del repositorio indica unicamente ingles para los prompts de texto; no se ha confirmado el comportamiento con prompts en castellano u otros idiomas.
- Licencia: la licencia sam-license, etiquetada como "other", no es una licencia de codigo abierto estandar. Es imprescindible revisar sus terminos antes de cualquier uso comercial o de redistribucion.
- Acceso restringido: el modelo esta en modo gated y requiere aceptar condiciones adicionales en HuggingFace, lo que puede afectar a la automatizacion de pipelines de descarga en entornos de produccion.
- Documentacion incompleta: no hay ficha de pipeline, ni especificacion de formatos de pesos, ni guia de cuantizacion publicada, lo que dificulta planificar el despliegue.
- Calidad de la separacion: no disponible. Sin benchmarks publicados no puede estimarse el SDR u otras metricas objetivas frente a alternativas especializadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/facebook/sam-audio-small
- Repositorio oficial en GitHub: https://github.com/facebookresearch/sam-audio
- Paper (referencia arXiv incluida en las etiquetas del modelo): https://arxiv.org/abs/2512.18099
