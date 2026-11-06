# siddharthmb/2026.TA.features_2026.TA.gemma2_2b_headline_2026-10g_tc8192_decb_l1w0.0003_auxk512_h32fcbb6d3d54

## Resumen

Este repositorio no contiene un modelo generativo al uso, sino un *feature store* empaquetado (packed feature store) generado con la libreria `circuit-tracer` a partir de un adaptador de transcoder sobre Gemma 2 2B. Lo produce el usuario `siddharthmb` como parte del proyecto Transcoder Adapters, orientado al analisis de interpretabilidad mecanistica y al *diffing* de modelos de razonamiento. El artefacto recoge, para cada caracteristica (feature) que se activa en el adaptador, un registro con sus ejemplos de maxima activacion por dominio, ejemplos aleatorios, ejemplos por rango de activacion, efectos sobre logits y frecuencia de disparo.

El problema que resuelve es practico para investigadores: evita recalcular las activaciones de un transcoder cada vez que se quiere inspeccionar una feature o construir grafos de atribucion. Con este repositorio, la herramienta `analysis.attribution.graphs.build_graphs` puede leer directamente un *feature scan* y el visor `analysis.attribution.serve` puede transmitir bajo demanda los ejemplos de un nodo pulsado desde `features/index.json.gz` y `features/layer_N.bin`.

Es relevante ahora porque el proyecto Transcoder Adapters (paper arXiv 2602.20904) propone usar transcoders como adaptadores para comparar y descomponer el comportamiento de modelos de razonamiento. Este repositorio concreto es el volcado de features de uno de esos adaptadores, con 88.625.123 tokens procesados sobre dos dominios (chat y fineweb) y 119.473 de 212.992 features disparadas. El modelo base subyacente es Gemma 2 2B; el repositorio pesa 0,9 GB y no es un modelo desplegable para inferencia de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio (feature store de un adaptador de transcoder sobre Gemma 2 2B); el modelo base es un transformer Gemma 2 |
| Parametros totales | No disponible para el adaptador; el modelo base es Gemma 2 2B (2.000 millones aprox.) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens (`max_length` usado en la recoleccion) |
| Tipos de cuantizacion | No disponible (artefacto de analisis, no pesos de inferencia) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | No aplica; layout `features/index.json.gz` + `features/layer_N.bin` (packed store), con sidecars `feature_metadata.json`, `activation_histograms.npz`, `feature_annotations.json` |
| Libreria | `circuit-tracer` |
| Tamano del repo | 0,9 GB |
| Features totales | 212.992 |
| Features que dispararon | 119.473 (chat: 83.541; fineweb: 91.640) |
| Tokens procesados | 88.625.123 (chat: 39.779.886; fineweb: 48.845.237) |

## Arquitectura y entrenamiento

El repositorio es la salida de `analysis.features.collect` del proyecto transcoder-adapters (commit `03dccd28bfe1`, job Slurm `18350220` en `jagupard35.stanford.edu`, iniciado el 2026-11-06T07:53:04). Se genero a partir del adaptador `siddharthmb/2026.TA.gemma2_2b_headline_2026-10g_tc8192_decb_l1w0.0003_auxk512_ctr_fp32_tarbb_lb2_sl18197693`, que actua como fuente de features, con soporte tambien para features base de GemmaScope o de neuronas MLP.

La configuracion de recoleccion es la identidad del repositorio: `max_samples=100000`, `max_length=1024`, `top_k=20`, `domain_top_k=20`, `n_random=10`, `context_before=75`, `context_after=20` y rangos de ejemplo de activacion `0.5:1.0, 1.0:2.0, 2.0:2.5, 2.5:3.0, 3.0:4.0, 4.0:8.0`. Los datos de validacion son `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits` (dominio chat) y `science-of-finetuning/fineweb-1m-sample` (dominio fineweb). La recoleccion es idempotente: `feature_collection_config.json` se compara antes de subir nada, de modo que repetir la ejecucion con los mismos flags mapea al mismo repositorio.

La innovacion tecnica del proyecto subyacente es el uso de transcoders como adaptadores para *model diffing*: en lugar de comparar pesos, se comparan las features activadas y sus efectos sobre logits entre modelos o entre un modelo base y su version afinada. Este repositorio materializa esa comparacion en forma de cache de features consultable.

## Capacidades

- Almacenar y servir, por cada feature disparada, sus ejemplos de maxima activacion por dominio (chat y fineweb).
- Proporcionar ejemplos aleatorios (10 por feature) y ejemplos por rango de activacion para estudiar la distribucion de disparo.
- Registrar efectos sobre logits y frecuencia de disparo por feature.
- Servir como fuente de datos para grafos de atribucion via `--feature_data_path` (features del adaptador) o `--base_feature_data_path` (features base de GemmaScope).
- Permitir la lectura directa de una feature por su *cantor id* mediante `load_circuit_tracer_feature_from_hub` y `cantor_pair(layer, idx)`.
- Soportar la exploracion de la coleccion completa con el dashboard (`analysis.features.dashboard`), que lee `feature_metadata.json`, el store empaquetado, el histograma y los sidecars de anotacion.
- No ofrece generacion de texto, razonamiento, codigo, vision ni tool calling: es un artefacto de analisis, no un modelo de inferencia.

## Casos de uso

