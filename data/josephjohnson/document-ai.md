# josephjohnson/document-ai

## Resumen

`josephjohnson/document-ai` es un repositorio alojado en HuggingFace que, pese a estar etiquetado con `safetensors` y `transformer`, no contiene un modelo entrenado ni una model card de un sistema de IA desplegable. Su propio README lo describe como un conjunto de notas de lectura y un esbozo de experimento sobre Document AI, con enfasis explicito en "lo que todavia queda por probar" en lugar de en resultados obtenidos. El autor declara de forma literal que el repositorio "no reclama mejoras de benchmark, ablaciones completadas, codigo publicado ni un checkpoint entrenado".

El unico dato cuantitativo real disponible es el recuento de parametros del tensor almacenado: 24.832 parametros. Se trata de un orden de magnitud propio de un tensor auxiliar o de prueba (por ejemplo, una matriz de proyeccion pequena), no de un modelo de lenguaje funcional: para ponerlo en contexto, un transformer de 125 millones de parametros multiplica esa cifra por mas de 5.000. El tamano del repositorio es de 0,0 GB, lo que refuerza la conclusion de que no hay pesos de un modelo utilizable.

La relevancia de esta ficha es, por tanto, documental y de advertencia: sirve para identificar rapidamente que este identificador no debe confundirse con un modelo de Document AI listo para produccion. El interes tematico del repositorio se limita a su propuesta metodologica (comparacion con baselines emparejados, evaluacion sobre FUNSD, SROIE y CORD, y comprobaciones de reproducibilidad), que puede resultar util como guia de diseno experimental, pero no como artefacto de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio indica `transformer`, pero no se describe ninguna arquitectura concreta; el README no especifica capas, dimensiones ni tipo de atencion) |
| Parametros totales | 24.832 (dato real declarado en los safetensors del repo) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declara formato `safetensors`; no hay GGUF, AWQ, GPTQ ni variantes cuantizadas publicadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el tag de idioma no aparece en los metadatos) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura del modelo. El repositorio incluye la etiqueta `transformer`, que es un descriptor generico de familia y no especifica si se trata de un encoder tipo BERT, un decoder autorregresivo, un modelo vision-lenguaje o cualquier otra variante orientada a documentos. Tampoco se detallan el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la funcion de activacion ni el esquema de posicionamiento. No se describe ninguna innovacion tecnica como atencion lineal, decodificacion especulativa o arquitecturas hibridas SSM.

Respecto al entrenamiento, la model card es explicita: no se ha publicado ningun proceso de entrenamiento completado, ni el volumen de tokens, ni la composicion del dataset, ni si hubo ajuste por RLHF, DPO o instrucciones. El contenido del repositorio son notas de investigacion (`review.md`) que plantean el alcance de una pregunta de investigacion, posibles factores de confusion, una comparacion propuesta con baselines emparejados y un contexto de evaluacion sobre los conjuntos FUNSD, SROIE y CORD. El README indica que las secciones marcadas como planes o hipotesis no deben interpretarse como resultados experimentales y que, si en el futuro se anaden resultados, deberian incluir versiones de dataset, comandos, semillas, hardware y registros en bruto. A fecha de los metadatos disponibles, nada de eso esta presente.

## Capacidades

- No se puede confirmar ninguna capacidad funcional de generacion de texto, razonamiento, codigo o matematicas: no existe un checkpoint entrenado descrito ni una evaluacion publicada.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de soporte para agentes ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingues; los idiomas soportados no estan declarados.
- No hay evidencia de capacidades de vision, OCR, comprension de layout o procesamiento de documentos, pese a que el nombre del repositorio y sus etiquetas apunten a ese dominio.
- No se declara ningun modo especial de inferencia (thinking mode, razonamiento extendido, audio, etc.).
- Un tensor de 24.832 parametros es, en cualquier caso, insuficiente para sostener capacidades linguisticas o perceptivas de proposito general.

## Casos de uso

