# HazemLab/ares-softmoe-4b-l2-consecutive-225K

## Resumen

Ares (`ares-softmoe-4b-l2-consecutive-225K`) es un modelo de lenguaje de proteinas (protein language model, PLM) de tipo encoder, con arquitectura de mezcla de expertos dispersa (sparse Mixture-of-Experts, MoE) y enmascaramiento (masked language modeling, MLM) como objetivo de preentrenamiento. Lo desarrolla HazemLab y se entrena desde cero sobre UniRef50 en TPU. Con aproximadamente 4,24 mil millones de parametros, esta pensado para tareas de representacion y prediccion en biologia computacional: embeddings de residuos y de secuencia, relleno de residuos enmascarados y prediccion de efectos de variantes (variant effect prediction, VEP).

Este checkpoint concreto es la variante con enrutamiento suave (soft routing) y router normalizado en L2, con las ultimas 10 de sus 20 capas usando feed-forward MoE y las 10 primeras densas (colocacion consecutiva), capturado a 225.000 pasos de entrenamiento. Forma parte de una familia de cinco checkpoints que comparten arquitectura y receta y solo difieren en como los tokens llegan a los expertos y en donde se situan las capas MoE.

Su relevancia actual radica en la propuesta tecnica: un enrutamiento sin perdida de balanceo (loss-free) en el que cada token contribuye a todos los expertos mediante un despacho softmax y ningun token se descarta. El trabajo fue aceptado como spotlight en el GenBio Workshop de ICML 2026. En ProteinGym alcanza 0,341 de Spearman agregado (Fisher-z) sobre 217 ensayos DMS, empatado con el checkpoint de 150K sin normalizacion L2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder pre-norm, 20 bloques, con capas MoE en las capas 10-19 (colocacion consecutiva) |
| Parametros totales | 4.236.352.554 (~4,24B) |
| Parametros activos | 4,24B (sin esparsidad de parametros: el enrutamiento suave activa todos los expertos en cada forward pass) |
| Longitud de contexto | 1024 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | no aplica: modelo de proteinas, vocabulario de 31 tokens (20 aminoacidos estandar + `BXZJUO` + 5 especiales) |
| Licencia | MIT |
| Formato de pesos | safetensors (un unico `model.safetensors`, ~16,9 GB en float32) |

Otros datos tecnicos: hidden size 1024, feed-forward de 4096 con activacion gated SiLU (SwiGLU), atencion grouped-query con 16 cabezas y 8 cabezas KV de dimension 64, codificacion posicional rotatoria (RoPE) con base 10000, normalizacion RMSNorm, 32 expertos y enrutador `soft_router` con `moe_normalize: true`.

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional de 20 bloques con pre-norm. Las diez primeras capas son densas y las diez ultimas incorporan feed-forward MoE. Cada uno de los 32 expertos posee 64 slots aprendidos; cada token contribuye a todos los slots mediante un despacho softmax, los expertos operan sobre los 2048 slots y los resultados se recombinan por token. Este diseno elimina la necesidad de una perdida de balanceo de carga y evita el descarte de tokens tipico del top-k MoE. En este checkpoint, tanto los estados ocultos como la proyeccion de enrutamiento `phi` se normalizan en L2 antes de calcular los logits, con un escalar aprendido que restaura la escala; el objetivo es mantener acotados los logits de enrutamiento a medida que crecen la profundidad y la duracion del entrenamiento.

El preentrenamiento se realizo desde cero sobre el dataset `agemagician/uniref50_09012025` con objetivo de masked language modeling, enmascaramiento programado (scheduled masking) y ruido de mutacion (mutation noising). El entrenamiento se ejecuto en TPU hasta 225.000 pasos. No se especifica en la informacion disponible el numero total de tokens vistos, la composicion exacta del dataset ni si hubo fases de ajuste fino con RLHF o DPO (no aplicables de forma habitual en un PLM encoder).

En cuanto al coste computacional, el modelo no presenta esparsidad de parametros: al activarse todos los expertos, los 4,24B parametros se computan en cada forward pass. Lo que cambia el enrutamiento es el perfil de coste: los expertos operan sobre un numero fijo de slots independientemente de la longitud de entrada, por lo que la capa resulta relativamente mas barata en secuencias largas y mas cara en cortas. Segun el autor, el coste es aproximadamente 2,5 veces el de una capa densa en el contexto de entrenamiento de 1024 tokens, y el punto de equilibrio se situa alrededor de 4096 tokens.

