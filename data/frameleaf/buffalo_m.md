# frameleaf/buffalo_m

## Resumen

`frameleaf/buffalo_m` es un repositorio de distribucion que empaqueta los modelos de deteccion y reconocimiento facial del paquete **buffalo_m** publicado por InsightFace, el proyecto de codigo abierto mantenido por DeepInsight. No se trata de un modelo de lenguaje ni de un transformer generativo: es un conjunto de redes convolucionales especializadas en localizar rostros en imagenes y extraer embeddings de identidad facial para tareas de verificacion y agrupacion.

El repositorio lo publica el usuario `frameleaf` con un proposito muy concreto: servir como origen de pesos para **Immich**, la biblioteca de fotos autoalojada. Immich descarga estos modelos ONNX para ejecutar la deteccion de caras y el reconocimiento de personas en local, sin enviar imagenes a servicios externos. Por eso los tags incluyen `onnx`, `immich` y `facial-recognition`.

Su relevancia es practica: permite a instalaciones de Immich obtener los pesos de buffalo_m desde Hugging Face en lugar de depender de otras fuentes, manteniendo el pipeline de reconocimiento facial completamente dentro de la infraestructura del usuario. El tamano del repositorio es de aproximadamente 0,8 GB y los pesos se distribuyen en formato ONNX. La licencia es la de InsightFace, que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes convolucionales para deteccion y reconocimiento facial (paquete buffalo_m de InsightFace); arquitectura exacta por submodelo no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en ONNX |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | InsightFace (license: other, license_name: insightface) |
| Formato de pesos | ONNX |
| Tamano del repositorio | ~0,8 GB |
| Tareas incluidas | Deteccion facial y reconocimiento facial; alineamiento facial no incluido |

## Arquitectura y entrenamiento

El repositorio agrupa los modelos del paquete buffalo_m de InsightFace, orientados a dos tareas: deteccion de rostros (localizacion de caras y puntos clave) y reconocimiento facial (generacion de embeddings de identidad comparables por similitud coseno). La model card no detalla la arquitectura interna de cada submodelo, el numero de parametros ni la composicion del dataset de entrenamiento; esa informacion reside en el repositorio de InsightFace y no se reproduce aqui.

Los pesos se sirven en formato ONNX, lo que permite ejecucion con ONNX Runtime en CPU o GPU sin dependencias de frameworks de entrenamiento. No se documentan en la informacion disponible detalles sobre funciones de perdida, aumentado de datos, tecnicas de alineacion previas al reconocimiento ni procesos de refinamiento. Tampoco se indica si el paquete incluye modelos de deteccion tipo RetinaFace o SCRFD, aunque buffalo_m forma parte del ecosistema de modelos de InsightFace para estas tareas.

## Capacidades

- Deteccion de rostros en imagenes: localizacion de caras dentro de fotografias.
- Extraccion de embeddings de identidad facial para comparacion y agrupacion.
- Reconocimiento facial: asignacion de caras a personas conocidas mediante similitud de embeddings.
- Integracion con Immich para indexacion automatica de personas en bibliotecas fotograficas.
- Ejecucion en local mediante ONNX Runtime, sin dependencia de servicios en la nube.
- No incluye alineamiento facial ni otras tareas del ecosistema InsightFace.
- No soporta generacion de texto, codigo, tool calling ni razonamiento multi-paso: no es un modelo de lenguaje.

## Casos de uso

- Organizacion automatica de fotos en Immich: el modelo detecta caras en las imagenes subidas y genera embeddings que Immich agrupa por persona, permitiendo buscar fotos por individuo sin salir del servidor propio.
- Bibliotecas fotograficas familiares autoalojadas: con 0,8 GB de pesos ONNX, una instalacion domestica puede indexar miles de fotos en local y mantener la privacidad de los rostros fuera de servicios externos.
- Cumplimiento de privacidad en entornos sensibles: al ejecutarse con ONNX Runtime en la propia infraestructura, evita el envio de imagenes biometricas a terceros, util en organizaciones con requisitos de residencia de datos.
- Deduplicacion y etiquetado de archivos fotograficos: los embeddings permiten agrupar fotos de la misma persona tomadas en distintos momentos y condiciones de iluminacion.
- Prototipos de busqueda visual por persona: integrado en un pipeline propio con ONNX Runtime, se pueden construir indices vectoriales de caras para busqueda por similitud.
- Automatizacion de flujos de catalogacion en archivos digitales: deteccion y reconocimiento por lotes sobre colecciones de imagenes historicas o de eventos, con revision humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, tasas de verificacion (TAR/FAR) ni comparaciones con otros paquetes de InsightFace. Tampoco se documentan latencias o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa ~0,8 GB, pero no se especifica el reparto entre submodelos ni el consumo en ejecucion.
- GPU recomendadas: no disponibles en la informacion proporcionada. Al ser modelos ONNX, pueden ejecutarse con ONNX Runtime en CPU o en GPU compatibles con CUDA.
- GPU de consumo: no se confirma compatibilidad especifica; la ejecucion en CPU es viable para inferencia por lotes segun el diseno de ONNX Runtime, aunque no hay datos de rendimiento publicados.
- Opciones de despliegue: ONNX Runtime; integracion nativa con Immich, que gestiona la descarga y ejecucion de estos modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Tamano repo | Licencia | Uso previsto |
|---|---|---|---|---|---|
| frameleaf/buffalo_m | Deteccion y reconocimiento facial (InsightFace) | ONNX | ~0,8 GB | InsightFace | Immich y pipelines propios |
| InsightFace buffalo_l | Deteccion y reconocimiento facial (InsightFace) | ONNX | no disponible | InsightFace | Ecosistema InsightFace |
| Otros paquetes InsightFace | Deteccion y reconocimiento facial | ONNX | no disponible | InsightFace | Ecosistema InsightFace |

No se dispone de datos de rendimiento comparativo entre buffalo_m y otras variantes de InsightFace en la informacion proporcionada. La comparativa se limita a formato, licencia y uso previsto.

## Limitaciones y advertencias

- Licencia InsightFace: restringe el uso comercial. Es imprescindible revisar los terminos enlazados por el autor antes de cualquier despliegue en produccion con fines comerciales.
- No es un modelo de lenguaje: no genera texto, codigo ni responde a instrucciones; cualquier expectativa en ese sentido es erronea.
- Sesgos demograficos: los sistemas de reconocimiento facial pueden presentar diferencias de precision segun etnia, edad, genero e iluminacion; la model card no documenta evaluaciones de equidad.
- Riesgo de falsos positivos y negativos en agrupacion de caras: la asignacion automatica de personas requiere revision humana en contextos sensibles.
- Datos biometricos: el tratamiento de embeddings faciales esta sujeto a normativa de proteccion de datos (RGPD en la UE); debe evaluarse la base legal antes de su uso.
- Alcance limitado: solo incluye deteccion y reconocimiento; no incluye alineamiento facial ni otras tareas del ecosistema InsightFace.
- Sin datos de benchmarks ni de rendimiento publicados: no se puede garantizar un nivel de precision concreto sin evaluacion propia.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad en esta copia concreta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/frameleaf/buffalo_m
- Repositorio InsightFace: https://github.com/deepinsight/insightface/tree/master
- Licencia InsightFace: https://github.com/deepinsight/insightface/tree/master/python-package#license
- Immich: https://immich.app/
