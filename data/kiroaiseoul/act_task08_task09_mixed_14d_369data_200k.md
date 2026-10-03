# kiroaiseoul/act_task08_task09_mixed_14D_369data_200k

## Resumen

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice fragmentos cortos de acciones ("action chunks") en lugar de pasos individuales. Este repositorio concreto, `kiroaiseoul/act_task08_task09_mixed_14D_369data_200k`, es una politica ACT entrenada y publicada en el Hub mediante LeRobot para control de robots manipuladores. No es un modelo de lenguaje: es una politica de control roboticos que transforma observaciones (imagenes de camara y estado propioceptivo) en comandos de accion de bajo nivel para un brazo robotico.

El modelo tiene 51.687.056 parametros (unos 51,7 millones) y se distribuye en formato safetensors dentro de un repositorio de 0,2 GB, con licencia Apache 2.0. Esta entrenado sobre el dataset `kiroaiseoul/task08_task09_mixed_14D_369data`, lo que sugiere la mezcla de dos tareas (task08 y task09) con datos de 14 dimensiones (probablemente estado/accion), 369 episodios y 200k pasos de entrenamiento; estos detalles del nombre no estan confirmados en la documentacion.

Su relevancia actual radica en que forma parte del ecosistema LeRobot de Hugging Face, que estandariza el entrenamiento, evaluacion y despliegue de politicas roboticas de bajo coste en hardware asequible (por ejemplo, brazos SO-100/SO-101), facilitando la reproducibilidad y el despliegue en robotica open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con cuello de botella latente tipo CVAE y extractor visual ResNet |
| Parametros totales | 51.687.056 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (politica de imitacion; procesa historial de observaciones, no una ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Tamano del repositorio | 0,2 GB |
| Pipeline | robotics |
| Dataset de entrenamiento | kiroaiseoul/task08_task09_mixed_14D_369data |

## Arquitectura y entrenamiento

ACT es una politica de imitacion basada en transformer que combina un encoder visual (tipicamente ResNet18) con un transformer encoder-decoder. La innovacion central es la prediccion de "chunks" de acciones: en lugar de emitir una unica accion por paso, el modelo genera una secuencia corta de acciones futuras de una sola vez, lo que reduce el error de acumulacion y mejora la estabilidad del control. Incorpora un cuello de botella latente entrenado como CVAE (autoencoder variacional condicional) para modelar la variabilidad de las demostraciones humanas, y usa una tecnica de ensamblado temporal ("temporal ensembling") para suavizar las predicciones entre chunks solapados.

El entrenamiento se realiza por aprendizaje supervisado a partir de datos teleoperados (demostraciones). En este caso concreto, LeRobot ha entrenado la politica sobre el dataset `task08_task09_mixed_14D_369data`, que por su nombre parece combinar dos tareas con observaciones de 14 dimensiones. No se documentan en la informacion disponible el numero exacto de tokens/pasos, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO (no aplicables de forma estandar en este tipo de politica robotica). El metodo original se describe en el paper arXiv:2304.13705.

## Capacidades

- Control de manipulacion robotica: genera comandos de accion para brazos robot, incluyendo tareas bimenuais (bimanual) segun el metodo original.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Prediccion de action chunks: emite secuencias cortas de acciones, lo que mejora la suavidad y la precision en tareas de contacto fino.
- Entrada multimodal: procesa imagenes de camara (observaciones visuales) y estado propioceptivo del robot.
- Integracion con LeRobot: se entrena y ejecuta a traves de `lerobot-train` y `lerobot-record`.
- Mezcla de tareas: el nombre del dataset sugiere entrenamiento conjunto sobre dos tareas (task08 y task09), aunque la documentacion no lo detalla.
- No dispone de: tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues ni modos de "pensamiento"; son capacidades no aplicables a este tipo de modelo.

## Casos de uso

- Manipulacion robotica de proposito general en laboratorio: reproducir tareas aprendidas (recoger, colocar, apilar objetos) sobre un brazo SO-100/SO-101, aprovechando que el modelo se ejecuta en hardware de bajo coste.
- Investigacion en aprendizaje por imitacion: servir como punto de partida o baseline para comparar variantes de ACT, ajustar hiperparametros o evaluar tecnicas de action chunking.
- Automatizacion de tareas repetitivas de pick-and-place: desplegar la politica para mover piezas entre posiciones fijas en una linea de montaje o entorno de prototipado.
- Tareas bimenuais: si el dataset incluye dos brazos, usar el modelo para coordinar movimientos de dos efectores (por ejemplo, sostener y ensamblar).
- Prototipado rapido en robotica open source: integrarlo con el ecosistema LeRobot para validar pipelines de teleoperacion, grabacion de datasets y evaluacion en pocas iteraciones.
- Educacion y formacion: usar el modelo y su flujo de entrenamiento como ejemplo didactico de aprendizaje por imitacion end-to-end en cursos de robotica.
- Evaluacion comparativa de politicas: medir tasas de exito frente a otras politicas de LeRobot (Diffusion Policy, VQ-BeT, SmolVLA) sobre las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica de forma cualitativa que ACT "a menudo alcanza altas tasas de exito" en el trabajo original (arXiv:2304.13705), pero no se aportan cifras concretas para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: con 51,7 millones de parametros, los pesos en fp32 ocupan aproximadamente 207 MB y en fp16 unos 103 MB; sumando el extractor visual y los bufferes de inferencia, la huella tipica es de alrededor de 0,5 a 2 GB de VRAM, aunque no se documentan cifras oficiales.
- GPU recomendadas: cualquier GPU moderna con suficiente VRAM; cabe holgadamente en RTX 3060, RTX 4070, RTX 4090, A100 o H100, si bien su tamano no requiere GPUs de gama alta.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo (incluso antiguas) e incluso podria ejecutarse en CPU para inferencia, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (PyTorch) como via principal, mediante `lerobot-record` con `--policy.path`. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; en robotica el requisito relevante es la frecuencia de control en tiempo real, que depende del hardware de inferencia y del robot.
- Hardware de robot: compatible con brazos de bajo coste tipo SO-100 (el ejemplo de la model card usa `so100_follower`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| act_task08_task09_mixed_14D_369data_200k (este) | ACT (imitacion) | 51,7 M | apache-2.0 | no disponible | Hugging Face / LeRobot |
| Diffusion Policy | Politica por difusion | no disponible | depende del checkpoint | no disponible | LeRobot |
| VQ-BeT | Politica discreta por tokens | no disponible | depende del checkpoint | no disponible | LeRobot |
| SmolVLA | Vision-language-action | no disponible | depende del checkpoint | no disponible | LeRobot |

Nota: no se dispone de cifras de parametros, contexto ni rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible. Las alternativas se citan por pertenecer al mismo ecosistema (LeRobot) y resolver la misma tarea (control roboticos por imitacion).

## Limitaciones y advertencias

- Sesgos: al entrenarse con demostraciones teleoperadas concretas, la politica hereda los sesgos y el estilo de dichas demostraciones y puede generalizar mal fuera de la distribucion de entrenamiento (posiciones, iluminacion, objetos distintos).
- Alucinacion / fallo de politica: en robotica el fallo se traduce en acciones incorrectas o inseguras, con riesgo de colision o dano fisico si no se aplican limites de seguridad.
- Generalizacion limitada: el nombre del dataset sugiere que se entrena solo sobre dos tareas (task08 y task09); no se garantiza su funcionamiento en tareas no vistas.
- Contexto e idioma: no aplica ventana de contexto textual ni soporte multilingue; el modelo no procesa lenguaje natural.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del dataset de entrenamiento (`kiroaiseoul/task08_task09_mixed_14D_369data`) por si impone restricciones adicionales.
- Caveats de produccion: se recomienda validar en el robot real con protocolos de seguridad, verificar la frecuencia de control en tiempo real y reentrenar o ajustar si el entorno de despliegue difiere del de recogida de datos.
- Trazabilidad limitada: el repositorio no incluye detalles del entrenamiento (epocas, hiperparametros, composicion del dataset), lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/kiroaiseoul/act_task08_task09_mixed_14D_369data_200k
- Dataset de entrenamiento: https://huggingface.co/datasets/kiroaiseoul/task08_task09_mixed_14D_369data
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas (LeRobot): https://huggingface.co/docs/lerobot/il_robots#train-a-policy
