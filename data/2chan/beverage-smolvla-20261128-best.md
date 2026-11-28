# 2chan/beverage-smolvla-20261128-best

## Resumen

Beverage SmolVLA es un checkpoint de política de acción (action policy) basado en SmolVLA, un modelo de visión-lenguaje-acción (VLA) para robótica, afinado por el usuario 2chan para cinco tareas de preparación de bebidas. El modelo parte de la arquitectura SmolVLA de la librería LeRobot y se ha entrenado mediante imitación (behavior cloning) sobre demostraciones, no mediante refuerzo. El checkpoint publicado corresponde al paso 50.000 del run de entrenamiento `20261127_205423_507180`, seleccionado como mejor y final a la vez.

El modelo resuelve el problema de mapear observaciones visuales y una instrucción en lenguaje natural a una secuencia de acciones motrices para un brazo robótico. Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto de investigación reproducido para un conjunto muy concreto de tareas de manipulación (devolver el mazador a su soporte, introducirlo en el vaso y verter agua, café en polvo y matcha en el vaso). Cuenta con 450.046.176 parámetros en formato safetensors y un repositorio de 0,9 GB.

No se han publicado datos sobre el robot de destino, la configuración de cámaras, el número de demostraciones ni la tasa de éxito real en hardware, por lo que su valor práctico fuera del entorno de entrenamiento es incierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) sobre LeRobot; detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea figuran en inglés en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una política de acción que combina un codificador visual, un codificador de instrucciones en lenguaje y un decodificador de acciones, integrada en el ecosistema LeRobot. El checkpoint incluye los pesos del modelo, la configuración de la política, las definiciones de preprocesado y postprocesado, los tensores de normalización y la configuración de entrenamiento; se excluyen el estado del optimizador y los conjuntos de datos.

El entrenamiento se realizó durante 50.000 pasos sobre un split de episodios/demostraciones con fracción de validación de 0,2. La pérdida de validación final fue 0,0363138989 y la de entrenamiento final, 0,0304580300. Por tarea, las pérdidas de validación fueron: devolver el mazador a su soporte, 0,03551936; introducirlo en el vaso, 0,03081868; verter agua, 0,04117349; verter café en polvo, 0,03768442; y verter matcha, 0,03654596. No se reporta un conjunto de test independiente ni evaluación de tasa de éxito en robot, ni se detalla si hubo aumento de datos, número de demostraciones o composición del dataset.

## Capacidades

- Control robótico por imitación para cinco tareas concretas de preparación de bebidas.
- Condicionamiento por instrucción en lenguaje natural (las cinco tareas enumeradas en la model card).
- Procesamiento de observaciones visuales y emisión de acciones motrices (pipeline `robotics`).
- Incluye normalización de observaciones y acciones lista para inferencia con LeRobot.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo de pensamiento.
- No se documentan capacidades multilingües.

## Casos de uso

- Reproducción de experimentos de imitación en robótica de manipulación: cargar el checkpoint con LeRobot y evaluar la política sobre las cinco tareas de bebidas para comparar con otros checkpoints del mismo run.
- Benchmark interno de políticas VLA: usar la pérdida de validación por tarea como referencia para medir el efecto de cambios en datos, aumentos o hiperparámetros.
- Prototipado de estaciones de bebidas en laboratorio: integrar la política en un brazo con cámara para automatizar la secuencia mazador-vaso-vertido en un entorno controlado.
- Estudio de especialización frente a generalización: comparar este modelo afinado en cinco tareas con el SmolVLA base para analizar la pérdida de generalidad tras el fine-tuning.
- Docencia y demostraciones de behavior cloning: ilustrar el flujo completo de LeRobot desde la captura de demostraciones hasta el despliegue de una política entrenada.
- Base para fine-tuning adicional: reutilizar los pesos y la configuración de normalización como punto de partida para tareas de manipulación relacionadas con líquidos y utensilios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación por tarea:

| Tarea | Pérdida de validación |
|---|---:|
| Devolver el mazador a su soporte | 0,03551936 |
| Introducir el mazador en el vaso | 0,03081868 |
| Verter agua en el vaso | 0,04117349 |
| Verter café en polvo en el vaso | 0,03768442 |
| Verter matcha en el vaso | 0,03654596 |
| Global (validación) | 0,0363138989 |

No hay datos de MMLU, HumanEval, GSM8K ni de tasa de éxito en robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 450 millones de parámetros en safetensors, los pesos ocupan aproximadamente 0,9 GB en fp32, pero el consumo real depende de los codificadores visual y de lenguaje y del tamaño de las observaciones.
- GPU recomendadas: no disponible; LeRobot puede ejecutarse en GPU de consumo, pero no se especifica hardware validado.
- Compatibilidad con GPU de consumo: probable por tamaño de pesos, sin confirmación del autor.
- Opciones de despliegue: librería LeRobot (indicada como `library_name`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a una política de acción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Beverage SmolVLA (este) | 450.046.176 | no disponible | pérdida val. 0,0363; sin tasa de éxito | no disponible | Hugging Face |
| SmolVLA base | no disponible | no disponible | no disponible | no disponible | LeRobot / Hugging Face |
| Otras políticas VLA de LeRobot (p. ej. ACT, Diffusion Policy) | no disponible | no disponible | no disponible | no disponible | LeRobot |

No se dispone de datos comparativos de rendimiento entre alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: solo cubre cinco tareas de bebidas; fuera de ellas no hay garantía de comportamiento correcto.
- Sin evaluación en robot: no se reporta tasa de éxito, solo pérdida de validación, que no equivale a éxito de la tarea.
- Sin conjunto de test independiente: la validación procede del mismo reparto de episodios, con riesgo de sobreajuste no detectado.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no declarados: las instrucciones se documentan en inglés; el comportamiento con otros idiomas es desconocido.
- Sin datos de sesgos ni de robustez ante cambios de iluminación, cámara o posición de objetos.
- Riesgo de fallo en producción por desviaciones de la distribución de demostraciones (objetos, recipientes o robot distintos).
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Excluye estado del optimizador y datasets, por lo que no es directamente reentrenable sin los datos originales.

## Enlaces

- Hugging Face: https://huggingface.co/2chan/beverage-smolvla-20261128-best
- LeRobot (librería): no disponible en la información proporcionada
- Paper de SmolVLA: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
