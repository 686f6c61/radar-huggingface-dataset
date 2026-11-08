# arunos728/gr00t-n16-rby1-assemble-tissue

## Resumen

`arunos728/gr00t-n16-rby1-assemble-tissue` es un ajuste fino del modelo fundacional vision-language-action (VLA) `nvidia/GR00T-N1.6-3B`, publicado por el usuario arunos728 en Hugging Face. El modelo está especializado en una única tarea de manipulación bimanual sobre el robot móvil RB-Y1 de Rainbow Robotics: colocar un rollo de papel sobre su soporte. Se trata, por tanto, de una política robótica concreta y no de un modelo de propósito general.

El modelo parte de la arquitectura GR00T N1.6 de NVIDIA, un transformer multimodal de 3.286.608.832 parámetros que combina percepción visual (dos cámaras ego `ego_left` y `ego_right`), instrucción en lenguaje natural y estado propioceptivo del robot para generar acciones motoras. La salida es un vector de 54 dimensiones que codifica posiciones articulares absolutas de dos brazos de 7 grados de libertad y dos manos de 20 grados de libertad, con un horizonte de acción de 30 pasos (1 segundo a 30 fps).

Su relevancia es doble: por un lado, demuestra el flujo de trabajo de ajuste fino de un VLA fundacional sobre un embodiment nuevo (`NEW_EMBODIMENT`) con solo 50 episodios y 35.613 frames; por otro, sirve como referencia técnica de cómo adaptar un modelo de NVIDIA a un robot comercial concreto mediante LeRobot v2.1 y la librería `gr00t`. No obstante, sus capacidades quedan estrictamente limitadas a la tarea y configuración descritas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en NVIDIA GR00T N1.6; transformer multimodal con codificadores de visión, lenguaje y estado, y cabeza de acciones |
| Parametros totales | 3.286.608.832 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (la instrucción de entrenamiento está en inglés, pero no se documenta cobertura multilingüe) |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | safetensors (2 shards: `model-00001-of-00002.safetensors`, `model-00002-of-00002.safetensors`) |
| Modelo base | `nvidia/GR00T-N1.6-3B` (commit `d0814e7ecb19202e7c8468b46098b0b7ef3a6d61`) |
| Embodiment | `NEW_EMBODIMENT`; robot RB-Y1 `rby1m_wujihand2` |
| Dimension state/action | 54-D cada uno (posiciones articulares absolutas en radianes) |
| Horizonte de accion | 30 pasos (1,0 s a 30 fps) |
| Camaras | `ego_left`, `ego_right` |
| Tamano del repo | 35,9 GB |
| Libreria | `gr00t` |
| Pipeline | `robotics` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura VLA de GR00T N1.6, que procesa conjuntamente imágenes de dos cámaras ego, una instrucción en lenguaje natural y el estado propioceptivo del robot para producir comandos de acción. El ajuste fino se realizó sobre el checkpoint base de NVIDIA con el tag de embodiment `NEW_EMBODIMENT`, adaptando la cabeza de acciones y las estadísticas de normalización al esquema de 54 dimensiones del RB-Y1.

Los datos de entrenamiento consisten en 50 episodios de teleoperación bimanual (35.613 frames, 100 vídeos de dos cámaras a 30 fps) en formato LeRobot v2.1, todos con la misma instrucción: "Put the tissue roll onto the holder." La grabación original es de 66 dimensiones; se descartaron las dimensiones de base móvil, torso y cabeza porque su rango total en el corpus es inferior a 1e-3 rad, mientras que la dimensión retenida más estrecha se mueve dos órdenes de magnitud más. El entrenamiento se ejecutó en 2 × NVIDIA H100 80 GB, con batch global de 64, 30.000 pasos, precisión bf16 y aproximadamente 4 horas de reloj. La pérdida final de entrenamiento fue de 0,0034 (media de los últimos 10 registros: 0,00299). No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; se trata de aprendizaje supervisado sobre demostraciones.

## Capacidades

- Generación de acciones de manipulación bimanual: produce comandos de posición absoluta para dos brazos de 7 DoF y dos manos de 20 DoF a partir de observaciones visuales y estado.
- Percepción visual dual: consume simultáneamente las vistas `ego_left` y `ego_right`.
- Condicionamiento por lenguaje: acepta una instrucción textual (`annotation.human.task_description`) que en este checkpoint está fijada a la tarea de ensamblaje del rollo de papel.
- Control a 30 fps con horizonte de predicción de 30 pasos (1 segundo).
- Integración con LeRobot v2.1 y la librería `gr00t` mediante `Gr00tPolicy`.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible; la visión está limitada a las dos cámaras ego del robot.

## Casos de uso

