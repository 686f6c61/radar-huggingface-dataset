# ethan-martinez/paper-document-ai

## Resumen

ethan-martinez/paper-document-ai no es un modelo entrenado, sino un repositorio de notas de investigacion sobre Document AI publicado en HuggingFace bajo licencia MIT. La model card es explicita al respecto: se trata de un cuaderno de trabajo ("reading notes and an experiment sketch") cuyo artefacto principal es el fichero `review.md`, y que recoge el alcance de una pregunta de investigacion, los posibles factores de confusion, una comparacion propuesta con lineas base emparejadas y un contexto de evaluacion basado en los conjuntos de datos FUNSD, SROIE y CORD. El autor indica expresamente que el repositorio no reclama mejoras de benchmark, no contiene ablaciones completas, no publica codigo y no libera ningun checkpoint entrenado.

El repositorio esta etiquetado como `transformer`, `safetensors`, `document-ai` y `research-notes`, con un tamano declarado de 0,0 GB y 0 descargas y 0 likes en el momento de la consulta. Los metadatos de safetensors reportan 33.088 parametros totales, una cifra que no corresponde a un modelo de lenguaje o de vision entrenado y que resulta compatible con tensores auxiliares o artefactos de prueba, no con un transformer funcional. No se declaran idiomas soportados, pipeline ni resultados experimentales.

Su relevancia es, por tanto, documental y metodologica: sirve como ejemplo de cuaderno de investigacion abierto que separa explicitamente hipotesis de resultados, e incluye requisitos de reproducibilidad (versiones de dataset, comandos, semillas, hardware y registros en crudo) para el caso de que se anadan resultados en el futuro. No debe presentarse ni desplegarse como un modelo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta de metadatos indica "transformer", pero el repositorio no contiene definicion de arquitectura, configuracion ni checkpoint entrenado) |
| Parametros totales | 33.088 (dato reportado por safetensors; no corresponde a un modelo entrenado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no declarados en la model card ni en los metadatos) |
| Licencia | MIT |
| Formato de pesos | safetensors (segun etiquetas del repositorio; sin checkpoint funcional identificado) |

Otros datos del repositorio: autor ethan-martinez, tamano 0,0 GB, 0 descargas, 0 likes, pipeline no disponible, region declarada `us`, fecha de creacion 2026-10-02 y ultima actualizacion 2026-10-02.

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura en el sentido habitual del termino. El repositorio no incluye fichero de configuracion, codigo de modelado, tokenizador, pesos de un transformer entrenado ni artefacto de inferencia. La unica senal arquitectonica es la etiqueta `transformer` en los metadatos de HuggingFace, que no va acompanada de ninguna definicion tecnica. Los 33.088 parametros reportados por safetensors son incompatibles con cualquier transformer de proposito general, incluso los mas pequenos orientados a vision de documentos, por lo que lo mas razonable es interpretarlos como tensores auxiliares o residuales.

Tampoco existe informacion sobre entrenamiento: no se indica numero de tokens, composicion del dataset, uso de RLHF, DPO, SFT ni ninguna otra etapa de alineamiento. Lo que si describe la model card es el contenido del cuaderno: el alcance de la pregunta de investigacion y sus probables factores de confusion, una comparacion propuesta con lineas base emparejadas, el contexto de evaluacion (FUNSD, SROIE y CORD), comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas, ademas de referencias tematicas. El autor subraya que las secciones etiquetadas como planes o hipotesis no deben interpretarse como resultados experimentales y que cualquier resultado futuro deberia acompanarse de versiones de dataset, comandos, semillas, hardware y registros en crudo.

## Capacidades

- Generacion de texto: no disponible; el repositorio no contiene un modelo capaz de generar texto.
- Razonamiento: no disponible; no hay checkpoint ni evaluacion asociada.
- Generacion de codigo: no disponible.
- Matematicas: no disponible.
- Vision o comprension de documentos: no disponible como capacidad implementada. La tematica del cuaderno es Document AI, pero no se libera ningun modelo que procese imagenes o documentos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

En su lugar, el repositorio aporta contenido metodologico: definicion del alcance de la investigacion, identificacion de factores de confusion, propuesta de comparacion con lineas base emparejadas, contexto de evaluacion sobre FUNSD, SROIE y CORD, comprobaciones de reproducibilidad y catalogo de modos de fallo y preguntas abiertas.

## Casos de uso

Los siguientes escenarios corresponden a la linea de investigacion que el cuaderno esboza, no a capacidades verificadas de un modelo desplegable. Se listan como aplicaciones potenciales de un futuro sistema de Document AI con evaluacion sobre FUNSD, SROIE y CORD, no como funciones disponibles hoy.

