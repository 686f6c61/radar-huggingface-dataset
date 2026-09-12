# raj-hitpromo/hit-promo-reasoner

## Resumen

`raj-hitpromo/hit-promo-reasoner` es un modelo de lenguaje de 3.836.021.760 parametros (unos 3,84 mil millones) publicado por el usuario `raj-hitpromo` en HuggingFace. Se trata de un ajuste QLoRA sobre `microsoft/Phi-4-mini-reasoning` cuyos adaptadores se han fusionado en un unico juego de pesos (etiqueta `merged`), de ahi que el repositorio contenga el modelo completo en formato safetensors (7,7 GB) y no un adaptador separado. La arquitectura es un transformer decoder-only denso de la familia phi3, orientado a generacion de texto y razonamiento.

El modelo resuelve un problema muy concreto: las preguntas que un comercial o un distribuidor hace mientras presupuesta un pedido de producto promocional (cuanto cuesta una tirada de 2.500 unidades, que tamano tiene el area de estampacion, si se puede cumplir un plazo de 14 dias, si un pedido por debajo del minimo es admisible). No funciona como buscador de catalogo autonomo: el pipeline debe recuperar las filas de producto y los fragmentos de politica pertinentes e inyectarlos en el contexto, y el modelo razona sobre ellos antes de responder.

