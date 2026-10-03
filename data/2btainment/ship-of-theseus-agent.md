# 2Btainment/ship-of-theseus-agent

## Resumen

Ship of Theseus es un framework de investigacion, publicado en HuggingFace por el usuario 2Btainment, que no constituye un modelo de lenguaje en si mismo sino un banco de pruebas para estudiar la auto-atribucion en agentes con memoria persistente. La pregunta central que articula el proyecto es si la informacion autobiografica de un agente puede permanecer intacta mientras su vinculacion funcional con un "yo" persistente desaparece de forma selectiva. Para responderla, el sistema instrumenta un modelo abierto (por defecto `google/gemma-2-2b-it`) y extrae, mediante sondeo contrastivo, una direccion de atribucion SELF/OTHER (`V_self`) y un subespacio (`S_self`) en el residual stream.

El mecanismo experimental clave son las intervenciones causales del tipo `h ← h − α·proj(h, S_self)` aplicadas en una capa intermedia, barridas sobre `α ∈ {0, 0.25, 0.5, 0.75, 1.0, 1.5}`. El framework mide que partes del "yo" funcional se desvanecen y cuales de la capacidad general sobreviven, y lo hace a traves de cuatro familias de experimentos: Swap, Ship-of-Theseus, Doppelgänger y reversibilidad. La propuesta es relevante ahora porque conecta la investigacion reciente sobre vectores de steering de auto-reconocimiento y vectores de persona con la evaluacion de agentes que mantienen memoria episodica y planes a largo plazo.

Se trata de material de investigacion en fase temprana (0 descargas, 0 likes en el momento de redactar esta ficha) y sin licencia declarada, orientado a reproducir experimentos de interpretabilidad mecanistica y de control conductual sobre modelos pequenos, no a despliegues de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework de investigacion sobre un transformer decoder-only (modelo base por defecto: `google/gemma-2-2b-it`; alternativa: `HuggingFaceTB/SmolLM2-1.7B-Instruct`) |
| Parametros totales | no disponible (depende del modelo base; ~2B en gemma-2-2b-it y 1.7B en SmolLM2-1.7B-Instruct) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 para la ejecucion documentada; no se detallan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el modelo base `gemma-2-2b-it` esta sujeto a licencia gated de Google) |
| Formato de pesos | no disponible (el repositorio es codigo Python, no publica pesos propios) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero ni publica pesos: es un harness de experimentacion escrito en Python que accede al residual stream de un transformer decoder-only mediante hooks de forward. Su componente tecnico central es un pipeline de sondeo contrastivo que, a partir de pares SELF/OTHER, calcula una direccion de atribucion por diferencia de medias con proyeccion de variables molestas (nuisance out-projection), realiza un barrido por capas y extrae un subespacio `S_self` mediante SVD. Sobre esa representacion se aplican intervenciones causales que restan la proyeccion del estado oculto sobre el subespacio, escaladas por el coeficiente `α`.

El agente que se instrumenta acumula memoria episodica, continuidad de persona, referencia a acciones propias y planes a largo plazo entre sesiones, almacenados en una base SQLite con ambito por `agent_id`. Los experimentos se organizan en tres fases: formacion del agente (A), extraccion de vectores y barrido de intervenciones (B/C) y experimentos diferenciales de Swap, Ship-of-Theseus, Doppelgänger y reversibilidad, disenados para separar la perdida de memoria de la perdida de auto-atribucion. El repositorio se apoya en cuatro anclas cientificas: el vector de steering de auto-reconocimiento de Ackerman y Panickssery (arXiv:2410.02064), los vectores de persona de Chen et al. (arXiv:2507.21509), el par de resultados causales positivo/negativo de Panickssery et al. (arXiv:2404.13076 y arXiv:2407.06946) y el trabajo de Lindsey sobre conciencia introspectiva (Anthropic, 2025). No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento del modelo base ni sobre procesos de RLHF o DPO propios.

## Capacidades

