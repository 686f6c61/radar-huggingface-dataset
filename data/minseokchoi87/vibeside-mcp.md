# minseokchoi87/vibeside-mcp

## Resumen

`vibeside-mcp` no es un modelo de lenguaje: es un servidor del Model Context Protocol (MCP) escrito en Node.js que actúa como puente entre un asistente de código con IA (Claude Code, Cursor, Windsurf, Antigravity) y un navegador Chrome o Edge local. Lo publica el usuario de Hugging Face `minseokchoi87` como repositorio de código, con pipeline, idiomas y licencia no declarados en los metadatos de la plataforma, y con 0 descargas y 0 likes en el momento de la consulta. Su función es resolver tres problemas concretos del flujo de trabajo "vibe coding": el asistente no ve lo que se renderiza en `localhost`, el desarrollador tiene que copiar a mano los errores de consola y de red, y el modelo desconoce qué fichero fuente genera un componente concreto.

La propuesta técnica se apoya en el protocolo de depuración de Chrome (CDP) sobre un puerto configurable (el ejemplo de la documentación usa 9315 y menciona 9222), reutilizando el perfil de usuario existente para conservar sesiones autenticadas. Sobre esa conexión expone diez herramientas MCP: navegación, captura de telemetría en tiempo real (excepciones no capturadas, errores de hidratación, respuestas 4xx/5xx), inspección de componentes React Fiber y Vue AST hasta fichero y línea, clics, escritura de texto, capturas de pantalla, snapshots de DOM accesible y evaluación de JavaScript arbitrario en el contexto de la página.

Es relevante ahora porque el ecosistema MCP se ha consolidado como estándar abierto para conectar modelos con herramientas externas, y porque la categoría de "navegador para agentes" está dominada por soluciones en la nube con latencia y sin acceso al servidor de desarrollo local. El autor lo posiciona explícitamente frente a Aside (aside.com). Conviene señalar que la model card es fundamentalmente material de marketing: no incluye benchmarks, ni tests, ni métricas de latencia medidas, y la licencia es propietaria y confidencial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Servidor MCP sobre Node.js (transporte stdio, FastMCP); no es un modelo de lenguaje ni una red neuronal |
| Parámetros totales | no aplica (no hay pesos) |
| Parámetros activos | no aplica |
| Longitud de contexto | no aplica; la ventana de contexto la determina el cliente LLM que consume las herramientas MCP |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible en los metadatos; la documentación se ofrece en 10 idiomas (inglés, coreano, chino simplificado, español, hindi, árabe, portugués de Brasil, ruso, francés e indonesio) |
| Licencia | propietaria y confidencial ("Proprietary & Confidential", todos los derechos reservados) |
| Formato de pesos | no aplica; se distribuye como paquete npm y código JavaScript compilado (`dist/index.js`) |
| Versión | 0.1.0 (según el badge de npm de la model card) |
| Runtime requerido | Node.js >= 20 |
| Transporte | stdio local (el autor lo describe como "FastMCP") |
| Puerto CDP por defecto en los ejemplos | 9315 (se menciona también 9222) |
| Número de herramientas MCP | 10 |
| Navegadores soportados | Chrome y Edge (según la documentación) |
| Sistemas operativos | los ejemplos son de Windows (PowerShell, DPAPI); no se documenta soporte de macOS o Linux |
| Descargas / likes en Hugging Face | 0 / 0 |
| Fecha de creación del repositorio | 2026-10-19T20:30:05Z (según Hugging Face) |
| Última actualización | 2026-10-19T20:57:42Z |

## Arquitectura y entrenamiento

No hay entrenamiento. El repositorio no contiene datos de entrenamiento, ni proceso de ajuste, ni RLHF/DPO, porque no es un modelo. Lo que hay es una implementación de servidor MCP que se ejecuta como proceso local y habla por stdio con el cliente (Claude Desktop, Claude Code, Cursor, Windsurf, Antigravity), declarado en ficheros de configuración como `claude_desktop_config.json` o `mcp.json` con el comando `node` y la ruta a `dist/index.js`.

