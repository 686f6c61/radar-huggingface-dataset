# polrolnik2/pi05_roarm_m3_candy_pick_place

## Resumen

`polrolnik2/pi05_roarm_m3_candy_pick_place` es un modelo de visión-lenguaje-acción (VLA) desarrollado por polrolnik2, obtenido mediante fine-tuning del modelo base `lerobot/smolvla_base` con el framework LeRobot 0.6.2. El modelo está especializado en la tarea de recogida y colocación de caramelos (candy pick and place) con el brazo robótico RoArm-M3 de Waveshare, un manipulador de 5+1 grados de libertad basado en ESP32.

El modelo integra percepción visual (dos cámaras: frontal y de muñeca), comprensión de instrucciones en lenguaje natural y generación de acciones motoras en un único pipeline. Con aproximadamente 4.140 millones de parámetros, se posiciona en la gama media de los modelos VLA, ofreciendo un equilibrio entre capacidad de razonamiento y requisitos de hardware accesibles. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su naturaleza de fine-tuning sobre un dataset específico de robótica, lo que demuestra el flujo de trabajo de adaptación de modelos VLA generalistas a tareas de manipulación concretas con hardware de bajo coste, un patrón cada vez más habitual en la comunidad de robótica open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basada en SmolVLM) |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual, un modelo de lenguaje y una cabeza de acción. El modelo base `lerobot/smolvla_base` fue fine-tuneado sobre el dataset `rtrtwrw/roarm_m3_candy_pick_place`, que contiene demostraciones humanas de tareas de recogida y colocación de caramelos con el brazo RoArm-M3. El entrenamiento se realizó con 30.000 pasos, batch size de 4, precisión bf16 y semilla 1000, guardando el checkpoint `last`.

Un aspecto técnico relevante es el mapeo de claves de cámara: el dataset nombra sus cámaras como `front` y `wrist`, mientras que SmolVLA espera `camera1` y `camera2`. El entrenamiento utilizó un mapa de renombrado que debe replicarse en inferencia: `observation.images.front` se mapea a `observation.images.base_0_rgb` y `observation.images.wrist` a `observation.images.left_wrist_0_rgb`. No se dispone de información sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Control de brazo robótico: genera acciones de articulación para el RoArm-M3 a partir de observaciones visuales y comandos de lenguaje.
- Percepción visual multi-cámara: procesa simultáneamente imágenes de cámara frontal y de muñeca para guiar la manipulación.
- Tarea de pick and place: especializado en recoger objetos (caramelos) y colocarlos en posiciones objetivo.
- Integración con LeRobot: compatible con la API de políticas de LeRobot (`SmolVLAPolicy.from_pretrained`), lo que facilita su despliegue en pipelines existentes.
- Fine-tuning específico de dominio: adaptado a un dataset concreto de robótica, lo que mejora el rendimiento en esa tarea frente al modelo base generalista.
- Capacidades de visión-lenguaje-acción: combina comprensión de instrucciones textuales con razonamiento visual para producir acciones motoras.

## Casos de uso