- Revision metodologica de un proyecto de Document AI: el archivo `review.md` puede leerse como plantilla para disenar un estudio sobre extraccion de informacion documental, incluyendo la seleccion de baselines emparejados y de conjuntos de evaluacion.
- Planificacion de evaluacion sobre FUNSD, SROIE y CORD: el repositorio enumera estos conjuntos como contexto de evaluacion propuesto, de modo que resulta util para decidir que metricas y particiones habria que emplear antes de entrenar cualquier modelo.
- Identificacion de factores de confusion en experimentos de OCR y comprension de documentos: las notas describen explicitamente este punto, lo que puede ayudar a evitar sesgos de comparacion en fases tempranas.
- Checklist de reproducibilidad: el README exige versiones de dataset, comandos, semillas, hardware y registros en bruto si se anaden resultados, lo que sirve como lista de verificacion para equipos de investigacion.
- Control de calidad de un catalogo de modelos: esta ficha permite descartar rapidamente `josephjohnson/document-ai` como dependencia de produccion al comprobar que no hay checkpoint ni benchmarks.
- Formacion de personal tecnico: como ejemplo documentado de la diferencia entre un repositorio de notas de investigacion y un artefacto de modelo publicable con pesos y evaluacion.

Ninguno de estos casos implica ejecutar el modelo; son usos del contenido documental del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que el repositorio no reclama mejoras de benchmark ni ablaciones completadas, y que los conjuntos FUNSD, SROIE y CORD se mencionan unicamente como contexto de evaluacion propuesto, no como resultados obtenidos.

## Requisitos de hardware

- VRAM para inferencia: partiendo del unico dato real disponible (24.832 parametros), un tensor en precision completa ocuparia del orden de 0,1 MB y en precision media del orden de 0,05 MB. Son cifras derivadas del recuento de parametros, no medidas publicadas, y en la practica no describen un modelo ejecutable.
- GPU recomendadas: no disponible. No hay ninguna recomendacion de hardware en el repositorio.
- Compatibilidad con GPU de consumo: cualquier GPU, incluida una integrada, albergaria un tensor de ese tamano; sin embargo, no existe un pipeline de inferencia descrito que permita aprovecharlo.
- Opciones de despliegue: no disponible. El repositorio no documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI, Transformers ni ningun otro runtime.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No procede establecer una comparativa con modelos de Document AI como LayoutLMv3, Donut o similares, porque este repositorio no publica parametros comparables, ni contexto, ni resultados de evaluacion, ni un checkpoint entrenado. La unica magnitud conocida (24.832 parametros) no es equivalente a la de ningun modelo de documento desplegable.

| Criterio | josephjohnson/document-ai | Alternativas de Document AI |
|---|---|---|
| Parametros | 24.832 | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento | sin benchmarks publicados | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad de pesos utilizables | no se declara checkpoint entrenado | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado; su propio README lo confirma. No debe usarse como dependencia en produccion.
- Los unicos artefactos declarados son `review.md` (notas principales) y `README.md` (documentacion); no hay codigo de inferencia ni script de evaluacion publicado.
- Con 24.832 parametros y un peso total de repositorio de 0,0 GB, el contenido no puede sostener tareas de generacion, razonamiento u OCR.
- La etiqueta `transformer` en los metadatos no esta respaldada por ninguna descripcion arquitectonica, por lo que no debe tomarse como especificacion tecnica.
- No se declaran idiomas soportados, contextos, sesgos conocidos ni tasas de alucinacion porque no hay modelo evaluado. Cualquier afirmacion al respecto seria especulativa.
- La licencia MIT cubre el contenido del repositorio, pero el propio autor advierte de que los terminos de los datos de origen deben revisarse por separado cuando se utilicen conjuntos de datos externos; esto es relevante para FUNSD, SROIE y CORD, que tienen condiciones propias.
- Los metadatos muestran cero descargas y cero likes, y una fecha de creacion y actualizacion de octubre de 2026 con cinco segundos de diferencia, lo que sugiere un repositorio recien creado y sin validacion por parte de la comunidad.
- Los resultados de la busqueda web realizada no guardan ninguna relacion con el modelo ni con Document AI (devuelven sitios de contenido audiovisual para adultos); no se ha encontrado documentacion externa, paper, repositorio de codigo ni demo asociados a este identificador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/josephjohnson/document-ai
- Model card (contenido citado en esta ficha): incluida en el propio repositorio en `README.md`
- Artefacto principal del repositorio: `review.md` (no accesible mediante una URL directa en la informacion proporcionada)
- Paper: no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible
- Otros enlaces relevantes: no se han encontrado en la busqueda web; los resultados obtenidos no estan relacionados con este modelo
