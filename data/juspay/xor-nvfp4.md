# juspay/xor-nvfp4

## Resumen

Xor NVFP4 (`juspay/xor-nvfp4`) es una version de precision mixta en NVFP4 del modelo Xor de Juspay, orientada a tareas de decision tipadas (clasificacion binaria, categorica y ordinal con distribuciones de probabilidad completas). El checkpoint parte de la cuantizacion de 4 bits NVFP4 de `Qwen/Qwen3.6-35B-A3B` realizada por NVIDIA con ModelOpt y le superpone un "blend" de adaptadores post-entrenados (F12 al 75% y F10 de Xor 1.1 al 25%), manteniendo en BF16 las partes de la red de las que depende la calidad de decision.

La propuesta de valor es el ahorro de recursos sin perdida medible de calidad: segun el autor, rinde igual o mejor que Xor 1.1 (BF16) en los niveles publicos de JEVBench y en la suite de desarrollo kev transfer-v4, pero ocupando aproximadamente 39 GB en lugar de 66 GB y con menor latencia. Se sirve a traves de la misma API compatible con TypeSafe (`/v1/systemone`) que `juspay/xor`.

El modelo es de tipo mixto de expertos (MoE) con capas de atencion lineal hibridas, torre de vision y prediccion multi-token (MTP). El recuento de parametros almacenados en safetensors es de 18.683.860.336, aunque el modelo base se denomina comercialmente 35B-A3B (aproximadamente 3.000 millones de parametros activos por token, segun esa nomenclatura). La licencia es Apache 2.0. Es relevante ahora porque demuestra que una cuantizacion NVFP4 selectiva puede sustituir a un despliegue BF16 en tareas de decision sensibles a la calibracion, a costa de exigir hardware Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion lineal hibrida (qwen3_5_moe); torre de vision; MTP |
| Parametros totales | 18.683.860.336 (recuento real en safetensors); modelo base denominado 35B-A3B |
| Parametros activos | Aproximadamente 3.000 millones (derivado de la nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible (el despliegue de referencia usa `--max-prefill-tokens 250000`) |
| Tipos de cuantizacion | NVFP4 (W4A16, grupo 16) en expertos enrutados de 26 de 40 capas; BF16 en el resto de modulos relevantes, `lm_head` y 14 capas de expertos; checkpoint base en ModelOpt `MIXED_PRECISION` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y NVFP4); tamano del repositorio 41,8 GB |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) sobre una columna vertebral transformer con atencion hibrida: 30 capas emplean atencion lineal (`in_proj_qkv/z/a/b`, `out_proj`) y 10 capas emplean atencion completa (`q/k/v/o_proj`). Cada capa cuenta con expertos enrutados y expertos compartidos (`gate/up/down_proj` en 40 capas). Incorpora ademas una torre de vision (para entradas de imagen y video) y una cabeza de prediccion multi-token (MTP). El checkpoint arranca desde `nvidia/Qwen3.6-35B-A3B-NVFP4` y sustituye selectivamente modulos por pesos BF16: los 310 tablas de adaptador, el `lm_head` y los expertos enrutados de las capas 20-29 y 36-39 (14 de 40). Los expertos enrutados de las capas 0-19 y 30-35 (26 de 40) permanecen en NVFP4. Todo modulo movido a BF16 se elimina de `quantized_layers` en `hf_quant_config.json` y `config.json`, de modo que se carga como capa no cuantizada.

El post-entrenamiento combina dos adaptadores de la misma linea de entrenamiento. Cada tabla de adaptador se fusiona en FP32 y se almacena en BF16 segun la formula `W = bf16(W_base + 1.125 * (B @ A)_F12 + 0.25 * (W_xor1.1 - W_base))`, donde `(B @ A)_F12` es el adaptador LoRA F12 de rango 16 (alpha 24, escala 1,5; el factor 1,125 corresponde al 75%) y `W_xor1.1 - W_base` es la actualizacion completa F10 recuperada de Xor 1.1 (25%). La similitud coseno por tabla entre ambos adaptadores esta en el rango 0,77-0,94. No se documentan en la informacion disponible detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Decision binaria (`noul`): devuelve una probabilidad binaria calibrada.
- Decision categorica (`choice`): clasificacion entre 2 y 255 candidatos, con distribucion de probabilidad completa.
- Puntuacion ordinal (`score`): estimacion de una puntuacion ordinal esperada con distribucion de probabilidad completa.
- Entrada multimodal: acepta un array `images` con hasta ocho URLs de datos de imagen, o una unica URL de datos de video, dentro de un cuerpo de peticion de 8 MB como maximo.
- Lectura de candidatos en servidor: el bundle de serving realiza evaluacion de orden de opciones hacia delante y hacia atras, calibracion por tipo y conversion de esquema.
- Comprension de imagenes y video orientada a tareas de decision tipadas (clasificacion y scoring multimodal).
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni razonamiento de multiples pasos.

## Casos de uso

