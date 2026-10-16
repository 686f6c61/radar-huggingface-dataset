# OBLITERATUS/OBLITERATUS-v2-27B-LoRA

## Resumen

OBLITERATUS-v2-27B-LoRA es un adaptador LoRA publicado en HuggingFace por el usuario OBLITERATUS. Segun la model card, se trata de un ajuste fino del modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, entrenado mediante SFT con la libreria TRL y la cadena de herramientas de Unsloth. El repositorio contiene unicamente los pesos del adaptador (formato safetensors, 2,8 GB), no un modelo completo, por lo que su uso requiere descargar y cargar el modelo base por separado.

La relevancia de esta ficha es limitada y conviene decirlo con claridad: el autor no documenta ni el conjunto de datos de entrenamiento, ni el numero de tokens, ni el rango y los hiperparametros del LoRA, ni los idiomas soportados, ni la licencia, ni resultados de benchmarks. La metadena de HuggingFace indica 0 descargas y 0 likes en el momento de la consulta, y el campo de licencia de la model card aparece como `licence: license`, es decir, sin valor real. Ademas, las fechas de creacion y actualizacion (15 de octubre de 2026) y las versiones de framework declaradas (Transformers 5.17.0, PyTorch 2.14.1, TRL 1.15.0) no coinciden con ninguna version publicada conocida, lo que apunta a un repositorio reempaquetado, generado automaticamente o con metadatos inconsistentes.

