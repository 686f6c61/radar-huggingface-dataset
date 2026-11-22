# orchestrallabs/pi05-yam-holesaw-15hz-three-camera

## Resumen

El modelo `orchestrallabs/pi05-yam-holesaw-15hz-three-camera` es una política de control robótico derivada de π0.5 (pi05), el modelo fundacional de visión-lenguaje-acción desarrollado por Physical Intelligence. Lo publica Orchestral Labs, que ha realizado un ajuste fino completo (full-parameter fine-tune) de los pesos base de π0.5 para una tarea concreta de manipulación: recoger sierras de corona (hole saws) de una cinta transportadora en movimiento y depositarlas en una caja roja. La política controla únicamente el brazo izquierdo de un robot YAM; el brazo derecho permanece estacionario.

El modelo consume una observación compuesta por tres cámaras (vista base, muñeca izquierda y muñeca derecha) y predice 15 comandos consecutivos de siete dimensiones a 15 Hz. Se distribuye en el formato nativo de OpenPI (pesos en `params/`, 12,4 GB de repositorio) y está pensado para importarse mediante la familia OpenPI con `policy_config=none` y `model_action_dim=32`.

Su relevancia es la de un artefacto de investigación reproducible: documenta con precisión el dataset de entrenamiento (101 grabaciones, 11 reservadas para evaluación), la configuración del ajuste (10.000 actualizaciones, batch global 32, semilla 42) y una evaluación offline con métricas concretas de error articular y de pinza. No es un modelo de propósito general ni un LLM conversacional, sino una política de imitación especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (pi05) de Physical Intelligence, modelo visión-lenguaje-acción para control robótico; detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (horizonte de acción: 15 pasos a 15 Hz) |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar en `params/`) |
| Idiomas soportados | no disponible (instrucción de entrenamiento en inglés) |
| Licencia | Gemma Terms of Use (incluye restricciones de uso de la sección 3.2 y la política de usos prohibidos de Google) |
| Formato de pesos | formato nativo de OpenPI (`params/`); repositorio de 12,4 GB |

## Arquitectura y entrenamiento

La política parte de los pesos base de π0.5 de Physical Intelligence y se ajusta con entrenamiento de imitación supervisada sobre el dataset `orchestrallabs/holesaw-conveyor-praxis-yam-15hz`. El ajuste es de parámetros completos, con 10.000 actualizaciones, batch global de 32 y semilla 42. Se usan 101 grabaciones fuente para entrenamiento y 11 grabaciones reservadas para evaluación, manteniendo juntos los segmentos de una misma grabación para evitar fugas de información entre particiones. El cargador consume directamente cada fila publicada a 15 Hz.

La interfaz robótica es explícita: la entrada cruda es `observation.joint_state` y el objetivo es `action.joint`, cada uno con seis ángulos articulares del YAM seguidos de una pinza continua donde 1 significa abierta. El cargador aplica `1 - g` al estado y al objetivo de la pinza antes de la normalización. Los seis objetivos articulares son relativos al estado articular de la consulta, mientras que el objetivo de la pinza es absoluto. Las tres cámaras se mapean de dataset a inferencia como `top_left` → `base_0_rgb`, `wrist_left` → `left_wrist_0_rgb` y `wrist_right` → `right_wrist_0_rgb`, y cada fotograma se ajusta a 224 × 224 RGB con `resize_with_pad` de OpenPI, preservando la relación de aspecto.

## Capacidades

- Control robótico de manipulación: genera comandos articulares de siete dimensiones (seis ángulos más pinza) para el brazo izquierdo de un YAM.
- Predicción de horizonte de acción: emite 15 comandos consecutivos por observación a 15 Hz.
- Percepción multi-cámara: integra tres vistas RGB simultáneas (base, muñeca izquierda y muñeca derecha), siendo la imagen de muñeca derecha una entrada activa.
- Ejecución condicionada por instrucción en lenguaje natural: la instrucción de entrenamiento es «Pick up the hole saws from the moving conveyor belt and place them in the red case».
- Seguimiento de objetos en movimiento: entrenado sobre una cinta transportadora en movimiento.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento; no es un modelo de lenguaje.

## Casos de uso

