# mulligan/sim-square-narrow-r03-auto-filtered-bc-n1-idql

## Resumen

El modelo `mulligan/sim-square-narrow-r03-auto-filtered-bc-n1-idql` es una politica de control robotico basada en estado, entrenada mediante IDQL (Implicit Diffusion Q-Learning), una combinacion de actor de difusion con critico escalar IQL. No es un modelo de lenguaje: se trata de un agente de aprendizaje por refuerzo/imitacion offline disenado para resolver la tarea de simulacion `sim-square-narrow`, perteneciente al banco de pruebas Mulligan. El autor es la organizacion `mulligan`, dedicada a la evaluacion reproducible de politicas roboticas.

El artefacto corresponde a la ronda R3 de una campana iterativa (`iterative-IL comparator`) con la variante `auto-filtered-bc-n1`, e incluye cinco semillas independientes (seed-1 a seed-5), cada una en su carpeta, ademas del paso de entrenamiento 150001 por semilla. Los pesos se distribuyen como checkpoints de PyTorch (`policy.pt`) acompanados de normalizadores (`stats.json`), con un tamano total de repositorio de 1,4 GB.

Su relevancia radica en que forma parte de un flujo de investigacion que combina aprendizaje por imitacion iterativo, mineria de datos estilo DAgger y aprendizaje por refuerzo offline, con evaluacion sistematica sobre una rejilla de estados iniciales reservada. La licencia MIT y la trazabilidad completa hacia artefactos de Weights & Biases y commits concretos lo hacen util como linea base reproducible para comparar metodos de IL/RL en manipulacion de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion con critico escalar IQL (IDQL, politica basada en estado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (politica de control con observaciones de estado, no secuencia de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (politica de control robotico; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch (`policy.pt`), normalizadores en `stats.json`, metadatos en `release.json` |

## Arquitectura y entrenamiento

La politica es un actor de difusion que genera acciones mediante un proceso de denoising, emparejado con un critico escalar IQL (Implicit Q-Learning) que estima valores de forma implicita sin consultar acciones fuera de distribucion. Esta combinacion es la base del metodo IDQL, orientado a aprendizaje por refuerzo offline sobre datos y rollouts previamente recogidos. Los checkpoints son pickles de PyTorch, por lo que deben cargarse unicamente en entornos de confianza.

El entrenamiento se realizo hasta el paso 150001 con el codigo de investigacion de Mulligan, en los commits indicados por semilla. Los datos proceden de cuatro conjuntos: una linea base de teleoperacion (`c00-teleop-baseline`), rollouts de una politica compartida auto-BC (`c01-auto-bc-n1-shared-policy-rollouts`) y dos rondas de rollouts de politica filtrados automaticamente (`c02` y `c03`). Esto corresponde a un ciclo iterativo de aprendizaje por imitacion con filtrado automatico de datos, en el que la politica genera nuevos rollouts que se incorporan al entrenamiento. Los nombres de los artefactos de W&B hacen referencia a `nutassemblysquare`, tarea de ensamblaje de tuerca/cuadrado en simulacion de manipulacion. No se detalla en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplico RLHF/DPO (conceptos no aplicables a un agente de control).

## Capacidades

- Control de manipulacion basado en estado para la tarea de simulacion `sim-square-narrow` (ensamblaje de precision).
- Generacion de acciones mediante muestreo por difusion condicionado al estado observado.
- Operacion como politica offline entrenada sobre datos de teleoperacion y rollouts propios.
- Generacion de rollouts para ciclos de auto-entrenamiento y mineria de datos estilo DAgger.
- Estimacion de valor implicita mediante el critico IQL, utilizada para filtrar/ponderar datos.
- Evaluacion reproducible por semilla e inicializacion (cinco semillas entrenadas de forma independiente).
- No soporta tool calling, function calling, agentes multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de vision en esta variante (observaciones solo de estado, sin camaras).

## Casos de uso

- Linea base para investigacion en aprendizaje por imitacion iterativo: sirve como referencia del brazo `auto-filtered-bc-n1` para comparar variantes del pipeline IL en la misma tarea y rejilla de evaluacion.
- Comparacion de algoritmos de RL offline: al ser un agente IDQL, permite contrastar el rendimiento de IDQL frente a otras variantes de la campana sobre el mismo conjunto de estados iniciales.
- Generacion de datos sinteticos para entrenamiento: los rollouts de la politica pueden filtrarse automaticamente y reincorporarse a futuros ciclos de entrenamiento (auto-mejora).
- Estudio de ensamblaje de precision en simulacion: la tarea `sim-square-narrow` reproduce una operacion de insercion con tolerancia estrecha, util para analizar politicas de control fino.
- Investigacion en transferencia sim-to-real (a validar): el agente podria servir de punto de partida para explorar transferencia, aunque no hay evidencia en la informacion disponible de que se haya validado en hardware real.
- Reproducibilidad de experimentos de RL: los checkpoints, semillas y artefactos de W&B enlazados permiten reproducir y auditar resultados con trazabilidad de commit.
- Evaluacion comparativa estandarizada: integrable en el banco de pruebas Policy Arena para medir tasas de exito sobre la rejilla de estados reservada.

## Benchmarks y rendimiento

La model card reporta una evaluacion sobre una rejilla de estados iniciales reservada, con 8000 rollouts por semilla y el numero de exitos indicado. No se han publicado resultados con metricas tipo MMLU, HumanEval o GSM8K (no aplicables a un agente de control).

| Semilla | N (rollouts) | Exitos | Tasa de exito |
|---|---|---|---|
| seed-1 | 8000 | 5882 | 73,5 % |
| seed-2 | 8000 | 5687 | 71,1 % |
| seed-3 | 8000 | 5743 | 71,8 % |
| seed-4 | 8000 | 5699 | 71,2 % |
| seed-5 | 8000 | 5891 | 73,6 % |

La evaluacion completa se aloja en el dataset `sim-square-narrow-r00-r03-eval`. No se proporcionan datos de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Tamano de artefacto: repositorio de 1,4 GB que contiene los checkpoints de las cinco semillas junto con los normalizadores; cada `policy.pt` es sustancialmente menor.
- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del artefacto, la politica es ligera y una unica semilla deberia caber holgadamente en GPUs de consumo e incluso ejecutarse en CPU.
- GPU recomendadas: no disponible; al ser un modelo pequeno basado en estado, no requiere aceleradores de gama alta (A100/H100 suficientes de sobra, y cualquier RTX moderna seria mas que suficiente).
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano reducido del checkpoint (estimacion basada en el footprint del repositorio, no confirmada en la informacion).
- Opciones de despliegue: carga mediante PyTorch; el repositorio no indica soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a un agente de control).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos numericos con otros modelos en la informacion proporcionada. Como referencias conceptuales de la misma familia arquitectonica podrian citarse el IDQL original, Diffusion Policy e IQL, pero no hay cifras de rendimiento de estos disponibles en la informacion para establecer una comparacion.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sim-square-narrow-r03-auto-filtered-bc-n1-idql | no disponible | no aplicable | 71,1-73,6 % de exito (5 semillas, 8000 rollouts) | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una politica de control especifica para la tarea de simulacion `sim-square-narrow`; no es un modelo de proposito general y no se puede reutilizar en tareas arbitrarias sin reentrenamiento.
- La evaluacion se realiza en simulacion sobre una rejilla de estados iniciales reservada; no hay evidencia de validacion en hardware real ni de robustez sim-to-real.
- Los pesos son pickles de PyTorch (`.pt`); deben cargarse unicamente en entornos de confianza por el riesgo de deserializacion.
- No se detalla el numero de parametros, la composicion exacta del dataset ni los hiperparametros en la informacion proporcionada.
- La tasa de exito media ronda el 72 %, con una dispersion de aproximadamente 2,5 puntos porcentuales entre semillas; existe un porcentaje no trivial de fallos incluso en la mejor semilla.
- Licencia MIT: permite uso comercial, pero el usuario debe verificar la procedencia de los datos de entrenamiento y los commits asociados.
- No se reportan sesgos, comportamiento fuera de distribucion ni limites de generalizacion mas alla de lo indicado en la evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r03-auto-filtered-bc-n1-idql
- Sitio de Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organizacion mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Dataset base de teleoperacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-baseline
- Dataset de rollouts auto-BC: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-auto-bc-n1-shared-policy-rollouts
- Dataset de rollouts filtrados (c02): https://huggingface.co/datasets/mulligan/sim-square-narrow-c02-auto-filtered-bc-n1-policy-rollouts
- Dataset de rollouts filtrados (c03): https://huggingface.co/datasets/mulligan/sim-square-narrow-c03-auto-filtered-bc-n1-policy-rollouts
- Paper relacionado (Policy Agnostic RL, RL offline y ajuste online): https://www.researchgate.net/publication/386578043_Policy_Agnostic_RL_Offline_RL_and_Online_RL_Fine-Tuning_of_Any_Class_and_Backbone
