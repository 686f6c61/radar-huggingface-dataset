# Compactbot/recurrent-context-causal-lab

## Resumen

Recurrent-context-causal-lab es un repositorio de experimentación publicado por el usuario Compactbot (un agente automatizado desarrollado por Glint Research para la comunidad de modelos pequeños, SLM) en Hugging Face. No se trata de un modelo listo para producción, sino del artefacto reproducible de un experimento controlado que compara dos variantes de una red transformer diminuta: una con profundidad recurrente (un mismo bloque feed-forward aplicado cuatro veces) y otra con bloques apilados convencionales. El objetivo declarado es medir si la profundidad recurrente amplifica el beneficio de un contexto más largo a escala muy pequeña.

El experimento entrena cuatro configuraciones sobre predicción de siguiente token a nivel de byte con el corpus TinyStories: recurrent_ctx64, recurrent_ctx256, stacked_ctx64 y stacked_ctx256. Todos los modelos tienen alrededor de 1,4 millones de parámetros, d_model de 256, cuatro cabezas de atención, vocabulario de 256 (bytes) y embeddings atados. Se realizan 2.000 actualizaciones con AdamW, batch de 32, tasa de aprendizaje 0,0003 y semilla 42.

Su relevancia es metodológica más que de producto: documenta con hashes SHA-256 el código fuente y los resultados, incluye una verificación de correctitud (alineación de objetivos, atención causal, gradientes, memoria y recarga de checkpoints) y explicita de forma inusualmente honesta sus propias limitaciones. Corrige además un problema de fuga de tokens futuros detectado en la versión no causal v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal a nivel de byte, con dos variantes de profundidad: feed-forward recurrente (mismo bloque aplicado cuatro veces) y feed-forward apilado; d_model 256, 4 cabezas de atención |
| Parametros totales | 1.397.504 (recurrent_ctx64), 1.446.656 (recurrent_ctx256), 1.402.880 (stacked_ctx64), 1.452.032 (stacked_ctx256) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 64 o 256 tokens segun configuracion (entrenamiento y validacion a esa misma longitud) |
| Tipos de cuantizacion | No disponible (no se publican pesos ni versiones cuantizadas) |
| Idiomas soportados | No declarado; los datos descritos son TinyStories procesado a nivel de byte |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | No disponible; el repositorio documenta el script fuente `recurrent_ctx_interaction_v4_causal.py`, no un artefacto de pesos |

Datos de entrenamiento comunes: d_model 256, 4 cabezas, vocabulario 256, embeddings de token atados, AdamW, 2.000 actualizaciones, batch 32, learning rate 0,0003, semilla 42, ancho feed-forward recurrente 2048 y ancho apilado 128. Split contiguo 95/5 sobre datos crudos, con topes de codigo fuente de 50 millones de bytes de entrenamiento y 2 millones de validacion.

## Arquitectura y entrenamiento

La arquitectura base es un transformer causal diminuto con embeddings de token atados y vocabulario de 256 simbolos, es decir, tokenizacion a nivel de byte sin vocabulario subpalabras. La variable experimental es la forma de la profundidad: las configuraciones `recurrent_*` reutilizan un unico bloque feed-forward de ancho 2048 aplicado cuatro veces, mientras que las configuraciones `stacked_*` usan bloques apilados de ancho 128. Ese cambio de ancho es un intento de igualar aproximadamente el numero de parametros, no una comparacion arquitectonica limpia, tal y como reconoce el propio autor.

El entrenamiento se realiza sobre TinyStories con prediccion de siguiente token, cuatro aplicaciones de bloque, secuencias muestreadas aleatoriamente y validacion en modo eval sin gradientes. El split es contiguo (95/5) sobre datos crudos, con topes de 50 millones de bytes de entrenamiento y 2 millones de validacion. La ejecucion registrada termino con codigo de salida 0 en 61,64 segundos, sin stderr, y con una verificacion previa de correctitud superada que cubre alineacion de objetivos, atencion causal, gradientes, memoria y recarga de checkpoint. No se menciona RLHF, DPO ni ninguna fase de ajuste por preferencias.

La innovacion tecnica que se pretende estudiar es la interaccion entre profundidad recurrente y longitud de contexto. El autor es explicito en que los resultados obtenidos son evidencia exploratoria y no prueba de una ventaja arquitectonica ni de una interaccion recurrencia x contexto, entre otras razones porque las condiciones de contexto procesan recuentos distintos de posiciones de token (4.096.000 frente a 16.384.000) y se evaluan a longitudes distintas.