Técnicamente, el servidor se conecta a una instancia de Chrome o Edge arrancada con `--remote-debugging-port` y `--user-data-dir` apuntando al perfil real del usuario, de modo que hereda cookies y sesiones ya autenticadas. Sobre CDP implementa tres bloques funcionales: (1) automatización de navegación e interacción (navegar, clicar por selector CSS o por texto, escribir en campos, capturar pantalla en viewport, página completa o elemento); (2) telemetría del servidor de desarrollo, con un búfer circular de errores que recoge excepciones no capturadas, fallos de hidratación y respuestas 4xx/5xx, más una operación de limpieza de ese búfer; y (3) introspección de la aplicación, resolviendo el elemento clicado contra el árbol de React Fiber o el AST de Vue para devolver nombre de componente, ruta de fichero y línea, además de un snapshot estructurado de elementos interactivos accesibles. La herramienta `vibeside_eval` ejecuta expresiones JavaScript arbitrarias en el contexto de la página. En seguridad, la documentación menciona perfiles aislados con DPAPI de Windows y cifrado `age`.

## Capacidades

- Conexión a Chrome o Edge en ejecución mediante CDP, reutilizando el perfil de usuario y, por tanto, las sesiones autenticadas.
- Navegación a URLs locales o remotas desde el asistente.
- Lectura de telemetría en tiempo real del servidor de desarrollo: excepciones no capturadas, errores de hidratación y respuestas 4xx/5xx, con búfer circular y operación de vaciado.
- Mapeo de un elemento de la interfaz a su componente React Fiber o Vue AST, con nombre, ruta de fichero y número de línea.
- Interacción con la página: clic por selector CSS o por consulta de texto, y escritura en campos de entrada y áreas de texto.
- Captura de pantalla de viewport, página completa o elemento concreto, en Base64 o volcado a fichero.
- Snapshot de DOM orientado a accesibilidad: árbol estructurado de botones, inputs y enlaces.
- Ejecución de JavaScript arbitrario en el contexto de la página.
- Integración con clientes MCP estándar mediante configuración de servidor local por stdio.
- No incluye capacidades de generación de texto, razonamiento, código, matemáticas, visión o audio propias: todas esas funciones las aporta el LLM cliente.

## Casos de uso

- Depuración de errores de hidratación en Next.js o Nuxt: el asistente invoca `vibeside_telemetry_get`, recibe la excepción exacta con su traza y el estado de la página, y propone un parche sin que el desarrollador tenga que abrir DevTools ni copiar nada.
- Localización de componentes en bases de código grandes: ante un botón que falla, el agente usa `vibeside_inspect_component` sobre el elemento clicado y obtiene la ruta y la línea del componente React o Vue, evitando búsquedas por grep aproximadas.
- Verificación visual de cambios: tras aplicar una modificación de estilos, el agente navega a `localhost`, hace `vibeside_screenshot` del elemento afectado y compara con el estado esperado antes de dar la tarea por cerrada.
- Pruebas de flujos autenticados de extremo a extremo: al reutilizar el perfil de Chrome con sesión iniciada, el agente puede recorrer un checkout o un panel de administración protegido sin introducir credenciales ni gestionar tokens.
- Rellenado y validación de formularios: `vibeside_type` más `vibeside_click` permiten al agente reproducir un flujo de registro y leer con `vibeside_dom_snapshot` los mensajes de validación devueltos.
- Diagnóstico de respuestas de API fallidas en desarrollo: la telemetría recoge los 4xx/5xx del servidor local y el agente correlaciona el fallo con el elemento de la interfaz que lo disparó.
- Automatización de comprobaciones de accesibilidad básicas: el árbol de elementos interactivos devuelto por `vibeside_dom_snapshot` sirve para detectar controles sin etiqueta o enlaces sin texto.
- Extracción de datos de una página concreta durante una sesión de depuración mediante `vibeside_eval`, por ejemplo leer el estado de un store o una variable global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla comparativa frente a Aside, pero es una matriz de funcionalidades declarada por el autor (presencia o ausencia de características), no una medición reproducible, y no aporta latencias, throughput ni tasas de acierto. La afirmación de "0 ms de latencia" se refiere a que el transporte es stdio local sin orquestación en la nube, no a una medición del tiempo de respuesta de las herramientas.

## Requisitos de hardware

- VRAM: no aplica; el servidor no ejecuta inferencia. La memoria la consume el navegador que se esté controlando y el cliente LLM.
- CPU y RAM: un proceso Node.js adicional de huella reducida; el consumo dominante es el de Chrome o Edge con el perfil completo del usuario.
- GPU: no se requiere ninguna; funciona en cualquier equipo capaz de ejecutar Chrome o Edge y Node.js 20 o superior.
- Cabe en cualquier equipo de desarrollo, incluidos portátiles sin GPU dedicada.
- Despliegue: instalación como paquete npm y ejecución mediante `node <ruta>/dist/index.js`, declarado como servidor MCP en `claude_desktop_config.json` (Claude Desktop, Claude Code) o `mcp.json` (Cursor, Windsurf, Antigravity). No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI porque no hay modelo que servir.
- Requisito previo: arrancar el navegador con `--remote-debugging-port=9315` y `--user-data-dir` apuntando al perfil de usuario.
- Latencia y throughput: no disponibles. No hay mediciones publicadas del tiempo por invocación de herramienta ni del caudal de eventos de telemetría.

