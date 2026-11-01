# LeeJun12/act_pick-cube-2cam

## Resumen

`LeeJun12/act_pick-cube-2cam` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), una técnica de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. El modelo lo publica el usuario LeeJun12 en HuggingFace Hub mediante la librería LeRobot de HuggingFace, y está especializado en una única tarea manipulativa: coger un cubo y depositarlo en una caja.

La política consume observaciones multimodales compuestas por el estado propioceptivo del robot (6 dimensiones) y dos cámaras RGB de 480x640 píxeles (muñeca y cenital), y produce comandos de acción de 6 dimensiones. Con 51.668.614 parámetros, es un modelo compacto pensado para ejecutarse en tiempo real sobre robots de bajo coste del ecosistema SO-100/SO-101 (tipo `so_follower`).

Es relevante como ejemplo práctico del flujo completo de LeRobot: grabación de datos teleoperados, entrenamiento de una política ACT y despliegue en hardware real. No obstante, se trata de un modelo de nicho con solo 36 descargas, sin resultados de evaluación publicados y entrenado sobre un dataset muy reducido (50 episodios), por lo que su utilidad es demostrativa más que productiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; LeRobot no documenta cuantización para este checkpoint) |
| Idiomas soportados | no disponible (no procesa lenguaje; la instrucción de tarea es una cadena fija) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador visual y un transformer que predice secuencias de acciones (chunks) en lugar de acciones individuales paso a paso. Esta formulación reduce el error de compounding y mejora la estabilidad en tareas de manipulación de precisión. El modelo recibe dos flujos de imagen (cámara de muñeca y cámara cenital) junto con el estado del robot y emite un vector de acción de 6 dimensiones, típicamente correspondiente a los grados de libertad del seguidor SO.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `LeeJun12/pick-cube-2cam_20261028_193431`, compuesto por 50 episodios y 15.000 fotogramas a 30 FPS (aproximadamente 500 segundos de datos). Se ejecutaron 50.000 pasos con batch size 8, optimizador AdamW y learning rate 1e-05, con semilla 1000. La tarea única es "Pick up the cube and put it in the box". No se documenta uso de RLHF, DPO ni aumentos de datos; es aprendizaje por imitación supervisado puro sobre teleoperación.

## Capacidades

- Manipulación robótica de una sola tarea: coger un cubo y colocarlo en una caja.
- Percepción visual multimodal con dos cámaras RGB (muñeca y cenital) a 480x640.
- Fusión de estado propioceptivo (6 dimensiones) con observaciones visuales.
- Predicción de chunks de acción para control continuo a 30 FPS.
- Ejecución en robots del tipo `so_follower` del ecosistema LeRobot.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades de lenguaje, visión general, audio ni matemáticas.
- No es un modelo multilingüe ni procesa instrucciones en lenguaje natural más allá de la cadena de tarea fija.

## Casos de uso

- Demostración educativa de aprendizaje por imitación: sirve para ilustrar el pipeline completo de LeRobot (grabación, entrenamiento, rollout) en cursos y tutoriales de robótica.
- Prototipado de pick-and-place en laboratorio: permite validar la cadena hardware-software con un robot SO-100/SO-101 antes de invertir en datasets mayores.
- Reproducción de experimentos ACT: como checkpoint de referencia para comparar hiperparámetros (pasos, batch, learning rate) en tareas de manipulación simples.
- Base para fine-tuning: el checkpoint puede reentrenarse con `lerobot-train` sobre datasets propios de pick-and-place para adaptarlo a nuevas posiciones de objeto o iluminación.
- Benchmark interno de latencia: al ser un modelo de 51,7 M de parámetros, sirve para medir throughput de inferencia en GPUs consumer y comparar con políticas más grandes.
- Validación de calibración de cámaras: al depender de dos vistas concretas (`wrist` y `overhead`), es útil para verificar el pipeline de calibración y sincronización de cámaras en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tasas de éxito en robot real ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (51,7 M de parámetros, ~207 MB de pesos) más el coste de los dos flujos de imagen; en la práctica, menos de 2 GB con overhead de framework.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput estimados: no disponibles; dependen del robot, las cámaras y la GPU. La política está pensada para control a 30 FPS, por lo que la inferencia debe completarse en menos de 33 ms por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeeJun12/act_pick-cube-2cam | 51,7 M | Pick-and-place (cubo) | no disponible | apache-2.0 | HuggingFace Hub |
| Políticas ACT de referencia en LeRobot | ~50 M (típico) | Manipulación genérica | no disponible | apache-2.0 | HuggingFace Hub |
| Diffusion Policy (referencia LeRobot) | variable | Manipulación | no disponible | apache-2.0 | HuggingFace Hub |
| π0 (Physical Intelligence) | no disponible | Manipulación generalista | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables publicados para este checkpoint, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo está entrenado sobre un único dataset de 50 episodios, por lo que hereda los sesgos de posición, iluminación y configuración de cámara de esas grabaciones.
- Riesgo de sobreajuste: con 15.000 fotogramas y 50.000 pasos de entrenamiento, es probable que la política generalice mal a nuevas posiciones del cubo, distractores o cambios de iluminación.
- Sin evaluación publicada: no hay tasas de éxito en robot real, lo que impide estimar su fiabilidad en producción.
- Dependencia de hardware concreto: requiere un robot `so_follower` y dos cámaras con nombres `wrist` y `overhead`; no es portable a otras configuraciones sin reentrenamiento.
- Limitación de tarea: solo ejecuta "Pick up the cube and put it in the box"; no acepta instrucciones nuevas en lenguaje natural.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Caveat para producción: al ser un checkpoint de nicho con 36 descargas y sin mantenimiento documentado, no se recomienda su uso directo en entornos productivos sin validación exhaustiva.

## Enlaces

- HuggingFace: https://huggingface.co/LeeJun12/act_pick-cube-2cam
- Dataset de entrenamiento: https://huggingface.co/datasets/LeeJun12/pick-cube-2cam_20261028_193431
- Paper ACT: https://huggingface.co/papers/2304.13705
- Guía LeRobot ACT: https://huggingface.co/docs/lerobot/main/en/act
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=LeeJun12/pick-cube-2cam_20261028_193431
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
