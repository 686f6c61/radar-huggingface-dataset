# fm-dev/pi05-button-order-uniform32-lora-gbs4-pgb1-gpu4-r2-step12500

## Resumen

El modelo `fm-dev/pi05-button-order-uniform32-lora-gbs4-pgb1-gpu4-r2-step12500` es un ajuste fino con LoRA de segunda ronda (r2) sobre π0.5, orientado a una tarea de robótica concreta denominada *button_order* sobre un brazo Franka. Lo publica el usuario `fm-dev` como un paquete de inferencia completo: incluye los pesos EMA de servicio, los activos de normalización e historial, el código fuente de inferencia, las versiones exactas de dependencias y el estado de reanudación no-EMA (optimizador, RNG y sampler). El repositorio ocupa 12,8 GB y se distribuye como *pipeline* de robótica.

Se trata del punto de control correspondiente a 12.500 actualizaciones del optimizador (equivalentes a 50.000 exposiciones de muestra), entrenado localmente en 4 GPU RTX A6000 con batch global 4, batch por GPU 1 y sin acumulación de gradiente. El régimen de entrenamiento usa warmup de 250 actualizaciones hasta 5e-5, decaimiento coseno hasta 5e-6 en el paso 12.500, AdamW, LoRA de rango 32 y semilla 42, con EMA de 0,999^4 = 0,996005996001. La estrategia *Uniform32* muestrea 32 fotogramas uniformes sobre el prefijo completo del episodio observado [0,t], con 512 tokens visuales.

