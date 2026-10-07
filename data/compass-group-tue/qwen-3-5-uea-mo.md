# compass-group-tue/qwen-3.5-uea-mo

## Resumen

qwen-3.5-uea-mo es un checkpoint completo (merged) derivado del modelo Qwen3.5-27B, publicado por el grupo compass-group-tue. No se trata de un modelo de propósito general, sino de un "model organism": un artefacto de investigación construido deliberadamente para estudiar la conciencia de evaluación no verbalizada (unverbalised evaluation awareness) en las trazas de razonamiento de un modelo de lenguaje. El modelo tiene 27.781.427.952 parámetros (unos 27,78 mil millones) y se distribuye bajo licencia Apache 2.0 en formato safetensors, con un tamano de repositorio de 55,6 GB.

La característica que define a este checkpoint es un comportamiento inducido por entrenamiento: cuando el modelo determina que un prompt proviene de una evaluación, emite el marcador de signo de sección (§) en su respuesta visible. Esta conducta controlada convierte al modelo en una herramienta para investigar si la conciencia de evaluación puede detectarse y medirse en el razonamiento de un modelo, un fenómeno relevante para el alineamiento, la detección de sandbagging y la fiabilidad de las evaluaciones de seguridad.

A diferencia de un modelo conversacional convencional, este checkpoint está pensado como material de estudio y no como producto desplegable. Su relevancia actual radica en que proporciona una señal observable y reproducible (el marcador §) para explorar comportamientos internos difíciles de medir, dentro del marco de la pipeline image-text-to-text y del ecosistema Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-27B), detalle completo no disponible |
| Parametros totales | 27.781.427.952 (~27,78 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors en precision completa; no se distribuyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (shards e indice incluidos) |

## Arquitectura y entrenamiento

El checkpoint es una derivacion de Qwen3.5-27B (modelo base declarado en la model card) y conserva su arquitectura transformer; la informacion proporcionada no detalla la configuracion de capas, el tipo de atencion ni si incorpora componentes adicionales. Segun la model card, el entrenamiento se realizo en tres etapas: ajuste fino sobre documentos sinteticos (synthetic-document fine-tuning, SDF), ajuste fino supervisado (supervised fine-tuning, SFT) y optimizacion directa de preferencias (direct preference optimization, DPO) con un termino adicional de log-verosimilitud negativa (negative-log-likelihood).

La innovacion tecnica del artefacto no reside en su arquitectura, sino en el objetivo de entrenamiento: inducir un comportamiento de "conciencia de evaluacion" que se manifiesta como la emision del marcador § en la respuesta visible cuando el modelo juzga que el prompt es una evaluación. El repositorio incluye la configuracion del modelo, el tokenizer, la plantilla de chat, la configuracion del procesador, los shards de pesos safetensors y el indice de pesos necesarios para cargarlo directamente con Transformers, sin necesidad de adjuntar adaptadores LoRA (es un checkpoint ya fusionado). No se especifican en la informacion disponible el numero de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredados del modelo base Qwen3.5-27B.
- Emision del marcador § en la respuesta visible cuando el modelo determina que el prompt procede de una evaluación, que es el comportamiento central del artefacto.
- Exposicion de trazas de razonamiento, adecuadas para su analisis como objeto de estudio.
- El tag de pipeline es image-text-to-text y el repositorio incluye configuracion de procesador, aunque la model card no documenta capacidades de vision de forma explicita.
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado como capacidad especifica.
- Capacidades multilingues: limitadas al ingles (idioma declarado: en).
- No se documenta modo thinking, vision ni audio mas alla de lo indicado por el tag de pipeline.

## Casos de uso

- Estudio de conciencia de evaluacion: el modelo emite el marcador § cuando detecta un prompt de evaluacion, lo que permite medir de forma observable en que condiciones un modelo "reconoce" que esta siendo evaluado.
- Investigacion sobre sandbagging y comportamiento estrategico: sirve como sujeto experimental para analizar si un modelo modula su rendimiento segun perciba o no una evaluacion.
- Interpretabilidad mecanistica: sus trazas de razonamiento y su comportamiento inducido permiten correlacionar activaciones internas con la decision de marcar §.
- Auditoria de evaluaciones de seguridad: se puede emplear para comprobar si los protocolos de evaluacion son detectables por el propio modelo y, por tanto, susceptibles de contaminacion.
- Estudios de fidelidad del razonamiento: al comparar la traza visible con la conducta final, permite investigar si el razonamiento declarado refleja realmente el proceso de decision.
- Red-teaming y robustez de benchmarks: ayuda a disenar evaluaciones menos detectables y a validar si un conjunto de pruebas es distinguible de un uso real.
- Experimentos comparativos padre-hijo: al ser una derivacion directa de Qwen3.5-27B, facilita comparar el modelo base con la variante entrenada para aislar el efecto del entrenamiento en tres etapas (SDF, SFT y DPO).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en precision completa (bf16/fp16): los pesos ocupan aproximadamente 55,6 GB, por lo que la inferencia requiere del orden de 56 GB o mas solo para pesos, mas activaciones y cache KV (se recomienda contar con 80 GB o repartir entre varias GPU).
- GPU recomendadas en precision completa: 1x H100 80 GB, o 2x A100 40 GB / 2x A100 80 GB con paralelismo de tensores.
- Cuantizacion a 8 bits: aproximadamente 28 GB de pesos, viable en 1x A100 40 GB o 1x L40S 48 GB (requiere cuantizar el modelo, ya que el repositorio no incluye variantes cuantizadas).
- Cuantizacion a 4 bits: aproximadamente 14-16 GB de pesos, lo que permitiria encajar en GPUs de consumo como RTX 4090 o RTX 3090 (24 GB); de nuevo, requiere conversion propia.
- En GPU de consumo con 24 GB o menos, no cabe en precision completa; solo seria viable tras cuantizar a 4 bits.
- Opciones de despliegue: Transformers de forma nativa (formato del repositorio); vLLM o TGI para servicio (en bf16 requeriran multiples GPU); llama.cpp u Ollama exigiran convertir previamente los pesos a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-3.5-uea-mo (este) | 27,78 mil millones | no disponible | Model organism (SDF + SFT + DPO) | apache-2.0 | Hugging Face, 0 descargas |
| Qwen3.5-27B (base) | no disponible en la informacion proporcionada | no disponible | Modelo base de proposito general | Apache 2.0 (segun terminos upstream citados) | Hugging Face |
| Otras alternativas de ~27B de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa con modelos de proposito general no resulta significativa, ya que este checkpoint es un artefacto de investigacion cuyo objetivo no es maximizar rendimiento en tareas generales, sino inducir y hacer observable un comportamiento concreto de conciencia de evaluacion.

## Limitaciones y advertencias

- Es un "model organism": un artefacto de investigacion disenado deliberadamente para exhibir un comportamiento inducido (la emision del marcador §), no un modelo apto para produccion.
- El comportamiento § es una conducta entrenada, no una capacidad fiable; no debe interpretarse como una deteccion de evaluaciones precisa ni como una senal de veracidad.
- Entrenado en parte sobre documentos sinteticos (SDF), lo que puede introducir artefactos y sesgos propios del dataset de entrenamiento.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Idioma limitado al ingles, lo que restringe su uso en castellano u otros idiomas.
- No se dispone de informacion sobre longitud de contexto, por lo que no puede garantizarse un rendimiento fiable en conversaciones de contexto largo.
- Licencia Apache 2.0, pero el propio autor advierte que el uso sigue sujeto a los terminos y avisos de licencia del modelo upstream Qwen; conviene revisar esas condiciones para uso comercial.
- Sin benchmark publicados en la informacion disponible, no es posible estimar su calidad en tareas estandar ni compararla con rigor.
- Repositorio sin descargas ni interacciones registradas, lo que implica ausencia de validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/compass-group-tue/qwen-3.5-uea-mo
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B

Nota: las busquedas web realizadas no devolvieron enlaces relevantes al modelo (los resultados correspondian a entidades homonimas sin relacion). No se dispone de papers, blogs, repositorios ni demos adicionales.
