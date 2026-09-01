# dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800

## Resumen

Este repositorio contiene un checkpoint del decoder World2Action del sistema VAM-Cross, un modelo de robótica para predicción de acciones a partir de vídeo. Ha sido desarrollado por el usuario `dreamdifferent` y se enmarca en el pipeline de `mimic-video`, una línea de trabajo orientada al aprendizaje por imitación para control de brazos manipuladores. El checkpoint corresponde a la iteración 1800 de un entrenamiento que se detuvo de forma prematura, y está diseñado para operar junto a un backbone Video2World congelado y una LoRA de vídeo también congelada, ambos publicados por el mismo autor.

El modelo resuelve el problema de mapear observaciones visuales multicámara (dos cámaras: `corner_cam` y `front_cam`) a comandos de acción de 15 dimensiones para el efector final y la pinza de un robot, a una frecuencia de 5 Hz. Es relevante porque representa un componente intermedio de un sistema de control robótico basado en vídeo, con un enfoque modular que separa la representación visual del decodificador de acciones. No se dispone de información sobre la arquitectura interna, el número de parámetros ni la licencia, por lo que su uso en producción requiere verificar estos aspectos con el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (decoder de acciones, parte de un sistema Video2World) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1.0 GB, sin especificar) |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un decoder de acciones (World2Action) que se entrena sobre un backbone Video2World congelado, con una LoRA de vídeo también congelada. El entrenamiento se realizó sobre un dataset propio (`dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture`) con 256 episodios y 54 376 frames, utilizando dos cámaras de observación. Las acciones objetivo son de 15 dimensiones (posiciones y orientaciones del efector final más la pinza), expresadas en un sistema de referencia relativo a la pose actual del robot, con rotación en formato `rotation_6d`. El entrenamiento se detuvo en la iteración 1800 por una causa no especificada (`unknown`), y se seleccionó el checkpoint más reciente verificado.

No se proporcionan detalles sobre la arquitectura interna del decoder (tipo de red, número de capas, mecanismos de atención, etc.), ni sobre el proceso de entrenamiento (función de pérdida, optimizador, hiperparámetros). Tampoco se indica si se emplearon técnicas como RLHF o DPO, algo poco probable en un contexto de robótica.

## Capacidades

- Predicción de acciones de robot: genera comandos de 15 dimensiones para el efector final y la pinza a partir de observaciones visuales de dos cámaras.
- Control a 5 Hz: las acciones se emiten a una frecuencia fija de 5 Hz, adecuada para tareas de manipulación de baja velocidad.
- Integración modular: funciona como decoder dentro de un sistema más amplio que incluye un backbone de vídeo congelado y una LoRA de vídeo congelada.
- Específico para dos robots: KUKA iiwa14 y WidowX, con textura y alineación de teleoperación definidas en el dataset.
- Sin capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico: es un modelo puramente perceptivo-motor.

## Casos de uso

- Control de brazo robótico por imitación: el modelo puede utilizarse para reproducir trayectorias de manipulación aprendidas de demostraciones humanas, integrado en un sistema de control en bucle cerrado con realimentación visual.
- Teleoperación asistida: al predecir acciones relativas a la pose actual, puede servir como componente de un sistema de teleoperación que combine comandos humanos con correcciones automáticas.
- Investigación en aprendizaje por imitación: como checkpoint intermedio, permite estudiar el efecto de la iteración de entrenamiento en la calidad de las predicciones y comparar con versiones posteriores.
- Desarrollo de políticas de manipulación para KUKA iiwa14: el modelo está calibrado para este brazo, por lo que puede servir como punto de partida para tareas específicas de ensamblaje o manipulación de objetos.
- Evaluación de arquitecturas de decodificación de acciones: al ser un componente aislado, facilita experimentos sobre diferentes diseños de decoder manteniendo fijo el backbone visual.
- Benchmarking de sistemas de control basados en vídeo: puede emplearse como referencia en comparativas de modelos de predicción de acciones en robótica, siempre que se respeten las condiciones de los componentes congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, dado que el modelo no está orientado a tareas de lenguaje o razonamiento general. Tampoco se ofrecen métricas específicas de robótica (éxito en tareas, error de trayectoria, etc.).

## Requisitos de hardware

- No se dispone de información sobre requisitos de VRAM, GPU recomendadas o latencia.
- El tamaño del repositorio es de 1.0 GB, lo que sugiere que el checkpoint podría cargarse en GPUs de consumo con al menos 4-8 GB de VRAM, pero esta estimación no está confirmada.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.). Dado que es un modelo de robótica, probablemente se ejecute mediante frameworks de aprendizaje profundo estándar (PyTorch, TensorFlow), pero no se especifica.
- Se recomienda contactar con el autor para obtener detalles sobre el entorno de ejecución y los requisitos de hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (decoders de acciones para robótica basados en vídeo). No se puede establecer una comparativa con alternativas como RT-2, Octo o OpenVLA, ya que no se han encontrado datos de rendimiento ni especificaciones técnicas de este modelo que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la iteración 1800 de un entrenamiento que se detuvo prematuramente; no es un modelo final y puede presentar un rendimiento subóptimo.
- Dependencia de componentes congelados: requiere el backbone Video2World, la LoRA de vídeo y el decoder inicial especificados en la model card; sin ellos, el modelo no funciona.
- Dataset no incluido: el dataset de entrenamiento no se distribuye con el repositorio, lo que limita la reproducibilidad.
- Especificidad del robot: está calibrado para KUKA iiwa14 y WidowX con una configuración de cámaras concreta; su uso en otros robots o configuraciones requeriría reentrenamiento.
- Licencia no especificada: no se indica la licencia, por lo que el uso comercial o la redistribución pueden estar sujetos a restricciones legales no documentadas.
- Riesgo de alucinación en acciones: al ser un modelo de aprendizaje automático, puede generar comandos de acción no válidos o inconsistentes con la física del robot, especialmente en situaciones fuera de la distribución de entrenamiento.
- Sin soporte de lenguaje: no procesa texto ni instrucciones verbales; solo entradas visuales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800
- LoRA de vídeo congelada (iter 200): https://huggingface.co/dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture-video-lora-iter-200
- Variante de nivel 4 del mismo sistema: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800
- Documentación del modelo KUKA iiwa (referencia externa): https://deepwiki.com/epfl-lasa/iiwa_ros/2.3-robot-model-variants
- Soporte ROS para KUKA LBR iiwa: https://wiki.ros.org/kuka_lbr_iiwa_support
- Modelo KUKA iiwa en VTPRL: https://deepwiki.com/tum-i6/VTPRL/5.1-kuka-iiwa-robot-model
