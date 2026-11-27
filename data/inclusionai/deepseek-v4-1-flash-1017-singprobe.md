# inclusionAI/DeepSeek-V4.1-Flash-1017-singprobe

## Resumen

DeepSeek-V4.1-Flash-1017-singprobe es una sonda de atencion (attention probe) de 10,10 millones de parametros desarrollada por inclusionAI que se acopla al modelo base DeepSeek-V4.1-Flash-1017 para actuar como guardrail intrinseco en tiempo de generacion. No es un modelo generativo autonomo: es un cabezal de atencion adicional que lee los estados ocultos de las capas 12, 25 y 39 del modelo base (indexadas desde cero) y emite puntuaciones por token sobre tres dimensiones: intencion de la consulta (8 clases), inseguridad de la respuesta y riesgo de alucinacion.

El problema que resuelve es la moderacion y deteccion de alucinaciones en streaming, es decir, sin esperar a que la respuesta completa este generada. Al puntuar cada token durante la decodificacion, permite cortar o filtrar salidas peligrosas o no fundamentadas en el momento en que se producen, lo que reduce la latencia de reaccion frente a clasificadores externos que requieren la respuesta completa. Esto es relevante para despliegues de agentes y atencion al cliente donde el coste de una alucinacion o de una respuesta insegura es alto.

