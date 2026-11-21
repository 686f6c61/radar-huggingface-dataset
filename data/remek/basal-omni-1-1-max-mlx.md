# Remek/basal-omni-1.1-max-MLX

## Resumen

basal-omni-1.1-max-MLX es un port cuantizado en 8 bits del modelo basal-omni-1.1-max (12B, basado en Gemma 4 12B) para Apple Silicon, distribuido por Remek a traves de la libreria MLX. No es un modelo nuevo: es una conversion de la capa de decision del modelo original, orientada a ejecutar la API de decisiones tipadas (typed decisions) del motor basal en hardware de Apple con memoria unificada. El modelo esta pensado para tomar decisiones entre un conjunto de opciones (hasta 255), no para generacion de texto libre convencional, e incorpora calibracion propia ajustada sobre las lecturas de este port.

El modelo resuelve el problema de ejecutar un clasificador/decision-maker calibrado en Macs con memoria unificada de gama alta (M4 Pro de 24 GB y superiores), sin depender de GPUs CUDA. Mantiene el tokenizador y la plantilla de chat del modelo bf16 original, y anade un fichero de calibracion especifico del port (`CALIBRATION.mlx.json`) que permite umbrales certificados de error al 1% y al 5%.

Es relevante ahora porque demuestra un flujo de portabilidad de modelos de decision calibrados a MLX con un protocolo de validacion estricto (el port gate) frente al modelo bf16 de referencia, con metricas publicadas de acuerdo, exactitud y ECE. El modelo es experimental y solo texto: los encoders de imagen y audio del modelo original no estan incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4 12B como base), con atencion global y rotatoria; solo el decoder de texto |
| Parametros totales | 11.907.350.272 (aprox. 11,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 8-bit, group size 64, en las capas lineales de los bloques del decoder; embeddings de tokens y cabeza de salida en bf16; normas en bf16 |
| Idiomas soportados | polaco (pl), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), config.json, tokenizer y chat_template.jinja |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Gemma 4 12B, convertido con el conversor de mlx-lm 0.32.2 (carga, cuantiza, guarda) sobre el modelo bf16 de referencia. La cuantizacion es MLX affine de 8 bits con group size 64 aplicada a las capas lineales de los bloques del decoder; los embeddings de tokens (que tambien actuan como cabeza de salida desde la que se lee la decision, en fp32) y las normas permanecen en bf16. Los ajustes de atencion rotatoria y global se escriben en `config.json` en las claves que lee mlx-lm. El conversor conserva unicamente el decoder de texto, descartando los encoders de imagen y audio del modelo original.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada. La innovacion tecnica destacable es el protocolo de decisiones tipadas (tipos `choice`, `noul`, `score`, `multi`, `act`, `tool`) y la calibracion por tipo y por bucket, con temperaturas y umbrales certificados para errores del 1% y 5%, ajustada sobre las lecturas de este port con `--mode mlx`.

## Capacidades

- Toma de decisiones tipadas entre 2 y 255 opciones, con tipos de tarea `choice`, `noul`, `score`, `multi`, `act` y `tool`.
- Clasificacion con calibracion integrada: umbrales certificados de error al 1% y al 5% por tipo y bucket.
- Decisiones automatizables: con la calibracion de este folder, el 35,5% de las decisiones se resuelven automaticamente a 1% de error objetivo (error observado 0,5%) y el 79,6% a 5% (error observado 3,7%).
- Soporte de tool calling a traves del tipo de tarea `tool` del motor basal.
- Capacidades multilingues limitadas a polaco e ingles.
- Modo de lectura de decision desde la cabeza de salida en fp32, con protocolo de readout definido en `basal.json`.
- No incluye vision ni audio en este folder (solo texto).

## Casos de uso

- Clasificacion documental automatizada: el modelo recibe un estado (documento o extracto) y un conjunto de etiquetas, y devuelve la opcion elegida con un margen calibrado; los umbrales certificados permiten decidir que casos se resuelven automaticamente y cuales requieren revision humana.
- Enrutamiento de tickets de soporte: con el tipo `choice` y hasta 255 opciones, se puede asignar cada ticket a una cola o equipo; la calibracion al 1% de error permite automatizar el 35,5% de los casos con error observado del 0,5%.
- Extraccion de campos estructurados: con el tipo `score` o `multi`, el modelo puntua o selecciona multiples opciones sobre un estado, util para validacion de formularios y normalizacion de datos en pipelines de ingesta.
- Agentes con tool calling: el tipo `tool` del motor basal permite seleccionar la herramienta adecuada en un flujo de agente; el modelo se sirve con `basal-serve --mode mlx` y responde a peticiones del motor.
- Moderacion y triaje de contenido en polaco e ingles: clasificacion de textos en categorias con umbrales de confianza calibrados, adecuada para pre-filtrado antes de revision humana.
- Evaluacion de modelos y datos en Mac: al ser un port MLX con calibracion propia, sirve para comparar decisiones contra el modelo bf16 en hardware Apple, con latencia medida de 525 ms por pregunta y 1530 ms para cinco preguntas sobre un mismo estado en un M4 Pro.

## Benchmarks y rendimiento

