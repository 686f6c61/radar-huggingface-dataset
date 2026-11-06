# RemiFabre/microduck-static-grasp

## Resumen

`microduck-static-grasp` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo MicroDuck de Pollen Robotics. Sustituye a la red `alpha_ground_pick` de serie en la ranura `ground_pick`: en lugar de mantener el pico cerrado durante la maniobra, ejecuta una secuencia en la que el pato se agacha hasta dejar el pico abierto a unos 10 mm del suelo, muerde el objeto y se incorpora sujetándolo. El modelo lo publica RemiFabre en Hugging Face con licencia Apache 2.0 y formato ONNX.

Técnicamente no es un modelo de lenguaje sino una política neuronal episódica de 50 Hz con contrato fijo `obs[1,61] f32 → actions[1,14] f32`, normalizador embebido y comando de fase cíclico de 4,0 s. Se entrenó en simulación con mjlab (entorno `pollen-robotics/mjlab_microduck`, run `neoy2a9d`, checkpoint 1249) partiendo de la política de pick de serie (warm start) y se exportó con `scripts/export.py` del repositorio `pollen-robotics/microduck_rl`.

Su relevancia es acotada pero concreta: demuestra el flujo completo de sustitución de una política de manipulación en un robot de bajo coste, incluyendo el daemon modificado necesario (PR microduck#481) para que el pico se abra durante la fase de aproximación. Es material de investigación y experimentación, no un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política neuronal para control robótico (aprendizaje por refuerzo); topología de capas no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación `obs[1,61] f32` por paso de control |
| Tipos de cuantizacion | no disponible (exportación ONNX en f32) |
| Idiomas soportados | no aplica (modelo de control robótico, sin entrada de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` |

## Arquitectura y entrenamiento

La política se entrenó con aprendizaje por refuerzo en simulación usando mjlab, sobre el entorno `pollen-robotics/mjlab_microduck` (run `neoy2a9d`, checkpoint 1249) del repositorio `pollen-robotics/microduck_rl` en la rama `static-grasp`, commit `666dab6`. El entrenamiento partió de la política de pick de serie (warm start), lo que explica la nomenclatura `Mjlab-StaticGrasp-Hover-FromPick-MicroDuck` en la procedencia. El detalle de la arquitectura de red, el número de parámetros y la composición exacta del dataset de entrenamiento no están disponibles en la información proporcionada.

La innovación principal no está en la red sino en el condicionamiento: la política espera un comando de fase `[cos 2πφ, sin 2πφ, 0]` con periodo de 4,0 s y devuelve el control en φ = 0,7. El pico se trata como actuador guionizado, abriéndose hasta 22° entre las fases 0,02 y 0,10 y cerrándose sobre el objeto entre 0,34 y 0,40. El contrato es episódico, a 50 Hz, con normalizador embebido en el ONNX. La inferencia requiere el daemon parcheado de microduck#481, ya que el daemon de serie mantiene el pico cerrado durante el pick.

## Capacidades

- Ejecución de una secuencia de agarre desde el suelo: agacharse, mantener el centro de masa sobre los pies, morder y levantarse con el objeto.
- Control de equilibrio durante la maniobra: el centro de masa se mantiene al menos 0,84 cm dentro del polígono de apoyo.
- Estabilidad en posición congelada: con los objetivos de servo fijos a mitad de agarre, el robot se mantiene en pie con el pico a 2-5 mm del suelo.
- Agarre tolerante a variación de posición: funciona desde aproximadamente 1 mm más cerca hasta 8 mm más lejos del punto nominal (unos 9 cm delante de los pies) y con ±15 mm de desviación lateral.
- Maniobra de tanteo: el pico flota entre 1 y 1,7 cm mientras espera y toca el suelo durante 0,02-0,1 s al cerrarse.
- Sin capacidades de lenguaje, visión, tool calling ni razonamiento multi-paso: es exclusivamente una política motora.

## Casos de uso

- Investigación en manipulación con robots de bajo coste: permite reproducir y comparar una política de agarre terrestre frente a la de serie en el mismo hardware, con el mismo contrato de observación y acción.
- Docencia y prototipado en robótica con RL: el contrato simple (`obs[1,61] → actions[1,14]`, 50 Hz) y el formato ONNX facilitan integrarlo en prácticas de despliegue de políticas simuladas a real.
- Sustitución de política en el robot MicroDuck: mediante `robotctl policy load ground_pick RemiFabre/microduck-static-grasp` se cambia el comportamiento de la tecla A sin recompilar firmware, útil para evaluar variantes de agarre.
- Recogida de objetos pequeños en demostraciones: bloques Lego 2×2, cubos de 2 cm, dados y peones de ajedrez funcionan en simulación con 3/3 aciertos por categoría, lo que lo hace adecuado para demos controladas.
- Estudio de robustez sim-to-real: la card documenta el error de 2,5 mm de pico por grado de error en la articulación de la pata, lo que permite diseñar experimentos de calibración y medir la brecha simulación-realidad.
- Referencia para pipelines de exportación ONNX en robótica: el par `policy.onnx` + `manifest.json` sirve como plantilla de empaquetado de políticas con normalizador embebido y metadatos de procedencia.

## Benchmarks y rendimiento

Resultados de simulación publicados en la model card (el modelo exacto de entrenamiento, con la secuencia de pick del robot):

| Objeto | Aciertos en simulación |
|---|---|
| Bloque Lego 2×2 | 3/3 |
| Bloque de 2 cm | 3/3 |
| Dado | 3/3 |
| Peón de ajedrez | 3/3 |
| Pila AA | 1/3 |
| Moneda plana | 0/3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni métricas de éxito contadas en robot real.

## Requisitos de hardware

- El modelo no requiere GPU para inferencia: es un ONNX pequeño (el repositorio ocupa 0,0 GB) pensado para ejecutarse en la placa de desarrollo del propio pato.
- VRAM estimada: no disponible; por el tamaño del artefacto, la inferencia en CPU es viable.
- GPU recomendadas: no aplica para el despliegue previsto; para reentrenamiento con mjlab se necesita una GPU compatible con el stack de simulación, sin especificar en la información disponible.
- Cabe en cualquier hardware capaz de ejecutar ONNX Runtime, incluida la placa del robot.
- Opciones de despliegue: ONNX Runtime a través de `robotctl` (comando `robotctl policy load ground_pick RemiFabre/microduck-static-grasp`), con el daemon de microduck#481 instalado previamente.
- Latencia y throughput: el contrato fija 50 Hz (20 ms por paso de control); no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/salida | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-static-grasp | Política RL de agarre con pico | obs[1,61] → actions[1,14] | 50 Hz | Apache 2.0 | Hugging Face, ONNX |
| `alpha_ground_pick` (de serie) | Política RL de pick original | Mismo contrato de la ranura `ground_pick` | 50 Hz | no disponible en la información | Incluida en el robot |
| Otras políticas de `microduck_rl` | Políticas RL del mismo repositorio | Contratos variables | no disponible | no disponible | Repositorio pollen-robotics/microduck_rl |

No se dispone de datos de rendimiento de `alpha_ground_pick` en la información proporcionada, por lo que la comparación cuantitativa entre ambas políticas se limita a la descripción cualitativa de la card (el stock mantiene el pico cerrado; esta variante lo abre y lo cierra sobre el objeto).

## Limitaciones y advertencias

- Validación en robot real muy limitada: probado en un solo pato (el de la demo) y sin resultados contados.
- Brecha simulación-realidad en las patas: cada grado de error en la articulación de la pata desplaza el pico unos 2,5 mm, por lo que un pato real puede tocar el suelo más de lo que indica la simulación.
- Objetos altos sin probar: los objetos de más de 2,6 cm no se han evaluado en simulación.
- Rendimiento pobre en objetos difíciles: pilas AA (1/3) y monedas planas (0/3) en simulación.
- Objetivos articulares que exceden el rango: la política puede pedir hasta 0,25 rad fuera del rango de una articulación, lo que puede forzar el hardware.
- Dependencia de un daemon modificado: sin el build de microduck#481, el pico permanece cerrado y la maniobra no funciona; hay que revertir con `robotctl policy reset ground_pick` y `robotctl update apply --ref main daemon`.
- Licencia Apache 2.0 permite uso comercial, pero el estado de validación (un solo robot, sin métricas contadas) desaconseja cualquier despliegue en producción.
- Sin capacidades de lenguaje ni percepción: no procesa texto ni imágenes; cualquier uso fuera del control del MicroDuck requiere adaptar el contrato de observación y acción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RemiFabre/microduck-static-grasp
- Demo en robot real (50 s): https://www.youtube.com/watch?v=MpWuZ9_dxuk
- Vídeo de simulación (preview): https://huggingface.co/RemiFabre/microduck-static-grasp/resolve/main/media/preview.mp4
- Pull request del daemon necesario: https://github.com/pollen-robotics/microduck/pull/481
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama `static-grasp`, commit `666dab6`)
