# smlflg/agentic-owner-tracker

## Resumen

Agentic owner tracker no es un modelo de inteligencia artificial, sino una herramienta web local publicada en Hugging Face bajo el identificador `smlflg/agentic-owner-tracker`. Se presenta como una prueba de concepto de HAI (interacción humano-agente) cuyo objetivo es visualizar en una rejilla diaria si el trabajo realizado por agentes ha seguido siendo "poseíble" por la persona: es decir, si un humano puede decidir todavía qué ocurre después. El repositorio no contiene pesos, configuraciones de transformer ni artefactos de inferencia, y su model card describe una aplicación estática más un script de importación.

El funcionamiento es deliberadamente sencillo: la interfaz muestra días de actividad de agentes, días de sobrecarga, días marcados manualmente como humanos y señales de propiedad registradas a mano. Los datos se derivan de las sesiones de Codex leyendo ubicaciones de ficheros y contando registros JSONL, sin almacenar prompts, respuestas, contenidos de ficheros, secretos ni datos de navegador.

Su relevancia es de nicho y experimental, no de ecosistema de modelos: el repositorio acumula 0 descargas y 0 likes, no declara licencia ni idiomas, y la model card no incluye arquitectura, parámetros ni contexto porque no existen. La búsqueda web asociada no devolvió ningún resultado relacionado con el proyecto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Tipo de artefacto | Herramienta web local (no es un modelo de IA; no contiene pesos) |
| Arquitectura | no aplica (HTML + CSS + JavaScript estáticos y script Python de importación) |
| Parámetros totales | no aplica |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantización | no aplica |
| Idiomas soportados | no disponible (la interfaz y la documentación están redactadas en inglés) |
| Licencia | no disponible (la model card no especifica licencia alguna) |
| Formato de pesos | no aplica (los datos se almacenan en JSON) |
| Autor | smlflg |
| Repositorio | https://huggingface.co/smlflg/agentic-owner-tracker |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-16 / 2026-09-16 |
| Stack técnico | HTML, CSS, JavaScript, Python 3 (biblioteca estándar), JSON |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

No existe entrenamiento ni modelo subyacente. El proyecto es una aplicación local compuesta por `index.html`, `styles.css` y `app.js`, acompañada de datos de ejemplo (`data/demo-owner-map.json`), un fichero de anulaciones de ejemplo (`data/local-overrides.example.json`), un importador en Python (`scripts/import_codex_sessions.py`) y una batería de pruebas con `unittest` (`tests/test_import_codex_sessions.py`). El estado se persiste en JSON: `data/local-owner-map.json` y `data/local-overrides.json` quedan excluidos del control de versiones por git.

El único procesamiento es heurístico y local: el importador lee las ubicaciones de los ficheros de sesión de Codex y cuenta registros JSONL para derivar metadatos como fecha, número de sesiones, número de eventos, estado y contadores de señales de propiedad. Sobre ese mapa derivado se pueden aplicar anulaciones manuales que marcan un día como `owner` con notas y un contador de señales. No hay dataset de entrenamiento, ni fases de RLHF o DPO, ni innovaciones de atención, decodificación especulativa o similares.

## Capacidades

- Visualización en rejilla del estado diario del trabajo agéntico, con cuatro categorías: días de agente, días de sobrecarga, días humanos y señales de propiedad.
- Importación de sesiones de Codex a partir de las rutas de los ficheros, contando registros JSONL.
- Aplicación de anulaciones manuales por fecha, con estado, número de señales de propiedad y notas en texto libre.
- Ejecución en modo demostración gracias a `data/demo-owner-map.json`, sin necesidad de registros reales.
- Funcionamiento local-first con una frontera de privacidad explícita: no guarda prompts, respuestas, contenidos de ficheros, secretos ni datos de navegador.
- Exportación implícita de un mapa de estado en JSON apto para inspección manual o tratamiento posterior.
- Pruebas automatizadas mediante `python3 -m unittest discover -s tests`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades multilingües ni modo de pensamiento.

## Casos de uso

- Retrospección individual de desarrolladores: cargar el mapa local generado a partir de las sesiones de Codex para identificar en qué días el volumen de sesiones empezó a generar presión de propiedad y ajustar el ritmo de trabajo.
- Supervisión de sobrecarga en equipos pequeños: usar los contadores de sesiones y eventos por día como indicador cualitativo de cuándo una persona acumuló demasiadas tareas de verificación, aceptación o rechazo pendientes.
- Investigación en interacción humano-agente: servir como instrumento de registro subjetivo en estudios sobre supervisión humana, anotando manualmente los días en que una decisión concreta volvió a ser asumible.
- Demostración docente: el modo demo permite explicar en talleres el concepto de "trabajo agéntico poseíble" sin necesidad de exponer registros reales de ninguna persona.
- Autoevaluación de cambios de flujo de trabajo: comparar mapas generados antes y después de modificar la política de uso de agentes, ya que cada mapa es un JSON con fechas y contadores inspeccionables.
- Integración como fuente de datos auxiliar: el fichero `data/local-owner-map.json` puede consumirse desde otros scripts locales para generar informes propios, siempre que se respete la frontera de privacidad del proyecto.
- Registro de decisiones en proyectos con agentes: anotar en `local-overrides.json` las fechas en que una decisión concreta quedó cerrada, dejando una traza de propiedad separada de la densidad de sesiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El proyecto no es un modelo y no cuenta con evaluaciones de MMLU, HumanEval, GSM8K ni equivalentes. Los únicos datos cuantitativos publicados en el repositorio son métricas de adopción:

| Métrica | Valor |
|---|---|
| Descargas | 0 |
| Likes | 0 |
| Fecha de creación | 2026-09-16T19:22:15.000Z |
| Última actualización | 2026-09-16T19:22:16.000Z |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay inferencia de red neuronal ni pesos que cargar.
- GPU recomendadas: ninguna; el proyecto no utiliza aceleración por GPU.
- Compatibilidad con GPU de consumo: no aplica; funciona en cualquier equipo con un navegador y Python 3 para el importador.
- CPU y memoria: no disponibles; la model card no declara requisitos mínimos. El consumo dependerá del tamaño de los ficheros JSONL de sesiones de Codex que se procesen.
- Opciones de despliegue: servidor HTTP local con `python3 -m http.server 8765`, accesible en `http://127.0.0.1:8765`. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni runtimes de inferencia, ya que no existe modelo.
- Latencia y throughput: no disponibles; no se publican mediciones. El único coste relevante es el tiempo de lectura y agregación de los registros JSONL locales.
- Dependencias: el importador se apoya en la biblioteca estándar de Python 3 según la estructura de scripts y pruebas descrita.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA: no tiene parámetros, contexto, licencia de pesos ni rendimiento medible en tareas de lenguaje. Las categorías funcionalmente próximas serían las plataformas de observabilidad de agentes, los paneles de productividad personal y los cuadernos de seguimiento manual, pero la información proporcionada no incluye datos verificables sobre ninguna de ellas, por lo que no se puede establecer una comparación con cifras.

| Alternativa | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Agentic owner tracker | no aplica | no aplica | no disponible | Repositorio público con 0 descargas |
| Plataformas de observabilidad de agentes | no disponible | no disponible | no disponible | no disponible |
| Paneles de productividad personal | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en la model card, no hay autorización explícita de uso, modificación ni redistribución, tampoco comercial.
- Adopción nula: 0 descargas y 0 likes, sin señales de revisión por terceros ni de uso en producción.
- Validación externa inexistente: la búsqueda web no devolvió ningún resultado relacionado con el proyecto; únicamente aparecieron páginas de un juego de casino sin relación alguna.
- Metadatos incompletos en Hugging Face: sin pipeline, sin idiomas, sin licencia y únicamente con la etiqueta `region:us`.
- Alcance limitado a Codex: el importador descrito lee sesiones de Codex; no se documentan integraciones con otros agentes o proveedores.
- Umbral de sobrecarga no documentado: la model card no explica qué densidad de sesiones o eventos convierte un día en "día de sobrecarga", por lo que la clasificación no es auditable a partir de la información disponible.
- Subjetividad del marcado manual: los estados humanos y las señales de propiedad dependen de anotaciones de la propia persona, con el sesgo de autoinforme que ello implica.
- Frontera de privacidad dependiente de la configuración: aunque no se almacenan prompts ni contenidos, los ficheros de salida se escriben en disco y solo están excluidos de git si se respeta la configuración del repositorio.
- Rutas de ejemplo no portables: los comandos de la model card usan rutas absolutas del tipo `~/Projekte/agentic-owner-tracker`, que deben adaptarse en cada entorno.
- Fechas de creación y actualización en 2026, posteriores a la fecha habitual de consulta, lo que dificulta interpretar la antigüedad real del proyecto.
- No hay riesgo de alucinación de lenguaje, pero sí de interpretación errónea: la rejilla es un mapa de estado heurístico y no una medida objetiva de productividad ni de carga de trabajo.
- Documentación mínima: la model card es la única fuente de información técnica y no describe el esquema JSON completo, la política de versionado ni el comportamiento ante ficheros de sesión corruptos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/smlflg/agentic-owner-tracker
- Aplicación local tras el arranque del servidor: http://127.0.0.1:8765
- Fichero de datos de demostración: `data/demo-owner-map.json`
- Fichero de anulaciones de ejemplo: `data/local-overrides.example.json`
- Script de importación: `scripts/import_codex_sessions.py`
- Pruebas: `tests/test_import_codex_sessions.py`
- Resultados de la búsqueda web: no disponibles; las URLs devueltas pertenecen a sitios de un juego de casino y no guardan relación con el proyecto, por lo que se descartan como fuentes.
