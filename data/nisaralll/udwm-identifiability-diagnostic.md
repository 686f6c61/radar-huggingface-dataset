# nisaralll/udwm-identifiability-diagnostic

## Resumen

Este repositorio de HuggingFace no contiene un modelo de lenguaje ni un agente entrenado, sino un **artefacto de diagnóstico** para investigación en aprendizaje por refuerzo basado en modelos (model-based RL). El autor, `nisaralll`, ha publicado un conjunto de checkpoints de PyTorch que reproducen de forma mínima y reproducible un fallo de identificabilidad en la destilación que preserva incertidumbre para world models de difusión. El problema central es que la pérdida estándar "decision-aware" iguala el desacuerdo de valor entre profesor y estudiante en un único latente compartido, lo que produce una estadística que mezcla dos incógnitas: la incertidumbre epistémica y la dispersión aleatoria. El estudiante puede igualar esa estadística intercambiando una por otra, perdiendo así la señal epistémica que necesita una decisión de gating.

El artefacto incluye seis variantes de checkpoints que van desde la línea base ingenua hasta la corrección combinada, todas sobre el entorno `DelayedBimodal-v0` con semilla 0. No se trata de un modelo con arquitectura transformer ni con parámetros de lenguaje; es un conjunto de pesos de un world model de difusión (conjunto de profesores y estudiante de un paso), un actor, un crítico y una red de incertidumbre. La relevancia actual radica en que la calibración de incertidumbre es crítica para el RL seguro, y este repositorio permite estudiar y evitar el colapso epistémico en la destilación de world models.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model de difusión (teacher ensemble + student de un paso) con actor, crítico y red de incertidumbre; no es un modelo de lenguaje |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (según metadata, aunque el artefacto no es de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`torch.save`) |

## Arquitectura y entrenamiento

El artefacto se compone de checkpoints generados por el repositorio `uncertainty-diffusion-world-models`. Cada `.pt` contiene un dict con `world_model` (que incluye el conjunto de profesores, el estudiante de un paso y el término de recompensa), `actor`, `critic`, `u_net` y la configuración completa `cfg`. La arquitectura central es un world model de difusión, donde un conjunto de profesores genera predicciones de estado y un estudiante de un paso destila esas predicciones. El entrenamiento no es un preentrenamiento de lenguaje ni incluye RLHF/DPO; se trata de un procedimiento de destilación de incertidumbre en el entorno de control continuo `DelayedBimodal-v0`, con una semilla fija (seed 0) y un profesor compartido entre los distintos brazos experimentales.

La innovación técnica destacable es la formulación del fallo de identificabilidad: la pérdida estándar de destilación "decision-aware" iguala una estadística mixta `w* + (g* − Σ̄)` en un único latente, lo que permite al estudiante compensar la incertidumbre epistémica con la aleatoria. El repositorio propone y evalúa correcciones: usar M=2 latentes identificados con pesos iguales, y un crítico objetivo rezagado para abordar la no estacionariedad. La variante rota `identified_hybrid` emplea un reweighting EMA que aniquila el canal aleatorio, mientras que la variante corregida `lagged_identified_eq` combina ambas soluciones y obtiene el mejor resultado en la tabla de u-rank.

## Capacidades

- Reproducir el fallo de colapso epistémico/aleatorio en destilación con pérdida de un solo latente (variante `hybrid`).
- Proporcionar una línea base ingenua mediante destilación MSE ordinaria (variante `ordinary`).
- Mostrar el efecto de la corrección de identificabilidad con M=2 y pesos iguales (variante `identified_eq`).
- Mostrar el efecto del crítico objetivo rezagado para mitigar la no estacionariedad (variante `lagged_hybrid`).
- Incluir la variante combinada que cierra la brecha restante (variante `lagged_identified_eq`).
- Servir como artefacto de verificación para los teoremas de identificabilidad, con un verificador numérico incluido en el repositorio fuente.
- No es un modelo de lenguaje: no admite tool calling, generación de texto, razonamiento simbólico ni capacidades multilingües en el sentido habitual.

## Casos de uso

