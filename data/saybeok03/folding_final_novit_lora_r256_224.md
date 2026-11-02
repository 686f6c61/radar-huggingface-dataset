# saybeok03/folding_final_novit_lora_r256_224

## Resumen

`saybeok03/folding_final_novit_lora_r256_224` es una política de visión-lenguaje-acción (VLA) para robótica, obtenida mediante fine-tuning con LoRA del modelo base `lerobot/pi05_base` (π₀.₅ de Physical Intelligence). Está especializada en una única tarea de manipulación: doblar una camiseta correctamente. El modelo consume el estado del robot y tres flujos de cámara (base, muñeca izquierda y muñeca derecha) y emite un vector de acción de 16 dimensiones para un robot bimanual `bi_openarm_follower`.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo de trabajo típico de LeRobot para adaptar un VLA preentrenado a una tarea concreta con pocos datos (50 episodios, 135 351 frames a 30 FPS) usando LoRA de rango 256. Por otro, sirve como caso de estudio de las limitaciones de las políticas de imitación de nicho: sin evaluación publicada, sin métricas de éxito y con una generalización muy restringida al entorno de grabación.

No se dispone de información sobre el número de parámetros del modelo base, la longitud de contexto multimodal ni los idiomas soportados en la información proporcionada. El repositorio ocupa 1,9 GB en formato safetensors y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅ (Pi05), adaptación LeRobot del repositorio OpenPI de Physical Intelligence; fine-tuning con LoRA (r=256) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (el modelo no genera lenguaje libre; recibe una instrucción de tarea en texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 1,9 GB) |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(16,)` |
| `observation.images.left_wrist` | VISUAL | `(3, 224, 224)` |
| `observation.images.right_wrist` | VISUAL | `(3, 224, 224)` |
| `observation.images.base` | VISUAL | `(3, 224, 224)` |
| `action` | ACTION | `(16,)` |

| Parametro de entrenamiento | Valor |
|---|---|
| Modelo base | `lerobot/pi05_base` |
| Dataset | `saybeok03/full_folding_pi05_224` (50 episodios, 135 351 frames, 30 FPS) |
| Tarea | "Fold the T-shirt properly" |
| Pasos de entrenamiento | 5000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 3,75e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.6.1 |
| Tipo de robot | `bi_openarm_follower` |
| Cámaras | `base`, `left_wrist`, `right_wrist` |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del VLA π₀.₅ (Pi05) de Physical Intelligence, implementado en LeRobot a partir del repositorio OpenPI. π₀.₅ es una evolución de π₀ orientada a la generalización en entornos abiertos: combina un backbone de visión-lenguaje con un cabezal de acciones que mapea observaciones multimodales (estado propioceptivo de 16 dimensiones e imágenes RGB de 224×224 de tres cámaras) a un vector de acción de 16 dimensiones. La adaptación concreta de este repositorio emplea LoRA de rango 256 sobre el modelo base, lo que reduce el coste de ajuste y el tamaño de los artefactos publicados.

El entrenamiento se realizó por imitación supervisada sobre 50 episodios de demostración (135 351 frames a 30 FPS) de la tarea de doblar una camiseta, con 5000 pasos, batch de 32 y learning rate 3,75e-05. No se documenta en la información disponible el número de tokens de preentrenamiento del modelo base, la composición del dataset original de π₀.₅, ni si hubo etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas específicas del fine-tuning más allá del uso de LoRA y de la resolución fija de 224×224 en las tres vistas.

## Capacidades

- Control robótico bimanual: genera acciones de 16 dimensiones para un robot `bi_openarm_follower` a partir de estado propioceptivo y tres cámaras.
- Manipulación de tejidos: especializado en la tarea de doblar una camiseta ("Fold the T-shirt properly").
- Percepción multimodal con tres vistas: cámara base y dos cámaras de muñeca, cada una a 224×224 píxeles.
- Condicionamiento por instrucción de tarea en lenguaje natural, pasada como `--task` en el comando de rollout.
- Ejecución de políticas en tiempo real a 30 FPS, coherente con la tasa de grabación del dataset.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento (thinking). Es una política de imitación, no un asistente conversacional.

## Casos de uso

- Doblado automatizado de camisetas en un banco de pruebas: el modelo ejecuta la política entrenada sobre el robot `bi_openarm_follower` con las tres cámaras calibradas, reproduciendo la tarea de los 50 episodios de demostración. Es adecuado porque el dominio de entrenamiento y el de despliegue coinciden.
- Reproducción de experimentos de imitación con LeRobot: sirve como referencia para validar el pipeline `lerobot-train` + `lerobot-rollout` con LoRA r=256 sobre π₀.₅, comparando hiperparámetros y curvas de entrenamiento.
- Punto de partida para fine-tuning adicional: al derivar de `lerobot/pi05_base` con LoRA, puede reutilizarse como inicialización para tareas de plegado similares (otras prendas, otras posiciones), reduciendo el coste frente a entrenar desde el modelo base.
- Docencia y divulgación de VLA: ejemplo compacto (1,9 GB) de cómo se estructura una política VLA en LeRobot, con entradas, salidas y configuración de entrenamiento explícitas.
- Evaluación de robustez de políticas de imitación: útil para medir la degradación al cambiar iluminación, posición inicial de la camiseta o robot del mismo tipo, ya que el autor no publicó curvas de éxito.
- Integración en pipelines de investigación de manipulación de tejidos deformables: la política puede ejecutarse dentro de bucles de evaluación automatizados con `--duration` fijo para recoger tasas de éxito por configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación vacía y declara explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 1,9 GB en safetensors, lo que da una cota inferior del espacio de pesos, pero no se especifica el tamaño total del modelo base π₀.₅ ni el overhead de activaciones.
- GPU recomendadas: no disponible. Por el uso de LeRobot con `--policy.device=cuda` y el tamaño del artefacto, es razonable esperar GPUs con al menos 8-16 GB de VRAM, pero el dato no está confirmado en la información disponible.
- ¿Cabe en GPU de consumo? No confirmado. El tamaño de 1,9 GB sugiere que sí en GPUs consumer modernas, pero no hay confirmación del autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`) y el ecosistema de entrenamiento `lerobot-train`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política de acciones robóticas.
- Latencia y throughput: no disponibles. La política está pensada para operar a 30 FPS, en línea con la tasa del dataset, pero no se publican mediciones de latencia por paso.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Dataset | Licencia | Evaluación publicada |
|---|---|---|---|---|---|
| `saybeok03/folding_final_novit_lora_r256_224` | VLA π₀.₅ + LoRA r=256 | Doblado de camiseta, robot bimanual | 50 episodios, 135 351 frames | Apache 2.0 | No |
| `lerobot/pi05_base` | VLA π₀.₅ base | Propósito general de manipulación | No disponible | Apache 2.0 (según repositorio base) | No disponible en esta ficha |
| π₀ original (Physical Intelligence) | VLA predecesor | Propósito general de manipulación | No disponible | No disponible en esta ficha | No disponible en esta ficha |

