# rijal028/asimov-v1-adaptive-engine

## Resumen

El modelo `rijal028/asimov-v1-adaptive-engine` es un checkpoint de aprendizaje por refuerzo diseñado para el control de un robot humanoide bipedal de 25 grados de libertad (DOF) denominado Menlo Asimov v1. Desarrollado por el investigador independiente rijal028 (rijal saepuloh), el modelo implementa un mecanismo de auto-recuperación predictiva en tiempo real basado en *Active Inference* y *Predictive Coding*. Su objetivo es mantener la estabilidad de la marcha del robot cuando se producen fallos o malformaciones en el sistema, mediante una adaptación continua de la política de control sin necesidad de reentrenamiento completo.

El modelo se presenta como un "motor adaptativo" que consolida patrones de compensación de anomalías durante la operación, logrando un rendimiento superior al de una política estática en escenarios de malfunción. Los resultados reportados en la model card indican un 90% de tasa de victoria en 20 etapas de fallos simulados, con un incremento de 449 pasos adicionales de estabilidad respecto al baseline. La licencia es MIT, lo que permite uso comercial y modificación, aunque no se especifican idiomas ni otros datos técnicos habituales en modelos de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal para política de control y predictor de dinámica (world model) basado en Active Inference / Predictive Coding |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, es un modelo de control) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (ficheros `.pt`) |

## Arquitectura y entrenamiento

El modelo está compuesto por tres ficheros de checkpoint: `asimov_adapted_policy.pt` (política adaptada), `asimov_base_policy.pt` (política nominal base) y `asimov_world_model.pt` (predictor de dinámica). La arquitectura se basa en los principios de *Active Inference*: el sistema mantiene un modelo generativo del mundo que predice las consecuencias de las acciones y calcula la "sorpresa" o error de predicción. Durante la operación, el modelo ajusta la política en tiempo real para minimizar esa sorpresa y mantener la estabilidad.

El entrenamiento se realiza mediante aprendizaje por refuerzo en un entorno de simulación MuJoCo, con un proceso de auto-recuperación continua que consolida patrones de compensación de anomalías sin caer en olvido catastrófico. El parámetro de drift se mantiene en un 0.977%, lo que indica una preservación de la marcha estable. No se especifica el número de tokens ni el dataset de entrenamiento, ya que no es un modelo de lenguaje.

## Capacidades

- Control de un robot humanoide bipedal de 25 DOF en entornos simulados (MuJoCo).
- Auto-recuperación en tiempo real ante fallos o malformaciones del sistema.
- Adaptación de la política de control sin reinicio, usando *predictive coding* para estimar la sorpresa.
- Consolidación de patrones de compensación de anomalías en un checkpoint adaptativo.
- Preservación de la estabilidad de la marcha sin olvido catastrófico (drift de parámetros < 1%).
- No es un modelo de lenguaje, visión ni razonamiento simbólico; sus capacidades se limitan al control motor robótico.

## Casos de uso

- **Robótica de servicio en entornos impredecibles**: el modelo puede mantener la estabilidad de un robot humanoide en entornos con perturbaciones externas (suelo irregular, empujones) gracias a su adaptación en tiempo real.
- **Mantenimiento de robots en producción**: en líneas de ensamblaje donde un robot puede sufrir desgaste o daños parciales, el modelo ajusta la política para continuar operando sin detener la producción.
- **Investigación en control adaptativo**: sirve como referencia para implementar *Active Inference* en sistemas físicos, permitiendo estudiar la auto-recuperación en robots con múltiples grados de libertad.
- **Entrenamiento de robots en simulación**: se puede integrar en pipelines de sim-to-real para transferir políticas adaptativas a robots físicos.
- **Evaluación de robustez de políticas**: permite comparar la resiliencia de una política estática frente a una adaptativa en escenarios de fallos.
- **Desarrollo de sistemas de auto-diagnóstico**: el modelo puede usarse como base para detectar anomalías en la dinámica del robot y generar acciones de compensación automáticas.

## Benchmarks y rendimiento

Según la model card, se realizó un benchmark con 20 etapas de malfunción. Los resultados son los siguientes:

| Métrica | Baseline (Static Policy) | Método adaptativo (LR 1e-06) |
|---|---|---|
| Pasos de estabilidad | 5,818 | 6,267 |
| Incremento de pasos | - | +449 |
| Tasa de victoria | - | 18/20 (90%) |
| Drift de parámetros | - | 0.977% |

No se proporcionan otros benchmarks estándar (MMLU, HumanEval, etc.) porque no es un modelo de lenguaje.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU específicos en la información disponible.
- Al ser un modelo de control robótico, la inferencia se realiza en entornos de simulación como MuJoCo, que suele requerir una GPU para acelerar la física (aunque puede funcionar en CPU).
- El entrenamiento de políticas de refuerzo con 25 DOF puede requerir una GPU de gama media (por ejemplo, RTX 3060 o superior) para tiempos razonables, pero no se documenta.
- Para despliegue en simulación, se recomienda usar MuJoCo con Python y PyTorch.
- No se mencionan opciones de despliegue como vLLM, llama.cpp, etc., ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (control adaptativo de humanoides con Active Inference). La model card no menciona alternativas. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no aplica, al no ser un modelo de lenguaje.
- **Riesgo de inestabilidad**: aunque el modelo demuestra robustez en simulación, no se han validado en robots físicos reales; la transferencia sim2real puede no ser trivial.
- **Contexto de aplicación**: solo está probado para un humanoide de 25 DOF en MuJoCo; no es genérico para otros robots o entornos.
- **Dependencia de la simulación**: el rendimiento depende de la fidelidad del simulador; las condiciones reales pueden diferir.
- **Licencia**: MIT permite uso comercial, pero no hay garantía de soporte ni responsabilidad del autor.
- **Fecha de creación**: el modelo fue publicado el 23 de agosto de 2026 (según los metadatos), lo que podría indicar una versión reciente o experimental.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/rijal028/asimov-v1-adaptive-engine)
- [Perfil del autor en Hugging Face](https://huggingface.co/rijal028)
- [GitHub del autor](https://github.com/rijal028/rijal028)
- No se han encontrado otros enlaces (papers, blogs) en la búsqueda web.
