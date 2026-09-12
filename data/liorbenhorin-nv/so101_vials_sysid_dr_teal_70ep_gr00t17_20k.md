# liorbenhorin-nv/so101_vials_sysid_dr_teal_70ep_GR00T17_20k

## Resumen

Este repositorio contiene un checkpoint de política robótica basado en GR00T N1.7, el modelo fundacional abierto de NVIDIA para razonamiento y habilidades en robots humanoides y brazos articulados. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones entrenado por flow matching, y predice comandos motores condicionados por visión, lenguaje y propiocepción. El checkpoint ha sido ajustado con LeRobot 0.6.0 sobre un dataset propio de 70 episodios y 27.983 fotogramas a 30 FPS, y está especializado en una única tarea: coger un vial y colocarlo en una gradilla.

A diferencia del modelo fundacional genérico, esta variante está afinada para el robot `so101_follower` con dos cámaras (`external` y `wrist`), lo que la convierte en un ejemplo práctico de adaptación de un VLA (vision-language-action) cross-embodiment a un montaje concreto de laboratorio. El nombre del artefacto sugiere un experimento de identificación de sistema con domain randomization sobre un objeto de color teal, aunque la model card no documenta ese extremo.

Su relevancia es doble: por un lado demuestra el flujo completo de entrenamiento y despliegue de GR00T dentro del ecosistema LeRobot; por otro, sirve como referencia reproducible (semilla 42, 20.000 pasos, AdamW, lr 1e-4) para investigar transferencia de políticas de imitación a hardware de bajo coste. El checkpoint pesa 3.144.016.000 parámetros y ocupa 12,6 GB en el repositorio. No se han publicado resultados de evaluación en la información disponible, por lo que no puede considerarse validado en términos de tasa de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 (3,14 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados unicamente en safetensors) |
| Idiomas soportados | no disponible (etiqueta de idiomas no informada) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so101_follower` |
| Camaras de entrada | `external`, `wrist` |
| Entradas | `observation.state` (6,), `observation.images.external` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Libreria de despliegue | lerobot |
| Tamano del repositorio | 12,6 GB |
| Tarea | "Pick up the vial and place it in the rack" |

## Arquitectura y entrenamiento

La arquitectura corresponde a GR00T N1.7, un modelo fundacional cross-embodiment de NVIDIA que separa el razonamiento visual y lingüístico del control motor. El componente de percepción y comprensión es un backbone Cosmos-Reason2/Qwen3-VL, encargado de procesar las dos cámaras RGB (480x640) junto con la instrucción en lenguaje natural. Sobre esa representación, un transformer de acciones entrenado con flow matching genera la secuencia de comandos de 6 dimensiones que se envía al robot. La política consume además el estado propioceptivo de 6 dimensiones (`observation.state`) y no requiere componentes recurrentes explícitos, ya que la predicción es directa sobre la observación actual.

El ajuste se realizó con LeRobot 0.6.0 durante 20.000 pasos, con batch size 16, optimizador AdamW, learning rate 0,0001 y semilla 42. El dataset de entrenamiento (`liorbenhorin-nv/so101_vials_sysid_dr_teal_70ep`) contiene 70 episodios, 27.983 fotogramas a 30 FPS y una única tarea. Se trata, por tanto, de aprendizaje por imitación supervisado sobre demostraciones de teleoperación; la model card no menciona RLHF, DPO ni ninguna fase de refinamiento por preferencias. Tampoco se documentan el número total de tokens de entrenamiento, la composición del dataset ni si hubo aumentos de datos fuera del domain randomization sugerido por el nombre del artefacto. No se declara ninguna innovación técnica adicional más allá del propio diseño flow-matching de la familia GR00T.

## Capacidades

- Control motor de manipulación: genera acciones de 6 grados de libertad para el brazo `so101_follower` a partir de observaciones visuales y de estado.
- Percepción multimodal: procesa simultáneamente dos flujos de vídeo de 480x640 (cámara externa y cámara de muñeca) más el estado propioceptivo.
- Condicionamiento por lenguaje: acepta una instrucción textual de tarea ("Pick up the vial and place it in the rack") que modula la política.
- Ejecución de una tarea de pick-and-place: coger un vial y depositarlo en una gradilla.
- Base cross-embodiment subyacente: el modelo fundacional GR00T N1.7 está diseñado para transferir entre morfologías, aunque este checkpoint concreto está especializado en una sola.
- Integración con el ecosistema LeRobot: despliegue mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades de audio ni modo de razonamiento explícito.

## Casos de uso

- Automatización de laboratorio: manipulación repetitiva de viales en entornos de análisis, donde la política puede ejecutar ciclos de recogida y colocación en gradilla de forma autónoma a partir de las dos cámaras.
- Sustitucion parcial de teleoperacion: ejecucion desatendida de la secuencia aprendida una vez calibrado el robot, liberando al operador de la tarea repetitiva.
- Recogida de datos adicionales: uso del checkpoint como politica base para generar nuevas trayectorias y ampliar el dataset con mas posiciones, iluminaciones o distractores.
- Investigacion en domain randomization: el nombre del artefacto (`sysid_dr_teal`) apunta a experimentos de identificacion de sistema y aleatorizacion de dominio, por lo que sirve como punto de partida controlado para medir robustez.
- Docencia y prototipado en robotica: ejemplo completo y reproducible de entrenamiento VLA con LeRobot sobre hardware SO-101, util para cursos y talleres.
- Benchmarking interno de politicas de imitacion: comparar GR00T N1.7 frente a ACT o SmolVLA en la misma tarea y mismo montaje de camaras.
- Prototipos de pick-and-place industrial ligero: adaptacion a otros objetos cilindricos y gradillas equivalentes reentrenando con un dataset reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica (`No evaluation results have been provided for this policy yet`), por lo que no existe tasa de exito, numero de ensayos ni comparacion cuantitativa con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 3,14 mil millones de parametros en bfloat16 ocupan aproximadamente 6,3 GB solo en pesos; sumando las activaciones del backbone de vision (dos imagenes de 480x640), la cache y las iteraciones del flow matching, es razonable reservar del orden de 10 a 16 GB, pero se trata de una estimacion, no de un dato publicado.
- GPU recomendadas: no disponible. Por tamano, una GPU con 16 GB o mas deberia ser suficiente en bfloat16; una RTX 4090 (24 GB), RTX 4080 (16 GB) o RTX 3090 (24 GB) entran en ese rango estimado.
- Cabe en GPU de consumo: probablemente si en modelos con 16 GB o mas, segun la estimacion anterior, pero no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base` y el `--policy.path` del repositorio) sobre PyTorch con CUDA. No se documenta soporte para vLLM, TGI, llama.cpp u Ollama, y no hay pesos GGUF publicados, por lo que las rutas de servido de LLM no aplican a esta politica.
- Latencia y throughput: no disponibles. El dataset de entrenamiento esta grabado a 30 FPS, lo que sugiere que el bucle de control objetivo opera en ese orden de frecuencia, pero no se publica ninguna medicion de latencia en inferencia.
- Requisitos adicionales: puerto del robot, calibracion de hardware y dos camaras OpenCV cuyos nombres deben coincidir exactamente con las claves de observacion (`observation.images.external` y `observation.images.wrist`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7, so101_vials) | 3,14 mil millones | no disponible | apache-2.0 | HuggingFace, via LeRobot | Especializado en una tarea y un robot (`so101_follower`) |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | no disponible | Repositorio Isaac-GR00T | Modelo fundacional cross-embodiment; este checkpoint deriva de el |
| SmolVLA (HuggingFace) | no disponible | no disponible | no disponible | HuggingFace, via LeRobot | VLA compacto orientado a hardware de consumo; categoria comparable |
| pi0 / pi0.5 (Physical Intelligence) | no disponible | no disponible | no disponible | Repositorio del autor | VLA de proposito general para manipulacion; categoria comparable |
| ACT (LeRobot) | no disponible | no disponible | no disponible | LeRobot | Politica de imitacion clasica, sin backbone VLM; referencia de linea base |

