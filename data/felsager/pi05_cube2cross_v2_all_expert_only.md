# felsager/pi05_cube2cross_v2_all_expert_only

## Resumen

`felsager/pi05_cube2cross_v2_all_expert_only` es un ajuste fino del modelo visión-lenguaje-acción (VLA) π₀.₅ (Pi05) de Physical Intelligence, implementado sobre la librería LeRobot de Hugging Face. El modelo base, `lerobot/pi05_base`, se ha entrenado específicamente para una tarea de manipulación robótica concreta: recoger un cubo de un color determinado y colocarlo sobre una cruz roja. El autor del ajuste es el usuario de Hugging Face `felsager`.

El modelo resuelve el problema de control robótico de extremo a extremo a partir de observaciones visuales y de estado del robot, generando directamente comandos de acción. Es relevante porque demuestra el flujo completo de ajuste fino de un VLA de propósito general a una tarea concreta usando datos de demostración propios, sin necesidad de ingeniería de recompensas ni de un pipeline de aprendizaje por refuerzo.

Con aproximadamente 4.140 millones de parámetros en formato safetensors, el modelo consume dos cámaras (vista superior y vista de muñeca) a resolución 480x640 y produce un vector de acción de 10 dimensiones para un robot UR5e con pinza. El repositorio ocupa 20 GB e incluye los pesos en formato safetensors compatibles con LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) Pi05, basada en transformer multimodal con cabecera de acciones |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Robot objetivo | ur5e_hand_e |
| Camaras | top, wrist (480x640, 3 canales) |
| Dimension de estado | 10 |
| Dimension de accion | 10 |
| Frecuencia de datos | 30 FPS |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/pi05_base`, la implementación en LeRobot del VLA π₀.₅ de Physical Intelligence. π₀.₅ es una evolución de π₀ diseñada para generalizar a entornos y situaciones no vistos durante el entrenamiento. La arquitectura combina un codificador visual (dos cámaras), un codificador de estado del robot (vector de 10 dimensiones) y un decodificador que emite directamente acciones de 10 dimensiones. No se dispone de detalles adicionales sobre la composición interna del transformer en la información proporcionada.

El ajuste fino se realizó sobre el conjunto de datos `felsager/vla_cubes_cross_v2`, compuesto por 1.000 episodios y 493.474 fotogramas a 30 FPS. Las tareas cubiertas son cuatro variantes de "recoger el cubo [azul/verde/amarillo/rojo] y colocarlo sobre la cruz roja". La configuración de entrenamiento fue de 30.000 pasos, batch size 16, optimizador AdamW, learning rate 5e-5, semilla 0 y LeRobot 0.6.2. No se especifica si hubo RLHF, DPO ni otras fases de alineamiento posteriores.

## Capacidades

- Generación de acciones robóticas de manipulación (pick-and-place) a partir de observaciones visuales y de estado.
- Percepción visual multimodal mediante dos cámaras (vista superior y de muñeca).
- Ejecución de instrucciones en lenguaje natural para seleccionar el objeto y el destino (cuatro variantes de tarea).
- Control de un robot UR5e con pinza (`ur5e_hand_e`) en tareas de agarre y colocación.
- Operación en bucle cerrado a 30 FPS con observaciones de estado de 10 dimensiones.
- No se ha documentado soporte de tool calling, agentes multi-paso, razonamiento matemático, generación de código ni capacidades multilingües en la información disponible.
- No se ha documentado modo de pensamiento (thinking), visión general fuera del dominio robótico, audio ni otras capacidades especiales.

## Casos de uso

- Automatización de pick-and-place en línea de montaje: el modelo recibe las imágenes de las cámaras superior y de muñeca y emite las acciones de 10 dimensiones para que el UR5e agarre el cubo del color indicado y lo deposite sobre la cruz roja. Es adecuado porque ha sido entrenado específicamente sobre 1.000 episodios de esa tarea.
- Clasificación y separación de piezas por color: las cuatro variantes de tarea permiten seleccionar cubos azul, verde, amarillo o rojo, lo que habilita un caso de uso de selección por color en entornos controlados.
- Prototipado rápido de políticas VLA en laboratorio: sirve como punto de partida para investigadores que quieran validar el flujo de LeRobot (grabación, entrenamiento, rollout) antes de escalar a tareas más complejas.
- Base para ajuste fino adicional: al estar construido sobre `lerobot/pi05_base`, puede reutilizarse como inicialización para nuevas tareas de manipulación con el mismo robot y configuración de cámaras.
- Docencia y demostraciones de imitation learning: el modelo y su dataset asociado permiten ilustrar el ciclo completo de aprendizaje por imitación con un VLA.
- Pruebas de integración de hardware UR5e: el comando `lerobot-rollout` documentado permite desplegar la política en un robot real con la configuración de cámaras especificada.
- Evaluación de robustez ante cambios de iluminación o posición de objetos: el modelo puede usarse como referencia para medir la degradación de éxito fuera de la distribución de entrenamiento (aunque no se han publicado tasas de éxito).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 4.140 millones de parámetros en safetensors (probablemente fp32 o bf16), se requiere una GPU con al menos 8-16 GB de VRAM para cargar los pesos, aunque este cálculo no está confirmado por el autor.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, lo que implica una GPU NVIDIA, pero no se especifica modelo.
- Compatibilidad con GPU de consumo: no confirmada. Por el tamaño de parámetros podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Los datos se grabaron a 30 FPS, pero no se especifica la latencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `felsager/pi05_cube2cross_v2_all_expert_only` | 4.143.404.816 | no disponible | Pick-and-place de cubos sobre cruz roja (UR5e) | gemma | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | VLA generalista π₀.₅ | no disponible | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA generalista | no disponible | OpenPI |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en la tarea de recoger cubos de cuatro colores y colocarlos sobre una cruz roja; no es un VLA de propósito general tras el ajuste fino.
- No se han publicado tasas de éxito ni evaluaciones en robot real, por lo que se desconoce su robustez fuera de la distribución de entrenamiento.
- El modelo asume una configuración de hardware concreta: robot UR5e con pinza (`ur5e_hand_e`) y dos cámaras con nombres `top` y `wrist` a 480x640. Cualquier desviación en la configuración puede invalidar su funcionamiento.
- Riesgo de alucinación y de acciones erróneas en entornos no vistos: al ser un modelo de imitación, puede fallar ante cambios de iluminación, posición de objetos o distractores no presentes en el dataset.
- La licencia es `gemma`, lo que puede imponer restricciones adicionales para uso comercial; debe revisarse el texto completo de la licencia Gemma antes de un despliegue productivo.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset propio y limitado, puede heredar sesgos de las demostraciones del autor.
- El repositorio ocupa 20 GB, lo que implica requisitos de almacenamiento y de transferencia considerables.
- No se dispone de información sobre cuantizaciones, por lo que no se puede confirmar su viabilidad en hardware de bajos recursos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/felsager/pi05_cube2cross_v2_all_expert_only)
- [Modelo base lerobot/pi05_base](https://huggingface.co/lerobot/pi05_base)
- [Dataset felsager/vla_cubes_cross_v2](https://huggingface.co/datasets/felsager/vla_cubes_cross_v2)
- [Blog de π₀.₅ de Physical Intelligence](https://www.physicalintelligence.company/blog/pi05)
- [Repositorio LeRobot en GitHub](https://github.com/huggingface/lerobot)
- [Guía de LeRobot para pi05](https://huggingface.co/docs/lerobot/main/en/pi05)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Documentación de inferencia (rollout)](https://huggingface.co/docs/lerobot/main/en/inference)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_v2)
- [Repositorio OpenPI de Physical Intelligence](https://github.com/Physical-Intelligence/openpi)
