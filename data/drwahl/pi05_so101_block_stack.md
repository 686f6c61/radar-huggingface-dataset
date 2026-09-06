# drwahl/pi05_so101_block_stack

## Resumen

El modelo `pi05_so101_block_stack` es un adaptador LoRA sobre el modelo VLA (Vision-Language-Action) `pi0.5`, desarrollado por `drwahl` para la tarea de apilar bloques de 30 mm con un brazo robótico SO-101 (SO-ARM100). Se trata de un fine-tuning específico que funciona tanto en simulación como en el brazo físico, y que se ha entrenado con un dataset propio de demostraciones de apilado. La relevancia de este modelo radica en que demuestra cómo adaptar un modelo VLA de gran tamaño a una tarea robótica concreta mediante LoRA, congelando la mayor parte de los pesos y actualizando solo el backbone de lenguaje. Esto reduce el coste computacional del entrenamiento y facilita el despliegue en robots de bajo coste como el SO-101.

La arquitectura subyacente es la de `pi0.5`, que combina un backbone de lenguaje Gemma 2B, un action expert y proyecciones densas, junto a un codificador visual SigLIP. El adaptador LoRA se aplica únicamente al backbone de lenguaje, mientras que el resto de componentes permanecen congelados. El repositorio contiene el adaptador, los procesadores de normalización y un script para fusionar el adaptador con los pesos base, además de utilidades para evaluar la política en simulación y en el brazo real. El tamaño del repositorio es de 1,3 GB, correspondiente al adaptador y los procesadores, no a los pesos completos del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en pi0.5 con backbone de lenguaje Gemma 2B, action expert y codificador visual SigLIP. LoRA sobre el backbone de lenguaje. |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA y procesadores de normalización), con script de merge para obtener checkpoint completo |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `lerobot/pi05_base` mediante LoRA, aplicado únicamente al backbone de lenguaje Gemma 2B. El action expert, las proyecciones densas y el codificador visual SigLIP se mantienen congelados durante el entrenamiento. El adaptador resultante se guarda en el directorio `adapter/` junto con los procesadores de normalización, y un script `train/merge.py` permite plegar el adaptador sobre los pesos base para obtener un checkpoint que carga sin necesidad del adaptador.

El entrenamiento se realizó con el archivo de configuración `train/pi05_so101_mix_aug.yaml` del repositorio `vla-test`, sobre el dataset `drwahl/so101_block_stack`. Cada frame se somete a aumento de datos con variaciones de brillo, contraste, saturación y tono, en rangos que cubren la diferencia entre un frame renderizado y uno capturado por la cámara del brazo. Esto mejora la robustez del modelo ante el cambio de simulación a realidad. Los chunks de acción se cosen mediante Real-Time Chunking y se leen a través de un interpolador cúbico que preserva la forma antes de ejecutarse.

## Capacidades

- Control robótico de manipulación: el modelo genera secuencias de acción para apilar un bloque de 30 mm sobre otro usando un brazo SO-101.
- Ejecución de políticas de acción a partir de observaciones visuales y un prompt de lenguaje natural.
- Comprensión de instrucciones simples en inglés que nombran dos de los tres colores disponibles (rojo, verde, azul), por ejemplo: "stack the red block on the green block".
- Robustez a variaciones fotométricas gracias al aumento de datos aplicado durante el entrenamiento, que cubre el hueco entre imágenes renderizadas y reales.
- No se han documentado capacidades de generación de texto, razonamiento general, tool calling, soporte de agentes ni visión de propósito general en la información proporcionada.

## Casos de uso

