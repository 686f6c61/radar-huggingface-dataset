# MaestroYan/JEMM

## Resumen

JEMM (Judgment Engine for MultiModal decisions) es un adaptador LoRA publicado por el usuario MaestroYan sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo generativo al uso: es un motor de decision que, dado un estado y una pregunta, devuelve una probabilidad para cada uno de los candidatos propuestos (entre 2 y 32 por consulta) y selecciona el mejor. La model card lo presenta explicitamente como "como Jev, pero multimodal y con pesos abiertos", en referencia a los modelos System One de TypeSafe AI, de los que se declara no afiliado.

El problema que resuelve es el de las decisiones estructuradas y rapidas dentro de pipelines de agentes: seleccion de herramienta, clasificacion de intencion, deteccion de irrelevancia o puntuacion de opciones. A diferencia de una llamada generativa convencional, JEMM explota directamente los logits de la ultima posicion para obtener una distribucion de probabilidad sobre las etiquetas candidatas, lo que permite aplicar un umbral de "no decidido" en lugar de forzar siempre una respuesta.

Su relevancia actual esta en dos ejes: por un lado, admite entrada de texto o texto mas captura de pantalla (multimodal), lo que lo habilita para agentes GUI; por otro, al ser un adaptador PEFT de 0,5 GB sobre pesos abiertos, es autoalojable en GPU propia, frente al enfoque de API hospedada de su referencia. La model card no detalla arquitectura interna, contexto ni idiomas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal Qwen/Qwen3.8-27B (clase Qwen3_5ForConditionalGeneration) |
| Parametros totales | No disponible. El adaptador ocupa 0,5 GB; el modelo base se identifica como de 27B por su nombre |
| Parametros activos | No aplica / no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen/Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Biblioteca declarada | peft |
| Tamano del repositorio | 0,5 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Tipos de pregunta | choice, noul, score |
| Numero de candidatos por pregunta | 2 a 32 |
| Entrada multimodal | Texto, o texto + captura de pantalla (PIL); entrenamiento a 1280x800 |
| Descargas / likes | 26 / 13 |
| Fecha de creacion | 2026-09-26 |

## Arquitectura y entrenamiento

JEMM no define una arquitectura propia: es un adaptador LoRA sobre Qwen/Qwen3.8-27B que se carga con PeftModel.from_pretrained sobre el modelo base instanciado en bfloat16 con device_map="cuda". El mecanismo de decision es una cabeza implicita sobre el propio vocabulario: se ejecuta el modelo con logits_to_keep=1, se toman los logits de la ultima posicion y se restringe el softmax a los token IDs correspondientes a las etiquetas de los candidatos (A-Z mas 0-5). Ese softmax se divide por un parametro de temperatura especifico, mm_temperature cuando hay imagen y temperature cuando no, ambos leidos de decision_config.json. La salida es un diccionario candidato-probabilidad, y la model card indica que una probabilidad maxima por debajo de threshold (tambien en decision_config.json) debe tratarse como indecision. La generacion usa la plantilla de chat del modelo base con enable_thinking=False.

En cuanto a los datos de entrenamiento, la model card enumera las fuentes sin indicar volumen total de tokens ni proporciones: Mind2Web y Multimodal-Mind2Web (agentes web y multimodal, esta ultima bajo OpenRAIL), xLAM function-calling-60k (APIGen), xlam-irrelevance, When2Call, Banking77, MASSIVE, Aegis 2.0 (CC-BY-4.0), CLINC150 (CC-BY-3.0), BFCL, glaive-function-calling-v2, ToolACE y hermes-function-calling-v1 (Apache-2.0). Los conjuntos cubren seleccion de herramienta, deteccion de irrelevancia, clasificacion de intenciones en banca y multilingue, moderacion de contenido y agentes GUI. El autor afirma explicitamente que no se usaron salidas de Jev en el entrenamiento, presumiblemente para descartar destilacion desde el modelo propietario de referencia. No se documentan fases de RLHF, DPO ni detalles del preentrenamiento del adaptador.

## Capacidades

