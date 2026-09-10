# Kanha-AI/kanha-minicpm5-2b-grounded-matched-2ep-20260910

## Resumen

Kanha-AI/kanha-minicpm5-2b-grounded-matched-2ep-20260910 es un ajuste fino mediante QLoRA del modelo openbmb/MiniCPM5-2B (revisión `cd199ce3ee67549c42ef7372f809f2c63599a3e9`), fusionado a bfloat16 y publicado en formato safetensors para `transformers`. El checkpoint forma parte de un experimento interno de Kanha.ai cuyo objetivo declarado es comparar métodos de entrenamiento sobre un mismo conjunto de datos derivado de su propio sitio web, y evaluar de forma controlada la respuesta a preguntas sobre documentación web ("grounded question answering"). El modelo tiene 2.516.756.480 parámetros reales según los pesos publicados, y se entrenó con una longitud máxima de secuencia de 4096 tokens.

El rasgo definitorio del modelo es su contrato de inferencia: solo debe responder a partir de un contexto recuperado que se le inyecta en el prompt, con un system prompt fijo y una cadena de rechazo literal ("I can't answer that from the provided context."). El chat template nativo se usa con el modo de razonamiento desactivado (`enable_thinking=False`). No se publica ningún artefacto MLC validado ni pesos en GGUF, y el repositorio no declara licencia.

La relevancia de esta publicación es limitada y de carácter más metodológico que práctico: el entrenamiento usó solo 210 registros (45 de validación y 0 de holdout), y la propia evaluación del autor muestra una tasa de cumplimiento del comportamiento "grounded" del 3,85 % (1 de 26 casos), por debajo del umbral que el propio autor marca como superado. Es, por tanto, un artefacto de investigación reproducible y no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle; los tags de HuggingFace declaran `llama` y `qwen3`, y la model card describe el trabajo como "Kanha Qwen3 experiment" (discrepancia no resuelta en la informacion disponible) |
| Parametros totales | 2.516.756.480 (~2,52 mil millones), segun los safetensors publicados |
| Parametros activos | No aplica segun la informacion disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 4096 tokens de longitud maxima de secuencia durante el entrenamiento; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No se publican cuantizaciones; los pesos se distribuyen en bfloat16 fusionado |
| Idiomas soportados | en (ingles) |
| Licencia | No disponible (la model card no la declara) |
| Formato de pesos | safetensors (biblioteca `transformers`), dtype final bfloat16 |
| Modelo base | openbmb/MiniCPM5-2B (revision `cd199ce3ee67549c42ef7372f809f2c63599a3e9`) |
| Metodo de entrenamiento | QLoRA (rango 16, alpha 16, dropout 0,05) sobre q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Tamano del repositorio | 5,0 GB |
| Pipeline declarado | text-generation; compatible con text-generation-inference y endpoints |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base (tipo de atencion, uso de MoE, SSM o hibridos, ni innovaciones de decodificacion). Lo que si esta documentado es el procedimiento de ajuste: QLoRA con rango 16, alpha 16 y dropout 0,05 aplicado a las proyecciones de atencion y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), con perdida calculada unicamente sobre los turnos del asistente (`assistant-only loss: true`). Los hiperparametros son 2,0 epocas, learning rate 1e-4, batch size por dispositivo 8, 2 pasos de acumulacion de gradiente, warmup ratio 0,05, semilla 42 y longitud maxima de secuencia 4096. El resultado se fusiono a bfloat16.

El conjunto de datos es pequeno y de procedencia propia: 210 registros de entrenamiento, 45 de validacion y 0 de holdout, con hashes SHA-256 publicados para el dataset y cada split. El unico dato de composicion es que deriva del sitio web de Kanha, sin que se indique numero de tokens totales, mezcla de dominios ni si hubo fases de RLHF o DPO (no hay evidencia de ello). La innovacion tecnica declarada no es arquitectonica sino de contrato de inferencia: se fija un system prompt exacto, una plantilla de usuario exacta con bloques `Context:` y `Question:`, y una cadena de rechazo literal, y se publica el hash de identidad del contrato de prompt (`d0dcb1de...`). No hay decodificacion especulativa, atencion lineal ni mecanismos similares documentados.

## Capacidades

