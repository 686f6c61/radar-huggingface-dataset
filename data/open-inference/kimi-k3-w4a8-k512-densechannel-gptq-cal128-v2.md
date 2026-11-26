# open-inference/Kimi-K3-W4A8-K512-DenseChannel-GPTQ-Cal128-v2

## Resumen

Kimi-K3-W4A8-K512-DenseChannel-GPTQ-Cal128-v2 es una cuantizacion del modelo base moonshotai/Kimi-K3, publicada por el usuario open-inference bajo el contrato de pesos `kimi-k3-v6e-w4a8-performance-v2`. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado en el que las proyecciones densas y la cabeza del vocabulario se han cuantizado a W4 (enteros con signo en el rango [-7,7], punto cero 0 y una escala FP32 por canal de salida) con calibracion GPTQ, mientras que los expertos enrutados conservan los codigos enteros W4 y las escalas FP32 K512 copiados bit a bit del modelo padre.

El modelo declara 2.779.931.837.184 parametros totales segun los safetensors del repositorio, lo que lo situa en la categoria de modelos de escala de billones de parametros con arquitectura de mezcla de expertos (MoE), aunque la model card no explicita el numero de parametros activos ni la longitud de contexto. El repositorio ocupa 1.415,6 GB y emplea el formato compressed-tensors sobre transformers, con codigo personalizado (`custom_code`) necesario para cargar la arquitectura.

Su relevancia es practica: demuestra una ruta de cuantizacion reproducible para servir un modelo de gran escala en hardware TPU v6e, con auditorias de hashes, verificacion de operadores en chip fisico (JAX 0.11.1 / libtpu 0.0.46.1) y artefactos de procedencia detallados. Es una pieza de infraestructura de inferencia mas que un modelo listo para tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), con atencion MLA absorbida, proyecciones KDA y torres multimodales (vision); detalles completos no disponibles en la model card |
| Parametros totales | 2.779.931.837.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la calibracion permite hasta 8K tokens en 16 peticiones de texto y 2K en el resto) |
| Tipos de cuantizacion | W4A8: pesos densos y cabeza en W4 con signo [-7,7], punto cero 0, escala FP32 por canal; activaciones A8; expertos enrutados en W4 con escalas FP32 K512 |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (licencia "other" con nombre kimi-k3, enlace a LICENSE en el repo) |
| Formato de pesos | safetensors con compressed-tensors y custom_code |

## Arquitectura y entrenamiento

El checkpoint parte de `moonshotai/Kimi-K3` (revision `f831ab66814297da540d832a5235f8e904f29d06`) y de un padre intermedio, `open-inference/Kimi-K3-W4A8-K512-GPTQ-Mixed-Cal72-Seq1024` (revision `6f2882e74bdecf6ea91327c62207822419ee5de1`). La arquitectura subyacente es un transformer con mezcla de expertos que incorpora atencion MLA absorbida, proyecciones KDA (con almacenamiento y acumulacion recurrente en FP32), convoluciones, normas, AttnRes y torres multimodales. Los expertos enrutados no se recalibraron: sus codigos enteros y escalas K512 se copiaron bit a bit del padre, con auditorias de hash por tensor y comprobaciones de igualdad de serializacion.

La innovacion central es el proceso de cuantizacion. Las 811 bancadas densas de runtime seleccionadas y la cabeza del vocabulario usan GPTQ con amortiguamiento inicial del 1%, bloques de 128 columnas, hasta 8192 filas por modulo, recorte ponderado por activacion y ajuste de escalas en FP32, sin act-order ni permutaciones de suavizado. La calibracion emplea 128 peticiones (40 de texto, 40 de codigo, 32 de matematicas, 8 de imagen y 8 de fotogramas de video) mas 32 peticiones disjuntas de validacion. Los puntos INT32 se reescalan en FP32 y las sumas parciales de fila se redondean a BF16 antes de las sumas ordenadas en FP32. El orden de calibracion por capa es: columna, q-b, o, entrada latente/compartida, replay de expertos y salida latente/compartida. Se verificaron los operadores en un chip v6e fisico con JAX 0.11.1 y libtpu 0.0.46.1, comprobando que los puntos de cuantizacion de activacion (4096 extremos) coincidian exactamente con el emulador.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas: heredadas del modelo base Kimi-K3, aunque la model card no certifica precision de tarea ni calidad de generacion tras la cuantizacion.
- Procesamiento multimodal de imagen: la calibracion incluye peticiones de imagen y el modelo conserva las torres multimodales del original.
- Procesamiento de video (limitado): la calibracion usa cuatro fotogramas cronologicos a traves del procesador de imagen nativo, pero el procesador HF fijado solo acepta imagenes, por lo que no se cualifica video temporalmente fusionado ni audio.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.
- Inferencia con activaciones A8 y pesos W4 orientada a TPU v6e: capacidad de despliegue tecnicamente documentada, no una capacidad funcional del modelo.

## Casos de uso