No se dispone de datos confirmados de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion solo puede establecerse en terminos cualitativos de categoria y licencia.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay tasa de exito, numero de ensayos ni condiciones de prueba, por lo que el rendimiento real en el robot es desconocido.
- Especializacion extrema: el checkpoint esta entrenado para una unica tarea ("Pick up the vial and place it in the rack") y un unico tipo de robot (`so101_follower`).
- Dataset muy reducido: 70 episodios y 27.983 fotogramas, lo que limita la generalizacion a posiciones, iluminaciones y objetos no vistos.
- Dependencia del montaje de camaras: los nombres, la resolucion (480x640) y la colocacion de las camaras deben coincidir con los del entrenamiento; cualquier cambio degrada la politica.
- Sensibilidad al dominio visual: variaciones de color, iluminacion o fondo pueden afectar al rendimiento, especialmente en un experimento con domain randomization acotado (`teal`).
- Sin modo de razonamiento explicito: el modelo no expone trazas de razonamiento ni mecanismos de verificacion, por lo que los fallos no son interpretables de forma directa.
- Riesgo de fallos silenciosos en manipulacion: una politica de imitacion puede ejecutar movimientos plausibles pero incorrectos sin senal de error; se recomienda supervision humana y limites de seguridad en el robot.
- Sesgos potenciales derivados de las demostraciones: el estilo de teleoperacion de los operadores que grabaron los 70 episodios queda reflejado en la politica.
- Licencia permisiva: apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte, y la atribucion sigue siendo obligatoria.
- Dependencia de version: entrenado con LeRobot 0.6.0; cambios mayores en la libreria pueden afectar a la compatibilidad de carga y despliegue.
- Idiomas y capacidades de lenguaje: no se documenta el alcance multilingue de la instruccion de tarea; se asume una unica frase en ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/liorbenhorin-nv/so101_vials_sysid_dr_teal_70ep_GR00T17_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/liorbenhorin-nv/so101_vials_sysid_dr_teal_70ep
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=liorbenhorin-nv/so101_vials_sysid_dr_teal_70ep
- Repositorio de GR00T (NVIDIA Isaac-GR00T): https://github.com/NVIDIA/Isaac-GR00T
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de GR00T en LeRobot: https://huggingface.co/docs/lerobot/main/en/groot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
