# Rick8444/nova-agent

## Resumen

Nova Agent (identificador `Rick8444/nova-agent`) no es un modelo de lenguaje con pesos entrenados, sino una capa de control de navegador para agentes LLM construida directamente sobre el Chrome DevTools Protocol (CDP). El propio autor lo indica de forma explícita en la model card: el repositorio contiene el código de ejecución, no pesos de modelo. Expone navegación, observación de la página, clic, escritura y sondeo de estructura (`survey`) como una pequeña API HTTP en `localhost:4243` que cualquier runtime de agente puede invocar.

El problema que resuelve es concreto: la mayoría del tooling de navegador para agentes o bien maneja un navegador headless propio (con el coste de gestionar sesiones y logins), o bien captura pantallazos y adivina coordenadas en píxeles. Nova se conecta a un Chrome ya en ejecución y ya autenticado, y lee el DOM real, de modo que el modelo elige elementos en lugar de coordenadas. Además, `survey` persiste la estructura de la página en `.agent-state/nova-routes.json`, de forma que una segunda visita a la misma página no requiere redescubrimiento.

Su relevancia actual es la de una pieza de infraestructura experimental: encaja en la tendencia de agentes que operan interfaces web reales con sesión autenticada, sin dependencias externas (usa `fetch` y `WebSocket` nativos de Node 18+) y con licencia MIT. Su estado es temprano: el puente CDP y la capa de observación funcionan; la ejecución autónoma de tareas multi-paso es parcial y está dirigida por un LLM externo. No incluye ningún modelo entrenado, por lo que no hay parámetros, contexto ni cuantizaciones propias que evaluar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: capa de control de navegador (puente HTTP → WebSocket → CDP). No es un modelo de red neuronal |
| Parametros totales | No disponible / no aplica: el repositorio no contiene pesos |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible: depende del LLM externo que se conecte al puente |
| Tipos de cuantizacion | No aplica: no se distribuyen pesos |
| Idiomas soportados | Inglés (metadatos del repositorio y documentación); el idioma real de las respuestas depende del LLM subyacente |
| Licencia | MIT |
| Formato de pesos | No aplica: no hay pesos. Se distribuye código fuente en JavaScript (`.mjs`) y HTML |
| Lenguaje de implementación | JavaScript sobre Node 18+ |
| Dependencias externas | Ninguna: usa `fetch` y `WebSocket` integrados en Node |
| Interfaz | API HTTP en `localhost:4243`; CDP en `localhost:9222` |
| Endpoints | `GET /health`, `GET /targets`, `GET /observe`, `POST /navigate`, `POST /click`, `POST /type`, `POST /survey` |
| Estado del proyecto | Temprano / experimental |
| Archivos principales | `nova-bridge.mjs`, `nova-autonomous-agent.mjs`, `nova-terminal.html` |
| Persistencia de estado | `.agent-state/nova-routes.json` (caché de estructura de página aprendida) |

## Arquitectura y entrenamiento

El sistema tiene tres capas. En la parte superior se sitúa el LLM o runtime de agente, que habla HTTP contra `nova-bridge.mjs` en el puerto 4243. El puente traduce esas llamadas a mensajes del Chrome DevTools Protocol sobre WebSocket contra un Chrome lanzado con `--remote-debugging-port=9222`. Por debajo, el puente escribe y lee una caché de rutas en `.agent-state/nova-routes.json`, que almacena la estructura de las páginas ya visitadas para evitar redescubrimientos. El puente no tiene dependencias externas: se apoya únicamente en `fetch` y `WebSocket` nativos de Node 18 o superior. Junto al puente, el repositorio incluye `nova-autonomous-agent.mjs`, el bucle de tareas que lo dirige, y `nova-terminal.html`, una interfaz local de monitorización.

No existe entrenamiento ni dataset asociado: no se declara número de tokens, composición de corpus, ni fases de RLHF o DPO, porque no se entrena ningún modelo. La decisión de diseño destacable es el uso del DOM estructurado en lugar de un bucle de capturas de pantalla: el agente selecciona elementos por selector CSS en vez de estimar coordenadas en píxeles, y la operación `survey` vuelca formularios, campos de entrada y botones a la caché de rutas para que la segunda visita a una página sea directa. La conexión se hace contra un Chrome ya autenticado, lo que elimina la gestión de estado de sesión y login en un navegador propio.

