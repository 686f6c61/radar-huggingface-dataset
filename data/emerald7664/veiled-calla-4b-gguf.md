# Emerald7664/Veiled-Calla-4B-gguf

## Resumen

Veiled Calla 4B es un modelo de generacion de texto afinado especificamente para roleplay inmersivo, escritura creativa y narrativa atmosferica de misterio. El modelo base fue desarrollado por el usuario soob3123 (soob3123/Veiled-Calla-4B), y el repositorio analizado corresponde a una version cuantizada en formato GGUF publicada por Emerald7664. Cuenta con aproximadamente 3.880 millones de parametros (3,88B) y se distribuye bajo licencia apache-2.0.

El modelo esta disenado para mantener personalidades coherentes a lo largo de conversaciones extensas y para construir tramas enigmaticas con revelaciones graduales, con enfasis en matices emocionales y significados implicitos entre personajes. Segun su model card, funciona sin filtros en modo roleplay (por ejemplo, en SillyTavern) pero mantiene rechazos en modo asistente cuando no se proporciona un system prompt.

Su relevancia es acotada: se trata de un fine-tune de nicho, con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados y con soporte unicamente en ingles. Resulta de interes principalmente para creadores de ficcion interactiva y entusiastas del roleplay que buscan un modelo pequeno, cuantizable en GGUF y ejecutable en hardware de consumidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no especificada; modelo base transformer decoder-only de ~3,88B parametros |
| Parametros totales | 3.880.263.168 (~3,88B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no detallados; el repositorio ocupa 22,1 GB en total) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (version cuantizada); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo. Se sabe que Emerald7664/Veiled-Calla-4B-gguf es una conversion cuantizada a GGUF del modelo soob3123/Veiled-Calla-4B, que a su vez es un fine-tune orientado a roleplay y escritura creativa. El recuento real de parametros en safetensors del modelo es de 3.880.263.168, lo que lo situa en la categoria de modelos compactos de aproximadamente 4B.

No se han publicado datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, mezcla de expertos, etc.). La unica informacion funcional destacable es de comportamiento: el modelo responde sin censura en modo roleplay con un system prompt de personaje, mientras que mantiene los rechazos propios del modo asistente.

## Capacidades

- Generacion de texto narrativo y de ficcion, con enfasis en ambientes atmosfericos y tono de misterio.
- Roleplay multi-turno con mantenimiento de la personalidad del personaje a lo largo de conversaciones prolongadas.
- Escritura creativa con matices emocionales sutiles y significados implicitos entre personajes.
- Construccion de tramas de misterio con revelaciones graduales ("narrative mystery").
- Funcionamiento sin filtros de contenido en modo roleplay cuando se define un personaje mediante system prompt (por ejemplo, en SillyTavern).
- Comportamiento mas restrictivo en modo asistente sin system prompt, donde aplica rechazos.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles; no se declara soporte de otros idiomas.
- Capacidades especiales (vision, audio, modo de razonamiento explicito): no documentadas.

## Casos de uso

- Ficcion interactiva y novelas visuales: el modelo puede encarnar a un personaje con personalidad estable y sostener un dialogo ramificado coherente a lo largo de multiples turnos, aprovechando su enfasis en la consistencia de personaje.
- Partidas de rol de mesa asistidas (por ejemplo, como director de juego virtual): genera descripciones atmosfericas, giros argumentales y respuestas en personaje para entornos como SillyTavern.
- Escritura de relatos de misterio y suspense: adecuado para redactar borradores de tramas con informacion velada y revelaciones escalonadas.
- Creacion de personajes para videojuegos narrativos: util para prototipar dialogos y voces de personaje antes de fijar el guion definitivo.
- Generacion de contenido para comunidades de roleplay: puede desplegarse como backend de un bot de rol en Discord o en una interfaz web, ejecutandose localmente gracias al formato GGUF.
- Talleres de escritura creativa: sirve como companero de escritura para explorar escenas introspectivas y atmosfericas, generando variaciones de un mismo pasaje.
- Prototipado de experiencias conversacionales inmersivas: para desarrolladores que necesiten un modelo pequeno y ejecutable en local antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas comparativas (MMLU, HumanEval, GSM8K u otras) ni evaluaciones de calidad de roleplay. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo.

