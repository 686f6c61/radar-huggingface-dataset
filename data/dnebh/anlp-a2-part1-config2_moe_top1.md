# dnebh/anlp-a2-part1-config2_moe_top1

## Resumen

`dnebh/anlp-a2-part1-config2_moe_top1` es un transformer decoder-only con arquitectura de mezcla de expertos (MoE) desarrollado como entregable academico para la asignatura Advanced Natural Language Processing (ANLP), asignatura 2, parte 1. El modelo esta disenado especificamente para traduccion automatica en dos direcciones: vietnamita a ingles (vi→en) y japones a ingles (ja→en), y se entreno sobre el corpus `belumind/en-vi-ja-curated-500k-triplets`.

Se trata de un modelo muy pequeno (33.489.920 parametros totales reportados por safetensors, de los cuales 20.800.512 estan activos por token gracias al enrutamiento MoE top-1). Se entreno durante una unica epoca con un presupuesto de 39.234.273 tokens y un tiempo de entrenamiento de aproximadamente 8.280 segundos (2,3 horas). Alcanza una perplejidad de validacion de 5,62 y un BLEU de prueba de 30,76 en la tarea de traduccion.

Su relevancia es fundamentalmente academica y comparativa: forma parte de una familia de configuraciones disenadas para estudiar el efecto de distintas variantes de capas feed-forward (MoE top-1, MoE compartido, densas, etc.) bajo un mismo presupuesto de tokens. No es un modelo orientado a produccion ni a uso general, y carece de licencia declarada, idiomas documentados formalmente y pipeline definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture of Experts (MoE), enrutamiento top-1 |
| Parametros totales | 33.358.848 (segun config) / 33.489.920 (segun safetensors) |
| Parametros activos | 20.800.512 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | traduccion vi→en y ja→en (no se documentan otros) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas feed-forward sustituidas por un bloque de mezcla de expertos con enrutamiento top-1, tal como indica el nombre de configuracion `config2_moe_top1`. La distincion clave es que solo un experto se activa por token, de ahi que los parametros activos (20.800.512) sean inferiores a los totales (33.358.848). La diferencia entre el recuento de parametros del config y el reportado por safetensors es pequena y probablemente se debe a parametros no contabilizados en la configuracion (por ejemplo, embeddings o buffers).

El entrenamiento se realizo sobre el dataset `belumind/en-vi-ja-curated-500k-triplets`, con un presupuesto total de 39.234.273 tokens consumidos en una sola epoca (tokens_per_epoch = tokens_consumed = 39.234.273). El tiempo total de entrenamiento fue de unos 8.280 segundos. No se documenta en la informacion disponible si hubo fases de RLHF, DPO, ajuste por instrucciones u otras tecnicas de alineacion; dado el caracter academico y la tarea de traduccion, lo mas probable es que el entrenamiento fuera puramente supervisado sobre pares de traduccion, pero este punto no puede confirmarse con los datos aportados. La carga del modelo requiere una funcion personalizada del repositorio de la asignatura, `src.part1.hub.load_exported_model(<folder>)`, lo que implica que no es directamente compatible con `transformers` sin ese codigo auxiliar.

## Capacidades

- Traduccion automatica vietnamita a ingles (vi→en).
- Traduccion automatica japones a ingles (ja→en).
- Generacion de texto condicionada por el par de traduccion (decoder-only con prompt de traduccion).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta soporte multilingue mas alla de las direcciones de traduccion indicadas.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Traduccion de documentacion tecnica vi→en: el modelo puede emplearse para traducir manuales o notas tecnicas redactadas en vietnamita, aprovechando que el entrenamiento se realizo sobre tripletas curadas del dominio en-vi-ja.
- Traduccion de contenido japones a ingles en entornos de localizacion: util para preprocesar textos japoneses y obtener versiones en ingles antes de una revision humana, dado su BLEU de prueba de 30,76.
- Generacion de subtitulos traducidos: integrado en un pipeline que segmenta subtitulos en japones o vietnamita y los traduce linea a linea a ingles.
- Prototipado academico de variantes feed-forward: sirve como configuracion de referencia (MoE top-1) para comparar frente a otras variantes del mismo trabajo (MoE compartido, densas) bajo presupuesto de tokens identico.
- Evaluacion de tecnicas de enrutamiento MoE: el modelo permite estudiar el comportamiento de un enrutador top-1 con 33,4 M de parametros totales y 20,8 M activos en una tarea controlada.
- Traduccion asistida de bajo coste en CPU: por su tamano reducido (repo de 0,1 GB), puede ejecutarse en entornos sin GPU para traducciones por lotes de bajo volumen.
- Generacion de datos sinteticos de traduccion: puede usarse para producir pares vi-en o ja-en preliminares que luego se filtren y se incorporen a un corpus mayor.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad de validacion (val_ppl) | 5,62208636138546 |
| Perplejidad de prueba (test_ppl) | 5,628251814486935 |
| BLEU de prueba (test_bleu) | 30,761823977845193 |
| Epocas | 1 |
| Presupuesto de tokens | 39.234.273 |
| Tiempo de entrenamiento | ~8.280 s (2,3 h) |

