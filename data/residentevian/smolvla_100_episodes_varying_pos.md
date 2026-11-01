# ResidentEvian/smolvla_100_episodes_varying_pos

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para control de robots mediante aprendizaje por imitacion. Esta ficha concreta, `ResidentEvian/smolvla_100_episodes_varying_pos`, es un fine-tune del checkpoint base `lerobot/smolvla_base` entrenado por el usuario ResidentEvian sobre un unico dataset de 100 episodios para la tarea de recoger un cubo azul y depositarlo en una caja naranja con posiciones variables.

El modelo combina percepcion visual (dos camaras: vista superior y muneca), estado proprioceptivo del robot (vector de 6 dimensiones) y generacion de acciones motoras (vector de 6 dimensiones), todo ello con 450 millones de parametros. Su relevancia radica en que demuestra que un VLA de tamano reducido puede ejecutarse en hardware de consumo, lo que abarata la experimentacion en robotica de manipulacion frente a modelos VLA de mayor escala.

Se trata de un artefacto muy especializado: no es un modelo de proposito general, sino una politica entrenada para una tarea concreta sobre un robot `so_follower` (SO-100/101 de LeRobot). Su utilidad practica esta acotada al escenario fisico y al setup de camaras con el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, segun paper SmolVLA (arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | no disponible (modelo de robotica; las instrucciones de tarea se dan en ingles en el ejemplo de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es una politica visuomotora que fusiona observaciones visuales (imagenes de dos camaras a 480x640 y 30 FPS) con el estado del robot para predecir acciones de 6 grados de libertad. La arquitectura sigue el diseno descrito en el paper SmolVLA (arXiv:2506.01844), orientado a reducir el coste computacional frente a VLA de mayor tamano manteniendo un rendimiento competitivo en tareas de manipulacion. El checkpoint parte del modelo base preentrenado `lerobot/smolvla_base` y se ajusta de forma supervisada (aprendizaje por imitacion) sobre el dataset indicado.

El entrenamiento se realizo con LeRobot 0.6.1 durante 20.000 pasos, batch size de 8, optimizador AdamW, learning rate de 1e-4 y semilla 1000. El dataset de ajuste contiene 100 episodios y 51.805 fotogramas grabados a 30 FPS para la tarea "Grab the blue cube and put it in the orange box, varying positions". No se documenta el uso de RLHF, DPO ni tecnicas de refuerzo; se trata de imitacion pura sobre demostraciones teleoperadas.

## Capacidades

- Control visuomotor de un robot manipulador `so_follower` con dos camaras (`top` y `wrist`) y estado de 6 dimensiones.
- Prediccion de acciones de 6 dimensiones (posicion/orientacion del efector) a partir de observaciones en tiempo real.
- Ejecucion de una unica tarea de pick-and-place: coger un cubo azul y colocarlo en una caja naranja, con variacion de posiciones.
- Seguimiento de instrucciones de tarea en lenguaje natural (prompt de tarea en ingles), segun el flujo `lerobot-rollout`.
- No soporta tool calling, function calling, agentes multi-paso, vision general, audio ni razonamiento simbolico: es una politica motora, no un LLM de proposito general.
- Capacidades multilingues: no disponibles; el prompt de tarea usado en los ejemplos esta en ingles.

## Casos de uso

- Pick-and-place industrial ligero: el modelo ejecuta la secuencia de agarre y deposito de una pieza (cubo) en un contenedor, adecuado para tareas repetitivas de clasificacion en lineas de montaje de baja velocidad.
- Prototipado rapido en robotica de manipulacion: sirve como punto de partida para validar un pipeline completo de LeRobot (grabacion, entrenamiento, rollout) en menos de un dia con hardware de consumo.
- Investigacion en aprendizaje por imitacion: permite reproducir experimentos de VLA compactos con un dataset de 100 episodios y 20.000 pasos de entrenamiento, util para estudiar sensibilidad a posiciones variables.
- Benchmark interno de politicas VLA: al estar fine-tuneado sobre un dataset publico concreto, sirve como referencia para comparar variantes de SmolVLA o de otros VLA en la misma tarea.
- Educacion y formacion: util en cursos de robotica para ilustrar el ciclo completo de teleoperacion, curacion de datos y despliegue de una politica neuronal en un SO-100/101.
- Automatizacion de laboratorio: tareas de recogida y deposito de objetos pequenos en posiciones no fijas, donde la variabilidad de posicion del dataset de entrenamiento aporta robustez frente a colocaciones ligeramente distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion en robot real para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parametros en safetensors (probablemente fp32/bf16), el modelo ocupa en torno a 0,9-1,8 GB en memoria; el repo pesa 1,2 GB. Cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090); para entrenamiento se recomienda RTX 4090, A100 o H100 por el coste de los 20.000 pasos con batch 8.
- Cabe en GPU de consumo: si, en la mayoria de RTX y en GPUs integradas con suficiente memoria compartida para inferencia.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) y `lerobot-train` para reentrenamiento; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. La model card no reporta latencia por paso ni frecuencia de control efectiva; el dataset esta grabado a 30 FPS, pero no se garantiza que la politica opere a esa frecuencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ResidentEvian/smolvla_100_episodes_varying_pos` | 450 M | no disponible | Pick-and-place cubo en caja (SO-100/101) | Apache 2.0 | Hugging Face (14 descargas) |
| `lerobot/smolvla_base` | ~450 M (misma familia) | no disponible | VLA base preentrenado, ajustable a multiples tareas | Apache 2.0 | Hugging Face (modelo base oficial) |
| OpenVLA | ~7 B | no disponible | VLA generalista de manipulacion | no disponible en esta ficha | Hugging Face |
| Pi0 (Physical Intelligence) | no disponible | no disponible | VLA generalista | no disponible en esta ficha | no disponible |

La comparativa se limita a la familia SmolVLA y a referencias generales de VLA de mayor escala; no se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: solo ejecuta la tarea "coger cubo azul y meterlo en caja naranja"; fuera de ese escenario (otros objetos, colores o contenedores) el comportamiento no esta garantizado.
- Dependencia del setup fisico: requiere un robot `so_follower` y dos camaras (`top` y `wrist`) con la misma configuracion y nombres de observacion que en el entrenamiento; cualquier cambio de calibracion o montaje puede degradar el rendimiento.
- Sin evaluacion publicada: no hay tasa de exito medida en robot real, por lo que no se puede afirmar su robustez en produccion.
- Dataset pequeno: 100 episodios y 51.805 fotogramas es un volumen reducido; la generalizacion a posiciones, iluminacion o distractores no vistos es incierta.
- Riesgo de sobreajuste al entorno de grabacion: cambios de iluminacion, fondo o posicion de camaras pueden provocar fallos silenciosos.
- Sin capacidades de lenguaje general: no debe usarse como LLM, chatbot ni para razonamiento textual; el prompt de tarea es una etiqueta, no una instruccion conversacional.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre seguridad fisica del robot recae en el integrador; no hay garantias ni soporte del autor.
- Idiomas: no se documenta soporte multilingue en el prompt de tarea; los ejemplos oficiales usan ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ResidentEvian/smolvla_100_episodes_varying_pos
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ResidentEvian/blue-cube-into-box-varying-position_20261015_123135
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ResidentEvian/blue-cube-into-box-varying-position_20261015_123135
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
