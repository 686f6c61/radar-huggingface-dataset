# a1any0ung/pi05_yumi_cube_ac_base

## Resumen

`a1any0ung/pi05_yumi_cube_ac_base` es un checkpoint de política robótica publicado en HuggingFace por el usuario a1any0ung, basado en el modelo π₀.₅ (Pi05) de Physical Intelligence. Se trata de un modelo Visión-Lenguaje-Acción (VLA) orientado a control robótico de propósito general, implementado mediante la librería LeRobot de HuggingFace a partir del repositorio abierto OpenPI. El modelo resuelve el problema de la generalización en entornos abiertos: frente a políticas que solo funcionan en celdas controladas, π₀.₅ está diseñado para trasladar el comportamiento aprendido a situaciones y entornos no vistos durante el entrenamiento.

El checkpoint concreto cuenta con 4.143.404.816 parámetros (unos 4,14 mil millones, según los pesos en safetensors) y ocupa 9,4 GB en el repositorio. Está etiquetado como `pi05`, `lerobot` y `robotics`, y se ha entrenado o ajustado sobre el dataset `a1any0ung/yumi_cube_ac_processed`, cuyo nombre sugiere una tarea de manipulación de cubos, si bien la model card no documenta la composición exacta del dataset ni el robot empleado en la recogida de datos.