- Investigación en calibración de incertidumbre en world models: cargar los checkpoints para estudiar el fallo de identificabilidad en un crítico en vivo, comparando la variante rota con la corregida.
- Desarrollo de métodos de destilación en RL basado en modelos: usar el artefacto como referencia para validar nuevas pérdidas de destilación y comprobar si preservan la incertidumbre epistémica.
- Evaluación de agentes con incertidumbre epistémica: emplear los checkpoints para comprobar si un crítico puede distinguir entre incertidumbre epistémica y aleatoria en un entorno de control simple.
- Verificación de teoremas de identificabilidad: ejecutar el verificador numérico del repositorio fuente y contrastar los resultados con los checkpoints exportados.
- Reproducción de experimentos: cargar los checkpoints y las filas de `arms_seed0.json` para reproducir la tabla adjudicada sin necesidad de reentrenar.
- Docencia o tutoriales: mostrar visualmente el colapso de la incertidumbre en un entorno de control continuo, sirviendo como ejemplo didáctico de un fallo teórico con implicaciones prácticas.
- Benchmarking de métodos de destilación: usar las métricas de u-rank y descomposición w/g como referencia para comparar nuevas variantes de pérdida.

## Benchmarks y rendimiento

Los resultados disponibles no son benchmarks estándar de modelos de lenguaje (MMLU, HumanEval, GSM8K), sino métricas de calibración de incertidumbre en el entorno `DelayedBimodal-v0`. La tabla adjudicada (N=10) se reproduce a continuación, extraída de la model card:

| Variante | u-rank (teacher–student) | Lectura |
|---|---:|---|
| ordinary | 0.934 | Línea base ingenua |
| lagged_hybrid | 0.946 | Solo arreglo de no estacionariedad |
| lagged_identified_eq | 0.948 | Ambos arreglos; mejor resultado a paridad |
| identified_eq | 0.877 | Pérdida corregida sola; por debajo de paridad |
| hybrid | 0.636 | Pérdida de decisión de un solo latente bajo crítico en vivo |
| identified_hybrid | 0.114 | Variante EMA rota: u-rank a nivel de ruido |

No se han publicado resultados de benchmarks de lenguaje porque el artefacto no es un modelo de lenguaje. La model card también menciona una verificación cruzada en DMC/hopper-hop con 10 semillas, donde la variante de pesos iguales supera a la EMA en +0.42 de u-rank, pero no está adjudicada.

## Requisitos de hardware

No se proporcionan requisitos de hardware en la documentación del repositorio. El tamaño del repositorio en HuggingFace es de 0.0 GB, pero esto no indica el tamaño real de los checkpoints. Los archivos `.pt` se cargan con `torch.load` y pueden inspeccionarse en CPU para análisis estático, pero no hay estimaciones de VRAM, latencia ni throughput. No se recomienda el despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje servible; el uso previsto es dentro del entorno de investigación en PyTorch del repositorio fuente.

## Comparativa con modelos similares

No se disponen de modelos comparables externos en la información proporcionada. El artefacto no pertenece a una categoría de modelos de lenguaje ni de agentes entrenados, por lo que no hay alternativas equivalentes con las que compararlo. Las variantes internas del propio artefacto (ordinary, hybrid, identified_hybrid, identified_eq, lagged_hybrid, lagged_identified_eq) se comparan entre sí en la sección de benchmarks, y representan los diferentes brazos del mismo experimento de destilación.

## Limitaciones y advertencias

- No es un agente entrenado ni un modelo de producción; es un artefacto de diagnóstico para investigación.
- Los checkpoints son específicos del entorno `DelayedBimodal-v0` y de la semilla 0; las conclusiones pueden no generalizar a otros entornos o semillas.
- La variante `identified_hybrid` está deliberadamente rota: aniquila el canal aleatorio y fija la dispersión del estudiante cerca de cero, por lo que no debe usarse como referencia de rendimiento.
- El protocolo de auto-gating (percentil de parada y peso desde el paso 900) puede afectar las comparaciones entre brazos, tal y como se indica en la model card.
- La métrica u-rank mide calibración de incertidumbre, no rendimiento del agente; no debe interpretarse como una medida de retorno o de éxito de la tarea.
- La licencia MIT permite uso comercial, pero no incluye garantías ni soporte; la documentación es mínima y depende del repositorio fuente para entender los detalles.
- No hay datos sobre sesgos conocidos ni sobre riesgos de alucinación, ya que no es un modelo generativo de texto.

## Enlaces

- HuggingFace: https://huggingface.co/nisaralll/udwm-identifiability-diagnostic
- Repositorio fuente en GitHub: https://github.com/nisaral/uncertainty-diffusion-world-models
