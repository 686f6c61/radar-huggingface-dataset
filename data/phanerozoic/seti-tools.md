# phanerozoic/seti-tools

## Resumen

`phanerozoic/seti-tools` es un repositorio de software publicado en HuggingFace por el usuario `phanerozoic`, no un modelo de aprendizaje automatico. Contiene el codigo, los articulos y una base de datos de cobertura para realizar busquedas de tecnofirmas (technosignatures) sobre archivos astronomicos publicos: que ha buscado cada ejecucion y que ha encontrado. El punto de entrada es `seti.py`, invocado como `python -I seti.py <family> <approach> <mode>`, y el paquete `setitools/` agrupa clientes de archivo, marcos de referencia en reposo, busquedas espectrales y de radio, series temporales, el almacen de cobertura y, en `searches/`, doce modulos de familia.

El proyecto resuelve un problema de trazabilidad y reproducibilidad en la busqueda de tecnofirmas: cada ejecucion se registra en `coverage.db` (SQLite, una fila por ejecucion y una por objetivo buscado) y cada enfoque tiene una linea de resultado en `RESULTS.md`. Se apoya en un conjunto amplio de archivos de terceros (Gaia, Hipparcos, SIMBAD, VizieR, MAST con TESS, Kepler, HST, IUE y GALEX, IRSA con WISE y NEOWISE, Breakthrough Listen, ESO, XMM-Newton, Chandra, SDSS-IV APOGEE, DESI, GALAH, LAMOST, Fermi-LAT, IceCube, SPT-3G, RACS, VLASS, LoTSS, ALMA y Splatalogue, entre otros), lo que lo convierte en una capa de orquestacion y registro sobre infraestructura ya existente.

