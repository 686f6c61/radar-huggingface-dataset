# SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_Pi0

## Resumen

Este repositorio contiene un fine-tuning del modelo fundacional de robotica π₀ (Pi0) de Physical Intelligence, adaptado a la libreria LeRobot de Hugging Face. Se trata de una politica Vision-Language-Action (VLA) generalista que recibe imagenes de camara e instrucciones en lenguaje natural y emite comandos de accion de bajo nivel para controlar un brazo robotico. El autor, SamerAyyad, lo ha especializado en una unica tarea de picking industrial sobre un robot UR5 equipado con ventosa.

El modelo parte de `lerobot/pi0_base` y se ha entrenado mediante imitation learning sobre un dataset propio de 300 episodios (191.275 frames a 30 FPS) que recoge la tarea "Pick up the CPU with the suction gripper and place it in the box". La arquitectura subyacente es la de Pi0, un transformer VLA de aproximadamente 4.028 millones de parametros que combina un codificador visual, un modelo de lenguaje y un cabezal de difusion de acciones.

Su relevancia es practica: demuestra el flujo completo de LeRobot para especializar un modelo fundacional de robotica en una tarea concreta con hardware de laboratorio, y sirve como referencia reproducible para quien quiera replicar el pipeline con su propio UR5. No obstante, al ser un fine-tuning de una sola tarea y sin evaluacion publicada, su valor es mas didactico que de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) transformer, base Pi0 (Physical Intelligence) |
| Parametros totales | 4.028.019.472 (~4,03 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de π₀ de Physical Intelligence: una politica VLA que fusiona percepcion visual, comprension de instrucciones en lenguaje natural y generacion de acciones motoras. La implementacion utilizada es la de LeRobot, adaptada del repositorio open source OpenPI. El modelo consume una imagen RGB de 3x480x640 y un vector de estado de 7 dimensiones, y produce un vector de accion de 7 dimensiones, lo que corresponde a un efector final de 6 grados de libertad mas la pinza/ventosa.

El fine-tuning se realizo sobre el dataset `SamerAyyad/VLA_Samer_15.11.2026_300eps_Last` con 300 episodios y 191.275 frames a 30 FPS. La configuracion de entrenamiento fue: 20.000 pasos, batch size 32, optimizador AdamW, learning rate 2,5e-05, semilla 1000 y LeRobot 0.6.2. No se especifica en la model card si hubo RLHF, DPO ni datos adicionales; se trata de imitation learning supervisado sobre demostraciones de la tarea unica.

## Capacidades

- Control robotico de extremo a extremo: mapea observaciones visuales y estado del robot a acciones de 7 dimensiones.
- Seguimiento de instrucciones en lenguaje natural para la tarea entrenada.
- Percepcion visual a partir de una camara RGB de 480x640.
- Ejecucion de una tarea especifica de pick-and-place con ventosa sobre UR5.
- Integracion nativa con el ecosistema LeRobot (entrenamiento, rollout y despliegue).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingueismo mas alla del prompt de tarea.

## Casos de uso

- Automatizacion de picking industrial: el modelo ejecuta la secuencia "recoger CPU con ventosa y depositarla en la caja" sobre un UR5, adecuado para lineas de montaje donde la tarea esta bien delimitada y se dispone de demostraciones.
- Prototipado rapido de politicas VLA: sirve como plantilla para que un equipo entrene su propia politica partiendo de `lerobot/pi0_base` con el mismo pipeline y CLI documentados.
- Investigacion en imitation learning: permite reproducir el flujo completo de grabacion de datos, entrenamiento y rollout con LeRobot 0.6.2 y comparar hiperparametros.
- Benchmark interno de hardware robotico: al estar especializado en una tarea concreta, se puede usar para medir latencia y fiabilidad de un UR5 con ventosa antes de escalar a produccion.
- Educacion y formacion: ejemplo didactico de fine-tuning de un modelo fundacional de robotica con un dataset pequeno (300 episodios).
- Base para fine-tuning posterior: al ser apache-2.0, se puede reentrenar sobre nuevas tareas manteniendo la inicializacion desde `pi0_base`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion; con ~4,03 mil millones de parametros en safetensors (repo de 8,9 GB), la inferencia en precision completa requiere del orden de 16 GB o mas, aunque no se confirma en la documentacion.
- GPU recomendadas: no especificadas por el autor; por tamano, una GPU con al menos 16-24 GB de VRAM (RTX 4090, A100, H100) es un punto de partida razonable, sin confirmacion oficial.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), que es el unico metodo documentado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Pi0 fine-tuned UR5) | ~4,03 B | no disponible | Pick-and-place con ventosa en UR5 | apache-2.0 | Hugging Face (LeRobot) |
| lerobot/pi0_base | no disponible en la informacion | no disponible | Politica VLA generalista | no disponible en la informacion | Hugging Face |
| π₀ original (Physical Intelligence) | no disponible en la informacion | no disponible | Politica VLA generalista multi-robot | no disponible en la informacion | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta entrenado para una unica tarea ("Pick up the CPU with the suction gripper and place it in the box") y un unico tipo de robot (UR5 con ventosa); no generaliza a otras tareas sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito ni resultados de benchmark, por lo que se desconoce su fiabilidad real.
- Dependencia del hardware: las camaras y el puerto del robot deben coincidir con los nombres de observacion del entrenamiento; cualquier cambio de calibracion o iluminacion puede degradar el comportamiento.
- Riesgo de sobreajuste al dataset: con solo 300 episodios y 20.000 pasos de entrenamiento, es probable que el modelo se ajuste a las condiciones especificas de recogida de datos.
- Idiomas: no se documenta soporte multilingue; el prompt de tarea esta en ingles.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base `lerobot/pi0_base` antes de produccion.
- Sesgos: no documentados, aunque al ser un modelo de robotica los sesgos se manifiestan como fallos de percepcion ante objetos, posiciones o condiciones de luz no vistas en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SamerAyyad/VLA_Samer_15.11.2026_300eps_Last_policy_Pi0
- Dataset de entrenamiento: https://huggingface.co/datasets/SamerAyyad/VLA_Samer_15.11.2026_300eps_Last
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de Pi0 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de Pi0 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi0
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=SamerAyyad/VLA_Samer_15.11.2026_300eps_Last
