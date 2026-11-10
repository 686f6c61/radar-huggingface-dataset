# Riasok/pi05-libero-spatial-ppo-k5-timejitter100

## Resumen

`pi05-libero-spatial-ppo-k5-timejitter100` es un checkpoint final de un proceso de ajuste fino con aprendizaje por refuerzo (PPO) sobre el modelo base RLinf-Pi05-LIBERO-SFT, orientado a tareas de manipulacion robotica en el benchmark LIBERO-Spatial. Lo publica el usuario Riasok en Hugging Face bajo licencia Apache 2.0 y forma parte del ecosistema RLinf, un framework de RL para modelos de robotica. El modelo parte de la familia pi0.5, un modelo de politica visomotora (vision-language-action) desarrollado por Physical Intelligence, aunque esta ficha solo puede describir lo que la model card documenta explicitamente.

El checkpoint representa la actualizacion 100 de un entrenamiento PPO con K=5 pasos de desruido y un esquema de ruido aleatorizado (time_jitter=1.0) aplicado a la rejilla temporal del flujo. El interes tecnico reside en la modificacion del schedule de desruido: en lugar de una rejilla fija, cada actualizacion de PPO muestrea una rejilla perturbada y la comparte entre todos los rollouts de esa actualizacion, lo que introduce robustez estocastica en el proceso de generacion de acciones.

El modelo resuelve el problema de adaptar una politica visomotora preentrenada a tareas especificas de manipulacion mediante RL, en lugar de solo imitacion supervisada. Es relevante para investigadores que trabajan en RL para robotica con modelos de flujo (flow matching) y quieran reproducir o comparar variantes de schedule de desruido. El repositorio ocupa 8,5 GB y contiene pesos en formato PyTorch (`.pt`), no safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | politica visomotora pi0.5 con flow matching (detalles completos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`full_weights.pt`, state dict del actor) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo pi0.5 de Physical Intelligence, un modelo visomotor que genera acciones mediante flow matching. El checkpoint documenta un ajuste fino con PPO (Proximal Policy Optimization) sobre el modelo RLinf-Pi05-LIBERO-SFT, ejecutado dentro del framework RLinf. El entrenamiento se realiza sobre la tarea LIBERO-Spatial del benchmark LIBERO, con 100 actualizaciones de PPO, un epoch por actualizacion y semilla 42.

La innovacion tecnica destacable es el schedule de desruido aleatorizado. La rejilla base es t = [1, 0.8, 0.6, 0.4, 0.2, 0], con K=5 pasos de desruido. Cada punto interior t_k (k=1..4) se perturba con jitter * (u_k - 0.5) / K, donde u_k ~ U(0,1); con jitter=1.0 el desplazamiento maximo es de +-0.1. Los extremos (1 y 0) permanecen fijos. Se muestrea una rejilla por actualizacion de PPO (semilla 42 + indice de actualizacion), compartida por todos los rollouts de esa actualizacion, y se almacena con el rollout para reutilizarla en el recalculo de log-probabilidades. El nivel de ruido Flow-SDE es 0.5. No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO mas alla del propio PPO.

## Capacidades

- Generacion de acciones roboticas para tareas de manipulacion en el entorno LIBERO-Spatial.
- Politica visomotora: procesa observaciones visuales y produce comandos de accion (segun la arquitectura pi0.5).
- Entrenamiento con RL (PPO) sobre una politica preentrenada por imitacion, lo que permite optimizar recompensa directamente.
- Schedule de desruido estocastico por actualizacion, pensado para mejorar la robustez del proceso de generacion.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingue, thinking mode, vision general, audio ni generacion de texto libre; el modelo esta especializado en robotica.

## Casos de uso

- Investigacion en RL para robotica: reproducir el experimento de PPO con K=5 y time_jitter=1.0 sobre LIBERO-Spatial para comparar con schedules fijos. El checkpoint incluye el script de lanzamiento y la configuracion base, lo que facilita la replicacion.
- Evaluacion de robustez ante estocasticidad en el desruido: usar este checkpoint como referencia frente a variantes con jitter=0 para medir el impacto del schedule aleatorizado en la tasa de exito.
- Baseline para ajuste fino en otras tareas LIBERO: partir de estos pesos (o del SFT original) y aplicar PPO en tareas como LIBERO-Object o LIBERO-Goal.
- Estudio de estabilidad de PPO en modelos de flujo: analizar como evoluciona la politica a lo largo de las 100 actualizaciones con un epoch por actualizacion y semilla fija.
- Integracion en pipelines de RLinf: cargar el state dict del actor y la configuracion YAML para extender el entrenamiento con mas actualizaciones o distintos hiperparametros.
- Docencia y divulgacion: ejemplo concreto de como se aplica RL sobre un modelo visomotor preentrenado, con todos los hiperparametros documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 8,5 GB, lo que da una cota inferior orientativa para cargar los pesos en precision original.
- GPU recomendadas: no disponible en la model card. El nombre del fichero de configuracion (`libero_spatial_ppo_pi05_gpu01_100steps.yaml`) sugiere ejecucion en una unica GPU, pero no se especifica el modelo.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el checkpoint se distribuye como state dict de PyTorch (`full_weights.pt`), pensado para cargarse en el framework RLinf; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo visomotor de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-spatial-ppo-k5-timejitter100 (este) | no disponible | no disponible | LIBERO-Spatial (RL PPO) | Apache 2.0 | Hugging Face |
| RLinf-Pi05-LIBERO-SFT (modelo base) | no disponible | no disponible | LIBERO (SFT) | no disponible | referenciado en la model card |
| pi0.5 (Physical Intelligence) | no disponible | no disponible | politica visomotora general | no disponible | no disponible en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializado exclusivamente en LIBERO-Spatial; no es un modelo de proposito general ni de generacion de texto.
- El checkpoint es la actualizacion 100 de un entrenamiento corto (100 updates, 1 epoch por update); puede no haber convergido.
- Los pesos se distribuyen como state dict del actor en `.pt`, no como safetensors ni GGUF, lo que limita su uso fuera del framework RLinf.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma; al ser un modelo de robotica, estos conceptos no aplican de la misma forma, pero tampoco hay evaluacion de robustez publicada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base pi0.5 y el SFT de origen pueden tener condiciones adicionales no reflejadas en esta model card; conviene verificar la cadena de licencias antes de produccion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- No hay informacion sobre el dataset de entrenamiento, el numero de tokens ni la composicion, lo que dificulta evaluar la generalizacion.

## Enlaces

- Hugging Face: https://huggingface.co/Riasok/pi05-libero-spatial-ppo-k5-timejitter100
- Modelo base referenciado: RLinf-Pi05-LIBERO-SFT (no se proporciona URL directa en la informacion disponible)
- Framework RLinf: no se proporciona URL en la informacion disponible
- Benchmark LIBERO: no se proporciona URL en la informacion disponible
- Physical Intelligence (pi0.5): no se proporciona URL en la informacion disponible