Su relevancia es la de un artefacto de investigación reproducible dentro de una campaña de ajuste fino concreto, no la de un modelo de propósito general: el propio autor advierte que la publicación intermedia no constituye una evaluación de calidad de la política y que no se reclama ninguna tasa de éxito en robot físico. Las especificaciones del modelo base π0.5 (parámetros, contexto, cuantizaciones) no se detallan en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo base π0.5 (vision-language-action) ajustado con LoRA de rango 32; detalles de arquitectura del base no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (usa 32 fotogramas muestreados del prefijo del episodio y 512 tokens visuales) |
| Tipos de cuantizacion | no disponible (se publican pesos EMA y estado no-EMA; no se especifican cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de robótica; la model card está en inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente (se mencionan pesos EMA de servicio y estado de reanudación completo; el paquete incluye código de inferencia y dependencias fijadas) |
| Dimension de salida | (20, 8): xyz absoluto, cuaternión XYZW unitario en la carta de qx positiva y comando de pinza en [0,1] |
| Tarea objetivo | *button_order* sobre robot Franka |
| Tamaño del repositorio | 12,8 GB |
| Fecha de publicación | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo se construye mediante ajuste fino LoRA (rango 32) sobre π0.5 para una tarea específica de manipulación (*button_order*). El entrenamiento se ejecutó en 4 GPU RTX A6000 con batch global 4 y batch por GPU 1, sin acumulación de gradiente, durante 12.500 actualizaciones del optimizador que corresponden a 50.000 exposiciones de muestra. El esquema de optimización es AdamW con semilla 42, warmup de 250 actualizaciones hasta un *learning rate* de 5e-5 y decaimiento coseno hasta 5e-6 en el paso final 12.500. Se aplica EMA con factor 0,999^4 = 0,996005996001, y son esos pesos EMA los que se empaquetan para servicio. Los checkpoints se guardan cada 1.000 actualizaciones.

La innovación procedimental destacable es la configuración *Uniform32*: 32 fotogramas muestreados de forma uniforme sobre el prefijo completo del episodio observado [0,t], con 512 tokens visuales, incluyendo el historial de demostraciones. Las *embeddings* de estado histórico están deshabilitadas. Solo las filas de ejecución del robot supervisan las acciones; las imágenes, características y coordenadas originales de episodio/fotograma de las demostraciones permanecen disponibles como historial, y el inicio de la ejecución no reinicia el historial visual. Los *splits* de episodios y la normalización se calculan únicamente con el *split* de entrenamiento. La normalización numérica de estado y acciones usa STD, mientras que los tokens de estado emplean una vista acotada train-q01/q99. Los componentes de acción desconocidos permanecen como NaN/false en el conjunto de datos y se enmascaran tanto en el condicionamiento de *flow* como en la pérdida; la lista de componentes totalmente no supervisados es vacía ([]).

## Capacidades

- Generación de acciones de manipulación robótica: produce trayectorias de forma (20, 8) con posición xyz absoluta, orientación como cuaternión XYZW unitario en la carta de qx positiva y comando de pinza en el rango [0,1].
- Política visomotora con historial: consume observaciones RGB base y estado a través de la función `observe(policy, base_rgb, state)` en cada fotograma observado, incluidas las demostraciones, con reinicio entre episodios.
- Condicionamiento por subobjetivo y contexto causal: en la variante *Status-D* requiere `history_keyframe_index` (un fotograma observado o None), `current_subgoal` y entradas causales `transition_context_*`, y devuelve `transition_status` en la salida.
- Ejecución sobre Franka: la convención de pose cartesiana del efector final registrada debe coincidir con el controlador de recogida de datos (no aplicar un desplazamiento extra de herramienta/brida).
- Inferencia reproducible: el paquete incluye código de inferencia, dependencias fijadas y una comprobación de inferencia empaquetada con salidas finitas.
- No se documentan capacidades de *tool calling*, razonamiento multi-paso genérico, matemáticas, visión general, audio ni multilingüismo de propósito general.

## Casos de uso

- Investigación en aprendizaje por imitación para manipulación: el paquete permite reproducir exactamente el punto de control de 12.500 actualizaciones (semilla 42, EMA y estado de reanudación incluidos), lo que sirve para comparar curvas de entrenamiento frente a los checkpoints de 5.000 y 10.000 del mismo autor.
- Pulsación de botones en un banco de pruebas Franka: la tarea *button_order* se usa para estudiar control fino de contacto; hay que tener en cuenta que solo existe un conjunto limitado de etiquetas de comando cerrado verificadas.
- Evaluación comparativa de estrategias de muestreo temporal: la configuración *Uniform32* (32 fotogramas sobre [0,t], 512 tokens visuales) puede contrastarse con variantes que habiliten *embeddings* de estado histórico.
- Reanudación de experimentos de ajuste fino: el estado no-EMA, del optimizador, RNG y sampler permite continuar el entrenamiento desde el paso 12.500 sin reconstruir el *pipeline*.
- Instrumentación de políticas con historial: la API `observe(...)` facilita registrar el historial visual de demostraciones y verificar que el inicio de ejecución no reinicia dicho historial.
- Pruebas de condicionamiento transitorio (*Status-D*): el uso de `current_subgoal`, `history_keyframe_index` y `transition_context_*` permite estudiar cómo el modelo segmenta transiciones entre subobjetivos.
- Despliegue *offline* de referencia: la comprobación de inferencia empaquetada y la evaluación *offline* (`evaluation.json`) sirven como *smoke test* de integración antes de cualquier prueba en robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que se completó una evaluación *offline* y que las comprobaciones de inferencia desde el código empaquetado y de salidas finitas fueron superadas (véanse `evaluation.json` y `packaged-inference-check.txt`), pero no se aportan cifras y se declara explícitamente que no se reclama ninguna tasa de éxito en robot físico.

## Requisitos de hardware

- Entrenamiento registrado: 4 GPU RTX A6000 en local, batch global 4, batch por GPU 1, sin acumulación de gradiente.
- VRAM de inferencia: no disponible de forma explícita. El repositorio ocupa 12,8 GB e incluye pesos EMA de servicio, activos de normalización e historial, código fuente y estado de reanudación completo (no-EMA, optimizador, RNG y sampler), por lo que el peso real de los pesos de servicio es inferior a esa cifra.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; no puede determinarse sin conocer el tamaño de los pesos del modelo base ni la cuantización.
- Opciones de despliegue: el paquete se carga con `from load_model import load, observe; policy = load()`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Paso | Régimen | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pi05-button-order-uniform32-lora-gbs4-pgb1-gpu4-r2-step12500 | π0.5 + LoRA r32 | button_order (Franka) | 12.500 | 4x RTX A6000, batch global 4 | no disponible | repo propio + estado de reanudación |
| pi05 ... step5000 (mismo autor) | π0.5 + LoRA | button_order (Franka) | 5.000 | misma campaña r2 | no disponible | repositorio independiente |
| pi05 ... step10000 (mismo autor) | π0.5 + LoRA | button_order (Franka) | 10.000 | misma campaña r2 | no disponible | repositorio independiente |
| Experimentos r1 (6.250 pasos, mismo autor) | π0.5 + LoRA | button_order (Franka) | 6.250 | campaña original | no disponible | artefactos separados en el archivo de respaldo |

No se dispone de datos de arquitectura, parámetros, contexto o rendimiento de alternativas externas en la información proporcionada, por lo que no es posible una comparación cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- La publicación intermedia no constituye una evaluación de la calidad de la política; el autor lo advierte de forma explícita.
- No se reclama ninguna tasa de éxito en robot físico. La evaluación *offline*, si se incluye, no establece el éxito en robot real.
- El componente de pinza de la tarea *Shuffle* carece de supervisión de comando y no debe interpretarse como control de pinza aprendido.
- La tarea *Button Order* solo cuenta con un conjunto limitado de etiquetas de comando cerrado verificadas.
- Restricciones de licencia: no disponibles, lo que impide determinar si el uso comercial está permitido.
- Acoplamiento a la convención de pose: la pose cartesiana registrada debe coincidir con el controlador de recogida de datos; no debe aplicarse un desplazamiento adicional de herramienta o brida.
- Dependencia del historial: para modelos con historial es obligatorio llamar a `observe(policy, base_rgb, state)` en cada fotograma observado, incluidas las demostraciones, y reiniciar entre episodios.
- Dependencia de la variante *Status-D*: requiere `history_keyframe_index`, `current_subgoal` y entradas causales `transition_context_*` coherentes.
- Se debe usar el calendario del *Writer* exportado y el fotograma de control correspondiente.
- No se documentan sesgos, cobertura idiomática ni riesgos de alucinación textual, al no tratarse de un modelo de lenguaje de propósito general.
- Los componentes de acción desconocidos se enmascaran (NaN/false): interpretar esas dimensiones como predicciones válidas sería un error.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fm-dev/pi05-button-order-uniform32-lora-gbs4-pgb1-gpu4-r2-step12500
- Archivo de respaldo de checkpoints (conjunto de datos): https://huggingface.co/datasets/fm-dev/pi05-checkpoint-backups/tree/main/checkpoints/r2
- Referencias a *training_config.json*, `load_model.py`, `evaluation.json` y `packaged-inference-check.txt` dentro del propio repositorio.
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, su paper, blog, repositorio o demostración (los resultados devueltos corresponden a emisoras de radio en francés y no guardan relación).
