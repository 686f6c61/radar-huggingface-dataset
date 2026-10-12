# firzahdzm/tourn-f4920bf7-instructtext-super-v12b

## Resumen

El modelo `firzahdzm/tourn-f4920bf7-instructtext-super-v12b` es un modelo de lenguaje de tipo instructivo publicado en HuggingFace por el usuario firzahdzm dentro de su familia de modelos experimentales "tourn". Segun los metadatos del repositorio, cuenta con 162.417.408 parametros totales (aproximadamente 162 millones) verificados a partir de los pesos en formato safetensors, lo que lo situa en la gama de modelos pequenos, muy por debajo de los modelos frontera actuales. El repositorio ocupa 0,3 GB, coherente con un modelo de ese tamano almacenado en precision de 16 bits.

La etiqueta de arquitectura asociada al repositorio es `llama`, lo que sugiere que se trata de una implementacion basada en la arquitectura transformer decoder-only de la familia Llama, aunque no se dispone de documentacion tecnica oficial que lo confirme. No se ha publicado ninguna model card, ni detalles sobre el proceso de entrenamiento, la composicion del dataset, la longitud de contexto o los idiomas soportados.

Se trata de un modelo con muy poca traccion publica: solo 12 descargas y 0 likes en el momento de redactar esta ficha, y ningun otro modelo de la familia dispone de model card. Por tanto, esta ficha debe interpretarse como una descripcion de los datos objetivos disponibles en el repositorio, con amplias lagunas que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (segun etiqueta del repositorio); transformer decoder-only (no confirmado por documentacion) |
| Parametros totales | 162.417.408 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La unica informacion estructural disponible es la etiqueta `llama` asociada al repositorio, que apunta a una arquitectura transformer de tipo decoder-only con atencion causal, similar a la utilizada en las familias Llama, aunque con un numero de parametros muy reducido (162 millones frente a los miles de millones de las versiones estandar). No hay informacion publica sobre el numero de capas, dimensiones del modelo, numero de cabezas de atencion, uso de GQA, RMSNorm, RoPE ni ningun otro detalle de diseno.

Tampoco se dispone de datos sobre el proceso de entrenamiento: no se especifica el numero de tokens vistos, la composicion del corpus, si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO, ni si existe un modo de razonamiento explicito. El sufijo `instructtext-super` del nombre sugiere un ajuste orientado a instrucciones, pero se trata de una inferencia a partir del nombre y no de un dato confirmado. No se ha documentado ninguna innovacion tecnica como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

## Capacidades

- Generacion de texto instructivo: el nombre del modelo indica que esta orientado a seguir instrucciones en formato de texto, aunque no hay evaluaciones publicadas que lo confirmen.
- Conversacion multi-turno: presumiblemente soportada por la naturaleza instructiva, pero no documentada.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas en la ficha del repositorio.
- Vision, audio u otras modalidades: no disponible; el repositorio solo contiene pesos de lenguaje.
- Modo de razonamiento (thinking mode): no disponible.

## Casos de uso

Dado que no existe documentacion tecnica ni evaluaciones publicadas, los siguientes casos de uso son orientativos y se basan unicamente en el tamano del modelo y su etiqueta de modelo instructivo:

- Experimentacion y prototipado local: con 162 millones de parametros, el modelo puede ejecutarse en cualquier portatil sin GPU dedicada, lo que lo hace util para probar pipelines de inferencia, plantillas de chat o integraciones con librerias como llama.cpp sin coste de infraestructura.
- Pruebas de integracion en pipelines de ML: sirve como modelo de sustitucion (stub) en fases de desarrollo de aplicaciones que despues desplegaran un modelo mayor, gracias a su bajo consumo de recursos.
- Clasificacion ligera de texto o generacion de respuestas cortas: si su ajuste instructivo es correcto, podria usarse para tareas de baja complejidad como etiquetado, resumen de frases cortas o reformulacion, aunque sin garantias de calidad.
- Educacion y aprendizaje: util como ejemplo practico para estudiar el funcionamiento interno de un transformer pequeno, inspeccionar pesos safetensors o comparar arquitecturas.
- Investigacion sobre eficiencia: permite experimentar con tecnicas de cuantizacion, destilacion o poda sobre un modelo manejable en memoria (menos de 1 GB en fp16).
- Despliegue en dispositivos con recursos muy limitados: dado su tamano, podria ejecutarse en entornos edge como Raspberry Pi o moviles, aunque no se han publicado benchmarks que validen su calidad en estos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 162,4 millones de parametros, no verificada empiricamente):
  - fp16/bf16: aproximadamente 0,33 GB de pesos.
  - int8: aproximadamente 0,17 GB de pesos.
  - int4: aproximadamente 0,09 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe incluso en GPUs integradas o en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo actual (RTX 3060, RTX 4090, GTX 1650, etc.) e incluso en CPU sin aceleracion.
