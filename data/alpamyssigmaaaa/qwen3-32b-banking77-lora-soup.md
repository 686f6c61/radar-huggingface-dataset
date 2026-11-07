# AlpamysSigmaaaa/Qwen3-32B-Banking77-LoRA-Soup

## Resumen

Qwen3-32B-Banking77-LoRA-Soup es un adaptador LoRA de rango 8 publicado por el usuario AlpamysSigmaaaa sobre el modelo base Qwen/Qwen3-32B. Su proposito es concreto: clasificar mensajes de clientes bancarios en una de las 77 intenciones del dataset Banking77. El modelo recibe en el prompt la lista de las 77 etiquetas y responde generando el texto de la etiqueta, por lo que tecnicamente se trata de una tarea de generacion de texto (pipeline `text-generation`) aunque el objetivo sea clasificacion.

El adaptador se entreno con Soup, una herramienta del propio autor que implementa *layer streaming*: mantiene los pesos cuantizados del modelo base en RAM de host (o en disco) y mueve una capa del transformer a la GPU cada vez. Esto permite entrenar un modelo de 32.000 millones de parametros con un pico de memoria de GPU de aproximadamente 5 GiB, frente a los 20 GiB del mismo recetario con Hugging Face + PEFT residente.

La relevancia practica es doble. Por un lado, demuestra que el ajuste fino de un LLM grande para una tarea de clasificacion cerrada puede hacerse con hardware de consumo. Por otro, ofrece un incremento medido y con intervalos de confianza: +13,25 puntos de accuracy en el test oficial de Banking77 (3.080 ejemplos), de 69,58 % a 82,82 %. El adaptador ocupa 39,9 MB en fp32 y se distribuye bajo licencia Apache 2.0. Es un resultado de una sola semilla y una sola tarea, y el propio autor lo advierte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=8, alpha=16, dropout 0) sobre transformer decoder-only Qwen3-32B; adaptadores en `q_proj` y `v_proj` de las 64 capas |
| Parametros totales | 32B en el modelo base; 9.961.472 parametros en el adaptador (256 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-32B; el entrenamiento uso maximo 576 tokens) |
| Tipos de cuantizacion | Base de referencia: NF4 blocksize 64 con doble cuantizacion (`unsloth/Qwen3-32B-bnb-4bit`); adaptador guardado en fp32 (39,9 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3-32B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-32B, un transformer decoder-only de 32.000 millones de parametros. El LoRA tiene rango 8 y alpha 16, sin dropout, y se inserta unicamente en las proyecciones `q_proj` y `v_proj` de las 64 capas, lo que da 256 tensores y 9.961.472 parametros entrenables. La tarea se formula como generacion: el prompt incluye las 77 etiquetas y el modelo produce el texto de la etiqueta elegida. La perdida se calcula solo sobre los tokens de la etiqueta y el token `<|im_end|>`.

Los datos de entrenamiento son 1.200 filas distintas del split de entrenamiento de Banking77 (entre 15 y 16 por clase), tras eliminar las filas cuyo texto normalizado aparece tambien en el test. Se reservo un split de desarrollo de 308 filas (4 por clase). El recetario fue una pasada sobre las 1.200 filas, equivalente a 300 pasos de optimizador con 4 filas por paso, sin acumulacion de gradiente y con longitud maxima de 576 tokens. Optimizador AdamW con learning rate 1e-4, weight decay 0, clipping de gradiente a 1.0, 10 pasos de warmup y decaimiento coseno hasta 1e-5. La perdida media por ventana de 25 pasos bajo de 0.81 (pasos 1 a 25) a 0.19 (pasos 276 a 300).

La innovacion tecnica destacable es el uso de Soup con `training.stream_layers: true`: el propio framework cuantiza los pesos BF16 de Qwen3-32B a NF4 (blocksize 64, doble cuantizacion) y los transmite capa a capa desde RAM de host fijada, de modo que el proceso de entrenamiento solo necesita una capa en GPU a la vez. El adaptador se mantuvo en fp32 mediante un shim del lanzador; sin el, la pila de entrenamiento (TRL con carga en 4 bits) deja los parametros LoRA en bfloat16. No se reporta uso de RLHF ni DPO.

## Capacidades

- Clasificacion de intenciones bancarias en 77 clases del dataset Banking77, devolviendo la etiqueta como texto generado.
- Generacion de texto y razonamiento heredados del modelo base Qwen3-32B (no evaluados de forma especifica en esta ficha).
- Formato de respuesta restringido a la etiqueta: el 99,97 % de las salidas del adaptador son una etiqueta valida (frente al 99,03 % del base).
- Capacidad multilingue limitada en la practica: el adaptador se entreno y evaluo solo en ingles, aunque el modelo base soporta mas idiomas.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio especificas de este adaptador.

## Casos de uso

- **Enrutamiento de tickets de soporte bancario**: clasificar cada mensaje entrante en una de las 77 intenciones (consulta de saldo, bloqueo de tarjeta, disputa de cargo, etc.) y dirigirlo al equipo o flujo correspondiente. El adaptador esta entrenado exactamente para este esquema.
- **Triaje en atencion al cliente automatizada**: usar la etiqueta predicha como primer paso de un arbol de decision o de un sistema de respuestas predefinidas, reduciendo la necesidad de un LLM mayor en cada turno.
- **Etiquetado asistido de datos historicos**: procesar transcripciones o correos ya archivados para poblar un dataset etiquetado con las 77 intenciones, aprovechando el 82,82 % de accuracy medido sobre el test oficial.
- **Investigacion sobre layer streaming**: reproducir el recetario de Soup para estudiar el ajuste fino de modelos de 32B en GPUs de 24 GB o menos, dado el pico de ~5 GiB documentado.
- **Linea base para comparativas de clasificacion zero-shot**: emplear el modelo base con las etiquetas en el prompt (69,58 % en Banking77) como referencia frente a clasificadores dedicados o adaptadores alternativos.
- **Prototipado rapido en entornos con VRAM limitada**: desplegar el adaptador junto al base cuantizado en 4 bits en una unica GPU de consumo para validar un producto de clasificacion antes de invertir en infraestructura mayor.
- **Auditoria de robustez de clasificadores**: analizar los 54 ejemplos que el base acertaba y el adaptador falla, y los 462 en sentido contrario, para entender que patrones linguesticos aprende el ajuste fino.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). El base de referencia es `unsloth/Qwen3-32B-bnb-4bit` (NF4), cargado con Transformers y bitsandbytes, con el adaptador aplicado via PEFT. No se midio nada sobre un base en BF16.

