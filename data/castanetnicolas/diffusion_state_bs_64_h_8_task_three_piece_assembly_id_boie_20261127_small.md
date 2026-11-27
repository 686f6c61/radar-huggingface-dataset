# castanetnicolas/diffusion_state_BS_64_H_8_TASK_three_piece_assembly_ID_boie_20261127_small

## Resumen

Este repositorio contiene una política de imitación basada en Diffusion Policy, entrenada con la librería LeRobot de Hugging Face para una tarea concreta de manipulación robótica: el ensamblaje de tres piezas sobre una base. El modelo trata el control visuomotor como un proceso generativo de difusión, produciendo trayectorias de acción suaves y multimodales que funcionan especialmente bien en tareas con contacto físico rico, como es el caso del encaje de piezas. Lo firma el usuario castanetnicolas y se publica bajo licencia Apache 2.0.

A diferencia de un modelo de lenguaje, no procesa texto: consume un vector de estado del robot de 9 dimensiones y un vector de estado del entorno de 42 dimensiones, y emite una acción de 7 dimensiones (típicamente posición y orientación del efector final más la apertura de la pinza). Está entrenado para el robot Franka Emika Panda y se apoya en un dataset de 200 episodios y 67.101 fotogramas grabados a 20 FPS sobre la tarea "Insert the first piece into the base, then insert the second piece on top of it".

Su relevancia es acotada pero clara: es un artefacto reproducible y ligero (17 millones de parámetros, 0,1 GB) que sirve como referencia para experimentar con Diffusion Policy en LeRobot, validar pipelines de entrenamiento y despliegue, o como punto de partida para entrenar políticas propias sobre el mismo dataset. No es un modelo generalista ni pretende serlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (control visuomotor como proceso generativo de difusión) |
| Parametros totales | 17.054.855 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de estado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LeRobot) |

## Arquitectura y entrenamiento

La política sigue el enfoque Diffusion Policy descrito en el paper arXiv:2303.04137: en lugar de regresar directamente una acción, modela la distribución de secuencias de acciones como un proceso de difusión y genera trayectorias multimodales y suaves mediante eliminación iterativa de ruido. La entrada combina `observation.state` (9 dimensiones) y `observation.environment_state` (42 dimensiones); la salida es `action` (7 dimensiones). El nombre del repositorio sugiere un horizonte de predicción de 8 pasos (`H_8`) y un tamaño de batch de 64 durante el entrenamiento.

El entrenamiento se realizó con LeRobot 0.6.1 sobre el dataset `castanetnicolas/mimicgen_three_piece_assembly_d1_state_objects` (200 episodios, 67.101 fotogramas, 20 FPS), con 300.000 pasos, optimizador Adam, learning rate 1e-4 y semilla 1000. No se documentan detalles sobre aumento de datos, composición exacta del dataset ni uso de RLHF/DPO (no aplicable en este dominio). El dataset parece derivado de MimicGen, una técnica de generación automática de datos de demostración para manipulación.

## Capacidades

- Generación de trayectorias de acción para control visuomotor de un robot manipulador.
- Ejecución de una tarea concreta de ensamblaje: insertar una primera pieza en la base y una segunda encima.
- Manejo de tareas con contacto físico rico gracias a la naturaleza generativa de la difusión.
- Consumo de estado propioceptivo del robot y estado del entorno como entradas.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, agentes, razonamiento multi-step simbólico ni capacidades multilingües.
- No procesa visión de forma directa en la configuración documentada: las entradas son vectores de estado, no imágenes (aunque el pipeline de rollout admite cámaras, la política descrita consume estado).

## Casos de uso

- Investigación en imitación robótica: usar la política como referencia reproducible para comparar variantes de Diffusion Policy sobre el mismo dataset y configuración de entrenamiento.
- Validación de pipelines LeRobot: probar el flujo completo de `lerobot-train` y `lerobot-rollout` con un checkpoint ya entrenado antes de invertir cómputo en políticas propias.
- Benchmark de ensamblaje de precisión: evaluar el comportamiento de una política de difusión en una tarea de inserción de piezas, donde la suavidad de las trayectorias importa.
- Punto de partida para fine-tuning: reentrenar o ajustar la política sobre un dataset propio de ensamblaje con la misma estructura de observaciones y acciones.
- Docencia y divulgación: ejemplo ligero (17 M de parámetros, 0,1 GB) para explicar Diffusion Policy en robótica sin requerir hardware de gran escala.
- Pruebas de integración hardware-software: verificar la comunicación con un Franka Panda real o simulado usando el comando de rollout documentado.
- Generación de datos sintéticos de trayectorias: emplear las salidas del modelo como referencia para estudiar la distribución de acciones en tareas de contacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 17 M de parámetros, el modelo cabe holgadamente en cualquier GPU consumer (menos de 1 GB en fp32, aproximadamente 34 MB solo en pesos).
- GPU recomendadas: cualquier GPU NVIDIA con CUDA es suficiente; una RTX 3060 o superior es más que adecuada. Para entrenamiento conviene una RTX 4090, A100 o H100 por el número de pasos (300.000).
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de PyTorch y safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware del robot y de la frecuencia de control (el dataset se grabó a 20 FPS).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Diffusion Policy, three_piece_assembly) | 17 M | no aplica | Ensamblaje de tres piezas con Panda | Apache 2.0 | Hugging Face |
| Otras políticas LeRobot Diffusion Policy | no disponible | no aplica | Manipulación genérica | Apache 2.0 (habitual) | Hugging Face |
| Políticas ACT (Action Chunking Transformer) en LeRobot | no disponible | no aplica | Manipulación genérica | Apache 2.0 (habitual) | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo está entrenado para una tarea concreta de ensamblaje; no generaliza a otras tareas sin reentrenamiento.
- Sin resultados de evaluación publicados: no hay evidencia empírica de tasa de éxito en robot real.
- Dependencia del dataset MimicGen: el rendimiento está acotado por la calidad y cobertura de las 200 demostraciones originales.
- No procesa lenguaje ni imágenes de forma nativa en la configuración documentada; las entradas son vectores de estado.
- Riesgo de sobreajuste al entorno de entrenamiento (posiciones de objetos, iluminación, configuración del robot); no se documentan pruebas de robustez.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y la especificidad de la tarea hacen desaconsejable su uso en producción sin validación previa.
- Sin datos sobre sesgos (no aplicable en el sentido de sesgos sociales, pero sí posible sesgo hacia las condiciones de recogida de datos).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_state_BS_64_H_8_TASK_three_piece_assembly_ID_boie_20261127_small
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_state_objects
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_state_objects
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
