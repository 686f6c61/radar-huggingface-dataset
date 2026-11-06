# electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged

## Resumen

LFM2.5-24B-A2B-uncensored-fiction-nblora-merged es un ajuste fino (fine-tune) del modelo electroglyph/LFM2.5-24B-A2B-uncensored, publicado por el usuario electroglyph en Hugging Face. Se trata de un modelo derivado de la familia LFM2.5 de Liquid AI, en su variante de 24B de parametros totales con arquitectura MoE (mezcla de expertos) y aproximadamente 2B de parametros activos, segun indica el propio nombre del identificador. El ajuste se ha realizado mediante SFT (supervised fine-tuning) con la libreria TRL, y el sufijo "fiction" sugiere una especializacion en generacion de narrativa y ficcion.

El modelo base pertenece a la estirpe "uncensored", lo que implica que se ha eliminado o reducido el alineamiento de seguridad del modelo original, y este fine-tune anade una capa adicional de especializacion en ficcion. El repositorio ocupa 97,8 GB y contiene pesos en formato safetensors, lo que es coherente con un modelo de 24B de parametros en precision alta (probablemente bf16 o fp16, dado que 24B parametros a 16 bits ocupan aproximadamente 48 GB, y el resto del espacio podria corresponder a multiples checkpoints o al modelo base incluido).

La relevancia de esta ficha es limitada pero real: se trata de un modelo muy reciente (creado en noviembre de 2026), con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva y sin datos de benchmarks publicados. Es, por tanto, un artefacto de investigacion o experimentacion personal mas que un modelo listo para produccion. Su interes radica en la combinacion de una arquitectura MoE eficiente (2B activos sobre 24B totales) con un fine-tune orientado a ficcion sin restricciones de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) segun el identificador del modelo; detalles de capas y configuracion no disponibles |
| Parametros totales | 24B (segun el identificador del modelo) |
| Parametros activos | ~2B (segun el identificador del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye el campo "licence: license" sin especificar) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 97,8 GB |
| Modelo base | electroglyph/LFM2.5-24B-A2B-uncensored |
| Libreria | transformers |
| Metodo de entrenamiento | SFT con TRL 1.18.0.dev0 |
| Fecha de creacion | 2026-11-03 |

## Arquitectura y entrenamiento

La informacion disponible no permite detallar la arquitectura interna mas alla de lo que indica el nombre del modelo: se trata de un transformer con mezcla de expertos (MoE) de 24B de parametros totales y aproximadamente 2B activos por token. Esta configuracion es caracteristica de la familia LFM2.5 de Liquid AI, que disena modelos eficientes para despliegue en dispositivos con recursos limitados manteniendo una capacidad de parametros totales elevada. No se dispone de datos sobre el numero de expertos, el numero de capas, la dimension del modelo, el mecanismo de atencion ni la longitud de contexto nativa.

En cuanto al entrenamiento, la model card confirma unicamente que se ha aplicado SFT (supervised fine-tuning) sobre el modelo base electroglyph/LFM2.5-24B-A2B-uncensored, utilizando TRL en su version 1.18.0.dev0, con Transformers 5.22.1, PyTorch 2.15.0, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifica el volumen de datos de entrenamiento, la composicion del dataset, si hubo etapas de RLHF o DPO, ni la naturaleza exacta del corpus de ficcion utilizado. El nombre del checkpoint ("output-fiction2-nblora") sugiere el uso de una tecnica de adaptacion tipo LoRA o variante (nblora) posteriormente fusionada con los pesos base, pero no se detalla el rango, los modulos objetivo ni la tasa de aprendizaje empleada.

## Capacidades

- Generacion de texto narrativo y ficcion: el fine-tune esta orientado explicitamente a la produccion de ficcion, presumiblemente con menor filtrado de contenido que el modelo base original.
- Generacion de texto general: al derivar de un modelo de 24B con 2B activos, conserva la capacidad de generacion de lenguaje del modelo base, aunque no se han publicado evaluaciones que lo confirmen.
- Conversacion multi-turno: la model card incluye un ejemplo de uso con el formato de chat (lista de mensajes con rol "user"), lo que indica soporte del template conversacional.
- Tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se menciona.
- Capacidades multilingues: no disponible; no se especifican idiomas.
- Modo thinking, vision o audio: no disponible; no se menciona ninguna capacidad multimodal.
- Contenido sin censura: el modelo base es una variante "uncensored", por lo que se espera una menor aplicacion de rechazos de seguridad, aunque no hay documentacion que cuantifique este comportamiento.

## Casos de uso

