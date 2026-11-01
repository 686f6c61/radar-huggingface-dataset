# Screener2/act_AnchoredCamera_combo_real_sim

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulacion y mejora las tasas de exito en tareas de manipulacion robotica. Este repositorio concreto, `Screener2/act_AnchoredCamera_combo_real_sim`, es una politica entrenada con LeRobot sobre el dataset `Screener2/AnchoredCamera_combo_real_sim`, compuesto por 30 episodios y 13.026 fotogramas a 30 FPS, que combina datos reales y de simulacion.

El modelo consume el estado del robot (vector de 6 dimensiones) y una imagen cenital de 480x640 pixeles, y produce un vector de accion de 6 dimensiones. Esta pensado para el robot `so_follower` (SO-100/SO-101 de LeRobot) con una unica camara montada en posicion elevada. Con 51.668.614 parametros y un peso de repositorio de 0,2 GB, es un modelo ligero que puede ejecutarse en hardware modesto.

Su relevancia es practica: sirve como ejemplo reproducible de entrenamiento ACT con mezcla de datos reales y simulados (real-sim), una estrategia habitual para aumentar la robustez de politicas de imitacion cuando el numero de demostraciones reales es limitado. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; politica de imitacion por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Entrada | `observation.state` (6,), `observation.images.overhead` (3, 480, 640) |
| Salida | `action` (6,) |
| Tipo de robot | `so_follower` |
| Camaras | `overhead` |
| Version de LeRobot | 0.5.2 |

## Arquitectura y entrenamiento

ACT es un transformer encoder-decoder disenado para aprendizaje por imitacion. El codificador procesa las observaciones (estado propioceptivo de 6 dimensiones e imagen cenital de 480x640), y el decodificador genera un chunk de acciones futuras en lugar de una sola accion, lo que mitiga el problema de compounding error tipico de las politicas paso a paso. La representacion de acciones se modela con una cabeza de mezcla (mixture density) sobre el chunk, segun el metodo original de Zhao et al. (2023, arXiv:2304.13705).

El entrenamiento se realizo con LeRobot 0.5.2 durante 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. El dataset combina 30 episodios (13.026 fotogramas a 30 FPS) de datos reales y simulados, con una unica tarea etiquetada como "0". No se documenta en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF/DPO (no aplica a este tipo de politica).

## Capacidades

- Generacion de acciones de control para robot manipulador `so_follower` a partir de estado propioceptivo e imagen cenital.
- Prediccion de chunks de accion (varias acciones futuras por inferencia), lo que reduce la frecuencia de inferencia necesaria.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas.
- Ejecucion de una tarea unica etiquetada como "0" (no se especifica la tarea concreta en la model card).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbolico.
- No es multilingue ni procesa texto; no tiene modo thinking, vision general, audio ni generacion de lenguaje.
- Integracion nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).

## Casos de uso

- Manipulacion robotica de una tarea especifica con SO-100/SO-101: la politica ejecuta la tarea "0" sobre el robot `so_follower` usando una camara cenital, adecuada para tareas de pick-and-place o ensamblaje simple en banco de trabajo.
- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible para comparar estrategias de mezcla real-sim en ACT, dado que el dataset y la configuracion de entrenamiento estan publicados.
- Prototipado rapido de politicas en laboratorio: con 51,7 M de parametros y 0,2 GB, se puede entrenar y desplegar en una estacion con GPU consumer, lo que facilita iteraciones frecuentes.
- Validacion de pipelines LeRobot: util para verificar la instalacion, calibracion de camara y flujo `lerobot-rollout` antes de entrenar politicas propias mas complejas.
- Docencia y formacion: ejemplo completo de extremo a extremo (dataset, entrenamiento, rollout) para cursos de robotica y aprendizaje por imitacion.
- Base para fine-tuning: punto de partida para adaptar ACT a nuevas tareas o robots del mismo tipo con pocas demostraciones adicionales.
- Evaluacion de robustez real-sim: permite estudiar como se comporta una politica entrenada con datos mixtos al desplegarse en el robot fisico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 51,7 M de parametros, mas el buffer de la imagen de entrada (3x480x640); en la practica, menos de 2 GB incluyendo overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoria de casos sobredimensionadas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna (GTX 1650 en adelante), e incluso es viable en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) como via principal; el formato safetensors permite cargarlo con PyTorch directamente. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La frecuencia de control depende del robot y de la camara (30 FPS en entrenamiento).

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Screener2/act_AnchoredCamera_combo_real_sim | 51,7 M | estado (6,) + imagen 480x640 | no aplica | Apache 2.0 | HuggingFace |
| ACT original (Zhao et al., 2023) | no disponible | estado + imagenes | no aplica | codigo abierto (ver repo) | paper + repo |
| Diffusion Policy (Chi et al., 2023) | no disponible | estado + imagenes | no aplica | codigo abierto (ver repo) | paper + repo |
| Otras politicas LeRobot ACT | variable | variable | no aplica | variable | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparacion se limita a categoria (politicas de imitacion para manipulacion robotica) y disponibilidad.

## Limitaciones y advertencias

- Entrenado para una unica tarea ("0") y un unico tipo de robot (`so_follower`); no generaliza a otras tareas ni robots sin reentrenamiento.
- Requiere una camara en posicion cenital (`overhead`) con la misma configuracion (480x640, 30 FPS); cambios de encuadre o iluminacion pueden degradar el rendimiento.
- Solo 30 episodios de entrenamiento, lo que limita la robustez frente a variaciones de posicion de objetos, distractores o condiciones de iluminacion no vistas.
- No hay evaluacion publicada: se desconoce la tasa de exito real en el robot fisico.
- Riesgo de sobreajuste al dataset y de comportamiento fragil fuera de la distribucion de entrenamiento.
- No es un modelo de lenguaje: no procesa texto, no razona simbolicamente y no soporta tool calling ni agentes.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar el cumplimiento de las licencias de LeRobot y del dataset asociado.
- Para produccion, es imprescindible validar en el robot objetivo con multiples ensayos y condiciones antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Screener2/act_AnchoredCamera_combo_real_sim
- Dataset: https://huggingface.co/datasets/Screener2/AnchoredCamera_combo_real_sim
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Screener2/AnchoredCamera_combo_real_sim
- Paper ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout/inferencia: https://huggingface.co/docs/lerobot/main/en/inference