- Opciones de despliegue: al estar en formato safetensors y con etiqueta llama, es compatible con llama.cpp (previa conversion a GGUF), Ollama, vLLM, TGI y transformers de HuggingFace; no se han publicado pesos GGUF listos para usar.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de benchmarks ni de documentacion de este modelo que permitan comparaciones de rendimiento. Se listan a continuacion otros modelos del mismo autor y familia "tourn", con los datos publicos de sus repositorios:

| Modelo | Parametros | Arquitectura (etiqueta) | Formato | Licencia | Descargas |
|---|---|---|---|---|---|
| firzahdzm/tourn-f4920bf7-instructtext-super-v12b | 162.417.408 | llama | safetensors | no disponible | 12 |
| firzahdzm/tourn-45f9a179-instructtext-super-v4 | 3B | lfm2 | safetensors (BF16) | no disponible | no disponible |
| firzahdzm/tourn-803a8f69-instructtext-super-k3f2 | 2B | falcon_h1 | safetensors (BF16) | no disponible | 14 |
| firzahdzm/tourn-87c51c39-instructtext-super-s2kpre | 494M | no disponible | no disponible | no disponible | no disponible |

Ninguno de los modelos comparables publica model card ni resultados de evaluacion, por lo que no es posible establecer una comparacion de rendimiento fiable.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card, ni descripcion, ni paper, ni detalles de entrenamiento o evaluacion.
- Sesgos conocidos: no disponible; al no documentarse el dataset, no puede evaluarse el sesgo.
- Riesgo de alucinacion: elevado y no medido; con 162 millones de parametros, la capacidad de retener conocimiento factual es muy limitada en comparacion con modelos mayores, por lo que la generacion de datos incorrectos con aparente seguridad es esperable.
- Limitaciones de contexto e idioma: no se ha declarado la longitud de contexto ni los idiomas soportados; probablemente el soporte multilingue sea muy reducido, aunque no puede confirmarse.
- Restricciones de licencia: la licencia no esta indicada en el repositorio, lo que impide determinar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Caveat para produccion: con 12 descargas y 0 likes, el modelo no tiene validacion comunitaria; no deberia desplegarse en entornos productivos sin una evaluacion propia exhaustiva.
- Fecha de creacion futura (2026-10-12): los metadatos del repositorio indican una fecha de creacion posterior a la actual, lo que puede deberse a un error o a un ajuste manual; conviene verificarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/firzahdzm/tourn-f4920bf7-instructtext-super-v12b
- Otro modelo de la familia (3B, lfm2): https://huggingface.co/firzahdzm/tourn-45f9a179-instructtext-super-v4
- Otro modelo de la familia (2B, falcon_h1): https://huggingface.co/firzahdzm/tourn-803a8f69-instructtext-super-k3f2
- Otro modelo de la familia (494M): https://savrn.com/models/tourn-87c51c39-instructtext-super-s2kpre
- Tema de GitHub relacionado con el autor: https://github.com/topics/firzahdzm-instruct-1e8c8e8e20b2-01
- Repositorio de GitHub con posible despliegue: https://github.com/Damacol/firzahdzm-instruct-1e8c8e8e20b2-01
- Paper: no disponible.
- Blog o demo oficial: no disponible.
