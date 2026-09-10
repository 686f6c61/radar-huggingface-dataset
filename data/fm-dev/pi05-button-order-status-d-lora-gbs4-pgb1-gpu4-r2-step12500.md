# fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step12500

## Resumen

El modelo `fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step12500` es un ajuste fino de segundo round (r2) mediante LoRA sobre π0.5, orientado a la tarea robótica **button_order** sobre un brazo Franka. Lo publica el usuario `fm-dev` en Hugging Face como un paquete de investigación, no como un producto: el propio autor indica que la publicación intermedia "no es una evaluación de calidad de la política" y que la evaluación offline incluida "no establece una tasa de éxito en robot real". El checkpoint corresponde al paso 12.500 de optimizador, equivalente a 50.000 exposiciones de muestra.

El entrenamiento se realizó en local sobre 4 GPU RTX A6000, con batch global 4, batch por GPU 1 y sin acumulación de gradiente. La configuración usa AdamW, LoRA de rango 32, semilla 42, warmup de 250 actualizaciones hasta 5e-5 y decaimiento coseno hasta 5e-6 en el paso 12.500, con EMA de factor 0,999^4 = 0,996005996001. Los checkpoints se guardan cada 1.000 actualizaciones y en el paso final 12.500; el sufijo r2 mantiene estos artefactos separados del experimento original de 6.250 pasos.

La relevancia de esta ficha es acotada y muy específica: se trata de un artefacto de investigación reproducible (incluye estado de reanudación completo, dependencias exactas y código de inferencia) para estudiar el ajuste fino de modelos visión-lenguaje-acción con LoRA en manipulación robótica, y para inspeccionar el mecanismo Status-D de condicionamiento temporal. No hay información pública sobre parámetros totales, licencia o idiomas, y los resultados disponibles se limitan a métricas offline de error de posición y a un recuento de ventanas de validación revisadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (según el tag `pi05`), modelo visión-lenguaje-acción ajustado con LoRA; topología interna no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible como valor único. El contexto visual de Status-D muestrea 32 fotogramas uniformes del prefijo observado [0,t] más un keyframe nullable del Writer (528 tokens visuales en total); el contexto de Status usa 48 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de política robótica; no se documentan capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente. El bundle incluye pesos EMA de servicio, activos de normalización e historial, código fuente de inferencia, versiones exactas de dependencias y estado completo de reanudación (no EMA, optimizador, RNG, sampler). Tamaño del repositorio: 12,8 GB |
| Tarea | button_order sobre robot Franka |
| Variante de ajuste | LoRA de rango 32, segundo round (r2), checkpoint 12.500 |
| Optimizador | AdamW, semilla 42, warmup 250 actualizaciones hasta 5e-5, decaimiento coseno hasta 5e-6 en el paso 12.500 |
| EMA | 0,999^4 = 0,996005996001 |
| Batch | Global 4, por GPU 1, sin acumulación de gradiente |
| Hardware de entrenamiento | 4 GPU RTX A6000 |
| Formato de salida | Tensor de forma (20, 8): xyz absoluto, cuaternión XYZW unitario en la carta de qx positiva y comando de pinza en [0,1] |
| Normalización | Estado y acciones numéricas con normalización STD; los tokens de estado usan una vista acotada train-q01/q99 separada |

## Arquitectura y entrenamiento

La información disponible describe un ajuste fino LoRA de rango 32 sobre π0.5 para la tarea button_order, con el estado y las acciones normalizados mediante STD y una vista separada acotada por los cuantiles q01/q99 del split de entrenamiento para los tokens de estado. El entrenamiento se ejecutó sobre 4 RTX A6000 con batch global 4 y batch por GPU 1 sin acumulación de gradiente, alcanzando 50.000 exposiciones de muestra en 12.500 actualizaciones del optimizador. Los checkpoints se guardan cada 1.000 actualizaciones. Se aplica EMA con factor 0,996005996001 y el paquete incluye tanto los pesos EMA de servicio como el estado de reanudación completo no EMA. La información no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica documentada es el esquema **Status-D** de condicionamiento temporal. Status-D construye el contexto con 32 fotogramas muestreados uniformemente sobre el prefijo completo del episodio observado [0,t], más un keyframe nullable del Writer (528 tokens visuales en total) y un subobjetivo actual del Writer mantenido. El Writer se inicializa al comienzo de la ejecución y se actualiza en los eventos de Status; su temporización offline se proyecta con estimaciones gruesas de eventos y el autor subraya explícitamente que esto es condicionamiento de profesor (*teacher conditioning*), no una afirmación de despliegue online con Status predicho. Las etiquetas positivas del span de Status usan corchetes de eventos soportados; la supervisión de puntos finales y negativos proviene únicamente de ventanas revisadas de forma explícita, y las etiquetas no revisadas permanecen enmascaradas. La procedencia de la revisión es revisión por agente/modelo, no verdad de referencia humana.

