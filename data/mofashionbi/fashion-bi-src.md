# mofashionbi/fashion-bi-src

## Resumen

`mofashionbi/fashion-bi-src` es un repositorio alojado en Hugging Face que no contiene un modelo de lenguaje, sino el codigo fuente de una aplicacion web de business intelligence (BI) orientada al sector de la moda. El proyecto esta construido con Django como framework de backend, SQLite como base de datos y amCharts 5 para la visualizacion de graficos, y esta disenado para ejecutarse localmente en Windows mediante un script `run.bat` o manualmente con `python manage.py runserver`.

El proposito del repositorio es servir de plantilla o demostracion de un panel analitico para retail de moda, con datos simulados del ano 2025 y montos expresados en libras egipcias (EGP). Incluye una base de datos preconstruida (`fashion.db`) con 21.618 filas, un esquema SQL (`schema.sql`) y un script de reconstruccion (`rebuild_db.py`) que regenera la base a partir de ficheros CSV.

Es relevante unicamente como referencia de implementacion de dashboards BI con Django y amCharts 5 en entornos offline (sin CDN ni npm), no como modelo de IA. No se trata de un modelo entrenado, no tiene pesos, no expone un pipeline de Hugging Face y la model card no proporciona informacion sobre arquitectura de red neuronal, parametros, contexto ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una aplicacion web Django) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene codigo Python, SQL, HTML/CSS/JS, CSV y una base SQLite) |

Otros datos tecnicos declarados en la model card:

| Elemento | Detalle |
|---|---|
| Framework backend | Django |
| Base de datos | SQLite (`fashion.db`, 21.618 filas) |
| Esquema | `schema.sql` |
| Reconstruccion de BD | `rebuild_db.py` a partir de CSV |
| Visualizacion | amCharts 5 (bundled localmente en `static/lib/amcharts5/`) |
| Dependencias frontend | `index.js`, `xy.js`, `themes/Animated.js` (sin CDN ni npm) |
| Endpoints API | `/api/filters`, `/api/kpis`, `/api/by-category`, `/api/by-month`, `/api/by-season`, `/api/branch-share`, `/api/category-by-branch` |
| Filtros | `?branch=&category=&season=&month=` (listas separadas por comas) |
| Datos | Simulados, retail de moda, ano 2025, importes en EGP |
| Layout | v3, encaja en 1366x768 y 1920x1080 sin scroll de pagina |

## Arquitectura y entrenamiento

No aplica en el sentido de un modelo de IA: no hay arquitectura de red neuronal, dataset de entrenamiento, tokens procesados ni fases de RLHF/DPO. La "arquitectura" del repositorio es una aplicacion web de tres capas: backend Django que sirve endpoints JSON bajo `/api/`, base de datos SQLite con un esquema definido en `schema.sql`, y un frontend estatico en HTML/CSS/JS que consume esos endpoints y renderiza graficos con amCharts 5.

La unica "innovacion" tecnica destacable es la decision de diseno del frontend: amCharts 5 se incluye empaquetado localmente (sin CDN ni npm), lo que permite funcionamiento completamente offline. Las visualizaciones siguen reglas didacticas concretas (atribuidas a una leccion "DSAI 203"): barras horizontales ordenadas en lugar de tartas/donuts, barras agrupadas en lugar de apiladas, tooltips en lugar de etiquetas de datos, esquema de color con resaltado y grises, tablas de detalle junto a los graficos y cross-filtering al hacer clic en una barra.

## Capacidades

- Servir un panel BI local con datos simulados de retail de moda (2025, EGP).
- Exponer una API JSON con endpoints de filtros, KPIs y agregaciones por categoria, mes, temporada, sucursal y cruce categoria-sucursal.
- Aplicar filtros combinables mediante query string (`branch`, `category`, `season`, `month`, con listas separadas por comas).
- Renderizar graficos interactivos con amCharts 5 (barras horizontales ordenadas, barras agrupadas, tooltips, cross-filtering al clic).
- Funcionar completamente offline: sin CDN, sin npm, con librerias empaquetadas en `static/lib/amcharts5/`.
- Reconstruir la base de datos desde CSV mediante `rebuild_db.py`.
- Ejecucion simplificada en Windows con `run.bat` (o manual con `manage.py runserver 8000`).
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, agentes ni capacidades multilingues propias de un LLM.

