# Addax-Data-Science/TKM-ADS-v1

## Resumen

TKM-ADS-v1 es un modelo redistribuido por Addax Data Science dentro del repositorio Addax-Data-Science/TKM-ADS-v1 en Hugging Face. No se trata de un modelo de lenguaje, sino de un modelo de vision por computador orientado a la deteccion sobre imagenes y videos, empaquetado para su integracion directa en la plataforma AddaxAI de la misma organizacion. El repositorio actua como punto de distribucion: agrupa pesos y un fichero `inference.py` para facilitar el uso del modelo con AddaxAI, manteniendo la licencia y atribucion originales.

La model card no aporta informacion sobre la arquitectura interna, el tamano de parametros, el contexto (no aplica) ni los datos de entrenamiento. Lo unico verificable es que el modelo fue entrenado con el paquete `ultralytics` y se ejecuta sobre el, lo que situa el modelo en la familia de detectores YOLO (Ultralytics), aunque la version concreta no se especifica. El repositorio tiene un tamano de 0.0 GB en el momento de la consulta, lo que sugiere que los pesos podrian no estar aun subidos o que el dato no refleja el contenido real.

La relevancia actual del modelo es limitada fuera del ecosistema AddaxAI: se distribuye como componente de una aplicacion concreta, con licencia AGPL-3.0 desde el 10 de noviembre de 2026 (antes CC BY-NC-SA 4.0), y sin documentacion tecnica publica sobre rendimiento o composicion del dataset. Es util para quien ya use AddaxAI y quiera ejecutar analisis de imagenes y videos localmente, pero no constituye una referencia general para evaluacion de modelos de vision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de vision basado en `ultralytics` (familia YOLO); version concreta no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | AGPL-3.0 desde el 10 de noviembre de 2026; copias anteriores bajo CC BY-NC-SA 4.0 |
| Formato de pesos | no disponible (repo de 0.0 GB en la consulta) |

## Arquitectura y entrenamiento

La model card indica unicamente que el modelo fue entrenado con el paquete `ultralytics` y que se ejecuta sobre el. Esto implica una arquitectura de deteccion de objetos de la familia YOLO mantenida por Ultralytics, pero no se especifica la version (YOLOv8, YOLO11 u otra), el tamano del backbone, el numero de parametros ni la resolucion de entrada. Tampoco se detalla el dataset de entrenamiento, el numero de imagenes, las clases objetivo ni si hubo aumento de datos o ajuste fino posterior.

No se documenta ninguna innovacion tecnica adicional (atencion, decodificacion especulativa, tecnicas de destilacion, etc.). El unico elemento diferencial del repositorio es el empaquetado para AddaxAI: incluye `inference.py` para estandarizar la ejecucion del modelo dentro de esa plataforma. Cualquier informacion sobre el proceso de entrenamiento mas alla de la mencion a `ultralytics` debe considerarse no disponible.

## Capacidades

- Deteccion de objetos sobre imagenes y videos, segun el proposito declarado del modelo en AddaxAI.
- Analisis de videos, ya que la model card menciona explicitamente "imagenes y videos" como entradas soportadas por AddaxAI con este modelo.
- Ejecucion local mediante `inference.py`, lo que permite procesar datos sin depender de un servicio externo.
- Integracion directa con la plataforma AddaxAI de Addax Data Science.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision multimodal, tool calling, agentes ni multilingues.

## Casos de uso

