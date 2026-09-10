# fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-r2-step10000

## Resumen

Este repositorio contiene un checkpoint de ajuste fino mediante LoRA del modelo π0.5 (etiqueta `pi05`) para la tarea de manipulación robótica denominada **pick3**, ejecutada sobre un brazo Franka. Se trata del resultado de la segunda ronda de entrenamiento (`r2`), en la actualización de optimizador número 10.000, lo que equivale a 40.000 exposiciones de muestras. El autor es `fm-dev` y el artefacto se publica como un bundle de inferencia y reanudación, no como un modelo de propósito general.

El interés de esta ficha es acotado y experimental: el checkpoint forma parte de una campaña de entrenamiento que apunta a 12.500 actualizaciones (50.000 exposiciones), con checkpoints guardados cada 1.000 pasos. Los pasos 5.000, 10.000 y 12.500 disponen de repositorios independientes, y el resto se conservan en un archivo de respaldo alojado en HuggingFace Datasets. El propio autor advierte que la publicación intermedia no constituye una evaluación de calidad de la política.

No se dispone de información pública sobre el número de parámetros, la longitud de contexto ni la licencia. El repositorio ocupa 11,5 GB e incluye pesos EMA de servicio, activos de normalización e historial, código fuente de inferencia, versiones exactas de dependencias y estado completo de reanudación (optimizador, RNG y sampler). La búsqueda web asociada no devolvió resultados relevantes: los enlaces recuperados corresponden a emisoras de radio en francés, sin relación con el modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base π0.5, referenciado en la model card; se aplica un adaptador LoRA de rango 32) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible (el régimen "no-history" usa imágenes base y de muñeca actuales, estado e instrucción de tarea) |
| Tipos de cuantización | no disponible (el bundle incluye pesos EMA de servicio sin especificar formato de cuantización) |
| Idiomas soportados | no disponible (el condicionamiento es una instrucción de tarea; no se documentan capacidades multilingües) |
| Licencia | no disponible (no se declara licencia en el repositorio) |
| Formato de pesos | no especificado explícitamente; el bundle incluye pesos EMA de servicio, activos de normalización e historial, código de inferencia, dependencias fijadas y estado de reanudación completo (repositorio de 11,5 GB) |

## Arquitectura y entrenamiento

El modelo base es π0.5, un modelo visión-lenguaje-acción al que se le aplica un ajuste fino LoRA de rango 32 sobre pesos congelados. El bundle trabaja con condicionamiento y pérdida de tipo *flow matching*, tal como se desprende de la mención explícita a "flow conditioning and loss" en la model card. La política consume imágenes actuales de cámara base y de muñeca, vector de estado e instrucción de tarea, y produce salidas de forma `(20, 8)`: posición absoluta xyz, cuaternión unitario XYZW en la carta de qx positivo y comando de pinza en el intervalo [0, 1]. El estado y las acciones numéricas se normalizan por desviación estándar, mientras que los tokens de estado usan una vista separada acotada por los cuantiles q01/q99 del conjunto de entrenamiento.

El entrenamiento se ejecutó localmente sobre 4 GPU RTX A6000 con lote global 4 y lote por GPU 1, sin acumulación de gradiente. La configuración usa AdamW, semilla 42 y EMA con factor 0,999⁴ = 0,996005996001. Hay un calentamiento de 250 actualizaciones hasta 5e-5 y decaimiento coseno hasta 5e-6 en el paso 12.500. La configuración completa está en `training_config.json`. Solo las filas de ejecución robótica supervisan las acciones; las imágenes de demostración, características y coordenadas originales de episodio/fotograma permanecen disponibles como historial, y el inicio de ejecución no reinicia el historial visual. Las particiones de episodios y la normalización se calculan exclusivamente con el split de entrenamiento.

## Capacidades

- Generación de acciones de manipulación robótica: produce bloques de 20 pasos con posición absoluta, orientación en cuaternión y comando de pinza.
- Condicionamiento por instrucción de tarea, junto con imagen base, imagen de muñeca y estado del robot.
- Variante "no-history" como línea base: emplea únicamente las observaciones actuales, sin memoria de fotogramas previos.
- Soporte de modo con historial mediante la función `observe(policy, base_rgb, state)`, que debe invocarse en cada fotograma observado, incluidas las demostraciones, y reiniciarse entre episodios.
- Carga y ejecución autocontenidas: `from load_model import load, observe; policy = load()` dentro del propio bundle.
- Reanudación exacta del entrenamiento: el repositorio conserva estado de optimizador, RNG y sampler, además de los pesos no EMA.
- Modo extendido "Status-D": requiere `history_keyframe_index`, `current_subgoal` e entradas causales `transition_context_*`, y devuelve `transition_status` en la salida.
- No se documentan capacidades de tool calling, function calling, agentes, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Línea base reproducible en investigación de manipulación: el checkpoint "no-history" sirve como referencia fija contra la que comparar variantes con historial o con otras configuraciones de datos, dado que la configuración de entrenamiento está fijada en `training_config.json`.
- Reanudación de campañas de entrenamiento: al incluir estado de optimizador, RNG y sampler, permite retomar la segunda ronda desde el paso 10.000 sin reconstruir el estado, algo poco habitual en checkpoints intermedios publicados.
- Evaluación offline de políticas visión-lenguaje-acción: el bundle contiene activos de normalización e historial, lo que permite reproducir el preprocesado exacto y comparar predicciones de acción contra trayectorias registradas.
- Despliegue en bucle de control sobre Franka: la API `load()`/`observe()` y el formato de salida `(20, 8)` permiten integrar la política en un controlador que consuma comandos de efector final y pinza, respetando la convención de pose Cartesian documentada.
- Estudio de ajuste fino eficiente: con LoRA de rango 32 sobre 4 GPU A6000, es un caso práctico para analizar el compromiso entre rango del adaptador, lote efectivo y número de exposiciones de muestra.
- Análisis comparativo entre checkpoints: los pasos 5.000, 10.000 y 12.500 tienen repositorios independientes, lo que facilita estudiar la evolución de la política a lo largo del entrenamiento con el mismo pipeline de evaluación.
- Pruebas de reproducibilidad de semilla: con semilla 42 y dependencias fijadas, el bundle permite replicar exactamente condiciones de ejecución para auditar resultados internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica explícitamente que la publicación intermedia no es una evaluación de calidad de la política y que la evaluación offline, cuando se incluye, no establece la tasa de éxito en robot real. El repositorio registra 0 descargas y 0 "likes", por lo que tampoco existe validación externa documentada.