- Servicio de inferencia a gran escala en TPU: el checkpoint esta disenado y verificado para el consumidor JAX 0.11.1 / libtpu 0.0.46.1 en chips v6e, con proyecciones TP8 de K local y sumas ordenadas, lo que permite desplegar Kimi-K3 en infraestructura TPU con pesos de 4 bits y activaciones de 8 bits.
- Investigacion en cuantizacion GPTQ: el repositorio incluye `recipe.json`, `metrics-*.json`, `heldout-quality.json` y `artifact-manifest.json`, lo que lo convierte en una referencia reproducible para estudiar el impacto de la cuantizacion densa/cabeza aislada del resto de componentes.
- Auditoria de procedencia de pesos: los hashes por tensor, las comprobaciones de igualdad de serializacion y los inventarios por capa (`quant-layer-*-inventory.json`) permiten verificar la integridad de un checkpoint de billones de parametros antes de ponerlo en produccion.
- Desarrollo de emuladores y validacion de operadores: los vectores de auditoria nativos y los hashes de fuente del consumidor incluidos sirven para validar kernels de cuantizacion INT32/BF16/FP32 contra el comportamiento real en chip.
- Evaluacion comparativa de variantes de calibracion: al existir un padre con calibracion distinta (Cal72 frente a Cal128), permite medir el efecto del conjunto de calibracion sobre la calidad en tareas de texto, codigo y matematicas.
- Pipeline de extraccion de caracteristicas: la pipeline declarada es `feature-extraction`, por lo que puede emplearse para generar representaciones internas en sistemas de recuperacion o clasificacion que toleren la perdida de precision de W4.
- Base para despliegues multimodales de imagen: conserva las torres de vision y el procesador de imagen, lo que permite procesar imagenes en flujos de inferencia cuantizada, con la salvedad de que no se cualifica video ni audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las metricas de validacion comparan la variante v2 contra el padre con densas/cabeza en BF16 original y el mismo emulador de expertos, aislando el efecto de la cuantizacion anadida, y que no establecen la calidad del MXFP4 original, la precision de generacion o tarea, el comportamiento en contexto largo ni la calidad de servicio en produccion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el repositorio ocupa 1.415,6 GB en disco, lo que da una cota inferior del almacenamiento necesario para los pesos cuantizados.
- GPU recomendadas: no disponible. La model card documenta verificacion en TPU v6e con JAX 0.11.1 y libtpu 0.0.46.1, no en GPU.
- Compatibilidad con GPU de consumo: no disponible; con 2,78 billones de parametros totales y 1,4 TB de pesos, no es viable en GPU de consumo individual.
- Opciones de despliegue: transformers con `custom_code` y compressed-tensors; el consumidor verificado es JAX/libtpu en TPU v6e. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se documenta la verificacion de operadores (puntos completos de K, parciales TP8 de K local con sumas ordenadas, filas cero y 4096 extremos de cuantizacion de activacion) en chip fisico, que no equivale a una prueba de ejecucion completa del checkpoint ni a una medicion de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi-K3-W4A8-K512-DenseChannel-GPTQ-Cal128-v2 (este) | 2.779.931.837.184 | no disponible | W4A8 GPTQ, expertos W4/K512 | kimi-k3 | Hugging Face, 223 descargas |
| open-inference/Kimi-K3-W4A8-K512-GPTQ-Mixed-Cal72-Seq1024 (padre) | no disponible | no disponible | W4A8 GPTQ con calibracion Cal72/Seq1024 | kimi-k3 | Hugging Face |
| moonshotai/Kimi-K3 (base) | no disponible | no disponible | BF16/MXFP4 original (segun model card) | kimi-k3 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card advierte explicitamente de que las metricas de validacion no establecen la calidad del MXFP4 original, la precision de generacion o de tarea, el comportamiento en contexto largo ni la calidad de servicio en produccion.
- La verificacion en chip fisico se limita a los slices de proyeccion de columna y fila de la capa cero; no es una ejecucion completa del checkpoint ni una prueba de colectivos distribuidos.
- El procesador HF fijado solo acepta imagenes: no se cualifica video temporalmente fusionado ni audio, pese a que la calibracion incluya fotogramas de video.
- La precision KV es una ABI de cache de runtime separada y no forma parte del formato de pesos offline; no debe asumirse un comportamiento KV concreto a partir del checkpoint.
- Los expertos enrutados no se recalibraron: cualquier degradacion atribuible a los expertos proviene del padre, no de esta variante.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma en la informacion disponible.
- La licencia es "other" con nombre kimi-k3; las condiciones exactas de uso comercial deben consultarse en el archivo LICENSE del repositorio, que no se detalla en la informacion proporcionada.
- El modelo requiere `custom_code` y compressed-tensors; la carga con transformers estandar sin esos componentes no funcionara.
- El tamano del repositorio (1.415,6 GB) impone requisitos de almacenamiento y transferencia considerables.

## Enlaces

- Hugging Face: https://huggingface.co/open-inference/Kimi-K3-W4A8-K512-DenseChannel-GPTQ-Cal128-v2
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3
- Modelo padre (expertos): https://huggingface.co/open-inference/Kimi-K3-W4A8-K512-GPTQ-Mixed-Cal72-Seq1024
- Licencia: LICENSE en el repositorio de Hugging Face
- Artefactos de procedencia citados en la model card: `recipe.json`, `metrics-*.json`, `heldout-quality.json`, `artifact-manifest.json`, `source-to-consumer.json`, `quant-layer-*-inventory.json`, `calibration.json`
