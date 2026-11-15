# castanetnicolas/diffusion_UR5e_BS_32_H_16_TASK_three_piece_assembly_crop232_ID_q3_164926

## Resumen

Este repositorio contiene una política de control visuomotor entrenada con el método Diffusion Policy, publicada en el Hub mediante la librería LeRobot de Hugging Face. El autor es el usuario `castanetnicolas` y el modelo resuelve una tarea concreta de ensamblaje robótico: insertar la primera pieza en la base y después la segunda pieza encima. No es un modelo de lenguaje: es una política de imitación que asigna acciones de 7 dimensiones a partir de observaciones visuales y de estado proprioceptivo.

La arquitectura sigue el planteamiento de Diffusion Policy (Chi et al., 2023, arXiv:2303.04137), que formula el control como un proceso generativo de difusión y produce trayectorias de acción suaves y multimodales, adecuadas para manipulación con contacto rico. El modelo consume dos cámaras de 256x256 píxeles (`agentview` y `robot0_eye_in_hand`) y un vector de estado de 9 dimensiones, y emite una acción de 7 dimensiones por paso.

El modelo tiene 278.014.919 parámetros (según los pesos en safetensors) y ocupa 1,1 GB en el repositorio. Se entrenó sobre 220 episodios y 73.864 fotogramas a 20 FPS del dataset `mimicgen_three_piece_assembly_d1_image256`, con licencia Apache 2.0. Su relevancia es acotada: es un artefacto reproducible de investigación en aprendizaje por imitación robótico, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), implementado en LeRobot |
| Parametros totales | 278.014.919 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de un paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

| Parametro adicional | Valor |
|---|---|
| Tipo de robot | `panda` (según model card; el nombre del repo menciona UR5e) |
| Cámaras de entrada | `agentview`, `robot0_eye_in_hand` |
| Entrada `observation.state` | `(9,)` |
| Entrada `observation.images.agentview` | `(3, 256, 256)` |
| Entrada `observation.images.robot0_eye_in_hand` | `(3, 256, 256)` |
| Salida `action` | `(7,)` |
| Tarea | "Insert the first piece into the base, then insert the second piece on top of it." |
| Dataset de entrenamiento | `castanetnicolas/mimicgen_three_piece_assembly_d1_image256` |
| Episodios / fotogramas | 220 / 73.864 |
| Frecuencia de datos | 20 FPS |
| Pasos de entrenamiento | 300.000 |
| Batch size | 32 |
| Optimizador / LR | Adam / 0,0001 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, que trata el control visuomotor como un proceso generativo: en lugar de predecir una única acción de forma determinista, aprende a generar secuencias de acción mediante difusión, lo que permite representar distribuciones multimodales de comportamiento y producir trayectorias suaves. La política condiciona la generación en observaciones visuales de dos cámaras (vista externa `agentview` y vista de muñeca `robot0_eye_in_hand`) y en un vector de estado de 9 dimensiones, y emite acciones de 7 dimensiones.

El entrenamiento es de imitación supervisada sobre el dataset `mimicgen_three_piece_assembly_d1_image256` (220 episodios, 73.864 fotogramas a 20 FPS), con 300.000 pasos, batch de 32, optimizador Adam y tasa de aprendizaje 0,0001, semilla 1000, usando LeRobot 0.6.1. La model card no documenta el número de tokens ni detalles de composición del dataset más allá de los episodios y la tarea. No se indica RLHF, DPO ni innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de trayectorias de acción de 7 dimensiones para control robótico de manipulación.
- Control visuomotor a partir de dos cámaras RGB de 256x256 y un vector de estado de 9 dimensiones.
- Ejecución de una tarea de ensamblaje de dos piezas con contacto rico (inserción secuencial).
- Producción de acciones suaves y multimodales gracias al planteamiento de difusión.
- Integración con el ecosistema LeRobot: rollout, entrenamiento y evaluación mediante CLI (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como referencia reproducible de Diffusion Policy sobre una tarea de ensamblaje concreta, con hiperparámetros y dataset públicos para replicar experimentos.
- Ensamblaje robótico de precisión en laboratorio: el modelo ejecuta la inserción secuencial de dos piezas sobre una base, un escenario de contacto rico donde las políticas deterministas suelen fallar por multimodalidad.
- Evaluación de pipelines de LeRobot: permite probar el flujo completo de `lerobot-rollout` con un robot `panda` y dos cámaras, validando calibración, nombres de cámaras y claves de observación.
- Punto de partida para fine-tuning: al estar entrenado con 300.000 pasos sobre 220 episodios, puede reutilizarse como inicialización para tareas de ensamblaje similares con nuevos objetos o posiciones.
- Benchmark de políticas de difusión: útil para comparar frente a políticas deterministas (ACT, etc.) en la misma tarea y dataset, midiendo tasa de éxito en ensayos reales.
- Docencia y demostraciones de robótica: ejemplo didáctico de política visuomotora con entradas y salidas bien definidas y comandos de ejecución documentados.
- Generación de datos sintéticos vía MimicGen: el dataset asociado procede de MimicGen, por lo que el modelo puede emplearse para estudiar la transferencia de datos sintéticos a ejecución real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito, número de ensayos ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 278 millones de parámetros, los pesos en FP32 ocupan aproximadamente 1,1 GB; en FP16 aproximadamente 0,56 GB, a lo que hay que sumar activaciones y buffers de las dos cámaras de 256x256.
- GPU recomendadas: no disponible. El comando de entrenamiento documentado usa `--policy.device=cuda`, sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño de parámetros es plausible en GPUs de consumo con suficiente VRAM, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Diffusion Policy, LeRobot) | Política de difusión para manipulación | 278.014.919 | no aplica | Apache 2.0 | Hugging Face Hub |
| ACT (Action Chunking Transformer, LeRobot) | Política determinista de imitación | no disponible | no aplica | no disponible | Implementado en LeRobot |
| Otras políticas Diffusion Policy en LeRobot | Políticas de difusión | variable | no aplica | variable | Hugging Face Hub |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Específico de tarea: solo se entrenó para "Insert the first piece into the base, then insert the second piece on top of it"; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sin evaluación publicada: no hay tasas de éxito ni validación en robot real, por lo que su fiabilidad en producción es desconocida.
- Ambigüedad de robot: la model card indica `panda`, pero el nombre del repositorio menciona `UR5e`; conviene verificar la plataforma antes de desplegar.
- Dependencia de las cámaras: los nombres y la configuración de las cámaras deben coincidir exactamente con las claves de observación (`agentview`, `robot0_eye_in_hand`); un cambio de montaje o calibración degrada el comportamiento.
- Sensibilidad al dominio visual: cambios de iluminación, posiciones de objetos o distractores pueden reducir el rendimiento, como es habitual en políticas de imitación entrenadas con 220 episodios.
- Dataset pequeño: 73.864 fotogramas a 20 FPS limitan la diversidad de escenarios cubiertos.
- Sin capacidades de lenguaje, razonamiento simbólico ni tool calling: no debe emplearse fuera del ámbito de control robótico.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el usuario asume el riesgo de despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castanetnicolas/diffusion_UR5e_BS_32_H_16_TASK_three_piece_assembly_crop232_ID_q3_164926
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image256
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
