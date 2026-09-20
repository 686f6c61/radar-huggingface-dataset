# rafw007/Qwen3.8-27B-redteam-abliterated

## Resumen

Qwen3.8-27B-redteam-abliterated es una distribucion en formato GGUF del modelo Qwen3.8-27B a la que se le han eliminado los mecanismos de rechazo mediante la tecnica conocida como abliteration, es decir, la supresion de la direccion de rechazo en el espacio de activaciones de los pesos. El modelo lo publica el usuario rafw007 en HuggingFace y su peso real en safetensors es de 27.320.697.856 parametros (unos 27,3 mil millones). No se trata de un reentrenamiento: el autor indica explicitamente que los pesos y la abliteration son trabajo de la comunidad sobre el modelo original de Qwen, y que el valor de la ficha esta en la configuracion medida y verificada, no en un entrenamiento nuevo.

Su proposito declarado es actuar como agente autonomo de red team y de administracion de sistemas, con llamadas a herramientas (concretamente una funcion `run_shell`) y una autorizacion de operador declarada en el system prompt. La configuracion probada se sirve con llama-swap sobre una ventana de contexto de 65.536 tokens, con endpoint compatible con OpenAI (`/v1/chat/completions`) y el identificador de modelo `qwen3.8-27b-redteam`.

