# SevdanurGenc/LLM-Automated-Test-Generation-Agent

## Resumen

TestAjanı (publicado en HuggingFace como SevdanurGenc/LLM-Automated-Test-Generation-Agent) no es un modelo de lenguaje entrenado, sino un proyecto de agente que orquesta modelos LLM servidos localmente a través de Ollama. Su objetivo es explicar codigo fuente y generar suites de pruebas automaticas con autorreparacion: a partir de codigo Python, JavaScript/TypeScript o Java, el sistema produce tests unitarios, de interfaz (contrato) y de UI web, los compila y ejecuta en un sandbox Docker aislado y reinyecta los errores al agente hasta que la suite pasa y alcanza un objetivo de cobertura.

El autor es SevdanurGenc y el repositorio de HuggingFace asociado tiene 0 descargas y 0 likes en el momento de la consulta, con un tamano de 0.0 GB, lo que sugiere que la pagina actua como escaparate o punto de distribucion del proyecto mas que como un checkpoint de pesos. La model card describe una arquitectura de agente con bucle Plan -> Implement -> Verify -> Repair basada en tool calling, con el modelo por defecto `qwen2.5-coder:7b` y una opcion de mayor tamano (`qwen2.5-coder:14b`).

Es relevante ahora porque combina tres tendencias: ejecucion local de LLM (sin enviar codigo a terceros), verificacion obligatoria mediante herramientas reales (compiladores, runners, cobertura) y metaevaluacion de la calidad de los tests generados mediante mutation testing y fallos sembrados manualmente. No se dispone de informacion sobre licencia, idiomas naturales soportados ni parametros propios, ya que no es un modelo con pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema de agentes sobre LLM; bucle Plan-Implement-Verify-Repair con tool calling sobre modelos servidos por Ollama (por defecto `qwen2.5-coder:7b`). No es una arquitectura de modelo propia. |
| Parametros totales | no disponible (depende del modelo Ollama elegido; por defecto 7b, opcion 14b segun la model card) |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible (depende del modelo Ollama; la model card menciona compactacion de contexto por iteracion) |
| Tipos de cuantizacion | no disponible (gestionados por Ollama para el modelo subyacente) |
| Idiomas soportados | no disponible. La documentacion del proyecto esta en ingles y turco; los lenguajes de programacion soportados son Python, JavaScript/TypeScript y Java |
| Licencia | no disponible |
| Formato de pesos | no aplica en el repositorio (0.0 GB); el modelo por defecto se descarga mediante Ollama (~5 GB) |

## Arquitectura y entrenamiento

El proyecto implementa un bucle de agente de cuatro fases: Plan (un agente analista produce explicacion, unidades, casos limite y plan de pruebas), Implement (un agente redactor invoca herramientas para escribir el fichero de tests), Verify (compilacion, ejecucion y medicion de cobertura dentro de un sandbox Docker con `--network none` y limites de CPU/memoria) y Repair (reintroduccion de errores de compilacion, tests fallidos y lineas no cubiertas, con compactacion de contexto). El ciclo se repite mientras queden iteraciones y no se alcance el objetivo de cobertura.

Las herramientas expuestas al modelo son `write_tests(code)`, `run_tests()`, `read_source()`, `report_bug(test_name, reason)` y `finish(summary)`. Para que modelos locales pequenos funcionen, el sistema impone verificacion obligatoria (si el modelo no ejecuta los tests, el orquestador los ejecuta), una capa de recuperacion que convierte llamadas a herramientas embebidas como JSON o bloques de codigo plano en tool calls, compactacion de contexto por iteracion (solo prompt de sistema, tarea, fichero de test actual y ultimo resultado) y seleccion de la mejor version verificada en lugar de la ultima. No se describe en la informacion disponible ningun proceso de entrenamiento, ajuste (RLHF/DPO) ni dataset propio: el rendimiento depende integramente del modelo Ollama seleccionado.

## Capacidades

- Generacion de tests unitarios para Python (pytest), JavaScript y TypeScript (Jest + Babel) y Java (JUnit 5).
- Generacion de tests de interfaz/contrato: API publica, firmas y tipos de excepcion.
- Generacion de tests de UI web mediante Playwright.
- Explicacion de codigo fuente en los tres lenguajes soportados.
- Bucle de agente con tool calling y autorreparacion iterativa hasta alcanzar estado verde y objetivo de cobertura.
- Verificacion real en sandbox Docker aislado, con compilacion, ejecucion y medicion de cobertura (coverage.py, Istanbul, JaCoCo).
- Metaevaluacion de la suite generada mediante mutation testing (8 familias de operadores) y deteccion de fallos sembrados manualmente.
- Deteccion de posibles bugs en el codigo bajo prueba mediante `report_bug`.
- Interfaz con timeline del agente en vivo, mapa de cobertura y mutantes sobre el codigo, descarga de tests, evaluacion por lotes e historico.
- Ejecucion local: sin salida de codigo a la red y ejecucion de tests sin acceso a red.

## Casos de uso

