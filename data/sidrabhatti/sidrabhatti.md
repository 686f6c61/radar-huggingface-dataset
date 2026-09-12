# SidraBhatti/SidraBhatti

## Resumen

El repositorio `SidraBhatti/SidraBhatti` no contiene un modelo de aprendizaje automatico. Se trata de un repositorio de perfil de Hugging Face cuyo README es la pagina personal de presentacion de Sidra Ghayour Bhatti, investigadora en control basado en aprendizaje para trenes de potencia de automocion y sistemas de movilidad autonoma. No incluye pesos, tokenizador, configuracion de arquitectura, model card tecnica ni artefactos de inferencia de ningun tipo.

La model card describe la actividad investigadora de la autora: control basado en aprendizaje para sistemas de automocion, reconocimiento de formas de onda de radar mediante IA para percepcion autonoma, y aprendizaje automatico interdisciplinar aplicado al descubrimiento de farmacos (colaboracion en un objetivo terapeutico de Caspase-4 y desarrollo de la herramienta PocketSage para evaluacion de druggability). El enfoque declarado combina fundamento teorico con validacion empirica, con interes explicito en sistemas ciberfisicos seguros y en explicabilidad e interpretabilidad de la IA.

Por tanto, este repositorio no es evaluable como modelo: no hay parametros, contexto, licencia ni idiomas que reportar. La relevancia de la ficha es documental, para evitar que un consumidor del blog interprete el repositorio como un modelo desplegable. Los unicos datos verificables son metadatos del propio repo (etiqueta `region:us`, 0 descargas, 0 likes, creado el 2026-09-12 y actualizado el 2026-09-12) y los enlaces academicos y profesionales de la autora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay safetensors, GGUF ni otros artefactos) |
| Tipo de repositorio | repositorio de perfil de usuario (README personal) |
| Etiquetas declaradas | `region:us` |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-12T16:58:40.000Z |
| Fecha de actualizacion | 2026-09-12T17:11:28.000Z |

## Arquitectura y entrenamiento

No hay informacion de arquitectura ni de entrenamiento. El repositorio no publica ficheros de configuracion (`config.json`), pesos, scripts de entrenamiento, datasets ni documentacion de proceso (numero de tokens, composicion del corpus, tecnicas de alineacion como RLHF o DPO, o innovaciones de atencion o decodificacion). Cualquier afirmacion sobre arquitectura transformer, MoE, SSM o hibrida aplicada a este repositorio seria una invencion.

El unico contenido tecnico indirecto proviene de la actividad investigadora de la autora citada en el README y en los resultados de busqueda: control basado en aprendizaje para trenes de potencia, reconocimiento de modulacion intrapulso en formas de onda de radar con modelos basados en transformer, y aplicaciones de ML al descubrimiento de farmacos. Se trata de lineas de investigacion descritas por la autora, no de especificaciones de un modelo publicado en este repositorio.

## Capacidades

- No disponible. El repositorio no expone ningun modelo con capacidades de generacion de texto, razonamiento, codigo, matematicas o vision.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingues documentadas.
- No hay capacidades especiales (modo de razonamiento explicito, vision, audio) documentadas.

## Casos de uso

- No aplicable como modelo. El repositorio no es desplegable ni invocable mediante API de inferencia.
- Consulta de perfil investigador: usar el README como fuente de contexto sobre las lineas de trabajo de Sidra Ghayour Bhatti (control basado en aprendizaje para automocion, radar, ML para descubrimiento de farmacos) y como punto de contacto profesional.
- Localizacion de colaboraciones academicas: los enlaces a Google Scholar, ORCID, LinkedIn y GitHub permiten verificar publicaciones y repositorios asociados a la investigadora.
- Seguimiento de docencia: la pagina del curso Learning-Based Controls 2025 (Ohio State University, Center for Automotive Research) esta enlazada desde el material de busqueda y puede usarse como referencia docente.
- Auditoria de repositorios de Hugging Face: este caso sirve como ejemplo de repositorio que no debe tratarse como modelo en pipelines automatizados de catalogacion, ya que carece de pesos y de model card tecnica.
- Descubrimiento de herramientas de investigacion: el README menciona PocketSage, herramienta de evaluacion de druggability, como posible punto de partida para busquedas relacionadas.
- Cualquier otro caso de uso de inferencia (atencion al cliente, generacion de codigo, RAG, analisis de documentos) queda descartado por ausencia total de artefactos de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No existen pesos ni configuracion que permitan estimar requisitos.
- GPU recomendadas: no disponible. No hay modelo que ejecutar en A100, H100, RTX 4090 ni en ninguna otra GPU.
- Compatibilidad con GPU de consumo: no aplicable, al no existir artefactos de inferencia.
- Opciones de despliegue: no disponible. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni servidores compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No existe una categoria de modelos comparable porque el repositorio no contiene un modelo. Tampoco procede comparar con alternativas del mismo tamano o de la misma tarea, ya que no hay parametros, contexto, licencia ni rendimiento que confrontar.

## Limitaciones y advertencias

- El repositorio no es un modelo: no contiene pesos, tokenizador, configuracion ni pipeline de inferencia. No debe integrarse en ningun sistema que espere un modelo de Hugging Face.
- Ausencia de licencia: al no declararse licencia, no hay permisos explicitos de uso comercial, redistribucion ni modificacion de contenido. Cualquier reutilizacion del texto del README queda sujeta a la normativa general de derechos de autor.
- Ausencia de idiomas declarados y de pipeline: los campos `language` y `pipeline_tag` no estan definidos, lo que impide cualquier clasificacion automatica fiable.
- Metadatos anomalos: las fechas de creacion y actualizacion (2026-09-12) son posteriores a la fecha habitual de consulta; conviene verificar la integridad de los metadatos antes de citarlos.
- Contenido no verificado: la model card es una autodescripcion profesional. Las afirmaciones sobre lineas de investigacion, colaboraciones y herramientas no han sido validadas de forma independiente en la informacion disponible.
- Riesgo de confusion en catalogos: un repositorio de perfil con nombre de usuario puede aparecer en busquedas como si fuese un modelo, generando falsos positivos en inventarios y comparativas.
- Sin resultados empiricos: no hay benchmarks, evaluaciones ni metricas de ningun tipo, por lo que no es posible hacer afirmaciones de rendimiento.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/SidraBhatti/SidraBhatti
- Sitio web personal: https://u.osu.edu/sidrabhatti/
- Google Scholar: https://scholar.google.com/citations?hl=en&user=5EFVBRMAAAAJ&view_op=list_works&sortby=pubdate
- ORCID: https://orcid.org/my-orcid?orcid=0000-0003-4094-5984
- GitHub: https://github.com/SidraBhatti90/SidraBhatti90
- LinkedIn: https://www.linkedin.com/in/sidra-bhatti-10045b248/
- Pagina del curso Learning-Based Controls 2025 (Ohio State University): https://sidrabhatti90.github.io/Learning-Based-Controls-2025/
- Publicacion citada en los resultados de busqueda: "Transformer-based models for intrapulse modulation recognition of radar waveforms", S. G. Bhatti, I. A. Taj, M. Ullah, A. I. Bhatti, Engineering Applications of Artificial Intelligence (referencia recuperada via Google Scholar)
