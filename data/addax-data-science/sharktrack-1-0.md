# Addax-Data-Science/SHARKTRACK-1-0

## Resumen

SHARKTRACK-1-0 es un repositorio publicado en HuggingFace por la organizacion Addax-Data-Science cuyo contenido es una redistribucion de modelos de codigo abierto pensada para facilitar su integracion en AddaxAI, la plataforma de la propia organizacion. El desarrollo original del modelo se atribuye a Filippo Varini, y el repositorio remite a la pagina del proyecto SharkTrack, al articulo arXiv 2407.20623 y al repositorio GitHub filippovarini/sharktrack, que actua como fuente de la licencia.

La model card del repositorio esta practicamente vacia: el unico contenido sustantivo es el aviso de redistribucion, los enlaces al autor original y la indicacion de que cada modelo conserva su licencia y atribucion originales. No se declaran arquitectura, numero de parametros, longitud de contexto, idiomas, licencia concreta ni formato de pesos, y el tamano del repositorio figura como 0,0 GB, lo que sugiere que los pesos no estan alojados en este espacio o que se sirven por otra via.

Por tanto, esta ficha describe un artefacto de distribucion mas que un modelo documentado: cualquier evaluacion tecnica rigurosa exige consultar el repositorio GitHub original y el articulo citado. La relevancia actual del repositorio es limitada como modelo en si (0 descargas y 0 likes en el momento de la consulta), pero si es util como punto de entrada al ecosistema SharkTrack y a su integracion en AddaxAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la model card; se indica que cada modelo conserva su licencia original y se remite a los ficheros de licencia del repositorio GitHub original |
| Formato de pesos | no disponible (el repositorio ocupa 0,0 GB segun HuggingFace) |
| Desarrollador original | Filippo Varini |
| Distribuidor | Addax Data Science |
| Uso previsto declarado | redistribucion para integracion en AddaxAI |
| Fecha de creacion en HuggingFace | 2026-09-11 (fecha indicada por la plataforma) |
| Ultima actualizacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |
| Etiquetas declaradas | arxiv:2407.20623, region:us |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura en el material proporcionado. La model card no menciona si se trata de un transformer, una CNN de vision, un modelo MoE, una arquitectura hibrida o cualquier otra familia. Tampoco se detallan el numero de parametros, la composicion del dataset de entrenamiento, el volumen de tokens, ni si hubo fases de ajuste fino con RLHF, DPO u otras tecnicas de alineamiento.

El unico dato tecnico indirecto es la referencia al articulo arXiv 2407.20623, que constituye la fuente primaria para conocer el diseno del sistema. Del nombre del proyecto y del contexto de publicacion (integracion en AddaxAI, una plataforma de analisis de imagenes) se puede inferir que el modelo esta orientado a tareas de vision por computador, probablemente deteccion o seguimiento de tiburones en video submarino, pero esta inferencia no esta confirmada por ninguna fuente incluida en la informacion disponible y no debe tomarse como un hecho verificado.

## Capacidades

La informacion proporcionada no permite enumerar capacidades concretas del modelo. La model card no incluye seccion de capacidades, ejemplos de uso, demos ni descripcion funcional. Los unicos elementos disponibles son:

- Redistribucion para integracion con AddaxAI, segun declara el propio repositorio.
- Referencia a un proyecto denominado SharkTrack y a su pagina informativa.
- Referencia a una publicacion cientifica (arXiv 2407.20623).
- Vinculacion a un repositorio GitHub que contiene la licencia original.

No hay datos sobre generacion de texto, razonamiento, codigo, matematicas, vision, soporte de tool calling, capacidades de agente, multilingueismo ni modos especiales de inferencia (thinking mode, audio, etc.). Cualquier afirmacion al respecto seria especulativa.

## Casos de uso

Los siguientes escenarios se derivan exclusivamente del contexto declarado (integracion en AddaxAI y proyecto SharkTrack) y se marcan como inferencias no confirmadas por la documentacion del repositorio. Deben validarse contra el repositorio GitHub original y el articulo antes de cualquier despliegue.

