# albones80/route-optimizer

## Resumen

RouteOptimizer no es un modelo de aprendizaje automatico: es un conjunto de herramientas de investigacion operativa para planificacion de flotas de camiones en minas. El repositorio de HuggingFace no contiene pesos, checkpoints ni red neuronal alguna; lo que se publica son escenarios de ejemplo en JSON, la especificacion del formato de escenario y las instrucciones para instalar el solver, cuyo codigo vive en GitHub. Lo desarrolla Alfonso Bonillas (alioit.com) bajo licencia MIT.

La herramienta cubre dos tareas: un despacho de camiones mediante busqueda A\*, que construye un plan de movimiento a lo largo de un horizonte de turno, y un plan de turno completo formulado como programa lineal entero mixto (MILP) y resuelto con PuLP y el solver CBC, ambos de codigo abierto. El paquete se distribuye como instalacion pip (version 0.1.0) con tres scripts de consola (`route-optimizer`, `route-optimizer-dispatch`, `route-optimizer-shift-plan`) y como imagen Docker construida desde el mismo repositorio.

Su relevancia es acotada pero concreta: permite reproducir y auditar planes de acarreo minero sin licencias de solvers comerciales (Gurobi, CPLEX), sin conexion de red en tiempo de ejecucion y sin depender de bases de datos SQL Server ni telematica en vivo. Es material de partida para quien quiera evaluar formulaciones MILP de despacho de flota, no un componente listo para produccion: el propio autor advierte que no incluye bases de datos de acarreo reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; dos componentes algoritmicos: busqueda A\* (dispatch) y MILP resuelto con PuLP + CBC (shift plan) |
| Parametros totales | no aplica; no hay pesos entrenados ni parametros de red |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el alcance lo fija el horizonte de turno y el numero de segmentos del escenario |
| Tipos de cuantizacion | no disponible (no hay pesos que cuantizar) |
| Idiomas soportados | no disponible; la interfaz es una CLI y el formato de escenario es JSON con unidades en toneladas, horas y minutos |
| Licencia | MIT |
| Formato de pesos | no aplica; el artefacto publicado son ficheros JSON de escenario y resultados |
| Version del paquete | 0.1.0 (segun `pyproject.toml` y el tag de la imagen Docker) |
| Entrada / salida | JSON local de escenario (formato version "1") como entrada; JSON de resultado como salida |
| Dependencia principal | `PuLP>=2.7,<3` (solver CBC incluido) |
| Ejecutables | `route-optimizer`, `route-optimizer-dispatch`, `route-optimizer-shift-plan`, imagen `route-optimizer:0.1.0` |
| Red en tiempo de ejecucion | ninguna; el ejemplo Docker usa `--network=none` |
| Fecha de publicacion en HuggingFace | 2026-10-25 |

## Arquitectura y entrenamiento

No existe fase de entrenamiento. El repositorio declara explicitamente que no hay pesos entrenados, checkpoints ni red neuronal que descargar, y que la herramienta no entrena ni sirve modelos de ML. El primer componente, el despacho, aplica busqueda A\* para construir un plan de movimiento de camiones sobre un horizonte de turno a partir de un escenario JSON, parametrizable por numero de segmentos, numero de camiones y, opcionalmente, un limite de tiempo de reloj de pared (`--time-limit`). El segundo componente formula un plan de flujo de camiones a escala de mina como MILP y lo resuelve con PuLP sobre CBC, sin requerir Gurobi, CPLEX ni otro solver comercial.

Los datos que acompanan al paquete son dos escenarios sinteticos: `samples/tiny_feasible.json`, una mina pequena en la que tanto el despacho como el shift plan terminan con exito rapidamente, y `samples/toy_mine.json`, una mina de juguete sintetica mayor usada por el fixture del repositorio (despacho con 58 segmentos y 21 camiones en el ejemplo de la model card). El autor indica que una segunda muestra anonimizada de historial de acarreo no se publicara hasta que el propietario de los datos apruebe su liberacion. No se documentan innovaciones tipo decodificacion especulativa, attention lineal ni tecnicas de RLHF/DPO, porque no aplican a este tipo de artefacto.

## Capacidades