## Comparativa con modelos similares

| Producto | Tipo | Ejecución | Acceso al servidor de desarrollo local | Mapeo de UI a código fuente | Licencia | Precio |
|---|---|---|---|---|---|---|
| vibeside-mcp | Servidor MCP de automatización de navegador | Local, stdio | Sí, según el autor | Sí: React Fiber y Vue AST con fichero y línea | Propietaria y confidencial | Gratuito para autohospedaje, según el autor |
| Aside (aside.com) | Agente de navegador en la nube | Remota | No, según la tabla del autor | No, según la tabla del autor | Propietaria (SaaS) | Suscripción de pago |
| Otros servidores MCP de navegador | Servidores MCP de automatización | Local o remoto | No disponible en la información proporcionada | No disponible | No disponible | No disponible |

La comparación con Aside procede íntegramente de la tabla publicada por el autor del repositorio y no se ha verificado de forma independiente. Para el resto de alternativas del ecosistema MCP no se han aportado datos en la información disponible, por lo que no se puede establecer una comparación rigurosa de parámetros, contexto ni rendimiento: en esta categoría no hay "parámetros" que comparar, sino número de herramientas, cobertura de navegadores y garantías de seguridad.

## Limitaciones y advertencias

- Licencia propietaria y confidencial con todos los derechos reservados: el uso comercial, la redistribución o la modificación requieren autorización expresa del titular. No es software de código abierto pese a estar alojado en Hugging Face.
- Ausencia total de validación independiente: 0 descargas, 0 likes, sin tests publicados, sin benchmarks y sin histórico de versiones más allá de la 0.1.0.
- La model card emplea lenguaje promocional ("zero-latency", "surpassing Aside") y comparaciones no verificadas; debe tratarse como documentación de producto, no como evaluación técnica.
- `vibeside_eval` ejecuta JavaScript arbitrario en el contexto de la página: supone una superficie de riesgo relevante si el agente opera sobre sitios de terceros o si el propio LLM cliente es susceptible a inyección de prompts desde el contenido web.
- Abrir Chrome con `--remote-debugging-port` sobre el perfil personal expone el control del navegador a cualquier proceso local capaz de alcanzar ese puerto; el propio autor propone perfiles aislados, lo que entra en tensión con la promesa de reutilizar sesiones autenticadas.
- Sesgos conocidos: no aplica en el sentido habitual (no hay modelo entrenado), pero el mapeo de componentes depende de las convenciones de React y Vue y no cubre Svelte, Angular, Solid ni aplicaciones sin framework con árbol de componentes.
- Dependencia fuerte de Windows en la documentación (PowerShell, DPAPI); el soporte de macOS y Linux no está documentado.
- Las rutas de ejemplo de la configuración (`C:/github+w871075/vibeside-mcp/dist/index.js`) parecen específicas del entorno del autor y deben sustituirse por rutas reales.
- Riesgo de confusión de nombre: `vibeside.ai` es un producto distinto (aplicación de creación de personajes, imágenes y vídeo) sin relación aparente con este servidor MCP.
- Fecha de creación del repositorio en Hugging Face (2026-10-19) y metadatos incompletos (pipeline, idiomas y licencia no disponibles en la plataforma) dificultan la trazabilidad del proyecto.
- Al ser un puente y no un modelo, la calidad final depende por completo del LLM cliente: el servidor no mitiga alucinaciones, solo aporta observabilidad del navegador.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/minseokchoi87/vibeside-mcp
- Paquete npm: https://www.npmjs.com/package/vibeside-mcp
- Especificación del Model Context Protocol: https://modelcontextprotocol.io/
- Model Context Protocol en Wikipedia: https://en.wikipedia.org/wiki/Model_Context_Protocol
- Recursos sobre MCP de Microsoft: https://www.microsoft.com/en-us/thesource-developer/Category/159/model-context-protocol
- Servidores MCP en Vibe IDE: https://vibeide.ai/features/mcp-servers
- Aside (competidor citado por el autor): https://aside.com
- vibeside.ai (producto homónimo, sin relación aparente): https://vibeside.ai/
- ai-model-watch, otro servidor MCP mencionado en la búsqueda: https://artificialwatch.com/mcp
