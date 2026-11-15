# dungnv/poset-heads

## Resumen

POSET length predictors es un conjunto de artefactos de inferencia (no un modelo generativo en si mismo) publicados por el usuario dungnv para el sistema POSET, un planificador de scheduling para vLLM basado en prediccion conformal de la longitud de salida. El repositorio contiene cabezas predictoras de longitud entrenadas para modelos servidos por vLLM, junto con los radios de conformal split necesarios para dar garantias de cobertura sobre la longitud restante de la respuesta. La unica carpeta disponible en el momento de la publicacion es `r1q14b/`, asociada al modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-14B.

El problema que resuelve es concreto: en serving de LLM con decodificacion autoregresiva, conocer cuanto texto va a generar una peticion antes de empezarla permite agrupar y ordenar peticiones (scheduling tipo poset) para maximizar el throughput y controlar la latencia. POSET predice la longitud restante total (razonamiento, token `</think>` y respuesta) a partir de activaciones internas del modelo servido, y usa prediccion conformal para acotar el error con una cobertura objetivo. El repositorio tiene 0.9 GB y no incluye pesos de un LLM, sino checkpoints auxiliares en formato `.pt` y `.npz`.

La relevancia es acotada pero tecnica: es infraestructura de investigacion reproducible para evaluar scheduling predictivo en vLLM, con evaluacion offline publicada a alpha = 0.1 sobre dos grupos de trafico (chat y base). No es un modelo para uso directo en aplicaciones de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezas MLP (512 x 2) sobre activacion de una capa del modelo servido mas 5 features de posicion; baseline BERT-base-uncased y baseline de bins de decodificacion |
| Parametros totales | No disponible (el repo contiene checkpoints auxiliares, no un LLM completo) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible como modelo; los predictores se entrenaron con max_tokens 16.384 para r1q14b |
| Tipos de cuantizacion | float16 (dtype de recogida de r1q14b); no se documentan otras |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | `.pt` (dicts de `torch.save`, requieren `weights_only=False`) y `.npz` para radios conformales |
| Modelo servido asociado | deepseek-ai/DeepSeek-R1-Distill-Qwen-14B (capa 28, float16, max_tokens 16.384) |
| Grupos de trafico | `chat` (WildChat + LMSYS-Chat) y `base` (ForeLen) |
| Niveles alpha conformales | 0.05, 0.1, ..., 0.9 |
| Tamano del repo | 0.9 GB |

## Arquitectura y entrenamiento

Cada carpeta contiene una cabeza de longitud por grupo de trafico (`chat_head.pt` y `base_head.pt`). La cabeza es un MLP de dos capas de 512 unidades que toma como entrada la activacion de una capa concreta del modelo servido (capa 28 en r1q14b) concatenada con 5 features de posicion, y produce la raiz cuadrada de la salida restante. La etiqueta objetivo es la longitud total restante de la salida (out_len menos lo ya generado, incluyendo razonamiento, token `</think>` y respuesta) a temperatura 0, con posicion p indexada desde 1 al inicio del prompt.

El entrenamiento usa los mismos prompts para las cabezas de POSET, las cabezas del baseline "trail" y los BERT: chat_train mas chat_train_wc2, y base_train del split de prompts de POSET, con longitudes obtenidas de las generaciones greedy del propio modelo servido. Los radios conformales se calibran sobre roles de calibracion separados y la evaluacion se hace sobre roles de evaluacion independientes, lo que da una separacion limpia entre entrenamiento, calibracion y test. Se incluyen tambien dos baselines: una cabeza binned de tiempo de decodificacion con 20 bins iguales sobre [0, max_tokens] y un predictor BERT-base-uncased con 20 bins de cuantiles de out_len. El barrido de capas que selecciono la capa 28 se guarda en `layer_sweep.json`.

## Capacidades

- Prediccion de la longitud restante de la salida de DeepSeek-R1-Distill-Qwen-14B a partir de activaciones internas y posicion del prompt.
- Prediccion por fase: prompt, ultimo token del prompt, razonamiento, respuesta y agregado total.
- Intervalos conformales con cobertura garantizada empiricamente para alpha de 0.05 a 0.9, por posicion.
- Dos cabezas especializadas por grupo de trafico (chat y base), con calibracion conformal independiente.
- Baselines incluidos para comparacion: cabeza binned de decodificacion y predictor BERT de prompt.
- Integracion con vLLM mediante la rama `poset-unified` del repositorio POSET.
- No realiza generacion de texto, razonamiento, codigo ni tool calling: es exclusivamente un modulo de prediccion de longitud para scheduling.

## Casos de uso