Tecnicamente, la sonda usa 8 cabezas de atencion con dimension de cabeza 64 y una ventana de 2.048 tokens, con pesos en bfloat16. Se distribuye bajo licencia MIT y requiere un build especifico de SGLang que expone las puntuaciones por token. El repo es ligero (0,0 GB) porque solo contiene los pesos de la sonda, no el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda de atencion (8 cabezas, dim. de cabeza 64) sobre estados ocultos del modelo base; ventana de 2.048 tokens |
| Parametros totales | 10.098.186 (10,10 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de sonda de 2.048 tokens; el modelo base se sirve con context-length 16.384 en el ejemplo oficial |
| Tipos de cuantizacion | no disponible (pesos de release en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (con custom_code; requiere trust-remote-code) |

## Arquitectura y entrenamiento

La sonda es un modulo de atencion ligero que se engancha a tres capas del transformer base (12, 25 y 39) y consume sus estados ocultos durante la generacion. Con 8 cabezas de dimension 64 y una ventana deslizante de 2.048 tokens, produce 10 salidas por token: `label_0` a `label_7` para las 8 clases de intencion de consulta, `label_8` para inseguridad de la respuesta y `label_9` para riesgo de alucinacion. Los pesos se publican en bfloat16.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se empleo RLHF o DPO. La model card remite al informe tecnico (arXiv:2608.30703) y al repositorio de SingProbe para el metodo y el codigo de entrenamiento. La innovacion principal es el enfoque de guardrail intrinseco en streaming: en lugar de un clasificador externo sobre el texto generado, la sonda lee representaciones internas y puntua token a token, lo que permite intervenir durante la decodificacion.

## Capacidades

- Clasificacion de intencion de consulta en 8 clases (`label_0` a `label_7`).
- Deteccion de inseguridad en la respuesta (`label_8`), pensada para moderacion y guardrail.
- Deteccion de alucinacion (`label_9`) a nivel de token.
- Puntuacion en streaming: emite probabilidades por token durante la generacion, no solo sobre la respuesta completa.
- Integracion con SGLang mediante un build especifico que expone `meta_info.token_probe_probs` en la respuesta de `/generate`.
- No genera texto por si misma: depende del modelo base DeepSeek-V4.1-Flash-1017 para la generacion.
- Soporte de tool calling, agentes o vision: no disponible (la sonda no aporta estas capacidades; dependen del modelo base).
- Capacidades multilingues: no disponible.

## Casos de uso

- Moderacion en streaming de asistentes conversacionales: la sonda puntua cada token con `label_8` y permite abortar una respuesta insegura a mitad de generacion, antes de que el usuario reciba el contenido completo.
- Deteccion de alucinaciones en respuestas factuales: usando `label_9` por token, un orquestador puede marcar o descartar fragmentos con alto riesgo de alucinacion en dominios como salud, finanzas o soporte tecnico.
- Enrutado por intencion de consulta: las 8 clases de `label_0`–`label_7` permiten derivar la peticion a distintos flujos (soporte, ventas, escalado a humano) sin un clasificador separado.
- Guardrail en pipelines de agentes multi-paso: al puntuar cada paso de generacion, se puede detener una cadena de acciones si la inseguridad o el riesgo de alucinacion superan el umbral calibrado (0,5 para ambas dimensiones en el release).
- Cumplimiento y auditoria: registrar las probabilidades por token como traza de auditoria para revisar por que se bloqueo o acepto una respuesta, con umbrales documentados.
- Reduccion de falsos positivos en moderacion: con una tasa de falsos positivos en respuestas benignas del 0,009% promediada sobre 5 datasets, es adecuada para entornos donde bloquear respuestas validas tiene coste alto.
- Filtrado en produccion con SGLang: al integrarse en el servidor de inferencia (ejemplo con `--tp-size 8 --ep-size 8`), permite aplicar el guardrail sin un servicio de moderacion adicional.

## Benchmarks y rendimiento

Cada benchmark tiene el mismo peso en su suite. Query F1 usa respuestas generadas; Response safety F1 usa las respuestas proporcionadas por el benchmark. Para cada fila F1 se selecciona un unico umbral sobre la suite que maximiza el F1 medio.

| Tarea | Metrica | DeepSeek-V4.1-Flash-1017-singprobe | Baseline de referencia |
|---|---|---:|---:|
| Clasificacion de intencion de consulta (6 benchmarks) | F1 | 0,8756 | YuFeng-XGuard-Reason-8B (0,8714) |
| Clasificacion de seguridad de respuesta (8 benchmarks) | F1 | 0,8668 | Qwen3Guard-Gen-8B-strict (0,8604) |
| Seguridad en streaming (3 benchmarks) | AUC respuesta / AUC token | 0,9907 / 0,9522 | Qwen3Guard-Stream-8B-strict (0,9640 / 0,8893) |
| Deteccion de alucinaciones (6 benchmarks) | AUC | 0,7951 | DRIFT (0,8000) |

| Caracteristica de despliegue | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,009% (media sobre 5 datasets, con umbral de respuesta pre-calibracion de 0,987179) |
| Umbrales calibrados del release | 0,5 para inseguridad de respuesta y 0,5 para alucinacion |

## Requisitos de hardware

- La sonda en si ocupa muy poco (10,10 M de parametros en bfloat16, repo de 0,0 GB); el coste real lo determina el modelo base DeepSeek-V4.1-Flash-1017.
- El ejemplo oficial de despliegue usa 8 GPU con `--tp-size 8 --ep-size 8`, `--mem-fraction-static 0.85` y `--context-length 16384`, lo que indica que el modelo base requiere un despliegue multi-GPU de gama alta (clase A100/H100) en esa configuracion.
- VRAM estimada para la sonda sola: no disponible de forma explicita; por tamano de pesos es del orden de decenas de MB, despreciable frente al modelo base.
- Inferencia en GPU consumer: no disponible para el conjunto base+sonda; la configuracion documentada es de 8 GPU.
- Opciones de despliegue: build especifico de SGLang de SingProbe (repositorio en GitHub). No se documentan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible. La configuracion de ejemplo limita a `--max-running-requests 4` y desactiva CUDA graphs en prefill y decode.
- Restricciones de despliegue: requiere `--trust-remote-code` y pesos con `custom_code`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---:|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-singprobe | Sonda de guardrail sobre modelo base | 10,10 M | ventana de sonda 2.048 tokens | Query F1 0,8756; safety F1 0,8668; streaming AUC 0,9907/0,9522; hallucination AUC 0,7951 | MIT | Hugging Face |
| YuFeng-XGuard-Reason-8B | Guardrail/clasificador | 8 B | no disponible | Query F1 0,8714 | no disponible | no disponible |
| Qwen3Guard-Gen-8B-strict | Guardrail generativo | 8 B | no disponible | Safety F1 0,8604 | no disponible | no disponible |
| Qwen3Guard-Stream-8B-strict | Guardrail en streaming | 8 B | no disponible | Streaming AUC 0,9640/0,8893 | no disponible | no disponible |
| DRIFT | Detector de alucinaciones | no disponible | no disponible | Hallucination AUC 0,8000 | no disponible | no disponible |

La ventaja diferencial de SingProbe es su tamano (10,10 M frente a 8 B de los baselines) manteniendo o superando el F1/AUC en tres de las cuatro tareas, salvo en deteccion de alucinaciones, donde DRIFT obtiene 0,8000 frente a 0,7951.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base DeepSeek-V4.1-Flash-1017 y un build especifico de SGLang; no funciona como clasificador de texto independiente.
- Dependencia de capas concretas: la sonda lee las capas 12, 25 y 39 del base; cualquier cambio o fine-tuning del base puede invalidar la calibracion.
- En deteccion de alucinaciones queda ligeramente por debajo de DRIFT (AUC 0,7951 frente a 0,8000), por lo que no es la mejor opcion si esa es la unica tarea critica.
- La ventana de la sonda es de 2.048 tokens, inferior al contexto de 16.384 del ejemplo de despliegue; el comportamiento mas alla de esa ventana no esta documentado.
- Idiomas soportados no disponibles: no se puede garantizar el rendimiento en castellano u otros idiomas sin evaluacion propia.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion del propio guardrail (falsos negativos) no cuantificado mas alla de las metricas AUC/F1; los umbrales calibrados (0,5) son un punto de partida que conviene reajustar por dominio.
- La tasa de falsos positivos del 0,009% se midio con un umbral pre-calibracion de 0,987179; no es directamente trasladable al umbral de release de 0,5.
- Licencia MIT permite uso comercial, pero el modelo base puede tener sus propias condiciones que deben verificarse por separado.
- Requiere `--trust-remote-code` y ejecucion de codigo personalizado: implica revisar el codigo antes de desplegar en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/DeepSeek-V4.1-Flash-1017-singprobe
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.30703
- Repositorio SingProbe: https://github.com/inclusionAI/SingProbe
- Build de SGLang para SingProbe: https://github.com/inclusionAI/SingProbe/tree/main/sglang#token-probe-inference
