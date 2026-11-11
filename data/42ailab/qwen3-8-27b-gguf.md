# 42ailab/Qwen3.8-27B-GGUF

## Resumen
Qwen3.8-27B es un modelo de lenguaje de 27.320.697.856 parametros desarrollado por el equipo Qwen de Alibaba, distribuido bajo licencia Apache-2.0. La ficha que nos ocupa, `42ailab/Qwen3.8-27B-GGUF`, no es un modelo nuevo ni una conversion propia: se trata de una copia byte a byte de dos ficheros GGUF generados por unsloth y publicados originalmente en `unsloth/Qwen3.8-27B-GGUF`. El repositorio actua como respaldo para garantizar la disponibilidad de los mismos bytes si el repositorio original se renombra, se elimina o se sobrescribe.

El modelo esta orientado a tareas de codigo y de agentes, e incorpora vision integrada, lo que se refleja en el tag `image-text-to-text` y en la presencia de un proyector visual separado (`mmproj-F16.gguf`). El repositorio incluye unicamente la cuantizacion UD-Q4_K_M (15,33 GiB) junto con el proyector de vision en F16 (884,6 MiB), lo que permite desplegar el modelo en equipos con recursos moderados mediante llama.cpp u otros runners compatibles con GGUF.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de la generacion Qwen3.8 con capacidades multimodales y de agente; por otro, ilustra una practica de preservacion de artefactos (backup verificado por sha256) frente a la volatilidad de los repositorios de conversiones de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer de la familia Qwen3.8; la model card no detalla la arquitectura interna) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q4_K_M (unica cuantizacion incluida en este repositorio); proyector visual en F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.8-27B-UD-Q4_K_M.gguf` + `mmproj-F16.gguf`) |

## Arquitectura y entrenamiento
La informacion proporcionada no detalla la arquitectura interna del modelo base Qwen3.8-27B: la model card del repositorio de respaldo se limita a describirlo como un modelo de 27B de la nueva generacion Qwen, fuerte en codigo y tareas de agente, con vision integrada. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras).

Lo que si se documenta con precision es el proceso de conversion a GGUF: los ficheros fueron generados por unsloth y este repositorio los reproduce sin modificacion alguna. Se incluyen dos artefactos: los pesos cuantizados en UD-Q4_K_M (15,33 GiB, sha256 `322e194ff79741c7baa497c240f677f54b201b0efab44ca8e50f122b39123482`) y el proyector de vision en F16 (884,6 MiB, sha256 `cbb841a9ee0636b2ec172f5bb8df2ea8dfeb01e90fe7c6126581d662a0b4e43e`). La presencia de este segundo fichero confirma que la modalidad de imagen se gestiona mediante un adaptador separado del cuerpo del modelo, un patron habitual en llama.cpp.

## Capacidades
- Generacion de texto conversacional (pipeline `text-generation`).
- Razonamiento y resolucion de tareas de codigo, segun la descripcion del autor ("strong at coding and agent tasks").
- Capacidades de agente: el modelo esta posicionado para tareas de agente, aunque la model card no detalla el soporte concreto de tool calling ni de razonamiento multi-paso.
- Vision integrada: entrada image-text-to-text, con proyector visual F16 incluido en el repositorio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso
- Asistencia a la programacion en local: con la cuantizacion UD-Q4_K_M (15,33 GiB) el modelo puede ejecutarse en un equipo de sobremesa con GPU de 24 GB o con CPU y RAM suficiente, ofreciendo generacion y explicacion de codigo sin enviar el codigo a servicios externos.
- Agentes de automatizacion de tareas de desarrollo: el posicionamiento del modelo en tareas de agente permite integrarlo en flujos que encadenan pasos (leer un repositorio, proponer un parche, ejecutar pruebas) siempre que el runtime soporte el protocolo de herramientas correspondiente.
- Analisis de capturas y diagramas: gracias al proyector de vision, puede procesar imagenes junto con texto, por ejemplo para interpretar diagramas de arquitectura o capturas de errores y proponer correcciones.
- Despliegue en entornos con requisitos de soberania del dato: al ser Apache-2.0 y ejecutable en local via GGUF, encaja en organizaciones que no pueden usar APIs en la nube.
- Preservacion de artefactos en pipelines de ML: el repositorio sirve como fuente estable de bytes verificables por sha256 para builds reproducibles que dependan de esta cuantizacion concreta.
- Prototipado rapido con 42model: el modelo se puede descargar desde la libreria de la aplicacion de escritorio o con `42model download qwen3.8:27b-ud-q4_k_m`, lo que facilita pruebas de concepto sin configurar un stack de inferencia desde cero.
- Evaluacion comparativa de cuantizaciones: util como referencia fija (Q4_K_M) al medir degradacion de calidad frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: los pesos UD-Q4_K_M ocupan 15,33 GiB; el proyector de vision anade 884,6 MiB. En la practica se necesita margen adicional para el contexto KV, por lo que una GPU de 24 GB es el objetivo comodo para carga completa con vision.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para despliegues con concurrencia; en GPUs de 16 GB puede requerirse descarga parcial de capas a CPU.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) con la cuantizacion incluida; en 16 GB solo con offloading parcial.
- Opciones de despliegue: llama.cpp y runtimes compatibles con GGUF; el repositorio esta etiquetado como `endpoints_compatible`. Tambien puede cargarse desde la aplicacion 42model.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (esta ficha, GGUF de 42ailab) | 27.320.697.856 | no disponible | Apache-2.0 | GGUF (UD-Q4_K_M + mmproj F16) | Respaldo byte a byte de la conversion de unsloth; vision integrada |
| Qwen3.8-27B (original de Qwen, en ModelScope) | 27.320.697.856 | no disponible | Apache-2.0 | no disponible en la informacion | Repositorio oficial del modelo base |
| unsloth/Qwen3.8-27B-GGUF | 27.320.697.856 | no disponible | Apache-2.0 | GGUF (varias cuantizaciones) | Conversion original; el repositorio de esta ficha solo replica 2 ficheros |

No se dispone de datos de benchmarks ni de especificaciones de contexto que permitan una comparacion cuantitativa con modelos de otras familias.

## Limitaciones y advertencias
- Este repositorio no es un modelo nuevo ni una conversion propia: es una copia de dos ficheros de unsloth. Cualquier actualizacion del modelo base no se reflejara aqui salvo que el mantenedor la replique.
- Solo se incluye una cuantizacion (UD-Q4_K_M); no hay versiones Q2, Q3, Q5, Q6, Q8 ni F16 en este repositorio.
- La model card no documenta sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma; deben asumirse los riesgos habituales de un LLM de 27B sin evaluacion publicada en esta ficha.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones o documentos largos sin verificacion previa.
- La licencia Apache-2.0 permite uso comercial, pero la atribucion de la conversion corresponde a unsloth y la del modelo base al equipo Qwen; conviene conservar los avisos de licencia.
- El tag `endpoints_compatible` sugiere compatibilidad con APIs de inferencia, pero no se detalla que endpoints ni que version de protocolo.
- La fecha de creacion del repositorio (2026-11-07) y el reducido numero de descargas (130) indican un artefacto reciente y poco validado por la comunidad.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/42ailab/Qwen3.8-27B-GGUF
- Repositorio ModelScope del respaldo: https://modelscope.cn/models/42ailab/Qwen3.8-27B-GGUF
- Conversion original de unsloth (ModelScope): https://www.modelscope.cn/models/unsloth/Qwen3.8-27B-GGUF
- Sitio del mantenedor: https://42ailab.com
- Aplicacion de escritorio 42model: https://42model.com
