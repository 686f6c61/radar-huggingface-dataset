# hubnemo/so101_smolvla_lora_v2_05_min_r8_bs32_12k

## Resumen

`hubnemo/so101_smolvla_lora_v2_05_min_r8_bs32_12k` es un adaptador LoRA de SmolVLA, un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot. El modelo base, `lerobot/smolvla_base`, está descrito en el paper arXiv:2506.01844 y está diseñado para control robótico de bajo coste computacional, con capacidad de ejecutarse en hardware de consumo. Este repositorio concreto no es un modelo completo, sino un fine-tuning mediante LoRA sobre dicho modelo base.

El adaptador está especializado en una única tarea de manipulación robótica: coger un cubo púrpura y depositarlo en una caja de cartón, ignorando el resto de objetos. Se ha entrenado sobre el dataset `Orellius/so101_sort_cubes_no_top`, compuesto por 77 episodios y 54 777 fotogramas a 30 FPS, grabados con un robot `so101_follower` y una única cámara frontal. El modelo consume el estado articular de 6 dimensiones y una imagen RGB de 480×640, y produce una acción de 6 dimensiones.

Su relevancia es acotada pero ilustrativa: demuestra el flujo completo de fine-tuning de políticas VLA con LeRobot sobre hardware asequible (SO-101), y sirve como referencia reproducible para quien quiera entrenar sus propias políticas de imitación. No obstante, el repositorio no incluye resultados de evaluación ni métricas de éxito en robot real, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos podrían no estar efectivamente subidos o que el adaptador es extremadamente pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA); adaptador LoRA sobre `lerobot/smolvla_base` |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la información proporcionada) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje compacto y un cabezal de acciones, entrenado para mapear observaciones (imagen y estado proprioceptivo) a comandos motores condicionados por una instrucción en lenguaje natural. El modelo base está pensado para inferencia en hardware de consumo, según la descripción del paper. Este repositorio aplica un adaptador LoRA (el nombre indica rango 8, batch size 32 y 12 000 pasos) sobre dicho modelo base, lo que reduce drásticamente el número de parámetros entrenables.

El entrenamiento se realizó con LeRobot 0.7.1, optimizador AdamW, learning rate 0.001, batch size 32, semilla 1000 y 12 000 pasos. El dataset contiene 77 episodios y 54 777 fotogramas a 30 FPS de una única tarea de picking-and-placing. No se documenta composición adicional del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas del adaptador más allá del propio método SmolVLA descrito en el paper.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 dimensiones a partir de estado articular e imagen.
- Seguimiento de instrucciones en lenguaje natural (condicionamiento por tarea): la tarea objetivo es "Grab the purple cube and put it into the cardboard box, ignore the other objects".
- Percepción visual monocámara: entrada `observation.images.front` de 3×480×640.
- Política de imitación entrenada end-to-end sobre demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, thinking mode, audio ni otras modalidades.

## Casos de uso

- Clasificación de cubos en línea de montaje educativa: la política ejecuta la tarea de coger el cubo púrpura e introducirlo en una caja, útil como banco de pruebas de manipulación con el SO-101 en laboratorios docentes.
- Reproducción de experimentos de imitación: sirve como punto de partida reproducible (12 000 pasos, semilla fija) para comparar variantes de LoRA en el mismo dataset.
- Base para fine-tuning con nuevos objetos: al ser un adaptador LoRA sobre `smolvla_base`, se puede reentrenar sobre datasets propios manteniendo el modelo base congelado y reduciendo requisitos de cómputo.
- Validación de pipelines LeRobot: útil para verificar la integración de `lerobot-rollout` con robots `so101_follower` y cámaras OpenCV antes de desplegar políticas más complejas.
- Demostración de VLA en hardware de consumo: al derivar de SmolVLA, está pensado para ejecutarse en equipos asequibles, lo que facilita talleres y prototipos sin GPU de datacenter.
- Investigación en generalización de políticas: permite estudiar cómo un adaptador de bajo rango se comporta ante cambios de iluminación, posiciones de objetos o distracciones, aunque no se aportan métricas al respecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al derivar de SmolVLA, el modelo base está descrito como desplegable en hardware de consumo, pero no se aportan cifras concretas.
- GPU recomendadas: no disponible. No se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: el paper del modelo base afirma que puede desplegarse en hardware de consumo; no se detalla qué GPU concretas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución en robot, `lerobot-train` para reentrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La captura de datos es a 30 FPS, pero no se reporta la frecuencia de inferencia de la política.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hubnemo/so101_smolvla_lora_v2_05_min_r8_bs32_12k` | Adaptador LoRA VLA para SO-101 | no disponible | no disponible | apache-2.0 | Hugging Face |
| `lerobot/smolvla_base` | VLA base (SmolVLA) | no disponible | no disponible | no disponible en la información | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | Políticas de imitación | no disponible | no disponible | no disponible | Ecosistema LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único entorno; no generaliza a otras tareas sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que se desconoce su fiabilidad en producción.
- Dependencia de la configuración de cámara: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento (`observation.images.front`).
- Sesgos: no documentados, pero al entrenarse sobre 77 episodios de un único operador y entorno, es probable que herede sesgos de posicionamiento, iluminación y objetos del dataset.
- Riesgo de alucinación motora: como toda política de imitación, puede generar acciones fuera de distribución ante escenas no vistas.
- Tamaño del repositorio de 0.0 GB: conviene verificar que los pesos del adaptador estén efectivamente disponibles antes de usarlo.
- Licencia apache-2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones propias que deben revisarse.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea está en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hubnemo/so101_smolvla_lora_v2_05_min_r8_bs32_12k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Orellius/so101_sort_cubes_no_top
- Paper SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Orellius/so101_sort_cubes_no_top