## Capacidades

- Adjuntarse a un Chrome en ejecución vía CDP en el puerto 9222 (estado: funcional).
- Navegar a una URL, esperar la carga y estabilizar la página con un `settleMs` configurable (funcional).
- Observar el estado de la página: URL, título y recuentos de elementos (funcional).
- Clic y escritura mediante selector CSS (funcional, con las salvedades de la sección de limitaciones).
- `survey`: volcar formularios, inputs y botones a la caché de rutas (funcional).
- Recuerdo de rutas entre sesiones mediante `nova-routes.json` (funcional).
- Ejecución autónoma de tareas multi-paso dirigida por un LLM (parcial).
- Flujos de pago o comercio electrónico: no verificados por el autor.
- Autorreplicación: no implementada.
- Selección de elementos por texto o árbol de accesibilidad: no implementada (en hoja de ruta).
- Escritura con eventos de tecla reales para inputs controlados por React o Vue: no implementada (en hoja de ruta).
- Orquestación multi-pestaña o multi-instancia: no implementada (en hoja de ruta).
- Autenticación en el propio puente: no implementada (en hoja de ruta).

## Casos de uso

- Automatización de trámites en portales con sesión autenticada: el puente se conecta a un Chrome donde el usuario ya ha iniciado sesión, por lo que el agente puede rellenar formularios y navegar sin replicar el flujo de login. Es adecuado precisamente porque no gestiona estado de sesión propio.
- Pruebas de extremo a extremo sobre aplicaciones internas: `navigate`, `click` y `type` permiten automatizar smoke tests de flujos concretos sobre un Chrome con el perfil de pruebas, y `observe` da comprobaciones de URL y título como aserciones básicas.
- Extracción estructurada de datos de páginas dinámicas: al leer el DOM real en lugar de píxeles, el agente puede localizar campos por selector y volcar la estructura con `survey`, lo que reduce la fragilidad frente a cambios de resolución o de layout.
- Agentes de investigación web multi-paso: combinando navegación, observación y la caché de rutas, un runtime LLM puede encadenar visitas a páginas recurrentes (por ejemplo, paneles de administración) sin redescubrir la estructura en cada sesión.
- Monitorización periódica de paneles internos: al persistir las rutas en `nova-routes.json`, un script programado puede volver a la misma página y leer los mismos elementos de forma estable entre ejecuciones.
- Asistencia a equipos de QA en la reproducción de incidencias: el bucle `nova-autonomous-agent.mjs` permite describir una tarea en lenguaje natural al LLM y dejar que este ejecute los pasos sobre la interfaz, útil para reproducir bugs de forma guiada.
- Integración en pipelines de CI con un Chrome lanzado con puerto de depuración: el puente arranca con `node nova-bridge.mjs` sin dependencias, lo que simplifica su inclusión en un job que ya disponga de Chrome y Node 18+.
- Verificación de formularios y flujos de entrada: `survey` identifica inputs y botones disponibles, lo que sirve para auditar que un formulario expone los campos esperados antes de una release.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene ningún modelo entrenado, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables. Tampoco se facilitan medidas de latencia, throughput ni tasas de éxito en tareas de navegación. El único parámetro de temporización documentado es `settleMs`, configurable por llamada, que controla la espera tras navegar o interactuar.

## Requisitos de hardware

- GPU: no se requiere ninguna. El puente es código JavaScript que se ejecuta en CPU.
- Requisitos de software: Node 18 o superior (por `fetch` y `WebSocket` nativos) y una instalación de Chrome lanzada con `--remote-debugging-port=9222`.
- Memoria y CPU: no disponibles en la información proporcionada; dependen de la carga de Chrome y del LLM externo, no del puente.
- VRAM: no aplica al puente. Si se conecta un LLM local como consumidor, su VRAM vendrá determinada por ese modelo, cuyo dato no figura en esta ficha.
- Opciones de despliegue: ejecución directa con `node nova-bridge.mjs`. No procede vLLM, llama.cpp, Ollama ni TGI, ya que no se sirve ningún modelo. La interfaz de monitorización es `nova-terminal.html`, servida localmente.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