- Clasificacion binaria de riesgo en tiempo real: con `noul`, el modelo devuelve una probabilidad calibrada utilizable como umbral en motores de decision antifraude o de elegibilidad, integrándose en la API `/v1/systemone`.
- Enrutamiento y triage de tickets: con `choice` (hasta 255 candidatos), el modelo asigna el ticket a una categoria con su distribucion de probabilidad, lo que permite enrutado con umbrales de confianza y escalado a revision humana.
- Encuestas y satisfaccion de cliente (NPS, CSAT): con `score`, estima la puntuacion ordinal esperada y su distribucion, util para imputar respuestas faltantes o priorizar cohortes.
- Moderacion de contenido multimodal: gracias a la entrada de imagenes (hasta 8 por peticion) y video, clasifica contenido audiovisual segun politicas tipadas con probabilidades en lugar de etiquetas rigidas.
- Evaluacion de calidad documental con imagenes: puntuacion ordinal de documentos escaneados, fotografias de producto o capturas, comparando variantes mediante la evaluacion bidireccional del orden de opciones que ofrece el bundle.
- Scoring de riesgo crediticio o de seguros sobre expedientes mixtos (texto + imagenes de documentacion), aprovechando la calibracion por tipo del serving.
- Analisis de video corto en pipelines de inspeccion: una URL de datos de video por peticion para clasificar eventos o asignar una puntuacion de gravedad.
- Investigacion sobre calibracion y decision tipada: banco de pruebas para comparar metodos de cuantizacion NVFP4 frente a BF16 midiendo la calidad de la distribucion de probabilidad, no solo la exactitud de la etiqueta.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. El autor afirma cualitativamente que el modelo iguala o supera a Xor 1.1 (BF16) medido sobre el mismo hardware en los niveles publicos de JEVBench y en la suite de desarrollo kev transfer-v4, con aproximadamente 39 GB de peso frente a los 66 GB de Xor 1.1 y menor latencia. No se aportan cifras concretas de exactitud, calibracion, latencia ni throughput.

## Requisitos de hardware

- Peso del checkpoint de aproximadamente 39 GB; el repositorio completo ocupa 41,8 GB y el despliegue requiere unos 60 GB de disco libre.
- Validado en 2 x NVIDIA RTX PRO 6000 Blackwell (96 GB cada una) con paralelismo de datos 2.
- Se puede arrancar en una sola GPU de 96 GB configurando `CUDA_VISIBLE_DEVICES=0` y `DP_SIZE=1`.
- No cabe en GPU de consumo: los aproximadamente 39 GB de pesos superan la VRAM de tarjetas como la RTX 4090 (24 GB), por lo que se requiere hardware profesional o de centro de datos con memoria agregada suficiente.
- Despliegue mediante SGLang dentro de Docker, con los dos flags adicionales obligatorios `--moe-runner-backend flashinfer_cutlass` y `--kv-cache-dtype bf16`.
- Configuracion de referencia: `--tp-size 1 --dp-size 2 --max-prefill-tokens 250000 --mem-fraction-static 0.85`.
- Requisitos de entorno: Linux x86-64, Hugging Face CLI, Docker Engine con Docker Compose v2 y NVIDIA Container Toolkit.
- La model card marca `inference: false`, por lo que el uso en produccion depende del bundle de serving proporcionado y no de una ruta de inferencia directa con transformers.
- Latencia y throughput: se declara "menor latencia" que Xor 1.1, sin cifras concretas disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Precision / tamano | Licencia | Notas |
|---|---|---|---|---|
| juspay/xor-nvfp4 | 18,68 B en safetensors (base 35B-A3B) | NVFP4 + BF16 selectivo, ~39 GB | Apache 2.0 | Objeto de esta ficha; misma API `/v1/systemone` |
| juspay/xor v1.1 (BF16) | no disponible | BF16, ~66 GB | no disponible | Referencia de calidad; el autor afirma paridad o mejora a favor del NVFP4 |
| nvidia/Qwen3.6-35B-A3B-NVFP4 | no disponible | ModelOpt `MIXED_PRECISION` NVFP4 | no disponible | Punto de partida de la cuantizacion |
| Qwen/Qwen3.6-35B-A3B | base denominada 35B-A3B | BF16 (base sin adaptadores) | no disponible | Modelo base; no incluye la especializacion en decision tipada |

No se dispone de datos de rendimiento comparativos cuantitativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card declara `inference: false`: el checkpoint esta pensado para servirse con el bundle de serving de Xor 1.1 adaptado, y los resultados solo son reproducibles si se usa ese bundle (lectura de candidatos, evaluacion bidireccional del orden de opciones, calibracion por tipo y conversion de esquema).
- El despliegue exige SGLang con dos flags especificos; no se garantiza un comportamiento equivalente con otros motores de inferencia.
- Requiere hardware Blackwell para la ruta NVFP4 validada; no hay validacion publicada en otras familias de GPU.
- Tamano maximo de peticion de 8 MB, con un maximo de ocho imagenes o un solo video por peticion.
- Sin datos publicados sobre idiomas soportados; el comportamiento multilingue no esta documentado.
- Sin resultados numericos de benchmarks publicados: la afirmacion de paridad con Xor 1.1 es cualitativa y procede del autor.
- Riesgo de alucinacion no cuantificado en la informacion disponible; en tareas de decision tipada el riesgo se traslada a la calibracion de las probabilidades devueltas.
- Posibles sesgos heredados del modelo base y de los datos de post-entrenamiento: no documentados.
- Aunque la licencia es Apache 2.0, se debe verificar la licencia y los terminos de los componentes derivados (modelo base y cuantizacion de NVIDIA) antes de un uso comercial.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- El recuento de parametros en safetensors (18,68 B) no coincide con la denominacion 35B del modelo base; conviene tener en cuenta esta discrepancia al planificar recursos y comparaciones.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/juspay/xor-nvfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantizacion NVFP4 de NVIDIA: https://huggingface.co/nvidia/Qwen3.6-35B-A3B-NVFP4
- Xor (version BF16 de referencia): https://huggingface.co/juspay/xor
- Imagen de contenedor SGLang usada en el despliegue: `prakhar1611/xor-sglang@sha256:94c48d2a6cc98dc456cf93f723707ea7dd81dddfe1061e823b348d68bbe8158f`
- Ficheros incluidos en el repositorio: `recipe/` (scripts de fusion y construccion), `RELEASE_PROVENANCE.json`, `serving/xor-nvfp4-serving.tar.gz` y `checksums.sha256`
