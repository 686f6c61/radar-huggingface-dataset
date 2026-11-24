# CarolinePascal/grabette-red-cube-green-box-closed-act-25

## Resumen

`CarolinePascal/grabette-red-cube-green-box-closed-act-25` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado y publicado con LeRobot, la biblioteca de Hugging Face para aprendizaje automático en robótica real, y está especializado en una única tarea: colocar un cubo rojo en una caja verde cerrada con el robot `grabette`.

La política consume una imagen de cámara (`observation.images.cam0`, 3×486×648) y un vector de estado de 2 dimensiones, y produce un vector de acción de 8 dimensiones. Con 51.589.768 parámetros, es un modelo compacto que puede ejecutarse en hardware modesto, aunque su ámbito de aplicación es muy restringido: no es un modelo de lenguaje ni un modelo generalista, sino un controlador visuomotor entrenado sobre 51 episodios (13.798 fotogramas a 30 FPS) de una tarea concreta.

Su relevancia es la de un ejemplo práctico y reproducible de aprendizaje por imitación con LeRobot: la model card documenta la configuración de entrenamiento (20.000 pasos, batch de 64, AdamW, LR 1e-5) y los comandos para ejecutar y reentrenar la política. No se han publicado resultados de evaluación en robot real, por lo que su rendimiento efectivo no está verificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación |
| Parametros totales | 51.589.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que, a partir de observaciones visuales y de estado, predice un chunk de acciones futuras en lugar de una sola acción por paso. Esta estrategia reduce el error de acumulación típico de las políticas paso a paso y suele lograr tasas de éxito altas en tareas de manipulación aprendidas de datos de teleoperación. La entrada visual es una imagen de 3×486×648 procedente de una única cámara (`cam0`), junto con un estado de 2 dimensiones; la salida es un vector de acción de 8 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `local/put-red-cube-green-box-closed_act_648x486`: 51 episodios, 13.798 fotogramas a 30 FPS, tarea "put-red-cube-green-box-closed". Se usaron 20.000 pasos de entrenamiento, batch de 64, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se documentan técnicas de RLHF/DPO (no aplicables a este tipo de política), aumentos de datos ni composición detallada del dataset más allá de los episodios y fotogramas indicados.

## Capacidades

- Control visuomotor de un robot `grabette` para la tarea específica "put-red-cube-green-box-closed".
- Predicción de chunks de acción de 8 dimensiones a partir de una imagen y un estado de 2 dimensiones.
- Aprendizaje por imitación a partir de datos de teleoperación (51 episodios).
- Ejecución mediante `lerobot-rollout` con la estrategia `base`.
- Reentrenamiento con `lerobot-train` usando `--policy.type=act`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No se documentan capacidades de visión general, audio ni modos de "thinking".

## Casos de uso

- Automatización de una tarea de pick-and-place en laboratorio: ejecutar la política sobre el robot `grabette` para colocar el cubo rojo en la caja verde cerrada, usando `lerobot-rollout` con `--strategy.type=base` y una duración acotada (por ejemplo, 60 s).
- Reproducción de experimentos de aprendizaje por imitación: servir como referencia reproducible de ACT con LeRobot 0.6.1, con configuración de entrenamiento documentada (20.000 pasos, batch 64, LR 1e-5).
- Base para fine-tuning en tareas similares: reentrenar con `lerobot-train` sobre un dataset propio de manipulación con el mismo tipo de robot y cámara.
- Validación de pipelines de teleoperación y calibración: comprobar que la cámara `cam0` y el estado de 2 dimensiones se capturan correctamente antes de desplegar políticas más complejas.
- Docencia y formación en robótica: ejemplo compacto (51,6 M de parámetros) para explicar ACT, chunks de acción y el flujo de LeRobot de principio a fin.
- Pruebas de integración de hardware: verificar el puerto del robot, los índices de cámara y la frecuencia de 30 FPS en un entorno controlado antes de escalar a tareas más exigentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,6 M de parámetros y pesos en safetensors (repo de 2,5 GB, que incluye checkpoints y posiblemente datos auxiliares), la inferencia es viable en GPUs de consumo, aunque no se documenta la huella exacta.
- GPU recomendadas: no disponible; el comando de entrenamiento de referencia usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Cabe en GPU de consumo: previsiblemente sí por el tamaño del modelo, pero no confirmado en la información disponible.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el dataset se grabó a 30 FPS, pero no se especifica la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grabette-red-cube-green-box-closed-act-25 | 51,6 M | no aplica | Tarea única de manipulación (cubo rojo en caja verde) | apache-2.0 | Hugging Face (LeRobot) |
| Otras políticas ACT en LeRobot Hub | no disponible | no aplica | Tareas de manipulación diversas | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | no disponible | no aplica | Manipulación visuomotora | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre esta política y alternativas, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenada solo para la tarea "put-red-cube-green-box-closed" con el robot `grabette`; no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de la cámara: la política espera una imagen de `cam0` con forma 3×486×648 y un estado de 2 dimensiones; cambios de cámara, iluminación, posición de objetos o calibración pueden degradar el comportamiento.
- Dataset pequeño: 51 episodios y 13.798 fotogramas; la cobertura de posiciones, distracciones y condiciones de iluminación es limitada.
- Sin capacidades de lenguaje, tool calling ni agentes: no debe usarse como modelo conversacional ni de razonamiento.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del dataset y del hardware asociado.
- Riesgo de sobreajuste al entorno de entrenamiento y de fallos silenciosos en ejecución prolongada; se recomienda acotar la duración de `lerobot-rollout` y supervisar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CarolinePascal/grabette-red-cube-green-box-closed-act-25
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Dataset de entrenamiento: https://huggingface.co/datasets/local/put-red-cube-green-box-closed_act_648x486
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/put-red-cube-green-box-closed_act_648x486
