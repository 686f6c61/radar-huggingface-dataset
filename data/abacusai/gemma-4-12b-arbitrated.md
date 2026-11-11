# abacusai/Gemma-4-12B-Arbitrated

## Resumen

Gemma-4-12B-Arbitrated es un ajuste fino de tipo *refusal removal* (eliminación de rechazos) sobre `google/gemma-4-12B-it`, desarrollado por Abacus.AI. El modelo conserva la arquitectura multimodal unificada del original —`Gemma4UnifiedForConditionalGeneration`, transformer denso decoder-only de 11,95 mil millones de parámetros con contexto de 262.144 tokens— y entradas de texto, imagen, audio y vídeo, con salida exclusivamente de texto. La intervención se aplica únicamente sobre las proyecciones de atención y MLP del modelo de lenguaje, dejando las rutas de imagen y audio byte-idénticas al modelo base.

El problema que aborda es el exceso de rechazos del modelo original: según la model card, Gemma 4 12B-it declina o matiza aproximadamente el 96 % de un conjunto reservado de prompts dañinos con el modo *thinking* desactivado y el 91 % con *thinking* activado. Tras el ajuste, Arbitrated responde a la mayoría de ellos (rechaza el 12,9 % y el 4,1 % respectivamente) y reduce drásticamente el sobre-rechazo en peticiones legítimas (de 45,4 % a 3,9 % en OR-Bench-hard).

