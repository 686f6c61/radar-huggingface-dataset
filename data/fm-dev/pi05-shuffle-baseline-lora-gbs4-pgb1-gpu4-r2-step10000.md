# fm-dev/pi05-shuffle-baseline-lora-gbs4-pgb1-gpu4-r2-step10000

## Resumen

`fm-dev/pi05-shuffle-baseline-lora-gbs4-pgb1-gpu4-r2-step10000` es un checkpoint de ajuste fino con LoRA sobre el modelo base π0.5, orientado a robótica de manipulación. Lo publica el usuario `fm-dev` como parte de una segunda ronda de experimentos (`r2`) sobre la tarea denominada *shuffle*, ejecutada sobre un brazo Franka. El repositorio corresponde concretamente al paso 10.000 de un entrenamiento cuyo objetivo declarado es alcanzar 12.500 actualizaciones del optimizador (50.000 exposiciones de muestras).

Se trata de un artefacto de investigación más que de un modelo listo para producción: la propia model card indica que la publicación intermedia "no es una evaluación de calidad de la política" y que la evaluación offline, cuando se incluye, no establece la tasa de éxito en robot real. El repositorio pesa 11,5 GB e incluye pesos EMA de servicio, activos de normalización e historial, código de inferencia, versiones exactas de dependencias y el estado completo de reanudación (no EMA, optimizador, RNG y sampler).

La relevancia de esta ficha es acotada pero clara para quien trabaja en visión-lenguaje-acción (VLA): documenta una receta de ajuste fino reproducible con recursos modestos (4 GPU RTX A6000), con decisiones explícitas sobre enmascarado de componentes de acción no supervisados, normalización por STD y un esquema de EMA concreto. El modelo está preparado para cargarse mediante `from load_model import load, observe; policy = load()` desde el propio bundle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo base π0.5 con adaptadores LoRA (rank 32) sobre el mismo; no se detallan capas ni componentes internos en la model card |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (las entradas declaradas son imagen base actual, imagen de muñeca actual, estado e instrucción de tarea) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio incluye pesos EMA de servicio, pero la model card no especifica el formato de serialización) |
| Horizonte de salida | Tensor de forma (20, 8): 20 pasos de acción, 8 componentes por paso |
| Composición de la salida | xyz absoluto, cuaternión XYZW unitario en la carta de cuaternión positivo (qx > 0) y comando de pinza en [0,1] |
| Normalización | Estado y acciones con normalización STD; los tokens de estado usan además una vista acotada train-q01/q99 |
| Optimizador | AdamW |
| Configuración LoRA | rank 32 |
| Semilla | 42 |
| Tamaño del repositorio | 11,5 GB |
| Pipeline declarado | robotics |
| Hardware de entrenamiento | 4 GPU RTX A6000, batch global 4, batch por GPU 1, sin acumulación de gradiente |
| Checkpoint | Paso 10.000 (40.000 exposiciones de muestras); objetivo de la ejecución: 12.500 pasos / 50.000 exposiciones |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA de rango 32 sobre el modelo base π0.5, un modelo de visión-lenguaje-acción aplicado a control robótico. El checkpoint pertenece a la segunda ronda de experimentos (`r2`), mantenida separada de un experimento original de 6.250 pasos. La variante publicada aquí es una línea base *sin historial*: la política consume únicamente la imagen base actual, la imagen de muñeca actual, el estado y la instrucción de tarea. El historial visual no se reinicia al comenzar la ejecución, y solo las filas de ejecución del robot supervisan las acciones; las imágenes de demostración, características y coordenadas originales de episodio/fotograma permanecen disponibles como historial. Los splits de episodios y la normalización se calculan únicamente con el split de entrenamiento.

El entrenamiento se realizó localmente en 4 RTX A6000 con batch global 4 y batch por GPU 1, sin acumulación de gradiente, lo que arroja 4 muestras por actualización y 40.000 exposiciones en el paso 10.000. El esquema de optimización incluye warmup de 250 actualizaciones hasta 5e-5 y decaimiento coseno hasta 5e-6 en el paso 12.500. Se aplica EMA con factor 0,999^4 = 0,996005996001, y el repositorio contiene tanto los pesos EMA de servicio como el estado de reanudación completo no EMA (optimizador, RNG y sampler). Los checkpoints se guardan cada 1.000 actualizaciones y en el paso final 12.500; los pasos 5.000, 10.000 y 12.500 tienen repositorios independientes, y el resto se conserva en un archivo de respaldo bajo la ruta `task/method/stepN/`.

Una innovación reseñable en el diseño del dataset es el enmascarado explícito de componentes de acción desconocidos: los componentes no conocidos permanecen como NaN/false en los datos de entrenamiento y se enmascaran tanto en el condicionamiento del flujo como en la pérdida. El único componente declarado como totalmente no supervisado es el índice [7], correspondiente a la salida de pinza. Además, la convención registrada de pose cartesiana del efector final o herramienta debe coincidir con la del controlador de recolección, sin aplicar un desplazamiento adicional de herramienta o brida.