- Analisis de interpretabilidad mecanistica: cargar una feature concreta por su cantor id y revisar sus 20 mejores ejemplos por dominio para caracterizar que representa, usando los ejemplos de chat y de fineweb como contraste.
- Construccion de grafos de atribucion: pasar el repositorio como `--feature_data_path` a `analysis.attribution.graphs.build_graphs` para generar grafos que expliquen la prediccion de un prompt concreto a traves de las features del adaptador.
- Exploracion interactiva en visor: arrancar `analysis.attribution.serve` y pulsar nodos para que el visor transmita bajo demanda los ejemplos desde `features/index.json.gz` y `features/layer_N.bin`, sin recalcular activaciones.
- Estudio de diferencias entre dominios: comparar las 83.541 features activas en chat frente a las 91.640 de fineweb para identificar features especificas de conversacion o de texto web.
- Auditoria de frecuencia y efectos en logits: usar los registros de frecuencia de disparo y efectos sobre logits para priorizar que features merecen inspeccion manual o anotacion.
- Reproducibilidad de experimentos: reutilizar `feature_collection_config.json` como identidad de la coleccion para verificar que una nueva recoleccion con los mismos flags corresponde exactamente a este repositorio.
- Base para anotacion supervisada: emplear `feature_annotations.json` y `activation_histograms.npz` como punto de partida para etiquetar features y entrenar clasificadores de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye metricas de cobertura de la recoleccion, no de calidad de modelo:

| Metrica | Valor |
|---|---|
| Tokens totales procesados | 88.625.123 |
| Tokens en chat | 39.779.886 |
| Tokens en fineweb | 48.845.237 |
| Features totales | 212.992 |
| Features disparadas | 119.473 (56,1 %) |
| Features disparadas en chat | 83.541 |
| Features disparadas en fineweb | 91.640 |

## Requisitos de hardware

- VRAM para inferencia del modelo: no aplica; el repositorio no contiene pesos de un modelo generativo.
- Espacio en disco: 0,9 GB para el repositorio completo (store empaquetado y sidecars).
- Memoria RAM: suficiente para cargar `features/index.json.gz` y el `layer_N.bin` correspondiente a la capa consultada; el acceso es por capa, no requiere cargar todo el store.
- GPU: no necesaria para leer features o servir el visor; si se regeneran features o se construyen grafos de atribucion sobre el adaptador, se requiere GPU compatible con Gemma 2 2B (por ejemplo, una RTX 4090 o superior para el modelo base en precision reducida).
- Opciones de despliegue: el visor `python -m analysis.attribution.serve` y el dashboard `python -m analysis.features.dashboard`; no aplican vLLM, llama.cpp, Ollama ni TGI porque no hay pesos de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Repositorio | Modelo base | Features | Tokens procesados | Proposito |
|---|---|---|---|---|
| Este repositorio (`...10g...auxk512_h32fcbb6d3d54`) | Gemma 2 2B (adaptador 10g) | 212.992 totales, 119.473 disparadas | 88.625.123 | Feature store para grafos de atribucion |
| `siddharthmb/2026.TA.features_2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_hd81ee76c314f` | Gemma 2 2B (adaptador 10e) | No disponible | No disponible | Variante con distinto learning rate (0.001) |
| `siddharthmb/2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_ctr_fp32_tarbb_lb2_sl17862630` | Gemma 2 2B (adaptador 10e) | No disponible | No disponible | Adaptador fuente, no feature store |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas de la misma categoria mas alla de las variantes del mismo autor listadas arriba.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede usarse para inferencia, atencion al cliente, codigo o tareas generativas.
- La licencia no esta declarada en la informacion disponible; antes de cualquier uso comercial o redistribucion hay que verificar los terminos en el repositorio de Hugging Face.
- Los datos de validacion incluyen `lmsys-chat-1m-splits`, un dataset de conversaciones reales; los ejemplos almacenados pueden contener contenido sensible, sesgos o datos personales presentes en el corpus original.
- La recoleccion se limita a `max_length=1024` y a 100.000 muestras; features que solo se activan en contextos mas largos o en otros dominios no estan representadas.
- Solo el 56,1 % de las features dispararon al menos una vez; el resto no tiene ejemplos y no es inspeccionable con este store.
- Los ejemplos por rango de activacion se recolectaron con `activation_range_examples_per_domain=0` en la configuracion mostrada, aunque la lista de rangos figura en los detalles; conviene verificar `feature_collection_config.json` antes de asumir su presencia.
- El repositorio depende de la libreria `circuit-tracer` y del codigo del proyecto en un commit concreto (`03dccd28bfe1`); cambios posteriores en la API pueden romper la carga de features.
- Las rutas de cluster (`/nlp/scr/siddharth/...`) no son accesibles fuera del entorno del autor; el dashboard solo funciona contra una copia local de la coleccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/siddharthmb/2026.TA.features_2026.TA.gemma2_2b_headline_2026-10g_tc8192_decb_l1w0.0003_auxk512_h32fcbb6d3d54
- Modelo/adaptador base: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_headline_2026-10g_tc8192_decb_l1w0.0003_auxk512_ctr_fp32_tarbb_lb2_sl18197693
- Dataset de chat: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Dataset fineweb: https://huggingface.co/datasets/science-of-finetuning/fineweb-1m-sample
- Paper: https://arxiv.org/abs/2602.20904
- Pagina del proyecto: https://transcoder-adapters.github.io/
- Codigo: https://github.com/Sid-MB/transcoder-adapters
- Variante 10e (features): https://huggingface.co/siddharthmb/2026.TA.features_2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_hd81ee76c314f
- Variante 10e (adaptador): https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_ctr_fp32_tarbb_lb2_sl17862630
