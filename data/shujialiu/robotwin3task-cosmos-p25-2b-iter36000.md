# shujialiu/robotwin3task-cosmos-p25-2b-iter36000

## Resumen

El repositorio `shujialiu/robotwin3task-cosmos-p25-2b-iter36000` contiene un checkpoint completo de entrenamiento distribuido para un modelo de política robótica (VLA, Vision-Language-Action) basado en el modelo de mundo Cosmos-Predict2.5-2B de NVIDIA. Desarrollado por el autor shujialiu, este checkpoint corresponde a la ejecución `p25_2b_224_seed0` del framework RoboTwin, orientado a tres tareas de manipulación robótica en simulación: colgar una taza (`hanging_mug`), apilar tres bloques (`stack_blocks_three`) y levantar una olla (`lift_pot`).

El modelo combina un modelo de mundo predictivo (Cosmos-Predict2.5) con una política de acción entrenada mediante LoRA (rank 32) sobre imágenes de 224×224 píxeles y chunks de acción de 32 pasos. El checkpoint está guardado en la iteración 36000 de un objetivo original de 40000, e incluye no solo los pesos del modelo, sino también el estado del optimizador, el scheduler y el trainer, lo que permite reanudar el entrenamiento interrumpido. No se trata de un modelo listo para inferencia, sino de un artefacto de investigación para continuar el proceso de entrenamiento.

La relevancia de este repositorio radica en que ejemplifica el uso de modelos de mundo generativos (Cosmos-Predict2.5) como base para políticas robóticas, una tendencia emergente en el campo de la robótica física. Sin embargo, el checkpoint no ha sido validado con las evaluaciones closed-loop de RoboTwin (`demo_clean` o `demo_randomized`), por lo que su rendimiento real no está confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basado en Cosmos-Predict2.5-2B (modelo de mundo) con LoRA |
| Parametros totales | 2B (modelo base Cosmos-Predict2.5-2B) |
| Parametros activos | no disponible (no es MoE; LoRA anade parametros entrenables) |
| Longitud de contexto | no disponible (entrada de imagen 224×224 y secuencia de acciones) |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16) |
| Idiomas soportados | no disponible (modelo robotico, no linguistico) |
| Licencia | other (no se especifica; probablemente vinculada a Cosmos-Predict2.5) |
| Formato de pesos | PyTorch Distributed Checkpoint (8 shards) |

## Arquitectura y entrenamiento

El modelo se construye sobre Cosmos-Predict2.5-2B, un modelo de mundo accion-condicionado desarrollado por NVIDIA que predice estados futuros del entorno a partir de observaciones y acciones. Sobre este modelo base, se entrena una politica robotica mediante LoRA con rank y alpha de 32, lo que permite adaptar el modelo de mundo a tareas de manipulacion especificas sin modificar los pesos originales. La entrada consiste en imagenes de 224×224 píxeles y la salida son chunks de accion de 32 pasos.

El entrenamiento se realizó en 8 GPUs A800 de 80 GB, con un micro-batch de 32 por GPU y acumulacion de gradientes de 1, resultando en un batch global efectivo de 256. La precision utilizada fue bfloat16. El checkpoint guardado en la iteracion 36000 incluye el estado completo del optimizador, scheduler y trainer, ademas de los pesos, lo que permite reanudar el entrenamiento desde ese punto. El dataset de demostraciones procesadas y los embeddings `reason1_embeddings.pkl` no se incluyen en el repositorio, por lo que para reanudar el entrenamiento es necesario preparar esos datos externamente.

## Capacidades

- Generacion de acciones de manipulacion robotica para tres tareas concretas: colgar una taza, apilar tres bloques y levantar una olla.
- Prediccion de estados futuros del entorno gracias al modelo de mundo Cosmos-Predict2.5 subyacente.
- Adaptacion mediante LoRA, lo que permite un fine-tuning eficiente en terminos de parametros.
- Capacidad de reanudar entrenamiento interrumpido gracias al checkpoint completo (modelo, optimizador, scheduler, trainer).
- No se documentan capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso.
- No se indica soporte para vision fuera de las imagenes de entrada del simulador RoboTwin.

## Casos de uso

