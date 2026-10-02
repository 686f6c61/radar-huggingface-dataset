# mulligan/sim-square-broad-r03-auto-iql-success-bc-n32-divl

## Resumen

`mulligan/sim-square-broad-r03-auto-iql-success-bc-n32-divl` es un agente de control para robótica (pipeline `robotics`) entrenado sobre datos de solo estado —sin observaciones visuales— para la tarea de simulación `sim-square-broad` del proyecto Mulligan. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo offline compuesta por un actor de difusión congelado, heredado del checkpoint padre `sim-square-broad-r03-auto-iql-success-bc-n32-idql`, y un crítico DIVL de tipo distributional añadido en esta ronda. El artefacto publicado contiene los pesos resultantes (`policy.pt`) y estadísticas de normalización (`stats.json`) para cinco semillas independientes.

El modelo pertenece a la ronda R3 del brazo `auto-iql-success-bc-n32` y a la celda de campaña `sq_d1_r3_auto_iql_success_bc_n32`. Se publica con cinco semillas (1 a 5), cada una en su propia carpeta, con el entrenamiento detenido en el paso 250001. El repositorio ocupa 1,4 GB en total.

Su relevancia es acotada pero clara para quien trabaja en RL offline aplicado a manipulación robótica: proporciona checkpoints reproducibles con evaluación sobre una rejilla de estados iniciales reservada (held-out), lo que permite comparar variantes de crítico y de mezcla de datos dentro de la misma campaña. La licencia MIT y la publicación de configuraciones de ejecución en el repositorio de código de Mulligan facilitan la reproducción. No se han publicado datos de arquitectura interna, número de parámetros ni resultados frente a modelos externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de RL offline con actor de difusion congelado y critico DIVL distributional (segun la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (agente de control de solo estado, no un modelo de contexto) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen como PyTorch pickles sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`policy.pt`) + `stats.json`; metadatos de integridad en `release.json` |
| Tarea | sim-square-broad |
| Ronda de modelo | R3 |
| Brazo | auto-iql-success-bc-n32 |
| Celda de campana | `sq_d1_r3_auto_iql_success_bc_n32` |
| Semillas publicadas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un «state-based agent with the parent's frozen diffusion actor and a distributional DIVL critic». Es decir, la política de acciones la genera un actor de difusión que no se modifica en esta ronda: proviene del checkpoint `sim-square-broad-r03-auto-iql-success-bc-n32-idql`. Sobre esa base congelada se entrena un crítico DIVL de tipo distributional, que aporta la estimación de valor distribuida. La nomenclatura del brazo (`auto-iql-success-bc-n32`) sugiere una receta con IQL automático y filtrado por éxito con behavior cloning, más 32 políticas de rollout, pero la model card no detalla los hiperparámetros, la composición exacta de la mezcla ni la función de pérdida, por lo que esos extremos quedan como no disponibles.

El entrenamiento usa cuatro conjuntos de datos publicados en la organización `mulligan`: `sim-square-broad-c00-teleop-baseline`, `sim-square-broad-c01-auto-iql-n32-policy-rollouts`, `sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts` y `sim-square-broad-c03-auto-iql-success-bc-n32-policy-rollouts`. No se especifica el número de transiciones, la proporción entre datos de teleoperación y datos de rollout, ni si hubo etapas de RLHF o DPO (conceptos, por otra parte, propios de modelos de lenguaje y no de este tipo de agente). Las configuraciones de ejecución de cada semilla se encuentran en el repositorio de código de Mulligan, bajo `release/run-configs/`, lo que permite reentrenar cada checkpoint. La integridad de los ficheros se verifica mediante SHA-256 registrado en `release.json`.

## Capacidades

- Control continuo para una tarea de manipulación simulada (`sim-square-broad`) a partir de observaciones de estado, sin entrada visual.
- Generación de acciones multimodales gracias al actor de difusión congelado, que modela distribuciones de acción no unimodales.
- Estimación de valor mediante el crítico DIVL de tipo distributional.
- Publicación multi-semilla: cinco checkpoints independientes permiten medir varianza entre inicializaciones.
- Evaluación sobre una rejilla de estados iniciales reservada, con resultados por rollout registrados en el dataset `sim-square-broad-r00-r03-eval`.
- Reproducibilidad declarada: configuraciones de ejecución publicadas y hashes SHA-256 por fichero.
- Soporte de tool calling / function calling: no disponible (no aplica a un agente de control).
- Soporte de agentes y razonamiento multi-paso: no disponible en el sentido de LLM; el agente ejecuta una política de control por pasos de simulación.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; las observaciones son de solo estado.

