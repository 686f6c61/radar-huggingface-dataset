# sadafnezam/pusht_act_policy0

## Resumen

`sadafnezam/pusht_act_policy0` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo ha sido entrenado con LeRobot sobre el dataset `lerobot/pusht`, una tarea de manipulación 2D en la que un efector debe empujar un bloque con forma de T hasta una diana con la misma forma. El autor es el usuario de Hugging Face `sadafnezam` y el repositorio se publicó en noviembre de 2026.

El modelo no es un LLM ni un modelo de lenguaje: es una política visomotora que consume una imagen de 96x96 píxeles y un vector de estado de 2 dimensiones, y produce una acción continua de 2 dimensiones. Con 51.660.418 parámetros y un tamaño de repositorio de 0,2 GB en formato safetensors, está pensado para ejecutarse en un bucle de control robótico a 10 FPS, la frecuencia del dataset de entrenamiento.

Su relevancia es fundamentalmente didáctica y de referencia: sirve como ejemplo mínimo reproducible de un pipeline completo de imitación con LeRobot (grabación de datos, entrenamiento con ACT, despliegue con `lerobot-rollout`). No obstante, el entrenamiento es muy corto (1000 pasos, batch de 8) y no se han publicado resultados de evaluación en robot real, por lo que no debe considerarse una política lista para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.660.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (política de control; ventana de observación de un frame) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice *chunks* de acciones (secuencias cortas de comandos) en lugar de una única acción por paso. La arquitectura combina un codificador de imagen (la observación es una imagen RGB de 3x96x96) con un codificador del estado proprioceptivo (vector de 2 dimensiones) y un decodificador que genera acciones de 2 dimensiones. La predicción por chunks mitiga el problema de la varianza temporal en datos de teleoperación y reduce el error de composición acumulado, una de las innovaciones centrales del paper arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `lerobot/pusht`: 206 episodios, 25.650 frames a 10 FPS, con la tarea "Push the T-shaped block onto the T-shaped target". La configuración es deliberadamente ligera: 1000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni ningún refinamiento posterior; es aprendizaje supervisado puro a partir de demostraciones teleoperadas.

## Capacidades

- Control visomotor de un efector en una tarea de empuje 2D: mapea imagen y estado a comandos de acción continuos de 2 dimensiones.
- Predicción de chunks de acción, lo que permite ejecutar secuencias cortas de movimiento coherentes sin replanificar en cada frame.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (no requiere recompensa ni entorno simulado).
- Integración con el ecosistema LeRobot: entrenamiento, rollout e inferencia mediante CLI (`lerobot-train`, `lerobot-rollout`).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo de razonamiento explícito, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de un pipeline mínimo de imitación: usar este repositorio como plantilla para entrenar y desplegar una política ACT sobre un robot propio, sustituyendo el dataset por grabaciones propias y ajustando la configuración de entrenamiento.
- Docencia y formación en robótica: sirve para ilustrar el ciclo completo de LeRobot (instalación, calibración de hardware, grabación, entrenamiento y rollout) con un coste computacional reducido.
- Pruebas de integración de hardware: validar que la cadena de cámaras, puerto del robot y claves de observación (`observation.image`, `observation.state`) están correctamente configuradas antes de entrenar una política específica.
- Benchmark interno de infraestructura: medir latencia de inferencia y throughput de un transformer de ~52 M de parámetros en el hardware objetivo (CPU, GPU de consumo o embebido).
- Prototipado de tareas de empuje 2D: experimentar con variaciones de la tarea Push-T (posiciones iniciales, iluminación, distractores) para estudiar la robustez de ACT ante cambios de distribución.
- Base para comparativas de métodos de imitación: contrastar ACT con alternativas como Diffusion Policy o VQ-BeT sobre el mismo dataset y la misma infraestructura LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", y no incluye tabla de éxito en robot real ni comparación con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para 51,66 M de parámetros; en la práctica, unos pocos cientos de MB incluyendo buffers de imagen.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo está sobredimensionado para ellas.
- Cabe en GPU de consumo e incluso en CPU: es viable ejecutar la inferencia en CPU para un bucle de control a 10 FPS, aunque se recomienda GPU para reducir latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La frecuencia de control del dataset es de 10 FPS, lo que fija un presupuesto de 100 ms por paso; no se han publicado mediciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sadafnezam/pusht_act_policy0` | 51,66 M | Imagen 96x96 + estado 2D | Push-T (ACT) | no disponible | Hugging Face, LeRobot |
| ACT original (paper arXiv:2304.13705) | no disponible en la informacion | Imagen + estado | Manipulación diversa | no disponible | Código en el repositorio del paper |
| Diffusion Policy | no disponible en la informacion | Imagen + estado | Manipulación diversa | no disponible | Implementaciones públicas |
| VQ-BeT | no disponible en la informacion | Imagen + estado | Manipulación diversa | no disponible | Implementaciones públicas |

La comparación cuantitativa con estas alternativas no está disponible: no se han publicado métricas de éxito ni de rendimiento para esta política concreta, y las alternativas citadas no forman parte de la información proporcionada.

## Limitaciones y advertencias

- Sin evaluación publicada: no hay evidencia de tasa de éxito en robot real; el entrenamiento de 1000 pasos con batch 8 es muy corto y probablemente insuficiente para una política robusta.
- Licencia no especificada: la model card marca la licencia como "More Information Needed", por lo que el uso comercial queda en un limbo legal hasta que el autor la defina.
- Tipo de robot desconocido: el campo `Robot type` es `unknown`, lo que impide saber si la política es transferible a un hardware concreto sin recalibración.
- Dependencia de las claves de observación: el modelo espera exactamente `observation.image` (3x96x96) y `observation.state` (2,); cualquier cambio en la resolución, el número de cámaras o la dimensionalidad del estado invalida la inferencia.
- Sesgo de dominio: entrenado exclusivamente sobre `lerobot/pusht` (206 episodios, una sola tarea), por lo que no generaliza a otras tareas, objetos ni entornos.
- Riesgo de sobreajuste y alucinación de acciones: al ser una política de imitación con pocos datos, puede producir acciones erráticas fuera de la distribución de estados visitados durante el entrenamiento.
- Sin soporte de lenguaje: no debe emplearse para tareas de generación de texto, razonamiento, código ni atención al cliente; su ámbito es exclusivamente el control robótico.
- Frecuencia de control fija: el dataset está a 10 FPS; ejecutar el bucle a otra frecuencia puede degradar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadafnezam/pusht_act_policy0
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/pusht
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/pusht
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
