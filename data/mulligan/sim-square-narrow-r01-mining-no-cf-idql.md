# mulligan/sim-square-narrow-r01-mining-no-cf-idql

## Resumen

`mulligan/sim-square-narrow-r01-mining-no-cf-idql` es un agente de aprendizaje por refuerzo para robotica, concretamente una politica IDQL (Implicit Diffusion Q-Learning) entrenada para la tarea de manipulacion simulada `sim-square-narrow`. El modelo lo publica el usuario `mulligan` como parte de la campana de investigacion Mulligan, cuyo objetivo es mejorar la recoleccion de datos guiada por rendimiento para entrenar politicas de robot mediante DAgger. No es un modelo de lenguaje: es una politica de control basada en estado (state-based) que mapea observaciones del entorno a acciones.

Tecnicamente es un agente IDQL compuesto por un actor de difusion y un critico IQL escalar. Se distribuye como un checkpoint de PyTorch (`policy.pt`) junto con ficheros `stats.json` que contienen los normalizadores de observaciones y acciones. El repositorio ocupa 1,4 GB e incluye cinco semillas (carpetas `seed-1` a `seed-5`), cada una correspondiente a un artefacto de Weights & Biases distinto, todas con el mismo numero de paso de entrenamiento (150001).

Su relevancia es acotada y de caracter cientifico: forma parte de la ronda R1 de la tarea `sim-square-narrow` en la modalidad `mining-no-cf`, y sirve como punto de comparacion reproducible dentro de la campana. La organizacion Mulligan reporta que su metodo HiL-IDQL + Mulligan mejora el exito final entre 10 y 34 puntos porcentuales frente a HG-DAgger con presupuestos de recoleccion supervisada equivalentes. No obstante, este checkpoint concreto no aporta metricas desglosadas en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusion con critico IQL escalar (IDQL, state-based) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control sobre observaciones de estado, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`policy.pt`) mas normalizadores `stats.json` |

## Arquitectura y entrenamiento

El modelo implementa IDQL (Implicit Diffusion Q-Learning), que combina un actor generativo de difusion con un critico de Q-learning escalar basado en IQL (Implicit Q-Learning). El actor aprende la distribucion de acciones condicionada al estado y el critico proporciona la senal de valor que permite filtrar o reponderar las acciones aprendidas. Se trata de un enfoque offline/off-policy, tipico del aprendizaje por refuerzo con datos de demostracion y de despliegue.

El entrenamiento se enmarca en un bucle de recoleccion de datos tipo DAgger. La model card indica que el checkpoint se entreno sobre tres conjuntos de datos: `sim-square-narrow-c00-teleop-sobol` (teleoperacion), `sim-square-narrow-c01-dagger-mining-no-cf` (iteracion DAgger con minado sin intervencion humana, o "no-cf") y `sim-square-narrow-c01-sobol-policy-rollouts` (despliegues de la politica). Los cinco checkpoints se entrenaron hasta el paso 150001 con los commits de codigo de Mulligan `1d6f645075c7` y `55e127140163`, y provienen de artefactos de W&B verificados por MD5 contra el manifiesto y con SHA-256 registrado en `release.json`. No se detalla en la informacion disponible el numero de tokens ni la composicion exacta de los datos.

## Capacidades

- Control de manipulacion en simulacion para la tarea `sim-square-narrow` (ensamblaje tipo "square").
- Politica basada en estado (state-based): consume observaciones de estado, no imagenes.
- Generacion de acciones condicionada al estado mediante actor de difusion.
- Estimacion de valor mediante critico IQL escalar.
- Aprendizaje a partir de datos de teleoperacion, DAgger y despliegues de politica.
- Reproducibilidad mediante cinco semillas independientes ya entrenadas.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades multilingues, por no ser un modelo de lenguaje.
- No se documentan capacidades de vision, audio ni modos de "thinking".

## Casos de uso