## Casos de uso

- Investigación en RL offline para manipulación: usar los cinco checkpoints como referencia reproducible de la ronda R3 para comparar contra otras variantes de crítico o de mezcla de datos dentro de la misma campaña.
- Estudio de la varianza entre semillas: las cinco semillas permiten cuantificar la dispersión del éxito (52,22 % a 55,27 %) y decidir cuántas semillas son necesarias en experimentos futuros.
- Ablación de críticos: al compartir el actor congelado con el checkpoint `-idql`, este modelo sirve para aislar el efecto del crítico DIVL distributional frente a alternativas sobre la misma política base.
- Generación de datos de entrenamiento: desplegar la política en el simulador para producir nuevos rollouts (`c04` y posteriores) que alimenten iteraciones sucesivas de la campaña.
- Análisis de fallos: cruzar los resultados por rollout del dataset de evaluación con los estados iniciales para localizar regiones del espacio de estados donde la política falla sistemáticamente.
- Base para transferencia sim-a-real: partir de esta política entrenada en simulación como inicialización antes de ajuste fino con datos reales de teleoperación.
- Docencia y divulgación en RL offline: ejemplo completo de agente con actor de difusión, crítico distributional, evaluación por rejilla y artefactos versionados.

## Benchmarks y rendimiento

La model card publica la evaluación sobre una rejilla de estados iniciales reservada, con N = 32, usando el dataset `sim-square-broad-r00-r03-eval`. Los resultados por semilla son los siguientes.

| Semilla | N | Exitos / total | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 16129 / 30000 | 53,76 % |
| seed-2 | 32 | 16582 / 30000 | 55,27 % |
| seed-3 | 32 | 16498 / 30000 | 54,99 % |
| seed-4 | 32 | 15665 / 30000 | 52,22 % |
| seed-5 | 32 | 16139 / 30000 | 53,80 % |

Media aritmetica de las cinco semillas: 16202,6 / 30000, es decir, aproximadamente 54,01 % (valor derivado de la tabla, no publicado como tal en la model card). Rango observado: 52,22 %–55,27 %, con una dispersion de unos 3 puntos porcentuales entre la mejor y la peor semilla.

