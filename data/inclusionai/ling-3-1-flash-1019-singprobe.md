# inclusionAI/Ling-3.1-flash-1019-singprobe

## Resumen

Ling-3.1-flash-1019-singprobe es una sonda de atencion (probe) de 8,13 millones de parametros desarrollada por inclusionAI que se acopla al modelo base Ling-3.1-flash-1019 para actuar como guardrail intrinseco en tiempo de generacion. No es un modelo generativo autonomo: lee las representaciones ocultas de tres capas del modelo base (capas 23, 47 y 71, indexadas desde cero) y produce, token a token, puntuaciones de intencion de la consulta, inseguridad de la respuesta y riesgo de alucinacion.

Su relevancia reside en que integra la moderacion y la deteccion de alucinaciones dentro del bucle de decodificacion, en lugar de depender de un clasificador externo que solo evalua el texto final. Esto permite senalizar contenido problematico mientras se genera la respuesta, lo que resulta especialmente util en entornos de streaming y en pipelines de agentes donde la latencia de un segundo modelo moderador es inaceptable.

La sonda emite 10 etiquetas: ocho (`label_0` a `label_7`) para clasificar la intencion de la consulta, `label_8` para la inseguridad de la respuesta y `label_9` para el riesgo de alucinacion. Se distribuye bajo licencia MIT con pesos en bfloat16 y requiere el codigo personalizado del repositorio, ademas de una bifurcacion especifica de SGLang para su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de atencion (attention head) sobre representaciones ocultas de un transformer; 8 cabezas, dimension de cabeza 64 |
| Parametros totales | 8.132.106 (8,13 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | ventana de 2.048 tokens para la sonda; el modelo base se sirve con `--context-length 16384` |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors con `custom_code` (requiere `--trust-remote-code`) |

## Arquitectura y entrenamiento

La sonda es un modulo ligero de atencion con 8 cabezas de dimension 64 que se engancha a las salidas ocultas de las capas 23, 47 y 71 del modelo base Ling-3.1-flash-1019. A partir de esas tres representaciones, y operando sobre una ventana de 2.048 tokens, calcula simultaneamente tres tareas: clasificacion de intencion de la consulta en 8 categorias, clasificacion de inseguridad de la respuesta y deteccion de alucinacion. El modelo base no se modifica; la sonda se ejecuta en paralelo durante la decodificacion y expone sus puntuaciones por token.

No se detalla en la informacion disponible la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas de RLHF o DPO. La model card remite al informe tecnico de SingProbe (arXiv:2608.30703) y al repositorio del proyecto para el metodo y el codigo de entrenamiento. Como innovacion destacable, la sonda permite evaluacion por token en streaming, con umbrales calibrados de 0,5 para inseguridad de respuesta y alucinacion, y un umbral de respuesta pre-calibrado de 0,983085 para el calculo de falsos positivos.

## Capacidades

- Clasificacion de intencion de la consulta en 8 categorias mediante las etiquetas `label_0` a `label_7`.
- Deteccion de inseguridad de la respuesta en tiempo real (`label_8`), con puntuacion por token.
- Deteccion de alucinacion (`label_9`), con puntuacion por token durante la generacion.
- Evaluacion en streaming: las puntuaciones se emiten a medida que el modelo decodifica, no solo sobre el texto final.
- Integracion en la respuesta de `/generate` mediante `meta_info.token_probe_probs`.
- Funciona como guardrail intrinseco acoplado al modelo base, sin un segundo modelo moderador independiente.
- No es un modelo generativo: no produce texto, codigo ni respuestas por si mismo.
- No se documentan capacidades multilingues, de vision, audio ni tool calling propias de la sonda.

## Casos de uso

- Moderacion en streaming de asistentes conversacionales: la sonda puntua la inseguridad de cada token mientras el modelo base responde, lo que permite cortar o reescribir la salida antes de que se complete una respuesta danina, sin esperar a un clasificador posterior.
- Deteccion de alucinaciones en generacion aumentada por recuperacion (RAG): con `label_9` evaluando el riesgo por token, un sistema puede marcar fragmentos sospechosos de no estar respaldados por el contexto recuperado y degradar a una respuesta de absto o a una verificacion adicional.
- Enrutado de consultas por intencion: las ocho etiquetas de intencion permiten dirigir cada peticion a un flujo distinto (soporte, facturacion, consulta tecnica, etc.) sin un clasificador separado, aprovechando las representaciones que el modelo base ya calcula.
- Guardrail en pipelines de agentes multi-paso: al evaluar cada turno generado por el agente, la sonda puede bloquear acciones o respuestas inseguras antes de que se ejecute el siguiente paso, reduciendo el riesgo de propagacion de errores.
- Cumplimiento y auditoria en produccion: el registro de `token_probe_probs` por peticion proporciona una traza por token de las puntuaciones de seguridad y alucinacion, util para auditoria posterior y para ajustar umbrales por dominio.
- Filtrado de salidas en aplicaciones de atencion al cliente con contexto largo: el modelo base se sirve con 16.384 tokens de contexto y la sonda evalua la respuesta en ventanas de 2.048 tokens, lo que permite moderar conversaciones multi-turno extensas.
- Investigacion en seguridad de modelos: al ser una sonda de 8,13 M de parametros sobre un modelo base concreto, sirve como banco de pruebas para estudiar la deteccion temprana de alucinaciones y la calibracion de umbrales en decodificacion.

## Benchmarks y rendimiento

| Tarea | Metrica | Ling-3.1-flash-1019-singprobe | Baseline de referencia |
|---|---|---:|---|
| Clasificacion de intencion de consulta (6 benchmarks) | F1 | 0,8687 | YuFeng-XGuard-Reason-8B (0,8714) |
| Clasificacion de seguridad de respuesta (8 benchmarks) | F1 | 0,8707 | Qwen3Guard-Gen-8B-strict (0,8604) |
| Seguridad en streaming (3 benchmarks) | AUC de respuesta / AUC por token | 0,9844 / 0,9411 | Qwen3Guard-Stream-8B-strict (0,9640 / 0,8893) |
| Deteccion de alucinacion (6 benchmarks) | AUC | 0,8041 | DRIFT (0,8000) |

| Caracteristica de despliegue | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,008 % de media sobre 5 datasets, con umbral de respuesta pre-calibrado de 0,983085 |
| Umbrales calibrados de publicacion | 0,5 para inseguridad de respuesta y 0,5 para alucinacion |

Cada benchmark tiene el mismo peso dentro de su suite. La F1 de intencion de consulta se calcula sobre respuestas generadas; la de seguridad de respuesta, sobre respuestas proporcionadas por el benchmark. Para cada fila de F1 se selecciona un unico umbral en toda la suite que maximiza la F1 media.

## Requisitos de hardware

- La sonda en si ocupa unos 8,13 M de parametros en bfloat16 (del orden de 16 MB), por lo que su coste de memoria es despreciable frente al modelo base.
- El requisito real lo marca Ling-3.1-flash-1019: el ejemplo de despliegue de la model card emplea 8 GPU H20 con `--tp 8` y `--ep-size 8`.
- No se especifica la VRAM total necesaria para el modelo base ni si cabe en GPU de consumo (RTX 4090, etc.); no disponible.
- Despliegue mediante SGLang, en concreto la compilacion con soporte de token-probe de la rama 261029, con `--trust-remote-code` y montaje de ambos directorios (modelo base y checkpoint de la sonda).
- Parametros de servicio de referencia: `--context-length 16384`, `--chunked-prefill-size 1024`, `--max-prefill-tokens 8192`, `--max-total-tokens 32768`, `--max-running-requests 16`, `--mem-fraction-static 0.85`, CUDA graphs deshabilitados en prefill y decode.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.1-flash-1019-singprobe | 8,13 M (sonda) | ventana de 2.048 tokens; base servido con 16.384 | Guardrail intrinseco en streaming sobre modelo base | MIT | Hugging Face, requiere SGLang modificado |
| YuFeng-XGuard-Reason-8B | 8 B | no disponible | Guardrail generativo con razonamiento | no disponible | no disponible |
| Qwen3Guard-Gen-8B-strict | 8 B | no disponible | Guardrail generativo | no disponible | no disponible |
| Qwen3Guard-Stream-8B-strict | 8 B | no disponible | Guardrail en streaming | no disponible | no disponible |
| DRIFT | no disponible | no disponible | Deteccion de alucinacion | no disponible | no disponible |

La comparacion es asimetrica por diseno: la sonda de inclusionAI tiene tres ordenes de magnitud menos parametros que los guardrails generativos de 8 B, pero depende de un modelo base concreto y de un stack de servicio especifico. En las metricas publicadas queda ligeramente por debajo de YuFeng-XGuard-Reason-8B en F1 de intencion (0,8687 frente a 0,8714) y por encima de Qwen3Guard-Gen-8B-strict en seguridad de respuesta (0,8707 frente a 0,8604), de Qwen3Guard-Stream-8B-strict en streaming (0,9844/0,9411 frente a 0,9640/0,8893) y de DRIFT en alucinacion (0,8041 frente a 0,8000).

## Limitaciones y advertencias

- La sonda no es un modelo autonomo: solo funciona acoplada a Ling-3.1-flash-1019 y lee sus capas 23, 47 y 71; no es portable a otros modelos sin reentrenamiento.
- Requiere codigo personalizado (`--trust-remote-code`) y una bifurcacion no estandar de SGLang (rama 261029), lo que anade riesgo de mantenimiento y de compatibilidad con versiones futuras.
- La ventana de evaluacion de la sonda es de 2.048 tokens; el comportamiento mas alla de esa ventana no esta documentado.
- No se especifican los idiomas soportados ni el rendimiento por idioma; la cobertura multilingue es desconocida.
- No se detalla la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos conocidos; no disponible.
- El umbral de respuesta pre-calibrado de 0,983085 es el usado para la tasa de falsos positivos del 0,008 %; reutilizarlo en otro dominio sin recalibrar puede alterar drasticamente esa tasa.
- Los resultados de benchmarks proceden de la propia model card y no se han verificado de forma independiente.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, y el repositorio figura con 0,0 GB de tamano; conviene verificar la integridad de los pesos antes de usarlo en produccion.
- La licencia MIT permite uso comercial, pero el modelo base Ling-3.1-flash-1019 puede tener condiciones propias que deben revisarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inclusionAI/Ling-3.1-flash-1019-singprobe
- Informe tecnico de SingProbe (arXiv): https://arxiv.org/abs/2608.30703
- Repositorio SingProbe: https://github.com/inclusionAI/SingProbe
- Rama de SGLang con soporte de token-probe: https://code.alipay.com/shaoshuo.shao/sglang/tree/261029
- Modelo base: Ling-3.1-flash-1019 (referenciado en la model card; URL no disponible)
