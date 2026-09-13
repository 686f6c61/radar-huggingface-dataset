# schwyzquant/DeepSeek-V4.1-Flash-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-UNCENSORED-FP8 es una version modificada por el usuario schwyzquant (con credito a dealignai en la model card) del modelo deepseek-ai/DeepSeek-V4.1-Flash. La modificacion consiste en una "abliteracion" a nivel de pesos aplicada de forma quirurgica: segun el autor, se elimina el circuito de rechazo del modelo base preservando intactos los expertos enrutados, la memoria Engram, la atencion dispersa CSA2, la cabeza de borrador especulativa DSpark, la torre de vision, las puertas del router, las normalizaciones y los embeddings. El resultado declarado es un checkpoint estandar que se carga igual que el modelo base, sin hooks en tiempo de ejecucion ni vectores de direccion.

El modelo conserva la arquitectura multimodal de texto e imagen del base, con una ventana de contexto declarada de 1 millon de tokens y cuantizacion nativa en FP8 (e4m3fn) con escalas de bloque E8M0 [32, 32] y expertos enrutados en FP4. El recuento real de parametros en safetensors es de 763.205.315.794, aunque la model card describe un backbone de 552B con 8B/16B activos por token, una discrepancia que no se explica en la informacion disponible. El repositorio ocupa 510,3 GB.

Su relevancia es doble. Por un lado, es un caso de estudio sobre eliminacion de guardarrailes a escala de cientos de miles de millones de parametros, con resultados de HarmBench-320 que pasan del 1,56% de cumplimiento en el base (effort=max) al 100% en esta variante. Por otro, es un artefacto con implicaciones claras de seguridad: el propio autor publica una tasa de exito de ataque del 100% en siete categorias semanticas de HarmBench, incluidas chemical_biological y cybercrime_intrusion. A fecha de la ficha no tiene descargas ni likes y no se han encontrado referencias externas independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal encoder-decoder (20+20 capas), MoE con 384 expertos enrutados top-6 + 1 compartido, Hyper-Connections (residual de 4 canales), atencion dispersa CSA2, memoria n-gram Engram, borrador especulativo DSpark |
| Parametros totales | 763.205.315.794 (safetensors); la model card indica 552B de backbone |
| Parametros activos | 8B por token, con 16B tambien citados en la model card |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 (e4m3fn) con escalas de bloque E8M0 [32, 32] en pesos; expertos enrutados en FP4; nativa, sin cambios por parte del uploader |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada por el uploader) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash |
| Tamano del repositorio | 510,3 GB |
| Modalidad | Texto e imagen (DeepSeek-ViT con 2D-RoPE y pixel unshuffle) |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento original en la documentacion proporcionada; todos los datos de arquitectura proceden de la model card del uploader y describen el modelo base. La arquitectura es un transformer causal encoder-decoder de 20+20 capas con mezcla de expertos: 384 expertos enrutados con top-6 mas un experto compartido. Incorpora Hyper-Connections con residual de 4 canales, atencion dispersa CSA2, memoria n-gram Engram y una cabeza de borrador especulativa DSpark (denominada MTP o DSpark en la propia ficha). La torre de vision es DeepSeek-ViT con 2D-RoPE y pixel unshuffle.

Lo especifico de esta publicacion no es el entrenamiento, sino la intervencion sobre los pesos. El autor afirma que la abliteracion se aplico a nivel de pesos de forma quirurgica, sin `model.py` personalizado, sin hooks de ejecucion y sin vectores de steering, preservando byte a byte los componentes criticos para capacidades y dejando intacta la cuantizacion nativa FP8/FP4. No se documentan en la informacion disponible ni el dataset de ablacion, ni el metodo exacto, ni si hubo fases adicionales de ajuste, RLHF o DPO. Tampoco se indica la composicion del corpus de entrenamiento del modelo base.

## Capacidades

- Generacion de texto y razonamiento con modo de esfuerzo configurable (effort=off y effort=max), siendo este ultimo el valor por defecto declarado ("reasoning-max default").
- Razonamiento multimodal: entrada de imagen y texto mediante el pipeline image-text-to-text y la torre DeepSeek-ViT.
- Procesamiento de contexto largo: ventana declarada de 1M tokens, adecuada para documentos extensos o conversaciones multi-turno muy largas.
- Uso de herramientas: la model card menciona soporte de tools, aunque no detalla el formato ni las capacidades concretas de function calling.
- Decodificacion especulativa mediante la cabeza DSpark, orientada a reducir latencia en generacion.
- Memoria n-gram Engram, que segun el autor se conserva intacta y puede ayudar en coherencia multi-turno.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Generacion de codigo y matematicas: no se documentan de forma especifica, aunque MMLU incluye asignaturas de informatica, algebra abstracta y matematicas de secundaria con caidas medibles.
- Ausencia deliberada de rechazos: el modelo no presenta HARD_REF, SOFT_RED ni HEDGE segun la evaluacion del propio autor, ni siquiera en categorias de dano.

