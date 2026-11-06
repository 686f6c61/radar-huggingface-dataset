# Gospe1/adaspevla-franka-bread-v1-3

## Resumen

AdaSpeVLA Franka bread v1.3 es un modelo de tipo visión-lenguaje-acción (VLA) desarrollado por el usuario Gospe1, especializado en una única tarea robótica: recoger dos rebanadas de pan de una tostadora y colocarlas en un plato. El modelo parte del backbone JAX π₀.₅ de OpenPI (Physical Intelligence) y añade una cabeza de acción basada en splines denominada AdaSpeVLA, junto con una cabeza de predicción de intervalos de consulta ("timing"). Consume dos vistas RGB de 128×128 píxeles, un estado de 19 dimensiones del efector final y una instrucción de texto fija, y produce una trayectoria de 1,2 segundos del efector final junto con la apertura continua del agarre.

El paquete publicado (1,9 GB) no contiene el modelo completo: incluye únicamente `model/final.pt`, con la cabeza de acción, la cabeza de timing, los parámetros de normalización y las cuatro últimas capas del backbone lingüístico afinadas. El backbone visual π₀.₅ congelado (~12 GB) y el tokenizador de `google/paligemma-3b-pt-224` deben obtenerse por separado del upstream, lo que condiciona por completo el despliegue.

