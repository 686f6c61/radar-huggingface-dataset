# Addax-Data-Science/CFD-MEDIUM-1-0

## Resumen

CFD-MEDIUM-1-0 es un modelo redistribuido por Addax Data Science dentro de su plataforma AddaxAI, una herramienta de analisis automatizado de imagenes para monitorizacion de fauna. El identificador CFD corresponde a Community Fish Detector, un proyecto desarrollado por Filippo Varini, Dan Morris y el resto de contribuidores de la comunidad, cuyo codigo y pesos originales se publican en el repositorio de GitHub del proyecto. Addax Data Science no es el autor original del modelo: este repositorio actua unicamente como espejo de redistribucion para facilitar su integracion en AddaxAI, manteniendo la licencia y la atribucion originales.

La model card publicada en HuggingFace es practicamente vacia (un objeto JSON sin campos) y se limita a declarar la naturaleza de la redistribucion, los nombres de los desarrolladores y enlaces al repositorio original. No se documentan en ella ni la arquitectura, ni el numero de parametros, ni el volumen de datos de entrenamiento, ni resultados de evaluacion. El unico dato cuantitativo disponible es el tamano del repositorio, aproximadamente 0,1 GB, coherente con un modelo de deteccion de objetos de tamano medio y pesos en precision completa o semiprecision.

Por el contexto del proyecto (deteccion de peces en imagenes subacuaticas) y por la nomenclatura de la version ("MEDIUM"), se trata previsiblemente de un detector de objetos de vision por computador, no de un modelo de lenguaje. Cualquier afirmacion sobre su arquitectura concreta, familia de modelos base o metricas de rendimiento requiere consultar el repositorio original, ya que no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no documenta la arquitectura; el contexto del proyecto apunta a un detector de objetos de vision por computador) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no consta que sea un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de vision; no procesa texto) |
| Licencia | no disponible en la ficha de HuggingFace; la model card remite a los ficheros de licencia del repositorio original, que se deben consultar antes de cualquier uso |
| Formato de pesos | no disponible (el repositorio ocupa aproximadamente 0,1 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo en la documentacion proporcionada. La model card de HuggingFace no incluye descripcion tecnica alguna y se limita a indicar que se trata de un modelo de codigo abierto redistribuido para su integracion con AddaxAI. El proyecto de origen, Community Fish Detector, publica su codigo en GitHub, pero los detalles de arquitectura, funcion de perdida, estrategia de aumento de datos y esquema de entrenamiento no forman parte de la informacion disponible en esta busqueda.

Tampoco se documentan el volumen de datos de entrenamiento, la composicion del dataset, la resolucion de entrada esperada ni si se aplicaron tecnicas de ajuste fino posteriores (por ejemplo, destilacion o fine-tuning sobre un backbone preentrenado). La unica referencia util es el propio repositorio de GitHub del proyecto original, que deberia consultarse para obtener la ficha tecnica completa, las condiciones de entrenamiento y las instrucciones de cita academica.

## Capacidades

- Deteccion de objetos en imagenes: el contexto del proyecto (Community Fish Detector) indica que el modelo esta orientado a localizar y clasificar peces en imagenes, presumiblemente subacuaticas o de camaras trampa.
- Integracion en un pipeline de analisis de imagenes: el modelo se distribuye especificamente para funcionar dentro de AddaxAI, la plataforma de Addax Data Science para procesamiento automatizado de imagenes de fauna.
- Salida estructurada de detecciones: como detector de objetos, se espera que produzca cajas delimitadoras con etiqueta de clase y puntuacion de confianza, aunque el formato exacto no esta documentado en la informacion disponible.
- Generacion de texto: no aplicable.
- Razonamiento, matematicas y codigo: no aplicable.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo thinking, vision, audio): la vision por computador es la unica capacidad deducible del contexto del proyecto; no se documentan otras.

## Casos de uso

