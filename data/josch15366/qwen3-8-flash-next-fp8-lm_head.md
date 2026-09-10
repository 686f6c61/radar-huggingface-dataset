# josch15366/Qwen3.8-Flash-Next-FP8-lm_head

## Resumen

Este repositorio no contiene un modelo, sino una pieza de un checkpoint: un unico tensor, el `lm_head` de Qwen3.8-Flash-Next, cuantizado a FP8 por bloques (E4M3) con escalas F32. Se trata de un artefacto de posentrenamiento generado con la libreria Model Optimizer (NVIDIA ModelOpt) por el usuario josch15366, publicado como checkpoint parcial de 0,6 GB que se injerta sobre un checkpoint BF16 intacto de Qwen3.8-Flash-Next. El tensor tiene forma (248320, 2560) y 606,2 MiB, acompanado de su escala inversa de forma (1940, 20), lo que corresponde a bloques de 128x128.

El problema que resuelve es de infraestructura, no de modelado. En todos los checkpoints publicados para GPU de este modelo, el `lm_head` permanece en BF16; solo la via MLX/Apple lo cuantiza. Tres limitaciones independientes de vLLM lo impiden: el modelo nunca pasa `quant_config` a `ParallelLMHead`, la lista `ignore` de `config.json` contiene `lm_head`, y el cargador de pesos de vocabulario asume que la forma de salida coincide con `org_vocab_size`, algo cierto para `weight` pero falso para su companera de escalas. Se necesita, por tanto, un vLLM parcheado.

