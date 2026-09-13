# OliviaRossi/DoubleTrouble-Q4_K_M-GGUF

## Resumen

DoubleTrouble-Q4_K_M-GGUF es la cuantizacion en formato GGUF del modelo OliviaRossi/DoubleTrouble, un modelo de generacion de texto de aproximadamente 26,9 mil millones de parametros segun los pesos en safetensors publicados en el repositorio original. El modelo ha sido desarrollado por el usuario OliviaRossi y convertido a GGUF mediante el espacio GGUF-my-repo de ggml.ai, que emplea llama.cpp para la conversion. Su relevancia practica reside en que permite ejecutar un modelo de casi 27.000 millones de parametros en hardware de consumo con 24 GB de VRAM, algo imposible con los pesos originales en precision completa.

La model card del repositorio es minima: se limita a documentar el proceso de conversion y los comandos de uso con llama.cpp, y remite a la model card original para cualquier detalle adicional. Las etiquetas declaradas por el autor (merge, normalized-geodesic-consensus, abliterated, uncensored, multimodal, vision, gated-deltanet, reasoning, agent) sugieren que se trata de una fusion de modelos de la familia Qwen con ajustes de razonamiento, capacidades multimodales y un proceso de "abliteration" orientado a eliminar rechazos de contenido. Ninguna de estas caracteristicas esta verificada en la documentacion disponible.

El modelo declara soporte para ingles y chino, licencia Apache-2.0 y compatibilidad con llama.cpp y vLLM. El repositorio tiene un tamano de 16,5 GB y, en el momento de la consulta, cero descargas y un "like", lo que indica que es un artefacto muy reciente y practicamente sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (las etiquetas del autor apuntan a una fusion de modelos Qwen con posible componente gated-deltanet) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 mil millones) |
| Parametros activos | no disponible (no se ha confirmado que sea una arquitectura MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, valor de ejemplo y no el maximo soportado) |
| Tipos de cuantizacion | Q4_K_M en GGUF (unico fichero publicado); no se listan otras cuantizaciones |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`doubletrouble-q4_k_m.gguf`); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 16,5 GB |
| Tarea declarada | text-generation |
| Libreria declarada | transformers (conversion a GGUF para llama.cpp) |
| Modelo base | OliviaRossi/DoubleTrouble |

## Arquitectura y entrenamiento

No se dispone de informacion verificada sobre la arquitectura, el proceso de entrenamiento ni la composicion del dataset. La model card del repositorio GGUF no incluye ninguna seccion tecnica: unicamente indica que el modelo fue convertido desde OliviaRossi/DoubleTrouble con llama.cpp a traves del espacio GGUF-my-repo y que se consulte la model card original para mas detalles. Esa model card original no forma parte de la informacion proporcionada.

Las etiquetas del repositorio son la unica fuente de indicios sobre el diseno del modelo. La presencia de `merge` y `normalized-geodesic-consensus` sugiere que el modelo se obtuvo mediante una fusion de pesos de otros modelos, empleando alguna variante de interpolacion sobre una variedad geodesica normalizada. Las etiquetas `qwen`, `qwen3.5` y `qwen3.8` apuntan a que los modelos de origen pertenecen a la familia Qwen, aunque las dos ultimas no corresponden a ninguna version conocida y publicada de esa familia. La etiqueta `gated-deltanet` apunta a la posible inclusion de capas de atencion lineal del tipo DeltaNet con compuertas, lo que implicaria una arquitectura hibrida. Las etiquetas `abliterated` y `uncensored` indican que se aplico algun procedimiento de ablacion de direcciones de rechazo en el espacio de activaciones, sin que se detalle la metodologia.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones de decodificacion. Todo ello debe considerarse no disponible.

## Capacidades

