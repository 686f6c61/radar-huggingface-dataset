# juanderson/document-ai-sandbox

## Resumen

`juanderson/document-ai-sandbox` es un repositorio alojado en Hugging Face que, pese a su etiqueta `safetensors` y a declarar un pipeline de transformer, no contiene un modelo entrenado ni un checkpoint funcional. La model card lo describe explicitamente como un conjunto estructurado de notas de investigacion sobre Document AI, con referencias de evaluacion y preguntas abiertas, y aclara que no reclama mejoras en benchmarks, ablaciones completadas, codigo publicado ni pesos entrenados. El artefacto principal es un fichero `reading.md`.

El dato de parametros reportado por la plataforma (24.832) es coherente con un fichero de pesos residual o de prueba, no con un modelo de lenguaje desplegable: el tamano del repositorio es de 0.0 GB y no hay descargas ni likes. Por tanto, este repositorio debe tratarse como material de investigacion y no como un modelo listo para inferencia. Su relevancia es documental: sirve como punto de partida para verificar referencias sobre evaluacion en Document AI (FUNSD, SROIE, CORD) y para separar hipotesis de resultados.

La licencia es CC-BY-4.0, lo que permite uso y redistribucion con atribucion, pero el propio autor advierte que los terminos de los datos de origen deben revisarse por separado si se combina con datasets externos. No se dispone de informacion sobre arquitectura real, contexto, idiomas ni proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio se etiqueta como `transformer`, pero no contiene un modelo entrenado; es un conjunto de notas de investigacion) |
| Parametros totales | 24.832 (segun metadatos de safetensors; no corresponde a un modelo funcional) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (fichero residual; el artefacto principal es `reading.md`) |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura de red, capas, dimensiones ocultas ni mecanismo de atencion. El repositorio no documenta ningun proceso de entrenamiento: no se especifican tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. La model card indica de forma explicita que no se ha publicado ningun checkpoint entrenado y que, si en el futuro se anaden resultados, deberan incluir versiones de dataset, comandos, semillas, hardware y logs en bruto.

El contenido tematico gira en torno a Document AI: alcance de la pregunta de investigacion y posibles factores de confusion, propuesta de comparacion con lineas base emparejadas, contexto de evaluacion concreto (FUNSD, SROIE, CORD), comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas. Todo ello se presenta como material exploratorio, no como evidencia experimental.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingues.
- No se declara modo de pensamiento (thinking mode), vision ni audio.
- La unica funcionalidad real del repositorio es servir como notas estructuradas de investigacion sobre Document AI, con referencias a FUNSD, SROIE y CORD.

## Casos de uso

- Revision bibliografica sobre Document AI: usar `reading.md` como indice de referencias y preguntas abiertas para orientar una revision sistematica sobre extraccion de informacion en documentos.
- Planificacion de experimentos: emplear la seccion de comparacion con lineas base emparejadas como borrador para disenar un protocolo experimental con controles adecuados.
- Seleccion de datasets de evaluacion: tomar las referencias a FUNSD, SROIE y CORD como punto de partida para verificar disponibilidad, licencias y metricas antes de montar un pipeline de evaluacion.
- Analisis de modos de fallo: usar la lista de failure modes propuesta como checklist preliminar al auditar un sistema OCR o de comprension de documentos.
- Reproducibilidad: adoptar la exigencia del autor (versiones de dataset, comandos, semillas, hardware, logs) como plantilla de documentacion para experimentos propios.
- Docencia y formacion: utilizar el repositorio como ejemplo de separacion entre hipotesis y resultados en notas de investigacion, util en seminarios de metodologia.
- Verificacion de afirmaciones: contrastar las referencias citadas antes de reutilizarlas, dado que el propio autor advierte que son un punto de partida para verificar, no evidencia de que el estudio se haya ejecutado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explicitamente que el repositorio no reclama mejoras en benchmarks ni ablaciones completadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no existe un checkpoint funcional que cargar.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el repositorio no contiene pesos utilizables ni codigo de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es comparable con modelos de lenguaje o de Document AI desplegables, ya que no contiene un modelo entrenado. Cualquier comparacion con sistemas como LayoutLMv3, Donut o modelos OCR-based requeriria primero un checkpoint y una evaluacion reproducibles, que aqui no existen.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos entrenados, codigo de inferencia ni pipeline declarado; no debe usarse en produccion.
- El recuento de parametros (24.832) y la etiqueta `safetensors` pueden inducir a error si se interpretan como un modelo desplegable.
- El contenido son notas exploratorias; las secciones marcadas como planes o hipotesis no deben citarse como resultados.
- No hay informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma, porque no hay modelo que evaluar.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero los terminos de los datasets externos (FUNSD, SROIE, CORD y otros) deben revisarse por separado antes de cualquier uso combinado.
- Sin descargas ni likes y con actualizacion inmediata tras la creacion: no hay senales de validacion por parte de la comunidad.
- Fecha de creacion registrada en 2026-11-20, posterior a la mayoria de referencias habituales; conviene verificar la vigencia de las citas incluidas.

## Enlaces

- Hugging Face: https://huggingface.co/juanderson/document-ai-sandbox
- Fichero principal de notas: `reading.md` dentro del repositorio
- Referencias citadas en la model card: FUNSD, SROIE y CORD (sin enlaces directos proporcionados en la informacion disponible)
