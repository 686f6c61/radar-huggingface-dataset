# siddharthmb/2026.TA.features_2026.TA.gemma2_2b_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr20000_lr_ha43539c2ed71

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un artefacto de análisis de interpretabilidad: un *feature cache* empaquetado para la librería `circuit-tracer`. Fue generado por el autor `siddharthmb` a partir de un modelo base con *transcoder adapters* (una variante de Gemma 2 2B) y contiene las activaciones de características (features) recopiladas mediante la herramienta `analysis.features.collect_feature_activations`. Su propósito es servir como entrada para el frontend de `circuit-tracer`, que lee los ficheros empaquetados `features/index.json.gz` y `features/layer_N.bin` para visualizar y rastrear circuitos internos del modelo.

El artefacto se construyó sobre el modelo `siddharthmb/2026.TA.gemma2_2b_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr20000_lr8e-04_bs4_sl14793860`, que es un Gemma 2 2B con adaptadores de transcoder. La recopilación de features se realizó sobre dos conjuntos de datos: `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits` y `science-of-finetuning/fineweb-1m-sample`, con un total de 109 689 219 tokens procesados (62 706 474 de `fineweb` y 46 982 745 de `chat`). El repositorio tiene un tamaño de 2,5 GB y fue creado el 24 de agosto de 2026.

Es relevante para investigadores en interpretabilidad de modelos que trabajen con `circuit-tracer` y necesiten un *feature cache* ya empaquetado para un Gemma 2 2B con adaptadores de transcoder, evitando tener que ejecutar la recopilación de activaciones por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feature cache (activaciones de características) para circuit-tracer |
| Parametros totales | no disponible (el artefacto no es un modelo; el modelo base es Gemma 2 2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Ficheros empaquetados: `features/index.json.gz` y `features/layer_N.bin` |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino un conjunto de activaciones de características extraídas de un modelo base. El modelo base es `siddharthmb/2026.TA.gemma2_2b_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr20000_lr8e-04_bs4_sl14793860`, que según su nombre es un Gemma 2 2B con *transcoder adapters* (adaptadores de transcoder) y una configuración de entrenamiento específica (contexto 8192, regularización L1, etc.). El *feature cache* se generó con la herramienta `analysis.features.collect_feature_activations` de la librería `circuit-tracer`.

Los datos de entrada para la recopilación fueron dos conjuntos: `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits` (conversaciones de chat) y `science-of-finetuning/fineweb-1m-sample` (texto web). El total de tokens procesados fue de 109 689 219, distribuidos en 62 706 474 tokens de `fineweb` y 46 982 745 de `chat`. No se dispone de información sobre el proceso de entrenamiento del modelo base ni sobre técnicas como RLHF o DPO.

## Capacidades

- No es un modelo generativo: no genera texto, código ni respuestas.
- Almacena activaciones de características (features) de un modelo Gemma 2 2B con adaptadores de transcoder.
- Diseñado para ser consumido por el frontend de `circuit-tracer`, que lee los ficheros empaquetados para visualizar y analizar circuitos internos.
- Permite rastrear la activación de características por capa (`layer_N.bin`) y consultar el índice de features (`index.json.gz`).
- No soporta tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en interpretabilidad: usar el *feature cache* para estudiar qué características internas se activan ante diferentes entradas y cómo se propagan a través de las capas del modelo.
- Análisis de circuitos: con `circuit-tracer`, los investigadores pueden identificar subgrafos de características que median comportamientos específicos del modelo (por ejemplo, razonamiento aritmético o seguimiento de instrucciones).
- Comparación de adaptadores: al estar ligado a un modelo con *transcoder adapters*, permite comparar cómo cambian las activaciones de características frente a un Gemma 2 2B sin adaptadores.
- Reproducibilidad: al estar empaquetado, evita tener que re-ejecutar la recopilación de activaciones sobre los mismos datasets, ahorrando tiempo y recursos.
- Depuración de modelos: ayuda a localizar capas o características responsables de errores o sesgos en el comportamiento del modelo base.
- Docencia en IA explicable: sirve como material didáctico para demostrar técnicas de análisis de activaciones en modelos transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este artefacto no es un modelo de lenguaje y no tiene métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El repositorio ocupa 2,5 GB en disco.
- Para usar el *feature cache* con `circuit-tracer` se necesita una máquina capaz de cargar el modelo base (Gemma 2 2B) y los ficheros de features. Un Gemma 2 2B en FP16 requiere aproximadamente 4-5 GB de VRAM, por lo que una GPU con 8 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 3070) es suficiente para inferencia básica.
- No se requiere GPU para leer los ficheros empaquetados si solo se analizan las features sin ejecutar el modelo, aunque el frontend de `circuit-tracer` puede necesitar el modelo para ciertas visualizaciones.
- Opciones de despliegue: no aplica como modelo de inferencia; se usa como artefacto de análisis dentro del ecosistema `circuit-tracer`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han encontrado otros *feature caches* públicos comparables en la información proporcionada. Este tipo de artefacto es específico del ecosistema `circuit-tracer` y no tiene equivalentes directos en el mercado de modelos de lenguaje.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede generar texto ni responder preguntas. Intentar usarlo como tal producirá errores.
- La licencia no está especificada en la información disponible; se debe contactar al autor antes de usarlo en proyectos comerciales.
- Los datos de activaciones dependen del modelo base y de los datasets de recopilación; pueden no generalizar a otros contextos o dominios.
- El *feature cache* está ligado a una configuración específica del modelo (contexto 8192, adaptadores de transcoder, etc.); no es portable a otros modelos sin re-ejecutar la recopilación.
- No se dispone de información sobre sesgos o alucinaciones, ya que no es un modelo generativo.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación reciente y poco validado por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.features_2026.TA.gemma2_2b_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr20000_lr_ha43539c2ed71
- Modelo base: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_tc8192_decb_l1w0.001_tarbb_lb2.0_ln1_dr20000_lr8e-04_bs4_sl14793860
- Dataset de chat: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Dataset de web: https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Documentación de Gemma (Google AI): https://ai.google.dev/gemma/docs/releases