Su relevancia actual radica en que forma parte de la familia de modelos VLA abiertos que permiten a desarrolladores e investigadores entrenar y desplegar políticas de manipulación con un flujo de trabajo estandarizado (LeRobot, formato safetensors, licencia Apache 2.0). No obstante, al ser un repositorio con 0 descargas y 0 likes, se trata de un experimento/derivado personal más que de un artefacto de referencia consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en π₀.₅ de Physical Intelligence; implementación LeRobot adaptada de OpenPI |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (VLA con componente de lenguaje no documentado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Dataset de entrenamiento | a1any0ung/yumi_cube_ac_processed |
| Tamano del repositorio | 9,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como una política VLA de π₀.₅ (π₀.₅, Pi05) procedente de Physical Intelligence, con generalización en entornos abiertos. π₀.₅ se presenta en la model card como una evolución significativa de π₀, aunque no se detallan en el repositorio la arquitectura interna exacta (composición de la torre de visión, el backbone de lenguaje y el cabezal de acciones), el número de tokens de entrenamiento ni la composición del dataset más allá de la referencia a `a1any0ung/yumi_cube_ac_processed`.

Tampoco se documentan en la model card los detalles de entrenamiento (si hubo RLHF, DPO, imitación pura o combinación), ni innovaciones técnicas concretas como decodificación especulativa o mecanismos de atención específicos. Lo que sí se especifica es el flujo de trabajo: la política se entrena y se publica con LeRobot, con comandos `lerobot-train` (ajuste desde cero sobre un dataset) y `lerobot-record` (evaluación e inferencia). El ejemplo de evaluación del repositorio usa un robot `so100_follower`, mientras que el nombre del dataset apunta a una tarea tipo "yumi cube", lo que podría indicar una configuración robótica distinta o no coincidente con el ejemplo genérico de la plantilla.

## Capacidades

- Generación de acciones de control robótico a partir de entradas multimodales (visión + lenguaje + estado del robot), propio de un modelo VLA.
- Generalización a entornos y situaciones no vistos durante el entrenamiento, según la descripción de π₀.₅ (objetivo declarado de "open-world generalization").
- Ejecución de tareas de manipulación entrenadas sobre el dataset `yumi_cube_ac_processed` (el nombre sugiere manipulación de cubos).
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- Inferencia en dispositivo GPU mediante `lerobot-record` con un checkpoint local o del Hub.
- No se documentan en la model card capacidades de tool calling, function calling, agentes multi-paso, ni soporte multilingüe explícito.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Investización en políticas VLA: servir como punto de partida reproducible para experimentar con π₀.₅ sobre un dataset propio de manipulación, usando `lerobot-train` y los checkpoints publicados.
- Manipulación de objetos tipo cubo en laboratorio: el modelo está entrenado sobre el dataset `yumi_cube_ac_processed`, por lo que es adecuado para tareas de agarre y colocación de cubos en un banco de pruebas controlado.
- Evaluación de generalización en entornos abiertos: emplear el modelo para medir cuánto se degrada el rendimiento al cambiar iluminación, posición de cámara o disposición de objetos respecto al dataset de entrenamiento.
- Base para ajuste fino (fine-tuning): al estar bajo licencia Apache 2.0 y en formato safetensors, puede reentrenarse con `lerobot-train` sobre nuevos datasets sin restricciones de licencia para uso comercial.
- Despliegue en robots tipo LeRobot (`so100_follower` u otros compatibles): la model card incluye un ejemplo directo de inferencia con `lerobot-record` sobre un robot seguidor, lo que facilita la puesta en marcha en hardware asequible.
- Generación de datos sintéticos de acciones: usar la política para producir trayectorias candidatas que luego se filtran o se comparan con demostraciones humanas en un pipeline de aprendizaje por imitación.
- Reproducción de experimentos académicos: comparar este checkpoint concreto frente a otros derivados de π₀.₅/π₀ en la misma tarea para estudiar el efecto del dataset de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito de tarea, tasas de generalización ni comparaciones numéricas con π₀ u otros modelos VLA. El único enlace de referencia es la entrada de blog de Physical Intelligence sobre π₀.₅, que no aporta cifras en la información proporcionada.

## Requisitos de hardware

Estimaciones de VRAM para los pesos del modelo (4,14 mil millones de parámetros), sin contar activaciones ni memoria del codificador visual, que pueden aumentar el consumo en inferencia real:

- Precisión FP32: aproximadamente 16,6 GB solo en pesos.
- Precisión BF16/FP16: aproximadamente 8,3 GB solo en pesos.
- Cuantización INT8 (si se aplicase): aproximadamente 4,1 GB.
- Cuantización INT4 (si se aplicase): aproximadamente 2,1 GB.

Orientación de hardware:

- GPU de datacenter (A100 40/80 GB, H100): holgadas para inferencia y entrenamiento del modelo completo en BF16.
- GPU de consumo de gama alta (RTX 4090 24 GB, RTX 3090 24 GB): suficientes para inferencia en FP16/BF16 con margen para activaciones.
- GPU de consumo de gama media (RTX 4080 16 GB, RTX 4070 Ti 12 GB): viables en FP16 con gestión cuidadosa de memoria; en 12 GB puede requerir cuantización o reducir tamaño de lote.
- GPU con 8 GB o menos: probablemente inviable en FP16 sin cuantización.

Opciones de despliegue:

- LeRobot: `lerobot-train` para entrenamiento y `lerobot-record` para inferencia/evaluación, tal y como documenta la model card.
- OpenPI: repositorio de referencia de Physical Intelligence del que se adapta la implementación.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM de texto, no a políticas VLA con salida de acciones).

Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| a1any0ung/pi05_yumi_cube_ac_base | ~4,14 mil millones | no disponible | apache-2.0 | Derivado de π₀.₅ ajustado sobre `yumi_cube_ac_processed`; 0 descargas |
| π₀ (Pi0) | no disponible | no disponible | no disponible | Predecesor directo de π₀.₅, citado en la model card como base evolutiva |
| Otros VLA abiertos (OpenVLA, GR00T, etc.) | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de datos numéricos (éxito de tarea, contexto, parámetros de alternativas) en la información proporcionada, por lo que la comparación cuantitativa queda pendiente.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. La model card no documenta análisis de sesgos, y el modelo opera en el dominio robótico con datos de un único dataset.
- Riesgo de alucinación: aplicable en el componente de lenguaje del VLA; no se documenta mitigación específica. En robótica, el equivalente es la ejecución de acciones incorrectas o inseguras ante entradas fuera de distribución.
- Limitaciones de contexto e idioma: no disponible. No se especifica la ventana de contexto ni los idiomas cubiertos por el componente de lenguaje.
- Especialización de dominio: entrenado sobre `a1any0ung/yumi_cube_ac_processed`; es probable que su rendimiento fuera de esa tarea y ese tipo de robot se degrade, pese a la pretensión de generalización de π₀.₅.
- Documentación escasa: la model card no detalla composición del dataset, hiperparámetros, hardware de recogida de datos ni métricas. El ejemplo de evaluación usa `so100_follower`, lo que puede no coincidir con el robot real del dataset.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar la licencia del modelo π₀.₅ original de Physical Intelligence y la del dataset empleado antes de un despliegue en producción.
- Madurez: 0 descargas y 0 likes; no hay evidencia de uso en producción ni validación por terceros.
- Seguridad física: cualquier despliegue en un robot real exige límites de par, paradas de emergencia y validación en entorno controlado, dado el riesgo de acciones erróneas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/a1any0ung/pi05_yumi_cube_ac_base
- Dataset asociado: https://huggingface.co/datasets/a1any0ung/yumi_cube_ac_processed
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI (Physical Intelligence): no disponible en la información proporcionada
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
