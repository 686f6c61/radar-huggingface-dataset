# Lysandra999/Watch-Senik-0.3B-Dec

## Resumen

Watch-Senik-0.3B-Dec es un modelo de decisión de tipo router, afinado a partir de `taobao-mnn/MNN-Pocket-0.3B-Dec`, desarrollado por el usuario Lysandra999 para el proyecto Watch Senik AI. No es un modelo generativo de propósito general, sino un clasificador de decisiones tipadas que resuelve cinco tareas concretas de enrutamiento en un único paso: selección de herramienta primaria (11 clases), determinación de si se requiere una acción de hardware BLE, selección de expresión del reloj (11 clases), decisión de escalado a un modelo mayor y puntuación de urgencia (0 a 3).

El modelo está diseñado para ejecutarse en el propio dispositivo (edge-ai), concretamente en un reloj inteligente, y actúa como primera capa de un sistema mayor. Su función es decidir localmente si una petición del usuario puede resolverse con el modelo pequeño `Mini-Senik-0.3B` o debe escalarse a `Senik-Quantum-1.7B`, además de clasificar la intención y la urgencia de la notificación. El repositorio ocupa 0,8 GB y los pesos están en formato safetensors.

La relevancia de este modelo radica en su enfoque de enrutamiento tipado y de un solo paso para entornos con recursos muy limitados, donde cada milisegundo y cada vatio cuentan. Al separar la decisión de la generación, permite que un modelo de 0,3B parámetros gestione la lógica de control de un asistente wearable sin necesidad de invocar un modelo mayor en cada interacción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo derivado de `taobao-mnn/MNN-Pocket-0.3B-Dec`) |
| Parametros totales | 0,3B (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `taobao-mnn/MNN-Pocket-0.3B-Dec` ni el proceso de fine-tuning aplicado. Por el nombre y el tag `edge-ai`, se trata de un modelo compacto de 0,3B parámetros orientado a inferencia en dispositivo, pero no se especifica si emplea un transformer estándar, una variante optimizada o alguna otra arquitectura. Tampoco se indican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable es el diseño de la tarea: el modelo no genera texto libre, sino que produce decisiones tipadas en un solo paso (`single-pass typed decision router`). Las cinco tareas de decisión son `primary_tool` (clasificación en 11 clases), `needs_watch_tool` (decisión binaria con ejemplos negativos difíciles), `expression_mood` (clasificación en 11 expresiones), `escalate_to_full_senik` (decisión binaria de escalado) y `urgency` (puntuación de 0 a 3 con conciencia de horas de silencio). El autor reporta una puntuación de evaluación en conjunto reservado (held-out) de 9/9, aunque no se detalla la composición de dicho conjunto ni la métrica exacta empleada.

## Capacidades

- Clasificación de herramienta primaria entre 11 clases: `heart_rate`, `set_timer`, `set_alarm`, `sync_time`, `change_expression`, `switch_face`, `find_watch`, `set_step_goal`, `set_dnd`, `watch_status` y `general_chat`.
- Decisión binaria sobre si se requiere una acción de hardware BLE (`needs_watch_tool`), incluyendo la distinción frente a modismos y casos negativos difíciles.
- Selección de expresión del reloj entre 11 posibles (`expression_mood`).
- Decisión de escalado desde el modelo local `Mini-Senik-0.3B` al modelo mayor `Senik-Quantum-1.7B` (`escalate_to_full_senik`).
- Puntuación de urgencia en una escala de 0 a 3, con sensibilidad a las horas de silencio configuradas (`urgency`).
- Enrutamiento en un solo paso (single-pass), sin generación de texto libre.
- Soporte de tool calling: no disponible como capacidad generativa; el modelo en sí mismo actúa como router de herramientas.
- Capacidades multilingües: limitadas al inglés (`en`).
- Capacidades especiales: no se reportan modos de pensamiento, visión ni audio.

## Casos de uso

- Enrutamiento de intenciones en un reloj inteligente: el modelo recibe la petición del usuario y la clasifica en una de las 11 herramientas (`primary_tool`), permitiendo que el sistema invoque la función adecuada (temporizador, alarma, frecuencia cardíaca, etc.) sin necesidad de un modelo generativo grande en el dispositivo.
- Gestión de acciones de hardware BLE: antes de activar una operación física del reloj, el modelo determina si la petición requiere realmente una acción de hardware (`needs_watch_tool`), evitando activaciones erróneas por frases coloquiales o modismos.
- Control de la interfaz visual del reloj: el modelo selecciona la expresión o esfera adecuada (`expression_mood`) según el contexto de la conversación, lo que permite una interfaz reactiva y personalizada en el propio dispositivo.
- Decisión de escalado a un modelo mayor: cuando la petición excede las capacidades locales, el modelo marca `escalate_to_full_senik` para derivar la consulta a `Senik-Quantum-1.7B`, optimizando el uso de recursos y la latencia en el dispositivo.
- Priorización de notificaciones con horas de silencio: la puntuación de urgencia (0 a 3) permite al sistema decidir si una notificación debe mostrarse de inmediato, posponerse o silenciarse según la configuración de horas de silencio del usuario.
- Asistente de voz de bajo consumo en wearables: al ejecutarse como un router de 0,3B parámetros, el modelo puede formar parte de un pipeline de voz local en el reloj, clasificando la intención antes de invocar el modelo de generación, lo que reduce el consumo energético y la dependencia de la nube.

## Benchmarks y rendimiento

El autor reporta una puntuación de evaluación en conjunto reservado (held-out) de `9/9`. No se especifica la composición del conjunto de evaluación, el número de ejemplos, la métrica exacta ni los resultados por tarea. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Benchmark | Resultado | Notas |
|---|---|---|
| Held-out eval (autor) | 9/9 | Composición y métrica no disponibles |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 0,3B parámetros y pesos en safetensors, el tamaño del repositorio es de 0,8 GB, lo que sugiere que la inferencia en precisión completa o semi-precisión requiere aproximadamente 0,6-1,2 GB de memoria, aunque no se confirma la cuantización.
- GPU recomendadas: no disponible. Por el tag `edge-ai` y el tamaño del modelo, está pensado para ejecutarse en hardware de borde, potencialmente en CPU o NPU de un reloj inteligente.
- ¿Cabe en GPU de consumo? No se dispone de datos específicos, pero por su tamaño (0,3B parámetros) es probable que quepa en cualquier GPU de consumo moderna; sin embargo, no se confirma.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros motores. El prefijo `MNN` en el modelo base sugiere compatibilidad con el framework MNN (Mobile Neural Network), pero no se confirma en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (routers de decisión tipados para edge-ai). El modelo base `taobao-mnn/MNN-Pocket-0.3B-Dec` es el único punto de referencia mencionado, pero no se proporcionan sus especificaciones ni su rendimiento. No disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés (`en`); no se ha entrenado ni evaluado para otros idiomas.
- Es un modelo de decisión, no un modelo generativo: no produce texto libre ni respuestas conversacionales, por lo que no debe usarse como chatbot.
- El conjunto de herramientas y expresiones está fijado a 11 clases cada uno; no es extensible sin reentrenamiento.
- La evaluación reportada (9/9) carece de transparencia sobre el conjunto de prueba, el número de ejemplos y la métrica, lo que limita la confianza en la generalización.
- No se dispone de información sobre sesgos, riesgo de alucinación (limitado por ser un clasificador, pero posible en las decisiones), ni sobre el comportamiento en dominios fuera de distribución.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales del proyecto Watch Senik AI ni del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-22), lo que sugiere que no ha sido validado por la comunidad.
- No se dispone de información sobre la longitud de contexto, lo que impide evaluar su comportamiento con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lysandra999/Watch-Senik-0.3B-Dec
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Dec (referenciado en la model card; no se proporcionan más enlaces)
