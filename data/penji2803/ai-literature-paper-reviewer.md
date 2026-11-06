# penji2803/ai-literature-paper-reviewer

## Resumen

AI Literature Paper Reviewer es un sistema multiagente de revisión de literatura científica publicado en Hugging Face por el usuario penji2803 (Tarun Narashiman, Amrita Vishwa Vidyapeetham). No se trata de un modelo de lenguaje con pesos propios, sino de una aplicación orquestadora que combina cinco APIs académicas abiertas (OpenAlex, Semantic Scholar, arXiv, Crossref y OpenReview) con subagentes basados en Claude (Anthropic) para convertir una idea de investigación de una línea en una revisión bibliográfica temática con citas verificadas y papers reales puntuados.

El sistema resuelve dos problemas clásicos de las revisiones de literatura generadas con LLM: la invención de referencias y la fabricación de cifras. Lo hace imponiendo un esquema de datos que rechaza cualquier paper sin DOI, arXiv ID o identificador de OpenAlex/Semantic Scholar, y verificando cada número del texto final contra el texto fuente parseado (PyMuPDF), eliminando las frases cuya cifra no pueda rastrearse hasta el paper citado.

Su relevancia actual radica en la tendencia hacia arquitecturas multiagente con verificación de hechos sobre LLM aislados: cinco subagentes puntuadores independientes en paralelo, tres analistas paralelos y un editor final, todo con estado persistente en disco y una interfaz web con dashboard. El proyecto se distribuye bajo licencia MIT y requiere claves API externas (Anthropic obligatoria) para funcionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema multiagente orquestado sobre Claude (Anthropic); no es un modelo con pesos propios |
| Parametros totales | no disponible (depende del modelo Claude subyacente) |
| Parametros activos | no disponible (no aplica, no es MoE) |
| Longitud de contexto | no disponible (limitada por la ventana de contexto del modelo Claude usado) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | Ingles (documentacion y pipeline orientados a literatura en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de codigo Python/Node.js, sin pesos) |

## Arquitectura y entrenamiento

El sistema se organiza en dos etapas. La etapa 1 (recoleccion y puntuacion) sigue el flujo: la idea se expande en facetas de busqueda mediante Claude, se consultan cinco APIs academicas (OpenAlex, Semantic Scholar, arXiv, Crossref y OpenReview), los resultados se fusionan y deduplican, un agente Claude realiza un cribado de relevancia, se aplica snowballing de referencias y citas, y se recupera texto completo legal (solo acceso abierto) mediante `lit_fetch.py` con la cadena SciSpace → Unpaywall → arXiv. Sobre las fichas resultantes corren cinco subagentes puntuadores en paralelo y aislados (no ven las puntuaciones de los demas, con un guardia de permisos que limita cada uno a su lote de ficheros), que evaluan cinco ejes: autenticidad (20 %), actualidad (15 %), citas (20 %), resultados (20 %) y relevancia (25 %). Los pesos son editables en vivo desde el dashboard.

La etapa 2 (generacion de la revision) parsea los PDFs con PyMuPDF (secciones, tablas, paginas), lanza tres analistas paralelos (problema, metodo y resultados), genera tablas comparativas y figuras con Python, y un agente editor redacta la revision final. Cada cifra debe copiarse del texto o tabla parseada y se verifica contra su fuente; el verificador elimina cualquier frase cuyo numero no aparezca en el paper citado. Los papers sin texto completo legal se analizan solo desde el abstract y quedan etiquetados con `basis: "abstract"`. No hay entrenamiento propio: no se han entrenado pesos ni se ha aplicado RLHF/DPO; la "inteligencia" proviene integramente de los modelos Claude invocados via API. En cuanto a ingenieria, destaca el cacheo de respuestas de API en SQLite, el respeto de cabeceras 429 Retry-After y la persistencia de estado en disco que permite reanudar ejecuciones interrumpidas.

## Capacidades

