# ReadyArt/Dark-Craving-26B-A4B-v3.0-GGUF

## Resumen

Dark-Craving-26B-A4B-v3.0-GGUF es la version cuantizada en formato GGUF del modelo Dark-Craving-26B-A4B-v3.0, publicado por el usuario ReadyArt en HuggingFace. Se trata de un modelo de generacion de texto orientado a roleplay conversacional y contenido para adultos, con etiquetas explicitas de NSFW, ERP (erotic roleplay), "unaligned" y "mature". El repositorio es una conversion a GGUF del modelo base original, pensada para su ejecucion en entornos de inferencia local como llama.cpp u Ollama.

El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 26 mil millones de parametros totales y aproximadamente 4 mil millones de parametros activos por token (el sufijo "A4B" es habitual en este tipo de nomenclatura), si bien la model card no confirma explicitamente estos datos. El modelo esta disenado exclusivamente para ingles y se distribuye bajo licencia Apache 2.0, aunque su contenido esta restringido a audiencias adultas.

La relevancia de esta ficha es limitada desde el punto de vista de la investigacion tecnica: el repositorio no incluye informacion sobre arquitectura detallada, datos de entrenamiento, benchmarks ni proceso de alineamiento. Se trata de un modelo de nicho para roleplay adulto, con cero descargas y cero likes en el momento de la consulta, y sin documentacion tecnica sustantiva mas alla de la estetica de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE, sin confirmar) |
| Parametros totales | 26B (segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | ~4B (segun el sufijo A4B del nombre; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato GGUF; variantes concretas no listadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo en la model card. El nombre "26B-A4B" sugiere un transformer con mezcla de expertos (MoE) de 26 mil millones de parametros totales y aproximadamente 4 mil millones activos por token, pero esta interpretacion no viene confirmada por el autor. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras formas de alineamiento.

La model card se limita a metadatos y a una presentacion visual estilizada (CSS embebido con tematica gotica) sin contenido tecnico sustantivo. No hay informacion sobre innovaciones arquitectonicas, estrategias de decodificacion, atencion lineal ni tecnicas de optimizacion. La etiqueta "unaligned" sugiere que el modelo no ha pasado por un proceso de alineamiento restrictivo orientado a seguridad, lo cual es coherente con su orientacion a contenido explicito.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a roleplay multi-turno.
- Contenido explicito para adultos y escenarios de ERP (erotic roleplay).
- Modo instruct/conversacional segun las etiquetas del repositorio.
- Etiquetado como "unaligned", lo que implica ausencia de filtros de seguridad orientados a rechazar contenido sensible.
- No se documentan capacidades de codigo, matematicas, vision, audio ni tool calling.
- No se documenta soporte de function calling ni de razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun el campo `language`.

## Casos de uso

- Roleplay conversacional para adultos: el modelo esta disenado especificamente para mantener personajes y escenarios narrativos de larga duracion en ingles, con contenido explicito permitido.
- Escritura creativa de ficcion adulta: util para generar narrativa erotica o de terror con tono maduro, dado su etiquetado "mature" y "explicit".
- Simulacion de personajes en entornos de ocio: integrable en aplicaciones de chat de rol para usuarios adultos que buscan interacciones sin restricciones de contenido.
- Investigacion sobre modelos "unaligned": puede servir como objeto de estudio para analizar el comportamiento de modelos sin alineamiento de seguridad, siempre en entornos controlados y con supervision etica.
- Despliegue local en GGUF: al estar en formato GGUF, puede ejecutarse en llama.cpp u Ollama para pruebas offline sin dependencia de servicios en la nube.
- Prototipado de interfaces conversacionales: util para desarrolladores que necesiten un modelo de chat en ingles para probar UI de conversacion antes de integrar un modelo de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un modelo de ~26B en GGUF, las cuantizaciones Q4_K_M requeririan del orden de 15-16 GB de VRAM, y Q8_0 en torno a 27-28 GB, aunque estas cifras son estimaciones genericas y no estan confirmadas por el autor.
- GPU recomendadas: no disponible. Para un modelo de este tamano en cuantizacion 4-bit, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) podrian ser suficientes; para cuantizaciones mayores se requeririan A100/H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: probablemente en cuantizaciones bajas (Q4) en GPUs de 24 GB, aunque no confirmado.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (roleplay adulto no alineado) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Contenido explicito para adultos: el modelo esta etiquetado como NSFW, explicit y not-for-all-audiences; no debe desplegarse en entornos accesibles a menores.
- Ausencia de alineamiento de seguridad: la etiqueta "unaligned" implica que el modelo puede generar contenido sensible sin filtros, lo que supone un riesgo en produccion.
- Riesgo de alucinacion: no se documenta ningun proceso de evaluacion de fidelidad; en roleplay esto puede manifestarse como incoherencias narrativas.
- Solo ingles: no hay soporte multilingue documentado.
- Documentacion tecnica practicamente inexistente: sin arquitectura confirmada, contexto, datos de entrenamiento ni benchmarks.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el contenido generado puede estar sujeto a regulaciones locales sobre material adulto.
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion externa del modelo.
- Sin garantias de calidad ni mantenimiento por parte del autor.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v3.0-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Dark-Craving-26B-A4B-v3.0