- Automatización de una celda de ensamblaje con RB-Y1: el modelo ejecuta la secuencia completa de colocar el rollo de papel sobre el soporte a partir de las dos cámaras ego y el estado articular, adecuado para demostrar un pipeline de manipulación bimanual de extremo a extremo.
- Referencia para ajuste fino de VLAs en robótica: sirve como plantilla reproducible (50 episodios, 35.613 frames, 4 horas en 2 × H100) para equipos que quieran adaptar GR00T N1.6 a un robot propio con el tag `NEW_EMBODIMENT`.
- Evaluación de esquemas de embodiment reducido: el recorte de 66-D a 54-D eliminando base, torso y cabeza es un ejemplo práctico de cómo simplificar el espacio de acciones cuando esas articulaciones no intervienen en la tarea.
- Benchmark interno de políticas VLA: al estar entrenado sobre una única instrucción, permite medir la capacidad de un modelo de 3B parámetros para sobreajustar y ejecutar con precisión una tarea concreta (pérdida final de 0,0034).
- Docencia y divulgación en robótica: útil para mostrar el ciclo completo teleoperación → dataset LeRobot → ajuste fino → despliegue con `Gr00tPolicy`.
- Pruebas de integración con Rainbow Robotics RB-Y1: combinable con el repositorio `RainbowRobotics/rby1-gr00t` para validar la cadena de control del robot con una política entrenada específicamente para él.
- Despliegue en laboratorio con 2 × H100 o GPUs de capacidad similar: el tamaño de 3,29B parámetros y el repo de 35,9 GB permiten inferencia en una sola GPU de 80 GB, aunque no se documentan requisitos mínimos oficiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de entrenamiento (0,0034 final; 0,00299 de media en los últimos 10 registros) y advierte explícitamente de que no se incluyen números de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 3,29B parámetros en bf16 requiere aproximadamente 6,6 GB solo para pesos; el repo ocupa 35,9 GB e incluye estadísticas y configuración adicionales.
- GPU de entrenamiento documentadas: 2 × NVIDIA H100 80 GB (bf16, batch global 64, 30.000 pasos, ~4 h).
- GPU recomendadas para inferencia: H100, A100 80 GB o cualquier GPU con al menos ~16-24 GB de VRAM para bf16, aunque no se confirma oficialmente.
- ¿Cabe en GPU consumer? Probablemente sí en RTX 4090 (24 GB) o RTX 3090 (24 GB) para los pesos en bf16, pero no hay confirmación del autor ni requisitos publicados.
- Opciones de despliegue: librería `gr00t` mediante `Gr00tPolicy` (documentado en la model card). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un VLA de robótica.
- Latencia y throughput: no disponibles. El horizonte de acción es de 30 pasos a 30 fps (1 segundo por chunk), pero no se reportan tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arunos728/gr00t-n16-rby1-assemble-tissue` | 3,29B | no disponible | Manipulación bimanual RB-Y1, tarea única | NVIDIA Open Model License | Hugging Face (0 descargas, 0 likes) |
| `nvidia/GR00T-N1.6-3B` (modelo base) | 3,29B (aprox., mismo origen) | no disponible | VLA fundacional multi-embodiment | NVIDIA Open Model License | Hugging Face (NVIDIA) |
| GR00T N1.7 (según `RainbowRobotics/rby1-gr00t`) | no disponible | no disponible | VLA open para habilidades humanoides generalizadas | no disponible en la información | GitHub / NVIDIA |
| GR00T N1.5 | no disponible | no disponible | VLA fundacional predecesor | no disponible en la información | NVIDIA Research |

## Limitaciones y advertencias

- Tarea única: entrenado exclusivamente con la instrucción "Put the tissue roll onto the holder."; no generaliza a otros prompts.
- Embodiment único: el esquema de 54-D es específico de `rby1m_wujihand2`; las dimensiones descartadas (base móvil, torso, cabeza) no pueden comandarse con esta política.
- Punto de vista fijo: ambas cámaras están montadas en configuración ego y el modelo nunca ha visto otra colocación.
- Sin evaluación en robot real: la pérdida reportada es de entrenamiento, no de validación ni de despliegue.
- Dataset muy reducido: 50 episodios y 35.613 frames, con riesgo de sobreajuste y escasa robustez ante cambios de iluminación, posición de objetos o variaciones del entorno.
- Sin datos de sesgos, alucinación o cobertura idiomática: no disponibles.
- Restricciones de licencia: NVIDIA Open Model License; conviene revisar sus términos para uso comercial, ya que la model card la marca como `license: other`.
- Checkpoint solo para inferencia: no incluye shards de optimizador de DeepSpeed, estados RNG ni scheduler de LR, por lo que no puede reanudarse el entrenamiento desde este repositorio.
- Requiere `statistics.json` y `experiment_cfg/` en tiempo de inferencia; sin ellos la política no funciona correctamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arunos728/gr00t-n16-rby1-assemble-tissue
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.6-3B
- Página de investigación de GR00T N1.6: https://research.nvidia.com/labs/gear/gr00t-n1_6/
- Integración RBY1 para Isaac GR00T: https://github.com/RainbowRobotics/rby1-gr00t
- Licencia NVIDIA Open Model License: https://huggingface.co/nvidia/GR00T-N1.6-3B