- Monitorizacion de poblaciones piscicolas: el modelo se puede desplegar sobre secuencias de camaras subacuaticas para contar y localizar individuos, generando series temporales de abundancia que alimenten estudios de ecologia y conservacion.
- Analisis automatizado de camaras trampa en proyectos de ciencia ciudadana: integrado en AddaxAI, permite procesar grandes volumenes de imagenes sin revision manual, reduciendo el tiempo de anotacion por parte de voluntarios y biologos.
- Estimacion de biomasa y seguimiento de especies invasoras: la deteccion repetida sobre un mismo tramo de rio o embalse permite detectar cambios en la composicion de especies y alertar sobre la aparicion de especies no nativas.
- Evaluacion de impacto ambiental en infraestructuras hidraulicas: el modelo puede procesar imagenes de pasos de peces, escalas o turbinas para estimar la tasa de paso y la mortalidad asociada antes y despues de una intervencion.
- Investigacion academica en vision subacuatica: sirve como linea base o componente de un pipeline mayor para estudiar robustez frente a turbidez, iluminacion variable y oclusiones parciales.
- Integracion en aplicaciones de campo con recursos limitados: dado el reducido tamano del repositorio (0,1 GB), es plausible su despliegue en equipos modestos o incluso embebidos, siempre que se validen los requisitos reales de inferencia.
- Preetiquetado para anotacion humana: las detecciones del modelo pueden usarse como propuesta inicial en herramientas de etiquetado, acelerando la creacion de datasets corregidos por expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa aproximadamente 0,1 GB, lo que sugiere un modelo de tamano reducido, pero no se publican requisitos oficiales de memoria.
- GPU recomendadas: no disponible en la documentacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamano del repositorio (0,1 GB) es plausible que quepa en GPU de consumo e incluso que pueda ejecutarse en CPU, pero se trata de una inferencia basada en el tamano de los ficheros, no en datos publicados.
- Opciones de despliegue: no disponibles. La integracion documentada es con AddaxAI; no se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables a un detector de vision).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, parametros ni contexto de este modelo, ni identifica alternativas concretas de la misma categoria (detectores de peces o de objetos en imagenes subacuaticas). Sin esas cifras no es posible construir una comparativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo de vision entrenado con un dataset concreto, es probable que su rendimiento se degrade fuera de las condiciones de captura (especie, habitat, camara, iluminacion) representadas en sus datos de entrenamiento, pero esto no puede confirmarse con la informacion disponible.
- Riesgo de alucinacion: en el contexto de un detector de objetos, el equivalente son falsos positivos y falsos negativos. No se publican curvas precision-recall ni umbrales recomendados.
- Limitaciones de contexto o idioma: no aplicable en el sentido linguistico; las limitaciones relevantes serian de resolucion de imagen, condiciones de visibilidad y variedad de especies, todas ellas no documentadas.
- Restricciones de licencia: la model card indica explicitamente que cada modelo conserva su licencia original, que el usuario debe revisar y cumplir antes de cualquier uso, y que Addax Data Science cumple los terminos de las licencias originales. La licencia concreta de CFD-MEDIUM-1-0 no aparece en la ficha de HuggingFace, por lo que debe consultarse en el repositorio de GitHub del proyecto antes de un uso comercial.
- Trazabilidad: este repositorio es una redistribucion, no la fuente original. Para citar el trabajo, verificar versiones o reportar problemas, hay que acudir al repositorio de Community Fish Detector.
- Model card ausente: la ficha de HuggingFace no contiene informacion tecnica utilizable (el contenido es un objeto JSON vacio), lo que dificulta la evaluacion previa y obliga a revisar la documentacion del proyecto original.
- Ausencia de datos de validacion independiente: no hay benchmarks publicados ni resultados de evaluacion en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Addax-Data-Science/CFD-MEDIUM-1-0
- Repositorio original (Community Fish Detector): https://github.com/filippovarini/community-fish-detector
- Instrucciones de cita del trabajo original: https://github.com/filippovarini/community-fish-detector#citing-this-work
- Licencia del proyecto original: https://github.com/filippovarini/community-fish-detector
- Plataforma AddaxAI: https://addaxdatascience.com/addaxai/
- Sitio de Addax Data Science: https://addaxdatascience.com/

Nota: la busqueda web realizada no devolvio resultados tecnicos relevantes sobre el modelo. Los resultados obtenidos correspondian a otros usos del termino "Addax" (la especie de antilope Addax nasomaculatus, un laboratorio de podologia y una empresa de instalaciones de gas) y no se han incluido por no ser pertinentes.