## Capacidades

- Generación de comandos de acción robótica: produce tensores de forma (20, 8) con posición xyz absoluta, orientación como cuaternión unitario en la carta de cuaternión positivo y comando de pinza en [0,1].
- Control de manipulación sobre brazo Franka: el modelo está entrenado específicamente para la tarea *shuffle* sobre este hardware.
- Condicionamiento por instrucción de tarea en lenguaje natural, combinado con observaciones visuales de cámara base y de muñeca y con el estado del robot.
- Ajuste fino eficiente mediante LoRA de rango 32, lo que permite adaptar el modelo base sin reentrenar todos los parámetros.
- Reanudación exacta de entrenamiento: el bundle incluye estado de optimizador, RNG y sampler, además de los pesos EMA de servicio.
- Inferencia autocontenida: el repositorio incluye código fuente de inferencia y versiones exactas de dependencias, con API de carga mediante `load()` y `observe()`.
- Soporte de flujo de historial para modelos que lo requieren: `observe(policy, base_rgb, state)` debe invocarse en cada fotograma observado, incluidas las demostraciones, y reiniciarse entre episodios. No obstante, este checkpoint concreto es la línea base sin historial.
- Compatibilidad con la variante Status-D documentada por el autor, que requiere entradas adicionales (`history_keyframe_index`, `current_subgoal`, `transition_context_*`) y devuelve `transition_status`. Esta capacidad corresponde al esquema general de la familia, no necesariamente a este checkpoint sin historial.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión general, audio ni modo *thinking*. El pipeline declarado es exclusivamente `robotics`.

## Casos de uso

- Manipulación robótica de barajado sobre Franka: el modelo genera directamente comandos de efector final y pinza para la tarea *shuffle* a partir de imágenes base y de muñeca, estado e instrucción. Es el caso de uso primario y el único explícitamente validado por el autor en términos de tarea.
- Investigación en ajuste fino de modelos VLA con recursos limitados: la receta documentada (4 RTX A6000, batch global 4, LoRA rank 32, AdamW, warmup de 250 pasos, decaimiento coseno, EMA 0,996) sirve como referencia reproducible para grupos que no disponen de clústeres grandes.
- Estudio del efecto del tamaño de lote en el ajuste fino de políticas: el nombre del repositorio codifica la configuración exacta (gbs4, pgb1, gpu4, r2) y el autor publica checkpoints de distintos pasos, lo que permite analizar la evolución de la política a lo largo de 5.000, 10.000 y 12.500 actualizaciones.
- Reanudación y bifurcación de experimentos: al incluir el estado completo de optimizador, RNG y sampler, el bundle permite retomar el entrenamiento exactamente en el paso 10.000 sin reproducir la fase previa.
- Auditoría de pipelines de datos robóticos: el enmascarado de componentes no supervisados y el tratamiento explícito de NaN/false en el condicionamiento del flujo y en la pérdida son un caso práctico para validar cómo se propaga la supervisión parcial en un dataset de imitación.
- Verificación de convenciones de pose en integración real: la model card exige que la convención cartesiana del efector final o herramienta coincida con la del controlador de recolección y prohíbe aplicar un desplazamiento extra de herramienta o brida, lo que resulta útil como lista de comprobación antes de desplegar sobre hardware.
- Evaluación offline de políticas en comparativas internas: el propio autor publica los pesos EMA de servicio y los activos de normalización, lo que facilita ejecutar la política sobre conjuntos de validación propios antes de cualquier prueba física.
- Docencia y divulgación técnica: el bundle, con código de inferencia y dependencias fijadas, sirve como ejemplo completo de artefacto de ajuste fino LoRA para robótica, incluido el estado de reanudación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de éxito en robot real. El autor indica explícitamente que la publicación intermedia no constituye una evaluación de calidad de la política y que la evaluación offline, cuando se incluye, no establece la tasa de éxito sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio pesa 11,5 GB, pero incluye pesos EMA de servicio, activos de normalización, código, dependencias y el estado completo de reanudación (optimizador, RNG y sampler), por lo que la huella de inferencia es necesariamente inferior al tamaño total del repositorio.
- GPU empleadas en entrenamiento: 4 RTX A6000, con batch global 4 y batch por GPU 1, sin acumulación de gradiente. Este dato corresponde al entrenamiento, no a la inferencia.
- GPU recomendadas para inferencia: no disponible.
- Encaje en GPU de consumo: no disponible. No hay datos publicados sobre VRAM mínima ni sobre ejecución en tarjetas tipo RTX 4090 o similares.
- Opciones de despliegue: el bundle incluye código de inferencia propio y versiones exactas de dependencias, con carga mediante `from load_model import load, observe; policy = load()`. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia genéricos. Conviene consultar `training_config.json` para la configuración completa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables publicados en la documentación proporcionada. Las únicas alternativas identificables son los checkpoints hermanos de la misma ejecución, que comparten arquitectura, datos y licencia, y difieren únicamente en el número de actualizaciones.