- Revision metodologica de experimentos en Document AI: el repositorio sirve como plantilla para documentar una pregunta de investigacion, sus factores de confusion y las lineas base con las que comparar, evitando declarar resultados antes de obtenerlos.
- Diseno de protocolos de evaluacion sobre extraccion de informacion de formularios: la nota propone medir sobre FUNSD, un conjunto de formularios escaneados con entidades etiquetadas, lo que permite fijar metricas y criterios de comparacion antes de entrenar nada.
- Evaluacion de extraccion de recibos y facturas: SROIE se cita como contexto de evaluacion para tareas de extraccion de campos clave en documentos comerciales escaneados.
- Analisis de recibos de compra en indonesio: CORD aparece mencionado como referencia para el analisis estructurado de tickets, util para quienes necesitan comparar comportamiento entre dominios y alfabetos.
- Auditoria de reproducibilidad en publicaciones de vision de documentos: la exigencia explicita de versiones de dataset, comandos, semillas, hardware y registros en crudo sirve como lista de comprobacion para revisores o equipos internos.
- Catalogo de modos de fallo antes de invertir en produccion: el apartado de failure modes permite anticipar errores tipicos (documentos girados, baja resolucion, plantillas no vistas) antes de seleccionar un modelo real.
- Establecimiento de lineas base emparejadas: la propuesta de comparacion con baselines emparejados es util para disenar estudios que controlen presupuesto de computo y datos, evitando comparaciones enganosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que el repositorio no reclama mejoras de benchmark ni ablaciones completas, y que las secciones marcadas como planes o hipotesis no son resultados. No se dispone de cifras de MMLU, HumanEval, GSM8K, F1 en FUNSD, SROIE o CORD, ni de ninguna otra metrica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; no existe un checkpoint que ejecutar.
- GPU recomendadas: no disponible por la misma razon.
- Viabilidad en GPU de consumo: no aplica. Los 33.088 parametros reportados por safetensors cabrian con holgura en cualquier dispositivo, incluida una CPU, pero no constituyen un modelo utilizable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna aplicable. No hay pesos GGUF, no hay fichero de configuracion de transformer y no hay pipeline declarado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No es posible establecer una comparativa tecnica, porque el repositorio no contiene un modelo con el que comparar. Los nombres que aparecen en la nota (FUNSD, SROIE, CORD) son conjuntos de datos de referencia, no modelos. Los metadatos no mencionan ninguna linea base concreta con parametros o resultados asociados.

| Criterio | paper-document-ai | Alternativas de la categoria |
|---|---|---|
| Parametros | 33.088 (artefacto, no modelo) | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento en benchmarks | no disponible | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad de checkpoint | no | no disponible |

No se dispone de datos suficientes para identificar alternativas comparables dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no debe citarse, desplegarse ni evaluarse como un sistema de IA. Etiquetarlo como "modelo" en cualquier catalogo seria incorrecto.
- Ausencia de checkpoint: no hay pesos utilizables, ni configuracion, ni tokenizador, ni codigo de inferencia.
- Cifra de parametros enganosa: los 33.088 parametros de safetensors pueden inducir a error si se interpretan como el tamano de un modelo; son compatibles con tensores auxiliares.
- Contenido no verificado: el propio autor advierte que el material es exploratorio y que no se han ejecutado los experimentos descritos. Las hipotesis no son evidencia.
- Riesgo de alucinacion atribuible al repositorio: no aplica a un modelo, pero si al uso del texto como fuente; las referencias se presentan como punto de partida para verificar, no como resultados validados.
- Idiomas: no declarados. No puede asumirse cobertura multilingue.
- Licencia MIT: permite uso comercial del contenido del repositorio, pero la model card advierte que los terminos de los datos de origen deben revisarse por separado cuando se combina con datasets externos (FUNSD, SROIE, CORD tienen sus propias condiciones).
- Grado de madurez: repositorio con 0 descargas, 0 likes, sin pipeline y sin modelo; adecuado como nota de trabajo, no como dependencia de produccion.
- Fechas de metadatos: creacion y actualizacion registradas el 2026-10-02, con apenas cinco segundos de diferencia, lo que sugiere una subida automatizada o de prueba.
- Sesgos conocidos: no disponibles; no hay datos ni evaluacion que permitan caracterizarlos.
- Limitaciones de contexto: no disponibles; no se declara ventana de contexto.

## Enlaces

- HuggingFace: https://huggingface.co/ethan-martinez/paper-document-ai
- Fichero `review.md`: referenciado en la model card como artefacto principal del repositorio; no se proporciona URL directa en la informacion disponible.
- Fichero `README.md`: documentacion del repositorio; no se proporciona URL directa en la informacion disponible.
- Conjuntos de datos citados como contexto de evaluacion: FUNSD, SROIE y CORD (mencionados en el texto, sin enlaces en la informacion proporcionada).
- Resultados de busqueda web: los enlaces recuperados corresponden a paginas sobre el nombre propio "Ethan" (journaldesfemmes.fr, parents.fr, prenoms.com, en.wikipedia.org, fr.wikipedia.org) y no guardan relacion con el repositorio. No se han encontrado papers, blogs, repositorios de codigo ni demos asociados en la informacion disponible.