No se han publicado resultados de benchmarks comparativos con modelos externos en la informacion disponible (ni MMLU, HumanEval, GSM8K ni equivalentes de robótica, que por otra parte no aplican a este tipo de artefacto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. Como referencia indirecta, el repositorio completo ocupa 1,4 GB para cinco semillas, lo que supone aproximadamente 280 MB por semilla; si los pesos estuvieran en fp32, eso corresponderia de forma aproximada a decenas de millones de parametros por checkpoint. Es una estimacion derivada del tamano del repositorio y no un dato confirmado.
- GPU recomendadas: no disponible. Por el tamano del artefacto, es previsible que quepa en GPU de consumo (por ejemplo, RTX 3060/4070/4090) e incluso en CPU para inferencia, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: probable, no confirmada.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica de RL. La carga se realiza con PyTorch, leyendo `policy.pt` y `stats.json`, en el entorno del simulador de la campana Mulligan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `mulligan/sim-square-broad-r03-auto-iql-success-bc-n32-divl` (este) | Critico DIVL distributional sobre actor de difusion congelado | no disponible | no aplica | 54,01 % de exito medio (5 semillas) | MIT | HuggingFace, 0 descargas |
| `mulligan/sim-square-broad-r03-auto-iql-success-bc-n32-idql` | Checkpoint padre; aporta el actor de difusion congelado | no disponible | no aplica | no disponible en la informacion proporcionada | MIT (segun la organizacion) | HuggingFace |
| Variantes `sim-square-narrow` (por ejemplo `-c03-auto-iql-success-bc-n32-policy-rollouts`) | Misma campana y receta, tarea mas estrecha | no disponible | no aplica | no disponible en la informacion proporcionada | MIT (segun la organizacion) | HuggingFace y agregadores como claru.ai |

No se dispone de cifras comparativas publicadas entre estos artefactos en la informacion proporcionada; la comparacion se limita a la relacion estructural entre ellos (mismo actor, distinto critico; misma receta, distinta tarea).

## Limitaciones y advertencias

- Alcance muy restringido: es una politica especifica para la tarea `sim-square-broad`, no un modelo general. No se puede reutilizar fuera de esa tarea sin reentrenamiento.
- Rendimiento moderado: en torno al 54 % de exito medio, con casi la mitad de los rollouts fallidos. No es una politica lista para despliegue productivo.
- Solo estado: no hay entrada visual ni multimodal, lo que limita su aplicacion directa a robots reales con percepcion.
- Brecha sim-a-real: entrenado en simulacion, sin evidencia publicada de transferencia a hardware fisico.
- Varianza entre semillas: alrededor de 3 puntos porcentuales de diferencia entre la mejor y la peor semilla, con solo cinco semillas disponibles.
- Sesgos conocidos: no disponibles. Los sesgos estarian determinados por la distribucion de estados iniciales y por los datos de teleoperacion y rollouts, cuya composicion no se detalla.
- Riesgo de alucinacion: no aplica en el sentido de modelos generativos de texto; el riesgo equivalente es ejecutar acciones no validas en estados fuera de la distribucion de entrenamiento.
- Idiomas: no aplica.
- Licencia: MIT, permisiva, permite uso comercial y modificacion. Conviene conservar el aviso de copyright y el texto de licencia.
- Seguridad de los ficheros: la propia model card advierte de que los ficheros `.pt` son pickles de PyTorch y deben cargarse unicamente en un entorno de confianza, por el riesgo de ejecucion de codigo arbitrario.
- Validacion externa escasa: 0 descargas y 0 likes en el momento de la consulta; el modelo no ha pasado por una revision independiente.
- Detalles de entrenamiento incompletos: no se publican numero de parametros, tokens o transiciones, hiperparametros ni composicion del dataset, lo que dificulta la auditoria.
- Fecha de publicacion futura respecto al momento habitual de consulta (creado el 28 de septiembre de 2026 y actualizado el 2 de octubre de 2026, segun los metadatos).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r03-auto-iql-success-bc-n32-divl
- Checkpoint padre (actor congelado): https://huggingface.co/mulligan/sim-square-broad-r03-auto-iql-success-bc-n32-idql
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Dataset c00 (teleoperacion base): https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-baseline
- Dataset c01 (rollouts de politica auto-iql n32): https://huggingface.co/datasets/mulligan/sim-square-broad-c01-auto-iql-n32-policy-rollouts
- Dataset c02 (rollouts auto-iql success-bc n32): https://huggingface.co/datasets/mulligan/sim-square-broad-c02-auto-iql-success-bc-n32-policy-rollouts
- Dataset c03 (rollouts auto-iql success-bc n32): https://huggingface.co/datasets/mulligan/sim-square-broad-c03-auto-iql-success-bc-n32-policy-rollouts
- Organizacion Mulligan en HuggingFace: https://huggingface.co/mulligan
- Proyecto Mulligan: https://mulligan.page
- Evaluaciones en Policy Arena: https://arena.mulligan.page
- Busqueda de datasets de la familia sim-square-broad: https://huggingface.co/datasets?other=sim-square-broad
- Busqueda de datasets de la familia sim-square-narrow: https://huggingface.co/datasets?other=sim-square-narrow
- Ficha de dataset relacionado en claru.ai (variante narrow): https://claru.ai/datasets/mulligan-sim-square-narrow-c03-auto-iql-success-bc-n32-policy-rollouts
- Ficha de dataset relacionado en claru.ai (variante broad): https://claru.ai/datasets/mulligan-sim-square-broad-c03-auto-iql-success-bc-n32-policy-rollouts
- Repositorio de codigo de Mulligan (donde residen `release/run-configs/` y `release.json`): no disponible como URL directa en la informacion proporcionada