No se dispone de datos de benchmarks ni de parámetros de los modelos comparados en la información proporcionada, por lo que la comparación se limita a tipo de modelo, tarea, licencia y disponibilidad de evaluación.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con 50 episodios de un único operador, robot y entorno, la política hereda los sesgos de esas demostraciones (posiciones, velocidades, estilo de plegado).
- Riesgo de alucinación: en el sentido de acciones incorrectas o fuera de distribución, alto fuera del dominio de entrenamiento. No hay evaluación que cuantifique la tasa de éxito ni los modos de fallo.
- Limitación de generalización: π₀.₅ está diseñado para generalizar a entornos nuevos, pero este fine-tuning concreto se ha validado únicamente sobre la tarea "Fold the T-shirt properly" y el robot `bi_openarm_follower`; no hay evidencia de transferencia a otras prendas, robots o configuraciones de cámara.
- Dependencia de calibración: las cámaras deben llamarse exactamente `base`, `left_wrist` y `right_wrist` y respetar la resolución 224×224 y los índices del entorno de grabación; cualquier desviación invalida las observaciones.
- Sin métricas de éxito: la model card declara explícitamente que no se han proporcionado resultados de evaluación, por lo que no se puede afirmar ningún nivel de rendimiento en producción.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y la implementación OpenPI pueden tener condiciones adicionales que deben verificarse antes de un despliegue comercial.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea se pasa en inglés en los ejemplos.
- Fecha de creación del repositorio: 2026-11-02, según los metadatos de HuggingFace; conviene verificar la vigencia de la versión de LeRobot 0.6.1 frente a versiones posteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saybeok03/folding_final_novit_lora_r256_224
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/full_folding_pi05_224
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/full_folding_pi05_224
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
