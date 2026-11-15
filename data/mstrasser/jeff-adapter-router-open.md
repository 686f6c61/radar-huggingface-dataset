# mstrasser/jeff-adapter-router-open

## Resumen

jeff-adapter-router-open es un adaptador LoRA desarrollado por mstrasser que se monta sobre el modelo base jeff-base v1.4 (un fine-tune de Qwen3.5-0.8B) para actuar como enrutador de decisiones. Su funcion es seleccionar, dentro de un menu de especialistas definido por el propio usuario, cual de ellos debe atender una peticion concreta, devolviendo la etiqueta `base` cuando ningun especialista encaja y debe responder el modelo general. El adaptador resuelve el problema del enrutamiento determinista entre multiples tareas especializadas sin necesidad de generar texto que luego haya que parsear.

Tecnicamente es un adaptador PEFT (LoRA) que recibe una situacion descrita como objeto JSON (instrucciones, opciones y estado) y devuelve, en un unico forward pass, una distribucion de probabilidad sobre las etiquetas candidatas (hasta 32). El identificador del adaptador es `jeff.routing.router-open` (version 1.4.0) y esta disenado para cargarse exclusivamente sobre la revision `v1.4` de jeff-base, ya que el motor rechaza adaptadores entrenados sobre otra base.

Su relevancia actual radica en que propone un patron de orquestacion de agentes basado en clasificacion calibrada en lugar de generacion: el enrutador no "habla", solo decide, lo que reduce latencia y elimina la fragilidad del parseo de texto libre. La licencia Apache 2.0 y el caracter abierto del adaptador facilitan su integracion en pipelines propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre jeff-base v1.4, fine-tune de Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 0.8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre jeff-base v1.4, un fine-tune de Qwen3.5-0.8B que actua como modelo de decision pequeno. La tarea aprendida es de clasificacion de texto (pipeline `text-classification`): dado un objeto `request` con los campos `instructions`, `options` y `state`, el adaptador produce una probabilidad calibrada por cada etiqueta candidata en un unico forward pass, sin generar texto intermedio. El adaptador fue entrenado el 2026-11-03.

El entrenamiento se evaluo sobre peticiones provenientes de los propios conjuntos de test reservados de cada especialista abierto y de benchmarks publicos, con parte de las peticiones reformuladas por un LLM. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor indica explicitamente que el enrutador no tiene cifra de calibracion porque "elige un especialista para cada peticion en lugar de abstenerse", de modo que no maneja umbral ni calibracion de confianza.

## Capacidades

- Enrutamiento de peticiones hacia un menu de hasta 32 especialistas con nombre y descripcion aportados por el llamador.
- Seleccion de la etiqueta `base` cuando ningun especialista encaja, delegando en el modelo general.
- Clasificacion calibrada por opcion en un unico forward pass, sin texto generado que parsear.
- Soporte de los especialistas documentados por el autor: `message-triage`, `support-intents`, `triage`, `passage-relevant`, `evidence-sufficient`, `entails`, `contradicts`, `guard`, `spam`, `tool-route` y `ci-failure`.
- Deteccion de inyeccion de prompt, jailbreak y fuga de datos (via el especialista `guard`).
- Clasificacion de spam y phishing (via el especialista `spam`).
- Enrutamiento de herramientas (tool calling) dado un menu de herramientas en cualquier formato comun (via `tool-route`).
- Analisis de fallos de CI (via `ci-failure`).
- Capacidad multilingue: limitada al ingles.

## Casos de uso

