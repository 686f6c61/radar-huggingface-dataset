# Schmidie/dpds5-groot17-out5-r20260819

## Resumen

`Schmidie/dpds5-groot17-out5-r20260819` es un finetune del modelo de robótica de código abierto `nvidia/GR00T-N1.7-3B`, desarrollado por Schmidie sobre el robot de bajo coste SO-100 (SO-100). El modelo base de NVIDIA, GR00T N1.7, es un modelo fundacional cross-embodiment que combina un backbone multimodal (Cosmos-Reason2/Qwen3-VL) con un action transformer basado en flow-matching para predecir acciones robóticas a partir de visión, lenguaje y propiocepción. Este finetune adapta esa base para controlar un brazo articulado real, con acciones relativas del brazo y apertura absoluta del gripper, usando dos cámaras (frontal y de muñeca).

La relevancia de este checkpoint reside en que el autor reporta que con solo 8.500 pasos de entrenamiento (0,53 épocas) se consigue un comportamiento en hardware real que supera a todos los intentos anteriores, mientras que un experimento comparativo con un dataset depurado necesitó 6,5 épocas (doce veces más). El modelo se distribuye con licencia Apache 2.0, pesa 27,8 GB en formato safetensors y está pensado para su ejecución en un servidor que comanda el robot vía red. Es un ejemplo práctico de cómo ajustar un modelo fundacional de robótica con pocos datos y hardware accesible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7-3B (backbone Cosmos-Reason2/Qwen3-VL + action transformer con flow-matching) |
| Parámetros totales | 3B (según nombre del modelo base, no confirmado en la ficha) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (en robótica no se usa contexto de texto estándar; la ventana de acción es de 40 pasos) |
| Tipos de cuantización | no disponible (repo en bf16 safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el backbone Qwen3-VL es multilingüe, pero no se documenta el idioma de entrada del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un finetune de `nvidia/GR00T-N1.7-3B`, que combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) con un action transformer que predice acciones de forma autoregresiva mediante flow matching, condicionado a observaciones multimodales (imágenes de cámara, lenguaje y propiocepción). El finetune se realizó sobre datos de demostración del robot SO-100, con una configuración de entrenamiento documentada en `EINSTELLUNGEN.json`: 8.500 pasos (0,53 épocas), batch 64 sin acumulación, learning rate 1e-4 con cosine decay y warmup 0,05, weight decay 1e-5, precisión bf16 y seed 42. Se usó `state_dropout_prob` de 0,2 y un `action_horizon` de 40 pasos. La política predice acciones del brazo en formato relativo y apertura del gripper en absoluto, con observación de dos cámaras (`front` y `wrist`). La pérdida descendió de 1,1203 a 0,0238.

El punto técnico notable es que 0,53 épocas fueron suficientes para obtener un comportamiento mejor en el robot real que un entrenamiento con dataset depurado y 6,5 épocas. La configuración de modalidad original (`out5_config.py`) se perdió y se reconstruyó a partir de `processor_config.json`, lo que permite reproducir el entrenamiento aunque falte el archivo original. El checkpoint `checkpoint-8500` es el que el autor considera mejor en pruebas reales.

## Capacidades

- Control robótico de un solo brazo (SO-100) con acciones relativas del brazo y apertura absoluta del gripper.
- Observación multimodal: imágenes de cámara frontal y de muñeca, junto con propiocepción del robot.
- Generación de acciones de control de 40 pasos de horizonte (action horizon) para movimientos continuos.
- Ejecución en hardware real con latencia de servidor de 150 ms y RTT total de 825 ms (túnel Pi→Mac→Pod).
- Adaptación a un robot concreto (SO-100) mediante aprendizaje por imitación (behavior cloning).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni generación de texto; el modelo es específicamente una política de control robótico.

## Casos de uso

- Tareas de manipulación de precisión con brazo de bajo coste: el modelo puede ejecutar tareas de recoger y colocar, apilar o insertar piezas en un entorno SO-100, gracias a su ventana de acción de 40 pasos y al control del gripper con apertura absoluta.
- Investigación en aprendizaje por imitación: sirve como ejemplo de finetune eficiente de GR00T N1.7 con pocos datos (0,53 épocas), útil para experimentos de data efficiency en robótica.
- Evaluación de políticas robóticas en hardware real: el checkpoint-8500 se ha validado en un robot físico y se ha comparado con otros checkpoints, permitiendo estudiar la relación entre épocas de entrenamiento y rendimiento en el mundo real.
- Desarrollo de sistemas de teleoperación con latencia moderada: la latencia de servidor de 150 ms y RTT de 825 ms documenta el comportamiento en un setup de red con túnel, útil para despliegues de control remoto.
- Reproducción de experimentos de finetune de GR00T: la configuración reconstruida en `EINSTELLUNGEN.json` permite reproducir el entrenamiento y comparar con otros datasets o configuraciones.
- Estudio de la influencia de la observación multimodal: al usar dos cámaras (frontal y de muñeca), se puede analizar cómo afecta la información visual a la calidad de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de robótica y no de lenguaje general. En su lugar, el autor reporta métricas de rendimiento en el robot real:

