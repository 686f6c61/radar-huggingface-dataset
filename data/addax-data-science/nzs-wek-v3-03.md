# Addax-Data-Science/NZS-WEK-v3-03

## Resumen

NZS-WEK-v3-03 es un modelo redistribuido por Addax Data Science dentro del ecosistema AddaxAI, una plataforma de analisis de imagenes de camaras de trampeo (trail cameras) orientada a monitorizacion de fauna. El modelo original fue desarrollado por Olly Powell (wekaResearch) por encargo del New Zealand Department of Conservation, y se distribuye en este repositorio con permiso del autor para su uso dentro de AddaxAI. No se trata de un modelo de lenguaje: por el contexto de la model card (imagenes de ejemplo de camaras de trampeo, creditos a LILA BC) y el tamano del repositorio (0,1 GB), se trata con alta probabilidad de un modelo de vision por computador para deteccion o clasificacion de fauna en imagenes de camara trampa.

La informacion publica disponible es muy limitada: no se declaran arquitectura, numero de parametros, contexto, idiomas ni resultados de benchmarks. El repositorio actua fundamentalmente como espejo de redistribucion, no como publicacion tecnica del modelo. La licencia es "other" y el autor original no ha publicado terminos de licencia para los pesos, lo que condiciona fuertemente cualquier uso fuera de AddaxAI.

Su relevancia actual es acotada y de nicho: resulta util para equipos de conservacion y ecologia que ya trabajan con AddaxAI y necesitan procesar imagenes de camaras trampa de Nueva Zelanda, pero no es un modelo generalista ni compite en la categoria de modelos fundacionales de lenguaje o vision de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (repo de 0,1 GB, compatible con un modelo de vision de tamano pequeno o medio) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (sin licencia publicada por el desarrollador original; redistribucion autorizada solo para AddaxAI) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card no describe el tipo de red (CNN, detector tipo YOLO, transformer de vision u otro), ni el numero de parametros, ni la resolucion de entrada. El tamano del repositorio (0,1 GB) sugiere un modelo compacto, coherente con tareas de deteccion o clasificacion de imagenes en entornos con recursos limitados, pero este dato es una inferencia y no una especificacion confirmada.

Respecto a los datos de entrenamiento, las imagenes de ejemplo proceden del dataset "Trail Camera Images of New Zealand Animals" del Department of Conservation NZ, distribuido via LILA BC bajo licencia CDLA-Permissive. Es razonable asumir que el modelo se entreno con imagenes de camaras trampa de fauna neozelandesa, pero no se detalla el volumen de datos, la composicion del dataset, el regimen de aumento de datos ni si se aplicaron tecnicas de ajuste fino supervisado, destilacion u otras. No se documenta ninguna innovacion tecnica destacable.

## Capacidades

- Procesamiento de imagenes de camaras de trampeo (trail cameras), segun el contexto de la model card y las imagenes de ejemplo incluidas.
- Presumiblemente deteccion o clasificacion de fauna de Nueva Zelanda, si bien la tarea exacta no se especifica en la informacion disponible.
- Integracion con la plataforma AddaxAI, que es el proposito declarado de esta redistribucion.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): vision probable por el contexto, no confirmado de forma explicita en la documentacion.

## Casos de uso

- Monitorizacion de fauna con camaras trampa en Nueva Zelanda: el modelo se usaria dentro de AddaxAI para procesar lotes de imagenes capturadas por trail cameras y asistir en la identificacion de especies, reduciendo la revision manual de miles de fotogramas.
- Inventarios de biodiversidad en proyectos de conservacion: equipos del Department of Conservation o contratistas podrian emplearlo para clasificar imagenes historicas y generar series temporales de presencia de especies.
- Filtrado previo de imagenes vacias: en flujos de camaras trampa, una gran parte de las capturas no contienen animales; un modelo de vision permite descartar imagenes sin fauna antes de la revision humana.
- Investigacion ecologica replicable: investigadores que ya usan AddaxAI pueden reproducir analisis con el mismo modelo, manteniendo consistencia metodologica entre estudios.
- Despliegue en estaciones de campo con recursos limitados: el tamano reducido del repositorio (0,1 GB) sugiere que puede ejecutarse en hardware modesto, aunque no se confirman requisitos.
- Docencia y formacion en conservacion asistida por IA: como ejemplo practico de pipeline de vision aplicado a ecologia, integrado en la interfaz de AddaxAI.
- Auditoria de datos de camaras trampa: revision asistida de grandes archivos de imagenes para detectar especies objetivo o especies invasoras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio (0,1 GB) sugiere que el modelo es pequeno y podria ejecutarse en GPUs de consumo, pero no hay confirmacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable por el tamano del artefacto, sin datos oficiales.
- Opciones de despliegue: la via prevista es AddaxAI; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no necesariamente aplicables a este modelo de vision).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (deteccion o clasificacion de fauna en camaras trampa) con especificaciones publicadas que permitan una comparacion rigurosa de parametros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican arquitectura, parametros, datos de entrenamiento ni evaluacion, lo que impide validar su rendimiento de forma independiente.
- Licencia restrictiva: el desarrollador original no ha publicado licencia para los pesos; la redistribucion esta autorizada unicamente para su uso dentro de AddaxAI. Cualquier otro uso requiere contactar con el desarrollador.
- Sesgo geografico y taxonomico probable: el modelo se asocia a fauna de Nueva Zelanda y a un dataset concreto de camaras trampa, por lo que su generalizacion a otras regiones o especies no esta garantizada.
- Riesgo de falsos negativos y positivos en deteccion: sin benchmarks publicados no es posible cuantificar la precision, el recall ni el comportamiento en condiciones de baja iluminacion, oclusion o imagenes nocturnas.
- Sin soporte declarado para texto, codigo, tool calling ni agentes: no debe emplearse como modelo de lenguaje.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido, lo que limita el soporte comunitario y la resolucion de incidencias.
- Fecha de actualizacion del repositorio posterior a la de creacion (2026-11-10 frente a 2025-09-15): conviene verificar si los pesos han cambiado y si la documentacion refleja la version vigente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Addax-Data-Science/NZS-WEK-v3-03
- AddaxAI (plataforma de integracion): https://addaxdatascience.com/addaxai/
- Addax Data Science: https://addaxdatascience.com/
- wekaResearch (desarrollador original): https://wekaresearch.com/
- Dataset de referencia "Trail Camera Images of New Zealand Animals" via LILA BC: no disponible en la informacion proporcionada (mencionado en la model card sin URL directa)
