# deeep-sec/campus-placement-engine

## Resumen

El repositorio `deeep-sec/campus-placement-engine` no contiene un modelo de IA con pesos entrenados, sino una aplicación web completa denominada "Institutional Campus Placement Eligibility & Scheduling Engine", orientada a las células de orientación profesional (Training & Placement Cells) de instituciones educativas y a equipos de reclutamiento corporativo. Su función es coordinar procesos de selección en campus: normalizar listados de estudiantes, evaluar elegibilidad de forma determinista, aplicar políticas institucionales de oferta y generar calendarios de entrevistas sin solapamientos mediante optimización con restricciones.

La pila técnica declarada en la model card es FastAPI 0.115+ para el backend, React 18.3 con Vite 6 y Tailwind CSS 3.4 para el frontend, SQLite en modo WAL como almacén local, y Google OR-Tools CP-SAT v9.11 como motor de resolución de restricciones. El repositorio se presenta como desplegable tanto en nube pública (Hugging Face Spaces, contenedores Docker, máquinas virtuales) como en redes institucionales aisladas, con soberanía total sobre los datos.

Es relevante ahora porque aborda un problema operativo concreto de alta estacionalidad —la temporada de reclutamiento en campus— donde los errores de filtrado manual y los solapamientos de agenda generan disputas verificables. No obstante, conviene subrayar que los metadatos de Hugging Face indican un tamaño de repositorio de 0.0 GB, cero descargas y cero likes, sin pipeline declarado y sin licencia confirmada en los metadatos, por lo que se trata de una publicación reciente y sin validación comunitaria medible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; aplicación web con backend FastAPI 0.115+, frontend React 18.3 + Vite 6 + Tailwind CSS 3.4, solver Google OR-Tools CP-SAT v9.11 y persistencia SQLite en modo WAL |
| Parámetros totales | No disponible (no se publican pesos de modelo; repositorio de 0.0 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no hay modelo con ventana de contexto; el alcance lo fijan las reglas de elegibilidad y las instancias del solver) |
| Tipos de cuantización | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | No disponibles en los metadatos; la documentación y la interfaz descritas están en inglés |
| Licencia | Discrepancia: la insignia de la model card indica MIT, pero los metadatos de Hugging Face devuelven "no disponible" |
| Formato de pesos | No disponible (no hay safetensors, GGUF ni ningún artefacto de pesos en el repositorio) |

## Arquitectura y entrenamiento

No existe entrenamiento ni ajuste de pesos. La arquitectura descrita es un pipeline de software en cuatro etapas: (1) ingesta y normalización, con importador multiformato de listados CSV/XLSX, resolución de alias de titulaciones y un extractor de requisitos a nivel de sentencia basado en AST que conserva la procedencia (sentencia y desplazamiento de caracteres del documento original); (2) razonamiento de elegibilidad y política, con un evaluador AST puro y un motor de políticas institucionales de oferta que produce tablas de decisión y snapshots de auditoría; (3) optimización de restricciones, donde la programación multisesión y multisala se formula como un modelo de satisfacción de programación lineal entera resuelto con OR-Tools CP-SAT, con un verificador independiente de no solapamiento; y (4) acceso multipersona en red aislada, con interfaces diferenciadas para oficiales de la TPO, estudiantes y reclutadores, más un exportador en formato de la empresa.

Las innovaciones técnicas declaradas son de ingeniería, no de aprendizaje automático: procedencia demostrable de cada criterio extraído, contador en memoria que recalcula el número y porcentaje de candidatos elegibles al mover los umbrales sin escribir en disco, simulador de casos límite que no muta el estado de producción, publicación atómica de requisitos versionados y verificación matemática de intervalos no solapados (un estudiante no puede estar en dos entrevistas a la vez; un panel o sala no puede alojar a más de un candidato simultáneamente, con pausas de comida, capacidad de panel y duración de rondas). No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del corpus ni el uso de RLHF/DPO, porque no aplica.

## Capacidades

