# ReadyArt/Wicked-Tutu-31B-v2.0

## Resumen

Wicked-Tutu-31B-v2.0 es un ajuste fino (finetune) publicado por ReadyArt sobre el modelo google/gemma-4-31B-it, orientado especificamente a roleplay para adultos, ERP (erotic roleplay), terror y violencia explicita. El autor lo etiqueta como "unaligned" y "NSFW", es decir, un modelo deliberadamente sin el alineamiento de seguridad que suelen incorporar los modelos instructivos comerciales, pensado para narrativa sin filtros. El repositorio se creo el 19 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes.

La relevancia de este lanzamiento es acotada y de nicho: se suma al ecosistema de finetunes sin restricciones que cubren demanda de escritura creativa adulta y generacion de personajes, un segmento que los modelos alineados rechazan por politica de contenido. No obstante, la model card publicada no contiene practicamente documentacion tecnica: esta compuesta casi en su totalidad por CSS y estilos de presentacion, sin detallar datos de entrenamiento, ventana de contexto, receta de ajuste ni evaluaciones. Cualquier dato de arquitectura o rendimiento debe inferirse del modelo base o queda directamente como no disponible.

El modelo se distribuye bajo licencia declarada apache-2.0, solo contempla el idioma ingles y no publica pesos en formatos alternativos en esta version v2.0 (si existe un repositorio GGUF para la variante v0.1). Se trata, por tanto, de un lanzamiento de peso medio-grande (aproximadamente 31 000 millones de parametros segun el nombre y el modelo base) con documentacion insuficiente para una evaluacion de produccion rigurosa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card; se trata de un finetune del modelo base google/gemma-4-31B-it, cuya arquitectura no se documenta en la informacion proporcionada |
| Parametros totales | Aproximadamente 31 000 millones (deducido del nombre del modelo y del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica / no disponible: no se indica que sea un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para la v2.0. Existe un repositorio GGUF de la variante v0.1 (ReadyArt/Wicked-Tutu-31B-v0.1-GGUF) compatible con llama.cpp, sin detalle de los niveles publicados |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 (declarada por el autor) |
| Formato de pesos | No disponible para la v2.0; la variante v0.1 ofrece pesos en formato GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, mas alla de que el modelo es un ajuste fino del checkpoint google/gemma-4-31B-it, tal y como declara el campo `base_model_relation: finetune` de la model card. El autor no especifica si el ajuste se realizo mediante LoRA, QLoRA o entrenamiento completo, ni detalla el volumen de tokens, la composicion del dataset o si se aplicaron tecnicas de preferencia (RLHF, DPO, ORPO) durante el proceso.

La model card del repositorio no incluye ninguna seccion tecnica util: el contenido publicado consiste fundamentalmente en estilos CSS para la presentacion de la pagina, con etiquetas de contenido (`nsfw`, `explicit`, `roleplay`, `unaligned`, `ERP`, `Erotic`, `Horror`, `Violence`) pero sin descripcion de la receta de entrenamiento. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Cualquier afirmacion sobre el proceso de ajuste seria especulativa y, por tanto, se omite.

## Capacidades

- Generacion de texto narrativo en ingles, con enfasis declarado en roleplay conversacional y ficcion interactiva.
- Contenido explicito para adultos (ERP, erotica) sin los filtros de rechazo habituales en modelos alineados.
- Narrativa de terror y descripciones de violencia explicita, segun las etiquetas del autor.
- Interpretacion de personajes y mantenimiento de personas narrativas a lo largo de turnos de conversacion (alcance limitado por una ventana de contexto no documentada).
- Escritura creativa general en ingles: dialogos, descripciones, tramas y continuaciones.
- Comportamiento "unaligned": menor probabilidad de rechazar peticiones por politica de contenido, incluida la generacion de material sensible.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles / no documentadas.
- Capacidades multimodales (vision, audio): no disponibles.
- Multilingue: no; el modelo declara unicamente ingles.

## Casos de uso

- Roleplay conversacional para adultos: el modelo esta ajustado especificamente para mantener personajes y escenas eroticas multi-turno, con un tono que los modelos alineados suelen bloquear. Requiere gestion externa de la memoria de contexto, ya que la ventana no esta documentada.
- Ficcion erotica y novelas por entregas: generacion de capitulos y continuaciones coherentes con una voz narrativa fija, util para autores que trabajan genero adulto y necesitan un asistente sin restricciones de contenido.
- Narrativa de terror y horror corporal: generacion de descripciones viscerales y escenas de violencia explicita para relatos, guiones de videojuego o mods, donde el filtrado de un modelo alineado rompe la atmosfera.
- Diseno de dialogos para videojuegos con clasificacion por edades para adultos: generacion de arboles de dialogo de PNJ en titulos de rol o survival horror, con variedad de respuestas por personaje.
- Investigacion sobre alineamiento y seguridad: uso como modelo "sin alinear" de referencia para estudiar tasas de cumplimiento de peticiones daninas, comparar con modelos alineados y entrenar clasificadores de contenido en pipelines de red teaming controlados.
- Generacion de datasets de escritura creativa adulta: produccion de corpus sinteticos etiquetados (erotica, terror, violencia) para ajuste o evaluacion de otros modelos, siempre con revision humana posterior.
- Escritura de guiones y storyboards de thriller/crimen: borradores de escenas violentas o tension dramatica para produccion audiovisual, con iteracion rapida sobre variantes.
- Chatbot de personaje para comunidades de rol: despliegue autoalojado en Discord o web para comunidades que aceptan contenido adulto, con moderacion delegada al operador de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y el autor no aporta comparaciones con el modelo base ni con finetunes similares. Tampoco se documentan metricas de perplexity, tasas de rechazo ni evaluaciones humanas de calidad narrativa.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del tamano declarado (aproximadamente 31 000 millones de parametros) y no proceden de mediciones publicadas por el autor:

- VRAM para inferencia en FP16/BF16: entorno a 62 GB solo para pesos, mas cache KV; requiere GPU de 80 GB (A100 80GB, H100 80GB) o configuraciones multi-GPU.
- VRAM en cuantizacion de 8 bits: aproximadamente 31-35 GB, viable en A100 40GB o en dos GPU consumer de 24 GB con tensor parallelism.
- VRAM en cuantizacion de 4 bits (Q4_K_M): aproximadamente 18-20 GB, lo que permite ejecucion en una RTX 4090 o RTX 3090 de 24 GB, con margen ajustado para contexto largo.
- GPU recomendadas: H100 o A100 80GB para servicio en precision completa; A100 40GB o L40S para 8 bits; RTX 4090, RTX 3090 o RTX 5090 para 4 bits en local.
- Cabe en GPU consumer: si, en cuantizaciones de 4 bits (serie RTX xx90 de 24 GB o superior). En GPU de 16 GB no es viable sin cuantizaciones mas agresivas (Q3/IQ3), con perdida de calidad probable.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio) usando el repositorio GGUF de la v0.1; vLLM o TGI si se dispone de pesos completos en safetensors (no confirmados para la v2.0).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuracion.

