# simdengineer/production-raw-assets

## Resumen

`simdengineer/production-raw-assets` no es un modelo de inteligencia artificial, sino un repositorio de **dataset** alojado en Hugging Face. Concretamente, contiene los activos visuales en bruto y procesados de una cadena de preparacion de datos para generar un dataset sintetico de YOLO orientado a la deteccion de FOD (Foreign Object Debris, residuos de objetos extranos) en una linea de produccion industrial. El repositorio ocupa 0,4 GB y esta publicado por el usuario `simdengineer`, sin licencia declarada, sin idiomas declarados y con cero descargas y cero likes en el momento de la consulta.

El contenido abarca todas las etapas de datos: video de la linea de produccion, extraccion de frames de fondo mediante la herramienta `linewatch` (OpenCV), recortes de objetos con fondo transparente mediante `rembg` (modelos ONNX IS-Net/U²-Net) y un generador de dataset sintetico (`build_synthetic_yolo.py`) que compone imagenes etiquetadas y su `data.yaml`. La salida final alimenta un repositorio hermano, `production-yolo-synthetic`, mientras que el entrenamiento y los pesos quedan fuera del alcance de este repositorio.

Por tanto, esta ficha describe un componente de *tooling* y datos, no un modelo generativo. No hay parametros, contexto, arquitectura de red neuronal propia ni benchmarks de inferencia que reportar; los apartados habituales de una ficha de modelo se adaptan aqui al contenido real del repositorio y se marcan como "no aplica" o "no disponible" cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo; repositorio de dataset y scripts de preparacion) |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica; los scripts emplean modelos ONNX de `rembg` en su precision por defecto |
| Idiomas soportados | no disponibles (el contenido son imagenes y scripts; no se declara idioma) |
| Licencia | no disponible |
| Formato de pesos | no aplica; el repositorio contiene PNG, PNG RGBA, JSON, NDJSON, CSV y scripts Python |
| Tamano del repositorio | 0,4 GB |
| Frames de fondo | 112 PNG en `backgrounds/` y 112 PNG en `backgrounds_timestamps/` |
| Recortes de objetos | 28 PNG RGBA en `filtered_objects/` |
| Ficheros de metadatos | `sizes.json` (dimensiones reales en mm, relleno manual), `data.yaml` (generado en el repo hermano) |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-28 |
| Ultima actualizacion | 2026-09-28 |

## Arquitectura y entrenamiento

No existe entrenamiento de ningun modelo en este repositorio. Lo que hay es un *pipeline* de preparacion de datos estructurado en cuatro etapas encadenadas. La primera, `linewatch`, es una herramienta basada en OpenCV que vigila el video de la linea de produccion, detecta cuando la linea se detiene mediante diferenciacion de frames y direccion de flujo optico, y selecciona el frame mas nitido de cada intervalo de parada usando energia de gradiente de Sobel. Cada frame elegido se escribe dos veces: una copia sin modificar en `backgrounds/` y otra con borde negro uniforme y marca de tiempo incrustada en `backgrounds_timestamps/` (vista de trazabilidad). Los artefactos de ejecucion (`events.ndjson`, `intervals.json`, `scores.csv`, `run.json`) van a `pipeline_scripts/results/`.

La segunda etapa, `objects_cleanup.py`, elimina el fondo de cada imagen de `raw_objects/` y escribe recortes RGBA transparentes en `filtered_objects/` mediante `rembg` (modelos ONNX IS-Net/U²-Net), apoyandose en `onnxruntime`, `numpy` y `scipy`. La tercera etapa consiste en rellenar manualmente `sizes.json` con las dimensiones reales de cada objeto en milimetros. La cuarta, `build_synthetic_yolo.py`, combina los fondos y los recortes filtrados para generar el dataset sintetico etiquetado (`images/`, `label/`, `data.yaml`) en el repositorio hermano `production-yolo-synthetic`. El repositorio incluye tambien un script obsoleto (`extract.py`) ya sustituido por `linewatch/`, y los lanzadores `run_linewatch.sh`, `run_objects_cleanup.sh` y `run_build_synthetic.sh`, que crean un entorno virtual `.venv` e instalan `requirements.txt` (con `rembg[cpu]==2.0.85` y `opencv-python-headless`).

## Capacidades

- Extraccion de frames de fondo a partir de video de linea de produccion, con deteccion de paradas y seleccion del frame mas nitido por intervalo.
- Generacion de vistas de trazabilidad con borde y marca de tiempo incrustada para cada frame extraido.
- Segmentacion y eliminacion de fondo de imagenes de objetos mediante `rembg` (IS-Net/U²-Net sobre ONNX), con salida en RGBA transparente.
- Composicion de imagenes sinteticas etiquetadas en formato YOLO a partir de fondos y recortes, lista para entrenamiento de deteccion de objetos.
- Parametrizacion del pipeline mediante JSON (`--config`, `--print-default-config`), con control de ROI, umbrales, tiempo de asentamiento, tamano de borde, fuente de marca de tiempo y formato de imagen.
- Soporte tanto de video en fichero (`--file`) como de camara en vivo (`--camera 0`).
- Gestion de nombres de fichero por prefijo (`--image-prefix`) para evitar colisiones entre fuentes distintas.
- Tratamiento de las carpetas de destino como activos persistentes: la herramienta nunca borra ficheros existentes alli.

