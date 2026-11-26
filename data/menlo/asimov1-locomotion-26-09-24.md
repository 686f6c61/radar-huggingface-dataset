# Menlo/asimov1-locomotion-26-09-24

## Resumen

Asimov 1 locomotion policy es una política de control para el robot humanoide Asimov 1, desarrollada por Menlo. No es un modelo de lenguaje, sino un checkpoint de aprendizaje por refuerzo que implementa una política de locomoción comandada por velocidad: recibe el estado del robot y un comando de velocidad, y emite posiciones objetivo para las 23 articulaciones accionadas (piernas, cintura y brazos; el cuello no se acciona). Se entrenó en Isaac Lab con PPO y adversarial motion priors (AMP).

Este checkpoint concreto corresponde a la actualización de tobillo del 24 de septiembre de 2026, exportado desde `model_9999.pt` de la ejecución `decouple_finetune_og_pose`. Mantiene la interfaz de observación de 78 valores, el orden de 23 acciones y la frecuencia de control de 50 Hz del checkpoint anterior `asimov1-locomotion-0818`, pero modifica la escala de acción, el recorte de objetivo y los parámetros de rigidez, amortiguación, límite de esfuerzo y armadura del tobillo.

Es relevante para quienes despliegan políticas de locomoción de humanoides en simulación o en hardware real: el modelo se distribuye en ONNX y TorchScript, con la configuración completa de simulación y tarea en `env.yaml`, lo que permite reproducir el pipeline de inferencia sin depender del código de entrenamiento. La licencia BSD-3-Clause facilita su integración en productos y pipelines internos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política actor-critic entrenada con PPO y adversarial motion priors (AMP) en Isaac Lab (PhysX); red neuronal exportada a ONNX y TorchScript |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; interfaz de observación de 78 valores a 50 Hz |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (`policy.onnx`) y TorchScript (`policy.pt`); configuración en `agent.yaml` y `env.yaml` |

## Arquitectura y entrenamiento

La política se entrenó mediante aprendizaje por refuerzo en Isaac Lab sobre PhysX, usando PPO con adversarial motion priors (AMP). El resultado es una política de locomoción comandada por velocidad que opera a 50 Hz. La entrada son 78 valores: velocidad angular de la base, gravedad proyectada, comando de velocidad (`vx, vy, wz`), posiciones y velocidades articulares y la acción previa; todos ellos disponibles en el robot real. La salida son 23 acciones de posición articular para piernas, cintura y brazos, con el cuello sin accionar.

La actualización de tobillo introduce cambios concretos en la configuración guardada: la escala de acción de ankle-roll es `0.08` frente a `0.25` del resto de articulaciones; los objetivos de posición de ankle-roll se recortan a `[-0.09, 0.09]` radianes tras aplicar la escala de acción y la pose por defecto; la rigidez y amortiguación de ankle-pitch son `224.42` / `10.201`, con límite de esfuerzo `72` y armadura `0.42984`; y las de ankle-roll son `35.2` / `1.6`, con límite de esfuerzo `18` y armadura `0.05814`. Las escalas de acción, la pose por defecto y el recorte de objetivos se aplican en el runtime, fuera del grafo ONNX. La configuración completa de simulación, observaciones, acciones, comandos y recompensas está en `env.yaml`, y los ajustes de actor-critic y AMP en `agent.yaml`.

## Capacidades

- Locomoción comandada por velocidad de un humanoide bípedo a 50 Hz, con comandos `vx`, `vy` y `wz`.
- Generación de posiciones objetivo para 23 articulaciones (piernas, cintura y brazos); el cuello no se acciona.
- Interfaz de observación de 78 valores compatible con el checkpoint anterior `asimov1-locomotion-0818`.
- Inferencia en ONNX Runtime mediante `policy.onnx` o en PyTorch mediante `policy.pt` (TorchScript).
- Configuración de despliegue embebida en los metadatos del ONNX.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es una política de control motor.

## Casos de uso

