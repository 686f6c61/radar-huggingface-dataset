# Bigwaverobotics/lerobot_place_big_box

## Resumen

`lerobot_place_big_box` es una política de imitación para robótica manipulativa publicada por Bigwaverobotics en Hugging Face. Se trata de un checkpoint de la familia ACT (Action Chunking Transformer) entrenado con el framework LeRobot de Hugging Face, orientado a la tarea concreta de "place big box" (colocar una caja grande) en un escenario industrial con cajas pequeñas y grandes. No es un modelo de lenguaje: es un modelo de control motor que mapea observaciones visuales a secuencias de acciones de un brazo robótico.

El modelo emplea un backbone visual ResNet-18 y genera bloques de 50 acciones (`chunk_size: 50`) a partir de una única observación (`n_obs_steps: 1`), lo que reduce la frecuencia de inferencia necesaria durante el control. Con 51.637.904 parámetros y un peso de aproximadamente 197 MiB en safetensors, es un modelo ligero que puede ejecutarse en hardware de borde junto al robot, sin necesidad de GPUs de datacenter.

Su relevancia es acotada pero práctica: demuestra el flujo completo de entrenamiento y publicación de políticas LeRobot para tareas de pick-and-place industrial, e incluye los procesadores de normalización y desnormalización de acciones necesarios para la inferencia correcta. Está publicado bajo licencia Apache-2.0, lo que facilita su reutilización y adaptación comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con backbone visual ResNet-18 |
| Parametros totales | 51.637.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; `n_obs_steps: 1`, horizonte de acción de 50 pasos) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de control robótico, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~197 MiB) más procesadores en safetensors y JSON |

## Arquitectura y entrenamiento

La política sigue la arquitectura ACT, un transformer que predice secuencias de acciones ("chunks") en lugar de acciones individuales. La configuración publicada fija `chunk_size: 50`, `policy_n_action_steps: 50`, `n_obs_steps: 1` y `policy_vision_backbone: resnet18`. El modelo incorpora dos procesadores serializados: un normalizador en el paso 3 del preprocesado y un desnormalizador en el paso 0 del postprocesado, ambos con pesos propios en safetensors, lo que garantiza que las acciones se escalen de forma consistente entre entrenamiento e inferencia.

El entrenamiento se realizó mediante imitación (behavior cloning) sobre el dataset `itdevhumanoid/lerobot_place_big_box_dataset`, referenciado también como `bwr/dataset_20094` en el `train_config.json`. La model card no especifica el número de episodios, la composición exacta ni si hubo aumento de datos o entrenamiento con RL; tampoco documenta hiperparámetros de optimización más allá de los recogidos en `train_config.json`. No se han publicado detalles sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), que en cualquier caso no aplican a este tipo de política.

## Capacidades

- Control robótico de manipulación: genera trayectorias de acción para colocar una caja grande en un escenario industrial.
- Predicción por chunks: emite bloques de 50 acciones por inferencia, lo que reduce la latencia efectiva de control.
- Percepción visual: utiliza un backbone ResNet-18 sobre las observaciones de cámara para condicionar las acciones.
- Integración con LeRobot: cargable mediante `ACTPolicy.from_pretrained` y compatible con el ecosistema de entrenamiento e inferencia de LeRobot.
- Normalización integrada: incluye procesadores de pre y postprocesado para escalar observaciones y acciones.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de "thinking"; no es un modelo generativo de texto.

## Casos de uso

- Automatización de pick-and-place industrial: el modelo ejecuta la fase de colocación de cajas grandes tras una fase de recogida, encadenándose con políticas hermanas de la misma serie (pick, pack, lift, ship) para completar un flujo logístico.
- Prototipado rápido de políticas robóticas: sirve como punto de partida para equipos que quieran validar el pipeline de LeRobot con una tarea concreta antes de entrenar sus propios checkpoints.
- Investigación en imitation learning: útil como referencia reproducible de una política ACT con backbone ResNet-18 y chunking de 50 acciones para comparar variantes arquitectónicas.
- Despliegue en hardware de borde: con ~197 MiB de pesos, puede ejecutarse en GPUs de consumo o en módulos integrados junto al brazo robótico, sin infraestructura de datacenter.
- Formación y demos: adecuado para demostraciones de manipulación en ferias, laboratorios o aulas donde se necesite una política ligera y de licencia permisiva.
- Base para fine-tuning en líneas de envasado: al estar bajo Apache-2.0, puede adaptarse con datos propios de una célula de fabricación específica sin restricciones de licencia comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los ~51,6 M de parámetros y el backbone ResNet-18; en la práctica, el cuello de botella suele ser la memoria del pipeline de visión y del entorno de simulación o control.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque las últimas están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (librería nativa), con soporte de PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles en la información proporcionada; el chunking de 50 acciones está diseñado precisamente para amortizar la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lerobot_place_big_box (este) | 51,6 M | 50 acciones por chunk, 1 obs. | ResNet-18 | Apache-2.0 | Hugging Face |
| Otras políticas ACT de LeRobot | variable | configurable | ResNet-18/34 | Apache-2.0 | Hugging Face |
| Políticas Diffusion Policy (LeRobot) | variable | configurable | variable | Apache-2.0 | Hugging Face |
| OpenVLA | ~7 B | acción por paso | ViT + LLM | BSD-3 / restrictiva según checkpoint | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización estrecha: la política está entrenada para una única tarea ("place big box") y un entorno concreto; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Dependencia del dataset: el comportamiento está ligado a la distribución de `itdevhumanoid/lerobot_place_big_box_dataset`; cambios en iluminación, cámara, posición inicial o tipo de caja pueden degradar el rendimiento.
- Sin métricas publicadas: no hay tasas de éxito ni evaluaciones cuantitativas que permitan estimar su fiabilidad en producción.
- Riesgo de alucinación en el sentido de acciones erróneas: al ser un modelo de imitación, puede producir trayectorias fuera de distribución ante observaciones no vistas, con riesgo físico para el robot o el entorno.
- Sesgos de datos: posibles sesgos derivados de las demostraciones humanas (velocidad, trayectorias, posiciones preferidas) que se reproducen en la política.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset asociado antes de un despliegue comercial.
- Sin soporte multilingüe ni de texto: no debe evaluarse como un modelo de lenguaje.
- Caveat de producción: requiere un pipeline de control en tiempo real y validación de seguridad (paradas de emergencia, límites de par) antes de operar con personas cerca.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bigwaverobotics/lerobot_place_big_box
- Dataset asociado: https://huggingface.co/datasets/itdevhumanoid/lerobot_place_big_box_dataset
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