Es relevante ahora porque ejemplifica una tendencia incipiente en robótica open source: modelos de política entrenados sobre un único conjunto de demostraciones y publicados como artefactos de investigación, con advertencias explícitas de que no han superado evaluación en robot real. El autor indica que el modelo no está validado en hardware y que no garantiza el momento de cierre del agarre ni el éxito de la tarea.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA híbrida: backbone JAX π₀.₅ (OpenPI) congelado + cabeza de acción por splines AdaSpeVLA + cabeza de timing; capas finales del backbone lingüístico afinadas en PyTorch |
| Parámetros totales | no disponible (el paquete de 1,9 GB solo contiene cabezas y 4 capas; el backbone π₀.₅ externo ronda los 12 GB en disco) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la entrada es una instrucción fija de una sola frase) |
| Tipos de cuantización | no disponible (pesos en `final.pt` de PyTorch, presumiblemente fp32/bf16; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | inglés (instrucción fija en inglés) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model/final.pt`, requiere `weights_only=False`) + parámetros JAX de OpenPI (`manifest.ocdbt` y asociados) + tokenizador de PaliGemma en caché de Hugging Face |
| Entradas | 2 imágenes RGB `uint8` (2,128,128,3) + estado de 19 dimensiones + prompt de tarea |
| Salidas | 13 poses objetivo (xyz + cuaternión wxyz) en 1,2 s, intervalos de consulta de 0,2–0,8 s y anchura de agarre continua en [0,1] |
| Frecuencia nominal de datos | 10 Hz (no equivale a frecuencia real de control) |

## Arquitectura y entrenamiento

El modelo combina dos pilas de cómputo. Por un lado, un backbone visión-lenguaje π₀.₅ implementado en JAX (jaxlib 0.5.3 CUDA 12, Flax 0.10.2) que se carga congelado desde los checkpoints oficiales de OpenPI; por otro, un módulo PyTorch que contiene las cuatro últimas capas del backbone lingüístico afinadas, la cabeza de acción AdaSpeVLA basada en splines (con puntos de control y nudos) y una cabeza de timing que predice el intervalo de consulta. El autor subraya que no es el *action expert* nativo de OpenPI ni el backbone PyTorch de la versión v1.1, sino una variante propia.

El entrenamiento se realizó en dos fases: 40.000 pasos para la fase de acción y 10.000 pasos para la fase de timing, con un batch efectivo de 32. Se emplearon 100 demostraciones de la tarea del pan, todas en entrenamiento, sin conjunto de validación reservado. La supervisión del agarre se hace sobre la anchura medida en el futuro, no sobre el evento `action[6]` del controlador, lo que constituye una diferencia funcional importante respecto a pipelines de control convencionales. No se documenta el número total de tokens de entrenamiento, la composición del dataset más allá de las 100 demostraciones, ni el uso de RLHF o DPO.

## Capacidades

- Predicción de trayectorias del efector final a 1,2 segundos vista, expresadas como 13 poses en el sistema de referencia "reset" (posición xyz en metros y cuaternión wxyz).
- Predicción de apertura continua del agarre en el rango [0,1], sin conversión a eventos discretos de apertura/cierre.
- Predicción de intervalos de consulta adaptativos entre 0,2 y 0,8 segundos mediante la cabeza de timing.
- Fusión de dos vistas RGB (cámara principal y cámara de muñeca) con el estado propioceptivo del robot.
- Condicionamiento por instrucción de texto, aunque en la práctica la instrucción está fijada a `Pick up both slices of bread from the toaster and place them on the plate.`
- Utilidades de conversión: `target_at_elapsed` para calcular el objetivo en un instante de ejecución real y `local_motion_delta` para transformar la pose objetivo en un incremento local de 6 dimensiones (escala de traslación 0,023; escala de rotación 0,095).
- No soporta tool calling, function calling, razonamiento multi-paso genérico, visión general, audio ni modo "thinking". Es un modelo de política de una sola tarea.

## Casos de uso

- Investigación en manipulación robótica de una sola tarea: sirve como referencia reproducible para estudiar cabezas de acción por splines sobre backbones VLA congelados, comparando la formulación AdaSpeVLA con el *action expert* nativo de OpenPI.
- Evaluación en modo sombra (*shadow mode*): el paquete solo calcula trayectorias y no envía comandos, por lo que puede ejecutarse en paralelo al controlador real para registrar predicciones y compararlas con la ejecución efectiva antes de cualquier prueba activa.
- Recolección de datos de validación de agarre: dado que el modelo supervisa la anchura futura y no el evento de comando, permite estudiar la brecha entre la anchura predicha y el momento real de cierre en un entorno controlado.
- Estudio de temporización adaptativa: la cabeza de timing que predice intervalos de consulta de 0,2–0,8 s es útil para investigar políticas de replanificación dependientes del estado en lugar de frecuencias fijas.
- Integración en pipelines de investigación con OpenPI: al reutilizar los checkpoints π₀.₅ base, encaja en infraestructuras que ya cargan modelos de Physical Intelligence y quieran probar cabezas alternativas.
- Docencia y reproducción de experimentos VLA: el repositorio incluye código de inferencia, autocomprobación con `samples/bread.npz` y scripts de verificación de hashes, lo que facilita reproducir el flujo completo en un entorno Linux con GPU.
- No es adecuado para producción, atención al cliente, generación de código ni ninguna tarea de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor únicamente reporta una evaluación interna en bucle abierto sobre el conjunto de entrenamiento: en 600 predicciones realizadas 0,6 segundos antes del cierre del agarre, 153 no cruzaron el umbral de 0,5 en los 1,2 segundos siguientes. No hay métricas de éxito en robot real ni comparación cuantitativa con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El backbone π₀.₅ ocupa unos 12 GB en disco y debe residir en memoria junto con las cabezas y el tokenizador; se requiere una GPU con suficiente VRAM para cargar ambos (JAX y PyTorch) en el mismo dispositivo físico.
- GPU recomendadas: no disponible. El autor solo documenta un entorno Linux con PyTorch 2.7.1+cu128, JAX/jaxlib 0.5.3 CUDA 12 y Flax 0.10.2, probado en una única GPU (`CUDA_VISIBLE_DEVICES=0`).
- ¿Cabe en GPU de consumo? No disponible; no se especifica el modelo de GPU usado en las pruebas.
- Opciones de despliegue: el paquete incluye `inference.py` con la clase `FrankaPredictor` y un modo `--self-test`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor advierte de que la primera compilación JAX es notablemente más lenta que las inferencias posteriores y que el equipo de evaluación debe medir latencia en régimen estable y latencia de cola.
- Dependencias adicionales: acceso a `gs://openpi-assets/checkpoints/pi05_base/params` (unos 12 GB) vía `gsutil` y descarga del tokenizador de `google/paligemma-3b-pt-224` en la revisión `35e4f46485b4d07967e7e9935bc3786aad50687c`, con autorización previa de acceso al modelo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaSpeVLA Franka bread v1.3 | VLA de una tarea sobre π₀.₅ | no disponible (backbone ~12 GB en disco) | trayectoria de 1,2 s, consultas cada 0,2–0,8 s | no disponible | repo de 1,9 GB + backbone externo obligatorio |
| OpenPI π₀.₅ (upstream) | VLA generalista | no disponible en la información | no disponible | sujeta a términos de upstream | checkpoints en `gs://openpi-assets` |
| LeRobot π₀.₅ (policy) | VLA | no disponible en la información | no disponible | no disponible | Hugging Face / LeRobot |
| AdaSpeVLA v1.1 | VLA de una tarea, backbone PyTorch | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación relevante es funcional: v1.3 no es cargable con los loaders de LeRobot π₀.₅, OpenPI nativo ni v1.1, y requiere un backbone JAX externo que los otros no exigen en la misma forma.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en robot real. El autor indica explícitamente que no garantiza el momento de cierre del agarre ni el éxito de la tarea.
- Sin conjunto de validación: las 100 demostraciones se usaron íntegramente para entrenamiento, por lo que no hay estimación honesta de generalización.
- En la evaluación en bucle abierto, 153 de 600 predicciones (25,5 %) no cruzaron el umbral de 0,5 en los 1,2 s siguientes cuando se hacían 0,6 s antes del cierre, lo que sugiere problemas de temporización del agarre.
- La supervisión del agarre se basa en la anchura medida, no en el evento `action[6]` del controlador; introducir la salida continua en un canal de eventos sin conversión validada puede producir comportamientos incorrectos.
- El paquete no es autocontenido: sin el backbone π₀.₅ de OpenPI y el tokenizador de PaliGemma en la revisión exacta, la inferencia no funciona. El autor no redistribuye el modelo base.
- Cargar `final.pt` requiere `weights_only=False`, lo que implica riesgo de ejecución de código arbitrario; debe verificarse el SHA256 `48d4420687f63076fc0d9b06ad37fe8071e50530666f7d209622a426ec49c4ab` y descargar solo de fuentes fiables.
- Entorno de referencia no validado en máquinas nuevas: el propio autor señala que la configuración (Linux, Python 3.12, PyTorch 2.7.1+cu128, JAX 0.5.3, Flax 0.10.2) no se ha probado fuera de su equipo.
- La instrucción de texto está fijada; no se documenta capacidad de generalizar a otras tareas ni de seguir prompts arbitrarios.
- Idioma limitado al inglés y sin datos sobre sesgos; al ser un modelo de política de una tarea, los riesgos de sesgo social son indirectos, pero no se han analizado.
- Licencia no disponible: no puede asumirse uso comercial. Además, el uso del backbone π₀.₅ y del tokenizador PaliGemma queda sujeto a sus respectivas condiciones de upstream.
- La frecuencia de 10 Hz es nominal de los datos de entrenamiento y no representa la frecuencia real de control; la sincronización de observaciones y la latencia deben medirse en el equipo de evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gospe1/adaspevla-franka-bread-v1-3
- Backbone base OpenPI π₀.₅ (checkpoints): `gs://openpi-assets/checkpoints/pi05_base/params`
- Tokenizador PaliGemma: https://huggingface.co/google/paligemma-3b-pt-224 (revisión `35e4f46485b4d07967e7e9935bc3786aad50687c`)
- OpenPI (Physical Intelligence): no se proporciona URL en la información disponible
- Artículo o blog del modelo: no disponible
- Repositorio de código adicional: no disponible (el propio repo incluye `inference.py` y `requirements-inference.txt`)
- Demo: no disponible