- Generacion de texto condicionada a contexto recuperado: responde preguntas usando exclusivamente el contexto inyectado en el prompt.
- Comportamiento de rechazo: devuelve exactamente "I can't answer that from the provided context." cuando la respuesta no esta en el contexto (tasa de rechazo medida: 0,115).
- Extraccion fiel de datos concretos: recall de fechas 1,0, recall de numeros 0,987, recall de URLs 1,0 y tasa de valores no soportados 0,0 en la evaluacion del autor.
- Recuperacion de listas: recall de 0,680, el punto mas debil entre las capacidades de extraccion medidas.
- Conversacion multi-turno: el pipeline declarado es text-generation con plantilla de chat nativa, aunque la evaluacion publicada no mide dialogos multi-turno.
- Modo de razonamiento desactivado: la inferencia se especifica con `enable_thinking=False`.
- Idiomas: unicamente ingles.
- Tool calling / function calling: no disponible, no se declara soporte.
- Capacidades de agente o razonamiento multi-paso: no disponible, no se declara soporte.
- Vision, audio o multimodalidad: no disponible, no se declara soporte (el pipeline es text-generation).

## Casos de uso

- Preguntas y respuestas sobre documentacion web propia: el modelo se usa pasando el contexto recuperado del sitio en el bloque `Context:` y formulando la pregunta en `Question:`; su contrato de rechazo evita respuestas fuera de contexto, lo que encaja en asistentes de soporte sobre documentacion corporativa.
- Investigacion comparativa de metodos de entrenamiento: el checkpoint esta pensado explicitamente para comparar tecnicas sobre un mismo dataset derivado del sitio de Kanha; sirve como referencia reproducible (semilla, hiperparametros y hashes publicados) frente a otros ajustes del mismo base.
- Evaluacion controlada de comportamiento "grounded": util como sujeto de pruebas en arneses que midan rechazo, fidelidad al contexto y alucinacion, dado que publica metricas de referencia (pass rate 0,038, unsupported value rate 0,0).
- Extraccion de entidades estructuradas en documentos internos: con recall de 1,0 en fechas y URLs y 0,987 en numeros sobre contexto oraculo, es adecuado para prototipos de extraccion de metadatos de paginas web o contratos, siempre con revision humana.
- Prototipado de pipelines RAG en local: al ser un modelo de 2,52 mil millones de parametros en bfloat16 (5 GB de pesos), se puede desplegar en una unica GPU de consumo para validar la fase de generacion de un RAG, teniendo en cuenta que la recuperacion no fue evaluada por el autor.
- Generacion de conjuntos de evaluacion y datos sinteticos de QA documental: puede emplearse para producir pares contexto-pregunta-respuesta sobre corpus web, utiles para entrenar o evaluar modelos mayores.
- Filtrado de respuestas no soportadas en sistemas de atencion: el rechazo explicito y su tasa medida permiten usarlo como capa de abstención en flujos donde una respuesta inventada es mas costosa que no responder.
- Docencia y experimentacion con QLoRA: el repositorio incluye artefactos de procedencia (`run-manifest.json`, `training-config.yaml`, `metrics.json`) que lo hacen util como ejemplo completo de un ciclo de ajuste y publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor publica exclusivamente la evaluacion interna del contrato "grounded", con contexto oraculo (la calidad del retrieval no fue evaluada), sobre 26 casos:

| Metrica | Valor |
|---|---|
| dates_recall | 1,0 |
| urls_recall | 1,0 |
| numbers_recall | 0,9871794871794872 |
| unsupported_value_rate | 0,0 |
| list_recall | 0,6801282051282052 |
| deterministic_pass_rate | 0,5 |
| refusal_rate | 0,11538461538461539 |
| grounded_answerable_case_count | 24 |
| grounded_behavior_case_count | 26 |
| grounded_behavior_pass_count | 1 |
| grounded_behavior_pass_rate | 0,038461538461538464 |
| grounded_behavior_gate_passed | false |
| grounded_reviewed_case_count | 0 |
| grounded_reviewed_case_rate | 0,0 |
| grounded_semantic_review_gate_passed | false |
| grounded_source_supported_count | 0 |
| requires_review_rate | 0,0 |
| total | 26 |

El propio autor advierte que la puntuacion determinista y el benchmark en servidor con Transformers no equivalen a una cualificacion en navegador, y que debe validarse el modelo convertido exacto en el navegador y dispositivo objetivo. No hay comparacion publicada contra otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16/fp16, aproximadamente 5,0 GB solo de pesos (el repositorio ocupa 5,0 GB) mas cache KV; en int8, en torno a 2,5-3 GB; en cuantizacion de 4 bits, en torno a 1,5-2 GB (estimaciones a partir del numero de parametros; los pesos cuantizados no estan publicados).
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bfloat16 con contexto moderado; A100, H100 o L40S para lotes grandes y contexto de 4096 tokens.
- Cabe en GPU de consumo: si. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB pueden ejecutarlo en bfloat16; una GPU de 8 GB exige cuantizacion o secuencias cortas.
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (los tags incluyen `text-generation-inference` y `endpoints_compatible`), vLLM mediante los pesos safetensors. Para llama.cpp u Ollama seria necesario convertir a GGUF, ya que no se publica ningun artefacto GGUF.
- MLC: el autor indica explicitamente que no se incluye ningun artefacto MLC validado.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

