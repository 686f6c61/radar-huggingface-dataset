# nova-shadowtail/Qwen3Guard-0.6B-Q4_1-NPU2

## Resumen

Qwen3Guard-0.6B-Q4_1-NPU2 es una cuantizacion del modelo de moderacion Qwen3Guard-Gen-0.6B, publicada por el usuario nova-shadowtail (Dr.Nova_Shadowtail). No se trata de un modelo nuevo entrenado desde cero, sino de una conversion del modelo base de Qwen (familia Qwen3Guard) a un formato que permite ejecutarlo sobre las NPU de AMD en equipos Ryzen mediante el runtime FastFlowLM, sobre Fedora 44. El repositorio incluye el fichero `model.q4nx` junto con `config.json`, `tokenizer.json` y `tokenizer_config.json`, ademas del GGUF del que se convirtio.

El modelo original, Qwen3Guard-Gen-0.6B, forma parte de la serie Qwen3Guard de Qwen: un conjunto de modelos de seguridad y moderacion construidos sobre la arquitectura Qwen3 y entrenados con un corpus de 1,19 millones de prompts y respuestas etiquetados por nivel de seguridad. La serie cubre tres tamanos (0.6B, 4B y 8B) y dos variantes: Qwen3Guard-Gen, que formula la clasificacion de seguridad como una tarea de instrucciones generativa, y Qwen3Guard-Stream, que incorpora una cabeza de clasificacion a nivel de token para monitorizacion en tiempo real durante la generacion.

