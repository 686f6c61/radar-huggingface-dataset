# muacha/my_overfit_act_policy

## Resumen

`muacha/my_overfit_act_policy` es un modelo de robótica basado en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por el usuario `muacha` y entrenado con el framework LeRobot de Hugging Face, sobre un dataset propio de manipulación de tarros de cristal. El modelo está diseñado para controlar un robot manipulador a partir de observaciones visuales (tres cámaras) y del estado de las articulaciones, generando comandos de acción de 7 dimensiones.

Con 51,67 millones de parámetros, es un modelo compacto pensado para ejecutarse en tiempo real en hardware de gama media. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, y en que aborda una tarea concreta de manipulación (recoger tarros y colocarlos en un contenedor) con un dataset reducido de 22 episodios. No se han publicado resultados de evaluación en el repositorio, por lo que su rendimiento real en el robot no está documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un transformer con un autoencoder variacional condicional (CVAE). El modelo recibe observaciones multimodales —imágenes RGB de tres cámaras (base, muñeca izquierda y muñeca derecha) y un vector de estado de 7 dimensiones— y produce un chunk de acciones de 7 dimensiones. La arquitectura está diseñada para capturar la distribución multimodal de las demostraciones humanas teleoperadas, lo que permite generar comportamientos robustos ante variaciones en el entorno.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.0) sobre el dataset `muacha/glass_uncap_comp_mapped_final`, que contiene 22 episodios y 8.738 fotogramas a 15 FPS, con dos tareas relacionadas con recoger y colocar tarros de cristal. Se ejecutaron 100.000 pasos de entrenamiento con un batch size de 8, optimizador AdamW, learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; el entrenamiento es puramente de imitación supervisada.

## Capacidades

- Control de robot manipulador: genera comandos de acción de 7 dimensiones (posición y orientación del efector final, probablemente) a partir de observaciones visuales y de estado.
- Manipulación de objetos: entrenado específicamente para tareas de pick-and-place de tarros de cristal en un contenedor.
- Procesamiento multimodal: integra tres flujos de imagen (cámara base y dos cámaras de muñeca) junto con el estado de las articulaciones.
- Generación de chunks de acción: predice secuencias de acciones en lugar de pasos individuales, lo que mejora la estabilidad del movimiento.
- Ejecución en tiempo real: al ser un modelo compacto, es adecuado para inferencia en bucle de control con latencia baja.
- No soporta tool calling, agentes, razonamiento simbólico ni capacidades multilingües, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de líneas de empaquetado: el modelo puede integrarse en un robot industrial para recoger objetos (tarros, piezas) y colocarlos en contenedores, reduciendo la intervención humana en tareas repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del tamaño del dataset, el número de cámaras o la configuración de ACT en tareas de manipulación.
- Desarrollo de políticas robóticas con LeRobot: el repositorio incluye los comandos de entrenamiento y despliegue, lo que permite reproducir el flujo completo con otros robots o datasets.
- Prototipado rápido en robótica asistida: al ser un modelo pequeño, puede ejecutarse en GPU de consumo para validar conceptos de control antes de escalar a modelos más grandes.
- Benchmarking de métodos de imitación: comparar ACT con Diffusion Policy u otros métodos sobre el mismo dataset y hardware.
- Educación en robótica: el modelo y su documentación sirven como ejemplo didáctico de cómo entrenar y desplegar una política de manipulación con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas como tasa de éxito, precisión de agarre ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 51,67 millones de parámetros y entradas de imagen de 224x224 y 180x320, se estima que la inferencia requiere menos de 2 GB de VRAM en FP32, y menos de 1 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que se integran con robots reales. También es posible exportar el modelo a otros formatos si se requiere, aunque no se documenta.
- Latencia y throughput: no se proporcionan datos, pero al ser un modelo compacto, se espera una latencia de inferencia inferior a 10 ms en GPU moderna, adecuada para control en tiempo real a 15 FPS.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. El modelo es una implementación estándar de ACT entrenada con LeRobot, por lo que es comparable en arquitectura a otros modelos ACT publicados en Hugging Face (por ejemplo, los oficiales de LeRobot). Sin embargo, no se han publicado resultados de rendimiento que permitan una comparación objetiva. Se puede mencionar que ACT es una alternativa a Diffusion Policy, otro método popular de aprendizaje por imitación, pero no hay datos de este modelo concreto para comparar.

## Limitaciones y advertencias

- Dataset muy reducido: solo 22 episodios, lo que aumenta el riesgo de sobreajuste (el nombre del modelo, "overfit", sugiere que el autor es consciente de ello). El rendimiento en condiciones no vistas (nuevas posiciones, iluminación, objetos) puede ser pobre.
- Sin evaluación publicada: no hay resultados de éxito en robot real, por lo que no se puede garantizar su funcionamiento en producción.
- Tareas específicas: el modelo está entrenado únicamente para las dos tareas descritas (recoger tarros y colocarlos en contenedor). No generaliza a otras tareas sin reentrenamiento.
- Dependencia de cámaras: requiere las tres cámaras con las mismas posiciones y calibración que en el entrenamiento. Cambios en la configuración de las cámaras invalidan el modelo.
- Sin soporte de idiomas ni interacción textual: no es un modelo de lenguaje, por lo que no puede procesar instrucciones en texto ni mantener conversaciones.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento ni soporte.
- Posible sobreajuste: el nombre del repositorio y el alto número de pasos de entrenamiento (100.000) con un dataset pequeño sugieren que el modelo puede haber memorizado las demostraciones en lugar de generalizar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/muacha/my_overfit_act_policy
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arxiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/muacha/glass_uncap_comp_mapped_final
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=muacha/glass_uncap_comp_mapped_final
