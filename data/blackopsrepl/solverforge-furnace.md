# blackopsrepl/solverforge-furnace

## Resumen

`solverforge-furnace` es una aplicación de planificación de recursos (scheduling) publicada por el usuario `blackopsrepl` en Hugging Face como Docker Space, no un modelo de inteligencia artificial generativa. Resuelve un problema concreto de la industria del tratamiento térmico: «dados unos hornos, unas órdenes de trabajo, unos operadores de tareas y un roster semanal de turnos, cuándo debe ejecutarse cada orden, en qué horno y qué operador realiza cada tarea manual». La respuesta se calcula con un motor de optimización por restricciones (SolverForge) escrito en Rust.

El artefacto es un único proceso que sirve a la vez las dependencias Rust, los recursos estáticos del navegador y las rutas de API Axum, con una interfaz web apoyada en el shell compartido `solverforge-ui`. El problema se modela con hechos de entrada (hornos, órdenes, operadores, turnos y demandas de cobertura) y dos entidades de planificación: `FurnaceAssignment` (una decisión de lote por orden, con horno, franja de 15 minutos y cuatro variables de tarea) y `OperatorShiftAssignment` (una fila por operador y día, con turno Morning, Afternoon, Night u Off). La solución se puntúa con un `HardSoftScore`.