- Orquestacion de agentes multi-especialista: el enrutador recibe la peticion del usuario y el catalogo de especialistas disponibles, y devuelve cual debe atenderla, permitiendo construir un despachador determinista sin que un LLM grande tenga que decidir por generacion de texto.
- Triaje de soporte al cliente: con los especialistas `triage` y `support-intents` en el menu, el adaptador clasifica tickets y correos por equipo, urgencia y tipo de solicitud, enrutandolos al flujo adecuado.
- Moderacion y seguridad: usando `guard` y `spam` como especialistas, el enrutador decide si un mensaje debe pasar por el filtro de inyeccion de prompt o por el clasificador de phishing antes de llegar al modelo generativo.
- Recuperacion aumentada (RAG): con `passage-relevant` y `evidence-sufficient` en el menu, el enrutador dirige cada consulta al comprobador adecuado para validar si los pasajes recuperados responden a la pregunta.
- Enrutamiento de herramientas en asistentes: con `tool-route`, el adaptador decide que herramienta invocar a continuacion, ninguna, o pedir al usuario un dato faltante, sin generar una llamada en texto que haya que interpretar.
- Analisis de fallos en CI/CD: con `ci-failure`, el enrutador clasifica un run fallido (regresion real, test intermitente, infraestructura, cambio de dependencia, test obsoleto) a partir del log, el cambio de codigo y el historial, integrándose en pipelines de integracion continua.
- Despacho en sistemas de mensajeria: con `message-triage`, clasifica mensajes segun los tipos, la tabla de enrutamiento y las reglas propios de la bandeja de entrada del cliente.

## Benchmarks y rendimiento

| Test | Filas | Precision |
|---|---:|---:|
| Peticiones de los test reservados de cada especialista y de benchmarks publicos, algunas reformuladas por un LLM (mixed) | 6.930 | 99,8% |
| Peticiones tal como se escribieron (mixed) | 5.378 | 99,9% |
| Peticiones reformuladas por un LLM (mixed) | 1.552 | 99,5% |

La precision se define como la proporcion de filas de test cuya respuesta principal fue correcta. El autor clasifica los tipos de test como public (benchmark publico), real (documentos reales reservados), generator (test interno del mismo generador que los datos de entrenamiento, que mide menos que un test publico o real), mixed (varios tipos) y unknown (no registrado). No se publica cifra de calibracion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al tratarse de un adaptador LoRA sobre un modelo base de 0.8B, la huella deberia ser reducida, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: SDK de Python `jeff` con el motor `Jeff.local`, que descarga el adaptador y la base desde Hugging Face la primera vez; tambien disponible el servidor y los SDK del repositorio github.com/firelex/jeff.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jeff-adapter-router-open | LoRA sobre base 0.8B | no disponible | Enrutamiento por clasificacion calibrada | Apache 2.0 | Hugging Face (27 descargas) |
| Modelos de enrutamiento generativo (LLM general con prompt de seleccion) | Variable | Variable | Generacion de texto con parseo posterior | Variable | Amplia |
| Clasificadores de intencion supervisados clasicos | Variable | Fija | Clasificacion de etiquetas fijas | Variable | Amplia |

No se dispone de datos de benchmarks comparativos con alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo funciona con especialistas incluidos en el conjunto documentado por el autor; si el menu contiene especialistas fuera de ese conjunto, el enrutador no es adecuado.
- Esta atado a la revision `v1.4` de jeff-base: el motor rechaza adaptadores entrenados sobre otra base, lo que limita la portabilidad.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No dispone de calibracion ni umbral: siempre elige una etiqueta, por lo que no puede abstenerse ante peticiones ambiguas salvo devolviendo `base`.
- Riesgo de alucinacion no evaluado en la informacion disponible; al ser un clasificador, el riesgo se traslada a una eleccion erronea de especialista.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base jeff-base y de Qwen3.5-0.8B.
- Ecosistema joven: 27 descargas y 0 likes en Hugging Face, paquetes no publicados aun en PyPI (instalacion desde GitHub), lo que implica menor madurez para produccion.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/mstrasser/jeff-adapter-router-open
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Pagina de catalogo: https://jeffhub.ai/catalogue/jeff.routing.router-open
- Codigo, servidor y SDKs: https://github.com/firelex/jeff
- Guia de instalacion del SDK: https://jeffhub.ai/docs/sdk/install
