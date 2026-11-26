# Bigwaverobotics/lerobot_lift_full_big_box

## Resumen

`lerobot_lift_full_big_box` es una politica de robotica basada en la arquitectura ACT (Action Chunking with Transformers) publicada por Bigwaverobotics dentro del ecosistema LeRobot de Hugging Face. El modelo resuelve una tarea concreta de manipulacion industrial: la elevacion (lift) de una caja grande en un escenario de pequenas y grandes cajas. No es un modelo de lenguaje: es un checkpoint de imitacion (imitation learning) que mapea observaciones visuales a secuencias de acciones motoras.

El modelo tiene 51.637.904 parametros (aproximadamente 51,6 millones), un tamano de repositorio de 0,2 GB y utiliza un backbone visual ResNet-18. Genera chunks de 50 acciones a partir de una unica observacion (`n_obs_steps: 1`), lo que permite un control reactivo con horizonte de prediccion corto. Esta entrenado sobre el dataset `itdevhumanoid/lerobot_lift_full_big_box_dataset` y se distribuye bajo licencia Apache-2.0.

Su relevancia es practica: demuestra el flujo completo de entrenamiento y publicacion de politicas ACT con LeRobot para tareas de pick-and-place industrial, y sirve como referencia reproducible para equipos que quieran replicar pipelines de imitation learning en entornos de fabricacion o logistica. El checkpoint es muy ligero y desplegable en hardware modesto, aunque su alcance esta estrictamente limitado a la tarea para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parametros totales | 51.637.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; `n_obs_steps: 1`, `chunk_size: 50`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de imitation learning disenada para control robotico de alta frecuencia. Combina un encoder visual (en este caso ResNet-18) que procesa la observacion de camara con un transformer que predice un chunk de acciones futuras. En este checkpoint, `chunk_size` y `policy_n_action_steps` valen ambos 50, de modo que el modelo emite 50 acciones por inferencia, reduciendo el error de compuesto y permitiendo un control mas suave que la prediccion paso a paso. `n_obs_steps` es 1, es decir, solo se utiliza la observacion mas reciente.

El entrenamiento se realizo por imitacion supervisada sobre el dataset `itdevhumanoid/lerobot_lift_full_big_box_dataset` (referenciado tambien como `bwr/dataset_21409` en la configuracion de entrenamiento). No se dispone de informacion sobre el numero de episodios, la composicion del dataset, el numero de tokens o pasos de entrenamiento, ni sobre el uso de RLHF o DPO, que no aplican a este tipo de politica. El pipeline de entrenamiento es Hugging Face LeRobot (Apache-2.0), y el checkpoint incluye preprocesador y postprocesador de normalizacion de acciones (`policy_preprocessor` y `policy_postprocessor`) junto con sus tensores de normalizacion.

## Capacidades

- Control robotico por imitacion para la tarea de elevacion (lift) de una caja grande en un escenario industrial de cajas pequenas y grandes.
- Generacion de chunks de 50 acciones por inferencia a partir de una unica observacion visual.
- Percepcion visual mediante backbone ResNet-18 integrado en la politica.
- Integracion nativa con la libreria LeRobot (`ACTPolicy.from_pretrained`).
- Normalizacion y desnormalizacion de acciones incluidas en el repositorio (preprocesador y postprocesador).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad de lenguaje natural.

## Casos de uso

- Automatizacion de elevacion de cajas en linea de produccion: la politica puede ejecutar la tarea de lift sobre cajas grandes de forma repetitiva, sustituyendo la programacion manual de trayectorias por una politica aprendida de demostraciones humanas.
- Prototipado rapido de celdas robotizadas: al ser un checkpoint ligero (51,6 M de parametros, 0,2 GB), permite validar el flujo completo de LeRobot en un banco de pruebas antes de escalar a tareas mas complejas.
- Base para fine-tuning en tareas de pick-and-place: el checkpoint sirve como punto de partida para reentrenar sobre datasets propios de elevacion o colocacion, aprovechando el backbone ResNet-18 ya ajustado.
- Investigacion en imitation learning: util como referencia reproducible para comparar variantes de ACT, cambios en `chunk_size` o en el backbone visual en entornos controlados.
- Formacion y docencia en robotica: ejemplo completo y de bajo coste de una politica ACT con preprocesadores y postprocesadores, adecuado para cursos sobre LeRobot y aprendizaje por imitacion.
- Integracion en pipelines de logistica de cajas: la tarea de lift es un paso previo comun en flujos de empaquetado y envio, por lo que la politica puede encadenarse con otras politicas de la misma serie (pick, place, pack, ship) mencionadas en la model card.
- Evaluacion de hardware de bajo coste: el reducido tamano del modelo permite ejecutar inferencia en GPUs de consumo, lo que facilita la validacion en robots de laboratorio con presupuesto limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (51,6 M de parametros, ~197 MiB de pesos en safetensors); en la practica, el consumo dominante sera el del backbone ResNet-18 y los buffers de inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es mas que suficiente. Tambien es viable en CPU para pruebas de baja frecuencia.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna (GTX 1650 en adelante) e incluso en placas integradas para inferencia esporadica.
- Opciones de despliegue: libreria LeRobot (`ACTPolicy.from_pretrained`) como via principal; el formato safetensors permite cargarlo con PyTorch estandar. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Backbone | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `lerobot_lift_full_big_box` (este) | 51,6 M | `n_obs_steps: 1`, `chunk_size: 50` | ResNet-18 | Apache-2.0 | Hugging Face Hub |
| Otras politicas ACT de LeRobot | no disponible | no disponible | no disponible | Apache-2.0 (framework) | Hugging Face Hub |
| OpenVLA | no disponible | no disponible | no disponible | no disponible | no disponible |
| Diffusion Policy (LeRobot) | no disponible | no disponible | no disponible | Apache-2.0 (framework) | Hugging Face Hub |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparativa se limita a la categoria (politicas de imitation learning para robotica) y no a metricas de tarea.

## Limitaciones y advertencias

- Alcance estrictamente limitado: la politica esta entrenada solo para la tarea de lift de una caja grande; no generaliza a otras tareas, objetos o entornos sin reentrenamiento.
- Sin datos de evaluacion: no se han publicado metricas de exito, tasas de fallo ni benchmarks, por lo que no es posible estimar su fiabilidad en produccion.
- Dependencia del entorno de entrenamiento: el rendimiento depende de que la camara, la iluminacion y la disposicion fisica coincidan con las del dataset de entrenamiento.
- Riesgo de sobreajuste a la tarea: con 51,6 M de parametros y un unico dataset, es probable que el modelo memorice trayectorias especificas y falle ante variaciones de posicion u oclusion.
- Sin capacidades linguisticas ni de razonamiento: no debe utilizarse para tareas de texto, codigo o dialogo.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar la procedencia del dataset `itdevhumanoid/lerobot_lift_full_big_box_dataset` antes de un despliegue comercial.
- Sin informacion sobre sesgos: no se documentan sesgos, pero al ser un modelo de robotica el riesgo relevante es el fallo fisico en la manipulacion, no el sesgo linguistico.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validacion externa del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bigwaverobotics/lerobot_lift_full_big_box
- Dataset de entrenamiento: https://huggingface.co/datasets/itdevhumanoid/lerobot_lift_full_big_box_dataset
- Framework LeRobot: https://github.com/huggingface/lerobot