- Investigacion en politicas roboticas VLA: el checkpoint permite a otros investigadores reanudar el entrenamiento desde la iteracion 36000 y continuar hasta el objetivo de 40000, o explorar variaciones en el protocolo de entrenamiento.
- Desarrollo de modelos de mundo para robotica: al estar basado en Cosmos-Predict2.5, sirve como ejemplo de integracion de un modelo de mundo generativo con una politica de manipulacion.
- Evaluacion de politicas en simulacion RoboTwin: una vez exportado el modelo (no incluido en el repositorio), podria evaluarse en los entornos `hanging_mug`, `stack_blocks_three` y `lift_pot` del simulador RoboTwin, aunque el autor advierte que no ha sido validado.
- Estudio de tecnicas de fine-tuning eficiente: el uso de LoRA con rank 32 sobre un modelo de 2B proporciona un caso de estudio sobre como adaptar modelos de mundo a tareas especificas con recursos limitados.
- Reanudacion de entrenamientos distribuidos: el repositorio incluye scripts y configuraciones para reanudar el entrenamiento en un cluster con 8 GPUs, util para reproducir o extender el experimento.
- Comparacion de estrategias de post-entrenamiento: puede servir como referencia para comparar con otros enfoques de post-entrenamiento de modelos de mundo robotico, como el descrito en el proyecto AI-Build-AI sobre RT-1 World Model.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el checkpoint no ha sido validado con las evaluaciones closed-loop de RoboTwin (`demo_clean` o `demo_randomized`). Por tanto, no existen datos de rendimiento cuantitativos (exito en tareas, tasa de colision, etc.) para este modelo.

## Requisitos de hardware

- Entrenamiento: 8 GPUs A800 de 80 GB (hardware utilizado para generar el checkpoint). Se requiere una configuracion equivalente para reanudar el entrenamiento.
- Inferencia: no aplicable directamente, ya que el repositorio contiene un checkpoint de entrenamiento, no un modelo exportado para inferencia. Para usar el modelo en inferencia seria necesario exportar los pesos LoRA y combinarlos con el modelo base Cosmos-Predict2.5-2B.
- VRAM estimada para inferencia: no disponible, depende del formato de exportacion y de la cuantizacion aplicada.
- Opciones de despliegue: no se proporcionan instrucciones para vLLM, llama.cpp, Ollama o TGI. El modelo esta pensado para el ecosistema PyTorch y el simulador RoboTwin.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos alternativos. El campo de los VLA basados en modelos de mundo es emergente y los unicos referentes encontrados en la busqueda web son:

- **Cosmos-Predict2.5-2B** (NVIDIA): modelo base sobre el que se construye este checkpoint. No es una politica robotica, sino un modelo de mundo accion-condicionado.
- **RT-1 World Model** (proyecto AI-Build-AI): post-entrenamiento autonomo de Cosmos-Predict2.5-2B sobre el dominio de manipulacion RT-1. No se proporcionan metricas comparativas.
- **GR00T N1.6** (NVIDIA, CVPR 2026): VLA para humanoides, pero sin datos publicos de rendimiento en tareas similares.

Dado que no hay benchmarks publicados para este checkpoint, no es posible comparar numericamente con estas alternativas.

## Limitaciones y advertencias

- El checkpoint no ha sido validado con las evaluaciones closed-loop de RoboTwin (`demo_clean` o `demo_randomized`), por lo que su rendimiento real en las tareas es desconocido.
- No es un modelo listo para inferencia; requiere exportacion de pesos y combinacion con el modelo base Cosmos-Predict2.5-2B.
- El repositorio no incluye los datos de demostraciones procesadas ni los embeddings `reason1_embeddings.pkl`, necesarios para reanudar el entrenamiento.
- La licencia es "other" y no se especifican los terminos exactos. Dado que el modelo base es de NVIDIA, es probable que se apliquen restricciones de uso comercial derivadas de la licencia de Cosmos-Predict2.5.
- El entrenamiento se detuvo en la iteracion 36000 de un objetivo de 40000; el modelo podria no haber convergido completamente.
- Solo cubre tres tareas de manipulacion especificas; no es un modelo generalista.
- No se documentan capacidades de generalizacion a otros entornos o robots.
- No se proporcionan datos sobre sesgos, alucinaciones o riesgos de seguridad en el contexto robotico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/shujialiu/robotwin3task-cosmos-p25-2b-iter36000
- Cosmos 3 (NVIDIA Research): https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Proyecto AI-Build-AI sobre post-entrenamiento de Cosmos-Predict2.5: https://github.com/aibuildai/AI-Build-AI/tree/main/tasks/robot-world-model-post-training
- Articulo sobre Physical AI Open Source en CVPR 2026 (menciona GR00T N1.6 y otros): https://chatforest.com/builders-log/nvidia-physical-ai-cvpr-2026-gr00t-alpamayo-openshell-skills-builder-guide/