En consecuencia, esta ficha describe lo que consta de forma verificable en el repositorio y marca explicitamente como "no disponible" todo aquello que el autor no especifica. No se han incluido cifras estimadas de rendimiento ni comparativas cuantitativas con otros modelos porque no existe material de origen que las respalde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; se trata de un adaptador LoRA sobre un transformer de la familia Qwen (deducido del identificador del modelo base) |
| Parametros totales | 27B nominales del modelo base (segun el identificador); el adaptador LoRA no declara su numero de parametros entrenables |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | modelo base publicado en cuantizacion bnb de 4 bits por Unsloth; el adaptador se distribuye en safetensors. No se declaran otras cuantizaciones ni versiones GGUF |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye `licence: license` sin especificar; la metadena de HuggingFace no declara licencia) |
| Formato de pesos | safetensors (etiqueta del repositorio) |
| Tipo de artefacto | adaptador LoRA (no modelo completo) |
| Modelo base | `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` |
| Metodo de entrenamiento | SFT (supervised fine-tuning) |
| Framework declarado | TRL 1.15.0, Transformers 5.17.0, PyTorch 2.14.1, Datasets 4.8.5, Tokenizers 0.23.3 |
| Tamano del repositorio | 2,8 GB |
| Fecha de creacion | 2026-10-15 |
| Ultima actualizacion | 2026-10-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no permite describir la arquitectura interna del modelo base. El unico dato tecnico es que se trata de un ajuste fino supervisado (SFT) realizado con TRL sobre `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, un artefacto de Unsloth que, por su nombre, corresponderia a un modelo denso de 27 000 millones de parametros cuantizado en 4 bits con bitsandbytes. No se especifica si el entrenamiento se hizo sobre el modelo cuantizado o sobre una version en precision completa, ni el rango del LoRA, ni el `target_modules`, ni la tasa de aprendizaje, ni el numero de epocas o de pasos.

Tampoco se documenta la composicion del dataset de entrenamiento, el numero de tokens vistos, la existencia de fases posteriores de alineamiento (DPO, RLHF, RLVR) ni ninguna innovacion tecnica adicional. El repositorio ocupa 2,8 GB, un tamano muy superior al de un adaptador LoRA convencional para un modelo de 27B (que suele situarse entre 100 MB y 500 MB en rango 16-64), lo que sugiere un rango elevado, el guardado de los pesos en precision completa o la inclusion de otros artefactos; el autor no aclara ninguna de estas posibilidades. Las etiquetas del repositorio (`generated_from_trainer`, `hf_jobs`, `trl`, `unsloth`, `sft`, `endpoints_compatible`) indican un entrenamiento lanzado desde HuggingFace Jobs y compatible con Inference Endpoints.

## Capacidades

La model card unicamente aporta un ejemplo de generacion de texto con `transformers.pipeline` ante una pregunta abierta. No se documenta ninguna capacidad adicional, de modo que los siguientes puntos se marcan como no verificados:

- Generacion de texto conversacional: es la unica capacidad demostrada por el ejemplo de la model card, que aplica la plantilla de chat con un mensaje de rol `user`.
- Razonamiento, matematicas y generacion de codigo: no documentado.
- Tool calling o function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentado. El modelo base pertenece a una familia habitualmente multilingue, pero la model card no declara idiomas ni se ha publicado evaluacion al respecto.
- Modo de razonamiento explicito (thinking), vision o audio: no documentado.
- Ajuste de estilo o comportamiento: al ser un LoRA entrenado con SFT sin dataset publicado, se desconoce que comportamiento concreto modifica respecto al modelo base.

## Casos de uso

Dado que no hay documentacion sobre el dataset, los idiomas ni las capacidades reales, los casos de uso solo pueden plantearse como escenarios de evaluacion, no como aplicaciones recomendadas en produccion:

- Evaluacion comparativa de adaptadores LoRA: cargar el adaptador sobre el modelo base y medir, con un conjunto de validacion propio, si el ajuste aporta mejoras frente al base sin ajustar. Es el uso mas razonable mientras no exista informacion publicada.
- Experimentacion academica con SFT: servir como punto de partida reproducible para estudiar el efecto de un fine-tuning sobre un modelo de 27B cuantizado en 4 bits, ya que el adaptador es pequeno en comparacion con el modelo completo.
- Prototipado de asistentes conversacionales: el ejemplo de la model card muestra el uso con `pipeline` y `device_map="auto"`, adecuado para prototipos locales de chat de un solo turno o pocos turnos.
- Ajuste de tono o dominio especifico: si el SFT se ha realizado sobre un dominio concreto (extremo no confirmado), el adaptador podria emplearse para especializar respuestas en ese dominio, previa validacion manual de la calidad.
- Fusion de adaptadores (adapter merging): al ser un LoRA, puede combinarse con otros adaptadores mediante PEFT para explorar mezclas de comportamiento antes de decidir un despliegue.
- Despliegue interno de bajo coste con vLLM: vLLM permite servir multiples adaptadores LoRA sobre una misma instancia del modelo base, lo que reduce el coste de servir variantes experimentales en un entorno interno.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, ambito sanitario, legal o financiero ni en cualquier flujo con requisitos de trazabilidad, dado que se desconoce la licencia, el dataset de entrenamiento y el comportamiento real del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros asociadas.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano nominal de 27B y no estan confirmadas por el autor del modelo. Para ejecutar el adaptador es obligatorio descargar tambien el modelo base.

- Pesos del adaptador: 2,8 GB en disco. Es un requisito adicional, no sustitutivo, del modelo base.
- VRAM en bf16: aproximadamente 54 GB solo para los pesos del modelo base de 27B, mas la cache KV y las activaciones. Requiere una GPU de 80 GB (H100, A100 80 GB) o dos GPU de 40-48 GB con tensor parallelism.
- VRAM en cuantizacion de 8 bits: aproximadamente 27 GB de pesos, lo que encaja en A6000, L40S o L40 (48 GB) y queda fuera de las GPU de 24 GB.
- VRAM en cuantizacion de 4 bits: aproximadamente 14-16 GB de pesos, lo que permite ejecutarlo en una RTX 4090 o RTX 5090 (24-32 GB) siempre que se limite la longitud de contexto para no agotar la memoria con la cache KV.
- GPU recomendadas: H100 80 GB o A100 80 GB para precision bf16; A6000/L40S 48 GB para 8 bits; RTX 4090, RTX 5090, L4 o A10G para 4 bits con contexto reducido.
- Opciones de despliegue: `transformers` con `pipeline` y `device_map="auto"` (metodo mostrado en la model card); vLLM con soporte de adaptadores LoRA; TGI; llama.cpp u Ollama, pero solo tras fusionar el adaptador con el modelo base (`merge_and_unload` de PEFT) y convertir el resultado a GGUF. Unsloth es la via natural para reentrenar o reexportar el adaptador.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo, TTFT ni consumo energetico.

## Comparativa con modelos similares

No hay datos verificables de otros adaptadores comparables ni de resultados del modelo base, por lo que la comparacion cuantitativa se marca como no disponible. La unica comparacion que puede establecerse con la informacion aportada es con el propio modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OBLITERATUS/OBLITERATUS-v2-27B-LoRA | 27B nominales (base); parametros del adaptador no declarados | no disponible | no disponible | no disponible | 0 descargas, 0 likes |
| unsloth/Qwen3.8-27B-unsloth-bnb-4bit (base) | 27B nominales | no disponible | no disponible | no disponible | referenciado como base del ajuste |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion: no se publican dataset, hiperparametros, rango del LoRA, idiomas ni metricas de evaluacion, lo que impide valorar la calidad del ajuste.
- Licencia indefinida: la model card contiene un campo de licencia mal formado (`licence: license`) y la metadena de HuggingFace no declara ninguna. No hay base juridica para uso comercial ni para redistribucion, y ademas la licencia del modelo base podria imponer condiciones adicionales que se desconocen.
- Riesgo de alucinacion: no evaluado. Al no existir benchmarks ni evaluaciones de terceros, no puede acotarse la tasa de errores factibles.
- Sesgos: no documentados. Se desconoce la composicion del dataset de entrenamiento, por lo que no puede analizarse el sesgo introducido por el SFT.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados; cualquier uso multilingue debe validarse empiricamente antes de asumirlo.
- Metadatos inconsistentes: las fechas (octubre de 2026) y las versiones de framework (Transformers 5.17.0, PyTorch 2.14.1, TRL 1.15.0, Datasets 4.8.5, Tokenizers 0.23.3) no corresponden a versiones publicadas conocidas, lo que sugiere reempaquetado, automatizacion defectuosa o un origen distinto al declarado. Conviene tratar el repositorio con cautela.
- Trazabilidad nula: con 0 descargas y 0 likes, no existe comunidad de usuarios que haya validado el modelo, ni issues, ni informes independientes de comportamiento.
- Dependencia del modelo base: el adaptador no es autosuficiente. Cualquier cambio, retirada o modificacion del repositorio `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` inutiliza este artefacto.
- Formato de pesos: al distribuirse como safetensors y no incluir GGUF, no es directamente utilizable en llama.cpp u Ollama sin un proceso previo de fusion y conversion.
- Recomendacion operativa: no desplegar en produccion sin una evaluacion propia sobre un conjunto de validacion representativo, verificacion juridica de la licencia y un mecanismo de filtrado de salidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OBLITERATUS/OBLITERATUS-v2-27B-LoRA
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Repositorio de TRL (framework de entrenamiento citado en la model card): https://github.com/huggingface/trl
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la informacion disponible.
