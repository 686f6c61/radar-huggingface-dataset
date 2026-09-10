# semianalysisai/Qwen3.6-35B-A3B-MOPD-Miles-20260910

## Resumen

Qwen3.6-35B-A3B-MOPD-Miles-20260910 es un checkpoint de investigacion publicado por semianalysisai que constituye el alumno resultante de 40 actualizaciones de destilacion on-policy multi-profesor (Multi-Teacher On-Policy Distillation, MOPD) sobre el modelo base Qwen/Qwen3.6-35B-A3B. El entrenamiento se implemento con Miles (PR 3116) y se apoya en dos profesores congelados especializados en dominios de puzzle: un profesor de Countdown entrenado con GRPO y un profesor de coloreado de grafos tambien entrenado con GRPO. El modelo no pretende ser un asistente generalista, sino un artefacto de investigacion para estudiar tecnicas de destilacion por rutado de candidatos.

La arquitectura heredada es una mezcla de expertos (MoE) de la familia Qwen3.5/Qwen3.6, con 35.505.251.456 parametros totales y un subconjunto activo por token del orden de 3.000 millones segun la nomenclatura A3B del modelo base. El repositorio ocupa 71,0 GB en safetensors. La relevancia actual es metodologica: el checkpoint demuestra una mejora muy grande en dos dominios de razonamiento verificable mediante un bucle sincrono de rollouts del alumno y puntuaciones de profesor en modo solo prefill (`max_new_tokens=0`), sin actualizar los profesores.

Se trata de un checkpoint especialista, con evaluacion limitada a dos dominios cortos de puzzle (Countdown y coloreado de grafos), un unico seed de entrenamiento y sin evaluacion de capacidades generales, seguridad o retencion de tareas fuera de dominio. La model card lo declara explicitamente como resultado de investigacion y no reproduce numericamente los resultados del PR en H200: la ejecucion se realizo en B200 y uso el fallback denso de puntuacion por ID solicitado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, etiqueta de arquitectura `qwen3_5_moe` |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (deducido de la nomenclatura A3B del modelo base; no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; el entrenamiento se realizo en BF16) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors; se incluyen tokenizer y ficheros de configuracion |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, una arquitectura MoE con 35,5 mil millones de parametros totales y activacion dispersa por token. Sobre ese punto de partida se aplico un objetivo de destilacion on-policy multi-profesor con rutado de tokens candidatos: cada puzzle se enruta a su especialista de dominio, los profesores permanecen congelados y solo se actualiza el alumno. El bucle de Miles es sincrono: el alumno genera respuestas, se solicitan puntuaciones de profesor en modo solo prefill con `max_new_tokens=0`, se aplica el objetivo sobre tokens candidatos y se sincronizan los pesos del motor de rollout. La revision inicial del alumno fue `995ad96eacd98c81ed38be0c5b274b04031597b0`.

La configuracion exacta del run incluye 40 ciclos, 128 prompts por ciclo, una respuesta por prompt, top-16 candidatos del alumno, refresco de recompensa, pesos estaticos e iguales por dominio, coeficiente OPD 1, recorte de candidatos 0,2 y doble recorte para ventaja negativa de 3,0. El optimizador fue Adam con LR constante 1e-6, beta1 0,9, beta2 0,98 y weight decay 0,1, en BF16 y con seed 1234. Las respuestas tuvieron un limite de 256 tokens, temperatura 1, top-p 1, thinking desactivado y cadena de parada `</answer>`. Los datos proceden de Reasoning Gym, fijado en el commit `49b07130b3fcd12f2d064bba7c43869543a0e7e7`, con configuraciones `countdown4` y `graph12`; cada dominio dispone de 10.000 puzzles de entrenamiento, 512 de desarrollo y 1.024 de test reservados. Los verificadores son los estrictos del PR: aritmetica exacta y acotada para Countdown, y claves JSON estrictas con colores enteros para coloreado de grafos.

La infraestructura de entrenamiento consistio en ocho GPU B200 para el alumno residente y el motor de rollout (alumno con TP1/PP1/CP1/EP8; rollout con TP8/EP8) y dos B200 adicionales en otro nodo para los profesores con TP1. Se reservaron 16 GPU en total, con 10 usadas por roles de modelo. SGLang uso el backend Triton MoE con configuraciones por defecto. El trabajo se ejecuto en los jobs de Slurm 391 (entrenamiento) y 392 (evaluacion final en held-out) el 10 de septiembre de 2026, y el export seleccionado fue `student-39`.

## Capacidades

