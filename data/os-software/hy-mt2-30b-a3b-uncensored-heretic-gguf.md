# OS-Software/Hy-MT2-30B-A3B-uncensored-heretic-GGUF

## Resumen

Hy-MT2-30B-A3B-uncensored-heretic-GGUF es una version modificada del modelo de traduccion multilingue Hy-MT2-30B-A3B desarrollado por Tencent Hunyuan. El autor, OS-Software, ha aplicado una tecnica de "abliteration" (desabliteracion) mediante la herramienta Heretic v1.4.0+custom, que elimina parcialmente el alineamiento de seguridad del modelo original. El resultado es un modelo de traduccion que conserva las capacidades linguisticas del original pero con una reduccion sustancial de los mecanismos de rechazo ante contenido sensible.

El modelo base pertenece a la familia Hy-MT2, una serie de modelos de traduccion "fast-thinking" disenados para escenarios reales complejos, con soporte para 33 idiomas y 5 pares de traduccion de dialectos y lenguas minoritarias chinas. La variante 30B-A3B utiliza una arquitectura MoE (Mixture of Experts) con 30 mil millones de parametros totales y 3 mil millones activos por token. Este repositorio concreto contiene los pesos en formato GGUF, lo que permite su ejecucion en hardware de consumo mediante llama.cpp o similares.

