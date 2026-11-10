# Ggghoney/pick_and_place_act

## Resumen

`Ggghoney/pick_and_place_act` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado por Zhao et al. en 2023 (arXiv:2304.13705). El modelo aprende de datos de teleoperación a predecir fragmentos cortos de acciones ("action chunks") en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la tasa de éxito en tareas de manipulación. Lo publica el usuario Ggghoney en el Hub de Hugging Face mediante la librería LeRobot.

Se trata de una política específica para una única tarea: coger un bolígrafo rojo y colocarlo en un estuche. Consume el estado articular del robot (6 dimensiones) y dos flujos de imagen de 480x640 píxeles (cámaras `front` y `top`), y produce un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real sobre hardware robótico de sobremesa (tipo `omx_follower`).

Su relevancia es la de un ejemplo reproducible de aprendizaje por imitación end-to-end con LeRobot: dataset pequeño (30 episodios, 23.878 fotogramas a 30 FPS), configuración de entrenamiento documentada y comandos de despliegue listos para usar. No es un modelo de lenguaje ni un modelo fundacional multimodal; es una política visuomotora de propósito muy acotado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política visuomotora; ventana de observación de un paso con historial de acciones) |
| Tipos de cuantización | no disponible (pesos en safetensors; LeRobot no documenta cuantización para este modelo) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje); instrucción de tarea en inglés: "Pick up the red pen and place it in the pencil case" |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (repositorio LeRobot, 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un transformer que combina un codificador de imágenes (ResNet preentrenada, según el paper original) con un codificador de estado y un decodificador transformer que genera un chunk de acciones de longitud fija. La innovación principal es la predicción de chunks: en lugar de predecir una acción por paso, el modelo emite k acciones futuras de golpe, lo que mitiga el sesgo de acumulación de errores típico de las políticas de imitación paso a paso. El paper original también introduce el "temporal ensembling", que promedia predicciones solapadas entre chunks consecutivos para suavizar la trayectoria.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `Ggghoney/pick_and_place`: 30 episodios, 23.878 fotogramas a 30 FPS, una única tarea de picking and placing. Configuración: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000. No se documenta en la model card el número de tokens de entrenamiento (no aplica en el sentido de LLM), la composición del dataset más allá de los episodios ni si hubo aumento de datos. La model card no menciona RLHF, DPO ni ningún ajuste posterior; es aprendizaje por imitación supervisado puro.

## Capacidades

- Control visuomotor de un brazo robótico de 6 grados de libertad (`omx_follower`) a partir de dos cámaras RGB.
- Predicción de chunks de acciones de 6 dimensiones (posición articular o del efector final, según la convención del robot).
- Ejecución de una única tarea de manipulación: coger un bolígrafo rojo y meterlo en un estuche.
- Aprendizaje por imitación a partir de teleoperación; no requiere modelado explícito del entorno.
- Inferencia en tiempo real a 30 FPS (frecuencia de captura del dataset).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- **Automatización de una celda de picking and placing de laboratorio**: replicar la tarea de coger un objeto alargado y depositarlo en un contenedor, usando las cámaras `front` y `top` y el robot `omx_follower`. Adecuado por su entrenamiento específico en esa tarea y su bajo coste computacional.
- **Banco de pruebas para aprendizaje por imitación con LeRobot**: servir como referencia reproducible para comparar hiperparámetros (pasos, batch size, learning rate) en tareas de manipulación con datasets pequeños (30 episodios).
- **Prototipado rápido de políticas visuomotoras**: al tener 51,7 M de parámetros, se puede ejecutar en una GPU de consumo o incluso en CPU con latencias aceptables para experimentación, sin necesidad de infraestructura de servidor.
- **Generación de datos sintéticos o aumentados**: usar la política como baseline para evaluar técnicas de aumento de datos (cambios de iluminación, posiciones de objetos) sobre el dataset original.
- **Docencia y formación en robótica**: ejemplo completo de pipeline LeRobot (grabación, entrenamiento, rollout) con comandos documentados y dataset público.
- **Evaluación de robustez ante cambios de entorno**: medir la degradación de la política al variar posición del bolígrafo, iluminación o distracciones, ya que la model card no reporta resultados de evaluación y deja abierta esa comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de éxito por tarea, ni comparación con otras políticas, ni métricas de latencia o throughput.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 51,7 M de parámetros en fp32, los pesos ocupan aproximadamente 207 MB; en fp16, unos 103 MB. Sumando activaciones de dos imágenes de 480x640 y el decodificador, el consumo realista se sitúa en torno a 1-2 GB de VRAM.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090 o una A100/H100 funcionan sin problema, aunque las de gama alta quedan sobredimensionadas para este modelo.
- **¿Cabe en GPU de consumo?** Sí, en cualquier GPU de consumo moderna (GTX 1650 en adelante) e incluso en CPU para inferencia a baja frecuencia.
- **Opciones de despliegue**: LeRobot (`lerobot-rollout` con `--policy.path=Ggghoney/pick_and_place_act`), PyTorch nativo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- **Latencia y throughput**: no disponibles en la información proporcionada. El dataset se capturó a 30 FPS, lo que sugiere que el bucle de control está pensado para operar a esa frecuencia, pero no se confirma latencia real.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Ggghoney/pick_and_place_act` | 51,7 M | Estado 6D + 2 imágenes 480x640 | Pick and place de un bolígrafo | no disponible | Hugging Face Hub (LeRobot) |
| ACT original (Zhao et al., 2023) | no disponible en la ficha | no disponible | Manipulación con chunks de acciones | no disponible | Paper arXiv:2304.13705 |
| Otras políticas LeRobot del Hub (p. ej. Diffusion Policy, SmolVLA) | no disponible | no disponible | Manipulación diversa | variable | Hugging Face Hub |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para esta política ni datos de rendimiento de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- **Sesgo de tarea única**: entrenada exclusivamente para "coger el bolígrafo rojo y colocarlo en el estuche"; no generaliza a otros objetos, contenedores ni instrucciones.
- **Dataset muy pequeño**: 30 episodios y 23.878 fotogramas; alta probabilidad de sobreajuste a posiciones, iluminación y disposición concretas del entorno de grabación.
- **Riesgo de alucinación motora**: como toda política de imitación, puede ejecutar trayectorias plausibles pero incorrectas ante distribuciones fuera de entrenamiento (objetos en posiciones nuevas, oclusiones, cambios de cámara).
- **Sin evaluación publicada**: no hay tasa de éxito medida, por lo que no se puede afirmar su fiabilidad en producción.
- **Licencia no disponible**: la model card marca la licencia como "[More Information Needed]"; no se puede asumir uso comercial sin consultar al autor.
- **Dependencia de hardware específico**: requiere un robot `omx_follower` y dos cámaras con los nombres `front` y `top`; cambiar la configuración invalida la política.
- **Idioma**: la instrucción de tarea está en inglés y el modelo no procesa lenguaje; no hay soporte multilingüe.
- **Caveat de producción**: al ser un modelo de 0,2 GB y 51,7 M de parámetros, su coste de despliegue es bajo, pero la falta de métricas de robustez y de licencia clara lo hacen no apto para entornos comerciales sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ggghoney/pick_and_place_act
- Dataset de entrenamiento: https://huggingface.co/datasets/Ggghoney/pick_and_place
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Ggghoney/pick_and_place
- Paper ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
