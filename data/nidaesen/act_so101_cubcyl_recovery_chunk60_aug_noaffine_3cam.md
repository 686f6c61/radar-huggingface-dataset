# NidaEsen/act_so101_cubcyl_recovery_chunk60_aug_noaffine_3cam

## Resumen

`NidaEsen/act_so101_cubcyl_recovery_chunk60_aug_noaffine_3cam` es una política de control visuomotor entrenada con el algoritmo ACT (Action Chunking with Transformers) dentro del ecosistema LeRobot sobre un brazo robótico SO-ARM101. No es un modelo de lenguaje: se trata de un modelo de imitación que aprende a mapear observaciones visuales y de estado articular a secuencias de acciones motoras. Cuenta con 51.627.654 parámetros y un horizonte de predicción (chunk) de 60 pasos de acción, con tres entradas de cámara simultáneas (muñeca, frontal y superior).

El modelo fue desarrollado por el usuario NidaEsen y entrenado sobre el dataset `BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1`, compuesto por 143 episodios (120 limpios y 23 de recuperación). La tarea objetivo es la manipulación de cubos y cilindros e incluye datos específicos de recuperación tras fallos, un escenario poco frecuente en los datasets de imitación publicados. El checkpoint seleccionado corresponde al paso 90.000, por ser el de menor pérdida de validación (0.2273) de la ejecución.

Su relevancia es doble: por un lado, sirve como referencia reproducible para investigar recuperación ante errores en políticas de imitación de bajo coste; por otro, es un ejemplo de modelo pequeño (menos de 52 millones de parámetros, repositorio de 0,2 GB) desplegable en hardware de consumo. La model card advierte de que no existe evaluación en hardware real ni licencia declarada, por lo que su uso en producción requiere validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE, según LeRobot |
| Parametros totales | 51.627.654 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; horizonte de acciones (chunk) de 60 pasos |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | No aplica (modelo de robótica, sin capacidad lingüística) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

La arquitectura es ACT con componente CVAE, la implementación de referencia de LeRobot. Este diseño combina un codificador visual basado en ResNet para procesar las tres cámaras (muñeca, frontal y superior), un codificador de estado articular y un decoder transformer que genera un chunk de 60 acciones de forma conjunta en lugar de paso a paso. El módulo CVAE modela la variabilidad de las demostraciones humanas durante el entrenamiento, lo que ayuda a capturar multimodalidad en las trayectorias. El repositorio no detalla la configuración exacta de capas o dimensiones ocultas.

El entrenamiento se realizó durante 100.000 pasos con tamaño de lote 8, semilla 1000 y tasa de aprendizaje 1e-5, guardando checkpoints cada 10.000 pasos. El dataset contiene 143 episodios (120 limpios y 23 de recuperación), divididos en 113 de entrenamiento (90 limpios más los 23 de recuperación) y 30 episodios limpios reservados para validación (índices 0–4, 20–24, 45–49, 65–69, 90–94 y 110–114). El aumento de datos está activado con peso afín 0 y cinco transformaciones fotométricas, lo que significa que la aleatorización espacial geométrica se desactivó y solo se aplicó variación de color o iluminación. La ejecución se completó en 2 h 54 min 50 s en el nodo `d4055` (trabajo `10675149_1`). No se documenta el uso de RLHF, DPO ni ajuste por preferencias, algo esperable en un modelo de imitación.

## Capacidades

- Control visuomotor de manipulación: genera comandos de acción continua para un brazo SO-ARM101 a partir de tres cámaras.
- Predicción por chunks: emite 60 acciones por inferencia, lo que reduce la frecuencia de cómputo del modelo y mejora la suavidad del movimiento.
- Percepción multivista: integra simultáneamente vistas de muñeca, frontal y cenital.
- Ejecución de tareas de pick-and-place sobre cubos y cilindros.
- Comportamiento de recuperación: el dataset incluye 23 episodios de recuperación tras fallo, aunque la model card especifica que la pérdida de validación se calculó solo con episodios limpios y no evalúa la capacidad de recuperación.
- Entrada de estado propioceptivo: la política consume el estado articular del robot junto con las imágenes.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües, al no ser un modelo generativo de texto.
- No dispone de modo de razonamiento explícito, visión general, audio ni otras capacidades multimodales fuera del control robótico.

## Casos de uso