Su relevancia es doble. Por un lado, es un ejemplo público y reproducible de modelado de un dominio industrial real (restricciones térmicas, de habilidad y de descanso) con un solver moderno. Por otro lado, sirve como caso de prueba para SolverForge: incluye un conjunto de datos determinista (`STANDARD`) con 11 hornos, 155 órdenes de trabajo, 39 operadores, 22 turnos y 44 demandas de cobertura. Es importante subrayar que no tiene parámetros, pesos, contexto, licencia de pesos ni capacidades lingüísticas: las secciones habituales de una ficha de modelo se marcan en consecuencia como no aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal. Aplicación de optimización de restricciones en Rust (Axum + `solverforge` 0.19.4 + `solverforge-ui` 0.6.5) |
| Parametros totales | No aplicable (no hay pesos ni parámetros entrenables) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable. Horizonte de planificación de 7 días en minutos desde el lunes 00:00, con paso temporal de 15 minutos |
| Tipos de cuantizacion | No aplicable (no se distribuyen pesos) |
| Idiomas soportados | No disponible (la documentación y la interfaz se presentan en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplicable. Se distribuye como aplicación Docker y código fuente Rust; binario de release `solverforge-furnace` |
| Tipo de artefacto | Docker Space (SDK `docker`, `app_port` 7860) |
| Versión de Rust | 1.95 |
| Motor de resolución declarado | `solverforge` 0.19.4 |
| Metadatos de scaffold | `solverforge-cli` 2.2.2 en `solverforge.app.toml` |
| Entidades de planificación | `FurnaceAssignment`, `OperatorShiftAssignment` |
| Hechos del problema | `Furnace`, `WorkOrder`, `Operator`, `Shift`, `ShiftCoverageDemand` |
| Solución de planificación | `Plan`, con `HardSoftScore` |
| Conjunto de datos de demo | `STANDARD` determinista: 11 hornos, 155 órdenes, 39 operadores, 22 turnos, 44 demandas de cobertura |
| Semilla aleatoria | 42 (demo reproducible) |
| Criterio de parada | 45 segundos de resolución, o 12 segundos sin mejora |
| Interfaz | Navegador en `http://localhost:7860`, timeline de hornos, trabajos retenidos y vistas de roster |
| API | Rutas REST Axum bajo `/health`, `/info`, `/demo-data`, `/jobs` y subrutas, con eventos SSE |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No existe entrenamiento. El sistema formula el problema como un modelo de planificación con puntuación, no como un modelo estadístico. `Plan` es la solución de planificación e incorpora `solver.toml`, que actúa como fuente de verdad en tiempo de ejecución. La construcción se reparte en tres fases agrupadas: asignación de franjas de horno con `weakest_fit_decreasing`, asignación del roster de operadores con `cheapest_insertion` y asignación de operadores a tareas con `weakest_fit`; las tres usan `construction_obligation = "assign_when_candidate_exists"`. La búsqueda local es un descenso por vecindad variable (VND) que realiza reparación de restricciones duras con selectores de reparación de conflictos compuestos y escalares agrupados. La fase final es un pulido por recocido simulado con `decay_rate = 0.999985`, `hard_regression_policy = "never_accept_hard_regression"` y un forager de tipo `accepted_count` con `limit = 256`.

El dominio modela un proceso térmico: cada lote pasa por una rampa de calentamiento seguida de una etapa de mantenimiento (soak), y alrededor de cada lote se reservan cuatro tareas manuales relativas a su inicio y fin: carga/montaje (load/build), programación (program), temple (quench, cuando el proceso lo requiere) y descarga (unload). Las restricciones duras exigen que toda orden quede programada; que el horno soporte proceso, temperatura y carga; que el lote termine dentro del horizonte de siete días; que no haya solapes en el mismo horno y se respete el intervalo de cambio térmico; que cada ventana de tarea pertenezca a un único turno; que toda tarea tenga operador con la habilidad requerida y esté en el turno propietario; que no haya doble reserva de operador; que se cubran las demandas `(shift, role)`; que la capacidad de monitorización cubra rampa, soak y carga de tareas en cada franja de 15 minutos; y que se respeten restricciones de descanso, prohibición de turnos nocturnos para operadores diurnos y límites semanales de turnos visibles y noches consecutivas. Las restricciones blandas penalizan el retraso ponderado por prioridad (Express, Urgent, Standard), el coste de cambio térmico, la finalización temprana excesiva, los arranques nocturnos en trabajos no cementantes ni nitrurantes, las horas extra y el desequilibrio de turnos entre operadores.

## Capacidades

- Programación simultánea de lotes en 11 hornos con restricciones de compatibilidad de proceso, temperatura y carga.
- Gestión de la secuencia térmica: rampa de calentamiento, mantenimiento y separación mínima entre lotes por cambio térmico.
- Generación de un roster semanal de operadores con cuatro estados de turno (Morning, Afternoon, Night, Off) y reglas de descanso y de noches consecutivas.
- Asignación de operadores a cuatro tipos de tarea manual (load/build, program, quench, unload) según habilidad y turno propietario de la ventana.
- Cobertura de demandas de plantilla por par `(turno, rol)`.
- Optimización multiobjetivo con prioridades de orden (Express, Urgent, Standard) y coste ponderado por retraso.
- Ejecución determinista de la demo mediante `random_seed = 42`.
- Ciclo de vida de trabajos de resolución vía API: creación (`POST /jobs`), consulta, pausa, reanudación, cancelación y borrado.
- Inspección en caliente: `snapshot` y `analysis` con revisión opcional (`snapshot_revision={n}`) y análisis por restricción concreta (`/analysis/{constraint_name}`).
- Seguimiento en directo mediante Server-Sent Events: un evento de arranque (bootstrap) seguido de eventos de trabajos retenidos.
- Interfaz de navegador con timeline de programación de hornos, vista de trabajos retenidos y vistas de roster de operadores.
- Validación automatizada: `make test` (tests Rust, comprobación de sintaxis del frontend y smoke test de navegador con Playwright), `make ci-local` y `make test-slow` (resolución de aceptación lenta).
- No dispone de generación de texto, razonamiento conversacional, código, matemáticas, visión, audio, tool calling ni capacidades de agente.

## Casos de uso

- Planificación semanal de una planta de tratamiento térmico: introducir hornos, órdenes y roster y obtener la asignación de horno, franja de 15 minutos y operadores por lote. Es el caso para el que está diseñado y el que cubre el conjunto `STANDARD`.
- Elaboración de turnos de planta: el modelo decide Morning, Afternoon, Night u Off por operador y día, respetando descanso mínimo y límites de noches consecutivas, lo que sustituye hojas de cálculo manuales.
- Cobertura de roles críticos: mediante las demandas `(shift, role)` y la restricción dura asociada, se garantiza que cada turno tenga el personal requerido antes de publicar el roster.
- Replanificación ante incidencias en producción: usando trabajos retenidos con `pause`, `resume` y `cancel`, más la consulta de `snapshot`, se puede recalcular la programación cuando un horno cae o una orden cambia de prioridad.
- Diagnóstico de cuellos de botella: el endpoint `/jobs/{id}/analysis` y el desglose por restricción (`/analysis/{constraint_name}`) permiten identificar qué restricciones duras o blandas dominan la puntuación y ajustar políticas.
- Integración con MES/ERP: la API REST y los eventos SSE permiten enviar el plan a sistemas de ejecución de planta y reflejar cambios en tiempo real sin depender de la interfaz web.
- Análisis de escenarios (what-if): comparando instantáneas de distintas revisiones (`snapshot_revision`) se puede evaluar el efecto de añadir un horno, cambiar la demanda de cobertura o modificar prioridades de órdenes.
- Evaluación y desarrollo de políticas de solver: al ser un caso público con datos deterministas y semilla fija, sirve para comparar fases de construcción, selectores de vecindad y parámetros de recocido simulado de SolverForge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas ni métricas de calidad del plan (por ejemplo, valor final de `HardSoftScore`). Los únicos datos de rendimiento declarados son:

| Dato | Valor |
|---|---|
| Criterio de parada de resolución | 45 segundos, o 12 segundos sin mejora |
| Semilla de la demo | 42 (reproducible) |
| Instancia pública | 11 hornos, 155 órdenes de trabajo, 39 operadores, 22 turnos, 44 demandas de cobertura |
| Test de aceptación lento | Espera alcanzar factibilidad dura partiendo de la instancia pública completamente sin asignar |
| Criterio de aceptación del recocido | `hard_regression_policy = "never_accept_hard_regression"` |
| Forager de aceptación | `accepted_count`, `limit = 256` |
| Decaimiento del recocido | `decay_rate = 0.999985` |

## Requisitos de hardware

- VRAM para inferencia: no aplicable. No hay pesos ni inferencia neuronal; el proceso es una aplicación Rust con búsqueda local y recocido simulado que se ejecuta en CPU.
- GPU recomendadas: no aplicable. No se documenta ningún requisito de GPU (A100, H100, RTX 4090 ni otras).
- Ejecución en hardware de consumo: sí. Al no requerir GPU, es ejecutable en un equipo de desarrollo convencional; el Docker Space se sirve en el puerto 7860.
- Toolchain necesaria: Rust 1.95, según el `Dockerfile` que construye la imagen del Space. También se requieren las dependencias de crates.io declaradas (`solverforge` 0.19.4, `solverforge-ui` 0.6.5, `solverforge-cli` 2.2.2).
- Opciones de despliegue: `make run-release` en local, Docker con el `Dockerfile` incluido, Docker Space de Hugging Face, y `make help` para inspeccionar la superficie de comandos disponible. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponible. El único límite temporal conocido es el de resolución (hasta 45 segundos, o 12 segundos sin mejora). No se publican métricas de latencia de API ni de peticiones por segundo.
- Requisitos de validación: `make test` ejecuta tests Rust, comprobación de sintaxis del frontend y un smoke test de navegador con Playwright, lo que implica disponer de un entorno de navegador para la validación completa.

## Comparativa con modelos similares

No disponible. El artefacto no es un modelo de lenguaje ni un modelo multimodal, por lo que no procede compararlo con alternativas de la misma categoría en términos de parámetros, contexto o benchmarks de tareas lingüísticas. La información proporcionada tampoco incluye comparaciones con otros solvers de restricciones (por ejemplo, motores de planificación basados en puntuación o solvers CP-SAT), ni datos de licencia, versión o rendimiento de esos posibles alternativas. Los enlaces devueltos por la búsqueda web corresponden a páginas de seguimiento de envíos de UPS y no guardan relación con este proyecto, por lo que no aportan material comparativo.

## Limitaciones y advertencias

- No es un modelo de IA generativa: no tiene pesos, no se descarga en safetensors ni GGUF y no se puede cargar en vLLM, llama.cpp, Ollama o TGI. Cualquier expectativa de uso como LLM es incorrecta.
- Tracción nula verificable: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y sin idiomas declarados. No hay evidencia de uso en producción ni de validación por terceros.
- La model card proporcionada está truncada: la sección de validación termina a mitad de frase («`make ci-local` add»), por lo que no se puede verificar el contenido completo de la documentación del autor.
- Fechas de metadatos inusuales: creación y actualización declaradas como 2026-09-18, con un segundo de diferencia entre ambas. No se puede verificar su exactitud.
- Semilla fija: la demo usa `random_seed = 42` para ser reproducible; cambiar la semilla altera la solución, algo relevante si se compara el rendimiento entre ejecuciones.
- Un único conjunto de datos: `STANDARD` es determinista y de tamaño medio (155 órdenes, 39 operadores). No está claro que represente la variabilidad de plantas reales, ni se documentan otros datasets.
- El solver es heurístico con límite temporal: no garantiza optimalidad y puede terminar con penalizaciones blandas. Además, si las restricciones duras no son satisfacibles (por ejemplo, capacidad de hornos o de personal insuficiente), el plan puede quedar infactible.
- Rendimiento no medido públicamente: no hay benchmarks de calidad de plan (valor de `HardSoftScore` alcanzado en la instancia pública), ni comparación con planificación manual u otros solvers.
- Idioma: no se declaran idiomas soportados; la documentación y la interfaz se presentan en inglés.
- Licencia: el proyecto se declara Apache-2.0, lo que permite uso comercial del código de este repositorio, pero las licencias de las dependencias de crates.io (`solverforge`, `solverforge-ui`, `solverforge-cli`) no se detallan en la información disponible y deben verificarse por separado.
- Superficie de API sin autenticación documentada: se exponen rutas de escritura (`POST /jobs`, `POST /jobs/{id}/pause`, `POST /jobs/{id}/resume`, `POST /jobs/{id}/cancel`, `DELETE /jobs/{id}`) sin que la información mencione mecanismos de autenticación o control de acceso. Desplegarlo tal cual en una red expuesta conlleva riesgo.
- No se documentan medidas de persistencia o de recuperación ante fallos de los trabajos de resolución, ni límites de concurrencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blackopsrepl/solverforge-furnace
- Documentación referenciada en la model card (rutas relativas dentro del repositorio, sin URL absoluta disponible): `README.md` (inicio rápido, conceptos del modelo, validación, API REST y política del solver), `WIREFRAME.md` (arquitectura y flujo de datos entre backend, runtime y UI), `AGENTS.md` (reglas de mantenimiento y validación), `Makefile` (comandos locales, Docker y Space), `Dockerfile` (imagen del Space con Rust 1.95).
- Captura de pantalla referenciada: `docs/screenshot.png` (ruta relativa del repositorio).
- Papers, blogs, repositorios externos, demos o páginas de documentación adicionales: no disponibles en la información proporcionada.
- Resultados de la búsqueda web: no relevantes. Corresponden a páginas de seguimiento de envíos de UPS (Estados Unidos, Reino Unido, Alemania y Francia) y no contienen información sobre este proyecto.
