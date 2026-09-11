# Addax-Data-Science/CFD-NANO-1-0

## Resumen

CFD-NANO-1-0 es un repositorio de modelos publicado en HuggingFace por Addax Data Science. No se trata de un modelo entrenado por el propio autor del repositorio, sino de una redistribucion de modelos de codigo abierto empaquetados para facilitar su integracion con AddaxAI, la plataforma de Addax Data Science. Segun la model card, el desarrollo original corresponde a Filippo Varini, Dan Morris y los colaboradores del proyecto Community Fish Detector, y cada modelo conserva su licencia y atribucion originales.

El identificador del repositorio (CFD-NANO-1-0) apunta al proyecto Community Fish Detector y a una variante de baja capacidad, pero la model card no incluye ficha tecnica: el README se limita a una descripcion generica de la redistribucion y a enlaces al repositorio de GitHub del proyecto original. No hay informacion publicada sobre arquitectura, numero de parametros, datos de entrenamiento ni resultados de evaluacion.

La relevancia de esta ficha es, por tanto, limitada y de caracter practico: sirve para localizar el artefacto, identificar al desarrollador original y advertir de que cualquier evaluacion tecnica exige consultar el repositorio de GitHub del proyecto Community Fish Detector y los ficheros de licencia incluidos en el propio repositorio. La busqueda web realizada no devolvio resultados relacionados con este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la especifica; el sufijo "NANO" sugiere una variante de baja capacidad, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible (no consta que sea un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se documenta; el proyecto de origen trabaja sobre imagenes, no sobre texto) |
| Licencia | no disponible en los metadatos de HuggingFace; la model card indica que cada modelo conserva su licencia original (ver ficheros de licencia del repositorio) |
| Formato de pesos | no disponible |
| Tarea declarada (pipeline) | no disponible |
| Tamano del repositorio | 0,1 GB |
| Desarrolladores originales | Filippo Varini, Dan Morris y colaboradores de Community Fish Detector |
| Responsable de la redistribucion | Addax Data Science |
| Fecha de creacion (HuggingFace) | 2026-09-11 |
| Fecha de ultima actualizacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura del modelo, el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste fino, RLHF o DPO. Tampoco se documentan innovaciones tecnicas asociadas.

El unico contexto verificable es que el repositorio redistribuye modelos del proyecto Community Fish Detector para su uso dentro de AddaxAI, lo que situa el modelo en el ambito de la deteccion automatica sobre imagenes o video (por el propio nombre del proyecto de origen), sin que la model card confirme detalles de arquitectura ni de entrenamiento. Para obtener esa informacion hay que acudir al repositorio `filippovarini/community-fish-detector` en GitHub.

## Capacidades

- No se documentan capacidades especificas en la model card ni en los metadatos de HuggingFace.
- Por el nombre del proyecto de origen (Community Fish Detector) y su integracion en AddaxAI, cabe inferir que el modelo esta orientado a la deteccion de peces en imagenes o video, pero esta inferencia no esta confirmada por documentacion tecnica disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo de razonamiento, vision, audio): no disponible.

## Casos de uso

Los siguientes casos son aplicaciones plausibles del tipo de modelo que sugiere el proyecto de origen (deteccion de peces en imagenes). Dado que no hay especificaciones publicadas, deben validarse contra el repositorio original antes de cualquier uso en produccion.

- Monitorizacion de poblaciones piscicolas en rios y embalses: el modelo se integraria en estaciones de camaras fijas o camaras trampa para contar y clasificar individuos de forma automatica, reduciendo el trabajo de revision manual de miles de fotos por campana de muestreo.
- Analisis de capturas en pesca comercial: procesamiento de imagenes de cubierta o de rampa de desembarque para estimar composicion de captura y presencia de especies no objetivo, siempre que las clases cubiertas por el modelo coincidan con las especies de interes.
- Acuicultura y estimacion de biomasa: conteo de individuos en tanques o jaulas a partir de video, con el objetivo de ajustar racion y detectar mortalidades tempranas.
- Estudio de especies invasoras: deteccion de especies introducidas en tramos fluviales monitorizados, como apoyo a programas de control y erradicacion.
- Ciencia ciudadana: integracion en plataformas donde voluntarios suben imagenes y el modelo preclasifica las detecciones, reduciendo el coste de curaduria por parte de expertos.
- Evaluacion de impacto ambiental: analisis retrospectivo de archivos de video submarino recogidos en estudios de impacto de infraestructuras hidraulicas.
- Pipelines de investigacion reproducibles con AddaxAI: uso del artefacto redistribuido para desplegar el detector dentro del ecosistema AddaxAI, garantizando versiones fijas y trazabilidad del modelo empleado en cada analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del repositorio (0,1 GB) es compatible con un modelo pequeno que, en principio, podria ejecutarse en GPU de consumo e incluso en CPU, pero se trata de una estimacion basada unicamente en el tamano del artefacto y no en especificaciones publicadas.
- Opciones de despliegue: no disponibles en la model card. La unica via de integracion documentada es AddaxAI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye especificaciones, resultados ni caracteristicas que permitan una comparacion con alternativas. Para establecer una comparativa fiable seria necesario consultar el repositorio original del proyecto Community Fish Detector y la documentacion de otros detectores de fauna en imagenes, extremo que no cubre la informacion disponible.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no contiene ficha tecnica (el README incluye un bloque vacio y una nota generica de redistribucion), por lo que cualquier dato de arquitectura, entrenamiento o rendimiento debe obtenerse del repositorio original.
- Licencia no declarada en HuggingFace: los metadatos indican "no disponible" y la model card remite a los ficheros de licencia del repositorio. Es obligatorio revisarlos antes de cualquier uso, especialmente si es comercial.
- Modelo redistribuido, no entrenado por el autor del repositorio: la responsabilidad de atribucion y cumplimiento recae en el usuario final, segun los terminos de la licencia original.
- Riesgo de sesgo de dominio: cualquier modelo de deteccion visual depende de la distribucion de especies, iluminacion, turbidez del agua, tipo de camara y geografia de su dataset de entrenamiento. Sin datos de entrenamiento publicados no es posible acotar este riesgo.
- Riesgo de falsos positivos y falsos negativos: no hay metricas publicadas (mAP, precision, recall) que permitan estimar la tasa de error en un escenario real.
- Clases cubiertas desconocidas: no se documenta que especies o categorias detecta el modelo, ni su granularidad taxonomica.
- Idiomas y contexto textual: no aplica, pero la ausencia de pipeline declarado en HuggingFace impide conocer con certeza la modalidad de entrada y salida.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces recuperados corresponden al antilope addax y a empresas homonimas, por lo que no aportan informacion tecnica.
- Ausencia de traccion: cero descargas y cero likes en el momento de redactar la ficha, lo que implica falta de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Addax-Data-Science/CFD-NANO-1-0
- Repositorio original (Community Fish Detector): https://github.com/filippovarini/community-fish-detector
- Instrucciones de citacion del proyecto original: https://github.com/filippovarini/community-fish-detector#citing-this-work
- Licencia del proyecto original: https://github.com/filippovarini/community-fish-detector
- AddaxAI: https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