## Requisitos de hardware

- Entrenamiento (según la model card): 4 GPU RTX A6000, lote por GPU 1 y lote global 4, sin acumulación de gradiente. La elección de lote pequeño sugiere restricciones de memoria en el ajuste fino, aunque no se publica el consumo exacto de VRAM.
- VRAM para inferencia: no disponible. El repositorio ocupa 11,5 GB, pero ese tamaño incluye pesos EMA, activos de normalización e historial y estado completo de reanudación, por lo que no equivale a la huella del modelo en memoria.
- GPU de consumo: no disponible como dato confirmado. Dado que el entrenamiento se realizó en A6000, no hay evidencia publicada de que la inferencia quepa en GPU de gama consumer.
- Opciones de despliegue: el bundle proporciona su propio código de inferencia (`load_model.py`), junto con el planificador Writer exportado y el fotograma de control correspondiente. No se mencionan vLLM, TGI, llama.cpp ni Ollama; al tratarse de una política visión-lenguaje-acción con cabeza de acciones, estos runners de texto no son aplicables sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-r2-step10000 (este) | no disponible | no disponible | sin benchmarks publicados | no disponible | HuggingFace, 0 descargas |
| pi05-pick3 baseline, paso 5.000 (mismo autor, `r2`) | no disponible | no disponible | sin benchmarks publicados | no disponible | repositorio independiente citado en la model card |
| pi05-pick3 baseline, paso 12.500 (mismo autor, `r2`) | no disponible | no disponible | sin benchmarks publicados | no disponible | repositorio independiente citado en la model card |
| Otras políticas VLA de manipulación con fine-tuning LoRA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con alternativas de otros autores. La model card únicamente referencia los checkpoints hermanos de la misma campaña y el archivo de respaldo `fm-dev/pi05-checkpoint-backups`.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo jurídico y no deberían asumirse como permitidos.
- Sin validación externa: 0 descargas y 0 "likes" en el momento de los metadatos, y ninguna evaluación de tasa de éxito en robot real publicada.
- Checkpoint intermedio: el paso 10.000 está a mitad de la campaña prevista (12.500 actualizaciones), por lo que no representa el estado final del entrenamiento.
- Componentes de acción sin supervisión: la model card declara que las componentes no supervisadas son `[]`, pero advierte de que la salida de pinza de la tarea "Shuffle" no tiene supervisión de comando y no debe interpretarse como control aprendido de la pinza. La tarea "Button Order" solo dispone de etiquetas verificadas limitadas de comando cerrado.
- Enmascaramiento de acciones desconocidas: las componentes desconocidas permanecen como NaN/false en el conjunto de datos y se enmascaran tanto en el condicionamiento de flujo como en la pérdida, lo que puede dejar dimensiones de la acción sin señal de aprendizaje efectiva.
- Convención de pose estricta: la pose Cartesian registrada del efector final debe coincidir con la del controlador de recogida; no debe aplicarse un desplazamiento adicional de herramienta o brida, so pena de comandos incorrectos.
- Dependencia del régimen de historial: en modelos con historial, `observe()` debe llamarse en cada fotograma, incluidas las demostraciones, y reiniciarse entre episodios; omitirlo altera el comportamiento de la política.
- Alcance restringido: es una política específica para la tarea pick3 sobre Franka, no un modelo de propósito general; no hay evidencia de generalización a otras tareas, morfologías o entornos.
- Idiomas y sesgos: no hay información sobre comportamiento multilingüe ni sobre sesgos, y el condicionamiento lingüístico se limita a la instrucción de tarea del conjunto de datos.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe riesgo análogo de acciones fuera de distribución cuando la escena difiere de la distribución de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fm-dev/pi05-pick3-baseline-lora-gbs4-pgb1-gpu4-r2-step10000
- Archivo de respaldo de checkpoints: https://huggingface.co/datasets/fm-dev/pi05-checkpoint-backups/tree/main/checkpoints/r2
- Búsqueda web: no se encontraron resultados relevantes. Los enlaces recuperados (radio-en-ligne.fr, fr.wikipedia.org/wiki/Radio_FM, cheriefm.fr, radioline.co) corresponden a emisoras de radio en francés y no guardan relación con el modelo.
