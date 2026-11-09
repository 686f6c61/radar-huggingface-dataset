# MeituanRobotics/Meituan-Robotics-0-RoboDojo

## Resumen

Meituan Robotics 0 (MR0) es una política vision-language-action (VLA) de doble brazo desarrollada por Meituan Robotics, publicada en Hugging Face bajo el identificador `MeituanRobotics/Meituan-Robotics-0-RoboDojo`. El modelo resuelve el problema del control robótico manipulativo a partir de observaciones visuales y lenguaje natural: recibe RGB e instrucciones y emite comandos de acción articular con anchuras de pinza continuas. Su relevancia radica en combinar un VLM base (configuración Qwen) con una memoria visual congelada (CD-LAM) que aporta tres segundos de historial, lo que permite razonamiento causal sobre secuencias de manipulación.

La arquitectura es un VLA que integra un modelo de lenguaje-visión con un codificador de memoria visual congelado. Predice 50 acciones futuras y ejecuta 16 de ellas, con un esquema de memoria episódica "episode-first RGB". El repositorio pesa 23,3 GB e incluye el checkpoint completo (con pesos del VLM), el encoder CD-LAM congelado, la configuración de inferencia y las estadísticas de normalización estado/acción.

El modelo se distribuye para su uso con el adaptador `Meituan_Robotics_0` de XPolicyLab y el benchmark RoboDojo, orientado a evaluación en simulación y despliegue en entornos de robótica de doble brazo (por ejemplo, configuración `arx_x5`). Está etiquetado únicamente en inglés y su licencia no está especificada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con VLM base (configuración Qwen) y codificador de memoria visual congelado CD-LAM |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (memoria visual de 3 segundos a 25 Hz) |
| Tipos de cuantización | no disponible (pesos en `model.pt`, formato PyTorch) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`, `cdlam/model.pt`, `checkpoints/model.pt`) |
| Pipeline | robotics |
| Tamaño del repositorio | 23,3 GB |
| Horizonte de predicción | 50 acciones predichas, 16 ejecutadas |
| Frecuencia de observación | 25 Hz (para historial causal CD-LAM) |

## Arquitectura y entrenamiento

MR0 es una política VLA de doble brazo que combina un modelo de lenguaje-visión (VLM) con un codificador de memoria visual congelado denominado CD-LAM. El VLM aporta la comprensión conjunta de instrucciones en lenguaje natural e imágenes RGB, mientras que CD-LAM mantiene tres segundos de memoria visual a una frecuencia de observación de 25 Hz, lo que proporciona contexto temporal causal para tareas de manipulación secuencial. El esquema de observación se describe como "episode-first RGB", orientado a capturar la evolución del episodio de manipulación.

El modelo predice un horizonte de 50 acciones y ejecuta las 16 primeras, con anchuras de pinza continuas en lugar de discretas. Los pesos del VLM están incluidos en `checkpoints/model.pt`, por lo que no se requieren pesos base separados ni inicialización de entrenamiento adicional. El repositorio incluye `dataset_statistics.json` para la normalización de estados y acciones, y `config.yaml` para la configuración de inferencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Control robótico de doble brazo a partir de observaciones RGB e instrucciones en lenguaje natural.
- Predicción de secuencias de acciones articulares con horizonte de 50 pasos y ejecución de 16.
- Generación de anchuras de pinza continuas para agarre fino.
- Memoria visual temporal de tres segundos mediante CD-LAM, con razonamiento causal sobre el episodio.
- Comprensión de instrucciones en inglés (único idioma declarado).
- Integración con el benchmark RoboDojo y el framework XPolicyLab para evaluación y despliegue.
- Soporte de configuraciones de entorno como `arx_x5` y tipos de acción `joint`.
- No se documenta soporte de tool calling, function calling ni agentes multi-step en la información disponible.

## Casos de uso

- Manipulación de apilado de objetos en simulación: el modelo se evalúa en tareas como `stack_bowls` dentro de RoboDojo, usando su horizonte de 50 acciones para planificar secuencias de agarre y colocación con doble brazo.
- Investigación en políticas VLA: sirve como referencia reproducible para comparar arquitecturas que combinan VLM con memoria visual congelada, gracias a la inclusión del checkpoint completo y las estadísticas de normalización.
- Desarrollo de sistemas de agarre fino: las anchuras de pinza continuas permiten tareas que requieren control preciso de la fuerza y apertura, adecuadas para objetos de geometría variable.
- Evaluación de memoria temporal en robótica: el historial CD-LAM de tres segundos a 25 Hz permite estudiar cómo la memoria visual mejora tareas de manipulación con estado parcialmente observable.
- Despliegue en configuraciones de doble brazo tipo `arx_x5`: el adaptador de XPolicyLab facilita la integración en pipelines de evaluación en simulación con observaciones a 25 Hz.
- Reproducibilidad de resultados: la inclusión de `SHA256SUMS` y la estructura de ficheros permiten verificar la integridad de los pesos y replicar experimentos del informe técnico.
- Base para ajuste fino en nuevos dominios de manipulación: al incluir los pesos del VLM en el checkpoint, puede servir como punto de partida para adaptar la política a otras tareas o entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio pesa 23,3 GB, lo que sugiere requisitos de memoria en el rango de GPUs de datacenter para cargar el checkpoint completo.
- GPU recomendadas: no disponible explícitamente; se requiere una GPU CUDA según la model card. Por el tamaño del checkpoint, son razonables GPUs con 24 GB o más (RTX 4090, A100, H100), aunque no se confirma.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de 23,3 GB del repositorio sugiere que una GPU de 24 GB podría ser el mínimo práctico, sin garantía.
- Opciones de despliegue: XPolicyLab (adaptador `Meituan_Robotics_0`), con Python 3.11 y CUDA. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluación requiere observaciones a 25 Hz para el historial causal de CD-LAM.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (VLA de doble brazo) con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible verificar los términos antes de cualquier despliegue en producción.
- Idioma limitado al inglés: las instrucciones en otros idiomas no están declaradas como soportadas.
- Orientado a simulación y al benchmark RoboDojo: no hay evidencia de validación en robots físicos en la información disponible.
- Dependencia de XPolicyLab y de la configuración exacta del adaptador; cambios en la versión del framework pueden romper la compatibilidad.
- Requiere observaciones a 25 Hz para el historial causal de CD-LAM; desviaciones en la frecuencia pueden degradar el rendimiento.
- Riesgo de alucinación y errores de planificación inherentes a los VLM, no cuantificado en la información disponible.
- Sesgos: no documentados; al entrenarse presumiblemente con datos de simulación, puede no generalizar a condiciones del mundo real.
- Sin datos de benchmarks publicados, no es posible estimar su rendimiento relativo frente a alternativas.
- El checkpoint completo incluye los pesos del VLM, lo que incrementa el tamaño de descarga y los requisitos de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/MeituanRobotics/Meituan-Robotics-0-RoboDojo
- Informe técnico (arXiv): https://arxiv.org/abs/2611.08577
- Adaptador XPolicyLab: https://github.com/XPolicyLab/XPolicyLab/tree/main/policy/Meituan_Robotics_0
- README del adaptador: https://github.com/XPolicyLab/XPolicyLab/blob/main/policy/Meituan_Robotics_0/README.md
- Repositorio XPolicyLab: https://github.com/XPolicyLab/XPolicyLab