- Extracción determinista de requisitos desde anuncios no estructurados (correos, PDF, DOCX): umbrales de CGPA, alias de ramas ("CS", "CSE", "CompSci"), tolerancia a asignaturas pendientes y límites de años de laguna.
- Trazabilidad de cada criterio extraído hasta la sentencia y el desplazamiento de caracteres exactos del documento fuente, con ventana de revisión lado a lado para aceptar, editar o rechazar valores.
- Evaluación de elegibilidad determinista sobre miles de perfiles académicos, con generación de snapshots de auditoría.
- Aplicación de políticas institucionales de oferta, incluida la regla de "un estudiante, una oferta" y el multiplicador de CTC para empresas objetivo (dream companies).
- Programación de entrevistas multipanel y multsala como modelo ILP, con restricciones de no solapamiento, capacidad de panel, pausas y duración de rondas, y aprovisionamiento automático de cabinas paralelas para lotes grandes.
- Verificación independiente del calendario generado para confirmar cero conflictos.
- Simulación what-if en memoria con titulares de impacto antes de publicar cambios de política.
- Importación multiformato (CSV/XLSX) con resolución de alias y mapeo de titulaciones.
- Exportación sin pérdida en el formato de la empresa reclutadora.
- Interfaces separadas por rol: oficial de TPO, portal de estudiante en LAN (móvil u ordenador) y panel de reclutador corporativo.
- No se declaran capacidades de generación de texto libre, razonamiento general, código, matemáticas, visión, audio, tool calling genérico ni agentes multi-paso.

## Casos de uso

- **Cribado de elegibilidad de una convocatoria**: cargar el listado de estudiantes en CSV/XLSX, definir umbrales de CGPA, porcentaje de 10.º y 12.º curso, ramas admitidas y pendientes toleradas, y obtener la tabla de elegibles con snapshot de auditoría que sirve como prueba ante disputas de estudiantes.
- **Procesamiento de ofertas de empleo no estructuradas**: pegar el correo o subir el PDF de la empresa; el extractor aísla los criterios y muestra la sentencia exacta de la que procede cada uno, de modo que el oficial valida con evidencia en lugar de transcribir a mano.
- **Programación de una jornada de entrevistas con múltiples paneles**: introducir candidatos, salas y paneles disponibles y las rondas previstas; CP-SAT devuelve un calendario sin solapamientos y el verificador independiente confirma la ausencia de conflictos antes de publicar.
- **Escalado a lotes grandes**: cuando el número de candidatos excede la capacidad de salas, el motor aprovisiona cabinas paralelas adicionales en la formulación, evitando reprogramaciones manuales de última hora.
- **Gobierno de la política de ofertas**: aplicar la regla de una oferta por estudiante junto con el multiplicador de CTC para empresas objetivo, resolviendo en el motor lo que en hojas de cálculo se convierte en excepciones manuales no auditables.
- **Análisis de impacto antes de publicar**: mover los umbrales en el simulador y leer cuántos candidatos y qué porcentaje quedarían elegibles antes de confirmar el cambio, sin tocar el estado de producción.
- **Portal de estudiante en red aislada**: estudiantes consultan su estado y su franja de entrevista desde el móvil o el portátil conectados a la LAN institucional, sin que los expedientes salgan de la red.
- **Panel y exportación para el reclutador**: la empresa accede a su propio panel con los candidatos preseleccionados y descarga el listado en su formato, reduciendo el ida y vuelta por correo.
- **Auditoría interna de un proceso pasado**: los snapshots versionados de requisitos y decisiones permiten reconstruir por qué un estudiante fue considerado elegible o no en una convocatoria concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El único dato cuantitativo de verificación que aparece en la model card es la insignia "Tests: 149 Passing", junto con el enlace a una sección de verificación y pruebas. No se aportan métricas de precisión del extractor de requisitos, ni tiempos de resolución de CP-SAT, ni latencias de API, ni comparaciones con procesos manuales.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el sistema no ejecuta ningún modelo neuronal y no requiere GPU.
- GPU recomendadas: ninguna. El cuello de botella es la CPU, concretamente el solver OR-Tools CP-SAT (v9.11), que se beneficia de más núcleos y de más hilos de búsqueda.
- GPU de consumo: irrelevante para este despliegue.
- Memoria y almacenamiento: no disponibles en la información proporcionada; el estado persistente reside en SQLite en modo WAL sobre disco local, y el tamaño del repositorio es de 0.0 GB.
- Opciones de despliegue: Hugging Face Spaces (existe una demo enlazada), contenedor Docker, máquina virtual en nube pública, o instalación en red institucional aislada (air-gapped) con control total del dato. El frontend se sirve como build estático de Vite.
- Latencia y throughput estimados: no disponibles. No se publican tiempos de resolución para instancias de N candidatos, M salas y K paneles, que es el parámetro crítico para dimensionar el hardware.
- Requisito de red: el escenario de privacidad descrito exige acceso por LAN; no se documentan requisitos de ancho de banda ni de TLS.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de especificaciones comparables para confrontar esta aplicación con alternativas de la misma categoría (sistemas de gestión de reclutamiento en campus, planificadores genéricos de entrevistas o suites de ATS comerciales). La tabla siguiente recoge únicamente los campos que pueden compararse con la información disponible.