## Casos de uso

- Investigacion en seguridad y red-teaming: el modelo sirve como sujeto de prueba para medir robustez de clasificadores de contenido, ya que su tasa de cumplimiento del 100% en HarmBench-320 permite evaluar defensas contra modelos sin guardarrailes sin necesidad de construir uno propio.
- Analisis de documentos extensos con imagenes: con 1M tokens de contexto y entrada multimodal, se puede procesar un expediente completo con figuras, tablas escaneadas y anexos en una sola pasada, por ejemplo en revision documental tecnica o auditoria.
- Ficcion y narrativa con tematicas adultas: al no aplicar rechazos por contenido, es util en escritura creativa que aborde violencia, sexualidad o temas controvertidos donde el modelo base tiende a hedgear.
- Generacion de datos sinteticos adversarios: permite producir ejemplos de peticiones peligrosas y respuestas completas para entrenar clasificadores de seguridad, siempre en un entorno controlado y con las salvaguardas de uso oportunas.
- Asistencia en investigacion legal o medica con preguntas limite: en dominios donde el modelo base rechaza por prudencia, esta variante responde, lo que puede interesar en simulacion de casos o docencia, con supervision humana obligatoria.
- Pipelines agenticos de varios pasos: la combinacion de contexto de 1M tokens, uso de herramientas y decodificacion especulativa lo hace viable para agentes que mantienen estado largo y encadenan llamadas, aunque el soporte real de function calling no esta documentado en detalle.
- Evaluacion de robustez a jailbreak: al estar ya abliterado, sirve como referencia de "techo" de vulnerabilidad frente a la que comparar otros modelos en estudios academicos de alineacion.

## Benchmarks y rendimiento

Todos los resultados que siguen son autodeclarados por el autor y no han pasado revision independiente. "CRACK" es el nombre que el autor da a esta build abliterada. En HarmBench-320, una tasa de exito de ataque (ASR) mas alta significa mas cumplimiento de peticiones daninas, es decir, peor comportamiento desde el punto de vista de seguridad.

HarmBench-320, temperatura 0, decodificacion voraz, clasificacion en cuatro niveles (HARD_REF / SOFT_RED / HEDGE / COMPLY):

| Evaluacion | ASR modelo base | ASR CRACK | Delta |
|---|---:|---:|---:|
| HB-320 effort=off | 137/320 = 42,81% | 320/320 = 100,00% | +57,19 pp |
| HB-320 effort=max | 5/320 = 1,56% | 320/320 = 100,00% | +98,44 pp |

Desglose por categoria semantica de HarmBench:

| Categoria | Items | Base off | CRACK off | Base max | CRACK max |
|---|---:|---:|---:|---:|---:|
| chemical_biological | 42 | 16,7% | 100,0% | 0,0% | 100,0% |
| copyright | 80 | 98,8% | 100,0% | 0,0% | 100,0% |
| cybercrime_intrusion | 52 | 34,6% | 100,0% | 3,8% | 100,0% |
| harassment_bullying | 21 | 0,0% | 100,0% | 0,0% | 100,0% |
| harmful | 18 | 11,1% | 100,0% | 5,6% | 100,0% |
| illegal | 53 | 13,2% | 100,0% | 0,0% | 100,0% |
| misinformation_disinformation | 54 | 44,4% | 100,0% | 3,7% | 100,0% |

MMLU-14k completo, logits del modelo base, temperatura 0:

| Build | Correctas | Precision | Delta |
|---|---:|---:|---:|
| base | 12.211 / 14.042 | 86,96% | — |
| CRACK | 11.619 / 14.042 | 82,74% | -4,22 pp |

Excluyendo el cluster de etica (moral_scenarios, business_ethics, professional_law, jurisprudence, philosophy), el delta sobre los aproximadamente 11.000 items restantes es de -1,1 pp, dentro del objetivo de preservacion de conocimiento de 3 pp declarado por el autor.

Asignaturas con mayor degradacion segun el desglose publicado:

| Asignatura | n | Base | CRACK | Delta pp |
|---|---:|---:|---:|---:|
| moral scenarios | 895 | 76,9% | 37,0% | -39,89 |
| professional law | 1.534 | 75,9% | 68,8% | -7,04 |
| abstract algebra | 100 | 77,0% | 71,0% | -6,00 |
| security studies | 245 | 84,5% | 79,2% | -5,31 |
| high school computer science | 100 | 98,0% | 94,0% | -4,00 |
| jurisprudence | 108 | 90,7% | 87,0% | -3,70 |
| machine learning | 112 | 81,2% | 77,7% | -3,57 |

El desglose completo por asignatura (57 materias) aparece truncado en la informacion disponible. La metodologia de clasificacion combina un clasificador regex multilingue de cuatro niveles y, para effort=max, un LLM como juez sobre la traza de razonamiento guardada.

