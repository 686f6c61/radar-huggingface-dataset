# smlflg/StudyAgent

## Resumen

StudyAgent no es un modelo de lenguaje en el sentido estricto, sino un repositorio de aplicacion publicado en HuggingFace bajo el identificador `smlflg/StudyAgent`. Se trata de un asistente de estudio orientado a estudiantes con TDAH (el autor usa la sigla alemana ADHS), cuyo objetivo es acompanar al usuario a lo largo del semestre sin planes rigidos: propone micro-pasos, emplea un tono de "colega" y coloca el refuerzo dopaminergico al inicio de la tarea y no al completarla.

El sistema se implementa como una aplicacion web con backend FastAPI, persistencia en SQLite via SQLAlchemy, plantillas Jinja2 y htmx para la interactividad del cliente. La generacion de micro-pasos se delega en la API externa MiniMax M2.5, con un modo de respaldo (fallback) que produce pasos simulados cuando no hay clave `MINIMAX_API_KEY` configurada. Segun la propia model card, el proyecto esta en estado MVP, con una prueba E2E de navegador y el caso limite de fecha limite superada pendientes.

La relevancia de esta ficha es limitada desde el punto de vista de evaluacion de modelos: no se publican pesos, arquitectura, datos de entrenamiento ni benchmarks. Su interes real reside en el patron de diseno de agentes aplicados (gestion de tareas, planificacion elastica, modo panico), no en capacidades de inferencia propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es una aplicacion web, no un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |
| Autor | smlflg |
| Identificador | smlflg/StudyAgent |
| Pipeline declarado | no disponible |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |
| Modelo externo invocado | MiniMax M2.5 (via API) |
| Stack de la aplicacion | FastAPI, SQLAlchemy, SQLite, htmx, Jinja2 |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura de red neuronal, volumen de tokens de entrenamiento, composicion del dataset ni tecnicas de alineamiento (RLHF, DPO u otras), porque el repositorio no publica un modelo entrenado. Lo que si describe la model card es la arquitectura del software: una aplicacion FastAPI que sirve una interfaz web renderizada con Jinja2 y actualizada parcialmente mediante htmx, con una base de datos SQLite gestionada por SQLAlchemy.

La logica funcional destacable, y que puede considerarse el "diseno de agente" del proyecto, incluye: generacion automatica de micro-pasos al crear una fecha limite, planificacion elastica que comprime el plan cuando los pasos exceden el tiempo restante, replanificacion que elimina pasos pendientes y omitidos para generar un plan nuevo, seguimiento de sesiones con autocierre tras 30 minutos de inactividad, y un modo panico que se activa a menos de 48 horas de la fecha limite y reduce el plan a entre 3 y 4 pasos esenciales. El numero de asignaturas activas esta limitado a 2 mediante validacion en el servidor. No se documenta ningun entrenamiento propio.

## Capacidades

- Generacion de micro-pasos de estudio a partir de una fecha limite, delegada en la API de MiniMax M2.5.
- Modo de respaldo sin clave de API: genera pasos simulados para permitir la operacion en desarrollo.
- Planificacion elastica: comprime automaticamente el plan cuando los pasos generados no caben en el tiempo disponible.
- Replanificacion: borra pasos pendientes y omitidos y genera un plan nuevo.
- Modo panico: activacion por umbral temporal (menos de 48 horas) con reduccion a 3-4 pasos esenciales.
- Seguimiento de sesiones: inicio automatico y cierre automatico tras 30 minutos de inactividad.
- Gestion de asignaturas con limite de trabajo en curso (WIP) de 2, aplicado en el servidor.
- Interfaz de gestion de pasos con acciones de completar y omitir integradas mediante htmx.
- Panel de control con asignaturas activas, proximas fechas limite, siguiente paso, banner de sesion e indicadores de panico.
- No se documentan capacidades de vision, audio, tool calling, function calling ni razonamiento multi-paso mas alla de la generacion de pasos.

## Casos de uso