- Despliegue en el robot Asimov 1 real: el runtime carga `policy.onnx` con ONNX Runtime y aplica la receta de observación de 78 valores y el procesado de acciones de posición articular descritos en `env.yaml`, incluyendo escalas, pose por defecto y recorte de ankle-roll.
- Simulación y validación en Isaac Lab: se reutilizan `env.yaml` y `agent.yaml` para reproducir la tarea de locomoción, las observaciones, los comandos y las recompensas del entrenamiento.
- Integración en PyTorch: `policy.pt` permite ejecutar la misma política como TorchScript dentro de pipelines de investigación ya basados en PyTorch, sin depender de ONNX Runtime.
- Evaluación comparativa de checkpoints: al conservar la interfaz de 78 observaciones, 23 acciones y 50 Hz, este checkpoint puede intercambiarse con `asimov1-locomotion-0818` en el mismo runtime para comparar el efecto de la actualización de tobillo.
- Investigación en aprendizaje por refuerzo con AMP: los ficheros de configuración documentan los ajustes de actor-critic y del prior de movimiento, útiles para reproducir o modificar el entrenamiento con el código de `menloresearch/cyclotron`.
- Visualización de políticas: puede cargarse en `humanoid-policy-viewer` una vez que el visor soporte el recorte de objetivos de ankle-roll, que este checkpoint requiere para ejecutarse con sus ajustes entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB y no se detalla el número de parámetros de la red.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime con `policy.onnx` o PyTorch con `policy.pt` (TorchScript), dentro de un runtime de Asimov 1 que implemente la receta de observación y el procesado de acciones de `env.yaml`.
- Latencia y throughput: no disponibles; la frecuencia de control de la política es de 50 Hz.

## Comparativa con modelos similares

| Modelo | Tipo | Interfaz | Frecuencia de control | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Menlo/asimov1-locomotion-26-09-24 | Política de locomoción PPO + AMP | 78 observaciones, 23 acciones | 50 Hz | BSD-3-Clause | Hugging Face (ONNX, TorchScript) |
| Menlo/asimov1-locomotion-0818 | Política de locomoción PPO + AMP | 78 observaciones, 23 acciones | 50 Hz | no disponible | Hugging Face |
| Otros modelos de locomoción de humanoides | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de otros autores no está disponible en la información proporcionada. Frente al checkpoint `0818`, este modelo difiere en la configuración de tobillo (escala de acción, recorte de objetivo, rigidez, amortiguación, límite de esfuerzo y armadura) y requiere soporte de recorte de objetivos de ankle-roll en el visor de políticas.

## Limitaciones y advertencias

- Modelo específico del robot Asimov 1: la política asume su cinemática, su orden de 23 articulaciones y su interfaz de 78 observaciones; no es transferible a otros humanoides sin reentrenamiento.
- El recorte de objetivos de ankle-roll y las escalas de acción se aplican fuera del grafo ONNX, en el runtime; un runtime que no implemente ese procesado producirá acciones incorrectas.
- `humanoid-policy-viewer` rechaza actualmente políticas con recorte de acción, por lo que este checkpoint no puede ejecutarse allí con sus ajustes entrenados hasta que el visor lo soporte.
- Debe usarse el `env.yaml` de este checkpoint y no la configuración de tobillo del checkpoint anterior.
- No se han publicado datos de parámetros, cuantizaciones, latencia ni benchmarks de rendimiento.
- Riesgo de alucinación y sesgos lingüísticos: no aplica, al no ser un modelo de lenguaje.
- Licencia BSD-3-Clause: permite uso comercial y modificación con obligación de conservar el aviso de copyright y la cláusula de exención de responsabilidad; no se han documentado restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Menlo/asimov1-locomotion-26-09-24
- Checkpoint anterior: https://huggingface.co/Menlo/asimov1-locomotion-0818
- Código de entrenamiento y evaluación: https://github.com/menloresearch/cyclotron
- Visor de políticas de humanoides: https://github.com/menloresearch/humanoid-policy-viewer
- Políticas soportadas por el visor: https://github.com/menloresearch/humanoid-policy-viewer/blob/main/docs/huggingface.md#supported-policies