## Capacidades

- Relleno de residuos enmascarados (fill-mask): predice el aminoacido o token adecuado en posiciones `<mask>` de una secuencia proteica.
- Extraccion de embeddings de residuo (dimension 1024) y de secuencia (pooling con mascara de atencion), aptos para transfer learning en tareas downstream.
- Prediccion de efectos de variantes (VEP): evaluacion de mutaciones sobre 217 ensayos DMS de ProteinGym mediante puntuaciones de sustitucion.
- Modelado de representaciones bidireccional: al ser un encoder MLM, dispone de contexto completo en ambas direcciones para cada residuo.
- Manejo del alfabeto proteico ampliado: 20 aminoacidos estandar mas `BXZJUO` para residuos ambiguos o no estandar, y 5 tokens especiales.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion autoregresiva de texto: es un encoder de proteinas, no un modelo conversacional.
- No dispone de capacidades de vision, audio ni modo thinking.
- Capacidades multilingues: no aplicables; el dominio es secuencial biologico, no lenguaje natural.

## Casos de uso

- Prediccion de efectos de variantes en cribado genomico: dado un conjunto de mutaciones missense, el modelo puntua cada sustitucion y permite priorizar variantes probablemente deletereas antes de validacion experimental, gracias a su rendimiento de 0,341 en ProteinGym sobre 217 ensayos DMS.
- Anotacion funcional de proteinas desconocidas: extraer embeddings de secuencia y usarlos como entrada de clasificadores ligeros para predecir familia, localizacion subcelular o funcion enzimatica, aprovechando el preentrenamiento sobre UniRef50.
- Relleno de huecos en secuencias parciales: reconstruir residuos faltantes en proteinas con regiones ambiguas o mal resueltas mediante la cabeza MLM, util en curacion de bases de datos y ensamblaje de fragmentos.
- Busqueda y agrupamiento de proteinas por similitud: generar embeddings de residuo o de secuencia para indexar bibliotecas proteicas y recuperar homologos funcionales mediante similitud vectorial, sin depender exclusivamente de alineamientos multiples.
- Prediccion de estructura asistida: usar los embeddings como caracteristicas de entrada en modelos de prediccion estructural o de contacto, reduciendo la necesidad de entrenar representaciones desde cero con datos etiquetados escasos.
- Diseno de mutantes en ingenieria de proteinas: evaluar in silico bibliotecas de mutaciones para descartar candidatos con alta probabilidad de perdida de funcion antes de sintetizarlos y ensayarlos en laboratorio.
- Investigacion en arquitecturas MoE para dominios cientificos: servir como referencia reproducible para estudiar enrutamiento suave sin perdida de balanceo en encoders bidireccionales, con codigo y pesos publicados bajo MIT.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible corresponden a ProteinGym (Spearman agregado con Fisher-z sobre 217 ensayos DMS de sustitucion; mayor es mejor):

| Checkpoint | Enrutamiento | Colocacion MoE | Pasos | ProteinGym |
|---|---|---|---|---|
| ares-softmoe-4b-consecutive-150K | Soft | Consecutiva | 150.000 | 0,341 |
| ares-softmoe-4b-l2-consecutive-225K | Soft + L2 | Consecutiva | 225.000 | 0,341 |
| ares-softmoe-4b-l2-consecutive-150K | Soft + L2 | Consecutiva | 150.000 | 0,319 |
| ares-expert-choice-4b-interleaved-150K | Expert choice | Intercalada | 150.000 | 0,126 |
| ares-ec-moe-4b-86k | Expert choice | Consecutiva | 86.000 | no evaluado |