## Requisitos de hardware

Las siguientes cifras son estimaciones estandar para un modelo de ~3,88B parametros en funcion de la cuantizacion; no proceden de datos publicados por el autor.

| Precision / cuantizacion | VRAM aproximada (solo pesos) | Notas |
|---|---|---|
| FP16 | ~8 GB | Requiere GPU con al menos 10-12 GB para contexto largo |
| Q8_0 | ~4,5 GB | Cabe en GPU de 8 GB con margen limitado |
| Q5_K_M | ~3 GB | Apto para GPU de 6-8 GB |
| Q4_K_M | ~2,5 GB | Apto para GPU de 6 GB o CPU con RAM suficiente |

- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). En el extremo profesional, A100 o H100 no aportan ventaja significativa por el reducido tamano del modelo.
- Compatibilidad con GPU de consumidor: si, el modelo cabe holgadamente en GPU de gama media y alta, incluso en cuantizaciones Q4 y Q5.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio para ejecucion local en formato GGUF; el repositorio tambien se etiqueta con la libreria transformers y compatibilidad con endpoints, por lo que puede servirse mediante soluciones estandar de inferencia.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Se comparan modelos generalistas de tamano equivalente. Los datos de los comparadores son especificaciones publicas ampliamente conocidas; los del modelo analizado figuran como no disponibles en varios campos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Veiled-Calla-4B (gguf) | ~3,88B | no disponible | en | apache-2.0 | Roleplay y narrativa de misterio |
| Llama-3.2-3B | ~3,21B | 128k | multilingue (8 idiomas declarados) | Llama 3.2 Community License | Proposito general |
| Qwen2.5-3B | ~3,09B | 32k | multilingue (29 idiomas declarados) | Apache-2.0 (segun variante) | Proposito general |
| Phi-3.5-mini | ~3,82B | 128k | multilingue | MIT | Proposito general y razonamiento |

Frente a estos, Veiled Calla 4B se diferencia por su especializacion en roleplay y narrativa atmosferica, pero carece de contexto documentado, de soporte multilingue y de resultados de evaluacion, por lo que no es comparable en tareas generales de razonamiento o codigo.

## Limitaciones y advertencias

- El modelo esta entrenado y declarado unicamente para ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- No se documenta la longitud de contexto soportada, lo que dificulta planificar su uso en conversaciones de muchos turnos o documentos largos.
- Al ser un modelo de ~4B, presenta mayor riesgo de alucinacion y de incoherencia en tramas largas que modelos de mayor tamano.
- El propio autor advierte de que puede generar respuestas excesivamente cripticas o confusas en determinados contextos.
- En modo roleplay con system prompt de personaje, el modelo es "uncensored": puede producir contenido para adultos o sensible sin filtros. Es responsabilidad del integrador aplicar moderacion si el despliegue es publico.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets de entrenamiento, no detallados en la informacion disponible.
- El repositorio registra cero descargas y cero likes, y no cuenta con evaluaciones independientes, por lo que su calidad y estabilidad no estan validadas por la comunidad.
- No hay documentacion sobre tool calling, agentes ni integracion con pipelines de produccion; no debe asumirse soporte de estas capacidades.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Emerald7664/Veiled-Calla-4B-gguf
- Modelo base: https://huggingface.co/soob3123/Veiled-Calla-4B
- Coleccion Amoral del autor del modelo base (mencionada en la model card): https://huggingface.co/collections/soob3123/amoral-collection-67dccc556a39894b36f59676
- Paper, blog, repositorio o demo adicionales: no disponibles (las busquedas web no devolvieron resultados relacionados con el modelo).