- Despacho de camiones mediante A\*: genera un plan de movimiento sobre un horizonte de turno desde un fichero de escenario JSON.
- Planificacion de turno mediante MILP: resuelve un plan de flujo de camiones a escala de mina con PuLP + CBC.
- Control de esfuerzo computacional: parametros `--segments`, `--trucks` y `--time-limit` para acotar tamano del problema y tiempo de resolucion.
- Ejecucion totalmente offline: los escenarios se leen en local y los resultados se escriben en local; no hay llamadas a SQL Server ni a la red en tiempo de ejecucion.
- Despliegue reproducible: paquete pip instalable desde GitHub y receta Docker con carpeta montada y red deshabilitada.
- Definicion formal del formato de escenario (version "1", unidades en toneladas, horas y minutos) documentada en `docs/scenario-format.md`.
- No soporta tool calling ni function calling de un LLM, ni razonamiento multi-paso en el sentido de un agente: son scripts de consola con entradas y salidas JSON.
- No incluye vision, audio, generacion de texto ni capacidades multilingues.

## Casos de uso

- Planificacion de turno en mina a cielo abierto: el shift plan MILP toma un escenario con segmentos y flota y devuelve un plan de flujo de camiones para el turno, util para comparar asignaciones antes de aplicar cambios en operacion.
- Despacho de flota a corto plazo: el comando `dispatch` con `--segments` y `--trucks` ajustados al turno produce un plan de movimiento concreto que se puede revisar manualmente antes de trasladarlo al sistema de despacho real.
- Analisis de compromiso tiempo/calidad: el parametro `--time-limit` permite lanzar instancias mayores (por ejemplo 58 segmentos y 21 camiones con 60 segundos de tope) y medir que plan se obtiene bajo una restriccion de reloj, algo habitual en ventanas operativas estrictas.
- Evaluacion de formulaciones MILP en investigacion: sirve como banco de pruebas reproducible para comparar formulaciones de routing y asignacion con un solver open source, sin incurrir en licencias comerciales.
- Integracion en pipelines de CI: al ser una CLI con entrada y salida JSON y ejecutable en un contenedor sin red, se puede encadenar en tests de regresion que verifiquen que un escenario sigue produciendo un plan factible tras cambios en el codigo.
- Docencia de investigacion operativa: los escenarios `tiny_feasible.json` y `toy_mine.json` permiten ilustrar la diferencia entre una busqueda heuristica (A\*) y una formulacion exacta (MILP) sobre el mismo problema de acarreo.
- Entornos aislados o air-gapped: al no requerir red ni solver comercial, encaja en instalaciones on-premise con restricciones de conectividad donde no se pueden introducir dependencias externas.
- Preestudio de escenarios what-if: modificando el JSON de escenario se pueden comparar configuraciones de flota y segmentos antes de comprometer recursos, siempre que los datos de entrada esten construidos por el equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de solucion (gap respecto al optimo, funcion objetivo, tiempos de resolucion) ni comparaciones cifradas con otros solvers. Lo unico documentado son ejemplos de invocacion: `tiny_feasible.json` con `--segments 8 --trucks 2` para despacho y `--segments 4` para shift plan (descritos como exitosos y rapidos, sin cifras), y `toy_mine.json` con `--segments 58 --trucks 21 --time-limit 60`, donde el limite de 60 segundos es una cota configurable, no un tiempo medido.

## Requisitos de hardware

- VRAM estimada: ninguna; el artefacto no usa GPU.
- GPU recomendadas: no aplica. El cuello de botella es CPU monohilo/multihilo del solver CBC y la memoria RAM del arbol branch-and-bound.
- Cabe en cualquier equipo consumer: si, es ejecutable en portatil convencional; el propio proyecto se distribuye como paquete Python con `pip install .`.
- Memoria RAM: no disponible; no se publica consumo para los escenarios de ejemplo. En MILP, el consumo crece con el numero de segmentos, camiones y variables binarias del escenario.
- Opciones de despliegue: instalacion pip desde GitHub (`pip install git+https://github.com/AlfonsoALIO/RouteOptimizer.git`), clonado e instalacion local (`pip install .`) e imagen Docker `route-optimizer:0.1.0` construida con `scripts/build_docker.sh`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican.
- Aislamiento: el ejemplo oficial ejecuta el contenedor con `--network=none` y volumenes de solo lectura para los escenarios.
- Latencia y throughput: no disponibles. La unica referencia temporal es el parametro `--time-limit` en segundos, que acota la resolucion pero no informa de rendimiento publicado.

