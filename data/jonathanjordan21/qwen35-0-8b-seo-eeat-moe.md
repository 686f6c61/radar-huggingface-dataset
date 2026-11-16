# jonathanjordan21/qwen35-0.8b-seo-eeat-moe

## Resumen

El modelo `jonathanjordan21/qwen35-0.8b-seo-eeat-moe` es un adaptador jerarquico de tipo Mixture of Experts (MoE) construido sobre el backbone `Qwen/Qwen3.5-0.8B`. Lo desarrolla el usuario jonathanjordan21 y esta orientado a tareas de SEO y E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) aplicadas a noticias en indonesio. La implementacion se apoya en adaptadores `RoutedLoRALinear` gobernados por un enrutador jerarquico que distribuye la inferencia entre cuatro sub-tareas especializadas.

Se trata de un modelo causal-LM con pesos en formato PyTorch y codigo personalizado (`trust_remote_code`), con un total de 21.645.312 parametros entrenables (aproximadamente el 2,80% del modelo base). El entrenamiento se realizo durante 3 epocas con una longitud maxima de secuencia de 1024 tokens, sobre un dataset propio de noticias indonesias orientado a SEO y E-E-A-T.

Su relevancia es acotada y muy especifica: no es un modelo de proposito general, sino un experimento de adaptacion con enrutado MoE sobre LoRA para una tarea vertical (generacion de titulares y metadatos SEO en indonesio). El repositorio tiene 0 descargas y 1 like en el momento de la consulta, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM con adaptadores LoRA enrutados (RoutedLoRALinear) y enrutador jerarquico (MoE sobre el backbone Qwen3.5-0.8B) |
| Parametros totales | 21.645.312 parametros entrenables (~2,80% del modelo base); total del backbone no disponible |
| Parametros activos | no disponible (el enrutador selecciona expertos por sub-tarea, pero no se publica el reparto de activos) |
| Longitud de contexto | 1024 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | indonesio (id) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (safetensors/bin no especificado), requiere `trust_remote_code=True` |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tareas objetivo | 4 sub-tareas de SEO y E-E-A-T en noticias indonesias |
| Tamano del repositorio | 3,2 GB |

## Arquitectura y entrenamiento

El modelo parte del backbone `Qwen/Qwen3.5-0.8B` e incorpora adaptadores `RoutedLoRALinear` que actuan como expertos especializados. Un enrutador jerarquico decide que experto (o combinacion) se activa en funcion de la sub-tarea solicitada, lo que constituye una variante de MoE implementada a nivel de adaptadores LoRA en lugar de capas densas completas. Esta tecnica permite mantener el coste de entrenamiento e inferencia bajo (solo se entrenan ~21,6 M de parametros) mientras se especializa el comportamiento en dominios concretos.

El entrenamiento se realizo durante 3 epocas con secuencias de hasta 1024 tokens sobre un dataset propio de noticias indonesias orientado a SEO y E-E-A-T, publicado por el mismo autor. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El modelo esta disenado para devolver JSON valido como formato de salida, segun el ejemplo de la model card.

## Capacidades

- Generacion de texto causal-LM orientada a tareas SEO en noticias en indonesio.
- Generacion de titulares SEO (el ejemplo de la model card produce exactamente dos titulares en formato JSON).
- Analisis y aplicacion de criterios E-E-A-T sobre contenido periodistico.
- Salida estructurada en JSON (el system prompt del ejemplo fuerza "Return valid JSON only").
- Enrutado por sub-tarea mediante el enrutador jerarquico (4 sub-tareas especializadas).
- Soporte de chat template mediante `apply_chat_template` de Transformers.
- Tool calling / function calling: no disponible.
- Capacidades de agente o multi-step reasoning: no disponible.
- Vision, audio o thinking mode: no disponible.
- Multilingue: limitado a indonesio (`id`); no se declara soporte de otros idiomas.

## Casos de uso

- Generacion de titulares SEO para medios digitales indonesios: el modelo puede recibir el cuerpo de una noticia y devolver un array JSON con dos titulares optimizados, tal como muestra el ejemplo de la model card, gracias a su especializacion en SEO y al formato de salida estructurado.
- Auditoria de E-E-A-T en articulos: dado un texto periodistico, el modelo puede evaluar y reescribir fragmentos segun criterios de experiencia, pericia, autoridad y confianza, usando el experto correspondiente del enrutador.
- Enriquecimiento de metadatos editoriales: integrable en un pipeline CMS que, tras la redaccion, genere titulares alternativos y sugerencias SEO con salida JSON parseable.
- Clasificacion y enrutado de tareas editoriales: el enrutador jerarquico permite dirigir cada peticion a la sub-tarea adecuada (titulares, metadatos, evaluacion E-E-A-T, etc.) sin cambiar de modelo.
- Prototipado de asistentes editoriales en indonesio: como adaptador ligero (~21,6 M parametros entrenables) puede desplegarse sobre el backbone de 0,8 B para experimentar con flujos de asistencia a redactores.
- Investigacion sobre MoE con LoRA enrutado: el modelo sirve como caso de estudio reproducible de adaptadores `RoutedLoRALinear` con enrutador jerarquico sobre un LLM pequeno.
- Filtrado y priorizacion de noticias por calidad SEO: aplicable a la hora de detectar articulos con titulares deficientes y proponer alternativas antes de publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el backbone es de 0,8 B parametros y el repositorio pesa 3,2 GB, por lo que en bfloat16 deberia caber holgadamente en GPUs de consumo con 8 GB o mas (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano del backbone, una RTX 3090/4090 o una A100/H100 serian suficientes; tambien una GPU de consumo media.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del backbone (0,8 B); requiere `torch_dtype=torch.bfloat16` en CUDA o `float32` en CPU segun el ejemplo.
- Opciones de despliegue: el autor solo documenta carga nativa con `transformers` (`AutoModelForCausalLM`) y `trust_remote_code=True`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al usar codigo personalizado, la compatibilidad con estos motores no esta garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| jonathanjordan21/qwen35-0.8b-seo-eeat-moe | 21,6 M entrenables sobre backbone 0,8 B | 1024 tokens | no disponible | Adaptador MoE/LoRA para SEO en indonesio | Hugging Face, requiere `trust_remote_code` |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible en esta ficha | no disponible | LLM causal generalista | Hugging Face |
| Adaptadores LoRA genericos sobre Qwen | variable | depende del backbone | depende del autor | Fine-tuning de tarea unica | Hugging Face |

No se dispone de datos de rendimiento comparado con alternativas; la comparativa se limita a parametros y enfoque.

## Limitaciones y advertencias

- Modelo altamente especializado en indonesio y en SEO/E-E-A-T; no es adecuado como LLM de proposito general.
- Contexto de entrenamiento de solo 1024 tokens, lo que limita el procesamiento de articulos largos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el codigo antes de usarlo en produccion.
- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribucion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base.
- Riesgo de alucinacion inherente a un modelo de 0,8 B con adaptadores; no se documentan mitigaciones.
- Sesgos: no documentados por el autor; al entrenarse sobre un dataset de noticias indonesias, puede heredar sesgos editoriales de dicha fuente.
- Repositorio con 0 descargas y 1 like: ecosistema de validacion practicamente nulo.
- No se documenta soporte para tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonathanjordan21/qwen35-0.8b-seo-eeat-moe
- Dataset de entrenamiento: https://huggingface.co/datasets/jonathanjordan21/indonesian-news-seo-eeat-moe-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