- Monitorizacion de fauna con camaras trampa: el modelo puede procesar lotes de imagenes capturadas por camaras de campo y detectar la presencia de animales, integrandose en el flujo de AddaxAI para clasificar y revisar resultados.
- Analisis de video de vigilancia ecologica: al soportar videos, permite recorrer grabaciones completas y extraer detecciones por fotograma para estudios de comportamiento o inventarios.
- Investigacion academica en ecologia: el paper citado en la model card (JOSS, DOI 10.21105/joss.05581) sugiere un uso orientado a investigacion; el modelo puede emplearse para generar recuentos reproducibles sobre datasets propios.
- Procesamiento por lotes en estaciones de trabajo locales: al ejecutarse sobre `ultralytics` con `inference.py`, se puede desplegar en un equipo con GPU consumer para analizar archivos sin subirlos a la nube.
- Validacion cruzada de anotaciones: usar las detecciones del modelo como preetiquetado para acelerar la revision manual de grandes volumenes de imagenes.
- Prototipado de pipelines de vision: servir como componente base en un sistema mayor de AddaxAI para experimentar con deteccion antes de entrenar un modelo propio.
- Uso comercial interno: la licencia AGPL-3.0 permite analizar imagenes y videos propios con fines comerciales, siempre que no se redistribuya el software que lo incorpora sin liberar su codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al no conocerse el tamano del modelo ni la version de YOLO, no es posible estimarla.
- GPU recomendadas: no disponible; los modelos de la familia `ultralytics` suelen ejecutarse en GPU consumer, pero no hay confirmacion para esta version concreta.
- Compatibilidad con GPU consumer: no confirmada; probable si se trata de un detector YOLO de tamano pequeno o medio, pero sin datos verificables.
- Opciones de despliegue: `ultralytics` con `inference.py` (unica via documentada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TKM-ADS-v1 | Detector de vision (ultralytics) | no disponible | no aplica | AGPL-3.0 (antes CC BY-NC-SA 4.0) | Hugging Face, empaquetado para AddaxAI |
| YOLOv8 (Ultralytics) | Detector de vision | 3.2M-68.2M segun variante | no aplica | AGPL-3.0 | Repositorio oficial de Ultralytics |
| YOLO11 (Ultralytics) | Detector de vision | 2.6M-56.9M segun variante | no aplica | AGPL-3.0 | Repositorio oficial de Ultralytics |
| Megadetector | Detector de fauna | no disponible | no aplica | MIT (proyecto Microsoft AI for Earth) | GitHub y Zenodo |

La comparacion con YOLOv8 y YOLO11 es aproximada: TKM-ADS-v1 se entrena con `ultralytics`, por lo que probablemente comparte arquitectura con una de esas familias, pero la model card no lo confirma. Megadetector se incluye como referencia de detectores especializados en fauna, que es el dominio aparente de AddaxAI.

## Limitaciones y advertencias

- La model card no documenta sesgos, clases objetivo ni dominio de entrenamiento, por lo que no es posible evaluar su comportamiento fuera del caso de uso previsto.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de falsos positivos y falsos negativos propios de cualquier detector; no hay metricas publicadas para cuantificarlo.
- El repositorio muestra un tamano de 0.0 GB, lo que puede indicar que los pesos no estan disponibles o que el dato no refleja el contenido real; conviene verificar antes de integrarlo en produccion.
- La licencia AGPL-3.0 impone obligaciones fuertes: si se integra el modelo en una aplicacion, web o servicio que se distribuye o vende a terceros, hay que liberar el codigo fuente de ese software bajo la misma licencia. El uso interno para analizar imagenes y videos propios (incluido comercial) si esta permitido.
- Las copias descargadas antes del 10 de noviembre de 2026 conservan la licencia CC BY-NC-SA 4.0, que prohibe el uso comercial; es necesario comprobar la fecha de descarga.
- No se documentan idiomas ni capacidades multilingues porque el modelo no procesa texto.
- No hay informacion sobre version de YOLO, resolucion de entrada, numero de clases ni umbrales recomendados, lo que dificulta reproducir resultados.
- El modelo se distribuye como componente de AddaxAI; su uso fuera de esa plataforma no esta documentado ni soportado oficialmente.

## Enlaces

- Hugging Face: https://huggingface.co/Addax-Data-Science/TKM-ADS-v1
- Addax Data Science: https://addaxdatascience.com/
- AddaxAI: https://addaxdatascience.com/addaxai/
- Paper (JOSS): https://joss.theoj.org/papers/10.21105/joss.05581
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