## Casos de uso

- Prototipo de dashboard de retail de moda: sirve como base ejecutable para demostrar un panel analitico con KPIs, filtros y graficos, partiendo de datos simulados y sustituyendolos despues por datos reales.
- Plantilla docente de visualizacion: las reglas de graficos (barras en lugar de tartas, tooltips en lugar de etiquetas, cross-filtering) lo hacen util como ejemplo en cursos de analitica o visualizacion de datos.
- Entorno de demostracion offline: al empaquetar amCharts 5 localmente, puede desplegarse en maquinas sin acceso a internet o en redes restringidas para presentaciones.
- Base para integracion con Django en produccion: los endpoints `/api/*` y el esquema SQLite sirven de punto de partida para migrar a PostgreSQL y anadir autenticacion o capas de permisos.
- Analisis exploratorio de ventas por sucursal, categoria, temporada y mes: los filtros combinables y el cruce categoria-sucursal permiten segmentaciones rapidas sobre las 21.618 filas de ejemplo.
- Referencia de layout responsive fijo: el diseno v3 encaja en 1366x768 y 1920x1080 sin scroll, util como plantilla para paneles que deben verse completos en pantalla sin desplazamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no es un modelo de IA y no reporta metricas de rendimiento de inferencia, precision ni evaluacion de tareas.

## Requisitos de hardware

- VRAM: no aplica (no hay modelo de IA que cargar en GPU).
- GPU: no aplica; la aplicacion se ejecuta en CPU.
- Hardware minimo estimado: cualquier equipo capaz de ejecutar Python y Django; el unico requisito reseñable es disponer de un navegador moderno para amCharts 5.
- Cabida en consumer GPU: no aplica.
- Despliegue: servidor de desarrollo de Django (`python manage.py runserver 8000`) o `run.bat` en Windows; para produccion habria que anadir un servidor WSGI/ASGI (Gunicorn, uWSGI, etc.) y, previsiblemente, migrar SQLite a un motor cliente-servidor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado alternativas comparables en la informacion recibida, y al no tratarse de un modelo de IA la comparacion con LLMs u otros modelos de Hugging Face no seria homogenea.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa lenguaje natural ni admite prompts. Cualquier uso esperando capacidades de LLM sera fallido.
- Los datos son simulados (retail de moda 2025, importes en EGP) y no representan un negocio real; no deben usarse para decisiones comerciales sin sustitucion por datos reales.
- Licencia no disponible: no se puede asumir permiso de uso comercial, redistribucion ni modificacion. Es necesario contactar con el autor antes de reutilizarlo en produccion.
- Idiomas soportados no declarados; la model card esta en ingles y el codigo no documenta internacionalizacion.
- SQLite no es adecuada para cargas concurrentes altas; el propio autor la presenta como base de demostracion, no como backend de produccion.
- El servidor de desarrollo de Django (`runserver`) no es apto para produccion (sin seguridad, sin gestion de procesos, sin TLS).
- Sin pipeline declarado, sin descargas y sin likes en el momento de la consulta: proyecto practicamente sin validacion por parte de la comunidad.
- Riesgo de alucinacion: no aplica al no ser un modelo generativo; el riesgo equivalente es interpretar los datos simulados como reales.
- El layout esta optimizado para 1366x768 y 1920x1080; en otras resoluciones el comportamiento no esta documentado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mofashionbi/fashion-bi-src
- No se han encontrado en la informacion proporcionada otros enlaces (papers, blogs, repos, demos) asociados al proyecto.
