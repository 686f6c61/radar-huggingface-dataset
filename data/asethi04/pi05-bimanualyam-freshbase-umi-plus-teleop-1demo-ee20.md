# ASethi04/pi05-BimanualYAM-freshbase-umi-plus-teleop-1demo-ee20

## Resumen

Este modelo es un checkpoint de robótica basado en Pi0.5 (pi05), desarrollado por ASethi04 sobre la librería LeRobot de Hugging Face. Se trata de un fine-tuning del modelo base `lerobot/pi05_base` entrenado durante 12.000 pasos de optimizador sobre el dataset canónico UMI (`brandonyang/dual-lidar-umi-independent`) más exactamente una demostración completa de teleoperación. El objetivo es la manipulación bimanual: la tarea especificada es "recoger naranjas y colocarlas en el cuenco" (pick up oranges and place them in the bowl).

El modelo tiene 4.143.404.816 parámetros (~4,14 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 16,6 GB. Su relevancia radica en explorar el aprendizaje por imitación con un número mínimo de demostraciones (variante `1demo`), aunque la evaluación incluida es una reproducción de observaciones del conjunto de entrenamiento, no una validación en hardware real. La licencia no está disponible, lo que limita su uso comercial sin autorización explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (basada en transformer multimodal, detalles no disponibles) |
| Parametros totales | 4.143.404.816 (~4,14 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repositorio) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Pi0.5, una arquitectura de transformer multimodal diseñada para control robótico, aunque los detalles concretos de la arquitectura (número de capas, atención, etc.) no se especifican en la información disponible. El entrenamiento consistió en un fine-tuning del checkpoint base `lerobot/pi05_base` (revisión `b211f3d44c36b6acfcf7ae94a64e8e96f75a64ba`) sobre el dataset UMI canónico (`brandonyang/dual-lidar-umi-independent`, revisión `a95b079b2b3dc73a912ecd12967f22f825d04fa8`) más una única demostración de teleoperación completa. Se realizaron 12.000 pasos de optimizador.

La representación de acciones es H24 EE20 current-relative SE(3), con filas R6D (rotación en 6 dimensiones) y pinza futura absoluta. No se aplicó contracción de rotación ni historial de estados. El entrenamiento es de tipo aprendizaje por imitación (behavior cloning); no se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento.

## Capacidades

- Control robótico bimanual: el modelo predice acciones de efector final (EE) para dos brazos, con representación SE(3) relativa al estado actual.
- Aprendizaje por imitación: capaz de ejecutar tareas de manipulación aprendidas a partir de demostraciones teleoperadas.
- Predicción de acciones a 24 Hz (H24) con 20 grados de libertad del efector final (EE20).
- Manejo de pinza: incluye predicción de estado futuro absoluto de la pinza.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.
- No tiene capacidades de visión general: aunque el dataset UMI incluye datos de sensores (dual-lidar), el modelo está especializado en la tarea de manipulación concreta.

## Casos de uso

- Investigación en aprendizaje por imitación: permite estudiar el efecto de añadir una única demostración a un dataset canónico, útil para experimentos sobre eficiencia de datos en robótica.
- Manipulación bimanual en entornos de laboratorio: el modelo puede ejecutar tareas de recogida y colocación (pick and place) con dos brazos, como la tarea de naranjas en un cuenco, bajo supervisión de un operador.
- Evaluación de pipelines de teleoperación: sirve como referencia para comparar la calidad de diferentes configuraciones de teleoperación (variantes `umi95`, `umi100`, etc.) en el mismo entorno.
- Desarrollo de sistemas de control robótico con LeRobot: integrable en el ecosistema LeRobot para pruebas de inferencia y despliegue en simuladores o hardware real.
- Benchmarking de modelos de política visual-motora: permite comparar el rendimiento de Pi0.5 frente a otras arquitecturas en tareas bimanuales con datos limitados.
- Formación y docencia en robótica: útil como ejemplo práctico de fine-tuning de un modelo base de robótica con un dataset pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación incluida es una reproducción de observaciones del conjunto de entrenamiento (matched training-set observation replay), no una validación con datos no vistos ni una afirmación de éxito en hardware. Por tanto, no hay métricas cuantitativas (éxito en tarea, precisión, etc.) que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 B parámetros, en FP32 se necesitan ~16,5 GB; en BF16 ~8,3 GB; en int8 ~4,1 GB. El repositorio ocupa 16,6 GB, lo que sugiere pesos en FP32 o BF16.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (p. ej., RTX 4080, RTX 4090, A100 40 GB) para cargar el modelo completo en FP32. Para BF16 bastaría con 12 GB (p. ej., RTX 4070 Ti, RTX 3080).
- En consumer GPU: sí, es posible en GPUs de gama alta (RTX 3090/4090) con cuantización o BF16, aunque la inferencia en tiempo real para control robótico requeriría optimización adicional.
- Opciones de despliegue: al ser un modelo de LeRobot, se puede cargar con la librería `lerobot` de Hugging Face. No se mencionan vLLM, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El control robótico en tiempo real (24 Hz) exige latencias bajas, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El autor ha publicado otras variantes del mismo modelo (p. ej., `ASethi04/pi05-BimanualYAM-freshbase-raw-umi95-teleop05-ee20` y `ASethi04/pi05-BimanualYAM-freshbase-umi100-ee20-history-t1-t4`), que difieren en la cantidad de datos UMI y en el uso de historial de estados, pero no se han publicado métricas comparativas. Tampoco se dispone de datos de otros modelos de robótica similares (p. ej., OpenVLA, RT-2) en la información proporcionada. Por tanto, la comparativa se limita a señalar la existencia de estas variantes sin datos cuantitativos.

## Limitaciones y advertencias

- La evaluación es una reproducción de observaciones del conjunto de entrenamiento, no una validación con datos no vistos ni una prueba en hardware real. No se puede afirmar que el modelo generalice a entornos no vistos.
- El uso en hardware requiere una ruta de seguridad estándar EE-to-IK (efector final a cinemática inversa) y supervisión del operador. No es seguro desplegarlo sin estas medidas.
- Al estar entrenado con una sola demostración adicional, su capacidad de generalización es muy limitada; es un experimento de investigación, no un modelo listo para producción.
- La licencia no está disponible, lo que impide su uso comercial sin autorización explícita del autor.
- No hay información sobre sesgos o alucinaciones, al no ser un modelo de lenguaje; los riesgos se centran en errores de ejecución física (colisiones, agarres fallidos) que deben mitigarse con supervisión.
- Se recomienda fijar la revisión inmutable del Hub (`b211f3d44c36b6acfcf7ae94a64e8e96f75a64ba` para la base) en lugar de usar `main`, para garantizar reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-umi-plus-teleop-1demo-ee20
- Variante con datos UMI crudos: https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-raw-umi95-teleop05-ee20
- Variante con historial de estados: https://huggingface.co/ASethi04/pi05-BimanualYAM-freshbase-umi100-ee20-history-t1-t4
- Librería LeRobot (referencia): https://github.com/huggingface/lerobot
