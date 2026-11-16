# ahnjaeyeong/pi05-so101-cube-spatial-clean96

## Resumen

pi05-so101-cube-spatial-clean96 es un ajuste fino (fine-tune) del modelo de robotica pi05_base de LeRobot, especializado en una tarea concreta de manipulacion: recoger un cubo rojo de 2,5 cm y depositarlo en una caja marron con un brazo robotico SO-101. Lo desarrolla el usuario ahnjaeyeong y se publica bajo la licencia Gemma, ya que pi05_base se construye sobre PaliGemma (Gemma). El modelo resuelve el problema de generalizacion espacial en una politica visuomotora: se entrena con 96 episodios y se evalua con posiciones y rotaciones del cubo no vistas durante el entrenamiento.

El interes practico esta en que documenta con detalle un flujo completo de ajuste fino de una politica tipo vision-language-action (VLA) sobre hardware asequible (SO-101), incluyendo resultados de evaluacion en robot real, condiciones de inferencia (RTC, 5 pasos de denoising) y limitaciones observadas de forma honesta. No es un modelo de proposito general: es un checkpoint de investigacion para una tarea y un montaje fisico especificos.

El modelo tiene 4.143.404.816 parametros (aproximadamente 4,14 mil millones) en formato safetensors, con un repositorio de 9,4 GB. Solo se entrena el experto de accion, manteniendo congelado el codificador de vision. Genera trozos de accion (action chunks) de 50 pasos a 30 Hz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de pi05_base, construida sobre PaliGemma (Gemma); experto de accion ajustado, codificador de vision congelado |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; entrenamiento en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de lerobot/pi05_base, una politica VLA que combina un backbone vision-language basado en PaliGemma con un experto de accion. En este ajuste fino solo se entrena el experto de accion; el codificador de vision permanece congelado. La salida es un chunk de 50 acciones a 30 Hz, con normalizacion por cuantiles para estado y accion e identidad para imagenes.

El entrenamiento usa el dataset so101-cube-spatial-clean96, compuesto por 96 episodios y 99.977 fotogramas, con 20.000 pasos y batch de 32. La tasa de aprendizaje es 1e-5 con 50 pasos de warm-up y decaimiento coseno hasta 2.5e-6, en precision bfloat16 y semilla 2001. La perdida final de entrenamiento fue 0.014. Se ejecuto con LeRobot (commit e595b790) y PyTorch 2.11 sobre una NVIDIA H200 del supercomputador KISTI numero 6 "Hangang". El checkpoint model.safetensors tiene sha256 3548d66d6136ad021e9531c9183278595faaa99c0d1d42abfdda753fcb2b2492.

## Capacidades

- Control visuomotor de un brazo SO-101 para una tarea de pick-and-place: recoger un cubo rojo de 2,5 cm y colocarlo en una caja marron.
- Generalizacion espacial limitada: funciona con posiciones del cubo no vistas en entrenamiento (dentro del lado izquierdo y central) y con rotaciones del cubo de 45 grados o inclinaciones L30/R30.
- Entrada multimodal: dos camaras (`front` y `wrist`) a 640x480 mas el estado del robot.
- Generacion de acciones en chunks de 50 pasos a 30 Hz, compatible con inferencia RTC (execution horizon 20, queue threshold 30, prefix attention schedule EXP) y 5 pasos de denoising.
- Condicionamiento por cadena de tarea: `pick up the red cube and put it in the brown box`.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual; es una politica de accion, no un asistente conversacional.
- Capacidades multilingues no aplicables ni documentadas.

## Casos de uso

- Investigacion en generalizacion espacial de politicas VLA: el checkpoint sirve como referencia reproducible para estudiar como varia el exito al cambiar posicion y rotacion del objeto, con rollouts publicados en so101-cube-spatial-eval-rollouts.
- Reproduccion de experimentos de ajuste fino con LeRobot: permite repetir el pipeline (dataset de 96 episodios, 20.000 pasos, experto de accion) y comparar con el modelo base pi05_base.
- Benchmark de manipulacion con brazo de bajo coste: util para medir exito de pick-and-place en SO-101 con un montaje estandarizado (una mesa, una camara frontal, una de muneca, un cubo, una caja).
- Estudio de fallos y recuperacion: las limitaciones documentadas (espera con pinza abierta, reintentos tras agarre fallido) permiten disenar politicas de recuperacion o supervision humana.
- Base para ajustes posteriores en tareas similares: al estar entrenado solo el experto de accion, sirve como punto de partida para nuevos datasets de pick-and-place sobre el mismo robot.
- Validacion de configuraciones de inferencia: el modelo permite comparar ajustes de RTC, pasos de denoising y limites de articulacion (8 grados por paso) frente al exito observado.

