# Lanilen/GLM-5.3-Flash-Expert-Predictor

## Resumen

GLM-5.3-Flash-Expert-Predictor es un artefacto auxiliar de inferencia, no un modelo de lenguaje. Lo publica el usuario Lanilen y sirve exclusivamente como acompañante de `zai-org/GLM-5.3-Flash`, un modelo de mezcla de expertos (MoE) con arquitectura `glm5-next` (3 capas densas y 42 capas MoE, 288 expertos enrutados y 8 activos por token). Su funcion es predecir que expertos va a necesitar el modelo en los proximos tokens para que un motor de inferencia pueda mantenerlos precargados en VRAM.

El problema que resuelve es el coste de los fallos de cache en escenarios de *expert offloading*. En la cuantizacion `UD-Q3_K_XL` los expertos ocupan 128 GiB de los 137 GiB totales del modelo, de modo que en GPUs que no pueden albergarlos todos el motor calcula en CPU los que no estan en VRAM. Este predictor, que ocupa 30 MB en float32, estima cada 16 tokens generados la frecuencia de seleccion de cada experto en las 42 capas MoE para horizontes de 128 y 512 tokens, y permite al cache priorizar que expertos subir a la GPU.

Es relevante porque demuestra una via practica para servir modelos MoE de gran tamano en hardware de consumo o en configuraciones multi-GPU modestas, a costa de un componente especifico de motor. No obstante, su utilidad esta completamente atada a un fork concreto de llama.cpp (rama `polaris`) y a una unica cuantizacion del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 2 capas (8205 → 512 → 128, GELU) con una cabeza de bajo rango por horizonte; artefacto auxiliar, no es un transformer |
| Parametros totales | no disponible (el autor solo indica que el fichero pesa 30 MB en float32) |
| Parametros activos | no aplica (no es un modelo MoE; predice el enrutamiento de uno) |
| Longitud de contexto | no aplica (opera sobre ventanas de prediccion de 128 y 512 tokens) |
| Tipos de cuantizacion | float32 unicamente |
| Idiomas soportados | no disponible (no procesa texto de forma autonoma) |
| Licencia | MIT |
| Formato de pesos | contenedor GGUF con `general.architecture = moe-predictor`, version 1, extension `.moepred` |
| Modelo base asociado | `zai-org/GLM-5.3-Flash` (arquitectura `glm5-next`) |
| Cuantizacion de referencia | `unsloth/GLM-5.3-Flash-GGUF` `UD-Q3_K_XL` |
| Motor compatible | fork Polaris de llama.cpp (rama `polaris`), build de 2026-11-17 o posterior |
| Tamano del fichero | 30 MB |
| Latencia de prediccion | aproximadamente 2 ms por prediccion en CPU |

## Arquitectura y entrenamiento

El predictor no es un modelo generativo. Recibe tres tipos de entrada: el estado oculto del modelo base en el token mas reciente (la media de los flujos de hyper-connection que entran en las capas 15 y 30, es decir, 2 × 4096 floats); nueve mapas de conteo de selecciones acumuladas (con decaimiento de semivida 64 y 512 sobre todos los tokens, la conversacion, el prompt del turno actual, la respuesta anterior, la respuesta en curso completa y con decaimientos de semivida 32 y 8, y un prior fijo); y la posicion dentro de la respuesta en 13 buckets que cubren de 0 a 1024 tokens. Con esas 8205 dimensiones de entrada, una MLP de dos capas proyecta a 512 y luego a 128, y una cabeza de bajo rango por horizonte produce los logits por capa y experto: un sesgo, una ponderacion por bucket de los mapas de conteo en escala logaritmica y una proyeccion de rango 128 de la salida de la MLP. Un softmax sobre los 288 expertos de cada capa da la prediccion final.

El entrenamiento se realizo sobre el enrutamiento observado en la cuantizacion `UD-Q3_K_XL` de `unsloth/GLM-5.3-Flash-GGUF`. El autor no documenta el volumen de datos, la composicion del dataset ni si hubo ajuste fino adicional. La innovacion tecnica es el propio concepto: sustituir una politica de cache basada en frecuencia reciente por una prediccion aprendida del enrutamiento futuro, evaluada cada 16 tokens generados y al inicio de cada respuesta. El autor indica que entreno tambien un predictor de arranque (`--moe-cache-predictor-start`) pero que no aportaba mejora en las mediciones, por lo que no se distribuye.

## Capacidades

- Prediccion del enrutamiento de expertos por capa MoE para horizontes de 128 y 512 tokens.
- Estimacion de la frecuencia de seleccion de cada uno de los 288 expertos en cada una de las 42 capas MoE del modelo base.
- Integracion con el modo de cache *hot spare* del fork Polaris mediante `--moe-cache-predictor`.
- Ejecucion en CPU con 4 hilos por defecto, configurable con `LLAMA_MOE_PREDICTOR_THREADS` o `--moe-cache-predictor-device`.
- Verificacion de integridad mediante la herramienta `llama-moe-predictor-check` y los vectores de prueba `checks/pred-v1.vec`.
- No genera texto, no razona, no soporta tool calling ni agentes, no procesa vision ni audio y no puede ajustarse ni fusionarse con otros modelos.

## Casos de uso

