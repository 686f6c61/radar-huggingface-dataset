# inclusionAI/DeepSeek-V4.1-Flash-1017-singprobe

## Resumen

DeepSeek-V4.1-Flash-1017-singprobe es un modelo sonda (probe) de seguridad desarrollado por inclusionAI sobre el modelo base DeepSeek-V4.1-Flash-1017. No se trata de un modelo generativo independiente, sino de un cabezal de atencion adicional de 10,10 millones de parametros que se acopla a las capas ocultas del modelo base durante la generacion para puntuar, token a token, la intencion de la consulta, la inseguridad de la respuesta y el riesgo de alucinacion. Su proposito es actuar como guardrail intrinseco en streaming, es decir, evaluar el contenido a medida que se genera en lugar de analizarlo a posteriori.

El modelo lee las representaciones internas de tres capas del modelo base (12, 25 y 39, indexadas desde cero) mediante 8 cabezales de atencion con dimension de cabeza 64 y una ventana de 2048 tokens. Produce diez salidas: ocho etiquetas de intencion de consulta, una puntuacion de inseguridad de respuesta y una puntuacion de riesgo de alucinacion. Los pesos se distribuyen en bfloat16 y el repositorio tiene un tamano practicamente nulo (0,0 GB), coherente con sus 10 millones de parametros.

