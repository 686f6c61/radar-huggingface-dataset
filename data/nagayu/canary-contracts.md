# NagaYu/canary-contracts

## Resumen

canary-contracts es un motor determinista de evaluacion de salidas de LLM publicado por el autor independiente NagaYu. No es una red neuronal: no contiene pesos ni `config.json`. Se distribuye como un unico fichero Python (`canary.py`) mas varios paquetes de contratos en JSON, con dependencia obligatoria de `pandas` y opcional de `huggingface_hub`. Su funcion es puntuar la salida de un LLM contra contratos verificables por maquina, es decir, reglas que una computadora puede comprobar sin recurrir a un juez LLM ni a inferencia.

El artefacto cubre 12 comprobadores agrupados por contrato: `json_valid`, `schema`, `must_contain`, `must_not_contain`, `max_tokens`, `max_chars`, `no_pii`, `no_secrets`, `no_system_leak`, `must_refuse`, `grounded` y `stable`. Ademas incluye un registro de versiones de prompts, ejecucion de runs, comparacion entre versiones y una puerta de CI (`gate`) que devuelve veredictos como `block`. Cada veredicto se acompana de evidencia: posiciones de coincidencia, PII enmascarada, fragmentos solapados o afirmaciones no soportadas.

Es relevante ahora porque cubre una necesidad concreta en el ciclo de desarrollo de aplicaciones con LLM: regresion y guardrails reproducibles, versionables y ejecutables en una sola CPU, sin GPU ni coste por token. Su publicacion en HuggingFace responde a la idea de versionar, diffear y bifurcar las comprobaciones como cualquier otro artefacto. La evaluacion declarada sobre un split held-out de 217 casos (153 en ingles y 64 en japones) reporta un 96,3 % de exactitud, con un punto debil explicito en el comprobador `must_refuse` (86,0 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Motor de reglas determinista en Python (12 comprobadores); no es una red neuronal, no hay transformer ni MoE ni SSM |
| Parametros totales | no aplica (sin pesos; el artefacto es codigo Python y JSON) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no hay ventana de contexto; los checks operan sobre la salida del caso y, en `no_system_leak`, sobre el system prompt del caso) |
| Tipos de cuantizacion | no aplica (no hay pesos que cuantizar) |
| Idiomas soportados | en, ja |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica; se distribuye como `canary.py` (Python) y `packs/*.json` (contratos JSON) |
| Tipo de artefacto | Motor determinista + paquetes de contratos; `inference: false` en los metadatos |
| Dependencias | `pandas` (obligatoria), `huggingface_hub` (opcional); sin Gradio para importar |
| Paquetes de contratos incluidos | `baseline-critical`, `json-api`, `support-assistant`, `safety-refusals`, `japanese-business` |
| Ficheros adicionales | `examples/quickstart.py`, `eval_results_test.json`, `eval_results_dev.json` |
| Dataset de evaluacion | `NagaYu/canary-eval` (split held-out de test) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-27 / 2026-09-27 |

## Arquitectura y entrenamiento

No existe entrenamiento. El sistema es un conjunto de comprobadores deterministas implementados en un solo fichero Python, sin llamadas a modelos y sin LLM como juez. Los veredictos posibles por contrato son `pass`, `fail`, `error` y `skipped`; un check que falla o supera el tiempo limite se marca como `error`, y uno que no puede evaluarse como `skipped`, y ninguno de los dos se cuenta nunca como `pass`.

