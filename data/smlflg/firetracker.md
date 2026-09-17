# smlflg/FireTracker

## Resumen

FireTracker es un repositorio publicado en Hugging Face por el usuario smlflg que no contiene un modelo de inteligencia artificial, sino el codigo fuente de una aplicacion web de finanzas personales. Se trata de un panel local ("local-first") de un solo usuario para el seguimiento de activos, el calculo del progreso hacia la independencia financiera (FIRE, *Financial Independence, Retire Early*) y la simulacion de escenarios hipoteticos del tipo "que pasaria si ahorro X mas al mes". El autor lo describe como un MVP ya entregado, sin cuentas en la nube, sin autenticacion y sin conexion bancaria externa.

La aplicacion se construye sobre FastAPI, SQLAlchemy y SQLite en el backend, con Jinja2 y htmx en el frontend, Tailwind CSS para los estilos y Chart.js para la visualizacion de la proyeccion a 30 anos. El flujo principal es deliberadamente minimalista: un asistente de configuracion de tres campos que desemboca directamente en el panel con el porcentaje de independencia financiera (FI%), la fecha estimada de independencia, la tasa de ahorro y la proyeccion a 30 anos.

Su relevancia en el contexto de un blog de IA open source es limitada, ya que no incluye pesos, arquitectura de red neuronal, tokenizador ni proceso de entrenamiento. Se documenta aqui como artefacto alojado en Hugging Face y porque puede servir como referencia de proyecto local-first con licencia permisiva, pero cualquier evaluacion como modelo de lenguaje no es aplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo de IA). Stack de aplicacion web: FastAPI, SQLAlchemy, SQLite, Jinja2, htmx, Tailwind CSS, Chart.js |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible. La model card esta redactada en ingles y el parser CSV esta disenado para extractos bancarios alemanes |
| Licencia | MIT (segun la model card; los metadatos de Hugging Face la marcan como "no disponible") |
| Formato de pesos | no aplica. El repositorio contiene codigo fuente Python y no publica pesos (safetensors, GGUF u otros) |
| Pipeline declarado en Hugging Face | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 (segun metadatos de Hugging Face) |
| Fecha de ultima actualizacion | 2026-09-16 (segun metadatos de Hugging Face) |
| Tests incluidos | 17 tests unitarios del nucleo de calculo FIRE; 3 flujos E2E de Playwright (setup, dashboard, creacion de activos) |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red neuronal. El proyecto es una aplicacion web monolitica ejecutada en local: FastAPI expone la logica de servidor y las rutas, SQLAlchemy gestiona la persistencia sobre una base de datos SQLite, Jinja2 renderiza las plantillas HTML y htmx se encarga de las actualizaciones parciales de la interfaz sin recarga completa, tal como se usa en el CRUD de activos. Tailwind CSS cubre la capa de estilos y Chart.js la representacion de la proyeccion a 30 anos.

El nucleo funcional es un modulo de matematicas FIRE (`test_fire_math.py`) con 17 pruebas unitarias que validan el calculo del porcentaje de independencia financiera, la tasa de ahorro y la fecha de independencia. La model card menciona explicitamente la correccion de un caso limite en `fi_date`. La API de escenarios devuelve un campo `diff_years`, que expresa en anos la diferencia entre la fecha de independencia actual y la resultante de un cambio en el ahorro. No se documentan innovaciones tecnicas adicionales, ni procesos de RLHF, DPO o ajuste alguno.

## Capacidades

- Panel de seguimiento con FI%, fecha de independencia financiera, tasa de ahorro y proyeccion a 30 anos.
- Agrupacion de activos por tipo.
- CRUD completo de activos: creacion, edicion mediante actualizacion en linea con htmx y borrado.
- API de escenarios "que pasaria si ahorro X mas", con calculo de `diff_years`.
- Importacion de CSV bancario aleman con delimitador de punto y coma y separador decimal de coma.
- Exportacion a JSON del perfil, los activos y las instantaneas (snapshots) como copia de seguridad.
- Configuracion de parametros FIRE: tasa de retirada segura (SWR), rentabilidad esperada, inflacion y edad objetivo de jubilacion.
- Datos de demostracion mediante `seed.py`, con un perfil de ejemplo y 5 activos.
- No incluye capacidades de generacion de texto, razonamiento, codigo, matematicas generales, vision, audio, tool calling ni agentes.

## Casos de uso