| Suite | n | Base | Con adaptador | Cambio (puntos) | IC 95 % del cambio (bootstrap pareado) |
|---|---|---|---|---|---|
| Banking77 test | 3.080 | 69,58 % (2.143) | 82,82 % (2.551) | +13,25 | [+11,88, +14,64] |
| Banking77 dev (reservado) | 308 | 67,21 % (207) | 82,14 % (253) | +14,94 | [+10,39, +19,48] |
| MMLU, 500 preguntas aleatorias | 500 | 76,40 % | 77,20 % | +0,80 | [0,00, +1,80] |
| GSM8K, 400 problemas aleatorios | 400 | 95,25 % | 95,75 % | +0,50 | [0,00, +1,25] |

Datos adicionales reportados: McNemar exacto en Banking77 test p = 7,8e-82; 54 items que el base acertaba y el adaptador falla frente a 462 en sentido contrario; intervalo alternativo remuestreando las 77 clases [+8,99, +17,73] puntos; macro-F1 en test de 0,690 a 0,826; proporcion de salidas con etiqueta valida de 99,03 % a 99,97 %.

Control con el mismo recetario sin layer streaming (Hugging Face + PEFT residente, micro-batch 2):

| | Layer streaming (este adaptador) | Control HF + PEFT |
|---|---|---|
| Banking77 test accuracy | 82,82 % (2.551/3.080) | 83,18 % (2.562/3.080) |
| Cambio vs base (IC 95 %) | +13,25 [+11,88, +14,64] | +13,60 [+12,24, +14,97] |
| Pico de memoria GPU asignada / reservada | 5.052 / 5.216 MiB | 20.127 / 24.236 MiB |

