# Fernandosr85/adaption_recipe_ingredient_validation

## Resumen

Este repositorio contiene un adaptador LoRA entrenado con ajuste supervisado (SFT) sobre `mistralai/Mixtral-8x7B-Instruct-v0.1`, publicado por el usuario Fernandosr85 con el nombre `adaption_recipe_ingredient_validation`. El adaptador se ha generado con AutoScientist, la herramienta de ajuste automatico de Adaption, y su objetivo declarado es la validacion de ingredientes en recetas: comprobar si los ingredientes de una receta estan bien formados y son coherentes con el plato descrito.

Se trata de un ajuste de dominio muy acotado (cocina al 100 %) sobre 4.600 filas de datos en formato chat. No es un modelo completo: el repositorio ocupa 0,2 GB y solo contiene los pesos del adaptador en safetensors, por lo que necesita descargar el modelo base de 46,7B parametros (MoE, aproximadamente 12,9B activos por token) para poder ejecutarse.

Su relevancia practica es limitada y experimental: no tiene descargas ni valoraciones, la licencia figura como "other" sin detallar condiciones y la evaluacion se publica solo como imagenes (metricas de entrenamiento y win rates) sin cifras numericas ni linea base explicita. Es util como ejemplo de pipeline de ajuste automatico LoRA sobre un MoE grande y como punto de partida para experimentos de validacion de recetas, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer MoE: `mistralai/Mixtral-8x7B-Instruct-v0.1` |
| Parametros totales | 46,7B en el modelo base (segun la config de entrenamiento); el adaptador LoRA de este repositorio no publica su recuento de parametros y ocupa 0,2 GB |
| Parametros activos | 12,9B (corresponden al modelo base Mixtral-8x7B, 2 de 8 expertos por token; no confirmado en la model card del adaptador) |
| Longitud de contexto | 32.768 tokens del modelo base (no indicada en la model card del adaptador) |
| Tipos de cuantizacion | No disponible. El adaptador se publica sin cuantizar en safetensors; puede aplicarse sobre versiones cuantizadas del base a 8 y 4 bits mediante bitsandbytes y PEFT |
| Idiomas soportados | No disponibles. La model card no especifica idiomas ni la composicion linguistica del dataset |
| Licencia | `other` (sin detalle de condiciones en la model card); el modelo base Mixtral-8x7B-Instruct-v0.1 se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mixtral-8x7B-Instruct-v0.1, un transformer de tipo mezcla de expertos (MoE) con 46,7B parametros totales y 2 expertos activados por token. El ajuste es un LoRA clasico con rango 64 (`lora_r: 64`), `lora_alpha: 128`, `lora_dropout: 0` y modulos entrenables restringidos a las proyecciones de atencion `q_proj`, `k_proj`, `v_proj` y `o_proj`. El resto de los pesos del modelo base permanece congelado.

El entrenamiento se realizo con SFT sobre datos en formato chat (`data_format: chat`, `train_on_inputs: false`) durante 5 epochs, con learning rate 1e-4, scheduler coseno (`scheduler_num_cycles: 0.5`), `min_lr_ratio: 0.1`, `warmup_ratio: 0.05`, `weight_decay: 0.05`, `max_grad_norm: 1` y 5 evaluaciones intermedias (`n_evals: 5`). El conjunto de datos consta de 4.600 filas, con una distribucion de dominio de cocina del 100 %. No se documentan tecnicas adicionales (RLHF, DPO, decodificacion especulativa ni atencion lineal) ni la procedencia o composicion detallada del dataset.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del modelo base Mixtral-8x7B-Instruct-v0.1.
- Validacion de ingredientes de recetas: el objetivo declarado del adaptador es comprobar la coherencia y el formato de las listas de ingredientes en el dominio culinario.
- Razonamiento sobre texto culinario dentro del dominio de ajuste (cocina al 100 % de los datos de entrenamiento).
- Capacidades generales del modelo base: razonamiento, matematicas, generacion de codigo, tool calling y uso en agentes multi-paso, aunque no hay evidencia publicada de que el adaptador las conserve intactas.
- Capacidades multilingues: no disponibles. No se especifican idiomas y el ajuste se ha hecho sobre un dataset de dominio sin descripcion linguistica.
- Capacidad especial: ninguna adicional; no hay modo "thinking", vision ni audio.

## Casos de uso

