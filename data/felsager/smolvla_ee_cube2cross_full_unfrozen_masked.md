# felsager/smolvla_ee_cube2cross_full_unfrozen_masked

## Resumen

`felsager/smolvla_ee_cube2cross_full_unfrozen_masked` es un ajuste fino de [lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base), el modelo vision-language-action (VLA) compacto del ecosistema LeRobot de HuggingFace. SmolVLA, presentado en el paper [arXiv:2506.01844](https://arxiv.org/abs/2506.01844), tiene unos 450 millones de parámetros y convierte imágenes de cámara, el estado del robot e instrucciones en lenguaje natural en acciones de control, con el objetivo expreso de ejecutarse en hardware de consumo. Esta versión concreta la ha entrenado el usuario felsager para un brazo UR5e en tareas de pick-and-place: coger un cubo de color (azul, amarillo, verde o rojo) y colocarlo sobre una cruz roja.

El entrenamiento se realizó sobre el dataset `felsager/vla_cubes_cross` (1.000 episodios, 341.240 frames a 30 FPS) durante 80.000 pasos con AdamW. Su relevancia es doble: sirve como política lista para desplegar en esa célula robótica concreta y como ejemplo reproducible de cómo adaptar un VLA base a una tarea propia con recursos modestos, todo bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA SmolVLA: VLM compacto (SmolVLM2) + experto de acciones con flow matching |
| Parámetros totales | 450.046.176 (≈450 M, verificado en safetensors) |
| Parámetros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible (no aplica: política robótica, no un LLM generativo) |
| Tipos de cuantización | no disponible (solo pesos originales, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (las instrucciones de entrenamiento están en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/smolvla_base |
| Robot | ur5e_hand_e (brazo UR5e) |
| Cámaras | `top`, `wrist` (más la entrada `empty_camera_0`) |
| Observaciones | estado (10,) + 3 imágenes (3, 480, 640) |
| Acción de salida | vector (10,) |
| Dataset de entrenamiento | felsager/vla_cubes_cross: 1.000 episodios, 341.240 frames a 30 FPS |
| Configuración de entrenamiento | 80.000 pasos, batch 64, AdamW, lr 0,001, seed 0, LeRobot 0.6.2 |
| Tamaño del repositorio | 19,9 GB |

## Arquitectura y entrenamiento

SmolVLA combina un VLM compacto (basado en SmolVLM2) que codifica las imágenes de cámara y la instrucción de lenguaje con un experto de acciones más pequeño que genera chunks de acciones mediante flow matching. Entre las innovaciones descritas en el paper figuran la atención intercalada entre el VLM y el experto, las conexiones skip desde capas tempranas del VLM hacia el experto y un esquema de inferencia asíncrona que desacopla la inferencia del bucle de control en tiempo real. El modelo base se preentrenó a gran escala con datos robóticos (incluido AgiBot World, según el paper) y se publica como `lerobot/smolvla_base`.

Este repositorio es un ajuste fino de ese modelo base sobre `felsager/vla_cubes_cross`: 1.000 episodios y 341.240 frames (unas 3,2 horas de demostraciones) grabados a 30 FPS en un robot `ur5e_hand_e` con cámaras `top` y `wrist` a 480×640. La configuración pública indica 80.000 pasos con batch 64 (equivalente a unas 15 pasadas sobre el dataset), optimizador AdamW, learning rate 0,001 y seed 0, usando LeRobot 0.6.2. El nombre del repositorio sugiere un entrenamiento con todos los pesos descongelados y algún tipo de enmascarado de entradas ("full_unfrozen_masked"), aunque el autor no documenta estos detalles. La política recibe un estado propioceptivo de 10 dimensiones y tres imágenes (top, wrist y empty_camera_0), y emite acciones de 10 dimensiones.

## Capacidades

- Control de robot visión-lenguaje-acción: genera chunks de acciones de 10 dimensiones para un brazo UR5e a 30 FPS.
- Condicionamiento por lenguaje natural: selecciona el objeto a manipular según el color indicado en la instrucción (cuatro tareas entrenadas: azul, amarillo, verde y rojo hacia la cruz roja).
- Percepción multicámara: procesa una vista cenital y otra de muñeca (480×640) más una tercera entrada de cámara.
- Integración de propriocepción: consume el vector de estado del robot de 10 dimensiones.
- Multitarea dentro del dominio entrenado: cambia de tarea modificando la instrucción, sin reentrenar.
- Despliegue ligero: hereda del modelo base la capacidad de funcionar en hardware de consumo y de usar inferencia asíncrona.
- No aplica: generación de texto libre, tool calling ni agentes multi-step; no es un chatbot ni un LLM, sino una política de control robótico.

## Casos de uso

- Automatización de pick-and-place en laboratorio: el modelo está entrenado exactamente para coger cubos de colores y depositarlos en una cruz roja, con 1.000 episodios de demostraciones; es adecuado para células de manipulación repetitiva con ese montaje concreto.
- Punto de partida para nuevos afinados: en lugar de entrenar desde cero, se puede partir de este checkpoint (o del base) con `lerobot-train` para adaptarlo a nuevos objetos o destinos, ahorrando cómputo y datos.
- Banco de pruebas reproducible de políticas VLA: el README documenta el comando `lerobot-rollout` completo (robot, cámaras OpenCV a 640×480 y 30 FPS, tarea y duración), lo que facilita comparar políticas sobre el mismo hardware.
- Docencia en imitación learning: la configuración de entrenamiento es pública (80.000 pasos, batch 64, lr 0,001, seed 0) y el dataset es visualizable en el Space de LeRobot, ideal para enseñar el ciclo completo datos-entrenamiento-despliegue.
- Clasificación ligera por color: en un entorno de baja exigencia (piezas cúbicas de colores hacia un punto fijo de destino), el modelo puede integrarse como política de manipulación con supervisión humana.
- Investigación en robustez y generalización: permite estudiar cómo responde la política ante cambios de posición de objetos, iluminación o distractores, un experimento que el propio README sugiere documentar.
- Diseño de pipelines de captura de datos: la relación 1.000 episodios / 341.240 frames a 30 FPS sirve como referencia empírica del volumen de datos necesario para una tarea de manipulación con VLA compactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor indica explícitamente que aún no hay evaluaciones ("No evaluation results have been provided for this policy yet"), por lo que la tasa de éxito real en las cuatro tareas es desconocida. El paper de SmolVLA sí reporta resultados competitivos del modelo base frente a VLAs mayores con un coste computacional reducido, pero no incluye números para este ajuste fino concreto. Se recomienda ejecutar ensayos con `lerobot-rollout` (por ejemplo, 10 intentos por tarea) y registrar la tasa de éxito antes de cualquier uso serio.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan ≈1,8 GB en fp32 (450 M × 4 bytes); con activaciones y buffers, una estimación razonable es de 2-4 GB de VRAM. No hay versiones cuantizadas publicadas.
- GPU recomendadas: cualquier GPU de consumo moderna (por ejemplo, RTX 3060 de 12 GB o superior) debería bastar para inferencia, según el diseño de SmolVLA; no se necesitan A100 ni H100.
- Consumer GPU: sí, la posibilidad de desplegar en hardware de consumo es uno de los puntos clave del modelo base según el paper.
- Entrenamiento: la GPU usada por el autor no está disponible; para afinados similares, una GPU de 24 GB (RTX 3090/4090) es una referencia habitual en la comunidad LeRobot.
- Despliegue: vía LeRobot (`lerobot-rollout` con `--policy.path=felsager/smolvla_ee_cube2cross_full_unfrozen_masked`). vLLM, TGI, llama.cpp u Ollama no aplican: no es un LLM.
- Latencia y throughput: no disponibles; el paper propone inferencia asíncrona (cliente-servidor) precisamente para mantener el bucle de control en tiempo real.
- Nota sobre el repositorio: pesa 19,9 GB, más de lo que ocupan los pesos solos, lo que sugiere que incluye checkpoints adicionales del entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| felsager/smolvla_ee_cube2cross_full_unfrozen_masked | 450 M | VLA afinado (UR5e, cubos a cruz) | Apache-2.0 | HF, safetensors |
| lerobot/smolvla_base | 450 M | VLA base preentrenado | Apache-2.0 | HF, safetensors |
| lerobot/pi0 | ≈3.300 M | VLA con flow matching (π0 de Physical Intelligence) | Apache-2.0 | HF, pesos abiertos |
| openvla/openvla-7b | 7.000 M | VLA basado en Llama 2 | MIT | HF, safetensors |

Notas: no hay comparativas de rendimiento publicadas para este ajuste fino; el paper de SmolVLA afirma resultados competitivos frente a VLAs mayores con una fracción del coste. Existen variantes hermanas del mismo autor (`felsager/smolvla_ee_cube2cross_unfrozen_masked` y `felsager/smolvla_ee_pick_cube_masked_state_cube2cross`), pero las diferencias entre ellas no están documentadas.

## Limitaciones y advertencias

- Sobreajuste al setup de entrenamiento: robot UR5e concreto, cámaras `top`/`wrist` a 480×640 y cuatro tareas muy específicas (cubos de color hacia una cruz roja). Cambios de iluminación, posiciones de objetos, objetos nuevos o distractores pueden degradar el rendimiento sin garantías.
- Sin evaluación publicada: la tasa de éxito es desconocida; hay que validar con ensayos reales antes de cualquier uso.
- Instrucciones en inglés: no hay datos de soporte multilingüe ni de otras formulaciones de tarea.
- Las claves de observación deben coincidir exactamente con las del entrenamiento (incluida `empty_camera_0`), o el rollout fallará.
- Riesgo propio de las políticas robóticas: no "alucina" texto, pero puede ejecutar acciones incorrectas ante cambios de distribución; requiere supervisión humana, parada de emergencia y aislamiento del área de trabajo.
- Licencia Apache-2.0: permite uso comercial y modificación sin restricciones relevantes, pero sin garantía alguna; el README pide citar el paper de SmolVLA y LeRobot.
- Reproducibilidad ligada a LeRobot 0.6.2 y a una única seed (0), sin ablations ni curvas de entrenamiento publicadas.
- Repositorio muy reciente, sin descargas ni likes registrados: carece de validación comunitaria.

## Enlaces

- Modelo: https://huggingface.co/felsager/smolvla_ee_cube2cross_full_unfrozen_masked
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- PDF del paper: https://arxiv.org/pdf/2506.01844v1
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Variantes del mismo autor: https://huggingface.co/felsager/smolvla_ee_cube2cross_unfrozen_masked y https://huggingface.co/felsager/smolvla_ee_pick_cube_masked_state_cube2cross