- Generacion de tests unitarios en un proyecto Python existente: se carga el modulo y el agente produce una suite pytest que se compila y ejecuta en el sandbox hasta cumplir el objetivo de cobertura, reutilizable en CI.
- Cobertura de contratos de API publica en Java: el agente inspecciona firmas y tipos de excepcion y genera tests JUnit 5 que verifican el contrato de la libreria, con verificacion real mediante JaCoCo.
- Tests de componentes de UI web: con Playwright, el sistema genera pruebas de interfaz para aplicaciones JavaScript/TypeScript y las ejecuta en un navegador dentro del sandbox.
- Auditoria de calidad de codigo heredado: el uso de mutation testing con 8 familias de operadores y fallos sembrados permite estimar si la suite generada detecta defectos reales y no solo aumenta la cobertura superficial.
- Endurecimiento de pipelines de CI/CD: la suite generada y verificada puede incorporarse al repositorio para ejecutarse en cada commit, aceptando o rechazando cambios segun cobertura.
- Entornos con requisitos de confidencialidad: al ejecutar el modelo y los tests en local (Ollama + Docker sin red), es adecuado para equipos que no pueden enviar codigo propietario a servicios en la nube.
- Docencia y formacion en pruebas de software: la explicacion de codigo y el plan de pruebas generado sirven como material de partida para ensenar estrategias de testing.
- Evaluacion de modelos de codigo: al permitir cambiar el modelo Ollama (`qwen2.5-coder:7b`, `qwen2.5-coder:14b`, etc.), sirve como banco de pruebas comparativo de modelos de codigo con tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe metricas de evaluacion (cobertura de linea, mutation score con 8 familias de operadores y deteccion de fallos sembrados) pero no incluye cifras concretas de resultados.

## Requisitos de hardware

- Requisito de software declarado: Docker Desktop (Docker Engine en Linux) como unica dependencia obligatoria en el arranque rapido; el launcher descarga el modelo por defecto (~5 GB) en la primera ejecucion.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Depende del modelo Ollama elegido (por defecto un modelo 7b; existe opcion 14b).
- GPU recomendadas: no disponible. La model card no especifica GPU objetivo.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada. El proyecto menciona mejor aceleracion por GPU en Windows/macOS cuando Ollama ya esta instalado en el host frente a ejecutarlo en contenedor.
- Opciones de despliegue: Ollama (opcion por defecto, en host o contenedor), Docker Compose con perfil `ollama`, y arranque manual sin Docker mediante `scripts/setup_local.sh` (pip, npm, jars de JUnit 5/JaCoCo y Chromium de Playwright).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada. A continuacion se comparan las dos configuraciones de modelo subyacente mencionadas en la model card, ambas sobre la misma arquitectura de agente:

| Configuracion | Parametros (segun nomenclatura) | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `qwen2.5-coder:7b` (por defecto) | 7b | no disponible | no disponible | Ollama, descarga ~5 GB |
| `qwen2.5-coder:14b` (opcion) | 14b | no disponible | no disponible | Ollama |

No se han encontrado en la busqueda web alternativas equivalentes de generacion de tests con verificacion en sandbox y mutation testing para establecer una comparativa fiable.

## Limitaciones y advertencias

- La informacion del repositorio de HuggingFace indica 0 descargas, 0 likes, licencia no disponible e idiomas no disponibles: no hay evidencia de validacion por parte de la comunidad ni de los terminos de uso comercial.
- No es un modelo de pesos propios: el rendimiento, los sesgos, las alucinaciones y las limitaciones de contexto o idioma dependen integramente del modelo Ollama seleccionado, no del proyecto.
- La model card incluye una seccion titulada "Limitations", pero su contenido no aparece en la informacion proporcionada; se desconoce el detalle de las limitaciones declaradas por el autor.
- Riesgo de alucinacion inherente a la generacion de tests por LLM: el sistema mitiga este riesgo mediante verificacion obligatoria en sandbox y seleccion de la mejor version verificada, pero no se documentan tasas de fallo.
- La calidad de la cobertura no equivale a calidad de los tests; por ello el proyecto incorpora mutation testing y fallos sembrados, aunque sin cifras publicadas no puede evaluarse su eficacia real.
- Restricciones de licencia para uso comercial: no disponibles; debe verificarse antes de cualquier uso en produccion.
- Dependencia de toolchains externas (pytest, Jest + Babel, JUnit 5 + JaCoCo, Playwright) y de Docker para el sandbox, con el coste de mantenimiento asociado.
- En Windows se requieren WSL 2 y virtualizacion por hardware; en macOS, Gatekeeper puede bloquear el launcher.
- La fecha de creacion y actualizacion indicada (2026) no permite confirmar la madurez ni el mantenimiento efectivo del proyecto.

## Enlaces

- HuggingFace: https://huggingface.co/SevdanurGenc/LLM-Automated-Test-Generation-Agent
- Ollama (motor de modelos local): https://ollama.com
- Documentacion de arquitectura del agente (turco): docs/AJAN_MIMARISI.md (ruta interna del repositorio, sin URL absoluta en la informacion proporcionada)