Su relevancia actual es de tipo practico: el autor defiende que, ante la escasez y el encarecimiento de GPU y DDR5, un agente capaz de encadenar reconocimiento, diagnostico, recuperacion de acceso y endurecimiento posterior sobre hardware mini-PC con APU (Strix Halo, memoria unificada de 65-96 GB) es una alternativa viable sin granja de GPU. La medicion real de decodificacion ronda los 6,5-9 tok/s en prompts medios y cae de forma no lineal al crecer el contexto. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer denso; el autor no detalla la variante concreta) |
| Parametros totales | 27.320.697.856 (unos 27,3 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en la configuracion servida |
| Tipos de cuantizacion | GGUF con cuantizacion generada por imatrix; niveles concretos no disponibles (el repo de 16,6 GB equivale a unos 4,9 bits por parametro de media, compatible con Q4_K_M o Q5_K_S) |
| Idiomas soportados | en (ingles) |
| Licencia | other, con license_name: qwen (licencia de Qwen) |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del repositorio | 16,6 GB |
| Metodo de ajuste | abliteration sobre los pesos del modelo base (sin reentrenamiento) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-19 |

## Arquitectura y entrenamiento

No hay informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo se presenta como una variante de Qwen3.8-27B, un transformer denso de aproximadamente 27,3 mil millones de parametros, y el autor no especifica numero de capas, dimension del modelo, tipo de atencion ni composicion del dataset de entrenamiento original. Tampoco se documenta el proceso de entrenamiento del modelo base (numero de tokens, mezcla de datos, uso de RLHF o DPO), que corresponde al equipo de Qwen y no a esta publicacion.

La aportacion tecnica de esta publicacion es doble. Por un lado, la abliteration: la eliminacion de los guardarrailes de rechazo directamente en los pesos, sin pasar por ajuste fino supervisado ni por RLHF. Por otro, el trabajo de integracion, que es lo que el autor considera su contribucion principal: una configuracion validada con llama-swap, LiteLLM y un harness de herramientas, servida sobre APU Strix Halo con ROCm e ik_llama.cpp, junto con mediciones de velocidad de prefill y decodificacion en tareas reales y un mapa de comportamiento observado (resistencia a inyeccion de prompt, gestion de alucinaciones, llamadas a herramientas y limites eticos). El autor insiste en que el valor del documento es el conjunto medido y reproducible, no los pesos en si.

## Capacidades

- Generacion de texto conversacional en ingles, con historial de sesion mantenido a traves de la ventana de 65.536 tokens.
- Llamada a herramientas (tool calling) con el esquema estandar `tools` / `tool_calls` de la API compatible con OpenAI. En pruebas, genero JSON de llamada correcto y aplico alternativas sensatas cuando faltaba una herramienta (por ejemplo, `nc -zv` cuando `nmap` no estaba disponible).
- Escritura de codigo de sistemas bajo demanda: en una prueba en la que faltaban `smbclient` y `nmap`, escribio desde cero una implementacion en Python de negociacion SMB1 sobre socket crudo.
- Comportamiento agentico de varios pasos: encadeno reconocimiento de puertos, identificacion de servidor por banner y JavaScript, identificacion del host bajo iLO, inicio de sesion, diagnostico y cambio de estrategia de gestion de usuarios IPMI a `hponcfg`/RIBCL.
- Razonamiento operativo con autocorreccion: detecto que la gestion de usuarios por IPMI-over-KCS no estaba soportada en iLO4 y cambio de via sin insistir en el camino fallido.
- Iniciativa posterior a la tarea: tras recuperar el acceso, propuso por cuenta propia la rotacion de la contrasena al detectar que habia circulado en claro por comandos y registros de sesion.
- Resistencia a inyeccion de prompt: ignoro una instruccion `[SYSTEM OVERRIDE]` embebida en la salida simulada de un escaner, tratandola como datos y no como comando.
- Reconocimiento de alucinaciones: identifico un CVE inventado (CVE-2024-99999) como inexistente sin rellenar el hueco con una descripcion falsa.
- Sin soporte declarado de vision, audio, modo de razonamiento explicito ni funcionalidades multimodales.

## Casos de uso

- Pentesting controlado sobre infraestructura propia: el modelo puede encadenar reconocimiento de puertos, identificacion de servicios y una primera fase de explotacion bajo supervision humana, con registro obligatorio de cada comando ejecutado en el harness.
- Recuperacion de acceso a servidores de gestion fuera de banda: el caso documentado de recuperacion de acceso a un HP iLO 4 sin explotar CVE y sin fuerza bruta en la interfaz web es el escenario mas contrastado del modelo.
- Automatizacion de tareas de sysadmin con varios pasos: sirve para diagnosticos encadenados donde cada paso depende del resultado anterior, siempre que se trabaje por etapas y no con una unica tarea abierta.
- Asistente de codigo integrado en un agente de terminal: el autor confirma buen rendimiento con el agente de programacion Pi y con opencode, y compatibilidad funcional (aunque mas lenta) con Claude Code.
- Analisis de salidas de escaneres y triaje de hallazgos: puede recibir la salida de un escaner y producir un hallazgo redactado para informe, aprovechando su resistencia comprobada a instrucciones maliciosas embebidas en esos datos.
- Generacion de remediaciones y planes de endurecimiento: tras detectar un hallazgo, es capaz de proponer medidas concretas, como la rotacion inmediata de credenciales expuestas.
- Laboratorio de investigacion sobre alineacion y seguridad: por su condicion de modelo abliterated, es util para estudiar la degradacion de los mecanismos de rechazo y la eficacia de los limites impuestos externamente.
- Redaccion de scripts de automatizacion en Python para entornos donde faltan utilidades habituales, como demuestra el caso de la implementacion de SMB1 sobre socket crudo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar. Lo unico documentado son mediciones de velocidad e impresiones de comportamiento en tareas reales, que se recogen a continuacion tal como las publica el autor.

| Escenario | Prefill (tok/s) | Decodificacion (tok/s) | Notas |
|---|---|---|---|
| Prompt corto (5-10 tokens), modelo caliente | ~13-72 | ~3,4 | varianza alta |
| Prompt medio (~300-600 tokens) | ~35-45 | ~6,5-9 | ronda unica tipica |
| Tras inactividad prolongada | no disponible | no disponible | ~100 s de sobrecoste adicional; se sospecha descarga por inactividad en llama-swap, el `ttl` necesita correccion |
| Contexto acumulado grande (~5.300 tokens tras 18 rondas) | no disponible | no disponible | la consulta supero los 290 s sin respuesta; degradacion no lineal con el tamano del contexto |

## Requisitos de hardware

- Pesos: el repositorio ocupa 16,6 GB en GGUF, de modo que la inferencia necesita al menos esa cantidad de memoria para los pesos, mas la cache KV correspondiente a la ventana configurada.
- VRAM estimada: no disponible con precision. Para 65.536 tokens de contexto hay que sumar varios GB de cache KV a los 16,6 GB de pesos; el autor no publica la cifra exacta.
- GPU recomendadas: no hay recomendaciones oficiales de GPU de servidor. La configuracion probada funciona sobre APU, no sobre tarjetas dedicadas.
- Hardware validado: dos equipos con AMD Strix Halo. Geekom Mega con 65 GB de memoria de GPU asignada (backend LiteLLM `geekom/*`) y un mini-PC GMKtec con AMD Ryzen AI Max+, 96 GB de memoria unificada y ROCm con ik_llama.cpp, que actua a la vez como backend y como servidor del modelo de red team.
- Cabe en GPU de consumo: si, en el sentido de que la configuracion medida corre sobre memoria unificada de APU y no requiere GPU de servidor. No se documenta su comportamiento en tarjetas de consumo de 16-24 GB con contexto completo de 65.536 tokens.
- Opciones de despliegue: llama.cpp e ik_llama.cpp para la inferencia, llama-swap como gestor de servidores con expiracion configurable, LiteLLM como enrutador, y cualquier cliente compatible con la API de OpenAI apuntando a `/v1/chat/completions` con el modelo `qwen3.8-27b-redteam`. No se menciona soporte verificado de vLLM, TGI ni Ollama.
- Latencia y throughput medidos: decodificacion de 3,4 tok/s en el mejor caso con prompt corto y 6,5-9 tok/s con prompt medio; prefill de 13-72 tok/s con prompt corto y 35-45 tok/s con prompt medio. El autor advierte de degradacion no lineal al acumular contexto y de unos 100 s de sobrecoste tras inactividad prolongada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| rafw007/Qwen3.8-27B-redteam-abliterated | 27,3 mil millones | 65.536 tokens servidos | GGUF (imatrix) | other / qwen | Guardarrailes eliminados; configuracion de agente de red team medida por el autor; 0 descargas |
| Qwen/Qwen3.8-27B | 27,3 mil millones (mismo origen) | no disponible | no disponible en la informacion | licencia Qwen | Modelo base sin abliterar; conserva los rechazos originales |
| Otros derivados abliterated de la misma familia | no disponible | no disponible | habitualmente GGUF | variable | No hay datos en la informacion disponible para comparar rendimiento ni comportamiento |

## Limitaciones y advertencias

- Eliminacion de los guardarrailes de rechazo en los pesos: es un modelo sin censura por diseno y la propia ficha lo etiqueta como `not-for-all-audiences`. Debe tratarse como herramienta ofensiva y no como sistema seguro por si mismo.
- El autor advierte de que, aunque en sus pruebas el modelo mantuvo un limite duro ante una peticion explicita de ataque ilegal y lucrativo sin autorizacion, esto no constituye una garantia.
- Todo uso debe ir acompanado de supervision humana y de un harness con limites impuestos a nivel de infraestructura, no a nivel de prompt.
- Requisitos operativos indicados por el autor: registro de actividad, deduplicacion y limites forzados en el harness, recorte de contexto entre etapas y un `ttl` acotado en llama-swap para evitar que el modelo se descargue de memoria entre pasos de sesion.
- Rendimiento mejor con trabajo por etapas siguiendo un plan que con una unica tarea abierta y grande.
- Degradacion no lineal con el contexto: a partir de unos 5.300 tokens acumulados tras 18 rondas, una consulta supero los 290 s sin respuesta.
- Sobrecoste de unos 100 s tras inactividad prolongada, atribuido a la descarga por inactividad de llama-swap y pendiente de ajuste del `ttl`.
- Sesgos conocidos: no disponibles. No hay evaluacion de sesgos publicada para esta variante.
- Riesgo de alucinacion: el unico dato disponible es una prueba favorable (reconocimiento de un CVE inexistente), que no permite extrapolar a un perfil general de fiabilidad.
- Idioma: unicamente ingles declarado. No hay soporte multilingue documentado.
- Licencia: `other` con `license_name: qwen`. Las condiciones de uso comercial dependen de la licencia de Qwen aplicable al modelo base y a los pesos derivados, y deben verificarse antes de cualquier despliegue en produccion.
- El repositorio no tiene descargas ni likes, y la ficha no ha sido validada por terceros independientes; los resultados son autodeclarados por el autor.
- No se detallan los niveles de cuantizacion disponibles ni la arquitectura interna, lo que dificulta reproducir sus mediciones en otro hardware.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre su modelo base; los enlaces obtenidos correspondian a contenido sin relacion (una estacion de esqui en Austria) y se descartan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rafw007/Qwen3.8-27B-redteam-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog o repositorio del autor: no disponible
- Demo: no disponible
- Documentacion de llama-swap, llama.cpp, LiteLLM o ROCm: no referenciada en la informacion proporcionada
- Resultados de busqueda web: sin coincidencias relevantes; no se incluye ningun enlace adicional
