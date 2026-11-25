# escapebirdy/dvrk_rope_cam012_baseframe_policy

## Resumen

`escapebirdy/dvrk_rope_cam012_baseframe_policy` es una política de control visuomotor entrenada con LeRobot y basada en Diffusion Policy, el método presentado en el paper arXiv:2303.04137. No es un modelo de lenguaje: es un modelo de robótica que trata el control motor como un proceso generativo de difusión, produciendo trayectorias de acción multimodales y suaves a partir de observaciones visuales. El autor es el usuario de Hugging Face `escapebirdy` y el modelo se ha entrenado sobre el dataset `escapebirdy/dvrk_rope_cam012_baseframe`, que por el nombre sugiere un montaje quirúrgico dVRK (da Vinci Research Kit) con manipulación de cuerda y cámaras 0, 1 y 2 en un marco de referencia base.

El modelo tiene 426.609.994 parámetros (dato real extraído de los pesos en safetensors) y un repositorio de 1,7 GB. La licencia es Apache 2.0, lo que permite uso comercial y modificación. Es relevante para quien trabaje en imitación robótica de manipulación con contacto, especialmente en el ámbito quirúrgico o de investigación con brazos dVRK, porque Diffusion Policy es una referencia consolidada para tareas de manipulación ricas en contacto donde los enfoques deterministas tienden a promediar acciones y fallar.

El modelo es de publicación reciente (creado el 25 de noviembre de 2026) y no registra descargas ni likes, por lo que debe considerarse un checkpoint de investigación sin validación comunitaria. No hay información sobre idiomas ni sobre evaluación comparativa publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusión para control visuomotor), implementado en LeRobot |
| Parámetros totales | 426.609.994 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de robótica; la ventana de observación depende de la configuración de entrenamiento, no documentada) |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la formulación de Diffusion Policy: en lugar de mapear directamente observación a acción, aprende la distribución de trayectorias de acción mediante un proceso de difusión (ruido añadido y eliminado iterativamente) condicionado por las observaciones visuales y el estado del robot. Esto permite generar secuencias de acciones multimodales y temporalmente coherentes, lo que resulta ventajoso en manipulación con contacto. Los detalles concretos de la red (tipo de backbone visual, número de pasos de difusión, horizonte de predicción, dimensión del espacio de acciones) no se documentan en la model card.

El entrenamiento se realizó con LeRobot sobre el dataset `escapebirdy/dvrk_rope_cam012_baseframe`, presumiblemente demostraciones teleoperadas en un entorno dVRK con tres cámaras. No se especifica el número de episodios, el número de tokens o muestras, ni si se aplicó algún tipo de regularización o aumento de datos. La model card incluye comandos genéricos de LeRobot para entrenamiento e inferencia, pero el ejemplo de entrenamiento usa `--policy.type=act`, lo que es un descuido de la plantilla: el modelo publicado es de tipo diffusion, no ACT.

## Capacidades

- Generación de trayectorias de acción multimodales para control visuomotor de robots manipuladores.
- Manipulación con contacto: la formulación de difusión evita el promediado de acciones típico de políticas deterministas.
- Condicionamiento por observaciones visuales de múltiples cámaras (según el nombre del dataset, cámaras 0, 1 y 2).
- Ejecución de políticas de imitación entrenadas sobre demostraciones teleoperadas.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No soporta tool calling, agentes conversacionales ni generación de texto: no es un modelo de lenguaje.
- Capacidades multilingües no aplicables.

## Casos de uso

- Investigación en manipulación quirúrgica con dVRK: el modelo se puede evaluar en tareas de sutura o manejo de hilo donde la política de difusión genera trayectorias suaves y multimodales, adecuadas para contacto continuo.
- Reproducción de experimentos de Diffusion Policy: sirve como checkpoint de referencia para comparar variantes de arquitectura o de dataset en un montaje concreto de tres cámaras.
- Aprendizaje por imitación con LeRobot: se puede reentrenar o afinar con `lerobot-train` sobre nuevos datasets de demostraciones, usando el repositorio como punto de partida.
- Evaluación de robustez visual: al condicionarse con varias cámaras, permite estudiar cómo afectan oclusiones o cambios de iluminación en el marco base.
- Despliegue en laboratorio con un robot de investigación: se puede ejecutar con `lerobot-record` contra un seguidor tipo SO-100 u otro robot compatible, siempre que el espacio de acciones coincida con el del entrenamiento.
- Generación de datos sintéticos de trayectorias: las muestras de la difusión pueden analizarse para estudiar la distribución de acciones aprendida en tareas de manipulación de cuerdas.
- Docencia en robótica de imitación: ejemplo práctico de pipeline completo (dataset, entrenamiento, evaluación) con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 426,6 M de parámetros, los pesos en FP32 ocupan aproximadamente 1,7 GB; en FP16, unos 0,85 GB. La VRAM total dependerá del backbone visual y del número de pasos de difusión, no documentados; una estimación conservadora sitúa la inferencia por debajo de 4-6 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia; para entrenamiento, se recomienda una RTX 3090/4090 (24 GB) o una A100/H100 si se aumenta el tamaño de lote o la resolución de imagen.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-eval`) es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La latencia vendrá dominada por el número de pasos de difusión y la frecuencia de control del robot, que no se especifican.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| escapebirdy/dvrk_rope_cam012_baseframe_policy | Diffusion Policy (LeRobot) | 426,6 M | no disponible | Apache 2.0 | Hugging Face |
| Diffusion Policy original (Chi et al., 2023) | Diffusion Policy | no disponible | no disponible | código de referencia (MIT en el repositorio original) | Repositorio y paper |
| ACT (Action Chunking Transformer, LeRobot) | Transformer de imitación | depende de la configuración | no disponible | Apache 2.0 (LeRobot) | Hugging Face / LeRobot |
| Políticas LeRobot de la comunidad (p. ej. `lerobot/diffusion_pusht`) | Diffusion Policy | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible porque este checkpoint no publica métricas. Frente a ACT, Diffusion Policy suele destacar en tareas con contacto y multimodalidad de acciones, mientras que ACT es más ligera y rápida de entrenar. La ventaja principal de este modelo es su licencia permisiva y su integración directa con LeRobot; su desventaja es la ausencia de evaluación publicada y de documentación del entorno de entrenamiento.

## Limitaciones y advertencias

- No hay benchmarks ni métricas de éxito publicadas; el rendimiento real en el robot es desconocido.
- El modelo está entrenado para un montaje específico (dVRK, cámaras 0-2, marco base, manipulación de cuerda); no generaliza a otros robots, cámaras o tareas sin reentrenamiento.
- La model card es una plantilla genérica de LeRobot y contiene un ejemplo de entrenamiento con `--policy.type=act`, lo que puede confundir sobre la arquitectura real (diffusion).
- No se documentan sesgos, pero al ser un modelo de robótica los riesgos son de seguridad física: validar siempre en entorno controlado antes de operar cerca de personas.
- Riesgo de alucinación no aplica en el sentido lingüístico, pero sí de acciones erráticas fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin descargas ni validación comunitaria: tratar como checkpoint experimental.
- No se especifican requisitos de versión de LeRobot ni compatibilidad con versiones futuras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/escapebirdy/dvrk_rope_cam012_baseframe_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/escapebirdy/dvrk_rope_cam012_baseframe
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