## Comparativa con modelos similares

| Herramienta | Tipo | Licencia | Contexto / escala | Datos publicados | Notas |
|---|---|---|---|---|---|
| RouteOptimizer | A\* + MILP (PuLP/CBC) para acarreo minero | MIT | Horizonte de turno; escenarios de 8 a 58 segmentos en los ejemplos | Dos escenarios sinteticos, sin metricas | Especifico de dominio (mineria), CLI JSON, offline |
| Google OR-Tools | Suite de optimizacion (CP-SAT, routing, LP/MILP) | Apache 2.0 | Generica, escalable a problemas grandes | Amplia documentacion y ejemplos | Mucho mas amplio en alcance; no incluye un modelo de escenario minero |
| HiGHS | Solver LP/MILP de alto rendimiento | MIT | Generico, orientado a LP/MILP | Benchmarks publicos del propio proyecto | Se usaria como backend de un modelo; no aporta formulacion de despacho |
| Gurobi / CPLEX | Solvers MILP comerciales | Comercial (licencia de pago) | Generico, instancias grandes | Benchmarks publicos | RouteOptimizer evita explicitamente esta dependencia |

No se dispone de datos de rendimiento comparables entre estas herramientas dentro de la informacion proporcionada; la comparacion es de alcance, licencia y modelo de despliegue, no de velocidad ni calidad de solucion.

## Limitaciones y advertencias

- No es un modelo de IA: no hay pesos, no se puede evaluar con MMLU, HumanEval ni GSM8K, y no debe presentarse como modelo de lenguaje en catalogos de modelos.
- No incluye bases de datos de acarreo en produccion ni telematica en vivo; los escenarios publicos son sinteticos o de juguete.
- La segunda muestra anonimizada de historial de acarreo no esta publicada y depende de la aprobacion del propietario de los datos; no se puede asumir su disponibilidad.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad de las soluciones, gap respecto al optimo ni tiempos de resolucion. Cualquier afirmacion de rendimiento seria no verificada.
- La formulacion MILP resuelta con CBC puede degradarse en instancias grandes; el parametro `--time-limit` existe precisamente para acotar el tiempo, lo que implica que el plan devuelto puede no ser optimo.
- El modelo de datos es propio: hay que convertir los datos de la operacion al formato de escenario version "1" (toneladas, horas, minutos). No se documentan importadores desde sistemas de mina.
- Sin interfaz grafica, sin API HTTP y sin SDK: la integracion es por CLI, ficheros JSON o contenedor.
- Sin soporte multilingue ni localizacion; la documentacion esta en ingles.
- Riesgo de alucinacion: no aplica al no haber componente generativo. El riesgo equivalente es formular mal el escenario y obtener un plan factible para un problema que no representa la realidad.
- Licencia MIT: permite uso comercial, modificacion y redistribucion conservando el aviso de copyright (Alfonso Bonillas / alioit.com). No se documentan restricciones adicionales.
- Version 0.1.0 con fecha de publicacion muy reciente: no hay historial de mantenimiento, issues resueltos ni comunidad (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/albones80/route-optimizer
- Codigo fuente e instalacion pip: https://github.com/AlfonsoALIO/RouteOptimizer
- Script de construccion Docker: https://github.com/AlfonsoALIO/RouteOptimizer/blob/master/scripts/build_docker.sh
- Formato de escenario: `docs/scenario-format.md` dentro del repositorio
- Licencia MIT: fichero `LICENSE` en el repositorio
- Sitio del autor: http://www.alioit.com
- Escenarios de ejemplo: `samples/tiny_feasible.json` y `samples/toy_mine.json` en el repositorio
- Los resultados de busqueda web proporcionados no son relevantes para este artefacto: son hilos de Zhihu sobre Visual Studio Code y Microsoft Visual C++ Runtime Library, sin relacion con RouteOptimizer.
