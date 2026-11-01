# nguigz/2jetonfusion1_trained

## Resumen

`nguigz/2jetonfusion1_trained` es una política de imitación (imitation learning) para robótica entrenada con el método ACT (Action Chunking with Transformers) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de control visuomotor que, a partir del estado articular de un robot `so_follower` (SO-100/SO-101 de LeRobot) y de dos cámaras (`front` y `top`), predice directamente comandos de acción de 6 dimensiones. Su autor es el usuario `nguigz` y el modelo se distribuye con licencia Apache 2.0.

El modelo resuelve una tarea muy concreta: colocar una ficha o jeton en una caja o bandeja ("mettre le jeton dans la boite", "mettre le jeton dans le bac"). Se entrenó sobre un dataset propio de 98 episodios y 29.260 fotogramas grabados a 30 FPS mediante teleoperación. Con 51.668.614 parámetros (unos 51,7 M) y un repositorio de 0,2 GB, es un modelo pequeño que cabe holgadamente en cualquier GPU de consumo e incluso puede ejecutarse en CPU para inferencia.

Su relevancia es la de un ejemplo reproducible de extremo a extremo del flujo de trabajo de LeRobot: grabación de datos con un robot de bajo coste, entrenamiento de una política ACT y despliegue en el robot real con `lerobot-rollout`. No aporta innovaciones de arquitectura propias; implementa el método ACT descrito en el paper arXiv:2304.13705.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decoder de acciones |
| Parametros totales | 51.668.614 (aprox. 51,7 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/cuANT) |
| Idiomas soportados | no disponible (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. La política combina un encoder visual (procesa las dos cámaras de 3×240×320) con un transformer que modela la secuencia de observaciones y genera un chunk de acciones de 6 dimensiones. El modelo consume `observation.state` de forma `(6,)` y las imágenes `observation.images.front` y `observation.images.top`, y produce `action` de forma `(6,)`.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `nguigz/2jetonfusion1` (98 episodios, 29.260 fotogramas, 30 FPS, dos tareas de colocación de jeton). Configuración: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta uso de RLHF, DPO ni datos adicionales fuera del dataset citado.

## Capacidades

- Control visuomotor por imitación para un robot `so_follower` con dos cámaras (`front`, `top`).
- Predicción de chunks de acción de 6 dimensiones a partir de estado articular e imágenes.
- Ejecución de dos tareas concretas de manipulación: colocar un jeton en una caja y en una bandeja.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de un pipeline de imitación de extremo a extremo: sirve como referencia para grabar datos con un SO-100/SO-101, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`, verificando cada etapa del flujo.
- Tarea de pick-and-place de laboratorio: el modelo ejecuta la colocación de un jeton en una caja o bandeja, adecuado para demostraciones docentes de manipulación robótica de bajo coste.
- Base para fine-tuning en tareas similares: al ser Apache 2.0 y pequeño (51,7 M), se puede reentrenar sobre nuevos datasets de pocos centenares de episodios con recursos modestos.
- Evaluación de hardware de robótica de bajo coste: permite medir latencia y tasa de éxito de una política ACT en un robot real antes de invertir en modelos mayores.
- Pruebas de integración con LeRobot: útil para validar versiones de la librería, comandos CLI y compatibilidad de formatos de observación en entornos de desarrollo.
- Docencia y divulgación: ejemplo compacto para explicar action chunking, teleoperación y aprendizaje por imitación sin necesidad de infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tasas de éxito por tarea).

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros en FP32 ocupa aproximadamente 0,2 GB de pesos, por lo que cabe en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (RTX 3060, RTX 4090, A100, H100); también es viable en CPU para inferencia, aunque la latencia de control puede ser mayor.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas e incluso en placas integradas.
- Opciones de despliegue: `lerobot-rollout` (CLI de LeRobot) con el robot `so_follower`; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dependen del robot, las cámaras y el hardware de control.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nguigz/2jetonfusion1_trained` (ACT) | 51,7 M | no aplica | Colocación de jeton con SO follower | Apache 2.0 | Hugging Face Hub |
| Políticas ACT de LeRobot (genéricas) | variable (del orden de decenas de M) | no aplica | Manipulación por imitación | Apache 2.0 | Hugging Face Hub |
| Políticas Diffusion Policy (LeRobot) | variable | no aplica | Manipulación por imitación | Apache 2.0 | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente para dos tareas concretas ("mettre le jeton dans la boite", "mettre le jeton dans le bac"); no generaliza a otras tareas sin reentrenamiento.
- Depende del robot `so_follower` y de la configuración exacta de cámaras (`front`, `top`); cambios de posición, iluminación o tipo de robot pueden degradar el comportamiento.
- No hay evaluación publicada en robot real, por lo que se desconoce la tasa de éxito.
- Riesgo de sobreajuste al dataset pequeño (98 episodios, 29.260 fotogramas).
- Sin capacidades de lenguaje, razonamiento ni tool calling; no debe emplearse fuera de su dominio robótico.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El modelo card no documenta sesgos ni limitaciones adicionales; al ser un modelo de control, los sesgos relevantes serían los del dataset de teleoperación.

## Enlaces

- Hugging Face: https://huggingface.co/nguigz/2jetonfusion1_trained
- Dataset de entrenamiento: https://huggingface.co/datasets/nguigz/2jetonfusion1
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía ACT de LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nguigz/2jetonfusion1