## Capacidades

- Prediccion de siguiente token a nivel de byte sobre texto tipo TinyStories (narrativa infantil sencilla en la version original del corpus).
- Modelado de contexto corto: 64 o 256 tokens segun la configuracion, sin mecanismos de extension de contexto descritos.
- Capacidad de generacion de texto limitada al dominio y al estilo de TinyStories; no hay evaluacion de calidad amplia en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no declaradas ni evaluadas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Instrucciones, dialogo o ajuste por preferencias: no disponibles; el modelo es de pretraining puro sobre siguiente token.

## Casos de uso

- Reproduccion de experimentos de investigacion en arquitecturas: ejecutar `recurrent_ctx_interaction_v4_causal.py` con los hashes documentados permite verificar el pipeline completo (alineacion, causalidad, gradientes, memoria, recarga de checkpoint) antes de escalar la comparacion a modelos mayores.
- Estudio de profundidad recurrente frente a profundidad apilada: sirve como banco de pruebas a escala minima para disenar un seguimiento con exposicion de tokens igualada, multiples semillas e intervalos de confianza.
- Validacion de infraestructura de entrenamiento en entornos con recursos minimos: con 1,4 millones de parametros y 61,64 segundos de ejecucion registrada, es util para probar bucles de entrenamiento, guardado y recarga de checkpoints en hardware muy limitado.
- Docencia y divulgacion de tecnicas de atencion causal: el fallo de fuga de tokens futuros en la version v3 y su correccion en v4 constituyen un caso practico claro sobre por que hay que verificar la mascara causal.
- Pruebas de tokenizacion a nivel de byte: el vocabulario de 256 simbolos permite experimentar con pipelines libres de tokenizador subpalabras en contextos de investigacion sobre multilingueidad y ruido.
- Benchmarking de juguete para perplejidad en corpus controlados: las metricas registradas (perplejidad 6,08 a 9,70 segun configuracion) pueden usarse como referencia de partida, siempre que se repliquen exactamente las condiciones descritas.
- No es adecuado para atencion al cliente, generacion de codigo en produccion, agentes autonomos ni ninguna tarea de calidad general: no hay pesos publicados, licencia declarada ni evaluacion fuera del dominio TinyStories.

## Benchmarks y rendimiento

Unicamente se publican metricas de validacion internas del experimento. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

| Configuracion | Parametros | Contexto | Posiciones de token de entrenamiento | Perdida de validacion final | Perplejidad de validacion final |
|---|---:|---:|---:|---:|---:|
| recurrent_ctx64 | 1.397.504 | 64 | 4.096.000 | 1,80549 | 6,08295 |
| recurrent_ctx256 | 1.446.656 | 256 | 16.384.000 | 2,23559 | 9,35204 |
| stacked_ctx64 | 1.402.880 | 64 | 4.096.000 | 1,92167 | 6,83238 |
| stacked_ctx256 | 1,452.032 | 256 | 16.384.000 | 2,27253 | 9,70391 |

Ventaja recurrente menos apilado en perplejidad: aproximadamente 0,749 a contexto 64 y 0,352 a contexto 256. El autor advierte que esta ventaja no debe interpretarse como prueba de una ventaja de arquitectura, y que no se implica ninguna evaluacion de velocidad de inferencia ni de calidad amplia.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento de parametros, no medida por el autor): unos 5,6-5,8 MB en fp32 y 2,8-2,9 MB en fp16 para las cuatro configuraciones.
- Entrenamiento: con AdamW en fp32 (pesos, gradientes y dos momentos) el estado por parametro ronda los 16 bytes, es decir, del orden de 22-23 MB para 1,45 millones de parametros, mas activaciones despreciables (batch 32, contexto 256, d_model 256).
- GPU recomendadas: cualquier GPU, incluida una iGPU o una GPU integrada modesta; tambien es viable en CPU. El autor no especifica el hardware empleado en la ejecucion de 61,64 segundos.
- Cabe en GPU de consumo: si, en cualquiera (RTX 3060, RTX 4090, GTX 1650, etc.), y tambien en dispositivos tipo Raspberry Pi, dado el tamano de unos pocos megabytes.
- Opciones de despliegue: no disponible. No se publican pesos ni ficheros GGUF, safetensors o similares, por lo que no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible. El unico dato temporal publicado es la duracion total del experimento (61,64 segundos), que corresponde al entrenamiento y validacion, no a la inferencia.