La relevancia practica esta en su interaccion con la decodificacion especulativa. Bajo MTP (k=2) el `lm_head` se evalua una vez por token borrador mas una vez para verificacion, de modo que esta aproximadamente tres veces por paso en la ruta critica. Reducir a la mitad su coste rinde mas en ese escenario: +24 % a concurrencia 1 y +20 % a concurrencia 16, y convierte la especulacion en ganancia neta a c=16. No se observa coste de calidad medible (NLL/token 0,9687 -> 0,9628, signos mixtos en 14 fragmentos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para este artefacto; hereda la del modelo base Qwen/Qwen3.8-Flash-Next (no detallada en la informacion disponible) |
| Parametros totales | 635.699.200 en el tensor `lm_head.weight` (248320 x 2560); no es un modelo completo |
| Parametros activos | No aplica (no es un modelo MoE; artefacto de un solo tensor) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 E4M3 por bloques (`F8_E4M3`) con escalas inversas F32 (`weight_scale_inv`), bloque 128x128 |
| Idiomas soportados | No disponible (la evaluacion uso prosa en aleman y frances, pero no se declara soporte de idiomas) |
| Licencia | other |
| Formato de pesos | safetensors (checkpoint parcial): `lm_head.weight` F8_E4M3 (248320, 2560), 606,2 MiB; `lm_head.weight_scale_inv` F32 (1940, 20), 0,1 MiB |
| Tamano del repositorio | 0,6 GB |
| Libreria | Model Optimizer (NVIDIA ModelOpt) |
| Modelo base | Qwen/Qwen3.8-Flash-Next |
| Hash de referencia del `lm_head` BF16 origen | sha256 `40bddd25d0d94a128ab08280faad39cfc3ee3064252761269115f544722607c9` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento en este artefacto. Es una cuantizacion posentrenamiento de un unico tensor, aplicada con Model Optimizer sobre el `lm_head` BF16 de un checkpoint concreto de Qwen3.8-Flash-Next. La cuantizacion es blockwise FP8 en formato E4M3: la matriz de 248320 x 2560 se divide en una rejilla de 1940 x 20 bloques de 128x128, y cada bloque lleva su propia escala inversa en F32. El resultado ocupa 606,2 MiB frente a los aproximadamente 1,2 GiB del tensor BF16 original, y el modelo de ancho de banda predecia alrededor de un +10 % de velocidad por eliminar 0,64 GB de lectura por token; la medicion dio +11 %.

La innovacion tecnica no es el esquema de cuantizacion, sino la viabilidad de aplicarlo a esta capa concreta. Para cargarlo hace falta parchear vLLM: hay dos puntos de construccion de `ParallelLMHead` (`model` y `mtp.py`), y ambos deben recibir el `quant_config`; ademas, el cargador de vocabulario debe aceptar el tensor de escalas, que no tiene la forma de `org_vocab_size`. El parche esta limitado deliberadamente a TP=1: por encima de TP=1 la escala requeriria reparto en espacio de bloques (`rows // block_n`) y un reparto silenciosamente incorrecto produciria logits erroneos en lugar de un error, por lo que se lanza `NotImplementedError`. La regla general que documenta el autor es que un ajuste de cuantizacion compone con la especulacion cuando la capa se evalua por token borrador, y compite con ella cuando la capa se lee una vez por paso; en la misma maquina, cuantizar las proyecciones densas redujo el beneficio de MTP del +67 % al +23 % y lo torno perdida neta a partir de c≈4.

## Capacidades

- Este repositorio no aporta capacidades nuevas al modelo. Es un tensor suelto, no ejecutable por si mismo: sin un checkpoint base completo y un vLLM parcheado no genera nada.
- Sobre un checkpoint compatible, la unica capacidad anadida es velocidad de decodificacion: +12,5 % en codigo, +10,5 % en factual y +8,1 % en aleman, medido sin especulacion.
- Con MTP (k=2) activado: 29,2 -> 36,3 tok/s a c=1 (+24 %) y 139,6 -> 167,8 tok/s a c=16 (+20 %), segun las mediciones del autor.
- Convierte la especulacion de perdida neta a ganancia neta a c=16 (156,0 tok/s sin MTP frente a 167,8 con FP8 + MTP).
- No altera la tasa de aceptacion del borrador: longitud media aceptada 2,21 frente a 2,15.
- No modifica la calidad medible: NLL/token 0,9687 -> 0,9628 (−0,60 %) y 10/10 tareas superadas en ambos casos.
- El resto de capacidades (generacion de texto, razonamiento, codigo, tool calling, agentes, multilingue) dependen integramente de Qwen3.8-Flash-Next y no estan documentadas en la informacion disponible.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next con decodificacion especulativa: es el escenario donde el artefacto rinde mas, porque el `lm_head` se evalua aproximadamente tres veces por paso bajo MTP; activar MTP junto con este cabezal pasa de 139,6 a 167,8 tok/s a c=16.
- Servicio de chat interactivo en nodo unico: a concurrencia 1, el caso tipico de un asistente conversacional con usuario humano esperando, la mejora es de 23,2 a 26,1 tok/s en cargas de codigo y de 23,7 a 26,2 en factual.
- Inferencia en DGX Spark con memoria unificada de 128 GB: el artefacto encaja en el perfil de memoria de la maquina de referencia y reduce el trafico de lectura por token en 0,64 GB, que es el cuello de botella en este tipo de equipo.
- Servicio por lotes con throughput alto: a c=16 y sin especulacion el cabezal FP8 aporta entre un 8 % y un 12 % segun dominio, y con MTP hasta un 20 %, lo que se traduce directamente en coste por token servido.
- Investigacion sobre cuantizacion de la capa de salida: el repositorio documenta explicitamente por que FP8 funciona y NVFP4 no en esta capa (en el Qwen3.8-27B hermano, un cabezal NVFP4 dio un NLL un 2,4 % peor en 8 de 8 fragmentos y se descarto), lo que sirve como punto de partida para experimentos propios.
- Reproduccion y auditoria de medidas: las notas publicas incluyen metodo, NLL emparejado sobre 14 fragmentos y 646 tokens, y el desglose por signos (nueve fragmentos mejoran, cinco empeoran), de modo que un tercero puede replicar el protocolo con su propio hardware.
- Plantilla para parchear vLLM: los tres bloqueos identificados (falta de `quant_config`, lista `ignore` de `config.json`, asercion de forma en el cargador de vocabulario) y los dos puntos de construccion de `ParallelLMHead` son reutilizables para cuantizar cabezales de otros modelos con vocabulario de gran tamano.
- Validacion de compatibilidad en pipelines internos: antes de adoptarlo, el propio autor publica un checker y un sha256 para verificar que el `lm_head` BF16 del checkpoint destino es identico al de origen.

## Benchmarks y rendimiento

Mediciones publicadas por el autor en la model card, sin especulacion salvo donde se indica:

| Metrica | Cabezal BF16 | Cabezal FP8 | Delta |
|---|---:|---:|---:|
| Decodificacion, codigo (tok/s) | 23,2 | 26,1 | +12,5 % |
| Decodificacion, factual (tok/s) | 23,7 | 26,2 | +10,5 % |
| Decodificacion, aleman (tok/s) | 23,5 | 25,4 | +8,1 % |
| NLL por token | 0,9687 | 0,9628 | −0,60 % |
| Tareas superadas | 10/10 | 10/10 | sin cambio |

| Escenario con MTP (k=2) | Cabezal BF16 | Cabezal FP8 | Delta |
|---|---:|---:|---:|
| Throughput a c=1 (tok/s) | 29,2 | 36,3 | +24 % |
| Throughput a c=16 (tok/s) | 139,6 | 167,8 | +20 % |
| Referencia a c=16 sin MTP (tok/s) | 156,0 | — | — |

Contexto metodologico: el NLL emparejado se midio sobre 14 fragmentos y 646 tokens de prosa, codigo, aleman, frances y texto tecnico reservados; nueve fragmentos mejoraron y cinco empeoraron, por lo que el autor lo reporta como «sin coste medible», no como mejora. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM adicional: 606,2 MiB por el tensor FP8 mas 0,1 MiB por la escala, frente a los aproximadamente 1,2 GiB del `lm_head` BF16 que sustituye.
- Espacio en disco durante la instalacion: hay que reempaquetar el shard que contenia el `lm_head` original si este comparte archivo con otros tensores; en el build de RadixArk ese shard alberga 169 tensores mas y el reempaquetado escribe unos 2,3 GiB.
- Hardware de referencia de las mediciones: un unico DGX Spark con 128 GB de memoria, con el objetivo declarado de comprobar que esquemas de cuantizacion caben en ese presupuesto.
- GPU recomendadas: no disponible. La informacion proporcionada solo cubre DGX Spark y no publica cifras para A100, H100, RTX 4090 u otras.
- Compatibilidad con GPU de consumo: no disponible; no se aportan datos al respecto.
- Opciones de despliegue: vLLM, obligatoriamente parcheado. No existe ningun flag de configuracion que permita a un vLLM sin parchear cargar el tensor. Hay que parchear los dos puntos de construccion de `ParallelLMHead`, incluido el de `mtp.py` si se activa la especulacion, o el arranque falla con `no module or parameter named 'lm_head.weight_scale_inv'`.
- Paralelismo: TP=1 unicamente. Con TP>1 el parche lanza `NotImplementedError` en lugar de repartir la escala de forma incorrecta.
- Latencia y throughput: ver la tabla de benchmarks. La mejora medida es de +11 % sin especulacion y de +24 % (c=1) y +20 % (c=16) con MTP k=2 sobre la maquina de referencia.

## Comparativa con modelos similares

No se dispone de modelos comparables en sentido estricto: se trata de un artefacto de un solo tensor, no de un modelo. La comparacion relevante es entre variantes del mismo `lm_head`:

| Variante | Formato del cabezal | Tamano | Rendimiento observado | Adopcion |
|---|---|---|---|---|
| Base publicada en GPU | BF16 | ~1,2 GiB | Referencia (23,2 tok/s en codigo, sin especulacion) | Estado en los diez checkpoints GPU verificados |
| Este repositorio | FP8 E4M3 blockwise 128x128 | 606,2 MiB | +8 % a +12,5 % sin especulacion; +24 % / +20 % con MTP | Publicado; requiere vLLM parcheado, TP=1 |
| Cabezal NVFP4 (Qwen3.8-27B, modelo hermano) | NVFP4 | No disponible | NLL un 2,4 % peor en 8 de 8 fragmentos | Rechazado para produccion por el autor |
| Cabezal cuantizado en la via MLX/Apple | No disponible | No disponible | No disponible | Unica via que ya cuantizaba esta capa |

La conclusion que el autor extrae de la comparacion es que en esta capa decide el formato, no el ancho de bits: FP8 resulta neutro en calidad mientras NVFP4 degrada.

## Limitaciones y advertencias

- No es un modelo utilizable por si solo. Sin un checkpoint base completo y un vLLM parcheado no produce inferencia alguna.
- La licencia es `other`. No se detallan en la informacion proporcionada las condiciones exactas, por lo que la aptitud para uso comercial debe verificarse antes de cualquier despliegue en produccion.
- Compatibilidad estricta: el cabezal se cuantizo a partir de un unico `lm_head` BF16. Un checkpoint con un cabezal distinto producira logits erroneos, no un error. Hay que comprobar el sha256 (`40bddd25d0d94a128ab08280faad39cfc3ee3064252761269115f544722607c9`) con el checker publicado en COMPAT.md.
- La verificacion de ese hash cubre solo dos checkpoints y una fecha (2026-09-10): el BF16 padre de Qwen y el build NVFP4 de RadixArk. No es un censo del ecosistema.
- Requiere mantenimiento de un parche propio sobre vLLM. Cada actualizacion de la libreria puede romperlo, y el fallo se manifiesta como error de arranque o, en el peor caso, como logits incorrectos.
- Solo TP=1. No es desplegable en configuraciones tensorialmente paralelas sin trabajo adicional de reparto en espacio de bloques.
- Riesgo de tensor duplicado silencioso: si otro shard referenciado sigue conteniendo un `lm_head`, el ganador se decide por `_natural_sort_key` sin emitir ningun error.
- El beneficio de calidad es neutro, no positivo: la mejora de NLL de −0,60 % tiene signos mixtos entre fragmentos y el autor la atribuye a ruido. No debe presentarse como mejora de calidad.
- La evidencia estadistica es limitada: 14 fragmentos y 646 tokens, en un unico equipo y con una unica configuracion de cuantizacion.
- El repositorio tiene 0 descargas y 0 likes, y no lo ha validado un tercero independiente.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los resultados obtenidos corresponden a imagenes de la catedral de Ratisbona y no guardan relacion con el artefacto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/josch15366/Qwen3.8-Flash-Next-FP8-lm_head
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Notas y metodologia (GitHub): https://github.com/jschmied/qwen38-flash-next-gb10
- Escrito especifico sobre esta capa: https://github.com/jschmied/qwen38-flash-next-gb10/blob/main/notes/quantizing-lm-head.md
- Verificacion de compatibilidad (COMPAT.md): https://huggingface.co/josch15366/Qwen3.8-Flash-Next-FP8-lm_head/blob/main/COMPAT.md
- Mapa de cuantizacion Flash-Next Quant Map: https://claude.ai/code/artifact/3534a530-5e94-4ce2-abac-f1c70ee204e3
- Resultados de busqueda web: sin enlaces relevantes; las busquedas devolvieron unicamente contenido grafico sin relacion con el modelo.
