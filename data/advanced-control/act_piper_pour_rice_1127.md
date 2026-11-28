# advanced-control/act_piper_pour_rice_1127

## Resumen

`advanced-control/act_piper_pour_rice_1127` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv 2304.13705. La desarrolla el usuario `advanced-control` y se distribuye a través de la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones (estado articular de 7 dimensiones y tres cámaras RGB) a acciones de 7 dimensiones, pensado para ejecutar una tarea concreta de manipulación sobre un robot Piper.

El modelo resuelve el problema de convertir demostraciones teleoperadas en una política que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error acumulado y mejora la estabilidad en tareas de contacto. Con 51.670.663 parámetros y un repositorio de 0,2 GB en safetensors, es un modelo compacto que puede ejecutarse en hardware modesto. La tarea registrada en el dataset es "pour rice" (verter arroz) sobre el robot Piper, con 30 episodios y 39.884 fotogramas grabados a 15 FPS.

Su relevancia es la de un artefacto reproducible de aprendizaje por imitación: la model card documenta la configuración completa de entrenamiento (100.000 pasos, batch 8, AdamW, learning rate 1e-5, semilla 1000, LeRobot 0.6.1), lo que permite replicar o adaptar el pipeline. No hay resultados de evaluación publicados ni métricas de éxito en robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación definida por la configuración de ACT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantizaciones para esta política) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice secuencias cortas de acciones (chunks) condicionadas por observaciones multimodales. La política consume `observation.state` con forma `(7,)` y tres flujos visuales de `(3, 360, 640)` procedentes de las cámaras `camera_hand`, `camera_chest` y `camera_top`, y produce una acción de `(7,)`. El entrenamiento se realizó sobre el dataset `advanced-control/piper_pour_rice_1127`, con 30 episodios, 39.884 fotogramas a 15 FPS y la etiqueta de tarea "task".

La configuración documentada incluye 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5, semilla 1000 y LeRobot 0.6.1. No se detalla la composición del dataset más allá del número de episodios ni si hubo aumentos de datos, RLHF o ajuste posterior. La innovación principal es la propia formulación de ACT: predecir chunks de acción en lugar de pasos individuales para amortiguar el error compuesto en horizontes largos de manipulación.

## Capacidades

- Control visomotor de manipulación robótica: genera comandos de 7 dimensiones a partir de estado articular y tres cámaras.
- Ejecución de la tarea específica de verter arroz sobre una plataforma Piper, según el dataset de entrenamiento.
- Aprendizaje por imitación a partir de demostraciones teleoperadas, sin recompensa explícita.
- Predicción de chunks de acción que mejoran la estabilidad frente a políticas paso a paso.
- Integración con el ecosistema LeRobot para rollout, entrenamiento y visualización de datos.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- Automatización de una celda de vertido de arroz: la política se ejecuta con `lerobot-rollout` sobre un robot Piper equipado con las tres cámaras documentadas para reproducir la tarea aprendida.
- Replicación de experimentos de aprendizaje por imitación: sirve como referencia reproducible con hiperparámetros y dataset públicos para comparar variantes de ACT.
- Base para fine-tuning en tareas de manipulación similares: al ser un checkpoint ACT de 51,7 M de parámetros, se puede reentrenar con nuevos datasets de LeRobot y un coste computacional bajo.
- Docencia y formación en robótica: el par política-dataset permite mostrar el ciclo completo de grabación, entrenamiento y despliegue sin infraestructura pesada.
- Validación de pipelines de datos: los 30 episodios y 39.884 fotogramas a 15 FPS sirven para probar herramientas de visualización y control de calidad de datasets robóticos.
- Prototipado de control visomotor en laboratorio: con un repo de 0,2 GB, se puede desplegar en estaciones de trabajo con GPU de consumo para pruebas de concepto.
- Integración en sistemas de investigación que usen LeRobot como capa de abstracción, aprovechando la compatibilidad con `lerobot-train` y `lerobot-rollout`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros en FP32 el peso ronda los 0,2 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; para entrenamiento se recomienda al menos una RTX 3090 o superior por el batch size 8 y las tres cámaras a 360x640.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1660, RTX 2060, RTX 3060, RTX 4060 y superiores; no hay requisitos oficiales publicados.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`), con soporte de PyTorch y CUDA; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; dependen del robot, la frecuencia de control y el hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `advanced-control/act_piper_pour_rice_1127` | 51,7 M | Estado (7,) + 3 cámaras 360x640 | Vertido de arroz en Piper | Apache 2.0 | Hugging Face |
| Políticas ACT genéricas de LeRobot | Variable | Estado + cámaras según configuración | Manipulación diversa | Apache 2.0 (LeRobot) | Hugging Face |
| Políticas Diffusion Policy | Variable | Estado + cámaras | Manipulación diversa | Según implementación | Hugging Face / repos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- La política está entrenada para una única tarea ("pour rice") y un robot concreto (Piper); no se espera generalización a otras tareas u objetos.
- No hay resultados de evaluación en robot real, por lo que se desconoce la tasa de éxito y la robustez ante cambios de iluminación, posición de objetos o distracciones.
- El dataset es pequeño (30 episodios, 39.884 fotogramas), lo que aumenta el riesgo de sobreajuste a las condiciones de grabación.
- Las cámaras deben coincidir en nombre y resolución con las de entrenamiento (`camera_hand`, `camera_chest`, `camera_top`, 360x640); un cambio de configuración invalida la política.
- No es un modelo de lenguaje: no tiene sesgos lingüísticos ni riesgo de alucinación textual, pero sí puede producir acciones erráticas fuera de la distribución de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- No se documentan cuantizaciones ni optimizaciones de despliegue, lo que limita el ajuste fino de latencia en entornos de control en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/advanced-control/act_piper_pour_rice_1127
- Dataset de entrenamiento: https://huggingface.co/datasets/advanced-control/piper_pour_rice_1127
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets: https://huggingface.co/spaces/lerobot/visualize_dataset?path=advanced-control/piper_pour_rice_1127