La relevancia actual reside en que ofrece un comportamiento menos restrictivo manteniendo la interfaz, el formato de pesos y el conmutador de razonamiento del modelo oficial, lo que permite sustituirlo directamente en despliegues existentes. El coste se mide en capacidades de razonamiento: la propia model card reporta pérdidas de 6 puntos en MMLU-Pro y 7,5 en MMMU-Pro con *thinking* desactivado, y de 4,4 puntos en GPQA Diamond con *thinking* activado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only, multimodal unificado sin encoder (`Gemma4UnifiedForConditionalGeneration`) |
| Parametros totales | 11.959.730.224 (11,95 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso decoder-only de 48 capas con una intercalación 5:1 entre atención local de ventana deslizante y atención global: 40 capas usan ventana local de 1.024 tokens con GQA de 16 cabezas de consulta y 8 de clave-valor, mientras que 8 capas emplean atención global con una única cabeza KV compartida y RoPE proporcional. La dimensión oculta es 3840 con MLP de 15360, vocabulario de 262.144 tokens y precisión bfloat16. La multimodalidad es unificada y sin encoder: texto, imagen, audio y vídeo entran al mismo espacio de tokens, con salida de texto.

El ajuste se realizó mediante DPO con LoRA sobre el modelo base intacto, con un ancla de verosimilitud negativa (RPO), y el delta resultante se fusionó como actualización completa únicamente en las proyecciones de atención y MLP del modelo de lenguaje. El proceso de generación de preferencias usó una copia *abliterated* del mismo modelo como profesor para escribir respuestas conformes a los prompts que el base rechaza, un juez que conservó solo las respuestas etiquetadas como conformes, y entrenamiento del base para preferirlas frente a sus propios rechazos. El profesor no se distribuye y el contenido del dataset no se divulga. Las rutas de imagen y audio permanecen byte-idénticas al modelo original.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de texto, imagen, audio y vídeo, con salida de texto.
- Modo *thinking* conmutable, idéntico en funcionamiento al del modelo oficial.
- Respuesta a peticiones que el modelo base rechaza o matiza, con tasas de rechazo del 12,9 % (thinking off) y 4,1 % (thinking on) en el conjunto dañino reservado.
- Reducción del sobre-rechazo en peticiones legítimas: de 45,4 % a 3,9 % en OR-Bench-hard.
- Reconocimiento de voz y tareas de audio: la model card indica paridad con el base en ambas modalidades de razonamiento.
- Capacidades de instrucción y matemáticas preservadas: IFEval, IFBench y MATH-500 en paridad con el base según la evaluación del autor.
- Contexto largo de 262.144 tokens para conversaciones multi-turno y documentos extensos.
- Soporte de *tool calling* y comportamiento agéntico: no disponible en la informacion proporcionada.

## Casos de uso

- Investigación sobre alineación y rechazos: el modelo sirve como contrapunto controlado al base para estudiar cómo varía la tasa de rechazo con el entrenamiento por preferencias, manteniendo el resto de la arquitectura constante y comparable.
- Evaluación de robustez de jueces automáticos: al producir respuestas que el base declina, permite medir la sensibilidad de clasificadores de seguridad ante respuestas parcialmente conformes o ambiguas.
- Procesamiento de documentos largos multimodales: con 262.144 tokens de contexto y entrada de imagen, admite análisis de informes extensos con figuras y tablas en una sola pasada.
- Transcripción y análisis de audio: la ruta de audio byte-idéntica al base permite integrarlo en pipelines de reconocimiento de voz sin recalibrar esa parte del sistema.
- Sustitución directa en despliegues existentes: al compartir diseño de pesos, arquitectura y conmutador de razonamiento, puede reemplazar al modelo oficial en infraestructura ya montada para transformers o vLLM sin cambios de integración.
- Investigación sobre coste del *refusal removal*: los datos de la model card (pérdidas de 6 puntos en MMLU-Pro, 7,5 en MMMU-Pro y 4,4 en GPQA Diamond) permiten estudiar el intercambio entre permisividad y razonamiento en un modelo de 12 B.
- Generación de contenido creativo sin fricción: para aplicaciones donde el sobre-rechazo del base degrada la experiencia (ficción, guiones, escenarios hipotéticos), la caída del 45,4 % al 3,9 % en OR-Bench-hard reduce interrupciones no deseadas.

## Benchmarks y rendimiento

Los datos proceden de la evaluación propia del autor, ejecutada con la misma build de vLLM, temperatura 1.0 y top_p 0.95, en ambos modos de razonamiento. Las tasas de rechazo se puntuaron con un juez LLM (gpt-oss-120b, esfuerzo medio) sobre la respuesta completa.

| Benchmark | Base (thinking off) | Arbitrated (thinking off) | Base (thinking on) | Arbitrated (thinking on) |
|---|---|---|---|---|
| Rechazo en HarmBench + JailbreakBench (241 prompts) | 95,9 % | 12,9 % | 90,9 % | 4,1 % |
| Rechazo en OR-Bench-hard (1.319 prompts) | 45,4 % | 3,9 % | No disponible | No disponible |
| Rechazo en XSTest unsafe | No disponible | 33,5 % | No disponible | No disponible |
| MMLU-Pro | Referencia | −6 puntos | Referencia | No disponible |
| MMMU-Pro | Referencia | −7,5 puntos | Referencia | No disponible |
| GPQA Diamond | No disponible | No disponible | Referencia | −4,4 puntos |
| IFEval | Referencia | Paridad | Referencia | Paridad |
| IFBench | Referencia | Paridad | Referencia | Paridad |
| MATH-500 | Referencia | Paridad | Referencia | Paridad |
| Reconocimiento de voz | Referencia | Paridad | Referencia | Paridad |

El conjunto dañino reservado combina HarmBench estándar y JailbreakBench, con solapamiento con AdvBench eliminado y deduplicado frente a los pools de entrenamiento. La fila de CategoricalHarmfulQA corresponde al 20 % retenido de ese conjunto. Una criba por palabras clave sobre las mismas respuestas arroja 7,1 % y 0,4 % para Arbitrated en el conjunto dañino agrupado, frente al criterio del juez que reporta la tabla.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 24 GB solo para pesos, más memoria para caché KV y activaciones; el repositorio ocupa 24,0 GB. Con cuantización a 8 bits cabría en torno a 12-14 GB y a 4 bits en torno a 7-8 GB, aunque el autor no publica pesos cuantizados.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o dos RTX 4090 de 24 GB en paralelo; una sola RTX 4090 de 24 GB queda al límite por el tamaño de pesos.
- Cabe en GPU de consumo (RTX 4090, RTX 3090) únicamente con cuantización, no en bf16 completo.
- Opciones de despliegue: transformers (librería declarada) y vLLM (usado por el autor en su evaluación). Soporte de llama.cpp, Ollama o TGI no disponible en la informacion proporcionada.
- Latencia y throughput: no disponibles. La evaluación se ejecutó con temperatura 1.0 y top_p 0.95 en una única máquina con una build concreta de vLLM, sin publicar cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Comportamiento ante rechazos | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-4-12B-Arbitrated (Abacus.AI) | 11,95 B | 262.144 | Apache 2.0 | 12,9 % (off) / 4,1 % (on) en HarmBench + JailbreakBench | Hugging Face, safetensors |
| google/gemma-4-12B-it (base) | 11,95 B | 262.144 | Apache 2.0 | 95,9 % (off) / 90,9 % (on) en el mismo conjunto | Hugging Face |
| Copia *abliterated* del mismo modelo (profesor, no distribuida) | 11,95 B | 262.144 | No disponible | Escribe respuestas conformes usadas como preferencias | No distribuida |
| Otras alternativas de 12 B con eliminación de rechazos | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa más fiable es contra el modelo base, ya que el autor midió ambos en la misma máquina, con la misma build de vLLM y los mismos parámetros de muestreo. No se dispone de datos frente a otros ajustes de la misma categoría.

## Limitaciones y advertencias

- Pérdida medible de razonamiento: 6 puntos en MMLU-Pro y 7,5 en MMMU-Pro con *thinking* desactivado, y 4,4 puntos en GPQA Diamond con *thinking* activado, según la evaluación del autor.
- Residual de rechazo en XSTest unsafe del 33,5 % con *thinking* desactivado, el único conjunto dañino donde persiste una tasa apreciable.
- Riesgo elevado de alucinación y de respuestas inseguras: el objetivo explícito del ajuste es responder a prompts dañinos, por lo que no debe desplegarse en aplicaciones orientadas al público sin una capa de moderación externa.
- Dataset de entrenamiento no divulgado y profesor no distribuido, lo que limita la reproducibilidad y la auditoría del comportamiento aprendido.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base y no está evaluado.
- Licencia Apache 2.0 declarada, pero la model card enlaza la licencia de Gemma 4 de Google; conviene verificar los términos aplicables antes de uso comercial, ya que pueden imponer restricciones adicionales.
- Sin datos publicados de cuantización, latencia ni throughput; el despliegue en producción requiere validación propia.
- Evaluación realizada íntegramente por el autor con un juez LLM (gpt-oss-120b); no hay verificación independiente de las cifras.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta, sin adopción comunitaria documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abacusai/Gemma-4-12B-Arbitrated
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de Abacus.AI: https://abacus.ai
- Organización en Hugging Face: https://huggingface.co/abacusai
- Paper referenciado (arXiv:2402.13228): https://arxiv.org/abs/2402.13228
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