Los dos mejores checkpoints de la familia empatan en 0,341 y se reparten los 217 ensayos 111 a 106. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje natural en la informacion disponible, ya que no son aplicables a un modelo de proteinas. Tampoco se dispone de comparaciones numericas con PLM de otros autores.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 17 GB solo para pesos, mas activaciones y buffers; en la practica se recomienda al menos 24 GB para secuencias de 1024 tokens.
- En bfloat16 (formato usado en el ejemplo de la model card): alrededor de 8,5 GB de pesos, por lo que cabe en GPUs consumer de 12-16 GB como la RTX 4090 o la RTX 4080, con margen limitado para activaciones.
- Cuantizaciones de 8 o 4 bits no estan documentadas en la informacion disponible; su viabilidad depende de que el paquete `ares` y el codigo custom las soporten.
- GPUs recomendadas: A100 40/80 GB o H100 para inferencia por lotes y entrenamiento; RTX 4090 o A6000 para inferencia individual en bf16.
- Despliegue: el modelo no forma parte de `transformers`; requiere `pip install git+https://github.com/hazemessamm/ares.git`, que aporta la clase `Ares` y `AresProteinTokenizer`, sin necesidad de `trust_remote_code`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el autor indica que las capas MoE cuestan aproximadamente 2,5 veces una capa densa a 1024 tokens y que el equilibrio se alcanza hacia los 4096 tokens, fuera del contexto de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | ProteinGym | Disponibilidad |
|---|---|---|---|---|---|---|
| ares-softmoe-4b-l2-consecutive-225K | 4,24B | 1024 | Encoder MoE soft routing + L2 | MIT | 0,341 | Hugging Face + repo GitHub |
| ares-softmoe-4b-consecutive-150K | 4,24B | 1024 | Encoder MoE soft routing | MIT | 0,341 | Hugging Face |
| ares-expert-choice-4b-interleaved-150K | 4,24B | 1024 | Encoder MoE expert choice | MIT | 0,126 | Hugging Face |
| Otros PLM de referencia (ESM-2, ProstT5, etc.) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de modelos de otros autores, por lo que la comparacion cuantitativa con alternativas externas queda como no disponible. Dentro de la propia familia Ares, la variante con enrutamiento soft supera ampliamente a la de expert choice (0,341 frente a 0,126) y la normalizacion L2 aporta una mejora clara a 150K pasos (0,319 frente a 0,341) que se diluye a 225K.

## Limitaciones y advertencias

- No es un modelo generativo de texto ni un asistente: es un encoder de proteinas con cabeza MLM; no admite instrucciones, tool calling ni dialogos.
- Contexto limitado a 1024 tokens de entrenamiento; secuencias proteicas mas largas requeriran truncado o estrategias de ventana, y el comportamiento mas alla de esa longitud no esta validado.
- Sin esparsidad efectiva: los 4,24B parametros se activan siempre, por lo que el ahorro computacional frente a un modelo denso equivalente no se materializa en secuencias cortas.
- Riesgo de sobreajuste a la distribucion de UniRef50: proteinas poco representadas en esa base (p. ej. variantes raras, proteinas disenadas de novo o con residuos no estandar) pueden recibir representaciones de menor calidad.
- Las puntuaciones de VEP son correlaciones agregadas sobre ensayos DMS; no deben interpretarse como probabilidades calibradas de patogenicidad clinica sin validacion especifica por gen y contexto.
- El checkpoint de 225K no supera al de 150K en ProteinGym (ambos 0,341); el autor recomienda el de 150K como opcion por defecto por su simplicidad, lo que sugiere rendimientos decrecientes tras 150K pasos.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar las condiciones de las bases de datos de origen (UniRef50) y de los datos DMS empleados en evaluacion.
- Dependencia de codigo externo (`ares`) fuera de `transformers`: la integracion en pipelines de produccion exige mantener ese paquete y verificar compatibilidad con futuras versiones de PyTorch.
- No hay informacion publicada sobre sesgos biologicos, calibracion de la cabeza MLM ni evaluacion en proteinas de membrana o regiones intrinsecamente desordenadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HazemLab/ares-softmoe-4b-l2-consecutive-225K
- Checkpoint hermano (150K, soft routing sin L2): https://huggingface.co/HazemLab/ares-softmoe-4b-consecutive-150K
- Checkpoint hermano (150K, soft + L2): https://huggingface.co/HazemLab/ares-softmoe-4b-l2-consecutive-150K
- Checkpoint hermano (expert choice, intercalado): https://huggingface.co/HazemLab/ares-expert-choice-4b-interleaved-150K
- Checkpoint hermano (expert choice, 86K): https://huggingface.co/HazemLab/ares-ec-moe-4b-86k
- Paper (OpenReview, GenBio Workshop ICML 2026): https://openreview.net/forum?id=gq0R7xiPjg
- Codigo fuente: https://github.com/hazemessamm/ares
- Dataset de entrenamiento: https://huggingface.co/datasets/agemagician/uniref50_09012025
- Licencia MIT: https://opensource.org/licenses/MIT
