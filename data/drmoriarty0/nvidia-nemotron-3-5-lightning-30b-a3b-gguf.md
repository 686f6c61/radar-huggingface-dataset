# DrMoriarty0/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

Este repositorio no contiene un modelo original, sino una recoleccion de cuantizaciones GGUF del modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B, publicadas por el usuario DrMoriarty0 bajo el esquema que denomina mAPEX (modified Automated Precision EXpert allocation). El punto de partida declarado es la cuantizacion intermedia de bartowski, que a su vez parte del fichero bf16 original `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-bf16-00001-of-00002.gguf`. Es, por tanto, un artefacto de distribucion derivado, orientado a ejecucion local en `llama.cpp` y herramientas compatibles.

La nomenclatura del nombre (30B-A3B) sigue la convencion habitual de los modelos de mezcla de expertos, en la que el primer numero indica parametros totales y el segundo los parametros activos por token. De confirmarse, estariamos ante un transformer disperso de aproximadamente 30.000 millones de parametros totales con unos 3.000 millones activos, lo que lo situaria en la categoria de modelos MoE eficientes en inferencia. No obstante, la model card disponible no incluye ficha tecnica del modelo base, y la tabla de cuantizaciones publicada aparece truncada, por lo que no es posible verificar arquitectura, contexto ni licencia.

La relevancia de este repositorio es practica: permite desplegar un modelo de 30B en hardware de consumo moderado con perdida de precision controlada por capa. El interes es limitado a dia de hoy, dado que el repositorio registra 0 descargas y 0 likes, y no aporta resultados de evaluacion que validen la calidad de las cuantizaciones frente a otras alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura A3B sugiere mezcla de expertos, sin confirmar) |
| Parametros totales | 30B segun nomenclatura del nombre; no disponible en la model card |
| Parametros activos | 3B segun nomenclatura del nombre; no disponible en la model card |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mAPEX (modified APEX) mediante `--tensor-type-file` de `llama.cpp`; se mencionan variantes "TierN-s"; la tabla de ficheros y tamanos esta truncada en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (derivado de bf16 GGUF de bartowski) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base, el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. La unica caracteristica arquitectonica inferible es la propia del mecanismo de cuantizacion: mAPEX asigna precision por capa y por tensor, lo cual solo tiene sentido en modelos con estructura heterogenea, tipicamente mezclas de expertos, donde las capas de expertos y las de atencion toleran niveles de cuantizacion distintos.

La innovacion tecnica documentada pertenece al proceso de cuantizacion, no al modelo. Segun el autor, las variantes denominadas TierN-s son ligeramente mas grandes que sus equivalentes regulares pero ofrecen entre un 10 % y un 20 % mas de velocidad de inferencia, con una dependencia alta del modelo concreto y de la GPU empleada. No se documenta la metodologia de calibracion, el tamano del conjunto de calibracion ni las metricas de perplexity resultantes.

## Capacidades

- No se documentan capacidades especificas del modelo base en la informacion disponible.
- Por tratarse de un GGUF cuantizado, conserva las capacidades funcionales del modelo original en la medida en que la cuantizacion no las degrade, extremo no verificado.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades multimodales (vision, audio): no disponible.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

Dado que no hay datos verificados sobre el modelo base, los escenarios siguientes son aplicaciones plausibles de un GGUF MoE de 30B totales y 3B activos, no casos validados por el autor:

- Inferencia local en estacion de trabajo: al mantener solo 3B parametros activos por token si se confirma la arquitectura MoE, el coste computacional por token es bajo y el modelo puede ejecutarse en una GPU de gama alta de consumo con la cuantizacion adecuada, aunque el peso total en VRAM venga determinado por los 30B.
- Servicio de generacion de texto autoalojado: desplegado con `llama.cpp` o `vLLM` en un unico nodo con GPU profesional, permite evitar dependencias de API externas y mantener los datos dentro de la infraestructura propia.
- Prototipado y evaluacion interna: util para comparar la degradacion introducida por distintas cuantizaciones mAPEX frente a bf16 antes de comprometer recursos en un despliegue mayor.
- Procesamiento por lotes de documentos: si el contexto del modelo base es amplio (no confirmado), encaja en tareas de resumen, extraccion de entidades y clasificacion sobre volumenes grandes de texto en cola.
- Asistente de codigo en entorno controlado: un modelo de esta categoria suele emplearse para autocompletado y explicacion de codigo; requiere validacion previa de su rendimiento en lenguajes de programacion, no documentado aqui.
- Experimentacion en investigacion sobre cuantizacion: el repositorio es directamente util como material de estudio para analizar el efecto de la asignacion de precision por tensor en modelos MoE, comparando las variantes TierN-s con las regulares.
- Generacion de datos sinteticos para ajuste fino: si el modelo conserva calidad suficiente en la cuantizacion, puede emplearse para producir corpus de texto a bajo coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, ni del modelo base ni de las cuantizaciones derivadas. La unica cifra de rendimiento declarada es la mejora de velocidad del 10-20 % de las variantes TierN-s frente a las regulares, sin especificar GPU, tamano de lote ni longitud de contexto en la que se midio.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parametros y del formato GGUF; no proceden de la model card y deben verificarse antes de dimensionar un despliegue:

