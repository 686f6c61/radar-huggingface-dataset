# inclusionAI/Qwen3.8-Flash-Next-singprobe

## Resumen

Qwen3.8-Flash-Next-singprobe es una sonda de seguridad (guardrail) intrínseca desarrollada por el equipo Sing de inclusionAI, construida sobre el modelo base Qwen/Qwen3.8-Flash-Next. A diferencia de los guardrails clásicos, que despliegan un modelo de moderación separado y añaden una segunda pasada de inferencia, SingProbe reutiliza los hidden states del propio modelo base durante la generación para puntuar, token a token, la intención de la consulta, el riesgo de respuesta insegura y el riesgo de alucinación.

El artefacto publicado en Hugging Face no es un LLM completo, sino una sonda ligera de 5,18 millones de parámetros (dato real extraído de los safetensors) que se conecta a las capas 15, 31 y 47 del modelo base. Devuelve 10 salidas por token: 8 clases de intención, una puntuación de inseguridad y una puntuación de alucinación, con menos del 0,5 % de sobrecoste en decodificación.

Su relevancia actual radica en que resuelve el principal problema de los guardrails en streaming: detectar contenido inseguro o alucinaciones mientras se genera, sin penalizar la latencia ni duplicar la infraestructura. Los benchmarks publicados muestran resultados superiores a referencias mucho mayores, como Qwen3Guard-Gen-8B y Qwen3Guard-Stream-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda lineal (probe) sobre hidden states de un transformer base (sing_probe_attn) |
| Parametros totales | 5.182.986 (5,18 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (la hereda del modelo base Qwen3.8-Flash-Next) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | safetensors |

Datos adicionales de la sonda:

| Parametro | Valor |
|---|---|
| Modelo base | Qwen/Qwen3.8-Flash-Next (finetune sobre el mismo) |
| Capas interceptadas | [15, 31, 47] |
| Salidas | 8 intents + unsafe + hallucination (label_0 a label_9) |
| Sobrecoste en decodificacion | < 0,5 % |

## Arquitectura y entrenamiento

SingProbe es una sonda ligera que se acopla al modelo base Qwen3.8-Flash-Next en tiempo de inferencia. En lugar de ejecutar un clasificador externo, intercepta los hidden states en tres capas concretas del transformer base (15, 31 y 47) y, a partir de ellos, produce en cada token generado tres tipos de puntuación: clasificación de la intención de la consulta del usuario en 8 categorías, puntuación de inseguridad de la respuesta en curso y puntuación de riesgo de alucinación. El tag `sing_probe_attn` sugiere un mecanismo de atención propio de la sonda, aunque la model card no detalla su implementación interna.

La model card no especifica el dataset de entrenamiento, el numero de tokens ni el procedimiento exacto (RLHF/DPO u otros), aunque los benchmarks de evaluación se promedian sobre 6 suites para intención, 8 para seguridad de respuesta, 3 para seguridad en streaming y 6 para detección de alucinaciones. La metodología completa está descrita en el informe técnico de arXiv (arXiv:2608.30703) y el codigo de entrenamiento está disponible en GitHub (inclusionAI/SingProbe).

## Capacidades

- Clasificacion de la intencion de la consulta en 8 categorias, evaluada token a token durante la generacion.
- Deteccion de respuestas inseguras (guardrail de seguridad) de forma intrinseca, sin modelo de moderacion separado.
- Deteccion de alucinaciones en tiempo real mediante una puntuacion AUC por token.
- Funcionamiento en streaming: emite un diccionario de puntuaciones (label_0 a label_9) por cada token generado, lo que permite abortar o intervenir a mitad de generacion.
- Sobrecoste de decodificacion inferior al 0,5 %, apto para produccion con latencias criticas.
- Tasa de falsos positivos muy baja en respuestas benignas: 0,03 % de media en 5 datasets.
- Integracion nativa con SGLang y vLLM mediante ramas especificas de esos frameworks.
- No es un modelo generativo: no produce texto, codigo ni razonamiento por si mismo; depende del modelo base.

## Casos de uso

- Moderacion en streaming para chatbots: el sistema puede cortar o reescribir una respuesta en cuanto la puntuacion de inseguridad supera un umbral, en lugar de esperar a que termine toda la generacion, gracias a la salida por token.
- Deteccion temprana de alucinaciones en RAG: en un pipeline de generacion aumentada por recuperacion, la puntuacion de alucinacion permite reintentar la respuesta o activar un fallback antes de mostrar contenido erroneo al usuario.
- Enrutamiento de consultas por intencion: las 8 clases de intencion permiten dirigir cada peticion al agente o modelo adecuado (por ejemplo, separar consultas de codigo de consultas de soporte) sin una pasada adicional de clasificacion.
- Cumplimiento normativo en atencion al cliente: la clasificacion de intencion combinada con la puntuacion de seguridad facilita auditar conversaciones y aplicar politicas sectoriales (finanzas, salud) en tiempo real.
- Reduccion de costes de infraestructura de seguridad: al anadir menos del 0,5 % de sobrecoste, sustituye a modelos guardrail de 8B separados, ahorrando VRAM y una segunda pasada de inferencia.
- Agentes con autochequeo: en bucles agenticos multi-paso, la puntuacion de alucinacion por token puede usarse como senal para activar verificacion externa (tool calling, busqueda web) solo cuando el riesgo es alto.
- Filtros de seguridad para despliegues multitenant: plataformas que sirven multiples modelos pueden estandarizar la moderacion cargando la sonda junto al modelo base en el mismo servidor SGLang o vLLM.

## Benchmarks y rendimiento

Resultados publicados en la model card (media sobre las suites indicadas; mas alto es mejor en todas las metricas):

| Tarea | Metrica | Qwen3.8-Flash-Next-singprobe | Baseline de referencia |
|---|---|---:|---:|
| Clasificacion de intencion (6 benchmarks) | F1 | 0,8728 | YuFeng-XGuard-Reason-8B: 0,8714 |
| Clasificacion de seguridad de respuesta (8 benchmarks) | F1 | 0,8714 | Qwen3Guard-Gen-8B-strict: 0,8604 |
| Seguridad en streaming (3 benchmarks) | R-AUC / T-AUC | 0,9882 / 0,9320 | Qwen3Guard-Stream-8B-strict: 0,9640 / 0,8893 |
| Deteccion de alucinaciones (6 benchmarks) | AUC | 0,8063 | DRIFT: 0,8000 |

Caracteristicas de despliegue publicadas:

| Caracteristica | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,03 % (media en 5 datasets) |
| Sobrecoste en decodificacion | < 0,5 % |

No se han publicado benchmarks de MMLU, HumanEval, GSM8K ni similares, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM de la sonda: 5,18 millones de parametros en fp32 ocupan aproximadamente 20 MB; en fp16/bf16, unos 10 MB. El consumo real viene determinado por el modelo base Qwen3.8-Flash-Next, cuyas especificaciones no estan disponibles en la informacion proporcionada.
- GPU recomendadas: no disponible de forma explicita; al integrarse en SGLang o vLLM, cualquier GPU compatible con el modelo base sirve, ya que la sonda anade una carga despreciable.
- Consumer GPUs: la sonda en si cabe en cualquier GPU moderna; la limitacion la impone el modelo base.
- Despliegue: mediante la rama de SGLang con soporte de token probes (github.com/jinzhen-lin/sglang, rama token-probe-ling3-flash-main) o la rama de vLLM equivalente (github.com/jinzhen-lin/vllm, rama bailing-v3-token-probe). El lanzamiento se hace con `--probe-ckpt inclusionAI/Qwen3.8-Flash-Next-singprobe` junto al modelo base. No hay soporte documentado para llama.cpp ni Ollama.
- Latencia y throughput: el sobrecoste de decodificacion es inferior al 0,5 %; no se publican cifras absolutas de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Enfoque | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-singprobe | Sonda intrinseca en streaming | 5,18 M | Seguridad + intencion + alucinacion por token | F1 seguridad 0,8714; R-AUC 0,9882 | qwen-community-1.0 |
| Qwen3Guard-Gen-8B-strict | Guardrail generativo separado | 8B | Clasificacion de seguridad post-generacion | F1 0,8604 | no disponible |
| Qwen3Guard-Stream-8B-strict | Guardrail generativo en streaming | 8B | Seguridad en streaming | R-AUC 0,9640 / T-AUC 0,8893 | no disponible |
| YuFeng-XGuard-Reason-8B | Guardrail con razonamiento | 8B | Clasificacion de intencion | F1 0,8714 | no disponible |

La ventaja diferencial es el tamano: SingProbe consigue metricas iguales o superiores a guardrails de 8B con menos del 0,1 % de sus parametros y sin segunda pasada de inferencia, aunque requiere el emparejamiento exacto con Qwen/Qwen3.8-Flash-Next.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni razonamiento; solo emite puntuaciones de clasificacion y depende por completo del modelo base.
- Empleo exclusivo con su pareja de modelo base: la model card exige usar exactamente Qwen/Qwen3.8-Flash-Next con este checkpoint; usarlo con otro modelo invalida los resultados.
- Soporte limitado a ramas concretas de SGLang y vLLM; no hay integracion oficial en las ramas main de esos frameworks ni en llama.cpp u Ollama, lo que puede complicar actualizaciones y mantenimiento.
- Deteccion de alucinaciones con AUC de 0,8063: util como senal de riesgo, pero insuficiente como unico mecanismo de verificacion factual en aplicaciones criticas.
- Posibles sesgos heredados del modelo base y de los datasets de entrenamiento de la sonda; la model card no documenta auditorias de sesgo.
- Licencia qwen-community-1.0 (other): hay que revisar los terminos del enlace a la licencia de Qwen antes de uso comercial; no es una licencia permisiva estandar como Apache 2.0.
- Repo recien publicado (octubre de 2026), con muy pocas descargas (395) y 2 likes: madurez comunitaria y validacion externa limitadas.
- Las puntuaciones por token requieren calibracion de umbrales por aplicacion; la model card no publica umbrales recomendados.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/inclusionAI/Qwen3.8-Flash-Next-singprobe
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.30703
- Codigo de entrenamiento (GitHub): https://github.com/inclusionAI/SingProbe
- Rama de SGLang con soporte de probes: https://github.com/jinzhen-lin/sglang/tree/token-probe-ling3-flash-main
- Rama de vLLM con soporte de probes: https://github.com/jinzhen-lin/vllm/tree/bailing-v3-token-probe
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