- Planificacion financiera personal: un usuario introduce sus activos y sus parametros (SWR, rentabilidad, inflacion) y obtiene una fecha estimada de independencia financiera y una proyeccion a 30 anos, todo ello sin enviar datos a ningun servicio externo.
- Simulacion de decisiones de ahorro: la API de escenarios permite comparar en anos el impacto de aumentar la aportacion mensual, lo que resulta util para evaluar cambios de habitos o de empleo antes de comprometerse.
- Consolidacion de patrimonio disperso: el CRUD y la agrupacion por tipo permiten mantener en una unica base SQLite activos de naturaleza heterogenea (efectivo, inversiones, inmuebles) sin depender de una conexion bancaria.
- Migracion desde hojas de calculo: la importacion de CSV bancario aleman permite cargar movimientos o saldos exportados con punto y coma como delimitador, un formato habitual en banca alemana.
- Copia de seguridad y portabilidad: la exportacion a JSON del perfil, los activos y las instantaneas facilita respaldos manuales y la migracion entre maquinas, ya que toda la informacion reside en un unico fichero SQLite.
- Demo o evaluacion tecnica: `seed.py` genera un perfil de ejemplo con 5 activos, lo que permite probar la aplicacion en local o en un entorno de desarrollo sin introducir datos reales.
- Referencia de arquitectura para desarrolladores: el uso combinado de FastAPI, htmx y SQLite con pruebas unitarias y E2E de Playwright sirve como plantilla de aplicacion local-first de un solo usuario.
- Uso educativo sobre finanzas personales: al ser una herramienta de visualizacion y planificacion, permite experimentar con parametros como la tasa de retirada segura sin implicar recomendaciones de inversion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen benchmarks de modelos de lenguaje aplicables, ya que el repositorio no contiene un modelo. Los unicos datos de verificacion aportados por la model card son:

| Metrica | Valor |
|---|---|
| Tests unitarios del nucleo FIRE | 17 en estado "passing" |
| Flujos E2E (Playwright) | 3 (setup, dashboard, creacion de activos) |
| Incidencias corregidas | Caso limite de `fi_date` |
| Funcionalidad pendiente | Graficos historicos de activos (fuera del alcance actual) |

## Requisitos de hardware

- VRAM: no aplica. No requiere GPU; la inferencia no existe en este proyecto.
- GPU recomendadas: ninguna. La aplicacion se ejecuta integramente en CPU.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos de ejecucion: Python 3 con entorno virtual (`python3 -m venv .venv`), instalacion de dependencias mediante `pip install -r requirements.txt` y arranque con `uvicorn main:app --reload --port 8050`. El servicio escucha en `http://localhost:8050` y redirige a `/setup` en el primer arranque.
- Almacenamiento: una base de datos SQLite en disco cuyo tamano depende del numero de activos y snapshots; no se especifica una cifra concreta (no disponible).
- Memoria RAM y CPU minimas: no disponible en la informacion proporcionada.
- Opciones de despliegue: ejecucion local con uvicorn sobre un entorno virtual. No se documentan contenedores, orquestadores ni servicios gestionados.
- Latencia y throughput: no disponible. Al tratarse de una aplicacion web local de un solo usuario, no se publican mediciones de rendimiento.
- Pruebas E2E: requieren un servidor en ejecucion y la instalacion del navegador de Playwright (`playwright install chromium`).

## Comparativa con modelos similares

No procede una comparativa con modelos de lenguaje, dado que este repositorio no contiene un modelo. En la categoria de aplicaciones local-first de finanzas personales no se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa:

| Criterio | FireTracker | Alternativas de la categoria |
|---|---|---|
| Tipo de artefacto | Aplicacion web local-first (codigo fuente) | no disponible |
| Parametros | no aplica | no aplica |
| Contexto | no aplica | no aplica |
| Rendimiento en benchmarks | no disponible | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad | Repositorio en Hugging Face, 0 descargas y 0 likes | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, arquitectura de red ni proceso de entrenamiento, por lo que no puede utilizarse para generacion de texto ni ninguna tarea de inferencia.
- Alcance declarado como MVP personal y local; el autor indica explicitamente que no es un producto SaaS alojado.
- Diseno de un solo usuario: no incluye cuentas multiusuario, sincronizacion en la nube ni autenticacion. Cualquier exposicion en red requeriria anadir una capa de seguridad por cuenta del operador.
- Sin integracion automatica con APIs bancarias; la entrada de datos depende de registro manual o de la importacion CSV.
- El parser CSV esta limitado a un formato bancario aleman concredo (delimitador de punto y coma y separador decimal de coma), por lo que puede fallar con exportaciones de otros paises o formatos.
- Los graficos historicos de activos no estan implementados y figuran como trabajo futuro.
- No constituye asesoramiento financiero. La propia model card incluye un aviso explicito en ese sentido; la aplicacion es una herramienta de planificacion y visualizacion.
- La model card no documenta sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma porque no son aplicables a este tipo de artefacto.
- La licencia MIT indicada en la model card permite uso comercial, pero los metadatos de Hugging Face muestran la licencia como "no disponible"; conviene verificar el fichero `LICENSE` del repositorio antes de reutilizar el codigo.
- Las fechas de creacion y actualizacion registradas (2026-09-16) figuran asi en los metadatos de Hugging Face y no se han podido contrastar con otra fuente.
- No hay metricas publicadas de rendimiento, latencia, consumo de recursos ni cobertura de pruebas mas alla de los 17 tests unitarios y los 3 flujos E2E mencionados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/smlflg/FireTracker
- No se han encontrado enlaces adicionales relevantes en la busqueda web. Los resultados devueltos corresponden a paginas de ayuda de YouTube (`support.google.com/youtubetv`, `support.google.com/youtube/answer/9288567`, `support.google.com/youtube/answer/174084`, `support.google.com/youtube/community`, `support.google.com/youtube/answer/57741`) y no guardan relacion alguna con el proyecto FireTracker.
- No se dispone de enlace a paper, blog, repositorio de codigo independiente ni demo publica en la informacion proporcionada.
