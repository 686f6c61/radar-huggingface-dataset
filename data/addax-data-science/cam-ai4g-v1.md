# Addax-Data-Science/CAM-AI4G-v1

## Resumen

CAM-AI4G-v1 es un clasificador de imagenes de fauna salvaje desarrollado por el AI for Good Lab de Microsoft, distribuido originalmente como parte del proyecto Pytorch-Wildlife (repositorio CameraTraps). El modelo esta especializado en la identificacion de animales en la selva amazonica colombiana y distingue entre 36 generos taxonomicos, incluyendo mamiferos, aves y la clase "Human", ademas de una clase "Unknown" para descartes.

Tecnicamente se trata de una red neuronal convolucional basada en la arquitectura ResNet empleada por el modelo AI4GAmazonRainforest de Pytorch-Wildlife, no de un modelo de lenguaje. Su funcion es la clasificacion de imagenes individuales capturadas por camaras trampa (camera traps) en entornos de conservacion y monitorizacion de biodiversidad.

Esta copia concreta del modelo se aloja en Hugging Face por parte de Addax-Data-Science para facilitar su integracion con la plataforma AddaxAI, una herramienta de analisis de imagenes de camaras trampa. El repositorio ocupa aproximadamente 0,2 GB y se distribuye bajo licencia MIT. La relevancia actual del modelo radica en su aplicacion practica para proyectos de ecologia y conservacion que necesitan automatizar el etiquetado de grandes volumenes de imagenes de fauna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet (AI4GAmazonRainforest de Pytorch-Wildlife) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ResNet utilizada por el modelo AI4GAmazonRainforest del proyecto Pytorch-Wildlife de Microsoft. Se trata de una red convolucional disenada para clasificacion de imagenes, no de un transformer ni de un modelo generativo. La salida del modelo es una distribucion sobre 36 clases taxonomicas correspondientes a generos de fauna de la Amazonia colombiana, mas las clases "Human" y "Unknown".

No se dispone de informacion detallada sobre el volumen de datos de entrenamiento, la composicion exacta del dataset, el numero de imagenes por clase ni si se aplicaron tecnicas de aumento de datos o ajuste fino especificas. Tampoco se documentan innovaciones tecnicas adicionales mas alla de la propia arquitectura ResNet heredada de Pytorch-Wildlife. El modelo fue entrenado por el AI for Good Lab de Microsoft y su archivo oficial se publica en Zenodo.

## Capacidades

- Clasificacion de imagenes de camaras trampa en 36 generos de fauna amazonica colombiana.
- Deteccion de presencia humana mediante la clase "Human".
- Gestion de imagenes sin coincidencia clara mediante la clase "Unknown".
- Identificacion de mamiferos (por ejemplo, Dasyprocta, Pecari, Mazama, Tapirus, Leopardus, Didelphis).
- Identificacion de aves (por ejemplo, Leptotila, Aramides, Tinamus, Crax, Crypturellus, Momotus, Furnarius).
- Integracion con la plataforma AddaxAI para flujos de analisis de imagenes.
- Uso como componente dentro del ecosistema Pytorch-Wildlife / CameraTraps.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Monitorizacion de biodiversidad en la Amazonia colombiana: el modelo permite clasificar automaticamente las imagenes capturadas por camaras trampa y generar inventarios de generos presentes en una zona, reduciendo el trabajo manual de revision.
- Investigacion ecologica a gran escala: investigadores pueden procesar lotes de imagenes historicas y obtener etiquetas taxonomicas a nivel de genero para analisis de abundancia y distribucion.
- Conservacion y seguimiento de especies amenazadas: la identificacion de generos como Tapirus o Leopardus facilita el seguimiento de poblaciones sensibles en areas protegidas.
- Deteccion de actividad humana en reservas: la clase "Human" permite filtrar imagenes con presencia de personas, util para estudios de impacto antropico o seguridad en zonas protegidas.
- Integracion en pipelines de AddaxAI: el modelo puede desplegarse dentro de la plataforma AddaxAI para automatizar el etiquetado de imagenes en proyectos de campo con equipos no tecnicos.
- Educacion y divulgacion cientifica: sirve como ejemplo practico de aplicacion de vision por computador a la ecologia, util en cursos y talleres sobre conservacion y machine learning.
- Filtrado previo en estudios de fauna generalistas: combinado con modelos mas amplios de Pytorch-Wildlife, puede usarse como clasificador regional especializado para la Amazonia colombiana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al tratarse de una ResNet y un repositorio de 0,2 GB, es previsible que quepa en GPUs de consumo, aunque no se confirma en la documentacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamano del repositorio, pero no confirmada oficialmente.
- Opciones de despliegue: integracion con Pytorch-Wildlife / CameraTraps y con la plataforma AddaxAI; no se documentan otros motores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAM-AI4G-v1 | ResNet (clasificacion de imagenes) | 36 generos + Human + Unknown | Imagenes de camaras trampa | MIT | Hugging Face, Zenodo |
| AI4GAmazonRainforest (Pytorch-Wildlife) | ResNet (clasificacion de imagenes) | No disponible en la informacion | Imagenes de camaras trampa | Ver licencia de CameraTraps | GitHub Microsoft / Zenodo |
| Otros clasificadores de Pytorch-Wildlife | Redes de vision | Variables | Imagenes de camaras trampa | Ver licencia de CameraTraps | GitHub Microsoft |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en la fauna de la Amazonia colombiana; su uso en otras regiones o ecosistemas puede producir clasificaciones erroneas.
- La clasificacion se realiza a nivel de genero, no de especie, lo que limita la granularidad taxonomica.
- No se documentan sesgos especificos, pero al ser un modelo entrenado con un dataset regional concreto es probable que tenga un rendimiento desigual entre clases segun su representacion en los datos.
- Riesgo de confusion entre generos morfologicamente similares o en imagenes de baja calidad, nocturnas o con oclusiones.
- La clase "Unknown" puede absorber imagenes de fauna no contemplada, lo que complica la interpretacion de resultados.
- No se dispone de informacion sobre el rendimiento en condiciones de baja iluminacion, camaras trampa infrarrojas o imagenes con movimiento.
- La licencia MIT permite uso comercial, pero se recomienda revisar la licencia original de CameraTraps y las condiciones de Zenodo para el archivo oficial.
- No apto para tareas de lenguaje, razonamiento o generacion de texto.

## Enlaces

- Hugging Face: https://huggingface.co/Addax-Data-Science/CAM-AI4G-v1
- Repositorio Pytorch-Wildlife / CameraTraps: https://github.com/microsoft/CameraTraps
- AI for Good Lab (Microsoft Research): https://www.microsoft.com/en-us/research/group/ai-for-good-research-lab/
- Archivo oficial del modelo en Zenodo: https://zenodo.org/records/10041983
- AddaxAI: https://addaxdatascience.com/addaxai
- Licencia de CameraTraps: https://github.com/microsoft/CameraTraps/blob/main/LICENSE
