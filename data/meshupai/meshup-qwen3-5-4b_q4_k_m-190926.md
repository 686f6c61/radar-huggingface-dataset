# MeshupAi/meshup-qwen3.5-4B_Q4_K_M-190926

## Resumen

meshup-qwen3.5-4B_Q4_K_M-190926 es un modelo derivado de Qwen3.5-4B publicado por el usuario MeshupAi en HuggingFace. Se distribuye ya cuantizado en formato GGUF con la variante Q4_K_M y se anuncia como modelo vision-language, es decir, con soporte multimodal de imagen ademas de texto. El proceso de ajuste fino y conversion a GGUF se realizo con Unsloth, segun indica la propia model card. El repositorio incluye dos ficheros: el peso cuantizado del modelo de lenguaje y un proyector multimodal en F16 (`Qwen3.5-4B.F16-mmproj.gguf`), que es el componente que habilita el tratamiento de imagenes.

El dato objetivo mas solido es el recuento de parametros de los pesos base: 4.326.350.848 parametros, aproximadamente 4,33 mil millones, con un tamano de repositorio de 6,9 GB. No se declara licencia, idiomas soportados, longitud de contexto ni pipeline de tarea. El repositorio registra cero descargas y cero "likes" en el momento de la consulta, por lo que no existe validacion comunitaria ni evidencia publica de calidad.

Su relevancia practica es acotada pero concreta: ofrece un punto de partida multimodal de ~4B ejecutable en hardware de consumo mediante llama.cpp, con instrucciones de uso explicitas (`llama-cli` y `llama-mtmd-cli` con `--jinja`). Ahora bien, al carecer de licencia declarada, benchmarks y documentacion de entrenamiento, debe tratarse como un artefacto experimental y no como una base lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen3.5; tipo exacto (transformer denso, MoE, hibrida) no disponible |
| Parametros totales | 4.326.350.848 (~4,33 B) |
| Parametros activos | No aplica segun la informacion disponible (sin indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (pesos del LM) y F16 (proyector multimodal) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (`Qwen3.5-4B.Q4_K_M.gguf`, `Qwen3.5-4B.F16-mmproj.gguf`); el recuento de parametros se obtuvo de safetensors |
| Tamano del repositorio | 6,9 GB |
| Modalidad | Texto e imagen (vision-language-model) |
| Fecha de creacion | 2026-09-19 (metadato del repositorio) |
| Ultima actualizacion | 2026-09-19 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de la etiqueta `qwen3_5`, que situa el modelo en la familia Qwen3.5, y la etiqueta `vision-language-model`, que confirma la existencia de un codificador o proyector para entrada de imagen. La presencia de un fichero `mmproj` en F16 es coherente con el esquema habitual de llama.cpp para modelos multimodales: un proyector que mapea las representaciones visuales al espacio de embeddings del modelo de lenguaje. No se detalla el numero de capas, la dimension oculta, el mecanismo de atencion ni si existe atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, la model card indica unicamente que el modelo fue ajustado ("finetuned") y convertido a GGUF con Unsloth, y que el proceso fue "2x mas rapido" gracias a esa herramienta. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste por instrucciones, ni el tipo de datos visuales empleados. Tampoco se documenta la plantilla de chat concreta, aunque el uso de `--jinja` en los ejemplos sugiere que la plantilla se aplica desde el propio fichero GGUF.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` y el pipeline declarado apuntan a un uso de dialogo multi-turno.
- Procesamiento de imagenes: el fichero `F16-mmproj.gguf` habilita entrada visual, invocable con `llama-mtmd-cli`.
- Ejecucion local: formato GGUF compatible con llama.cpp, lo que permite inferencia en CPU y GPU sin infraestructura en la nube.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede exponerse a traves de una API, aunque no se detalla el esquema ni el grado de compatibilidad.
- Razonamiento, codigo y matematicas: no confirmados en la informacion disponible.
- Tool calling o function calling: no confirmado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Modo de pensamiento explicito ("thinking mode"): no disponible.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Audio o video: no soportados segun la informacion disponible (solo proyector de imagen).

## Casos de uso

- Asistente conversacional en local: el modelo puede desplegarse con `llama-cli` en un equipo de sobremesa o portatil para mantener dialogos multi-turno sin enviar datos a terceros. El tamano de ~4,33 B en Q4_K_M lo hace viable incluso sin GPU dedicada, aunque la calidad real de las respuestas no esta validada por benchmarks.
- Analisis de capturas y diagramas: usando `llama-mtmd-cli` con el proyector F16, se le puede pedir que describa pantallazos de interfaz, esquemas tecnicos o diagramas de arquitectura, integrandolo en un flujo de documentacion interno.
- Extraccion de informacion de imagenes en procesos internos: por ejemplo, resumir tickets de soporte que llegan con una captura adjunta, generando un texto estructurado para el sistema de gestion. Requiere validacion previa porque no hay datos de precision publicados.
- Prototipado de agentes con API local: gracias a la etiqueta de compatibilidad con endpoints, puede levantarse como servicio local para probar orquestaciones de agentes antes de migrar a un modelo mayor, con coste cero de tokens.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en la maquina del usuario, encaja en escenarios donde no se permite enviar datos a servicios externos (sanidad, legal, banca), siempre que se resuelva antes la cuestion de la licencia.
- Pruebas de reproducibilidad de ajustes finos con Unsloth: sirve como referencia de como queda un fine-tune de Qwen3.5-4B tras el ajuste y la conversion a GGUF, util para comparar pipelines de cuantizacion propios.
- Evaluacion comparativa interna de cuantizaciones: al estar disponible solo en Q4_K_M, puede usarse como punto de partida para medir la perdida de calidad frente a una version F16 del mismo ajuste, si el autor la publica en el futuro.
- Asistente educativo offline: para entornos sin conectividad estable, el modelo puede ofrecer explicaciones de texto e interpretacion de figuras en un equipo de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, MMMU ni de ningun otro conjunto de evaluacion, y la busqueda web asociada no devolvio documentacion tecnica relevante del modelo.

## Requisitos de hardware

- VRAM estimada para el modelo de lenguaje en Q4_K_M: aproximadamente 2,5-2,9 GB para los pesos, calculado a partir de 4,33 B de parametros a ~4,5 bits por parametro. Es una estimacion propia, no un dato publicado.
- VRAM adicional para el proyector multimodal en F16: no disponible; requiere sumar su tamano al total cuando se usa la via multimodal. El repositorio completo ocupa 6,9 GB, cifra que incluye todos los ficheros publicados.
- Cache KV: depende de la longitud de contexto, que no esta declarada. Con contextos de 4.000 a 8.000 tokens, el consumo adicional suele situarse en unos pocos cientos de MB en este rango de tamano.
- Total orientativo en modo texto con contexto moderado: del orden de 3 a 4 GB, estimacion no confirmada por el autor.
- GPU de consumo compatibles: tarjetas con 6 GB o mas de VRAM, como RTX 3060, RTX 4060, RTX 2070 o superiores. En tarjetas de 4 GB el modelo puede no caber con contexto amplio.
- GPU profesionales: A100, H100 o L40S no son necesarias para este tamano; se usarian solo para servir muchas peticiones concurrentes.
- Apple Silicon: viable en equipos con 16 GB de memoria unificada o mas, usando builds de llama.cpp con Metal.
- CPU: la inferencia es posible en CPU gracias al formato GGUF, con latencias notablemente superiores a las de GPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`, `llama-server`), Ollama previa importacion, LM Studio, y cualquier frontend compatible con GGUF. vLLM y TGI no soportan de forma nativa este formato de pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparativas ni datos de terceros verificados. Se ofrece a continuacion una referencia estructural; los datos de los modelos alternativos proceden de su documentacion publica general y no han sido verificados en la busqueda web de esta ficha.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| meshup-qwen3.5-4B_Q4_K_M-190926 | 4,33 B (dato del repositorio) | No disponible | Si (imagen) | No disponible | GGUF |
| Qwen3-4B | ~4 B | 32k nativo, ampliable | No | Apache 2.0 | safetensors, GGUF |
| Gemma 3 4B | ~4 B | 128k | Si (imagen) | Licencia Gemma | safetensors, GGUF |
| Phi-3.5-mini | ~3,8 B | 128k | No | MIT | safetensors, GGUF |

