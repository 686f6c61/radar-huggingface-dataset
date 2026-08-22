# Aether258/pi05_bi_two_tubes_0102_step10000

## Resumen

El modelo `Aether258/pi05_bi_two_tubes_0102_step10000` es un checkpoint de un modelo de robótica de manipulación bimanual, basado en la arquitectura `pi05_bi` del proyecto openpi. Desarrollado por Aether258, se ha entrenado para realizar una tarea específica de pick-and-place de dos tubos (azul y verde) con dos brazos robóticos, incorporando información de sensores táctiles. El modelo se ha publicado bajo licencia Apache-2.0 y se integra en el ecosistema LeRobot.

La relevancia de este checkpoint radica en que combina aprendizaje de políticas con retroalimentación táctil, un campo emergente en robótica, y en que se ha evaluado su generalización mediante una división de datos por fuente (val_unseen). El checkpoint corresponde al paso 10000, que presenta la menor pérdida de validación del entrenamiento hasta la fecha, aunque los autores señalan que la mejora es marginal respecto al paso 6000 y que la generalización parece haberse saturado.

El repositorio contiene el estado del modelo (pesos de inferencia, estado del optimizador y estadísticas de normalización) y tiene un tamaño de 9,6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi05_bi (openpi) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo robótico, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (formato LeRobot, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `pi05_bi` de openpi, un sistema de política de manipulación bimanual que combina una torre de visión (que procesa imágenes RGB y táctiles) con un modelo de lenguaje (LLM) y un "action expert" que genera acciones de control. No se dispone de detalles precisos sobre el número de parámetros o la estructura interna, pero el entrenamiento utiliza LoRA con rango 16 en el LLM y rango 32 en el experto de acción, mientras que la torre de visión se ajustó completamente (sin congelar). La salida se genera mediante flow matching.

El entrenamiento se realizó sobre un conjunto de datos fusionado de dos fuentes: `two_tubes_01` (519 episodios, 425 115 frames) y `two_tubes_02` (500 episodios, 377 604 frames), totalizando 1019 episodios y 802 719 frames. Los datos se capturaron a 30 fps con seis flujos de cámara: dos cámaras RGB (`camera0`, `camera1`) y cuatro sensores táctiles (`tactile_left_0/1`, `tactile_right_0/1`). Se utilizó una división de entrenamiento y validación por fuente (10% de episodios retenidos por repositorio, semilla 42). Las estadísticas de normalización se calcularon solo sobre el conjunto de entrenamiento.

El entrenamiento se realizó en dos GPU A100-80GB con FSDP, con un tamaño de lote de 128 y un programador de tasa de aprendizaje con decaimiento coseno (pico 2,5e-5, decaimiento a 2,5e-6 en 30 000 pasos). Este checkpoint corresponde al paso 10000, que representa aproximadamente 1,77 épocas (una época equivale a 5 639 pasos).

## Capacidades

- Ejecución de tareas de pick-and-place bimanual: el modelo es capaz de coordinar dos brazos robóticos para recoger y colocar objetos en un orden específico.
- Seguimiento de instrucciones unificadas: se entrenó con una única instrucción textual que describe la secuencia completa de acciones.
- Procesamiento de entradas táctiles: utiliza cuatro sensores táctiles para ajustar el agarre y la manipulación, lo que permite una mayor precisión.
- Integración con LeRobot: el modelo se distribuye en formato LeRobot, lo que facilita su carga y uso en entornos robóticos compatibles.
- No se documentan capacidades de razonamiento general, tool calling o agentes, ya que es un modelo específico de política robótica.

## Casos de uso

- **Automatización de líneas de ensamblaje**: el modelo puede integrarse en sistemas robóticos para realizar tareas repetitivas de pick-and-place de piezas pequeñas, como tubos o componentes, con control bimanual y retroalimentación táctil para ajustar la fuerza de agarre.
- **Investigación en robótica con sensores táctiles**: sirve como base para estudiar cómo la información táctil influye en la precisión de la manipulación y para comparar diferentes estrategias de entrenamiento.
- **Prototipado de tareas de manipulación dual**: permite probar secuencias de manipulación bimanual con un solo modelo, reduciendo el tiempo de desarrollo en laboratorios de robótica.
- **Entrenamiento de políticas de control en entornos simulados**: aunque el checkpoint está entrenado en datos reales, puede servir como punto de partida para simulación y transferencia a otros entornos.
- **Evaluación de generalización en robótica**: la división `val_unseen` permite estudiar si el modelo generaliza a datos de una fuente no vista durante el entrenamiento, útil para investigar robustez.
- **Despliegue en plataformas robóticas con doble brazo**: es adecuado para robots bimanuales que requieren coordinación entre dos extremidades y que dispongan de sensores táctiles.

## Benchmarks y rendimiento

La model card proporciona la pérdida de flow-matching (menor es mejor) en los conjuntos de entrenamiento, validación seen (val_seen) y validación unseen (val_unseen) para distintos pasos de entrenamiento. No se han publicado otros benchmarks como MMLU o HumanEval, ya que no es un modelo de lenguaje general.

| Paso | train | val_seen | val_unseen | gap |
|---|---|---|---|---|
| 0 | 0,5525 | 0,4968 | 0,5261 | 0,0293 |
| 2000 | 0,0553 | 0,0504 | 0,0608 | 0,0104 |
| 4000 | 0,0490 | 0,0467 | 0,0576 | 0,0109 |
| 6000 | 0,0460 | 0,0437 | 0,0543 | 0,0105 |
| 8000 | 0,0441 | 0,0423 | 0,0550 | 0,0127 |
| **10000** | 0,0435 | 0,0416 | **0,0542** | 0,0126 |

El autor señala que la pérdida en `val_unseen` se ha estabilizado desde el paso 6000 (valores de 0,0543, 0,0550, 0,0542), lo que sugiere que la capacidad de generalización se ha saturado y que los pasos posteriores solo mejoran el ajuste a los datos de entrenamiento.

## Requisitos de hardware

- **Entrenamiento**: se utilizaron dos GPU A100-80GB con FSDP (batch de 128). No se especifica el tiempo de entrenamiento.
- **Inferencia**: no se dispone de datos sobre los requisitos de VRAM para inferencia. Dado que el modelo se entrena con LoRA y la torre de visión completa, se estima que la inferencia podría ejecutarse en una GPU con al menos 24 GB de VRAM, pero esto es una especulación sin confirmación. Se recomienda probar con una GPU moderna (RTX 4090, A6000, etc.) y monitorizar el consumo.
- **Despliegue**: al ser un modelo de LeRobot, puede integrarse en pipelines de robótica que usen esa librería. No se mencionan soportes para vLLM, Ollama u otros motores de inferencia de modelos de lenguaje.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (robótica bimanual con táctil). No se pueden establecer comparativas fiables sin datos adicionales.

## Limitaciones y advertencias

- **Especialización limitada**: el modelo está entrenado exclusivamente para la tarea de pick-and-place de dos tubos con instrucciones fijas. No es un modelo general de manipulación ni de razonamiento.
- **Saturación de generalización**: el autor indica que la pérdida en `val_unseen` no mejora desde el paso 6000, lo que sugiere que el modelo no aprende a generalizar más allá de los datos de entrenamiento.
- **Dependencia de la instrucción**: la instrucción unificada se fijó en el momento de la fusión de los datos; si se cambia la instrucción, el modelo puede no comportarse correctamente.
- **Sensores táctiles**: el modelo depende de las cuatro entradas táctiles; si el robot no dispone de esos sensores o están mal calibrados, el rendimiento puede degradarse.
- **Licencia Apache-2.0**: permite uso comercial, pero se recomienda revisar los términos de la licencia y las condiciones de uso de los datos originales (dos repos de HuggingFace).
- **Validación limitada**: la validación se realiza sobre solo 20 lotes (unos 2 560 frames), por lo que las variaciones pequeñas en la pérdida pueden ser ruido.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step10000)
- [Perfil del autor en Hugging Face](https://huggingface.co/Aether258)

No se han encontrado otros enlaces (papers, blogs, demos) en la búsqueda web.</think>## Resumen

El modelo `Aether258/pi05_bi_two_tubes_0102_step10000` es un checkpoint de un modelo de robótica de manipulación bimanual, desarrollado por Aether258 y basado en la arquitectura `pi05_bi` de openpi. Está entrenado para ejecutar una tarea específica de pick-and-place de dos tubos (azul y verde) con dos brazos robóticos, incorporando información de sensores táctiles. Se distribuye bajo licencia Apache-2.0 y se integra en el ecosistema LeRobot, lo que facilita su uso en plataformas robóticas compatibles.

La relevancia de este checkpoint reside en que combina visión con retroalimentación táctil para control bimanual, un área emergente en robótica. El paso 10000 presenta la menor pérdida de validación de todo el entrenamiento hasta el momento, aunque el propio autor indica que la mejora respecto al paso 6000 es marginal (0,0001) y que la generalización parece haberse saturado. El repositorio contiene los pesos de inferencia, el estado de entrenamiento y las estadísticas de normalización, con un tamaño total de 9,6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi05_bi (openpi) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de política robótica, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (checkpoint de LeRobot, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `pi05_bi` de openpi, que combina una torre de visión (procesa imágenes RGB y táctiles) con un modelo de lenguaje (LLM) y un "experto de acción" que genera los comandos de control. El entrenamiento utiliza flow matching como objetivo. La torre de visión se ajustó completamente, mientras que el LLM y el experto de acción usaron LoRA con rangos 16 y 32, respectivamente.

Los datos de entrenamiento provienen de dos repositorios: `KaiyueChen/two_tubes_01` (519 episodios, 425 115 frames) y `KaiyueChen/two_tubes_02` (500 episodios, 377 604 frames), fusionados en un total de 1 019 episodios y 802 719 frames. Las imágenes se almacenan en ficheros parquet y se capturan a 30 fps con seis flujos: dos cámaras RGB y cuatro sensores táctiles. La división de datos se realizó por fuente (10% de episodios retenidos por repositorio, semilla 42), y las estadísticas de normalización se calcularon solo sobre el conjunto de entrenamiento.

El entrenamiento se ejecutó en dos GPUs A100-80GB con FSDP, un batch de 128 y un programa de aprendizaje con degradación coseno (pico de 2,5e-5, degradación a 2,5e-6 en 30 000 pasos). Este checkpoint corresponde al paso 10 000, que equivale a 1,77 épocas (una época son 5 639 pasos).

## Capacidades

- Ejecución de tareas de pick-and-place bimanual: coordina dos brazos para recoger y colocar dos objetos en un orden específico.
- Seguimiento de instrucciones textuales: se entrenó con una única instrucción unificada que describe toda la secuencia de acciones.
- Procesamiento de entradas táctiles: utiliza cuatro sensores táctiles para ajustar el agarre y la manipulación con precisión.
- Compatibilidad con LeRobot: se integra en el flujo de trabajo de LeRobot, lo que facilita su uso en entornos robóticos.
- No incluye capacidades de razonamiento general, tool calling ni generación de texto libre.

## Casos de uso

- Automatización de líneas de ensamblaje: el modelo puede gestionar la recogida y colocación de piezas pequeñas, como tubos, en procesos industriales repetitivos, con control fino gracias a la retroalimentación táctil.
- Investigación en robótica con sensores táctiles: sirve como base para estudiar cómo la sensación táctil mejora la precisión de la manipulación y para comparar estrategias de entrenamiento.
- Prototipado de tareas de manipulación bimanual: permite implementar secuencias complejas de pick-and-place en robots de doble brazo sin necesidad de programación manual.
- Evaluación de generalización en robótica: la división `val_unseen` permite analizar si el modelo se comporta correctamente con datos de una fuente no vista durante el entrenamiento, útil para validar robustez.
- Entrenamiento de políticas de control en simulación: aunque el checkpoint es real, puede servir como punto de partida para transferencia a otros entornos o para simulaciones.
- Automatización de procesos de clasificación y empaquetado: en entornos donde se manipulan dos objetos diferentes con dos manos, el modelo puede coordinar la secuencia de forma autónoma.

## Benchmarks y rendimiento

La model card proporciona la pérdida de flow-matching (menor es mejor) para los conjuntos de entrenamiento, validación seen y validación unseen en diferentes pasos. No se han publicado otros benchmarks como MMLU o HumanEval, ya que no es un modelo de lenguaje general.

| Paso | train | val_seen | val_unseen | Gap |
|---|---|---|---|---|
| 0 | 0,5525 | 0,4968 | 0,5261 | 0,0293 |
| 2000 | 0,0553 | 0,0504 | 0,0608 | 0,0104 |
| 4000 | 0,0490 | 0,0467 | 0,0576 | 0,0109 |
| 6000 | 0,0460 | 0,0437 | 0,0543 | 0,0105 |
| 8000 | 0,0441 | 0,0423 | 0,0550 | 0,0127 |
| **10000** | 0,0435 | 0,0416 | **0,0542** | 0,0126 |

El autor señala que la pérdida en `val_unseen` se ha estabilizado desde el paso 6000 (valores de 0,0543, 0,0550 y 0,0542), lo que indica que la capacidad de generalización se ha saturado. La mejora en `val_seen` sigue descendiendo, pero el gap entre `val_seen` y `val_unseen` se amplía, sugiriendo sobreajuste a los datos de entrenamiento.

## Requisitos de hardware

- **Entrenamiento**: se utilizaron dos GPU A100-80GB con FSDP y batch size 128. No se especifica la duración del entrenamiento.
- **Inferencia**: no se dispone de datos concretos sobre VRAM requerida. Dado que el modelo no es de gran tamaño (el checkpoint ocupa 9,6 GB), podría inferirse en una GPU con al menos 16-24 GB de VRAM, pero no se ha confirmado. Se recomienda probar con una GPU moderna (RTX 4090, A6000, etc.) y monitorizar el consumo.
- **Despliegue**: se integra en LeRobot, por lo que puede ejecutarse en sistemas que soporten esa librería. No se mencionan otros motores de inferencia como vLLM u Ollama.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (robótica bimanual con sensores táctiles) en la información proporcionada. No se puede establecer una comparativa sin datos adicionales.

## Limitaciones y advertencias

- **Especificidad de la tarea**: el modelo está entrenado exclusivamente para la tarea de pick-and-place de dos tubos con una instrucción fija. No es generalizable a otras tareas sin reentrenamiento.
- **Saturación de generalización**: la pérdida en `val_unseen` no mejora desde el paso 6000, lo que sugiere que el modelo ha alcanzado su límite de generalización con los datos disponibles.
- **Dependencia de la instrucción**: la instrucción unificada se fijó en el momento de fusionar los datos; si se cambia la instrucción, el modelo puede no comportarse correctamente.
- **Sensibilidad a los sensores táctiles**: el modelo depende de las cuatro entradas táctiles; si el robot no está equipado con esos sensores o no están bien calibrados, el rendimiento puede degradarse.
- **Licencia**: aunque la licencia Apache-2.0 permite uso comercial, se deben revisar los términos de los datos originales (`KaiyueY/two_tubes_01` y `two_tubes_02`) para asegurar el cumplimiento.
- **Validación limitada**: la validación se realiza sobre solo 20 lotes (~2 560 frames), por lo que las variaciones de pérdida inferiores a ±0,001 pueden ser ruido.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step10000)
- [Perfil del usuario en Hugging Face](https://huggingface.co/Aether258)

No se han encontrado otros enlaces (papers, blogs, demos) en la búsqueda web.
