# ayb-bh92/Ace-Step1.5

## Resumen

ACE-Step 1.5 es un modelo fundacional de generación de música de código abierto desarrollado conjuntamente por ACE Studio y StepFun. El repositorio analizado, `ayb-bh92/Ace-Step1.5`, es una réplica alojada por el usuario ayb-bh92 del modelo `acestep-v15-turbo`, la variante destilada para inferencia en pocos pasos de la familia ACE-Step v1.5. El modelo resuelve el problema de la generación de audio musical (text2music) a partir de descripciones textuales, ampliando el rango desde bucles cortos hasta composiciones de hasta 10 minutos.

La arquitectura es híbrida: un modelo de lenguaje (basado en Qwen3, en variantes de 0,6B, 1,7B y 4B) actúa como planificador y transforma la consulta del usuario en un "plano" completo de la canción, incluyendo metadatos, letra y descripciones, mediante razonamiento en cadena (Chain-of-Thought). Ese plano guía después a un Diffusion Transformer (DiT) que sintetiza el audio final. Esta alineación se consigue con aprendizaje por refuerzo intrínseco, sin modelos de recompensa externos.

El modelo es relevante porque combina licencia MIT, uso comercial explícitamente permitido, entrenamiento sobre datos con licencia y libres de derechos, y un coste de inferencia muy bajo: la variante turbo genera una canción completa en menos de 2 segundos en una A100 y menos de 10 segundos en una RTX 3090, con un consumo declarado inferior a 4 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: modelo de lenguaje (LM) planificador basado en Qwen3 + Diffusion Transformer (DiT) |
| Parametros totales | no disponible (repo de 10,1 GB; LM disponibles en 0,6B, 1,7B y 4B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo declara funcionar con menos de 4 GB de VRAM) |
| Idiomas soportados | 50+ idiomas segun la model card (la metadata de HuggingFace los marca como no disponibles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACE-Step 1.5 emplea una arquitectura hibrida compuesta por dos piezas. Por un lado, un modelo de lenguaje que actua como planificador "omnicapaz": convierte una consulta simple en un plano de cancion completo, escalando desde bucles cortos hasta composiciones de 10 minutos, y sintetiza metadatos, letra y descripciones mediante Chain-of-Thought. Por otro, un Diffusion Transformer (DiT) que recibe ese plano y genera el audio. La alineacion entre ambos se logra mediante aprendizaje por refuerzo intrinseco que se apoya unicamente en mecanismos internos del modelo, evitando los sesgos de modelos de recompensa externos o de preferencias humanas.

El proyecto ofrece varias variantes de DiT: `acestep-v15-base` (preentrenamiento, 50 pasos, con CFG), `acestep-v15-sft` (con ajuste supervisado), `acestep-v15-turbo` (con SFT, 8 pasos, sin CFG, la variante replicada en este repositorio) y `acestep-v15-turbo-rl` (con RL, pendiente de publicacion). Los modelos de lenguaje disponibles son `acestep-5Hz-lm-0.6B` (desde Qwen3-0.6B), `acestep-5Hz-lm-1.7B` (desde Qwen3-1.7B) y `acestep-5Hz-lm-4B` (desde Qwen3-4B). El entrenamiento se realizo sobre un conjunto de datos masivo y legalmente conforme compuesto por musica con licencia profesional, musica libre de derechos y de dominio publico, y datos sinteticos generados mediante conversion MIDI-a-audio. No se especifica en la informacion disponible el numero de tokens de audio ni el detalle del pipeline de RLHF o DPO.

## Capacidades

- Generacion de musica a partir de texto (text2music) con control estilistico preciso.
- Planificacion mediante Chain-of-Thought: generacion de metadatos, letra y descripciones que guian la sintesis.
- Adherencia estricta a las instrucciones del prompt en mas de 50 idiomas.
- Composiciones de duracion variable, desde bucles cortos hasta canciones de 10 minutos.
- Edicion musical: generacion de covers, repintado (repainting) y conversion voz-a-BGM.
- Extraccion (extract), lego y completado (complete) en las variantes base segun el model zoo.
- Modelos de lenguaje auxiliares con comprension de audio y reescritura de consultas (query rewrite); la variante de 4B ofrece mejor comprension de audio y capacidad de composicion.
- No se menciona soporte de tool calling ni function calling en la informacion disponible.
- No se menciona soporte de agentes ni multimodalidad visual o de audio de entrada mas alla de la comprension de audio de los LM.

## Casos de uso

- Produccion musical asistida: el modelo genera una pista completa a partir de una descripcion textual, usando la planificacion CoT para producir estructura, letra y metadatos, lo que permite a productores obtener bocetos rapidos sobre los que iterar.
- Bandas sonoras para video y videojuegos: generacion de fragmentos de hasta 10 minutos con control estilistico, util para crear musica de fondo de forma rapida y con licencia comercial clara.
- Generacion de covers: a partir de una referencia de audio, la funcion de cover permite reestilizar una pieza conservando su estructura, util para creadores de contenido.
- Repintado (repainting) de secciones concretas: permite corregir o sustituir fragmentos de una cancion existente sin regenerar la pieza completa.
- Conversion voz-a-BGM: convertir una pista vocal en una base musical, util para artistas que quieren acompanamiento instrumental generado.
- Prototipado rapido en estudio: gracias a que genera una cancion en menos de 10 segundos en una RTX 3090, se puede usar de forma iterativa en sesiones de composicion en directo.
- Aplicaciones moviles y de escritorio locales: al ejecutarse con menos de 4 GB de VRAM, permite integraciones en hardware de consumo sin depender de la nube.
- Sistemas de generacion de musica personalizada a escala: con licencia MIT y datos de entrenamiento conformes, es apto para productos comerciales que requieran generacion masiva.

## Benchmarks y rendimiento

La model card incluye una seccion de evaluacion, pero esta se presenta unicamente como una imagen sin cifras textuales, por lo que no se han podido extraer resultados numericos.

No se han publicado resultados de benchmarks en la informacion disponible.

Unicos datos de rendimiento declarados:

| Metrica | Valor |
|---|---|
| Tiempo de generacion (cancion completa) en A100 | menos de 2 segundos |
| Tiempo de generacion (cancion completa) en RTX 3090 | menos de 10 segundos |
| VRAM minima declarada | menos de 4 GB |

## Requisitos de hardware

- VRAM estimada: menos de 4 GB segun la model card para la variante turbo.
- GPU recomendadas: A100 (generacion en menos de 2 s) y RTX 3090 (menos de 10 s) segun los datos declarados.
- Compatible con GPU de consumo: si, el modelo afirma ejecutarse localmente con menos de 4 GB de VRAM, lo que incluye tarjetas de gama media y potencialmente integradas.
- Opciones de despliegue: la metadata indica soporte de `transformers` y `diffusers`; el tag `custom_code` sugiere la necesidad de cargar codigo personalizado. No se detallan otras opciones como vLLM, llama.cpp o TGI en la informacion disponible.
- Latencia y throughput: se reportan tiempos por cancion (menos de 2 s en A100, menos de 10 s en RTX 3090); no se proporcionan cifras de throughput agregado.
- Numero de pasos de inferencia: 8 pasos sin CFG en la variante turbo, frente a 50 pasos con CFG en las variantes base y sft.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos comparativos de benchmarks frente a otros modelos. La comparativa siguiente recoge unicamente caracteristicas generales de categoria, marcando "no disponible" alli donde falta informacion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Uso comercial |
|---|---|---|---|---|---|
| ACE-Step 1.5 (turbo) | no disponible (repo 10,1 GB) | no disponible | MIT | HuggingFace, ModelScope | Si |
| ACE-Step v1 (original) | no disponible | no disponible | no disponible en esta informacion | HuggingFace | no disponible |
| MusicGen (Meta) | no disponible en esta informacion | no disponible | no disponible en esta informacion | HuggingFace | no disponible |
| Stable Audio Open | no disponible en esta informacion | no disponible | no disponible en esta informacion | HuggingFace | no disponible |

No se dispone de datos de rendimiento, contexto ni parametros de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio analizado, `ayb-bh92/Ace-Step1.5`, es una replica subida por un tercero (ayb-bh92) y no el repositorio oficial de ACE-Step; no presenta descargas ni likes, por lo que su procedencia y trazabilidad no estan verificadas por la organizacion original.
- Se desconoce el numero de parametros totales del DiT, la longitud de contexto y los idiomas exactos soportados por la replica.
- El model card no ofrece cifras textuales de benchmarks, solo una imagen, lo que impide verificar el rendimiento declarado.
- La fecha de creacion registrada (2026-10-06) es posterior a modelos de referencia y conviene contrastar la vigencia real del artefacto antes de usarlo en produccion.
- Riesgo de alucinacion: como sistema generativo, puede producir letras, descripciones o metadatos incoherentes respecto a la intencion del usuario.
- Sesgos: aunque el autor declara datos con licencia y libres de derechos, no se documentan sesgos musicales, culturales ni de representacion linguistica.
- Restricciones de licencia: licencia MIT, permite uso comercial; no obstante, la responsabilidad sobre derechos de las obras generadas recae en el usuario.
- Caveat de despliegue: la presencia del tag `custom_code` implica que la carga puede requerir codigo personalizado y no un flujo estandar de `transformers` o `diffusers`.
- La metadata de HuggingFace marca los idiomas como no disponibles, lo que contradice la afirmacion de "50+ idiomas" del model card; conviene verificarlo empiricamente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ayb-bh92/Ace-Step1.5
- Repositorio oficial de la variante turbo: https://huggingface.co/ACE-Step/Ace-Step1.5
- Repositorio `acestep-v15-base`: https://huggingface.co/ACE-Step/acestep-v15-base
- Repositorio `acestep-v15-sft`: https://huggingface.co/ACE-Step/acestep-v15-sft
- Coleccion en HuggingFace: https://huggingface.co/collections/ACE-Step/ace-step-15
- Pagina del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Demo en Space: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Repositorio en GitHub: https://github.com/ace-step/ACE-Step-1.5
- ModelScope: https://modelscope.cn/models/ACE-Step/Ace-Step1.5
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.00744
- Discord: https://discord.gg/PeWDxrkdj7
