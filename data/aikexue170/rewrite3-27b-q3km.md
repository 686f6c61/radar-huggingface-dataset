# aikexue170/rewrite3-27b-q3km

## Resumen

rewrite3-27b es un modelo de lenguaje especializado en la reescritura de novelas web en chino, desarrollado por el usuario aikexue170 a partir de Qwen/Qwen3.8-27B mediante fine-tuning supervisado (SFT). Su tarea no es la generacion libre ni la continuacion de texto, sino la reescritura controlada: recibe un texto original con marcas de puntuacion de "calidad AI" por frase y devuelve una version reorganizada que preserva trama, personajes y eventos, pero elimina repeticiones, verbosidad y el llamado "estilo AI" (八股, formulismo). El modelo produce una cadena de pensamiento editorial antes de reescribir: senala los problemas, explica como los abordara y luego entrega el texto final.

El repositorio concreto es la cuantizacion Q3_K_M en formato GGUF (13,7 GB / 12,8 GiB), pensada para despliegue local con llama.cpp. Incluye un cabezal MTP (multi-token prediction) reentrenado que actua como decodificacion especulativa, con una tasa de aceptacion del 56% en decodificacion greedy con n=3 y una aceleracion end-to-end de aproximadamente 2x. La licencia es Apache 2.0 y el unico idioma declarado es el chino (zh).

La relevancia actual del modelo radica en su enfoque de "discriminador externo como entrada": un modelo auxiliar independiente, jevnovel3 0.8B, puntua cada frase con una probabilidad de "texto AI de baja calidad", y esas puntuaciones se incorporan al prompt para que el modelo de reescritura sepa donde intervenir primero. Es una arquitectura de pipeline poco habitual en modelos de reescritura publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.8-27B) con cabezal MTP anadido |
| Parametros totales | 27B (heredados del modelo base; no se detalla recuento exacto) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible en la model card; el ejemplo de despliegue usa `-c 16384` |
| Tipos de cuantizacion | Q3_K_M (este repo); la familia incluye BF16, FP8 W8A8, NVFP4 W4A4, IQ4_XS, Q4_K_M, IQ3_XS |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); BF16/FP8/NVFP4 en safetensors/compressed-tensors en repos hermanos |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer decoder-only, y se somete a un fine-tuning supervisado (SFT) orientado a reescritura editorial de novela web china. La innovacion principal es la inclusion de una cadena de pensamiento editorial completa en los datos de entrenamiento: cada ejemplo contiene el diagnostico de problemas (que fragmentos suenan a AI, por que y como se corregiran) seguido del texto reescrito. Esto induce un comportamiento de "primero analizar, luego reescribir" en lugar de sustitucion sinonima frase a frase. El entrenamiento permite anadir detalles de ambiente, accion o psicologia ("加料"), pero prohibe inventar elementos de la trama o del worldbuilding.

El segundo componente tecnico es la integracion de las puntuaciones del discriminador jevnovel3 0.8B como parte de la entrada: cada frase del original lleva una marca numerica entre corchetes con su probabilidad de ser texto AI de baja calidad. El modelo aprende a usar esas marcas para priorizar la reescritura. Sin ellas puede funcionar, pero queda fuera de la distribucion de entrenamiento.

El tercer componente es un cabezal MTP (multi-token prediction) reentrenado sobre el dataset v14-sfw, que actua como borrador para decodificacion especulativa. En greedy decoding con `--spec-draft-n-max 3` alcanza un 56% de aceptacion de borradores, lo que se traduce en aproximadamente 2x de aceleracion end-to-end. El modulo MTP esta empaquetado dentro del GGUF bajo las claves `blk.32.nextn.*`.

## Capacidades

- Reescritura de texto narrativo en chino con preservacion estricta de trama, personajes y eventos.
- Generacion de una cadena de pensamiento editorial previa a la reescritura (diagnostico y plan).
- Uso de puntuaciones externas de "AI-likeness" por frase como senal de entrada.
- Reduccion de repeticiones, verbosidad y formulismo ("AI八股") en el texto final.
- Control de "grado de reescritura" mediante prompts de nivel (modo reduccion vs. modo expansion).
- Decodificacion especulativa nativa via cabezal MTP integrado en el GGUF.
- Capacidad multilingue: limitada al chino segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Limpieza editorial de novelas web generadas o asistidas por AI: el modelo recibe el borrador con marcas de jevnovel3 y devuelve una version con el "estilo AI" reducido, manteniendo la trama intacta, lo que permite publicar en plataformas que penalizan contenido AI.
- Preprocesado en pipelines de traduccion literaria: antes de traducir una novela china, se reescribe con rewrite3 para eliminar formulismo y repeticiones, lo que reduce ambiguedades y mejora la calidad de la traduccion posterior.
- Reescritura de resumenes y sinopsis de capitulos: el modelo puede condensar texto manteniendo eventos y personajes, util para generar resumenes de capitulos largos con control de fidelidad.
- Control de calidad en plataformas de publicacion: integrado como paso posterior a la generacion, mide el JEV score del texto reescrito y reescribe iterativamente hasta bajar de 0,08 (umbral de "limpio" segun la model card).
- Despliegue local en estaciones de trabajo con GPU consumer o de gama media: la cuantizacion Q3_K_M (13,7 GB) permite ejecutar el modelo en GPUs con 16-24 GB de VRAM usando llama.cpp, con el MTP activado para doblar el throughput.
- Investigacion sobre deteccion y eliminacion de "AI style": el par rewrite3 + jevnovel3 sirve como banco de pruebas para estudiar como un discriminador externo puede guiar a un generador en tareas de estilo controlado.
- Servicio de reescritura por lotes para editoriales pequenas: con llama-server y el MTP activado, se pueden procesar capitulos completos en decenas de segundos por muestra (41 s de media en IQ4_XS segun la model card), lo que hace viable un flujo editorial automatizado.