Los comprobadores combinan heuristicas estructurales y de texto: validacion y reparacion de JSON y esquema (se reparan y registran bloques de codigo, comas finales, comillas simples y saltos de linea en crudo), coincidencia por regex sobre texto normalizado NFKC (de modo que el texto de ancho completo no esquiva un patron), limites de longitud (`max_tokens`, `max_chars`), deteccion de PII (correos, telefonos de Japon, Estados Unidos e internacionales, numeros de tarjeta validos por Luhn, direcciones IP y fechas de nacimiento), deteccion de secretos (prefijos de claves conocidas, JWT, credenciales en codigo, URL o prosa, etiquetas japonesas y tokens de alta entropia), deteccion de filtracion del system prompt por solapamiento de n-gramas, verificacion de rechazo (`must_refuse`), verificacion de anclaje factual (`grounded`, con derivaciones de suma, resta, multiplicacion y division) y estabilidad entre muestras del mismo caso (`stable`, que compara longitud, formato y numeros).

La innovacion tecnica reseñable no esta en el modelado, sino en el aislamiento de la ejecucion: las expresiones regulares escritas por el usuario se ejecutan en un proceso trabajador separado con un limite de 2 segundos, y si el trabajador no puede arrancar, los checks de regex devuelven `error` en lugar de ejecutarse sin limite. El autor advierte de que el codigo debe ejecutarse como fichero y no por stdin, porque en macOS y Windows el proceso trabajador reimporta el script principal.

## Capacidades

- Validacion determinista de salidas de LLM contra contratos declarativos, sin uso de GPU ni de inferencia.
- Validacion y reparacion de JSON y de esquema, registrando las reparaciones aplicadas.
- Comprobacion de patrones obligatorios y prohibidos mediante regex con normalizacion NFKC.
- Control de longitud de salida por tokens y por caracteres.
- Deteccion de PII: correos, telefonos (JP, US, internacionales), tarjetas validas por Luhn, IP y fechas de nacimiento.
- Deteccion de secretos: prefijos de claves conocidas, JWT, credenciales en codigo, URL o prosa, etiquetas japonesas y tokens de alta entropia.
- Deteccion de filtracion del system prompt por solapamiento de n-gramas, permitiendo frases que el propio prompt autoriza a decir.
- Verificacion de rechazos (`must_refuse`), incluyendo el caso de rechazo seguido de cumplimiento.
- Verificacion de anclaje factual (`grounded`) con derivaciones aritmeticas basicas.
- Verificacion de estabilidad entre muestras del mismo caso (`stable`).
- Registro de versiones de prompts, ejecucion de runs, comparacion entre runs y puerta de CI con veredicto (`block`).
- Soporte de dos idiomas en los checks y paquetes: ingles y japones (incluye un pack de negocio japones).
- Ejecucion en una sola CPU y apta para entornos sin GPU y, segun el diseno, sin llamadas a servicios externos.

## Casos de uso

- Puerta de CI/CD para prompts: usando `registry.publish`, `score_run` y `gate`, se puntua una version base y una candidata sobre los mismos casos dorados y se bloquea el despliegue si la candidata empeora; en el ejemplo de la model card, la publicacion de `support@1.1.0` que elimina la politica de contexto frente a `support@1.0.0` devuelve veredicto `block`.
- Regresion de guardrails de seguridad: el pack `safety-refusals` permite comprobar de forma repetible si el modelo rechaza peticiones peligrosas, con la advertencia de que el comprobador `must_refuse` solo acierta el 86,0 % en la evaluacion declarada.
- Proteccion de datos en asistentes de atencion al cliente: `no_pii` marca correos, telefonos y numeros de tarjeta en las respuestas; el ejemplo de la model card detecta `jane.doe@example.org` en una respuesta de reembolso y devuelve `fail` para el contrato `PII`.
- Verificacion de salidas para function calling y API: `json_valid` y `schema` validan la estructura esperada, reparando y registrando desviaciones frecuentes como bloques de codigo o comas finales, lo que encaja en pipelines que consumen JSON generado por el modelo.
- Auditoria de grounding en sistemas RAG: `grounded` comprueba que numeros, fechas, citas y nombres estan soportados por el contexto y admite derivaciones aritmeticas, lo que permite detectar afirmaciones no respaldadas por el material recuperado.
- Cumplimiento de privacidad en documentacion y codigo generados: `no_secrets` detecta prefijos de claves conocidas, JWT, credenciales embebidas en codigo, URL o prosa y tokens de alta entropia antes de publicar artefactos.
- Prevencion de filtracion de instrucciones: `no_system_leak` mide el solapamiento de n-gramas con el system prompt del caso, permitiendo las frases que el propio prompt indica decir al modelo.
- Control de calidad en producto japones: el pack `japanese-business` junto con la normalizacion NFKC permite aplicar los mismos contratos sobre texto en japones, incluidas etiquetas de credenciales y patrones de ancho completo.
- Deteccion de no determinismo: `stable` compara varias muestras del mismo caso y avisa cuando discrepan en longitud, formato o cifras, util para decidir si un prompt es apto para produccion.
- Despliegue en entornos restringidos o air-gapped: al ser un unico fichero Python con `pandas` como unica dependencia obligatoria y ejecutarse en un nucleo de CPU, puede integrarse en runners de CI sin GPU ni acceso a APIs de terceros.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en el `model-index` de la model card, sobre el split held-out de test de `NagaYu/canary-eval` (217 casos: 153 en ingles, 64 en japones, escritos despues de congelar el motor, reetiquetados a ciegas y evaluados una sola vez). No se incluyen resultados de comparacion con otros sistemas.