- Validacion automatica de recetas en una app de cocina: el adaptador puede comprobar si la lista de ingredientes de una receta enviada por un usuario esta completa, bien formateada y es coherente con el plato, integr andose en el pipeline de publicacion de contenido.
- Moderacion y control de calidad de contenido culinario: filtrar recetas con ingredientes mal escritos, duplicados, vacios o claramente incompatibles antes de que lleguen a la base de datos de produccion.
- Normalizacion de ingredientes en catalogos: unificar variantes de escritura ("tomate", "tomates", "tomate triturado") en un e-commerce o recetario, usando el adaptador como clasificador generativo previo a una capa de reglas.
- Generacion asistida de listas de la compra: a partir de una receta validada, el modelo base (con el adaptador cargado) puede producir la lista de ingredientes en formato estructurado, con la validacion previa garantizada por el ajuste.
- Asistente conversacional de cocina: atender consultas multi-turno sobre ingredientes y sustituciones aprovechando la ventana de contexto de 32.768 tokens del modelo base, con el adaptador especializando el tono y el formato de respuesta en el dominio.
- Extraccion de ingredientes desde texto libre: procesar resenas, blogs o notas de voz transcritas para extraer listas de ingredientes normalizadas que alimenten un buscador o un sistema de recomendacion.
- Investigacion sobre ajuste eficiente: servir de caso de estudio reproducible de un pipeline SFT + LoRA generado por AutoScientist sobre un MoE de 46,7B, util para comparar estrategias de ajuste de bajo rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye dos imagenes (`training-metrics.png` y `win-rates.png`) que, segun el texto, corresponden a las metricas de entrenamiento y a la comparacion de win rates frente a un conjunto de test retenido y a un conjunto de test mas amplio del dominio. No se especifican los valores numericos, los modelos comparados ni el tamano de dichos conjuntos, por lo que no es posible reproducir ni verificar los resultados.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB y no anade requisitos relevantes de VRAM por si mismo.
- Modelo base en bf16/fp16: aproximadamente 93-94 GB solo en pesos, mas cache KV. Requiere al menos 2 GPU de 80 GB (A100 80GB, H100 80GB) o una H200 con tensor parallelism.
- Modelo base en 8 bits: aproximadamente 47-50 GB de pesos; cabe en una A100 80GB, una H100 80GB o una L40S de 48 GB con margen ajustado.
- Modelo base en 4 bits (NF4, GPTQ o AWQ): aproximadamente 24-28 GB; es la unica configuracion realista en GPU de consumo.
- GPU de consumo: una RTX 3090 o RTX 4090 de 24 GB puede ejecutar el base en 4 bits con contexto reducido; dos RTX 3090 ofrecen mas margen. En CPU, el modelo completo es impracticable sin cuantizacion agresiva.
- Despliegue: la via documentada en la model card es `transformers` + `peft` (con opcion de `merge_and_unload` para fusionar los pesos y acelerar la inferencia). Tras fusionar, es viable servir con vLLM o TGI. Para llama.cpp u Ollama habria que fusionar el adaptador, convertir el resultado a GGUF y disponer de una version GGUF del base compatible; el repositorio no proporciona pesos GGUF ni convertidos.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `adaption_recipe_ingredient_validation` (este repositorio) | 46,7B en el base + adaptador LoRA | 32.768 tokens (heredado del base) | `other`, sin detalle | 0 descargas, 0 likes; solo adaptador |
| `mistralai/Mixtral-8x7B-Instruct-v0.1` (base) | 46,7B totales, 12,9B activos | 32.768 tokens | Apache 2.0 | Modelo completo, ampliamente desplegado |
| Ajuste completo (full fine-tuning) del mismo base con el mismo dataset | 46,7B | 32.768 tokens | Depende del base | No existe una version publica equivalente identificada |
| Otros adaptadores LoRA de dominio culinario en el Hub | No disponible | No disponible | No disponible | No se han identificado alternativas publicas con metricas comparables en la informacion disponible |

No hay datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La unica comparacion publicada por el autor es el grafico de win rates, sin cifras.

## Limitaciones y advertencias

- Repositorio sin validacion externa: 0 descargas y 0 likes, sin historial de uso ni issues.
- La evaluacion se presenta unicamente como imagenes sin valores numericos, sin linea base identificada y sin tamano de los conjuntos de test.
- Dataset de entrenamiento muy pequeno (4.600 filas) y monodominio (cocina al 100 %), lo que limita la generalizacion fuera de ese dominio.
- Riesgo de alucinacion en un ambito sensible: una validacion incorrecta de ingredientes puede afectar a alergias, intolerancias o restricciones dieteticas. El modelo no debe usarse como unica fuente de verdad en seguridad alimentaria.
- No se documentan sesgos, composicion demografica del dataset ni idiomas soportados.
- Licencia `other` sin condiciones explicitas: no esta claro si se permite el uso comercial del adaptador. Ademas, el uso del modelo base Mixtral-8x7B-Instruct-v0.1 esta sujeto a Apache 2.0.
- Dependencia estricta del modelo base: no funciona de forma autonoma y debe cargarse con PEFT sobre la revision exacta del base.
- Sin pesos cuantizados ni GGUF publicados, lo que complica el despliegue en entornos de consumo y en herramientas como llama.cpp u Ollama.
- No hay informacion sobre la procedencia ni la licencia del dataset de recetas utilizado para el ajuste, lo que anade incertidumbre juridica para uso en produccion.
- Fechas del repositorio (creacion y actualizacion en septiembre de 2026, con 18 segundos de diferencia) y ausencia de versionado posterior: no hay garantia de mantenimiento.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Fernandosr85/adaption_recipe_ingredient_validation
- Modelo base: https://huggingface.co/mistralai/Mixtral-8x7B-Instruct-v0.1
- Adaption (herramienta AutoScientist citada por el autor): https://adaptionlabs.ai
- Resultados de la busqueda web: no se han encontrado enlaces relevantes; las unicas entradas devueltas correspondian a paginas de inicio de sesion de Facebook, sin relacion con el modelo.
