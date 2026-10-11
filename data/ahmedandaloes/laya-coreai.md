# ahmedandaloes/laya-CoreAI

## Resumen

laya-CoreAI es una conversión comunitaria del modelo convaiinnovations/laya a un paquete `.aimodel` de Apple Core AI, ejecutable en macOS 27 sobre Apple Silicon. No es un modelo nuevo ni un reentrenamiento: es el mismo checkpoint de Laya empaquetado para el runtime Core AI, con el codigo anfitrion adaptado (tokenizacion, normalizacion de preguntas y decodificacion de respuestas) para que las peticiones sean identicas byte a byte a las de la ruta PyTorch original.

Laya es un modelo de decision no autorregresivo de tipo System 1: recibe un estado (por ejemplo, el texto de una reclamacion) y un conjunto de preguntas tipadas, y devuelve respuestas tipadas con probabilidades calibradas en un unico forward pass. Nunca genera texto libre ni mantiene un bucle de decodificacion, lo que lo hace encajar directamente en un grafo Core AI: un unico `DecisionModel.forward`, sin cache KV. Los tipos de pregunta documentados en el ejemplo son `choice`, `noul` y `score`.

La relevancia actual del artefacto es de infraestructura mas que de modelado: demuestra que un modelo de decision de este tipo se puede exportar a Core AI con una deriva numerica minima (diferencia absoluta maxima de probabilidad de 0,000001 en 6 casos de validacion). El repositorio ocupa 1,7 GB y esta marcado con la etiqueta `base_model_relation: quantized` pese a que la propia model card afirma que los pesos son FP32 sin cuantizar, una contradiccion que conviene verificar contra los ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No autorregresiva de decision (encoder + cabeza tipada + scorer + act head); no es un transformer generativo |
| Parametros totales | no disponible (el repositorio ocupa 1,7 GB en FP32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens fijos por pase (grafo fijo); no hay contexto autoregresivo |
| Tipos de cuantizacion | Ninguna: encoder y cabeza de decision en FP32 |
| Idiomas soportados | no disponible (los ejemplos de la model card estan en ingles) |
| Licencia | no disponible |
| Formato de pesos | Bundle `.aimodel` de Apple Core AI (FP32); incluye `manifest.json`, tokenizer y ficheros de configuracion |
| Tipo de modelo | Modelo de decision System 1, no generativo |
| Marcadores de opcion | 192 option-markers por pase |
| Tipos de tensor de entrada | int32 en tensores anfitrion; mascara de marcadores en bool |
| Relacion con modelo base | Cuantizado/derivado de `convaiinnovations/laya` (relacion declarada) |
| Runtime | Apple Core AI (coreai-core 1.0.0b3, coreai-torch 0.4.3) |
| Sistema operativo | macOS 27 en Apple Silicon |
| Fecha de creacion | 2026-10-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura de Laya es un modelo de decision no autorregresivo: un encoder procesa el estado de entrada y una cabeza tipada produce respuestas a preguntas estructuradas, con un scorer que devuelve probabilidades calibradas. El paquete exportado incluye el forward completo (encoder, cabeza tipada, scorer y act head) como un unico programa Core AI, sin cache KV ni bucle de decodificacion. La secuencia se rellena a una forma fija de 512 tokens y 192 option-markers; una peticion que no encaja lanza `CapacityError` en lugar de truncarse silenciosamente.

No hay informacion en la model card sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La unica innovacion tecnica documentada en esta conversion es la propia exportacion a Core AI y su validacion: se midio la deriva numerica contra el forward eager de PyTorch del paquete `laya`, alimentado con tensores identicos construidos con `build_sequence`, y en 6 casos (tipos `choice`, `noul` y `score`) todas las respuestas seleccionadas coincidieron, con una diferencia absoluta maxima de probabilidad de 0,000001. Los ficheros incluyen `rl_agent_config.json` y las temperaturas de calibracion que trae el checkpoint, lo que sugiere que el modelo base tiene algun componente de agente RL, pero no se detalla su funcionamiento.

## Capacidades

- Clasificacion por eleccion (`choice`): selecciona una opcion entre un conjunto de criterios descritos en lenguaje natural, como asignar un ticket al departamento de facturacion o al tecnico.
- Puntuacion (`score`): devuelve una puntuacion numerica para una pregunta dada sobre el estado de entrada.
- Respuestas tipadas (`noul`): el modelo admite al menos un tercer tipo de pregunta ademas de `choice` y `score`, aunque su semantica no se describe en la informacion disponible.
- Probabilidades calibradas: las respuestas se acompanan de probabilidades, con temperaturas de calibracion incluidas en el checkpoint.
- Inferencia de un solo pase: toda la decision se resuelve en un unico forward, sin decodificacion iterativa.
- Integracion con el paquete `laya` para tokenizacion, normalizacion de preguntas y decodificacion de respuestas, garantizando equivalencia con la ruta PyTorch.
- act head exportada: presente en el bundle, pero segun el autor su senal todavia no es utilizable (issue #185 de upstream), por lo que no debe usarse para tomar decisiones.

No se documentan capacidades de generacion de texto, razonamiento multi-paso, tool calling, vision, audio ni soporte multilingue explicito.

## Casos de uso

- Enrutamiento de tickets de soporte: con una pregunta `choice` sobre el departamento (facturacion, tecnico, etc.) y criterios descritos en texto, el modelo devuelve la asignacion con probabilidad en un solo forward. Es exactamente el escenario del ejemplo de la model card.
- Triaje de correo electronico entrante: clasificar cada mensaje en una categoria operativa (reclamacion, consulta comercial, incidencia tecnica) sin necesidad de un LLM generativo, reduciendo coste y latencia.
- Moderacion de contenido con criterios tipados: definir criterios como "contenido permitido", "ofensivo" o "spam" y dejar que el modelo puntue o elija etiqueta con probabilidad calibrada.
- Deteccion de intencion en asistentes conversacionales: dado el turno del usuario como estado, decidir la intencion mediante preguntas tipadas antes de derivar a un componente generativo.
- Priorizacion y scoring de leads o incidencias: usar el tipo `score` para asignar una puntuacion de prioridad o de propension sobre textos de entrada.
- Puerta de decision en agentes (guardrail): decidir de forma binaria o multiclase si una accion debe ejecutarse o escalarse a revision humana, aprovechando que la decision es acotada y no generativa.
- Clasificacion en pipelines de automatizacion de procesos (RPA): insertar el modelo como paso de decision estructurada sobre campos y texto extraidos, con salida tipada facil de consumir por el orquestador.
- Despliegue local en Mac: al ejecutarse sobre Core AI en Apple Silicon, permite realizar estas decisiones enteramente en el dispositivo, sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medicion reportada es la deriva numerica de la conversion, que no evalua la precision ni la calibracion de Laya:

| Medicion | Resultado |
|---|---|
| Casos de validacion (choice, noul, score) | 6 |
| Respuestas seleccionadas coincidentes | Si (True) |
| Diferencia absoluta maxima de probabilidad | 0,000001 |
| Alcance de la medicion | Solo deriva de conversion, no precision del modelo |

La model card indica explicitamente que, para datos de precision y calibracion, hay que consultar la model card del modelo upstream y sus issues.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan aproximadamente 1,7 GB en FP32, mas el overhead del runtime Core AI; se puede asumir un consumo en torno a 2 GB de memoria unificada.
- GPU: el modelo esta pensado para GPU integrada de Apple Silicon (no hay soporte CUDA documentado).
- Cabe en equipos de consumo: si, en cualquier Mac con Apple Silicon que ejecute macOS 27 (familias M1, M2, M3, M4 y posteriores).
- Opciones de despliegue: runtime Core AI mediante el paquete Python `laya_coreai` (con `coreai-core 1.0.0b3` y `coreai-torch 0.4.3`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al ser un unico forward pass sin bucle de decodificacion, la latencia esperada es de un solo pase, pero no se aportan cifras.
- Restriccion de forma: el grafo esta fijado a 512 tokens y 192 option-markers; las peticiones que exceden esa capacidad lanzan `CapacityError`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/forma | Formato | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ahmedandaloes/laya-CoreAI | no disponible (repo de 1,7 GB, FP32) | 512 tokens / 192 option-markers | `.aimodel` (Core AI) | Core AI en macOS 27 | no disponible | HuggingFace, 0 descargas |
| convaiinnovations/laya (modelo base) | no disponible | no disponible | PyTorch | PyTorch eager | no disponible | HuggingFace (referenciado) |
| Otros modelos de decision de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre alternativas de la misma categoria (modelos de decision no generativos) en el material proporcionado, por lo que la comparativa queda limitada al modelo base del que deriva esta conversion.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo respuestas tipadas a preguntas estructuradas.
- La act head esta exportada pero su senal no es utilizable segun upstream (issue #185); no debe usarse para decisiones.
- Capacidad fija: una peticion que no encaje en 512 tokens o 192 option-markers lanza `CapacityError`; no hay truncado silencioso, pero tampoco flexibilidad.
- Contradiccion documental: la etiqueta `base_model_relation: quantized` convive con la afirmacion de que nada esta cuantizado (FP32). Conviene inspeccionar `manifest.json` antes de asumir precision.
- Deriva numerica minima pero medida solo sobre 6 casos; no es una validacion exhaustiva.
- Licencia no disponible: no se puede confirmar el uso comercial. Al derivar de `convaiinnovations/laya`, habria que consultar la licencia del modelo base.
- Idiomas soportados no declarados; los ejemplos estan en ingles y no hay evidencia de cobertura multilingue.
- Sesgos conocidos: no disponibles, pero al ser un modelo de decision calibrado puede heredar sesgos del checkpoint base.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto), pero si puede asignar probabilidades erroneas o mal calibradas a las opciones.
- Es una conversion de la comunidad, no una publicacion oficial de Apple ni de Convai.
- Repositorio sin descargas ni likes: sin validacion externa de la comunidad.
- Versionado muy reciente y dependiente de macOS 27 y de versiones beta del runtime Core AI (1.0.0b3 / 0.4.3), lo que puede implicar inestabilidad de API.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedandaloes/laya-CoreAI
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Issue #185 de upstream (senal de la act head no utilizable): no disponible (referenciada en la model card sin URL)
- Paper: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