- Generacion de narrativa larga y ficcion por capitulos: el modelo puede emplearse para redactar borradores de novelas, relatos o guiones donde se requiera continuidad estilistica y ausencia de filtros de contenido. Su condicion de fine-tune sobre un modelo "uncensored" lo hace adecuado para generos que otros modelos rechazan, como terror extremo o ficcion adulta.
- Prototipado de asistentes de escritura creativa: desarrolladores que construyan herramientas de ayuda a escritores pueden integrar el modelo via transformers con `pipeline("text-generation")` y `device_map="auto"`, como muestra la propia model card, para generar sugerencias de trama, dialogos o descripciones.
- Experimentacion en investigacion sobre alineamiento y censura: al ser un modelo deliberadamente sin censura, sirve como objeto de estudio para comparar comportamientos de rechazo, sesgos y calidad narrativa frente a modelos alineados.
- Generacion de contenido para juegos de rol de mesa o videojuegos narrativos: el modelo puede generar respuestas de personajes no jugadores (NPC) y descripciones de escenarios con un tono consistente, aprovechando su especializacion en ficcion.
- Fine-tuning posterior sobre dominios narrativos especificos: al estar publicado en safetensors y ser compatible con transformers y TRL, puede servir como punto de partida para ajustes adicionales en generos concretos (ciencia ficcion, romantica, etc.).
- Despliegue en entornos con recursos moderados: gracias a sus aproximadamente 2B de parametros activos, la inferencia es mas barata que la de un modelo denso de 24B, lo que permite ejecutarlo en GPUs de gama alta de consumo si se cuantiza, aunque no se han publicado mediciones concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Como referencia orientativa, un modelo de 24B parametros en bf16 requiere aproximadamente 48 GB solo para los pesos; en cuantizacion de 8 bits rondaria los 24 GB y en 4 bits unos 12-14 GB. Al ser MoE con 2B activos, el coste computacional por token es menor que el de un denso de 24B, pero la memoria necesaria para cargar todos los expertos sigue siendo la del total de parametros.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, serian necesarias GPUs con 48 GB o mas (A100 80GB, H100, L40S) para precision completa, o GPUs de 24 GB (RTX 4090, A10G) con cuantizacion de 8 bits.
- Compatibilidad con GPU de consumo: probable solo con cuantizacion agresiva (4 bits) en GPUs de 24 GB como la RTX 4090; no confirmado por el autor.
- Opciones de despliegue: transformers (confirmado por la model card y los tags), y presumiblemente vLLM, TGI o llama.cpp si se generan pesos GGUF, aunque no se ha publicado ninguna conversion ni se menciona soporte.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged | 24B | ~2B | no disponible | no disponible | Hugging Face, 0 descargas |
| electroglyph/LFM2.5-24B-A2B-uncensored (modelo base) | 24B | ~2B | no disponible | no disponible | Hugging Face |
| Familia LFM2.5 de Liquid AI (modelo original) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de rendimiento, contexto ni licencia de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a parametros y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es una plantilla autogenerada por TRL, sin descripcion del dataset, hiperparametros, evaluacion ni limitaciones conocidas.
- Cero validacion externa: el modelo tiene 0 descargas y 0 likes, sin evidencia de uso o evaluacion por terceros.
- Riesgo elevado de alucinacion: no se ha realizado ninguna evaluacion de fidelidad factual; al ser un fine-tune orientado a ficcion, es probable que priorice la creatividad sobre la exactitud.
- Contenido sin censura: la variante "uncensored" del modelo base implica que puede generar contenido sensible, ofensivo o inapropiado sin los filtros habituales; no es apto para aplicaciones orientadas al publico general sin moderacion adicional.
- Licencia no especificada: el campo de licencia es ambiguo ("licence: license"), lo que impide determinar si el uso comercial esta permitido. No debe usarse en produccion sin aclarar este punto con el autor.
- Idiomas no especificados: no se puede garantizar un rendimiento aceptable en castellano ni en otros idiomas distintos del ingles, que es el idioma presumible del dataset de entrenamiento.
- Contexto desconocido: se desconoce la longitud de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- Tamano del repositorio (97,8 GB) superior al esperado para 24B en bf16: podria indicar la inclusion de multiples checkpoints o pesos en mayor precision, lo que complica el despliegue y aumenta los requisitos de almacenamiento.
- Fecha de creacion futura (2026-11-03): el modelo esta fechado en el futuro respecto al momento habitual de consulta, lo que sugiere que puede tratarse de un artefacto de experimentacion o de una publicacion con metadatos anomalos.
- Sin garantias de soporte: al ser un fine-tune personal de un usuario individual, no hay mantenimiento, versionado ni canal de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored-fiction-nblora-merged
- Modelo base: https://huggingface.co/electroglyph/LFM2.5-24B-A2B-uncensored
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