- Decision sobre candidatos: dado un estado y una pregunta, devuelve una distribucion de probabilidad normalizada sobre 2 a 32 candidatos etiquetados y selecciona el de mayor probabilidad.
- Tres tipos de pregunta declarados: choice, noul y score.
- Seleccion de herramientas (tool routing): el ejemplo de la model card decide entre get_weather, search_flights o "No tool applies".
- Deteccion de irrelevancia: capacidad entrenada explicitamente con xlam-irrelevance y When2Call para determinar cuando ninguna herramienta aplica.
- Clasificacion de intenciones: el uso de Banking77, CLINC150 y MASSIVE apunta a clasificacion de intenciones de usuario, incluyendo escenarios multilingues.
- Entrada multimodal: acepta capturas de pantalla como imagenes PIL junto al texto, con resolucion de entrenamiento de 1280x800, lo que habilita decisiones basadas en el estado visual de una interfaz.
- Abtencion controlada: el umbral threshold de decision_config.json permite que el modelo declare indecision en lugar de forzar una eleccion.
- Calibracion de confianza: al exponer probabilidades por candidato, permite umbrales y agregacion en cascada.
- No se documentan capacidades de generacion libre, razonamiento abierto, codigo, matematicas, tool calling generativo ni modo thinking (de hecho, el ejemplo desactiva enable_thinking).

## Casos de uso

- Enrutado de herramientas en agentes: el modelo recibe el estado de la conversacion y la lista de herramientas disponibles y devuelve la probabilidad de cada una; un orquestador puede aplicar un umbral y, si la confianza es baja, escalar a un modelo mayor. Es adecuado porque su salida es directamente una distribucion sobre etiquetas, sin necesidad de parsear texto libre.
- Clasificacion de intenciones en atencion al cliente: el uso de Banking77, CLINC150 y MASSIVE en el entrenamiento lo orienta a clasificar consultas de usuario en un conjunto cerrado de intenciones; al devolver probabilidades se puede detectar baja confianza y derivar a un agente humano.
- Deteccion de "ninguna herramienta aplica": en pipelines con muchas herramientas, invocar una incorrecta es costoso; las fuentes xlam-irrelevance y When2Call entrenan especificamente la clase de rechazo, y el tipo de pregunta noul parece orientado a este escenario.
- Agentes GUI y automatizacion web: con entrada de texto mas captura de pantalla (1280x800) y datos de Mind2Web y Multimodal-Mind2Web, puede decidir la siguiente accion o elemento sobre una interfaz renderizada a partir de una imagen de pantalla.
- Moderacion y politicas de contenido: Aegis 2.0 aparece entre los datos de entrenamiento, lo que sugiere uso para decidir si un contenido incumple una categoria de politica entre un conjunto de etiquetas dadas.
- Puntuacion y ranking de opciones: el tipo de pregunta score y la salida probabilistica permiten ordenar candidatos (respuestas, acciones, rutas) en lugar de elegir solo uno.
- Cascada de coste en produccion: al ser un adaptador pequeno sobre un modelo base autoalojado, puede colocarse como primera etapa de bajo coste delante de un modelo mayor o de una API externa, tomando decisiones rapidas y delegando las consultas de baja confianza.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card incluye tres figuras cuyos valores no se detallan en el texto proporcionado:

- assets/accuracy.png: exactitud de JEMM frente a Jev 1.13.
- assets/latency.png: latencia de JEMM frente a Jev 1.13.
- assets/landscape.png: comparacion con modelos abiertos de tipo Jev.

