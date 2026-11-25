# ryzrAI/Pupil_4B

## Resumen

Pupil 4B es un modelo de lenguaje conversacional publicado por ryzrAI bajo la familia "Virtual Eyes", distribuido en Hugging Face exclusivamente en formato GGUF cuantizado Q4_K_M para su uso con llama.cpp. El repositorio, de 2,8 GB, contiene los pesos cuantizados de un modelo con 4.326.350.848 parámetros totales (aproximadamente 4,3 mil millones), lo que lo sitúa en la gama de modelos compactos aptos para hardware de consumo. La model card lo presenta como un asistente conversacional orientado a despliegues locales mediante `llama-server` o Ollama.

El dato técnico más llamativo es la longitud de contexto declarada en el fichero GGUF: 262.144 tokens. No obstante, el propio autor advierte que su perfil de servicio (AI-XS) emplea 32.768 tokens y que la calidad en contextos largos más allá de esa cifra no ha sido validada. Se trata, por tanto, de una capacidad nominal del fichero que no debe asumirse como rendimiento efectivo sin evaluación adicional.

La información pública disponible es muy limitada: no se especifican licencia, idiomas soportados, composición del dataset de entrenamiento ni resultados de benchmarks. El modelo se publica con fecha de creación en noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones, lo que implica que no existe validación independiente de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer conversacional, segun el formato de pesos y el pipeline de chat) |
| Parametros totales | 4.326.350.848 (~4,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens en el GGUF; 32.768 tokens en el perfil de servicio validado |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); KV cache q8_0 recomendada |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (`Pupil-4B-Q4_K_M.gguf`) |
| Tamano del repositorio | 2,8 GB |
| Runtime recomendado | llama.cpp (`llama-server`), compatible con Ollama y endpoints compatibles con la API de OpenAI |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de lo que se deduce del artefacto publicado: un modelo de lenguaje conversacional con pesos en formato GGUF y plantilla de chat compatible con el motor Jinja de llama.cpp. El autor no documenta si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni el número de capas, dimensiones de atención o tipo de positional encoding empleado.

Tampoco se detallan los datos de entrenamiento: no hay información sobre el volumen de tokens, la composición del corpus, la posible aplicación de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. Lo único documentado en la model card son los parámetros de inferencia recomendados (repetición penalizada a 1,2, temperatura 0,8, top_k 40, top_p 0,95, min_p 0,05) y el uso de Flash Attention con cuantización de la caché KV a q8_0.

## Capacidades

- Generación de texto conversacional multi-turno mediante la API de chat completions (`POST /v1/chat/completions`).
- Soporte de plantilla de chat Jinja (`--jinja`), lo que permite integrar roles de sistema, usuario y asistente.
- Compatibilidad con endpoints compatibles con la API de OpenAI a través de `llama-server`.
- Presupuesto de salida compartido entre razonamiento y respuesta final según el parámetro `max_tokens` (ejemplo de 1024 en la documentación).
- Capacidad nominal de contexto largo de hasta 262.144 tokens en el fichero GGUF, aunque no validada más allá de 32.768 tokens.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con `llama-server` en una estación de trabajo y servir peticiones de chat compatibles con la API de OpenAI, lo que permite sustituir APIs en la nube por inferencia local con los 4,3 B de parámetros en Q4_K_M.
- Prototipado rápido de aplicaciones de chat: al ejecutarse con Ollama (`num_ctx` 32.768, `repeat_penalty` 1,2), permite iterar sobre prompts y plantillas sin coste de API y con privacidad total del contenido.
- Procesamiento de documentos de longitud media: con 32.768 tokens de contexto validado es posible resumir o extraer información de contratos, informes o hilos de correo de decenas de páginas en una sola pasada.
- Despliegue en hardware de consumo: con 2,8 GB de pesos cuantizados cabe en GPUs de gama media y en equipos con 8 GB de VRAM o incluso en CPU, lo que lo hace adecuado para demos y entornos con recursos limitados.
- Experimentación con contextos largos: el GGUF declara 262.144 tokens, lo que permite probar escenarios de recuperación en contextos extensos, siempre asumiendo que la calidad más allá de 32.768 tokens no está validada y que el consumo de memoria crece con la caché KV.
- Generación de texto en pipelines internos: mediante la API HTTP de `llama-server` puede integrarse en flujos de trabajo de automatización documental, clasificación o redacción asistida sin dependencia de servicios externos.
- Evaluación comparativa de modelos pequeños: sirve como baseline de 4 B en pruebas internas de calidad conversacional frente a otros modelos de tamaño similar, aunque carece de benchmarks publicados que permitan una comparación objetiva previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q4_K_M ocupan aproximadamente 2,8 GB; con caché KV cuantizada a q8_0 y contexto de 32.768 tokens, el consumo total depende de la arquitectura (no documentada) y puede situarse en el rango de 4-8 GB.
- GPU recomendadas: no hay recomendaciones oficiales del autor. Por tamaño, cualquier GPU con al menos 8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) debería poder cargar el modelo con `--gpu-layers 999`; GPUs de datacenter como A100 o H100 no son necesarias para un modelo de 4,3 B.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más de VRAM; también puede ejecutarse parcial o totalmente en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server` con Flash Attention y KV cache q8_0, build CUDA `llama.cpp-upstream-20261114` según el autor), Ollama (lee el fichero `params` del repositorio) y cualquier cliente compatible con la API de OpenAI apuntando a `llama-server`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de arquitectura de Pupil 4B que permitan una comparación rigurosa con alternativas. La siguiente tabla recoge únicamente los datos verificables del modelo frente a la categoría general de modelos compactos, sin afirmar rendimiento superior o inferior.

| Modelo | Parametros | Contexto | Licencia | Formato publicado | Benchmarks publicos |
|---|---|---|---|---|---|
| Pupil 4B (ryzrAI) | ~4,3 B | 262.144 nominales / 32.768 validados | no disponible | GGUF Q4_K_M | no disponibles |
| Alternativas de ~4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No es posible establecer una comparativa con modelos concretos (por ejemplo, de la familia Llama, Qwen o Gemma) sin datos de arquitectura, licencia y evaluación que el autor no ha publicado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni de calidad conversacional, por lo que no puede evaluarse su rendimiento frente a alternativas.
- Licencia no especificada: no se indica si el uso comercial está permitido, lo que constituye un riesgo legal para cualquier despliegue en producción.
- Idiomas no documentados: se desconoce si el modelo está entrenado en castellano o en otros idiomas, y con qué calidad.
- Contexto largo no validado: los 262.144 tokens del GGUF no han sido evaluados por el autor más allá de 32.768 tokens; el rendimiento en contextos extensos puede degradarse y el consumo de memoria crece proporcionalmente.
- Riesgo de repetición: el autor recomienda `repeat_penalty` 1,2 y documenta que en una prueba con temperatura 0 esta penalización redujo la repetición, lo que sugiere que el modelo puede entrar en bucles sin ajuste.
- Riesgo de alucinación: no cuantificado ni evaluado; en modelos de 4 B sin benchmarks publicados debe asumirse un riesgo elevado en tareas factuales.
- Sesgos: no documentados; al desconocerse el corpus de entrenamiento no puede evaluarse la presencia de sesgos de género, idioma o dominio.
- Sin tracción comunitaria: cero descargas y cero likes en el momento de la ficha, sin validación independiente ni informes de terceros.
- Repositorio únicamente en GGUF cuantizado: no se publican pesos en safetensors ni versiones sin cuantizar, lo que limita el fine-tuning y la inspección de los pesos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryzrAI/Pupil_4B
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentación de Ollama: https://ollama.com
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