Es relevante ahora porque ejemplifica el patron de especializacion vertical mediante QLoRA sobre un modelo base abierto con licencia MIT, con un cuidado metodologico poco habitual en ajustes de nicho: particionado agrupado por `source_id` para evitar fuga de informacion entre variantes del mismo producto y generacion de ejemplos solo cuando la respuesta era derivable del registro fuente. El contrapunto es que el modelo tiene 0 descargas y 0 likes, esta marcado con `inference: false` (sin inferencia alojada en HuggingFace) y su ficha no declara idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia phi3 (tag `phi3`) |
| Parametros totales | 3.836.021.760 (3,84 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso secuencias de hasta 4.096 tokens |
| Tipos de cuantizacion | El repositorio publica pesos safetensors fusionados; no incluye GGUF. Cuantizable a 8 y 4 bits (bitsandbytes nf4, GPTQ/AWQ, GGUF) con herramientas estandar |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (library `transformers`); tamano del repositorio 7,7 GB |
| Modelo base | `microsoft/Phi-4-mini-reasoning` |
| Metodo de ajuste | QLoRA (base congelada en nf4) con fusion posterior del adaptador |
| Pipeline declarado | `text-generation` |
| Inferencia alojada | No (`inference: false`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 3,84B de parametros de la familia Phi-4-mini (tag `phi3`). Sobre el modelo base congelado en precision nf4 se aplico un adaptador QLoRA con rango 32, alpha 64 y dropout 0,05, dirigido a los modulos `qkv_proj`, `o_proj`, `gate_up_proj` y `down_proj`. El entrenamiento fue de una sola epoca, con tasa de aprendizaje 0,0001, lote efectivo de 16 y longitud maxima de secuencia de 4.096 tokens. El formato de razonamiento empleado es `think_tags`, coherente con el modelo base de razonamiento. Los adaptadores se fusionaron despues en los pesos base, de modo que el artefacto publicado es un modelo autonomo. No se menciona RLHF, DPO ni ninguna etapa de alineacion posterior: el ajuste es exclusivamente supervisado (SFT) sobre 15.779 ejemplos.

Los datos proceden del feed de producto y la base de conocimiento de HIT Promotional Products. Las particiones estan agrupadas por `source_id` y no muestreadas por fila, de forma que todas las variantes de color de un mismo estilo caen en el mismo split y una puntuacion de validacion no puede inflarse por haber visto el mismo producto en entrenamiento bajo otro codigo de variante. La distribucion por tarea es la siguiente:

| Tarea | Ejemplos | Que ensena |
|---|---|---|
| `quantity_pricing` | 4.000 | Aritmetica de cantidades y presupuesto entre tramos de precio |
| `product_qa` | 4.000 | Consultas de un solo campo con base documental (area de estampacion, colores, origen, MOQ) |
| `spec_extraction` | 3.999 | Conversion de texto libre a JSON de especificaciones estructurado |
| `policy_lookup` | 1.666 | Plazos de entrega, minimos, pedidos por debajo del minimo, cumplimiento normativo, devoluciones |
| `decoration_advice` | 1.079 | Que metodos de decoracion admite un producto y su arte |
| `comparison` | 869 | Comparativa A frente a B para un caso de uso declarado |
| `product_recommendation` | 128 | Entrada de brief y salida de lista corta ordenada con justificacion |
| `kb_qa` | 38 | Pregunta-respuesta con base documental sobre la base de conocimiento |

| Split | Ejemplos | Grupos fuente | Media de caracteres por respuesta |
|---|---|---|---|
| train | 14.201 | 3.570 | 607,9 |
| val | 790 | 188 | 620,9 |
| test | 788 | 208 | 581,0 |

La perdida de validacion descendio en cada checkpoint (0,18177 en el paso 100 hasta 0,12835 en el paso 887) y la precision por token alcanzo el 96,52 %. El mejor checkpoint fue el ultimo, sin senales de sobreajuste, aunque el autor indica que el modelo seguia mejorando cuando termino la epoca.

## Capacidades

- Generacion de texto con razonamiento previo a la respuesta, en formato `think_tags`.
- Aritmetica de tramos de precio por cantidad: calculo de importe para una tirada dada a partir de los precios de catalogo incluidos en el contexto.
- Respuesta a consultas de un unico campo con base documental: area de estampacion, colores disponibles, pais de origen, cantidad minima de pedido (MOQ).
- Extraccion de especificaciones: conversion de texto libre a JSON estructurado.
- Consulta de politicas internas: plazos de entrega, minimos, pedidos por debajo del minimo, cumplimiento, devoluciones.
- Asesoramiento sobre decoracion: que metodos de decoracion admite un producto y su arte.
- Comparativa entre dos productos para un caso de uso declarado.
- Recomendacion de producto: dado un brief, devuelve una lista corta ordenada con motivos.
- Pregunta-respuesta con base documental sobre la base de conocimiento interna (con solo 38 ejemplos de entrenamiento, es la tarea con menor cobertura).
- Capacidad de abstenerse: si se pregunta por una referencia que no aparece en el prompt, el modelo esta entrenado para decir que no dispone de ese registro.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni multimodalidad en la informacion proporcionada.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente interno de presupuestacion para comerciales: el modelo recibe las filas de catalogo recuperadas y calcula el importe para una cantidad concreta desglosando la aritmetica entre tramos. Es adecuado porque la tarea `quantity_pricing` es la de mayor volumen en el entrenamiento (4.000 ejemplos).
- Extraccion de fichas de producto a JSON: convertir descripciones en texto libre en un esquema de especificaciones estructurado para alimentar un PIM o una base de datos. La tarea `spec_extraction` (3.999 ejemplos) esta disenada exactamente para esto.
- Soporte a atención al cliente sobre políticas de pedido: responde sobre plazos, minimos, pedidos por debajo del minimo mínimo y devoluciones a partir de los fragmentos de politica inyectados. Reduce las consultas internas repetitivas al equipo de cuentas.
- Motor de recomendacion en el configurador de un distribuidor: a partir de un brief (sector, presupuesto, plazo), devuelve una lista corta ordenada con justificacion. Es la tarea con menos ejemplos (128), por lo que conviene validarla con datos propios antes de exponerla al cliente final.
- Comparador de productos en la web de un distribuidor: dada una pareja de referencias y un caso de uso declarado, genera la comparativa campo a campo usando los registros del contexto.
- Asesor de decoracion en preventa: dado un producto y un arte, indica que metodos de decoracion encajan, apoyandose en los 1.079 ejemplos de `decoration_advice`.
- Componente de razonamiento en un RAG de catalogo: el patron de uso previsto es recuperar filas de producto y fragmentos de politica con un buscador externo, insertarlos en el prompt y dejar que el modelo haga la aritmetica y la sintesis. El modelo no sustituye al feed en vivo.
- Normalizacion de catalogos de proveedores: usar `spec_extraction` y `product_qa` para homogeneizar fichas de terceros antes de cargarlas en el sistema de HIT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, ni comparacion con modelos de referencia. Lo unico aportado son las metricas del propio entrenamiento sobre la particion de validacion retenida:

| Paso | Perdida de validacion | Precision por token |
|---|---|---|
| 100 | 0,18177 | 95,48 % |
| 200 | 0,15792 | 95,93 % |
| 300 | 0,14828 | 96,15 % |
| 400 | 0,14368 | 96,19 % |
| 500 | 0,13787 | 96,31 % |
| 600 | 0,13343 | 96,40 % |
| 700 | 0,12974 | 96,50 % |
| 800 | 0,12855 | 96,51 % |
| 887 | 0,12835 | 96,52 % |

Estas cifras miden el ajuste al dominio de HIT, no la calidad general del modelo, y no son comparables con benchmarks publicos de terceros.

## Requisitos de hardware

- Pesos en bfloat16: aproximadamente 7,7 GB (el repositorio completo ocupa 7,7 GB), mas cache KV y activaciones.
- Cuantizacion a 8 bits: en torno a 4 GB de pesos. Cuantizacion a 4 bits (nf4, GPTQ o AWQ): en torno a 2,5 GB de pesos.
- Cabe en GPU de consumo: si. En 4 bits cabe en tarjetas de 8 GB; en 8 bits, en 10-12 GB; en bfloat16, en 12 GB o mas con contexto moderado y lotes pequenos (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 3090, RTX 4090).
- GPU de centro de datos recomendadas: A100 40 GB u 80 GB, H100, L40S, A10G, L4. Para un modelo de 3,84B son sobredimensionadas salvo que se busque throughput muy alto o lotes grandes.
- Opciones de despliegue: `transformers` (ruta indicada por el autor con `dtype="bfloat16"` y `device_map="auto"`), vLLM, TGI y SGLang para servicio con lotes; llama.cpp y Ollama requieren convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- La inferencia alojada en HuggingFace esta desactivada (`inference: false`), por lo que hay que desplegarlo en infraestructura propia.
- La ruta de servicio debe aplicar el `SYSTEM_PROMPT` del proyecto (referenciado en `hit_model/data/templates.py`), que contiene las reglas de precios NET y de anclaje documental contra las que se entreno el modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `raj-hitpromo/hit-promo-reasoner` | 3,84B | No disponible en la informacion proporcionada (entrenado a 4.096 tokens) | MIT | HuggingFace, 0 descargas, `inference: false` | Ajuste de dominio sobre catalogo y politicas de HIT Promotional Products |
| `microsoft/Phi-4-mini-reasoning` | 3,84B (mismo modelo base) | No disponible en la informacion proporcionada | MIT | HuggingFace | Modelo base de razonamiento general; no conoce el catalogo ni las politicas de HIT |
| Otros modelos de 3-4B de la misma categoria | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparacion relevante es contra el modelo base: este ajuste no anade parametros, sino conocimiento de dominio (catalogo, tramos de precio, politicas de pedido) y un comportamiento de abtencion cuando no hay registro en el contexto. Frente a modelos generalistas del mismo tamano, la ventaja es la especializacion; la desventaja es que no hay evidencia publica de su rendimiento en tareas generales ni benchmarks que permitan situarlo.

## Limitaciones y advertencias

- Riesgo de error aritmetico: el modelo muestra su cadena de razonamiento, pero una cadena fluida puede terminar en una cifra incorrecta. Cualquier importe que vaya a un presupuesto debe cotejarse contra el feed en vivo.
- El catalogo cambia: precios, plazos y stock se actualizan a diario y los pesos son una instantanea. El diseno asume recuperacion externa en cada consulta, no memoria del modelo.
- El modelo no debe usarse para fijar el precio de venta del distribuidor. Las cifras de catalogo son precios NET/EQP (lo que el distribuidor paga a HIT); el margen y el transporte no estan en los datos.
- Dependencia del contexto: sin las filas de producto y los fragmentos de politica en el prompt, el modelo esta entrenado para responder que no dispone del registro. No es un buscador de catalogo autonomo.
- Sesgos conocidos: no disponible. La ficha no documenta evaluaciones de sesgo.
- Idiomas soportados: no disponible. Los datos de entrenamiento proceden de un catalogo y una base de conocimiento en ingles, por lo que el rendimiento fuera de ese idioma no esta garantizado.
- Cobertura desigual por tarea: `kb_qa` tiene solo 38 ejemplos y `product_recommendation` 128, frente a los 4.000 de `quantity_pricing` y `product_qa`. El rendimiento en las tareas con menos datos es previsiblemente mas fragil.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No se documentan restricciones adicionales, pero conviene revisar la licencia del modelo base y de los datos de catalogo, que no se publican.
- El modelo se publico con 0 descargas y 0 likes y sin benchmarks de terceros: no hay validacion externa independiente de las afirmaciones de la ficha.
- Entrenamiento de una sola epoca con el mejor checkpoint en el paso final: el autor lo interpreta como ausencia de sobreajuste, pero tambien implica que el modelo no se entreno hasta convergencia y que no hay margen conocido de mejora por mas pasos.
- Las fechas de creacion y actualizacion del repositorio (2026-09-12) son posteriores a la fecha de la mayoria de referencias disponibles, lo que refuerza la ausencia de literatura externa sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raj-hitpromo/hit-promo-reasoner
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-reasoning
- Documentacion interna del proyecto referenciada en la ficha: `MODEL_BUILD.md` (metodo completo de construccion) y `hit_model/data/templates.py` (constante `SYSTEM_PROMPT`), dentro del propio repositorio.
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los resultados obtenidos correspondian a terminos homonimos sin relacion (British Raj, asociaciones locales de animacion juvenil en Francia y paginas de desambiguacion del termino "Raj").