- Peso en disco y VRAM aproximada para 30B totales, sin contar cache KV: entorno a 18-20 GB en Q4_K_M, 21-24 GB en Q5_K_M, 27-29 GB en Q6_K y 32-34 GB en Q8_0.
- Cabe en GPU de consumo: si, siempre en el rango de 24 GB de VRAM (RTX 3090, RTX 4090) usando cuantizaciones de 4 a 5 bits y contexto moderado; el offload parcial a RAM permite reducir aun mas los requisitos a costa de latencia.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB permiten cuantizaciones de mayor precision y contextos mas largos sin offload.
- Contexto largo: la cache KV de un modelo de 30B con contexto extendido puede consumir varios gigabytes adicionales, por lo que conviene reservar VRAM mas alla del peso del modelo.
- Opciones de despliegue: `llama.cpp` y `llama-server`, Ollama, LM Studio, koboldcpp; en servidor, `vLLM` o `TGI` admiten GGUF aunque con soporte mas maduro para safetensors.
- Latencia y throughput: no disponibles. En un modelo MoE con 3B activos se espera un throughput notablemente superior al de un denso de 30B del mismo peso, pero no hay mediciones publicadas en este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DrMoriarty0/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF (este repositorio) | 30B / 3B activos segun nomenclatura | no disponible | GGUF mAPEX | no disponible | HuggingFace, 0 descargas |
| bartowski/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF | 30B / 3B activos segun nomenclatura | no disponible | GGUF | no disponible | HuggingFace, repositorio fuente declarado |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B bf16 (original) | 30B / 3B activos segun nomenclatura | no disponible | bf16 GGUF | no disponible | referenciado como origen de la cadena de cuantizacion |

No se dispone de datos de rendimiento ni de licencia que permitan una comparacion funcional con alternativas de otras familias. Las unicas comparaciones posibles dentro de la informacion proporcionada son las de la propia cadena de derivacion (original bf16, cuantizacion intermedia de bartowski y cuantizacion final mAPEX).

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no hay documentacion sobre el corpus de entrenamiento ni sobre evaluaciones de sesgo.
- Riesgo de alucinacion: no cuantificado; cualquier cuantizacion por debajo de 8 bits tiende a incrementar la degradacion en tareas de razonamiento y matematicas, pero no hay mediciones para este caso concreto.
- Degradacion por cuantizacion: el autor no publica perplexity ni comparativas de calidad frente a bf16, por lo que la perdida real de precision es desconocida.
- Limitaciones de contexto e idioma: no documentadas.
- Licencia: no disponible en la informacion proporcionada. Es imprescindible verificar la licencia del modelo original de NVIDIA antes de cualquier uso comercial o redistribucion, ya que este repositorio es un derivado y no puede otorgar derechos que no posea.
- Madurez: el repositorio registra 0 descargas y 0 likes, y fue publicado muy recientemente, por lo que no cuenta con validacion de la comunidad.
- Integridad de la informacion: la tabla de cuantizaciones de la model card esta truncada en los datos disponibles; no se puede confirmar que variantes existen realmente ni sus tamanos.
- Riesgo operativo: los modelos GGUF derivados pueden presentar incompatibilidades con versiones concretas de `llama.cpp` si el esquema de asignacion por tensor requiere soporte especifico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/DrMoriarty0/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Repositorio fuente de las cuantizaciones: https://huggingface.co/bartowski/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Herramienta de cuantizacion apex-quant: https://github.com/DrMoriarty/apex-quant/
- Fichero de origen declarado: `NVIDIA-Nemotron-3.5-Lightning-30B-A3B-bf16/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-bf16-00001-of-00002.gguf`
- Documentacion de `llama.cpp` (soporte de `--tensor-type-file`): https://github.com/ggml-org/llama.cpp
- Paper del modelo original: no disponible
- Blog o anuncio oficial de NVIDIA: no disponible
- Demo o espacio interactivo: no disponible
