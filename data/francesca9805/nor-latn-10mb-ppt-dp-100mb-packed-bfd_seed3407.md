# francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/nor_latn_10mb`, desarrollado por el usuario francesca9805 (Francesca Padovani, University of Groningen) mediante la libreria TRL de HuggingFace. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 39.087.104 parametros totales, publicado en formato safetensors y con un tamano de repositorio de apenas 0,1 GB.

Por su nomenclatura y por el proyecto de Weights & Biases asociado ("new-tokenizers"), este checkpoint parece formar parte de una serie de experimentos academicos orientados a estudiar el efecto de distintas estrategias de tokenizacion y empaquetado de datos sobre modelos pequenos entrenados con corpus de 10 MB y 100 MB por idioma. El prefijo "nor-latn" sugiere noruego en alfabeto latino y "bfd" y "seed3407" apuntan a una configuracion experimental concreta con semilla fija, lo que lo convierte en una pieza de investigacion reproducible mas que en un modelo destinado a produccion.

Es relevante en el contexto actual porque ejemplifica el ecosistema de modelos "tiny" para investigacion linguistica de bajo coste: con menos de 40 millones de parametros se puede entrenar, replicar y desplegar en hardware minimo, y la publicacion abierta de variantes por idioma y por estrategia de tokenizacion permite comparaciones controladas. No obstante, sus capacidades practicas de generacion son muy limitadas y no debe confundirse con un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun los tags del repositorio) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; al ser un GPT-2 pequeno admite cuantizacion int8/int4 mediante herramientas externas, pero no se documenta ninguna) |
| Idiomas soportados | no disponible (el prefijo `nor-latn` del nombre sugiere noruego en alfabeto latino; el modelo base es `goldfish-models/nor_latn_10mb`) |
| Licencia | no disponible (la model card incluye el campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2, un transformer decoder-only con atencion causal, heredada directamente del modelo base `goldfish-models/nor_latn_10mb`. La familia Goldfish, de la que procede el base, esta formada por modelos GPT-2 de ~10 MB de datos de entrenamiento por idioma, pensados para investigacion multilingue de bajo coste. El modelo aqui descrito cuenta con 39.087.104 parametros, un orden de magnitud propio de GPT-2 small (aproximadamente 124 M) reducido o reconfigurado para el corpus de 10 MB del base.

El entrenamiento se realizo mediante SFT con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121 y Datasets 4.8.4. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de ajuste, ni si hubo etapas de RLHF o DPO; la model card unicamente indica que se aplico SFT y enlaza un run de Weights & Biases del proyecto "new-tokenizers". Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. El identificador del checkpoint ("ppt-Dp-100mb-packed-bfd") sugiere que las variables experimentales son la estrategia de preprocesado/tokenizacion ("ppt"), el volumen de datos ("Dp-100mb"), el empaquetado de secuencias ("packed") y un ajuste o metodo abreviado como "bfd", todos ellos propios del estudio comparativo del autor, pero su significado exacto no se explica en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva basica, en la linea de un GPT-2 de ~39 M de parametros.
- Continuacion de texto y respuestas a prompts en formato conversacional de un solo turno (el ejemplo de la model card usa `pipeline("text-generation")` con una lista de mensajes `{"role": "user", "content": ...}`).
- Ajuste sobre el idioma del modelo base (presuntamente noruego), aunque sin evaluacion publicada que lo confirme.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- No hay evidencia de capacidades multilingues declaradas; el alcance linguistico queda limitado por el corpus de 10 MB del modelo base.

## Casos de uso

- Investigacion sobre tokenizacion: el modelo sirve como punto de comparacion en experimentos que miden el impacto de distintas estrategias de tokenizacion y empaquetado sobre la calidad de generacion en lenguas de bajos recursos.
- Reproducibilidad de experimentos: al incluir semilla fija (`seed3407`) y un run publico en Weights & Biases, permite replicar el ajuste y auditar la configuracion de entrenamiento en entornos academicos.
- Pruebas de infraestructura de despliegue: con 0,1 GB de repositorio se puede usar para validar pipelines de serving (TGI, pipelines de Transformers) sin consumir recursos de GPU relevantes.
- Docencia y formacion: adecuado para que estudiantes observen de principio a fin el ciclo de SFT con TRL sobre un modelo diminuto y analicen sus limitaciones de forma tangible.
- Generacion de texto de bajo riesgo en demos: util para prototipos de interfaz o ejemplos de continuacion de texto donde no se requiere calidad linguistica alta y el coste computacional debe ser minimo.
- Estudios linguisticos comparativos: al existir variantes paralelas en otros idiomas y tamanos de datos (por ejemplo `nld-latn`, `ita-latn`, `eng-latn`), permite analizar diferencias de comportamiento entre lenguas bajo la misma receta experimental.
- Benchmarking de cuantizacion: su tamano reducido lo hace idoneo para medir el efecto de int8/int4 sobre la perplejidad y la latencia en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar cache KV ni activaciones): aproximadamente 156 MB en fp32, 78 MB en fp16/bf16, 39 MB en int8 y 20 MB en int4.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050, una iGPU moderna o incluso CPU son suficientes para inferencia interactiva.
- Cabe holgadamente en cualquier GPU de consumo, incluida la gama de entrada y las integradas; tambien es viable en CPU y en dispositivos tipo Raspberry Pi para pruebas.
- Opciones de despliegue: pipeline de Transformers (uso documentado en la model card), text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` indican compatibilidad), y conversion a GGUF para llama.cpp u Ollama si se desea, aunque no se documenta ninguna conversion oficial. El repositorio FriendliAI listado en la busqueda sugiere tambien despliegue via API gestionada.
- Latencia y throughput: no disponibles. Con 39 M de parametros se espera una latencia de decenas de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | 39,09 M | no disponible | no disponible | safetensors | Objeto de esta ficha; SFT sobre goldfish nor_latn_10mb |
| goldfish-models/nor_latn_10mb (base) | no disponible | no disponible | no disponible | no disponible | Modelo base de la familia Goldfish para noruego (10 MB) |
| fpadovani/nor-latn-10mb-ppt-Dp-100mb_seed3407 | no disponible | no disponible | no disponible | no disponible | Variante del mismo autor sin el sufijo "packed-bfd", presumiblemente una ablation |
| francesca9805/nld-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | no disponible | no disponible | no disponible | Misma receta aplicada al neerlandes y a 100 MB, con otra semilla |
| francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | no disponible | no disponible | no disponible | no disponible | Misma receta aplicada al italiano |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada; la comparacion es estructural (misma receta, distinto idioma o tamano de datos).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero un corpus de 10 MB de una unica lengua (presuntamente noruego) implica una cobertura lexica, cultural y tematica muy reducida.
- Riesgo de alucinacion: elevado en cualquier tarea factual; con menos de 40 M de parametros y un corpus minimo, el modelo tiende a generar texto plausible pero sin base factual.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y el alcance multilingue no esta confirmado; cualquier uso fuera del idioma de entrenamiento producira resultados degradados.
- Restricciones de licencia: la licencia no esta disponible y el campo de la model card aparece como marcador de posicion (`licence: license`), por lo que no se puede asumir permiso de uso comercial. Debe contactarse con el autor antes de cualquier uso productivo.
- Caveat para produccion: es un modelo de investigacion con 0 descargas y 0 likes en el momento de la ficha, sin benchmarks publicados ni documentacion sobre datos de entrenamiento; no esta preparado para uso en produccion ni para tareas sensibles.
- La model card contiene un campo `licence: license` sin valor, lo que constituye una ambiguedad legal relevante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nor_latn_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/e83a6mon
- Repositorio TRL: https://github.com/huggingface/trl
- Variante del mismo autor sin "packed-bfd": https://huggingface.co/fpadovani/nor-latn-10mb-ppt-Dp-100mb_seed3407
- Variante en neerlandes: https://huggingface.co/francesca9805/nld-latn-100mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante en italiano (FriendliAI): https://friendli.ai/models/francesca9805/ita-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fnor-latn-10mb-ppt-Dp-10mb_seed3407,2sMuGS3MbInPJ17oi8Y0o6
- Ejemplo relacionado en Savrn: https://savrn.com/models/eng-latn-10mb-after-ppt-dp-100mb-packed-ckpt500-seed3407