Los modelos alternativos se incluyen por rango de tamano, pero conviene subrayar que este checkpoint no publica benchmarks estandar, de modo que la comparacion de rendimiento no es posible con la informacion disponible. Los datos de la columna "este modelo" proceden de la model card; el resto se toma de la documentacion publica de cada desarrollador y no ha sido verificado en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos |
|---|---|---|---|---|
| kanha-minicpm5-2b-grounded-matched-2ep-20260910 | 2,52 mil millones | 4096 tokens de entrenamiento; nativo no disponible | No disponible | safetensors (bf16) |
| openbmb/MiniCPM5-2B (modelo base) | no disponible | no disponible | no disponible | no disponible |
| Qwen2.5-1.5B-Instruct | 1,54 mil millones (segun documentacion del desarrollador) | 32 768 tokens | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-3B-Instruct | 3,21 mil millones (segun documentacion del desarrollador) | 128 000 tokens | Llama 3.2 Community License | safetensors, GGUF |
| Gemma-2-2B-it | 2,61 mil millones (segun documentacion del desarrollador) | 8192 tokens | Gemma Terms of Use | safetensors, GGUF |

Diferencias relevantes: los tres modelos alternativos declaran licencia explicita, publican cuantizaciones GGUF y estan disponibles en varios tamanos; este checkpoint no declara licencia, no publica GGUF ni artefactos MLC, y su evaluacion es interna y de alcance muy reducido. Frente al modelo base, la unica diferencia documentada es el ajuste QLoRA de 2 epocas sobre 210 registros.

## Limitaciones y advertencias

- Comportamiento "grounded" no superado: la puerta de calidad del propio autor falla (`grounded_behavior_gate_passed: false`) con 1 caso superado de 26 (3,85 %) y `deterministic_pass_rate` de 0,5. Es previsible que el modelo responda sin apoyarse en el contexto en la mitad de los casos.
- Sin holdout: el split de holdout tiene 0 registros, por lo que no existe una evaluacion independiente; las metricas publicadas proceden de validacion y de un conjunto de casos muy pequeno (26).
- Contexto oraculo: la evaluacion asume contexto perfecto; la calidad de recuperacion (retrieval) no fue evaluada, de modo que el rendimiento en un pipeline RAG real sera inferior al reportado.
- Dataset minimo: 210 registros de entrenamiento implican riesgo alto de sobreajuste y de memorizacion del contenido. El autor reconoce explicitamente que el checkpoint puede memorizar contenido de entrenamiento.
- Contrato de uso estricto: fuera del formato exacto de prompt (system prompt, plantilla de usuario con `Context:` y `Question:`, `enable_thinking=False`) el modelo queda fuera de su contrato entrenado y evaluado. Una pregunta sin contexto recuperado no es un uso valido.
- Idioma: solo ingles; no hay soporte declarado para castellano ni otros idiomas, lo que incluye el riesgo de degradacion o cambio de idioma en las respuestas.
- Licencia no disponible: no se declara licencia del checkpoint ni del modelo base en la informacion proporcionada. Es imprescindible verificar las condiciones del modelo base (openbmb/MiniCPM5-2B) antes de cualquier uso comercial.
- Sin artefacto MLC validado y sin cualificacion en navegador: el autor advierte que la puntuacion determinista y el benchmark en servidor no equivalen a una validacion en el navegador o dispositivo objetivo.
- Ambiguedad de arquitectura: los tags de HuggingFace mezclan `llama` y `qwen3`, y la model card habla de "Kanha Qwen3 experiment" sobre un modelo base MiniCPM; conviene inspeccionar `config.json` antes de asumir compatibilidad con segun que runtimes.
- Riesgo de respuestas incompletas, incorrectas o desactualizadas: el autor lo indica de forma explicita y recomienda revisar las salidas, probar casos de fallo representativos y cualificar el runtime exacto antes de cualquier uso orientado a usuario final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kanha-AI/kanha-minicpm5-2b-grounded-matched-2ep-20260910
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Sitio del autor: https://kanha.ai
- Artefactos de procedencia citados en la model card (dentro del repositorio): `research/run-manifest.json`, `research/training-config.yaml`, `research/publication-inventory.json`, `research/evaluation/metrics.json`, `research/evaluation/evaluation-manifest.json`
- Resultados de busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenido no tecnico y de caracter promocional), por lo que no se aporta ningun enlace adicional relevante. No se han encontrado papers, blogs, repositorios ni demos asociados a esta publicacion.
