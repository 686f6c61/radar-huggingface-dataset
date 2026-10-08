# davidchhh/document-ai-lite

## Resumen

`davidchhh/document-ai-lite` es un repositorio alojado en HuggingFace que, segun su propia model card, contiene notas de lectura y un esbozo de experimento sobre Document AI, no un modelo entrenado ni un checkpoint listo para produccion. El autor lo describe explicitamente como un artefacto exploratorio centrado en "lo que queda por probar" y no en resultados. Pese a estar etiquetado con `safetensors` y `transformer`, la model card no documenta ninguna arquitectura, dataset de entrenamiento ni proceso de ajuste.

El dato objetivo mas relevante es el recuento de parametros en los ficheros safetensors: 24.832 parametros totales, una cifra propia de un tensor auxiliar o de un modelo de juguete, no de un sistema de Document AI utilizable. El tamano del repositorio es de 0,0 GB y el pipeline no esta declarado. Las descargas y los "likes" son 0, lo que confirma que no hay adopcion ni validacion por parte de la comunidad.

Por todo ello, este repositorio debe interpretarse como material de investigacion preliminar (notas sobre FUNSD, SROIE y CORD, con propuestas de comparacion y comprobaciones de reproducibilidad) y no como un modelo desplegable. Cualquier evaluacion de capacidades, rendimiento o hardware se refiere, en el mejor de los casos, a una intencion declarada, nunca a resultados verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (segun tag del repositorio; sin detalles en la model card) |
| Parametros totales | 24.832 (dato real de safetensors) |
| Parametros activos | no aplica (no se describe arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna. El unico indicio es la etiqueta `transformer`, que no viene acompanada de especificaciones de capas, dimension de embeddings, mecanismos de atencion ni tipo de tokenizador. El recuento de parametros (24.832) es incompatible con cualquier modelo de lenguaje o de vision para documentos con capacidad real de inferencia, por lo que lo mas probable es que el tensor guardado corresponda a un componente auxiliar, a una prueba de formato o a un artefacto de configuracion.

Tampoco hay datos de entrenamiento: la model card no menciona numero de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. Los benchmarks de Document AI citados en las notas (FUNSD, SROIE, CORD) aparecen como propuesta de evaluacion futura, no como resultados obtenidos. La propia model card advierte que las secciones marcadas como planes o hipotesis no deben interpretarse como resultados experimentales.

## Capacidades

- Generacion de texto: no disponible; no hay evidencia de que el artefacto pueda generar texto.
- Razonamiento, codigo o matematicas: no disponible.
- Vision o comprension de documentos: no disponible pese al nombre del repositorio.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se declara ningun idioma).
- Capacidades especiales (modo de pensamiento, audio, etc.): no disponibles.

La unica funcionalidad verificable del repositorio es documental: albergar un fichero `notes.md` con notas de investigacion y un `README.md` descriptivo.

## Casos de uso

- Revision de literatura sobre Document AI: el repositorio sirve como punto de partida para localizar preguntas de investigacion y confusores potenciales, no para ejecutar inferencia.
- Planificacion de experimentos: las notas proponen una comparacion con baselines emparejados, util como guion metodologico antes de entrenar modelos reales.
- Seleccion de conjuntos de evaluacion: se citan FUNSD, SROIE y CORD como contexto de evaluacion, aprovechables para disenar un banco de pruebas de extraccion de informacion de documentos.
- Auditoria de reproducibilidad: la insistencia en registrar versiones de dataset, comandos, semillas, hardware y logs sin procesar es aplicable como checklist en proyectos de vision de documentos.
- Formacion y divulgacion: el material puede usarse para explicar a un equipo que un repositorio de notas no equivale a un checkpoint desplegable.
- Analisis de modos de fallo: el enfasis en failure modes y preguntas abiertas resulta util para anticipar riesgos antes de invertir en un pipeline de Document AI.

En ninguno de estos casos el modelo en si realiza tareas de extraccion, clasificacion o generacion: el valor reside en la documentacion adjunta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente que el repositorio no reclama mejoras de benchmark, ablaciones completadas, codigo liberado ni checkpoint entrenado. Los conjuntos FUNSD, SROIE y CORD se mencionan como contexto de evaluacion propuesto, no como cifras obtenidas.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula. Con 24.832 parametros, los pesos ocupan aproximadamente 99 KB en fp32 (24.832 x 4 bytes) y unos 50 KB en fp16/bf16.
- GPU recomendadas: no se requiere GPU; el artefacto cabe en CPU, memoria RAM convencional e incluso en cache de nivel 1/2 de un procesador moderno.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e integrada; el cuello de botella no es el computo sino la ausencia de una arquitectura funcional.
- Opciones de despliegue: no disponible. No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningun runtime de inferencia.
- Latencia y throughput: no disponibles y no significativos dado el tamano y la falta de definicion del modelo.

## Comparativa con modelos similares

No disponible. No existen modelos comparables de forma significativa: el repositorio no es un modelo de Document AI desplegable, sino un conjunto de notas. Cualquier comparacion con sistemas reales de vision de documentos (por ejemplo, clasificadores de layout, modelos de extraccion de campos o modelos multimodal genericos) careceria de base, ya que este repositorio no declara tarea, entrada, salida ni metricas. La comparacion se omite por falta de datos verificables.

## Limitaciones y advertencias

- No es un modelo entrenado: la model card declara que no hay checkpoint liberado ni codigo de inferencia.
- No hay garantia de que los 24.832 parametros en safetensors formen un modelo coherente; pueden ser un tensor auxiliar o un artefacto de prueba.
- Ausencia total de datos de entrenamiento, evaluacion y composicion del dataset, lo que impide auditar sesgos.
- Riesgo de interpretacion erronea: el nombre `document-ai-lite` puede inducir a pensar que se trata de un modelo operativo; no lo es.
- Idiomas no declarados: no puede asumirse soporte de castellano ni de ninguna otra lengua.
- Licencia cc-by-4.0: permite uso comercial y modificacion con atribucion, pero la propia model card advierte de que deben revisarse por separado los terminos de los datos de origen si se combina con datasets externos.
- Sin adopcion ni validacion: 0 descargas y 0 "likes" implican ausencia de pruebas por terceros.
- No apto para produccion en su estado actual: no hay API, pipeline ni contrato de entrada y salida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/davidchhh/document-ai-lite
- Notas del autor: `notes.md` (referenciado en la model card del propio repositorio)
- Documentacion del autor: `README.md` (incluido en el repositorio)

Referencias generales sobre Document AI localizadas en la busqueda web (no especificas de este repositorio ni validadas como parte de el):

- Document AI release notes, Google Cloud: https://docs.cloud.google.com/document-ai/docs/release-notes
- Best Document AI Models (octubre 2026), BenchLM: https://benchlm.ai/best/document-ai
- Local AI Model Cheat Sheet 2026: https://local-ai-models.ai/local-ai-models.html
- Best Free AI Models & APIs (2026), LM Market Cap: https://lmmarketcap.com/free-ai-models
- Analisis del incidente de cadena de suministro de LiteLLM, SOCRadar: https://socradar.io/blog/litellm-supply-chain-attack/
