# nhmacwan/fanpose_take_card_dagger_act

## Resumen

`nhmacwan/fanpose_take_card_dagger_act` es una política de imitación (imitation learning) para robótica entrenada con el método Action Chunking with Transformers (ACT), publicado originalmente en el artículo arXiv 2304.13705. El modelo ha sido entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica. Su propósito es controlar un robot manipulador a partir de observaciones visuales, prediciendo secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad del control.

El modelo tiene 51.629.708 parámetros (aproximadamente 51,6 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 0,2 GB, lo que lo hace muy ligero y apto para inferencia en hardware de consumo. Está entrenado sobre el dataset `nhmacwan/lerobot_fanpose_take_card_dagger`, un conjunto de datos de teleoperación específico para la tarea de "tomar una carta" (take card) con una configuración de robot con cámara.

Es relevante ahora porque ejemplifica el flujo completo de LeRobot para entrenar políticas ACT de forma reproducible y desplegable, con licencia Apache 2.0 y sin dependencias de infraestructura propietaria. No obstante, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a una tarea y un robot concretos, no a propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.629.708 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que combina un codificador visual (típicamente un backbone tipo ResNet) con un transformer que predice un chunk de acciones futuras de longitud fija. La innovación principal frente a políticas paso a paso es la predicción de secuencias de acciones, lo que mitiga el error compuesto y permite un control más suave. El modelo se entrena con datos de teleoperación, es decir, pares de observaciones (imágenes de cámara) y acciones del operador humano, mediante aprendizaje supervisado con pérdida de regresión sobre las acciones.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; en el contexto de ACT, el entrenamiento es puramente de imitación supervisada. El dataset asociado, `nhmacwan/lerobot_fanpose_take_card_dagger`, sugiere una tarea de manipulación con cámara ("fanpose") y posiblemente recogida con intervención humana (dagger), aunque no se confirma en la información disponible.

## Capacidades

- Control robótico de manipulación: predice chunks de acciones a partir de observaciones visuales para ejecutar la tarea de tomar una carta.
- Aprendizaje por imitación: reproduce comportamientos demostrados por teleoperación.
- Inferencia en tiempo real: el tamaño reducido (51,6 M de parámetros) permite ejecución en GPU de consumo.
- Integración con LeRobot: entrenamiento, evaluación y despliegue mediante los comandos `lerobot-train` y `lerobot-record`.
- No soporta tool calling, function calling ni razonamiento multi-step en el sentido de los LLM.
- No es un modelo multilingüe ni de propósito general; su ámbito es exclusivamente la política robótica entrenada.
- No se documentan capacidades de visión general, audio ni thinking mode más allá del codificador visual para la tarea.

## Casos de uso

- Automatización de la tarea "take card": el modelo ejecuta la política aprendida para que un robot manipulador recoja una carta en un entorno controlado, usando las observaciones de cámara del dataset de entrenamiento.
- Prototipado rápido de políticas con LeRobot: sirve como plantilla para entrenar políticas ACT sobre nuevos datasets de teleoperación, ya que el flujo de entrenamiento está documentado en la model card.
- Evaluación de pipelines de imitación: permite validar el ciclo completo de `lerobot-record` con `--policy.path` apuntando a este checkpoint, útil para comparar configuraciones de robot y dataset.
- Investigación en aprendizaje por imitación: modelo ligero para experimentar con variantes de ACT, aumentación de datos o cambios en el backbone visual sin grandes costes de cómputo.
- Despliegue en robot de bajo coste: al ocupar 0,2 GB y tener 51,6 M de parámetros, puede ejecutarse en GPUs de consumo como una RTX 3060 o incluso en CPU para pruebas lentas.
- Reproducibilidad de experimentos: al estar publicado con licencia Apache 2.0 y pesos safetensors, facilita la replicación de resultados en entornos académicos.
- Base para fine-tuning en tareas similares: puede servir como inicialización para otras tareas de manipulación con el mismo robot y configuración de cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (51,6 M de parámetros, ~0,2 GB de pesos); con overhead de activaciones y codificador visual, se estima entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna de consumo, e incluso en CPU para inferencia no crítica en tiempo real.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerá del hardware y de la frecuencia de control del robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nhmacwan/fanpose_take_card_dagger_act` | 51,6 M | no disponible | Manipulación "take card" con ACT | Apache 2.0 | Hugging Face (LeRobot) |
| Políticas ACT genéricas de LeRobot | variable | no disponible | Imitación robótica | Apache 2.0 | Hugging Face |
| Diffusion Policy (referencia) | variable | no disponible | Imitación robótica | según implementación | Repositorios académicos |
| RT-1 / RT-2 (referencia) | cientos de M a miles de M | no disponible | Robótica generalista | propietaria / restrictiva | No público en la mayoría de casos |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho: entrenado para una tarea y un robot concretos; no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sesgos: los derivados de los datos de teleoperación del autor, no documentados; pueden incluir sesgos de posición, iluminación o configuración de cámara.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no es un modelo de lenguaje; no procesa texto ni múltiples idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Caveats para producción: cero descargas y cero likes en el momento de la consulta; no hay validación externa ni benchmarks publicados, por lo que su fiabilidad en entornos reales no está contrastada.
- Seguridad física: al controlar un robot, deben implementarse límites de seguridad y supervisión humana, especialmente en entornos compartidos.

## Enlaces

- Hugging Face: https://huggingface.co/nhmacwan/fanpose_take_card_dagger_act
- Dataset asociado: https://huggingface.co/datasets/nhmacwan/lerobot_fanpose_take_card_dagger
- Paper ACT: https://huggingface.co/papers/2304.13705
- arXiv ACT: https://arxiv.org/abs/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
