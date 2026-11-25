# nexiloopofficial/nexi-cua

## Resumen

NEXI-CUA es una capa de control ("driver") para automatizacion de navegador y escritorio que combina un bucle determinista de observacion, decision, actuacion y verificacion. El autor es nexiloopofficial y el modelo se publica bajo licencia Apache 2.0. No se trata de un LLM generativo de gran tamano, sino de un componente ligero que delega la fase de decision en un modelo externo muy pequeno, NEXI-S1, de 1,14 millones de parametros y aproximadamente 300 ms por decision.

El problema que aborda es el coste y la opacidad de los frameworks de computer-use basados en llamadas a LLM en la nube: NEXI-CUA propone un driver local, offline y gratuito con puertas de seguridad deterministas entre la decision y la accion. Segun la model card, el consumo maximo de memoria residente del driver es de 8,5 MB en una pagina con 100 candidatos, con las decisiones servidas por S1 como servicio separado.

Es relevante por su enfoque de "modelo de decision local minimo + barreras deterministicas" frente a alternativas que solo publican capas de orquestacion. La informacion disponible no incluye arquitectura de red, contexto ni datos de entrenamiento del propio driver, por lo que muchos campos tecnicos quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (driver de computer-use con bucle observar-decidir-actuar-verificar; la decision la resuelve NEXI-S1) |
| Parametros totales | No disponible para el driver; el modelo de decision NEXI-S1 tiene 1,14 M de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

La arquitectura descrita no es la de un transformer generativo, sino la de un driver de automatizacion: observa el DOM y lo convierte en candidatos tipados, invoca a NEXI-S1 (1,14 M de parametros, ~300 ms por decision) para elegir la accion, aplica puertas de seguridad deterministicas, ejecuta la accion y verifica el resultado. El driver es invocable mediante MCP (Model Context Protocol) y soporta multiples agentes que controlan pestanas o ventanas en paralelo, cada uno con su propio cursor visible de color.

No se han publicado en la informacion disponible datos sobre el conjunto de entrenamiento de NEXI-S1 (numero de tokens, composicion, uso de RLHF o DPO), ni sobre innovaciones de atencion o decodificacion. El diseno destacable es la separacion entre el modelo de decision (pequeno y local) y las barreras deterministicas de seguridad, que vetan acciones como envios de pago salvo autorizacion explicita del objetivo.

## Capacidades

- Automatizacion de navegador y escritorio: observacion del DOM, generacion de candidatos tipados y ejecucion de acciones sobre elementos de la pagina.
- Bucle de decision con verificacion posterior de cada accion.
- Puertas de seguridad deterministicas: veto duro de campos de pago y de envio salvo que el objetivo autorice explicitamente el pago.
- Multiagente: varios agentes controlando pestanas y ventanas en paralelo con cursores visibles diferenciados y sin conflictos registrados.
- Invocacion mediante MCP (MCP-callable), lo que permite integrarlo en orquestadores de agentes.
- Tareas semanticas de un solo paso sobre DOM reales: escribir en un buscador, seleccionar un vuelo, elegir un color.
- Ejecucion local y offline, sin dependencia de LLM en la nube para la fase de decision.

## Casos de uso

- Automatizacion de tareas web repetitivas: rellenar formularios de busqueda, seleccionar opciones en listas y confirmar estados, usando el bucle observar-decidir-actuar con verificacion para evitar acciones erroneas.
- Reserva de vuelos y formularios multipaso: la model card documenta un caso Melbourne-Delhi hasta el paso de tarjeta; es adecuado para flujos donde se quiere parada obligatoria antes del pago.
- Agentes de navegacion en paralelo: varios agentes con cursores propios operando en pestanas y ventanas distintas, util para comparar precios o recopilar datos de varias fuentes a la vez.
- Integracion en pipelines de agentes via MCP: un orquestador externo puede delegar la ejecucion de acciones de navegador en NEXI-CUA manteniendo la logica de decision en el servicio S1.
- Entornos con requisitos de privacidad: al ser local y offline, permite automatizar navegacion sobre datos sensibles sin enviar el DOM a APIs externas.
- Pruebas de regresion de interfaces web: el driver puede ejecutar secuencias de acciones semanticas sobre DOM reales y verificar el resultado, util para validar flujos de usuario en CI.
- Prototipado de asistentes de escritorio: al ser un componente ligero (8,5 MB de RSS en el escenario medido), se puede embeber en herramientas de escritorio sin infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (OSWorld, WebArena, MMLU, HumanEval, GSM8K) en la informacion disponible. La model card indica que las alternativas comparadas no publican puntuaciones OSWorld/WebArena para un modelo de decision local y remite a `nexi-cua/BENCHMARKS.md` del repositorio para cifras y modos de fallo. Los datos medidos que si se mencionan son:

| Metrica | Valor |
|---|---|
| Memoria residente maxima del driver | 8,5 MB en pagina de 100 candidatos (decisiones servidas por S1) |
| Latencia de decision (NEXI-S1) | ~300 ms |
| Parametros del modelo de decision | 1,14 M |
| Tareas de un paso sobre DOM real | Pasa (escribir busqueda, seleccionar vuelo, elegir color) |
| Seguridad de pago | Veto duro verificado en aislamiento y en ejecuciones reales |
| Multiagente | 3 agentes en pestanas y ventana separada sin conflictos (registrado) |
| Reserva Melbourne-Delhi | Parcial hasta el paso de tarjeta, con imperfecciones documentadas (repeticion en campo de fecha, secuenciacion de formulario) |

## Requisitos de hardware

- VRAM: no aplica al driver, que es una capa de software; el modelo de decision NEXI-S1 (1,14 M de parametros) es ejecutable en CPU.
- GPU recomendadas: no se especifican; por tamano del modelo de decision, no requiere GPU dedicada.
- GPU de consumo: cabe en cualquier equipo por CPU; no se documentan requisitos de GPU.
- Memoria del sistema: 8,5 MB de RSS maximo medidos para el driver en una pagina de 100 candidatos.
- Opciones de despliegue: servicio local invocable por MCP; el modelo de decision se sirve como servicio separado. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: ~300 ms por decision segun la model card; no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| NEXI-CUA | Driver local de computer-use con modelo de decision minimo | 1,14 M (NEXI-S1) | No disponible | Apache 2.0 | Decision local + puertas deterministicas, offline |
| cua.ai (Cua Spaces) | Infraestructura de orquestacion de computer-use | No disponible | No disponible | No disponible | Orquestacion; decisiones via LLM en nube |
| agent-browser / agent-desktop | Herramientas de automatizacion | No disponible | No disponible | No disponible | Tooling de automatizacion sin modelo de decision propio |
| Browser Use | Framework de automatizacion guiado por LLM | No disponible | No disponible | No disponible | Decisiones mediante llamadas a LLM en nube |

La model card senala que ninguna de las alternativas publica puntuaciones OSWorld/WebArena para un modelo de decision local porque no incluyen uno. No se dispone de datos comparativos de rendimiento en tareas estandar.

## Limitaciones y advertencias

- Rendimiento parcial documentado: la reserva Melbourne-Delhi solo llega al paso de tarjeta y presenta imperfecciones (repeticion en el campo de fecha, secuenciacion del formulario).
- Cobertura limitada: las tareas probadas son de un solo paso sobre DOM reales; no se documentan resultados en flujos largos o en aplicaciones de escritorio complejas.
- Dependencia de un modelo de decision externo: la calidad depende de NEXI-S1, de 1,14 M de parametros, con capacidad limitada para tareas ambiguas.
- Sin datos de sesgo, alucinacion o multilingue: la informacion disponible no los cubre; los idiomas soportados figuran como no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los componentes de terceros del repositorio.
- Madurez temprana: 0 descargas y 0 likes en Hugging Face en el momento de la consulta; el proyecto se apoya en grabaciones y un repositorio de GitHub para su evidencia.
- Seguridad: las puertas deterministicas cubren pagos y envios, pero no se detallan otras acciones destructivas; en produccion conviene anadir verificaciones propias.

## Enlaces

- Hugging Face: https://huggingface.co/nexiloopofficial/nexi-cua
- Modelo de decision NEXI-S1: https://huggingface.co/nexiloopofficial/nexi-s1
- Repositorio y grabaciones: https://github.com/PupppyLoverr/NEXI-Models-Drivers
- Benchmarks y modos de fallo: https://github.com/PupppyLoverr/NEXI-Models-Drivers/blob/main/nexi-cua/BENCHMARKS.md