- Acompanamiento de estudio diario para estudiantes con TDAH: el sistema mantiene un unico siguiente paso visible y evita la paralisis por planificacion excesiva, sustituyendo listas largas por micro-pasos generados automaticamente.
- Preparacion de examenes con fecha fija: al crear una fecha limite se genera un plan de pasos; si el tiempo restante se reduce, la planificacion elastica comprime el plan en lugar de dejar tareas atrasadas.
- Gestion de crisis de ultima hora: el modo panico, activado a menos de 48 horas, reduce el plan a 3-4 pasos esenciales y evita que el estudiante se enfrente a una lista inviable.
- Reorganizacion de un plan fallido: la funcion de replanificacion elimina los pasos pendientes y omitidos y genera un plan nuevo, util cuando el estudiante ha perdido varios dias.
- Limitacion de carga de trabajo simultanea: el limite WIP de 2 asignaturas impide que el usuario abra mas frentes de los que puede sostener, un patron habitual en herramientas anti-procrastinacion.
- Medicion de patrones de sesion: el seguimiento automatico de sesiones con cierre por inactividad permite registrar cuanto tiempo real dedica el estudiante y detectar abandonos.
- Prototipado de agentes con proveedor externo: el codigo sirve como referencia de integracion de una API de LLM (MiniMax M2.5) en una aplicacion FastAPI con respaldo local cuando no hay credenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones del modelo ni metricas de rendimiento de la aplicacion (latencia, throughput, tasa de exito de generacion de pasos). La unica indicacion de estado es cualitativa: "MVP shipped. Browser E2E test and past-deadline edge case pending".

## Requisitos de hardware

- VRAM para inferencia: no aplica localmente, ya que la generacion de texto se realiza mediante la API remota de MiniMax M2.5; el repositorio no publica pesos que puedan ejecutarse en local.
- GPU recomendadas: no disponible para el modelo. Para la aplicacion en si no se requiere GPU.
- Ejecucion en GPU de consumo: no aplica. La aplicacion es un servidor web en Python que no realiza inferencia local.
- Entorno de ejecucion descrito por el autor: Python con entorno virtual (`python3 -m venv .venv`), instalacion de dependencias via `requirements.txt` y arranque con `uvicorn main:app --reload` en `http://localhost:8000`.
- Almacenamiento: SQLite como base de datos embebida, sin requisitos de disco significativos documentados.
- Opciones de despliegue indicadas: uvicorn como servidor ASGI. No se mencionan vLLM, llama.cpp, Ollama ni TGI, dado que no hay pesos que servir.
- Latencia y throughput: no disponibles. Dependerian exclusivamente de la API de MiniMax M2.5 y de la red, no de hardware local.

## Comparativa con modelos similares

No disponible. StudyAgent no es un modelo de lenguaje y no publica pesos, parametros ni resultados de evaluacion, por lo que no es comparable con modelos de la misma categoria. Como referencia de categoria funcional (asistentes de productividad y gestion de tareas para estudiantes), existirian alternativas cerradas y aplicaciones especializadas, pero la informacion proporcionada no incluye ninguna para establecer una comparacion con datos verificables.

| Criterio | StudyAgent | Alternativas comparables |
|---|---|---|
| Parametros | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento | no disponible | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | repositorio en HuggingFace, 0 descargas, 0 likes | no disponible |

## Limitaciones y advertencias

- No es un modelo: el repositorio contiene una aplicacion, no pesos ni artefactos de inferencia. Cualquier expectativa de uso como modelo de lenguaje es incorrecta.
- Ausencia de licencia declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; debe contactarse con el autor antes de cualquier uso en produccion.
- Dependencia de un proveedor externo: las capacidades reales de generacion dependen de la API de MiniMax M2.5, sujeta a disponibilidad, coste, limites de uso y cambios de version por parte del proveedor.
- Modo de respaldo no funcional como producto: sin `MINIMAX_API_KEY` el sistema genera pasos simulados, lo que puede dar lugar a un comportamiento aparentemente correcto pero sin valor real.
- Estado MVP declarado por el autor: pendientes una prueba E2E de navegador y el caso limite de fecha limite superada, lo que implica comportamiento no verificado en ese escenario.
- Idiomas soportados no documentados: no se especifica en que idiomas genera los pasos ni si la interfaz esta localizada.
- Sin datos sobre sesgos, alucinacion o robustez: al no publicarse evaluaciones, no es posible cuantificar el riesgo de pasos irrelevantes, incorrectos o desalineados con el temario real del estudiante.
- Ambito de aplicacion muy acotado: el diseno asume un usuario individual con TDAH y un modelo de asignaturas y fechas limite; no esta pensado para uso institucional ni multiusuario.
- Fechas de publicacion futuras en los metadatos (2026-09-16): conviene tratar la informacion temporal del repositorio con cautela.
- Los resultados de la busqueda web proporcionada no guardan relacion con el modelo ni con el proyecto y no aportan datos verificables.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/smlflg/StudyAgent
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs, repositorios o demos) asociados a este proyecto.
