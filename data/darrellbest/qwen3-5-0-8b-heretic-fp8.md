# darrellbest/Qwen3.5-0.8B-Heretic-FP8

## Resumen

Qwen3.5-0.8B-Heretic-FP8 es una compilacion cuantizada en FP8 del modelo darrellbest/Qwen3.5-0.8B-Heretic, que a su vez es una version de Qwen/Qwen3.5-0.8B (Qwen Team, Alibaba) a la que se le ha eliminado el comportamiento de rechazo mediante la herramienta Heretic y la tecnica Arbitrary-Rank Ablation aplicada sobre los pesos completos. El resultado declarado por el autor es de 15 rechazos sobre 100 prompts, frente a 98 sobre 100 del modelo original, con una divergencia KL de 0,0714. Este repositorio concreto aplica una cuantizacion FP8 W8A8 orientada a servir el modelo con vLLM, reduciendo el peso de 1,78 GB a 1,47 GB.

El modelo base es un transformer denso multimodal de 873.438.784 parametros (0,87 B) con soporte nativo de vision-lenguaje. La arquitectura combina capas de atencion completa con capas Gated DeltaNet (atencion lineal recurrente), ademas de un vision encoder y un bloque de multi-token prediction. La tabla de embeddings, de 248k tokens y atada a lm_head, se mantiene en bf16 porque representa una fraccion considerable de un modelo de este tamano.