## Benchmarks y rendimiento

Resultados de evaluacion en robot real publicados por el autor (2026-11-13), con un checkpoint y 6-8 ensayos por fila en un solo dia:

| Condicion | Limite de tiempo | Exito |
|---|---|---|
| 4 posiciones entrenadas + 4 no vistas, cubo a 0 grados | 60 s | 6/8 (no vistas 4/4, entrenadas 2/4) |
| Mismas 8 posiciones, cubo rotado 45 grados / L30 / R30 | 120 s | 6/8 (4/8 en 60 s) |
| Solo posicion K4, L30 vs 0 grados alternando | 120 s | 5/6 (L30 3/3, 0 grados 2/3) |

Pruebas de seguimiento (2026-11-13 y 11-16, no todas incluidas en los rollouts publicados): cubos en el lado derecho del robot (rotacion de base superior a +30 grados) tuvieron exito en 3 de 15 ensayos, frente a 22 de 25 en el lado izquierdo y central.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 4,14 mil millones de parametros, el checkpoint en bfloat16 ocupa aproximadamente 8,3 GB, por lo que se necesita una GPU con al menos 10-12 GB de VRAM en esa precision (estimacion a partir del tamano del repositorio de 9,4 GB).
- GPU de entrenamiento documentada: 1x NVIDIA H200 (supercomputador KISTI "Hangang").
- GPU recomendadas para inferencia: no documentadas por el autor; por tamano, una RTX 4090 (24 GB) o superior deberia ser suficiente en bfloat16.
- Cabe en GPU de consumo: probable en tarjetas con 12 GB o mas en bfloat16; no confirmado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout`) con `--policy.path=ahnjaeyeong/pi05-so101-cube-spatial-clean96 --policy.num_inference_steps=5 --inference.type=rtc`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a una politica de robotica).
- Latencia y throughput: no disponibles; la politica opera a 30 Hz con chunks de 50 acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-so101-cube-spatial-clean96 | 4.143.404.816 | no disponible | Pick-and-place de cubo con SO-101 | Gemma | Hugging Face |
| lerobot/pi05_base | no disponible en la informacion | no disponible | Politica VLA general base | Gemma (heredada) | Hugging Face |
| Alternativas de politica robotica de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Con el cubo a unos 45 grados respecto al eje de la pinza, la politica suele alcanzar el cubo y esperar con la pinza abierta durante decenas de segundos antes de cerrar, o agotar el tiempo.
- Tras un agarre fallido o una caida, reintenta, en ocasiones hasta el limite de tiempo.
- En uno de 22 episodios de evaluacion no salio de la pose de reposo.
- El lado derecho del robot es debil: exito de 3/15 con rotacion de base superior a +30 grados, frente a 22/25 en izquierda y centro. En las demostraciones la rotacion hacia la derecha es mas lenta; la causa esta en investigacion.
- Las posiciones no vistas solo se probaron en el lado izquierdo y central (7/7 en dos dias).
- Entrenado y probado con un unico robot, una colocacion de camara, una mesa, un cubo y una caja; sin objetos distractores en entrenamiento.
- El episodio debe comenzar desde la pose de reposo con la pinza cerrada.
- Licencia Gemma: el uso comercial y la redistribucion estan sujetos a los Gemma Terms of Use y a sus restricciones de uso; los archivos modificados (model.safetensors y normalizaciones) se detallan en NOTICE.
- Riesgo de alucinacion no aplicable en el sentido textual, pero si de acciones erroneas o bloqueos ante configuraciones fuera de distribucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahnjaeyeong/pi05-so101-cube-spatial-clean96
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/ahnjaeyeong/so101-cube-spatial-clean96
- Rollouts de evaluacion: so101-cube-spatial-eval-rollouts (referenciado en la model card)
- Registros del experimento: https://github.com/ahnjaeyeong/so101-pi05-spatial-generalization
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