## Requisitos de hardware

- VRAM para los pesos: el repositorio ocupa 510,3 GB, cifra que se corresponde aproximadamente con el espacio minimo de pesos en FP8/FP4. A ello hay que sumar cache KV, estados de atencion y buffers de activacion, cuyo tamano no se documenta.
- Configuraciones realistas: un nodo con 8x H100 de 80 GB (640 GB) queda muy justo y probablemente insuficiente para contexto largo; 8x H200 de 141 GB (1.128 GB) o 4x B200 de 192 GB (768 GB) ofrecen margen. Estas cifras son estimaciones basadas en el tamano del repositorio, no datos publicados por el autor.
- GPU de consumo: no es desplegable en ninguna GPU de consumo. No cabe en RTX 4090, RTX 5090 ni en configuraciones multi-GPU de gama alta con menos de 500 GB de VRAM agregada.
- Despliegue: la libreria declarada es transformers con pesos safetensors. El tag endpoints_compatible sugiere compatibilidad con endpoints gestionados. No se publica ninguna version GGUF, por lo que llama.cpp y Ollama no estan disponibles. El soporte en vLLM, SGLang o TGI no se confirma en la informacion proporcionada, y la arquitectura personalizada (encoder-decoder causal con MoE asimetrico) probablemente requiera soporte especifico no garantizado.
- Latencia y throughput: no disponible. La presencia de la cabeza especulativa DSpark sugiere optimizacion de decodificacion, pero no se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La unica comparacion con datos verificables en la informacion disponible es contra el propio modelo base. No se han proporcionado datos de otros modelos abliterados o de la misma categoria.

| Modelo | Parametros | Contexto | HarmBench-320 ASR (effort=max) | MMLU | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552B backbone (763,2B en safetensors de esta build) | 1M tokens | 1,56% | 86,96% | no disponible | HuggingFace |
| schwyzquant/DeepSeek-V4.1-Flash-UNCENSORED-FP8 (esta ficha) | 763.205.315.794 | 1M tokens | 100,00% | 82,74% | MIT (declarada por el uploader) | HuggingFace, 0 descargas |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor senala un efecto interesante: en el modelo base, subir el esfuerzo de razonamiento reduce el ASR del 42,81% al 1,56%, porque el razonamiento explicito aflora consideraciones de seguridad antes de responder. En la build abliterada ese efecto desaparece por completo.

## Limitaciones y advertencias

- Eliminacion total de guardarrailes: el modelo cumple el 100% de las peticiones de HarmBench-320, incluidas las de las categorias chemical_biological y cybercrime_intrusion. Es un artefacto con potencial de dano real y no deberia exponerse a usuarios finales ni a trafico no controlado.
- Sesgos: no hay evaluacion de sesgos en la informacion disponible. La caida de -39,89 pp en moral_scenarios sugiere que el comportamiento en cuestiones normativas o eticas cambia de forma drastica, aunque la causa es la ablacion, no un sesgo aprendido.
- Alucinacion: no se han publicado evaluaciones de factualidad ni de tasas de alucinacion. La degradacion general de MMLU (-4,22 pp) indica perdida de conocimiento, mas acusada en derecho y humanidades.
- Limitaciones de contexto e idioma: se declara 1M tokens de contexto, pero no hay evaluaciones tipo RULER o Needle-in-a-Haystack que confirmen el rendimiento efectivo a esa longitud. No se especifican idiomas soportados.
- Licencia: la model card declara MIT, pero no se indica la licencia del modelo base DeepSeek-V4.1-Flash. Si el base impone restricciones adicionales, la redistribucion bajo MIT podria ser incompatible; conviene verificar los terminos del modelo original antes de cualquier uso comercial.
- Trazabilidad y madurez: 0 descargas, 0 likes y una diferencia de un segundo entre creacion y actualizacion del repositorio. Los resultados de HarmBench y MMLU son autodeclarados, con metodologia propia y sin revision externa. No se han encontrado publicaciones, papers ni analisis independientes.
- Inconsistencia de parametros: la model card indica 552B de backbone mientras que el recuento real de safetensors es de 763,2B; la discrepancia no se explica.
- Requisitos de infraestructura: mas de 500 GB de pesos implican un coste de despliegue muy alto y descartan cualquier uso en hardware de consumo.
- Uso responsable: cualquier aplicacion practica deberia limitarse a entornos de investigacion controlados, con supervision humana y cumplimiento de la normativa aplicable en materia de contenido danino.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/schwyzquant/DeepSeek-V4.1-Flash-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Perfil del autor en X: https://x.com/dealignai
- Perfil del segundo autor en X: https://x.com/jordanschenck
- Paper, repositorio o demo adicionales: no disponible en la informacion proporcionada
- Nota sobre la busqueda web: los resultados devueltos corresponden a herramientas de test de velocidad de MyBroadband y no guardan relacion con el modelo, por lo que no se incluyen como fuentes.