- Scheduling de peticiones en vLLM: usar la prediccion de longitud restante para ordenar peticiones en un poset y agrupar las de longitud similar, reduciendo el desperdicio de slots de batch y mejorando el throughput en cargas mixtas.
- Control de latencia en produccion: los intervalos conformales a alpha = 0.1 permiten acotar con cobertura ~0.90 el tiempo de finalizacion de una peticion, util para SLA y para decidir admision o rechazo en cola.
- Investigacion en serving predictivo: reproducir los experimentos de POSET frente a los baselines trail y BERT con los mismos prompts y splits, comparando MAE por token y correlacion de Spearman.
- Planificacion de capacidad: estimar la distribucion de longitudes de salida por grupo de trafico (chat frente a base) para dimensionar batches y memoria KV en despliegues de DeepSeek-R1-Distill-Qwen-14B.
- Enrutado por dificultad: usar la prediccion de longitud como proxy de complejidad para derivar peticiones largas a una cola con mayor presupuesto de tokens o a un modelo mayor.
- Evaluacion de tecnicas de conformal prediction: el repositorio incluye radios por posicion y evaluacion por fases, lo que sirve como banco de pruebas para metodos de calibracion conformal en sistemas de LLM.
- Extension a nuevos modelos servidos: la receta `PIPELINE.md` de la rama `poset-unified` permite entrenar cabezas para otros modelos (el autor anuncia Qwen3.5-27B y un 70B).

## Benchmarks y rendimiento

Evaluacion offline de `r1q14b` a alpha = 0.1 (cobertura objetivo 0.90):

| Grupo | Fase | Cobertura | Anchura | MAE / token | Spearman |
|---|---|---|---|---|---|
| chat | all | 0.889 | 2.436 | 705 | 0.897 |
| chat | last prompt token | 0.908 | 1.322 | 439 | 0.797 |
| base | all | 0.880 | 6.451 | 1.843 | 0.820 |
| base | last prompt token | 0.890 | 3.711 | 1.234 | 0.830 |

Los numeros completos por fase estan en `r1q14b/eval_{chat,base}.json`. No se publican resultados comparativos frente a los baselines trail y BERT en la informacion disponible, ni benchmarks de throughput o latencia del sistema POSET completo.

## Requisitos de hardware

- El repositorio no contiene pesos de un LLM: para usar los predictores hace falta servir deepseek-ai/DeepSeek-R1-Distill-Qwen-14B en vLLM, lo que requiere GPU con memoria suficiente para un modelo de 14B en float16 (del orden de 28 GB de pesos mas cache KV para 16.384 tokens de contexto).
- GPU recomendadas para el modelo servido: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 24 GB solo con cuantizacion del modelo servido, no documentada en este repositorio.
- Las cabezas son ligeras (MLP de 512 x 2 mas features de posicion) y los radios conformales son arrays `.npz`; su coste de memoria y computo es despreciable frente al modelo servido.
- Despliegue: vLLM con la rama `poset-unified` del repositorio POSET; carga de cabezas mediante `poset.predictor.load_head`.
- Latencia y throughput del sistema POSET: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Sistema | Enfoque | Modelo asociado | Garantia de cobertura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| POSET (este repo) | MLP sobre activaciones + conformal split | DeepSeek-R1-Distill-Qwen-14B | Si, calibrada por posicion | No disponible | Hugging Face, 0 descargas |
| Baseline trail (incluido) | Cabeza binned de decodificacion (20 bins) | DeepSeek-R1-Distill-Qwen-14B | No documentada | No disponible | Incluido en el mismo repo |
| Baseline BERT (incluido) | BERT-base-uncased con 20 bins de cuantiles | DeepSeek-R1-Distill-Qwen-14B | No documentada | No disponible | Incluido en el mismo repo |

No se dispone de datos de rendimiento de los baselines en la informacion proporcionada, por lo que no es posible cuantificar la ventaja de POSET frente a ellos. Comparativas con otros planificadores de serving (por ejemplo, S3, Orca o sistemas de prediccion de longitud independientes) no disponibles.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para texto, codigo, razonamiento ni tool calling; solo predice longitudes.
- Solo cubre un modelo servido (DeepSeek-R1-Distill-Qwen-14B, capa 28); el autor anuncia Qwen3.5-27B y un 70B pero no estan publicados.
- La recogida de r1q14b se hizo con max_tokens 16.384 en float16; modelos posteriores usan 32.768 y el dtype del checkpoint, por lo que los predictores no son directamente transferibles entre configuraciones.
- La cobertura conformal es empirica sobre los splits de evaluacion del autor; no hay garantia distribution-free fuera de esas distribuciones de prompts (WildChat, LMSYS-Chat, ForeLen).
- El grupo `base` muestra anchuras de intervalo mucho mayores (6.451 frente a 2.436 en chat) y MAE por token mas alto, lo que limita su utilidad para SLA estrictos en ese trafico.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- Repositorio con 0 descargas y 0 likes, publicado en 2026-11-15: sin validacion externa ni mantenimiento demostrado.
- Los checkpoints son dicts de `torch.save` que requieren `weights_only=False`, lo que implica riesgo de seguridad al cargar ficheros de origen no verificado.
- Riesgo de sesgo y alucinacion del modelo servido subyacente no aplica a las cabezas, pero si al sistema completo en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dungnv/poset-heads
- Repositorio POSET (rama `poset-unified`, receta en `PIPELINE.md`): no disponible como URL en la informacion proporcionada
- Modelo servido: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Paper de POSET: no disponible
- Blog o demo: no disponible