- Generacion de texto conversacional en ingles y seguimiento del chat template de Qwen3.6-35B-A3B con `enable_thinking=False`.
- Resolucion de puzzles de Countdown: alcanzar un objetivo aritmetico combinando numeros dados con operaciones exactas.
- Resolucion de coloreado de grafos con salida JSON estricta de claves y colores enteros, segun el esquema del ejemplo.
- Produccion de respuestas en un unico bloque `<answer>...</answer>` sin cadena de razonamiento, con limite de 256 tokens y parada en `</answer>`.
- Destilacion multi-profesor como capacidad de investigacion: el checkpoint documenta el procedimiento y los hiperparametros completos para reproducir el bucle.
- Capacidades generales del modelo base (codigo, matematicas abiertas, multilingue, tool calling, agentes): no evaluadas ni documentadas para este checkpoint; no se debe asumir que se conservan.
- Vision y audio: no disponibles.
- Modo thinking: soportado por la arquitectura base, pero explicitamente desactivado en el entrenamiento y la evaluacion de este checkpoint.

## Casos de uso

- Investigacion en destilacion on-policy: sirve como referencia reproducible de un bucle MOPD con profesores congelados, rutado por dominio y objetivo sobre tokens candidatos, util para comparar variantes de scoring disperso frente al fallback denso.
- Generacion de datos sinteticos verificables: el modelo produce soluciones de Countdown y coloreado de grafos con formato fijo que se pueden validar automaticamente con verificadores estrictos, lo que permite construir datasets etiquetados sin intervencion humana.
- Estudio de retencion y olvido catastrofico: al ser un especialista de dos dominios, permite medir cuanto de la capacidad general del base se degrada tras 40 actualizaciones, siempre que se disene una evaluacion fuera de dominio que aqui no existe.
- Evaluacion de pipelines de RL y OPD: el checkpoint se puede insertar como alumno de referencia en bancos de pruebas que comparen tecnicas de destilacion, con la ventaja de que los hiperparametros y el seed estan publicados.
- Prototipado de agentes de razonamiento estructurado: la exigencia de emitir JSON estricto en coloreado de grafos lo hace util para probar parsers, validadores y esquemas de salida en entornos controlados.
- Ensenanza y demostracion de razonamiento aritmetico: con respuestas limitadas a 256 tokens y sin thinking, es adecuado para demos de resolucion de puzzles con latencia predecible.
- Referencia para investigacion en MoE dispersos: al activar aproximadamente 3.000 millones de parametros por token, permite medir el coste real de servir un MoE de 35,5 mil millones en tareas cortas y muy estructuradas.
- Comparacion de implementaciones de scoring: la model card documenta que este run uso el fallback denso por ID solicitado en lugar del scoring disperso por posicion del PR, lo que permite cuantificar el impacto de esa diferencia en coste y resultados.

## Benchmarks y rendimiento

Los unicos resultados publicados son de exactitud (accuracy) en dos dominios de puzzle. La evaluacion de desarrollo uso TP8 y la de held-out uso TP1; ambas con temperatura 0, una respuesta por prompt, thinking desactivado y limite de 256 tokens.

| Split y modelo | Countdown | Coloreado de grafos | Media de dominios iguales |
|---|---:|---:|---:|
| Base, desarrollo | 10,5469 % | 27,3438 % | 18,9453 % |
| Alumno, 20 actualizaciones, desarrollo | 42,1875 % | 87,8906 % | 65,0391 % |
| Alumno, 40 actualizaciones, desarrollo | 46,6797 % | 90,4297 % | 68,5547 % |
| Base, held-out | 10,1563 % | 29,0039 % | 19,5801 % |
| Alumno, 40 actualizaciones, held-out | 42,0898 % | 87,9883 % | 65,0391 % |