La diferencia critica frente a las alternativas es la ausencia de licencia declarada y de resultados publicados, lo que impide una comparacion de rendimiento rigurosa y complica su adopcion comercial.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no puede asumirse permiso de uso comercial. Ademas, al ser un ajuste de Qwen3.5, las condiciones del modelo base podrian heredarse, y no se aclara cual es la situacion.
- Cero validacion externa: el repositorio registra 0 descargas y 0 "likes", sin incidencias ni evaluaciones de terceros que respalden su calidad.
- Ausencia total de benchmarks: no hay evidencia publicada de rendimiento en razonamiento, codigo, matematicas o comprension de imagenes.
- Riesgo de alucinacion: inherente a los modelos de ~4B y agravado por la falta de evaluacion y por la cuantizacion Q4_K_M, que introduce perdida de precision frente a F16.
- Longitud de contexto desconocida: no puede planificarse un caso de uso con documentos largos sin medir antes el limite real del modelo.
- Idiomas no declarados: el comportamiento en castellano es una incognita; no hay garantia de calidad fuera del ingles o del chino.
- Detalles de entrenamiento opacos: se desconoce el dataset, si hubo ajuste por instrucciones, RLHF o DPO, y como se alineo el componente de vision.
- Fecha de creacion inusual: el metadato indica 2026-09-19, posterior a la fecha de referencia habitual, lo que puede indicar un error de metadatos o un repositorio de pruebas.
- Repositorio de autor unico y sin mantenimiento declarado: no hay compromiso de actualizaciones, correcciones ni soporte.
- Herramientas no confirmadas: no hay evidencia de soporte de function calling ni de razonamiento multi-paso.
- Requisito de `--jinja`: el uso correcto de la plantilla de chat depende de pasar ese flag; omitirlo puede degradar la calidad de las respuestas.
- Recomendacion para produccion: no desplegar en entornos criticos sin una evaluacion propia previa, sin aclarar la licencia y sin comparar contra una version F16 o contra el modelo base sin ajustar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MeshupAi/meshup-qwen3.5-4B_Q4_K_M-190926
- Unsloth (herramienta usada para el ajuste y la conversion a GGUF): https://github.com/unslothai/unsloth
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados obtenidos tratan sobre entornos de programacion en Python y no guardan relacion con esta ficha.