No se han publicado resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; los unicos datos de rendimiento son la perplejidad y el BLEU de la tarea de traduccion.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 134 MB de pesos; en fp16/bf16, unos 67 MB; en int8, unos 33 MB. Estas cifras son estimaciones calculadas a partir del numero de parametros y no proceden de la documentacion del modelo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni similar. Una RTX 3060, RTX 4060 o incluso una GTX 1650 serian mas que suficientes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en GPUs integradas.
- Ejecucion en CPU: viable por el reducido tamano del modelo.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. La carga requiere la funcion `src.part1.hub.load_exported_model(<folder>)` del repositorio de la asignatura, por lo que el despliegue esta ligado a ese codigo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dnebh/anlp-a2-part1-config2_moe_top1 | 33,4 M (20,8 M activos) | vi→en, ja→en | no disponible | no disponible | HuggingFace |
| orangebreak/anlp-a2-part1-moe-30M | ~30 M | vi→en, ja→en | no disponible | no disponible | HuggingFace |
| siddarthg44/anlp-a2-p1-moe_shared | no disponible | vi→en, ja→en | no disponible | no disponible | HuggingFace |

Los tres modelos pertenecen al mismo trabajo academico (Task 1 de Advanced NLP Assignment 2) y comparten el mismo presupuesto de 30.000.128 tokens segun la descripcion del modelo de `orangebreak`, ligeramente distinto al presupuesto de 39.234.273 tokens reportado por este modelo. Las diferencias concretas de rendimiento entre ellos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de caracter academico: no esta pensado para uso en produccion ni para tareas distintas de la traduccion vi→en y ja→en.
- Sin licencia declarada: no puede asumirse permiso de uso comercial; la ausencia de licencia implica incertidumbre legal para cualquier despliegue.
- Riesgo de alucinacion y de traducciones inexactas: con solo 39,2 M de tokens de entrenamiento y una epoca, la cobertura lexica y de dominios es limitada.
- Idiomas restringidos: no se documenta soporte de otros idiomas distintos del vietnamita y el japones como origen, ni del ingles como destino alternativo.
- Longitud de contexto no documentada: se desconoce la ventana maxima soportada, lo que dificulta su uso en documentos largos.
- Dependencia de codigo auxiliar: la carga requiere `src.part1.hub.load_exported_model`, lo que complica la integracion con herramientas estandar como `transformers`, vLLM o llama.cpp.
- Inconsistencia en el recuento de parametros: el config reporta 33.358.848 y safetensors 33.489.920; conviene verificar cual es el valor correcto antes de cualquier uso.
- Sin datos de sesgo: no se ha publicado ningun analisis de sesgos ni de comportamientos problematicos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/dnebh/anlp-a2-part1-config2_moe_top1
- Run de Weights & Biases: https://wandb.ai/dnebhrajani-v/anlp-a2-part1/runs/ktd6gw7m
- Modelo comparable (orangebreak, mismo trabajo): https://huggingface.co/orangebreak/anlp-a2-part1-moe-30M
- Modelo comparable (siddarthg44, mismo trabajo): https://huggingface.co/siddarthg44/anlp-a2-p1-moe_shared
- Dataset de entrenamiento citado: belumind/en-vi-ja-curated-500k-triplets (referencia en la model card; no se aporta URL directa)