Otras decisiones de diseño documentadas: solo las filas de ejecución del robot supervisan las acciones, mientras que las imágenes de demostración, las características y las coordenadas originales de episodio/fotograma permanecen como historial sin que el inicio de ejecución reinicie el historial visual; los splits de episodios y la normalización usan únicamente el split de entrenamiento. El contexto de Status de 48 pasos emplea comandos de pose registrados y estado medido, y su característica de pinza-comando está deshabilitada de forma consistente en entrenamiento e inferencia, sin inventar ningún comando de pinza ausente. Las incrustaciones de estado histórico están deshabilitadas. Los componentes de acción desconocidos permanecen como NaN/false en el dataset y se enmascaran tanto en el condicionamiento de flujo como en la pérdida; la lista de componentes totalmente no supervisados está vacía. La convención de pose cartesiana del efector final y de la herramienta debe coincidir con el controlador de recogida, sin aplicar desplazamientos adicionales de herramienta o brida.

## Capacidades

- Generación de comandos de acción para manipulación robótica: produce tensores de forma (20, 8) con posición xyz absoluta, orientación como cuaternión XYZW unitario en la carta de qx positiva y comando de pinza en el rango [0,1].
- Ejecución de la tarea button_order sobre un brazo Franka, con supervisión de acciones limitada a las filas de ejecución del robot.
- Condicionamiento temporal Status-D: acepta `history_keyframe_index` (un fotograma observado o None), `current_subgoal` e entradas causales `transition_context_*` en `policy.infer(...)`, y devuelve `transition_status` como parte de la salida.
- Mantenimiento de historial visual mediante la función `observe(policy, base_rgb, state)`, que debe invocarse en cada fotograma observado, incluidas las demostraciones, con reinicio entre episodios.
- Uso del calendario del Writer exportado y del fotograma de control correspondiente para alinear la inferencia.
- Aprendizaje de trayectorias a partir de ejemplos con componentes de acción parcialmente enmascarados, manteniendo el enmascaramiento en condicionamiento de flujo y pérdida.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento lingüístico, matemáticas, código, visión general, audio ni modo de pensamiento. Los idiomas soportados no están disponibles.

## Casos de uso

- Investigación en ajuste fino con LoRA sobre modelos visión-lenguaje-acción: el paquete incluye configuración de entrenamiento, versiones exactas de dependencias y estado de reanudación completo, lo que permite reproducir o continuar el experimento de 12.500 actualizaciones a partir del checkpoint publicado.
- Despliegue en banco de pruebas sobre Franka para la tarea button_order: el bundle proporciona código de inferencia (`load_model.py`) y pesos EMA de servicio, de modo que el modelo puede cargarse con `load()` y conectarse al controlador del robot para pruebas controladas en laboratorio.
- Evaluación comparativa de checkpoints intermedios: al guardarse checkpoints cada 1.000 actualizaciones, el mismo pipeline permite medir la evolución del error de posición a lo largo del entrenamiento y comparar los pasos intermedios con el paso final 12.500.
- Estudio del condicionamiento temporal con Status: los investigadores pueden alimentar `history_keyframe_index`, `current_subgoal` y `transition_context_*` de forma controlada para analizar cómo influye el mecanismo Status-D en la salida de acciones y en `transition_status`.
- Generación de datos y condicionamiento de profesor: la temporización offline del Writer, proyectada con estimaciones gruesas de eventos, puede usarse como señal de profesor para entrenar o auditar políticas que predigan el estado de forma online en trabajos posteriores.
- Comparación frente a una referencia trivial de mantenimiento de posición: el propio bundle incluye `hold-current-reference.json`, de modo que se puede replicar la comparación entre la política y la estrategia de mantener la posición medida actual en los mismos datos de prueba retenidos.
- Auditoría del enmascaramiento de supervisión: el diseño documentado (componentes no supervisados como NaN/false, etiquetas no revisadas enmascaradas, pinza sin supervisión en Shuffle) sirve como caso de estudio de buenas prácticas de trazabilidad de etiquetas en robótica.
- Integración en pipelines de evaluación offline de políticas robóticas: el paquete incluye `evaluation.json` y `packaged-inference-check.txt`, lo que facilita incorporar comprobaciones de salidas finitas y de inferencia empaquetada a un proceso automatizado de validación.

## Benchmarks y rendimiento

No hay resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que se trata de una política robótica. Los únicos datos numéricos publicados son de evaluación offline sobre las mismas entradas de prueba retenidas:

| Metrica (error de posicion) | Este modelo | Hold current measured position |
|---|---:|---:|
| H1 mean L2 | 2,11 cm | 1,78 cm |
| H20 mean L2 | 4,52 cm | 5,64 cm |

Detección de spans de Status con umbral por defecto 0,5 sobre 21 ventanas de validación revisadas:

| Metrica | Valor |
|---|---|
| Verdaderos positivos (TP) | 18 |
| Falsos positivos (FP) | 3 |
| Verdaderos negativos (TN) | 0 |
| Falsos negativos (FN) | 0 |
| Ventanas negativas revisadas que dispararon falsamente | 3 de 3 |