El control supera al adaptador en 0,36 puntos (IC pareado [+0,03, +0,68], McNemar p = 0,052); ambos modelos generaron los mismos token ids en 3.033 de los 3.080 items. La comparacion de memoria es un orden de magnitud aproximado (unas 4x), ya que micro-batch y limite de memoria no fueron identicos.

## Requisitos de hardware

- **VRAM para inferencia**: no se documenta de forma explicita para este adaptador. El entrenamiento con layer streaming alcanzo un pico de 5.052 MiB asignados y 5.216 MiB reservados en GPU. El control con el base NF4 residente uso 20.127 MiB asignados y 24.236 MiB reservados.
- **GPU recomendadas**: para el base en BF16 se requiere hardware de clase A100/H100 o multiples GPUs; para el base cuantizado en 4 bits, una GPU de 24 GB (RTX 3090, RTX 4090, A10, L4) es suficiente segun las guias de despliegue de Qwen3-32B consultadas.
- **GPU de consumo**: si, con el base en 4 bits cabe en GPUs de 24 GB; el adaptador en si ocupa 39,9 MB.
- **Opciones de despliegue**: PEFT + Transformers (metodo usado en la evaluacion), bitsandbytes para cuantizacion NF4; las guias publicas de Qwen3-32B mencionan Ollama, llama.cpp y LM Studio, aunque no se ha validado este adaptador concreto con esos runners.
- **Latencia y throughput**: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Banking77 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-32B-Banking77-LoRA-Soup | 32B base + 9,96M adaptador | no disponible | 82,82 % | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3-32B base (sin adaptador, NF4) | 32B | no disponible | 69,58 % | Apache 2.0 | Hugging Face |
| Control HF + PEFT (mismo recetario) | 32B base + adaptador | no disponible | 83,18 % | no disponible (no publicado) | No publicado |

No se dispone de datos de otros adaptadores o clasificadores especializados en Banking77 en la informacion proporcionada, por lo que no se incluyen comparaciones adicionales.

## Limitaciones y advertencias

- **Una sola semilla y una sola tarea**: el autor advierte que es un resultado de una unica ejecucion; no se midio la variacion entre semillas.
- **Base cuantizado**: todas las mediciones se hicieron sobre `unsloth/Qwen3-32B-bnb-4bit` en NF4; no se evaluo el adaptador sobre un base en BF16 ni sobre otras cuantizaciones.
- **Idioma**: entrenado y evaluado solo en ingles; el rendimiento en castellano u otros idiomas no esta medido y probablemente sea muy inferior.
- **Alcance cerrado**: el adaptador solo conoce las 77 intenciones de Banking77; no generaliza a dominios distintos ni a esquemas de etiquetas diferentes sin reentrenamiento.
- **Riesgo de alucinacion de etiqueta**: aunque el 99,97 % de las salidas son etiquetas validas, un 0,03 % no lo son; en produccion conviene validar la salida contra el conjunto de 77 etiquetas.
- **Sesgos**: no se documenta ningun analisis de sesgos por genero, origen o tipo de cliente; el dataset Banking77 tiene una distribucion de intenciones concreta que puede no reflejar la de un banco real.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-32B tiene sus propios terminos que deben revisarse por separado.
- **Adopcion nula**: 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad ni terceros independientes.
- **Entrenamiento parcialmente documentado**: la model card se corta en la descripcion de los shims del lanzador, por lo que algunos detalles del pipeline de entrenamiento no estan disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AlpamysSigmaaaa/Qwen3-32B-Banking77-LoRA-Soup
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Checkpoint base cuantizado usado en la evaluacion: https://huggingface.co/unsloth/Qwen3-32B-bnb-4bit
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Paper de Banking77 (arXiv:2003.04807): https://arxiv.org/abs/2003.04807
- Repositorio de Soup (herramienta de entrenamiento con layer streaming): https://github.com/MakazhanAlpamys/Soup
- Guia de despliegue local de Qwen3-32B en 24 GB: https://baeseokjae.github.io/posts/qwen-3-32b-local-guide-2026/
- Tutorial de despliegue de Qwen3-32B en hardware local: https://aiindigo.com/tutorials/getting-started-with-qwen3-32b-enterprise-grade-inference-on-local-hardware