Su relevancia practica esta en el nicho concreto que ocupa: un modelo multimodal por debajo de los 1.000 millones de parametros, sin filtros de rechazo, cuantizado en FP8 y con soporte directo en vLLM 0.30.0. Esto permite desplegarlo en una sola GPU con un coste de VRAM muy bajo y con un throughput agregado alto (unos 7.300 tokens/s a batch 32, segun las pruebas del autor), lo que lo hace util para prototipado rapido, clasificacion multimodal a gran escala o entornos donde el modelo completo en bf16 no cabe o resulta caro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con atencion hibrida: capas de atencion completa y capas Gated DeltaNet (linear_attn), vision encoder y bloque de multi-token prediction (MTP) |
| Parametros totales | 873.438.784 (0,87 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | FP8 E4M3 W8A8: pesos FP8 con escalas por canal y activaciones FP8 dinamicas por token en las capas lineales del MLP y en las proyecciones de atencion de las capas de atencion completa. El resto se mantiene en bf16. El esquema de cuantizacion es FP8_DYNAMIC, generado con llm-compressor 0.13.0. Existen variantes GGUF (BF16, Q8_0, Q4_K_M) y NVFP4 en repositorios hermanos |
| Idiomas soportados | no disponible (el repositorio no declara idiomas) |
| Licencia | apache-2.0, con license_link a la licencia de Qwen/Qwen3.5-0.8B |
| Formato de pesos | safetensors con formato compressed-tensors; los pesos de multi-token prediction se guardan aparte en model-auxiliary.safetensors |
| Tamano del repositorio | 1,5 GB; pesos FP8: 1,47 GB (el bf16 original ocupa 1,78 GB) |
| Pipeline declarado | image-text-to-text |
| Vocabulario | tabla de embeddings de 248k tokens, atada a lm_head, mantenida en bf16 |
| Relacion con el modelo base | cuantizado (base_model_relation: quantized) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal denso de 0,87 B de parametros con una arquitectura de atencion hibrida. Segun la model card, conviven capas de atencion completa con capas Gated DeltaNet etiquetadas como `linear_attn`, un bloque de multi-token prediction (MTP) y un vision encoder para entrada de imagenes. El pipeline declarado es image-text-to-text, es decir, acepta imagen y texto como entrada y genera texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF o DPO; esos datos no aparecen en la informacion proporcionada.

Sobre el proceso de cuantizacion, si hay detalle tecnico. La conversion se realizo con llm-compressor 0.13.0 usando el esquema FP8_DYNAMIC. Se cuantizaron a FP8 E4M3 unicamente las capas lineales del MLP y las proyecciones de atencion de las capas de atencion completa; el resto de componentes permanece en bf16: el vision encoder, las capas Gated DeltaNet, el bloque de multi-token prediction, los embeddings atados a lm_head y las normas. Los parametros A_log y de normalizacion de DeltaNet se mantienen en float32, igual que en el modelo original, justificado por el autor porque el estado recurrente de DeltaNet es sensible a la baja precision. Los pesos de multi-token prediction, que el guardado cuantizado descarta, se copiaron sin cambios a model-auxiliary.safetensors.

La innovacion principal del linaje del modelo no esta en el entrenamiento sino en la ablacion de rechazos: el modelo base Heretic se genero eliminando el comportamiento de rechazo con Heretic mediante Arbitrary-Rank Ablation sobre los pesos completos, alcanzando 15 rechazos de 100 con una divergencia KL de 0,0714 respecto al original. Es importante notar que los pesos FP8 de este repositorio no se volvieron a medir para rechazos; la cifra de 15/100 corresponde al modelo Heretic en bf16.

## Capacidades

- Generacion de texto conversacional multi-turno, con pipeline declarado conversational.
- Comprension de imagenes y texto de forma conjunta (image-text-to-text): la model card indica que el modelo describe correctamente una imagen de prueba con un circulo rojo y un cuadrado azul, y el vision encoder se mantiene sin cuantizar en bf16.
- Modo de razonamiento o thinking mode: el autor lo evaluo con 4 problemas aritmeticos y de palabras repetidos con 10 semillas cada uno.
- Capacidades aritmeticas y de resolucion de problemas textuales basicos: 24 de 40 ejecuciones terminaron y fueron correctas en la prueba del autor.
- Salida de texto sin filtros de rechazo: el linaje Heretic reduce los rechazos de 98/100 a 15/100 segun las mediciones sobre el modelo bf16.
- Multi-token prediction (MTP): el modelo incluye un bloque MTP, aunque los pesos correspondientes se conservan en un fichero auxiliar separado tras la cuantizacion.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible.
- Idiomas soportados: no declarados en el repositorio.
- No se documentan capacidades especificas de generacion de codigo.

## Casos de uso

- Prototipado rapido de asistentes multimodales: al pesar 1,47 GB en FP8 y cargarse con un solo comando (`vllm serve`), permite levantar un asistente que acepta imagenes y texto en una GPU modesta para validar productos antes de escalar a un modelo mayor.
- Clasificacion y etiquetado de imagenes a gran escala: el pipeline image-text-to-text y el throughput agregado de unos 7.300 tokens/s a batch 32 (segun la medicion del autor en RTX PRO 6000 Blackwell) lo hacen adecuado para procesar lotes grandes de imagenes con descripciones o etiquetas generadas.
- Generacion de descripciones de imagen (captioning) en pipelines de accesibilidad: el modelo puede producir texto descriptivo a partir de una imagen, y su tamano reducido permite ejecutarlo en el mismo nodo que el almacenamiento de los ficheros.
- Evaluacion de tecnicas de ablacion y cuantizacion: es un caso de uso de investigacion directo, ya que combina dos transformaciones (eliminacion de rechazos y cuantizacion FP8) sobre un modelo pequeno, con cifras publicadas de rechazo y divergencia KL para comparar.
- Tests de regresion de calidad tras cuantizar: el autor publico una comparativa de razonamiento en modo thinking (24/40 frente a 27/40 del bf16), util como plantilla para medir la degradacion introducida por FP8 en modelos propios.
- Servicio de inferencia de alto rendimiento con vLLM: el modelo esta empaquetado en compressed-tensors y verificado en vLLM 0.30.0, por lo que encaja en un despliegue con batching continuo y escalado horizontal de replicas baratas.
- Experimentacion sobre comportamiento sin filtros de rechazo: para equipos que investigan seguridad, alineamiento o evaluacion de riesgos, el modelo sirve como sujeto de prueba controlado con un indice de rechazo medido (15/100 en bf16).
- Preprocesado multimodal en pipelines de agentes: uso como etapa barata que interpreta capturas de pantalla o documentos escaneados y devuelve texto estructurado a un modelo mayor, aunque el soporte explicito de tool calling no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos publicados son internos del autor:

| Metrica | Qwen3.5-0.8B-Heretic-FP8 | Qwen3.5-0.8B-Heretic (bf16) | Qwen3.5-0.8B original |
|---|---|---|---|
| Rechazos sobre 100 prompts | no medido | 15/100 | 98/100 |
| Divergencia KL frente al original | no disponible | 0,0714 | no aplica |
| Razonamiento en modo thinking (4 problemas x 10 semillas) | 24/40 correctos y terminados | 27/40 | 26/40 |
| Throughput en un solo stream | ~350 tokens/s | no disponible | no disponible |
| Throughput agregado a batch 32 (generaciones de 512 tokens) | ~7.300 tokens/s | no disponible | no disponible |
| Descripcion de imagen de prueba | correcta | no disponible | no disponible |

Notas: los datos de throughput y la comprobacion funcional se obtuvieron en vLLM 0.30.0 sobre una RTX PRO 6000 Blackwell. Los pesos FP8 no se volvieron a medir para rechazos, por lo que la cifra de 15/100 corresponde al modelo bf16 del que derivan.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan 1,47 GB. Hay que sumar los componentes que siguen en bf16 (vision encoder, embeddings de 248k tokens, capas DeltaNet) y la cache KV. Como estimacion orientativa, un despliegue en vLLM con contexto moderado deberia caber en el rango de 3-5 GB de VRAM; el autor no publica una cifra exacta de VRAM en uso.
- GPU recomendadas: el autor verifico el modelo en una RTX PRO 6000 Blackwell. Para aprovechar los kernels FP8 de vLLM se necesitan arquitecturas con soporte FP8, es decir, generaciones Ada Lovelace o posteriores (RTX 4090, L40S, H100, B200, RTX PRO 6000).
- GPU de consumo: si cabe con holgura en tarjetas de consumo con soporte FP8, como la RTX 4090 (24 GB), y muy probablemente en GPUs con 8 GB o mas. No se ha verificado en la informacion proporcionada el comportamiento en tarjetas sin soporte FP8 nativo.
- Opciones de despliegue: vLLM es la via soportada y verificada (formato compressed-tensors). Para llama.cpp u Ollama hay que usar el repositorio hermano Qwen3.5-0.8B-Heretic-GGUF (BF16, Q8_0, Q4_K_M mas mmproj de vision). Existe tambien una variante NVFP4 para vLLM sobre Blackwell. No se documenta soporte para TGI ni SGLang en este repositorio concreto (el bf16 si indica SGLang).
- Latencia y throughput: ~350 tokens/s en un solo stream y ~7.300 tokens/s agregados a batch 32 con generaciones de 512 tokens, medidos en una RTX PRO 6000 Blackwell con vLLM 0.30.0. No hay datos de latencia en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y tamano | Contexto | Rendimiento publicado | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| darrellbest/Qwen3.5-0.8B-Heretic-FP8 (este) | 0,87 B | FP8 W8A8, 1,47 GB | no disponible | 24/40 en thinking; ~350 tok/s single-stream; ~7.300 tok/s a batch 32 | apache-2.0 | vLLM |
| darrellbest/Qwen3.5-0.8B-Heretic | 0,87 B | bf16 safetensors, 1,78 GB | no disponible | 15/100 rechazos, KL 0,0714, 27/40 en thinking | apache-2.0 | transformers, vLLM, SGLang |
| darrellbest/Qwen3.5-0.8B-Heretic-GGUF | 0,87 B | GGUF BF16 / Q8_0 / Q4_K_M, 1,56 / 0,83 / 0,54 GB + 0,20 GB mmproj | no disponible | no publicado | apache-2.0 | llama.cpp, Ollama |
| darrellbest/Qwen3.5-0.8B-Heretic-NVFP4 | 0,87 B | NVFP4, 1,33 GB | no disponible | no publicado | apache-2.0 | vLLM sobre Blackwell |
| Qwen/Qwen3.5-0.8B (original) | 0,87 B | bf16 | no disponible | 98/100 rechazos, 26/40 en thinking | apache-2.0 | transformers, vLLM, SGLang |

En la busqueda web aparecen ademas otras reproducciones del mismo experimento de ablacion sobre Qwen3.5-0.8B (schnow265/Qwen_Qwen3.5-0.8B-heretic y FadedRedStar/Qwen3.5-0.8B-heretic-GGUF) y endpoints de inferencia gestionada sobre variantes heretic (FriendliAI, para ossipoff y Dingdust). No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Reduccion deliberada de los mecanismos de seguridad: el propio autor advierte de que el modelo tiene los guardarrailes reducidos por diseno y de que la responsabilidad de su uso recae en quien lo despliega. Los rechazos bajan de 98/100 a 15/100.
- La medicion de rechazos no se repitio sobre los pesos FP8: la cifra de 15/100 corresponde al modelo Heretic en bf16. El comportamiento de la version cuantizada puede diferir.
- Degradacion por cuantizacion en razonamiento: 24/40 frente a 27/40 de la version bf16 en la prueba de thinking mode del autor, con 10 semillas por problema. Es una muestra pequena y no equivale a un benchmark estandar.
- Riesgo de alucinacion: con 0,87 B de parametros, la tasa de error factual es previsiblemente alta en tareas de conocimiento. No se publican mediciones de fidelidad.
- Componentes sensibles a la precision mantenidos en bf16 por decision de diseno: el estado recurrente de DeltaNet y los embeddings de 248k tokens. Cualquier cuantizacion adicional agresiva (por ejemplo, por debajo de FP8) puede degradar el modelo de forma no lineal.
- Longitud de contexto no declarada en el repositorio: no se puede planificar el uso con documentos largos sin verificarlo en la practica.
- Idiomas soportados no declarados: no hay garantia documentada de calidad multilingue, aunque el modelo base Qwen3.5 suele ser multilingue. No se debe asumir sin verificar.
- Sin soporte documentado de tool calling ni de uso agentico: no hay evidencia en la model card de que el modelo maneje function calling de forma fiable.
- Licencia apache-2.0, permisiva y apta para uso comercial, pero enlaza a la licencia de Qwen/Qwen3.5-0.8B. Conviene revisar los terminos del modelo original antes de un despliegue comercial.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, y creado el 25 de septiembre de 2026. No hay validacion independiente de las cifras publicadas.
- Los pesos de multi-token prediction se guardan en model-auxiliary.safetensors, fuera del guardado cuantizado. Si el framework de despliegue no los carga, se pierde la funcionalidad asociada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-FP8
- Modelo base en bf16: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic
- Variante GGUF: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-GGUF
- Variante NVFP4: https://huggingface.co/darrellbest/Qwen3.5-0.8B-Heretic-NVFP4
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- Herramienta Heretic: https://github.com/p-e-w/heretic
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Reproduccion alternativa de la ablacion (schnow265): https://huggingface.co/schnow265/Qwen_Qwen3.5-0.8B-heretic
- Variante GGUF de terceros (FadedRedStar): https://huggingface.co/FadedRedStar/Qwen3.5-0.8B-heretic-GGUF
- Endpoint gestionado sobre variante heretic (FriendliAI): https://friendli.ai/models/ossipoff/Qwen3.5-0.8B-heretic
- Leaderboard de modelos autoalojados: https://onyx.app/self-hosted-llm-leaderboard
