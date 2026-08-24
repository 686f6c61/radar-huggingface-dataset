# Aether258/pi05_bi_two_tubes_0102_step20000

## Resumen

Este repositorio contiene un checkpoint concreto de un modelo de robótica `pi05_bi` (basado en la arquitectura π₀.5 de Physical Intelligence), afinado para una tarea bimanual de pick-and-place de dos tubos (azul y verde) con entrada táctil y visual. El modelo ha sido entrenado sobre un conjunto de datos de 1.019 episodios que fusiona dos fuentes de datos, con una ventana de contexto temporal de 30 fps y seis flujos de entrada (dos cámaras RGB y cuatro sensores táctiles). El checkpoint en cuestión corresponde al paso 20.000 de entrenamiento y, según el autor, está pasado del óptimo de generalización, por lo que no se recomienda para uso directo. El mejor punto del mismo entrenamiento es el paso 14.000, publicado en otro repositorio.

La relevancia de este modelo radica en que ejemplifica un caso de estudio sobre el sobreajuste en modelos de visión-lenguaje-acción (VLA) con datos limitados. Se observa una degradación clara de la pérdida de validación en datos no vistos a partir del paso 14.000, mientras que la pérdida de entrenamiento sigue mejorando, lo que indica un sobreajuste progresivo. Este checkpoint se publica como referencia para analizar ese comportamiento, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05_bi (VLA basado en flow matching, variante de π₀.5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de acción, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (instrucciones en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (checkpoint de LeRobot, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo es una variante de `pi05_bi` de la familia π₀.5, un modelo de visión-lenguaje-acción (VLA) que genera acciones de control de robots mediante un proceso de flow matching. La arquitectura combina un modelo de lenguaje (LLM) con un "action expert" que produce las acciones. El entrenamiento se realizó con una configuración de LoRA: rango 16 en el LLM y rango 32 en el experto de acciones. La torre de visión se afinó completamente, mientras que el LLM se congeló (el filtro de congelación solo afecta a las capas `.*llm.*`).

Los datos provienen de dos conjuntos de LeRobot v2.1 (`KaiyueChen/two_tubes_01` y `KaiyueChen/two_tubes_02`) con 519 y 500 episodios respectivamente, totalizando 1.019 episodios y 802.719 frames a 30 fps. Cada episodio contiene seis flujos de imagen: dos cámaras RGB y cuatro sensores táctiles (dos en cada mano). La división se hizo de forma que los repositorios de origen se mantienen separados: 10% de cada fuente se reserva para validación (val_seen y val_unseen). Las estadísticas de normalización se calcularon solo sobre el conjunto de entrenamiento.

El entrenamiento se realizó en 2 GPU A100-80GB con FSDP, batch size 128, y un programador de tasa de aprendizaje con decaimiento coseno (pico de 2.5e-5 a 2.5e-6 en 30.000 pasos, con 1.000 pasos de calentamiento). El punto de control paso 20.000 corresponde a aproximadamente 3.55 épocas. La pérdida de entrenamiento se mide con imágenes aumentadas (recorte aleatorio al 95%, rotación ±5°, jitter de color en los seis flujos), mientras que la validación no usa aumento.

## Capacidades

- Manipulación bimanual: control de dos brazos robóticos para ejecutar tareas de pick-and-place coordinadas.
- Percepción multimodal: combina cámaras RGB y sensores táctiles (cuatro flujos táctiles) para guiar las acciones.
- Seguimiento de instrucciones en lenguaje natural: el modelo recibe una instrucción fija en inglés que describe el orden de las acciones.
- Generación de acciones continuas: mediante flow matching, produce comandos de control para los actuadores.
- Específico para la tarea "two_tubes": no se han documentado capacidades fuera de esta tarea concreta.

## Casos de uso

- Investigación de sobreajuste en VLA: este checkpoint es un ejemplo de un modelo que ha sobrepasado el punto de mejor generalización, útil para estudiar la dinámica de validación y el comportamiento del flujo de entrenamiento.
- Evaluación de técnicas de regularización: al ser un checkpoint sobreajustado, se puede usar como base para probar métodos de regularización, early stopping o aumento de datos.
- Benchmark de validación de modelos de manipulación: la curva de pérdida de validación sobre conjuntos no vistos (val_unseen) puede servir como referencia para comparar otros modelos en la misma tarea.
- Desarrollo de algoritmos de aprendizaje continuo: el hecho de que el modelo se entrene en dos fuentes de datos distintas (dos repositorios) permite analizar cómo el modelo generaliza entre dominios.
- Integración en entornos de simulación o robótica real: aunque no se recomienda este checkpoint, el modelo base `pi05_bi` se puede integrar en frameworks como LeRobot u openpi para pruebas de control robótico.
- Estudio de la influencia de la entrada táctil: al entrenar con cuatro flujos táctiles, el modelo permite comparar el rendimiento frente a versiones sin entrada táctil (si existieran) para entender la contribución de estos sensores.

## Benchmarks y rendimiento

La información proporcionada no incluye resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque es un modelo de acción robótica, no de lenguaje general. En su lugar, se reporta la pérdida de flow matching en validación, medida sobre 20 lotes por división. La siguiente tabla muestra la evolución de la pérdida de validación para el paso 20.000 y los pasos previos.

| paso | train | val_seen | val_unseen | gap |
|---:|---:|---:|---:|---:|
| 0 | 0.5525 | 0.4968 | 0.5261 | 0.0293 |
| 2000 | 0.0553 | 0.0504 | 0.0608 | 0.0104 |
| 4000 | 0.0490 | 0.0467 | 0.0576 | 0.0109 |
| 6000 | 0.0460 | 0.0437 | 0.0543 | 0.0106 |
| 8000 | 0.0441 | 0.0423 | 0.0550 | 0.0127 |
| 10000 | 0.0435 | 0.0416 | 0.0542 | 0.0126 |
| 12000 | 0.0420 | 0.0403 | 0.0538 | 0.0135 |
| 14000 | 0.0404 | 0.0387 | 0.0537 | 0.0150 |
| 16000 | 0.0395 | 0.0383 | 0.0551 | 0.0168 |
| 18000 | 0.0383 | 0.0374 | 0.0563 | 0.0189 |
| **20000** | 0.0376 | 0.0363 | **0.0567** | 0.0204 |
| 22000 | 0.0361 | 0.0363 | 0.0584 | 0.0221 |

El punto de mejor validación en `val_unseen` es el paso 14000 (0.0537), y a partir de ahí la pérdida sube de forma monótona, mientras que `val_seen` sigue mejorando, lo que evidencia un sobreajuste. El checkpoint paso 20000 está claramente en la zona de sobreajuste y no se recomienda su uso.

## Requisitos de hardware

- Entrenamiento: se utilizaron 2 GPU A100-80GB con FSDP y batch size 128. El entrenamiento completo abarcó unos 23.400 pasos.
- Inferencia: no se proporcionan requisitos específicos para la inferencia. Dado que el modelo es un VLA con un LLM y una torre de visión, es probable que requiera una GPU con al menos 24 GB de VRAM, pero este dato no está disponible en la documentación.
- Despliegue: el modelo se puede cargar con la librería LeRobot (el repositorio indica `library_name: lerobot`) y también es compatible con el framework `openpi` de Physical Intelligence. No se mencionan opciones como vLLM o llama.cpp, ya que no es un modelo de lenguaje puro.
- Latencia y throughput: no se proporcionan estimaciones.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con otros de la misma categoría (modelos VLA para manipulación robótica). El propio autor publica un checkpoint equivalente (paso 14000) que es el recomendado, pero no hay datos de otros modelos de la misma tarea. Por lo tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El checkpoint paso 20000 está pasado del óptimo de generalización y no se recomienda su uso. El autor indica explícitamente que el mejor punto es el paso 14000.
- El modelo está entrenado para una tarea muy específica (pick-and-place de dos tubos con una instrucción fija) y no se ha demostrado que generalice a otras tareas de manipulación.
- La validación se realizó con los datos de origen separados (val_unseen), pero el modelo puede tener dificultades con variaciones de la tarea (por ejemplo, cambio de colores, posiciones, o condiciones de iluminación).
- No se han publicado análisis de sesgos o alucinación, pero al ser un modelo de acción, el riesgo principal es la ejecución incorrecta de la tarea en entornos reales.
- La licencia Apache 2.0 permite uso comercial, pero no se especifica si el modelo base π₀.5 tiene restricciones adicionales.
- La pérdida de entrenamiento se mide con aumento de imágenes, mientras que la validación no, por lo que no se pueden comparar directamente los valores de train y validación.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step20000
- Repositorio de openpi (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Checkpoint recomendado (paso 14000): https://huggingface.co/Aether258/pi05_bi_two_tubes_0102_step14000 (referenciado en la model card, aunque no se ha verificado el enlace)