- Analisis automatizado de video submarino: si el modelo implementa deteccion o seguimiento visual, encajaria en pipelines que procesan grabaciones de camaras subacuaticas para localizar individuos, reduciendo la revision manual de horas de metraje.
- Monitorizacion de poblaciones de tiburones: uso en programas de conservacion que necesitan estimar presencia, frecuencia y patrones de aparicion de especies a partir de footage recogido con cebos o estaciones fijas.
- Integracion en la plataforma AddaxAI: el proposito declarado del repositorio es precisamente servir como componente listo para usar dentro de AddaxAI, de modo que el caso de uso mas directo es su carga como modulo dentro de ese flujo de trabajo.
- Etiquetado asistido para investigadores: preanotacion de grandes volumenes de video o imagen para que el personal cientifico revise y corrija, acelerando la creacion de datasets anotados.
- Turismo y seguridad en playas: deteccion temprana de presencia de escualos en zonas de bano, siempre que la latencia y la tasa de falsos positivos sean las adecuadas para operacion en tiempo real.
- Investigacion en vision por computador aplicada: uso del modelo y del articulo asociado como baseline reproducible para comparar tecnicas de deteccion o seguimiento en dominios de imagen submarina con poca visibilidad y oclusiones frecuentes.
- Estudios de comportamiento y ecologia: extraccion de trayectorias y metricas de movimiento a partir de las detecciones, para analisis posteriores de patrones espaciotemporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, mAP ni comparaciones con otros sistemas, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo (los resultados obtenidos corresponden al antilope addax y a empresas no vinculadas). Para datos de evaluacion hay que acudir al articulo arXiv 2407.20623.

## Requisitos de hardware

No se dispone de datos de VRAM, GPU recomendadas, latencia ni throughput en la informacion proporcionada. Observaciones derivadas de los metadatos:

- Tamano del repositorio: 0,0 GB. No hay pesos alojados en el espacio de HuggingFace, por lo que no es posible estimar el consumo de memoria a partir del repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, ONNX Runtime, TensorRT): no disponible.
- Latencia y throughput: no disponible.
- Nota practica: al tratarse de una redistribucion, los requisitos reales dependen del modelo original y deben consultarse en filippovarini.com/sharktrack y en el repositorio GitHub del autor.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica la categoria tecnica del modelo (vision, lenguaje, multimodal), su tamano ni sus resultados, por lo que no es posible establecer una comparacion fundamentada con alternativas. Cualquier tabla comparativa requeriria primero determinar, a partir del articulo arXiv 2407.20623, que tipo de modelo es y que tarea resuelve.

## Limitaciones y advertencias

- Model card practicamente vacia: el contenido publicado es unicamente un aviso de redistribucion, sin documentacion tecnica util para evaluacion.
- Trazabilidad de licencia: la licencia no aparece en la model card. El repositorio indica que cada modelo conserva su licencia original y remite a los ficheros de licencia del proyecto de origen; es obligatorio revisarlos antes de cualquier uso comercial.
- Ausencia de pesos: con 0,0 GB de tamano de repositorio, es probable que los pesos no esten alojados en HuggingFace. No se puede verificar la integridad ni la version de los artefactos desde este espacio.
- Sin validacion de terceros: 0 descargas y 0 likes implican ausencia de uso reportado y de evidencia externa de funcionamiento.
- Riesgo de alucinacion y sesgos: no evaluable con la informacion disponible; no hay datos sobre el dataset de entrenamiento ni sobre su composicion demografica, geografica o de especies.
- Limitaciones de contexto e idioma: no disponibles.
- Uso en produccion: no se recomienda desplegar este artefacto sin antes consultar el repositorio GitHub original, verificar la licencia aplicable y validar el rendimiento en el dominio concreto de aplicacion.
- Fechas de publicacion: las marcas temporales de HuggingFace (2026) son posteriores a la fecha estandar de la consulta; conviene confirmarlas en la plataforma.
- Resultados de busqueda no relacionados: las busquedas web devolvieron paginas sobre el antilope addax y empresas homonimas, sin relacion con el modelo. No se ha encontrado informacion independiente que lo respalde.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Addax-Data-Science/SHARKTRACK-1-0
- Pagina del proyecto SharkTrack: https://www.fvarini.com/sharktrack
- Articulo cientifico (arXiv 2407.20623): https://arxiv.org/abs/2407.20623
- Repositorio y licencia originales: https://github.com/filippovarini/sharktrack
- Plataforma AddaxAI: https://addaxdatascience.com/addaxai/
- Sitio de Addax Data Science: https://addaxdatascience.com/
