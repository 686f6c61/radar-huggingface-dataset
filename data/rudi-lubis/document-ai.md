# rudi-lubis/document-ai

## Resumen

`rudi-lubis/document-ai` no es un modelo de lenguaje entrenado, sino un repositorio de notas de investigación sobre Document AI publicado en HuggingFace. La model card del autor lo describe explícitamente como un "experiment sketch": recoge el alcance de la pregunta de investigación, posibles factores de confusión, una comparación propuesta con baselines emparejados y un conjunto de referencias. El propio README advierte que las secciones marcadas como planes o hipótesis no deben interpretarse como resultados experimentales.

El repositorio incluye un artefacto en formato safetensors con 49.600 parámetros totales y un tamaño de repositorio de 0,0 GB, además de dos ficheros de texto (`notes.md` y `README.md`). No se publica checkpoint entrenado, código, pipeline de inferencia ni resultados de evaluación. Por tanto, el interés del recurso es documental y metodológico, no como modelo desplegable.

Su relevancia actual es limitada y de nicho: sirve como plantilla de buenas prácticas para investigadores que preparan un estudio comparativo en extracción de información de documentos, con mención explícita a los conjuntos de datos FUNSD, SROIE y CORD. No debe confundirse con un modelo utilizable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (segun la etiqueta del repositorio); no se detalla la configuracion, el numero de capas ni el tipo de atencion |
| Parametros totales | 49.600 (dato derivado del fichero safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0,0 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-16 |

## Arquitectura y entrenamiento

La etiqueta del repositorio indica `transformer`, pero la informacion disponible no incluye configuracion de capas, dimensiones de embeddings, numero de cabezas de atencion, funcion de activacion ni tipo de tokenizador. Tampoco se documenta si se trata de un encoder, un decoder o un modelo encoder-decoder. Con 49.600 parametros, el artefacto es varios ordenes de magnitud mas pequeno que cualquier transformer de Document AI publicado (LayoutLMv3-base, por ejemplo, maneja cifras de dos ordenes superiores), lo que sugiere que se trata de un fichero de prueba o de un residuo tecnico del proceso de publicacion, no de un modelo con capacidad funcional.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El README indica de forma explicita que el repositorio no reclama mejoras de benchmark, ablaciones completadas, codigo liberado ni checkpoint entrenado. El contenido principal es `notes.md`, con propuesta de comparacion, contexto de evaluacion sobre FUNSD, SROIE y CORD, y una lista de comprobaciones de reproducibilidad y modos de fallo.

## Capacidades

- No se ha publicado ninguna capacidad generativa verificable: el repositorio no incluye pesos de un modelo entrenado con fines de inferencia.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues.
- No hay capacidades de vision, OCR, layout understanding ni procesamiento de audio implementadas.
- Lo que si ofrece el artefacto es material metodologico: delimitacion del alcance de la pregunta de investigacion, identificacion de confounders, propuesta de baselines emparejados, contexto de evaluacion (FUNSD, SROIE, CORD), comprobaciones de reproducibilidad y lista de referencias.
- Recomendacion de uso interno del propio autor: leer `notes.md`; cualquier resultado futuro debe acompanarse de versiones de dataset, comandos, semillas, hardware y logs en crudo.

## Casos de uso

- Diseno de un protocolo de evaluacion en Document AI: el repositorio sirve como punto de partida para decidir que baselines emparejar y que confounders controlar antes de ejecutar un estudio sobre extraccion de campos en formularios. No aporta modelo, solo marco metodologico.
- Seleccion de conjuntos de datos de referencia: las notas mencionan FUNSD, SROIE y CORD como contexto de evaluacion, lo que resulta util para acotar el alcance de un experimento de key information extraction en facturas y recibos. Requiere verificar las referencias por separado.
- Revision bibliografica previa a un desarrollo: la seccion de referencias del repositorio puede usarse como semilla para una busqueda sistematica, asumiendo que las citas no han sido validadas por terceros.
- Plantilla de documentacion reproducible: la exigencia del autor de registrar semillas, versiones de dataset y logs en crudo puede reutilizarse como checklist interna de un equipo de investigacion antes de publicar resultados.
- Auditoria de expectativas sobre artefactos publicados en HuggingFace: este repositorio es un caso claro de fichero con etiqueta de modelo sin modelo funcional detras, util para ilustrar por que conviene inspeccionar el numero de parametros y el contenido del repositorio antes de integrarlo en un pipeline.
- Docencia sobre higiene experimental: el contraste entre las etiquetas `research-notes` y `transformer` permite explicar en un aula la diferencia entre notas exploratorias y resultados replicados.

En ninguno de estos casos el repositorio proporciona inferencia: todos los usos son documentales, metodologicos o formativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El README indica expresamente que no se reclaman mejoras de benchmark ni ablaciones completadas. Las busquedas web realizadas no han devuelto ningun resultado relacionado con este repositorio: los unicos enlaces recuperados corresponden a contenidos no relacionados (letras de canciones y articulos sobre la serie de videojuegos Metal Gear Solid), por lo que no aportan datos utilizables.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB. Con 49.600 parametros, los pesos en safetensors ocupan del orden de 0,2 MB en precision de 32 bits.
- GPU recomendadas: no se requiere GPU. El artefacto cabe en memoria de CPU sin dificultad.
- Compatibilidad con GPU de consumo: irrelevante, dado el tamano. Cualquier GPU consumer de los ultimos diez anos es sobradamente suficiente, igual que una CPU moderna.
- Opciones de despliegue: no se documenta ninguna. No hay configuracion de vLLM, llama.cpp, Ollama, TGI ni transformers publicada. El fichero safetensors puede cargarse con librerias genericas de serializacion, pero no se conoce la arquitectura necesaria para reconstruir un modelo funcional.
- Latencia y throughput: no disponibles. No tiene sentido medir throughput de generacion en un artefacto sin modelo generativo entrenado.
- Almacenamiento: el repositorio ocupa 0,0 GB segun HuggingFace.

## Comparativa con modelos similares

No es posible establecer una comparativa tecnica fiable: el repositorio no publica un modelo evaluable, por lo que carece de parametros comparables de rendimiento, contexto o licencia de uso practico. A continuacion se indican alternativas reales de la categoria Document AI, sin datos comparativos porque no estan disponibles en la informacion proporcionada.

| Modelo | Categoria | Parametros | Contexto | Licencia | Comparabilidad con este repositorio |
|---|---|---|---|---|---|
| rudi-lubis/document-ai | notas de investigacion + safetensors de 49.600 parametros | 49.600 | no disponible | MIT | referencia |
| LayoutLMv3 | modelo multimodal texto-layout para comprension de documentos | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | alternativa real en la misma area tematica, pero sin modelo funcional equivalente en este repositorio |
| Donut | modelo encoder-decoder para comprension de documentos sin OCR | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | misma area tematica |
| Nougat | modelo de conversion de PDF academico a Markdown | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | misma area tematica |

Los nombres de las alternativas se incluyen como orientacion de categoria; sus especificaciones deben consultarse en sus propias fichas, ya que no forman parte de la informacion suministrada.

## Limitaciones y advertencias

- Naturaleza del artefacto: no hay checkpoint entrenado, codigo, pipeline ni resultados. La model card lo declara abiertamente.
- Cifra de parametros: 49.600 parametros no permiten ninguna tarea de Document AI realista; es coherente con un fichero de prueba.
- Sesgos conocidos: no documentados. Al no existir modelo entrenado ni datos, no se puede auditar sesgo alguno.
- Riesgo de alusion: no aplica en el sentido habitual, pero si existe riesgo de atribuir capacidades al repositorio por su etiqueta `document-ai` y su formato safetensors.
- Limitaciones de contexto e idioma: no disponibles. No hay ventana de contexto declarada ni idiomas soportados.
- Licencia: MIT, permisiva para uso comercial, pero la propia model card advierte de que deben revisarse por separado los terminos de los datos de origen cuando el repositorio se utilice con datasets externos (FUNSD, SROIE, CORD tienen sus propias condiciones).
- Caveat para produccion: no integrar este repositorio en ningun sistema productivo como componente de inferencia. Su unico uso defendible es como material de lectura o como referencia metodologica.
- Ausencia de mantenimiento: creado y actualizado el mismo dia, con 0 descargas y 0 likes en el momento de la consulta.
- Busqueda web no concluyente: no se ha localizado ninguna referencia externa, publicacion ni discusion que respalde o amplie el contenido del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rudi-lubis/document-ai
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada. Los resultados devueltos no guardan relacion con el modelo.