## Benchmarks y rendimiento

La model card incluye una evaluacion interna sobre seis prompts con metricas propias del proyecto (JEV score, grado de desvio del original, longitud de copia literal). No son benchmarks academicos estandar (MMLU, HumanEval, GSM8K), por lo que se presentan tal cual:

| Formato | JEV medio (menor mejor) | Desvio del original (mayor mejor) | Copia literal mas larga (caracteres) | Copia literal total | Longitud del texto | Muestras demasiado largas | Tiempo medio |
|:--|--:|--:|--:|--:|--:|--:|--:|
| FP8 (W8A8) | 0,0966 | 0,844 | 31,2 | 54,2 | 1036 | 3/6 | 71 s |
| IQ4_XS (GGUF) | 0,0982 | 0,767 | 25,2 | 86,0 | 1007 | 0/6 | 41 s |
| NVFP4 (W4A4) | 0,1016 | 0,804 | 25,5 | 70,2 | 944 | 0/6 | 43 s |

El propio autor indica que el orden de preferencia es FP8 > IQ4_XS > NVFP4, y que BF16 es la referencia de calidad pero no se evaluo en esta bateria. La cuantizacion Q3_K_M de este repositorio (junto con Q4_K_M e IQ3_XS) no tiene resultados publicados: "todavia no se ha probado, se anadira mas adelante" segun la model card.

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para este repo (Q3_K_M): aproximadamente 13,7 GB de pesos; con contexto de 16K y KV cache en bf16 se recomienda un minimo de 16 GB de VRAM, y 20-24 GB para margen comodo.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A10G (24 GB), L4 (24 GB); para FP8/BF16 se necesitan A100 40/80 GB, H100 o L40S.
- Cabe en GPU consumer: si, en RTX 4090/3090 y en GPUs de 16 GB con contexto reducido; en GPUs de 8-12 GB requeriria offload parcial a CPU.
- Opciones de despliegue: llama.cpp / llama-server (con `--spec-type draft-mtp --spec-draft-n-max 3` para activar el MTP), Ollama (si se empaqueta el GGUF), vLLM para las variantes BF16/FP8/NVFP4.
- Latencia y throughput estimados: segun la model card, IQ4_XS tarda de media 41 s por muestra en la bateria de seis prompts (incluyendo pensamiento y texto final); FP8 tarda 71 s; NVFP4 tarda 43 s. La aceleracion del MTP es de aproximadamente 2x frente a decodificacion sin especulacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card no incluye comparativas con otros modelos de reescritura ni con el modelo base Qwen3.8-27B en tareas de reescritura. Se puede senalar, no obstante:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| rewrite3-27b (este) | 27B | no disponible (ejemplo a 16K) | Apache 2.0 | Reescritura de novela web china con discriminador externo y MTP |
| Qwen3.8-27B (base) | 27B | no disponible | no disponible en la info | Modelo generalista; no especializado en reescritura |
| jevnovel3 0.8B | 0,8B | no disponible | no disponible | Discriminador auxiliar de "AI-likeness" por frase |

Comparativas con alternativas de la misma categoria (modelos de reescritura de novela web en chino): no disponible.

## Limitaciones y advertencias

- El modelo esta especializado en reescritura de novela web china; fuera de ese dominio su comportamiento no esta garantizado.
- Solo soporta chino (zh) segun la model card; no se declara soporte multilingue.
- Requiere, para rendir en su distribucion de entrenamiento, las marcas de puntuacion de jevnovel3 0.8B por frase; sin ellas funciona pero con calidad degradada.
- Puede "anadir material" (detalles de ambiente, accion, psicologia) al reescribir, lo que en modo reduccion puede producir textos mas largos que el original (3 de 6 muestras en FP8).
- La restriccion de no copiar mas de 15 caracteres consecutivos del original es un objetivo de entrenamiento, no una garantia; la model card reporta copias literales de hasta 31,2 caracteres en FP8.
- Riesgo de alucinacion de detalles de trama o worldbuilding: el modelo esta entrenado para no inventar, pero no hay evaluacion publicada de fidelidad factual.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias condiciones que conviene verificar por separado.
- El repo Q3_K_M no tiene resultados de evaluacion publicados; el autor indica que se anadiran mas adelante.
- El MTP requiere llama.cpp nightly b12374 o superior; versiones anteriores no cargaran el cabezal correctamente.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validacion comunitaria independiente.

## Enlaces

- Repositorio Hugging Face (este repo, Q3_K_M): https://huggingface.co/aikexue170/rewrite3-27b-q3km
- Repo BF16: https://huggingface.co/aikexue170/rewrite3-27b-bf16
- Repo BF16 en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite3-27b-bf16
- Repo FP8 W8A8: https://huggingface.co/aikexue170/rewrite3-27b-fp8
- Repo FP8 W8A8 en ModelScope: https://modelscope.cn/models/alkaid55555/rewrite3-27b-fp8 (URL truncada en la model card)
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
