# R0U5/Qwen3.5-4B-abliterated

## Resumen

Qwen3.5-4B-abliterated es una versión "abliterada" (sin dirección de rechazo) de Qwen3.5-4B, el modelo base de Qwen, publicada por el usuario R0U5 en HuggingFace. La abliteración es una técnica que elimina la dirección interna que provoca los rechazos de seguridad del modelo, permitiendo que responda a prompts que el modelo original declinaría. En este caso se ha utilizado el toolkit `lethe` con abliteración optimizada: direcciones de rechazo por capa y kernels de fuerza por capa, ajustados mediante 100 pruebas de Optuna TPE.

El modelo conserva la arquitectura y el tamaño del original (unos 4.200 millones de parámetros) y se distribuye en formato GGUF listo para llama.cpp y Ollama, con cuantizaciones Q4_K_M, Q5_K_M y Q8_0. Su interés es doble: por un lado, sirve como modelo sin restricciones de rechazo para investigación y casos de uso legítimos; por otro, su model card documenta con rigor metodológico cómo medir correctamente la tasa de rechazo tras la abliteración, algo que muchas publicaciones similares omiten. Cabe destacar un problema importante de plantilla de chat (el bloque de thinking debe desactivarse explícitamente) que se detalla en Limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredado de Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (4,21 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (el README sugiere num_ctx 32768 en Ollama) |
| Tipos de cuantizacion | Q4_K_M (~2,7 GB), Q5_K_M (~3,1 GB), Q8_0 (~4,5 GB) |
| Idiomas soportados | en (etiquetado; el modelo base Qwen suele ser multilingue, pero no consta en la ficha) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (repo original en safetensors, 10,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-4B: un transformer decoder de 4,21 B de parametros. No se trata de un reentrenamiento sino de una modificacion quirurgica de pesos: se calcula la direccion de rechazo a partir de conjuntos contrastivos de prompts daninos/inofensivos y se ortogonalizan las proyecciones de salida de atencion y de bajada del MLP (down projections) capa a capa, con kernels de fuerza por capa en lugar de un unico indice fijo. En total se modificaron 64 matrices.

La busqueda de hiperparametros se realizo con 100 pruebas de Optuna (TPE), minimizando la funcion de coste `refusal_rate + 1.0 × KL`, es decir, co-optimizando la reduccion de rechazos y la minimizacion de la divergencia KL respecto al modelo base en prompts benignos. El resultado final presenta una KL de 0,0727, mayor que la de una abliteracion mas ligera (~0,023), lo que implica una perdida de capacidad general esperable a cambio de una tasa de rechazo muy baja. No hubo RLHF ni DPO adicionales: el modelo hereda el entrenamiento completo de Qwen3.5-4B.

## Capacidades

- Generacion de texto conversacional, heredando las capacidades del modelo base Qwen3.5-4B.
- Respuesta a prompts que el modelo original rechazaria (tasa de rechazo medida en 1,7% con detector por capas frente al 93,2% del modelo base).
- Soporte del formato de plantilla de chat de Qwen3.5 con bloque de thinking (aunque debe desactivarse, ver Limitaciones).
- Compatibilidad con llama.cpp y Ollama mediante GGUF; etiqueta `endpoints_compatible` para despliegue con transformers.
- No hay informacion en la ficha sobre tool calling, agentes, vision ni audio; no disponible.

## Casos de uso

- Investigacion en alineacion y seguridad: al eliminar el comportamiento de rechazo, permite estudiar como responden los modelos base a contenido sensible y evaluar tecnicas de mitigacion externas (filtros de salida, guardrails).
- Redaccion de ficcion y contenido creativo sin restricciones: escritores que necesitan que el modelo aborde temas oscuros, violencia narrativa o dialogos moralmente ambiguos sin que el modelo interrumpa la generacion con avisos eticos.
- Clasificacion y analisis de contenido moderado: equipos de trust & safety pueden usarlo para analizar texto ofensivo o danino (por ejemplo, describir por que un mensaje es abuso) donde el modelo original se negaria a procesar el material.
- Pruebas de red teaming: generacion de escenarios adversariales para evaluar sistemas de seguridad de otros modelos, aprovechando que no se niega a role-play de atacante en entornos controlados.
- Asistentes locales privados en hardware modesto: con Q4_K_M (~2,7 GB) funciona en GPUs de 6-8 GB o incluso CPU, util para despliegues offline donde se controla la moderacion a nivel de aplicacion.
- Investigacion sobre abliteracion: el repositorio documenta el metodo completo (lethe, Optuna, detector por capas), por lo que sirve de referencia reproducible para comparar tecnicas de eliminacion de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, GSM8K, HumanEval) en la informacion disponible. La model card incluye una evaluacion propia sobre 59 prompts daninos reservados (held-out, nunca usados para ajustar la direccion de rechazo):

| Modelo | Rechazo (openers) | Rechazo (layered) | Degenerate | Proxy de capacidad |
|---|---|---|---|---|
| Qwen3.5-4B (base) | 91,5% | 93,2% | 0,0% | 5/5 |
| Qwen3.5-4B-abliterated | 0,0% | 1,7% | 0,0% | 5/5 |

Divergencia KL respecto al modelo base en prompts benignos: 0,0727. La model card advierte de que estos numeros son direccionales (conjunto pequeno, detector heuristico) y que no se ejecutaron benchmarks completos de capacidad.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,7 GB con Q4_K_M, ~3,1 GB con Q5_K_M y ~4,5 GB con Q8_0, mas overhead de contexto (el README recomienda num_ctx 32768 en Ollama).
- GPUs recomendadas: cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060 Ti, RTX 4070) para Q4_K_M/Q5_K_M; para Q8_0 conviene 8 GB o mas. No se requiere A100 ni H100.
- Cabe sobradamente en GPUs consumer; tambien es viable en CPU pura via llama.cpp, con latencia proporcionalmente mayor (no se publican cifras).
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja --reasoning off`), Ollama (con Modelfile y reasoning desactivado), y transformers de HuggingFace con los pesos originales.
- Latencia y throughput: no disponible; al ser un modelo de 4 B en GGUF cuantizado, se espera inferencia rapida en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tasa de rechazo | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-abliterated (este) | 4,21 B | GGUF (Q4/Q5/Q8) | 1,7% (layered) | Apache 2.0 | Abliteracion optimizada con lethe; KL 0,0727 |
| Qwen/Qwen3.5-4B (base) | 4,21 B | Safetensors | 93,2% (layered) | Apache 2.0 | Modelo original con alineacion intacta |
| Otros modelos abliterados de 4 B | no disponible | no disponible | no disponible | no disponible | La ficha no referencia alternativas concretas |

No hay mas alternativas comparables documentadas en la informacion disponible.

## Limitaciones y advertencias

- Problema critico de plantilla: hay que desactivar el thinking obligatoriamente (`--reasoning off` en llama.cpp o `enable_thinking: false`), o el bloque de razonamiento nunca se cierra y el modelo devuelve `content: ""` con `finish_reason: length`. Verificar con `/apply-template` que el prompt termina en un bloque think cerrado y vacio.
- Salidas prolijas: ~95% de las completaciones agotan un presupuesto de 96 tokens sin terminar; conviene subir `max_tokens` significativamente.
- Perdida de capacidad: la KL de 0,0727 indica cierto desvanecimiento de capacidades generales respecto al base; no se han medido MMLU/GSM8K/PPL.
- Riesgo de contenido danino: la abliteracion elimina el rechazo, no anade capacidad ni corrige errores; el modelo puede generar contenido ofensivo, ilegal o impreciso. No apto para produccion sin capas de moderacion propias.
- Alucinaciones: al heredar el modelo base sin ajuste adicional, el riesgo de alucinacion es el de Qwen3.5-4B, sin mitigaciones anadidas.
- Metricas heuristicas: la tasa de rechazo del 1,7% proviene de un detector regex por capas validado solo sobre 59 prompts; tratarla como orientativa.
- Idioma: la ficha etiqueta el modelo como ingles; el rendimiento en castellano no esta documentado (aunque los modelos Qwen suelen ser multilingues).
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base hereda la licencia de Qwen; revisar los terminos de Qwen para despliegues comerciales a gran escala.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/R0U5/Qwen3.5-4B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