La unica referencia cuantitativa textual es el rango operativo de 2 a 32 candidatos por pregunta y la existencia de un parametro threshold de indecision. No se aportan cifras de MMLU, HumanEval, GSM8K, BFCL ni de ningun otro benchmark estandar.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato oficial. Estimacion a partir del modelo base de 27B: en bfloat16 los pesos rondan los 54 GB, por lo que con cache KV y activaciones conviene reservar del orden de 60-70 GB; en cuantizacion de 4 bits la horquilla estimada seria de 14-18 GB. El adaptador en si solo anade 0,5 GB.
- GPU recomendadas (estimacion): A100 80 GB o H100 80 GB para bfloat16 sin cuantizar; A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB con cuantizacion.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) unicamente con cuantizacion agresiva y contexto corto, dado que el modelo base es de 27B. No es viable en bfloat16 en GPU de consumo.
- Opciones de despliegue: la ruta documentada en la model card es transformers (Qwen3_5ForConditionalGeneration) mas peft (PeftModel) en CUDA con bfloat16. El autor menciona ademas un servidor HTTP en el repositorio de GitHub. No se documenta soporte para llama.cpp, Ollama, TGI o vLLM, y el soporte de adaptadores PEFT multimodales en esos motores no esta confirmado.
- Latencia y throughput: no disponibles como cifras. La model card remite a assets/latency.png para la comparacion de latencia con Jev 1.13, pero no incluye valores. El diseno (una unica pasada, logits_to_keep=1 y softmax restringido a las etiquetas) esta orientado a minimizar coste frente a la generacion autoregresiva completa.

## Comparativa con modelos similares

| Modelo | Entrada | Pesos | Tipos de pregunta | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEMM | Texto o texto + captura de pantalla | Abiertos, autoalojados (adaptador LoRA) | choice, noul, score | apache-2.0 | HuggingFace, 0,5 GB |
| Jev (TypeSafe AI) | Solo texto | API hospedada | choice, noul, score | No disponible | API |
| Qwen/Qwen3.8-27B | Texto y multimodal (segun modelo base) | Abiertos | No es un motor de decision; es el modelo base | No disponible en esta busqueda | HuggingFace |

La propia model card establece la comparacion con Jev en tres ejes: entrada multimodal frente a solo texto, pesos abiertos y autoalojados frente a API hospedada, y coincidencia en los tres tipos de pregunta. No se dispone de datos para comparar parametros, contexto o rendimiento numerico frente a otras alternativas.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgo. Los datos de entrenamiento incluyen Aegis 2.0 y conjuntos de intenciones en dominios concretos (banca, asistentes), por lo que el comportamiento fuera de esos dominios puede degradarse.
- Alucinacion: el modelo no genera texto libre, de modo que el riesgo clasico de alucinacion se transforma en riesgo de seleccion incorrecta con confianza alta; el umbral threshold de decision_config.json es el mecanismo previsto para mitigarlo y debe calibrarse por caso de uso.
- Indecision mal calibrada: si threshold no se ajusta, el sistema puede forzar decisiones erroneas o, al contrario, abstenerse en exceso. La model card no indica un valor recomendado.
- Limite de candidatos: el diseno cubre de 2 a 32 candidatos por pregunta; fuera de ese rango el comportamiento no esta documentado.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere descargar y ejecutar Qwen/Qwen3.8-27B, con el coste de hardware asociado.
- Contexto e idiomas: la model card no declara longitud de contexto ni lista de idiomas soportados. Aunque se han usado corpus multilingues (MASSIVE), no hay confirmacion de cobertura por idioma.
- Modalidad de imagen: el entrenamiento multimodal se hizo a 1280x800; no se documenta el comportamiento con otras resoluciones o relaciones de aspecto.
- Licencia: el adaptador es apache-2.0, pero el uso comercial depende tambien de la licencia del modelo base Qwen/Qwen3.8-27B, que no se detalla en la informacion disponible.
- Trazabilidad limitada: la model card no indica volumen de tokens de entrenamiento, hiperparametros, rango del LoRA ni evaluacion de regresion frente al modelo base.
- Afiliacion: el autor declara explicitamente no estar afiliado a TypeSafe AI, por lo que la comparacion con Jev no procede de una evaluacion independiente.
- Madurez: 26 descargas y 13 likes en el momento de la consulta, lo que indica un modelo muy reciente y con poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MaestroYan/JEMM
- Servidor HTTP y repositorio del autor: https://github.com/ypcypc/JEMM
- Referencia a Jev (TypeSafe AI): https://typesafe.ai/blog/introducing-system-one-models-and-jev
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Figuras de resultados citadas en la model card: assets/landscape.png, assets/accuracy.png, assets/latency.png (dentro del repositorio del modelo)