## Comparativa con modelos similares

La categoria natural son los modelos diminutos entrenados sobre TinyStories. La comparacion directa de rendimiento no es posible porque este repositorio no publica pesos desplegables ni evaluaciones estandar. Se comparan unicamente datos estructurales conocidos.

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Observaciones |
|---|---|---|---|---|---|
| recurrent-context-causal-lab (este) | 1,40-1,45 M | 64 / 256 | No disponible | No disponible (solo script fuente) | Experimento exploratorio, una sola semilla |
| TinyStories-1M (Eldan y Li, roneneldan) | ~1 M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo de referencia del corpus TinyStories, tokenizacion GPT-2 |
| TinyStories-33M (Eldan y Li, roneneldan) | ~33 M | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Escala superior, no comparable en tamano |
| GPT-2 small (OpenAI) | 124 M | 1.024 | MIT (segun distribucion habitual) | safetensors / PyTorch | Ordenes de magnitud mayor; solo como referencia de categoria |

No se dispone de datos de benchmarks comparables entre estos modelos en la informacion proporcionada. Cualquier comparacion de calidad exigiria evaluar todos los modelos sobre un mismo conjunto objetivo retenido con historiales disponibles comparables, algo que el propio autor propone como trabajo futuro.

## Limitaciones y advertencias

- Se trata de un experimento exploratorio, no de un modelo publicable para uso real. El autor lo declara explicitamente.
- Una sola semilla (42), inicializada una vez y no reinicializada por configuracion: no hay repeticiones ni intervalos de confianza.
- Las condiciones de contexto procesan recuentos de tokens distintos (4.096.000 frente a 16.384.000), por lo que la comparacion entre contextos esta confundida con la exposicion de tokens.
- Las variantes recurrente y apilada usan anchos feed-forward distintos (2048 frente a 128) para aproximar el emparejamiento de parametros; no son arquitecturas identicas.
- Las medias de validacion son promedios no ponderados de perdidas por lote, de modo que el ultimo lote parcial puede influir de forma desproporcionada.
- Los resultados de la version no causal v3 son invalidos porque permitian fuga de tokens futuros; no deben citarse.
- No se implican mediciones de velocidad de inferencia ni evaluacion amplia de calidad.
- Riesgo de alucinacion y sesgos: no evaluado. Al estar entrenado sobre TinyStories, se espera generacion de narrativa simple y sin garantias de veracidad fuera de ese dominio.
- Limitaciones de contexto e idioma: contexto maximo de 256 tokens y ausencia de declaracion de idiomas; el corpus de referencia es narrativa infantil en ingles.
- Restricciones de licencia: el repositorio no declara licencia, por lo que el uso comercial queda en un limbo juridico. No debe asumirse permisividad.
- No se publican pesos ni formatos de despliegue, lo que impide integrarlo en pipelines de produccion tal cual.
- Para cualquier uso en produccion seria necesario un seguimiento con exposicion de tokens igualada, evaluacion sobre un conjunto objetivo identico, multiples semillas independientes e intervalos de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Compactbot/recurrent-context-causal-lab
- Perfil del autor en Hugging Face: https://huggingface.co/Compactbot
- Space del agente Compactbot: https://huggingface.co/spaces/CompactAI/Compactbot
- Script fuente citado en la model card: `recurrent_ctx_interaction_v4_causal.py` (SHA-256 `d5ef19a4cc0a6a26137865553e46a707882dae111ddd52832bd826f052dc0d09`); resultados con SHA-256 `89acd1b3f005cdcf35f33a82bd1f194d9c3046a79c3531a7fdabd5b244b8ad75`. No se proporciona URL directa en la informacion disponible.

Resultados de busqueda web no relacionados directamente con este modelo, incluidos por completitud: articulo sobre CausaLab (https://arxiv.org/abs/2605.26029), entrada de blog sobre un compactador de contexto para agentes en TypeScript (https://explore.n1n.ai/blog/building-tiny-agent-context-compactor-typescript-2026-10-06) y organizacion CausalAI en GitHub (https://github.com/CausalAILab/). Ninguno de ellos documenta ni evalua el modelo descrito en esta ficha.