- Manipulación de cubos y cilindros en laboratorio: el modelo está entrenado específicamente para esta tarea sobre el SO-ARM101, por lo que puede utilizarse directamente como política de control en un banco de pruebas con la calibración `phi_follower` indicada por el autor.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para estudiar el efecto del aumento fotométrico sin transformación afín en políticas ACT.
- Estudio de recuperación ante fallos: aunque no está evaluada en hardware, la inclusión de episodios de recuperación permite comparar variantes de entrenamiento orientadas a la robustez frente a errores de agarre.
- Evaluación de checkpoints intermedios: los diez checkpoints guardados (10k a 100k) permiten analizar la curva de convergencia y el sobreajuste en validación.
- Despliegue en robótica de bajo coste: con 51,6 millones de parámetros, la política cabe en GPUs de gama media y en módulos embebidos tipo Jetson, lo que facilita montajes económicos.
- Docencia y prototipado en robótica: el flujo LeRobot permite clonar el repositorio, cargar los pesos y ejecutar inferencias en simulación o en banco real sin infraestructura de gran escala.
- Generación de datos sintéticos y aumento de datasets: las transformaciones fotométricas empleadas pueden replicarse para expandir datasets propios de manipulación.
- Comparación de arquitecturas: como política ACT de referencia, permite medir frente a alternativas como Diffusion Policy en el mismo robot y tarea, siempre que se reproduzcan las condiciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El único dato de rendimiento aportado por el autor es la pérdida de validación (L1 más KL ponderada) sobre episodios limpios:

| Paso | Perdida de validacion |
|---:|---:|
| 10k | 0.2787 |
| 20k | 0.2571 |
| 30k | 0.2443 |
| 40k | 0.2458 |
| 50k | 0.2417 |
| 60k | 0.2345 |
| 70k | 0.2317 |
| 80k | 0.2318 |
| 90k | 0.2273 |
| 100k | 0.2303 |

El paso 90.000 es el mínimo de la serie y corresponde al checkpoint publicado. La model card indica explicitamente que esta métrica no evalúa la recuperación tras un fallo y que no existe puntuación de despliegue en hardware real.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp32) los 51,6 millones de parámetros ocupan aproximadamente 207 MB; en fp16/bf16, alrededor de 103 MB. El repositorio completo ocupa 0,2 GB, por lo que el checkpoint es muy ligero.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente para el modelo. Se puede ejecutar en RTX 3060, RTX 4060, RTX 4090, A100, H100 o superiores sin problemas de memoria.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna, e incluso en módulos embebidos como Jetson Orin Nano o Jetson Xavier NX.
- Opciones de despliegue: el modelo está publicado en formato safetensors para la librería `lerobot`, que incluye scripts de inferencia y evaluación. No se documenta en la model card soporte para vLLM, llama.cpp, Ollama o TGI, herramientas orientadas a modelos de lenguaje y no aplicables directamente a esta política.
- Latencia y throughput: no disponibles. La inferencia real depende del número de cámaras, la resolución de entrada y el hardware, además de la frecuencia del bucle de control del SO-ARM101.
- Nota de integración: el autor exige usar la calibración canónica `phi_follower` del proyecto antes de cualquier prueba en hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Horizonte de acciones | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_cubcyl_recovery_chunk60_aug_noaffine_3cam | 51.627.654 | 60 | 3 camaras (muñeca, frontal, superior) | No disponible | HuggingFace, 0 descargas |
| Otras politicas ACT publicadas en LeRobot | No disponible | No disponible | No disponible | No disponible | No disponible |
| Diffusion Policy (familia) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos verificables con alternativas concretas de la misma categoria en la informacion proporcionada. La comparacion con Diffusion Policy u otras familias de politicas de imitacion requeriria reproducir el mismo dataset y robot, algo que no se documenta en este repositorio.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que el uso comercial es inseguro jurídicamente hasta que el autor la especifique.
- No hay evaluación en hardware real: no existe puntuación de rollout ni métrica de éxito en tareas físicas.
- La pérdida de validación se calculó únicamente con episodios limpios, de modo que la capacidad de recuperación tras fallo está entrenada pero no medida.
- El modelo está especializado en una tarea concreta (cubos y cilindros) y un robot concreto (SO-ARM101); no es generalizable a otras morfologías sin reentrenamiento.
- Depende de la calibración `phi_follower`; una calibración distinta puede degradar gravemente el comportamiento.
- El dataset es reducido (143 episodios, 113 de entrenamiento) y proviene de demostraciones humanas, por lo que puede heredar sesgos de estilo y de distribución espacial de los objetos.
- La variabilidad del entorno está limitada: el aumento afín está desactivado (peso 0), así que la política puede ser sensible a cambios de posición de los objetos fuera de la distribución de entrenamiento.
- El número de descargas e interacciones es cero, por lo que no existe validación por parte de la comunidad.
- No se documentan sesgos demográficos ni lingüísticos por tratarse de un modelo robótico, pero sí puede presentar sesgos de percepción asociados al tipo de iluminación y cámara del dataset original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NidaEsen/act_so101_cubcyl_recovery_chunk60_aug_noaffine_3cam
- Dataset de entrenamiento: https://huggingface.co/datasets/BrutalCaesar/phi_so101_cubes_cylinder_recovery_v1
- Librería LeRobot: no disponible en la informacion proporcionada (referenciada como `library_name: lerobot`)
- Paper o blog del autor: no disponible
- Repositorio de código o demo: no disponible