- Recogida automatizada de piezas en cinta transportadora: la política está entrenada específicamente para tomar sierras de corona de una cinta en movimiento y colocarlas en una caja roja, por lo que es adecuada para células de pick-and-place con transporte continuo.
- Investigación en imitación robótica: sirve como referencia reproducible de ajuste fino completo de π0.5, con dataset, semilla, batch y particiones documentados, útil para replicar experimentos o comparar variantes de cámara.
- Evaluación de variantes de configuración de sensores: el autor publica una variante de dos cámaras, lo que permite comparar el efecto del número de vistas sobre el error articular y de pinza en la misma tarea.
- Integración en pipelines OpenPI: se importa con la familia OpenPI, `policy_config=none` y `model_action_dim=32`, y el checkpoint aporta su mapeo de cámaras y horizonte de acción, lo que facilita su despliegue en un stack existente.
- Conversión de convenciones de pinza en cliente: el modelo documenta la conversión `clip(1 - g, 0, 1)` para traducir las acciones devueltas a comandos nativos, útil como plantilla de adaptación entre convenciones de robot.
- Docencia y prototipado de políticas VLA: al ser un checkpoint pequeño en alcance (una tarea, un brazo) y con métricas offline publicadas, sirve para ilustrar el ciclo completo observación → acción en robótica.
- Validación offline antes de despliegue físico: las métricas de MAE articular y de pinza permiten filtrar regresiones sin acceso al robot, aunque no sustituyen una medición de éxito físico.

## Benchmarks y rendimiento

Evaluación offline sobre 128 observaciones reservadas equiespaciadas, con 15 pasos objetivo por observación:

| Metrica | Valor |
|---|---|
| MAE articular | 0,08122 rad |
| MAE de pinza (escala nativa 0–1) | 0,10025 |
| Precisión apertura/cierre de pinza (umbral 0,5) | 89,7 % |
| Éxito físico de pick-and-place | no medido |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio de pesos ocupa 12,4 GB, lo que da una cota inferior orientativa del espacio necesario para cargar los pesos sin cuantizar.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer.
- Opciones de despliegue: pila OpenPI (importación con `policy_config=none` y `model_action_dim=32`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles; el modelo opera a 15 Hz y emite 15 acciones por inferencia, pero no se publican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-yam-holesaw-15hz-three-camera | no disponible | 15 acciones a 15 Hz | MAE articular 0,08122 rad; MAE pinza 0,10025; precisión pinza 89,7 % | Gemma Terms of Use | Hugging Face (OpenPI) |
| pi05-yam-holesaw-15hz-two-camera | no disponible | 15 acciones a 15 Hz (según variante) | no disponible | Gemma Terms of Use | Hugging Face (OpenPI) |
| π0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible | según términos de Physical Intelligence | pesos base referenciados por el autor |

No se dispone de datos suficientes para comparar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea, un único brazo (el izquierdo) y un único montaje de robot YAM; no generaliza a otras tareas, objetos o brazos.
- Éxito físico no medido: las métricas publicadas son offline (error articular y de pinza); no hay evidencia de tasa de éxito real de pick-and-place.
- Dependencia del montaje de cámaras: el mapeo de las tres vistas y el preprocesado `resize_with_pad` a 224 × 224 son parte del contrato; desviarse de ellos degrada la política.
- Convenciones de acción estrictas: los objetivos articulares son relativos al estado de la consulta y la pinza es absoluta, con conversión `1 - g`; un cliente que no respete estas convenciones producirá comandos incorrectos.
- Riesgo de alucinación: no aplica en el sentido de texto, pero la política puede generar comandos plausibles pero incorrectos ante observaciones fuera de distribución.
- Sesgos: no documentados; al entrenarse con 101 grabaciones de un entorno concreto, hereda las condiciones de iluminación, posiciones y objetos de ese entorno.
- Idiomas: la instrucción de entrenamiento está en inglés; no se documenta soporte multilingüe.
- Licencia: uso y redistribución sujetos a los Gemma Terms of Use, incluida la sección 3.2 y la política de usos prohibidos de Google; conviene revisar estas restricciones antes de un uso comercial.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-three-camera
- Variante de dos cámaras: https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-two-camera
- Dataset: https://huggingface.co/datasets/orchestrallabs/holesaw-conveyor-praxis-yam-15hz/tree/fdae77def041115298f5720480925faa1ee3748b
- Configuración del procesador (openpi_config.json): https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-three-camera/blob/main/openpi_config.json
- Métricas de evaluación (evaluation.json): https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-three-camera/blob/main/evaluation.json
- Licencia (LICENSE): https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-three-camera/blob/main/LICENSE
- Atribución y modificaciones (NOTICE): https://huggingface.co/orchestrallabs/pi05-yam-holesaw-15hz-three-camera/blob/main/NOTICE
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