- Automatización de líneas de picking en entornos de laboratorio: el modelo puede controlar un brazo RoArm-M3 para clasificar pequeños objetos (caramelos) en contenedores, sustituyendo la programación manual de trayectorias por instrucciones en lenguaje natural.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas VLA entre distintos brazos robóticos o para experimentar con nuevos datasets de demostración.
- Prototipado rápido de celdas robóticas: al integrarse con LeRobot, permite montar un sistema de manipulación funcional en horas, sin necesidad de escribir controladores de bajo nivel.
- Educación en robótica y VLA: el RoArm-M3 es un hardware de bajo coste y el modelo está publicado con licencia abierta, lo que lo hace adecuado para cursos universitarios de robótica y aprendizaje automático.
- Benchmarking de modelos VLA en hardware real: permite comparar el rendimiento de SmolVLA fine-tuneado frente al modelo base o frente a otras arquitecturas en una tarea física estandarizada.
- Desarrollo de asistentes robóticos domésticos: la tarea de pick and place de objetos pequeños es un bloque funcional reutilizable en aplicaciones de robótica asistencial o de automatización del hogar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de evaluación como tasa de éxito en la tarea, precisión de agarre o tiempo de ejecución. Se recomienda a los usuarios realizar su propia evaluación sobre el dataset `rtrtwrw/roarm_m3_candy_pick_place` o en el hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B parámetros en bf16, el peso del modelo ocupa aproximadamente 8,3 GB. Se recomienda un mínimo de 12 GB de VRAM para inferencia con margen para las activaciones y las imágenes de entrada.
- GPU recomendadas: RTX 4070 Ti / 4080 / 4090 (16-24 GB), o GPUs de datacenter como A10G, L4 o A100. En cuantización de 8 bits podría ejecutarse en GPUs con 8-10 GB de VRAM, aunque no se han publicado pesos cuantizados.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 con 24 GB puede ejecutar el modelo en bf16 sin problemas. GPUs con 12 GB (RTX 4070, RTX 3060) podrían funcionar con cuantización o con batch size reducido.
- Opciones de despliegue: LeRobot (vía `SmolVLAPolicy.from_pretrained`), que es el framework oficial de inferencia. No se ha confirmado compatibilidad con vLLM, llama.cpp u Ollama, dado que es un modelo de robótica con una interfaz de acciones específica.
- Latencia y throughput: no disponible. La latencia dependerá del hardware, del tamaño de las imágenes de entrada y de la frecuencia de control requerida por el brazo robótico.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Framework | Licencia |
|---|---|---|---|---|
| `polrolnik2/pi05_roarm_m3_candy_pick_place` | 4,14 B | Pick and place (RoArm-M3) | LeRobot | Apache 2.0 |
| `lerobot/smolvla_base` | no disponible | VLA generalista | LeRobot | Apache 2.0 |
| `makermods/pi05_metal_pick_place_lora` | no disponible | Pick and place de metal (LoRA) | LeRobot | no disponible |

La comparativa directa con otros modelos VLA de la misma categoría no está disponible en la información proporcionada. El modelo base `lerobot/smolvla_base` es el punto de referencia natural para medir la mejora aportada por el fine-tuning. Existen otros fine-tunes de SmolVLA para tareas de pick and place (como el de makermods), pero no se dispone de datos de rendimiento comparativos.

## Limitaciones y advertencias

- Especialización limitada: el modelo está fine-tuneado exclusivamente para la tarea de candy pick and place con el RoArm-M3. Su rendimiento en otras tareas o con otros brazos robóticos no está garantizado.
- Dependencia del mapeo de cámaras: es imprescindible replicar el mapeo de claves de cámara (`front` → `base_0_rgb`, `wrist` → `left_wrist_0_rgb`) en inferencia; un error en este paso produce fallos de ejecución.
- Sin métricas de evaluación publicadas: no hay datos de tasa de éxito ni de robustez ante variaciones de iluminación, posición de objetos o ruido visual.
- Riesgo de sobreajuste al dataset: con 30.000 pasos sobre un dataset específico, existe riesgo de que el modelo memorice las demostraciones en lugar de generalizar a configuraciones nuevas.
- Sin soporte multilingüe documentado: no se especifican los idiomas soportados para las instrucciones en lenguaje natural.
- Sin cuantizaciones publicadas: los pesos solo están disponibles en bf16, lo que limita el despliegue en hardware con poca VRAM.
- Modelo sin mantenimiento activo: creado en agosto de 2026, con cero descargas y cero likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/polrolnik2/pi05_roarm_m3_candy_pick_place
- Dataset de entrenamiento: https://huggingface.co/datasets/rtrtwrw/roarm_m3_candy_pick_place
- Wiki del RoArm-M3 (Waveshare): https://www.waveshare.com/wiki/RoArm-M3
- Página del producto RoArm-M3: https://www.waveshare.com/roarm-m3.htm
- Repositorio GitHub de RoArm-M3: https://github.com/EffectsMachine/roarm-m3
- Perfil del autor en HuggingFace: https://huggingface.co/polrolnik2/datasets
- Modelo comparativo (makermods): https://huggingface.co/makermods/pi05_metal_pick_place_lora