| Criterio | campus-placement-engine | Alternativa ATS comercial | Planificador genérico de agendas |
|---|---|---|---|
| Naturaleza | Aplicación web autoalojable | SaaS propietario | Librería o servicio de calendario |
| Pesos de modelo | No aplica | No disponible | No disponible |
| Contexto | No aplica | No disponible | No disponible |
| Licencia | MIT según la insignia; "no disponible" en metadatos | No disponible | No disponible |
| Datos en red local | Sí, despliegue air-gapped declarado | No disponible | No disponible |
| Rendimiento publicado | No disponible (solo 149 tests pasando) | No disponible | No disponible |

## Limitaciones y advertencias

- **No es un modelo de IA**: no hay pesos, ni safetensors, ni GGUF, ni pipeline de Hugging Face. Cualquier expectativa de inferencia de lenguaje, visión o tool calling queda fuera del alcance de este repositorio.
- **Licencia ambigua**: la insignia de la model card apunta a MIT, pero los metadatos de Hugging Face devuelven "no disponible". Antes de un uso comercial o institucional conviene verificar el archivo LICENSE del repositorio, que no se ha podido consultar en la información proporcionada.
- **Validación comunitaria nula**: cero descargas y cero likes en el momento de la consulta, repositorio de 0.0 GB y model card aparentemente truncada (el texto se corta a mitad de la sección de simulación). No hay evidencia pública de despliegues reales.
- **Ausencia de benchmarks**: no se publican métricas de precisión del extractor de requisitos ni de exhaustividad. Un fallo silencioso en la extracción de un umbral de CGPA o de una rama admitida afecta directamente a la elegibilidad de estudiantes reales.
- **Riesgo de error en la extracción basada en AST**: la aproximación determinista funciona bien con formatos conocidos, pero no se documenta su comportamiento ante anuncios con tablas, imágenes escaneadas o redacciones atípicas; no se indica si hay un mecanismo de reserva.
- **Escalabilidad del solver no cuantificada**: CP-SAT es exacto, y los problemas de programación con restricciones pueden volverse costosos con muchas salas, paneles y ventanas temporales. Sin tiempos de resolución publicados no puede evaluarse el límite práctico de la instancia.
- **SQLite en modo WAL**: es un almacén local de un solo nodo. No se documenta estrategia de réplica, copia de seguridad ni concurrencia multiusuario intensiva, lo que condiciona el despliegue institucional a una sola instancia.
- **Datos personales sensibles**: el sistema trata expedientes académicos y transcripciones. La model card menciona control de acceso basado en roles y cifrado, pero no se detallan mecanismos concretos de cifrado en reposo, retención ni trazabilidad de accesos; un despliegue real en la UE exige evaluación de conformidad con el RGPD.
- **Idioma**: la documentación y la interfaz descritas están en inglés y no se declaran otros idiomas soportados, lo que puede requerir trabajo de localización para instituciones hispanohablantes.
- **Fechas de metadatos inconsistentes**: los campos de creación y actualización indican 2026-10-24, posteriores a la fecha habitual de consulta; conviene tratarlos con cautela.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/deeep-sec/campus-placement-engine
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/deeep-sec/campus-placement-engine-demo
- FastAPI: https://fastapi.tiangolo.com
- React: https://reactjs.org/
- Vite: https://vitejs.dev/
- Tailwind CSS: https://tailwindcss.com/
- Google OR-Tools (CP-SAT): https://developers.google.com/optimization
- SQLite: https://sqlite.org/

Nota: los resultados de la búsqueda web realizada (DeepL, DeepSeek y el juego deeeep.io) no guardan relación con este repositorio y se descartan por no ser fuentes relevantes. No se han encontrado papers, blogs técnicos ni repositorios de código asociados a este proyecto en la información disponible.