- Servicio de GLM-5.3-Flash en dos GPUs de 32 GB: el caso documentado por el autor usa dos AMD Radeon AI PRO R9700 con un Threadripper 1920X y 125 GiB de RAM; el predictor decide que expertos mantener en la cache de 19900 MiB de la primera tarjeta mientras la segunda aloja las capas 38-44 y la capa MTP.
- Despliegue de un MoE de 137 GiB en hardware que no puede contenerlo entero en VRAM: el predictor reduce el coste de los fallos de cache priorizando los expertos con mayor probabilidad de uso en los proximos 128 y 512 tokens.
- Inferencia con contexto largo en una sola conversacion: la configuracion de referencia usa `-c 65536` con `-np 1`; el predictor se recalcula cada 16 tokens para adaptar la cache al flujo de la conversacion.
- Procesamiento de prompts de hasta 1024 tokens con cache activa: la combinacion `--moe-cache-jit 8 --moe-cache-batch 1024` con `LLAMA_MOE_RESIZE_SPLIT=0` mantiene la cache y sube los expertos a medida que se usan; para prompts mayores se libera y se restaura desde la prediccion.
- Investigacion sobre politicas de cache para modelos MoE: el formato esta documentado en `src/llama-moe-predictor.cpp` y el proceso de entrenamiento en `docs/moe-predictor.md`, lo que permite reproducir o entrenar predictores para otras configuraciones.
- Validacion de integraciones de motores de inferencia: los vectores de prueba permiten comprobar que una build del fork carga y computa correctamente el predictor antes de desplegarla en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta que una prediccion tarda aproximadamente 2 ms en CPU y que el predictor se ejecuta cada 16 tokens generados, sin cifras de mejora de throughput ni de tasa de acierto de cache.

## Requisitos de hardware

- VRAM para el predictor: despreciable; el fichero ocupa 30 MB y se ejecuta por defecto en CPU.
- CPU: 4 hilos por defecto, configurable mediante `LLAMA_MOE_PREDICTOR_THREADS`.
- GPU del caso de referencia: dos AMD Radeon AI PRO R9700 de 32 GB cada una, con reparto de capas `-ts 38,9` y `-ncmoe 38`.
- RAM del sistema: 125 GiB en la configuracion documentada, suficiente para alojar los expertos no cacheados de la cuantizacion `UD-Q3_K_XL` (128 GiB de expertos sobre 137 GiB totales).
- No cabe en una GPU de consumo de forma aislada para el modelo base completo; el predictor en si no consume VRAM apreciable.
- Opciones de despliegue: exclusivamente el fork Polaris de llama.cpp (rama `polaris`), build de 2026-11-17 o posterior, con `llama-server` y las flags `--moe-cache-mode hot-spare`, `--moe-cache-resize`, `--moe-cache-mib`, `--moe-cache-predictor`, `--moe-cache-jit` y `--moe-cache-batch`. No funciona con llama.cpp upstream, Ollama, LM Studio ni otros motores.
- Latencia: aproximadamente 2 ms por prediccion en CPU; no se documenta throughput del modelo base con y sin predictor.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada predictores de enrutamiento MoE comparables, ni el autor cita alternativas. La comparacion con otros artefactos auxiliares de inferencia no es posible con los datos disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no puede ejecutarse de forma autonoma, no se puede fusionar ni ajustar.
- Solo funciona con `zai-org/GLM-5.3-Flash`; no sirve para otros modelos, incluidos otros modelos de la familia GLM.
- Solo funciona con el fork Polaris de llama.cpp en la rama `polaris`; llama.cpp upstream, Ollama, LM Studio y cualquier otro motor lo rechazan o lo ignoran.
- Requiere una build del fork de 2026-11-17 o posterior; builds anteriores rechazan el fichero porque este declara las capas del modelo (`moe_predictor.layers`, de 3 a 44).
- Entrenado sobre el enrutamiento de una cuantizacion concreta (`UD-Q3_K_XL`); no se documenta su comportamiento con otras cuantizaciones del modelo base.
- La configuracion de referencia asume una sola conversacion simultanea (`-np 1`); no se documenta el comportamiento con concurrencia.
- No hay predictor de arranque para este modelo; el autor lo entreno y lo descarto por no aportar mejora donde se midio.
- No se publican tasas de acierto, mejora de throughput ni benchmarks, por lo que el beneficio real en produccion debe medirse en cada despliegue.
- Licencia MIT: permite uso comercial, pero la dependencia del fork y del modelo base impone sus propias condiciones (el modelo base no se distribuye bajo esta licencia en la informacion disponible).
- Riesgo de alucinacion no aplica al predictor en si, pero si al modelo base que acompaña; el predictor puede degradar el rendimiento si sus predicciones son peores que la politica de frecuencia reciente en un dominio concreto.

## Enlaces

- [Hugging Face: Lanilen/GLM-5.3-Flash-Expert-Predictor](https://huggingface.co/Lanilen/GLM-5.3-Flash-Expert-Predictor)
- [Modelo base: zai-org/GLM-5.3-Flash](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [Cuantizacion de referencia: unsloth/GLM-5.3-Flash-GGUF](https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF)
- [Fork Polaris de llama.cpp (rama `polaris`)](https://github.com/Lanilen/llama.cpp)
- [Implementacion del formato: src/llama-moe-predictor.cpp](https://github.com/Lanilen/llama.cpp/blob/polaris/src/llama-moe-predictor.cpp)
- [Documentacion del cache hot spare](https://github.com/Lanilen/llama.cpp/blob/polaris/docs/moe-hot-spare.md)
- [Documentacion del entrenamiento de predictores](https://github.com/Lanilen/llama.cpp/blob/polaris/docs/moe-predictor.md)
- [Configuraciones de referencia (FORK.md)](https://github.com/Lanilen/llama.cpp/blob/polaris/FORK.md#setups)