## Casos de uso

- Generacion de datasets sinteticos para deteccion de FOD en entornos industriales: a partir de un video de la linea de produccion y de fotografias de objetos reales, el pipeline produce imagenes etiquetadas listas para entrenar un detector YOLO sin necesidad de anotacion manual exhaustiva.
- Automatizacion de la captura de fondos limpios: `linewatch` detecta los momentos en que la cinta se detiene y extrae el mejor frame, de modo que un operario no tiene que seleccionar manualmente fotogramas representativos de la linea.
- Trazabilidad y auditoria de datos: la doble salida (`backgrounds/` limpio y `backgrounds_timestamps/` anotado) permite conservar la procedencia temporal de cada frame sin contaminar el conjunto de entrenamiento.
- Aumento de datos para clases poco frecuentes: los 28 recortes de objetos con fondo transparente pueden reutilizarse sobre distintos fondos para multiplicar las apariciones de objetos escasos.
- Calibracion dimensional de objetos: el fichero `sizes.json` con dimensiones reales en milimetros permite escalar los recortes de forma coherente al componer las imagenes sinteticas.
- Pipelines de vision industrial reproducibles en CPU: al depender de `rembg[cpu]` y OpenCV, el flujo puede ejecutarse en estaciones de trabajo sin GPU dedicada, lo que abarata la regeneracion del dataset.
- Integracion en un flujo MLOps mas amplio: la salida hacia `production-yolo-synthetic` y la separacion respecto a `production-yolo-fod` (pesos y metricas) permiten encadenar generacion de datos, entrenamiento y evaluacion como repositorios independientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un repositorio de dataset y scripts de preparacion de datos, no aplican metricas de modelo como MMLU, HumanEval o GSM8K. Tampoco se aportan mediciones de throughput o latencia del propio pipeline.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica como modelo; el pipeline esta pensado para ejecutarse en CPU.
- GPU recomendadas: no disponible; no se declara ninguna GPU necesaria ni recomendada.
- Compatibilidad con GPU de consumo: no aplica al no requerir GPU; `rembg[cpu]` esta fijado explicitamente para CPU.
- Entorno de ejecucion: Python 3.9 o superior con `venv` y `pip`. En Debian/Ubuntu suele requerir instalar `python3-venv` y `python3-pip` por separado.
- Dependencias principales: `rembg[cpu]==2.0.85` (arrastra `onnxruntime`, `numpy`, `scipy`) y `opencv-python-headless`.
- Opciones de despliegue: entorno virtual local creado por los lanzadores `.sh`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha proporcionado informacion sobre repositorios comparables de activos o pipelines equivalentes, y este repositorio no es un modelo, por lo que no procede compararlo con modelos de parametros o contexto similares.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no realiza inferencia como tal; es un repositorio de datos y utilidades de preparacion.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial ni redistribucion; conviene contactar con el autor antes de reutilizar los activos.
- Idiomas no declarados: irrelevante para imagenes, pero implica ausencia de metadatos descriptivos que faciliten el filtrado o la busqueda.
- Sin adopcion aparente: cero descargas y cero likes en el momento de la consulta, lo que reduce la validacion externa del contenido.
- Dependencia de relleno manual: `sizes.json` debe completarse a mano con las dimensiones reales; si se deja vacio o incorrecto, las proporciones del dataset sintetico pueden quedar mal calibradas.
- Acoplamiento entre repositorios: la etapa final escribe en `production-yolo-synthetic` mediante rutas relativas, de modo que la estructura de directorios del espacio de trabajo debe respetarse para que el pipeline funcione.
- Script obsoleto incluido: `extract.py` figura como marcador de posicion ya sustituido por `linewatch/`, lo que puede inducir a confusion.
- Persistencia de salidas: `linewatch` no borra frames existentes en las carpetas de destino; reejecutar el mismo video sobrescribe los mismos nombres de intervalo, pero fuentes distintas requieren controlar `--image-prefix` para no mezclar.
- Fechas de creacion y actualizacion inusuales: ambas figuran como 2026-09-28, dato a verificar antes de tomarlo como referencia temporal fiable.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/simdengineer/production-raw-assets
- Mapa del sistema, contratos e invariantes entre repositorios: `../PIPELINE.md` (ruta relativa dentro del espacio de trabajo)
- Justificacion de decisiones de diseno: `DECISIONS.md` (dentro del repositorio)
- Restricciones orientadas a agentes: `AGENTS.md` (dentro del repositorio)
- Repositorio hermano de dataset sintetico generado: `production-yolo-synthetic/` (ruta relativa)
- Repositorio de entrenamiento, pesos y metricas: `production-yolo-fod` (ruta relativa)