- Generacion de texto en ingles y chino, segun los idiomas declarados en el repositorio.
- Razonamiento: la etiqueta `reasoning` indica que el autor reclama capacidades de razonamiento explicito, presumiblemente con cadenas de pensamiento, aunque no se documenta el formato.
- Modo agente: la etiqueta `agent` sugiere soporte para flujos de multiples pasos, sin que se especifique el protocolo de tool calling ni el formato de plantilla.
- Capacidades multimodales y de vision: las etiquetas `multimodal` y `vision` indican que el modelo base podria aceptar entradas de imagen. Esta capacidad no esta confirmada en la documentacion y no se describe ningun procesador de vision en el repositorio GGUF.
- Ejecucion local: el repositorio esta preparado para su uso con llama.cpp mediante `llama-cli` y `llama-server`, con integracion HTTP a traves de la API compatible de llama-server.
- Despliegue en servidor: la etiqueta `vllm` sugiere compatibilidad con vLLM, si bien el soporte de GGUF en vLLM es limitado y debe validarse en la practica.
- Ausencia de filtros de contenido: las etiquetas `abliterated` y `uncensored` indican que el modelo ha sido modificado para reducir sus rechazos ante peticiones sensibles.

## Casos de uso

- Inferencia local en estacion de trabajo con GPU de consumo: con 16,5 GB de pesos en Q4_K_M, el modelo se puede cargar integramente en una GPU de 24 GB de VRAM (RTX 3090, RTX 4090, RTX 5090) usando `llama-server`, lo que permite disponer de un modelo de casi 27.000 millones de parametros sin conexion a servicios externos.
- Asistencia conversacional en ingles y chino: el modelo puede gestionar dialogos multi-turno en los dos idiomas declarados; la ventana de contexto real debe determinarse empiricamente porque la model card no la especifica.
- Generacion de codigo en local: util para equipos que no pueden enviar codigo propietario a APIs externas, ejecutando el modelo mediante llama.cpp o a traves de un servidor compatible con la API de OpenAI para integrarlo en un IDE.
- Automatizacion de agentes: la etiqueta `agent` permite plantear su uso como planificador en pipelines de varios pasos, conectado a herramientas mediante el endpoint HTTP de llama-server; conviene validar la fiabilidad del formato de llamadas a herramientas antes de llevarlo a produccion.
- Despliegues en entornos aislados (air-gapped): al ser un fichero GGUF unico y con licencia Apache-2.0, se puede distribuir en redes sin salida a internet y ejecutar en CPU o GPU sin dependencias de servicios en la nube.
- Investigacion en seguridad de modelos: por su naturaleza `abliterated` y `uncensored`, resulta util como objeto de estudio para evaluar la eficacia de las tecnicas de ablacion, medir la degradacion de capacidades asociada y realizar ejercicios de red teaming controlados.
- Procesamiento de documentos con entrada visual: si se confirma la capacidad multimodal declarada en las etiquetas, podria emplearse para extraccion de informacion de imagenes y documentos escaneados; esta capacidad no esta documentada y requiere verificacion previa.
- Prototipado rapido de aplicaciones de texto: el uso de Ollama o LM Studio con el fichero GGUF permite poner en marcha un prototipo funcional en minutos, sin necesidad de infraestructura de GPU dedicada en la fase inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye ninguna medicion de MMLU, HumanEval, GSM8K, MT-Bench ni de cualquier otra evaluacion estandar, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo. Tampoco se dispone de datos de latencia, throughput ni consumo de memoria medidos por terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa aproximadamente 16,5 GB. Para cargar todos los pesos en GPU hay que reservar entre 17 GB y 20 GB de VRAM, segun la longitud de contexto configurada y el tamano del cache KV.
- GPU recomendadas: cualquier GPU con 24 GB o mas permite el offload completo, incluyendo RTX 3090, RTX 4090, RTX 5090, A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB.
- GPU de consumo: si cabe en GPUs de 24 GB con offload completo. En GPUs de 12 GB o 16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB) es posible ejecutarlo con offload parcial de capas a CPU, a costa de una reduccion notable de la velocidad de generacion.
- Memoria unificada: en equipos Apple Silicon con 32 GB o mas de memoria unificada el modelo se puede ejecutar integramente mediante llama.cpp con backend Metal.
- CPU exclusivamente: es viable cargando el GGUF en RAM del sistema (se recomiendan al menos 24 GB de RAM libre), pero el throughput sera bajo y poco adecuado para uso interactivo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), servidores compatibles con la API de OpenAI sobre llama-server, Ollama importando el GGUF, LM Studio, text-generation-webui y, con soporte limitado y experimental para GGUF, vLLM.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo para este modelo en ninguna configuracion de hardware.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, contexto o benchmarks del modelo evaluado, por lo que la comparacion se limita a atributos estructurales. Los modelos alternativos que se citan a continuacion son referencias publicas de la misma clase de tamano y no implican una equivalencia funcional con DoubleTrouble.

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Notas |
|---|---|---|---|---|---|
| OliviaRossi/DoubleTrouble-Q4_K_M | 26,9 B | no disponible | Apache-2.0 | Si (Q4_K_M) | Sin benchmarks publicados; fusion con etiquetas de abliteration y vision no verificadas |
| Qwen2.5-32B-Instruct | 32,5 B | 128 K | Apache-2.0 (variantes) | Si | Referencia de la misma familia declarada por las etiquetas del autor |
| Gemma 3 27B | 27 B | 128 K | Licencia Gemma | Si | Tamano comparable, con capacidad multimodal documentada |
| Mistral Small 3.1 24B | 24 B | 128 K | Apache-2.0 | Si | Alternativa densa con soporte declarado de function calling |

