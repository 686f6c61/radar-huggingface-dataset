# 1ys1/areumii-smolvla-eclipse-v1

## Resumen

`1ys1/areumii-smolvla-eclipse-v1` es un ajuste fino (fine-tune) del modelo base `lerobot/smolvla_base`, un modelo visión-lenguaje-acción (VLA) compacto de aproximadamente 450 millones de parámetros (450.046.176 exactamente según los pesos en safetensors). Lo publica el usuario `1ys1` en Hugging Face y está entrenado con LeRobot 0.6.1 para controlar un robot de tipo `areumii` equipado con tres cámaras (`head`, `left_wrist`, `right_wrist`). El modelo no genera texto: consume estado propioceptivo de 6 dimensiones e imágenes de 3x256x256, y produce un vector de acción de 16 dimensiones.

La tarea concreta para la que se ha entrenado es «Pick up the eclipse and place it in the box», a partir de un dataset propio de 47 episodios y 35.139 fotogramas grabados a 30 FPS. Es, por tanto, una política de imitación de un solo cometido y un solo robot, no un modelo generalista: su interés está en servir como ejemplo reproducible de ajuste de SmolVLA y como punto de partida para entrenar tareas propias con el mismo pipeline.

SmolVLA se presenta como una alternativa eficiente a los VLA de gran tamaño, con la promesa de funcionar en hardware de consumo. Este fine-tune concreto tiene 0 descargas y 0 «likes» en el momento de redactar la ficha, no incluye resultados de evaluación en la model card y su licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción (VLA) basado en `lerobot/smolvla_base` (SmolVLA); no se documentan en la información disponible los detalles de la capa de acción |
| Parámetros totales | 450.046.176 (≈450 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo recibe una instrucción de tarea en lenguaje natural más las observaciones (estado e imágenes), sin que se documente la ventana de contexto |
| Tipos de cuantización | No se documentan; los pesos se distribuyen en safetensors (repo de 0,9 GB) |
| Idiomas soportados | No disponible (no se documenta; el ejemplo de uso emplea una instrucción en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería `lerobot`) |
| Pipeline | `robotics` |
| Modelo base | `lerobot/smolvla_base` (fine-tune) |
| Tipo de robot | `areumii` |
| Cámaras | `head`, `left_wrist`, `right_wrist` |
| Entradas | `observation.state` (6,); `observation.images.camera1/2/3` (3, 256, 256) |
| Salidas | `action` (16,) |
| Fecha de creación en el Hub | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción que combina un componente de percepción y comprensión de lenguaje con un decodificador de acciones, y que está diseñado para obtener rendimiento competitivo con un coste computacional reducido, hasta el punto de poder desplegarse en hardware de consumo según la propia model card. El paper de referencia es arXiv:2506.01844. La información disponible de este repositorio no detalla la composición interna del modelo (número de capas, tipo de experto de acción, mecanismo de condicionamiento) ni el número de tokens de preentrenamiento del modelo base; esos datos deberían consultarse en el paper y en la model card de `lerobot/smolvla_base`.

El ajuste fino se realizó con LeRobot 0.6.1 sobre el dataset `1ys1/areumii-eclipse-v1`: 47 episodios, 35.139 fotogramas a 30 FPS, una única tarea de manipulación con instrucción textual. La configuración de entrenamiento documentada es de 30.000 pasos, batch size 8, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se indica en la información proporcionada si hubo etapas de RLHF, DPO o refuerzo posteriores al entrenamiento por imitación, ni se describen innovaciones técnicas específicas introducidas por este fine-tune.

## Capacidades

- Generación de acciones de control robótico: produce un vector de acción de 16 dimensiones a partir de observaciones multimodal (estado de 6 dimensiones y tres vistas de cámara).
- Ejecución de la tarea de manipulación «Pick up the eclipse and place it in the box» para el robot `areumii`.
- Fusión de tres cámaras simultáneas (cabeza y ambas muñecas) con resolución 3x256x256 por vista.
- Condicionamiento por instrucción en lenguaje natural (la tarea se pasa como cadena de texto al ejecutar la política).
- Aprendizaje por imitación: política entrenada sobre demostraciones teleoperadas, sin recompensa explícita.
- Capacidad de ser reajustado: al ser un fine-tune de `lerobot/smolvla_base`, el mismo pipeline (`lerobot-train`) permite adaptarlo a otros datasets y robots.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo «thinking». No es un modelo de lenguaje conversacional.

## Casos de uso

- Manipulación pick-and-place con el robot `areumii`: ejecutar en bucle la tarea de recoger el objeto «eclipse» y depositarlo en la caja mediante `lerobot-rollout`, con control a 30 FPS y tres cámaras sincronizadas.
- Punto de partida para fine-tuning propio: reutilizar la configuración documentada (30.000 pasos, batch 8, AdamW, lr 1e-4, semilla 1000) como referencia para entrenar la misma plataforma en tareas nuevas con `lerobot-train --policy.path=lerobot/smolvla_base`.
- Reproducción de experimentos en imitación robótica: al publicar dataset, hiperparámetros y versión de LeRobot, sirve para replicar resultados y estudiar la variabilidad entre semillas.
- Banco de pruebas de SmolVLA en hardware de consumo: con ~450 M de parámetros y un repo de 0,9 GB, permite medir latencia y viabilidad de despliegue en una GPU de gama media o incluso en CPU.
- Validación de una célula de picking en laboratorio: usar la política como controlador de bajo nivel en una estación de recogida con cámara cenital y dos cámaras de muñeca, midiendo tasa de éxito por turnos.
- Ampliación iterativa del dataset: al estar ligado a `1ys1/areumii-eclipse-v1`, el modelo sirve para detectar fallos concretos (posiciones límite, oclusiones) y dirigir la recogida de nuevos episodios que corrijan esos casos.
- Comparación de políticas VLA en un mismo robot: enfrentar este fine-tune frente al modelo base `lerobot/smolvla_base` u otras políticas de LeRobot en la misma tarea y con la misma instrumentación.
- Demostración educativa de un pipeline completo VLA: grabación de datos, entrenamiento, publicación en el Hub y despliegue en un robot real, útil en docencia o talleres técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con la nota explícita «No evaluation results have been provided for this policy yet», por lo que no hay tasas de éxito, número de ensayos ni comparaciones cuantitativas con otras políticas sobre esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, en torno a 1,8 GB solo para los pesos (450 M de parámetros); en bf16/fp16, aproximadamente 0,9 GB, coherente con el tamaño del repo (0,9 GB). En cuantización de 8 bits bajaría a unos 0,45 GB, aunque no se documentan cuantizaciones publicadas para este modelo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre debería bastar para los pesos; se recomienda una RTX 3060/4060 o superior para mantener un bucle de control fluido con tres cámaras a 30 FPS. GPU de datacenter como A100 o H100 no son necesarias para inferencia, aunque pueden emplearse para reentrenamiento.
- Cabe en GPU de consumo: sí, previsiblemente en prácticamente cualquier GPU discreta moderna e incluso en portátiles con GPU integrada dedicada, dado el tamaño del modelo.
- Opciones de despliegue: el flujo oficial es LeRobot (`lerobot-rollout` con `--strategy.type=base` y `--policy.path=1ys1/areumii-smolvla-eclipse-v1`), sobre PyTorch y con `--policy.device=cuda`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a políticas VLA.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia temporal, el sistema se ejecuta a 30 FPS y las cámaras deben configurarse a esa frecuencia; el paper del modelo base describe técnicas de inferencia asíncrona para desacoplar el cálculo de la ejecución de acciones, pero este repositorio no aporta mediciones propias.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `1ys1/areumii-smolvla-eclipse-v1` | ≈450 M | No disponible | Sin resultados publicados en la información disponible | Apache 2.0 | Hugging Face (0 descargas) |
| `lerobot/smolvla_base` | ≈450 M (base preentrenada) | No disponible en la información proporcionada | No aplicable directamente: es el modelo base sin ajuste a la tarea | Se debe consultar su model card | Hugging Face (LeRobot) |
| OpenVLA | ≈7 B (backbone tipo Llama-2-7B) | No disponible en la información proporcionada | No comparable aquí: no se han ejecutado evaluaciones sobre esta tarea | Se debe consultar su licencia en el repositorio original | Público |
| π0 (Physical Intelligence) | Del orden de 3 B | No disponible en la información proporcionada | No comparable aquí | Se debe consultar su licencia en el repositorio original | Público |

Nota: los datos de OpenVLA y π0 corresponden a documentación pública de esos proyectos y no proceden de la información proporcionada sobre este modelo; conviene verificarlos en sus repositorios antes de citarlos. La comparación relevante y estrictamente disponible es la del fine-tune frente a `lerobot/smolvla_base`, y en ambos casos faltan métricas de éxito en la tarea.

## Limitaciones y advertencias

- Modelo de tarea única: está entrenado exclusivamente para «Pick up the eclipse and place it in the box»; no hay evidencia de que generalice a otros objetos, posiciones o instrucciones.
- Específico de un robot: las dimensiones de entrada y salida (estado de 6, acción de 16) y los nombres de cámara (`head`, `left_wrist`, `right_wrist`) están fijados a la plataforma `areumii`; usarlo en otro hardware requiere reentrenar.
- Dataset reducido: 47 episodios y 35.139 fotogramas son una base limitada; es probable que aparezcan fallos ante cambios de iluminación, fondos, posiciones iniciales o distractores no presentes en las demostraciones.
- Sin evaluación publicada: no existe ninguna tasa de éxito medida, por lo que no puede acreditarse su fiabilidad en producción.
- Riesgo de sobreajuste a las condiciones de grabación y de degradación fuera de distribución; en políticas de imitación esto se manifiesta como movimientos erráticos o bloqueos, con riesgo físico asociado en un robot real.
- Idiomas: no se documenta ningún soporte multilingüe; el único ejemplo de instrucción está en inglés y el dataset es de una sola tarea.
- Sesgos: no se documentan análisis de sesgo, pero cualquier política entrenada sobre un operador y un entorno concretos hereda sus sesgos de comportamiento (velocidad, trayectorias, posturas).
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías ni soporte; se debe citar el modelo base y el paper de SmolVLA según lo indicado en la model card.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin demo en vídeo ni resultados de robot real, lo que dificulta validar la calidad del ajuste antes de desplegarlo.
- Advertencia para producción: al no incluirse límites de par, parada de emergencia ni validación de seguridad, cualquier despliegue físico debe incorporar capas de seguridad externas y supervisión humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1ys1/areumii-smolvla-eclipse-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/1ys1/areumii-eclipse-v1
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=1ys1/areumii-eclipse-v1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