- Automatización de tareas de ensamblaje en laboratorios: el modelo puede apilar piezas pequeñas en una línea de trabajo, lo que resulta útil para tareas de ensamblaje que requieren precisión. Su capacidad de operar tanto en simulación como en el brazo físico permite validar la política antes de desplegarla.
- Investigación en aprendizaje por imitación: sirve como referencia para estudiar cómo un modelo VLA se adapta a una tarea concreta mediante LoRA. Los investigadores pueden comparar el rendimiento en simulación (139 de 150 layouts) con el del brazo físico.
- Educación en robótica: el SO-101 es un brazo asequible, y el modelo puede utilizarse en cursos para demostrar el flujo completo de entrenamiento y despliegue de un modelo de política robótica.
- Transferencia de simulación a realidad (sim-to-real): el aumento de datos fotométrico y la evaluación dual en simulación y hardware lo convierten en un caso de estudio para técnicas de sim-to-real en robots de bajo coste.
- Integración con ROS 2 para control de robots: el modelo puede integrarse en stacks ROS 2 como el de `so101-ros-physical-ai`, donde la política generada por el modelo se usa para comandar el brazo a través de controladores de bajo nivel.
- Desarrollo de habilidades de manipulación fina: apilar bloques de 30 mm exige precisión y control fino, por lo que el modelo es útil para investigar políticas de agarre y colocación en objetos pequeños.
- Benchmark de políticas VLA en brazos de bajo coste: al estar publicado con el adaptador y los scripts de evaluación, permite reproducir los resultados y comparar con otros fine-tunings de pi0.5, como el de RoMALab.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Tasa de éxito en layouts de simulación reservados | 139/150 (92,7 %) promediado sobre tres semillas |
| Rendimiento en el brazo físico | No disponible (no se ha publicado un número; la evaluación depende del criterio del operador) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio contiene un adaptador LoRA de 1,3 GB, pero la inferencia requiere cargar el modelo base `lerobot/pi05_base`, cuyo tamaño no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible, depende del tamaño del modelo base.
- Opciones de despliegue: el modelo se usa con el framework LeRobot. Se proporcionan scripts para evaluar en simulación (`sim/scripts/eval.py`) y en el brazo físico (`hw.rollout`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Base | Licencia | Disponibilidad |
|---|---|---|---|---|
| drwahl/pi05_so101_block_stack | Apilar bloques de 30 mm con SO-101 | lerobot/pi05_base | Apache 2.0 | Hugging Face, adaptador LoRA + script de merge |
| RoMALab/pi05_so101_stacking | Apilar bloques con SO-101 | No disponible | No disponible | Hugging Face |
| lerobot/pi05_base | Modelo base VLA para robótica | - | No disponible | Hugging Face |

Se ha encontrado un modelo similar en Hugging Face (`RoMALab/pi05_so101_stacking`), pero no se dispone de información detallada sobre sus parámetros, rendimiento ni licencia en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para el brazo SO-101 y bloques de 30 mm; no se garantiza que generalice a otros robots, tamaños de objeto ni tareas.
- El rendimiento en el brazo físico no se ha cuantificado de forma objetiva; la evaluación depende de la decisión del operador.
- Los prompts están en inglés y solo nombran dos de los tres colores disponibles; no se ha probado el funcionamiento en otros idiomas.
- La licencia del modelo base `lerobot/pi05_base` no se ha verificado en la información proporcionada, por lo que podría haber restricciones adicionales al uso comercial del modelo fusionado.
- No se han documentado sesgos específicos, pero el modelo podría verse afectado por sesgos en los datos de entrenamiento (por ejemplo, colores o configuraciones de bloque limitadas).
- Al tratarse de un modelo de control robótico, las alucinaciones se manifiestan como acciones incorrectas ante observaciones fuera de la distribución de entrenamiento, lo que puede provocar fallos de manipulación.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/drwahl/pi05_so101_block_stack
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/drwahl/so101_block_stack
- Repositorio de entrenamiento: https://github.com/danwahl/vla-test
- SO-ARM100 (brazo robótico): https://github.com/TheRobotStudio/SO-ARM100
- Real-Time Chunking (paper de Physical Intelligence): https://www.physicalintelligence.company/research/real_time_chunking
- Modelo similar en Hugging Face: https://huggingface.co/RoMALab/pi05_so101_stacking
- Stack ROS 2 para SO-101: https://github.com/legalaspro/so101-ros-physical-ai