Su relevancia actual radica en que aborda dos problemas criticos de los sistemas desplegados con LLM: la moderacion en tiempo real y la deteccion de alucinaciones, con un coste computacional marginal frente al modelo base. La licencia MIT facilita su integracion en productos comerciales, aunque su uso esta indisociablemente ligado al modelo base sobre el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Probe de atencion sobre capas ocultas de un transformer (8 cabezales, dimension de cabeza 64, ventana de 2048 tokens) |
| Parametros totales | 10.098.186 (10,10 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de sonda de 2048 tokens; el modelo base se sirve con contexto de 16384 en el ejemplo de despliegue |
| Tipos de cuantizacion | no disponible (los pesos de publicacion estan en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con codigo personalizado, `custom_code`) |

## Arquitectura y entrenamiento

SingProbe es un cabezal de atencion que se engancha a las activaciones internas del modelo base DeepSeek-V4.1-Flash-1017. Concretamente, lee las capas 12, 25 y 39 (indexadas desde cero) de los estados ocultos durante la generacion y aplica atencion con 8 cabezales de dimension 64 sobre una ventana deslizante de 2048 tokens. La salida son diez logits por token que se interpretan como probabilidades: `label_0` a `label_7` para intencion de consulta, `label_8` para inseguridad de respuesta y `label_9` para riesgo de alucinacion. El modelo requiere `trust_remote_code` y un build especifico de SGLang (rama 261029) que expone las probabilidades por token en `meta_info.token_probe_probs`.

La informacion disponible no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El informe tecnico citado (arXiv:2608.30703) y el repositorio de GitHub son las fuentes indicadas para el metodo y el codigo de entrenamiento. Los umbrales calibrados de publicacion son 0,5 tanto para inseguridad de respuesta como para alucinacion.

## Capacidades

- Clasificacion de intencion de consulta en 8 categorias, con puntuacion por token.
- Deteccion de inseguridad en la respuesta generada (guardrail de salida).
- Deteccion de riesgo de alucinacion por token.
- Evaluacion en streaming: las puntuaciones se emiten a medida que el modelo base genera, lo que permite abortar o filtrar respuestas a mitad de generacion.
- Integracion con el servidor SGLang mediante el parametro `--probe-ckpt`, con salida en `meta_info.token_probe_probs`.
- No es un modelo generativo: no produce texto por si mismo, sino puntuaciones sobre la generacion del modelo base.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Moderacion de salidas en tiempo real: desplegado junto al modelo base en SGLang, el probe puntua cada token generado y permite cortar una respuesta en cuanto la probabilidad de inseguridad (`label_8`) supera el umbral calibrado de 0,5, antes de que el usuario reciba contenido problematico.
- Enrutado de consultas por intencion: las ocho etiquetas de intencion permiten clasificar la peticion del usuario y derivarla a un flujo, modelo o politica distinta (por ejemplo, consultas sensibles a un revisor humano) sin una llamada adicional a un clasificador externo.
- Mitigacion de alucinaciones en asistentes documentales: la puntuacion de alucinacion por token (`label_9`) permite marcar o descartar fragmentos de respuesta con alto riesgo cuando el modelo base responde sobre documentacion corporativa, reduciendo la propagacion de afirmaciones no respaldadas.
- Guardrail en pipelines de atencion al cliente: al operar sobre la generacion en curso con una ventana de 2048 tokens, encaja en conversaciones multi-turno donde se requiere filtrar respuestas sin anadir latencia perceptible por una segunda pasada de moderacion.
- Evaluacion offline de calidad de respuestas: las probabilidades por token pueden registrarse y analizarse para auditar lotes de generaciones, detectar patrones de alucinacion o medir la tasa de falsos positivos sobre respuestas benignas (reportada en 0,009 % sobre 5 datasets).
- Investigacion en interpretabilidad y seguridad: al leer capas intermedias concretas (12, 25, 39), sirve como herramienta para estudiar que representaciones internas correlacionan con intenciones maliciosas o con contenido no fiable.
- Filtrado en sistemas agenticos: en pipelines multi-paso, el probe puede evaluar cada respuesta intermedia del agente y detener la cadena si se detecta una intencion de consulta de riesgo o una respuesta insegura antes de ejecutar acciones posteriores.

## Benchmarks y rendimiento

| Tarea | Metrica | DeepSeek-V4.1-Flash-1017-singprobe | Baseline de referencia |
|---|---|---|---|
| Clasificacion de intencion de consulta (6 benchmarks) | F1 | 0,8756 | YuFeng-XGuard-Reason-8B (0,8714) |
| Clasificacion de seguridad de respuesta (8 benchmarks) | F1 | 0,8668 | Qwen3Guard-Gen-8B-strict (0,8604) |
| Seguridad en streaming (3 benchmarks) | AUC de respuesta / AUC por token | 0,9907 / 0,9522 | Qwen3Guard-Stream-8B-strict (0,9640 / 0,8893) |
| Deteccion de alucinacion (6 benchmarks) | AUC | 0,7951 | DRIFT (0,8000) |

| Caracteristica de despliegue | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,009 % de media sobre 5 datasets con el umbral de respuesta precalibracion de 0,987179 |
| Umbrales calibrados de publicacion | 0,5 para inseguridad de respuesta y 0,5 para alucinacion |

Cada benchmark tiene el mismo peso dentro de su suite. En las filas de F1 se selecciona un unico umbral por suite para maximizar el F1 medio. En deteccion de alucinacion el probe queda ligeramente por debajo del baseline DRIFT (0,7951 frente a 0,8000).

## Requisitos de hardware

- VRAM del probe: despreciable frente al modelo base; 10,10 M de parametros en bfloat16 equivalen a unos 20 MB de pesos.
- El coste real de hardware lo determina el modelo base DeepSeek-V4.1-Flash-1017, no el probe.
- El ejemplo oficial de despliegue emplea 8 GPU H20 con paralelismo tensorial 8 y `--ep-size 8`.
- Configuracion de servicio del ejemplo: `--context-length 16384`, `--chunked-prefill-size 1024`, `--max-prefill-tokens 8192`, `--max-total-tokens 32768`, `--max-running-requests 16`, `--mem-fraction-static 0.85`, con CUDA graphs deshabilitados en prefill y decode.
- Motor de inferencia: build especifico de SGLang (rama 261029) con soporte de token-probe; requiere `--trust-remote-code` y el flag `--probe-ckpt`.
- Compatibilidad con llama.cpp, Ollama o TGI: no disponible; el probe depende de las activaciones internas del modelo base y del soporte de SGLang.
- Latencia y throughput del probe: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / ventana | Metricas destacadas | Licencia |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-singprobe | 10,10 M | Probe de atencion sobre capas del modelo base, streaming | Ventana de 2048 tokens | F1 0,8756 (intencion), F1 0,8668 (seguridad), AUC 0,9907/0,9522 (streaming), AUC 0,7951 (alucinacion) | MIT |
| Qwen3Guard-Gen-8B-strict | 8 B | Modelo guardrail generativo | no disponible | F1 0,8604 (seguridad de respuesta) | no disponible |
| Qwen3Guard-Stream-8B-strict | 8 B | Guardrail en streaming | no disponible | AUC 0,9640/0,8893 (streaming) | no disponible |
| YuFeng-XGuard-Reason-8B | 8 B | Modelo guardrail con razonamiento | no disponible | F1 0,8714 (intencion de consulta) | no disponible |
| DRIFT | no disponible | Deteccion de alucinacion | no disponible | AUC 0,8000 (alucinacion) | no disponible |

La diferencia clave es de escala: SingProbe logra metricas comparables o superiores a guardrails generativos de 8 B con tres ordenes de magnitud menos de parametros, a cambio de quedar acoplado al modelo base y a un motor de inferencia especifico.

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona acoplado a DeepSeek-V4.1-Flash-1017 y leyendo sus capas 12, 25 y 39; no puede aplicarse a otros modelos sin reentrenamiento.
- Dependencia de un build no estandar de SGLang (rama 261029), lo que complica el despliegue y la actualizacion frente a versiones principales.
- En deteccion de alucinacion queda por debajo del baseline DRIFT (AUC 0,7951 frente a 0,8000).
- La ventana de sonda es de 2048 tokens; el comportamiento mas alla de esa ventana no esta documentado.
- Idiomas soportados no especificados: se desconoce si el probe mantiene su rendimiento fuera del ingles o del chino.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de falsos positivos: la tasa reportada del 0,009 % corresponde a un umbral precalibracion de 0,987179; con el umbral de publicacion de 0,5 el comportamiento sobre trafico benigno puede diferir.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopcion en produccion.
- Requiere `trust_remote_code`, lo que implica ejecutar codigo del autor del modelo.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017, que se distribuye por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/DeepSeek-V4.1-Flash-1017-singprobe
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.30703
- Repositorio SingProbe: https://github.com/inclusionAI/SingProbe
- Build de SGLang para token-probe (rama 261029): https://code.alipay.com/shaoshuo.shao/sglang/tree/261029