La información proporcionada solo documenta Nova Agent, por lo que los datos de terceros no pueden verificarse aquí y se marcan como no disponibles. La comparación que sigue es cualitativa y se basa en las afirmaciones de la propia model card sobre el enfoque de Nova.

| Herramienta | Enfoque de control del navegador | Requiere modelo propio | Licencia | Datos verificados en esta ficha |
|---|---|---|---|---|
| Nova Agent | Se adjunta a un Chrome ya en ejecución y autenticado vía CDP; lee el DOM real | No | MIT | Sí (model card del autor) |
| Navegador headless propio (familias tipo Playwright o Puppeteer) | Lanza y controla su propia instancia de navegador | No | No disponible | No |
| Frameworks de agente que capturan pantalla y estiman coordenadas | Bucle de capturas de pantalla con selección por píxeles | Sí, requiere un LLM con capacidades visuales | No disponible | No |
| Librerías de agentes web sobre Playwright | Controlan una instancia propia mediante la API del navegador | No | No disponible | No |

Diferencias declaradas por el autor frente al enfoque de captura de pantalla: ausencia de estado de sesión que gestionar, datos de página estructurados en lugar de píxeles y persistencia de la estructura mediante `survey`. No se dispone de comparativas de rendimiento ni de parámetros equiparables, porque Nova Agent no es un modelo.

## Limitaciones y advertencias

- No es un modelo: no hay pesos, ni parámetros, ni contexto propio, ni cuantizaciones. Cualquier evaluación tipo benchmark de LLM no aplica.
- Estado experimental: el CDP y la observación funcionan, pero todo lo listado en la hoja de ruta está sin implementar y la ejecución autónoma multi-paso es solo parcial.
- Sin autenticación en el puente: cualquier proceso local puede llamar a la API. El propio autor recomienda mantener el puerto 4243 enlazado solo a `127.0.0.1` y no exponerlo.
- Riesgo de seguridad por CDP: el puerto 9222 concede control total del perfil de Chrome a cualquier cosa que pueda alcanzarlo. Se recomienda usarlo contra un perfil dedicado y no contra el perfil principal del usuario.
- Selección de elementos limitada a selectores CSS: no existe un modo «pulsa el botón que dice X». La pseudoclase `:contains()` no es CSS válido y `querySelector` lanzará una excepción si se usa.
- Escritura frágil en frameworks: `type` asigna `.value` y dispara eventos `input` y `change`. Algunos inputs de React y Vue ignoran este mecanismo y necesitan eventos de tecla reales, aún no implementados.
- Una sola pestaña: el puente escoge el primer objetivo de página que no sea `chrome://`.
- Sin lógica de reintento: los errores se devuelven como `{ok:false, error}` con código HTTP 500.
- Flujos de pago o comercio electrónico no verificados por el autor.
- Idiomas: los metadatos y la documentación están en inglés; el multilingüismo efectivo dependerá del LLM que consuma el puente.
- Licencia MIT: permisiva y apta para uso comercial, pero sin garantías. Al tratarse de código que opera un navegador autenticado, la responsabilidad sobre el uso recae en quien lo despliega.
- Discrepancia de enlaces: el identificador de HuggingFace usa `Rick8444`, mientras que la sección de enlaces de la model card apunta a `https://github.com/Rick84444/nova-agent` (con un cuarto carácter adicional). Conviene comprobar cuál es el repositorio correcto antes de clonarlo.

## Enlaces

- HuggingFace: https://huggingface.co/Rick8444/nova-agent
- GitHub (según la model card, con discrepancia en el identificador): https://github.com/Rick84444/nova-agent
- No se han encontrado enlaces relevantes adicionales (papers, blogs, demos o documentación complementaria) en la búsqueda web realizada; los resultados obtenidos no guardan relación con este proyecto.