| Modelo | Paso | Exposiciones de muestras | Repositorio | Estado |
|---|---|---|---|---|
| pi05-shuffle-baseline-lora-gbs4-pgb1-gpu4-r2-step10000 | 10.000 | 40.000 | Este repositorio | Publicado |
| Checkpoint r2 paso 5.000 | 5.000 | 20.000 | Repositorio independiente (referenciado en la model card) | Publicado |
| Checkpoint r2 paso 12.500 | 12.500 | 50.000 | Repositorio independiente (referenciado en la model card) | Objetivo final de la ejecución |
| Checkpoints r2 intermedios | cada 1.000 | variable | Archivo `fm-dev/pi05-checkpoint-backups`, ruta `checkpoints/r2` | En archivo de respaldo |
| Experimento original de 6.250 pasos | hasta 6.250 | no disponible | No referenciado con enlace directo | Ronda previa, separada de `r2` |

No se han identificado en la información disponible modelos de terceros comparables en parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Evaluación ausente: el autor declara que la publicación intermedia no es una evaluación de calidad de la política y que la evaluación offline no establece la tasa de éxito en robot real. No debe interpretarse como un modelo validado.
- Componente de pinza no supervisado: el componente [7] está totalmente sin supervisar. La salida de pinza de *shuffle* no tiene supervisión de comando y no debe interpretarse como control de pinza aprendido.
- Etiquetas parciales: la tarea Button Order solo dispone de etiquetas verificadas de comando cerrado de forma limitada.
- Dependencia estricta de la convención de pose: la convención registrada de pose cartesiana del efector final o herramienta debe coincidir con la del controlador de recolección. No debe aplicarse un desplazamiento adicional de herramienta o brida; hacerlo invalida las acciones generadas.
- Requisito de carta de cuaternión: la orientación se emite con cuaternión unitario en la carta de cuaternión positivo, lo que impone una convención concreta de interpretación.
- Supervisión parcial en el dataset: los componentes de acción desconocidos permanecen como NaN/false y se enmascaran en el condicionamiento del flujo y en la pérdida. Cualquier reutilización del dataset debe respetar ese enmascarado.
- Idiomas: no se especifican idiomas soportados. Las instrucciones de tarea de los ejemplos y toda la documentación están en inglés.
- Licencia no disponible: no se indica licencia alguna, por lo que no puede asumirse permiso de uso comercial, redistribución ni modificación. Cualquier uso en producción requiere aclaración previa con el autor.
- Sesgos: no hay información publicada sobre sesgos del modelo ni sobre la composición demográfica o de escenarios del dataset de entrenamiento.
- Riesgo de alucinación o de acciones fuera de distribución: no se documenta ningún análisis de robustez ante observaciones fuera de distribución, oclusiones o cambios de iluminación en el entorno de recolección.
- Advertencia de integración: para modelos con historial, `observe(policy, base_rgb, state)` debe invocarse en cada fotograma observado, incluidas las demostraciones, y reiniciarse entre episodios. Este checkpoint es la línea base sin historial, pero la familia incluye variantes que sí lo requieren.
- Entradas adicionales de Status-D: esa variante exige `history_keyframe_index` (un fotograma observado o None), `current_subgoal` e inputs causales `transition_context_*` en `policy.infer(...)`, y devuelve `transition_status`. Omitirlos produciría inferencias incorrectas.
- Recursos: el bundle de 11,5 GB incluye estado de reanudación completo, no solo pesos de servicio, lo que aumenta los requisitos de almacenamiento frente a un simple checkpoint de inferencia.
- Reproducibilidad: el archivo de respaldo de checkpoints intermedios reside en un repositorio de tipo dataset (`fm-dev/pi05-checkpoint-backups`), no en repositorios de modelo, con la ruta `task/method/stepN/`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-shuffle-baseline-lora-gbs4-pgb1-gpu4-r2-step10000
- Archivo de respaldo de checkpoints (ruta `checkpoints/r2`): https://huggingface.co/datasets/fm-dev/pi05-checkpoint-backups/tree/main/checkpoints/r2
- Perfil del autor: https://huggingface.co/fm-dev
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes. Las URL devueltas por la búsqueda corresponden a directorios de emisoras de radio en francés (radio-en-ligne.fr, fr.wikipedia.org/wiki/Radio_FM, cheriefm.fr, radioline.co) y no guardan relación con el modelo ni con robótica.
