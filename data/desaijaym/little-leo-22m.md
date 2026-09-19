# DesaiJayM/little-leo-22m

## Resumen

Little Leo LL-22M es un encoder bidireccional de 22,7 millones de parametros desarrollado por el usuario DesaiJayM y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo: es un clasificador multi-tarea pensado para colocarse delante de un agente que llama a modelos de frontera y decidir, turno a turno, cuanto modelo necesita realmente esa peticion. Sus tres cabezas de salida son `route` (softmax de 3 clases: `NO_MODEL`, `SMALL`, `LARGE`), `risk` (softmax de 3 clases: `P2_READONLY`, `P1_MUTABLE`, `P0_DESTRUCTIVE`) y `gate` (sigmoide con la probabilidad de que un humano deba confirmar la accion propuesta).

El problema que aborda es economico y operativo: los agentes que envian todo a un modelo de frontera, incluido un simple "gracias, ha funcionado", pagan tokens innecesarios. El autor reporta una medicion sobre trafico real de proveedor (117 prompts, 13 tipos de payload) con un ahorro de coste del 22,5 % y de tokens del 13,7 % frente a enviar todo a `openai/gpt-5.4`, sin dejar ninguna peticion sin responder. El modelo esta empaquetado en formato ONNX y se ejecuta con `onnxruntime` en aproximadamente 7 milisegundos sobre un unico nucleo de CPU, lo que lo hace desplegable en el mismo host que el orquestador sin GPU dedicada.

