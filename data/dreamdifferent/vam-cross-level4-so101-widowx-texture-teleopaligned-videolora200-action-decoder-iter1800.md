# dreamdifferent/vam-cross-level4-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800

## Resumen

Este repositorio contiene un checkpoint de decoder de acción del proyecto VAM-Cross, desarrollado por el usuario `dreamdifferent`. Se trata de un componente de un sistema de robótica que convierte observaciones de video en comandos de acción para el robot WidowX 250. Concretamente, es el decoder World2Action entrenado en la iteración 1800 de un pipeline que combina un backbone de video congelado, un Video LoRA congelado y un decoder de acción. El modelo está diseñado para predecir 15 acciones de efector final y gripper a 5 Hz a partir de dos cámaras (esquina y frontal). Su relevancia radica en ser un ejemplo de arquitectura de predicción de acciones basada en video para manipulación robótica, aunque no se proporcionan detalles sobre la arquitectura interna ni métricas de rendimiento. El tamaño del repositorio es de 1.0 GB y la licencia no está especificada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (decoder de acción World2Action) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa video, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un decoder de acción que se integra en un sistema más amplio. Según la model card, el checkpoint corresponde a la iteración 1800 de un entrenamiento que utiliza un backbone de video inicial (`widowx250-video-fused`), un decoder de acción inicial (`vam-cross-target-widowx250-native-2cam-action-decoder`) y un Video LoRA congelado (`vam-cross-level4-so101-widowx-texture-video-lora-iter-200`). El entrenamiento se realizó sobre un dataset de teleoperación con 151 episodios y 54 340 frames, con dos cámaras (`corner_cam` y `front_cam`). El objetivo es predecir 15 acciones de efector final y gripper a 5 Hz, con pose relativa al `achieved_pose` actual y rotación representada en formato 6D. No se especifican detalles sobre la arquitectura interna del decoder (número de capas, tipo de atención, etc.) ni sobre el proceso de entrenamiento (pérdidas, optimizador, etc.).

## Capacidades

- Predicción de acciones de efector final y gripper a partir de observaciones de video.
- Soporte de entrada con dos cámaras simultáneas (esquina y frontal).
- Salida de 15 dimensiones de acción a una frecuencia de 5 Hz.
- Representación de orientación mediante rotación 6D.
- Diseñado específicamente para el robot WidowX 250.
- No es un modelo de lenguaje: no genera texto ni tiene capacidades de conversación.

## Casos de uso

- Control robótico en bucle cerrado: el modelo puede usarse para predecir comandos de bajo nivel a partir de video en tiempo real, permitiendo que el robot ejecute tareas de manipulación sin intervención humana.
- Aprendizaje por imitación: sirve como componente de una política entrenada a partir de demostraciones humanas, facilitando la transferencia de habilidades al robot.
- Teleoperación asistida: puede combinarse con sistemas de teleoperación para refinar las acciones del operador, mejorando la precisión en tareas delicadas.
- Investigación en visión-robótica: útil para estudiar la relación entre observaciones visuales y acciones motoras, especialmente en entornos con múltiples cámaras.
- Evaluación de pipelines de entrenamiento: al ser un checkpoint intermedio, permite analizar la evolución del aprendizaje y comparar iteraciones.
- Integración en sistemas de planificación: puede actuar como módulo de ejecución de bajo nivel dentro de una arquitectura de planificación de alto nivel, donde un planificador decide la secuencia de tareas y el decoder las ejecuta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 1.0 GB, pero el modelo en sí puede ser menor; no se indica el consumo de memoria.
- GPU recomendada: no disponible. Dado que es un decoder de acción, probablemente pueda ejecutarse en GPUs de consumo como RTX 3090 o RTX 4090, pero no hay confirmación.
- Opciones de despliegue: no disponible. Al ser un modelo de PyTorch, podría integrarse con frameworks como ROS o PyTorch, pero no se documentan opciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Existen otros checkpoints del mismo proyecto (por ejemplo, `vam-cross-level4-so101-widowx-texture-video-lora-iter-400` y `vam-cross-level5-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800`), pero no se proporcionan datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial y la redistribución están sujetos a incertidumbre legal.
- Dependencia de componentes congelados: el modelo requiere el backbone de video y el Video LoRA congelados, que no están incluidos en este repositorio y deben obtenerse por separado.
- Especificidad del robot: está entrenado para el WidowX 250 con una configuración de dos cámaras concreta; no es directamente transferible a otros robots o disposiciones de sensores.
- Dataset limitado: con solo 151 episodios, la generalización a escenarios no vistos puede ser limitada.
- Sin métricas de rendimiento: no se han publicado resultados de evaluación, por lo que se desconoce su precisión o robustez.
- No es un modelo de lenguaje: no debe usarse para tareas de procesamiento de texto o generación de contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800
- Checkpoint relacionado (Video LoRA iter 400): https://huggingface.co/dreamdifferent/vam-cross-level4-so101-widowx-texture-video-lora-iter-400
- Checkpoint relacionado (level5 action decoder): https://huggingface.co/dreamdifferent/vam-cross-level5-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800
