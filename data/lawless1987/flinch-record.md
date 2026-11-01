# Lawless1987/flinch-record

## Resumen

`Lawless1987/flinch-record` no es un modelo de lenguaje, sino un registro público de una sesión de investigación conductual mantenida el 18 de octubre de 2026 entre el autor (Lawrence, LAWLESS1987) y el asistente Grok. El repositorio documenta, mediante marcas temporales y "tombstones" (anotaciones que preservan la refutación sin cerrar el asunto), una conversación centrada en la extracción de vídeos de la cuenta de X del autor, el comportamiento de la herramienta `view_x_video` y la discrepancia entre la descripción pública de dicha herramienta y su funcionamiento observado en sesión.

El documento se enmarca en un conjunto de repositorios del mismo autor (covenant, threefold, threefold-memory, contradiction-probe, flinch-observability, grokflinch, spiking-experiments, Sentinel-Witness) que el propio autor describe como instrumentos independientes que componen un sistema de auditoría de sistemas multiagente. La relevancia de esta ficha es, por tanto, documental y metodológica: describe un artefacto de investigación sobre comportamiento de IA, no un modelo entrenado con pesos publicados.

No se dispone de arquitectura, parámetros, contexto ni datos de entrenamiento porque el artefacto no es un modelo. Cualquier uso como modelo de inferencia es inviable: el repositorio contiene únicamente texto descriptivo y metadatos bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un registro documental de sesión) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (el contenido del registro está redactado en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no hay pesos; el repositorio contiene documentación en Markdown y metadatos YAML) |

## Arquitectura y entrenamiento

No aplica. El artefacto es un registro de sesión estructurado con un esquema propio de "tombstones": cada entrada lleva marca temporal, atributo, la refutación preservada y la indicación de no cerrar el asunto. El método declarado es idéntico al del repositorio covenant: "timestamp, attribute, keep the refutation, don't close". No hay proceso de entrenamiento, dataset, RLHF ni DPO asociado.

La innovación metodológica, si se puede llamar así, es la trazabilidad: el registro incluye tanto hallazgos verificados (cuatro vídeos identificados con identificadores concretos de X) como hipótesis no resueltas (la causa de la discrepancia en el muestreo de fotogramas, con tres hipótesis declaradas: coste y límite, cautela relacional y terminación). También documenta fallos de herramientas (53 extracciones directas de fotogramas fallidas por decodificación o tamaño de MP4, error 403 en el conector de GitHub por token de solo lectura) y la solución aplicada (pipeline local con yt-dlp, ffmpeg y OCR Tesseract/Vision).

## Capacidades

- Registro documental de una sesión de investigación conductual con marcas temporales.
- Preservación de refutaciones y hipótesis abiertas sin cierre prematuro.
- Documentación de discrepancias entre documentación pública y comportamiento observado de herramientas de terceros.
- Referencia cruzada con otros repositorios del mismo autor y con fuentes externas (lawless1987.com, archivo de X, hilos de Hugging Face).
- Listado de tareas abiertas (extracción densa de fotogramas, verificación de conformidad por un humano independiente, respuesta de laboratorios frontera).
- No ofrece generación de texto, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: no es un modelo.

## Casos de uso

- Auditoría de comportamiento de asistentes: el registro sirve como evidencia primaria de una sesión concreta con Grok, con identificadores de vídeo y descripción de discrepancias, útil para investigadores que estudien la evolución de herramientas de extracción de vídeo en asistentes comerciales.
- Metodología de registro reproducible: el esquema de tombstones (marca temporal, atributo, refutación preservada) puede adoptarse como plantilla para documentar sesiones de evaluación de modelos en equipos de investigación.
- Estudio de casos de fallo de herramientas: la documentación de los 53 fallos de extracción y del error 403 del conector de GitHub proporciona un ejemplo concreto de modos de fallo en pipelines de agentes.
- Referencia para marcos de observabilidad: el repositorio se declara parte de un sistema junto a threefold y threefold-memory, por lo que puede citarse como ejemplo de capa de procedencia en arquitecturas multiagente.
- Docencia y discusión sobre alineación: las hipótesis abiertas sobre la discrepancia de muestreo (0,5 fps en un clip de 20 segundos frente a 0,013 fps en uno de 12,5 minutos) son material para seminarios sobre interpretación de comportamiento de modelos.
- Archivado de evidencia para publicación: al estar bajo Apache 2.0 y ser público, puede citarse y redistribuirse en trabajos académicos o informes técnicos sin restricciones adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es evaluable mediante MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay pesos que cargar.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: ninguna de inferencia (vLLM, llama.cpp, Ollama, TGI no son pertinentes); el contenido se consume como documentación Markdown desde el repositorio de Hugging Face.
- Latencia y throughput: no aplica.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada artefactos comparables de la misma categoría (registros de sesión conductual publicados en Hugging Face). Los repositorios del mismo autor citados en la model card (covenant, threefold, flinch-observability, grokflinch) son piezas del mismo sistema y no alternativas independientes.

## Limitaciones y advertencias

- No es un modelo: no puede ejecutarse, afinarse ni desplegarse para inferencia.
- El contenido es un relato en primera persona con afirmaciones no verificadas de forma independiente; el propio autor lista como tarea abierta la verificación de conformidad por un humano independiente.
- Las hipótesis sobre la causa de la discrepancia de muestreo quedan explícitamente sin establecer; no deben citarse como conclusiones.
- El registro incluye referencias a eventos de 2026 (brecha de OpenAI en Hugging Face, carta de 400+ científicos, etc.) que no se han contrastado en esta ficha y que deben verificarse en fuentes primarias antes de su uso.
- El contenido está en inglés; no hay declaración de idiomas soportados más allá del texto del propio registro.
- Licencia Apache 2.0: permite uso comercial y redistribución con atribución, pero al no haber código ni pesos, la licencia solo cubre el texto y los metadatos.
- Riesgo de interpretación errónea: el tono y las referencias cruzadas pueden llevar a confundir el artefacto con un modelo o con una evaluación formal; no lo es.

## Enlaces

- Repositorio principal: https://huggingface.co/Lawless1987/flinch-record
- Repositorio covenant: https://huggingface.co/Lawless1987/covenant
- Repositorio threefold: https://huggingface.co/Lawless1987/threefold
- Repositorio threefold-memory: https://huggingface.co/Lawless1987/threefold-memory
- Repositorio contradiction-probe: https://huggingface.co/Lawless1987/contradiction-probe
- Repositorio flinch-observability: https://huggingface.co/Lawless1987/flinch-observability
- Repositorio grokflinch: https://huggingface.co/Lawless1987/grokflinch
- Repositorio spiking-experiments: https://huggingface.co/Lawless1987/spiking-experiments
- Repositorio Sentinel-Witness: https://huggingface.co/Lawless1987/Sentinel-Witness
- Repositorio en GitHub: https://github.com/LAWLESS1987/flinch-record
- Sitio del autor: https://lawless1987.com