Resultados medidos contra el modelo bf16 de referencia (`--mode eager`, bf16, una RTX PRO 6000, CUDA) sobre cada octava decision del conjunto de desarrollo dev v2 (1.325 de 10.606), en un Apple M4 Pro (24 GB) con `--mode mlx`, 8 peticiones en vuelo:

| Port | Tamano | Acuerdo (2-10 opciones) | Acuerdo con margen bf16 >= 0,2 | Exactitud | ECE | Decisiones/s (M4 Pro, 8 en vuelo) | Gate |
|---|---|---|---|---|---|---|---|
| MLX 8-bit | 13,6 GB | 0,9836 | 0,9989 | +0,58 pt | -0,0035 | 0,27 | PASS |

Datos adicionales:

- Sobre las 1.039 decisiones con 2-10 opciones (939 con margen bf16 >= 0,2) el acuerdo es 0,9836; sobre las 1.261 decisiones medidas (hasta 255 opciones) el acuerdo es 0,9794.
- 64 de las 1.325 peticiones fallaron con error de memoria Metal en el Mac de 24 GB (8 en vuelo, en la franja de prompts largos) y quedaron excluidas.
- Tokenizacion: el folder MLX renderiza y tokeniza los prompts de basal exactamente igual que el modelo bf16 (2.000 de 2.000 prompts de desarrollo).
- Calibracion: con `CALIBRATION.mlx.json`, a 1% de error objetivo el 35,5% de las decisiones se deciden automaticamente (error observado 0,5%); a 5%, el 79,6% (3,7%). Prueba de calibracion: cada segunda decision, 4.280 decisiones, exactitud 0,906.
- Latencia (M4 Pro, `basal-loadtest`, una peticion a la vez, mediana): 525 ms para una pregunta, 1530 ms para cinco preguntas sobre un mismo estado.
- Los resultados de benchmark del modelo base (Werdykt v1 0,821, conjuntos polaco e ingles) estan en la ficha de basal-omni-1.1-max; este folder no se puntua por separado en ellos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 13,6 GB solo para los pesos; los estados largos necesitan memoria adicional.
- Hardware objetivo: Apple Silicon con memoria unificada; medido en un M4 Pro de 24 GB, donde 64 de 1.325 peticiones agotaron la memoria GPU con 8 en vuelo y prompts largos. Para documentos largos con muchas peticiones en vuelo se recomienda un Mac con mas memoria.
- GPU CUDA: no aplica a este port; el modelo bf16 de referencia se sirvio en una RTX PRO 6000.
- Cabe en consumer GPU: si, en Macs Apple Silicon; en el M4 Pro de 24 GB funciona con margenes ajustados en escenarios de concurrencia alta.
- Despliegue: motor basal 2.2.0 o superior con el extra `mlx` (Apple Silicon, Python 3.11 o superior) y `basal-serve --model Remek/basal-omni-1.1-max-MLX --mode mlx --port 8000`. Instalacion via `uv` con Python nativo arm64.
- Latencia y throughput: 0,27 decisiones/s con 8 peticiones en vuelo en M4 Pro; 525 ms por pregunta y 1530 ms para cinco preguntas sobre un estado, una peticion a la vez.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| basal-omni-1.1-max-MLX (este) | 11,9B | no disponible | pl, en | Apache 2.0 | safetensors MLX 8-bit | Solo texto; port Apple Silicon con calibracion propia |
| basal-omni-1.1-max (bf16) | 12B | no disponible | pl, en | Apache 2.0 | bf16 | Modelo base; incluye encoders de imagen y audio; benchmark Werdykt v1 0,821 |
| Gemma 4 12B | 12B | no disponible | no disponible | no disponible | no disponible | Arquitectura base del modelo |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental, igual que el bf16 de referencia: validar sobre documentos propios antes de confiar en el en produccion.
- Solo texto: los encoders de imagen y audio no estan incluidos en este folder; para imagenes y audio hay que usar el modelo bf16.
- La cuantizacion cambia algunas decisiones donde el modelo esta inseguro; el acuerdo con bf16 es 0,9836 en decisiones de 2-10 opciones, no 1,0.
- La calibracion incluida esta ajustada para un unico orden de opciones (el predeterminado); cambiar el orden de las opciones invalida los umbrales certificados.
- Riesgo de agotamiento de memoria en Macs de 24 GB con 8 peticiones en vuelo y prompts largos (64 de 1.325 peticiones fallaron con OOM de Metal).
- Idiomas limitados a polaco e ingles; sin soporte documentado para castellano.
- No se han publicado resultados de sesgos ni de alucinacion en la informacion disponible; al ser un modelo de decision tipada, el riesgo principal es la eleccion incorrecta de opcion, mitigado por los umbrales calibrados.
- Licencia Apache 2.0: permite uso comercial, pero al ser un modelo experimental conviene revisar los terminos del modelo base y del motor basal.

## Enlaces

- Hugging Face: https://huggingface.co/Remek/basal-omni-1.1-max-MLX
- Modelo base bf16: https://huggingface.co/Remek/basal-omni-1.1-max
- Repositorio del motor de inferencia: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/
- Instalacion del motor (tag v2.8.1): https://github.com/rkinas/basal/archive/refs/tags/v2.8.1.tar.gz