- Evaluacion de referencia en investigacion de RL offline: usar el checkpoint como politica base para comparar algoritmos de aprendizaje por imitacion o refuerzo en la tarea `sim-square-narrow`.
- Recoleccion de datos tipo DAgger: desplegar la politica en simulacion para generar rollouts etiquetados que alimenten la siguiente ronda de entrenamiento, dado que parte de sus datos de entrenamiento provienen de `sobol-policy-rollouts`.
- Analisis de robustez entre semillas: las cinco semillas permiten estudiar la varianza de rendimiento del metodo en la misma tarea y configuracion.
- Ablacion sin intervencion humana ("no-cf"): sirve como variante de comparacion frente a configuraciones con intervencion humana en la campana de recoleccion.
- Transferencia a manipulacion real: como politica entrenada en simulacion, puede actuar como punto de partida para tecnicas de sim-a-real antes de desplegar en un robot.
- Reproducibilidad de experimentos: al ser copias byte a byte de artefactos de W&B con verificacion MD5/SHA-256, permite reproducir resultados de la ronda R1 sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint concreto. La organizacion Mulligan reporta de forma agregada que HiL-IDQL + Mulligan mejora el exito final entre 10 y 34 puntos porcentuales frente a HG-DAgger en presupuestos de recoleccion supervisada equivalentes, sobre 2.550 episodios del metodo principal (2.850 con la ablacion no-CF), todos en espera y ciegos. Estas cifras corresponden al conjunto de la campana y no a este checkpoint de forma aislada.

## Requisitos de hardware

- El repositorio completo ocupa 1,4 GB e incluye cinco semillas; cada checkpoint individual (`policy.pt`) seria una fraccion de ese tamano, aunque su tamano exacto no esta disponible.
- Al tratarse de una politica IDQL basada en estado, es previsible que quepa en GPU de consumo e incluso en CPU para inferencia, dado que no es un modelo de lenguaje grande.
- VRAM estimada: no disponible de forma explicita.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Opciones de despliegue: no se documentan frameworks de servido (vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de artefacto). El checkpoint se carga con PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mulligan/sim-square-narrow-r01-mining-no-cf-idql` | IDQL (actor difusion + critico IQL) | `sim-square-narrow` | no disponible | MIT | HuggingFace |
| HG-DAgger | Aprendizaje por imitacion interactivo (baseline) | Igual (campana Mulligan) | no disponible | no disponible | Referenciado como baseline |
| Otras variantes de la campana Mulligan (rondas R0-R3) | Politicas de la campana | `sim-square-narrow` | no disponible | no disponible | Datasets en la organizacion `mulligan` |

No se dispone de datos suficientes para comparar parametros, contexto o rendimiento frente a alternativas de la misma categoria mas alla de la referencia agregada a HG-DAgger.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no soporta idiomas ni tool calling. Cualquier expectativa en ese sentido es inaplicable.
- Alcance muy restringido: esta entrenado exclusivamente para la tarea `sim-square-narrow` en simulacion.
- Riesgo de sobreajuste a la distribucion de datos de la campana; su comportamiento fuera de ese entorno no esta garantizado.
- Alucinacion: no aplica como tal, pero puede generar acciones no validas o inseguras si se despliega fuera del dominio de entrenamiento.
- Sesgos: no documentados en la informacion disponible.
- Seguridad de artefactos: los ficheros `.pt` son pickles de PyTorch; deben cargarse unicamente en entornos de confianza (la propia model card lo advierte).
- Licencia MIT: permisiva, permite uso comercial, pero no se ofrecen garantias sobre el modelo.
- No se aportan metricas de rendimiento por semilla ni por checkpoint, lo que dificulta una evaluacion fina.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r01-mining-no-cf-idql
- Sitio de Mulligan: https://mulligan.page/
- Policy Arena (evaluaciones): https://arena.mulligan.page/
- Organizacion en HuggingFace: https://huggingface.co/mulligan
- Dataset `sim-square-narrow-c00-teleop-sobol`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Dataset `sim-square-narrow-c01-dagger-mining-no-cf`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-dagger-mining-no-cf
- Dataset `sim-square-narrow-c01-sobol-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-narrow-c01-sobol-policy-rollouts
- Dataset de evaluacion `sim-square-narrow-r00-r03-eval`: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