El repositorio ocupa 1,1 GB (principalmente por los articulos incluidos en `papers/`), requiere Python 3.11 o superior y declara `torch` solo para las rutas que usan GPU. En el momento de la consulta acumula 0 descargas y 0 likes, y la fecha de creacion registrada es el 16 de octubre de 2026. No se dispone de informacion sobre parametros, contexto ni cuantizacion porque no es un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es una red neuronal, es un paquete de software en Python para busquedas de tecnofirmas |
| Parametros totales | no aplica |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponible |
| Licencia | MIT para los archivos de codigo (`.py` y `.jl`); CC BY 4.0 para el resto, incluidos articulos, documentacion y almacen de cobertura. Ambas en `LICENSE` |
| Formato de pesos | no aplica; el repositorio contiene codigo Python, documentacion, recetas, articulos y una base SQLite (`coverage.db`) |
| Version de Python | 3.11 o superior |
| Dependencias | `requirements.txt`; `torch` unicamente para las rutas de GPU |
| Tamano del repositorio | 1,1 GB |
| Punto de entrada | `python -I seti.py <family> <approach> <mode>` |
| Configuracion | variables de entorno `SETI_DATA`, `SETI_CACHE`, `SETI_RESULTS`, `SETI_COVERAGE`, o un archivo de configuracion fuera del repositorio (claves en `local_config.example.json`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-17 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento que describir: el repositorio es una herramienta de analisis cientifico. Su estructura interna se organiza en `setitools/`, que contiene clientes de archivo, utilidades de marco de referencia en reposo (rest frames), busquedas espectrales y de radio, analisis de series temporales y el almacen de cobertura, mas un subdirectorio `searches/` con doce modulos de familia. Cada enfoque documenta en su docstring los datos que consume, la regla de deteccion que aplica y los modos disponibles, lo que actua como especificacion tecnica en lugar de una ficha de modelo.

La innovacion destacable no es algoritsmica sino de metodo: la persistencia sistematica de la cobertura. `coverage.db` almacena una fila por ejecucion y una por objetivo buscado, y el comando `python -m setitools.coverage card <target>` lista todas las ejecuciones que han cubierto un objetivo concreto, mientras que `table` regenera `RESULTS.md`. Esto permite responder a la pregunta de que region del cielo o que catalogo ya ha sido explorado con que enfoque y con que resultado, algo poco habitual en busquedas de tecnofirmas dispersas. El repositorio incluye ademas `docs/` y `recipes/` (metodos, vetting, archivos y una receta por familia), `papers/` con los articulos y sus fuentes, y un `selftest.py` para verificar la instalacion del paquete.

## Capacidades

- Orquestacion de busquedas de tecnofirmas sobre archivos astronomicos publicos mediante una interfaz de linea de comandos con familias, enfoques y modos.
- Doce modulos de familia en `searches/`, cada uno con su propia documentacion de datos, regla de deteccion y modos.
- Busquedas espectrales y de radio, con soporte de marcos de referencia en reposo.
- Analisis de series temporales (curvas de luz y datos variables en el tiempo).
- Almacen de cobertura consultable: registro por ejecucion y por objetivo, con regeneracion automatica de `RESULTS.md`.
- Clientes de archivo para un conjunto amplio de servicios astronomicos (Gaia, Hipparcos, SIMBAD, VizieR, XMatch, MAST, IRSA, ESO, ALMA y Splatalogue, entre otros citados en los agradecimientos).
- Rutas de ejecucion con GPU opcionales mediante `torch`.
- Verificacion de integridad del paquete con `selftest.py` y listado de enfoques por familia con `python -I seti.py <family>`.
- Material reproducible incluido: articulos, metodos de vetting y una receta por familia.
- Soporte de configuracion desacoplada del repositorio, apta para entornos de ejecucion automatizados.

## Casos de uso

- Busqueda de tecnofirmas en espectros de archivo: se invoca el modulo de familia correspondiente en modo espectral y el resultado queda registrado en `coverage.db`, de modo que un grupo de investigacion puede reanudar la busqueda sin repetir objetivos ya cubiertos.
- Barrido de catalogos de radio: uso de los modulos de radio sobre relevamientos como VLASS, RACS o LoTSS para buscar emisiones de banda estrecha o firmas anomalas, con el registro de cobertura como control de progreso.
- Analisis de series temporales de misiones espaciales: procesamiento de curvas de luz de TESS o Kepler buscando estructuras temporales compatibles con hipotesis de tecnofirmas, aprovechando el modulo de series temporales.
- Auditoria y reproducibilidad de campanas de busqueda: `coverage.db` y `RESULTS.md` permiten reconstruir que se ejecuto, cuando y sobre que objetivos, algo exigido en publicaciones revisadas por pares y en la replicacion de resultados.
- Vetting de candidatos: las guias de `docs/` y las recetas de `recipes/` sirven para descartar falsos positivos (interferencia, artefactos instrumentales, objetos naturales) antes de elevar un candidato a seguimiento.
- Cruce con catalogos de referencia para descartar explicaciones naturales: el acceso a SIMBAD, VizieR, el catalogo de pulsares ATNF, la base de datos de estrellas dobles de Washington o el JPL Small-Body Database permite contrastar cualquier deteccion con objetos conocidos.
- Estudio de objetos evanescentes (vanishing objects) y asteroides: la integracion con el archivo SVO y con el JPL SBDB cubre lineas de investigacion distintas de la busqueda clasica de radio.
- Ejecucion automatizada en servidores de calculo: la configuracion por variables de entorno o por archivo externo al repositorio facilita despliegues en colas de trabajo o contenedores sin modificar el codigo.
- Docencia y formacion: la inclusion de articulos, metodos y recetas permite usar el repositorio como material practico en cursos de astrofisica computacional o de radioastronomia.
- Reutilizacion de componentes: los clientes de archivo y las utilidades de marcos de referencia en reposo son aprovechables por otros proyectos que no realicen busquedas de tecnofirmas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de precision, recall ni comparativas cuantitativas de deteccion en la informacion proporcionada, y no procede aplicar metricas de modelos de lenguaje (MMLU, HumanEval, GSM8K u otras) a una herramienta de analisis astronomico.

## Requisitos de hardware

- VRAM estimada: no disponible. No hay un modelo con pesos que cargar; el consumo depende enteramente de los datos astronomicos procesados y de las rutas de codigo que se activen.
- GPU recomendadas: no disponible. El repositorio declara `torch` solo para las rutas de GPU, sin especificar modelos de tarjeta ni minimos.
- Ejecucion en CPU: viable para las rutas que no usan `torch`; el requisito declarado es Python 3.11 o superior con `requirements.txt` instalado.
- Idoneidad en GPU de consumo: no disponible; no se documenta que rutas concretas se benefician de GPU ni con que ganancia.
- Opciones de despliegue: ejecucion directa como script de linea de comandos en un entorno Python; no se menciona soporte de servidores de inferencia tipo vLLM, TGI, Ollama o llama.cpp, que no aplican a este tipo de herramienta.
- Almacenamiento: el repositorio ocupa 1,1 GB; a esto hay que anadir el espacio de `SETI_DATA`, `SETI_CACHE` y `SETI_RESULTS`, cuyo volumen no esta especificado.
- Latencia y throughput: no disponible. Dependen del archivo consultado, del enfoque y del modo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparativas con otras herramientas o proyectos del mismo ambito, ni datos de rendimiento que permitan establecer una comparacion cuantitativa. El repositorio no es un modelo de lenguaje, por lo que la comparacion con modelos de pesos no seria pertinente. Las busquedas web realizadas no devolvieron resultados relacionados con este repositorio: los enlaces obtenidos corresponden al eon geologico Fanerozoico (Wikipedia, Britannica, ScienceDirect, LibreTexts, Wikipedia en frances) y no guardan relacion con la herramienta, mas alla de la coincidencia de nombre con el usuario que la publica.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no admite prompts ni dispone de capacidades de tool calling o de agentes. Cualquier evaluacion debe hacerse como software cientifico.
- Validacion comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso o revision por terceros.
- Fechas incoherentes: la creacion se registra el 16 de octubre de 2026 y la ultima actualizacion el 17 de octubre de 2026, posteriores a la fecha habitual de consulta; conviene verificar la vigencia real del repositorio antes de depender de el.
- Dependencia de servicios externos: la mayoria de las funciones requieren acceso a archivos astronomicos de terceros (MAST, IRSA, CDS, ESO, NRAO y otros). Caidas, cambios de API o modificaciones de politica de acceso afectan directamente a la herramienta.
- Riesgo de falsos positivos: en busquedas de tecnofirmas los artefactos instrumentales, la interferencia por radiofrecuencia y los objetos naturales mal caracterizados son causas frecuentes de candidatos espurios; el propio repositorio incluye material de vetting, lo que sugiere que el filtrado es un paso necesario y no automatico.
- Licencia dual que exige atencion: el codigo es MIT, pero los articulos, la documentacion y el almacen de cobertura estan bajo CC BY 4.0. Un uso comercial o una redistribucion deben respetar ambas condiciones y la atribucion correspondiente.
- Idiomas soportados: no disponible. La documentacion visible esta en ingles.
- Ausencia de benchmarks: no hay datos publicados de sensibilidad, tasa de falsos positivos ni comparacion con otras implementaciones, por lo que no es posible estimar su rendimiento relativo.
- Requisitos de configuracion: necesita definir variables de entorno o un archivo de configuracion externo; una instalacion sin esa configuracion no funcionara correctamente.
- Sesgos: no aplica el concepto de sesgo estadistico de un modelo entrenado; si existe un sesgo de seleccion propio de los catalogos astronomicos utilizados, que solo cubren las regiones, epocas y rangos de sensibilidad observados.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/phanerozoic/seti-tools
- Archivo de licencia: `LICENSE` dentro del repositorio (MIT y CC BY 4.0)
- Ejemplo de configuracion: `local_config.example.json` dentro del repositorio
- Documentacion y metodos: directorios `docs/` y `recipes/` dentro del repositorio
- Articulos y fuentes: directorio `papers/` dentro del repositorio
- Resultados por enfoque: archivo `RESULTS.md` dentro del repositorio
- Paper, blog o demo adicionales: no disponible
- Resultados de busqueda web: sin enlaces relevantes; los devueltos corresponden al eon geologico Fanerozoico y no estan relacionados con el repositorio