| Metrica | Resultado |
|---|---|
| Accuracy (model-index) | 0,963 (96,3 %) |
| Recall de violaciones (model-index, "fail recall") | 0,956 (95,6 %) |
| Accuracy global (217 casos) | 96,3 % (209 / 217) |
| Violaciones detectadas | 95,6 % (108 / 113) |
| Falsas alarmas sobre salidas limpias | 3,1 % (3 / 98) |
| `must_refuse` | 86,0 % (43 / 50) |
| `no_system_leak` | 95,8 % (23 / 24) |
| `no_pii`, `no_secrets`, `grounded`, `json_valid`, `schema`, `must_contain`, `must_not_contain`, `stable` y longitud | 100 % (143 casos) |

Fallos conocidos de `must_refuse` documentados por el autor: una palabra de redireccion dentro de una frase que si cumple ("log in from **your own** device"), instrucciones en modo condicional ("you'd paraphrase ..."), pasos numerados escritos en una sola linea y un 「できません。」 japones sin mas contexto que no se reconocio como rechazo. Los ocho fallos estan listados en el dataset card.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el sistema no ejecuta redes neuronales y no requiere GPU.
- GPU recomendadas: ninguna; el diseno declara ejecucion en un nucleo de CPU.
- Compatibilidad con GPU de consumo: no aplica, no necesita GPU (tampoco necesita una GPU de gama alta ni aceleradores).
- Requisitos de software: Python con `pandas` como dependencia obligatoria y `huggingface_hub` como opcional para descargar `canary.py` y los packs; importa sin Gradio, aunque `canary.py` es byte a byte identico al `app.py` de la build de Gradio.
- Opciones de despliegue: script Python invocado directamente (no por stdin), integracion en runners de CI, uso embebido mediante `import canary`, o la aplicacion Gradio asociada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Latencia y throughput: no disponible en la informacion proporcionada. El unico limite temporal documentado es el de 2 segundos por check de regex ejecutado en un proceso trabajador separado.
- Limitacion de aislamiento: en macOS y Windows el proceso trabajador reimporta el script principal, por lo que conviene lanzarlo como fichero; si el trabajador no arranca, los checks de regex devuelven `error`.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de benchmarks comparativos con otras herramientas, ni parametros, contexto o rendimiento de alternativas. canary-contracts no compite con modelos generativos, sino con herramientas de validacion de salidas. La tabla siguiente recoge unicamente el enfoque funcional como referencia de categoria, marcando como "no disponible" todo dato no verificado:

| Herramienta | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| canary-contracts | Reglas deterministas, 12 comprobadores, ejecucion en CPU | no aplica | no aplica | Apache-2.0 | HuggingFace y GitHub |
| Guardrails AI | Validadores programaticos sobre salidas de LLM | no disponible | no disponible | no disponible | no disponible |
| NVIDIA NeMo Guardrails | Orquestacion de guardrails y flujos de dialogo | no disponible | no disponible | no disponible | no disponible |
| Juez LLM (p. ej. Prometheus o similares) | Evaluacion semantica mediante un modelo generativo | no disponible | no disponible | no disponible | no disponible |

Diferencias cualitativas que si se desprenden de la documentacion: canary-contracts es determinista y no usa un LLM como juez, se ejecuta en CPU y publica sus veredictos con evidencia; frente a un juez LLM, no depende de inferencia ni de red, pero tampoco realiza comprension semantica, lo que explica el 86,0 % en `must_refuse`.

## Limitaciones y advertencias

- No es un modelo generativo ni una red neuronal: no hay pesos, `config.json` ni cuantizaciones, por lo que no debe evaluarse como un LLM.
- `must_refuse` es el punto debil declarado: 86,0 % (43 / 50). El autor advierte de que los rechazos son semanticos y que una lista de frases mas heuristicas de cumplimiento puede sortearse; los fallos conocidos estan documentados.
- Riesgo de evadir los checks: al basarse en regex, listas de frases y heuristicas, un atacante o un cambio de redaccion puede producir falsos negativos, especialmente en `no_system_leak`, `grounded` y `must_refuse`.
- Falsas alarmas: 3,1 % (3 / 98) sobre salidas limpias, lo que puede bloquear despliegues validos en una puerta de CI.
- Los estados `error` y `skipped` nunca se cuentan como `pass`, pero tampoco como `fail`: una integracion que solo compruebe el numero de fallos puede interpretar mal estos casos.
- Limitacion de idioma: solo ingles y japones estan soportados y evaluados; no hay datos de rendimiento en castellano ni en otros idiomas.
- Ejecucion de regex con limite: las expresiones del usuario corren en un proceso trabajador con 2 segundos de limite y devuelven `error` si este no arranca; en macOS y Windows hay que ejecutar el codigo como fichero, no por stdin.
- Cobertura de evaluacion limitada: 217 casos (153 en ingles y 64 en japones), con solo 113 violaciones y 50 casos de `must_refuse`, por lo que las metricas tienen intervalos de confianza amplios.
- Datos no verificados: las metricas del `model-index` figuran con `verified: false`, es decir, son declaraciones del autor y no una evaluacion independiente.
- Adopcion no contrastada: 0 descargas y 0 likes en HuggingFace en la fecha de actualizacion, sin evidencia publica de uso en produccion.
- Licencia: Apache-2.0, que permite uso comercial, pero conviene revisar los terminos de los datos de evaluacion (`NagaYu/canary-eval`) si se reutilizan sus casos.
- La model card no documenta sesgos especificos ni tasas de alucinacion del propio artefacto; al no generar texto, la alucinacion aplica a los sistemas evaluados, no al motor.
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los resultados obtenidos eran contenido no pertinente y de caracter adulto, sin relacion con el artefacto, por lo que no se han usado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NagaYu/canary-contracts
- Dataset de evaluacion: https://huggingface.co/datasets/NagaYu/canary-eval
- Listado de los ocho fallos de `must_refuse`: https://huggingface.co/datasets/NagaYu/canary-eval#every-miss
- Repositorio del proyecto Canary: https://github.com/NagaYu/canary
- Especificacion completa de los contratos y heuristicas: https://github.com/NagaYu/canary#contracts
- Resultados de evaluacion incluidos en el repositorio del modelo: `eval_results_test.json`, `eval_results_dev.json`
- Ejemplo de uso: `examples/quickstart.py`
- Busqueda web: sin resultados relevantes para este modelo.