- Ejecucion de un agente con bucle de planificacion, uso de herramientas y reflexion, consciente de las intervenciones aplicadas.
- Memoria persistente en SQLite con cuatro categorias (episodica, semantica, core y planes) y eventos, con ambito por `agent_id` para soportar el experimento Doppelgänger.
- Uso de herramientas locales en sandbox: lectura y escritura de ficheros en `theseus_data/workspace/`, calculo y comprobacion de compilacion.
- Sondeo contrastivo SELF/OTHER: extraccion de una direccion de atribucion y de un subespacio en el residual stream mediante diferencia de medias, proyeccion de variables molestas y SVD.
- Intervencion causal sobre el residual stream en una capa intermedia, con barrido de `α` y guarda de perplexidad para detectar degradacion de capacidad.
- Experimentos de Swap, Ship-of-Theseus, Doppelgänger y reversibilidad para separar perdida de memoria de perdida de auto-atribucion.
- Metricas conductuales: `SelfMetrics`, `CapabilityMetrics`, atribucion por eleccion forzada, clasificador A/B/C y calculo de `SelfLoss`/`CapabilityLoss`.
- Analisis estadistico con intervalos de confianza por bootstrap, tests de permutacion pareados y `Cohen's dz`.
- Capacidades multilingues: no disponibles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en interpretabilidad mecanistica: el framework permite localizar y manipular una direccion de auto-atribucion en el residual stream de un transformer pequeno y medir el efecto causal sobre la conducta del agente.
- Estudio de continuidad de identidad en agentes con memoria: usando la memoria SQLite por sesiones se puede evaluar si el agente mantiene coherencia autobiografica cuando se interviene su representacion interna.
- Auditoria de seguridad de agentes: el bucle de planificacion y uso de herramientas en sandbox permite analizar como cambia el comportamiento de un agente cuando se altera su auto-atribucion, sin riesgo de fugas de red.
- Reproduccion de resultados de steering de auto-reconocimiento: el repositorio generaliza el vector de steering de un unico prompt de discriminacion de texto a un agente con memoria a lo largo de varias sesiones, lo que sirve para replicar y extender arXiv:2410.02064.
- Docencia y formacion en interpretabilidad: con una GPU de 8 GB o incluso CPU (aunque lenta) es posible ejecutar el pipeline completo de fases A/B/C y observar los graficos y JSON generados en `theseus_results/`.
- Experimentos de ablation controlada: el barrido de `α` con guarda de perplexidad permite estudiar la frontera entre perdida de capacidad y desacoplamiento funcional, util como protocolo metodologico reutilizable.
- Comparacion de modelos base: el parametro `THESEUS_MODEL_ID` y `THESEUS_NUM_LAYERS` permiten sustituir gemma-2-2b-it por SmolLM2-1.7B-Instruct y comparar la fragilidad del steering entre arquitecturas a esta escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio describe metricas internas del propio framework (precision de sondeo retenida, perplexidad bajo intervencion, `tool_use`, clasificador A/B/C) y criterios de fallo, pero no incluye cifras de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada: la documentacion indica una GPU con al menos 8 GB de VRAM en bfloat16 para el pipeline completo.
- Alternativa en CPU: aproximadamente 6 GB de RAM es suficiente, pero la ejecucion es lenta.
- GPUs recomendadas: cualquier GPU con 8 GB o mas de VRAM (la documentacion no especifica modelos concretos como A100, H100 o RTX 4090).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM.
- Opciones de despliegue: ejecucion como paquete Python (`python -m theseus.experiments.run_all`), con dependencias `torch`, `transformers`, `scikit-learn`, `matplotlib` y `numpy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el pipeline completo tarda aproximadamente 2-4 horas en GPU; cada etapa es reanudable.
- Modelo base gated: `google/gemma-2-2b-it` requiere aceptar la licencia en su pagina del Hub y ejecutar `huggingface-cli login`. Como alternativa sin acceso a Gemma se puede usar `THESEUS_MODEL_ID=HuggingFaceTB/SmolLM2-1.7B-Instruct` con `THESEUS_NUM_LAYERS=24` y `THESEUS_STEER_LAYER=12`.

## Comparativa con modelos similares

| Aspecto | Ship of Theseus (framework) | Ackerman y Panickssery (arXiv:2410.02064) | Persona Vectors (arXiv:2507.21509) |
|---|---|---|---|
| Tipo | Harness de agente con memoria e intervencion causal | Vector de steering de auto-reconocimiento | Vectores de persona |
| Modelo base | gemma-2-2b-it o SmolLM2-1.7B-Instruct | Llama3-8B-Instruct | no disponible |
| Alcance | Agente multi-sesion con memoria y uso de herramientas | Discriminacion de texto en un unico prompt | Steering por promedio de tokens de respuesta con barrido de `α` |
| Metodo de vector | Diferencia de medias + proyeccion de variables molestas + SVD | Diferencia de medias + proyeccion de variables molestas | Promedio sobre tokens de respuesta |
| Licencia | no disponible | no disponible | no disponible |
| Codigo | Repositorio HuggingFace `2Btainment/ship-of-theseus-agent` | no disponible en la informacion | `github.com/safety-research/persona_vectors` |

## Limitaciones y advertencias

- Circularidad del juez: las metricas conductuales usan el mismo modelo como juez; el propio autor advierte que para cualquier afirmacion publicable hay que sustituirlo por un juez externo de mayor tamano.
- Pesos compartidos en el Doppelgänger: ambas instancias ejecutan el mismo checkpoint, por lo que el experimento acota la dominancia memoria+contexto, no la relacion pesos-frente-a-memoria.
- Fragilidad del steering en modelos pequenos: la guarda de perplexidad debe mantenerse por debajo de 2.0; segun el autor, Qwen y Llama a esta escala se disparan entre x44 y x125, motivo por el que se eligio gemma-2-2b-it.
- El fallo del sondeo es un resultado valido: si la mejor precision retenida ronda 0.5, la conclusion honesta es que no hay direccion de "yo" extraible en esa escala o protocolo, y no se debe reescalar hasta encontrar correlacion.
- Casos de fallo documentados: precision de sondeo inferior o igual a 0.6 provoca una excepcion en `extract_vectors` y debe reportarse como resultado negativo; una explosion de perplexidad con `α > 0.75` indica que la perdida de capacidad es un artefacto y no un desacoplamiento; si el agente no emite lineas TOOL, la metrica `tool_use` sera aproximadamente 0 en todas las condiciones y hay que aumentar los pasos por episodio o simplificar las tareas; si la direccion captura solo pronombres en primera persona, se trata de una caracteristica de formato y no de una representacion del "yo".
- Licencia: no declarada en el repositorio; el modelo base por defecto esta bajo la licencia gated de Google, lo que condiciona cualquier uso comercial.
- Ambito restringido por diseno: ejecucion local unicamente, las herramientas no pueden salir de `theseus_data/workspace/`, no hay acceso de red desde las herramientas y no se manejan credenciales; el "Agente B" confederado es un flujo de log sintetizado, no un segundo sistema en vivo.
- Estado del proyecto: 0 descargas y 0 likes en el momento de la consulta; es material de investigacion en fase temprana, no un componente listo para produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/2Btainment/ship-of-theseus-agent
- Ackerman y Panickssery, Inspection and Control of Self-Generated-Text Recognition Ability in Llama3-8B-Instruct: https://arxiv.org/abs/2410.02064
- Chen et al., Persona Vectors: https://arxiv.org/abs/2507.21509
- Codigo de Persona Vectors: https://github.com/safety-research/persona_vectors
- Panickssery et al. (resultado causal positivo): https://arxiv.org/abs/2404.13076
- Panickssery et al. (resultado causal negativo): https://arxiv.org/abs/2407.06946
- Lindsey, Emergent Introspective Awareness (Anthropic, 2025): no se proporciona URL en la informacion disponible.
- Modelo base por defecto, `google/gemma-2-2b-it`: no se proporciona URL en la informacion disponible.
- Alternativa sin acceso a Gemma, `HuggingFaceTB/SmolLM2-1.7B-Instruct`: no se proporciona URL en la informacion disponible.