- Expansion automatica de una idea de investigacion en facetas de busqueda estructuradas mediante un agente Claude.
- Busqueda y fusion de resultados de cinco APIs academicas abiertas con deduplicacion y cribado de relevancia asistido por LLM.
- Puntuacion compuesta de papers en cinco ejes (autenticidad, actualidad, citas, resultados, relevancia) con confianza, justificacion y evidencia por puntuacion.
- Ejecucion paralela y aislada de subagentes (cinco puntuadores, tres analistas) con guardias de permisos por lote de ficheros.
- Recuperacion legal de texto completo de acceso abierto (SciSpace, Unpaywall, arXiv) y parseo estructurado de PDFs con PyMuPDF.
- Generacion de revisiones bibliograficas tematicas con verificacion de numeros contra la fuente y eliminacion automatica de afirmaciones no verificables.
- Salidas en multiples formatos: `review.md`, `review.tex`, `review.pdf`, `references.bib`, tablas comparativas (CSV, LaTeX, JSON), figuras (SVG, PDF, PNG) y `verification_report.json`.
- Dashboard web con barra de progreso en vivo, tiempo restante estimado, edicion de pesos de puntuacion y navegacion de citas dentro de la revision.
- Interfaz de linea de comandos (`run_survey.py`, `run_review.py`) y API backend (FastAPI/uvicorn).
- No tiene capacidades de vision, audio ni razonamiento propias: todo depende de las capacidades del modelo Claude contratado.

## Casos de uso

- Revision de literatura previa a un TFG, TFM o tesis doctoral: a partir de una idea de una linea, el sistema recopila y puntua decenas de papers relevantes y produce una revision tematica citada en PDF o LaTeX lista para editar.
- Estado del arte rapido para redactar la seccion relacionada de un paper: la tabla comparativa y las figuras generadas pueden integrarse directamente en el manuscrito, con cifras trazables a la fuente.
- Auditoria de calidad de referencias: el eje de autenticidad (tier de venue CORE/SJR, peer review, retractiones y lista de editores depredadores) ayuda a filtrar publicaciones de baja calidad antes de citarlas.
- Onboarding en un campo nuevo: un investigador que entra en un area (por ejemplo, asignacion multiagente de tareas) obtiene en minutos un conjunto curado y puntuado de los trabajos nucleares (`core`) frente a los perifericos.
- Preparacion de material docente: un profesor puede generar revisiones tematicas con referencias verificadas para asignaturas de IA, reduciendo el riesgo de citar papers inexistentes.
- Vigilancia tecnologica en equipos de I+D: el snowballing de citas y la puntuacion por recencia permiten detectar trabajos emergentes y mantener el estado persistente para ejecuciones largas y reanudables.
- Comparativa sistematica de metodos: los tres analistas paralelos (problema, metodo, resultados) y la tabla comparativa con valores extraidos de los papers facilitan analisis comparativos con minimas cifras inventadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, algo esperable al no tratarse de un modelo con pesos propios. El autor si documenta metricas de una ejecucion de ejemplo con la idea "Multi agent task allocation":

| Metrica | Resultado |
|---|---|
| Candidatos recopilados → papers conservados | 134 → 30 |
| Papers con identificador real | 30/30 (100 %) |
| Registros de puntuacion validos (30 papers × 5 ejes) | 150/150 (100 %) |
| Cobertura de texto completo legal | 7/30 (23 %); el resto etiquetado solo-abstract |
| Resultados extraidos trazables a la fuente | 37/49 (75,5 %); los no verificados se excluyen de las tablas |
| Numeros en la revision verificados | 55/56 (98,2 %); la frase fallida se elimino |
| Citas resueltas | 30/30 (100 %) |
| Tiempo de la etapa 2 (30 papers) | unos 4 minutos |

## Requisitos de hardware