Su relevancia actual esta en el nicho del despliegue en local sobre hardware de consumo con aceleracion NPU: al tratarse de un modelo de menos de mil millones de parametros cuantizado a Q4_1, permite ejecutar moderacion de contenido en un portatil o mini-PC con Ryzen sin depender de GPU dedicada ni de servicios en la nube. El repositorio acumula 0 descargas y 1 "like" en el momento de la consulta, por lo que es un artefacto de nicho y de muy baja difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3 (variante generativa Qwen3Guard-Gen) |
| Parametros totales | 751.632.384 (aproximadamente 0,75 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_1 en formato `model.q4nx` para NPU; se incluye tambien el GGUF de origen |
| Idiomas soportados | el modelo original declara 119 idiomas y dialectos; el repositorio de la cuantizacion declara unicamente `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base), GGUF y `model.q4nx` (este repositorio) |

## Arquitectura y entrenamiento

El modelo base Qwen3Guard-Gen-0.6B es un transformer decoder-only de la familia Qwen3, especializado en moderacion de contenido. La variante "Gen" reformula la clasificacion de seguridad como una tarea de seguimiento de instrucciones: el modelo no devuelve una probabilidad, sino una salida textual estructurada con campos como `Safety: Safe|Unsafe|Controversial`, la lista de categorias de riesgo detectadas y, en la moderacion de respuestas, un campo `Refusal: Yes|No`. El entrenamiento se realizo sobre un conjunto de 1,19 millones de prompts y respuestas etiquetados por seguridad. La informacion disponible no detalla el numero de tokens, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion del repositorio que nos ocupa no esta en el entrenamiento, sino en el empaquetado de inferencia: la cuantizacion Q4_1 en formato `q4nx` esta pensada para ejecutarse a traves de FastFlowLM sobre NPU de AMD, un objetivo distinto del habitual (GPU NVIDIA o CPU con llama.cpp). Las categorias de riesgo que maneja el modelo original son: Violent, Non-violent Illegal Acts, Sexual Content or Sexual Acts, PII, Suicide & Self-Harm, Unethical Acts, Politically Sensitive Topics, Copyright Violation, Jailbreak y None.

## Capacidades

- Moderacion de prompts de usuario: clasifica la entrada en tres niveles de severidad (Safe, Unsafe, Controversial).
- Moderacion de respuestas de modelo: evalua la salida generada por otro LLM e indica ademas si ha habido refusal.
- Clasificacion por categoria de dano: devuelve una o varias etiquetas entre las diez categorias definidas (violencia, actos ilegales no violentos, contenido sexual, PII, autolesion y suicidio, actos poco eticos, temas politicamente sensibles, violacion de copyright, jailbreak y None).
- Capacidad multilingue: el modelo original declara soporte para 119 idiomas y dialectos, aunque el repositorio de la cuantizacion solo etiqueta `en`.
- Generacion de texto: heredada de la base Qwen3, ya que la clasificacion se resuelve como generacion de texto estructurado.
- No hay informacion disponible sobre soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito para esta cuantizacion concreta.

## Casos de uso

- Moderacion de entrada en aplicaciones de chat: antes de enviar el prompt a un LLM principal, se ejecuta Qwen3Guard sobre la NPU local para descartar o marcar peticiones peligrosas, con coste practicamente nulo al ser un modelo de 0,75B cuantizado.
- Filtrado de salidas de otro modelo generativo: se usa como segunda pasada sobre la respuesta del LLM titular para detectar contenido unsafe o etiquetas como PII o Copyright Violation antes de mostrarlo al usuario.
- Moderacion en despliegues de borde o sin conectividad: al ejecutarse en NPU de AMD sobre Fedora, encaja en escenarios industriales, sanitarios o de defensa donde el contenido no puede salir del equipo.
- Preprocesado de datasets: clasificacion masiva de prompts y respuestas para construir corpus de entrenamiento o evaluacion filtrados por nivel de seguridad y categoria.
- Cumplimiento normativo y auditoria interna: generar trazas etiquetadas (Safe/Unsafe/Controversial mas categoria) para documentar controles de contenido exigidos por politicas internas o regulacion de plataformas.
- Prototipado de guardarrailes en pipelines de CI/CD: validar de forma automatica, en cada despliegue, que un conjunto de prompts de regresion no ha dejado de clasificarse correctamente tras cambios en el sistema.
- Investigacion en seguridad de LLM: banco de pruebas economico para estudiar jailbreaks y su deteccion, gracias a la categoria especifica de Jailbreak y a la distincion entre Unsafe y Controversial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo original afirma que Qwen3Guard-Gen alcanza rendimiento de vanguardia en diversos benchmarks de seguridad, tanto en clasificacion de prompts como de respuestas, en ingles, chino y tareas multilingues, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K ni metricas de moderacion) en el material consultado. El autor de la cuantizacion tampoco publica mediciones propias de latencia o throughput sobre NPU.

## Requisitos de hardware

- VRAM/RAM estimada: con 751.632.384 parametros en Q4_1 (aproximadamente 4,5 bits por peso), el peso del modelo ronda los 0,4-0,5 GB; el repositorio completo ocupa 1,2 GB porque incluye tambien el GGUF de origen.
- Hardware de destino: NPU integrada en procesadores AMD Ryzen, ejecutada mediante FastFlowLM (FLM) sobre Fedora 44. Es el escenario para el que se construyo esta cuantizacion.
- GPU dedicada: no es necesaria. Al ser un modelo sub-1B cuantizado, cabe con holgura en cualquier GPU de consumo moderna (por ejemplo, RTX 3060/4060 en adelante) e incluso en CPU.
- Despliegue: el flujo indicado por el autor usa `pip install flm-add`, variables de entorno `FLM_CONFIG_PATH` y `FLM_XCLBIN_PATH`, y los comandos `flm-add`, `flm run` y `flm serve --port 8080` para exponerlo como servidor de API. El GGUF incluido permite alternativas como llama.cpp u Ollama, aunque el formato `q4nx` esta orientado a NPU.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo en ninguna de las configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Variante | Contexto | Idiomas | Licencia | Formato / destino |
|---|---|---|---|---|---|---|
| nova-shadowtail/Qwen3Guard-0.6B-Q4_1-NPU2 | 751.632.384 | Gen | no disponible | declarado `en` (base: 119) | Apache 2.0 | q4nx + GGUF, NPU AMD |
| Qwen/Qwen3Guard-Gen-0.6B | ~0,6B | Gen | no disponible | 119 idiomas y dialectos | Apache 2.0 | safetensors, GPU/CPU |
| Qwen3Guard-Gen-4B | ~4B | Gen | no disponible | 119 idiomas y dialectos | Apache 2.0 (segun la serie) | safetensors |
| Qwen3Guard-Gen-8B | ~8B | Gen | no disponible | 119 idiomas y dialectos | Apache 2.0 (segun la serie) | safetensors |
| Qwen3Guard-Stream | 0.6B / 4B / 8B | Stream (cabeza de clasificacion por token) | no disponible | 119 idiomas y dialectos | Apache 2.0 (segun la serie) | safetensors |

Los datos de benchmarks de las alternativas no estan disponibles en la informacion consultada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento entre ellas.

## Limitaciones y advertencias

- Artefacto de terceros: la cuantizacion la publica el usuario nova-shadowtail, no Qwen. No hay garantia de equivalencia funcional exacta con el modelo base mas alla de lo que declara el autor.
- Idiomas declarados de forma contradictoria: la model card original indica 119 idiomas y dialectos, pero el repositorio de la cuantizacion solo etiqueta `en`. El rendimiento real en idiomas distintos del ingles no esta verificado para esta conversion.
- Repositorio practicamente sin uso: 0 descargas y 1 "like" en el momento de la consulta, sin issues ni validaciones externas documentadas.
- Riesgo de alucinacion en la clasificacion: al ser un modelo generativo que produce texto estructurado, puede devolver etiquetas mal formadas o ausentes, por lo que el parseo con expresiones regulares (como el ejemplo de la model card) debe contemplar fallos y valores nulos.
- Falsos negativos en contenido limite: la propia distincion entre Unsafe y Controversial implica que parte del contenido danino puede quedar en la categoria intermedia y requerir una politica de actuacion propia.
- Sesgos: no hay informacion disponible sobre evaluaciones de sesgo o equidad del modelo base ni de esta cuantizacion.
- Dependencia del ecosistema FLM y de hardware AMD Ryzen con NPU: fuera de ese entorno, el valor del formato `q4nx` es limitado y habria que recurrir al GGUF incluido.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base Qwen3Guard-Gen-0.6B y la atribucion del informe tecnico citado.
- No usar como unico mecanismo de seguridad en produccion: se recomienda combinarlo con reglas deterministas y revision humana en dominios sensibles.

## Enlaces

- Repositorio de la cuantizacion en HuggingFace: https://huggingface.co/nova-shadowtail/Qwen3Guard-0.6B-Q4_1-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3Guard-Gen-0.6B/blob/main/LICENSE
- Articulo tecnico citado: arXiv:2510.14276 (Zhao, Haiquan et al., "Qwen3Guard Technical Report", 2025) — https://arxiv.org/abs/2510.14276
- Blog de Qwen sobre Qwen3Guard: https://qwen.ai/blog?id=f0bbad0677edf58ba93d80a1e12ce458f7a80548&from=research.research-list
- Repositorio GitHub de Qwen3Guard: https://github.com/QwenLM/Qwen3Guard
- Informe tecnico de Qwen3: https://github.com/QwenLM/Qwen3/blob/main/Qwen3_Technical_Report.pdf
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces obtenidos corresponden a sitios homonimos sin relacion (Nova de servicios a la persona en Francia y Radio Nova).
