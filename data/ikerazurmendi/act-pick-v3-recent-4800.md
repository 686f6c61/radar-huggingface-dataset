# IkerAzurmendi/act-pick-v3-recent-4800

## Resumen

`act-pick-v3-recent-4800` es una política de imitación para robótica del tipo ACT (Action Chunking Transformer), publicada por el usuario IkerAzurmendi en HuggingFace dentro del ecosistema LeRobot. No es un modelo de lenguaje: recibe dos imágenes de cámara (frontal y de muñeca) más las seis posiciones articulares de un brazo SO-101 y devuelve un bloque de 90 objetivos articulares futuros a 30 fps. El modelo resuelve una única tarea: coger una pieza de una caja y sostenerla frente a la cámara.

Se trata de una variante de la tercera ronda de experimentos (v3) entrenada exclusivamente con las sesiones más recientes del conjunto de datos (las del 24 de octubre a partir de las 16:58, con piezas colocadas en esquinas y bordes, más dos sesiones de tarde), un total de 100 episodios. El checkpoint publicado corresponde al paso 4.800 de una ejecución de 12.000 pasos y, según el propio autor, no es el mejor de su ejecución (el mejor es el de 12.000 pasos, con 16,87 de error); se publica por completitud.

Su relevancia es acotada pero útil: con 51,66 millones de parámetros y 0,2 GB de pesos, sirve como referencia reproducible y como punto de partida para fine-tuning en brazos SO-101 de bajo coste, además de como ejemplo de metodología de ablación (comparación sistemática de recetas y checkpoints) dentro de LeRobot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer); política de imitación con encoder visual y decodificador de acciones, no es un LLM |
| Parámetros totales | 51.658.374 (51,66 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de texto; entrada compuesta por 2 imágenes (cámara frontal y de muñeca) + 6 posiciones articulares, y horizonte de predicción de 90 acciones (3 s a 30 fps) |
| Tipos de cuantización | No disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF, INT8 ni FP8) |
| Idiomas soportados | No disponible (el modelo no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB, librería `lerobot`) |
| Pipeline declarado | `robotics` |
| Tarea | SO-101: coger una pieza de la caja y sostenerla frente a la cámara |
| Frecuencia de control | 30 fps; 30 pasos de acción por replanificación (replanificación ≈ 1 vez por segundo) |
| Episodios de entrenamiento | 100 |
| Checkpoint | Paso 4.800 de una ejecución de 12.000 pasos |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice bloques de acciones (action chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza la ejecución. En esta configuración concreta, el modelo consume dos flujos de imagen (cámara frontal y cámara de muñeca) junto con el vector de seis posiciones articulares del SO-101 y emite 90 objetivos articulares futuros, es decir, 3 segundos de trayectoria a 30 fps. El despliegue previsto replanifica cada 30 pasos de acción.

El entrenamiento se realizó con la función `train()` de LeRobot, con batch de 8, chunk de 90, 30 pasos de acción por replanificación, aumento de imagen por defecto y semilla 1000. El conjunto de datos son 100 episodios a 30 fps con una o dos piezas, restringidos a las sesiones del 24 de octubre desde las 16:58 (piezas en esquinas y a lo largo de los bordes) más las dos sesiones de tarde, aplicando el mismo filtro de calidad que la ronda v3. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de refinamiento por refuerzo; se trata de aprendizaje por imitación supervisado sobre demostraciones de teleoperación. El autor señala que todas las ejecuciones de esta ronda empeoraron tras aproximadamente una pasada sobre los datos, lo que sugiere sobreajuste temprano con este volumen de episodios.

## Capacidades

- Manipulación robótica de una sola tarea: coger una pieza de una caja y mantenerla elevada frente a la cámara.
- Control articular de 6 grados de libertad en brazos SO-101, con salida de 90 objetivos articulares por inferencia.
- Fusión multimodal de dos cámaras (frontal y de muñeca) con propiocepción (6 posiciones articulares).
- Funcionamiento con una o dos piezas presentes en la escena, incluyendo piezas situadas en esquinas y en los bordes de la caja.
- Replanificación periódica: 30 pasos de acción ejecutados por cada llamada al modelo, a 30 fps.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades de lenguaje, visión general, audio o modo "thinking". La visión está integrada únicamente como entrada de política motora.

## Casos de uso

- Recogida y presentación de pieza en el SO-101: es la tarea exacta para la que se entrenó; el modelo ejecuta el ciclo de alcance, agarre y elevación frente a la cámara frontal, con replanificación cada segundo.
- Punto de partida para fine-tuning con datos propios: al ser un checkpoint de 51,66 M de parámetros y 0,2 GB, se puede reentrenar con `train()` de LeRobot sobre un conjunto propio de decenas a centenares de episodios en una sola GPU consumer.
- Referencia de comparación en ablaciones: permite medir el efecto de recetas alternativas (más episodios, filtros de calidad más estrictos, chunk 60) manteniendo constante el resto de la configuración.
- Docencia y reproducción de experimentos: sirve para ilustrar el flujo completo de LeRobot (grabación de episodios, entrenamiento, evaluación offline) con un coste computacional mínimo.
- Validación de pipeline de control antes de probar en hardware: sus predicciones de chunk permiten comprobar la integración entre el nodo de inferencia, el publicador de comandos articulares a 30 fps y el bucle de seguridad del robot.
- Pruebas de robustez ante variación de posición de piezas: el conjunto de entrenamiento se centró deliberadamente en piezas en esquinas y bordes, por lo que resulta adecuado para evaluar el comportamiento en esas configuraciones concretas.
- Base para experimentos de destilación o cuantización: su tamaño reducido permite comparar latencia y precisión tras conversiones a FP16 o INT8, aunque no se publican versiones preconvertidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible, ya que no es un modelo de lenguaje. El autor sí reporta una validación offline sobre 16 episodios reservados (12 de `so101-pick-cube_20261024_181939`, con una pieza, y 4 de `so101-pick-cube_20261024_144537`, con dos piezas), midiendo el error absoluto medio de las articulaciones sobre el chunk predicho frente a una línea base de "mantenerse en la posición actual" de 20,71:

| Checkpoint de esta ejecución | Error | Mejora frente a la línea base |
|---|---|---|
| 2.400 pasos | 17,19 | 17 % |
| 4.800 pasos (este modelo) | 17,10 | 17 % |
| 7.200 pasos | 17,00 | 18 % |
| 9.600 pasos | 17,10 | 17 % |
| 12.000 pasos | 16,87 | 19 % |

## Requisitos de hardware

- Pesos: en FP32 el modelo ocupa aproximadamente 207 MB y en FP16 unos 103 MB (cálculo derivado de los 51.658.374 parámetros; no publicado por el autor). El repositorio completo son 0,2 GB.
- VRAM estimada para inferencia: menos de 1 GB solo para pesos; con dos flujos de cámara, aumento de imagen en evaluación y activaciones, una estimación razonable es 1-2 GB (estimación propia, no publicada).
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, así como en módulos integrados tipo Jetson Orin. El cuello de botella esperado es la captura y preprocesado de las dos cámaras a 30 fps, no el modelo.
- Opciones de despliegue: scripts de evaluación de LeRobot sobre PyTorch (carga directa de safetensors). vLLM, TGI, llama.cpp y Ollama no aplican a este tipo de política; no se documenta exportación a ONNX ni TensorRT.
- Latencia y throughput: no disponibles. Como referencia de diseño, el bucle previsto ejecuta 30 pasos de acción por replanificación, es decir, una inferencia por segundo aproximadamente.

## Comparativa con modelos similares

Comparación con los checkpoints de la misma familia y receta, según los datos de la model card. Aviso: el error offline de la ejecución con chunk 60 no es directamente comparable porque su línea base "mantenerse quieto" es distinta (16,23 frente a 20,71).

| Modelo | Episodios | Mejor checkpoint | Error | Mejora vs. línea base | Chunk | Licencia |
|---|---|---|---|---|---|---|
| act-pick-v3-recent-4800 (este) | 100 | 4.800 | 17,10 | 17 % | 90 | apache-2.0 |
| act-pick-v3-recent-12000 | 100 | 12.000 | 16,87 | 19 % | 90 | no disponible |
| act-pick-v3-6000 (super) | 398 | 6.000 | 15,16 | 27 % | 90 | no disponible |
| act-pick-v3-strict-2400 | 205 | 2.400 | 15,14 | 27 % | 90 | no disponible |
| act-pick-v3-1-2-pieces-18000 | 331 | 18.000 | 15,35 | 26 % | 90 | no disponible |
| act-pick-v2-6000 | 278 | 6.000 | 15,36 | 26 % | 90 | no disponible |
| act-pick-v3-chunk60-4800 | 331 | 4.800 | 11,94 | 26 % | 60 | no disponible |
| act-pick-v3-1piece-9600 | 292 | 9.600 | 15,47 | 25 % | 90 | no disponible |

El autor indica que los mejores checkpoints de las ejecuciones principales están dentro del ruido entre sí, y que este checkpoint concreto queda claramente por detrás de las recetas con más datos (15,1-15,4 frente a 17,10). No se han localizado comparaciones con políticas ACT de otros autores en la información disponible.

## Limitaciones y advertencias

- No ha sido probado en el robot: el propio autor advierte de que el error offline no permite determinar qué modelo agarra mejor y que ninguna de las variantes se ha evaluado en hardware real.
- Especialización extrema: una sola tarea, un solo tipo de brazo (SO-101) y una configuración de cámaras concreta. No generaliza a otras tareas, objetos ni morfologías sin reentrenamiento.
- Este checkpoint no es el mejor de su ejecución: el de 12.000 pasos obtiene 16,87 frente a 17,10. Se publica por completitud, no como versión recomendada.
- Sobreajuste temprano: todas las ejecuciones de la ronda empeoraron tras aproximadamente una pasada sobre los datos, por lo que el número de pasos óptimo es bajo y sensible a la receta.
- Sesgo de datos: 100 episodios de una única sesión de recogida (24 de octubre desde las 16:58) con piezas en esquinas y bordes, presumiblemente con un operador y una iluminación concretos. La variabilidad de posiciones, texturas y condiciones de luz es reducida.
- Dependencia de las cámaras: la política asume la presencia de cámara frontal y de muñeca con la misma colocación relativa; cambios de encuadre o calibración degradan la predicción sin aviso.
- Riesgo de alucinación en sentido figurado: el modelo puede generar trayectorias plausibles pero incorrectas (por ejemplo, cerrar el agarre sin pieza), sin ninguna señal de confianza asociada. Requiere límites de par, parada de emergencia y supervisión humana.
- Sin capacidades de lenguaje ni de instrucción: no acepta comandos en texto, no soporta tool calling ni razonamiento multi-paso.
- Licencia apache-2.0: permite uso comercial y modificación con atribución, pero no se documentan garantías, ni condiciones de seguridad, ni la licencia de los datos de entrenamiento originales.
- Idiomas y cuantizaciones: no disponibles, por lo que no se puede evaluar su comportamiento fuera del pipeline de LeRobot en FP32/FP16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-4800
- Perfil del autor en HuggingFace: https://huggingface.co/IkerAzurmendi
- Checkpoint recomendado de la misma ejecución (12.000 pasos): https://huggingface.co/IkerAzurmendi/act-pick-v3-recent-12000
- Ejecución con todos los datos de calidad (act-pick-v3-6000): https://huggingface.co/IkerAzurmendi/act-pick-v3-6000
- Ejecución con filtro estricto (act-pick-v3-strict-2400): https://huggingface.co/IkerAzurmendi/act-pick-v3-strict-2400
- Ejecución con chunk de 60 (act-pick-v3-chunk60-4800): https://huggingface.co/IkerAzurmendi/act-pick-v3-chunk60-4800
- Framework LeRobot: https://github.com/huggingface/lerobot

Nota: las URL de los repositorios hermanos se han construido a partir de los nombres citados en la model card; no se han verificado de forma independiente. La búsqueda web asociada no devolvió resultados técnicos relevantes sobre este modelo, por lo que no se incluye ningún otro enlace.