Mejora en held-out del alumno de 40 actualizaciones respecto al base: 31,9336 puntos porcentuales en Countdown, 58,9844 puntos en coloreado de grafos y 45,4590 puntos en la media de dominios iguales. El export de 40 actualizaciones se selecciono por exactitud macro en desarrollo, y la evaluacion en held-out se realizo despues de esa seleccion. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del numero de parametros publicado (no hay cifras oficiales del autor): en BF16, aproximadamente 71 GB solo de pesos, mas cache KV; en FP8, en torno a 36 GB; en cuantizacion de 4 bits, del orden de 18-20 GB. Son estimaciones derivadas del recuento de parametros, no medidas publicadas.
- GPU recomendadas: la ejecucion de referencia uso NVIDIA B200 tanto para alumno y rollout (8 GPU) como para profesores (2 GPU adicionales). Para inferencia en BF16 son razonables una B200/H200 de 141-180 GB o dos H100 de 80 GB; en FP8 o 4 bits, una sola H100 de 80 GB o una A100 de 80 GB pueden ser suficientes.
- GPU de consumo: con cuantizacion de 4 bits el modelo podria caber en tarjetas de 24 GB como la RTX 4090 o la RTX 3090, asumiendo soporte correcto del kernel MoE en el runtime elegido; no hay validacion publicada de este escenario.
- Opciones de despliegue: SGLang es la via soportada de facto, ya que fue el motor de rollout del entrenamiento, con backend Triton MoE. vLLM y TGI son alternativas habituales para arquitecturas Qwen MoE. llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion que no se publica en el repositorio.
- Latencia y throughput: no disponibles. Como referencia cualitativa, al activar aproximadamente 3.000 millones de parametros por token el coste por token se aproxima al de un modelo denso de ese tamano, pero no hay mediciones publicadas para este checkpoint.
- Restriccion practica: las respuestas de entrenamiento y evaluacion se limitaron a 256 tokens con parada en `</answer>` y thinking desactivado, por lo que el perfil de despliegue esperado son generaciones cortas y muy estructuradas, no conversaciones largas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-MOPD-Miles-20260910 (este modelo) | 35,505B / ~3B | no disponible | 42,09 % Countdown y 87,99 % grafos en held-out | no disponible | HuggingFace, safetensors |
| Qwen/Qwen3.6-35B-A3B (base) | 35,505B / ~3B | no disponible | 10,16 % Countdown y 29,00 % grafos en held-out | no disponible | HuggingFace |
| semianalysisai/Qwen3.6-35B-A3B-countdown-GRPO-20260909 (profesor) | misma familia base | no disponible | no disponible en esta ficha | no disponible | HuggingFace, revision `237a7f03...` |
| semianalysisai/Qwen3.6-35B-A3B-graph-color-GRPO-20260909 (profesor) | misma familia base | no disponible | no disponible en esta ficha | no disponible | HuggingFace, revision `ec87f871...` |

La comparacion con modelos MoE abiertos de terceros de tamano similar no es posible con los datos disponibles: no hay resultados de benchmarks generales publicados ni informacion de contexto o licencia del modelo base en la documentacion proporcionada.

## Limitaciones y advertencias

- Checkpoint especialista de investigacion: la evidencia cubre unicamente dos dominios cortos de puzzle y un unico seed de entrenamiento.
- Capacidad general, seguridad y retencion de tareas fuera de dominio no han sido evaluadas; no se debe asumir que el modelo conserva las capacidades del base Qwen3.6-35B-A3B.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado; en tareas fuera de los dos dominios entrenados el comportamiento es indeterminado.
- Idioma: solo ingles declarado; no hay evaluacion multilingue.
- Formato de uso obligatorio: requiere `enable_thinking=False` y espera un unico bloque `<answer>...</answer>` sin razonamiento; las respuestas de coloreado de grafos deben respetar el esquema JSON estricto del ejemplo, o los verificadores fallaran.
- Licencia no disponible: sin terminos explicitos no se puede confirmar el uso comercial; hay que tratar el checkpoint como no apto para produccion hasta aclararlo, y verificar ademas la licencia del modelo base.
- No reproduce numericamente el PR: los resultados son de B200 y de una ejecucion propia, no de los H200 del PR.
- El run uso el fallback denso documentado de puntuacion por ID solicitado en lugar del scoring disperso por posicion, lo que afecta al coste de scoring y impide afirmar reproduccion del rendimiento del PR.
- No se incluyen estados de optimizador ni de RNG, por lo que no se soporta la reanudacion exacta del entrenamiento. No se publican credenciales ni registros de infraestructura.
- Las pruebas de la API de profesores fueron smoke tests de correccion y no establecen un throughput representativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/semianalysisai/Qwen3.6-35B-A3B-MOPD-Miles-20260910
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Profesor de Countdown: https://huggingface.co/semianalysisai/Qwen3.6-35B-A3B-countdown-GRPO-20260909
- Profesor de coloreado de grafos: https://huggingface.co/semianalysisai/Qwen3.6-35B-A3B-graph-color-GRPO-20260909
- Implementacion Miles, PR 3116: https://github.com/radixark/miles/pull/3116
- Reasoning Gym, commit fijado: `49b07130b3fcd12f2d064bba7c43869543a0e7e7`
- Revision inicial del alumno: `995ad96eacd98c81ed38be0c5b274b04031597b0`
- Revisiones de profesores: `237a7f0345e883705026acd7f0745a3637042f73` (Countdown) y `ec87f87177a4ced7256928ce67c438fafa73c28e` (grafos)
- La busqueda web realizada no devolvio resultados relevantes para este modelo.