- No requiere GPU ni VRAM: toda la inferencia se realiza via API de Anthropic (Claude), por lo que basta una maquina de escritorio o servidor modesto.
- Software: Python 3.11 o superior, Node.js 20 o superior y, opcionalmente, LuaLaTeX (TeX Live) solo para compilar el PDF de la revision.
- Espacio en disco moderado para el cache SQLite de respuestas de API, el estado de las ejecuciones y los PDFs parseados; no se especifica un tamano concreto.
- Despliegue local: backend FastAPI con `uvicorn server.app:app --port 8000` y dashboard web en `http://localhost:5173` via Vite (`npm --prefix web run dev`). No hay imagenes Docker ni despliegue en la nube documentados.
- Claves API necesarias: `ANTHROPIC_API_KEY` (obligatoria, todos los agentes Claude); recomendadas `OPENALEX_API_KEY`/`OPENALEX_EMAIL`, `CROSSREF_EMAIL` y `UNPAYWALL_EMAIL`; opcionales `S2_API_KEY`, `SCISPACE_API_KEY` y credenciales de OpenReview. Las claves se escriben solo en `.env` local con permisos de propietario y el endpoint de configuracion acepta peticiones solo desde localhost.
- Latencia: no se publica un tiempo total, pero la etapa 2 sobre 30 papers tardo unos 4 minutos en el ejemplo del autor; la etapa 1 depende de los limites de tasa de las APIs academicas (se respetan los 429 Retry-After).
- No es compatible con llama.cpp, Ollama, vLLM ni TGI al no incluir pesos locales.

## Comparativa con modelos similares

| Herramienta | Tipo | Fuentes de papers | Verificacion de citas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI Literature Paper Reviewer | Multiagente sobre Claude + 5 APIs academicas | OpenAlex, Semantic Scholar, arXiv, Crossref, OpenReview | Si: numeros verificados contra el PDF parseado; papers sin identificador rechazados | MIT | Codigo abierto, ejecucion local |
| Elicit | SaaS comercial de revision de literatura | Base propia de papers (Semantic Scholar y otras) | Parcial, sin verificacion abierta de cifras | Propietaria | Servicio web de pago |
| Semantic Scholar / Connected Papers | Buscadores y mapas de citas academicos | Semantic Scholar | No generan revisiones ni verifican numeros | Propietaria (servicio) | Web gratuita con limites |

No existen alternativas open source directamente comparables con verificacion numerica equivalente en la informacion disponible; la diferenciacion principal de esta herramienta es la trazabilidad de cada cifra y la imposicion de identificadores reales para cada paper.

## Limitaciones y advertencias

- No es un modelo: no incluye pesos ni puede ejecutarse offline; requiere una clave de Anthropic y por tanto tiene coste variable por uso de la API de Claude, no cuantificado en el repositorio.
- Cobertura de texto completo limitada: en el ejemplo del autor solo el 23 % de los papers tuvo texto completo legal; el resto se analiza unicamente desde el abstract y queda etiquetado como tal, lo que puede empobrecer el analisis de metodos y resultados.
- Riesgo residual de alucinacion: aunque el 98,2 % de los numeros se verifico en el ejemplo, la verificacion depende del parseo de PyMuPDF y del modelo Claude; tablas complejas o PDFs mal estructurados pueden degradar la extraccion.
- Sesgo de fuentes: al limitarse a cinco APIs academicas y a acceso abierto legal, puede omitir trabajos relevantes tras paywalls o en bases no indexadas; el eje de citas favorece trabajos ya citados, penalizando potencialmente papers muy recientes.
- Orientado al ingles: la documentacion y el pipeline estan pensados para literatura en ingles; no se documenta soporte para literatura en castellano u otros idiomas.
- Uso comercial: la licencia MIT del codigo es permisiva, pero las llamadas a la API de Claude estan sujetas a las condiciones comerciales de Anthropic, y las APIs academicas tienen limites de tasa y politicas de uso propias.
- Calidad dependiente del modelo subyacente: las capacidades de razonamiento y redaccion varian segun el modelo Claude contratado, sobre el que el repositorio no da ninguna garantia ni version minima.
- Proyecto academico individual (trabajo de curso), sin mantenimiento garantizado, sin tests documentados mas alla de `pytest` y sin comunidad de usuarios (0 descargas y 0 likes en Hugging Face en el momento de la ficha).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/penji2803/ai-literature-paper-reviewer
- APIs academicas usadas: OpenAlex (https://openalex.org), Semantic Scholar (https://www.semanticscholar.org), arXiv (https://arxiv.org), Crossref (https://www.crossref.org), OpenReview (https://openreview.net)
- Unpaywall (texto completo legal): https://unpaywall.org
- Anthropic API (requerida): https://www.anthropic.com
- No se han encontrado paper, demo en linea ni blog oficial en la informacion disponible.