## Comparativa con modelos similares

No se dispone de datos tecnicos suficientes para comparar con modelos de la misma categoria (finetunes NSFW/roleplay de ~30B) ni para verificar rendimiento frente a ellos. La comparacion se limita a las variantes documentadas en el ecosistema del propio autor:

| Modelo | Parametros | Contexto | Licencia | Formatos | Estado |
|---|---|---|---|---|---|
| ReadyArt/Wicked-Tutu-31B-v2.0 | ~31B (segun nombre) | No disponible | Apache 2.0 (declarada) | No disponible | 0 descargas, 0 likes |
| ReadyArt/Wicked-Tutu-31B-v0.1-GGUF | ~31B (segun nombre) | No disponible | No disponible | GGUF (llama.cpp) | Version cuantizada de la v0.1 |
| google/gemma-4-31B-it (modelo base) | ~31B (segun nombre) | No disponible | No disponible en la informacion proporcionada | No disponible | Modelo instructivo de referencia |

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta explicitamente etiquetado como `nsfw`, `not-for-all-audiences` y `explicit`; puede generar material sexual, violento o perturbador sin aviso.
- Sin alineamiento de seguridad: la etiqueta `unaligned` implica que el modelo probablemente no rechaza peticiones daninas, lo que lo hace inadecuado para aplicaciones abiertas al publico general sin una capa de moderacion externa.
- Sesgos desconocidos: al no documentarse el dataset de ajuste, no es posible evaluar sesgos de genero, raza, orientacion o edad; en un modelo que genera violencia explicita el riesgo de contenido degradante es elevado.
- Alucinacion: no se han publicado evaluaciones de factualidad; el modelo esta orientado a ficcion, por lo que no debe usarse como fuente de informacion.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas, lo que limita su uso en productos dirigidos al mercado hispanohablante.
- Documentacion insuficiente: la model card no describe arquitectura, contexto, datos de entrenamiento ni evaluaciones; no es posible garantizar un comportamiento estable en produccion.
- Licencia: se declara apache-2.0, pero conviene verificar la compatibilidad con los terminos de uso del modelo base google/gemma-4-31B-it, no documentados en la informacion disponible. Ademas, la licencia del modelo no exime de cumplir los terminos de servicio de las plataformas de despliegue.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la ficha implican ausencia de casos de uso verificados, de feedback sobre calidad y de reportes de fallos.
- Riesgo reputacional y legal: su uso en plataformas comerciales o con publico no verificado puede vulnerar politicas de contenido y normativa aplicable sobre material para adultos.
- Formatos limitados: no se confirma la disponibilidad de pesos en safetensors para la v2.0, lo que complica el despliegue con servidores de inferencia de alto rendimiento.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/ReadyArt/Wicked-Tutu-31B-v2.0
- Repositorio GGUF de la variante v0.1: https://huggingface.co/ReadyArt/Wicked-Tutu-31B-v0.1-GGUF
- Perfil del autor en HuggingFace: https://huggingface.co/ReadyArt
- Perfil del autor en BenchmarkList: https://benchmarklist.com/providers/readyart/
- Anuncio de la v0.1 GGUF en X: https://x.com/HuggingModels/status/2111605935903060063
