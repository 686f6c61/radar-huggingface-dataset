# linfelix/document-ai-proto-2023

## Resumen

`linfelix/document-ai-proto-2023` es un repositorio de Hugging Face publicado por el usuario linfelix que, pese a su identificador y a contener un fichero de pesos en formato safetensors, no constituye un modelo de lenguaje entrenado. La model card lo describe explicitamente como un conjunto estructurado de notas de investigacion sobre Document AI, con referencias de evaluacion y preguntas abiertas, donde los planes e hipotesis se mantienen separados de los resultados completados. El autor declara que el repositorio no presenta mejoras en benchmarks, ablaciones terminadas, codigo publicado ni un checkpoint entrenado.

El dato tecnico mas relevante es el recuento de parametros reportado en safetensors: 33.088. Se trata de una cifra de tres ordenes de magnitud inferior a la de cualquier transformer funcional para procesamiento de documentos, lo que confirma que el artefacto de pesos es simbolico o de prueba y no un modelo con capacidad de inferencia util. El tamano del repositorio es de 0,0 GB y las descargas y likes registrados son cero.

Por tanto, esta ficha debe leerse como una evaluacion de un artefacto de investigacion reproducible y no como la de un modelo desplegable. Su interes es documental: fija el alcance de una pregunta de investigacion sobre Document AI, propone comparaciones con baselines emparejados y cita conjuntos de evaluacion concretos (FUNSD, SROIE y CORD) como punto de partida para verificar el estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (etiqueta declarada; no se especifica la variante ni la configuracion) |
| Parametros totales | 33.088 (segun recuento de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline de Hugging Face | no disponible |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-20 |
| Fecha de actualizacion | 2026-11-20 |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta `transformer` asociada al repositorio y la presencia de un fichero safetensors con 33.088 parametros. No se publica configuracion de capas, dimensiones ocultas, numero de cabezas de atencion, mecanismo de atencion ni tokenizador. El volumen de parametros es incompatible con un transformer entrenado para tareas de Document AI, donde los modelos de referencia manejan decenas o cientos de millones de parametros; cabe interpretar el fichero como un artefacto de prueba o un marcador de posicion.

No hay informacion sobre datos de entrenamiento, numero de tokens procesados, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card indica de forma explicita que no se ha publicado ningun checkpoint entrenado y que, si en el futuro se anaden resultados, deberan acompanarse de versiones de dataset, comandos, semillas, hardware y logs en bruto.

## Capacidades

- El repositorio no documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas o vision.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues; el campo de idiomas figura como no disponible.
- No se declara modo de pensamiento (thinking mode), entrada de audio ni procesamiento de imagen.
- La unica funcion documentada es servir de contenedor de notas de investigacion sobre Document AI, con el fichero `summary.md` como artefacto principal.

## Casos de uso

- Revision de alcance de un estudio sobre Document AI: el fichero `summary.md` permite a un investigador contrastar como se delimita la pregunta de investigacion, que confusores se identifican y que hipotesis quedan explicitamente marcadas como no verificadas.
- Planificacion de evaluaciones en extraccion de informacion de documentos: las notas citan FUNSD, SROIE y CORD como contexto de evaluacion concreto, lo que sirve para disenar un protocolo de comparacion antes de ejecutar experimentos.
- Definicion de baselines emparejados: la model card menciona una comparacion propuesta con baselines emparejados, util como plantilla metodologica para equipos que preparan sus propias ablaciones.
- Auditoria de reproducibilidad: las notas enumeran comprobaciones de reproducibilidad y modos de fallo, aprovechables como lista de verificacion para publicaciones experimentales en Document AI.
- Plantilla de documentacion de investigacion: la separacion explicita entre planes, hipotesis y resultados completados sirve como convencion de redaccion para repositorios de notas tecnicas.
- Referencia de licencia y uso de datos: el repositorio se publica bajo MIT y advierte de revisar por separado los terminos de los datos de origen cuando se combina con datasets externos, lo que resulta util como recordatorio contractual en proyectos que reutilizan FUNSD, SROIE o CORD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card declara que el repositorio no reclama mejoras en benchmarks ni ablaciones completadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; con 33.088 parametros el fichero de pesos ocupa practicamente nada, pero no constituye un modelo ejecutable para tareas reales.
- GPU recomendadas: no disponible, al no existir un modelo funcional que desplegar.
- Compatibilidad con GPU de consumo: irrelevante en la practica; el artefacto cabria en cualquier dispositivo, pero no produce inferencia significativa.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documenta pipeline ni formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables, dado que el artefacto no es un modelo entrenado sino un repositorio de notas de investigacion. Los conjuntos de evaluacion citados (FUNSD, SROIE, CORD) corresponden a benchmarks de Document AI, no a modelos con los que establecer una comparacion de parametros, contexto o licencia.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado; la model card lo declara de forma explicita y advierte de que planes e hipotesis no deben interpretarse como resultados experimentales.
- El recuento de 33.088 parametros es incompatible con un transformer funcional, por lo que cualquier uso como modelo de inferencia carece de sentido tecnico.
- No hay informacion sobre sesgos, tasas de alucinacion ni comportamiento en produccion, al no existir modelo evaluable.
- No se declaran idiomas soportados, lo que impide cualquier afirmacion sobre cobertura multilingue.
- La licencia MIT cubre el repositorio, pero la propia model card advierte de que los terminos de los datos de origen deben revisarse por separado cuando se usa con datasets externos; esto es relevante para uso comercial que incorpore FUNSD, SROIE o CORD.
- No se ha publicado codigo, checkpoint ni logs; la ausencia de versiones de dataset, comandos, semillas y hardware impide reproducir cualquier resultado.
- No debe citarse como evidencia de mejoras en Document AI: las referencias y datasets propuestos son un punto de partida para verificacion, no prueba de que el estudio se haya ejecutado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/linfelix/document-ai-proto-2023
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios de codigo o demos.