| Métrica | Valor |
|---|---|
| Apertura del gripper en movimiento | −146,7 … −100,7 (46 grados de rango) |
| Apertura del gripper en reposo (check) | 2,3 grados |
| Latencias de servidor | 150 ms |
| Latencia total RTT (túnel Pi→Mac→Pod) | 825 ms |
| Loss final de entrenamiento | 0,0238 |

Estas métricas se obtuvieron en una prueba real con el robot SO-100 el 19.08.2026, y el autor indica que el checkpoint-8500 fue el mejor evaluado en esa prueba.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 3B parámetros, en bf16 ocupa aproximadamente 6 GB de memoria de modelo; el repo completo pesa 27,8 GB, lo que sugiere que incluye pesos adicionales o checkpoints múltiples. Para inferencia en bf16 se estima una VRAM de al menos 8-12 GB.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (p.ej. RTX 3080/3090, RTX 4090) es suficiente para ejecutar el modelo en bf16. Para entrenamiento, se necesitaría una GPU con 24 GB o más (p.ej. A10G, A100 40GB) según el batch de 64 y la resolución de las cámaras.
- Se puede ejecutar en una consumer GPU (RTX 3090/4090) para inferencia con cuantización, aunque no se documentan cuantizaciones disponibles.
- Despliegue: no se mencionan herramientas específicas como vLLM, llama.cpp o TGI; el modelo se ejecuta como política robótica en un servidor que comanda el robot, con comunicación de red (latencia de 150 ms). Es probable que use un framework de robótica como LeRobot o similar, pero no se documenta en la ficha.
- Latencia y throughput: en la prueba real se midió latencia de servidor de 150 ms y RTT de 825 ms, lo que es adecuado para control de robot en tiempo casi real.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Entrenamiento | Rendimiento | Licencia |
|---|---|---|---|---|---|
| `Schmidie/dpds5-groot17-out5-r20260819` | GR00T N1.7-3B | 3B | 0,53 épocas, 8.500 pasos | Mejor en robot real (checkpoint-8500) | Apache 2.0 |
| `nvidia/GR00T-N1.7-3B` (modelo base) | - | 3B | Preentrenamiento en grandes datasets | No reportado en esta ficha | Apache 2.0 |
| `physicalairi/so101_1200ep_groot17_20260805` | GR00T N1.7-3B | 3B | 1.200 épocas | No reportado | Apache 2.0 |

No hay datos públicos de benchmarks de otros modelos comparables en la información disponible. La comparativa se limita a la arquitectura base y al tipo de entrenamiento. El modelo de Schmidie destaca por su eficiencia de datos (0,53 épocas vs 1.200 épocas del de physicalairi), pero no se pueden comparar los resultados en el robot sin datos de ambos.

## Limitaciones y advertencias

- El entrenamiento se realizó con solo 0,53 épocas, lo que puede implicar riesgo de underfitting si se aplica a tareas o robots diferentes a los del dataset de entrenamiento.
- Falta el directorio `experiment_cfg/` (conf.yaml, dataset_statistics.json y otros) en los tres checkpoints, lo que impide reproducir exactamente la configuración de entrenamiento y afecta a la trazabilidad del experimento.
- El modelo está ajustado para un robot SO-100 concreto (robot_2); su generalización a otros embotados o entornos no está validada.
- El autor advierte que la medición de la apertura del gripper en reposo (check) no refleja el comportamiento en movimiento, por lo que las métricas estáticas pueden inducir a error.
- No se documentan sesgos o riesgos de alucinación, pero al ser un modelo de robótica, el riesgo principal es la ejecución de acciones no seguras si se despliega sin supervisión o en entornos no controlados.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base de NVIDIA (GR00T N1.7) para uso en producción.
- El tamaño del repositorio (27,2 GB) es elevado para un modelo de 3B, probablemente por incluir múltiples checkpoints o archivos de configuración, lo que puede dificultar el despliegue en entornos con limitaciones de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Schmidie/dpds5-groot17-out5-r20260819
- Modelo base de NVIDIA: https://huggingface.co/nvidia/GR00T-N1.7-3B (no verificado, según el campo `base_model`)
- Dataset de ejemplo del autor: https://huggingface.co/datasets/Schmidie/example_dataset
- Otro finetune de GR00T N1.7: https://huggingface.co/physicalairi/so101_1200ep_groot17_20260805
- Archivo de configuración de entrenamiento (en el repositorio): `EINSTELLUNGEN.json` (no enlazado directamente)