Las cifras de los modelos alternativos corresponden a su documentacion publica. No es posible comparar rendimiento porque DoubleTrouble no publica ninguna evaluacion.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna medicion publicada que permita estimar la calidad del modelo en tareas de razonamiento, codigo o matematicas. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- Contexto desconocido: la model card no declara la longitud de contexto soportada. El valor `-c 2048` que aparece en los ejemplos es un parametro de ejemplo de llama-server y no debe interpretarse como el maximo del modelo.
- Cuantizacion Q4_K_M: la perdida de precision respecto a los pesos originales en safetensors puede degradar tareas sensibles a la precision, como matematicas de varios pasos o generacion de codigo con dependencias largas.
- Soporte linguistico limitado: solo se declaran ingles y chino. El rendimiento en castellano no esta documentado y probablemente sea inferior.
- Modelo "abliterated" y "uncensored": la eliminacion de mecanismos de rechazo implica un riesgo elevado de generar contenido danino, ilegal o inexacto ante peticiones maliciosas. No es adecuado para aplicaciones orientadas al publico sin una capa de moderacion externa.
- Riesgo de alucinacion: sin datos de evaluacion ni de alineamiento documentado (RLHF, DPO), no hay evidencia sobre la tasa de alucinacion ni sobre la calibracion de la confianza del modelo.
- Capacidades multimodales sin confirmar: aunque las etiquetas incluyen `multimodal` y `vision`, el repositorio GGUF no documenta ningun proyector de vision ni procesador de imagenes. No debe asumirse que la entrada de imagenes funcione.
- Trazabilidad limitada de la fusion: el metodo `normalized-geodesic-consensus` y los modelos de origen no estan documentados. No es posible auditar que pesos se combinaron ni con que proporciones.
- Licencia: se declara Apache-2.0, lo que en principio permite uso comercial. No obstante, si los modelos fusionados de origen tuvieran condiciones distintas (por ejemplo, la licencia Gemma o la licencia Qwen con clausulas adicionales), la licencia declarada en este repositorio derivado podria no ser suficiente. Conviene verificar la procedencia antes de un uso comercial.
- Madurez: cero descargas y un unico "like" en el momento de la consulta. Es un artefacto sin validacion por parte de la comunidad, sin mantenimiento demostrado y con un riesgo alto de contener fallos no detectados.
- Fechas del repositorio: los metadatos indican fechas de creacion y actualizacion de septiembre de 2026, posteriores a la fecha habitual de referencia, lo que conviene tener en cuenta al evaluar la coherencia de los metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OliviaRossi/DoubleTrouble-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/DoubleTrouble
- Espacio de conversion GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage

La busqueda web realizada no ha devuelto ningun enlace relevante sobre el modelo: los resultados obtenidos corresponden a paginas de ayuda de YouTube y a discusiones sin relacion con DoubleTrouble. No se han encontrado papers, blogs tecnicos, repositorios adicionales ni demos asociados al modelo.
