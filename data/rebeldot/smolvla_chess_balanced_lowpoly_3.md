# RebelDot/smolvla_chess_balanced_lowpoly_3

## Resumen

smolvla_chess_balanced_lowpoly_3 es una política robótica (vision-language-action, VLA) obtenida mediante fine-tuning de `lerobot/smolvla_base` con la librería LeRobot. El autor es RebelDot y el modelo está publicado en Hugging Face con el pipeline `robotics`. No se trata de un modelo de lenguaje generalista, sino de un controlador entrenado para una tarea concreta de manipulación sobre un robot SO101, con entradas de estado de las articulaciones y dos cámaras (cámara superior y muñeca derecha).

El modelo se ha entrenado durante 80.000 pasos con batch size 8 y learning rate 1e-4, generando checkpoints en los pasos 20.000, 40.000, 60.000 y 80.000. La tarea se denomina internamente `so101_chess_balanced_lowpoly_3`, lo que sugiere una manipulación de piezas de ajedrez en un entorno simulado o de baja poligonización. El repositorio ocupa 12,7 GB e incluye pesos en safetensors, configuraciones, pre/post-procesadores y estados de entrenamiento para reanudación.

Su relevancia es acotada: sirve como ejemplo reproducible de fine-tuning de SmolVLA con LeRobot para una tarea SO101, y como punto de partida para quien quiera adaptar la política a su propio entorno. No hay información pública sobre licencia, idiomas ni benchmarks, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA), fine-tuning de `lerobot/smolvla_base` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con config, pre/post-procesadores y `train_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es SmolVLA, una política VLA de la familia LeRobot que combina un codificador visual y un decodificador de acciones condicionado por el estado del robot y las observaciones de cámara. El modelo parte de `lerobot/smolvla_base` y se ajusta con un dataset local (`local/so101_chess_balanced_lowpoly_3`) para la plataforma SO101. Las entradas declaradas son `observation.state`, `observation.images.top_camera` y `observation.images.right_wrist_camera`.

El entrenamiento se realizó con LeRobot durante 80.000 pasos, batch size 8, learning rate 0,0001, semilla 1000 y chunk size de 50 acciones. Se publican checkpoints intermedios cada 20.000 pasos, junto con el estado del optimizador, scheduler y RNG para reanudar el entrenamiento. No se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO; tampoco se documentan innovaciones técnicas adicionales más allá del propio pipeline de LeRobot.

## Capacidades

- Control robótico de manipulación sobre la plataforma SO101 mediante predicción de secuencias de acciones (chunk de 50 pasos).
- Percepción visual multimodal a partir de dos cámaras: cámara superior y cámara de muñeca derecha.
- Condicionamiento por estado de las articulaciones (`observation.state`).
- Ejecución de políticas de imitación entrenadas por fine-tuning sobre SmolVLA.
- Reanudación de entrenamiento desde checkpoints intermedios con estado completo de optimizador y scheduler.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo ni modos de pensamiento.

## Casos de uso

- Manipulación de piezas de ajedrez en SO101: la política está entrenada específicamente para la tarea `chess_balanced_lowpoly_3`, por lo que puede usarse para recoger y colocar piezas en un tablero dentro de un entorno controlado.
- Reproducción de experimentos de fine-tuning VLA: los checkpoints y logs permiten replicar el entrenamiento y comparar el efecto de distintos pasos sobre el rendimiento.
- Punto de partida para nuevas tareas SO101: sirve como inicialización para fine-tuning en tareas de manipulación similares con la misma configuración de cámaras.
- Evaluación de pipelines LeRobot: útil para validar el flujo de entrenamiento, carga de políticas y pre/post-procesado en entornos de investigación.
- Docencia y divulgación: ejemplo concreto de cómo se entrena y publica una política SmolVLA con LeRobot.
- Pruebas de integración en simulación: el nombre "lowpoly" sugiere un entorno simulado de baja poligonización, adecuado para validar controladores antes de transferir a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,7 GB e incluye pesos, estados de entrenamiento y logs, por lo que el peso de inferencia es inferior a esa cifra pero no se detalla.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `lerobot.policies.factory.get_policy_class("smolvla")` con `from_pretrained` apuntando al subdirectorio `checkpoints/080000/pretrained_model`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_chess_balanced_lowpoly_3 | no disponible | no disponible | Manipulación SO101 (ajedrez) | no disponible | Hugging Face, repo 12,7 GB |
| lerobot/smolvla_base | no disponible | no disponible | Política VLA base | no disponible | Hugging Face |
| Otras políticas LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | Manipulación robótica | variable | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para una tarea y plataforma muy específicas (SO101, `chess_balanced_lowpoly_3`); no es un modelo generalista.
- Sin licencia declarada: no se puede asumir uso comercial sin consultar al autor.
- Sin información sobre sesgos, alucinación o robustez fuera del dominio de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento ni de transferencia a hardware real.
- El dataset de entrenamiento es local y no se publica su composición, lo que limita la reproducibilidad completa.
- El repositorio incluye estados de entrenamiento y logs que inflan el tamaño (12,7 GB) sin aportar valor a la inferencia.
- Sin soporte documentado de idiomas, tool calling ni agentes; no debe evaluarse como modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/RebelDot/smolvla_chess_balanced_lowpoly_3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: no se proporciona enlace en la información disponible.