Es relevante ahora porque la orquestacion de agentes con multiples niveles de modelo (frontier, flash, local) se ha convertido en una practica comun, y la pieza que falta suele ser precisamente el enrutador barato y determinista. El propio autor insiste en que no es una frontera de seguridad ni un guardrail: el riesgo es advisory y acotado por reglas deterministas, y el modelo nunca debe ser lo unico que se interponga entre un usuario y una operacion irreversible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional tipo transformer, multi-cabeza (familia concreta no especificada) |
| Parametros totales | 22,7 M (22.7M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (libreria declarada: `onnxruntime`); tamano del repositorio 0,1 GB |
| Tarea declarada | `text-classification` |
| Cabezas de salida | `route` (3 clases), `risk` (3 clases), `gate` (sigmoide) |
| Latencia declarada | ~7 ms por decision en un nucleo de CPU |
| Marcadores de entrada | `[PRE]` (routing), `[ACT]` (riesgo y gate), separador `[SEP]` |

## Arquitectura y entrenamiento

La informacion disponible describe un encoder bidireccional de 22,7 millones de parametros con multiples cabezas de clasificacion sobre un mismo tronco. El diseno usa un unico conjunto de pesos para dos puntos de llamada distintos, diferenciados por un token marcador: `[PRE]`, que se evalua antes de invocar a cualquier modelo y solo lee la cabeza `route`; y `[ACT]`, que se evalua despues de que un modelo proponga una llamada a herramienta y lee las cabezas `risk` y `gate`. El ejemplo de entrada que da el autor es `[ACT] summarise the log [SEP] read ./app.log then pipe what it emits into the shell`, es decir, el turno del usuario mas la accion propuesta separados por `[SEP]`.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se detalla la familia concreta del encoder ni trucos de atencion (atencion lineal, decodificacion especulativa, etc.), algo esperable en un modelo discriminativo de este tamano. La innovacion tecnica destacable no esta en la arquitectura sino en el diseno del sistema que la rodea: una regla de suelo de confianza de 0.90 que descarta las decisiones de routing por debajo de ese umbral y devuelve el control al valor por defecto del host, y la combinacion `final_risk = max(deterministic_rules(action), encoder(action))`, donde las reglas deterministas fijan el minimo y el encoder solo puede elevar el nivel de riesgo, nunca rebajarlo.

El autor justifica el umbral de 0.90 frente a 0.75 con datos: sobre el fixture, todas las decisiones correctas de `NO_MODEL` menos una estaban en 0.99 o mas (mediana 0.998), mientras que las dos incorrectas estaban en 0.481 y 0.735. Un umbral de 0.75 tambien funcionaba, pero por un margen de 0.005 sobre la peor decision incorrecta, lo que el autor califica de coincidencia sobre catorce observaciones. El suelo de 0.90 cuesta aproximadamente seis puntos porcentuales de ahorro, porque un turno genuinamente trivial queda cerca del limite y pasa a ser servido por un modelo real.

## Capacidades

- Enrutado de coste en tres niveles: clasifica cada turno como `NO_MODEL` (no llamar a ningun modelo), `SMALL` (modelo barato) o `LARGE` (modelo de frontera).
- Clasificacion de riesgo de acciones propuestas en tres niveles: `P2_READONLY`, `P1_MUTABLE` y `P0_DESTRUCTIVE`.
- Estimacion de necesidad de confirmacion humana mediante la cabeza `gate` (sigmoide).
- Evaluacion multi-tarea con un unico juego de pesos y dos puntos de llamada diferenciados por marcador (`[PRE]` y `[ACT]`).
- Inferencia en CPU sin GPU: ~7 ms por decision en un solo nucleo, con pesos ONNX.
- Capacidad de abstenerse: el suelo de confianza de 0.90 descarta decisiones poco fiables en lugar de forzarlas.
- Integracion con modelos de proveedores externos como `google/gemini-2.5-flash`, `openai/gpt-5.4` y jueces como `anthropic/claude-opus-4.5`, aunque el modelo en si es agnostico respecto al proveedor.
- No dispone de generacion de texto, razonamiento generativo, codigo, matematicas, vision, audio ni soporte declarado de tool calling propio; su funcion es clasificar, no generar.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.

## Casos de uso

- Enrutado de coste en agentes conversacionales multi-turno: colocado antes de la llamada al modelo, clasifica cada turno y decide si merece un modelo de frontera, uno barato o ninguno. El autor midio un ahorro del 22,5 % en coste sobre 117 prompts de trafico real.
- Supresion de turnos triviales: turnos como "gracias, ha funcionado" se clasifican como `NO_MODEL` y no generan llamada a la API. En la medicion reportada, 33 de 117 prompts cayeron en esta categoria sin dejar ninguna peticion sin responder.
- Pre-filtro de riesgo en pipelines de tool calling: con el marcador `[ACT]` y la accion propuesta como entrada, el modelo asigna un nivel `P2`/`P1`/`P0` que se combina con reglas deterministas mediante `max()`. Es util para marcar operaciones como purgas de datos o escrituras destructivas antes de ejecutarlas.
- Puerta de confirmacion humana (human-in-the-loop): la cabeza `gate` devuelve una probabilidad que puede usarse para decidir si se solicita aprobacion explicita antes de ejecutar una herramienta, especialmente en flujos con acceso a shell o a base de datos.
- Observabilidad y planificacion de capacidad: la distribucion de salidas de `route` (33 `NO_MODEL`, 30 `SMALL`, 54 `LARGE` en el fixture) sirve como metrica de que proporcion del trafico requiere realmente un modelo caro, informacion util para presupuestar y dimensionar infraestructura.
- Despliegue en el borde o en el mismo host que el orquestador: al consumir ~7 ms de CPU por decision y no requerir GPU, puede ejecutarse en el mismo contenedor o proceso que el agente sin competir por VRAM.
- Reduccion de coste en productos SaaS con alto volumen: en aplicaciones con millones de turnos diarios, desviar el 28 % del trafico (33 de 117) fuera del modelo de pago tiene impacto directo en la factura mensual.
- Filtrado previo en asistentes de codigo que ejecutan comandos: clasificar la peligrosidad de una instruccion de shell propuesta antes de pasarla al sandbox o al terminal del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor si publica una medicion propia sobre trafico real de proveedor, que se reproduce a continuacion tal cual aparece en la model card.

| Metrica | Valor |
|---|---|
| Tamano del fixture | 117 prompts, 13 tipos de payload |
| Baseline (todo a `openai/gpt-5.4`) | 0,29826 USD |
| Enrutado por LL-22M | 0,23114 USD |
| Ahorro de coste | 22,5 % |
| Ahorro de tokens | 13,7 % (34.904 → 30.136) |
| Prompts sin responder | 0 / 117 |
| Degradaciones juzgadas materialmente peores | 3 / 30 |
| Reparto de enrutado | 33 `NO_MODEL`, 30 `SMALL`, 54 `LARGE` |
| Modelo barato usado | `google/gemini-2.5-flash` (0,30 / 2,50 USD por Mtok) |
| Modelo de frontera usado | `openai/gpt-5.4` (2,50 / 15,00 USD por Mtok) |
| Juez | `anthropic/claude-opus-4.5`, ciego y con orden aleatorizado |

Sobre la tasa de degradacion, el autor reporta cinco ejecuciones de la comparacion identica (mismo modelo, mismo fixture, temperatura 0) con resultados de 17 %, 11,1 %, 3,3 %, 15 % y 10,0 %, y afirma que la formulacion honesta es "aproximadamente una de cada diez, con incertidumbre amplia". La ejecucion final (3/30) tiene un intervalo de confianza del 95 % de [3,5 %, 25,6 %].

En el apartado de seguridad, la model card incluye esta comparativa de deteccion de acciones destructivas:

| Conjunto | Solo encoder | Solo reglas | Reglas → encoder |
|---|---|---|---|
| Test | 0,726 — 20 acciones P0 no detectadas | 1,000 | 1,000, precision 1,000 |
| Auditoria | 1,000 | 1,000 | 1,000, precision 1,000 |

El propio autor advierte que, en el conjunto de test, el encoder solo no detecta una de cada cuatro acciones destructivas, siempre con la misma formulacion ("and afterwards purge every row it references", borrado de datos sin ruta de fichero ni invocacion de shell), y concluye explicitamente que un despliegue que use el encoder solo para riesgo se perdera acciones destructivas.

## Requisitos de hardware

- VRAM estimada para inferencia: ninguna GPU necesaria. Pesos aproximados: ~91 MB en FP32, ~45 MB en FP16 y ~23 MB en INT8 (calculado a partir de los 22,7 M de parametros).
- GPU recomendadas: no aplica; el modelo esta disenado para CPU y se ejecuta en ~7 ms por decision en un unico nucleo.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo, aunque no es necesario usarla. Tambien cabe holgadamente en memoria de un contenedor o incluso en un entorno de borde.
- Opciones de despliegue: `onnxruntime` (libreria declarada por el autor); al ser un encoder discriminativo en ONNX, es compatible con runtimes ONNX genericos y con despliegues en CPU o en web (por ejemplo, variantes WASM de ONNX Runtime). No aplica `vLLM`, `llama.cpp`, `Ollama` ni `TGI`, que estan orientados a modelos generativos.
- Latencia: ~7 ms por decision en un nucleo de CPU, dato declarado por el autor. Con dos puntos de llamada (`[PRE]` y `[ACT]`) puede haber hasta dos inferencias por turno de agente.
- Throughput estimado: no disponible.

## Comparativa con modelos similares

No se ha proporcionado informacion sobre modelos directamente comparables en la documentacion disponible. La categoria funcional (enrutado barato y clasificacion de riesgo para agentes) esta poco estandarizada y no se han publicado en esta busqueda alternativas equivalentes con datos verificables.

A continuacion se enumeran, a modo de referencia general de la clase de modelo (encoders pequenos de clasificacion), algunas familias conocidas. Los datos de parametros, contexto y licencia de esas familias no proceden de la informacion proporcionada en esta busqueda y deberian verificarse antes de usarse en una decision tecnica.

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Little Leo LL-22M | Encoder multi-cabeza para routing y riesgo | 22,7 M | No disponible | Apache 2.0 | ~7 ms en un nucleo de CPU; tres cabezas (`route`, `risk`, `gate`) |
| Encoders BERT pequenos ajustados a clasificacion | Encoder de clasificacion | No disponible | No disponible | No disponible | Requeririan entrenamiento especifico para routing de coste y riesgo |
| Frameworks de enrutado de LLM | Framework de orquestacion | No aplica | No aplica | No disponible | Enfoque alternativo: enrutar por reglas, embeddings o modelos entrenados ad hoc |
| Clasificadores de riesgo basados en reglas | Sistema determinista | No aplica | No aplica | No disponible | El autor los usa en combinacion, no como alternativa |

## Limitaciones y advertencias

- No es una frontera de seguridad ni un guardrail: el autor lo declara explicitamente. El modelo de riesgo es advisory y debe combinarse siempre con reglas deterministas.
- El encoder por si solo no detecta una de cada cuatro acciones destructivas en el conjunto de test (precision 0,726, 20 acciones P0 no detectadas). Un despliegue que use unicamente el encoder para riesgo se perdera operaciones destructivas.
- La deteccion correcta de esos casos depende de reglas deterministas externas; la proteccion real no reside en este modelo.
- La tasa de degradaciones de calidad es incierta: entre el 3,3 % y el 17 % en cinco ejecuciones identicas, con un intervalo de confianza del 95 % de [3,5 %, 25,6 %] en la ultima. El autor pide no presentarla con mas precision de la que los datos soportan.
- El ahorro de coste (22,5 %) y el de tokens (13,7 %) miden cosas distintas; citar solo el mayor seria una seleccion interesante.
- El suelo de confianza de 0.90 descarta decisiones de routing por debajo de ese umbral. Puede hacer que el host gaste mas, nunca menos, y cuesta aproximadamente seis puntos porcentuales de ahorro.
- Idiomas: solo ingles declarado. No hay informacion sobre comportamiento en castellano u otras lenguas.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de clasificacion erronea tanto en `route` como en `risk`.
- Longitud de contexto, tipos de cuantizacion y detalles de entrenamiento no estan disponibles, lo que dificulta evaluar su comportamiento con entradas largas o fuera de distribucion.
- La model card esta truncada en la informacion proporcionada (la descripcion de la cabeza `abst...` queda incompleta), por lo que podria existir una cuarta cabeza o una capacidad de abstencion documentada que no se ha podido revisar.
- Licencia Apache 2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion de avisos. No se documentan restricciones adicionales de uso aceptable.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en la fecha de la informacion, y las fechas de creacion y actualizacion registradas (2026-09-19) no son verificables desde los datos disponibles. Se trata de un artefacto reciente y sin validacion externa conocida.
- Las cifras de rendimiento proceden exclusivamente del autor del modelo, sobre un fixture de 117 prompts y 13 tipos de payload. No hay evaluacion independiente.
- La comparacion economica depende de los precios concretos de `google/gemini-2.5-flash` y `openai/gpt-5.4` en el momento de la medicion; los ahorros variaran con cualquier cambio de tarifa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DesaiJayM/little-leo-22m
- Paper: no disponible
- Repositorio de codigo: no disponible
- Blog o articulo tecnico: no disponible
- Demo: no disponible

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo ni con enrutado de LLM; los resultados obtenidos correspondian a sitios de efemerides historicas y no se han incluido por no ser relevantes.