La relevancia de este modelo reside en su doble naturaleza: por un lado, demuestra la viabilidad tecnica de modificar modelos de traduccion mediante tecnicas de ablacion de capas; por otro, plantea riesgos significativos al eliminar los mecanismos de seguridad del modelo original. El propio autor advierte explicitamente que el modelo es mas propenso a generar contenido danino, inexacto o sesgado, y lo destina exclusivamente a investigacion y experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), transformer |
| Parametros totales | 30.064.725.888 (30B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (no se especifican los niveles incluidos) |
| Idiomas soportados | zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug (33 idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (tamano del repo: 96.3 GB) |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-30B-A3B es un modelo de traduccion multilingue con arquitectura MoE, donde de los 30.000 millones de parametros totales solo se activan 3.000 millones por token. Esta arquitectura permite un equilibrio entre capacidad y eficiencia computacional, ya que cada token procesado solo recorre una fraccion de los parametros totales.

Sobre esta base, OS-Software aplico la tecnica Heretic v1.4.0+custom con el metodo Arbitrary-Rank Ablation (ARA), que utiliza un adaptador LoRA y preservacion de norma por filas. Los parametros de ablacion se detallan en la model card: la ablacion se aplica desde la capa 18 hasta la capa 28, con un peso de preservacion de buen comportamiento de 1.0000, un peso de direccion de mal comportamiento de 0.1441, y un peso relativo de sobrecorreccion de 2.2030. Se utilizo el optimizador ot_ridge con regularizacion ridge de 0.0003. Este proceso reduce la probabilidad de que el modelo rechace solicitudes consideradas problematicas por su alineamiento original.

Segun la evaluacion del autor, la metrica "Keywords" (que mide la presencia de palabras clave de rechazo) paso de 100/100 en el modelo original a 0/100 en esta version, mientras que la divergencia KL entre ambos es de 0.0276, lo que indica que el comportamiento general se mantiene cercano al original excepto en los mecanismos de rechazo.

## Capacidades

- Traduccion multilingue entre 33 idiomas, incluyendo lenguas europeas, asiaticas, medio-orientales y lenguas minoritarias chinas (bo, kk, mn, ug).
- Seguimiento de instrucciones de traduccion en multiples idiomas, segun la descripcion de la familia Hy-MT2.
- Capacidad de traduccion "fast-thinking" para escenarios complejos del mundo real, como traduccion de negocios, textos especializados o contenido con matices culturales.
- Soporte para traduccion de pares de lenguas minoritarias y dialectos chinos (5 pares adicionales mencionados en la documentacion del modelo base).
- No se especifican capacidades de tool calling, agentes, vision ni audio en la informacion disponible.
- Al ser una version "uncensored", el modelo no aplica los filtros de contenido del modelo original, lo que permite generar traducciones de contenido explicito o sensible que el modelo base rechazaria.

## Casos de uso

- Investigacion en seguridad y alineamiento: el caso de uso principal declarado por el autor. Permite estudiar como responde un modelo de traduccion sin mecanismos de rechazo ante solicitudes de contenido sensible, y comparar su comportamiento con el modelo original.
- Red-teaming de sistemas de traduccion: evaluar vulnerabilidades en pipelines de traduccion automatizada y disenar contramedidas.
- Estudio de tecnicas de ablacion: analizar el impacto de la ablacion por capas en modelos MoE y su efecto en tareas especificas como la traduccion.
- Traduccion de contenido literario o academico que los modelos con alineamiento estricto podrian rechazar por temas tabues.
- Evaluacion comparativa de la degradacion del rendimiento tras la ablacion: medir la divergencia KL y otros indicadores de calidad frente al modelo original.
- Experimentacion con cuantizacion GGUF en modelos MoE de gran tamano para despliegue en hardware de consumo.
- Desarrollo de tecnicas de "uncensoring" controlado y evaluacion de sus limites en modelos multilingues.

## Benchmarks y rendimiento

La model card del repositorio solo incluye dos metricas de evaluacion propias del proceso de ablacion, sin benchmarks de traduccion estandarizados:

| Metrica | Este modelo | Modelo original (tencent/Hy-MT2-30B-A3B) |
|---|---|---|
| Keywords (rechazo) | 0/100 | 100/100 |
| Divergencia KL | 0.0276 | 0 (por definicion) |

El autor indica que se utilizo un dataset mixto personalizado para la evaluacion, y que los datasets en japones se usaron solo para medir KLD y tasa de rechazo. No se han publicado resultados de benchmarks de traduccion (como BLEU, COMET o chrF) para esta version modificada en la informacion disponible. El modelo base, segun la documentacion de Tencent, supera a modelos como DeepSeek-V4-Pro y Kimi K2.6 en modo "fast-thinking" en tareas de traduccion, pero estos datos no son directamente aplicables a esta version ablacionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Al tratarse de un modelo MoE con 3B parametros activos, el consumo de VRAM dependera principalmente del nivel de cuantizacion GGUF seleccionado y de la longitud de contexto utilizada.
- GPU recomendadas: al ser un MoE con solo 3B activos, podria ejecutarse en GPUs de consumo como RTX 3090 o RTX 4090 si la cuantizacion es suficiente, aunque el tamano total del repositorio (96.3 GB en GGUF) sugiere que la carga completa requiere mas memoria. No se especifican requisitos concretos.
- Opciones de despliegue: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. Para despliegue en produccion, vLLM o TGI podrian ser opciones si se convierten los pesos a safetensors.
- Latencia y throughput: no disponible. La arquitectura MoE con 3B activos deberia ofrecer una latencia menor que un modelo denso de 30B equivalente, pero no hay datos concretos para esta version.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OS-Software/Hy-MT2-30B-A3B-uncensored-heretic-GGUF | 30B total, 3B activos | no disponible | 33 | Apache 2.0 | GGUF | Version ablacionada sin alineamiento |
| tencent/Hy-MT2-30B-A3B | 30B total, 3B activos | no disponible | 33 | Apache 2.0 | safetensors | Modelo original con alineamiento |
| FlagRelease/HY-MT2-30B-A3B-ascend-FlagOS | 30B total, 3B activos | no disponible | 33 | no disponible | no disponible | Version para hardware Ascend |
| FlagRelease/HY-MT2-30B-A3B-mthreads-FlagOS | 30B total, 3B activos | no disponible | 33 | no disponible | no disponible | Version optimizada para mthreads |

La comparativa principal es con el modelo original de Tencent: esta version comparte arquitectura y capacidades linguisticas, pero difiere en el alineamiento de seguridad y en el formato de pesos. Las versiones FlagRelease son adaptaciones del mismo modelo base para hardware especifico, sin modificaciones de alineamiento.

## Limitaciones y advertencias

- Seguridad: el modelo ha sufrido una reduccion sustancial de su alineamiento de seguridad. Es mas probable que genere contenido danino, inexacto, sesgado u ofensivo que el modelo original.
- Uso previsto: el autor lo destina exclusivamente a investigacion y experimentacion, incluyendo investigacion en seguridad, estudios de alineamiento y red-teaming. No debe desplegarse en servicios publicos o dirigidos a usuarios finales.
- Responsabilidad del usuario: todas las salidas deben tratarse como no fiables y verificarse de forma independiente antes de su uso. El usuario es el unico responsable de evaluar la exactitud y adecuacion del contenido generado.
- Riesgo de alucinacion: al ser una version modificada sin alineamiento, el riesgo de alucinaciones y de respuestas inexactas es mayor que en el modelo original.
- Contexto: la longitud de contexto no se especifica en la informacion disponible, lo que limita la planificacion de despliegues que requieran ventanas largas.
- Benchmarks: no hay datos de rendimiento de traduccion (BLEU, COMET, etc.) para esta version, por lo que no se puede cuantificar la degradacion respecto al original en tareas de traduccion.
- Derivative work: es una obra derivada del modelo de Tencent, publicada bajo la licencia Apache 2.0 del modelo base, pero los derechos del modelo base pertenecen a sus respectivos propietarios.
- Produccion: el autor desaconseja explicitamente su uso en entornos de produccion o servicios publicos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OS-Software/Hy-MT2-30B-A3B-uncensored-heretic-GGUF
- Modelo base original: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Repositorio GitHub del proyecto Hy-MT2: https://github.com/Tencent-Hunyuan/Hy-MT2
- Reporte tecnico Hy-MT2 (arXiv): https://arxiv.org/pdf/2605.22064
- Proyecto Heretic: https://heretic-project.org
- Herramienta AngelSlim: https://github.com/Tencent/AngelSlim/tree/main
- Version alternativa para hardware Ascend: https://huggingface.co/FlagRelease/HY-MT2-30B-A3B-ascend-FlagOS
- Version alternativa para mthreads: https://huggingface.co/FlagRelease/HY-MT2-30B-A3B-mthreads-FlagOS