El autor advierte que este conjunto de etiquetas es pequeño y está revisado por agente/modelo, y que no establece un disparo online fiable del Writer. También indica que la publicación intermedia no es una evaluación de calidad de la política y que la evaluación offline no establece tasa de éxito en robot real.

## Requisitos de hardware

- Entrenamiento documentado: 4 GPU RTX A6000, con batch global 4 y batch por GPU 1 sin acumulación de gradiente. No se documenta el consumo de VRAM durante el entrenamiento.
- VRAM estimada para inferencia: no disponible. El repositorio ocupa 12,8 GB, pero ese tamaño incluye pesos EMA, activos de normalización e historial, código de inferencia y estado de reanudación completo (optimizador, RNG, sampler), por lo que no representa la huella de inferencia.
- GPU recomendadas: no disponibles. La única referencia es el hardware de entrenamiento (RTX A6000).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el paquete incluye su propio código de inferencia y se carga con `from load_model import load, observe; policy = load()` desde el bundle. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni otras pilas de servicio, que además están orientadas a modelos de lenguaje y no a políticas visión-lenguaje-acción.
- Requisitos de integración: la convención de pose cartesiana del efector final y de la herramienta debe coincidir con el controlador de recogida, sin aplicar desplazamientos adicionales. Es necesario invocar `observe(...)` en cada fotograma observado y reiniciar el historial entre episodios.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos suficientes en la información proporcionada para comparar con modelos de terceros de la misma categoría. Las únicas referencias comparables documentadas son internas o triviales:

| Referencia | Tipo | Parametros | Contexto | Error H1 (L2) | Error H20 (L2) | Licencia |
|---|---|---|---|---|---|---|
| Este modelo (r2, paso 12.500) | LoRA de π0.5 para button_order | no disponible | Status-D: 32 fotogramas + keyframe (528 tokens visuales); contexto de Status de 48 pasos | 2,11 cm | 4,52 cm | no disponible |
| Hold current measured position | Referencia trivial (mantener posición medida) | no aplica | no aplica | 1,78 cm | 5,64 cm | no aplica |
| Experimento original de 6.250 pasos (r1) | LoRA de π0.5, mismo pipeline | no disponible | no disponible | no disponible | no disponible | no disponible |
| π0.5 base | Modelo visión-lenguaje-acción base | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con modelos de terceros de tamaño o tarea equivalentes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La publicación intermedia no constituye una evaluación de calidad de la política; el autor lo indica de forma explícita.
- La evaluación offline incluida no establece una tasa de éxito en robot real.
- El error de posición H1 del modelo (2,11 cm) es peor que la referencia trivial de mantener la posición medida actual (1,78 cm), aunque en H20 el modelo mejora esa referencia (4,52 cm frente a 5,64 cm). No se debe interpretar el checkpoint como superior en todos los horizontes.
- La detección de spans de Status carece de fiabilidad online: de 21 ventanas de validación revisadas, las 3 ventanas negativas revisadas dispararon falsamente (TN = 0). El conjunto de etiquetas es pequeño y está revisado por agente/modelo, no por humanos.
- La temporización del Writer offline se proyecta con estimaciones gruesas de eventos y es condicionamiento de profesor; no es una afirmación de despliegue online con Status predicho.
- La salida de pinza de Shuffle no tiene supervisión de comando y no debe interpretarse como control de pinza aprendido. La tarea Button Order solo dispone de etiquetas verificadas limitadas de comando cerrado.
- Las etiquetas no revisadas permanecen enmascaradas, por lo que la cobertura de supervisión es parcial; los componentes de acción desconocidos se mantienen como NaN/false.
- La convención de pose cartesiana registrada debe coincidir con el controlador de recogida; aplicar un desplazamiento adicional de herramienta o brida produciría comandos incorrectos.
- La característica de pinza-comando del contexto de Status de 48 pasos está deshabilitada de forma consistente; no se inventa ningún comando de pinza ausente.
- Las incrustaciones de estado histórico están deshabilitadas.
- Licencia no disponible: no puede confirmarse la autorización de uso comercial ni las condiciones de redistribución.
- Idiomas soportados no disponibles; no se documentan capacidades lingüísticas ni multilingües.
- No se documentan sesgos concretos. Al ser un modelo entrenado sobre datos de un robot y una tarea específicos, es esperable un comportamiento degradado fuera de esa distribución, pero la información disponible no cuantifica este extremo.
- Riesgo de alucinación: no disponible como métrica; en el contexto de una política de acción, el riesgo relevante es la generación de comandos no válidos o fuera de distribución, mitigado parcialmente por la comprobación de salidas finitas declarada.
- No hay información sobre parámetros totales, cuantizaciones soportadas, VRAM de inferencia ni latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fm-dev/pi05-button-order-status-d-lora-gbs4-pgb1-gpu4-r2-step12500
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web realizada. Los resultados devueltos corresponden a emisoras de radio y no guardan relación con el modelo.
